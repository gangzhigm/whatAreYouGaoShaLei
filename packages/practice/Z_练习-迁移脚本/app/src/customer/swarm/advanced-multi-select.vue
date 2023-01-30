<template>
    <div class="swarm-multi-select advanced-multi-select" @click.stop v-blur="close">
        <transition name="multi-select">
            <div class="visual-mode" @mousedown.stop.prevent="open" key="visual">
                <span class="placeholder" v-if="selectOptList.length === 0">{{'swarm.selectSwarm' | t}}</span>
                <span class="selected-option" v-else v-for="option in selectOptList" @mousedown.stop @mouseup.stop :title="option.name">
                    <svg class="remove-icon" role="button" width="8" height="8" @mousedown.prevent="remove(option)">
                        <use xlink:href="#icon-close"></use>
                    </svg>
                    {{option.name}}
                </span>
            </div>
        </transition>
        <transition name="multi-select">
            <div v-if="!show" class="select-mode">
                <!--左侧分组列表-->
                <div class="mode-group">
                    <div class="search-tree-wrapper" v-if="treeParams.groupSelectShow" @click.stop>
                        <!-- 带有搜索功能的树 -->
                        <search-tree :searchTreeData="groupList"
                                     :treeActiveId="treeParams.treeActiveGid"
                                     @getTreeAct="getTreeAct"
                                     :action="false"
                                     :levelStage="true"
                                     :moduleRange="'swarm'">
                        </search-tree>
                    </div>
                </div>
                <!--右侧分群列表-->
                <div class="mode-swarm">
                    <div class="keyword-input">
                        <input type="text" v-model.trim="swarmKeyword" maxlength="100" :placeholder="$t('common.selectKeywordHolder')"
                               autocomplete="off" aria-autocomplete="none" @input="searchSwarm">
                        <i class="icon icon-search"></i>
                    </div>
                    <ul class="swarm-list" v-load="loadMore">
                        <li class="swarm" v-for="option in swarmList"
                            @click="getOptNum(option)"
                            :title="option.name">
                            <checkbox :value="selectIds" :source="option.id"/>
                            <span>{{option.name}}</span>
                        </li>
                        <li class="no-data" v-if="swarmList.length === 0 && !swarmLoading">{{'common.noData' | t}}</li>
                        <inline-loading class="sm" v-if="swarmLoading"/>
                    </ul>
                    <div class="check-load" v-if="checkLoad">
                        <inline-loading/>
                    </div>
                </div>
                <div class="multi-select-panel">
                    <input type="button" class="btn btn-sm btn-theme" :value="$t('common.confirm')" @mousedown.stop="close">
                </div>
            </div>
        </transition>
    </div>
</template>
<script type="text/ecmascript-6">
    import { ContactApiV1 } from '@/api';
    import debounce from 'lodash/debounce';
    // import Bus from '../../common/components/group-tree/bus.js';

    export default {
        props: {
            group: {                    //分组列表数据
                type: Array,
                require: true
            },
            swarmAmount: Number         //高级分群已有子分群数量
        },
        data() {
            return {
                show: true,             //展示模式, false代表进入选择模式
                groupKeyword: '',       //分组搜索关键字
                swarmKeyword: '',       //分群搜索关键字
                groupList: [],          //分组列表
                swarmList: [],          //当前分群列表
                selectIds: [],          //当前已选分群ID列表
                pageNumber: 1,          //分群列表页码
                totalPage: 1,           //分群列表总页码
                swarmLoading: false,    //分群列表获取状态
                selectOptList: [],      //已选分群列表
                num: 0,                 //已选子分群数
                checkLoad: false,       //选择分群时，加载
                treeParams: {               // 树组件参数
                    parentGroupName: '',
                    groupSelectShow: false,
                    treeActiveGid: 0,
                    searchSelectTree: {}
                },
            };
        },
        mounted() {
            this.groupList = this.group;
            this.initGroup();
        },
        methods: {
            //选中分组的所有父级元素open=true
            fathersOpen(list, id) {
                let fathersArr = [];
                fathersArr = this.$getCurrentFathers(list, id);
                fathersArr.forEach(item => {
                    item.open = true;
                });
            },
            /**
             * 获取分群列表
             * @param load {String} load: 是否是滚动加载
             */
            getSwarmList(load) {
                ContactApiV1
                    .getSwarmList(
                        this.treeParams.treeActiveGid,
                        this.pageNumber,
                        this.swarmKeyword
                    )
                    .then(res => {
                        const data = res.body.data;
                        this.totalPage = data.totalPage;
                        if (load === 'load') {
                            this.swarmList = this.swarmList.concat(data.swarmList);
                        } else {
                            this.swarmList = data.swarmList;
                        }
                        this.swarmLoading = false;
                    })
                    .catch(() => {
                        this.swarmLoading = false;
                    });
            },
            //滚动加载分群列表
            loadMore() {
                if (!this.swarmLoading && this.pageNumber < this.totalPage) {
                    this.swarmLoading = true;
                    this.pageNumber++;
                    this.getSwarmList('load');
                }
            },
            //初始化分组选择
            initGroup() {
                this.groupList[0].id = 0;
                //"全部分组"，open = true 默认展开
                let firstGroup = this.$getCurrentPart(2, this.groupList);
                firstGroup.open = true;
                firstGroup.noSelect = true;
                if (
                    this.treeParams.treeActiveGid !== -2 &&
                    this.treeParams.treeActiveGid !== -99
                ) {
                    let curGroup = this.$getPartById(this.treeParams.treeActiveGid, this.groupList);
                    this.treeParams.parentGroupName = curGroup.name;
                    this.treeParams.searchSelectTree = curGroup;
                } else {
                    this.treeParams.parentGroupName = firstGroup.name;
                    this.treeParams.treeActiveGid = firstGroup.id;
                }
                this.getSwarmList();
            },
            /**
             * 切换分组
             * @param group 选择的分组
             */
            getTreeAct(group) {
                if (!this.swarmLoading && this.treeParams.treeActiveGid !== group.id) {
                    this.swarmLoading = true;
                    this.treeParams.treeActiveGid = group.id;
                    this.treeParams.parentGroupName = group.name;
                    this.treeParams.searchSelectTree = group; //search-tree中选中的某一项的id
                    this.pageNumber = 1;
                    this.swarmList = [];
                    this.getSwarmList();
                }
            },
            //搜索swarm
            searchSwarm: debounce(function () {
                this.swarmLoading = true;
                this.pageNumber = 1;
                this.swarmList = [];
                this.getSwarmList();
            },500),
            /**
             * 选择分群
             * @param opt 选择的分群
             */
            getOptNum(opt) {
                this.checkLoad = true;
                let idsNum = 0;
                if (opt.type === 8) {
                    ContactApiV1
                        .getAdvanced(opt.id)
                        .then((res) => {
                            let data = res.body.data.contactSwarmDtoList;
                            idsNum = data.length;
                            this.toggleCheck(opt,idsNum);
                        });
                } else {
                    this.toggleCheck(opt,1);
                }
            },
            /**
             * 选择分群数据处理
             * @param opt 选择的分群
             * @param idsNum 选择的分群包含子分群数量
             */
            toggleCheck(opt,idsNum) {
                this.checkLoad = false;
                let index = this.selectIds.indexOf(opt.id);
                let newVal = this.selectIds;
                if (index === -1 && this.swarmAmount + this.num + idsNum > 20) {
                    this.$toast(this.$t('swarm.createUp'), 'warn');
                    return;
                }
                opt.num = idsNum;
                if (index !== -1) {
                    newVal.splice(index, 1);
                    this.selectOptList.splice(index, 1);
                    this.num -= idsNum;
                } else {
                    newVal.push(opt.id);
                    this.selectOptList.push(opt);
                    this.num += idsNum;
                }
                this.$emit('input', newVal);
                this.$emit('select', this.selectIds);
            },
            /**
             * 删除分群
             * @param option 删除的分群
             */
            remove(option) {
                let index = this.selectIds.indexOf(option.id);
                if (index !== -1) {
                    let newVal = this.selectIds;
                    newVal.splice(index, 1);
                    this.selectOptList.splice(index, 1);
                    this.num -= option.num;
                    this.$emit('input', newVal);
                    this.$emit('select', this.selectIds);
                }
            },
            //打开下拉框
            open() {
                this.treeParams.groupSelectShow = true;
                this.$nextTick(() => {
                    // 展开当前所在分组的所有父级
                    // Bus.$emit('open', { treeData: this.groupList, groupData: this.treeParams.searchSelectTree });
                    this.fathersOpen(this.groupList, this.treeParams.searchSelectTree.id);
                });
                this.show = false;
            },
            //关闭下拉框
            close() {
                this.treeParams.groupSelectShow = false;
                this.show = true;
            },
        }
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../common/scss/base/_variables';
    @import '../../common/scss/base/_mixin';

    .advanced-multi-select {
        width: 680px;
        .select-mode {
            top: $input-field-height;
            padding: 0;
            .mode-group,.mode-swarm{
                position: relative;
                width: 50%;
                float: left;
                height: $input-field-height * 9 + 12;
                .keyword-input {
                    [type="text"] {
                        height: $input-field-height + 2;
                        background-color: $title-bg;
                        @include border-radius(0);
                    }
                }
                .swarm-list {
                    overflow: auto;
                    margin: 0;
                    height: $input-field-height * 8 + 10;
                    line-height: $input-field-height;
                    color: $color-light-content;
                    @include user-select(none);
                    .checkbox {
                        margin: 9px;
                        line-height: normal;
                        vertical-align: top;
                    }
                    li {
                        height: 35px;
                        cursor: pointer;
                        display: flex;
                        flex-direction: row;
                        justify-content: flex-start;

                        span {
                            flex: 1;
                            display: inline-block;
                            line-height: 35px;
                            @include ellipsis();
                        }
                        .icon{
                            float: right;
                        }
                        &.no-data{
                            font-size: 14px;
                            padding: 30px;
                        }
                    }
                }
                .check-load{
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    .inline-loading{
                        margin: $input-field-height * 3 auto;
                    }
                }
            }
            .mode-group{
                width: calc(50% - 1px);
                border-right: 1px solid $border-color;
            }
            .multi-select-panel {
                float: left;
                width: 100%;
                box-sizing: border-box;
            }
        }
    }
</style>
