<template>
    <modal :title="controller.name || $t('controller.send_email')" size="lg" @close="cancel()">
        <p v-if="controller.id === validationResult.errorId" class="error-message">
            {{validationResult.errorMessage}}
        </p>
        <div class="email-controller-form">
            <div class="form-field flex">
                <label class="label" for="taskName">{{$t('controller.step_title')}}</label>
                <span v-if="isChecking">{{task.taskName}}</span>
                <div v-else class="field-group">
                    <input type="text" id="taskName" maxlength="200" v-model.trim="task.taskName" class="input xl">
                </div>
            </div>
            <div class="form-field flex timer">
                <!--实时旅程-->
                <template v-if="journeyInformation.journeyType === 2">
                    <label class="label">{{$t('controller.send_wait')}}</label>
                    <span v-if="isChecking">
                        {{task.immediately ? timeOptions.$getByKey(task.immediately).name : ''}}
                        <span v-if="task.immediately === 0">
                            {{delayTime}}
                        </span>
                        <span v-if="task.immediately === 2">
                            {{taskDay}}
                            {{taskHourAndMinute}}
                            {{getSendBehavior(task.sendBehavior)}}
                            <p>{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
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
                            <radio :source="0" v-model="task.sendBehavior">
                                {{'controller.stopWhenExpired' | t}}
                            </radio>
                            <radio :source="1" v-model="task.sendBehavior">
                                {{'controller.realTimeWhenExpired' | t}}
                            </radio>
                            <i class="action-icon icon icon-help" v-title:bottom="$t('controller.expireTip')"></i>
                            <p>
                                {{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}
                            </p>
                        </template>
                    </div>
                </template>
                <!--定时旅程-->
                <template v-else>
                    <label class="label">{{'journey.sendTime' | t}}</label>
                    <span v-if="isChecking">
                        {{timeFormatText}}
                        <span v-if="timeType === 0">
                            {{taskDay}}
                        </span>
                        <span v-if="timeType === 1">
                            {{'controller.the' | t}}{{task.days}}{{'controller.dayA' | t}}
                        </span>
                        {{taskHourAndMinute}}
                        <p>{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
                    </span>
                    <div v-else class="field-group">
                        <span class="title-text"> {{timeFormatText}}</span>
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
            <!--发件地址-->
            <div class="form-field flex">
                <label class="label">{{$t('controller.from_address')}}</label>
                <span v-if="isChecking">
                    {{sendAddressMsg}}
                </span>
                <div v-else class="field-group">
                    <selector :options="sendAddressList"
                              class="xl"
                              :search="sendAddressList.length > 10"
                              :value="task.senderId"
                              @select="changeSendAddress"/>
                </div>
            </div>
            <!-- 发件抬头即发件人 -->
            <div class="form-field flex">
                <label class="label" for="sendName">{{$t('controller.from_name')}}</label>
                <span v-if="isChecking">
                    {{sendNameMsg}}
                </span>
                <div v-else class="field-group">
                    <selector class="xl" :options="senderList" search :value="task.sendNameId" @select="changeSenders"/>
                    <button type="button" class="action-icon icon icon-pencil" v-title:top="$t('common.edit')"
                            @click="showEditSender" :disabled="$has('journey_edit_send_user')">
                    </button>
                </div>
            </div>
            <div class="form-field flex">
                <label class="label" for="mailSubjectInput">{{$t('controller.email_subject')}}</label>
                <span v-if="isChecking">
                    <span v-if="isADMail">(AD)</span>
                    {{mailSubject}}
                </span>
                <div v-else class="field-group">
                    <span v-if="isADMail" class="mail-subject-ad-prefix">(AD)</span>
                    <input type="text" id="mailSubjectInput" class="input lg" v-model.trim="mailSubject"
                           ref="mailSubjectInput" maxlength="100">
                    <selector :options="fields" :placeholder="$t('controller.insert')" @select="insertField($event)"/>
                    &nbsp;
                    <checkbox v-model="isADMail">{{'controller.insertADPrefix' | t}}</checkbox>
                    <i class="action-icon icon icon-help" v-title:bottom="$t('controller.emailSubjectADTip')"></i>
                </div>
            </div>
            <div class="form-field" v-if="journeyInformation.journeyType === 2">
                <span class="label placeholder"></span>
                <checkbox v-model="milestone" :disabled="isChecking">{{'controller.set_milestone' | t}}</checkbox>
                <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
            </div>
            <!-- 新增摘要 -->
            <div class="form-field flex">
                <span class="label">{{ 'controller.excerpta' | t }}</span>
                <p v-if="isChecking">{{task.excerpta}}</p>
                <div v-else class="field-group">
                    <textarea class="textarea" v-model.trim="task.excerpta" maxlength="255"></textarea>
                </div>
            </div>
            <div class="form-field flex">
                <span class="label">{{$t('controller.content')}}</span>
                <div class="field-group">
                    <div class="email-content">
                        <template v-if="isChecking">
                            <inline-loading v-if="materialLoading"/>
                            <p v-if="task.materialId" v-html="material.materialContent"></p>
                            <p v-if="!task.materialId">{{'common.noData' | t}}</p>
                        </template>
                        <material-store v-else :value="task.materialId" @input="pickMaterial" type="email"
                                        ref="materialStore"/>
                    </div>
                    <!-- <p class="light-content-text">{{$t('controller.email_journey_warn')}}</p> -->
                    <p v-if="unsubscribeLinkMissing" class="orange-text icon icon-warn">
                        &nbsp;{{$t('controller.unsubscribeLinkMissingTip')}}
                    </p>
                </div>
            </div>
        </div>
        <template v-slot:buttons v-if="!isChecking">
            <button class="btn btn-md btn-white" @click.stop="test(material, task.mailSubject)"
                    :disabled="!task.materialId || $has('journey_material_test_material')">
                {{'controller.test' | t}}
            </button>
            <button class="btn btn-md btn-theme" @click.stop="confirm()">{{'common.confirm' | t}}</button>
        </template>
        <template v-else v-slot:buttons>
            <button class="btn btn-md btn-white" @click="cancel">{{'common.close' | t}}</button>
        </template>
        <!--新增、编辑发件人弹窗-->
        <edit-sender-modal :editSenderShow="editSenderShow" :senderList="senderList"
                           @close="closeEditSender" @change="fetchSenderList"></edit-sender-modal>
    </modal>
</template>

<script type="text/ecmascript-6">
    import { ContactApiV1, JourneyApiV1, JourneyApiV3, JourneyMaterialApiV1, GeteOriginApi, SenderApi } from '@/api';
    import cloneDeep from 'lodash/cloneDeep';
    import format from 'date-fns/format';
    import getCursorPosition from '../../../../../../common/utils/cursorPosition';
    import MaterialStore from '../../../../calendar/components/material-store.vue';
    import DelayTimePicker from '../components/delay-time-picker.vue';
    import {
        ADD_MILESTONE,
        REMOVE_MILESTONE,
        UPDATE_CONTROLLER,
        UPDATE_SAVE_TASK_STATUS
    } from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {CHECK_JOURNEY_NEW_VERSION, SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import {logError} from '../../../../../../monitor';
    import editSenderModal from '../../../../../../common/components/edit-sender-modal.vue';
    import {TIME_ZONE_RNAGES, timeZoneToday} from '../../../../../../common/utils/timeZone';
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';

    export const AD_EMAIL_PREFIX = '(AD) ';

    export default {
        props: {
            controller: Object
        },
        data() {
            return {
                milestone: 0,
                task: {
                    excerpta: '',
                    taskId: null,
                    taskName: '',
                    senderId: '',      // 发件地址 id
                    sendNameId: '',           // 发件人 id
                    sendName: '',         // 发件人 name
                    sendAddress: '',
                    sendBehavior: '',       // 0 过期停止 1 过期即时
                    mailSubject: '',
                    materialId: null,
                    days: '',
                    relativeTime: '',
                    taskDate: '',
                    immediately: ''         // 0 等待，1 即时，2 定时
                },
                sendAddressList: [],
                senderList: [],// 发件人列表
                fields: [],
                timeOptions: [
                    {id: 1, name: this.$t('controller.immediate')}, // 即时
                    {id: 0, name: this.$t('controller.after')}, // 等待
                    {id: 2, name: this.$t('controller.absolute')}, // 定时
                ],
                material: {},
                departmentId: '', // 部门ID
                searchType: '', // 0 邮件 1短信 2彩信
                timer: TIME_ZONE_RNAGES,
                editSenderShow: false,// 编辑（新增）发件人弹窗
                materialLoading: true, // 素材loading
            };
        },
        watch: {
            // 摘要
            'task.excerpta'() {
                this.material.excerpta = this.task.excerpta;
            },
            'task.materialId'() {
                if (this.task.materialId === 0 || (void 0)) this.materialLoading = false;
            }
        },
        created() {
            // prepare this.task for editing
            this.$set(this.$data, 'task', Object.assign({}, this.task, this.controller.pushInfo));
            this.task.days === null && (this.task.days = '');
        },
        mounted() {
            this.task.excerpta === null && (this.task.excerpta = '');
            !this.task.taskName && (this.task.taskName = this.controller.name);
            // 0 等待，1即时，2定时
            this.task.immediately = ~~this.task.immediately;
            this.task.senderId === null && (this.task.senderId = '');
            // prepare milestone for editing
            this.milestone = this.isAMileStone;
            // 个性化字段列表
            ContactApiV1
                .getFields()
                .then(({body: {data: {fieldList}}}) => {
                    this.fields = fieldList.map((field) => ({
                        name: field.field,
                        id: field.id,
                        cn_name: field.fieldCn,
                        type: field.fieldType
                    }));
                });

            // 主账号
            if (this.roleId === 0 || this.roleId === '') {
                // 发件地址列表
                JourneyApiV1
                    .getAddress()
                    .then(res => {
                        let addressList = res.body.data.addressList;
                        if (addressList.length <= 0) return;
                        this.sendAddressList = addressList.map((address) => ({
                            id: address.senderId,
                            name: address.sendAddress
                        }));

                        // 默认发件地址 id
                        /**
                         * 旅程-邮件控件
                         * 未编辑过，默认选中列表首个
                         * 编辑过，默认选中编辑后的
                         * 匹配发件地址列表，如果有则选中，没有则为空
                         */
                        if (!this.task.senderId) {
                            this.task.senderId = this.sendAddressList[0].id;
                            this.task.sendAddress = this.sendAddressList[0].name;
                        } else {
                            let addr = this.sendAddressList.find(addr => addr.senderId === this.task.senderId);
                            if (addr) {
                                this.task.senderId = addr.id;
                                this.task.sendAddress = addr.name;
                            }
                        }
                    });

                // 发件人列表
                this.fetchSenderList();
            } else {
                // 子账号
                // 发件地址列表
                GeteOriginApi
                    .getAllSendChannel({
                        departmentId: this.departmentId,
                        searchType: 0,
                    })
                    .then(res => {
                        let sendChannel = res.body.data.sendChannel;
                        if (sendChannel.length <= 0) return;
                        this.sendAddressList = sendChannel.map((address) => ({
                            name: address.sendAddress,
                            id: address.senderId,
                        }));
                        // 默认发件地址 id
                        /**
                         * 旅程-邮件控件
                         * 未编辑过，默认选中列表首个
                         * 编辑过，默认选中编辑后的
                         * 匹配发件地址列表，如果有则选中，没有则为空
                         */
                        if (!this.task.senderId) {
                            this.task.senderId = this.sendAddressList[0].id;
                            this.task.sendAddress = this.sendAddressList[0].name;
                        } else {
                            let addr = this.sendAddressList.find(addr => addr.senderId === this.task.senderId);
                            if (addr) {
                                this.task.senderId = addr.id;
                                this.task.sendAddress = addr.name;
                            }
                        }

                        // 发件人列表
                        this.fetchSenderList();
                    });
            }

            if (this.controller.pushInfo.materialId) {
                // 查看已完成状态的素材内容，需要调用素材副本接口
                if (this.writable && !this.isChecking) {
                    this.$refs.materialStore.browseList();
                    this.$refs.materialStore.autoChooseMaterial(this.controller.pushInfo.materialId);
                }
                this.refreshMaterial();
            }
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
                        break;
                    default:
                        logError('不能识别的 task.immediately: ' + immediately);

                }
            },
            changeSendAddress(address) {
                this.task.senderId = address.id;
                this.task.sendAddress = address.name;
                this.fetchSenderList();
            },
            // 选择发件人
            changeSenders(sender) {
                this.task.sendNameId = sender.id;
                this.task.sendName = sender.name;
            },
            // 获取所有发件人列表
            fetchSenderList() {
                SenderApi
                    .getSenderAll(this.task.senderId)
                    .then(res => {
                        this.senderList = res.body.data.senderList;
                        if (this.senderList.length <= 0) return;
                        this.senderList.map(sender => {
                            this.$set(sender, 'btnsShow', false);
                        });
                        // 默认的发件人
                        /**
                         * 未编辑过，默认选中列表首个
                         * 编辑过，默认选中编辑后的
                         * 匹配发件人列表，如果有则选中，没有则为空
                         */
                        if (!this.task.sendNameId) {
                            this.task.sendNameId = this.senderList[0].id;
                            this.task.sendName = this.senderList[0].name;
                        } else {
                            let sender = this.senderList.find(s => s.id === this.task.sendNameId);
                            if (sender) {
                                this.task.sendNameId = sender.id;
                                this.task.sendName = sender.name;
                            }
                        }
                    });
            },
            // 编辑发件人弹窗
            showEditSender() {
                this.editSenderShow = true;
            },
            // 关闭发件人弹窗
            closeEditSender() {
                this.editSenderShow = false;
            },
            pickMaterial(materialId) {
                this.task.materialId = materialId;
                if (!this.task.materialId) this.materialLoading = false;
                this.refreshMaterial();
            },
            refreshMaterial() {
                if (this.task.materialId) {
                    this.materialLoading = true;
                    // 查看已完成状态的素材内容，需要调用素材副本接口
                    // Fix-9094 旅程待审批不可编辑， 但旅程还未开始
                    if (this.writable || this.statusApprove) {
                        JourneyMaterialApiV1
                            .getMaterial(this.task.materialId)
                            .then(({body: {data: {material}}}) => {
                                this.$set(this.$data, 'material', material);
                                // 摘要
                                this.material.excerpta = this.task.excerpta;
                                // 主题 （以任务保存的主题为主，若任务主题为空时，尝试使用素材主题。）
                                if (this.task.mailSubject === AD_EMAIL_PREFIX || this.task.mailSubject === '') {
                                    this.task.mailSubject = this.material.testSubject
                                        ? this.material.testSubject.indexOf(AD_EMAIL_PREFIX) > -1
                                            ? this.material.testSubject
                                            : AD_EMAIL_PREFIX + this.material.testSubject
                                        : AD_EMAIL_PREFIX;
                                }
                                this.materialLoading = false;
                            })
                            .catch(() => {
                                this.materialLoading = false;
                            });
                    } else {
                        this.materialLoading = true;
                        JourneyMaterialApiV1
                            .getMaterialCopy(this.task.materialId)
                            .then(({body: {data: {material}}}) => {
                                this.$set(this.$data, 'material', material);
                                // 摘要
                                this.material.excerpta = this.task.excerpta;
                                // 主题 （以任务保存的主题为主，若任务主题为空时，尝试使用素材主题。）
                                if (this.task.mailSubject === AD_EMAIL_PREFIX || this.task.mailSubject === '') {
                                    this.task.mailSubject = this.material.testSubject
                                        ? this.material.testSubject.indexOf(AD_EMAIL_PREFIX) > -1
                                            ? this.material.testSubject
                                            : AD_EMAIL_PREFIX + this.material.testSubject
                                        : AD_EMAIL_PREFIX;
                                }
                                this.materialLoading = false;
                            })
                            .catch(() => {
                                this.materialLoading = false;
                            });
                    }
                } else {
                    this.$set(this.$data, 'material', {});
                    this.materialLoading = false;
                }
            },
            // 测试
            test(material, mailSubject) {
                // 主账号不做任何限制
                if (this.roleId === 0 || this.roleId === '') {
                    this.$test(material, mailSubject);
                    return;
                }
                // 权限校验
                JourneyMaterialApiV1
                    .sharingVerify({
                        materialId: material.id,
                        materialType: 1,
                        type: 2,
                        shareType: 6
                    })
                    .then(({body: {data: {isAccess}}}) => {
                        if (isAccess === 1) {
                            this.$test(material, mailSubject);
                        } else {
                            this.$toast(this.$t('material.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            cancel() {
                this.$emit('close');
            },
            confirm() {
                if (this.onPending) {
                    this.$toast(this.$t('dragJourney.delayOperate'),'warn');
                    return;
                }
                if (!this.task.taskName) {
                    this.$toast(this.$t('controller.taskNameWarn'), 'warn');
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
            insertField(e) {
                let targetPos = getCursorPosition(this.$refs.mailSubjectInput);
                let content = [...this.task.mailSubject];
                if (content.length + ('{$' + e.name + '}').length > 100) {
                    this.$toast(this.$t('controller.emailTitleWarn'), 'warn');
                    return false;
                }
                if (this.isADMail) {
                    content.splice(5 + targetPos, 0, '{$' + e.name + '}');
                } else {
                    content.splice(targetPos, 0, '{$' + e.name + '}');
                }
                this.task.mailSubject = content.join('');
            },
            commitMilestone() {
                if (this.isAMileStone !== this.milestone) {
                    this.milestone ? this.ADD_MILESTONE(this.controller.id) : 
                        this.REMOVE_MILESTONE(this.controller.id);
                }
            },
            getSendBehavior(behavior) {
                return behavior === 0 ? this.$t('controller.stopWhenExpired') : this.$t('controller.realTimeWhenExpired');
            }
        },
        computed: {
            ...mapGetters(['onPending','journeyWritable']),
            ...mapState({
                roleId: state => state.user.roleId,
                isAMileStone(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation
                        .milestones.includes(this.controller.id);
                },
                validationResult(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].validationResult;
                },
                journeyInformation(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation;
                },
                // 旅程查看
                isChecking: state => state[DRAGGABLE_JOURNEY_STORE_NAME].isChecking,
                readonlyIds: state => state[DRAGGABLE_JOURNEY_STORE_NAME].readonlyControllerIds
            }),
            // 发件抬头（发件人）
            sendNameMsg() {
                let name = '';
                if (this.task.sendNameId && this.senderList.length) {
                    let send = this.senderList.$getByKey(this.task.sendNameId);
                    name = send && send.name ? send.name : '';
                }
                return name || this.task.sendName;
            },
            // 发件地址
            sendAddressMsg() {
                let name = '';
                if (this.task.senderId && this.sendAddressList.length) {
                    let address = this.sendAddressList.$getByKey(this.task.senderId);
                    name = address && address.name ? address.name : '';
                }
                return name || this.task.sendAddress;
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
                    // 实时旅程
                    if (this.journeyInformation.journeyType === 2) {
                        return this.task.taskDate ? this.task.taskDate.split(' ')[0] : '';
                    }
                    return this.task.taskDate ? this.task.taskDate.split(' ')[0] : this.defaultTaskDay.split(' ')[0];
                },
                set(dayStr) {
                    // 实时旅程
                    if (this.journeyInformation.journeyType === 2) {
                        let hourAndMinute = this.task.taskDate ? this.task.taskDate.split(' ')[1] : '00:00';
                        this.task.taskDate = dayStr + ' ' + hourAndMinute;
                    } else {
                        let hourAndMinute = this.task.taskDate
                            ? this.task.taskDate.split(' ')[1]
                            : this.defaultTaskDay.split(' ')[1];
                        this.task.taskDate = dayStr + ' ' + hourAndMinute;
                    }
                }
            },
            // 定时旅程，绝对时间、相对时间共用：小时分钟
            taskHourAndMinute: {
                get() {
                    // 实时旅程
                    if (this.journeyInformation.journeyType === 2) {
                        if (this.timeType === 0) {
                            // 绝对时间
                            return this.task.taskDate ? this.task.taskDate.split(' ')[1] : '00:00';
                        }
                        // 相对时间
                        return this.task.relativeTime || '';
                    }
                    if (this.timeType === 0) {
                        // 绝对时间
                        return this.task.taskDate
                            ? this.task.taskDate.split(' ')[1]
                            : this.defaultTaskDay.split(' ')[1];
                    }
                    // 相对时间
                    return this.task.relativeTime || '';
                },
                set(hourAndMinuteStr) {
                    // 实时旅程
                    if (this.journeyInformation.journeyType === 2) {
                        if (this.timeType === 0) {
                            // 绝对时间
                            let day = this.task.taskDate ? this.task.taskDate.split(' ')[0] : '';
                            this.task.taskDate = day + ' ' + hourAndMinuteStr;
                        } else {
                            // 相对时间
                            this.task.relativeTime = hourAndMinuteStr;
                        }
                    } else {
                        if (this.timeType === 0) {
                            // 绝对时间
                            let day = this.task.taskDate
                                ? this.task.taskDate.split(' ')[0]
                                : this.defaultTaskDay.split(' ')[0];
                            this.task.taskDate = day + ' ' + hourAndMinuteStr;
                        } else {
                            // 相对时间
                            this.task.relativeTime = hourAndMinuteStr;
                        }
                    }
                }
            },
            mailSubject: {
                get() {
                    return this.isADMail ? this.task.mailSubject.replace(/^\(AD\) /, '') : this.task.mailSubject;
                },
                set(val) {
                    this.task.mailSubject = this.isADMail ? ('(AD) ' + val) : val;
                }
            },
            isADMail: {
                get() {
                    return this.task.mailSubject.startsWith(AD_EMAIL_PREFIX);
                },
                set(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        if (newVal) {
                            this.task.mailSubject = AD_EMAIL_PREFIX + this.task.mailSubject;
                        } else {
                            if (this.isADMail)
                                this.task.mailSubject = this.task.mailSubject.replace(AD_EMAIL_PREFIX, '');
                        }
                    }
                }
            },
            unsubscribeLinkMissing() {
                return this.material.materialContent
                    && !this.material.materialContent.includes('{$PLUGINLINK=unsubscribe}');
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
            today() {
                return format(new Date(timeZoneToday(this.journeyInformation.timeZone)), 'YYYY-MM-DD');
            },
            // 定时旅程-默认任务时间 当前时区的时间 + 5 分钟
            defaultTaskDay() {
                let date = new Date(timeZoneToday(this.journeyInformation.timeZone));
                let min = date.getMinutes();
                date.setMinutes(min + 5);
                let day = format(date, 'YYYY-MM-DD HH:mm');
                if (!this.task.taskDate) {
                    this.task.taskDate = day;
                }
                return day;
            },
            writable() {
                // 旅程可编辑，且控件ID不在 readonlyIds 中
                return this.journeyWritable && !this.readonlyIds.includes(this.controller.id);
            },
            // 旅程待审批状态
            statusApprove() {
                return this.journeyInformation.journeyStatus === 9;
            }
        },
        components: {MaterialStore, DelayTimePicker, editSenderModal}
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";

    .email-controller-form {
        .mail-subject-ad-prefix {
            display: inline-block;
            padding: 0 8px;
            color: $light-green;
            background-color: $content-bg;
            border-radius: 4px;
        }

        .email-content {
            position: relative;
            height: 400px;
            border: 1px solid $border-color;
            border-radius: 5px;
            overflow: hidden;
        }

        .timer {
            .calendar {
                margin-top: 0;
            }

            .hour-minute-select {
                margin-top: 0;
            }
        }
    }
</style>
