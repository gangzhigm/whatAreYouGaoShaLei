<template>
    <div class="date-selector" :class="isOpen ? 'open' : ''" v-blur="close">
        <label class="trigger">
            <input type="text" :value="text" @click="toggle" readonly aria-readonly="true">
            <span class="icon icon-calendar"></span>
            <!--<span class="dash">{{'data.to' | t}}</span>-->
            <!--<input type="text" :value="last" @click="open" @blur="close" readonly aria-readonly="true">-->
        </label>
        <span v-if="dates.length">&nbsp;{{'data.chosenRangeA' | t}}&nbsp;<span
                class="theme-text">{{dates.length}}</span>&nbsp;{{'data.chosenRangeB' | t}}</span>
        <transition name="drop">
            <div class="date-panel" v-show="isOpen">
                <div class="panel-btns">
                    <input type="button" class="btn btn-md btn-round btn-white" :value="$t('data.absoluteDate')"
                           @click="type = 'calendar'" :class="{'active': type === 'calendar'}">
                    <input type="button" class="btn btn-md btn-round btn-white" :value="$t('data.relativeDate')"
                           @click="type = 'shortcut'" :class="{'active': type === 'shortcut'}">
                </div>
                <date-selector-picker v-if="type === 'calendar'" :value="dates"
                                      :marks="dateTaskMap"
                                      :markTitle="`{value}${$t('journey.unit') + $t('journey.task')}`"
                                      @input="pickingDates"></date-selector-picker>
                <ul v-else class="shortcut-list">
                    <li @click="choose(SHORTCUTS.TODAY)"
                        :class="{'active': SHORTCUTS.TODAY === matchedRangeKey}">{{'data.today' | t}}
                    </li>
                    <li @click="choose(SHORTCUTS.YESTERDAY)"
                        :class="{'active': SHORTCUTS.YESTERDAY === matchedRangeKey}">
                        {{'data.yesterday' | t}}
                    </li>
                    <li @click="choose(SHORTCUTS.LAST_WEEK)"
                        :class="{'active': SHORTCUTS.LAST_WEEK === matchedRangeKey}">
                        {{'data.lastWeek' | t}}
                    </li>
                    <li @click="choose(SHORTCUTS.LAST_MONTH)"
                        :class="{'active': SHORTCUTS.LAST_MONTH === matchedRangeKey}">
                        {{'data.lastMonth' | t}}
                    </li>
                    <li @click="choose(SHORTCUTS.LAST_7_DAYS)"
                        :class="{'active': SHORTCUTS.LAST_7_DAYS === matchedRangeKey}">
                        {{'data.latestWeek' | t}}
                    </li>
                    <li @click="choose(SHORTCUTS.LAST_30_DAYS)"
                        :class="{'active': SHORTCUTS.LAST_30_DAYS === matchedRangeKey}">
                        {{'data.latestMonth' | t}}
                    </li>
                    <!-- <li @click="choose(SHORTCUTS.LAST_60_DAYS)"
                        :class="{'active': SHORTCUTS.LAST_60_DAYS === matchedRangeKey}">
                        {{'data.latest2Month' | t}}
                    </li> -->
                </ul>
            </div>
        </transition>
    </div>
</template>
<script type="text/ecmascript-6">

    import { JourneyApiV1 } from '@/api';
    import {
        differenceInDays,
        isAfter,
        isSameDay,
        isToday,
        startOfMonth,
        startOfWeek,
        startOfYesterday,
        subDays
    } from 'date-fns';
    import {getDateInstance} from '../../../../common/utils/dateUtils';
    import Range from '../../../../common/components/date-range/Range';
    import DateSelectorPicker from './date-selector-picker.vue';
    
    const TODAY = 'TODAY',
        YESTERDAY = 'YESTERDAY',
        LAST_WEEK = 'LAST_WEEK',
        LAST_MONTH = 'LAST_MONTH',
        LAST_7_DAYS = 'LAST_7_DAYS',
        LAST_30_DAYS = 'LAST_30_DAYS',
        LAST_60_DAYS = 'LAST_60_DAYS';
    
    export default {
        components: {
            DateSelectorPicker
        },
        props: {
            start: {
                type: String,
                required: true
            },
            end: {
                type: String,
                required: true
            },
            dates: {
                type: Array,
                required: true
            }
        },
        data() {
            return {
                isOpen: false,
                type: 'calendar',
                today: new Date(),
                dateTaskMap: {
                    // "2017-1-1": 112 日期：任务数
                },
                SHORTCUTS: {
                    TODAY,
                    YESTERDAY,
                    LAST_WEEK,
                    LAST_MONTH,
                    LAST_7_DAYS,
                    LAST_30_DAYS,
                    LAST_60_DAYS
                },
                RANGES: {
                    TODAY,
                    YESTERDAY,
                    LAST_WEEK,
                    LAST_MONTH,
                    LAST_7_DAYS,
                    LAST_30_DAYS,
                    LAST_60_DAYS
                }
            };
        },
        computed: {
            first() {
                const head = this.dates[0];
                if (!head) return this.start;
                if (!this.start) return head;
                
                return isAfter(getDateInstance(head), getDateInstance(this.start))
                    ? this.start
                    : head;
            },
            last() {
                const tail = this.dates[this.dates.length - 1];
                if (!tail) return this.end;
                if (!this.end) return tail;
                return isAfter(getDateInstance(tail), getDateInstance(this.end))
                    ? tail
                    : this.end;
            },
            matchedRangeKey() {
                const full = this.dates.length - 1 === differenceInDays(this.last, this.first);

                let matchedRangeKey = '';
                if (full) {
                    for (let rangeKey in this.RANGES) {
                        const range = this.RANGES[rangeKey];
                        if (isSameDay(range.start, this.first) && isSameDay(range.end, this.last)) {
                            matchedRangeKey = rangeKey;
                            break;
                        }
                    }
                }
                return matchedRangeKey;
            },
            text() {
                switch (this.matchedRangeKey) {
                    case TODAY:
                        return this.$t('data.today');
                    case YESTERDAY:
                        return this.$t('data.yesterday');
                    case LAST_WEEK:
                        return this.$t('data.lastWeek');
                    case LAST_MONTH:
                        return this.$t('data.lastMonth');
                    case LAST_7_DAYS:
                        return this.$t('data.latestWeek');
                    case LAST_30_DAYS:
                        return this.$t('data.latestMonth');
                    case LAST_60_DAYS:
                        return this.$t('data.latest2Month');
                    default:
                        if (!this.first && !this.last) {
                            return this.$t('common.selectHolder');
                        }
                        if (this.first === this.last) {
                            return this.first;
                        }
                        return this.first + ' ' + this.$t('data.to') + ' ' + this.last;
                }

            }
        },
        mounted() {
            this.initRanges();

            JourneyApiV1
                .getDateTaskMap()
                .then(({body: {data: {dateMap}}}) => {
                    this.dateTaskMap = dateMap;
                });
        },
        methods: {
            toggle() {
                this.isOpen = !this.isOpen;
            },
            open() {
                this.isOpen = true;
            },
            close() {
                this.isOpen = false;
            },
            pickingDates(dateStrs) {
                if (dateStrs.length > 30) {
                    this.$toast(this.$t('data.noMoreThan30Days'),'warn');
                    return;
                }
                this.$emit('update:start', '');
                this.$emit('update:end', '');
                this.$emit('update:dates', dateStrs);
                this.$emit('change');
            },
            initRanges() {
                const today = new Date();
                const yesterday = startOfYesterday();
                const thisWeekMonday = startOfWeek(today, {weekStartsOn: 1});
                const lastMonthTail = subDays(startOfMonth(today), 1);
                
                this.RANGES.updateDate = today;
                this.RANGES[TODAY] = new Range(today, today);
                this.RANGES[YESTERDAY] = new Range(yesterday, yesterday);
                this.RANGES[LAST_WEEK] = new Range(6, subDays(thisWeekMonday, 1));
                this.RANGES[LAST_MONTH] = new Range(startOfMonth(lastMonthTail), lastMonthTail);
                this.RANGES[LAST_7_DAYS] = new Range(6, today);
                this.RANGES[LAST_30_DAYS] = new Range(29, today);
                this.RANGES[LAST_60_DAYS] = new Range(59, today);
            },
            chooseRange(key) {
                const range = this.RANGES[key];
                const dates = range.getDatesInStr();
                if (dates.length === 1) {
                    this.$emit('update:start', '');
                    this.$emit('update:end', '');
                } else {
                    this.$emit('update:start', dates[0]);
                    this.$emit('update:end', dates[dates.length - 1]);
                }
                this.$emit('update:dates', dates);
                this.$emit('change');
            },
            choose(str) {
                if (!isToday(this.RANGES.updateDate)) {
                    this.initRanges();
                }
                
                switch (str) {
                    case TODAY:
                        this.chooseRange(TODAY);
                        break;
                    case YESTERDAY:
                        this.chooseRange(YESTERDAY);
                        break;
                    case LAST_WEEK:
                        this.chooseRange(LAST_WEEK);
                        break;
                    case LAST_MONTH:
                        this.chooseRange(LAST_MONTH);
                        break;
                    case LAST_7_DAYS:
                        this.chooseRange(LAST_7_DAYS);
                        break;
                    case LAST_30_DAYS:
                        this.chooseRange(LAST_30_DAYS);
                        break;
                    case LAST_60_DAYS:
                        this.chooseRange(LAST_60_DAYS);
                        break;
                }
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .date-selector {
        position: relative;
        display: inline-block;
        height: $input-field-height;
        line-height: $input-field-height -2px;
        white-space: nowrap;

        &.open {
            .trigger {
                @include box-shadow(0 3px 3px rgba(#030000, .07));
                
            }
            .dash {
                border-color: $border-color;
            }
        }

        .trigger {
            display: inline-block;
            position: relative;
            @include user-select(none);
            vertical-align: middle;
            overflow: hidden;

            [type="text"] {
                @include box-sizing();
                width: 200px;
                padding: 0 10px;
                line-height: $input-field-height - 2px;
                border: 1px solid $form-border;
                border-radius: 4px;
                color: $color-content;
                cursor: pointer;

                &:focus {
                    border-color: #cccccc;
                }
                &:hover {
                    border-color: $theme;
                } 
            }
            .icon-calendar {
                position: absolute;
                line-height: $input-field-height;
                right: 10px;
                top: 0;
            }
            
        }

        .date-panel {
            position: absolute;
            z-index: 1;
            padding: 0 16px 8px;
            top: $input-field-height + 8px;
            left: -1px;
            border: 1px solid #e0e0e0;
            background-color: white;
            @include border-radius(3px);
            @include box-shadow(0 3px 3px rgba(#030000, .07));
            @include transform-origin(top);
            @include transition(all .2s ease);

            .panel-btns {
                padding: 8px 0;
                text-align: center;
            }
        }

        .shortcut-list {
            li {
                padding: 0 15px;
                line-height: $input-field-height;
                @include ellipsis();
                color: $color-light-content;

                &:not(.readonly) {
                    cursor: pointer;
                }

                &:hover,
                &:active {
                    color: $color-content;
                    background-color: #f0f0f0;
                }

                &.active {
                    color: white;
                    background-color: $theme;
                }
            }
        }
    }

</style>
