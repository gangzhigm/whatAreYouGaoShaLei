<template>
    <div class="huawei-customed">
        <div class="page-head">
            <div class="content-view">
                <h1>{{'home.home' | t}}</h1>
                <date-range class="pull-right" :start="startDate" :end="endDate" @change="pickDate"></date-range>
            </div>
        </div>
        <div class="page-content">
            <!--华为定制首页-->
            <div class="content-view margin white-bg padding huawei-home">
                <h4>{{'home.customerOverview' | t}}</h4>
                <ul class="new-customer-overview">
                    <li v-for="customer in customerOverview" :key="customer.id">
                        <span class="customer-type-name">{{customer.type}}</span>
                        <h2>{{customer.num}}</h2>
                        <span class="disabled-text">{{'data.realTime' | t}}</span>
                    </li>
                </ul>
                <h4>{{'home.customerOverview' | t}}</h4>
                <diagram class="customer-overview" ref="customerDiagram" :diagram-data="customerOverviewDiagram">
                </diagram>
            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
import { ScrmApiV1 } from '@/api';
import { customerDiagram } from '../index-diagram-data';
import diagram from '@/common/components/diagram/diagram.vue';
import { getDateInstance } from '@/common/utils/dateUtils';
import addDays from 'date-fns/add_days';
import subDays from 'date-fns/sub_days';
import format from 'date-fns/format';
import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';


export default {
    name: 'HuaweiCustomed',
    data () {
        return {
            // 华为定制首页
            endDate: '', // 结束日期
            startDate: '', // 开始日期
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
            ],// 新增联系人概览
            customerOverviewDiagram: {},  // 新增联系人概览图表信息
        };
    },
    computed: {
        user () {
            return this.$store.state.user;
        }
    },
    watch: {},
    created () {
        this.customerOverviewDiagram = customerDiagram();
    },
    mounted () {
        if (this.user.companyType === 1) {
            // 首页的上线时间改为用户开始使用的时间
            const start = format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
            // 本页中所有的today均为昨天的日期(当天没有数据)。
            const today = format(subDays(new Date(), 1), 'YYYY-MM-DD');
            this.startDate = start;
            this.endDate = today;
            this.getCustomerOverview();
            this.getCustomerDataTrend();
        }
    },
    methods: {
        /**
         * 时间选择 - 华为专用
         * @param start 开始时间
         * @param end   结束时间
         */
        pickDate ({ start, end }) {
            this.startDate = start;
            this.endDate = end;
            this.getCustomerOverview();
            this.getCustomerDataTrend();
        },
        /**
         * 获取用户概览 - 华为专用
         */
        getCustomerOverview () {
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
        /**
         * 获取新增数据变化趋势 - 华为专用
         */
        getCustomerDataTrend () {
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

        /**
         * echats操作, 设置每个图的x轴坐标 - 华为专用
         */
        computeXaxisTime () {
            let start = getDateInstance(this.startDate);
            let end = getDateInstance(this.endDate);
            let dayDiff = differenceInCalendarDays(end, start);
            let xAxisData = [];
            for (let i = 0; i <= dayDiff; i++) {
                xAxisData[i] = format(addDays(start, i), 'MM-DD');
            }
            return xAxisData;
        },
    },
    components: { diagram }
};
</script>

<style lang="scss">
.huawei-customed {
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
}
</style>