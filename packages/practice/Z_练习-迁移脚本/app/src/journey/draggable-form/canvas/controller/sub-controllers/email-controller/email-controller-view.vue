<template>
    <div class="email-modal-wrapper">
        <modal class="task-controller-view" :title="summary.taskName || '_'" size="lg"
               @close="$emit('close')">
            <div class="form-field">
                {{'journey.emailChannel' | t}}:
                {{taskChannel}}
            </div>
            <div class="form-field flex">
                <div class="field-group send">
                    {{'journey.sendConfig' | t}}:
                    {{summary.sendName}} {{sender && sender.sendAddress}}
                </div>
                <div class="field-group">
                    {{'journey.sendTime' | t}}:
                    {{taskTime}}
                    <p>{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
                </div>
            </div>
            <div class="form-field">
                <p>{{'journey.sendProfile' | t}}</p>
                <!--旅程状态：待审批，不显示报告和预览-->
                <div class="pull-right btn-wrapper" v-if="journeyInformation.journeyStatus !== 9">
                    <button type="button"
                        :disabled="$has('journey_material_preview_material')"
                        :class="{'icon-disable': $has('journey_material_preview_material')}"
                        @click="preview">
                        <i class="icon icon-search"></i>
                    </button>
                    <button type="button" @click="checkoutDetailReport(journeyInformation)" :disabled="$has('datacentre_marketing_report_marketing')">
                        <i class="icon icon-shuju"></i>
                    </button>
                </div>
                <div class="summary-wrapper">
                    <ul class="summary-box">
                        <li class="email-detail">
                            <p class="email">{{email.email || 0}}</p>
                            <p>{{'data.sendNo' | t}}</p>
                            <!--查看详情-->
                            <p class="detail" @click="viewDetails" v-if="summary.enterCount">
                                {{'controller.viewDetail' | t}}
                            </p>
                        </li>
                        <li>
                            <p class="arrive">{{email.arrive || 0}}</p>
                            <p>{{'data.sendSuccessNo' | t}}</p>
                        </li>
                        <li>
                            <p class="open">{{email.open || 0}}</p>
                            <p>{{'data.render' | t}}</p>
                        </li>
                        <li>
                            <p class="click">{{email.click || 0}}</p>
                            <p>{{'data.clicksum' | t}}</p>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="form-field" v-if="journeyInformation.journeyType === 2">
                <checkbox :value="chooseEvent" disabled="">{{'controller.set_milestone' | t}}</checkbox>
                <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
            </div>
            <template v-slot:buttons>
                <button class="btn btn-md btn-white" @click.stop="$emit('close')">{{'common.close' | t}}</button>
            </template>
        </modal>
        <view-email-send-details ref="controllerInfo" @closeDetails="closeDetails" v-if="detailsFlag"
                                 :emailDetails="controller.pushInfo" :totalSent="email.email"
                                 :journeyType ="journeyInformation.journeyType"></view-email-send-details>
    </div>
</template>

<script type="text/ecmascript-6">
    import { JourneyApiV1, JourneyApiV3, JourneyMaterialApiV1, GeteOriginApi, RtJourneyV1 } from '@/api';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {logError} from '../../../../../../monitor';
    import {TIME_ZONE_RNAGES} from '../../../../../../common/utils/timeZone';
    import viewEmailSendDetails from './view-email-send-details.vue';
    import { mapState } from 'vuex';

    const LOCAL_JOURNEY_DATA = 'LOCAL_JOURNEY_DATA';

    export default {
        props: {
            controller: Object,
        },
        data() {
            return {
                chooseEvent: false,
                summary: {
                    relativeTime: '',
                    senderId: '',
                    days: '',
                    id: '',
                    immediately: '',
                    materialId: '',
                    realityCount: '',
                    sendAddress: '',
                    sendBehavior: '',
                    sendCount: '',
                    sendName: '',
                    sendStatus: '',
                    subType: '',
                    swarmId: null,
                    taskDate: null,
                    taskInstantiationId: '',
                    taskName: '',
                    taskType: '',
                    departmentId: '', // 部门ID
                    searchType: '', // 0 邮件 1短信 2彩信
                },
                email: {
                    email: 0,
                    arrive: 0,
                    open: 0,
                    click: 0
                },
                repeatTip: `<p style="border-bottom:1px solid white;margin-bottom:5px;">` +
                    this.$t('journey.emailConditions') + `：</p>` + this.$t('journey.conditionA') + `<br>` +
                    this.$t('journey.conditionB') + `<br>` + this.$t('journey.conditionC') + `<br>` +
                    this.$t('journey.conditionD'),
                sendAddressList: [],
                timer: TIME_ZONE_RNAGES,
                detailsFlag: false,//邮件发送详情modal显隐
            };
        },
        mounted() {
            this.chooseEvent = this.milestones.includes(this.controller.id);
            JourneyApiV3
                .taskInfo(this.controller.pushInfo.taskId, this.controller.taskInstantiationId)
                .then((res) => {
                    this.summary = res.body.data.task;
                    this.journeyInformation.journeyType === 2 ? this.getControllerCount() : this.getEmailTask();

                    if (this.roleId === 0 || this.roleId === '') {
                        JourneyApiV1
                            .getAddress()
                            .then(({body: {data: {addressList}}}) => {
                                this.sendAddressList = addressList.map((address) => ({
                                    id: address.senderId,
                                    name: address.sendAddress
                                }));
                            });
                    } else {
                        GeteOriginApi
                            .getAllSendChannel({
                                departmentId: this.departmentId,
                                searchType: 0,
                            })
                            .then(({body: {data: {sendChannel}}}) => {
                                this.sendAddressList = sendChannel.map((address) => ({
                                    id: address.senderId,
                                    name: address.sendAddress
                                }));
                            });
                    }
                });
        },
        computed: {
            ...mapState({
                roleId: state => state.user.roleId,
                milestones: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.milestones,
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation
            }),
            sender() {
                return this.sendAddressList.find(address => address.senderId === this.summary.senderId);
            },
            // 任务时间
            taskTime() {
                // 实时旅程
                if (this.journeyInformation.journeyType === 2) {
                    // summary async default value should not return logError;
                    if (this.summary.immediately === '') return '';
                    switch (this.summary.immediately) {
                        case 0: { // 等待
                            let [hour, minute] = this.summary.relativeTime.split(':');
                            return this.summary.days + ' ' + this.$t('controller.days') + ' ' + parseInt(hour) + ' ' +
                                this.$t('controller.hours') + ' ' + parseInt(minute) + ' ' + this.$t('controller.minutes');
                        }
                        case 1: // 即时
                            return this.$t('controller.immediate');
                        case 2: { // 定时
                            let expireBehavior = this.summary.sendBehavior
                                ? this.$t('controller.realTimeWhenExpired')
                                : this.$t('controller.stopWhenExpired');
                            return this.summary.taskDate + '(' + expireBehavior + ')';
                        }
                        default:
                            logError('不能识别的 task.immediately: ' + this.summary.immediately);
                    }
                } else {
                    // 定时旅程
                    return this.summary.taskDate;
                }
            },
            taskChannel() {
                return this.summary.taskType === 0 ? this.$t('journey.emailContent') : '';
            }
        },
        components:{viewEmailSendDetails},
        methods: {
            getControllerCount() {
                // 待审批状态不调用该接口
                if (this.journeyInformation.journeyStatus !== 9) {
                    RtJourneyV1
                        .controllerCount({
                            controllerId: this.controller.id,
                            journeyInstantiationId: this.journeyInformation.journeyInstantiationId,
                            taskInstantiationId: this.controller.taskInstantiationId,
                            controllerType: this.controller.type
                        })
                        .then((res) => {
                            this.summary.realityCount = res.body.data.sendCount;
                            this.summary.sendCount = res.body.data.sendCount;
                            this.summary.deliveryCount = res.body.data.deliveryCount;
                            this.summary.enterCount = res.body.data.enterCount;
                            //需要用realityCount，deliveryCount计算到达率
                            this.getEmailTask();
                        });
                }
            },
            getEmailTask() {
                // 旅程状态为 9待审批时，点击邮件不调用该接口
                if (this.journeyInformation.journeyStatus === 9) return;

                JourneyApiV1
                    .getEmailTaskStatistics(this.controller.taskInstantiationId)
                    .then(({body: {data}}) => {
                        // 发送总数
                        this.email.email = data.pushBilling;
                        // 送达总数
                        this.email.arrive = data.sendSuccess;
                        // 打开总数
                        this.email.open = data.ownOpen;
                        // 点击总数
                        this.email.click = data.ownClick;
                    });
            },
            preview() {
                JourneyMaterialApiV1
                    .getMaterialCopy(this.controller.pushInfo.materialId)
                    .then((res) => {
                        // 主账号不做任何限制
                        if (this.roleId === 0 || this.roleId === '') {
                            this.$preview({material: res.body.data.material, toolbar: false});
                            return;
                        }
                        // 权限校验
                        JourneyMaterialApiV1
                            .sharingVerify({
                                materialId: res.body.data.material.materialId,
                                materialType: 1,
                                type: 2,
                                shareType: 4
                            })
                            .then(({body: {data: {isAccess}}}) => {
                                if (isAccess === 1) {
                                    this.$preview({material: res.body.data.material, toolbar: false});
                                } else {
                                    this.$toast(this.$t('material.sharingVerifyOption'), 'warn');
                                }
                            });
                    });
            },
            checkoutDetailReport(journeyInfo) {
                if (journeyInfo.journeyType !== 2) {
                    if (this.summary.sendStatus !== 2) {
                        this.$toast(this.$t('controller.reportWarn'), 'warn');
                    } else {
                        this.openHref();
                    }
                } else {
                    this.openHref();
                }
            },
            // 跳转至邮件发送报告页
            openHref() {
                let {href} = this.$router.resolve({
                    name: 'emailSendReport',
                });
                let journeyData = {
                    dataSourceId: 1,
                    journeyId: this.journeyInformation.id,
                    taskId: this.summary.taskInstantiationId
                };
                localStorage.setItem(LOCAL_JOURNEY_DATA, JSON.stringify(journeyData));
                window.open(href);
            },
            //查看详情
            viewDetails() {
                this.detailsFlag = true;
                this.$nextTick(()=>{
                    this.$refs.controllerInfo.toGetEmailDetail(
                        this.journeyInformation.journeyType,
                        this.controller.pushInfo.taskInstantiationId);
                });
            },
            closeDetails(flag) {
                this.detailsFlag = flag;
            }
        }
    };
</script>

<style lang="scss">
    @import "../task-controller-view";
    .email-modal-wrapper{
        .task-controller-view {
            .send {
                margin-right: 16px;
            }
            .summary-wrapper{
                .email-detail{
                    position:relative;
                    .detail{
                        height: 20px;
                        position: absolute;
                        bottom: 0;
                        left: 50%;
                        transform: translateX(-50%);
                        cursor: pointer;
                        color: $green;
                    }
                }
            }
        }
    }
</style>
