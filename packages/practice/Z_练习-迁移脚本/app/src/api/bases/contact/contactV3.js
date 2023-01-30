import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.CONTACT_API_BASE + '/api/contact/v3',
    api: {
        /**
         * @description 获取scrm条件、journey条件分支公用Json
         * @returns 
         */
        decisionOptions () {
            return this.request.get('/getConditionsBranch');
        },

        /**
        * 
        --- START migrated from outdated src/data/report/journey/model.contactReportService.js ---
        */

        /**
         * 导出日志列表
         * @param pageNumber
         * @param search
         * @param exportType
         */
        getRecordList ({ pageNumber, search, exportType }) {
            return this.request
                .get('/exportLog')
                .query({ pageNumber, search, exportType });
        },
        /**
         * 日志详情
         * @param id
         */
        getRecordDetail (id) {
            return this.request
                .get(`/exportLog/${id}`);
        },
        /**
         * 导出停止
         * @param id
         */
        exportPause (id) {
            return this.request
                .post(`/exportLog/pause/${id}`);
        },
        
        /**
        * 
        --- END migrated from outdated src/data/report/journey/model.contactReportService.js ---
        */
        
        eventDesitionBranch() {
            return this.request.get('/getEventConditionsBranch');
        }
    }
});