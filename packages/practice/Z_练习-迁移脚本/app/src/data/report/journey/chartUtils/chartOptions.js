import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/funnel';
import 'echarts/map/js/world';
import 'echarts/map/js/china';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import WORLD_MAP from './WORLD_MAP.json';
import CHINA_MAP from './CHINA_MAP';
import {translate as t} from '@/locales';


const TOP_LEFT_LEGEND = {
    top: '5%',
    icon: 'circle'
};
const GRID = {
    left: '8%',
    right: '8%',
    bottom: '5%',
    containLabel: true
};
const THEME_COLORS = ['#624cbf', '#0cc2a9', '#56de03', '#ff4574', '#0cc2a9'];
const COLOR_MAP = {
    journey: ['#0bb8d8', '#84e1d6', '#6347c2', '#ffa664', '#cccccc'],
    email: ['#0bb8d8', '#84e1d6', '#6347c2', '#ffa664', '#cccccc'],
    // email: ['#624cbf', '#443585', '#9182d2', '#5341a3', '#e0dbf2'],
    sms: ['#0bb8d8', '#84e1d6', '#6347c2', '#ffa664', '#cccccc'],
    mms: ['#0bb8d8', '#84e1d6', '#6347c2', '#ffa664', '#cccccc'],
    // sms: ['#55d4c3', '#3b9488', '#88e1d5', '#48b4a6', '#ddf6f3'],
    wechat: ['#0bb8d8', '#84e1d6', '#6347c2', '#ffa664', '#cccccc'],
    // wechat: ['#56de03', '#3c9b02', '#89e84f', '#49bd03', '#ddf8cd']
    wecom: ['#6347c2', '#0bb8d8', '#84e1d6']
};

const COMPARED_COLORS = ['#0cc2a9', '#6347c2', '#4acaff', '#ffa664'];

/**
 * 折线图
 * @param {Array<Object>} datum [{name: '', value: [x,x,x...]}, {name: '', value: [x,x,x...]}]
 * @param {Array<String>} dates
 * @return {Object}
 */
export function getLineOption(datum, dates) {
    const _dates = dates.map(date =>
        date.replace(/\d{4}-|0(?=\d)/g, '')
            .replace('-', '/')
    );

    return {
        color: COMPARED_COLORS,
        tooltip: {
            textStyle: {
                fontSize: 12
            },
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985',
                    precision: 0
                }
            }
        },
        legend: {
            type: 'scroll',
            data: datum.map(data => data.name)
        },
        grid: GRID,
        xAxis: {
            type: 'category',
            axisLine: {
                lineStyle: {
                    color: '#e0e0e0'
                }
            },
            axisTick: {
                show: true
            },
            axisLabel: {
                textStyle: {
                    color: '#333333'
                }
            },
            // boundaryGap: false,
            data: _dates
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#e0e0e0'
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#333333'
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#eeeeee'
                }
            },
            minInterval: 1,
            splitNumber: 7,
            min: 0
        },
        series: datum.map(data => ({
            name: data.name,
            type: 'line',
            data: data.value
        }))
    };
}

/**
 * 汇总：渠道送达概况
 * 横向柱状图
 * @param {Array} datum [{name: '', value: ''}]
 * @param {Boolean} percentage
 * @param {String} toolTipFormat
 * @return {Object}
 */
export function getBarOption(datum, {percentage = false, toolTipFormat = ''} = {}) {
    return {
        color: THEME_COLORS.slice(0, datum.length).reverse(),
        legend: {
            top: '5%',
            icon: 'circle',
            data: datum.map(data => data.name)
        },
        grid: GRID,
        tooltip: {
            textStyle: {
                fontSize: 12
            },
            trigger: 'item',
            formatter: toolTipFormat.replace('name', 'a').replace('value', 'c'),
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        xAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#e0e0e0'
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#333333'
                },
                formatter: percentage ? '{value}%' : '{value}'
            },
            max: percentage ? 100 : null,
            splitLine: false,
            min: 0,
            minInterval: 1
        },
        yAxis: {
            type: 'category',
            axisLine: {
                lineStyle: {
                    color: '#e0e0e0'
                }
            },
            axisTick: {
                show: false
            },
            nameLocation: 'start',
            data: datum.map(() => '')
        },
        series: datum.reverse()
            .map((data, seriesIndex) => [{
                name: data.name,
                type: 'bar',
                stack: data.name,
                data: datum.map((data, dataIndex) => (
                    dataIndex !== seriesIndex ? 0 : {
                        value: 0,
                        label: {
                            normal: {
                                show: true,
                                position: 'left',
                                formatter: data.name,
                                textStyle: {
                                    color: '#333333'
                                }
                            }
                        }
                    }
                ))
            }, {
                name: data.name,
                type: 'bar',
                stack: data.name,
                barWidth: '25px',
                barGap: '-100%',
                data: datum.map((data, dataIndex) => (
                    dataIndex !== seriesIndex ? 0 : {
                        name: data.name,
                        value: data.value,
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                                formatter: percentage ? '{c}%' : '{c}'
                            }
                        }
                    }
                ))
            }])
            .reduce((partialSeries, crt) => {
                return partialSeries.concat(crt);
            }, [])
    };
}

/**
 * 汇总：渠道活跃概况/渠道报告：活跃概况
 * @param type 渠道类型
 * @param datum
 * @param dates
 * @return {Object}
 */
export function barWithLineOption(type, datum, dates) {
    const _dates = dates.map(date =>
        date.replace(/\d{4}-|0(?=\d)/g, '')
            .replace('-', '/')
    );
    let color = '';
    switch (type) {
        case 'email':
            color = THEME_COLORS[0];
            break;
        case 'sms':
            color = THEME_COLORS[1];
            break;
        case 'wechat':
            color = THEME_COLORS[2];
            break;
        case 'mms':
            color = THEME_COLORS[4];
            break;
    }

    return {
        color: datum.length === 1 ? [color] : [THEME_COLORS[3], color],
        tooltip: {
            textStyle: {
                fontSize: 12
            },
            trigger: 'axis'
        },
        grid: GRID,
        legend: {
            top: '5%',
            data: datum.map((data, i) => ({
                name: data.name,
                icon: datum.length === 1 ? 'square' : (i === 0 ? 'circle' : 'square')
            }))
        },
        xAxis: [
            {
                type: 'category',
                axisTick: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: '#eeeeee'
                    }
                },
                axisLabel: {
                    textStyle: {
                        color: '#333333'
                    }
                },
                data: _dates
            }
        ],
        yAxis: {
            type: 'value',
            position: 'left',
            axisLine: {
                lineStyle: {
                    color: '#eeeeee'
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#333333'
                }
            },
            minInterval: 1
        },
        series: datum
    };
}

/**
 * 汇总：渠道事件分时段分布
 * @param series
 * @return {Object}
 */
export function getHourBarOption(series,tlist) {
    return {
        color: COLOR_MAP.journey,
        tooltip: {
            textStyle: {
                fontSize: 12
            },
            trigger: 'axis'
        },
        grid: GRID,
        legend: {
            top: '5%',
            icon: 'circle',
            data: series.map(({name}) => name)
        },
        xAxis: [
            {
                type: 'category',
                axisTick: {show: false},
                axisLabel: {
                    interval: 0,
                    rotate: -90
                },
                data: tlist
            }
        ],
        yAxis: {
            type: 'value',
            position: 'left',
            axisLine: {
                lineStyle: {
                    color: '#eeeeee'
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#333333'
                }
            },
            minInterval: 1
        },
        series: series.map(serial => ({
            type: 'bar',
            stack: 'hour',
            name: serial.name,
            data: serial.data
        }))
    };
}

/**
 * 对比分析：渠道发送概况
 * @param series
 * @param categories
 * @param type
 * @param percentage
 * @return {Object}
 */
export function getCompareBarOption(series, categories, type, percentage = false) {
    return {
        color: COLOR_MAP[type],
        tooltip: {
            textStyle: {
                fontSize: 12
            },
            trigger: 'axis',
            formatter: function (series) {
                const name = series[0].name,
                    parts = series.map(({seriesName, value}) => seriesName + ': ' + value + (percentage ? '%' : ''));
                return name + '<br/>' + parts.join('<br />');
            },
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            top: '5%',
            icon: 'circle',
            data: series.map(({name}) => name)
        },
        grid: GRID,
        xAxis: {
            type: 'category',
            axisLine: {
                lineStyle: {
                    color: '#e0e0e0'
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#333333'
                }
            },
            data: categories
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#e0e0e0'
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#333333'
                },
                formatter: percentage ? '{value}%' : '{value}'
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#eeeeee'
                }
            },
            max: percentage ? 100 : null,
            minInterval: percentage ? null : 1,
            splitNumber: percentage ? null : 7,
            min: 0
        },
        series: series
    };
}

/**
 * 渠道报告：邮件任务
 * 小的，细的环形图
 * @param partial
 * @param total
 * @param {String} name 文字
 * @param type
 * @returns {{series: [*]}}
 */
let count = null;

export function getTinyPieOption(partial, total, name = '', type) {
    let del = null;
    if (name === '送达总数(封)') {
        count = (partial / total * 100).toFixed(0);
    }
    if (name === '软弹') {
        del = (partial / total * 100).toFixed(0) + count > 100 ? (100 - count) : (partial / total * 100).toFixed(0);
    }
    return {
        color: COLOR_MAP[type],
        tooltip: {
            textStyle: {
                fontSize: 12
            },
            trigger: 'item',
            formatter: name + ': {c}(' + (total === 0 ? 0 : (del ? del : (partial / total * 100).toFixed(0))) + '%)'
        },
        series: [
            {
                type: 'pie',
                radius: [0, 40],
                label: {
                    normal: {
                        show: false
                    }
                },
                hoverAnimation: false,
                data: [{
                    value: partial,
                    itemStyle: {
                        normal: {
                            color: 'white'
                        }
                    }
                }]
            },
            {
                type: 'pie',
                radius: [40, 42],
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                silent: true,
                avoidLabelOverlap: false,
                data: [
                    {
                        value: total - partial,
                        label: {
                            normal: {
                                show: false
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: '#f2f2f2'
                            },
                            emphasis: {
                                color: '#f2f2f2'
                            }
                        }
                    },
                    {
                        value: partial,
                        label: {
                            normal: {
                                show: true,
                                position: 'center',
                                formatter: total === 0 ? '0%' : (del ? del : (partial / total * 100).toFixed(0)) + '%',
                                textStyle: {
                                    color: '#333333',
                                    fontSize: 18
                                }
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: partial === 0 ? '#f2f2f2' : {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [{
                                        offset: 0, color: '#624cbf' // 0% 处的颜色
                                    }, {
                                        offset: 1, color: '#0cc2a9' // 100% 处的颜色
                                    }],
                                    globalCoord: false // 缺省为 false
                                }
                            }
                        }
                    }
                ]
            }
        ]
    };
}

/**
 * 渠道报告/任务详情内报告：邮件任务
 * 无坐标轴条形图
 * @param datum
 * @param total
 * @return {Object}
 */
export function getNakedBarOption(datum, total) {
    const names = datum.map(data => data.name);
    return {
        grid: {
            top: '5%',
            left: '10%',
            bottom: 0,
            width: '75%'
        },
        xAxis: {
            type: 'value',
            show: false
        },
        yAxis: {
            show: false,
            type: 'category',
            data: names
        },
        tooltip: {
            textStyle: {
                fontSize: 12
            },
            trigger: 'item',
            formatter: function (params) {
                const name = datum[params.dataIndex].name,
                    value = datum[params.dataIndex].value;
                if (datum[params.dataIndex].percentage) {
                    return value + '%';
                }
                let percent = total === 0 ? 0 : (100 * Math.min(value / total, 1)).toFixed(0);
                return name + '：' + value + '(' + percent + '%)';
            },
        },
        series: [
            {
                type: 'bar',
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: [0, -20],
                        formatter: function (params) {
                            return names[params.dataIndex];
                        },
                        textStyle: {
                            color: '#333333'
                        }
                    }
                },
                barWidth: 8,
                itemStyle: {
                    normal: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 1,
                            y2: 0,
                            colorStops: [{
                                offset: 0, color: COLOR_MAP.email[0] // 0% 处的颜色
                            }, {
                                offset: 1, color: COLOR_MAP.email[1] // 100% 处的颜色
                            }],
                            globalCoord: false // 缺省为 false
                        }
                    }
                },
                data: datum.map(data => {
                    let value;
                    if (data.percentage) {
                        value = total * data.value / 100;
                    } else {
                        value = data.value > total ? total : data.value;
                    }
                    return {
                        name: data.name,
                        value
                    };
                })
            },
            {
                type: 'bar',
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: 'right',
                        formatter: function (params) {
                            const value = datum[params.dataIndex].value;
                            if (datum[params.dataIndex].percentage) {
                                return value + '%';
                            }
                            let percent = total === 0 ? 0 : (100 * Math.min(value / total, 1)).toFixed(0);
                            return value + '(' + percent + '%)';
                        },
                        textStyle: {
                            color: '#333333'
                        }
                    }
                },
                animation: false,
                itemStyle: {
                    normal: {
                        color: '#ccc'
                    }
                },
                data: datum.map(data => ({
                    name: data.name,
                    value: data.percentage ? (total * (100 - data.value) / 100) : Math.max(total - data.value, 0)
                }))
            }
        ]
    };
}

/**
 * 渠道报告：邮件/短信任务漏斗图
 * @param datum
 * @param type
 * @return {Object}
 */
export function getFunnelOption(datum, type = 'email') {
    const _datum = datum.sort((a, b) => b.value - a.value);
    _datum.$key = 'name';
    const total = _datum[0].value || 1;
    const legend = _datum.length > 3
        ? new Array(Math.ceil(_datum.length / 2))
            .fill(undefined)
            .map((hole, index) => ({
                orient: 'vertical',
                top: '1%',
                left: index === 1 ? '50%' : 'auto',
                right: index === 0 ? '50%' : 'auto',
                icon: 'circle',
                formatter: function (name) {
                    let percent = _datum.$getByKey(t('data.sent')).value ? '100%' : '0%';
                    if (name === t('data.accept')) {
                        percent = ((100 * Math.min((_datum.$getByKey(name).value / _datum.$getByKey(t('data.sent')).value),1)) || 0).toFixed(0) + '% ';
                    } else if (name === t('data.clicked') || name === t('data.opened')) {
                        percent = ((100 * Math.min((_datum.$getByKey(name).value / _datum.$getByKey(t('data.accept')).value),1)) || 0).toFixed(0) + '% ';
                    }
                    return percent + name;
                },
                data: [_datum[index * 2].name, _datum[index * 2 + 1].name]
            }))
        : {
            orient: 'vertical',
            top: '3%',
            left: 'center',
            icon: 'circle',
            formatter: function (name) {
                const percent = (100 * Math.min(_datum.$getByKey(name).value / total, 1)).toFixed(0) + '% ';
                return percent + name;
            },
            data: _datum.map(({name}) => name)
        };
    return {
        color: COLOR_MAP[type],
        legend: legend,
        tooltip: {
            textStyle: {
                fontSize: 12
            },
            trigger: 'item',
            formatter: function ({name, value}) {
                let percent = '100';
                if (name === t('data.sent')) {
                    percent = value ? '100' : '0';
                } else if (name === t('data.accept')) {
                    percent = ((100 * Math.min((value / _datum.$getByKey(t('data.sent')).value),1)) || 0).toFixed(0);
                } else if (name === t('data.clicked') || name === t('data.opened')) {
                    percent = ((100 * Math.min((value / _datum.$getByKey(t('data.accept')).value),1)) || 0).toFixed(0);
                }
                return name + '：' + value + '(' + percent + '%)';
            }
        },
        series: [
            {
                type: 'funnel',
                left: 'center',
                width: _datum.length > 3 ? '50%' : '60%',
                top: _datum.length > 3 ? '17%' : '30%',
                bottom: _datum.length > 3 ? '10%' : '7%',
                silent: true,
                label: {
                    show: false
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                itemStyle: {
                    normal: {
                        borderWidth: 1,
                        borderColor: '#dcdcdc',
                        color: 'transparent'
                    }
                },
                data: [
                    {value: _datum.reduce((acc, data) => acc + parseInt(data.value), 0)}
                ]
            },
            {
                type: 'funnel',
                left: 'center',
                top: _datum.length > 3 ? '20%' : '33%',
                width: _datum.length > 3 ? '40%' : '50%',
                bottom: _datum.length > 3 ? '13%' : '10%',
                minSize: '0%',
                maxSize: '100%',
                label: {
                    normal: {
                        show: true,
                        position: 'inside',
                        formatter: '{c}'
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                itemStyle: {
                    normal: {
                        borderWidth: 5
                    }
                },
                data: _datum
            }
        ]
    };
}

/**
 * 渠道报告 邮件\短信
 * 环形图
 * @param datum
 * @param type
 * @return {Object}
 */
export function getAnnularOption(datum, type) {
    const _datum = datum.sort((a, b) => b.value - a.value);
    return {
        color: COLOR_MAP[type],
        tooltip: {
            textStyle: {
                fontSize: 12
            },
            trigger: 'item',
            formatter: '{b}：{c}({d}%)'
        },
        legend: {
            data: _datum.map(data => data.name),
            top: '5%',
            left: 'center',
            icon: 'circle'
        },
        series: [
            {
                type: 'pie',
                radius: ['65', '90'],
                center: ['50%', '55%'],
                hoverAnimation: false,
                avoidLabelOverlap: true,
                label: {
                    normal: {
                        show: true,
                        formatter: '{b}:{d}%'
                    }
                },
                itemStyle: {
                    normal: {
                        borderWidth: _datum.length === 1 ? 0 : 3,
                        borderColor: 'white'
                    }
                },
                data: _datum
            }
        ]
    };
}

/**
 * 渠道报告：世界地图点状分布
 * @param cities
 * @return {Object}
 */
export function getWorldMapOption(cities) {

    let max = -Infinity,
        total = 0;

    cities.forEach(function (city) {
        if (city.value > max) {
            max = city.value;
        }
        total += parseInt(city.value);
        if (WORLD_MAP[city.name]) {
            city.value = [
                WORLD_MAP[city.name].longitude,
                WORLD_MAP[city.name].latitude,
                city.value
            ];
        } else {
            console.warn('No map record for ', city.name);
        }
    });

    return {
        visualMap: {
            show: false,
            min: 0,
            max: max,
            inRange: {
                symbolSize: [6, 60]
            }
        },
        geo: {
            name: 'World',
            type: 'map',
            map: 'world',
            roam: false,
            label: {
                normal: {
                    show: false
                }
            },
            itemStyle: {
                normal: {
                    areaColor: '#eeeeee',
                    borderColor: '#333333'
                },
                emphasis: {
                    areaColor: 'rgba(148, 90, 255, 0.31)'
                }
            }
        },
        tooltip: {
            textStyle: {
                fontSize: 12
            },
            trigger: 'item',
            formatter: function ({name, value}) {
                const val = value[2];
                return name + '<br>' + val + '(' + (val * 100 / total).toFixed(2) + '%)';
            }
        },
        series: [
            {
                type: 'scatter',
                coordinateSystem: 'geo',
                label: {
                    normal: {
                        show: false
                    }
                },
                itemStyle: {
                    color: '#624cbf',
                    shadowBlur: 10,
                    shadowColor: '#624cbf'
                },
                data: cities
            }
        ]
    };

}

/**
 * 渠道报告：中国地图点状分布
 * @param mapData
 * @return {Object}
 */
export function getChinaMapOption(mapData) {

    let max = -Infinity,
        total = 0;
    const postFixReg = /[省市区]/g;

    const cities = mapData.filter(city => {
        if (city.value > max) {
            max = city.value;
        }
        total += parseInt(city.value);

        city.name = city.name.replace(postFixReg, '');
        if (CHINA_MAP[city.name]) {
            city.value = [
                CHINA_MAP[city.name][0],
                CHINA_MAP[city.name][1],
                city.value
            ];
            return true;
        }
        console.warn('No map record for :', city.name);
        return false;
    });

    return {
        visualMap: {
            show: false,
            min: 0,
            max: max,
            inRange: {
                symbolSize: [6, 60]
            }
        },
        geo: {
            name: 'China',
            type: 'map',
            map: 'china',
            roam: false,
            label: {
                normal: {
                    show: false
                }
            },
            itemStyle: {
                normal: {
                    areaColor: '#eeeeee',
                    borderColor: '#333333'
                },
                emphasis: {
                    areaColor: 'rgba(148, 90, 255, 0.31)'
                }
            }
        },
        tooltip: {
            textStyle: {
                fontSize: 12
            },
            trigger: 'item',
            formatter: function ({name, value}) {
                const val = value[2];
                return name + '<br>' + val + '(' + (val * 100 / total).toFixed(2) + '%)';
            }
        },
        series: [
            {
                type: 'scatter',
                coordinateSystem: 'geo',
                label: {
                    normal: {
                        show: false
                    }
                },
                itemStyle: {
                    color: '#624cbf',
                    shadowBlur: 10,
                    shadowColor: '#624cbf'
                },
                data: cities
            }
        ]
    };
}

/**
 * 渠道报告：短信未送达原因
 * @param datum
 * @param type 渠道类型
 * @return {Object}
 */
export function verticalBarOption(datum, type) {
    return {
        color: COLOR_MAP[type],
        legend: {
            top: '5%',
            icon: 'circle',
            data: datum.map(data => data.name)
        },
        grid: GRID,
        tooltip: {
            textStyle: {
                fontSize: 12
            },
            trigger: 'item',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function ({name, data}) {
                return `${name}: ${data}`;
            }
        },
        xAxis: {
            type: 'category',
            axisLine: {
                lineStyle: {
                    color: '#e0e0e0'
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#333333'
                }
            },
            nameLocation: 'start',
            data: datum.map(data => data.name)
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#e0e0e0'
                }
            },
            axisTick: {
                show: false
            },
            splitLine: false,
            min: 0,
            minInterval: 1,
        },
        series: datum.map((data, seriesIndex) => ({
            name: data.name,
            type: 'bar',
            barWidth: '25px',
            barGap: '-100%',
            data: datum.map(({data}, dataIndex) => dataIndex === seriesIndex ? data : 0)
        }))
    };
}
/**
 * 旅程触达人数
 * @return {Object}
 */

export function getPieOption(_datum) {
    return {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        // legend: {
        //     orient: 'vertical',
        //     left: 'left',
        //     data: _datum.map(data => data.journeyName),
        // },
        series: {
            name: t('data.totalRecipients'),
            type: 'pie',
            radius : '55%',
            center: ['50%', '60%'],
            data:
            _datum.map(data => {
                return {
                    name: data.journeyName,
                    value: data.journeyCount
                };
            }),
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        },
    };
}
/**
 * 里程碑达成统计
 * @return {Object}
 */
export function getMileLineOption(xData, seriesData, xAxisShow) {
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line',
            },
        },
        xAxis: {
            type: 'category',
            boundaryGap: true,
            show: xAxisShow ? xAxisShow : false,
            data: xData
        },
        yAxis: {
            type: 'value',
            min: 0,
            splitLine: {
                lineStyle: {
                    color: '#eeeeee'
                }
            }
        },
        dataZoom: [{
            type: 'inside',
            start: 0,
            end: 100,
            zoomOnMouseWheel: false
        }, {
            start: 0,
            end: 100,
            handleIcon: `M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z`,
            handleSize: '80%',
            handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2
            }
        }],
        series: [
            {
                // name: this.$t('realTJR.completed_number'),
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: '#0cc2a9'
                    }
                },
                name : t('data.hits'),
                data: seriesData
            },
        ]
    };
}

/**
 *
 * @param datum
 * @param percentage
 * @param toolTipFormat
 * @returns
 */
export function getBarOptions(datum, {percentage = false, toolTipFormat = ''} = {}) {
    datum = datum.reverse();
    return {
        color: ['#4AD4C4', '#349488', '#84E1D6', '#CCFFFF'],
        legend: Object.assign({}, TOP_LEFT_LEGEND, {
            data: datum.map(data => data.name)
        }),
        grid: GRID,
        tooltip: {
            trigger: 'item',
            formatter: toolTipFormat.replace('name', 'a').replace('value', 'c'),
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#e0e0e0'
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#333333'
                },
                formatter: percentage ? '{value}%' : '{value}'
            },
        },
        xAxis: {
            type: 'category',
            axisLine: {
                lineStyle: {
                    color: '#e0e0e0'
                }
            },
            axisTick: {
                show: false
            },
            /*  nameLocation: 'start',*/
            data: datum.map(() => '')
        },
        series: datum.reverse()
            .map((data, seriesIndex) => [{
                name: data.name,
                type: 'bar',
                stack: data.name,
                data: datum.map((data, dataIndex) => (
                    dataIndex !== seriesIndex ? 0 : {
                        value: 0,
                        label: {
                            normal: {
                                show: true,
                                position: 'bottom',
                                formatter: data.name,
                                textStyle: {
                                    color: '#333333'
                                }
                            }
                        }
                    }
                ))
            }, {
                name: data.name,
                type: 'bar',
                stack: data.name,
                barWidth: '30px',
                barGap: '-100%',
                barCategoryGap:'100%',
                data: datum.map((data, dataIndex) => (
                    dataIndex !== seriesIndex ? 0 : {
                        name: data.name,
                        value: data.value,
                        label: {
                            normal: {
                                show: true,
                                position: 'top',
                                formatter: percentage ? '{c}%' : '{c}'
                            }
                        }
                    }
                ))
            }])
            .reduce((partialSeries, crt) => {
                return partialSeries.concat(crt);
            }, [])
    };
}

/**
 * 联系人：世界地图
 * @param country
 * @param PKJourney
 * @param legends
 * @return {Object}
 */
export function getNormalWorldMapOption(country,PKJourney = [],legends = []) {
    function getFormatterTxt(values) {
        let formatterTxt = '';
        if (legends.length && values.length && !PKJourney.length) {
            for (let i = 0;i < legends.length; i++) {
                formatterTxt = formatterTxt + `${legends[i]}: ${values[i] ? values[i] : 0}<br/>`;
            }
        }
        if (legends.length && values.length && PKJourney.length) {
            let times = -1;
            for (let n = 0; n < PKJourney.length; n++) {
                formatterTxt = formatterTxt + `${PKJourney[n]}: `;
                for (let m = 0;m < legends.length; m++) {
                    times += 1;
                    formatterTxt = formatterTxt + `${legends[m]}: ${values[times] ? values[times] : 0}`;
                }
                formatterTxt = formatterTxt + '<br>';
            }
        }
        return formatterTxt;
    }

    return {
        title: {
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            showDelay: 0,
            transitionDuration: 0.2,
            formatter: function (params) {
                if (params.data) {
                    return `${params.name}: <br/>${getFormatterTxt(params.data.value)}`;
                }
                return  `${params.name}: <br> ----`;
            }
        },
        series: [
            {
                type: 'map',
                map: 'world',
                itemStyle:{
                    emphasis: {
                        areaColor: 'rgba(148, 90, 255, 0.31)',
                        label: {
                            color: '#000'
                        }
                    }
                },
                data: country.map(items =>{
                    return {
                        name: items.country,
                        value: items.values
                    };
                })
            },
        ]
    };
}

/**
 * 自定义报表(通用柱状图)
 *  @param {object} datum {valueName: [],mapContent: [{name: '',value: []}]}
 */
export function getCustomReport(datum) {
    let sourceHead = ['product',...datum.valueName];
    let sourceData = datum.mapContent.map(({name,value}) => [name, ...value]);
    return {
        color: COMPARED_COLORS,
        legend: {
            type: 'scroll',
        },
        tooltip: {},
        dataset: {
            source: [sourceHead,...sourceData]
        },
        xAxis: {
            type: 'category',
            axisLine: {
                lineStyle: {
                    color: '#e0e0e0'
                }
            },
            axisLabel: {
                textStyle: {
                    color: '#333333'
                },
                formatter: (value) => {
                    if (value.length > 25) {
                        return value.slice(0,10) + '...' + value.slice(value.length - 5,value.length);
                    }
                    return value;
                },
            },
        },
        yAxis: {
            axisLine: {
                lineStyle: {
                    color: '#e0e0e0'
                }
            },
            axisLabel: {
                textStyle: {
                    color: '#333333'
                }
            },
        },
        dataZoom: [
            {
                id: 'dataZoomX',
                type: 'slider',
                xAxisIndex: [0],
                filterMode: 'filter',
                show: [...sourceData].length > 3,
                labelFormatter: function (value, valueStr) {
                    if (valueStr.length > 25) {
                        return valueStr.slice(0,3) + '...' + valueStr.slice(valueStr.length - 5,valueStr.length);
                    }
                    return valueStr;
                }
            },
        ],
        series: datum.valueName.map(
            () => {
                return {
                    type: 'bar',
                };
            })
    };
}

/**
 * 堆叠条形图
 * (邮件服务商)
 * @param datum
 * @param percentage 是否展示百分比
 */
export function normalStackedBarChart(datum,percentage = false) {
    return {
        color: COMPARED_COLORS,
        dataZoom: [
            {
                show: true,
                xAxisIndex: 0,
                filterMode: 'none',
                height: '80%',
                showDataShadow: false,
            }
        ],
        tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            },
            confine: true,
            formatter: (value) =>{
                let totalData = value.reduce((index,data) => index + data.value,0);
                let title = value[0].name;
                // 优化名称过长
                let sliceNameBefore = title.slice(0,title.length - 30);
                let sliceNameAfter = title.slice(title.length - 31,title.length);
                title = title.length > 45 ? sliceNameBefore + '<br/>' +  sliceNameAfter : title;
                let content = '';
                value.forEach(data =>{
                    if (percentage) {
                        content = `${content}${data.marker}${data.seriesName}:${data.value} (${totalData > 0 ? (data.value / totalData * 100).toFixed(2) : 0}%) <br/>`;
                    } else {
                        content = `${content}${data.marker}${data.seriesName}: ${data.value} <br/>`;
                    }
                });
                return `${title}: <br/> ${content}`;
            }
        },
        legend: {
            type: 'scroll',
            data: datum.legendName,
        },
        grid: GRID,
        xAxis:  {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#e0e0e0'
                }
            },
            axisLabel: {
                textStyle: {
                    color: '#333333'
                }
            },
        },
        yAxis: {
            type: 'category',
            axisLine: {
                lineStyle: {
                    color: '#e0e0e0'
                }
            },
            axisLabel: {
                textStyle: {
                    color: '#333333'
                },
                formatter: (value) => {
                    if (value.length > 25) {
                        return value.slice(0,10) + '...' + value.slice(value.length - 5,value.length);
                    }
                    return value;
                },
            },
            data: datum.dataName
        },
        series: datum.legendName.map((legendName,cur) =>{
            return {
                name: legendName,
                type: 'bar',
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: 'insideRight',
                        formatter: (param) =>{
                            if (param.value === 0) return '';
                        }
                    }
                },
                data: datum.value[cur]
            };
        })
    };
}

/**
 * timeLine 柱状图 (多个 ECharts option 间进行切换、播放等操作的功能。)
 * 用于自定义旅程对比
 *  @param datum
 */
export function mapTimeLine(datum) {
    return {
        baseOption: {
            color: COMPARED_COLORS,
            timeline: {
                axisType: 'category',
                autoPlay: false,
                playInterval: 2000,
                data: datum.switchData
            },
            title: '',
            tooltip: {
                confine: true,
            },
            legend: {
                type: 'scroll',
                data: datum.valueName
            },
            grid: {
                top: 80,
                bottom: 100,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow',
                        label: {
                            show: true,
                            formatter: function (params) {
                                return params.value.replace('\n', '');
                            }
                        }
                    }
                }
            },
            xAxis: [
                {
                    'type':'category',
                    'axisLabel': {
                        'interval': 0,
                        'formatter': (value) => {
                            if (value.length > 25) {
                                return value.slice(0,10) + '...' + value.slice(value.length - 5,value.length);
                            }
                            return value;
                        },
                    },
                    'data': datum.mapContent.map(elm => elm.name),
                    splitLine: {show: false},
                }
            ],
            yAxis: [
                {
                    type: 'value',
                }
            ],
            series: datum.valueName.map(elm =>{
                return {
                    name: elm,
                    type: 'bar'
                };
            })
        },
        options: datum.switchData.map((elm,cur) =>{
            return {
                series: datum.valueName.map((items,index) =>{
                    return {
                        data: datum.mapContent.map(map => map.value[cur][index])
                    };
                })
            };
        })
    };
}
/**
 *
 * 任务PK 邮件发送概览。
 * @param  datum
 */
export function emailSendOverview(datum) {
    return {
        color: COMPARED_COLORS,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            confine: true,
        },
        legend: {
            type: 'scroll',
            data: datum.valueName
        },
        calculable: true,
        xAxis: [
            {
                type: 'category',
                axisTick: {show: false},
                data: datum.mapContent.map(elm => elm.name),
                axisLabel: {
                    interval: 0,
                    formatter: (value) => {
                        if (value.length > 25) {
                            return value.slice(0,5) + '...' + value.slice(value.length - 5,value.length);
                        }
                        return value;
                    },
                    textStyle: {
                        color: '#333333'
                    }
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                    textStyle: {
                        color: '#333333'
                    }
                }
            }
        ],
        series: datum.valueName.map((name,cur) => {
            return {
                name: name,
                type: 'bar',
                data: datum.mapContent.map(elm => elm.value[cur])
            };
        })
    };
}
