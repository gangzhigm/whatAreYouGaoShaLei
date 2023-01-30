import {isToday, startOfMonth, startOfWeek, startOfYear, startOfYesterday, subDays} from 'date-fns';
import Range from './Range';

let updateDate = '';
export const
    YESTERDAY = 'YESTERDAY',
    TODAY = 'TODAY',
    LAST_WEEK = 'LAST_WEEK',
    THIS_WEEK = 'THIS_WEEK',
    LAST_MONTH = 'LAST_MONTH',
    THIS_MONTH = 'THIS_MONTH',
    LAST_YEAR = 'LAST_YEAR',
    THIS_YEAR = 'THIS_YEAR',
    LAST_7_DAYS = 'LAST_7_DAYS',
    LAST_30_DAYS = 'LAST_30_DAYS',
    LIFETIME = 'LIFETIME',
    LAST_HALF_YEAR = 'LAST_HALF_YEAR',
    LAST_90_DAYS = 'LAST_90_DAYS';
const RANGES = {
    YESTERDAY,
    TODAY,
    LAST_WEEK,
    THIS_WEEK,
    LAST_MONTH,
    THIS_MONTH,
    LAST_YEAR,
    THIS_YEAR,
    LAST_7_DAYS,
    LAST_30_DAYS,
    LIFETIME,
    LAST_HALF_YEAR,
    LAST_90_DAYS,
    refresh() {
        if (!isToday(updateDate)) {
            initRanges();
        }
    }
};
export default RANGES;

export function initRanges(since) {
    const today = new Date();
    const yesterday = startOfYesterday();
    const thisWeekMonday = startOfWeek(today, {weekStartsOn: 1});
    const lastMonthTail = subDays(startOfMonth(today), 1);
    const lastYearTail = subDays(startOfYear(today), 1);
    
    updateDate = today;
    RANGES[YESTERDAY] = new Range(yesterday, yesterday);
    RANGES[TODAY] = new Range(today, today);
    RANGES[LAST_WEEK] = new Range(6, subDays(thisWeekMonday, 1));
    RANGES[THIS_WEEK] = new Range(thisWeekMonday, today);
    RANGES[LAST_MONTH] = new Range(startOfMonth(lastMonthTail), lastMonthTail);
    RANGES[THIS_MONTH] = new Range(startOfMonth(today), today);
    RANGES[LAST_YEAR] = new Range(startOfYear(lastYearTail), lastYearTail);
    RANGES[THIS_YEAR] = new Range(startOfYear(today), today);
    RANGES[LAST_7_DAYS] = new Range(6, yesterday);
    RANGES[LAST_30_DAYS] = new Range(29, yesterday);
    RANGES[LAST_HALF_YEAR] = new Range(179, yesterday);
    RANGES[LAST_90_DAYS] = new Range(89, yesterday);
    // 上线至今
    since || (since = new Date(0));
    RANGES[LIFETIME] = new Range(since, today);
}

initRanges();

export const SHORTCUTS = [
    {key: YESTERDAY, txt: 'time.yesterday', unit: 'day'},
    {key: TODAY, txt: 'time.today', unit: 'day'},
    {key: LAST_WEEK, txt: 'time.lastWeek', unit: 'week'},
    {key: THIS_WEEK, txt: 'time.thisWeek', unit: 'week'},
    {key: LAST_MONTH, txt: 'time.lastMonth', unit: 'month'},
    {key: THIS_MONTH, txt: 'time.thisMonth', unit: 'month'},
    {key: LAST_YEAR, txt: 'time.lastYear', unit: 'year'},
    {key: THIS_YEAR, txt: 'time.thisYear', unit: 'year'},
    {key: LAST_7_DAYS, txt: 'time.last7Days', unit: 'day'},
    {key: LAST_30_DAYS, txt: 'time.last30Days', unit: 'day'},
    {key: LIFETIME, txt: 'time.sinceOnline', unit: 'day'},
    {key: LAST_HALF_YEAR,txt: 'time.lastHalfYear',unit: 'day'},
    {key: LAST_90_DAYS, txt: 'time.last90Days', unit: 'day'}
];
