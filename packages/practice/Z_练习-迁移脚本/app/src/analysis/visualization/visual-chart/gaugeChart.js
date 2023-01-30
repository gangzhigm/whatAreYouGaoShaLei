import {colors, grid,} from '../../chart/chartConfig.js';
//translate
import {translate} from '@/locales';
/**
 * 仪表图
 * @param name      名称
 * @param gaugeShow 显示形式
 * @param showName  仪表值和目标值的显示名（showName.yLeft, showName.yRight）
 * @param data      图表数据
 * @param groupId   看板分组
 * @param size      看板的size
 * @returns {{title: {textStyle: {fontSize: number, color: string}, text: string, top: string, left: string, backgroundColor: string, borderColor: string, borderRadius: number}, tooltip: {formatter: string}, toolbox: {show: boolean, feature: {mark: {show: boolean}, restore: {show: boolean}, saveAsImage: {show: boolean}}}, series: *[]}}
 */
export function getGaugeChart(name, gaugeShow, showName, data, groupId, size) {
    // 返回多组数据时取第一组数据画图
    if (data.length >= 1) {
        data = data[0];
    }

    name = name || translate('visualization.nameNoEmpty');
    let pointer = {}; // 指针的设置

    // 数据看板中的size决定标签的位置
    let top = '40%',
        left = '68%';
    if (groupId && size) {
        pointer = {
            width: 4,
            length: '60%',
        };
        switch (size) {
            case 'little':
                left = '88%';
                break;
            case 'medium':
                left = '83%';
                break;
            case 'large':
                left = '71%';
                break;
            case 'extra-large':
                left = '60%';
                break;
        }
    }
    // echarts 配置

    // text: '仪表值：\n454567676767645\n\n目标值：\n45454545',
    const text = showName.yLeft + '：\n' + data[0] + '\n\n' + showName.yRight + '：\n' + data[data.length - 1];
    let title = {
            textStyle: {
                fontSize: 14,
                color: '#fff',
            },
            text,
            top,
            left,
            backgroundColor: '#bfbfbf',
            borderColor: '#777',
            borderRadius: 4,
        },
        splitLine = {           // 分隔线
            length: 16,         // 属性length控制线长
        },
        type = 'gauge',
        axisLine = {
            lineStyle: {
                width: 10,
                color: [[0.2, colors[0]], [0.8, colors[1]], [1, colors[2]]],
            },
        },
        axisTick = {            // 坐标轴小标记
            length: 10,        // 属性length控制线长
        };

    // 默认为百分比类型
    let gaugeValue = (data[0] / data[data.length - 1] * 100).toFixed(2);
    let maxValue = 100;
    let detail = {
        fontSize: 20,
        formatter: function (value) {
            return (value + '%');
        }
    };

    // 值类型
    if (gaugeShow !== 1) {
        gaugeValue = data[0];
        maxValue = data[data.length - 1];
        detail = {
            fontSize: 20,
            formatter: function (value) {
                return value;
            }
        };
    }
    let seriesData = [{value: gaugeValue, name: name}];

    return {
        title,
        tooltip: {
            formatter: '{a} <br/>{b} : {c}%',
        },
        series: [
            {
                type,
                max: maxValue,
                detail,
                axisLine,
                splitLine,
                axisTick,
                data: seriesData,
                pointer,
                grid,
                radius: '70%',
            }
        ],
    };
}
