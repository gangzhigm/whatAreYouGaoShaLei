<template>
    <div class="questionnaire" :class="{ 'is-checking': isChecking }">
        <template v-if="!isChecking || (material.id && material.sheetUrl)">
            <div class="form-field flex">
                <label class="label">{{'wechatContent.replyType' | t}}</label>
                <radio v-for="replyType in replyTypeList" :source="replyType.id" :key="replyType.id"
                       v-model="formReplyType" :disabled="isChecking" @input="formReplyTypeChange">
                    {{replyType.name}}
                </radio>
            </div>
            <div class="form-field flex" v-if="formReplyType === 1">
                <label class="label">{{'wechatContent.replyText' | t}}</label>
                <text-link-editor v-model="sheetContent"
                                  :form="formData"
                                  :is-checking="isChecking"
                                  @select="selectNormalForm"
                                  @textLink="getQuestionnaireUrl"
                                  @selectExtended="setFormExtended"
                                  @selectCustom="selectCustomForm" />
            </div>
            <template v-if="formReplyType === 2">
                <div class="form-field flex">
                    <label class="label placeholder"></label>
                    <questionnaire-picker :value="material.id" :customId="material.customFormId"
                                          :formExtend="material.extensionValueId"
                                          :is-checking="isChecking"
                                          use="QRCode"
                                          @exterUrl="exterUrl"
                                          @select="selectNormalForm"
                                          @textLink="getQuestionnaireUrl"
                                          @selectExtended="setFormExtended"
                                          @selectCustom="selectCustomForm"/>
                </div>
                <div class='form-field'>
                    <label class="label">{{'QRCode.title' | t}}</label>
                    <input v-if="!isChecking"
                        type="text"
                        v-model.trim="material.externalTitle"
                        @input="inputExternalTitle"
                        v-title:top.line.warn="errorTitleText"
                        :class="{error: errorTitleText}" @focusin="errorTitleText = ''" maxlength="30"
                        :placeholder="$t('QRCode.enterTitle')" class="input lg">
                    <span v-else>{{ material.externalTitle }}</span>
                </div>
                <div class='form-field form-description'>
                    <label class="label">{{'QRCode.description' | t}}</label>
                    <textarea class="textarea full-width description-wrapper" rows="5"
                              autofocus="true" maxlength="255"
                              :placeholder="$t('QRCode.enterDescription')"
                              :disabled="isChecking"
                              v-model.trim="material.externalDescription"
                              @input="inputExternalDescription" />
                </div>
                <div class='form-field'>
                    <label class="label">{{'QRCode.cover' | t}}</label>
                    <div class="chosen-material" v-if="material.externalImageUrl || material.materialId">
                        <div class="material-preview">
                            <a :href="material.externalImageUrl" target="_blank" :title="$t('QRCode.preview')">
                                <img :src="material.externalImageUrl">
                            </a>
                        </div>
                        <div class="material-info">
                            <span v-if="!isChecking"
                                class="pull-right icon icon-delete"
                                @click="delFormMaterial"
                                v-title:top="$t('QRCode.editorDelete')"></span>
                            <p class="material-name">{{material.title || material.name}}</p>
                            <p class="material-name">{{material.updateDateString}}</p>
                        </div>
                    </div>
                    <template v-else>
                        <div class="choose-material" @click="openLib = true">
                            <span>{{'QRCode.chooseContents' | t}}</span>
                        </div>
                        <label class="create-material" key="content">
                            <span>{{'QRCode.uploadPics' | t}}</span>
                            <input type="file" @change="uploadImage">
                        </label>
                    </template>
                    <span v-if="!isChecking" class="imageTips">{{'wechatContent.normalImageTip' | t}}</span>
                </div>
            </template>
            <image-lib v-if="openLib" :official-id="officialId" @choose="chooseFormCover" @cancel="openLib = false"></image-lib>
            <!--  上传 -->
            <backdrop v-if="uploading">
                <inline-loading></inline-loading>
                <p style="text-align: center;color: white">{{'wechatContent.materialUploading' | t}}</p>
            </backdrop>
        </template>
        <span v-else>{{ 'common.noData' | t }}</span>
    </div>
</template>
<script type="text/babel">
    import Backdrop from './../../../common/components/modal/backdrop.vue';
    import ImageLib from '../../material-libs/image-lib.vue';
    import TextLinkEditor from '../text-link-editor.vue';
    import QuestionnairePicker from '../../../journey/material/questionnaire-picker.vue';
    import { WechatApiV1 } from '@/api';
    import {TAGANDWEBPAGE_NAME_REGEXP} from '../../../common/utils/regs.js';
    export default {
        props: {
            material: {
                type: Object,
                default: {
                    formReplyType: 'sheet'
                }
            },
            // 查看模式
            isChecking: {
                type: Boolean,
                default: false
            },
            // 目标公众号id，非必填
            officialId: {
                type: Number
            }
        },
        data() {
            return {
                replyTypeList: [
                    {id: 1, name: this.$t('QRCode.replyTxt')},
                    {id: 2, name: this.$t('QRCode.replyWebPage')}
                ],
                formReplyType: 1,
                errorTitleText: '',
                openLib: false,
                uploading: false,
                formData: {},
            };
        },
        computed: {
            sheetContent: {
                get() {
                    return this.material.content || '';
                },
                set(content) {
                    this.emit({content});
                }
            },
        },
        watch: {
            'material.formReplyType': {
                handler: function(type) {
                    if (type) {
                        this.formReplyType = type === 'sheet' ? 1 : 2;
                    }
                },
                immediate: true
            }
        },
        created() {
            this.formData = {
                id: this.material.id || null,
                customFormId: this.material.customFormId || null,
                formName: this.material.formName || '',
                sheetUrl: this.material.customSheetUrl || this.material.sheetUrl || '',
                extensionValueId: this.material.extensionValueId || null,
            };
        },
        methods: {
            // 表单选择框未操作时返回表单链接
            exterUrl(val) {
                const material = {
                    externalUrl: this.material.externalUrl || val
                };
                this.emit(material);
            },
            // 表单信息
            selectNormalForm(e) {
                const material = {
                    id: e.id,
                    // 选择源表单时， 需要重置自定义表单（多层emit， 所以把重置自定义表单拿到外部）
                    customFormId: null,
                    formName: e.paperName
                };
                this.emit(material);
            },
            // 表单选择扩展值
            setFormExtended(e) {
                // 选择源表单触发清空扩展值操作
                this.emit({extensionValueId: e.id, customSheetUrl: e.url, extensionName: e.name});
            },
            // 自定义表单
            selectCustomForm(e) {
                const material = {
                    customFormId: e.id,
                    customSheetUrl: e.indexLink,
                    id: e.formId,
                    formName: e.formName
                };
                this.emit(material);
            },
            // 文本获取的链接
            getQuestionnaireUrl(link) {
                this.emit({sheetUrl: link});
            },
            // 表单回复类型切换
            formReplyTypeChange(e) {
                let formFormat = {
                    id: null,
                    customFormId: null,
                    formName: '',
                    sheetUrl: '',
                    extensionValueId: null,
                    customSheetUrl: '',
                    extensionName: '',
                    externalTitle: '',
                    externalDescription: '',
                    externalImageUrl: '',
                    updateDateString: '',
                    name: '',
                    content: '',
                };
                this.formData = {};
                if (e === 2) {
                    this.emit(Object.assign({}, formFormat, {formReplyType: 'external'}));
                } else {
                    this.sheetContent = '';
                    this.emit(Object.assign({}, formFormat, {formReplyType: 'sheet'}));
                }
            },
            // 表单回复选择封面
            chooseFormCover(material) {
                WechatApiV1
                    .getMaterial(material.id)
                    .then(({body: {data}}) => {
                        material.materialId = data.material.mediaId;
                        material.materialCoverId = material.id;
                        delete material.id;
                        this.openLib = false;
                        material.externalImageUrl = material.url;
                        material.url = '';
                        this.emit(material);
                    });
            },
            // 输入标题
            inputExternalTitle(e) {
                Object.assign(this.formData, {externalTitle: e.target.value.trim()});
            },
            // 输入描述
            inputExternalDescription(e) {
                Object.assign(this.formData, {externalDescription: e.target.value.trim()});
            },
            // 上传图片
            uploadImage(e) {
                const file = e.target.files[0];
                e.target.value = '';
                if (!/\.(jpe?g|png|gif|bmp)$/i.test(file.name)) {
                    this.$toast(this.$t('wechatContent.picFormatErr'), 'warn');
                    return false;
                }
                if (file.size > 1024 * 1024 * 10) {
                    this.$toast(this.$t('wechatContent.picSizeError'), 'warn');
                    return false;
                }
                this.uploading = true;
                WechatApiV1
                    .uploadImg(file, 1, file.name, this.officialId)
                    .then(({body: {message, data}}) => {
                        let imgInfo = data.result[0];
                        imgInfo.materialId = imgInfo.mediaId;
                        imgInfo.materialCoverId = imgInfo.id;
                        delete imgInfo.id;
                        this.openLib = false;
                        imgInfo.externalImageUrl = imgInfo.url;
                        imgInfo.url = '';
                        this.$toast(message, 'success');
                        this.uploading = false;
                        this.emit(imgInfo);
                    })
                    .catch(() => {
                        this.uploading = false;
                    });
            },
            // 清空所选素材
            delFormMaterial() {
                this.emit({
                    externalImageUrl: '',
                    updateDateString: '',
                    name: '',
                    materialId: ''
                });
            },
            // 校验表单回复外部页素材
            validFormMaterial() {
                if (!this.material.externalImageUrl) {
                    this.$toast(this.$t('QRCode.selectCoverMaterial'), 'warn');
                    return false;
                }
                return true;
            },
            // 校验表单回复外部页标题
            validFormTitle() {
                if (!this.material.externalTitle) {
                    this.errorTitleText = this.$t('QRCode.titleEmpty');
                    this.$toast(this.$t('QRCode.titleEmpty'), 'warn');
                    return false;
                } else if (!TAGANDWEBPAGE_NAME_REGEXP.test(this.material.externalTitle)) {
                    this.errorTitleText = this.$t('QRCode.titleInvalid');
                    this.$toast(this.$t('QRCode.titleInvalid'), 'warn');
                    return false;
                }
                this.errorTitleText = '';
                return true;
            },
            emit(material) {
                Object.assign(this.formData, material);
                this.$nextTick(() => {
                    this.$emit('change', this.formData);
                });
            }
        },
        components: { TextLinkEditor, QuestionnairePicker, ImageLib,  Backdrop}
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .questionnaire {
        padding: 32px;
        .form-field {
            .label {
                width: 61px;
            }
        }
        &.is-checking {
            .questionnaire-picker {
                .questionnaire-picker-level-one {
                    label {
                        border: unset;
                        cursor: default;
                        .select-icon {
                            display: none;
                        }
                    }
                }
                .selector .select-text.disabled {
                    border: unset;
                    color: unset;
                    cursor: unset;
                    background-color: unset;
                    .select-icon {
                        display: none;
                    }
                }
            }
        }
        .link {
            display: inline-flex;

            .link-div {
                padding: 0 8px;
                background-color: $disabled-bg;
                border-top: 1px solid $border-color;
                border-bottom: 1px solid $border-color;
                border-left: 1px solid $border-color;
                border-radius: 0;
            }

            .link-input {
                width: $form-input-width;
                border: 1px solid $border-color;
                border-radius: 0;
            }
        }

        .form-description {
            .description-wrapper {
                width: 312px;
            }
        }

        .choose-material,
        .create-material {
            @include box-sizing();
            display: inline-block;
            vertical-align: top;
            width: 270px - 2px;
            height: 210px - 2px;
            padding: 13px;
            margin: 21px 0 16px 27px;
            border: 1px dashed $border-color;
            text-align: center;
            cursor: pointer;

            &:hover {
                border-color: $theme;
            }

            span {
                display: inline-block;
                padding-top: 40px;
                line-height: 24px;
                margin-top: 68px;
            }
        }

        .create-material {
            margin-right: 27px;

            a {
                display: block;
                height: 100%;
                color: #000000;
            }

            span {
                background: url("../images/icon-new-material.png") center top no-repeat;
            }

            input {
                display: none;
            }
        }

        .choose-material {
            margin-left: 0;
            background: url("../../images/blury-lib-bg.png") center/280px auto no-repeat;
            background-clip: content-box;
            @include transition(all .3s linear);

            &:hover {
                background-size: 310px auto;
            }

            span {
                background: url("../images/icon-material-lib.png") center top no-repeat;
            }
        }

        .chosen-material {
            display: inline-block;
            overflow: hidden;
            width: 270px - 2px;
            height: 210px - 2px;
            margin: 18px 27px;
            border: 1px solid $border-color;

            .material-preview {
                position: relative;
                height: 160px;
                background-color: $content-bg;
                border-bottom: 1px solid $border-color;

                img {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    top: 0;
                    margin: auto;
                    width: auto;
                    height: auto;
                    max-width: 100%;
                    max-height: 100%;
                }
            }

            .material-info {
                padding: 9px 1em 0;

                .icon {
                    width: 30px;
                    height: 30px;
                    line-height: 30px;
                    text-align: center;
                    background-color: white;
                    font-size: 16px;
                    cursor: pointer;

                    &:hover {
                        color: $red;
                    }
                }

                p {
                    @include ellipsis();
                    line-height: 15px;
                    color: $color-light-content;
                }
            }
        }
        .imageTips{
            display: block;
            margin-left: 130px;
            color: $color-light-content;
        }
    }
</style>
