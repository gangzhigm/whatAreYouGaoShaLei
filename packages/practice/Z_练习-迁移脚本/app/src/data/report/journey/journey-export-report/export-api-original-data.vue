<template>
    <!-- API接口原始数据 -->
    <div class="api-view">
        <div class="form-field">
            <label class="label title">{{'data.exportFile' | t}}</label>
        </div>
        <div class="form-field flex">
            <label class="label">{{'data.timeRange' | t}}</label>
            <date-range :start="startDate" :end="endDate" :partCuts="partCuts" @change="getDate"></date-range>
            <ul class="date-area">
                <li v-for="date in dateAreaList" :key="date"
                    :class="{active: currentItems === date}"
                    @click="chooseDate(date)" class="date-item">
                    {{date}}<span class="cut-line" v-if="date !== $t('data.thirtyDays')">|</span>
                </li>
            </ul>
        </div>
        <div class="form-field flex">
            <label class="label">{{'data.Types' | t}}</label>
            <div class="field-group">
                <selector :options="dataTypeList" v-model="dataType" :placeholder="$t('data.selectTypes')"></selector>
            </div>
        </div>
        <div class="form-field flex">
            <label class="label">{{apiDataType === 'SMS' ? $t('data.smsActivity') : $t('data.mmsActivity')}}</label>
            <div class="field-group">
                <selector :options="mmsMissionList" v-model="mmsMission" :placeholder="$t('material.campaignRequire')"
                          :search="true"></selector>
            </div>
        </div>
        <div class="form-field flex">
            <label class="label">{{'contact.formatType' | t}}</label>
            <div class="field-group">
                <radio source="Excel" v-model="formatType">Excel</radio>
                <radio source="CSV" v-model="formatType">CSV</radio>
            </div>
        </div>
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

        <div class="form-field flex">
            <label class="label">{{'data.emailAddresss' | t}}</label>
            <div class="field-group">
                <input type="text" class="input lg" :placeholder="$t('data.inputEmail')" maxlength="50"
                       v-model.trim="exportEmail">
            </div>
        </div>
        <div class="form-field flex">
            <label class="label"></label>
            <div class="field-group">
                <!-- 导出短信API接口原始数据 -->
                <button v-if="apiDataType === 'SMS' && itemKeys ==='api'"
                        :disabled="$has('datacentre_marketing_export_api')"
                        class="btn btn-theme btn-md" @click="exportReport">{{'data.export' | t}}
                </button>
                <!-- 导出彩信api接口原始数据 -->
                <button v-if="apiDataType === 'MMS' && itemKeys ==='api'"
                        :disabled="$has('datacentre_marketing_export_mmsApi')"
                        class="btn btn-theme btn-md" @click="exportReport">{{'data.export' | t}}
                </button>
            </div>
        </div>
        <!--导出提示框-->
        <confirm :title="$t('common.notice')" v-if="showExportNotice"
                 @confirm="readyExport" @cancel="showExportNotice = false">
            <p>{{'data.exportPrompt' | t}}</p>
        </confirm>
    </div>
</template>

<script>
    import { OriginSmsExportApiV1, SmsServiceApiV1, GeteOriginApi } from '@/api';
    import calender from '../../../../common/components/date-time/calendar.vue';
    import {EMAIL_ADDRESS_REGEXP} from '../../../../common/utils/regs';
    import {format, subDays} from 'date-fns';

    export default {
        props: {
            apiDataType: {
                type: String,
                required: true
            },
            // api: API 接口数据
            itemKeys: {
                type: String,
                required: true
            },
            //邮件主题
            emailSubject:{
                type: String,
                default:''
            }
        },
        components: {
            calender
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
        data() {
            return {
                startDate: '',
                endDate: '',
                dateAreaList: [this.$t('data.days7'), this.$t('data.days14'), this.$t('data.thirtyDays')],
                currentItems: '',
                mmsMissionList: [],
                mmsMission: '',
                exportDocumentType: '',
                exportEmail: this.$store.state.user.email,
                dataTypeList: [
                    {id: -1, name: this.$t('data.allType')},
                    {id: 2, name: this.$t('data.unSent')},
                    {id: 1, name: this.$t('data.sented')}
                ],
                dataType: -1,
                partCuts: ['YESTERDAY', 'TODAY', 'LAST_WEEK', 'THIS_WEEK', 'LAST_7_DAYS', 'LAST_30_DAYS'],
                showExportNotice: false,
                departmentId: '', // 部门ID
                searchType: '', // 0 邮件 1短信 2彩信

                curEmailSubject: '',
                formatType: 'Excel',
            };
        },
        mounted() {
            this.getSendOutList();
            this.curSubject();
        },
        watch: {
            apiDataType() {
                this.clear();
                this.getSendOutList();
            },
            itemKeys() {
                this.clear();
                this.getSendOutList();
            },
            emailSubject() {
                this.curSubject();
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
            getDate(date) {
                this.startDate = date.start;
                this.endDate = date.end;
            },
            chooseDate(date) {
                this.currentItems = date;
                this.endDate = format(subDays(new Date(), 1), 'YYYY-MM-DD');
                switch (date) {
                    case this.$t('data.days7'):
                        this.startDate = format(subDays(this.endDate, 6), 'YYYY-MM-DD');
                        break;
                    case this.$t('data.days14'):
                        this.startDate = format(subDays(this.endDate, 13), 'YYYY-MM-DD');
                        break;
                    case this.$t('data.thirtyDays'):
                        this.startDate = format(subDays(this.endDate, 29), 'YYYY-MM-DD');
                }
            },
            readyExport() {
                this.showExportNotice = false;
                let postData = {
                    email: this.exportEmail,
                    overTime: `${this.endDate} 00:00:00`,
                    sendoutIds: this.mmsMission,
                    startTime: `${this.startDate} 00:00:00`,
                    type: this.dataType,
                    uniCode: this.exportDocumentType,
                    formatType: this.formatType,
                    emailSubject: this.curEmailSubject
                };
                OriginSmsExportApiV1
                    .getExportAPIReport(postData)
                    .then(() => {
                        this.$toast(this.$t('data.acceptEmail'), 'success');
                        this.clear();
                        this.curSubject();
                    })
                    .catch(() => {
                        this.clear();
                        this.curSubject();
                    });
            },
            exportReport() {
                if (!this.startDate || !this.endDate || !this.mmsMission || !this.exportEmail) {
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
                this.showExportNotice = true;
            },
            // 获取签名
            getSendOutList() {
                if (this.$store.state.user.roleId === 0 || this.$store.state.user.roleId === '') {
                    SmsServiceApiV1
                        .getAllSendOutList()
                        .then(res => {
                            let list = [];
                            if (this.apiDataType === 'SMS') {
                                list = res.body.data.sendouts.filter(elm => {
                                    return elm.type !== 1;
                                });
                            } else {
                                list = res.body.data.sendouts.filter(elm => {
                                    return elm.type === 1;
                                });
                            }
                            this.mmsMissionList = list.map(elm => {
                                return {name: elm.sendoutName, id: elm.sendoutId};
                            });
                        });
                } else {
                    if (this.apiDataType === 'SMS') {
                        GeteOriginApi
                            .getAllSendChannel({
                                departmentId: this.departmentId,
                                searchType: 1,
                            })
                            .then(({body: {data: {sendChannel}}}) => {
                                this.mmsMissionList = sendChannel.map(elm => {
                                    return {name: elm.sendAddress, id: elm.sendoutId};
                                });
                            });
                    } else {
                        GeteOriginApi
                            .getAllSendChannel({
                                departmentId: this.departmentId,
                                searchType: 2,
                            })
                            .then(({body: {data: {sendChannel}}}) => {
                                this.mmsMissionList = sendChannel.map(elm => {
                                    return {name: elm.sendAddress, id: elm.sendoutId};
                                });
                            });
                    }

                }


            },
            clear() {
                this.startDate = '';
                this.endDate = '';
                this.currentItems = '';
                this.mmsMission = '';
                this.exportDocumentType = '';
                this.exportEmail = this.$store.state.user.email;
                this.dataType = -1;
                this.formatType = 'Excel';
            },
            //确定邮件主题
            curSubject() {
                if (this.emailSubject === 'smsApi') {
                    this.curEmailSubject = this.$t('data.smsApi');
                }
                if (this.emailSubject === 'mmsApi') {
                    this.curEmailSubject = this.$t('data.mmsApi');
                }
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .api-view {
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

        .form-field {
            .title {
                width: 150px;
            }
        }
    }
</style>
