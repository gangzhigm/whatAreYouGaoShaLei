import Model from 'web-model';
import LINKS from '@/LINKS';


export default new Model({
    base: LINKS.SCORING_API_BASE + '/api/scorerating/v1/',
    api: {
        /***** 评分模型列表-start *****/

        /**
         * 联系人评分查询
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
         * 新建评分模型
         * @param {scoringRange} 0 全部联系人，,其他数值： 新建联系人
         * @param {modelName} 模型名称
         * @returns
         */
        addScoringModel ({ scoringRange, modelName }) {
            return this.request
                .post('model')
                .send({ scoringRange, modelName });
        },

        /**
         * 启动/停用评分模型
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
         * 复制评分模型
         * @param {*} modelId  模型ID
         * @returns
         */
        copyScoringModel ({ modelId }) {
            return this.request
                .post('model/copy')
                .query({ modelId });
        },

        /**
        * 删除评分模型
        * @param {*} modelId 模型ID
        * @returns
        */
        delScoringModel (modelId) {
            return this.request
                .del('model')
                .query(modelId);
        },
        /***** 评分模型列表-end *****/

        /***** 评分模型编辑-start *****/
        /**
         * 登记查询
         * @param modelId
         */
        getGrades(modelId) {
            return this.request
                .get('model/grades')
                .query({modelId});
        },
        /**
         * 修改等级名字
         * @param modelId
         * @param grades
         */
        editGrades(modelId,grades) {
            return this.request
                .post('model/grades')
                .send({modelId,grades});
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
        editModelName(modelId, modelName) {
            return this.request
                .put('model')
                .send({modelId, modelName});
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
         * 上移/下移因子
         * @lastId
         * @nextId
         */
        upAndDown(lastId, nextId, scoringModelId) {
            return this.request
                .post('moveUpOrMoveDown')
                .send({lastId, nextId, scoringModelId});
        },
        /**
         * 保存为模版
         * @param id 因子id
         */
        saveFactorToTem(id, scoringModelId) {
            return this.request
                .post('saveToFactorTemplate')
                .send({id, scoringModelId});
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
        /***** 评分模型编辑-end *****/

        /***** 评分因子编辑-start *****/
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
         * 删除/批量删除评分因子
         * @param {Array} factorIdArray 评分因子Id数组
         * @return {*}
         */
        deleteScoringFactor({factorIdArray}) {
            return this.request
                .delete('deleteScoringFactor')
                .send({factorIdArray});
        },
        /**
         * 评分模型校验（异步操作时校验模型是否存在）
         * @param {Number} modelId 模型id
         * @return {*}
         */
        checkModelId({modelId}) {
            return this.request
                .get('model/check')
                .query({modelId});
        },
        /***** 评分因子编辑-end *****/

        /***** 评分报告及其他关联-start *****/
        /**
        * @description:获取评分趋势
        * @param modelId
        * @param startDate
        * @param endDate
        */
        getScoringTrends (modelId, startDate, endDate) {
            return this.request
                .get('model/report/trends')
                .query({ modelId, startDate, endDate });
        },
        /**
        * @description:获取评分报告
        * @param modelId
        */
        getscoringTableData (modelId) {
            return this.request
                .get('model/report')
                .query({ modelId });
        },
        /**
        * @description:创建联系人分群
        * @param modelId
        * @param gradeName
        */
        creatContactGroup ({ modelId, gradeName }) {
            return this.request
                .post('model/createContactSwarm')
                .query({ modelId, gradeName });
        },
        /**
        * @description:评分模型列表
        */
        getScoringModel(){
            return this.request
                .get('model/getAllScoringModelList');
        },
        /**
        * @description:评分报告下拉表单数据来源
        */
        getScoringSource(){
            return this.request
                .get('model/report/source');
        }
        /***** 评分报告及其他关联-end *****/
    }
});
