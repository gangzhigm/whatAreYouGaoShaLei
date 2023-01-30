import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.CONTACT_API_BASE + '/api/contact/v1',
    api: {

        /**
         * 新增单个联系人
         * @param customerAttrJson
         */
        addCustomer (customerAttrJson) {
            return this.request
                .post('/addCustomer')
                .send(customerAttrJson);
        },


        /**
         * 移除单个联系人
         * @param customerId
         * @return {*}
         */
        removeCustomer (customerId) {
            return this.request
                .del('/deleteCustomer')
                .query({ customerId });
        },


        /**
         * 根据用户id添加会员标签（会员标签）
         * @param customerId
         * @param labelIds
         * @return {*}
         */
        addTagForCustomer (customerId, labelIds) {
            return this.request
                .post('/label/saveCustomerLabelAndAdd')
                .send({
                    customerId,
                    labelIds
                });
        },


        /**
         * 根据用户id删除会员标签
         * @param customerId
         * @param labelId
         * @return {*}
         */
        removeTagFromCustomer (customerId, labelId) {
            return this.request
                .get('/label/deleteCustomerLabel')
                .query({
                    customerId,
                    labelId
                });
        },


        /**
         * 联系人所有分组 （包含已删除）
         */
        getAllGroups () {
            return this.request
                .get('/groupAll');
        },


        /**
         * 创建联系人组
         * @param name
         * @return {Request|*}
         */
        createGroup (name) {
            return this.request
                .post('/group')
                .send({ name });
        },


        /**
         * 重命名
         * @param id
         * @param name
         * @return {Request|*}
         */
        update (id, name) {
            return this.request
                .put(`/group/${id}`)
                .send({ name });
        },


        /**
         * 导出
         * @param groupIds
         * @param emailAddress
         */
        exportData (groupIds, emailAddress) {
            return this.request
                .get(`/group/export`)
                .query({
                    groupIds,
                    emailAddress
                });
        },


        /**
         * 删除
         * @param groupIds
         * @param thorough
         * @return {Request|*}
         */
        del (groupIds, thorough) {
            return this.request
                .del(`/group`)
                .send({
                    groupIds,
                    status: thorough ? 1 : 0
                });
        },


        /**
         * 导入联系人-上传文件
         * @param file
         * @param progressWatcher funciton
         * @return {Request}
         */
        upload (file, progressWatcher) {
            return this.request
                .post('/group/file/scrm')
                .attach('file', file)
                .on('progress', progressWatcher);
        },


        decisionOptions () {
            return this.request.get('/getConditionsBranch');
        },

        scrmUserGroup () {
            return this.request.get('/getAllGroupByCompanyId');
        },

        /**
         *  按照用户属性模糊查询用户信息列表
         *  @param field
         *  @param query
         */
        getCustomerByQuery (field, query) {
            return this.request
                .get('/getCustomerByQuery')
                .query({
                    field,
                    query
                });
        },
        /**
        * 企业微信 联系人-按照事件属性模糊查询事件信息列表
        * @param field
        * @param value
        */
        getEventCustomerParamByQuery (field, value) {
            return this.request
                .get('/getEventCustomerParamByQuery')
                .query({
                    field, value
                });
        },
        /**
         * 获取联系人订阅状态
         * @param id
         */
        getCustomerSendStatus (id) {
            return this.request
                .get('/fieldControl/getUnsubscribeStatus')
                .query({ id: id });
        },

        /**
         * 获取评分详情列表数据
         * @param userId
         */
        getGradeScoreList (userId) {
            return this.request
                .get(`/getGradeScoreList`)
                .query({ userId: userId || '' });
        },
        /**
        * 获取打分评级列表数据
        * @param userId
        */
        getScoringDetailList (userId, pageNumber, pageSize) {
            return this.request
                .get('/getScoringDetail')
                .query({ userId, pageNumber, pageSize });
        },
        /**
         * 获取额联系人基本信息
         * @param id
         */
        getCustomerDetail (id) {
            return this.request
                .get('/fieldControl/getCustomerInfo')
                .query({
                    id
                });
        },

        /**
         *  --- START migrated from outdated src/analysis/attribute-analysis/attributeService.js ---
         */

        /**
         * 用户行为序列
         * @param cid
         * @param eventIds
         * @param events
         * @param fromDate
         * @param pagination
         * @param propIds
         * @param rollup
         * @param toDate
         * @param unit
         * @param userId
         */
        getSequence ({ cid, eventIds, events, fromDate, pagination, propIds, rollup, toDate, unit, userId }) {
            return this.request
                .post(`/fieldControl/getCustomerEvent`)
                .send({
                    cid,
                    eventIds,
                    events,
                    fromDate,
                    pagination,
                    propIds,
                    rollup,
                    toDate,
                    unit,
                    userId
                });
        },

        /**
         * 获取额联系人用户属性
         * @param id
         */
        getUserProperties (id) {
            return this.request
                .get(`/fieldControl/getCustomerAttribute`)
                .query({
                    id
                });
        },
        /**
         * 粉丝管理页面跳转联系人详情页面获取customerId
         * @param appid
         * @param openid
         * @param type 1为公众号 2为小程序
         *
         */
        getCustomerId (appid, openid, type) {
            return this.request
                .get(`/getCustomerId`)
                .query({
                    appid,
                    openid,
                    type
                });
        },

        /**
         *  --- END migrated from outdated src/analysis/attribute-analysis/attributeService.js ---
         */


        /**
         *  --- START migrated from outdated src/customer/swarm/swarmModel.js ---
         */

        /**
         * 1.【新】保存更新分组
         * @param id Number 分组id
         * @param name String 分组名
         * @param parentId Number 父级分组id
         * @returns {*}
         */
        saveOrUpdate (id, name, parentId) {
            return this.request
                .post('/contactFilterGroup/saveOrUpdate')
                .send({ id, name, parentId });
        },

        /**
         * 2.【新】删除联系人分组
         * @param id Number 分组id
         * @returns {*}
         */
        deleteGroup (id) {
            return this.request
                .delete('/contactFilterGroup/deleteGroup')
                .send({ id });
        },

        /**
         * 3.【新】获取联系人分组
         * @param sortType 排序方式 1.创建时间降序 2.创建时间升序 3.更新时间降序 4.更新时间升序 // 5.分组名称降序 6.分组名称升序 默认:更新时间降序
         * @returns {*}
         */
        getGroupList (sortType) {
            return this.request
                .get('/contactFilterGroup/getGroupList')
                .query({ sortType });
        },

        /**
         * 4.【新】分群列表【仅用于联系人分群展示页面替换，原旅程调用接口不变】
         * @param groupId Number 分组id
         * @param pageNumber Number 页码
         * @param searchName Number 关键字
         * @param sort String 正逆序('asc','dsc')
         * @param sortField String 排序类别
         * @returns {*}
         */
        getSwarmList (groupId, pageNumber, searchName, sort, sortField) {
            return this.request
                .get('/getSwarmList')
                .query({ groupId, pageNumber, searchName, sort, sortField });
        },

        /**
         * 5.【新】获取退订分群
         * @returns {*}
         */
        getSystemSwarmList () {
            return this.request.get('/getSystemSwarmList');
        },

        /**
         * 6.【旧】原编辑分群名称和分群条件合为一个接口（请求参数中加入groupId）
         * @param id Number 分群id
         * @param name String 分群名
         * @param swarmJson String 分群条件（数组=>字符串）
         * @param groupId Number 分组id
         * @param operation Number 子分群状态 0 包含 1 排除 （默认 0）
         * @param type Number 分群状态 0 过滤器 1普通分群 8 高级分群 9 子分群 其他有对应功能
         * @returns {*}
         */
        updateSwarm ({ id, name, swarmJson, groupId, operation, type }) {
            return this.request.put('/swarmUpdate')
                .send({ id, name, swarmJson, groupId, operation, type });
        },

        /**
         *  7.【旧】新增/编辑分群（请求参数中加入groupId）
         * @param name String 分群名
         * @param swarmJson String 分群条件（数组=>字符串）
         * @param groupId Number 分组id
         * @param parentId Number 默认 0 子分群时候 传高级分群id
         * @param operation Number 子分群状态 0 包含 1 排除 （默认 0）
         * @param type Number 分群状态 0 过滤器 1普通分群 8 高级分群 9 子分群 其他有对应功能
         */
        saveSwarm ({ name, swarmJson, groupId, parentId, operation, type }) {
            return this.request.post('/swarm')
                .send({ name, swarmJson, groupId, parentId, operation, type });
        },

        /**
         * 8.【新】批量删除分群
         * @param swarmIdArray Array 分群id数组
         * @returns {*}
         */
        batchDeleteSwarm (swarmIdArray) {
            return this.request
                .delete('/batchDeleteSwarm')
                .send({ swarmIdArray });
        },

        /**
         * 9.【新】批量移动分群
         * @param groupId Number 目标分组id
         * @param swarmIdArray Array  分群id数组
         * @returns {*}
         */
        batchRemoveSwarm (groupId, swarmIdArray) {
            return this.request
                .post('/batchRemoveSwarm')
                .send({ groupId, swarmIdArray });
        },

        /**
         * 10.【旧】删除分群（无变化）
         * @param id
         * @returns {*}
         */
        deleteSwarm (id) {
            return this.request
                .del(`/swarm/${id}`);
        },

        /**
         * 复制分群
         * @param id
         * @returns {*}
         */
        copySwarm (id) {
            return this.request
                .get(`/copySwarm`)
                .query({ id });
        },

        /**
         * 高级分群详情
         * @param id
         * @returns {*}
         */
        getAdvanced (id) {
            return this.request
                .get(`/getHighSwarmDetail`)
                .query({ id });
        },

        /**
         * 高级分群内复制子分群
         * @param id
         * @param copyIds   子分群id数组
         * @returns {*}
         */
        advancedCopySwarm ({ id, copyIds }) {
            return this.request
                .post(`/highSwarmCopySwarm`)
                .send({ id, copyIds });
        },

        /**
         * 高级分群计算
         * @param swarmId
         * @returns {*}
         */
        advancedCalculation (swarmId) {
            return this.request
                .get(`/highSwarmCalculation`)
                .query({ swarmId });
        },

        /**
         * 获取高级分群状态
         * @param swarmId
         * @returns {*}
         */
        getAdvancedStatus (swarmId) {
            return this.request
                .get(`/highSwarmStatus`)
                .query({ swarmId });
        },

        /**
         * 获取联系人属性列表
         * @returns {*}
         */
        getAllUserAttrs () {
            return this.request
                .get(`/customerField/getAllFieldAndShowFieldIds`);
        },
        /**
         * 分群列表(old)
         * 1: 创建时间降序
         * 2: 创建时间生序
         * 3: 更新时间降序
         * 4: 更新时间升序
         * 5: 分群名称降序
         * 6: 分群名称升序
         */
        getSwarms (sort = 3, searchName) {
            return this.request
                .get('/swarm')
                .query({ sort, searchName });
        },

        // 分群详情
        swarmDetail (id) {
            return this.request
                .get(`/swarm/${id}`);
        },

        /**
         * 分群详情【分群id数组】
         * swarmIds     分群ids
         * type         是否返回被删除的分群  0不返回，1返回，默认为0
         */
        swarmDetailList ({ swarmIds, type }) {
            return this.request
                .get('/swarm/list')
                .query({ swarmIds, type });
        },

        // 分群详情权限
        swarmCheckAction ({ swarmId, actionType }) {
            return this.request
                .get(`/checkAction`)
                .query({ swarmId, actionType });
        },

        /**
         * 获取自定义字段
         * @param status , 0 客户 1 订单 2 商品
         * @param dateFlag 1=返回更新时间；不传=不返回更新时间
         * @param needLabelIds 0不返回标签字段，不传返回标签字段
         * @param type 分群、高级分群、标签管理、数据共享的联系人共享调用时增加type=1(企业微信相关)
         * @returns {*}
         */
        customWorld (status, dateFlag, needLabelIds, type) {
            return this.request
                .get('/customerFieldList')
                .query({
                    status,
                    dateFlag,
                    needLabelIds,
                    type
                });
        },

        /**
         * 获取自定义字段关系
         * type 权限限制 0是没有权限限制，非0是有权限限制，默认为1
         */
        relation (type = 1) {
            return this.request
                .get('/customerFieldOperators')
                .query({
                    type
                });
        },

        /**
         * 用户列表可选的所有联系人属性
         */
        getAllUserAttrList () {
            return this.request
                .get(
                    '/customerField/getCustomerFieldByCompanyIdExceptShow'
                );
        },

        /**
         * 用户已选属性
         */
        getUserSelected () {
            return this.request
                .get(
                    '/customerField/getCustomerFieldListForShow'
                );
        },

        /**
         *  联系人列表数据表格
         *  @param {Object} query
         *  customerFieIdId 检索的字段(Id) Number
         *  pageNumber 页码 Number
         *  pageSize 每页显示数量 Number
         *  searchName 检索的关键字 String
         *  sort 排序方式 asc desc
         *  sortField 排序字段 String
         *  customerType 联系人类型 Number
         *  @param {array<String>}  appIds 微信粉丝联系人：公众号列表
         */
        getTableList (query) {
            return this.request
                .get('/contactInfoList')
                .query(query);
        },

        /**
         * 保存已选择的列
         * @param selectFieldIds
         * @return {*}
         */
        saveSelectedAttrIds (selectFieldIds) {
            return this.request
                .get('/customerField/saveCustomerFieldListForShow')
                .query({ selectFieldIds });
        },

        /**
         * 获取联系人分群内的联系人列表
         * @param {id} id
         * @param {Object} query
         * customerFieIdId 检索的字段(Id) Number
         * pageNumber 页码 Number
         * pageSize 每页显示数量 Number
         * searchName 检索的关键字 String
         * sort 排序方式 asc desc
         * sortField 排序字段 String
         */
        getUserGroupsList (id, query) {
            return this.request
                .get(`/swarm/${id}/contact`)
                .query(query);
        },

        /**
         *  @param {number} journeyCreateBy 旅程创建者id
         *  @param {string} swarmIds 分群ID  111,222,333
         *
         */
        getSwarmCount (journeyCreateBy, swarmIds) {
            return this.request
                .get('/swarm/getSwarmCount/journey/swarmList')
                .query(journeyCreateBy, swarmIds);
        },

        /**
         *  【溯源】获取子账号所见分群联系人数量
         *  @param {Number} swarmId 分群id
         *  @param {Number} gateId 子账号gateId
         *  @param {Number} departmentId 子账号对应部门id
         */
        getSwarmCountByChildAccount ({ swarmId, gateId, departmentId }) {
            return this.request
                .get('/swarm/getSwarmCountByChildAccount')
                .query({ swarmId, gateId, departmentId });
        },

        /**
         *  --- END migrated from outdated src/customer/swarm/swarmModel.js ---
         */

        /**
         *  --- START migrated from outdated src/data/report/journey/model/contactReportService.js ---
         */
        /**
         * 邮件服务商占比
         * @param journeyInstantiationId
         * @param taskInstantiationId
         * @returns {*}
         */
        servicesProportion (journeyInstantiationId, taskInstantiationIds) {
            return this.request
                .get('/servicesProportion')
                .query({
                    journeyInstantiationId,
                    taskInstantiationIds,
                });
        },

        /**
         *  PC/Moblie 独立打开
         *
         *  @param journeyInstantiationId
         *  @param taskInstantiationIds
         *  @param journeyTemplateId
         */
        devicesProportion (journeyInstantiationId, taskInstantiationIds, journeyTemplateId) {
            return this.request
                .get('/OpenProportion')
                .query({
                    journeyInstantiationId,
                    taskInstantiationIds,
                    journeyTemplateId
                });
        },

        /**
         *  链接独立点击Top5
         *
         * @param journeyInstantiationId
         * @param taskInstantiationIds
         * @param journeyTemplateId
         */
        getLinkTop5 (journeyInstantiationId, taskInstantiationIds, journeyTemplateId) {
            return this.request
                .get('/linkClick')
                .query({
                    journeyInstantiationId,
                    taskInstantiationIds,
                    journeyTemplateId
                });
        },

        /**
         * 联系人活跃
         * @param taskInstantiationIds 任务id
         * @param journeyTemplateId
         */
        getContactMapData ({ taskInstantiationIds, journeyTemplateId }) {
            return this.request
                .get('/contactMap')
                .query({ taskInstantiationIds, journeyTemplateId });
        },

        /**
         * 获取联系人属性（除时间类型和标签类型）
         * @returns {*}
         */
        getContactAttributes () {
            return this.request
                .get('/getAttributeForReport');
        },
        /**
         *  --- END migrated from outdated src/data/report/journey/model/contactReportService.js ---
         */

        /**
        * 获取公司内的添加标签进度
        */
        getProgress () {
            return this.request
                .get(`/labelProgressLog/getProgress`);
        },


        /**
         * 根据标签id获取历史操作记录
         */
        getProgressLog (query) {
            return this.request
                .get(`/labelProgressLog/getLogByLabelId`)
                .query(query);
        },


        /**
         * 获取页面状态： 是否可以打标签
         * true 可以打标签
         * false 不可以打标签
         */
        getPageStatus () {
            return this.request
                .get(`/label/getRuleStatus`);
        },


        /**
         * 获取分组列表
         * ！！！树级结构
         * @param sortType
         * @param modelType 该字段目前只在标签模块中使用 0:不查询分组下的标签列表
         * @param authorityType 0不需要查询权限，其他需要查询权限
         * @returns {*}
         */
        getGroups ({ sortType, modelType, authorityType }) {
            return this.request
                .get(`/labelGroups/labels`)
                .query({ sortType, modelType, authorityType });
        },

        /**
         * 获取分组列表
         * 原有结构
         * @returns {*}
         */
        getGroupsOld () {
            return this.request
                .get(`/labelGroups/labels/old`);
        },


        /**
         * 获取不含 标签列表 的分组列表(FIXME:废弃???)
         * @returns {*}
         */
        // getGroupList () {
        //     return this.request
        //         .get(`/labelGroups`);
        // },


        /**
         * 添加标签分组 (原createGroup)
         * @param query
         * @returns {*}
         */
        createLabelGroup ({ name, parId }) {
            return this.request
                .post(`/labelGroups`)
                .send({ name, parId });
        },


        /**
         * 编辑标签分组 (原editGroup)
         * @param {id} query
         * @returns {*}
         */
        editLabelGroup ({ id, name, parId }) {
            return this.request
                .put(`/labelGroups/${id}`)
                .send({ name, parId });
        },


        /**
         * 删除标签分组 (deleteGroup)
         * @param id
         * @returns {*}
         */
        deleteLabelGroup (id) {
            return this.request
                .delete(`/labelGroups/${id}`);
        },


        /**
         * 获取分组下的标签列表
         * groupId 分组ID 0是全部  1是默认分组，剩余其他分组ID
         * @param {groupId, isShow, pageNumber,type} query
         * @returns {*}
         */
        getLabels (query) {
            return this.request
                .get(`/label/labels/${query.groupId}`)
                .query(query);
        },


        /**
         * 新建标签
         * @param {groupId, name} query
         * @returns {*}
         */
        createLabel (query) {
            return this.request
                .post(`/label/${query.groupId}`)
                .send(query);
        },


        /**
         * 编辑标签
         * @param {id, name} query
         * @returns {*}
         */
        editLabel (query) {
            return this.request
                .put(`/label/${query.id}`)
                .send(query);
        },


        /**
         * 删除标签
         * @param groupId   分组id
         * @param type      0当前页 1全部页
         * @param ids       删除的ids
         * @param isShow    是否显示子分组下的标签
         * @returns {*}
         */
        deleteLabel (groupId, type, ids, isShow) {
            return this.request
                .delete(`/label/${groupId}`)
                .send(ids)
                .query({
                    type: type,
                    isShow: isShow,
                });
        },


        /**
         * 移动至分组
         * @param fromGroupId   标签移动之前的分组id
         * @param toGroupId
         * @param type          0：当前页数据 1：全部页数据
         * @param ids           labelIds
         * @param isShow        是否显示子分组下标签
         * @returns {*}
         */
        moveToGroup (toGroupId, fromGroupId, type, ids, isShow) {
            return this.request
                .put(`/label/updLabelGroup/${toGroupId}/${fromGroupId}`)
                .send(ids)
                .query({
                    type: type,
                    isShow: isShow,
                });
        },


        /**
         * 重新计算
         * @param labelId    标签ID
         * @returns {*}
         */
        reCount (labelId) {
            return this.request
                .put(`/label/changeReckon/${labelId}`);
        },


        /**
         * 获取规则属性
         * @param labelId   标签id
         * @returns {*}
         */
        getRules (labelId) {
            return this.request
                .get(`/label/getProperty/${labelId}`);
        },


        /**
         * 添加会员标签
         * @param labelId   标签id
         * @param json      用户属性
         * @returns {*}
         */
        addLabelProperty (labelId, json) {
            return this.request
                .put(`/label/addProperty/${labelId}`)
                .send({
                    json,
                });
        },


        /**
         * 移除会员标签
         * @param labelId    标签id
         * @param json      用户属性
         * @returns {*}
         */
        moveLabelProperty (labelId, json) {
            return this.request
                .put(`/label/moveProperty/${labelId}`)
                .send({
                    json,
                });
        },


        /**
         * 获取单个联系人全部标签
         * @param customerId 联系人id
         * @param officialId 公众号id
         * @return {*}
         */
        getCustomerTags (customerId, officialId) {
            return this.request
                .get('/label/getAllLabels')
                .query({ customerId, officialId });
        },
        /**
         *标签隐藏/显示 (单个)
         * @param id
         */
        singleHideShow (id) {
            return this.request
                .post(`/label/addConceal/${id}`);
        },
        /**
         * 保存标签隐藏/显示(批量)
         * @param concealLabelIds标签ids[] 隐藏标签ids
         * @param groupId 分组id
         * @param labelIds标签ids[] 全量
         * @param show 是否展示分组下子分组数据
         * @param type 1显示 2隐藏 3新建联系人时新建标签的特殊处理
         * @param uncheckLabelIds 标签管理列表页，"全选所有页数据"时，取消选中的标签ID数组

         */
        batchHideShow (groupId, concealLabelIds, labelIds, show, type, uncheckLabelIds) {
            return this.request
                .post('/label/addAllConceal')
                .send({
                    groupId,
                    concealLabelIds,
                    labelIds,
                    show,
                    type,
                    uncheckLabelIds
                });
        },
        /**
         * @description: 企业微信渠道活码-统计详情-联系人统计列表-添加联系人-跳转至联系人详情
         * @param {String} userid 外部联系人userid
         * @return {*}
         */
        getCustomerIdByUserid ({ userid }) {
            return this.request
                .get('/getCustomerIdByUserid')
                .query({
                    userid
                });
        },
        /**
        * 获取员工记录list
        * @param id
         * @param pageNumber
        */
        getStaffRecord (id, pageNumber) {
            return this.request
                .get('/fieldControl/getStaffDetailList')
                .query({
                    id, pageNumber
                });
        },

        /**
         * 
         * @param {array<object>} labelList 标签集合
         */
        labelCheck (labelList) {
            return this.request
                .post(`/label/verification`)
                .send({
                    labelList
                });
        },

        /**
         * 获取字段列表
         * @param search,搜索关键字
         * @param pageNumber 页码
         */
        getFields (search, pageNumber) {
            return this.request
                .get('/field')
                .query({ search, pageNumber });
        },

        /**
         * 创建新字段
         * @param field field, fieldCn, fieldType
         * @return {Request|*}
         */
        create (field) {
            return this.request
                .post('/field')
                .send(field);
        },

        /**
         * 自定义字段
         * @param {Number} status 0 客户 1 订单 2 商品
         * @param {Number} dateFlag 1=返回更新时间；不传=不返回更新时间
         * @param {Number} needLabelIds 0不返回标签字段，不传返回标签字段
         */
        customerField (status, dateFlag, needLabelIds) {
            return this.request
                .get('/customerFieldList')
                .query({ status, dateFlag, needLabelIds });
        },

        /**
         * 获取所有cpcode
         */
        getLabel () {
            return this.request
                .get('/label/getLabelAllByCompanyId');
        },
        /**
         * 获取分组列表
         * @param sortType {number} 排序类型
         * @return {*}
         */
        getMaterialGroups ({ sortType }) {
            return this.request
                .get(`/labelGroups/labels`)
                .query({ sortType });
        },

        /**
         * 更新字段
         * @param field
         * @return {Request|*}
         */
        // update(field) {
        //     return this.request
        //         .put(`/field/${field.id}`)
        //         .send(field);
        // },


        /**
         * 删除一个字段
         * @param id
         * @return {*|Request}
         */
        // del(id) {
        //     return this.request
        //         .del(`/field/${id}`);
        // },

        /**
         * 获取字段列表
         * @param pageNumber
         * @param search
         */
        getWeChatFields (pageNumber, search) {
            return this.request
                .get(`${LINKS.CONTACT_API_BASE}/api/contact/v1/field`)
                .query({ pageNumber: pageNumber, search: search });
        },
        /**
         * 打分评级便捷模式获取固定事件列表
         * @param 
         */
        getEventList () {
            return this.request
                .get('/scorerating/getEventList');
        },
        /**标签列表分页
         * @param name  表单名称
         * @param page 页码
         * @param size 每页大小，默认10
         */
        getLabelPage(name,page,size) {
            return this.request
                .get('/labelGroups/labelPage')
                .query({ name, page, size});
        }
    }
});
