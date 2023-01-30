<template>
    <modal class="leads-transfer-controller-modal" :title="$t('dragJourney.leadTag')" @close="close">
        <div class="form-field">
            <label class="label">{{'controller.controllerName' | t}}</label>
            <input v-if="!isChecking" type="text" class="input" v-model.trim="controllerName" maxlength="200">
            <span v-else>{{controllerName}}</span>
        </div>
        <!--实时旅程 里程碑-->
        <div v-if="journeyInformation.journeyType === 2" class="form-field">
            <label class="label"></label>
            <checkbox v-model="milestone" :disabled="isChecking">{{'controller.set_milestone' | t}}</checkbox>
            <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
        </div>
        <!--定时、周期旅程 执行时间-->
        <div v-else class="form-field flex">
            <label class="label more-margin">{{'controller.executionTime' | t}}</label>
            <div class="timer-selector">
                <template v-if="isChecking">
                    <span class="title-text"> {{timeFormatText}}</span>
                    <template v-if="timeType === 0">
                        {{time.date}}
                    </template>
                    <template v-if="timeType === 1" class="relative-time">
                        {{'controller.the' | t}}
                        {{time.days}}
                        {{'controller.dayA' | t}}
                    </template>
                    {{time.hourAndMinute}}
                    <p>{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
                </template>
                <div v-else class="field-group">
                    <span class="title-text"> {{timeFormatText}}</span>
                    <template v-if="timeType === 0">
                        <calendar :start="today" v-model="time.date" :showTodayBtn="false"/>
                    </template>
                    <template v-if="timeType === 1" class="relative-time">
                        {{'controller.the' | t}}
                        <number-input class="input tiny" :min="1" :max="30" v-model="time.days"/>
                        {{'controller.dayA' | t}}
                    </template>
                    <hour-minute-select v-model="time.hourAndMinute"/>
                    <p>{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
                </div>
            </div>
        </div>

        <!--按钮-->
        <button slot="buttons" class="btn btn-md btn-white" @click="close">{{'common.cancel' | t}}</button>
        <button v-if="!isChecking" slot="buttons" class="btn btn-md btn-theme"
                @click="confirm">{{'common.confirm' | t}}
        </button>
    </modal>
</template>

<script>
    import {
        ADD_MILESTONE,
        REMOVE_MILESTONE,
        SET_ACTIVE_CONTROLLER,
        UPDATE_CONTROLLER,
        UPDATE_SAVE_TASK_STATUS
    } from '@/store/vuex/mutationTypes';
    import calendar from '@/common/components/date-time/calendar.vue';
    import format from 'date-fns/format';
    import {TIME_ZONE_RNAGES, timeZoneToday} from '@/common/utils/timeZone';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {cloneDeep} from 'lodash';
    import {CHECK_JOURNEY_NEW_VERSION, SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import { JourneyApiV3 } from '@/api';
    import { mapActions, mapMutations, mapState } from 'vuex';

    export default {
        name: 'leads-transfer-controller-form',
        props: {
            controller: {
                type: Object,
                required: true,
            },
            isChecking: {
                type: Boolean
            }
        },
        data() {
            return {
                // 控件名称
                controllerName: this.$t('dragJourney.leadTag'),
                // 里程碑
                milestone: false,
                // 执行时间
                time: {
                    date: '',
                    hourAndMinute: '',
                    days: ''
                },
                timer: TIME_ZONE_RNAGES,
            };
        },
        created() {
            // 编辑时数据回显
            this.milestone = this.isAMileStone;
            if (this.pushInfo && Object.keys(this.pushInfo).length) {
                this.controllerName = this.pushInfo.taskName;
                if (this.pushInfo.taskDate && this.pushInfo.taskDate !== '') {
                    this.time.date = this.pushInfo.taskDate.split(' ')[0];
                    this.time.hourAndMinute = this.pushInfo.taskDate.split(' ')[1];
                    this.time.days = this.pushInfo.days;
                }
            }
        },
        computed: {
            ...mapState({
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                isAMileStone(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation
                        .milestones.includes(this.controller.id);
                },
                pushInfo(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME]
                        .canvasInformation.controllers[this.controller.id].pushInfo;
                },
            }),
            today() {
                return format(new Date(timeZoneToday(this.journeyInformation.timeZone)), 'YYYY-MM-DD');
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
        },
        methods: {
            ...mapMutations([
                SET_ACTIVE_CONTROLLER,
                ADD_MILESTONE,
                REMOVE_MILESTONE,
                UPDATE_SAVE_TASK_STATUS,
                UPDATE_CONTROLLER
            ]),
            ...mapActions([
                CHECK_JOURNEY_NEW_VERSION,
                SAVE_JOURNEY
            ]),
            // 关闭控件
            close() {
                this.SET_ACTIVE_CONTROLLER('');
            },
            // 保存控件
            confirm() {
                if (!this.controllerName) {
                    return this.$toast(this.$t('controller.controlsName'), 'warn');
                }

                // 定时旅程
                if (this.journeyInformation.journeyType !== 2) {
                    // 绝对时间校验
                    if (this.timeType === 0) {
                        // 年月日、小时、分钟都必填
                        if (this.time.date === '' || !/^\d{2}:\d{2}$/.test(this.time.hourAndMinute)) {
                            this.$toast(this.$t('controller.taskDate'), 'warn');
                            return;
                        }
                    }

                    // 相对时间校验
                    if (this.timeType === 1) {
                        // 相对时间的天数、小时、分钟都必填
                        if (this.time.days === '' || !/^\d{2}:\d{2}$/.test(this.time.hourAndMinute)) {
                            this.$toast(this.$t('controller.taskDate'), 'warn');
                            return;
                        }
                    }
                }


                const newController = cloneDeep(this.controller);
                newController.name = this.controllerName;
                newController.pushInfo.taskName = this.controllerName;
                // 定时、周期时间
                if (this.journeyInformation.journeyType !== 2) {
                    newController.pushInfo.taskDate = this.time.date + ' ' + this.time.hourAndMinute;
                    newController.pushInfo.days = this.time.days;
                    if (this.timeType === 0) {
                        // 清空相对时间设置
                        newController.pushInfo.relativeTime = '';
                    }
                    if (this.timeType === 1) {
                        newController.pushInfo.relativeTime = this.time.hourAndMinute;
                    }
                }
                // 校验旅程画布更新
                this.CHECK_JOURNEY_NEW_VERSION()
                    .then(() => {
                        // 实时里程碑
                        if (this.journeyInformation.journeyType === 2) {
                            // 更新里程碑设置
                            if (this.isAMileStone !== this.milestone) {
                                this.milestone ? this.ADD_MILESTONE(this.controller.id) : 
                                    this.REMOVE_MILESTONE(this.controller.id);
                            }
                        }
                        // 更新任务
                        this.updateTask(newController);
                    })
                    .catch(() => {
                        this.UPDATE_SAVE_TASK_STATUS(false);
                    });
            },
            // 更新任务
            updateTask(newController) {
                JourneyApiV3
                    .updateTask(newController.pushInfo)
                    .then(({body: {data: {task}}}) => {
                        let controller = cloneDeep(newController);
                        Object.assign(controller.pushInfo, task);
                        // 保存控件信息
                        this.UPDATE_CONTROLLER(controller);
                        // 保存旅程
                        this.SAVE_JOURNEY(false);
                        // 关闭弹出层
                        this.close();
                    });
            }
        },
        components: {
            calendar
        }
    };
</script>
<style lang="scss">

    .leads-transfer-controller-modal {
        .more-margin {
            margin-right: 15px;
        }
        .timer-selector {
            max-width: 420px;
        }
    }
</style>
