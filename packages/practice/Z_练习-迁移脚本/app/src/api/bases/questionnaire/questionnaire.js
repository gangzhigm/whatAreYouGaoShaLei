import Model from 'web-model';
import LINKS from '@/LINKS';

export default new Model({
    base: LINKS.QUESTIONNAIRE_API_BASE + '/api',
    api: {
        // 跳转设置
        /**
         * 跳转设置-获取规则列表
         * @param id
         * @returns {*}
         */
        getRules(id) {
            return this.request
                .get(`/questionnaire/jump/v1/getMatchRules/${id}`);
        },
        /**
         * 跳转设置-保存表单
         * @param formId        表单Id
         * @param type          类型 0 默认跳转，1 规则跳转
         * @param jumpContent   跳转内容
         * @param matchRule     跳转规则
         * @param jumpType      跳转类型0 默认提交成功；1 文本；2 富文本； 3 链接
         * @param submitErrorUrl 匹配失败跳转url
         * @param matchErrorUrl 提交失败URL
         * @param formName 表单名称
         * @param htmlStyle 跳转设置自定义样式
         * @param imageUrl 默认跳转下图片地址
         * @returns {*}
         */
        saveForJump(
            {
                formId, type, jumpContent, matchRule,
                jumpType, submitErrorUrl, matchErrorUrl,
                formName, htmlStyle, imageUrl
            }) {
            return this.request
                .put(`/questionnaire/jump/v1/save`)
                .send(
                    {
                        formId, type, jumpContent, matchRule,
                        jumpType, submitErrorUrl, matchErrorUrl,
                        formName, htmlStyle, imageUrl
                    });
        },
        // 发送给华为线索管理
        /**
         * 获取华为线索管理条件
         * @param formId
         * @returns {*}
         */
        getClues(formId) {
            return this.request
                .get(`/questionnaire/clue/v1/getMatchRules/${formId}`);
        },
        /**
         * 保存
         * @param formId        表单id
         * @param matchRule     匹配规则
         * @param matchType     匹配类型 0:全部表单,1:根据规则筛选
         */
        saveClues(formId, matchRule, matchType) {
            return this.request
                .put(`/questionnaire/clue/v1/save`)
                .send({formId, matchRule, matchType});
        },
    },
});