<template>
    <div class="journey-review-report">
        <div class="page-content">
            <div class="show-time">
                <i class="show-time-icon"></i>
                {{'data.dateRule' | t}}
            </div>
            <div class="content-view margin report-header">
                {{'data.reportSource' | t}}
                <journey-task-select :useItems="'overview'" :id="journeyId"
                    :date="dateRange"
                    :source="dataSourceId" @select="chosenJourney($event)"
                    :need-real-time="true" :customizePartCuts="partCuts"/>
            </div>
            <div class="content-view margin">
                <div class="charts" ref="charts">
                    <!-- chart1 -->
                    <div class="chart half right-margin">
                        <div class="chart-head">
                            <div class="chart-summary-number">
                                <span class="number">{{journeySum}}</span>
                                <span class="disabled-text">{{'data.totalRecipients' | t}}</span>
                            </div>
                            <h5>
                                {{'data.totalRecipients' | t}}
                                <span class="icon icon-help" v-title="$t('data.receiptTip')"></span>
                            </h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                        </div>
                        <div class="simplify-table">
                            <table>
                                <thead>
                                <tr>
                                    <td :title="$t('data.journeyName')">{{'data.journeyName' | t}}</td>
                                    <td :width="100" :title="$t('data.totalRecipients')">{{'data.totalRecipients' | t}}</td>
                                    <td :title="$t('data.startTime')">{{'data.startTime' | t}}</td>
                                </tr>
                                </thead>
                            </table>
                            <div class="metadata-table-content">
                                <table>
                                    <tbody>
                                    <tr v-for="item in journeyList">
                                        <td :title="item.journeyName">{{item.journeyName}}</td>
                                        <td :width="100">{{item.journeyCount}}</td>
                                        <td :title="item.startDate">{{item.startDate}}</td>
                                    </tr>
                                    </tbody>
                                </table>
                                <list-empty v-if="journeyList.length === 0"/>
                            </div>
                        </div>
                    </div>
                        <!-- chart2 -->
                    <div class="chart half">
                        <div class="chart-head">
                            <div class="chart-summary-number">
                                <span class="number">{{milestoneSum}}</span>
                                <span class="disabled-text">{{'data.hits' | t}}</span>
                            </div>
                            <h5>
                                {{'data.milestonesHits' | t}}
                                <span class="icon icon-help" v-title="$t('data.milestonesTip')"></span>
                            </h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                        </div>
                        <div class="chart-body md" ref="milestoneChart"
                            :class="{empty: charts.milestoneChart_no_data}"></div>
                    </div>
                        <!-- chart3 -->
                    <div class="chart chart3">
                        <div class="chart-head">
                            <h5>
                                {{'data.performance' | t}}
                                <span class="icon icon-help" v-title="$t('data.performanceTip')"></span>
                            </h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                            <selector class="selector" :options="timeZoneRanges" v-model="timeZone" @select="selectTimeZone"></selector>
                        </div>
                        <div class="chart-body lg" ref="journeyChart"
                             :class="{empty: charts.journeyChart_no_data}"></div>
                    </div>
                        <!-- chart4 -->
                    <div class="chart half right-margin">
                        <div class="chart-head">
                            <div class="chart-summary-number">
                                <span class="number">{{emailData.clicked}}</span>
                                <span class="disabled-text">{{'data.clicked' | t}}</span>
                            </div>
                            <div class="chart-summary-number">
                                <span class="number">{{emailData.opened}}</span>
                                <span class="disabled-text">{{'data.opened' | t}}</span>
                            </div>
                            <div class="chart-summary-number">
                                <span class="number">{{emailData.accepted}}</span>
                                <span class="disabled-text">{{'data.accept' | t}}</span>
                            </div>
                            <div class="chart-summary-number">
                                <span class="number">{{emailData.sent}}</span>
                                <span class="disabled-text">{{'data.sent' | t}}</span>
                            </div>
                            <h5>
                                {{'data.emailPerformance' | t}}
                                <span class="icon icon-help" v-title="$t('data.emailTip')"></span>
                            </h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                        </div>
                        <div class="chart-body md" ref="emailChart"></div>
                    </div>
                        <!-- chart5 -->
                    <div class="chart half">
                        <div class="chart-head">
                            <div class="chart-summary-number">
                                <span class="number">{{wechatData.accepted}}</span>
                                <span class="disabled-text">{{'data.accept' | t}}</span>
                            </div>
                            <div class="chart-summary-number">
                                <span class="number">{{wechatData.sent}}</span>
                                <span class="disabled-text">{{'data.sent' | t}}</span>
                            </div>
                            <h5>
                                {{'data.wechatPerformance' | t}}
                                <span class="icon icon-help" v-title="$t('data.wechatTip')"></span>
                            </h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                        </div>
                        <div class="chart-body md" ref="wechatChart"></div>
                    </div>
                        <!-- chart6 -->
                    <div class="chart half right-margin">
                        <div class="chart-head">
                            <div class="chart-summary-number">
                                <span class="number">{{smsData.accepted}}</span>
                                <span class="disabled-text">{{'data.accept' | t}}</span>
                            </div>
                            <div class="chart-summary-number">
                                <span class="number">{{smsData.sent}}</span>
                                <span class="disabled-text">{{'data.sent' | t}}</span>
                            </div>
                            <h5>
                                {{'data.smsClickTransfer' | t}}
                                <span class="icon icon-help" v-title="$t('data.smsTip')"></span>
                            </h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                        </div>
                        <div class="chart-body md" ref="smsChart"></div>
                    </div>
                        <!-- chart7 -->
                    <div class="chart half">
                        <div class="chart-head">
                            <div class="chart-summary-number">
                                <span class="number">{{mmsData.accepted}}</span>
                                <span class="disabled-text">{{'data.accept' | t}}</span>
                            </div>
                            <div class="chart-summary-number">
                                <span class="number">{{mmsData.sent}}</span>
                                <span class="disabled-text">{{'data.sent' | t}}</span>
                            </div>
                            <h5>
                                {{'data.mmsPerformance' | t}}
                                <span class="icon icon-help" v-title="$t('data.mmsTip')"></span>
                            </h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                        </div>
                        <div class="chart-body md" ref="mmsChart"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { JourneyApiV1, JourneyApiV3 } from '@/api';
    import {getChartInstance, hideLoading, resize, showLoading} from '../chartUtils/chartUtils';
    import journeyTaskSelect from '../components/journey-task-select.vue';
    import {
        getMileLineOption,
        getFunnelOption,
        getAnnularOption,
        getHourBarOption
    } from '../chartUtils/chartOptions';
    import format from 'date-fns/format';
    import subDays from 'date-fns/sub_days';
    import {TIME_ZONE_RNAGES} from '../../../../common/utils/timeZone';

    const LOCAL_JOURNEY_DATA = 'LOCAL_JOURNEY_DATA';
    const LOCAL_TIME_ZONE = 'LOCAL_TIME_ZONE';
    export default {
        data() {
            return {
                dataSourceId: 0,
                dateRange: {
                    startDate: '',
                    endDate: ''
                },
                journeyList: [],
                journeyId: null,
                resize: null,
                charts: {
                    // echarts instances
                    touchChart: null,
                    touchChart_no_data: true,
                    milestoneChart: null,
                    milestoneChart_no_data: true,
                    journeyChart: null,
                    journeyChart_no_data: true,
                    emailChart: null,
                    wechatChart: null,
                    smsChart: null,
                    mmsChart: null
                },
                updateDate: '',
                partCuts: ['YESTERDAY', 'TODAY', 'LAST_WEEK', 'THIS_WEEK', 'LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS'],
                timeZone: '',
                timeZoneRanges: TIME_ZONE_RNAGES,
                timeZoneBarData: [],
                // 画图数据
                journeySum: 0,
                milestoneSum: 0,
                emailData: {
                    accepted: 0,
                    clicked: 0,
                    opened: 0,
                    sent: 0
                },
                smsData: {
                    accepted: 0,
                    sent: 0
                },
                mmsData: {
                    accepted: 0,
                    sent: 0
                },
                wechatData: {
                    accepted: 0,
                    sent: 0
                }
            };
        },
        computed: {
            // 接口请求数据
            sendData() {
                return {
                    startDate: this.dateRange.startDate,
                    endDate: this.dateRange.endDate,
                    journeyId: this.journeyId > 0 ? this.journeyId : ''
                };
            },
            // 本地存储数据
            journeyData() {
                return {
                    journeyId: this.journeyId, 
                    dataSourceId: this.dataSourceId,
                    dateRange: this.dateRange,
                    timeZone: this.timeZone,
                };
            },
            //时区小时数据列表
            hoursList() {
                let differentHour = 0;
                let tz = this.timeZone;
                differentHour = Number(tz.substring(0,3)) - 8;
                differentHour = tz.substring(4) === '00' ? differentHour : differentHour + 1;
                let hours = new Array(24).fill('时');
                let hourArr = hours.map((item,key) => {
                    if (key + differentHour < 0) {
                        return '-' + Number(key + differentHour + 24) + item;
                    } else if (key + differentHour > 23) {
                        return '+' + Number(key + differentHour - 24) + item;
                    }
                    return key + differentHour + item;
                });
                return hourArr;
            }
        },
        mounted() {
            let journeyData = JSON.parse(localStorage.getItem(LOCAL_JOURNEY_DATA));
            // 默认系统配置时区或 '+8:00'时区
            let defaultTimeZone = this.$store.state.user.timeZone !== '' ? this.$store.state.user.timeZone : '+08:00';
            this.timeZone = localStorage.getItem(LOCAL_TIME_ZONE) || defaultTimeZone;
            if (journeyData) {
                this.dataSourceId = journeyData.dataSourceId ? 1 : 0;
                this.dateRange = journeyData.dateRange || {startDate: '', endDate: ''};
                this.journeyId = journeyData.journeyId || null;
                // 时间段不存在并且数据来源为筛选时间段时，默认选中过去30天内开始的所有旅程的汇总报告
                if (!journeyData.dataSourceId && journeyData.startDate === '') {
                    this.getPastDays();
                }
            } else {
                this.dataSourceId = 0;
                this.getPastDays();
                this.journeyId = -1;
            }
            this.$nextTick(() => {
                this.getUpdateDate();
            }); 
            // register a resize handler
            this.resizer = resize(this.charts);
            window.addEventListener('resize', this.resizer);
            if (this.journeyId) {
                this.renderCharts();
            }
        },
        beforeRouteLeave(to, from, next) {
            // 路由在线上营销活动中切换时本地存储
            if (to.meta.auth === 'journeyReport') {
                localStorage.setItem(LOCAL_JOURNEY_DATA, JSON.stringify(this.journeyData));
                localStorage.setItem(LOCAL_TIME_ZONE, this.timeZone);
            } else {
                localStorage.removeItem(LOCAL_JOURNEY_DATA);
                localStorage.removeItem(LOCAL_TIME_ZONE);
            }
            window.removeEventListener('resize', this.resizer);
            next();
        },
        beforeRouteUpdate(to, from, next) {
            localStorage.setItem(LOCAL_JOURNEY_DATA, JSON.stringify(this.journeyData));
            localStorage.setItem(LOCAL_TIME_ZONE, this.timeZone);
            window.removeEventListener('resize', this.resizer);
            next();
        },
        methods: {
            // 获取过去三十天的日期
            getPastDays() {
                let dayNow = format(new Date(),'YYYY-MM-DD'),
                    endDay = format(subDays(dayNow,1),'YYYY-MM-DD'),
                    startDay = format(subDays(dayNow,30),'YYYY-MM-DD');
                this.dateRange.startDate = startDay;
                this.dateRange.endDate = endDay;
            },
            // 获取页面更新时间
            // 需删除：   判断旅程概览页面的入口
            getUpdateDate() {
                JourneyApiV1
                    .getUpdateDate('journey', this.$route.params && this.$route.params.journeyInstantiationId || null)
                    .then((res) => {
                        this.updateDate = res.body.data.date;
                    });
            },
            chosenJourney(data) {
                this.dataSourceId = data.selectType;
                this.dateRange = data.dateRange;
                this.journeyId = data.id;
                if (this.journeyId) {
                    this.renderCharts();
                } else {
                    this.clearCharts();
                }
                localStorage.setItem(LOCAL_JOURNEY_DATA, JSON.stringify(this.journeyData));
            },
            clearCharts() {
                this.charts.touchChart && this.charts.touchChart.clear();
                this.charts.milestoneChart && this.charts.milestoneChart.clear();
                this.charts.journeyChart && this.charts.journeyChart.clear();
                this.charts.touchChart_no_data = true;
                this.charts.milestoneChart_no_data = true;
                this.charts.journeyChart_no_data = true; 
                // 来源切换时若仍有接口在loading，则取消loading，内容置空 
                this.charts.touchChart && hideLoading(this.charts.touchChart);
                this.charts.milestoneChart && hideLoading(this.charts.milestoneChart);
                this.charts.journeyChart && hideLoading(this.charts.journeyChart);
                this.charts.emailChart && hideLoading(this.charts.emailChart);
                this.charts.wechatChart && hideLoading(this.charts.wechatChart);
                this.charts.smsChart && hideLoading(this.charts.smsChart);
                this.charts.mmsChart && hideLoading(this.charts.mmsChart);
                this.emailData = {
                    accepted: 0,
                    clicked: 0,
                    opened: 0,
                    sent: 0
                };
                this.smsData = {
                    accepted: 0,
                    sent: 0
                };
                this.mmsData = {
                    accepted: 0,
                    sent: 0
                };
                this.wechatData = {
                    accepted: 0,
                    sent: 0
                };
            },
            renderCharts() {
                // chart 1 旅程触达人数
                JourneyApiV3
                    .getJourneyCount(this.sendData)
                    .then(({body: {data:{journeyList, journeySum}}}) => {
                        this.journeySum = journeySum;
                        this.journeyList = journeyList;
                    });

                // chart 2 里程碑达成统计
                this.charts.milestoneChart_no_data = false;
                this.charts.milestoneChart = getChartInstance(this.$refs.milestoneChart);
                showLoading(this.charts.milestoneChart);
                JourneyApiV3
                    .getMilestoneRecord(this.sendData)
                    .then(({body: {data: {milestoneList, milestoneSum}}}) => {
                        hideLoading(this.charts.milestoneChart);
                        this.milestoneSum = milestoneSum;
                        if (milestoneList.length === 0) {
                            this.charts.milestoneChart.clear();
                            this.charts.milestoneChart_no_data = true;
                        } else {
                            this.charts.milestoneChart_no_data = false;
                            let xData = milestoneList.map(item =>{
                                return this.$t('journey.milestone') + ': ' + item.milestoneName;
                            });
                            let seriesData = milestoneList.map(item => {
                                return item.milestoneCount;
                            });
                            this.charts.milestoneChart.setOption(getMileLineOption(xData, seriesData));
                        }
                    });

                // chart 3 渠道事件分时段分布
                this.charts.journeyChart_no_data = false;
                this.charts.journeyChart = getChartInstance(this.$refs.journeyChart);
                showLoading(this.charts.journeyChart);
                JourneyApiV3
                    .getChannelCount(this.sendData)
                    .then(({body: {data: {emailClickList, emailOpenList, mmsClickList, smsClickList}}}) => {
                        hideLoading(this.charts.journeyChart);
                        this.charts.journeyChart_no_data = false;
                        // let list = [];
                        // smsClickList.map((item, index) => {
                        //     list.push(item + emailOpenList[index] + mmsClickList[index] + emailClickList[index]);
                        // });
                        let 
                            // obj1 = {name: this.$t('data.totalEvents'), data: list},
                            obj2 = {name: this.$t('data.emailOpen'), data: emailOpenList},
                            obj3 = {name: this.$t('data.emailClick'), data: emailClickList},
                            obj4 = {name: this.$t('data.smsClick'), data: smsClickList},
                            obj5 = {name: this.$t('data.mmsClick'), data: mmsClickList},
                            sendJourneyData = new Array(obj2,obj3,obj4,obj5);
                        this.timeZoneBarData = sendJourneyData;
                        this.charts.journeyChart.setOption(
                            getHourBarOption(sendJourneyData,this.hoursList),
                            {notMerge: true}
                        );
                    });

                // chart 4 邮件点击转化
                this.charts.emailChart = getChartInstance(this.$refs.emailChart);
                showLoading(this.charts.emailChart);
                JourneyApiV3
                    .getEmailClick(this.sendData)
                    .then(({body: {data: {accepted, clicked, opened, sent}}}) => {
                        hideLoading(this.charts.emailChart);
                        this.charts.emailChart
                            .setOption(getFunnelOption([
                                {name: this.$t('data.sent'), value: sent},
                                {name: this.$t('data.accept'), value: accepted},
                                {name: this.$t('data.opened'), value: opened},
                                {name: this.$t('data.clicked'), value: clicked}
                            ]));
                        this.emailData = {accepted, clicked, opened, sent};
                    });

                // chart 5 微信送达转化
                this.charts.wechatChart = getChartInstance(this.$refs.wechatChart);
                showLoading(this.charts.wechatChart);
                JourneyApiV3
                    .getWechatDelivery(this.sendData)
                    .then(({body: {data: {accepted, sent}}}) => {
                        hideLoading(this.charts.wechatChart);
                        let data = [
                            {value: sent,name: this.$t('data.sent')},
                            {value: accepted,name: this.$t('data.accept')},
                        ];
                        this.charts.wechatChart
                            .setOption(getAnnularOption(data, 'wechat'));
                        this.wechatData = {accepted, sent};
                    });


                // chart 6 短信点击转化
                this.charts.smsChart = getChartInstance(this.$refs.smsChart);
                showLoading(this.charts.smsChart);
                JourneyApiV3
                    .getSmsActive(this.sendData)
                    .then(({body: {data: {accepted, sent}}}) => {
                        hideLoading(this.charts.smsChart);
                        this.charts.smsChart
                            .setOption(getFunnelOption([
                                {name: this.$t('data.sent'), value: sent},
                                {name: this.$t('data.accept'), value: accepted},
                            ]));
                        this.smsData = {accepted, sent};
                    });


                // chart 7 彩信点击转化
                this.charts.mmsChart = getChartInstance(this.$refs.mmsChart);
                showLoading(this.charts.mmsChart);
                JourneyApiV3
                    .getMmsActive(this.sendData)
                    .then(({body: {data: {accepted, sent}}}) => {
                        hideLoading(this.charts.mmsChart);
                        this.charts.mmsChart
                            .setOption(getFunnelOption([
                                {name: this.$t('data.sent'), value: sent},
                                {name: this.$t('data.accept'), value: accepted},
                            ]));
                        this.mmsData = {accepted, sent};
                    });
            },
            selectTimeZone() {
                this.charts.journeyChart.setOption(
                    getHourBarOption(this.timeZoneBarData,this.hoursList),
                    {notMerge: true}
                );
            }
        },
        components: {
            journeyTaskSelect
        }
    };
</script>
<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .journey-review-report {
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
            .journey-task-select {
                display: inline-block;
            }
        }
        .simplify-table {
            width: 100%;
            height: 280px;
            padding: 0 5px;
            overflow-y: auto;
            box-sizing: border-box;
        }
        .chart3 .chart-head{
            position: relative;
            overflow: inherit;
            .selector{
                position: absolute;
                top: 22px;
                right: 16px;
                width: 40%;
                z-index: 9;
            }
        }
    }
</style>
