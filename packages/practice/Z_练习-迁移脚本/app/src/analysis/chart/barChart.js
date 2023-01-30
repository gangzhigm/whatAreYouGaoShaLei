// 柱图
import {colors, dataZoom, getYAxis, grid, legend, tooltipItemFactory, trimLongText, getXAxis} from './chartConfig';
//translate
import { translate } from '@/locales';
/**
 *
 * @param leftCount     左侧指标个数
 * @param rightCount    右侧指标个数
 * @param XAxisData
 * @param series
 * @param legendData
 * @param percentIndices
 * @returns {{color, tooltip: {trigger: string, formatter: tooltip.formatter}, legend: {data: *} & {type: string, bottom: number, padding: number[], formatter: function(*): string, data, selectedMode: string, inactiveColor: string}, grid: {top: string, leftCount: string, rightCount: string, bottom: string, containLabel: boolean}, xAxis: {show: boolean, type: string, data: *, axisTick: {alignWithLabel: boolean, show: boolean}}, yAxis: *, dataZoom: *[], series: *}}
 */
export function getBarChart(leftCount, rightCount, XAxisData, series, legendData, percentIndices = []) {
    let yAxis = getYAxis('', leftCount, rightCount);
    XAxisData = XAxisData && XAxisData.length ? XAxisData : [translate('eventAnalysis.total')];
    return {
        color: colors,
        tooltip: {
            trigger: 'axis',
            formatter: function (value) {
                let timeList = value[0].axisValue.split('/');
                /**
                 * arr           普通
                 * arrCompare    对比时间
                 */
                let arr = [],
                    arrCompare = [];
                value.forEach(item => {
                    if (item.seriesName.includes('对比')) {
                        arrCompare.push({
                            time: timeList[1],
                            name: item.seriesName,
                            value: item.value,
                            color: item.color
                        });
                    } else {
                        arr.push({
                            time: timeList[0],
                            name: item.seriesName,
                            value: item.value,
                            color: item.color
                        });
                    }
                });
                let result = '';
                if (timeList.length > 1) {
                    arr.forEach((item, index) => {
                        if (index === 0) {
                            result = item.time;
                        }
                        let value = item.value + (percentIndices.includes(index) ? '%' : '');
                        result += `<br>${tooltipItemFactory(item.color)}${trimLongText(item.name)}:${trimLongText(value)}`;
                    });
                    arrCompare.forEach((item, index) => {
                        if (index === 0) {
                            result += '<br>' + item.time + ' ( 对比时间 )';
                        }
                        let value = item.value + (percentIndices.includes(index) ? '%' : '');
                        result += `<br>${tooltipItemFactory(item.color)}${trimLongText(arr[index].name)}:${trimLongText(value)}`;
                    });
                    return result;
                }
                arr.forEach((item, index) => {
                    if (index === 0) {
                        result = item.time;
                    }
                    let value = item.value + (percentIndices.includes(index) ? '%' : '');
                    result += `<br>${tooltipItemFactory(item.color)}${trimLongText(arr[index].name)}:${trimLongText(value)}`;
                });
                return result;
            },
        },
        legend: Object.assign({data: legendData}, legend),
        grid,
        xAxis: getXAxis('', XAxisData),
        yAxis,
        dataZoom,
        series,
    };
}
