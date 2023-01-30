<template>
    <div class="material-media">
        <div class="chosen-material" v-if="material.mediaId" key="material">
            <template v-if="material.type === 1">
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
                    <p class="material-name">{{material.name || material.title}}</p>
                    <p class="material-name">{{material.updateDateString}}</p>
                </div>
            </template>
            <template v-if="material.type === 2">
                <div class="material-preview" :title="material.url ? '' : $t('wechatContent.audioUnPlayable')">
                    <audio v-if="material.url" :src="material.url" controls preload="metadata"></audio>
                    <img v-if="!material.url" src="../../images/audio.png">
                </div>
                <div class="material-info">
                        <span v-if="!isChecking"
                              class="pull-right icon icon-delete"
                              @click="delMaterial"
                              v-title:top="$t('QRCode.editorDelete')" />
                    <p class="material-name">{{material.name || material.title}}</p>
                    <p class="material-name">{{material.updateDateString}}</p>
                </div>
            </template>
            <template v-if="material.type === 3">
                <div class="material-preview" @click="previewVideo">
                    <!-- <video preload="metadata" controls :src="material.url"></video> -->
                    <img src="../images/videoPlay.png" alt="">
                </div>
                <div class="material-info">
                        <span v-if="!isChecking"
                              class="pull-right icon icon-delete"
                              @click="delMaterial"
                              v-title:top="$t('QRCode.editorDelete')" />
                    <p class="material-name">{{material.name || material.title}}</p>
                    <p class="material-name">{{material.updateDateString}}</p>
                </div>
            </template>
        </div>
        <template v-else>
            <div class="choose-material" @click="chooseMaterial">
                <span>{{'QRCode.chooseContents' | t}}</span>
            </div>
            <label v-if="material.type && material.type !== 3" class="create-material" key="content" :class="{'isDisabled':authRender(material.type)}">
                <template v-if="material.type === 1">
                    <span>{{'QRCode.uploadPics' | t}}</span>
                    <input type="file" @change="uploadImage" :disabled="$has('wechat_material_upload_image')">
                </template>
                <template v-if="material.type === 2">
                    <span>{{'QRCode.uploadAudio' | t}}</span>
                    <input type="file"
                           accept="audio/mp3,audio/wma,audio/wav,audio/amr"
                           @change="uploadAudio" :disabled="$has('wechat_material_upload_voice')">
                </template>
                <!-- 2.5.7版本 隐藏系统内的视频上传功能，仅允许公众号后台上传 -->
                <!-- <div v-if="material.type === 3" @click="videoClick">
                    <span>{{'QRCode.createVideo' | t}}</span>
                </div> -->
            </label>
        </template>
        <image-lib v-if="openLibType === 1" :official-id="officialId" @choose="chooseFinish" @cancel="openLibType = ''"></image-lib>
        <audio-lib v-if="openLibType === 2" :official-id="officialId" @choose="chooseFinish" @cancel="openLibType = ''"></audio-lib>
        <video-lib v-if="openLibType === 3" :official-id="officialId" @choose="chooseFinish" @cancel="openLibType = ''"></video-lib>
        <!--  上传 -->
        <backdrop v-if="uploading">
            <inline-loading></inline-loading>
            <p style="text-align: center;color: white">{{'wechatContent.materialUploading' | t}}</p>
        </backdrop>
        <!--上传视频弹窗-->
        <modal v-if="videoModalOpen" size="lg" :title="$t('wechatContent.addVideo')" @close="closeUpVideo">
            <videoMaterialForm ref="videoMaterialForm" :isModal="true" :officialId="officialId" @upVideoData="confirmUploadVideo"></videoMaterialForm>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')"
                       @click="closeUpVideo">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')"
                       @click="uploadVideo">
            </template>
        </modal>
    </div>
</template>
<script type="text/babel">
    import Backdrop from './../../../common/components/modal/backdrop.vue';
    import { WechatApiV1 } from '@/api';
    import ImageLib from '../../material-libs/image-lib.vue';
    import AudioLib from '../../material-libs/audio-lib.vue';
    import VideoLib from '../../material-libs/video-lib.vue';
    import videoMaterialForm from '../video-material-form.vue';
    import audioPic from '../../images/audio.png';
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
                audioPic: audioPic,
                openLibType: '',
                uploading: false,
                videoModalOpen: false
            };
        },
        methods: {
            authRender(type) {
                switch (type) {
                    case 1:
                        return this.$has('wechat_material_upload_image');
                    case 2:
                        return this.$has('wechat_material_upload_voice');
                    // 2.5.7版本 隐藏系统内的视频上传功能，仅允许公众号后台上传
                    // case 3:
                        // return this.$has('wechat_material_add_video');
                    default:
                        return false;
                }
            },
            // 点击从素材管理中选择时
            chooseMaterial() {
                this.openLibType = this.material.type;
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
                        this.$toast(message, 'success');
                        this.emit(data.result[0]);
                        this.uploading = false;
                    })
                    .catch(() => {
                        this.uploading = false;
                    });
            },
            // 上传音频
            uploadAudio(e) {
                const input = e.target;
                const file = input.files[0];
                input.value = '';
                if (!/\.(mp3)$/i.test(file.name)) {
                    this.$toast(this.$t('wechatContent.audioFormatErr'), 'warn');
                    return false;
                }
                if (file.size > 2 * 1024 * 1024) {
                    this.$toast(this.$t('wechatContent.audioSizeErr'), 'warn');
                    return false;
                }
                WechatApiV1
                    .createAudio(file, 2, file.name, this.officialId)
                    .then(({body: {message, data}}) => {
                        this.$toast(message, 'success');
                        this.emit(data.result[0]);
                    });
            },
            //上传视频
            videoClick() {
                if (this.$has('wechat_material_add_video')) return;
                this.videoModalOpen = true;
            },
            uploadVideo() {
                this.$refs.videoMaterialForm.saveUpload();
            },
            confirmUploadVideo(material) {
                this.emit(material);
                this.videoModalOpen = false;
            },
            //取消上传视频
            closeUpVideo() {
                this.videoModalOpen = false;
            },
            // 删除所选素材
            delMaterial() {
                this.openLibType = '';
                this.emit({
                    mediaId: '',
                    name: '',
                    updateDateString: '',
                    updateDate: '',
                    url: '',
                    id: ''
                });
            },
            // 选中素材
            chooseFinish(material) {
                material.content = '';
                material.exUrl = '';
                material.exTitle = '';
                material.exDescribe = '';
                this.openLibType = '';
                if (material.title) {
                    material.name = material.title;
                }
                this.emit(material);
            },
            emit(material) {
                this.$emit('change', material);
            },
            previewVideo() {
                // 视频通过审核后返回的是一个mp.weixin.qq.com地址，新页面打开预览, 原视频预览逻辑，当前页弹窗播放，暂时废弃
                if (this.material.url.indexOf('mp.weixin.qq.com') !== -1) {
                    window.open(this.material.url, '_blank');
                } else {
                    this.$toast(this.$t('wechatContent.unPlayable'), 'warn');
                }
            }
        },
        components: { ImageLib, AudioLib, VideoLib, Backdrop, videoMaterialForm }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .material-media{
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

                img, audio, video {
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

                audio{
                     width: 100%;
                     height: 30%;
                 }

                .material-list {
                    .imageText-content {
                        flex-grow: 1;
                        position: relative;
                        width: 100%;
                        border: 1px solid $border-color;
                        margin: 0;

                        &:hover {
                            @include box-shadow(0 3px 8px rgba(#8b9daf, 0.16));
                        }

                        .shell {
                            height: 160px;
                        }

                        .scroll {
                            overflow-y: auto;
                        }

                        // 图文内容
                        .image-item {
                            position: relative;
                            height: 100%;
                        }

                        .image-main {
                            height: 100%;

                            &:hover {
                                .preview_mask {
                                    display: block;
                                }
                            }

                            .preview_mask {
                                position: absolute;
                                left: -8px;
                                right: -8px;
                                top: -8px;
                                display: none;
                                height: calc(100% + 16px);
                                width: calc(100% + 8px);
                                text-align: center;
                                background: rgba(0, 0, 0, 0.5);
                                color: #fff;
                            }
                        }

                        .two {
                            height: 70%;

                            .image-sub {
                                height: 30%;
                                width: calc(100% - 16px);

                                .box {
                                    line-height: 30px;
                                }

                                .preview_mask {
                                    position: absolute;
                                    left: -8px;
                                    right: -8px;
                                    top: 100%;
                                    bottom: 0;
                                    display: none;
                                    height: calc(30% + 8px);
                                    width: calc(100% + 16px);
                                    text-align: center;
                                    background: rgba(0, 0, 0, 0.5);
                                    color: #fff;
                                }
                            }
                        }

                        .three {
                            position: relative;
                            height: 40%;

                            .image-sub {
                                position: relative;
                                height: 66%;
                                // width: calc(100% - 16px);
                                .box {
                                    line-height: 40px;
                                }

                                .preview_mask {
                                    position: absolute;
                                    top: -8px;
                                    right: 0;
                                    bottom: 0;
                                    left: -8px;
                                    display: none;
                                    width: calc(100% + 16px);
                                    height: calc(100% + 16px);
                                    text-align: center;
                                    background: rgba(0, 0, 0, 0.5);
                                    color: #fff;
                                }
                            }
                        }

                        .image-sub {
                            margin: 8px;

                            &:hover {
                                .preview_mask {
                                    display: block;
                                }
                            }

                            .box {
                                float: left;
                                width: 50%;
                                height: 100%;
                            }
                        }

                        .edit_mask_content {
                            text-align: center;
                            display: inline-block;
                            vertical-align: middle;
                            font-size: 14px;

                            p {
                                margin: 0 auto;
                            }
                        }

                        .vm_box {
                            display: inline-block;
                            height: 100%;
                            vertical-align: middle;
                        }

                        .image-url {
                            height: 100%;
                            overflow: hidden;
                            background-repeat: no-repeat;
                            background-position: center center;
                            background-size: cover;
                        }

                        h4 {
                            position: relative;
                            top: -32px;
                            width: calc(100% - 16px);
                            height: 32px;
                            line-height: 32px;
                            margin: 0;
                            padding: 0 8px;
                            font-style: normal;
                            background-color: rgba(0, 0, 0, .6);
                            color: white;
                            overflow: hidden;
                            @include user-select(none);
                            @include ellipsis();
                        }

                        // 多个图文的title
                        .item-title {
                            @include ellipsis();
                        }

                        // 未同步至微信
                        .un-sync {
                            position: absolute;
                            right: 0;
                            width: 100px;
                            height: 20px;
                            line-height: 20px;
                            text-align: center;
                            background: #0cc2a9;
                            color: #fff;
                            cursor: default;
                        }

                        // 图文信息不完整
                        .hint {
                            padding: 14px;
                            line-height: 20px;

                            p {
                                color: #ffbe00;
                            }
                        }
                    }
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
    }
    .isDisabled {
        @include noPermission();
    }

</style>
