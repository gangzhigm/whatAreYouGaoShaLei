<template>
    <div class="search-base-tree" :class="widthStyle" v-blur="hideList">
        <!--下拉-->
        <div class="ipt-wrapper">
            <label class="ipt" @click="handleContentShow" v-text="title"></label>
            <span class="select-icon icon icon-arrow-down"></span>
        </div>
        <!--搜索-->
        <div class="content-wrapper" v-show="contentShow">
            <div class="selector-search">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-search"></use>
                </svg>
                <input type="text" class="search-ipt" :placeholder="$t('common.selectKeywordHolder')"
                       v-model.trim="searchIpt" @input="orgList();">
            </div>
            <div class="base-tree-div">
                <base-tree :parentSelect="parentOrgSelect" ref="basetree" :list="origin"
                           @selectItem="handleSelectItem"></base-tree>
            </div>
        </div>
        <div class="serachRs" v-show="contentShow && queryShow && tempAry && tempAry.length>0">
            <div v-for="item in tempAry">
                <div class="rs-item" @click="handleSearchSelectItem(item)">
                    <span :title="item.title">{{ item.title }}</span>
                </div>
            </div>
        </div>
        <div class="serachRs" v-show="contentShow && queryShow && tempAry && tempAry.length==0"
             @click.stop="queryShow=false;searchIpt=''">
            {{'EnterPrise.noData' | t}}
        </div>
    </div>
</template>

<script>
    import BaseTree from './base-tree.vue';

    export default {
        name: 'SearchBaseTree',
        props: {
            activeId: 0,
            list: Array,
            wm: String,
            superDepartmentId: Number,
            //首层节点可选
            parentOrgSelect: {
                type: Boolean,
                'default': true
            },
        },
        model: {
            prop: 'superDepartmentId',
            event: 'selectOrgId',
        },
        data() {
            return {
                contentShow: false,
                searchIpt: '',
                tempAry: [],
                //origin: this.list,
                //搜索弹层
                queryShow: false
            };
        },
        computed: {
            origin:{
                get() {
                    return this.list;
                }
            },
            title: {
                get() {
                    return Object.keys(this.orgItem).length > 0 ? this.orgItem.title : this.$t('common.selectHolder');
                }
            },
            orgItem: {
                get() {
                    let obj = {};
                    let that = this;
                    let rs = this.findPathByLeafId(that.superDepartmentId, that.origin);
                    if (rs) {
                        rs.forEach(function (item) {
                            item.spread = true;
                        });
                        rs.forEach(function (item) {
                            if (item.id === that.superDepartmentId) {
                                item.checked = true;
                                obj = item;
                            }
                        });
                    }

                    return obj;
                },
                set(val) {
                    this.$emit('selectOrgId', val.id);
                }
            },
            widthStyle() {
                if (this.wm === 'flex') {
                    return 'flex';
                } else if (this.wm === 'lg') {
                    return 'lg';
                }
            }
        },
        methods: {
            // 隐藏下拉列表
            hideList() {
                if (!this.contentShow) return;
                this.contentShow = false;
                this.queryShow = false;
                this.searchIpt = '';
            },
            //递归实现
            //@leafId  为你要查找的id，
            //@nodes   为原始Json数据
            //@path    供递归使用，不要赋值
            findPathByLeafId: function (leafId, nodes, path) {
                if (path === undefined) {
                    path = [];
                }
                for (let i = 0; i < nodes.length; i++) {
                    let tmpPath = path.concat();
                    tmpPath.push(nodes[i]);
                    if (leafId === nodes[i].id) {
                        return tmpPath;
                    }
                    if (nodes[i].children) {
                        let findResult = this.findPathByLeafId(leafId, nodes[i].children, tmpPath);
                        if (findResult) {
                            return findResult;
                        }
                    }
                }
            },
            //选中一项
            handleSelectItem: function (item) {
                //隐藏
                this.contentShow = false;
                //清空搜索
                this.searchIpt = '';
                this.orgItem = item;
            },
            //搜索选择一项
            handleSearchSelectItem: function (item) {
                //清空搜索
                this.searchIpt = '';
                //关闭层
                this.queryShow = false;
                //初始化
                this.initDt(this.origin);
                //根据元素找出该元素所有父元素+本身
                let rs = this.findPathByLeafId(item.id, this.origin);
                rs.forEach(function (item) {
                    item.spread = true;
                });

                item.checked = true;
                this.orgItem = item;
            },
            handleContentShow: function () {
                this.contentShow = !this.contentShow;

            },
            //搜索
            search: function (dt) {
                for (let i = 0; i < dt.length; i++) {
                    let obj = dt[i];
                    if (obj.title.indexOf(this.searchIpt) > -1) {
                        this.tempAry.push(obj);
                    }
                    if (obj.children && obj.children.length > 0) {
                        this.search(obj.children);
                    }
                }
            },
            //初始化数据
            initDt: function (dt) {
                for (let i = 0; i < dt.length; i++) {
                    let item = dt[i];
                    item.spread = false;
                    item.checked = false;
                    if (item.children) {
                        this.initDt(item.children);
                    }
                }
            },
            //搜索
            orgList() {
                this.tempAry = [];
                if (this.searchIpt.length > 0) {
                    this.queryShow = true;
                    this.search(this.origin);
                } else {
                    this.queryShow = false;
                }

            },
        },
        watch: {},
        components: {
            BaseTree
        }
    };
</script>

<style type="text/css" lang="scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';

    .search-base-tree {
        position: relative;
        display: inline-block;
        width: 100%;
        &.flex {
            flex: 1;
        }
        &.xl {
            width: 277px;
        }

        &.lg {
            width: 208px;
        }

        &.md {
            width: 100px;
        }

        &.tiny {
            width: 60px;
        }
        .ipt-wrapper {
            position: relative;
            height: 32px;
            line-height: 30px;
            border: 1px solid $form-border;
            border-radius: 4px;
            width: 100%;
            display: flex;
            box-sizing: border-box;
            .select-icon {
                height: 30px;
                width: 30px;
                position: absolute;
                top: 0;
                right: 0;
                text-align: center;
                text-indent: 0;
                color: $color-light-content;
            }
            .ipt {
                position: absolute;
                top: 0;
                left: 0;
                right: 30px;
                text-indent: .8em;
                border: none;
                box-sizing: border-box;
                outline: none;
                cursor: pointer;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
        .down-arrow {
            margin: 0 5px;
            cursor: pointer;
        }
        .content-wrapper {
            background: white;
            position: absolute;
            left: 0;
            top: 32px;
            box-sizing: border-box;
            border: 1px solid $form-border;
            border-top: none;
            z-index: 98;
            width: 100%;
            .selector-search {
                width: 100%;
                height: 32px;
                background-color: $title-bg;
                display: flex;
                margin: 0 auto;
                svg {
                    width: 16px;
                    height: 16px;
                    margin: ($input-field-height - 16px)/2;
                    fill: $color-light-content;
                }
                .search-ipt {
                    flex: 1;
                    height: $input-field-height;
                    background-color: transparent;
                    margin: 0 auto;
                    border: none;
                    outline: none;
                    padding: 0 5px;
                    box-sizing: border-box;
                    font-size: 13px;

                }
            }
            .base-tree-div {
                width: 100%;
                max-height: 200px;
                overflow: auto;
            }
        }
        .serachRs {
            position: absolute;
            z-index: 99;
            left: 0;
            top: 65px;
            width: 100%;
            height: 225px;
            overflow-y: auto;
            box-sizing: border-box;
            border: 1px solid $border-color;
            border-radius: 4px;
            box-sizing: border-box;
            background-color: #fff;
        }
        .rs-item {
            font-size: 13px;
            box-sizing: border-box;
            padding: 0 5px;
            cursor: pointer;
            line-height: 25px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        .rs-item:hover {
            background-color: $divide-border;
        }
        .tree-div {
            overflow: auto;
            max-height: 198px;
        }

    }
</style>
