<template>
    <!-- 旅程状态：canceled\complete\un-started\progress -->
    <div class="journey-calendar" :class="{'full-width': metaHidden}">
        <div class="journey-tasks">
            <inline-loading v-if="tasksLoading"/>
            <template v-else>
                <!-- 视图切换、月/周切换、添加任务入口 -->
                <div class="tasks-panel">
                    <button type="button" class="pull-left action-icon icon icon-menu"
                            @click="toggleJourneyMeta"></button>
                    <div class="pull-left view-switch">
                        <span :class="{active: view === 'week'}"
                              @click="changeView('week')">{{'journey.weekView' | t}}</span>
                        <span :class="{active: view === 'month'}"
                              @click="changeView('month')">{{'journey.monthView' | t}}</span>
                    </div>
                    <button type="button" class="icon icon-arrow-left" @click="previousPeriod"></button>
                    <h5>{{year}}&nbsp;/&nbsp;{{month}}</h5>
                    <button type="button" class="icon icon-arrow-right" @click="nextPeriod"></button>
                </div>
                <!-- 周视图 -->
                <div class="week-view" v-show="view === 'week'">
                    <div class="week-head">
                        <span class="week-head-item"
                              :class="{past: !inFuture(weekDays[0]),isToday: isToday(weekDays[0])}"
                              :data-count="tasksOfTheWeek[0].length" :today="'common.today' | t">{{weekDays[0].slice(-2)}}&nbsp;{{'common.monday' | t}}</span>
                        <span class="week-head-item"
                              :class="{past: !inFuture(weekDays[1]),isToday: isToday(weekDays[1])}"
                              :data-count="tasksOfTheWeek[1].length" :today="'common.today' | t">{{weekDays[1].slice(-2)}}&nbsp;{{'common.tuesday' | t}}</span>
                        <span class="week-head-item"
                              :class="{past: !inFuture(weekDays[2]),isToday: isToday(weekDays[2])}"
                              :data-count="tasksOfTheWeek[2].length" :today="'common.today' | t">{{weekDays[2].slice(-2)}}&nbsp;{{'common.wednesday' | t}}</span>
                        <span class="week-head-item"
                              :class="{past: !inFuture(weekDays[3]),isToday: isToday(weekDays[3])}"
                              :data-count="tasksOfTheWeek[3].length" :today="'common.today' | t">{{weekDays[3].slice(-2)}}&nbsp;{{'common.thursday' | t}}</span>
                        <span class="week-head-item"
                              :class="{past: !inFuture(weekDays[4]),isToday: isToday(weekDays[4])}"
                              :data-count="tasksOfTheWeek[4].length" :today="'common.today' | t">{{weekDays[4].slice(-2)}}&nbsp;{{'common.friday' | t}}</span>
                        <span class="week-head-item"
                              :class="{past: !inFuture(weekDays[5]),isToday: isToday(weekDays[5])}"
                              :data-count="tasksOfTheWeek[5].length" :today="'common.today' | t">{{weekDays[5].slice(-2)}}&nbsp;{{'common.saturday' | t}}</span>
                        <span class="week-head-item"
                              :class="{past: !inFuture(weekDays[6]),isToday: isToday(weekDays[6])}"
                              :data-count="tasksOfTheWeek[6].length" :today="'common.today' | t">{{weekDays[6].slice(-2)}}&nbsp;{{'common.sunday' | t}}</span>
                    </div>
                    <div class="week-body">
                        <div class="week-body-item" v-for="(tasks, i) in tasksOfTheWeek"
                             :class="{readonly: (journey.journeyStatus !== 0 || !inFuture(weekDays[i])), past: !inFuture(weekDays[i]), isToday: isToday(weekDays[i])}">
                            <div class="journey-task" v-for="task in tasks"
                                 :class="[TASK_STATUS_MAP[task.sendStatus].className, {'un-started': journey.journeyStatus === 0}]"
                                 :data-sending-text="$t('journey.taskStatus.sending')"
                                 :data-status="journey.journeyStatus !== 0 ? $t(TASK_STATUS_MAP[task.sendStatus].txt) : ''">
                                <p class="time-tag icon icon-clock">{{task.time}}</p>
                                <div class="task-content">
                                    <div class="task-material-preview" v-if="task.subType!=2">
                                        <template
                                                v-if="task.taskType === 2 ? wechatMaterialMap[task.materialId] : materialMap[task.materialId]">
                                            <span v-if="task.taskType === 1">{{materialMap[task.materialId]}}</span>
                                            <template v-if="task.taskType === 3">
                                                <!--彩信 缩略图-->
                                                <div v-for="mmsmaterial in materialMap[task.materialId].mmsContent"
                                                     :key="mmsmaterial.id">
                                                    <span>{{mmsmaterial.mmsContent}}</span>
                                                    <img :src="mmsmaterial.pictureUrl">
                                                </div>
                                            </template>
                                            <img v-else
                                                 :src="task.taskType === 2 ? wechatMaterialMap[task.materialId] : materialMap[task.materialId]">
                                        </template>
                                        <p class="need-for-material" v-else>{{'QRCode.validMaterial' | t}}</p>
                                    </div>
                                    <div class="task-material-preview"
                                         v-else-if="task.taskType === 2&& task.subType === 2">
                                        <div v-if="task.taskType === 2 && task.subType === 2"
                                             v-html="wechatTemplateMap[task.materialId] ? wechatTemplateMap[task.materialId].sendContentArr.join('<br>') : ''"></div>
                                        <p class="need-for-material" v-else>{{'QRCode.validMaterial' | t}}</p>
                                    </div>
                                    <div class="task-meta">
                                        <p class="task-name" :title="task.taskName">
                                            <span :class="`icon icon-${TASK_TYPE_MAP[task.taskType]}`"></span>
                                            {{task.taskName}}
                                        </p>
                                        <p class="task-send-count" v-html="sendCountText(task)"></p>
                                        <div class="task-actions">
                                            <button class="icon icon-search"
                                                    v-title:bottom="$t('common.detail')"
                                                    @click="previewTask(task)"></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 月视图 -->
                <div class="month-view" v-show="view === 'month'">
                    <table>
                        <thead>
                        <tr>
                            <th>{{'common.sunday' | t}}</th>
                            <th>{{'common.monday' | t}}</th>
                            <th>{{'common.tuesday' | t}}</th>
                            <th>{{'common.wednesday' | t}}</th>
                            <th>{{'common.thursday' | t}}</th>
                            <th>{{'common.friday' | t}}</th>
                            <th>{{'common.saturday' | t}}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="week in monthWeeks">
                            <td v-for="day in week" :data-day="day.slice(-2)"
                                :class="{past: !inFuture(day), isToday: isToday(day)}"
                                :data-not-empty="!!dateTaskMap[day]"
                                :data-invalid="dateTaskMap[day] && dateTaskMap[day].length && dateTaskMap[day].some(t => t.sendStatus === 5)"
                                @click="taskPreviewingDay = day">
                                <div class="today-icon">{{'common.today' | t}}</div>
                                <template v-if="dateTaskMap[day]">
                                    <span v-if="dateTaskMap[day].length"
                                          :class="`task-icon icon icon-${TASK_TYPE_MAP[dateTaskMap[day][0].taskType]}`"></span>
                                    <span v-if="dateTaskMap[day].length > 1"
                                          :class="`task-icon icon icon-${TASK_TYPE_MAP[dateTaskMap[day][1].taskType]}`"></span>
                                    <span v-if="dateTaskMap[day].length > 2"
                                          class="total-figure">&plus;{{dateTaskMap[day].length - 2}}</span>
                                </template>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </template>
        </div>
        <!-- task list modal -->
        <transition name="slide-toggle">
            <div class="task-preview-list"
                 v-if="dateTaskMap[taskPreviewingDay] && dateTaskMap[taskPreviewingDay].length">
                <h5 :title="$t('journey.sendTask') + ' ' + dateTaskMap[taskPreviewingDay].length">
                    <span class="icon icon-close" @click="taskPreviewingDay = ''"></span>
                    {{taskPreviewingDayCNStr}}
                    {{'journey.sendTask' | t}}
                    (<span class="journey-text">&nbsp;{{dateTaskMap[taskPreviewingDay].length}}&nbsp;</span>)
                </h5>
                <div class="tasks">
                    <div class="journey-task" v-for="task in dateTaskMap[taskPreviewingDay]"
                         :class="[TASK_STATUS_MAP[task.sendStatus].className]"
                         :data-sending-text="$t('journey.taskStatus.sending')"
                         :data-status="journey.journeyStatus !== 0 ? $t(TASK_STATUS_MAP[task.sendStatus].txt) : ''">
                        <p class="time-tag icon icon-clock">{{task.time}}</p>
                        <div class="task-content">
                            <div class="task-material-preview" v-if="task.subType!=2">
                                <template
                                        v-if="task.taskType === 2 ? wechatMaterialMap[task.materialId] : materialMap[task.materialId]">
                                    <span v-if="task.taskType === 1">{{materialMap[task.materialId]}}</span>
                                    <img v-else
                                         :src="task.taskType === 2 ? wechatMaterialMap[task.materialId] : materialMap[task.materialId]">
                                </template>
                                <p class="need-for-material" v-else>{{'QRCode.validMaterial' | t}}</p>
                            </div>
                            <div class="task-material-preview" v-else-if="task.taskType === 2 && task.subType === 2">
                                <div v-if="task.taskType === 2 && task.subType === 2"
                                     v-html="wechatTemplateMap[task.materialId] ? wechatTemplateMap[task.materialId].sendContentArr.join('<br>') : ''"></div>
                                <p class="need-for-material" v-else>{{'QRCode.validMaterial' | t}}</p>
                            </div>
                            <div class="task-meta">
                                <p class="task-name" :title="task.taskName">
                                    <span :class="`icon icon-${TASK_TYPE_MAP[task.taskType]}`"></span>
                                    {{task.taskName}}
                                </p>
                                <p class="task-send-count" v-html="sendCountText(task)"></p>
                                <div class="task-actions">
                                    <button class="icon icon-search" v-title:bottom="$t('common.detail')"
                                            @click="previewTask(task)"></button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </transition>
        <!-- detail modal-->
        <detail-modal v-if="taskDetailOpen" v-bind="taskForModal" :journeyStatus="journey.journeyStatus"
                      @close="closeModal"></detail-modal>
    </div>
</template>
<script type="text/babel">

    import {
        addMonths,
        addWeeks,
        closestTo,
        eachDay,
        endOfMonth,
        endOfWeek,
        format,
        isAfter,
        isSameDay,
        min,
        startOfMonth,
        startOfWeek,
        subMonths,
        subWeeks,
    } from 'date-fns';
    import { JourneyApiV1, JourneyMaterialApiV1, WechatApiV1 } from '@/api';
    import {getDateInstance, stringify} from '../../../common/utils/dateUtils';
    import {sortByDateStr, sortTaskByTime, toCNDate} from './taskDateUtils';
    import DetailModal from './components/detail-modal.vue';
    import countFormat from '../../../common/vue-plugin/filters/countFormatFilter';
    import {logError} from '../../../monitor.js';
    import JourneyActions from '../journey-actions/journey-actions.vue';

    export default {
        data() {
            return {
                TASK_TYPE_MAP: ['mail', 'sms', 'wechat', 'mms'],   // 0：邮件，1：短信, 2：微信，3：彩信
                TASK_STATUS_MAP: [ // 0:等待发送 1:正在发送 2:发送完成 3:发送取消 4:任务异常 5:校验未通过
                    {className: 'waiting', txt: 'journey.taskStatus.waiting'},
                    {className: 'sending', txt: 'journey.taskStatus.sending'},
                    {className: 'complete', txt: 'journey.taskStatus.complete'},
                    {className: 'canceled', txt: 'journey.taskStatus.canceled'},
                    {className: 'error', txt: 'journey.taskStatus.error'},      // 旅程过程中的异常
                    {className: 'in-validate', txt: ''}        // 开始前校验未通过
                ],
                journey: {
                    id: '',
                    authorizerInfoId: '',           // 公众号id
                    headImg: '',                    // 公众号头像，并不是journey的一个字段，前端添加方便使用
                    principalName: '',              // 公众号名称，并不是journey的一个字段，前端添加方便使用
                    repeatCount: 2,                 // 重复次数
                    repeatEndDate: '',              // 重复截止日期
                    repeatFrequency: 0,             // 重复频率(天数)
                    incremental: 0,
                    journeyName: '',
                    journeyStatus: 0, // 状态： 0:未开始 1:进行中 2:已完成 3:已取消 4:全部状态 5:已暂停 6:测试中 7-8 测试结束 9 待审批 10 审批被拒
                    startDate: '',
                    endDate: '',
                    emailCount: 0,
                    messageCount: 0,
                    wechatCount: 0,
                    createBy: '',
                    createDate: '',
                    createName: '',
                    updateBy: 0,
                    updateDate: '',
                    updateName: ''
                },
                journeyLoading: true,
                // journey_starting: false,
                // 选中的重复类型
                repeatType: {
                    unit: 1,        // 重复天数
                    name: 'common.day'
                },
                repeatNumber: 1,    // 重复数，同重复单位相乘得出天数
                // 任务列表: {date: '2015-12-12', tasks: []}
                tasks: [],
                tasksLoading: true,
                view: 'week',               // week & month 周视图、月视图切换
                year: '',
                month: '',
                day: '',
                taskPreviewingDay: '',      // 点击日期，查看该日期内的任务列表

                materialMap: {},            // 邮件、短信、彩信素材map，key为素材ID
                wechatMaterialMap: {},      // 微信素材map，key为素材ID
                wechatTemplateMap: {},      // 新增微信素材map，key为素材ID
                // 表单、详情弹出层所用任务对象
                taskForModal: {
                    id: '',                 // 任务id
                    journeyId: '',          // 所属journey的ID
                    headImg: '',            // 公众号头像，并不是journey的一个字段，前端添加方便使用
                    principalName: '',      // 公众号名称，并不是journey的一个字段，前端添加方便使用
                    taskDate: '',           // 任务日期
                    taskType: -1,           // 任务类型
                    subType: 0,             // 任务子类型，0:群发, 1:触发
                },
                taskDetailOpen: false,    // 详情 modal
            };
        },
        computed: {
            // 定时旅程，旅程属性信息面板是否展示
            metaHidden() {
                return this.journey.journeyType !== 2
                    && this.$route.query.calendarView
                    && this.$route.query.metaHidden;
            },
            currentDate: {
                get() {
                    return new Date(this.year, this.month - 1, this.day);
                },
                set(date) {
                    this.year = date.getFullYear();
                    this.month = String(date.getMonth() + 1)
                        .padStart(2, '0');
                    this.day = date.getDate();
                }
            },
            // {'2017-09-20': Array<Task>}
            dateTaskMap() {
                const [defaultDate, defaultTime] = format(new Date(), 'YYYY-MM-DD HH:mm')
                        .split(' '),
                    dates = [],
                    map = {};

                let len = this.tasks.length;
                // if (!len) {
                //     logError(`[营销旅程] <journey /> dateTaskMap {len:${len}}自减后tasks[-1]不存在, :608`);
                // }
                while (len--) {
                    const task = Object.assign({}, this.tasks[len]);
                    // 时间
                    [task.date, task.time] = task.taskDate ? task.taskDate.split(' ') : [defaultDate, defaultTime];
                    // put it into the map
                    if (!map[task.date]) map[task.date] = [];
                    map[task.date].push(task);
                }
                // 视图设定到最早任务所在时间段
                dates.sort(sortByDateStr);
                // sort tasks by day and time
                for (let key in map) {
                    map[key].sort(sortTaskByTime);
                }
                return map;
            },
            // 日程表，第一层为天，里层为每天的任务
            weekDays() {
                const weekStart = startOfWeek(this.currentDate, {weekStartsOn: 1}),
                    weekEnd = endOfWeek(this.currentDate, {weekStartsOn: 1});
                return stringify(eachDay(weekStart, weekEnd));
            },
            tasksOfTheWeek() {
                return this.weekDays.map(day => this.dateTaskMap[day] || []);
            },
            monthWeeks() {
                const monthStart = startOfWeek(startOfMonth(this.currentDate)),
                    monthEnd = endOfWeek(endOfMonth(this.currentDate)),
                    days = stringify(eachDay(monthStart, monthEnd));
                let weekCount = Math.ceil(days.length / 7);
                const weeks = new Array(weekCount);
                while (weekCount--) {
                    weeks[weekCount] = days.splice(-7, 7);
                }
                return weeks;
            },
            taskPreviewingDayCNStr() {
                if (this.taskPreviewingDay) {
                    return toCNDate(this.taskPreviewingDay.slice(5));
                }
                return '';
            },
            // 旅程重复标记
            repeatInfo() {
                if (this.journey.repeatFrequency === 0) return this.$t('journey.single');
                return `${this.$t('journey.every')} ${this.repeatNumber} ${this.$t(this.repeatType.name)}，`
                    + (this.journey.repeatEndDate
                        ? `${this.journey.repeatEndDate} ${this.$t('journey.end')}`
                        : `${this.$t('journey.totalCount')} ${this.journey.repeatCount} ${this.$t('journey.times')}`)
                    + (this.journey.incremental ? `，${this.$t('journey.incremental')}` : '');
            }
        },
        mounted() {
            const journeyId = this.$route.params.id;
            // 获取 Journey 信息和任务列表
            Promise
                .all([
                    JourneyApiV1.getJourney(journeyId),
                    JourneyApiV1.getTasks(journeyId),
                    WechatApiV1.getWechatAccounts()
                ])
                .then((
                    [
                        {body: {data: {journey}}},
                        {body: {data: {taskList}}},
                        {body: {data: {authorizerInfoList: accounts}}}
                    ]
                ) => {
                    // 1.1 init journey
                    this.$set(this.$data, 'journey', journey);
                    // 1.2 init journeyForm too
                    if (this.journey.repeatFrequency) {
                        if (this.journey.repeatFrequency % 30 === 0) {
                            this.repeatType.unit = 30;
                            this.repeatType.name = 'common.month';
                            this.repeatNumber = this.journey.repeatFrequency / 30;
                        } else if (this.journey.repeatFrequency % 7 === 0) {
                            this.repeatType.unit = 7;
                            this.repeatType.name = 'common.week';
                            this.repeatNumber = this.journey.repeatFrequency / 7;
                        } else {
                            this.repeatType.unit = 1;
                            this.repeatType.name = 'common.day';
                            this.repeatNumber = this.journey.repeatFrequency;
                        }
                    }
                    // 2. init task
                    this.tasks = taskList;
                    // 2.1 初始化当前日历视图所在的year\month\day
                    // 使用优先级 进行中旅程的最近任务时间 > 其他旅程最早任务时间 > 今天
                    const now = new Date(),
                        dates = taskList.filter(task => task.taskDate)
                            .map(task => getDateInstance(task.taskDate));
                    let focusDate;
                    if (this.journey.journeyStatus === 1) { // 0:未开始 1:进行中 2:已结束 3:已取消
                        focusDate = closestTo(now, dates);
                    } else if (dates.length) {
                        focusDate = min(...dates);
                    } else {
                        focusDate = now;
                    }
                    this.currentDate = focusDate;
                    // 3. 微信公众号信息
                    // this.wechatAccounts = accounts;
                    const theChosenAccount = accounts.find(account =>
                        account.authorizerInfoId === this.journey.authorizerInfoId
                    );
                    if (theChosenAccount) {
                        this.journey.headImg = theChosenAccount.headImg;
                        this.journey.principalName = theChosenAccount.principalName;
                        this.taskForModal.headImg = theChosenAccount.headImg;
                        this.taskForModal.principalName = theChosenAccount.principalName;
                    }
                    // 4. end loading state
                    this.journeyLoading = false;
                    this.tasksLoading = false;
                    // 5. 获取任务用到的所有素材(用于预览),微信素材和其他素材分开处理
                    let emailAndSmsMaterialIds = [],
                        wechatMaterialIds = [],
                        wechatTemplateIds = [];
                    taskList.forEach(e => {
                        if (e.taskType === 2 && e.subType !== 2) {
                            wechatMaterialIds.push(e.materialId);
                        }
                        if (e.taskType === 2 && e.subType === 2) {
                            wechatTemplateIds.push(e.materialId);
                        }
                        if (e.taskType !== 2) {
                            emailAndSmsMaterialIds.push(e.materialId);
                        }
                    });

                    if (emailAndSmsMaterialIds.length) {
                        JourneyMaterialApiV1
                            .getMaterialsByIds(emailAndSmsMaterialIds, journey.journeyStatus === 0 ? 0 : 1)
                            .then(({body: {data: {materialMap}}}) => {
                                this.$set(this.$data, 'materialMap', Object.assign({}, this.materialMap, materialMap));
                            });
                    }
                    if (wechatMaterialIds.length) {
                        WechatApiV1
                            .getWechatMaterialsByIds(wechatMaterialIds)
                            .then(({body: {data: {thumbMediaUrlList}}}) => {
                                this.$set(this.$data, 'wechatMaterialMap', Object.assign({}, this.wechatMaterialMap, thumbMediaUrlList));
                            });
                    }
                    if (wechatTemplateIds.length) {
                        WechatApiV1
                            .getWxTemplateContent(wechatTemplateIds)
                            .then(({body: {data: {wxTemplateCopy}}}) => {
                                this.$set(this.$data, 'wechatTemplateMap', Object.assign({}, this.wechatTemplateMap, wxTemplateCopy));
                            });

                    }
                });
        },
        methods: {
            toggleJourneyMeta() {
                const metaHidden = this.$route.query.metaHidden ? undefined : 1;
                const newRoute = Object.assign(
                    {},
                    this.$route,
                    {query: Object.assign({}, this.$route.query, {metaHidden})}
                );
                this.$router.replace(newRoute);
            },
            /**
             * 任务列表
             */
            changeView(view) {
                this.taskPreviewingDay = '';
                this.view = view;
            },
            previousPeriod() { // 日期左箭头
                this.currentDate = this.view === 'month' ? subMonths(this.currentDate, 1) : subWeeks(this.currentDate, 1);
            },
            nextPeriod() { // 日期右箭头
                this.currentDate = this.view === 'month' ? addMonths(this.currentDate, 1) : addWeeks(this.currentDate, 1);
            },
            inFuture(dayStr) {
                const target = getDateInstance(dayStr),
                    now = new Date();
                return isSameDay(target, now) || isAfter(target, now);
            },
            isToday(dayStr) {
                const target = getDateInstance(dayStr),
                    now = new Date();
                return isSameDay(target, now);
            },
            sendCountText(task) {
                // 任务状态 0:等待发送 1:正在发送 2:发送完成 3:发送取消 4:任务异常 5:校验未通过
                // 任务类型 0：邮件，1：短信, 2：微信
                // 任务子类型，0:群发, 1:触发
                let count = countFormat(task.realityCount);
                switch (task.sendStatus) {
                    case 0:
                    case 5:
                        switch (task.taskType) {
                            case 0: // 邮件
                                return task.subType === 0 ? this.$t('journey.taskType.bulkTxt') : this.$t('journey.taskType.triggerTxt');
                            case 1: // 短信
                                return task.subType === 0 ? this.$t('journey.taskType.bulkTxt') : this.$t('journey.taskType.triggerTxt');
                            case 2: // 微信
                                if (task.subType === 0) {
                                    return this.$t('journey.baseOnContent');
                                } else if (task.subType === 1) {
                                    return this.$t('journey.baseOnCustomerService');
                                }
                                return this.$t('journey.baseOnTemplate');
                            case 3: // todo 彩信，目前和短信一致
                                return task.subType === 0 ? this.$t('journey.taskType.bulkTxt') : this.$t('journey.taskType.triggerTxt');
                            default:
                                logError(`[营销旅程] <journey /> sendCountText {taskType:${task.taskType}}不正确 :1054`);
                                return;
                        }
                    case 1:
                    case 3:
                        if (task.subType === 1) { // 触发
                            return task.taskType === 2 ? this.$t('journey.taskType.triggerWechatTxt') : this.$t('journey.taskType.triggerTxt');
                        }
                        // 群发
                        switch (task.taskType) {
                            case 0: // 邮件
                                return `${this.$t('journey.expectSend')} <span>${count}</span> ${this.$t('journey.emailUnit')}`;
                            case 1: // 短信
                                return `${this.$t('journey.expectSend')} <span>${count}</span> ${this.$t('journey.smsUnit')}`;
                            case 2: // 微信
                                return task.realityCount === 0 ? this.$t('journey.taskType.bulkWechatTxt') : `${this.$t('journey.expectWechatSend')} <span>${count}</span> ${this.$t('journey.wechatUnit')}`;
                            case 3: // 彩信，目前和短信一致
                                return `${this.$t('journey.expectSend')} <span>${count}</span> ${this.$t('journey.smsUnit')}`;
                            default:
                                logError(`[营销旅程] <journey /> sendCountText {taskType:${task.taskType}}不正确 :1070`);
                                return;
                        }
                    case 2:
                    case 4:
                        switch (task.taskType) {
                            case 0: // 邮件
                                return `${this.$t('journey.actuallySent')} <span>${count}</span> ${this.$t('journey.emailUnit')}`;
                            case 1: // 短信
                                return `${this.$t('journey.actuallySent')} <span>${count}</span> ${this.$t('journey.smsUnit')}`;
                            case 2: // 微信
                                return `${this.$t('journey.actuallyWechatSent')} <span>${count}</span> ${this.$t('journey.wechatUnit')}`;
                            case 3: // todo 彩信，目前和短信一致
                                return `${this.$t('journey.actuallySent')} <span>${count}</span> ${this.$t('journey.smsUnit')}`;
                            default:
                                logError(`[营销旅程] <journey /> sendCountText {taskType:${task.taskType}}不正确 :1084`);
                        }
                }
            },
            closeModal() {
                this.taskDetailOpen = false;
            },
            previewTask(task) {
                // 查看任务
                this.taskForModal.id = task.id;
                this.taskForModal.taskInstantiationId = task.taskInstantiationId;
                this.taskForModal.journeyId = this.journey.id;
                this.taskForModal.journeyName = this.journey.journeyName;
                this.taskForModal.taskType = task.taskType;
                this.taskForModal.subType = task.subType;
                this.taskForModal.tagId = task.tagId;
                this.taskDetailOpen = true;
            },
            // 报告
            checkReport(id) {
                this.$router.push({
                    name: 'report',
                    query: {
                        ids: [id],
                        type: 'summary'
                    }
                });
            }
        },
        components: {
            JourneyActions,
            DetailModal
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    @import "./journey-calendar";

</style>
