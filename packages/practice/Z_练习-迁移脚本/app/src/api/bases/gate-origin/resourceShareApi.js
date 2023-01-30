import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.GATE_ORIGIN + '/api/resourceShare',
    api: {
        /**
         * 删除一条规则
         * @param {any} id
         * @returns {*}
         */
        delResourceShare(id) {
            return this.request.delete('/deleteRules').query({ id });
        },
        /**
         * 复制一条规则
         * @param {any} id
         * @returns {*}
         */
        copyResourceShare(id) {
            return this.request.post('/copyRules').send({ id });
        },
        /**
         * 更改启用状态
         * @param {any} id
         * @param {any} openStatus
         * @returns {*}
         */
        changeResourceShare({id,openStatus}) {
            return this.request.post('/changeOpenStatus').send({
                id,
                openStatus
            });
        },
        /**
         * 查看已选安全组
         * @param {Number} id
         */
        getRoleResourceShare(id) {
            return this.request.get('/getRole').query({ id });
        },
        /**
         * 查看所有的安全组
         * @returns {*}
         */
        getAllRoleResourceShare() {
            return this.request.get('/getAllRole');
        },
        /**
         * 添加或编辑
         * @param {any} filterJson
         * @param {any} id
         * @param {any} name
         * @param {any} openStatus
         * @param {any} shareJson
         * @returns {*}
         */
        saveRulesResourceShare({filterJson,id,name,openStatus,shareJson}) {
            return this.request.post('/saveRules').send({
                filterJson,
                id,
                name,
                openStatus,
                shareJson
            });
        },
        /**
         * 获取共享类型列表
         * @param {any} name
         * @param {any} pageNumber
         * @returns {*}
         */
        getShareTypeResourceShare() {
            return this.request.get('/getShareType');
        },
        /**
         * 获取共享规则列表
         * @param {any} name
         * @param {any} pageNumber
         * @returns {*}
         */
        getRulesListResourceShare(name,pageNumber) {
            return this.request.get('/getRulesList').query({ name, pageNumber });
        },
        /**
         * 获取单条规则详情
         * @param {any} id
         * @returns {*}
         */
        getRulesResourceShare(id) {
            return this.request.get('/getRules').query({ id });
        },
        /**
         * 获取所有部门
         * @returns {*}
         */
        getAllDepartmentResourceShare() {
            return this.request.get('/getAllDepartment');
        },
    }
});