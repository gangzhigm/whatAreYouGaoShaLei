import { translate as t } from '@/locales';

// 颜色设置
export const colors = [
    '#29bdfb', '#0cc2a9', '#f26565', '#ff9023', '#826dee', '#ffd71e', '#64d84d', '#e257a2', '#4934e8', '#969696',
    '#2e78dc', '#0d828d', '#9b643c', '#91775d', '#515181', '#b4a14b', '#6da17d', '#925390', '#7a8ce7', '#393939',
    '#6ecae1', '#96b3b2', '#cc9c8e', '#e4ba68', '#a58cd3', '#c2b994', '#85d983', '#f0a5ed', '#475883', '#c3d18d',
];

// 线图
export const LINETYPELIST = [
    // solid
    'M545,821h9v2h-9v-2Zm9,0h10v2H554v-2Z',
    // dotted
    'M545,831h1v2h-1v-2Zm3,0h1v2h-1v-2Zm3,0h1v2h-1v-2Zm3,0h1v2h-1v-2Zm3,0h1v2h-1v-2Zm3,0h1v2h-1v-2Zm3,0h1v2h-1v-2Z',
    // dashed
    'M545,826h5v2h-5v-2Zm7,0h5v2h-5v-2Zm7,0h5v2h-5v-2Z',
];

// line_type
export const LINE_TYPES = ['solid', 'dashed', 'dotted'];

// line_style
export const LINE_STYLE = '#8c8c8c';

// polar配置  start---
export const polarTooltip = {
    show: true,
    confine: true,
    formatter: '{b} <br/> {a} : {c}'
};

export const polarAngleAxis = {
    type: 'category',
    axisLine: {
        lineStyle: {
            color: LINE_STYLE,
        }
    },
    z: 10
};

export const polarRadiusAxis = {
    axisLine: {
        lineStyle: {
            color: LINE_STYLE,
        }
    },
    axisLabel: {
        show: true,
        color: '#333',
    },
    z: 20,
};

export const polar = {
    z: 2,
    radius: '55%',
};
// polar配置  end---

// 最大字符数
const MAX_CHARS = 20;

//图表标题使用
export const AGGREATOR_OPTIONS_MAP = {
    1: [
        {id: 'uniqCount', name: t('eventAnalysis.deduplication')},
        {id: 'count', name: t('eventAnalysis.count')},
        {id: 'sum', name: t('eventAnalysis.allValue')},
        {id: 'max', name: t('eventAnalysis.maxValue')},
        {id: 'min', name: t('eventAnalysis.minValue')},
        {id: 'avg', name: t('eventAnalysis.averageValue')}
    ],
    2: [
        {id: 'uniqCount', name: t('eventAnalysis.deduplication')},
        {id: 'count', name: t('eventAnalysis.count')}
    ]
};

/**
 * 图表的legend
 * @type {{type: string, bottom: number, padding: number[], formatter: (function(*): string), data, selectedMode: string, inactiveColor: string}}
 */
export const legend = {
    show: true,
    type: 'scroll',
    top: 0,
    padding: [0, 50],
    textStyle: {
        padding: 5
    },
    formatter: legendNameFormatter,
    // selectedMode:控制是否可以通过点击图例改变系列的显示状态。multiple:多选模式
    selectedMode: 'multiple',
    // 图例关闭时的颜色。default:#ccc
    inactiveColor: '#ccc',
    pageFormatter: '',
    pageButtonItemGap: -5,
};

/**
 * 图表的grid
 * @type {{top: string, left: string, right: string, bottom: string, containLabel: boolean}}
 */
export const grid = {
    top: 40,
    left: 32,
    right: 32,
    bottom: 40,
    containLabel: true,
};

/**
 * 图表的dataZoom （线图，柱图（除横向柱图之外））
 * @type {*[]}
 */
export const dataZoom = [
    {
        show: true,
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: 100,
        zoomOnMouseWheel: 'alt'
    }
];

/**
 * 图表的dataZoom （横向柱图）
 * @type {*[]}
 */
export const dataZoomCross = [
    {
        show: true,
        type: 'inside',
        yAxisIndex: [0],
        start: 0,
        end: 100,
        zoomOnMouseWheel: 'alt'
    }
];

/**
 * 图表的X轴
 * @param xName         name
 * @param XAxisData     x轴的数据
 * @return {{show: boolean, type: string, data: *, axisTick: {alignWithLabel: boolean, show: boolean}}}
 */
export function getXAxis(xName, XAxisData) {
    return {
        show: true,
        name: xName,
        nameGap: 5,
        nameRotate: 60,
        type: 'category',
        data: XAxisData,
        axisTick: {
            alignWithLabel: true,
            show: false,
        },
        axisLine: {
            lineStyle: {
                color: LINE_STYLE
            }
        },
        nameTextStyle: {
            color: LINE_STYLE
        }
    };
}

/**
 * 生成Y轴，
 * @param yName         y轴名称
 * @param leftCount     左侧指标个数
 * @param rightCount    右侧指标个数
 * @returns {*}
 */
export function getYAxis(yName, leftCount, rightCount) {
    let yAxis = [];
    let leftYAxis = {};
    let rightYAxis = {};

    let type = 'value',
        axisLine = {
            show: false,
        },
        axisTick = {
            show: false,
        },
        axisLabel = {
            textStyle: {
                color: LINE_STYLE
            },
        },
        nameTextStyle = {
            color: LINE_STYLE,
        },
        splitLineStyle = {
            type: 'dotted',
        };

    let leftConfig = leftCount > 0 && rightCount <= 0;
    let rightConfig = rightCount > 0 && leftCount <= 0;
    let allConfig = leftCount > 0 && rightCount > 0;

    if (leftConfig) {
        // 左侧Y轴
        leftYAxis = {
            type,
            name: yName,
            position: 'left',
            axisLine,
            axisTick,
            axisLabel,
            splitLine: {
                show: true,
                lineStyle: splitLineStyle,
            },
            nameTextStyle,
        };
        return leftYAxis;
    } else if (rightConfig) {
        // 右侧Y轴
        rightYAxis = {
            type,
            name: yName,
            position: 'right',
            axisLine,
            axisTick,
            axisLabel,
            splitLine: {
                show: !leftCount,
                lineStyle: splitLineStyle,
            },
            nameTextStyle,
        };
        return rightYAxis;
    } else if (allConfig) {
        // 左右Y轴
        yAxis.push({
            type,
            name: yName,
            position: 'left',
            axisLine,
            axisTick,
            axisLabel,
            splitLine: {
                show: true,
                lineStyle: splitLineStyle,
            },
            nameTextStyle,
        });
        yAxis.push({
            type,
            name: yName,
            position: 'right',
            axisLine,
            axisTick,
            axisLabel,
            splitLine: {
                show: !leftCount,
                lineStyle: splitLineStyle,
            },
            nameTextStyle,
        });
        return yAxis;
    }
    // 可视化报告
    yAxis.push({
        type,
        name: yName,
        axisLine,
        axisTick,
        axisLabel,
        nameTextStyle,
    });
    return yAxis;
}

/**
 * tooltip 内无序列表的圆点
 * @param color
 * @return {string}
 */
export function tooltipItemFactory(color) {
    return `<span style="display: inline-block;width: 10px;height: 10px;border-radius:100%;margin-right:5px;background: ${color}"></span>`;
}

/**
 * 根据饼图数据 series 各个数值占比，调整label的展示
 * @param series  数据
 * @returns {*}
 */
export function pieSum(series) {
    const sum = series.reduce((acc, seriesData) => {
        return acc + Number(seriesData.value);
    }, 0);
    return sum;
}

/**
 * 饼图的series
 * @param pieName
 * @param radius
 * @param pieSeriesData
 * @returns {{name: *, type: string, radius: string, center: string[], data: *, itemStyle: {emphasis: {shadowBlur: number, shadowOffsetX: number, shadowColor: string}}}}
 */
export function getPieSeries(pieName, radius, pieSeriesData) {
    let series = {
        name: pieName,
        type: 'pie',
        minAngle: 1,
        radius: radius,
        data: pieSeriesData,
        itemStyle: {
            emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        },
        avoidLabelOverlap: false,// 防止标签重叠策略，强制所有标签放到中心
    };
    return series;
}

/**
 * legend name 太长时会溢出，切断 + 换行处理
 * @param name
 * @return {string}
 */
export function legendNameFormatter(name) {
    // name = name.replace(/\s/g, '').replace(/(.{12})/g, '$1\n');
    name = name.replace(/\s/g, '').replace(/(.{12})/g, '$1');
    name = name.length > MAX_CHARS
        ? name.slice(0, MAX_CHARS) + '……'
        : name;
    return name.split(/(.{12})/).filter(str => str)
        .join('\n');
}

/**
 * 截断过长的文本
 * @param text
 * @param {Number} maxLength
 * @return {string}
 */
export function trimLongText(text, maxLength = MAX_CHARS) {
    return text.length > maxLength ? text.slice(0, maxLength) + '……' : text;
}

/**
 * 单行文本截断成多行
 * @param text
 * @return {string}
 */
export function breakIntoLines(text) {
    return text.split(new RegExp(`(.{${MAX_CHARS * 2}})`)).filter(str => str)
        .join('\n');
}
