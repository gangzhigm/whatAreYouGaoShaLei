<template>
    <modal class="task-controller-view groupMsg-controller-view"
           :title="controller.pushInfo.taskName || '_'" size="lg" @close="cancel()">
        <div class="form-field flex">
            <!-- 任务名称 -->
            <div class="field-group">{{'controller.step_title' | t}}: {{controller.pushInfo.taskName}}</div>
            <!-- 任务时间 -->
            <div class="field-group">
                {{'journey.sendTime' | t}} :{{taskTime}}
                <p>{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
            </div>
        </div>
        <!-- 发送目标 -->
        <div class="form-field">
            <p>{{'journey.sendTarget' | t}}</p>
                <div class="target-box">
                    <div class="side">
                        <p>{{'controller.enterEmployees' | t}}</p>
                        <span class="number">{{groupMsg.entryStaffCount || 0}}</span>
                        <span class="unit-text">{{'controller.unit' | t}}</span>
                    </div>
                    <div class="middle"><img src="../arrow.png" alt="arrow"></div>
                    <div class="side">
                        <p>
                            {{'controller.sendEmployee' | t}}
                            <i class="icon icon-help" v-title="$t('controller.countTips')"></i>
                        </p>
                        <span class="number">{{groupMsg.sendStaffCount || 0}}</span>
                        <span class="unit-text">{{'controller.unit' | t}}</span>
                    </div>
                </div>
        </div>
        <!-- 发送概要 -->
        <div class="form-field">
            <p>{{'journey.sendProfile' | t}}</p>
            <!--旅程状态：待审批，不显示报告和预览-->
            <div class="btn-wrapper pull-right" v-if="journeyInformation.journeyStatus !== 9">
                <button type="button" @click="preview = true"><i class="icon icon-search"></i></button>
                <button type="button" v-if="journeyInformation.journeyType !== 2" @click="checkoutDetailReport"><i
                        class="icon icon-shuju"></i></button>
            </div>
            <div class="summary-wrapper">
                <ul class="summary-box">
                    <li>
                        <p class="email">{{groupMsg.entryContactCount || 0}}</p>
                        <p>{{'controller.enterContact' | t}}</p>
                    </li>
                    <li>
                        <p class="arrive">{{groupMsg.sendContactCount || 0}}</p>
                        <p>
                            {{'controller.sendContact' | t}}
                            <i class="icon icon-help" v-title="$t('controller.countTips')"></i>
                        </p>
                    </li>
                    <li>
                        <p class="arrive">{{groupMsg.realitySendContactCount || 0}}</p>
                        <p>
                            {{'controller.deliveryContact' | t}}
                            <i class="icon icon-help" v-title="$t('controller.countTips')"></i>
                        </p>
                    </li>
                </ul>
            </div>
        </div>
        <template v-slot:buttons>
            <button class="btn btn-md btn-white" @click.stop="cancel">{{'common.close' | t}}</button>
        </template>
        <!-- 任务素材预览 -->
        <group-msg-controller-form v-if="preview"
                                   :controller="controller"
                                   checking="checking"
                                   @close="preview = false"/>
    </modal>
</template>
<script type="text/ecmascript-6">
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {TIME_ZONE_RNAGES} from '../../../../../../common/utils/timeZone';
    import { JourneyApiV3 } from '@/api';
    import groupMsgControllerForm from './groupMsg-controller-form.vue';
    import { mapState } from 'vuex';

    const LOCAL_JOURNEY_DATA = 'LOCAL_JOURNEY_DATA';

    export default {
        props: {
            controller: Object,
            signatureList: Array,
        },
        data() {
            return {
                groupMsg: {
                    entryStaffCount: 0,             //进入员工
                    sendStaffCount: 0,              //发送员工
                    entryContactCount: 0,           //进入联系人
                    sendContactCount: 0,            //发送联系人
                    realitySendContactCount: 0      //送达联系人
                },
                timer: TIME_ZONE_RNAGES,
                preview: false                      //查看素材预览
            };
        },
        mounted() {
            this.getTask();
        },
        methods: {
            cancel() {
                this.$emit('close');
            },
            //获取任务数据
            getTask() {
                if (this.journeyInformation.journeyStatus === 9) return;
                JourneyApiV3
                    .getTaskSendInfo(this.controller.pushInfo.taskInstantiationId)
                    .then(res => {
                        let sendInfo = res.body.data;
                        this.groupMsg = {
                            entryStaffCount: sendInfo.entryStaffCount || 0,
                            sendStaffCount: sendInfo.sendStaffCount || 0,
                            entryContactCount: sendInfo.entryContactCount || 0,
                            sendContactCount: sendInfo.sendContactCount || 0,
                            realitySendContactCount: sendInfo.realitySendContactCount || 0
                        };
                    });
            },
            //跳转报告页
            checkoutDetailReport() {
                if (this.controller.pushInfo.sendStatus !== 2) {
                    this.$toast(this.$t('controller.reportWarn'), 'warn');
                } else {
                    let {href} = this.$router.resolve({
                        name: 'EnterpriseBroadcastReport',
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
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation
            }),
            // 任务时间
            taskTime() {
                return this.controller.pushInfo.taskDate;
            }
        },
        components: { groupMsgControllerForm }
    };
</script>
<style lang="scss">
    @import "../task-controller-view";
</style>
