/**
 * Created by naeemo on 2017/5/17.
 */

const geoCoordMap = {
    '上海': [121.48, 31.22],
    '珠海': [113.52, 22.3],
    '三亚': [109.31, 18.14],
    '惠州': [114.4, 23.09],
    '海口': [110.35, 20.02],
    '合肥': [117.27, 31.86],
    '南京': [118.78, 32.04],
    '杭州': [120.19, 30.26],
    '苏州': [120.62, 31.32],
    '无锡': [120.29, 31.59],
    '昆山': [120.95, 31.39],
    '广州': [113.23, 23.16],
    '深圳': [114.07, 22.62],
    '佛山': [113.11, 23.05],
    '东莞': [113.75, 23.04],
    '福州': [119.3, 26.08],
    '厦门': [118.1, 24.46],
    '南宁': [108.33, 22.84],
    '郑州': [113.65, 34.76],
    '武汉': [114.31, 30.52],
    '长沙': [113, 28.21],
    '南昌': [115.89, 28.68],
    '北京': [116.46, 39.92],
    '长春': [125.35, 43.88],
    '大连': [121.62, 38.92],
    '沈阳': [123.38, 41.8],
    '哈尔滨': [126.63, 45.75],
    '天津': [117.2, 39.13],
    '济南': [117, 36.65],
    '青岛': [120.33, 36.07],
    '太原': [112.53, 37.87],
    '石家庄': [114.48, 38.03],
    '西安': [108.95, 34.27],
    '成都': [104.06, 30.67],
    '重庆': [106.54, 29.59],
    '昆明': [102.73, 25.04],
};


let latlong = {'Hong Kong': {'latitude': 22.25, 'longitude': 114.1667}};

latlong.Afghanistan = {'latitude': 33, 'longitude': 65};
latlong.Albania = {'latitude': 41, 'longitude': 20};
latlong.Algeria = {'latitude': 28, 'longitude': 3};
latlong.Angola = {'latitude': -12.5, 'longitude': 18.5};
latlong.Argentina = {'latitude': -34, 'longitude': -64};
latlong.Armenia = {'latitude': 40, 'longitude': 45};
latlong.Australia = {'latitude': -27, 'longitude': 133};
latlong.Austria = {'latitude': 47.3333, 'longitude': 13.3333};
latlong.Azerbaijan = {'latitude': 40.5, 'longitude': 47.5};
latlong.Bahrain = {'latitude': 26, 'longitude': 50.55};
latlong.Bangladesh = {'latitude': 24, 'longitude': 90};
latlong.Belarus = {'latitude': 53, 'longitude': 28};
latlong.Belgium = {'latitude': 50.8333, 'longitude': 4};
latlong.Benin = {'latitude': 9.5, 'longitude': 2.25};
latlong.Bhutan = {'latitude': 27.5, 'longitude': 90.5};
latlong.Bolivia = {'latitude': -17, 'longitude': -65};
latlong.BosniaandHerzegovina = {'latitude': 44, 'longitude': 18};
latlong.Botswana = {'latitude': -22, 'longitude': 24};
latlong.Brazil = {'latitude': -10, 'longitude': -55};
latlong.Brunei = {'latitude': 4.5, 'longitude': 114.6667};
latlong.Bulgaria = {'latitude': 43, 'longitude': 25};
latlong.Burundi = {'latitude': -3.5, 'longitude': 30};
latlong.Cambodia = {'latitude': 13, 'longitude': 105};
latlong.Cameroon = {'latitude': 6, 'longitude': 12};
latlong.Canada = {'latitude': 54, 'longitude': -100};
latlong.CapeVerde = {'latitude': 16, 'longitude': -24};
latlong.Chad = {'latitude': 15, 'longitude': 19};
latlong.Chile = {'latitude': -30, 'longitude': -71};
latlong.China = {'latitude': 35, 'longitude': 105};
latlong.Colombia = {'latitude': 4, 'longitude': -72};
latlong.Comoros = {'latitude': -12.1667, 'longitude': 44.25};
latlong.CostaRica = {'latitude': 10, 'longitude': -84};
// latlong.Coted\Ivoire = {'latitude':8,'longitude':-5};
latlong.Croatia = {'latitude': 45.1667, 'longitude': 15.5};
latlong.Cuba = {'latitude': 21.5, 'longitude': -80};
latlong.Cyprus = {'latitude': 35, 'longitude': 33};
// latlong.CzechRep. = {'latitude':49.75,'longitude':15.5};
latlong.Denmark = {'latitude': 56, 'longitude': 10};
latlong.Djibouti = {'latitude': 11.5, 'longitude': 43};
latlong.Ecuador = {'latitude': -2, 'longitude': -77.5};
latlong.Egypt = {'latitude': 27, 'longitude': 30};
latlong.ElSalvador = {'latitude': 13.8333, 'longitude': -88.9167};
latlong.EquatorialGuinea = {'latitude': 2, 'longitude': 10};
latlong.Eritrea = {'latitude': 15, 'longitude': 39};
latlong.Estonia = {'latitude': 59, 'longitude': 26};
latlong.Ethiopia = {'latitude': 8, 'longitude': 38};
latlong.Fiji = {'latitude': -18, 'longitude': 175};
latlong.Finland = {'latitude': 62, 'longitude': 26};
latlong.France = {'latitude': 46, 'longitude': 2};
latlong.Gabon = {'latitude': -1, 'longitude': 11.75};
latlong.Gambia = {'latitude': 13.4667, 'longitude': -16.5667};
latlong.Georgia = {'latitude': 42, 'longitude': 43.5};
latlong.Germany = {'latitude': 51, 'longitude': 9};
latlong.Ghana = {'latitude': 8, 'longitude': -2};
latlong.Greece = {'latitude': 39, 'longitude': 22};
latlong.Guatemala = {'latitude': 15.5, 'longitude': -90.25};
latlong.Guinea = {'latitude': 11, 'longitude': -10};
// latlong.Guinea-Bissau = {'latitude':12,'longitude':-15};
latlong.Guyana = {'latitude': 5, 'longitude': -59};
latlong.Haiti = {'latitude': 19, 'longitude': -72.4167};
latlong.Honduras = {'latitude': 15, 'longitude': -86.5};
latlong.Hungary = {'latitude': 47, 'longitude': 20};
latlong.Iceland = {'latitude': 65, 'longitude': -18};
latlong.India = {'latitude': 20, 'longitude': 77};
latlong.Indonesia = {'latitude': -5, 'longitude': 120};
latlong.Iran = {'latitude': 32, 'longitude': 53};
latlong.Iraq = {'latitude': 33, 'longitude': 44};
latlong.Ireland = {'latitude': 53, 'longitude': -8};
latlong.Israel = {'latitude': 31.5, 'longitude': 34.75};
latlong.Italy = {'latitude': 42.8333, 'longitude': 12.8333};
latlong.Jamaica = {'latitude': 18.25, 'longitude': -77.5};
latlong.Japan = {'latitude': 36, 'longitude': 138};
latlong.Jordan = {'latitude': 31, 'longitude': 36};
latlong.Kazakhstan = {'latitude': 48, 'longitude': 68};
latlong.Kenya = {'latitude': 1, 'longitude': 38};
latlong.Korea = {'latitude': 40, 'longitude': 127};
latlong.Korea = {'latitude': 37, 'longitude': 127.5};
latlong.Kuwait = {'latitude': 29.3375, 'longitude': 47.6581};
latlong.Kyrgyzstan = {'latitude': 41, 'longitude': 75};
latlong.Laos = {'latitude': 18, 'longitude': 105};
latlong.Latvia = {'latitude': 57, 'longitude': 25};
latlong.Lebanon = {'latitude': 33.8333, 'longitude': 35.8333};
latlong.Lesotho = {'latitude': -29.5, 'longitude': 28.5};
latlong.Liberia = {'latitude': 6.5, 'longitude': -9.5};
latlong.Libya = {'latitude': 25, 'longitude': 17};
latlong.Lithuania = {'latitude': 55, 'longitude': 24};
latlong.Luxembourg = {'latitude': 49.75, 'longitude': 6};
latlong.Macedonia = {'latitude': 41.8333, 'longitude': 22};
latlong.Madagascar = {'latitude': -20, 'longitude': 47};
latlong.Malawi = {'latitude': -13.5, 'longitude': 34};
latlong.Malaysia = {'latitude': 2.5, 'longitude': 112.5};
latlong.Mali = {'latitude': 17, 'longitude': -4};
latlong.Mauritania = {'latitude': 20, 'longitude': -12};
latlong.Mauritius = {'latitude': -20.2833, 'longitude': 57.55};
latlong.Mexico = {'latitude': 23, 'longitude': -102};
latlong.Moldova = {'latitude': 47, 'longitude': 29};
latlong.Mongolia = {'latitude': 46, 'longitude': 105};
latlong.Montenegro = {'latitude': 42.5, 'longitude': 19.4};
latlong.Morocco = {'latitude': 32, 'longitude': -5};
latlong.Mozambique = {'latitude': -18.25, 'longitude': 35};
latlong.Myanmar = {'latitude': 22, 'longitude': 98};
latlong.Namibia = {'latitude': -22, 'longitude': 17};
latlong.Nepal = {'latitude': 28, 'longitude': 84};
latlong.Netherlands = {'latitude': 52.5, 'longitude': 5.75};
latlong.NewZealand = {'latitude': -41, 'longitude': 174};
latlong.Nicaragua = {'latitude': 13, 'longitude': -85};
latlong.Niger = {'latitude': 16, 'longitude': 8};
latlong.Nigeria = {'latitude': 10, 'longitude': 8};
latlong.Norway = {'latitude': 62, 'longitude': 10};
latlong.Oman = {'latitude': 21, 'longitude': 57};
latlong.Pakistan = {'latitude': 30, 'longitude': 70};
latlong.Panama = {'latitude': 9, 'longitude': -80};
latlong.PapuaNewGuinea = {'latitude': -6, 'longitude': 147};
latlong.Paraguay = {'latitude': -23, 'longitude': -58};
latlong.Peru = {'latitude': -10, 'longitude': -76};
latlong.Philippines = {'latitude': 13, 'longitude': 122};
latlong.Poland = {'latitude': 52, 'longitude': 20};
latlong.Portugal = {'latitude': 39.5, 'longitude': -8};
latlong.PuertoRico = {'latitude': 18.25, 'longitude': -66.5};
latlong.Qatar = {'latitude': 25.5, 'longitude': 51.25};
latlong.Romania = {'latitude': 46, 'longitude': 25};
latlong.Russia = {'latitude': 60, 'longitude': 100};
latlong.Rwanda = {'latitude': -2, 'longitude': 30};
latlong.SaudiArabia = {'latitude': 25, 'longitude': 45};
latlong.Senegal = {'latitude': 14, 'longitude': -14};
latlong.Serbia = {'latitude': 44, 'longitude': 21};
latlong.SierraLeone = {'latitude': 8.5, 'longitude': -11.5};
latlong.Singapore = {'latitude': 1.3667, 'longitude': 103.8};
latlong.SlovakRepublic = {'latitude': 48.6667, 'longitude': 19.5};
latlong.Slovenia = {'latitude': 46, 'longitude': 15};
latlong.SolomonIslands = {'latitude': -8, 'longitude': 159};
latlong.Somalia = {'latitude': 10, 'longitude': 49};
latlong.SouthAfrica = {'latitude': -29, 'longitude': 24};
latlong.Spain = {'latitude': 40, 'longitude': -4};
latlong.SriLanka = {'latitude': 7, 'longitude': 81};
latlong.Sudan = {'latitude': 15, 'longitude': 30};
latlong.Suriname = {'latitude': 4, 'longitude': -56};
latlong.Swaziland = {'latitude': -26.5, 'longitude': 31.5};
latlong.Sweden = {'latitude': 62, 'longitude': 15};
latlong.Switzerland = {'latitude': 47, 'longitude': 8};
latlong.Syria = {'latitude': 35, 'longitude': 38};
latlong.Taiwan = {'latitude': 23.5, 'longitude': 121};
latlong.Tajikistan = {'latitude': 39, 'longitude': 71};
latlong.Tanzania = {'latitude': -6, 'longitude': 35};
latlong.Thailand = {'latitude': 15, 'longitude': 100};
latlong.Togo = {'latitude': 8, 'longitude': 1.1667};
latlong.TrinidadandTobago = {'latitude': 11, 'longitude': -61};
latlong.Tunisia = {'latitude': 34, 'longitude': 9};
latlong.Turkey = {'latitude': 39, 'longitude': 35};
latlong.Turkmenistan = {'latitude': 40, 'longitude': 60};
latlong.Uganda = {'latitude': 1, 'longitude': 32};
latlong.Ukraine = {'latitude': 49, 'longitude': 32};
latlong.UnitedArabEmirates = {'latitude': 24, 'longitude': 54};
latlong.UnitedKingdom = {'latitude': 54, 'longitude': -2};
latlong.America = {'latitude': 38, 'longitude': -97};
latlong.Uruguay = {'latitude': -33, 'longitude': -56};
latlong.Uzbekistan = {'latitude': 41, 'longitude': 64};
latlong.Venezuela = {'latitude': 8, 'longitude': -66};
latlong.WestBankandGaza = {'latitude': 32, 'longitude': 35.25};
latlong.Vietnam = {'latitude': 16, 'longitude': 106};
latlong.Yemen = {'latitude': 15, 'longitude': 48};
latlong.Zambia = {'latitude': -15, 'longitude': 30};
latlong.Zimbabwe = {'latitude': -20, 'longitude': 30};
latlong.HongKong = {'latitude': 22.25, 'longitude': 114.1667};
// latlong.China = {'latitude':35, 'longitude':105};
// latlong.Japan = {'latitude':36, 'longitude':138};
// latlong.America = {'latitude':38, 'longitude':-97};


/**
 * 转化地图数据
 * @param datum
 * @return {Array}
 */
function convertMapData(datum) {
    const res = [];
    for (let i = 0; i < datum.length; i++) {
        const geoCoord = geoCoordMap[datum[i].name];
        if (geoCoord) {
            res.push({
                name: datum[i].name,
                value: geoCoord.concat(datum[i].value)
            });
        }
    }
    return res;
}

const TOP_LEFT_LEGEND = {
    selectedMode: false,
    top: '5%',
    left: '5%',
    icon: 'circle'
};
const MIDDLE_RIGHT_LEGEND = {
    selectedMode: false,
    orient: 'vertical',
    top: 'middle',
    left: '70%',
    icon: 'circle'
};
const GRID = {
    left: '8%',
    right: '8%',
    bottom: '5%',
    containLabel: true
};

/**
 * 公司整体概况、旅程分析
 * 横向柱状图
 * @param {Array} datum [{name: '', value: ''}]
 * @param {Boolean} percentage
 * @param {String} toolTipFormat
 * @return {Object}
 */
export function getBarOption(datum, {percentage = false, toolTipFormat = ''} = {}) {
    return {
        color: ['#0cc2a9', '#624cbf'],
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
 * 公司整体概况、旅程分析
 * 折线图
 * @param {Array<Object>} datum [{name: '', value: [x,x,x...]}, {name: '', value: [x,x,x...]}]
 * @param {Array<String>} dates
 * @return {Object}
 */
export function getLineOption(datum, dates) {
    const _dates = dates.map(date =>
        date.replace(/\d{4}-|0(?=\d)/g, '')
            .replace('-', '月') + '日'
    );
    
    return {
        color: ['#624cbf', '#0cc2a9'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985',
                    precision: 0
                }
            }
        },
        legend: Object.assign({}, TOP_LEFT_LEGEND, {
            data: datum.map(data => data.name)
        }),
        grid: Object.assign({}, GRID, {
            bottom: '15%'
        }),
        xAxis: {
            type: 'category',
            axisLine: {
                lineStyle: {
                    color: '#333333'
                }
            },
            axisLabel: {
                rotate: '-90',
            },
            axisTick: {
                show: false
            },
            boundaryGap: false,
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
            minInterval: 1,
            splitNumber: 1,
            min: 0
        },
        series: datum.map(data => ({
            name: data.name,
            type: 'line',
            areaStyle: {normal: {}},
            data: data.value
        }))
    };
}


/**
 * 公司整体概况、旅程分析
 * 漏斗图
 * @param datum
 * @return {Object}
 */
export function getFunnelOption(datum) {
    const _datum = datum.sort((a, b) => b.value - a.value);
    const total = _datum[0].value;
    let index = 0;
    return {
        color: ['#0cc2a9', '#0aa590', '#fc9d59'],
        legend: Object.assign({}, MIDDLE_RIGHT_LEGEND, {
            data: _datum.map(data => data.name),
            formatter: function (name) {
                return (total === 0 ? 0 : (100 * _datum[index++].value / total).toFixed(0)) + '% ' + name;
            }
        }),
        tooltip: {
            trigger: 'item',
            formatter: function ({name, value}) {
                let min = (100 * Math.min(value / total, 1)).toFixed(0);
                if (total === 0) {
                    min = 0;
                }
                return name + '：' + value + '(' + min + '%)';
            }
        },
        series: [
            {
                type: 'funnel',
                left: '10%',
                width: '50%',
                top: 40,
                bottom: 40,
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
                    {value: total}
                ]
            },
            {
                type: 'funnel',
                left: '15%',
                top: 60,
                bottom: 60,
                width: '40%',
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
                        borderWidth: 0
                    }
                },
                data: _datum
            }
        ]
    };
}


/**
 * 环形图
 * 小的，细的
 * @param partial
 * @param total
 * @param {String} name 文字
 * @returns {{series: [*]}}
 */
export function getTinyPieOption(partial, total, name = '') {
    return {
        tooltip: {
            trigger: 'item',
            formatter: name + ': {c}(' + (total === 0 ? 0 : (partial / total * 100).toFixed(0)) + '%)'
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
                                formatter: total === 0 ? '0%' : (partial / total * 100).toFixed(0) + '%',
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
 * 邮件
 * 漏斗图
 * @param datum
 * @return {Object}
 */
export function getEmailFunnelOption(datum) {
    const _datum = datum.sort((a, b) => b.value - a.value);
    _datum.$key = 'name';
    const total = _datum[0].value;
    const legends = new Array(Math.ceil(_datum.length / 2))
        .fill(undefined)
        .map((hole, index) => ({
            selectedMode: false,
            orient: 'vertical',
            top: '3%',
            left: index === 1 ? '50%' : 'auto',
            right: index === 0 ? '50%' : 'auto',
            icon: 'circle',
            formatter: function (name) {
                const percent = total === 0
                    ? 0
                    : (100 * Math.min(_datum.$getByKey(name).value / total, 1)).toFixed(0) + '% ';
                return percent + name;
            },
            data: [_datum[index * 2].name, _datum[index * 2 + 1].name]
        }));
    
    return {
        color: ['#55d4c3', '#0aa590', '#624cbf', '#fc9d59'],
        legend: legends,
        tooltip: {
            trigger: 'item',
            formatter: function ({name, value}) {
                let min = (100 * Math.min(value / total, 1)).toFixed(0);
                if (total === 0) { min = 0 }
                return name + '：' + value + '(' + min + '%)';
            }
        },
        series: [
            {
                type: 'funnel',
                left: '25%',
                width: '50%',
                top: '17%',
                bottom: '10%',
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
                left: '30%',
                top: '20%',
                width: '40%',
                bottom: '13%',
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
 * 邮件\短信
 * 环形图
 * @param datum
 * @return {Object}
 */
export function getAnnularOption(datum) {
    const _datum = datum.sort((a, b) => b.value - a.value);
    let nameTooLong = false;
    for (let data of _datum) {
        let slimStr = data.name.replace(/[^a-z0-9-_\s%]*/ig, '__');
        if (slimStr / 2 > 10) {
            nameTooLong = true;
            break;
        }
    }
    return {
        color: ['#fc9d59', '#9182d2', '#624cbf', '#55d4c3'],
        tooltip: {
            trigger: 'item',
            formatter: '{b}：{c}({d}%)'
        },
        legend: Object.assign({}, MIDDLE_RIGHT_LEGEND, {
            data: _datum.map(data => data.name),
            left: nameTooLong ? 'auto' : '70%',
            right: nameTooLong ? 10 : 'auto'
        }),
        series: [
            {
                type: 'pie',
                radius: ['65', '90'],
                center: ['40%', '50%'],
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
 * 邮件
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
            trigger: 'item',
            formatter: function (params) {
                const name = datum[params.dataIndex].name,
                    value = datum[params.dataIndex].value;
                if (datum[params.dataIndex].percentage) {
                    return value + '%';
                } else {
                    let percent = total === 0 ? 0 : (100 * Math.min(value / total, 1)).toFixed(0);
                    return name + '：' + value + '(' + percent + '%)';
                }
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
                                offset: 0, color: '#624cbf' // 0% 处的颜色
                            }, {
                                offset: 1, color: '#0cc2a9' // 100% 处的颜色
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
                            } else {
                                let percent = total === 0 ? 0 : (100 * Math.min(value / total, 1)).toFixed(0);
                                return value + '(' + percent + '%)';
                            }
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
 * 邮件
 * 世界地图, 联系人活跃
 * @param {Array} datum
 * @return {Object}
 */
export function getMapOption(datum) {
    const convertedData = convertMapData(datum);
    
    return {
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicInOut',
        animationDurationUpdate: 1000,
        animationEasingUpdate: 'cubicInOut',
        geo: {
            map: 'world',
            zoom: 1,
            label: {
                emphasis: {
                    show: false
                }
            },
            roam: true,
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
            trigger: 'item'
        },
        grid: {
            top: 0,
            bottom: 0
        },
        xAxis: {
            show: false
        },
        yAxis: {
            show: false
        },
        series: [{
            type: 'scatter',
            coordinateSystem: 'geo',
            data: convertedData,
            symbolSize: 1,
            label: {
                normal: {
                    formatter: '{b}',
                    position: 'right',
                    show: false
                },
                emphasis: {
                    show: true
                }
            },
            itemStyle: {
                normal: {
                    color: '#624cbf',
                    position: 'right',
                    show: true
                }
            }
        }, {
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: convertedData,
            symbolSize: function (val) {
                return Math.max(val[2] / 1000, 1);
            },
            showEffectOn: 'render',
            rippleEffect: {
                brushType: 'stroke'
            },
            hoverAnimation: true,
            label: {
                normal: {
                    formatter: '{b}',
                    position: 'right',
                    show: true
                }
            },
            itemStyle: {
                normal: {
                    color: '#624cbf',
                    shadowBlur: 10,
                    shadowColor: '#624cbf'
                }
            },
            zlevel: 1
        }]
    };
}


/**
 * 世界地图点状分部
 * @param mapData
 * @return {Object}
 */
export function getMapWorldOption(mapData) {
    
    let max = -Infinity,
        min = Infinity,
        total = 0;
    
    mapData.forEach(function (itemOpt) {
        if (itemOpt.value > max) {
            max = itemOpt.value;
        }
        if (itemOpt.value < min) {
            min = itemOpt.value;
        }
        total += parseInt(itemOpt.value);
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
            name: 'World Population (2010)',
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
                data: mapData.map(function (itemOpt) {
                    return {
                        name: itemOpt.name,
                        value: [
                            latlong[itemOpt.name].longitude,
                            latlong[itemOpt.name].latitude,
                            itemOpt.value
                        ],
                        label: {
                            normal: {
                                show: false
                            }
                        },
                        itemStyle: {
                            color: '#624cbf',
                            shadowBlur: 10,
                            shadowColor: '#624cbf'
                        }
                    };
                })
            }
        ]
    };
    
}


/**
 * 根据容器尺寸重绘图表
 * @param charts
 */
export function resize(charts) {
    let timer = null;
    return function () {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            clearTimeout(timer);
            timer = null;
            for (let key of Object.keys(charts)) {
                const chart = charts[key];
                if (chart && chart.resize) chart.resize();
            }
        }, 200);
    };
}


export function orderDiagram() {
    return {
        open: true,
        className: 'order-diagram_1',
        title: '订单及销售转化',
        diagramWidth: '100%',
        diagramHeight: '310px',
        echatOption: {
            legend: {
                left: 20,
                top: 10,
                data: [{name: '产生销售额', icon: 'roundRect'}, {name: '转化为订单', icon: 'roundRect'}]
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                textStyle: {
                    fontSize: 12,
                    lineHeight: 14
                }
            },
            grid: {
                left: '3%',
                right: '12%',
                bottom: '12%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: true,
                interval: 10,
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            },
            yAxis: [
                {
                    type: 'value',
                    min: 0,
                    axisLabel: {
                        show: true,
                        interval: 'auto',
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#eeeeee'
                        }
                    }
                },
                {
                    type: 'value',
                    min: 0,
                    axisLabel: {
                        show: true,
                        interval: 'auto',
                    }
                }],
            /* dataZoom: [{
                 type: 'inside',
                 start: 0,
                 end: 100,
                 zoomOnMouseWheel: false
             }, {
                 start: 0,
                 end: 100,
                 handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                 handleSize: '80%',
                 handleStyle: {
                     color: '#fff',
                     shadowBlur: 3,
                     shadowColor: 'rgba(0, 0, 0, 0.6)',
                     shadowOffsetX: 2,
                     shadowOffsetY: 2
                 }
             }],*/
            series: [
                {
                    name: '产生销售额',
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#7b5eea'
                        }
                    },
                    data: [0, 0, 0, 0, 0, 0, 0]
                },
                {
                    name: '转化为订单',
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color: '#17f9a8'
                        }
                    },
                    barWidth: 20,
                    yAxisIndex: 1,
                    data: [0, 0, 0, 0, 0, 0, 0]
                }]
        },
        diagramSummary: {
            summary: [],
            linkTitle: ''
        }
    };
}

export function memberDiagram() {
    return {
        open: true,
        className: 'member-diagram_1',
        title: '会员与粉丝转化',
        diagramWidth: '100%',
        diagramHeight: '310px',
        echatOption: {
            legend: {
                left: 20,
                top: 10,
                data: [{name: '转化为会员', icon: 'roundRect'}, {name: '转化为粉丝', icon: 'roundRect'}]
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                textStyle: {
                    fontSize: 12,
                    lineHeight: 14
                }
            },
            grid: {
                left: '3%',
                right: '12%',
                bottom: '12%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: true,
                data: []
            },
            yAxis: {
                type: 'value',
                min: 0,
                axisLabel: {
                    show: true,
                    interval: 'auto',
                },
                splitLine: {
                    lineStyle: {
                        color: '#eeeeee'
                    }
                }
            },
            /* dataZoom: [{
                 type: 'inside',
                 start: 0,
                 end: 100,
                 zoomOnMouseWheel: false
             }, {
                 start: 0,
                 end: 100,
                 handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                 handleSize: '80%',
                 handleStyle: {
                     color: '#fff',
                     shadowBlur: 3,
                     shadowColor: 'rgba(0, 0, 0, 0.6)',
                     shadowOffsetX: 2,
                     shadowOffsetY: 2
                 }
             }],*/
            series: [
                {
                    name: '转化为会员',
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                        normal: {
                            color: '#17f9a8'
                        }
                    },
                    data: [0, 0, 0, 0, 0, 0, 0]
                },
                {
                    name: '转化为粉丝',
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                        normal: {
                            color: '#7b5eea'
                        }
                    },
                    data: [0, 0, 0, 0, 0, 0, 0]
                }]
        },
        diagramSummary: {
            summary: [],
            linkTitle: ''
        }
    };
}
