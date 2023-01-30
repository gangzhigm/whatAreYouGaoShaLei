import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.GATE_ORIGIN + '/api/v1/department',
    api: {
        /**
         *
         */
        getAllDepartment() {
            return this.request
                .get('/getAllDepartment');
        },
        
        /**
         * 编辑保存组织节点
         * @param departmentName
         * @param id
         * @param parentId
         */
        addDepartment(id, departmentName, parentId) {
            return this.request
                .post('/addDepartment')
                .send(id, departmentName, parentId);
        },

        /**
         * 删除组织节点
         * @param id
         * @returns {*}
         */
        deleteOrg(id) {
            return this.request
                .del(`/delete/`).query({id: id});
        },

        /**
         * 获取安全组列表
         * @param {string} keyWord 安全组名称 搜索用
         */
        searchRoleByCompanyId (keyWord = '') {
            return this.request
                .get('/searchRoleByCompanyId')
                .query({ keyWord });
        },

        /**
         * 获取成员列表
         * @param {string} keyWord 邮箱名称  搜索用
         */
        searchUserByCompanyId (keyWord = '') {
            return this.request
                .get('/searchUserByCompanyId')
                .query({ keyWord });
        },

        /**
         * 获取部门列表
         * @param {string} keyWord 部门名称  搜索用
         */
        searchDepartmentByCompanyId (keyWord = '') {
            return this.request
                .get('/searchDepartmentByCompanyId')
                .query({ keyWord });
        },

        /**
         * 被共享者权限查看
         * @param materialType 素材类型（type=0时需要字段,不填默认为0）1.拖拽式邮件素材 0.其他
         * @param userId {Number} 网关的用户id
         * @param type {Number} 共享类别（不填默认为0）0:共享素材  2：共享金数据表单 3：共享标准表单
         */
        findMaterialSharing ({ userId, type, materialType }) {
            return this.request
                .get('/findMaterialSharing')
                .query({
                    userId,
                    type,
                    materialType
                });
        },

        /**
         * 共享列表查看部门/安全组/用户列表
         * @param ids {String} 查询ids ","分隔
         * @param type {Number} 类型 1:用户 2:部门 3:安全组
         */
        searchDepartments ({ ids = '', type = '' }) {
            return this.request
                .get('/searchDepartments')
                .query({
                    ids,
                    type
                });
        },
    }
});