<template>
    <modal size="lg" :title="journeyType ? $t('dragJourney.timingTitle') : $t('dragJourney.realTitle')" @close="close">
        <div class="journey-confirm-modal">
            <div class="confirm-wrapper">
                <div>
                    <p class="title" v-if="journey.journeyType !== 2">{{journeyLanguage}} </p>
                    <p class="title">
                        {{'swarm.creator' | t}}
                        {{'punctuation.colon' | t}}
                        {{journey.createName}}</p>
                    <!-- <p class="title" v-if="journey.journeyType !== 2">{{journeyLanguage}} </p> -->
                    <!-- <p class="title">{{ $t('dragJourney.reach') }}</p> -->
                    <div class="clustering" v-if="journeyResult">
                        <div class="aside">
                            <!-- <span v-text="journeyType ? $t('dragJourney.segmentation') : $t('dragJourney.condition')"></span>:
                            <span class="theme-text" @click="reachShow=!reachShow">
                                {{ journeyType ? $t('dragJourney.groupingDetails') : $t('dragJourney.touchInvention') }}
                            </span> -->
                            <div v-if="!journeyType">
                                <span>{{'dragJourney.detailedConditions' | t}}: </span>
                                <eventModal :optionType="optionType" :controller="controller" :loading="false"
                                            :settingsObj="settings" :summary.sync="summary" :writable="false"></eventModal>
                            </div>
                            <div class="list" v-if="journeyType">
                                <inline-loading v-if="swarmFetching" offset="sm" />
                                <swarm-view-modal v-else-if="swarmIds && swarmIds.length > 0" :isConfirm="true" :journey="journey"
                                    :swarmIds="swarmIds" @isAdvance="isAdvance"/>
                                <span v-else>{{ $t('dragJourney.noClusteringData') }}</span>
                            </div>
                        </div>
                        <!--删除旅程确认窗口中的预估人数-->
                        <!--<p class="aside" v-if="journeyType">
                            {{ $t('dragJourney.tolalRecipents') }} {{ journeyResult.estimateCount }} （
                            {{ $t('dragJourney.mailbox') }} {{ journeyResult.estimateEmail }}，
                            {{ $t('dragJourney.phone') }} {{ journeyResult.estimateMessage }}，
                            {{ $t('dragJourney.wechat') }} {{ journeyResult.estimateWechat }} )
                            <i class="icon icon-yiwen1" v-title:top="$t('dragJourney.planningTip')"></i>
                        </p>-->
                        <!--<div class="aside" v-else>
                            <number-input v-model="estimatePeopleNumber" class="input"></number-input>
                            <span v-text="$t('dragJourney.unpredictable')"></span>
                        </div>-->
                    </div>
                </div>
                <div class="content">
                    <h4 class="title-text" @click="wecomPreview = true">{{ $t('dragJourney.tasks') }}</h4>
                    <ul class="task-list-wrapper" v-if="taskList" v-for="task in taskList">
                        <!--邮件-->
                        <li v-if="task.taskType === 0">
                            <span>{{'dragJourney.email' | t}}：{{task.taskName}}（{{task.mailSubject}}）</span>
                            <label class="theme-text" @click="previewMaterial(task.materialId, task.mailSubject)">
                                {{'dragJourney.preview' | t}}
                            </label>
                        </li>
                        <!--短信-->
                        <li v-if="task.taskType === 1">
                            <span>{{'dragJourney.sms' | t}}：{{task.taskName}}</span>
                            <label class="theme-text" @click="previewMaterial(task.materialId)">
                                {{'dragJourney.preview' | t}}
                            </label>
                        </li>
                        <!--微信-->
                        <li v-if="task.taskType === 2">
                            <!-- 微信-${任务类型}-${任务标题} -->
                            <span>{{'dragJourney.wechat' | t}} - {{wechatTypeHandler(task.subType)}}：{{task.taskName}}</span>
                            <label class="theme-text" @click="previewWxMaterial(task)">
                                {{'dragJourney.preview' | t}}
                            </label>
                        </li>
                        <!--彩信-->
                        <li v-if="task.taskType === 3">
                            <span>{{'dragJourney.mms' | t}}：{{task.taskName}}</span>
                            <label class="theme-text" @click="previewMaterial(task.materialId)">
                                {{'dragJourney.preview' | t}}
                            </label>
                        </li>
                        <!--应用消息-->
                        <li v-if="task.taskType === 10 && task.subType === 14">
                            <span>{{'dragJourney.agentmsg' | t}}：{{task.taskName}}</span>
                            <label class="theme-text" @click="previewMaterial(task.materialId,'',task.id)">
                                {{'dragJourney.preview' | t}}
                            </label>
                        </li>
                        <!--企业群发-->
                        <li v-if="task.taskType === 10 && task.subType === 15">
                            <span>{{'dragJourney.groupmsg' | t}}：{{task.taskName}}</span>
                            <label class="theme-text" @click="previewMaterial(task.materialId,'',task.id)">
                                {{'dragJourney.preview' | t}}
                            </label>
                        </li>
                    </ul>
                    <inline-loading v-else/>
                </div>
                <!--微信模板素材预览-->
                <modal class="lg" v-if="isTemplate" @close="isTemplate=false"
                       :title="$t('material.materialPreview') + '-' + wechatPreviewMaterial.title">
                    <div class="wechat-template">
                        <div v-for="list in (wechatPreviewMaterial.sendContentArr || wechatTemplateSendContentArr)"
                             v-html="list"></div>
                    </div>
                </modal>
                <!--申请审批-选择审批人（申请人）-->
                <template v-if="operateType === 1">
                    <!--测试状态下不显示-->
                    <div class="matter" v-if="startMethod !== 'test'">
                        <h4 class="title-text">{{'dragJourney.approver' | t}}</h4>
                        <selector class="xl" :options="approverList" v-model="approverId"
                                  :placeholder="$t('dragJourney.pickApprover')"
                                  @select="selectApprover($event)" search></selector>
                        <p class="note">
                            <svg :aria-disabled="true" class="icon">
                                <use xlink:href="#icon-warn"></use>
                            </svg>
                            {{ 'dragJourney.approveNote' | t }}
                        </p>
                    </div>
                    <div class="matter">
                        <h4>{{ $t('dragJourney.notices') }}</h4>
                        <restrictions :marginLeft0='true' v-if="isHw" :showLog='true' :isReadonly='true'></restrictions>
                        <p class="user-agree">
                            <label>
                                <checkbox v-model="isAgree"></checkbox>
                                {{ $t('dragJourney.notMessage') }}
                            </label>
                        </p>
                        <p class="user-agree">
                            <label>
                                <checkbox v-model="isAgreeAdd"></checkbox>
                                {{ $t('dragJourney.noteTips') }}
                            </label>
                        </p>
                        <p v-if="showAdvanceAgree" class="user-agree">
                            <label>
                                <checkbox v-model="isAdvanceAgree"></checkbox>
                                {{ $t('dragJourney.noteAdvanceTips') }}
                            </label>
                        </p>
                    </div>
                    <footer class="footer">
                        <wave-pending v-if="advanceAgreeLoading" />
                        <button v-else class="btn btn-theme btn-md" :disabled="!(isAgree && isAgreeAdd && ((showAdvanceAgree && isAdvanceAgree) || !showAdvanceAgree))"
                                @click="applyApprovalConfirm">{{'common.confirm' | t}}
                        </button>
                    </footer>
                </template>

                <!--旅程是待审批状态、是审批人-->
                <template v-if="operateType === 2">
                    <div class="matter">
                        <h4 class="title-text">{{'dragJourney.action' | t}}</h4>
                        <radio :source="0" v-model="approvalOperation" @click="approvalOperation=0">
                            {{'dragJourney.approve' | t}}
                        </radio>
                        <radio :source="1" v-model="approvalOperation" @click="approvalOperation=1">
                            {{'dragJourney.sendBack' | t}}
                        </radio>
                        <radio :source="2" v-model="approvalOperation" @click="approvalOperation=2">
                            {{'dragJourney.addApprover' | t}}
                        </radio>
                        <!--退回申请 可以审批，且 点击的按钮是审批-->
                        <template v-if="approvalOperation === 1">
                            <br>
                            <input class="input xl" type="text" v-model="reason"
                                   :placeholder="$t('dragJourney.inputReason')" maxlength="255">
                        </template>
                        <!--转交他人审批-->
                        <template v-if="approvalOperation === 2">
                            <br>
                            <selector class="xl" :options="approverList" v-model="approverId"
                                      :placeholder="$t('dragJourney.pickApprover')" @select="selectApprover($event)" search>
                            </selector>
                        </template>
                    </div>
                    <div class="matter">
                        <h4>{{ $t('dragJourney.notices') }}</h4>
                        <restrictions :marginLeft0='true' v-if="isHw" :showLog='true' :isReadonly='true'></restrictions>
                        <p class="user-agree">
                            <label>
                                <checkbox v-model="isAgree"></checkbox>
                                {{ $t('dragJourney.notMessage') }}
                            </label>
                        </p>
                        <p class="user-agree">
                            <label>
                                <checkbox v-model="isAgreeAdd"></checkbox>
                                {{ $t('dragJourney.noteTips') }}
                            </label>
                        </p>
                        <p v-if="showAdvanceAgree" class="user-agree">
                            <label>
                                <checkbox v-model="isAdvanceAgree"></checkbox>
                                {{ $t('dragJourney.noteAdvanceTips') }}
                            </label>
                        </p>
                    </div>
                    <footer class="footer">
                        <wave-pending v-if="advanceAgreeLoading" />
                        <button v-else class="btn btn-theme btn-md" :disabled="!(isAgree && isAgreeAdd && ((showAdvanceAgree && isAdvanceAgree) || !showAdvanceAgree))"
                                @click="confirmApproval">{{'common.confirm' | t}}
                        </button>
                    </footer>
                </template>

                <!--开始-->
                <div class="matter" v-if="operateType === 0">
                    <h4>{{ $t('dragJourney.notices') }}</h4>
                    <p class="user-agree">
                        <restrictions :marginLeft0='true' v-if="isHw" :showLog='true' :isReadonly='true'></restrictions>
                        <label>
                            <checkbox v-model="isAgree"></checkbox>
                            {{ $t('dragJourney.notMessage') }}
                        </label>
                    </p>
                    <p class="user-agree">
                        <label>
                            <checkbox v-model="isAgreeAdd"></checkbox>
                            {{ $t('dragJourney.noteTips') }}
                        </label>
                    </p>
                    <p v-if="showAdvanceAgree" class="user-agree">
                        <label>
                            <checkbox v-model="isAdvanceAgree"></checkbox>
                            {{ $t('dragJourney.noteAdvanceTips') }}
                        </label>
                    </p>
                    <footer class="footer">
                        <wave-pending v-if="advanceAgreeLoading" />
                        <template v-else>
                            <button class="btn btn-white btn-md" @click="close">{{ $t('dragJourney.cancel') }}</button>
                            <button class="btn btn-theme btn-md"
                                :disabled="!(isAgree && isAgreeAdd && ((showAdvanceAgree && isAdvanceAgree) || !showAdvanceAgree))"
                                @click="start">
                                {{$t('dragJourney.confirmStart') }}
                        </button>
                        </template>
                    </footer>
                </div>
            </div>
            <modal v-if="rushWindow" @close="rushWindow=false" :title="$t('dragJourney.refillReminder')">
                <p>{{ $t('dragJourney.refillMessage') }}</p>
                <div slot="buttons">
                    <button class="btn btn-theme btn-md" @click="rushWindow=false">{{ $t('dragJourney.roger') }}
                    </button>
                </div>
            </modal>
            <!-- 审批时检测出错弹出错误信息的窗口 -->
            <modal :title="$t('journey.validation')" v-if="validateModalShow" @close="validateModalShow=false">
                <div class="journey-validate-modal">
                    <div class="validate-process error" >
                        <img src="./validate-plane.png" alt="">
                        <div class="notice-test">
                            <p class="report">
                                {{'journey.validationComplete' | t}}
                                <span>{{'journey.validationFail' | t}}</span>
                                <br>
                                <span class="red-text">{{errorMessage}}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </modal>
            <!-- 审批时检测出错弹出错误信息的窗口end -->
            <!-- 企业微信相关任务预览 -->
            <wecom-preview v-if="wecomPreview"
                           :taskInfoList="wecomInfoList"
                           :subType="wecomSubtype"
                           @close="wecomPreview = false">
            </wecom-preview>
        </div>
    </modal>
</template>

<script lang="jsx">
    import { ContactApiV1, JourneyApiV3, ManageApi, JourneyMaterialApiV1, WechatApiV1 } from '@/api';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {UPDATE_JOURNEY} from '@/store/vuex/mutationTypes';
    import {trackEvent} from '@/monitor';
    import eventModal
        from '../../canvas/controller/sub-controllers/event-condition-controller/event-modal/event-modal.vue';
    import SwarmViewModal from '../../canvas/controller/sub-controllers/components/swarm-view-modal.vue';
    import restrictions from '../../../restrictions.vue';
    import { materialReMapper } from '@/journey/draggable-form/utils/configHandler';
    import MaterialEditor from '@/wechat/material/material-editor.vue';
    import WecomPreview from './wecom-preview.vue';
    import { mapState } from 'vuex';

    export default {
        name: 'journey-confirm',
        props: {
            // 操作类型 0 开始，1 申请审批，2 审批
            operateType: {
                type: Number,
                default: 0
            }
        },
        components: {eventModal,SwarmViewModal,restrictions, MaterialEditor, WecomPreview},
        data() {
            return {
                isAgree: false,
                isAgreeAdd: false,
                isAdvanceAgree: false,  //高级分群说明的勾选框是否勾选
                showAdvanceAgree: false,    //是否显示高级分群说明的勾选框
                advanceAgreeLoading: false,  //获取是否含有高级分群loading
                estimatePeopleNumber: 1000,
                reachShow: false,
                userSwarm: [], //分群明细
                swarmIds: [], // 分群id列表
                journeyResult: null,
                taskList: [],   // 任务列表
                rushWindow: false, // 充值弹窗
                allowance: {
                    smsSurplus: 0,
                    smsAbroadSurplus: 0,
                    mmsSurplus: 0,
                },
                approverList: [],   // 审批人列表
                approverId: '',     // 审批人id
                approvalOperation: '',  // 审批操作
                reason: '',  // 审批拒绝-理由
                wechatPreviewMaterial: {},// 模板消息
                wechatTemplateSendContentArr: [], // 模板消息预览内容
                isTemplate: false, // 模板消息预览
                settings: {},
                labelList: [],       // 华为cdp素材标签
                summary: '',
                validateModalShow: false, //检测弹窗是否开启
                swarmFetching: false,
                wecomPreview: false,    //企业微信相关任务预览
                wecomInfoList: [],   //企业微信相关任务预览信息
                wecomSubtype: 0      //企业微信区分控件类型 14应用消息 15企业群发
            };
        },
        watch: {
            // 审批状态（审批人）- 审批操作
            approvalOperation() {
                this.isAgree = false;   // 确认开始按钮
                this.isAgreeAdd = false;
                this.isAdvanceAgree = false;
                this.reason = '';       // 理由
                // 置空审批人id1
                this.UPDATE_JOURNEY({
                    approverId: ''
                });
            },
        },
        computed: {
            ...mapState({
                controllers: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.controllers,
                canvasInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation,
                user: state => state.user,
                swarmId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].swarmId,
                startMethod: state => state[DRAGGABLE_JOURNEY_STORE_NAME].startMethod,
                journey: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                cptApproverId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation.approverId,
                roleId: state => state.user.roleId,
                storeSwarmId: state =>  state.canvasStore.swarmId
            }),
            // 是否可以审批
            isApproval() {
                return this.$store.getters.journeyApprove;
            },
            controller() {
                return this.controllers[Object.keys(this.controllers)[0]];
            },
            trigger() {
                // 0 当会员触发事件时,
                // 1 当会员属性变更时,
                return ~~this.controller.processInfo.tigger;
            },
            optionType() {
                return this.trigger ? 'newJourneyAttr' : 'newJourneyEvent';
            },
            journeyType() {
                return (this.journey && this.journey.journeyType) === 1 || this.journey.journeyType === 0;
            },
            // 旅程语言显示
            journeyLanguage() {
                let pre = this.$t('newJourney.lng');
                switch (this.journey.language) {
                    case 1:
                        return pre + this.$t('newJourney.chinese');
                    case 2:
                        return pre + this.$t('newJourney.others');
                    case 0:
                    default:
                        return pre + this.$t('newJourney.all');
                }
            },
            // 华为账号
            isHw() {
                return this.user.companyType === 1;
            },
        },
        mounted() {
            this.configAllowance();
            this.getAffirm();
            this.fetchTaskList();
            this.fetchApprovalList();
            // 获取旅程审批人ID
            this.approverId = this.cptApproverId;
            this.settings = this.controller.processInfo ? this.controller.processInfo.decision.settings : {};
            this.summary = this.controller.summary ? this.controller.summary : '';
        },
        methods: {
            ...mapState({
                UPDATE_JOURNEY,
            }),
            close() {
                this.$emit('close');
            },
            start() {
                if (
                    !this.advanceAgreeLoading &&
                    this.isAgree &&
                    this.isAgreeAdd &&
                    ((this.showAdvanceAgree && this.isAdvanceAgree) || !this.showAdvanceAgree)
                ) {
                    /**
                     * 定时旅程(true) & 实时旅程(false)
                     * */
                    if (this.journeyType) {
                        this.$emit('start');
                    } else {
                        // 实时旅程
                        // test-实时旅程 正式-实时旅程
                        // 正式实时旅程调用 start
                        if (!this.swarmId && (this.startMethod === 'start' || this.startMethod === 'suspend')) {
                            this.$emit('start');
                        } else {
                            // test save swarmId
                            this.$emit('test', this.swarmId);
                        }
                    }

                    this.close();
                }
            },
            closeBlur() {
                this.reachShow = false;
            },
            // 获取开启确认数据
            getAffirm() {
                if (this.journey && this.journey.id) {
                    if (this.journeyType) this.advanceAgreeLoading = true;
                    this.swarmFetching = true;
                    JourneyApiV3
                        .getTaskAffirm(this.journey.id)
                        .then(({body: {data}}) => {
                            this.journeyResult = data;
                            return this.journeyResult.swarmId;
                        })
                        .then(swarmId => {
                            // 定时旅程
                            if (this.journeyType) {
                                ContactApiV1
                                    .getSwarms()
                                    .then(({body: {data: {swarmList}}}) => {
                                        if (swarmId.length > 0) {
                                            this.userSwarm = swarmList.filter(swarm => swarmId.includes(swarm.id));
                                            this.swarmIds = this.userSwarm.map(e => e.id);
                                            if (!this.userSwarm.length) {
                                                ContactApiV1
                                                    .getSwarmCount({
                                                        journeyCreateBy: this.journey.createBy,
                                                        swarmIds: swarmId.map(String).join(',')
                                                    })
                                                    .then(({ body: { data } }) => {
                                                        const { haveHighSwarm } = data;
                                                        this.isAdvance(haveHighSwarm);
                                                    });
                                            }
                                        } else {
                                            this.userSwarm = [];
                                            this.swarmIds = [];
                                            this.advanceAgreeLoading = false;
                                        }
                                        this.swarmFetching = false;
                                    })
                                    .catch(() => {
                                        this.swarmFetching = false;
                                        this.advanceAgreeLoading = false;
                                    });
                            }
                        });
                }
            },
            // 预览校验
            async previewValid(id) {
                let hasAccess = '';
                // 主账号不做任何限制
                if (this.roleId === 0 || this.roleId === '') {
                    hasAccess = 1;
                } else {
                    // 权限校验
                    hasAccess = await JourneyMaterialApiV1
                        .sharingVerify({
                            materialId: id,
                            materialType: 1,
                            type: 2,
                            shareType: 4
                        })
                        .then(({body: {data: {isAccess}}}) => {
                            if (isAccess !== 1) {
                                this.$toast(this.$t('material.sharingVerifyOption'), 'warn');
                            }
                            return isAccess;
                        });
                }
                return hasAccess;
            },
            // 预览素材
            async previewMaterial(materialId, mailSubject, wecomId) {
                // 华为cdp获取标签
                if (this.isHw) {
                    let data = await JourneyMaterialApiV1.previewMaterialLabel(materialId)
                        .then(({body: {data}}) => data);
                    this.labelList = data.labelList;
                }
                if (wecomId) {      //企业微信素材数据初始化
                    let taskItem = this.taskList.filter(task => task.id === wecomId)[0];
                    this.wecomSubtype = taskItem.subType;
                    if (taskItem.subType === 14) {
                        this.wecomInfoList = JSON.parse(taskItem.applicationDetail);
                    } else {
                        this.wecomInfoList = JSON.parse(taskItem.workWechatMsg);
                        let textObj = {
                            msgtype: 'text',
                            text: {
                                content: JSON.parse(taskItem.wxContext).text
                            }
                        };
                        this.wecomInfoList.unshift(textObj);
                    }
                    this.wecomPreview = true;
                } else {
                    this.wecomSubtype = 0;
                    this.wecomInfoList = [];
                    // get material
                    let previewMaterial;
                    for (let i = 0, len = this.taskList.length; i < len; i++) {
                        if (this.taskList[i].isBatchTask) {    //nike分批次发送
                            JourneyMaterialApiV1
                                .getMaterialCopy(materialId)
                                // TODO: not clear
                                // eslint-disable-next-line no-loop-func
                                .then(res => {
                                    let material = res.body.data.material;
                                    material.subject = mailSubject;// 邮件主题
                                    previewMaterial = Object.assign({}, material);
                                    this.$preview({material: res.body.data.material});
                                });
                        } else {
                            JourneyMaterialApiV1
                                .getMaterial(materialId)
                                // TODO: not clear
                                // eslint-disable-next-line no-loop-func
                                .then(async res => {
                                    let material = res.body.data.material;
                                    material.subject = mailSubject;// 邮件主题
                                    previewMaterial = Object.assign({}, material);
                                    let access = await this.previewValid(material.id);
                                    if (mailSubject) {
                                        // get e-mail html content
                                        JourneyMaterialApiV1
                                            .getEmailHtml(previewMaterial.id)
                                            .then(res => {
                                                previewMaterial.materialContent = res.body.materialContent;
                                            });
                                        // 华为cdp获取标签
                                        if (this.isHw) {
                                            // preview
                                            this.$preview({material: previewMaterial, labelList: this.labelList});
                                        } else if (access === 1) {
                                            // preview
                                            this.$preview({material: previewMaterial});
                                        }
                                    } else if (access === 1) {
                                        this.$preview({material: res.body.data.material, toolbar: false});
                                    }
                                });
                        }
                    }
                }
            },
            /**
             * 微信素材预览
             * @param {object} task 任务信息
             */
            previewWxMaterial(task) {
                const { subType, materialId } = task;
                let previewMaterial;
                if (subType === 2) { // 模板消息
                    WechatApiV1
                        .templateDetails(materialId)
                        .then(res => {
                            this.wechatPreviewMaterial = res.body.data.wxTemplate;

                            this.wechatTemplateSendContentArr = [];
                            if (this.wechatPreviewMaterial) {
                                this.isTemplate = true;
                                this.wechatTemplateSendContentArr = this.wechatPreviewMaterial.content
                                    .map(({content, sendContent}) => {
                                        let color = '', text = '';
                                        const match = /^(.*){{(.+)\..+}}$/.exec(content);
                                        if (match) {
                                            text += match[1];
                                            let key = match[2];
                                            let targetContent = sendContent.find(sc => sc[key]);
                                            if (targetContent) {
                                                color = targetContent[key].color;
                                                text += targetContent[key].value;
                                            }
                                        }
                                        return `<span style="color: ${color};">${text}</span>`;
                                    });
                            }
                            return this.wechatTemplateSendContentArr;
                        });
                } else if ([0, 1, 4, 5, 6, 11, 12, 13].includes(task.subType)) {
                    // 群发/客服：图文、图片、音频、视频走接口获取详情

                    // get material
                    WechatApiV1
                        .getMaterial(materialId)
                        .then(res => {
                            previewMaterial = Object.assign({}, res.body.data.material);
                            if (previewMaterial) {
                                if (subType === 0 || subType === 1) {
                                    // 图文消息预览原方法
                                    this.$preview({material: previewMaterial, toolbar: false});
                                } else if (previewMaterial.url) {
                                    if (subType === 6 || subType === 13) {
                                        // 视频类型的历史数据，如果用了未通过审核的视频，则提示无法预览
                                        if (previewMaterial.url.indexOf('mp.weixin.qq.com') < 0) {
                                            this.$toast(this.$t('controller.noPreview'), 'warn');
                                            return;
                                        }
                                    }
                                    // 图片、音频、视频打开新页面预览
                                    let dom = document.createElement('a');
                                    dom.href = previewMaterial.url;
                                    dom.target = '_blank';
                                    dom.style.display = 'none';
                                    document.body.appendChild(dom);
                                    dom.click();
                                    document.body.removeChild(dom);
                                } else {
                                    this.$toast(this.$t('controller.noPreview'), 'warn');
                                }
                            } else {
                                this.$toast(this.$t('controller.noPreview'), 'warn');
                            }
                        });
                } else {
                    materialReMapper(task)
                        .then(config => {
                            this.$confirm(this.$t('controller.preview_material'), this.renderPreview(config), '', '', false, false, 'lg');
                        });
                }
            },
            // 获取旅程任务列表
            fetchTaskList() {
                JourneyApiV3
                    .getTaskList(this.journey.id)
                    .then(res => {
                        this.taskList = res.body.data.taskList;
                    });
            },
            // 获取审批人列表
            fetchApprovalList() {
                ManageApi
                    .getApprovalList()
                    .then(res => {
                        this.approverList = res.body.data.list;
                        // 主账号不显示部门
                        this.approverList.map(a => {
                            if (a.roleId !== 0 && a.roleId !== '') {
                                a.name = a.name + ' （  ' + a.department + ' ）';
                            }
                        });
                    });
            },
            // 选择审批人（申请人）
            selectApprover(event) {
                this.approverId = event.id;
                this.UPDATE_JOURNEY({
                    approverId: this.approverId
                });
            },
            // 申请审批确认
            applyApprovalConfirm() {
                if (
                    !this.advanceAgreeLoading &&
                    this.isAgree &&
                    this.isAgreeAdd &&
                    ((this.showAdvanceAgree && this.isAdvanceAgree) || !this.showAdvanceAgree)
                ) {
                    // 立即测试
                    if (this.startMethod === 'test') {
                        let testSwarmId = this.storeSwarmId;
                        JourneyApiV3
                            .testJourney(this.journey.id, testSwarmId)
                            .then(() => {
                                window.setTimeout(() => {
                                    window.location.reload();
                                }, 300);
                                this.close();
                                trackEvent('开始测试旅程');
                            });
                    } else {
                        // 申请审批
                        if (!this.approverId) {
                            // 申请审批状态-审批人校验 （申请人）
                            this.$toast(this.$t('dragJourney.pickApprover'), 'warn');
                            return;
                        }
                        JourneyApiV3
                            .pendingJourney(this.journey.id, this.approverId)
                            .then(res => {
                                this.$toast(res.body.message, 'success');
                                window.setTimeout(() => {
                                    window.location.reload();
                                }, 300);
                                this.close();
                            });
                    }
                }
            },
            //如果选择同意，需要判断一下权限
            checkJourney(){
                this.requesting = true;
                const approval = 0;//是否提交检测 0:未提交 1：提交
                JourneyApiV3
                    .checkJourneyApproval(this.journey.id,approval)
                    .then(({body: {data: {error, id, status}}}) => {
                        this.errorId = id;
                        this.errorMessage = error;
                        this.requesting = false;
                        this.fill = 100;

                        if (status === 0) {
                            this.isAgree = true;
                            this.isAgreeAdd = true;
                            this.isAdvanceAgree = true;
                            this.start();
                        } else {
                            this.validateModalShow = true;
                        }
                    });
            },
            // 审批状态-确定
            confirmApproval() {
                switch (this.approvalOperation) {
                    // 通过审批-开始旅程
                    case 0:
                        this.checkJourney();
                        break;
                    //拒绝，填写理由
                    case 1:
                        if (!this.reason) {
                            this.$toast(this.$t('dragJourney.inputReason'), 'warn');
                            return;
                        }
                        JourneyApiV3
                            .rejectedPending(this.journey.id, this.reason)
                            .then(res => {
                                this.$toast(res.body.message, 'success');
                                this.close();
                                window.location.reload();
                            });
                        break;
                    //转交，选择审批人
                    case 2:
                        this.UPDATE_JOURNEY({
                            approverId: this.approverId
                        });
                        if (this.isApproval && !this.approverId) {
                            this.$toast(this.$t('dragJourney.pickApprover'), 'warn');
                            return;
                        }
                        JourneyApiV3
                            .pendingJourney(this.journey.id, this.approverId)
                            .then(res => {
                                this.$toast(res.body.message, 'success');
                                this.close();
                                window.location.reload();
                            });
                        break;
                    // 不选择审批操作
                    default:
                        this.$toast(this.$t('dragJourney.operateTypeNull'), 'warn');
                        break;
                }
            },
            /**
             * 此方法主要验证余量是否足够
             * @param type
             * @return {boolean}
             */
            isEnough(type) {
                const {smsSurplus, mmsSurplus} = this.allowance;
                const {estimateMessage, messageTask, mmsTask} = this.journeyResult;

                if (this.journeyType) {
                    if (type === 'sms') return smsSurplus < estimateMessage * messageTask;
                    if (type === 'mms') return mmsSurplus < estimateMessage * mmsTask;
                } else {
                    if (type === 'sms') return smsSurplus < this.estimatePeopleNumber * messageTask;
                    if (type === 'mms') return mmsSurplus < this.estimatePeopleNumber * mmsTask;
                }
            },
            // 同步余量到当前组件
            configAllowance() {
                for (let key of Object.keys(this.allowance)) {
                    if (this.user && this.user.hasOwnProperty(key)) {
                        this.allowance[key] = this.user[key];
                    }
                }
            },
            /**
             * 根据任务subType，返回对应文字 ps:为什么不用wechatType？因为接口没正确返回
             * 0群发图文 1客服图文 2模版消息 3客服文本 4客服图片 5客服音频 6客服视频 7客服外部页面
             * 8客服表单 9客服小程序卡片 10群发文本 11群发图片 12群发音频 13群发视频
             */
            wechatTypeHandler(type) {
                const mass = this.$t('dragJourney.massSend') + '-',
                    service = this.$t('dragJourney.wechatMessages') + '-';
                switch (type) {
                    case 0:
                        return mass + this.$t('QRCode.appMsg');
                    case 1:
                        return service + this.$t('QRCode.appMsg');
                    case 2:
                        return this.$t('dragJourney.wechatTemplates');
                    case 3:
                        return service + this.$t('QRCode.text');
                    case 4:
                        return service + this.$t('QRCode.pics');
                    case 5:
                        return service + this.$t('QRCode.audio');
                    case 6:
                        return service + this.$t('QRCode.video');
                    case 7:
                        return service + this.$t('QRCode.webPage');
                    case 8:
                        return service + this.$t('QRCode.forms');
                    case 9:
                        return service + this.$t('QRCode.miniApp');
                    case 10:
                        return mass + this.$t('QRCode.text');
                    case 11:
                        return mass + this.$t('QRCode.pics');
                    case 12:
                        return mass + this.$t('QRCode.audio');
                    case 13:
                        return mass + this.$t('QRCode.video');
                }
            },
            renderPreview(material) {
                return (
                    <materialEditor
                        value={material}
                        {...{
                            on: {
                                input: value => {
                                    material = value;
                                }
                            }
                        }}
                        types={[material.type]}
                        for-journey-use
                        is-checking />
                );
            },
            /**
             * 获取分群是否存在高级分群
             * num 不存在：0，存在：1
             */
            isAdvance(num) {
                this.showAdvanceAgree = num ? true : false;
                this.advanceAgreeLoading = false;
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    %border-bottom {
        padding-bottom: 10px;
        border-bottom: double 1px $border-color;
    }

    .journey-confirm-modal {
        .theme-text {
            cursor: pointer;
        }

        .confirm-wrapper {
            .clustering {
                width: 100%;
                @include clearfix();
                @include box-sizing();
                @extend %border-bottom;

                .aside {
                    position: relative;
                    float: left;
                    width: 100%;

                    .list {
                        @include box-sizing();
                        background-color: #fff;
                        overflow-y: auto;
                    }

                    & > span:nth-child(2) {
                        cursor: default;
                    }
                }
            }

            .content {
                @extend %border-bottom;

                h4 {
                    font-size: 14px;
                    line-height: 20px;
                    font-weight: bold;
                }

                .task-list-wrapper {
                    @include user-select(none);

                    li {
                        display: flex;
                        flex-wrap: nowrap;

                        & > span {
                            display: inline-block;
                            width: 92%;
                        }

                        .recharge {
                            margin-left: 4px;

                            span {
                                cursor: pointer;
                            }
                        }
                    }
                }

                & > p:last-child {
                    text-align: right;
                    font-size: 12px;
                    @include transform(scale(.9));

                    &:before {
                        content: '*';
                        color: $red;
                        display: inline-block;
                        margin-right: 4px;
                    }
                }
            }

            .matter {
                @extend %border-bottom;

                h4 {
                    font-size: 14px;
                    line-height: 20px;
                    font-weight: bold;
                }

                .user-agree {
                    margin: 4px 0 0 0px;
                    line-height: 14px;
                }

                .note {
                    svg {
                        width: 16px;
                        height: 16px;
                        vertical-align: -4px;
                    }
                }
            }

            .footer {
                margin-top: 10px;
            }
        }

        .wechat-template {
            width: 320px;
            min-height: 200px;
            margin: auto;
            padding: 16px;
            border: 1px solid $border-color;
            border-radius: 4px;
            background-color: $content-bg;
        }
    }

    .journey-validate-modal {
        .validate-process {
            padding: 20px 45px 0;

            img {
                position: relative;
                display: block;
                margin: 45px auto 60px;
            }
        }

        .notice-test {
            line-height: 1.6em;

            .report {
                margin-bottom: 15px;
                font-size: 14px;
                font-weight: bold;

                span:last-child {
                    line-height: 1.8em;
                }
            }
        }
    }
</style>
