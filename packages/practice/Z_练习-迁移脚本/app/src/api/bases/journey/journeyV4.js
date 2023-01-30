import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.JOURNEY_API_BASE + '/api/journey/v4',
    api: {

        /**
        * --- START migrated from outdated src/data/report/journey/model/journeyReportService.js ---
        */
        /**
         * 邮件发送总数统计
         * @param journeyInstantionIds 旅程Ids
         * @param taskInstantiationIds 任务Ids
         */
        getEmailStatistics ({ journeyInstantionIds, taskInstantiationIds }) {
            return this.request
                .get('/emailStatistics')
                .query({ journeyInstantionIds, taskInstantiationIds });
        },
        /**
        *  --- END migrated from outdated src/data/report/journey/model/journeyReportService.js ---
        */

    }
});