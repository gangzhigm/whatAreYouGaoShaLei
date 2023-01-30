<template>
    <!-- 素材标签内容标签选择器， 非公用 -->
    <div class="content-label-selector" v-blur="hideSelector">
        <label class="select-text" @click="toggle()" :class="{placeholder: !selectTitle}">
            {{selectTitle || placeholder || $t('common.selectHolder')}}
            <span class="select-icon icon icon-arrow-down"></span>
        </label>
        <transition name="drop">
            <div class="content" v-if="show">
                <!--一级-->
                <ul class="label-first select-list">
                    <li class="option" v-for="first in options" :key="first.id"
                        :class="{selected: selectedFirst.id === first.id}"
                        @click="selectFirst(first)">
                        {{first.name}}
                        <span class="select-icon icon icon-arrow-right"></span>
                    </li>
                </ul>
                <!--次级及以下-->
                <div class="label-next" v-for="(next, index) in nextList" :key="index">
                    <div class="next-items">
                        <label class="search-label">
                            <input type="text" v-model.trim="next.keyword"
                                   maxlength="200" autofocus
                                   :placeholder="$t('common.selectKeywordHolder')"
                                   @input="filterOptions(next)">
                            <span class="icon icon-search" @click="filterOptions(next)"></span>
                        </label>
                        <ul class="select-list" :class='{morePadding: next.isTopic}'
                            v-load="loadMoreTopic">
                            <li class="option" v-for="nextLabel in next.labelList" :key="nextLabel.id"
                                :class="{selected: nextLabelId === nextLabel.id}">
                                <checkbox :source="nextLabel.id" v-model="selectLabelList"
                                          @input="checkLabel($event, next, nextLabel)"/>
                                <p class="option-txt" @click.stop="selectNextLabel(nextLabel, next.level)">
                                    {{nextLabel.name}}
                                </p>
                                <span v-if="nextLabel.childList && nextLabel.childList.length > 0"
                                      class="select-icon icon icon-arrow-right"></span>
                            </li>
                            <li class="option-null" v-if="next.labelList.length === 0">
                                <template v-if="next.keyword">
                                    {{'components.without' | t}}&nbsp;<span>{{next.keyword}}</span>{{'components.relevant'
                                    | t}}
                                </template>
                                <template v-else>{{'components.noOption' | t}}</template>
                            </li>
                        </ul>
                        <!--添加topic按钮-->
                        <p v-if="next.isTopic" class="add-item" @click.stop="addTopicItem">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-plus"></use>
                            </svg>
                            {{'metaData.add' | t}}
                        </p>
                    </div>
                </div>
            </div>
        </transition>
        <!--新增topic标签-->
        <confirm :title="$t('material.createTag')" @cancel="topicCancel" @confirm="topicConfirm" v-if="createTopic">
            <div class="form-field">
                <label class="label red-label">
                    <span class="red-text">*</span>
                    {{'material.enTagName' | t}}
                </label>
                <input type="text" class="input" v-model.trim="enTopicName" maxlength="200">
            </div>
            <div class="form-field">
                <label class="label red-label">{{'material.cnTagName' | t}}</label>
                <input type="text" class="input" v-model.trim="cnTopicName" maxlength="200">
            </div>
            <p class="red-text">{{'material.atLeastOneTip' | t}}</p>
        </confirm>
    </div>
</template>

<script>
    import {I18N_STORE_NAME} from '@/locales';
    import {debounce} from 'lodash';
    import filterArrayByName from '../../../common/utils/filterArrayByName';
    import { JourneyMaterialApiV1 } from '@/api';
    import { mapState } from 'vuex';

    export default {
        name: 'content-label-selector',
        props: {
            value: {
                type: Array,
                required: true
            },
            placeholder: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                selectLabelList: [],        // 选中的选项Id集合
                selectedFirst: { // 当前选中的一级选项
                    // id
                    // name
                },
                nextLabelId: '',            // 当前选中的次级选项Id
                show: false,                // 选项列表显隐
                /*
                *  [{levelOne}, {levelTwo}, ...]
                */
                nextList: [],               // 次级及其下级集合
                cnTopicName: '',            // 新增topic中文版
                enTopicName: '',            // 新增topic英文版
                createTopic: false,         // 新增topic标签显隐
                topicPageNo: 1,
                topicTotalPage: 0,
                options: [],
                topicId: null,
                loadTopic: false,           // 是否下拉加载Topic
            };
        },
        computed: {
            ...mapState({
                // 当前系统语言
                lang: state => state[I18N_STORE_NAME].lang
            }),
            selectTitle() {
                if (this.selectLabelList.length) {
                    return `${this.$t('material.hasBeenSelected')}${this.selectLabelList.length}${this.$t('material.someTags')}`;
                }
            },
        },
        mounted() {
            JourneyMaterialApiV1
                .getLabelList('', 'other')
                .then(({body: {data}}) => {
                    this.getTopicLabelList('')
                        .then(() => {
                            this.options = data.labelList;
                            let topic = {
                                id: this.topicId,
                                name: 'Topic tag',
                                childList: []
                            };
                            this.options.unshift(topic);

                            this.arrangeEditData();
                        });
                });
        },
        methods: {
            hideSelector() {
                if (!this.show) return;
                this.show = false;
            },
            // 展开关闭选项列
            toggle() {
                this.show = !this.show;
            },
            // 选择一级选择
            selectFirst(item) {
                this.selectedFirst = item;
                this.nextLabelId = '';
                this.loadTopic = false;
                if (item.name === 'Topic tag') {
                    this.topicPageNo = 1;
                    this.loadTopic = true;
                    this.getTopicLabelList('')
                        .then((topicList) => {
                            item.childList = topicList;
                            this.nextList = [{
                                level: 2,
                                labelList: item.childList,
                                isTopic: true,
                                childList: item.childList,
                                keyword: '',
                                parentId: item.id
                            }];
                        });
                    return;
                }
                this.nextList = [{
                    level: 2,
                    labelList: item.childList,
                    isTopic: false,
                    childList: item.childList,
                    keyword: '',
                    parentId: item.id
                }];
            },
            // 次级选择
            selectNextLabel(item, level) {
                if (item.childList && item.childList.length > 0) {
                    // 筛选同级
                    this.nextLabelId = item.id;
                    if (this.nextList.length > 1) {
                        this.nextList = this.nextList.filter(elm => elm.level !== level + 1);
                    }
                    this.nextList.push({
                        level: level + 1,
                        labelList: item.childList,
                        childList: item.childList,
                        keyword: '',
                        parentId: item.id
                    });
                }
            },
            // 关键字筛选
            filterOptions: debounce(function (item) {
                if (item.isTopic) {
                    this.topicPageNo = 1;
                    this.getTopicLabelList(item.keyword)
                        .then((topicList) => {
                            item.labelList = topicList;
                        });
                } else {
                    item.labelList = item.keyword === '' ? item.childList :
                        filterArrayByName(item.labelList, item.keyword, 'name');
                }

                // 搜索当前级， 次级隐藏
                this.nextList = this.nextList.filter(elm => elm.level <= item.level);
            }, 300),
            // 选中、取消选项
            checkLabel(ids, parents, item) {
                let pushData = this.value;
                // 选中时
                if (ids.includes(item.id)) {
                    if (parents.level !== 2 && !ids.includes(parents.parentId)) {
                        // 次级选中， 父级要自动选中
                        ids.push(parents.parentId);
                        let filterData = {
                            id: parents.parentId,
                            parentId: this.nextList.filter(next => next.level === parents.level - 1)[0].parentId,
                            topId: this.selectedFirst.id,
                            topName: this.selectedFirst.name,
                        };
                        let filterTarget = this.options.filter(elm => elm.id === filterData.parentId)[0];
                        let target = filterTarget.childList.filter(elm => elm.id === filterData.id)[0];
                        filterData.name = target.name;
                        pushData.push(filterData);
                    }
                    pushData.push({
                        id: item.id,
                        name: item.name,
                        parentId: parents.parentId,
                        topId: this.selectedFirst.id,
                        topName: this.selectedFirst.name,
                    });
                } else {
                    // 取消选中
                    let delId = pushData.findIndex(data => data.id === item.id);
                    pushData.splice(delId, 1);
                }

                this.$emit('input', pushData);
            },
            // 添加Topic项
            addTopicItem() {
                this.createTopic = true;
            },
            // 取消topic添加
            topicCancel() {
                this.createTopic = false;
                this.cnTopicName = '';
                this.enTopicName = '';
            },
            // 保存topic添加
            topicConfirm() {
                if (!this.enTopicName) {
                    return this.$toast(this.$t('material.atLeastEnTip'), 'warn');
                }

                JourneyMaterialApiV1
                    .createTopicLabel(this.cnTopicName, this.enTopicName)
                    .then(() => {
                        this.$toast(this.$t('material.saveTagSuccess'), 'success');
                        this.topicCancel();
                        // update topic label list
                        this.topicPageNo = 1;
                        this.arrangeTopicLabelList();
                    });
            },
            // 整理编辑数据
            arrangeEditData() {
                if (!this.value.length) return;
                let id = this.value.map(value => value.id);
                this.selectLabelList = [...new Set(id)];
                // 默认先回显第一条数据
                if (this.selectLabelList.length) {
                    let topItem = this.options.filter(elm => elm.id === this.value[0].topId)[0];
                    this.selectFirst(topItem);
                    this.$nextTick(() => {
                        let nextItem;
                        // 第一条数据为二级以下内容
                        if (this.value[0].parentId !== this.value[0].topId) {
                            nextItem = this.nextList[0].labelList.filter(next => next.id === this.value[0].parentId)[0];
                        } else {
                            // 第一条数据为二级内容
                            nextItem = this.nextList[0].labelList.filter(next => next.id === this.value[0].id)[0];
                        }
                        this.selectNextLabel(nextItem, this.nextList[0].level);
                    });
                }
            },
            // 滚动加载topic
            loadMoreTopic() {
                if (this.loadTopic && this.topicPageNo < this.topicTotalPage) {
                    this.topicPageNo += 1;
                    this.arrangeTopicLabelList();
                }
            },
            // 获取Topic标签列表
            async getTopicLabelList(keyword) {
                const {body: {data}} = await JourneyMaterialApiV1
                    .getTopicLabelList(keyword, this.topicPageNo, 10);
                this.topicTotalPage = data.totalPage;
                this.topicId = data.topicId;
                return data.topLabelList;
            },
            // arrange topic label list
            arrangeTopicLabelList() {
                this.getTopicLabelList('')
                    .then((topicList) => {
                        let list = topicList;
                        let levelTwo = this.nextList.findIndex(next => next.level === 2);
                        let levelTwoItem = this.nextList.filter(next => next.level === 2)[0];
                        if (levelTwo > -1) {
                            this.nextList.splice(levelTwo, 1, {
                                level: levelTwoItem.level,
                                labelList: this.topicPageNo > 1 ? levelTwoItem.labelList.concat(list) : list,
                                childList: this.topicPageNo > 1 ? levelTwoItem.childList.concat(list) : list,
                                keyword: '',
                                parentId: levelTwoItem.parentId,
                                isTopic: true
                            });
                        }
                    });
            }
        }
    };
</script>

<style lang="scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';

    $option-height: $input-field-height;
    $border-radius: 4px;
    $hover-bg: #f8f9fa;

    .content-label-selector {
        display: inline-block;
        position: relative;
        text-align: left;
        vertical-align: middle;
        width: 320px;

        color: $color-content;

        &.error {
            .select-text {
                border-color: $red;
            }
        }

        .select-text {
            position: relative;
            display: block;
            @include box-sizing();
            padding-right: $option-height - 2px;
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

            &.placeholder {
                color: $disabled;
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

        .content {
            display: flex;
            position: absolute;
            @include box-sizing();
            top: $option-height + 4px;
            left: 0;
            border: 1px solid $select-border;
            background-color: white;
            z-index: $index-menu - 1;
            @include box-shadow(0 3px 8px rgba(#8b9daf, .16));
            @include transform-origin(top);
            @include border-radius($border-radius);
        }

        .morePadding {
            padding-bottom: 32px;
        }

        .select-list {
            width: 160px;
            max-height: $option-height * 8 + 8px;
            overflow: auto;

            .option {
                position: relative;
                line-height: $option-height;
                margin: 1px 0;
                padding: 0 1em;
                text-align: left;
                color: $color-content;
                cursor: pointer;
                display: flex;

                &:last-child {
                    margin-bottom: 0;
                }

                &:hover {
                    background-color: $hover-bg;
                }

                .icon-arrow-right {
                    position: absolute;
                    right: 15px;
                }

                &.selected {
                    background-color: $select-bg;
                    color: $color-content;
                }

                .option-txt {
                    display: inline-block;
                    width: calc(100% - 30px);
                }
            }

            .checkbox {
                display: inline-block;
                width: 14px;
                height: 14px;
                margin-top: 8px;
                margin-right: 4px;
                line-height: normal;
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
        }

        .label-next {
            width: 160px;
            border-left: 1px solid $border-color;
            @include box-sizing(border-box);

            .next-items {
                position: relative;
            }

            .search-label {
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

            .add-item {
                position: absolute;
                bottom: 0;
                left: 0;
                line-height: 32px;
                padding: 0 1em;
                text-align: center;
                color: $theme;
                cursor: pointer;
                border: 1px solid $border-color;
                width: 100%;
                background: #fff;
                @include box-sizing(border-box);

                svg {
                    width: 14px;
                    height: 14px;
                    fill: $theme;
                    vertical-align: middle;
                    margin: 6px 4px 9px 0;
                }
            }
        }

        .form-field {
            .red-label {
                width: 121px;
            }
        }
    }
</style>
