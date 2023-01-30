import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.JOURNEY_API_BASE + '/taskinstantiation/api/v1',
    api: {
        /**
         * 根据旅程模板id查询旅程实例id集合
         * taskId 任务模版id
         */
        getJourneyExampleIds(taskTemplateId) {
            return this.request
                .get('/getIdList')
                .query({taskTemplateId});
        }
    }
});
