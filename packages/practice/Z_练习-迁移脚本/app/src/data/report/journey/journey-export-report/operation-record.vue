<template>
    <div class="operation-record">
        <button class="btn btn-md btn-white" @click="$emit('back')">{{'common.back' | t}}</button>
        <div class="simplify-table">
            <table>
                <thead>
                    <tr>
                        <th>{{'data.journey' | t}}</th>
                        <th>{{'journey.task' | t}}</th>
                        <th class="send-time">
                            {{'journey.sendTime' | t}}
                            <div class="filter" @mouseover="showFilterDate = true" @mouseleave="showFilterDate = false">
                                <i class="icon icon-shaixuan"></i>
                                <div class="filter-box" v-if="showFilterDate">
                                    <p class="filter-item" v-for="dateType in filterDateTypeList"
                                       :key="dateType.id" @click="filterDate(dateType.id)">{{dateType.name}}</p>
                                </div>
                            </div>
                        </th>
                        <th>{{'wechatContent.createTime' | t}}</th>
                        <th>{{'data.email' | t}}</th>
                        <th>{{'form.status' | t}}</th>
                        <th>{{'form.action' | t}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="!recordList.length && !loading">
                        <td colspan="7" class="empty">
                            <list-empty></list-empty>
                        </td>
                    </tr>
                    <tr v-if="loading">
                        <td colspan="7">
                            <inline-loading></inline-loading>
                        </td>
                    </tr>
                    <template>
                        <tr v-for="record in recordList" :key="record.id">
                            <td :title="record.journeyNames">{{record.journeyNames}}</td>
                            <td :title="record.taskNames">{{record.taskNames}}</td>
                            <td>{{dateTypeList.$getByKey(record.sendType).name}}</td>
                            <td :title="record.createDate">{{record.createDate}}</td>
                            <td :title="record.email">{{record.email}}</td>
                            <td v-if="record.status === 0">{{'journey.status.processing' | t}}</td>
                            <td v-else>{{'journeyList.completed' | t}}</td>
                            <td>
                                <button class="btn icon icon-search"
                                        @click="check(record.id)" v-title="$t('form.view')"></button>
                                <button v-if="record.status === 0 && record.sendType !== 0" class="btn icon icon-pause" @click="pause(record.id)"
                                        v-title="$t('data.stop')"></button>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
        <pager :total="pageTotal" :now="pageNo" @page="page"></pager>
        <modal :title="$t('contact.detail')" v-if="showDetail" @close="showDetail = false">
            <div class="form-field flex">
                <label class="label">{{'data.journey' | t}}</label>
                <p >{{recordDetail.journey}}</p>
            </div>
            <div class="form-field flex">
                <label class="label">{{'journey.task' | t}}</label>
                <p >{{recordDetail.tasks}}</p>
            </div>
            <div class="form-field flex">
                <label class="label">{{'data.spcIndex' | t}}</label>
                <p v-for="(index,cur) in recordDetail.index" :key="cur">
                    <span>{{index.field_name}}</span>
                    <span v-if="index.operation === 'belong'">{{'data.appertaining' | t}}</span>
                    <span v-else>{{'analysis.equal' | t}}</span>
                    <span>{{index.value}}</span>
                    <span>{{trsFiled(index.target).toString()}}</span>
                </p>
            </div>
            <div class="form-field flex">
                <label class="label">{{'massSend.sendTime' | t}}</label>
                <div>
                    <p v-if="recordDetail.sendTime.sendType === 0">{{'form.sendNow' | t}}</p>
                    <p v-if="recordDetail.sendTime.sendType === 1">
                        {{'form.timeSend' | t}} {{recordDetail.sendTime.pushDate}}
                    </p>
                    <div v-if="recordDetail.sendTime.sendType === 2">
                        <p>{{'form.periodSend' | t}}</p>
                        <p class="send-detail">
                            <span>{{'form.startTime' | t}} {{recordDetail.sendTime.pushDate}}</span>
                            <span>{{'newJourney.every' | t}}{{recordDetail.sendTime.repeatPeriodic}} {{'newJourney.day' | t}}</span>
                            <span>
                                {{'newJourney.ends' | t}}
                                <span v-if="recordDetail.sendTime.periodicSendType !== 3">
                                    <span v-if="recordDetail.sendTime.periodicSendType === 1">{{'common.noOfTimes' | t}}</span>
                                    <span v-else>{{'common.noOfDays' | t}}</span>
                                    <span>{{recordDetail.sendTime.periodicSendValue}}</span>
                                    <span v-if="recordDetail.sendTime.periodicSendType === 1">{{'visualization.times' | t}}</span>
                                    <span v-else>{{'time.day'}}</span>
                                    <span>{{'form.after' | t}}</span>
                                </span>
                                <span v-else>{{recordDetail.sendTime.periodicSendValue}}</span>
                            </span>
                        </p>
                    </div>
                </div>
            </div>
            <div class="form-field flex">
                <label class="label">{{'data.email' | t}}</label>
                <p >{{recordDetail.email}}</p>
            </div>
        </modal>
    </div>
</template>

<script>
    import { ContactApiV3 } from '@/api';
    import {customIndicatorField} from '../customIndicatorField';
    export default {
        name: 'operation-record',
        data() {
            return {
                // 记录列表
                recordList: [],
                pageTotal: 0,
                pageNo: 1,
                showDetail: false,
                recordDetail: {
                    journey: '',
                    tasks: '',
                    index: [],
                    sendTime: {
                        sendType: '',
                        pushDate: '',
                        repeatPeriodic: '',
                        periodicSendValue: '',
                        periodicSendType: ''
                    }
                },
                dateTypeList: [
                    {id: 0, name: this.$t('form.sendNow')},
                    {id: 2, name: this.$t('form.periodSend')},
                    {id: 1, name: this.$t('form.timeSend')},
                ],
                dateType: '',  //筛选的时间类型
                showFilterDate: false,  // 筛选时段显示隐藏
                loading: false
            };
        },
        mounted() {
            this.getRecordList();
        },
        props:{
            exportType :{
                type: Number,
            }
        },
        computed: {
            // 时间类型筛选
            filterDateTypeList() {
                this.dateTypeList.unshift({id: -100,name: this.$t('data.all')});
                return this.dateTypeList;
            }
        },
        methods: {
            // 获取记录列表
            getRecordList() {
                this.loading = true;
                ContactApiV3
                    .getRecordList({pageNumber: this.pageNo,search: '', exportType: this.exportType})
                    .then((res) =>{
                        this.loading = false;
                        this.recordList = res.body.data.logList;
                        this.pageTotal = res.body.data.totalPage;
                    });
            },
            // 查看
            check(id) {
                ContactApiV3
                    .getRecordDetail(id)
                    .then(({body:{data}}) =>{
                        this.showDetail = true;
                        this.recordDetail.index = data.conditionJson ? JSON.parse(data.conditionJson) : [];
                        this.recordDetail.sendTime = {
                            sendType: data.sendType,
                            pushDate: data.date,
                            repeatPeriodic: data.frequency,
                            periodicSendValue: data.endCount || data.endDate || data.endDay || '',
                            periodicSendType: data.endCount ? 1 : data.endDay ? 2 : data.endDate ? 3 : '',
                        };
                        this.recordDetail.email = data.email;
                        this.recordDetail.journey = this.recordList.$getByKey(id).journeyNames;
                        this.recordDetail.tasks = this.recordList.$getByKey(id).taskNames;
                    });
            },
            // 停止
            pause(id) {
                ContactApiV3
                    .exportPause(id)
                    .then(() =>{
                        this.pageNo = 1;
                        this.getRecordList();
                    });
            },
            // 翻页
            page(page) {
                this.pageNo = page;
                this.getRecordList();
            },
            trsFiled(filed) {
                let dataFiled = [];
                filed.forEach(arr =>{
                    dataFiled.push(customIndicatorField.$getByKey(arr).name);
                });
                return dataFiled;
            },
            // 筛选时间类型
            filterDate(id) {
                this.showFilterDate = false;
                this.dateType = id;
                this.pageNo = 1;
                this.getRecordList();
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .operation-record {
        width: 100%;
        .simplify-table {
            margin-top: 16px;
            height: 82%;
            overflow-y: auto;
            .empty {
                padding: 0;
            }
            .icon{
                padding: 0;
                font-size: 16px;
                cursor: pointer;
            }
            .icon-search {
                color: $green;
            }
            .icon-pause {
                color: $dark-red;
            }
            .send-time {
                overflow: visible;
            }
        }
        .send-detail {
            display: flex;
            flex-direction: column;
        }

        .filter {
            position: relative;
            display: inline-block;
            line-height: 38px;
            .filter-box {
                position: absolute;
                top: 33px;
                right: -37px;
                background: #fff;
                border: 1px solid #e0e5ea;
                @include box-sizing(border-box);
                @include border-radius(3px);
                padding: 5px 10px;
                p {
                    text-align: center;
                    line-height: 30px;
                    color: #999;
                    cursor: pointer;
                }
            }
        }
    }
</style>
