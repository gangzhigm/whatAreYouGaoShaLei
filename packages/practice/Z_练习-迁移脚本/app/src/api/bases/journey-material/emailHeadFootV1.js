import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.JOURNEY_MATERIAL_API_BASE + '/api/emailHeadFoot/v1',
    api: {

        /**
         * 查询模板列表
         * @param groupId 分组ID
         * @param name 名称模糊查询
         * @param pageNumber 页码
         * @param type 1 for head, 2 for foot, empty for all
         */
        getHeaderFooterList({groupId, name, pageNumber, type,sortOrder, sortValue}) {
            return this.request
                .get('/emailHeadFoot')
                .query({
                    groupId,
                    name,
                    pageNumber,
                    type,
                    sortOrder,
                    sortValue
                });
        },


        /**
         * 查询模板详情
         * @param id
         */
        getHeaderFooter(id) {
            return this.request
                .get(`/emailHeadFoot/${id}`);
        },


        /**
         * 新建模板
         * @param content 内容
         * @param groupId 分组ID
         * @param name 名称
         * @param type 类型 1=头部，2=尾部
         * @return {Request|*}
         */
        createHeaderFooter({content, groupId, name, type}) {
            return this.request
                .post('/emailHeadFoot')
                .send({
                    content,
                    groupId,
                    name,
                    type
                });
        },


        /**
         * 编辑模板详情
         * @param id 模板ID
         * @param content 内容
         * @param groupId 分组ID
         * @param name 名称
         * @param type 类型 1=头部，2=尾部
         */
        editHeaderFooter(id,{content, groupId, name, type}) {
            return this.request
                .put(`/emailHeadFoot/${id}`)
                .send({
                    content,
                    groupId,
                    name,
                    type
                });
        },


        /**
         * 移动模板
         * @param id 模板ID
         * @param groupId 分组ID
         */
        moveHeaderFooter(id, groupId) {
            return this.request
                .put(`/emailHeadFootMove/${id}/${groupId}`);
        },


        /**
         * 复制模板
         * @param id 模板ID
         */
        copyHeaderFooter(id) {
            return this.request
                .put(`/emailHeadFootCoppy/${id}`);
        },


        /**
         * 删除模板
         * @param id 模板ID
         */
        deleteHeaderFooter(id) {
            return this.request
                .delete(`/emailHeadFoot/${id}`);
        },


        /**
         * 粘贴代码（批次发送） 保存时格式校验
         * @param {string} html 粘贴的素材html
         * @param {string} json 根据素材生成的json数据
         */
        nikeMaterialCheck(html, json) {
            return this.request
                .post(`/checkEmailHtmlJson`)
                .send({
                    html,
                    json
                });
        },
    }
});
