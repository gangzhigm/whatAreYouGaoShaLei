<template>
    <div class="mass-send-list table">
        <table>
            <thead>
            <tr>
                <th>{{'massSend.messageType' | t}}</th>
                <th>{{'massSend.status' | t}}</th>
                <th>{{'massSend.setting' | t}}</th>
                <th>{{'massSend.sendTime' | t}}</th>
                <th>{{'massSend.operation' | t}}</th>
            </tr>
            </thead>
            <tbody ref="content content-material-imgText">
            <tr v-for="msg in customerList.fieldList" :key="msg.id">
                <td>
                    <!-- 群发类型:1-image;2-voice;3-video;4-text;5-news(图文);6-外部页；7-表单；8-小程序卡片；9菜单消息-->
                    <button class="btn pull-left" :disabled="$has('wechat_message_details_message')">
                        <a class="material-preview" :href="![9, 8, 7, 6, 3].includes(msg.type) ? msg.materialUrl : 'javascript:void(0)'"
                            :target="![9, 8, 7, 6, 3].includes(msg.type) ? '_blank' : ''"
                            :class="{'icon-disable':$has('wechat_message_details_message')}"
                            @click="handleDetail(msg)">
                            <img v-if="msg.type === 1" :src="msg.materialUrl" :alt="msg.materialTitle"/>
                            <img v-else-if="msg.type === 2" src="../../images/audio.png" :alt="msg.materialTitle"/>
                            <!-- <video v-else-if="msg.type === 3" :src="msg.materialUrl" :title="msg.materialTitle"></video> -->
                            <img v-else-if="msg.type === 3" src="../../material/images/videoPlay.png" alt="">
                            <img v-else-if="msg.type === 4" src=".././text.png" :alt="msg.materialTitle"/>
                            <img v-else-if="msg.type === 5" :src="msg.thumbUrl" :alt="msg.materialTitle"/>
                            <img v-else-if="msg.type === 6" :src="msg.materialUrl" :alt="msg.materialTitle"/>
                            <img v-else-if="msg.type === 7" src=".././text.png" :alt="msg.materialTitle"/>
                            <img v-else-if="msg.type === 8" :src="msg.materialUrl" :alt="msg.materialTitle"/>
                            <img v-else-if="msg.type === 9" src=".././text.png" :alt="msg.menuMessage.headContent"/>
                        </a>
                    </button>
                    <button class="btn" :disabled="$has('wechat_message_details_message')">
                        <a class="message-type"
                            :href="[9, 8, 7, 6, 3].includes(msg.type) ? 'javascript:void(0)' : msg.materialUrl"
                            :target="[9, 8, 7, 6, 3].includes(msg.type) ? '' : '_blank'"
                            :class="{'icon-disable':$has('wechat_message_details_message')}"
                            @click="handleDetail(msg)">
                            <span>{{ typeRender(msg.type) }}</span>
                        </a>
                    </button>
                    
                    <p class="message-content disabled-text">
                        <!-- type9菜单消息消息显示头部内容 -->
                        <template v-if="msg.type === 9">
                            {{msg.menuMessage.headContent}}
                        </template>
                        <template v-if="msg.type === 7">
                            <p>{{msg.sheetContent ? decodeURIComponent(str(msg.sheetContent)) : ''}}</p>
                            <p>{{msg.formReplyType === 'external' ? msg.formName : ''}}</p>
                            <p>{{msg.formReplyType === 'external' ? msg.formExtensionValue : ''}}</p>
                        </template>
                        <template v-else>
                            <p>{{str(msg.materialTitle)}}</p>
                            <p>{{str(msg.content)}}</p>
                            <p>{{str(msg.externalTitle)}}</p>
                            <p>{{str(msg.miniprogramTitle)}}</p>
                        </template>
                    </p>
                    <!--2019/01/23 需求更改，客服消息不再展示 点赞数和阅读数-->
                    <!--<p class="disabled-text" v-if="msg.type !== 4">-->
                        <!--{{'massSend.read' | t}}&nbsp;&nbsp;<span class="content-text">{{msg.readMore || 0}}</span>&nbsp;<i></i>&nbsp;{{'massSend.like' | t}}&nbsp;&nbsp;<span-->
                            <!--class="content-text">{{msg.favorites || 0}}</span>-->
                    <!--</p>-->
                </td>
                <td>
                    <div class="message-state" v-if="msg.sendStatus === 1">
                        {{'common.sendSuccess' | t}}
                        <span class="icon-drop"></span>
                        <div class="state-detail">
                            <p>{{'massSend.success' | t}}{{ msg.successedCounts }}</p>
                            <p>{{'massSend.failure' | t}} {{ msg.errorCount }}</p>
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
                </td>
                <td>
                    <p>{{msg.tagName}} ({{ msg.userCount}}{{'massSend.Users' | t}})</p>
                </td>
                <td>{{msg.startDate ? msg.startDate : '/'}}</td>
                <td>
                    <button class="btn" :disabled="$has('wechat_message_delete_message')">
                        <svg aria-hidden="true" class="action-icon icon-delete" @click="delSentMsg(msg.id)"
                            :class="{'icon-disable':$has('wechat_message_delete_message')}"
                            v-title:top="$t('common.del')">
                            <use xlink:href="#icon-round-close"></use>
                        </svg>
                    </button>
                </td>
            </tr>
            </tbody>
        </table>
        <listEmpty v-if="!customerList.fieldList.length"/>
        <pager :total="customerList.totalPage" :now="customerList.totalRow" @page="handlePage"></pager>
        <modal v-if="text" :title="$t('massSend.textMessage')" @close="text = false">
            <div v-html="content">{{content}}</div>
        </modal>
    </div>
</template>

<script lang="jsx">
    import { ContactApiV1, WechatApiV1 } from '@/api';
    // 发送消息-已发送-客服消息列表
    import {trackEvent} from '../../../monitor';
    import listEmpty from '../../../common/components/placeholder/list-empty.vue';
    import { mapGetters } from 'vuex';

    export default {
        components: {
            listEmpty,
        },
        data() {
            return {
                customerList: {
                    fieldList: [], // 列表
                    // 分页
                    totalPage: 1,
                    totalRow: 1,
                },
                text: false,//文字消息提示框
                // Pall中国限定 所有标签分组列表
                groupList: [],
                content: '', //文字消息内容
            };
        },
        computed: {
            ...mapGetters([
                'isPallUser',
            ]),
        },
        mounted() {
            this.getCustomerData();
            // pall中国用户，获取标签分组
            if (this.isPallUser) {
                ContactApiV1
                    .getGroupsOld()
                    .then(({ body: { data: { groupList } } }) => {
                        this.groupList = groupList[0].groupList;
                    });
            }
        },
        methods: {
            // 获取客服消息列表数据
            getCustomerData() {
                if (this.$store.state.loading) return;
                this.$loading();
                let pageNumber = this.customerList.totalRow;
                WechatApiV1.getCustomerMsg({pageNumber,})
                    .then(data => {
                        this.customerList.fieldList = data.body.data.fieldList;
                        this.customerList.totalPage = data.body.data.totalPage;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            /**
             * 删除客服消息
             * @param id 客服消息 id
             */
            delSentMsg(id) {
                this.$confirm(this.$t('contact.tips'),
                    this.$t('massSend.confirm'))
                    .then(sure => {
                        if (sure) {
                            WechatApiV1.deleteCustomerMsg(id)
                                .then(() => {
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    this.getCustomerData();
                                    trackEvent('微信管理-删除消息发送记录', {id});
                                });
                        }
                    });
            },
            /**
             * 翻页
             * @param newPage 页码
             */
            handlePage(newPage) {
                this.customerList.totalRow = newPage;
                this.getCustomerData();
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
                    case 6: 
                        return this.$t('QRCode.webPage');
                    case 7: 
                        return this.$t('QRCode.forms');
                    case 8: 
                        return this.$t('QRCode.miniApp');
                    case 9: 
                        return this.$t('QRCode.menuMsg');
                }
            },
            /**
             * 菜单消息类型 标题点击 显示详情弹窗
             * @param {object} msg 点击选中项 
             */
            handleMenuMsg(msg) {
                if (this.$has('wechat_message_details_message') || msg.type !== 9) return;
                const renderOptions = msg.menuMessage.options.map(item => {
                    return this.renderOption(item);
                });
                const contentHtml = () => {
                    return (
                        <div style={{ padding: '0 20px', 'font-size': '14px' }}>
                            <p>{msg.menuMessage.headContent}</p>
                            {renderOptions}
                            <p>{msg.menuMessage.tailContent}</p>
                        </div>
                    );
                };
                this.$confirm(this.$t('QRCode.menuMsg'), contentHtml(), '', this.$t('common.close'), false, false);
            },
            // 创建一个div
            renderDom (arg) {
                let domE = document.createElement('div');
                domE.innerHTML = arg;
                return domE;
            },
            handleDetail(msg) {
                let res;
                switch (msg.type) {
                    case 3:
                        // 视频通过审核后返回的是一个mp.weixin.qq.com地址，新页面打开预览
                        // 原视频预览逻辑，当前页弹窗播放，暂时废弃 this.videoUrl = material.url;
                        if (msg.materialUrl.indexOf('mp.weixin.qq.com') !== -1) {
                            window.open(msg.materialUrl, '_blank');
                        } else {
                            this.$toast(this.$t('wechatContent.unPlayable'), 'warn');
                        }
                        break;
                    case 4:
                        res = this.renderDom(msg.content);
                        this.text = true;
                        res.querySelectorAll('a').forEach(ele => {
                            ele.setAttribute('title', ele.getAttribute('href'));
                            ele.setAttribute('target', ele.getAttribute('_blank'));
                            if (ele.getAttribute('data-miniprogram-path')) {
                                ele.setAttribute('title', ele.getAttribute('data-miniprogram-path'));
                            }
                        });
                        this.content = res.outerHTML;
                        break;
                    case 6:
                        window.open(msg.externalUrl, '_blank');
                        break;
                    case 7:
                        if (msg.formReplyType === 'sheet') {
                            if (msg.sheetContent) {
                                this.text = true;
                                let res = this.renderDom(decodeURIComponent(msg.sheetContent));
                                res.querySelectorAll('a').forEach(ele => {
                                    ele.setAttribute('title', ele.getAttribute('data-formname'));
                                    ele.setAttribute('target', ele.getAttribute('_blank'));
                                });
                                this.content = res.outerHTML;
                            } else {
                                window.open(msg.sheetUrl, '_blank');
                            }
                        }
                        break;
                    case 8:
                        this.$toast(this.$t('QRCode.miniCardDec'), 'warn');
                        break;
                    case 9:
                        this.handleMenuMsg(msg);
                }
            },
            /**
             * render菜单消息详情中选项
             * @param {object} item 菜单选项
             * @returns {Vnode}
             * @description 依次返回 '选项名称 分组 标签'，如果存在失效分组或者标签，则会用错误提示代替
             */
            renderOption(item) {
                if (this.isPallUser) {
                    let groupName = '',
                        labelName = '',
                        groupColor = '#6495ED', // CornflowerBlue
                        labelColor = '#00BFFF'; // DeepSkyBlue
                    let group = this.groupList.$getByKey(item.groupId);
                    let label;
                    if (group) {
                        groupName = group.name;
                        label = group.labelList.$getByKey(item.labelId);
                        if (label) {
                            labelName = label.name;
                        } else {
                            labelName = this.$t('massSend.invalidLabel');
                            labelColor = '#f67d7d';
                        }
                    } else {
                        groupName = this.$t('massSend.invalidGroup');
                        labelName = this.$t('massSend.invalidLabel');
                        groupColor = '#f67d7d';
                        labelColor = '#f67d7d';
                    }
                    return (
                        <p>
                            <span style={{ color: '#0000FF', margin: '10px 5px 0 0' }}>{item.content}</span>
                            <span style={{ color: groupColor, margin: '10px 5px' }}>{groupName}</span>
                            <span style={{ color: labelColor, margin: '10px 5px' }}>{labelName}</span>
                        </p>
                    );
                }
                return (
                    <p style={{ color: '#29bdfb', margin: '10px 0' }}>{item.content}</p>
                );
            },
            //去掉html标签
            str(data) {
                if (data) {
                    let reg = /<[^>]+>/gim; 
                    return data.replace(reg, '');
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
