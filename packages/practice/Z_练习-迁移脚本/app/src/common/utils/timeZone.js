/**
 *
 * 得到时区
 */
import {LANGUAGE_PREFERENCE} from '@/locales';
import {commonTranslation as cn} from '@/locales/lang/zh-CN/common/commonTranslation';
import {commonTranslation as en } from '@/locales/lang/en/common/commonTranslation';

const Lang = localStorage.getItem(LANGUAGE_PREFERENCE);
const common = Lang === 'en' ? en : cn;
export const TIME_ZONE_RNAGES = [
    {
        id: '-11:00',
        name: common.GMT01,
    },
    {
        id: '-10:00',
        name: common.GMT02,
    },
    {
        id: '-09:00',
        name: common.GMT03,
    },
    {
        id: '-08:00',
        name: common.GMT04,
    },
    {
        id: '-07:00',
        name: common.GMT05,
    },
    {
        id: '-06:00',
        name: common.GMT06,
    },
    {
        id: '-05:00',
        name: common.GMT07,
    },
    {
        id: '-04:00',
        name: common.GMT08,
    },
    {
        id: '-03:00',
        name: common.GMT09,
    },
    {
        id: '-02:00',
        name: common.GMT10,
    },
    {
        id: '-01:00',
        name: common.GMT11,
    },
    {
        id: '+00:00',
        name: common.GMT12,
    },
    {
        id: '+01:00',
        name: common.GMT13,
    },
    {
        id: '+02:00',
        name: common.GMT14,
    },
    {
        id: '+03:00',
        name: common.GMT15,
    },
    {
        id: '+03:30',
        name: common.GMT16,
    },
    {
        id: '+04:00',
        name: common.GMT17,
    },
    {
        id: '+04:30',
        name: common.GMT18,
    },
    {
        id: '+05:00',
        name: common.GMT19,
    },
    {
        id: '+05:30',
        name: common.GMT20,
    },
    {
        id: '+05:45',
        name: common.GMT21,
    },
    {
        id: '+06:00',
        name: common.GMT22,
    },
    {
        id: '+06:30',
        name: common.GMT23,
    }
    ,
    {
        id: '+07:00',
        name: common.GMT24,
    },
    {
        id: '+08:00',
        name: common.GMT25,
    },
    {
        id: '+09:00',
        name: common.GMT26,
    },
    {
        id: '+09:30',
        name: common.GMT27,
    },
    {
        id: '+10:00',
        name: common.GMT28,
    },
    {
        id: '+11:00',
        name: common.GMT29,
    },
    {
        id: '+12:00',
        name: common.GMT30,
    },
    {
        id: '+13:00',
        name: common.GMT31,
    }
];
export function timeZoneToday(timeZone) {
    let d = new Date();
    if (timeZone.length === 0) return d.getTime();
    let localOffset = d.getTimezoneOffset() * 60000; // 获得当地时间偏移的毫秒数
    let utc = d.getTime() + localOffset; // GMT时间
    let offset = timeZone.split(':')[0]; // 时区
    let offsetHalf = timeZone.split(':')[1] !== '00' ? timeZone.split(':')[1] * 60000 : 0;
    return utc + (3600000 * offset) + offsetHalf;  // 当前时区本地对应的毫秒数
}
