<template>
    <div class="enterprise-broadcast-detail">
        <div class="content-view">
            <crumbs :crumbs="crumbs" />
        </div>
        <!-- 标题 -->
        <div class="page-head ent-page-head">
            <div class="content-view">
                <h1>{{sendName}}</h1>
                <button type="button" class="toolbar-btn download-export" :disabled="$has('wecom_ent_broadcast_export')"
                    @click="exportDwnload=true" v-title="$t('enterpriseBroadcast.exportData')">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-download"></use>
                    </svg>
                </button>
            </div>
        </div>
        <!-- 主体 -->
        <div class="page-content" ref="pageContent" v-load="scrollLoad">
            <div class="content-view padding margin white-bg en-content-view">
                <!-- 群发详情 -->
                <div class="group-posting-details">
                    <h1>{{'enterpriseBroadcast.groupPostingDetails' | t}}</h1>
                    <div class="info">
                        <p :class="{'min-width-en': language!=='zh-CN'}">{{'enterpriseBroadcast.sendMode' | t}}</p>
                        <b>{{getOptionsName('sendMode',details.sendMode)}}</b>
                    </div>
                    <div class="info">
                        <p :class="{'min-width-en': language!=='zh-CN'}">{{'enterpriseBroadcast.sendType' | t}}</p>
                        <b>{{getOptionsName('sendType',details.sendType)}}</b>
                    </div>
                    <div class="info">
                        <p :class="{'min-width-en': language!=='zh-CN'}">{{'enterpriseBroadcast.sendTime' | t}}</p>
                        <b>{{details.sendTime}}</b>
                    </div>
                    <div class="info">
                        <p :class="{'min-width-en': language!=='zh-CN'}">{{'enterpriseBroadcast.sendState' | t}}</p>
                        <b>{{getOptionsName('sendStatus',details.sendStatus)}}</b>
                    </div>
                    <div class="info">
                        <p :class="{'min-width-en': language!=='zh-CN'}">{{'enterpriseBroadcast.messageType' | t}}</p>
                        <b>{{getOptionsName('messageType',details.messageType)}}</b>
                    </div>
                    <!-- 企业群发 -->
                    <div class="info">
                        <p>{{'enterpriseBroadcast.enterpriseBroadcast' | t}}</p>
                        <b class="click-to-view" @click="previewClick">{{'enterpriseBroadcast.clickToView' | t}}</b>
                    </div>
                </div>
                <!-- 数据统计 -->
                <div class="statistics">
                    <h1>{{'enterpriseBroadcast.statistics' | t}}</h1>
                    <p v-if="details.sendMode===1">{{'enterpriseBroadcast.statisticsTips' | t}}</p>
                </div>
                <ul class="cards">
                    <li v-for="c in cardList">
                        <svg aria-hidden="true" :style="{'fill':c.color}">
                            <use :xlink:href="c.icon"></use>
                        </svg>
                        <div class="text" v-if="c.icon!==cardsTypeList[4]">
                            <div class="top">{{c.name}}</div>
                            <div class="center">{{c.number}}</div>
                            <div class="bottom">{{c.undelivered}} {{c.undeliveredNum}}</div>
                        </div>
                        <div class="text" v-if="c.icon===cardsTypeList[4]">
                            <div class="top">{{c.name}}</div>
                            <div class="center">{{c.number}}</div>
                            <div class="bottom">{{c.nonFriends}}</div>
                        </div>
                        <div class="text warn" v-if="c.icon===cardsTypeList[4]&&(c.other||c.receivedOtherMessages!=='')">
                            <div class="top"> </div>
                            <div class="center">{{c.other}}</div>
                            <div class="bottom">{{c.receivedOtherMessages}}</div>
                        </div>
                    </li>
                </ul>
                <!-- 表格切换 -->
                <div class="tab-links">
                    <p :class="t.checked ? 'tab-link active':'tab-link'" v-for="(t,i) in tabList" @click="selectTab">
                        {{t.name}}</p>
                </div>
                <dynamic-table :chooseList="chooseList" :list="tableList" :theadList="theadList" :loading="loading"
                    :formatNumber="true" v-if="tableShow" @valueChange="valueChange">
                </dynamic-table>
                <p class="loading-complete" v-if="isLoadingComplete&&tableList.length>0">
                    {{'enterpriseBroadcast.noMoreData' | t}}</p>
            </div>
        </div>

        <!-- 下载 -->
        <download-detail-modal :customize-modal-title="$t('enterpriseBroadcast.exportData')" v-if="exportDwnload"
            :theme-modules="sendName" :email-download="true" @cancel="exportDwnload=false" @okDownload="dwnloadData"
            :formatTypeSet="formatTypeSet" />
        <!-- 预览 -->
        <modal v-if="visible" size="lg" neat :title="$t('enterpriseBroadcast.preview')" @close="close">
            <ent-broadcast-preview class="preview-broadcast" :attachments="attachments" :sendContent="sendContent">
            </ent-broadcast-preview>
        </modal>
    </div>
</template>

<script type="text/ecmascript-6">
import { WecomApiV1 } from '@/api';
import { optionsRender, theadRender, getTabLink, fieldRender, filedsSort, filterRender, arrayReduce, statisticsHandle, cardsTypeList, typeList } from './common';
import DynamicTable from './components/dynamic-table.vue';
import { I18N_STORE_NAME } from '@/locales';
import EntBroadcastPreview from './components/ent-broadcast-preview.vue';
import cloneDeep from 'lodash/cloneDeep';

export default {
    name: 'EnterpriseBroadcastDetail',
    data () {
        return {
            exportDwnload: false,//是否开启导出窗口
            //导出的弹窗设置
            formatTypeSet: {
                isExcel: false,
                ExcelIsShow: true,
                CSVIsShow: true
            },
            //群发详情
            details: {
                sendMode: null,//群发方式 1 企业群发 2 应用消息
                sendType: null, //群发类型 1 客户 2 客户群
                sendTime: '',
                sendStatus: null,//群发状态 0 待发送 1 发送中 2 已完成(已发送) 3 已取消
                messageType: null//消息类型 1 立即发送 2 定时发送
            },
            cardsTypeList,//数据统计的图标
            sendName: '',
            tabList: [],//tab的种类
            tableList: [],//列表数据
            allList: [],//全部查出来的数据
            filterList: [],//筛选条件数据
            theadList: [],
            chooseList: [],//筛选条件
            isLoadingComplete: false,//数据是否加载完成
            cardList: [],//数据统计
            visible: false,//预览窗口是否打开
            attachments: [],//素材列表
            sendContent: '',//消息内容
            loading: true,
            tableShow: true
        };
    },
    computed: {
        // 导航
        crumbs () {
            return [
                { name: 'index', text: 'Dmartech' },
                { name: 'entBroadcast', text: this.$t('home.entBroadcast') },
                Object.assign({}, this.$route, { text: this.$t('enterpriseBroadcast.detail') })
            ];
        },
        language () {
            return this.$store.state[I18N_STORE_NAME].lang;
        },
        //tab选中了哪一个
        tabSelect () {
            return this.tabList[0].checked ? 1 : 2;
        },
    },
    methods: {
        //滚动加载,每次加载10条数据
        scrollLoad () {
            if (this.isLoadingComplete) return;
            if (this.allList.length === this.tableList.length) {
                this.isLoadingComplete = true;
                return;
            }
            const list = this.allList.filter((e, i) => {
                return i > this.tableList.length - 1 && i < this.tableList.length + 10;
            });
            this.tableList = [...this.tableList, ...list];
        },
        //预览开启
        previewClick () {
            this.visible = true;
        },
        //预览关闭
        close () {
            this.visible = false;
        },
        //根据key获取选项的名称
        getOptionsName (type, value) {
            if (!value && value !== 0) return;
            return optionsRender(type, value);
        },
        //导出
        dwnloadData (info) {
            const params = {
                fileType: info.formatType,//类型csv/excel
                type: this.details.sendType,//群发类型1. 客户相关 2. 群聊相关
                dataFormat: info.dataFormat,//默认为空(utf-8)  为gbk时该字段必填
                messageId: this.$route.params.id,//详情id
                subject: info.emailSubject,//邮件主题
                email: info.emailAddress//收件地址
            };
            if (this.details.sendMode === 1) {
                WecomApiV1.exportCsvOrExcel(params).then(() => {
                    this.$toast(this.$t('enterpriseBroadcast.checkoutEmail'), 'success');
                    this.exportDwnload = false;
                });
            } else {
                WecomApiV1.exportCsvOrExcelByAgent(params).then(() => {
                    this.$toast(this.$t('enterpriseBroadcast.checkoutEmail'), 'success');
                    this.exportDwnload = false;
                });
            }
        },
        //tab页切换
        selectTab () {
            this.tableShow = false;
            this.isLoadingComplete = false;
            this.tabList.forEach((e) => {
                e.checked = !e.checked;
            });
            this.getThead();
            this.getFilterList(null, true);
        },
        //渲染表格
        getThead () {
            this.theadList = theadRender(this.details.sendMode, this.details.sendType, this.tabSelect);
        },
        /**
         * 获取thead 以及tbody数据
         *  @param params 请求参数
         *  @param isFirst 是否第一次请求
         */
        getFilterList (params, isFirst) {
            this.loading = true;
            if (!params) {
                params = {
                    messageId: this.$route.params.id,
                    sendMode: this.details.sendMode,
                    type: this.tabSelect,//1.群聊/员工 2群主/发送详情
                };
            }

            //员工/联系人详情列表
            if (this.details.sendType === typeList[1].source) {
                WecomApiV1.getContactInfoList(params).then(({ body }) => {
                    this.loading = false;
                    this.getTableListAfter(isFirst, body.data.sendUser);
                })
                    .catch(() => {
                        this.loading = false;
                    });
            } else {
                //群聊/群主列表
                WecomApiV1.getChatList(params).then(({ body }) => {
                    this.loading = false;
                    this.getTableListAfter(isFirst, body.data.chatList);
                })
                    .catch(() => {
                        this.loading = false;
                    });
            }
        },
        //获取表格数据后的数据处理
        getTableListAfter (isFirst, list) {
            const field = fieldRender(this.details.sendMode, this.details.sendType, this.tabSelect);
            if (isFirst) {
                this.filterList = cloneDeep(list);
                this.allList = cloneDeep(filedsSort(list, field));
            } else {
                this.allList = filedsSort(list, field);
            }
            if (this.details.sendType === typeList[2].source && this.tabSelect === 1) {
                this.allList.forEach(e => {
                    if (!e.chatName) e.chatName = this.$t('common.groupChatNameNotSet');
                });
            }

            this.tableList = this.allList.filter((e, i) => {
                return i < 10;
            });
            if (isFirst) this.getChooseList();
            this.$nextTick(() => {
                this.tableShow = true;
            });
            this.isLoadingComplete = false;
        },
        //获取列表数据
        getTableList () {
            const params = {
                messageId: this.$route.params.id,
                sendMode: this.details.sendMode,
                type: this.tabSelect,//1.群聊/员工 2群主/发送详情
            };
            //员工/联系人详情列表
            if (this.details.sendType === typeList[1].source) {
                params.userId = this.chooseList[0].value;
                if (this.tabSelect === 2) params.sendStatus = this.chooseList[1].value;
            } else {
                //群聊/群主详情
                if (this.details.sendMode === 1) {
                    params.sendStatus = this.chooseList[0].value;
                    if (this.tabSelect === 1) params.userId = this.chooseList[1].value;
                } else {
                    if (this.tabSelect === 1) {
                        params.sendStatus = this.chooseList[1].value;
                        params.userId = this.chooseList[0].value;
                    }
                }
            }
            this.getFilterList(params, false);
        },
        //获取表格数据筛选条件的list
        getChooseList () {
            let select = [];//员工筛选列表
            this.filterList.map(e => {
                select.push({
                    id: e.userId || e.owner,
                    name: e.userName || e.owner
                });
            });
            this.chooseList = filterRender(this.tabSelect, this.details.sendMode,
                this.details.sendType, arrayReduce(select));
        },
        //获取详情和统计的数据
        getStatisticsAndDetail () {
            WecomApiV1.getEntBroadcastDetail(this.$route.params.id).then(({ body }) => {
                const detail = body.data.messageDetail;
                this.sendName = detail.sendName;
                this.details = {
                    sendMode: detail.sendMode,
                    sendType: detail.sendType,
                    messageType: detail.messageType,
                    sendTime: detail.sendTime,
                    sendStatus: detail.sendStatus,
                };
                this.attachments = detail.attachments;
                this.sendContent = detail.sendContent || '';
                this.tabList = getTabLink(this.details.sendType);//获取数据统计tab的类型
                this.statisticsRender(detail);//统计数据渲染
                this.getThead();
                this.getFilterList(null, true);
            });
        },
        /**
         * 统计数据的处理
         * sendMode 群发方式 1 企业群发 2 应用消息
         * sendType 群发类型1.客户 2客户群
         */
        statisticsRender (detail) {
            this.cardList = statisticsHandle(detail);
        },
        //筛选条件改变时
        valueChange () {
            this.tableShow = false;
            this.getTableList();
        }
    },
    components: {
        DynamicTable,
        EntBroadcastPreview
    },
    mounted () {
        this.getStatisticsAndDetail();
    },
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../common/scss/base/variables';
@import '../../../common/scss/base/mixin';
.enterprise-broadcast-detail {
    .ent-page-head {
        .download-export {
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            justify-content: center;
            align-items: center;
            border: none;
            background-color: $disabled;
            &:not([disabled]) {
                cursor: pointer;
                background-color: $green;
            }
            svg {
                width: 12px;
                height: 12px;
                fill: white;
            }
        }

        .content-view {
            text-align: left;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        h1 {
            width: 1000px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .page-content {
        .content-view {
            padding: 16px 40px 24px 40px;
            h1 {
                font-size: 20px;
            }
            .group-posting-details {
                margin: 40px 0 20px 0;
                .info {
                    margin: 20px 10px;
                    display: flex;
                    font-size: 14px;
                    p {
                        margin-right: 20px;
                        min-width: 56px;
                    }
                    .min-width-en {
                        min-width: 132px;
                    }
                    b {
                        font-weight: normal;
                    }
                    .click-to-view {
                        color: $green;
                        cursor: pointer;
                    }
                }
            }
            .statistics {
                margin: 40px 0 20px 0;
                display: flex;
                align-items: center;
                > h1 {
                    margin-right: 20px;
                }
                > p {
                    color: #aaaaaa;
                }
            }
            .cards {
                width: 100%;
                display: flex;
                align-items: center;
                li {
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    box-shadow: #ddd 0px 0px 10px 1px;
                    margin-right: 30px;
                    border-radius: 4px;
                    svg {
                        width: 50px;
                        height: 50px;
                        margin-right: 10px;
                    }
                    .text {
                        display: flex;
                        flex-direction: column;
                        margin-left: 20px;
                        min-width: 142px;
                        .top,
                        .bottom {
                            height: 16px;
                        }
                        .center {
                            margin: 15px 0;
                            font-size: 16px;
                            font-weight: bold;
                        }
                        .bottom {
                            color: #aaaaaa;
                        }
                    }
                    .warn {
                        margin-left: 0;
                    }
                }
            }

            .tab-links {
                padding: 13px 0;
                margin-bottom: 10px;
                .tab-link {
                    color: #8c8c8c;
                    cursor: pointer;
                    float: left;
                    font-size: 16px;
                    height: 32px;
                    line-height: 32px;
                    padding: 0 18px;
                    position: relative;
                    text-align: center;
                    user-select: none;
                    ::after {
                        border-bottom: 2px solid transparent;
                        bottom: -13px;
                        content: '';
                        height: 0;
                        left: 0;
                        position: absolute;
                        width: 100%;
                    }
                }
                .active {
                    color: #0cc2a9;
                }
            }
            .loading-complete {
                padding-top: 20px;
                text-align: center;
            }
        }
        .en-content-view {
            min-width: 1780px;
        }
    }
    .preview-broadcast {
        margin: 0 auto;
    }
}
</style>