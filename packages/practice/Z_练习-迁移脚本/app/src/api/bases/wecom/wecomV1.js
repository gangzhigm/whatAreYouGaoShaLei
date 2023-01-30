import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.WECOM_API_BASE + '/api/wecom/v1',
    api: {
        /**
         * --- START 渠道活码 ---
         */

        /**
         * 获取渠道活码分组列表
         * @param  {Number} sortType 排序类型（1.创建时间降序 2.创建时间升序 3.更新时间降序 4.更新时间升序 5.分组名称降序 6.分组名称升序）
         * @param {String} searchName 搜索关键词
         */
        getChannelCodeGroupList ({ sortType, searchName }) {
            return this.request
                .get('/channelCodeGroup/getGroupList')
                .query({ sortType, searchName });
        },
        /**
         * @description: 新建、编辑渠道活码
         * @param {Number} id 渠道活码id（创建渠道活码无此参数）
         * @param {String} name 活码名称
         * @param {Array} channelCodeGroups 渠道活码分组id列表
         * @param {Array} employeeIds 员工id列表
         * @param {Array} contactLabelIds 标签id列表
         * @param {Number} skipVerify 添加设置（1.开启,无需好友验证  0.未开启,扫码需好友验证）
         * @param {Number} welcome 设置欢迎语（1.渠道欢迎语 0.不发送欢迎语）
         * @param {String} sendContent sendContent里的内容为欢迎语1的内容，若没有欢迎语1则不传sendContent(该内容为企业微信官方文档text类型下的 content)
         * @param {Array} attachments 欢迎语内容数组，示例如初始值  ，attachments里的内容为欢迎语2的内容，类型三选一（图片、链接、小程序），若没有欢迎语2则不传attachments
         */
        saveOrUpdate (obj) {
            return this.request
                .post('/channelCode/saveOrUpdate')
                .send(obj);
        },
        /**
         * @description: 获取单个渠道活码详情
         * @param {Number} id 渠道活码id
         * @return {*}
         */
        channelCode (id) {
            return this.request
                .get('/channelCode/getInfo')
                .query({ id });
        },
        /**
         * @description: 单个删除渠道活码、批量删除渠道活码
         * @param {Array} channelCodeIds 渠道活码id列表
         * @return {*}
         */
        deleteCode (channelCodeIds) {
            return this.request
                .del('/channelCode/deleteCode')
                .send(channelCodeIds);
        },
        /**
         * @description: 新建渠道活码分组、修改渠道活码分组
         * @param {String} id 渠道活码分组id（创建渠道活码不传此参数）
         * @param {String} name 渠道活码分组名称
         * @param {Number} parentId 父id
         * @return {*}
         */
        saveOrUpdateGroup ({ id, name, parentId }) {
            return this.request
                .post('/channelCodeGroup/saveOrUpdate')
                .send({ id, name, parentId });
        },
        /**
         * @description: 删除渠道活码分组
         * @param {Number} id 渠道活码分组id
         * @return {*}
         */
        deleteGroup (id) {
            return this.request
                .del('/channelCodeGroup/deleteGroup')
                .query({ id });
        },
        /**
         * @description: 批量移动渠道活码至分组
         * @param {Array} ids 渠道活码id列表
         * @param {Number} channelCodeGroupId 移动目标分组id
         * @return {*}
         */
        moveGroups ({ ids, channelCodeGroupId }) {
            return this.request
                .put('/channelCode/moveGroups')
                .send({ ids, channelCodeGroupId });
        },
        /**
         * @description: 获取渠道活码列表
         * @param {Number} pageNumber 页码
         * @param {String} keyword 关键词
         * @param {Number} groupId 分组id（-2：我创建的）
         * @return {*}
         */
        getList ({ pageNumber, keyword, groupId }) {
            return this.request
                .get('/channelCode/getList')
                .query({ pageNumber, keyword, groupId });
        },
        /**
         * @description: 详情统计-统计总数 (今日添加联系人数、总添加联系人数)
         * @param {Number} id 渠道活码id
         * @return {*}
         */
        totalStatistics (id) {
            return this.request
                .get('/details/totalStatistics')
                .query(id);
        },
        /**
         * @description: 详情统计-联系人统计列表(联系人统计列表：日期统计、员工统计)
         * @param {Number} id 渠道活码id
         * @param {Number} type 统计类型（1：日期统计 2：员工统计）
         * @param {Number} pageNumber 页码
         * @return {*}
         */
        contactStatisticsList ({ id, type, pageNumber }) {
            return this.request
                .get('/details/contactStatisticsList')
                .query({ id, type, pageNumber });
        },
        /**
         * @description: 下载渠道活码扫码记录列表
         * @param {Array} ids 渠道活码id
         * @param {String*} emailAddress 接收邮箱
         * @param {String} emailSubject 邮件主题
         * @param {String} dataFormat 数据格式 （utf8 gb18030）
         * @param {String} formatType 格式类型（Excel  CSV）
         * @param {String} language 语言（zh:中文,en:英文）
         * @param {Number} sendType 发送方式（1.单个文件下载 2.批量文件下载）
         * @return {*}
         */
        downloadCsv ({ ids, emailAddress, emailSubject, dataFormat, formatType, sendType, language }) {
            return this.request
                .post('/details/downloadCsv')
                .send({ ids, emailAddress, emailSubject, dataFormat, formatType, sendType, language });
        },
        /**
         * @description: 点击添加联系人数获取联系人列表、根据员工/联系人企业微信名称/手机号/unionid获取联系人列表
         * @param {String} date 统计添加联系人数的日期
         * @param {Number} channelCodeId 渠道活码id
         * @param {Number} workEmployeeId 员工id(-1为全部员工)
         * @param {String} searchName 搜索关键词（手机号、unionid、外部联系人企业微信名称）
         * @param {Number} pageNumber  页码
         * @return {*}
         */
        contactListByDate ({ date, channelCodeId, userid, searchName, pageNumber }) {
            return this.request
                .get('/details/contactListByDate')
                .query({ date, channelCodeId, userid, searchName, pageNumber });
        },
        /**
         * @description: 该日期扫码记录中，扫码匹配过的员工的列表
         * @param {String} date 查询日期
         * @param {Number} channelCodeId 渠道活码id
         * @return {*}
         */
        employeeListByDate ({ date, channelCodeId }) {
            return this.request
                .get('/details/employeeListByDate')
                .query({ date, channelCodeId });
        },

        /**
         * 获取活码下拉列表全部数据
         * @param  {Number} keyword 搜索活码名称关键词
         */
        getAllChannelCodeList ({ keyword }) {
            return this.request
                .get('/channelCode/getAllCodeList')
                .query({ keyword });
        },
        /**
         * @description: 拉取有客户权限的员工列表（不分页）
         * @return {*}
         */
        getAuthorityStaffListNoPage () {
            return this.request
                .get('/getAuthorityStaffListNoPage');
        },
        /**
         * --- END 渠道活码 ---
         */

        /**
         * --- START 企业群发 ---
         */

        /**
         * 查询群发列表信息
         * @param keyword 模糊匹配群发名称，筛选群发内容
         * @param sendMode 群发方式 1 企业群发 2 应用消息
         * @param sendType 群发类型  1 客户  2 客户群
         * @param messageType 消息类型  1 立即发送  2 定时发送
         * @param sendStatus  群发状态 0 待发送 1 发送中 2 已完成  3 已取消
         * @returns
         */
        getBroadcastInfo (params) {
            return this.request
                .get('/getMessageList')
                .query(params);
        },
        /**
         * 取消发送
         * @param {*} id
         * @returns
         */
        cancelSend (id) {
            return this.request
                .get(`/cancelJob`)
                .query({ id });
        },
        /**
         * 删除群发消息
         * @param {*} id
         * @returns
         */
        delBroadcastInfo (id) {
            return this.request
                .delete(`/deleteMessage`)
                .query({ id });
        },
        //获取群主下拉列表
        getGroupOwnerList () {
            return this.request
                .get('/getWecomGroupOwnerListNoPage');
        },
        /**
         * 员工/联系人详情列表
         * @param messageId 消息id
         * @param sendType 1.企业群发 2 应用消息
         * @param type 1. 员工 2联系人
         * @param sendStatus  状态
         * @returns
         */
        getContactInfoList (params) {
            return this.request
                .get('/userDetailList')
                .query(params);
        },
        /**
         * 群聊/群主列表
         * @param messageId 消息id
         * @param sendType 1.企业群发 2 应用消息
         * @param type 1. 员工 2联系人
         * @param sendStatus  0 未送达 1 已送达 2 发送失败
         * @returns
         */
        getChatList (params) {
            return this.request
                .get('/chatList')
                .query(params);
        },
        /**
         * 根据id 获取编辑信息
         * @param id
         * @returns
         */
        getMessage (id) {
            return this.request
                .get('/getMessage')
                .query({ id });
        },
        /**
         * 获取单个群发详情
         * @param id
         * @returns
         */
        getEntBroadcastDetail (id) {
            return this.request
                .get('/getDetail')
                .query({ id });
        },
        /**
         * 导出(企业群发相关)
         * @param fileType  csv/excel
         * @param type  1. 客户相关 2. 群聊相关
         * @param dataFormat  默认为空(utf-8) 为gbk时该字段必填
         * @param messageId  id
         * @param subject  邮件主题
         * @param email  收件地址
         * @returns
         */
        exportCsvOrExcel (params) {
            return this.request
                .get('/ExportCsvOrExcel')
                .query(params);
        },
        /**
         * 导出(应用消息相关)
         * @param fileType  csv/excel
         * @param type  1. 客户相关 2. 群聊相关
         * @param dataFormat  默认为空(utf-8) 为gbk时该字段必填
         * @param messageId  id
         * @param subject  邮件主题
         * @param email  收件地址
         * @returns
         */
        exportCsvOrExcelByAgent (params) {
            return this.request
                .get('/ExportCsvOrExcelByAgent')
                .query(params);
        },
        /**
         * 群发消息新增/编辑
         * @param sendName 群发名称
         * @param sendContent 群发内容 该内容为企业微信官方文档text类型下的 content;
         * @param sendMode 群发方式 1 企业群发 2 应用消息
         * @param sendType 群发类型 1 客户 2 客户群
         * @param messageType 消息类型 1 立即发送 2 定时发送 3 旅程发送
         * @param sendTime 发送时间
         * @param employeeIds 员工ids ","分隔
         * @param attachments 群发内容json
         * @param chatId 群ids "," 分隔
         * @param id 编辑下 id不为空
         * @returns
         */
        saveMessage (params) {
            return this.request
                .post('/saveMessage')
                .send(params);
        },
        /**
         * --- END 企业群发 ---
         */

        /**
         * --- START 会话存档 ---
        /**
         * @description 会话记录分页列表-联系人
         * @param {Number} pageNo 页码
         * @param {Number} pageSize 分页数量
         * @param {string} employeeId 员工ID
         * @param {string} keywords 搜索关键词
         */
        getContactPageList (params) {
            return this.request
                .get('/chatRecord/contactPageList')
                .query(params);
        },

        /**
         * @description 会话记录分页列表-联系人
         * @param {Number} pageNo 页码
         * @param {Number} pageSize 分页数量
         * @param {string} employeeId 员工ID
         * @param {string} keywords 搜索关键词
         */
        getGroupPageList (params) {
            return this.request
                .get('/chatRecord/roomPageList')
                .query(params);
        },

        // 获取会话存档公共配置
        getChatPublicConfig () {
            return this.request
                .get('/workAgent/chatPublicConfig');
        },

        /**
         * @description 会话记录内容
         * @param {Number} pageSize 分页数量
         * @param {Number} pageNo 页码
         * @param {string} keywords 关键词(内容)
         * @param {string} msgType 消息类型
         * @param {Number} employeeId 员工ID(联系人会话列表进入传)
         * @param {Number} contactId 联系人ID(联系人会话列表进入传)
         * @param {Number} wxRoomId 群ID(群会话列表进入传)
         */
        getChatContent (params) {
            return this.request
                .get('/chatRecord/content')
                .query(params);
        },


        // 获取会话存档配置
        getChatConfig () {
            return this.request
                .get('/workAgent/chatConfig');
        },

        /**
         * @description 保存会话存档配置
         * @param {string} chatSecret 会话存档secret
         * @param {string} chatPublicKeyVersion 会话存档公钥版本号
         */
        saveChatConfit (chatSecret, chatPublicKeyVersion) {
            return this.request
                .post('/workAgent/chatConfig')
                .send({ chatSecret, chatPublicKeyVersion });
        },
        /**
         * --- END 会话存档 ---
         */


        /**
         * --- START 导购助手 ---
        /**
        
        /**
         * @description 其他配置--上传背景图片
         * @param file
         */
        uploadImage(file) {
            return this.request
                .post('/uploadImage')
                .attach('file', file);
        },

        /**
         * @description 其他配置--保存配置
         * @param homeUrl   首页背景图url
         * @param jumpUrl   跳转页面背景图url
         */
        saveImage({homeUrl, jumpUrl}) {
            return this.request
                .post('/saveImage')
                .send({homeUrl, jumpUrl});
        },

        /**
         * @description 获取背景图片--后端
         */
        getImages() {
            return this.request
                .get('/getImages');
        },

        /**
         * @description 获取销售数据列表
         */
        salesDataList () {
            return this.request
                .get('/salesData/list');
        },

        /**
         * @description 查看销售数据
         * @param {Number} id 销售数据id
         */
        salesData (id) {
            return this.request
                .get('/salesData')
                .query({ id });
        },

        /**
         * @description 编辑销售数据
         * @param {Number} id 修改的销售数据id
         * @param {String} typeName 顾客类型名称
         * @param {String} conditionJson 条件json
         */
        salesDataUpdate ({id, typeName, conditionJson}) {
            return this.request
                .post('/salesData/update')
                .send({id, typeName, conditionJson});
        },
        

        /**
         * @description 新建/修改回访任务
         * @param {Number} id 回访任务id（id为空新建，不为空修改）
         * @param {String} name 回访任务名
         * @param {Number} groupId 分组id
         * @param {Array} labelIds 标签id数组
         * @param {Number} taskPerson 任务总人数
         * @param {Number} reviewPerson 预计回访客户数
         * @param {Number} relatedStaff 相关员工数
         * @param {Object} staffJson 相关员工Json
         * @param {Object} labelJson 标签Json
         * @param {Number} returnVisitPerson 已回访人数
         */
        reviewTaskSave ({
            id,
            name,
            groupId,
            labelIds,
            taskPerson,
            reviewPerson,
            relatedStaff,
            staffJson,
            labelJson,
            returnVisitPerson
        }) {
            return this.request
                .post('/reviewTask/save')
                .send({
                    id,
                    name,
                    groupId,
                    labelIds,
                    taskPerson,
                    reviewPerson,
                    relatedStaff,
                    staffJson,
                    labelJson,
                    returnVisitPerson
                });
        },

        /**
         * @description 查看回访任务详情
         * @param {Number} id 回访任务id
         */
        reviewTaskSelect (id) {
            return this.request
                .get('/reviewTask/select')
                .query({ id });
        },

        /**
         * @description 查看回访任务列表
         * @param {String} name 回访任务名或更新人或创建人
         * @param {Number} groupId 分组id（0：全部，-1：我创建的）
         * @param {Number} page 页码（默认为1）
         * @param {Number} pageSize 每页条数
         * @param {String} sort 排序方式（asc或者desc）
         * @param {String} sortBy 排序字段（name、updateDate、creatDate）
         */
        reviewTaskGetReviewTaskList ({name, groupId, page, pageSize, sort, sortBy}) {
            return this.request
                .get('/reviewTask/getReviewTaskList')
                .query({name, groupId, page, pageSize, sort, sortBy});
        },

        /**
         * @description 删除/批量删除回访任务
         * @param {Array} ids 回访任务id数组
         */
        reviewTaskDelete ({ids}) {
            return this.request
                .delete('/reviewTask/delete')
                .send({ids});
        },

        /**
         * @description 回访任务移至分组/批量移至分组
         * @param {Array} ids 任务id数组
         * @param {String} moveGroupId 目标分组id
         */
        reviewTaskMove ({ ids, moveGroupId }) {
            return this.request
                .post('/reviewTask/move')
                .send({ ids, moveGroupId });
        },

        /**
         * @description 复制回访任务
         * @param {Array} id 回访任务id
         */
        reviewTaskCopy ({id}) {
            return this.request
                .post('/reviewTask/copy')
                .send({id});
        },

        /**
         * @description 回访任务--添加分组
         * @param {String} name 分组名
         * @param {Number} parentId 父级id
         */
        reviewTaskGroupSave ({name, parentId}) {
            return this.request
                .post('/reviewTaskGroup/save')
                .send({name, parentId});
        },

        /**
         * @description 回访任务--分组列表
         * @param {Number} sortType 排序类型 1：按创建时间降序 2：按创建时间升序 3：按更新时间降序 4：按更新时间升序 5：按名称降序 6：按名称生序
         */
        reviewTaskGroupGetGroupList ({sortType}) {
            return this.request
                .get('/reviewTaskGroup/getGroupList')
                .query({sortType});
        },

        /**
         * @description 回访任务--编辑分组
         * @param {Number} id 分组id
         * @param {String} name 分组名
         * @param {Number} parentId 父级id
         */
        reviewTaskGroupUpdate ({id, name, parentId}) {
            return this.request
                .post('/reviewTaskGroup/update')
                .send({id, name, parentId});
        },

        /**
         * @description 回访任务--删除分组
         * @param {Number} id 分组id
         */
        reviewTaskGroupDelete ({id}) {
            return this.request
                .delete('/reviewTaskGroup/delete')
                .query({id});
        },

        /**
         * @description 新建/编辑客户分组
         * @param {Number} id 客户分组id
         * @param {String} name 客户分组名
         * @param {Number} groupId 分组id
         * @param {Array} labelIds 标签id数组
         * @param {Number} customerPerson 客户组人数
         * @param {Number} noWechatPerson 未添加企微客户
         */
        customerGroupSave ({id, name, groupId, labelIds, customerPerson, noWechatPerson}) {
            return this.request
                .post('/customerGroup/save')
                .send({id, name, groupId, labelIds, customerPerson, noWechatPerson});
        },

        /**
         * @description 查看客户分组列表
         * @param {String} name 客户分组名或更新人或创建人
         * @param {Number} groupId 分组id（0：全部，-1：我创建的）
         * @param {Number} page 页码（默认为1）
         * @param {Number} pageSize 每页条数
         * @param {String} sort 排序方式（asc或者desc）
         * @param {String} sortBy 排序字段（name、updateDate、creatDate）
         */
        customerGroupGetCustomerGroupList ({
            name,
            groupId,
            page,
            pageSize,
            sort,
            sortBy
        }) {
            return this.request
                .get('/customerGroup/getCustomerGroupList')
                .query({
                    name,
                    groupId,
                    page,
                    pageSize,
                    sort,
                    sortBy
                });
        },
        

        /**
         * @description 查看客户分组详情
         * @param {Number} id 客户分组id
         */
        customerGroupSelect ({id}) {
            return this.request
                .get('/customerGroup/select')
                .query({id});
        },

        /**
         * @description 删除/批量删除客户分组
         * @param {Array} id 客户分组id数组
         */
        customerGroupDelete ({id}) {
            return this.request
                .delete('/customerGroup/delete')
                .query({id});
        },

        /**
         * @description 客服分组移至分组/批量移至分组
         * @param {Array} ids 客户分组id数组
         * @param {Number} moveGroupId 目标分组
         */
        customerGroupMove ({ids,moveGroupId}) {
            return this.request
                .post('/customerGroup/move')
                .send({ids,moveGroupId});
        },

        /**
         * @description 复制客户分组
         * @param {Array} id 客户分组id
         */
        customerGroupCopy ({id}) {
            return this.request
                .post('/customerGroup/copy')
                .send({id});
        },

        /**
         * @description 客户分组--添加分组
         * @param {String} name 分组名
         * @param {Number} parentId 父级id
         */
        customerGroupGroupSave ({name, parentId}) {
            return this.request
                .post('/customerGroupGroup/save')
                .send({name, parentId});
        },

        /**
         * @description 客户分组--分组列表
         * @param {Number} sortType 排序类型 1：按创建时间降序 2：按创建时间升序 3：按更新时间降序 4：按更新时间升序 5：按名称降序 6：按名称生序
         */
        customerGroupGroupGetGroupList ({sortType}) {
            return this.request
                .get('/customerGroupGroup/getGroupList')
                .query({sortType});
        },

        /**
         * @description 客户分组--编辑分组
         * @param {Number} id 分组id
         * @param {String} name 分组名
         * @param {Number} parentId 父级id
         */
        customerGroupGroupUpdate ({id, name, parentId}) {
            return this.request
                .post('/customerGroupGroup/update')
                .send({id, name, parentId});
        },

        /**
         * @description 客户分组--删除分组
         * @param {Number} id 分组id
         */
        customerGroupGroupDelete ({id}) {
            return this.request
                .delete('/customerGroupGroup/delete')
                .query({id});
        },

        /**
         * @description 未添加企微用户
         * @param {Number} id 客户分组id
         * @param {Number} pageNum 客户页码
         * @param {Number} pageSize 每页条数
         * @param {Number} searchName 搜索条件
         */
        enterpriseMicroUsers ({id,pageNum,pageSize ,searchName}) {
            return this.request
                .get('/customerGroup/noWechat')
                .query({
                    id,
                    pageNum,
                    pageSize,
                    searchName
                });
        },

        /**
         * @description 客户分组重新计算
         * @param {Array} labelIds 标签id数组
         */
        recalculates ({labelIds}) {
            return this.request
                .post('/customerGroup/recount')
                .send({
                    labelIds,
                });
        },

        /**
         * @description 客户分组-标签人数
         * @param {Array} labelIds 标签数组
         */
        numberTags ({labelIds}) {
            return this.request
                .post('/customerGroup/labelCount')
                .send({
                    labelIds,
                });
        },

        /**
         * 重新计算
         * @param {Array} labelIds 选中标签的id数组
         */
        reCalculate ({ labelIds }) {
            return this.request
                .post('/reviewTask/recount')
                .send({ labelIds });
        },

        /**
         * 分配员工
         * @param {Array} nullStaffCustomerIdStr 待分配联系人_id
         * @param {Array} userIds 需要分配的企微员工userId
         */
        assignStaff ({ labelIds, staffIds }) {
            return this.request
                .post('/reviewTask/assignStaff')
                .send({ labelIds, staffIds });
        },
        /**
         * 回访任务-相关员工
         * @param {Array} labelIds 标签id数组
         */
        relevantStaff ({ labelIds }) {
            return this.request
                .post('/reviewTask/relevantStaff')
                .send({ labelIds });
        },
        
        /**** 员工管理 *****/

        /**
         * 获取门店列表
         * @param {*} keyword 检索条件
         * @param {*} pageNumber  第几页
         * @param {*} pageSize 每页显示多少条
         * @returns 
         */
        getStore(keyword, pageNumber, pageSize) {
            return this.request
                .get('/store')
                .query({ keyword, pageNumber, pageSize });
        },

        /**
         * 删除门店
         * @param {*} id 
         * @returns 
         */
        delStore (id) {
            return this.request
                .del('/store')
                .query({ id });
        },

        /**
         * 编辑门店
         * @param {*} name 门店名称
         * @param {*} numberId 门店id编号
         * @param {*} workEmployees 员工id字符串数组
         * @param {*} id 
         * @returns 
         */
        editStore ({ name, numberId, workEmployeeIds: workEmployees, id}) {
            return this.request
                .put('/store')
                .send({ name, numberId, workEmployees, id});
        },

        /**
         * 创建门店
         * @param {*} name 门店名称
         * @param {*} numberId 门店id编号
         * @param {*} workEmployees 员工id字符串数组
         * @returns 
         */
        createStore({ name, numberId, workEmployeeIds: workEmployees}) {
            return this.request
                .post('/store')
                .send({ name, numberId, workEmployees});
        },
        
        /**
         * 员工管理-分页查询员工列表
         * @param {*} storeId 门店id 
         * @param {*} pageNo 页码 
         * @param {*} pageSize 分页数量 
         * @param {*} keyWord 查询关键字 
         * @returns 
         */
        getWorkEmployeeList ({storeId, pageNo, pageSize, keyWord}) {
            return this.request
                .get('/workEmployeeListByStore')
                .query({ storeId, pageNo, pageSize, keyWord });
        },


        /**
         * 员工管理-编辑员工
         * @param {*} id 
         * @param {*} employeeNum  员工编号
         * @param {*} updateAccount 更新者账户
         * @param {*} storeIds 门店ids
         * @returns 
         */
        updateEmployee ({id, employeeNum, updateAccount, storeIds,}) {
            return this.request
                .post('/updateEmployee')
                .send({ id, employeeNum, updateAccount, storeIds });
        },
        
        /**
         * 员工管理-分页查询员工下联系人列表
         * @param {*} workEmployeeId 员工id 
         * @param {*} pageNo  页码
         * @param {*} pageSize 分页数量
         * @param {*} keyWord 查询关键字
         * @param {*} wecome 是否企微联系人 0不是1是
         * @returns 
         */
        getContactByStaff ({ userId, pageNo, pageSize, keyWord, wecome }) {
            return this.request
                .get('/contactByStaff')
                .query({ userId, pageNo, pageSize, keyWord, wecome });
        },
        
        /**
         * 员工管理-门店列表不分页
         * @returns 
         */
        getStoreList () {
            return this.request
                .get('/storeNoPage');
        },
        /**
         * 回访任务-标签人数
         * @params {Array} labelIds 标签id数组
         */
        getLabelCount ({ labelIds }) {
            return this.request
                .post('/reviewTask/labelCount')
                .send({ labelIds });
        },
        /**
         * --- END 导购助手 ---
        /**
    
        
        /**
         * @description 拉取员工列表不分页
         * @param {Number} type 搜索类型：1员工名称,2员工手机号,3员工邮箱
         * @param {string} value 搜索关键词
         */
        getStaffListNoPage (type, value) {
            return this.request
                .get('/getWecomStaffListNoPage')
                .query({ type, value });
        },

        /**
         * 拉取企业微信群列表
         * @param value 搜索群名称关键词
         */
        getWecomGroupList (value) {
            return this.request
                .get('/getWecomGroupListNoPage')
                .query({ value });
        },

        /**
         * 导出报告到邮箱
         * @param email
         * @param unicode 编码（存储使用字符串，0是UTF-8,1是gbk,默认是1）
         * @param formatType 格式类型：formatType（Excel；CSV）
         * @param emailSubject 邮件主题
         * @param taskIds 任务id数组
         * @param type 导出消息类型(1.应用消息 2.企业群发)
         */
        exportWecomData (obj) {
            return this.request
                .get('/exportWecomSendData')
                .query(obj);
        },

        //获取获取应用配置列表
        getConfigList () {
            return this.request
                .get('/workAgent/list');
        },

        /**
         * 配置完成
         * id
         * wxCorpId
         * employeeSecret
         * employeeCallback
         * employeeToken
         * employeeEncodingAesKey
         * contactSecret
         * agentI
         * agentSecret
         * agentCallback
         * agentToken
         * agentEncodingAesKey
         */
        submitConfigInfo (info) {
            return this.request
                .post('/workAgent')
                .send(info);
        },
        /**
        * 保存cropId，获取二维码链接
        * @param cropId 企业id
        * @param appType
        */
        saveCropId (cropId, appType) {
            return this.request
                .post('/workAgent/saveCropId')
                .query({ cropId, appType });
        },
        /**
        * 获取二维码链接
        * @param appType 目前先固定传general
        */
        getWwAppTypeTemplateQrCodeUrl (appType = 'general') {
            return this.request
                .get('/workAgent/getWwAppTypeTemplateQrCodeUrl')
                .query({ appType });
        },
        /**
        * 获取配置详情
        * @param id
        */
        getConfigDetails (id) {
            return this.request
                .get('/workAgent')
                .query({ id });
        },
        /**
        * 获取应用公共配置
        * @param id
        */
        getPublicConfig () {
            return this.request
                .get('/workAgent/config');
        },

        //组织员工

        //获取部门列表
        getDeptList () {
            return this.request
                .get('/workDept/workDeptList');
        },
        //根据部门获取分页员工列表
        getDeptStaffs (deptId, pageNo, pageSize, keyWord) {
            return this.request
                .get('/workEmpioyeeList')
                .query({ deptId, pageNo, pageSize, keyWord });
        },
        /**
         * 同步数据
         * @param  {Number} synchronizationType 0API同步 1上传数据
         * @param {MultipartFile} 上传数据文件
         */

        syncData (synchronizationType, file) {
            return this.request
                .post('/workDept/dealAll')
                .attach('file', file)
                .field({synchronizationType});
        },
        /**
         * 获取当前同步状态
         */
        getSyncType() {
            return this.request
                .get('/workDept/getType');
        },
        /**
         * 变更同步状态
         * @param {Number} synchronizationType 0API同步 1上传数据
         */
        updateSynchronization(synchronizationType) {
            return this.request
                .post('/workDept/updateSynchronization')
                .query({synchronizationType});
        },
        /**
         * 查询属性/事件可见明细
         * @param {Number} tabType 1=属性 2=事件
         */
        getAttrEventShowDetail (tabType) {
            return this.request
                .get('/getAttrEventShowDetail')
                .query({tabType});
        },
        /**
         * 编辑属性/事件标签卡可见
         * @param {Number} tabType 1=属性 2=事件
         * @param depIds 部门id数组
         * @param userIds 员工id数组
         */
        updateTabShowDetail (tabType, depIds, userIds) {
            return this.request
                .post('/updateTabShowDetail')
                .send({tabType, depIds, userIds});
        },
        /**
         * 编辑属性/事件可见
         * @param {Number} tabType 1=属性 2=事件
         * @param depIds 部门id数组
         * @param userIds 员工id数组
         * @param attrEvents 属性/事件集合（支持批量编辑）
         */
        updateAttrEventShowDetail (tabType, depIds, userIds, attrEvents) {
            return this.request
                .post('/updateAttrEventShowDetail')
                .send({tabType, depIds, userIds, attrEvents});
        },
        /**
         * 查询属性/ 事件标签卡明细
         * @param {Number} tabType 1=属性 2=事件
         */
        getTabShowDetail (tabType) {
            return this.request
                .get('/getTabShowDetail')
                .query({tabType});
        },
        /**
         * 更新员工敏感信息发送应用消息
         * @param {String} employeeIds 员工userIds ","分隔, "all" 全选
         * @param {String} content 通知内容
         */
        updateStaffSensitiveInfo({employeeIds, content}) {
            return this.request
                .post('/updateStaffSensitiveInfo')
                .send({employeeIds, content});
        },
    }
});
