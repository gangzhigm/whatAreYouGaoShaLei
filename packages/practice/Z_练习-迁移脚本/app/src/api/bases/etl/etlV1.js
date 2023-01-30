import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.ETL_API_BASE + '/api/v1',
    api: {
        /**
         * 获取联系人详情日历视图
         * @param customerId
         * @param eventIds
         * @param fromDate
         * @param toDate
         * @param pageNum
         * @param pageSize
         * @returns {*}
         */
        getCustomerTimeline (customerId, eventIds, fromDate, toDate, pageNum, pageSize) {
            return this.request
                .get('/customer/events')
                .query({ customerId, eventIds, fromDate, toDate, pageNum, pageSize });
        },
        /**
         * 编辑联系人属性
         * @param customerId 联系人id
         * @param properties 属性列表 json eg:{"mobile": "183****6527","name": "tianshl"}
         * @returns {*}
         */
        editCustomerAttr (customerId, properties) {
            return this.request
                .put('/customer')
                .send({ customerId, properties });
        },

        /**
         *  --- START from outdated src/customer/swarm/swarmModel.js ---
         */

        /**
         * 删除用户
         * @param parentIds
         * @returns {*}
         */
        deleteUser (parentIds) {
            return this.request.del(`/customer/remove`)
                .send({
                    parentIds
                });
        },
        /**
         * 导出csv / xls格式的文件
         * @param type csv|excel
         */
        exportTemplateFiles (type) {
            return this.request
                .get('/sftp/template')
                .query({ type: type })
                .escape('after')
                .responseType('blob');
        },

        /**
         *  --- END from outdated src/customer/swarm/swarmModel.js ---
         */

        /*
        * 联系人详情下载
        * @param customerId 联系人ID
        *@param dataType 格式类型
        *@param dataFormat 数据格式
        *@param emailAddress email地址
        *@param emailSubject 邮件主题
        *@param eventIds 事件id列表
        * */
        downloadEvents (customerId, dataType, dataFormat, emailAddress, emailSubject, eventIds, fromDate, toDate) {
            return this.request
                .get('/customer/export')
                .query({
                    customerId,
                    dataType,
                    dataFormat,
                    emailAddress,
                    emailSubject,
                    eventIds,
                    fromDate,
                    toDate
                });
        },

        /**
         *  --- START from outdated src/data/data-center/dataCenterModel.js ---
         */

        /**
         * 获取数据源列表
         * @returns {*}
         */
        getDataSets () {
            return this.request
                .get(`/dataCenter/dataSets`);
        },

        /**
         * 获取数据预览
         * @param query
         * @returns {*}
         */
        getPreview (query) {
            return this.request
                .get(`/dataCenter/preview`)
                .query(query);
        },

        /**
         * 获取日历列表
         * @param begin     开始日期
         * @param end       结束日期
         * @param id        sftpId | sdkId
         * @param type      sftp | sdk
         * @returns {*}
         */
        getCalendar (query) {
            return this.request
                .get(`/dataCenter/calendar`)
                .query(query);
        },

        /**
         *  --- END from outdated src/data/data-center/dataCenterModel.js ---
         */


        /**
         *  --- START from outdated src/data/data-center/api/APIModel.js ---
         */


        /**
         * 获取api详情
         * @param id
         * @returns {*}
         */
        getAPIDetails (id) {
            return this.request
                .get(`/api/detail/${id}`);
        },


        /**
         * 获取进数详情
         * @param query
         * @returns {*}
         */
        getAPIList (query) {
            return this.request
                .get(`/api/datas/${query.id}`)
                .query(query);
        },


        /**
         * API模块获取文件的错误日志
         * @param query
         * @returns {*}
         */
        getErr (query) {
            return this.request
                .get(`/api/err/${query.id}`)
                .query(query);
        },


        /**
         * 获取错误记录csv文件地址
         */
        getErrorCSVUrl (id) {
            return this.request
                .get(`/api/err/download/${id}`);
        },


        /**
         * 创建api
         * @param query
         * @returns {*}
         */
        getApi (query) {
            return this.request
                .post(`/api`)
                .send(query);
        },


        /**
         * 更新api
         * @param query
         * @returns {*}
         */
        updateApi (query) {
            return this.request
                .put(`/api/${query.id}`)
                .send(query);
        },


        /**
         * 更新密钥
         * @param id    api id
         * @returns {*}
         */
        updateApiSecret (id) {
            return this.request
                .put(`/api/changeSecret/${id}`);
        },

        /**
         * 删除API
         * @param id
         * @returns {*}
         */
        deleteApi (id) {
            return this.request
                .delete(`/api/${id}`);
        },

        /**
         *  --- END from outdated src/data/data-center/api/APIModel.js ---
         */

        /**
         *  --- START migrated from outdated src/data/data-center/service-sdk/SDKModel.js ---
         */

        /**
         * 获取sdk详情
         * @param id
         * @returns {*}
         */
        getSDKDetails (id) {
            return this.request
                .get(`/sdk/${id}`);
        },

        /**
         * 获取进数详情
         * @param query
         * @returns {*}
         */
        getSDKList (query) {
            return this.request
                .get(`/sdk/datas/${query.id}`)
                .query(query);
        },

        /**
         * SDK模块获取文件的错误日志 原getErr
         * @param query
         * @returns {*}
         */
        getSDKErr (query) {
            return this.request
                .get(`/sdk/err/${query.id}`)
                .query(query);
        },

        /**
         * 创建service sdk
         * @param query
         * @returns {*}
         */
        getServiceSdk (query) {
            return this.request
                .post(`/sdk`)
                .send(query);
        },

        /**
         * 更新service sdk
         * @param query
         * @returns {*}
         */
        updateServiceSdk (query) {
            return this.request
                .put(`/sdk/${query.id}`)
                .send(query);
        },

        /**
         * 更新密钥
         * @param id    service sdk id
         * @returns {*}
         */
        updateServiceSecret (id) {
            return this.request
                .put(`/sdk/changeSecret/${id}`);
        },

        /**
         * 更新Key
         * @param id    service sdk id
         * @returns {*}
         */
        updateServiceKey (id) {
            return this.request
                .put(`/sdk/changeKey/${id}`);
        },

        /**
         * 删除sdk
         * @param id
         * @returns {*}
         */
        deleteSdk (id) {
            return this.request
                .delete(`/sdk/${id}`);
        },

        /**
         * 下载SDK
         * @returns {*}
         */
        downloadSDK () {
            return this.request
                .get(`/sdk/download`)
                .query({
                    language: 'java',
                })
                .escape('after')
                .responseType('arraybuffer');
        },
        /**
         * 下载SDK
         * @returns {*}
         */
        downloadJsSDK () {
            return this.request
                .get(`/sdk/download`)
                .query({
                    language: 'javascript',
                })
                .escape('after')
                .responseType('arraybuffer');
        },

        /**
         *  --- END migrated from outdated src/data/data-center/service-sdk/SDKModel.js ---
         */

        /**
         *  --- START migrated from outdated src/data/data-center/sftp/sftpModel.js ---
         */

        /**
         * 创建用户
         * @param file
         * @param name
         * @returns {*}
         */
        createAccount (file, name) {
            return this.request
                .post(`/sftp`)
                .attach('secretKey', file)
                .field('sftpUsername', name);
        },


        /**
         * sftp下载密钥
         * @param id        sftpId
         * @returns {*}
         */
        downloadSecretKey (id) {
            return this.request
                .get(`/sftp/downloadSecretKey/${id}`)
                .escape('after')
                .responseType('arraybuffer');
        },


        /**
         * 更新sftp密钥
         * @param id
         * @param file
         * @returns {*}
         */
        updateSecretKey (id, file) {
            return this.request
                .post(`/sftp/changeSecretKey/${id}`)
                .attach('secretKey', file);
        },


        /**
         * 参数设置
         * @param sftp      sftp对象
         * @returns {*}
         */
        setParams (sftp) {
            return this.request
                .put(`/sftp/${sftp.id}`)
                .send(sftp);
        },


        /**
         * 生成文件模板
         * @param id
         * @returns {*}
         */
        getTemplate (id) {
            return this.request
                .get(`/sftp/csv/${id}`)
                .responseType('arraybuffer')
                .escape('after');
        },


        /**
         * 获取账户详情
         * @param id
         * @returns {*}
         */
        getSftpDetails (id) {
            return this.request
                .get(`/sftp/${id}`);
        },


        /**
         * 获取文件列表
         * @param query
         * @returns {*}
         */
        getFiles (query) {
            return this.request
                .get(`/sftp/file`)
                .query(query);
        },


        /**
         * Sftp模块 获取文件的错误日志 getErr
         * @param query
         * @returns {*}
         */
        getSftpErr (query) {
            return this.request
                .get(`/sftp/file/err/${query.id}`)
                .query(query);
        },

        /**
         * Sftp 模块 获取错误记录csv文件地址 未使用
         */
        // getErrorCSVUrl (id) {
        //     return this.request
        //         .get(`/sftp/file/err/download/${id}`);
        // },

        /**
         * 删除sftp
         * @param id    sftpId
         * @returns {*}
         */
        deleteSftp (id) {
            return this.request
                .delete(`/sftp/${id}`);
        },

        /**
         * 默认SFTP数据源
         * @param {method} get
         */
        getDefaultSFTP () {
            return this.request
                .get('/sftp/default');
        },
        /**
         * SFTP FILE 导出错误V2
         * @param id
         * @param downloadType
         * @param email
         * @param formatType (Excel CSV)
         * @param charset (utf8/gb2312)
         *@param emailSubject 邮件主题
         */
        getCSVUrl ({ id, downloadType, email, srcType,
            formatType, charset, emailSubject }) {
            return this.request
                .get(`/dataCenter/export`)
                .query({
                    id, downloadType, email, srcType,
                    formatType, charset, emailSubject
                });
        },

        /**
         *  --- END migrated from outdated src/data/data-center/sftp/sftpModel.js ---
         */
    }
});


// 从 src/data/data-center/sftp/sftpModel.js 导入，未被调用过
// export const download = new Model({
//     base: LINKS.ETL_API_BASE + '/api/v1',
//     api: {
//         /**
//          * SFTP FILE 导出错误V2
//          * @param id
//          * @param downloadType
//          * @param email
//          */
//         getCSVUrl(id,downloadType,email){
//             return this.request
//                 .get(`/dataCenter/export`)
//                 .query(id,downloadType,email);
//         },
//     }
// });