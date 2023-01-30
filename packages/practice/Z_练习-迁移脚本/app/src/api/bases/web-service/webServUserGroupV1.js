import Model from 'web-model';
import LINKS from '@/LINKS';


/**
 * 分析 用户分群
 */
export default new Model({
    base: LINKS.WEB_SERVICE_API_BASE + '/api/userGroup/v1',
    api: {
        /**
         *  --- START migrated from outdated src/analysis/user-group/model/userGroupModel.js ---
         */
        /**
         * 获取用户分群(分组)列表
         */
        getUserGroups () {
            return this.request
                .get('/userGroup');
        },


        /**
         * 新建用户分群
         * @param group
         * @return {Request|*|void}
         */
        createGroup (group) {
            return this.request
                .post('/userGroup')
                .send(group);
        },


        /**
         * 用户分群编辑
         * status 状态 0：仅保存；1：保存并执行；2：打标签
         * type 分群类型 0：正常分群;1：报表分群；
         * @param {Object} group
         */
        updateGroup (group) {
            return this.request
                .put(`/userGroup/${group.id}`)
                .send(group);
        },


        /**
         * 分群排序
         * @param ids
         * @return {Request|*|void}
         */
        sortOverHives ({ ids }) {
            return this.request
                .put('/order')
                .send({ ids });
        },


        /**
         * 启用/禁用 分群
         */
        enableGroup (id) {
            return this.request
                .put(`/enable/${id}`);
        },


        /**
         * 删除用户分群
         * @param id
         */
        del (id) {
            return this.request
                .del(`/userGroup/${id}`);
        },


        /**
         * 用户分群用户列表
         * @param data
         */
        getUserList (data) {
            return this.request
                .post(`/usergroup/page`)
                .send(data);
        },


        /**
         * 获取csvUrl
         * @param cid
         * @param id
         */
        getCsvUrl ({ cid, id }) {
            return this.request
                .post(`/usergroup/getcsvurl`)
                .send({ cid, id })
                .escape('after');
        },


        downCsv (url) {
            return this.request
                .get(`/usergroup/downloadcsv?path=${url}`)
                .escape('after')
                .responseType('blob');
        }
        /**
         *  --- EDN migrated from outdated src/analysis/user-group/model/userGroupModel.js ---
         */
    }
});
