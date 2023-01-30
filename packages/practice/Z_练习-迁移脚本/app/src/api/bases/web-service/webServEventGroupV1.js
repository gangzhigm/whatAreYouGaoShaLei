import Model from 'web-model';
import LINKS from '@/LINKS';


export default new Model({
    base: LINKS.WEB_SERVICE_API_BASE + '/api/event_group/v1',
    api: {
        
        /**
         * 事件分组 - 列表
         * @param name
         */
        getEventGroupList(name) {
            return this.request
                .get(`/event_group`)
                .query({name});
        },
        
        
        /**
         * 事件分组 - 详情
         * @param id
         */
        getEventGroupDetail(id) {
            return this.request
                .get(`/event_group/${id}`);
        },
        
        
        /**
         * 事件分组 - 新增
         * @param events
         * @param isShow
         * @param name
         * @param meaning
         */
        createEventGroup({events, isShow, name, meaning, nameEn}) {
            return this.request
                .post(`/event_group`)
                .send({events, isShow, name, meaning, nameEn});
        },
        
        
        /**
         * 事件分组 - 编辑
         * @param id
         * @param events
         * @param isShow
         * @param name
         * @param meaning
         */
        editEventGroup({id, events, isShow, name, meaning, nameEn}) {
            return this.request
                .put(`/event_group/${id}`)
                .send({id, events, isShow, name, meaning, nameEn});
        },
        
        
        /**
         * 事件分组 - 删除
         * @param id
         */
        deleteEventGroup(id) {
            return this.request
                .delete(`/event_group/${id}`);
        },
        
        
        /**
         * 事件列表
         * @param cid
         * @param name
         */
        getEventList(cid, name) {
            return this.request
                .get(`/event_group/backstage`)
                .query({
                    cid, name
                });
        }
        
    }
});
