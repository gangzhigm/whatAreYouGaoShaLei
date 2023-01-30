<template>
    <div class="cascading-multi" v-blur="close" :class="{active: show}">
        <label class="select-text" @click="toggle">
            <span class="select-icon icon icon-arrow-down"></span>
            <div class="labels">
                <div v-for="(option, index) in checkedOptions" :key="index" class="title">
                    <span class="label-name">{{option.lv2Name}}-{{option.lv3Name}}</span>
                    <span class="close icon icon-close" @click="delLabel(index, option.lv2Name, option.lv3Name)"></span>
                </div>
            </div>
            <span v-if="checkedKeys && checkedKeys.length === 0" class="placeholder">{{placeholder ? placeholder : $t('components.notDisplay')}}</span>
        </label>
        <transition name="drop">
            <div class="list-container" v-show="show" :class="[{'auto-width': autoWidth}, dropDirection]">
                <ul class="select-list">
                    <li class="option" :class="opt.id === activeId ? 'active' : ''" v-for="(opt, index) in options" :key="index"
                        @click='selectGroup(opt.id, opt.name)'>
                        <span class="lv2Name">{{opt.name || $t('common.unknown')}}</span>
                        <span class="icon icon-arrow-right pull-right"></span>
                        <ul v-if="opt.id === groupId" @click.stop>
                            <label class="search-field">
                                <input type="text" v-model="keyword" @keyup.enter="searchLv3" :placeholder="$t('common.selectKeywordHolder')" autofocus>
                                <span class="icon icon-search" @click="searchLv3"></span>
                            </label>
                            <li v-for="(child, index) in opt.child" :key="index">
                                <checkbox v-model="checkedKeys" :source="child[uniqueKey]" @input="input">
                                    {{child.name || $t('common.unknown')}}
                                </checkbox>
                            </li>
                        </ul>
                    </li>
                    <li class="option-null" v-if="options.length === 0">
                        {{'components.without' | t}} <span>{{keyword}}</span>{{'components.relevant' | t}}
                    </li>
                </ul>
            </div>
        </transition>
    </div>
</template>
<script type="text/babel">
    // import filterArrayByName from '../../../../common/utils/filterArrayByName';
    export default {
        name: 'multi-select',
        props: {
            dropDirection: {
                type: String,
                default: 'right'
            },
            // 下拉列表项
            options: {
                type: Array,
                required: true
            },
            searchOptions: {
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
            }
        },
        data() {
            return {
                show: false,
                keyword: '',
                groupId: null,
                activeId: null,
            };
        },
        methods: {
            toggle() {
                this.show = !this.show;
                if (this.show) {
                    this.groupId = '';
                }
            },
            close() {
                this.show = false;
                this.groupId = '';
            },
            selectGroup(groupId, name) {
                this.keyword = '';
                this.$emit('labelLen', this.checkedKeys);
                this.activeId = groupId;
                this.groupId = groupId;
                this.$emit('getLevel3Labels', name);
            },
            input(child) {
                this.$emit('select', child);
            },
            searchLv3() {
                this.$emit('searchLv3', this.keyword);
            },
            delLabel(idx, lv2Name, lv3Name) {
                let arr = [];
                for (let j = 0; j < this.checkedKeys.length; j++) {
                    arr[j] = this.checkedKeys[j];
                }
                this.$emit('labelLen', arr);
                this.checkedOptions.splice(idx, 1);
                for (let i = 0; i < this.checkedKeys.length; i++) {
                    if (this.checkedKeys[i] === lv3Name) {
                        this.checkedKeys.splice(i, 1);
                    }
                }
                this.$emit('delLabel', this.checkedKeys, lv2Name);
            }
        },
        computed: {
            // filteredOptions() {
            //     return filterArrayByName(this.options, this.keyword.trim());
            // },
            checkedKeys: {
                get() {
                    if (this.value) {
                        return this.value;
                    }
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
                let arr = [];
                for (let i = 0; i < this.searchOptions.length; i++) {
                    if (this.searchOptions[i].child) {
                        for (let j = 0; j < this.searchOptions[i].child.length; j++) {
                            for (let z = 0; z < this.checkedKeys.length; z++) {
                                if (this.checkedKeys[z] === this.searchOptions[i].child[j].name) {
                                    arr.push({
                                        lv2Name: this.searchOptions[i].name,
                                        lv3Name: this.searchOptions[i].child[j].name
                                    });
                                }
                            }
                        }
                    } 
                }
                return arr;
            },
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../../../common/scss/base/variables';
    @import '../../../../common/scss/base/mixin';

    $border-radius: 4px;

    .cascading-multi {
        width: 70%;
        position: relative;
        vertical-align: middle;
        color: $color-content;

        // &:not(.full-width) {
        //     display: inline-block;
        // }

        &.error {
            .select-text {
                border-color: $red;
            }
        }

        &.active {
            .select-text {
                border-color: $theme;
                max-height: none;

                .title {
                    white-space: normal;
                    overflow: visible;
                }
            }
        }

        &:hover {
            .select-text {
                border-color: $theme;
            }
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

            .labels {
                width: 96%;
                float: left;
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
                display: flex;
                align-items: center;
                float: left;
                line-height: 18px;

                span.close {
                    padding: 0px 3px;
                    cursor: pointer;
                }

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
            width: 50%;
            height: 100%;
            overflow: auto;
            max-height: $input-field-height * 10;
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

                &.active {
                    background-color: $hover-bg;
                }

                .checkbox {
                    display: block;
                    @include ellipsis();
                }

                .lv2Name {
                    display: inline-block;
                    width: 95%;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    line-height: 12px;
                }

                ul {
                    width: 50%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    right: 0;
                    border-left: 1px solid $form-border;
                    overflow: auto;

                    li {
                        padding: 0 10px;
                    }
                }
            }

            .option-null {
                color: $disabled;
                line-height: $input-field-height;
                font-style: italic;
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
