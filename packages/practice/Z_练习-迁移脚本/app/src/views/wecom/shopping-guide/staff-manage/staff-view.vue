<template>
    <modal :title="contactsName" @close="close" size="lg">
        <!-- 筛选条件 -->
        <div class="filter-bar">
            <!-- 查询 -->
            <div class="pull-right search-box">
                <input
                    type="text"
                    :placeholder="$t('shoppingGuide.customerSearchPlaceholder')"
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
                    <th colspan="4">
                        {{ 'shoppingGuide.wecomContacts' | t }}
                        <FilterDrop :value="isContact" :list="isContactList" @valueChange="isContactChange">
                        </FilterDrop>
                    </th>
                    <th colspan="4">{{ 'shoppingGuide.wecomName' | t }}</th>
                    <th colspan="6">{{ 'shoppingGuide.contactsName' | t }}</th>
                    <th colspan="3">{{ 'shoppingGuide.mobile' | t }}</th>
                    <th colspan="5">{{ 'shoppingGuide.lastVisitTime' | t }}</th>
                    <th colspan="2">{{ 'shoppingGuide.options' | t }}</th>
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
                        <p>{{ contactRender(l.wecom) }}</p>
                    </td>
                    <td colspan="4">
                        <p>{{ l.wecomName }}</p>
                    </td>
                    <td colspan="6">
                        <p>{{ l.name }}</p>
                    </td>
                    <td colspan="3">
                        <p>{{ l.phone || '-' }}</p>
                    </td>
                    <td colspan="5">
                        <p>{{ l.time }}</p>
                    </td>
                    <td colspan="2">
                        <button class="btn">
                            <svg aria-hidden="true" class="action-icon icon-lianxiren" @click="toContact(l.customerId)">
                                <use xlink:href="#icon-lianxiren"></use>
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
            <pager :total="params.totalPage" :now="params.pageNumber" @page="handlePage">
                {{ 'contact.everyPage' | t }}
                <selector :options="pageSizeOptions" :value="params.pageSize" @input="pageSizeChange" class="tiny" />
                {{ 'contact.maxPage' | t }}
            </pager>
        </div>
    </modal>
</template>

<script>
import { translate as t } from '@/locales';
import { WecomApiV1 } from '@/api';
import cloneDeep from 'lodash/cloneDeep';

export default {
    name: 'StaffView',
    data () {
        return {
            id: '',
            contactsName: '',
            loading: false,
            list: [],
            keyword: '',
            keywordCopy: '',
            isContact: '',
            isContactList: [{
                source: '',
                name: t('common.all')
            }, {
                source: 0,
                name: t('shoppingGuide.contactsNo')
            }, {
                source: 1,
                name: t('shoppingGuide.contactsYes')
            }],
            params: {
                pageNumber: 1,//当前页数
                pageSize: 10,//每页展示数量
                totalPage: 1// 分页数
            },
            pageSizeOptions: [
                { id: 50, name: 50 },
                { id: 30, name: 30 },
                { id: 20, name: 20 },
                { id: 10, name: 10 }
            ],
        };
    },
    methods: {
        searchEvent () {
            this.params.pageNumber = 1;
            this.search();
        },

        search () {
            this.loading = true;
            const params = {
                userId: this.id,
                pageNo: this.params.pageNumber,
                pageSize: this.params.pageSize,
                keyWord: this.keyword
            };

            if (this.isContact !== '') {
                params.wecome = this.isContact;
            }

            this.keywordCopy = cloneDeep(this.keyword);
            WecomApiV1.getContactByStaff(params)
                .then(({ body: { data: { employeeContactList, totalPage } } }) => {
                    this.loading = false;
                    this.list = employeeContactList;
                    this.params.totalPage = totalPage;
                })
                .catch(() => {
                    this.loading = false;
                });
        },

        open (id, name) {
            this.id = id;
            this.contactsName = `${name + this.$t('shoppingGuide.customerList')}`;
            this.search();
        },

        close () {
            this.$emit('close');
        },

        //页码变动
        handlePage (e) {
            this.params.pageNumber = e;
            this.search();
        },

        toContact (id) {
            const custom = this.$router.resolve({
                name: 'customerDetail',
                query: { id }
            });
            window.open(custom.href, '_blank');
        },

        contactRender (val) {
            return this.isContactList.find(e => e.source === val).name;
        },

        isContactChange (e) {
            this.isContact = e;
            this.params.pageNumber = 1;
            this.search();
        },

        pageSizeChange (e) {
            this.params.pageNumber = 1;
            this.params.pageSize = e;
            this.search();
        },
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
                .icon-lianxiren {
                    color: $theme;
                }
            }

            td {
                padding: 0 10px;
            }
        }
    }
}
</style>