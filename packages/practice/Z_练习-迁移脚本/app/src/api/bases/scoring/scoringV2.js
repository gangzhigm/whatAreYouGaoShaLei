import Model from 'web-model';
import LINKS from '@/LINKS';


export default new Model({
    base: LINKS.SCORING_API_BASE + '/api/scorerating/v2/',
    api: {
        /***** 已建模型列表-start *****/
        
        /**
         * 获取模型列表
         * @param {*searchName} 模型名称
         * @param {*pageNumber} 当前选中的页码
         * @param {*size} 每页展示数量
         * @param {*status} 状态0停用 1启用2草稿
         * @returns
         */
        getScoringModelList ({ searchName, pageNumber, size, status }) {
            return this.request
                .get('model/list')
                .query({ searchName, pageNumber, size, status });
        },

        /**
         * 新建模型
         * @param {scoringRange} 0 全部联系人，,其他数值： 新建联系人
         * @param {modelName} 模型名称
         * @param {type} 模型类型：0：普通评分、1：用户评分矩阵模型     新增默认都是1
         * @param {mode} 模式：1：便捷模式、2：专家模式
         * @returns
         */
        addScoringModel ({ scoringRange, modelName, type = 1, mode }) {
            return this.request
                .post('model')
                .send({ scoringRange, modelName, type, mode });
        },

        /**
         * 启动/停用模型
         * @param {*} modelId 模型ID
         * @param {*} status 启用:1 停用:0
         * @returns
         */
        activeScoringModel ({ modelId, status }) {
            return this.request
                .post('model/status')
                .send({ modelId, status });
        },

        /**
         * 复制模型
         * @param {*} modelId  模型ID
         * @returns
         */
        copyScoringModel ({ modelId }) {
            return this.request
                .post('model/copy')
                .query({ modelId });
        },

        /**
        * 删除模型
        * @param {*} modelId 模型ID
        * @returns
        */
        delScoringModel (modelId) {
            return this.request
                .del('model')
                .query(modelId);
        },
        /***** 已建模型列表-end *****/


        /***** 便捷模式-start *****/
        /**
        * 新建评分因子（便捷模式）
        * @param {*} list 因子列表
        * @returns
        */
        saveScoringFactorSimple(list) {
            return this.request
                .post('saveScoringFactor/simple')
                .send(list);
        },
        /***** 便捷模式-end *****/


        /***** 专家模式-start *****/
        
        /**
         * 等级查询
         * @param modelId
         */
        getGrades(modelId) {
            return this.request
                .get('model/grades')
                .query({modelId});
        },

        /**
         * 获取模版详情
         * @param modelId
         */
        getModelInfo(modelId) {
            return this.request
                .get('model')
                .query({modelId});
        },

        /**
         * 获取因子列表
         * @param scoringModelId
         * @param type 评分因子类型。0:属性因子; 1:事件因子; （不传或其他，则默认返回所有类型 ）
         * @param keyword
         * @param isTemplate 是否为因子模版，true:是   false:否
         * @param pageNumber
         */
        getScoringList(scoringModelId,type,keyword,isTemplate,pageNumber,pageSize) {
            return this.request
                .get('scoringFactorList')
                .query(scoringModelId,type,keyword,isTemplate,pageNumber,pageSize);
        },

        /**
         * 模型修改
         * @param modelId
         * @param modelName
         */
        editModelName(modelId, modelName, scoringRange) {
            return this.request
                .put('model')
                .send({modelId, modelName, scoringRange});
        },

        /**
         * 修改模型状态
         * @param modelId
         * @param status 启用:1 停用:0
         */
        modelStatus(modelId, status) {
            return this.request
                .post('model/status')
                .send({modelId, status});
        },

        /**
         * 复制因子
         * @param id 因子id
         * @param scoringModelId 模型id
         */
        copyFactor(id, scoringModelId) {
            return this.request
                .post('copyScoringFactor')
                .send({id, scoringModelId});
        },

        /**
         * 删除因子 /单个/批量
         * @param factorIdArray
         */
        delFactor(factorIdArray, scoringModelId) {
            return this.request
                .del('deleteScoringFactor')
                .send({factorIdArray, scoringModelId});
        },

        /**
         * 获取评分因子列表
         * @param scoringModelId 评分模型Id
         * @param type 评分因子类型。0:属性因子; 1:事件因子; （不传或其他，则默认返回所有类型 ）
         * @param keyword 搜索关键词
         * @param isTemplate 是否为因子模版，true:是   false:否
         * @param pageNumber
         * @return {*}
         */
        scoringFactorList({scoringModelId, type, keyword, isTemplate, pageNumber}) {
            return this.request
                .get('scoringFactorList')
                .query({
                    scoringModelId, type, keyword, isTemplate, pageNumber
                });
        },

        /**
         * 获取单个评分因子详情
         * @param factorId 评分因子Id
         * @param scoringModelId 评分模型id，因子模板不传此参数
         * @return {*}
         */
        scoringFactor({factorId, scoringModelId}) {
            return this.request
                .get('scoringFactor')
                .query({
                    factorId,
                    scoringModelId
                });
        },

        /**
         * 计算预估人数
         * @param factorId 评分因子Id
         * @param scoringModelId 评分模型id，因子模板不传此参数
         * @return {*}
         */
        countExpected({factorId, scoringModelId}) {
            return this.request
                .get('countExpected')
                .query({
                    factorId,
                    scoringModelId
                });
        },

        /**
         * @description: 新建、编辑评分因子
         * @param {Number} scoringModelId 评分模型id
         * @param {Number} id 评分因子id，有值则为编辑，空值则为新建
         * @param {String} name 评分因子名称
         * @param {Number} type 评分因子类型。0:属性因子 1:事件因子
         * @param {Boolean} isTemplate 是否为因子模版，true:是 false:否
         * @param {Number} attributeOrEventId 属性或事件id
         * @param {String} scoreRules 评分规则，Json结构
         */
        saveScoringFactor (obj) {
            return this.request
                .post('saveScoringFactor')
                .send(obj);
        },

        /**
         * 评分因子排序接口
         * @param {Array} list 评分因子数组
         * @param {Number} id 评分因子id
         * @param {Number} sortNumber 序号
         * @return {*}
         */
        sortScoringFactor(list) {
            return this.request
                .post('sort')
                .send(list);
        },

        /**
         * 修改等级
         * @param modelId
         * @param grades
         */
        editGrades(modelId, grades) {
            return this.request
                .post('model/grades')
                .send({modelId,grades});
        },
        
        
        /***** 专家模式-end *****/


        /***** 评分报告及其他关联-start *****/

        /**
         * 评分模型 - 报告数据来源
         * @returns
         */
        getSource () {
            return this.request.get('model/report/source');
        },
        /**
         * ✔️评分模型 - 报告√
         * @param {*} modelId  id
         * @returns 
         */
        getReport (modelId) {
            return this.request.get('model/report').query({ modelId });
        },

        /**
         * 评分模型-创建联系人分群
         * @param {*} params 
         */
        createContactSwarm (params) {
            return this.request.post('model/createContactSwarm').query(params);
        }

        /***** 评分报告及其他关联-end *****/
    }
});