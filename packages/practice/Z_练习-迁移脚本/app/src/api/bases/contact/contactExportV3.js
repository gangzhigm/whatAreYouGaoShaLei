import Model from 'web-model';
import LINKS from '@/LINKS';


export default new Model({
    base: LINKS.CONTACT_EXPORT_API_BASE + '/api/contact/v3',
    api: {
        /**
         * v3 导出邮件原始数据
         * @param email
         * @param taskInstantiationIds
         * @param type
         * @param unicode
         * 2.1新增时间发送时间
         * @param date (包含定时的发送时间和循环的开始时间)
         * @param endCount
         * @param endDate
         * @param endDay
         * @param frequency
         * @param sendType
         * @param timeZone
         * @param fieldIds 邮件-营销原始数据-特殊指标
         * 华为2.4.6新增
         * @param formatType 格式类型
         * @param emailSubject 邮箱主题
         */
        exportEmail (
            {
                email, taskInstantiationIds,
                type, unicode, date, endCount,
                endDate, endDay, frequency, sendType, timeZone, fieldIds,
                formatType, emailSubject
            }) {
            return this.request
                .get('/exportEmailRawData')
                .query({
                    email, taskInstantiationIds, type,
                    unicode, date, endCount, endDate, endDay,
                    frequency, sendType, timeZone, fieldIds,
                    formatType, emailSubject
                });
        },

        /**
         * 导出邮件对比数据
         * param rap: http://rap.qdum.com/workspace/myWorkspace.do?projectId=15#7578
         */
        exportEmailCompared (postData) {
            return this.request
                .get('/exportEmailContrastData')
                .query(postData);
        },

        // 华为定制 导出邮件定时任务 - 获取操作记录列表
        exportTimeTask(obj) {
            return this.request
                .get('/exportEmailPeriodicTask')
                .query(obj);
        },
        // 华为定制 导出邮件定时任务 - 查看单条操作记录日志列表
        viewLogEvent(exportLogId, pageNumber) {
            return this.request
                .get('/exportTimeLog')
                .query({exportLogId, pageNumber});
        },

        /**
         * 导出发送频次日志
         * @param email
         * @param beginTime
         * @param endTime
         * @param dataFormat
         * @param emailSubject
         * @param formatType
         */
        exportSentLog({email, beginTime, endTime, emailSubject, formatType, dataFormat}) {
            return this.request
                .get('/exportSentLog')
                .query({email, beginTime, endTime, emailSubject, formatType, dataFormat});
        },
        /**
         * 排除邮箱导出通知
         * @param {*} params 
         * @returns 
         */
        sendDetailDownload(params) {
            return this.request
                .get('/removalData')
                .query(params);
        }
    }
});