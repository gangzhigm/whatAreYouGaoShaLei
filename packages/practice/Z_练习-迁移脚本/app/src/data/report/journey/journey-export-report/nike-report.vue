<template>
    <div class="nike-report">
        <div class="form-field">
            <label class="label title">{{'metaData.filterCondition' | t}}</label>
        </div>
        <template v-if="exportType !== 'nick'">
            <!-- 按时间段导出 -->
            <div class="form-field">
                <label class="label">{{'data.timeRange'  | t}}</label>
                <date-range :start="startData" :end="endDate" @change="dateChange"></date-range>
            </div>
            <!-- 选择导出短、彩信 -->
            <div class="form-field">
                <label class="label">{{'data.exportType' | t}}</label>
                <radio :source="0" v-model="exportMessageType">{{'material.sms' | t}}</radio>
                <radio :source="1" v-model="exportMessageType">{{'dragJourney.mms' | t}}</radio>
            </div>
        </template>
        <div class="form-field">
            <label class="label">{{'data.selectJourney' | t}}</label>
            <selector class="lg" :options="dataSourceList" v-model="dataSourceId" @select="clearData"/>
            <date-selector :dates.sync="dateRange.dates" :start.sync="dateRange.startDate"
                           :end.sync="dateRange.endDate" v-if="!dataSourceId"
                           @change="selectDate"></date-selector>
        </div>
        <div class="form-field" v-if="dataSourceId||dateRange.dates.length>0">
            <label class="label"></label>
            <report-source v-model="journeyIds" :date-range="dateRange"></report-source>
        </div>
        <!-- 文件格式 -->
        <div class="form-field">
            <label class="label">{{'data.fileType' | t}}</label>
            <radio :source="1" v-model="fileType">GB2312</radio>
            <radio :source="0" v-model="fileType">UTF-8</radio>
        </div>
        <div class="form-field">
            <label for="exportEmail" class="label">{{'data.email' | t}}</label>
            <input type="text" id="exportEmail" class="input lg" v-model.trim="emailAddress"
                   v-title:top.line.warn="emailAddressError"
                   @focusin="emailAddressError = ''"
                   :class="{error: emailAddressError}"
                   autofocus :placeholder="email" maxlength="50">
        </div>
        <div class="form-field">
            <label class="label"></label>
            <!--导出-->
            <button class="btn btn-theme btn-md" @click="exportAction">{{'data.export' | t}}</button>
        </div>
        <!--导出提示框-->
        <confirm :title="$t('common.notice')" v-if="showExportNotice"
                 @confirm="readyExport" @cancel="showExportNotice = false">
            <p>{{'data.exportPrompt' | t}}</p>
        </confirm>
    </div>
</template>
<script>
    import { JourneyApiV1, JourneyApiV2, OriginSmsExportApiV1 } from '@/api';
    import ReportSource from '../components/report-source.vue';
    import DateSelector from '../components/date-selector.vue';
    import {EMAIL_ADDRESS_REGEXP} from '../../../../common/utils/regs';

    export default {
        props: {
            /**
             * 导出类型
             * nick: 邮件
             * nickSMSAndMMS: 短、彩信
             */
            exportType: {
                type: String,
                default: 'nick'
            }
        },
        data() {
            return {
                dataSourceList: [
                    {name: this.$t('data.byDates'), id: 0},
                    {name: this.$t('data.byJourney'), id: 1}
                ],
                dataSourceId: 1,
                dateRange: {
                    dates: [],
                    startDate: '',
                    endDate: ''
                },
                journeyIds: [],
                fileType: 1,
                emailAddress: '',
                emailAddressError: '',
                updateDate: '',
                showExportNotice: false,
                // 导出短、彩信 0 短信 1 彩信
                exportMessageType: 0,
                startData: '',
                endDate: ''
            };
        },
        computed: {
            email() {
                return this.$store.state.user.email;
            },
        },
        watch: {
            exportType() {
                this.initialData();
            }
        },
        mounted() {
            this.initialData();
            // updateDate use anywhere
            // this.$nextTick(() => {
            //     this.getUpdateDate();
            // });
        },
        methods: {
            clearData() {
                this.dateRange = {
                    dates: [],
                    startDate: '',
                    endDate: ''
                };
                this.journeyIds = [];
            },
            selectDate() {
                this.journeyIds = [];
            },
            readyExport() {
                this.showExportNotice = false;
                this.exportType === 'nick' ? this.exportNickEmail() : this.exportNickMessage();
            },
            // 导出前校验（准备）
            exportAction() {
                // 时间、旅程至少选择一种方式导出
                if (this.exportType !== 'nick' && !this.startData && !this.journeyIds.length) {
                    this.$toast(this.$t('data.nickExportRequiredChecked'), 'warn');
                    return;
                }
                if (this.exportType === 'nick' && this.journeyIds.length === 0) {
                    this.$toast(this.$t('data.selectJourneyTip'), 'warn');
                    return;
                }
                if (this.emailAddress.length === 0) {
                    this.emailAddressError = this.$t('data.emailEmpty');
                    return false;
                } else if (!EMAIL_ADDRESS_REGEXP.test(this.emailAddress)) {
                    this.emailAddressError = this.$t('swarm.emailFormatError');
                    return false;
                }
                this.showExportNotice = true;
            },
            getUpdateDate() {
                JourneyApiV1
                    .getUpdateDate('journey', this.$route.params.journeyInstantiationId || null)
                    .then((res) => {
                        this.updateDate = res.body.data.date;
                    });
            },
            // 导出邮件批次
            exportNickEmail() {
                JourneyApiV2
                    .downloadNikeReport(this.emailAddress, this.journeyIds, this.fileType)
                    .then(() => {
                        this.$toast(this.$t('material.executeSuccess'), 'success');
                    })
                    .catch(() => {
                        this.$toast(this.$t('material.executeFailed'), 'warn');
                    });
            },
            // 导出短信、彩信批次
            exportNickMessage() {
                // 0：短信，1：彩信
                const postData = {
                    journeyTemplateIds: this.journeyIds.toString(),
                    unicode: this.fileType,
                    email: this.emailAddress,
                    type: this.exportMessageType,
                    startTime: this.startData,
                    endTime: this.endDate
                };
                OriginSmsExportApiV1
                    .nikeBatchReport(postData)
                    .then(() => {
                        this.$toast(this.$t('material.executeSuccess'), 'success');
                    });
            },
            // 初始化数据
            initialData() {
                this.dataSourceId = this.$route.params.dataSourceId ? 1 : 0;
                this.dateRange = this.$route.params.dateRange || {dates: [], startDate: '', endDate: ''};
                this.journeyIds = this.$route.params.journeyId ? [this.$route.params.journeyId] : [];
                this.emailAddress = this.email;
                this.fileType = 1;
                this.emailAddressError = '';
                this.showExportNotice = false;
                this.exportMessageType = 0;
                this.startData = '';
                this.endDate = '';
            },
            // 选择时间
            dateChange(date) {
                this.startData = date.start;
                this.endDate = date.end;
            }
        },
        components: {
            ReportSource,
            DateSelector
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";
    // @import "chart";
    .nike-report {
        margin: 15px 0;

        .report-content {
            display: flex;
            height: 100%;
            overflow: auto;

            .left-content {
                .tab-link {
                    // padding: 0;
                }
            }

            .right-content {
                flex: 1;
                padding-left: 88px;
            }

            .content-title {
                font-size: 14px;
                font-weight: 800;
            }
        }
    }
</style>
