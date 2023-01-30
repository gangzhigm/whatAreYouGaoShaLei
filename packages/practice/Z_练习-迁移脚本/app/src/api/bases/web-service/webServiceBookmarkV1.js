import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.WEB_SERVICE_API_BASE + '/api/bookmark/v1',

    api: {
        /**
         *  --- START migrated from outdated src/analysis/bookmark/bookmarkModel.js ---
         */

        /**
         * 书签列表
         * @param type 书签类型 0: 属性分析; 1: 事件分析; 2: 漏斗分析; 3: 可视化报告 不传值则返回全部列表
         */
        getBookmarks (type = '') {
            return this.request
                .get('/bookmark')
                .query({ type });
        },


        /**
         * 新增书签
         * @param bookmark
         */
        createBookmark (bookmark) {
            return this.request
                .post('/bookmark')
                .send(bookmark);
        },


        /**
         * 更新书签
         */
        updateBookmark (bookmark) {
            return this.request
                .put(`/bookmark/${bookmark.id}`)
                .send(bookmark);

        },


        /**
         * 书签详情
         * @param id
         */
        bookmarkDetail (id) {
            return this.request
                .get(`/bookmark/${id}`);
        },


        /**
         * 删除书签
         * @param id
         */
        deleteBookmark (id) {
            return this.request
                .delete(`/bookmark/${id}`);
        }

        /**
         *  --- END migrated from outdated src/analysis/bookmark/bookmarkModel.js ---
         */
    }
});
