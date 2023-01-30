<template>
    <div class="summary">
        <div class="form-field">
            <label class="label title">导出至CSV文件</label>
        </div>
        <div class="form-field flex">
            <label class="label">时间范围</label>
            <date-range :start="startDate" :end="endDate" :partCuts="['LAST_WEEK','LAST_30_DAYS']" @change="getDate"></date-range>
            <ul class="date-area">
                <li v-for="date in dateAreaList" :key="date"
                    :class="{active: currentItems === date}"
                    @click="chooseDate(date)" class="date-item">
                    {{date}}<span class="cut-line" v-if="date !== '30天'">|</span>
                </li>
            </ul>
        </div>
        <div class="form-field">
            <label class="label">统计类型</label>
            <selector :options="summaryTypeList" v-model="summaryType"></selector>
        </div>
        <div class="form-field">
            <label class="label">是否显示API</label>
            <checkbox v-model="showAPI"></checkbox>
        </div>
        <div class="form-field">
            <label class="label"></label>
            <button class="btn btn-theme btn-md" @click="search">查询</button>
        </div>
        <div v-show="showSummary" class="result-box">
            <div class="form-field">
                <label class="label title">查询结果</label>
            </div>
            <div class="form-field">
                <label class="label">文件格式</label>
                <radio :source="'GB2312'" v-model="exportDocumentType">GB2312</radio>
                <radio :source="'UTF-8'" v-model="exportDocumentType">UTF-8</radio>
            </div>
            <div class="form-field">
                <label class="label">收件邮箱</label>
                <input type="text" class="input" :placeholder="'请填写导出文件收件邮箱地址'" maxlength="50" v-model.trim="exportEmail">
                <button class="btn btn-theme btn-md btn-export" @click="exportReport">导出</button>
            </div>
            <!--各月（周/日）总发送量列表-->
            <div class="simplify-table">
                <table class="m-table center" v-if="totalList.length !== 0">
                    <thead>
                        <tr>
                            <th>日期</th>
                        </tr>
                        <tr>
                            <th>{{totalSend}}</th>
                        </tr>
                    </thead>
                    <tbody v-for="item in totalList">
                        <tr>
                            <td>{{item.datetime}}</td>
                        </tr>
                        <tr>
                            <td>{{item.sendCount}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!--各个签名各月（周/日）发送量列表-->
            <div class="simplify-table">
                <table class="center" v-if="summaryList.length !== 0">
                    <thead>
                        <tr>
                            <th width="10%">ID</th>
                            <th width="10%">license</th>
                            <th width="10%">汇总</th>
                            <th width="15%">签名</th>
                            <!-- 每月统计 -->
                            <th v-for="column in summaryList">{{column.datetime}}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, rowIdx) in summaryList[0].sendList">
                            <td>{{(rowIdx + 1)}}</td>
                            <td>{{companyName}}</td>
                            <td>{{_getTotal(rowIdx)}}</td>
                            <td>{{row.sendoutName}}</td>
                            <!-- 每月统计 -->
                            <td v-for="item in summaryList">{{item.sendList[rowIdx].sendCount}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-show="!summaryList.length && !summaryLoading" class="m-page-error text-center">
                <b class="i i-exclamation-triangle"></b>
                未查询到相关数据！请重新查询！
            </div>
            <!--动态图表-->
            <div class="percentChart">
                <p class="head text-center">Top 10 Licenses</p>
                <div class="report-chart">
                    <div class="chart" style="width: 800px;height:400px;" ref="charts"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { SmsApi } from '@/api';
    import echarts from 'echarts';
    import {format,subDays} from 'date-fns';
    import {EMAIL_ADDRESS_REGEXP} from '../../../../common/utils/regs';
    import 'echarts/lib/chart/line';
    import 'echarts/lib/component/tooltip';
    import 'echarts/lib/component/legend';
    export default {
        name: 'send-summary',
        data() {
            return {
                startDate: '',
                endDate: '',
                dateAreaList: ['7天','14天','30天'],
                currentItems: '',
                summaryTypeList: [
                    {id: 0,name: '月'},
                    {id: 1,name: '日'},
                    {id: 2,name: '周'}
                ],
                summaryType: 0,
                showAPI: false,
                myChart: '',
                option: '',
                showSummary: false,
                totalList: [],
                summaryList: [],
                summaryLoading: false,
                // 导出格式
                exportDocumentType: 'GB2312',
                exportEmail: '',
            };
        },
        computed: {
            totalSend() {
                return this.totalList.reduce((total,elm) =>{ return total + elm.sendCount},0);
            },
            companyName() {
                return this.$store.state.user.userName;
            }
        },
        mounted() {
            this.myChart = echarts.init(this.$refs.charts);
            this.option = {
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    bottom: 'bottom',
                    data: []
                },
                grid: {
                    left: '3%',
                    // right: '4%',
                    containLabel: true,
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    },
                    right: '2%'
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: [],
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: '回收记录',
                        type: 'line',
                        stack: '总量',
                        data: []
                    },
                ]
            };
        },
        methods: {
            getDate(date) {
                this.startDate = date.start;
                this.endDate = date.end;
            },
            chooseDate(date) {
                this.currentItems = date;
                this.endDate = format(new Date(),'YYYY-MM-DD');
                switch (date) {
                    case '7天': this.startDate = format(subDays(this.endDate,6),'YYYY-MM-DD');
                        break;
                    case '14天': this.startDate = format(subDays(this.endDate,13),'YYYY-MM-DD');
                        break;
                    case '30天': this.startDate = format(subDays(this.endDate,29),'YYYY-MM-DD');
                }
            },
            exportReport() {
                if (!EMAIL_ADDRESS_REGEXP.test(this.exportEmail)) {
                    return this.$toast('请输入正确的邮箱','warn');
                }
            },
            // 展示数据时，计算每行的发送总量
            _getTotal(rowIdx) {
                // 两组统计的sendCount不一样,相加为总的sendCound;
                let sum = 0;
                for (let i = 0; i < this.summaryList.length; i++) {
                    sum += this.summaryList[i].sendList[rowIdx].sendCount;
                }
                return sum;
            },
            search() {
                if (!this.startDate || !this.endDate) {
                    return this.$toast(this.$t('data.refineData'),'warn');
                }
                this.getSummary();
            },
            getSummary() {
                let postData = {
                    createId: this.$store.state.user.id,
                    endDate: this.endDate,
                    groupBy: 0,
                    isApi: this.showAPI ? 1 : 0,
                    sms: 0,
                    startDate: this.startDate,
                    type: this.summaryType
                };
                SmsApi
                    .getSummaryList(postData)
                    .then(res =>{
                        this.summaryList = res.body.data.summaryList;
                        this.totalList = res.body.data.totalSummaryList;
                        this.showSummary = true;
                        this.option.xAxis.data = this.totalList.map(elm => elm.datetime);
                        let series = this.summaryList[0].sendList.map(elm =>{
                            return {
                                name: elm.sendoutName,
                                type: 'line',
                                data: this.summaryList.map(summary => {
                                    return summary.sendList.filter(
                                        send => send.sendoutName === elm.sendoutName
                                    )[0].sendCount;
                                })
                            };
                        });
                        Object.assign(this.option.series,series);
                        this.myChart.setOption(this.option, true);
                    });
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .summary {
        margin-top: 15px;
        width: calc(100% - 120px);
        .date-area {
            cursor: pointer;
            display: flex;
            li {
                padding: 0 10px;
            }
            .cut-line {
                margin-left: 5px;
            }
        }
        .active {
            color: $green;
        }
        .result-box {
            .text-center {
                text-align: center;
            }
            .btn-export {
                margin-left: 15px;
            }
            .m-page-error {
                margin: 15px 0;
            }
        }
        .percentChart {
            max-width: 1000px;
            margin-left: 114px;
            .head {
                margin: 15px 0;
            }
        }
        .simplify-table {
            max-width: 1000px;
            margin-left: 114px;
            overflow: hidden;
            overflow-x: visible;
            table {
                width: auto;
                tr {
                    td,th {
                        text-align: center;
                    }
                }
            }
        }
        .m-table {
            margin: 25px 0;
            thead {
                display: inline-block;
            }
            tbody {
                display: inline-block;
            }
            tr {
                td {
                    border-right: 1px solid #e0e5ea;
                    @include box-sizing(border-box);
                }
            }
        }
    }
</style>
