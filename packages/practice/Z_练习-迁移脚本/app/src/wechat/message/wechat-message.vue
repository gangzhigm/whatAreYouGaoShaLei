<template>
    <div class="wechat-message">
        <div class="content-view">
            <crumbs/>
            <public-account/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'home.message' | t}}</h1>
                <button type="button" class="pull-right btn btn-theme btn-md" id="wechat_manage_download_csv"
                        :disabled="$has('wechat_manage_download_csv')" @click="downloadDetailFlag = true">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-export"></use>
                    </svg>
                    {{'downloadDetails.download' | t}}
                </button>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view padding margin white-bg">
                <div class="form-field">
                    <calendar format="yyyy-mm-dd hh:ii" :end="today" v-model="startDate" @input="fetchMessages"
                              :clearBtn="true"/>
                    <span>&nbsp;{{'common.to' | t}}&nbsp;</span>
                    <calendar format="yyyy-mm-dd hh:ii" :start="startDate" :end="today" v-model="endDate"
                              @input="fetchMessages" :clearBtn="true"/>
                    <div class="search-box pull-right">
                        <input type="text" v-model.trim="searchValue" :placeholder="$t('message.messageContent')"
                               @keydown.enter="fetchMessages">
                        <svg aria-hidden="true" @click="fetchMessages">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                </div>
                <div class="table">
                    <table>
                        <thead>
                        <tr>

                            <th colspan="3">
                                {{'message.allMessage' | t}}
                                <checkbox v-model="hideMsg" :source="true">{{'message.hideMessage' | t}}</checkbox>
                            </th>
                            <th>{{'message.operation' | t}}</th>
                        </tr>
                        </thead>
                        <tbody class="table-word-break">
                        <!--<tr v-if="newMessage !== 0" class="new-message" @click="getNewMessage">-->
                        <!--<td colspan="3">{{newMessage}}条新消息，点击查看 </td>-->
                        <!--</tr>-->
                        <tr v-for="(message,index) in msg.msgList">
                            <td class="avatar-cell" colspan="1" :class="{open: isReply === index}">
                                <checkbox class="pull-left message-check" :source="message.id" v-model="ids"></checkbox>
                                <img class="avatar-pic" :src="message.headImg"
                                     @click="chat(message.customerId,message.nickName,message.msgId,message.openid)"
                                     v-if="message.msgId==='null'">
                                <img class="avatar-pic" :src="message.headImgUrl"
                                     @click="chat(message.customerId,message.nickName,message.msgId,message.openid)"
                                     v-else>
                            </td>
                            <td colspan="2" style="overflow: visible">
                                <div class="user-info">
                                    <div class="theme-text pull-right" v-if="message.isReplayed">{{'message.replied' |
                                        t}}
                                    </div>
                                    <div class="user-name" v-if="message.msgId===null">{{nick_Name}}</div>
                                    <div class="user-name" v-else>{{message.nickName}}</div>
                                    <div class="date">{{message.pushDate}}</div>
                                    <!--图片-->
                                    <div class="msg-content" v-if="message.msgType === 1">
                                        <div class="appmsgSendedItem simple_img">
                                            <div class="title_wrp">
                                                <img :src="message.PicUrl"
                                                     alt=""
                                                     class="js_media_img icon cover"
                                                     @click="showImgPreview(message.PicUrl)">
                                            </div>
                                        </div>
                                    </div>
                                    <!--音频-->
                                    <div class="msg-content" v-if="message.msgType === 2">
                                        <div class="qqmusic_audio ">
                                            <a class="audio_switch" href="javascript:void(0)"
                                               onclick="return false;"
                                               :title="$t('message.play')">
                                                <img v-if="playId === message.id" @click="pauseAudio"
                                                     class="icon_qqmusic" src="../images/icon_audio.gif">
                                                <img v-else class="icon_qqmusic" src="../images/audio.png"
                                                     @click="playAudio(message.id)">
                                                <audio :src="message.url" :ref="'audio' + message.id" preload="metadata"
                                                       controls @ended="endedAudio()"></audio>
                                            </a>
                                        </div>
                                    </div>
                                    <!--视频-->
                                    <div class="msg-content" v-if="message.msgType === 3">
                                        <div class="rich Js_video">
                                            <div class="rich_content" style="z-index: 0">
                                                <h4 class="h-title" v-if="message.parentId">
                                                    {{message.material.title}}</h4>
                                                <!--<div class="video_info" v-if="message.msgType === 9 ">-->
                                                <!--<em class="time"></em>-->
                                                <!--<em class="res"></em>-->
                                                <!--</div>-->
                                                <div class="video_wrp Js_videoContent">
                                                    <div class="wxVideoPlayContent video_player">
                                                        <video class="video-js vjs-default-skin"
                                                               v-if="message.parentId"
                                                               preload :src="message.material.url"></video>
                                                        <video class="video-js vjs-default-skin" v-else
                                                               preload :src="message.url"></video>
                                                        <div class="video-play">
                                                            <img v-if="message.parentId"
                                                                 src="../material/images/videoPlay.png"
                                                                 alt="" @click="playVideo(message.material.url)">
                                                            <img src="../material/images/videoPlay.png" alt=""
                                                                 @click="playVideo(message.url)" v-else>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!--图文-->
                                    <div class="msg-content" v-if="message.msgType === 5 && message.parentId">
                                        <div class="appmsgSendedItem simple_appmsg">
                                            <a class="title_wrp" :title="$t('message.textPreview')"
                                               :href="message.material.url"
                                               target="_blank">
                                                <img class="js_media_img icon cover"
                                                     :src="message.material.thumbMediaUrl">
                                                <span class="h-title">[{{'wechatContent.appMessage' | t}}]<br>{{message.material.title}}</span>
                                            </a>
                                            <!--<p class="desc" title="预览文章"><a href="" class="appmsg_desc">{{message.title}}</a></p>-->
                                        </div>
                                    </div>
                                    <!--文本-->
                                    <div class="msg" v-if="message.msgType === 4">
                                        {{message.content}}
                                    </div>
                                    <!--位置-->
                                    <div class="msg" v-if="message.msgType === 5">
                                        {{message.label}}
                                    </div>
                                </div>
                                <reply @cancel="cancel" v-if="isReply === index" :msgId="message.msgId" @sendFinish="sendFinish"
                                       v-model="sendContent" :openId="message.openid">
                                </reply>
                            </td>
                            <td :class="{'msg-reply-btu': isReply === index}">
                                <button type="button" class="icon icon-reply"
                                        :disabled="$has('wechat_manage_send_reply')" @click="reply(index)"></button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <list-search-empty v-if="msg.msgList.length === 0 && searchValue"/>
                    <list-empty v-else-if="msg.msgList.length === 0"/>
                </div>
                <pager :total="msg.totalPage" :now="msg.page" @page="handlePage"></pager>

                <!-- 视频 -->
                <modal :title="$t('message.videoPreview')" size="lg" v-if="videoView" @close="closeVideo">
                    <video class="preview-video" ref="video" :src="videoUrl" preload="metadata"
                           controls="controls"></video>
                </modal>
                <!-- 图片 -->
                <modal :title="$t('message.picPreview')" size="lg" v-if="ifImgPreview" @close="closeImgPreview">
                    <img class="preview-image" :src="imgPreview" alt="">
                </modal>
            </div>
            <back-top ref="topper"/>
        </div>

        <!--华为2.4.6下载详情-->
        <download-detail-modal v-if="downloadDetailFlag" :themeModules="'weChatMsg'"
                               @cancel="cancelDownload" @okDownload="sure"></download-detail-modal>

    </div>
</template>
<script type="text/babel">
    import Reply from './reply.vue';
    import { WechatApiV1 } from '@/api';
    import format from 'date-fns/format';
    import {trackEvent} from '../../monitor';

    export default {
        components: {
            Reply
        },
        data() {
            return {
                playId: '',
                videoView: false,
                videoUrl: '',
                newMessage: 0,
                imgPreview: '',
                ifImgPreview: false,
                startDate: '',          // 开始时间
                endDate: '',      // 当前时间
                today: format(new Date(), 'YYYY-MM-DD HH:mm'),
                customerId: '',
                chooseStart: '',    // 选中的开始时间
                chooseEnd: '',      // 选中的结束时间
                searchValue: '',    // search
                hideKeyWord: false,
                isReply: '',        // 是否回复
                nickName: '',
                msg: {
                    msgList: [],
                    page: 1,
                    totalPage: 1,
                    totalRow: 0
                },
                sendContent: '',    // 发送的内容
                hideMsg: false,
                headImg: '',
                nick_Name: '',
                ids: [],
                //下载详情
                downloadDetailFlag: false,
            };
        },
        watch: {
            hideMsg(newVal, oldVal) {
                if (newVal !== oldVal)
                    WechatApiV1
                        .getAllMsg(
                            this.startDate,
                            this.endDate,
                            this.customerId,
                            this.hideMsg,
                            this.searchValue,
                            1,
                            this.nickName
                        )
                        .then((res) => {
                            this.msg.msgList = res.body.data.fieldList;
                            this.msg.totalPage = res.body.data.totalPage;
                        });
            }
        },
        computed: {
            user() {
                return this.$store.state.user;
            },
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            }
        },
        mounted() {
            this.GetAllMsg();
            //华为埋码-公众号运营-留言回复
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P12031991DFA07F');
            }
        },
        methods: {
            // 播放语音
            playAudio(id) {
                const playingAudio = this.$refs['audio' + this.playId];
                const audio = this.$refs['audio' + id];
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
                const audio = this.$refs['audio' + this.playId];
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
                this.playId = '';
            },
            endedAudio() {
                this.playId = '';
            },

            GetAllMsg() {
                WechatApiV1
                    .getAllMsg(this.startDate, this.endDate, this.customerId, '', '', this.msg.page, this.nickName)
                    .then((res) => {
                        this.msg.msgList = res.body.data.fieldList;
                        this.msg.totalPage = res.body.data.totalPage;
                        this.msg.totalRow = res.body.data.totalRow;
                        this.headImg = res.body.data.headImg;
                        this.nick_Name = res.body.data.nickName;
                    });
            },
            fetchMessages() {
                trackEvent('微信管理-消息管理-筛选消息', {
                    start: this.startDate,
                    end: this.endDate,
                    keyword: this.searchValue
                });
                WechatApiV1
                    .getAllMsg(
                        this.startDate, this.endDate, this.customerId, this.hideMsg, this.searchValue, 1, this.nickName
                    )
                    .then((res) => {
                        this.msg.msgList = res.body.data.fieldList;
                        this.msg.totalPage = res.body.data.totalPage;
                        this.msg.page = 1;
                    });
            },
            // 回复事件
            reply(index) {
                if (this.isReply === index) {
                    this.isReply = '';
                } else {
                    this.isReply = index;
                }
            },
            cancel() {
                this.isReply = '';
            },
            handlePage(page) {
                this.msg.page = page;
                WechatApiV1
                    .getAllMsg(
                        this.startDate, this.endDate, this.customerId, this.hideMsg, this.searchValue, page, this.nickName
                    )
                    .then((res) => {
                        this.msg.msgList = res.body.data.fieldList;
                        this.msg.totalPage = res.body.data.totalPage;
                        this.msg.totalRow = res.body.data.totalRow;
                        this.$refs.topper.backTop();
                    });
            },
            chat(id, nickName, msgId, openid) {
                this.$router.push({name: 'chat', query: {id: id, nickName: nickName, msgId: msgId, openid: openid}});
            },
            playVideo(url) {
                this.videoView = true;
                this.videoUrl = url;
            },
            closeVideo() {
                this.videoView = false;
                this.$refs.video.pause();
            },
            // 图片
            showImgPreview(url) {
                this.ifImgPreview = true;
                this.imgPreview = url;
            },
            closeImgPreview() {
                this.ifImgPreview = false;
            },
            // 取消
            cancelDownload() {
                //2.4.6
                this.downloadDetailFlag = false;
            },
            sure(downloadInfo) {
                this.downloadDetailFlag = false;
                let obj = {
                    startDate: this.startDate,
                    endDate: this.endDate,
                    email: downloadInfo.emailAddress,
                    ids: this.ids,
                    isKeyword: this.hideMsg ? 1 : 0,
                    content: this.searchValue,
                    formatType: downloadInfo.formatType,
                    dataFormat:downloadInfo.dataFormat,
                    emailSubject: downloadInfo.emailSubject
                };
                WechatApiV1
                    .downloadCSV(obj)
                    .then(() => {
                        this.$toast(this.$t('message.checkoutEmail'));
                        this.ids = [];
                        this.startDate = '';
                        this.endDate = '';
                        this.searchValue = '';
                        this.hideMsg = false;
                    });
            },
            sendFinish() {
                this.GetAllMsg();
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .wechat-message {

        .table {
            margin-top: 16px;

            .avatar-cell {
                width: 60px;

                &.open {
                    vertical-align: top;
                    padding-top: 20px;
                }

                .avatar-pic {
                    display: block;
                    width: 60px;
                    height: 60px;
                    cursor: pointer;
                }
            }

            .msg-reply-btu {
                vertical-align: top;
                padding-top: 15px;
            }

            .checkbox {
                margin-left: 16px;
            }

            .message-check {
                margin-left: 0;
                margin-right: 16px;
                margin-top: 23px;
            }

            .new-message {
                display: block;
                text-align: center;
                height: 36px;
                line-height: 36px;
                background: #c8e7fc;

                &:hover {
                    cursor: pointer;
                    text-decoration: underline;
                }
            }

            .user-info {
                position: relative;
                padding: 0 16px;
                @include clearfix();

                .user-name {
                    display: inline-block;
                    vertical-align: top;
                    max-width: 30%;
                    margin-right: 10px;
                    @include ellipsis();
                }

                .date {
                    display: inline-block;
                    vertical-align: top;
                    max-width: 30%;
                    @include ellipsis();
                }

                .reply-icon {
                    width: 10%;

                    img {
                        width: 20px;
                        height: 20px;
                        cursor: pointer;
                    }
                }

                .msg {
                    color: $color-light-content;
                    margin: 10px;
                    word-wrap: break-word;
                    word-break: break-all;
                }

                .msg-content {
                    img {
                        width: 60px;
                        cursor: pointer;
                    }
                }
            }

            button.icon-reply {
                @include box-sizing();
                width: 25px;
                height: 25px;
                line-height: 25px;
                padding: 0;
                border: none;
                @include transition();
                cursor: pointer;
                color: $theme;
                background-color: white;

                &:hover {
                    color: $light-theme;
                }

                &:active {
                    color: $dark-theme;
                }
            }
        }

        // 图片预览 img 标签
        // 视频预览 video 标签
        .preview-image,
        .preview-video {
            display: block;
            max-width: 100%;
            margin: auto;
        }
    }

</style>
