<template>
    <div class="rich-text-email-form material-form">
        <div class="content-view">
            <crumbs :crumbs="crumbs"></crumbs>
        </div>
        <div class="page-head">
            <div class="content-view">
                <button type="button" class="pull-right preview-btn btn btn-md btn-orange"
                        :disabled="$has('journey_material_preview_material')" @click="preview">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                    {{'material.preview' | t}}
                </button>
                <label for="name">{{'material.headfootName' | t}}</label>
                &nbsp;
                <input type="text" id="name" class="input xl" v-model.trim="material.name" maxlength="100">
                <div class="type-text">
                    {{'journeyList.type' | t}}：
                    <span>{{material.type == 1 ? $t('material.type.emailHeader') : $t('material.type.emailFooter')}}</span>
                </div>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view editor-area">
                <inline-loading v-if="!editor"/>
                <textarea id="emailEditor" name="emailEditor" :value="material.content"
                          style="visibility: hidden; font-size: 12px"></textarea>
            </div>
        </div>
        <div class="form-panel">
            <input type="button" class="cancel-btn" :value="$t('common.cancel')" @click="cancel">
            <input type="button" class="confirm-btn btn btn-orange" :value="$t('material.done')" :disabled="disabled"
                   @click="confirm">
            <input type="button" class="confirm-btn btn" :value="$t('material.previous')" @click="previousStep"
                   v-if="!id">
        </div>
        <template v-show="false">
            <iframe id="emailHtml"
                    name="emailHtml"
                    ref="emailFrame"></iframe>
        </template>
        <!--是否保存短链-->
        <modal class="title-modal" :title="$t('material.tips')" size="no" v-if="showTipsModal" @close="showTipsModal=false">
            <div>
                <p class="tips">{{'material.shortLinkTips' | t}}</p>
            </div>
            <div slot="buttons">
                <button class="btn btn-white" @click="hiddenTipsModal">{{'common.cancel' | t}}</button>
                <button class="btn btn-contact" @click="isSaveShorturl">{{'common.confirm' | t}}</button>
            </div>
        </modal>
    </div>
</template>
<script type="text/ecmascript-6">
    import { ContactApiV1, JourneyApiV1, JourneyMaterialApiV1, EmailHeadFootGroupV1, EmailHeadFootV1 } from '@/api';
    import $ from 'jquery';
    import EmojiRegex from 'emoji-regex';

    const CKEDITOR = window.CKEDITOR;

    export default {
        data() {
            return {
                groupList: [],
                id: '',
                material: {
                    content: this.$t('material.loading'),
                    groupId: 1,
                    name: '',
                    type: 1 // 1 for head,2 for foot
                },
                materialSaving: false,
                editor: null,
                editorSourceMode: false,
                disabled: true,
                emailAddress: '',
                echoQuery: {},
                showTipsModal:false,//是否保存短链提示框
                shortUrlArray: []//需要替换的url
            };
        },
        computed: {
            crumbs() {
                return [
                    {name: 'index', text: 'Dmartech'},
                    {name: 'materialStore', text: this.$t('material.contentManagement')},
                    Object.assign({}, this.$route, {text: this.$t(this.$route.meta.name)})
                ];
            },
        },
        async mounted() {
            if (this.$route.params.echoQuery) {
                this.echoQuery = this.$route.params.echoQuery;
            }
            let id = this.$route.query.id;
            this.material.groupId = this.$route.query.groupId ? this.$route.query.groupId : 1;
            this.material.type = this.$route.query.type ? this.$route.query.type : 1;

            // 获取自定义字段, 初始化编辑器
            await ContactApiV1
                .getFields()
                .then(({body: {data: {fieldList}}}) => {
                    // share data for OLD CKEDITOR
                    top._fields = fieldList;
                });
            // 填充编辑器内容
            // 编辑
            if (id) {
                this.id = id;
                EmailHeadFootV1
                    .getHeaderFooter(id)
                    .then(({body: {data: {emailHeadFoot}}}) => {
                        this.material.content = emailHeadFoot.content;
                        this.material.name = emailHeadFoot.name;
                        this.material.type = emailHeadFoot.type;
                        this.initEditor();
                    })
                    .catch(err => {
                        console.error(err);
                        this.materialSaving = false;
                    });
            } else {
                let file = this.$route.params.file;
                file = file || localStorage.getItem('file');
                if (file) {
                    // 上传新建
                    JourneyMaterialApiV1
                        .getZIPContent(file)
                        .then(({body: {data: {materialContent}}}) => {
                            this.material.content = materialContent;
                            this.initEditor();
                        });
                } else {
                    // 粘贴新建
                    this.material.content = '';
                    this.editorSourceMode = true;
                    this.initEditor();
                }
            }
        },
        beforeRouteLeave(to, from, next) {
            if (this.editor) this.editor.destroy();
            next();
        },
        methods: {
            getGroupListRequest() {
                EmailHeadFootGroupV1
                    .getHeaderFooterGroupList()
                    .then((res) => {
                        this.groupList = res.body.data.emailHeadFootGroupList;
                    });
            },
            initEditor() {
                this.$nextTick(() => {
                    // CKEDITOR.env.needsBrFiller = false;
                    this.editor = CKEDITOR.replace('emailEditor', {
                        fillEmptyBlocks: false,
                        height: $('#emailEditor').parent()
                            .height() - 75
                    });
                    // 点击确定会触发此事件， 要以整理的为准
                    // this.editor.on('blur', () => {
                    //     this.material.content = this.editor.getData();
                    // });
                    this.editor.once('instanceReady', () => {
                        this.disabled = false;
                        const tdEls = this.editor.document.find('td');
                        Array.from(tdEls.$).forEach(el => {
                            if (el && !el.children.length) {
                                const regexp = /\s{0,1}height="(\d+)"/;
                                const elH = regexp.exec(el.outerHTML);
                                if (elH && elH.length) {
                                    const h = elH[1];
                                    el.style.lineHeight = h + 'px';
                                }
                            }
                        });
                        // enter source code mode if creating by pasting source code.
                        if (this.editorSourceMode) {
                            this.enterSourceMode();
                        }
                    });
                });
            },
            // 预览素材
            preview() {
                this.material.content = this.editor.getData();
                const previewMaterial = Object.assign({}, this.material, {isHF: true});
                this.$preview({material: previewMaterial});
            },
            enterSourceMode() {
                $('.cke_toolbox [title="源码"]').click();
            },
            cancel() {
                if (this.$route.params.echoQuery) {
                    this.$router.push({
                        name: 'headerfooterEmail',
                        query: this.echoQuery
                    });
                } else {
                    this.$router.push({
                        name: 'headerfooterEmail',
                        query:{
                            groupId: this.$route.query.groupId,
                            pageNumber:this.$route.query.pageNumber,
                            type:this.$route.query.type,
                        }
                    });
                }
            },
            previousStep() {
                this.$router.go(-1);
            },
            // 要提交的素材内容
            lastMaterialContent() {
                const parser = new DOMParser();
                let newHtmlCode = parser.parseFromString(this.editor.getData(), 'text/html');
                const firstDiv = newHtmlCode.querySelector('div');
                const body = newHtmlCode.querySelector('body');
                const bodyChild = body.childNodes;
                let templateChild = [];
                if (this.editor.getData().match('data-ishf')) {
                    firstDiv.setAttribute('data-ishf', this.material.type);
                } else {
                    const dataIshf = this.createADataIshf();
                    if (bodyChild.length > 1) {
                        for (let i = 0; i < bodyChild.length; i++) {
                            // 直接 appendChild是移动
                            templateChild.push(bodyChild[i]);
                        }
                        templateChild.forEach(node => {
                            dataIshf.appendChild(node);
                        });
                    } else {
                        dataIshf.appendChild(bodyChild[0]);
                    }
                    body.innerHTML = '';
                    body.appendChild(dataIshf);
                }
                this.material.content = body.innerHTML;
                this.done();
            },
            confirm() {
                this.lastMaterialContent();
            },
            async done() {
                if (this.material.name === '') {
                    this.$toast(this.$t('material.emailNoEmpty'), 'warn');
                    return false;
                }
                if (this.materialSaving) return false;
                this.materialSaving = true;
                // 邮件内容不能包含 emoji
                const emojiRegex = EmojiRegex();
                if (emojiRegex.test(this.material.content)) {
                    this.materialSaving = false;
                    return this.$toast(this.$t('material.notSupportEmoji'), 'warn');
                }

                // 邮件内容中不能包含发件地址所在域名
                await JourneyApiV1
                    .getAddress(1)
                    .then((res) => {
                        const data = res.body.data;
                        if (data.addressList.length <= 0) {
                            this.emailAddress = '';
                            return;
                        }
                        // http://jira.qdum.com/browse/DMARTECH-6177
                        let generalList = data.addressList.filter(addr => addr.type === 0);
                        if (generalList.length <= 0) {
                            this.emailAddress = '';
                            return;
                        }
                        const address = generalList[0].sendAddress;
                        const index = address.indexOf('@');
                        this.emailAddress = address.substring(index + 1);
                    });

                let content = document.createElement('div');
                content.innerHTML = this.material.content;
                let aArray = content.getElementsByTagName('a');
                let isTopLevel = true; //是否顶级域名
                let isAllShortUrl = true;//是否都是转换后的短链
                const forbiddenDomain = this.emailAddress
                    .replace(/\/$/, '')
                    .split('.')
                    .join('\\.');
                const regexp = new RegExp(`[a-zA-Z0-9.-_]*${forbiddenDomain}`);
                for (let a of aArray) {
                    if (a.href.indexOf('https://') > -1 || a.href.indexOf('http://') > -1){
                        let link = a.href.split('://')[1];
                        if (regexp.test(link.substring(0,link.length - 1))) isTopLevel = false;
                        if (a.href.indexOf('wpmx.cn') === -1) isAllShortUrl = false;
                    }
                }
                if (this.emailAddress !== '' && !isTopLevel && !isAllShortUrl) {
                    this.showTipsModal = true;
                    return false;
                }
                this.saveAjax();
            },
            //保存接口
            saveAjax () {
                for (let i = 0; i < this.shortUrlArray.length;i++){
                    this.material.content = this.material.content.replace(
                        this.shortUrlArray[i].beReplaced,this.shortUrlArray[i].replace);
                }
                const saver = this.id
                    ? EmailHeadFootV1.editHeaderFooter(this.id, this.material)
                    : EmailHeadFootV1.createHeaderFooter(this.material);
                saver
                    .then(() => {
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                        this.$router.push({
                            name: 'headerfooterEmail',
                            query: this.echoQuery
                        });
                    })
                    .catch(() => {
                        setTimeout(()=>{
                            this.materialSaving = false;
                            //this.$router.push({name: 'headerfooterEmail',query: this.echoQuery});
                        },2000);
                    });
            },
            //隐藏转换短链的窗口
            hiddenTipsModal() {
                this.materialSaving = false;
                this.showTipsModal = false;
            },
            //是否保存短链
            isSaveShorturl () {
                let content = document.createElement('div');
                content.innerHTML = this.editor.getData();
                let aArray = content.getElementsByTagName('a');
                this.shortUrlArray = [];//需要替换的url
                const forbiddenDomain = this.emailAddress
                    .replace(/\/$/, '')
                    .split('.')
                    .join('\\.');
                const regexp = new RegExp(`[a-zA-Z0-9.-_]*${forbiddenDomain}`);
                let urlArarry = [];
                for (let i = 0; i < aArray.length; i++){
                    if (regexp.test(aArray[i].href) && aArray[i].href.indexOf('wpmx.cn') === -1) {
                        urlArarry.push(aArray[i].href);
                    }
                }

                for (let i = 0; i < urlArarry.length; i++) {
                    //转换短链的请求
                    JourneyMaterialApiV1.getShortUrl(urlArarry[i])
                        .then(({ body }) => {
                            this.showTipsModal = false;
                            if (body.code === 200) {
                                let shortUrl = body.data.url;
                                if (urlArarry[i].substring(urlArarry[i].length - 1,urlArarry[i].length) === '/'){
                                    urlArarry[i] = urlArarry[i].substring(0,urlArarry[i].length - 1);
                                }
                                this.shortUrlArray.push({'beReplaced':urlArarry[i],'replace':shortUrl});
                                if (i >= (urlArarry.length - 1)) this.saveAjax();
                            } else {
                                this.$toast(body.message);
                            }
                        })
                        .catch((err) => {
                            this.showTipsModal = false;
                            this.$toast(err.message);
                        });
                }
            },
            createADataIshf() {
                const Div = document.createElement('div');
                Div.setAttribute('data-ishf', this.material.type);
                return Div;
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    @import "./material-form";

    .rich-text-email-form {
        .editor-area {
            margin-top: 24px;
            margin-bottom: 50px + 24px;
            height: calc(100% - #{24px * 2 + 50px});
        }
        .page-head{
            .type-text{
                display: inline-block;
                margin-left: 15px;
            }

            .btn-orange[disabled] {
                svg {
                    fill: rgba(white, .6);
                    background-color: $disabled;
                }
            }
        }
        .title-modal{
            .modal {
                width: 90%;
                max-width: 600px;
                .modal-content{
                    p{
                        float: left;
                        display: inline-block;
                        width: 15%;
                        line-height: 24px;
                    }
                    .tips{
                        width: 100%;
                    }
                    input{
                        width: 80%;
                        border: 1px solid #999999;
                        height: 20px;
                    }
                }
                .modal-panel{
                    button {
                        width: 95px;
                        height: 32px;
                        line-height: 32px;
                    }
                    .btn-contact {
                        background: #fb6f40;
                        color: #fff;
                    }
                }
            }
        }
    }
</style>
