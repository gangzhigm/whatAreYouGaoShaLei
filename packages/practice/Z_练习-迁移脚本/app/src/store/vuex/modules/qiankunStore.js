import { SET_APP_ERR, RESET_APP_ERR } from '../mutationTypes';
const qiankunStore = {
    state: {
        // 加载失败的微应用 true=加载异常，false=无异常
        appErrors: {
            home: false
        },
    },
    mutations: {
        // 提交子应用挂载错误状态，appName 子应用名
        [SET_APP_ERR] (state, appName) {
            state.appErrors[appName] = true;
        },
        // 重置子应用挂载错误状态
        [RESET_APP_ERR] (state, appName) {
            state.appErrors[appName] = false;
        }
    },
    getters: {
        // 子应用 “首页” 的挂载状态
        homeAppErr: (state) => {
            return state.appErrors.home;
        }
    }
};

export default qiankunStore;
