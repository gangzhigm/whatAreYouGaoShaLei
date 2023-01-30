/**
 * 属性分析-极坐标图
 */
import {colors, grid, legend, polar, polarAngleAxis, polarRadiusAxis, polarTooltip} from './chartConfig.js';

/**
 * @param xAxisData
 * @param series
 * @param names
 * @returns {{grid: {top: string, left: string, right: string, bottom: string, containLabel: boolean}, color, tooltip, angleAxis: *, radiusAxis, polar, series: *, legend: {} & {formatter: *} & {type: string, bottom: number, padding: number[], formatter: function(*): string, data, selectedMode: string, inactiveColor: string}}}
 */
export function getPolarChart(xAxisData, series, names) {
    return {
        grid,
        color: colors,
        tooltip: polarTooltip,
        angleAxis: Object.assign({}, {data: xAxisData}, polarAngleAxis),
        radiusAxis: polarRadiusAxis,
        polar,
        dataZoom: [
            {
                type: 'inside',
                zoomOnMouseWheel: 'alt'
            }
        ],
        series,
        legend: Object.assign({}, {formatter: names}, legend),
    };
}
