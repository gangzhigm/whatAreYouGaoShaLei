// 柱图
import {colors, dataZoom, dataZoomCross,legend, LINE_TYPES, LINE_STYLE, getXAxis} from '../../chart/chartConfig.js';
//translate
import {translate} from '@/locales';

/**
 * 画柱图
 * @param chartType     数据类型:line/arealine
 * @param xName         x轴显示名字
 * @param yNameLeft     y轴左侧显示名字
 * @param yNameRight    y轴右侧显示名字
 * @param legendData    有数据分组时的显示
 * @param groupKeyYRight    右侧Y轴
 * @param groupKeyData      数据分组
 * @param data
 * @returns {*}
 */
export function getBarChart(chartType, xName, yNameLeft, yNameRight, groupKeyYRight, groupKeyData, data) {
    // 公共方法开始----start
    let xAxis = [], series = [], seriesRight = [], seriesData = [], legendData = [],
        yAxis = [
            {
                type: 'value',
                'name': '',
                axisTick: {show: false},
                axisLine: {show: false},
                splitLine: {lineStyle: {type: LINE_TYPES[2]}},
                axisLabel: {textStyle: {color: LINE_STYLE}},
                nameTextStyle: {color: LINE_STYLE}
            },
            {
                type: 'value',
                'name': '',
                axisTick: {show: false},
                axisLine: {show: false},
                splitLine: {lineStyle: {type: LINE_TYPES[2]}},
                axisLabel: {textStyle: {color: LINE_STYLE}},
                nameTextStyle: {color: LINE_STYLE}
            }];

    // 数组去重
    function unique(data) {
        return Array.from(new Set(data));
    }

    // 只有X轴Y轴时的数据处理
    function handleDataBase() {
        data.map(item => {
            xAxis.push(item[0]);
            series.push(parseInt(item[1]));
        });
        seriesData.push({data: series, type: 'bar'});
        yAxis[0].name = yNameLeft;
    }

    // X轴  左侧Y轴 右侧Y轴
    function handleDataXY(type) {
        data.map(item => {
            xAxis.push(item[0]);
            series.push(parseInt(item[1]));
            seriesRight.push(parseInt(item[2]));
        });
        xAxis = unique(xAxis);
        // Y轴显示名字
        yAxis[0].name = yNameLeft;
        yAxis[1].name = yNameRight;
        if (type === 'bar') {
            // Y轴数据
            seriesData.push({name: yNameLeft, data: series, type: 'bar'}, {
                name: yNameRight,
                data: seriesRight,
                type: 'line',
                yAxisIndex: 1
            });
        } else if (type === 'cross') {
            // Y轴数据
            seriesData.push({name: yNameLeft, data: series, type: 'bar', stack: 'yy',}, {
                name: yNameRight,
                data: seriesRight,
                type: 'bar',
                stack: 'xx',
            });
        }
        legendData.push(yNameLeft, yNameRight);

    }

    // 有数据分组时的数据处理
    function handleData(type) {
        // 没有右侧Y轴
        data.map(item => {
            xAxis.push(item[0]);
            legendData.push(item[1]);
        });
        legendData = unique(legendData);
        xAxis = unique(xAxis);
        legendData.map(legend => {
            series = [];
            data.map(item => {
                if (item[1] === legend) {
                    series.push(item[2]);
                }
            });
            seriesData.push({name: legend, type: 'bar', data: series, stack: translate('visualization.totalAmount')});
        });
        yAxis[0].name = yNameLeft;
        // 有右侧Y轴
        if (type === 'bar' && groupKeyYRight > 0) {
            legendData.map(legend => {
                seriesRight = [];
                data.map(item => {
                    if (item[1] === legend) {
                        seriesRight.push(item[3]);
                    }
                });
                seriesData.push({name: legend, type: 'line', data: seriesRight});
            });
            yAxis[1].name = yNameRight;
        } else if (type === 'cross' && groupKeyYRight > 0) {
            legendData.map(legend => {
                seriesRight = [];
                data.map(item => {
                    if (item[1] === legend) {
                        seriesRight.push(item[3]);
                    }
                });
                seriesData.push({name: legend, type: 'bar', data: seriesRight, stack: 'yy'});
            });
            yAxis[1].name = yNameRight;
        }
    }

    // 公共方法结束----end

    let tooltip = {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            crossStyle: {
                color: '#999'
            }
        }
    };
    if (chartType === 'bar' || chartType === 'pm') {
        // 只有X轴与左侧Y轴
        if (data[0].length === 2) {
            handleDataBase();
        } else if (groupKeyYRight > 0 && data[0].length === 3) { //存在右侧Y轴，且没有数据分组
            handleDataXY(chartType);
        } else { //存在数据分组
            handleData(chartType);
        }
        return {
            color: colors,
            tooltip,
            legend: Object.assign({}, {data: legendData}, legend),
            xAxis: getXAxis(xName, xAxis),
            yAxis,
            dataZoom: dataZoom,
            series: seriesData
        };
    } else if (chartType === 'cross') {
        // 只有X轴与左侧Y轴
        if (data[0].length === 2) {
            handleDataBase();
        } else if (groupKeyYRight > 0 && data[0].length === 3) { //存在右侧Y轴，不存在数据分组
            handleDataXY('cross');
        } else if (groupKeyData > 0) { //存在数据分组
            handleData('cross');
        }
        return {
            color: colors,
            tooltip,
            legend: Object.assign({}, {data: legendData}, legend),
            yAxis: getXAxis(xName, xAxis),
            xAxis: yAxis,
            dataZoom: dataZoomCross,
            series: seriesData
        };
    }
}
