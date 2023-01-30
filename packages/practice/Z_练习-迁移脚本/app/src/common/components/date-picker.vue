<template>
    <div class="date-picker" :class="{border: view === 'month'}">
        <table v-show="view === 'month'">
            <thead>
            <tr>
                <th class="prev-month" @click="prev"></th>
                <th colspan="5">
                    {{year}} {{monthNameMap[month.getMonth()] | t}}
                </th>
                <th class="next-month" @click="next"></th>
            </tr>
            <tr>
                <th>Mo</th>
                <th>Tu</th>
                <th>We</th>
                <th>Th</th>
                <th>Fr</th>
                <th>Sa</th>
                <th>Su</th>
            </tr>
            </thead>
            <tbody :title="$t('time.rangePickTip')">
            <tr v-for="week in weeks">
                <td v-for="day in week" :class="getDayClass(day)"
                    @click="setAnchor(day)" @click.right.prevent="setTail(day)">
                    {{day.getDate()}}
                </td>
            </tr>
            </tbody>
        </table>
        <table v-show="view === 'year'">
            <thead>
            <tr>
                <th colspan="10"></th>
                <th colspan="1" class="prev-month" @click="prev"></th>
                <th colspan="6">{{year}}</th>
                <th colspan="1" class="next-month" @click="next"></th>
                <th colspan="10"></th>
            </tr>
            <tr>
                <th>Mo</th>
                <th>Tu</th>
                <th>We</th>
                <th>Th</th>
                <th>Fr</th>
                <th>Sa</th>
                <th>Su</th>
                <th>Mo</th>
                <th>Tu</th>
                <th>We</th>
                <th>Th</th>
                <th>Fr</th>
                <th>Sa</th>
                <th>Su</th>
                <th>Mo</th>
                <th>Tu</th>
                <th>We</th>
                <th>Th</th>
                <th>Fr</th>
                <th>Sa</th>
                <th>Su</th>
                <th>Mo</th>
                <th>Tu</th>
                <th>We</th>
                <th>Th</th>
                <th>Fr</th>
                <th>Sa</th>
                <th>Su</th>
            </tr>
            </thead>
            <tbody :title="$t('time.rangePickTip')">
            <template v-for="row in 3">
                <tr>
                    <th class="month-th-border" colspan="7" v-for="column in 4">
                        {{monthNameMap[(row - 1) * 4 + column - 1] | t}}
                    </th>
                </tr>
                <tr v-for="week in 6">
                    <template v-for="column in 4">
                        <template v-for="(day, i) in weeksByMonth[(row - 1) * 4 + column][week - 1]">
                            <td v-if="day" @click="setAnchor(day)" @click.right.prevent="setTail(day)"
                                :class="[getDayClass(day), {'month-right-border': i === 6, 'month-left-border': i === 0}]">
                                {{day.getDate()}}
                            </td>
                            <td v-else :class="{'month-right-border': i === 6, 'month-left-border': i === 0}"></td>
                        </template>
                    </template>
                </tr>
            </template>
            </tbody>
        </table>
        <input type="button" @click="clear" class="clear-btn" :value="$t('common.clear')">
    </div>
</template>
<script type="text/ecmascript-6">

    import {
        addMonths,
        addYears,
        differenceInCalendarDays,
        eachDay,
        endOfMonth,
        endOfWeek,
        format,
        getYear,
        isAfter,
        isBefore,
        isSameDay,
        startOfMonth,
        startOfWeek,
        startOfYear,
        subMonths,
        subYears
    } from 'date-fns';
    import {getDateInstance, stringify} from '../utils/dateUtils';

    const now = new Date();

    export default {
        name: 'date-picker',
        props: {
            value: {
                type: Array,
                required: true
            },
            view: {
                type: String,
                required: true
            },
            /**
             * 日期是否可选 (date) => {}
             * @param {Date} date 目标日期
             * @returns {boolean} 返回布尔值
             */
            disabledDate: {
                type: Function
            }
        },
        data() {
            return {
                monthNameMap: [
                    'time.January',
                    'time.February',
                    'time.March',
                    'time.April',
                    'time.May',
                    'time.June',
                    'time.July',
                    'time.August',
                    'time.September',
                    'time.October',
                    'time.November',
                    'time.December'
                ],
                anchor: null,
                tail: null,
                month: now,
            };
        },
        created() {
            if (this.value.length)
                this.month = getDateInstance(this.value[0]);
        },
        computed: {
            year() {
                return getYear(this.month);
            },
            days() {
                return this.getDaysForFullWeek(this.month);
            },
            weeks() {
                return this.splitDaysIntoWeeks(this.days);
            },
            weeksByMonth() {
                const map = {};
                let monthHead = startOfYear(this.month);
                for (let month = 1; month <= 12; month++) {
                    const days = this.getDaysForFullWeek(monthHead, true);
                    map[month] = this.splitDaysIntoWeeks(days, true);
                    monthHead = addMonths(monthHead, 1);
                }

                return map;
            }
        },
        watch: {
            value(newDateStrArr) {
                if (newDateStrArr.length) {
                    this.anchor = getDateInstance(newDateStrArr[0]);
                    this.tail = getDateInstance(newDateStrArr[newDateStrArr.length - 1]);
                } else {
                    this.anchor = null;
                    this.tail = null;
                }
            }
        },
        mounted() {
            if (this.value.length) {
                this.anchor = getDateInstance(this.value[0]);
                this.tail = getDateInstance(this.value[this.value.length - 1]);
            } else {
                this.anchor = null;
                this.tail = null;
            }
        },
        methods: {
            setYear(year) {
                this.year = year;
            },
            prev() {
                this.month = this.view === 'year' ? subYears(this.month, 1) : subMonths(this.month, 1);
            },
            next() {
                this.month = this.view === 'year' ? addYears(this.month, 1) : addMonths(this.month, 1);
            },
            getDaysForFullWeek(date, thisMonthOnly) {
                const bodyFirst = startOfMonth(date);
                const bodyLast = endOfMonth(date);
                const body = eachDay(bodyFirst, bodyLast);
                let head, tail;
                if (thisMonthOnly) {
                    head = new Array(differenceInCalendarDays(bodyFirst, startOfWeek(bodyFirst, {weekStartsOn: 1})))
                        .fill(null);
                    tail = new Array(differenceInCalendarDays(endOfWeek(bodyLast, {weekStartsOn: 1}), bodyLast)).fill(null);
                } else {
                    head = eachDay(startOfWeek(bodyFirst, {weekStartsOn: 1}), bodyFirst)
                        .slice(0, -1);
                    tail = eachDay(bodyLast, endOfWeek(bodyLast, {weekStartsOn: 1}))
                        .splice(1);
                }
                return [].concat(head, body, tail);
            },
            splitDaysIntoWeeks(days, atLeast6Week) {
                let weeks = [];
                const daysCopy = [].concat(days);

                while (daysCopy.length) {
                    weeks.push(daysCopy.splice(0, 7));
                }

                // 有的情况下，31天的月份会占用 6 个周，方便起见，全都补全到 6 个周
                if (atLeast6Week && weeks.length < 6) {
                    weeks.push(new Array(7).fill(null));
                }

                return weeks;
            },
            getDayClass(day) {
                const classes = [],
                    first = this.value[0] ? getDateInstance(this.value[0]) : null,
                    last = this.value[this.value.length - 1] ? getDateInstance(this.value[this.value.length - 1]) : null;
                const selected = this.contain(day, this.value);
                const selectedStart = isSameDay(first, day) || isSameDay(day, this.anchor);
                const selectedEnd = isSameDay(last, day) || isSameDay(day, this.tail);
                const before = isBefore(day, first) || isBefore(day, this.anchor);
                const after = isAfter(day, last) || isAfter(day, this.tail);

                if (selected) classes.push('selected');
                if (selectedStart) classes.push('start');
                if (selectedEnd) classes.push('end');
                if (before) classes.push('before');
                if (after) classes.push('after');
                if (this.disabledDate && this.disabledDate(day)) classes.push('disabled');

                return classes.join(' ');
            },
            contain(day, arr) {
                let dayStr = format(day, 'YYYY-MM-DD');
                return arr.some(item => dayStr === item);
            },
            setAnchor(day) {
                if (this.disabledDate && this.disabledDate(day)) return;
                if (this.tail) {
                    if (!isBefore(this.tail, day)) {
                        this.anchor = day;
                    }
                    this.emit();
                } else {
                    this.anchor = day;
                }
            },
            setTail(day) {
                if (this.disabledDate && this.disabledDate(day)) return;
                if (this.anchor) {
                    if (!isBefore(day, this.anchor)) {
                        this.tail = day;
                    }
                    this.emit();
                } else {
                    this.tail = day;
                }
            },
            emit() {
                if (this.anchor && this.tail) {
                    // 开始时间和结束时间不能选今天之后
                    let now = new Date().getTime();
                    let startTime = this.anchor.getTime();
                    let endTime = this.tail.getTime();
                    if (startTime > 0 && startTime > now) {
                        this.$toast(this.$t('time.startAfterToday'), 'warn');
                        this.clear();
                        return false;
                    }
                    if (endTime > 0 && endTime > now) {
                        this.$toast(this.$t('time.endAfterToday'), 'warn');
                        this.clear();
                        return false;
                    }
                    this.$emit('input', stringify(eachDay(this.anchor, this.tail)));
                }
            },
            clear() {
                this.anchor = null;
                this.tail = null;
                this.$emit('input', []);
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../scss/base/variables";
    @import "../scss/base/mixin";

    .date-picker {
        $cell-size: 20px;

        text-align: center;
        @include border-radius(4px);
        @include user-select(none);
        background-color: white;
        overflow: hidden;

        &.border {
            border: 1px solid $form-border;
        }

        table {
            border-collapse: collapse;
            border-spacing: 0;
            table-layout: fixed;
        }

        .prev-month,
        .next-month {
            position: relative;
            cursor: pointer;
            @include border-radius(4px);
            @include transition(bacground-color .2s ease);

            &:hover {
                background-color: $content-bg;
            }

            &:before {
                position: absolute;
                content: '';
                width: 0;
                height: 0;
                margin: 0 auto;
                border-bottom: 8px solid transparent;
                border-left: 8px solid $color-content;
                border-right: 8px solid transparent;

            }

            &:after {
                position: absolute;
                top: 12px;
                content: '';
                width: 6px;
                height: 4px;
                margin: 0 auto;
                background: $color-content;
            }
        }

        .prev-month {
            &:before {
                top: 7px;
                left: 9px;
                @include transform(rotate(-45deg));
            }

            &:after {
                left: 14px;
            }

        }

        .next-month {
            &:before {
                top: 13px;
                right: 9px;
                @include transform(rotate(135deg));
            }

            &:after {
                right: 14px;
            }
        }

        th,
        td {
            width: $cell-size;
            height: $cell-size;
            line-height: $cell-size;
            padding: 4px;
        }

        th {
            color: $color-content;
            font-weight: bold;

            &:not([class]) {
                cursor: default;
            }

            &[class] {
                cursor: pointer;
                @include border-radius(4px);
                @include transition(bacground-color .2s ease);

                &:hover {
                    background-color: $content-bg;
                }
            }
        }

        td {
            &.disabled {
                color: $color-light-content;
                cursor: not-allowed;
                &:hover {
                    @include border-radius(unset);
                    background-color: unset;
                }
            }

            &:not(.disabled) {
                cursor: pointer;
                @include transition(bacground .2s ease);
            }

            &.selected {
                color: white;
                @include linear-gradient(to bottom, rgba($theme, .5), rgba($theme, .7));
                @include border-radius(0);
                cursor: url("./date-range/selected.svg") 10 10, url("./date-range/selected.png") 10 10, pointer;
            }

            &.start {
                color: white;
                border-top-left-radius: 4px;
                border-bottom-left-radius: 4px;
                @include linear-gradient(to bottom, rgba($theme, .8), $theme);
            }

            &.end {
                color: white;
                border-top-right-radius: 4px;
                border-bottom-right-radius: 4px;
                @include linear-gradient(to bottom, rgba($theme, .8), $theme);
            }

            &.before:not(.disabled) {
                cursor: url("./date-range/right.svg") 10 10, url("./date-range/right.png") 10 10, pointer;
            }

            &.after:not(.disabled) {
                cursor: url("./date-range/left.svg") 10 10, url("./date-range/left.png") 10 10, pointer;
            }

            &:not(.selected):hover {
                @include border-radius(4px);
                background-color: $content-bg;
            }
        }

        .month-th-border {
            border-top: 2px solid $border-color;
            border-right: 2px solid $border-color;
            border-left: 2px solid $border-color;
            border-bottom: 1px solid $border-color;
        }

        .month-left-border {
            border-left: 2px solid $border-color;
        }

        .month-right-border {
            border-right: 2px solid $border-color;
        }

        .clear-btn {
            display: block;
            width: 100%;
            border: none;
            padding: 0;
            border-top: 1px solid $form-border;
            background-color: $title-bg;
            color: $theme;
            cursor: pointer;
            @include transition(background-color .2s ease);

            &:hover {
                background-color: darken($title-bg, 5%);
            }
        }
    }

</style>
