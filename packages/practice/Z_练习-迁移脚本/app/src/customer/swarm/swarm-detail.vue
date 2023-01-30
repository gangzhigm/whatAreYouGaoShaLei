<template>
    <div class="swarm-detail" v-if="!isEmpty">
        <!--正文-->
        <div class="data_child">
            <!--菜单操作-->
            <div class="hidden-menu-trigger pull-left batch-actions">
                <svg aria-hidden="true" class="icon-arrow-down">
                    <use xlink:href="#icon-batch"></use>
                </svg>
                <span class="title-text">{{'tag.batchOperation' | t}}</span>
                <div class="hidden-menu">
                    <button :disabled="$has('customer_swarm_batch_delete')" class="btn menu" @click="batchDelete">
                        {{'tag.tatchDelete' | t}}
                    </button>
                </div>
            </div>
            <!--搜索框-->
            <div class="pull-right search-box md">
                <input type="text" v-model.trim="params.searchName" @keyup.enter="search">
                <svg aria-hidden="true" @click="search">
                    <use xlink:href="#icon-search"></use>
                </svg>
            </div>
            <!--属性选择组件-->
            <selector class="pull-right" :options="searchableAttrs" v-model="params.customerFieldId"/>
            <!--展示列组件-->
            <customer-table-attribute-selector class="pull-right" @change="selectedAttrsChanged"/>
            <!--刷新-->
            <button @click="getUserGroupTables" type="button" class="btn customer-refresh pull-right"
                    :disabled="$has('customer_swarm_refresh_list')">
                <i class="icon icon-refresh" v-title:left="$t('swarm.refresh')"></i>
            </button>
        </div>
        <!--表格数据-->
        <div class="simplify-table auto-width">
            <table>
                <thead>
                    <tr>
                        <td>
                            <checkbox :source="false" v-model="allChecked"
                                    :title="allChecked ? $t('common.cancelAll') : $t('common.allSelected')"/>
                        </td>
                        <td v-for="attr in selectedAttrs" :key="attr.id">
                            <span>{{ attr.name }}</span>
                            <button type="button" class="table-sort-button" v-if="attr.ifSort" @click="sortByAttr(attr)">
                                <svg aria-hidden="true" class="asc"
                                    :class="{active: attr.fieldName === params.sortField && params.sort === 'asc'}">
                                    <use xlink:href="#icon-caret-down"></use>
                                </svg>
                                <svg aria-hidden="true" class="desc"
                                    :class="{active: attr.fieldName === params.sortField && params.sort === 'desc'}">
                                    <use xlink:href="#icon-caret-down"></use>
                                </svg>
                            </button>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="loading" class="no-hover">
                        <td :colspan="selectedAttrs.length + 1 || 1" class="slim-cell">
                            <inline-loading />
                        </td>
                    </tr>
                    <template v-else-if="contactInfoList.length > 0">
                        <tr v-for="item in contactInfoList" :key="item.id">
                            <td>
                                <checkbox :source="item.id" v-model="checkedItem"/>
                            </td>
                            <td v-for="attr in item.fieldValueList" @click="goToDetail(item)">
                                {{ !!attr ? attr : ' / ' }}
                            </td>
                        </tr>
                    </template>
                    <tr v-else>
                        <td :colspan="selectedAttrs.length + 1 || 1" class="slim-cell">
                            <list-search-empty v-if="params.searchName !== ''"/>
                            <list-empty v-else/>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <pager :total="totalPage" :now="params.pageNumber" @page="SelectPage">
            <div class="pull-left">
                {{'common.total' | t}}
                <span class="theme-text">{{totalRow}}</span>
                {{'swarm.contactCount' | t}}
                ({{'contact.email' | t}}{{'punctuation.colon' | t}}
                {{swarmData.emailCount}}
                /
                {{'contact.phoneNo' | t}}{{'punctuation.colon' | t}}
                {{swarmData.mobileCount}}
                /
                {{'contact.wechat' | t}}{{'punctuation.colon' | t}}
                {{swarmData.wechatCount}})
            </div>
            {{'contact.everyPage' | t}}
            <selector :options="pageSizeOptions" :value="params.pageSize" @input="tapPagesHander" class="tiny"/>
            {{'contact.maxPage' | t}}
        </pager>
        <!--下载数据-->
        <confirm :title="$t('swarm.confirmDeliveryEmail')" v-if="confirm" @cancel="cancel" @confirm="sure">
            <div class="form-field">
                <span class="label">{{'contact.contactNumber' | t}}</span>
                <span class="theme-text tdu">{{totalRow}}</span>
            </div>
            <div class="form-field flex">
                <label class="label">{{'contact.selectAttributeL' | t}}</label>
                <div class="field-group">
                    <multi-select :options="allUserAttrs" class="full-width" dropDirection="bottom" :autoWidth="false"
                                  v-model="exportAttrIds"
                                  :placeholder="$t('contact.selectAttr')"/>
                    <p>
                        <checkbox v-model="exportAllAttrs">
                            {{'contact.allAttr' | t}}
                        </checkbox>
                        <checkbox v-model="exportSelectedAttrs">
                            {{'contact.displayAttr' | t}}
                        </checkbox>
                    </p>
                </div>
            </div>
            <!--格式类型-->
            <div class="form-field">
                <label class="label">{{'contact.formatType' | t}}</label>
                <radio source="Excel" v-model="formatType">Excel</radio>
                <radio source="CSV" v-model="formatType">CSV</radio>
            </div>
            <!--数据格式-->
            <div class="form-field" v-if="formatType === 'CSV'">
                <label class="label">{{'contact.dataFormat' | t}}</label>
                <radio source="utf-8" v-model="dataFormat">utf8</radio>
                <radio source="gb18030" v-model="dataFormat">gb18030</radio>
            </div>
            <!-- 邮件主题 -->
            <div class="form-field">
                <label class="label">{{'contact.emailSubject' | t}}</label>
                <input type="text" class="input" v-model="emailSubject" maxlength="60"/>
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
            CustomerTableAttributeSelector
        },
        props: {
            id: {
                type: Number,
                required: true
            },
            swarmName: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                loading: true,//加载数据
                //all: false,
                pageNumber: 1,//页码
                totalRow: 0,//数据总数
                emailCount: '',//邮箱总数
                mobileCount: '',//手机号总数
                wechatCount: '',//微信总数
                searchName: '',//搜索名称
                email_text: '',//接受邮箱
                confirm: false, //导出用户数据弹窗
                allUserAttrs: [], //所有的联系人属性
                selectedAttrs: [], // 用户已选展示列, 固定6条
                contactInfoList: [], // 表格的数据
                params: {
                    customerFieldId: -1, // 搜索下拉列表选择字段,选中的值
                    pageNumber: 1,  //页码
                    pageSize: 10,   //每页数量
                    searchName: '', //搜索名称
                    sort: 'asc',    //正序倒序
                    sortField: ''   //排序关键字
                },
                swarmData: {},  //分群数据
                totalPage: 0, // 总页数
                pageSizeOptions: [
                    {id: 50, name: 50},
                    {id: 30, name: 30},
                    {id: 20, name: 20},
                    {id: 10, name: 10}
                ],
                exportAttrIds: [], // 下载csv导出的属性
                isEmpty: false,     //判断数据是否为空
                checkedItem: [],    //选择的数据
                //下载详情
                formatType: 'Excel',//格式类型
                dataFormat: '',//数据格式
                emailSubject: this.$t('swarm.emailSubject'),//邮件主题
            };
        },
        mounted() {
            if (!this.id) {
                logError(
                    `[联系人分群] <swarmUser /> mounted 进入联系人分群列表页没有当前分群的id`
                );
            }
            this.email_text = this.$store.state.user.email;
        },
        watch: {
            id(newVal, oldval) {
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
                        sortField: ''
                    };
                    this.totalPage = 0;
                    this.totalRow = 0;
                    this.contactInfoList = [];
                } else if (newVal === -2) {
                    this.isEmpty = true;
                }
            },
            formatType() {
                if (this.formatType === 'Excel') {
                    this.dataFormat = '';
                } else {
                    this.dataFormat = 'utf-8';
                }
            }
        },
        computed: {
            user() {
                return this.$store.state.user;
            },
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            },
            // 控制checkbox全选按钮状态
            allChecked: {
                get() {
                    return (
                        this.checkedItem.length === this.contactInfoList.length &&
                        this.contactInfoList.length !== 0
                    ); //返回布尔值判断状态是否为选中状态
                },
                set(newval) {
                    if (newval) {
                        this.checkedItem = this.contactInfoList.map(
                            item => item.id
                        );
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
                        this.exportAttrIds = this.allUserAttrs.map(
                            attrs => attrs.id
                        );
                    } else {
                        this.exportAttrIds = [];
                    }
                }
            },
            // 导出表格中已选的属性
            exportSelectedAttrs: {
                get() {
                    const selectedAttrsId = this.selectedAttrs.map(
                        attrs => attrs.id
                    ); // 所有的已选属性 [1,2,3]
                    const exportAttrIds = this.exportAttrIds; // 通过下拉列表选择的属性             [1,2,3,4]
                    if (exportAttrIds.length === selectedAttrsId.length) {
                        return (
                            difference(selectedAttrsId, exportAttrIds).length === 0
                        );
                    }
                    return false;
                },
                set(flag) {
                    // true 所有的已选列属性
                    // false 所有的联系人属性
                    if (flag) {
                        this.exportAttrIds = this.selectedAttrs.map(
                            attrId => attrId.id
                        );
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
                this.loading = true;
                ContactApiV1
                    .getUserGroupsList(this.id, this.params)
                    .then(res => {
                        const data = res.body.data;
                        this.swarmData = data.swarm;
                        this.contactInfoList = data.contactInfoList;
                        this.totalPage =
                            data.totalPage > 100 ? 100 : data.totalPage;
                        this.totalRow = data.totalRow;
                        this.$emit('changeRow', this.totalRow);
                        this.loading = false;
                    })
                    .catch(() => {
                        this.loading = false;
                    });
            },
            /**
             * 左右移动属性数据请求
             * @param selectedAttrs 选择展示的项
             * @param availableAttrs 不展示的项
             */
            selectedAttrsChanged(selectedAttrs, availableAttrs) {
                this.selectedAttrs = selectedAttrs;
                this.allUserAttrs = [...availableAttrs].map(
                    attr => Object.assign({}, attr, {disabled: false})
                );
                this.params.customerFieldId =
                    this.searchableAttrs.length > 0
                        ? this.searchableAttrs[0].id
                        : '';
                this.params.searchName = '';
                this.params.pageNumber = 1;
                if (this.id !== -1) {
                    this.getUserGroupTables();
                }
            },

            /**
             * 选择每页数据量
             * @param pageSize 每页数据量
             */
            tapPagesHander(pageSize) {
                this.params.pageNumber = 1;
                this.params.pageSize = pageSize;
                this.getUserGroupTables();
            },
            /**
             * 选择页码
             * @param pageNumber 页码
             */
            SelectPage(pageNumber) {
                this.params.pageNumber = pageNumber;
                this.getUserGroupTables();
                this.checkedItem = [];
            },
            /**
             * 排序
             * @param attr 排序关键字
             */
            sortByAttr(attr) {
                this.params.sort = this.params.sort === 'asc' ? 'desc' : 'asc';
                this.params.sortField = attr.fieldName;
                this.getUserGroupTables();
            },
            //搜索
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
                if (this.emailSubject === '') {
                    this.$toast(this.$t('contact.emailEmpty'), 'warn');
                    return;
                }
                if (!EMAIL_ADDRESS_REGEXP.test(this.email_text)) {
                    this.$toast(this.$t('swarm.emailFormatError'), 'warn');
                    return;
                }
                if (this.isHw){
                    if (!this.email_text.includes('@huawei.com') && !this.email_text.includes('@qdum.com')) {
                        this.$toast(this.$t('common.emailTypeWaring'), 'warn');
                        return;
                    }
                }
                ContactExportApiV1
                    .exportContact(
                        this.id,
                        this.email_text,
                        this.exportAttrIds.join(','),
                        this.formatType,
                        this.dataFormat,
                        this.emailSubject
                    )
                    .then(() => {
                        this.$toast(this.$t('swarm.checkoutEmail'));
                        this.exportAttrIds = [];
                        this.confirm = false;
                        this.restoreInitial();
                        trackEvent('联系人分群-下载CSV', {id: this.id});
                    });
            },
            /**
             * 跳转客户详情页
             * @param item 客户数据
             */
            goToDetail(item) {
                // 是否具有查看数据详情的权限
                let clickFlag = this.$has('customer_swarm_details_customer');
                if (clickFlag) {
                    return;
                }
                this.$router.push({
                    name: 'customerDetail',
                    query: {id: item.customerId}
                });
            },
            // 批量删除
            batchDelete() {
                if (this.checkedItem.length === 0) {
                    this.$toast(this.$t('swarm.selectCustomer'), 'warn');
                    return;
                }
                this.deleteLabel(this.checkedItem);
            },
            /**
             * 删除
             * @param ids Array 要删除的客户id列表
             */
            deleteLabel(ids) {
                this.$confirm(
                    this.$t('common.defaultConfirmTitle'),
                    this.$t('swarm.deleteConfirm')
                )
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            EtlApiV1
                                .deleteUser(ids)
                                .then(() => {
                                    this.$loaded();
                                    this.$toast(
                                        this.$t('common.deleteSuccess'),
                                        'success'
                                    );
                                    this.getUserGroupTables();
                                    this.checkedItem = [];
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        }
                    });
            },
            //下载数据后 恢复初始数据
            restoreInitial() {
                this.formatType = 'Excel';
                this.dataFormat = '';
                this.emailSubject = this.$t('swarm.emailSubject');
                this.email_text = this.$store.state.user.email;
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .swarm-detail {
        .data_child {
            padding-bottom: 16px;
            line-height: $input-field-height;

            .customer-refresh {
                cursor: pointer;
                margin-right: 8px;

                &:hover {
                    color: $theme;
                }
            }

            @include clearfix();
        }

        .simplify-table {
            overflow-x: auto;
            min-height: 537px;

            tr td {
                line-height: 47px;
            }
        }
    }
</style>
