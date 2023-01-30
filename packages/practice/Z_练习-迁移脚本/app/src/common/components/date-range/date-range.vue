<template>
    <div class="date-range" :class="{open: isOpen, readonly, fixed: view === 'year'}" v-blur="close">
        <checkbox v-if="typeof dynamic !== 'undefined'" :value="!!dynamic" @input="toggleDynamic">
            {{'time.dynamic' | t}}
        </checkbox>
        <div class="trigger" :class="{placeholder: !currentRange}" @click="toggle" v-title:top.line="title">
            <svg aria-hidden="true">
                <use xlink:href="#icon-calendar"></use>
            </svg>
            <span class="text" v-text="text"></span>
        </div>
        <template v-if="isOpen">
            <transition name="drop">
                <table class="date-panel" :class="align" v-if="view === 'month'">
                    <tr class="panel-head">
                        <td>{{'time.dateRange' | t}}</td>
                        <td>{{'time.selectRange' | t}}</td>
                        <td>
                            <button type="button" class="btn btn-sm btn-blue" @click="view = 'year'">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-switch"></use>
                                </svg>
                                {{'time.monthView' | t}}
                            </button>
                        </td>
                    </tr>
                    <tr class="panel-content">
                        <td class="shortcut-list">
                            <template v-for="(shortcut, index) in shortcuts">
                                <button type="button" class="shortcut-btn btn btn-sm btn-theme-border"
                                        :title="shortcut.disabled ? `${$t('time.maxAvailable')} ${max} ${$t('time.day')}` : ''"
                                        :disabled="shortcut.disabled"
                                        @click="choose(shortcut.key)" v-text="shortcut.txt"
                                        :class="{'active': shortcut.key === matchedRangeKey, 'long': index > 7}">
                                </button>
                                <br v-if="index % 2 === 1 && index < 7">
                            </template>
                        </td>
                        <td colspan="2" class="calendar-area">
                            <date-picker :value="dates" :view="view" :disabled-date="disabledDate" @input="pickingDates"></date-picker>
                        </td>
                    </tr>
                    <tr class="panel-footer">
                        <td colspan="2">
                            <template v-if="comparable">
                                <checkbox class="tiny" :value="comparing" @input="toggleCompareRange"
                                          :disabled="hasPieSlice">
                                    {{'time.compareRange' | t}}
                                </checkbox>
                                <selector class="min-height" :disabled="!comparing" :options="COMPARE_SHORTCUT_OPTIONS"
                                          v-model="compareShortcut" @select="pickCompareShortcut"/>
                            </template>
                        </td>
                        <td>
                            <input type="button" class="btn btn-sm btn-theme-border" @click="close"
                                   :value="$t('common.cancel')">
                            <input type="button" class="btn btn-sm btn-theme"
                                   :disabled="confirmDisabled" :value="$t('common.confirm')" @click="confirmPick">
                        </td>
                    </tr>
                </table>
                <backdrop v-else>
                    <table class="date-panel" v-blur="close" :style="yearViewPositionStyle">
                        <tr class="panel-head">
                            <td>{{'time.dateRange' | t}}</td>
                            <td>{{'time.selectRange' | t}}
                                <button type="button" class="btn btn-sm btn-blue" @click="view = 'month'">
                                    <svg aria-hidden="true">
                                        <use xlink:href="#icon-switch"></use>
                                    </svg>
                                    {{'time.annualView' | t}}
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td class="shortcut-list">
                                <button type="button" class="shortcut-btn btn btn-md btn-theme-border long"
                                        v-for="(shortcut, index) in shortcuts"
                                        :title="shortcut.disabled ? `${$t('time.maxAvailable')} ${max} ${$t('time.day')}` : ''"
                                        :disabled="shortcut.disabled"
                                        @click="choose(shortcut.key)" v-text="shortcut.txt"
                                        :class="{'active': shortcut.key === matchedRangeKey}">
                                </button>
                            </td>
                            <td class="calendar-area">
                                <date-picker :value="dates" :disabledDate="disabledDate"
                                             :view="view" @input="pickingDates"></date-picker>
                            </td>
                        </tr>
                        <tr class="panel-footer">
                            <td>
                                <template v-if="comparable">
                                    <checkbox class="tiny" :value="comparing" @input="toggleCompareRange"
                                              :disabled="hasPieSlice">
                                        {{'time.compareRange' | t}}
                                    </checkbox>
                                    <selector class="min-height" :disabled="!comparing"
                                              :options="COMPARE_SHORTCUT_OPTIONS"
                                              v-model="compareShortcut"
                                              @select="pickCompareShortcut"/>
                                </template>
                            </td>
                            <td>
                                <input type="button" class="btn btn-sm btn-theme-border" @click="close"
                                       :value="$t('common.cancel')">
                                <input type="button" class="btn btn-sm btn-theme"
                                       :disabled="confirmDisabled" :value="$t('common.confirm')" @click="confirmPick">
                            </td>
                        </tr>
                    </table>
                </backdrop>
            </transition>
        </template>
    </div>
</template>
<script type="text/ecmascript-6">
    /**
     * 日期区间选择器
     * 左侧快捷按钮，右侧日历拖选；
     * 只能选择连续区间；
     */
    import format from 'date-fns/format';
    import isEqual from 'lodash/isEqual';
    import {getDateInstance} from '../../../common/utils/dateUtils';
    import DatePicker from '../date-picker.vue';
    import Range from './Range';
    import RANGES, {SHORTCUTS, initRanges} from './RANGES';

    export default {
        name: 'date-range',
        props: {
            format: {
                type: String,
                'default': 'YYYY-MM-DD'
            },
            start: {
                type: String,
                required: true
            },
            end: {
                type: String,
                required: true
            },
            max: {
                type: Number,
                default: Infinity
            },            // 最大区间天数
            comparable: Boolean,    // 表征开启对比区间功能
            compareStart: String,
            compareEnd: String,
            readonly: Boolean,
            align: {
                type: String,
                default: 'right' // right left
            },
            title: {
                type: String,
                default: ''
            },
            dynamic: null,
            dynamicTimeParams: Array, // ["-5","0","day"]
            compareDynamicTimeParams: Array, // ["-5","0","week"]
            hasPieSlice: {
                type: Boolean,
                default: false,
            }, //有切片的饼图对比区间不可选
            partCuts: {
                type: Array,
                required: false,
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
                isOpen: false,
                view: 'month',
                currentRange: null,
                compareRange: null,
                comparing: false,   // 是否勾选了对比功能
                COMPARE_SHORTCUT_OPTIONS: [
                    {id: 'previous range', name: this.$t('time.previousRange'), range: null},
                    {id: 'previous year', name: this.$t('time.sameRangeLastYear'), range: null},
                ],
                compareShortcut: 'previous range',
                yearViewPositionStyle: '',
            };
        },
        computed: {
            dates() {
                const range = (this.comparable && this.comparing) ? this.compareRange : this.currentRange;
                return range ? range.getDatesInStr() : [];
            },
            text() {
                let str = '';
                let dynamicText, dynamicCompareTxt;
                let start, end, compareStart, compareEnd;

                for (let shortcut of this.shortcuts) {
                    if (RANGES[shortcut.key].isSameRange(this.currentRange)) {
                        dynamicText = shortcut.txt;
                    }
                    if (this.compareRange && RANGES[shortcut.key].isSameRange(this.compareRange)) {
                        dynamicCompareTxt = shortcut.txt;
                    }
                }

                if (this.currentRange) {
                    start = format(this.currentRange.start, 'YYYY-MM-DD');
                    end = format(this.currentRange.end, 'YYYY-MM-DD');

                    if (this.compareRange) {
                        compareStart = format(this.compareRange.start, 'YYYY-MM-DD');
                        compareEnd = format(this.compareRange.end, 'YYYY-MM-DD');
                    }

                    if (this.dynamic) {
                        str += (dynamicText || this.currentRange.dynamicText());
                        if (this.compareRange) {
                            str += '/' + (dynamicCompareTxt || this.compareRange.dynamicText());
                        }
                    } else {
                        if (this.compareRange) {
                            str = `${start}~${end}/${compareStart}~${compareEnd}`;
                        } else {
                            str = `${start}   ~   ${end}`;
                        }
                    }
                } else {
                    str = '~';
                }
                return str;
            },
            shortcuts() {
                if (this.partCuts && this.partCuts.length > 0) {
                    let partCuts = [];
                    SHORTCUTS.forEach(cut => {
                        this.partCuts.forEach(part => {
                            if (cut.key === part) {
                                partCuts.push(cut);
                            }
                        });
                    });
                    return partCuts.map(shortcut => Object.assign(
                        {},
                        shortcut,
                        {
                            disabled: this.max < RANGES[shortcut.key].daysCount(),
                            txt: this.$t(shortcut.txt)
                        }
                    ));
                }
                return SHORTCUTS.filter(short => short.key !== 'LAST_HALF_YEAR' && short.key !== 'LAST_90_DAYS').map(shortcut => Object.assign(
                    {},
                    shortcut,
                    {
                        disabled: this.max < RANGES[shortcut.key].daysCount(),
                        txt: this.$t(shortcut.txt)
                    }
                ));
            },
            matchedRangeKey() {
                const range = (this.comparable && this.comparing) ? this.compareRange : this.currentRange;
                const target = this.shortcuts.find(shortcut => RANGES[shortcut.key].isSameRange(range));
                return target ? target.key : '';
            },
            confirmDisabled() {
                return !this.currentRange
                    || (this.comparing && !this.compareRange)
                    || this.dates.length > this.max;
            }
        },
        watch: {
            compareRange(range) {
                const shortcut = this.COMPARE_SHORTCUT_OPTIONS
                    .find(shortcut => shortcut.range && shortcut.range.isSameRange(range));
                if (shortcut) {
                    this.compareShortcut = shortcut.id;
                } else {
                    this.compareShortcut = '';
                }
            },
            start(value) {
                if (!this.comparable && !value) {
                    this.recoverRange();
                } else {
                    if (!this.isOpen) this.recoverRange();
                }   
            },
            end() {
                if (!this.isOpen) this.recoverRange();
            },
            compareStart() {
                if (!this.isOpen) this.recoverRange();
            },
            compareEnd() {
                if (!this.isOpen) this.recoverRange();
            },
            dynamic() {
                if (!this.isOpen) this.recoverRange();
            },
            dynamicTimeParams() {
                if (!this.isOpen) this.recoverRange();
            },
            compareDynamicTimeParams() {
                if (!this.isOpen) this.recoverRange();
            },
            view() {
                this.calculateYearViewStyle();
            }
        },
        created() {
            // 设置系统开始时间
            let startDate = this.$store.state.user.createDate;
            initRanges(new Date(startDate));
        },
        mounted() {
            this.recoverRange();
            // 年视图居中样式
            this.calculateYearViewStyle();
            window.addEventListener('resize', this.calculateYearViewStyle, false);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.calculateYearViewStyle, false);
        },
        methods: {
            toggleDynamic(dynamic) {
                // 切换动态/静态时间，触发 change 事件
                this.$emit('update:dynamic', dynamic);
                this.$emit('changeDynamic', dynamic);
                if (dynamic) {
                    // 从 静态 切换到 动态
                    let unit, compareUnit;
                    for (let shortcut of this.shortcuts) {
                        if (RANGES[shortcut.key].isSameRange(this.currentRange)) {
                            unit = shortcut.unit;
                        }
                        if (this.compareRange && RANGES[shortcut.key].isSameRange(this.compareRange)) {
                            compareUnit = shortcut.unit;
                        }
                        if (unit && compareUnit) break;
                    }
                    this.$emit('change', {
                        start: '',
                        end: '',
                        dynamicTimeParams: this.currentRange.dynamicDescription(unit),
                        comparing: this.comparing,
                        ...(this.comparable ? {
                            compareStart: '',
                            compareEnd: '',
                            compareDynamicTimeParams: this.compareRange
                                ? this.compareRange.dynamicDescription(compareUnit)
                                : []
                        } : {}),
                    });
                } else {
                    // 从 动态 切换到 静态
                    this.$emit('change', {
                        start: format(this.currentRange.start, this.format),
                        end: format(this.currentRange.end, this.format),
                        dynamicTimeParams: [],
                        comparing: this.comparing,
                        ...(this.comparable ? {
                            compareStart: this.compareRange ? format(this.compareRange.start, this.format) : '',
                            compareEnd: this.compareRange ? format(this.compareRange.end, this.format) : '',
                            compareDynamicTimeParams: []
                        } : {}),
                    });
                }
                this.$emit('update:dateRangeText', this.text);
                this.$nextTick(() => {
                    this.isOpen = false;
                });
            },
            calculateYearViewStyle() {
                if (this.view === 'month') {
                    this.yearViewPositionStyle = '';
                } else {
                    let xOffset = ((document.body.offsetWidth / 2) - 500);
                    this.yearViewPositionStyle = `-webkit-transform: translateX(${xOffset}px);
                        -moz-transform: translateX(${xOffset}px);
                        -ms-transform: translateX(${xOffset}px);
                        -o-transform: translateX(${xOffset}px);
                        transform: translateX(${xOffset}px);`.replace(' ', '');
                }
            },
            open() {
                this.isOpen = true;
            },
            close() {
                if (!this.isOpen) return;
                this.$nextTick(() => {
                    this.isOpen = false;
                });
                this.recoverRange();
            },
            toggle() {
                if (this.readonly) return;
                if (this.isOpen) {
                    this.close();
                } else {
                    this.open();
                }
            },
            recoverRange() {
                if (this.dynamic) {
                    if (this.dynamicTimeParams.length === 3) {
                        this.currentRange = new Range(...this.dynamicTimeParams);
                        this.COMPARE_SHORTCUT_OPTIONS = [
                            {
                                id: 'previous range',
                                name: this.$t('time.previousRange'),
                                range: this.currentRange.shift()
                            },
                            {
                                id: 'previous year',
                                name: this.$t('time.sameRangeLastYear'),
                                range: this.currentRange.shift(365)
                            },
                        ];
                    }
                    if (this.comparable && this.compareDynamicTimeParams.length === 3) {
                        this.comparing = true;
                        this.compareRange = new Range(...this.compareDynamicTimeParams);
                    } else {
                        this.comparing = false;
                        this.compareRange = null;
                    }
                } else {
                    if (this.start && this.end) {
                        this.currentRange = new Range(this.start, this.end);
                        this.COMPARE_SHORTCUT_OPTIONS = [
                            {
                                id: 'previous range',
                                name: this.$t('time.previousRange'),
                                range: this.currentRange.shift()
                            },
                            {
                                id: 'previous year',
                                name: this.$t('time.sameRangeLastYear'),
                                range: this.currentRange.shift(365)
                            },
                        ];
                    }
                    if (!this.start || !this.end) {
                        this.currentRange = null;
                    }
                    if (this.comparable && this.compareStart && this.compareEnd) {
                        this.comparing = true;
                        this.compareRange = new Range(this.compareStart, this.compareEnd);
                    } else {
                        this.comparing = false;
                        this.compareRange = null;
                    }
                }
                this.$nextTick(() => {
                    this.$emit('update:dateRangeText', this.text);
                });
            },
            toggleCompareRange() {
                this.comparing = !this.comparing;
                if (this.comparing) {
                    this.COMPARE_SHORTCUT_OPTIONS = [
                        {
                            id: 'previous range',
                            name: this.$t('time.previousRange'),
                            range: this.currentRange.shift()
                        },
                        {
                            id: 'previous year',
                            name: this.$t('time.sameRangeLastYear'),
                            range: this.currentRange.shift(365)
                        },
                    ];
                    // 初始化compareRange
                    this.pickCompareShortcut(this.COMPARE_SHORTCUT_OPTIONS[0]);
                }
            },
            pickCompareShortcut(shortcut) {
                this.compareRange = shortcut.range;
                this.compareShortcut = shortcut.id;
            },
            pickingDates(dateStrs) {
                const len = dateStrs.length;
                if (len) {
                    let first = getDateInstance(dateStrs[0]),
                        last = getDateInstance(dateStrs[len - 1]);
                    if (this.comparing) {
                        this.compareRange = new Range(first, last);
                    } else {
                        this.currentRange = new Range(first, last);
                    }
                } else {
                    if (this.comparing) {
                        this.compareRange = null;
                    } else {
                        this.currentRange = null;
                    }
                }
            },
            chooseRange(range) {
                if (this.comparing) {
                    this.compareRange = range;
                } else {
                    this.currentRange = range;
                    this.compareRange = null;   // 直接选定一个非对比区间，关闭对比区间
                }
                if (this.dynamic) {
                    // 动态时间
                    let unit, compareUnit;
                    for (let shortcut of this.shortcuts) {
                        if (RANGES[shortcut.key].isSameRange(this.currentRange)) {
                            unit = shortcut.unit;
                        }
                        if (this.compareRange && RANGES[shortcut.key].isSameRange(this.compareRange)) {
                            compareUnit = shortcut.unit;
                        }
                        if (unit && compareUnit) break;
                    }
                    this.$emit('change', {
                        start: '',
                        end: '',
                        dynamicTimeParams: this.currentRange.dynamicDescription(unit),
                        comparing: this.comparing,
                        ...(this.comparable ? {
                            compareStart: '',
                            compareEnd: '',
                            compareDynamicTimeParams: this.compareRange
                                ? this.compareRange.dynamicDescription(compareUnit)
                                : []
                        } : {}),
                    });
                } else {
                    // 静态时间
                    this.$emit('change', {
                        start: format(this.currentRange.start, this.format),
                        end: format(this.currentRange.end, this.format),
                        dynamicTimeParams: [],
                        comparing: this.comparing,
                        ...(this.comparable ? {
                            compareStart: this.compareRange ? format(this.compareRange.start, this.format) : '',
                            compareEnd: this.compareRange ? format(this.compareRange.end, this.format) : '',
                            compareDynamicTimeParams: []
                        } : {}),
                    });
                }
                this.$emit('update:dateRangeText', this.text);
            },
            choose(key) {
                RANGES.refresh();
                const range = RANGES[key];
                if (range) {
                    this.chooseRange(range);
                    this.$nextTick(() => {
                        this.isOpen = false;
                    });
                }
            },
            confirmPick() {
                let emitNecessary = false,
                    start = '',
                    end = '',
                    compareStart = '',
                    compareEnd = '',
                    dynamicTimeParams = [],
                    compareDynamicTimeParams = [];
                if (this.dynamic) {
                    // 如果没有打开对比区间，则清空对比区间
                    if (this.comparable && !this.comparing) {
                        this.compareRange = null;
                    }
                    // 动态时间
                    let unit, compareUnit;
                    for (let shortcut of this.shortcuts) {
                        if (RANGES[shortcut.key].isSameRange(this.currentRange)) {
                            unit = shortcut.unit;
                        }
                        if (this.compareRange && RANGES[shortcut.key].isSameRange(this.compareRange)) {
                            compareUnit = shortcut.unit;
                        }
                        if (unit && compareUnit) break;
                    }
                    dynamicTimeParams = this.currentRange.dynamicDescription(unit);
                    compareDynamicTimeParams = this.compareRange ? this.compareRange.dynamicDescription(compareUnit) : [];
                    if (
                        !isEqual(this.dynamicTimeParams, dynamicTimeParams)
                        || !isEqual(this.compareDynamicTimeParams, compareDynamicTimeParams)
                    ) {
                        emitNecessary = true;
                    }
                } else {
                    // 静态时间
                    if (this.currentRange) {
                        start = format(this.currentRange.start, this.format);
                        end = format(this.currentRange.end, this.format);
                        if (this.start !== start || this.end !== end) {
                            emitNecessary = true;
                        }
                    }
                    if (this.comparable) {
                        // 如果没有打开对比区间，则清空对比区间
                        if (!this.comparing) {
                            this.compareRange = null;
                        }

                        compareStart = this.compareRange ? format(this.compareRange.start, this.format) : '';
                        compareEnd = this.compareRange ? format(this.compareRange.end, this.format) : '';
                        if (this.compareStart !== compareStart || this.compareEnd !== compareEnd) {
                            emitNecessary = true;
                        }
                    }
                }
                if (emitNecessary) {
                    this.$emit('change', {
                        start,
                        end,
                        dynamicTimeParams,
                        ...(this.comparable ? {
                            compareStart,
                            compareEnd,
                            compareDynamicTimeParams
                        } : {}),
                        comparing: this.comparing
                    });
                    this.$emit('update:dateRangeText', this.text);
                }
                this.$nextTick(() => {
                    this.isOpen = false;
                });
            }
        },
        components: {
            DatePicker
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .date-range {
        position: relative;
        display: inline-block;
        height: $input-field-height;
        line-height: $input-field-height - 2px;
        vertical-align: top;
        white-space: nowrap;
        @include user-select(none);

        &.readonly {
            background-color: #fafafa;
        }

        &.open {
            .trigger {
                border-color: $theme;
                @include box-shadow(0 0 4px rgba(#2ecbb5, .35));
                z-index: 1;
            }

            &.fixed {
                z-index: $index-popup + 1;

                .date-panel {
                    margin-bottom: $input-field-height + 8px;
                    right: auto;
                    left: auto;
                }
            }
        }

        &.overlap-right {
            .trigger {
                border-top-right-radius: 0;
                border-bottom-right-radius: 0;

                &:hover,
                &.active {
                    z-index: 1;
                }
            }
        }

        .checkbox {
            vertical-align: middle;
        }

        .trigger {
            position: relative;
            display: inline-block;
            min-width: 200px;
            height: $input-field-height - 2px;
            padding: 0 8px;
            border: 1px solid $form-border;
            @include border-radius(4px);
            vertical-align: top;
            overflow: hidden;
            background-color: white;
            text-align: center;
            cursor: pointer;

            .text {
                white-space: pre-wrap;
            }

            svg {
                float: right;
                fill: $disabled;
                width: 18px;
                height: 18px;
                margin: ($input-field-height - 18px - 2px)/2 0 0 8px;
            }

            &.placeholder {
                color: $disabled;
            }

            &:not(.placeholder) {
                color: $color-content;
            }

            &:hover {
                border-color: $light-theme;
            }
        }

        .date-panel {
            position: absolute;
            border-spacing: 0;
            border-radius: 4px;
            z-index: $index-menu - 1;
            top: $input-field-height + 5px;
            border: 1px solid $border-color;
            background-color: white;
            @include box-shadow(0 3px 8px rgba(#8b9daf, .16));
            @include transform-origin(top);
            @include transition(all .2s ease);

            &.right {
                right: 0;
            }

            &.left {
                left: 0;
            }

            $shortcut-width: 132px;

            .panel-head {
                text-align: center;
                background-color: $title-bg;
                line-height: 39px;
                border-bottom: 1px solid $border-color;
                color: $color-light-content;
            }

            .shortcut-list {
                padding: 16px 8px 16px 16px;
                vertical-align: top;

                .shortcut-btn {
                    @include transition();

                    &.long {
                        display: block;
                        width: 100%;
                        margin-left: 0;
                    }

                    &:not(:last-child) {
                        margin-bottom: 8px;
                    }

                    &:not(.long) {
                        width: calc(50% - 6px);

                        &:nth-of-type(2n + 1) {
                            margin-left: 0;
                        }
                    }
                }
            }

            .calendar-area {
                padding: 16px 16px 16px 8px;
            }

            .panel-footer {
                text-align: right;
                line-height: 39px;
                border-top: 1px solid $border-color;
                background-color: $title-bg;

                td {
                    padding: 0 12px;
                }
            }
        }
    }

</style>
