<template>
    <div class="selector" v-blur="hideList" @click="$emit('click')">
        <label class="select-text" @click="toggle()" :title="''"
            :class="[{active: show, placeholder: !selectTitle && !icon}, icon ? 'icon icon-' + icon : '']">
            {{(selectTitle || $t('common.selectHolder'))}}
            <span class="select-icon icon icon-arrow-down"></span>
        </label>
        <transition name="drop">
            <div class="list-container" :class="[direction, {'auto-width': autoWidth}]" v-show="show">
                <template v-if="!loading">
                    <label class="search-field" v-if="search">
                        <input type="text" ref="search" v-model="keyword"
                            :placeholder="searchPlaceholder ? searchPlaceholder : $t('common.selectKeywordHolder')"
                            autofocus @input="searchOptions">
                        <span class="icon icon-search" @click="searchOptions"></span>
                    </label>
                    <div class="filter-selector" v-if="filters">
                        <p class="filter-text icon icon-tag" @click="toggleFilters" v-blur="closeFilters">
                            <span
                                class="filter-placeholder">{{filter.name || filterPlaceholder || $t('common.selectHolder')}}</span>
                            <span class="icon icon-arrow-down" :class="{rotate: showFilter}"></span>
                        </p>
                        <transition name="drop">
                            <ul class="filter-list" v-if="showFilter">
                                <li v-for="f in filters" :key="f.id" :title="f.name"
                                    :class="{selected: filter.id === f.id}" @click="changeFilter(f)">
                                    <i :style="'background-color:' + f.color"></i>{{f.name}}
                                </li>
                                <li v-if="filters.length === 0">{{'components.noData' | t}}</li>
                            </ul>
                        </transition>
                    </div>
                    <ul class="select-list checkList" v-load="loadMore">
                        <draggable v-model="filteredOptions" :group="{name: 'opt'}" :animation="150">
                            <li class="option" v-for="opt in filteredOptions" :title="opt.title || opt.name">
                                <checkbox ref="checkbox" @input="checkboxSort(opt.formContent)" :value="'Array'"
                                    v-model="checkedArray" :source="opt.formContent" :disabled="opt.disabled">
                                    {{opt.name || $t('common.unknown')}}
                                </checkbox>
                            </li>
                            <li class="option-null" v-if="filteredOptions.length === 0">
                                <template v-if="keyword">
                                    {{'components.without' | t}}&nbsp;{{keyword}}&nbsp;{{'components.relevant' | t}}
                                </template>
                                <template v-else>{{'components.noOption' | t}}</template>
                            </li>
                        </draggable>
                    </ul>
                </template>
                <inline-loading v-else></inline-loading>
            </div>
        </transition>
    </div>
</template>
<script type="text/babel">
import filterArrayByName from '@/common/utils/filterArrayByName';
import debounce from 'lodash/debounce';

const SelectorStack = new Set();
const SelectorDirectionUpdater = debounce(function () {
    for (let vm of SelectorStack) {
        vm.direction = (window.innerHeight - vm.$el.getBoundingClientRect().top) < 250 ? 'top' : 'bottom';
    }
}, 20);
export default {
    name: 'selector',
    props: {
        // 下拉列表项
        options: {
            type: Array,
            required: true
        },
        // 过滤筛选下拉列表
        filters: {
            type: Array
        },
        // 选项列表宽度自适应
        autoWidth: Boolean,
        // 过滤筛选提示信息
        filterPlaceholder: {
            type: String,
        },
        icon: String,   // 图标类型的下拉框，选中文本会一直显示这个图标
        search: { // 'async' stands for outer component filtering options asynchronously with this.keyword
            type: [Boolean, String],
            default: false
        },
        trim: {
            type: Boolean,
            default: true
        },
        // 默认选中的选项
        value: '',
        uniqueKey: {  // 选项间彼此区分的根据，默认是 option.id 可以指定为别的字段，例如 option.key
            type: String,
            default: 'id'
        },
        // 选项加载中
        loading: {
            type: Boolean,
            default: false
        },
        searchPlaceholder: {
            type: String
        }
    },
    computed: {
        selectTitle () {
            if (this.checkedArray.length !== 0)
                return `${this.$t('form.selectorTipPrefix')} ${this.checkedArray.length} ${this.$t('form.selectorTipSuffix')}`;
        },
        filteredOptions: {
            get () {
                const keyword = this.trim ? this.keyword.trim() : this.keyword;
                const targetOptions = this.options;
                return (this.search && this.search !== 'async' && keyword)
                    ? filterArrayByName(targetOptions, keyword)
                    : targetOptions;
            },
            set (newOptions) {
                this.orderFilteredOptions = newOptions;
                return newOptions;
            }
        },
        checkedArray: {
            get () {
                return Array.isArray(this.value) ? this.value : [];
            },
            set (checkList) {
                this.$emit('input', checkList);
                let data = [];
                this.options.forEach(opt => {
                    if (this.checkedArray.indexOf(opt[this.uniqueKey]) !== -1) data.push(opt);
                });
                this.$emit('checkOptions', data);
            }
        }
    },
    data () {
        return {
            show: false,
            showFilter: false,
            keyword: '',
            mouseDown: true,
            FilterTimer: null,
            filter: '',
            direction: 'bottom', // 展开列表的方向
            orderFilteredOptions: []// 排序后的列表
        };
    },
    mounted () {
        SelectorStack.add(this);
        SelectorDirectionUpdater();
        if (SelectorStack.size === 1) {
            window.addEventListener('resize', SelectorDirectionUpdater, false);
            window.addEventListener('scroll', SelectorDirectionUpdater, true);
        }
    },
    beforeDestroy () {
        SelectorStack.delete(this);
        if (SelectorStack.size === 0) {
            window.removeEventListener('resize', SelectorDirectionUpdater, false);
            window.removeEventListener('scroll', SelectorDirectionUpdater, true);
        }
    },
    watch: {
        value () {
            this.filteredOptions.forEach(e => {
                e.disabled = this.value.length === 5 ? !this.value.includes(e.formContent) : false;
            });
        }
    },
    methods: {
        //默认选中下拉菜单中的第一个表单字段
        init (ids) {
            ids = ids.length === 0 ? [0] : ids;
            ids.forEach(e => {
                setTimeout(() => {
                    this.$refs.checkbox[e].toggle();
                }, 200);
            });
        },
        /**
         * 点击多选框后选中的靠前排序
         */
        checkboxSort (formContent) {
            let copyObj;
            let index;

            this.options.forEach((item, i) => {
                if (item.formContent === formContent) {
                    copyObj = Object.assign({}, item);
                    index = i;
                }
            });
            let isDisabled = false;
            if (this.value.constructor === Array) {
                isDisabled = !this.value.includes(formContent);
            } else {
                isDisabled = this.value !== formContent;
            }

            //选中的放到第一个
            if (index !== undefined && copyObj) {
                if (isDisabled) {
                    this.options.splice(index, 1);
                    this.options.splice(0, 0, copyObj);
                } else {
                    this.options.splice(index, 1);
                    this.options.splice(this.value.length - 1, 0, copyObj);
                }
            }
        },
        toggleFilters () {
            this.showFilter = !this.showFilter;
            if (!this.showFilter) {
                if (this.filter) {
                    this.filter = '';
                    this.$emit('filter', this.filter);
                }
            }
        },
        // 选择一个列表项
        changeFilter (option) {
            if (this.filter === option) {
                this.filter = '';
            } else {
                this.filter = option;
            }
            this.$emit('filter', this.filter);
        },
        closeFilters () {
            this.showFilter = false;
            this.$emit('filter', this.filter);
        },
        focusInSearch () {
            this.$refs.search.focus();
        },
        searchOptions: debounce(function () {
            if (this.search === 'async') {
                this.$emit('search', this.keyword);
            }
        }, 300),
        // 显示下拉框
        toggle () {
            // 监听如果已经显示则关闭(针对再次点击下拉框)
            if (this.show) {
                this.hideList();
                return;
            }
            this.show = true;
            // 如果搜索功能打开则需要让搜索框获取焦点
            this.$nextTick(() => {
                if (this.search) {
                    this.focusInSearch();
                }
            });
        },
        // 隐藏下拉列表
        hideList () {
            if (!this.show) return;
            this.show = false;
            this.showFilter = false;
            this.keyword = '';
            let data = [];
            this.options.forEach(opt => {
                if (this.checkedArray.indexOf(opt[this.uniqueKey]) !== -1) data.push(opt);
            });
            this.$emit('hide', data);
        },
        loadMore () {
            this.$emit('load');
        }
    }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../common/scss/base/variables';
@import '../../../common/scss/base/mixin';

$option-height: $input-field-height;
$border-radius: 4px;
$hover-bg: #f8f9fa;

.selector {
    display: inline-block;
    position: relative;
    text-align: left;
    vertical-align: middle;
    width: 145px;
    color: $color-content;

    &.hg {
        width: 312px;
    }

    &.xl {
        width: 277px;
    }

    &.lg {
        min-width: $form-field-width;
    }

    &.md-lg {
        width: 200px;
    }

    &.md {
        width: 100px;
    }

    &.tiny {
        width: 60px;
    }

    &.icon-size {
        width: 50px;
    }

    &.full-width {
        display: block;
        width: 100%;
    }

    &.min-height {
        .select-text {
            height: 24px;
            line-height: 22px;
        }

        .select-icon {
            height: 22px;
            width: 22px;
        }
    }

    &.error {
        .select-text {
            border-color: $red;
            background-color: rgba(246, 125, 125, 0.2);
            &:not(.disabled):hover,
            &.active {
                border-color: $red;
                background-color: rgba(246, 125, 125, 0.2);
                .select-icon {
                    color: $red;
                }
            }
        }
    }

    &.max-length-15 {
        .select-list {
            max-height: $option-height * 15 + 6px !important;
        }
    }

    &.max-length-8 {
        .select-list {
            max-height: $option-height * 8 + 8px !important;
        }
    }

    &.overlap-left {
        margin-left: -1px;

        .select-text {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;

            &:hover,
            &.active {
                z-index: 1;
            }
        }
    }

    &.overlap-right {
        .select-text {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;

            &:hover,
            &.active {
                z-index: 1;
            }
        }
    }

    &.inline-tiny {
        width: 75px;
        background-color: inherit;

        .select-icon {
            display: none;
        }

        .list-container {
            position: absolute;
            left: auto;
            top: 34px;
            right: 0;
            width: 15em;
        }

        .select-text {
            padding-right: 0;
            background-color: transparent;
            line-height: $option-height + 2px;
            border: none;
            color: $green;

            &.active {
                box-shadow: none;
            }
        }
    }

    + span {
        margin-left: 5px;
    }

    .select-text {
        position: relative;
        display: block;
        @include box-sizing();
        padding-right: $option-height - 8px;
        height: $option-height;
        line-height: $option-height - 2px;
        border: 1px solid $form-border;
        text-indent: 0.8em;
        @include border-radius($border-radius);
        @include user-select(none);
        background-color: white;
        @include ellipsis();

        &:not(.disabled):hover {
            border-color: $theme;
        }

        &:not(.disabled) {
            cursor: pointer;
        }

        &.disabled {
            color: $disabled;
            cursor: not-allowed;
            background-color: $content-bg;

            .select-icon {
                color: $disabled;
            }
        }

        &.placeholder {
            color: $disabled;
        }

        &.active {
            border-color: $theme;
            @include box-shadow(0 1px 3px rgba($theme, 0.35));

            .select-icon {
                color: $theme;
            }
        }

        .select-icon {
            height: $option-height - 2px;
            width: $option-height - 2px;
            position: absolute;
            top: 0;
            right: 0;
            text-align: center;
            text-indent: 0;
            color: $color-light-content;
        }
    }

    .list-container {
        position: absolute;
        @include box-sizing();
        top: $option-height + 4px;
        left: 0;
        width: 100%;
        border: 1px solid $select-border;
        background-color: white;
        z-index: $index-menu - 1;
        @include box-shadow(0 3px 8px rgba(#8b9daf, 0.16));
        @include transform-origin(top);
        @include border-radius($border-radius);

        &.auto-width {
            right: 0;
            left: auto;
            width: auto;
            min-width: 100%;
            max-width: 300px;
        }

        &.top {
            top: auto;
            bottom: $option-height + 4px;
        }

        .select-list {
            max-height: $option-height * 8 + 8px;
            overflow: auto;

            .option {
                position: relative;
                line-height: $option-height;
                margin: 1px 0;

                &:last-child {
                    margin-bottom: 0;
                }

                &:hover {
                    background-color: $hover-bg;

                    .order {
                        color: $theme;
                    }
                }

                .order {
                    position: absolute;
                    top: 0;
                    right: -2px;
                }
            }

            .checkbox {
                display: block;
                @include ellipsis();
            }

            .group-title {
                background-color: $title-bg;
                color: $color-light-content;
                font-weight: bold;
                @include ellipsis();
                padding: 0 1em;
            }

            .option-null {
                color: $disabled;
                line-height: $option-height;
                font-style: italic;
                white-space: nowrap;
                text-align: center;
                padding: 0 1em;
                @include user-select(none);

                span {
                    display: inline-block;
                    vertical-align: middle;
                    max-width: calc(100% - 10em);
                    @include ellipsis();
                }
            }

            .option-text {
                padding: 0 1em;
                text-align: left;
                color: $color-content;
                @include ellipsis();
                cursor: pointer;

                &:not(.disabled, .selected):hover {
                    background-color: $hover-bg;
                }

                &.disabled {
                    background-color: $content-bg;
                    color: $disabled;
                    cursor: not-allowed;
                }

                &.selected {
                    background-color: $select-bg;
                    color: $color-content;
                }
            }
        }

        .checkList,
        .all-checked {
            color: $color-light-content;
            padding: 0 3px;
        }

        .all-checked {
            position: relative;
            line-height: 24px;
            background-color: $title-bg;
            overflow: hidden;
            border-top: 1px solid $select-border;

            .inverse {
                cursor: pointer;
                position: absolute;
                right: 10px;
                margin-left: 1em;
                color: #38acf4;
            }
        }

        .search-field {
            position: relative;
            display: flex;
            align-items: center;
            height: $input-field-height;
            border-bottom: 1px solid $select-border;
            background-color: $title-bg;
            @include border-radius(0);
            color: $color-light-content;

            input {
                height: $input-field-height;
                padding: 0 8px 0 32px;
                width: 100%;
                min-width: 5em; // 否则placeholder显示不全
                border: none;
                background-color: transparent;

                &:hover {
                    background-color: $select-bg;

                    & + .icon-search {
                        background-color: $select-bg;
                    }
                }

                &:focus {
                    background-color: #fff;

                    & + .icon-search {
                        background-color: #fff;
                    }
                }
            }

            .icon-search {
                $offset: ($input-field-height - 14px) / 2;
                position: absolute;
                width: 26px;
                height: $input-field-height - 2px;
                line-height: $input-field-height;
                text-align: center;
                left: 1px;
                top: 1px;
                background-color: transparent;
            }
        }
    }

    .filter-selector {
        border-bottom: 1px solid $select-border;

        .filter-text {
            padding: 0 3px;
            height: $option-height;
            line-height: $option-height;
            cursor: pointer;
            background-color: $title-bg;

            &:before {
                float: left;
                text-align: center;
                width: 23px;
                color: $color-light-content;
            }

            &:after {
                display: table;
                content: '';
                clear: both;
            }

            .icon {
                float: right;
                height: $option-height;
                width: 29px;
                text-align: center;
                color: $color-light-content;

                &.rotate {
                    @include transform(rotate(180deg));
                }
            }

            .filter-placeholder {
                display: inline-block;
                width: calc(100% - 58px);
                @include ellipsis();
            }
        }

        .filter-list {
            border-top: 1px solid $select-border;
            line-height: $option-height;
            color: $color-content;

            li {
                padding: 0 3px;
                @include ellipsis();
                cursor: pointer;

                &:hover,
                &.active {
                    background-color: #ebeff1;
                }

                i {
                    float: left;
                    width: 4px;
                    height: 4px;
                    margin: 14px 8px 0 14px;
                    @include border-radius($border-radius);
                }
            }
        }
    }
}
</style>
