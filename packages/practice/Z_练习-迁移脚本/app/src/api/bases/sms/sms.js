import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.SMS_API_BASE + '/api',
    api: {
        /**
         * api发送记录
         * @param coldPageNo
         * @param createId
         * @param endDate
         * @param invalidPush(是否显示推送)
         * @param mobileNumber
         * @param pageNo
         * @param sendoutId
         * @param showReport
         * @param startDate
         */
        apiSendRecord ({
            coldPageNo,
            createId,
            endDate,
            invalidPush,
            mobileNumber,
            pageNo,
            sendoutId,
            showReport,
            startDate
        }) {
            return this.request
                .get(`/system/sendMonitor/apiSendRecord`)
                .query({
                    coldPageNo, createId,
                    endDate,
                    invalidPush,
                    mobileNumber,
                    pageNo,
                    sendoutId,
                    showReport,
                    startDate
                });
        },
        /**
         * 发送记录
         * @param campaignId (活动Id)
         * @param coldPageNo
         * @param createId
         * @param endDate
         * @param invalidPush(是否显示推送)
         * @param mobileNumber
         * @param pageNo
         * @param sendoutId (签名id)
         * @param showReport
         * @param startDate
         */
        sendRecord ({
            campaignId,
            coldPageNo,
            createId,
            endDate,
            invalidPush,
            mobileNumber,
            pageNo,
            sendoutId,
            showReport,
            startDate
        }) {
            return this.request
                .get(`/system/sendMonitor/sendRecord`)
                .query({
                    campaignId,
                    coldPageNo,
                    createId,
                    endDate,
                    invalidPush,
                    mobileNumber,
                    pageNo,
                    sendoutId,
                    showReport,
                    startDate
                }
                );
        },
        /**
         * 发送汇总
         * @param createId
         * @param endDate
         * @param groupBy (0)
         * @param isApi
         * @param sms
         * @param startDate
         * @param type
         */
        getSummaryList ({
            createId,
            endDate,
            groupBy,
            isApi,
            sms,
            startDate,
            type
        }) {
            return this.request
                .get(`/system/sendMonitor/summaryList`)
                .query({ createId, endDate, groupBy, isApi, sms, startDate, type });
        },
    }
});