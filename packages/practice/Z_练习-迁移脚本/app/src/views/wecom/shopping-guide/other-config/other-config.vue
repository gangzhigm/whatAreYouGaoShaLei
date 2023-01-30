<template>
    <div class="shopping-guide-other page-content">
        <div class="content-view margin padding white-bg">
            <div class="other-head">
                <h6>
                    {{'shoppingGuide.otherConfig' | t}}
                    <span>{{'shoppingGuide.bgTips' | t}}</span>
                </h6>
            </div>
            <div class="other-content">
                <div class="eg-pic">
                    <img :src="homeEgPic">
                    <img :src="jumpEgPic">
                    <div v-if="homeUrl" class="home-bg" :style="`background-image: url('${homeUrl}')`"></div>
                    <div v-if="jumpUrl" class="jump-bg" :style="`background-image: url('${jumpUrl}')`"></div>
                    <div class="home-head">
                        <img :src="headEgPic">
                    </div>
                    <div class="jump-head">
                        <img :src="headEgPic">
                    </div>
                </div>
                <!-- 右侧上传图片区域 -->
                <div class="bg-upload">
                    <h6>{{'shoppingGuide.uploadBg' | t}}</h6>
                    <!-- 首页背景 -->
                    <template>
                        <!-- 无图上传背景 -->
                        <div class="bg-upload-index" v-if="!homeUrl">
                            <label class="upload-pic">
                                <span>{{'shoppingGuide.uploadIndexBg' | t}}</span>
                                <input type="file" @change="uploadImage($event, 'index')">
                            </label>
                            <p class="light-content-text">{{'shoppingGuide.uploadLimitA' | t}}</p>
                            <p class="light-content-text">{{'shoppingGuide.uploadLimitB' | t}}</p>
                        </div>
                        <!-- 有图展示背景 -->
                        <div class="uploaded-pic" v-else>
                            <div class="material-preview">
                                <a :href="homeUrl" target="_blank" :title="$t('QRCode.preview')">
                                    <img :src="homeUrl">
                                </a>
                                <span class="pull-right icon icon-delete"
                                    @click="homeUrl = ''"
                                    v-title:top="$t('QRCode.editorDelete')" />
                            </div>
                        </div>
                    </template>
                    <!-- 跳转页背景 -->
                    <template>
                        <!-- 无图上传背景 -->
                        <div class="bg-upload-jump" v-if="!jumpUrl">
                            <label class="upload-pic">
                                <span>{{'shoppingGuide.uploadJumpBg' | t}}</span>
                                <input type="file" @change="uploadImage($event, 'jump')">
                            </label>
                            <p class="light-content-text">{{'shoppingGuide.uploadLimitA' | t}}</p>
                            <p class="light-content-text">{{'shoppingGuide.uploadLimitB' | t}}</p>
                        </div>
                        <!-- 有图展示背景 -->
                        <div class="uploaded-pic" v-else>
                            <div class="material-preview">
                                <a :href="jumpUrl" target="_blank" :title="$t('QRCode.preview')">
                                    <img :src="jumpUrl">
                                </a>
                                <span class="pull-right icon icon-delete"
                                    @click="jumpUrl = ''"
                                    v-title:top="$t('QRCode.editorDelete')" />
                            </div>
                        </div>
                    </template>
                    <div class="change-bg">
                        <button type="button" class="btn btn-lg btn-white" @click="changeBgCancel">{{'common.cancel' | t}}
                        </button>
                        <button type="button" class="btn btn-lg btn-theme" @click="changeBgConfirm">{{'common.confirm' | t}}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <!--  上传 -->
        <backdrop v-if="uploading">
            <inline-loading></inline-loading>
            <p style="text-align: center;color: white">{{'wechatContent.materialUploading' | t}}</p>
        </backdrop>
    </div>
</template>

<script type="text/babel">

    import { WecomApiV1 } from '@/api';
    const getUrl = (url) => {
        return new URL(url, import.meta.url).href;
    };

    export default {
        data () {
            return {
                homeEgPic: getUrl('../image/homeEgPic.png'),    //首页示例背景
                jumpEgPic: getUrl('../image/jumpEgPic.png'),     //跳转页示例背景
                headEgPic: getUrl('../image/headEgPic.png'),     //示例背景头像
                homeUrl: '',                //首页背景图
                jumpUrl: '',                 //跳转页背景图
                uploading: false,
            };
        },
        computed: {
            
        },
        methods: {
            // 上传图片
            uploadImage(e, type) {
                const file = e.target.files[0];
                e.target.value = '';
                if (!/\.(jpe?g|png|gif|svg|webp)$/i.test(file.name)) {
                    this.$toast(this.$t('wechatContent.picFormatErr'), 'warn');
                    return false;
                }
                if (file.size > 1024 * 1024 * 10) {
                    this.$toast(this.$t('wechatContent.picSizeError'), 'warn');
                    return false;
                }
                this.uploading = true;
                WecomApiV1
                    .uploadImage(file)
                    .then(({body: {data}}) => {
                        this.$toast(this.$t('QRCode.uploadSuccess'), 'success');
                        type === 'index' ? this.homeUrl = data.ossUrl : this.jumpUrl = data.ossUrl;
                        this.uploading = false;
                    })
                    .catch(() => {
                        this.uploading = false;
                    });
            },
            // 同步到小程序
            changeBgConfirm() {
                if (!this.homeUrl && !this.jumpUrl) {
                    this.$toast(this.$t('wecomComponents.imageValid'), 'warn');
                    return;
                }
                this.uploading = true;
                WecomApiV1
                    .saveImage({
                        homeUrl: this.homeUrl,
                        jumpUrl: this.jumpUrl
                    })
                    .then(() => {
                        this.homeUrl = '';
                        this.jumpUrl = '';
                        this.uploading = false;
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                    })
                    .catch(() => {
                        this.uploading = false;
                    });
            },
            // 取消同步
            changeBgCancel() {
                this.homeUrl = '';
                this.jumpUrl = '';
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .shopping-guide-other {

        .other-head {

            h6 {
                font-size: 16px;
                line-height: 24px;

                span {
                    font-size: 12px;
                    font-weight: lighter;
                    color: $disabled;
                    margin-left: 15px;
                }
            }
        }

        .other-content {
            max-width: 1200px;
            display: flex;
            justify-content: space-around;
            margin-top: 30px;

            .eg-pic {
                position: relative;
                display: flex;
                justify-content: space-between;
                width: 650px;

                img {
                    width: 300px;
                    height: 620px;
                }

                .home-head, .jump-head {
                    position: absolute;
                    top: 147px;
                    width: 32px;
                    height: 32px;
                    padding: 13px;
                    border: 1px solid $disabled;
                    border-radius: 50%;
                    background: #ffffff;

                    img {
                        width: 32px;
                        height: 32px;
                    }
                }

                .home-head {
                    left: 118px;
                }
                
                .jump-head {
                    right: 120px;
                }
                
                .home-bg, .jump-bg {
                    position: absolute;
                    top: 63px;
                    width: 262px;
                    height: 131px;
                    overflow: hidden;
                    background-size: cover;
                    background-position: center center;
                    background-repeat: no-repeat;
                }
                
                .home-bg {
                    left: 20px;
                }
                
                .jump-bg {
                    right: 18px;
                }

            }

            .bg-upload {

                h6 {
                    font-size: 14px;
                }
                
                .bg-upload-index, .bg-upload-jump {
                    width: 348px;

                    .upload-pic {
                        @include box-sizing();
                        display: inline-block;
                        vertical-align: top;
                        width: 270px - 2px;
                        height: 210px - 2px;
                        padding: 13px;
                        margin: 30px auto 10px;
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
                            background: url("../../../../wechat/material/images/icon-new-material.png") center top no-repeat;
                        }

                        input {
                            display: none;
                        }
                    }
                }
                    
                .uploaded-pic {
                    width: 270px - 2px;
                    height: 210px - 2px;
                    margin: 30px auto 10px;
                    padding-right: 80px;

                    .material-preview {
                        position: relative;
                        height: 100%;
                        background-color: $content-bg;
                        border: 1px solid $border-color;

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
                        
                        .icon {
                            position: absolute;
                            right: 0;
                            bottom: 0;
                            width: 30px;
                            height: 30px;
                            line-height: 30px;
                            text-align: center;
                            font-size: 16px;
                            cursor: pointer;

                            &:hover {
                                color: $red;
                            }
                        }
                    }
                }

                .change-bg {
                    margin-top: 30px;

                    .btn {
                        width: 80px;
                        margin-right: 15px;
                    }
                }
            }
        }
    }
</style>
