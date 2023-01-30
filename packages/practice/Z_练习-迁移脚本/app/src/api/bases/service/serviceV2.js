import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.SERVICE_API_BASE + '/api/v2/',
    api: {
        /**
         * 获取kudu状态
         * @param {*} id （公司id）
         */
        checkKuduStatus(id) {
            return this.request
                .get(`checkKuduStatus/${id}`);
        }
    }
});