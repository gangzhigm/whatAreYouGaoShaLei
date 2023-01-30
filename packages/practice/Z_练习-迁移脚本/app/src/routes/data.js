const App = () => import(/* webpackChunkName: "app" */ '../layout/index.vue');
/**
 * 数据中心
 */
export default {
    path: '/data',
    name: 'data',
    meta: { name: 'Dmartech', auth: true },
    component: App,
    redirect: { name: 'home' },
    children: [
        // 数据中心
        { path: 'center', name: 'dataCenter', meta: { name: 'home.dataCollectionTools' }, component: () => import(/* webpackChunkName: "data-center" */ '../data/data-center/data-center.vue') },
        {
            path: 'center/sftp',
            name: 'sftpDetails',
            meta: { auth: 'dataCenter', name: 'dataCenter.sftpAccess' },
            component: () => import(/* webpackChunkName: "data-center" */ '../data/data-center/sftp/sftp-details.vue')
        },
        {
            path: 'center/sdk',
            name: 'sdkDetails',
            meta: { auth: 'dataCenter', name: 'dataCenter.severSDKAccess' },
            component: () => import(/* webpackChunkName: "data-center" */ '../data/data-center/service-sdk/sdk-details.vue')
        },
        {
            path: 'center/js-sdk',
            name: 'jsSdkDetails',
            meta: { auth: 'dataCenter', name: 'dataCenter.jsSDKAccess' },
            component: () => import(/* webpackChunkName: "data-center" */ '../data/data-center/js-sdk/js-sdk-details.vue')
        },
        {
            path: 'center/api',
            name: 'apiDetails',
            meta: { auth: 'dataCenter', name: 'dataCenter.api' },
            component: () => import(/* webpackChunkName: "data-center" */ '../data/data-center/api/api-details.vue')
        },
        // 数据接入
        {
            path: 'dataAccess',
            name: 'dataAccess',
            meta: { auth: 'dataCenter', name: 'dataCenter.dataAccess' },
            component: () => import(/* webpackChunkName: "data-center" */ '../data/data-center/components/data-access.vue'),
            children: [
                {
                    path: 'sftp',
                    name: 'sftp',
                    meta: { auth: 'dataCenter', name: 'dataCenter.sftpAccess' },
                    component: () => import(/* webpackChunkName: "data-center" */ '../data/data-center/sftp/sftp.vue')
                },
                {
                    path: 'sdk',
                    name: 'sdk',
                    meta: { auth: 'dataCenter', name: 'dataCenter.severSDKAccess' },
                    component: () => import(/* webpackChunkName: "data-center" */ '../data/data-center/service-sdk/sdk.vue'),
                },
                {
                    path: 'js-sdk',
                    name: 'jsSdk',
                    meta: { auth: 'dataCenter', name: 'dataCenter.jsSDKAccess' },
                    component: () => import(/* webpackChunkName: "data-center" */ '../data/data-center/js-sdk/js-sdk.vue'),
                },
                {
                    path: 'api', name: 'api', meta: { auth: 'dataCenter', name: 'dataCenter.api' },
                    component: () => import(/* webpackChunkName: "data-center" */ '../data/data-center/api/api.vue'),
                },
            ]
        },
        // 元数据
        {
            path: 'meta',
            name: 'meta',
            meta: { name: 'home.meta' },
            component: () => import(/* webpackChunkName: "meta" */ '../data/meta-data/meta-data.vue'),
            redirect: { name: 'eventGroup' },
            children: [
                {
                    path: 'event-group',
                    name: 'eventGroup',
                    meta: { auth: 'meta', name: 'metaData.eventGroup' },
                    component: () => import(/* webpackChunkName: "meta" */ '../data/meta-data/event-group/event-group.vue')
                },
                {
                    path: 'meta-event',
                    name: 'metaEvent',
                    meta: { auth: 'meta', name: 'metaData.eventMgt' },
                    component: () => import(/* webpackChunkName: "meta" */ '../data/meta-data/meta-event/meta-event.vue')
                },
                {
                    path: 'user-attribute',
                    name: 'userAttribute',
                    meta: { auth: 'meta', name: 'metaData.userAttr' },
                    component: () => import(/* webpackChunkName: "meta" */ '../data/meta-data/attribute/user-attributes.vue')
                },
                {
                    path: 'event-attribute',
                    name: 'eventAttribute',
                    meta: { auth: 'meta', name: 'metaData.eventAttr' },
                    component: () => import(/* webpackChunkName: "meta" */ '../data/meta-data/attribute/event-attribute.vue')
                }
            ]
        },

        //评级管理
        {
            path: 'score-list',
            name: 'scoreList',
            meta: { auth: 'score', name: 'metaData.scoreEva' },
            component: () => import(/* webpackChunkName: "score" */ '../data/meta-data/score-evaluation/score-list.vue')
        },
        {
            path: 'score-report',
            name: 'scoreReport',
            meta: { auth: 'score', name: 'metaData.scoreReport' },
            component: () => import(/* webpackChunkName: "score" */ '../data/meta-data/score-evaluation/score-report.vue')
        },


        // 标签管理
        {
            path: 'tagManage',
            name: 'tagManage',
            meta: { name: 'home.tag' },
            component: () => import(/* webpackChunkName: "tagManage" */'../data/tag/tag-manage.vue'),
        },
        // 联系人报告
        {
            path: 'report/customer',
            name: 'dataReport',
            meta: { name: 'home.customerReport' },
            component: () => import(/* webpackChunkName: "report" */'../data/report/customer/customer-report.vue')
        },
        // 订单报告
        {
            path: 'report/order',
            name: 'orderReport',
            meta: { name: 'home.orderReport' },
            component: () => import(/* webpackChunkName: "report" */'../data/report/order/order-report.vue')
        },
        // 微信报告
        {
            path: 'report/wechat',
            meta: { name: 'home.wechatReport', officialAccountNecessary: true },
            name: 'WeChat',
            component: () => import(/* webpackChunkName: "journey-report" */'../data/report/wechat/wechat-report.vue'),
            redirect: { name: 'appAnalysis' },
            children: [
                {
                    path: 'App-Analysis',
                    name: 'appAnalysis',
                    meta: { auth: 'WeChat', name: 'home.appAnalysis' },
                    component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/wechat/app-analysis.vue'),
                },
                {
                    path: 'Follower-Analysis',
                    name: 'followerAnalysis',
                    meta: { auth: 'WeChat', name: 'home.followerAnalysis' },
                    component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/wechat/follower-analysis.vue'),
                }
            ]
        },
        // 旅程报告
        {
            path: 'report/journey',
            name: 'journeyReport',
            meta: { name: 'home.journeyReport' },
            component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/report.vue'),
            redirect: { name: 'journeyReviewReport' },
            children: [
                {
                    path: 'review-report',
                    name: 'journeyReviewReport',
                    meta: { auth: 'journeyReport', name: 'data.journeyReview' },
                    component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/journey-review-report/journey-review-report.vue')
                },
                {
                    path: 'send-report',
                    name: 'journeySendReport',
                    meta: { auth: 'journeyReport', name: 'data.reportList' },
                    component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/journey-send-report/journey-send-report.vue'),
                },
                {
                    path: 'send-report/email-send-report',
                    name: 'emailSendReport',
                    meta: { auth: 'journeyReport', name: 'data.emailSendReport' },
                    component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/journey-send-report/email-send-report.vue'),
                },
                {
                    path: 'send-report/sms-send-report',
                    name: 'smsSendReport',
                    meta: { auth: 'journeyReport', name: 'data.smsSendReport', type: 0 },
                    component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/journey-send-report/sms-send-report.vue')
                },
                {
                    path: 'send-report/mms-send-report',
                    name: 'mmsSendReport',
                    meta: { auth: 'journeyReport', name: 'data.mmsSendReport', type: 1 },
                    component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/journey-send-report/mms-send-report.vue')
                },
                {
                    path: 'send-report/wechat-send-report',
                    name: 'wechatSendReport',
                    meta: { auth: 'journeyReport', name: 'data.wechatSendReport' },
                    component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/journey-send-report/wechat-send-report.vue')
                },
                {
                    path: 'export-report',
                    name: 'journeyExportReport',
                    meta: { auth: 'journeyReport', name: 'data.exportDatas' },
                    component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/journey-export-report/journey-export-report.vue'),
                    redirect: { name: 'exportOriginalData', params: {noLocal: true} },
                    children: [
                        {
                            path: 'original-data',
                            name: 'exportOriginalData',
                            meta: { auth: 'journeyReport', name: 'data.exportOriginalData' },
                            component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/journey-export-report/original-data.vue'),
                        },
                        {
                            path: 'send-record',
                            name: 'exportSendRecord',
                            meta: { auth: 'journeyReport', name: 'data.exportSendRecord' },
                            component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/journey-export-report/send-record.vue')
                        },
                    ]
                },
                {
                    path: 'send-report/email-journey-compared',
                    name: 'emailJourneyCompared',
                    meta: { auth: 'journeyReport', name: 'data.emailSendReport' },
                    component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/journey-send-report/email-journey-compared.vue')
                },
                {
                    path: 'send-report/wecom-agentMsg-report',
                    name: 'WecomAgentMsgReport',
                    meta: {auth: 'journeyReport',name: 'data.wecomAgentMsgReport'},
                    component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/journey-send-report/wecom-agentMsg-report.vue')
                },
                {
                    path: 'send-report/enterprise-broadcast-report',
                    name: 'EnterpriseBroadcastReport',
                    meta: {auth: 'journeyReport',name: 'data.enterpriseBroadcastReport'},
                    component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/journey-send-report/enterprise-broadcast-report.vue')
                },
            ]
        },
        {
            path: 'journey/report/email',
            name: 'emailreport',
            meta: { auth: 'journeyReport', name: 'data.emailReport' },
            component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/journey-export-report/nike-report.vue')
        },
        //邮件报告（nike）
        {
            path: '/report/email-report-nike',
            name: 'emailReportNike',
            meta: { auth: 'emailReportNike', name: 'data.emailReportNike' },
            component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/journey-export-report/email-report-nike.vue'),
            redirect: { name: 'emailReportDataNike' },
            children: [
                {
                    path: 'label',
                    name: 'emailReportDataNike',
                    meta: { auth: 'emailReportNike', name: 'data.emailMailingLabel' },
                    component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/journey-export-report/email-reportData-nike.vue'),
                },
                {
                    path: 'details',
                    name: 'emailReportDetailsNike',
                    meta: { auth: 'emailReportNike', name: 'data.emailReportDetailsNike' },
                    component: () => import(/* webpackChunkName: "journey-report" */ '../data/report/journey/journey-export-report/email-reportDetails-nike.vue')
                }
            ]
        },
    ]
};
