import Model from 'web-model';
import LINKS from '@/LINKS';


export default new Model({
    base: LINKS.WEB_SERVICE_API_BASE + '/api/attribute/v1',
    api: {

        /**
         * 属性列表
         * @param attrType 0用户属性 2事件属性
         * @param isFilter
         * @param isResult
         */
        getAttributes ({ attrType, isFilter, isResult, isDataAnalysis }) {
            return this.request
                .get('/attribute')
                .query({ attrType, isFilter, isResult, isDataAnalysis });
        },

        /**
         * 属性列表
         * @param attrType 0用户属性 2事件属性
         * @param isFilter
         * @param isResult
         */
        getAttributesAuth ({ attrType, isFilter, isResult, isDataAnalysis}) {
            return this.request
                .get('/attribute/authorized')
                .query({ attrType, isFilter, isResult, isDataAnalysis});
        },

        /**
         * 可选属性
         * @param objective
         */
        getOptional (objective) {
            return this.request
                .get('/optional')
                .query(objective);
        },


        /**
         * 增加事件属性
         * @param attrObj
         * @returns {Request}
         */
        createEventAttr ({ attrGenre, attrLength, attrType, cid, empty, filter, isPk,
            meaning, name, nameEn, result, sole, defaultValue, syncDmd }) {
            return this.request
                .post(`/attribute`)
                .send({
                    attrGenre, attrLength, attrType, cid, empty, filter, isPk,
                    meaning, name, nameEn, result, sole, defaultValue, syncDmd
                });
        },


        /**
         * 编辑事件属性
         * @param id
         * @param attrGenre
         * @param attrLength
         * @param attrType
         * @param cid
         * @param empty
         * @param filter
         * @param isPk
         * @param result
         * @param meaning
         * @param name
         * @param sole
         * @param defaultValue
         */
        editEventAttr ({ id, attrGenre, attrLength, attrType, cid, empty, filter,
            isPk, result, meaning, name, nameEn, sole, defaultValue, syncDmd, checkFormPrimaryKey }) {
            return this.request
                .put(`/attribute/${id}`)
                .send({
                    attrGenre, attrLength, attrType, cid, empty, filter, isPk,
                    result, meaning, name, nameEn, sole, defaultValue, syncDmd, checkFormPrimaryKey
                });
        },


        /**
         * 置顶事件属性
         * @param id
         */
        topEventAttr ({ id, top }) {
            return this.request
                .post(`/attribute/top`)
                .query({
                    id, top
                });
        },

        /**
         * 删除事件属性
         * @param id
         */
        deleteEventAttr (id) {
            return this.request
                .del(`/attribute/${id}`);
        },


        /**
         * 拖拽排序
         * @param ids
         */
        attributesSort (ids) {
            return this.request
                .post(`/attribute/sort`)
                .query({ ids });
        },


        /**
         * 获取提示值列表
         * @param query
         */
        getValueList (query) {
            return this.request
                .get(`/values/${query.attrId}`)
                .singleton()
                .query(query);
        },
    }
});

// export const newAttribute = new Model({
//     base: LINKS.WEB_SERVICE_API_BASE + '/api/attribute/v1/',
//     api: {
//         /**
//          * 属性列表
//          * @param attrType 0用户属性 2事件属性
//          * @param isFilter
//          * @param isResult
//          */
//         getAttributes ({ attrType, isFilter, isResult }) {
//             return this.request
//                 .get('attribute/authorized')
//                 .query({ attrType, isFilter, isResult });
//         },
//     }
// });
