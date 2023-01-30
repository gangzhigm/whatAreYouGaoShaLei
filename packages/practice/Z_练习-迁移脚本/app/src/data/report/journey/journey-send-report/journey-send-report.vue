<template>
    <div class="journey-send-report">
        <div class="page-content">
            <div class="show-time">
                <i class="show-time-icon"></i>
                {{'data.dateRule' | t}}
            </div>
            <div class="content-view margin report-header">
                {{'data.reportSource' | t}}
                <journey-task-select :useItems="'overview'" :id="journeyId"
                    :date="dateRange" :need-real-time="true"
                    :source="dataSourceId" :customizePartCuts="partCuts" @select="chosenJourney"/>
                <div v-if="timeZoneData && dataSourceId !== 0" class="report-type">{{'时区信息：' + timeZoneData.name}}<span class="zonedate">{{this.timeZoneDate}}</span></div>
                <div class="report-type">{{'data.reportType' | t}}
                    <span :class="{selected: reportType===1}"
                          @click="selectReportType(1)">{{'data.communications' | t}}</span>
                    <button :class="{selected: reportType===2}"
                            :disabled="$has('datacentre_marketing_task_detail')"
                            class="btn"
                            @click="selectReportType(2)">
                        {{'data.tasks' | t}}
                    </button>
                </div>
            </div>
            <div class="content-view white-bg report-content">
                <!-- 渠道报告内容 -->
                <div class="simplify-table auto-width" v-if="reportType===1">
                    <table>
                        <thead>
                        <tr>
                            <td>{{'data.Communications' | t}}</td>
                            <td>{{'data.Sent' | t}}</td>
                            <td>{{'data.Accept' | t}}</td>
                            <td>{{'data.statisticsTime' | t}}</td>
                            <!-- <td v-if="!$has('datacentre_marketing_task_detail')">{{'data.Actions' | t}}</td> -->
                            <td>{{'data.Actions' | t}}</td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-if="channelLoading">
                            <td colspan="5">
                                <inline-loading/>
                            </td>
                        </tr>
                        <tr v-for="report in channelReportList" :key="report.id" v-else-if="!channelLoading&&channelReportList.length>0">
                            <td>{{report.channelName}}</td>
                            <td>{{report.sent}}</td>
                            <td>{{report.accepted}}</td>
                            <td>{{updateDate}}</td>
                            <td class="task-text">
                                <button :disabled="$has('datacentre_marketing_task_detail')"
                                        class="btn"
                                        @click="getTaskDetail(report)">
                                        {{'data.taskList' | t}}
                                </button>
                            </td>
                        </tr>
                        <tr v-if="!channelLoading&&channelReportList.length === 0">
                            <td colspan="5" class="slim-cell">
                                <list-empty/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <!-- 任务报告内容 -->
                <template v-else>
                    <div class="tab-links">
                        <span class="tab-link" :class="{active: tabType === -1}" @click="changeTabType(-1)">{{'data.all' | t}}</span>
                        <span class="tab-link" :class="{active: tabType === 0}" @click="changeTabType(0)">{{'dragJourney.email' | t}}</span>
                        <span class="tab-link" :class="{active: tabType === 1}" @click="changeTabType(1)">{{'dragJourney.sms' | t}}</span>
                        <span class="tab-link" :class="{active: tabType === 2}" @click="changeTabType(2)">{{'dragJourney.mms' | t}}</span>
                        <span class="tab-link" :class="{active: tabType === 4}" @click="changeTabType(4)">{{'data.massSend' | t}}</span>
                        <span class="tab-link" :class="{active: tabType === 5}" @click="changeTabType(5)">{{'dragJourney.wechatMessages' | t}}</span>
                        <span class="tab-link" :class="{active: tabType === 3}" @click="changeTabType(3)">{{'dragJourney.wechatTemplates' | t}}</span>
                        <span class="tab-link" :class="{active: tabType === 6}" @click="changeTabType(6)">{{'dragJourney.agentMsg' | t}}</span>
                        <span class="tab-link" :class="{active: tabType === 7}" @click="changeTabType(7)">{{'dragJourney.groupMsg' | t}}</span>
                        <div class="pull-right search-box md">
                            <input type="text" :placeholder="$t('data.searchTask')" v-model.trim="keyWords"
                                   @keydown.enter="getTaskReport">
                            <svg aria-hidden="true" @click="getTaskReport">
                                <use xlink:href="#icon-search"></use>
                            </svg>
                        </div>
                    </div>
                    <div class="task-type">
                        <radio :source="false" v-model="taskType" @input="getReport">{{'data.normalTask' | t}}</radio>
                        <radio :source="true" v-model="taskType" @input="getReport">{{'data.realtimeTask' | t}}</radio>
                    </div>
                    <div class="simplify-table">
                        <table>
                            <thead>
                                <tr>
                                    <td>{{'data.taskName' | t}}</td>
                                    <td>{{'data.Sent' | t}}</td>
                                    <td>{{'data.accept' | t}}</td>
                                    <td>{{'data.communication' | t}}</td>
                                    <td>{{'data.type' | t}}</td>
                                    <td>{{'data.timeZone' | t}}</td>
                                    <td>{{'data.startTime' | t}}</td>
                                    <td>{{'data.Actions' | t}}</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="taskLoading">
                                    <td colspan="8">
                                        <inline-loading/>
                                    </td>
                                </tr>
                                <tr v-for="report in taskReportList" :key="report.id" v-else-if="!taskLoading&&taskReportList.length>0">
                                    <td :title="report.taskName">{{report.taskName}}</td>
                                    <td>{{report.sendCount}}</td>
                                    <td>{{report.deliveryCount?report.deliveryCount :0}}</td>
                                    <td>{{getTaskType(report.taskType,report.subType)}}</td>
                                    <td>{{report.journeyType ? $t('dataCenter.realTime') : $t('data.normal')}}</td>
                                    <td>{{'GMT' + (report.timeZone || ' ')}}</td>
                                    <td :title="report.taskDate">{{report.taskDate}}</td>
                                    <td v-if="!taskType||report.taskType===0">
                                        <svg aria-hidden="true" v-title:top="$t('data.report')" class="action-icon action-icon-color"
                                             :class="{'icon-disable':$has('datacentre_marketing_report_marketing')}"
                                             @click="goToTaskReport(report)">
                                            <use xlink:href="#icon-shuju"></use>
                                        </svg>
                                        <svg aria-hidden="true" v-title:top="$t('common.download')" class="action-icon action-icon-color"
                                             @click="goToDownload(report)" v-if="report.taskType!==2">
                                            <use xlink:href="#icon-download"></use>
                                        </svg>
                                    </td>
                                    <td v-else>
                                        {{'data.stayTuned' | t}}
                                    </td>
                                </tr>
                                <tr v-if="!taskLoading&&taskReportList.length === 0">
                                    <td colspan="8" class="slim-cell">
                                        <list-empty v-if="keyWords === ''"/>
                                        <list-search-empty v-else/>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </template>
            </div>
        </div>
        <!--下载弹窗-->
        <download-detail-modal v-if="downloadFlag" :themeModules="journeySendReport"
                               @cancel="downloadFlag=false" @okDownload="wecomSureDownload"></download-detail-modal>
    </div>
</template>
<script>
    import { JourneyApiV1, JourneyApiV3, WecomApiV1 } from '@/api';
    import journeyTaskSelect from '../components/journey-task-select.vue';
    import {TIME_ZONE_RNAGES} from '../../../../common/utils/timeZone';

    const LOCAL_JOURNEY_DATA = 'LOCAL_JOURNEY_DATA';
    const LOCAL_TIME_ZONE_SHOW = 'LOCAL_TIME_ZONE_SHOW';
    const LOCAL_TIME_ZONE_DATE = 'LOCAL_TIME_ZONE_DATE';

    export default {
        data() {
            return {
                dataSourceId: 0,
                dateRange: {
                    startDate: '',
                    endDate: ''
                },
                journeyList: [],
                journeyId: 0,
                totalPage: 1,
                pageNumber: 1,
                loading: false,
                reportType: 1,
                channelReportList: [], // 渠道报告列表
                taskReportList: [],  //任务报告列表
                taskLoading: false,
                channelLoading: false,
                keyWords: '',
                tabType: 6,
                taskType: false,
                taskId: null,
                timeZone: '',
                timeZoneDate: '',
                updateDate: '',
                partCuts: ['YESTERDAY', 'TODAY', 'LAST_WEEK', 'THIS_WEEK', 'LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS'],

                taskIds:[],//数据导出接口参数：任务id数组
                downloadFlag: false, //企业群发/应用消息下载不需要页面跳转
                journeySendReport: '',//模块
                wecomType:'',
            };
        },
        computed: {
            sendData() {
                if (this.reportType === 1) {
                    return {
                        startDate: this.dateRange.startDate,
                        endDate: this.dateRange.endDate,
                        journeyId: this.journeyId > 0 ? this.journeyId : ''
                    };
                }
                return {
                    startDate: this.dateRange.startDate,
                    endDate: this.dateRange.endDate,
                    journeyId: this.journeyId > 0 ? this.journeyId : '',
                    keyword: this.keyWords,
                    type: this.tabType === -1 ? '' : this.tabType
                };
            },
            timeZoneData() {
                let timeZoneRanges = TIME_ZONE_RNAGES;
                let timeZone = this.timeZone;
                return timeZoneRanges.filter(item => item.id === timeZone)[0] || '';
            }
        },
        mounted() {
            let journeyData = JSON.parse(localStorage.getItem(LOCAL_JOURNEY_DATA));
            this.timeZone = localStorage.getItem(LOCAL_TIME_ZONE_SHOW) ? localStorage.getItem(LOCAL_TIME_ZONE_SHOW) : '';
            this.timeZoneDate = localStorage.getItem(LOCAL_TIME_ZONE_DATE) ? localStorage.getItem(LOCAL_TIME_ZONE_DATE) : '';
            if (journeyData) {
                this.dataSourceId = journeyData.dataSourceId ? 1 : 0;
                this.dateRange = journeyData.dateRange || {startDate: '', endDate: ''};
                this.journeyId = journeyData.journeyId || null;
            }

            this.$nextTick(() => {
                if (this.journeyId) {
                    this.getChannelReport();
                }
                this.getUpdateDate();
            });
        },
        beforeRouteLeave(to, from, next) {
            if (to.meta.auth === 'journeyReport') {
                let journeyData = {
                    journeyId: this.journeyId,
                    dataSourceId: this.dataSourceId,
                    dateRange: this.dateRange,
                    taskId: this.taskId,
                };
                localStorage.setItem(LOCAL_JOURNEY_DATA, JSON.stringify(journeyData));
                localStorage.setItem(LOCAL_TIME_ZONE_SHOW, this.timeZone);
                localStorage.setItem(LOCAL_TIME_ZONE_DATE, this.timeZoneDate);
            } else {
                localStorage.removeItem(LOCAL_JOURNEY_DATA);
                localStorage.removeItem(LOCAL_TIME_ZONE_SHOW);
                localStorage.removeItem(LOCAL_TIME_ZONE_DATE);
            }
            next();
        },
        watch: {
            journeyId() {
                if (this.reportType === 1) {
                    this.getChannelReport();
                } else {
                    this.getTaskReport();
                }
            }
        },
        methods: {
            // 获取渠道报告列表
            getChannelReport() {
                this.channelLoading = true;
                // 请求接口获取报告列表
                if (this.journeyId || this.journeyId === -1) {
                    JourneyApiV3
                        .getChannelReport(this.sendData)
                        .then((res) => {
                            this.channelReportList = res.body.data.channelList;
                            this.channelLoading = false;
                        })
                        .catch(() => {
                            this.channelLoading = false;
                        });
                } else {
                    this.channelReportList = [];
                    this.channelLoading = false;
                }
            },
            // 获取任务报告列表
            getTaskReport() {
                this.taskLoading = true;
                // 请求接口获取任务报告列表
                if (this.journeyId || this.journeyId === -1) {
                    JourneyApiV3
                        .getTaskReport(this.sendData)
                        .then((res) => {
                            this.taskLoading = false;
                            let taskList = res.body.data.taskList;
                            // 过滤实时任务与定时任务
                            this.taskReportList =
                                this.taskType ? taskList.filter(item => item.journeyType)
                                    : taskList.filter(item => !item.journeyType);
                        })
                        .catch(() => {
                            this.taskLoading = false;
                        });
                } else {
                    this.taskReportList = [];
                    this.taskLoading = false;
                }
            },
            getReport(event) {
                if (this.taskLoading || this.channelLoading) {
                    this.taskType = !event;
                    this.$toast(this.$t('data.loading'), 'warn');
                    return;
                }
                this.getTaskReport();
            },
            // 选择报告类型
            selectReportType(type) {
                if (this.taskLoading || this.channelLoading) {
                    this.$toast(this.$t('data.loading'), 'warn');
                    return;
                }
                this.channelReportList = [];
                this.taskReportList = [];
                this.reportType = type;
                // 渠道报告
                if (type === 1) {
                    this.getChannelReport();
                } else {  //任务报告
                    this.getTaskReport();
                }
            },
            changeTabType(type) {
                if (this.taskLoading) {
                    this.$toast(this.$t('data.loading'), 'warn');
                    return;
                }
                this.tabType = type;
                this.keyWords = '';
                this.getTaskReport();
            },
            getTaskDetail(report) {
                this.tabType = report.taskType;
                this.selectReportType(2);
            },
            chosenJourney(data,timeZone) {
                this.dataSourceId = data.selectType;
                this.dateRange = data.dateRange;
                this.journeyId = data.id;
                if (timeZone){
                    this.timeZone = timeZone.timeZone;
                    this.timeZoneDate = timeZone.date;
                } else {
                    this.timeZone = '';
                    this.timeZoneDate = '';
                }
                let journeyData = {
                    journeyId: this.journeyId,
                    dataSourceId: this.dataSourceId,
                    dateRange: this.dateRange,
                    taskId: this.taskId,
                };
                localStorage.setItem(LOCAL_JOURNEY_DATA, JSON.stringify(journeyData));
                localStorage.setItem(LOCAL_TIME_ZONE_SHOW, this.timeZone);
                localStorage.setItem(LOCAL_TIME_ZONE_DATE, this.timeZoneDate);
            },
            goToTaskReport(task) {
                this.taskId = task.id;
                this.journeyId = task.journeyId;
                switch (task.taskType) {
                    case 0:
                        this.$router.push({name: 'emailSendReport'});
                        break;
                    case 1:
                        this.$router.push({
                            name: 'smsSendReport'
                        });
                        break;
                    case 3:
                        this.$router.push({
                            name: 'mmsSendReport'
                        });
                        break;
                    case 2:
                        this.$router.push({
                            name: 'wechatSendReport',
                            params:{journeyType: task.journeyType, subType: task.subType}
                        });
                        break;
                }
                if (task.taskType === 10) {
                    switch (task.subType) {
                        case 14:
                            this.$router.push({
                                name:'WecomAgentMsgReport',
                            });
                            break;
                        case 15:
                            this.$router.push({
                                name:'EnterpriseBroadcastReport',
                            });
                            break;
                    }
                }
            },
            getTaskType(taskType, subType) {
                let type = '';
                switch (taskType) {
                    case 0:
                        type = this.$t('dragJourney.email');
                        break;
                    case 1:
                        type = this.$t('dragJourney.sms');
                        break;
                    case 3:
                        type = this.$t('dragJourney.mms');
                        break;
                    case 2:
                        type = this.$t('contact.wechat');
                        break;
                }
                if (taskType === 2) {
                    switch (subType) {
                        // 0:图文(群发) 10:文字(群发) 11:图片(群发) 12:音频(群发) 13:视频(群发)
                        // 1:图文(客服) 3:文字(客服) 4:图片(客服) 5:音频(客服) 6:视频(客服) 7:web页(客服) 8:跳转表单(客服) 9:小程序卡片(客服)
                        // 2:模板
                        // 渠道类型
                        case 0:
                            type = this.$t('data.massSend') + '-' + this.$t('data.graphic'); // 群发消息-图文消息
                            break;
                        case 1:
                            type = this.$t('data.customMsg') + '-' + this.$t('data.graphic'); // 客服消息-图文消息
                            break;
                        case 2:
                            type = this.$t('dragJourney.wechatTemplates');
                            break;
                        case 3:
                            type = this.$t('data.customMsg') + '-' + this.$t('data.text'); // 客服消息-文字
                            break;
                        case 4:
                            type = this.$t('data.customMsg') + '-' + this.$t('data.img');// 客服消息-图片
                            break;
                        case 5:
                            type = this.$t('data.customMsg') + '-' + this.$t('data.audio');// 客服消息-音频
                            break;
                        case 6:
                            type = this.$t('data.customMsg') + '-' + this.$t('data.video');// 客服消息-视频
                            break;
                        case 7:
                            type = this.$t('data.customMsg') + '-' + this.$t('data.webPage');//  客服消息-外部页
                            break;
                        case 8:
                            type = this.$t('data.customMsg') + '-' + this.$t('data.form');// 客服消息-跳转表单
                            break;
                        case 9:
                            type = this.$t('data.customMsg') + '-' + this.$t('data.miniProgram');// 客服消息-小程序卡片
                            break;
                        case 10:
                            type = this.$t('data.massSend') + '-' + this.$t('data.text');// 群发消息-文字
                            break;
                        case 11:
                            type = this.$t('data.massSend') + '-' + this.$t('data.img');// 群发消息-图片
                            break;
                        case 12:
                            type = this.$t('data.massSend') + '-' + this.$t('data.audio');// 群发消息-音频
                            break;
                        case 13:
                            type = this.$t('data.massSend') + '-' + this.$t('data.video');// 群发消息-视频
                            break;
                    }
                }
                if (taskType === 10) {
                    switch (subType) {
                        case 14:
                            type = this.$t('dragJourney.agentMsg');
                            break;
                        case 15:
                            type = this.$t('dragJourney.groupMsg');
                            break;
                    }
                }
                return type;
            },
            goToDownload(report) {
                this.taskId = report.id;
                this.journeyId = report.journeyId;
                if (report.taskType === 10) {//应用消息和企业群发类型
                    this.taskIds = [];
                    this.taskIds.push(report.id);
                    this.downloadFlag = true;
                    if (report.subType === 14) {
                        this.journeySendReport = 'wecomAgent';
                        this.wecomType = 1;
                    }
                    if (report.subType === 15) {
                        this.journeySendReport = 'wecomBroadcast';
                        this.wecomType = 2;
                    }
                } else {
                    this.$router.push({
                        name: 'exportOriginalData',
                        query: {type: report.taskType}
                    });
                }
            },
            //确定下载 企业群发 应用消息
            wecomSureDownload (downloadInfo) {
                this.downloadFlag = false;
                let obj = {
                    email: downloadInfo.emailAddress,
                    unicode: downloadInfo.dataFormat === 'utf8' ? 0 : 1,
                    formatType: downloadInfo.formatType,
                    emailSubject: downloadInfo.emailSubject,
                    type: this.wecomType,
                    taskIds: this.taskIds
                };
                WecomApiV1
                    .exportWecomData(obj)
                    .then(() => {
                        this.$toast(this.$t('report.exportSuccess'), 'success');
                    });
            },
            // 获取页面更新时间
            getUpdateDate() {
                JourneyApiV1
                    .getUpdateDate('journey', this.$route.params && this.$route.params.journeyInstantiationId || null)
                    .then((res) => {
                        this.updateDate = res.body.data.date;
                    });
            },
        },
        components: {
            journeyTaskSelect
        }
    };
</script>
<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .journey-send-report {
        .show-time {
            color: #aaaaaa;
            background-color: #ffffff;
            line-height: 32px;
            padding: 16px;
            margin: 24px 3%;
            .show-time-icon{
                float: left;
                margin-top: 11px;
                margin-right: 5px;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: #aaaaaa;
                display: inline-block;
            }
        }

        .page-content {
            height: calc(100vh - 168px);
        }

        .report-header {
            padding: 16px;
            line-height: $input-field-height;
            background-color: white;
            margin-top: 0;

            .report-type {
                margin-top: 16px;
                .btn {
                    color:$color-content;
                }
                span {
                    cursor: pointer;
                }

                .selected {
                    color: $theme;
                }
                .zonedate{
                    margin-left: 30px;
                }
            }

            .journey-task-select {
                display: inline-block;
            }
        }

        .report-content {
            padding: 16px;

            .tab-links {
                margin-bottom: 16px;
            }

            .task-type {
                margin-bottom: 16px;
            }

            .action-icon:first-child {
                margin-left: 0;
            }

            .task-text {
                button {
                    padding:0;
                }
                :not([disabled]) {
                    color: $theme;
                }
            }
        }

    }

    .action-icon-color {
        fill: $theme;
    }
</style>
