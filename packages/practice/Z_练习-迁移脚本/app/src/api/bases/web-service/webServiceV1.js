import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.WEB_SERVICE_API_BASE + '/api/v1',
    api: {
        /**
         *  --- START migrated from outdated src/analysis/board/boardService.js ---
         */

        /**
         * 看板 - 列表
         * @param type 0:全部,1:我的,2:分享给我的
         * 数据看板的排序：
         * @param order
         * updateTime:按更新时间由近及远
         * updateTimeReverse:按更新时间由远及近
         * createTime:按创建时间由远及近
         * createTimeReverse:按创建时间由远及近
         */
        getBoards (type = 0, order) {
            return this.request
                .get('/board')
                .query({
                    type,
                    order
                });
        },


        /**
         * 看板详情
         * @param {Number} id
         */
        getBoard (id) {
            return this.request
                .get('/board/' + id);
        },


        /**
         * 看板 - 创建
         * @param name
         * @return {*}
         */
        create (name) {
            return this.request
                .post('/board')
                .send({
                    name
                });
        },


        /**
         * 看板 - 删除
         * @param id
         * @return {*}
         */
        deleteBoard (id) {
            return this.request
                .del('/board/' + id);
        },


        /**
         * 看板 - 更新
         * @param board
         * @return {*}
         */
        update (board) {
            return this.request
                .put('/board/' + board.id)
                .send(board);
        },


        /**
         * 看板 - 分享
         * @param boardId
         * @param user
         * @param send
         * @param content
         * @return {*}
         */
        share (boardId, {
            user,
            send,
            content
        }) {
            return this.request
                .post('/board/share')
                .send({
                    boardId,
                    user,
                    send,
                    content
                });

        },


        /**
         * 看板已经分享给的人 - 列表
         * @param boardId
         * @return {*}
         */
        getSharedUsers (boardId) {
            return this.request
                .get('/board/shareUsers/' + boardId);
        },


        /**
         * 看板 - 取消分享
         * @param boardId
         * @param uid
         */
        cancelShare (boardId, uid) {
            return this.request
                .delete('/board/share')
                .send({
                    boardId,
                    uid
                });
        },


        /**
         * 看板内图表分组 - 列表
         * @param boardId
         * @return {*}
         */
        getChartGroups (boardId) {
            return this.request
                .get('/board/group')
                .query({
                    boardId
                });
        },


        /**
         * 看板内图表分组 - 排序
         * @param boardId
         * @param ids
         * @return {*}
         */
        updateGroupOrder (boardId, ids) {
            return this.request
                .put('/board/order/group')
                .send({
                    boardId,
                    ids
                });
        },


        /**
         * 看板内图表分组 - 新增
         * @param boardId
         * @param name
         * @param desc
         * @return {*}
         */
        createChartGroup (boardId, name, desc) {
            return this.request
                .post('/board/group')
                .send({
                    boardId,
                    name,
                    desc
                });
        },


        /**
         * 看板内图表分组 - 更新
         * @param id
         * @param name
         * @param desc
         * @return {*}
         */
        updateChartGroup (id, name, desc) {
            return this.request
                .put('/board/group/' + id)
                .send({
                    name,
                    desc
                });
        },


        /**
         * 看板内图表分组 - 删除
         * @param id
         * @return {*}
         */
        removeChartGroup (id) {
            return this.request
                .del('/board/group/' + id);
        },


        /**
         * 看板内图表分组内的图表 - 添加
         * @param bookmarkId
         * @param groupId
         * @param config
         * @return {*}
         */
        addChart (bookmarkId, groupId, config) {
            return this.request
                .post('/board/show')
                .send({
                    bookmarkId,
                    groupId,
                    config
                });
        },


        /**
         * 看板内图表分组内的图表 - 排序
         * @param groupId
         * @param chartIds
         * @return {*}
         */
        updateChartOrder (groupId, chartIds) {
            return this.request
                .put('/board/order/show')
                .send({
                    groupId,
                    ids: chartIds
                });
        },


        /**
         * 看板内图表分组内的图表 - 删除
         * @param id
         * @return {*}
         */
        removeChart (id) {
            return this.request
                .del('/board/show/' + id);
        },


        /**
         * 看板内图表分组内的图表 - 更新
         * @param bookmarkId
         * @param groupId
         * @param config
         * @param id
         * @return {*}
         */
        updateChart (bookmarkId, groupId, config, id) {
            return this.request
                .put('/board/show/' + id)
                .send({
                    bookmarkId,
                    groupId,
                    config
                });
        }
        /**
         *  --- END migrated from outdated src/analysis/board/boardService.js ---
         */
    }
});