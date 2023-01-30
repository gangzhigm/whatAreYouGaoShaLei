<template>
    <div class='out-content'>
        <div class='form-field'>
            <label class="label">{{'QRCode.url' | t}}</label>
            <input v-if="!isChecking"
                type="text"
                :value="material.exUrl"
                @input="emit({exUrl: $event.target.value.trim()})"
                :placeholder="$t('QRCode.enterUrl')"
                class="input lg"
                v-title:top.line.warn="errorText"
                :class="{error: errorText}" @focusin="errorText = ''">
            <span v-else-if="material.exUrl"><a :href="material.exUrl" target="_blank">{{material.exUrl}}</a></span>
            <span v-else>{{ 'common.noData' | t }}</span>
        </div>
        <div class='form-field'>
            <label class="label">{{'QRCode.title' | t}}</label>
            <input v-if="!isChecking" 
                type="text"
                :value="material.exTitle"
                @input="emit({exTitle: $event.target.value.trim()})"
                v-title:top.line.warn="errorTitleText"
                :class="{error: errorTitleText}" @focusin="errorTitleText = ''" maxlength="30"
                :placeholder="$t('QRCode.enterTitle')" class="input lg">
            <span v-else-if="material.exTitle">{{ material.exTitle }}</span>
            <span v-else>{{ 'common.noData' | t }}</span>
        </div>
        <div class='form-field description'>
            <label class="label">{{'QRCode.description' | t}}</label>
            <textarea class="textarea full-width description-wrapper" rows="5"
                      autofocus="true" maxlength="255"
                      :placeholder="$t('QRCode.enterDescription')"
                      :value="material.exDescribe"
                      :disabled="isChecking"
                      @input="emit({exDescribe: $event.target.value.trim()})"></textarea>
        </div>
        <div class='form-field'>
            <label class="label">{{'QRCode.cover' | t}}</label>
            <div class="chosen-material" v-if="material.url || material.mediaId">
                <div class="material-preview">
                    <a :href="material.url" target="_blank" :title="$t('QRCode.preview')">
                        <img :src="material.url">
                    </a>
                </div>
                <div class="material-info">
                    <span v-if="!isChecking"
                        class="pull-right icon icon-delete"
                        @click="delMaterial"
                        v-title:top="$t('QRCode.editorDelete')" />
                    <p class="material-name">{{material.title || material.name}}</p>
                    <p class="material-name">{{material.updateDateString}}</p>
                </div>
            </div>
            <template v-else-if="!isChecking">
                <div class="choose-material" @click="openLib = true">
                    <span>{{'QRCode.chooseContents' | t}}</span>
                </div>
                <label class="create-material" key="content">
                    <span>{{'QRCode.uploadPics' | t}}</span>
                    <input type="file" @change="uploadImage">
                </label>
            </template>
            <span v-else-if="isChecking">{{ 'common.noData' | t }}</span>
            <span v-if="!isChecking" class="imageTips">{{'wechatContent.normalImageTip' | t}}</span>
        </div>
        <image-lib v-if="openLib" :official-id="officialId" @choose="chooseExType" @cancel="openLib = false"></image-lib>
        <!--  上传 -->
        <backdrop v-if="uploading">
            <inline-loading></inline-loading>
            <p style="text-align: center;color: white">{{'wechatContent.materialUploading' | t}}</p>
        </backdrop>
    </div>
</template>
<script type="text/babel">
    import Backdrop from './../../../common/components/modal/backdrop.vue';
    import { WechatApiV1 } from '@/api';
    import ImageLib from '../../material-libs/image-lib.vue';
    import {TAGANDWEBPAGE_NAME_REGEXP, COMMON_URL_REGEXP} from '../../../common/utils/regs.js';
    export default {
        props: {
            material: {
                type: Object
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
                errorText: '',
                errorTitleText: '',
                openLib: false,
                uploading: false,
            };
        },
        methods: {
            // 选择图片素材
            chooseExType(material) {
                this.openLib = false;
                this.emit(material);
            },
            // 删除所选素材
            delMaterial() {
                this.openLib = false;
                this.emit({
                    mediaId: '',
                    name: '',
                    updateDateString: '',
                    url: ''
                });
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
                        this.uploading = false;
                        this.$toast(message, 'success');
                        this.emit(data.result[0]);
                    })
                    .catch(() => {
                        this.uploading = false;
                    });
            },
            // 校验链接与封面素材
            valid() {
                if (!COMMON_URL_REGEXP.test(this.material.exUrl)) {
                    this.errorText = this.$t('QRCode.badUrl');
                    return false;
                } else if (this.material.exUrl === '') {
                    this.errorText = this.$t('QRCode.emptyUrl');
                    return false;
                }
                this.errorText = '';
                return true;
            },
            // 校验标题
            validTitle() {
                if (this.material.exTitle === '') {
                    this.errorTitleText = this.$t('QRCode.titleEmpty');
                    return false;
                } else if (!TAGANDWEBPAGE_NAME_REGEXP.test(this.material.exTitle)) {
                    this.errorTitleText = this.$t('QRCode.titleInvalid');
                    return false;
                }
                this.errorTitleText = '';
                return true;
            },
            // 校验素材封面
            validCoverMaterial() {
                if (!this.material.mediaId && !this.material.url) {
                    this.$toast(this.$t('QRCode.selectCoverMaterial'), 'warn');
                    return false;
                }
                return true;
            },
            emit(material) {
                this.$emit('change', material);
            }
        },
        components: { ImageLib, Backdrop }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .out-content {
        margin: 0 auto;
        padding: 16px 32px;

        .form-field {
            span {
                display: inline-block;
                width: calc(100% - 130px);
                max-height: 200px;
                overflow-y: auto;
                overflow-x: hidden; 
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

        .description {

            .description-wrapper {
                width: 312px;

                .description-input {
                    width: 300px;
                    border: none;
                }

                .description-num {
                    color: $color-light-content;
                    text-align: right;
                }

                &:hover {
                    border-color: $theme;
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
