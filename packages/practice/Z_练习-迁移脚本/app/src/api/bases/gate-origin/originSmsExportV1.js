import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.GATE_ORIGIN + '/smsexport/api/smsExport/v1',
    api: {
        /**
         * 导出短彩信点击数据
         * @param campaignIds
         * @param email
         * @param overTime
         * @param startTime
         * @param uniCode
         * @param formatType (Excel CSV)
         * @param emailSubject 邮箱主题
         */
        exportClickData ({
            campaignIds,
            email,
            overTime,
            startTime,
            uniCode,
            formatType,
            emailSubject
        }) {
            return this.request
                .get('/dataReport/file/exportClickData')
                .query({
                    campaignIds,
                    email,
                    overTime,
                    startTime,
                    uniCode,
                    formatType,
                    emailSubject
                });
        },
        /**
         * 导出短彩信上行回复数据
         * @param email
         * @param overTime
         * @param sendoutId
         * @param startTime
         * @param uniCode
         * @param formatType (Excel CSV)
         * @param emailSubject 邮箱主题
         */
        exportResponseData ({
            email,
            overTime,
            sendoutId,
            startTime,
            uniCode,
            formatType,
            emailSubject
        }) {
            return this.request
                .get('/dataReport/file/exportResponseData')
                .query({
                    email,
                    overTime,
                    sendoutId,
                    startTime,
                    uniCode,
                    formatType,
                    emailSubject
                });
        },
        /**
         * 导出短彩信API报表
         * @param email
         * @param overTime
         * @param sendoutIds
         * @param startTime
         * @param type
         * @param uniCode
         * @param formatType (Excel CSV)
         * @param emailSubject 邮箱主题
         */
        getExportAPIReport ({
            email,
            overTime,
            sendoutIds,
            startTime,
            type,
            uniCode,
            formatType,
            emailSubject
        }) {
            return this.request
                .get(`/dataReport/API/exportAPIReport`)
                .query({
                    email,
                    overTime,
                    sendoutIds,
                    startTime,
                    type,
                    uniCode,
                    formatType,
                    emailSubject
                });
        },
        /**
         * 导出短彩信原始数据
         * @param campaignIds
         * @param email
         * @param overTime
         * @param startTime
         * @param type
         * @param uniCode
         * @param formatType （Excel CSv）
         * @param emailSubject 邮件主题
         */
        exportDataReport ({
            campaignIds,
            email,
            overTime,
            startTime,
            type,
            uniCode,
            formatType,
            emailSubject
        }) {
            return this.request
                .get('/dataReport/file/exportDataReport')
                .query({
                    campaignIds,
                    email,
                    overTime,
                    startTime,
                    type,
                    uniCode,
                    formatType,
                    emailSubject
                });
        },
        /**
         * API发送导出
         *
         */
        getExportAPIPushFaild ({
            createId,
            email,
            overTime,
            invalidPush,
            mobile,
            sendoutId,
            showReport,
            startTime,
            uniCode
        }) {
            return this.request
                .get('/dataReport/API/exportAPIPushFaild')
                .query({
                    createId,
                    email,
                    overTime,
                    invalidPush,
                    mobile,
                    sendoutId,
                    showReport,
                    startTime,
                    uniCode
                });
        },
        /**
         * 发送记录导出
         */
        getExportPushFaild ({
            email,
            campaignId,
            overTime,
            invalidPush,
            mobile,
            sendoutId,
            startTime,
            showReport,
            uniCode
        }) {
            return this.request
                .get('/dataReport/file/exportPushFaild')
                .query({
                    email,
                    campaignId,
                    overTime,
                    invalidPush,
                    mobile,
                    sendoutId,
                    startTime,
                    showReport,
                    uniCode
                });
        },
        /**
         * 短彩信-根据活动id（ids）获取活动详情
         * @param sendoutIds
         * @returns {*}
         */
        getSignature (sendoutIds) {
            return this.request
                .get(`/monitor/sendoutList?sendoutIds=${sendoutIds}`);
        },
        /**
         * 导出NIKE短彩信批次报告
         * @param {String} journeyTemplateIds 旅程模板id
         * @param {Number} unicode 编码格式，0：UTF-8，1：GBK
         * @param {String} email 用户邮箱
         * @param {Number} type 短彩信，0：短信，1：彩信
         * @param {String} startTime 开始时间
         * @param {String} endTime 结束时间
         */
        nikeBatchReport ({
            journeyTemplateIds,
            unicode,
            email,
            type,
            startTime,
            endTime
        }) {
            return this.request
                .get('/dataReport/API/nikeBatchReport')
                .query({
                    journeyTemplateIds,
                    unicode,
                    email,
                    type,
                    startTime,
                    endTime
                });
        },
    }
});
