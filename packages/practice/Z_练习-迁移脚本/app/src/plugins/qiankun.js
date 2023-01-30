import { registerMicroApps, start, addGlobalUncaughtErrorHandler } from 'qiankun';
import { store } from '@/store';
import { SET_APP_ERR, RESET_APP_ERR } from '@/store/vuex/mutationTypes';

// 是否本地开发qiankun子应用（需要配合子项目同时启动本地服务）
const qiankunDevMode = process.env.QIANKUN === 'true';
// 是否处于开发模式：本地服务/开发服部署/Beta服部署
const isDevloping = ['development', 'dev', 'beta'].includes(process.env.NODE_ENV);
// const entry = qiankunDevMode ? '//localhost:9011/' : './sub-apps/home/';
const entry = qiankunDevMode ? '//localhost:9011/' : './sub-apps/home/';

// 微前端子应用配置
const apps = [
    {
        name: 'homeApp', // 应用的名字
        entry: entry, // 默认会加载这个html 解析里面的js 动态的执行 （子应用必须支持跨域）fetch
        container: '#home-spa-container', // 容器名（此项目页面中定义的容器id，用于把对应的子应用放到此容器中）
        activeRule: '/home', // 激活的路径
        props: { parentState: store.state } // 传递的值（可选）
    }
];

const lifeCycles = {
    // beforeLoad: app => isLocalEnv && console.warn('=> before load', app.name),
    // beforeMount: app => isLocalEnv && console.warn('=> before mount', app.name),
    afterMount: () => {
        if (window.proxy.__QIANKUN_SUB_APP_VM_HOME__ && isDevloping) {
            const subDiv = document.createElement('div');
            subDiv.__vue__ = window.proxy.__QIANKUN_SUB_APP_VM_HOME__;
            document.body.appendChild(subDiv);
        }
        store.commit(RESET_APP_ERR, 'home');
    }
};// 注册应用

// 初始化qiankun框架，必须在应用容器Dom加载后执行
function startQiankun () {
    registerMicroApps(apps, lifeCycles);
    // setDefaultMountApp('/home')
    addGlobalUncaughtErrorHandler(event => {
        console.error('_globalUncaughtError', event);
        const subAppDied = event.error ? event.error.toString().indexOf('died in status LOADING_SOURCE_CODE') > -1 : false;
        subAppDied && store.commit(SET_APP_ERR, 'home');
    });
    start({
        prefetch: true // 预加载
    });
}

export default startQiankun;