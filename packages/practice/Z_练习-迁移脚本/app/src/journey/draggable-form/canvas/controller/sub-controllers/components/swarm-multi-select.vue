<template>
    <div class="swarm-multi-select" :class="{'focus': !visualMode, 'disabled': disabled}" @click.stop>
        <transition name="multi-select">
            <div v-if="visualMode" class="visual-mode" :class="{disabled: disabled}" key="visual" v-load="loadMoreSelected"
                @mousedown.stop.prevent="open">
                <span class="placeholder"
                      v-if="selectedOptions.length === 0">{{$t('common.select') + ' ' + title}}</span>
                <template v-else>
                    <span class="selected-option" v-for="option in selectedPartOptions" :key="option.id" :title="option.name"
                        @mousedown.stop @mouseup.stop>
                        <svg v-if="!disabled" class="remove-icon" role="button" width="8" height="8" @mousedown.prevent="remove(option)">
                            <use xlink:href="#icon-close"></use>
                        </svg>
                        {{option.name}}
                    </span>
                </template>
                <span v-if="selectedOptions.length" class="selected-count" @mousedown.stop>
                    {{'common.selectedA' | t}} <span class="journey-text">{{selectedOptions.length}}</span> {{'common.selectedB' | t}}{{title}}
                </span>
            </div>
        </transition>
        <transition name="multi-select">
            <div v-if="!visualMode" class="select-mode" key="options" @mousedown.prevent="focus">
                <p class="select-title">
                    {{$t('common.select') + ' ' + title}}
                    &nbsp;({{ this.value.length }})
                </p>
                <div class="keyword-input">
                    <input type="text" autofocus @blur="close" ref="input" v-model.trim="keyword" :maxlength="maxlength"
                           autocomplete="off" aria-autocomplete="none" @input="searchOptions">
                    <i class="icon icon-search" @click="searchOptions"></i>
                </div>
                <ul class="options" v-load="loadMore" ref="selectBox">
                    <li class="option" style="position: relative" v-for="option in filteredPartOptions" :key="option.id"
                        @click="toggleCheck(option)" :title="option.name">
                        <checkbox :value="value" :source="option.id" :disabled="value.length > 999 && !value.includes(option.id)"/>
                        <span>{{option.name}}</span>
                        {{noSwarm ? '' : (option.total?option.total.toLocaleString():0)}}
                    </li>
                </ul>
                <div class="multi-select-panel" :style="filteredOptions.length==0?'border:0' :''">
                    <!-- 全选标签 -->
                    <checkbox v-if="!keyword" class="check-all" v-model="allChecked">
                        &nbsp;{{ 'common.allSelected' | t }}
                    </checkbox>
                    <!-- 全选搜索结果 -->
                    <checkbox v-else class="check-all" v-model="allResultsChecked"
                        :disabled="keyword !== '' && (checkedStatus || !preCheckable) && !allResultsChecked">
                        &nbsp;{{ 'common.allSelected' | t }}
                    </checkbox>
                    <i class="icon icon-help" v-title="$t('components.selectTopThousand')"></i>
                    <input type="button" class="btn btn-sm btn-theme" :value="$t('common.confirm')"
                           @mousedown.stop="close">
                </div>
            </div>
        </transition>
    </div>
</template>
<script type="text/ecmascript-6">
    import filterArrayByName from '../../../../../../common/utils/filterArrayByName';
    import debounce from 'lodash/debounce';

    export default {
        props: {
            options: {
                type: Array,
                required: true
            },
            value: {
                type: Array,
                required: true
            },
            title: {
                type: String,
                default: ''
            },
            noSwarm: {
                type: Boolean,
                default: false
            },
            search: { // 'async' stands for outer component filtering options asynchronously with this.keyword
                type: [Boolean, String],
                default: false
            },
            //分区条件簇使用
            disabled: {
                type: Boolean,
                default: false
            },
            //初始加载全部选项
            loadAll: {
                type: Boolean,
                default: false
            },
            maxlength: {
                type: Number,
                default: 20
            }
        },
        data() {
            return {
                visualMode: true,   // 展示模式, false代表进入选择模式
                keyword: '',
                optList: [],
                checkCount: 0, // 动态选择列表 已加载条目数
                selectedCount: 0 // 已选择列表 已加载条目数
            };
        },
        computed: {
            selectedOptions() {
                let ids = this.value.slice();
                return this.options.filter(option => ids.includes(option.id));
            },
            filteredOptions() {
                return (this.search && this.search !== 'async' && this.keyword) ? filterArrayByName(this.options, this.keyword)
                    : this.options;
            },
            // 动态加载的选择列表
            filteredPartOptions() {
                return this.filteredOptions.slice(0, this.checkCount);
            },
            // 动态加载的已选中列表
            selectedPartOptions() {
                return this.selectedOptions.slice(0, this.selectedCount);
            },
            // 所有标签全选状态
            allChecked: {
                get: function() {
                    return this.checkedStatus;
                },
                set: function(val) {
                    if (val) {
                        this.$emit('input', this.options.slice(0, this.maxCount).map(e => e.id));
                    } else {
                        this.$emit('input', []);
                    }
                }
            },
            // 搜索结果全选状态
            allResultsChecked: {
                get: function() {
                    return this.filteredStatus;
                },
                set: function(val) {
                    if (val) {
                        this.$emit('input',
                            Array.from(
                                new Set(
                                    [
                                        ...this.value,
                                        ...this.filteredOptions
                                            .slice(0, this.maxFilteredCount)
                                            .map(e => e.id)
                                    ]
                                )
                            ));
                    } else {
                        const filteredValues = this.filteredOptions.map(e => e.id);
                        const res = this.value.filter(e => {
                            return !filteredValues.includes(e);
                        });
                        this.$emit('input', res);
                    }
                }
            },
            // 可选择的最大标签数
            maxCount() {
                return this.options.length > 1000 ? 1000 : this.options.length;
            },
            // 可选择的最大搜索结果
            maxFilteredCount() {
                return this.filteredOptions.length > 1000 ? 1000 : this.filteredOptions.length;
            },
            // 标签全选状态，全部选择(总标签数小于等于1000)或选中前1000个(总数大于1000个)时为true
            checkedStatus() {
                return this.options
                    .slice(0, this.maxCount)
                    .map(e => e.id)
                    .every(id => {
                        return this.value.includes(id);
                    });
            },
            // 搜索结果全选状态，全部选择(总标签数小于等于1000)或选中前1000个(总数大于1000个)时为true
            filteredStatus() {
                return this.filteredOptions
                    .slice(0, this.maxFilteredCount)
                    .map(e => e.id)
                    .every(id => {
                        return this.value.includes(id);
                    });
            },
            // 搜索结果可全选预判断(已选择标签数 + 当前搜索结果全部标签数结果<=1000时为true)
            preCheckable() {
                return Array.from(new Set([...this.value, ...this.filteredOptions.map(e => e.id)])).length <= 1000;
            }
        },
        watch: {
            keyword() {
                this.$refs.selectBox.scrollTop = 0;
                this.checkCount = this.filteredOptions.length < 10 ? this.filteredOptions.length : 10;
            },
            'value.length': {
                handler(len) {
                    if (len === 1000) {
                        this.$toast(this.$t('components.maxThousandLabels'), 'info');
                    }
                }
            }
        },
        created() {
            this.checkCount = this.filteredOptions.length < 10 ? this.filteredOptions.length : 10;
            this.selectedCount = (this.filteredOptions.length < 50 || this.loadAll) ? this.filteredOptions.length : 50;
        },
        methods: {
            focus() {
                this.$nextTick(() => {
                    this.$refs.input.focus();
                });
            },
            open() {
                if (this.disabled) return;
                this.visualMode = false;
                this.focus();
            },
            close() {
                this.visualMode = true;
                this.selectedCount = this.filteredOptions.length < 50 ? this.filteredOptions.length : 50;
                this.keyword = '';
                this.searchOptions();
            },
            remove(option) {
                let index = this.value.indexOf(option.id);
                if (index !== -1) {
                    let newVal = this.value.slice();
                    newVal.splice(index, 1);
                    this.$emit('input', newVal);
                    this.$emit('select', newVal);
                }
            },
            toggleCheck(opt) {
                if (this.value.length > 999 && !this.value.includes(opt.id)) return;
                let index = this.value.indexOf(opt.id);
                let newVal = this.value.slice();
                index !== -1
                    ? newVal.splice(index, 1)
                    : newVal.push(opt.id);
                this.$emit('input', newVal);
                this.toOptionList(newVal);
                this.$emit('select', newVal, this.optList);
            },
            toOptionList(arr) {
                this.optList = [];
                if (arr.length) {
                    for (let item of this.options) {
                        if (arr.includes(item.id)) {
                            this.optList.push(item);
                        }
                    }
                }
            },
            searchOptions: debounce(function () {
                if (this.search === 'async') {
                    this.$emit('search', this.keyword);
                }
            }, 300),

            /**
             * @description 选择列滚动加载方法
             */
            loadMore() {
                if (this.checkCount >= this.filteredOptions.length) return;
                if (this.filteredOptions.length > this.checkCount + 10) {
                    this.checkCount += 10;
                } else {
                    this.checkCount = this.filteredOptions.length;
                }
            },
            /**
             * @description 已选择列滚动加载方法
             */
            loadMoreSelected() {
                if (this.checkCount >= this.selectedOptions.length) return;
                if (this.selectedOptions.length > this.selectedCount + 50) {
                    this.selectedCount += 50;
                } else {
                    this.selectedCount = this.selectedOptions.length;
                }
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../../../../../common/scss/base/_variables';
    @import '../../../../../../common/scss/base/_mixin';

    .multi-select-enter-active {
        @include transition(all .2s ease);
        @include transform(scaleY(1));
    }

    .multi-select-leave-active {
        @include transition(all .2s ease);
        opacity: 1;
    }

    .multi-select-enter {
        @include transform(scaleY(0))
    }

    .multi-select-leave-to {
        opacity: 0;
    }

    .swarm-multi-select {

        $multi-select-width: 300px;
        position: relative;
        z-index: 1;
        display: inline-block;
        width: $multi-select-width;
        min-height: $input-field-height;
        line-height: normal;
        vertical-align: top;
        text-align: left;

        &.focus {
            z-index: 10;
        }

        &.error {
            .visual-mode {
                border-color: $red;
                background-color: $light-red;
            }
        }

        .visual-mode {
            @include box-sizing();
            min-height: $input-field-height;
            max-height: 4*$input-field-height;
            overflow-y: auto;
            padding: 2px 8px 3px 3px;
            border: 1px solid $form-border;
            @include border-radius(4px);
            background-color: white;
            @include user-select(none);
            cursor: text;

            .placeholder {
                display: inline-block;
                font-size: 12px;
                color: $color-light-content;
                margin: 5px 0 0 9px; // 1em = 9 + 3px
            }

            .selected-option {
                $selected-option-height: 20px;
                width: auto;
                position: relative;
                display: inline-block;
                max-width: 7em;
                line-height: $selected-option-height - 2px;
                vertical-align: top;
                margin-top: 3px;
                margin-left: 5px;
                padding: 0 16px 0 4px;
                border: 1px solid #e0e0e0;
                @include ellipsis();
                @include border-radius(2px);
                background-color: $content-bg;

                .remove-icon {
                    position: absolute;
                    right: ($selected-option-height/2 - 5px);
                    top: ($selected-option-height/2 - 5px);
                    fill: $color-light-content;
                    cursor: pointer;

                    &:hover {
                        fill: $theme;
                    }
                }
            }

            .selected-count {
                position: absolute;
                right: 0;
                top: 100%;
                line-height: $input-field-height;
                margin-left: 10px;
                white-space: nowrap;
            }
            &.disabled {
                padding-top: 6px;
                background-color: #f0f2f5;
                border: none;
                .selected-option {
                    width: unset;
                    margin: 0 10px 0 0;
                    padding: 0 5px;
                    border-color: cfd5df;
                    max-width: 450px;
                }
            }
        }

        .select-mode {
            position: absolute;
            top: - $input-field-height - 2px;
            left: 0;
            right: 0;
            padding: 0 10px;
            border: 1px solid $border-color;
            @include border-radius(2px);
            @include box-shadow(0 3px 3px rgba(#030000, .07));
            background-color: white;
            @include transform-origin(center $input-field-height*1.5);

            .select-title {
                line-height: $input-field-height;
            }

            .keyword-input {
                position: relative;

                [type="text"] {
                    display: block;
                    @include box-sizing();
                    width: 100%;
                    padding: 0 30px 0 5px;
                    border: 1px solid #e0e0e0;
                    @include border-radius(2px);
                    line-height: $input-field-height - 2px;
                }

                .icon-search {
                    position: absolute;
                    right: 11px;
                    top: 3px;
                }
            }

            .options {
                overflow: auto;
                margin: 2px 0;
                max-height: $input-field-height * 5;
                line-height: $input-field-height;
                color: $color-light-content;
                @include user-select(none);

                .checkbox {
                    margin: 9px;
                    line-height: normal;
                    vertical-align: top;
                }

                li { // one option
                    height: 35px;
                    cursor: pointer;
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;

                    &:hover {
                        color: $color-content;
                        background-color: #f0f0f0;
                    }

                    span {
                        flex: 1;
                        display: inline-block;
                        line-height: 35px;
                        @include ellipsis();
                    }
                }
            }

            .multi-select-panel {
                padding: 5px;
                border-top: 1px solid #e0e0e0;
                text-align: right;
                .check-all {
                    float: left;
                    margin: 4px 4px 0 4px;
                }
                .icon-help {
                    float: left;
                    line-height: 24px;
                }
            }
        }

        &.disabled {
            width: 500px;
        }
    }
    .countHide{
        z-index: auto;
        .selected-count {
            display: none;
        }
    }
</style>
