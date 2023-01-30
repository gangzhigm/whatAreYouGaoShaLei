<!--suppress ALL -->
<template>
    <div class="sms-send-report">
        <div class="page-content">
            <div class="content-view back">
                <router-link tag="button" :to="{name: 'journeySendReport'}" class="btn btn-theme btn-md">{{ $t('data.backList') }}</router-link>
            </div>
            <div class="content-view margin report-header">
                {{ $t('data.reportSource') }}:
                <selector class="lg" :options="dataSourceList" v-model="dataSourceId" @select="sourceChange"></selector>
                <date-range format="YYYY-MM-DD" :start="dateRange.startDate" :end="dateRange.endDate"
                            @change="changeDate" v-if="!dataSourceId" :partCuts="partCuts"/>
                <selector
                    class="hg"
                    ref="select"
                    :options="journeyList"
                    v-if="selectorGroupShow"
                    v-model="journeyId"
                    @select="selectJourney"
                    @search="searchJourney"
                    search="async"
                    @hide="hideJourneyList"
                    @load="loadMore"></selector>

                <!--dataSourceId = 1-->
                <journey-picker
                    v-if="dataSourceId === 1"
                    :value="journeyId"
                    @input="selectId"></journey-picker>

                <!--taskList-->
                <selector
                    class="hg"
                    :options="taskList"
                    v-if="selectorTaskListShow"
                    v-model="taskId"
                    @select="selectTask"
                    search="async"
                    @search="searchTask"
                    @load="loadMoreTask"></selector>

                <!--全局报告数据列表-->
                <multi-select
                    :placeholder="$t('data.pleaseChoose')"
                    v-if="dataSourceId === 2"
                    :options="smsActiveList"
                    v-model="smsActiveIds"
                    dropDirection="bottom"
                    :shortcutAction="false"
                    @change="smsActiveSelect"
                    class="multi-select">
                </multi-select>

                <!--第一组数组 全局报告-->
                <selector
                    class="lg"
                    :options="sendoutsList"
                    v-if="dataSourceId === 3"
                    @search="smsSendSearch"
                    search="async"
                    @select="selectSendout"
                    @load="getActiveList"
                    v-model="sendoutId">
                </selector>

                <multi-select
                    :placeholder="$t('data.pleaseChoose')"
                    v-if="smsActiveShow"
                    :options="smsActiveList"
                    v-model="smsActiveIds"
                    dropDirection="bottom"
                    :shortcutAction="false"
                    @change="smsActiveSelect"
                    class="multi-select">
                </multi-select>

                <div class="download-action pull-right" @click="goToSmsReport">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-download"></use>
                    </svg>
                </div>
            </div>

            <div class="content-view margin">
                <div class="charts">
                    <!--1. 发送统计-->
                    <div class="chart half right-margin">
                        <div class="chart-head">
                            <h5>{{ $t('data.sendStatistics') }}</h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{'data.realTimes' | t}}</span>
                        </div>
                        <div :class="['chart-body','md','table', {empty: !sendReport}]">
                            <template v-if="sendReport">
                                <table>
                                    <thead>
                                    <tr>
                                        <th>{{ $t('data.statisticalItem') }}</th>
                                        <th>{{ $t('data.recipientsNumber') }}</th>
                                        <th>{{ !this.TYPE ? $t('data.piecesOfSMS') : $t('data.piecesOfMMS') }}</th>
                                        <th>{{ $t('data.percentage') }}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <!--发送总数-->
                                        <td>{{ $t('data.sendTotalNum') }} <span class="icon icon-help" v-title:right="$t('data.sendTotalTip')"></span> </td>
                                        <td>{{ sendReport.predictSendCount }}</td>
                                        <td>{{ sendReport.realitySendCount }}</td>
                                        <td> -- </td>
                                    </tr>
                                    <tr>
                                        <!--送达总数-->
                                        <td>{{ $t('data.sentTotalNum') }}  <span class="icon icon-help" v-title:right="$t('data.serviceTip')"></span></td>
                                        <td>{{ sendReport.predictSuccessCount }}</td>
                                        <td>{{ sendReport.realitySuccessCount }}</td>
                                        <td>{{ sendReport.predictSuccessRate }}%</td>
                                    </tr>
                                    <tr>
                                        <td>{{ $t('data.totalError') }} <span class="icon icon-help" v-title:right="$t('data.totalErrorTip')"></span></td>
                                        <td>{{ sendReport.predictFailCount }}</td>
                                        <td>{{ sendReport.realityFailCount }}</td>
                                        <td>{{ sendReport.predictFailRate }}%</td>
                                    </tr>
                                    <tr>
                                        <td>{{ $t('data.totalClickThroughs') }} <span class="icon icon-help" v-title:right="$t('data.clickCountTip')"></span></td>
                                        <td>{{ sendReport.clickCount }}</td>
                                        <td> -- </td>
                                        <td> -- </td>
                                    </tr>
                                    <tr>
                                        <td>{{ $t('data.ips') }} <span class="icon icon-help" v-title:right="$t('data.ipsTip')"></span></td>
                                        <td>{{ sendReport.ipClickCount }}</td>
                                        <td> -- </td>
                                        <td> -- </td>
                                    </tr>
                                    <tr>
                                        <td>{{ $t('data.uniqueClickThroughs') }} <span class="icon icon-help" v-title:right="$t('data.clickThroughsTip')"></span></td>
                                        <td>{{ sendReport.mobileClickCount }}</td>
                                        <td> -- </td>
                                        <td> -- </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </template>
                        </div>
                    </div>
                    <!--2.短信送达转化（基于发送人数统计）-->
                    <div class="chart half">
                        <div class="chart-head">
                            <div class="chart-summary-number">
                                <span class="number" v-if="sendReport">{{ sendReport.predictSuccessCount }}</span>
                                <span class="number" v-else>0</span>
                                <span class="disabled-text">{{ $t('data.accept') }}</span>
                            </div>
                            <div class="chart-summary-number">
                                <span class="number" v-if="sendReport">{{ sendReport.predictSendCount }}</span>
                                <span class="number" v-else>0</span>
                                <span class="disabled-text">{{ $t('data.sent') }}</span>
                            </div>
                            <h5>{{  TYPE ? $t('data.mmsSendPerformance') : $t('data.smsPerformance') }}<span class="icon icon-help" v-title="'点击转化漏斗，基于发送人数统计'"></span></h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{'data.realTimes' | t}}</span>
                        </div>
                        <div :class="['md', 'chart-body', {empty: !sendReport}]" ref="smsChart"></div>
                    </div>
                </div>

                <!--错误统计-->
                <div class="charts">
                    <!--1. 手机号运营商分布-->
                    <div class="chart one-third right-margin">
                        <div class="chart-head">
                            <h5>{{ $t('data.mobilePercentage') }}</h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{'data.hourly' | t}}</span>
                        </div>
                        <div :class="['chart-body','md', {empty: !reportMap.servicesProportion}]" ref="operatorChart"></div>
                    </div>
                        <!--2.报错统计-->
                    <div class="chart one-third right-margin">
                        <div class="chart-head">
                            <h5>{{ $t('data.errorStatistics') }}</h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{'data.realTimes' | t}}</span>
                        </div>
                        <div :class="['chart-body','md','table', {empty: !reportMap.errorCountMap}]">
                            <template v-if="reportMap.errorCountMap">
                                <table>
                                    <thead>
                                    <tr>
                                        <th>{{ $t('data.statisticalItem') }}</th>
                                        <th>{{ $t('data.quantity') }}</th>
                                        <th>{{ $t('data.percentage') }}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td>{{ $t('data.emptyNumber') }}</td>
                                        <td>{{ reportMap.errorCountMap.spaceCount }}</td>
                                        <td>{{ reportMap.errorCountMap.spacePercent }}%</td>
                                    </tr>
                                    <tr>
                                        <td>{{ $t('data.blacklist') }}</td>
                                        <td>{{ reportMap.errorCountMap.blackCount }}</td>
                                        <td>{{ reportMap.errorCountMap.blackPercent }}%</td>
                                    </tr>
                                    <tr>
                                        <td>{{ $t('data.sensitiveWord') }}</td>
                                        <td>{{ reportMap.errorCountMap.sensitiveCount }}</td>
                                        <td>{{ reportMap.errorCountMap.sensitivePercent }}%</td>
                                    </tr>
                                    <tr>
                                        <td>{{ $t('data.other') }}</td>
                                        <td>{{ reportMap.errorCountMap.otherCount }}</td>
                                        <td>{{ reportMap.errorCountMap.otherPercent }}%</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </template>
                        </div>
                    </div>
                    <!--3. 错误统计-->
                    <div class="chart one-third">
                        <div class="chart-head">
                            <h5>{{ $t('data.errorStatisticsCharts') }} <span class="icon icon-help" v-title="$t('data.errorStatisticsCharts')"></span></h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{'data.realTimes' | t}}</span>
                        </div>
                        <div :class="['chart-body', 'md', {empty: !reportMap.errorCountMap}]" ref="errorChart"></div>
                    </div>
                </div>
                <!--发送历史-->
                <div class="charts">
                    <div class="chart">
                        <div class="chart-head">
                            <h5>{{ $t('data.sendHistory') }}</h5>
                        </div>
                        <div :class="['chart-body', 'table', {empty: !activeSendsShow}]">
                            <table v-if="activeSendsShow && !reportMap.loading">
                                <thead>
                                    <tr>
                                        <th>{{ $t('data.batchName') }}</th>
                                        <th>{{ $t('data.sendName') }}</th>
                                        <th width="80">{{ $t('data.arrivalRate') }}</th>
                                        <th>{{ $t('data.startingTime') }}</th>
                                        <th>{{ $t('data.endTime') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in reportMap.activeSends">
                                        <td :title="item.name">{{ item.name | nullFilter }}</td>
                                        <td :title="item.creater">{{ item.creater | nullFilter }}</td>
                                        <td width="80">{{ item.successRate | nullFilter | valRatio }}</td>
                                        <td>{{ item.startTime | nullFilter }}</td>
                                        <td>{{ item.overTime | nullFilter }}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <inline-loading v-if="reportMap.loading"/>
                        </div>
                    </div>
                </div>
                <pager
                    :now="query.pageNo"
                    @page="pageChange"
                    :total="reportTotalPage"
                    class="pager"></pager>
            </div>
        </div>
    </div>
</template>
<script>
    import { JourneyApiV2, SmsServiceApiV1, GeteOriginApi } from '@/api';
    import cloneDeep from 'lodash/cloneDeep';
    import {eachDay, subDays,format} from 'date-fns';
    import {PRIVATE_DEVELOPMENT} from '../../../../private';

    const util = {
        exceptFirst(list, disabled) {
            list = cloneDeep(list);
            const first = list.shift();
            const result = list.map(smsItem => {
                return {...smsItem, disabled: disabled};
            });
            return [first, ...result];
        }
    };
    const LOCAL_JOURNEY_DATA = 'LOCAL_JOURNEY_DATA';
    const SMSTYPE = 1;
    const MMSTYPE = 3;

    import JourneyPicker from '../components/journey-picker.vue';
    import { getChartInstance, resize } from '../chartUtils/chartUtils';
    import { getAnnularOption, getBarOptions, getFunnelOption} from '../chartUtils/chartOptions';

    export default {
        data() {
            return {
                dataSourceList: [
                    {name: this.$t('data.byJourneyFirstTime'), id: 0},
                    {name: this.$t('data.selectedJourneys'), id: 1},
                    {name: this.$t('data.globalReport'), id: 2},
                ],
                loading: false,
                journeyPageNo: 1,
                journeyTotalPage: 1,
                journeyKeyWord: '',
                journeyList: [],  // 旅程列表
                journeyId: null,  // 旅程id
                dataSourceId: 0, // 数据源Id
                dateRange: {
                    startDate: '',
                    endDate: ''
                },
                taskList: [],  // 旅程任务列表
                taskLoading: false,
                taskPageNumber: 1,
                taskKeyWord: '',
                totalPageTask: 1,
                loadingTask: false,
                taskId: null,  // 旅程任务id
                partCuts: ['YESTERDAY', 'TODAY', 'LAST_WEEK', 'THIS_WEEK', 'LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS'],

                // 全局报告 & 短信活动
                sendoutsList: [],  // 第一组数据, 活动名称列表(尽在短信活动时可用)
                sendSearch: '',  // 第一组数据搜索关键词
                sendLoading: false,
                sendoutId: '',

                smsActiveList: [],  // 汇总报告任务列表
                smsActiveSearch: '',
                smsActiveSendOutId: '',
                smsActivePageNumber: 1,
                smsActiveLoading: false,
                smsActiveIds: [],  // 多选

                charts: {
                    smsChart: null,
                    errorChart: null,
                    operatorChart: null
                },
                smsDate: [],
                errorDate: [],

                // resizer global
                resizer: null,

                // 错误统计数据
                reportMap: {
                    errorCountMap: null, // 错误信息统计/报错统计
                    activeSends: [], // 发送历史
                    sendData: null,  // 短信送达转化/发送统计
                    servicesProportion: null, // 手机号运营商占比
                    loading: false,
                },
                reportTotalPage: 1,
                TYPE: 0, // 0 短信, 1 彩信
                campaignId: null,
                departmentId: '', // 部门ID
                searchType: '', // 0 邮件 1短信 2彩信
            };
        },
        computed: {
            // 筛选时段旅程分组下拉列表是否出现
            selectorGroupShow() {
                return this.dateRange.startDate && !this.dataSourceId;
            },
            // 旅程任务下拉列表是否出现
            selectorTaskListShow() {
                return (this.selectorGroupShow || this.dataSourceId === 1 ) && this.journeyId;
            },
            // 用户id
            creatorId() {
                return this.$store.state.user.id;
            },
            // 汇总报告是否出现
            smsActiveShow() {
                return this.dataSourceId === 3 && this.sendoutId;
            },
            activeSendsShow() {
                return this.reportMap.activeSends && this.reportMap.activeSends.length;
            },
            sendReport() {
                return this.reportMap.sendData;
            },
            sendName() {
                return !this.TYPE ? this.$t('data.smsReport') : this.$t('data.mmsReport');
            },
            // campaignId是指任务中的campaignId，有旅程存在时，全选时传当前旅程下的所有任务campaignid的拼接字符串，
            // 无旅程存在时，全选时可传-1，多选时传id的拼接字符串，
            // sendoutId是指活动签名id（必填，没有值时传-1）
            query() {
                let campainIds = '';
                if (this.dataSourceId === 3 || this.dataSourceId === 2) {
                    if (this.smsActiveIds[0] === -1) {
                        campainIds = -1;
                    } else {
                        campainIds = this.smsActiveIds.join(',');
                    }
                } else {
                    if (this.campaignId && this.campaignId > 0) {
                        campainIds = this.campaignId;
                    } else {
                        let list = [];
                        this.taskList.map(item => {
                            if (item.id > 0){list.push(item.campaignId)}
                        });
                        campainIds = list.join(',');
                    }
                }
                return {
                    campaignId: campainIds,
                    messageType: this.TYPE,  // 0短信 1彩信
                    pageNo: 1,
                    sendoutId: this.sendoutId ? this.sendoutId : -1,
                    systemType: PRIVATE_DEVELOPMENT ? this.$store.state.user.cid : 1, // 私有化部署：cid，DMT：1
                };
            },
        },
        watch: {
            smsActiveIds: {
                handler(smsIds) {
                    const { smsActiveList } = this;
                    if (smsIds.length && smsIds[0] === -1) {
                        this.smsActiveList = util.exceptFirst(smsActiveList, true);
                        return;
                    }
                    if (smsIds.length && smsIds.indexOf(-1) < 0) {
                        this.$set(this.smsActiveList, 0, {name: this.sendName, id: -1, disabled: true});
                        return;
                    }
                    if (!smsIds.length) {
                        this.clearCharts();
                        if (smsActiveList.length < 1) return;
                        const notFirstItem = smsActiveList[1].disabled;
                        if (notFirstItem) {
                            this.smsActiveList = util.exceptFirst(smsActiveList, false);
                        } else {
                            this.$set(this.smsActiveList, 0, {name: this.sendName, id: -1});
                        }
                    }
                },
                deep: true
            }
        },
        mounted() {
            this.TYPE = this.$route.meta.type;
            const sourceOption = {name: !this.TYPE ? this.$t('data.smsActivity') : this.$t('data.mmsActivity'), id: 3};
            this.dataSourceList.push(sourceOption);
            this.query.messageType = this.TYPE;

            const journeyData = JSON.parse(localStorage.getItem(LOCAL_JOURNEY_DATA));
            if (journeyData) {
                this.dataSourceId = journeyData.dataSourceId ? 1 : 0;
                this.dateRange = journeyData.dateRange || {startDate: '', endDate: ''};
                // 旅程分组id
                this.journeyId = journeyData.journeyId > 0 ? journeyData.journeyId : null;
                this.taskId = journeyData.taskId || null;
            }

            this.$nextTick(() => {
                if (!this.sourceId  && !this.dateRange.startDate) {
                    this.dateRange = {
                        startDate: format(subDays(new Date(),30),'YYYY-MM-DD'),
                        endDate: format(subDays(new Date(),1),'YYYY-MM-DD'),
                    };
                }
                // 筛选时间段且旅程id存在时，回显旅程，否则仅需要获取旅程列表
                if (!this.sourceId && this.journeyId && this.dateRange.startDate) {
                    this.getJourney(true);
                } else  {
                    this.getJourney();
                }
                // 旅程id存在时获取相应的任务id
                if (this.journeyId) {
                    this.checkerTask([], this.taskId);
                }
                // 任务id存在时回显相应任务，且获取画图数据，画图
                if (this.taskId > 0) {
                    this.resizer = resize(this.charts);
                    window.addEventListener('resize', this.resizer);
                }
            });
        },
        beforeRouteLeave(to, from, next) {
            if (to.meta.auth === 'journeyReport') {
                let journeyData = {
                    journeyId: this.journeyId,
                    dataSourceId: this.dataSourceId,
                    dateRange: this.dateRange,
                    taskId: this.taskId
                };
                localStorage.setItem(LOCAL_JOURNEY_DATA, JSON.stringify(journeyData));
            } else {
                localStorage.removeItem(LOCAL_JOURNEY_DATA);
            }
            window.removeEventListener('resize', this.resizer);
            next();
        },
        methods: {
            pageChange(pageNo) {
                if (this.query.pageNo === pageNo) return;
                this.query.pageNo = pageNo;
                this.getReportData();
            },
            // 修改数据来源
            sourceChange(source) {
                // 筛选时间段,时间默认最近30天
                if (source.id === 0) {
                    this.dateRange = {
                        startDate: format(subDays(new Date(),30),'YYYY-MM-DD'),
                        endDate: format(subDays(new Date(),1),'YYYY-MM-DD'),
                    };
                    this.getJourney();
                } else if (source.id === 2) { // 全局报告, 直接获取汇总报告列表
                    this.smsActiveSendOutId = '';
                    this.smsActiveList = [];
                    this.getSmsCampaignsList();
                    this.dateRange = {startDate: '', endDate: ''};
                } else if (source.id === 3) {  // 短信活动
                    this.getActiveList();
                    this.dateRange = {startDate: '', endDate: ''};
                } else {
                    this.dateRange = {startDate: '', endDate: ''};
                }
                this.clearData();
            },
            clearData() {
                this.journeyPageNo = this.taskPageNumber = 0;
                this.journeyTotalPage = this.totalPageTask = 1;
                this.journeyList = [];
                this.taskList = [];
                this.journeyId = this.sourceId = null;
                this.reportMap.servicesProportion = null;
                this.sendoutsList = [];
                this.sendoutId = '';
                this.sendSearch = '';
                this.smsActiveList = [];
                this.smsActiveSearch = '';
                this.smsActiveIds = [];
                this.taskList = [];
                this.clearCharts();
            },
            // 筛选时段 - 日期发生变化
            changeDate(date) {
                let dateLength = eachDay(date.start, date.end).length;
                if (dateLength > 90){
                    return this.$toast(this.$t('data.noMoreThan90Days'),'warn');
                }
                this.dateRange.startDate = date.start;
                this.dateRange.endDate = date.end;
                this.journeyId = null;
                this.journeyList = [];
                this.journeyTotalPage = 0;
                this.journeyPageNo = 1;
                this.getJourney();
            },
            // 获取旅程
            getJourney(check) {
                // 包含实时旅程的旅程列表
                JourneyApiV2
                    .getJourneys(null, this.dateRange.endDate, [this.journeyId],
                        this.journeyPageNo, this.journeyKeyWord, this.dateRange.startDate)
                    .then(res =>{
                        this.journeyList = this.journeyList.concat(res.body.data.journeyTemplateList);
                        this.journeyTotalPage = res.body.data.totalPage;
                        // 轮询获取选中旅程
                        if (check) {
                            // 避免返回数据出错，这里journeyId逻辑仍轮询
                            let id = this.journeyId ? this.journeyId : this.id ? this.id : '';
                            if (id || id === 0) {
                                let target = this.journeyList.findIndex(journey => journey.id === id);
                                if (target > -1) {
                                    this.journeyId = id;
                                } else if (this.journeyTotalPage > this.journeyPageNo) {
                                    this.journeyPageNo += 1;
                                    this.getJourney(true);
                                }
                            }
                        }
                    });
            },
            // 加载旅程
            loadMore() {
                if (this.journeyTotalPage > this.journeyPageNo && this.journeyList.length > 0) {
                    let targetItem = this.$refs.select.$vnode.elm.childNodes[2].childNodes[4];
                    if (targetItem.clientHeight + targetItem.scrollTop + 1 > targetItem.scrollHeight) {
                        this.journeyPageNo += 1;
                        this.getJourney();
                    }
                }
            },
            searchJourney(keyWord) {
                this.journeyKeyWord = keyWord;
                this.journeyPageNo = 1;
                this.journeyList = [];
                this.getJourney();
            },
            // 搜索未选择时，回显原有内容
            hideJourneyList() {
                if (this.journeyKeyWord) {
                    this.journeyKeyWord = '';
                    this.journeyPageNo = 1;
                    this.journeyList = [];
                    this.getJourney(true);
                }
            },
            checkerTask(taskList = [], id) {
                // recover task
                const vm = this;
                let targetTask;
                targetTask = taskList.find(task =>
                    task.id === id
                );
                if (vm.totalPageTask >= vm.taskPageNumber && !targetTask) {
                    return vm.loadMoreTask(this.checkerTask);
                }
            },
            loadMoreTask(checkerTask) {
                if (this.loadingTask) return;
                if (this.taskPageNumber > this.totalPageTask) return;
                this.loadingTask = true;
                JourneyApiV2
                // 0:邮件,1:短信,2:微信,3:彩信
                    .getTasks([], '', [this.journeyId], this.taskPageNumber++, this.taskKeyWord, '', this.TYPE ? MMSTYPE : SMSTYPE,
                        this.taskId > 0 ? this.taskId : null)
                    .then(({body: {data: {taskInstantiationList,totalPage}}}) => {
                        this.totalPageTask = totalPage;
                        this.taskList = this.taskList.concat(taskInstantiationList);
                        // 非选择状态，不请求图表接口
                        if (checkerTask) {
                            if (this.taskId > 0) {
                                this.taskList.map(item => {
                                    if (item.id === this.taskId) {
                                        this.campaignId = item.campaignId;
                                    }
                                });
                                // 获取campaignId之后画图
                                this.campaignId && this.getOperatorList();
                                this.campaignId && this.getReportData();
                                // 修改选择全部任务时， 未传全部campaignId, number++的原因这里要 -1判断
                            } else if (this.taskPageNumber - 1 >= this.totalPageTask) {
                                this.getOperatorList();
                                this.getReportData();
                            }
                        }
                        let idx = this.taskList.findIndex(task => task.id === -1);
                        if (this.taskList && this.taskList.length !== 0 && idx < 0) {
                            this.taskList.unshift({id: -1, name: this.TYPE ? this.$t('data.mmsTasks') : this.$t('data.smsTasks')});
                        }
                        this.loadingTask = false;
                        this.$nextTick(() => {
                            this.loadingTask = false;
                            if (typeof checkerTask === 'function') {
                                checkerTask(taskInstantiationList, this.taskId);
                            }
                        });
                    })
                    .catch(() =>{
                        this.loadingTask = false;
                        this.taskPageNumber--;
                    });
            },
            // 第一组数据-活动名称列表
            getActiveList() {
                if (this.sendLoading) return;
                this.sendLoading = true;
                if (this.$store.state.user.roleId === 0 || this.$store.state.user.roleId === '') {
                    // 短信签名列表
                    SmsServiceApiV1
                        .getSendoutList(
                            this.TYPE,
                            this.sendSearch,
                            this.creatorId,
                        )
                        .then(({body:{data:{smsSendouts}}}) => {
                            this.sendLoading = false;
                            this.sendoutsList = smsSendouts;
                        })
                        .catch(() => {
                            this.sendLoading = false;
                        });
                } else {
                    GeteOriginApi
                        .getAllSendChannel({
                            departmentId: this.departmentId,
                            searchType: 1,
                        })
                        .then(({body: {data: {sendChannel}}}) => {
                            this.sendLoading = false;
                            this.sendoutsList = sendChannel.map(elm =>{
                                return {name: elm.sendAddress,id: elm.sendoutId};
                            });
                        })
                        .catch(() => {
                            this.sendLoading = false;
                        });
                }
            },

            /**
             * 根据Sendoutid和creatorId获取所有campaign
             * 获取报告列表
             */
            getSmsCampaignsList() {
                if (this.smsActiveLoading) return;
                this.smsActiveLoading = true;
                SmsServiceApiV1
                    .getSmscampaignsBySendoutAndUser({
                        creatorId: this.creatorId,
                        isMms: this.TYPE,
                        pageNumber: this.smsActivePageNumber,
                        searchKeyword: this.smsActiveSearch,
                        sendoutId: this.smsActiveSendOutId
                    })
                    .then(({body:{data:{smsCampaigns}}}) => {
                        this.smsActiveLoading = false;
                        if (smsCampaigns.length) {
                            const result = smsCampaigns.map(item => {
                                return {
                                    name: item.campaignName,
                                    id: item.id
                                };
                            });
                            // all smsFirst
                            this.smsActiveList.unshift({
                                name: this.sendName,
                                id: -1
                            });
                            this.smsActiveList = [...this.smsActiveList, ...result];
                        }
                    });
            },
            // 手机运营商占比之外的所有报表数据
            getReportData() {
                this.reportMap.loading = true;
                SmsServiceApiV1
                    .getDataReportCopy(this.query)
                    .then(({body: {data}}) => {
                        this.reportMap.loading = false;
                        this.reportTotalPage = data.totalPage;
                        // 发送历史图表数据
                        this.reportMap.activeSends = data.activeSends;
                        // 错误信息统计/报错统计
                        this.reportMap.errorCountMap = data.errorCountMap;
                        const sendData = {
                            predictSendCount: data.predictSendCount,
                            realitySendCount: data.realitySendCount,
                            predictSuccessCount: data.predictSuccessCount,
                            realitySuccessCount: data.realitySuccessCount,
                            predictSuccessRate: data.predictSuccessRate,
                            predictFailCount: data.predictFailCount,
                            realityFailCount: data.realityFailCount,
                            predictFailRate: data.predictFailRate,
                            clickCount: data.clickCount,
                            ipClickCount: data.ipClickCount,
                            mobileClickCount: data.mobileClickCount,
                        };
                        // 短信送达转化/发送统计
                        this.reportMap.sendData = sendData;
                        this.errorCharts();
                        this.smsCharts();
                    })
                    .catch(() => {
                        this.reportMap.loading = false;
                    });
            },
            // 手机运营商占比
            // 单选时传相应的任务campaignId，多选时传任务campaignId拼接字符串
            getOperatorList() {
                let ids = '';
                if (this.dataSourceId === 0 || this.dataSourceId === 1) {
                    if (this.taskId > 0) {
                        ids = this.campaignId;
                    } else {
                        let list = [];
                        this.taskList.map(item => {
                            if (item.id > 0){list.push(item.campaignId)}
                        });
                        ids = list.join(',');
                    }
                } else {
                    if (this.smsActiveIds[0] === -1) {
                        let list = [];
                        this.smsActiveList.map(item => {
                            if (item.id > 0) {list.push(item.id)}
                        });
                        ids = list.join(',');
                    } else {
                        ids = this.smsActiveIds.join(',');
                    }
                }
                SmsServiceApiV1
                    .getSuppliersProportion(ids)
                    .then(({body:{data:{servicesProportion}}}) => {
                        this.reportMap.servicesProportion = servicesProportion;
                        this.$nextTick(() => {
                            this.operatorCharts();
                        });
                    });
            },
            // 选中旅程
            selectJourney(groupItem) {
                this.journeyId = groupItem.id;
                this.journeyPageNo = 0;
                this.taskPageNumber = 1;
                this.taskId = null;
                this.journeyKeyWord = '';
                this.taskList = [];
                this.journeyList = [];
                this.totalPageTask = Infinity;
                this.getJourney(true);
                // 当分组修改的时候, 重新初始化图表和数据
                this.clearCharts();
                // 获取该旅程下的所有任务列表
                this.loadMoreTask();
            },
            // 清空图表数据
            clearCharts() {
                this.reportMap.errorCountMap = null;
                this.reportMap.sendData = null;
                this.reportMap.servicesProportion = null;
                this.reportMap.activeSends = [];
                if (this.charts.errorChart) this.charts.errorChart.clear();
                if (this.charts.smsChart) this.charts.smsChart.clear();
                if (this.charts.operatorChart) this.charts.operatorChart.clear();
            },
            // 选择短信旅程任务
            selectTask(taskItem) {
                this.taskId = taskItem.id;
                this.campaignId = taskItem.campaignId || -1;
                // 修改选择全部任务时， 未传全部campaignId
                this.taskKeyWord = '';
                this.taskPageNumber = 1;
                this.taskList = [];
                this.checkerTask([], this.taskId);
            },
            // 搜索短信旅程任务, 初始化搜索参数
            searchTask(searchResult) {
                this.taskKeyWord = searchResult;
                this.taskList = [];
                this.taskLoading = false;
                this.taskPageNumber = 1;
                this.totalPageTask = Infinity;
                this.loadMoreTask();
            },
            // 指定旅程选择id
            selectId(id) {
                // journeyId  旅程模板ids
                this.journeyId = id;
                this.taskPageNumber = 1;
                this.taskList = [];
                this.totalPageTask = Infinity;
                this.taskId = null;
                this.loadMoreTask();
            },
            // 短信活动, 短信活动名称选择
            selectSendout(smsItem) {
                this.smsActiveIds = [];
                this.smsActiveList = [];
                this.smsActiveSendOutId = smsItem.id;
                this.smsActivePageNumber = 1;
                this.getSmsCampaignsList();
            },
            // 短信活动- 第一组数据搜索
            smsSendSearch(keyword) {
                this.sendSearch = keyword;
                this.sendoutsList = [];
                this.sendLoading = false;
                this.getActiveList();
            },
            // 短信活动-第二组数据选择
            smsActiveSelect() {
                this.query.campaignId && this.getReportData();
                this.getOperatorList();
            },
            renderCharts() {
                this.smsCharts();
                this.errorCharts();
                this.operatorCharts();
            },
            // 短信送达转化
            // charts 1
            smsCharts() {
                this.charts.smsChart = getChartInstance(this.$refs.smsChart);
                if (!this.sendReport) return;
                const {predictSendCount, predictSuccessCount} = this.sendReport;
                const data = [
                    {value: predictSendCount, name: this.$t('data.sent')},
                    {value: predictSuccessCount, name: this.$t('data.accept')},
                ];
                this.$nextTick(() => {
                    this.charts.smsChart
                        .setOption(getFunnelOption([
                            {name: this.$t('data.sent'), value: predictSendCount},
                            {name: this.$t('data.accept'), value: predictSuccessCount}
                        ]));
                    this.smsDate = data;
                });
            },
            // chart4 chart5
            // 错误统计图表
            errorCharts() {
                this.charts.errorChart = getChartInstance(this.$refs.errorChart);
                const { errorCountMap } = this.reportMap;
                if (!errorCountMap) return;

                this.$nextTick(() => {
                    this.charts.errorChart.setOption(getBarOptions([
                        {name: this.$t('data.emptyNumber'), value: errorCountMap.spaceCount || 0},
                        {name: this.$t('data.other'), value: errorCountMap.otherCount || 0},
                        {name: this.$t('data.sensitiveWord'), value: errorCountMap.sensitiveCount || 0},
                        {name: this.$t('data.blacklist'), value: errorCountMap.blackCount || 0}
                    ], {toolTipFormat: this.$t('data.quantity') + '{value}'}));
                });
            },
            // chart3
            // 运营商分布
            operatorCharts() {
                this.charts.operatorChart = getChartInstance(this.$refs.operatorChart);
                const {servicesProportion} = this.reportMap;
                if (!servicesProportion) return;
                const names = [
                    this.$t('data.other'),
                    this.$t('data.mobile'),
                    this.$t('data.unicom'),
                    this.$t('data.telecom'),
                    this.$t('data.virtual'),
                    this.$t('data.overseas'),
                ];
                const data = [];
                Object.keys(servicesProportion)
                    .forEach(number => {
                        data.push({
                            name: names[number],
                            value: servicesProportion[number]
                        });
                    });
                this.$nextTick(() => {
                    this.charts.operatorChart.setOption(getAnnularOption(data,'sms'));
                });
            },
            goToSmsReport() {
                this.$router.push({
                    name: 'exportOriginalData',
                    query: {type: this.TYPE ? 3 : 1}
                });
            },
        },
        filters: {
            nullFilter: function (originalVal, type = '/') {
                return originalVal ? originalVal : type;
            },
            valRatio: function (val, tail = '%') {
                if (typeof val === 'string') return val;
                return `${val}${tail}`;
            }
        },
        components: {
            JourneyPicker,
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .sms-send-report {
        .page-content {
            height: calc(100vh - 168px);
            .journey-picker {
                width: unset;
            }
        }
        .report-header {
            padding: 16px;
            line-height: $input-field-height;
            background-color: white;
            margin-top: 32px;

            .download-action {
                width: 24px;
                height: 24px;
                line-height: 24px;
                border-radius: 50%;
                background-color: $theme;
                text-align: center;
                cursor: pointer;

                svg {
                    width: 12px;
                    height: 12px;
                    margin-top: 6px;
                    fill: #fff;
                }
            }
        }
        .multi-select {
            width: 200px;
        }
        .pager {
            margin-right: 40px;
        }
        .back {
            margin-top: 24px;
        }
    }
</style>
