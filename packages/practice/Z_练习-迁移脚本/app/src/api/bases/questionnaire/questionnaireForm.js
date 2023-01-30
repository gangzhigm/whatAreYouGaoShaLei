import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.QUESTIONNAIRE_API_BASE + '/api/questionnaire/v1/form',
    api: {
        // 扩展属性
        /**
         * 获取扩展属性列表
         * @param formId    表单id
         * @returns {*}
         */
        getExtends(formId) {
            return this.request
                .get(`/${formId}/extensionValue`);
        },
        /**
         * 生成链接
         * @param formId            表单id
         * @param expandContents    扩展属性
         * @param formLink          表单链接（带扩展属性）
         * @returns {*}
         */
        addLink(formId, expandContents, formLink) {
            return this.request
                .post(`/${formId}/extensionValue`)
                .send({expandContents, formLink});
        },
        /**
         * 删除链接
         * @param extensionValueId 扩展值id
         * @returns {*}
         */
        delLink(extensionValueId) {
            return this.request
                .delete(`/extensionValue/${extensionValueId}`);
        },
        // 字段匹配
        /**
         * 获取字段匹配字段
         * @param paperId
         */
        getFieldMatch(paperId) {
            return this.request
                .get(`/${paperId}/fieldMatch`);
        },
        /**
         * 保存字段匹配
         * @param paperId
         * @param fieldMatchList
         */
        saveFieldMatch(paperId, fieldMatchList) {
            return this.request
                .post(`/${paperId}/fieldMatch`)
                .send({contrastList: fieldMatchList});
        },
        getStandardFormDetail(id) {
            return this.request
                .get(`/${id}`);
        },


        /**
         *  导出html
         *  @param id
         */
        exportHtml(id) {
            return this.request
                .get(`/${id}/export`);
        },
    },
});