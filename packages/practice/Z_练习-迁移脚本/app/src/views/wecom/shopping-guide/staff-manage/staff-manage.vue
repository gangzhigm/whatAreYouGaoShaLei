<template>
    <div class="content-view staff-manage">
        <!-- 右侧内容 -->
        <div class="page-content right-list">
            <!-- 筛选条件 -->
            <div class="filter-bar">
                <!-- 选择门店 -->
                <div class="button-group pull-left">
                    <selector class="pull-right" :options="storeList" v-model="storeId" search @select="storeChange" />
                </div>

                <div class="pull-right">
                    <button type="button" class="btn btn-md btn-theme" @click="storeManagementOpen">
                        {{ 'shoppingGuide.storeManagement' | t }}
                    </button>
                </div>

                <!-- 查询 -->
                <div class="pull-right search-box">
                    <input
                        type="text"
                        :placeholder="$t('shoppingGuide.staffSearchPlaceholder')"
                        v-model.trim="keyword"
                        @keydown.enter="seachEvent"
                        maxlength="100"
                    />
                    <svg aria-hidden="true" @click="seachEvent">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </div>
            </div>

            <!-- 列表 -->
            <table class="staff-manage-table">
                <thead>
                    <tr>
                        <th v-for="t in theadList" :colspan="t.colspan">{{ t.name }}</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-if="loading" class="no-hover">
                        <td colspan="24" class="slim-cell">
                            <inline-loading />
                        </td>
                    </tr>

                    <tr v-for="l in list" v-else>
                        <td colspan="4">
                            <p>{{ l.employeeNum }}</p>
                        </td>
                        <td colspan="4">
                            <p>{{ l.name }}</p>
                        </td>
                        <td colspan="2">
                            <p>{{ l.position }}</p>
                        </td>
                        <td colspan="3">
                            <p class="store" :title="l.department">{{ l.department }}</p>
                        </td>
                        <td colspan="3">
                            <p class="store" :title="l.store">{{ l.store || $t('shoppingGuide.unassociated') }}</p>
                        </td>
                        <td colspan="2">
                            <p class="customer-number" @click="view(l)">{{ l.contactNum }}</p>
                        </td>
                        <td colspan="4">
                            <p>{{ l.updateAccount }}</p>
                        </td>
                        <td colspan="2">
                            <button class="btn">
                                <svg
                                    aria-hidden="true"
                                    class="action-icon icon-round-pencil"
                                    v-title:top="$t('shoppingGuide.edit')"
                                    @click="edit(l)"
                                >
                                    <use xlink:href="#icon-round-pencil"></use>
                                </svg>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- 无匹配结果 -->
            <list-search-empty v-if="!loading && list.length === 0 && keywordCopy !== ''" />
            <list-empty v-else-if="!loading && list.length === 0 && keywordCopy === ''" />

            <!-- 分页 -->
            <div class="pager-wrapper page-com" v-if="list.length !== 0">
                <div class="amount">
                    {{ 'pagination.totalCount' | t }} <span class="theme-text">{{ totalRow }}</span>
                    {{ 'pagination.totalUnit' | t }}
                </div>
                <pager :total="totalPage" :now="pageNumber" @page="handlePage"></pager>
            </div>

            <staff-view ref="staffView" v-if="staffViewShow" @close="staffViewClose" />
            <staff-edit ref="staffEdit" v-if="staffEditShow" @close="staffEditClose" @confirm="staffEditConfirm" />
            <store-management v-if="storeManagementShow" @close="storeClose" />
        </div>
    </div>
</template>

<script type="text/babel">
import StaffView from './staff-view.vue';
import StaffEdit from './staff-edit.vue';
import StoreManagement from './store-management.vue';

import { translate as t } from '@/locales';
import { WecomApiV1 } from '@/api';
import cloneDeep from 'lodash/cloneDeep';

export default {
    components: {
        StaffView,
        StaffEdit,
        StoreManagement
    },
    data () {
        return {
            storeId: '',
            storeList: [],
            keyword: '',
            keywordCopy: '',
            theadList: [{
                name: t('shoppingGuide.employeeID'),
                colspan: '4'
            }, {
                name: t('shoppingGuide.employeeName'),
                colspan: '4'
            }, {
                name: t('shoppingGuide.position'),
                colspan: '2'
            }, {
                name: t('shoppingGuide.department'),
                colspan: '3'
            }, {
                name: t('shoppingGuide.stores'),
                colspan: '3'
            }, {
                name: t('shoppingGuide.numberOfCustomer'),
                colspan: '2'
            }, {
                name: t('shoppingGuide.lastModifiedBy'),
                colspan: '4'
            }, {
                name: t('shoppingGuide.options'),
                colspan: '2'
            }],
            loading: false,
            list: [],
            totalRow: 0,//总数
            totalPage: 1,// 分页数
            pageSize: 20,//每页展示数量
            pageNumber: 1,//当前页数
            isSubmit: false,
            treeActiveId: '',
            storeManagementShow: false,
            staffViewShow: false,
            staffEditShow: false
        };
    },
    created () {
        this.storeNoPage();
        this.storeChange();
    },
    methods: {
        storeNoPage (callback) {
            WecomApiV1.getStoreList()
                .then(({ body: { data: { storeList } } }) => {
                    this.storeList = [...[{ id: '', name: this.$t('shoppingGuide.allStores') }], ...storeList];
                    callback && callback(true);
                })
                .catch(() => {
                    callback && callback(false);
                });
        },

        storeChange () {
            this.keyword = '';
            this.seachEvent();
        },

        seachEvent () {
            this.pageNumber = 1;
            this.search();
        },

        search () {
            this.loading = true;
            const params = {
                storeId: this.storeId,
                pageNo: this.pageNumber,
                pageSize: this.pageSize,
                keyWord: this.keyword
            };
            this.keywordCopy = cloneDeep(this.keyword);
            WecomApiV1.getWorkEmployeeList(params)
                .then(({ body: { data: { workEmployeeList, totalPage, totalRow } } }) => {
                    this.loading = false;
                    this.list = workEmployeeList;
                    this.totalPage = totalPage;
                    this.totalRow = totalRow;
                })
                .catch(() => {
                    this.loading = false;
                });
        },

        view ({ userId, name }) {
            this.staffViewShow = true;
            this.$nextTick(() => {
                this.$refs.staffView.open(userId, name);
            });
        },

        edit (e) {
            this.staffEditShow = true;
            this.$nextTick(() => {
                this.$refs.staffEdit.open(e);
            });
        },

        storeManagementOpen () {
            this.storeManagementShow = true;
        },

        storeClose (isChange) {
            if (isChange) {
                this.storeNoPage((state) => {
                    if (state && this.storeId && !this.storeList.find(e => e.id === this.storeId)) {
                        this.storeId = ''; 
                    }
                    this.storeChange();
                });
            }
            this.storeManagementShow = false;
        },

        staffViewClose () {
            this.staffViewShow = false;
        },

        staffEditClose () {
            this.staffEditShow = false;
        },

        staffEditConfirm () {
            this.search();
            this.staffEditShow = false;
        },

        //页码变动
        handlePage (e) {
            this.pageNumber = e;
            this.search();
        }
    }
};
</script>

<style lang="scss">
@import '../../../../common/scss/base/variables';
@import '../../../../common/scss/base/mixin';

$maxHeight: calc(100vh - #{$header-height + $toolbar-height + 24px * 2 + $tab-nav-height});

.staff-manage {
    padding: 20px 0;
    .left-list {
        position: relative;
        height: $maxHeight;
        @include box-sizing();
        background-color: white;
        width: 260px;
        float: left;
    }

    .right-list {
        padding: 16px;
        float: left;
        @include box-sizing();
        background-color: white;
        height: $maxHeight;
        overflow-y: scroll;
    }

    .page-content {
        @include clearfix();
        flex: 1;

        .filter-bar {
            display: inline-block;
            width: 100%;
            .search-box {
                margin-right: 20px;
            }
        }

        .staff-manage-table {
            table-layout: fixed;
            width: 100%;
            margin-top: 16px;
            text-align: left;
            border-collapse: collapse;
            border-spacing: 0;
            thead {
                tr {
                    height: 40px;
                    border-bottom: 1px solid $border-color;

                    &:first-child {
                        background-color: $select-bg;
                    }

                    td:first-child {
                        text-align: center;
                    }

                    &:not(:first-child):hover {
                        background-color: $title-bg;
                    }

                    th {
                        padding: 0 10px;
                    }
                }
            }

            tbody {
                tr {
                    height: 40px;
                    border-bottom: 1px solid $border-color;
                    .btn {
                        padding: 0;
                        margin: 0;
                        .action-icon {
                            width: 16px;
                            height: 16px;
                            margin: 6px 0;
                        }
                        .icon-change {
                            color: $theme;
                        }
                    }

                    td {
                        padding: 0 10px;
                        .store {
                            text-overflow: -o-ellipsis-lastline;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                    }
                    .customer-number {
                        color: $theme;
                        cursor: pointer;
                    }
                }
            }
        }
    }
}
</style>
