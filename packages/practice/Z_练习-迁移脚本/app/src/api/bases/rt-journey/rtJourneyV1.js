import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.REAL_TIME_JOURNEY_API_BASE + '/api/rtJourney/v1',
    api: {
        
        /**
         * 旅程控件 统计信息
         * @param controllerId
         * @param journeyInstantiationId
         * @param taskInstantiationId 后台让加这个字段，即使有的控件根本不是发送任务，也要传这个字段，因为是long类型接收的，所以传个0
         * @param controllerType
         * @return {*}
         */
        controllerCount({controllerId, journeyInstantiationId, taskInstantiationId = 0, controllerType}) {
            return this.request
                .get('/getControllerCount')
                .query({
                    controllerId, journeyInstantiationId, taskInstantiationId, controllerType
                });
        },
        
        // 此处是实例id
        milestoneCount({controllers, journeyId}) {
            return this.request
                .post('/getLandmarkCount')
                .send({controllers, journeyId});
        },

        /**
         * 发送结果
         * @param journeyId
         * @param endTime
         * @param startTime
         * @returns {*}
         */
        sendResultSummary({journeyId, endTime, startTime}) {
            return this.request
                .get('/getSendGeneralSituation')
                .query({journeyId, endTime, startTime});
        },
    
    
        /**
         * 查看一个控件的用户明细记录
         * @param content
         * @param controllerId
         * @param controllerName
         * @param journeyInstantiationId
         * @param pageNo
         * @return {*}
         */
        getUsersLogOfController({content, controllerId, controllerName, journeyInstantiationId, pageNo}) {
            return this.request
                .get('/controllerInfo')
                .query({content, controllerId, controllerName, journeyInstantiationId, pageNo});
        },
        
    }
});
