/**
 * 分值评估模型
 */

import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.WEB_SERVICE_API_BASE + '/api/grade/v1',
    api: {

        /**
         * 得到分值定义列表
         * @param targets 1, 2 主体(0:用户, 1:物品, 2:事件)
         * @param name 搜索名称
         */
        getScoreDefList({targets,name}) {
            return this.request
                .get(`/grade`)
                .query({
                    targets,
                    name
                });
        },


        /**
         * 分值定义 新增
         * @param name
         * @param targets
         * @param labels
         * @param desc
         * @param groups
         */
        createScoreDefinition({name, targets, labels, desc, groups}) {
            return this.request
                .post(`/grade`)
                .send({name, targets, labels, desc, groups});
        },


        /**
         * 分值定义 编辑
         * @param id
         * @param name
         * @param targets
         * @param labels
         * @param desc
         * @param groups
         */
        updateScoreDefinition({id, name, targets, labels, desc, groups}) {
            return this.request
                .put(`/grade/${id}`)
                .send({id, name, targets, labels, desc, groups});

        },


        /**
         *  删除之前需要调用一下分值关联的计算
         * @param id
         */
        deleteSdRelation(id) {
            return this.request
                .get(`/relation/grade/${id}`);
        },


        /**
         * 分值定义 删除
         * @param id
         */
        deleteScoreDefinition(id) {
            return this.request
                .delete(`/grade/${id}`);
        },


        /**
         * 分值定义 详情
         * @param id
         */
        getScoreDefinition(id) {
            return this.request
                .get(`/grade/${id}`);
        },


        /**
         * 打分模型 列表
         * @param name   搜索项
         */
        getComputDefList({name}) {
            return this.request
                .get(`/calculate`)
                .query({
                    name
                });
        },


        /**
         *  删除之前需要调用一下评估关联
         * @param id
         */
        deleteComputDefRelation(id) {
            return this.request
                .get(`/relation/calculate/${id}`);
        },


        /**
         * 计算定义 删除
         * @param id
         */
        delComputDef(id) {
            return this.request
                .del(`/calculate/${id}`);
        },


        /**
         * 计算定义 新增
         * @param name
         * @param labels
         * @param targets
         * @param grades
         * @param desc
         */
        createComputDef({name, labels, targets, grades, desc}) {
            return this.request
                .post('/calculate')
                .send({
                    name, labels, targets, grades, desc
                });
        },


        /**
         * 计算定义 编辑
         * @param id
         * @param name
         * @param labels
         * @param targets
         * @param grades
         * @param desc
         */
        updateComputDef({id, name, labels, targets, grades, desc}) {
            return this.request
                .put(`/calculate/${id}`)
                .send({
                    name, labels, targets, grades, desc
                });
        },


        /**
         * 计算定义 详情
         * @param id
         */
        getComputDefinition(id) {
            return this.request
                .get(`/calculate/${id}`);
        },


        /**
         * 分值评估 列表
         * @param targets
         * @param name
         */
        getScoreEvalList(params) {
            const query = params ? params : {targets: '', name: ''};
            return this.request
                .get(`/evaluate`)
                .query(query);
        },


        /**
         * 分值项关联的计算
         * @param id
         */
        relationScoreDef(id) {
            return this.request
                .get(`/relation/gradeItem/${id}`);
        },


        /**
         * 删除分值定义的分值项
         * @param id
         */
        deleteScoreItem(id) {
            return this.request
                .delete(`/gradeItem/${id}`);
        },


        /**
         * 新增评估定义
         * @param sendObj
         * @returns {Request|*}
         */
        createEvaluationDefinition(sendObj) {
            return this.request
                .post(`/evaluate`)
                .send(sendObj);
        },


        /**
         * 评估定义 编辑
         * @param sendObj
         */
        updateEvaluationDefinition(sendObj) {
            return this.request
                .put(`/evaluate/${sendObj.id}`)
                .send(sendObj);
        },


        /**
         * 评估定义 删除之前查看关联
         * @param id
         */
        deleteEDRelation(id) {
            return this.request
                .get(`/relation/evaluate/${id}`);
        },


        /**
         * 评估定义 删除
         * @param id
         */
        deleteEvaluationDefinition(id) {
            return this.request
                .delete(`/evaluate/${id}`);
        },


        /**
         * 评估定义 详情
         * @param id
         */
        getEvaluationDefinition(id) {
            return this.request
                .get(`/evaluate/${id}`);
        },


        /**
         * 评估定义 全局计算
         * @param id
         */
        globalCompute(id) {
            return this.request
                .put(`/full/${id}`);
        },

        /**
         * 打分因子 关联模型
         * @param id
         * @param type
         */
        getGradeModel(id,type) {
            return this.request
                .get(`/getGradeModel/${id}/${type}`);
        },


        /**
         * 评级报告
         * @param id
         */
        getGradeReport(id) {
            return this.request
                .get(`/getGradeReport/${id}`);
        },
    }
});
