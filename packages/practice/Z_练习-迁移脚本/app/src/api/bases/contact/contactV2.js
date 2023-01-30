import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.CONTACT_API_BASE + '/api/contact/v2',
    api: {
        /**
         * 新增自定义图表
         * @param conditionJson 筛选条件
         * @param name 名字
         * @param target 指标
         */
        createNewMap ({ conditionJson, name, target }) {
            return this.request
                .post('/journeyReports')
                .send({ conditionJson, name, target });
        },

        /**
         * 自定报表 列表 +详情绘制嵌套
         * @param taskInstantiationIds 任务实例Ids
         * @param journeyInstantionIds
         */
        getJourneyDetailsReports (taskInstantiationIds, journeyInstantionIds) {
            return this.request
                .get(`/journeyReportsList`)
                .query({ taskInstantiationIds, journeyInstantionIds });
        },
        /**
         *  删除自定义图表
         *  @param id
         */
        delCustomMap (id) {
            return this.request
                .delete(`/journeyReports/${id}`);
        },

        eventDesitionBranch() {
            return this.request.get('/getEventConditionsBranch');
        }
    }
});