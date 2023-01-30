<template>
    <div class="search-org-field" v-blur="close">
        <div class="search-field">
            <input type="text" v-model.trim="orgName" :placeholder="$t('EnterPrise.searchDep')"
                   @keyup.enter="orgList();">
            <span class="icon icon-search" @click.stop="orgList();"></span>
            <div class="query-content" v-show="queryShow && queryOrgList && queryOrgList.length>0">
                <span class="query-return" @click.stop="queryReture()">返回</span>
                <div v-for="item in queryOrgList" class="query-item" @click.stop="itemQueryClick(item)">
                    <span :title="item.title">{{ item.title }}</span>
                </div>
            </div>
            <div class="query-content" v-show="queryShow && queryOrgList &&  queryOrgList.length==0"
                 @click.stop="queryShow=false;orgName=''">
                {{'EnterPrise.noData' | t}}
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'SearchOrgField',
        props: {
            dt: Array,
        },
        data() {
            return {
                //tan
                queryShow: false,
                //查询公司名称
                orgName: '',
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
                this.orgName = '';
                let selectItem = {cur: item, par: {}};
                this.$emit('selectOrganization', selectItem);
            },
            orgList() {
                this.queryOrgList = [];
                if (this.orgName.length > 0) {
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
                    if (obj.title.indexOf(this.orgName) > -1) {
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
                item.checked = true;
                //搜索点击，向外发出
                this.selectItem(item);
                //关闭层
                this.queryShow = false;
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
                this.orgName = '';
            },
            //点击下层树，弹框层打开时，需要关闭
            close() {
                if (this.queryShow === true) {
                    this.queryReture();
                }
            },

        },
        computed: {
            widthStyle() {
                if (this.wm === 'flex') {
                    return 'flex';
                } else if (this.wm === 'lg') {
                    return 'lg';
                }
            }
        },
        components: {},
        watch: {
            orgName() {
                if (this.orgName.length === 0) {
                    this.queryShow = false;
                }
            }
        },
    };
</script>

<style type="text/css" lang="scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';

    .search-org-field {
        .tree-enter, .tree-leave-to {
            opacity: 0;
        }
        .tree-enter-active, .tree-leave-active {
            transition: opacity .5s;
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
            .query-content {
                position: absolute;
                z-index: 2;
                left: 0;
                top: 27px;
                box-sizing: border-box;
                width: 100%;
                height: 200px;
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
            }
        }
        .query-item {
            cursor: pointer;
            font-size: 13px;
            line-height: 25px;
            box-sizing: border-box;
            padding-left: 5px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        .query-item:hover {
            background-color: $border-color;
        }
    }
</style>
