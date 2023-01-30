<template>
    <modal class="task-controller-view sms-controller-view"
           :title="controller.pushInfo.taskName?controller.pushInfo.taskName:'_'" size="lg" @close="cancel()">
        <div class="form-field">{{'journey.emailChannel' | t}}: {{'journey.smsContent' | t}}</div>
        <div class="form-field flex">
            <div class="field-group">{{'journey.sendConfig' | t}}: {{sendOutName}}</div>
            <div class="field-group">
                {{'journey.sendTime' | t}} :{{taskTime}}
                <p>{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
            </div>
        </div>
        <div class="form-field">
            <p>{{'journey.sendProfile' | t}}</p>
            <!--旅程状态：待审批，不显示报告和预览-->
            <div class="btn-wrapper pull-right" v-if="journeyInformation.journeyStatus !== 9">
                <button type="button"
                    :disabled="$has('journey_material_preview_material')"
                    :class="{'icon-disable': $has('journey_material_preview_material')}"
                    @click="preview">
                    <i class="icon icon-search"></i>
                    </button>
                <button type="button" v-if="journeyInformation.journeyType !== 2" @click="checkoutDetailReport"><i
                        class="icon icon-shuju"></i></button>
            </div>
            <div class="summary-wrapper">
                <ul class="summary-box">
                    <li>
                        <p class="email">{{sms.sendCount||0}}</p>
                        <p v-if="journeyInformation.journeyType === 2">{{'controller.send_total' | t}}</p>
                        <p v-if="journeyInformation.journeyType !== 2">{{'data.sendTotalNum' | t}}</p>
                    </li>
                    <li>
                        <p class="arrive">{{sms.sendNumber ||0}}</p>
                        <p v-if="journeyInformation.journeyType === 2">{{'data.sentTotalNum' | t}}</p>
                        <p v-if="journeyInformation.journeyType !== 2">{{'controller.service_total' | t}}</p>
                    </li>
                </ul>
            </div>
        </div>
        <div class="form-field" v-if="journeyInformation.journeyType === 2">
            <checkbox :value="isAMileStone" disabled="">{{'controller.set_milestone' | t}}</checkbox>
            <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
        </div>
        <template v-slot:buttons>
            <button class="btn btn-md btn-white" @click.stop="cancel">{{'common.close' | t}}</button>
        </template>
    </modal>
</template>
<script type="text/ecmascript-6">
    import { SmsServiceApiV1, JourneyMaterialApiV1, RtJourneyV1 } from '@/api';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {logError} from '../../../../../../monitor';
    import {TIME_ZONE_RNAGES} from '@/common/utils/timeZone';
    import { mapState } from 'vuex';

    const LOCAL_JOURNEY_DATA = 'LOCAL_JOURNEY_DATA';

    export default {
        props: {
            controller: Object,
            signatureList: Array,
        },
        data() {
            return {
                sms: {
                    sendCount: 0,
                    sendNumber: 0,
                    click: 0,
                    pushNumber: 0,
                    realityNumber: 0
                },
                repeatTip: `<p style="border-bottom:1px solid white;margin-bottom:5px;">` +
                    this.$t('journey.SMSConditions') + `：</p>` + this.$t('journey.SMSConditionA') + `<br>` +
                    this.$t('journey.conditionB') + `<br>` + this.$t('journey.conditionC') + `<br>` +
                    this.$t('journey.conditionD'),
                timer: TIME_ZONE_RNAGES,
            };
        },
        mounted() {
            this.getTask();
        },
        methods: {
            cancel() {
                this.$emit('close');
            },
            confirm() {
                this.$emit('close');
            },
            getTask() {
                // 待审批状态不调用该接口
                if (this.journeyInformation.journeyType === 2 && this.journeyInformation.journeyStatus !== 9) {
                    RtJourneyV1
                        .controllerCount({
                            controllerId: this.controller.id,
                            journeyInstantiationId: this.journeyInformation.journeyInstantiationId,
                            taskInstantiationId: this.controller.taskInstantiationId,
                            controllerType: this.controller.type
                        })
                        .then((res) => {
                            this.sms.pushBilling = res.body.data.sendCount;
                            this.sms.sendCount = res.body.data.sendCount;  // 发送总数
                            this.sms.sendNumber = res.body.data.deliveryCount; // 送达总数
                            this.sms.pushNumber = this.controller.enterCount;
                            this.sms.realityNumber = this.controller.sendCount;
                        });
                } else {
                    SmsServiceApiV1
                        .getSMSTaskStatus(this.controller.pushInfo.campaignId)
                        .then(({body: {data: taskStatus}}) => {
                            this.sms.pushBilling = taskStatus.pushBilling;
                            this.sms.sendCount = taskStatus.pushNumber;  // 发送总数
                            this.sms.sendNumber = taskStatus.sendSuccess;  // 送达总数
                            this.sms.pushNumber = this.controller.pushInfo.sendCount;
                            this.sms.realityNumber = this.controller.pushInfo.realitySendCount;
                            this.sms.click = taskStatus.ownClick;
                        });
                }
            },
            preview() {
                // 单个素材副本
                JourneyMaterialApiV1
                    .getMaterialCopy(this.controller.pushInfo.materialId)
                    .then((res) => {
                        // 主账号不做任何限制
                        if (this.roleId === 0 || this.roleId === '') {
                            this.$preview({material: res.body.data.material, toolbar: false, signature: this.sendOutName});
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
                                    this.$preview({
                                        material: res.body.data.material,
                                        toolbar: false,
                                        signature: this.sendOutName
                                    });
                                } else {
                                    this.$toast(this.$t('material.sharingVerifyOption'), 'warn');
                                }
                            });
                    });
            },
            checkoutDetailReport() {
                if (this.controller.pushInfo.sendStatus !== 2) {
                    this.$toast(this.$t('controller.reportWarn'), 'warn');
                } else {
                    let {href} = this.$router.resolve({
                        name: 'smsSendReport',
                    });
                    let journeyData = {
                        dataSourceId: 1,
                        journeyId: this.journeyInformation.id,
                        taskId: this.controller.taskInstantiationId
                    };
                    localStorage.setItem(LOCAL_JOURNEY_DATA, JSON.stringify(journeyData));
                    window.open(href);
                }
            }
        },
        computed: {
            ...mapState({
                roleId: state => state.user.roleId,
                isAMileStone(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation
                        .milestones.includes(this.controller.id);
                },
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation
            }),
            // 任务时间
            taskTime() {
                // 实时旅程
                if (this.journeyInformation.journeyType === 2) {
                    switch (this.controller.pushInfo.immediately) {
                        case 0: { // 等待
                            let [hour, minute] = this.controller.pushInfo.relativeTime.split(':');
                            return this.controller.pushInfo.days + ' ' + this.$t('controller.days') + ' ' + parseInt(hour) + ' ' +
                                this.$t('controller.hours') + ' ' + parseInt(minute) + ' ' + this.$t('controller.minutes');
                        }
                        case 1: // 即时
                            return this.$t('controller.immediate');
                        case 2: { // 定时
                            let expireBehavior = this.controller.pushInfo.sendBehavior
                                ? this.$t('controller.realTimeWhenExpired')
                                : this.$t('controller.stopWhenExpired');
                            return this.controller.pushInfo.taskDate + '(' + expireBehavior + ')';
                        }
                        default:
                            logError('不能识别的 task.immediately: ' + this.controller.pushInfo.immediately);
                    }
                } else {
                    // 定时旅程
                    return this.controller.pushInfo.taskDate;
                }
            },
            sendOutName() {
                let sender = this.signatureList.find(item => item.id === this.controller.pushInfo.sendOutId);
                if (sender) {
                    return sender.name;
                }
                return '';
            }
        }
    };
</script>
<style lang="scss">
    @import "../task-controller-view";
</style>
