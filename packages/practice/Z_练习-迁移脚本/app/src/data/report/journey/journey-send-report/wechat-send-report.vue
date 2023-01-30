<template>
    <div class="wechat-send-report">
        <div class="page-content">
            <div class="content-view back">
                <router-link tag="button" :to="{name: 'journeySendReport'}" class="btn btn-theme btn-md">{{
                    $t('data.backList') }}
                </router-link>
            </div>
            <div class="content-view margin report-header">
                {{'data.reportSource' | t}}
                <journey-task-select :useItems="'export'" :id="journeyId"
                                     :date="dateRange"
                                     :source="dataSourceId" @select="chosenJourney($event)"
                                     :customizePartCuts="partCuts"/>
                <selector class="hg" :options="taskList" v-model="taskId" @search="searchTask"
                          @load="loadMoreTask" v-if="journeyId" @select="selectTask"
                          search="async" :placeholder="$t('data.selectTask')" @hide="hideTask"/>
            </div>
            <div class="content-view margin">
                <div class="charts">
                    <!-- 1. 送达统计 -->
                    <div class="chart half right-margin">
                        <div class="chart-head">
                            <h5>
                                {{'data.SendSum' | t}}
                                <span class="icon icon-help" v-title="$t('data.sendNumber')"></span>
                            </h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{'data.realTimes' | t}}</span>
                        </div>
                        <div class="chart-body md">
                            <div class="charts-row">
                                <div class="chart-cell">
                                    <div class="tiny-chart" ref="sendCount"></div>
                                    <h3 class="wechat-report-chart-title">
                                        {{sendCount}}
                                        <span class="disabled-text">{{'data.sendNum' | t}}</span>
                                    </h3>
                                </div>
                            </div>
                            <div class="charts-row">
                                <div class="chart-cell">
                                    <div class="tiny-chart" ref="deliveryCount"></div>
                                    <h3 class="wechat-report-chart-title">
                                        {{deliveryCount}}
                                        <span class="disabled-text">{{'data.sendSum' | t}}</span>
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 2. 粉丝活跃次数统计 -->
                    <div class="chart half">
                        <div class="chart-head">
                            <div class="chart-summary-number">
                                <span class="number">{{readCount | count}}</span>
                                <span class="disabled-text">{{'data.readTime' | t}}</span>
                            </div>
                            <div class="chart-summary-number">
                                <span class="number">{{shareCount | count}}</span>
                                <span class="disabled-text">{{'data.shareTime' | t}}</span>
                            </div>
                            <h5>{{'data.fansActivity' | t}}<span class="icon icon-help"
                                                                 v-title="$t('data.readTrend')"></span></h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                        </div>
                        <div class="chart-body md" ref="activeCount" :class="{empty: charts.activeCount_no_data}"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { JourneyApiV1, JourneyApiV2, WechatApiV3, WechatApiV1 } from '@/api';
    import {eachDay, format} from 'date-fns';
    import {getChartInstance, hideLoading, resize, showLoading} from '../chartUtils/chartUtils';
    import {barWithLineOption, getTinyPieOption} from '../chartUtils/chartOptions';
    import journeyTaskSelect from '../components/journey-task-select.vue';
    import subDays from 'date-fns/sub_days';

    const LOCAL_JOURNEY_DATA = 'LOCAL_JOURNEY_DATA';

    export default {
        data() {
            return {
                dataSourceId: 0,
                dateRange: {
                    startDate: '',
                    endDate: ''
                },
                partCuts: ['YESTERDAY', 'TODAY', 'LAST_WEEK', 'THIS_WEEK', 'LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS'],
                journeyId: 0,
                journeyList: [],
                taskList: [],
                taskId: '',
                // 图表
                charts: {
                    sendCount: null,
                    deliveryCount: null,
                    activeCount: null,
                    activeCount_no_data: true,
                },
                resizer: null,

                sendCount: 0,
                deliveryCount: 0,
                readCount: 0,
                shareCount: 0,
                pageNumberTask: 1,
                totalPageTask: 1,
                keyWordTask: '',
                updateDate: '',
            };
        },
        mounted() {
            let journeyData = JSON.parse(localStorage.getItem(LOCAL_JOURNEY_DATA));
            if (journeyData) {
                this.dataSourceId = journeyData.dataSourceId ? 1 : 0;
                this.dateRange = journeyData.dateRange || {startDate: '', endDate: ''};
                this.journeyId = journeyData.journeyId > 0 ? journeyData.journeyId : null;
                this.taskId = journeyData.taskId || null;
            }
            // 回显旅程和任务
            this.$nextTick(() => {
                if (this.journeyId > 0) {
                    this.checkerTask([], this.taskId);
                    this.resizer = resize(this.charts);
                    window.addEventListener('resize', this.resizer);
                    // 只有任务id存在的情况下才画图
                    if (this.taskId) {
                        this.renderCharts();
                    }
                }
                this.getUpdateDate();
            });
        },
        computed: {
            // 旅程类型
            journeyType() {
                return parseInt(this.$route.params.journeyType) || parseInt(localStorage.getItem('journeyType'));
            },
            // 任务子类型 2模板消息
            subType() {
                return parseInt(this.$route.params.subType) || parseInt(localStorage.getItem('subType'));
            },
            // 定时旅程-模板消息
            timedTemplate() {
                return this.journeyType !== 2 && this.subType === 2;
            }
        },
        beforeRouteLeave(to, from, next) {
            window.removeEventListener('resize', this.resizer);
            next();
        },
        methods: {
            // 获取页面更新时间
            getUpdateDate() {
                JourneyApiV1
                    .getUpdateDate('journey', this.$route.params && this.$route.params.journeyInstantiationId || null)
                    .then((res) => {
                        this.updateDate = res.body.data.date;
                    });
            },
            loadMoreTask(checkerTask) {
                if (this.loadingTask) return;
                if (this.pageNumberTask > this.totalPageTask) return;
                this.loadingTask = true;
                JourneyApiV2
                    // 0:邮件,1:短信,2:微信
                    .getTasks([], '', [this.journeyId], this.pageNumberTask++, this.keyWordTask, '', 2,
                        this.taskId > 0 ? this.taskId : null)
                    .then(({body: {data: {taskInstantiationList, totalPage}}}) => {
                        this.totalPageTask = totalPage;
                        this.taskList = this.taskList.concat(taskInstantiationList);
                        let idx = this.taskList.findIndex(task => task.id === -1);
                        if (this.taskList && this.taskList.length !== 0 && idx < 0) {
                            this.taskList.unshift({id: -1, name: this.$t('data.allWechatTask')});
                        }
                        this.journeyName = taskInstantiationList[0].journeyName;
                        this.journeyInstantiationId = taskInstantiationList[0].journeyInstantiationId;
                        this.loadingTask = false;
                        this.$nextTick(() => {
                            this.loadingTask = false;
                            if (typeof checkerTask === 'function') {
                                checkerTask(taskInstantiationList, this.taskId);
                            }
                        });
                    })
                    .catch(() => {
                        this.loadingTask = false;
                        this.pageNumberTask--;
                    });
            },
            searchTask(taskName) {
                this.pageNumberTask = 1;
                this.totalPageTask = Infinity;
                this.keyWordTask = taskName;
                this.taskList = [];
                this.loadMoreTask();
            },
            checkerTask(taskList = [], id) {
                // recover task
                const vm = this;
                let targetTask;
                targetTask = taskList.find(task =>
                    task.id === id
                );
                if (vm.totalPageTask >= vm.pageNumberTask && !targetTask) {
                    return vm.loadMoreTask(this.checkerTask);
                }
                if (targetTask) {
                    vm.taskId = id;
                    let task = taskList.map((item) => {
                        if (item.id === id) {
                            return item;
                        }
                    });
                    this.taskName = task[0].name;
                    this.copyAddress = task[0].copyAddress;
                }
            },
            hideTask() {
                this.keyWordTask = '';
                this.pageNumberTask = 1;
                this.taskList = [];
                this.loadMoreTask(this.checkerTask);
            },
            // 选择任务
            selectTask(task) {
                let taskList = this.taskList;
                this.taskName = task.name;
                this.copyAddress = task.copyAddress;
                this.journeyInstantiationId = task.journeyInstantiationId;
                this.taskId = task.id;
                this.keyWordTask = '';
                this.pageNumberTask = 1;
                this.taskList = [];
                // 回显选中的任务
                this.checkerTask([], task.id);
                this.$nextTick(() => {
                    this.renderCharts(taskList);
                });
            },
            chosenJourney(data) {
                this.dataSourceId = data.selectType;
                this.dateRange = data.dateRange;
                this.journeyId = data.id;
                this.taskId = '';
                this.taskName = '';
                this.pageNumberTask = 1;
                this.totalPageTask = 1;
                this.taskList = [];

                if (this.journeyId) {
                    // 获取该旅程下的所有微信任务列表
                    this.loadMoreTask();
                }
                this.clearCharts();
            },
            clearCharts() {
                this.charts.deliveryCount && this.charts.sendCount.clear();
                this.charts.deliveryCount && this.charts.deliveryCount.clear();
                this.charts.activeCount && this.charts.activeCount.clear();
                this.sendCount = 0;
                this.deliveryCount = 0;
                this.charts.activeCount_no_data = true;
                this.readCount = 0;
                this.shareCount = 0;
                hideLoading(this.charts.activeCount);
                hideLoading(this.charts.deliveryCount);
                hideLoading(this.charts.sendCount);
            },
            renderCharts(taskList) {
                let dates = eachDay(this.dateRange.startDate, this.dateRange.endDate);
                let newDates = dates.map(date => format(new Date(date), 'YYYY-MM-DD'));
                let start = '', end = '';
                if (!this.dateRange.startDate) {
                    end = format(new Date(), 'YYYY-MM-DD');
                    start = format(subDays(end, 30), 'YYYY-MM-DD');
                } else {
                    start = this.dateRange.startDate;
                    end = this.dateRange.endDate;
                }
                // 单个任务只传[taskId],若选中全部微信任务，则传所有id的数组
                let taskId = this.taskId > 0 ? [this.taskId] : taskList ?
                    taskList.map(item => {
                        if (item.id > 0) return item.id;
                    }) :
                    this.taskList.map(item => {
                        if (item.id > 0) return item.id;
                    });

                // chart 2 粉丝活跃次数统计
                this.charts.activeCount = getChartInstance(this.$refs.activeCount);
                showLoading(this.charts.activeCount);
                this.charts.activeCount_no_data = false;
                // 该接口必须传时间参数，默认30天
                WechatApiV3
                    .getActiveCount(taskId, start, end)
                    .then(({body: {data: {readCount, readList, shareCount, shareList}}}) => {
                        this.readCount = readCount;
                        this.shareCount = shareCount;
                        hideLoading(this.charts.activeCount);
                        if (this.readCount === 0 && this.shareCount === 0) {
                            this.charts.activeCount_no_data = true;
                            this.charts.activeCount && this.charts.activeCount.clear();
                        } else {
                            this.charts.activeCount_no_data = false;
                            this.$nextTick(() => {
                                this.charts.activeCount.setOption(barWithLineOption('wechat', [
                                    {name: this.$t('data.shareTime'), type: 'line', data: shareList},
                                    {name: this.$t('data.readTime'), type: 'bar', data: readList}
                                ], newDates));

                            });
                        }
                    });

                // chart 1 图文送达概览
                this.charts.sendCount = getChartInstance(this.$refs.sendCount);
                this.charts.deliveryCount = getChartInstance(this.$refs.deliveryCount);
                showLoading(this.charts.deliveryCount);
                showLoading(this.charts.sendCount);

                // 定时旅程-模板消息
                if (this.timedTemplate) {
                    // 任务发送总数
                    let _this = this;
                    WechatApiV3.getSendCount(taskId)
                        .then(res => {
                            this.sendCount = res.body.data.sendCount;
                            this.charts.sendCount.setOption(getTinyPieOption(this.sendCount, this.sendCount, this.$t('data.noOfReception'), 'wechat'));
                            hideLoading(this.charts.sendCount);
                            _this.fetchDeliveryCounts(taskId);
                        });
                } else {
                    // 非定时旅程-子任务类型
                    WechatApiV3
                        .getSendCount(taskId)
                        .then(({body: {data}}) => {
                            const {deliveryCount, sendCount} = data || {deliveryCount: 0, sendCount: 0};
                            this.$nextTick(() => {
                                this.sendCount = sendCount;
                                this.deliveryCount = deliveryCount;
                                this.charts.sendCount.setOption(getTinyPieOption(sendCount, sendCount, this.$t('data.noOfReception'), 'wechat'));
                                this.charts.deliveryCount.setOption(getTinyPieOption(deliveryCount, sendCount, this.$t('data.sendNumber'), 'wechat'));
                                hideLoading(this.charts.sendCount);
                                hideLoading(this.charts.deliveryCount);
                            });
                        });
                }
            },
            // 定时旅程-模板消息：实际送达人数
            fetchDeliveryCounts(taskId) {
                WechatApiV1
                    .getSendCount(taskId)
                    .then(res => {
                        this.deliveryCount = res.body.data.templateSendCounts || 0;
                        this.sendCount = res.body.data.templateTotalCount || 0;
                        this.charts.sendCount.setOption(getTinyPieOption(this.sendCount, this.sendCount, this.$t('data.noOfReception'), 'wechat'));
                        this.charts.deliveryCount.setOption(getTinyPieOption(this.deliveryCount, this.sendCount, this.$t('data.sendNumber'), 'wechat'));
                        hideLoading(this.charts.deliveryCount);
                    });
            }
        },
        components: {
            journeyTaskSelect
        },
        destroyed() {
            // 旅程-查看-报告页面跳转过来会带来参数
            localStorage.removeItem('journeyType');
            localStorage.removeItem('subType');
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .wechat-send-report {
        .page-content {
            height: calc(100vh - 168px);
        }

        .report-header {
            padding: 16px;
            line-height: $input-field-height;
            background-color: white;

            .journey-task-select {
                display: inline-block;

                .journey-picker {
                    width: unset;
                }
            }

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

        .back {
            margin-top: 24px;
        }
    }

</style>
