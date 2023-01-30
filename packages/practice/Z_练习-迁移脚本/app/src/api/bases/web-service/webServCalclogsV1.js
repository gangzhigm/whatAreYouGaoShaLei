/**
 * 分值评估模型
 */

import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.WEB_SERVICE_API_BASE + '/api/calclogs/v1',
    api: {
        /**
         * 评级规则 日志列表
         * @param id
         */
        getEvaluationLogs(id) {
            return this.request
                .get(`/logList/${id}`);
        }
    }
});
