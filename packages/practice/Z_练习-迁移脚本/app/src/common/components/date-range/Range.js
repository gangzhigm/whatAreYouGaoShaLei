/**
 * 日期区间
 * Created by naeemo on 2017/5/16.
 */

import {
    addDays,
    addMonths,
    addWeeks,
    addYears,
    differenceInCalendarDays,
    differenceInCalendarMonths,
    differenceInCalendarWeeks,
    differenceInCalendarYears,
    eachDay,
    endOfDay,
    endOfMonth,
    endOfWeek,
    endOfYear,
    isSameDay,
    min,
    startOfDay,
    startOfMonth,
    startOfWeek,
    startOfYear,
    subDays
} from 'date-fns';
import {translate as t} from '@/locales';
import {getDateInstance, stringify} from '../../../common/utils/dateUtils';

/**
 * 时间单位 -> 文本
 * @type {{minute: string, hour: string, day: string, week: string, month: string, season: string, year: string}}
 */
const UNIT_CH_MAP = {
    minute: 'time.minute',
    hour: 'time.hour',
    day: 'time.day',
    week: 'time.week',
    month: 'time.month',
    season: 'time.season',
    year: 'time.year',
};

/**
 * 根据动态时间的数字，给出相应的文本
 * @param offset
 * @param unit
 * @return {string}
 */
function parseOffset(offset, unit) {
    const unitChar = t(UNIT_CH_MAP[unit]);
    if (!unitChar) {
        throw new Error('时间区间：没有合适的区间单位');
    }
    if (offset === 0) {
        return t('time.now');
    } else if (offset > 0) {
        return `${t('time.future')} ${offset} ${unitChar}`;
    }
    // offset < 0
    return `${t('time.past')} ${Math.abs(offset)} ${unitChar}`;
}

export default class Range {

    /**
     * 日期区间构造器
     * @param {Date|String|Number} start
     * @param {Date|String|Number} end
     * @param {String} unit
     */
    constructor(start, end, unit) {
        const today = new Date();
        const _start = /\[object String]/i.test(Object.prototype.toString.call(start)) ? getDateInstance(start) : start;
        const _end = /\[object String]/i.test(Object.prototype.toString.call(end)) ? getDateInstance(end) : end;
        const isStartDate = _start instanceof Date,
            isEndDate = _end instanceof Date;

        if (!unit) {
            // 静态时间
            if (isStartDate) {
                this.start = startOfDay(_start);
                this.end = isEndDate ? endOfDay(_end) : endOfDay(addDays(_start, _end));
            } else {
                if (isEndDate) {
                    this.end = endOfDay(_end);
                    this.start = startOfDay(subDays(_end, _start));
                } else {
                    throw new Error('静态时间区间不能起始都是数字');
                }
            }
        } else {
            // 动态时间
            switch (unit) {
                case 'day':
                    this.start = startOfDay(addDays(today, start));
                    this.end = endOfDay(addDays(today, end));
                    break;
                case 'week':
                    this.start = startOfWeek(addWeeks(today, start), {weekStartsOn: 1});
                    this.end = min(endOfWeek(addWeeks(today, end), {weekStartsOn: 1}), endOfDay(today));
                    break;
                case 'month':
                    this.start = startOfMonth(addMonths(today, start));
                    this.end = min(endOfMonth(addMonths(today, end)), endOfDay(today));
                    break;
                case 'year':
                    this.start = startOfYear(addYears(today, start));
                    this.end = min(endOfYear(addYears(today, end)), endOfDay(today));
                    break;
                default:
                    console.error('创建动态时间区间，未识别的时间单位：' + unit);
            }
        }
    }


    /**
     * 判断传入的起始日期是否正好是当前区间
     * @param {Range} range
     * @return {Boolean}
     */
    isSameRange(range) {
        return range instanceof Range
            && isSameDay(this.start, range.start)
            && isSameDay(this.end, range.end);
    }


    /**
     * 区间内所有日期的字符串形式
     * ['2017-05-20', '2017-05-21', ...]
     * @return {Array.<String>}
     */
    getDatesInStr() {
        return stringify(eachDay(this.start, this.end));
    }


    /**
     * 涵盖日期数，前后包含
     * @return {Number}
     */
    daysCount() {
        return differenceInCalendarDays(this.end, this.start) + 1;
    }


    /**
     * 将当前区间向后移动x天，并返回一个新的区间
     * @param days 默认是当前区间天数
     * @return {Range}
     */
    shift(days = this.daysCount()) {
        return new Range(
            subDays(this.start, days),
            subDays(this.end, days)
        );
    }


    /**
     * 获取时间区间的动态描述，[-1, 2, 'day']
     * @param {String} unit
     * @return {*[]}
     */
    dynamicDescription(unit = 'day') {
        const today = new Date();
        let start, end;
        switch (unit) {
            case 'day':
                start = differenceInCalendarDays(this.start, today);
                end = differenceInCalendarDays(this.end, today);
                break;
            case 'week':
                start = differenceInCalendarWeeks(this.start, today, {weekStartsOn: 1});
                end = differenceInCalendarWeeks(this.end, today, {weekStartsOn: 1});
                break;
            case 'month':
                start = differenceInCalendarMonths(this.start, today);
                end = differenceInCalendarMonths(this.end, today);
                break;
            case 'year':
                start = differenceInCalendarYears(this.start, today);
                end = differenceInCalendarYears(this.end, today);
                break;
            default:
                console.error('生成时间区间动态描述，未识别的时间单位：' + unit);
                break;
        }
        return [
            start,
            end,
            unit
        ];
    }


    /**
     * 获取动态时间的文本
     * @return {string}
     */
    dynamicText() {
        let [start, end, unit] = this.dynamicDescription();
        return parseOffset(start, unit) + ' ~ ' + parseOffset(end, unit);
    }

}
