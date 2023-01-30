/**
 * Created by Administrator on 2017/10/18
 */
import {translate as t} from '@/locales';

export function offlineOrderDiagram() {
    return {
        // 需要传入一个open表示该是否显示(需要联系销售经理), className作为echat容器的类名, title作为echat标题, diagramWidth控制echat容器大小, echatOption是echat的配置项
        open: true,
        className: 'offline',
        title: t('home.orderCount'),
        diagramWidth: '100%',
        diagramHeight: '310px',
        // ajax返回的是每一天的数据, array<obj>
        dataFromAjax: [],
        echatOption: {
            legend: {
                left: 20,
                top: 20,
                data: [
                    {name: t('home.orderTotal'), icon: 'roundRect'},
                    {name: t('home.impactByEmail'), icon: 'roundRect'},
                    {name: t('home.impactBySMS'), icon: 'roundRect'},
                    {name: t('home.impactByWeChat'), icon: 'roundRect'}
                ]
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
                right: '6%',
                bottom: '15%',
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
            summary: [
                {number: 0, type: 'number', text: t('home.ordersImpactByDmartech')},
                {number: 0, type: 'cash', text: t('home.orderAmountImpactByDmartech')},
                {number: 0, type: 'percent', text: t('home.orderRatioImpactByDmartech')}
            ],
            linkTitle: t('home.moreOrderReports'),
            link: 'orderReport'
        }
    };
}


export function fansDiagram() {
    return {
        open: true,
        className: 'fans',
        title: t('home.trendReport'),
        diagramWidth: '100%',
        diagramHeight: '310px',
        dataFromAjax: [],
        echatOption: {
            legend: {
                left: 20,
                top: 20,
                data: [
                    {name: t('home.allData'), icon: 'roundRect'},
                    {name: t('home.onlyMobile'), icon: 'roundRect'},
                    {name: t('home.onlyWeChat'), icon: 'roundRect'},
                    {name: t('home.onlyEmail'), icon: 'roundRect'}
                ]
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
                right: '6%',
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
                    name: t('home.allData'),
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#7b5eea'
                        }
                    },
                    data: []
                },
                {
                    name: t('home.onlyMobile'),
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
                    name: t('home.onlyWeChat'),
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color: '#0cc2a9'
                        }
                    },
                    barWidth: 10,
                    data: []
                },
                {
                    name: t('home.onlyEmail'),
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color: '#00f0ff'
                        }
                    },
                    barWidth: 10,
                    data: []
                }]
        },
        diagramSummary: {
            summary: [
                {number: 0, type: 'percent', text: t('home.emailCompletedRatio')},
                {number: 0, type: 'percent', text: t('home.mobileCompleteRatio')},
                {number: 0, type: 'percent', text: t('home.wechatCompleteRatio')}
            ],
            linkTitle: t('home.moreContactReports'),
            link: 'dataReport'
        }
    };
}

export function marketDiagram() {
    return {
        open: true,
        className: 'market',
        title: t('home.marketingReport'),
        diagramWidth: '100%',
        diagramHeight: '310px',
        dataFromAjax: [],
        echatOption: {
            legend: {
                left: 20,
                top: 20,
                data: [
                    {name: t('home.convertOrderAmount'), icon: 'roundRect'},
                    {name: t('home.convertOrders'), icon: 'roundRect'}
                ]
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
                right: '7%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: true,
                interval: 10,
                data: []
            },
            yAxis: [
                {
                    type: 'value',
                    min: 0,
                    axisLabel: {
                        show: true,
                        interval: 'auto',
                        formatter: '￥{value}'
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
                        interval: 'auto'
                    }
                }
            ],
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
                }],
            series: [
                {
                    name: t('home.convertOrderAmount'),
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#7b5eea'
                        }
                    },
                    data: []
                },
                {
                    name: t('home.convertOrders'),
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color: '#17f9a8'
                        }
                    },
                    yAxisIndex: 1,
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

export function customerDiagram() {
    return {
        open: true,
        className: 'offline',
        title: '',
        diagramWidth: '100%',
        diagramHeight: '310px',
        // ajax返回的是每一天的数据, array<obj>
        dataFromAjax: [],
        echatOption: {
            legend: {
                left: 20,
                top: 20,
                data: [
                    {name: t('home.realNameCustomer'), icon: 'roundRect'},
                    {name: t('home.anonymousCustomer'), icon: 'roundRect'},
                    {name: t('home.WeChatFansCustomer'), icon: 'roundRect'},
                    {name: t('home.allCustomers'), icon: 'roundRect'}
                ]
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
                right: '6%',
                bottom: '15%',
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
                    name: t('home.realNameCustomer'),
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#0cc2a9'
                        }
                    },
                    data: []
                },
                {
                    name: t('home.anonymousCustomer'),
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#17f9a8'
                        }
                    },
                    data: []
                },
                {
                    name: t('home.WeChatFansCustomer'),
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#7b5eea'
                        }
                    },
                    data: []
                },
                {
                    name: t('home.allCustomers'),
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#00f0ff'
                        }
                    },
                    data: []
                }]
        },
        diagramSummary: {
            summary: [],
            linkTitle: '',
            link: ''
        }
    };
}
