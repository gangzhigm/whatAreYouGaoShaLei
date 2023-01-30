import Model from 'web-model';
import LINKS from '@/LINKS';


// 联系人导出 model
export default new Model({
    base: LINKS.CONTACT_EXPORT_API_BASE + '/api/contact/v1',
    api: {
        /**
         * 客户管理-客户分群-查看分群-下载csv
         * @param id
         * @param emailAddress
         * @param fieldIds
         * @param formatType 格式类型
         * @param dataFormat 数据格式
         * @param emailSubject 邮件主题
         * @returns {*}
         */
        exportContact (id, emailAddress, fieldIds, formatType, dataFormat, emailSubject) {
            return this.request
                .get(`/swarm/${id}/contact/csv`)
                .query({
                    id,
                    emailAddress,
                    fieldIds,
                    formatType,
                    dataFormat,
                    emailSubject
                });
        },

        
        /**
        * 
        --- START migrated from outdated src/data/report/journey/model/contactReportService.js ---
        */
        

        /**导出邮件老版报告
         * @param count
         * @param email
         * @param taskInstantiationIds
         * @param type
         * * 2.1新增时间发送时间
         * @param date (包含定时的发送时间和循环的开始时间)
         * @param endCount
         * @param endDate
         * @param endDay
         * @param frequency
         * @param sendType
         * @param timeZone*
         * 华为2.4.6新增
         * @param formatType
         * @param unicode （0是UTF-8,1是GB2312）
         * @param dataType
         */
        exportOldEmail (
            {
                count, email, taskInstantiationIds, type,
                date, endCount, endDate, endDay,
                frequency, sendType, timeZone, formatType,
                unicode, emailSubject
            }) {
            return this.request
                .get('/emailTaskContactDownLoad')
                .query({
                    count, email, taskInstantiationIds,
                    type, date, endCount, endDate, endDay,
                    frequency, sendType, timeZone,
                    formatType, unicode, emailSubject
                });
        },

        /**
         * 导出邮件服务商
         */
        downloadServicesProportion (downloadData) {
            return this.request
                .get('/exportServicesProportion')
                .query(downloadData);
        },

        /**
         * 导出设备独立打开
         */
        downloadOpenProportion (downloadData) {
            return this.request
                .get('/exportOpenProportion')
                .query(downloadData);
        },

        /**
         * 导出设备独立打开(PK)
         */
        downloadOpenProportionPK (downloadData) {
            return this.request
                .get('/exportOpenProportionPK')
                .query(downloadData);
        },

        /**
         * 导出链接独立点击top5
         */
        downloadLinkClick (downloadData) {
            return this.request
                .get('/exportLinkClick')
                .query(downloadData);
        },

        /**
         * 导出链接独立点击top5(PK)
         */
        downloadLinkClickPK (downloadData) {
            return this.request
                .get('/exportLinkClickPK')
                .query(downloadData);
        },

        /**
         * 导出联系人活跃
         */
        downloadContactMap (downloadData) {
            return this.request
                .get('/exportContactMap')
                .query(downloadData);
        },

        /**
         * 导出联系人活跃(PK)
         */
        downloadContactMapPK (downloadData) {
            return this.request
                .get('/exportContactMapPK')
                .query(downloadData);
        },
        
        /**
        * 
        --- END migrated from outdated src/data/report/journey/model/contactReportService.js ---
        */
        
    }
});