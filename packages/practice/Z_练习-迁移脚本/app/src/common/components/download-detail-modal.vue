<template>
    <!--下载数据-->
    <confirm class="download-detail" :title="customizeModalTitle" @cancel="cancel" @confirm="okDownload">
        <div>
            <!--数据类型 "数据中心-下载数据源" 中显示-->
            <div class="form-field" v-if="dataTypeFlag">
                <label class="label">{{'downloadDetails.dataType' | t}}</label>
                <radio :source="2" v-model="downloadInfo.dataType">{{'dataCenter.allData' | t}}</radio>
                <radio :source="1" v-model="downloadInfo.dataType">{{'dataCenter.erroneous' | t}}</radio>
            </div>
            <!-- 批量下载二维码记录中显示 -->
            <div class="form-field" v-if="downloadRecords">
              <p style='margin-left:66px;'>{{'QRCode.slectedCode' | t}}<span class="theme-text">{{downloadRecords}}</span></p>
            </div>
            <!--格式类型-->
            <div class="form-field">
                <label class="label">{{'contact.formatType' | t}}</label>
                <radio source="Excel" v-model="downloadInfo.formatType" v-if="formatTypeSet.ExcelIsShow">Excel</radio>
                <radio source="CSV" v-model="downloadInfo.formatType" v-if="formatTypeSet.CSVIsShow">CSV</radio>
            </div>
            <!--数据格式-->
            <div class="form-field" v-if="dataFormatShow">
                <label class="label">{{'contact.dataFormat' | t}}</label>
                <radio source="utf8" v-model="downloadInfo.dataFormat">utf8</radio>
                <radio source="gb18030" v-model="downloadInfo.dataFormat">gb18030</radio>
            </div>
            <div class="form-field" v-if="emailDownload">
                <!-- 邮件主题 -->
                <div class="form-field">
                    <label class="label">{{'contact.emailSubject' | t}}</label>
                    <input type="text" class="input lg" v-model.trim ="downloadInfo.emailSubject" maxlength="60"/>
                </div>
                <!--接收邮箱-->
                <div class="form-field">
                    <label class="label">{{'contact.receiveEmail' | t}}</label>
                    <input type="text" class="input lg" v-model.trim="downloadInfo.emailAddress" maxlength="50"/>
                </div>
            </div>

        </div>
    </confirm>
</template>

<script>
    import {EMAIL_ADDRESS_REGEXP} from '../utils/regs.js';
    import { mapState } from 'vuex';

    export default {
        name: 'download-detail-modal',
        data() {
            return {
                downloadInfo: {
                    dataType: 2,//数据类型: 2全部数据 1仅错误数据
                    formatType: 'Excel',//格式类型
                    dataFormat: '',//数据格式
                    emailSubject: '',//邮件主题
                    emailAddress: '',//接受邮箱
                },
                dataFormatShow: '',
            };
        },
        props: {
            dataTypeFlag: {
                //数据类型flag
                type: Boolean,
                default: false
            },
            themeModules: {
                //邮件主题模块
                type: String,
                default: ''
            },
            // 渠道活码导出数据
            channelCode: {
                type: Boolean,
                default: false
            },
            emailDownload: {
                //是否是下载到邮箱
                type: Boolean,
                default: true
            },
            customizeModalTitle: {//下载详情弹窗的title
                type: String,
                default() {
                    return this.$t('downloadDetails.title');
                }
            },
            // 批量下载二维码记录
            downloadRecords: {
                type: Number,
                default: 0
            },
            //类型格式设置
            formatTypeSet:{
                type: Object,
                default:() => {
                    return {
                        isExcel: true,
                        ExcelIsShow: true,
                        CSVIsShow: true
                    };
                }
            }
        },
        watch: {
            'downloadInfo.formatType'() {
                if (this.downloadInfo.formatType === 'CSV') {
                    this.dataFormatShow = true;
                    this.downloadInfo.dataFormat = 'utf8';
                } else {
                    this.dataFormatShow = false;
                    this.downloadInfo.dataFormat = '';
                }
            }
        },
        mounted() {
            this.downloadInfo.formatType = this.formatTypeSet.isExcel ? 'Excel' : 'CSV';
            this.downloadInfo.emailAddress = this.user.email;
            this.downloadInfo.emailSubject = this.channelCode ? this.themeModules
                : this.differenceModules(this.themeModules);
        },
        computed:{
            ...mapState(['user']),
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            }
        },
        methods: {
            //区分模块
            differenceModules(modules) {
                switch (modules) {
                    //微信消息模块
                    case 'weChatMsg':
                        return this.$t('downloadDetails.weChatMsg');
                    case 'fansReply':
                        return this.$t('downloadDetails.weChatMsg');
                    case 'fansLog':
                        return this.$t('downloadDetails.fansLog');
                    //表单
                    case 'formDownload':
                        return this.$t('downloadDetails.formReport');
                    //数据中心
                    case 'dataCenter':
                        return this.$t('downloadDetails.dataCenter');
                    //数据分析
                    case 'dataAnalysis':
                        return '数据分析非下载到邮箱';//数据分析非下载到邮箱（无需翻译）
                    //二维码列表
                    case 'qrCode':
                        return '二维码列表非邮箱下载';//无需翻译
                    //客户详情
                    case 'customerDetail':
                        return this.$t('contact.exportData');
                    // 批量下载扫码记录
                    case 'downloadRecord':
                        return this.$t('QRCode.downloadRecord');
                    // 批量下载扫码记录
                    case 'fanDataExportNotice':
                        return this.$t('follower.fanDataExportNotice');
                    //营销数据 - 企业群发
                    case 'wecomBroadcast':
                        return this.$t('controller.wecomGroup');
                    //营销数据 - 企业群发
                    case 'wecomAgent':
                        return this.$t('controller.wecomAgent');
                    //旅程详情中- 邮件任务发送详情弹窗
                    case 'sendDetailDownload':
                        return this.$t('contact.mailExportNotifict');  
                    default :
                        return modules;
                }
            },
            //取消下载
            cancel() {
                this.$emit('cancel');
            },
            //确定下载
            okDownload() {
                if (this.downloadInfo.emailSubject === '') {
                    this.$toast(this.$t('contact.emailEmpty'), 'warn');
                    return;
                }
                if (this.downloadInfo.emailAddress === '') {
                    this.$toast(this.$t('data.emailNoEmpty'), 'warn');
                    return;
                }
                if (!EMAIL_ADDRESS_REGEXP.test(this.downloadInfo.emailAddress)) {
                    this.$toast(this.$t('dataCenter.emailFormatError'), 'warn');
                    return;
                }
                if (this.isHw){
                    if (!this.downloadInfo.emailAddress.includes('@huawei.com') && !this.downloadInfo.emailAddress.includes('@qdum.com')) {
                        this.$toast(this.$t('common.emailTypeWaring'), 'warn');
                        return;
                    }
                }
                this.$emit('okDownload', this.downloadInfo);//向父组件传参
            }
        }
    };
</script>

<style lang="scss">
    .download-detail {

    }

</style>
