import Model from 'web-model';
import LINKS from '@/LINKS';


export default new Model({
    base: LINKS.WEB_SERVICE_API_BASE + '/api/event/v1',
    api: {
        
        /**
         * 元事件 - 列表
         * @param name
         */
        getMetaEventList(name) {
            return this.request
                .get(`/event`)
                .query({name});
        },

        /**
         * 可选择事件 - 列表
         * @param groupId
         */
        getCanSelectEventList(groupId) {
            return this.request
                .get(`/event/canSelect`)
                .query({groupId});
        },
        
        
        /**
         * 元事件 - 详情
         * @param id
         */
        getMetaEventDetail(id) {
            return this.request
                .get(`/event/${id}`);
        },
        
        
        /**
         * 元事件 - 新增
         * @param attributes
         * @param cid  //后期是需要删掉的
         * @param isShow
         * @param meaning
         * @param labels
         * @param name
         * @param weight
         * @param timeAttrId
         */
        createMetaEvent({attributes, cid, isShow, meaning, labels, name, weight, timeAttrId, nameEn}) {
            return this.request
                .post(`/event`)
                .send({attributes, cid, isShow, meaning, labels, name, weight, timeAttrId, nameEn});
        },
        
        
        /**
         * 元事件 - 编辑
         * @param id
         * @param attributes
         * @param cid
         * @param isShow
         * @param labels
         * @param meaning
         * @param name
         * @param weight
         */
        editMetaEvent({id, attributes, cid, isShow, labels, meaning, name, weight, nameEn}) {
            return this.request
                .put(`/event/${id}`)
                .send({attributes, cid, isShow, labels, meaning, name, weight, nameEn});
        },
        
        
        /**
         * 元事件 - 删除
         * @param id
         */
        deleteMetaEvent(id) {
            return this.request
                .delete(`/event/${id}`);
        },
        
        
        /**
         * 事件列表
         * @param cid
         * @param name
         */
        getEventList (cid, name, isDataAnalysis) {
            return this.request
                .get(`/event/backstage`)
                .query({
                    cid, name, isDataAnalysis
                });
        }
        
    }
});
