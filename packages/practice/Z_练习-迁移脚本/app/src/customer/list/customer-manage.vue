<template>
    <div class="content-container customer-manage">
        <div class="content-view">
            <crumbs/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'home.customerPerfile' | t}}</h1>
                <button :disabled="$has('customer_list_upload_csv')" class="pull-right btn btn-md btn-theme"
                        @click="customerUpload">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-upload"></use>
                    </svg>
                    {{'contact.uploadData' | t}}
                </button>
                <button type="button"
                        :disabled="$has('customer_list_add_customer')"
                        class="pull-right btn btn-md btn-theme create-user" @click="showCreateForm">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'contact.createContact' | t}}
                </button>
            </div>
        </div>
        <!-- 正文 -->
        <div class="page-content">
            <div class="upTime" v-if="upTime">
                <div style="display: inline-block;width: 355px">
					<span style="padding-left: 30px;color:#006699">
                        {{'contact.latestUpdateTime' | t}} <span>{{nowData}} 06:00</span>
					</span>
                </div>
                <div class="close" @click="upTime=false">
                    <i class="icon icon-close"></i>
                </div>
            </div>
            <div class="content-view margin">
                <!--2020/2/6 http://jira.qdum.com/browse/DMARTECH-5172-->
                <!--<div class="box">
                    &lt;!&ndash;会员概览&ndash;&gt;
                    <div class="overview">
                        <div class="title">{{'contact.contactOverview' | t}}</div>
                        &lt;!&ndash;综合价值分布&ndash;&gt;
                        <div class="costBox">
                            <div id="cost"></div>
                            <p>{{'contact.overallValue' | t}}</p>
                        </div>
                        <div class="livelyBox">
                            <div id="lively"></div>
                            <p>{{'contact.activityValue' | t}}</p>
                        </div>
                        <div class="consumeBox" style="text-align:center;display: inline-block;width: 33.3%">
                            <div id="consume"></div>
                            <p>{{'contact.consumptionAbility' | t}}</p>
                        </div>
                    </div>
                    &lt;!&ndash;会员综合分布图&ndash;&gt;
                    <div class="scattergram">
                        <div class="title">{{'contact.contactOverall' | t}}</div>
                        <div class="axis">
                            <div class="yAxis">
                                <div class="consume">
                                    {{'contact.consumption' | t}}
                                    {{'punctuation.leftParenthesis' | t}}{{'common.high' |
                                    t}}{{'punctuation.rightParenthesis' | t}}
                                </div>
                            </div>
                            <div class="XAxis">
                                <div class="active">
                                    {{'contact.activity' | t}}
                                    {{'punctuation.leftParenthesis' | t}}{{'common.high' |
                                    t}}{{'punctuation.rightParenthesis' | t}}
                                </div>
                            </div>
                            <div class="axisContent">
                                <ul class="listContent">
                                    <li style="background-color: #a27419;"
                                        v-title:right="$t('contact.overallValueLowestContacts')+comprehensive.lowPrice">
                                        <span v-if="lowPrice!=100">{{lowPrice + '%'}}</span>
                                        <span v-else>100%</span>
                                    </li>
                                    <li style="background-color: #32acfd;"
                                        v-title:right="$t('contact.overallValueLowContacts')+comprehensive.lowerPrice">
                                        <span v-if="lowerPrice!=100">{{lowerPrice + '%'}}</span>
                                        <span v-else>100%</span>
                                    </li>
                                    <li style="background-color: #73d955;"
                                        v-title:right="$t('contact.overallValueAverageContacts')+comprehensive.conventionalPrice">
                                        <span v-if="conventionalPrice!=100">{{conventionalPrice + '%'}}</span>
                                        <span v-else>100%</span>
                                    </li>
                                    <li style="background-color: #f6bf3f;"
                                        v-title:right="$t('contact.overallValueHighContacts')+comprehensive.higherPrice">
                                        <span v-if="higherPrice!=100">{{higherPrice + '%'}}</span>
                                        <span v-else>100%</span>
                                    </li>
                                    <li style="background-color: #c55b90;"
                                        v-title:right="$t('contact.overallValueHighestContacts')+comprehensive.highPrice">
                                        <span v-if="highPrice !=100">{{highPrice + '%'}}</span>
                                        <span v-else>100%</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>-->
                <!--会员列表-->
                <div class="customer-table-container">
                    <h3>{{'contact.myTotalContacts' | t}}：{{customerCounts || 0}}</h3>
                    <div class="tab-links">
                        <p class="select-user-from tab-link" v-for="from in userFromList.filter(user => user.show)"
                           :key="from.id" :class="{active: params.customerType === from.id}"
                           @click="selectCustomerType(from.id)">
                            {{from.name}}
                        </p>
                        <!--http://jira.qdum.com/browse/DMARTECH-8493 隐藏"同步微信粉丝"按钮-->
                        <!--<button v-if="params.customerType === 3" class="btn btn-md btn-theme pull-right btn-sync-wechat"
                                :disabled="isSyncWechat" @click="openWeChatCustomer">
                            {{syncWechatName}}
                            <span class="icon icon-classic-loading" v-if="isSyncWechat"/>
                        </button>-->
                    </div>
                    {{'common.total' | t}}
                    <span class="theme-text">&nbsp;{{totalRow}}&nbsp;</span>
                    {{'contact.contactCount' | t}}
                    <!--微信粉丝列表-筛选公众号-->
                    <selector class="lg" v-if="params.customerType === 3" :options="authorizerInfoList"
                              v-model="accountIds" type="checkSelect" icon="shaixuan" :shortcut-action="false"
                              :placeholder="$t('contact.accountFilter')" :listName="$t('contact.accountFilter')"
                              @checkOptions="checkOptions"/>
                    <div class="pull-right search-box search-name">
                        <input type="text" v-model.trim="params.searchName" @keyup.enter="search"
                               @input="emptyClean($event)">
                        <svg aria-hidden="true" @click="search">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                    <selector class="pull-right"
                              :options="searchableAttrs"
                              v-model="params.customerFieldId"/>
                    <customer-table-attribute-selector class="pull-right" @change="selectedAttrsChanged"/>
                </div>
                <!--listShow-->
                <div class="list-show">
                    <!--表头-->
                    <div class="simplify-table table-head" ref="rowLayer">
                        <table>
                            <thead>
                            <tr>
                                <td v-for="attr in selectedAttrs"
                                    :key="attr.id"
                                    :class="{'sorted-column': attr.fieldName === params.sortField}"
                                    :title="attr.name">
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
                        </table>
                    </div>
                    <!--表格数据内容-->
                    <div class="simplify-table table-body" @scroll="tableScroll" v-if="contactInfoList.length" ref="tableContainer">
                        <table>
                            <tbody>
                            <tr v-for="item in contactInfoList" :key="item.customerId"
                                :class="{
                                    'no-hover': $has('customer_list_customer_details'),
                                    'no-cursor': $has('customer_list_customer_details')
                                }"
                                @click="goToDetail(item.customerId)">
                                <!-- v-for循环，缺少key：字符串数组，无唯一标识 -->
                                <!-- eslint-disable-next-line-->
                                <td v-for="attr in item.fieldValueList" :title="attr ? attr : ' / '">
                                    {{ !!attr ? attr : ' / ' }}
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <!--数据为空-->
                    <div class="simplify-table scroll" @scroll="tableScroll" v-if="contactInfoList.length === 0">
                        <list-search-empty v-if="contactInfoList.length === 0 && params.searchName !== ''"/>
                        <list-empty v-else-if="contactInfoList.length === 0"/>
                    </div>
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
        </div>
        <!-- 创建用户 -->
        <customer-form v-if="createFormShow" @close="createFormShow=false" @complete="getTableData"/>
        <!-- 同步微信粉丝弹窗 -->
        <modal v-if="showSyncWeChat" :title="$t('contact.synchronizeWeChatFans')" @close="cancelSyncWeChat">
            <div class="form-field">
                <label for="publicAccount" class="label">{{'contact.account' | t}}</label>
                <selector class="lg" id="publicAccount" :options="authorizerInfoList" v-model="accountId" search
                          @select="selectAccount"/>
            </div>
            <template v-slot:buttons>
                <button type="button" class="btn btn-md btn-white" @click="cancelSyncWeChat">
                    {{'common.cancel' | t}}
                </button>
                <button type="button" class="btn btn-md btn-theme" @click="syncWeChatCustomer">
                    {{'common.confirm' | t}}
                </button>
            </template>
        </modal>
    </div>
</template>
<script type="text/babel">
    import { ScrmApiV1, WechatApiV1, ContactApiV1 } from '@/api';
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/pie';
    import 'echarts/lib/component/title';
    import 'echarts/lib/component/tooltip';
    import 'echarts/lib/component/legend';
    import format from 'date-fns/format';
    import CustomerForm from './customer-form.vue';
    import CustomerTableAttributeSelector from '../customer-table-attribute-selector.vue';
    import rootStore from '@/store/vuex/rootStore.js';

    export default {
        components: {
            CustomerForm,
            CustomerTableAttributeSelector,
        },
        data() {
            return {
                upTime: true,
                totalRow: '', // 总条数
                totalPage: 0, // 总页数
                highPrice: '',
                higherPrice: '',
                lowPrice: '',
                lowerPrice: '',
                conventionalPrice: '',
                nowData: format(new Date(), 'YYYY-MM-DD'),
                comprehensive: {},
                customerTotal: '',
                createFormShow: false,  // 创建单个联系人弹出层
                selectedAttrs: [], // 用户已选展示列, 固定3条
                contactInfoList: [],
                params: {
                    customerFieldId: -1, // 搜索下拉列表选择字段,选中的值
                    pageNumber: 1,
                    pageSize: 10,
                    searchName: '',
                    sort: 'asc',
                    sortField: '',
                    customerType: 1,  //筛选的当前用户类别
                    appIds: [],       // 公众号
                },
                customerCounts: '',    // 我的联系人总数
                pageSizeOptions: [
                    {id: 50, name: 50},
                    {id: 30, name: 30},
                    {id: 20, name: 20},
                    {id: 10, name: 10}
                ],
                userFromList: [
                    {id: 1, name: this.$t('contact.realNameCustomer'), show: true},
                    {id: 2, name: this.$t('contact.anonymousCustomer'), show: true},
                    // 未绑定公众号不予展示。
                    {
                        id: 3,
                        name: this.$t('contact.WeChatFansCustomer'),
                        show: !!this.$store.state.user.authorizerInfoId
                    },
                    {id: 5, name: this.$t('contact.wecomContact'), show: this.wecomContactFlag('wecom')},
                    {id: 6, name: this.$t('contact.miniprogramContacts'), show: true },
                    {id: 4, name: this.$t('contact.allCustomers'), show: true}
                ],  // 用户来源类别
                isSyncWechat: false,  // 是否正在同步微信联系人
                checkStatus: null,
                attrsChangeNum: 0,
                showSyncWeChat: false,  // 同步微信粉丝联系人弹窗
                authorizerInfoList: [], // 公众号列表
                accountId: null,        // 选中的公众号
                accountIds: [],         // 绑定下拉框选中  微信粉丝联系人-公众号 id
            };
        },
        computed: {
            searchableAttrs() {
                // type 1 是可以进行模糊查询的
                return this.selectedAttrs
                    .filter(sel => sel.type === 1)
                    .map(attr => ({id: attr.id, name: attr.name}));
            },
            // 同步微信粉丝按钮文本
            syncWechatName() {
                return this.isSyncWechat ? this.$t('contact.syncing') : this.$t('contact.synchronizeWeChatFans');
            },
            // 接口传值  微信粉丝联系人-公众号 WxAppId
            appStringIds: {
                get() {
                    let list = [];
                    this.accountIds.forEach(id => {
                        let account = this.authorizerInfoList.filter(auth => auth.id === id)[0];
                        list.push(account);
                    });
                    let stringIds = list.map(l => l.WxAppId);
                    return stringIds;
                },
                set(vals) {
                    return vals;
                }
            },
            user() {
                return this.$store.state.user;
            },
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            }
        },
        created() {
            if (this.$route.query.keyWords){
                this.params.customerType = 4;
                this.params.keyWords = this.$route.query.keyWords;
                this.getTableData();
            } else if (this.$route.query.pageNumber) {
                this.params = JSON.parse(JSON.stringify(this.$route.query));
                this.params.customerFieldId = ~~this.params.customerFieldId;
                this.params.customerType = ~~this.params.customerType;
                this.params.pageNumber = ~~this.params.pageNumber;
                this.params.pageSize = ~~this.params.pageSize;
                if (this.params.customerType !== 3) {
                    this.params.appIds = [];
                }
                this.getTableData();
            } else {
                this.attrsChangeNum = 2;
            }
        },
        mounted() {
            // 2020/2/6 http://jira.qdum.com/browse/DMARTECH-5172
            // this.getCost();
            // this.getLively();

            this.fetchAccountList();
            this.fetchMyTotalContacts();

            //华为埋码-用户数据管理- 用户画像
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P1203199602B5F4');
            }
        },
        methods: {
            //根据是否有"企业微信"套餐，判断tab"企业微信联系人"的显隐
            wecomContactFlag(flag) {
                let user = rootStore.state.user;
                // 权限
                let authList = user.permissions;
                let auth = authList[flag];
                if (auth) return true;
                return false;
            },
            // 获取公众号列表
            fetchAccountList() {
                WechatApiV1
                    .getWechatAccounts()
                    .then(res => {
                        this.authorizerInfoList = res.body.data.authorizerInfoList.map(auth => ({
                            id: auth.authorizerInfoId,
                            WxAppId: auth.WxAppId,
                            name: auth.principalName,
                        }));

                        this.accountIds = this.authorizerInfoList.map(auth => auth.id);

                        if (this.$route.query.pageNumber) {
                            this.params.appIds = this.authorizerInfoList.map(auth => auth.WxAppId)
                                .join(',');

                            this.getTableData();
                        }
                    });
            },
            // 获取我的联系人总数
            fetchMyTotalContacts() {
                this.$loading();
                ContactApiV1
                    .getTableList({
                        customerFieldId: -1, // 搜索下拉列表选择字段,选中的值
                        pageNumber: 1,
                        pageSize: 10,
                        searchName: '',
                        sort: 'asc',
                        sortField: '',
                        customerType: 4,  //筛选的当前用户类别
                        appIds: this.appStringIds.join(','), // 公众号
                    })
                    .then(res => {
                        this.$loaded();
                        const data = res.body.data;
                        this.customerCounts = data.totalRow;// 我的联系人总数
                    })
                    .catch(res => {
                        this.$loaded();
                        this.$toast(res.body.message, 'warn');
                    });
            },
            // 创建联系人
            showCreateForm() {
                this.createFormShow = true;
            },
            // 获取表格数据列表
            getTableData() {
                // 添加数据刷新过渡效果
                this.$loading();
                ContactApiV1
                    .getTableList(this.params)
                    .then(res => {
                        this.$loaded();
                        const data = res.body.data;
                        this.contactInfoList = data.contactInfoList;
                        this.totalRow = data.totalRow;
                        this.totalPage = data.totalPage;
                        this.$router.replace({
                            name: this.$route.name,
                            query: JSON.parse(JSON.stringify(this.params))
                        });
                        this.attrsChangeNum++;
                    })
                    .catch(res => {
                        this.$loaded();
                        this.$toast(res.body.message, 'warn');
                        this.params.pageNumber = this.$route.query.pageNumber;
                    });
            },
            selectedAttrsChanged(attrs) {
                this.selectedAttrs = attrs;
                if (this.attrsChangeNum > 1) {
                    this.params.customerFieldId = this.searchableAttrs.length > 0 ? this.searchableAttrs[0].id : '';
                    this.params.searchName = '';
                    this.params.pageNumber = 1;
                    this.getTableData();
                }
            },
            // 获取分页
            SelectPage(page) {
                this.params.pageNumber = page;
                this.getTableData();
            },
            getCost() {
                ScrmApiV1
                    .getReport(1)
                    .then(res => {
                        // 算综合价值的百分数
                        this.comprehensive = res.body.data;
                        if (res.body.data.customerTotal === 0) {
                            this.highPrice = 0;
                            this.higherPrice = 0;
                            this.lowPrice = 0;
                            this.lowerPrice = 0;
                            this.conventionalPrice = 0;
                        } else {
                            this.highPrice = Math.round(
                                res.body.data.highPrice / res.body.data.customerTotal * 100
                            );
                            this.higherPrice = Math.round(
                                res.body.data.higherPrice / res.body.data.customerTotal * 100
                            );
                            this.lowPrice = Math.round(
                                res.body.data.lowPrice / res.body.data.customerTotal * 100
                            );
                            this.lowerPrice = Math.round(
                                res.body.data.lowerPrice / res.body.data.customerTotal * 100
                            );
                            this.conventionalPrice = Math.round(
                                100 -
                                this.highPrice -
                                this.higherPrice -
                                this.lowPrice -
                                this.lowerPrice
                            );
                        }
                        this.customerTotal = res.body.data.customerTotal;
                        let pie = echarts.init(document.getElementById('cost'));
                        pie.setOption({
                            title: {
                                text: res.body.data.customerTotal.toLocaleString('en-US'),
                                subtext: this.$t('contact.contactTotal'),
                                x: 'center',
                                y: 'center',
                                textStyle: {
                                    fontWeight: 'normal',
                                    fontSize: 14,
                                    color: '#404040'
                                },
                                subtextStyle: {
                                    fontWeight: 'normal',
                                    fontSize: 12,
                                    color: '#b6b6b6'
                                }
                            },

                            tooltip: {
                                trigger: 'item',
                                formatter: '{a} <br/>{b}: {c} ({d}%)',
                                //                            showContent:false,
                                position: ['0', '100%']
                            },
                            series: [
                                {
                                    name: this.$t('contact.overallValue'),
                                    type: 'pie',
                                    radius: ['50%', '70%'],
                                    avoidLabelOverlap: false,
                                    label: {
                                        normal: {
                                            show: false,
                                            position: 'center'
                                        },
                                        emphasis: {
                                            show: false,
                                            textStyle: {
                                                fontSize: '',
                                                fontWeight: 'bold'
                                            }
                                        }
                                    },
                                    labelLine: {
                                        normal: {
                                            show: false
                                        }
                                    },
                                    color: ['#11b47a', '#14d48f', '#17f9a8', '#5dfbc2', '#bafde5'],
                                    data: [
                                        {
                                            value: res.body.data.highPrice,
                                            name: this.$t('contact.overallValueHighest')
                                        },
                                        {
                                            value: res.body.data.higherPrice,
                                            name: this.$t('contact.overallValueHigh')
                                        },
                                        {
                                            value: res.body.data.lowPrice,
                                            name: this.$t('contact.overallValueLowest')
                                        },
                                        {
                                            value: res.body.data.lowerPrice,
                                            name: this.$t('contact.overallValueLow')
                                        },
                                        {
                                            value: res.body.data.conventionalPrice,
                                            name: this.$t('contact.overallValueAverage')
                                        }
                                    ]
                                }
                            ]
                        });
                        this.getConsume();
                    });
            },
            //获取活跃度的
            getLively() {
                ScrmApiV1
                    .getReport(2)
                    .then(res => {
                        let pie = echarts.init(document.getElementById('lively'));
                        // ecaht
                        pie.setOption({
                            title: {
                                text: res.body.data.customerTotal.toLocaleString('en-US'),
                                subtext: this.$t('contact.contactTotal'),
                                x: 'center',
                                y: 'center',
                                textStyle: {
                                    fontWeight: 'normal',
                                    fontSize: 14,
                                    color: '#404040'
                                },
                                subtextStyle: {
                                    fontWeight: 'normal',
                                    fontSize: 12,
                                    color: '#b6b6b6'
                                }
                            },

                            tooltip: {
                                trigger: 'item',
                                formatter: '{a} <br/>{b}: {c} ({d}%)',
                                // showContent:false,
                                position: ['0', '100%']
                            },
                            series: [
                                {
                                    name: this.$t('contact.activityValue'),
                                    type: 'pie',
                                    radius: ['50%', '70%'],
                                    avoidLabelOverlap: false,
                                    label: {
                                        normal: {
                                            show: false,
                                            position: 'center'
                                        },
                                        emphasis: {
                                            show: false,
                                            textStyle: {
                                                fontSize: '',
                                                fontWeight: 'bold'
                                            }
                                        }
                                    },
                                    labelLine: {
                                        normal: {
                                            show: false
                                        }
                                    },
                                    color: ['#098c7b', '#0aa590', '#0cc2a9', '#55d4c3', '#b7ede5'],
                                    data: [
                                        {
                                            value: res.body.data.conventionalActive,
                                            name: this.$t('contact.averageActivity')
                                        },
                                        {
                                            value: res.body.data.highActive,
                                            name: this.$t('contact.highActivity')
                                        },
                                        {
                                            value: res.body.data.higherActive,
                                            name: this.$t('contact.higherActivity')
                                        },
                                        {
                                            value: res.body.data.lowActive,
                                            name: this.$t('contact.lowActivity')
                                        },
                                        {
                                            value: res.body.data.lowerActive,
                                            name: this.$t('contact.lowerActivity')
                                        }
                                    ]
                                }
                            ]
                        });
                    });
            },
            // 获取消费力的
            getConsume() {
                ScrmApiV1
                    .gainConsume()
                    .then(res => {
                        let pie = echarts.init(document.getElementById('consume'));
                        pie.setOption({
                            title: {
                                text: this.customerTotal.toLocaleString('en-US'),
                                subtext: this.$t('contact.contactTotal'),
                                x: 'center',
                                y: 'center',
                                textStyle: {
                                    fontWeight: 'normal',
                                    fontSize: 14,
                                    color: '#404040'
                                },
                                subtextStyle: {
                                    fontWeight: 'normal',
                                    fontSize: 12,
                                    color: '#b6b6b6'
                                }
                            },

                            tooltip: {
                                trigger: 'item',
                                formatter: '{a} <br/>{b}: {c} ({d}%)',
                                // showContent:false,
                                position: ['0', '100%']
                            },
                            series: [
                                {
                                    name: this.$t('contact.consumptionAbility'),
                                    type: 'pie',
                                    radius: ['50%', '70%'],
                                    avoidLabelOverlap: false,
                                    label: {
                                        normal: {
                                            show: false,
                                            position: 'center'
                                        },
                                        emphasis: {
                                            show: false,
                                            textStyle: {
                                                fontSize: '',
                                                fontWeight: 'bold'
                                            }
                                        }
                                    },
                                    labelLine: {
                                        normal: {
                                            show: false
                                        }
                                    },
                                    color: ['#5944a9', '#6950c7', '#7b5eea'],
                                    data: [
                                        {
                                            value: res.body.data.normalCount,
                                            name: this.$t('contact.generalConsumption')
                                        },
                                        {
                                            value: res.body.data.superCount,
                                            name: this.$t('contact.highConsumption')
                                        },
                                        {
                                            value: res.body.data.highCount,
                                            name: this.$t('contact.higherConsumption')
                                        }
                                    ]
                                }
                            ]
                        });
                    });
            },
            search() {
                this.params.pageNumber = 1;
                this.params.sort = 'asc';
                this.params.sortField = '';
                this.getTableData();
            },
            tapPagesHander($event) {
                this.params.pageNumber = 1;
                this.params.pageSize = $event;
                this.getTableData();
            },
            sortByAttr(attr) {
                this.params.sort = this.params.sort === 'asc' ? 'desc' : 'asc';
                this.params.sortField = attr.fieldName;
                this.getTableData();
            },
            customerUpload() {
                this.$router.push({name: 'customerUpload'});
            },
            // 打开同步微信粉丝弹窗
            openWeChatCustomer() {
                this.accountId = null;
                this.showSyncWeChat = true;
            },
            // 选择多个公众号
            checkOptions() {
                this.params.appIds = this.appStringIds.join(',');
                this.getTableData();
            },
            // 同步微信联系人
            syncWeChatCustomer() {
                if (!this.accountId) {
                    this.$toast(this.$t('sendChannel.selectAccount'), 'warn');
                    return false;
                }
                this.cancelSyncWeChat();
                this.isSyncWechat = true;
                WechatApiV1
                    .synCustomerFans(this.accountId)
                    .then(() => {
                        this.checkWeChatSyncStatus();
                    })
                    .catch(res => {
                        this.$toast(res.body.message, 'warn');
                        this.clearCheck();
                    });
            },
            // 关闭同步微信粉丝弹窗
            cancelSyncWeChat() {
                this.showSyncWeChat = false;
            },
            /**
             * 选择公众号
             * @param e 公众号
             */
            selectAccount(e) {
                this.accountId = e.id;
            },
            // 表头跟随表单内容走
            tableScroll() {
                const $target = this.$refs.tableContainer;
                this.$refs.rowLayer.scrollLeft = $target.scrollLeft;
            },
            // 筛选用户类型
            selectCustomerType(id) {
                this.params.customerType = id;
                this.params.pageNumber = 1;
                this.params.pageSize = 10;
                this.params.searchName = '';
                if (id === 3) {
                    this.accountIds = this.authorizerInfoList.map(auth => auth.id);

                    let WxAppIds = this.authorizerInfoList.map(auth => auth.WxAppId);
                    this.params.appIds = WxAppIds.join(',');
                    this.appStringIds = WxAppIds;

                    this.checkWeChatSyncStatus();
                } else {
                    this.params.appIds = [];
                }

                this.getTableData();
            },
            checkWeChatSyncStatus() {
                // 检查同步结果 0-同步中 1-同步完成 null-未同步
                WechatApiV1
                    .getRedisStatus(this.accountId)
                    .then(({body: {data}}) => {
                        if (data.keyStatus === 1 && this.isSyncWechat) {
                            this.clearCheck();
                            this.$toast(this.$t('wechatContent.syncSuccessTip'), 'success');
                            // 重新获取微信联系人列表 (需要等到toast消失后在请求)
                            setTimeout(() => {
                                this.selectCustomerType(3);
                            }, 3000);
                        }
                        if (data.keyStatus === 0 && !this.checkStatus) {
                            // 刷新或者离开当前页，返回时，若是同步中状态。按钮仍需置灰
                            this.isSyncWechat = true;
                            this.checkStatus = setInterval(() => {
                                this.checkWeChatSyncStatus();
                            }, 1000);
                        }
                    });
            },
            clearCheck() {
                clearInterval(this.checkStatus);
                this.checkStatus = null;
                this.isSyncWechat = false;
            },
            emptyClean(e) {
                if (e.target.value === '') {
                    this.getTableData();
                }
            },
            /**
             * @description 查看联系人详情 受权限【查看客户详情】权限管控
             * @param {string} customerId 客户id
             */
            goToDetail (customerId) {
                if (this.$has('customer_list_customer_details')) return;
                this.$router.push({
                    name: 'customerDetail',
                    query: { id: customerId }
                });
            }
        }
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .customer-manage {
        @include clearfix();

        .upTime {
            background-color: #daecf8;
            height: 40px;
            line-height: 40px;
        }

        .close {
            float: right;

            .icon-close {
                color: #a0d7e7;
                cursor: pointer;
                padding-right: 10px;
            }
        }

        .box {
            height: 331px;
            @include box-sizing();
            @include clearfix();

            .overview {
                width: 60%;
                background-color: #ffffff;
                height: 331px;
                @include box-sizing();
                float: left;
                display: flex;
                align-items: center;
                position: relative;

                .title {
                    padding: 15px 0 0 17px;
                    font-size: 14px;
                    color: #000000;
                    position: absolute;
                    top: 0;
                    left: 0;
                }

                .costBox {
                    //   text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 33.3%;
                    @include box-sizing();
                }

                .livelyBox {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 33.3%;
                    @include box-sizing();
                }

                .consumeBox {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 33.3%;
                    @include box-sizing();
                }

                #cost {
                    width: 100%;
                    height: 168px;
                    display: inline-block;
                }

                #lively {
                    width: 100%;
                    height: 168px;
                    display: inline-block;
                }

                #consume {
                    width: 100%;
                    height: 168px;
                    display: inline-block;
                }
            }

            .scattergram {
                width: 39%;
                margin-left: 1%;
                background: white;
                height: 331px;
                @include box-sizing();
                float: left;
                padding-left: 14px;
                position: relative;

                .title {
                    padding: 15px 0 0 17px;
                    font-size: 14px;
                    color: #000000;
                }

                .axis {
                    margin: 0 0 24px 66px;
                    position: absolute;
                    bottom: 0;
                    left: 0;

                    .yAxis {
                        position: absolute;
                        left: 0;
                        bottom: 0;
                        height: 237px;
                        width: 1px;
                        background-color: #cccccc;

                        &:before {
                            content: "";
                            position: absolute;
                            top: -6px;
                            left: -6px;
                            width: 0;
                            height: 0;
                            border-left: 6px solid transparent;
                            border-right: 7px solid transparent;
                            border-bottom: 6px solid #cccccc;
                        }

                        .consume {
                            position: absolute;
                            left: 14px;
                            top: -9px;
                            width: 110px;
                        }
                    }

                    .XAxis {
                        position: absolute;
                        left: 0;
                        bottom: 0;
                        height: 1px;
                        width: 247px;
                        background-color: #cccccc;

                        &:before {
                            content: "";
                            position: absolute;
                            bottom: -7px;
                            right: -7px;
                            width: 0;
                            height: 0;
                            border-top: 7px solid transparent;
                            border-left: 7px solid #cccccc;
                            border-bottom: 7px solid transparent;
                        }

                        .active {
                            position: absolute;
                            right: -72px;
                            bottom: -21px;
                            width: 110px;
                        }
                    }

                    .axisContent {
                        position: absolute;
                        left: 0;
                        bottom: 0;
                        height: 1px;
                        width: 290px;
                        background-color: #ececec;
                        transform-origin: 0 0;
                        @include transform(rotate(-45deg));

                        .listContent {
                            position: absolute;
                            left: 32px;
                            top: -20px;
                            width: 292px;
                            background-color: rgba(0, 0, 0, 0);

                            li {
                                position: relative;
                                width: 45px;
                                height: 45px;
                                text-align: center;
                                @include border-radius(50%);
                                margin-right: 10px;
                                display: inline-block;
                                cursor: pointer;

                                span {
                                    color: white;
                                    display: inline-block;
                                    padding-top: 12px;
                                }
                            }
                        }
                    }
                }
            }
        }

        .customer-table-container {
            position: relative;
            margin-top: 8px;
            padding: 22px;
            line-height: $input-field-height;
            background-color: white;
            @include clearfix();

            .tab-links {
                margin-bottom: 10px;
            }

            .btn-sync-wechat {
                margin-left: 25px;

                .icon-classic-loading {
                    display: inline-block;
                    animation: rotate linear .5s infinite;
                }
            }
        }

        @keyframes rotate {
            0% {
                @include transform(rotate(0deg));
            }
            100% {
                @include transform(rotate(360deg));
            }
        }

        .create-user {
            margin-right: 16px;
        }

        .simplify-table {
            td {
                width: 150px;
            }
        }

        .table-head {
            overflow: hidden;

            tr {
                &:nth-child(1) {
                    border-bottom: 0;
                }
            }
        }

        .table-body {
            overflow: auto;
            height: 500px;
            .no-cursor {
                cursor: default;
            }
        }

        .list-show {
            width: calc(100% - 40px);
            padding: 0 20px;
            overflow: hidden;
            background: #fff;
        }
    }
</style>
