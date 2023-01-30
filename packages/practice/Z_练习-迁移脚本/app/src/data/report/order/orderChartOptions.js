/**
 * Created by Administrator on 2017/10/17
 */
import {translate as t} from '@/locales';

export function offlineOrderDiagram1() {
    return {
        // 需要传入一个open表示该图是否显示(需要联系销售经理), className作为echat容器的类名, title作为echat标题, diagramWidth控制echat容器大小, echatOption是echat的配置项
        open: true,
        className: 'offline1',
        title: t('home.orderCount'),
        diagramWidth: '100%',
        diagramHeight: '310px',
        // ajax返回的是每一天的数据, array<obj>
        dataFromAjax: [],
        echatOption: {
            legend: {
                left: 20,
                top: 10,
                data: [{name: t('home.orderTotal'), icon: 'roundRect'}, {name: '受邮件影响', icon: 'roundRect'}, {
                    name: t('home.impactBySMS'),
                    icon: 'roundRect'
                }, {name: t('home.impactByWeChat'), icon: 'roundRect'}]
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
                right: '8%',
                bottom: '12%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: []
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
                    name: t('home.orderTotal'),
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#0cc2a9'
                        }
                    },
                    data: []
                },
                {
                    name: t('home.impactByEmail'),
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#17f9a8'
                        }
                    },
                    data: []
                },
                {
                    name: t('home.impactBySMS'),
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#7b5eea'
                        }
                    },
                    data: []
                },
                {
                    name: t('home.impactByWeChat'),
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#00f0ff'
                        }
                    },
                    data: []
                }]
        },
        // diagramSummary是图标右边栏的数据。 如果有数据，组件宽度会是标准1050px; 如果没有侧边栏，850px
        diagramSummary: {
            summary: [],
            linkTitle: ''
        }
    };
}

export function offlineOrderDiagram2() {
    return {
        open: true,
        className: 'offline2',
        title: '',
        diagramWidth: '100%',
        diagramHeight: '310px',
        dataFromAjax: [],
        echatOption: {
            legend: {
                left: 20,
                top: 10,
                data: [{name: t('home.orderTotal'), icon: 'roundRect'}, {name: t('home.impactByDmartech'), icon: 'roundRect'}]
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
                    name: t('home.orderTotal'),
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#7b5eea'
                        }
                    },
                    data: []
                },
                {
                    name: t('home.impactByDmartech'),
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color: '#17f9a8'
                        }
                    },
                    barWidth: 6,
                    data: []
                }]
        },
        diagramSummary: {
            summary: [],
            linkTitle: ''
        }
    };
}

export function offlineOrderDiagram3() {
    return {
        open: true,
        className: 'offline3',
        title: '',
        diagramWidth: '100%',
        diagramHeight: '310px',
        dataFromAjax: [],
        echatOption: {
            legend: {
                left: 20,
                top: 10,
                data: [t('home.orders')]
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
                right: '8%',
                top: '20%',
                bottom: '18%',
                containLabel: {
                    show: true,
                    itemStyle: {
                        borderColor: 'red'
                    }
                },

            },
            xAxis: {
                type: 'value',
                min: 0
            },
            yAxis: {
                type: 'category',
                axisTick: {
                    show: false

                },
                data: [{value: '00:00'}, {
                    value: '02:00',
                    textStyle: {color: 'transparent'}
                }, {value: '04:00'}, {
                    value: '06:00',
                    textStyle: {color: 'transparent'}
                }, {value: '08:00'}, {
                    value: '10:00',
                    textStyle: {color: 'transparent'}
                }, {value: '12:00'}, {
                    value: '14:00',
                    textStyle: {color: 'transparent'}
                }, {value: '16:00'}, {
                    value: '18:00',
                    textStyle: {color: 'transparent'}
                }, {value: '20:00'}, {value: '22:00', textStyle: {color: 'transparent'}}]
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 100,
                    zoomOnMouseWheel: false
                },
                {
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
                }
            ],
            series: [
                {
                    name: t('home.orders'),
                    type: 'bar',
                    barWidth: 8,
                    itemStyle: {
                        normal: {
                            color: '#a070ec'
                        }
                    },
                    data: []
                }
            ]
        },
        diagramSummary: {
            summary: [],
            linkTitle: ''
        }
    };
}

export function offlineOrderDiagram4() {
    return {
        open: true,
        className: 'offline4',
        title: '',
        diagramWidth: '100%',
        diagramHeight: '310px',
        dataFromAjax: [],
        echatOption: {
            legend: {
                left: 20,
                top: 10,
                data: [t('home.orders')]
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
                top: '20%',
                bottom: '18%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: [t('common.monday'),
                    t('common.tuesday'),
                    t('common.wednesday'),
                    t('common.thursday'),
                    t('common.friday'),
                    t('common.saturday'),
                    t('common.sunday')]
            },
            yAxis: {
                type: 'value',
                min: 0,
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
                    name: t('home.orders'),
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color: '#34d4e3'
                        }
                    },
                    barWidth: 30,
                    data: []
                }]
        },
        diagramSummary: {
            summary: [],
            linkTitle: ''
        }
    };
}

export function goodsClass() {
    return {
        open: true,
        className: 'goods-class1',
        title: t('report.hotSale'),
        diagramWidth: '100%',
        diagramHeight: '310px',
        dataFromAjax: [],
        echatOption: {
            backgroundColor: '#ffffff',
            legend: {
                left: 20,
                top: 10,
                data: [
                    t('report.classification1'),
                    t('report.classification2'),
                    t('report.classification3'),
                    t('report.classification4'),
                    t('report.classification5'),
                    t('report.classification6'),
                    t('report.classification7')
                ]
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b} : {c}%'
            },
            series: [
                {
                    name: '',
                    type: 'pie',
                    radius: ['30%', '55%'],
                    labelLine: {
                        normal: {
                            smooth: true
                        },
                    },
                    label: {
                        normal: {
                            color: '#666666'
                        },
                    },
                    data: [
                        {
                            value: '0',
                            name:  t('report.classification1'),
                            itemStyle: {
                                normal: {
                                    borderWidth: 6,
                                    borderColor: '#ffffff',
                                    color: '#4ffbbf'
                                }
                            }
                        },
                        {
                            value: '0',
                            name:  t('report.classification2'),
                            itemStyle: {
                                normal: {
                                    borderWidth: 6,
                                    borderColor: '#ffffff',
                                    color: '#0cc2a9'
                                }
                            }
                        },
                        {
                            value: '0',
                            name:  t('report.classification3'),
                            itemStyle: {
                                normal: {
                                    borderWidth: 6,
                                    borderColor: '#ffffff',
                                    color: '#7b5eea'
                                }
                            }
                        },
                        {
                            value: '0',
                            name:  t('report.classification4'),
                            itemStyle: {
                                normal: {
                                    borderWidth: 6,
                                    borderColor: '#ffffff',
                                    color: '#ffa87d'
                                }
                            }
                        },
                        {
                            value: '0',
                            name:  t('report.classification5'),
                            itemStyle: {
                                normal: {
                                    borderWidth: 6,
                                    borderColor: '#ffffff',
                                    color: '#34d4e3'
                                }
                            }
                        },
                        {
                            value: '0',
                            name: t('report.classification6'),
                            itemStyle: {
                                normal: {
                                    borderWidth: 6,
                                    borderColor: '#ffffff',
                                    color: '#3a80ff'
                                }
                            }
                        },
                        {
                            value: '0',
                            name: t('report.classification7'),
                            itemStyle: {
                                normal: {
                                    borderWidth: 6,
                                    borderColor: '#ffffff',
                                    color: '#767676'
                                }
                            }
                        }
                    ]
                }
            ]
        },
        diagramSummary: {
            summary: [],
            linkTitle: ''
        }
    };
}

export function goodsCategory() {
    return {
        open: true,
        className: 'goods-category1',
        title: t('report.hotSaleCategory'),
        diagramWidth: '100%',
        diagramHeight: '310px',
        echatOption: {
            backgroundColor: '#ffffff',
            legend: {
                left: 20,
                top: 10,
                data: [
                    t('report.category1'),
                    t('report.category2'),
                    t('report.category3'),
                    t('report.category4'),
                    t('report.category5'),
                    t('report.category6'),
                    t('report.category7')
                ]
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b} : {c}%'
            },
            series: [
                {
                    name: '',
                    type: 'pie',
                    radius: ['30%', '55%'],
                    labelLine: {
                        normal: {
                            smooth: true
                        },
                    },
                    label: {
                        normal: {
                            color: '#666666'
                        },
                    },
                    data: [
                        {
                            value: '0',
                            name: t('report.category1'),
                            itemStyle: {
                                normal: {
                                    borderWidth: 6,
                                    borderColor: '#ffffff',
                                    color: '#4ffbbf'
                                }
                            }
                        },
                        {
                            value: '0',
                            name: t('report.category2'),
                            itemStyle: {
                                normal: {
                                    borderWidth: 6,
                                    borderColor: '#ffffff',
                                    color: '#0cc2a9'
                                }
                            }
                        },
                        {
                            value: '0',
                            name: t('report.category3'),
                            itemStyle: {
                                normal: {
                                    borderWidth: 6,
                                    borderColor: '#ffffff',
                                    color: '#7b5eea'
                                }
                            }
                        },
                        {
                            value: '0',
                            name: t('report.category4'),
                            itemStyle: {
                                normal: {
                                    borderWidth: 6,
                                    borderColor: '#ffffff',
                                    color: '#ffa87d'
                                }
                            }
                        },
                        {
                            value: '0',
                            name: t('report.category5'),
                            itemStyle: {
                                normal: {
                                    borderWidth: 6,
                                    borderColor: '#ffffff',
                                    color: '#34d4e3'
                                }
                            }
                        },
                        {
                            value: '0',
                            name: t('report.category6'),
                            itemStyle: {
                                normal: {
                                    borderWidth: 6,
                                    borderColor: '#ffffff',
                                    color: '#3a80ff'
                                }
                            }
                        },
                        {
                            value: '0',
                            name: t('report.category7'),
                            itemStyle: {
                                normal: {
                                    borderWidth: 6,
                                    borderColor: '#ffffff',
                                    color: '#767676'
                                }
                            }
                        }
                    ]
                }
            ]
        },
        diagramSummary: {
            summary: [],
            linkTitle: ''
        }
    };
}

export function unitPriceAnalysis() {
    return {
        open: true,
        className: 'unit-price1',
        title: t('report.unitPriceAnalysis'),
        diagramWidth: '100%',
        diagramHeight: '310px',
        dataFromAjax: [],
        echatOption: {
            legend: {
                left: 20,
                top: 20,
                data: [{name: t('report.memberUnitPrice'), icon: 'roundRect'}, {name:  t('report.noMemberUnitPrice'), icon: 'roundRect'}, {
                    name: t('report.followerUnitPrice'),
                    icon: 'roundRect'
                }]
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
                left: '2.5%',
                right: '5%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: true,
                interval: 10,
                data: []
            },
            yAxis: {
                type: 'value',
                min: 0,
                axisLabel: {
                    show: true,
                    interval: 'auto'
                },
                splitLine: {
                    lineStyle: {
                        color: '#eeeeee'
                    }
                }
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 100,
                    zoomOnMouseWheel: false
                },
                {
                    start: 0,
                    end: 100,
                    handleIcon: `M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z`,
                    handleSize: '100%',
                    handleStyle: {
                        color: '#fff',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    }
                }
            ],
            series: [
                {
                    name: t('report.memberUnitPrice'),
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#7b5eea'
                        }
                    },
                    data: []
                },
                {
                    name: t('report.noMemberUnitPrice'),
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color: '#17f9a8'
                        }
                    },
                    barWidth: 10,
                    data: []
                },
                {
                    name: t('report.followerUnitPrice'),
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color: '#0cc2a9'
                        }
                    },
                    barWidth: 10,
                    data: []
                }

            ]
        },
        diagramSummary: {
            summary: [],
            linkTitle: ''
        }
    };
}

export function sellWayRatio() {
    return {
        open: false,
        className: 'sell-way1',
        title: t('report.channelPercentage'),
        diagramWidth: '100%',
        diagramHeight: '310px',
        echatOption: {
            series: [
                {type: 'line'}
            ]
        },
        diagramSummary: {
            summary: [],
            linkTitle: ''
        }
    };
}


export function offlineTerminal() {
    return {
        open: false,
        className: 'offline-terminal1',
        title: t('report.orderTerminalPercentage'),
        diagramWidth: '100%',
        diagramHeight: '310px',
        echatOption: {
            series: [
                {type: 'pie'}
            ]
        },
        diagramSummary: {
            summary: [],
            linkTitle: ''
        }
    };
}
