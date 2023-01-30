import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.WEB_SERVICE_API_BASE + '/api/label/v1',
    api: {

        /**
         * 分值评估调用标签列表
         * @param type
         * @param cid
         */
        getLabelArray (type = '', cid) {
            return this.request
                .get('/label')
                .query({
                    type, cid
                });
        },


        /**
         * 标签列表
         * @param type
         */
        getLabelList ({ type }) {
            return this.request
                .get(`/labels`)
                .query({
                    type
                });
        },


        /**
         * 删除标签
         * @param id
         */
        deleteLabel (id) {
            return this.request
                .delete(`/label/${id}`);
        },


        /**
         * 保存为标签
         * @param cid
         * @param color
         * @param name
         * @param type
         * @param isShow
         * @param desc
         * @returns {Request|*}
         */
        saveLabel ({ cid, color, name, type, isShow, desc }) {
            return this.request
                .post(`/label`)
                .send({ cid, color, name, type, isShow, desc });
        },


        /**
         * 编辑标签
         * @param id
         * @param cid
         * @param color
         * @param name
         * @param type
         * @param isShow
         * @param desc
         * @returns {Request|*}
         */
        updateLabel ({ id, cid, color, name, type, isShow, desc }) {
            return this.request
                .put(`/label/${id}`)
                .send({ cid, color, name, type, isShow, desc });
        }

    }
});
