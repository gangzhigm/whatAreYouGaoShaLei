const App = () => import(/* webpackChunkName: "app" */ '../layout/index.vue');

export default {
    path: '/journey',
    name: 'journey',
    meta: { name: 'Dmartech', auth: true },
    component: App,
    redirect: { name: 'home' },
    children: [
        // 素材
        {
            path: 'material',
            name: 'materialStore',
            meta: { name: 'material.contentManagement' },
            component: () => import(/* webpackChunkName: "journey-material" */ '../journey/material/store/material-list.vue')
        },
        // 短信创建
        {
            path: 'material/sms/create',
            name: 'createSMS',
            meta: { auth: 'materialStore', name: 'home.createSms' },
            component: () => import(/* webpackChunkName: "journey-material" */ '../journey/material/form/sms-material-form.vue')
        },
        // 短信编辑
        {
            path: 'material/sms/edit',
            name: 'editSMS',
            meta: { auth: 'materialStore', name: 'home.editSms' },
            component: () => import(/* webpackChunkName: "journey-material" */ '../journey/material/form/sms-material-form.vue')
        },
        // 彩信创建
        {
            path: 'material/mms/create',
            name: 'createMMS',
            meta: { auth: 'materialStore', name: 'home.createMMS' },
            component: () => import(/* webpackChunkName: "journey-material" */ '../journey/material/form/mms-material-form.vue')
        },
        // 彩信编辑
        {
            path: 'material/mms/edit',
            name: 'editMMS',
            meta: { auth: 'materialStore', name: 'home.editMMS' },
            component: () => import(/* webpackChunkName: "journey-material" */ '../journey/material/form/mms-material-form.vue')
        },
        // 创建邮件素材方式选择页
        {
            path: 'material/email/create-methods',
            name: 'createEmailMethods',
            meta: { auth: 'materialStore', name: 'home.emailContent', emailEdit: true },
            component: () => import(/* webpackChunkName: "journey-material" */ '../journey/material/form/create-email-methods.vue')
        },
        // 邮件素材创建 - 富文本编辑器
        {
            path: 'material/email/create',
            name: 'createEmail',
            meta: { auth: 'materialStore', name: 'home.newEmailContent', emailEdit: true },
            component: () => import(/* webpackChunkName: "journey-material-editor" */ '../journey/material/form/rich-text-email-form.vue')
        },
        // 邮件素材编辑 - 富文本编辑器
        {
            path: 'material/email/edit',
            name: 'editEmail',
            meta: { auth: 'materialStore', name: 'home.editEmailContent', emailEdit: true },
            component: () => import(/* webpackChunkName: "journey-material-editor" */ '../journey/material/form/rich-text-email-form.vue')
        },
        // 个性化邮件素材创建-nike批次发送粘贴代码
        {
            path: 'material/email/createPast',
            name: 'createNikeEmail',
            meta: { auth: 'materialStore', name: 'home.newEmailContent', emailEdit: true },
            component: () => import(/* webpackChunkName: "journey-material-editor" */ '../journey/material/form/nike-text-email-form.vue')
        },
        // 个性化邮件素材编辑-nike批次发送粘贴代码
        {
            path: 'material/email/editPast',
            name: 'editNikeEmail',
            meta: { auth: 'materialStore', name: 'home.editEmailContent', emailEdit: true },
            component: () => import(/* webpackChunkName: "journey-material-editor" */ '../journey/material/form/nike-text-email-form.vue')
        },
        // 邮件素材编辑 - 拖拽编辑器
        {
            path: 'material/email/drag',
            name: 'draggableEmail',
            meta: { auth: 'materialStore', name: 'home.layoutEditor', emailEdit: true },
            component: () => import(/* webpackChunkName: "journey-material-editor" */ '../journey/material/form/draggable-email-form.vue')
        },
        // 邮件素材编辑 - 拖拽编辑器个性区块版
        {
            path: 'material/email/drag',
            name: 'templateEmail',
            meta: { auth: 'materialStore', name: 'home.layoutEditorBlock', emailEdit: true },
            component: () => import(/* webpackChunkName: "journey-material-editor" */ '../journey/material/form/draggable-email-form.vue')
        },
        // 邮件头尾部素材
        {
            path: 'material/email/header-footer',
            name: 'headerfooterEmail',
            meta: { auth: 'materialStore', name: 'home.HeaderFooterEmail', emailEdit: true },
            component: () => import(/* webpackChunkName: "journey-material-editor" */ '../journey/material/store/header-footer-Email.vue')
        },
        // 创建邮件头尾部素材方式选择页
        {
            path: 'material/email/header-footer-create',
            name: 'createHeaderFooter',
            meta: { auth: 'materialStore', name: 'home.NewHeaderFooter', emailEdit: true },
            component: () => import(/* webpackChunkName: "journey-material-editor" */ '../journey/material/form/create-header-footer.vue')
        },
        // 编辑邮件头尾部素材
        {
            path: 'material/email/header-footer-edit',
            name: 'richHeaderFooter',
            meta: { auth: 'materialStore', name: 'home.NewHeaderFooter', emailEdit: true },
            component: () => import(/* webpackChunkName: "journey-material-editor" */ '../journey/material/form/rich-text-header-footer.vue')
        },
        // 旅程
        {
            path: 'record/:groupId?',
            name: 'journeyRecords',
            meta: { name: 'home.journey' },
            component: () => import(/* webpackChunkName: "journey" */ '../journey/list/journey-list.vue')
        },
        {
            path: 'record/draggable/:id',
            name: 'draggableJourney',
            meta: { auth: 'journeyRecords', name: 'dragJourney.draggableJourney' },
            component: () => import(/* webpackChunkName: "journey" */ '../journey/draggable-form/draggable-journey.vue')
        },
        // 表单
        {
            path: 'questionnaire/:id?',
            name: 'journeyFormManagement',
            meta: { name: 'home.leads' },
            component: () => import(/* webpackChunkName: "questionnaire" */ '../journey/questionnaire/questionnaire-list.vue')
        },
        {
            path: 'questionnaire/add/:groupId',
            name: 'newQuestionnaire',
            meta: { auth: 'journeyFormManagement', name: 'home.newQuestionnaire' },
            component: () => import(/* webpackChunkName: "questionnaire" */ '../journey/questionnaire/new-questionnaire.vue')
        },
        {
            path: 'questionnaire/edit/:groupId', // TODO url需要改  表单/新增（编辑）/分组ID/（表单id）/标准表单（金数据表单）
            name: 'newQuestionnaireForm',
            meta: { auth: 'journeyFormManagement', name: 'home.editQuestionnaire' },
            component: () => import(/* webpackChunkName: "questionnaire" */ '../journey/questionnaire/new-questionnaire-form.vue')
        },
        {
            path: 'questionnaire/report/:id',
            name: 'questionnaireReport',
            meta: { auth: 'journeyFormManagement', name: 'home.questionnaireDetails' },
            component: () => import(/* webpackChunkName: "questionnaire" */ '../journey/questionnaire/questionnaire-report.vue')
        },
        {
            path: 'questionnaire/report/:id/setting',
            name: 'reportSetting',
            meta: { auth: 'journeyFormManagement', name: 'home.reportSetting' },
            component: () => import(/* webpackChunkName: "questionnaire" */ '../journey/questionnaire/report-setting.vue')
        },

        // 接入金数据表单
        {
            path: 'questionnaire/form/:groupId/:id',
            name: 'questionnaireForm',
            meta: { auth: 'journeyFormManagement', name: 'form.jinShuJu' },
            component: () => import(/* webpackChunkName: "questionnaire" */ '../journey/questionnaire/questionnaire-form.vue')
        },
        {
            path: 'questionnaire/view/:id',
            name: 'questionnaireView',
            meta: { auth: 'journeyFormManagement', name: 'form.jinShuJu' },
            component: () => import(/* webpackChunkName: "questionnaire" */ '../journey/questionnaire/questionnaire-view.vue')
        },
        {
            path: 'questionnaire/test/:id',
            name: 'questionnaireTest',
            meta: { auth: 'journeyFormManagement', name: 'form.jinShuJu' },
            component: () => import(/* webpackChunkName: "questionnaire" */ '../journey/questionnaire/questionnaire-test.vue')
        },
        {
            path: 'questionnaire/customize/:id',
            name: 'questionnaireCustomize',
            meta: { auth: 'journeyFormManagement', name: 'form.customizeForm' },
            component: () => import(/* webpackChunkName: "questionnaire" */ '../journey/questionnaire/questionnaire-customize.vue')
        },

        // 微页面
        {
            path: 'micropage',
            name: 'microPageList',
            meta: { auth: 'mircopage', name: 'home.microPage' },
            component: () => import(/* webpackChunkName: "journey-micropage" */ '../micro-page/micro-page-list.vue')
        },
        {
            path: 'micropage/create',
            name: 'microPageCreate',
            meta: { auth: 'mircopage', name: 'microPage.microPageCreate' },
            component: () => import(/* webpackChunkName: "journey-micropage" */ '../micro-page/micro-page-edit.vue')
        },
        {
            path: 'micropage/edit',
            name: 'microPageEdit',
            meta: { auth: 'mircopage', name: 'microPage.microPageEdit' },
            component: () => import(/* webpackChunkName: "journey-micropage" */ '../micro-page/micro-page-edit.vue')
        },
        {
            path: 'micropage/publish',
            name: 'microPagePublish',
            meta: { auth: 'mircopage', name: 'microPage.microPagePublish' },
            component: () => import(/* webpackChunkName: "journey-micropage" */ '../micro-page/micro-page-publish.vue')
        },
        {
            path: 'micropage/data',
            name: 'microPageData',
            meta: { auth: 'mircopage', name: 'microPage.microPageData' },
            component: () => import(/* webpackChunkName: "journey-micropage" */ '../micro-page/micro-page-data.vue')
        }
    ]
};
