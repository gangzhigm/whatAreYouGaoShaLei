<template>
    <modal class="mms-controller-form" :title="controller.name || $t('controller.send_message')" size="lg"
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
            <label class="label" for="mmsSubjectInput">{{$t('controller.mmsSubject')}}</label>
            <span v-if="isChecking">{{task.mailSubject}}</span>
            <div v-else class="field-group">
                <input type="text" id="mmsSubjectInput" class="input xl" v-model.trim="task.mailSubject"
                       ref="mmsSubjectInput" maxlength="66" :placeholder="$t('controller.mmsSubject_placeholder')">
                <selector v-if="journeyInformation.journeyType === 2" :options="creatMMS.fields"
                          :placeholder="$t('controller.insert')" @select="insertField($event)"/>
            </div>
        </div>
        <div class="form-field flex">
            <label class="label">{{'controller.mmsSignature' | t}}</label>
            <span v-if="isChecking">
                {{mmsSignature}}
            </span>
            <div v-else class="field-group">
                <selector :options="signatureList"
                          :search="signatureList.length > 10"
                          v-model="task.sendOutId"
                          :placeholder="$t('controller.mmsSignature')"
                          class="xl"/>
            </div>
        </div>
        <div class="form-field" v-if="journeyInformation.journeyType === 2">
            <span class="label placeholder"></span>
            <checkbox v-model="milestone" :disabled="isChecking">{{'controller.set_milestone' | t}}</checkbox>
            <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
        </div>
        <div class="form-field flex">
            <label class="label">{{$t('controller.mmsContent')}}</label>
            <div class="field-group">
                <template v-if="creatMMS._display&&!materialStoreShow">
                    {{$t('controller.remainder')}}
                    <span class="theme-text">{{availableKB}}</span>
                </template>
                <template v-else>
                    {{$t('controller.remainder')}}
                    <span class="theme-text">{{availableKB}}</span>
                </template>
                <!--查看模式-->
                <template v-if="isChecking">
                    <inline-loading v-if="materialLoading"/>
                    <template v-if="!materialLoading">
                        <div class="mms-content has-border" v-if="creatMMS.materialContent">
                            <div class="content-inner">
                                <div class="item" v-for="item in creatMMS.materialContent" :key="item.id">
                                    <img v-if="item.pictureUrl" :src="item.pictureUrl" style="width: 100%;">
                                    <p v-if="item.mmsContent" v-text="`${item.mmsContent}`"></p>
                                </div>
                            </div>
                        </div>
                        <p v-else>{{'common.noData' | t}}</p>
                    </template>
                </template>
                <div v-else class="mms-content" :class="{'has-border': materialStoreShow}">
                    <div v-if="!materialStoreShow&&!creatMMS._display" class="select-material"
                         @click.stop="browseMaterialList()"><img src="../select-material.png" alt="select-material">
                        {{'controller.choose_a_material' | t}}
                    </div>
                    <div v-if="!materialStoreShow&&!creatMMS._display" class="add-material"
                         @click.stop="creatMMSMaterial()"><img src="../add-material.png" alt="add-material">
                        {{'controller.createMMS' | t}}
                    </div>
                    <template v-if="creatMMS._display&&!materialStoreShow">
                        <inline-loading v-if="materialLoading"/>
                        <div class="content-inner" v-else>
                            <div v-for="item in creatMMS.materialContent" :key="item.id" class="item">
                                <img v-if="item.pictureUrl" :src="item.pictureUrl" style="width: 100%;">
                                <p v-if="item.mmsContent" v-text="`${item.mmsContent}`"></p>
                            </div>
                        </div>
                    </template>
                    <material-store v-show="materialStoreShow&&!creatMMS._display" :smsStatus="mmsStatus"
                                    v-model="task.materialId" type="sms" :unit="70" ref="materialStore"
                                    @choose="selcetMms"
                                    @backFromEdit="backFromEdit"
                                    @reset="deleteMaterial()"></material-store>
                    <!--返回列表-->
                    <div class="reset-actions" v-if="creatMMS._display&&!materialStoreShow">
                        <button type="button" class="icon icon-pencil addcurstou" @click="goMaterial"
                                :class="{'icon-disable': $has('journey_material_edit_material')}"
                                :disabled="$has('journey_material_edit_material')"
                                v-title:top="$t('common.edit')"></button>
                        <button type="button" class="icon icon-reset addcurstou" @click="backList"
                                v-title:top="$t('journey.reselect')"></button>
                        <button type="button" class="icon icon-delete addcurstou" @click="deleteList"
                                v-title:top="$t('common.del')"></button>
                    </div>
                </div>
                <!-- <p class="light-content-text">{{$t('controller.email_journey_warn')}}</p> -->
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
    import { ContactApiV1, OriginSmsExportApiV1, JourneyApiV3, JourneyMaterialApiV1 } from '@/api';
    import cloneDeep from 'lodash/cloneDeep';
    import format from 'date-fns/format';
    import MaterialStore from './mmsMateralStore.vue';
    import DelayTimePicker from '../components/delay-time-picker.vue';
    import {COMMON_URL_REGEXP} from '@/common/utils/regs';
    import getCursorPosition from '@/common/utils/cursorPosition';
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

    const LINK_REG = /<url>.*?<\/url>/gi;
    export default {
        components: {MaterialStore, DelayTimePicker},
        props: {
            controller: Object,
            signatureList: Array
        },
        data() {
            return {
                milestone: 0,
                task: {
                    taskId: null,
                    taskName: '',
                    materialId: null,
                    sendOutId: '',  // 签名id
                    sendBehavior: '', // 0 过期停止 1 过期即时
                    immediately: '', // 0 等待，1 即时，2 定时
                    days: '',
                    relativeTime: '',
                    taskDate: '',
                },
                timeOptions: [
                    {id: 1, name: this.$t('controller.immediate')}, // 即时
                    {id: 0, name: this.$t('controller.after')}, // 等待
                    {id: 2, name: this.$t('controller.absolute')}, // 定时
                ],
                creatMMS: {
                    _display: false,
                    fields: [],
                    shortUrl: '',
                    materialContent: '',
                    materialName: ''
                },
                materialStoreShow: false,
                mmsStatus: null,
                newCreatStatus: 0,
                timer: TIME_ZONE_RNAGES,
                signature: {}, // 彩信活动
                materialLoading: true, // 素材loading
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
                this.creatMMS._display = true;
                this.materialStoreShow = false;
                // Fix-9094 旅程待审批不可编辑， 但旅程还未开始
                if (this.writable || this.statusApprove) {
                    this.materialLoading = true;
                    JourneyMaterialApiV1
                        .getMaterial(this.task.materialId)
                        .then(({body: {data: {material: {materialMms, materialName}}}}) => {
                            this.creatMMS.materialContent = materialMms;
                            this.creatMMS.materialName = materialName;
                            this.materialLoading = false;
                        });
                } else {
                    // 查看已完成状态的素材内容，需要调用素材副本接口
                    // 单个素材副本
                    this.materialLoading = true;
                    JourneyMaterialApiV1
                        .getMaterialCopy(this.controller.pushInfo.materialId)
                        .then(({body: {data: {material: {otherCount, materialName}}}}) => {
                            this.creatMMS.materialContent = otherCount.mmsContent;
                            this.creatMMS.materialName = materialName;
                            this.materialLoading = false;
                        });
                }
            } else {
                this.creatMMS._display = false;
                this.materialStoreShow = false;
                this.materialLoading = false;
                this.mmsStatus = 1;
            }
            // 获取自定义字段
            ContactApiV1
                .getFields()
                .then(({body: {data: {fieldList}}}) => {
                    this.creatMMS.fields = fieldList.map((field) => ({
                        name: field.field,
                        id: field.id,
                        cn_name: field.fieldCn,
                        type: field.fieldType
                    }));
                });

            // 未配置的彩信活动-获取活动详情
            this.fetchSignature();
        },
        methods: {
            ...mapMutations([
                UPDATE_SAVE_TASK_STATUS,
                ADD_MILESTONE,
                REMOVE_MILESTONE,
                UPDATE_CONTROLLER
            ]),
            ...mapActions([
                CHECK_JOURNEY_NEW_VERSION,
                SAVE_JOURNEY
            ]),
            // 跳转编辑
            async goMaterial() {
                let hasAccess = '';
                // 主账号不做任何限制
                if (this.roleId === 0 || this.roleId === '') {
                    hasAccess = 1;
                } else {
                    // 权限校验
                    hasAccess = await JourneyMaterialApiV1
                        .sharingVerify({
                            materialId: this.task.materialId,
                            materialType: 1,
                            type: 2,
                            shareType: 3
                        })
                        .then(({body: {data: {isAccess}}}) => {
                            if (isAccess !== 1) {
                                this.$toast(this.$t('material.sharingVerifyOption'), 'warn');
                            }
                            return isAccess;
                        });
                }
                if (hasAccess !== 1) return;
                let {href} = this.$router.resolve({
                    name: 'editMMS',
                    query: {
                        id: this.controller.pushInfo.materialId,
                        type: ''
                    }
                });
                window.open(href);
                this.creatMMS._display = false;
                this.materialStoreShow = true;
                this.$refs.materialStore.editMaterialInNewTab(this.controller.pushInfo);
            },
            backFromEdit() {
                this.creatMMS._display = true;
                this.materialStoreShow = false;
            },
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
                        this.sendBehavior = 0;
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
                        if (this.task.taskName === '') {
                            return this.$toast(this.$t('journey.taskNameNotEmpty'), 'warn');
                        }
                        if (this.task.mailSubject === '' || !this.task.mailSubject) {
                            return this.$toast(this.$t('journey.taskMmsSubjectNotEmpty'), 'warn');
                        }
                        if (this.task.mailSubject.length > 66) {
                            return this.$toast(this.$t('journey.mmsSubjectlength'), 'warn');
                        }
                        if (this.task.sendOutId === 0 || !this.task.sendOutId) {
                            return this.$toast(this.$t('journey.taskMmsSignatureNotEmpty'), 'warn');
                        }
                        if (this.creatMMS.materialContent === '') {
                            this.$toast(this.$t('controller.MMSContentWarn'), 'warn');
                            return;
                        }
                        let temps = {
                            type: 2,
                            materialName: this.creatMMS.materialName,
                            materialContent: '',
                            materialMms: this.creatMMS.materialContent,
                            signatureId: this.task.sendOutId,
                            mailSubject: this.task.mailSubject
                        };
                        if (this.task.materialId) {
                            temps.id = this.task.materialId;
                            JourneyMaterialApiV1
                                .update(temps)
                                .then(() => {
                                    this.$toast(this.$t('common.saveSuccess'), 'success');
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
                                    this.$toast(this.$t('common.saveSuccess'), 'success');
                                    this.commitSave();
                                });
                        }
                    })
                    .catch(() => {
                        this.UPDATE_SAVE_TASK_STATUS(false);
                    });
            },
            browseMaterialList() {
                this.creatMMS._display = false;
                this.materialStoreShow = true;
                this.$refs.materialStore.browseList();
                this.newCreatStatus = 0;
            },
            creatMMSMaterial() {
                this.materialStoreShow = false;
                let {href} = this.$router.resolve({name: 'createMMS'});
                window.open(href);
                this.creatMMS.materialContent = '';
                this.newCreatStatus = 1;
                this.creatMMS._display = false;
                this.materialStoreShow = true;
                this.$refs.materialStore.editMaterialInNewTab();
            },
            insertField(e) {
                let targetPos = getCursorPosition(this.$refs.mmsSubjectInput);
                let content = this.task.mailSubject ? [...this.task.mailSubject] : [];
                if (content.length + ('${' + e.name + '}').length > 100) {
                    this.$toast(this.$t('controller.emailTitleWarn'), 'warn');
                    return false;
                }
                content.splice(targetPos, 0, '${' + e.name + '}');
                this.task.mailSubject = content.join('');
            },
            insertUrl() {
                this.$nextTick(() => {
                    LINK_REG.lastIndex = 0;
                    if (LINK_REG.test(this.creatMMS.materialContent)) {
                        this.$toast(this.$t('material.onlyOneUrl'));
                        return false;
                    }
                    if (String(this.creatMMS.shortUrl)
                        .trim() === '') {
                        this.$toast(this.$t('material.urlRequired'));
                        return false;
                    }
                    if (
                        !COMMON_URL_REGEXP.test(this.creatMMS.shortUrl) &&
                        !COMMON_URL_REGEXP.test('http://' + this.creatMMS.shortUrl)
                    ) {
                        this.$toast(this.$t('material.invalidUrl'));
                        return false;
                    }
                    if (!/^(http|https)+/.test(this.creatMMS.shortUrl)) {
                        this.creatMMS.shortUrl = 'http://' + this.creatMMS.shortUrl;
                    }
                    //长度校验
                    let position = getCursorPosition(this.$refs.textarea);
                    let content = [...this.creatMMS.materialContent];
                    /*if (content.length + 10 > 350) {
                        //短链默认10个字符
                        this.$toast(this.$t('material.smsContentTooLong'));
                        return false;
                    }*/
                    content.splice(position, 0, '<url>' + this.creatMMS.shortUrl + '</url>');
                    this.$set(this.creatMMS, 'materialContent', content.join(''));
                    this.creatMMS.shortUrl = '';
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
                this.creatMMS._display = false;
                this.task.materialId = null;
                this.mmsStatus = 1;
                this.newCreatStatus = 0;
            },
            backList() {
                this.materialStoreShow = false;
                this.creatMMS._display = false;
                this.mmsStatus = 1;
                this.newCreatStatus = 0;
            },
            selcetMms(even) {
                this.creatMMS.materialContent = even.materialContent;
                this.creatMMS.materialName = even.materialName;
                this.creatMMS._display = true;
                this.materialStoreShow = false;
                this.newCreatStatus = 0;
            },
            commitSave() {
                if (this.onPending) {
                    this.$toast(this.$t('dragJourney.delayOperate'),'warn');
                    return;
                }
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
                    if (this.task.immediately === 2) {
                        // 定时发送
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
            getSendBehavior(behavior) {
                return behavior === 0 ? this.$t('controller.stopWhenExpired') : this.$t('controller.realTimeWhenExpired');
            },
            // 未配置彩信活动-旅程查看模式（有彩信活动id）-根据彩信活动id获取彩信活动
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
            }
        },
        computed: {
            ...mapGetters(['onPending']),
            ...mapState({
                isAMileStone(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation
                        .milestones.includes(this.controller.id);
                },
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                validationResult: state => state[DRAGGABLE_JOURNEY_STORE_NAME].validationResult,
                isChecking: state => state[DRAGGABLE_JOURNEY_STORE_NAME].isChecking,
                readonlyIds: state => state[DRAGGABLE_JOURNEY_STORE_NAME].readonlyControllerIds,
                roleId: state => state.user.roleId
            }),
            // 整个彩信素材剩余 KB 数
            availableKB() {
                let total = 0; // KB
                if (this.creatMMS.materialContent) {
                    this.creatMMS.materialContent.forEach(subMaterial => {
                        total += subMaterial.size;
                    });
                    return `${Math.max(total, 0)
                        .toFixed(2)}Kb`;

                }
            },
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
                    if (!this.task.taskDate) {
                        this.task.taskDate = this.defaultTaskDay;
                    }
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
                const materialContent = this.creatMMS.materialContent;
                //有短链
                LINK_REG.lastIndex = 0;
                if (LINK_REG.test(materialContent)) {
                    return (
                        materialContent.length -
                        (materialContent.lastIndexOf('</url>') -
                            materialContent.indexOf('<url>') +
                            6) +
                        14
                    );
                }
                return materialContent.length;
            },
            signatureLength() {
                if (!this.task.sendOutId) {
                    return 0;
                }
                for (let item of this.signatureList) {
                    if (item.id === this.task.sendOutId) {
                        return item.name.length;
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
            // 彩信活动名称
            mmsSignature() {
                if (this.task.sendOutId && this.signatureList.length) {
                    return this.signatureList.$getByKey(this.task.sendOutId).name;
                }
                return this.signature.sendoutName || '';
            },
            // 旅程待审批状态
            statusApprove() {
                return this.journeyInformation.journeyStatus === 9;
            },
            // 定时旅程-默认任务时间 当前时区的时间 + 5 分钟
            defaultTaskDay() {
                let date = new Date(timeZoneToday(this.journeyInformation.timeZone));
                let min = date.getMinutes();
                date.setMinutes(min + 5);
                return format(date, 'YYYY-MM-DD HH:mm');
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
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .mms-controller-form {
        .timer {
            .calendar {
                margin-top: 0;
            }

            .hour-minute-select {
                margin-top: 0;
            }
        }

        .mms-content {
            position: relative;
            height: 346px;
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

                    &.icon-disable:hover {
                        color: $color-content;
                        background-color: white;
                        cursor: not-allowed;
                    }

                    ~ button {
                        border-top: none;
                    }
                }
            }
        }

        .content-inner {
            height: 100%;
            overflow: scroll;
            border: 1px solid #000;

            .item {
                width: 210px;
                margin: 10px auto;
                background-color: #e5e3e3;
                padding: 5px;
                border-radius: 5px;
            }
        }
    }
</style>
