import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.WECHAT_API_BASE + '/api/wechat/v3',
    api: {
        /**
         * v3 微信渠道报告：图文送达统计
         * @param taskInstantiationIds
         */
        getSendCount (taskInstantiationIds) {
            return this.request
                .get('/report/sendCount')
                .query({
                    taskInstantiationIds
                });
        },

        /**
         * v3 微信渠道报告：阅读分享次数
         * @param taskInstantiationIds
         * @param startDate
         * @param endDate
         */
        getActiveCount (taskInstantiationIds, startDate, endDate) {
            return this.request
                .get('/report/readShare')
                .query({
                    taskInstantiationIds,
                    startDate,
                    endDate
                });
        },
        /**
         * 获取关注公众号
         * @returns 
         */
        allSubscriptionList() {
            return this.request.get('/authorization/bindingList');
        }
    }
});