import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.QUESTIONNAIRE_API_BASE + '/api/questionnaire/v1',
    api: {
        /**
         * 保存表单模板共享
         * @param authorty {String} 权限IDS 0:预览 1:编辑 2:移动 3:复制 4:测试 5:删除 6:批量删除 7:批量移动
         * @param paperId {Number} 素材ID
         * @param sharedIds {String} 用户或者部门或者安全组IDS
         * @param type {Number} 共享类型 0:所有成员 1：部分成员 2：部分部门 3：部分安全组
         */
        saveFormUser ({ authorty = '', sharedIds = '', paperId, type }) {
            return this.request
                .post('/sharedData/save')
                .send({
                    authorty,
                    paperId,
                    sharedIds,
                    type
                });
        },

        /**
         * 删除表单共享规则
         * @param id {Number} 共享规则ID
         */
        deleteFormSharing (id) {
            return this.request
                .delete('/sharedData/delete')
                .query({ id });
        },

        /**
         * 获取表单共享列表
         * @param paperId {Number} 素材id
         * @param pageNumber {Number} 页码
         */
        findFormSharingList ({ paperId, pageNumber = 1 }) {
            return this.request
                .get('/sharedData/records')
                .query({
                    paperId,
                    pageNumber
                });
        },

        /**
         * 获取表单列表
         * @param id
         * @param name
         * @param page
         * @param size
         * @param formSource 表单来源（-1查询所有类型的数据，1 Dmartech表单 2 金数据表单）
         * @param sortOrder  0：正序 1：倒序
         * @param sortValue  排序字段名称
         * @param status     -1：全部，金数据表单状态：4 未测试 5 已测试 6 已发布，标准表单状态：7 正常 8 暂停
         */
        getFormList({id, name, page, size, formSource, sortOrder, sortValue, status}) {
            return this.request
                .get(`/papersList/${id}`)
                .query({
                    name,
                    page,
                    size,
                    formSource,
                    sortOrder,
                    sortValue,
                    status
                });
        },

        /**
         * 获取无分页的表单列表
         * @param id
         */
        getFormListNoPage(id) {
            return this.request
                .get(`/papersListNoPage/${id}`);
        },


        /**
         * 根据表单id获取分组id
         * @param id
         */
        getGroupName(id) {
            return this.request
                .get(`/groupOfForm/${id}`);
        },


        /**
         * 获取表单详情
         * @param id
         */
        getFormDetail(id) {
            return this.request
                .get(`/papers/${id}`);
        },


        /**
         * 更新表单 重命名
         * @param id
         * @param name
         * @return {Request|*}
         */
        update(id, name) {
            return this.request
                .put(`/papers/${id}`)
                .send({
                    paperName: name,
                });
        },


        /**
         * 批量删除
         * @param id
         * @return {*|Request}
         */
        delForm(id) {
            return this.request
                .del(`/papers`)
                .send(
                    id
                );
        },


        /**
         * 批量移动
         * @param id
         * @param paperId
         * @return {Request|*}
         */
        move(id, paperId) {
            return this.request
                .post(`/movePapers/${id}`)
                .send(
                    paperId,
                );
        },


        /**
         * 根据链接id获取金数据表单详情
         * @param formId
         * @param paperId
         */
        getJinFormDetail(formId, paperId) {
            return this.request
                .get(`/papers/jishujuForm/${formId}`)
                .query(
                    {paperId}
                );
        },


        /**
         * 新建金数据表单
         * @param formId
         * @param formDetail
         */
        createNewForm(formId, formDetail) {
            return this.request
                .post(`/papers/paperForm/${formId}`)
                .send(
                    formDetail,
                );
        },


        /**
         * 编辑金数据表单
         * @param formId
         * @param formDetail
         */
        updateForm(formId, formDetail) {
            return this.request
                .put(`/papers/jishujuForm/${formId}`)
                .send(
                    formDetail,
                );
        },


        /**
         * 获取金数据表单测试记录
         * @param paperId
         * @param page
         * @param size
         */
        getTestReport(paperId, page, size) {
            return this.request
                .get(`/paperAnswerTests/${paperId}`)
                .query({
                    page,
                    size
                });
        },


        /**
         * 发布表单
         * @param id
         */
        releaseForm(id) {
            return this.request
                .put(`/papers/releaseForm/${id}`);
        },


        /**
         * 根据表单id以及字段获取表单提交记录
         * @param field 表单字段值
         * @param paperId 表单id
         * @param value 模糊搜索名称
         */
        getSubmitValue(field, paperId, value) {
            return this.request
                .get(`/form/getSubmitValue`)
                .query(
                    {field, paperId, value}
                );
        },
        /**
         * 根据表单id获取自定义表单和标准表单以及其扩展链接
         * @param paperId
         */
        wechatGetFormList(paperId) {
            return this.request
                .get('/wechat/getFormList')
                .query({paperId: paperId});
        },

        //
        /**
         * ！！！树级结构
         * 获取表单分组
         */
        getFormGroup(sortType) {
            return this.request
                .get('/paperGroups/tree')
                .query({sortType});
        },

        /**
         * ！！！列表结构
         * 获取表单分组
         * @returns {*}
         */
        getFormGroupList() {
            return this.request
                .get('/paperGroups/wechat');
        },

        /**
         * 获取分组详情
         * @param id
         */
        getGroupDetail({id}) {
            return this.request
                .get(`/paperGroups/${id}`);
        },


        /**
         * 删除分组
         * @param id
         * @return {*|Request}
         */
        delGroup(id) {
            return this.request
                .del(`/paperGroups/${id}`);
        },


        /**
         * 新增分组
         * @param name
         * @param parentId
         */
        addGroup({name, parentId}) {
            return this.request
                .post(`/paperGroups`)
                .send({
                    name, parentId
                });
        },


        /**
         * 更新分组名称
         * @param id
         * @param name
         * @return {Request|*}
         */
        updateGroup(id, name, parentId) {
            return this.request
                .put(`/paperGroups/${id}`)
                .send({
                    name, parentId
                });
        },
        /**
         * 标准表单开始、暂停
         * @param paperId
         * @param status
         */
        updateFormStatus(paperId, status) {
            return this.request
                .put(`/form/${paperId}/${status}`);
        },
        /**
         * 表单问题-关键词搜索选中
         * @param {*} ids
         */
        searchCheck(paperId,ids) {
            return this.request
                .put(`/questions/${paperId}/searchCheck`)
                .send(ids);
        },


        /**
         * 获取表单统计详情
         * @param id
         * @param page
         * @param size
         * @param field 匹配字段
         * @param value 关键字
         */
        getFormInfo({id, page, size, field, value, fieldList}) {
            return this.request
                .post(`/answers/${id}`)
                .query({page,size,field,value,fieldList});
        },
        /**
         * 获取表单问题列表
         * @param id
         */
        getFormTitle({id}) {
            return this.request
                .get(`/questions/${id}`);
        },

        /**
         * 根据表单发送规则详情
         * @param id
         * @param type 获取全部包含删除的数据的话，type传1
         */
        getFormRules(id, type) {
            return this.request
                .get(`/formReportPushConfiguration/detail/${id}`)
                .query({type});
        },
        /**
         * 编辑数据页保存已选展示字段
         * paperId 问卷id
         * selectedQuestionIds 已选问题id数组
         */
        saveEditAnswer(paperId, selectedQuestionIds) {
            return this.request
                .put('/questions/saveEditOption')
                .send({paperId, selectedQuestionIds});
        },

        /**
         * 保存发送规则
         * @param id
         * @param obj
         */
        saveRule(obj) {
            return this.request
                .post(`/formReportPushConfiguration`)
                .send(obj);
        },

        /**
         * 删除发送规则
         * @param id
         */
        deletRule(id) {
            return this.request
                .del(`/formReportPushConfiguration/delete/${id}`);
        },
        /**
         * 下载Dmartech表单
         * @param id
         * @param 格式类型：formatType（Excel；CSV）
         * @param 数据格式：dataFormat（utf8；gb18030）
         * @param 邮箱主题：emailSubject
         * @param 邮件地址 emailAddress
         * @param 筛选条件 filterList
         * @param filterRelation 筛选条件关系，‘且’、‘或’
         * @param 筛选后的字段的id fieldIdsStr
         */
        downloadForm(id, formatType, dataFormat, emailSubject, emailAddress, fieldIdsStr, filterList, filterRelation) {
            return this.request
                .post(`/formReport/${id}/export`)
                .query({formatType, dataFormat, emailSubject, emailAddress, fieldIdsStr})
                .send({filterList, filterRelation});
        },

        /**
         * 表单字段排序
         * @param paperId   表单 id
         * @param ids       字段 ids
         * @returns {*}
         */
        sortFormFields(paperId, ids) {
            return this.request
                .put(`/questions/${paperId}/sort`)
                .send(ids);
        },

        /**
         * 保存选中的字段
         * @param paperId   表单 id
         * @param ids       选中的字段 ids
         * @returns {*}
         */
        saveFormFields(paperId, ids) {
            return this.request
                .put(`/questions/${paperId}/check`)
                .send(ids);
        },
        /**
         * 表单数据报告 删除表单
         * name change dalForm
         */
        delFormData(ids) {
            return this.request
                .delete(`/formReport/deleteFormData`)
                .send(ids);
        },
        /**
         * 报告发送设置查看日志
         * @param ruleId 规则id
         * @param paperId 表单id
         * @param endTime 结束时间
         * @param startTime 开始时间
         * @param type  日志类型 -1:全部，0:新增，1:修改，2:删除
         * @param pageSize 分页size
         * @param pageNo 分也number
         * @returns {*}
         */
        getRuleLogList(ruleId, endTime, startTime, type, pageSize, pageNo, paperId) {
            return this.request
                .get(`/formReportPushConfiguration/logs`)
                .query({ruleId, endTime, startTime, type, pageSize, pageNo, paperId});
        },

        /**
         * 保存表单统计筛选条件
         * @param filter
         * @param paperId
         */
        saveFilter(filter, configurationLabelId, paperId) {
            return this.request
                .put('/questions/saveFilter')
                .send({filter, configurationLabelId, paperId});
        },
        /**
         * 获取表单统计概览
         * @param 开始时间
         * @param 结束时间
         */
        getStatisticsView(paperId, startDate, endDate) {
            return this.request
                .get(`/getFormStatistics`)
                .query({paperId, startDate, endDate});
        },
        /**
         * 获取表单详情
         *
         */
        getFormInfos(paperId){
            return this.request
                .get(`/form/${paperId}`);
        },
        /**
         * 表单问题-问题列表额外必填字段选中
         * @param {*} ids 选中的id
         * @param {*} paperId 表单id
         * @returns
         */
        additionalRequiredCheck (fields,paperId) {
            return this.request
                .put(`/questions/${paperId}/additionalRequiredCheck`)
                .send(fields);
        },
        /**
         * 表单问题-问题列表额外必填字段选中信息
         * @param {*} paperId 表单id
         * @returns
         */
        getAdditionalRequired(paperId) {
            return this.request
                .get(`/questions/${paperId}/additionalRequiredCheck`);
        },
        /**
         * 新增书签
         * @param {*} paperId  表单id
         * @param {*} name 书签名
         * @param {*} filter 提交数据列表筛选条件json
         * @returns
         */
        addBookmark(paperId, name, filter) {
            return this.request
                .post(`/formReportListLabel`)
                .send({paperId, name, filter});
        },
        /**
         * 更新书签
         * @param {*} paperId 表单id
         * @param {*} name 书签名
         * @param {*} filter 提交数据列表筛选条件json
         * @returns
         */
        updateBookmark(paperId, name, filter, id) {
            return this.request
                .put(`/formReportListLabel/${id}`)
                .send({paperId, name, filter});
        },
        /**
         * 获取书签列表
         * @param {*} paperId  表单id
         * @returns
         */
        getBookmarkList(paperId) {
            return this.request
                .get(`/formReportListLabel`)
                .query({paperId});
        },
        /**
         * 删除书签
         * @param {*} id 书签id
         * @returns
         */
        deleteBookmark(id) {
            return this.request
                .post(`/formReportListLabel/delete/${id}`);
        },
        /**
         * 清除选中的标签
         * @param {*} param0
         * @returns
         */
        cleanReportLabel({paperId}) {
            return this.request
                .get(`/cleanReportLabel`)
                .query({paperId});
        },
        /**
         * 获取表单字段列表 (部分字段，3单选，7下拉框，8多级下拉框)
         * @param id        表单id
         * @returns {*}
         */
        getFieldList(id) {
            return this.request
                .get(`/getFieldForJump/${id}`);
        },
        /**
         * 获取所有字段列表
         * @param formId    表单ID
         * @returns {*}
         */
        getAllField(formId) {
            return this.request
                .get(`/getAllField/${formId}`);
        },
        /**
         * 标准表单-复制
         * @param paperId
         * @returns {*}
         */
        copyDmtForm(paperId) {
            return this.request
                .post(`/papers/copy`)
                .send({paperId});
        },
        /**
         * 获取问题答案详情
         * @param id
         * @param paperId
         */
        submitFormDetail(id, paperId) {
            return this.request
                .get('/answers/info/' + paperId)
                .query({id: id});
        },
        /**
         * 保存表单编辑数据
         * @param content
         */
        updateFormSubmit(content) {
            return this.request
                .put('/answers/update')
                .send(content);
        },
        /**
         * 保存并同步联系人属性
         * @param content
         */
        asyncAndSave(content) {
            return this.request
                .put('/answers/saveAndUpdateContact')
                .send(content);
        },
        /**
         * 获取自定义表单列表
         * @param id
         */
        getCustomForm(id) {
            return this.request
                .get('/getCustomFormList')
                .query({id: id});
        },
        /**
         * 查看自定义表单列表
         * @param id
         */
        getCustomFormDetail(id) {
            return this.request
                .get('/getCustomFormInfo')
                .query({id: id});
        },
        /**
         * 删除自定义表单列表
         * @param id
         */
        deleteCustomForm(id) {
            return this.request
                .delete('/deleteCustomForm')
                .query({id: id});
        },
        /**
         * 新建自定义表单（上传文件）
         * @param data {name, file, id}
         */
        createCustomForm(data) {
            return this.request
                .post('/uploadCustomForm')
                .field('id', data.id)
                .field('name', data.name)
                .attach('file', data.file);
        },

        /**
         * 获取表单提交设置
         * @param paperId {Number} 表单id
         */
        getSubmitSetting(paperId) {
            return this.request
                .get('/getSubmitSetting')
                .query({paperId});
        },
        /**
         * 表单提交设置获取匹配字段列表
         * @param paperId
         */
        getQuestionList(paperId) {
            return this.request
                .get('/getQuestionList')
                .query({paperId});
        },
        /**
         * 保存提交设置
         */
        saveSubmitSet(paperId,questionId,singleTips,totalLimit,totalTips) {
            return this.request
                .post('/saveSubmitSetting')
                .send({
                    paperId,questionId,singleTips,totalLimit,totalTips
                });
        },

        /**
         * 表单跳转设置 上传自定义图片
         * @param file
         * @returns {*|undefined}
         */
        uploadCusImg(file){
            return this.request
                .post(`/uploadImage`)
                .attach('file', file);
        },

        /**
         * 获取所有表单
         * @param name  表单名称
         * @param page 页码
         * @param size 每页大小，默认10
         */
        getAllForm(name,page,size,type){
            return this.request
                .get('/papersListPage')
                .query({name,page,size,type});
        },
    }
});