<template>
    <div class="board-chart-graph">
        <div class="graph-header"
             v-if="pieChartCounts > 1 && (chartType === 'pie' || chartType === 'ring') && compareTime">
            {{'board.switchTarget' | t}}&nbsp;
            <button class="previous-pie-btn icon icon-arrow-left"
                    :disabled="activePieIndex === 0"
                    @click="activePieIndex = activePieIndex <= 0 ? 0 : activePieIndex - 1"></button>
            <button class="next-pie-btn icon icon-arrow-right" v-if="pieChartCounts"
                    :disabled="activePieIndex === pieChartCounts - 1"
                    @click="activePieIndex = (activePieIndex >= pieChartCounts - 1) ? pieChartCounts - 1 : activePieIndex + 1"></button>
        </div>
        <!-- echarts -->
        <!-- 环形图 -->
        <div class="chart-box" v-show="chartType === 'ring'">
            <div class="pie" v-for="n in pieChartCounts" ref="ringCharts"
                 :class="{many: pieChartCounts > 1, active: activePieIndex === n - 1}">
            </div>
        </div>
        <!--饼图-->
        <div class="chart-box" v-show="chartType === 'pie'">
            <div class="pie" v-for="n in pieChartCounts" ref="pieCharts"
                 :class="{many: pieChartCounts > 1, active: activePieIndex === n - 1}">
            </div>
        </div>
        <!--线图和柱图-->
        <div class="chart" :class="{invalid: mapUnonlyProvince}" ref="eventChartRef" :data-invalid="$t('eventAnalysis.mapWarning')"
             v-show="chartType === 'line' || chartType === 'bar' || chartType === 'map' || chartType === 'polar'"></div>
    </div>
</template>
<script>
    import { WebServAttrApiV1 } from '@/api';
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/line';
    import 'echarts/lib/chart/bar';
    import 'echarts/lib/chart/pie';
    import 'echarts/lib/chart/map';
    import 'echarts/lib/component/tooltip';
    import 'echarts/lib/component/legend';
    import 'echarts/lib/component/legendScroll';
    import 'echarts/map/js/china';
    import {AGGREATOR_OPTIONS_MAP, LINE_TYPES, LINETYPELIST} from '../../chart/chartConfig.js';
    import {getLineChart} from '../../chart/lineChart.js';
    import {getBarChart} from '../../chart/barChart.js';
    import {getPieChart} from '../../chart/pieChart.js';
    import {getPolarChart} from '../../chart/polarChart.js';

    export default {
        name: 'event-graph',
        props: {
            // 所有指标对象
            measures: Array,
            // 所有指标名称
            measureNames: Array,
            byFields: Array,
            // 图表类型
            chartType: String,
            // 选中的指标和分组
            measureKeys: Object,
            seriesKeys: Array,
            originalTime: String,
            compareTime: String,
            pieSlice: ''
        },
        data() {
            return {
                //图表的数据
                graphData: [],
                // 各类图形的div
                lineChart: null,
                barChart: null,
                pieChart: [],
                activePieIndex: 0,
                mapUnonlyProvince: false,
                selectedSeries: [],
                //选中的分组列表(id,name)
                seriesKeysArr: [],
            };
        },
        computed: {
            comparing() {
                return this.graphData.length > 1;
            },
            // 显示指标可选列表
            measureOptions() {
                // 指标的序号作为选中了哪些指标的标识
                return this.measures
                    .map((measure, index) => ({
                        id: index,
                        name: this.getMeasureName(index)
                    }));
            },
            selectedMeasureKeys() {
                return this.measureKeys.left.concat(this.measureKeys.right);
            },
            pieChartCounts() {
                return this.selectedMeasures.length * (this.comparing ? 2 : 1);
            },
            // 选中的指标列表（id,name）
            selectedMeasures() {
                return this.selectedMeasureKeys
                    .map(key => this.measureOptions.find(measure => measure.id === key))
                    .filter(measure => measure);
            },
            // 已选择的指标中，第几个指标是百分比
            percentMeasureIndices() {
                const indices = [];
                this.selectedMeasureKeys
                    .forEach((indexOfMeasures, indexOfSelectedOnes) => {
                        // '2p' stands for 百分比
                        if (this.measures[indexOfMeasures].format === '2p') {
                            indices.push(indexOfSelectedOnes);
                        }
                    });
                return indices;
            },
            // 显示分组可选列表
            series() {
                const zeroByFields = this.graphData[0].byFields.length === 0;
                const dataRows = ((this.chartType === 'pie' || this.chartType === 'map' || this.chartType === 'ring') ? this.graphData[0].rollupRows : this.graphData[0].rows) || [];
                const options = dataRows
                    .map((item, index) => ({
                        id: index,
                        name: (zeroByFields || item.byValues.length === 0) ? this.$t('board.overall') : item.byValues.join(','),
                    }));
                if (options.length === 0) options.push({name: this.$t('board.overall'), id: 0});
                return options;
            },
        },
        methods: {
            getMeasureName(measureIndex) {
                if (this.measureNames) {
                    return this.measureNames[measureIndex];
                }
                if (this.measures === null || this.measures === undefined) return '';
                if (this.measures[0].attrName === '用户数') {
                    return this.$t('board.userNo');
                }
                let item = AGGREATOR_OPTIONS_MAP[1];
                let target = item.filter(dom => {
                    if (dom.id === this.measures[0].aggreator) {
                        return dom.name;
                    }
                });
                return `${this.measures[0].attrName}的${target[0].name}`;
            },
            setData(data) {
                this.graphData = data;
                // 地图类型选择的数据不含'省'或不仅含'省'时不画图
                if (this.chartType === 'map') {
                    WebServAttrApiV1.getAttributes({attrType: 0}).then(({body: {data: {attributeList}}}) => {
                        if (this.byFields.length !== 1) {
                            this.mapUnonlyProvince = true;
                            return;
                        }
                        let i = 0;
                        for (i; i < attributeList.length; i++) {
                            let element = attributeList[i];
                            if (element.id === this.byFields[0].id && element.meaning === '省') {
                                break;
                            }
                        }
                        if (i === attributeList.length) {
                            this.mapUnonlyProvince = true;
                            return;
                        }
                        // else {
                        //     this.draw();
                        // }
                        // else {
                        //     this.draw();
                        // }
                        this.draw();
                    });
                } else {
                    // 外部数据传入，画图
                    this.draw();
                }
            },
            // 根据数据、显示指标、显示分组，生成饼图的标题，series
            handlePieData() {
                let serieses = this.series;
                let seriesks = this.seriesKeysArr;
                let wsortData = this.graphData[0].rollupRows;
                let ser = this.measureKeys.left[0];
                if (this.pieSlice) {
                    let arr = [];
                    for (let i = 0; i < this.pieSlice; i++) {
                        arr.push(i);
                    }
                    this.seriesks = arr;
                    if (wsortData[0].value) {
                        wsortData.sort(function (a, b) {
                            return b.value - a.value;
                        });
                    } else {
                        wsortData.sort(function (a, b) {
                            return b.values[0][ser][0] - a.values[0][ser][0];
                        });
                    }
                }
                let seriesList = [], names = [];
                this.selectedMeasures
                    .forEach((measureOption, measureIndex) => {
                        let series = [], restSum = 0;
                        // 饼图的标题
                        names.push((this.comparing ? (this.originalTime + ' ') : '') + measureOption.name);
                        serieses
                            .forEach(_series => {
                                const source = wsortData[_series.id];
                                const value = source.values
                                    ? (source.values[0][measureIndex] ? source.values[0][measureOption.id][0] : '')
                                    : source.value;
                                if (seriesks.includes(_series.id)) {
                                    series.push({
                                        name: source.byValues.join(',') || this.$t('board.overall'),
                                        value
                                    });
                                } else {
                                    restSum += Number(value || 0);
                                }
                            });
                        // '其他'的值不为0
                        if (0 !== restSum) {
                            series.push({name: series.length === 0 ? this.$t('board.overall') : this.$t('board.others'), value: restSum});
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
                                    if (this.seriesKeysArr.includes(_series.id)) {
                                        compareSeries.push({
                                            name: source.byValues.join(',') || this.$t('board.overall'),
                                            value
                                        });
                                    } else {
                                        restSum += Number(value || 0);
                                    }
                                });
                            // '其他'的值不为0
                            if (0 !== restSum) {
                                compareSeries.push({name: compareSeries.length === 0 ? this.$t('board.overall') : this.$t('board.others'), value: restSum});
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
                            .forEach(_series => {
                                // 从总数据记录中取出当前分组、指标对应的数据
                                const source = this.graphData[0].rows[_series.id];
                                const data = source.values.map(value => {
                                    if (value[measureIndex] !== undefined) {
                                        return value[measureIndex][0];
                                    }
                                });
                                const name = (source.byValues.join(',') || this.$t('board.overall')) + '-' + measureOption.name;
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
                                    let name1 = this.$t('board.comparison') + name;
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
                            .forEach(_series => {
                                // 从总数据记录中取出当前分组、指标对应的数据
                                const source = this.graphData[0].rows[_series.id];
                                const data = source.values.map(value => {
                                    if (value[measureIndex] !== undefined) {
                                        return value[measureIndex][0];
                                    }
                                });
                                const name = (source.byValues.join(',') || this.$t('board.overall')) + '-' + measureOption.name;
                                // 拼装legend
                                legend.push({name});
                                // 拼装series
                                series.push({
                                    name,
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
                                    let name1 = this.$t('board.comparison') + name;
                                    // 拼装legend
                                    legend.push({name: name1});
                                    // 拼装series
                                    series.push({
                                        name: name1,
                                        type: 'bar',
                                        data: data1,
                                        smooth: false,
                                        yAxisIndex,
                                        stack: measureOption.name + this.$t('board.compare')
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
                        this.series
                            .forEach(_series => {
                                const source = this.graphData[0].rollupRows[_series.id];
                                const value = source.values
                                    ? (source.values[0][measureIndex] ? source.values[0][measureOption.id][0] : '')
                                    : source.value;
                                if (this.seriesKeysArr.includes(_series.id)) {
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
                            series.push({name: series.length === 0 ? this.$t('board.overall') : this.$t('board.others'), value: restSum});
                        }
                        seriesList.push(series);

                        // // 对比时间
                        // if (this.comparing) {
                        //     // 对比饼图的标题
                        //     names.push(this.compareTime + ' ' + measureOption.name);
                        //     restSum = 0;
                        //     let compareSeries = [];
                        //     this.series
                        //         .forEach(_series => {
                        //             // 对比饼图的标题
                        //             const source = this.graphData[1].rollupRows[_series.id];
                        //             const value = source.values
                        //                 ? (source.values[0][measureIndex] ? source.values[0][measureOption.id][0] : '')
                        //                 : source.value;
                        //             if (this.seriesKeysArr.includes(_series.id)) {
                        //                 compareSeries.push({
                        //                     name: source.byValues.join(','),
                        //                     value
                        //                 });
                        //             } else {
                        //                 restSum += Number(value || 0);
                        //             }
                        //         });
                        //     // '其他'的值不为0
                        //     if (0 !== restSum) {
                        //         compareSeries.push({name: compareSeries.length === 0 ? '总体' : '其他', value: restSum});
                        //     }
                        //     seriesList.push(compareSeries);
                        // }
                    });
                // 格式化省份名称, 传递要显示的 data 数据
                seriesList[0].forEach(element => {
                    if (element.name.split(',')[0]) {
                        // 未知, 总数, 其他 没有省份名称,也要排除在外
                        element.name = element.name === this.$t('board.others') ? '' : element.name.split(',')[0].substring(0, 3);
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
                            roam: 'scale',
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
                let gR = Math.round(sR + (eR - sR) * p).toString(16),
                    gG = Math.round(sG + (eG - sG) * p).toString(16),
                    gB = Math.round(sB + (eB - sB) * p).toString(16);
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
                            if (this.seriesKeysArr.includes(_series.id)) {
                                series.push({
                                    type: 'bar',
                                    data,
                                    name: source.byValues.join(',') || (series.length === 0 ? this.$t('board.overall') : this.$t('board.others')),
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
                                let name1 = this.$t('board.comparison') + name;
                                // 拼装legend
                                legend.push({name: name1});
                                // 拼装series
                                series.push({
                                    name: name1,
                                    type: 'bar',
                                    data: data1,
                                    smooth: false,
                                    // yAxisIndex,
                                    stack: item.name + this.$t('board.compare')
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
            draw() {
                // 没有数据，退出画图
                if (this.graphData[0].rows.length === 0) {
                    this.clearChart();
                    return;
                }
                if (this.seriesKeys.length === 0) {
                    return;
                }
                this.seriesKeysArr = this.seriesKeys;
                this.selectedSeries = this.seriesKeysArr
                    .map(key => this.series[key])
                    .filter(series => !!series);
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
                    let series, legend, percentIndices, names,
                        tooltip, visualMap, yAxis, xAxis;
                    switch (this.chartType) {
                        case 'line':
                            ({series, legend, percentIndices} = this.handleLineData());
                            this.lineChart = echarts.getInstanceByDom(this.$refs.eventChartRef)
                                || echarts.init(this.$refs.eventChartRef);
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
                            break;
                        case 'bar':
                            ({series, legend, percentIndices} = this.handleBarData());
                            this.barChart = echarts.getInstanceByDom(this.$refs.eventChartRef)
                                || echarts.init(this.$refs.eventChartRef);
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
                            break;
                        case 'ring': {
                            let {seriesList, names} = this.handlePieData();
                            // 存在 pieCharts,画饼图
                            this.ringChart = seriesList.map((series, index) => {
                                let ringChart = echarts.getInstanceByDom(this.$refs.ringCharts[index])
                                    || echarts.init(this.$refs.ringCharts[index]);
                                let measureIndex;
                                if (this.graphData.length > 1) {
                                    measureIndex = this.selectedMeasures[index]
                                        ? this.selectedMeasures[index].id
                                        : this.selectedMeasures[index - seriesList.length / 2].id;
                                } else {
                                    measureIndex = this.selectedMeasures[index].id;
                                }
                                let percent = this.measures[measureIndex].format === '2p';
                                ringChart.setOption(getPieChart(series, names[index], percent), true);
                                return ringChart;
                            });

                            this.activePieIndex = 0;
                            // 当增加或减少饼图的时候resize
                            this.resize();
                            break;
                        }
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
                        case 'pie': {
                            let {seriesList, names} = this.handlePieData();
                            // 存在 pieCharts,画饼图
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
                                let percent = this.measures[measureIndex].format === '2p';
                                let option = getPieChart(series, names[index], percent);
                                option.series.radius = '55%';
                                pieChart.setOption(option, true);
                                return pieChart;
                            });

                            this.activePieIndex = 0;
                            // 当增加或减少饼图的时候resize
                            this.resize();
                            break;
                        }
                        case 'polar':
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
                        case 'reportChart': //表格
                            break;
                        default:
                            console.error('数据概览：绘图时遇到了无法处理的类型：' + this.chartType);
                    }
                });
            },
            // 画布的自适应宽度
            resize() {
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
                        this.ringChart.forEach(item => {
                            item.resize();
                        });
                        break;
                    case 'pie':
                        this.pieChart.forEach(item => {
                            item.resize();
                        });
                        break;
                    case 'map':
                        if (this.mapChart) {
                            this.mapChart.resize();
                        }
                        break;
                    case 'polar':
                        if (this.polarChart) {
                            this.polarChart.resize();
                        }
                        break;
                }
            },
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
                        this.pieChart.forEach(item => {
                            item.clear();
                        });
                        break;
                    case 'map':
                        if (this.mapChart) {
                            this.mapChart.clear();
                        }
                        break;
                    case 'pie':
                        if (this.pieChart) {
                            this.pieChart.forEach(item => {
                                item.clear();
                            });
                        }
                        break;
                    case 'polar':
                        if (this.polarChart) {
                            this.polarChart.clear();
                        }
                        break;
                }
            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .board-chart-graph {
        position: relative;
        height: 100%;

        .graph-header {
            position: absolute;
            z-index: 1;
            top: -61px;
            right: 0;

            .previous-pie-btn,
            .next-pie-btn {
                width: $input-field-height;
                height: $input-field-height;
                padding: 0;
                line-height: $input-field-height - 2px;
                vertical-align: middle;
                font-size: 20px;
                text-align: center;
                border: 1px solid $border-color;
                border-radius: 3px;
                @include transition();
                @include appearance(none);
                background-color: white;

                &:not([disabled]) {
                    color: $theme;
                    cursor: pointer;

                    &:hover {
                        border: 1px solid currentColor;
                    }

                    &:active {
                        color: $dark-blue;
                    }
                }

                &[disabled] {
                    cursor: not-allowed;
                    color: $disabled;
                }
            }
        }

        .chart,
        .chart-box {
            position: relative;
            height: 100%;
            &.invalid {
                display: -webkit-flex;
                display: flex;
                -webkit-justify-content: center;
                justify-content: center;
                -webkit-align-items: center;
                align-items: center;
                &:after {
                    content: attr(data-invalid);
                }
            }
        }

        .pie {
            height: 100%;
            background-color: white;

            &.many {
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                width: 100%;
                z-index: -1;
            }

            &.active {
                z-index: auto;
            }
        }
    }
</style>
