/**
 * Created by naeemo on 2017/3/26.
 */

import {translate} from '@/locales';

/**
 * 日期字符串数组排序
 * '2015-12-12', '2014-01-01', etc.
 * @param aStr
 * @param bStr
 */
export function sortByDateStr(aStr, bStr) {

    let a = aStr.split('-');
    let b = bStr.split('-');

    if (a[0] !== b[0])
        return a[0] > b[0];

    if (a[1] !== b[1])
        return a[1] > b[1];

    return a[2] > b[2];

}


/**
 * 时间字符串数组排序
 * @param taskA
 * @param taskB
 * @return {Number}
 */
export function sortTaskByTime(taskA, taskB) {

    let a = taskA.time.split(':');
    let b = taskB.time.split(':');

    if (a[0] !== b[0]) {
        return a[0] - b[0];
    }

    return a[1] - b[1];

}


const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

/**
 * 日期字符串填充 '年', '月', '日'
 * @param dateStr
 * @return {string}
 */
export function toCNDate(dateStr) {

    const parts = dateStr.split('-')
        .map(s => parseInt(s));

    const day = translate('dataCenter.day' + parts.pop()).split(' ')[0];
    const month = translate('time.' + months[parts.pop() - 1]);
    const year = parts.length ? (parts[0] + ' ' + translate('time.year')) : '';

    return [year, month, day].join(' ');
}
