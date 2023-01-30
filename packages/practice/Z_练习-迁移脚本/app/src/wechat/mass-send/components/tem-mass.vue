<template>
    <div class="mass-send-list table">
        <div v-if="isSubscriptionAccount" class="function-disabled-tip">{{'massSend.functionDisabledTip' | t}}</div>
        <template v-else>
            <table>
                <thead>
                <tr>
                    <th>{{'massSend.messageName' | t}}</th>
                    <th>{{'massSend.status' | t}}</th>
                    <th>{{'massSend.setting' | t}}</th>
                    <th>{{'massSend.sendTime' | t}}</th>
                    <th>{{'massSend.resendTimes' | t}}</th>
                    <th>{{'massSend.operation' | t}}</th>
                </tr>
                </thead>
                <tbody ref="content content-material-imgText">
                <tr v-for="msg in temList">
                    <td>
                        <p class="message-content theme-text">
                            <button class="btn"
                                    id="wechat_message_details_message"
                                    :disabled="$has('wechat_message_details_message')"
                                    @click="phoneHander(msg, 'open')">
                                {{msg.wxTemplateShowDto.title}}
                            </button>
                        </p>
                    </td>
                    <td>
                        <div class="message-state" v-if="msg.sendStatus === 1">
                            <!--发送中-->
                            {{'common.sending' | t}}
                            <span class="icon-drop"></span>
                            <div class="state-detail">
                                <!--成功人数 - 失败人数-->
                                <p>{{'massSend.success' | t}} {{ msg.successCount }}</p>
                                <p>{{'massSend.failure' | t}} {{ msg.errorCount }}</p>
                            </div>
                        </div>
                        <div class="message-state" v-if="msg.sendStatus === 2">
                            <!--发送成功-->
                            {{'massSend.sendSuccess' | t}}
                            <span class="icon-drop"></span>
                            <div class="state-detail">
                                <p>{{'massSend.success' | t}} {{ msg.successCount }}</p>
                                <p>{{'massSend.failure' | t}} {{ msg.errorCount }}</p>
                            </div>
                        </div>
                        <div class="message-state" v-if="msg.sendStatus === 3">
                            {{'massSend.tobeSend' | t}}
                            <span class="icon-drop"></span>
                            <div class="state-detail">
                                <p>{{'massSend.timingSend' | t}}</p>
                            </div>
                        </div>
                    </td>
                    <td>
                        <p>{{msg.tagName}}({{msg.userCount}}{{'massSend.Users' | t}})</p>
                    </td>
                    <td>{{msg.sendDate ? msg.sendDate : '/'}}</td>
                    <td class="repeat">{{ msg.resendCount}}</td>
                    <td>
                        <div class="main">
                            <!--<button type="button" class="btn btn-sm btn-theme" @click="updateHander">刷新</button>-->
                            <svg aria-hidden="true" class="action-icon icon-refresh" @click="updateHander"
                                 :class="{'icon-disable': $has('wechat_message_refresh_template')}"
                                 v-title:top="tips[0]">
                                <use xlink:href="#icon-refresh"></use>
                            </svg>
                            <svg aria-hidden="true" class="action-icon icon-reset" @click="againSendHander(msg)"
                                 :class="{'icon-disable': $has('wechat_message_restart_template') ||(msg.resendStatus
                                 ? 'action-icon icon-reset disabled-text cus' : 'action-icon icon-reset theme-text')}"
                                 v-title:top="tips[1]">
                                <use xlink:href="#icon-reset"></use>
                            </svg>
                            <svg aria-hidden="true" class="action-icon icon-delete" @click="delSentMsg(msg)"
                                 :class="{'icon-disable':$has('wechat_message_delete_message')}" v-title:top="tips[2]">
                                <use xlink:href="#icon-round-close"></use>
                            </svg>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
            <listEmpty v-if="!temList.length"/>
            <pager :total="totalPage" :now="params.pageNo" @page="handlePage"></pager>
            <confirm :title="$t('massSend.resend')" class="failError" @confirm="confirmHander" v-if="againState"
                     @cancel="cancelSendHander">
                <p>{{'massSend.failure' | t}}{{ sendErrorNumber }}</p>
                <p>{{'massSend.sendType' | t}}</p>
                <div class="selectType">
                    <selector :options="type"
                              :listName="failSendType"
                              @select="selectHander"/>
                    <div class="timer-format" v-if="sendStatus === 1">
                        <span> {{'massSend.sendTime' | t}}:</span>&nbsp;
                        <calendar :placeholder="$t('massSend.timingSendTime')" :start="nowDate"
                                  format="yyyy-mm-dd hh:ii"
                                  @input="timingHander"/>
                    </div>
                </div>
            </confirm>
            <div class="image-text-preview" v-if="phoneState">
                <div class="center">
                    <div class="phone-hd">{{'wechatContent.youmi' | t}}</div>
                    <div class="count">
                        <p v-for="attr in wxTemplateShowDto.sendContentArr" v-html="attr"></p>
                    </div>
                    <button class="btn btn-lg btn-theme btn-count" @click="phoneHander({}, 'close')">{{'common.close' |
                        t}}
                    </button>
                </div>
            </div>
        </template>
    </div>
</template>
<script type="text/babel">
    // 发送消息-已发送-模板消息列表
    import { WechatApiV1 } from '@/api';
    import {trackEvent} from '../../../monitor';
    import listEmpty from '../../../common/components/placeholder/list-empty.vue';
    import format from 'date-fns/format';

    // 0立即发送 1定时发送

    export default {
        components: {
            listEmpty
        },
        data() {
            return {
                temList: [], // 模板消息列表
                // 分页
                params: {
                    pageNo: 1,
                    pageSize: 10,
                    sort: 0,
                },
                sendCount: {
                    successCount: 0, // 成功数量
                    errorCount: 0, // 错误数量
                    allCount: 0, // 总数
                },
                // 发送类型 0立即发送 1 定时发送
                type: [
                    {
                        id: 0,
                        name: this.$t('massSend.sendImm')
                    },
                    {
                        id: 1,
                        name: this.$t('massSend.timingSend')
                    }
                ],
                // 操作按钮
                tips: [
                    this.$t('massSend.refresh'),
                    this.$t('massSend.resends'),
                    this.$t('common.del')
                ],
                failSendType: this.$t('massSend.sendImm'), // 发送类型
                sendStatus: 0, // 发送状态
                timingValue: '', //定时发送的时间
                againId: -1,  //重新发送的ID
                againState: false, // 是否展示重新发送弹窗
                sendErrorNumber: 0, // 失败人数
                totalPage: 1, //总页数
                totalRow: 1, // 总条数
                wxTemplateShowDto: {},
                phoneState: false, // phone 弹窗是否显示
                nowDate: format(new Date(), 'YYYY-MM-DD HH:mm:ss'), // 当前日期
            };
        },
        computed: {
            //获取账号是否为订阅号
            isSubscriptionAccount() {
                return this.$store.state.user.isSubscriptionAccount;
            }
        },
        mounted() {
            this.fetchTemMsgList();
        },
        methods: {
            // 模板消息列表
            fetchTemMsgList() {
                if (this.$store.state.loading) return;

                this.$loading();
                WechatApiV1.getTemMsgList(this.params)
                    .then(result => {
                        this.temList = result.body.data.wxTemplateSendDTOs;
                        this.totalPage = result.body.data.totalPage;
                        this.totalRow = result.body.data.totalRow;
                        this.$loaded();
                    })
                    .catch(err => {
                        this.$loaded();
                        trackEvent('微信管理-模板消息列表', {err});
                    });
            },
            /**
             * 删除模板消息
             * @param {Object} msg 模板消息
             */
            delSentMsg(msg) {
                if (msg.sendStatus === 1 || msg.sendStatus === 3) {
                    this.$toast(this.$t('massSend.notDelete'), 'warn');
                    return;
                }
                let id = msg.id;
                WechatApiV1.deleteTemMsg(id)
                    .then(() => {
                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                        this.fetchTemMsgList();
                    });
            },
            /**
             * 翻页
             * @param newPage 页码
             */
            handlePage(newPage) {
                this.params.pageNo = newPage;
                this.fetchTemMsgList();
            },
            // 刷新
            updateHander() {
                this.fetchTemMsgList();
            },
            /**
             * 重新发送
             * @param {Object} msg 模板消息
             */
            againSendHander(msg) {
                if (msg.resendStatus === 1) return;
                this.againId = msg.id;
                this.sendErrorNumber = msg.errorCount;
                this.againState = true;
            },
            /**
             * 重新发送-选择发送类型
             * @param {Object} type
             */
            selectHander(type) {
                this.failSendType = type.name;
                this.sendStatus = type.id;
            },
            // 确定重新发送
            confirmHander() {
                if (typeof this.sendStatus === 'number' && !this.sendStatus) {
                    this.resend(this.againId, this.sendStatus);
                } else {
                    if (!this.timingValue) {
                        return this.$toast(this.$t('massSend.selectTime'), 'warn');
                    }
                    this.resend(this.againId, this.sendStatus, this.timingValue);
                }
            },
            /**
             * 重新发送
             * @param id id
             * @param sendStatus    状态
             * @param {String} sendTime      发送时间
             */
            resend(id, sendStatus, sendTime = '') {
                const query = {};
                query.id = id;
                query.sendStatus = sendStatus;
                if (sendTime) {
                    query.sendTime = sendTime;
                }
                WechatApiV1.sendTimingMsg(query)
                    .then(() => {
                        this.againState = false;
                        //刷新模板消息列表
                        this.fetchTemMsgList();
                    })
                    .catch(err => {
                        trackEvent('微信管理-模板消息列表', {err});
                    });
            },
            // 定时发送时间
            timingHander(time) {
                this.timingValue = time;
            },
            // 取消重新发送
            cancelSendHander() {
                this.againState = false;
                this.againId = -1;
                this.timingValue = '';
                this.failSendType = this.$t('massSend.sendImm');
                this.sendStatus = 0;
                this.sendErrorNumber = 0;
            },
            // phone 显示
            phoneHander(msg, state) {
                if (state === 'open') {
                    this.wxTemplateShowDto = msg.wxTemplateShowDto;
                    this.phoneState = true;
                } else {
                    this.wxTemplateShowDto = msg;
                    this.phoneState = false;
                }
            }
        },
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';
    @import '../mass';

    .image-text-preview {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100vh;
        background-color: rgba(0, 0, 0, .2);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: $index-toast;

        .center {
            width: 330px;
            height: 670px;
            background-image: url("../../material/imageTextForm/images/wx_phone.png");
            @include border-radius(10px);
            position: relative;

            .phone-hd {
                position: relative;
                left: 18px;
                top: 85px;
                text-align: center;
                width: 285px;
                height: 38px;
                line-height: 38px;
                color: #fff;
                background: #323232;
            }

            .count {
                position: absolute;
                left: 18px;
                width: 285px;
                top: 170px;
                padding: 0px 20px;
                @include box-sizing();

                p {
                    margin: 6px 0;
                }
            }
        }

        .btn-count {
            position: absolute;
            bottom: 58px;
            left: -100px;
        }
    }
</style>
