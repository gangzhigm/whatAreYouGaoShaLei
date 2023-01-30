import Model from 'web-model';
import LINKS from '@/LINKS';


export default new Model({
    base: LINKS.WECHAT_API_BASE + '/api/wechat/v1/microPageGroup',
    api: {
        /***** 微页面分组-start *****/
        /**
         * 查询分组详情
         * @returns 
         */
        getGroupTree (params) {
            return this.request
                .get('/tree')
                .query(params);
        },

        /**
         * //微页面 保存/修改分组
         * @param {*} params 
         * @returns 
         */
        findGroupOptions (params) {
            return this.request
                .get('/tree')
                .query(params);
        },

        /**
         * 新增或修改分组
         * @param {
         * } params 
         * @returns 
         */
        groupSaveOrUpdate (params) {
            return this.request
                .post('/saveOrUpdate')
                .send(params);
        },

        delGroupTree (id) {
            return this.request
                .del(`/${id}`);
        }

        /***** 微页面分组-end *****/
    }
});
