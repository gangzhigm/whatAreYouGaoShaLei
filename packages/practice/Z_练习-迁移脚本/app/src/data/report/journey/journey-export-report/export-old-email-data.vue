<template>
    <!--邮件发送明细-->
    <div class="filter-view" v-if="!showRecord">
        <div class="form-field">
            <label class="label title">{{'data.exportFile' | t}}</label>
            <button class="btn btn-md btn-theme pull-right" @click="showRecord = true">
                {{'data.operationRecord' | t}}
            </button>
        </div>
        <!--选择旅程-->
        <div class="form-field flex">
            <label class="label">{{'data.Automations' | t}}</label>
            <div class="field-group">
                <JourneyTaskSelect class="xl" :needRealTime="true" :useItems="'export'" :id="journal" :date="dateRange"
                                   :source="journalType" @select="chosenJourney($event)" :clear="exportDone"
                                   :multi="true" :customizePartCuts="partCuts" :taskType="0"></JourneyTaskSelect>
            </div>
        </div>
        <!--选择任务-->
        <div class="form-field flex">
            <label class="label">
                {{'data.selectEmailTasks' | t}}
                <i class="icon icon-yiwen1" v-title:right="$t('data.emailTaskMore')"></i></label>
            <div class="field-group">
                <div class="click-box animation" @click="listOpen">
                    <span v-text="chosenMissionIds.length === 0 ? $t('data.selectEmail') : ''"></span>
                    <span v-if="chosenMissionIds.length === 1"
                          v-text="$t('data.chosen') + selectTaskName + $t('data.se')"
                          :title="$t('data.chosen') + selectTaskName + $t('data.se')"></span>
                    <span v-if="chosenMissionIds.length > 1"
                          v-text="$t('data.chosenContain') + selectTaskName + $t('data.totalSe') + chosenMissionIds.length + $t('data.item')"
                          :title="$t('data.chosenContain') + selectTaskName + $t('data.totalSe') + chosenMissionIds.length + $t('data.item')">
                        </span>
                    <i class="icon icon-plus add"></i>
                </div>
            </div>
        </div>
        <!--发送时间-->
        <div class="form-field flex">
            <label class="label">{{'form.sendTime' | t}}</label>
            <div class="field-group">
                <selector :options="dateTypeList" v-model="sendType" @input="changeDateType"></selector>
                <template v-if="sendType === 2 || sendType === 1">
                    <selector :options="timeZoneList" v-model="timeZone" @input="changeTimeZone" class="xl"></selector>
                    <template v-if="sendType === 2 && timeZone !== ''">
                        {{'form.startTime' | t}}
                    </template>
                    <calendar v-if="timeZone !== ''" v-model="pushDate" format="yyyy-mm-dd hh:ii" :start="today"
                              :showTodayBtn="false"/>
                </template>
            </div>
        </div>
        <!--发送时间相关-->
        <template v-if="sendType === 2 && timeZone !== ''">
            <div class="form-field flex">
                <label class="label">{{'newJourney.period' | t}}</label>
                <div class="field-group">
                    {{'newJourney.every' | t}}
                    <number-input class="input tiny" v-model="repeatPeriodic" :min="1"/>
                    {{'newJourney.day' | t}}
                </div>
            </div>
            <div class="form-field flex periodic">
                <label class="label">{{'newJourney.ends' | t}}</label>
                <div class="field-group">
                    <selector :options="startDate" v-model="periodicSendType" @input="changeByDate()"></selector>
                    <template v-if="periodicSendType === 1">
                        <number-input class="input tiny" v-model="periodicSendValue" :min="1"/>
                        {{'visualization.times' | t}} {{'form.after' | t}}
                    </template>
                    <template v-if="periodicSendType === 2">
                        <number-input class="input tiny" v-model="periodicSendValue" :min="1"/>
                        {{'time.day' | t}} {{'form.after' | t}}
                    </template>
                    <template v-if="periodicSendType === 3">
                        <calendar v-model="periodicSendValue" format="yyyy-mm-dd hh:ii" :start="today"/>
                    </template>
                </div>
            </div>
        </template>
        <div class="form-field flex">
            <label class="label">{{'contact.formatType' | t}}</label>
            <div class="field-group">
                <radio source="Excel" v-model="formatType">Excel</radio>
                <radio source="CSV" v-model="formatType">CSV</radio>
            </div>
        </div>
        <div class="form-field flex" v-if="formatType === 'CSV'">
            <label class="label">{{'contact.dataFormat' | t}}</label>
            <div class="field-group">
                <radio :source="1" v-model="dataFormat">GB2312</radio>
                <radio :source="0" v-model="dataFormat">UTF-8</radio>
            </div>

        </div>
        <div class="form-field flex">
            <label class="label">{{'contact.emailSubject' | t}}</label>
            <div class="field-group">
                <input type="text" class="input lg" maxlength="60" v-model="curEmailSubject">
            </div>
        </div>
        <div class="form-field flex">
            <label class="label">{{'data.emailAddresss' | t}}</label>
            <div class="field-group">
                <input type="text" class="input lg" :placeholder="$t('data.inputEmail')" maxlength="50"
                       v-model.trim="exportEmail">
            </div>
        </div>
        <div class="form-field flex">
            <label class="label"></label>
            <!-- 邮件发送明细导出 -->
            <div class="field-group">
                <button :disabled="$has('datacentre_marketing_export_detail')"
                        class="btn btn-theme btn-md" @click="exportReport">{{'data.export' | t}}
                </button>
            </div>
        </div>
        <!--选择任务弹窗-->
        <modal class="task-modal" size="lg" :title="$t('data.selectEmail')" v-if="activityList_open"
               @close="closeSelectTask">
            <div class="modal-header pull-right">
                <div class="search-box">
                    <input class="input" type="text" v-model="missionName" maxlength="100"
                           :placeholder="$t('data.inputName')" @keydown.enter="searchMission">
                    <svg aria-hidden="true" @click="searchMission">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </div>
            </div>
            <!--任务列表-->
            <div class="simplify-table auto-width select-task" v-if="!loading">
                <table class="table">
                    <thead>
                    <tr>
                        <th width="60px">
                            <checkbox @input="chooseAllMission" v-model="allChecked"></checkbox>
                        </th>
                        <th>{{'data.emailSubject' | t}}</th>
                        <th>{{'data.taskName' | t}}</th>
                        <th>{{'data.journeyName' | t}}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="activity in missionList" :key="activity.id">
                        <td>
                            <checkbox :source="activity.id" v-model="missionIds" @input="chosenMission"></checkbox>
                        </td>
                        <td>{{activity.subject}}</td>
                        <td>{{activity.name}}</td>
                        <td>{{activity.journeyName}}</td>
                    </tr>
                    <tr v-if="!missionList.length">
                        <th class="no-data" colspan="4">
                            {{missionName ? $t('data.noData') : $t('common.noData')}}
                        </th>
                    </tr>
                    </tbody>
                </table>
            </div>
            <pager :total="missionTotalPage" :now="missionPageNo" @page="missionPage"></pager>
            <loading v-if="loading"></loading>
            <span class="modal-text" slot="buttons">
                    {{'data.total' | t}}
                    <strong>{{missionIds.length}}</strong>
                </span>
            <button slot="buttons" class="btn btn-md btn-theme" @click="confirmMission">
                {{'common.confirm' | t}}
            </button>
        </modal>
        <!--导出提示框-->
        <confirm :title="$t('common.notice')" v-if="showExportNotice"
                 @cancel="showExportNotice = false" @confirm="readyExport">
            <p>{{'data.exportPrompt' | t}}</p>
        </confirm>
    </div>
    <operation-record v-else @back="showRecord = false" :exportType="1"></operation-record>
</template>

<script>
    import { ContactExportApiV1, JourneyApiV2, JourneyApiV3 } from '@/api';
    import {EMAIL_ADDRESS_REGEXP} from '../../../../common/utils/regs';
    import JourneyTaskSelect from '../components/journey-task-select.vue';
    import {format, differenceInMinutes} from 'date-fns';
    import {TIME_ZONE_RNAGES, timeZoneToday} from '../../../../common/utils/timeZone';
    import operationRecord from './operation-record.vue';
    import {isArray} from 'lodash';

    export default {
        name: 'export-old-email-data',
        components: {
            JourneyTaskSelect,
            operationRecord
        },
        data() {
            return {
                loading: false,
                journalType: 0,
                // 时间段选择
                dateRange: {
                    startDate: '',
                    endDate: '',
                },
                // 选择任务
                journal: null,
                missionIds: [],
                chosenMissionIds: [],// 确认选择的任务
                missionList: [],
                allMissionList: [],
                missionName: '',
                missionTotalPage: 0,
                missionTotalRow: 0,
                missionPageNo: 1,
                selectTaskName: '',
                activityList_open: false,
                allChecked: false,
                // 导出邮箱
                exportEmail: this.$store.state.user.email,  // 默认系统邮箱
                showExportNotice: false,
                // 发送时间相关的
                dateTypeList: [
                    {id: 0, name: this.$t('form.sendNow')},
                    {id: 2, name: this.$t('form.periodSend')},
                    {id: 1, name: this.$t('form.timeSend')},
                ],
                sendType: '',
                today: format(new Date(), 'YYYY-MM-DD HH:mm'),
                pushDate: '',
                timeZoneList: TIME_ZONE_RNAGES,
                timeZone: '',
                repeatPeriodic: null,
                startDate: [
                    {id: 1, name: this.$t('common.noOfTimes')},
                    {id: 2, name: this.$t('common.noOfDays')},
                    {id: 3, name: this.$t('common.absoluteDate')},
                ],
                periodicSendType: '',
                periodicSendValue: null,
                // 操作记录显隐
                showRecord: false,
                exportDone: false, //完成导出， 重置数据
                partCuts: ['YESTERDAY', 'TODAY', 'LAST_WEEK', 'THIS_WEEK', 'LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS'],
                curEmailSubject: this.$t('data.emailSendDetail'),
                formatType: 'Excel',
                dataFormat: '',
                searchReCheckedArr: [], //搜索时临时存储已选任务项
            };
        },
        watch: {
            formatType() {
                if (this.formatType === 'CSV') {
                    this.dataFormat = 1;
                } else {
                    this.dataFormat = '';
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
            }
        },
        methods: {
            // 获取任务
            getTask(checkPageNo, mode) {
                let type = 0; // 邮件
                let pageNo = checkPageNo ? checkPageNo : this.missionPageNo;
                JourneyApiV2
                    .getTasks([], '', [this.journal], pageNo, this.missionName.trim(), '', type, null)
                    .then(res => {
                        const data = res.body.data;
                        this.missionTotalPage = data.totalPage;
                        this.missionTotalRow = data.totalRow;
                        // 全选轮询
                        // if (mode === 'all' && checkPageNo) {
                        //     let ids = data.taskInstantiationList.map(elm => elm.id);
                        //     let nowIds = this.missionIds;
                        //     this.missionIds = [...new Set([...nowIds, ...ids])];
                        //     if (this.missionTotalPage > checkPageNo) {
                        //         checkPageNo += 1;
                        //         this.getTask(checkPageNo, 'all');
                        //     }
                        //     return;
                        // }
                        // 获取全页数据
                        if (mode === 'getAll') {
                            if (pageNo === 1) {
                                this.allMissionList = data.taskInstantiationList;
                            } else {
                                this.allMissionList = this.allMissionList.concat(data.taskInstantiationList);
                            }
                            if (this.missionTotalPage > checkPageNo) {
                                checkPageNo += 1;
                                this.getTask(checkPageNo, 'getAll');
                            }
                            if (pageNo !== 1) return;
                        }
                        this.missionList = data.taskInstantiationList;
                        this.missionList.$key = 'id';
                        this.chosenMission();
                    });
            },
            // 选择旅程
            chosenJourney(journey) {
                if ((!isArray(journey.id) && this.journal !== journey.id) || (isArray(journey.id) && !journey.id.length)) {
                    this.missionList = [];
                    this.allChecked = false;
                }
                // Fix-7134: 更新旅程， 重置选中任务
                this.missionIds = [];
                this.chosenMissionIds = [];
                //if (journey.id.length > 4) {
                //    journey.id.splice(journey.id.length - 1, 1);
                //    this.$toast(this.$t('data.most4Journey'), 'warn');
                //}
                this.journal = journey.id;
                this.journalType = journey.selectType;
                this.dateRange = journey.dateRange;
                if ((typeof this.journal === 'number' && this.journal) || (isArray(this.journal) && this.journal.length)) {
                    this.getTask();
                }
                this.$emit('changeJourney');
            },
            // 选择任务
            chosenMission() {
                let allCheck = true;
                if (this.missionIds.length && this.allMissionList.length) {
                    this.allMissionList.forEach(item => {
                        if (!this.missionIds.includes(item.id)) {
                            allCheck = false;
                        }
                    });
                } else {
                    allCheck = false;
                }
                if (allCheck) {
                    this.allChecked = true;
                } else {
                    this.allChecked = false;
                }
            },
            closeSelectTask() {
                this.activityList_open = false;
            },
            searchMission() {
                this.missionPageNo = 1;
                this.missionList = [];
                if (this.journal) {
                    this.getTask(1, 'getAll');
                }
            },
            // 任务全选
            chooseAllMission(check) {
                if (check) {
                    // 全选轮询
                    let ids = this.allMissionList.map(elm => elm.id);
                    let nowIds = this.missionIds;
                    this.missionIds = [...new Set([...nowIds, ...ids])];
                } else {
                    let arr = this.missionIds.filter(missId => {
                        let listHas = false;
                        this.allMissionList.forEach(elm => {
                            if (elm.id === missId) listHas = true;
                        });
                        if (!listHas) return missId;
                    });
                    this.missionIds = arr;
                }
            },
            listOpen() {
                if (!this.journal || (isArray(this.journal) && !this.journal.length)) {
                    return this.$toast(this.$t('data.selectJourneyTip'), 'warn');
                }
                this.activityList_open = true;
                this.missionIds = this.chosenMissionIds;
                this.missionPageNo = 1;
                this.missionName = '';
                this.allChecked = false;
                if (this.journal) {
                    this.getTask(1, 'getAll');
                }
            },
            missionPage(page) {
                this.missionPageNo = page;
                this.getTask();
            },
            // 确认选择的任务
            confirmMission() {
                if (this.missionIds.length > 20) {
                    return this.$toast(this.$t('data.mostTasks20'), 'warn');
                }
                this.activityList_open = false;

                this.chosenMissionIds = this.missionIds;
                this.missionList.$key = 'id';
                this.chosenMissionIds.forEach((id, index) => {
                    if (this.missionList.$getByKey(id) && index === 0) {
                        this.selectTaskName = this.missionList.$getByKey(id).name;
                    } else if (this.missionList.$getByKey(id)) {
                        this.selectTaskName = this.missionList.$getByKey(id).name;
                    }
                });
            },
            // 导出
            exportReport() {
                if (!this.journal || !this.chosenMissionIds.length || !this.exportEmail) {
                    return this.$toast(this.$t('data.refineData'), 'warn');
                }
                // 时间选择拦截
                if (this.sendType === '' || (!this.timeZone && this.sendType !== 0) || (this.sendType !== 0 && !this.pushDate) ||
                    (this.sendType === 2 && (!this.repeatPeriodic || !this.periodicSendValue))) {
                    return this.$toast(this.$t('data.refineData'), 'warn');
                }

                // 拦截过去时间（组件内的start拦截， 没有精确到秒 ，故在此在拦截一次）
                let today = timeZoneToday(this.timeZone);
                let pushDate = new Date(this.pushDate).getTime();
                if (this.sendType !== 0 && pushDate - today < 0) {
                    return this.$toast(this.$t('data.passDate'), 'warn');
                }

                if (this.periodicSendType === 3 && (differenceInMinutes(this.periodicSendValue, this.pushDate) < 0)) {
                    return this.$toast(this.$t('analysis.valueTimeTip'), 'warn');
                }
                if (this.curEmailSubject === '') {
                    return this.$toast(this.$t('contact.emailEmpty'), 'warn');
                }
                if (!EMAIL_ADDRESS_REGEXP.test(this.exportEmail)) {
                    return this.$toast(this.$t('data.validEmail'), 'warn');
                }
                if (this.isHw){
                    if (!this.exportEmail.includes('@huawei.com') && !this.exportEmail.includes('@qdum.com')) {
                        this.$toast(this.$t('common.emailTypeWaring'), 'warn');
                        return;
                    }
                }
                JourneyApiV3
                    .checkJourney(this.journal)
                    .then((res) => {
                        if (res.body.code === 200) {
                            this.showExportNotice = true;
                        } else {
                            this.$toast(res.body.message, 'warn');
                        }
                    })
                    .catch((res) => {
                        this.$toast(res.body.message, 'warn');
                    });
            },
            // 导出数据
            readyExport() {
                this.showExportNotice = false;
                let postData = {
                    count: 0,
                    email: this.exportEmail,
                    taskInstantiationIds: this.chosenMissionIds,
                    type: 0,
                    date: this.pushDate,
                    frequency: this.repeatPeriodic,
                    sendType: this.sendType,
                    timeZone: this.timeZone,
                    formatType: this.formatType,
                    unicode: this.dataFormat,
                    emailSubject: this.curEmailSubject
                };
                if (this.periodicSendType === 1) {
                    postData.endCount = this.periodicSendValue;
                }
                if (this.periodicSendType === 2) {
                    postData.endDay = this.periodicSendValue;
                }
                if (this.periodicSendType === 3) {
                    postData.endDate = this.periodicSendValue;
                }
                ContactExportApiV1
                    .exportOldEmail(postData)
                    .then(() => {
                        this.$toast(this.$t('data.acceptEmail'), 'success');
                        this.clear();
                    });
            },
            clear() {
                this.journalType = 0;
                this.exportEmail = this.$store.state.user.email;
                this.formatType = 'Excel';
                this.datatType = '';
                this.curEmailSubject = this.$t('data.emailSendDetail');
                this.journal = null;
                this.missionList = [];
                this.chosenMissionIds = [];
                this.missionIds = [];
                this.missionName = '';
                this.showExportNotice = false;
                this.showRecord = false;
                this.changeDateType();
                switch (this.sendType) {
                    case 2:
                        this.pushDate = '';
                        this.timeZone = '';
                        this.repeatPeriodic = '';
                        this.periodicSendType = '';
                        this.periodicSendValue = '';
                        break;
                    case 3:
                        this.pushDate = '';
                        this.timeZone = '';
                        break;
                }
                this.sendType = '';
                // 清空
                this.exportDone = true;
                // 重置清空操作
                setTimeout(() => {
                    this.exportDone = false;
                }, 200);
            },
            // 选择发送时间类型
            changeDateType() {
                let timeZone = this.$store.state.user.timeZone;
                this.periodicSendType = '';
                this.periodicSendValue = '';
                this.pushDate = '';
                this.repeatPeriodic = '';
                this.timeZone = (this.sendType === 1 || this.sendType === 2) && timeZone !== '' ? timeZone : '';
            },
            // 结束时间切换
            changeByDate() {
                this.periodicSendValue = '';
            },
            // 切换时区
            changeTimeZone() {
                this.pushDate = '';
                this.periodicSendType = '';
                this.periodicSendValue = '';
                this.repeatPeriodic = '';
                // change start The update function run
                this.$nextTick(() => {
                    let timeZoneTodayTimer = timeZoneToday(this.timeZone);
                    this.today = format(new Date(timeZoneTodayTimer), 'YYYY-MM-DD HH:mm');
                });
            },
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .filter-view {
        width: 100%;

        .note-margin {
            margin: 8px 0 8px 49px;
        }

        margin: 15px 0;

        .mission {
            margin: 8px 0 0 130px;

            .selector {
                width: 300px;
            }
        }

        .click-box {
            height: 32px;
            line-height: 32px;
            width: 300px;
            border: 1px solid #e0e0e0;
            border-radius: 3px;
            text-align: right;
            padding: 0 5px;
            box-sizing: border-box;
            cursor: pointer;

            &:hover {
                border-color: $green;
            }

            span {
                float: left;
                font-size: 14px;
                @include ellipsis;
                max-width: 80%;

                &:first-of-type {
                    color: #999999;

                    ~ span {
                        color: $color-light-content;
                    }
                }
            }

            i {
                border-radius: 50%;
                color: white;
                padding: 3px;
                display: inline-block;
                width: 14px;
                line-height: 14px;
                background-color: #0cc2a9;

                &:before {
                    display: block;
                    font-size: 14px;
                }
            }
        }

        .task-modal {
            .modal-header {
                display: flex;
                justify-content: space-between;
                margin: 15px 0;
                line-height: 32px;
            }

            .select-task {
                table {
                    td {
                        white-space: normal;
                    }
                }

                .no-data {
                    text-align: center;
                    font-style: italic;
                    color: $color-light-content;;
                }
            }

            .modal-text {
                margin-right: 16px;
            }
        }

        .form-field {
            .title {
                width: 150px;
            }
        }

        .multi-select {
            min-width: 220px;

            .select-text {
                .title {
                    width: auto;
                    font-size: 12px;
                }
            }
        }

        .periodic {
            .selector, .input {
                flex: none;
                margin-right: 3px;
            }
        }
    }
</style>
