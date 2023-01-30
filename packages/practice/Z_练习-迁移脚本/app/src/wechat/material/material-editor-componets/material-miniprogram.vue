<template>
    <div class="miniprogram-content" :class="{ 'is-checking': isChecking}">
        <template v-if="!isChecking || material.miniprogramTitle">
            <div class="form-field">
                <label class="label">{{'wechatContent.chooseMiniprogram' | t}}：</label>
                <selector class="lg" 
                    :class="{error: errorMiniprogramText}"
                    v-title:top.line.warn="errorMiniprogramText" 
                    @select="select($event)" 
                    :placeholder="$t('wechatContent.chooseMiniprogram')" 
                    :options="miniprogramList" 
                    :uniqueKey="'miniprogramId'" 
                    :value="miniprogramId = material.miniprogramId" 
                    v-model="miniprogramId"></selector>
            </div>
            <div class="form-field">
                <label class="label">{{'wechatContent.cardTitle' | t}}：</label>
                <input v-if="!isChecking"
                    type="text"
                    class="input lg"
                    :class="{error: errorTitleText}"
                    v-title:top.line.warn="errorTitleText"
                    @focusin="errorTitleText = ''"
                    :value="material.miniprogramTitle"
                    @input="emit({miniprogramTitle: $event.target.value.trim()})"
                    maxlength="30"
                    :placeholder="$t('wechatContent.enterMiniCardTitle')">
                <span v-else>{{ material.miniprogramTitle }}</span>
            </div>
            <template v-if="miniprogramId === 0">
                <div class="form-field">
                    <label class="label">{{'wechatContent.appid' | t}}：</label>
                    <input v-if="!isChecking"
                        type="text"
                        class="input lg"
                        :class="{error: errorAppidText}"
                        v-title:top.line.warn="errorAppidText"
                        @focusin="errorAppidText = ''"
                        :value="material.miniprogramAppid"
                        @input="emit({miniprogramAppid: $event.target.value.trim()})"
                        :placeholder="$t('wechatContent.enterAppid')">
                    <span v-else>{{ material.miniprogramAppid }}</span>
                    <svg aria-hidden="true" class="icon icon-help" v-title:right="$t('wechatContent.appidTips')">
                        <use xlink:href="#icon-help"></use>
                    </svg>
                </div>
                <div class="form-field">
                    <label class="label">{{'wechatContent.appPath' | t}}：</label>
                    <input v-if="!isChecking"
                        type="text"
                        class="input lg"
                        :class="{error: errorPagePathText}"
                        v-title:top.line.warn="errorPagePathText"
                        @focusin="errorPagePathText = ''"
                        :value="material.pagePath"
                        @input="emit({pagePath: $event.target.value.trim()})"
                        :placeholder="$t('wechatContent.enterAppPath')">
                    <span v-else>{{ material.pagePath }}</span>
                </div>
            </template>
            <div class='form-field'>
                <label class="label">{{'QRCode.pics' | t}}：</label>
                <div class="chosen-material" v-if="material.url || material.materialId">
                    <div class="material-preview">
                        <a :href="material.url" target="_blank" :title="$t('QRCode.preview')">
                            <img :src="material.url">
                        </a>
                    </div>
                    <div class="material-info">
                        <span v-if="!isChecking"
                            class="pull-right icon icon-delete"
                            @click="delMaterial"
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
                <span v-if="!isChecking" class="imageTips">{{'wechatContent.miniImageTip' | t}}</span>
                <!--  上传 -->
                <backdrop v-if="uploading">
                    <inline-loading></inline-loading>
                    <p style="text-align: center;color: white">{{'wechatContent.materialUploading' | t}}</p>
                </backdrop>
            </div>
            <image-lib v-if="openLib" :official-id="officialId" @choose="choosePic" @cancel="openLib = false"></image-lib>
        </template>
        <span v-else>{{ 'common.noData' | t }}</span>
    </div>
</template>
<script type="text/babel">
    import Backdrop from './../../../common/components/modal/backdrop.vue';
    import { WechatApiV1 } from '@/api';
    import ImageLib from '../../material-libs/image-lib.vue';
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
                errorAppidText: '',
                errorTitleText: '',
                errorPagePathText: '',
                errorMiniprogramText: '',
                openLib: false,
                uploading: false,
                miniprogramList: [
                    {miniprogramId: 0, name: this.$t('wechatContent.otherMiniprogram')}
                ],     //小程序列表
                miniprogramId: '',       //小程序id
            };
        },
        mounted(){
            this.getMiniprogramList(this.officialId);
        },
        methods: {
            // 选择图片素材
            choosePic(material) {
                let url = material.url.indexOf('http://') > -1 ? material.url.replace('http://','https://') : material.url;
                let img = new Image();
                img.src = url;
                img.onload = () => {
                    this.openLib = false;
                    material.materialId = material.mediaId;
                    this.emit(material);
                };
            },
            // 删除所选素材
            delMaterial() {
                this.openLib = false;
                this.emit({
                    mediaId: '',
                    name: '',
                    updateDateString: '',
                    url: '',
                    materialId: '',
                    id: ''
                });
            },
            // 上传图片
            uploadImage(e) {
                let _this = this;
                const file = e.target.files[0];
                e.target.value = '';
                let fileReader = new FileReader();
                fileReader.readAsDataURL(file);
                fileReader.onload = function() {
                    let base64 = this.result;
                    if (!/\.(jpe?g|png|gif|bmp)$/i.test(file.name)) {
                        _this.$toast(_this.$t('wechatContent.picFormatErr'), 'warn');
                        return false;
                    }
                    if (file.size > 1024 * 1024 * 10) {
                        _this.$toast(_this.$t('wechatContent.picSizeError'), 'warn');
                        return false;
                    }
                    let img = new Image();
                    img.src = base64;
                    img.onload = function() {
                        _this.uploading = true;
                        WechatApiV1
                            .uploadImg(file, 1, file.name, this.officialId)
                            .then(({body: {message, data}}) => {
                                _this.$toast(message, 'success');
                                data.result[0].materialId = data.result[0].mediaId;
                                _this.uploading = false;
                                _this.emit(data.result[0]);
                            })
                            .catch(() => {
                                _this.uploading = false;
                            });
                    };
                };
            },
            // 校验标题
            validTitle() {
                if (!this.material.miniprogramTitle) {
                    this.errorTitleText = this.$t('wechatContent.enterMiniCardTitle');
                    return false;
                }
                this.errorTitleText = '';
                return true;
            },
            // 校验appid
            validAppid() {
                if (!this.material.miniprogramAppid) {
                    this.errorAppidText = this.$t('wechatContent.enterAppid');
                    return false;
                }
                this.errorAppidText = '';
                return true;
            },
            // 校验pagePath
            validPagePath() {
                if (!this.material.pagePath) {
                    this.errorPagePathText = this.$t('wechatContent.enterAppPath');
                    return false;
                }
                this.errorPagePathText = '';
                return true;
            },
            // 校验素材封面
            validCover() {
                if (!this.material.materialId || !this.material.name || !this.material.url) {
                    this.$toast(this.$t('QRCode.selectCoverMaterial'), 'warn');
                    return false;
                }
                return true;
            },
            // 校验小程序
            validMiniprogram(){
                if (this.miniprogramId === undefined || this.miniprogramId === '') {
                    this.errorMiniprogramText = this.$t('wechatContent.selectMiniprogram');
                    return false;
                }
                this.errorMiniprogramText = '';
                return true;
            },
            emit(material) {
                this.$emit('change', material);
            },
            // 获取小程序列表
            getMiniprogramList(id) {
                WechatApiV1.
                    selectMiniprogram(id)
                    .then((res)=>{
                        res.body.data.list.map((item)=>{
                            return this.miniprogramList.unshift(item);
                        });
                    });
            },
            select(e){
                this.errorMiniprogramText = '';
                this.material.miniprogramTitle = '';
                this.material.miniprogramAppid = '';
                this.material.pagePath = '';
                this.material.miniprogramId = e.miniprogramId;
                this.emit({miniprogramId:e.miniprogramId});
                if (e.miniprogramId !== 0) {
                    this.material.miniprogramAppid = e.appid;
                    this.material.pagePath = e.path;
                    this.emit({miniprogramAppid:e.appid});
                    this.emit({pagePath:e.path});
                }
            }
        },
        components: { ImageLib, Backdrop }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .miniprogram-content {
        margin: 0 auto;
        padding: 16px 32px;
        .form-field{
            .label {
                width: 145px;
            }
        }

        .icon {
            fill: currentColor;
            height: 14px;
            margin-left: 1px;
            vertical-align: middle;
            width: 14px;
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
        .imageTips{
            display: block;
            margin-left: 130px;
            color: $color-light-content;
        }
    }
</style>
