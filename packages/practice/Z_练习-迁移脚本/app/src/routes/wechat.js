const App = () => import(/* webpackChunkName: "app" */ '../layout/index.vue');

/**
 * 微信管理
 */
export default [
    // 绑定公众号引导页
    {
        path: '/bind-wechat-official-account',
        name: 'bindWechatOfficialAccount',
        meta: { name: 'wechatAccount.DmarTechAuth', auth: 'wechat' },
        component: () => import(/* webpackChunkName: "wechat-account", */ '../wechat/account/bind-wechat-official-account-now.vue')
    },
    // 授权公众号起始页
    {
        path: '/wechat-account-authorization',
        name: 'wechatAccountAuthorization',
        meta: { name: 'wechatAccount.authorizedToDmk', auth: 'wechat' },
        component: () => import(/* webpackChunkName: "wechat-account", */ '../wechat/account/wechat-account-authorize.vue')
    },
    // 授权公众号落地页
    {
        path: '/wechat-account-authorization-result',
        name: 'wechatAccountAuthorizeResult',
        meta: { name: 'wechatAccount.authorizedToDmk', auth: 'wechat' },
        component: () => import(/* webpackChunkName: "wechat-account" */ '../wechat/account/wechat-account-authorize-result.vue')
    },
    {
        path: '/wechat',
        name: 'wechat',
        meta: { name: 'Dmartech', auth: true, officialAccountNecessary: true },
        component: App,
        redirect: { name: 'home' },
        children: [
            // 授权公众号列表
            {
                path: 'accounts',
                name: 'wechatAccounts',
                meta: { name: 'home.officialAccount', auth: 'wechat' },
                component: () => import(/* webpackChunkName: "wechat-account" */ '../wechat/account/account-list.vue')
            },
            // 二维码管理
            {
                path: 'qr-code',
                name: 'subscriptionManage',
                meta: { name: 'home.subscriptionManage' },
                component: () => import(/* webpackChunkName: "qr-code" */ '../wechat/qr-code/qr-code-list.vue'),
            },
            // 世邦定制
            // 二维码活动管理
            {
                path: `shibangActivity`,
                name: 'shibangActivity',
                meta: { auth: 'qrcodeActivityList' },
                component: () => import(/* webpackChunkName: "qr-code" */'../wechat/shibang/activitylist.vue'),
            },
            {
                path: 'qr-code/:id/edit',
                name: 'qrCodeEdit',
                meta: { auth: 'subscriptionManage', name: 'QRCode.create' },
                component: () => import(/* webpackChunkName: "qr-code" */ '../wechat/qr-code/qr-code-form.vue')
            },
            {
                path: 'qr-code/:id/detail',
                name: 'qrCodeView',
                meta: { auth: 'subscriptionManage', name: 'QRCode.detail' },
                component: () => import(/* webpackChunkName: "qr-code" */ '../wechat/qr-code/qr-code-view.vue')
            },
            // 发送消息
            {
                path: 'mass-send',
                name: 'massSend',
                redirect: 'mass-send/form',
                meta: { name: 'home.massSend', auth: true },
                component: () => import(/* webpackChunkName: "wechat-send" */'../wechat/mass-send/mass-send.vue'),
                children: [
                    {
                        path: 'form',
                        name: 'massSendForm',
                        meta: { name: 'home.createMessage', auth: 'massSend' },
                        component: () => import(/* webpackChunkName: "wechat-send" */'../wechat/mass-send/mass-send-form.vue')
                    },
                    {
                        path: 'list',
                        name: 'massSentList',
                        meta: { name: 'home.sent', auth: 'massSend' },
                        redirect: 'list/group',
                        component: () => import(/* webpackChunkName: "wechat-send" */'../wechat/mass-send/mass-send-list.vue'),
                        children: [
                            {
                                path: 'group',
                                name: 'groupMessage',
                                meta: { name: 'home.group', auth: 'massSend' },
                                component: () => import(/* webpackChunkName: "wechat-send" */'../wechat/mass-send/components/group-mass.vue'),
                            },
                            {
                                path: 'customer',
                                name: 'customerMassage',
                                meta: { name: 'home.customService', auth: 'massSend' },
                                component: () => import(/* webpackChunkName: "wechat-send" */'../wechat/mass-send/components/customer-mass.vue'),
                            },
                            {
                                path: 'tem',
                                name: 'templateMassage',
                                meta: { name: 'home.tem', auth: 'massSend' },
                                component: () => import(/* webpackChunkName: "wechat-send" */'../wechat/mass-send/components/tem-mass.vue'),
                            },
                        ]
                    }
                ]
            },
            // 自动回复
            {
                path: 'reply',
                name: 'reply',
                meta: { name: 'home.reply' },
                component: () => import(/* webpackChunkName: "wechat-reply" */'../wechat/reply/reply.vue')
            },
            // 自定义菜单, 个性化菜单
            {
                path: 'menus',
                name: 'menus',
                meta: { name: 'home.customizeMenus' },
                redirect: 'menus/diy',
                component: () => import(/* webpackChunkName: "wechat-menu" */'../wechat/menu/menu.vue'),
                children: [
                    {
                        path: 'diy',
                        name: 'diyMenu',
                        meta: { auth: 'menus', name: 'home.diyMenu' },
                        component: () => import(/* webpackChunkName: "wechat-menu" */'../wechat/menu/diy-menu.vue')
                    },
                    {
                        path: 'customize',
                        name: 'customizeMenu',
                        meta: { auth: 'menus', name: 'home.customizeMenu' },
                        component: () => import(/* webpackChunkName: "wechat-menu" */'../wechat/menu/customize-menu.vue'),
                    },
                    {
                        path: 'customize/create/:ruleId',
                        name: 'createCustomizeMenuForm',
                        meta: { auth: 'menus', name: 'home.customizeMenuForm' },
                        component: () => import(/* webpackChunkName: "wechat-menu" */'../wechat/menu/customize-menu-form.vue')
                    },
                    {
                        path: 'customize/edit/:ruleId',
                        name: 'editCustomizeMenuForm',
                        meta: { auth: 'menus', name: 'home.editCustomizeMenu' },
                        component: () => import(/* webpackChunkName: "wechat-menu" */'../wechat/menu/customize-menu-form.vue')
                    }
                ]
            },
            // 消息管理
            {
                path: 'message',
                name: 'wechatMessageManage',
                meta: { name: 'home.message' },
                component: () => import(/* webpackChunkName: "wechat-message" */'../wechat/message/wechat-message.vue')
            },
            {
                path: 'message/chat',
                name: 'chat',
                meta: { auth: 'wechatMessageManage', name: 'message.chatLog' },
                component: () => import(/* webpackChunkName: "wechat-message" */'../wechat/message/chat.vue')
            },
            // 粉丝管理
            {
                path: 'fans',
                name: 'wechatFans',
                meta: { name: 'home.fans' },
                redirect: 'fans/following',
                component: () => import(/* webpackChunkName: "wechat-fans" */'../wechat/fans/fans-manage.vue'),
                children: [
                    {
                        path: 'following',
                        name: 'wechatFansNow',
                        meta: { auth: 'wechatFans', name: 'follower.followers' },
                        component: () => import(/* webpackChunkName: "wechat-fans" */'../wechat/fans/fans.vue')
                    },
                    {
                        path: 'un-followed',
                        name: 'wechatFansUsedToBe',
                        meta: { auth: 'wechatFans', name: 'follower.unFollow' },
                        component: () => import(/* webpackChunkName: "wechat-fans" */'../wechat/fans/un-followed.vue')
                    }
                ]
            },
            // 微信素材
            {
                path: 'material',
                name: 'material',
                meta: { name: 'home.material' },
                redirect: 'material/image-text',
                component: () => import(/* webpackChunkName: "wechat-material" */'../wechat/material/material-manage.vue'),
                children: [
                    {
                        path: 'image-text',
                        name: 'imageTextList',
                        meta: { auth: 'material', name: 'wechatContent.draftBox' },
                        component: () => import(/* webpackChunkName: "wechat-material" */'../wechat/material/image-text-material-list.vue')
                    },
                    {
                        path: 'image-text/create',
                        name: 'imageTextCreate',
                        meta: { auth: 'material', name: 'QRCode.newAppMsg' },
                        component: () => import(/* webpackChunkName: "wechat-material" */'../wechat/material/image-text-material-form.vue')
                    },
                    {
                        path: 'image-text/edit',
                        name: 'imageTextEdit',
                        meta: { auth: 'material', name: 'QRCode.editAppMsg' },
                        component: () => import(/* webpackChunkName: "wechat-material" */'../wechat/material/image-text-material-form.vue')
                    },
                    {
                        path: 'img',
                        name: 'imageList',
                        meta: { auth: 'material', name: 'wechatContent.pics' },
                        component: () => import(/* webpackChunkName: "wechat-material" */'../wechat/material/image-material-list.vue')
                    },
                    {
                        path: 'audio',
                        name: 'audioList',
                        meta: { auth: 'material', name: 'wechatContent.audio' },
                        component: () => import(/* webpackChunkName: "wechat-material" */'../wechat/material/audio-material-list.vue')
                    },
                    {
                        path: 'video',
                        name: 'videoList',
                        meta: { auth: 'material', name: 'wechatContent.video' },
                        component: () => import(/* webpackChunkName: "wechat-material" */'../wechat/material/video-material-list.vue')
                    },
                    {
                        path: 'video/form',
                        name: 'videoForm',
                        meta: { auth: 'material', name: 'QRCode.uploadVideo' },
                        component: () => import(/* webpackChunkName: "wechat-material" */'../wechat/material/video-material-form.vue')
                    },
                    {
                        path: 'publish',
                        name: 'publish',
                        meta: { auth: 'material', name: 'wechatContent.publish' },
                        component: () => import(/* webpackChunkName: "wechat-material" */'../wechat/material/publish-material-list')
                    },
                ]
            },
            // 模板管理
            {
                path: 'template',
                name: 'template',
                meta: { name: 'home.template' },
                redirect: 'template/myTemplate',
                component: () => import(/* webpackChunkName: "wechat-template" */'../wechat/template/template-manage.vue'),
                children: [
                    {
                        path: 'myTemplate',
                        name: 'myTemplate',
                        meta: { auth: 'template', name: 'template.myTemplate' },
                        component: () => import(/* webpackChunkName: "wechat-template" */'../wechat/template/template-list.vue')
                    },
                    {
                        path: 'invalid-template',
                        name: 'invalidTemplate',
                        meta: { auth: 'template', name: 'template.invalidTemplate' },
                        component: () => import(/* webpackChunkName: "wechat-template" */'../wechat/template/invalid-template-list.vue')
                    },
                    {
                        path: 'myTemplate/compile',
                        name: 'templateDetail',
                        meta: { auth: 'template', name: 'template.editTemplate' },
                        component: () => import(/* webpackChunkName: "wechat-template" */'../wechat/template/template-detail.vue')
                    },
                    {
                        path: 'invalid-template/detail',
                        name: 'invalidTemplateDetail',
                        meta: { auth: 'template', name: 'template.invalidDetails' },
                        component: () => import(/* webpackChunkName: "wechat-template" */'../wechat/template/invalid-template-detail.vue')
                    }
                ]
            }
        ]
    },

    // 授权小程序起始页
    {
        path: '/mini-program-authorization',
        name: 'MiniProgramAuthorization',
        meta: { name: 'wechatAccount.authorizedToDmk', auth: 'miniprogram' },
        component: () => import(/* webpackChunkName: "mini-program-authorization" */ '../setting/mini-program/min-program-authorization.vue')
    },
    // 授权小程序落地页
    {
        path: '/mini-program-authorization-result',
        name: 'MiniProgramAuthorizationResult',
        meta: { name: 'wechatAccount.authorizedToDmk', auth: 'miniprogram' },
        component: () => import(/* webpackChunkName: "mini-program-authorization-result" */ '../setting/mini-program/mini-program-authorization-result.vue')
    },
];
