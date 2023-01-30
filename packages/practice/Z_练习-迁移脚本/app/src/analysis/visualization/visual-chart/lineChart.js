// 线图
import {colors, dataZoom, legend, getXAxis, getYAxis,} from '../../chart/chartConfig.js';

/**
 * 画线图
 * @param chartType  //数据类型:line/arealine
 * @param xName   //x轴显示名字
 * @param yName   //y轴显示名字
 * @param data
 * @returns {{tooltip: {trigger: string}, color, xAxis: {show: boolean, type: string, data: *, axisTick: {alignWithLabel: boolean, show: boolean}}, legend: {} & {data: Array} & {type: string, bottom: number, padding: number[], formatter: function(*): string, data, selectedMode: string, inactiveColor: string}, yAxis: *, dataZoom: *[], series: Array}}
 */
export function getLineChart(chartType, xName, yName, data) {
    let xAxis = [], series = [], seriesData = [], legendData = [];
    //线图
    if (chartType === 'line') {
        // 只有X轴Y轴
        if (data[0].length === 2) {
            handleDataBase('line');
        } else { //存在数据分组
            handleData('line');
        }
    } else { //面积图
        // 只有X轴Y轴
        if (data[0].length === 2) {
            handleDataBase('arealine');
        } else { //存在数据分组
            handleData('arealine');
        }
    }

    // 数组去重
    function unique(data) {
        return Array.from(new Set(data));
    }

    // 只有X轴Y轴时的数据处理
    function handleDataBase(type) {
        data.map(item => {
            xAxis.push(item[0]);
            series.push(parseInt(item[1]));
        });
        if (type === 'line') {
            seriesData.push({data: series, type: 'line'});
        } else {
            seriesData.push({data: series, type: 'line', areaStyle: {}});
        }
    }

    // 有数据分组时的数据处理
    function handleData(type) {
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
            if (type === 'line') {
                seriesData.push({name: legend, type: 'line', data: series});
            } else {
                seriesData.push({name: legend, type: 'line', data: series, areaStyle: {normal: {}}});
            }
        });
    }

    return {
        tooltip: {
            trigger: 'axis',
        },
        color: colors,
        xAxis: getXAxis(xName, xAxis),
        legend: Object.assign({}, {data: legendData}, legend),
        yAxis: getYAxis(yName),
        dataZoom,
        series: seriesData,
    };
}