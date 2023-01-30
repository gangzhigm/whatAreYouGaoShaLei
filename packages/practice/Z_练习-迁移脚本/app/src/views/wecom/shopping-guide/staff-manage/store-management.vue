<template>
    <modal :title="$t('shoppingGuide.storeManagement')" @close="close" size="lg">
        <!-- 筛选条件 -->
        <div class="filter-bar">
            <!-- 查询 -->
            <div class="pull-right search-box">
                <input
                    type="text"
                    :placeholder="$t('shoppingGuide.storeSearchPlaceholder')"
                    v-model.trim="keyword"
                    @keydown.enter="searchEvent"
                    maxlength="100"
                />
                <svg aria-hidden="true" @click="searchEvent">
                    <use xlink:href="#icon-search"></use>
                </svg>
            </div>
        </div>

        <!-- 列表 -->
        <table class="customer-view-table">
            <thead>
                <tr>
                    <th colspan="4">{{ 'shoppingGuide.storeName' | t }}</th>
                    <th colspan="4">{{ 'shoppingGuide.storeID' | t }}</th>
                    <th colspan="12">{{ 'shoppingGuide.affiliatedEmployees' | t }}</th>
                    <th colspan="4">{{ 'shoppingGuide.options' | t }}</th>
                </tr>
            </thead>

            <tbody>
                <tr v-if="loading" class="no-hover">
                    <td colspan="24" class="slim-cell">
                        <inline-loading />
                    </td>
                </tr>

                <!-- 无匹配结果 -->
                <tr v-if="!loading && list.length === 0 && keywordCopy !== '' && !storeEdit">
                    <td colspan="24" class="slim-cell">
                        <list-search-empty />
                    </td>
                </tr>
                <!-- 没有数据 -->
                <tr v-if="!loading && list.length === 0 && keywordCopy === '' && !storeEdit">
                    <td colspan="24" class="slim-cell">
                        <list-empty />
                    </td>
                </tr>

                <tr v-for="l in list" v-if="!loading">
                    <td colspan="4" v-if="editState(false, l)">
                        <p class="workEmployee">{{ l.name }}</p>
                    </td>
                    <td colspan="4" v-if="editState(false, l)">
                        <p class="workEmployee">{{ l.numberId }}</p>
                    </td>
                    <td colspan="12" v-if="editState(false, l)">
                        <div class="workEmployee">
                            <span class="title" v-for="id in idsRender(l.workEmployeeIds)" v-if="getOptionName(id)">
                                {{ getOptionName(id) }}
                            </span>
                        </div>
                    </td>
                    <td colspan="4" v-if="editState(false, l)">
                        <button class="btn" @click="editStore(l)" :disabled="addStoreState">
                            <svg
                                aria-hidden="true"
                                class="action-icon icon-round-pencil"
                                v-title:top="$t('shoppingGuide.edit')"
                            >
                                <use xlink:href="#icon-round-pencil"></use>
                            </svg>
                        </button>
                        <button class="btn" @click="delStore(l.id)" :disabled="addStoreState">
                            <svg aria-hidden="true" class="action-icon icon-delete" v-title:top="$t('common.del')">
                                <use xlink:href="#icon-delete"></use>
                            </svg>
                        </button>
                    </td>

                    <!-- 编辑列表 -->
                    <td colspan="4" v-if="editState(true, l)">
                        <input class="input" type="text" maxlength="255" v-model.trim="editInfo.name" />
                    </td>
                    <td colspan="4" v-if="editState(true, l)">
                        <input class="input" type="text" maxlength="255" v-model.trim="editInfo.numberId" />
                    </td>
                    <td colspan="12" v-if="editState(true, l)">
                        <multi-select
                            class="xl hg multi-select"
                            :options="selectList"
                            v-model="editInfo.workEmployeeIds"
                            :placeholder="$t('common.selectHolder')"
                            :shortcutAction="true"
                            :search="'async'"
                            :autoWidth="false"
                            :dropDirection="'bottom'"
                            :uniqueKey="'id'"
                            :max="100"
                            :optName="optName"
                        />
                    </td>
                    <td colspan="4" v-if="editState(true, l)">
                        <button class="btn" @click="completeEdit(1)" :disabled="isSubmit">
                            <svg
                                aria-hidden="true"
                                class="action-icon icon-wancheng done"
                                v-title:top="$t('common.complete')"
                            >
                                <use xlink:href="#icon-wancheng"></use>
                            </svg>
                        </button>
                        <button class="btn" @click="cancelEdit" :disabled="isSubmit">
                            <svg
                                aria-hidden="true"
                                class="action-icon icon-quxiao cancel"
                                v-title:top="$t('common.cancel')"
                            >
                                <use xlink:href="#icon-quxiao"></use>
                            </svg>
                        </button>
                    </td>
                    <!-- 编辑列表end -->
                </tr>

                <!-- 新增门店 -->
                <tr v-if="storeEdit">
                    <td colspan="4">
                        <input class="input" type="text" maxlength="255" v-model.trim="editInfo.name" />
                    </td>
                    <td colspan="4">
                        <input class="input" type="text" maxlength="255" v-model.trim="editInfo.numberId" />
                    </td>
                    <td colspan="12">
                        <multi-select
                            class="xl hg multi-select"
                            :options="selectList"
                            v-model="editInfo.workEmployeeIds"
                            :placeholder="$t('common.selectHolder')"
                            :shortcutAction="true"
                            :search="'async'"
                            :autoWidth="false"
                            :dropDirection="'bottom'"
                            :uniqueKey="'id'"
                            :max="100"
                            :optName="optName"
                        />
                    </td>
                    <td colspan="4">
                        <button class="btn" @click="completeEdit(0)" :disabled="isSubmit">
                            <svg
                                aria-hidden="true"
                                class="action-icon icon-wancheng done"
                                v-title:top="$t('common.complete')"
                            >
                                <use xlink:href="#icon-wancheng"></use>
                            </svg>
                        </button>
                        <button class="btn" @click="cancelStore" :disabled="isSubmit">
                            <svg
                                aria-hidden="true"
                                class="action-icon icon-quxiao cancel"
                                v-title:top="$t('common.cancel')"
                            >
                                <use xlink:href="#icon-quxiao"></use>
                            </svg>
                        </button>
                    </td>
                </tr>
                <!-- 添加门店 -->
                <tr>
                    <td colspan="24">
                        <p :class="[addStoreState ? 'add-store add-disabled' : 'add-store']">
                            <span @click="addStore">{{ 'shoppingGuide.addStore' | t }}</span>
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- 分页 -->
        <div class="pager-wrapper page-com" v-if="list.length !== 0">
            <div class="amount">
                {{ 'pagination.totalCount' | t }} <span class="theme-text">{{ totalRow }}</span>
                {{ 'pagination.totalUnit' | t }}
            </div>
            <pager :total="totalPage" :now="pageNumber" @page="handlePage"></pager>
        </div>
    </modal>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';
import { WecomApiV1 } from '@/api';

export default {
    name: 'StoreManagement',
    data () {
        return {
            loading: false,
            list: [],
            keyword: '',
            keywordCopy: '',
            totalRow: 0,//总数
            totalPage: 1,// 分页数
            pageSize: 10,//每页展示数量
            pageNumber: 1,//当前页数
            storeEdit: false,//新增部门时的编辑状态
            editInfo: {
                id: '',
                name: '',
                numberId: '',
                workEmployeeIds: []
            },
            selectList: [],
            currentEdit: false,//修改部门时的编辑状态
            isSubmit: false,
            optName: 'value',
            isChange: false // 门店数据是否变动
        };
    },
    computed: {
        addStoreState () {
            return this.storeEdit || this.currentEdit;
        }
    },
    created () {
        this.search();
        this.getStaffList();
    },
    methods: {
        searchEvent () {
            this.pageNumber = 1;
            this.search();
        },

        search () {
            this.cancelEdit();
            this.cancelStore();
            this.loading = true;
            this.keywordCopy = cloneDeep(this.keyword);
            WecomApiV1.getStore(this.keyword, this.pageNumber, this.pageSize)
                .then(({ body: { data } }) => {
                    this.loading = false;
                    this.list = data.storeList;
                    this.totalRow = data.totalRow;
                    this.totalPage = data.totalPage;
                })
                .catch(() => {
                    this.loading = false;
                });
        },

        close () {
            this.$emit('close', this.isChange);
        },

        //页码变动
        handlePage (e) {
            this.pageNumber = e;
            this.search();
        },

        editInfoReset () {
            this.editInfo = {
                id: '',
                name: '',
                numberId: '',
                workEmployeeIds: []
            };
        },

        //新增门店
        addStore () {
            if (this.addStoreState) return;
            this.editInfoReset();
            this.storeEdit = true;
        },

        //取消新增
        cancelStore () {
            this.storeEdit = false;
        },

        //编辑门店
        editStore (e) {
            const { id, name, numberId, workEmployeeIds } = cloneDeep(e);

            this.editInfo = {
                id,
                name,
                numberId,
                workEmployeeIds: this.idsRender(workEmployeeIds)
            };
            this.currentEdit = true;
        },

        //取消编辑
        cancelEdit () {
            this.editInfoReset();
            this.currentEdit = false;
        },

        editState (isEdit, { id }) {
            const flag = (this.currentEdit && isEdit && id === this.editInfo.id)
                || !isEdit && id !== this.editInfo.id || false;
            return flag;
        },

        getOptionName (id) {
            const result = this.selectList.find(e => e.id === id);
            return result ? result[this.optName] : '';
        },

        delStore (id) {
            if (this.isSubmit) return;

            this.$confirm(this.$t('common.delete'), this.$t('shoppingGuide.deleteTips'))
                .then(sure => {
                    if (sure) {
                        this.isSubmit = true;
                        WecomApiV1.delStore(id)
                            .then(({ body: { message } }) => {
                                this.isSubmit = false;
                                this.isChange = true;
                                this.$toast(message, 'success');
                                if (this.list.length === 1 && this.pageNumber !== 1) {
                                    this.pageNumber -= 1;
                                }
                                this.keyword = '';
                                this.search();
                            })
                            .catch(() => {
                                this.isSubmit = false;
                            });
                    }
                });
        },

        /**
         * type
         *  1表示搜索企业微信所属员工名称、
            2表示搜索企业微信所属员工手机号
            3表示搜索企业微信所属员工邮箱
         */
        getStaffList () {
            WecomApiV1.getStaffListNoPage(1)
                .then(({ body: { data } }) => {
                    this.selectList = data.staffList;
                });
        },

        /**
         * 保存编辑内容.
         * type 0：新增 ，1 修改
         */
        completeEdit (type) {
            if (this.isSubmit) return;

            this.editInfo.workEmployeeIds = this.editInfo.workEmployeeIds.filter(id => {
                return this.selectList.find(e => e.id === id);
            });

            if (!this.editInfo.name) return this.$toast(this.$t('shoppingGuide.storeNotBeEmpty'), 'warn');
            this.isSubmit = true;

            if (type === 1) {
                WecomApiV1.editStore(this.editInfo)
                    .then(({ body: { message } }) => {
                        this.isSubmit = false;
                        this.isChange = true;
                        this.$toast(message, 'success');
                        this.pageNumber = 1;
                        this.keyword = '';
                        this.cancelEdit();
                        this.search();
                    })
                    .catch(() => {
                        this.isSubmit = false;
                    });
            } else {
                WecomApiV1.createStore(this.editInfo)
                    .then(({ body: { message } }) => {
                        this.isChange = true;
                        this.isSubmit = false;
                        this.$toast(message, 'success');
                        this.pageNumber = 1;
                        this.keyword = '';
                        this.cancelStore();
                        this.search();
                    })
                    .catch(() => {
                        this.isSubmit = false;
                    });
            }
        },

        idsRender (ids) {
            if (!ids) return [];
            return ids.split(',').map(e => {
                return Number(e);
            });
        }
    }
};
</script>

<style lang="scss">
@import '../../../../common/scss/base/variables';
@import '../../../../common/scss/base/mixin';

.filter-bar {
    display: inline-block;
    width: 100%;
}

.customer-view-table {
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
                .done {
                    color: $theme;
                }

                .cancel {
                    color: #d81e06;
                }
            }

            td {
                padding: 0 10px;

                .workEmployee {
                    max-height: 48px;
                    overflow-y: auto;
                    .title {
                        @include box-sizing();
                        border: 1px solid $purple;
                        margin: 2px 4px 2px 0;
                        padding: 0 5px;
                        border-radius: 4px;
                        background-color: #f2f0ff;
                        color: $purple;
                        max-width: 100%;
                        word-break: break-word;
                        display: inline-block;
                        line-height: 18px;
                        vertical-align: middle;

                        &:first-of-type {
                            max-width: calc(100% - #{$input-field-height});
                        }
                    }
                }

                .add-store {
                    color: $theme;
                    text-align: center;
                    span {
                        cursor: pointer;
                    }
                }
                .add-disabled {
                    color: #bbb;
                }

                .input {
                    width: 120px;
                }

                .multi-select {
                    text-align: left;
                    width: 314px;
                }
            }
        }
    }
}
</style>