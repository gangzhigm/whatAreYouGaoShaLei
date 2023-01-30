<template>
    <!-- 联系人标签控件modal -->
    <modal :title="$t(isDeleteTagController ? 'dragJourney.removeContactTag' : 'dragJourney.addContactTag')"
           :class="writable && !isChecking ? 'tag-controller-form' : 'tag-controller-view'"
           @close="close">

        <!--实时，定时-->
        <template>
            <template v-if="writable && !isChecking">
                <!--控件名称-->
                <div class="form-field flex">
                    <label class="label" for="stepName">{{'controller.stepName' | t}}</label>
                    <div class="field-group">
                        <input class="input tag-input" maxlength="15" type="text" v-model.trim="name" id="stepName"
                               :placeholder="$t(isDeleteTagController ? 'dragJourney.removeContactTag' : 'dragJourney.addContactTag')">
                    </div>
                </div>
                <!--标签-->
                <div class="form-field flex">
                    <span class="label">{{'contact.selectLabel' | t}}</span>
                    <div class="field-group">
                        <selector-tree :options="groupList" :value="addTagIds" :max="10" :loading="selectorTreeLoading"
                                       @checkOptions="pickLabels($event)" v-model="members.selectedList" :maxlength="200"/>
                        <i class="icon icon-loading" v-if="selectorTreeLoading"></i>
                        <p class="light-content-text">{{'controller.tagMax' | t}}</p>
                    </div>
                </div>
            </template>
            <!--查看详情-->
            <template v-else>
                <div class="form-field flex">
                    <span class="label">{{'controller.stepName' | t}}</span>
                    {{name}}
                </div>
                <!--标签-->
                <template>
                    <div class="form-field flex" v-if="selectorTreeLoading">
                        <span class="label"></span>
                        <i class="icon icon-loading"></i>
                    </div>
                    <div v-else>
                        <div class="form-field flex" v-if="members.selectedList.length > 0">
                            <span class="label">{{'contact.selectLabel' | t}}</span>
                            <div class="tag-box">
                                <span v-for="tag in members.selectedList" :title="tag.name" class="tag">
                                    {{tag.name}}&nbsp;&nbsp;
                                </span>
                            </div>
                        </div>
                        <div class="form-field flex" v-else>
                            <span class="label"/>
                            {{controller.summary}}
                        </div>
                    </div>
                </template>
            </template>
        </template>

        <!--实时旅程-->
        <template v-if="journeyType === 2">
            <!--里程碑-->
            <div class="form-field">
                <span class="label placeholder"></span>
                <checkbox v-model="milestone" :disabled="!writable || isChecking">
                    {{'controller.set_milestone' | t}}
                </checkbox>
                <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
            </div>
        </template>

        <!--定时旅程-->
        <template v-if="journeyType !== 2">
            <template v-if="writable && !isChecking">
                <!--执行时间-->
                <div class="form-field flex">
                    <label class="label">{{'controller.executionTime' | t}}</label>
                    <div class="field-group">
                        <span class="title-text"> {{timeFormatText}}</span>
                        <calendar v-if="timeType === 0" v-model="taskDay" :start="today" :showTodayBtn="false"/>
                        <template v-if="timeType === 1" class="relative-time">
                            {{'controller.the' | t}}
                            <number-input class="input tiny" :min="1" :max="30" v-model="task.days"/>
                            {{'controller.dayA' | t}}
                        </template>
                        <hour-minute-select v-model="taskHourAndMinute"/>
                        <p>{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
                    </div>
                </div>
            </template>
            <!-- 查看详情 -->
            <template v-else>
                <!--执行时间-->
                <div class="form-field flex">
                    <label class="label">{{'controller.executionTime' | t}}</label>
                    <span>
                        {{timeFormatText}}
                        <span v-if="timeType === 0">{{taskDay}}</span>
                        <span v-if="timeType === 1">
                            {{'controller.the' | t}}{{task.days}}{{'controller.dayA' | t}}
                        </span>
                        {{taskHourAndMinute}}
                        <p>{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
                    </span>
                </div>
            </template>
        </template>

        <template v-slot:buttons>
            <!-- 表单 -->
            <input v-if="writable && !isChecking" type="button" class="btn btn-md btn-theme" @click="confirm"
                   :value="$t('common.confirm')"/>
            <!-- 查看详情 -->
            <input v-else type="button" class="btn btn-md btn-white" @click="close" :value="$t('common.close')"/>
        </template>
    </modal>
</template>

<script>
    import { ContactApiV1, JourneyApiV3 } from '@/api';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {
        ADD_MILESTONE,
        REMOVE_MILESTONE,
        SET_ACTIVE_CONTROLLER,
        UPDATE_CONTROLLER,
        UPDATE_SAVE_TASK_STATUS
    } from '@/store/vuex/mutationTypes';
    import cloneDeep from 'lodash/cloneDeep';
    import memberTag from '../components/member-tag.vue';
    import SelectorTree from '@/common/components/selector-tree.vue';
    import {DELETE_CONTACT_TAG_CONTROLLER} from '../../CONTROLLER_TYPES';
    import {SAVE_JOURNEY, CHECK_JOURNEY_NEW_VERSION} from '@/store/vuex/actionTypes';
    import {logError} from '../../../../../../monitor';
    import {TIME_ZONE_RNAGES, timeZoneToday} from '@/common/utils/timeZone';
    import format from 'date-fns/format';
    import { mapActions, mapMutations, mapState } from 'vuex';

    export default {
        components: {
            memberTag,
            SelectorTree
        },
        data() {
            return {
                selectorTreeLoading: false,
                addTagIds: [],// 选中的标签ids
                members: {selectedList: [], chooseIdList: {groups: [], labels: []}},
                milestone: true,
                name: '',
                groupList: [], // 标签分组列表
                allLabelList: [], // 标签列表
                timeOptions: [
                    {id: 1, name: this.$t('controller.immediate')}, // 即时
                    {id: 0, name: this.$t('controller.after')}, // 等待
                    {id: 2, name: this.$t('controller.absolute')}, // 定时
                ],
                task: {
                    taskId: null,
                    taskName: '',
                    sendBehavior: '',       // 0 过期停止 1 过期即时
                    days: '',
                    relativeTime: '',
                    taskDate: '',
                    immediately: ''         // 0 等待，1 即时，2 定时
                },
                timer: TIME_ZONE_RNAGES
            };
        },
        computed: {
            ...mapState({
                controllers: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.controllers,
                activeControllerId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].activeControllerId,
                readonlyIds: state => state[DRAGGABLE_JOURNEY_STORE_NAME].readonlyControllerIds,
                isAMileStone(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation
                        .milestones.includes(this.controller.id);
                },
                isChecking: state => state[DRAGGABLE_JOURNEY_STORE_NAME].isChecking,
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation
            }),
            controller() {
                return this.controllers[this.activeControllerId];
            },
            writable() {
                // 定时旅程可编辑，且控件ID不在 readonlyIds 中
                return this.$store.getters.journeyWritable && !this.readonlyIds.includes(this.controller.id);
            },
            isDeleteTagController() {
                return this.controller.type === DELETE_CONTACT_TAG_CONTROLLER;
            },
            // 旅程类型 0：单次 1：周期 2:实时
            journeyType() {
                return this.journeyInformation.journeyType;
            },
            // 0 绝对时间; 1 相对时间
            timeType() {
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
            // 定时旅程：绝对时间：日期
            taskDay: {
                get() {
                    return this.task.taskDate ? this.task.taskDate.split(' ')[0] : this.defaultTaskDay.split(' ')[0];
                },
                set(dayStr) {
                    let hourAndMinute = this.task.taskDate
                        ? this.task.taskDate.split(' ')[1]
                        : this.defaultTaskDay.split(' ')[1];
                    this.task.taskDate = dayStr + ' ' + hourAndMinute;
                }
            },
            // 定时旅程，绝对时间、相对时间共用：小时分钟
            taskHourAndMinute: {
                get() {
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
            },
        },
        created() {
            this.fetchLabels();
            this.name = this.controller.name;

            if (this.journeyType === 2) {
                // 实时旅程
                this.milestone = this.isAMileStone;
                this.members.chooseIdList = this.controller.processInfo.decision.chooseIdList;
            } else {
                // 定时旅程
                // prepare this.task for editing
                this.$set(this.$data, 'task', Object.assign({}, this.task, this.controller.pushInfo));
                this.task.days === null && (this.task.days = '');
                !this.task.taskName && (this.task.taskName = this.controller.name);
                // 0 等待，1即时，2定时
                this.task.immediately = ~~this.task.immediately;
            }
        },
        methods: {
            ...mapActions({
                CHECK_JOURNEY_NEW_VERSION,
                SAVE_JOURNEY
            }),
            ...mapMutations([
                UPDATE_CONTROLLER,
                UPDATE_SAVE_TASK_STATUS,
                ADD_MILESTONE,
                REMOVE_MILESTONE,
                SET_ACTIVE_CONTROLLER
            ]),
            // 获取标签列表
            fetchLabels() {
                this.selectorTreeLoading = true;
                ContactApiV1
                    .getGroups({
                        sortType: this.sortType
                    })
                    .then(res => {
                        // 标签分组列表
                        this.groupList = res.body.data.rootGroup.childs;

                        this.selectorTreeLoading = false;
                        
                        // 标签列表
                        this.groupList.forEach(item => {
                            if (item.labels  && item.labels.length > 0) {
                                this.allLabelList = this.allLabelList.concat(item.labels);
                            }
                            item.childs.forEach(label => {
                                if (label.labels.length > 0) {
                                    this.allLabelList = this.allLabelList.concat(label.labels);
                                }
                                label.childs.forEach(name => {
                                    if (name.labels && name.labels.length > 0) {
                                        this.allLabelList = this.allLabelList.concat(name.labels);
                                    }
                                });
                            });
                        });

                        let selectedList = this.journeyType === 2
                            ? this.controller.processInfo.decision.settings
                            : this.controller.pushInfo.tags;

                        // 有权限且未被删除的标签
                        this.members.selectedList = this.allLabelList.filter(y => {
                            return selectedList.some(x => y.id === x.id);
                        });
                    })
                    .catch(() => {
                        this.selectorTreeLoading = false;
                    });
            },
            // 选择标签
            pickLabels(val) {
                this.members.selectedList = val;
                this.addTagIds = this.members.selectedList.map(elm => elm.id);
            },
            delTag(e) {
                this.chooseTag.forEach((item, index) => {
                    if (item.id === e) {
                        this.chooseTag.splice(index, 1);
                    }
                });
            },
            confirm() {
                if (!this.name) {
                    this.$toast(this.$t('controller.setWarn'), 'warn');
                    return;
                }
                if (this.journeyType === 2) {
                    // 实时旅程
                    this.commitMilestone();
                } else {
                    // 定时旅程
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
                }
                this.commitController();

                this.close();
            },

            commitController() {
                let con = cloneDeep(this.controller);
                con.name = this.name;
                this.task.taskName = this.name;
                let tag = '';
                // 旅程版本检查
                this.CHECK_JOURNEY_NEW_VERSION()
                    .then(() => {
                        if (this.journeyType === 2) {
                            // 实时旅程
                            con.processInfo.decision.settings = this.members.selectedList;
                            con.processInfo.decision.chooseIdList = this.members.chooseIdList;
                            for (let i of this.members.selectedList) {
                                tag = tag + i.name + ' ';
                            }
                            con.summary = tag;
                            this.UPDATE_CONTROLLER(con);
                            this.SAVE_JOURNEY(false);
                        } else {
                            // 定时旅程
                            con.pushInfo.tags = this.members.selectedList;
                            for (let i of this.members.selectedList) {
                                tag = tag + i.name + ' ';
                            }
                            con.summary = tag;
                            this.UPDATE_CONTROLLER(con);

                            // 更新任务
                            JourneyApiV3
                                .updateTask(this.task)
                                .then(({body: {data: {task}}}) => {
                                    this.$toast(this.$t('common.saveSuccess'), 'success');
                                    let controller = cloneDeep(con);
                                    Object.assign(controller.pushInfo, task);
                                    controller.name = this.task.taskName;
                                    this.UPDATE_CONTROLLER(controller);
                                    this.SAVE_JOURNEY(false);
                                });
                        }
                    })
                    .catch(() => {
                        this.UPDATE_SAVE_TASK_STATUS(false);
                    });
            },
            // milestone
            commitMilestone() {
                if (this.isAMileStone !== this.milestone) {
                    this.milestone ? this.ADD_MILESTONE(this.controller.id) : 
                        this.REMOVE_MILESTONE(this.controller.id);
                }
            },
            close() {
                this.SET_ACTIVE_CONTROLLER('');
            },
            getSendBehavior(behavior) {
                return behavior === 0 ? this.$t('controller.stopWhenExpired') : this.$t('controller.realTimeWhenExpired');
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
                        break;
                    default:
                        logError('不能识别的 task.immediately: ' + immediately);
                }
            },
        }
    };
</script>


<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .tag-controller-form {
        .member-tag {
            flex: 1;
        }

        .tag-input {
            width: $form-input-width - 18px;
        }
    }

    .tag-controller-view {
        $gutter: ($input-field-height - 24px - 2px)/2;

        .form-field {
            label {
                min-width: 114px;
            }
        }
        .tag-box {
            flex: 1;
            box-sizing: border-box;
            padding: $gutter $gutter*2 0;
            border: 1px solid $border-color;
            border-radius: 4px;
            vertical-align: middle;
            display: flex;
            flex-wrap: wrap;

            .tag {
                min-width: 75px;
                height: 24px;
                line-height: 22px;
                max-width: 285px;
                vertical-align: top;
                margin: 0 $gutter $gutter 0;
                padding: 0 10px;
                box-sizing: border-box;
                border-radius: 4px;
                color: $dark-purple;
                border: 1px solid $dark-purple;
                @include ellipsis();
            }
        }
    }
</style>
