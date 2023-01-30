<template>
    <div class="board-chart" :class="size" @transitionend.self="resize">
        <template v-if="bookmark">
            <div class='title-content'>
                <div :class="{link: boardType !== 2}" class="board-chart-title">
                    <span class='bookmark-name' :title="bookmark.name"
                          @click="goToBookmark(bookmark)">{{bookmark.name}}&nbsp;</span>
                </div>
                <div v-if='bookmark.desc' class='bookmark-description'>
                    <svg aria-hidden="true" v-title="desc">
                        <use xlink:href="#icon-description"></use>
                    </svg>
                </div>
            </div>
            <div class="date-range-content"
                 v-if="isTable || dataType && attrColName && !isTable && bookmark.type === 3">
                <date-range format="YYYY-MM-DD HH:mm:ss" @change="rangeChange" class="overlap-right"
                            v-click-into-view :start="fromDate" :end="toDate"/>
            </div>
            <div class="date-range-content"
                 v-else-if="bookmark.type === 1">
                <date-range format="YYYY-MM-DD HH:mm:ss" @change="rangeChangeEvent" class="overlap-right"
                            :dynamic="dynamic" @changeDynamic="changeDynamic"
                            :dateRangeText.sync="dateRangeText"
                            :dynamicTimeParams="dateEventAnalysis.dynamicTimeParams"
                            :compareDynamicTimeParams="dateEventAnalysis.compareDynamicTimeParams"
                            :start="fromDate" :end="toDate" comparable
                            :compare-start="dateEventAnalysis.compareStart"
                            :compare-end="dateEventAnalysis.compareEnd"
                            :hasPieSlice="hasPieSlice"/>
            </div>
            <component :is="CHART_COMPONENTS[bookmark.type]" ref="chart" v-bind="dateEventAnalysis"
                       :name='bookmark.name'
                       :size="size"
                       :original-time="originalTime" :compare-time="compareTime" :start="fromDate" :end="toDate">
            </component>
            <div v-if="boardType&&boardType!== 2" class="board-chart-actions"
                 :class="{active: deleting || resizing || setting}">
                <div class="action" v-blur="cancelSetting">
                    <svg aria-hidden="true" class="board-chart-action-icon setting" :class="{active: setting}"
                         @click="setting = !setting">
                        <use xlink:href="#icon-setting"></use>
                    </svg>
                    <transition name="drop">
                        <ul class="chart-options" v-if="setting">
                            <li class="option" v-for="option in ACTION_OPTIONS"
                                @click="actionOnChart(option.id,bookmark)">
                                {{option.name}}
                            </li>
                        </ul>
                    </transition>
                </div>
                <div class="action" v-blur="cancelResize">
                    <svg aria-hidden="true" class="board-chart-action-icon layout" :class="{active: resizing}"
                         @click="resizing = !resizing">
                        <use xlink:href="#icon-layout"></use>
                    </svg>
                    <div class="layout-sizes" v-if="resizing">
                        <i class="tail" ref="tail"></i>
                        <button type="button" class="layout-size" v-for="s in sizes"
                                :class="{active: size === s.value}" @click="changeSize(s.value)">
                            <svg aria-hidden="true" class="layout-size-icon">
                                <use v-bind:xlink:href="'#icon-' + s.value"></use>
                            </svg>
                            {{s.text}}
                        </button>
                    </div>
                </div>
                <div class="action">
                    <svg aria-hidden="true" class="board-chart-action-icon delete" :class="{active: deleting}"
                         @click="deleting = true">
                        <use xlink:href="#icon-round-close"></use>
                    </svg>
                    <inline-confirm v-if="deleting" @cancel="deleting = false" :text="$t('common.delete')"
                                    @confirm="$emit('delete')"
                                    :bottom-offset="10"/>
                </div>
            </div>
        </template>
    </div>
</template>
<script>
    import EventChart from './event/event-chart.vue';
    import AttributeChart from './attribute/attribute-chart.vue';
    import VisualChart from './visual/visual-chart.vue';
    import {SHOW_SEARCH} from '@/store/vuex/mutationTypes.js';
    import RANGES, {SHORTCUTS} from '@/common/components/date-range/RANGES';
    import Range from '@/common/components/date-range/Range';
    import cloneDeep from 'lodash/cloneDeep';
    import {ANALYSIS_STORE_NAME} from '@/store/vuex/modules/analysisStore';
    // 默认的图表配置
    export const DEFAULT_CHART_CONFIG = {
        size: 'medium', // tiny, little, medium, large, extra-large
    };

    export default {
        name: 'chart',
        components: {
            AttributeChart,
            EventChart,
            VisualChart
        },
        props: {
            bookmarkId: Number,
            config: String,
            boardType: Number,
            groupId: Number,
        },
        data() {
            return {
                // 动态组件Map<bookmarkType, componentName> 0 属性 1 事件 3 可视化报告
                CHART_COMPONENTS: ['attribute-chart', 'event-chart', '', 'visual-chart'],
                deleting: false,
                resizing: false,
                sizes: [
                    // {text: '小', value: 'tiny'},
                    {text: this.$t('board.little'), value: 'little'},
                    {text: this.$t('board.medium'), value: 'medium'},
                    {text: this.$t('board.large'), value: 'large'},
                    {text: this.$t('board.extraLarge'), value: 'extra-large'},
                ],
                setting: false,
                // 其他操作
                ACTION_OPTIONS: [
                    {id: 'edit', name: this.$t('board.edit')},
                    // todo
                    // {id: 'share', name: '共享'},
                    // {id: 'setAsScheduledReport', name: '设置为定时报表'},
                    // {id: 'manageScheduledReport', name: '管理定时报表'},
                    // {id: 'sendThroughEmail', name: '立即发送'},
                    // {id: 'exportAsJPG', name: '导出为图片'},
                    // {id: 'exportAsPDF', name: '导出为PDF'}
                ],
                fromDate: '',
                toDate: '',
                fromDateString: '',
                toDateString: '',
                dateRangeText: '',
                dynamic: false,
                originalTimeOpt: null,
                compareTimeOpt: null,
                originalTime: '',
                compareTime: '',
            };
        },
        computed: {
            bookmark() {
                return this.$store.state[ANALYSIS_STORE_NAME].bookmarks.find(bookmark => bookmark.id === this.bookmarkId);
            },
            // 可视化报告数据集有定义的时间字段,且为非图表类型以及仪表图
            dataType() {
                let isShowDate = false;
                let unit = '';
                unit = JSON.parse(this.bookmark.filterStr).unit;
                switch (unit) {
                    case 'year':
                        this.defaultYearDate();
                        break;
                    case 'month':
                        this.defaultMonthDate();
                        break;
                    case 'week':
                        this.defaultWeekDate();
                        break;
                    case 'day':
                        this.defaultDayDate();
                        break;
                }
                unit ? isShowDate = true : isShowDate = false;
                return isShowDate;
            },
            // 图表为table类型
            isTable() {
                let chartType = JSON.parse(this.bookmark.filterStr).type;
                if (chartType === 'table') {
                    this.defaultLatedWeekDate();
                    return true;
                }
                return false;
            },
            // 可视化报告X轴选中的是时间类型的属性
            attrColName() {
                let isShowName = false;
                let attrColName = '';
                attrColName = JSON.parse(this.bookmark.conditionStr).attrColName;
                switch (attrColName) {
                    case 'r_year':
                    case 'r_month':
                    case 'r_week':
                    case 'r_day':
                        isShowName = true;
                        break;
                }
                return isShowName;
            },
            size() {
                const config = JSON.parse(this.config) || DEFAULT_CHART_CONFIG;
                return config.size;
            },
            // 绘图用的参数对象
            chartOptions() {
                const query = JSON.parse(this.bookmark.conditionStr);
                const filter = JSON.parse(this.bookmark.filterStr);
                return Object.assign(query, filter);
            },
            // 当前月份
            nowMonth() {
                //获取当前日期
                let time = new Date();
                return this.timeFormat(time.getMonth() + 1);
            },
            // 当前日期
            nowDay() {
                //获取当前日期
                let time = new Date();
                this.toDateString = time.getFullYear() + '-' + this.timeFormat(time.getMonth() + 1) + '-' + this.timeFormat(time.getDate());
                return time.getFullYear() + '-' + this.timeFormat(time.getMonth() + 1) + '-' + this.timeFormat(time.getDate()) + ' 00:00:00';
            },
            desc() {
                let bookmarkDesc = this.$t('board.description') + this.bookmark.desc;
                let descString = '';
                for (let i = 0; i < bookmarkDesc.length; i++) {
                    if (i % 15 === 0 && i !== 0) {
                        descString += '<br/>' + bookmarkDesc[i];
                    } else {
                        descString += bookmarkDesc[i];
                    }
                }
                return descString;
            },
            dateEventAnalysis: {
                get() {
                    let nameOriginal = cloneDeep(this.chartOptions);
                    this.dynamic = this.chartOptions.timeType === 'dynamic' ? true : false;
                    if (this.originalTimeOpt == null || this.compareTimeOpt == null) {
                        this.originalTimeOpt = this.getNameOrigin('original', nameOriginal);
                        this.compareTimeOpt = this.getNameOrigin('compare', nameOriginal);
                    }
                    return nameOriginal;
                }
            },
            hasPieSlice() {
                if (this.chartOptions.pieSlice && this.chartOptions.pieSlice > 0) {
                    return true;
                }
                return false;
            }
        },
        watch: {
            originalTimeOpt(val) {
                this.originalTime = val;
            },
            compareTimeOpt(val) {
                this.compareTime = val;
            },
            fromDate(val, old) {
                if (val !== old) {
                    if (this.bookmark.type === 3) {
                        this.$emit('date', {
                            fromDate: val,
                            toDate: this.toDate,
                            bookmarkId: this.bookmark.id,
                            groupId: this.groupId,
                            type: this.bookmark.type
                        });
                    } else {
                        this.$emit('date', {
                            fromDate: val,
                            toDate: this.toDate,
                            dateEventAnalysis: this.dateEventAnalysis,
                            bookmarkId: this.bookmark.id,
                            groupId: this.groupId,
                            type: this.bookmark.type
                        });
                    }
                }
            },
            toDate(val, old) {
                if (val !== old) {
                    if (this.bookmark.type === 3) {
                        this.$emit('date', {
                            fromDate: this.fromDate,
                            toDate: val,
                            bookmarkId: this.bookmark.id,
                            groupId: this.groupId,
                            type: this.bookmark.type
                        });
                    } else {
                        this.$emit('date', {
                            fromDate: this.fromDate,
                            toDate: val,
                            dateEventAnalysis: this.dateEventAnalysis,
                            bookmarkId: this.bookmark.id,
                            groupId: this.groupId,
                            type: this.bookmark.type
                        });
                    }
                }
            },
            dynamic(val, old) {
                if (val !== old) {
                    this.$emit('date', {
                        fromDate: this.fromDate,
                        toDate: this.toDate,
                        dateEventAnalysis: this.dateEventAnalysis,
                        bookmarkId: this.bookmark.id,
                        groupId: this.groupId,
                        type: this.bookmark.type
                    });
                }
            },
        },
        methods: {
            resize() {
                this.$refs.chart.resize();
            },
            changeSize(newSize) {
                if (newSize && newSize !== this.size) {
                    this.$emit('config', {size: newSize});
                }
            },
            refresh() {
                this.$refs.chart.refresh();
            },
            cancelResize() {
                this.resizing = false;
            },
            cancelSetting() {
                this.setting = false;
            },
            // 对图表的一些操作
            actionOnChart(action, mark) {
                if (action === 'edit') {
                    this.goToBookmark(mark);
                } else {
                    switch (action) {
                        default:
                            console.error('一个未定义的概览操作', action);
                    }
                }
            },
            goToBookmark(bookmark) {
                if (this.boardType && this.boardType === 2) {
                    return;
                }
                switch (bookmark.type) {
                    case 0:
                        this.$store.commit(SHOW_SEARCH);
                        this.$router.push({name: 'attribute', query: {bmsId: bookmark.id}});
                        break;
                    case 1:
                        this.$store.commit(SHOW_SEARCH);
                        this.$router.push({name: 'event', query: {bmsId: bookmark.id}});
                        break;
                    case 3:
                        this.$store.commit(SHOW_SEARCH);
                        this.$router.push({name: 'visualization', query: {bmsId: bookmark.id}});
                        break;
                }
            },
            // 可视化报告时间区间变化
            rangeChange({start, end}) {
                this.fromDate = start;
                this.toDate = end;
                this.$nextTick(() => {
                    this.refresh();
                });
            },
            // 事件分析时间区间变化
            rangeChangeEvent({start, end, compareStart, compareEnd, dynamicTimeParams, compareDynamicTimeParams}) {
                this.fromDate = start;
                this.toDate = end;
                this.dateEventAnalysis.start = start;
                this.dateEventAnalysis.end = end;
                this.dateEventAnalysis.compareStart = compareStart;
                this.dateEventAnalysis.compareEnd = compareEnd;
                this.dateEventAnalysis.dynamicTimeParams = dynamicTimeParams;
                this.dateEventAnalysis.compareDynamicTimeParams = compareDynamicTimeParams;
                this.dateEventAnalysis.timeType = this.dateEventAnalysis.dynamicTimeParams.length > 0 ? 'dynamic' : '';
                this.dateEventAnalysis.compareTimeType = this.dateEventAnalysis.dynamicTimeParams.length > 0 ? 'dynamic' : '';
                this.getNameOrigin('', this.dateEventAnalysis);
                this.$nextTick(() => {
                    this.refresh();
                });
            },

            timeFormat(value) {
                return value > 9 ? value : '0' + value;
            },
            // 可视化报告unit为month,默认展示最近12个月
            defaultMonthDate() {
                if (this.bookmark.type === 3 && JSON.parse(this.bookmark.filterStr).type !== 'gauge' && this.attrColName) {
                    this.toDate = this.nowDay;
                    let fromDay = '';
                    let time = new Date();
                    if (this.nowMonth === 12) {
                        fromDay = (time.getFullYear() - 1) + '-' + this.nowMonth + '-' + '01';
                    } else {
                        fromDay = (time.getFullYear() - 1) + '-' + (this.nowMonth + 1) + '-' + '01';
                    }
                    this.fromDate = fromDay + ' 00:00:00';
                    this.fromDateString = fromDay;
                }
            },
            // 可视化报告unit为year，默认展示最近5年
            defaultYearDate() {
                if (this.bookmark.type === 3 && JSON.parse(this.bookmark.filterStr).type !== 'gauge' && this.attrColName) {
                    let time = new Date();
                    this.toDate = this.nowDay;
                    this.fromDate = (time.getFullYear() - 5) + '-' + '01' + '-' + '01' + ' 00:00:00';
                    this.fromDateString = (time.getFullYear() - 5) + '-' + '01' + '-' + '01';
                }
            },
            // 可视化报告unit为day，默认展示最近30天
            defaultDayDate() {
                if (this.bookmark.type === 3 && JSON.parse(this.bookmark.filterStr).type !== 'gauge' && this.attrColName) {
                    let time = new Date();
                    let newDay = new Date(time - 1000 * 60 * 60 * 24 * 30);
                    this.toDate = this.nowDay;
                    this.fromDate = newDay.getFullYear() + '-' + this.timeFormat(newDay.getMonth() + 1) + '-' + this.timeFormat(newDay.getDate()) + ' 00:00:00';
                    this.fromDateString = newDay.getFullYear() + '-' + this.timeFormat(newDay.getMonth() + 1) + '-' + this.timeFormat(newDay.getDate());
                }
            },
            // 可视化报告unit为week，默认展示最近8周
            defaultWeekDate() {
                if (this.bookmark.type === 3 && JSON.parse(this.bookmark.filterStr).type !== 'gauge' && this.attrColName) {
                    let time = new Date();
                    let week = new Date().getDay();
                    let newDay;
                    if (week === 0) {
                        newDay = new Date(time - 1000 * 60 * 60 * 24 * (7 * 7 + week + 6));
                    } else {
                        newDay = new Date(time - 1000 * 60 * 60 * 24 * (7 * 7 + week - 1));
                    }
                    this.toDate = this.nowDay;
                    this.fromDate = newDay.getFullYear() + '-' + this.timeFormat(newDay.getMonth() + 1) + '-' + this.timeFormat(newDay.getDate()) + ' 00:00:00';
                    this.fromDateString = newDay.getFullYear() + '-' + this.timeFormat(newDay.getMonth() + 1) + '-' + this.timeFormat(newDay.getDate());
                }
            },
            // 当图表类型为'table'时，默认展示当周
            defaultLatedWeekDate() {
                if (this.bookmark.type === 3) {
                    let time = new Date();
                    let week = new Date().getDay();
                    let newDay;
                    if (week === 0) {
                        newDay = new Date(time - 1000 * 60 * 60 * 24 * (week + 6));
                    } else {
                        newDay = new Date(time - 1000 * 60 * 60 * 24 * (week - 1));
                    }
                    this.toDate = this.nowDay;
                    this.fromDate = newDay.getFullYear() + '-' + this.timeFormat(newDay.getMonth() + 1) + '-' + this.timeFormat(newDay.getDate()) + ' 00:00:00';
                    this.fromDateString = newDay.getFullYear() + '-' + this.timeFormat(newDay.getMonth() + 1) + '-' + this.timeFormat(newDay.getDate());
                }
            },
            changeDynamic(value) {
                this.dynamic = value;
                value ? this.dateEventAnalysis.timeType = 'dynamic' : '';
            },
            getNameOrigin(val, dataOrigin) {
                let s = '';
                let name = '';
                if (dataOrigin.timeType === 'dynamic') {
                    let currentRange = new Range(...dataOrigin.dynamicTimeParams),
                        compareRange = dataOrigin.compareDynamicTimeParams.length === 0
                            ? null : new Range(...dataOrigin.compareDynamicTimeParams),
                        txt = currentRange.dynamicText(),
                        compareTxt = compareRange ? compareRange.dynamicText() : '';
                    for (let shortcut of SHORTCUTS) {
                        if (RANGES[shortcut.key].isSameRange(currentRange)) {
                            txt = this.$t(shortcut.txt);
                        }
                        if (compareRange && RANGES[shortcut.key].isSameRange(compareRange)) {
                            compareTxt = this.$t(shortcut.txt);
                        }
                    }
                    s = txt + (compareTxt ? '/' + compareTxt : '');
                } else if (dataOrigin.start && dataOrigin.end) {
                    s = dataOrigin.start.slice(0, 10) + ' 至 ' + dataOrigin.end.slice(0, 10);
                    this.fromDate = dataOrigin.start;
                    this.toDate = dataOrigin.end;
                    if (dataOrigin.compareStart) {
                        s += '/' + dataOrigin.compareStart.slice(0, 10) + ' 至 '
                            + dataOrigin.compareEnd.slice(0, 10);
                    }
                }
                if (val === 'original') {
                    name = s.split('/')[0];
                    return name;
                } else if (val === 'compare') {
                    name = s.split('/').length > 1 ? s.split('/')[1] : '';
                    return name;
                }
                this.originalTime = s.split('/')[0];
                this.compareTime = s.split('/').length > 1 ? s.split('/')[1] : '';
            }
        }
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .board-chart {

        $gutter: 24px;
        $base-height: 230px;

        display: inline-block;
        @include box-sizing();
        position: relative;
        margin: $gutter/2;
        padding: 10px 16px 16px 16px;
        border: 1px solid $border-color;
        vertical-align: top;
        background-color: white;
        @include transition(width .2s ease, height .2s ease);
        @include user-select(none);

        .title-content {
            display: flex;
            width: calc(100% - 144px);
            height: 14px;
            line-height: 14px;
            margin-bottom: 10px;
        }

        $data-range-h: 20px;

        .date-range-content {
            height: $data-range-h;
            line-height: $data-range-h;
            color: $color-light-content;
            margin-bottom: 10px;
        }

        &.tiny {
            width: calc(25% - #{$gutter});
            height: $base-height;
        }

        &.little {
            width: calc(25% - #{$gutter});
            height: 2 * $base-height;
        }

        &.medium {
            width: calc(33% - #{$gutter});
            height: 2 * $base-height;
        }

        &.large {
            width: calc(50% - #{$gutter});
            height: 2 * $base-height;
        }

        &.extra-large {
            width: calc(100% - #{$gutter});
            height: 2 * $base-height;
        }

        &:hover {
            border-color: white;
            @include box-shadow(0 3px 8px rgba(#8b9daf, .24));

            .board-chart-title {
                color: $color-content;
            }

            .board-chart-actions {
                opacity: 1;
            }
        }

        .board-chart-title {
            height: 14px;
            line-height: 14px;
            font-weight: bold;
            font-size: 14px;
            color: $color-content;
            overflow: hidden;

            &.link {
                cursor: pointer;

                &:hover {
                    color: $blue;
                    text-decoration: underline;
                }

                &:active {
                    color: $dark-blue;
                }
            }

            .bookmark-name {
                display: inline-block;
                width: 100%;
                @include ellipsis();
            }
        }

        .board-chart-sub-title {
            color: $disabled;
            height: 12px;
            width: 70%;
            line-height: 12px;
            font-size: 12px;
            margin-bottom: 10px;
            @include ellipsis();
        }

        .visual-title {
            cursor: pointer;

            &:hover {
                color: $light-theme;
            }
        }

        @at-root .board-chart-actions {
            position: absolute;
            bottom: 8px;
            right: 16px;
            padding: 9px 16px;
            text-align: right;
            opacity: 0;
            @include transition(opacity .2s ease);

            &.active {
                opacity: 1;
            }

            .action {
                position: relative;
                float: right;
                padding: 0;
                border: none;
                outline: none;
                margin-left: 16px;
                @include appearance(none);
                background-color: transparent;
                border-radius: 3px;

                @at-root .board-chart-action-icon {
                    display: block;
                    width: 14px;
                    height: 14px;
                    fill: $disabled;
                    cursor: pointer;
                    @include transition(fill .2s ease);

                    &.delete {
                        &:hover {
                            fill: $light-red;
                        }

                        &.active,
                        &:active {
                            fill: $red;
                        }
                    }

                    &.layout {
                        &:hover {
                            fill: $light-blue;
                        }

                        &.active,
                        &:active {
                            fill: $blue;
                        }
                    }

                    &.setting {
                        &:hover {
                            fill: $light-theme;
                        }

                        &.active,
                        &:active {
                            fill: $green;
                        }
                    }
                }
            }
        }

        .chart-options {
            position: absolute;
            z-index: 2;
            top: 30px;
            right: -18px;
            border: 1px solid $select-border;
            background-color: white;
            @include box-shadow(0 3px 8px rgba(#8b9daf, .16));
            @include transform-origin(top);
            @include border-radius(4px);
            max-height: $input-field-height * 5 + 6px;
            overflow: auto;

            .option {
                padding: 0 1em;
                text-align: left;
                color: $color-content;
                @include ellipsis();
                cursor: pointer;
                line-height: $input-field-height;
                margin: 1px 0;

                &:last-child {
                    margin-bottom: 0;
                }

                &:hover {
                    background-color: $hover-bg;
                }
            }
        }

        .layout-sizes {
            position: absolute;
            z-index: 2;
            top: 30px;
            right: -47px;
            padding: 16px 16px 8px;
            white-space: nowrap;
            background-color: white;
            border-radius: 4px;
            text-align: center;
            border: 1px solid $border-color;
            @include box-shadow(0 3px 8px rgba(#8b9daf, .16));

            .tail {
                $size: 5px * 1.414;
                position: absolute;
                z-index: 1;
                top: 0;
                right: 48px;
                width: $size;
                height: $size;
                margin: (-$size/2) 0 0 (-$size/2);
                border-top: 1px solid $border-color;
                border-left: 1px solid $border-color;
                border-top-left-radius: 2px;
                background-color: white;
                @include transform(rotate(45deg));
                @include box-shadow(-1px -1px 1px rgba(#8b9daf, .16));
            }

            .layout-size {
                @include appearance(none);
                padding: 0;
                outline: none;
                border: none;
                line-height: 26px;
                @include transition();
                cursor: pointer;
                background-color: transparent;

                + .layout-size {
                    margin-left: 16px;
                }

                &:hover {
                    color: $light-blue;

                    .layout-size-icon {
                        fill: $light-blue;
                    }
                }

                &.active {
                    color: $blue;

                    .layout-size-icon {
                        fill: $blue;
                    }
                }

                .layout-size-icon {
                    display: block;
                    width: 51px;
                    height: 27px;
                    fill: $disabled;
                }
            }
        }

        .bookmark-description {
            margin: 0 0 0 6px;
            cursor: pointer;
            fill: $color-light-content;
            flex: 1;

            svg {
                width: 16px;
                height: 16px;
            }
        }

        .date-range {
            height: $data-range-h;
            line-height: $data-range-h;

            .trigger {
                float: right;
                height: $data-range-h;
                border-color: white;
                padding: 0;
                min-width: 0;

                &:hover {
                    border-color: $light-theme;

                    span {
                        color: $color-light-content;
                    }
                }

                svg {
                    display: none;
                    margin: 0 0 0 6px;
                }

                span {
                    color: $disabled;
                }
            }

            &.open {
                .trigger {
                    border-color: $light-theme;
                }
            }

            .date-panel,
            .right {
                left: 0;
                right: auto;
            }
        }
    }
</style>
