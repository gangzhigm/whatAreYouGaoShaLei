import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.GATE_ORIGIN + '/api/sender/',
    api: {
        /**
         * 查询发件人列表接口，系统+员工自己的
         * @param sendAddressId     发件地址 id
         * @returns {*}
         */
        getSenderAll(sendAddressId) {
            return this.request
                .get(`getSenderAll`)
                .query({sendAddressId});
        },
        /**
         * 根据部门id和发件地址id查询发件人列表（管理员配置的）
         * @param departmentId
         * @param sendAddressId
         * @returns {*}
         */
        getSenderByDepIdSendId(departmentId, sendAddressId) {
            return this.request
                .get(`getSenderByDepIdSendId`)
                .query({departmentId, sendAddressId});
        },
        /**
         * 单条保存发件人
         * @param departmentId      部门 id
         * @param name              发件人 name
         * @param sendAddressId     发件地址 id，senderType=1时必填
         * @param senderType        类型 1=管理员配置 2=员工自定义
         * @returns {*}
         */
        saveEmailSender({departmentId, name, sendAddressId, senderType}) {
            return this.request
                .post(`sender`)
                .send({departmentId, name, sendAddressId, senderType});
        },
        /**
         * 单条编辑发件人
         * @param id     发件人 id
         * @param name   发件人 name
         * @returns {*}
         */
        modifyEmailSender({id, name}) {
            return this.request
                .put(`sender`)
                .send({id, name});
        },
        /**
         * 邮件-删除发件人
         * @param id
         * @returns {*}
         */
        delEmailSender(id) {
            return this.request
                .delete(`sender/${id}`);
        }
    }
});