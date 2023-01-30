/**
 * Dmartech 前端部署配置
 */

const LINKS = {};
switch (process.env.NODE_ENV) {

    /**
     * dev 服务器
     */
    case 'dev':
        LINKS.ORIGIN = 'https://dmt-dev-app.qdum.com';
        LINKS.WEB_BASE = '';
        LINKS.ADMIN_ORIGIN = 'https://admin-beta.qdum.com';
        LINKS.GATE_ORIGIN = 'https://dmt-dev-gate.qdum.com';
        LINKS.REALY_API_BASE = 'https://gate-beta.dmartech.cn/relay';
        LINKS.JOURNEY_API_BASE = 'https://dmt-dev-gate.qdum.com/journey';
        LINKS.REAL_TIME_JOURNEY_API_BASE = 'https://dmt-dev-gate.qdum.com/rtjourney';
        LINKS.JOURNEY_MATERIAL_API_BASE = 'https://dmt-dev-gate.qdum.com/material';
        LINKS.SMS_API_BASE = 'https://dmt-dev-gate.qdum.com/smsservice';
        LINKS.SCRM_API_BASE = 'https://dmt-dev-gate.qdum.com/scrm';
        LINKS.CONTACT_API_BASE = 'https://dmt-dev-gate.qdum.com/contact';
        LINKS.CONTACT_EXPORT_API_BASE = 'https://dmt-dev-gate.qdum.com/contactexport';
        LINKS.WECHAT_API_BASE = 'https://dmt-dev-gate.qdum.com/wechat';
        LINKS.WEB_SERVICE_API_BASE = 'https://dmt-dev-gate.qdum.com/webservice';
        LINKS.ETL_API_BASE = 'https://dmt-dev-gate.qdum.com/etl';
        LINKS.QUERY_API_BASE = 'https://dmt-dev-gate.qdum.com/query';
        LINKS.MANAGE_API_BASE = 'https://dmt-dev-gate.qdum.com/manage';
        LINKS.QUESTIONNAIRE_API_BASE = 'https://dmt-dev-gate.qdum.com/questionnaire';
        LINKS.SCHEDULE_API_BASE = 'https://dmt-dev-gate.qdum.com/schedule';
        LINKS.NIKE_API_BASE = 'https://dmt-dev-gate.qdum.com/journey';
        LINKS.NIKE_MATERIAL_API_BASE = 'https://dmt-dev-gate.qdum.com/material';
        LINKS.SERVICE_API_BASE = 'https://dmt-dev-gate.qdum.com/service';
        LINKS.WECOM_API_BASE = 'https://dmt-dev-gate.qdum.com/workwechat';
        LINKS.SCORING_API_BASE = 'https://dmt-dev-gate.qdum.com/scorerating';
        break;

    /**
     * beta 服务器
     */
    case 'beta':
        LINKS.ORIGIN = 'https://app-beta.dmartech.cn';
        LINKS.WEB_BASE = '';
        LINKS.ADMIN_ORIGIN = 'https://admin-beta.dmartech.cn';
        LINKS.GATE_ORIGIN = 'https://gate-beta.dmartech.cn';
        LINKS.REALY_API_BASE = 'https://gate-beta.dmartech.cn/relay';
        LINKS.JOURNEY_API_BASE = 'https://gate-beta.dmartech.cn/journey';
        LINKS.REAL_TIME_JOURNEY_API_BASE = 'https://gate-beta.dmartech.cn/rtjourney';
        LINKS.JOURNEY_MATERIAL_API_BASE = 'https://gate-beta.dmartech.cn/material';
        LINKS.SMS_API_BASE = 'https://gate-beta.dmartech.cn/smsservice';
        LINKS.SCRM_API_BASE = 'https://gate-beta.dmartech.cn/scrm';
        LINKS.CONTACT_API_BASE = 'https://gate-beta.dmartech.cn/contact';
        LINKS.CONTACT_EXPORT_API_BASE = 'https://gate-beta.dmartech.cn/contactexport';
        LINKS.WECHAT_API_BASE = 'https://gate-beta.dmartech.cn/wechat';
        LINKS.WEB_SERVICE_API_BASE = 'https://gate-beta.dmartech.cn/webservice';
        LINKS.ETL_API_BASE = 'https://gate-beta.dmartech.cn/etl';
        LINKS.QUERY_API_BASE = 'https://gate-beta.dmartech.cn/query';
        LINKS.MANAGE_API_BASE = 'https://gate-beta.dmartech.cn/manage';
        LINKS.QUESTIONNAIRE_API_BASE = 'https://gate-beta.dmartech.cn/questionnaire';
        LINKS.SCHEDULE_API_BASE = 'https://gate-beta.dmartech.cn/schedule';
        LINKS.NIKE_API_BASE = 'https://gate-beta.dmartech.cn/journey';
        LINKS.NIKE_MATERIAL_API_BASE = 'https://gate-beta.dmartech.cn/material';
        LINKS.SERVICE_API_BASE = 'https://gate-beta.dmartech.cn/service';
        LINKS.WECOM_API_BASE = 'https://gate-beta.dmartech.cn/workwechat';
        LINKS.SCORING_API_BASE = 'https://gate-beta.dmartech.cn/scorerating';
        break;

    /**
     * 生产服务器
     */
    case 'production':
        LINKS.ORIGIN = 'https://app.dmartech.cn';
        LINKS.WEB_BASE = '';
        LINKS.ADMIN_ORIGIN = 'https://admin.dmartech.cn';
        LINKS.GATE_ORIGIN = 'https://gate.dmartech.cn';
        LINKS.REALY_API_BASE = 'https://gate.dmartech.cn/relay';
        LINKS.JOURNEY_API_BASE = 'https://gate.dmartech.cn/journey';
        LINKS.REAL_TIME_JOURNEY_API_BASE = 'https://gate.dmartech.cn/rtjourney';
        LINKS.JOURNEY_MATERIAL_API_BASE = 'https://gate.dmartech.cn/material';
        LINKS.SMS_API_BASE = 'https://gate.dmartech.cn/smsservice';
        LINKS.SCRM_API_BASE = 'https://gate.dmartech.cn/scrm';
        LINKS.CONTACT_API_BASE = 'https://gate.dmartech.cn/contact';
        LINKS.CONTACT_EXPORT_API_BASE = 'https://gate.dmartech.cn/contactexport';
        LINKS.WECHAT_API_BASE = 'https://gate.dmartech.cn/wechat';
        LINKS.WEB_SERVICE_API_BASE = 'https://gate.dmartech.cn/webservice';
        LINKS.ETL_API_BASE = 'https://gate.dmartech.cn/etl';
        LINKS.QUERY_API_BASE = 'https://gate.dmartech.cn/query';
        LINKS.MANAGE_API_BASE = 'https://gate.dmartech.cn/manage';
        LINKS.QUESTIONNAIRE_API_BASE = 'https://gate.dmartech.cn/questionnaire';
        LINKS.SCHEDULE_API_BASE = 'https://gate.dmartech.cn/schedule';
        LINKS.NIKE_API_BASE = 'https://gate.dmartech.cn/journey';
        LINKS.NIKE_MATERIAL_API_BASE = 'https://gate.dmartech.cn/material';
        LINKS.SERVICE_API_BASE = 'https://gate.dmartech.cn/service';
        LINKS.WECOM_API_BASE = 'https://gate.dmartech.cn/workwechat';
        LINKS.SCORING_API_BASE = 'https://gate.dmartech.cn/scorerating';

        break;

    /**
     * 本地开发
     */
    default:
        LINKS.ORIGIN = '';
        LINKS.WEB_BASE = '';
        LINKS.ADMIN_ORIGIN = 'https://admin-beta.dmartech.cn';
        LINKS.GATE_ORIGIN = 'https://gate-beta.dmartech.cn';
        LINKS.REALY_API_BASE = 'https://gate-beta.dmartech.cn/relay';
        LINKS.JOURNEY_API_BASE = 'https://gate-beta.dmartech.cn/journey';
        LINKS.REAL_TIME_JOURNEY_API_BASE = 'https://gate-beta.dmartech.cn/rtjourney';
        LINKS.JOURNEY_MATERIAL_API_BASE = 'https://gate-beta.dmartech.cn/material';
        LINKS.SMS_API_BASE = 'https://gate-beta.dmartech.cn/smsservice';
        LINKS.SCRM_API_BASE = 'https://gate-beta.dmartech.cn/scrm';
        LINKS.CONTACT_API_BASE = 'https://gate-beta.dmartech.cn/contact';
        LINKS.CONTACT_EXPORT_API_BASE = 'https://gate-beta.dmartech.cn/contactexport';
        LINKS.WECHAT_API_BASE = 'https://gate-beta.dmartech.cn/wechat';
        LINKS.WEB_SERVICE_API_BASE = 'https://gate-beta.dmartech.cn/webservice';
        LINKS.ETL_API_BASE = 'https://gate-beta.dmartech.cn/etl';
        LINKS.QUERY_API_BASE = 'https://gate-beta.dmartech.cn/query';
        LINKS.MANAGE_API_BASE = 'https://gate-beta.dmartech.cn/manage';
        LINKS.QUESTIONNAIRE_API_BASE = 'https://gate-beta.dmartech.cn/questionnaire';
        LINKS.SCHEDULE_API_BASE = 'https://gate-beta.dmartech.cn/schedule';
        LINKS.NIKE_API_BASE = 'https://gate-beta.dmartech.cn/journey';
        LINKS.NIKE_MATERIAL_API_BASE = 'https://gate-beta.dmartech.cn/material';
        LINKS.SERVICE_API_BASE = 'https://gate-beta.dmartech.cn/service';
        LINKS.WECOM_API_BASE = 'https://gate-beta.dmartech.cn/workwechat';
        LINKS.SCORING_API_BASE = 'https://gate-beta.dmartech.cn/scorerating';
        break;
}

export default LINKS;
