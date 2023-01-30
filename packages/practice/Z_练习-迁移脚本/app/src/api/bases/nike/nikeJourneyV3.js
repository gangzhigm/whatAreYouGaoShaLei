import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.NIKE_API_BASE + '/api/journey/v3',
    api: {

        /**
         * 获取批次任务详情信息
         * @param journeyId
         * @param controllerId
         */
        getBatchTask(journeyId,controllerId,click) {
            return this.request
                .get('/batchTask')
                .query(
                    {
                        journeyId,controllerId,click
                    }
                );
        },
        
        /**
         * 修改批次任务
         * @param controllerId
         * @param excerpta
         * @param journeyId
         * @param materialId
         * @param prepositionTaskId
         * @param sameSubject
         * @param sendAddress
         * @param sendBehavior
         * @param sendName
         * @param sendOutId
         * @param senderId
         * @param taskName
         * @param tasks
         */
        modifyBatchTask(
            controllerId,
            excerpta,
            journeyId,
            materialId,
            prepositionTaskId,
            sameSubject,
            sendAddress,
            sendBehavior,
            sendName,
            sendOutId,
            senderId,
            taskName,
            tasks) {
            return this.request
                .put('/batchTask')
                .send(
                    {
                        controllerId,
                        excerpta,
                        journeyId,
                        materialId,
                        prepositionTaskId,
                        sameSubject,
                        sendAddress,
                        sendBehavior,
                        sendName,
                        sendOutId,
                        senderId,
                        taskName,
                        tasks
                    }
                );
        },

        /**
         * 生成批次任务
         * @param journeyId
         * @param controllerId
         * @param materialId
         * @param sendAddress
         * @param sendName
         * @param senderId
         * @param taskName
         * @param taskType
         */
        selBatchTask(
            journeyId,
            controllerId,
            materialId,
            sendAddress,
            sendName,
            senderId,
            taskName,
            taskType) {
            return this.request
                .post(`/journey/${journeyId}/batchTask`)
                .send(
                    {
                        controllerId,
                        materialId,
                        sendAddress,
                        sendName,
                        senderId,
                        taskName,
                        taskType  
                    }  
                );
        },
        
        /**
         * 删除某个批次任务控件
         * @param journeyId
         * @param controllerId
         */
        delBatchTask(journeyId,controllerId) {
            return this.request
                .delete(`/batchTask/${journeyId}/${controllerId}`);
        },

        /**
         * 批次邮件-导出邮件批次
         * @param {string} sendAddress 导出的邮箱地址
         * @param {array<object>} taskDetailsDTOS 批次信息（id: 批次序号；mailSubject：邮件主题；taskDate：任务时间；taskName: 批次名称）
         */
        exportEmailBatch(sendAddress, taskDetailsDTOS) {
            return this.request
                .post(`/batchTask/email/export`)
                .send({
                    sendAddress,
                    taskDetailsDTOS
                });
        }
    }
});
