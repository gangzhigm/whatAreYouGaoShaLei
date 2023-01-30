import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.GATE_ORIGIN + '/api/',
    api: {
        /**
         * 查看发送通道列表
         * @param departmentId
         * @param searchType
         */
        getAllSendChannel({departmentId, searchType}) {
            return this.request
                .get('getAllSendChannel')
                .query({departmentId, searchType});
        },
        /**
         * 根据uuid查询ossUrl
         * @param type 类型：华为导出oss文件 hwoss
         * @param uuid
         */
        getHwOosUrl(type, uuid) {
            return this.request
                .get('getOssUrlById')
                .query({type, uuid});
        },
        /**
         * 保存/编辑分组
         * @param name
         * @param id
         */
        changeConfig(userId) {
            return this.request
                .put('editConfig')
                .query({userId});

        },
        /**
         * 保存发送通道
         * @param departmentId  部门id
         * @param sendAddress   发件地址
         * @param sendType      0邮件 1短信 2彩信
         * @param senderId      邮件活动号
         * @param sendoutId     短信活动号
         * @param message       短信签名
         * @param senderList    发件人列表 sendType=0时，需要传参
         */
        saveSendChannel({departmentId, sendAddress, sendType, senderId, sendoutId, message, senderList}) {
            return this.request
                .post('saveSendChannel')
                .send({departmentId, sendAddress, sendType, senderId, sendoutId, message, senderList});
        },
        deleteSendChannel({id}) {
            return this.request
                .delete(`deleteSendChannel`)
                .query({id});
        },
        /**
         * 获取安全组列表
         * @param companyId
         * @param groupId
         * @param name
         * @param pageNumber
         */
        getSecurityGroups({companyId, groupId,name,pageNumber}) {
            return this.request
                .get('findAllRoles')
                .query({companyId, groupId,name,pageNumber});
        },

        /**
         * 获取角色列表
         * @param companyId
         * @param name
         */
        getRoleList(companyId, name, groupId) {
            return this.request
                .get(`findAllRoles`)
                .query({
                    companyId,
                    name,
                    groupId,
                });
        },
        /**
         * 新建安全组(基本信息)
         * @param companyId
         * @param copyRoleId
         * @param describe
         * @param groupId
         * @param roleName
         * @param status
         */
        createSaveRole({companyId, copyRoleId,describe,groupId,roleName,status}) {
            return this.request
                .post('saveRole')
                .send({
                    companyId, copyRoleId,describe,groupId,roleName,status
                });

        },
        /**
         * 删除安全分组
         * @param id
         */
        deleteSecurityGroup({id}) {
            return this.request
                .delete('deleteRole')
                .query({id});
        },
        /**
         * 获取角色下用户列表
         * @param roleId
         */
        getFindAllUsers({roleId}) {
            return this.request
                .get('findAllUsers')
                .query({roleId});

        },
        /**
         * 获取权限详情
         * @param companyId
         * @param roleId
         */
        getRoleMenus(companyId, roleId) {
            return this.request
                .get('getRoleMenus')
                .query({
                    companyId,
                    roleId,
                });
        },
        /**
         * 获取角色菜单权限
         * @param roleId
         * @param userId
         */
        getRoleMenu(roleId, userId) {
            return this.request
                .get('findRoleMenu')
                .query({roleId, userId});
        },
        /**
         * 登录后查看角色功能权限
         * 细分至每个页面，每个按钮
         * @param userId
         * @returns {*}
         */
        getNewRoleMenu(userId) {
            return this.request
                .get('findAllRole')
                .query({userId});
        },
        /**
         * 编辑安全组全部信息
         */
        EditSecurityAllData(choiceMenuIds, companyId, dataMenuIds, describe, groupId, id, 
            mustMenuIds, roleName, status,fieldList) {
            return this.request
                .post('saveRoleAllData')
                .send(choiceMenuIds, companyId, dataMenuIds, describe, groupId, id, 
                    mustMenuIds, roleName, status,fieldList);
        },
        /**
         * 新建安全组获取安全组列表
         * @param companyId
         * @param groupId
         * @param name
         */
        getGroupByRoles({companyId, groupId,name}) {
            return this.request
                .get('getGroupByRoles')
                .query({companyId, groupId,name});
        },
        /**
         * 获取模块列表
         */
        getModuleList() {
            return this.request
                .get(`getModuleList`);
        },
        /**
         * 重置密码
         * @param email
         * @param phone
         */
        resetPassWord({email, phone, userId}) {
            return this.request
                .post('resetPassWord').query({email, phone, userId});
        },
        /**
         * 修改密码
         * @param email
         * @param newPassword
         * @param oldPassword
         */
        changePassword(email, newPassword, oldPassword) {
            return this.request
                .post('account/changePwd')
                .send({
                    email,
                    newPassword,
                    oldPassword
                });
        },
        /**
         * 获取旅程审批（是否有权限）
         * @param userId    用户id
         * @returns {*}
         */
        getConfig(userId) {
            return this.request
                .get('globalConfig')
                .query({userId});
        },
        /**
         * 获取两步验证（是否开启）
         * @param userId    用户id
         * @returns {*}
         */
        getSystemConfig(userId) {
            return this.request
                .get('getSystemConfig')
                .query({userId});
        },
        /**
         * 发送验证码
         * @param email     邮箱
         * @param password  密码
         * @param phone     手机号
         * @param areaCode  区号
         * @returns {*}
         */
        sendSMSCode(email, password, phone, areaCode) {
            return this.request
                .get('validatePwd')
                .query({email, password, phone, areaCode});
        },
        /**
         * 校验验证码
         * @param email         邮箱
         * @param validatePwd   验证码
         * @param phone         手机号
         * @returns {*}
         */
        verifySMSCode(email, validatePwd, phone) {
            return this.request
                .get('verify')
                .query({email, validatePwd, phone});
        },
        /**
         * 编辑两步验证
         * @param userId    用户 ID
         * @returns {*}
         */
        changeTwoFactor(userId) {
            return this.request
                .put('editSystemConfig')
                .query({userId});
        },
        /**
         * 查询付费功能是否可用
         * @param configName    按钮类型
         * @returns {*}
         */
        getGlobalConfByConfigName({configName}) {
            return this.request
                .get('getGlobalConfByConfigName')
                .query({configName});
        },
    }
});