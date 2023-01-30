<template>
    <div class="analysis-chart">
        <div class="types">
            {{'eventAnalysis.chartType' | t}}
            <button type="button" class="chart-type-btn"
                    v-for="type in chartTypes"
                    v-click-into-view
                    :class="{active: type === chartType}"
                    @click="changeReportType(type)">
                <svg aria-hidden="true">
                    <use v-bind:xlink:href="'#icon-' + type"></use>
                </svg>
            </button>
        </div>
        <div class="analysis-chart-container">
            <!-- 选项 -->
            <div class="data-source-setting">
                <!-- 折线图 -->
                <template v-if="chartType === 'line' || chartType === 'bar'">
                    <label class="setting-label">{{'eventAnalysis.XAxis' | t}}</label>
                    <selector class="full-width" :options="groups" :value="groupKey" v-click-into-view.center
                              @input="$emit('update:groupKey', $event)"></selector>

                    <label class="setting-label">{{'eventAnalysis.leftYAxis' | t}}</label>
                    <multi-select class="full-width" :options="measures" :value="measureKeys.left"
                                  @input="selectMeasures($event, 'left')" v-click-into-view.center
                                  @change="drawChart"></multi-select>

                    <label class="setting-label">{{'eventAnalysis.rightYAxis' | t}}</label>
                    <multi-select class="full-width" :options="measures" :value="measureKeys.right"
                                  @input="selectMeasures($event, 'right')" v-click-into-view.center
                                  @change="drawChart"></multi-select>
                </template>
                <!-- 饼图和地图 -->
                <template v-if="chartType === 'ring' || chartType === 'map' || chartType === 'pie'">
                    <label class="setting-label">{{'eventAnalysis.showNorm' | t}}</label>
                    <multi-select class="full-width" :options="measures" :value="selectedMeasureKeys"
                                  @input="selectMeasures($event, 'none')" v-click-into-view.center
                                  @change="drawChart"></multi-select>
                </template>
                <!-- 极坐标图 -->
                <template v-if="chartType === 'polar'">
                    <label class="setting-label">{{'eventAnalysis.angularAxis' | t}}</label>
                    <selector class="full-width" :options="groups" :value="groupKey" v-click-into-view.center
                              @input="$emit('update:groupKey', $event)"></selector>
                    <label class="setting-label">{{'eventAnalysis.radiusAxis' | t}}</label>
                    <multi-select class="full-width" :options="measures" :value="selectedMeasureKeys"
                                  @input="selectMeasures($event, 'none')" v-click-into-view.center
                                  @change="drawChart"></multi-select>
                </template>
                <label class="setting-label">{{'eventAnalysis.showData' | t}}</label>
                <multi-select class="full-width" :options="series" :value="seriesKeys"
                              @input="$emit('update:seriesKeys', $event)" v-click-into-view.center
                              @change="clearCut"></multi-select>
                <template
                        v-if="(chartType === 'ring' || chartType === 'pie') && measureKeys.left.length === 1 && cutFlag">
                    <label class="setting-label">{{'eventAnalysis.dataSlice' | t}}</label>
                    <number-input class="input full-width" v-model="cutData" :min="1" :max="series.length"
                                  @sync="fathData"/>
                    <p class="light-content-text">{{'eventAnalysis.displayDataNum' | t}}</p>
                </template>
            </div>
            <div class="chart-detail-setting">
                <span class="setting-title">{{'eventAnalysis.setProperty'| t}}</span>
                <div class="tac disabled-text">{{'eventAnalysis.stayTuned' | t}}</div>
            </div>
            <div class="chart-content" v-if="mapWarnning && polarNoData">
                <div class="chart-config">
                    <span class="chart-title" :title="title">{{title}}</span>
                    <span class="zoom-tip" v-if="chartType === 'line' || chartType === 'bar' || chartType === 'polar'">
                        {{'eventAnalysis.press' | t}}<kbd>Alt</kbd>{{'eventAnalysis.key' | t}}，{{'eventAnalysis.scrollWheel' | t }}
                    </span>
                    <slot></slot>
                </div>
                <!-- echarts图表 -->
                <template v-if="!loading">
                    <template v-if="loading"></template>
                    <block-empty v-else-if="graphData[0].rows && graphData[0].rows.length === 0"/>
                    <!-- 空心饼图 -->
                    <template v-else-if="chartType === 'ring' || chartType === 'pie'">
                        <div class="chart" v-for="n in (selectedMeasures.length * (comparing ? 2 : 1))"
                             ref="pieCharts">
                        </div>
                    </template>
                    <!-- 其他图表 -->
                    <div class="chart" ref="eventChartRef" v-else></div>
                </template>
            </div>
            <div class="chart-content middle" v-else-if="!mapWarnning">
                {{'eventAnalysis.mapWarning' | t}}
            </div>
            <block-empty class="chart-content" v-else-if="!polarNoData"/>
        </div>
    </div>
</template>
<script>
    import AxisConfigModal from './event-analysis/components/axis-config-modal.vue';
    import {getLineChart} from './chart/lineChart.js';
    import {getBarChart} from './chart/barChart.js';
    import {getPieChart} from './chart/pieChart.js';
    import {getPolarChart} from './chart/polarChart.js';
    import {LINE_TYPES, LINETYPELIST} from './chart/chartConfig.js';
    import debounce from 'lodash/debounce';
    import difference from 'lodash/difference';

    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/pie';
    import 'echarts/lib/chart/line';
    import 'echarts/lib/chart/bar';
    import 'echarts/lib/chart/map';
    import 'echarts/lib/component/tooltip';
    import 'echarts/lib/component/legend';
    import 'echarts/lib/component/legendScroll';
    import 'echarts/lib/component/title';
    import 'echarts/lib/component/dataZoom';
    import 'echarts/map/js/china';
    import 'echarts/lib/component/polar';

    import { mapState } from 'vuex';


    export default {
        name: 'analysis-chart',
        components: {
            AxisConfigModal
        },
        props: {
            chartType: String,
            title: String,
            graphData: [Array, Object],
            originalTime: String,
            compareTime: String,
            // measures: Array,
            // 分组
            groups: Array,
            groupKey: [String, Number],
            // 指标
            measures: Array,
            measureKeys: Object, // 分为 left, right 两个数组
            // 数据系列
            series: Array,
            seriesKeys: Array,
            chartTypes: {
                default: () => [
                    'line', // 线图
                    'bar',  // 柱图
                    'ring',  // 环形图
                    'pie',  // 饼图
                    // 'scatter', // todo 散点图(气泡)
                    'map',  // todo 地图
                    'polar', // 极坐标
                ],
                type: Array
            }
        },
        data() {
            return {
                cutData: '',
                cutFlag: true,
                // chartTypes: [
                //     'line', // 线图
                //     'bar',  // 柱图
                //     'ring',  // 环形图
                //     // 'scatter', // todo 散点图(气泡)
                //     'map',  // todo 地图
                //     'pie',  // 饼图
                //     'polar', // 极坐标
                // ],
            };
        },
        computed: {
            ...mapState(['loading']),
            comparing() {
                return this.graphData.length > 1;
            },
            selectedSeries() {
                return this.seriesKeys
                    .map(key => this.series[key])
                    .filter(series => !!series);
            },
            selectedMeasureKeys() {
                return this.measureKeys.left.concat(this.measureKeys.right);
            },
            selectedMeasures() {
                return this.selectedMeasureKeys
                    .map(key => this.measures.find(measure => measure.id === key))
                    .filter(measure => measure);
            },
            mapWarnning() {
                if (this.chartType === 'map') {
                    if (this.groups.length === 1 && (this.groups[0].name === '省' || this.groups[0].name === 'province')) {
                        return true;
                    }
                    return false;
                }
                return true;
            },
            polarNoData() {
                if (this.chartType === 'polar') {
                    return this.groups.length === 0 ? false : true;
                }
                return true;
            }
        },
        watch: {
            // 一些场景下，需要自动选择指标
            measures(newMeasures) {
                if (newMeasures.length) {
                    // 1. 没选择任何指标：自动选择一个
                    if (this.selectedMeasureKeys.length === 0) {
                        this.selectMeasures([newMeasures[0].id], 'left');
                        return;
                    }
                    // 2. 已经选择的指标数多于可选指标数：自动选择全部可选指标
                    if (this.selectedMeasureKeys.length > newMeasures.length) {
                        this.$emit('update:measureKeys', {
                            left: newMeasures.map(m => m.id),
                            right: []
                        });
                    }
                } else {
                    // 3. 没有任何可选的指标：清空所有选择
                    if (this.selectedMeasureKeys.length !== 0) {
                        this.$emit('update:measureKeys', {
                            left: [],
                            right: []
                        });
                    }
                }
            },
            seriesKeys() {
                this.drawChart();
            },
            series(n, o) {
                let flag = false;
                if (o[1]) {
                    n.forEach(e => {
                        if (o[1].name === e.name) {
                            flag = true;
                        }
                    });
                } else {
                    n.forEach(e => {
                        if (e.name === o[0].name) {
                            flag = true;
                        }
                    });
                }
                if (!flag) {
                    this.cutData = '';
                }
            }
        },
        mounted() {
            window.addEventListener('resize', this.resizeChart, false);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.resizeChart, false);
        },
        methods: {
            changeReportType(type) {
                this.clearChart();
                this.$emit('update:chartType', type);
                this.drawChart();
                this.$parent.pieSlice = type === 'pie' || type === 'ring' ? this.cutData : '';
                this.cutData = this.$parent.pieSlice;
            },
            selectMeasures(keys, position) {
                this.clearCut();
                const newMeasureKeys = {};
                let added = difference(keys, this.selectedMeasureKeys);
                let removed = difference(this.selectedMeasureKeys, keys);
                switch (position) {
                    case 'left':
                        newMeasureKeys.left = keys;
                        newMeasureKeys.right = difference(this.measureKeys.right, keys);
                        break;
                    case 'right':
                        newMeasureKeys.right = keys;
                        newMeasureKeys.left = difference(this.measureKeys.left, keys);
                        break;
                    case 'none':
                        newMeasureKeys.left = added.concat(difference(this.measureKeys.left, removed));
                        newMeasureKeys.right = difference(this.measureKeys.right, removed);
                        break;
                    default:
                        console.error('<analysis-chart> 选择指标时，不能识别的位置：' + position);
                }
                this.$emit('update:measureKeys', newMeasureKeys);
            },
            // 清空切片
            clearCut() {
                this.cutData = '';
                this.$parent.pieSlice = this.cutData;
            },
            /**
             * 绘制图形
             */
            drawChart() {
                // 没选择任何数据，退出画图
                if (this.seriesKeys && this.seriesKeys.length === 0) {
                    this.clearChart();
                    return;
                }
                // 没有数据，退出画图
                if (this.graphData[0].rows === undefined || this.graphData[0].rows.length === 0) {
                    this.clearChart();
                    return;
                }
                // 加载状态,退出画图
                if (this.loading) {
                    this.clearChart();
                    return;
                }
                // x轴
                let xAxisData;

                // 长度大于1说明存在对比时间
                if (this.graphData.length > 1) {
                    let XAxisData1 = this.graphData[0].series;
                    let XAxisData2 = this.graphData[1].series;
                    xAxisData = XAxisData1.map((item, index) => {
                        return item + '/' + XAxisData2[index];
                    });
                } else {
                    xAxisData = this.graphData[0].series;
                }

                this.$nextTick(() => {
                    // 画图
                    let series, legend, percentIndices, seriesList, names,
                        tooltip, visualMap, yAxis, xAxis;
                    switch (this.chartType) {
                        case 'line':
                            // 线图的legend
                            ({series, legend, percentIndices} = this.handleLineData());
                            this.lineChart = echarts.getInstanceByDom(this.$refs.eventChartRef)
                                || echarts.init(this.$refs.eventChartRef);
                            if (series.length === 0) {
                                this.lineChart.clear();
                            } else {
                                this.lineChart.setOption(
                                    getLineChart(
                                        this.measureKeys.left.length,
                                        this.measureKeys.right.length,
                                        xAxisData,
                                        series,
                                        legend,
                                        percentIndices
                                    ),
                                    true
                                );
                            }
                            break;
                        case 'bar':
                            // 柱图的legend
                            ({series, legend, percentIndices} = this.handleBarData());
                            this.barChart = echarts.getInstanceByDom(this.$refs.eventChartRef)
                                || echarts.init(this.$refs.eventChartRef);
                            if (series.length === 0) {
                                this.barChart.clear();
                            } else {
                                this.barChart.setOption(
                                    getBarChart(
                                        this.measureKeys.left.length,
                                        this.measureKeys.right.length,
                                        xAxisData,
                                        series,
                                        legend,
                                        percentIndices
                                    ),
                                    true
                                );
                            }
                            break;
                        case 'ring':
                            ({seriesList, names} = this.handlePieData());
                            this.pieChart_o = seriesList.map((series, index) => {
                                let pieChartO = echarts.getInstanceByDom(this.$refs.pieCharts[index])
                                    || echarts.init(this.$refs.pieCharts[index]);
                                let measureIndex;
                                if (this.graphData.length > 1) {
                                    measureIndex = this.selectedMeasures[index]
                                        ? this.selectedMeasures[index].id
                                        : this.selectedMeasures[index - seriesList.length / 2].id;
                                } else {
                                    measureIndex = this.selectedMeasures[index].id;
                                }
                                let percent = this.measures[measureIndex] && this.measures[measureIndex].format === '2p';
                                pieChart_o.setOption(getPieChart(series, names[index], percent), true);
                                return pieChartO;
                            });

                            // 当增加或减少饼图的时候resize
                            this.resizeChart();
                            break;
                        case 'map':
                            if (!this.$refs.eventChartRef) return;
                            ({tooltip, visualMap, xAxis, yAxis, series} = this.handleMapData());
                            this.mapChart = echarts.getInstanceByDom(this.$refs.eventChartRef)
                                || echarts.init(this.$refs.eventChartRef);
                            if (series[0].data.length === 0) {
                                this.mapChart.clear();
                            } else {
                                this.mapChart.setOption(
                                    {tooltip, visualMap: [visualMap], xAxis, yAxis, series}, true
                                );
                            }
                            this.fillColor();
                            break;
                        case 'pie':
                            ({seriesList, names} = this.handlePieData());
                            this.pieChart = seriesList.map((series, index) => {
                                let pieChart = echarts.getInstanceByDom(this.$refs.pieCharts[index])
                                    || echarts.init(this.$refs.pieCharts[index]);
                                let measureIndex;
                                if (this.graphData.length > 1) {
                                    measureIndex = this.selectedMeasures[index]
                                        ? this.selectedMeasures[index].id
                                        : this.selectedMeasures[index - seriesList.length / 2].id;
                                } else {
                                    measureIndex = this.selectedMeasures[index].id;
                                }
                                let percent = this.measures[measureIndex] && this.measures[measureIndex].format === '2p';
                                let option = getPieChart(series, names[index], percent);
                                option.series.radius = '55%';
                                pieChart.setOption(option, true);
                                return pieChart;
                            });
                            this.resizeChart();
                            break;
                        case 'polar':
                            if (!this.polarNoData) {
                                break;
                            }
                            ({series, names} = this.handlePolarData());
                            this.polarChart = echarts.getInstanceByDom(this.$refs.eventChartRef)
                                || echarts.init(this.$refs.eventChartRef);
                            if (series.length === 0) {
                                this.polarChart.clear();
                            } else {
                                this.polarChart.setOption(
                                    getPolarChart(xAxisData, series, names), true
                                );
                            }
                            break;
                        default:
                            console.error('事件分析：绘图时遇到了无法处理的类型：' + this.chartType);
                    }
                });
            },
            // 画布的自适应宽度
            resizeChart: debounce(function () {
                switch (this.chartType) {
                    case 'line':
                        if (this.lineChart) {
                            this.lineChart.resize();
                        }
                        break;
                    case 'bar':
                        if (this.barChart) {
                            this.barChart.resize();
                        }
                        break;
                    case 'ring':
                        if (this.pieChart_o)
                            this.pieChart_o.forEach(item => {
                                item.resize();
                            });
                        break;
                    case 'map':
                        if (this.mapChart) {
                            this.mapChart.resize();
                        }
                        break;
                }
            }, 300),
            // 清除图表内容
            clearChart() {
                switch (this.chartType) {
                    case 'line':
                        if (this.lineChart) {
                            this.lineChart.clear();
                        }
                        break;
                    case 'bar':
                        if (this.barChart) {
                            this.barChart.clear();
                        }
                        break;
                    case 'ring':
                        if (this.pieChart_o)
                            this.pieChart_o.forEach(item => {
                                item.clear();
                            });
                        break;
                    case 'map':
                        if (this.mapChart) {
                            this.mapChart.clear();
                        }
                        break;
                    case 'pie':
                        if (this.pieChart)
                            this.pieChart.forEach(item => {
                                item.clear();
                            });
                        break;
                    case 'polar':
                        if (this.polarChart) {
                            this.polarChart.clear();
                        }
                        break;
                }
            },
            // 根据数据、显示指标、显示分组，生成饼图的标题，series
            handlePieData() {
                let seriesList = [], names = [];
                this.selectedMeasures
                    .forEach((measureOption, measureIndex) => {
                        let series = [], restSum = 0;
                        // 饼图的标题
                        names.push((this.comparing ? (this.originalTime + ' ') : '') + measureOption.name);
                        this.series
                            .forEach((_series, index) => {
                                const source = this.graphData[0].rollupRows[_series.id];
                                const value = source.values
                                    ? (source.values[0][measureIndex] ? source.values[0][measureOption.id][0] : '')
                                    : source.value;
                                if (this.seriesKeys.includes(_series.id)) {
                                    series.push({
                                        name: source.byValues.length === 0 ? this.$t('eventAnalysis.total') : (source.byValues.join(',') || `${this.$t('eventAnalysis.unknown')}(${index + 1})`),
                                        value
                                    });
                                } else {
                                    restSum += Number(value || 0);
                                }
                            });
                        // '其他'的值不为0
                        if (0 !== restSum) {
                            series.push({name: series.length === 0 ? this.$t('eventAnalysis.total') : this.$t('eventAnalysis.other'), value: restSum});
                        }
                        seriesList.push(series);

                        // 对比时间
                        if (this.comparing) {
                            // 对比饼图的标题
                            names.push(this.compareTime + ' ' + measureOption.name);
                            restSum = 0;
                            let compareSeries = [];
                            this.series
                                .forEach(_series => {
                                    // 对比饼图的标题
                                    const source = this.graphData[1].rollupRows[_series.id];
                                    const value = source.values
                                        ? (source.values[0][measureIndex] ? source.values[0][measureOption.id][0] : '')
                                        : source.value;
                                    if (this.seriesKeys.includes(_series.id)) {
                                        compareSeries.push({
                                            name: source.byValues.join(',') || this.$t('eventAnalysis.total'),
                                            value
                                        });
                                    } else {
                                        restSum += Number(value || 0);
                                    }
                                });
                            // '其他'的值不为0
                            if (0 !== restSum) {
                                compareSeries.push({name: compareSeries.length === 0 ? this.$t('eventAnalysis.total') : this.$t('eventAnalysis.other'), value: restSum});
                            }
                            seriesList.push(compareSeries);
                        }
                    });
                return {seriesList, names};
            },
            // 根据数据、显示指标、显示分组，生成线图的legend，series
            handleLineData() {
                let legend = [],
                    series = [],
                    percentIndices = []; // series 列表中需要添加百分号的序号
                const twoYAxis = this.measureKeys.left.length && this.measureKeys.right.length;
                // 选择了的分组数
                const selectedByFieldCount = this.selectedSeries.length;
                this.selectedMeasures
                    .forEach((measureOption, measureIndex) => {
                        // 与第几个y轴关联
                        const yAxisIndex = twoYAxis
                            ? (this.measureKeys.left.includes(measureOption.id) ? 0 : 1)
                            : 0;
                        // 当前measure是否为百分比单位：'2p' stands for 百分比
                        const isPercent = this.measures[measureOption.id]
                            && this.measures[measureOption.id].format === '2p';
                        // 记录 series 列表中需要添加百分号的序号
                        if (isPercent) {
                            percentIndices.push(
                                ...new Array(selectedByFieldCount)
                                    .fill(measureIndex * selectedByFieldCount)
                                    .map((base, index) => base + index)
                            );
                            if (this.comparing) {// 对比时间，多添加一组
                                percentIndices.push(
                                    ...new Array(selectedByFieldCount)
                                        .fill(measureIndex * selectedByFieldCount + selectedByFieldCount)
                                        .map((base, index) => base + index)
                                );
                            }
                        }
                        this.selectedSeries
                            .forEach((_series, index) => {
                                // 从总数据记录中取出当前分组、指标对应的数据
                                const source = this.graphData[0].rows[_series.id];
                                const data = source.values.map(value => {
                                    if (value[measureIndex] !== undefined) {
                                        return value[measureIndex][0];
                                    }
                                });
                                const name = (source.byValues.length === 0 ? this.$t('eventAnalysis.total') : (source.byValues.join(',') || `${this.$t('eventAnalysis.unknown')}(${index + 1})`))
                                    + '-' + measureOption.name;
                                const icon = 'path://' + LINETYPELIST[measureOption.id > 2 ? 2 : measureOption.id];
                                // 拼装legend
                                legend.push({name, icon});
                                // 拼装series
                                series.push({
                                    name,
                                    type: 'line',
                                    data,
                                    smooth: false,
                                    yAxisIndex,
                                    itemStyle: {
                                        normal: {
                                            lineStyle: {
                                                type: LINE_TYPES[measureOption.id > 2 ? 2 : measureOption.id]
                                            }
                                        }
                                    }
                                });

                                // 对比时间
                                if (this.comparing) {
                                    // 从总数据记录中取出当前分组、指标对应的数据
                                    let data1 = this.graphData[1].rows[_series.id].values.map(value => {
                                        if (value[measureIndex] !== undefined) {
                                            return value[measureIndex][0];
                                        }
                                    });
                                    let name1 = `「${this.$t('eventAnalysis.compared')}」` + name;
                                    // 拼装legend
                                    legend.push({name: name1, icon});
                                    // 拼装series
                                    series.push({
                                        name: name1,
                                        type: 'line',
                                        data: data1,
                                        smooth: false,
                                        yAxisIndex,
                                        itemStyle: {
                                            normal: {
                                                lineStyle: {
                                                    type: LINE_TYPES[measureOption.id > 2 ? 2 : measureOption.id]
                                                }
                                            }
                                        }
                                    });
                                }
                            });
                    });
                return {legend, series, percentIndices};
            },
            // 根据数据、显示指标、显示分组，生成线图的legend，series
            handleBarData() {
                let legend = [],
                    series = [],
                    percentIndices = []; // series 列表中需要添加百分号的序号

                const twoYAxis = this.measureKeys.left.length && this.measureKeys.right.length;
                // 选择了的分组数
                const selectedByFieldCount = this.selectedSeries.length;
                this.selectedMeasures
                    .forEach((measureOption, measureIndex) => {
                        // 与第几个y轴关联
                        const yAxisIndex = twoYAxis
                            ? (this.measureKeys.left.includes(measureOption.id) ? 0 : 1)
                            : 0;
                        // 当前measure是否为百分比单位：'2p' stands for 百分比
                        const isPercent = this.measures[measureOption.id]
                            && this.measures[measureOption.id].format === '2p';
                        // 记录 series 列表中需要添加百分号的序号
                        if (isPercent) {
                            percentIndices.push(
                                ...new Array(selectedByFieldCount)
                                    .fill(measureIndex * selectedByFieldCount)
                                    .map((base, index) => base + index)
                            );
                            if (this.comparing) {// 对比时间，多添加一组
                                percentIndices.push(
                                    ...new Array(selectedByFieldCount)
                                        .fill(measureIndex * selectedByFieldCount + selectedByFieldCount)
                                        .map((base, index) => base + index)
                                );
                            }
                        }
                        this.selectedSeries
                            .forEach((_series, index) => {
                                // 从总数据记录中取出当前分组、指标对应的数据
                                const source = this.graphData[0].rows[_series.id];
                                const data = source.values.map(value => {
                                    if (value[measureIndex] !== undefined) {
                                        return value[measureIndex][0];
                                    }
                                });
                                const name = (source.byValues.length === 0 ? this.$t('eventAnalysis.total') : (source.byValues.join(',') || `${this.$t('eventAnalysis.unknown')}(${index + 1})`))
                                    + '-' + measureOption.name;
                                // 拼装legend
                                legend.push({name});
                                // 拼装series
                                series.push({
                                    name,
                                    // type: 'bar',
                                    type: yAxisIndex ? 'line' : 'bar',
                                    data,
                                    smooth: false,
                                    yAxisIndex,
                                    stack: measureOption.name
                                });

                                // 对比时间
                                if (this.comparing) {
                                    // 从总数据记录中取出当前分组、指标对应的数据
                                    let data1 = this.graphData[1].rows[_series.id].values.map(value => {
                                        if (value[measureIndex] !== undefined) {
                                            return value[measureIndex][0];
                                        }
                                    });
                                    let name1 = `「${this.$t('eventAnalysis.compared')}」` + name;
                                    // 拼装legend
                                    legend.push({name: name1});
                                    // 拼装series
                                    series.push({
                                        name: name1,
                                        type: 'bar',
                                        data: data1,
                                        smooth: false,
                                        yAxisIndex,
                                        stack: measureOption.name + this.$t('eventAnalysis.compared')
                                    });
                                }
                            });
                    });
                return {legend, series, percentIndices};
            },
            // 根据数据、显示指标、显示分组，生成地图的legend，series
            handleMapData() {
                let seriesList = [], names = [], data = [];
                this.selectedMeasures
                    .forEach((measureOption, measureIndex) => {
                        let series = [], restSum = 0;
                        // 饼图的标题
                        names.push((this.comparing ? (this.originalTime + ' ') : '') + measureOption.name);
                        this.selectedSeries
                            .forEach(_series => {
                                const source = this.graphData[0].rollupRows[_series.id];
                                const value = source.values
                                    ? (source.values[0][measureIndex] ? source.values[0][measureOption.id][0] : '')
                                    : source.value;
                                if (this.seriesKeys.includes(_series.id)) {
                                    series.push({
                                        name: source.byValues.join(','),
                                        value
                                    });
                                } else {
                                    restSum += Number(value || 0);
                                }
                            });
                        // '其他'的值不为0
                        if (0 !== restSum) {
                            series.push({name: series.length === 0 ? this.$t('eventAnalysis.total') : this.$t('eventAnalysis.other'), value: restSum});
                        }
                        seriesList.push(series);

                        // 对比时间
                        if (this.comparing) {
                            // 对比饼图的标题
                            names.push(this.compareTime + ' ' + measureOption.name);
                            restSum = 0;
                            let compareSeries = [];
                            this.series
                                .forEach(_series => {
                                    // 对比饼图的标题
                                    const source = this.graphData[1].rollupRows[_series.id];
                                    const value = source.values
                                        ? (source.values[0][measureIndex] ? source.values[0][measureOption.id][0] : '')
                                        : source.value;
                                    if (this.seriesKeys.includes(_series.id)) {
                                        compareSeries.push({
                                            name: source.byValues.join(','),
                                            value
                                        });
                                    } else {
                                        restSum += Number(value || 0);
                                    }
                                });
                            // '其他'的值不为0
                            if (0 !== restSum) {
                                compareSeries.push({name: compareSeries.length === 0 ? this.$t('eventAnalysis.total') : this.$t('eventAnalysis.other'), value: restSum});
                            }
                            seriesList.push(compareSeries);
                        }
                    });
                // 格式化省份名称, 传递要显示的 data 数据
                seriesList[0].forEach(element => {
                    if (element.name.split(',')[0]) {
                        // 未知, 总数, 其他 没有省份名称,也要排除在外
                        element.name = element.name === this.$t('eventAnalysis.other') ? '' : element.name.split(',')[0].substring(0, 3);
                    } else {
                        element.name = '';
                    }
                    if (element.name !== '黑龙江' && element.name !== '内蒙古') {
                        if (element.name) {
                            element.name = element.name.substring(0, 2);
                            data.push(element);
                        }
                    } else if (element.name) {
                        data.push(element);
                    }
                });
                // 鼠标上浮时的显示样式
                let tooltip = {
                        trigger: 'item',
                        formatter: function (params) {
                            if (params.name && params.value) {
                                return `${params.name} : ${params.value}`;
                            }
                        }
                    },
                    // 左下的图例
                    visualMap = {
                        seriesIndex: 0,
                        min: 0,
                        max: 2500,
                        left: 'left',
                        top: 'bottom',
                        text: ['High', 'Low'],
                        calculable: true,
                        controller: {
                            inRange: {
                                color: ['#f6efa6', '#d88273', '#bf444c'],
                                symbol: ['roundRect'],
                                symbolSize: [8, 8],
                            },
                            outOfRange: {
                                color: ['#aaa'],
                                symbol: ['roundRect'],
                                symbolSize: [10, 20],
                            }
                        }
                    },
                    // X轴
                    xAxis = {
                        type: 'category',
                        data: [],
                        splitNumber: 1,
                        show: false,
                    },
                    // Y轴
                    yAxis = {
                        show: false,
                        position: 'right',
                        min: 0,
                        max: 20,
                        splitNumber: 20,
                        inverse: true,
                        axisLabel: {
                            show: true,
                        },
                        axisLine: {
                            show: false,
                        },
                        splitLine: {
                            show: false,
                        },
                        axisTick: {
                            show: false,
                        },
                        data: [],
                    },
                    // 数据
                    series = [
                        {
                            zlevel: 0,
                            name: '中国',
                            type: 'map',
                            mapType: 'china',
                            selectedMode: 'multiple',
                            roam: true,
                            zoom: 1.25,
                            label: {
                                normal: {
                                    show: true,
                                },
                                emphasis: {
                                    show: true,
                                },
                            },
                            data,
                            // data: [
                            //     {name: '北京',value: 2472 },
                            // ]
                        }
                    ];
                return {tooltip, visualMap, xAxis, yAxis, series};
            },
            /**
             * 根据值获取线性渐变颜色
             * @param  {String} start 起始颜色 ⭐RGB-16进制颜色，不能使用RGBA-16进制颜色
             * @param  {String} end   结束颜色 ⭐RGB-16进制颜色，不能使用RGBA-16进制颜色
             * @param  {Number} max   最多分成多少份
             * @param  {Number} val   渐变取值
             * @return {String}       颜色 (例：#606060)
             */
            transitionColor(start, end, max, val) {
                let rgb = /#((?:[0-9]|[a-fA-F]){2})((?:[0-9]|[a-fA-F]){2})((?:[0-9]|[a-fA-F]){2})/;
                let sM = start.match(rgb);
                let eM = end.match(rgb);
                let err = '';
                max = max || 1;
                val = val || 0;
                if (sM === null) {
                    err = 'start';
                }
                if (eM === null) {
                    err = 'end';
                }
                if (err.length > 0) {
                    throw new Error('Invalid ' + err + ' color format, required hex color');
                }
                let sR = parseInt(sM[1], 16),
                    sG = parseInt(sM[2], 16),
                    sB = parseInt(sM[3], 16);
                let eR = parseInt(eM[1], 16),
                    eG = parseInt(eM[2], 16),
                    eB = parseInt(eM[3], 16);
                let p = val / max;
                let gR = Math.round(sR + (eR - sR) * p)
                        .toString(16),
                    gG = Math.round(sG + (eG - sG) * p)
                        .toString(16),
                    gB = Math.round(sB + (eB - sB) * p)
                        .toString(16);
                return '#' + gR + gG + gB;
            },
            // 地图由数据填色
            fillColor() {
                let option = this.mapChart.getOption();
                if (!option.series[0]) return;
                let TOPN = option.series[0].data.length;
                // 修改top
                option.grid[0].height = 523;
                option.yAxis[0].max = 32;
                option.yAxis[0].splitNumber = TOPN;
                // option.series[1].data[0] = TOPN;
                // 排序
                let data = option.series[0].data.sort(function (a, b) {
                    return b.value - a.value;
                });

                let maxValue = data[0].value,
                    minValue = data[data.length - 1].value;

                option.visualMap[0].max = maxValue;
                option.visualMap[0].range = [0, maxValue];

                let s = option.visualMap[0].controller.inRange.color[0],
                    e = option.visualMap[0].controller.inRange.color.slice(-1)[0];
                let sColor = this.transitionColor(s, e, maxValue, minValue);
                let eColor = this.transitionColor(s, e, maxValue, maxValue);

                // option.series[1].itemStyle.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                //     offset: 1,
                //     color: sColor,
                // },{
                //     offset: 0,
                //     color: eColor,
                // }]);

                // yAxis
                let newYAxisArr = [];
                echarts.util.each(data, (item, i) => {
                    if (i >= TOPN) {
                        return false;
                    }
                    let c = this.transitionColor(sColor, eColor, maxValue, item.value);
                    newYAxisArr.push({
                        value: item.name,
                        textStyle: {
                            color: c
                        }
                    });
                });
                option.yAxis[0].data = newYAxisArr;
                option.yAxis[0].axisLabel.formatter = (function (data) {
                    return function (value, i) {
                        if (!value) return '';
                        return value + ' ' + data[i].value;
                    };
                })(data);
                this.mapChart.setOption(option, true);
            },
            // 根据数据、显示指标、显示分组，生成极坐标图的数据
            handlePolarData() {
                let names = [],
                    legend = [],
                    series = [];
                this.selectedMeasures.forEach((item, index) => {
                    // data.push(item.name);
                    // let restSum = 0;
                    this.selectedSeries
                        .forEach(_series => {
                            const source = this.graphData[0].rows[_series.id];
                            const data = source.values.map(value => {
                                if (value[index] !== undefined) {
                                    return value[index][0];
                                }
                            });
                            if (this.seriesKeys.includes(_series.id)) {
                                series.push({
                                    type: 'bar',
                                    data,
                                    name: source.byValues.join(',') || (series.length === 0 ? this.$t('eventAnalysis.total') : this.$t('eventAnalysis.other')),
                                    coordinateSystem: 'polar',
                                    stack: item.name,
                                });
                                names.push(source.byValues.join(','));
                            }
                            // else {
                            //     restSum += Number(value || 0);
                            // }

                            // 对比时间
                            if (this.comparing) {
                                // 从总数据记录中取出当前分组、指标对应的数据
                                let data1 = this.graphData[1].rows[_series.id].values.map(value => {
                                    if (value[index] !== undefined) {
                                        return value[index][0];
                                    }
                                });
                                let name1 = `「${this.$t('eventAnalysis.compared')}」` + name;
                                // 拼装legend
                                legend.push({name: name1});
                                // 拼装series
                                series.push({
                                    name: name1,
                                    type: 'bar',
                                    data: data1,
                                    smooth: false,
                                    // yAxisIndex,
                                    stack: item.name + this.$t('eventAnalysis.compared')
                                });
                            }
                        });
                    // if (0 !== restSum) {
                    //     series.push({
                    //         name: series.length === 0 ? '总体' : '其他',
                    //         data: [restSum],
                    //         type: 'bar',
                    //         coordinateSystem: 'polar',
                    //         stack: 'a'
                    //     });
                    // }

                });
                return {series, names};
            },
            // 数据切片
            fathData() {
                let wsortData = this.graphData[0].rollupRows;
                let ser = this.measureKeys.left[0];
                if (wsortData[0].value) {
                    // 属性分析
                    wsortData.sort(function (a, b) {
                        return b.value - a.value;
                    });
                } else {
                    // 事件分析
                    wsortData.sort(function (a, b) {
                        return b.values[0][ser][0] - a.values[0][ser][0];
                    });
                }
                let arr = [];
                for (let i = 0; i < this.cutData; i++) {
                    arr.push(i);
                }
                this.$emit('childKeys', arr, wsortData);
                this.$parent.pieSlice = this.cutData;
            }
        }
    };
</script>
<style lang="scss">
    @import "../common/scss/base/variables";
    @import "../common/scss/base/mixin";

    // 图表
    .analysis-chart {
        border: 1px solid $border-color;
        background-color: white;
        clear: both;
        @include clearfix();

        &:hover {
            @include box-shadow(0 3px 8px rgba(#8b9daf, .16));
        }

        .types { // 1/4 图表类型选择
            padding: 24px;
            font-size: 16px;
            line-height: 48px;
            color: $color-light-content;
            background-color: $title-bg;
            @include user-select(none);
            border-bottom: 2px solid $select-border;

            .chart-type-btn {
                display: inline-block;
                width: 48px;
                margin-left: 24px;
                padding: 0;
                vertical-align: top;
                border: 1px solid $form-border;
                border-radius: 4px;
                background-color: white;
                @include grayscale(1);
                @include transition();
                cursor: pointer;

                svg {
                    display: block;
                    margin: 11px auto;
                    width: 24px;
                    height: 24px;
                    fill: $theme;
                }

                &:hover {
                    border-color: $light-theme;
                    @include grayscale(0);
                }

                &.active,
                &:active {
                    border-color: $theme;
                    @include grayscale(0);
                    @include box-shadow(0 2px 6px rgba($theme, .25));
                }
            }
        }

        $chart-content-min-height: 584px;
        $chart-setting-width: 200px;

        .analysis-chart-container {
            display: flex;
        }

        // 2/4 图表数据源设置
        // 3/4 图表细节设置
        .data-source-setting,
        .chart-detail-setting {
            /*float: left;*/
            @include box-sizing();
            width: $chart-setting-width;
            min-height: $chart-content-min-height;
            padding: 16px;
        }

        .data-source-setting {
            background-color: $title-bg;
            border-right: 1px solid $border-color;
        }

        .setting-title {
            display: block;
            margin-bottom: 4px;
            font-size: 16px;
            line-height: 42px;
            color: $disabled;
            border-bottom: 1px solid $divide-border;
            @include user-select(none);
        }

        .setting-label {
            display: block;
            line-height: 28px;

            ~ .setting-label {
                margin-top: 14px;
            }
        }

        .chart-content { // 3/3 图表内容
            $chart-height: $chart-content-min-height - 24px - 5px - $input-field-height;

            flex: 1;
            border-left: 1px solid $border-color;

            .chart-config {
                display: flex;
                padding: 24px 24px 5px;
                line-height: $input-field-height;

                .chart-title {
                    flex: 1;
                    @include ellipsis();
                }

                .zoom-tip {
                    color: $disabled;
                    padding: 0 16px 0 8px;
                    @include user-select(none);
                }

                kbd {
                    margin: 0 3px;
                    padding: 3px;
                    border: 1px solid $border-color;
                    border-radius: 4px;
                    @include box-shadow(0 2px 2px $border-color);
                }
            }

            .chart {
                height: $chart-height;
            }

            &.middle {
                font-size: 14px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }
    }
</style>
