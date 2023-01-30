import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.JOURNEY_MATERIAL_API_BASE + '/api/emailHeadFootGroup/v1',
    api: {

        /**
         * 获取模板分组列表
         * @param sortType  排序方式
         * @returns {*}
         */
        getHeaderFooterGroupList(sortType) {
            return this.request
                .get('/emailHeadFootGroup')
                .query({sortType});
        },


        /**
         * 查询模板分组
         */
        getHeaderFooterGroup(id) {
            return this.request
                .get(`/emailHeadFootGroup/${id}`);
        },


        /**
         * 新增模板分组
         * @param name 分组名称
         * @param parentId 父级 id
         */
        createHeaderFooterGroup({name, parentId}) {
            return this.request
                .post('/emailHeadFootGroup')
                .send({name, parentId});
        },


        /**
         * 编辑模板分组
         * @param id 分组ID
         * @param name 分组名称
         *  @param parentId 父级 id
         */
        editHeaderFooterGroup({id, name, parentId}) {
            return this.request
                .put(`/emailHeadFootGroup/${id}`)
                .send({name, parentId});
        },


        /**
         * 删除模板分组
         * @param id 分组ID
         */
        deleteHeaderFooterGroup(id) {
            return this.request
                .delete(`/emailHeadFootGroup/${id}`);
        },
    }
});
