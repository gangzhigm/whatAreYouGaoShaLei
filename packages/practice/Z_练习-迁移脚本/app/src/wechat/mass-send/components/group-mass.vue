<template>
    <div class="mass-send-list table">
        <table>
            <thead>
            <tr>
                <th>{{'massSend.messageType' | t}}</th>
                <th>{{'massSend.status' | t}}</th>
                <th width="230">{{'massSend.originalGraphic' | t}}</th>
                <th>{{'massSend.setting' | t}}</th>
                <th>{{'massSend.sendTime' | t}}</th>
                <th>{{'massSend.operation' | t}}</th>
            </tr>
            </thead>
            <tbody ref="content content-material-imgText">
            <tr v-for="msg in msgList">
                <td>
                    <button class="btn pull-left" :disabled="$has('wechat_message_details_message')">
                        <a class="material-preview"
                            :href="msg.msgtype === 3 ? 'javascript:void(0)' : (msg.msgtype === 5 ? msg.drafMaterialUrl : msg.materialUrl)"
                            :target="msg.msgtype === 3 ? '' : '_blank'" @click="handleDetail(msg)"
                            :class="{'icon-disable':$has('wechat_message_details_message')}">
                            <!-- 群发类型:1-image;2-voice;3-video;4-text;5-news(图文)-->
                            <img v-if="msg.msgtype === 1" :src="msg.materialUrl" :alt="msg.materialTitle"/>
                            <img v-else-if="msg.msgtype === 2" src="../../images/audio.png" :alt="msg.materialTitle"/>
                            <!-- <video v-else-if="msg.msgtype === 3" :src="msg.materialUrl" :title="msg.materialTitle"></video> -->
                            <img v-else-if="msg.msgtype === 3" src="../../material/images/videoPlay.png" alt="">
                            <img v-else-if="msg.msgtype === 4" src=".././text.png" :alt="msg.materialTitle"/>
                            <img v-else-if="msg.msgtype === 5" :src="msg.thumbUrl" :alt="msg.materialTitle"/>
                        </a>
                    </button>
                    <button class="btn" :disabled="$has('wechat_message_details_message')">
                        <a class="message-type" :href="msg.msgtype === 3 ? 'javascript:void(0)' : (msg.msgtype === 5 ? msg.drafMaterialUrl : msg.materialUrl)"
                            :target="msg.msgtype === 3 ? '' : '_blank'"
                            :class="{'icon-disable':$has('wechat_message_details_message')}" @click="handleDetail(msg)">
                            <span>{{ typeRender(msg.msgtype) }}</span>
                        </a>
                    </button>
                    <p class="message-content disabled-text">
                        {{msg.materialTitle}}
                        {{str(msg.text)}}
                    </p>
                    <p v-if="msg.msgtype !== 4" class="disabled-text">
                        {{'massSend.read' | t}}&nbsp;
                        <span class="content-text">{{msg.readMore || 0}}</span>&nbsp;
                        {{'massSend.like' | t}}&nbsp;
                        <span class="content-text">{{msg.favorites || 0}}</span>
                    </p>
                </td>
                <td>
                    <div class="message-state" v-if="msg.sendStatus === 1">
                        {{'common.sendSuccess' | t}}
                        <span class="icon-drop"></span>
                        <div class="state-detail">
                            <p>{{'massSend.success' | t}}{{msg.successedCounts}}</p>
                            <p>{{'massSend.failure' | t}}{{msg.faliedCounts ? msg.faliedCounts : 0}}</p>
                        </div>
                    </div>
                    <div class="message-state" v-if="msg.sendStatus === 0">
                        {{'massSend.tobeSend' | t}}
                        <span class="icon-drop"></span>
                        <div class="state-detail">
                            <p>{{'massSend.timingSend' | t}}</p>
                            <p>{{msg.sendDateString}}</p>
                        </div>
                    </div>
                    <div class="message-state" v-if="msg.sendStatus === 3">
                        {{'common.sendFailed' | t}}
                        <span class="icon-drop"></span>
                        <div class="state-detail">
                            <p>{{'massSend.success' | t}}{{msg.successedCounts ? msg.successedCounts : 0}}</p>
                            <p>{{'massSend.failure' | t}}{{msg.faliedCounts ? msg.faliedCounts : 0}}</p>
                            <!--失败原因仅在  原创校验转载并且联系人选择了停止群发  时显示-->
                            <p v-if="msg.wxErrorNum && msg.wxErrorNum == 'err(30003)'">
                                {{'massSend.reasonFailure' | t}}: {{'massSend.causeFailure' | t}}
                            </p>
                        </div>
                    </div>
                    <!--发送中-->
                    <div class="message-state" v-if="msg.sendStatus === 4">
                        {{'massSend.sending' | t}}
                    </div>
                    <!-- 删除部分群发 -->
                    <div class="message-state" v-if="msg.sendStatus === 5">
                        {{'massSend.sendingPart' | t}}
                    </div>
                    <!-- 已删除群发 -->
                    <div class="message-state" v-if="msg.sendStatus === 6">
                        {{'massSend.sendingAlready' | t}}
                    </div>
                </td>
                <!--非原创图文处理方式-->
                <td>
                    <p v-if="msg.sendIgnoreReprint == 0">{{'massSend.sendStop' | t}}</p>
                    <p v-if="msg.sendIgnoreReprint == 1">{{'massSend.keepSend' | t}}</p>
                </td>
                <td>
                    <p>{{msg.tagName}} ({{ msg.userCount}}{{'massSend.Users' | t}})</p>
                </td>
                <td>{{msg.sendDate ? msg.sendDate : '/'}}</td>
                <td>
                    <button class="btn" :disabled="$has('wechat_message_delete_message')">
                        <svg aria-hidden="true" class="action-icon icon-delete" @click="delSentMsg(msg.id)"
                                :class="{'icon-disable':$has('wechat_message_delete_message')}"
                                v-title:top="$t('common.del')">
                            <use xlink:href="#icon-round-close"></use>
                        </svg>
                    </button>
                    <button class="btn" v-if="msg.msgtype === 3 || msg.msgtype === 5" 
                            @click="delGroup(msg.msgId, msg.id, msg.msgtype, msg.materialTitle)"
                            :disabled="msg.sendStatus === 0 || msg.sendStatus === 2 || msg.sendStatus === 3 || msg.sendStatus === 4 || msg.sendStatus === 6">
                        <svg aria-hidden="true"
                            :class="{'icon-disable': msg.sendStatus === 0 || msg.sendStatus === 2 || msg.sendStatus === 3 || msg.sendStatus === 4 || msg.sendStatus === 6}"
                            class="icon group-delete action-icon"
                            v-title:top="$t('massSend.delgruop')">
                            <use xlink:href="#icon-quxiaofabu"></use>
                        </svg>
                    </button>
                </td>
            </tr>
            </tbody>
        </table>
        <listEmpty v-if="!msgList.length"/>
        <pager :total="totalPage" :now="params.pageNumber" @page="handlePage"></pager>
        <modal v-if="text" :title="$t('massSend.textMessage')" @close="text = false">
            <div v-html="content">{{content}}</div>
        </modal>
        <modal v-if="imageText" 
                :title="messageType === 3 ? $t('massSend.selectVideo') : $t('massSend.selectMessage')"
                @close="imageText = false">
            <p v-if="messageType === 3">{{'massSend.videoTip' | t}}</p>
            <p v-if="messageType === 5">{{'massSend.textTip' | t}}</p>
            <div class="delBox">
                <checkbox class="check-box-one" v-model="articleIdxs" :source="String(1)" :disabled="(delIdxs.indexOf(String(1))) > -1">
                    <div v-if="(delIdxs.indexOf(String(1))) > -1" class="delTem">
                        <h3>{{'massSend.deleted' | t}}</h3>
                    </div>
                    <img v-if="messageType === 5" :src = materiralList.thumbMediaUrl>
                    <img v-if="messageType === 3" src="../../material/images/videoPlay.png" alt="">
                    <p :title="materiralList.title">{{materiralList.title}}</p>
                </checkbox>
                <template v-if="materialItems.length !== 0">
                    <checkbox class="check-box"  v-for="(item, index) in materialItems" 
                        :key="item.id" v-model="articleIdxs" :source="String(index+2)" :disabled="(delIdxs.indexOf(String(index+2))) > -1">
                        <div v-if="(delIdxs.indexOf(String(index+2))) > -1" class="delTem">
                            <h3>{{'massSend.deleted' | t}}</h3>
                        </div>
                        <span :title="item.title">{{item.title}}</span>
                        <img v-if="messageType === 3" src="../../material/images/videoPlay.png" alt="">
                        <img v-if="messageType === 5" class="pull-right materialImg" :src = item.thumbMediaUrl>
                    </checkbox>
                </template>
            </div>
            <template v-slot:buttons>
                <button type="button" class="btn btn-md btn-white" @click="imageText = false" >
                    {{'common.cancel' | t}}
                </button>
                <button type="button" class="btn btn-md btn-theme" @click="delMaterial()">
                    {{'common.confirm' | t}}
                </button>
            </template>
        </modal>
    </div>
</template>
<script lang="jsx" type="text/babel">
    // 发送消息-已发送-群发消息列表
    import { WechatApiV1 } from '@/api';
    import {trackEvent} from '../../../monitor';
    import listEmpty from '../../../common/components/placeholder/list-empty.vue';

    export default {
        components: {
            listEmpty,
        },
        data() {
            return {
                msgList: [], // 群发消息列表
                totalPage: 0, // 总页数
                params: {
                    pageNumber: 1, // 页码
                },
                text: false, //文字消息提示框
                content: '', //文字消息内容
                imageText: false, //群发批量删除图文提示框
                messageType: '', //群发删除消息类型
                deleteAll: null, // 该图文/视频是否全部删除（0.部分删除 1.全部删除）
                articleIdxs: [], // 删除的图文/视频序号（从1开始）
                materiralList: [], // 主素材列表
                materialItems: [], // 子素材列表
                msgId: '', // 群发成成功的msgId
                delIdxs: [], // 删除成功的图文/视频序号
                listArr: ['1'], // 获取所有图文/视频序号
                titleObj: [0], // 删除群发获取标题数组
            };
        },
        mounted() {
            this.fetchSentMsg();
        },
        methods: {
            // 获取群发消息列表
            fetchSentMsg() {
                if (this.$store.state.loading) return;

                this.$loading();
                WechatApiV1
                    .getSentMsg(this.params)
                    .then((res) => {
                        this.msgList = res.body.data.fieldList;
                        this.totalPage = res.body.data.totalPage;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            /**
             * 删除发送消息
             * @param id 群发消息id
             */
            delSentMsg(id) {
                this.$confirm(this.$t('contact.tips'),
                    this.$t('massSend.confirm'))
                    .then(sure => {
                        if (sure) {
                            WechatApiV1
                                .delSentMsg(id)
                                .then(() => {
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    this.fetchSentMsg();
                                    trackEvent('微信管理-删除消息发送记录', {id});
                                });
                        }
                    });
            },
            // 删除单条群发记录
            delGroup(msgId, id, msgtype, materialTitle) {
                this.messageType = msgtype;
                this.msgId = msgId;
                this.articleIdxs = [];
                this.titleObj = [0];
                this.listArr = ['1'];
                WechatApiV1
                    .getMassMaterial(id)
                    .then((res) => {
                        this.materiralList = res.body.data.material;
                        this.materialItems = res.body.data.material.materialItems;
                        this.delIdxs = res.body.data.delIdxs;
                        this.titleObj.push(this.materiralList.title);
                        this.materialItems.forEach((item, index) => {
                            this.listArr.push(String(index + 2));
                            this.titleObj.push(item.title);
                        });
                        if (this.materialItems.length === 0) {
                            this.deleteAll = 1;
                            this.articleIdxs.push(1);
                            const titleHtml = () => {
                                return (
                                    <div>
                                        <p>{this.$t('massSend.confirm')}</p>
                                        <br/>
                                        <p>{materialTitle}</p>
                                    </div>
                                );
                            };
                            this.$confirm(this.$t('contact.tips'),
                                titleHtml())
                                .then(sure => {
                                    if (sure) {
                                        WechatApiV1
                                            .deleteMassMessage(
                                                msgId,
                                                this.deleteAll,
                                                this.articleIdxs
                                            )
                                            .then(() => {
                                                this.$toast(this.$t('common.deleteSuccess'), 'success');
                                                this.fetchSentMsg();
                                                trackEvent('微信管理-删除消息发送记录', {id});
                                            });
                                    }
                                });
                        } else {
                            this.imageText = true;
                        }
                    });
                
            },
            // 确定删除多条群发记录
            delMaterial() {
                let title = [];
                let newArr = this.articleIdxs.concat(this.delIdxs);
                this.deleteAll = 1;
                if (newArr.length !== this.listArr.length) {
                    this.deleteAll = 0;
                } else {
                    newArr.forEach(item => {
                        if (this.listArr.indexOf(item) === -1) {
                            this.deleteAll = 0;
                        }
                    });
                }
                this.titleObj.forEach((item, index) => {
                    this.articleIdxs.forEach(items => {
                        if (Number(items) === index) {
                            title.push(item);
                        }
                    });
                });
                const renderOptions = title.map(item => {
                    return <p class="materTitle" title={item}>{item}</p>;
                });
                const titleHtml = () => {
                    return (
                        <div>
                            <p>{this.$t('massSend.delOk')}</p>
                            {renderOptions}
                        </div>
                    );
                };
                this.$confirm(this.$t('contact.tips'), titleHtml())
                    .then(sure => {
                        if (sure) {
                            WechatApiV1
                                .deleteMassMessage(
                                    this.msgId,
                                    this.deleteAll,
                                    this.articleIdxs
                                )
                                .then(() => {
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    this.fetchSentMsg();
                                    this.imageText = false;
                                });
                        }
                    });
               
            },
            /**
             * 翻页
             * @param newPage 页码
             */
            handlePage(newPage) {
                this.params.pageNumber = newPage;
                this.fetchSentMsg();
            },
            /**
              * 素材类型回显
              * @param {number} type 素材类型
              * 
              */
            typeRender(type) {
                switch (type) {
                    case 1: 
                        return this.$t('QRCode.pics');
                    case 2: 
                        return this.$t('QRCode.audio');
                    case 3: 
                        return this.$t('QRCode.video');
                    case 4: 
                        return this.$t('QRCode.text');
                    case 5: 
                        return this.$t('QRCode.appMsg');
                }
            },
            //去掉html标签
            str(data) {
                if (data) {
                    let reg = /<[^>]+>/gim; 
                    return data.replace(reg, '');
                }
            },
            // 创建一个div
            renderDom (arg) {
                let domE = document.createElement('div');
                domE.innerHTML = arg;
                return domE;
            },
            handleDetail(msg) {
                // 视频通过审核后返回的是一个mp.weixin.qq.com地址，新页面打开预览
                // 原视频预览逻辑，当前页弹窗播放，暂时废弃 this.videoUrl = material.url;
                if (msg.msgtype === 3) {
                    if (msg.materialUrl.indexOf('mp.weixin.qq.com') !== -1) {
                        window.open(msg.materialUrl, '_blank');
                    } else {
                        this.$toast(this.$t('wechatContent.unPlayable'), 'warn');
                    }
                }
                // 文字类型弹窗事件
                if (msg.msgtype === 4) {
                    let res = this.renderDom(msg.text);
                    this.text = true;
                    res.querySelectorAll('a').forEach(ele => {
                        ele.setAttribute('title', ele.getAttribute('href'));
                        ele.setAttribute('target', ele.getAttribute('_blank'));
                        if (ele.getAttribute('data-miniprogram-path')) {
                            ele.setAttribute('title', ele.getAttribute('data-miniprogram-path'));
                        }
                    });
                    this.content = res.outerHTML;
                }
            },
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';
    @import '../mass';
</style>
