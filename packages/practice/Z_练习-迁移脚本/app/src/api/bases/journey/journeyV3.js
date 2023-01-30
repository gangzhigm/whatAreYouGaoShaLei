import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.JOURNEY_API_BASE + '/api/journey/v3',
    api: {

        /**
        * --- START migrated from outdated src/data/report/journey/model/journeyReportService.js ---
        */

        /**
         * v3 旅程检索(包含实时旅程)
         * @param dates
         * @param startDate
         * @param endDate
         * @param journeyTemplateIds
         * @param pageNumber
         * @param search
         * @param taskType  *2021-10-14 2.5.15版本增加
         *                  0:邮件 1:短信 2:微信 3:彩信 4:线索传递(华为订制) 6：nike批次邮件 5:添加会员标签
         *                  9:移除会员标签 7:添加粉丝标签 8:移除粉丝标签 10.企业微信。
         *                  此字段存在数据，则只会返回存在对应任务的旅程列表。
         */
        getJourneysRealTime (dates, endDate, journeyTemplateIds, pageNumber, search, startDate, taskType) {
            return this.request
                .get('/journeyReport')
                .query({ dates, endDate, journeyTemplateIds, pageNumber, search, startDate, taskType});
        },


        /**
        * --- END migrated from outdated src/data/report/journey/model/journeyReportService.js ---
        */


        /**
        * --- START migrated from outdated src/data/report/journey/model/reviewReportService.js ---
        */
        // sendData: {startDate, endDate, journeyId}
        /**
         * 短信点击转化
         */
        getSmsActive (sendData) {
            return this.request
                .get('/report/smsClick')
                .query(sendData);
        },
        /**
         * 彩信点击转化
         */
        getMmsActive (sendData) {
            return this.request
                .get('/report/mmsClick')
                .query(sendData);
        },
        /**
         * 微信送达转化
         */
        getWechatDelivery (sendData) {
            return this.request
                .get('/report/wechatDelivery')
                .query(sendData);
        },
        /**
         * 邮件点击转化
         */
        getEmailClick (sendData) {
            return this.request
                .get('/report/emailClick')
                .query(sendData);
        },
        /**
         * 渠道事件分时段分布
         */
        getChannelCount (sendData) {
            return this.request
                .get('/report/getChannelCount')
                .query(sendData);
        },
        /**
         * 里程碑达成统计
         */
        getMilestoneRecord (sendData) {
            return this.request
                .get('/report/milestoneRecord')
                .query(sendData);
        },
        /**
         * 旅程触达人数
         */
        getJourneyCount (sendData) {
            return this.request
                .get('/report/getJourneyCount')
                .query(sendData);
        },
        /**
         * 渠道报告
         */
        getChannelReport (sendData) {
            return this.request
                .get('/report/channelReport')
                .query(sendData);
        },
        /**
         * 任务报告
         */
        getTaskReport (sendData) {
            return this.request
                .get('/report/taskReport')
                .query(sendData);
        },
        /**
         * 检查所选旅程是否在权限范围内
         */
        checkJourney (journeyIds) {
            return this.request
                .get('/report/checkJourneyIds')
                .query({ journeyIds });
        },

        /**
        * --- END migrated from outdated src/data/report/journey/model/reviewReportService.js ---
        */
        /**
         *
         * @param {*} file 图片文件
         * @returns
         */
        uploadWecomImg (file) {
            return this.request
                .post('/upload/image')
                .attach('file', file);
        },
        /**
         * 获取任务发送总数送达总数
         * @param taskIds
         */
        getWecomSendInfo (taskIds) {
            return this.request
                .get('/getWecomSendInfo')
                .query({ taskIds });
        },
        /**
         * 获取旅程弹窗列表
         * @param {*} journeyIds
         * @returns
         */
        getConstruction () {
            return this.request
                .get('/construction');
        },

        /**
         * --- START migrated from outdated src/data/journey/journeyModelv3.js ---
         */

        /**
         *
         * @param journeyType
         * @param journeyStatus
         * @param journeyName
         * @param pageNumber
         * @param startDate
         * @param endDate
         * @param groupId
         * @param sortOrder
         * @param sortValue
         * @param journeyTemplateIds
         * @param taskType
         * *字段值需放在参数最后* 2021-10-14 2.5.15版本增加
         *                  0:邮件 1:短信 2:微信 3:彩信 4:线索传递(华为订制) 6：nike批次邮件 5:添加会员标签
         *                  9:移除会员标签 7:添加粉丝标签 8:移除粉丝标签 10.企业微信。
         *                  此字段存在数据，则只会返回存在对应任务的旅程列表。
         * @returns {*}
         */
        getJourneys({
            journeyType,
            journeyStatus,
            journeyName,
            pageNumber,
            startDate,
            endDate,
            groupId,
            sortOrder,
            sortValue,
            journeyTemplateIds,
            taskType,

        }) {
            return this.request
                .get('/journey')
                .query({
                    journeyType,
                    journeyStatus,
                    journeyName,
                    pageNumber,
                    startDate,
                    endDate,
                    groupId,
                    sortOrder,
                    sortValue,
                    journeyTemplateIds,
                    taskType
                });
        },

        createJourney(journeyInfo) {
            return this.request
                .post('/journey')
                .send(journeyInfo);
        },


        /**
         * 获取旅程详情
         * @param journeyId
         * @return {*}
         */
        getJourney(journeyId) {
            return this.request
                .get(`/journey/${journeyId}`);
        },


        checkJourneyApproval(journeyId,approval) {
            return this.request
                .post(`/journey/${journeyId}/check`).query({
                    approval
                });
        },


        /**
         * 正式开始旅程
         * @param journeyId
         * @param {Array} taskList 可选
         * @param {number} approvalStatus 可选 审批状态（0：审批通过）
         * @return {*}
         */
        startJourney(journeyId, taskList, approvalStatus) {
            return this.request
                .post(`/journey/${journeyId}/start`)
                .send({
                    taskList,
                    approvalStatus
                });
        },


        pauseJourney(journeyId) {
            return this.request
                .post(`/journey/${journeyId}/pause`);
        },
        cancelJourney(journeyId) {
            return this.request
                .post(`/journey/${journeyId}/cancel`);
        },
        copyJourney(journeyId) {
            return this.request
                .post(`/journey/${journeyId}/copy`);
        },
        deleteJourney(journeyId) {
            return this.request
                .delete(`/journey/${journeyId}`);
        },


        /**
         * 更新旅程
         * @param journey
         * @return {*}
         */
        updateJourney(journey) {
            return this.request
                .put(`/journey/${journey.id}`)
                .send(journey);
        },


        testJourney(journeyId, swarmId) {
            return this.request
                .post(`/journey/${journeyId}/test`)
                .query({
                    swarmId
                });
        },
        stopTest(journeyId) {
            return this.request
                .post(`/journey/${journeyId}/finish`);
        },
        testEdit(journeyId) {
            return this.request
                .post(`/journey/${journeyId}/edit`);
        },


        /**
         * 获取任务列表
         * @param journeyId
         * @returns {*}
         */
        getTaskList(journeyId) {
            return this.request
                .get(`/journey/${journeyId}/task`);
        },

        /**
         * 新增任务
         * @param journeyId
         * @param task
         * @return {Request|*}
         */
        createTask(journeyId, task) {
            return this.request
                .post(`/journey/${journeyId}/task`)
                .send(task);
        },


        /**
         * 更新任务详情
         * @param task
         * @return {*}
         */
        updateTask(task) {
            return this.request
                .put(`/task/${task.taskId}`)
                .send(task);
        },


        /**
         * 删除任务
         * @param taskId
         * @param abType ab控件标识 0:非ab控件 1:ab控件
         * @param controllerId
         */
        deleteTask(taskId, abType = 0, controllerId) {
            return this.request
                .delete(`/task/${taskId}`)
                .query({
                    abType: abType,
                    controllerId: controllerId
                });
        },

        /**
         * 获取单个任务的发送情况
         * @param id
         */
        getTaskSendInfo(id) {
            return this.request
                .get('/getTaskSendInfo')
                .query({ id });
        },

        /**
         * 分群人数
         * @param controllerIds
         * @param journeyInstantiationId
         * @return {*}
         */
        getGroupSize(controllerIds, journeyInstantiationId) {
            return this.request
                .get('/swarmCount')
                .query({
                    controllerIds,
                    journeyInstantiationId
                });
        },

        /**
         * 前置任务
         * @param journeyId
         * @param type 任务类型（0：全部，1：邮件，2：短信，3：微信）
         * @param subType 微信子任务类型（0：客服消息，1：模板消息）
         * @param controllerId
         * @return {*}
         */
        prepositionTask({
            journeyId,
            type,
            subType,
            controllerId
        }) {
            return this.request
                .get('/task/prepositionTask')
                .query({
                    journeyId,
                    type,
                    subType,
                    controllerId
                });
        },


        /**
         * 获取任务(实例)详情
         * @param taskId
         * @param taskInstantiationId
         * @return {*}
         */
        taskInfo(taskId, taskInstantiationId) {
            return this.request
                .get(`/task/${taskId}`)
                .query({
                    taskInstantiationId
                });
        },


        taskStatus(journeyTemplateId, journeyInstantiationId) {
            return this.request
                .post(`/journey/${journeyTemplateId}/status`)
                .query({
                    journeyInstantiationId
                });
        },

        getTaskTempList(journeyId) {
            return this.request
                .get(`/taskTemplate/${journeyId}`);
        },

        getTaskAffirm(journeyTemplateId) {
            return this.request
                .post(`/journey/${journeyTemplateId}/affirm`);
        },

        /**
         * 短信发送报告, 获取短信点击转化
         * @param query
         */
        getSmsReport(query) {
            return this.request
                .get('/report/smsClick')
                .query(query);
        },

        /**
         * 新AB控件任务删除
         * @param id
         * @param journeyId
         */
        deleteABController(id, journeyId) {
            return this.request
                .delete('/abController/' + id)
                .query({
                    journeyId: journeyId
                });
        },
        /**
         * 更新新AB控件信息
         * @param query
         */
        updateABController(query) {
            return this.request
                .post('/abController')
                .send(query);
        },
        /**
         * 新AB控件详情
         * @param id
         * @param journeyInstantiationId
         */
        getABTestControllerDetail(id, journeyInstantiationId) {
            return this.request
                .get('/abController/' + id)
                .query({
                    journeyInstantiationId: journeyInstantiationId
                });
        },


        /**
         * 获取审批日志列表
         * @param journeyId
         * @returns {*}
         */
        getApprovalLog(journeyId) {
            return this.request
                .get(`/log`)
                .query({
                    journeyId
                });
        },

        /**
         * 提交审批
         * @param journeyId     旅程id
         * @param pendingId     审批id
         * @returns {*}
         */
        pendingJourney(journeyId, pendingId) {
            return this.request
                .post(`/pending`)
                .query({
                    journeyId,
                    pendingId
                });
        },

        /**
         * 退回审批-审批人
         * @param journeyId     旅程
         * @param reason        理由
         * @returns {*}
         */
        rejectedPending(journeyId, reason) {
            return this.request
                .post(`/rejected`)
                .query({
                    journeyId,
                    reason
                });
        },

        /**
         * 撤回审批-申请人
         * @param journeyId
         * @returns {*}
         */
        revocationPending(journeyId) {
            return this.request
                .post(`/revocation`)
                .query({
                    journeyId
                });
        },

        /**
         * 查看报告权限
         * @param journeyId
         * @return {*}
         */
        checkReportAccess(journeyId) {
            return this.request
                .get(`/journey/${journeyId}/checkReport`);
        },

        /**
         * 获取旅程分组下全部旅程
         * @param groupId
         * @return {*}
         */
        getAllJourneys({
            journeyType,
            journeyStatus,
            journeyName,
            startDate,
            endDate,
            groupId,
            sortOrder,
            sortValue
        }) {
            return this.request
                .get('/journey/from')
                .query({
                    journeyType,
                    journeyStatus,
                    journeyName,
                    startDate,
                    endDate,
                    groupId,
                    sortOrder,
                    sortValue
                });
        },
        /**
         * 获取邮件排除统计详情 - 单次/周期旅程
         */
        getEmailDetail(taskInstantiationId){
            return this.request
                .get('/exclusionStatistics')
                .query({taskInstantiationId});
        },
        /**
         * 华为定制-线索传递-获取线索传递统计
         * @param email
         * @param journeyId
         * @param pageNumber
         * @param sendStatus
         * @param sortType
         * @param taskId
         */
        getClueRecord(email, journeyId, pageNumber, sendStatus, sortType, taskId) {
            return this.request
                .get('/getClueRecord')
                .query({
                    email: email,
                    journeyId: journeyId,
                    pageNumber: pageNumber,
                    sendStatus: sendStatus,
                    sortType: sortType,
                    taskId: taskId
                });
        },
        /**
         * 华为定制-线索传递-华为线索传递重试接口
         * @param customerId
         * @param email
         * @param journeyId
         * @param taskId
         * @param id
         */
        retrySendClueToHW(customerId, email, journeyId, taskId, id) {
            return this.request
                .post('/retrySendClueToHW')
                .send({
                    customerId: customerId,
                    email: email,
                    journeyId: journeyId,
                    taskId: taskId,
                    id: id
                });
        },

        /**
         * 查询当前旅程的“限制条件”操作记录
         * @param {*} id
         * @param {*} pageNo
         * @param {*} pageSize
         */
        journeyOperationLog(id, pageNo, pageSize){
            return this.request
                .get('/hwJourneyOperationLog')
                .query({
                    id: id,
                    pageNo: pageNo,
                    pageSize: pageSize
                });
        },

        /**
         * --- END migrated from outdated src/data/journey/journeyModelv3.js ---
         */


        /**
         * --- START migrated from outdated src/data/journey/list/jorneyGroupServerV3.js ---
         */

        /**
         * 修改分组名称
         * @param groupId
         * @param name
         * @param parentId 父级分组 id
         * @return {*}
         */
        modifyGroup({groupId, name, parentId}) {
            return this.request
                .put('/group/' + groupId)
                .send({name, parentId});
        },


        /**
         * ！！！树级结构
         * 获取分组列表
         * @param sortType 分组排序方式
         * @return {*}
         */
        getGroupList(sortType) {
            return this.request
                .get('/groupTree')
                .query({sortType});
        },

        /**
         * ！！！列表结构
         * 获取分组列表
         * @returns {*}
         */
        getGroups() {
            return this.request
                .get('/group');
        },


        /**
         * 移出分组
         * @param groupId
         * @return {*}
         */
        deleteGroup({groupId}) {
            return this.request
                .delete('/group/' + groupId);
        },


        /**
         * 创建旅程分组
         * @param name
         * @param parentId 父级分组 id
         * @return {*}
         */
        createGroup({name, parentId}) {
            return this.request
                .post('/group')
                .send({name, parentId});
        },


        /**
         * 移动分组
         * @param groupId
         * @param journeyIds 根据全选状态进行传递，全选时传递去除的旅程id，没有全选传单独勾选的旅程id
         * @param status 全选（0：NO，1：YES）
         * @param type 0：移进，1：移出
         * @return {*}
         */
        moveGroup({groupId, journeyIds, status, type}) {
            return this.request
                .post('/group/' + groupId)
                .send({journeyIds, status, type});
        },

        /**
         * --- END migrated from outdated src/data/journey/jorneyGroupServerV3.js ---
         */
        /**
         * @description 检查旅程操作数据权限
         * @param { number } journeyId 旅程模板id
         * @param { number } type 类型 0:旅程测试 1:旅程继续
         */
        checkStatus(journeyId, type) {
            return this.request
                .get('/checkStatus')
                .query({ journeyId, type });
        },

        /**
         * 获取来源旅程
         * @param name  表单名称
         * @param page 页码
         * @param size 每页大小，默认10
         */
        getFromJourney ({journeyName, page, size, journeyStatus, journeyType}) {
            return this.request
                .get('/journey/fromPage')
                .query({ journeyName, page, size, journeyStatus, journeyType });
        },
        /**
         * 根据旅程模板id获取分组信息
         * @param journeyId  旅程id
         */
        getGroupId (journeyId) {
            return this.request
                .get('/getGroup')
                .query({journeyId});
        }
    }
});
