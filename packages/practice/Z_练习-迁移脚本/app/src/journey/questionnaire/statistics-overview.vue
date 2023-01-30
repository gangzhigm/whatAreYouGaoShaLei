<template>
    <div class="statistics-overview-wrapper">
        <!--        表单统计概览-->
        <div class="form-number">
            <ul class="data-ul">
                <li class="form-data-li">
                     <span>
                         <span>{{'form.PUUV' | t}}</span>
                         <i class="icon icon-help"
                            v-title:right="$t('form.byCookies')"></i>
                     </span>
                    <h3 class="number">{{openNumber}} ({{openPeopleNumber}})</h3>
                    <p class="num-total">{{'form.allPVUV' | t}} {{totalOpenNumber}}（{{totalOpenPeopleNumber}}）</p>
                </li>
                <li class="form-data-li">
                    <span>{{'form.submissions' | t}}</span>
                    <h3 class="number">{{submitNumber}} ({{submitPeopleNumber}})</h3>
                    <p class="num-total">{{'form.allSubmissions' | t}} {{totalSubmitNumber}} （{{totalSubmitPeopleNumber}}）</p>
                </li>
                <li class="form-data-li">
                    <span>{{'form.conversionRate' | t}}</span>
                    <h3 class="number">{{rate}}%</h3>
                    <p class="num-total">{{'form.allConversionRate' | t}} {{allRate}}%</p>
                </li>
            </ul>
            <!--            overview-ECharts-->
            <div class="charts">
                <div class="chart">
                    <div class="chart-head">
                        <h5>{{'form.formStatistics' | t}}</h5>
                    </div>
                    <ul class="date-tabs">
                        <li class="date-tab" :class="{active:numberType===1}" @click="switchNumberType(1)">{{'form.frequency' | t}}</li>
                        <li class="date-tab" :class="{active:numberType===2}" @click="switchNumberType(2)">{{'form.user' | t}}</li>
                    </ul>
                    <inline-loading v-if="charts.loading"/>
                    <div class="chart-body lg" id="overview"></div>
                </div>
            </div>

        </div>
    </div>
</template>

<script type="text/babel">
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/line';
    import 'echarts/lib/chart/bar';
    import 'echarts/lib/chart/radar';
    import 'echarts/lib/component/tooltip';
    import 'echarts/lib/component/legend';
    import 'echarts/lib/component/dataZoom';
    import '../../data/report/journey/_chart.scss';

    import {getDateInstance} from '@/common/utils/dateUtils';
    import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
    import format from 'date-fns/format';
    import addDays from 'date-fns/add_days';
    import {QuestionnaireApiV1} from '@/api';


    export default {
        name: 'statistics-overview',
        data() {
            return {
                charts: {
                    overview: null,
                    loading: true,
                },
                numberType: 1,//1次数 2人数
                totalOpenNumber: '', //全部打开次数
                totalOpenPeopleNumber:'', //全部打开人数
                totalSubmitNumber: '',//全部提交次数
                totalSubmitPeopleNumber: '', //全部提交人数

                allRate: '',//全部提交转化率
                rate: '', //提交转换率
                openNumber: '',//筛选后的打开次数
                openPeopleNumber: '',//筛选后的打开人数
                submitNumber:'', //筛选后的提交次数
                submitPeopleNumber:'', //筛选后的提交人数

                //echarts title
                echartsOpen: this.$t('form.PV'),// 打开
                echartsSubmit: this.$t('form.numberSubmissions'),// 提交
            };
        },
        props:{
            formId:{
                type:[String,Number]
            },
            endDate:{
                type: String,
            },
            startDate:{
                type: String,
            },
            createdTime:{
                type: String,
            }
        },
        components: {},
        watch: {
            endDate() {
                this.getStatisticsView();
            },
            startDate() {
                this.getStatisticsView();
            }

        },
        mounted() {
            this.getStatisticsView();
        },
        methods: {
            //获取统计概览
            getStatisticsView() {
                this.charts.loading = true;
                QuestionnaireApiV1
                    .getStatisticsView(Number(this.formId), this.startDate, this.endDate)
                    .then(({body:{data}}) => {
                        let overviewNumber = {
                            openList:[],
                            submitList:[],
                        };

                        this.charts.loading = false;
                        this.totalOpenNumber = (data.totalOpenNumber).toLocaleString('en-US');
                        this.totalOpenPeopleNumber = (data.totalOpenPeopleNumber).toLocaleString('en-US');
                        this.totalSubmitNumber = (data.totalSubmitNumber).toLocaleString('en-US');
                        this.totalSubmitPeopleNumber = (data.totalSubmitPeopleNumber).toLocaleString('en-US');
                        this.rate = ((data.rate) * 100).toFixed(2);
                        this.allRate = ((data.allRate) * 100).toFixed(2);
                        this.openNumber = (data.openNumber).toLocaleString('en-US');
                        this.openPeopleNumber = (data.openPeopleNumber).toLocaleString('en-US');
                        this.submitNumber = (data.submitNumber).toLocaleString('en-US');
                        this.submitPeopleNumber = (data.submitPeopleNumber).toLocaleString('en-US');

                        //次数
                        for (let i = 0; i < data.statisticsList.length; ++i) {
                            if (this.numberType === 1) {
                                overviewNumber.openList.push(data.statisticsList[i].openNumber);
                            } else {
                                overviewNumber.openList.push(data.statisticsList[i].openPeopleNumber);
                            }
                        }
                        //人数
                        for (let i = 0; i < data.statisticsList.length; ++i) {
                            if (this.numberType === 1) {
                                overviewNumber.submitList.push(data.statisticsList[i].submitNumber);
                            } else {
                                overviewNumber.submitList.push(data.statisticsList[i].submitPeopleNumber);
                            }
                        }

                        let start = getDateInstance(this.startDate);
                        let end = getDateInstance(this.endDate);
                        let dayDiff = differenceInCalendarDays(end, start);
                        let xAxisData = [];
                        for (let i = 0; i <= dayDiff; i++) {
                            xAxisData[i] = format(addDays(start, i), 'YYYY-MM-DD');
                        }

                        this.$nextTick(() => {
                            this.charts.overview = echarts.init(document.getElementById('overview'));
                            this.charts.overview.setOption(
                                {
                                    legend: {
                                        left: 20,
                                        top: 20,
                                        data: [
                                            {name: this.echartsOpen,icon: 'roundRect'},
                                            {name: this.echartsSubmit, icon: 'roundRect'}
                                        ]
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
                                        },
                                        {
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
                                        }
                                    ],
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
                                            name: this.echartsOpen,
                                            type: 'bar',
                                            itemStyle: {
                                                normal: {
                                                    color: '#0cc2a9'
                                                }
                                            },
                                            barWidth: 30,
                                            data: overviewNumber.openList
                                        },
                                        {
                                            name: this.echartsSubmit,
                                            type: 'bar',
                                            itemStyle: {
                                                normal: {
                                                    color: '#17f9a8'
                                                }
                                            },
                                            barWidth: 30,
                                            data: overviewNumber.submitList
                                        }]

                                });
                        });
                    });
            },

            //switch NumberType
            switchNumberType(type) {
                this.numberType = type;
                if (type === 1) {
                    this.echartsOpen = this.$t('form.PV');
                    this.echartsSubmit = this.$t('form.numberSubmissions');
                } else {
                    this.echartsOpen = this.$t('form.UV');
                    this.echartsSubmit = this.$t('form.numberOfContacts');
                }
                this.getStatisticsView();
            }
        }
    };
</script>

<style type="text/scss" lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .statistics-overview-wrapper{
        .form-number{
            .data-ul{
                display: flex;
                justify-content: space-around;
                .form-data-li{
                    border: 1px solid $form-border;
                    padding: 10px;
                    width: 300px;
                    height: 120px;
                    svg{
                        width: 16px;
                        height: 16px;
                    }
                    .number{
                        text-align: center;
                        padding: 30px;
                    }
                }
            }
            .chart{
                position: relative;
            }
            .date-tabs{
                display: flex;
                position: absolute;
                right: 200px;
                top: 75px;
                z-index: 1;
                .date-tab{
                    width: 60px;
                    border: 1px solid $form-border;
                    line-height: 24px;
                    text-align: center;
                    cursor: pointer;
                    &.active{
                        color: white;
                        background-color: $theme;
                    }
                }
            }
        }
    }

</style>