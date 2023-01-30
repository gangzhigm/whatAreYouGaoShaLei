<template>
    <div class="wechat-report">
        <div class="page-content">
            <div class="content-view margin">
                <div class="charts">
                    <!-- 1. 粉丝分析 -->
                    <div class="chart">
                        <div class="chart-head">
                            <h5>{{'report.followerAnalysis' | t}}</h5>
                            <span class="disabled-text">{{'data.oneDayDelay' | t}}</span>
                        </div>
                        <inline-loading v-if="charts.memberTrench_loading"></inline-loading>
                        <div class="chart-body lg" ref="memberTrench" v-else></div>
                    </div>
                    <!-- 3. 粉丝行为分析 -->
                    <div class="chart half">
                        <div class="chart-head">
                            <h5>{{'report.behaviorAnalysis' | t}}</h5>
                            <span class="disabled-text">{{'data.oneDayDelay' | t}}</span>
                        </div>
                        <inline-loading v-if="charts.right_order_loading"></inline-loading>
                        <div class="chart-body md" ref="right_order" v-else></div>
                    </div>
                    <!-- 4. 粉丝来源 -->
                    <div class="chart">
                        <div class="chart-head">
                            <h5>{{'report.fansSource' | t}}</h5>
                            <span class="disabled-text">{{'data.oneDayDelay' | t}}</span>
                        </div>
                        <inline-loading v-if="charts.fanSource_loading"></inline-loading>
                        <div class="chart-body xl" ref="fanSource" v-else></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script type="text/babel">
    import { WechatApiV1 } from '@/api';
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/line';
    import 'echarts/lib/chart/pie';
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
                endTime:'',
                startTime:'',
                pandect: {},
                Analysis: {},
                AnalysisRight: {},
                CountAndMoney: {},
                officialId: '',
                charts: {
                    memberTrench: null,
                    memberTrench_loading: false,
                    right_order: null,
                    right_order_loading: false,
                    fanSource: null,
                    fanSource_loading: false,
                },
            };
        },
        mounted() {
            this.$emit('childActived');
            this.startTime = format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
            this.endTime = format(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
            this.$emit('childDaily', true);
            this.$emit('childAll', true);
            this.getMemberTrench();
            this.getFanBehavior();
            this.getFansSource();
            window.addEventListener('resize', this.resize, false);
            this.$once('hook:beforeDestroy', () => {
                window.removeEventListener('resize', this.resize, false);
            });
        },
        methods: {
            resize() {
                [this.memberTrench, this.right_order, this.fanSource]
                    .forEach(chart => {
                        if (chart && chart.resize) {
                            chart.resize();
                        }
                    });
            },
            sure({start, end}) {
                this.startTime = start;
                this.endTime = end;
                if (start === '') {
                    this.$toast( this.$t('report.startTime'), 'warn');
                    return;
                }
                if (end === '') {
                    this.$toast(this.$t('report.endTime'), 'warn');
                    return;
                }
                this.getMemberTrench();
                this.getFanBehavior();
                this.getFansSource();
            },
            // 粉丝,发展趋势
            getMemberTrench() {
                this.charts.memberTrench_loading = true;
                WechatApiV1
                    .fansReport(this.endTime, this.startTime)
                    .then(res => {
                        this.charts.memberTrench_loading = false;
                        if (res.body.data !== null && res.body.data !== undefined) {
                            let membersTendency = res.body.data.fansCountList;
                            // 获取时间
                            let start = getDateInstance(this.startTime);
                            let end = getDateInstance(this.endTime);
                            let dayDiff = differenceInCalendarDays(end, start);
                            let xAxisData = [];
                            for (let i = 0; i <= dayDiff; i++) {
                                xAxisData[i] = format(addDays(start, i), 'MM-DD');
                            }
                            this.$nextTick(() => {
                                this.charts.memberTrench = echarts.init(this.$refs.memberTrench);
                                this.charts.memberTrench.setOption(
                                    {
                                        legend: {
                                            left: 20,
                                            top: 20,
                                            data: [{name: this.$t('report.wechatFans'), icon: 'roundRect'},]
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
                                                name: this.$t('report.wechatFans'),
                                                type: 'line',
                                                itemStyle: {
                                                    normal: {
                                                        color: '#7b5eea'
                                                    }
                                                },
                                                data: membersTendency

                                            },]
                                    });
                            });
                        }
                    });
            },
            // 粉丝行为
            getFanBehavior() {
                this.charts.right_order_loading = true;
                WechatApiV1
                    .fansBehavior(this.endTime, this.startTime)
                    .then(res => {
                        this.charts.right_order_loading = false;
                        if (res.body.data !== null && res.body.data !== undefined) {
                            let start = getDateInstance(this.startTime);
                            let end = getDateInstance(this.endTime);
                            let dayDiff = differenceInCalendarDays(end, start);
                            let xAxisData = [];
                            for (let i = 0; i <= dayDiff; i++) {
                                xAxisData[i] = format(addDays(start, i), 'MM-DD');
                            }
                            this.$nextTick(() => {
                                this.charts.right_order = echarts.init(this.$refs.right_order);

                                this.charts.right_order.setOption(
                                    {
                                        legend: {
                                            left: 20,
                                            top: 20,
                                            data: [{name: this.$t('report.subscribe'), icon: 'roundRect'}, {
                                                name: this.$t('report.clickMenu'),
                                                icon: 'roundRect'
                                            }, {name: this.$t('report.sendMessage'), icon: 'roundRect'}, {name: this.$t('report.scanCode'), icon: 'roundRect'}, {
                                                name: this.$t('report.unSubscribe'),
                                                icon: 'roundRect'
                                            }]
                                        },
                                        grid: {
                                            left: '5%',
                                            right: '13%',
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
                                        }],
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
                                                name: this.$t('report.subscribe'),
                                                smooth: true,
                                                type: 'line',
                                                itemStyle: {
                                                    normal: {
                                                        color: '#ffa87d'
                                                    }
                                                },
                                                data: res.body.data.attentionCountList
                                            },
                                            {
                                                name: this.$t('report.clickMenu'),
                                                smooth: true,
                                                type: 'line',
                                                itemStyle: {
                                                    normal: {
                                                        color: '#17f9a8'
                                                    }
                                                },
                                                data: res.body.data.clickMenuCountList

                                            },
                                            {
                                                name: this.$t('report.sendMessage'),
                                                smooth: true,
                                                type: 'line',
                                                itemStyle: {
                                                    normal: {
                                                        color: '#0cc2a9'
                                                    }
                                                },
                                                data: res.body.data.sendMassgeCountList

                                            },
                                            {
                                                name: this.$t('report.scanCode'),
                                                smooth: true,
                                                type: 'line',
                                                itemStyle: {
                                                    normal: {
                                                        color: '#7b5eea'
                                                    }
                                                },
                                                data: res.body.data.sweepCodeCountList
                                            },
                                            {
                                                name: this.$t('report.unSubscribe'),
                                                smooth: true,
                                                type: 'line',
                                                itemStyle: {
                                                    normal: {
                                                        color: '#00f0ff'
                                                    }
                                                },
                                                data: res.body.data.unSubscribeCountList
                                            },
                                        ]
                                    }
                                );
                            });
                        }
                    });
            },
            // 粉丝来源
            getFansSource() {
                this.charts.fanSource_loading = true;
                WechatApiV1
                    .fansSource(this.endTime, this.officialId, this.startTime)
                    .then(res => {
                        this.charts.fanSource_loading = false;
                        if (res.body.data !== null && res.body.data !== undefined) {
                            this.$nextTick(() => {
                                this.charts.fanSource = echarts.init(this.$refs.fanSource);

                                this.charts.fanSource.setOption({
                                    title: {
                                        text: this.$t('report.fansSource'),
                                        x: 'center',
                                        y: 'center',
                                        textStyle: {
                                            fontWeight: 'normal',
                                            fontSize: 14,
                                            color: '#404040'
                                        },
                                    },
                                    tooltip: {
                                        trigger: 'item',
                                        formatter: '{a} <br/>{b} : {c} ({d}%)',
                                    },
                                    legend: {
                                        orient: 'horizontal',
                                        top: 20,
                                        x: 'center',
                                        data: [
                                            this.$t('report.otherChannel'), this.$t('report.wechatSearch'),
                                            this.$t('report.cardShare'), this.$t('report.scanQRCode'),
                                            this.$t('report.rightMenu'),  this.$t('report.cornerPaid'),
                                            this.$t('report.subscriptionName'), this.$t('report.advertise'),
                                            this.$t('report.wechatAdvertise'),this.$t('report.wechatAdvertisement'),
                                            this.$t('report.othersForward'),this.$t('report.accountAlbum'),
                                        ]
                                    },
                                    calculable: false,
                                    series: [
                                        {
                                            name: this.$t('report.fansSource'),
                                            type: 'pie',
                                            radius: [100, 140],
                                            x: '60%',
                                            width: '35%',
                                            funnelAlign: 'left',
                                            color: [
                                                '#83d758', '#b187d9', '#54adf7', '#ff9999', '#ffcd5f',
                                                '#2c9b2c', '#9b0100', '#306630', '#ff6600', '#BAE2E2',
                                                '#FFE0C7', '#FF99C3'
                                            ],
                                            data: [
                                                {value: res.body.data.sourceDate.other, name: this.$t('report.otherChannel')},
                                                {value: res.body.data.sourceDate.publicSearch, name: this.$t('report.wechatSearch')},
                                                {value: res.body.data.sourceDate.cardShare, name: this.$t('report.cardShare')},
                                                {value: res.body.data.sourceDate.sweepCode, name: this.$t('report.scanQRCode')},
                                                {value: res.body.data.sourceDate.upperRightMenu, name: this.$t('report.rightMenu')},
                                                {value: res.body.data.sourceDate.payAttention, name: this.$t('report.cornerPaid')},
                                                {value: res.body.data.sourceDate.publicName, name: this.$t('report.subscriptionName')},
                                                {value: res.body.data.sourceDate.publicAdvertisement, name: this.$t('report.advertise')},
                                                {value: res.body.data.sourceDate.friendsCircleAdvertisement, name: this.$t('report.wechatAdvertise')},
                                                {value: res.body.data.sourceDate.wechatAdvertisement, name: this.$t('report.wechatAdvertisement')},
                                                {value: res.body.data.sourceDate.reprint, name: this.$t('report.othersForward')},
                                                {value: res.body.data.sourceDate.album, name: this.$t('report.accountAlbum')},
                                            ]
                                        }
                                    ]
                                });
                            });
                        }
                    });
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';

    .wechat-report {
        .range-maximum-tip {
            float: right;
            color: $color-light-content;
            padding-right: 8px;
        }
    }
</style>
