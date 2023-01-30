<template>
    <div class="member-tag" v-blur="close">
        <ul class="tag-label" @click.stop="toggleListDisplay()">
            <li class="tag-group" v-for="(item,index) of selectedList">
                <span class="tag">
                    <i class="del icon icon-delete" @click.stop="deleteLabel(index)"></i>
                    <span>{{item.name}}</span>
                </span>
            </li>
        </ul>
        <input  ref="button" v-if="globalSearch" class="btn btn-md btn-theme search-model-btn" type="button" :value="globalSearchModel ? $t('common.groupingQuery') : $t('common.globallySearch')" @click="changeSearchModel"/>
        <transition name="drop">
            <ul v-if="tagListShow && !globalSearchInput" class="tag-list-wrapper" :class="{'max-reached': max && selectedList.length >= max}">
                <li v-if="max && selectedList.length >= max" class="max-reached-tip">{{'controller.maxTagA' | t}} {{max}} {{'controller.maxTagB' | t}}</li>
                <li v-else v-for="(levelContent,levelIndex) of dataDeep" class="tag-list">
                    <ul v-if="levelContent&&!levelContent.groupList.length&&!levelContent.labelList.length"
                        class="empty-list-wrapper">
                        <li>{{'journey.noStatus' | t}}</li>
                    </ul>
                    <ul v-if="levelContent&&levelContent.groupList&&levelContent.groupList.length" class="list-wrapper">
                        <li v-for="(groupItem,groupIndex) of levelContent.groupList" :key="groupIndex"
                            :class="{selected:chooseIdList.groups[levelIndex]===groupItem.id}"
                            @click.stop="chooseGroup(groupItem,groupIndex,levelIndex)">
                            <span :title="groupItem.name">{{groupItem.name}}</span>
                            <i class="icon icon-fanhui"></i></li>
                    </ul>
                    <ul v-if="levelContent&&levelContent.labelList&&levelContent.labelList.length" class="list-wrapper">
                        <li v-for="(labelItem,labelIndex) of levelContent.labelList" :key="labelIndex"
                            :class="{selected:chooseIdList.labels[levelIndex]===labelItem.id}"
                            @click.stop="chooseLabel(labelItem,labelIndex,levelIndex)">
                            <span :title="labelItem.name">{{labelItem.name}}</span>
                        </li>
                    </ul>
                </li>
            </ul>
            <div class="csedes" v-if="globalSearchInput">
                <inline-loading v-if="loading"/>
                <template v-else>
                    <div class="drop-down-list">
                        <ul v-load="loadMore" ref="ul">
                            <li>
                                <label class="search-field">
                                    <input type="text" ref="search" v-model.trim="keyword" :placeholder="$t('common.selectKeywordHolder')"
                                            @input="search">
                                    <span class="icon icon-search" @click="search"></span>
                                </label>
                            </li>
                            <li v-if='journeyData.length === 0'>{{'common.noData' | t}}</li>
                            <li v-for="item in journeyData" :key="item.id" :title="item.name">
                                <checkbox class="checkbox-width" v-model="checkedKeys" :source="item" @input="selectTag" :disabled="checkedKeys.length >= max">
                                    {{item.name}}
                                </checkbox>
                            </li>
                        </ul>
                        
                    </div>
                </template>
            </div>
        </transition>
    </div>
</template>

<script type="text/ecmascript-6">
    import { ContactApiV1 } from '@/api';
    import cloneDeep from 'lodash/cloneDeep';
    import debounce from 'lodash/debounce';

    export default {
        props: {
            list: Object,       // {selectedList:[], chooseIdList:{groups: [], labels: []}}
            isMulti: Boolean,   // 单选false, 多选true
            max: Number         // 多选最多个数
        },
        data() {
            return {
                AllGroup: null,
                dataDeep: [], // arr<obj>
                chooseIdList: {groups: [], labels: []},
                selectedList: [],
                tagListShow: false,
                keyword:'',
                globalSearchInput: false,   //全局搜索下拉框
                globalSearch: false,        //全局搜索按钮
                globalSearchModel: false,    //搜索模式 true 全局搜索，false分组搜索
                journeyData: [],
                pageSize: 10,
                pageNumber: 1,
                totalPage: '',
                checkedKeys: [],
            };
        },
        created() {
            ContactApiV1
                .getGroupsOld()
                .then((res) => {
                    this.AllGroup = res.body.data;
                    this.$set(this.dataDeep, 0, this.AllGroup);
                    if (this.list) {
                        this.selectedList = this.list.selectedList ? cloneDeep(this.list.selectedList) : [];
                        this.chooseIdList = this.list.chooseIdList
                            ? cloneDeep(Array.isArray(this.list.chooseIdList)
                                ? this.list.chooseIdList[0]
                                : this.list.chooseIdList
                            )
                            : {groups: [], labels: []};
                    } else {
                        console.warn('错误监控： 未发现提供显示的数据props-list at member-tag.vue; at parnet:' + this.$parent);
                    }
                });
            this.getLabelPage();
        },
        computed:{
            loading() {
                if (this.journeyData) {
                    return false;
                }
                return true;
            },
        },
        mounted() {
            if (this.list.selectedList.length !== 0) {
                this.list.selectedList.forEach(item=>{
                    this.checkedKeys.push(item);
                });
            }
            // document.querySelector('.backdrop')
            //     .addEventListener('click', this.handleDocumentClick);
        },
        beforeDestroy() {
            document.querySelector('.backdrop')
                .removeEventListener('click', this.handleDocumentClick);
        },
        methods: {
            handleDocumentClick(e) {
                let taglist = document.getElementsByClassName('tag-list-wrapper');
                if (e.target !== taglist) {
                    this.tagListShow = false;
                }
            },
            toggleListDisplay() {
                this.tagListShow = !this.tagListShow;
                this.globalSearch = !this.globalSearch;
                this.globalSearchInput = false;
                this.globalSearchModel = false;
            },
            chooseGroup(e, groupIndex, levelIndex) {
                if (!this.isMulti) {
                    this.$set(this.chooseIdList.groups, levelIndex, e.id);
                }
                this.clearSelectAfterIndex('group', levelIndex);
                this.$set(this.dataDeep, ~~levelIndex + 1, e);
            },
            chooseLabel(e, labelIndex, levelIndex) {
                if (this.isMulti) {
                    let arr = [];
                    for (let i of this.selectedList) {
                        arr.push(i.id);
                    }
                    if (!arr.includes(e.id)) {
                        this.selectedList.push({name: e.name, id: e.id, level: levelIndex});
                        this.dataDeep = [this.AllGroup];
                    }
                } else {
                    this.$set(this.chooseIdList.labels, levelIndex, e.id);
                    this.$set(this.selectedList, 0, {name: e.name, id: e.id, level: levelIndex});
                }
                this.clearSelectAfterIndex('label', levelIndex);
                this.tagListShow = false;
                this.globalSearch = false;
                this.saveChoose();
            },
            clearSelectAfterIndex(source, levelIndex) {
                let level = Number(levelIndex) + 1;
                if (!this.isMulti) {
                    for (let i = level; i < this.chooseIdList.groups.length; i++) {
                        delete this.chooseIdList.groups[i];
                    }
                    for (let i = level; i < this.chooseIdList.labels.length; i++) {
                        delete this.chooseIdList.labels[i];
                    }
                    if (source === 'group') {
                        level += 1;
                        delete this.chooseIdList.labels[levelIndex];

                    } else {
                        delete this.chooseIdList.groups[levelIndex];
                    }
                }
                this.dataDeep = this.dataDeep.slice(0, level);
            },
            deleteLabel(labelIndex) {
                this.selectedList.splice(labelIndex, 1);
                this.saveChoose();
            },
            saveChoose() {
                this.$emit('choose', {chooseIdList: this.chooseIdList, selectedList: this.selectedList});
            },
            search:debounce(function() {
                this.pageNumber = 1;
                this.journeyData = [];
                this.getLabelPage();
            },300),
            changeSearchModel() {
                this.globalSearchInput = !this.globalSearchInput;
                this.globalSearchModel = !this.globalSearchModel;
                if (this.keyword !== '') {
                    this.keyword = '';
                    this.search();
                }
            },
            getLabelPage() {
                ContactApiV1
                    .getLabelPage(this.keyword,this.pageNumber,this.pageSize)
                    .then((res) =>{
                        this.journeyData = this.journeyData.concat(res.body.data.list);
                        this.totalPage = res.body.data.totalPage;
                    });
            },
            close() {
                this.tagListShow = false;
                this.globalSearch = false;
                this.globalSearchInput = false;
                this.globalSearchModel = false;
                if (this.keyword !== '') {
                    this.keyword = '';
                    this.search();
                } 
            },
            selectTag(value) {
                this.selectedList = value;
                this.saveChoose();
            },
            loadMore() {
                if (this.pageNumber >= this.totalPage) return;
                let target = this.$refs.ul;
                if (target.clientHeight + target.scrollTop + 1 > target.scrollHeight) {
                    this.pageNumber++;
                    this.getLabelPage();
                }
            },
        },
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .member-tag {
        position: relative;
        vertical-align: top;
        cursor: pointer;
        display: inline-block;
        min-height: $input-field-height;
        text-align: left;
        .tag-label {
            width: 100%;
            min-height: $input-field-height;
            box-sizing: border-box;
            border-radius: 4px;
            border: 1px solid $form-border;
            padding-bottom: 5px;
            .tag-group {
                position: relative;
                display: inline-block;
                .tag {
                    display: inline-block;
                    min-width: 112px;
                    max-width: 285px;
                    height: 25px;
                    line-height: 25px;
                    vertical-align: top;
                    margin: 5px 5px 0 5px;
                    padding: 0 0 0 10px;
                    box-sizing: border-box;
                    border-radius: 3px;
                    color: $dark-purple;
                    border: 1px solid $dark-purple;
                    @include ellipsis;
                    .del {
                        position: relative;
                        float: right;
                        box-sizing: border-box;
                        color: $dark-purple;
                        width: 20px;
                        height: 23px;
                        line-height: 23px;
                        display: inline-block;
                        font-size: 12px;
                        text-align: center;
                        border-radius: 3px;
                    }
                }
                .tag:hover {
                    background-color: $light-purple;
                    &:hover .del {
                        background-color: $red;
                        color: white;
                    }
                }
            }
        }
        .tag-list-wrapper {
            min-width: 935px;
            overflow: hidden;
            position: absolute;
            z-index: 1;
            &.max-reached {
                min-width: 0;
                left: 0;
                right: 0;
            }
            .max-reached-tip {
                text-align: center;
                color: $color-light-content;
                padding: 1em;
                background-color: $content-bg;
                border: 1px solid $border-color;
            }
            .tag-list {
                margin-top: 5px;
                margin-right: 3px;
                border-radius: 3px;
                border: 1px solid $border-color;
                background-color: white;
                width: 150px;
                max-height: 350px;
                overflow-y: auto;
                float: left;
                box-sizing: border-box;
                .list-wrapper, .empty-list-wrapper {
                    li {
                        position: relative;
                        height: 32px;
                        line-height: 32px;
                        padding-left: 8px;
                        box-sizing: border-box;
                        overflow: hidden;
                    }
                }
                .list-wrapper {
                    li {
                        span {
                            display: inline-block;
                            width: 100px;
                            @include ellipsis();
                        }
                        .icon {
                            position: absolute;
                            right: 8px;
                        }
                        &:hover {
                            color: white;
                            background-color: $green;
                        }
                    }
                }
                .empty-list-wrapper {
                    text-align: center;
                    color: $color-light-content;
                }
            }
        }
        .search-model-btn {
            position: absolute;
            top: 0;
            right: 0;
            transform: translateX(105%);
        }
        .csedes{
            width: 300px;
            position: absolute;
            left: 0;
            top: 33px;
            background-color: #fff;
            z-index: 1;
            border-radius: 4px;

            .drop-down-list {
                display: flex;
                width: 300px;
                background-color: white;
                border: 1px solid $form-border;
                border-radius: 4px;
                position: relative;
                box-sizing: border-box;

                ul {
                    width: 100%;
                    height: 250px;
                    overflow: auto;
                    padding-top: 32px;
                    border-right: 1px solid $form-border;
                    box-sizing: border-box;
                    ul {
                        position: absolute;
                        top: 0;
                        right: 0;
                        height: 250px;
                        background-color: #ffffff;
                        padding-top: 32px;
                        li:first-child{
                            width: 100%;
                            position: relative;
                            padding: 0 8px 0 16px;
                            box-sizing: border-box;
                        }
                    }

                    li {
                        padding: 0 20px 0 14px;
                        height: $input-field-height;
                        line-height: $input-field-height;
                        @include ellipsis();
                        cursor: pointer;

                        &:hover {
                            background-color: $hover-bg;
                        }

                        .icon {
                            float: right;
                        }

                        .position-span{
                            float: left;
                            position: relative;
                            .icon-arrow-right{
                                position: absolute;
                                top: 0;
                                left: 110px;
                            }
                        }
                        .checkbox-width{
                            width: 255px;
                        }
                    }
                    li:first-child{
                        width: 100%;
                        position: absolute;
                        top: 0;
                        left: 0;
                        padding: 0;
                    }
                    .active {
                        background-color: $select-bg;

                        &:hover {
                            background-color: $select-bg;
                        }
                    }
                    li.noSearch{
                        display: none;
                    }
                }
                ul.noPadding{
                    padding-top: 0;
                }
                .journey-loading {
                    position: absolute;
                    right: 55px;
                    top: 50px;
                }
                .search-field{
                    position: relative;
                    display: flex;
                    width: 100%;
                    align-items: center;
                    height: $input-field-height;
                    border-bottom: 1px solid $select-border;
                    border-left: none;
                    background-color: $title-bg;
                    @include border-radius(0);
                    color: $color-light-content;
                    box-sizing: border-box;
                    padding: 0;
                    z-index: 1;

                    input {
                        height: $input-field-height - 1;
                        padding: 0 8px 0 28px;
                        width: 100%;
                        min-width: 5em; // 否则placeholder显示不全
                        background-color: transparent;
                        border-left: none;
                        border-top: none;
                        border-right: none;
                        border-bottom: 1px solid #cfd5df;

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
                        height: $input-field-height - 3px;
                        line-height: $input-field-height;
                        text-align: center;
                        left: 1px;
                        top: 1px;
                        background-color: transparent;
                    }
                }
                .secSearch{
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: 50%;
                }

                &.double-width {
                    width: 450px;
                    &>ul {
                        width: 150px;
                        li {
                            ul {
                                width: 300px;
                                left: 150px;
                            }
                            .secSearch {
                                width: 300px;
                                left: 150px;
                            }
                        }
                        &>li:first-child {
                            width: 150px;
                        }
                    }
                }
            }
        }
    }
</style>
