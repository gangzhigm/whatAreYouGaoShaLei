import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.WECHAT_API_BASE + '/api/wechat/v1',
    api: {
        /**
         * 同步粉丝
         * @param  {Number} accountId 公众号id
         */
        synCustomerFans (accountId) {
            return this.request
                .get('/synCustomerFans')
                .query({ id: accountId });
        },
        /**
         * 查看同步状态
         * @param {Number} accountId 公众号id
         */
        getRedisStatus (accountId) {
            return this.request
                .get('/getRedisStatus')
                .query({ id: accountId });
        },


        /**
        * --- START migrated from outdated src/ ---
        */
        /**
         * 微信粉丝
         * @param endDate
         * @param startDate
         *
         */
        fansReport (endDate, startDate) {
            return this.request
                .get('/fansReport/fansTrend')
                .query({ endDate, startDate });
        },

        /**
         * 粉丝行为分析
         * @param endDate
         * @param startDate
         */
        fansBehavior (endDate, startDate) {
            return this.request
                .get('/fansReport/fansBehavior')
                .query({ endDate, startDate });
        },

        /**
         * 粉丝来源
         */
        fansSource (endDate, officialId, startDate) {
            return this.request
                .get('/fansReport/fansSource')
                .query({ endDate, officialId, startDate });
        },

        /**
         * 1.1全部群发-日报-总报表统计
         * @param {Object} params {endDate:'2019-01-01',startDate:'2019-01-01'}
         */
        articleTitle (params) {
            let endDate = params.endDate;
            let startDate = params.startDate;
            return this.request
                .get('/datacube/articleTitle')
                .query({ endDate, startDate });
        },

        /**
         * 1.2全部群发-日报-图文分析
         * @param {Object} params {endDate:'2019-01-01',startDate:'2019-01-01'}
         */
        userReadAnalysis (params) {
            let endDate = params.endDate;
            let startDate = params.startDate;
            return this.request
                .get('/datacube/userReadAnalysis')
                .query({ endDate, startDate });
        },

        /**
         * 1.3全部群发-日报-阅读来源分析
         * @param {Object} params {endDate:'2019-01-01',startDate:'2019-01-01'}
         */
        articleUserReadSource (params) {
            let endDate = params.endDate;
            let startDate = params.startDate;
            return this.request
                .get('/datacube/articleUserReadSource')
                .query({ endDate, startDate });
        },

        /**
         * 1.4全部群发-日报-趋势图
         * @param {Object} params {endDate:'2019-01-01',startDate:'2019-01-01'}
         */
        articleUserReadTrend (params) {
            let endDate = params.endDate;
            let startDate = params.startDate;
            return this.request
                .get('/datacube/articleUserReadTrend')
                .query({ endDate, startDate });
        },
        /**
         * 1.5全部群发-日报-详细报表
         * @param obj
         */
        articleUserReadReport (obj) {
            return this.request
                .get('/datacube/articleUserReadReport')
                .query(obj);
        },
        /**
         * 2.1全部群发-小时报-图文分析
         * @param refDate
         */
        userReadHourAnalysis (refDate) {
            return this.request
                .get('/datacube/userReadHourAnalysis')
                .query({ refDate });
        },
        /**
         * 2.2全部群发-小时报-图文阅读来源
         * @param refDate
         */
        userReadSource (refDate) {
            return this.request
                .get('/datacube/userReadSource')
                .query({ refDate });
        },
        // /**
        //  * 2.3全部群发-小时报-趋势图
        //  * @param endDate
        //  * @param startDate
        //  */
        // userReadeHourTrend(endDate, startDate) {
        //     return this.request.get('/datacube/userReadeHourTrend').query({ endDate, startDate });
        // },
        /**
         * 2.4全部群发-小时报-详细报表
         * @param obj
         */
        userReadeHourReport (obj) {
            return this.request
                .get('/datacube/userReadeHourReport')
                .query(obj);
        },
        /**
         * 3.1单篇群发-图文标题列表
         * @param endDate
         * @param startDate
         */
        titles (endDate, startDate) {
            return this.request
                .get('/datacube/titles')
                .query({ endDate, startDate });
        },
        /**
         * 3.2单篇群发-总报表统计
         * @param {Object} params {refDate:'2019-01-01',msgid:'3123123_1''}
         */
        singleTitle (params) {
            let refDate = params.refDate;
            let msgid = params.msgid;
            return this.request
                .get('/datacube/singleTitle')
                .query({ refDate, msgid });
        },
        /**
         * 3.3单篇群发-图文分析
         * @param {Object} params {refDate:'2019-01-01',msgid:'3123123_1''}
         */
        singleAnalysis (params) {
            let refDate = params.refDate;
            let msgid = params.msgid;
            return this.request
                .get('/datacube/singleAnalysis')
                .query({ refDate, msgid });
        },
        /**
         * 3.4单篇群发-阅读来源
         * @param msgid
         */
        singleSource (msgid) {
            return this.request
                .get('/datacube/singleSource')
                .query({ msgid });
        },
        /**
         * 3.5单篇群发-趋势图
         * @param {Object} params {refDate:'2019-01-01',msgid:'3123123_1''}
         */
        singleTrend (params) {
            let refDate = params.refDate;
            let msgid = params.msgid;
            return this.request
                .get('/datacube/singleTrend')
                .query({ refDate, msgid });
        },
        /**
         * 3.6单篇群发-详细报表
         * @param obj
         */
        singleReport (obj) {
            return this.request
                .get('/datacube/singleReport')
                .query(obj);
        },

        /**
         * 微信：获取图文副本
         * @param id
         * @param journeyType
         */
        wechatImgTextCopy (id, journeyType) {
            return this.request
                .get(`/wxMaterialCopy/${id}`)
                .query({ journeyType });
        },

        /**
         * 获取 SCRM 中绑定的微信公众号列表
         * @param {number} type 类型(1.需要获取公众号粉丝总数及24小时互动粉丝数)不需要时此值可以不用传
         * @return {*}
         */
        getWechatAccounts (type) {
            return this.request
                .post(`/authorization/bindingList`)
                .query({ type });
        },

        /**
         * 绑定公众号 - 第 1 步
         * 获取二维码页面URL
         * @return {Request|*}
         */
        getAuthorizationUrl () {
            return this.request
                .post('/authorization/bindingUrl');
        },


        /**
         * 绑定公众号 - 第 2 步
         * 微信跳返本系统时，把参数通知到后台
         * @param queryStr
         * @param appType  //复用公众号-公众号扫码授权创建小程序，还是用公众号授权的那一套，需要改动的点如下，
         // 1：前端拼重定向地址时需要拼一个appType=3的参数，
         // 重定向到空白页调用/bindingRedirect接口时需要传appType=3，
         * @return {*}
         */
        pushAuthorizationParams (queryStr, appType) {
            return this.request
                .post('/authorization/bindingRedirect?' + queryStr)
                .query({appType});
        },


        /**
         * 绑定公众号 - 第 3 步
         * 获取刚刚绑定的公众号是否成功
         */
        subscriptionStatus () {
            return this.request
                .post('/authorization/bindingStatus');
        },


        /**
         * 获取所有的微信公众号，绑定+未绑定
         * 公众号id，公众号名称，公众号图标，授权方公众号类型，授权方认证类型，粉丝总数，四十八小时互动粉丝总数，绑定状态
         * @return {*}
         */
        getAccounts (pageNumber) {
            return this.request
                .post('/authorization/allList')
                .query({ pageNumber });
        },

        /**
         * 获取微信公众号状态和更新时间
         * @return {*}
         */
        getAuthorization () {
            return this.request
                .get('/authorization/getAuthorization');
        },
        /**
         * 解绑公众号
         * @params id 公众号id
         */
        unbindQrCode (id) {
            return this.request
                .delete('/unbindQrCode')
                .query({ id });
        },
        /**
         * 获取公司已绑定的公众号
         */
        isBindWeChat () {
            return this.request
                .get('/getAllwechatList');
        },

        modifyRemark (
            city, country, interaction, language, nickName,
            pageNumber, province, sex, subscribe, subscriberDate, tagIds
        ) {
            return this.request
                .get('/customers')
                .query({
                    city: city,
                    country: country,
                    interaction: interaction,
                    language: language,
                    nickName: nickName,
                    pageNumber: pageNumber,
                    province: province,
                    sex: sex,
                    subscribe: subscribe,
                    subscriberDate: subscriberDate,
                    tagIds: tagIds
                });
        },


        /**
         *
         * 获取国家列表
         */
        getCountryList () {
            return this.request
                .get('/getCountryList');
        },


        /**
         *
         * 获取省市列表
         * @param country
         */
        getProvinceList (country) {
            return this.request
                .get('/getProvinceList')
                .query({ country });
        },


        /**
         *
         * 获取城市列表
         * @param province
         */
        getCityList (province) {
            return this.request
                .get('/getCityList')
                .query({ province });
        },


        /**
         * 获取筛选后的粉丝数量
         * @param nickName
         * @param city
         * @param country
         * @param interaction
         * @param language
         * @param openIds
         * @param province
         * @param sex
         * @param subscribe
         * @param subscriberDate
         * @param swarmId
         * @param tagList
         * @param type
         * @return {*}
         */
        tagContactCount (
            nickName, city, country, interaction, language, openIds, province, sex,
            subscribe, subscriberDate, swarmId, tagList, type
        ) {
            return this.request
                .post(`/tags/getSwarmFansCount`)
                .send(
                    {
                        nickName: nickName,
                        city: city,
                        country: country,
                        interaction: interaction,
                        language: language,
                        openIds: openIds,
                        province: province, sex: sex, subscribe: subscribe, subscriberDate: subscriberDate,
                        swarmId: swarmId,
                        tagList: tagList,
                        type
                    }
                );
        },


        /**
         * 获取筛选后的标签
         * @param openIds
         * @param type
         * @param officialId    公众号id
         */
        getTagList (openIds, type, officialId) {
            return this.request
                .get('/tagList')
                .query({
                    openIds,
                    type,
                    officialId
                });
        },

        /**
         * 获取筛选后的标签
         * @param openIds
         * @param type
         */
        getJourneyTagList (openIds, type, wechatId) {
            if (wechatId) {
                return this.request
                    .get('/tagListForJourney')
                    .query({
                        openIds,
                        type
                    })
                    .set('wechat_id', wechatId);
            }
            return this.request
                .get('/tagListForJourney')
                .query({
                    openIds,
                    type
                });
        },

        /**
         * 为联系人批量打标签
         * @param nickName
         * @param city
         * @param country
         * @param interaction
         * @param language
         * @param openIds
         * @param province
         * @param sex
         * @param subscribe
         * @param subscriberDate
         * @param swarmId
         * @param tagIds
         * @param tagList
         * @param {Number} type 0-没有全选,上传被选中对象; 1-全选,上传没有选中对象
         */
        saveUserTags (
            nickName, city, country, interaction, language, openIds, province, sex,
            subscribe, subscriberDate, swarmId, tagIds, tagList, type
        ) {
            return this.request
                .post('/tags/saveUserTags')
                .send({
                    nickName: nickName,
                    city: city,
                    country: country,
                    interaction: interaction,
                    language: language,
                    openIds: openIds,
                    province: province,
                    sex: sex,
                    subscribe: subscribe,
                    subscriberDate: subscriberDate,
                    swarmId: swarmId,
                    tagIds: tagIds,
                    tagList: tagList,
                    type
                });
        },


        /**
         * 为联系人批量打标签
         * @param nickName
         * @param city
         * @param country
         * @param interaction
         * @param language
         * @param openIds
         * @param province
         * @param sex
         * @param subscribe
         * @param subscriberDate
         * @param swarmId
         * @param tagIds
         * @param tagList
         * @param type
         */
        cancelTags (
            nickName, city, country, interaction, language, openIds, province,
            sex, subscribe, subscriberDate, swarmId, tagIds, tagList, type
        ) {
            return this.request
                .post('/tags/cancelTag')
                .send({
                    nickName: nickName,
                    city: city,
                    country: country,
                    interaction: interaction,
                    language: language,
                    openIds: openIds,
                    province: province,
                    sex: sex,
                    subscribe: subscribe,
                    subscriberDate: subscriberDate,
                    swarmId: swarmId,
                    tagIds: tagIds,
                    tagList: tagList,
                    type
                });
        },

        deleteTagList (
            city, country, interaction, language, nickName, openIds,
            province, sex, subscribe, subscriberDate, tagIds
        ) {
            return this.request
                .get('/tags/deleteTags')
                .query({
                    city: city,
                    country: country,
                    interaction: interaction,
                    language: language,
                    nickName: nickName,
                    openIds: openIds,
                    province: province, sex: sex, subscribe: subscribe, subscriberDate: subscriberDate, tagIds: tagIds,
                });
        },

        /**
         * 批量获取粉丝头像和昵称
         * @param {String} openIds 粉丝openID集合
         */
        getUserBasic (openIds) {
            return this.request
                .get('/getHeadUrls')
                .query({ openIds });
        },

        /**
         * 获取本公司所有粉丝标签未完成添加进度
         */
        getProgress () {
            return this.request
                .get('/fansLabelProgressLog/getProgress');
        },

        /**
         * 获取所有粉丝标签历史操作记录
         * @param pageNumber
         * @param pageSize
         * @return {*}
         */
        getLog (pageNumber, pageSize = 10) {
            return this.request
                .get('/fansLabelProgressLog/getAllLogsByOfficialId')
                .query({
                    pageNumber,
                    pageSize
                });
        },

        /**
         * 根据记录id获取错误信息
         */
        getErrorMessage (query) {
            return this.request
                .get('/fansLabelProgressLog/getErrorMessageByLogId')
                .query(query);
        },
        /**
         * 获取粉丝标签列表
         */
        getFansTags (pageNumber, searchName) {
            return this.request
                .get('/tagListByPage')
                .query({ pageNumber, searchName });

        },
        /**
         * 编辑粉丝标签
         * name 标签名称
         */
        editFansTag (id, name) {
            return this.request
                .put(`/tags/${id}`)
                .send({ name });
        },
        /**
         * 导出全量粉丝
         * @param {*邮箱} email
         * @param {*数据格式} dataFormat
         * @param {*主题} emailSubject
         * @returns
         */
        exportAllfans ({ email, dataFormat, emailSubject }) {
            return this.request.get('/exportAllFans').query({ email, dataFormat, emailSubject });
        },
        /**
         * 查看同步状态
         * @returns
         */
        getExportFans () {
            return this.request.get('/getExportFans');
        },
        /**
        * 查询是否有同步粉丝属性任务正在进行
        * @param
        */
        getSyncFansStatus () {
            return this.request
                .get('/getSyncFansStatus');
        },
        /**
        * 确定同步粉丝属性
        * @param sysTime {@date('yyyy-MM-dd HH:mm')}
        */
        syncFansAttribute (sysTime) {
            return this.request
                .post('/syncFansAttributes')
                .send({ sysTime });
        },
        /**
        * 取消同步粉丝属性任务
        * @param
        */
        delSyncFansTask (id) {
            return this.request
                .del('/deleteSyncFansTask')
                .query({ id });
        },
        /**
         * 同步粉丝标签
         */
        syncFansTag () {
            return this.request
                .get('/tags/synchronization');
        },
        /**
         * 粉丝标签同步状态
         */
        getSynStatus () {
            return this.request
                .get('/tag/getSynStatus');
        },
        /**
         * 判断控件中粉丝标签是否存在
         * @param {Number} labelId 粉丝标签Id
         */
        checkFanLabel (labelId) {
            return this.request
                .get('/judgeLabelInformation')
                .query({
                    labelId: labelId
                });
        },

        /**
         * 获取联系人列表
         * @param pageNumber
         * @param subscribe
         * @return {*|Request}
         */
        getUsersdel (pageNumber, subscribe) {
            return this.request
                .get(`/customers`)
                .query({
                    pageNumber,
                    subscribe,
                });
        },


        /**
         * 添加分组
         * @param officialId 公众号Id
         * @param name
         * @param remark
         * @return {*|Request}
         */
        addTag (name, remark, officialId) {
            return this.request
                .post(`/tags`)
                .query({ officialId })
                .send({
                    name,
                    remark
                });
        },


        /**
         * 删除粉丝标签
         * @param id
         * @param officialId
         * @return {*}
         */
        removeTag (id, officialId) {
            return this.request
                .del(`/tags/${id}`)
                .query({ officialId });
        },


        /**
         * 获取粉丝标签列表
         * @param authorizerInfoId
         */
        getTags (authorizerInfoId) {
            return this.request
                .get('/tags')
                .query({ authorizerInfoId });
        },


        /**
         * 修改备注
         * @param remark
         * @param id
         * @return {*|Request}
         */
        updateCustomer (remark, id) {
            return this.request
                .post(`/customers/modifyRemark`)
                .send({
                    id,
                    remark
                });
        },


        /**
         * 给联系人修改标签
         * @param tagIds
         * @param id
         * @return {*|Request}
         */
        updateCustomerTag (tagIds, id) {
            return this.request
                .post(`/customers/saveUserTag/${id}`)
                .send({
                    tagIds
                });
        },


        /**
         * 修改标签名称
         * @param name
         * @param id
         * @return {*|Request}
         */
        updateTagName (name, id) {
            return this.request
                .put(`/tags/${id}`)
                .send({
                    name
                });
        },


        /**
         * 获取公司下的全部订阅联系人数量
         */
        getAllTagsCount () {
            return this.request
                .get('/getAllTagsCount');
        },


        /**
         * 更新一个联系人的微信粉丝标签
         * @param tagIds
         * @param openid
         * @param officialId 公众号id
         * @return {*}
         */
        updateCustomerWeChatTag (tagIds, openid, officialId, type) {
            return this.request
                .post('/tags/saveTagsByOpenid')
                .query({ officialId, type })
                .send({
                    tagIds,
                    openid
                });
        },

        /**
         * 移除一个联系人的微信粉丝标签
         * @param tagId
         * @param openid
         * @param officialId
         * @return {*}
         */
        removeCustomerWeChatTag (tagId, openid, officialId) {
            return this.request
                .del('/tags/deleteTagsByOpenid')
                .query({ officialId })
                .send({
                    tagId,
                    openid,
                });
        },

        /**
         * 群发消息 - 获取已发送消息
         * @param pageNumber
         * @param sendStatus
         * @return {*|Request}
         */
        getSentMsg (query) {
            return this.request
                .get(`/massMessages`)
                .query(query);
        },

        /**
         * 分页查询客服消息
         * @param {*|keywords} String
         * @param {pageNumber} Number
         */
        getCustomerMsg (query) {
            return this.request
                .get('/interactionSend')
                .query(query);
        },

        /**
         * 客服消息-根据id删除
         */
        deleteCustomerMsg (msgId) {
            return this.request
                .del(`/interactionSend/${msgId}`);
        },

        /**
         *  模板消息 - 分页查询模板消息列表
         *  @param {officialId} 公众号ID
         *  @param {pageNo} 页码
         *  @param {pageSize} 每页条数
         *  @param {sort} Number 1 升序 2降序
         *  tip: 类型全部为 Number
         */
        getTemMsgList (query) {
            return this.request
                .get('/wxTemplateSend/templateSends')
                .query(query);
        },

        /**
         * 重新发送消息
         * template/resend
         * @param {id} 发送信息id
         * @param {sendStatus} 发送状态 0立即发送 1定时发送
         * @param {sendTime} 发送时间 String
         */
        sendTimingMsg (data) {
            return this.request
                .post('/templateResend')
                .send(data);
        },

        /**
         * 删除模板消息
         * @param id
         */
        deleteTemMsg (id) {
            return this.request
                .del(`/wxTemplateSend/wxTemplateSend/delete/${id}`);
        },

        /**
         * 新增群发消息
         * @param materialId
         * @param materialType
         * @param sendDate
         * @param tagId
         * @param text
         * @param groupSending 非原创图文消息 1：继续发送 0：停止发送
         * @return {*|Request}
         */
        createSentMsg ({ materialId, materialType, sendDate, tagId, text, sendIgnoreReprint }) {
            let msgType;
            if (materialType === 4) {               // 图文
                msgType = 5;
            } else if (materialType === 'text') {   // 文本
                msgType = 4;
            } else {                                // 其他素材
                msgType = materialType;
            }
            return this.request
                .post(`/massMessages`)
                .send({
                    materialId,
                    msgtype: msgType,       // 群发类型:1-image;2-voice;3-video;4-text;5-news(图文)
                    sendDateString: sendDate,
                    tagId,
                    text,
                    sendIgnoreReprint
                });
        },


        /**
         * 客服消息
         * @param id
         * @param type
         * @param startDate
         * @param tagId
         * @param content
         * @param {object} menuMessage 菜单消息类型参数
         * @return {*}
         */
        createServiceMsg ({ id, type, startDate, tagId, content,
            externalTitle, externalImageUrl, externalUrl,
            externalDescription, formReplyType, sheetContent,
            sheetUrl, sheetId, extensionValueId, pagePath,
            miniprogramAppid, miniprogramTitle, menuMessage, formName, formExtensionValue }) {
            let msgType;
            // 接口接收type定义：1.图片 2.音频 3.视频 4.文本 5.图文消息 6.外部页 7.跳转表单 8.小程序卡片 9.菜单消息
            if (type === 4) {               // 图文
                msgType = 5;
            } else if (type === 'text') {   // 文本
                msgType = 4;
            } else {                                // 其他素材
                msgType = type;
            }
            return this.request
                .post(`/interactionSend`)
                .send({
                    id,
                    type: msgType,       // 群发类型:1-image;2-voice;3-video;4-text;5-news(图文) 6-外部页7-跳转表单，8-小程序卡片，9-菜单消息
                    startDate: startDate,
                    tagId,
                    content,
                    externalTitle, //【6.外部页/7.表单外部页】外部页标题
                    externalImageUrl, //【6.外部页/7.表单外部页】外部页图片url
                    externalUrl, //【6.外部页/7.表单外部页】外部页链接
                    externalDescription, //【6.外部页/7.表单外部页】外部页描述
                    formReplyType, //【7.表单】表单回复类型(external:外部页  sheet:表单)
                    sheetContent, //【7.表单】表单回复文本内容
                    sheetUrl,//【7.表单】表单链接(表单文本内容为空时回复此表单链接)
                    sheetId, //【7.表单】表单id，用于回显
                    extensionValueId, //【7.表单】表单扩展链接id，用于回显
                    pagePath, //【8.小程序卡片 】小程序卡片路径
                    miniprogramAppid,//【8.小程序卡片 】小程序卡片appid
                    miniprogramTitle, //【8.小程序卡片 】小程序卡片标题
                    menuMessage, // Object类型//【9.菜单消息】菜单消息
                    formName, //表单跳转外部页-表单名称
                    formExtensionValue, //表单跳转外部页-表单扩展值
                });
        },


        /**
         * 发送模板消息
         * @param groupId
         * @param sendDate
         * @param status
         * @param wxTemplateId
         * @return {*}
         */
        createModalMsg ({ groupId, sendDate, status, wxTemplateId }) {
            return this.request
                .post(`/sendTemplate`)
                .send({
                    groupId,
                    sendDate,
                    status,
                    wxTemplateId
                });
        },


        /**
         * 删除已发送消息
         * @param msgId
         * @return {*|Request}
         */
        delSentMsg (msgId) {
            return this.request
                .del(`/massMessages/${msgId}`);
        },
        /**
         * @description: 根据msgId删除群发消息
         * @param {string} msgId
         * @param {number} deleteAll
         * @param {array} getArticleIdxs
         * @return {request}
         */
        deleteMassMessage (msgId, deleteAll, articleIdxs) {
            return this.request
                .del(`/deleteMassMessage`)
                .send({
                    msgId,
                    deleteAll,
                    articleIdxs
                });
        },
        /**
         * @description: 根据群发id查询素材信息、删除子图文序号
         * @param {number} id
         * @return {request}
         */
        getMassMaterial (id) {
            return this.request
                .get(`/getMassMaterial`)
                .query({ id });
        },

        /**
         * 获取素材列表
         * @param keyword
         * @param pageNumber
         * @param status 素材是否同步到微信（1.只查询同步到微信的素材）
         * @param type 1 for 图片, 2 for 语音, 3 for 视频， 5 for 图文
         * @param sort
         * @param {Boolean} noSubMaterials 图文是否是多图文（true:只查询图文数目是 1 条的图文）
         * @param {Number} officialId 公众号id,若不传则默认从请求头中取公众号信息
         * @param {Number} videoType 1为全部审核过的视频素材(使用视频素材的模块需要有)
         * @param {Number} mpnewsType 图文类型（1.草稿 2.已发布图文）
         */
        getMaterials (keyword = '', pageNumber = 1, type, status = null, sort, noSubMaterials, officialId, videoType, mpnewsType) {
            return this.request
                .get('/materials')
                .query({
                    keyword,
                    pageNumber,
                    type,
                    status,
                    sort,
                    news: noSubMaterials ? 1 : 0,
                    officialId,
                    videoType,
                    mpnewsType
                });
        },


        /**
         * 批量获取微信图文素材内容，主素材的预览图
         * @param materialIds 素材id [1,2,3]
         */
        getWechatMaterialsByIds (materialIds) {
            return this.request
                .get('/getThumbMediaUrl')
                .query({
                    materialIds
                });
        },


        //播放语音
        getVoice (accessTokens, id) {
            return this.request
                .get(`https://api.weixin.qq.com/cgi-bin/media/get`)
                .query({ access_token: accessTokens, media_id: id });

        },

        /**
         * 同步素材
         */
        syncMaterials (startDate) {
            return this.request
                .get('/materials/synMaterial')
                .query({
                    startDate
                });
        },


        /**
         * 获取同步状态
         */
        checkSynStatus () {
            return this.request
                .get('/materials/checkSynStatus');
        },


        /**
         * 获取单个素材
         * @param id
         */
        getMaterial (id) {
            return this.request
                .get(`/materials/${id}`);
        },

        /**
         * 已发布素材转为草稿，并获取详情；
         * @param id
         */
        convertToDraft (id) {
            return this.request
                .post(`/convertToDraft?id=${id}`);
        },

        /**
         * 删除素材
         * @param id
         * @param delType 删除类型（1.删除草稿 2.删除已发布图文 其他：删除图片/音频/视频等素材）
         * @return {*|Request}
         */
        delMaterial (id, delType) {
            return this.request
                .del(`/materials/${id}`)
                .query({delType: delType});
        },


        /**
         * 批量删除素材
         * @param {Array<String>} ids
         * @return {*|Request}
         */
        delMaterials (ids) {
            return this.request
                .del(`/materials`)
                .send({ ids });
        },


        /**
         * 图文素材
         * 创建一个主素材
         * @return {Request|*}
         */
        createMainMaterial () {
            return this.request
                .post('/materials');
        },


        /**
         * 图文素材
         * 创建一个子素材
         * @param ownerId
         */
        createSubMaterial (ownerId) {
            return this.request
                .post('/materialItems')
                .type('form')
                .send({ ownerId });
        },


        /**
         * 图文素材添加视频
         * @param link
         * @returns {*|Request}
         */
        postVideoUrl (link) {
            return this.request
                .get('/materials/judgeLink')
                .query({ link });
        },


        /**
         * 图文素材
         * 保存一个子(主)素材
         * @param material
         * @return {*|Request}
         */
        saveImgTextMaterial (material) {
            return this.request
                .put(`/materials`)
                .send(material);
        },


        /**
         * 图文素材
         * 删除一个子素材
         * @param id
         */
        delSubMaterial (id) {
            return this.request
                .del(`/materialItems/${id}`);
        },


        /**
         * 图文素材
         * 子素材排序
         * @param top
         * @param down
         */
        sortSubMaterials (top, down) {
            return this.request
                .post('/materials/sortNews')
                .type('form')
                .send({
                    firstId: top.id,
                    firstSort: top.sort,
                    secondId: down.id,
                    secondSort: down.sort
                });
        },


        /**
         * 图文素材
         * 同步多图文素材到微信
         * @param ownerId
         */
        syncImgTextToWechat (ownerId) {
            return this.request
                .post('/materials/materialToWechat')
                .type('form')
                .send({ ownerId });
        },

        /**
         * 添加图片素材
         * @param file
         * @param fileName
         * @param type
         * @param {number} officialId
         * @return {*|Request}
         */
        uploadImg (file, type, fileName, officialId) {
            const params = { type, fileName };
            if (officialId) {
                params.officialId = officialId;
            }
            return this.request
                .post(`/materials/others`)
                .attach('file', file)
                .field(params);
        },

        /**
         * 添加语音
         * @param type
         * @param file
         * @param fileName
         * @param {number} officialId
         * @return {*|Request}
         */
        createAudio (file, type, fileName, officialId) {
            const params = { type, fileName };
            if (officialId) {
                params.officialId = officialId;
            }
            return this.request
                .post(`/materials/others`)
                .attach('file', file)
                .field(params);
        },


        /**
         * 编辑视频
         * @param name
         * @param instroduction
         * @param id
         * @return {*|Request}
         */
        editVideo (instroduction, name, id) {
            return this.request
                .put(`/materials/video/${id}`)
                .send({ name })
                .send({ instroduction });
        },


        /**
         * 添加视频
         * @param type
         * @param name
         * @param instroduction
         * @param file
         * @param fileName
         * @param officialId 公众号id,若不传则默认从请求头中取公众号信息
         * @return {*|Request}
         */
        createVideo (instroduction, file, name, type, fileName, officialId) {
            const params = { type, name, instroduction, fileName };
            if (officialId) {
                params.officialId = officialId;
            }
            return this.request
                .post(`/materials/others`)
                .attach('file', file)
                .field(params);
        },


        /**
         * 消息管理
         * 获取全部消息
         * @param startDate
         * @param endDate
         * @param customerId
         * @param hideKeyWord
         * @param keyword
         * @param pageNumber
         * @param nickName
         */
        getAllMsg (startDate, endDate, customerId, hideKeyWord, keyword, pageNumber, nickName) {
            return this.request
                .get(`/messages`)
                .query({
                    startDate,
                    endDate,
                    customerId,
                    hideKeyWord,
                    keyword,
                    pageNumber,
                    nickName
                });
        },

        /**
         * 发送消息
         * @param msgId
         * @param openid
         * @param text
         * @param type
         * @returns {*|Request}
         */
        sendMsg (msgId, openid, text, type) {
            return this.request
                .post('/messages')
                .send({
                    msgId,
                    openid,
                    text,
                    type
                });
        },


        /**
         * 发送粉丝消息文字
         * @return {*|Request}
         */
        sendFansMsg (obj) {
            return this.request
                .post(`/messages`)
                .send(obj);
        },

        /**
         * 获取关键字列表
         * @param pageNumber
         * @param keyword
         * @return {*|Request}
         */
        getKeywordReply (pageNumber, keyword) {
            return this.request
                .get(`/keyWords/get`)
                .query({
                    pageNumber,
                    keyword
                });
        },


        /**
         * 保存关键字列表
         * @param content
         * @param keyWordItemNames
         * @param materialIds【图片/音频/视频/图文】回复素材id列表
         * @param patterns
         * @param ruleName
         * @param recoilType
         * @params keyWordContentIds 【表单/外部页/小程序卡片/菜单消息】回复内容id列表
         * @return {*|Request}
         */
        saveKeywordReply (content, keyWordItemNames, materialIds, patterns, ruleName, recoilType, keyWordContentIds) {
            return this.request
                .post(`/keyWords/save`)
                .send({
                    content,
                    keyWordItemNames,
                    materialIds,
                    patterns,
                    ruleName,
                    recoilType,
                    keyWordContentIds
                });
        },


        /**
         * 修改关键字列表
         * @param id
         * @param content
         * @param keyWordItemNames
         * @param materialIds
         * @param patterns
         * @param ruleName
         * @param recoilType
         * @param keyWordContentIds
         * @return {*|Request}
         */
        updateKeywordReply (
            id, content, keyWordItemNames,
            materialIds, patterns, ruleName,
            recoilType, keyWordContentIds) {
            return this.request
                .put(`/keyWords/update`)
                .send({
                    content,
                    keyWordItemNames,
                    materialIds,
                    patterns,
                    ruleName,
                    recoilType,
                    keyWordContentIds
                })
                .query({ id });
        },

        /**
         * 删除关键字列表
         * @param id
         * @return {*|Request}
         */
        delKeywordReply (id) {
            return this.request
                .del(`/keyWords/delete`)
                .query({ id });
        },


        /**
         * 微信图文客服测试
         * @param {object} params 测试参数对象
         * @param {number} materialId, 素材id，type=1, 2, 3, 5时传素材id，type=8时为小程序封面素材id, 其他情况为0或null
         * @param {array} openIds 发送对象openid数组 最多十人
         * @param {number} officialId  公众号id
         * @param {number} type 微信素材类型 1.图片 2.音频 3.视频 4.文字 5.图文消息 6.外部页 7.跳转表单 8.小程序卡片
         * @param {string} wxContext 文字内容 type=4 文本框内容;type=7 (文字类型) 使用
         * @param {string} webUrl 链接 仅限type=6, 7(web) 使用
         * @param {string} title 标题 仅限type=6, 7(web), 8 使用
         * @param {string} description  描述 仅限type=6, 7(web)使用
         * @param {string} picUrl 封面图url 仅限type=6, 7(web)使用
         * @param {number} formType 表单回复类型 3=文字，4=web页 仅限type=7 使用
         * @param {string} replyString 回复文字，仅限type=7且为文字类型使用
         * @param {string} miniAppId 小程序的appid, 仅限type=8使用
         * @param {string} pagePath 小程序的页面路径，仅限type=8使用
         */
        messageSendsTestByWechat (params) {
            return this.request
                .post('/messageSendsTestByWechat')
                .send(params);
        },


        /**
         * 图文素材微信预览图片
         * @param content
         */
        previewPicture (content) {
            return this.request
                .get('/previewPictures')
                .query({ content });
        },


        /**
         * 下载CSV
         * @param obj

         */
        downloadCSV (obj) {
            return this.request
                .post('/downloadCsv')
                .send(obj);
        },

        /**
         * 自定义菜单
         * 获取自定义菜单列表
         * @return {*|Request}
         */
        getMenus () {
            return this.request
                .get(`/menus`);
        },

        /**
         * 自定义菜单
         * 保存自定义菜单
         * @param menu optional for creation
         * @return {*|Request}
         */
        saveMenu (menu) {
            return this.request
                .post(`/menus`)
                .send(menu);
        },

        /**
         * 自定义菜单
         * 删除自定义菜单/删除个性化菜单
         * @param menuId
         * @return {*|Request}
         */
        delMenu (menuId) {
            return this.request
                .del(`/menus/${menuId}`);
        },


        /**
         * 自定义菜单
         * 自定义菜单排序
         * @param menuSort
         */
        sortMenu (menuSort) {
            return this.request
                .post('/menus/sort')
                .send(menuSort);
        },


        /**
         * 自定义菜单
         * 自定义菜单同步到微信
         * @return {*|Request}
         */
        syncToWeChat () {
            return this.request
                .post(`/menus/menuToWechat`);
        },


        /**
         * 自定义菜单
         * 同步微信自定义菜单到本地
         * @return {*|Request}
         */
        syncToLocal () {
            return this.request
                .get(`/menus/wechatToMenu`);
        },


        /**
         * 个性化菜单
         * 获取个性化菜单的规则列表
         */
        getRules (obj) {
            return this.request
                .get('/menus/menuMatchRule')
                .query(obj);
        },

        /**
         * 个性化菜单
         * 删除规则
         * @param id
         */
        delRule (id) {
            return this.request
                .delete('/menus/menuMatchRule')
                .query({ id });
        },


        /**
         * 个性化菜单
         * @param menuMatchRuleId
         */
        getMenusOfRule (menuMatchRuleId) {
            return this.request
                .get('/menus/individuation')
                .query({ id: menuMatchRuleId });
        },


        /**
         * 个性化菜单
         * 保存菜单
         * @param menu
         */
        saveRuleMenu (menu) {
            return this.request
                .post('/menus/individuation')
                .send(menu);
        },

        /**
         * 个性化菜单排序
         * @param menuMatchRuleId 菜单规则id
         * @param menuSort
         */
        sortRuleMenu (obj) {
            return this.request
                .post('/menus/menuMatchRuleSort')
                .send(obj);
        },


        /**
         * 同步一个 规则（个性化菜单）到微信
         * @param menuMatchRuleId
         */
        syncOneRuleToWechat (menuMatchRuleId) {
            return this.request
                .post('/individuation')
                .type('form')
                .send({
                    menuMatchRuleId
                });
        },

        /**
         * 修改menu规则
         * id
         * country 城市
         * province 省份
         * city 城市
         * clientplatformtype 系统类型
         * language 语言
         * sex 性别
         * tagId 标签id
         * title 标题name
         */
        putMenuRule (rule) {
            return this.request
                .put('/menus/menuMatchRule')
                .send(rule);
        },

        //获取单个规则详情
        menuMatchRuleOne (menuMatchRuleId) {
            return this.request
                .get('/menus/menuMatchRuleOne')
                .query({ menuMatchRuleId });

        },

        //获取地区list
        getAllCountryList () {
            return this.request
                .get('/getAllCountryList');
        },

        // 同步微信个性化菜单
        getAllIndividuation () {
            return this.request
                .get('/getAllIndividuation');
        },

        /**
         * 获取二维码分组
         */
        getSubscriptionGroup ({ sortType }) {
            return this.request
                .get('/quickMarkGroups/getGroupList')
                .query({
                    sortType
                });
        },


        /**
         * 二维码分组列表
         */
        getQuickMarkList () {
            return this.request
                .get('/quickMarkGroups/groupsAndQuickMark');
        },


        /**
         * 删除分组
         * @param id
         * @return {*|Request}
         */
        delGroup (id) {
            return this.request
                .del(`/quickMarkGroups/${id}`);
        },


        /**
         * 新增分组
         * @param id
         * @param name
         * @param parentId
         */
        saveOrUpdate ({ id, name, parentId }) {
            return this.request
                .post(`/quickMarkGroups/saveOrUpdate`)
                .send({
                    id, name, parentId
                });
        },

        /**
         * 获取二维码列表
         * @param keyword
         * @param pageNumber
         * @param groupId
         */
        getSubscriptionList({keyword, pageNumber, groupId, wechatId, sortValue, sortOrder, rows}) {
            if (wechatId) {
                return this.request
                    .get(`/quickMarks`)
                    .query({
                        keyword,
                        pageNumber,
                        groupId,
                    })
                    .set('wechat_id', wechatId);
            }
            return this.request
                .get(`/quickMarks`)
                .query({
                    keyword,
                    pageNumber,
                    groupId,
                    sortValue,
                    sortOrder,
                    rows
                });
        },


        /**
         * 获取二维码详情
         * @param id
         */
        getSubscriptionDetail (id) {
            return this.request
                .get(`/quickMarks/get`)
                .query({ id });
        },


        /**
         * 上传批量二维码文件
         * @param file
         */
        uploadFile (file) {
            return this.request
                .post(`/quickMarks/uploadExcel`)
                .attach('file', file);
        },


        /**
         * 更新二维码
         * @param id
         * @param name
         * @param createType        创建类型（单个/批量）
         * @param quickMarkGroups   二维码分组（数组）
         * @param fileName          文件名称
         * @param contactFilters    会员标签（数组）
         * @param reply             回复内容
         * @param replyType         回复类型
         * @param tags              粉丝标签（数组）
         * @param type              二维码类型
         * @param externalImageUrl  外部页图片Url
         * @param externalTitle     外部页标题
         * @param externalDescription     外部页描述
         * @param externalUrl       外部页链接
         * @param sheetContent      如果选择表单，则为必填项，回复文字
         * @param customSheetUrl    自定义表单 表单链接
         * @param customFormId
         * @param extensionValueId  历史表单扩展项id
         * @param formReplyType
         * @param materialId
         * @param {object} menuMessage 菜单消息类型参数
         * @param sheetUrl 表单链接
         * @param newExtensionValueId 表单扩展项id
         * @param newSheetId 表单id
         * @param miniprogramAppid 小程序appid
         * @param miniprogramTitle 小程序名称
         * @param pagePath 小程序路径
         *
         */
        updateSubscription (
            {
                id, name, quickMarkGroups, fileName, contactFilters, reply,
                replyType, tags, type, externalImageUrl, externalTitle, externalDescription, externalUrl,
                sheetContent, sheetUrl, customSheetUrl, customFormId, extensionValueId, formReplyType,
                materialId, menuMessage, newExtensionValueId, newSheetId, miniprogramAppid, miniprogramTitle, pagePath,
                miniprogramId
            }
        ) {
            return this.request
                .put(`/quickMarks`)
                .send({
                    id,
                    name,
                    quickMarkGroups,
                    fileName,
                    contactFilters,
                    reply,
                    replyType,
                    tags,
                    type,
                    externalImageUrl,
                    externalTitle,
                    externalDescription,
                    externalUrl,
                    sheetContent,
                    sheetUrl,
                    customSheetUrl,
                    customFormId,
                    extensionValueId,
                    formReplyType,
                    materialId,
                    menuMessage,
                    newExtensionValueId,
                    newSheetId,
                    miniprogramAppid,
                    miniprogramTitle,
                    pagePath,
                    miniprogramId
                });
        },


        /**
         * 新增二维码
         * @param name
         * @param createType        创建类型（单个/批量）
         * @param quickMarkGroups   二维码分组（数组）
         * @param fileName          文件名称
         * @param contactFilters    会员标签（数组）
         * @param reply             回复内容
         * @param replyType         回复类型
         * @param tags              粉丝标签（数组）
         * @param type              二维码类型
         * @param externalImageUrl  外部页图片Url
         * @param externalTitle     外部页标题
         * @param externalDescription     外部页描述
         * @param externalUrl       外部页链接
         * @param sheetContent      如果选择表单，则为必填项，回复文字
         * @param customSheetUrl    自定义表单 表单链接
         * @param customFormId
         * @param extensionValueId  历史表单扩展项id
         * @param formReplyType
         * @param materialId
         * @param {object} menuMessage 菜单消息类型参数
         * @param sheetUrl 表单链接
         * @param newExtensionValueId 表单扩展项id
         * @param newSheetId 表单id
         * @param miniprogramAppid 小程序appid
         * @param miniprogramTitle 小程序名称
         * @param pagePath 小程序路径
         * @return {Request|*}
         */
        addAubscription (
            {
                name, createType, quickMarkGroups, fileName, contactFilters, reply, replyType, tags, type,
                externalImageUrl, externalTitle, externalDescription, externalUrl, sheetContent, sheetUrl,
                customSheetUrl, customFormId, extensionValueId, formReplyType, materialId, menuMessage,
                newExtensionValueId, newSheetId, miniprogramAppid, miniprogramTitle, pagePath, miniprogramId
            }) {
            return this.request
                .post(`/quickMarks`)
                .send({
                    name,
                    createType,
                    quickMarkGroups,
                    fileName,
                    contactFilters,
                    reply,
                    replyType,
                    tags,
                    type,
                    externalImageUrl,
                    externalTitle,
                    externalDescription,
                    externalUrl,
                    sheetContent,
                    sheetUrl,
                    customSheetUrl,
                    customFormId,
                    extensionValueId,
                    formReplyType,
                    materialId,
                    menuMessage,
                    newExtensionValueId,
                    newSheetId,
                    miniprogramAppid,
                    miniprogramTitle,
                    pagePath,
                    miniprogramId,
                });
        },


        /**
         * 批量删除二维码
         * @param quickMarkIds
         * @return {*|Request}
         */
        bulkDelSubscription (quickMarkIds) {
            return this.request
                .del(`/quickMarks/deleteMany`)
                .send(
                    quickMarkIds
                );
        },


        /**
         * 获取粉丝列表
         * @param pageNumber
         * @param quickMarkId
         * @param type
         */
        getFansList ({ pageNumber, quickMarkId, type }) {
            return this.request
                .get(`/quickMarkItems`)
                .query({
                    pageNumber,
                    quickMarkId,
                    type
                });
        },

        /**
         * 批量下载二维码
         * @param quickMarkIds
         * @param width
         * @param height
         * @param downloadType
         *
         */
        batchDownloadQRCode({ quickMarkIds, width, height, downloadType }) {
            return this.request
                .post(LINKS.WECHAT_API_BASE + `/api/web-api/wechat/v1/quickMarks/batchDownloadQRCode`)
                .send({
                    quickMarkIds,
                    width,
                    height,
                    downloadType
                })
                .responseType('blob');
        },

        /**
         * 批量下载扫码记录
         * @param quickMarkIds
         * @param emailSubject
         * @param emailAddress
         * @param dataFormat
         * @param formatType
         *
         */
        downloadQrcode ({ quickMarkIds, emailSubject, emailAddress, dataFormat, formatType }) {
            return this.request
                .get(`/downloadScanRecords`)
                .query({
                    quickMarkIds,
                    emailSubject,
                    emailAddress,
                    dataFormat,
                    formatType
                });
        },

        /**
         * 批量下载扫码记录(新)
         * @param quickMarkIds
         * @param emailSubject 邮件主题
         * @param emailAddress 接收邮箱
         * @param dataFormat 数据格式 （utf8 gb18030）格式类型为CSV时有值
         * @param formatType 格式类型（Excel  CSV）
         *
         */
        downloadQrcodeNew ({ quickMarkIds, emailSubject, emailAddress, dataFormat, formatType }) {
            return this.request
                .post(`/batchDownloadScanRecords`)
                .send({
                    quickMarkIds,
                    emailSubject,
                    emailAddress,
                    dataFormat,
                    formatType
                });
        },

        /**
         * 根据分组下载二维码列表数据
         * @param {Array} groupIds 分组id列表（最多5个）
         * @param {String} emailSubject 邮件主题
         * @param {String} emailAddress 接收邮箱
         * @param {String} dataFormat 数据格式 （utf8 gb18030）格式类型为CSV时有值
         * @param {String} formatType 格式类型（Excel  CSV）
         *
         */
        downloadQRCodeDataList({ groupIds, emailSubject, emailAddress, dataFormat, formatType }) {
            return this.request
                .post(`/downloadQRCodeDataList`)
                .send({
                    groupIds,
                    emailSubject,
                    emailAddress,
                    dataFormat,
                    formatType
                });
        },

        /***
         * 二维码列表移动分组
         * @param {Number} quickMarkGroupId
         * @param {Array,Number} ids
         */
        moveGroup ({ quickMarkGroupId, ids }) {
            return this.request
                .put('/moveQuickMarksGroup')
                .send({
                    quickMarkGroupId,
                    ids
                });
        },

        /**
         * 被关注时自动回复
         * @return {*|Request}
         */
        getFollowReply () {
            return this.request
                .get(`/concernReplys/get`);
        },


        /**
         * 保存关注自动回复
         * @param id
         * @param concernReplyValue  回复文字
         * @param materialId     素材ID
         * @return {*|Request}
         */
        saveAddedReply (obj) {
            return this.request
                .post(`/concernReplys/save`)
                .send(obj);
        },


        /**
         * 查询自动回复
         * @return {*|Request}
         */
        getMsgReply () {
            return this.request
                .get(`/automaticReplys/get`);
        },


        /**
         * 保存自动回复
         * @param id
         * @param concernReplyValue  回复文字
         * @param materialId     素材ID
         * @return {*|Request}
         */
        saveMsgReply (obj) {
            return this.request
                .post(`/automaticReplys/save`)
                .send(obj);
        },


        /**
         * 删除回复
         */
        delReply (id) {
            return this.request
                .del('/concernReplys/delete')
                .query({ id });
        },

        /**
         * 自动回复-关键词自动回复-添加外部页、表单、小程序卡片、菜单消息-确定
         */
        saveKeywordContent (obj) {
            return this.request
                .post('/keyWordContent/save')
                .send(obj);
        },
        // 删除 关键词自动回复-添加外部页、表单、小程序卡片、菜单消息
        delMenuMsg (id) {
            return this.request
                .del('/keyWordContent/delete')
                .query({ id });
        },

        /**
         * 获取模板列表
         * @param officialId
         * @param searchName
         * @param type 不传 type 代表全部；1 可用模板（未失效、已配置参数）；2 失效模板；0 未失效、未配置参数模板；
         * @param sort
         * @return {*}
         */
        templateList (officialId, searchName, type, sort) {
            return this.request
                .get('/template')
                .query({
                    officialId, searchName, type, sort
                });
        },


        /**
         * 批量获取模板的内容
         * @param materialIds
         */
        getWxTemplateContent (materialIds) {
            return this.request
                .get('/getWxTemplateContent')
                .query({
                    materialIds
                });
        },


        /**
         * 同步微信模板
         * @param officialId
         * @return {*}
         */
        synchronization (officialId) {
            return this.request
                .put('/synTemplate')
                .query({
                    officialId
                });
        },


        /**
         * 模板详情
         * @param id
         * @return {*}
         */
        templateDetails (id) {
            return this.request
                .get('/template/getOne')
                .query({
                    id
                });
        },


        /**
         *
         * 删除失效模板
         * @param id
         */
        templateDelete (id) {
            return this.request
                .delete(`/template/${id}`);
        },

        /**
         * 保存模板
         * @param id
         * @param appId
         * @param miniProgram
         * @param pagePath
         * @param sendContent
         * @param url
         * @param paperId
         * @param customFormId
         * @param customSheetUrl
         * @param extensionValueId
         * @param formName
         */
        templateSave (
            id, appId, miniProgram, pagePath, sendContent, url, paperId,
            customFormId, customSheetUrl, extensionValueId, formName, miniprogramId) {
            return this.request
                .post('/template/save')
                .query({
                    id
                })
                .send({
                    id, appId, miniProgram, pagePath, sendContent, url, paperId,
                    customFormId, customSheetUrl, extensionValueId, formName, miniprogramId
                });
        },


        /**
         * 获取粉丝列表
         * @param officialId
         * @param pageNumber
         * @param search
         * @param type 0 全部粉丝  1 已关注 2 取消关注   3 四十八小时互动粉丝 4 黑名单
         * @param tagId 标签tagId
         */
        getFollowerList (officialId, pageNumber, search, type, tagId) {
            return this.request
                .get(`/getFollowerList`)
                .query({
                    officialId, pageNumber, search, type, tagId
                });
        },


        /**
         * @param wxTemplateId
         * @param openId
         * @return {*}
         */
        testSendWxTemplate (wxTemplateId, openId) {
            return this.request
                .post('/testSendWxTemplate')
                .send({
                    wxTemplateId: wxTemplateId,
                    openId: openId
                });
        },


        /**
         * 获取模板副本详情
         * @param id
         */
        templateCopyDetail (id) {
            return this.request
                .get(`/templateCopy/${id}`);
        },

        /**
         * 获取定时旅程发微信模板消息实际粉丝送达数
         * @param taskInstantiationIds 任务实例id
         */
        getSendCount (taskInstantiationIds) {
            return this.request
                .get(`/wxTemplateSend/getTemplateSendCounts`)
                .query({ taskInstantiationIds });
        },
        /**
        * --- END migrated from outdated src/ ---
        */

        /**
         * 图文素材草稿箱发布
         * @param id
         */
        draftPublish(id) {
            return this.request
                .put('/publishDraft')
                .query({id: id});
        },


        /**
        * --- 微页面小程序相关 START ---
        */
        /**
         * 查询小程序详情
         */
        getMiniProgramInfo() {
            return this.request
                .get('/getMiniProgramInfo');
        },
        /*
         *拼接复用公众号创建小程序的授权链接
         * @param appid 公众号appid
         */
        reuseAccountCreateMini(appid) {
            return this.request
                .post('/authorization/createMiniUrl')
                .query({appid});
        },
        /**
         * 查询可设置的所有类目
         * @param appid 小程序appid
         */
        getAllCategory(appid) {
            return this.request
                .get('/getAllCategories')
                .query({appid});
        },
        /**
         * 查询已设置的所有类目
         */
        findHasCategory(appid) {
            return this.request
                .get('/findCategory')
                .query({appid});
        },
        /**
         * 授权创建小程序的调用接口
         * @param wechatAppid 公众号的appid，授权链接拼上的
         * @param ticket 微信回调授权创建小程序ticket
         */
        createMiniRedirect(wechatAppid, ticket) {
            return this.request
                .post('/authorization/createMiniRedirect')
                .query({wechatAppid, ticket});
        },
        /**
         * 创建临时素材
         * @param
         */
        getMediaId(file, appid) {
            return this.request
                .post('/getMediaId')
                .attach('file', file)
                .field({appid});
        },
        /**
         * 修改name
         * @param appid
         * @param nickName
         * @param nickNameLicenseUrl
         * @param nickNameLicenseMediaId
         */
        setNickname(appid,nickName,nickNameLicenseUrl,nickNameLicenseMediaId, nickNameOthers) {
            return this.request
                .post('/setnickname')
                .send({appid,nickName,nickNameLicenseUrl,
                    nickNameLicenseMediaId, nickNameOthers});
        },
        /**
         * 校验小程序name是否可用
         * @param appid
         * @param nickName
         */
        checkNickName(appid, nickName) {
            return this.request
                .post('/checkwxverifynickname')
                .query({appid,nickName});
        },
        /**
         * 修改头像
         * @param appid
         * @param mediaId
         * @param headimageUrl
         */
        modifyheadimage(appid,mediaId,headimageUrl) {
            return this.request
                .post('/modifyheadimage')
                .send({appid,mediaId,headimageUrl});
        },
        /**
         * 修改小程序简介
         * @param
         */
        modifysignature(appid, signature) {
            return this.request
                .post('/modifysignature')
                .send({appid, signature});
        },
        /**
         * 查询小程序导航设置
         * @param appid
         */
        getMiniprogramNav(appid) {
            return this.request
                .get('/getMiniprogramNav')
                .query({appid});
        },
        /**
         * 保存导航设置
         * @param appid
         * @param themeColor
         * @param navStyle
         * @param fontColor
         */
        saveMiniprogramNav(appid, themeColor, navStyle, fontColor) {
            return this.request
                .post('/saveMiniprogramNav')
                .send({appid, themeColor, navStyle, fontColor});
        },
        /**
         * 修改类目
         * @param appid
         * @param categories []
         */
        updateCategory(appid, categories) {
            return this.request
                .post('/updateCategory')
                .send({appid, categories});
        },
        /**
         * 选择小程序
         * @param officialId
         */
        selectMiniprogram (officialId) {
            return this.request
                .get('/getMiniprogramByAuthorization')
                .query({ officialId });
        },
        /**
         * 查询小程序id信息
         * @param miniAppid
         * @param officialId
         */
        getAppid (miniAppid,officialId){
            return this.request
                .get('/getMiniprogramByMiniAppid')
                .query({ miniAppid, officialId});
        },
        /**统计 start */
        /**
         *  微页面统计数据（上半部分）
         *  @param {Number} microId 小程序id
         */
        microInfo({microId}) {
            return this.request
                .get('/microData/microInfo')
                .query({microId});
        },
        /**
         *  微页面数据列表
         *  @param {Number} microId 微页面id
         */
        dataStatistics({microId}) {
            return this.request
                .get('/microData/dataStatistics')
                .query({microId});
        },
        /**
         *  微页面数据统计联系人列表
         *  @param {Number} id 数据统计id
         *  @param {Number} type 操作类型 0：访问  1：转发 3：表单
         *  @param {Number} pageNum 页码
         *  @param {Number} pageSize 一页尺寸
         *  @param {String} condition 查询字段
         *  @param {String} createDate 创建时间
         */
        contactList({id, type, pageNum, pageSize, condition, createDate}) {
            return this.request
                .get('/microData/contactList')
                .query({id, type, pageNum, pageSize, condition, createDate});
        },
        /**
         * 小程序提交审核
         * @param {String} appid 小程序appid
         * @param {Number} miniprogramType 小程序类型 microPage=微页面；shoppingGuide=导购助手
         */
        commitCode(appid, miniprogramType) {
            return this.request
                .get('/commitCode')
                .query({appid, miniprogramType});
        },
        /**统计 end */
        /**
        * --- 微页面小程序相关 END ---
        */

        /**
         * 公众号同步
         * @param {*} officialId 公众号id
         * @returns 
         */
        synAuthorization (officialId) {
            return this.request
                .get('/authorization/synAuthorization')
                .query({officialId});
        },

        /**
         * 图文消息上传本地图片
         * @param file
         * @return {*|Request}
         */
        uploadLocalImg (file) {
            return this.request
                .post(`/materials/localPicture`)
                .attach('file', file);
        },
    }
});
