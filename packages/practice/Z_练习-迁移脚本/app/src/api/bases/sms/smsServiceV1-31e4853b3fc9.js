import Model from 'web-model';
import LINKS from '@/LINKS';
import { PRIVATE_DEVELOPMENT } from '@/private.js';
import { GET_TOKEN } from '@/store/vuex/actionTypes.js';
import rootStore from '@/store/vuex/rootStore';

export default new Model({
    base: LINKS.SMS_API_BASE + '/api/smsservice/v1',
    api: {
        /**
         * 根据sendoutId获取campaign
         * @param pageNumber
         * @param searchKeyword
         * @param sendOutId
         */
        getCampaignBySendOutId ({ pageNumber, searchKeyWord, sendOutId }) {
            return this.request
                .get(`/newMonitor/getSmscampaignsBySendout`)
                .query({ pageNumber, searchKeyWord, sendOutId });
        },
        /**
         * 获取所有签名
         */
        getAllSendOutList () {
            return this.request
                .get(`/newMonitor/sendoutList`);
        },

        /**
        * --- START migrated from outdated src/journey/smsService.js ---
        */

        /**
         * 根据联系人id获取所有签名
         */
        getSendOutList () {
            // 私有化部署
            if (PRIVATE_DEVELOPMENT) {
                // 私有化部署需要获取gateId
                let gateId = rootStore.state.user.id;
                let tokenValue = JSON.parse(localStorage.getItem(GET_TOKEN));
                return this.request
                    .get(LINKS.SMS_API_BASE + '/api/web-api/smsservice/v1/newMonitor/sendoutList')
                    .query({
                        gateId,
                        accessKeyId: tokenValue.accessKeyId,
                        accessKeySecret: tokenValue.accessKeySecret,
                        accountKey: tokenValue.accountKey
                    });
            }
            // Dmartech
            return this.request
                .get('/newMonitor/sendoutList');
        },


        /**
         * 测试发送接口
         * @param sendList
         * @param sendoutId
         * @param materialId
         */
        testSend (sendList, sendoutId, materialId) {
            // 私有化部署
            if (PRIVATE_DEVELOPMENT) {
                let tokenValue = JSON.parse(localStorage.getItem(GET_TOKEN));
                return this.request
                    .post(LINKS.SMS_API_BASE + '/api/web-api/smsservice/v1/material/message/send')
                    .send({
                        mobileList: sendList,
                        sendoutId: sendoutId,
                        messageId: materialId,
                        accessKeyId: tokenValue.accessKeyId,
                        accessKeySecret: tokenValue.accessKeySecret,
                        accountKey: tokenValue.accountKey
                    });
            }
            // Dmartech
            return this.request
                .post('/material/message/send')
                .send({
                    mobileList: sendList,
                    sendoutId: sendoutId,
                    messageId: materialId
                });
        },


        /**
         * 彩信测试发送接口
         * @param sendList
         * @param sendoutId
         * @param materialId
         */
        mmsTestSend (sendList, sendoutId, subject, materialId) {
            // 私有化部署
            if (PRIVATE_DEVELOPMENT) {
                let tokenValue = JSON.parse(localStorage.getItem(GET_TOKEN));
                return this.request
                    .post(LINKS.SMS_API_BASE + '/api/web-api/smsservice/v1/material/message/send')
                    .send({
                        mobileList: sendList,
                        sendoutId: sendoutId,
                        subject: subject,
                        messageId: materialId,
                        accessKeyId: tokenValue.accessKeyId,
                        accessKeySecret: tokenValue.accessKeySecret,
                        accountKey: tokenValue.accountKey
                    });
            }
            // Dmartech
            return this.request
                .post('/material/message/send')
                .send({
                    mobileList: sendList,
                    sendoutId: sendoutId,
                    subject: subject,
                    messageId: materialId
                });
        },


        /**
         * v2 报告：渠道活跃时段(短信)
         * @param campaignIds
         * @param dates
         * @param startDate
         * @param endDate
         */
        getSmsHourActivity (campaignIds, { dates, startDate, endDate }) {
            // 私有化部署
            if (PRIVATE_DEVELOPMENT) {
                let tokenValue = JSON.parse(localStorage.getItem(GET_TOKEN));
                return this.request
                    .get(LINKS.SMS_API_BASE + '/api/web-api/smsservice/v1/dataReport/privatization/hourActivityTrend')
                    .query({
                        dates, startDate, endDate, campaignIds,
                        accessKeyId: tokenValue.accessKeyId,
                        accessKeySecret: tokenValue.accessKeySecret,
                        accountKey: tokenValue.accountKey
                    });
            }
            // Dmartech
            return this.request
                .get('/dataReport/journey/hourActivityTrend')
                .query({
                    dates, startDate, endDate, campaignIds
                });
        },

        /**
         * v2 最热点击落地(短信)
         * @param campaignIds
         * @param dates
         * @param startDate
         * @param endDate
         */
        getSmsHotLinks (campaignIds, { dates, startDate, endDate }) {
            // 私有化部署
            if (PRIVATE_DEVELOPMENT) {
                let tokenValue = JSON.parse(localStorage.getItem(GET_TOKEN));
                return this.request
                    .get(LINKS.SMS_API_BASE + '/api/web-api/smsservice/v1/dataReport/privatization/getHotClickList')
                    .query({
                        dates, startDate, endDate, campaignIds,
                        accessKeyId: tokenValue.accessKeyId,
                        accessKeySecret: tokenValue.accessKeySecret,
                        accountKey: tokenValue.accountKey
                    });
            }
            // Dmartech
            return this.request
                .get('/dataReport/journey/getHotClickList')
                .query({
                    dates, startDate, endDate, campaignIds
                });
        },


        /**
         * v2 报告：短信渠道活跃情况
         * @param campaignIds
         * @param dates
         * @param startDate
         * @param endDate
         */
        // getSmsActive(campaignIds, {dates, startDate, endDate}) {
        //     // 私有化部署
        //     if (PRIVATE_DEVELOPMENT) {
        //         let tokenValue = JSON.parse(localStorage.getItem(GET_TOKEN));
        //         return this.request
        //             .get(LINKS.SMS_API_BASE + '/api/web-api/smsservice/v1/dataReport/privatization/getClickCountDayByJourney')
        //             .query({
        //                 dates, startDate, endDate, campaignIds,
        //                 accessKeyId: tokenValue.accessKeyId,
        //                 accessKeySecret: tokenValue.accessKeySecret,
        //                 accountKey: tokenValue.accountKey
        //             });
        //     }
        //     // Dmartech
        //     return this.request
        //         .get('/dataReport/journey/getClickCountDayByJourney')
        //         .query({
        //             dates, startDate, endDate, campaignIds
        //         });
        // },


        /**
         * v2 报告：独立点击分布图
         * @param campaignId
         * @param type    0：中国 1：世界
         */
        getContactMap (campaignId, type) {
            // 私有化部署
            if (PRIVATE_DEVELOPMENT) {
                let tokenValue = JSON.parse(localStorage.getItem(GET_TOKEN));
                return this.request
                    .get(LINKS.SMS_API_BASE + '/api/web-api/smsservice/v1/dataReport/privatization/getDistributionCount')
                    .query({
                        campaignId,
                        type,
                        accessKeyId: tokenValue.accessKeyId,
                        accessKeySecret: tokenValue.accessKeySecret,
                        accountKey: tokenValue.accountKey
                    });
            }
            // Dmartech
            return this.request
                .get('/dataReport/journey/getDistributionCount')
                .query({
                    campaignId,
                    type
                });
        },


        /**
         * 公司
         * 活跃人数趋势
         * @param campaignIds
         * @param startDate
         * @param endDate
         * @param dates
         */
        getActivityTrend (campaignIds, { startDate, endDate, dates }) {
            // 私有化部署
            if (PRIVATE_DEVELOPMENT) {
                let tokenValue = JSON.parse(localStorage.getItem(GET_TOKEN));
                return this.request
                    .get(LINKS.SMS_API_BASE + '/api/web-api/smsservice/v1/dataReport/privatization/activityTrend')
                    .query({
                        campaignIds,
                        startDate,
                        endDate,
                        dates,
                        accessKeyId: tokenValue.accessKeyId,
                        accessKeySecret: tokenValue.accessKeySecret,
                        accountKey: tokenValue.accountKey
                    });
            }
            // Dmartech
            return this.request
                .get('/dataReport/journey/activityTrend')
                .query({
                    campaignIds,
                    startDate,
                    endDate,
                    dates
                });
        },


        /**
         * 获取单个任务统计信息
         * @param campaignId
         */
        getSMSTaskStatus (campaignId) {
            // 私有化部署
            if (PRIVATE_DEVELOPMENT) {
                let tokenValue = JSON.parse(localStorage.getItem(GET_TOKEN));
                return this.request
                    .get(LINKS.SMS_API_BASE + '/api/web-api/smsservice/v1/dataReport/privatization/sendStatistics')
                    .query({
                        campaignId,
                        accessKeyId: tokenValue.accessKeyId,
                        accessKeySecret: tokenValue.accessKeySecret,
                        accountKey: tokenValue.accountKey
                    });
            }
            // Dmartech
            return this.request
                .get('/dataReport/journey/sendStatistics')
                .query({
                    campaignId
                });
        },


        /**
         * 单个任务的手机号供应商占比
         * @param campaignId
         */
        getSuppliersProportion (campaignId) {
            // 私有化部署
            if (PRIVATE_DEVELOPMENT) {
                let tokenValue = JSON.parse(localStorage.getItem(GET_TOKEN));
                return this.request
                    .get(LINKS.SMS_API_BASE + '/api/web-api/smsservice/v1/dataReport/privatization/servicesProportion')
                    .query({
                        campaignId,
                        accessKeyId: tokenValue.accessKeyId,
                        accessKeySecret: tokenValue.accessKeySecret,
                        accountKey: tokenValue.accountKey
                    });
            }
            // Dmartech
            return this.request
                .get('/dataReport/journey/servicesProportion')
                .query({
                    campaignId
                });
        },


        /**
         * 单个任务打开短信的设备比例
         * @param campaignId
         */
        getDeviceProportion (campaignId) {
            // 私有化部署
            if (PRIVATE_DEVELOPMENT) {
                let tokenValue = JSON.parse(localStorage.getItem(GET_TOKEN));
                return this.request
                    .get(LINKS.SMS_API_BASE + '/api/web-api/smsservice/v1/dataReport/privatization/OpenProportion')
                    .query({
                        campaignId,
                        accessKeyId: tokenValue.accessKeyId,
                        accessKeySecret: tokenValue.accessKeySecret,
                        accountKey: tokenValue.accountKey
                    });
            }
            // Dmartech
            return this.request
                .get('/dataReport/journey/OpenProportion')
                .query({
                    campaignId
                });
        },


        /**
         * 短链独立点击top5
         * @param campaignId
         */
        getTop5Links (campaignId) {
            // 私有化部署
            if (PRIVATE_DEVELOPMENT) {
                let tokenValue = JSON.parse(localStorage.getItem(GET_TOKEN));
                return this.request
                    .get(LINKS.SMS_API_BASE + '/api/web-api/smsservice/v1/dataReport/privatization/linkClick')
                    .query({
                        campaignId,
                        accessKeyId: tokenValue.accessKeyId,
                        accessKeySecret: tokenValue.accessKeySecret,
                        accountKey: tokenValue.accountKey
                    });
            }
            // Dmartech
            return this.request
                .get('/dataReport/journey/linkClick')
                .query({
                    campaignId
                });
        },


        /**
         * 获取单个任务的记录信息
         * @param campaignId
         * @param pageNumber
         */
        getTaskRecords (campaignId, pageNumber) {
            // 私有化部署
            if (PRIVATE_DEVELOPMENT) {
                let tokenValue = JSON.parse(localStorage.getItem(GET_TOKEN));
                return this.request
                    .get(LINKS.SMS_API_BASE + '/api/web-api/smsservice/v1/dataReport/journey/showInfo')
                    .query({
                        campaignId,
                        pageNumber,
                        accessKeyId: tokenValue.accessKeyId,
                        accessKeySecret: tokenValue.accessKeySecret,
                        accountKey: tokenValue.accountKey
                    });
            }
            // Dmartech
            return this.request
                .get('/dataReport/journey/showInfo')
                .query({
                    campaignId,
                    pageNumber
                });

        },


        /**
         * 导出单个任务的记录数据
         * @param campaignId
         * @param email
         * @param searchIds
         */
        exportTaskRecords (campaignId, email, searchIds) {
            // 私有化部署
            if (PRIVATE_DEVELOPMENT) {
                let tokenValue = JSON.parse(localStorage.getItem(GET_TOKEN));
                return this.request
                    .get(LINKS.SMS_API_BASE + '/api/web-api/smsservice/v1/dataReport/journey/download')
                    .query({
                        campaignId,
                        email,
                        searchIds,
                        accessKeyId: tokenValue.accessKeyId,
                        accessKeySecret: tokenValue.accessKeySecret,
                        accountKey: tokenValue.accountKey
                    });
            }
            // Dmartech
            return this.request
                .get('/dataReport/journey/download')
                .query({
                    campaignId,
                    email,
                    searchIds,
                });
        },


        /**
         * v2 报告：短信任务未送达原因
         * @param campaignId
         */
        getFailedReason (campaignId) {
            // 私有化部署
            if (PRIVATE_DEVELOPMENT) {
                let tokenValue = JSON.parse(localStorage.getItem(GET_TOKEN));
                return this.request
                    .get(LINKS.SMS_API_BASE + '/api/web-api/smsservice/v1/dataReport/privatization/getUndeliveredReason')
                    .query({
                        campaignId,
                        accessKeyId: tokenValue.accessKeyId,
                        accessKeySecret: tokenValue.accessKeySecret,
                        accountKey: tokenValue.accountKey
                    });
            }
            // Dmartech
            return this.request
                .get('/dataReport/journey/getUndeliveredReason')
                .query({ campaignId });
        },
        /**
         * 全局任务,获取列表
         * @return {*}
         */
        getSendoutList (isMms, searchKeyword, creatorId) {
            return this.request
                .get('/newMonitor/sendoutListByCidKeyWord')
                .query({
                    isMms,
                    searchKeyword,
                    creatorId
                });
        },

        /**
         * 根据Sendoutid获取所有campaign
         * @param query
         * creatorId: 用户id
         * pageNumber: 分页页码
         * searchKeyword?: 关键词
         * sendOutId?: 发送号id
         * @return {*}
         */
        getSmscampaignsBySendoutAndUser (query) {
            return this.request
                .get('/newMonitor/getSmscampaignsBySendoutAndUser')
                .query(query);
        },

        /**
         * 获取数据报表
         * @param query
         * campaignId: 活动Id
         * messageType: 短信/彩信
         * pageNo: 页码号
         * sendoutId: sendoutId
         * systemType: 系统类别
         */
        getDataReport (query) {
            return this.request
                .get('/dataReport/sms/list')
                .query(query);
        },

        getDataReportCopy (query) {
            // 私有化部署
            if (PRIVATE_DEVELOPMENT) {
                let tokenValue = JSON.parse(localStorage.getItem(GET_TOKEN));
                return this.request
                    .get(LINKS.SMS_API_BASE + '/api/web-api/smsservice/v1/dataReport/privatization/batchList')
                    .query(query)
                    .query({
                        accessKeyId: tokenValue.accessKeyId,
                        accessKeySecret: tokenValue.accessKeySecret,
                        accountKey: tokenValue.accountKey
                    });
            }
            // Dmartech
            return this.request
                .get('/dataReport/sms/batchList')
                .query(query);
        },

        
        /**
        * --- END migrated from outdated src/journey/smsService.js ---
        */
        
    }
});