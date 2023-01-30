// import Model from 'web-model';
// import LINKS from './LINKS';
// import rootStore from './store/vuex/rootStore';

// const errorMonitor = new Model({
//     base: LINKS.REALY_API_BASE,
//     api: {
        
//         /**
//          * elk前端日志打印
//          * @param {String} message
//          * @return {*}
//          */
//         push(message) {
//             const env = String(process.env.NODE_ENV);
//             const userName = rootStore.state.user.userName;
//             return this.request
//                 .post('/api/v1/printMessage')
//                 .escape('after')
//                 .query({
//                     // [环境] [用户名] [功能模块] 报错文件 方法名 错误信息
//                     message: `[${env}] [${userName}] ${location.pathname + location.search} ${message}`
//                 });
//         }
        
//     }
// });

/**
 * 打印异常，并推送到监控系统（因占用过多网关请求，v2.5.9暂时屏蔽推送错误，仅本地打印）
 * @param message
 */
export function logError(message) {
    console.error(message);
    // if (process.env.NODE_ENV === 'production' && rootStore.state.user.authorization && navigator.onLine === true) {
    //     errorMonitor.push(typeof message === 'string' ? message : JSON.stringify(message));
    // }
}


/**
 * 记录事件
 * @param {String} eventName
 * @param {Object} details
 */
export function trackEvent(eventName, details) {
    if (process.env.NODE_ENV === 'production' && window.zhuge) {
        // 诸葛IO 记录事件
        window.zhuge.track(eventName, details);
    }
}
