<template>
    <modal class="task-controller-view email-controller-view" :title="$t('controller.groupBatches')" size="lg"
           @close="$emit('close')">
        <template  v-if="!batchLoading">
            <div class="form-field">
                {{'journey.emailChannel' | t}}:
                {{taskChannel}}
            </div>
            <div class="form-field flex">
                <div class="field-group">
                    {{'journey.sendConfig' | t}}:
                    {{mesgList.sendName}} {{sender && sender.sendAddress}}
                </div>
            </div>
            <div class="form-field" style="overflow: auto;">
                <p>{{'journey.sendProfile' | t}}</p>
                <div class="summary-wrapper auto-height">
                    <div class="simplify-table task-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>{{$t('controller.messageList')}}</th>
                                    <th width="68">{{$t('data.timeZone')}}</th>
                                    <th width="98">{{$t('controller.messageTime')}}</th>
                                    <th width="68">{{$t('controller.messageNumber')}}</th>
                                    <th width="68">{{$t('controller.messageGoNumber')}}</th>
                                    <th width="68">{{$t('controller.messageClick')}}</th>
                                    <th width="68">{{$t('controller.messageOperation')}}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="no-hover" v-for="(item,index) in mesgList.taskDetailsDTOS" :key="index">
                                    <td :title="item.taskName">{{item.taskName}}</td>
                                    <td :title="timeZone ? timer.$getByKey(timeZone).name : ''">{{timeZone ? 'GMT' + timeZone : ''}}</td>
                                    <td>{{item.taskDate}}</td>
                                    <td :title="item.sendCount">{{item.sendCount}}</td>
                                    <td :title="item.realitySendCount === null ? 0 : item.realitySendCount">{{item.realitySendCount === null ? 0 : item.realitySendCount}}</td>
                                    <td :title="item.ownClick === null ? 0 : item.ownClick">{{item.ownClick === null ? 0 : item.ownClick}}</td>
                                    <td><a :href="hrefTop">{{$t('controller.messageSee')}}</a></td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td width="20%">{{$t('controller.messageTotal')}}</td>
                                    <td></td>
                                    <td></td>
                                    <td>{{mesgList.sendCount}}</td>
                                    <td>{{mesgList.realitySendCount}}</td>
                                    <td>{{mesgList.ownClick}}</td>
                                    <td><a :href="hrefUrl">{{$t('controller.messageSee')}}</a></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
            <div class="form-field" v-if="journeyInformation.journeyType === 2">
                <checkbox :value="chooseEvent" disabled="">{{'controller.set_milestone' | t}}</checkbox>
                <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
            </div>
        </template>
        <inline-loading v-else></inline-loading>
        <template v-slot:buttons>
            <button class="btn btn-md btn-white" @click.stop="$emit('close')">{{'common.close' | t}}</button>
        </template>
    </modal>
</template>

<script type="text/ecmascript-6">
    import { JourneyApiV1, NikeJourneyV3, JourneyMaterialApiV1, GeteOriginApi, RtJourneyV1 } from '@/api';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {logError} from '../../../../../../monitor';
    import LINKS from '../../../../../../LINKS';
    import {TIME_ZONE_RNAGES} from '../../../../../../common/utils/timeZone';
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
                },
                email: {
                    email: 0,
                    arrive: 0,
                    open: 0,
                    click: 0
                },
                mesgList: {},
                repeatTip: `<p style="border-bottom:1px solid white;margin-bottom:5px;">` +
                    this.$t('journey.emailConditions') + `：</p>` + this.$t('journey.conditionA') + `<br>` +
                    this.$t('journey.conditionB') + `<br>` + this.$t('journey.conditionC') + `<br>` +
                    this.$t('journey.conditionD'),
                sendAddressList: [],
                hrefTop: LINKS.ORIGIN + '/data/report/journey/send-report',
                hrefUrl: LINKS.ORIGIN + '/data/report/journey/review-report',
                timer: TIME_ZONE_RNAGES,
                batchLoading: false //获取批量任务弹窗loading
            };
        },
        mounted() {
            this.batchLoading = true;
            this.chooseEvent = this.milestones.includes(this.controller.id);
            let state = this.journeyInfoState;
            let LOCAL_JOURNEY_DATA = {
                dataSourceId: 1,
                journeyId: state.id,
                dateRange: {startDate: '', endDate: ''}
            };
            localStorage.setItem('LOCAL_JOURNEY_DATA', JSON.stringify(LOCAL_JOURNEY_DATA));
            NikeJourneyV3
                .getBatchTask(state.id, this.controller.id, true)
                .then((res) => {
                    this.mesgList = res.body.data.task;
                    this.summary = res.body.data.task;
                    this.journeyInformation.journeyType === 2 ? this.getControllerCount() : this.getEmailTask();

                    if (this.roleId === 0 || this.roleId === '') {
                        JourneyApiV1
                            .getAddress()
                            .then(({body: {data: {addressList}}}) => {
                                this.sendAddressList = addressList;
                            });
                    } else {
                        GeteOriginApi
                            .getAllSendChannel({
                                departmentId: this.departmentId,
                                searchType: 0,
                            })
                            .then(({body: {data: {sendChannel}}}) => {
                                this.sendAddressList = sendChannel;
                            });
                    }
                    this.batchLoading = false;
                })
                .catch(() => {
                    this.batchLoading = false;
                });
        },
        computed: {
            ...mapState({
                milestones: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.milestones,
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                journeyInfoState: state => state.canvasStore.journeyInformation,
                roleId: state => state.user.roleId
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
            },
            timeZone() {
                return this.journeyInformation.timeZone;
            }
        },
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
                            //需要用realityCount，deliveryCount计算到达率
                            this.getEmailTask();
                        });
                }
            },
            getEmailTask() {
                JourneyApiV1
                    .getEmailTaskStatistics(this.controller.taskInstantiationId)
                    .then(({body: {data}}) => {
                        //type 为2时，需要用realityCount,deliveryCount计算到达率，1用data.sendNumber;
                        if (this.journeyInformation.journeyType === 2) {
                            this.email.email = this.summary.realityCount;
                            this.email.arrive = this.summary.deliveryCount;
                            this.email.open = this.summary.deliveryCount;
                        } else {
                            // 发送总数
                            this.email.email = data.pushBilling;
                            // 送达总数
                            this.email.arrive = data.sendSuccess;
                            // 呈现总数
                            this.email.open = data.ownOpen;
                        }
                        this.email.click = data.ownClick;
                    });
            },
            preview() {
                JourneyMaterialApiV1
                    .getMaterialCopy(this.summary.materialId)
                    .then((res) => {
                        this.$preview({material: res.body.data.material, toolbar: false});
                    });
            },
            checkoutDetailReport() {
                if (this.summary.sendStatus !== 2) {
                    this.$toast(this.$t('controller.reportWarn'), 'warn');
                } else {
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
                }
            }
        }
    };
</script>

<style lang="scss">
    @import "../task-controller-view";
    .task-controller-view {
        .summary-wrapper {
            width: 100%;
            height: auto;
            border: none;
            table {
            width: 100%;
            // border-color: #f8f8f8;
                th, td {
                    // max-width: 194px;
                    text-align: center;
                    @include ellipsis();
                }
            }
            &.auto-height {
                height: unset;
                width: unset;
                border: none;
            }
            .task-table {
                overflow-y: auto;
                max-height: calc(80vh - 276px);
                padding-bottom: 5px;
            }
        }
    }


</style>
