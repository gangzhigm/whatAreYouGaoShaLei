import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.QUERY_API_BASE + '/api',
    api: {
        /**
         *  --- START migrated from outdated src/analysis/analysisService.js ---
         */

        /**
         * 请求报表数据
         * @param byFieldsFilter
         * @param byFields
         * @param cid
         * @param filter
         * @param measures
         */
        getReportData ({ byFieldsFilter, byFields, cid, filter, measures }) {
            return this.request
                .post(`/user/analytics/report`)
                .singleton()
                .send({ byFieldsFilter, byFields, cid, filter, measures });
        },


        /**
         * 用户行为序列--事件总量：按时间汇总
         * @param cid
         * @param eventIds
         * @param fromDate
         * @param rollup
         * @param toDate
         * @param unit
         * @param userId
         */
        getUserEvents ({ cid, events, fromDate, rollup, toDate, unit, userId }) {
            return this.request
                .post(`/user/events`)
                .send({
                    cid,
                    events,
                    fromDate,
                    rollup,
                    toDate,
                    unit,
                    userId
                });
        },

        /**
         * 某个条件下的用户列表
         * @param data
         */
        getUserList (data) {
            return this.request
                .post(`/user/analytics/list`)
                .send(data);
        },


        /**
         * 下载某个条件下的用户列表
         * @param data
         */
        downUserList (data) {
            return this.request
                .post(`/export/user/analytics/list`)
                .send(data);
        },
        /**
         * 属性分析转换为用户分群
         * @param data
         * */
        saveGroup (data) {
            return this.request
                .post(`/transform/userAnalyticsToGroup`)
                .send(data);
        },

        /**
         *  --- END migrated from outdated src/analysis/analysisService.js ---
         */

        /**
         *  --- START migrated from outdated src/analysis/event-analysis/eventAnalysisService.js ---
         */

        /**
         * 新增书签 原getReportData
         * @param params
         */
        getEventReportData (params) {
            return this.request
                .post(`/events/report`)
                .singleton()
                .send(params);
        },


        /**
         * 新增书签
         * @param {Object} query
         */
        getEventUserList (query) {
            return this.request
                .post(`/events/list`)
                .singleton()
                .send(query);
        },


        /**
         * 属性分析转换为用户分群
         * @param data
         * */
        saveEventGroup (data) {
            return this.request
                .post(`/transform/eventAnalyticsToGroup`)
                .send(data);
        },

        downloadEventData (obj) {
            return this.request
                .post('/export/event/analytics/post')
                .send(obj)
                .responseType('blob');
        },

        /**
         *  --- END migrated from outdated src/analysis/event-analysis/eventAnalysisService.js ---
         */

        /**
         *  --- START migrated from outdated src/analysis/user-group/model/userGroupModel.js ---
         */

        /**
         * 用户分群用户列表
         * @param data
         */
        getGroupUserList (data) {
            return this.request
                .post(`/usergroup/page`)
                .send(data);
        },


        /**
         * 获取csvUrl
         * @param cid
         * @param id
         */
        getCsvUrl ({ cid, id }) {
            return this.request
                .post(`/usergroup/getcsvurl`)
                .send({ cid, id })
                .escape('after');
        },


        downCsv (url) {
            return this.request
                .get(`/usergroup/downloadcsv?path=${url}`)
                .escape('after')
                .responseType('arraybuffer');
        },

        /**
         *  --- END migrated from outdated src/analysis/user-group/model/userGroupModel.js ---
         */

        /**
         *  --- START migrated from outdated src/analysis/visualization/visualizationService.js ---
         */

        /**
         * 请求报表数据
         * @param byFields
         * @param chartType
         * @param cid
         * @param filter
         * @param fromDate
         * @param measures
         * @param tableName
         * @param toDate
         * @param unit
         */
        getVisualReportData ({ byFields, chartType, cid, filter, fromDate, measures, tableName, toDate, unit }) {
            return this.request
                .post(`/scheduleReport/report`)
                .singleton()
                .send({ byFields, chartType, cid, filter, fromDate, measures, tableName, toDate, unit });
        },

        /**
         * 导出报表数据
         * @param data
         */
        exportExcel (data) {
            return this.request
                .post(`/excelExport/schedulePost`)
                .send(data)
                .escape('after')
                .responseType('arraybuffer');
        },

        /**
         *  --- END migrated from outdated src/analysis/visualization/visualizationService.js ---
         */
    }
});