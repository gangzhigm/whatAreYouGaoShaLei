/*
 * @Author: DeanLee
 * @Date: 2021-03-12 15:30:31
 * @Last Modified by: Deanlee
 * @Last Modified time: 2021-03-15 10:21:27
 */
import Vue from 'vue';
import Vuex from 'vuex';
import Model from 'web-model';
import rootStore from '@/store/vuex/rootStore';
import { router, getRoutesByMenuRecords } from '@/routes';
import { SET_PLUGIN_ROUTES, CLEAR_USER_INFO, SET_AUTH_LOCK } from '@/store/vuex/mutationTypes';
import {
    RECOVER_LANGUAGE,
    RECOVER_USER_INFO,
    UPDATE_ACCOUNT_BALANCE,
    RESTORE_SIDE_BAR
} from '@/store/vuex/actionTypes';
import { I18N_STORE_NAME, translate} from '@/locales';
import { logError } from '@/monitor';


/**
 * vuex
 */
Vue.use(Vuex);

const store = new Vuex.Store(rootStore);

const getReady = () => {
    return new Promise(function(resolve) {
        // recover previous language setting, navigator.language as default.
        // this recover is an async action
        const app = new Vue();
        store.dispatch(RECOVER_LANGUAGE)
            .then(() => {
                /**
                 * API接口拦截器
                 */
                let errorCount = 0;
                Model.use({
                    beforeEach: function (next) {
                        if (errorCount >= 3) {
                            console.warn('请求数据多次异常，请检查网络连接、后台服务状态是否正常。');
                        }

                        let isAuthID = this.header.wechat_id;
                        // bear the jwt token
                        if (store.state.user.authorization) {
                            let token = 'Bearer ' + store.state.user.authorization;
                            window.localStorage.setItem('token', token);
                            this.set('Authorization', token);
                            if (!isAuthID) this.set('wechat_id', store.state.user.authorizerInfoId); // 微信
                            this.set('app_id', store.state.user.appId); // 微信
                            // i18n setting
                            this.set('Accept-Language', store.state[I18N_STORE_NAME].lang);
                            next();
                        } else {
                            next(false);
                            console.warn(`没有token访问需要权限的接口: ${this.url}`);
                            store.commit(SET_AUTH_LOCK, {
                                title: translate('common.needLogin'),
                                message: translate('common.needToLogin')
                            });
                        }
                    },
                    afterEach: function (err, res) {
                        // 请求异常
                        if (err) {
                            errorCount++;

                            // 登录信息过期
                            if (err.status === 401) {
                                store.commit(CLEAR_USER_INFO);
                                store.commit(SET_AUTH_LOCK, {
                                    title: translate('common.needLogin'),
                                    message: translate('common.expired')
                                });
                            } else {
                                // 状态码
                                let statusCode = res && res.body && res.body.code
                                    ? res.body.code
                                    : err.status;
                                // 异常信息字符串
                                let message = `[${statusCode}] ${this.method.toUpperCase()} ${this.url}`;

                                if (statusCode === 403) {
                                    console.warn(`访问接口权限不够: ${this.url}`);
                                    store.commit(SET_AUTH_LOCK, {
                                        title: translate('common.needAuth'),
                                        message: translate('common.noAuth') + `<blockquote><code>${this.method}</code><br><code>${this.url}</code></blockquote>`
                                    });
                                } else {
                                    if (res && res.body && res.body.message) {
                                        message += res.body.message;
                                        app.$toast(res.body.message, 'warn');
                                    }
                                }

                                logError(message);
                            }

                            return false;
                        }

                        // 请求正常，返回的数据在业务上不合理，code !== 200 表征不合理
                        if (!res || !res.body || !res.body.code) return;
                        if (res.body.code !== 200) {
                            let message = `[${res.body.code}] ${this.method.toUpperCase()} ${this.url} ${res.body.message}`;
                            logError(message);
                            if (res.body.message) app.$toast(res.body.message, 'warn');
                            return false;
                        }

                        // 请求正常，数据正常，重置接口报错记录
                        errorCount = 0;
                    }
                });
                // 恢复分组侧边栏折叠状态
                store.dispatch(RESTORE_SIDE_BAR);
                /**
                 * 恢复状态 & 更新数据
                 */
                if (!store.state.user.authorization) {
                    // 立即恢复用户信息
                    store.dispatch(RECOVER_USER_INFO);

                    if (store.state.user.authorization) {
                        // 更新账户余量
                        store.dispatch(UPDATE_ACCOUNT_BALANCE);

                        // 根据菜单权限注册路由
                        if (store.state.user.menus && Object.keys(store.state.user.menus).length) {
                            let [routes, pluginRoutes] = getRoutesByMenuRecords(store.state.user.menus);
                            router.addRoutes(routes);
                            store.commit(SET_PLUGIN_ROUTES, pluginRoutes);
                        }
                    }
                }
                resolve();
            });
    });
};

export { store, getReady };
