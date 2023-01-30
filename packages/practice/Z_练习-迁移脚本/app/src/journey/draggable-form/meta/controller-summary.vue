<template>
    <div v-show="summaryControllerId"
         class="controller-summary"
         :style="{left:position.left+'px',top:position.top+'px'}"
         v-blur="hide"
         @mouseenter="show"
         @mouseleave="hide">
        <p class="controller-summary-title">
            <span class="detail" v-if="summary&&summary.detail" @click="intoDetail">{{summary.detail}}</span>
            {{summary.summaryName}}
        </p>
        <div class="controller-summary-line" v-for="line in summary.line">
            <b class="pull-right">{{line.value}}</b>
            {{line.name}}
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import debounce from 'lodash/debounce';
    import {mapActions, mapMutations, mapState} from 'vuex';
    import {CHECK_CONTROLLER_SUMMARY_DETAIL, UPDATE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {
        AB_TEST_CONTROLLER,
        NEW_AB_TEST_CONTROLLER,
        ADD_CONTACT_TAG_CONTROLLER,
        ATTRIBUTE_CONDITION_CONTROLLER,
        CONTACT_CONTROLLER,
        DECISION_CONTROLLER,
        DELETE_CONTACT_TAG_CONTROLLER,
        EMAIL_CONTROLLER,
        END_CONTROLLER,
        EVENT_CONDITION_CONTROLLER,
        SMS_CONTROLLER,
        MMS_CONTROLLER,
        START_CONTROLLER,
        TAG_CONDITION_CONTROLLER,
        WECHAT_CONTROLLER,
        EMAILTEMPLATE_CONTROLLER,
        LEADS_TRANSFER, ADD_FANS_TAG_CONTROLLER, DELETE_FANS_TAG_CONTROLLER,
        WECOM_CONTROLLER
    } from '../canvas/controller/CONTROLLER_TYPES';
    import {logError} from '../../../monitor';
    import {CHECK_CONTROLLER_SUMMARY} from '@/store/vuex/actionTypes';
    import {CONTROLLER_DEFAULT_WIDTH} from '../canvas/controller/controller.vue';
    import { JourneyApiV3, NikeJourneyV3, RtJourneyV1 } from '@/api';

    export default {
        data() {
            return {
                summaryMap: {}, // Map<controllerId, summary>
            };
        },
        computed: {
            summary() {
                return this.summaryControllerId ? this.summaryMap[this.summaryControllerId] : {};
            },
            //  位置
            position() {
                const container = document.querySelector('.journey-canvas');
                let temp = {left: 0, top: 0};
                if (!this.summaryControllerId || !container) {
                    return temp;
                }

                // 1. controller 是绝对定位的，controller.left 是 left 值 controller.top 是 top 值
                // 这里定位到controller水平方向的中点，竖直方向的顶点
                temp.left = container.offsetLeft + this.controller.left * this.ratio - container.scrollLeft
                    + CONTROLLER_DEFAULT_WIDTH / 2;
                temp.top = container.offsetTop + this.controller.top * this.ratio - container.scrollTop;

                return temp;
            },
            // ...mapGetters(['isCanvasWider']),
            ...mapState({
                ratio: state => state[DRAGGABLE_JOURNEY_STORE_NAME].ratio,
                summaryControllerId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].summaryControllerId,
                controllers: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.controllers,
                controller() {
                    return this.controllers[this.summaryControllerId];
                },
                journey: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                journeyed: state => state[DRAGGABLE_JOURNEY_STORE_NAME],
                readonlyIds: state => state[DRAGGABLE_JOURNEY_STORE_NAME].readonlyControllerIds
            })
        },
        watch: {
            /**
             * 自动获取所有控件的简介
             * 可编辑的控件不展示简介信息
             * @param journeyId
             */
            'journey.id'(journeyId) {
                if (journeyId) {
                    for (const id in this.controllers) {
                        this.refreshData(~~id);
                    }
                }
            },
            summaryControllerId: debounce(function (controllerId) {
                if (controllerId) {
                    this.refreshData(controllerId);
                }
            }, 20, {trailing: true, leading: false}),
        },
        methods: {
            ...mapMutations([
                CHECK_CONTROLLER_SUMMARY_DETAIL,
                UPDATE_CONTROLLER
            ]),
            ...mapActions([
                CHECK_CONTROLLER_SUMMARY
            ]),
            // 查看详情
            intoDetail() {
                this.CHECK_CONTROLLER_SUMMARY_DETAIL(this.summaryControllerId);
            },
            //  显示
            show() {
                this.CHECK_CONTROLLER_SUMMARY(this.summaryControllerId);
            },
            //  隐藏
            hide() {
                this.CHECK_CONTROLLER_SUMMARY('');
            },
            /**
             * 获取控件的简介
             * 可编辑的控件不展示简介信息
             */
            refreshData(id) {
                const controller = this.controllers[id];
                // 可编辑的控件不展示简介信息
                if (this.writable(id)) return;

                switch (controller.type) {
                    // 受众来源控件
                    case CONTACT_CONTROLLER: {
                        this.$set(this.summaryMap, id, {
                            summaryName: this.$t('journey.source'),
                            line: [{name: controller.name, value: ''}]
                        });
                        break;
                    }

                    // AB测试控件
                    case AB_TEST_CONTROLLER: {
                        if (controller.processInfo.ABTest.bRatio >= 0) {
                            const aRatio = Math.round(controller.processInfo.ABTest.aRatio * 100) + '%';
                            const bRatio = Math.round(controller.processInfo.ABTest.bRatio * 100) + '%';
                            const cRatio = Math.round(controller.processInfo.ABTest.cRatio * 100) + '%';
                            this.$set(this.summaryMap, id, {
                                summaryName: this.$t('controller.randomSplit'),
                                line: [
                                    {name: this.$t('controller.A'), value: aRatio},
                                    {name: this.$t('controller.B'), value: bRatio},
                                    {name: this.$t('controller.C'), value: cRatio}
                                ]
                            });
                        } else {
                            const aRatio = Math.round(controller.processInfo.ABTest.aRatio * 100) + '%';
                            const bRatio = Math.round((1 - controller.processInfo.ABTest.aRatio) * 100) + '%';
                            this.$set(this.summaryMap, id, {
                                summaryName: this.$t('controller.randomSplit'),
                                line: [
                                    {name: this.$t('controller.A'), value: aRatio},
                                    {name: this.$t('controller.B'), value: bRatio}
                                ]
                            });
                        }
                        break;
                    }

                    // 新AB测试控件
                    case NEW_AB_TEST_CONTROLLER: {
                        JourneyApiV3
                            .getABTestControllerDetail(controller.id, this.journey.journeyInstantiationId)
                            .then(({body: {data: {enterCount, sendCount}}}) => {
                                this.$set(this.summaryMap, id, {
                                    summaryName: controller.name,
                                    line: [
                                        {
                                            name: this.$t('controller.entries'),
                                            value: enterCount || 0
                                        },
                                        {
                                            name: this.$t('controller.sentCount'),
                                            value: sendCount || 0
                                        }
                                    ]
                                });
                            });
                        break;
                    }

                    // 邮件控件
                    case EMAIL_CONTROLLER:
                        // 待审批状态不调用该接口
                        if (this.journey.journeyType === 2 && this.journey.journeyStatus !== 9) {
                            // 实时旅程
                            RtJourneyV1
                                .controllerCount({
                                    controllerId: controller.id,
                                    journeyInstantiationId: this.journey.journeyInstantiationId,
                                    taskInstantiationId: controller.taskInstantiationId,
                                    controllerType: controller.type
                                })
                                .then(({body: {data: {enterCount, sendCount}}}) => {
                                    let con = Object.assign(
                                        {},
                                        this.controllers[id],
                                        {enterCount: enterCount, sendCount: sendCount}
                                    );
                                    this.UPDATE_CONTROLLER(con);
                                    this.$set(this.summaryMap, id, {
                                        summaryName: this.$t('controller.contactMonitoring'),
                                        line: [
                                            {name: this.$t('controller.enter'), value: enterCount},
                                            {name: this.$t('controller.sent'), value: sendCount}
                                        ],
                                        detail: this.$t('controller.detail')
                                    });
                                });
                        } else {
                            // 非实时旅程
                            this.$set(this.summaryMap, id, {
                                summaryName: controller.name,
                                line: [
                                    {
                                        name: this.$t('controller.entries'),
                                        value: controller.pushInfo.enterCount || 0
                                    },
                                    {
                                        name: this.$t('controller.sentCount'),
                                        value: controller.pushInfo.sendCount || 0
                                    }
                                ]
                            });
                        }
                        break;
                    // 分批邮件控件
                    case EMAILTEMPLATE_CONTROLLER: {
                        if (this.journey.journeyType === 2) {
                            // 实时旅程
                            NikeJourneyV3
                                .getBatchTask(
                                    this.journey.id,
                                    controller.id,
                                    false
                                )
                                .then(({body: {data: {task}}}) => {
                                    let con = Object.assign(
                                        {},
                                        this.controllers[id],
                                        {enterCount: task.realityCount, sendCount: task.sendCount}
                                    );
                                    this.UPDATE_CONTROLLER(con);
                                    this.$set(this.summaryMap, id, {
                                        summaryName: this.$t('controller.contactMonitoring'),
                                        line: [
                                            {name: this.$t('controller.getInto'), value: task.sendCount},
                                            {name: this.$t('controller.sendOut'), value: task.realityCount}
                                        ],
                                    });
                                });
                        } else {
                            NikeJourneyV3
                                .getBatchTask(
                                    this.journey.id,
                                    controller.id,
                                    false
                                )
                                .then(({body: {data: {task}}}) => {
                                    let con = Object.assign(
                                        {},
                                        this.controllers[id],
                                        {enterCount: task.realityCount, sendCount: task.sendCount}
                                    );
                                    this.UPDATE_CONTROLLER(con);
                                    this.$set(this.summaryMap, id, {
                                        summaryName: this.$t('controller.contactMonitoring'),
                                        line: [
                                            {name: this.$t('controller.getInto'), value: task.sendCount},
                                            {name: this.$t('controller.sendOut'), value: task.realityCount}
                                        ],
                                    });
                                });
                        }
                        break;
                    }
                    // 短信控件、微信控件、彩信控件
                    case WECOM_CONTROLLER:
                    case WECHAT_CONTROLLER:
                    case SMS_CONTROLLER:
                    case MMS_CONTROLLER: {
                        // 待审批状态不调用该接口
                        if (this.journey.journeyType === 2 && this.journey.journeyStatus !== 9) {
                            // 实时旅程
                            RtJourneyV1
                                .controllerCount({
                                    controllerId: controller.id,
                                    journeyInstantiationId: this.journey.journeyInstantiationId,
                                    taskInstantiationId: controller.taskInstantiationId,
                                    controllerType: controller.type
                                })
                                .then(({body: {data: {enterCount, sendCount}}}) => {
                                    let con = Object.assign(
                                        {},
                                        this.controllers[id],
                                        {enterCount: enterCount, sendCount: sendCount}
                                    );
                                    this.UPDATE_CONTROLLER(con);
                                    this.$set(this.summaryMap, id, {
                                        summaryName: this.$t('controller.contactMonitoring'),
                                        line: [
                                            {name: this.$t('controller.enter'), value: enterCount},
                                            {name: this.$t('controller.sent'), value: sendCount}
                                        ],
                                        detail: this.$t('controller.detail')
                                    });
                                });
                        } else {
                            // 非实时旅程
                            this.$set(this.summaryMap, id, {
                                summaryName: controller.name,
                                line: [
                                    {
                                        name: this.$t('controller.entries'),
                                        value: controller.pushInfo.sendCount || 0
                                    },
                                    {
                                        name: this.$t('controller.sentCount'),
                                        value: controller.pushInfo.realitySendCount || 0
                                    }
                                ]
                            });
                        }
                        break;
                    }
                    // 开始控件、条件分支、结束控件、标签条件控件
                    case START_CONTROLLER:
                    case TAG_CONDITION_CONTROLLER:
                    case EVENT_CONDITION_CONTROLLER:
                    case ATTRIBUTE_CONDITION_CONTROLLER:
                    case END_CONTROLLER: {
                        // 待审批状态不调用该接口
                        if (this.journey.journeyStatus !== 9) {
                            RtJourneyV1
                                .controllerCount({
                                    controllerId: controller.id,
                                    journeyInstantiationId: this.journey.journeyInstantiationId,
                                    taskInstantiationId: controller.taskInstantiationId,
                                    controllerType: controller.type
                                })
                                .then((res) => {
                                    this.$set(this.summaryMap, id, {
                                        summaryName: this.$t('controller.contactMonitoring'),
                                        line: [{
                                            name: this.$t('controller.enter'),
                                            value: res.body.data.enterCount
                                        }],
                                        detail: this.$t('controller.detail')
                                    });
                                });
                        } else {
                            this.$set(this.summaryMap, id, {
                                summaryName: this.$t('controller.contactMonitoring'),
                                line: [{
                                    name: this.$t('controller.enter'),
                                    value: ''
                                }]
                            });
                        }
                        break;
                    }

                    case DECISION_CONTROLLER:
                        // 定时旅程条件分支没有状态信息
                        break;
                    // 华为定制 线索传递控件
                    case LEADS_TRANSFER:
                        // 待审批状态不调用该接口
                        if (this.journey.journeyType === 2 && this.journey.journeyStatus !== 9) {
                            // 实时旅程
                            RtJourneyV1
                                .controllerCount({
                                    controllerId: controller.id,
                                    journeyInstantiationId: this.journey.journeyInstantiationId,
                                    taskInstantiationId: controller.taskInstantiationId,
                                    controllerType: controller.type
                                })
                                .then(({body: {data: {enterCount, sendCount}}}) => {
                                    let con = Object.assign(
                                        {},
                                        this.controllers[id],
                                        {enterCount: enterCount, sendCount: sendCount}
                                    );
                                    this.UPDATE_CONTROLLER(con);
                                    this.$set(this.summaryMap, id, {
                                        summaryName: controller.name,
                                        line: [
                                            {name: this.$t('controller.enter'), value: enterCount},
                                            {name: this.$t('controller.transfer'), value: sendCount}
                                        ]
                                    });
                                });
                        } else {
                            // 非实时旅程
                            this.$set(this.summaryMap, id, {
                                summaryName: controller.name,
                                line: [
                                    {
                                        name: this.$t('controller.entries'),
                                        value: controller.pushInfo.enterCount || 0
                                    },
                                    {
                                        name: this.$t('controller.transfer'),
                                        value: controller.pushInfo.sendCount || 0
                                    }
                                ]
                            });
                        }
                        break;
                    // 添加联系人标签控件、移除联系人标签控件、添加粉丝标签控件、移除粉丝标签控件
                    case ADD_CONTACT_TAG_CONTROLLER:
                    case DELETE_CONTACT_TAG_CONTROLLER:
                    case ADD_FANS_TAG_CONTROLLER:
                    case DELETE_FANS_TAG_CONTROLLER: {
                        // 待审批状态不调用该接口
                        if (this.journey.journeyType === 2 && this.journey.journeyStatus !== 9) {
                            // 实时旅程
                            RtJourneyV1
                                .controllerCount({
                                    controllerId: controller.id,
                                    journeyInstantiationId: this.journey.journeyInstantiationId,
                                    taskInstantiationId: controller.taskInstantiationId,
                                    controllerType: controller.type
                                })
                                .then(({body: {data: {enterCount, sendCount}}}) => {
                                    let con = Object.assign(
                                        {},
                                        this.controllers[id],
                                        {enterCount: enterCount, sendCount: sendCount}
                                    );
                                    this.UPDATE_CONTROLLER(con);
                                    this.$set(this.summaryMap, id, {
                                        summaryName: controller.name,
                                        line: [
                                            {name: this.$t('controller.enter'), value: enterCount},
                                            //{name: this.$t('controller.transfer'), value: sendCount}
                                        ],
                                        detail: this.$t('controller.detail')
                                    });
                                });
                        } else {
                            // 非实时旅程
                            this.$set(this.summaryMap, id, {
                                summaryName: controller.name,
                                line: [
                                    {
                                        name: this.$t('controller.entries'),
                                        value: controller.pushInfo ? (controller.pushInfo.enterCount || 0) : 0
                                    },
                                    // {
                                    //     name: this.$t('controller.transfer'),
                                    //     value: controller.pushInfo.sendCount || 0
                                    // }
                                ]
                            });
                        }
                        break;
                    }
                    default:
                        logError('controller summary 遇到了不认识的控件类型' + controller.type);
                }
            },
            /**
             * 判断一个控件是否可编辑
             * @param controllerId
             * @return {Boolean}
             */
            writable(controllerId) {
                if (this.journey.journeyType === 2) {
                    // 实时旅程 未开始 和 测试结束 和 审批被拒 时，其控件都是可编辑的
                    return this.journey.journeyStatus === 0
                        || this.journey.journeyStatus === 8
                        || this.journey.journeyStatus === 10;
                }
                // 定时旅程 未开始 和 暂停 和 审批被拒 时，且控件ID不在 readonlyIds 中
                return (this.journey.journeyStatus === 0
                    || this.journey.journeyStatus === 5
                    || this.journey.journeyStatus === 10)
                    && !this.readonlyIds.includes(controllerId);
            }
        }
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .controller-summary {
        position: absolute;
        z-index: 3;
        @include box-sizing();
        padding: 12px;
        width: 192px;
        color: white;
        background-color: rgba(black, .75);
        border-radius: 4px;
        line-height: 20px;
        @include transform(translate(-50%, -100%));

        &:after {
            content: '';
            $size: 6px;
            position: absolute;
            z-index: 1;
            top: 100%;
            left: 50%;
            width: 0;
            height: 0;
            margin-left: (-$size/2);
            border-top: $size solid rgba(black, .75);
            border-right: $size solid transparent;
            border-left: $size solid transparent;
        }

        .controller-summary-title {
            @include ellipsis();
            padding: 3px 0;
            margin-bottom: 3px;
            border-bottom: 1px solid #ffffff;

            .detail {
                float: right;
                cursor: pointer;
                border-bottom: 1px solid #ffffff;
            }
        }

        .controller-summary-line {
            @include ellipsis();
        }
    }
</style>
