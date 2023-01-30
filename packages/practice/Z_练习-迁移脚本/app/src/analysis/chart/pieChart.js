import {breakIntoLines, colors, getPieSeries, grid, legend, pieSum, trimLongText} from './chartConfig';
import { translate } from '@/locales';

/**
 * 饼图
 * @param series
 * @param indexName
 * @param percent
 * @returns {{color, title: {text: *, left: string, bottom: number, textStyle: {fontSize: number}}, tooltip: {trigger: string, formatter: function(*): string}, legend: {type: string, bottom: number, padding: number[], formatter: function(*): string, data, selectedMode: string, inactiveColor: string}, grid: {top: string, left: string, right: string, bottom: string, containLabel: boolean}, series: {name: *, type: string, radius: string, center: string[], data: *, itemStyle: {emphasis: {shadowBlur: number, shadowOffsetX: number, shadowColor: string}}}}}
 */
export function getPieChart(series, indexName, percent) {
    // 根据饼图数据 series 各个数值占比，调整label的展示
    const sum = pieSum(series);
    const limit = sum * 0.05;   // 总和的 5% 阈值
    const seriesDatum = series.map(seriesData => {
        // 占总和百分比小于 5% 的数据，默认不显示 label，鼠标 hover 时在环形图中心展示 label
        return Object.assign(
            {
                label: (seriesData.value < limit
                    ? {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: true,
                            color: '#000',
                            formatter: function (params) {
                                let valueStr = percent ? (params.value + '%') : params.value;
                                return `${breakIntoLines(indexName)}\n${trimLongText(params.name, 10)}\n${valueStr}\n(${translate('eventAnalysis.occupy')} ${params.percent}%)`;
                            }
                        }
                    }
                    : {
                        normal: {
                            formatter: function (params) {
                                let valueStr = percent ? (params.value + '%') : params.value;
                                return `${params.name}: ${valueStr}(${translate('eventAnalysis.occupy')} ${params.percent}%)`;
                            }
                        }
                    })
            },
            seriesData);
    });

    //只有一条信息时，name显示总体
    if (seriesDatum.length === 1) {
        if (seriesDatum[0].name === '') {
            seriesDatum[0].name = translate('eventAnalysis.total');
        }
    }
    return {
        color: colors,
        title: {
            text: breakIntoLines(indexName),
            left: 'center',
            bottom: 30,
            textStyle: {
                fontSize: 14
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: function (value) {
                let valueStr = percent ? (value.value + '%') : value.value;
                return `${breakIntoLines(indexName)}<br>${breakIntoLines(value.name)}<br>${valueStr}<br>(${translate('eventAnalysis.occupy')}${value.percent}%)`;
            },
        },
        legend,
        grid,
        series: getPieSeries(indexName, ['35%', '50%'], seriesDatum),
    };
}
