// import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/dataZoom';
import '../journey/_chart.scss';
const LINE_OPTIONS = {
    legend: {
        left: 20,
        top: 20,
        data: []
    },
    tooltip: {
        showContent: true
    },
    //底部区间轴设置
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
            handleColor: '#17f9a8',
            handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2
            },
            bottom: 30
        }
    ],
    // 图标主题设计
    grid: {
        left: '5%',
        right: '13%',
        bottom: '80px',
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
    series: []
};
const PIE_OPTIONS = {
    title: {
        text: '',
        x: 'center',
        y: 'center',
        textStyle: {
            fontWeight: 'normal',
            fontSize: 14,
            color: '#404040'
        }
    },
    tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    minAngle: 10,
    legend: {
        orient: 'horizontal',
        top: 20,
        x: 'center',
        data: []
    },
    calculable: false,
    series: [
        {
            name: '',
            type: 'pie',
            radius: [100, 140],
            x: '60%',
            width: '35%',
            funnelAlign: 'left',
            color: ['#0CC2A9', '#0000FF', '#FFCC00', '#99FFFF', '#800080', '#FF33CC', '#996633', '#FF3333'],
            label: {
                show: true,
                position: 'outside',
                formatter: `{b} : {c} ({d}%)`
            },
            data: []
        }
    ]
};

/**
 *
 * @param {Object} selected  选中筛选项
 * @param {Array} NameArr   数据名称列表
 */
export function setSeries(selected, NameArr) {
    let count = selected.count;
    let users = selected.users;
    let curSeries = count
        ? [
            {
                name: NameArr[0],
                type: 'line',
                itemStyle: {
                    normal: {
                        color: '#0CC2A9'
                    }
                },
                data: count
            },
            {
                name: NameArr[1],
                type: 'line',
                itemStyle: {
                    normal: {
                        color: '#0000FF'
                    }
                },
                data: users
            }
        ]
        : [
            {
                name: NameArr[0],
                type: 'line',
                itemStyle: {
                    normal: {
                        color: '#0000FF'
                    }
                },
                data: users
            }
        ];
    return curSeries;
}
/**
 * 汇总：渠道发送概况
 * @param {Array} xAxisData 横坐标数组
 * @returns {Object}
 */
export function setOptions(xAxisData, legendDataArr, curSeriesArr) {
    
    let options = LINE_OPTIONS;
    options.legend.data = legendDataArr;
    options.xAxis.data = xAxisData;
    options.series = curSeriesArr;
    return options;
}

/**
 * 初始化饼状图
 *  @param {*} 
 *  @return {}
 */
export function setPieOptions (title, legendDataArr, curSeriedsArr){
    let options = PIE_OPTIONS;
    options.title.text = title;
    options.legend.data = legendDataArr;
    options.series[0].data = curSeriedsArr;
    options.series.name = title;
    return options;
}