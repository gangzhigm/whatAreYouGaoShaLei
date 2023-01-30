import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.JOURNEY_MATERIAL_API_BASE + '/api/material/v3/',
    api: {

        /**
         * 修改分组名称
         * @param groupId
         * @param name
         * @return {*}
         */
        modifyGroupName({
            groupId,
            name,
            parentId
        }) {
            return this.request
                .put('group/' + groupId)
                .send({
                    name,
                    parentId
                });
        },


        /**
         * 获取分组列表
         * @return {*}
         */
        getGroupList() {
            return this.request
                .get('group');
        },

        /**
         * 更改为公用样式tree-menu 获取分组列表
         * sortType:分组排序
         */
        getTreeGroupList({
            sortType
        }) {
            return this.request
                .get('groupTree')
                .query({
                    sortType
                });
        },


        /**
         * 删除分组
         * @param groupId
         * @return {*}
         */
        deleteGroup({
            groupId
        }) {
            return this.request
                .delete('group/' + groupId);
        },


        /**
         * 创建素材分组
         * @param name
         * @return {*}
         */
        createGroup({
            name,
            parentId
        }) {
            return this.request
                .post('group/')
                .send({
                    name,
                    parentId
                });
        },


        /**
         * 移动分组
         * @param groupId
         * @param materialIds 根据全选状态进行传递，全选时传递去除的素材id，没有全选传单独勾选的素材id
         * @param status 全选（0：NO，1：YES）
         * @param type 0：移进，1：移出
         * @param {number} operType 1.单个 2.批量
         * @return {*}
         */
        moveGroup({
            groupId,
            materialIds,
            status,
            type,
            operType
        }) {
            return this.request
                .post('group/' + groupId)
                .send({
                    materialIds,
                    status,
                    type,
                    operType
                });
        }

    }
});

