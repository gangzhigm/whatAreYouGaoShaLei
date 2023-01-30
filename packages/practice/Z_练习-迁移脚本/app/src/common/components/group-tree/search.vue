<template>
    <div class="search">
        <!-- 侧边栏的搜索  组件 -->
        <div class="search-field" v-blur="close">
            <input type="text" v-model.trim="searchGroupName" :placeholder="$t('common.searchGroup')" @keyup.enter="readySearch">
            <span class="icon icon-search" @click="readySearch"></span>
            <div class="query-content" v-if="queryShow && queryList.length  !== 0">
                <span class="query-return" @click="queryBack">{{'common.back'|t}}</span>
                <div class="query-item" v-for="(item,index) in queryList" :key="index">
                    <checkbox v-if="multi" :source="item.id" v-model="multiGroupArr" :max="max">
                        <span class="search-item" :title="item.name">{{ item.name }}</span>
                    </checkbox>
                    <span v-else class="search-item" :title="item.name" @click="sureSearch(item)">{{ item.name }}</span>
                </div>
            </div>
            <div class="query-content" v-if="queryShow && queryList.length  === 0">
                {{'EnterPrise.noData' | t}}
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'search',
        data() {
            return {
                searchGroupName: '',
                queryShow: false,
                queryList: [],//符合搜索条件的menu list
            };
        },
        props: {
            position: Boolean,//Blooen-true:侧边栏，false：弹窗内
            treeData: Array,//[] - 树形结构数据
            lastStage:Boolean,//搜索list 是否显示末级--- true 显示末级，false不显示末级
            queryLevel:{//搜索框中显示的的层级 默认最多显示四级，编辑和新建的时候不显示末级
                type:Number,
                default:4,
            },
            // 多选
            multi: {
                type: Boolean,
                default: false
            },
            // 已选数组
            multiArr: {
                type: Array,
                default: () => []
            },
            // 最多可选几项
            max: {
                type: [Number, String],
                default: Infinity
            },
        },
        computed: {
            multiGroupArr: {
                get() {
                    return this.multiArr;
                },
                set(newval) {
                    this.$emit('multiChange', newval);
                }
            },
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
            close() {
                if (this.multi) return;
                if (this.queryShow) {
                    this.queryBack();
                }
            },
            // 查询 返回
            queryBack() {
                this.queryShow = false;
                this.queryList = [];
                this.searchGroupName = '';
            },
            // 搜索
            readySearch() {
                this.queryList = [];
                this.queryShow = true;
                this.search(this.treeData);
                //新建素材、表单、旅程、分群时 "全部分组"不可选
                for (let i = this.queryList.length - 1; i >= 0; i--) {
                    if (this.queryList[i].noSelect === false && this.queryList[i].default === 2) {
                        this.queryList.splice(i,1);
                    }
                }
                if (this.lastStage === true) return false;
                this.queryList = this.queryList.filter(group => group.default !== 1 && group.level <= this.queryLevel);
            },
            // 选中一项 - 确认选中项
            sureSearch(groupData) {
                this.queryShow = false;
                this.searchGroupName = '';
                this.queryList = [];
                this.$emit('sureSearch', groupData);
                this.fathersOpen(this.treeData, groupData.id);
            },
            // 遍历递归数据 搜索分组
            search(dt) {
                dt.forEach(ev => {
                    if (ev.name.indexOf(this.searchGroupName) !== -1) {
                        this.queryList.push(ev);
                    }
                    if (!ev.childs || ev.childs.length <= 0) return;
                    this.search(ev.childs);
                });
            },
        }
    };
</script>

<style lang="scss">
    @import '../../scss/base/mixin';
    @import '../../scss/base/variables';

    .search {
        .search-field {
            position: relative;
            display: flex;
            align-items: center;
            height: $input-field-height;
            border-top: 1px solid $select-border;
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

            .query-content {
                position: absolute;
                z-index: 2;
                left: 0;
                top: 27px;
                box-sizing: border-box;
                width: 100%;
                height: 272px;
                overflow-y: auto;
                border: 1px solid $border-color;
                border-radius: 4px;
                background-color: white;
                padding: 10px;

                .query-return {
                    color: $green;
                    cursor: pointer;
                    font-size: 14px;
                    display: inline-block;
                    width: 100%;
                    padding-left: 5px;
                }

                .query-item {
                    line-height: 24px;
                    height: 24px;
                    cursor: pointer;
                    padding-left: 5px;

                    &:hover {
                        background-color: $border-color;
                    }

                    .search-item {
                        display: inline-block;
                        width: 230px;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }

                    .checkbox {
                        height: 24px;
                        
                        svg {
                            float: left;
                            margin: 5px;
                        }
                    }
                }

            }
        }
    }
</style>
