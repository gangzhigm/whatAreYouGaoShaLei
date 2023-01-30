/**
 * 可视化报告-极坐标图
 */
import {colors, legend, grid, polarTooltip, polarAngleAxis, polarRadiusAxis, polar} from '../../chart/chartConfig.js';

/**
 * @param data
 * @returns {{grid: {top: string, left: string, right: string, bottom: string, containLabel: boolean}, color, tooltip, angleAxis: *, radiusAxis, polar, series: Array, legend: {} & {data: Array} & {type: string, bottom: number, padding: number[], formatter: function(*): string, data, selectedMode: string, inactiveColor: string}}}
 */
export function getPolarChart(data) {
    let actualData = [],// echarts 要用的数据
        dataGroup = [],
        actualDataGroup = [];

    data.forEach(d => {
        if (data[0].length > 2) {
            actualData.push({x: d[0], group: d[1], y: d[d.length - 1]});
            // 数据分组
            dataGroup = actualData.map(actual => {
                if (actual.group) {
                    return actual.group;
                }
            });
            actualDataGroup = Array.from(new Set(dataGroup));
        } else {
            actualData.push({x: d[0], y: d[d.length - 1]});
        }
    });

    // x轴
    let angleAxisData = actualData.map(actual => actual.x);
    angleAxisData = Array.from(new Set(angleAxisData));

    // 存在数据分组： 数据分组遍历，x轴遍历，拿到 分组下的周几x轴的数据
    let series = [];
    actualDataGroup.forEach(group => {
        let seriesData = [];
        actualData.forEach(data => {
            if (data.group === group) {
                seriesData.push(data.y);
            }
        });
        series.push({
            type: 'bar',
            data: seriesData,
            coordinateSystem: 'polar',
            name: group,
            stack: 'stack',   // 有数据分组才堆叠
        });
    });

    // 不存在数据分组：name = ''，不堆叠
    if (dataGroup.length <= 0) {
        let seriesData = actualData.map(data => data.y);
        let group = '';
        series.push({
            type: 'bar',
            data: seriesData,
            coordinateSystem: 'polar',
            name: group,
            stack: null,
        });
    }

    return {
        grid,
        color: colors,
        tooltip: polarTooltip,
        angleAxis: Object.assign({}, {data: angleAxisData}, polarAngleAxis),
        radiusAxis: polarRadiusAxis,
        polar,
        series,
        legend: Object.assign({}, {data: actualDataGroup}, legend),
    };
}
