import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.JOURNEY_MATERIAL_API_BASE + '/api/material/v1',
    api: {
        /**
         * 保存邮件、邮件头尾模板共享
         * @param authorty {String} 权限IDS 0:预览 1:编辑 2:移动 3:复制 4:测试 5:删除 6:批量删除 7:批量移动
         * @param departmentId {String} 部门IDS
         * @param materialId {Number} 素材ID
         * @param roleId {String} 安全组IDS
         * @param userId {String} 用户IDS
         * @param type {Number} 共享类型 1:邮件 2头尾模板
         */
        saveMaterialUser ({ authorty = '', departmentId = '', roleId = '', userId = '', materialId, type }) {
            return this.request
                .post('/saveMaterialUser')
                .send({
                    authorty,
                    departmentId,
                    materialId,
                    roleId,
                    userId,
                    type
                });
        },

        /**
         * 删除邮件、邮件头尾模板共享规则
         * @param id {Number} 共享规则ID
         */
        deleteMaterialSharing (id) {
            return this.request
                .delete('/deleteSharing')
                .query({ id });
        },

        /**
         * 获取共享给我的素材列表（邮件）
         * @param keyword {String} 搜索字段
         * @param pageNumber {Number} 页码
         * @param sortValue {String} 排序字段（name,createDate,updateDate）
         * @param sortOrder {Number} 排序顺序（0:升序，1:降序）
         */
        findMaterials ({ keyword = '', pageNumber = 1, sortValue = '', sortOrder = '' }) {
            return this.request
                .get('/findMaterials')
                .query({
                    keyword,
                    pageNumber,
                    sortOrder,
                    sortValue
                });
        },

        /**
         * 获取共享给我的素材列表（头尾）
         * @param keyword {String} 搜索字段
         * @param pageNumber {Number} 页码
         * @param sortValue {String} 排序字段（name,createDate,updateDate）
         * @param sortOrder {Number} 排序顺序（0:升序，1:降序）
         * @param type {Number} 请求类型 1=头部，2=尾部
         */
        findMaterialsByHead ({ keyword, pageNumber, sortValue, sortOrder, type }) {
            return this.request
                .get('/findMaterialsByHead')
                .query({
                    keyword,
                    pageNumber,
                    sortOrder,
                    sortValue,
                    type
                });
        },

        /**
         * 获取邮件、邮件头尾模板共享列表
         * @param materialId {Number} 素材id
         * @param pageNumber {Number} 页码
         * @param type {Number} 接口类型 1:邮件 2:头尾模板
         */
        findMaterialSharingList ({ materialId, type, pageNumber = 1 }) {
            return this.request
                .get(`${LINKS.JOURNEY_MATERIAL_API_BASE}/api/material/v1/findMaterialSharingList`)
                .query({
                    materialId,
                    pageNumber,
                    type
                });
        },

        /**
         * 查看当前邮件、邮件头尾模板按钮是否可用
         * @param materialId {Number} 素材id
         * @param materialType {Number} 接口类型 1:邮件 2: 头尾模板
         * @param type {Number} 参数类型 1:共享按钮 2: 其他按钮
         * @param shareType {Number} 按钮类型 3:编辑素材 4: 预览素材5: 复制素材 6:测试素材 7:删除素材 8:导出HTML 9: 批量删除10:批量移动 11:移动
         */
        sharingVerify ({ materialId, materialType, type, shareType }) {
            return this.request
                .get('/sharingVerify')
                .query({
                    materialId,
                    materialType,
                    type,
                    shareType
                });
        },

        /**
         * --- START migrated from outdated src/data/journey/material/materialModel ---
         */
        /**
         * 获取素材列表
         * @param groupId
         * @param name
         * @param pageNumber
         * @param type 0 for sms, 1 for email, empty for all
         * @param sort 1 更新时间升序；2 名称降序；3 名称升序；null或者其他更新时间降序
         */
        getMaterials(groupId, name, pageNumber, type, sortValue, sortOrder) {
            return this.request
                .get('/material')
                .query({
                    groupId,
                    name,
                    pageNumber,
                    type,
                    sortValue,
                    sortOrder
                });
        },

        /**
         * fixme 微信素材接口不该在邮件素材的接口文件里
         * 微信: 查询素材列表
         * @param groupId       素材分组：0：全部；-1：未分组；3：groupId
         * @param name          关键字
         * @param pageNumber    页码
         * @param type          类型：1：图文消息 2：图片
         */
        wechatMaterials(groupId, name, pageNumber, type) {
            return this.request
                .get('/wxmaterial')
                .query({
                    groupId,
                    name,
                    pageNumber,
                    type
                });
        },

        /**
         * fixme 微信素材接口不该在邮件素材的接口文件里
         * 微信：获取图文预览数据
         * @param id
         */
        wechatImgText(id) {
            return this.request
                .get(`/wxmaterial/${id}`);
        },

        /**
         * fixme 微信素材接口不该在邮件素材的接口文件里
         * 微信：查询组列表
         * @param type
         */
        wechatMaterialGroup(type) {
            return this.request
                .get('/wxmaterial/group')
                .query({type});
        },


        /**
         * 批量获取素材内容，邮件的预览图地址、短信的文本内容
         * @param materialIds 素材id [1,2,3]
         * @param isCopy Boolean 副本
         */
        getMaterialsByIds(materialIds, isCopy) {
            return this.request
                .get('/material/content')
                .query({
                    materialIds,
                    isCopy
                });
        },

        /**
         * 记录展示模式（列表或缩略图），是否展示复制数
         * @param copyStatus Number     0 不展示  1展示
         * @param materialStatus Number     0 普通列表 1缩略图列表
         */
        saveMaterialsStatus({copyStatus, materialStatus}) {
            return this.request
                .post('/saveStatus')
                .query({
                    copyStatus,
                    materialStatus
                });
        },

        /**
         * 获取展示模式（列表或缩略图），是否展示复制数
         */
        getMaterialsStatus() {
            return this.request
                .get('/getStatus');
        },

        /**
         * 获取素材详情
         * @param id
         */
        getMaterial(id) {
            return this.request
                .get(`/material/${id}`);
        },

        /**
         * 获取素材详情（批次邮件）
         * @param id
         */
        getNikeMaterial(id) {
            return this.request
                .get(`/material/template/${id}`);
        },

        /**
         * 素材预览随机替换关键字
         * @param id
         * @return {*}
         */
        sampleMaterial(id) {
            return this.request
                .get(`/material/${id}/fieldReplace`);
        },


        /**
         * 获取素材副本
         * @param id
         */
        getMaterialCopy(id) {
            return this.request
                .get(`/materialCopy/${id}`);
        },


        /**
         * 更新
         * @param material
         * @return {Request|*}
         */
        update(material) {
            return this.request
                .put(`/material/${material.id}`)
                .send(material);
        },


        /**
         * 获取邮件素材内容
         * @param id
         */
        getEmailHtml(id) {
            return this.request.get(`/material/${id}/content`);
        },


        /**
         * 创建素材
         * @param groupId
         * @param type
         * @param materialContent
         * @param materialName
         * @param headId
         * @param footId
         * @param materialLabelDTOList
         * @return {Request|*}
         */
        create({groupId, type, materialContent, materialName, headId, footId, materialLabelDTOList}) {
            return this.request
                .post('/material')
                .send({
                    groupId,
                    type,
                    materialContent,
                    materialName,
                    headId,
                    footId,
                    materialLabelDTOList
                });
        },


        /**
         * 复制一个素材
         * @param id
         * @return {Request|*}
         */
        duplicate(id) {
            return this.request
                .post(`/material/${id}`);
        },


        /**
         * 删除素材
         * @param id
         * @return {*|Request}
         */
        delMaterial(id) {
            return this.request.del(`/material/${id}`);
        },


        /**
         * 批量删除素材
         * @param ids
         * @returns {*}
         */
        batchDel(ids) {
            return this.request
                .delete(`/batchDel`)
                .send(ids);
        },


        /**
         * 上传邮件zip
         * @param file
         * @param progresser
         * @return {Request}
         */
        uploadZIP(file, progresser) {
            return this.request
                .post('/material/file')
                .attach('file', file)
                .on('progress', progresser);
        },


        /**
         * 获取ZIP的内容
         * @param file
         */
        getZIPContent(file) {
            return this.request
                .get('/material/file')
                .query({file});
        },


        /**
         * 保存单个彩信内容
         * @param mmsMaterial
         */
        createSingleMms(mmsMaterial) {
            return this.request
                .post('/material/mms')
                .send(mmsMaterial);
        },


        /**
         * 获取 单个彩信详情
         * @param id
         */
        getSingleMmsInfo(id) {
            return this.request
                .get(`/material/mms/${id}`);
        },


        /**
         * 删除 单个 彩信
         * @param id
         */
        deleteSingleMms(id) {
            return this.request.del(`/material/mms/${id}`);
        },


        /**
         * 更新 单个 彩信
         * @param materialMms
         */
        updateSingleMms(materialMms) {
            return this.request
                .put(`/material/mms/${materialMms.id}`)
                .send(materialMms);
        },


        /**
         * 排序
         * @param id
         * @param ids
         * @return {*}
         */
        sortMMSMaterials(id, ids) {
            return this.request
                .put(`/material/mms/${id}/sort`)
                .send(ids);
        },


        /**
         * 彩信上传图片
         * @param file
         * @return {*}
         */
        mmsUpload(file) {
            return this.request
                .post('/material/mms/file')
                .attach('file', file);
        },


        /**
         * 检查短信和彩信素材是否有测试权限
         * @param id    素材ID
         * @return {*}
         */
        checkMaterialTest(id) {
            return this.request
                .get('/checkMaterialTest')
                .query({id});
        },


        /**
         * 检查短信和彩信素材是否有预览权限
         * @param id    素材ID
         * @return {*}
         */
        checkMaterialPreview(id) {
            return this.request
                .get('/checkMaterialPreview')
                .query({id});
        },


        /**
         * 检查短信和彩信素材是否有编辑权限
         * @param id    素材ID
         * @return {*}
         */
        checkMaterialEdit(id) {
            return this.request
                .get('/checkMaterialEdit')
                .query({id});
        },

        /**
         * 新增素材（批次邮件）
         * @param {string} materialContentHtml 素材HTML
         * @param {string} materialContentJson 素材JSON
         * @param {string} materialName 素材名
         * @param {string} groupId 分组id
         * @param {number} type 素材类型 批次邮件是6
         * @param {*} headId 头模板id 没有传0
         * @param {*} footId 尾模板id 没有传0
         */
        addTemplate(
            materialContentHtml, materialContentJson, materialName, groupId,
            type, headId, footId
        ) {
            return this.request
                .post(`/material/template`)
                .send({
                    materialContentHtml,
                    materialContentJson,
                    materialName,
                    groupId,
                    type,
                    headId,
                    footId
                });
        },
        /**
         * 编辑素材（批次邮件）
         * @param {string} materialContentHtml 素材HTML
         * @param {string} materialContentJson 素材JSON
         * @param {string} materialName 素材名
         * @param {string} groupId 分组id
         * @param {number} type 素材类型 批次邮件是6
         * @param {*} headId 头模板id 没有传0
         * @param {*} footId 尾模板id 没有传0
         * @param {number} id 素材id
         */
        editTemplate(
            materialContentHtml, materialContentJson, materialName, groupId, type,
            headId, footId, id
        ) {
            return this.request
                .put(`/material/template/${id}`)
                .send({
                    materialContentHtml,
                    materialContentJson,
                    materialName,
                    groupId,
                    type,
                    headId,
                    footId
                });
        },
        /**
         * 标签列表
         * @param {number} id 标签Id(请求program和campaign联动时传值)
         * @param {string} type 类型 1. Program 2.Content 3. other.内容标签
         * @param {number} linkageTopId 被联动一级标签id
         */
        getLabelList(id, type, linkageTopId) {
            return this.request
                .get('/label')
                .query({id: id,  type: type, linkageTopId: linkageTopId});
        },
        /**
         * 新增自定义标签(topic)
         * @param {string} nameCn 中文名称
         * @param {string} nameEn 英文名称
         */
        createTopicLabel(nameCn, nameEn) {
            return this.request
                .post('/label')
                .send({nameCn: nameCn, nameEn: nameEn});
        },
        /**
         * 获取当前素材绑定的标签
         * @param {number} materialId 素材id
         */
        getMaterialLabel(materialId) {
            return this.request
                .get('/selectedMaterialLabel')
                .query({materialId: materialId});
        },
        /**
         * 素材标签预览
         * @param {number} materialId 素材id
         */
        previewMaterialLabel(materialId) {
            return this.request
                .get('/materialLabel')
                .query({materialId: materialId});
        },
        /**
         * 自定义topic标签列表
         * @param {string} name 搜索关键字(名称)
         * @param {number} pageNum 页码
         * @param {number} pageSize 每页显示条数
         */
        getTopicLabelList(name, pageNum, pageSize) {
            return this.request
                .get('/topicLabel')
                .query({
                    name: name,
                    pageNum: pageNum,
                    pageSize: pageSize
                });
        },
        /**
         * 长链转短链
         * @param {*} url
         * @returns
         */
        getShortUrl (url) {
            return this.request
                .get('/material/template/convert2ShortUrl')
                .query({
                    url: url
                });
        }
        /**
         * --- END migrated from outdated src/data/journey/material/materialModel ---
         */

    }
});
