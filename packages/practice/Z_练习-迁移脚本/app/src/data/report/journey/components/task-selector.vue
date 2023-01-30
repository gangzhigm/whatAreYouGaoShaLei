<template>
    <div class="selector" v-blur="hideList" @click="$emit('click')">
        <label class="select-text" @click="!disabled && toggle()" :title="showTitle ? selectTitle : ''"
            :class="[{disabled, active: show, placeholder: !selectTitle && !icon}, icon ? 'icon icon-' + icon : '']">
            <span v-if="!hideLabel">{{(selectTitle || placeholder || $t('common.selectHolder'))}}</span>
            <span class="select-icon icon icon-arrow-down"></span>
        </label>
        <transition name="drop">
            <div class="list-container" :class="[direction, {'auto-width': autoWidth}]" v-show="show">
                <template v-if="!loading">
                    <label class="search-field" v-if="search">
                        <input type="text" ref="search" v-model="keyword"
                               :placeholder="searchPlaceholder ? searchPlaceholder : $t('common.selectKeywordHolder')"
                               autofocus
                               @input="searchOptions">
                        <span class="icon icon-search" @click="searchOptions"></span>
                    </label>
                    <div class="filter-selector" v-if="filters">
                        <p class="filter-text icon icon-tag" @click="toggleFilters" v-blur="closeFilters">
                            <span class="filter-placeholder">{{filter.name || filterPlaceholder || $t('common.selectHolder')}}</span>
                            <span class="icon icon-arrow-down" :class="{rotate: showFilter}"></span>
                        </p>
                        <transition name="drop">
                            <ul class="filter-list" v-if="showFilter">
                                <li v-for="f in filters" :key="f.id" :title="f.name" :class="{selected: filter.id === f.id}"
                                    @click="changeFilter(f)">
                                    <i :style="'background-color:' + f.color"></i>{{f.name}}
                                </li>
                                <li v-if="filters.length === 0">{{'components.noData' | t}}</li>
                            </ul>
                        </transition>
                    </div>
                    <ul class="select-list" v-load="loadMore" :class="{checkList: type === 'checkSelect'}">
                        <draggable v-model="filteredOptions" :group="{name: 'opt'}" :animation="150" :disabled="!draggable"
                                   @change="orderOptions">
                            <li class="option" v-for="opt in filteredOptions"
                                :title="opt.title || opt.name">
                                <checkbox v-if="type === 'checkSelect'"
                                          v-model="checkedArray"
                                          :source="opt[uniqueKey]"
                                          :disabled="opt.disabled">
                                    {{opt.name || $t('common.unknown')}}
                                </checkbox>
                                <p v-else-if="type === 'groupSelect' && opt.title" class="group-title"
                                   v-text="opt.title"></p>
                                <p v-else @click="!opt.disabled && change(opt)" class="option-text"
                                   :class="{selected: opt[uniqueKey] === selectedOpt[uniqueKey],'option-text':type === 'checkSelect', disabled: opt.disabled}">
                                    {{opt.name || $t('common.unknown')}}
                                </p>
                                <span class="order icon icon-tuozhuai1" v-if="draggable"></span>
                            </li>
                            <li class="option-null" v-if="filteredOptions.length === 0">
                                <template v-if="keyword">
                                    {{'components.without' | t}}&nbsp;{{keyword}}&nbsp;{{'components.relevant' | t}}
                                </template>
                                <template v-else>{{'components.noOption' | t}}</template>
                            </li>
                        </draggable>
                    </ul>
                    <div class="all-checked" v-if="type === 'checkSelect' && shortcutAction">
                        <checkbox :source="false" v-model="allChecked">{{'common.allSelected' | t}}</checkbox>
                        <span class="inverse" @click="inverse">{{'common.invert' | t}}</span>
                        <!-- <span class="confirm">确定</span> -->
                        <button class="confirm btn btn-theme btn-sm" :disabled="options.length === 0" @click="confirmSelect">{{'swarm.confirm' | t}}</button>
                    </div>
                </template>
                <inline-loading v-else></inline-loading>
            </div>
        </transition>
    </div>
</template>
<script type="text/babel">
    import filterArrayByName from '../../../../common/utils/filterArrayByName';
    import uniq from 'lodash/uniq';
    import debounce from 'lodash/debounce';
    import difference from 'lodash/difference';
    import {logError} from '../../../../monitor';

    const SelectorStack = new Set();
    const SelectorDirectionUpdater = debounce(function () {
        if (window.location.pathname !== '/customer/swarm') { //默认设置编辑联系人分群下拉框的方向
            for (let vm of SelectorStack) {
                vm.direction = (window.innerHeight - vm.$el.getBoundingClientRect().top) < 250 ? 'top' : 'bottom';
            }
        }
    }, 20);
    export default {
        name: 'task-selector',
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
            // 提示信息
            placeholder: {
                type: String,
            },
            // 下拉框的名称，选中文本会一直显示这个值
            listName: {
                type: String
            },
            icon: String,   // 图标类型的下拉框，选中文本会一直显示这个图标
            // 是否禁用select
            disabled: Boolean,
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
            type: {
                type: String,
                default: 'select'
            },
            // 快捷操作是否开启：全选&反选
            shortcutAction: {
                type: Boolean,
                default: true
            },
            // 拖拽排序
            draggable: {
                type: Boolean,
                default: false
            },
            // 选项加载中
            loading: {
                type: Boolean,
                default: false
            },
            showTitle: {
                type: Boolean,
                default: false
            },
            searchPlaceholder: {
                type: String,
            },
            // 下拉框blur时，是否重置搜索关键词
            blurCleanKeyWord: {
                type: Boolean,
                default: true
            },
            // 隐藏选中项显示
            hideLabel: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            selectTitle() {
                if (this.listName) return this.listName;

                if (this.type === 'select' || this.type === 'groupSelect') {
                    return this.selectedOpt.name;
                } else if (this.type === 'checkSelect') {
                    if (this.checkedArray.length !== 0)
                        return this.checkedArray.length === this.options.length ? `${this.checkedArray.length}) ${this.$t('common.selectedB')}` : `${this.checkedArray.length} ${this.$t('common.selectedB')}`;
                }
            },
            filteredOptions: {
                get() {
                    const keyword = this.trim ? this.keyword.trim() : this.keyword;
                    const targetOptions = this.type === 'groupSelect' ? this.groupArray : this.options;
                    return (this.search && this.search !== 'async' && keyword)
                        ? filterArrayByName(targetOptions, keyword)
                        : targetOptions;
                },
                set(newOptions) {
                    this.orderFilteredOptions = newOptions;
                    return newOptions;
                }
            },
            groupArray() {  // 有分组时，options当做groups使用 ex: [Aoptions, Boptions, Coptions];
                let options = [],
                    groups = this.options;

                if (this.type === 'groupSelect') {
                    groups.forEach(group => {
                        options.push({
                            title: group.title,
                            icon: group.icon,
                        });
                        if (group.options.length === 0) {
                            options.push({
                                name: this.$t('components.none') + group.title,
                                disabled: true
                            });
                        } else {
                            options = options.concat(group.options);
                        }
                    });
                }

                return options;
            },
            selectedOpt() {
                const targetOptions = this.type === 'groupSelect' ? this.groupArray : this.options;
                targetOptions.$key = this.uniqueKey;
                const selected = targetOptions.$getByKey(this.value);
                const notEmptyValue = Array.isArray(this.value)
                    ? this.value.length !== 0
                    : this.value !== undefined && this.value !== '' && this.value !== null;
                if (
                    notEmptyValue
                    && targetOptions.length !== 0
                    && targetOptions.filter(option => option.id).length !== 0
                    && !selected
                ) {
                    this.$emit('invalid');
                    logError(`${this.$parent._name} <selector/> 没有找到 ${this.uniqueKey} 为 ${this.value} 对应的选项`);
                }
                return selected || {name: '', [this.uniqueKey]: ''};
            },
            allChecked: {
                get() {
                    let check = 0;
                    this.filteredOptions.forEach(e => {
                        if (this.checkedArray.indexOf(e[this.uniqueKey]) !== -1) {
                            check++;
                        }
                    });
                    return this.filteredOptions.length === check && check !== 0; //返回布尔值判断状态是否为选中状态
                },
                set(newval) {
                    let uniqueKeys = this.filteredOptions.map(filteredOption => filteredOption[this.uniqueKey]);
                    if (newval) {
                        this.checkedArray = uniq(this.checkedArray.concat(uniqueKeys));
                    } else {
                        this.checkedArray = difference(this.checkedArray, uniqueKeys);
                    }
                }
            },
            checkedArray: {
                get() {
                    return Array.isArray(this.value) ? this.value : [];
                },
                set(checkList) {
                    this.$emit('input', checkList);
                    let data = [];
                    this.options.forEach(opt => {
                        if (this.checkedArray.indexOf(opt[this.uniqueKey]) !== -1) data.push(opt);
                    });
                    this.$emit('checkOptions', data);
                }
            }
        },
        data() {
            return {
                show: false,
                showFilter: false,
                keyword: '',
                mouseDown: true,
                timer: null,
                FilterTimer: null,
                filter: '',
                direction: 'bottom', // 展开列表的方向
                orderFilteredOptions: []// 排序后的列表
            };
        },
        mounted() {
            SelectorStack.add(this);
            SelectorDirectionUpdater();
            if (SelectorStack.size === 1) {
                window.addEventListener('resize', SelectorDirectionUpdater, false);
                window.addEventListener('scroll', SelectorDirectionUpdater, true);
            }
        },
        beforeDestroy() {
            SelectorStack.delete(this);
            if (SelectorStack.size === 0) {
                window.removeEventListener('resize', SelectorDirectionUpdater, false);
                window.removeEventListener('scroll', SelectorDirectionUpdater, true);
            }
        },
        methods: {
            toggleFilters() {
                this.showFilter = !this.showFilter;
                if (!this.showFilter) {
                    if (this.filter) {
                        this.filter = '';
                        this.$emit('filter', this.filter);
                    }
                }
            },
            // 选择一个列表项
            changeFilter(option) {
                if (this.filter === option) {
                    this.filter = '';
                } else {
                    this.filter = option;
                }
                this.$emit('filter', this.filter);
            },
            closeFilters() {
                this.showFilter = false;
                this.$emit('filter', this.filter);
            },
            focusInSearch() {
                this.$refs.search.focus();
            },
            searchOptions: debounce(function () {
                if (this.search === 'async') {
                    this.$emit('search', this.keyword);
                }
            }, 300),
            // 排序
            orderOptions() {
                this.$emit('order', this.orderFilteredOptions);
            },
            //反选
            inverse() {
                this.filteredOptions.forEach(e => {
                    if (this.checkedArray.indexOf(e[this.uniqueKey]) === -1) {
                        this.checkedArray.push(e[this.uniqueKey]);
                    } else {
                        this.checkedArray.splice(this.checkedArray.indexOf(e[this.uniqueKey]), 1);
                    }
                });
                //反选数组，触发checkOptions
                let data = [];
                this.options.forEach(opt => {
                    if (this.checkedArray.indexOf(opt[this.uniqueKey]) !== -1) data.push(opt);
                });
                this.$emit('checkOptions', data);
            },
            // 显示下拉框
            toggle() {
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
            hideList() {
                if (!this.show) return;
                this.show = false;
                this.showFilter = false;
                if (this.blurCleanKeyWord) this.keyword = '';
                let data = [];
                this.options.forEach(opt => {
                    if (this.checkedArray.indexOf(opt[this.uniqueKey]) !== -1) data.push(opt);
                });
                this.$emit('hide', data);
            },
            // 选择一个列表项
            change(option) {
                this.show = false;
                this.showFilter = false;
                if (this.blurCleanKeyWord) this.keyword = '';
                if (this.selectedOpt[this.uniqueKey] !== option[this.uniqueKey]) {
                    this.$emit('input', option[this.uniqueKey]);
                }
                this.$emit('select', option);
            },
            loadMore() {
                this.$emit('load');
            },
            confirmSelect() {
                this.show = false;
                this.showFilter = false;
                if (this.blurCleanKeyWord) this.keyword = '';
                this.$emit('confirm');
            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../../../common/scss/base/variables';
    @import '../../../../common/scss/base/mixin';

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
            text-indent: .8em;
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
                @include box-shadow(0 1px 3px rgba($theme, .35));

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
            @include box-shadow(0 3px 8px rgba(#8b9daf, .16));
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

                    &:not(.disabled,.selected):hover {
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
                    display: inline-block;
                    width: 24px;
                    cursor: pointer;
                    position: absolute;
                    left: 50px;
                    margin-left: 1em;
                    color: #38acf4;
                }
                .confirm {
                    cursor: pointer;
                    position: absolute;
                    right: 10px;
                    margin-left: 1em;
                    // color: #38acf4;
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
