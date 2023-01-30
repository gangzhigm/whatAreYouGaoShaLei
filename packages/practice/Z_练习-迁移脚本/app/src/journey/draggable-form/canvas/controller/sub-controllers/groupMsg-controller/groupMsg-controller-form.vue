<template>
    <modal class="groupMsg-controller-form" :title="controller.name || $t('dragJourney.groupMsg')" @close="cancel()">
        <p v-if="controller.id===validationResult.errorId" class="error-message">
            {{validationResult.errorMessage}}
        </p>
        <!-- 头部提示说明 -->
        <div class="wecom-cue">
            <svg aria-hidden="true">
                <use xlink:href="#icon-warn"></use>
            </svg>
            <p>{{'controller.groupMsgCueA' | t}}</p>
            <p>{{'controller.groupMsgCueB' | t}}</p>
        </div>
        <!-- 任务名称 -->
        <div class="form-field flex">
            <label class="label" for="taskName">{{'controller.step_title' | t}}</label>
            <span v-if="isChecking">{{task.taskName}}</span>
            <div v-else class="field-group">
                <input maxlength="200" type="text" v-model.trim="task.taskName" id="taskName" class="input xl">
            </div>
        </div>
        <!-- 发送时间 -->
        <div class="form-field flex timer">
            <label class="label">{{'journey.sendTime' | t}}</label>
            <span v-if="isChecking">
                {{timeFormatText}}
                <span v-if="timeType === 0">{{taskDay}}</span>
                <span v-if="timeType === 1">
                    {{'controller.the' | t}}
                    {{task.days}}
                    {{'controller.dayA' | t}}
                </span>
                {{taskHourAndMinute}}
                {{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}
            </span>
            <div v-else class="field-group">
                <span class="title-text"> {{timeFormatText}} </span>
                <calendar v-if="timeType === 0"
                          v-model="taskDay"
                          :start="today" :showTodayBtn="false"/>
                <template v-if="timeType === 1">
                    {{'controller.the' | t}}
                    <number-input class="input tiny" v-model="task.days" :min="1" :max="30"/>
                    {{'controller.dayA' | t}}
                </template>
                <hour-minute-select v-model="taskHourAndMinute"/>
                <p>{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
            </div>
        </div>
        <!-- 消息内容 -->
        <div class="form-field flex wecom-material">
            <label class="label">{{'dragJourney.agentmsg' | t}}</label>
            <div class="field-group">
                <!-- 首项固定的文本素材 -->
                <wecom-material-editor class="wecom-material-text"
                                       :msgtypes="['text']"
                                       :msgtype.sync="task.wxContext.msgtype"
                                       :val.sync="task.wxContext.text"
                                       :readonly="isChecking"
                                       @switch="handleSwitch(task.wxContext)"
                                       ref="wecomTextEditor">
                    <h6>{{'controller.contentMsg' | t}}1</h6>
                </wecom-material-editor>
                <!-- 素材列表 -->
                <div v-for="(msg,index) in task.workWechatMsg" :key="msg.uid">
                    <div class="wecom-material-line"></div>
                    <wecom-material-editor :msgtypes="['image', 'link', 'miniprogram']"
                                           :msgtype.sync="msg.msgtype"
                                           :val.sync="msg[msg.msgtype]"
                                           :readonly="isChecking"
                                           @switch="handleSwitch(msg)"
                                           ref="wecomEditor">
                        <h6>{{'controller.contentMsg' | t}}
                            {{index + 2}}
                            <svg v-if="!isChecking" aria-hidden="true" @click="delWecomMaterial(msg.uid)">
                                <use xlink:href="#icon-iconless"></use>
                            </svg>
                        </h6>
                    </wecom-material-editor>
                </div>
                <!-- 添加素材按键 -->
                <span v-if="task.workWechatMsg.length < 9 && !isChecking"
                      class="add-wecom-material"
                      @click="addWecomMaterial">
                      + {{'controller.add' | t}}
                </span>
            </div>
        </div>

        <template v-if="!isChecking" v-slot:buttons>
            <button class="btn btn-md btn-white" @click="cancel">{{'common.cancel' | t}}</button>
            <button class="btn btn-md btn-theme" @click="confirm">{{'common.confirm' | t}}</button>
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
    import { JourneyApiV3 } from '@/api';
    import {
        UPDATE_CONTROLLER,
        UPDATE_SAVE_TASK_STATUS
    } from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME, uniqId} from '@/store/vuex/modules/canvasStore';
    import {CHECK_JOURNEY_NEW_VERSION, SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import {TIME_ZONE_RNAGES, timeZoneToday} from '@/common/utils/timeZone';
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';

    export default {
        props: {
            controller: Object,
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
                    days: '',
                    relativeTime: '',
                    taskDate: '',
                    workWechatMsg: [],      //素材列表
                    wxContext: {            //首项固定的文本素材
                        msgtype: 'text',
                        text: {
                            content: ''
                        }
                    }
                },
                timer: TIME_ZONE_RNAGES
            };
        },
        computed: {
            ...mapGetters(['onPending']),
            ...mapState({
                validationResult: state => state[DRAGGABLE_JOURNEY_STORE_NAME].validationResult,
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                isChecking (state) {
                    return this.checking ? true : state[DRAGGABLE_JOURNEY_STORE_NAME].isChecking;
                } 
            }),
            // 绝对时间：日期
            taskDay: {
                get() {
                    return this.task.taskDate ? this.task.taskDate.split(' ')[0] : '';
                },
                set(dayStr) {
                    let hourAndMinute = this.task.taskDate ? this.task.taskDate.split(' ')[1] : '00:00';
                    this.task.taskDate = dayStr + ' ' + hourAndMinute;
                }
            },
            // 绝对时间、相对时间共用：小时分钟
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
        created() {
            this.$set(this.$data, 'task', Object.assign({}, this.controller.pushInfo));
            this.task.days === null && (this.task.days = '');
            !this.task.taskName && (this.task.taskName = this.controller.name);
            if (!this.task.wxContext) {
                //新建控件
                Object.assign(this.task, {
                    workWechatMsg: [],
                    wxContext: {
                        msgtype: 'text',
                        text: {
                            content: ''
                        }
                    }
                });
            } else {
                //编辑控件
                let txt = JSON.parse(this.task.wxContext).text;
                this.task.wxContext = {
                    msgtype: 'text',
                    text: {
                        content: txt
                    }
                };
                this.task.workWechatMsg = JSON.parse(this.task.workWechatMsg);
                this.task.workWechatMsg.forEach(msg => {
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
            // 添加素材
            addWecomMaterial() {
                if (this.task.workWechatMsg.length < 9) {
                    this.task.workWechatMsg.push({
                        uid: uniqId(),
                        msgtype: 'image',
                        image: {
                            media_id: ''
                        }
                    });
                }
            },
            // 删除素材
            delWecomMaterial(uid) {
                let realIndex = this.task.workWechatMsg.findIndex(e => e.uid === uid);
                this.task.workWechatMsg.splice(realIndex, 1);
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
            //任务素材校验
            valid() {
                const res = this.$refs.wecomTextEditor.valid();
                const arrRes = this.task.workWechatMsg.length ?
                    this.$refs.wecomEditor.every(e => e.valid()) : true;
                if (res && arrRes) return true;
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
                if (!this.task.taskName) {
                    this.$toast(this.$t('journey.taskNameNotEmpty'), 'warn');
                    return false;
                }
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
                taskInfo.workWechatMsg.forEach(e => {
                    delete e.uid;
                });
                taskInfo.wxContext.text = this.task.wxContext.text.content;
                taskInfo.wxContext = JSON.stringify(taskInfo.wxContext);
                taskInfo.workWechatMsg = JSON.stringify(taskInfo.workWechatMsg);
                JourneyApiV3
                    .updateTask(taskInfo)
                    .then(({body: {data: {task}}}) => {
                        this.UPDATE_SAVE_TASK_STATUS(false);
                        let controller = cloneDeep(this.controller);
                        Object.assign(controller.pushInfo, this.task, task);
                        controller.name = this.task.taskName;
                        this.UPDATE_CONTROLLER(controller);
                        this.SAVE_JOURNEY(false);
                        this.cancel();
                    })
                    .catch(() => {
                        this.UPDATE_SAVE_TASK_STATUS(false);
                    });
            }

        },
        components: { WecomMaterialEditor }
    };
</script>
<style lang="scss" type="text/scss">

    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .groupMsg-controller-form {
        .modal {
            width: 800px;
        }
        .modal-content {
            height: 500px;
            overflow-y: scroll;
        }
        .timer > label {
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
                .wecom-material-text {
                    .tabs-container {
                        .radio {
                            display: none;
                        }
                    }
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
