import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.SCHEDULE_API_BASE,
    api: {

        /**
         * 获取数据源及属性
         * @param cid
         */
        getDataSource(cid) {
            return this.request
                .get(`/api/schedule/datasources`)
                .query({
                    cid,
                });
        },
    }
});