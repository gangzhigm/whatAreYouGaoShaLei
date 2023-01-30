
export default [
    {
        path: '/config-wecom-agent-now',
        name: 'configWecomAgentNow',
        meta: { name: 'home.wecom', auth: 'wecom' },
        component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/config-wecom-agent-now.vue')
    },
    {
        path: '/wecom',
        name: 'wecom',
        meta: {
            name: 'Dmartech'
        },
        component: () => import(/* webpackChunkName: "wecom" */ '@/layout/index.vue'),
        redirect: { name: 'home' },
        children: [
            // 渠道活码
            {
                path: 'channel-code',
                name: 'channelCode',
                meta: { name: 'home.channelCode', auth: 'channelCode' },
                component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/channel-code/channel-code-list.vue')
            },
            {
                path: 'channel-code/:id/edit',
                name: 'channelCodeAdd',
                meta: { name: 'channelCode.create', auth: 'channelCode' },
                component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/channel-code/channel-code-form.vue')
            },
            {
                path: 'channel-code/:id/edit',
                name: 'channelCodeEdit',
                meta: { name: 'channelCode.edit', auth: 'channelCode' },
                component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/channel-code/channel-code-form.vue')
            },
            {
                path: 'channel-code/:id/summary',
                name: 'channelCodeSummary',
                meta: { name: 'channelCode.summary', auth: 'channelCode' },
                component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/channel-code/channel-code-summary.vue')
            },

            // 企业群发
            {
                path: 'enterprise-broadcast',
                name: 'entBroadcast',
                meta: { name: 'home.entBroadcast', auth: 'entBroadcast' },
                component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/enterprise-broadcast/enterprise-broadcast-list.vue')
            },
            {
                path: 'enterprise-broadcast/:id/edit',
                name: 'entBroadcastAdd',
                meta: { name: 'enterpriseBroadcast.newMessage', auth: 'entBroadcast' },
                component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/enterprise-broadcast/enterprise-broadcast-form.vue')
            },
            {
                path: 'enterprise-broadcast/:id/edit',
                name: 'entBroadcastEdit',
                meta: { name: 'enterpriseBroadcast.editMessage', auth: 'entBroadcast' },
                component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/enterprise-broadcast/enterprise-broadcast-form.vue')
            },
            {
                path: 'enterprise-broadcast/:id/detail',
                name: 'entBroadcastDetail',
                meta: { name: 'enterpriseBroadcast.detail', auth: 'entBroadcast' },
                component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/enterprise-broadcast/enterprise-broadcast-detail.vue')
            },

            // 会话存档
            {
                path: 'message-archiving',
                name: 'msgArchiving',
                meta: { name: 'home.msgArchiving', auth: 'msgArchiving' },
                component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/msg-archiving/index.vue'),
            },
            // 导购助手
            {
                path: 'shopping-guide',
                name: 'shoppingGuide',
                meta: { name: 'home.shoppingGuide' },
                component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/shopping-guide/index.vue'),
                redirect: { name: 'returnVisitTask',query:{ groupId:0 } },
                children: [
                    // 回访任务
                    {
                        path: 'return-visit-task',
                        name: 'returnVisitTask',
                        meta: { name: 'shoppingGuide.returnVisitTask', auth: 'shoppingGuide' },
                        component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/shopping-guide/return-visit-task/return-visit-task.vue'),
                    },
                    // 客户分组
                    {
                        path: 'customer-group',
                        name: 'customerGroup',
                        meta: { name: 'shoppingGuide.customerGroup', auth: 'shoppingGuide' },
                        component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/shopping-guide/customer-group/customer-group.vue'),
                    },
                    // 员工管理
                    {
                        path: 'staff-manage',
                        name: 'staffManage',
                        meta: { name: 'shoppingGuide.staffManage', auth: 'shoppingGuide' },
                        component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/shopping-guide/staff-manage/staff-manage.vue'),
                    },
                    // 销售数据
                    {
                        path: 'sales-data',
                        name: 'salesData',
                        meta: { name: 'shoppingGuide.salesData', auth: 'shoppingGuide' },
                        component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/shopping-guide/sales-data/sales-data.vue'),
                    },
                    // 其他配置
                    {
                        path: 'other-config',
                        name: 'otherConfig',
                        meta: { name: 'shoppingGuide.otherConfig', auth: 'shoppingGuide' },
                        component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/shopping-guide/other-config/other-config.vue'),
                    },
                    // 企微配置
                    {
                        path: 'wecom-config',
                        name: 'wecomConfig',
                        meta: { name: 'shoppingGuide.wecomConfig', auth: 'shoppingGuide' },
                        component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/shopping-guide/wecom-config/wecom-config.vue'),
                    },
                ]
            },
            //新建回访任务
            {
                path: 'shopping-guide/return-visit-task/add',
                name: 'returnVisitTaskAdd',
                meta: { name: 'shoppingGuide.returnVisitTaskAdd', auth: 'shoppingGuide' },
                component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/shopping-guide/return-visit-task/return-visit-task-form.vue'),
            },
            //编辑回访任务
            {
                path: 'shopping-guide/return-visit-task/edit',
                name: 'returnVisitTaskEdit',
                meta: { name: 'shoppingGuide.returnVisitTaskEdit', auth: 'shoppingGuide' },
                component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/shopping-guide/return-visit-task/return-visit-task-form.vue'),
            },
            // 新建客户分组
            {
                path: 'shopping-guide/customer-group/add',
                name: 'customerGroupAdd',
                meta: { name: 'shoppingGuide.customerGroupAdd', auth: 'shoppingGuide' },
                component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/shopping-guide/customer-group/new-customer.vue'),
            },
            // 编辑客户分组
            {
                path: 'shopping-guide/customer-group/edit',
                name: 'customerGroupEdit',
                meta: { name: 'shoppingGuide.customerGroupEdit', auth: 'shoppingGuide' },
                component: () => import(/* webpackChunkName: "wecom" */ '@/views/wecom/shopping-guide/customer-group/new-customer.vue'),
            },
        ]
    }
];