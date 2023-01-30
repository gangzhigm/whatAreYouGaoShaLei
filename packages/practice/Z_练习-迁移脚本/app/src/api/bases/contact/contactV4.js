import Model from 'web-model';
import LINKS from '@/LINKS';


/**
 * contact 数据报表接口
 */
export default new Model({
    base: LINKS.CONTACT_API_BASE + '/api/contact/v4',
    api: {

        /**
         * 联系人活跃（对比）
         * @param journeyInstantionIds 旅程Ids
         * @param taskInstantiationIds 任务Ids
         */
        getContactMap ({ journeyInstantionIds, taskInstantiationIds }) {
            return this.request
                .get('/contactMap')
                .query({ journeyInstantionIds, taskInstantiationIds });
        },

        /**
         * 打开设备占比 (pc/Mobile独立打开-副本)
         * @param journeyInstantionIds 旅程Ids
         * @param taskInstantiationIds 任务Ids
         */
        openProportion ({ journeyInstantionIds, taskInstantiationIds }) {
            return this.request
                .get('/OpenProportion')
                .query({ journeyInstantionIds, taskInstantiationIds });
        },

        /**
         * 邮件服务商占比
         * @param journeyInstantionIds 旅程Ids
         * @param taskInstantiationIds 任务Ids
         */
        getServicesProportion ({ journeyInstantionIds, taskInstantiationIds }) {
            return this.request
                .get('/servicesProportion')
                .query({ journeyInstantionIds, taskInstantiationIds });
        },

        /**
         * 邮件服务商占比
         * @param journeyInstantionIds 旅程Ids
         * @param taskInstantiationIds 任务Ids
         */
        getLinkClick ({ journeyInstantionIds, taskInstantiationIds }) {
            return this.request
                .get('/linkClick')
                .query({ journeyInstantionIds, taskInstantiationIds });
        },


    }
});