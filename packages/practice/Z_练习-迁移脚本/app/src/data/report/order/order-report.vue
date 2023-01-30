<template>
    <div class="order-report">
        <div class="content-view">
            <crumbs/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'home.orderReport' | t}}</h1>
                <!-- fixme 区间不能选择到今天以后 -->
                <date-range class="pull-right" :start="startDate" :end="endDate"
                            @change="pickDate"></date-range>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view margin">
                <ul class="title-summary">
                    <li>
                        <p class="number">{{summary.order.toLocaleString()}}</p>
                        <p class="text" :tip="$t('data.oneDayDelay')">{{'report.orderQuantity' | t}}</p>
                        <img src="./images/order_1.png" alt="order">
                    </li>
                    <li>
                        <p class="number"><span>￥</span>{{summary.amount.toLocaleString()}}</p>
                        <p class="text" :tip="$t('data.oneDayDelay')">{{'report.orderAmount' | t}}</p>
                        <img src="./images/amount_1.png" alt="amount">
                    </li>
                    <li>
                        <p class="number"><span>￥</span>{{summary.unitPrice.toLocaleString()}}</p>
                        <p class="text" :tip="$t('data.oneDayDelay')">{{'report.averagePrice' | t}}</p>
                        <img src="./images/unit-price_1.png" alt="unit-price">
                    </li>
                    <li>
                        <p class="number">{{summary.conversion.toLocaleString()}}</p>
                        <p class="text" :tip="$t('data.oneDayDelay')">{{'report.convertOrder' | t}}</p>
                        <img src="./images/order-conversion_1.png" alt="order-conversion">
                    </li>
                    <li>
                        <p class="number">{{summary.conversionRatio}}%</p>
                        <p class="text" :tip="$t('data.oneDayDelay')">{{'report.convertRate' | t}}</p>
                        <img src="./images/conversion-ratio_1.png" alt="conversion-ratio">
                    </li>
                </ul>
                <div class="offline-order-wrapper">
                    <diagram class="offline-diagram-1" ref="offlineDiagram1"
                             :diagramData="diagramData.offlineOrderDiagram1"></diagram>
                    <diagram class="offline-diagram-2" ref="offlineDiagram2"
                             :diagramData="diagramData.offlineOrderDiagram2"></diagram>
                    <diagram class="offline-diagram-3" ref="offlineDiagram3"
                             :diagramData="diagramData.offlineOrderDiagram3"></diagram>
                    <diagram class="offline-diagram-4" ref="offlineDiagram4"
                             :diagramData="diagramData.offlineOrderDiagram4"></diagram>
                </div>
                <div class="hoot-goods">
                    <diagram class="goods-class" ref="goodsClass" :diagramData="diagramData.goodsClass"></diagram>
                    <diagram class="goods-category" ref="goodsCategory"
                             :diagramData="diagramData.goodsCategory"></diagram>
                </div>
                <diagram class="unit-price" ref="unitPriceAnalysis"
                         :diagramData="diagramData.unitPriceAnalysis"></diagram>
                <!-- <div class="sell-terminal">
                    <diagram class="sell-way" :diagramData="diagramData.sellWayRatio"></diagram>
                    <diagram class="offline-terminal" :diagramData="diagramData.offlineTerminal"></diagram>
                </div> -->

            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import { ScrmApiV1 } from '@/api';
    import diagram from '../../../common/components/diagram/diagram.vue';
    import format from 'date-fns/format';
    import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
    import addDays from 'date-fns/add_days';
    import {
        goodsCategory,
        goodsClass,
        offlineOrderDiagram1,
        offlineOrderDiagram2,
        offlineOrderDiagram3,
        offlineOrderDiagram4,
        unitPriceAnalysis
    } from './orderChartOptions';
    import {getDateInstance} from '../../../common/utils/dateUtils';

    export default {
        data() {
            return {
                endDate: '',
                startDate: '',
                summary: {
                    order: 0,
                    amount: 0,
                    unitPrice: 0,
                    conversion: 0,
                    conversionRatio: 0
                },
                // echats数据从外部js引入
                diagramData: {
                    offlineOrderDiagram1: {},
                    offlineOrderDiagram2: {},
                    offlineOrderDiagram3: {},
                    offlineOrderDiagram4: {},
                    goodsClass: {},
                    goodsCategory: {},
                    unitPriceAnalysis: {}
                }
            };
        },
        created() {
            this.diagramData.offlineOrderDiagram1 = offlineOrderDiagram1();
            this.diagramData.offlineOrderDiagram2 = offlineOrderDiagram2();
            this.diagramData.offlineOrderDiagram3 = offlineOrderDiagram3();
            this.diagramData.offlineOrderDiagram4 = offlineOrderDiagram4();
            this.diagramData.goodsClass = goodsClass();
            this.diagramData.goodsCategory = goodsCategory();
            this.diagramData.unitPriceAnalysis = unitPriceAnalysis();
            // this.diagramData.sellWayRatio = sellWayRatio()
            // this.diagramData.offlineTerminal = offlineTerminal()
            // 本页中所有的today均为昨天的日期(当天没有数据)。
        },
        mounted() {
            this.pickDate({
                start: format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD'),
                end: format(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-DD')
            });
        },
        methods: {
            // ajax: 数据纵览(第一个时间是结束)
            getTotalSummary() {
                ScrmApiV1
                    .orderSummary(this.endDate, this.startDate)
                    .then(({body: {data: {SCRMCount, perMoney, saleTotalCount, saleTotalMoney, transformPercent}}}) => {
                        this.summary.order = saleTotalCount;
                        this.summary.amount = saleTotalMoney;
                        this.summary.unitPrice = perMoney;
                        this.summary.conversion = SCRMCount;
                        this.summary.conversionRatio = transformPercent;
                    });
            },

            // ajax: 线下订单成交量 图1
            getofflineOrderDiagramOne() {
                ScrmApiV1
                    .offlineOrderDiagram(this.endDate, this.startDate)
                    .then((res) => {
                        this.diagramData.offlineOrderDiagram1.echatOption.series[0].data = res.body.data.totalCountList;
                        this.diagramData.offlineOrderDiagram1.echatOption.series[1].data = res.body.data.mailCountList;
                        this.diagramData.offlineOrderDiagram1.echatOption.series[2].data = res.body.data.smsCountList;
                        this.diagramData.offlineOrderDiagram1.echatOption.series[3].data = res.body.data.wechatCountList;

                        this.diagramData.offlineOrderDiagram1.echatOption.xAxis.data = this.computeXaxisTime();
                        this.$refs.offlineDiagram1.$emit('setEchats');
                    });
            },
            // ajax: 线下订单成交量 图2
            getofflineOrderDiagramTwo() {
                ScrmApiV1
                    .offlineOrderDiagramTwo(this.endDate, this.startDate)
                    .then((res) => {
                        this.diagramData.offlineOrderDiagram2.echatOption.series[0].data = res.body.data.totalCountList;
                        this.diagramData.offlineOrderDiagram2.echatOption.series[1].data = res.body.data.SCRMCountList;

                        this.diagramData.offlineOrderDiagram2.echatOption.xAxis.data = this.computeXaxisTime();
                        this.$refs.offlineDiagram2.$emit('setEchats');
                    });
            },
            // ajax: 线下订单成交量 图3
            getofflineOrderDiagramThree() {
                ScrmApiV1
                    .offlineOrderDiagramThree(this.endDate, this.startDate)
                    .then((res) => {
                        // 两小时的合并为一条
                        let dataBy12 = [];
                        for (let i = 0; i < res.body.data.countList.length; i += 2) {
                            dataBy12.push(res.body.data.countList[i] + res.body.data.countList[i + 1]);
                        }
                        this.diagramData.offlineOrderDiagram3.echatOption.series[0].data = dataBy12;
                        this.diagramData.offlineOrderDiagram3.echatOption.xAxis.data = this.computeXaxisTime();
                        this.$refs.offlineDiagram3.$emit('setEchats');
                    });
            },
            // ajax: 线下订单成交量 图4
            getofflineOrderDiagramFour() {
                ScrmApiV1
                    .offlineOrderDiagramFour(this.endDate, this.startDate)
                    .then((res) => {
                        this.diagramData.offlineOrderDiagram4.echatOption.series[0].data = res.body.data.countList;
                        this.$refs.offlineDiagram4.$emit('setEchats');
                    });
            },

            // ajax: 热销产品分类和品类
            getGoodsClass() {
                ScrmApiV1
                    .goodsClass(this.endDate, this.startDate)
                    .then((res) => {
                        this.computePieDiagram(this.diagramData.goodsClass, res.body.data);
                        this.$refs.goodsClass.$emit('setEchats');
                    });
            },
            getGoodsCategory() {
                ScrmApiV1
                    .goodsCategory(this.endDate, this.startDate)
                    .then((res) => {
                        this.computePieDiagram(this.diagramData.goodsCategory, res.body.data);
                        this.$refs.goodsCategory.$emit('setEchats');
                    });
            },

            // ajax: 客单价分析
            getUnitPriceAnalysis() {
                ScrmApiV1
                    .unitPriceAnalysis(this.endDate, this.startDate)
                    .then((res) => {
                        this.diagramData.unitPriceAnalysis.echatOption.series[0].data = res.body.data.perMoneyMemberList;
                        this.diagramData.unitPriceAnalysis.echatOption.series[1].data = res.body.data.perMoneyUnmemberList;
                        this.diagramData.unitPriceAnalysis.echatOption.series[2].data = res.body.data.perMoneyFansList;

                        this.diagramData.unitPriceAnalysis.echatOption.xAxis.data = this.computeXaxisTime();
                        this.$refs.unitPriceAnalysis.$emit('setEchats');
                    });
            },
            pickDate({start, end}) {
                this.startDate = start;
                this.endDate = end;

                if (this.endDate !== '' && this.startDate !== '') {
                    this.loadingDiagram();
                    this.getTotalSummary();
                    this.getofflineOrderDiagramOne();
                    this.getofflineOrderDiagramTwo();
                    this.getofflineOrderDiagramThree();
                    this.getofflineOrderDiagramFour();
                    this.getGoodsClass();
                    this.getGoodsCategory();
                    this.getUnitPriceAnalysis();
                } else {
                    this.$toast(this.$t('report.selectDate'), 'warn');
                    this.startDate = '';
                    this.endDate = '';
                }
            },

            // echats操作, 设置每个图的x轴坐标, 返回x轴数据
            computeXaxisTime() {
                let start = getDateInstance(this.startDate);
                let end = getDateInstance(this.endDate);
                let dayDiff = differenceInCalendarDays(end, start);
                let xAxisData = [];
                for (let i = 0; i <= dayDiff; i++) {
                    xAxisData[i] = format(addDays(start, i), 'MM-DD');
                }
                return xAxisData;
            },
            // 使echat进入loading
            loadingDiagram() {
                this.$refs.offlineDiagram1.$emit('clearEchats');
                this.$refs.offlineDiagram2.$emit('clearEchats');
                this.$refs.offlineDiagram3.$emit('clearEchats');
                this.$refs.offlineDiagram4.$emit('clearEchats');
                this.$refs.goodsClass.$emit('clearEchats');
                this.$refs.goodsCategory.$emit('clearEchats');
                this.$refs.unitPriceAnalysis.$emit('clearEchats');
            },
            // echats操作, 设置饼图数据 , 在获取ajax后调用
            computePieDiagram(obj, response) {
                if (response.mapList.length > 0) {
                    obj.echatOption.legend.data = [];
                    for (let item of obj.echatOption.series[0].data) {
                        item.name = '';
                        item.value = '';
                    }
                    for (let i = 0; i < response.mapList.length; i++) {
                        obj.echatOption.legend.data[i] = response.mapList[i].categoryName;
                        obj.echatOption.series[0].data[i].name = response.mapList[i].categoryName;
                        obj.echatOption.series[0].data[i].value = response.mapList[i].percent;
                    }
                } else {
                    obj.echatOption.legend.data = [
                        this.$t('report.category1'),
                        this.$t('report.category2'),
                        this.$t('report.category3'),
                        this.$t('report.category4'),
                        this.$t('report.category5'),
                        this.$t('report.category6'),
                        this.$t('report.category7')];
                    for (let index in obj.echatOption.series[0].data) {
                        obj.echatOption.series[0].data[index].name = obj.echatOption.legend.data[index];
                        obj.echatOption.series[0].data[index].value = 0;
                    }
                }
            }
        },
        components: {diagram}
    };
</script>
<style lang="scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';

    .order-report {

        .title-summary {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;

            li {
                position: relative;
                flex: 1 1 200px;
                margin: 0 8px;
                border-radius: 4px;

                &:nth-of-type(1) {
                    margin-left: 0;
                }

                &:nth-last-of-type(1) {
                    margin-right: 0;
                }

                img {
                    display: block;
                    width: 100%;
                    height: auto;
                }

                .number {
                    position: absolute;
                    right: 10%;
                    top: 18%;
                    text-align: right;
                    color: $dark-green;
                    @include summary-media();
                    span {
                        font-size: 20px;
                    }
                }
                .text {
                    position: absolute;
                    right: 10%;
                    top: 55%;
                    text-align: right;
                    font-size: 16px;
                    color: $color-light-content;

                    &:after {
                        display: block;
                        content: attr(tip);
                        font-size: 12px;
                        color: $disabled;
                    }
                }
            }
        }
        .offline-order-wrapper {
            display: flex;
            flex-wrap: wrap;
            align-items: flex-end;
            background-color: white;

            .offline-diagram-1,
            .offline-diagram-3 {
                width: 60%;
            }
            .offline-diagram-2,
            .offline-diagram-4 {
                width: 40%;
            }
        }

        .hoot-goods {
            overflow: hidden;
            padding: 16px 0;

            .goods-class,
            .goods-category {
                float: left;
                width: 49%;
                height: 100%;
                background: white;
            }

            .goods-class {
                margin-right: 2%;
            }
        }
        .unit-price {
            margin-bottom: 15px;
        }
    }
</style>
