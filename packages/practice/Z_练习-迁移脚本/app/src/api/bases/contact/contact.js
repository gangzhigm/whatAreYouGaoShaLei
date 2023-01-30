import Model from 'web-model';
import LINKS from '@/LINKS';


export default new Model({
    base: LINKS.CONTACT_API_BASE + '/api/',
    api: {
        /**
         * 自定义事件 - 列表
         */
        getContactEvnentsCustom () {
            return this.request
                .get(`contactEvnentsCustom`);
        },

        /**
         * 查询事件分组
         */
        getEventGroupList() {
            return this.request
                .get('/contactEvnentsGroups');
            
        },

        /**
         * 查询事件分组下的事件
         * @param groupId   事件分组ID
         */
        getEventList(groupId) {
            return this.request
                .get(`/contactEvnents/${groupId}`);
        },

        /**
         * 查询事件下的属性
         * @param eventId   事件ID
         */
        getEventAttr(eventId) {
            return this.request
                .get(`/contactEvnentsField/${eventId}`);
        },

        /**
         * 获取表单字段列表
         *
         *
         */
        getFormFields(eventId, formId) {
            return this.request
                .get(`/getFormFields/${eventId}/${formId}`);
        },

        /**
         *  获取用户属性
         */
        getFieldListByType() {
            return this.request
                .get('contact/v1/customerField/getFieldListByType');
        }
    }
});