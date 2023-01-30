<template>
    <div class="enterprise-broadcast-report">
        <div class="page-content">
            <div class="content-view back">
                <router-link tag="button" :to="{name: 'journeySendReport'}" class="btn btn-theme btn-md">
                    {{ $t('data.backList') }}
                </router-link>
            </div>
            <div class="content-view margin report-header">
                {{ $t('data.reportSource') }}:
                <selector class="lg" :options="dataSourceList" v-model="dataSourceId" @select="sourceChange"></selector>

                <date-range format="YYYY-MM-DD" :start="dateRange.startDate" :end="dateRange.endDate"
                            @change="changeDate" v-if="!dataSourceId" :partCuts="partCuts"/>

                <selector class="hg" ref="select" :options="journeyList" v-if="selectorGroupShow"
                          v-model="journeyId" @select="selectJourney" @search="searchJourney"
                          search="async" @hide="hideJourneyList" @load="loadMore"></selector>

                <!--dataSourceId=1 指定旅程-->
                <journey-picker v-if="dataSourceId === 1" :value="journeyId" @input="selectId"></journey-picker>

                <!--taskList-->
                <selector class="hg" :options="taskList" v-if="selectorTaskListShow" v-model="taskId"
                        @select="selectTask" search="async" @search="searchTask" @load="loadMoreTask"></selector>

                <!--直接弹窗下载-->
                <div class="download-action pull-right" @click="toDownload">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-download"></use>
                    </svg>
                </div>
            </div>
            <div class="content-view  margin">
                <div class="charts">
                    <div class="chart half right-margin">
                        <div class="chart-head">
                            <h5>{{'controller.sendEmployee' | t}}</h5>
                            <span class="disabled-text">
                                {{'controller.statisticsTimeTips' | t}}
                            </span>
                        </div>
                        <div :class="['md', 'chart-body', {empty: !reportMap.sendData}]" ref="sendStaffChart"></div>
                    </div>
                    <div class="chart half">
                        <div class="chart-head">
                            <h5>{{'controller.sendContact' | t}}</h5>
                            <span class="disabled-text">
                                {{'controller.statisticsTimeTips' | t}}
                            </span>
                        </div>
                        <div :class="['md', 'chart-body', {empty: !reportMap.sendContactReport}]" ref="contactChart"></div>
                    </div>
                </div>
                <div class="charts one-third">
                    <div class="chart right-margin">
                        <div class="chart-head">
                            <h5>{{'controller.failReason' | t}}</h5>
                            <span class="disabled-text">{{'controller.statisticsTimeTips' | t}}</span>
                        </div>
                        <div :class="['chart-body','md', {empty: !notDeliveredFlag}]" ref="notDeliveredChart"></div>
                    </div>
                </div>
            </div>
        </div>
        <!--下载弹窗-->
        <download-detail-modal v-if="downloadFlag" :theme-modules="'wecomBroadcast'"
        @cancel="cancelDownload" @okDownload="sureDownload"></download-detail-modal>
    </div>
</template>

<script>
    import {eachDay, subDays,format} from 'date-fns';
    import { JourneyApiV2, JourneyApiV3, WecomApiV1} from '@/api';
    import JourneyPicker from '../components/journey-picker.vue';

    const LOCAL_JOURNEY_DATA = 'LOCAL_JOURNEY_DATA';

    import { getChartInstance, resize } from '../chartUtils/chartUtils';
    import { getFunnelOption, getAnnularOption } from '../chartUtils/chartOptions';

    export default {
        name: 'EnterpriseBroadcastReport',
        data() {
            return {
                dataSourceList: [
                    {name: this.$t('data.byJourneyFirstTime'), id: 0},
                    {name: this.$t('data.selectedJourneys'), id: 1},
                ],
                dataSourceId: 0, // 数据源Id
                dateRange: {
                    startDate: '',
                    endDate: ''
                },
                partCuts: ['YESTERDAY', 'TODAY', 'LAST_WEEK', 'THIS_WEEK', 'LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS'],
                journeyPageNo: 1,
                journeyTotalPage: 1,
                journeyKeyWord: '',
                journeyList: [],  // 旅程列表
                journeyId: null,  // 旅程id

                taskList: [],  // 旅程任务列表
                taskLoading: false,
                taskPageNumber: 1,
                taskKeyWord: '',
                totalPageTask: 1,
                loadingTask: false,
                taskId: null,  // 旅程任务id

                campaignId: null,

                downloadFlag: false, //下载弹窗显隐

                reportMap: {
                    sendData: null,
                    sendContactReport: null, //送达联系人
                    servicesProportion: null, //未送达原因
                },
                charts: {
                    sendStaffChart: null,
                    contactChart: null,
                    notDeliveredChart: null,
                },

                resizer: null,
            };
        },
        components: {
            JourneyPicker
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
            notDeliveredFlag() {
                return this.reportMap.servicesProportion &&
                    typeof this.reportMap.servicesProportion.unsentProbability === 'number';
            }
        },
        mounted() {
            const journeyData = JSON.parse(localStorage.getItem(LOCAL_JOURNEY_DATA));
            if (journeyData) {
                this.dataSourceId = journeyData.dataSourceId ? 1 : 0;
                this.dateRange = journeyData.dateRange || {startDate: '', endDate: ''};
                // 旅程分组id
                this.journeyId = journeyData.journeyId > 0 ? journeyData.journeyId : null;
                this.taskId = journeyData.taskId || null;
                this.taskIds = [];
                this.taskIds.push(this.taskId);
                this.getReportData();
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
            window.removeEventListener('resize', this.mapResize);
            next();
        },
        methods: {
            // 修改数据来源
            sourceChange(source) {
                // 筛选时间段,时间默认最近30天
                if (source.id === 0) {
                    this.dateRange = {
                        startDate: format(subDays(new Date(),30),'YYYY-MM-DD'),
                        endDate: format(subDays(new Date(),1),'YYYY-MM-DD'),
                    };
                    this.getJourney();
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
                this.taskList = [];
                //重绘图标
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
                // , 0:邮件,1:短信,2:微信,3:彩信 14.应用消息 15.企业群发
                    .getTasks([], '', [this.journeyId], this.taskPageNumber++, this.taskKeyWord, '', 15,
                        this.taskId > 0 ? this.taskId : null)
                    .then(({body: {data: {taskInstantiationList,totalPage}}}) => {
                        this.totalPageTask = totalPage;
                        this.taskList = this.taskList.concat(taskInstantiationList);
                        // 非选择状态，不请求图表接口
                        // if (checkerTask) {
                        //     if (this.taskId > 0) {
                        //         this.taskList.map(item => {
                        //             if (item.id === this.taskId) {
                        //                 this.campaignId = item.campaignId;
                        //             }
                        //         });
                        //         // 获取campaignId之后画图
                        //         // this.campaignId && this.getOperatorList();
                        //         // this.campaignId && this.getReportData();
                        //         // 修改选择全部任务时， 未传全部campaignId, number++的原因这里要 -1判断
                        //     } else if (this.taskPageNumber - 1 >= this.totalPageTask) {
                        //         // this.getOperatorList();
                        //         this.getReportData();
                        //     }
                        // }
                        let idx = this.taskList.findIndex(task => task.id === -1);
                        if (this.taskList && this.taskList.length !== 0 && idx < 0) {
                            this.taskList.unshift({id: -1, name:'全部企业微信任务'});
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
            // 选择旅程任务
            selectTask(taskItem) {
                this.taskIds = [];
                if (taskItem.id > 0) {
                    this.taskId = taskItem.id;
                    this.taskIds.push(this.taskId);
                } else {
                    this.taskList.map(e => {
                        if (e.id > 0) {
                            this.taskIds.push(e.id);
                        }
                    });
                }
                // this.campaignId = taskItem.campaignId || -1;
                // 修改选择全部任务时， 未传全部campaignId
                this.taskKeyWord = '';
                this.taskPageNumber = 1;
                this.taskList = [];
                this.checkerTask([], this.taskId);
                this.$nextTick(() => {
                    this.getReportData();
                });
            },
            // 搜索旅程任务, 初始化搜索参数
            searchTask(searchResult) {
                this.taskKeyWord = searchResult;
                this.taskList = [];
                this.taskLoading = false;
                this.taskPageNumber = 1;
                this.totalPageTask = Infinity;
                this.loadMoreTask();
            },
            //ready 下载
            toDownload() {
                // if (!this.taskId) return this.$toast('请选择任务', 'warn');
                this.downloadFlag = true;
            },
            cancelDownload() {
                this.downloadFlag = false;
            },
            //确定下载
            sureDownload(downloadInfo) {
                this.downloadFlag = false;
                let obj = {
                    email: downloadInfo.emailAddress,
                    unicode: downloadInfo.dataFormat === 'utf8' ? 0 : 1,
                    formatType: downloadInfo.formatType,
                    emailSubject: downloadInfo.emailSubject,
                    type: 2,
                    taskIds: this.taskIds
                };
                WecomApiV1
                    .exportWecomData(obj)
                    .then(() => {
                        this.$toast(this.$t('report.exportSuccess'), 'success');
                    });
            },
            //获取任务发送总数送达总数
            getReportData() {
                if (this.taskIds.length === 0) return;
                JourneyApiV3
                    .getWecomSendInfo(this.taskIds)
                    .then((res) => {
                        let numData = res.body.data;
                        this.reportMap.sendData = {
                            entryStaffCount: numData.entryStaffCount,
                            sendStaffCount: numData.sendStaffCount
                        };
                        this.reportMap.sendContactReport = {
                            sendContactCount: numData.sendContactCount,
                            realitySendContactCount: numData.realitySendContactCount,
                        };
                        this.reportMap.servicesProportion = {
                            unsentProbability: numData.unsentProbability,
                            unfriendProbability: numData.unfriendProbability,
                            receivedProbability: numData.receivedProbability,
                        };
                        this.renderCharts();
                    });

            },
            //初始化图标实例
            renderCharts() {
                this.staffCharts();
                this.contactCharts();
                this.unsentChart();
            },
            //发送员工
            staffCharts() {
                this.charts.sendStaffChart = getChartInstance(this.$refs.sendStaffChart);
                if (!this.reportMap.sendData) return;
                const {entryStaffCount, sendStaffCount} = this.reportMap.sendData;
                this.$nextTick(() => {
                    this.charts.sendStaffChart
                        .setOption(getFunnelOption([
                            {name: this.$t('controller.enterEmployees'), value: entryStaffCount},
                            {name: this.$t('controller.sendEmployee'), value: sendStaffCount}
                        ]));
                });
            },
            //发送联系人
            contactCharts() {
                this.charts.contactChart = getChartInstance(this.$refs.contactChart);
                if (!this.reportMap.sendContactReport) return;
                const {sendContactCount, realitySendContactCount} = this.reportMap.sendContactReport;
                this.$nextTick(() => {
                    this.charts.contactChart
                        .setOption(getFunnelOption([
                            {name: this.$t('controller.sendContact'), value: sendContactCount},
                            {name: this.$t('controller.deliveryContact'), value: realitySendContactCount}
                        ]));
                });
            },
            //未送达原因
            unsentChart() {
                this.charts.notDeliveredChart = getChartInstance(this.$refs.notDeliveredChart);
                const servicesProportion = this.reportMap.servicesProportion;
                if (!servicesProportion || typeof servicesProportion.unsentProbability != 'number') return;
                this.charts.notDeliveredChart
                    .setOption(getAnnularOption([
                        {name: this.$t('controller.beenSend'), value: servicesProportion.unsentProbability},
                        {name: this.$t('controller.nonFriends'), value: servicesProportion.unfriendProbability},
                        {name: this.$t('controller.failSend'), value: servicesProportion.receivedProbability},
                    ], 'wecom'));

            },
            // 清空图表数据
            clearCharts() {
                this.reportMap.sendData = null;
                this.reportMap.sendContactReport = null;
                this.reportMap.servicesProportion = null;
                if (this.charts.contactChart) this.charts.contactChart.clear();
                if (this.charts.notDeliveredChart) this.charts.notDeliveredChart.clear();
                if (this.charts.sendStaffChart) this.charts.sendStaffChart.clear();
            },
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .enterprise-broadcast-report {
        .page-content {
            height: calc(100vh - 168px);
            .journey-picker {
                width: unset;
            }
            .back {
                margin-top: 30px;
            }
        }
        .report-header{
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
        .one-third{
            width: 50.5%;
        }
    }
</style>
