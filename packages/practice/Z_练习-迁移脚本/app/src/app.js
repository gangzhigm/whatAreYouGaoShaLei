/**
 * webpack entry
 */

// import '@babel/polyfill';
import Vue from 'vue';
import Plugins from '@/common/vue-plugin';
import I18N, {getFirstBrowserLanguage, I18N_STORE_NAME, LANGUAGE_CHANGE, translate} from '@/locales';
import { logError } from './monitor';
import { CLEAR_USER_INFO, SET_AUTH_LOCK } from '@/store/vuex/mutationTypes';
import {
    LOAD_LANGUAGE,
    SIGNED_IN,
    SIGNED_OUT,
    LOGIN_IN,
} from '@/store/vuex/actionTypes';
import './common/scss/index.scss';
import './common/fonts/iconfont';
import VueClipboard from 'vue-clipboard2';
import VueTelInput from 'vue-tel-input';
import {PRIVATE_DEVELOPMENT} from './private';
import { store, getReady } from '@/store';
import { router } from '@/routes';
import bootstrapHook from './core/bootstrap';
import { embeddedCode } from './embeddedCode';

// localstorage设置环境参数
switch (process.env.NODE_ENV) {
    /**
     * 开发服
     */
    case 'dev':
        localStorage.setItem('node_env', 'dev');
        break;
    /**
     * beta
     */
    case 'beta':
        localStorage.setItem('node_env', 'beta');
        break;
    /**
     * production
     */
    case 'production':
        localStorage.setItem('node_env', 'production');
        break;
    default:
        localStorage.setItem('node_env', 'development');
        break;
}

// 私有化部署打印时才打印
if (PRIVATE_DEVELOPMENT) {
    console.info('Private');
}

Vue.use(VueClipboard);
Vue.use(VueTelInput);

// Vue 开发选项
if (process.env.NODE_ENV !== 'production') {
    Vue.config.devtools = true;
    Vue.config.performance = true;
    Vue.config.productionTip = false;
}
if (process.env.NODE_ENV === 'production') {
    Vue.config.errorHandler = (err, vm, info) => {
        // handle error
        // `info` is a Vue-specific error info, e.g. which lifecycle hook
        // the error was found in. Only available in 2.2.0+
        logError(`<${vm.name}/> ${info} ${err}`);
    };
    window.onerror = logError;
}

/**
 * Vue 公用方法、插件
 */
Vue.use(Plugins);

/**
 * I18n
 */
Vue.use(I18N);
// detect the language change
if ('onlanguagechange' in window) {
    window.onlanguagechange = function () {
        const newLang = getFirstBrowserLanguage();
        if (newLang !== store.state[I18N_STORE_NAME].lang) {
            store.dispatch(LOAD_LANGUAGE, newLang);
        }
    };
}


/**
 * 浏览器多个 tab 页、窗口间的通信
 * localStorage event listener
 */
window.addEventListener('storage', function (e) {
    switch (e.key) {
        // 其他 tab 登出
        case SIGNED_OUT:
            store.commit(CLEAR_USER_INFO);
            store.commit(SET_AUTH_LOCK, {
                title: translate('common.needLogin'),
                message: translate('common.reLogin')
            });
            break;
        // 其他 tab 登录
        case SIGNED_IN:
            store.dispatch(SIGNED_IN);
            break;
        // 切换语言
        case LANGUAGE_CHANGE:
            if (e.newValue) {
                store.dispatch(LOAD_LANGUAGE, e.newValue);
            }
            break;
        // 其他 tab 页，login页登录操作
        case LOGIN_IN:
            location.reload();
            break;
        // 其他tab页切换语言刷新
        case 'LANGUAGE_PREFERENCE':
            location.reload();
            break;
    }
});

getReady().then(() => {
    /**
     * Vue SPA Start
     */
    new Vue({
        /* eslint no-unused-vars: 0 */
        render: h => (<router-view/>),
        el: '#app',
        created: bootstrapHook,
        store,
        router
    });
});

/**
 * 华为页面埋码
 */
Vue.use(embeddedCode);