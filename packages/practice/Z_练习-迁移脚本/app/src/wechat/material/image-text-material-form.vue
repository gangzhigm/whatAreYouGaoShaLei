<template>
    <div class="img-text-material-form">
        <div class="form-content">
            <material-list :id="~~$route.query.id" :material="material" @choose="chooseMaterial"></material-list>
            <div class="img-text-form">
                <div class="img-text-form-title">
                    <input type="text" :placeholder="$t('wechatContent.inputTitle')" maxlength="64"
                           v-model.trim="material.title">
                    <span v-if="material.title"
                          :style="material.title.length > 64 ? {color: '#cc3333'} : {color : '#000'}">{{material.title ? material.title.length : 0}} / 64</span>
                </div>
                <div class="img-text-form-author">
                    <input type="text" :placeholder="$t('wechatContent.inputAuthor')" :maxlength="author.maxlength"
                           v-model.trim="material.author">
                    <span v-if="material.author"
                          :style="author.charLength > 16 ? {color: '#cc3333'} : {color : '#000'}">{{material.author ? author.charLength : 0}} / 16</span>
                </div>
                <div id="editor" @input="updateContent"></div>
                <div class="url">
                    <p class="img-text-form-label-line">
                        <checkbox :source="true" v-model="contentSourceUrlSwitch">{{'wechatContent.link' | t}}
                        </checkbox>
                    </p>
                    <input type="text" v-if="contentSourceUrlSwitch" v-model.trim="material.contentSourceUrl">
                </div>
                <div class="footer">
                    <p class="img-text-form-label-line">{{'wechatContent.styleEdit' | t}}</p>
                    <div class="img-text-form-label-line">
                        {{'wechatContent.cover' | t}}
                        <span class="img-text-form-label-tip-text">{{'wechatContent.suggestSize' | t}}</span>
                    </div>
                    <div>
                        <!--<button class="btn btn-md btn-orange" :disabled="imgsInContent.length"-->
                        <!--:title="imgsInContent.length ? '' : '正文中没有图片'"-->
                        <!--@click="pickingCover = 'content'">从正文选择-->
                        <!--</button>-->
                        <button class="btn btn-md btn-orange" @click="pickingCover = 'lib'">
                            {{'wechatContent.chooseFromList' | t}}
                        </button>
                    </div>
                    <p class="img-text-form-label-line">
                        {{'wechatContent.abstract' | t}}
                        <span class="img-text-form-label-tip-text">{{'wechatContent.abstractText' | t}}</span>
                    </p>
                    <textarea class="digest-textarea" v-model.trim="material.digest" maxlength="54"></textarea>
                </div>
            </div>
        </div>
        <multi-media ref="multiMedia" @pick="insertMaterial" @change="changeMiniProgram"></multi-media>
        <div class="form-panel">
            <!--<button type="button" class="btn btn-md btn-orange" :disabled="saving" @click="save">{{'common.save' | t}}</button>-->
            <button type="button" class="btn btn-md btn-orange" :disabled="saving" @click="preview">
                {{'wechatContent.previews' | t}}
            </button>
            <button type="button" class="btn btn-md btn-orange" :disabled="saving" @click="saveAndSync">
                {{'wechatContent.save' | t}}
            </button>
        </div>
        <!-- 从正文选择封面 -->
        <confirm v-if="pickingCover === 'content'" size="lg" :title="$t('wechatContent.chooseCover')"
                 @confirm="chooseCover"
                 @cancel="pickingCover = ''">
            <div class="img-material" v-for="material in imgsInContent"
                 :class="{active: coverMaterial.mediaId === material.mediaId}" @click="coverMaterial = material">
                <img :src="material.url" rel="noreferrer"/>
            </div>
        </confirm>
        <!-- 从图库选择封面 -->
        <image-lib v-if="pickingCover === 'lib'" @choose="chooseCover" @cancel="pickingCover = ''"></image-lib>
        <preview v-if="isPreview" @close="close" :choosedMaterial="choosedMaterial"></preview>
        <sketch class="pick-color" disableAlpha :preset-colors="presetColors" v-model="textColor"/>
        <sketch class="pick-color-bg" disableAlpha :preset-colors="presetColors" v-model="bgColor"/>
    </div>
</template>
<script type="text/babel">

    import WangEditor from 'wangeditor';
    import $ from 'jquery';
    import { textColorPickerMenu, bgColorPickerMenu, linkHoverPlugin } from './imageTextForm/imageTextPlugin';
    import { Sketch } from 'vue-color';
    import {uniqId} from '@/store/vuex/modules/canvasStore';
    import cloneDeep from 'lodash/cloneDeep';
    import MaterialList from './imageTextForm/material-list.vue';
    import MultiMedia from './imageTextForm/multi-media.vue';
    import preview from './imageTextForm/preview.vue';
    import ImageLib from '../material-libs/image-lib.vue';
    import materialStore, {
        GET_MATERIALS,
        MATERIAL_STORE,
        RESET_MATERIAL,
        SAVE_AND_QUIT,
        SAVE_MATERIAL,
        SET_ACTIVE_MATERIAL,
        SET_COVER_IMG,
        SET_TEXTCOLOR,
        SET_BGCOLOR
    } from '@/store/vuex/modules/imgTextStore';
    import { WechatApiV1 } from '@/api';
    import {computeWordsLength, sliceWords} from '@/common/utils/mixin';
    import {trackEvent} from '@/monitor';
    import {UPDATE_USER_INFO} from '@/store/vuex/mutationTypes';
    import {UPDATE_WECHAT_ACCOUNT_INFO} from '@/store/vuex/actionTypes';
    import { mapState, mapMutations, mapActions } from 'vuex';

    let DefaultValue = 'DefaultValue';
    let editor;

    function generateMaterialHtml(material) {
        let html = '';
        if (!material.type) {
            return `<img src="${material.map}"  rel="noreferrer">`;
        } 
        if (material.type) {
            switch (material.type) {
                // 图片
                case 1:
                    return `<img src="${material.url}" data-media-id="${material.mediaId}" rel="noreferrer">`;
                // 语音
                case 2:
                    return `<p><iframe class="res_iframe" scrolling="no" frameborder="0"
                                src="/iframeAudio?${material.id}"></iframe></p>`;
                // 视频
                case 3:
                    return material.value;
                // 小程序
                case 'miniprogram':
                    if (material.insertType === 'card') {
                        return `<mp-miniprogram class="mini-program mini-program-card"
                                                uniq="${uniqId()}" tabindex="0"
                                                data-miniprogram-appid="${material.appid}"
                                                data-miniprogram-path="${material.appPath}"
                                                data-miniprogram-title="${material.title}"
                                                data-miniprogram-imageurl="${material.url}">
                                </mp-miniprogram>`;
                    }
                    if (material.insertType === 'text') {
                        let href = material.alternatePage || '';
                        return `<a class="mini-program mini-program-text"
                                href="${href}"
                                data-miniprogram-appid="${material.appid}"
                                data-miniprogram-path="${material.appPath}">${material.title}</a>`;
                    }
                    if (material.insertType === 'image') {
                        return `<a class="mini-program mini-program-image"
                                href=""
                                data-miniprogram-appid="${material.appid}"
                                data-miniprogram-path="${material.appPath}">
                                    <img src="${material.url}" data-name="${material.name}" data-date="${material.date}"></a>`;
                    }
            }
        }
        return html;
    }

    export default {
        data() {
            return {
                material: {},
                contentSourceUrlSwitch: false,
                pickingCover: '',
                coverMaterial: {},
                saving: false,
                synced: false,

                isPreview: false,
                author: {
                    maxlength: 255,
                    charLength: 0,
                },
                choosedMaterial: {},
                presetColors: [             //颜色选择底部预置颜色
                    '#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321',
                    '#417505', '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2',
                    '#B8E986', '#000000', '#4A4A4A', '#9B9B9B', '#FFFFFF'
                ],
                modifyMiniObj: null
            };
        },
        beforeCreate() {
            this.$store.registerModule(MATERIAL_STORE, materialStore);
        },
        beforeRouteEnter(to, from, next) {
            if (to.query.id) {
                next(vm => {
                    vm.$store.dispatch(GET_MATERIALS, { materialId: to.query.id });
                });
            } else {
                // 创建图文消息 全局公众号改为旅程选择的公众号
                let authorizerInfoId = ~~to.query.authorizerInfoId;
                WechatApiV1
                    .createMainMaterial()
                    .then((res) => {
                        trackEvent('微信管理-创建图文素材');
                        if (authorizerInfoId) {
                            next(vm => {
                                vm.$store.dispatch(UPDATE_WECHAT_ACCOUNT_INFO, authorizerInfoId);
                            });
                        }
                        next({
                            name: 'imageTextCreate',
                            query: {id: res.body.data.material.id},
                        });
                    });
            }
        },
        mounted() {
            editor = new WangEditor('editor');
            let _this = this;
            editor.onchange = function () {
                _this.material.content = editor.$txt.html();
            };
            editor.config.menus = [
                'source', 'bold', 'underline', 'italic', 'strikethrough', 'eraser', 'fontcolor', 'bgfontcolor', '|',
                'quote', 'fontfamily', 'fontsize', 'head', 'unorderlist', 'orderlist', 'alignleft', 'aligncenter',
                'alignright', '|', 'link', 'table', 'insertcode', '|', 'undo', 'redo', 'fullscreen'];
            //添加自定义菜单项（字体颜色，背景颜色）
            textColorPickerMenu(editor,this.$store);
            bgColorPickerMenu(editor,this.$store);
            editor.create();
            //取消编辑器自身hover弹窗
            editor.txt.$txt.off('mouseenter','a');
            //小程序（文本，图片）自定义hover弹窗
            linkHoverPlugin(editor, this.$t, this.modifyMiniprogram);
            //小程序卡片选中操作
            editor.txt.$txt.on('keyup', e => {
                let focusCard = $('#editor .mini-program-card:focus');
                if ((e.keyCode === 8 || e.keyCode === 46) && focusCard.length) {
                    focusCard.remove();
                }
            });
        },
        beforeRouteLeave(to, from, next) {
            if (to.name !== 'massSendForm') {
                sessionStorage.removeItem(DefaultValue);
            }
            if (this.synced) {
                next();
            } else {
                this.$confirm(this.$t('wechatContent.leaveConfirm'), this.$t('wechatContent.leaveReminder'))
                    .then(sure => {
                        next(sure);
                    });
            }
        },
        destroyed() {
            editor.destroy();
            this.RESET_MATERIAL();
            this.$store.unregisterModule(MATERIAL_STORE);
            //取消编辑器自身hover弹窗
            $(document).off('mouseup');
        },
        methods: {
            ...mapMutations([
                RESET_MATERIAL,
                SET_ACTIVE_MATERIAL,
                SET_COVER_IMG,
                SET_TEXTCOLOR,
                SET_BGCOLOR
            ]),
            ...mapActions([
                SAVE_MATERIAL,
                SAVE_AND_QUIT
            ]),
            //修改编辑内容中的小程序
            modifyMiniprogram(miniData,$currentLink) {
                this.modifyMiniObj = $currentLink;
                this.$refs.multiMedia.modifyMiniprogram(miniData);
            },
            //预览
            preview() {
                // 1. save the current sub material
                this.saving = true;

                if (this.material.title === undefined) {
                    this.$toast(this.$t('wechatContent.titleReg'));
                    this.saving = false;
                    return;
                }
                if (this.material.title.length > 64 || this.material.title.length === 0) {
                    this.$toast(this.$t('wechatContent.authorReg'));
                    this.saving = false;
                    return;
                }
                if (this.material.author !== undefined) {
                    if (computeWordsLength(this.material.author) > 16) {
                        this.$toast(this.$t('wechatContent.authorReg'));
                        this.saving = false;
                        return;
                    }
                }
                if (this.material.thumbMediaUrl === undefined || this.material.thumbMediaUrl === '') {
                    this.$toast(this.$t('wechatContent.covernotEmpty'));
                    this.saving = false;
                    return;
                }

                this.SAVE_MATERIAL(this.material);
                this.isPreview = true;
                this.saving = false;
                if (!this.chooseMaterial.url) {
                    this.choosedMaterial = this.material;
                }
                // materialModel
                // .saveImgTextMaterial(this.material)
                // .then(res => {
                // // 2. 校验各个子素材，同步到微信并返回列表页
                // this.isPreview = true;
                // this.saving = false;
                // this.$store.dispatch(SAVE_AND_QUITs)
                // .then(() => {
                // this.saving = false;
                // })
                // .catch(() => {
                // this.$toast('请填写素材的标题和内容！', 'warn');
                // this.saving = false;
                // })
                // })
                // .catch((err) => {
                // this.saving = false;
                // this.$toast('服务器内部异常')
                // });
            },
            //关闭预览
            close() {
                this.isPreview = !this.isPreview;
            },
            //左侧图文列表选择图文素材
            chooseMaterial(material) {
                if (this.material && (material.id === this.material.id)) return;
                // save the current
                if (this.sourceMaterial) {
                    if (this.material.title === undefined) {
                        this.$toast(this.$t('wechatContent.titleReg'));
                        this.saving = false;
                        return;
                    }
                    if (this.material.title.length > 64 || this.material.title.length === 0) {
                        this.$toast(this.$t('wechatContent.titleReg'));
                        this.saving = false;
                        return;
                    }
                    if (this.material.author !== undefined) {
                        if (computeWordsLength(this.material.author) > 16) {
                            this.$toast(this.$t('wechatContent.authorReg'));
                            this.saving = false;
                            return;
                        }
                    }
                    if (this.material.thumbMediaUrl === undefined || this.material.thumbMediaUrl === '') {
                        this.$toast(this.$t('wechatContent.covernotEmpty'));
                        this.saving = false;
                        return;
                    }
                    if (!this.material.content || this.material.content === '<p><br></p>') {
                        this.$toast(this.$t('wechatContent.inputContent'));
                        this.saving = false;
                        return;
                    }
                    this.SAVE_MATERIAL(this.material);
                }

                // switch to the target
                this.SET_ACTIVE_MATERIAL(material.id);
                this.choosedMaterial = material;
            },
            //选择封面
            chooseCover(material) {
                if (material.mediaId) {
                    this.SET_COVER_IMG(material);
                    this.material.thumbMediaUrl = material.url;
                    this.material.thumbMediaId = material.mediaId;
                } else if (this.coverMaterial.mediaId) {
                    this.SET_COVER_IMG(this.coverMaterial);
                    this.material.thumbMediaUrl = this.coverMaterial.url;
                    this.material.thumbMediaId = this.coverMaterial.mediaId;
                }
                this.pickingCover = false;
            },
            //获取更新富文本内容
            updateContent() {
                this.material.content = editor.$txt.html();
            },
            // 从素材管理添加一个素材（图片，音频，视频）
            insertMaterial(material) {
                editor.command(null, 'insertHtml', generateMaterialHtml(material));
            },
            // 修改小程序
            changeMiniProgram(material) {
                this.modifyMiniObj.replaceWith(generateMaterialHtml(material));
                this.$nextTick(() => {
                    this.modifyMiniObj = null;
                });
            },
            save() {
                // save the current sub material
                this.SAVE_MATERIAL(this.material);
                if (this.material.title.length > 64 || this.material.title.length === 0) {
                    this.$toast(this.$t('wechatContent.titleReg'));
                    return;
                }
                // if (editor.$txt.html()
                //     .toString() === '<p><br></p>' || editor.$txt.html()
                //     .toString() === '') {
                //     this.$toast(this.$t('wechatContent.inputContent'), 'warn');
                //     this.saving = false;
                //     return;
                // }
                if (!this.saving) {
                    this.saving = true;

                    WechatApiV1
                        .saveImgTextMaterial(this.material)
                        .then(() => {
                            this.saving = false;
                            this.$toast(this.$t('common.saveSuccess'), 'success');
                        })
                        .catch(() => {
                            this.saving = false;
                        });
                }

            },
            //保存并同步到微信
            saveAndSync() {
                // 1. save the current sub material
                this.saving = true;

                if (this.material.title === undefined) {
                    this.$toast(this.$t('wechatContent.titleReg'));
                    this.saving = false;
                    return;
                }
                if (this.material.title.length > 64 || this.material.title.length === 0) {
                    this.$toast(this.$t('wechatContent.titleReg'));
                    this.saving = false;
                    return;
                }
                if (this.material.author !== undefined) {
                    if (computeWordsLength(this.material.author) > 16) {
                        this.$toast(this.$t('wechatContent.authorReg'));
                        this.saving = false;
                        return;
                    }
                }
                if (!this.material.content || this.material.content === '<p><br></p>') {
                    this.$toast(this.$t('wechatContent.inputContent'));
                    this.saving = false;
                    return;
                }
                if (this.material.thumbMediaUrl === undefined || this.material.thumbMediaUrl === '') {
                    this.$toast(this.$t('wechatContent.covernotEmpty'));
                    this.saving = false;
                    return;
                }
                this.SAVE_MATERIAL(this.material);

                WechatApiV1
                    .saveImgTextMaterial(this.material)
                    .then(res => {
                        // 2. 校验各个子素材，同步到微信并返回列表页
                        this.SAVE_AND_QUIT()
                            .then(() => {
                                const data = res.body.data.data;
                                let session = '';
                                if (data.material === undefined) {
                                    session = data.id;
                                } else {
                                    session = data.material.id;
                                }
                                this.saving = false;
                                this.$toast(this.$t('wechatContent.saveSuccess'), 'success');
                                this.synced = true;
                                
                                let isFromMassSend = JSON.parse(sessionStorage.getItem('MESSAGE_CACHE_KEY'));
                                if (isFromMassSend) {
                                    sessionStorage.setItem(DefaultValue, session);
                                    this.$router.go(-1);
                                } else {
                                    this.$router.replace({
                                        name: 'imageTextList'
                                    });
                                }
                            }, () => {
                                this.$toast(this.$t('wechatContent.coverContent'), 'warn');
                                this.saving = false;
                            });
                    })
                    .catch(() => {
                        this.saving = false;
                    });
            }
        },
        computed: {
            ...mapState({
                activeId: state => state[MATERIAL_STORE].activeId,
                storeMaterials: state => state[MATERIAL_STORE].materials,
                storeTextColor: state => state[MATERIAL_STORE].textColor,
                storeBgColor: state => state[MATERIAL_STORE].bgColor
            }),
            sourceMaterial() {
                const activeId = this.activeId;
                return this.storeMaterials.$getByKey(activeId);
            },
            imgsInContent() {
                const materials = [],
                    Matcher = /<img src="([a-zA-Z0-9-_./:=&?]*)" data-media-id="([a-zA-Z0-9-_]*)"[^>]*>/g,
                    content = this.material.content;
                let result;
                while ((result = Matcher.exec(content)) !== null) {
                    materials.push({
                        url: result[1],
                        mediaId: result[2]
                    });
                }
                return materials;
            },
            textColor: {
                get() {
                    return {
                        hex: this.storeTextColor
                    };
                },
                set({hex}) {
                    this.SET_TEXTCOLOR(hex);
                }
            },
            bgColor: {
                get() {
                    return {
                        hex: this.storeBgColor
                    };
                },
                set({hex}) {
                    this.SET_BGCOLOR(hex);
                }
            }
        },
        watch: {
            sourceMaterial(newMaterial, oldMaterial) {
                if (newMaterial !== oldMaterial && newMaterial) {
                    this.$set(this.$data, 'material', cloneDeep(newMaterial));
                    if (newMaterial.contentSourceUrl) this.contentSourceUrlSwitch = true;
                    editor.$txt.html(newMaterial.content);
                    if (this.material.contentSourceUrl === '') {

                        this.contentSourceUrlSwitch = false;
                    }
                }
            },
            contentSourceUrlSwitch(flag) {
                if (!flag) this.material.contentSourceUrl = '';
            },
            'material.author'(val) {
                if (!val) return;
                if (computeWordsLength(val) >= 16) {
                    this.material.author = sliceWords(val, 16);
                    this.author.charLength = 16;
                    this.author.maxlength = 1;
                } else {
                    this.author.charLength = computeWordsLength(val);
                    this.author.maxlength = 255;
                }
            }
        },
        components: {
            Sketch,
            MaterialList,
            MultiMedia,
            preview,
            ImageLib
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .img-text-material-form {
        .form-content {
            position: relative;
            padding-left: calc(100vw - 100%);
        }

        $panel-height: 55px;

        .img-text-form {
            $form-offset: 20px;
            min-height: 100%;
            @include box-sizing();
            width: 790px;
            margin: 16px auto #{$panel-height + 16px};
            background-color: white;
            border-left: 1px solid $border-color;
            border-right: 1px solid $border-color;

            .img-text-form-title {
                height: 50px;
                padding: 0 $form-offset;
                border-bottom: 1px solid $border-color;
                @include placeholder($color-light-content, 26px);

                input {
                    @include box-sizing();
                    width: 80%;
                    border: 0;
                    font-size: 26px;
                    height: 50px;
                }
            }

            .img-text-form-author {
                height: 50px;
                padding: 0 $form-offset;
                border-bottom: 1px solid $border-color;
                @include placeholder($color-light-content, 20px);

                input {
                    @include box-sizing();
                    width: 80%;
                    border: 0;
                    font-size: 20px;
                    height: 50px;
                }
            }

            .wangEditor-container {
                z-index: 0;
                border: 0;

                #editor {
                    min-height: 300px;
                    height: auto !important;
                    overflow: visible;
                    padding: $form-offset;

                    img {
                        max-width: 100%;
                    }
                    .mini-program-card{
                        display: block;
                        max-width: 600px;
                        margin: 0 auto;
                        &:focus {
                            border: 2px solid #3dceba;
                            border-radius: 10px;
                            outline: none;
                        }
                    }
                    .mini-program-text{
                        padding-left: 14px;
                        background: url('material-editor-componets/miniprogram-icon.png') no-repeat left top;
                        background-size: 14px 14px;
                    }
                }
                .link-hover{
                    position: absolute;
                    display: inline-block;
                    z-index: 1;
                    border: 1px solid $border-color;
                    background-color: white;
                    font-size: 12px;
                    width: 300px;
                    height: 34px;
                    span{
                        display: inline-block;
                        max-width: 200px;
                        color: #169BD5;
                        line-height: 32px;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                    }
                    .hover-btn{
                        display: inline-block;
                        float: right;
                        color: #169BD5;
                        line-height: 32px;
                        padding: 0 5px;
                    }
                }
                .pick-color,.pick-color-bg {
                    display: block;
                }
            }

            .img-text-form-label-line {
                height: 35px;
                font-size: 14px;
                line-height: 35px;
            }

            .img-text-form-label-tip-text {
                font-size: 12px;
                color: $color-light-content;
            }

            .url {
                padding: $form-offset;
                border-top: 1px solid $border-color;

                input {
                    padding: 0 10px;
                    @include box-sizing();
                    height: 35px;
                    border: 1px solid $border-color;
                    width: 500px;
                }
            }

            .footer {
                display: inline-block;
                @include box-sizing();
                padding: $form-offset;
                background: #fcfcfc;
                border-top: 1px solid $border-color;

                .digest-textarea {
                    border: 1px solid $border-color;
                    @include box-sizing();
                    overflow: auto;
                    height: 100px;
                    width: 500px;
                    padding: 10px;
                    resize: none;
                }
            }
        }

        // 从正文选取封面：正文内的单个封面图
        .img-material {
            display: inline-block;
            width: 20%;
            margin: 3%;

            .img-material {
                img {
                }
            }
        }

        .form-panel {
            position: fixed;
            z-index: 1;
            bottom: 0;
            right: 0;
            left: 0;
            padding: 10px 0;
            text-align: center;
            border-top: 1px solid $border-color;
            background-color: white;
        }

        .res_iframe {
            display: block;
            width: 479px;
            height: 100px;
            background: #fff;
        }
        .pick-color,.pick-color-bg {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 243px;
            z-index: $index-container;
        }
    }

</style>
