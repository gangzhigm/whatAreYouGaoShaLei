<template>
    <!--华为定制 邮件定时任务 操作记录-->
    <div class="hawei-operation-record">
        <button class="btn btn-md btn-white" @click="$emit('back')">{{'common.back' | t}}</button>
        <div class="simplify-table">
            <table>
                <thead>
                    <tr>
                        <th v-for="(title,index) in recordHeader" :key="index">{{title}}</th>
                    </tr>
                </thead>
                <tbody>
                <tr v-if="!recordList.length && !loading">
                    <td colspan="8" class="empty">
                        <list-empty></list-empty>
                    </td>
                </tr>
                <tr v-if="loading">
                    <td colspan="8">
                        <inline-loading></inline-loading>
                    </td>
                </tr>
                <template>
                    <tr v-for="record in recordList" :key="record.id">
                        <td :title="record.journeyKeywords">{{record.journeyKeywords || '/'}}</td>
                        <td :title="record.topicTagKeywords">{{record.topicTagKeywords || '/'}}</td>
                        <td :title="record.journeyNames">{{record.journeyNames || '/'}}</td>
                        <td :title="record.taskNames">{{record.taskNames || '/'}}</td>
                        <td :title="record.createDate">{{record.createDate}}</td>
                        <td :title="record.email">{{record.email}}</td>
                        <td v-if="record.status === 0">{{'journey.status.processing' | t}}</td>
                        <td v-else>{{'journeyList.completed' | t}}</td>
                        <td>
                            <button class="btn icon icon-search" v-title="$t('form.view')" @click="viewRecord(record,1)"></button>
                            <button v-if="record.status === 0" class="btn icon icon-pause" @click="pause(record.id)"
                                    v-title="$t('data.stop')"></button>
                            <button class="btn icon icon-copy" :title="$t('data.log')" @click="viewRecord(record,2)">
                            </button>
                        </td>
                    </tr>
                </template>
                </tbody>
            </table>
        </div>
        <pager :total="pageTotal" :now="pageNo" @page="page"></pager>
        <!--查看详情-->
        <modal :title="$t('contact.detail')" v-if="showView" @close="showView=false">
            <div>
                <div class="form-field flex">
                    <label class="label">{{'data.journeyNameKeyword' | t}}</label>
                    <p>{{recordDetail.journeyKeywords || '/'}}</p>
                </div>
                <div class="form-field flex">
                    <label class="label">{{$t('data.topicTag')}}</label>
                    <p v-text="">{{recordDetail.topicTagKeywords || '/'}}</p>
                </div>
                <div class="form-field flex">
                    <label class="label">{{'data.journey' | t}}</label>
                    <p >{{recordDetail.journeyNames || '/'}}</p>
                </div>
                <div class="form-field flex">
                    <label class="label">{{'journey.email' | t}}</label>
                    <p >{{recordDetail.taskNames || '/'}}</p>
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
            </div>
        </modal>
        <!--查看日志-->
        <modal :title="$t('data.log')" size="lg" v-if="logFlag" @close="logFlag=false" class="view-log-modal">
            <div>
                <div class="simplify-table view-log">
                    <table>
                        <thead>
                        <tr>
                            <td>{{'data.Journeys' | t}}</td>
                            <td>{{'data.logEmailTitle' | t}}</td>
                            <td>{{'data.exportTime' | t}}</td>
                            <td></td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(log, index) in logEvents">
                            <td :class="{'tdExpand':log.expand}">{{log.journeyName}}</td>
                            <td :class="{'tdExpand':log.expand}">{{log.taskName}}</td>
                            <td>{{log.exportTime}}</td>
                            <td>
                                <div class="arrow-btn" :class="{'active':log.expand}" @click="log.expand=!log.expand">
                                    <i class="icon icon-arrow-down"></i>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <pager :total="logTotal" :now="logPageNow" @page="handleLogPage"/>
            </div>
        </modal>
    </div>
</template>

<script>
    import { ContactApiV3, ContactExportApiV3 } from '@/api';
    import {customIndicatorField} from '../customIndicatorField';
    // import $ from 'jquery';

    export default {
        name: 'hawei-operation-record',
        data() {
            return {
                pageTotal: 0,
                pageNo: 1,
                recordHeader:[
                    this.$t('data.journeyNameKeyword'),
                    this.$t('data.topicTag'),
                    this.$t('data.Journeys'),
                    this.$t('journey.task'),
                    this.$t('wechatContent.createTime'),
                    this.$t('data.email'),
                    this.$t('form.status'),
                    this.$t('form.action')
                ],//列表title list
                recordList:[],//记录列表
                loading: false,

                showView: false,//查看弹窗
                recordDetail:{
                    journeyKeywords:'',
                    topicTagKeywords:'',
                    journeyNames: '',
                    taskNames: '',
                    index: [],
                    sendTime: {
                        sendType: '',
                        pushDate: '',
                        repeatPeriodic: '',
                        periodicSendValue: '',
                        periodicSendType: ''
                    }
                },//操作记录详情

                logFlag: false,
                logEvents:[],//日志列表
                logTotal: 1,
                logPageNow: 1,
                showLogMore: false,
                recordId:'',
            };
        },
        mounted() {
            this.getRecordList();
        },
        methods: {
            //获取操作记录
            getRecordList() {
                this.recordList = [];
                this.loading = true;
                ContactApiV3
                    .getRecordList({pageNumber: this.pageNo,search: '', exportType: 3})
                    .then((res) =>{
                        this.loading = false;
                        this.recordList = res.body.data.logList;
                        this.pageTotal = res.body.data.totalPage;
                    });
            },
            // 翻页
            page(page) {
                this.pageNo = page;
                this.getRecordList();
            },
            //日志 分页
            handleLogPage(e) {
                this.logPageNow = e;
                this.getLogs(this.recordId);
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
            //查看详情  查看详情
            viewRecord(record, type) {
                this.recordId = record.id;
                if (type === 1) {//查看详情
                    ContactApiV3
                        .getRecordDetail(record.id)
                        .then(({body:{data}}) =>{
                            this.showView = true;
                            this.recordDetail.index = data.conditionJson ? JSON.parse(data.conditionJson) : [];
                            this.recordDetail.sendTime = {
                                sendType: data.sendType,
                                pushDate: data.date,
                                repeatPeriodic: data.frequency,
                                periodicSendValue: data.endCount || data.endDate || data.endDay || '',
                                periodicSendType: data.endCount ? 1 : data.endDay ? 2 : data.endDate ? 3 : '',
                            };
                            this.recordDetail.email = record.email;
                            this.recordDetail.journeyNames = record.journeyNames;
                            this.recordDetail.taskNames = record.taskNames;
                            this.recordDetail.journeyKeywords = record.journeyKeywords;
                            this.recordDetail.topicTagKeywords = record.topicTagKeywords;
                        });
                } else if (type === 2) {//查看日志
                    this.logFlag = true;
                    this.getLogs(record.id);
                }
            },
            //获取日志列表
            getLogs(id) {
                ContactExportApiV3
                    .viewLogEvent(id, this.logPageNow)
                    .then((res) => {
                        this.logEvents = res.body.data.results;
                        this.logTotal = res.body.data.totalPage;
                        this.logEvents.forEach((i) => {
                            this.$set(i, 'expand', false);
                        });
                    });
            },
            trsFiled(filed) {
                let dataFiled = [];
                filed.forEach(arr =>{
                    dataFiled.push(customIndicatorField.$getByKey(arr).name);
                });
                return dataFiled;
            },
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .hawei-operation-record{
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
            .icon-search, .icon-copy {
                color: $green;
            }
            .icon-pause {
                color: $dark-red;
            }
            .send-time {
                overflow: visible;
            }

        }
        .view-log-modal{
            .simplify-table{
                table {
                    tr{
                        td{
                            &.tdExpand {
                                word-break: break-all;
                                white-space: pre-wrap;
                            }
                        }
                    }
                }
            }
        }
        .view-log{
            .arrow-btn{
                display: flex;
                justify-content: flex-end;
                i{
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                }
                &.active {
                    .icon-arrow-down {
                        @include transform(rotate(180deg));
                    }
                }

            }
        }
        .label{
            flex-shrink: 0;
            width: 175px;
        }
    }
</style>
