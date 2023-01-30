/**
 * 数据源 3d 柱状图
 * 默认8*8，超过8*8后变为9*9，依次累加
 */
import uniq from 'lodash/uniq';
import getColorsByCount from './getColorsByCount';
import {translate as t} from '@/locales';

let minSide = 8;    // chart的最小边长

/**
 * 设置默认数据源的长度 默认 8*8=64个数据源
 * @param actualLength  数据源的真实长度
 */
function getDataLength(actualLength) {
    // 数据源的最小默认长度
    let minLength = minSide * minSide;
    if (actualLength <= minLength) {
        return minLength;
    }
    minSide += 1;
    return getDataLength(actualLength);
}

/**
 * 数据源画图
 * @param dataSets
 * @returns {{tooltip: {formatter: tooltip.formatter}, visualMap: {show: boolean, inRange: {color: string[]}}, xAxis3D: {type: string}, yAxis3D: {type: string}, zAxis3D: {type: string}, grid3D: {show: boolean, top: number, bottom: number, height: number, boxWidth: number, boxDepth: number}, series: *[]}}
 */
export function getDataSet3dChart(dataSets) {
    let actualLength = dataSets.length;
    getDataLength(actualLength);

    // 给data赋值 [ [0,0,{set}], [0,1,{set}] ]
    let data = [],
        minLength = minSide * minSide;
    for (let i = 0; i < minLength; i++) {
        data[i] = [parseInt(i / minSide), i < minSide ? i : i % minSide, dataSets[i] ? dataSets[i] : {}];
    }

    // 去重后的数据源值
    const values = data
        .map(d => d[2].total)
        .filter(t => t !== undefined && t !== 0);
    const uniqValues = uniq(values).sort((a, b) => a - b);

    // 渐变颜色数组
    let colors = getColorsByCount(uniqValues.length);

    return {
        tooltip: {
            formatter: function (p) {
                if (p.data.id === null || p.data.id === undefined) {
                    return '';
                }
                let name = t('dataCenter.name') + p.data.name || '';
                // 类型：联系人端 sdk 的类型为 js-sdk
                let type = t('dataCenter.type') + (p.data.language === 'javascript' ? 'js-' + p.data.type : p.data.type);
                let value = t('dataCenter.rows') + p.data.value[2];
                return name + '<br>' + type + '<br>' + value;
            }
        },
        xAxis3D: {
            type: 'category',
        },
        yAxis3D: {
            type: 'category',
        },
        zAxis3D: {
            type: 'value'
        },
        grid3D: {
            show: false,
            top: -200,
            bottom: 200,
            height: 900,
            boxWidth: 100,
            boxDepth: 80,
        },
        series: [{
            type: 'bar3D',
            data: data.map(dataSet => ({
                id: dataSet[2].id,
                name: dataSet[2].name,
                type: dataSet[2].type,
                language: dataSet[2].language,
                value: [
                    dataSet[1],
                    dataSet[0],
                    dataSet[2].total || 0,
                ],
            })),
            shading: 'color',
            label: {
                show: false,
                textStyle: {
                    fontSize: 16,
                    borderWidth: 1
                }
            },
            itemStyle: {
                opacity: 0.4,
                color: function (params) {
                    const value = params.data.value[2];
                    if (params.data.id) {
                        if (value === 0) {
                            return colors[0];
                        }
                        let index = uniqValues.findIndex(val => val === value);
                        return colors[index];
                    }
                    return '#d9dfe7';
                },
            },
            emphasis: {
                itemStyle: {
                    color: '#5f4eff',
                }
            }
        }]
    };
}
