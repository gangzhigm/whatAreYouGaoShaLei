/*
 * @Author: naeemo
 * @createDate: 2016/12/1
 * @Date: 2021-03-12 15:28:58
 * @Last Modified by: Deanlee
 * @Last Modified time: 2021-04-25 09:39:15
 */

import Vue from 'vue';
import VueRouter from 'vue-router';
import { store } from '@/store';
import { UPDATE_WECHAT_ACCOUNT_INFO } from '@/store/vuex/actionTypes';
import rootStore, { USER_INFO_SESSION_KEY } from '@/store/vuex/rootStore';
import { ssoCountRender } from '@/render.js';
import { translate } from '@/locales';
import { trackEvent} from '@/monitor';
import { wecomChecker } from '@/utils/wecomChecker';


import cloneDeep from 'lodash/cloneDeep';
import data from './data';
import wechat from './wechat';
import analysis from './analysis';
import customer from './customer';
import journey from './journey';
import setting from './setting';
import personal from './personal';
import alter from './alter';
import wecom from './wecom';

Vue.use(VueRouter);

const App = () => import(/* webpackChunkName: "app" */ '../layout/index.vue');
const Login = () => import(/* webpackChunkName: "login" */ '../layout/login/login.vue');
const Terms = () => import(/* webpackChunkName: "app" */ '../layout/terms.vue');
const Home = () => import(/* webpackChunkName: "app" */ '../layout/home/home-external.vue');
const HwOss = () => import(/* webpackChunkName: "app" */ '../layout/hw/hw-oss.vue');
const NotFound = () => import(/* webpackChunkName: "app" */ '../layout/components/not-found.vue');
const NotAuthorized = () => import(/* webpackChunkName: "app" */ '../layout/components/not-authorized.vue');
const PluginWindow = () => import(/* webpackChunkName: "app" */ '../layout/components/plugin-window.vue');
const NotConfigPublicAccount = () => import ( /* webpackChunkName: "app" */'../layout/components/not-config-public-account.vue');
const microPageOpenMiniprogram = () => import ( /* webpackChunkName: "app" */'../micro-page/micro-page-openMiniprogram.vue');
const wecomStaffAuth = () => import ( /* webpackChunkName: "app" */'../layout/wecom-staff-auth/wecom-staff-auth.vue');

/**
 * 登录前就会被注册的默认路由
 * @type {*[]}
 */
const defaultRoutes = [
    // 登录
    {path: '/sign-in', name: 'login', meta: {name: 'home.login'}, component: Login},
    // 使用协议
    {path: '/terms', name: 'terms', meta: {name: 'home.terms'}, component: Terms},
    // 401 没有权限访问
    {path: '/401', name: 401, meta: {auth: true, name: 'home.noAuth'}, component: NotAuthorized},
    // 404 页面
    {path: '*', name: 404, meta: {auth: true, name: 'home.notFound'}, component: NotFound},
    // 华为账号：华为oss导出
    {path: '/exportoss', name: 'exportoss', meta: {auth: true, name: 'home.hwOss'}, component: HwOss},
    // 微页面跳转小程序查看重定向页
    {path: '/mpomp', name: microPageOpenMiniprogram, meta: {auth: false}, component: microPageOpenMiniprogram},
    // 企业微信获取员工敏感信息重定向页
    {path: '/wecomstaff-authorization', name: wecomStaffAuth, meta: {auth: false}, component: wecomStaffAuth},
];

/**
 * 标准产品包含的所有路由
 * meta.auth 字段为字符串时，表征该路由的权限继承于 meta.auth 指定的路由
 * @type {*[]}
 */
const standardRoutes = [
    {
        path: '/',
        name: 'index',
        meta: {
            name: 'Dmartech',
            auth: true
        },
        component: App,
        redirect: {name: 'home'},
        children: [
            {name: 'home', path: 'home', meta: {auth: 'index', name: 'home.home'}, component: Home},
            setting, personal, alter
        ]
    },
    // 微信管理
    ...wechat,
    // 联系人管理
    customer,
    // 营销旅程
    journey,
    // 数据中心
    data,
    // 分析模型
    analysis,
    // 企业微信
    ...wecom
];


/**
 * 根据路由名(菜单名列表)称过滤路由
 * 这个方法返回的路由列表是所有【可见】的路由，
 * 具体每个路由是否【可用】，要取决于 $store.state.user.menus[routeName].type
 * type: 0代表可见不可用，1代表可点击（展示客服信息），2代表可用
 *
 * @param {Object<String, Object>} records 就是 $store.state.user.menus
 * @return {Array}
 */
function getRoutesByMenuRecords(records) {

    // 记录没有注册成功的路由名称，在方法最后给出错误提醒
    let namesLeft = new Set(Object.keys(records));

    function filter(routes, routePath) {
        let noWechat; // 微信模块
        let noReportWechat; // 微信报告
        if (routePath) {
            noWechat = routePath === '/wechat'; // 微信模块
            noReportWechat = routePath === 'report/wechat'; // 微信报告
        }
        return routes.filter(route => {
            if (route.name in records || route.meta.auth in records) {
                const menu = records[route.name];
                const superiorMenu = records[route.meta.auth];
                // 注册上的路由从剩余名单里去除
                namesLeft.delete(route.name);

                let user = rootStore.state.user;
                // 主账号
                if (user.roleId === 0 || user.roleId === '') {
                    // 当前路由是否【可用】由 records[route.name].type 的值决定，一级菜单总是可用的
                    // route.name 不存在 records 中的，继承 records[route.meta.auth] 的相应值
                    // 没有可使用权限的路由展示 未授权 组件
                    if ((menu || superiorMenu).type !== 2 && (menu || superiorMenu).parentId !== 0) {
                        if (!route.children) {
                            route.component = NotAuthorized;
                        } else if ((noWechat || noReportWechat) && user.configStatus === 1) {
                            route.component = NotConfigPublicAccount;
                        }
                    } else if (menu && menu.isPlugin) {
                        // 切换到插件视图
                        route.component = PluginWindow;
                        // 清空原有重定向
                        route.redirect = null;
                        // 添加插件功能所属公司前缀
                        let parentMenu = Object.values(records)
                            .find(record => record.id === menu.parentId);
                        if (parentMenu) route.path = '/' + parentMenu.showName + '/' + route.name;
                    }

                    // 循环处理子路由
                    if (route.children && route.children.length) {
                        route.children = filter(route.children, route.path);
                    }

                    return true;
                }
                // 子账号

                // 当前路由是否【可用】由 records[route.name].type 的值决定，一级菜单总是可用的
                // route.name 不存在 records 中的，继承 records[route.meta.auth] 的相应值
                // 没有可使用权限的路由展示 未授权 组件
                // 子账号菜单根据showType 判断； showType 0 没权限，1 有权限
                if ((menu || superiorMenu).parentId !== 0) {
                    if ((menu || superiorMenu).showType === 0) {
                        route.component = NotAuthorized;
                    } else if ((noWechat || noReportWechat) && user.configStatus === 1) {
                        route.component = NotConfigPublicAccount;
                    }
                } else if (menu && menu.isPlugin) {
                    // 切换到插件视图
                    route.component = PluginWindow;
                    // 清空原有重定向
                    route.redirect = null;
                    // 添加插件功能所属公司前缀
                    let parentMenu = Object.values(records)
                        .find(record => record.id === menu.parentId);
                    if (parentMenu) route.path = '/' + parentMenu.showName + '/' + route.name;
                }

                // 循环处理子路由
                if (route.children && route.children.length) {
                    route.children = filter(route.children, route.path);
                }

                return true;
            }
            if (process.env.NODE_ENV === 'development') {
                console.warn(`路由 ${route.name} 未能注册成功，没有相应的菜单权限`);
            }
            return false;
        });
    }

    // 筛选出有权限的标准路由
    // 深拷贝是必需的，这样重新登录之后，新的菜单权限才能生效
    const routes = filter(cloneDeep(standardRoutes));

    // 以【插件（iframe）】方式引入的功能模块，在这里注册路由
    namesLeft.forEach(name => {
        const menu = records[name];

        menu.translationKey = 'home.' + menu.showName;

        // 顶级路由
        if (menu.parentId === 0) {
            if (!routes.some(route => route.name === name)) { // 避免重复注册
                routes.push({
                    name,
                    path: '/' + name,
                    meta: {name: menu.translationKey, isPlugin: true},
                    component: App
                });
                namesLeft.delete(name);
            }
        } else {
            // 二级路由
            let parentMenu = Object.values(records)
                .find(record => record.id === menu.parentId);

            if (parentMenu) {
                parentMenu.translationKey = 'home.' + parentMenu.showName;
                let parentRoute = routes.find(route => route.name === parentMenu.showName);

                // 父级路由还没有，添加子路由前先添加父级路由
                if (!parentRoute) {
                    parentRoute = {
                        name: parentMenu.showName,
                        path: '/' + parentMenu.showName,
                        meta: {name: parentMenu.translationKey, isPlugin: true},
                        component: App
                    };
                    routes.push(parentRoute);
                    namesLeft.delete(parentMenu.showName);
                }

                // 确保父级路由有 children
                if (!parentRoute.children)
                    parentRoute.children = [];

                // 添加子路由
                parentRoute.children.push({
                    name,
                    path: name,
                    meta: {name: menu.translationKey, isPlugin: true},
                    component: menu.type === 2 ? PluginWindow : NotAuthorized
                });
                namesLeft.delete(name);
            }
        }
    });

    // 记录顶级插件路由
    const pluginRoutes = routes
        .filter(route => route.meta.isPlugin)
        .map(({name, path, meta, children = []}) => ({
            name,
            path,
            meta,
            children: children.map(({name, path, meta}) => ({name, path, meta}))
        }));


    if (namesLeft.size && process.env.NODE_ENV === 'development') {
        console.error('以下路由没有注册成功', Array.from(namesLeft));
    }

    return [routes, pluginRoutes];
}

const router = new VueRouter({
    mode: 'history',
    routes: defaultRoutes
});

// 路由拦截器
router.beforeEach((to, from, next) => {
    // 访问的路由是否需要登录权限
    const tokenNeeded = to.matched.some(r => r.meta.auth);
    // 登录权限（有没有 JWT）
    const noToken = store.state.user.authorization === '';
    // 菜单权限
    const noMenu = !store.state.user.menus || Object.keys(store.state.user.menus) === 0;
    // 访问的路由是否需要微信公众号授权
    const wechatOfficialAccountNecessary = to.matched.some(matchRoute => matchRoute.meta.officialAccountNecessary);
    // 访问的路由是否有菜单权限
    const authMenu = !noMenu && (store.state.user.menus[to.name] || store.state.user.menus[to.meta.auth]);
    // 是否开启两步验证
    const twoFactorOpen = store.state.user.twoFactorOpen;
    // （短信验证码）验证是否通过
    const passTwoFactorOpen = store.state.user.passTwoFactorOpen;

    // 更新微信信息
    if (wechatOfficialAccountNecessary && !noToken) store.dispatch(UPDATE_WECHAT_ACCOUNT_INFO);

    let menuNotAuthorized = '';
    if (!store.state.user.roleId) {
        menuNotAuthorized = authMenu && authMenu.type !== 2 && authMenu.parentId !== 0;
    } else {
        menuNotAuthorized = authMenu && authMenu.showType === 0;
    }
    let params = window.location.href.split('?')[1];
    // 单点登录判断，目前已有客户：华为，Pall
    if (tokenNeeded && (noToken || noMenu) && to.path === '/home' && params) {
        ssoCountRender(store, router, params);
        return;
    }

    // 两步验证开启 && 验证码未通过 =>  登录页面
    if (twoFactorOpen && !passTwoFactorOpen) {
        to.name === 'login' ? next() : next({name: 'login'});
        return;
    }

    // 主账号
    const mainAccount = store.state.user.roleId === 0 || store.state.user.roleId === '';

    if (tokenNeeded && (noToken || noMenu)) {
        // 1. 没有登录信息，或者没有任何菜单权限，跳转登录
        console.warn(`没有token, 访问需要权限的视图: ${to.name}, 跳转到登录`);

        if (to.name === 'login') {
            next();
        } else if (to.path === '/exportoss') {
            // 华为导出oss
            let type = to.query.type;
            let uuid = to.query.uuid;
            if (!type || !uuid) return;
            localStorage.setItem('HW_EXPORT_TYPE', type);
            localStorage.setItem('HW_EXPORT_UUID', uuid);
            next({name: 'login'});
        } else {
            next({name: 'login'});
        }
    } else if (mainAccount &&
        (!store.state.user.authorizerInfoId && wechatOfficialAccountNecessary && !menuNotAuthorized)) {
        // 2. 主账号-未绑定微信公众号，跳转至引导绑定的页面
        let {href} = router.resolve(Object.assign({}, to));
        next({name: 'bindWechatOfficialAccount', query: {redirect: href}});
    } else {
        // all checks pass
        document.title = to.meta.name ? 'Dmartech - ' + translate(to.meta.name) : 'Dmartech';
        if (to.meta.name) trackEvent(translate(to.meta.name));
        const userInfo = localStorage.getItem(USER_INFO_SESSION_KEY);
        if (userInfo && JSON.parse(userInfo).menus && to.name === 'login') { // 有用户信息 && 有用户菜单
            next({name: 'home'});
        } else if ([
            'channelCode',
            'channelCodeEdit',
            'channelCodeAdd',
            'channelCodeSummary',
            'entBroadcast',
            'entBroadcastEdit',
            'entBroadcastAdd',
            'entBroadcastDetail',
            'msgArchiving',
            'returnVisitTask',
            'returnVisitTaskAdd',
            'returnVisitTaskEdit',
            'customerGroup',
            'customerGroupAdd',
            'customerGroupEdit',
            'staffManage',
            'salesData',
            'otherConfig',
            'wecomConfig'
        ].includes(to.name) && to.name !== from.name && to.params.authValid !== 1) {    // params.authValid === 1时，需跳转导购助手页面显示未开通增值提示，此处取消拦截
            wecomChecker(next, to.name);
        } else {
            next();
        }
    }
});

export { getRoutesByMenuRecords, router };
