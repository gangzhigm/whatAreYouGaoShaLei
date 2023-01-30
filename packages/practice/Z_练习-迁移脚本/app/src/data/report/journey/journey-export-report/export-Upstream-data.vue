<template>
    <!-- 上行回复数据 -->
    <div class="up-stream-view">
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
            <label class="label">{{dataType === 'SMS' ? $t('data.smsActivity') : $t('data.mmsActivity')}}</label>
            <div class="field-group">
                <selector :options="mmsMissionList" v-model="mmsMission" :placeholder="$t('material.campaignRequire')"
                          :search="true"></selector>
            </div>
        </div>
        <div class="form-field flex">
            <label class="label">{{'contact.formatType' | t}}</label>
            <div class="field-group">
                <radio source="Excel"  v-model="formatType">Excel</radio>
                <radio source="CSV"  v-model="formatType">CSV</radio>
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
            <!-- 导出短信上行回复数据 -->
            <div class="field-group">
                <button :disabled="$has('datacentre_marketing_export_reply')"
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
    import dateSelector from '../components/date-selector.vue';
    import {EMAIL_ADDRESS_REGEXP} from '../../../../common/utils/regs';
    import {format, subDays} from 'date-fns';

    export default {
        props: {
            dataType: {
                type: String,
                required: true
            }
        },
        name: 'export-Upstream-data',
        components: {
            dateSelector
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
                partCuts: ['YESTERDAY', 'TODAY', 'LAST_WEEK', 'THIS_WEEK', 'LAST_7_DAYS', 'LAST_30_DAYS'],
                showExportNotice: false,
                departmentId: '', // 部门ID
                searchType: '', // 0 邮件 1短信 2彩信

                curEmailSubject:this.$t('data.smsUpward'),//邮件主题
                formatType: 'Excel',//Excel CSV
            };
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
        mounted() {
            this.getSendOutList();
        },
        watch: {
            dataType() {
                this.getSendOutList();
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
            getDate(date) {
                this.startDate = date.start;
                this.endDate = date.end;
            },
            readyExport() {
                this.showExportNotice = false;
                let postData = {
                    email: this.exportEmail,
                    overTime: `${this.endDate} 00:00:00`,
                    sendoutId: this.mmsMission,
                    startTime: `${this.startDate} 00:00:00`,
                    uniCode: this.exportDocumentType,
                    formatType: this.formatType,
                    emailSubject: this.curEmailSubject
                };
                OriginSmsExportApiV1
                    .exportResponseData(postData)
                    .then(() => {
                        this.$toast(this.$t('data.acceptEmail'), 'success');
                        this.clear();
                    })
                    .catch(() => {
                        this.clear();
                    });
            },
            // 导出
            exportReport() {
                if (!this.startDate || !this.endDate || !this.mmsMission || !this.exportEmail) {
                    return this.$toast(this.$t('data.refineData'), 'warn');
                }
                if (this.curEmailSubject === '') {
                    return this.$toast(this.$t('contact.emailEmpty'), 'warn');
                }
                if (!EMAIL_ADDRESS_REGEXP.test(this.exportEmail)){
                    return this.$toast(this.$t('data.validEmail'),'warn');
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
                this.$loading();
                if (this.$store.state.user.roleId === 0 || this.$store.state.user.roleId === '') {
                    SmsServiceApiV1
                        .getAllSendOutList()
                        .then(res => {
                            this.$loaded();
                            let list = [];
                            if (this.dataType === 'SMS') {
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
                    GeteOriginApi
                        .getAllSendChannel({
                            departmentId: this.departmentId,
                            searchType: 1,
                        })
                        .then(({body: {data: {sendChannel}}}) => {
                            this.$loaded();
                            this.mmsMissionList = sendChannel.map(elm => {
                                return {name: elm.sendAddress, id: elm.sendoutId};
                            });
                        });
                }

            },
            clear() {
                this.startDate = '';
                this.endDate = '';
                this.currentItems = '';
                this.mmsMission = '';
                this.exportDocumentType = '';
                this.exportEmail = this.$store.state.user.email;
                this.curEmailSubject = this.$t('data.smsUpward'),
                this.formatType = 'Excel';
                this.showExportNotice = false;
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .up-stream-view {
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
