/**
 * Created by naeemo on 2017/4/7.
 */

import {
    ADD_A_TRANSLATION,
    CLEAR_USER_INFO,
    LOADED,
    LOADING,
    SET_AUTH_LOCK,
    SET_PLUGIN_ROUTES,
    SET_USER_INFO,
    UPDATE_USER_INFO,
    SET_TOKEN,
    SWITCH_SIDE_BAR,
    SHOW_SIDE_BAR
} from './mutationTypes';
import {
    RECOVER_USER_INFO,
    SIGN_IN,
    SIGN_OUT,
    SIGNED_IN,
    SIGNED_OUT,
    UPDATE_ACCOUNT_BALANCE,
    UPDATE_MENU_AUTH,
    UPDATE_WECHAT_ACCOUNT_INFO,
    GET_TOKEN,
    RESTORE_SIDE_BAR
} from './actionTypes';
import {I18N_STORE_NAME, store as i18n, translate} from '@/locales';
import { JourneyApiV1, ManageApi, GeteOriginApi, WechatApiV1 } from '@/api';
import qiankunStore from './modules/qiankunStore';

/**
 * 用户信息缓存 key
 * @type {string}
 */
export const USER_INFO_SESSION_KEY = String(process.env.NODE_ENV)
    .toUpperCase() + '_USER_INFO';

export default {
    strict: process.env.NODE_ENV !== 'production',
    state: {
        user: {
            authorization: '',  // JWT
            isSubscriptionAccount: false,   // 绑定公众号是否为微信订阅号
            cid: '',            // 用户ID
            authorizerInfoId: '',   // 联系人公众号authorizerInfoId
            isWx: 1,            // 账号是否开通了微信相关的功能
            email: '',          // 用户邮箱地址
            phone: '',          // 用户手机号
            areaCode: '',       // 区号
            iso2: '',           // 国家代码
            onlineTime: '',     // 上线时间
            userName: '',       // 用户名
            loginCount: 0,      // SCRM 登录次数
            id: '',
            isAdmin: 0,
            isAppreciationTemplate: 0,
            isAuthorty: 0,
            isTemplateShop: 0,
            isWxCount: '',
            smsSurplus: 0,      // 短信余量
            mmsSurplus: 0,
            smsAbroadSurplus: 0,
            mealName: '',       // 套餐版本
            validTime: '',      // 套餐有效期，无限期为空
            menus: {},          // 可见路由记录, key 是 routeName, value 是后台返回的 menu 对象
            permissions: {},    // 权限记录, key 是 flag权限唯一标识, value 是后台返回的 menu 对象
            canApproval: false, // 旅程审批权限（是否可编辑）
            approvalState: false, // 旅程审批状态
            canTWoFactor: false, // 两步验证权限（是否可编辑）
            twoFactorOpen: false,// 两步验证是否开启
            passTwoFactorOpen: false,  //两步验证(验证码)是否通过
            companyType: 0,     // 用户类型 0 普通用户 1 华为用户 2世邦用户 3颇尔账号
            timeZone: '',       // 系统设置时区
            language: '',       // 系统设置语言
            createDate: '',  // 账号开始使用时间
            isNikeCount: false, // 是否是 nike 账号
            configStatus: 1,     // 是否配置公众号 0已配置，1未配置
            companyDto: {}
        },
        pluginRoutes: [],       // 插件路由
        authLock: {
            title: '',
            message: ''
        },
        loading: false,          // 加载中
        tokenValue: {},
        sidebarCollapsed: false, // leftSidebar组件收起
        sidebarShow: false // leftSidebar实例是否存在
    },
    modules: {
        [I18N_STORE_NAME]: i18n,
        qiankunStore
    },
    mutations: {
        [SET_USER_INFO](state, user) {
            state.user = user;
        },
        /**
         * 更新 user 对象上的部分字段
         * @param state
         * @param partialUser
         */
        [UPDATE_USER_INFO](state, partialUser) {
            for (const key in partialUser) {
                if (partialUser.hasOwnProperty(key)) {
                    state.user[key] = partialUser[key];
                }
            }
        },
        [CLEAR_USER_INFO](state) {
            for (let key in state.user) {
                if (state.user.hasOwnProperty(key))
                    state.user[key] = '';
            }

            localStorage.removeItem(USER_INFO_SESSION_KEY);
            localStorage.removeItem(SET_TOKEN);
        },
        [SET_AUTH_LOCK](state, {title = '', message = ''}) {
            state.authLock.title = title;
            state.authLock.message = message;
        },
        [SET_PLUGIN_ROUTES](state, routes) {
            state.pluginRoutes = routes;
        },
        [LOADING](state) {
            state.loading = true;
        },
        [LOADED](state) {
            state.loading = false;
        },
        [SET_TOKEN](state, tokenValue) {
            state.tokenValue = tokenValue;
        },
        [SHOW_SIDE_BAR](state, show) {
            state.sidebarShow = show;
        },
        [SWITCH_SIDE_BAR](state, collapsed) {
            state.sidebarCollapsed = collapsed;
            localStorage.setItem('SIDEBAR_COLLAPSED', collapsed);
        },
    },
    actions: {
        [RECOVER_USER_INFO]({commit}) {
            const userJSON = localStorage.getItem(USER_INFO_SESSION_KEY);
            if (userJSON) {
                const user = JSON.parse(userJSON);
                // 如果是插件菜单，注册其翻译到 i18n 子状态树上
                for (const key in user.menus) {
                    const menu = user.menus[key];
                    if (menu.isPlugin) {
                        menu.translationKey = 'plugin.' + menu.showName;
                        commit(ADD_A_TRANSLATION, {
                            translationKey: menu.translationKey,
                            translationObj: {en: menu.showName, 'zh-CN': menu.menuName}
                        });
                    }
                }

                commit(SET_USER_INFO, user);
            }
        },
        [RESTORE_SIDE_BAR]({ commit }) {
            const sidebarStatus = JSON.parse(localStorage.getItem('SIDEBAR_COLLAPSED'));
            if (sidebarStatus === null) {
                commit(SWITCH_SIDE_BAR, false);
            } else {
                commit(SWITCH_SIDE_BAR, sidebarStatus);
            }
        },
        // 主动登入
        [SIGN_IN]({commit, state}, user) {
            // 1. 设置登录状态
            commit(SET_USER_INFO, user);
            localStorage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(state.user));
            // 2.设置账号类型
            localStorage.setItem('isHw', user.companyType);
            // 3. 通知其他标签页 'SIGNED_IN'
            localStorage.setItem(SIGNED_IN, (new Date).getTime());
            // 4. 诸葛io 识别用户
            // if (process.env.NODE_ENV === 'production') {
            //     let trimmedUser = Object.assign({}, user);
            //     delete trimmedUser.menus;
            //     delete trimmedUser.authentication;
            //     delete trimmedUser.authorizerInfoId;
            //     window.zhuge.identify(trimmedUser.userName, trimmedUser);
            // }
        },
        // 被动登录（其他标签页登录时，解锁当前视图）
        [SIGNED_IN]({commit, dispatch}) {
            // 设置登录状态
            dispatch(RECOVER_USER_INFO);
            // clear auth lock
            commit(SET_AUTH_LOCK, {});
        },
        // 主动登出
        [SIGN_OUT]({commit}) {
            // 1. 清除登录状态
            commit(CLEAR_USER_INFO);
            // 2. 通知其他标签页 SIGNED_IN
            localStorage.setItem(SIGNED_OUT, (new Date).getTime());
            // 3. 设置为普通账号
            localStorage.setItem('isHw', '0');
            // 4. 华为账号 清空导出的 type 、 uuid
            localStorage.setItem('HW_EXPORT_TYPE', '');
            localStorage.setItem('HW_EXPORT_UUID', '');
        },
        [UPDATE_ACCOUNT_BALANCE]({commit, state}) {
            // 获取短息余量
            return ManageApi
                .userProfile(state.user.email)
                .then(({body: {data: {profile: {
                    smsSurplus, validTime, mealName, mmsSurplus, smsAbroadSurplus, companyDto
                }}}}) => {
                    mealName = mealName || translate('home.basicPlan');
                    commit(UPDATE_USER_INFO, {
                        smsSurplus, validTime, mealName, mmsSurplus, smsAbroadSurplus, companyDto
                    });
                });
        },
        [GET_TOKEN]({commit, state}) {
            // 获取短信报告登录token
            return JourneyApiV1
                .getToken()
                .then(({body: {data}}) => {
                    commit(SET_TOKEN, data);
                    localStorage.setItem(GET_TOKEN, JSON.stringify(state.tokenValue));
                });
        },
        [UPDATE_WECHAT_ACCOUNT_INFO]({commit, state}, authorizerInfoId) {
            // 1. 获取当前账号已授权的微信公众号列表
            return WechatApiV1
                .getWechatAccounts()
                .then(({body: {data: {authorizerInfoList: accounts, configStatus}}}) => {
                    // 绑定状态更改，强制刷新页面，更新路由。
                    if (!isNaN(state.user.configStatus) && configStatus !== state.user.configStatus) location.reload();
                    if (accounts.length > 0) {
                        // 当前用户的公众号id在公众号列表中-当前id
                        // 当前用户的公众号id不在公众号列表中-更新当前公众号为公众号列表的第一个
                        let authId = authorizerInfoId ? authorizerInfoId : state.user.authorizerInfoId;
                        let account = accounts.filter(account => account.authorizerInfoId === ~~authId)[0];

                        // 2. 将授权公众号相关字段补充到用户信息中
                        commit(UPDATE_USER_INFO, {
                            authorizerInfoId: account ? account.authorizerInfoId : accounts[0].authorizerInfoId,
                            appId: account ? account.WxAppId : accounts[0].WxAppId,
                            // 判断当前账号是否为微信订阅号
                            isSubscriptionAccount: account
                                ? account.serviceTypeInfo !== 2
                                : accounts[0].serviceTypeInfo !== 2,
                            // 所在部门是否配置了公众号
                            configStatus, // 0已配置 1未配置
                        });
                    } else {
                        // 2. 将授权公众号相关字段补充到用户信息中
                        commit(UPDATE_USER_INFO, {
                            authorizerInfoId: '',
                            appId: '',
                            // 判断当前账号是否为微信订阅号
                            isSubscriptionAccount: false,
                            // 所在部门是否配置了公众号
                            configStatus, // 0已配置 1未配置
                        });
                    }

                    localStorage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(state.user));
                    // 3. 使用 'SIGNED_IN' 通知其他标签页更新
                    localStorage.setItem(SIGNED_IN, (new Date).getTime());
                });
        },
        [UPDATE_MENU_AUTH]({commit, state}) {
            // 登录后
            if (state.user && state.user.id) {
                // 获取旅程审批权限并存入缓存
                GeteOriginApi
                    .getConfig(state.user.id)
                    .then(res => {
                        let canApproval = res.body.data.flag === 0; // 0:有编辑权限 1:没有
                        let approvalState = res.body.data.status === 0;// 0 启用 1 禁用
                        // 更新用户信息（是否有旅程审批权限）
                        commit(UPDATE_USER_INFO, {canApproval: canApproval, approvalState: approvalState});
                        let user = JSON.parse(localStorage.getItem(USER_INFO_SESSION_KEY));
                        user.canApproval = canApproval;
                        user.approvalState = approvalState;
                        localStorage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(user));
                    });

                // 是否是 nike 账号
                let isNikeCount = false;
                /**
                 * 开发环境
                 * dev          开发服
                 * beta         测试服
                 * production   生产服
                 * development  本地开发
                 */
                const env = process.env.NODE_ENV;
                if (env === 'development' && state.user.cid === 339) {
                    isNikeCount = true;
                } else if (env === 'beta' && state.user.cid === 339) {
                    isNikeCount = true;
                } else if (env === 'production' && state.user.cid === 748) {
                    isNikeCount = true;
                } else if (env === 'dev' && state.user.cid === 748) {
                    isNikeCount = true;
                }
                // 更新用户信息（是否是 nike 账号）
                commit(UPDATE_USER_INFO, {isNikeCount: isNikeCount});
            }
            // 主账号
            if (state.user.roleId === 0 || state.user.roleId === '') { // 主账号
                // 1. 获取当前用户的菜单权限
                return GeteOriginApi
                    .getRoleMenu(state.user.roleId, state.user.id)
                    .then(({body: {data: {menus = []}}}) => {
                        let records = {};
                        let permissions = {};
                        menus.forEach(menu => {
                            if (menu.showName) {
                                menu.showName = menu.showName.trim();
                                // 如果是插件菜单，注册其翻译到 i18n 子状态树上
                                if (menu.isPlugin) {
                                    menu.translationKey = 'plugin.' + menu.showName;
                                    commit(ADD_A_TRANSLATION, {
                                        translationKey: menu.translationKey,
                                        translationObj: {en: menu.showName, 'zh-CN': menu.menuName}
                                    });
                                }

                                const targetRecord = records[menu.showName];
                                if (targetRecord) {
                                    if (!targetRecord.isPlugin && menu.isPlugin) {
                                        // 注册 插件路由覆盖标准产品路由
                                        records[menu.showName] = menu;
                                        console.warn(`路由 ${menu.showName} 出现冲突，优先使用订制化功能，请检查套餐配置`);
                                    } else if (targetRecord.isPlugin && !menu.isPlugin) {
                                        console.warn(`路由 ${menu.showName} 出现冲突，优先使用订制化功能，请检查套餐配置`);
                                    } else {
                                        console.error(`路由 ${menu.showName} 重复定义`);
                                    }
                                } else {
                                    // 注册
                                    records[menu.showName] = menu;
                                }
                            }
                            // 注册权限
                            permissions[menu.flag] = menu;
                        });
                        // 接口无【评分】路由信息，自行添加
                        records['mircopage'] = {
                            id: '',
                            type: 2,
                            parentId: 96,
                            menuName: '微页面',
                            showName: 'mircopage',
                            showType: null,
                            isPlugin: null,
                            flag: 'journey_mircopage'
                        };
                        // 接口无【小程序配置页】路由信息，自行添加
                        records['miniprogram'] = {
                            id: '',
                            type: 2,
                            parentId: 330,
                            menuName: '小程序',
                            showName: 'miniprogram',
                            showType: null,
                            isPlugin: null,
                            flag: 'enterprise_miniprogram'
                        };
                        // 接口无【导购助手】路由信息，自行添加
                        records['shoppingGuide'] = {
                            id: '',
                            type: 2,
                            parentId: 486,
                            menuName: '导购助手',
                            showName: 'shoppingGuide',
                            showType: null,
                            isPlugin: null,
                            flag: 'journey_shoppingguide'
                        };
                        // 2. 将菜单信息补充到用户信息中
                        commit(UPDATE_USER_INFO, {menus: records, permissions: permissions});
                        localStorage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(state.user));
                        // 3. 使用 'SIGNED_IN' 通知其他标签页更新
                        localStorage.setItem(SIGNED_IN, (new Date).getTime());
                        return records;
                    });
            }
            // 子账号
            return GeteOriginApi
                .getNewRoleMenu(state.user.id)
                .then(({body: {data: {menus = []}}}) => {
                    // .then(({body: {data: {dataAuthorities = [], menus = []}}}) => {
                    // todo dataAuthorities 数据权限
                    let records = {};
                    let permissions = {};
                    menus.forEach(menu => {
                        if (menu.showName) {
                            menu.showName = menu.showName.trim();
                            // 如果是插件菜单，注册其翻译到 i18n 子状态树上
                            if (menu.isPlugin) {
                                menu.translationKey = 'plugin.' + menu.showName;
                                commit(ADD_A_TRANSLATION, {
                                    translationKey: menu.translationKey,
                                    translationObj: {en: menu.showName, 'zh-CN': menu.menuName}
                                });
                            }

                            const targetRecord = records[menu.showName];
                            if (targetRecord) {
                                if (!targetRecord.isPlugin && menu.isPlugin) {
                                    // 注册 插件路由覆盖标准产品路由
                                    records[menu.showName] = menu;
                                    console.warn(`路由 ${menu.showName} 出现冲突，优先使用订制化功能，请检查套餐配置`);
                                } else if (targetRecord.isPlugin && !menu.isPlugin) {
                                    console.warn(`路由 ${menu.showName} 出现冲突，优先使用订制化功能，请检查套餐配置`);
                                } else {
                                    console.error(`路由 ${menu.showName} 重复定义`);
                                }
                            } else {
                                // 注册
                                records[menu.showName] = menu;
                            }
                        }
                        // 注册权限
                        permissions[menu.flag] = menu;
                    });
                    // 接口无评分路由信息，自行添加
                    records['mircopage'] = {
                        flag: 'journey_mircopage',
                        id: '',
                        isPlugin: null,
                        menuName: '微页面',
                        parentId: 96,
                        showName: 'mircopage',
                        showType: null,
                        type: 2
                    };
                    // 接口无【小程序配置页】路由信息，自行添加
                    records['miniprogram'] = {
                        flag: 'enterprise_miniprogram',
                        id: '',
                        isPlugin: null,
                        menuName: '小程序',
                        parentId: 330,
                        showName: 'miniprogram',
                        showType: null,
                        type: 2
                    };
                    // 接口无【导购助手】路由信息，自行添加
                    records['shoppingGuide'] = {
                        id: '',
                        type: 2,
                        parentId: 486,
                        menuName: '导购助手',
                        showName: 'shoppingGuide',
                        showType: null,
                        isPlugin: null,
                        flag: 'journey_shoppingguide'
                    };
                    // 2. 将菜单信息补充到用户信息中
                    commit(UPDATE_USER_INFO, {menus: records, permissions: permissions});
                    localStorage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(state.user));
                    // 3. 使用 'SIGNED_IN' 通知其他标签页更新
                    localStorage.setItem(SIGNED_IN, (new Date).getTime());
                    return records;
                });
        }
    },
    getters: {
        // 当前为Pall中国用户
        isPallUser: (state) => {
            return state.user && state.user.companyType === 3;
        },
        // 有效期显示内容，有日期时显示，为空时为无限时间
        validTimeText: (state) => {
            return state.user && state.user.validTime ? state.user.validTime : translate('home.indefinitely');
        }
    }
};
