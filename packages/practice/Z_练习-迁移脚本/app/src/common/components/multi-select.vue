<template>
    <div class="multi-select" v-blur="close" :class="{active: show, disabled: disabled}">
        <label class="select-text" @click="toggle">
            <span class="select-icon icon icon-arrow-down"></span>
            <span v-for="option in checkedOptions" class="title">
                {{option[optName]}}
                <i @click.stop="delCheckedOptions(option)" class="icon icon-close"></i>
            </span>
            <span v-if="checkedKeys.length === 0" class="placeholder">{{placeholder ? placeholder : $t('components.notDisplay')}}</span>
        </label>
        <transition :name="dropDirection === 'right' ? 'drop-right' : 'drop'">
            <div class="list-container" v-show="show" :class="[{'auto-width': autoWidth}, dropDirection]">
                <label class="search-field" v-if="search || options.length > 10">
                    <input type="text" v-model="keyword" :placeholder="$t('common.selectKeywordHolder')" autofocus
                           @input="searchOptions">
                    <span class="icon icon-search" @click="searchOptions"></span>
                </label>
                <ul class="select-list" v-load="loadMore">
                    <li class="option" v-for="opt in filteredOptions"
                        :class="{disabled: opt.disabled || (checkedKeys.length >= max && !checkedKeys.includes(opt[uniqueKey]))}"
                        :title="opt[optName]">
                        <checkbox v-model="checkedKeys"
                                  :source="opt[uniqueKey]"
                                  :disabled="opt.disabled || (checkedKeys.length >= max && !checkedKeys.includes(opt[uniqueKey]))">
                            {{opt[optName] || $t('common.unknown')}}
                        </checkbox>
                    </li>
                    <li class="option-null" v-if="filteredOptions.length === 0">
                        {{'components.without' | t}} <span>{{keyword}}</span>{{'components.relevant' | t}}
                    </li>
                </ul>
                <div v-if="options.length !== 0 && shortcutAction" class="action-option">
                    <checkbox v-model="allChecked">{{'common.allSelected' | t}}</checkbox>
                    <span class="pull-right action-link" @click="inverse">{{'common.invert' | t}}</span>
                </div>
            </div>
        </transition>
    </div>
</template>
<script type="text/babel">
    import filterArrayByName from '../../common/utils/filterArrayByName';
    import difference from 'lodash/difference';
    import uniq from 'lodash/uniq';
    import debounce from 'lodash/debounce';

    export default {
        name: 'multi-select',
        props: {
            // 下拉列表名称的默认字段
            optName: {
                type: String,
                default: 'name'
            },
            dropDirection: {
                type: String,
                default: 'right'
            },
            // 下拉列表项
            options: {
                type: Array,
                required: true
            },
            max: {
                type: Number,
                default: Infinity
            },
            // 默认选中的选项
            value: {
                type: Array,
                required: true
            },
            uniqueKey: {  // 选项间彼此区分的根据，默认是 option.id 可以指定为别的字段，例如 option.key
                type: String,
                default: 'id'
            },
            // 提示信息
            placeholder: {
                type: String,
            },
            // 选项列表宽度自适应
            autoWidth: {
                type: Boolean,
                default: true
            },
            // 快捷操作是否开启：全选&反选
            shortcutAction: {
                type: Boolean,
                default: true
            },
            // 搜索
            search: {
                type: [Boolean, String],
                default: false
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                show: false,
                keyword: ''
            };
        },
        methods: {
            /**
             * @description: 判断两个数组是否相等（没顺序）
             * @param {Array} arr1
             * @param {Array} arr2
             * @return {*}
             */            
            judgeResultFun (arr1, arr2) {
                let flag = true;
                if (arr1.length !== arr2.length || arr1.length === 0) {
                    flag = false;
                } else {
                    arr1.forEach(item => {
                        if (arr2.indexOf(item) === -1) {
                            flag = false;
                        }
                    });
                }
                return flag;
            },
            toggle() {
                if (this.disabled) return;
                this.show = !this.show;
            },
            close() {
                if (this.keyword !== '') {
                    this.keyword = '';
                    this.$emit('search', this.keyword);
                }
                this.show = false;
            },
            // 反选
            inverse() {
                let newCheckedKeys = this.checkedKeys.slice();
                this.filteredOptions.forEach(option => {
                    let key = option[this.uniqueKey];
                    let index = newCheckedKeys.indexOf(key);
                    // let newCheckedKeys = this.checkedKeys.slice();
                    if (index === -1) {
                        newCheckedKeys.push(key);
                    } else {
                        newCheckedKeys.splice(index, 1);
                    }
                    // this.checkedKeys = newCheckedKeys;
                    // if (this.checkedKeys.includes(key)) {
                    //     newCheckedKeys.splice(index, 1);
                    // } else {
                    //     newCheckedKeys.push(key);
                    // }
                });
                this.checkedKeys = newCheckedKeys;
            },
            // 刪除
            delCheckedOptions(option) {
                this.checkedKeys.splice(this.checkedKeys.findIndex(keys => keys === option[this.uniqueKey]), 1);
                this.$emit('input', this.checkedKeys);
                this.$emit('change', this.checkedKeys
                    .map(uniqKeyValue => this.options.find(option => option[this.uniqueKey] === uniqKeyValue))
                    .filter(option => option)
                );
            },
            loadMore() {
                this.$emit('load');
            },
            searchOptions: debounce(function () {
                if (this.search === 'async') {
                    this.$emit('search', this.keyword);
                }
            }, 300),
            // 清空选项
            clearCheckedKeys() {
                this.checkedKeys = [];
            },
        },
        computed: {
            filteredOptions() {
                return filterArrayByName(this.options, this.keyword.trim(), this.optName);
            },
            checkedKeys: {
                get() {
                    return this.value;
                },
                set(checkList) {
                    this.$emit('input', checkList);
                    this.$nextTick(() => {
                        this.$emit('change', checkList
                            .map(uniqKeyValue => this.options.find(option => option[this.uniqueKey] === uniqKeyValue))
                            .filter(option => option)
                        );
                    });
                }
            },
            checkedOptions() {
                return this.checkedKeys
                    .map(uniqKeyValue => this.options.find(option => option[this.uniqueKey] === uniqKeyValue))
                    .filter(option => option);
            },
            allChecked: {
                get() {
                    let allKeys = this.filteredOptions.map(option => option[this.uniqueKey]);
                    return this.judgeResultFun(uniq(this.checkedKeys),  allKeys);
                },
                set(flag) {
                    let allKeys = this.filteredOptions.map(option => option[this.uniqueKey]);
                    if (flag) {
                        this.checkedKeys = uniq(this.checkedKeys.concat(allKeys));
                    } else {
                        this.checkedKeys = difference(this.checkedKeys, allKeys);
                    }
                }
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    $border-radius: 4px;

    .multi-select {
        position: relative;
        vertical-align: middle;
        color: $color-content;

        &:not(.full-width) {
            display: inline-block;
        }

        &.error {
            .select-text {
                border-color: $red;
            }
        }

        &.active {
            .select-text {
                border-color: $theme;

                .title {
                    white-space: normal;
                    overflow: visible;

                    .icon-close {
                        cursor: pointer;

                        &:hover {
                            color: $dark-red;
                        }
                    }
                }
            }
        }

        &:hover {
            .select-text {
                border-color: $theme;
            }
        }

        &.disabled {
            .select-text {
                border-color: $disabled;
                cursor: not-allowed;
            }
        }
        .select-icon {
            float: right;
            height: 20px;
            line-height: 20px;
            width: 20px;
            margin-top: 2px;
            color: $color-light-content;
            text-align: center;
        }

        .select-text {
            display: block;
            position: relative;
            @include box-sizing();
            min-height: $input-field-height;
            line-height: 0;
            border: 1px solid $form-border;
            padding: #{($input-field-height - 20px - 4px - 2px)/2} .8em;
            width: 100%;
            @include border-radius($border-radius);
            @include user-select(none);
            background-color: white;
            max-height: $input-field-height + 4 * (24px);
            overflow-x: hidden;
            overflow-y: auto;
            @include transition();

            .title {
                @include box-sizing();
                border: 1px solid $purple;
                margin: 2px 4px 2px 0;
                padding: 0 5px;
                border-radius: $border-radius;
                background-color: #f2f0ff;
                color: $purple;
                max-width: 100%;
                word-break: break-word;
                display: inline-block;
                line-height: 18px;
                vertical-align: middle;

                &:first-of-type {
                    max-width: calc(100% - #{$input-field-height});
                }
            }

            .placeholder {
                line-height: 24px;
                color: $color-light-content;
            }

        }

        .list-container {
            position: absolute;
            @include box-sizing();
            border: 1px solid $select-border;
            background-color: white;
            z-index: $index-menu - 1;
            @include box-shadow(0 3px 8px rgba(#8b9daf, .16));
            @include transform-origin(0 0);
            @include border-radius($border-radius);
            max-width: 100%;

            &.auto-width {
                width: auto;
                max-width: none;
            }

            &.right {
                left: 100%;
                top: 0;
                margin-left: 3px;
            }

            &.bottom {
                top: 100%;
                left: 0;
                min-width: 100%;
                margin-top: 3px;
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
                    padding: 0 8px 0 28px;
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

        .select-list {
            max-height: 198px;
            overflow: auto;

            .option {
                line-height: $input-field-height;
                padding: 0 1em;

                &:last-child {
                    margin-bottom: 0;
                }

                &:not(.disabled):hover {
                    background-color: $hover-bg;
                }

                &.disabled {
                    color: $disabled;
                    cursor: not-allowed;
                }

                .checkbox {
                    display: block;
                    @include ellipsis();
                }
            }

            .option-null {
                color: $disabled;
                line-height: $input-field-height;
                white-space: nowrap;
                text-align: center;
                
                span {
                    display: inline-block;
                    vertical-align: middle;
                    max-width: calc(100% - 10em);
                    @include ellipsis();
                }
            }
        }

        .action-option {
            min-width: 120px;
            line-height: $input-field-height;
            padding: 0 1em;
            @include user-select(none);
            background-color: $content-bg;
        }

        .action-link {
            color: $theme;
            cursor: pointer;

            &:hover {
                color: $light-theme;
            }

            &:active {
                color: $dark-theme;
            }
        }
    }

    // vue transition: drop-right
    .drop-right-enter-active {
        @include transform(translateX(0));
        opacity: 1;
        @include transition();
    }

    .drop-right-leave-active {
        @include transform(translateX(10px));
        opacity: 0;
        @include transition(all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0));
    }

    .drop-right-enter {
        @include transform(translateX(10px));
        opacity: .5;
    }

</style>
