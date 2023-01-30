// common
import {commonTranslation, paginationTranslation, punctuationTranslation, downloadDetailsTranslation} from './common/commonTranslation';
import calendarTranslation from './common/calendarTranslation';
import components from './common/components';

import analysisTranslations from './analysis';
import contactTranslation from './customer/list';
import swarmTranslation from './customer/swarm';
import scoringTranslation from './customer/scoring';
import newScoringTranslation from './customer/newScoring';
import data from './data';
import journeyTranslations from './journey';
import homeTranslation from './layout'; // 首页、登录、导航栏
import personalTranslations from './personalSet';
import settingTranslations from './setting';
import wechatTranslations from './wechat';
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
