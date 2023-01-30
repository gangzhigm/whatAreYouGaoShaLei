/**
 * Created by lvjuan on 2019/8/22.
 */

/**
 * 账户信息修改
 */
export default {
    path: '/accountInfoModify',
    name: 'accountInfoModify',
    meta: {name: 'home.accountInfoModify'},
    component: () => import(/* webpackChunkName: "alter-setting" */'../alter/accountInfoModify.vue'),
};

