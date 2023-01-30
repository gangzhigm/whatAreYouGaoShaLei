// common
import {commonTranslation, paginationTranslation, punctuationTranslation, downloadDetailsTranslation} from './common/commonTranslation';
import calendarTranslation from './common/calendarTranslation';
import components from './common/components'; //公用组件

import analysisTranslations from './analysis'; // 数据分析
import contactTranslation from './customer/list'; // 联系人管理
import swarmTranslation from './customer/swarm'; // 联系人分群
import scoringTranslation from './customer/scoring'; // 联系人评分
import newScoringTranslation from './customer/newScoring'; // 联系人评分(新)
import data from './data'; // 数据中心
import journeyTranslations from './journey'; // 旅程
import homeTranslation from './layout'; // 首页、登录、导航栏
import personalTranslations from './personalSet';
import settingTranslations from './setting'; // 企业设置
import wechatTranslations from './wechat';          // 微信功能
import wecomTranslations from './wecom'; // 企业微信
import microPageTranslations from './microPage/microPage'; // 微页面


export default [
    commonTranslation,
    paginationTranslation,
    punctuationTranslation,
    downloadDetailsTranslation,
    calendarTranslation,
    homeTranslation,
    ...wechatTranslations,
    contactTranslation,
    swarmTranslation,
    scoringTranslation,
    newScoringTranslation,
    ...journeyTranslations,
    ...data,
    ...analysisTranslations,
    components,
    ...settingTranslations,
    personalTranslations,
    ...wecomTranslations,
    microPageTranslations
];
