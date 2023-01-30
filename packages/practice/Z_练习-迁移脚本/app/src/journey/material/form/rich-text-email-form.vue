<template>
    <div class="rich-text-email-form material-form">
        <div class="content-view">
            <crumbs :crumbs="crumbs"></crumbs>
        </div>
        <div class="page-head">
            <div class="content-view">
                <button :disabled="$has('journey_material_preview_material')"
                        type="button" class="pull-right preview-btn btn btn-md btn-orange"
                        @click="preview">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                    {{'material.preview' | t}}
                </button>
                <button type="button" class="pull-right addHF-btn btn btn-md btn-orange"
                        @click="openHFModal">
                    {{'material.headorfoot' | t}}
                </button>
                <label for="name">{{'material.contactName' | t}}&nbsp;</label>
                &nbsp;
                <input type="text" id="name" class="input xl" v-model.trim="material.materialName" maxlength="100">
                <!--华为cdp添加素材标签-->
                <material-label v-if="isHw && requestDone" :expanded="expanded" :error="error"
                                v-model="contentLabels" :allTags="allTags" @input="fetchCdpLabels"
                                @getOthersTopicTags="getOthersTopicTags"></material-label>
            </div>
        </div>
        <!--华为cdp标签展开收起-->
        <button type="button" class="btn btn-sm btn-theme btn-label" v-if="isHw && requestDone"
                @click="toggle">
            <svg class="nav-link-group-arrow" aria-hidden="true" :class="{expanded}">
                <use xlink:href="#icon-arrow-down"></use>
            </svg>
        </button>
        <div class="page-content">
            <div class="content-view editor-area">
                <inline-loading v-if="!editor"/>
                <textarea id="emailEditor" name="emailEditor" :value="material.materialContent"
                          style="visibility: hidden; font-size: 12px"></textarea>
            </div>
        </div>
        <div class="form-panel">
            <input type="button" class="cancel-btn" :value="$t('common.cancel')" @click="cancel">
            <template v-if="!material.id"> {{'material.selectEmail' | t}}{{'material.setup' | t}}&nbsp;&gt;&nbsp;
                <span class="step">{{'material.design' | t}}</span></template>
            <input type="button" class="confirm-btn btn btn-orange" :value="$t('material.done')" :disabled="disabled"
                   @click="confirm">
            <input type="button" class="confirm-btn btn" :value="$t('material.previous')" @click="previousStep"
                   v-if="!material.id">
        </div>

        <!--添加头尾部模板-->
        <modal :title="$t('material.addheadfoot')" @close="closeHFModal" v-if="addHFopen">
            <div class="form-field">
                <label class="label">{{'material.type.emailHeader'| t}}</label>
                <selector class="xl" v-model="headID" :options="header.headerList"
                          search="async" @search="searchList($event,1)" @load="loadList(1)" @hide="hideList(1)"/>
            </div>
            <div class="form-field">
                <label class="label">{{'material.type.emailFooter'| t}}</label>
                <selector class="xl" v-model="footID" :options="footer.footerList"
                          search="async" @search="searchList($event,2)" @load="loadList(2)" @hide="hideList(2)"/>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme" @click="HFconfirm"
                       :value="$t('common.confirm')"/>
            </template>
        </modal>
        <template>
            <div class="save-loading" v-if="materialSaving">
                <inline-loading/>
            </div>
        </template>
        <!--邮件code内容挂载到页面，用于添加/替换头尾模板code-->
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
                <button class="btn btn-white" @click="showTipsModal=false">{{'common.cancel' | t}}</button>
                <button class="btn btn-contact" @click="isSaveShorturl">{{'common.confirm' | t}}</button>
            </div>
        </modal>
    </div>
</template>
<script type="text/ecmascript-6">
    import { ContactApiV1, JourneyApiV1, JourneyMaterialApiV1, JourneyMaterialApiV3, EmailHeadFootV1 } from '@/api';
    import $ from 'jquery';
    import debounce from 'lodash/debounce';
    import EmojiRegex from 'emoji-regex';
    import MaterialLabel from '../common/material-label.vue';
    import { mapState } from 'vuex';

    const CKEDITOR = window.CKEDITOR;
    const EMAIL_FRAME = /(?:<!DOCTYPE[\s\S]*>\s*)?<html[\s\S]*body[^>]*>(.*)<\/body><\/html>$/i;

    export default {
        components: {
            MaterialLabel,
        },
        data() {
            return {
                groupList: [],
                material: {
                    groupId: 1,
                    materialContent: this.$t('material.loading'),
                    materialName: '',
                    id: '',
                    type: 1, // stands for email, while 0 for sms
                    headId: 0,
                    footId: 0
                },
                materialSaving: false,
                editor: null,
                editorSourceMode: false,
                disabled: true,
                emailAddress: '',
                addHFopen: false,
                headID: 0,
                footID: 0,
                header: {
                    headID: '',
                    headTemplate: '',
                    headerList: [
                        {
                            id: 0, name: this.$t('common.selectHolder')
                        }
                    ],
                },
                footer: {
                    footID: '',
                    footTemplate: '',
                    footerList: [
                        {
                            id: 0, name: this.$t('common.selectHolder')
                        }
                    ],
                },
                echoQuery: {},
                headSearchName: '',
                footSearchName: '',
                headNumber: 1,
                footNumber: 1,
                headTotalPage: 0,
                footTotalPage: 0,
                expanded: true, // 华为cdp标签展开收起
                contentLabels: [], // 内容标签,
                requestDone: false,  // 控制素材标签选择器展示时机
                error: {
                    program: '', // program为空
                    content: '', // content为空
                    campaign: '', // campaign为空
                    language: '', // language为空
                },
                allTags: [],
                othersTopicTags: [],
                showTipsModal:false,//是否保存短链提示框
                shortUrlArray: [],//需要替换的url
                domainNameRegexp: '' //二级域名判断的正则表达式
            };
        },
        computed: {
            ...mapState({
                // 华为账号
                isHw: state => state.user.companyType === 1
            }),
            crumbs() {
                return [
                    {name: 'index', text: 'Dmartech'},
                    {name: 'materialStore', text: this.$t('material.contentManagement')},
                    Object.assign({}, this.$route, {text: this.$t(this.$route.meta.name)})
                ];
            },
            groupId() {
                return this.$route.query.groupId;
            },
            groupSource() {
                return this.$route.query.groupSource;
            },
        },
        async mounted() {
            if (this.$route.params.echoQuery) {
                this.echoQuery = this.$route.params.echoQuery;
            }
            // 设置素材的groupId
            this.material.groupId = this.groupId;
            this.headID = this.$route.query.headId || 0;
            this.footID = this.$route.query.footId || 0;

            let id = this.$route.query.id;
            // 获取自定义字段, 初始化编辑器
            await ContactApiV1
                .getFields()
                .then(({body: {data: {fieldList}}}) => {
                    // share data for OLD CKEDITOR
                    top._fields = fieldList;
                });
            // 填充编辑器内容
            // 1. 编辑
            if (id) {
                this.material.id = id; // 立刻设置id

                // 华为cdp标签
                if (this.isHw) {
                    this.getMaterialTags(id);
                    this.getAllMaterialTags(id);
                }
                JourneyMaterialApiV1
                    .getMaterial(id)
                    .then(({body: {data: {material}}}) => {
                        this.$set(this.$data, 'material', Object.assign({}, material, {type: 1, id}));
                        this.setIframeHtml(material.materialContent);
                        if (material.materialContent === '<html><head></head><body></body></html>') {
                            this.initEditor();
                        } else {
                            let initHtml = setInterval(() => {
                                if ($(window.frames['emailHtml'].document)[0].documentElement.outerHTML !== '<html><head></head><body></body></html>') {
                                    this.initEmailHtml();
                                    clearInterval(initHtml);
                                }
                            }, 100);
                        }
                    });
            } else {
                let file = this.$route.params.file;
                file = file || localStorage.getItem('file');
                if (file) {
                    // 2.1 上传新建
                    JourneyMaterialApiV1
                        .getZIPContent(file)
                        .then(({body: {data: {materialContent}}}) => {
                            const validHTML = materialContent.match(EMAIL_FRAME)
                                ? materialContent
                                : '<html><body>' + materialContent + '</body></html>';

                            this.setIframeHtml(validHTML);
                            if (validHTML === '<html><head></head><body></body></html>' || !materialContent) {
                                this.material.materialContent = '';
                                this.initEditor();
                            } else {
                                let initHtml = setInterval(() => {
                                    if ($(window.frames['emailHtml'].document)[0].documentElement.outerHTML !== '<html><head></head><body></body></html>') {
                                        this.initEmailHtml();
                                        clearInterval(initHtml);
                                    }
                                }, 100);
                            }
                        });
                } else {
                    // 2.2 粘贴新建
                    this.material.materialContent = '';
                    // enter source code mode if creating by pasting source code.
                    this.editorSourceMode = true;
                    this.initEditor();
                }

                // 素材新建直接展示标签选择器
                this.requestDone = true;
            }

            this.getHeadFootListRequest(1, 'init');
            this.getHeadFootListRequest(2, 'init');
        },
        beforeRouteLeave(to, from, next) {
            if (this.editor) this.editor.destroy();
            next();
        },
        methods: {
            // 获取头尾模板列表
            getHeadFootListRequest(type, mode) {
                EmailHeadFootV1
                    .getHeaderFooterList({
                        type: type,
                        name: type === 1 ? this.headSearchName : this.footSearchName,
                        pageNumber: type === 1 ? this.headNumber : this.footNumber
                    })
                    .then(({body: {data}}) => {
                        let headID = this.$route.query.headId || 0;
                        let footID = this.$route.query.footId || 0;

                        if (type === 1) {
                            this.header.headerList = this.header.headerList.concat(data.emailHeadFootList);
                            this.headTotalPage = data.totalPage;
                            if (mode === 'init') {
                                if (this.header.headerList.map(list => list.id)
                                    .includes(~~headID)) {
                                    this.headID = ~~headID;
                                } else {
                                    this.loadList(1, 'init');
                                }
                            }
                        } else {
                            this.footer.footerList = this.footer.footerList.concat(data.emailHeadFootList);
                            this.footTotalPage = data.totalPage;
                            if (mode === 'init') {
                                if (this.footer.footerList.map(list => list.id)
                                    .includes(~~footID)) {
                                    this.footID = ~~footID;
                                } else {
                                    this.loadList(2, 'init');
                                }
                            }
                        }
                    });
            },
            searchList(name, type) {
                if (type === 1) {
                    this.headNumber = 1;
                    this.header.headerList = [];
                    this.headSearchName = name;
                    this.getHeadFootListRequest(1);
                }
                if (type === 2) {
                    this.footNumber = 1;
                    this.footer.footerList = [];
                    this.footSearchName = name;
                    this.getHeadFootListRequest(2);
                }
            },
            // mode: 执行类型，'load'下拉触发， 'init', 初始化回显头尾轮询
            loadList: debounce(function (type, mode = 'load') {
                if (type === 1 && this.headTotalPage > this.headNumber && this.header.headerList.length > 0) {
                    this.headNumber++;
                    this.getHeadFootListRequest(1, mode);
                }
                if (type === 2 && this.footTotalPage > this.footNumber && this.footer.footerList.length > 0) {
                    this.footNumber++;
                    this.getHeadFootListRequest(2, mode);
                }
            }, 300),
            hideList(type) {
                if (type === 1 && this.headSearchName.trim()) {
                    this.headSearchName = '';
                    this.headNumber = 1;
                    this.header.headerList = [];
                    this.getHeadFootListRequest(1);
                }
                if (type === 2 && this.footSearchName.trim()) {
                    this.footSearchName = '';
                    this.footNumber = 1;
                    this.footer.footerList = [];
                    this.getHeadFootListRequest(2);
                }
            },
            // 获取头尾模板
            getHeadFootRequest(id, type) {
                this.materialSaving = true;
                if (id) {
                    EmailHeadFootV1
                        .getHeaderFooter(id)
                        .then(({body: {data: {emailHeadFoot}}}) => {
                            type === 1 ?
                                this.header.headTemplate = emailHeadFoot.content :
                                this.footer.footTemplate = emailHeadFoot.content;
                            this.materialSaving = false;
                        })
                        .catch(err => {
                            console.error(err);
                            this.materialSaving = false;
                        });
                } else {
                    // 清空头尾模板
                    this.materialSaving = false;
                    if (type === 1) {
                        this.header.headTemplate = '';
                        return;
                    }
                    this.footer.footTemplate = '';
                }
            },
            getGroupListRequest() {
                JourneyMaterialApiV3
                    .getGroupList()
                    .then((res) => {
                        this.groupList = res.body.data.groupList;
                    });
            },
            initEditor() {
                this.$nextTick(() => {
                    // CKEDITOR.env.needsBrFiller = false;
                    this.editor = CKEDITOR.replace('emailEditor', {
                        fillEmptyBlocks: false,
                        height: $('#emailEditor')
                            .parent()
                            .height() - 75
                    });
                    //this.editor.on('blur', () => {
                    //    this.material.materialContent = this.editor.getData();
                    //});
                    this.editor.once('instanceReady', () => {
                        this.disabled = false;
                        const tdEls = this.editor.document.find('td');
                        Array.from(tdEls.$)
                            .forEach(el => {
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
            enterSourceMode() {
                $('.cke_toolbox [title="源码"]')
                    .click();
            },
            cancel() {
                if (this.$route.params.echoQuery) {
                    this.$router.push({
                        name: 'materialStore',
                        query: this.echoQuery
                    });
                } else {
                    this.$router.push({name: 'materialStore', query: {tab: this.$route.query.tab}});
                }
            },
            previousStep() {
                if (this.groupSource === 'create') {
                    JourneyMaterialApiV3
                        .getGroupList()
                        .then((res) => {
                            this.groupList = res.body.data.groupList;
                            let group = this.groupList.filter(g => g.id === this.material.groupId)[0];
                            if (group.default !== 1 && group.count === 0) {
                                JourneyMaterialApiV3.deleteGroup({groupId: group.id})
                                    .then(() => {
                                        this.getGroupListRequest();
                                        this.$router.go(-1);
                                    });
                            }
                        });
                } else {
                    this.$router.go(-1);
                }
            },
            preview() {
                this.lastMaterialContent('preview');
            },
            openPreview() {
                let html = $(window.frames['emailHtml'].document)[0].documentElement.outerHTML;
                let lastMaterialContent = html.replace('<input id="isouterhtmlchanged" type="hidden">', '');
                this.material.materialContent = lastMaterialContent;

                // 华为cdp标签
                if (this.isHw) {
                    if (!this.validCdpTag()) {
                        this.expanded = true;
                        return;
                    }
                    let allTags = [];
                    allTags = this.contentLabels;
                    if (this.othersTopicTags.length) {
                        this.othersTopicTags.forEach(elm => {
                            elm.topName = 'Topic tag';
                        });
                        allTags = this.contentLabels.concat(this.othersTopicTags);
                    }
                    this.$preview({
                        material: this.material,
                        validCdp: this.validCdpTag(),
                        labelList: allTags,
                    });
                    return;
                }
                this.$preview({
                    material: this.material,
                });
                this.setIframeHtml('');
            },
            // 打开头尾模板选择弹窗
            openHFModal() {
                this.addHFopen = true;
            },
            // 关闭头尾模板选择弹窗
            closeHFModal() {
                this.addHFopen = false;
                // 选择未点确定
                if (this.headID !== this.material.headId) this.headID = ~~this.$route.query.headId;
                if (this.footID !== this.material.footId) this.footID = ~~this.$route.query.footId;
            },
            // 选择头尾模板
            HFconfirm() {
                this.material.headId = this.headID;
                this.material.footId = this.footID;
                this.closeHFModal();
                this.getHeadFootRequest(this.headID, 1);
                this.getHeadFootRequest(this.footID, 2);
            },
            // 初始化emailHtml内容
            initEmailHtml() {
                this.materialSaving = true;
                if (this.headID) {
                    this.header.headTemplate = $(window.frames['emailHtml'].document)
                        .find('div[data-ishf=\'1\']')
                        .prop('outerHTML');
                    $(window.frames['emailHtml'].document)
                        .find('div[data-ishf=\'1\']')
                        .remove();
                }
                if (this.footID) {
                    this.footer.footTemplate = $(window.frames['emailHtml'].document)
                        .find('div[data-ishf=\'2\']')
                        .prop('outerHTML');
                    $(window.frames['emailHtml'].document)
                        .find('div[data-ishf=\'2\']')
                        .remove();
                }
                this.material.materialContent = $(window.frames['emailHtml'].document)[0].documentElement.outerHTML;
                this.materialSaving = false;
                this.initEditor();
            },
            // 要提交的素材内容(materialContent)
            lastMaterialContent(type) {
                let html = this.editor.getData();
                html += '<input id="isouterhtmlchanged" type="hidden" />';
                this.setIframeHtml(html);
                let t = setInterval(() => {
                    if (
                        $(window.frames['emailHtml'].document)[0].documentElement &&
                        $(window.frames['emailHtml'].document)[0].documentElement.outerHTML.indexOf('<input id="isouterhtmlchanged" type="hidden">') !== -1
                    ) {
                        clearInterval(t);
                        let hContent = this.header.headTemplate;
                        let fContent = this.footer.footTemplate;
                        $(window.frames['emailHtml'].document)
                            .find('div[data-ishf=\'1\']')
                            .remove();
                        $(window.frames['emailHtml'].document)
                            .find('div[data-ishf=\'2\']')
                            .remove();
                        if (hContent) {
                            $(window.frames['emailHtml'].document)
                                .find('body')
                                .prepend(hContent);
                        }
                        if (fContent) {
                            $(window.frames['emailHtml'].document)
                                .find('body')
                                .append(fContent);
                        }
                        this.material.headId = this.headID;
                        this.material.footId = this.footID;

                        //所有链接添加追踪参数
                        if (this.isHw) {
                            for (let i = 0; i < $($('#emailHtml')
                                .prop('contentWindow').document)
                                .find('a').length; i++) {
                                let link = $($('#emailHtml')
                                    .prop('contentWindow').document)
                                    .find('a')
                                    .eq(i)
                                    .attr('href');
                                if (link && link.trim() !== '') {
                                    if (link.indexOf('http://') >= 0 || link.indexOf('https://') >= 0) {
                                        let akiPre = link.indexOf('?') !== -1 ? '&' : '?';
                                        let akiAft = link.indexOf('access_key_id={$accesskeyid}') !== -1 ? '' : 'access_key_id={$accesskeyid}';
                                        let aki = akiAft.length ? akiPre + akiAft : '';
                                        $($('#emailHtml')
                                            .prop('contentWindow').document)
                                            .find('a')
                                            .eq(i)
                                            .attr('href', link + aki);
                                    }
                                }
                            }
                            for (let i = 0; i < $($('#emailHtml')
                                .prop('contentWindow').document)
                                .find('area').length; i++) {
                                let link = $($('#emailHtml')
                                    .prop('contentWindow').document)
                                    .find('area')
                                    .eq(i)
                                    .attr('href');
                                if (link && link.trim() !== '') {
                                    if (link.indexOf('http://') >= 0 || link.indexOf('https://') >= 0) {
                                        let akiPre = link.indexOf('?') !== -1 ? '&' : '?';
                                        let akiAft = link.indexOf('access_key_id={$accesskeyid}') !== -1 ? '' : 'access_key_id={$accesskeyid}';
                                        let aki = akiAft.length ? akiPre + akiAft : '';
                                        $($('#emailHtml')
                                            .prop('contentWindow').document)
                                            .find('area')
                                            .eq(i)
                                            .attr('href', link + aki);
                                    }
                                }
                            }
                        }
                        if (type === 'preview') this.openPreview();
                        if (type === 'confirm') this.done();
                    }
                }, 1);
            },
            confirm() {
                this.lastMaterialContent('confirm');
            },
            // cdp必选标签为空拦截
            validCdpTag() {
                let program = this.contentLabels.filter(elm => elm.topName === 'Program')[0];
                let content = this.contentLabels.filter(elm => elm.topName === 'Content')[0];
                let campaign = this.contentLabels.filter(elm => elm.topName === 'Campaign')[0];
                let language = this.contentLabels.filter(elm => elm.topName === 'Language')[0];
                if (!program || program.id === 0) {
                    this.error.program = this.$t('material.programNull');
                    return false;
                }
                this.error.program = '';
                if (!content || content.id === 0) {
                    this.error.content = this.$t('material.contentNull');
                    return false;
                }
                this.error.content = '';
                if (!campaign || campaign.id === 0) {
                    this.error.campaign = this.$t('material.campaignNull');
                    return false;
                }
                this.error.campaign = '';
                if (!language || language.id === 0) {
                    this.error.language = this.$t('material.languageNull');
                    return false;
                }
                this.error.language = '';
                return true;
            },
            async done() {
                if (this.material.materialName === '') {
                    this.$toast(this.$t('material.emailNoEmpty'), 'warn');
                    this.setIframeHtml('');
                    return false;
                }
                if (this.materialSaving) {
                    this.setIframeHtml('');
                    return false;
                }
                let checkHtml = this.editor.getData();
                // 邮件内容不能包含 emoji
                const emojiRegex = EmojiRegex();
                if (emojiRegex.test(checkHtml)) {
                    this.setIframeHtml('');
                    return this.$toast(this.$t('material.notSupportEmoji'), 'warn');
                }

                // 华为cdp标签
                if (this.isHw && !this.validCdpTag()) {
                    this.expanded = true;
                    return false;
                }

                if (this.isHw) {
                    let allTags = this.contentLabels;
                    if (this.othersTopicTags.length) {
                        allTags = this.contentLabels.concat(this.othersTopicTags);
                    }
                    this.material.materialLabelDTOList = allTags;
                }


                // 邮件内容中不能包含发件地址所在域名
                this.disabled = true;
                await JourneyApiV1
                    .getAddress(1)
                    .then((res) => {
                        const data = res.body.data;
                        if (data.addressList.length <= 0) {
                            this.emailAddress = '';
                            this.setIframeHtml('');
                            return;
                        }
                        // http://jira.qdum.com/browse/DMARTECH-6177
                        let generalList = data.addressList.filter(addr => addr.type === 0);
                        if (generalList.length <= 0) {
                            this.emailAddress = '';
                            this.setIframeHtml('');
                            return;
                        }
                        const address = generalList[0].sendAddress;
                        const index = address.indexOf('@');
                        this.emailAddress = address.substring(index + 1);
                    });

                let content = document.createElement('div');
                content.innerHTML = checkHtml;
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
                    this.disabled = false;
                    return false;
                }
                this.saveAjax();
            },
            //保存接口
            saveAjax () {
                let html = $(window.frames['emailHtml'].document)[0].documentElement.outerHTML;
                let lastMaterialContent = html.replace('<input id="isouterhtmlchanged" type="hidden">', '');
                for (let i = 0; i < this.shortUrlArray.length;i++){
                    lastMaterialContent = lastMaterialContent.replace(
                        this.shortUrlArray[i].beReplaced,this.shortUrlArray[i].replace);
                }
                this.material.materialContent = lastMaterialContent;
                this.materialSaving = true;
                const saver = this.material.id
                    ? JourneyMaterialApiV1.update(this.material)
                    : JourneyMaterialApiV1.create(this.material);
                saver
                    .then(() => {
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                        this.disabled = false;
                        if (this.$route.params.echoQuery) {
                            this.$router.push({
                                name: 'materialStore',
                                query: this.echoQuery
                            });
                        } else {
                            this.$router.push({name: 'materialStore', query: {tab: this.$route.query.tab}});
                        }
                    })
                    .catch(() => {
                        this.disabled = false;
                        this.setIframeHtml('');
                        setTimeout(() => {
                            this.materialSaving = false;
                            //this.$router.push({name: 'materialStore', query: {tab: this.$route.query.tab}});
                        }, 2000);
                    });
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
            /**
             * 获取cdp标签
             * @param labels
             */
            fetchCdpLabels(labels) {
                this.contentLabels = labels;
                if (!this.validCdpTag()) {
                    this.expanded = true;
                }
            },
            getOthersTopicTags(tags) {
                this.othersTopicTags = tags;
            },
            // 华为cdp标签展开收起
            toggle() {
                this.expanded = !this.expanded;
            },
            // 获取当前素材标签
            getMaterialTags(id) {
                JourneyMaterialApiV1
                    .getMaterialLabel(id)
                    .then(res => {
                        if (res.body.data.labelList && res.body.data.labelList.length) {
                            res.body.data.labelList.forEach(list => {
                                list.id = list.materialLabelId;
                            });
                            this.contentLabels = res.body.data.labelList;
                        }
                        this.requestDone = true;
                    })
                    .catch(() => {
                        this.requestDone = true;
                    });
            },
            // 获取当前素材所有标签
            getAllMaterialTags(id) {
                JourneyMaterialApiV1
                    .previewMaterialLabel(id)
                    .then(res => {
                        this.allTags = res.body.data.labelList;
                    });
            },
            // 设置iframeHTML内容
            setIframeHtml(strHtml) {
                const iFrameDoc = $('#emailHtml')[0].contentDocument ||
                    $('#emailHtml')[0].contentWindow.document;
                iFrameDoc.write(strHtml);
                iFrameDoc.close();
            }
        },
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

        .preview-btn {
            &[disabled] {
                svg {
                    fill: rgba(white, .6);
                }
            }
        }

        .addHF-btn {
            margin-right: 15px;
        }

        .save-loading {
            position: fixed;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
            background: rgba(0, 0, 0, 0.3);
        }

        .btn-label {
            position: fixed;
            left: 50%;

            svg {
                margin-left: 4px;

                &.expanded {
                    transform: rotate(180deg);
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
