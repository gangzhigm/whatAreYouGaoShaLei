/**
 * 旅程控件类型
 */

// 开始控件
export const START_CONTROLLER = 'startController';
// 目标受众控件
export const CONTACT_CONTROLLER = 'contactController';

// A/B 测试控件
export const AB_TEST_CONTROLLER = 'ABTestController';
export const NEW_AB_TEST_CONTROLLER = 'NewABTestController';
// 条件分支控件
export const DECISION_CONTROLLER = 'decisionController';
// 属性判断控件
export const ATTRIBUTE_CONDITION_CONTROLLER = 'attributeDecideController';
// 事件判断控件
export const EVENT_CONDITION_CONTROLLER = 'eventDecideController';
// 标签判断控件
export const TAG_CONDITION_CONTROLLER = 'tagDecideController';

// 邮件任务控件
export const EMAIL_CONTROLLER = 'emailController';
// 短信控件
export const SMS_CONTROLLER = 'smsController';
// 彩信控件
export const MMS_CONTROLLER = 'mmsController';
// 添加联系人标签控件 - 由于数据库中有历史数据，故不将addTagController 改为addContactTagController
export const ADD_CONTACT_TAG_CONTROLLER = 'addTagController';
// 移除联系人标签控件 - 由于数据库中有历史数据，故不将delTagController 改为delContactTagController
export const DELETE_CONTACT_TAG_CONTROLLER = 'delTagController';
// 添加粉丝标签控件
export const ADD_FANS_TAG_CONTROLLER = 'addFansTagController';
// 移除粉丝标签控件
export const DELETE_FANS_TAG_CONTROLLER = 'delFansTagController';
// 微信控件
export const WECHAT_CONTROLLER = 'wechatController';

// 结束控件
export const END_CONTROLLER = 'endController';
// 分批群发控件
export const EMAILTEMPLATE_CONTROLLER = 'emailTemplateController';

// 华为定制 线索传递控件
export const LEADS_TRANSFER = 'clueController';

// 企业微信控件
export const WECOM_CONTROLLER = 'wecomController';

/**
 * 控件对应详情弹出层的组件名
 * @param CONTROLLER_TYPE
 * @return {string} CONTROLLER_MODAL_NAME
 */
export function getModalName(CONTROLLER_TYPE) {
    return CONTROLLER_TYPE + 'Modal';
}
