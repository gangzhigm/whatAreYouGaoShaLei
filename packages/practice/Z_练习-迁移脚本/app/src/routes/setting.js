
/**
 * 企业设置
 */
export default {
    name: 'orgSetting',
    path: '/orgSetting',
    meta: { auth: true, name: 'EnterPrise.enterpriseSettings' },
    component: () => import(/* webpackChunkName: "org-setting" */'../setting/setting.vue'),
    redirect: { name: 'orgMember' },
    children: [
        // 组织成员
        {
            path: 'orgMember',
            name: 'orgMember',
            meta: { name: 'EnterPrise.orgMember', auth: 'orgSetting' },
            component: () => import(/* webpackChunkName: "org-setting" */'../setting/organization/org-member.vue')
        },
        {
            path: 'orgMember/:id/add',
            name: 'addMemberForm',
            meta: { auth: 'orgMember', name: 'EnterPrise.addUser' },
            component: () => import(/* webpackChunkName: "org-setting" */'../setting/organization/org-member-form.vue')
        },
        {
            path: 'orgMember/:id/edit',
            name: 'editMemberForm',
            meta: { auth: 'orgMember', name: 'EnterPrise.edit' },
            component: () => import(/* webpackChunkName: "org-setting" */'../setting/organization/org-member-form.vue')
        },
        // 权限管理
        {
            path: 'privilegeSecurity',
            name: 'privilegeSecurity',
            meta: { name: 'privilege.privilegeSecurity', auth: 'privilegeSecurity' },
            component: () => import(/* webpackChunkName: "org-setting" */ '../setting/privilege-security/privilege-security-list.vue')
        },
        {
            path: 'privilegeSecurity/edit/:id',
            name: 'securityManagement',
            meta: { name: 'privilege.edit', auth: 'privilegeSecurity' },
            component: () => import(/* webpackChunkName: "org-setting" */ '../setting/privilege-security/security-group.vue'),
            redirect: { name: 'baseInfo' },
            children: [
                // 基本信息
                {
                    path: 'baseInfo',
                    name: 'baseInfo',
                    meta: { name: 'privilege.baseInfo', auth: 'orgSetting' },
                    component: () => import(/* webpackChunkName: "org-setting" */ '../setting/privilege-security/security-group/base-info.vue')
                },
                // 操作权限
                {
                    path: 'operateAuthority',
                    name: 'operateAuthority',
                    meta: { name: 'privilege.operateAuthority', auth: 'orgSetting' },
                    component: () => import(/* webpackChunkName: "org-setting" */ '../setting/privilege-security/security-group/operate-authority.vue')
                },
                // 管理权限
                {
                    path: 'managementAuthority',
                    name: 'managementAuthority',
                    meta: { name: 'privilege.managementAuthority', auth: 'orgSetting' },
                    component: () => import(/* webpackChunkName: "org-setting" */ '../setting/privilege-security/security-group/manage-authority.vue')
                },
                // 数据权限
                {
                    path: 'dataAuthority',
                    name: 'dataAuthority',
                    meta: { name: 'privilege.dataAuthority', auth: 'orgSetting' },
                    component: () => import(/* webpackChunkName: "org-setting" */ '../setting/privilege-security/security-group/data-authority.vue')
                },
                // 字段权限
                {
                    path: 'fieldPermission',
                    name: 'fieldPermission',
                    meta: { name: 'privilege.fieldPermission', auth: 'orgSetting' },
                    component: () => import(/* webpackChunkName: "org-setting" */ '../setting/privilege-security/security-group/field-permission.vue')
                },
            ]
        },
        // 数据共享
        {
            path: 'dataSharing',
            name: 'dataSharing',
            meta: { name: 'sharing.title', auth: 'dataSharing' },
            component: () => import(/* webpackChunkName: "org-setting" */ '../setting/data-sharing/data-sharing.vue')
        },
        {
            path: 'dataSharing/:id/customerSharingAdd',
            name: 'addSharingForm',
            meta: { name: 'sharing.addRule', auth: 'dataSharing' },
            component: () => import(/* webpackChunkName: "org-setting" */ '../setting/data-sharing/data-sharing-form.vue')
        },
        {
            path: 'dataSharing/:id/customerSharingEdit',
            name: 'editSharingForm',
            meta: { name: 'sharing.editRule', auth: 'dataSharing' },
            component: () => import(/* webpackChunkName: "org-setting" */ '../setting/data-sharing/data-sharing-form.vue')
        },
        {
            path: 'dataSharing/:id/resourceSharingAdd',
            name: 'addResourceSharingForm',
            meta: { name: 'sharing.addRule', auth: 'dataSharing' },
            component: () => import(/* webpackChunkName: "org-setting" */ '../setting/data-sharing/data-resource-sharing-form.vue')
        },
        {
            path: 'dataSharing/:id/resourceSharingEdit',
            name: 'editResourceSharingForm',
            meta: { name: 'sharing.editRule', auth: 'dataSharing' },
            component: () => import(/* webpackChunkName: "org-setting" */ '../setting/data-sharing/data-resource-sharing-form.vue')
        },

        // 渠道分配
        {
            path: 'sendChannel',
            name: 'sendChannel',
            meta: { name: 'sendChannel.title', auth: 'sendChannel' },
            component: () => import(/* webpackChunkName: "org-setting" */ '../setting/send-channel/send-channel.vue')
        },
        // 发送频次
        {
            path: 'sentFrequency',
            name: 'sentFrequency',
            meta: { name: 'frequency.title', auth: 'sentFrequency' },
            component: () => import(/* webpackChunkName: "org-setting" */ '../setting/frequency/sent-frequency.vue')
        },
        // 系统设置
        {
            path: 'systemSettings',
            name: 'systemSettings',
            meta: { name: 'systemSet.title', auth: 'systemSettings' },
            component: () => import(/* webpackChunkName: "org-setting" */ '../setting/system-settings/system-settings.vue')
        },
        // 微信公众号
        {
            path: 'WeChatPublicNo',
            name: 'WeChatPublicNo',
            meta: { name: 'wechatNo.title', auth: 'WeChatPublicNo' },
            component: () => import(/* webpackChunkName: "org-setting" */ '../setting/WeChat-no/WeChat-no.vue')
        },
        //企业微信
        {
            path: 'enterpriseWeChat',
            name: 'EnterpriseWeChat',
            meta: { name: 'enterpriseWeChat.title', auth: 'workWeChat' },
            component: () => import(/* webpackChunkName: "org-setting" */ '../setting/enterprise-WeChat/enterprise-WeChat.vue')
        },
        {
            path: 'enterpriseWeChat/agentConfig',
            name: 'AgentConfig',
            meta: { name: 'enterpriseWeChat.agentConfig', auth: 'workWeChat' },
            component: () => import(/* webpackChunkName: "org-setting" */ '../setting/enterprise-WeChat/agent-config.vue')
        },
        {
            path: 'enterpriseWeChat/organizationStaff',
            name: 'OrganizationStaff',
            meta: { name: 'enterpriseWeChat.staff', auth: 'workWeChat' },
            component: () => import(/* webpackChunkName: "org-setting" */ '../setting/enterprise-WeChat/organization-staff.vue')
        },
        {
            path: 'enterpriseWeChat/sidebarPortrayalConfig',
            name: 'SidebarPortrayalConfig',
            meta: { name: 'enterpriseWeChat.chatToolbarConfiguration', auth: 'workWeChat' },
            component: () => import(/* webpackChunkName: "org-setting" */ '../setting/enterprise-WeChat/sidebar-portrayal-config.vue')
        },
        //微信小程序
        {
            path: 'MiniProgram',
            name: 'MiniProgram',
            meta: {name: 'miniProgram.title', auth: 'miniprogram'},
            component: () => import(/* webpackChunkName: "mini-program" */ '../setting/mini-program/mini-program.vue')
        },
        // API开放平台
        {
            path: 'openPlatform',
            name: 'openPlatform',
            meta: { name: 'openPlat.title', auth: 'openPlatform' },
            component: () => import(/* webpackChunkName: "org-setting" */ '../setting/open-platform/open-platform.vue')
        },
    ]
};
