<template>
    <div class="base-search" v-blur="close">
        <div class="search-box md content-top">
            <input type="text" v-model.trim="keyWord" :placeholder="$t('sendChannel.enterGroupName')"
                   @keyup.enter="searchContent()">
            <svg aria-hidden="true" @click="searchContent">
                <use xlink:href="#icon-search"></use>
            </svg>
        </div>
        <div class="search-content" v-show="queryShow && queryOrgList.length>0">
            <!--<span class="query-return" @click.stop="queryReture()">返回</span>-->
            <div class="search-item" v-for="item in queryOrgList" @click.stop="itemQueryClick(item)"
                 :title="item.departmentName">
                {{item.departmentName}}
            </div>
        </div>
        <div class="search-content" v-show="queryShow && queryOrgList.length==0"
             @click.stop="queryShow=false;keyWord=''">
            {{'sendChannel.noData' | t}}
        </div>
    </div>
</template>

<script>

    export default {
        name: 'Search',
        props: {
            //tree data
            activeId: 0,
            dt: Array,
            inlineLoading: Boolean
        },
        data() {
            return {
                //tan
                queryShow: false,
                //查询公司名称
                keyWord: '',
                //查询的集合
                queryOrgList: [],
                //点击一项
                orgObj: {},
                //点击一项
                orgObjArray: [],
            };
        },
        methods: {
            //点击一项
            selectItem(item) {
                this.orgObj = item;
                let itemParents = this.findPathByLeafId(item.id, this.dt);
                let newObj = {cur: {}, par: {}};
                for (let i = 0; i < itemParents.length; i++) {
                    if (itemParents[i].id === item.parentId) {
                        newObj = {cur: item, par: itemParents[i]};
                        this.$emit('selectOrganization', newObj);
                        break;
                    }
                }
                //父级找不到Users
                newObj = {cur: item, par: item};
                this.$emit('selectOrganization', newObj);

            },
            // 查询方法
            searchContent() {
                this.queryOrgList = [];
                if (this.keyWord.length > 0) {
                    this.queryShow = true;
                    this.search(this.dt);
                } else {
                    this.queryShow = false;
                }
            },
            //搜索
            search(dt) {
                for (let i = 0; i < dt.length; i++) {
                    let obj = dt[i];
                    if (obj.departmentName.indexOf(this.keyWord) > -1) {
                        this.queryOrgList.push(obj);
                    }
                    if (obj.children) {
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
            //点击选择一项
            itemQueryClick(item) {
                //全部折叠/取消选中
                this.initDt(this.dt);
                this.orgObj = item;
                //查找相关父级
                this.orgObjArray = this.findPathByLeafId(item.id, this.dt);
                this.keyWord = '';
                this.orgObjArray.forEach(function (item) {
                    item.spread = true;
                });
                item.checked = true;
                //搜索点击，向外发出
                this.selectItem(item);
                //关闭层
                this.queryShow = false;
                this.$emit('handleClickInfo', item);
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
            //点击返回
            queryReture() {
                this.queryShow = false;
                this.keyWord = '';
            },
            //点击下层树，弹框层打开时，需要关闭
            close() {
                if (this.queryShow === true) {
                    this.queryReture();
                }
            },

        },
        watch: {
            keyWord() {
                if (this.keyWord.length === 0) {
                    this.queryShow = false;
                }
            }
        },
    };
</script>

<style type="text/css" lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .base-search {
        height: calc(100% - 60px);
        .content-top {
            position: absolute;
            right: 0;
            margin-bottom: 16px;
        }
        .search-content {
            position: absolute;
            right: 0;
            top: 31px;
            width: 200px;
            border: 1px solid $border-color;
            border-radius: 4px;
            text-align: left;
            background-color: white;
            min-height: 30px;
            line-height: 30px;
            .search-item {
                width: 200px;
                cursor: pointer;
                line-height: 25px;
                box-sizing: border-box;
                overflow: hidden;
                padding-left: 5px;
                @include ellipsis();
                &:hover {
                    background-color: $border-color;
                }
            }
        }
    }
</style>
