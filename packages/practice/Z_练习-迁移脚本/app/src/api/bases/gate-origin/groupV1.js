import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.GATE_ORIGIN + '/api/v1/group/',
    api: {
        /**
         * 获取分组
         * @param keyWord
         */
        getAllGroup(keyWord) {
            return this.request
                .get('searchGroup')
                .query({
                    keyWord
                });
        },

        /**
         * 保存/编辑分组
         * @param name
         * @param id
         */
        createGroup({name, id}) {
            return this.request
                .post('addGroup')
                .send({
                    name, id
                });

        },

        /**
         * 删除分组
         * @param id
         * @returns {*}
         */
        deleteGroup({id}) {
            return this.request
                .delete('deleteGroup')
                .query({id});
        },

        /**
         * 获取权限分组
         */
        getSecurityGroup() {
            return this.request
                .get('getAllGroup');
        },

    }
});