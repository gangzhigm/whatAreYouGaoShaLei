<template>
    <!-- 短信、彩信-点击短链数据 -->
    <div class="filter-view">
        <!--text-->
        <div class="form-field flex">
            <label class="label title">{{'data.exportFile' | t}}</label>
        </div>
        <!--数据类型-->
        <div class="form-field flex">
            <label class="label">{{'data.Types' | t}}</label>
            <div class="field-group">
                <selector class="xl" :options="messageExportDataList" v-model="exportData"></selector>
            </div>
        </div>
        <!-- 选择旅程-->
        <div class="form-field flex">
            <label class="label">{{'data.Automations' | t}}</label>
            <div class="field-group">
                <JourneyTaskSelect v-if="componentRefresh" class="xl" :needRealTime="true"
                                   :useItems="'export'" :id="journal"
                                   :date="dateRange" :source="journalType"
                                   @select="chosenJourney($event)"
                                   :clear="exportDone"
                                   :multi="false"
                                   :customizePartCuts="partCuts"></JourneyTaskSelect>
            </div>
        </div>
        <!-- 选择任务-->
        <div class="form-field flex">
            <label class="label">{{tasksText}}</label>
            <div class="field-group">
                <div class="click-box animation" @click="listOpen">
                    <span v-text="chosenMissionIds.length === 0 ? selcetTaskText : ''"></span>
                    <span v-if="chosenMissionIds.length === 1"
                          v-text="$t('data.chosen') + selectTaskName + $t('data.se')"
                          :title="$t('data.chosen') + selectTaskName + $t('data.se')"></span>
                    <span v-if="chosenMissionIds.length > 1"
                          v-text="$t('data.chosenContain') + selectTaskName + $t('data.totalSe') + chosenMissionIds.length + $t('data.item')"
                          :title="$t('data.chosenContain') + selectTaskName + $t('data.totalSe') + chosenMissionIds.length + $t('data.item')"></span>
                    <i class="icon icon-plus add"></i>
                </div>
            </div>
        </div>

        <!--Excel CSV-->
        <div class="form-field flex">
            <label class="label">{{'contact.formatType' | t}}</label>
            <div class="field-group">
                <radio source="Excel"  v-model="formatType">Excel</radio>
                <radio source="CSV"  v-model="formatType">CSV</radio>
            </div>
        </div>
        <!--文件格式-->
        <div class="form-field flex" v-if="formatType === 'CSV'">
            <label class="label">{{'data.fileType' | t}}</label>
            <div class="field-group">
                <radio :source="0" v-model="exportDocumentType">UTF-8</radio>
                <radio :source="1" v-model="exportDocumentType">GB2312</radio>
            </div>
        </div>
        <div class="form-field flex">
            <label class="label">{{'contact.emailSubject' | t}}</label>
            <div class="field-group">
                <input type="text" class="input lg" maxlength="60" v-model="curEmailSubject">
            </div>
        </div>
        <!--收件邮箱-->
        <div class="form-field flex">
            <label class="label">{{'data.emailAddresss' | t}}</label>
            <div class="field-group">
                <input type="text" class="input lg" :placeholder="$t('data.inputEmail')" maxlength="50"
                       v-model.trim="exportEmail">
            </div>
        </div>
        <!-- 导出短信、彩信 导出点击短链数据 按钮 -->
        <div class="form-field flex">
            <label class="label"></label>
            <div class="field-group">
                <!--导出短信 ->点击短链数据 -->
                <button v-if="dataType === 'SMS' && itemKeys === 'click'"
                        :disabled="$has('datacentre_marketing_export_link')"
                        class="btn btn-theme btn-md" @click="exportReport">{{'data.export' | t}}
                </button>
                <!-- 导出彩信 -> 点击短链数据 -->
                <button v-if="dataType === 'MMS' && itemKeys === 'click'"
                        :disabled="$has('datacentre_marketing_export_short')"
                        class="btn btn-theme btn-md" @click="exportReport">{{'data.export' | t}}
                </button>
            </div>
        </div>
        <!--选择任务弹窗-->
        <modal class="task-modal" size="lg" :title="selcetTaskText" v-if="activityList_open" @close="closeSelectTask">
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
                        <th>{{'data.taskName' | t}}</th>
                        <th>{{'data.journeyName' | t}}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-if="missionList.length > 0" v-for="activity in missionList">
                        <td>
                            <checkbox :source="activity.campaignId" v-model="missionIds" @input="chosenMission"/>
                        </td>
                        <td>{{activity.name}}</td>
                        <td>{{activity.journeyName}}</td>
                    </tr>
                    <tr v-if="missionList.length <= 0">
                        <th class="no-data" colspan="4">
                            {{missionName ? $t('data.noData') : $t('common.noData')}}
                        </th>
                    </tr>
                    </tbody>
                </table>
            </div>
            <pager :total="missionTotalPage" :now="missionPageNo" @page="missionPage"></pager>
            <loading v-if="loading"></loading>
            <p class="modal_text" slot="buttons">
                {{'data.total' | t}}<strong>{{missionIds.length}}</strong>
                <button slot="buttons" class="btn btn-md btn-theme" @click="confirmMission">{{'common.confirm' | t}}
                </button>
            </p>
        </modal>
        <!--导出提示框-->
        <confirm :title="$t('common.notice')" v-if="showExportNotice"
                 @cancel="showExportNotice = false" @confirm="readyExport">
            <p>{{'data.exportPrompt' | t}}</p>
        </confirm>
    </div>
</template>

<script>
    import { JourneyApiV2, OriginSmsExportApiV1, JourneyApiV3 } from '@/api';
    import DateSelector from '../components/date-selector.vue';
    import ReportSource from '../components/report-source.vue';
    import {EMAIL_ADDRESS_REGEXP} from '../../../../common/utils/regs';
    import JourneyTaskSelect from '../components/journey-task-select.vue';
    import {isArray} from 'lodash';
    import operationRecord from './operation-record.vue';

    export default {
        name: 'export-sms-or-mms-click-data',
        props: {
            dataType: {
                type: String,
                required: true
            },
            // click: 点击短链数据
            itemKeys: {
                type: String,
                required: true
            },
            journeyData: {
                type: Object,
                default: {}
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
            partCuts() {
                return ['YESTERDAY', 'TODAY', 'LAST_WEEK', 'THIS_WEEK', 'LAST_7_DAYS', 'LAST_30_DAYS'];
            },
            // 选择短彩信
            tasksText() {
                return this.dataType === 'SMS'
                    ? this.$t('data.selectSMSTasks')
                    : this.$t('data.selectMMSTasks');
            },
            // 选择短彩信任务
            selcetTaskText() {
                return this.dataType === 'SMS'
                    ? this.$t('data.selectSMS')
                    : this.$t('data.selectMMS');
            }
        },
        components: {
            DateSelector,
            ReportSource,
            JourneyTaskSelect,
            operationRecord
        },
        mounted() {
            this.exportData = -1;
            this.componentRefresh = false;
            setTimeout(() => {
                this.componentRefresh = true;
            }, 30);
            //判断邮件主题
            this.judgeSubject();
        },
        data() {
            return {
                loading: false,
                messageExportDataList: [
                    {id: -1, name: this.$t('data.allType')},
                    {id: 1, name: this.$t('data.deliveries')},
                    {id: 2, name: this.$t('data.unDeliveries')}
                ],
                exportData: '',
                journalType: 0,
                // 时间段选择
                dateRange: {
                    startDate: '',
                    endDate: '',
                },
                journal: null,
                // 任务选择
                missionIds: [],
                // 确认选择的任务
                chosenMissionIds: [],
                missionList: [],
                allMissionList: [],
                missionName: '',
                missionTotalPage: 0,
                missionTotalRow: 0,
                missionPageNo: 1,
                // 导出格式
                exportDocumentType: '',
                // 导出邮箱
                exportEmail: this.$store.state.user.email,  // 导出系统邮箱
                activityList_open: false,
                allChecked: false,
                componentRefresh: true,
                showExportNotice: false,
                selectTaskName: '',
                exportDone: false, //完成导出， 重置数据

                formatType: 'Excel',
                curEmailSubject:'',
                searchReCheckedArr: [], //搜索时临时存储已选任务项
            };
        },
        watch: {
            dataType() {
                this.init();
                //判断邮件主题
                this.judgeSubject();
            },
            itemKeys() {
                this.init();
            },
            formatType() {
                if (this.formatType === 'CSV') {
                    this.exportDocumentType = 0;
                } else {
                    this.exportDocumentType = '';
                }
            }
        },
        methods: {
            // 重置
            init() {
                this.$loading();
                // 重置task-select组件
                this.componentRefresh = false;
                this.exportData = -1;

                setTimeout(() => {
                    this.componentRefresh = true;
                }, 30);
                setTimeout(() => {
                    this.$loaded();
                }, 200);
                this.clear();
            },
            // 获取任务
            getTask(checkPageNo, mode) {
                // sms 1, mms 3
                let type = this.dataType === 'SMS' ? 1 : 3;
                // 全选时，不应影响列表数据展示
                let pageNo = checkPageNo ? checkPageNo : this.missionPageNo;
                JourneyApiV2
                    .getTasks([], '', [this.journal], pageNo, this.missionName.trim(), '', type,
                        null)
                    .then(res => {
                        const data = res.body.data;
                        this.missionTotalPage = res.body.data.totalPage;
                        this.missionTotalRow = res.body.data.totalRow;

                        // 全选轮询
                        // if (mode === 'all' && checkPageNo) {
                        //     let ids = data.taskInstantiationList.map(elm => elm.campaignId);
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
                        this.missionList.$key = 'campaignId';

                        this.chosenMission();
                    });
            },
            // 选择旅程
            chosenJourney(journey) {
                if ((!isArray(journey.id) && this.journal !== journey.id) || (isArray(journey.id) && !journey.id.length)) {
                    this.missionIds = [];
                    this.chosenMissionIds = [];
                    this.missionList = [];
                    this.allChecked = false;
                }
                this.journal = journey.id;
                this.journalType = journey.selectType;
                this.dateRange = journey.dateRange;
                if ((typeof this.journal === 'number' && this.journal) || (isArray(this.journal) && this.journal.length)) {
                    this.getTask();
                }
                this.$emit('changeJourney');
            },
            closeSelectTask() {
                this.activityList_open = false;
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
            searchMission() {
                this.missionPageNo = 1;
                this.missionList = [];
                if (this.journal) {
                    this.getTask(1, 'getAll');
                }
            },
            missionPage(page) {
                this.missionPageNo = page;
                this.getTask();
            },
            // 任务全选
            chooseAllMission(check) {
                if (check) {
                    // 全选轮询
                    let ids = this.allMissionList.map(elm => elm.campaignId);
                    let nowIds = this.missionIds;
                    this.missionIds = [...new Set([...nowIds, ...ids])];
                } else {
                    let arr = this.missionIds.filter(missId => {
                        let listHas = false;
                        this.allMissionList.forEach(elm => {
                            if (elm.campaignId === missId) listHas = true;
                        });
                        if (!listHas) return missId;
                    });
                    this.missionIds = arr;
                }
            },
            // 选择任务
            chosenMission() {
                let allCheck = true;
                if (this.missionIds.length && this.allMissionList.length) {
                    this.allMissionList.forEach(item => {
                        if (!this.missionIds.includes(item.campaignId)) {
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
            // 确认选择的任务
            confirmMission() {
                this.activityList_open = false;
                // 重新选择旅程后，这里将重置携带数据
                if (this.journeyData.taskId) {
                    this.journeyData.taskId = null;
                    this.$emit('changeJourney');
                }
                this.chosenMissionIds = this.missionIds;
                this.missionList.$key = 'campaignId';
                this.chosenMissionIds.forEach((id, index) => {
                    if (this.missionList.$getByKey(id) && index === 0) {
                        this.selectTaskName = this.missionList.$getByKey(id).name;
                    } else if (this.missionList.$getByKey(id)) {
                        this.selectTaskName = this.missionList.$getByKey(id).name;
                    }
                });
            },
            readyExport() {
                this.showExportNotice = false;
                switch (this.dataType) {
                    case 'MMS':
                        this.exportClickMessageData();
                        break;
                    case 'SMS':
                        this.exportClickMessageData();
                }
            },
            // 导出
            exportReport() {
                if ((!this.exportData && this.exportData !== 0) || !this.journal ||
                    !this.chosenMissionIds.length || !this.exportEmail) {
                    return this.$toast(this.$t('data.refineData'), 'warn');
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
            // 短彩信点击短链数据
            exportClickMessageData() {
                let postData = {
                    campaignIds: this.chosenMissionIds.toString(),
                    email: this.exportEmail,
                    uniCode: this.exportDocumentType,
                    type: this.exportData,
                    formatType: this.formatType,
                    emailSubject: this.curEmailSubject
                };
                OriginSmsExportApiV1
                    .exportClickData(postData)
                    .then(() => {
                        this.$toast(this.$t('data.acceptEmail'), 'success');
                        this.clear();
                        this.judgeSubject();
                        // 导出成功后清空传递过来的数据
                        if (this.journeyData.taskId) {
                            this.journeyData.taskId = null;
                            this.$emit('changeJourney');
                        }
                    })
                    .catch(() => {
                        this.clear();
                        this.judgeSubject();
                    });
            },
            clear() {
                this.journalType = 0;
                this.journal = null;
                this.missionList = [];
                this.exportEmail = this.$store.state.user.email;
                this.chosenMissionIds = [];
                this.missionIds = [];
                this.exportDocumentType = '';
                this.missionName = '';
                this.showExportNotice = false;
                this.selectedAttrs = [];
                this.formatType = 'Excel';
                // 清空
                this.exportDone = true;
                // 重置清空操作
                setTimeout(() => {
                    this.exportDone = false;
                }, 200);
            },
            //判断邮件主题
            judgeSubject() {
                if (this.dataType === 'SMS') {
                    this.curEmailSubject = this.$t('data.smsLink');
                } else {
                    this.curEmailSubject = this.$t('data.mmsLink');
                }
            },
            toOldEmail() {
                this.$emit('changeToOldData');
            },
        },
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .filter-view {
        width: 100%;
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
            max-width: 550px;

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
