const App = () => import(/* webpackChunkName: "app" */ '../layout/index.vue');

/**
 * 联系人管理
 */
export default {
    path: '/customer',
    name: 'customer',
    meta: { name: 'Dmartech', auth: true },
    component: App,
    redirect: { name: 'home' },
    children: [
        {
            path: 'manage',
            name: 'memberList',
            meta: { name: 'home.customerPerfile' },
            component: () => import(/* webpackChunkName: "customer" */'../customer/list/customer-manage.vue')
        },
        {
            path: 'manage/upload',
            name: 'customerUpload',
            meta: { auth: 'memberList', name: 'swarm.upload' },
            component: () => import(/* webpackChunkName: "customer" */'../customer/swarm/customer-upload.vue')
        },
        {
            path: 'manage/detail',
            name: 'customerDetail',
            meta: { auth: 'memberList', name: 'contact.contactDetail' },
            component: () => import(/* webpackChunkName: "customer" */'../customer/list/customer-detail.vue')
        },
        {
            path: 'swarm',
            name: 'swarm',
            meta: { name: 'home.customerSwarm' },
            component: () => import(/* webpackChunkName: "customer" */'../customer/swarm/swarm.vue')
        },
        {
            path: 'swarm/:id',
            name: 'swarmUsers',
            meta: { auth: 'swarm', name: 'swarm.contactsOfGroup' },
            component: () => import(/* webpackChunkName: "customer" */'../customer/swarm/swarmUsers.vue')
        },
        {
            path: 'advanced',
            name: 'advancedSwarm',
            meta: { auth: 'swarm', name: 'swarm.advancedSwarm' },
            component: () => import(/* webpackChunkName: "customer" */'../customer/swarm/advanced-swarm.vue')
        },
        {
            path: 'advancedview',
            name: 'advancedSwarmView',
            meta: { auth: 'swarm', name: 'swarm.swarmView' },
            component: () => import(/* webpackChunkName: "customer" */'../customer/swarm/advanced-swarm-view.vue')
        },
        // {
        //     path: 'scorerating',
        //     name: 'scorerating',
        //     meta: { name: 'home.customerScoring' },
        //     component: () => import(/* webpackChunkName: "customer" */'../customer/scoring/scoring-model-list.vue')
        // },
        // {
        //     path: 'scorerating/manage',
        //     name: 'scoringManage',
        //     meta: { auth: 'scorerating', name: 'scoring.contactScoring' },
        //     component: () => import(/* webpackChunkName: "customer" */'../customer/scoring/scoring-model-manage.vue')
        // },
        // {
        //     path: 'scorerating/report',
        //     name: 'scoringReport',
        //     meta: { auth: 'scorerating', name: 'scoring.scoringReport' },
        //     component: () => import(/* webpackChunkName: "customer" */'../customer/scoring/scoring-report.vue')
        // },

        //新版打分评级
        //列表页
        {
            path: 'newscorerating',
            name: 'scorerating',
            meta: { name: 'home.customerScoring' },
            component: () => import(/* webpackChunkName: "customer" */'../customer/new-scoring/new-scoring-list.vue')
        },
        //新建模型页
        {
            path: 'newscorerating/create',
            name: 'createNewScoreRating',
            meta: { name: 'newScoring.createComputeModel', auth: 'scorerating' },
            component: () => import(/* webpackChunkName: "customer" */'../customer/new-scoring/new-scoring-create.vue')
        },
        //编辑模型页
        {
            path: 'newscorerating/edit',
            name: 'editNewScoreRating',
            meta: { name: 'newScoring.editComputationalModel', auth: 'scorerating' },
            component: () => import(/* webpackChunkName: "customer" */'../customer/new-scoring/new-scoring-edit/new-scoring-edit.vue')
        },
        //报告页
        {
            path: 'newscorerating/report',
            name: 'newScoreRatingReport',
            meta: { auth: 'scorerating', name: 'newScoring.modelReports' },
            component: () => import(/* webpackChunkName: "customer" */'../customer/new-scoring/new-scoring-report.vue')
        },
        //快捷模式
        {
            path: 'newscorerating/quick',
            name: 'newScoreRatingQuick',
            meta: { auth: 'scorerating', name: 'newScoring.quickModel' },
            component: () => import(/* webpackChunkName: "customer" */'../customer/new-scoring/new-scoring-quick/new-scoring-quick.vue')
        },
    ]
}; 
