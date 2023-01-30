const App = () => import(/* webpackChunkName: "app" */ '../layout/index.vue');
// const WIP = () => import(/* webpackChunkName: "app" */ '../common/components/work-in-progress.vue');

/**
 * 分析模型
 */
export default {
    path: '/analysis',
    name: 'analysis',
    meta: { name: 'Dmartech', auth: true },
    component: App,
    redirect: { name: 'home' },
    children: [
        // 事件分析
        {
            path: 'event',
            name: 'event',
            meta: { name: 'home.event' },
            component: () => import(/* webpackChunkName: "event-analysis" */ '../analysis/event-analysis/event-analysis.vue')
        },
        {
            path: 'event/fans',
            name: 'eventUserList',
            meta: { auth: 'event', name: 'home.userList' },
            component: () => import(/* webpackChunkName: "event-analysis" */ '../analysis/event-analysis/user-list.vue')
        },
        {
            path: 'event/fans/:id',
            name: 'eventUserBehavior',
            meta: { auth: 'event', name: 'home.userBehavior' },
            component: () => import(/* webpackChunkName: "event-analysis" */ '../analysis/user-behavior.vue')
        },
        // 属性分析
        {
            path: 'attribute',
            name: 'attribute',
            meta: { name: 'home.attribute' },
            component: () => import(/* webpackChunkName: "attribute-analysis" */ '../analysis/attribute-analysis/attribute-analysis.vue'),
        },
        {
            path: 'attribute/fans',
            name: 'attributeUserList',
            meta: { auth: 'attribute', name: 'home.userList' },
            component: () => import(/* webpackChunkName: "attribute-analysis" */ '../analysis/attribute-analysis/user-list.vue')
        },
        {
            path: 'attribute/fans/:id',
            name: 'userBehavior',
            meta: { auth: 'attribute', name: 'home.userBehavior' },
            component: () => import(/* webpackChunkName: "attribute-analysis" */ '../analysis/user-behavior.vue')
        },
        // 漏斗分析
        // {path: 'funnel', name: 'funnelAnalysis', meta: {name: 'home.funnel'}, component: WIP},
        // 留存分析
        // {path: 'retention', name: 'retentionAnalysis', meta: {name: '留存分析'}, component: WIP},
        // 分布分析
        // {path: 'distribution', name: 'distributionAnalysis', meta: {name: '分布分析'}, component: WIP},
        // 用户路径
        // {path: 'path', name: 'userPath', meta: {name: '用户路径'}, component: WIP},
        // 网页热力分析
        // {path: 'web', name: 'webStatistic', meta: {name: '网页热力分析'}, component: WIP},
        // 用户分群
        {
            path: 'group/:id?',
            name: 'userGroup',
            meta: { name: 'home.userGroup' },
            component: () => import(/* webpackChunkName: "user-group" */ '../analysis/user-group/user-group.vue'),
        },
        {
            path: 'group/:id/fans',
            name: 'groupUserList',
            meta: { auth: 'userGroup', name: 'home.userList' },
            component: () => import(/* webpackChunkName: "user-group" */ '../analysis/user-group/user-list.vue')
        },
        {
            path: 'group/:groupId/fans/:id',
            name: 'groupUserBehavior',
            meta: { auth: 'userGroup', name: 'home.userBehavior' },
            component: () => import(/* webpackChunkName: "user-group" */ '../analysis/user-behavior.vue')
        },
        // 数据看板
        {
            path: 'board',
            name: 'boards',
            meta: { name: 'home.board' },
            component: () => import(/* webpackChunkName: "board" */ '../analysis/board/boards.vue')
        },
        {
            path: 'board/:id',
            name: 'board',
            meta: { auth: 'boards', name: 'home.boardDetail' },
            component: () => import(/* webpackChunkName: "board" */ '../analysis/board/board.vue')
        },
        // 可视化报告
        {
            path: 'visualization',
            name: 'visualization',
            meta: { name: 'home.visualization' },
            component: () => import(/* webpackChunkName: "visualization" */ '../analysis/visualization/visualization.vue')
        },
    ]
};
