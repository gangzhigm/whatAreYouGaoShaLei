<template>
    <div class="date-selector-picker">
        <table>
            <thead>
            <tr>
                <th class="prev-month" @click="prevMonth"></th>
                <th colspan="5">
                    {{monthsText}} {{years.join('-')}}
                </th>
                <th class="next-month" @click="nextMonth"></th>
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
            <tbody>
            <tr v-for="(week, weekCount) in weeks">
                <td v-for="day in week" :key="day.toString()" :class="getDayClass(day)" :title="mark(day)"
                    @mousedown="selectStart(day, $event)" @mousemove="selectMove(day, $event)"
                    @mouseup="selectEnd(day, $event)">
                    {{day.getDate()}}
                </td>
            </tr>
            </tbody>
        </table>
        <input type="button" @mouseover="touchBottom" @click="clear" class="clear-btn" :value="$t('common.clear')">
    </div>
</template>
<script type="text/ecmascript-6">

    import {
        addDays,
        addMonths,
        eachDay,
        endOfMonth,
        endOfWeek,
        format,
        getMonth,
        getYear,
        isAfter,
        isSameDay,
        startOfMonth,
        startOfWeek,
        subDays,
        subMonths
    } from 'date-fns';
    import {getDateInstance, sortDates, stringify} from '../../../../common/utils/dateUtils';

    const now = new Date();
    const MAX_MONTH_COUNT = 3;
    const MAX_DAY_COUNT = 60;

    export default {
        name: 'date-selector-picker',
        props: {
            value: {
                type: Array,
                required: true
            },
            marks: {
                type: Object
            },
            markTitle: {
                type: String
            }
        },
        data() {
            return {
                monthNameMap: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                anchor: null,
                selecting: false,
                selectingRange: [],
                target: null,
                months: [now]
            };
        },
        computed: {
            selection() {
                return this.value.map(date => {
                    if (date instanceof Date) {
                        return date;
                    }
                    return getDateInstance(date);
                });
            },
            monthsNames() { // 所有月份的名称map
                return this.months.map(month => this.monthNameMap[getMonth(month)]);
            },
            monthsText() { // 顶部月份文字
                const headMonthText = this.monthsNames[0];
                return this.months.length > 1
                    ? headMonthText + ' - ' + this.monthsNames[this.months.length - 1]
                    : headMonthText;
            },
            years() {
                const years = this.months.map(monthDate => getYear(monthDate));
                return [...new Set(years)];
            },
            days() {
                const bodyFirst = startOfMonth(this.months[0]);
                const bodyLast = endOfMonth(this.months[this.months.length - 1]);
                const body = eachDay(bodyFirst, bodyLast);
                const head = eachDay(startOfWeek(bodyFirst, {weekStartsOn: 1}), bodyFirst).slice(0, -1);
                const tail = eachDay(bodyLast, endOfWeek(bodyLast, {weekStartsOn: 1})).splice(1);
                return [].concat(head, body, tail);
            },
            weeks() {
                let weeks = [];
                const daysCopy = [].concat(this.days);

                while (daysCopy.length) {
                    weeks.push(daysCopy.splice(0, 7));
                }

                return weeks;
            }
        },
        methods: {
            mark(day) {
                if (this.marks) {
                    let markCount = this.marks[format(day, 'YYYY-MM-DD')];
                    if (markCount) return this.markTitle.replace('{value}', markCount);
                }
                return false;
            },
            setYear(year) {
                this.years = [year];
            },
            prevMonth() {
                const newHead = subMonths(this.months[0], 1);
                this.months.pop();
                this.months.unshift(newHead);
            },
            nextMonth() {
                const newTail = addMonths(this.months[this.months.length - 1], 1);
                this.months.shift();
                this.months.push(newTail);
            },
            getDayClass(day) {
                const classes = [];
                const prevDay = subDays(day, 1);
                const nextDay = addDays(day, 1);
                const selected = this.contain(day, this.selection);
                const selectedStart = selected && !this.contain(prevDay, this.selection);
                const selectedEnd = selected && !this.contain(nextDay, this.selection);
                const selecting = this.contain(day, this.selectingRange);
                const selectingStart = selecting && !this.contain(prevDay, this.selectingRange);
                const selectingEnd = selecting && !this.contain(nextDay, this.selectingRange);

                if (selecting && selected) {
                    classes.push('selected');
                    classes.push('selecting');

                    if (selectingStart && selectedStart) classes.push('start');
                    if (selectingEnd && selectedEnd) classes.push('end');
                } else {
                    if (selecting) {
                        classes.push('selecting');
                        if (selectingStart) classes.push('start');
                        if (selectingEnd) classes.push('end');
                    }
                    if (selected) {
                        classes.push('selected');
                        if (selectedStart) classes.push('start');
                        if (selectedEnd) classes.push('end');
                    }
                }

                return classes.join(' ');
            },
            contain(day, arr) {
                return arr.some(item => isSameDay(day, item));
            },
            /**
             * 划选开始
             * @param day
             * @param evt
             */
            selectStart(day, /*evt*/) {
                this.selecting = true;
                this.selectingRange = [];
                this.anchor = day;
            },
            // 划选时剩余可用数
            selectableCount(wishingRange) {
                const range = wishingRange || this.selectingRange;
                let count = this.selection.length;

                for (let i = 0, l = range.length; i < l; i++) {
                    if (this.contain(range[i], this.selection))
                        count--;
                }

                return MAX_DAY_COUNT - count - range.length;
            },
            selectMove(day, /*evt*/) {
                if (this.selecting && !isSameDay(day, this.target)) {

                    const forwards = isAfter(day, this.anchor);
                    let start, end;
                    if (forwards) {
                        start = this.anchor;
                        end = day;
                    } else {
                        start = day;
                        end = this.anchor;
                    }
                    // try to select as much as possible
                    if (this.selectableCount(eachDay(start, end)) < 0) {
                        let availableCounts = this.selectableCount([]);

                        for (let i = 0; i < availableCounts; i++) {
                            const step = forwards ? addDays(start, i) : subDays(end, i);
                            if (this.contain(step, this.selection)) availableCounts++;
                        }

                        if (forwards)
                            end = addDays(start, availableCounts - 1);
                        else
                            start = subDays(end, availableCounts - 1);
                    } else {
                        this.selectingRange = eachDay(start, end);
                    }
                    this.target = day;
                }
            },
            touchBottom() {
                if (this.selecting && this.selectableCount() > 0) {
                    // expand the calendar
                    if (this.months.length < MAX_MONTH_COUNT) {
                        const tailMonth = this.months[this.months.length - 1];
                        this.months.push(addMonths(tailMonth, 1));
                    }
                }
            },
            selectEnd(day, /*evt*/) {
                this.selecting = false;
                const result = this.selection.slice();

                if (isSameDay(this.anchor, day)) {
                    let index = result.findIndex(selected => isSameDay(selected, day));
                    if (index === -1) {
                        if (result.length < MAX_DAY_COUNT)
                            result.push(day);
                    } else {
                        result.splice(index, 1);
                    }
                    this.$emit('input', stringify(sortDates(result)));
                } else {
                    const range = this.selectingRange;
                    const hydrateRange = range.filter(day => !this.contain(day, this.selection));
                    this.$emit('input', stringify(sortDates(hydrateRange.concat(this.selection))));
                }

                this.selectingRange = [];
                this.anchor = null;
                this.target = null;
            },
            clear() {
                this.$emit('input', []);
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .date-selector-picker {
        $cell-size: 20px;

        text-align: center;
        @include user-select(none);
        background-color: white;

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
            padding: 4px 5px;
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
            // marked
            &[title]:after {
                content: '';
                display: block;
                height: 0;
                width: 10px;
                margin: -2px auto 0;
                border-bottom: 2px solid $theme;
            }

            &.disabled {
                color: $color-light-content;
                cursor: not-allowed;
            }

            &:not(.disabled) {
                cursor: pointer;
                @include transition(bacground .2s ease);
            }

            &.selecting,
            &.selected {
                color: white;
                @include linear-gradient(to bottom, #616161, #383838);
                @include border-radius(0);
            }

            &.start {
                border-top-left-radius: 4px;
                border-bottom-left-radius: 4px;
            }

            &.end {
                border-top-right-radius: 4px;
                border-bottom-right-radius: 4px;
            }

            &:not(.selected):hover {
                @include border-radius(4px);
                background-color: $content-bg;
            }
        }

        .clear-btn {
            display: block;
            width: 100%;
            border: none;
            padding: 0;
            color: inherit;
            background-color: $content-bg;
            cursor: pointer;
            @include transition(background-color .2s ease);

            &:hover {
                background-color: #e0e0e0;
            }
        }
    }

</style>
