<template>
    <div class="img-text-material-lib">
        <div class="img-text-material-lib-title"> {{'wechatContent.multiMedia' | t}}</div>
        <ul class="multi-media">
            <li class="img" @click="startPick('img')">
                <i></i>
                <span>{{'wechatContent.pics' | t}}</span>
            </li>
            <li class="video" @click="startPick('video')">
                <i></i>
                <span>{{'wechatContent.video' | t}}</span>
            </li>
            <li class="miniprogram" @click="startPick('miniprogram')">
            <i></i>
            <span>{{'wechatContent.miniProgram' | t}}</span>
            </li>
        </ul>
        <!--小程序弹窗-->
        <modal class="miniprogram-modal" v-if="type === 'miniprogram'" :title="$t('wechatContent.insertMiniProgram')" @close="close">
            <div class="insert-type">
                <radio :source="'card'" v-model="miniProgramData.insertType">{{'wechatContent.miniCard' | t}}</radio>
                <radio :source="'text'" v-model="miniProgramData.insertType">{{'form.text' | t}}</radio>
                <radio :source="'image'" v-model="miniProgramData.insertType">{{'wechatContent.pics' | t}}</radio>
            </div>
            <!--插入小程序 卡片-->
            <div v-if="miniProgramData.insertType === 'card'" class="insert-card">
                <div class="form-field">
                    <label class="label">{{'wechatContent.chooseMiniprogram' | t}}：</label>
                    <selector class="mini-program-select lg" 
                        :class="{error: errorMiniprogramText}"
                        v-title:top.line.warn="errorMiniprogramText" 
                        @select="select($event)" 
                        :placeholder="$t('wechatContent.chooseMiniprogram')" 
                        :options="miniprogramList"  
                        :uniqueKey="'miniprogramId'"
                        v-model="miniprogramId"></selector>
                </div>  
                <div class="form-field">
                    <label class="label">{{'wechatContent.cardTitle' | t}}：</label>
                    <input type="text"
                           class="input lg"
                           :class="{error: errorTitleText}"
                           v-title:top.line.warn="errorTitleText"
                           v-model.trim="miniProgramData.title"
                           @focusin="errorTitleText = ''"
                           maxlength="30"
                           :placeholder="$t('wechatContent.enterMiniCardTitle')">
                </div>
                <template v-if="miniprogramId === 0">
                    <div class="form-field">
                        <label class="label">{{'wechatContent.appid' | t}}：</label>
                        <input type="text"
                            class="input lg"
                            :class="{error: errorAppidText}"
                            v-title:top.line.warn="errorAppidText"
                            v-model.trim="miniProgramData.appid"
                            @focusin="errorAppidText = ''"
                            :placeholder="$t('wechatContent.enterAppid')">
                        <svg aria-hidden="true" class="icon icon-help" v-title:right="$t('wechatContent.appidTips')">
                            <use xlink:href="#icon-help"></use>
                        </svg>
                    </div>
                    <div class="form-field">
                        <label class="label">{{'wechatContent.appPath' | t}}：</label>
                        <input type="text"
                            class="input lg"
                            :class="{error: errorAppPathText}"
                            v-title:top.line.warn="errorAppPathText"
                            v-model.trim="miniProgramData.appPath"
                            @focusin="errorAppPathText = ''"
                            :placeholder="$t('wechatContent.enterAppPath')">
                    </div>
                </template> 
                <div class="form-field">
                    <label class="label">{{'wechatContent.pics' | t}}</label>
                    <div class="chosen-material" v-if="miniProgramData.url">
                        <div class="material-preview">
                            <a :href="miniProgramData.url" target="_blank" :title="$t('QRCode.preview')">
                                <img :src="miniProgramData.url">
                            </a>
                        </div>
                        <div class="material-info">
                            <span class="pull-right icon icon-delete"
                                  @click="delMaterial"
                                  v-title:top="$t('QRCode.editorDelete')"></span>
                            <p class="material-name">{{miniProgramData.name}}</p>
                            <p class="material-name">{{miniProgramData.date}}</p>
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
                    <span class="imageTips">{{'wechatContent.imageTips' | t}}</span>
                </div>
            </div>
            <!--插入小程序 文本-->
            <div v-if="miniProgramData.insertType === 'text'" class="insert-text">
                <div class="form-field">
                    <label class="label">{{'wechatContent.chooseMiniprogram' | t}}：</label>
                    <selector class="mini-program-select lg" 
                        :placeholder="$t('wechatContent.chooseMiniprogram')" 
                        :class="{error: errorMiniprogramText}"
                        v-title:top.line.warn="errorMiniprogramText" 
                        @select="select($event)"
                        :options="miniprogramList" 
                        :uniqueKey="'miniprogramId'" 
                        v-model="miniprogramId"></selector>
                    </selector>
                </div> 
                <div class="form-field">
                    <label class="label">{{'wechatContent.linkTitle' | t}}：</label>
                    <input type="text"
                           class="input lg"
                           :class="{error: errorTitleText}"
                           v-title:top.line.warn="errorTitleText"
                           v-model.trim="miniProgramData.title"
                           @focusin="errorTitleText = ''"
                           maxlength="30"
                           :placeholder="$t('wechatContent.enterLinkTitle')">
                </div>
                <template v-if="miniprogramId === 0">
                    <div class="form-field">
                        <label class="label">{{'wechatContent.appid' | t}}：</label>
                        <input type="text"
                            class="input lg"
                            :class="{error: errorAppidText}"
                            v-title:top.line.warn="errorAppidText"
                            v-model.trim="miniProgramData.appid"
                            @focusin="errorAppidText = ''"
                            :placeholder="$t('wechatContent.enterAppid')">
                        <svg aria-hidden="true" class="icon icon-help" v-title:right="$t('wechatContent.appidTips')">
                            <use xlink:href="#icon-help"></use>
                        </svg>
                    </div>
                    <div class="form-field">
                        <label class="label">{{'wechatContent.appPath' | t}}：</label>
                        <input type="text"
                            class="input lg"
                            :class="{error: errorAppPathText}"
                            v-title:top.line.warn="errorAppPathText"
                            v-model.trim="miniProgramData.appPath"
                            @focusin="errorAppPathText = ''"
                            :placeholder="$t('wechatContent.enterAppPath')">
                    </div>
                    <div class="form-field">
                    <label class="label">{{'wechatContent.alternatePage' | t}}：</label>
                    <input type="text"
                           class="input lg"
                           :class="{error: errorLinkText}"
                           v-title:top.line.warn="errorLinkText"
                           v-model.trim="miniProgramData.alternatePage"
                           @focusin="errorLinkText = ''"
                           :placeholder="$t('wechatContent.enterAlternatePage')">
                    <svg aria-hidden="true" class="icon icon-help" v-title:right="$t('wechatContent.appPathTips')">
                        <use xlink:href="#icon-help"></use>
                    </svg>
                </div>
                </template>
            </div>
            <!--插入小程序 图片-->
            <div v-if="miniProgramData.insertType === 'image'" class="insert-image">
                <div class="form-field">
                    <label class="label">{{'wechatContent.appid' | t}}：</label>
                    <input type="text"
                        class="input lg"
                        :class="{error: errorAppidText}"
                        v-title:top.line.warn="errorAppidText"
                        v-model.trim="miniProgramData.appid"
                        @focusin="errorAppidText = ''"
                        :placeholder="$t('wechatContent.enterAppid')">
                    <svg aria-hidden="true" class="icon icon-help" v-title:right="$t('wechatContent.appidTips')">
                        <use xlink:href="#icon-help"></use>
                    </svg>
                </div>
                    <div class="form-field">
                        <label class="label">{{'wechatContent.appPath' | t}}：</label>
                        <input type="text"
                            class="input lg"
                            :class="{error: errorAppPathText}"
                            v-title:top.line.warn="errorAppPathText"
                            v-model.trim="miniProgramData.appPath"
                            @focusin="errorAppPathText = ''"
                            :placeholder="$t('wechatContent.enterAppPath')">
                    </div>
                <div class="form-field">
                    <label class="label">{{'wechatContent.pics' | t}}</label>
                    <div class="chosen-material" v-if="miniProgramData.url">
                        <div class="material-preview">
                            <a :href="miniProgramData.url" target="_blank" :title="$t('QRCode.preview')">
                                <img :src="miniProgramData.url">
                            </a>
                        </div>
                        <div class="material-info">
                            <span class="pull-right icon icon-delete"
                                  @click="delMaterial"
                                  v-title:top="$t('QRCode.editorDelete')"></span>
                            <p class="material-name">{{miniProgramData.name}}</p>
                            <p class="material-name">{{miniProgramData.date}}</p>
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
                    <span v-if="miniProgramData.insertType === 'card'" class="imageTips">{{'wechatContent.imageTips' | t}}</span>
                    <span v-if="miniProgramData.insertType === 'image'" class="imageTips">{{'wechatContent.miniImageTip' | t}}</span>
                </div>
            </div>
            <template v-slot:buttons>
                <input type="button"
                       class="btn btn-md btn-white"
                       :value="$t('common.cancel')"
                       @click="close()"/>
                <input type="button"
                       class="btn btn-md btn-theme"
                       :value="$t('common.confirm')"
                       @click="confirm()"/>
            </template>
        </modal>
        <image-lib v-if="type === 'img' || openLib" :isLocalUp="true" @choose="chooseFinish" @cancel="imageLibCancel"></image-lib>
        <!--<v-audio v-if="type === 'audio'" @choose="chooseFinish" @cancel="imageLibCancel"></v-audio>-->
        <!--<v-video v-if="type === 'video'" @choose="chooseFinish" @cancel="imageLibCancel"></v-video>-->
        <confirm :title="$t('wechatContent.tencentLink')" v-if="type === 'video'" @cancel="type = ''" @confirm="sure">
            <div class="form-field">
                <label class="light-content-text" for="tencent-video-code">{{'wechatContent.tencentCode' | t}}</label>
            </div>
            <input class="input full-width" v-model.trim="confirmValue" type="text" id="tencent-video-code">
        </confirm>
        <!--  上传 -->
        <backdrop v-if="uploading">
            <inline-loading></inline-loading>
            <p style="text-align: center;color: white">{{'wechatContent.materialUploading' | t}}</p>
        </backdrop>
    </div>
</template>
<script type="text/babel">

    import { WechatApiV1 } from '@/api';
    import ImageLib from '../../material-libs/image-lib.vue';
    import {COMMON_URL_REGEXP} from '../../../common/utils/regs.js';
    import Backdrop from './../../../common/components/modal/backdrop.vue';

    export default {
        components: {
            ImageLib,
            Backdrop
        },
        data() {
            return {
                type: '',
                miniProgramData: {                  //添加类型 卡片：card，文本：'text'，图片：'image'
                    insertType: 'card',
                    title: '',
                    appid: '',
                    appPath: '',
                    alternatePage: '',
                    name: '',
                    date: '',
                    url: ''
                },
                errorTitleText: '',                 //标题输入错误或为空提示
                errorLinkText: '',                  //链接输入错误或为空提示
                errorAppidText: '',                 //小程序appid为空提示
                errorAppPathText: '',               //小程序路径为空提示
                errorMiniprogramText: '',           //小程序为空提示
                openLib: false,
                confirmValue: '',
                material: {},
                uploading: false,
                isModify: false,                    //修改小程序
                miniprogramList: [
                    {miniprogramId: 0, name: this.$t('wechatContent.otherMiniprogram')}
                ],                //小程序列表
                miniprogramId: '',                  //小程序id
            };
        },
        watch: {
            'miniProgramData.insertType' (oldval,newval) {
                if (oldval !== newval) {
                    Object.assign(this.miniProgramData,{
                        title: '',
                        appid: '',
                        appPath: '',
                        alternatePage: '',
                        name: '',
                        date: '',
                        url: ''
                    });
                    this.miniprogramId = '';
                }
            }
        },
        mounted(){
            this.getMiniprogramList();
        },
        methods: {
            startPick(type) {
                this.type = type;
            },
            //插入图片素材确认
            chooseFinish(material) {
                if (this.type === 'img') {
                    this.$emit('pick', material);
                    this.type = '';
                } else {
                    let url = material.url.indexOf('http://') > -1 ? material.url.replace('http://','https://') : material.url;
                    let img = new Image();
                    img.src = url;
                    img.onload = () => {
                        if (this.miniProgramData.insertType === 'card' &&
                            (img.width !== 1080 || img.height !== 864)) {
                            this.$toast(this.$t('wechatContent.imageSizeWrong'), 'warn');
                        } else {
                            this.miniChooseImage(material);
                        }
                    };
                }
            },
            //取消插入图片素材
            imageLibCancel() {
                if (this.type === 'img') {
                    this.type = '';
                } else {
                    this.openLib = false;
                }
            },
            //插入视频确认
            sure() {
                if (this.confirmValue === '') {
                    return this.$toast(this.$t('wechatContent.tencentCode'), 'warn');
                }
                const url = this.confirmValue.replace('/txp', '').replace('player', 'preview');
                WechatApiV1
                    .postVideoUrl(url)
                    .then(() => {
                        let material = {
                            type: 3,
                            value: url
                        };
                        this.type = '';
                        this.$emit('pick', material);
                    });
            },
            // 删除所选素材
            delMaterial() {
                this.miniProgramData.name = '';
                this.miniProgramData.url = '';
                this.miniProgramData.date = '';
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
                    let img = new Image();
                    img.src = base64;
                    img.onload = function() {
                        if (_this.miniProgramData.insertType === 'card' &&
                            (img.width !== 1080 || img.height !== 864)) {
                            _this.$toast(_this.$t('wechatContent.imageSizeWrong'), 'warn');
                            _this.uploading = false;
                            return false;
                        }
                        if (!/\.(jpe?g|png|gif|bmp)$/i.test(file.name)) {
                            _this.$toast(_this.$t('wechatContent.picFormatErr'), 'warn');
                            return false;
                        }
                        if (file.size > 1024 * 1024 * 10) {
                            _this.$toast(_this.$t('wechatContent.picSizeError'), 'warn');
                            return false;
                        }
                        _this.uploading = true;
                        WechatApiV1
                            .uploadImg(file, 1, file.name)
                            .then(({body: {message, data}}) => {
                                _this.uploading = false;
                                _this.$toast(message, 'success');
                                _this.miniProgramData.name = data.result[0].name;
                                _this.miniProgramData.url = data.result[0].url;
                                _this.miniProgramData.date = data.result[0].updateDateString;
                            })
                            .catch(() => {
                                _this.uploading = false;
                            });
                    };
                };
            },
            //图片小程序确认
            miniChooseImage(material) {
                this.miniProgramData.name = material.name;
                this.miniProgramData.url = material.url;
                this.miniProgramData.date = material.updateDateString;
                this.openLib = false;
            },
            //插入小程序确认键
            confirm() {
                //校验信息
                if (this.miniProgramData.insertType === 'text') {
                    if (!this.miniprogramId.toString()) {
                        this.errorMiniprogramText = this.$t('wechatContent.selectMiniprogram');
                        return;
                    }
                    if (this.miniProgramData.title.trim() === '') {
                        this.errorTitleText = this.$t('wechatContent.enterLinkTitle');
                        return;
                    }
                    if (!COMMON_URL_REGEXP.test(this.miniProgramData.alternatePage) && this.miniProgramData.alternatePage.trim() !== '') {
                        this.errorLinkText = this.$t('QRCode.badUrl');
                        return;
                    }
                } else {
                    if (this.miniProgramData.url.trim() === '') {
                        this.$toast(this.$t('QRCode.selectCoverMaterial'), 'warn');
                        return;
                    }
                }
                if (this.miniProgramData.insertType === 'card') {
                    if (!this.miniprogramId.toString()) {
                        this.errorMiniprogramText = this.$t('wechatContent.selectMiniprogram');
                        return;
                    }
                    if (this.miniProgramData.title.trim() === '') {
                        this.errorTitleText = this.$t('wechatContent.enterLinkTitle');
                        return;
                    }
                }
                if (this.miniprogramId === 0) {
                    if (this.miniProgramData.appid.trim() === '') {
                        this.errorAppidText = this.$t('wechatContent.enterAppid');
                        return;
                    }
                    if (this.miniProgramData.appPath.trim() === '') {
                        this.errorAppPathText = this.$t('wechatContent.enterAppPath');
                        return;
                    }        
                }
                
                let miniprogram = Object.assign({}, this.miniProgramData, {type: this.type});
                this.isModify ? this.$emit('change', miniprogram) : this.$emit('pick', miniprogram);
                this.close();
            },
            modifyMiniprogram(miniData) {
                this.miniProgramData.insertType = miniData.insertType;
                this.$nextTick(() => {
                    Object.assign(this.miniProgramData, miniData);
                    this.type = 'miniprogram';
                    this.isModify = true;
                });
                this.getMiniAppid(miniData.appid);
            },
            //取消插入内容
            close() {
                this.miniProgramData = {
                    insertType: 'card',
                    title: '',
                    appid: '',
                    appPath: '',
                    alternatePage: '',
                    name: '',
                    date: '',
                    url: ''
                };
                this.isModify = false;
                this.type = '';
                this.miniprogramId = '';
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
            getMiniAppid(appid,officialId){
                WechatApiV1.
                    getAppid(appid,officialId)
                    .then((res)=>{
                        this.miniprogramId = res.body.data.id;
                    });
            },
            select(e){
                this.miniProgramData.title = '';
                if (e.miniprogramId === 0) {
                    this.miniProgramData.appid = '';
                    this.miniProgramData.appPath = '';
                } else {
                    this.miniProgramData.appid = e.appid;
                    this.miniProgramData.appPath = e.path;
                }
                this.errorMiniprogramText = '';
            }
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';

    .img-text-material-lib {
        position: fixed;
        right: calc(50vw - 600px);
        top: $header-height + $toolbar-height + $tab-nav-height + 16px;
        @include box-sizing();
        width: 205px;
        padding: 20px;
        background-color: white;
        z-index: $index-toast;

        .img-text-material-lib-title {
            font-size: 14px;
            margin: 10px 0;
        }

        .multi-media {
            @include box-sizing();
            margin-top: 30px;
            border: 1px solid $border-color;
            li + li {
                border-top: 1px solid $border-color;
            }
            li {
                padding: 15px 20px;
                cursor: pointer;

                &:hover i {
                    background-image: url("images/hover.png");
                }

                i {
                    display: inline-block;
                    vertical-align: top;
                    margin-right: 14px;
                    width: 22px;
                    height: 22px;
                    background: url("images/icon.png") no-repeat;
                }

                span {
                    display: inline-block;
                    vertical-align: top;
                    height: 22px;
                    line-height: 22px;
                    font-size: 14px;
                }
            }
            .img i {
                background-position: 0 2px;
            }
            .video i {
                background-position: 0 -24px;
            }
            .miniprogram{
                i{
                    display: inline-block;
                    vertical-align: top;
                    margin-right: 14px;
                    width: 22px;
                    height: 22px;
                    background: url("../images/icon-miniprogram-gray.png") no-repeat;
                    background-size: contain;
                }
                &:hover i{
                    background: url("../images/icon-miniprogram-green.png") no-repeat;
                    background-size: contain;
                }
            }
        }

        .miniprogram-modal{
            .modal{
                width: 620px;
            }
            .form-field{
                .label{
                    width: 142px;
                }
            }
            .insert-type{
                padding-left: 130px;
                label{
                    margin: 0 50px 20px 0;
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
                width: 190px - 2px;
                height: 150px - 2px;
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
                    margin-top: 25px;
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
                width: 190px;
                height: 183px;
                border: 1px solid $border-color;

                .material-preview {
                    position: relative;
                    height: 152px;
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
                    padding: 0 1em 0;

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
                display: inline-block;
                margin-left: 130px;
                color: $color-light-content;
            }
        }
    }
    .mini-program-select{
        .select-text{
            .select-icon{
                right: 10px;
            }
        }
    }
</style>
