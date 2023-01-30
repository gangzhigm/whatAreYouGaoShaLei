<template>
    <div class="board-inner-chart">
        <block-empty v-if="drawChartData.length === 0"/>
        <template v-else-if="type === 'table' && drawChartData.length !== 0">
            <div class='table-content'>
                <table>
                    <thead>
                    <tr>
                        <td v-for='item in showNameTable' :title='item'>{{item}}</td>
                    </tr>
                    </thead>
                </table>
                <table>
                    <tbody>
                    <tr class="label-tr" v-for="(item,index) in tableList">
                        <td v-for='number in item' :title='number'>{{number ? number: '-'}}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </template>
        <template v-else>
            <div class="chart-box">
                <div class="chart" ref="visualChartRef"></div>
            </div>
        </template>
    </div>
</template>
<script>

    import { QueryApi } from '@/api';
    import {getLineChart} from '../../../visualization/visual-chart/lineChart.js';
    import {getPieChart} from '../../../visualization/visual-chart/pieChart.js';
    import {getBarChart} from '../../../visualization/visual-chart/barChart.js';
    import {getGaugeChart} from '../../../visualization/visual-chart/gaugeChart.js';
    import {getPolarChart} from '../../../visualization/visual-chart/polarChart.js';
    // echarts
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/pie';
    import 'echarts/lib/chart/line';
    import 'echarts/lib/chart/bar';
    import 'echarts/lib/chart/gauge';
    import 'echarts/lib/component/polar';
    import 'echarts/lib/component/tooltip';
    import 'echarts/lib/component/legend';
    import 'echarts/lib/component/legendScroll';
    import 'echarts/lib/component/title';
    import 'echarts/lib/component/dataZoom';

    export default {
        components: {},
        props: {
            queryName: Object,
            type: String,
            unit: String,
            measures: Array,
            byFields: Array,
            filter: Object,
            groupId: Number,
            tableName: String,
            showName: Object,
            gaugeShow: Number,
            pieSlice: [Number, String],
            name: String,
            size: String,
            start: String,
            end: String,
        },
        data() {
            return {
                dataEmpty: false,
                _chart: null,
                drawChartData: [],
                // X轴下拉框默认值
                groupKey: '',
                // Y轴下拉框默认值
                groupKeyY: {
                    left: '',
                    right: ''
                },
                // 数据分组下拉框默认值
                groupKeyData: '',
                // 表格图形下拉框默认值
                groupTableData: [],
                showNameTable: [],
                tableList: [],
            };
        },

        computed: {

            drawType() {
                return this.timeValue === 'total' ? 'total' : 'group';
            },
            reportData() {
                let fields = [];
                let measure = [];
                this.byFields.forEach(item => {
                    if (item.attrId !== '') {
                        fields.push(item);
                    }
                });
                this.measures.forEach(item => {
                    if (item.attrId !== '') {
                        measure.push(item);
                    }
                });
                return {
                    byFields: fields,
                    chartType: this.type,
                    cid: this.$store.state.user.cid,
                    filter: this.filter,
                    fromDate: this.start,
                    measures: measure,
                    tableName: this.tableName,
                    toDate: this.end,
                    unit: this.unit
                };
            },
        },

        watch: {
            size() {
                this.drawChart(this.drawChartData);
            },
        },

        mounted() {
            //echart组件使用
            this.$nextTick(()=>{
                this.getReportData();
            });
        },

        methods: {
            getReportData() {
                this.$loading();
                QueryApi
                    .getVisualReportData(this.reportData)
                    .then(res => {
                        this.drawChartData = res.body.data;
                        this.handleChartData();
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            refresh() {
                this.getReportData();
            },
            //  处理画图数据
            handleChartData() {
                switch (this.type) {
                    case 'line':
                    case 'bar':
                    case 'cross':
                    case 'pm':
                    case 'arealine':
                    case 'pie':
                    case 'polar':
                        if (this.byFields.length === 1) {
                            this.groupKey = this.byFields[0].attrId;
                        } else if (this.byFields.length === 2) {
                            this.groupKey = this.byFields[0].attrId;
                            this.groupKeyData = this.byFields[1].attrId;
                        }
                        if (this.measures.length === 1) {
                            this.groupKeyY.left = this.measures[0].attrId;
                        } else if (this.measures.length === 2) {
                            this.groupKeyY.left = this.measures[0].attrId;
                            this.groupKeyY.right = this.measures[1].attrId;
                        }
                        this.$nextTick(() => {
                            this.drawChart(this.drawChartData);
                        });
                        break;
                    case 'gauge':
                        if (this.byFields.length === 2) {
                            this.groupKeyY.left = this.byFields[0].attrId;
                            this.groupKeyY.right = this.byFields[1].attrId;
                        }
                        this.$nextTick(() => {
                            this.drawChart(this.drawChartData);
                        });
                        break;
                    case 'table':
                        this.groupTableData = [];
                        this.showNameTable = [];
                        if (this.byFields.length > 0) {
                            this.byFields.forEach(item => {
                                this.groupTableData.push(item.attrId);
                                this.showNameTable.push(item.attrName);
                            });
                        }
                        this.tableList = this.drawChartData;
                        break;
                }
            },

            // 画图
            drawChart(data) {
                // 没有数据，退出画图
                if (data.length === 0) {
                    if (this._chart) this._chart.clear();
                    return;
                }
                this._chart = echarts.getInstanceByDom(this.$refs.visualChartRef)
                    || echarts.init(this.$refs.visualChartRef);
                switch (this.type) {
                    case 'line':
                    case 'arealine':
                        this._chart.setOption(
                            getLineChart(this.type, this.showName.x, this.showName.yLeft, data), true);
                        break;
                    case 'bar':
                    case 'cross':
                    case 'pm':
                        this._chart.setOption(
                            getBarChart(this.type,
                                this.showName.x, this.showName.yLeft,
                                this.showName.yRight, this.groupKeyY.right, this.groupKeyData, data),
                            true);
                        break;
                    case 'pie':
                        this._chart.setOption(getPieChart(data, this.pieSlice, this.name), true);
                        break;
                    case 'gauge':
                        this._chart.setOption(getGaugeChart(this.showName.gauge, this.gaugeShow, this.showName, data,
                            this.groupId, this.size), true);
                        break;
                    case 'polar':
                        this._chart.setOption(getPolarChart(data), true);
                        break;
                    default:
                        break;
                }
            },

            // 画布的自适应宽度
            resize() {
                if (this._chart) {
                    this._chart.resize();
                }
            },
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .board-inner-chart {
        position: relative;
        height: calc(100% - 37px);

        .chart-box {
            position: relative;
            height: 100%;

            .chart {
                position: relative;
                height: 100%;
                background-color: white;
            }
        }
        .table-content {
            width: 100%;
            height: calc(100% - 30px);
            margin: 0 auto;
            overflow: auto;
        }
        table {
            width: 100%;
            $row-height: 48px;
            table-layout: fixed;
            border-spacing: 0;
            border-collapse: collapse;
            background-color: white;
            border-left: 1px solid $border-color;
            border-right: 1px solid $border-color;

            tr {
                border-bottom: 1px solid $border-color;
                td {
                    height: $row-height - 1;
                    padding: 0 12px;
                    @include ellipsis();
                    overflow: hidden;
                    width: 140px;
                }
            }
            thead {
                background-color: $title-bg;
                color: #6e7376;
                font-weight: bold;
            }
            tbody {
                tr {
                    cursor: pointer;

                    .action-icon {
                        $width: 16px;
                        width: $width;
                        height: $width;
                    }

                    &:not(.no-hover):hover {
                        background-color: $select-bg;
                    }
                }
            }
        }
    }
</style>
