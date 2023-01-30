
import {initRanges} from './common/components/date-range/RANGES';
import {
    SIGN_IN,
    UPDATE_ACCOUNT_BALANCE,
    UPDATE_MENU_AUTH,
    UPDATE_WECHAT_ACCOUNT_INFO
} from '@/store/vuex/actionTypes';
import {getRoutesByMenuRecords} from './routes';
import {SET_PLUGIN_ROUTES} from '@/store/vuex/mutationTypes';
import { ManageApi } from '@/api';
/**
 * sso登录账号后跳转首页
 */
export async function ssoCountRender(store, router, params) {

    const user = await ManageApi
        .ssoUserProfile(params)
        .then(({body: {data: user}}) => user)
        .catch(() => {
            router.replace({
                path: '/login'
            });
        });
    if (user) {
        // 进入 Dmartech
        // 初始化"上线至今"时间区间
        initRanges(user.onlineTime);
        // 记录用户信息，进入已登录状态
        store.dispatch(SIGN_IN, user);

        await Promise.all([
            // 将授权公众号相关字段补充到用户信息中
            store.dispatch(UPDATE_WECHAT_ACCOUNT_INFO),
            // 获取短信余量
            store.dispatch(UPDATE_ACCOUNT_BALANCE)
        ]);

        // 将菜单信息补充到用户信息中，并根据菜单信息加载路由
        const records = await store.dispatch(UPDATE_MENU_AUTH);

        // 根据菜单权限注册路由
        const [routes, pluginRoutes] = getRoutesByMenuRecords(records);
        router.addRoutes(routes);
        store.commit(SET_PLUGIN_ROUTES, pluginRoutes);

        // 私享会提示
        localStorage.setItem('privateClub', 'privateClub' + user.id);
        
        router.replace({
            path: '/'
        });
    }
    
}
