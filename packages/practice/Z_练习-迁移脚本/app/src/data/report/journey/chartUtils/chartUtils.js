import echarts from 'echarts/lib/echarts';

/**
 * get echarts instance
 * @param dom
 * @return {echarts~ECharts}
 */
export function getChartInstance(dom) {
    return echarts.getInstanceByDom(dom) || echarts.init(dom);
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


/**
 * echarts 显示loading
 * @param chart
 */
export function showLoading(chart) {
    chart.showLoading({
        text: '',
        color: '#ff4574',
        textColor: '#000',
        maskColor: 'rgba(255, 255, 255, 0.8)',
        zlevel: 0
    });
}


/**
 * echarts 隐藏loading
 * @param chart
 */
export function hideLoading(chart) {
    chart.hideLoading();
}


/**
 * @param {Function} cb
 * @param {Number} delay
 */
export function throttle(cb, delay = 200) {
    let renderTimer = null;
    return function (...args) {
        clearTimeout(renderTimer);
        renderTimer = setTimeout(() => {
            clearTimeout(renderTimer);
            cb.apply(this, args);
        }, delay);
    };
}


/**
 * 数字数组求和
 * @param numbers
 */
export const sum = numbers => numbers.reduce((acc, cur) => acc + Number(cur), 0);
