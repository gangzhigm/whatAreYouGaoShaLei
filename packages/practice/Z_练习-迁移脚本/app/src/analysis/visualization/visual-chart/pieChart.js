import {colors, grid, legend, getPieSeries} from '../../chart/chartConfig.js';
import {translate} from '@/locales';
/**
 * 饼图
 * @param data      表格类型的数据
 * @param slice     最大切片数
 * @param bookmarkName 标题名字
 * @returns {{color, tooltip: {trigger: string, formatter: string}, legend: {} & {data: any[]} & {type: string, bottom: number, padding: number[], formatter: function(*): string, data, selectedMode: string, inactiveColor: string}, grid: {top: string, left: string, right: string, bottom: string, containLabel: boolean}, series: {name: *, type: string, radius: string, center: string[], data: *, itemStyle: {emphasis: {shadowBlur: number, shadowOffsetX: number, shadowColor: string}}}}}
 */
export function getPieChart(data, slice, bookmarkName) {
    let actualData = []; // echarts 要用的数据
    let otherData = [];  //其他
    let otherValue = 0;  //其他的总值
    data.forEach(d => {
        actualData.push({name: d[0], value: parseInt(d[1])});
    });
    if (slice && slice > 0 && slice <= data.length - 1) {
        otherData = actualData.slice(slice);
        otherValue = otherData.reduce((acc, data) => acc + parseInt(data.value), 0);
        actualData.splice(slice);
        actualData.push({name: translate('eventAnalysis.other'), value: otherValue});
    }
    return {
        color: colors,
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: Object.assign({}, {data: actualData.map(actual => actual.name)}, legend),
        grid,
        series: getPieSeries(bookmarkName, '55%', actualData),
    };
}
