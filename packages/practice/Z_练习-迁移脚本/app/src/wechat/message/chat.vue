<template>
    <div class="wechat-chat-log">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'message.chat' | t}} {{this.$route.query.nickName}} {{'message.with' | t}}</h1>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view padding margin white-bg">
                <!--0不回复；1图片；2语音；3视频；5图文；'text'文本；6链接（外部页）；7表单；8小程序卡片；9：菜单-->
                <material-editor ref="fansChatReply" :types="[5, 'text', 1, 2, 3, 6, 7, 8, 9]" v-model="material" :no-sub-materials="true"></material-editor>
                <br>
                <br>
                <button type="button" class="btn btn-theme btn-md" @click="sendChatToFans"
                    :disabled="$has('wechat_manage_send_reply')">{{'common.send' | t}}</button>
                <br>
                <br>
                <div class="chat-log-title">
                    <h5 class="content-title pull-left">{{'message.chatLog' | t}}</h5>
                    <button type="button" class="pull-right btn btn-theme btn-md" @click="downloadDetailFlag = true" :disabled="$has('wechat_manage_download_csv')">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-export"></use>
                        </svg>
                        {{'downloadDetails.download' | t}}
                    </button>
                    <div class="log-date pull-right">
                        <calendar format="yyyy-mm-dd hh:ii" :end="today" v-model="startDate" @input="fetchMessages"
                                  :clearBtn="true"/>
                        <span>&nbsp;{{'common.to' | t}}&nbsp;</span>
                        <calendar format="yyyy-mm-dd hh:ii" :start="startDate" :end="today" v-model="endDate"
                                  @input="fetchMessages" :clearBtn="true"/>
                    </div>
                </div>
                <br>
                <div class="chat-log" v-for="(message,index) in msg.msgList">
                    <img :src="message.headImg" alt="" v-if="message.msgId===null">
                    <img :src="message.headImgUrl" alt="" v-else>
                    <div class="user-info">
                        <div class="user-name" v-if="message.msgId===null">{{message.officialName}}</div>
                        <div class="user-name" v-else>{{message.nickName}}</div>
                        <div class="date">{{message.pushDate}}</div>
                        <template v-if="message.msgId!=null">
                            <div class="theme-text" v-if="message.isReplayed">{{'message.replied' | t}}</div>
                            <svg aria-hidden="true" class="reply-icon" @click="reply(index)" v-if="!message.parentId">
                                <use xlink:href="#icon-reply"></use>
                            </svg>
                        </template>
                        <!-- 用户回复的图片 -->
                        <div class="msg-content" v-if="message.msgType === 1 && message.PicUrl">
                            <div class="appmsgSendedItem simple_img">
                                <div class="title_wrp">
                                    <img :src="message.PicUrl"
                                         class="js_media_img icon cover"
                                         @click="showImgPreview(message.PicUrl)">
                                </div>
                            </div>
                        </div>
                        <!-- 公众号给用户回复的图片 -->
                        <div class="msg-content" v-if="message.msgType === 1 && message.material">
                            <div class="appmsgSendedItem simple_img">
                                <div class="title_wrp">
                                    <img :src="message.material.url"
                                         class="js_media_img icon cover"
                                         @click="showImgPreview(message.material.url)">
                                </div>
                            </div>
                        </div>
                        <!--音频-->
                        <div class="msg-content" v-if="message.msgType === 2 && message.material">
                            <div class="qqmusic_audio">
                                <a class="audio_switch" href="javascript:void(0)"
                                   onclick="return false;"
                                   :title="$t('message.play')">
                                    <img v-if="playId === message.material.id" @click="pauseAudio"
                                         class="icon_qqmusic" src="../images/icon_audio.gif"
                                         style="width: 80px;height: 80px;">
                                    <img class="icon_qqmusic" src="../images/audio.png"
                                         @click="playAudio(message.material.id)"
                                         style="width: 80px;height: 80px;" v-else>
                                    <audio :src="message.material.url" controls :ref="'audio' + message.material.id"
                                           preload="metadata" @ended="endedAudio()"></audio>
                                </a>
                            </div>
                        </div>
                        <!--视频-->
                        <div class="msg-content" v-if="message.msgType === 3 && message.material">
                            <div class="rich">
                                <div class="rich_content" style="z-index: 0">
                                    <h4 class="h-title" v-if="message.parentId">
                                        {{message.material.title}}</h4>
                                    <!--<div class="video_info" v-if="message.msgType === 9 ">-->
                                    <!--<em class="time"></em>-->
                                    <!--<em class="res"></em>-->
                                    <!--</div>-->
                                    <div class="video_wrp Js_videoContent">
                                        <div class="wxVideoPlayContent video_player">
                                            <video class="video-js vjs-default-skin" preload="metadata"
                                                   :src="message.material.url"></video>
                                            <div class="video-play">
                                                <img src="../material/images/videoPlay.png"
                                                     @click="playVideo(message.material.url)">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!--图文-->
                        <div class="msg-content" v-if="message.msgType === 5 && message.material">
                            <div class="appmsgSendedItem simple_appmsg">
                                <a class="title_wrp" :title="$t('message.textPreview')" :href="message.material.url"
                                   target="_blank">
                                    <img class="js_media_img icon cover"
                                         :src="message.material.thumbMediaUrl">
                                    <span class="h-title">[{{'wechatContent.appMessage' | t}}]<br>{{message.material.title}}</span>
                                </a>
                                <!--<p class="desc" title="预览文章"><a href="" class="appmsg_desc">{{message.title}}</a></p>-->
                            </div>
                        </div>
                        <!--文本-->
                        <div class="msg text-msg" v-html="contHtml(message.content)" v-if="message.msgType === 4" @click="textClick"></div>
                        <!--位置-->
                        <div class="msg" v-if="message.msgType === 5">
                            {{message.label}}
                        </div>
                        <!--链接-->
                        <!--<div class="msg" v-if="message.msgType === 6">-->
                            <!--{{message.label}}-->
                        <!--</div>-->
                        <!--外部页-->
                        <a class="jump-link" :href="message.externalUrl" target="_blank">
                            <div class="msg-content type-jump" v-if="message.msgType === 6">
                                <img :src="message.externalImageUrl">
                                <div class="replay-type">
                                    <span>[{{$t('data.webPage')}}]</span>
                                    <br>
                                    {{message.externalTitle}}
                                </div>
                            </div>
                        </a>
                        <!--表单-->
                        <div v-if="message.msgType === 7 && message.sheetContent" >
                            <span  v-html="contHtml(decodeURIComponent(message.sheetContent))"></span>
                        </div>
                        <a class="jump-link" :href="message.externalUrl" target="_blank">
                            <div class="msg-content type-jump" v-if="message.msgType ===7&&message.externalImageUrl">
                                <img :src="message.externalImageUrl">
                                <div class="replay-type">
                                    <span>[{{$t('data.form')}}]</span>
                                    <br>
                                    {{message.externalTitle}}
                                </div>
                            </div>
                        </a>
                        <!--小程序卡片-->
                        <div class="msg-content type-jump" v-if="message.msgType===8" @click="$toast($t('message.PCnoView'))">
                            <img :src="message.material.url">
                            <div class="replay-type">
                                <span>[{{$t('data.miniProgram')}}]</span>
                                <br>
                                {{message.miniprogramTitle}}
                            </div>
                        </div>
                        <!--菜单消息-->
                        <div class="msg-content type-jump" v-if="message.msgType===9" @click="menuPreview(message.menuMessage)">
                            <div>
                                <span>[{{$t('QRCode.menuMsg')}}]</span>
                                <br>
                                {{message.menuMessage.headContent}}
                            </div>
                        </div>
                    </div>
                    <reply @cancel="cancel" v-if="isReply === index" @sendFinish="sendFinish"
                           v-model="sendContent" :msgId="message.msgId"
                           :openId="message.openid"></reply>
                </div>
                <pager :total="chatPageTotal" :now="chatPageNumber" @page="handlePage"></pager>
            </div>
        </div>

        <!-- 图片 -->
        <modal :title="$t('message.picPreview')" size="lg" v-if="ifImgPreview" @close="closeImgPreview">
            <img class="preview-image" :src="imgPreview" alt="">
        </modal>
        <!--华为2.4.6下载详情-->
        <download-detail-modal v-if="downloadDetailFlag" :themeModules="'fansReply'"
                               @cancel="cancelDownload" @okDownload="sure"></download-detail-modal>
        <!--菜单消息详情-->
        <modal :title="$t('message.menuView')" v-if="ifMenuPreview" @close="ifMenuPreview=false">
            <div>
                <p class="menu-detail">{{menuMessage.headContent}}</p>
                <p class="menu-detail" v-for="(opt,index) in menuMessage.options" :key="index">
                    {{opt.content}}
                </p>
                <p class="menu-detail">{{menuMessage.tailContent}}</p>
            </div>
        </modal>
    </div>
</template>
<script type="text/babel">
    import Reply from './reply.vue';
    import { WechatApiV1 } from '@/api';
    import emojiList from '../../common/utils/emoji/emojiList';
    import MaterialEditor from '../material/material-editor.vue';
    import {trackEvent} from '../../monitor';
    import format from 'date-fns/format';
    import $ from 'jquery';

    export default {
        components: {
            Reply,
            MaterialEditor
        },
        data() {
            return {
                crumbs: [
                    {name: 'home', text: 'Dmartech'},
                    {name: 'wechatMessageManage', text: this.$t('home.message')},
                    Object.assign({}, this.$route, {text: this.$route.query.nickName})
                ],
                videoUrl: '',
                imgPreview: '',
                ifImgPreview: false,
                chatPageTotal: 0,
                chatPageNumber: 1,
                // 是否回复
                isReply: '',
                // 选中的素材
                material: {},
                msg: {
                    msgList: [],
                    page: 1,
                    totalPage: 1,
                },
                // 发送的内容
                sendContent: '',
                playId: '',
                startDate: '',          // 开始时间
                endDate: '',      // 当前时间
                today: format(new Date(), 'YYYY-MM-DD HH:mm'),

                //下载详情
                downloadDetailFlag:false,

                ifMenuPreview: false,
                menuMessage:{},
            };
        },
        mounted() {
            this.fetchUsersList(this.chatPageNumber);
        },
        methods: {
            // 播放语音
            playAudio(id) {
                const playingAudio = this.playId && this.$refs['audio' + this.playId][0];
                const audio = this.$refs['audio' + id][0];
                // stop previous audio if exists
                if (playingAudio) {
                    playingAudio.pause();
                    playingAudio.currentTime = 0;
                }
                // play current
                this.playId = id;
                if (audio) {
                    audio.play();
                }
            },
            pauseAudio() {
                const audio = this.$refs['audio' + this.playId][0];
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
                this.playId = '';
            },
            endedAudio() {
                this.playId = '';
            },
            fetchUsersList(page) {
                WechatApiV1
                    .getAllMsg(this.startDate, this.endDate, this.$route.query.id, '', '', page, '')
                    .then(({body: {data: {fieldList, totalPage}}}) => {
                        fieldList.forEach((element) => {
                            const emojiReg = /\[.+?\]/g;
                            if (element.parentId && element.content) {
                                let emojiDataTitleList = element.content.match(emojiReg);
                                if (emojiDataTitleList !== null) {
                                    for (let a = 0; a < emojiDataTitleList.length; a++) {
                                        let emojiIndex = emojiList.findIndex(value =>
                                            value.dataTitle === emojiDataTitleList[a]
                                        );
                                        if (emojiIndex !== -1) {
                                            element.content = element.content.replace(new RegExp(`[${emojiList[emojiIndex].dataTitle}.+?]`), `<img src="${emojiList[emojiIndex].url}" data-index="{{${emojiIndex}}" style="width: 20px; height: 20px">`);
                                        }
                                    }
                                }
                            }
                        });
                        this.chatPageTotal = totalPage;
                        this.chatPageNumber = page;
                        this.msg.msgList = fieldList;
                    });
            },
            // 文字带有小程序时点击事件 提示
            textClick(e) {
                if (e.path[0].className === 'mini-pro') {
                    this.$toast(this.$t('message.PCnoView'));
                }
            },
            //文字内容类型处理
            contHtml(cont) {
                let firstHtml = '<div>' + cont + '</div>';
                let content = $(firstHtml);
                if (content.find('a').length > 0) {
                    content.find('a').each((index,ele) => {
                        if ($(ele).attr('data-miniprogram-appid')) {
                            $(ele).addClass('mini-pro');
                            $(ele).removeAttr('href');
                        } else {
                            $(ele).attr({'target': '_blank'});
                        }
                    });
                    return  content.html();
                }
                return cont;
            },
            //向粉丝发送消息
            sendChatToFans() {
                if (!this.$refs.fansChatReply.validAll()) return false;
                //根据类型判断 参数字段
                let materialObj = this.sendMaterialObj(this.material);
                WechatApiV1
                    .sendFansMsg(materialObj)
                    .then(() => {
                        this.$toast(this.$t('common.sendSuccess'), 'success');
                        trackEvent('微信管理-发送粉丝消息');
                        this.fetchUsersList(this.chatPageNumber);
                    });

            },
            //根据类型判断 参数字段
            sendMaterialObj(material){
                let obj = {
                    mediaId:material.mediaId ? material.mediaId : '',//【1.图片/2.音频/3.视频/5.图文/6.外部页/7.表单/8.小程序卡片】素材mediaId
                    msgId: this.$route.query.msgId,
                    openid: this.$route.query.openid,
                    type:material.type === 'text' ? 4 : material.type,//发送类型（1.图片 2.音频 3.视频 4.文字 5.图文 6.外部页 7.跳转表单 8.小程序卡片 9.菜单消息）
                };
                switch (material.type) {
                    case 'text':
                        obj.text = material.content;
                        break;
                    case 5:
                        obj.mediaId = material.articleId;
                        break;
                    case 6:
                        obj.externalTitle = material.exTitle;
                        obj.externalImageUrl = material.url;
                        obj.externalUrl = material.exUrl;
                        obj.externalDescription = material.exDescribe;
                        break;
                    case 7:
                        obj.formReplyType = material.formReplyType;
                        obj.externalImageUrl = material.url || material.externalImageUrl || '';
                        obj.externalTitle = material.exTitle || material.externalTitle || '';
                        obj.externalDescription = material.exDescribe || material.externalDescription || ''; // 2.5.2外部页添加描述
                        obj.externalUrl = material.exUrl || material.customSheetUrl || material.sheetUrl || material.externalUrl || '';
                        obj.sheetContent = material.content;
                        obj.sheetUrl = material.sheetUrl || material.customSheetUrl || '';
                        obj.sheetId = material.id;
                        obj.extensionValueId = material.extensionValueId || '';
                        break;
                    case 8:
                        obj.pagePath = material.pagePath || '';
                        obj.miniprogramAppid = material.miniprogramAppid || '';
                        obj.miniprogramTitle = material.miniprogramTitle || '';
                        break;
                    case 9:
                        obj.menuMessage = material.menuMessage;
                        break;
                }
                return obj;
            },
            // 回复事件
            reply(index) {
                if (this.$has('wechat_manage_send_reply')) return;
                if (this.isReply === '') {
                    this.isReply = index;
                } else {
                    this.isReply = '';
                }
            },
            sendFinish() {
                this.isReply = '';
            },

            cancel() {
                this.isReply = '';
            },
            // 切换页码
            handlePage(newPage) {
                this.fetchUsersList(newPage);
            },
            /*图片*/
            showImgPreview(url) {
                this.ifImgPreview = true;
                this.imgPreview = url;
            },
            /*视频*/
            playVideo(url) {
                this.videoUrl = url;
                window.open(this.videoUrl);
            },
            closeImgPreview() {
                this.ifImgPreview = false;
            },
            fetchMessages() {
                this.fetchUsersList(this.chatPageNumber);
            },
            // 取消
            cancelDownload() {
                //华为2.4.6
                this.downloadDetailFlag = false;
            },
            sure(downloadInfo) {
                this.downloadDetailFlag = false;
                let obj = {
                    startDate: this.startDate,
                    endDate: this.endDate,
                    email: downloadInfo.emailAddress,
                    customerId: this.$route.query.id,
                    formatType: downloadInfo.formatType,
                    dataFormat:downloadInfo.dataFormat,
                    emailSubject: downloadInfo.emailSubject
                };
                WechatApiV1
                    .downloadCSV(obj)
                    .then(() => {
                        this.$toast(this.$t('message.checkoutEmail'));
                        this.startDate = '';
                        this.endDate = '';
                    });
            },
            //菜单消息预览
            menuPreview(menus) {
                this.menuMessage = menus;
                this.ifMenuPreview = true;
            }
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .wechat-chat-log {
        // 图片预览 img 标签
        .preview-image{
            display: block;
            max-width: 100%;
            margin: auto;
        }

        .appmsgSendedItem {
            position: relative;
            min-height: 63px;
        }

        .title_wrp {
            color: #222;
            display: inline-block;
        }

        .title_wrp .cover {
            cursor: pointer;
            background-size: cover;
            width: auto !important;
            height: auto !important;
            max-width: 150px;
            max-height: 150px;
            vertical-align: middle;
            display: inline-block;
            background-position: center;
        }

        .rich {
            position: relative;
            border: 1px solid $border-color;
            background-color: white;
            overflow: hidden;
        }

        .rich_content {
            cursor: pointer;
            position: relative;
            padding: 10px 14px 16px;
        }

        .h-title {
            font-size: 16px;
            font-weight: 400;
            font-style: normal;
            word-wrap: break-word;
            word-break: break-all;
            padding: 10px 0;
            cursor: pointer;
            margin: 0;
        }

        .appmsg_desc {
            display: inline-block;
            line-height: 25px;
        }

        .video_info {
            padding-bottom: 6px;
            font-size: 13px;
            line-height: 20px;

            .time {
                float: left;
            }

            em {
                font-weight: 400;
                font-style: normal;
            }

            .res {
                color: #8d8d8d;
            }
        }

        .video_shot img {
            width: 100%;
            height: 100%;
            max-width: none;
            max-height: none;
        }

        .video_desc {
            word-wrap: break-word;
            word-break: break-all;
        }

        .video_player {
            position: relative;

            .video-play {
                position: absolute;
                z-index: 2;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, .6);

                img {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    margin: auto;
                    width: 48px;
                    height: 48px;
                }

                &:hover {
                    cursor: pointer;
                }
            }

            &:hover {
                .video-play {
                    display: block !important;
                }
            }
        }

        .video_player video {
            width: 300px;
            height: 150px;
        }

        .vjs-default-skin {
            color: #ccc;
        }

        .video-js {
            background-color: #000;
            position: relative;
            z-index: 1;
            padding: 0;
            font-size: 12px;
            vertical-align: middle;
            @include user-select(none);
        }

        .qqmusic_audio {
            margin-top: 10px;
            display: inline-block;

            audio {
                display: none;
            }
        }

        .audio_switch {
            display: inline-block;
        }

        .icon_qqmusic {
            cursor: pointer;
            vertical-align: middle;
            display: inline-block;
        }

        .msg {
            > img {
                width: 100%;
                height: 100%;
                max-width: none;
                max-height: none;
            }
        }
        .jump-link{
            color: #595959;
        }
        .replay-type{
            margin-left: 10px;
        }
        .type-jump{
            cursor: pointer;
        }
        .chat-log-title {
            line-height: 32px;
            @include clearfix();

            .content-title {
                line-height: 32px;
            }

            .log-date {
                margin-right: 16px;
            }
        }

        .chat-log {
            @include box-sizing();
            @include clearfix();
            border: 1px solid $border-color;
            width: 100%;
            padding: 20px;

            img {
                float: left;
                width: 50px;
                height: 50px;
            }

            .user-info {
                position: relative;
                float: left;
                @include width-calc(calc(100% - 50px));
                font-size: 0;

                div {
                    display: inline-block;
                    vertical-align: top;
                    @include box-sizing();
                    font-size: 14px;
                }

                .user-name {
                    padding-left: 10px;
                    width: 30%;
                }

                .date {
                    width: 30%;
                }

                .reply-icon {
                    width: 20px;
                    height: 20px;
                    fill: $theme;
                    cursor: pointer;
                }

                .msg {
                    display: block;
                    margin: 10px;
                    width: 40%;
                    margin: 0 auto;
                    height: 40px;
                    word-wrap: break-word;
                    word-break: break-all;
                }
                .text-msg {
                    a{
                        color: #0000FF;
                    }
                }
                .mini-pro{
                    padding-left: 14px;
                    background: url('../material/material-editor-componets/miniprogram-icon.png') no-repeat left top;
                    background-size: 14px 14px;
                    cursor: pointer;
                }
            }
        }

        .btn.btn-round {
            @include border-radius(5px);
            padding: 0 10px;
        }
        .menu-detail{
            padding: 10px;
        }

    }

</style>
