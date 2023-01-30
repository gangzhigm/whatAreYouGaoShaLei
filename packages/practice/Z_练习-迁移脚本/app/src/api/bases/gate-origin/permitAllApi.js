import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.GATE_ORIGIN + '/api/permitAll',
    api: {
        /**
         * 获取没有使用权限菜单的预览内容
         * @param menuId
         * @return {*}
         */
        getUnAuthorizedPreview(menuId) {
            return this.request
                .post('/getPreview/' + menuId);
        },
        /**
         * 获取共享规则列表
         * @param {Number} name
         * @param {Number} pageNumber
         */
        getRulesList(name, pageNumber) {
            return this.request.get('/getRulesList').query({ name, pageNumber });
        },

        /**
         * 获取单条规则详情
         * @param {Number} id
         */
        getRules(id) {
            return this.request.get('/getRules').query({ id });
        },

        /**
         * 查看已选安全组
         * @param {Number} id
         */
        getRole(id) {
            return this.request.get('/getRole').query({ id });
        },

        /**
         * 查看所有安全组
         */
        getAllRole() {
            return this.request.get('/getAllRole');
        },

        /**
         * 添加或编辑
         * @param {Sting} conditionJson
         * @param {Number} id 添加id=0
         * @param {Sting} name
         * @param {Boolean} openStatus
         * @param {Array} roleIds
         */
        saveRules({ conditionJson, id, name, openStatus, roleIds }) {
            return this.request.post('/saveRules').send({ conditionJson, id, name, openStatus, roleIds });
        },

        /**
         * 删除一条规则
         * @param {Number} id
         */
        deleteRules(id) {
            return this.request.delete('/deleteRules').query({ id });
        },

        /**
         * 更改启用状态
         * @param {Number} id
         * @param {Boolean} openStatus
         */
        changeOpenStatus({ id, openStatus }) {
            return this.request.post('/changeOpenStatus').send({ id, openStatus });
        },

        /**
         * 复制一条规则
         * @param {Number} id
         */
        copyRules({id}) {
            return this.request.post('/copyRules').send({ id });
        }
    }
});