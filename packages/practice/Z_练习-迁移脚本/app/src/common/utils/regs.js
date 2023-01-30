/**
 * 常规name正则
 * @type {RegExp}
 */
export const COMMON_NAME_REGEXP = /^[^&=~‘’！·|^/<>%!+*\\.'`]*$/;


/**
 * 二维码回复外部页标题name、标签名称name
 * @type {RegExp}
 */
export const TAGANDWEBPAGE_NAME_REGEXP = /^[^&=‘’！·|^/<>%!+*\\'`]*$/;


/**
 * 常规URL
 * @type {RegExp}
 */
export const COMMON_URL_REGEXP = /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?/i;

/**
 * 常规URL或微信URL
 * @type {RegExp}
 */
export const COMMON_WEIXIN_URL_REGEXP = /^weixin:\/\/.*/i; 

/**
 * 邮箱地址
 * @type {RegExp}
 */
export const EMAIL_ADDRESS_REGEXP = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;


/**
 * 表单-扩展值正则 不限制中文'
 * @type {RegExp}
 */
export const COMMON_FORM_NAME_REGEXP = /^[^&=~‘’！·|^/<>%!+*\\.`]*$/;


/**
 * 成员名称可以含有_ .
 * @type {RegExp}
 */
export const MEMBER_NAME_REGEXP = /^[^&=~‘’！·|^/<>%!+*'`]*$/;
/**
 * 企业设置 - 组织成员 新建编辑企业部门是可以输入特殊符号支持的特殊符号包括以下3种：
 1. 中英文括弧

 2. 中英文逗号

 3. 中英文单引号
 */
export const DEPARTMENT_NAME_REGEXP = /^[^&=~！·|^/<>%!+*`]*$/;

//手机号隐藏中间四位
export const PHONE_TEXT = /(\d{3})\d{4}(\d{4})/;

// 手机号格式
export const PHONE_REGEXP = /^1[3|4|5|6|7|8|9][0-9]{9}$/;
