/**
 * Created by lvjuan on 2019/8/22.
 */

/**
 * 个人设置
 */
export default {
    path: '/personalSetting',
    name: 'personalSetting',
    meta: {name: 'personal.personalSettings'},
    component: () => import(/* webpackChunkName: "personal-setting" */'../personal-setting/personal-setting.vue'),
};

