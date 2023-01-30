<template>
    <!-- 粉丝标签控件modal -->
    <modal :title="$t(isDeleteTagController ? 'dragJourney.removeFansTag' : 'dragJourney.addFansTag')"
           :class="writable && !isChecking ? 'tag-controller-form' : 'tag-controller-view'" @close="close">
        <!--实时旅程，定时旅程-->
        <template>
            <template v-if="writable && !isChecking">
                <div class="form-field flex">
                    <label class="label" for="stepName">{{'controller.stepName' | t}}</label>
                    <div class="field-group">
                        <input class="input tag-input" maxlength="15" type="text" v-model.trim="name" id="stepName"
                               :placeholder="$t(isDeleteTagController ? 'dragJourney.removeFansTag' : 'dragJourney.addFansTag')">
                    </div>
                </div>
                <div class="form-field flex">
                    <span class="label">{{'contact.selectLabel' | t}}</span>
                    <div class="field-group">
                        <selector class="hg" :options="publicAccountList" v-model="wechatId" search
                                  :placeholder="$t('sendChannel.selectAccount')" @select="selectAccount"/>
                    </div>
                </div>
                <div class="form-field flex" v-if="wechatId">
                    <span class="label"></span>
                    <div class="field-group">
                        <multi-select class="select-width" drop-direction="bottom" :options="labelList" :max="tagMax"
                                      v-model="addTagIds" unique-key="tagId" :shortcut-action="false"
                                      :placeholder="$t('contact.selectLabel')" @input="changeTagIds"/>
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
                <div class="form-field flex">
                    <span class="label">{{'contact.selectLabel' | t}}</span>
                    <template>
                        <span v-if="journeyType === 2">{{wechatName || controller.wechatName}}</span>
                        <span v-else>{{wechatName || controller.pushInfo.wechatName}}</span>
                    </template>
                </div>
                <template>
                    <div class="form-field flex" v-if="members.selectedList.length > 0">
                        <span class="label"/>
                        <div class="tag-box">
                            <span v-for="tag in members.selectedList" :title="tag.name" :key="tag.tagId" class="tag">
                                {{tag.name}}&nbsp;&nbsp;
                            </span>
                        </div>
                    </div>
                    <div class="form-field flex" v-else>
                        <span class="label"/>
                        {{controller.summary}}
                    </div>
                </template>
            </template>
        </template>

        <!--实时旅程-->
        <template v-if="journeyType === 2">
            <div class="form-field">
                <span class="label placeholder"></span>
                <checkbox v-model="milestone" :disabled="!writable || isChecking">{{'controller.set_milestone' | t}}
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
    import {DELETE_FANS_TAG_CONTROLLER} from '../../CONTROLLER_TYPES';
    import {SAVE_JOURNEY, CHECK_JOURNEY_NEW_VERSION} from '@/store/vuex/actionTypes';
    import {TIME_ZONE_RNAGES, timeZoneToday} from '@/common/utils/timeZone';
    import {logError} from '../../../../../../monitor';
    import { JourneyApiV3, WechatApiV1 } from '@/api';
    import format from 'date-fns/format';
    import { mapActions, mapMutations, mapState } from 'vuex';

    export default {
        components: {
            memberTag,
            SelectorTree
        },
        data() {
            return {
                addTagIds: [], // 选中的标签ids
                members: {selectedList: [], chooseIdList: {groups: [], labels: []}},
                milestone: true,
                name: '',
                wechatId: '', // 公众号id
                wechatAppid: '',
                wechatName: '',// 公众号名称
                publicAccountList: [], // 公众号列表
                labelList: [], // 标签列表
                tagMax: 10, // 粉丝标签最大个数
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
                timer: TIME_ZONE_RNAGES,
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
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                roleId: state => state.user.roleId,

            }),
            controller() {
                return this.controllers[this.activeControllerId];
            },
            writable() {
                // 定时旅程可编辑，且控件ID不在 readonlyIds 中
                return this.$store.getters.journeyWritable && !this.readonlyIds.includes(this.controller.id);
            },
            isDeleteTagController() {
                return this.controller.type === DELETE_FANS_TAG_CONTROLLER;
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
            this.name = this.controller.name;

            if (this.journeyType === 2) {
                // 实时旅程
                this.wechatId = this.controller.wechatId;
                this.wechatAppid = this.controller.wechatAppid;
                this.milestone = this.isAMileStone;
                this.members.selectedList = this.controller.processInfo.decision.settings;
                this.members.chooseIdList = this.controller.processInfo.decision.chooseIdList;
                this.addTagIds = this.members.selectedList.map(tag => tag.tagId);
            } else {
                // 定时旅程
                this.wechatId = this.controller.pushInfo.wechatId;
                this.wechatAppid = this.controller.pushInfo.wechatAppid;
                this.members.selectedList = this.controller.pushInfo.tags;
                this.addTagIds = this.members.selectedList.map(tag => tag.tagId);
                // prepare this.task for editing
                this.$set(this.$data, 'task', Object.assign({}, this.task, this.controller.pushInfo));
                this.task.days === null && (this.task.days = '');
                !this.task.taskName && (this.task.taskName = this.controller.name);
                // 0 等待，1即时，2定时
                this.task.immediately = ~~this.task.immediately;
            }
            this.fetchPublicAccountList();
            this.fetchLabelsByAccountId();
        },
        methods: {
            ...mapActions([
                CHECK_JOURNEY_NEW_VERSION,
                SAVE_JOURNEY
            ]),
            ...mapMutations([
                UPDATE_CONTROLLER,
                UPDATE_SAVE_TASK_STATUS,
                SET_ACTIVE_CONTROLLER,
                UPDATE_CONTROLLER,
                ADD_MILESTONE,
                REMOVE_MILESTONE
            ]),
            // 获取公众号列表
            fetchPublicAccountList() {
                WechatApiV1
                    .getWechatAccounts()
                    .then(res => {
                        // 主账号
                        let mainAccount = this.roleId === 0 || this.roleId === '';
                        let list = res.body.data.authorizerInfoList;
                        if (list.length > 0) {
                            this.publicAccountList = list.map(auth => ({
                                id: auth.authorizerInfoId,
                                WxAppId: auth.WxAppId,
                                name: auth.principalName,
                                serviceTypeInfo: auth.serviceTypeInfo,
                            }));
                            if (!this.wechatId) return;
                            let account = this.publicAccountList.filter(account => account.id === this.wechatId)[0];
                            if (account) {
                                this.wechatName = account.name;
                            } else {
                                if (this.writable && !this.isChecking) {
                                    // 编辑模式-主账号提示：公众号已解绑；非主账号提示：所在部门未分配公众号
                                    this.wechatId = '';
                                    let errMsg = mainAccount
                                        ? this.$t('controller.unboundAccount')
                                        : this.$t('controller.permissionDenied');
                                    this.$toast(errMsg, 'warn');
                                }
                            }
                        } else {
                            if (!this.wechatId) return;
                            if (this.writable && !this.isChecking) {
                                // 编辑模式-主账号提示：公众号已解绑；非主账号提示：所在部门未分配公众号
                                this.wechatId = '';
                                let errMsg = mainAccount
                                    ? this.$t('controller.unboundAccount')
                                    : this.$t('controller.permissionDenied');
                                this.$toast(errMsg, 'warn');
                            }
                        }
                    });
            },

            // 选择公众号
            selectAccount(e) {
                this.wechatId = e.id;
                this.wechatName = this.publicAccountList.filter(account => account.id === this.wechatId)[0].name;
                this.wechatAppid = this.publicAccountList.filter(account => account.id === this.wechatId)[0].WxAppId;
                this.addTagIds = [];
                this.members.selectedList = [];
                this.fetchLabelsByAccountId();
            },

            // 根据公众号获取标签列表
            fetchLabelsByAccountId() {
                if (!this.wechatId) return;
                WechatApiV1
                    .getTagList('', '', this.wechatId)
                    .then(res => {
                        this.labelList = res.body.data.tagList;
                        this.checkFansLabel();
                    })
                    .catch(() => {
                        this.labelList = [];
                    });
            },
            // 选择标签
            changeTagIds(ids) {
                this.addTagIds = ids;
                this.members.selectedList = this.addTagIds.map(tagId => {
                    return this.labelList.find(tag => tag.tagId === tagId);
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
                            con.wechatId = this.wechatId;
                            con.wechatAppid = this.wechatAppid;
                            con.wechatName = this.wechatName;
                            for (let i of this.members.selectedList) {
                                tag = tag + i.name + ' ';
                            }
                            con.summary = tag;
                            this.UPDATE_CONTROLLER(con);
                            this.SAVE_JOURNEY(false);
                        } else {
                            // 定时旅程
                            con.pushInfo.tags = this.members.selectedList;
                            con.pushInfo.wechatId = this.wechatId;
                            con.pushInfo.wechatAppid = this.wechatAppid;
                            con.pushInfo.wechatName = this.wechatName;
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
            checkFansLabel() {
                // 旅程版本检查
                this.CHECK_JOURNEY_NEW_VERSION()
                    .then(() => {
                        // 校验画布存储的标签是否生效
                        const allLabelIds = this.labelList.map(label => label.tagId);
                        let mixinsLabelIds = [...new Set(allLabelIds.concat(this.addTagIds))];
                        // 是否需要更新标签信息
                        let labelMessageChangeList = [];
                        this.members.selectedList.forEach(selected => {
                            let labelChange = this.labelList.filter(all => all.tagId === selected.tagId
                                && all.name !== selected.name);
                            labelMessageChangeList = labelMessageChangeList.concat(labelChange);
                        });
                        if (mixinsLabelIds.length !== allLabelIds.length) {
                            this.$toast(this.$t('controller.readonlyInvalid'), 'warn');
                        } else if (labelMessageChangeList.length > 0) {
                            // 更新画布中的标签信息（name）
                            this.members.selectedList = this.members.selectedList.map(selected => {
                                return this.labelList.find(all => all.tagId === selected.tagId);
                            });
                            let con = cloneDeep(this.controller);
                            if (this.journeyType === 2) {
                                con.processInfo.decision.settings = this.members.selectedList;
                            } else {
                                con.pushInfo.tags = this.members.selectedList;
                            }

                            let controller = cloneDeep(con);
                            this.UPDATE_CONTROLLER(controller);
                            this.SAVE_JOURNEY(false);
                        }
                    })
                    .catch(() => {
                        this.UPDATE_SAVE_TASK_STATUS(false);
                    });
            }
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

        .select-width {
            width: $form-input-width;
        }
    }

    .tag-controller-view {
        $gutter: ($input-field-height - 24px - 2px)/2;

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
