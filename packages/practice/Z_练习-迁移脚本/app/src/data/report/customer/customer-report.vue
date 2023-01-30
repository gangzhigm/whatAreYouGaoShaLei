<template>
    <div class="customer-related-report">
        <div class="content-view">
            <crumbs/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'home.customerReport' | t}}</h1>
                <!-- fixme 区间不能选择到今天以后 -->
                <date-range class="pull-right" format="YYYY-MM-DD" :start="startTime" :end="endTime"
                            @change="sure"></date-range>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view margin">
                <!--详情内容-->
                <ul class="list">
                    <li>
                        <img src="../img/total.png" alt="">
                        <div class="memberTotal" :tip="$t('data.realTime')">
                            <p class="total">{{pandect.customerCount}}</p>
                            <p class="name">{{'report.customerRelated' | t}}</p>
                        </div>
                    </li>
                    <li>
                        <img src="../img/total.png" alt="">
                        <div class="memberTotal" :tip="$t('data.realTime')">
                            <p class="total">{{pandect.newCustomerCount}}</p>
                            <p class="name">{{'report.newCustomerNo' | t}}</p>
                        </div>
                    </li>
                    <li>
                        <img src="../img/user.png" alt="">
                        <div class="memberTotal" :tip="$t('data.realTime')">
                            <p class="total">{{pandect.unmemberCountByTime}}</p>
                            <p class="name">{{'report.nonNumberCount' | t}}</p>
                        </div>
                    </li>
                    <li>
                        <img src="../img/member.png" alt="">
                        <div class="memberTotal" :tip="$t('data.realTime')">
                            <p class="total">{{pandect.fansCount}}</p>
                            <p class="name">{{'report.followers' | t}}</p>
                        </div>
                    </li>
                    <li>
                        <img src="../img/member.png" alt="">
                        <div class="memberTotal" :tip="$t('data.realTime')">
                            <p class="total">{{pandect.newFansCount}}</p>
                            <p class="name">{{'report.newFollowers' | t}}</p>
                        </div>
                    </li>
                </ul>

                <!-- charts -->
                <div class="charts">
                    <!-- 1. 数据完整度分析 -->
                    <div class="chart">
                        <div class="chart-head">
                            <h5>{{'report.dataAnalysis' | t}}</h5>
                            <span class="disabled-text">{{'data.oneDayDelay' | t}}</span>
                        </div>
                        <div class="charts-row">
                            <div class="chart-cell">
                                <inline-loading v-if="charts.left_analysis_loading"/>
                                <div class="large-chart" id="left_analysis" v-else></div>
                            </div>
                            <div class="chart-cell">
                                <inline-loading v-if="charts.right_analysis_loading"/>
                                <div class="large-chart" id="right_analysis" v-else></div>
                            </div>
                        </div>
                    </div>

                    <!-- 2. 消费力与活跃渠道 -->
                    <div class="chart">
                        <div class="chart-head">
                            <h5>{{'report.consumptionchannel' | t}}</h5>
                            <span class="disabled-text">{{'data.oneDayDelay' | t}}</span>
                        </div>
                        <div class="charts-row">
                            <div class="chart-cell">
                                <inline-loading v-if="charts.Count_loading"/>
                                <div class="large-chart" v-else>
                                    <div class="triangle-graph">
                                        <img src="../img/triangle.png" alt="">
                                        <div class="triangle_top"
                                             v-title:right="$t('report.superHighConsumption')+CountAndMoney.superCount+$t('report.amount')+CountAndMoney.superMoney"></div>
                                        <div class="triangle_middle"
                                             v-title:right="$t('report.highConsumption')+CountAndMoney.highCount+$t('report.amount')+CountAndMoney.highMoney"></div>
                                        <div class="triangle_foter"
                                             v-title:right="$t('report.generalConsumption')+CountAndMoney.normalCount+$t('report.amount')+CountAndMoney.normalMoney"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="chart-cell">
                                <inline-loading v-if="charts.trench_loading"/>
                                <div class="large-chart" id="trench" v-else></div>
                            </div>
                        </div>
                    </div>

                    <!-- 3. 发展趋势 -->
                    <div class="chart">
                        <div class="chart-head">
                            <h5>{{'report.development' | t}}</h5>
                            <span class="disabled-text">{{'data.oneDayDelay' | t}}</span>
                        </div>
                        <inline-loading v-if="charts.memberTrench_loading"/>
                        <div class="chart-body md" ref="arrivalChart" id="memberTrench" v-else></div>
                    </div>

                    <!-- 4. 订单与销售 -->
                    <div class="chart">
                        <div class="chart-head">
                            <h5>{{'report.orderandSale' | t}}</h5>
                            <span class="disabled-text">{{'data.oneDayDelay' | t}}</span>
                        </div>
                        <div class="charts-row">
                            <div class="chart-cell">
                                <inline-loading v-if="charts.left_order_loading"/>
                                <div class="large-chart" id="left_order" v-else></div>
                            </div>
                            <div class="chart-cell">
                                <inline-loading v-if="charts.right_order_loading"/>
                                <div class="large-chart" id="right_order" v-else></div>
                            </div>
                        </div>
                    </div>

                    <!-- 5. 复购分析 -->
                    <div class="chart">
                        <div class="chart-head">
                            <h5>{{'report.repurchase' | t}}</h5>
                            <span class="disabled-text">{{'data.oneDayDelay' | t}}</span>
                        </div>
                        <div class="charts-row">
                            <div class="chart-cell">
                                <inline-loading v-if="charts.left_purchase_loading"/>
                                <div class="large-chart" id="left_purchase" v-else></div>
                            </div>
                            <div class="chart-cell">
                                <inline-loading v-if="charts.right_purchase_loading"/>
                                <div class="large-chart" id="right_purchase" v-else></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>
<script type="text/babel">
    import { ScrmApiV1 } from '@/api';
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/line';
    import 'echarts/lib/chart/bar';
    import 'echarts/lib/chart/radar';
    import 'echarts/lib/component/tooltip';
    import 'echarts/lib/component/legend';
    import 'echarts/lib/component/dataZoom';
    import format from 'date-fns/format';
    import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
    import addDays from 'date-fns/add_days';
    import {getDateInstance} from '../../../common/utils/dateUtils';
    import '../journey/_chart.scss';

    export default {
        data() {
            return {
                startTime: '',
                endTime: '',
                pandect: {},
                Analysis: {},
                AnalysisRight: {},
                CountAndMoney: {},
                charts: {
                    left_analysis: null,
                    left_analysis_loading: true,
                    right_analysis: null,
                    right_analysis_loading: true,
                    trench: null,
                    trench_loading: true,
                    memberTrench: null,
                    memberTrench_loading: true,
                    left_order: null,
                    left_order_loading: true,
                    right_order: null,
                    right_order_loading: true,
                    left_purchase: null,
                    left_purchase_loading: true,
                    right_purchase: null,
                    right_purchase_loading: true,
                    Count_loading: true,
                }
            };
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
            this.startTime = format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
            this.endTime = format(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
            this.getAnalysis();
            this.getAnalysis_right();
            this.getTrench();
            this.getMemberTrench();
            this.getOrderSell_left();
            this.getOrderSell_right();
            this.getPurchaseMoney();
            this.getPurchaseNumber();
            this.getPandect();
            this.getLeftTrench();
            window.addEventListener('resize', this.resize, false);
            this.$once('hook:beforeDestroy', () => {
                window.removeEventListener('resize', this.resize, false);
            });
            //华为埋码-营销报告-用户报告
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P120319960F97BA');
            }
        },
        methods: {
            sure({start, end}) {
                this.startTime = start;
                this.endTime = end;
                if (this.startTime === '') {
                    this.$toast(this.$t('report.startTime'), 'warn');
                    return;
                }
                if (this.endTime === '') {
                    this.$toast(this.$t('report.endTime'), 'warn');
                    return;
                }
                this.getAnalysis();
                this.getAnalysis_right();
                this.getTrench();
                this.getMemberTrench();
                this.getOrderSell_left();
                this.getOrderSell_right();
                this.getPurchaseMoney();
                this.getPurchaseNumber();
                this.getPandect();
                this.getLeftTrench();
            },
            // 数据总览
            getPandect() {
                ScrmApiV1
                    .dataScreening(this.endTime, this.startTime)
                    .then(res => {
                        this.pandect = res.body.data;
                        this.pandect.customerCount = res.body.data.customerCount.toLocaleString();
                        this.pandect.newCustomerCount = res.body.data.newCustomerCount.toLocaleString();
                        this.pandect.unmemberCountByTime = res.body.data.unmemberCountByTime.toLocaleString();
                        this.pandect.fansCount = res.body.data.fansCount.toLocaleString();
                        this.pandect.newFansCount = res.body.data.newFansCount.toLocaleString();
                    });

            },
            resize() {
                this.charts.left_analysis.resize();
                this.charts.right_analysis.resize();
                this.charts.trench.resize();
                this.charts.memberTrench.resize();
                this.charts.left_order.resize();
                this.charts.right_order.resize();
                this.charts.left_purchase.resize();
                this.charts.right_purchase.resize();
            },
            // 数据完整度分析
            getAnalysis() {
                this.charts.left_analysis_loading = true;
                let type = 1; // 接口类型-联系人相关
                // 获取数据
                ScrmApiV1
                    .dataAnalyze(this.endTime, this.startTime, type)
                    .then(res => {
                        this.charts.left_analysis_loading = false;
                        this.Analysis = res.body.data;
                        // 获取时间
                        let start = getDateInstance(this.startTime);
                        let end = getDateInstance(this.endTime);
                        let dayDiff = differenceInCalendarDays(end, start);
                        let xAxisData = [];
                        for (let i = 0; i <= dayDiff; i++) {
                            xAxisData[i] = format(addDays(start, i), 'MM-DD');
                        }
                        this.$nextTick(() => {
                            // this.historyMapIni(this.charts.left_analysis);
                            this.charts.left_analysis = echarts.init(document.getElementById('left_analysis'));
                            this.charts.left_analysis.setOption(
                                {
                                    legend: {
                                        left: 20,
                                        top: 20,
                                        data: [{name: this.$t('report.allData'), icon: 'roundRect'}, {
                                            name: this.$t('report.mobile'),
                                            icon: 'roundRect'
                                        }, {
                                            name: this.$t('report.wechat'),
                                            icon: 'roundRect'
                                        }, {name: this.$t('report.email'), icon: 'roundRect'}]
                                    },
                                    tooltip: {
                                        showContent: true
                                    },
                                    //底部区间轴设置
                                    dataZoom: [
                                        {
                                            type: 'inside',
                                            start: 0,
                                            end: 100,
                                            zoomOnMouseWheel: false,
                                        }, {
                                            start: 0,
                                            end: 100,
                                            handleIcon: `M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z`,
                                            handleSize: '80%',
                                            handleColor: '#17f9a8',
                                            handleStyle: {
                                                color: '#fff',
                                                shadowBlur: 3,
                                                shadowColor: 'rgba(0, 0, 0, 0.6)',
                                                shadowOffsetX: 2,
                                                shadowOffsetY: 2,
                                            },
                                            bottom: 30
                                        },
                                    ],

                                    // 图标主题设计
                                    grid: {
                                        left: '5%',
                                        right: '10%',
                                        bottom: '80px',
                                        containLabel: true
                                    },
                                    xAxis: {
                                        type: 'category',
                                        boundaryGap: true,
                                        interval: 10,
                                        data: xAxisData
                                    },
                                    yAxis: {
                                        type: 'value',
                                        axisLabel: {
                                            show: true,
                                            interval: 'auto',
                                        },
                                        splitLine: {
                                            lineStyle: {
                                                color: '#eeeeee'
                                            }
                                        }
                                    },
                                    series: [
                                        {
                                            name: this.$t('report.allData'),
                                            type: 'line',
                                            itemStyle: {
                                                normal: {
                                                    color: '#7b5eea'
                                                }
                                            },
                                            data: this.Analysis.customerCountList
                                        },
                                        {
                                            name: this.$t('report.mobile'),
                                            type: 'bar',
                                            itemStyle: {
                                                normal: {
                                                    color: '#17f9a8'
                                                }
                                            },
                                            barWidth: 10,
                                            data: this.Analysis.mobileCountList
                                        },
                                        {
                                            name: this.$t('report.wechat'),
                                            type: 'bar',
                                            itemStyle: {
                                                normal: {
                                                    color: '#0cc2a9'
                                                }
                                            },
                                            barWidth: 10,
                                            data: this.Analysis.wechatCountList
                                        },
                                        {
                                            name: this.$t('report.email'),
                                            type: 'bar',
                                            itemStyle: {
                                                normal: {
                                                    color: '#00f0ff'
                                                }
                                            },
                                            barWidth: 10,
                                            data: this.Analysis.mailCountList
                                        }]
                                });
                        });

                    });
            },
            // 数据完整度分析右侧
            getAnalysis_right() {
                this.charts.right_analysis_loading = true;
                ScrmApiV1
                    .dataAnalyzeTwo(this.endTime, this.startTime)
                    .then(res => {
                        this.charts.right_analysis_loading = false;
                        this.AnalysisRight = res.body.data;
                        // 获取时间
                        let start = getDateInstance(this.startTime);
                        let end = getDateInstance(this.endTime);
                        let dayDiff = differenceInCalendarDays(end, start);
                        let xAxisData = [];
                        for (let i = 0; i <= dayDiff; i++) {
                            xAxisData[i] = format(addDays(start, i), 'MM-DD');
                        }
                        this.$nextTick(() => {
                            // this.historyMapIni(this.charts.right_analysis);
                            this.charts.right_analysis = echarts.init(document.getElementById('right_analysis'));
                            this.charts.right_analysis.setOption(
                                {
                                    legend: {
                                        left: 20,
                                        top: 20,
                                        data: [{name: this.$t('report.allData'), icon: 'roundRect'}, {
                                            name: this.$t('report.completeData'),
                                            icon: 'roundRect'
                                        }, {
                                            name: this.$t('report.noWechat'),
                                            icon: 'roundRect'
                                        }, {name: this.$t('report.noMobile'), icon: 'roundRect'}, {
                                            name: this.$t('report.noEmail'),
                                            icon: 'roundRect'
                                        }]
                                    },
                                    grid: {
                                        left: '8%',
                                        right: '8%',
                                        bottom: '80px',
                                        containLabel: true
                                    },
                                    tooltip: {
                                        showContent: true
                                    },
                                    xAxis: {
                                        type: 'category',
                                        boundaryGap: false,
                                        data: xAxisData
                                    },
                                    //底部区间轴设置
                                    dataZoom: [{
                                        type: 'inside',
                                        start: 0,
                                        end: 100,
                                        zoomOnMouseWheel: false,
                                    }, {
                                        start: 0,
                                        end: 100,
                                        handleIcon: `M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z`,
                                        handleSize: '80%',
                                        handleColor: '#17f9a8',
                                        handleStyle: {
                                            color: '#fff',
                                            shadowBlur: 3,
                                            shadowColor: 'rgba(0, 0, 0, 0.6)',
                                            shadowOffsetX: 2,
                                            shadowOffsetY: 2,
                                        },
                                        bottom: 30
                                    },

                                    ],
                                    yAxis: {
                                        type: 'value',
                                        splitLine: {
                                            lineStyle: {
                                                color: '#eeeeee'
                                            }
                                        }
                                    },
                                    series: [
                                        {
                                            name: this.$t('report.allData'),
                                            smooth: true,
                                            type: 'line',
                                            itemStyle: {
                                                normal: {
                                                    color: '#ffa87d'
                                                }
                                            },
                                            data: this.AnalysisRight.customerCountList
                                        },
                                        {
                                            name: this.$t('report.completeData'),
                                            smooth: true,
                                            type: 'line',
                                            itemStyle: {
                                                normal: {
                                                    color: '#0cc2a9'
                                                }
                                            },
                                            data: this.AnalysisRight.completeCountList
                                        },
                                        {
                                            name: this.$t('report.noWechat'),
                                            smooth: true,
                                            type: 'line',
                                            itemStyle: {
                                                normal: {
                                                    color: '#17f9a8'
                                                }
                                            },
                                            data: this.AnalysisRight.unwechatCountList
                                        },
                                        {
                                            name: this.$t('report.noMobile'),
                                            smooth: true,
                                            type: 'line',
                                            itemStyle: {
                                                normal: {
                                                    color: '#7b5eea'
                                                }
                                            },
                                            data: this.AnalysisRight.unmobileCountList
                                        },
                                        {
                                            name: this.$t('report.noEmail'),
                                            smooth: true,
                                            type: 'line',
                                            itemStyle: {
                                                normal: {
                                                    color: '#00f0ff'
                                                }
                                            },
                                            data: this.AnalysisRight.unmailCountList
                                        },
                                    ]
                                }
                            );
                        });
                    });
            },
            // 渠道左分析
            getLeftTrench() {
                this.charts.Count_loading = true;
                ScrmApiV1
                    .CountAndMoney(this.endTime, this.startTime)
                    .then(res => {
                        this.charts.Count_loading = false;
                        this.CountAndMoney = res.body.data;
                        this.CountAndMoney.superCount = this.CountAndMoney.superCount.toLocaleString();
                        this.CountAndMoney.superMoney = this.CountAndMoney.superMoney.toLocaleString();
                        this.CountAndMoney.highCount = this.CountAndMoney.highCount.toLocaleString();
                        this.CountAndMoney.highMoney = this.CountAndMoney.highMoney.toLocaleString();
                        this.CountAndMoney.normalCount = this.CountAndMoney.normalCount.toLocaleString();
                        this.CountAndMoney.normalMoney = this.CountAndMoney.normalMoney.toLocaleString();
                    });
            },
            // 渠道右分析
            getTrench() {
                this.charts.trench_loading = true;
                ScrmApiV1
                    .Proportion(this.endTime, this.startTime)
                    .then(res => {
                        this.charts.trench_loading = false;
                        let TrenchData = res.body.data;
                        this.$nextTick(() => {
                            // this.historyMapIni(this.charts.trench);
                            this.charts.trench = echarts.init(document.getElementById('trench'));
                            this.charts.trench.setOption({
                                tooltip: {
                                    showContent: true,
                                },
                                legend: {
                                    orient: 'vertical',
                                    right: 40,
                                    top: 40,
                                    data: [this.$t('report.superHighConsumptionCrowd'),
                                        this.$t('report.highConsumptionCrowd'),
                                        this.$t('report.generalConsumptionCrowd')]
                                },
                                radar: {
                                    center: ['50%', '60%'],
                                    indicator: [
                                        {text: this.$t('report.emailPercent')},
                                        {text: this.$t('report.messagePercent')},
                                        {text: this.$t('report.wechatPercent')},
                                    ]
                                },
                                calculable: true,
                                series: [
                                    {
                                        type: 'radar',
                                        itemStyle: {
                                            normal: {
                                                areaStyle: {
                                                    type: 'default'
                                                }
                                            }
                                        },
                                        data: [
                                            {
                                                value: [
                                                    TrenchData.superMailProportion,
                                                    TrenchData.superSmsProportion,
                                                    TrenchData.superWechatProportion
                                                ],
                                                name: this.$t('report.superHighConsumptionCrowd'),
                                                itemStyle: {
                                                    normal: {
                                                        color: '#ffa87d'
                                                    }
                                                },
                                            },
                                            {
                                                value: [
                                                    TrenchData.highMailProportion,
                                                    TrenchData.highSmsProportion,
                                                    TrenchData.highWechatProportion
                                                ],
                                                name: this.$t('report.highConsumptionCrowd'),
                                                itemStyle: {
                                                    normal: {
                                                        color: '#7b5eea'
                                                    }
                                                },
                                            },
                                            {
                                                value: [
                                                    TrenchData.normalMailProportion,
                                                    TrenchData.normalSmsProportion,
                                                    TrenchData.normalWechatProportion
                                                ],
                                                name: this.$t('report.generalConsumptionCrowd'),
                                                itemStyle: {
                                                    normal: {
                                                        color: '#00f0ff'
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            });
                        });
                    });
            },
            // 粉丝,非会员发展趋势
            getMemberTrench() {
                this.charts.memberTrench_loading = true;
                ScrmApiV1
                    .memberTendency(this.endTime, this.startTime)
                    .then(res => {
                        this.charts.memberTrench_loading = false;
                        let membersTendency = res.body.data;
                        // 获取时间
                        let start = getDateInstance(this.startTime);
                        let end = getDateInstance(this.endTime);
                        let dayDiff = differenceInCalendarDays(end, start);
                        let xAxisData = [];
                        for (let i = 0; i <= dayDiff; i++) {
                            xAxisData[i] = format(addDays(start, i), 'MM-DD');
                        }
                        this.$nextTick(() => {
                            // this.historyMapIni(this.charts.memberTrench);
                            this.charts.memberTrench = echarts.init(document.getElementById('memberTrench'));
                            this.charts.memberTrench.setOption(
                                {
                                    legend: {
                                        left: 20,
                                        top: 20,
                                        data: [{
                                            name: this.$t('report.member'),
                                            icon: 'roundRect'
                                        }, {name: this.$t('report.noMember'), icon: 'roundRect'}, {
                                            name: this.$t('report.follower'),
                                            icon: 'roundRect'
                                        },]
                                    },
                                    tooltip: {
                                        showContent: true
                                    },
                                    //底部区间轴设置
                                    dataZoom: [{
                                        type: 'inside',
                                        start: 0,
                                        end: 100,
                                        zoomOnMouseWheel: false,
                                    }, {
                                        start: 0,
                                        end: 100,
                                        handleIcon: `M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z`,
                                        handleSize: '80%',
                                        handleColor: '#17f9a8',
                                        handleStyle: {
                                            color: '#fff',
                                            shadowBlur: 3,
                                            shadowColor: 'rgba(0, 0, 0, 0.6)',
                                            shadowOffsetX: 2,
                                            shadowOffsetY: 2,
                                        },
                                        bottom: 30
                                    }],
                                    // 图标主题设计
                                    grid: {
                                        left: '5%',
                                        right: '6.5%',
                                        bottom: '80px',
                                        containLabel: true
                                    },
                                    xAxis: {
                                        type: 'category',
                                        boundaryGap: true,
                                        interval: 10,
                                        data: xAxisData
                                    },
                                    yAxis: {
                                        type: 'value',
                                        axisLabel: {
                                            show: true,
                                            interval: 'auto',
                                        },
                                        splitLine: {
                                            lineStyle: {
                                                color: '#eeeeee'
                                            }
                                        }
                                    },
                                    series: [
                                        {
                                            name: this.$t('report.member'),
                                            type: 'line',
                                            itemStyle: {
                                                normal: {
                                                    color: '#7b5eea'
                                                }
                                            },
                                            data: membersTendency.memberCountList
                                        },
                                        {
                                            name: this.$t('report.noMember'),
                                            type: 'bar',
                                            itemStyle: {
                                                normal: {
                                                    color: '#17f9a8'
                                                }
                                            },
                                            barWidth: 10,
                                            data: membersTendency.unmemberCountList
                                        },
                                        {
                                            name: this.$t('report.follower'),
                                            type: 'bar',
                                            itemStyle: {
                                                normal: {
                                                    color: '#0cc2a9'
                                                }
                                            },
                                            barWidth: 10,
                                            data: membersTendency.fansCountList
                                        },]

                                });
                        });

                    });
            },
            // 会员、非会员、粉丝订单与销售
            getOrderSell_left() {
                this.charts.left_order_loading = true;
                ScrmApiV1
                    .salesCount(this.endTime, this.startTime)
                    .then(res => {
                        this.charts.left_order_loading = false;
                        let Count = res.body.data;
                        // 获取时间
                        let start = getDateInstance(this.startTime);
                        let end = getDateInstance(this.endTime);
                        let dayDiff = differenceInCalendarDays(end, start);
                        let xAxisData = [];
                        for (let i = 0; i <= dayDiff; i++) {
                            xAxisData[i] = format(addDays(start, i), 'MM-DD');
                        }
                        this.$nextTick(() => {
                            // this.historyMapIni(this.charts.left_order);
                            this.charts.left_order = echarts.init(document.getElementById('left_order'));
                            this.charts.left_order.setOption(
                                {
                                    legend: {
                                        left: 20,
                                        top: 20,
                                        data: [{name: this.$t('report.member'), icon: 'roundRect'}, {
                                            name: this.$t('report.noMember'),
                                            icon: 'roundRect'
                                        }, {name: this.$t('report.follower'), icon: 'roundRect'}]
                                    },
                                    tooltip: {
                                        showContent: true
                                    },
                                    //底部区间轴设置
                                    dataZoom: [{
                                        type: 'inside',
                                        start: 0,
                                        end: 100,
                                        zoomOnMouseWheel: false,

                                    }, {
                                        start: 0,
                                        end: 100,
                                        handleIcon: `M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z`,
                                        handleSize: '80%',
                                        handleColor: '#17f9a8',
                                        handleStyle: {
                                            color: '#fff',
                                            shadowBlur: 3,
                                            shadowColor: 'rgba(0, 0, 0, 0.6)',
                                            shadowOffsetX: 2,
                                            shadowOffsetY: 2,
                                        },
                                        bottom: 30
                                    }],

                                    // 图标主题设计
                                    grid: {
                                        left: '5%',
                                        right: '10%',
                                        bottom: '80px',
                                        containLabel: true
                                    },
                                    xAxis: {
                                        type: 'category',
                                        boundaryGap: true,
                                        interval: 10,
                                        data: xAxisData
                                    },
                                    yAxis: {
                                        // type: 'value',
                                        // axisLabel: {
                                        // show: true,
                                        // interval: 'auto',
                                        // },

                                        type: 'value',
                                        axisLabel: {
                                            show: true,
                                            interval: 'auto',
                                        },
                                        splitLine: {
                                            lineStyle: {
                                                color: '#eeeeee'
                                            }
                                        }
                                    },
                                    series: [
                                        {
                                            name: this.$t('report.member'),
                                            type: 'bar',
                                            itemStyle: {
                                                normal: {
                                                    color: '#71e1eb'
                                                }
                                            },
                                            barWidth: 10,
                                            data: Count.memberSaleCountList
                                        },
                                        {
                                            name: this.$t('report.noMember'),
                                            type: 'bar',
                                            itemStyle: {
                                                normal: {
                                                    color: '#34d4e3'
                                                }
                                            },
                                            barWidth: 10,
                                            data: Count.unmemberSaleCountList
                                        },
                                        {
                                            name: this.$t('report.follower'),
                                            type: 'bar',
                                            itemStyle: {
                                                normal: {
                                                    color: '#7b5eea'
                                                }
                                            },
                                            barWidth: 10,
                                            data: Count.fansSaleCountList
                                        }]
                                });
                        });

                    });
            },
            getOrderSell_right() {
                this.charts.right_order_loading = true;
                ScrmApiV1
                    .salesMoney(this.endTime, this.startTime)
                    .then(res => {
                        this.charts.right_order_loading = false;
                        let Money = res.body.data;
                        // 获取时间
                        let start = getDateInstance(this.startTime);
                        let end = getDateInstance(this.endTime);
                        let dayDiff = differenceInCalendarDays(end, start);
                        let xAxisData = [];
                        for (let i = 0; i <= dayDiff; i++) {
                            xAxisData[i] = format(addDays(start, i), 'MM-DD');
                        }
                        this.$nextTick(() => {
                            // this.historyMapIni(this.charts.right_order);
                            this.charts.right_order = echarts.init(document.getElementById('right_order'));
                            this.charts.right_order.setOption({
                                tooltip: {
                                    trigger: 'axis',
                                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                                    }
                                },

                                legend: {
                                    left: 20,
                                    top: 20,
                                    data: [this.$t('report.member'), this.$t('report.noMember'), this.$t('report.follower')]
                                },
                                calculable: true,
                                xAxis: [
                                    {
                                        type: 'category',
                                        data: xAxisData
                                    }
                                ],
                                yAxis: [
                                    {
                                        type: 'value',
                                        axisLabel: {
                                            show: true,
                                            interval: 'auto',
                                            formatter: '￥{value}'
                                        }
                                    }
                                ],
                                //底部区间轴设置
                                dataZoom: [{
                                    type: 'inside',
                                    start: 0,
                                    end: 100,
                                    zoomOnMouseWheel: false,
                                }, {
                                    start: 0,
                                    end: 100,
                                    handleIcon: `M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z`,
                                    handleSize: '80%',
                                    handleColor: '#17f9a8',
                                    handleStyle: {
                                        color: '#fff',
                                        shadowBlur: 3,
                                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                                        shadowOffsetX: 2,
                                        shadowOffsetY: 2,
                                    },
                                    bottom: 30
                                }],
                                // 图标主题设计
                                grid: {
                                    left: '0',
                                    right: '10%',
                                    bottom: '80px',
                                    containLabel: true
                                },
                                series: [
                                    {
                                        name: this.$t('report.member'),
                                        type: 'bar',
                                        stack: this.$t('report.total'),
                                        itemStyle: {
                                            normal: {
                                                label: {show: true, position: 'top'},
                                                color: '#71e1eb'
                                            }
                                        },
                                        data: Money.memberSaleMoneyList
                                    },
                                    {
                                        name: this.$t('report.noMember'),
                                        type: 'bar',
                                        stack: this.$t('report.total'),
                                        itemStyle: {
                                            normal: {
                                                label: {show: true, position: 'top'},
                                                color: '#34d4e3'
                                            }
                                        },
                                        data: Money.unmemberSaleMoneyList
                                    },
                                    {
                                        name: this.$t('report.follower'),
                                        type: 'bar',
                                        stack: this.$t('report.total'),
                                        itemStyle: {
                                            normal: {
                                                label: {show: true, position: 'top'},
                                                color: '#7b5eea'
                                            }
                                        },
                                        data: Money.fansSaleMoneyList
                                    },
                                ]
                            });
                        });

                    });

            },
            // 会员、非会员、粉丝复购分析
            getPurchaseNumber() {
                this.charts.left_purchase_loading = true;
                ScrmApiV1
                    .influenceSaleCount(this.endTime, this.startTime)
                    .then(res => {
                        this.charts.left_purchase_loading = false;
                        let SaleCount = res.body.data;
                        // 获取时间
                        let start = getDateInstance(this.startTime);
                        let end = getDateInstance(this.endTime);
                        let dayDiff = differenceInCalendarDays(end, start);
                        let xAxisData = [];
                        for (let i = 0; i <= dayDiff; i++) {
                            xAxisData[i] = format(addDays(start, i), 'MM-DD');
                        }
                        this.$nextTick(() => {
                            // this.historyMapIni(this.charts.left_purchase);
                            this.charts.left_purchase = echarts.init(document.getElementById('left_purchase'));
                            this.charts.left_purchase.setOption(
                                {
                                    legend: {
                                        left: 20,
                                        top: 20,
                                        data: [{name: this.$t('report.dayOrderQuantity'), icon: 'roundRect'}, {
                                            name: this.$t('report.day30OrderQuantity'),
                                            icon: 'roundRect'
                                        }, {
                                            name: this.$t('report.day90OrderQuantity'),
                                            icon: 'roundRect'
                                        }, {name: this.$t('report.day180OrderQuantity'), icon: 'roundRect'}]
                                    },
                                    tooltip: {
                                        showContent: true
                                    },
                                    //底部区间轴设置
                                    dataZoom: [{
                                        type: 'inside',
                                        start: 0,
                                        end: 100,
                                        zoomOnMouseWheel: false,
                                    }, {
                                        start: 0,
                                        end: 100,
                                        handleIcon: `M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z`,
                                        handleSize: '80%',
                                        handleColor: '#17f9a8',
                                        handleStyle: {
                                            color: '#fff',
                                            shadowBlur: 3,
                                            shadowColor: 'rgba(0, 0, 0, 0.6)',
                                            shadowOffsetX: 2,
                                            shadowOffsetY: 2,
                                        },
                                        bottom: 30
                                    }],

                                    // 图标主题设计
                                    grid: {
                                        left: '5%',
                                        right: '10%',
                                        bottom: '80px',
                                        containLabel: true
                                    },
                                    xAxis: {
                                        type: 'category',
                                        boundaryGap: true,
                                        interval: 10,
                                        data: xAxisData
                                    },
                                    yAxis: {
                                        type: 'value',
                                        axisLabel: {
                                            show: true,
                                            interval: 'auto',
                                        },
                                        splitLine: {
                                            lineStyle: {
                                                color: '#eeeeee'
                                            }
                                        }
                                    },
                                    series: [
                                        {
                                            name: this.$t('report.dayOrderQuantity'),
                                            type: 'line',
                                            itemStyle: {
                                                normal: {
                                                    color: '#7b5eea'
                                                }
                                            },
                                            data: SaleCount.countList
                                        },
                                        {
                                            name: this.$t('report.day30OrderQuantity'),
                                            type: 'bar',
                                            itemStyle: {
                                                normal: {
                                                    color: '#17f9a8'
                                                }
                                            },
                                            barWidth: 10,
                                            data: SaleCount.oneLevelCountList
                                        },
                                        {
                                            name: this.$t('report.day90OrderQuantity'),
                                            type: 'bar',
                                            itemStyle: {
                                                normal: {
                                                    color: '#0cc2a9'
                                                }
                                            },
                                            barWidth: 10,
                                            data: SaleCount.twoLevelCountList
                                        },
                                        {
                                            name: this.$t('report.day180OrderQuantity'),
                                            type: 'bar',
                                            itemStyle: {
                                                normal: {
                                                    color: '#00f0ff'
                                                }
                                            },
                                            barWidth: 10,
                                            data: SaleCount.threeLevelCountList
                                        }]
                                });
                        });

                    });

            },
            getPurchaseMoney() {
                this.charts.right_purchase_loading = true;
                ScrmApiV1
                    .influenceSalePercent(this.endTime, this.startTime)
                    .then(res => {
                        this.charts.right_purchase_loading = false;
                        let SalePercent = res.body.data;
                        let start = getDateInstance(this.startTime);
                        let end = getDateInstance(this.endTime);
                        let dayDiff = differenceInCalendarDays(end, start);
                        let xAxisData = [];
                        for (let i = 0; i <= dayDiff; i++) {
                            xAxisData[i] = format(addDays(start, i), 'MM-DD');
                        }
                        this.$nextTick(() => {
                            // this.historyMapIni(this.charts.right_purchase);
                            this.charts.right_purchase = echarts.init(document.getElementById('right_purchase'));
                            this.charts.right_purchase.setOption(
                                {
                                    legend: {
                                        left: 20,
                                        top: 20,
                                        data: [{name: this.$t('report.day30OrderPercentage'), icon: 'roundRect'}, {
                                            name: this.$t('report.day90OrderPercentage'),
                                            icon: 'roundRect'
                                        }, {name: this.$t('report.day180OrderPercentage'), icon: 'roundRect'},
                                        ]
                                    },
                                    grid: {
                                        left: '5%',
                                        right: '10%',
                                        bottom: '80px',
                                        containLabel: true
                                    },
                                    tooltip: {
                                        showContent: true,
                                    },
                                    xAxis: {
                                        type: 'category',
                                        boundaryGap: false,
                                        data: xAxisData
                                    },
                                    //底部区间轴设置
                                    dataZoom: [{
                                        type: 'inside',
                                        start: 0,
                                        end: 100,
                                        zoomOnMouseWheel: false,
                                    }, {
                                        start: 0,
                                        end: 100,
                                        handleIcon: `M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z`,
                                        handleSize: '80%',
                                        handleColor: '#17f9a8',
                                        handleStyle: {
                                            color: '#fff',
                                            shadowBlur: 3,
                                            shadowColor: 'rgba(0, 0, 0, 0.6)',
                                            shadowOffsetX: 2,
                                            shadowOffsetY: 2,
                                        },
                                        bottom: 30
                                    }],
                                    yAxis: {
                                        type: 'value',
                                        splitLine: {
                                            lineStyle: {
                                                color: '#eeeeee'
                                            }
                                        },
                                        axisLabel: {
                                            show: true,
                                            interval: 'auto',
                                            formatter: '{value}%'
                                        }
                                    },
                                    series: [
                                        {
                                            name: this.$t('report.day30OrderPercentage'),
                                            smooth: true,
                                            type: 'line',
                                            itemStyle: {
                                                normal: {
                                                    color: '#17f9a8',
                                                }
                                            },
                                            data: SalePercent.oneLevelPercentList
                                        },
                                        {
                                            name: this.$t('report.day90OrderPercentage'),
                                            smooth: true,
                                            type: 'line',
                                            itemStyle: {
                                                normal: {
                                                    color: '#0cc2a9'

                                                }
                                            },
                                            data: SalePercent.twoLevelPercentList
                                        },
                                        {
                                            name: this.$t('report.day180OrderPercentage'),
                                            smooth: true,
                                            type: 'line',
                                            itemStyle: {
                                                normal: {
                                                    color: '#00f0ff'
                                                }
                                            },
                                            data: SalePercent.threeLevelPercentList
                                        },
                                    ]
                                }
                            );
                        });
                    });
            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';

    .customer-related-report {

        .list {
            display: flex;
            margin-bottom: 16px;

            li {
                flex: 1;
                @include box-sizing;
                position: relative;

                img {
                    display: block;
                    width: 100%;
                    height: auto;
                }

                ~ li {
                    margin-left: 16px;
                }
            }

            .memberTotal {
                height: 66px;
                position: absolute;
                right: 16px;
                top: 50%;
                width: 130px;
                text-align: right;
                margin-top: -33px;
                word-break: normal;

                &:after {
                    content: attr(tip);
                    color: $color-light-content;
                    line-height: $input-field-height;
                }

                .total {
                    color: $theme;
                    font-size: 20px;
                    padding-bottom: 10px;
                }

                .name {
                    font-size: 16px;
                    color: #999999;
                }
            }
        }

        .triangle-graph {
            position: relative;
            margin-top: 32px;

            img {
                display: block;
                margin: auto;
                width: 330px;
                height: 240px;
            }

            .triangle_top {
                width: 104px;
                height: 73px;
                position: absolute;
                left: 50%;
                margin-left: -48px;
                top: 33px;
                opacity: 0;
                border-radius: 20px;
                cursor: pointer;
            }

            .triangle_middle {
                width: 180px;
                height: 58px;
                position: absolute;
                left: 50%;
                margin-left: -88px;
                top: 115px;
                opacity: 0;
                border-radius: 20px;
                cursor: pointer;
            }

            .triangle_foter {
                width: 254px;
                height: 42px;
                position: absolute;
                left: 50%;
                margin-left: -123px;
                top: 183px;
                opacity: 0;
                background-color: #cccccc;
                border-radius: 8px;
                cursor: pointer;
            }
        }
    }
</style>
