<template>
    <div class="dmartech-home">
        <div class="content-view">
            <crumbs/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'home.home' | t}}</h1>
                <date-range class="pull-right" :start="startDate" :end="endDate" @change="pickDate"></date-range>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view margin" v-if="user.companyType !== 1">
                <ul class="title-summary">
                    <!--订单量-->
                    <li>
                        <p class="number">{{summary.amount.toLocaleString()}}</p>
                        <p class="text" :tip="$t('data.oneDayDelay')">{{'home.orders' | t}}</p>
                        <img src="./order_1.png" alt="order">
                    </li>
                    <!--订单金额-->
                    <li>
                        <p class="number"><span>￥</span>{{summary.order.toLocaleString()}}</p>
                        <p class="text" :tip="$t('data.oneDayDelay')">{{'home.orderAmount' | t}}</p>
                        <img src="./amount_1.png" alt="amount">
                    </li>
                    <!--平均客单价-->
                    <li>
                        <p class="number"><span>￥</span>{{summary.unitPrice.toLocaleString()}}</p>
                        <p class="text" :tip="$t('data.oneDayDelay')">{{'home.avgPricePerCustomer' | t}}</p>
                        <img src="./unit-price_1.png" alt="unit-price">
                    </li>
                    <!--新增会员-->
                    <li>
                        <p class="number">{{summary.newMembers.toLocaleString()}}</p>
                        <p class="text" :tip="$t('data.oneDayDelay')">{{'home.newMembers' | t}}</p>
                        <img src="./new-member_1.png" alt="new-member">
                    </li>
                    <!--新增粉丝-->
                    <li>
                        <p class="number">{{summary.newFans.toLocaleString()}}</p>
                        <p class="text" :tip="$t('data.oneDayDelay')">{{'home.newFollowers' | t}}</p>
                        <img src="./new-fan_1.png" alt="new-fan">
                    </li>
                </ul>
                <!--订单成交量-->
                <diagram class="offline-diagram" ref="offlineDiagram" :diagramData="offlineOrderDiagram"></diagram>
                <!--非会员、会员、粉丝发展趋势-->
                <diagram class="fans-diagram" ref="fansDiagram" :diagramData="fansDiagram"></diagram>
                <div class="market-order">
                    <!--多渠道营销-->
                    <diagram class="market-diagram" ref="marketDiagram" :diagramData="marketDiagram"></diagram>
                    <!--订单转化营销旅程排名-->
                    <div class="order-rank">
                        <h2>{{'home.convertRank' | t}}</h2>
                        <p class="disabled-text">{{'data.oneDayDelay' | t}}</p>
                        <table class="order-table">
                            <thead>
                            <tr>
                                <th>{{'home.journey' | t}}</th>
                                <th>{{'home.orders' | t}}</th>
                                <th>{{'home.orderAmount' | t}}</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="order in orderRankData">
                                <td :class="order.journeyId ? 'theme-text' : 'light-content-text'">{{order.name}}</td>
                                <td>{{order.count.toLocaleString()}}</td>
                                <td>￥{{order.money.toLocaleString()}}</td>
                            </tr>
                            </tbody>
                        </table>
                        <div class="open-journey">
                            <button class="journey-btn btn btn-lg btn-round btn-theme" type="button"
                                    :disabled="$has('homepage_journey')"
                                    @click="createJourney">
                                {{'home.createJourney' | t}}
                            </button>
                            <router-link class="pull-right see-more" :to="{name: 'journeyReport'}">
                                {{'home.moreMarketingReports' | t}}
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
            <!--华为定制首页-->
            <div v-else class="content-view margin white-bg padding huawei-home">
                <h4>{{'home.customerOverview' | t}}</h4>
                <ul class="new-customer-overview">
                    <li v-for="customer in customerOverview" :key="customer.id">
                        <span class="customer-type-name">{{customer.type}}</span>
                        <h2>{{customer.num}}</h2>
                        <span class="disabled-text">{{'data.realTime' | t}}</span>
                    </li>
                </ul>
                <h4>{{'home.customerOverview' | t}}</h4>
                <diagram class="customer-overview" ref="customerDiagram"
                         :diagram-data="customerOverviewDiagram"></diagram>
            </div>
        </div>
        <!--账号过期时间提示-->
        <modal class="expire-tip" v-if="showExpire" :title="$t('common.accountExpire')" @close="showExpire = false">
            <svg aria-hidden="true" class="expire-tip-icon">
                <use xlink:href="#icon-warn"></use>
            </svg>
            <p>{{'common.accountExpireA' | t}}{{validTime}}</p>
            <p v-if="isAdmin">{{'common.accountExpireB' | t}}</p>
            <p v-else>{{'common.accountExpireSub' | t}}</p>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.ok')" @click="showExpire = false"/>
            </template>
        </modal>

        <!-- 登录账号不属于华为EBG 提醒 -->
        <modal v-if="loginErrTip" :title="$t('home.functionDisabled')" @close="loginErrTip = false">
            {{'home.loginErr' | t}}
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme" @click="loginErrTip = false"
                       :value="$t('wechatAccount.gotIt')">
            </template>
        </modal>
    </div>
</template>
<script type="text/ecmascript-6">
    // 首页
    import { ScrmApiV1, JourneyApiV1 } from '@/api';
    import diagram from '../../common/components/diagram/diagram.vue';
    import subDays from 'date-fns/sub_days';
    import format from 'date-fns/format';
    import addDays from 'date-fns/add_days';
    import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
    import {fansDiagram, marketDiagram, offlineOrderDiagram, customerDiagram} from './index-diagram-data';
    import {getDateInstance} from '@/common/utils/dateUtils';
    import { mapState } from 'vuex';

    const ENV = process.env.NODE_ENV;
    // 华为账号导出oss
    const HWExportType = localStorage.getItem('HW_EXPORT_TYPE');// 华为oss下载type
    const HWExportUuid = localStorage.getItem('HW_EXPORT_UUID');// 华为oss下载uuid

    export default {
        data() {
            return {
                // 本页中所有的today均为昨天的日期(当天没有数据)。
                today: format(subDays(new Date(), 1), 'YYYY-MM-DD'),
                endDate: '', // 结束日期
                startDate: '', // 开始日期
                summary: {
                    amount: 0,     // 订单量
                    order: 0,      // 订单金额
                    unitPrice: 0,  // 平均客单价
                    newMembers: 0, // 新增会员
                    newFans: 0     // 新增粉丝
                },
                offlineOrderDiagram: {}, // 订单成交量 图表
                fansDiagram: {},        // 非会员、会员、粉丝发展趋势 图表
                marketDiagram: {},      // 多渠道营销 图表
                orderRankData: [],      // 订单转化营销旅程 数据

                // 华为定制首页
                customerOverview: [
                    {
                        type: this.$t('home.realNameCustomer'), num: 0, id: 'customerName'
                    },
                    {
                        type: this.$t('home.anonymousCustomer'), num: 0, id: 'customerNotName'
                    },
                    {
                        type: this.$t('home.WeChatFansCustomer'), num: 0, id: 'fansCount'
                    },
                    {
                        type: this.$t('home.allCustomers'), num: 0, id: 'customerCount'
                    }
                ],
                // 新增联系人概览
                customerOverviewDiagram: {},  // 新增联系人概览图表信息
                showExpire: false,      // 账号过期时间提示是否显示
                validTime: '',          // 账号过期时间

                loginErrTip: false, // 登录账号不属于华为EBG
            };
        },
        created() {
            //区分普通用户和华为用户 companyType：华为用户1  普通用户0
            if (this.user.companyType !== 1) {
                this.offlineOrderDiagram = offlineOrderDiagram();
                this.fansDiagram = fansDiagram();
                this.marketDiagram = marketDiagram();
            } else {
                this.customerOverviewDiagram = customerDiagram();
            }

            // 华为oss导出
            this.hwOss();
        },
        computed: {
            ...mapState(['user']),
            // 是否为主账号
            isAdmin() {
                this.user.roleId === 0 || this.user.roleId === '';
            },
            user() {
                return this.$store.state.user;
            },
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            }
        },
        mounted() {
            // 首页的上线时间改为用户开始使用的时间（所有用户）
            let start = format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
            // 页面默认显示一周的数据
            if (this.user.companyType !== 1) {
                this.pickDate({
                    start: start,
                    end: this.today
                });
            } else {
                this.startDate = start;
                this.endDate = this.today;
                this.getCustomerOverview();
                this.getCustomerDataTrend();
            }

            // 账号过期时间提示
            if (this.user.validTime) {
                this.validTime = this.user.validTime;
                let limitTime = new Date(this.validTime).getTime() - new Date().getTime();
                let todayNotice = localStorage.getItem('TODAY_VALIDTIME_NOTICE' + this.user.id) ?
                    localStorage.getItem('TODAY_VALIDTIME_NOTICE' + this.user.id)
                        .toString() : '';
                let today = new Date().getDate()
                    .toString();
                if (todayNotice !== today && (limitTime === 30 || limitTime <= 15 * 24 * 60 * 60 * 1000)) {
                    this.showExpire = true;
                    localStorage.setItem('TODAY_VALIDTIME_NOTICE' + this.user.id, new Date().getDate());
                }
            }

            //华为埋码-DMARTECH平台首页
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P12031996D69986');
            }
        },
        methods: {
            // 快速开启旅程
            createJourney() {
                this.$router.push({name: 'draggableJourney', params: {id: 0, groupId: ''}});
            },
            // ajax: 数据纵览(第一个时间是结束)
            getTotalSummary() {
                ScrmApiV1
                    .dataSummary(this.endDate, this.startDate)
                    .then(({body: {data: {newMemberCount, newFansCount, perMoney, saleTotalCount, saleTotalMoney}}}) => {
                        this.summary.amount = saleTotalCount;
                        this.summary.order = saleTotalMoney;
                        this.summary.unitPrice = perMoney;
                        this.summary.newMembers = newMemberCount;
                        this.summary.newFans = newFansCount;
                    });
            },
            // ajax: 线下订单成交量(第一个是图，第二个是侧边)
            getOfflineOrderDiagram() {
                ScrmApiV1
                    .offlineOrderDiagram(this.endDate, this.startDate)
                    .then((res) => {
                        this.setOfflineOrderDiagram(res);
                        this.offlineOrderDiagram.echatOption.xAxis.data = this.computeXaxisTime();
                        this.refreshDiagram();
                    });
            },
            getOfflineOrderSide() {
                ScrmApiV1
                    .offlineOrderSide(this.endDate, this.startDate)
                    .then(({body: {data: {totalMoney, totalSCRMCount, transformProportion}}}) => {
                        this.offlineOrderDiagram.diagramSummary.summary[0].number = totalSCRMCount;
                        this.offlineOrderDiagram.diagramSummary.summary[1].number = totalMoney;
                        this.offlineOrderDiagram.diagramSummary.summary[2].number = transformProportion;
                    });
            },
            // ajax: 会员、非会员、粉丝发展趋势(第一个是图，第二个是侧边)
            getcustomerTrendDiagram() {
                let type = 0; // 接口类型-首页
                ScrmApiV1
                    .customerTrendDiagram(this.endDate, this.startDate, type)
                    .then((res) => {
                        this.setfansDiagram(res);
                        this.fansDiagram.echatOption.xAxis.data = this.computeXaxisTime();
                        this.refreshDiagram();
                    });
            },
            getcustomerTrendSide() {
                ScrmApiV1
                    .customerTrendSide(this.endDate, this.startDate)
                    .then(({body: {data: {mailProportion, mobileProportion, wechatProportion}}}) => {
                        this.fansDiagram.diagramSummary.summary[0].number = mailProportion;
                        this.fansDiagram.diagramSummary.summary[1].number = mobileProportion;
                        this.fansDiagram.diagramSummary.summary[2].number = wechatProportion;
                    });
            },

            // ajax: 多渠道营销
            getMarketing() {
                ScrmApiV1
                    .marketing(this.endDate, this.startDate)
                    .then((res) => {
                        this.setMarketDiagram(res);
                        this.marketDiagram.echatOption.xAxis.data = this.computeXaxisTime();
                        this.refreshDiagram();
                    });
            },

            // ajax: 第一个订单转化活动排名, 第二个是去journey根据id拿到name
            getOrderRank() {
                ScrmApiV1
                    .orderRank(this.endDate, this.startDate)
                    .then(({body: {data: {mapList}}}) => {
                        this.orderRankData = mapList.map(order => Object.assign(order, {name: this.$t('common.noData')}))
                            .concat((new Array(5 - mapList.length)).fill({
                                journeyId: 0,
                                name: this.$t('common.noData'),
                                count: 0,
                                money: 0
                            }));
                        this.getOrderRankName();
                    });
            },
            getOrderRankName() {
                this.orderRankData.forEach(order => {
                    if (order.journeyId) {
                        JourneyApiV1
                            .getJourney(parseInt(order.journeyId))
                            .then(({body: {data: {journey}}}) => {
                                order.name = journey.journeyName;
                            });

                    }
                });
            },
            /**
             * 选择时间
             * @param start 开始时间
             * @param end   结束时间
             */
            pickDate({start, end}) {
                this.startDate = start;
                this.endDate = end;

                if (this.user.companyType !== 1) {
                    this.loadingDiagram();
                    this.getTotalSummary();
                    this.getOfflineOrderDiagram();
                    this.getOfflineOrderSide();
                    this.getcustomerTrendDiagram();
                    this.getcustomerTrendSide();
                    this.getMarketing();
                    this.getOrderRank();
                } else {
                    this.getCustomerOverview();
                    this.getCustomerDataTrend();
                }
            },

            // echats操作, 设置每个图的x轴坐标
            computeXaxisTime() {
                let start = getDateInstance(this.startDate);
                let end = getDateInstance(this.endDate);
                let dayDiff = differenceInCalendarDays(end, start);
                let xAxisData = [];
                for (let i = 0; i <= dayDiff; i++) {
                    xAxisData[i] = format(addDays(start, i), 'MM-DD');
                }
                return xAxisData;
            },
            // 使echat进入loading
            loadingDiagram() {
                this.$refs.offlineDiagram.$emit('clearEchats');
                this.$refs.fansDiagram.$emit('clearEchats');
                this.$refs.marketDiagram.$emit('clearEchats');
            },

            // 刷新echat图
            refreshDiagram() {
                this.$refs.offlineDiagram.$emit('setEchats');
                this.$refs.fansDiagram.$emit('setEchats');
                this.$refs.marketDiagram.$emit('setEchats');
            },

            // echats操作, 设置每天数据 , 在获取ajax后调用
            setOfflineOrderDiagram(response) {
                this.offlineOrderDiagram.echatOption.series[0].data = response.body.data.totalCountList;
                this.offlineOrderDiagram.echatOption.series[1].data = response.body.data.mailCountList;
                this.offlineOrderDiagram.echatOption.series[2].data = response.body.data.smsCountList;
                this.offlineOrderDiagram.echatOption.series[3].data = response.body.data.wechatCountList;
            },
            setfansDiagram(response) {
                this.fansDiagram.echatOption.series[0].data = response.body.data.customerCountList;
                this.fansDiagram.echatOption.series[1].data = response.body.data.mobileCountList;
                this.fansDiagram.echatOption.series[2].data = response.body.data.wechatCountList;
                this.fansDiagram.echatOption.series[3].data = response.body.data.mailCountList;
            },
            setMarketDiagram(response) {
                this.marketDiagram.echatOption.series[0].data = response.body.data.moneyList;
                this.marketDiagram.echatOption.series[1].data = response.body.data.SCRMCountList;
            },

            // ajax 新增数据变化趋势
            getCustomerDataTrend() {
                this.$refs.customerDiagram.$emit('clearEchats');

                this.customerOverviewDiagram.echatOption.xAxis.data = this.computeXaxisTime();

                ScrmApiV1
                    .contactTrend(this.endDate, this.startDate)
                    .then(res => {
                        let result = res.body.data;
                        this.customerOverviewDiagram.echatOption.series[0].data = result.customerNameList;
                        this.customerOverviewDiagram.echatOption.series[1].data = result.customerNotNameList;
                        this.customerOverviewDiagram.echatOption.series[2].data = result.fansCountList;
                        this.customerOverviewDiagram.echatOption.series[3].data = result.customerCountList;
                        this.$refs.customerDiagram.$emit('setEchats');
                    });
            },
            // ajax 新增数据概览
            getCustomerOverview() {
                ScrmApiV1
                    .concatIncreaseOverview(this.endDate, this.startDate)
                    .then(res => {
                        let result = res.body.data;
                        for (let keys in result) {
                            let i = this.customerOverview.findIndex(overview => overview.id === keys);
                            this.customerOverview[i].num = result[keys];
                        }
                    });
            },
            // 华为oss导出
            hwOss() {
                // 已登录的非华为账号
                if (this.$route.params.come === 'hwOss') this.loginErrTip = true;

                // 本地缓存无type、uuid
                if (!HWExportType || !HWExportUuid) return;

                switch (ENV) {
                    case 'development':
                    case 'beta':
                        if (this.user.companyType === 1 && this.user.cid === 381) {
                            let {href} = this.$router.resolve({
                                name: 'exportoss',
                                query: {type: HWExportType, uuid: HWExportUuid}
                            });
                            window.open(href, '_self');
                        } else {
                            this.loginErrTip = true;
                        }
                        localStorage.setItem('HW_EXPORT_TYPE', '');
                        localStorage.setItem('HW_EXPORT_UUID', '');
                        break;
                    case 'production':
                        // cid=471为生产环境内部测试用
                        if (this.user.companyType === 1 && (this.user.cid === 1260 || this.user.cid === 471)) {
                            let {href} = this.$router.resolve({
                                name: 'exportoss',
                                query: {type: HWExportType, uuid: HWExportUuid}
                            });
                            window.open(href, '_self');
                        } else {
                            this.loginErrTip = true;
                        }
                        localStorage.setItem('HW_EXPORT_TYPE', '');
                        localStorage.setItem('HW_EXPORT_UUID', '');
                        break;
                }
            }
        },
        components: {diagram}
    };
</script>
<style lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .dmartech-home {

        .title-summary {
            display: flex;
            justify-content: space-between;

            li {
                position: relative;
                flex: 1 1 200px;
                margin: 0 12px;
                border-radius: 4px;
                overflow: hidden;

                &:nth-of-type(1) {
                    margin-left: 0;
                }

                &:nth-last-of-type(1) {
                    margin-right: 0;
                }

                img {
                    display: block;
                    width: 100%;
                    height: auto;
                }

                .number {
                    position: absolute;
                    right: 10%;
                    top: 18%;
                    text-align: right;
                    color: white;
                    @include summary-media();

                    span {
                        font-size: 20px;
                    }
                }

                .text {
                    position: absolute;
                    right: 10%;
                    top: 55%;
                    text-align: right;
                    font-size: 16px;
                    color: white;

                    &:after {
                        display: block;
                        content: attr(tip);
                        font-size: 12px;
                        color: $disabled;
                    }
                }
            }
        }

        .offline-diagram,
        .fans-diagram,
        .market-order {
            margin: 24px auto 0;
            overflow: hidden;

            .market-diagram {
                float: left;
                height: 100%;
                width: 68%;
                margin-right: 2%;
            }

            .order-rank {
                position: relative;
                float: left;
                box-sizing: border-box;
                padding: 20px 15px;
                width: 30%;
                height: 100%;
                background: white;

                h2 {
                    font-size: 14px;
                    color: $color-content;
                }

                .order-table {
                    width: 100%;
                    margin-top: 16px;
                    max-height: 270px;

                    th {
                        border-bottom: 1px solid $border-color;
                        line-height: 40px;
                        background-color: $title-bg;
                    }

                    td {
                        text-align: center;
                        border-bottom: 1px solid $border-color;
                        line-height: $input-field-height;
                    }
                }

                .open-journey {
                    @include clearfix();

                    .journey-btn {
                        display: block;
                        width: 60%;
                        margin: 16px auto;
                        @include box-shadow(0 0 3px rgba($theme, .8));
                        @include linear-gradient(to right, $theme, #17f9a8);
                        @include linear-gradient(to right, $theme, #17f9a8);
                        @include transition();

                        &:hover {
                            @include box-shadow(0 0 3px rgba($theme, .2));
                        }
                    }

                    .see-more {
                        text-align: right;
                        color: $theme;
                        text-decoration: underline;

                        &:hover {
                            color: $light-theme;
                        }

                        &:active {
                            color: $dark-theme;
                        }
                    }
                }
            }
        }

        .huawei-home {
            h4 {
                font-size: 14px;
            }

            .new-customer-overview {
                display: flex;
                justify-content: space-between;
                padding: 0 50px;

                li {
                    display: flex;
                    flex-direction: column;
                    align-items: center;

                    .customer-type-name {
                        font-size: 15px;
                    }

                    h2 {
                        margin: 8px 0;
                    }
                }
            }
        }

        .expire-tip {
            p {
                font-size: 14px;
                line-height: 32px;
                padding: 0 15px;
                word-break: normal;
            }

            .modal {
                position: relative;
                width: 524px;

                .modal-head {
                    padding-left: 45px;
                }

                .expire-tip-icon {
                    display: inline-block;
                    width: 24px;
                    height: 24px;
                    fill: $theme;
                    position: absolute;
                    top: 11px;
                    left: 25px;
                }
            }
        }
    }
</style>
