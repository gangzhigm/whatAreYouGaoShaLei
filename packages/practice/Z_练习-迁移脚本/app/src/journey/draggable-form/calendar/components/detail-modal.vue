<template>
    <modal :title="$t('journey.taskDetail')" size="lg" @close="$emit('close')">
        <div class="task-detail-modal">
            <div class="task-details" v-show="task.id">
                <div class="task-detail" :data-label="$t('journey.taskName')">
                    <span class="detail-info-text">{{task.taskName}}</span>
                </div>
                <div v-if="taskType === 1" class="task-detail" :data-label="$t('journey.sendConfig')">
                    <span class="detail-info-text">{{'journey.sender' | t}}: </span>
                    <span class="detail-info-text">{{task.sendOutName}}{{task.signature ? `【${task.signature}】` : ''}}</span>
                </div>
                <template v-if="taskType === 0">
                    <div class="task-detail" :data-label="$t('journey.sender')">
                        <span class="detail-info-text" :title="task.sendName">{{task.sendName}}</span>
                    </div>
                    <div class="task-detail" :data-label="$t('journey.senderAddress')">
                        <span class="detail-info-text" :title="task.sendAddress">{{task.sendAddress}}</span>
                    </div>
                </template>
                <div class="task-detail" :data-label="$t('journey.sendTime')">
                    <div class="detail-info-text">
                        {{task.taskDate | cutSeconds}}
                        <router-link v-if="taskType !== 2 && task.sendStatus === 2"
                                     :to="detailReportRoute"
                                     target="_blank">
                            {{'journey.checkFullStatus' | t}}&nbsp;&gt;
                        </router-link>
                    </div>
                </div>
                <div v-if="taskType === 2" class="task-detail" :data-label="$t('journey.sendStatus')">
                    <div v-if="task.sendStatus === 2" class="detail-info-text">
                        {{'journey.pushedFans' | t}}: {{task.sendCount}}
                        <router-link v-if="task.sendStatus === 2" :to="detailReportRoute" target="_blank">
                            {{'journey.checkFullStatus' | t}}&nbsp;&gt;
                        </router-link>
                    </div>
                    <h5 v-else class="detail-info-text">{{'journey.noStatus' | t}}</h5>
                </div>
            </div>
            <div class="task-detail-preview" v-if="task.id">
                <h5 v-if="task.materialId" :title="task.mailSubject || material.materialName || material.title">
                    {{task.mailSubject || material.materialName || material.title }}</h5>
                <div class="preview-box">
                    <div v-if="task.subType!==2">
                        <preview :material="material" :loading="loading" v-if="task.materialId"
                                 :signature="task.signature" :toolbar="false"></preview>
                        <p v-else class="none-material-tip">{{'journey.noContentSelected' | t}}</p>
                    </div>
                    <div v-if="task.subType===2">
                        <div style="padding-left:20px;" v-for="material in material.sendContentArr">
                            <div v-html="material"></div>
                        </div>
                    </div>
                </div>
                <span v-if="task.subType!==2">
                     <span class="preview-btn" @click="preview(material)" v-if="task.materialId">
                    <svg>
                        <path d="M22,0 L14,0 M22,0 L22,8 M22,0 L14, 8"></path>
                        <path d="M0,22 L8,22 M0,22 L0, 14 M0,22 L8, 14"></path>
                    </svg>
                </span>
                </span>
                <span v-else-if="task.subType===2">
                      <span class="preview-btn" @click="previewTemplate" v-if="task.materialId">
                    <svg>
                        <path d="M22,0 L14,0 M22,0 L22,8 M22,0 L14, 8"></path>
                        <path d="M0,22 L8,22 M0,22 L0, 14 M0,22 L8, 14"></path>
                    </svg>
                </span>
                </span>
            </div>
        </div>
        <div class="statistics-charts" v-if="task.sendStatus === 2 && taskType !== 2">
            <h5 v-if="0">{{'journey.sendStatus' | t}}
                <!--&nbsp;<router-link :to="detailReportRoute" target="_blank">{{'journey.checkFullStatus' | t}}&nbsp;&gt;</router-link>-->
            </h5>
            <div class="charts-row" v-if="isSMSTask">
                <div class="chart-cell">
                    <span class="icon icon-sms"></span>
                    <h3>{{taskStatus.pushNumber}}<span class="disabled-text">{{'data.noOfReception' | t}}</span></h3>
                </div>
                <div class="chart-cell">
                    <div class="tiny-chart" ref="pushBilling"></div>
                    <h3>{{taskStatus.pushBilling}}<span class="disabled-text">{{'data.sendTotalNum' | t}}</span></h3>
                </div>
                <div class="chart-cell">
                    <div class="tiny-chart" ref="sendNumber"></div>
                    <h3>{{taskStatus.sendNumber}}<span class="disabled-text">{{'data.sentTotalNum' | t}}</span></h3>
                </div>
                <div class="chart-cell">
                    <span class="icon icon-click"></span>
                    <h3>{{taskStatus.clickCount}}<span class="disabled-text">{{'data.clickLinkNum' | t}}</span></h3>
                </div>
                <div class="chart-cell">
                    <div class="tiny-chart" ref="ownClick"></div>
                    <h3>{{taskStatus.ownClick}}<span class="disabled-text">{{'data.uniqueClickLinkNum' | t}}</span></h3>
                </div>
            </div>
            <div class="charts-row" v-if="!isSMSTask">
                <div class="chart-cell">
                    <span class="icon icon-mail"></span>
                    <h3>{{taskStatus.sendNumber}}<span class="disabled-text">{{'data.recipientNum' | t}}</span></h3>
                </div>
                <div class="chart-cell">
                    <div class="tiny-chart" ref="pushBilling"></div>
                    <h3>{{taskStatus.pushBilling}}<span class="disabled-text">{{'data.sendNo' | t}}</span></h3>
                </div>
                <div class="chart-cell">
                    <div class="tiny-chart" ref="sendSuccess"></div>
                    <h3>{{taskStatus.sendSuccess}}<span class="disabled-text">{{'data.sendSuccessNo' | t}}</span></h3>
                </div>
                <div class="chart-cell">
                    <div class="tiny-chart" ref="softBounce"></div>
                    <h3>{{taskStatus.softbounce}}<span class="disabled-text">{{'data.softBounce' | t}}</span></h3>
                </div>
                <div class="chart-cell">
                    <div class="tiny-chart" ref="hardBounce"></div>
                    <h3>{{taskStatus.hardbounce}}<span class="disabled-text">{{'data.hardBounce' | t}}</span></h3>
                </div>
            </div>
            <div class="charts-row" v-if="!isSMSTask">
                <div class="chart-cell">
                    <div class="small-chart" ref="totalOpen"></div>
                </div>
                <div class="chart-cell">
                    <div class="small-chart" ref="independentOpen"></div>
                </div>
            </div>
        </div>

        <template v-slot:buttons>
            <input type="button" class="btn btn-white btn-md" :value="$t('common.close')"
                   @click="$emit('close')">
        </template>
        <!--微信模板预览-->
        <modal v-if="PreviewWechat" neat :title="$t('dragJourney.wechatTemplates')" @close="PreviewWechat=false">
            <div class="template-preview-wrapper">
                <div v-for="material in material.sendContentArr" v-html="material"></div>
            </div>
            <template v-slot:buttons>
                <button type="button"
                        class="btn btn-md btn-white"
                        @click="PreviewWechat = false">
                    {{'common.close' | t}}
                </button>
            </template>
        </modal>
    </modal>
</template>
<script type="text/ecmascript-6">
    import { mapState } from 'vuex';
    import { JourneyApiV1, SmsServiceApiV1, JourneyApiV3, JourneyMaterialApiV1, WechatApiV1} from '@/api';
    import Preview from '../../../material/preview.vue';
    import {getNakedBarOption, getTinyPieOption} from '../../../../data/report/journey/chartUtils/chartOptions';
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/pie';
    import 'echarts/lib/chart/bar';
    import {logError} from '../../../../monitor.js';
    import '../../../../data/report/journey/_chart.scss';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';

    const LOCAL_JOURNEY_DATA = 'LOCAL_JOURNEY_DATA';

    export default {
        props: {
            id: [String, Number],
            taskInstantiationId: [String, Number],
            journeyId: [String, Number],    // 模板ID
            journeyName: String,
            taskType: Number,   // 0：邮件，1：短信, 2：微信
            subType: Number,    // 0群发，1触发
            taskDate: String,
            headImg: String,
            tagId: Number,
            principalName: String,
            journeyStatus: Number    // 0:未开始 1:进行中 2:已结束 3:已取消
        },
        data() {
            return {
                material: {},
                loading: true,
                task: {
                    campaignId: '',
                    groupLIst: [],
                    id: 0,
                    journeyInstantiationId: '', // 所属旅程的实例ID
                    mailSubject: '',
                    materialId: 0,
                    prepositionTaskId: 0,
                    prepositionTaskName: '',
                    sendStatus: 0, // 0:等待发送 1:正在发送 2:发送完成 3:发送取消 4:任务异常
                    sendName: '',
                    sendAddress: '',
                    sendOutId: 0,
                    sendOutName: '',
                    signature: '',
                    senderId: 0,
                    taskDate: '',
                    taskName: '',
                    taskType: 1     // 1 代表短信, 0邮件，2微信
                },
                taskStatus: {
                    // sms & email
                    pushBilling: 0,     // 发送总数(条)
                    pushNumber: 0,      // 收件人数
                    sendNumber: 0,      // 送达总数(条)
                    clickCount: 0,      // 点击
                    ownClick: 0,        // 独立点击
                    // email
                    hardbounce: 0,      // 硬弹
                    openCount: 0,       // 打开总数
                    ownCto: 0,          // 独立打开率CTO
                    ownOpen: 0,         // 独立打开
                    softbounce: 0,      // 软弹
                    unSubscribe: 0      // 退订
                },
                tag: {          // 微信群发的用户标签组
                    id: '',
                    name: ''
                },
                BEHAVIORS: {
                    open: 'journey.response.open',
                    unopen: 'journey.response.unopen',
                    click: 'journey.response.click',
                    unclick: 'journey.response.unclick'
                },
                PreviewWechat: false
            };
        },
        computed: {
            ...mapState({
                journeyType: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation.journeyType,
                roleId: state => state.user.roleId
            }),
            isSMSTask() {
                return this.taskType === 1;
            },
            detailReportRoute() {
                let journeyData = {
                    dataSourceId: 1,
                    journeyId: this.journeyId,
                    taskId: this.task.taskInstantiationId
                };
                localStorage.setItem(LOCAL_JOURNEY_DATA, JSON.stringify(journeyData));
                // 0：邮件，1：短信, 2：微信 6：nike邮件分批次
                if (this.taskType === 1) {
                    return {name: 'smsSendReport'};
                } else if (this.taskType === 2) {
                    return {name: 'wechatSendReport'};
                } else if (this.taskType === 0 || this.taskType === 6) {
                    return {name: 'emailSendReport'};
                }
                logError(`[营销旅程] <detail-modal /> detailReportRoute 未能识别的素材(id:${this.id})类型{taskType:${this.taskType}} :276`);
                return '';
            },

        },
        mounted() {
            let taskId = this.id;
            let taskInstantiationId = this.taskInstantiationId;
            JourneyApiV3
                .taskInfo(taskId, taskInstantiationId)
                .then(({body: {data: {task}}}) => {
                    const wechatTask = this.taskType === 2;
                    this.$set(this.$data, 'task', task);
                    // 素材
                    if (this.subType !== 2) {
                        if (task.materialId) {
                            let materialPromise;
                            if (wechatTask) {
                                // fixme 从邮件素材的服务获取微信素材，需要确认
                                materialPromise = this.journeyStatus === 0
                                    ? JourneyMaterialApiV1.wechatImgText(task.materialId)
                                    : WechatApiV1.wechatImgTextCopy(task.materialId,this.journeyType);
                            } else {
                                materialPromise = this.journeyStatus === 0
                                    ? JourneyMaterialApiV1.getMaterial(task.materialId)
                                    : JourneyMaterialApiV1.getMaterialCopy(task.materialId);
                            }
                            materialPromise
                                .then(({body: {data: {material, materialInfo}}}) => {
                                    if (material) {
                                        this.material = material;
                                    } else {
                                        materialInfo.type = 5;
                                        this.$set(this.$data, 'material', materialInfo);
                                    }
                                    this.loading = false;
                                });
                        } else {
                            this.loading = false;
                        }
                    }
                    if (this.subType === 2) {
                        WechatApiV1
                            .templateCopyDetail(task.materialId)
                            .then(res => {
                                this.material = res.body.data.wxTemplateCopy;
                                // this.material.type=8;
                                // this.$set($data,'material',this.material)
                            });
                    }
                    if (wechatTask) {
                        if (this.subType === 0)
                            WechatApiV1
                                .getTags()
                                .then(({body: {data: {tags}}}) => {
                                    const tag = tags.find(tag => tag.id === task.tagId);
                                    if (tag) {
                                        this.tag.id = tag.id;
                                        this.tag.name = tag.name;
                                    }
                                });
                    } else {
                        // 获取前置任务名称
                        if (task.prepositionTaskId)
                            JourneyApiV3
                                .taskInfo(task.prepositionTaskId)
                                .then(({body: {data: {task}}}) => {
                                    this.$set(this.task, 'prepositionTaskName', task.taskName);
                                });
                        // 短信任务获取发送人信息
                        if (this.isSMSTask) {
                            SmsServiceApiV1
                                .getSendOutList()
                                .then(({body: {data: {sendouts}}}) => {
                                    sendouts.$key = 'sendoutId';
                                    let sender = sendouts.$getByKey(task.sendOutId);

                                    if (sender) {
                                        this.$set(this.task, 'sendOutName', sender.sendoutName);
                                        this.task.signature = sender.message; // message 就是签名
                                    }
                                });
                        }
                    }
                    // 已完成的任务要展示统计信息图表
                    // 0:等待发送 1:正在发送 2:发送完成 3:发送取消 4:任务异常
                    if (this.task.sendStatus === 2 && this.taskType !== 2) {
                        if (this.isSMSTask) {
                            SmsServiceApiV1
                                .getSMSTaskStatus(this.task.campaignId)
                                .then(({body: {data: taskStatus}}) => {
                                    this.$nextTick(() => {
                                        this.taskStatus = taskStatus;
                                        let pushBilling = echarts.init(this.$refs.pushBilling),
                                            sendNumber = echarts.init(this.$refs.sendNumber),
                                            ownClick = echarts.init(this.$refs.ownClick);
                                        pushBilling.setOption(getTinyPieOption(this.taskStatus.pushBilling, this.taskStatus.pushBilling, this.$t('data.sendTotalNum'), 'sms'));
                                        sendNumber.setOption(getTinyPieOption(this.taskStatus.sendNumber, this.taskStatus.pushBilling, this.$t('data.sentTotalNum'), 'sms'));
                                        ownClick.setOption(getTinyPieOption(this.taskStatus.ownClick, this.taskStatus.pushNumber, this.$t('data.uniqueClickLinkNum'), 'sms'));
                                    });
                                });
                        } else {
                            JourneyApiV1
                                .getEmailTaskStatistics(this.task.taskInstantiationId)
                                .then(({body: {data: taskStatus}}) => {
                                    this.taskStatus = taskStatus;
                                    this.$nextTick(() => {
                                        let pushBilling = echarts.init(this.$refs.pushBilling),
                                            sendSuccess = echarts.init(this.$refs.sendSuccess),
                                            hardBounce = echarts.init(this.$refs.hardBounce),
                                            softBounce = echarts.init(this.$refs.softBounce),
                                            totalOpen = echarts.init(this.$refs.totalOpen),
                                            independentOpen = echarts.init(this.$refs.independentOpen);
                                        pushBilling.setOption(getTinyPieOption(this.taskStatus.pushBilling, this.taskStatus.sendNumber, this.$t('data.sendNo'), 'email'));
                                        sendSuccess.setOption(getTinyPieOption(this.taskStatus.sendSuccess, this.taskStatus.sendNumber, this.$t('data.sendSuccessNo'), 'email'));
                                        hardBounce.setOption(getTinyPieOption(this.taskStatus.hardbounce, this.taskStatus.pushBilling, this.$t('data.hardBounce'), 'email'));
                                        softBounce.setOption(getTinyPieOption(this.taskStatus.softbounce, this.taskStatus.pushBilling, this.$t('data.softBounce'), 'email'));
                                        totalOpen.setOption(getNakedBarOption([
                                            {name: this.$t('data.openNum'), value: this.taskStatus.openCount},
                                            {name: this.$t('data.clickNum'), value: this.taskStatus.clickCount},
                                            {
                                                name: this.$t('data.opeCTO'),
                                                value: this.taskStatus.ownCto,
                                                percentage: true
                                            }
                                        ], this.taskStatus.sendNumber));
                                        independentOpen.setOption(getNakedBarOption([
                                            {name: this.$t('data.independenceOpenNum'), value: this.taskStatus.ownOpen},
                                            {
                                                name: this.$t('data.independenceClickNum'),
                                                value: this.taskStatus.ownClick
                                            },
                                            {name: this.$t('data.unSubscribe'), value: this.taskStatus.unSubscribe}
                                        ], this.taskStatus.sendNumber));
                                    });
                                });
                        }
                    }
                });
        },
        methods: {
            previewTemplate() {
                this.PreviewWechat = true;
            },
            // 预览
            preview(material) {
                // 主账号不做任何限制
                if (this.roleId === 0 || this.roleId === '') {
                    this.$preview({material, toolbar: false});
                    return;
                }
                // 权限校验
                JourneyMaterialApiV1
                    .sharingVerify({
                        materialId: material.id,
                        materialType: 1,
                        type: 2,
                        shareType: 4
                    })
                    .then(({body: {data: {isAccess}}}) => {
                        if (isAccess === 1) {
                            this.$preview({material, toolbar: false});
                        } else {
                            this.$toast(this.$t('material.sharingVerifyOption'), 'warn');
                        }
                    });
            }
        },
        components: {
            Preview
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .task-detail-modal {
        position: relative;
        white-space: nowrap;

        + .statistics-charts {
            h5 {
                padding: 0 24px 10px;
                border-bottom: 1px solid $content-bg;
                font-weight: normal;
                color: $color-light-content;
            }

            a {
                color: $theme;
                font-size: 12px;

                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }

    .task-details {
        display: inline-block;
        width: 50%;

        .task-detail {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-right: 24px;
            line-height: 18px;
            padding: 16px;
            background-color: $content-bg;

            &:not(:last-of-type) {
                margin-bottom: 16px;
            }

            &:before {
                content: attr(data-label);
                color: $color-light-content;
            }

            .detail-info-text {
                @include ellipsis();
                padding-left: 16px;
            }
        }
    }

    .task-detail-preview {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        left: 50%;
        border: 1px solid $border-color;
        @include border-radius(4px);

        .preview-box {
            overflow: auto;
            height: -webkit-calc(100% - 47px);
            height: calc(100% - 47px);
        }

        .none-material-tip {
            min-height: 200px;
            line-height: 200px;
            text-align: center;
            font-size: 12px;
            font-style: italic;
            color: $color-light-content;
        }

        h5 {
            line-height: 45px;
            text-indent: 1em;
            @include ellipsis();
            background-color: #f0f0f0;
        }

        .preview-btn {
            position: absolute;
            right: 17px;
            bottom: 17px;
            width: 34px;
            height: 34px;
            border: 1px solid #e0e0e0;
            @include border-radius(2px);
            cursor: pointer;

            &:hover {
                border-color: $border-color;
                @include box-shadow(0 0 3px $content-bg);

                path {
                    stroke: $border-color;
                }
            }

            svg {
                width: 22px;
                height: 22px;
                margin: 6px;

                path {
                    stroke-width: 2px;
                    stroke: #e0e0e0;
                    stroke-linejoin: round;
                    stroke-linecap: round;
                    fill: none;
                }
            }
        }
    }

    .template-preview-wrapper {
        width: 300px;
        margin: $input-field-height/2 auto;
        padding: $input-field-height / 2;
        border: 1px solid $form-border;
        line-height: $input-field-height;
        border-radius: 4px;
        background-color: $content-bg;
    }

</style>
