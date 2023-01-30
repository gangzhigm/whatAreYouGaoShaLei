import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.QUESTIONNAIRE_API_BASE + '/api/questionnaire/auth',
    api: {
        /**
         * 测试表单、下载详情、删除权限获取
         * @param formId 表单ID
         * @param type 校验类型  0共享，1查看，2编辑，3测试， 4表单统计， 5删除，8报告发送设置，9下载详情，10复制, 11日志
         *                      15 编辑数据 ，16 查看链接， 17 删除自定义表单， 18 新增自定义表单 ，19 自定义表单
         */
        downloadDetailAccess({paperId, type}) {
            return this.request
                .get(`/v1/papersList/isAccess`)
                .query({
                    paperId,
                    type,
                });
        },
    }
});