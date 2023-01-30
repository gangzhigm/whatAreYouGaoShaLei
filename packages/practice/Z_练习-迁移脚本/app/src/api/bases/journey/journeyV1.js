import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.JOURNEY_API_BASE + '/api/journey/v1',
    api: {
        /**
         * 获取journey记录（废弃）
         * @param activityName
         * @param id
         * @param pageNumber
         */
        getMarketing (activityName, id, pageNumber) {
            return this.request
                .get(`/marketings`)
                .query({
                    activityName,
                    id,
                    pageNumber
                });
        },

        /**
        *
        --- START migrated from outdated src/data/report/journey/model/journeyReportService.js ---
        */

        /**
         * 获取 公司/旅程/任务 数据更新时间
         * @param type
         * @param id
         */
        getUpdateDate (type, id) {
            switch (type) {
                case 'company':
                    return this.request.get('/update');
                case 'journey':
                    return this.request
                        .get('/update')
                        .query({
                            journeyInstantiationId: id
                        });
                case 'task':
                    return this.request
                        .get('/update')
                        .query({
                            taskInstantiationId: id
                        });
            }
        },

        /**
         * 邮件任务
         * 邮件发送总数统计
         * @param taskInstantiationId
         * @param journeyTemplateId
         */
        getEmailTaskStatistics (taskInstantiationId, journeyTemplateId) {
            return this.request
                .get('/emailStatistics')
                .query({ taskInstantiationId, journeyTemplateId });
        },

        /**
         * 公司
         * 所有旅程的任务数量和分布时间
         */
        getDateTaskMap () {
            return this.request
                .get('/allTask');
        },

        /**
        *
        --- END migrated from outdated src/data/report/journey/model/journeyReportService.js ---
        */


        /**
         * --- START START migrated from outdated src/data/journey/journeyModel.js ---
         */
        /**
         * 获取journey 列表
         * @param journeyStatus
         * @param journeyName
         * @param pageNumber
         * @param startDate
         * @param endDate
         */
        getJourneys({journeyStatus, journeyName, pageNumber, startDate, endDate}) {
            return this.request
                .get('/journey')
                .query({
                    journeyStatus,
                    journeyName,
                    pageNumber,
                    startDate,
                    endDate
                });
        },


        /**
         * 获取旅程详情
         * @param id
         */
        getJourney(id) {
            return this.request
                .get(`/journey/${id}`);
        },


        /**
         * 创建旅程
         * @param name
         * @return {Request|*}
         */
        create(name) {
            return this.request
                .post('/journey')
                .send({
                    journeyName: name,
                    systemType: 1   // 操作系统(0:journey 1:scrm)
                });
        },


        /**
         * 更新旅程 重命名
         * @param id
         * @param name
         * @return {Request|*}
         */
        update(id, name) {
            return this.request
                .put(`/journey/${id}`)
                .send({
                    journeyName: name,
                    systemType: 1   // 操作系统(0:journey 1:scrm)
                });
        },


        /**
         * 删除
         * @param id
         * @return {*|Request}
         */
        del(id) {
            return this.request
                .del(`/journey/${id}`);
        },


        /**
         * 开启旅程
         * @param id
         * @return {Request|*}
         */
        start(id) {
            return this.request
                .post(`/journey/${id}/start`);
        },


        /**
         * 取消进行中的旅程
         * @param id
         * @return {Request|*}
         */
        cancel(id) {
            return this.request
                .post(`/journey/${id}/cancel`);
        },


        /**
         * 获取Journey的任务列表
         * @param id
         */
        getTasks(id) {
            return this.request
                .get(`/journey/${id}/task`);
        },


        /**
         * 数据报表导出推送邮件
         * @param content
         * @param email
         * @return {*}
         */
        exportContact(content, email) {
            return this.request
                .post('/ExportContact')
                .send({content, email});
        },


        /**
         * 获取邮件的发件地址
         * @param pageNumber
         * @param type 1为渠道分配场景
         * @return {*}
         */
        getAddress(pageNumber = 1,type) {
            return this.request
                .get('/task/address')
                .query({
                    pageNumber,
                    type
                });
        },


        /**
         * 旅程画布专用接口：获取邮件的发件地址
         * http://jira.qdum.com/browse/DMARTECH-8658  （主账号）未配置dmd时，旅程画布不弹出错误提示
         * @param pageNumber
         * @return {*}
         */
        getAddressCanvas(pageNumber = 1) {
            return this.request
                .get('/task/address')
                .query({
                    pageNumber
                })
                .escape('after');
        },


        /**
         * 邮件测试发送
         * @param emails
         * @param excerpta      摘要
         * @param materialId
         * @param sendName
         * @param senderId      // 发件地址 id
         * @param journeyId
         * @param controllerId
         * @param testSubject
         * @return {*}
         */
        mailTest(emails,excerpta, materialId, sendName, senderId, journeyId, controllerId, testSubject) {
            return this.request
                .post('/journey/dmdTestSend')
                .send({
                    emails,
                    excerpta,
                    materialId,
                    sendName,
                    senderId,
                    journeyId,
                    controllerId,
                    testSubject
                });
        },
        /**
         * 私有化部署-获取后台权限
         * @return {*}
         */
        getToken() {
            return this.request
                .get('/token');
        },

        /**
         * --- END START migrated from outdated src/data/journey/journeyModel.js ---
         */

    }
});
