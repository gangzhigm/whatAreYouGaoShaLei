<template>
    <div class="material-editor" :style="typesMaxWidth" :class="{'single-material' : forJourneyUse}">
        <!--选择回复类型tab栏-->
        <div v-if="!forJourneyUse" class="types">
            <template v-for="tab in tabList">
                <span v-if="types.includes(tab.type)"
                    :key="tab.type"
                    :class="['material-type', tab.className, {active: currentMaterialType === tab.type}]"
                    @click="chooseType(tab.type)">
                    {{tab.name}}
                </span>
            </template>
        </div>
        <!--编辑回复内容-->
        <div class="editor">
            <!-- 不回复 -->
            <template v-if="currentMaterialType === 0"></template>
            <template v-else-if="[1,2,3].includes(currentMaterialType)">
                <material-media ref="materialMedia"
                               :material="material"
                               :is-checking="isChecking"
                               :official-id="officialId"
                               @change="updateMedia($event)" />
            </template>
            <!-- 文字 -->
            <template v-else-if="currentMaterialType === 'text'">
                <material-text :material="material"
                               :maxLength="maxLength"
                               :panelNotice="panelNotice"
                               :is-checking="isChecking"
                               :official-id="officialId"
                               ref="materialText"
                               :isModal="isModal"
                               @input="updateTextContent($event)" />
            </template>
            <!--图文-->
            <template v-else-if="currentMaterialType === 5">
                <material-text-image ref="materialTextImage"
                                     :material="material"
                                     :noSubMaterials="noSubMaterials"
                                     :mpnewsType="mpnewsType"
                                     @change="updateTextImage($event)" />
            </template>
            <!-- 外部页 -->
            <template v-else-if="currentMaterialType === 6">
                <material-out ref="materialOut"
                              :material="material"
                              :is-checking="isChecking"
                              :official-id="officialId"
                              @change="updateOut($event)" />
            </template>
            <!-- 跳转表单 -->
            <template v-else-if="currentMaterialType === 7">
                <material-form ref="materialForm"
                               :material="material"
                               :is-checking="isChecking"
                               :official-id="officialId"
                               @change="updateForm($event)" />
            </template>
            <!-- 小程序卡片 -->
            <template v-else-if="currentMaterialType === 8">
                <material-mini ref="materialMini"
                               :material="material"
                               :is-checking="isChecking"
                               :official-id="officialId"
                               @change="updateMini($event)" />
            </template>
            <template v-else-if="currentMaterialType === 9">
                <material-menu ref="materialMenu"
                               :material.sync="material" :isCustomMenu='isCustomMenu'/>
            </template>
            <!-- 小程序 -->
            <template v-else-if="currentMaterialType === 10">
                <material-applets ref="applets"
                               :urlMaxLth="urlMaxLth"
                               :material="material"
                               :is-checking="isChecking"
                               @change="updateApplets($event)" />
            </template>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    import MaterialText from './material-editor-componets/material-text.vue';
    import MaterialTextImage from './material-editor-componets/material-text-image.vue';
    import MaterialMedia from './material-editor-componets/material-media.vue';
    import MaterialOut from './material-editor-componets/material-out.vue';
    import MaterialForm from './material-editor-componets/material-form.vue';
    import MaterialMini from './material-editor-componets/material-miniprogram.vue';
    import MaterialMenu from './material-editor-componets/material-menu.vue';
    import MaterialApplets from './material-editor-componets/material-applets.vue';

    export default {
        name: 'material-editor',
        components: {
            MaterialText,
            MaterialForm,
            MaterialOut,
            MaterialTextImage,
            MaterialMedia,
            MaterialMini,
            MaterialMenu,
            MaterialApplets
        },
        props: {
            urlMaxLth: {
                type: Number,
                default: 30
            },
            value: {
                type: Object
            },
            types: {
                type: Array,
                'default': () => [5, 'text', 1, 2, 3, 6, 7, 8],      // 对应tabList.type
            },
            noSubMaterials: Boolean, // 限制多图文素材(客服消息)
            maxLength: {    //文本回复类型最大字数
                type: [Number,String],
                default: 600
            },
            panelNotice: {  //底部panel说明
                type: String,
                default: ''
            },
            maxWidth: { //tab自适应滚动条
                type: Number,
                default: 0
            },
            // 是否在旅程接口使用并传递额外参数
            forJourneyUse: {
                type: Boolean
            },
            // 是否可编辑 旅程模块定制参数 仅限文字，图片，音频，视频，外部页，表单，小程序卡片
            isChecking: {
                type: Boolean,
                default: false
            },
            // 目标公众号id，非必填
            officialId: {
                type: Number
            },
            //是否是自定义菜单进入
            isCustomMenu: {
                type: Boolean,
                defalut: false
            },
            //判断文字的位置 false：非弹窗中；true: 弹窗中。解决弹窗中文字超出弹窗的问题
            isModal: {
                type: Boolean,
                default: false
            },
            //图文素材列表返回草稿或已发布
            mpnewsType: {
                type: Number,
                default: 2  //1:草稿， 2：已发布
            }
        },
        data() {
            return {
                currentMaterialType: this.types[0],     //当前回复类型
                tabList: [
                    {type: 0,name: this.$t('QRCode.none'),className: 'imgText'},    //不回复
                    {type: 5,name: this.$t('QRCode.appMsg'),className: 'imgText'},  //图文
                    {type: 'text',name: this.$t('QRCode.text'),className: 'text'},  //文本
                    {type: 1,name: this.$t('QRCode.pics'),className: 'img'},        //图片
                    {type: 2,name: this.$t('QRCode.audio'),className: 'audio'},     //语音
                    {type: 3,name: this.$t('QRCode.video'),className: 'video'},     //视频
                    {type: 6,name: this.$t('QRCode.webPage'),className: 'webPage'}, //外部页
                    {type: 7,name: this.$t('QRCode.form'),className: 'toForm'},     //表单
                    {type: 8,name: this.$t('wechatContent.miniCard'),className: 'imgText'}, //小程序卡片
                    {type: 9,name: this.$t('QRCode.menuMsg'),className: 'text'}, //菜单消息
                    {type: 10,name: this.$t('QRCode.applets'),className: 'text'}, //小程序
                ]
            };
        },
        computed: {
            material() {
                return this.value;
            },
            typesMaxWidth() {
                return this.maxWidth ? {'max-width': `${this.maxWidth}px`} : {};
            }
        },
        watch: {
            'material.type': {
                handler: function(type) {
                    if (type && type !== this.currentMaterialType) {
                        this.currentMaterialType = type;
                    } else if (!type) {
                        this.currentMaterialType = this.types[0];
                    }
                },
                immediate: true
            }
        },
        methods: {
            // 选择回复类型
            chooseType(type) {
                if (type === this.currentMaterialType) return;
                let initMaterial = {
                    content: '',
                    id: null,
                    type,
                    exUrl: '',
                    exTitle: '',
                    exDescribe: '',
                    formReplyType: 'sheet',
                    miniprogramTitle: '',
                    miniprogramAppid: '',
                    pagePath: ''
                };
                if (type === 9) {
                    initMaterial = Object.assign({}, initMaterial, {
                        type: 9, // 发送消息类型(1.图片 2.音频 3.视频 'text'文字 5.图文消息 6.外部页 7.跳转表单 8.小程序卡片 9.菜单消息)
                        // 微信菜单消息属性
                        menuMessage: {
                            headContent: '',
                            tailContent: '',
                            options: [
                                { content: '' }
                            ]
                        }
                    });
                }
                this.$emit('input', initMaterial);
                this.currentMaterialType = type;
            },
            // 回复文字
            updateTextContent(text) {
                if (text.length > 0) {
                    this.emit({
                        type: 'text',
                        content: text,
                        exUrl: '',
                        exTitle: '',
                        exDescribe: ''
                    });
                    return;
                }
                this.emit({type: 'text', content: text, exUrl: '', exTitle: '', exDescribe: ''});
            },
            // 回复图文素材
            updateTextImage(material) {
                let textImage = Object.assign({}, material, { type: 5 });
                this.emit(textImage);
            },
            // 图文素材校验
            validImageText() {
                return this.$refs.materialTextImage.isMaterialComplete();
            },
            // 回复图片，音频，视频
            updateMedia(material) {
                this.emit(material);
            },
            // 回复外部页
            updateOut(material) {
                let outData = Object.assign({}, material, { type: 6 });
                this.emit(outData);
            },
            // 回复类型为外部页 6 时，校验链接与封面素材
            valid() {
                return this.$refs.materialOut.valid();
            },
            // 回复类型为外部页 6 时，校验标题
            validTitle() {
                return this.$refs.materialOut.validTitle();
            },
            // 回复类型为外部页 6 时，校验素材封面
            validCoverMaterial() {
                return this.$refs.materialOut.validCoverMaterial();
            },
            // 回复表单
            updateForm(material) {
                let formData = Object.assign({}, material, { type: 7 });
                this.emit(formData);
            },
            // 校验表单回复外部页素材
            validFormMaterial() {
                return this.$refs.materialForm.validFormMaterial();
            },
            // 校验表单回复外部页标题
            validFormTitle() {
                return this.$refs.materialForm.validFormTitle();
            },
            // 回复小程序卡片
            updateMini(material) {
                let miniData = Object.assign({}, material, { type: 8 });
                this.emit(miniData);
            },
            // 回复小程序
            updateApplets(material) {
                let miniData = Object.assign({}, material, { type: 10 });
                this.emit(miniData);
            },
            // 校验小程序卡片小程序
            validMiniProgram(){
                return this.$refs.materialMini.validMiniprogram();
            },
            // 校验小程序卡片标题,
            validMiniProgramTitle() {
                return this.$refs.materialMini.validTitle();
            },
            // 校验小程序卡片appid
            validMiniProgramAppid() {
                return this.$refs.materialMini.validAppid();
            },
            validMiniProgramPagePath() {
                return this.$refs.materialMini.validPagePath();
            },
            // 校验小程序url,
            validAppletsUrl() {
                return this.$refs.applets.validUrl();
            },
            // 校验小程序appid
            validAppletsAppid() {
                return this.$refs.applets.validAppid();
            },
            validAppletsPagePath() {
                return this.$refs.applets.validPagePath();
            },
            // 校验小程序素材封面
            validMiniProgramCover() {
                return this.$refs.materialMini.validCover();
            },
            // 校验菜单消息
            validMenuMsg() {
                return this.$refs.materialMenu.valid();
            },
            emit(material) {
                this.$emit('input', Object.assign({}, this.material, material));
            },
            // 根据类型自动校验
            validAll() {
                switch (this.currentMaterialType) {
                    // 发送消息类型(1.图片 2.音频 3.视频 'text'文字 5.图文消息 6.外部页 7.跳转表单 8.小程序卡片 9.菜单消息)
                    case 0:
                        return true;
                    case 1:
                    case 2:
                    case 3:
                        if (this.material.id) {
                            return true;
                        } 
                        this.$toast(this.$t('QRCode.validMaterial'), 'warn');
                        return false;
                    case 'text':
                        return this.$refs.materialText.valid();
                    case 5:
                        return this.validImageText();
                    case 6:
                        return this.validTitle()
                            && this.valid()
                            && this.validCoverMaterial();
                    case 7:
                        if (!this.material.id) {
                            this.$toast(this.$t('QRCode.validForm'), 'warn');
                            return;
                        }
                        if (this.material.formReplyType === 'sheet') {
                            if (!this.material.content 
                                && !this.material.sheetUrl
                                && !this.customFormId
                                && !this.material.extensionValueId
                            ) {
                                this.$toast(this.$t('wechatContent.validForm'), 'warn');
                                return false;
                            }
                            return true;
                        }
                        return this.$refs.materialForm.validFormTitle() && this.$refs.materialForm.validFormMaterial();
                    case 8:
                        if (this.material.miniprogramId === 0) {
                            return this.validMiniProgram()
                                    && this.validMiniProgramTitle()
                                    && this.validMiniProgramAppid()
                                    && this.validMiniProgramPagePath()
                                    && this.validMiniProgramCover();
                        } 
                        return this.validMiniProgram()
                                && this.validMiniProgramTitle()
                                && this.validMiniProgramCover(); 
                        
                        
                    case 9:
                        return this.validMenuMsg();
                }
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .material-editor {
        display: inline-block;
        &.single-material {
            width: 100%;
            .editor {
                border: none;
            }
        }
        .types {
            display: flex;
            align-items: center;
            @include box-sizing();
            border: 1px solid $border-color;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
            color: $color-light-content;
            border-bottom: 0;
            overflow: auto;

            .material-type {
                line-height: 50px - 3px * 2;
                padding: 3px 30px 0;
                border-bottom: 3px solid transparent;
                cursor: pointer;
                // 强制菜单tab文字不换行
                white-space: nowrap;

                &.active,
                &:hover {
                    color: $color-content;
                }

                &.active {
                    border-bottom-color: $dark-green;
                }

                &:before {
                    content: "";
                    display: inline-block;
                    vertical-align: top;
                    margin-top: 12px;
                    width: 20px;
                    height: 20px;
                }
            }

            .imgText {
                &:before {
                    background: url("../images/material-editor-tab-icons.png") 0 -240px no-repeat;
                }

                &:hover:before,
                &.active:before {
                    background-position: 0 -270px;
                }
            }

            .text {
                &:before {
                    background: url("../images/material-editor-tab-icons.png") 0 0 no-repeat;
                }

                &:hover:before,
                &.active:before {
                    background-position: 0 -30px;
                }
            }

            .img {
                &:before {
                    background: url("../images/material-editor-tab-icons.png") 0 -60px no-repeat;
                }

                &:hover:before,
                &.active:before {
                    background-position: 0 -90px;
                }
            }

            .audio {
                &:before {
                    background: url("../images/material-editor-tab-icons.png") 0 -180px no-repeat;
                }

                &:hover:before,
                &.active:before {
                    background-position: 0 -210px;
                }
            }

            .video {
                &:before {
                    background: url("../images/material-editor-tab-icons.png") 0 -120px no-repeat;
                }

                &:hover:before,
                &.active:before {
                    background-position: 0 -150px;
                }
            }

            .webPage {
                &:before {
                    background: url("../images/material-editor-tab-icons.png") 0 -360px no-repeat;
                }

                &:hover:before,
                &.active:before {
                    background-position: 0 -390px;
                }
            }

            .toForm {
                &:before {
                    background: url("../images/material-editor-tab-icons.png") 0 -300px no-repeat;
                }

                &:hover:before,
                &.active:before {
                    background-position: 0 -330px;
                }
            }
        }

        .editor {
            border: 1px solid $border-color;
            border-bottom-left-radius: 4px;
            border-bottom-right-radius: 4px;
        }
    }

</style>
