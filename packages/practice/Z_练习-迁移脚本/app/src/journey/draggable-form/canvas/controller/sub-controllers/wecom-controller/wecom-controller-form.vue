<template>
    <modal class="wecom-controller-form" :title="controller.name || $t('dragJourney.agentMsg')" @close="cancel()">
        <p v-if="controller.id === validationResult.errorId" class="error-message">
            {{validationResult.errorMessage}}
        </p>
        <!-- 头部提示说明 -->
        <div class="wecom-cue">
            <svg aria-hidden="true">
                <use xlink:href="#icon-warn"></use>
            </svg>
            <p>{{'controller.agentMsgCueA' | t}}</p>
            <p>{{'controller.agentMsgCueB' | t}}</p>
        </div>
        <!-- 任务名称 -->
        <div class="form-field flex">
            <label class="label" for="taskName">{{'controller.step_title' | t}}</label>
            <span v-if="isChecking">{{task.taskName}}</span>
            <div v-else class="field-group">
                <input type="text" maxlength="200" v-model.trim="task.taskName" class="input xl" id="taskName">
            </div>
        </div>
        <!-- 发送时间 -->
        <div class="form-field flex timer">
            <!-- 实时：发送等待 -->
            <template v-if="journeyInformation.journeyType === 2">
                <label class="label">{{'controller.send_wait' | t}}</label>
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
                        <radio :source="0" v-model="task.sendBehavior">
                            {{'controller.stopWhenExpired' | t}}
                        </radio>
                        <radio :source="1" v-model="task.sendBehavior">
                            {{'controller.realTimeWhenExpired' | t}}
                        </radio>
                        <i class="action-icon icon icon-help" v-title:bottom="$t('controller.expireTip')"></i>
                        <p>{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
                    </template>
                </div>
            </template>
            <!-- 定时：发送时间 -->
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
        <!-- 素材内容列表 -->
        <div class="form-field flex wecom-material">
            <label class="label">{{'dragJourney.agentmsg' | t}}</label>
            <div class="field-group">
                <div v-for="(msg,index) in task.applicationDetail" :key="msg.uid">
                    <div v-if="index" class="wecom-material-line"></div>
                    <wecom-material-editor :msgtypes="['text', 'image', 'link']"
                                           :msgtype.sync="msg.msgtype"
                                           :val.sync="msg[msg.msgtype]"
                                           :readonly="isChecking"
                                           @uploading="imgUploading"
                                           @switch="handleSwitch(msg)"
                                           ref="wecomEditor">
                        <h6>{{'controller.contentMsg' | t}}
                            {{index + 1}}
                            <svg v-if="task.applicationDetail.length > 1 && !isChecking" aria-hidden="true" @click="delWecomMaterial(msg.uid)">
                                <use xlink:href="#icon-iconless"></use>
                            </svg>
                        </h6>
                    </wecom-material-editor>
                </div>
                <!-- 添加素材按键 -->
                <span v-if="task.applicationDetail.length < 10 && !isChecking"
                      class="add-wecom-material"
                      @click="addWecomMaterial">
                      + {{'controller.add' | t}}
                </span>
            </div>
        </div>
        <template v-if="!isChecking" v-slot:buttons>
            <button class="btn btn-md btn-white" @click="cancel">{{'common.cancel' | t}}</button>
            <button class="btn btn-md btn-theme" :disabled="isUploading" @click.stop="confirm()">{{'common.confirm' | t}}</button>
        </template>
        <template v-else v-slot:buttons>
            <button class="btn btn-md btn-white" @click="cancel">{{'common.close' | t}}</button>
        </template>
    </modal>
</template>

<script type="text/ecmascript-6">
    import cloneDeep from 'lodash/cloneDeep';
    import format from 'date-fns/format';
    import { WecomMaterialEditor } from '@/views/wecom/components';
    import DelayTimePicker from '../components/delay-time-picker.vue';
    import { JourneyApiV3 } from '@/api';
    import {
        UPDATE_CONTROLLER,
        UPDATE_SAVE_TASK_STATUS
    } from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME, uniqId} from '@/store/vuex/modules/canvasStore';
    import {CHECK_JOURNEY_NEW_VERSION, SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import {logError} from '../../../../../../monitor';
    import {TIME_ZONE_RNAGES, timeZoneToday} from '@/common/utils/timeZone';
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';

    export default {
        props: {
            controller: Object,
            signatureList: Array,
            checking: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                task: {
                    taskId: null,
                    taskName: '',
                    materialId: null,
                    sendBehavior: 0, // 0 过期停止 1 过期即时
                    immediately: 0, // 0 等待，1 即时，2 定时
                    days: '',
                    relativeTime: '',
                    taskDate: '',
                    applicationDetail: [{   //素材列表
                        msgtype: 'text',
                        text: {
                            content: ''
                        }
                    }]
                },
                timeOptions: [
                    {id: 1, name: this.$t('controller.immediate')}, // 即时
                    {id: 0, name: this.$t('controller.after')}, // 等待
                    {id: 2, name: this.$t('controller.absolute')}, // 定时
                ],
                timer: TIME_ZONE_RNAGES,
                isUploading: false  //图片是否上传中
            };
        },
        created() {
            // prepare this.task for editing
            this.$set(this.$data, 'task', Object.assign({}, this.controller.pushInfo));
            this.task.days === null && (this.task.days = '');
            !this.task.taskName && (this.task.taskName = this.controller.name);
            // 0 等待，1即时，2定时
            this.task.immediately = ~~this.task.immediately;

            if (!this.task.applicationDetail || !this.task.applicationDetail.length) {
                //新建控件
                Object.assign(this.task, {
                    applicationDetail: [{
                        uid: uniqId(),
                        msgtype: 'text',
                        text: {
                            content: ''
                        }
                    }]
                });
            } else {
                //编辑控件
                this.task.applicationDetail = JSON.parse(this.task.applicationDetail);
                this.task.applicationDetail.forEach(msg => {
                    msg.uid = uniqId();
                });
            }
        },
        methods: {
            ...mapActions([
                CHECK_JOURNEY_NEW_VERSION,
                SAVE_JOURNEY
            ]),
            ...mapMutations([
                UPDATE_SAVE_TASK_STATUS,
                UPDATE_CONTROLLER
            ]),
            //发送时间类型切换
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
            // 添加素材
            addWecomMaterial() {
                if (this.task.applicationDetail.length < 10) {
                    this.task.applicationDetail.push({
                        uid: uniqId(),
                        msgtype: 'text',
                        text: {
                            content: ''
                        }
                    });
                }
            },
            // 删除素材
            delWecomMaterial(uid) {
                let realIndex = this.task.applicationDetail.findIndex(e => e.uid === uid);
                this.task.applicationDetail.splice(realIndex, 1);
            },
            /**
             * @description 削除无用key
             * @param {object} target 目标消息对象
             */
            handleSwitch (target) {
                Object.keys(target).forEach(key => {
                    if (key !== 'msgtype' && key !== target.msgtype) {
                        this.$delete(target, key);
                    }
                });
            },
            // 图片是否上传中
            imgUploading(bool) {
                this.isUploading = bool;
            },
            //素材校验
            valid () {
                const res = this.$refs.wecomEditor.every(e => e.valid());
                if (res) return true;
            },
            cancel() {
                this.$emit('close');
            },
            //确认
            confirm() {
                if (this.onPending) {
                    this.$toast(this.$t('dragJourney.delayOperate'),'warn');
                    return;
                }

                if (this.task.taskName === '') {
                    return this.$toast(this.$t('journey.taskNameNotEmpty'), 'warn');
                }

                if (this.journeyInformation.journeyType !== 2) {    // 定时旅程
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
                } else {    // 实时旅程
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

                // 内容校验
                if (!this.valid()) return;

                // 旅程版本检查
                this.CHECK_JOURNEY_NEW_VERSION()
                    .then(() => {
                        // 更新任务
                        this.updateJourneyTask();
                    })
                    .catch(() => {
                        this.UPDATE_SAVE_TASK_STATUS(false);
                    });
            },
            // 更新任务
            updateJourneyTask() {
                this.UPDATE_SAVE_TASK_STATUS(true);
                let taskInfo = cloneDeep(this.task);
                taskInfo.applicationDetail.forEach(e => {
                    delete e.uid;
                });
                taskInfo.applicationDetail = JSON.stringify(taskInfo.applicationDetail);
                JourneyApiV3
                    .updateTask(taskInfo)
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

                this.cancel();
            },
            // 返回发送方式
            getSendBehavior(behavior) {
                return behavior === 0 ? this.$t('controller.stopWhenExpired') : this.$t('controller.realTimeWhenExpired');
            },
        },
        computed: {
            ...mapGetters(['onPending']),
            ...mapState({
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                validationResult: state => state[DRAGGABLE_JOURNEY_STORE_NAME].validationResult,
                isChecking(state) {
                    return this.checking ? true : state[DRAGGABLE_JOURNEY_STORE_NAME].isChecking;
                }
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
            today() {
                return format(new Date(timeZoneToday(this.journeyInformation.timeZone)), 'YYYY-MM-DD');
            }
        },
        components: { DelayTimePicker, WecomMaterialEditor }
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .wecom-controller-form {
        .modal {
            width: 800px;
        }
        .modal-content {
            height: 500px;
            overflow-y: scroll;
        }
        .timer > label{
            min-width: 114px;
        }
        .wecom-cue {
            position: relative;
            width: 550px;
            line-height: $input-field-height / 2;
            color: $color-light-content;
            background-color: rgba(234, 249, 255, 1);
            border: 1px solid rgba(149, 215, 244, 1);
            padding: 6px 10px;
            margin: 0 auto 20px;
            p {
                padding-left: 30px;
            }
            svg {
                position: absolute;
                left: 10px;
                top: 12px;
                width: 20px;
                height: 20px;
                fill: $dark-blue;
            }
        }

        .xl {
            width: 400px;
        }

        .timer {
            .calendar {
                margin-top: 0;
            }

            .hour-minute-select {
                margin-top: 0;
            }
        }

        .wecom-material {
            .field-group {
                margin-top: -3px;
                line-height: normal;
                .wecom-material-line {
                    width: 400px;
                    border-top: 1px solid $border-color;
                    margin: 10px 0 0 5px;
                }
                .wecom-material-editor {
                    .tabs-container {
                        margin-bottom: 5px;
                        h6 {
                            position: relative;
                            margin-bottom: 10px;
                            svg {
                                position: absolute;
                                top: 2px;
                                left: 150px;
                                width: 14px;
                                height: 14px;
                                fill: $dark-red;
                                cursor: pointer;
                            }
                        }
                    }
                    .material-container {
                        .form-field {
                            label {
                                text-align: left;
                            }
                        }
                        .wecom-text {
                            .text-editor-view {
                                height: calc(100% - 15px);
                            }
                        }
                        .wecom-link {
                            .form-field {
                                & > label {
                                    width: auto;
                                }
                            }
                        }
                    }
                }
                .add-wecom-material {
                    display: inline-block;
                    color: $light-green;
                    padding: 5px;
                    margin: 10px 0;
                    cursor: pointer;
                }
            }
        }
    }
</style>
