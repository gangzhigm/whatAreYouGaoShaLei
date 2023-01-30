import Model from 'web-model';
import LINKS from '@/LINKS';
import {store as i18nStore} from '@/locales';

export default new Model({
    base: LINKS.MANAGE_API_BASE + '/api',
    api: {
        /**
         *  获取在admin中手机号或邮箱是否可以编辑
         */
        getPrimaryKeyEdit ({ companyId }) {
            return this.request
                .get('/getPrimaryKeyEdit')
                .query({ companyId });
        },
        /**
         * 账户管理-账号成员名称列表
         * @returns 
         */
        getUserNameList() {
            return this.request
                .get(`/manage/v1/admin/user/getUserNameList`);
        },
        /**
         * 登录
         * @param email
         * @param password
         */
        signIn(email, password) {
            return this.request
                .post('/manage/v1/account/login')
                .escape('before')
                .set('Accept-Language', i18nStore.state.lang)
                .send({
                    email,
                    password,
                    isScrm: 1
                });
        },
        /**
         * 用户信息
         * @param email
         */
        userProfile(email) {
            return this.request
                .get('/manage/v1/account/home/profile')
                .query({email});
        },
        /**
         * 登陆后 获取客户【邮件余量】
         * @param email
         */
        userEmailNum(email) {
            return this.request
                .get('/manage/v1/account/getDmdSurplus')
                .query({email});
        },
        /**
         * 单点登录获取用户信息
         * @param userNumber
         * @param {number} type 单点登陆类型 1=华为 其他=Pall
         */
        ssoUserProfile(userNumber, type) {
            return this.request
                .get('/manage/v1/account/getToken')
                .escape('before')
                .query({userNumber, type});
        },
        /**
         * 账号是否已开通微信公众号的绑定
         */
        checkWeChat() {
            return this.request
                .get('/manage/v1/admin/user/wechatAuthorty');
        },
        /**
         * 个人设置
         * @param id
         * @param loginName
         * @param phone
         * @param surname
         * @param theName
         * @param timeZone
         * @param userName
         * @param language
         */
        savePersonal(id, loginName, phone, surname, theName, timeZone, userName, language) {
            return this.request
                .put('/manage/v1/admin/user/editPersonalSetting')
                .send(id, loginName, phone, surname, theName, timeZone, userName, language);
        },
        /**
         * 查看个人设置信息
         * @param id
         */
        getUser({id}) {
            return this.request
                .get('/manage/v1/admin/user/getUserMessage')
                .query({id});
        },

        /**
         * 旅程-获取审批人列表
         * @returns {*}
         */
        getApprovalList() {
            return this.request
                .get(`/manage/v1/admin/user/getUserList`);
        },

        /**
         * 获取当前规则
         */
        getRules() {
            return this.request
                .get('/manage/v1/sentFrequency/getRules');
        },
        /**
         *保存限制规则
         * @param limitStatus
         * @param openStatus
         * @param periodNumber
         * @param periodType
         * @param factor
         * @param conditionalFrequencyDTOList
         * @param runMode
         */
        saveRules({limitStatus, openStatus, periodNumber, periodType, factor,
            conditionalFrequencyDTOList, runMode}) {
            return this.request
                .post('/manage/v1/sentFrequency/saveRules')
                .send({
                    limitStatus, openStatus, periodNumber, periodType, factor, conditionalFrequencyDTOList, runMode
                });

        },
        /**
         *判断是否可以修改当前规则
         */
        getCheckStatus() {
            return this.request
                .get('/manage/v1/sentFrequency/checkStatus');
        },


        /**
         * 获取用户列表
         * @param parentId
         * @param departmentId
         * @param searchKeyword
         * @param searchType
         * @param userId
         * @param {number} currentStatus 状态筛选 1停用0启用（注意此处和正常的1/0定义相反） 非必需
         * @param {number} sort 根据失效时间排序 0降序1升序 非必需
         */
        getSubUserList({parentId, departmentId, searchKeyword, searchType, userId, currentStatus, sort}) {
            return this.request
                .get('/manage/v1/admin/user/getSubSysUserList')
                .query({parentId, departmentId, searchKeyword, searchType, userId, currentStatus, sort});
        },


        /**
         * 子账号禁用
         * @param {string} ids ex. id1,id2,id3
         */
        userForbidden(ids) {
            return this.request
                .get('/manage/v1/admin/user/forbidden')
                .query({
                    ids,
                });
        },


        /**
         * 子账号激活
         * @param {string} ids  ex. id1,id2,id3
         * @param {string} validTime  有效期设定值 YYYY-MM-DD
         */
        userActive(ids, validTime) {
            return this.request
                .get('/manage/v1/admin/user/activate')
                .query({
                    ids,
                    validTime
                });
        },
        /**
         * 得到子账号信息
         * @param id
         */
        getSubUser(id) {
            return this.request
                .get('/manage/v1/admin/user/getUser')
                .query({
                    id,
                });
        },
        /**
         * 增加用户
         * @param departmentId
         * @param loginName
         * @param {string} validTime 有效期 必填 YYYY-MM-DD
         * @param menuIds
         * @param moduleCount
         * @param phone
         * @param roleIds
         * @param roleName
         * @param roleRemark
         * @param status
         * @param surname
         * @param theName
         * @param timeZone
         * @param userName
         * @param userNumber
         */
        addSubuser({
            departmentId, loginName, validTime, menuIds, moduleCount,
            phone, roleIds, roleName, roleRemark, status, surname,
            theName, timeZone, userName, userNumber
        }) {
            return this.request
                .post('/manage/v1/admin/user/saveSubUser').send({
                    departmentId,
                    loginName,
                    validTime,
                    menuIds,
                    moduleCount,
                    phone,
                    roleIds,
                    roleName,
                    roleRemark,
                    status,
                    surname,
                    theName,
                    timeZone,
                    userName,
                    userNumber
                });
        },
        /**
         * 修改用户
         * @param id
         * @param departmentId
         * @param loginName
         * @param menuIds
         * @param moduleCount
         * @param phone
         * @param roleIds
         * @param roleName
         * @param roleRemark
         * @param status
         * @param surname
         * @param theName
         * @param timeZone
         * @param userName
         * @param userNumber
         */
        editSubuser({
            id, departmentId, loginName, validTime, menuIds, moduleCount, phone,
            roleIds, roleName, roleRemark, status, surname, theName, timeZone, userName, userNumber
        }) {
            return this.request
                .put('/manage/v1/admin/user/updateSysUser').send({
                    id,
                    departmentId,
                    loginName,
                    validTime,
                    menuIds,
                    moduleCount,
                    phone,
                    roleIds,
                    roleName,
                    roleRemark,
                    status,
                    surname,
                    theName,
                    timeZone,
                    userName,
                    userNumber
                });
        },


        /**
         * 删除用户
         * @param id
         * @param Ids
         */
        deleteSubuser(id, Ids) {
            return this.request
                .del('/manage/v1/admin/user/deleteUsers')
                .query(id, Ids);
        },

        // platformModel
        /*
        * 获取api统计数据
        */
        statisticalData() {
            return this.request
                .get('/v1/openapi/statisticalData');
        },
        /*
        * 获取api接口统计数据
        */
        apiInfoList() {
            return this.request
                .get('/v1/openapi/apiInfoList');
        },
        /*
        * 获取api认证信息
        */
        authInfo() {
            return this.request
                .get('/v1/openapi/authInfo');
        },
        /*
        * 重置accessSecret信息
        */
        resetAccessSecret() {
            return this.request
                .put('/v1/openapi/resetAccessSecret');
        },
        /*
        * 获取白名单列表
        */
        whiteList() {
            return this.request
                .get('/v1/openapi/whiteList');
        },
        /*
        * 添加白名单
        * @param type
        * @param content
        */
        createWhiteList(type, content) {
            return this.request
                .post('/v1/openapi/addWhiteList')
                .send({type, content});
        },
        /*
        * 删除白名单
        * @param type
        * @param content
        */
        deleteWhiteList(type, content) {
            return this.request
                .delete('/v1/openapi/deleteWhiteList')
                .send({type, content});
        },
        /*
        * 字段脱敏
        */
        fieldAttributesList() {
            return this.request
                .get('/v1/openapi/showFieldAttributesList');
        },
        /*
        * 保存字段脱敏
        * @param id
        * @param fieldName
        * @param name
        * @param desensitizationStatus
        * @param desensitizationType
        */
        saveFieldAttributes(paramList) {
            return this.request
                .post('/v1/openapi/saveFieldAttributes')
                .send(paramList);
        }
    }
});