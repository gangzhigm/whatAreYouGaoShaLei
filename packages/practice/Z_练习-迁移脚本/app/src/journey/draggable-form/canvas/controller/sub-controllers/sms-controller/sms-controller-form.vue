<template>
    <modal class="sms-controller-form" :title="controller.name || $t('controller.send_message')" size="lg"
           @close="cancel()">
        <p v-if="controller.id===validationResult.errorId" class="error-message">
            {{validationResult.errorMessage}}
        </p>
        <div class="form-field flex">
            <label class="label" for="taskName">{{$t('controller.step_title')}}</label>
            <span v-if="isChecking">{{task.taskName}}</span>
            <div v-else class="field-group">
                <input type="text" maxlength="200" v-model.trim="task.taskName" class="input xl" id="taskName">
            </div>
        </div>
        <div class="form-field flex timer">
            <template v-if="journeyInformation.journeyType === 2">
                <label class="label">{{$t('controller.send_wait')}}</label>
                <span v-if="isChecking">
                    {{task.immediately ? timeOptions.$getByKey(task.immediately).name : ''}}
                    <span v-if="task.immediately === 0">{{delayTime}}</span>
                    <span v-if="task.immediately === 2">
                        {{taskDay}}
                        {{taskHourAndMinute}}
                        {{getSendBehavior(task.sendBehavior)}}
                        {{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}
                    </span>
                </span>
                <div v-else class="field-group">
                    <selector :options="timeOptions"
                              :value="task.immediately"
                              @input="toggleImmediately"/>
                    <!-- 等待 -->
                    <delay-time-picker v-if="task.immediately === 0"
                                       v-model="delayTime"/>
                    <!-- 定时 -->
                    <template v-if="task.immediately === 2">
                        <calendar v-model="taskDay" :showTodayBtn="false"/>
                        <hour-minute-select v-model="taskHourAndMinute"/>
                        <br>
                        <radio :source="0" v-model="sendBehavior">
                            {{'controller.stopWhenExpired' | t}}
                        </radio>
                        <radio :source="1" v-model="sendBehavior">
                            {{'controller.realTimeWhenExpired' | t}}
                        </radio>
                        <i class="action-icon icon icon-help" v-title:bottom="$t('controller.expireTip')"></i>
                        <p>{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
                    </template>
                </div>
            </template>
            <template v-else>
                <label class="label">{{'journey.sendTime' | t}}</label>
                <span v-if="isChecking">
                    {{timeFormatText}}
                    <span v-if="timeType === 0">{{taskDay}}</span>
                    <span v-if="timeType === 1">
                        {{'controller.the' | t}}{{task.days}}{{'controller.dayA' | t}}
                    </span>
                    {{taskHourAndMinute}}
                    {{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}
                </span>
                <div v-else class="field-group">
                    <span class="title-text"> {{timeFormatText}} </span>
                    <calendar v-if="timeType === 0"
                              v-model="taskDay"
                              :start="today" :showTodayBtn="false"/>
                    <template v-if="timeType === 1" class="relative-time">
                        {{'controller.the' | t}}
                        <number-input class="input tiny" :min="1" :max="30"
                                      v-model="task.days"/>
                        {{'controller.dayA' | t}}
                    </template>
                    <hour-minute-select v-model="taskHourAndMinute"/>
                    <p>{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
                </div>
            </template>
        </div>
        <div class="form-field flex">
            <label class="label">{{'controller.smsSignature' | t}}</label>
            <span v-if="isChecking">
                {{smsSignature}}
            </span>
            <div v-else class="field-group">
                <selector :options="signatureList"
                          :search="signatureList.length > 10"
                          v-model="task.sendOutId"
                          :placeholder="$t('controller.smsSignature')"
                          class="xl"/>
            </div>
        </div>
        <div class="form-field" v-if="journeyInformation.journeyType === 2">
            <span class="label placeholder"></span>
            <checkbox v-model="milestone" :disabled="isChecking">{{'controller.set_milestone' | t}}</checkbox>
            <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
        </div>
        <div class="form-field flex">
            <label class="label">{{$t('controller.smsContent')}}</label>
            <div class="field-group">
                <!--查看模式-->
                <template v-if="isChecking">
                    <inline-loading v-if="materialLoading"/>
                    <template v-if="!materialLoading">
                        <div class="sms-content" v-if="creatSMS.materialContent">
                            <textarea class="textarea" readonly v-model="creatSMS.materialContent"></textarea>
                        </div>
                        <p v-else>{{'common.noData' | t}}</p>
                    </template>
                </template>
                <div v-show="!isChecking" class="sms-content" :class="{'has-border': materialStoreShow}">
                    <div v-if="!materialStoreShow&&!creatSMS._display" class="select-material"
                         @click.stop="browseMaterialList()"><img src="../select-material.png" alt="select-material">
                        {{'controller.choose_a_material' | t}}
                    </div>
                    <div v-if="!materialStoreShow&&!creatSMS._display" class="add-material"
                         @click.stop="creatSMSMaterial()"><img src="../add-material.png" alt="add-material">
                        {{'controller.createSMS' | t}}
                    </div>
                    <template v-if="creatSMS._display&&!materialStoreShow">
                        <div class="sms-form-panel">
                            <selector :options="creatSMS.fields" @select="insertField($event)"
                                      :placeholder="$t('journey.insertField')"></selector>
                            <input type="text" class="input lg overlap-right" v-model="creatSMS.shortUrl"
                                   :placeholder="$t('material.shortUrlPlaceholder')">
                            <input type="button" :value="$t('controller.insert_short_link')"
                                   class="btn btn-md btn-white overlap-left" @click="insertUrl()">
                        </div>
                        <inline-loading v-if="materialLoading"/>
                        <div v-else>
                            <div class="content-wrapper" v-if="!$has('journey_material_edit_material') && editValid">
                                <textarea class="textarea" v-model="creatSMS.materialContent" ref="textarea"
                                          @input="contentValueListener($event)"></textarea>
                                <div class="placeholder-content" v-if="placeholdersFlag" @click="focusTextarea">
                                    <billing-rules ></billing-rules>
                                </div>
                            </div>
                            <textarea v-else class="textarea" readonly v-model="creatSMS.materialContent"></textarea>

                            <div class="drop-rule-wrapper" @click.stop>
                                <div class="field-group content-count-text">
                                    <div>
                                        <template v-if="creatSMS._display&&!materialStoreShow">
                                            {{$t('controller.length')}}
                                            <b v-if="journeyInformation.journeyType === 2" class="red-text"
                                               v-text="contentCount+signatureLength?contentCount+signatureLength:0"></b>
                                            <b v-else class="red-text"
                                               v-text="contentCount+signatureLength?contentCount+signatureLength:4"></b>
                                            {{$t('material.char')}}, {{'material.smsNumber' | t}}
                                            <b class="red-text"
                                               v-text="(contentCount+signatureLength)>70?Math.ceil((contentCount+signatureLength)/67):1"></b>
                                            {{$t('controller.sms')}}
                                            <template v-if="journeyInformation.journeyType !== 2">
                                                <span class="red-text">{{'material.sendingSMS' | t}}</span>
                                            </template>
                                        </template>
                                        <template v-else>
                                            {{$t('controller.length')}}
                                            <b v-text="signatureLength?signatureLength + 4:4" class="red-text"></b>
                                            {{$t('material.char')}}, {{'material.smsNumber' | t}}
                                            <b v-text="(signatureLength + 4)>70?Math.ceil((signatureLength + 4)/67):1" class="red-text"></b>
                                            {{$t('controller.sms')}}
                                            <span class="red-text">{{'material.sendingSMS' | t}}</span>
                                        </template>
                                    </div>
                                    <div class="view-rules" @click="viewDropRules">
                                        <span>{{'material.billingRuleTitle' | t}}</span>
                                        <div class="drop-arrow" :class="{'drop-active':dropRuleFlag}">
                                            <svg aria-hidden="true">
                                                <use xlink:href="#icon-start1"></use>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div class="content-count-text drop-rule" v-if="dropRuleFlag">
                                    <billing-rules ></billing-rules>
                                </div>
                            </div>
                        </div>
                    </template>
                    <material-store v-show="materialStoreShow&&!creatSMS._display" :smsStatus="smsStatus"
                                    v-model="task.materialId" type="sms" :unit="70" ref="materialStore"
                                    @choose="selcetSms"
                                    @reset="deleteMaterial()"></material-store>
                    <!--返回列表-->
                    <div class="reset-actions" v-if="creatSMS._display&&!materialStoreShow">
                        <button type="button" class="icon icon-reset addcurstou" @click="backList"
                                v-title:top="$t('journey.reselect')"></button>
                        <button type="button" class="icon icon-delete addcurstou" @click="deleteList"
                                v-title:top="$t('common.del')"></button>
                    </div>
                </div>
            </div>
        </div>
        <template v-if="!isChecking" v-slot:buttons>
            <button class="btn btn-md btn-white" @click.stop="testMaterial(task.materialId)"
                    :disabled="!task.materialId || $has('journey_material_test_material')">
                {{'material.test' | t}}
            </button>
            <button class="btn btn-md btn-theme" @click.stop="confirm()">{{'common.confirm' | t}}</button>
        </template>
        <template v-else v-slot:buttons>
            <button class="btn btn-md btn-white" @click="cancel">{{'common.close' | t}}</button>
        </template>
    </modal>
</template>

<script type="text/ecmascript-6">
    import { ContactApiV1, OriginSmsExportApiV1,JourneyApiV3, JourneyMaterialApiV1 } from '@/api';
    import cloneDeep from 'lodash/cloneDeep';
    import format from 'date-fns/format';
    import MaterialStore from './smsMateralStore.vue';
    import DelayTimePicker from '../components/delay-time-picker.vue';
    import {COMMON_WEIXIN_URL_REGEXP, COMMON_URL_REGEXP} from '../../../../../../common/utils/regs';
    import getCursorPosition from '../../../../../../common/utils/cursorPosition';
    import {UNSUBSCRIBE_SMS_POSTFIX} from '../../../../../material/form/sms-material-form.vue';
    import {
        ADD_MILESTONE,
        REMOVE_MILESTONE,
        UPDATE_CONTROLLER,
        UPDATE_SAVE_TASK_STATUS
    } from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {CHECK_JOURNEY_NEW_VERSION, SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import {logError} from '../../../../../../monitor';
    import {TIME_ZONE_RNAGES, timeZoneToday} from '@/common/utils/timeZone';
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
    import BillingRules from '../../../../../material/form/billing-rules.vue';
    const LINK_REG = /<url>.*?<\/url>/gi;
    
    export default {
        components: {MaterialStore, DelayTimePicker, BillingRules},
        props: {
            controller: Object,
            signatureList: Array
        },
        data() {
            return {
                milestone: 0,
                UNSUBSCRIBE_SMS_POSTFIX,
                task: {
                    taskId: null,
                    taskName: '',
                    materialId: null,
                    sendOutId: '',  // 签名id
                    sendBehavior: '', // 0 过期停止 1 过期即时
                    immediately: '', // 0 等待，1 即时，2 定时
                    days: '',
                    relativeTime: '',
                    taskDate: ''
                },
                timeOptions: [
                    {id: 1, name: this.$t('controller.immediate')}, // 即时
                    {id: 0, name: this.$t('controller.after')}, // 等待
                    {id: 2, name: this.$t('controller.absolute')}, // 定时
                ],
                creatSMS: {
                    _display: false,
                    fields: [],
                    shortUrl: '',
                    materialContent: '',
                    materialName: ''
                },
                materialStoreShow: false,
                smsStatus: null,
                newCreatStatus: 0,
                timer: TIME_ZONE_RNAGES,
                signature: {}, // 短信活动
                materialLoading: true, // 素材loading

                placeholdersFlag: true,
                dropRuleFlag: false,
                editValid: false,   //短信共享编辑权限
            };
        },
        created() {
            // prepare this.task for editing
            this.$set(this.$data, 'task', Object.assign({}, this.controller.pushInfo));
            this.task.days === null && (this.task.days = '');
            !this.task.taskName && (this.task.taskName = this.controller.name);
            // 0 等待，1即时，2定时
            this.task.immediately = ~~this.task.immediately;

            // prepare milestone for editing
            this.milestone = this.isAMileStone;

            if (this.controller.pushInfo.materialId) {
                this.task.materialId = this.controller.pushInfo.materialId;
                this.creatSMS._display = true;
                this.materialStoreShow = false;
                this.materialLoading = false;
                // Fix-9094 旅程待审批不可编辑， 但旅程还未开始
                if (this.writable || this.statusApprove) {
                    this.materialLoading = true;
                    JourneyMaterialApiV1
                        .getMaterial(this.task.materialId)
                        .then(({body: {data: {material: {materialContent, materialName}}}}) => {
                            this.creatSMS.materialContent = materialContent;
                            this.creatSMS.materialName = materialName;
                            this.materialLoading = false;
                        });
                } else {
                    // 查看已完成状态的素材内容，需要调用素材副本接口
                    // 单个素材副本
                    this.materialLoading = true;
                    JourneyMaterialApiV1
                        .getMaterialCopy(this.controller.pushInfo.materialId)
                        .then(({body: {data: {material: {materialContent, materialName}}}}) => {
                            this.creatSMS.materialContent = materialContent;
                            this.creatSMS.materialName = materialName;
                            this.materialLoading = false;
                        });
                }
            } else {
                this.creatSMS._display = false;
                this.materialStoreShow = false;
                this.smsStatus = 1;
                // this.browseMaterialList()
                this.materialLoading = false;
            }

            // 获取自定义字段
            ContactApiV1
                .getFields()
                .then(({body: {data: {fieldList}}}) => {
                    this.creatSMS.fields = fieldList.map((field) => ({
                        name: field.field,
                        id: field.id,
                        cn_name: field.fieldCn,
                        type: field.fieldType
                    }));
                });

            // 未配置的短信活动-获取活动详情
            this.fetchSignature();
        },
        watch: {
            'creatSMS.materialContent'() {
                if (!this.creatSMS.materialContent) {
                    this.placeholdersFlag = true;
                } else {
                    this.placeholdersFlag = false;
                }
            },
        },
        mounted() {
            window.addEventListener('click', this.eventDropRule);
            // 主账号不做编辑限制
            if (this.roleId === 0 || this.roleId === '') {
                this.editValid = true;
            } else {
                // 编辑权限校验
                JourneyMaterialApiV1
                    .sharingVerify({
                        materialId: this.task.materialId,
                        materialType: 1,
                        type: 2,
                        shareType: 3
                    })
                    .then(({body: {data: {isAccess}}}) => {
                        if (isAccess === 1) {
                            this.editValid = true;
                        } else {
                            this.editValid = false;
                        }
                    });
            }
        },
        methods: {
            ...mapMutations([
                UPDATE_SAVE_TASK_STATUS,
                UPDATE_CONTROLLER,
                ADD_MILESTONE,
                REMOVE_MILESTONE,
            ]),
            ...mapActions([
                CHECK_JOURNEY_NEW_VERSION,
                SAVE_JOURNEY
            ]),
            toggleImmediately(immediately) {
                this.task.immediately = immediately;
                switch (immediately) {
                    case 0: // 等待
                        this.task.days = '0';
                        this.task.relativeTime = '00:00';
                        this.task.taskDate = '';
                        this.task.sendBehavior = '';
                        break;
                    case 1: // 即时
                        this.task.days = '';
                        this.task.relativeTime = '';
                        this.task.taskDate = '';
                        this.task.sendBehavior = '';
                        break;
                    case 2: // 定时
                        this.task.days = '';
                        this.task.relativeTime = '';
                        this.task.sendBehavior = 0;
                        break;
                    default:
                        logError('不能识别的 task.immediately: ' + immediately);

                }
            },
            cancel() {
                this.$emit('close');
            },
            confirm() {
                // 旅程版本检查
                this.CHECK_JOURNEY_NEW_VERSION()
                    .then(() => {
                        if (this.onPending) {
                            this.$toast(this.$t('dragJourney.delayOperate'),'warn');
                            return;
                        }
                        if (this.task.taskName === '') {
                            return this.$toast(this.$t('journey.taskNameNotEmpty'), 'warn');
                        }

                        if (this.creatSMS.materialContent === '') {
                            this.$toast(this.$t('controller.SMSContentWarn'), 'warn');
                            return;
                        }
                        let temps = {
                            type: 0,
                            materialName: this.creatSMS.materialName,
                            materialContent: this.creatSMS.materialContent,
                            signatureId: this.task.sendOutId
                        };
                        if (this.task.materialId && this.newCreatStatus !== 1) {
                            temps.id = this.task.materialId;
                            JourneyMaterialApiV1
                                .update(temps)
                                .then(() => {
                                    this.commitSave();
                                });
                        }
                        if (this.newCreatStatus === 0 && !this.task.materialId) {
                            this.commitSave();
                        }
                        if (this.newCreatStatus === 1) {
                            JourneyMaterialApiV1
                                .create(temps)
                                .then((res) => {
                                    this.task.materialId = res.body.data.material.id;
                                    this.commitSave();
                                });
                        }
                    })
                    .catch(() => {
                        this.UPDATE_SAVE_TASK_STATUS(false);
                    });
            },
            browseMaterialList() {
                this.creatSMS._display = false;
                this.materialStoreShow = true;
                this.$refs.materialStore.browseList();
                this.newCreatStatus = 0;
            },
            creatSMSMaterial() {
                this.materialStoreShow = false;
                this.creatSMS._display = true;
                this.creatSMS.materialContent = '';
                this.newCreatStatus = 1;
            },
            insertField(e) {
                let targetPos = getCursorPosition(this.$refs.textarea);
                let content = [...this.creatSMS.materialContent];
                if (content.length + ('${' + e.name + '}').length > 350) {
                    this.$toast(this.$t('controller.smsContentTooLong'), 'warn');
                    return false;
                }
                content.splice(targetPos, 0, '${' + e.name + '}');
                this.creatSMS.materialContent = content.join('');
            },
            insertUrl() {
                this.$nextTick(() => {
                    LINK_REG.lastIndex = 0;
                    if (LINK_REG.test(this.creatSMS.materialContent)) {
                        this.$toast(this.$t('material.onlyOneUrl', 'warn'));
                        return false;
                    }
                    if (String(this.creatSMS.shortUrl)
                        .trim() === '') {
                        this.$toast(this.$t('material.urlRequired'), 'warn');
                        return false;
                    }
                    if (!COMMON_WEIXIN_URL_REGEXP.test(this.creatSMS.shortUrl) &&
                        !COMMON_URL_REGEXP.test(this.creatSMS.shortUrl) &&
                        !COMMON_URL_REGEXP.test('http://' + this.creatSMS.shortUrl)
                    ) {
                        this.$toast(this.$t('material.invalidUrl'), 'warn');
                        return false;
                    }
                    if (!/^(http|https|weixin)+/.test(this.creatSMS.shortUrl)) {
                        this.creatSMS.shortUrl = 'http://' + this.creatSMS.shortUrl;
                    }
                    //长度校验
                    let position = getCursorPosition(this.$refs.textarea);
                    let content = [...this.creatSMS.materialContent];
                    if (content.length + 10 > 350) {
                        //短链默认10个字符
                        this.$toast(this.$t('material.smsContentTooLong'));
                        return false;
                    }

                    content.splice(position, 0, '<url>' + this.creatSMS.shortUrl + '</url>');
                    this.$set(this.creatSMS, 'materialContent', content.join(''));
                    this.creatSMS.shortUrl = '';
                    // trigger textarea's input event
                    const e = document.createEvent('HTMLEvents');
                    e.initEvent('input', true, true);
                    this.$nextTick(() => {
                        this.$refs.textarea.dispatchEvent(e);
                    });
                });
            },
            deleteMaterial() {
                this.materialStoreShow = false;
                this.newCreatStatus = 0;
                this.task.materialId = null;
            },
            testMaterial(materialId) {
                // 主账号不做任何限制
                if (this.roleId === 0 || this.roleId === '') {
                    JourneyMaterialApiV1
                        .getMaterial(materialId)
                        .then((res) => {
                            this.$test(res.body.data.material);
                        });
                    return;
                }
                // 权限校验
                JourneyMaterialApiV1
                    .sharingVerify({
                        materialId: materialId,
                        materialType: 1,
                        type: 2,
                        shareType: 6
                    })
                    .then(({body: {data: {isAccess}}}) => {
                        if (isAccess === 1) {
                            JourneyMaterialApiV1
                                .getMaterial(materialId)
                                .then((res) => {
                                    this.$test(res.body.data.material);
                                });
                        } else {
                            this.$toast(this.$t('material.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            deleteList() {
                this.materialStoreShow = false;
                this.creatSMS._display = false;
                this.task.materialId = null;
                this.smsStatus = 1;
                this.newCreatStatus = 0;
            },
            backList() {
                this.materialStoreShow = false;
                this.creatSMS._display = false;
                this.smsStatus = 1;
                this.newCreatStatus = 0;
            },
            selcetSms(even) {
                this.creatSMS.materialContent = even.materialContent;
                this.creatSMS.materialName = even.materialName;
                this.creatSMS._display = true;
                this.materialStoreShow = false;
                this.newCreatStatus = 0;
            },
            commitSave() {
                // 定时旅程
                if (this.journeyInformation.journeyType !== 2) {
                    // 绝对时间校验
                    if (this.timeType === 0) {
                        // 年月日、小时、分钟都必填
                        if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(this.task.taskDate)) {
                            this.$toast(this.$t('controller.taskDate'), 'warn');
                            return;
                        }
                        // 清空相对时间设置
                        this.task.relativeTime = '';
                    }

                    // 相对时间校验
                    if (this.timeType === 1) {
                        // 相对时间的天数、小时、分钟都必填
                        if (this.task.days === '' || !/^\d{2}:\d{2}$/.test(this.task.relativeTime)) {
                            this.$toast(this.$t('controller.taskDate'), 'warn');
                            return;
                        }

                        // 清空绝对时间设置
                        this.task.taskDate = '';
                    }
                } else {
                    // 实时旅程
                    // 定时发送
                    if (this.task.immediately === 2) {
                        // 年月日、小时、分钟都必填
                        if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(this.task.taskDate)) {
                            this.$toast(this.$t('controller.taskDate'), 'warn');
                            return;
                        }
                        // 过期行为设置
                        if (this.task.sendBehavior !== 0 && this.task.sendBehavior !== 1) {
                            this.$toast(this.$t('controller.expireBehavior'), 'warn');
                            return;
                        }
                    }
                }
                this.UPDATE_SAVE_TASK_STATUS(true);
                // 旅程版本检查
                this.CHECK_JOURNEY_NEW_VERSION()
                    .then(() => {
                        // 更新里程碑设置
                        this.commitMilestone();

                        // 更新任务
                        JourneyApiV3
                            .updateTask(this.task)
                            .then(({body: {data: {task}}}) => {
                                this.UPDATE_SAVE_TASK_STATUS(false);
                                this.$toast(this.$t('common.saveSuccess'), 'success');
                                let controller = cloneDeep(this.controller);
                                Object.assign(controller.pushInfo, this.task, task);
                                controller.name = this.task.taskName;
                                this.UPDATE_CONTROLLER(controller);
                                this.SAVE_JOURNEY(false);
                            })
                            .catch(() => {
                                this.UPDATE_SAVE_TASK_STATUS(false);
                            });
                    })
                    .catch(() => {
                        this.UPDATE_SAVE_TASK_STATUS(false);
                    });

                this.$emit('close');
            },
            commitMilestone() {
                if (this.isAMileStone !== this.milestone) {
                    this.milestone ? this.ADD_MILESTONE(this.controller.id) : 
                        this.REMOVE_MILESTONE(this.controller.id);
                }
            },
            // 返回发送方式
            getSendBehavior(behavior) {
                return behavior === 0 ? this.$t('controller.stopWhenExpired') : this.$t('controller.realTimeWhenExpired');
            },
            // 未配置短信活动-旅程查看模式（有短信活动id）-根据短信活动id获取短信活动
            fetchSignature() {
                if (this.signatureList.length) return;
                if (this.task.sendOutId) {
                    OriginSmsExportApiV1
                        .getSignature(this.task.sendOutId)
                        .then(res => {
                            if (res.body.data.sendouts.length > 0) {
                                this.signature = res.body.data.sendouts[0];
                            }
                        });
                } else this.signature.sendoutName = '';
            },
            // 短信文本输入框获取焦点
            focusTextarea() {
                this.$refs.textarea.focus();
            },
            //textarea的input事件
            contentValueListener(e) {
                if (e.target.value) {
                    this.placeholdersFlag = false;
                } else {
                    this.placeholdersFlag = true;
                }
            },
            //点击 展开计费规则
            viewDropRules() {
                this.dropRuleFlag = !this.dropRuleFlag;
            },
            //通用方法 下拉隐藏规则的收起
            eventDropRule() {
                this.dropRuleFlag = false;
            },
        },
        computed: {
            ...mapGetters(['onPending']),
            ...mapState({
                roleId: state => state.user.roleId,
                isAMileStone(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation
                        .milestones.includes(this.controller.id);
                },
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                validationResult: state => state[DRAGGABLE_JOURNEY_STORE_NAME].validationResult,
                isChecking: state => state[DRAGGABLE_JOURNEY_STORE_NAME].isChecking,
                readonlyIds: state => state[DRAGGABLE_JOURNEY_STORE_NAME].readonlyControllerIds
            }),
            // 实时旅程等待时间
            delayTime: {
                get() {
                    return this.task.days + ':' + (this.task.relativeTime || ':');
                },
                set(delayTimeStr) {
                    let [days, hour, minute] = delayTimeStr.split(':');
                    this.task.days = days;
                    this.task.relativeTime = hour + ':' + minute;
                }
            },
            // 定时旅程：绝对时间：日期
            taskDay: {
                get() {
                    return this.task.taskDate ? this.task.taskDate.split(' ')[0] : '';
                },
                set(dayStr) {
                    let hourAndMinute = this.task.taskDate ? this.task.taskDate.split(' ')[1] : '00:00';
                    this.task.taskDate = dayStr + ' ' + hourAndMinute;
                }
            },
            // 定时旅程，绝对时间、相对时间共用：小时分钟
            taskHourAndMinute: {
                get() {
                    if (this.timeType === 0) {
                        // 绝对时间
                        return this.task.taskDate ? this.task.taskDate.split(' ')[1] : '00:00';
                    }
                    // 相对时间
                    return this.task.relativeTime || '';
                },
                set(hourAndMinuteStr) {
                    if (this.timeType === 0) {
                        // 绝对时间
                        let day = this.task.taskDate ? this.task.taskDate.split(' ')[0] : '';
                        this.task.taskDate = day + ' ' + hourAndMinuteStr;
                    } else {
                        // 相对时间
                        this.task.relativeTime = hourAndMinuteStr;
                    }
                }
            },
            timeType() {
                // 0 绝对时间; 1 相对时间
                return this.journeyInformation.timeType;
            },
            timeFormatText() {
                if (this.timeType === 0) {
                    return this.$t('newJourney.dateTime');
                } else if (this.timeType === 1) {
                    return this.$t('newJourney.relativeTime');
                }
            },
            contentCount() {
                const materialContent = this.creatSMS.materialContent;
                //有短链
                LINK_REG.lastIndex = 0;
                // 实时旅程不包含 退订 TD
                if (LINK_REG.test(materialContent)) {
                    return (
                        materialContent.length -
                        (materialContent.lastIndexOf('</url>') -
                            materialContent.indexOf('<url>') +
                            6) +
                        14 +
                        (this.journeyInformation.journeyType === 2 ? 0 : UNSUBSCRIBE_SMS_POSTFIX.length)
                    );
                }
                return materialContent.length +
                    (this.journeyInformation.journeyType === 2 ? 0 : UNSUBSCRIBE_SMS_POSTFIX.length);
            },
            signatureLength() {
                if (!this.task.sendOutId) {
                    return 0;
                }
                for (let item of this.signatureList) {
                    if (item.id === this.task.sendOutId) {
                        return item.message.length + 2;
                    }
                }
            },
            today() {
                return format(new Date(timeZoneToday(this.journeyInformation.timeZone)), 'YYYY-MM-DD');
            },
            writable() {
                // 旅程可编辑，且控件ID不在 readonlyIds 中
                return this.$store.getters.journeyWritable && !this.readonlyIds.includes(this.controller.id);
            },
            // 短信活动名称
            smsSignature() {
                if (this.task.sendOutId && this.signatureList.length) {
                    return this.signatureList.$getByKey(this.task.sendOutId).name;
                }
                return this.signature.sendoutName || '';
            },
            // 旅程待审批状态
            statusApprove() {
                return this.journeyInformation.journeyStatus === 9;
            },
            // 发送行为计算属性
            sendBehavior: {
                get: function() {
                    return this.task.sendBehavior;
                },
                set: function(val) {
                    this.task = Object.assign({}, this.task, { sendBehavior: val });
                }
            }
        },
        destroyed() {
            window.removeEventListener('click', this.eventDropRule);
        }
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .sms-controller-form {
        .timer {
            .calendar {
                margin-top: 0;
            }

            .hour-minute-select {
                margin-top: 0;
            }
        }

        .sms-content {
            position: relative;
            min-height: 346px;
            border-radius: 4px;

            &.has-border {
                border: 1px solid $border-color;
            }

            .select-material, .add-material {
                position: absolute;
                top: 22%;
                z-index: 1;
                overflow: hidden;
                width: 176px;
                height: 225px;
                line-height: 3em;
                font-size: 14px;
                color: $color-light-content;
                cursor: pointer;
                text-align: center;

                img {
                    display: block;
                    box-sizing: border-box;
                    padding: 50px;
                    width: 176px;
                    height: 180px;
                    border: 1px solid $border-color;
                    border-radius: 5px;
                }
            }

            .select-material {
                right: 52%;
            }

            .add-material {
                left: 52%;
            }

            .sms-form-panel {
                display: flex;
                text-align: left;
                margin-bottom: 12px;
                color: $color-content;

                .selector {
                    margin-right: 12px;
                }
            }

            .textarea {
                height: 305px;
                resize: none;
            }

            .reset-actions {
                position: absolute;
                right: 8px;
                top: 8px;
                text-align: center;

                .icon {
                    display: block;
                    @include box-sizing();
                    width: $input-field-height;
                    font-size: 14px;
                    line-height: $input-field-height - 2px;
                    padding: 0;
                    background-color: white;
                    cursor: pointer;
                    border: 1px solid $border-color;
                    @include transition();
                    color: $color-content;

                    &:hover {
                        color: $theme;
                        background-color: $content-bg;
                    }

                    ~ button {
                        border-top: none;
                    }
                }
            }
        }
        .red-text {
            color: $red;
        }
        .drop-rule-wrapper {
            width: 70%;
        }
        .content-count-text{
            display: flex;
            justify-content: space-between;
            width: 100%;
            background-color: $content-bg;
            padding: 0 10px;
            box-sizing: border-box;
        }
        .view-rules{
            font-size: 14px;
            margin-left: 10px;
            color: $blue;
            cursor: pointer;
            display: flex;
            svg{
                width: 16px;
                height: 16px;
                vertical-align: -0.15em;
            }
            .drop-active {
                transform: rotate(90deg);
            }
        }
        .content-wrapper {
            position: relative;
            .placeholder-content {
                position: absolute;
                width: 565px;
                padding: 4px 10px;
                top: 0;
                left: 0;
            }
        }
    }
</style>
