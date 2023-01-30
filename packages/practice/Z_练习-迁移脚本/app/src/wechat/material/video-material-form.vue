<template>
    <div class="create-video">
        <div class="content-view margin white-bg" :class="isModal ? 'modal-type' : 'padding'">
            <div class="create-title" v-if="!isModal">
                {{$route.query.id ? $t('wechatContent.editVideo') :  $t('wechatContent.addVideo')}}
            </div>
            <div class="create-content">
                <div class="form-field" v-if=" !$route.query.id">
                    <label class="label">{{'wechatContent.uploadVideo' | t}}</label>
                    {{'wechatContent.uploadVideoTip' | t}}
                </div>
                <div class="form-field" v-if=" !$route.query.id">
                    <label class="label placeholder"> </label>
                    <label class="btn btn-md btn-theme file-btn">
                        {{'wechatContent.selectFile' | t}}
                        <input type="file" accept="video/mp4" @change="seleFile" ref="uploadFile" :disabled="recive">
                    </label>
                    <span class="file-name" :title="videoName">{{videoName}}</span>
                </div>
                <div class="form-field flex">
                    <label class="label" for="title">{{'wechatContent.title' | t}}</label>
                    <input class="input" id="title" type="text" maxlength="16" :disabled="recive" v-model.trim="videoTitle">
                </div>
                <!--<div class="cover">-->
                <!--<span class="cover-title">封面</span>-->
                <!--<div class="cover-hint">-->
                <!--视频转码完成后可以设置封面图-->
                <!--<span>-->
                <!--?-->
                <!--<div>-->
                <!--视频转码完成后，进入编辑页面可以选择视频内的画面作为视频封面。如果不作选择，默认封面为视频的第一帧。-->
                <!--</div>-->
                <!--</span>-->
                <!--</div>-->
                <!--</div>-->
                <!--<div class="type">-->
                <!--<span class="type-title">分类</span>-->
                <!--<div class="selector" @click="seleType" @mouseenter="mouseEnterSele" @mouseleave="mouseLeave">-->
                <!--{{videoType.seleValue}}-->
                <!--</div>-->
                <!--<div class="video-type" v-show="videoType.selection" @mouseenter="mouseEnter" @mouseleave="mouseLeave">-->
                <!--<div>-->
                <!--<span>原创</span>-->
                <!--<ul>-->
                <!--<li v-for="value in videoType.original" @click="seleValue(value)">{{value}}</li>-->
                <!--</ul>-->
                <!--</div>-->
                <!--<div>-->
                <!--<span>咨询</span>-->
                <!--<ul>-->
                <!--<li v-for="value in videoType.news" @click="seleValue(value)">{{value}}</li>-->
                <!--</ul>-->
                <!--</div>-->
                <!--<div>-->
                <!--<span>休闲</span>-->
                <!--<ul>-->
                <!--<li v-for="value in videoType.leisure" @click="seleValue(value)">{{value}}</li>-->
                <!--</ul>-->
                <!--</div>-->
                <!--<div>-->
                <!--<span>影视</span>-->
                <!--<ul>-->
                <!--<li v-for="value in videoType.film" @click="seleValue(value)">{{value}}</li>-->
                <!--</ul>-->
                <!--</div>-->
                <!--</div>-->
                <!--</div>-->
                <!--<div class="tag">-->
                <!--<span class="tag-title">-->
                <!--标签-->
                <!--<span>-->
                <!--?-->
                <!--<div>-->
                <!--标签用回车分开，填写与视频内容相关的标签，你的视频会被合理的分类整理-->
                <!--</div>-->
                <!--</span>-->
                <!--</span>-->
                <!--<input type="text">-->
                <!--</div>-->
                <div class="form-field flex">
                    <label class="label" for="account">{{'wechatContent.introduction' | t}}</label>
                    <textarea id="account" class="textarea" maxlength="200" :disabled="recive" v-model.trim="videoAccount"></textarea>
                </div>
            </div>
            <div class="footer">{{'wechatContent.uploadTip' | t}}</div>
            <div class="save" v-if="!isModal">
                <button v-if="!recive" type="button" class="btn btn-md btn-theme" @click="saveUpload">{{'common.save' | t}}</button>
                <button type="button" class="btn btn-md btn-theme" disabled v-if="recive">{{'wechatContent.saving' | t}}</button>
                <div @click="back" class="btn btn-md btn-theme-border">{{'common.back' | t}}</div>
            </div>
            <inline-loading class="inline-loading" v-if="!isUpload"></inline-loading>
        </div>
    </div>
</template>
<script type="text/babel">
    let timer = null;

    // 判断视频格式
    // const videoReg = /(mp4|flv|f4v|webm|m4v|mov|3gp|3g2|rm|rmvb|wmv|avi|asf|mpg|mpeg|mpe|ts|div|dv|divx|vob|dat|mkv|swf|lavf|cpk|dirac|ram|qt|fli|flc|mod|mp3|aac|ac3|wav|m4v|ogg)$/i;
    const videoReg = /(mp4)$/i;

    import { WechatApiV1 } from '@/api';

    export default {

        mounted() {
            if (this.$route.query.id) {
                WechatApiV1
                    .getMaterial(this.$route.query.id)
                    .then((res) => {
                        this.videoTitle = res.body.data.material.title;
                        this.videoAccount = res.body.data.material.digest;
                        this.videoId = res.body.data.material.id;
                    });
            }
        },
        props:{
            isModal:{
                type: Boolean,
                default: false
            },
            officialId: {
                type: Number
            }
        },
        data() {
            return {
                // 视频名称
                videoName: '',
                // 是否上传完毕
                isUpload: true,
                // 是否点击
                isclick: false,
                recive: false,
                // videoType: {
                // seleValue: '请选择',
                // selection: false,
                // 原创
                // original: ['微电影','网络剧','音乐','搞笑','动漫','游戏'],
                // 资讯
                // news: ['拍客','新闻','体育','财经','科技','汽车','房产'],
                // 休闲
                // leisure: ['生活','时尚','旅游','趣闻','广告','创意','自拍'],
                // 影视
                // film: ['电影','电视剧','综艺','娱乐','纪录片','教育']
                // },
                // 编辑素材时 素材id
                videoId: '',
                // 视频标题
                videoTitle: '',
                // 视频文件
                videoFile: '',
                // 视频描述
                videoAccount: ''
            };
        },
        methods: {
            // 点击分类按钮
            seleType() {
                this.isclick = true;
                this.videoType.selection = true;
            },
            // 选择类型
            seleValue(value) {
                this.videoType.seleValue = value;
                this.videoType.selection = false;
                this.isclick = false;
            },
            mouseLeave() {
                if (this.videoType.selection) {
                    timer = setTimeout(() => {
                        this.videoType.selection = false;
                        this.isclick = false;
                    }, 1000);
                }
            },
            mouseEnter() {
                if (timer) {
                    clearTimeout(timer);
                }
                this.videoType.selection = true;
            },
            mouseEnterSele() {
                if (this.isclick) {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    this.videoType.selection = true;
                }
            },
            // 选择视频
            seleFile() {
                let video = this.$refs.uploadFile.files[0];
                if (videoReg.test(video.name) === false) {
                    this.$toast(this.$t('wechatContent.fileReg'));
                    this.$refs.uploadFile.value = '';
                    return false;
                }
                if (video.size > 10485760) {
                    this.$toast(this.$t('wechatContent.fileSize'));
                    this.$refs.uploadFile.value = '';
                    return false;
                }
                this.videoFile = video;
                this.videoName = video.name;
                this.$refs.uploadFile.value = '';
            },
            saveUpload() {
                if (!this.$route.query.id) {
                    if (this.videoFile === '') {
                        this.$toast(this.$t('wechatContent.uoloadFile'));
                        return false;
                    }
                }
                if (this.videoTitle === '') {
                    this.$toast(this.$t('wechatContent.inputTitle'));
                    return false;
                }
                if (this.isUpload) {
                    if (this.$route.query.id) {
                        this.recive = true;
                        WechatApiV1
                            .editVideo(this.videoAccount, this.videoTitle, this.$route.query.id)
                            .then((res) => {
                                this.$toast(res.body.message, 'success');
                                this.videoAccount = '';
                                this.videoFile = '';
                                this.videoTitle = '';
                                this.isUpload = true;
                                this.videoName = '';
                                this.$router.push({name: 'videoList'});
                                this.recive = false;

                            })
                            .catch(() => {
                                this.$toast(this.$t('wechatContent.internalErr'));
                                this.recive = false;
                            });
                    } else {
                        this.isUpload = false;
                        this.recive = true;
                        WechatApiV1
                            .createVideo(
                                this.videoAccount,
                                this.videoFile,
                                this.videoTitle,
                                3,
                                this.videoFile.name,
                                this.officialId || ''
                            )
                            .then((res) => {
                                this.$toast(res.body.message, 'success');
                                this.videoAccount = '';
                                this.videoFile = '';
                                this.videoTitle = '';
                                this.isUpload = true;
                                this.videoName = '';
                                this.recive = false;
                                if (this.isModal) {
                                    this.$emit('upVideoData',res.body.data.result[0]);
                                } else {
                                    this.$router.push({name: 'videoList'});
                                }
                            })
                            .catch(() => {
                                this.$toast(this.$t('wechatContent.internalErr'));
                                this.recive = false;
                            });
                    }
                }
            },
            back() {
                this.$router.push({name: 'videoList'});
            }
        }
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    $border-color: #e0e0e0;
    .create-video {

        .modal-type{
            position: relative;
            margin: 24px 0 24px -13px;
            .inline-loading{
                position: absolute;
                top: 157px;
                left: 498px;
                margin: 0;
            }
        }

        .create-title {
            font-size: 16px;
            line-height: 48px;
            padding: 0 20px;
            background: $content-bg;
            border: 1px solid $border-color;
        }

        .create-content {
            width: 800px;
            margin: auto;
            padding-top: 50px;
            @include box-sizing();

            .hint {
                margin: 0 auto;
                width: 800px;
                font-size: 0;
                span {
                    display: inline-block;
                    vertical-align: top;
                    font-size: 16px;
                    margin-top: 7px;
                    width: 100px;
                }
                div {
                    @include box-sizing();
                    display: inline-block;
                    width: 700px;
                    font-size: 14px;
                }
            }
            .input-file {
                margin: 20px auto;
                width: 800px;
                height: 35px;
                font-size: 16px;
                div {
                    position: relative;
                    display: inline-block;
                    vertical-align: top;
                    margin-left: 100px;
                    width: 100px;
                    height: 35px;
                    overflow: hidden;
                    line-height: 35px;
                    @include box-sizing();
                    color: #fff;
                    text-align: center;
                    @include border-radius(5px);
                    background: $dark-green;

                    input {
                        position: absolute;
                        top: 0;
                        left: -70px;
                        z-index: 10;
                        @include box-sizing();
                        opacity: 0;
                        width: 230px;
                        height: 35px;
                        background: $dark-green;
                        border: 0;
                        &:hover {
                            cursor: pointer;
                        }
                    }
                }
                span {
                    display: inline-block;
                    vertical-align: top;
                    line-height: 35px;
                }
            }
            .title {
                margin: 30px auto;
                width: 800px;
                font-size: 0;
                label {

                    span {
                        display: inline-block;
                        vertical-align: top;
                        font-size: 16px;
                        margin-top: 7px;
                        width: 100px;
                    }
                    input {
                        @include box-sizing();
                        width: 400px;
                        height: $input-field-height;
                        padding: 0 20px;
                        font-size: 12px;
                        @include border-radius(3px);
                        border: 1px solid $border-color;
                    }
                }
            }
            .cover {
                margin: 30px auto;
                width: 800px;
                height: 30px;
                line-height: 30px;
                font-size: 0;
                span.cover-title {
                    display: inline-block;
                    vertical-align: top;
                    font-size: 16px;
                    width: 100px;
                }
                div.cover-hint {
                    @include box-sizing();
                    display: inline-block;
                    width: 700px;
                    font-size: 14px;
                    color: $color-light-content;
                    line-height: 30px;
                    span {
                        position: relative;
                        display: inline-block;
                        vertical-align: top;
                        margin-top: 7px;
                        line-height: 16px;
                        text-align: center;
                        color: #fff;
                        @include border-radius(50%);
                        width: 16px;
                        height: 16px;
                        background: #999;
                        div {
                            position: absolute;
                            z-index: 10;
                            bottom: -157px;
                            left: 50%;
                            margin-left: -150px;
                            @include box-sizing();
                            display: none;
                            padding: 30px;
                            width: 300px;
                            height: 150px;
                            background: #fff;
                            text-align: left;
                            border: 1px solid $border-color;
                            font-size: 14px;
                            line-height: 20px;
                            color: $color-light-content;
                            &:before {
                                position: absolute;
                                top: -7px;
                                left: 50%;
                                margin-left: -7px;
                                content: '';
                                width: 14px;
                                height: 14px;
                                background: #fff;
                                border: 1px solid $border-color;
                                border-right: transparent;
                                border-bottom: transparent;
                                @include transform(rotate(45deg));
                            }
                        }
                        &:hover {
                            cursor: pointer;
                            div {
                                display: block;
                            }
                        }
                    }
                }
            }
            .type {
                position: relative;
                margin: 30px auto;
                width: 800px;
                height: 35px;
                line-height: 35px;
                font-size: 0;
                span.type-title {
                    display: inline-block;
                    vertical-align: top;
                    font-size: 16px;
                    width: 100px;
                }
                div.selector {
                    position: relative;
                    display: inline-block;
                    @include box-sizing();
                    width: 150px;
                    height: $input-field-height;
                    border: 1px solid $border-color;
                    font-size: 14px;
                    line-height: 33px;
                    text-align: center;
                    &:before {
                        position: absolute;
                        right: 11px;
                        top: 9px;
                        content: '';
                        width: 0;
                        height: 0;
                        border: 5px solid $color-light-content;
                        @include transform(rotate(45deg));
                        border-left: 5px solid transparent;
                        border-top: 5px solid transparent;
                    }
                    &:hover {
                        cursor: pointer;
                        background: $border-color;
                    }
                }
                .video-type {
                    position: absolute;
                    left: 100px;
                    bottom: -202px;
                    width: 560px;
                    height: 200px;
                    background: #fff;
                    font-size: 14px;
                    border: 1px solid $border-color;
                    div {
                        height: 50px;
                        line-height: 50px;
                        span {
                            display: inline-block;
                            height: 50px;
                            vertical-align: top;
                            margin: 0 20px;
                            color: $color-light-content;
                        }
                        ul {
                            display: inline-block;
                            height: 50px;
                            line-height: 50px;
                            li {
                                float: left;
                                padding: 0 17px;
                                &:hover {
                                    cursor: pointer;
                                    background: $border-color;
                                }
                            }
                        }
                    }
                }
            }
            .tag {
                margin: 30px auto;
                width: 800px;
                height: 35px;
                line-height: 35px;
                font-size: 0;
                span.tag-title {
                    display: inline-block;
                    vertical-align: top;
                    font-size: 16px;
                    width: 100px;
                    span {
                        position: relative;
                        display: inline-block;
                        vertical-align: top;
                        margin-top: 9.5px;
                        line-height: 16px;
                        text-align: center;
                        color: #fff;
                        @include border-radius(50%);
                        width: 16px;
                        height: 16px;
                        background: #999;
                        div {
                            position: absolute;
                            z-index: 10;
                            bottom: -137px;
                            left: 50%;
                            margin-left: -100px;
                            @include box-sizing();
                            display: none;
                            padding: 20px;
                            width: 200px;
                            height: 130px;
                            line-height: 20px;
                            background: #fff;
                            text-align: left;
                            border: 1px solid $border-color;
                            font-size: 14px;
                            color: $color-light-content;
                            &:before {
                                position: absolute;
                                top: -7px;
                                left: 50%;
                                margin-left: -7px;
                                content: '';
                                width: 14px;
                                height: 14px;
                                background: #fff;
                                border: 1px solid $border-color;
                                border-right: transparent;
                                border-bottom: transparent;
                                @include transform(rotate(45deg));
                            }
                        }
                        &:hover {
                            cursor: pointer;
                            div {
                                display: block;
                            }
                        }
                    }
                }
                input {
                    display: inline-block;
                    @include box-sizing();
                    padding: 0 20px;
                    width: 700px;
                    height: $input-field-height;
                    border: 1px solid $border-color;
                    font-size: 14px;
                    line-height: 33px;
                }
            }
            .intro {
                margin: 30px auto;
                width: 800px;
                line-height: 35px;
                font-size: 0;
                .intro-title {
                    display: inline-block;
                    vertical-align: top;
                    font-size: 16px;
                    width: 100px;
                }
                textarea {
                    padding: 0 5px;
                    display: inline-block;
                    @include box-sizing();
                    width: 700px;
                    height: 200px;
                    border: 1px solid $border-color;
                    font-size: 14px;
                    resize: none;
                }
            }
        }

        .footer {
            margin: 32px auto;
            line-height: $input-field-height;
            text-align: center;
            color: $color-light-content;
        }

        .save {
            margin: 32px 0;
            text-align: center;
        }

        .file-btn {
            input {
                display: none;
            }
        }

        .file-name {
            display: inline-block;
            vertical-align: top;
            width: 400px;
            @include ellipsis();
            text-indent: 8px;
        }
    }
</style>
