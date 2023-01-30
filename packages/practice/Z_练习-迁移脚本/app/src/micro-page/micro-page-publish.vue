<template>
    <div class="micro-page-publish">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-contents">
            <div class="content-view white-bg padding margin form-container">
                <!-- 微页面预览 -->
                <div class="content-left">
                    <div class="phone-img">
                        <img src="./img/preview.png"/>
                    </div>
                    <div class="view">
                        <iframe class="iframe-preview" :src="htmlLink"></iframe>
                    </div>
                    <div class="code-path">
                        <img :src="qrCodePath" alt="">
                        <p>{{'microPage.scanCodePreview' | t}}</p>
                    </div>
                </div>
                <div class="content-right">
                    <h2>{{pageName}}</h2>
                    <!-- 样式 -->
                    <div class="form-field">
                        <label class="label">{{'microPage.shareView' | t}}</label>
                    </div>
                    <!-- 标题 -->
                    <div class="form-field">
                        <label class="label">{{'microPage.shareTitle' | t}}</label>
                        <input type="text" class="input" v-model.trim="shareObj.shareTitle"
                        v-title:top.line.warn="errorShare" :placeholder="$t('microPage.titleHolder')"
                        :maxlength="35" :class="{error: errorShare}" @focusin="errorShare = ''">
                    </div>
                    <!-- 描述 -->
                    <div class="form-field">
                        <label class="label">{{'microPage.shareDesc' | t}}</label>
                        <input type="text" class="input" v-model.trim="shareObj.shareDescription"
                        v-title:top.line.warn="errorDesc" :placeholder="$t('microPage.descHolder')"
                        :maxlength="30" :class="{error: errorDesc}" @focusin="errorDesc = ''">
                    </div>
                    <!-- 分享图片 -->
                    <div class="form-field">
                        <label class="label">{{'microPage.sahreImg' | t}}</label>
                        <div class="share-image">
                            <div class="image-container preview" ref="preview" v-if="shareObj.sharePictures"
                               :style="{ backgroundImage: `url('${shareObj.sharePictures}')` }" >
                                <div class="preview-mask">
                                    <!-- 查看大图 -->
                                    <a class="icon icon-eye" :href="shareObj.sharePictures" target="_blank"></a>
                                    <!-- 删除当前图片 -->
                                    <span  class="icon icon-round-close" @click="handleDel"></span>
                                </div>
                            </div>
                            <label v-if="!shareObj.sharePictures" class="image-container upload" :class="{'error': errorImg}" v-title:top.line.warn="errorImg"
                                @click="errorImg = ''">
                                <input type="file" @change="uploadImage" ref="image">
                                <div v-if="uploading" class="light-content-text upload-tips">{{ 'material.uploading' | t }}...</div>
                                <div v-else class="upload-tips">
                                    <div class="icon icon-xinjian"></div>
                                    <span>{{ 'wecomComponents.uploadImg' | t }}</span>
                                </div>
                            </label>
                            <p class="light-content-text">*{{'microPage.imgTip' | t}}</p>
                        </div>
                    </div>
                    <!-- 相关按钮 -->
                    <div class="btn-bto">
                        <button type="button" class="btn btn-md btn-white" @click="goBack">{{'microPage.back' | t}}</button>
                        <button type="button" class="btn btn-md btn-theme"  @click="save(shareObj.status = 1)" v-if="isPublish">{{'microPage.savePub' | t}}</button>
                        <button type="button" class="btn btn-md btn-theme"  @click="save(shareObj.status = 0)" v-else>{{'common.save' | t}}</button>
                    </div>
                </div>
            </div>
        </div>
        <!-- 微页面发布成功 -->
        <modal v-if="publishSucc" @close="publishSucc = false" :title="$t('microPage.microPagePublish')">
            <template v-if="isPublish">
                <div class="modal-sucess">
                    <h3>{{'microPage.pubSucc' | t}}</h3>
                    <div class="code">
                        <img :src="wxcCode" alt="">
                    </div>
                    <input type="text" class="input" v-model="urlLink" readonly ref="copyLink" id="copy">
                    <button type="button" class="btn btn-md btn-theme copy" @click="handleCopy()">{{'scoring.copy' | t}}</button>
                </div>
            </template>
            <template v-if="!isPublish">
                <div class="modal-sucess">
                    <h3>{{'microPage.savepubSucc' | t}}</h3>
                    <p class="modal-tip">{{'microPage.succTip2' | t}}</p>
                    <div class="code-succ">
                        <img :src="qrCodePath" alt="">
                        <p>{{'microPage.scanCodePreview' | t}}</p>
                    </div>
                    <button type="button" class="btn btn-md btn-white back" @click="backPage">{{'microPage.backPage' | t}}</button>
                    <button type="button" class="btn btn-md btn-theme" @click="goAuth">{{'microPage.auth' | t}}</button>
                </div>
            </template>
        </modal>
    </div>
</template>
<script type="text/babel">
    import LINKS from '../LINKS';
    import { MicroPageApi, WechatApiV1 } from '@/api';
    
    export default {
        data() {
            return {
                pageName: '', // 页面名称
                shareObj: {
                    shareTitle: '', //分享标题
                    shareDescription: '', //分享描述
                    sharePictures: '', // 分享图片url
                    status: '', // 保存类型 0：保存 1：保存并发布
                    id: ''
                },               
                errorShare: '', //分享标题错误提示
                errorDesc: '', //分享描述错误提示                
                errorImg: '',
                uploading: false, // 上传状态
                wxcCode: '',
                urlLink: '', // 小程序链接
                qrCodePath: '', // 二维码链接
                isPublish: false, // 是否已发布
                publishSucc: false, // 微页面发布成功状态框
                htmlLink: '', // 预览图
            };
        },
        computed: {
            crumbs() {
                return [
                    {name: 'wecom', text: 'Dmartech'},
                    {name: 'microPageList', text: this.$t('home.microPage')},
                    {name: 'microPagePublish',  text: this.$t('microPage.microPagePublish')}
                ];
            },
        },
        mounted() {
            // 获取微页面详情
            this.getInfo();
            // 获取小程序详情
            this.getMiniProgramInfo();
        },
        beforeRouteLeave(to, from, next) {
            // 新建微页面返回上一页
            if (to.name === 'microPageCreate') {
                this.$router.push({
                    name:'microPageEdit',
                    query: {
                        id: ~~this.$route.query.id,
                        groupId: ~~this.$route.query.groupId,
                        pageName: this.pageName
                    }
                });
            } else {
                next();
            }
        },
        methods: {
            // 上传图片
            uploadImage(e) {
                const file = e.target.files[0];
                e.target.value = '';
                if (!/\.(jpg|png|jpeg)$/i.test(file.name)) {
                    this.$toast(this.$t('microPage.imageFormatValid'), 'warn');
                    return false;
                }
                if (file.size > 1024 * 1024 * 10) {
                    this.$toast(this.$t('microPage.imageFormatValid'), 'warn');
                    return false;
                }
                this.uploading = true;
                MicroPageApi
                    .uploadImage(file)
                    .then(({ body: { message, data } }) => {
                        this.$toast(message, 'success');
                        this.uploading = false;
                        this.shareObj.sharePictures = data.ossUrl;
                    })
                    .catch(() => {
                        this.uploading = false;
                    });
            },
            // 删除图片
            handleDel () {
                this.shareObj.sharePictures = '';
            },
            // 返回上一步
            goBack() {
                this.$router.go(-1);
            },
            //  校验是否为空
            valid() {
                if (!this.shareObj.shareTitle) {
                    this.errorShare = this.$t('QRCode.enterTitle');
                    return false;
                } else if (!this.shareObj.shareDescription) {
                    this.errorDesc = this.$t('QRCode.enterDescription');
                    return false;
                } else if (!this.shareObj.sharePictures) {
                    this.errorImg = this.$t('wecomComponents.imageValid');
                    return false;
                }
                return true;
            },
            // 保存
            save() {
                if (this.valid()) {
                    this.shareObj.id = ~~this.$route.query.id;
                    MicroPageApi
                        .setStatus(this.shareObj)
                        .then(({ body: { message, data } }) => {
                            this.$toast(message, 'success');
                            this.publishSucc = true;
                            this.wxcCode = data.wxcCode;
                            this.urlLink = LINKS.ORIGIN + LINKS.WEB_BASE + '/mpomp?id=' + this.shareObj.id;
                            if (!this.isPublish) {
                                this.qrCodePath = data.qrCodePath;
                            }
                        })
                        .catch(({ body: { message, data } }) => {
                            this.$toast(message, 'warn');
                        });
                }
            },
            // 复制
            handleCopy() {
                this.$refs.copyLink.select();
                document.execCommand('copy');
                this.$toast(this.$t('form.copied'), 'success');
            },
            // 获取微页面详情
            getInfo() {
                MicroPageApi
                    .showPage({id: ~~this.$route.query.id})
                    .then(({ body: { message, data } }) => {
                        this.htmlLink = data.htmlLink;
                        this.shareObj.sharePictures = data.sharePictures;
                        this.shareObj.shareTitle = data.shareTitle;
                        this.shareObj.shareDescription = data.shareDescription;
                        this.pageName = data.pageName;
                        this.qrCodePath = data.qrCodePath;
                    })
                    .catch(({ body: { message } }) => {
                        this.$toast(message, 'warn');
                    });
            },
            // 获取小程序详情(isPublish是否已经发布1： 未发布 2： 已经发布)
            getMiniProgramInfo() {
                WechatApiV1
                    .getMiniProgramInfo()
                    .then(({ body: { data } }) => {
                        if (data && data.releaseStatus === 2 && data.subType === 1) {
                            this.isPublish = true;
                        }
                    });
            },
            // 前往授权
            goAuth() {
                // 跳转微页面授权
                this.$router.push({name:'MiniProgram'});
            },
            // 返回主页面
            backPage() {
                this.$router.push({name:'microPageList'});
            }
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../common/scss/base/variables";
    @import "../common/scss/base/mixin";
    .micro-page-publish {
        .page-contents {
             .form-container {
                  min-width: 1350px;
                  padding: 16px 80px 24px 80px;
                  display: flex;
                  @include box-sizing();
                  height: 80vh;
                  // overflow-y: scroll;
                  .content-left {
                      width: 30%;
                      margin-right: 20px;
                      .phone-img {
                          width: 270px;
                          height: 570px;
                          margin: 0 auto;
                          position: absolute;
                      }
                      .view {
                            width: 225px;
                            height: 356px;
                            position: relative;
                            top: 125px;
                            left: 20px;
                            overflow: hidden;
                            .iframe-preview {
                                position: absolute;
                                left: -78px;
                                top: -120px;
                                width: 378px;
                                height: 590px;
                                pointer-events:none;
                                transform: scale(0.6);
                            }
                      }
                      .code-path {
                          box-sizing: border-box;
                          width: 130px;
                          height: 160px;
                          border: 1px solid #ccc;
                          position: absolute;
                          top: 200px;
                          left: 410px;
                          img {
                              margin: 15px;
                              width: 100px;
                              height: 100px;
                          }
                          p {
                              text-align: center;
                          }
                      }
                  }
                  .content-right {
                      width: 60%;
                      h2 {
                          margin: 30px 0;
                      }
                      .share-image {
                           display: inline-block;
                            .image-container{
                                  display: inline-block;
                                  overflow: hidden;
                                  margin-bottom: 5px;
                                  width: 270px;
                                  height: 163px;
                                  border-width: 1px;
                                  border-radius: 4px;
                                  border-color: $border-color;
                                  vertical-align: top;
                                  @include box-sizing();
                                    &.preview {
                                        border-style: solid;
                                        background-repeat: no-repeat;
                                        background-size: contain;
                                        background-position: center center;

                                        &:hover {
                                            .preview-mask {
                                                display: block;
                                            }
                                        }

                                        .preview-mask {
                                            position: relative;
                                            display: none;
                                            width: 100%;
                                            height: 100%;
                                            background: rgba(0, 0, 0, 0.5);
                                            color: #fff;

                                            .action-toolbar {
                                                position: absolute;
                                                top: 0;
                                                right: 0;

                                                .icon {
                                                    padding-right: 6px;
                                                    font-size: 18px;
                                                    cursor: pointer;
                                                    color: #fff;
                                                }
                                            }
                                        }
                                    }
                                    &.upload {
                                        position: relative;
                                        border-style: dashed;
                                        vertical-align: top;
                                        text-align: center;
                                        cursor: pointer;

                                        &:hover {
                                            border-color: $theme;
                                        }
                                        &.error {
                                            border-color: $red;
                                            .icon {
                                                color: $red;
                                            }
                                        }
                                        .upload-tips {
                                            position: absolute;
                                            top: 50%;
                                            left: 50%;
                                            transform: translate(-50%, -50%);
                                        }

                                        input {
                                            display: none;
                                        }

                                        .icon-xinjian {
                                            font-size: 32px;
                                            color: $theme;
                                        }
                                    }
                              }
                      }
                      .btn-bto {
                          display: flex;
                          margin-top: 30px;
                      }
                  }
              }
        }
       .modal-sucess {
          h3 {
              margin: 0 0 20px 200px;
          }
          input {
              margin: 0 20px 0 180px;
              width: 200px;
          }
          .copy {
              position: absolute;
          }
          .code {
              width: 150px;
              height: 150px;
              margin: 20px 0 20px 200px;
              img {
                  width: 100%;
                  height: 100%;
              }
          }
          .code-succ {
              box-sizing: border-box;
              width: 140px;
              height: 160px;
              border: 1px solid #ccc;
              margin: 10px auto;
              img {
                  margin: 15px;
                  width: 100px;
                  height: 100px;
              }
              p {
                  text-align: center;
              }
          }
          .modal-tip {
              text-align: center;
          }
          .close {
              margin: 30px 0 0 240px;
          }
          .back {
              margin-left: 170px;
          }
       }
    }
</style>
