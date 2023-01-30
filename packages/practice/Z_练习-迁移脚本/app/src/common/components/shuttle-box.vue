<!--穿梭框-->
<template>
    <div class="shuttle-box">
        <!--左侧列表-->
        <div class="list-content">
            <span class="group-title">{{titles[0]}}&nbsp;（{{leftSelectedLen}} / {{leftLen}}）</span>
            <label class="search-field" v-if="search">
                <input type="text" ref="leftSearch" v-model="leftKeyword" autofocus
                       :placeholder="$t('common.selectKeywordHolder')" @input="searchOptions('left')">
                <span class="icon icon-search" @click="searchOptions('left')"></span>
            </label>
            <div class="security-list">
                <div class="security-item" :class="{'item-active':item.sel}" v-for="item in filterLeftList"
                     :title="item.name" @click="handleSelect(item)">
                    <checkbox v-model="leftIds" :source="item.id">
                        {{item.name}}
                    </checkbox>
                </div>
                <div class="option-null" v-if="filterLeftList.length === 0">
                    <template v-if="leftKeyword">
                        {{'components.without' | t}}<span>{{leftKeyword}}</span>{{'components.relevant' | t}}
                    </template>
                    <template v-else>{{'components.noOption' | t}}</template>
                </div>
            </div>
        </div>

        <!--按钮组-->
        <div class="btn-content">
            <button class="btn btn-theme" :disabled="!leftLen" @click="handleRightAll">
                <i class="icon icon-shuangjiantouyou"></i>
            </button>
            <button class="btn btn-theme" :disabled="!leftSelectedLen" @click="handleRightOne">
                <i class="icon icon-arrow-right"></i>
            </button>
            <button class="btn btn-theme" :disabled="!rightSelectedLen" @click="handleLeftOne">
                <i class="icon icon-arrow-left"></i>
            </button>
            <button class="btn btn-theme" :disabled="!rightLen" @click="handleLeftAll">
                <i class="icon icon-shuangjiantouzuo"></i>
            </button>
        </div>

        <!--右侧列表-->
        <div class="list-content select-list-content">
            <span class="group-title">{{titles[1]}}&nbsp;（{{rightSelectedLen}} / {{rightLen}}）</span>
            <label class="search-field" v-if="search">
                <input type="text" ref="rightSearch" v-model="rightKeyword" autofocus
                       :placeholder="$t('common.selectKeywordHolder')" @input="searchOptions('right')">
                <span class="icon icon-search" @click="searchOptions('right')"></span>
            </label>
            <div class="security-list select-list">
                <!--右侧列表拖拽排序-->
                <draggable v-model="filterRightList" @change="orderOptions"
                           :group="{name: 'item'}" :animation="150" :disabled="!draggable">
                    <div class="security-item" :class="{'item-active':item.sel, disabled: item.disabled}"
                         v-for="item in filterRightList"
                         :title="item.name" @click="changeSelectedStatus(item)">
                        <checkbox v-model="rightIds" :source="item.id" :disabled="item.disabled">
                            {{item.name}}
                        </checkbox>
                        <span class="order icon icon-tuozhuai1" v-if="draggable"></span>
                    </div>
                </draggable>
                <div class="option-null" v-if="filterRightList.length === 0">
                    <template v-if="rightKeyword">
                        {{'components.without' | t}}<span>{{rightKeyword}}</span>{{'components.relevant' | t}}
                    </template>
                    <template v-else>{{'components.noOption' | t}}</template>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import filterArrayByName from '../../common/utils/filterArrayByName';
    import debounce from 'lodash/debounce';

    export default {
        name: 'shuttle-box',

        props: {
            // fromPage 页面
            // custom 联系人管理，联系人分群
            // setting 企业设置部分（组织成员，数据共享）
            fromPage: {
                type: String,
                default: 'setting'
            },
            // data
            dataList: {
                type: Array,
                require: true
            },
            //selected ids
            selectedVal: {
                type: String,
                required: true
            },
            trim: {
                type: Boolean,
                default: true
            },
            search: {
                type: [Boolean, String],
                default: false
            },
            // 标题
            titles: {
                type: Array,
                default: ['left', 'right']
            },
            // 拖拽排序
            draggable: {
                type: Boolean,
                default: false
            }
        },
        model: {
            prop: 'sv',
            event: 'handleOptionClick'
        },
        data() {
            return {
                allList: [],
                // left list
                leftList: [],
                // right list
                rightList: [],

                sv: this.selectedVal,

                // left 已选 ids
                leftIds: [],
                // right 已选 ids
                rightIds: [],

                leftKeyword: '',
                rightKeyword: ''
            };
        },
        watch: {
            selectedVal: {
                handler: function (newVal) {
                    this.selectedVal = newVal;
                    this.fetchList();
                },
                immediate: true
            },
            dataList() {
                this.fetchList();
            },
        },
        computed: {
            // 左侧列表搜索
            filterLeftList() {
                const keyword = this.trim ? this.leftKeyword.trim() : this.leftKeyword;
                const key = 'name';
                return (this.search && this.search !== 'async' && keyword)
                    ? filterArrayByName(this.leftList, keyword, key)
                    : this.leftList;
            },
            // 左侧 length
            leftLen() {
                return this.leftList.length || 0;
            },
            // 左侧已选中的 length
            leftSelectedLen() {
                return this.leftIds.length || 0;
            },
            // 右侧列表搜索
            filterRightList: {
                get() {
                    const keyword = this.trim ? this.rightKeyword.trim() : this.rightKeyword;
                    const key = 'name';
                    return (this.search && this.search !== 'async' && keyword)
                        ? filterArrayByName(this.rightList, keyword, key)
                        : this.rightList;
                },
                set(newOptions) {
                    this.rightList = newOptions;
                }
            },
            // 右侧 length
            rightLen() {
                return this.rightList.length || 0;
            },
            // 右侧已选中的 length
            rightSelectedLen() {
                return this.rightIds.length || 0;
            },
        },
        methods: {
            // 获取列表
            fetchList() {
                this.allList = this.dataList;
                // 初始化两侧列表
                this.allList.map(data => {
                    data.name = data.name ? data.name : data.cName;
                    data.sel = false;
                });
                this.rightList = [];
                this.leftList = [];
                let ids = this.selectedVal.split(',')
                    .filter(id => id !== '')
                    .map(id => Number(id));
                // rightList
                ids.forEach(id => {
                    let optionRight = this.allList.filter(attr => attr.id === id)[0];
                    if (optionRight) {
                        this.rightList.push(optionRight);
                        // 格式化右侧列表 选中状态置为 false
                        this.initAll(this.rightList);

                        this.sv = this.filterRightList
                            .map(item => item.id)
                            .join(',');
                        this.$emit('handleOptionClick', this.sv);
                    }
                });
                // leftList
                this.leftList = this.allList.filter(data => ids.indexOf(data.id) === -1);
            },
            // sel(是否已选中) 全部初始化为false
            initAll(ary) {
                ary.forEach(item => {
                    item.sel = false;
                });
            },
            selectAll(ary) {
                ary.forEach(item => {
                    item.sel = true;
                });
            },
            // order
            orderOptions() {
                this.sv = this.filterRightList
                    .map(item => item.id)
                    .join(',');
                    
                this.$emit('orderOptions');
                this.$emit('handleOptionClick', this.sv);
            },
            // search
            searchOptions: debounce(function (flag) {
                if (this.search === 'async') {
                    flag === 'left'
                        ? this.$emit('search', this.leftKeyword)
                        : this.$emit('search', this.rightKeyword);
                }
            }, 300),
            changeSelectedStatus(option) {
                if (this.fromPage === 'custom' && (option.id === -4 || option.id === -5 || option.id === -6)) return;
                if (this.fromPage === 'material' && [1,2,3,4,5,6].includes(option.id)) return;
                option.sel = !option.sel;
            },
            // select
            handleSelect(item) {
                if (!item.sel) {
                    this.$set(item, 'sel');
                }
                item.sel = !item.sel;
            },
            // move
            removeAndPush(removeArr, pushArr) {
                this.initAll(pushArr);

                removeArr.forEach(item => {
                    if (item.sel) {
                        pushArr.push(item);
                    }
                });

                // delete here
                for (let i = removeArr.length - 1; i >= 0; i--) {
                    let item = removeArr[i];
                    if (item.sel) {
                        removeArr.splice(i, 1);
                    }
                }

                this.initAll(pushArr);

                this.sv = this.filterRightList
                    .map(item => item.id)
                    .join(',');
                this.$emit('handleOptionClick', this.sv);
            },

            // 批量移至右
            handleRightOne() {
                this.$emit('toRight');
                this.leftIds = [];
                this.rightIds = [];
                this.leftKeyword = '';
                this.rightKeyword = '';
                this.removeAndPush(this.leftList, this.rightList);
            },
            // 全部移至右
            handleRightAll() {
                this.$emit('toRight');
                this.selectAll(this.leftList);
                this.handleRightOne();
            },
            // 批量移至左
            handleLeftOne() {
                this.leftIds = [];
                this.rightIds = [];
                this.leftKeyword = '';
                this.rightKeyword = '';
                this.removeAndPush(this.rightList, this.leftList);
            },
            // 全部移至左
            handleLeftAll() {
                // 联系人管理，联系人分群页面
                // 始终显示在右侧且不可点击:-4 微信，-5 导入时间，-6 更新时间
                let arr = [];
                if (this.fromPage === 'custom') {
                    arr = this.rightList.filter(right => right.id !== -4 && right.id !== -5 && right.id !== -6);
                    this.selectAll(arr);
                } else if (this.fromPage === 'material') {
                    arr = this.rightList.filter(right => ![1,2,3,4,5,6].includes(right.id));
                    this.selectAll(arr);
                } else {
                    this.selectAll(this.rightList);
                }
                this.handleLeftOne();
            },
        },
    };
</script>

<style type="text/css" lang="scss">
    @import '../scss/base/variables';
    @import '../scss/base/mixin';

    $option-height: $input-field-height;
    .shuttle-box {
        display: flex;
        flex-direction: row;
        width: 700px;

        .btn + .btn {
            margin-left: 0;
        }

        .list-content {
            flex-grow: 3;
            width: 200px;

            .security-list {
                border: solid 1px $form-border;
                border-radius: 0 0 4px 4px;
                height: 200px;
                max-height: 200px;
                overflow-y: auto;

                .security-item {
                    position: relative;
                    cursor: pointer;

                    &:not(.disabled):hover {
                        background-color: $hover-bg;

                        .order {
                            color: $green;
                        }
                    }

                    &.disabled {
                        color: $disabled;
                        /*pointer-events: none;*/
                        cursor: not-allowed;
                    }

                    .text-appended {
                        box-sizing: border-box;
                        width: 100%;
                        padding: 0 10px;
                        display: block;
                        @include ellipsis();
                    }

                    .order {
                        position: absolute;
                        top: 0;
                        right: 2px;
                    }
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

                .item-active {
                    color: $green;
                }
            }

            .group-title {
                display: inline-block;
                background-color: $light-green;
                color: #fff;
                border-radius: 4px 4px 0 0;
                width: 100%;
                text-align: center;
            }

            .search-field {
                position: relative;
                display: flex;
                align-items: center;
                height: $input-field-height;
                border-left: 1px solid $form-border;
                border-right: 1px solid $form-border;
                background-color: $title-bg;
                @include border-radius(0);
                color: $color-light-content;

                input {
                    height: $input-field-height;
                    padding: 0 8px 0 28px;
                    width: 100%;
                    min-width: 5em; /*否则placeholder显示不全*/
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

        .btn-content {
            display: flex;
            flex: 1;
            flex-direction: column;
            justify-content: space-evenly;
            align-items: center;
            padding: 10px;
            margin-top: 30px;
        }
    }
</style>
