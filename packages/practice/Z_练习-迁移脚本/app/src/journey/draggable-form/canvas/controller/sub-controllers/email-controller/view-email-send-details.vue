<template>
    <div class="email-send-detail">
        <!--        查看详情 modal-->
        <modal :title="$t('controller.beSent')" class="details-wrapper" @close="closeDetails">
            <div class="detail-modal">
                <ul class="modal-ul">
<!--            备注仅实时旅程增加，定时旅程无需增加       -->
                    <li class="only-real-time" v-if="journeyType===2">
                        {{'controller.onlyRealNotice' | t}}
                    </li>
                    <li class="details-title">
                        <div class="statistics">
                            <h4>{{'controller.statistics' | t}}</h4>
                            <p>
                                {{'controller.enter' | t}}
                                <i class="icon icon-yiwen1" v-title:right="$t('controller.enterPeople')"></i>
                            </p>
                        </div>
                        <div class="statistics">
                            <h4>{{'controller.total' | t}}</h4>
                            <p>{{controllerInfo.total}}</p>
                        </div>
                    </li>
                    <li>
                        <!--7类排除组内，值为0的组无需显示-->
                        <div class="people-num" v-if="controllerInfo.globalUnsubscrible != 0">
                            <p>{{'dragJourney.globalUnsubscrible' | t}}</p>
                            <p>{{thousandBitSeparator(controllerInfo.globalUnsubscrible)}}</p>
                        </div>
                        <div class="people-num" v-if="controllerInfo.frequencyLimit != 0">
                            <p>{{'dragJourney.frequencyLimit' | t}}</p>
                            <p>{{thousandBitSeparator(controllerInfo.frequencyLimit)}}</p>
                        </div>
                        <div class="people-num" v-if="controllerInfo.emailSystemHardBounces != 0">
                            <p>{{'dragJourney.excludeLists' | t}}</p>
                            <p>{{thousandBitSeparator(controllerInfo.emailSystemHardBounces)}}</p>
                        </div>
                        <div class="people-num" v-if="controllerInfo.emailSystemSoftBounces3Times != 0">
                            <p>{{'dragJourney.softBounceFinal' | t}}</p>
                            <p>{{thousandBitSeparator(controllerInfo.emailSystemSoftBounces3Times)}}</p>
                        </div>
                        <div class="people-num" v-if="controllerInfo.emailSystemUnsubscrible != 0">
                            <p>{{'dragJourney.Unsubscrible' | t}}</p>
                            <p>{{thousandBitSeparator(controllerInfo.emailSystemUnsubscrible)}}</p>
                        </div>
                        <div class="people-num" v-if="controllerInfo.spamComplaints != 0">
                            <p>{{'dragJourney.spamComplaints' | t}}</p>
                            <p>{{thousandBitSeparator(controllerInfo.spamComplaints)}}</p>
                        </div>
                        <div class="people-num" v-if="controllerInfo.temporaryUnsubscribers != 0">
                            <p>{{'dragJourney.temporaryUnsubscribers' | t}}</p>
                            <p>{{thousandBitSeparator(controllerInfo.temporaryUnsubscribers)}}</p>
                        </div>

                    </li>
                    <li>
                        <div class="people-num">
                            <p>
                                {{'dragJourney.deduplication' | t}}
                                <i class="icon icon-yiwen1" v-title:right="$t('controller.sixMonths')"></i>
                            </p>
                            <p>
                                {{thousandBitSeparator(controllerInfo.exclusionAllTotal)}}
                                <button type="button" v-if="thousandBitSeparator(controllerInfo.exclusionAllTotal)>0"
                                        class="btn down-btn"
                                        :class="{disabled: $has('journey_download_exclude_data')}"
                                        @click="downloadAmount"
                                        :disabled="$has('journey_download_exclude_data')"
                                        v-show="controllerInfo.csvFlag === 1">
                                    <svg aria-hidden="true">
                                        <use xlink:href="#icon-download"></use>
                                    </svg>
                                </button>
                            </p>
                        </div>
                    </li>
                    <li>
                        <div class="people-num">
                            <h4>
                                {{'dragJourney.sendTotal' | t}}
                            </h4>
                            <h4>{{thousandBitSeparator(sendCount)}}</h4>
                        </div>
                    </li>
                </ul>
<!--                查询功能-->
                <div class="search-frequency" v-if="journeyType === 1 && cycleJoyNumFlag">
                    <span class="section">{{'dragJourney.the' | t}}</span>
                    <selector class="pull-right" :options="frequencyList" @input="selectTask($event)"
                              v-model="frequency"/>
                    <span class="section">{{'dragJourney.times' | t}}</span>
                    <button class="btn btn-theme" @click="queryJourney">{{'dragJourney.Inquire' | t}}</button>
                </div>
            </div>
        </modal>

        <!-- 下载数据 -->
        <download-detail-modal v-if="formatFlag" 
            :themeModules="'sendDetailDownload'" 
            :emailDownload="true" :dataFormatShow="false"
            @cancel="cancelDownload" @okDownload="confirmDownload"  
            :formatTypeSet="formatTypeSet"
            :customizeModalTitle="$t('contact.dataFormat')"/>
    </div>
</template>

<script>
    import { JourneyApiV3, TaskInstantiationApiV1, ScrmApiV1, ContactExportApiV3} from '@/api';
    export default {
        name: '',
        data() {
            return {
                frequencyList:[],
                frequency:'',//周期旅程可根据次数查询
                controllerInfo: {
                    csvFlag: 2,//csv是否可下载标志，1=可以下载，2不可以下载
                    csvUrlGb2312: '',
                    csvUrlUtf8: '',
                    emailSystemHardBounces: 0,//邮件通道硬弹
                    emailSystemSoftBounces3Times: 0,//邮件通道软弹3x
                    emailSystemUnsubscrible: 0,//邮件通道退订
                    exclusionAllTotal: 0,//排除总人数（去重后）
                    frequencyLimit: 0,//频次限制
                    globalUnsubscrible: 0,//全局退订
                    spamComplaints: 0,//垃圾邮件投诉
                    temporaryUnsubscribers: 0,//暂时退订
                    total: 0,//进入人数
                },
                formatFlag: false,//数据格式弹窗显隐
                sendCount: 0,//发送总数 实时旅程从邮件页面中取值，单词与周期旅程从详情接口中取值
                //下载数据的弹窗设置
                formatTypeSet: {
                    isExcel: true,
                    ExcelIsShow: true,
                    CSVIsShow: true
                },
            };
        },
        props:{
            emailDetails:{//邮件控件详情
                type: [Number, String, Object,Boolean]
            },
            journeyType:{//旅程类型 0：单次 1：周期 2:实时
                type:Number,
                default: -1
            },
            totalSent:{//发送总数
                type:Number,
                default: 0
            },
            cycleJoyNumFlag: {
                type:Boolean,
                default: true
            }
        },
        mounted() {
            if (this.journeyType === 2) {
                this.sendCount = this.totalSent;
            }
        },
        methods: {
            toGetEmailDetail(journeyType, taskInstantiationId) {
                //0：单次 1：周期 2:实时
                //只有在旅程邮件控件详情弹窗中周期可展示周期次数。发送列表-发送统计-查看详情处周期旅程不显示周期次数
                journeyType === 1 && this.cycleJoyNumFlag ?
                    this.getJourneyExampleIds() : this.readyEmailDetail(taskInstantiationId);
            },
            //ready获取邮件详情
            readyEmailDetail(taskInstantiationId) {
                if (this.journeyType === 2) {//实时旅程
                    ScrmApiV1
                        .getRTJoyDetail(taskInstantiationId)
                        .then((res) => {
                            this.detailAssignment(res.body.data);
                        });
                } else {//单次 周期
                    JourneyApiV3
                        .getEmailDetail(taskInstantiationId)
                        .then((res) => {
                            this.detailAssignment(res.body.data);
                            this.sendCount = res.body.data.sendCount;
                        });
                }
            },
            //详情赋值
            detailAssignment(det) {
                let detail = det;
                this.controllerInfo.csvFlag = detail.csvFlag;
                this.controllerInfo.csvUrlGb2312 = detail.csvUrlGb2312;
                this.controllerInfo.csvUrlUtf8 = detail.csvUrlUtf8;
                this.controllerInfo.emailSystemHardBounces = detail.emailSystemHardBounces;
                this.controllerInfo.emailSystemSoftBounces3Times = detail.emailSystemSoftBounces3Times;
                this.controllerInfo.emailSystemUnsubscrible = detail.emailSystemUnsubscrible;
                this.controllerInfo.exclusionAllTotal = detail.exclusionAllTotal;
                this.controllerInfo.frequencyLimit = detail.frequencyLimit;
                this.controllerInfo.globalUnsubscrible = detail.globalUnsubscrible;
                this.controllerInfo.spamComplaints = detail.spamComplaints;
                this.controllerInfo.temporaryUnsubscribers = detail.temporaryUnsubscribers;
                this.controllerInfo.total = detail.total;
            },
            //关闭详情弹窗
            closeDetails() {
                this.$emit('closeDetails', false);
            },
            //根据旅程模板id查询旅程实例id集合
            getJourneyExampleIds() {
                this.frequencyList = [];
                TaskInstantiationApiV1
                    .getJourneyExampleIds(this.emailDetails.taskId)
                    .then((res) => {
                        let ids = res.body.data.idList;
                        ids.forEach((id, index) => {
                            let task = {};
                            task.name = index + 1;
                            task.id = id;
                            this.frequencyList.push(task);
                        });
                        this.frequency = this.frequencyList.slice(-1)[0].id;
                        this.readyEmailDetail(this.frequency);
                    });
            },
            /**
             * 实时旅程根据次数查询详情
             */
            queryJourney() {
                this.readyEmailDetail(this.frequency);
            },
            //选择次数
            selectTask(e) {
                this.frequency = e;
            },
            // 正则 数字超过1000 千分符展示
            thousandBitSeparator(n) {
                let re = /\d{1,3}(?=(\d{3})+$)/g;

                let n1 = n.toString().replace(/^(\d+)((\.\d+)?)$/,function(s,s1,s2){return s1.replace(re, '$&,') + s2});
                return n1;
            },
            // 取消下载二维码扫码记录
            cancelDownload() {
                this.formatFlag = false;
            },
            // 确定下载二维码扫码记录
            confirmDownload(info) {
                const params = {
                    emailSubject: info.emailSubject,
                    email: info.emailAddress,
                    unicode: info.dataFormat === 'utf8' ? 0 : 1,
                    formatType: info.formatType,
                    ossPath: this.controllerInfo.csvUrlUtf8
                };
                ContactExportApiV3
                    .sendDetailDownload(params)
                    .then(() => {
                        this.$toast(this.$t('contact.checkoutEmail'), 'success');
                        this.cancelDownload();
                    });
            },
            downloadAmount(){
                if (!this.emailDetails.taskIdList || this.emailDetails.taskIdList.length === 1) {
                    this.formatFlag = true;
                } else if (this.emailDetails.taskIdList && this.emailDetails.taskIdList.length >= 2) {
                    return this.$toast(this.$t('data.downLoadWarn'), 'warn');
                }
                
            }
        }
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";
    .email-send-detail{
        .details-wrapper{
            .modal-content{
                position: relative;
            }
            .modal-ul{
                li{
                    border-bottom: 1px solid $border-color;
                    padding-bottom: 10px;
                }
                .only-real-time{
                    border: none;
                    padding-bottom: 5px;
                }
                .details-title{
                    display: flex;
                    .statistics{
                        width: 50%;
                    }
                }
                .people-num{
                    padding-top: 10px;
                    display: flex;
                    p{
                        width: 50%;
                    }
                    h4{
                        width: 50%;
                    }
                }
                .down-btn{
                    svg {
                        width: 14px;
                        height: 14px;
                        vertical-align: top;
                        fill: $theme;
                    }
                    &.disabled svg {
                        fill: $disabled;
                    }
                }
            }
        }
        .search-frequency{
            display: flex;
            position: absolute;
            top: -40px;
            left: 140px;
            .section {
                line-height: 32px;
                padding: 0 5px;
            }
        }
    }
</style>
