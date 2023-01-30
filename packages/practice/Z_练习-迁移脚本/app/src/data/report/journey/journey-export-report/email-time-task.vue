<template>
    <!--华为定制 邮件定时任务-->
    <div class="email-time-task" v-if="!showRecord">
        <button class="btn btn-md btn-theme pull-right" @click="showRecord=true">{{'data.operationRecord' | t}}
        </button>
        <!--操作记录-->
        <div class="form-field">
            <div>
                <label class="label title">{{'data.exportFile' | t}}</label>
                <p class="notice">{{$t('data.tasksLimit')}}</p>
                <p class="notice">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{$t('data.firstReport')}}</p>
            </div>
        </div>
        <div class="form-field">
            <label class="label">{{'data.journeyNameKeyword' | t}}</label>
            <input type="text" class="input lg" maxlength="50" v-model.trim="journeyKeywords"
            :placeholder="$t('data.journeyKeyword')">
        </div>
        <div class="form-field">
            <label class="label">{{$t('data.topicTag')}}</label>
            <input type="text" class="input lg" maxlength="50" v-model.trim="topicTagKeywords"
            :placeholder="$t('data.englishKeyword')">
        </div>
        <!--特殊指标-->
        <div class="form-field flex special-indicator">
            <label class="label">
                {{'data.spcIndex' | t}}
                <i class="icon icon-yiwen1" v-title:right="$t('data.spcIndexIntro')"></i>
            </label>
            <div class="field-group">
                <index-selector v-model="testIndexData"></index-selector>
            </div>
        </div>
        <!--发送时间-->
        <div class="form-field">
            <label class="label">{{'form.sendTime' | t}}</label>
            <span>{{$t('form.periodSend')}}  </span>
            <selector :options="timeZoneList" v-model="timeZone" @input="changeTimeZone" class="xl"></selector>
            <template>
                {{'form.startTime' | t}}
            </template>
            <calendar v-model="pushDate" format="yyyy-mm-dd hh:ii" :start="today" :showTodayBtn="false"/>
        </div>
        <!--重复周期-->
        <div class="form-field flex">
            <label class="label">{{'newJourney.period' | t}}</label>
            <div class="field-group">
                {{'newJourney.every' | t}}
                <number-input class="input tiny" v-model="repeatPeriodic" :min="1" maxlength="3"/>
                {{'newJourney.day' | t}}
            </div>
        </div>
        <!--结束时间-->
        <div class="form-field flex">
            <label class="label">{{'data.endTime' | t}}</label>
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
                <calendar v-if="periodicSendType === 3" v-model="periodicSendValue" format="yyyy-mm-dd hh:ii"
                          :start="today" :showTodayBtn="false"/>
            </div>
        </div>
        <!--格式类型-->
        <div class="form-field flex">
            <label class="label">{{'contact.formatType' | t}}</label>
            <div class="field-group">
                <radio source="Excel" v-model="formatType">Excel</radio>
                <radio source="CSV" v-model="formatType">CSV</radio>
            </div>
        </div>
        <!--文件格式-->
        <div class="form-field flex" v-if="formatType === 'CSV'">
            <label class="label">{{'data.fileType' | t}}</label>
            <div class="form-field">
                <radio :source="1" v-model="exportDocumentType">GB2312</radio>
                <radio :source="0" v-model="exportDocumentType">UTF-8</radio>
            </div>
        </div>
        <!--邮件主题-->
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
        <div class="form-field">
            <label class="label"></label>
            <button class="btn btn-theme btn-md" @click="readyExportReport"
                    :disabled="$has('datacentre_marketing_task_scheduled')">
                {{'data.export' | t}}
            </button>
        </div>
        <!--导出提示框-->
        <confirm :title="$t('common.notice')" v-if="showExportNotice"
                 @cancel="showExportNotice = false" @confirm="sureExport">
            <p>{{'data.exportPrompt' | t}}</p>
        </confirm>
    </div>
    <haweiOperationRecord v-else @back="showRecord = false"></haweiOperationRecord>
</template>

<script>
    import { ContactExportApiV3 } from '@/api';
    import indexSelector from '../components/index-selector.vue';
    import {TIME_ZONE_RNAGES, timeZoneToday} from '@/common/utils/timeZone';
    import {format, differenceInMinutes} from 'date-fns';
    import haweiOperationRecord from './hawei-operation-record.vue';
    import {EMAIL_ADDRESS_REGEXP} from '@/common/utils/regs';
    import { mapState } from 'vuex';

    export default {
        name: 'email-time-task',
        data() {
            return {
                journeyKeywords:'',//旅程名称关键字
                topicTagKeywords:'',//邮件Topic tag关键字
                testIndexData: [],//特殊指标

                timeZoneList:TIME_ZONE_RNAGES,
                timeZone: this.$store.state.user.timeZone,
                today:format(new Date(), 'YYYY-MM-DD HH:mm'),
                pushDate:'',//发送开始时间
                repeatPeriodic:null,
                periodicSendType:'',
                periodicSendValue: null,
                startDate: [
                    {id: 1, name: this.$t('common.noOfTimes')},
                    {id: 2, name: this.$t('common.noOfDays')},
                    {id: 3, name: this.$t('common.absoluteDate')},
                ],
                formatType:'Excel',//格式类型
                exportDocumentType:'',
                exportEmail: this.$store.state.user.email,  // 默认系统邮箱
                curEmailSubject: this.$t('data.timeEmail'),

                showRecord: false,//操作记录显示
                showExportNotice: false,//导出二次提醒
            };
        },
        components: {
            indexSelector,
            haweiOperationRecord
        },
        watch: {
            formatType() {
                if (this.formatType === 'CSV') {
                    this.exportDocumentType = 1;
                } else {
                    this.exportDocumentType = '';
                }
            }
        },
        computed: {
            ...mapState(['user']),
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            }
        },
        methods: {
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
            // 结束时间切换
            changeByDate() {
                this.periodicSendValue = '';
            },
            /**
            * 导出前校验
            * @param {data}
            */
            readyExportReport() {
                //导出前校验
                if (!this.journeyKeywords && !this.topicTagKeywords ) {
                    return this.$toast(this.$t('data.refineData'), 'warn');
                }
                // 时间选择拦截
                if (!this.timeZone || !this.pushDate || !this.repeatPeriodic || !this.periodicSendValue) {
                    return this.$toast(this.$t('data.refineData'), 'warn');
                }
                // 若添加了指标，需完善指标
                let setIndex = this.testIndexData.filter(arr => arr.userAttribute !== '' || arr.relation !== '');
                if (setIndex.length && setIndex.filter(
                    attr => (attr.values === '' && attr.relation === 1) ||
                        (!attr.values.length && attr.relation === 2) ||
                        !attr.dataType.length || attr.userAttribute === '' || attr.relation === '').length) {
                    return this.$toast(this.$t('data.refineData'), 'warn');
                }
                // 拦截过去时间（组件内的start拦截， 没有精确到秒 ，故在此在拦截一次）
                let today = timeZoneToday(this.timeZone);
                let pushDate = new Date(this.pushDate).getTime();
                if (pushDate - today < 0) {
                    return this.$toast(this.$t('data.passDate'), 'warn');
                }
                // 结束时间不能先于开始时间
                if (this.periodicSendType === 3 && (differenceInMinutes(this.periodicSendValue, this.pushDate) < 0)) {
                    return this.$toast(this.$t('analysis.valueTimeTip'), 'warn');
                }
                if (this.curEmailSubject === '') {
                    return this.$toast(this.$t('contact.emailEmpty'), 'warn');
                }
                if (!EMAIL_ADDRESS_REGEXP.test(this.exportEmail)) {
                    return this.$toast(this.$t('data.validEmail'), 'warn');
                }
                if (!this.exportEmail.includes('@huawei.com') && !this.exportEmail.includes('@qdum.com')) {
                    this.$toast(this.$t('common.emailTypeWaring'), 'warn');
                    return;
                }
                this.showExportNotice = true;
            },
            //确定导出
            sureExport() {
                this.showExportNotice = false;
                let canIUseTestIndexData = this.testIndexData.filter(arr => arr.userAttribute !== '' && arr.relation !== '');
                let postData = {
                    journeyKeywords: this.journeyKeywords,
                    topicTagKeywords: this.topicTagKeywords,
                    email: this.exportEmail,
                    unicode: this.exportDocumentType,
                    date: this.pushDate,
                    frequency: this.repeatPeriodic,
                    sendType: this.sendType,
                    timeZone: this.timeZone,
                    conditionJson: canIUseTestIndexData.length ? JSON.stringify(canIUseTestIndexData.map(
                        // eslint-disable-next-line camelcase
                        ({userAttribute, field_name, field_type, relation, values, dataType}) => {
                            return {
                                field_id: userAttribute,
                                field_name,
                                field_type,
                                operation: relation === 1 ? 'eq' : 'belong',
                                value: values,
                                target: dataType
                            };
                        })) : '',
                    formatType: this.formatType,
                    emailSubject: this.curEmailSubject,
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

                ContactExportApiV3
                    .exportTimeTask(postData)
                    .then(() => {
                        this.$toast(this.$t('data.acceptEmail'), 'success');
                        this.resetData();
                    });
            },
            resetData() {
                this.journeyKeywords = '';
                this.topicTagKeywords = '';
                this.exportEmail = this.user.email;
                this.formatType = 'Excel';
                this.curEmailSubject = this.$t('data.timeEmail');
                this.exportDocumentType = '';
                this.showExportNotice = false;
                this.testIndexData = [];

                this.timeZone = this.user.timeZone;
                this.periodicSendType = '';
                this.periodicSendValue = '';
                this.pushDate = '';
                this.repeatPeriodic = '';
            },
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .email-time-task {
        margin: 15px 0;
        width: 100%;
        overflow: scroll;
        .notice {
            padding-left: 90px;
            color: red;
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
        .special-indicator {
            line-height: 35px;
        }
        .label{
            width: 180px;
        }
    }
</style>
