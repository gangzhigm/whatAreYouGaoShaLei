<template>
    <div class="swarm-users" v-if="!isEmpty">
        <!--正文-->
        <div class="swarm-list">
            <div class="data_child">
                {{'common.total' | t}}
                <span class="theme-text">{{totalRow}}</span>
                {{'swarm.contactCount' | t}}
                ({{'contact.email' | t}}{{'punctuation.colon' | t}} {{swarmData.emailCount}}
                /
                {{'contact.phoneNo' | t}}{{'punctuation.colon' | t}} {{swarmData.mobileCount}}
                /
                {{'contact.wechat' | t}}{{'punctuation.colon' | t}} {{swarmData.wechatCount}})
                <div class="pull-right search-box md">
                    <input type="text"
                            v-model.trim="params.searchName"
                            @keyup.enter="search">
                    <svg aria-hidden="true" @click="search">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </div>
                <selector class="pull-right"
                            :options="searchableAttrs"
                            v-model="params.customerFieldId"/>
                <customer-table-attribute-selector class="pull-right" @change="selectedAttrsChanged"/>
                <button @click="getUserGroupTables" type="button" class="btn customer-refresh pull-right" :disabled="$has('customer_swarm_refresh_list')">
                    <i class="icon icon-refresh"
                       v-title:left="$t('swarm.refresh')" ></i>
                </button>
            </div>
            <div class="action-box">
                <div class="hidden-menu-trigger pull-left batch-action">
                    <span class="light-content-text">{{'tag.batchOperation' | t}}</span>
                    <svg aria-hidden="true" class="icon-arrow-down">
                        <use xlink:href="#icon-arrow-down"></use>
                    </svg>
                    <ul class="hidden-menu">
                        <li>
                            <button :disabled="$has('customer_swarm_batch_delete')"
                                    class="btn menu" @click="batchDelete">
                                {{'tag.tatchDelete' | t}}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <!--表格数据-->
            <div class="simplify-table scroll auto-width">
                <table>
                    <thead>
                    <tr>
                        <td>
                            <checkbox :source="false"
                                v-model="allChecked"
                                :title="allChecked ? $t('common.cancelAll') : $t('common.allSelected')"/>
                        </td>
                        <td v-for="attr in selectedAttrs"
                            :key="attr.id"
                            :class="{'sorted-column': attr.fieldName === params.sortField}">
                            <span>{{ attr.name }}</span>
                            <button type="button"
                                    class="table-sort-button"
                                    v-if="attr.ifSort"
                                    @click="sortByAttr(attr)">
                                <svg aria-hidden="true"
                                        class="asc"
                                        :class="{active: attr.fieldName === params.sortField && params.sort === 'asc'}">
                                    <use xlink:href="#icon-caret-down"></use>
                                </svg>
                                <svg aria-hidden="true"
                                        class="desc"
                                        :class="{active: attr.fieldName === params.sortField && params.sort === 'desc'}">
                                    <use xlink:href="#icon-caret-down"></use>
                                </svg>
                            </button>
                        </td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in contactInfoList" :key="item.id">
                        <td><checkbox :source="item.id" v-model="checkedItem"/></td>
                        <td v-for="attr in item.fieldValueList"  @click="goToDetail(item)">

                            {{ !!attr ? attr : ' / ' }}
                        </td>
                    </tr>
                    </tbody>
                </table>
                <list-search-empty v-if="contactInfoList.length === 0 && params.searchName !== ''"/>
                <list-empty v-else-if="contactInfoList.length === 0"/>
            </div>
            <pager :total="totalPage" :now="params.pageNumber" @page="SelectPage">
                {{'contact.everyPage' | t}}
                <selector :options="pageSizeOptions"
                            :value="params.pageSize"
                            @input="tapPagesHander"
                            class="tiny"/>
                {{'contact.maxPage' | t}}
            </pager>
        </div>
        <!--下载数据-->
        <confirm :title="$t('swarm.confirmDeliveryEmail')" v-if="confirm" @cancel="cancel" @confirm="sure">
            <div class="form-field">
                <span class="label">{{'contact.contactNumber' | t}}</span>
                <span class="theme-text tdu">{{totalRow}}</span>
            </div>
            <div class="form-field flex">
                <label class="label">{{'contact.selectAttributeL' | t}}</label>
                <div class="field-group">
                    <multi-select :options="allUserAttrs"
                                class="full-width"
                                dropDirection="bottom"
                                :autoWidth="false"
                                v-model="exportAttrIds"
                                :placeholder="$t('contact.selectAttr')"/>
                    <p>
                        <checkbox v-model="exportAllAttrs">{{'contact.allAttr' | t}}</checkbox>
                        <checkbox v-model="exportSelectedAttrs">{{'contact.displayAttr' | t}}</checkbox>
                    </p>
                </div>
            </div>
            <div class="form-field">
                <label class="label" for="email">{{'swarm.deliveryEmail' | t}}</label>
                <input id="email" v-model.trim="email_text" class="input" type="text">
            </div>
        </confirm>
    </div>
    <list-empty v-else/>
</template>
<script type="text/babel">
    import { ContactApiV1, EtlApiV1, ContactExportApiV1 } from '@/api';
    import {logError, trackEvent} from '../../monitor';
    import CustomerTableAttributeSelector from '../customer-table-attribute-selector.vue';
    import difference from 'lodash/difference';
    import {EMAIL_ADDRESS_REGEXP} from '../../common/utils/regs';


    export default {
        components: {
            CustomerTableAttributeSelector,
        },
        props: {
            id: {
                type: Number,
                required: true,
            },
        },
        data() {
            return {
                all: false,
                pageNumber: 1,
                totalRow: 0,
                emailCount: '',
                mobileCount: '',
                wechatCount: '',
                searchName: '',
                email_text: '',
                confirm: false,
                allUserAttrs: [],  //所有的联系人属性
                selectedAttrs: [], // 用户已选展示列, 固定6条
                contactInfoList: [], // 表格的数据
                params: {
                    customerFieldId: -1, // 搜索下拉列表选择字段,选中的值
                    pageNumber: 1,
                    pageSize: 10,
                    searchName: '',
                    sort: 'asc',
                    sortField: '',
                },
                swarmData: {},
                totalPage: 0, // 总页数
                pageSizeOptions: [
                    {id: 50, name: 50},
                    {id: 30, name: 30},
                    {id: 20, name: 20},
                    {id: 10, name: 10}
                ],
                exportAttrIds: [], // 下载csv导出的属性
                isEmpty: false,
                checkedItem: [],
            };
        },
        mounted() {
            if (!this.id) {
                logError(`[联系人分群] <swarmUser /> mounted 进入联系人分群列表页没有当前分群的id :164`);
            }
            this.email_text = this.$store.state.user.email;
        },
        watch: {
            id(newVal,oldval) {
                if (oldval !== newVal && newVal !== -1 && newVal !== -2) {
                    this.checkedItem = [];
                    this.getUserGroupTables();
                    this.isEmpty = false;
                } else if (newVal === -1) {
                    this.isEmpty = false;
                    this.swarmData = {
                        emailCount: 0,
                        mobileCount: 0,
                        wechatCount: 0
                    };
                    this.params = {
                        customerFieldId: -1,
                        pageNumber: 1,
                        pageSize: 10,
                        searchName: '',
                        sort: 'asc',
                        sortField: '',
                    },
                    this.totalPage = 0;
                    this.totalRow = 0;
                    this.contactInfoList = [];
                } else if (newVal === -2) {
                    this.isEmpty = true;
                }
            }
        },
        computed: {
            // 控制checkbox全选按钮状态
            allChecked: {
                get() {
                    return this.checkedItem.length === this.contactInfoList.length && this.contactInfoList.length !== 0; //返回布尔值判断状态是否为选中状态
                },
                set(newval) {
                    if (newval) {
                        this.checkedItem = this.contactInfoList.map(item => item.id);
                    } else {
                        this.checkedItem = [];
                    }
                }
            },
            searchableAttrs() {
                // type 1 是可以进行模糊查询的
                return this.selectedAttrs
                    .filter(sel => sel.type === 1)
                    .map(attr => ({id: attr.id, name: attr.name}));
            },
            // 导出所有属性
            exportAllAttrs: {
                get() {
                    return this.exportAttrIds.length === this.allUserAttrs.length;
                },
                set(state) {
                    if (state) {
                        this.exportAttrIds = this.allUserAttrs.map(attrs => attrs.id);
                    } else {
                        this.exportAttrIds = [];
                    }
                }
            },
            // 导出表格中已选的属性
            exportSelectedAttrs: {
                get() {
                    const selectedAttrsId = this.selectedAttrs.map(attrs => attrs.id);  // 所有的已选属性 [1,2,3]
                    const exportAttrIds = this.exportAttrIds;  // 通过下拉列表选择的属性             [1,2,3,4]
                    if (exportAttrIds.length === selectedAttrsId.length) {
                        return difference(selectedAttrsId, exportAttrIds).length === 0;
                    }
                    return false;
                },
                set(flag) {
                    // true 所有的已选列属性
                    // false 所有的联系人属性
                    if (flag) {
                        this.exportAttrIds = this.selectedAttrs.map(attrId => attrId.id);
                    } else {
                        // exportAttrIds过滤掉已选属性
                        const AllList = this.selectedAttrs.map(item => item.id);
                        const selectList = this.exportAttrIds.concat();
                        this.exportAttrIds = difference(selectList, AllList);
                    }
                }
            }

        },
        methods: {
            getUserGroupTables() {
                this.$loading();
                ContactApiV1
                    .getUserGroupsList(this.id, this.params)
                    .then(res => {
                        this.$loaded();
                        const data = res.body.data;
                        this.swarmData = data.swarm;
                        this.contactInfoList = data.contactInfoList;
                        this.totalPage = data.totalPage > 100 ? 100 : data.totalPage;
                        this.totalRow = data.totalRow;
                        this.$emit('changeRow',this.totalRow);
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 左右移动属性数据请求
            selectedAttrsChanged(selectedAttrs, availableAttrs) {
                this.selectedAttrs = selectedAttrs;
                this.allUserAttrs = [...selectedAttrs, ...availableAttrs]
                    .map(attr => Object.assign({}, attr, {disabled: false}));
                this.params.customerFieldId = this.searchableAttrs.length > 0 ? this.searchableAttrs[0].id : '';
                this.params.searchName = '';
                this.params.pageNumber = 1;
                if (this.id !== -1) {
                    this.getUserGroupTables();
                }
            },

            tapPagesHander(pageSize) {
                this.params.pageSize = pageSize;
                this.getUserGroupTables();
            },
            SelectPage(pageNumber) {
                this.params.pageNumber = pageNumber;
                this.getUserGroupTables();
                this.checkedItem = [];
            },
            // 排序
            sortByAttr(attr) {
                this.params.sort = this.params.sort === 'asc' ? 'desc' : 'asc';
                this.params.sortField = attr.fieldName;
                this.getUserGroupTables();
            },
            search() {
                this.params.pageNumber = 1;
                this.params.sort = 'asc';
                this.params.sortField = '';
                this.getUserGroupTables();
            },
            // 取消
            cancel() {
                this.confirm = false;
                this.exportAttrIds = [];
            },
            // 下载csv
            sure() {
                if (!this.exportAttrIds.length) {
                    this.$toast(this.$t('contact.selectAttr'), 'warn');
                    return;
                }
                if (this.email_text === '') {
                    this.$toast(this.$t('swarm.emailEmptyError'), 'warn');
                    return;
                }
                if (!EMAIL_ADDRESS_REGEXP.test(this.email_text)) {
                    this.$toast(this.$t('swarm.emailFormatError'), 'warn');
                    return;
                }
                ContactExportApiV1
                    .exportContact(this.id, this.email_text, this.exportAttrIds.join(','))
                    .then(() => {
                        this.$toast(this.$t('swarm.checkoutEmail'));
                        this.exportAttrIds = [];
                        this.confirm = false;
                        trackEvent('联系人分群-下载CSV', {id: this.id});
                    });
            },
            goToDetail(item) {
                // 是否具有查看数据详情的权限
                let clickFlag = this.$has('customer_swarm_details_customer');
                if (clickFlag) {
                    return ;
                }
                this.$router.push({name: 'customerDetail', query: {id: item.customerId}});
            },
            // 批量删除
            batchDelete() {
                if (this.checkedItem.length === 0) {
                    this.$toast(this.$t('swarm.selectCustomer'), 'warn');
                    return;
                }
                this.deleteLabel(this.checkedItem);
            },
            deleteLabel(ids) {
                this.$confirm(this.$t('common.defaultConfirmTitle'), this.$t('swarm.deleteConfirm'))
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            EtlApiV1
                                .deleteUser(ids)
                                .then(() => {
                                    this.$loaded();
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    this.getUserGroupTables();
                                    this.checkedItem = [];
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        }
                    });
            }

        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .swarm-users {
        margin-top: 24px;

        .data_child {
            padding: 8px;
            line-height: $input-field-height;

            .customer-refresh {
                cursor: pointer;
                margin-right: 8px;

                &:hover {
                    color:  $theme;
                }
            }
            @include clearfix();
        }
        .simplify-table tr td {
            line-height: 47px;
        }
        .action-box {
            @include clearfix();

            .hidden-menu-trigger {
                position: relative;
                cursor: pointer;

                &:hover {
                    color: $color-title;
                }

                svg {
                    width: 12px;
                    height: 12px;
                    vertical-align: top;
                    margin-top: ($input-field-height - 24px)/2;
                    fill: currentColor;
                }

                .hidden-menu {
                    top: 20px;
                    left:0;
                    @include transform-origin(left top);
                }
            }
            .batch-action {
                margin-left: 24px;
            }
        }
    }
</style>
