/**
 * Created by chutt on 2017/12/2.
 */
/* 事件分析图表 */
import max from 'lodash/max';
import chunk from 'lodash/chunk';

// 颜色设置
const colors = ['#0084ff', '#0fa573', '#f1871b', '#f23434', '#eec116', '#11caff', '#fa25a7', '#a04cd6', '#2bded8'];
const MAX_CHARS = 20;


/**
 * legend name 太长时会溢出，切断 + 换行处理
 * @param name
 * @return {string}
 */
function legendNameFormatter(name) {
    name = name.length > MAX_CHARS
        ? name.slice(0, MAX_CHARS) + '……'
        : name;
    return name.split(/(.{12})/).filter(str => str)
        .join('\n');
}


/**
 * 截断过长的文本
 * @param text
 * @return {string}
 */
export function trimLongText(text) {
    return text.length > MAX_CHARS ? text.slice(0, 18) + '……' : text;
}


/**
 * 单行文本截断成多行
 * @param text
 * @return {string}
 */
export function breakIntoLines(text) {
    return text.split(new RegExp(`(.{${MAX_CHARS * 2}})`)).filter(str => str)
        .join('<br>');
}


/**
 * tooltip 内无序列表的圆点
 * @param color
 * @return {string}
 */
function tooltipItemFactory(color) {
    return `<span style="display: inline-block;width: 10px;height: 10px;border-radius:100%;margin-right:5px;background: ${color}"></span>`;
}


/**
 * 生成 Y轴
 * @param isSingleAxis
 * @param axisPositionList
 * @param maxValue
 * @return {*}
 */
function singleAxis(isSingleAxis, axisPositionList, maxValue) {
    let yAxis;
    if (isSingleAxis) {
        yAxis = {
            type: 'value',
            max: Math.max(5, maxValue),
            interval: Math.max(1, maxValue / 5),
            splitLine: {
                lineStyle: {
                    type: 'dotted'
                }
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                show: true,
                formatter: function (value, index) {
                    return (index * 20) + '%';
                }
            }
        };
    } else {
        yAxis = [];
        // 非单轴归一时，最多有两个 y 轴
        for (let axis of axisPositionList) {
            if (yAxis.length === 2) {
                break;
            } else if (
                yAxis.length === 0  // 第一个y轴
                || (yAxis.length === 1 && yAxis[0].position !== axis.axisPosition) // 第二个y轴
            ) {
                yAxis.push({
                    type: 'value',
                    position: axis.axisPosition,
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: yAxis.length === 0,
                        lineStyle: {
                            type: 'dotted'
                        }
                    },
                });
            }
        }
    }
    
    return yAxis;
}


// 线图
export function getEventLineChart({isSingleAxis, axisPositionList}, legend, XAxisData, series, lineColors, 
        selectedIdx) {
    let list = [];
    series.forEach(item => {
        item.data.forEach(i => {
            list.push(Number(i));
        });
    });
    let maxValue = max(list);
    let yAxis = singleAxis(isSingleAxis, axisPositionList, maxValue);

    return {
        color: lineColors,
        tooltip: {
            trigger: 'axis',
            formatter: function (value) {
                let timeList = value[0].axisValue.split('/');
                let arr = [], arr1 = [];
                value.forEach(item => {
                    if (item.seriesName.includes('对比')) {
                        arr1.push({
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
                        result += `<br>${tooltipItemFactory(item.color)}${trimLongText(item.name)}:${trimLongText(item.value)}`;
                    });
                    arr1.forEach((item, index) => {
                        if (index === 0) {
                            result += '<br>' + item.time + ' ( 对比时间 )';
                        }
                        result += `<br>${tooltipItemFactory(item.color)}${trimLongText(arr[index].name)}:${trimLongText(item.value)}`;
                    });
                    return result;
                } else {
                    arr.forEach((item, index) => {
                        if (index === 0) {
                            result = item.time;
                        }
                        result += `<br>${tooltipItemFactory(item.color)}${trimLongText(arr[index].name)}:${trimLongText(item.value)}`;
                    });
                    return result;
                }
            }
        },
        legend: {
            type: 'scroll',
            bottom: 50,
            padding: [0, 50],
            formatter: legendNameFormatter,
            data: legend,
            // selectedMode:控制是否可以通过点击图例改变系列的显示状态。multiple:多选模式
            selectedMode: 'multiple',
            // 图例关闭时的颜色。default:#ccc
            inactiveColor: '#ccc',
            // 图例选中状态表。
            // selected:{
            //
            // }
        },
        grid: {
            top: '12%',
            left: '6%',
            right: '6%',
            bottom: '100px',
            containLabel: true
        },
        xAxis: {
            show: true,
            type: 'category',
            data: XAxisData,
            axisTick: {
                alignWithLabel: true,
                show: false
            }
            
        },
        yAxis: yAxis,
        dataZoom: [
            {
                show: true,
                type: 'slider',
                xAxisIndex: [0],
                start: 0,
                end: 100,
                top: 'bottom',
                left: 140,
                right: 140,
                bottom: 'auto',
            },
        ],
        series: series,
    };
}


// 柱图
export function getEventBarChart({isSingleAxis, axisPositionList}, legend, XAxisData, series, selectedIdx) {
    let list = [];
    series.forEach(item => {
        item.data.forEach(i => {
            list.push(Number(i));
        });
    });
    let maxValue = max(list);
    let yAxis = singleAxis(isSingleAxis, axisPositionList, maxValue);
    let colors1 = ['#7fc1ff', '#87d2b9', '#f8c38d', '#f89999', '#f6e08a', '#88e4ff', '#fc92d3', '#cfa5ea', '#95eeeb'];
    
    return {
        tooltip: {
            trigger: 'axis',
            formatter: function (value) {
                let timeList = value[0].axisValue.split('/');
                let indexName = [];
                axisPositionList.forEach((item, index) => {
                    if (selectedIdx[0].includes(index)) {
                        indexName.push(item.name);
                    }
                });
                
                // 初始时间
                let list = [];
                
                // 对比时间
                let compareList = [];
                value.forEach(item => {
                    if (colors1.includes(item.color)) {
                        compareList.push({
                            time: timeList[1],
                            name: item.seriesName,
                            value: item.value,
                            color: item.color
                        });
                    } else {
                        list.push({
                            time: timeList[0],
                            name: item.seriesName,
                            value: item.value,
                            color: item.color
                        });
                    }
                });
                let selectOptions = [...new Set(selectedIdx[1])];
                let resultList = chunk(list, selectOptions.length);
                let compareResultList = chunk(compareList, selectOptions.length);
                
                let str = '';
                if (timeList.length > 1) {
                    resultList.forEach((item, index) => {
                        if (index === 0) {
                            str = timeList[0];
                        }
                        item.forEach(dom => {
                            str += `<br>${tooltipItemFactory(item.color)}${trimLongText(dom.name)} - ${trimLongText(indexName[index])}:${dom.value}`;
                        });
                    });
                    compareResultList.forEach((item, index) => {
                        if (index === 0) {
                            str += '<br>' + timeList[1] + ' ( 对比时间 )';
                        }
                        item.forEach(dom => {
                            str += `<br>${tooltipItemFactory(item.color)}${trimLongText(dom.name)} - ${trimLongText(indexName[index])}:${dom.value}`;
                        });
                    });
                    return str;
                } else {
                    resultList.forEach((item, index) => {
                        if (index === 0) {
                            str = timeList[0];
                        }
                        item.forEach(dom => {
                            str += `<br>${tooltipItemFactory(item.color)}${trimLongText(dom.name)} - ${trimLongText(indexName[index])}:${dom.value}`;
                        });
                    });
                    return str;
                }
            },
        },
        legend: {
            type: 'scroll',
            bottom: 50,
            padding: [0, 50],
            formatter: legendNameFormatter,
            data: legend
        },
        grid: {
            top: '12%',
            left: '6%',
            right: '6%',
            bottom: '100px',
            containLabel: true
        },
        
        xAxis: [
            {
                show: true,
                type: 'category',
                data: XAxisData,
                axisTick: {
                    alignWithLabel: true,
                    show: false
                }
            }
        ],
        yAxis: yAxis,
        dataZoom: [
            {
                show: true,
                type: 'slider',
                xAxisIndex: [0],
                start: 0,
                end: 100,
                top: 'bottom',
                left: 120,
                right: 120,
                bottom: 'auto',
            },
        ],
        series: series,
    };
}

// 饼图
export function getEventPieChart(series, indexName) {
    // 根据饼图数据 series 各个数值占比，调整label的展示
    const sum = series.reduce((acc, seriesData) => {
        return acc + Number(seriesData.value);
    }, 0);
    const limit = sum * 0.05;   // 总和的 5% 阈值
    const seriesDatum = series.map(seriesData => {
        // 占总和百分比小于 5% 的数据，默认不显示 label，鼠标 hover 时在环形图中心展示 label
        return Object.assign(
            {
                label: (seriesData.value < limit
                    ? {
                        normal: {
                            show: false,
                            position: 'center',
                            formatter: function (params) {
                                return `${trimLongText(params.name)}\n${params.value} ${params.percent}%`;
                            },
                        },
                        emphasis: {
                            show: true
                        }
                    }
                    : {
                        normal: {
                            formatter: '{b}: {c} {d}%',
                        },
                    })
            },
            seriesData);
    });
    
    return {
        color: colors,
        tooltip: {
            trigger: 'item',
            formatter: function (value) {
                return `${breakIntoLines(indexName)}<br>${breakIntoLines(value.name)}:${value.value}<br>占${value.percent}%`;
            },
        },
        legend: {
            show: true,
            type: 'scroll',
            bottom: 1,
            padding: [0, 70],
            formatter: legendNameFormatter
        },
        grid: {
            top: '12%',
            left: '6%',
            right: '6%',
            bottom: '100px',
        },
        series: [
            {
                name: indexName,
                type: 'pie',
                minAngle: 1,
                avoidLabelOverlap: false,
                radius: ['40%', '60%'],
                data: seriesDatum
            }
        ]
    };
    
}
