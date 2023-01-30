import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.JOURNEY_API_BASE + '/api/journey/v2',
    api: {

        /**
        *
        --- START migrated from outdated src/data/report/journey/model/emailReportService.js ---
        */

        /**
         * 获取分组列表
         * @param searchName {string} 搜索的关键字
         * @param sort {number} 排序规则
         */
        getGroupList (searchName, sort) {
            return this.request
                .get(`/getNikeGroup`)
                .query({ searchName, sort });
        },
        /**
         * 创建分组
         * @param {string} groupName 分组名
         */
        createGroup (groupName) {
            return this.request
                .post(`/createGroup?groupName=${groupName}`);
        },
        /**
         * 删除分组
         * @param {number} id 分组id
         */
        delGroup (id) {
            return this.request
                .delete(`/delNikeGroup/${id}`);
        },
        /**
         * 更新分组名称
         * @param {number} id 当前分组的id
         * @param {string} name 新名称
         */
        updateGroup (id, name) {
            return this.request
                .put(`/renameNikeGroup`)
                .send({ id, name });
        },
        /**
         * 导入标签
         * @param {object} file 导入的文件
         */
        importLabels (file) {
            return this.request
                .post(`/ImportLabel`)
                .attach('file', file);
        },
        /**
         * 获取分组详细信息
         * @param {number} id 分组id
         */
        groupMsg (id) {
            return this.request
                .get(`/nikeRules/${id}`);
        },
        /**
         * 查询标签列表（一级查二级， 二级查三级）
         * @param {string} lv1Name 一级标签名
         * @param {string} lv2Name 二级标签名
         * @param {string} lv3Name 三级标签名或关键字
         * @param {string} type 查询类型
         */
        getLabelName (lv1Name, lv2Name, lv3Name, type) {
            return this.request
                .get(`/nikeLabels`)
                .query({ lv1Name, lv2Name, lv3Name, type });
        },
        /**
         * 保存筛选条件
         * @param {string} groupName 分组名
         * @param {array<object>} label 标签数据
         * @param {object} pushCount 推送数量
         */
        saveGroupData (countRules, labelRules, id) {
            return this.request
                .put(`/updateNikeRules/${id}`)
                .send({ countRules, labelRules });
        },
        /**
         *
         * @param {array<number>} groupIds 分组id的列表（如果只选中一个分组，数组中就只有一项）
         * @param {number} type 获取的数据类型（0：总数据， 1：标签数据）
         */
        getTableData (groupIds, type) {
            return this.request
                .get(`/getGroupData`)
                .query({ groupIds, type });
        },
        /**
         * 导出分组数据
         * @param {string} email
         * @param {array<number>} groupIds
         * @param {string} label2
         * @param {string} label3
         * @param {string} uniCode
         */
        exportData (email, groupIds, label2, label3, uniCode) {
            return this.request
                .get(`/exportGroupData`)
                .query({ email, groupIds, label2, label3, uniCode });
        },
        /**
         * 获取标签列表，cpCode,url列表数据
         * @param {number} pageNumber
         * @param {number} pageSize
         * @param {string} seachKey
         * @param {string} seachType
         * @param {string} type
         */
        getTableDetailsList (pageNumber, pageSize, seachKey, seachType, type) {
            return this.request
                .get('/nikeDataList')
                .query({ pageNumber, pageSize, seachKey, seachType, type });
        },


        /**
        *
        --- END migrated from outdated src/data/report/journey/model/emailReportService.js ---
        */


        /**
        *
        --- START migrated from outdated src/data/report/journey/model/journeyReportService.js ---
        */

        /**
         * v2 旅程检索
         * @param dates
         * @param startDate
         * @param endDate
         * @param journeyTemplateIds
         * @param pageNumber
         * @param search
         * @param taskType  *字段值需放在参数最后* 2021-10-14 2.5.15版本增加
         *                  0:邮件 1:短信 2:微信 3:彩信 4:线索传递(华为订制) 6：nike批次邮件 5:添加会员标签
         *                  9:移除会员标签 7:添加粉丝标签 8:移除粉丝标签 10.企业微信。
         *                  此字段存在数据，则只会返回存在对应任务的旅程列表。
         */
        getJourneys (dates, endDate, journeyTemplateIds, pageNumber, search, startDate, taskType) {
            return this.request
                .get('/journeyReport')
                .query({ dates, endDate, journeyTemplateIds, pageNumber, search, startDate, taskType });
        },
        /**
         * v2 任务检索
         * @param dates
         * @param startDate
         * @param endDate
         * @param journeyTemplateIds
         * @param pageNumber
         * @param search
         * @param type // 0:邮件,1:短信,2:微信
         * @param taskInstantiationId
         */
        getTasks (dates, endDate, journeyTemplateIds, pageNumber, search, startDate, type, taskInstantiationId, size) {
            return this.request
                .get('/taskReport')
                .query({
                    dates,
                    endDate,
                    journeyTemplateIds,
                    pageNumber,
                    search,
                    startDate,
                    type,
                    taskInstantiationId,
                    size
                });
        },

        /**
         * 下载nike邮件报告
         */
        downloadNikeReport (email, journeyTemplateIds, uniCode) {
            return this.request
                .get('/nikeReport')
                .query({
                    email, journeyTemplateIds, uniCode
                });
        },
    }
});
