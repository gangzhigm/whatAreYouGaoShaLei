import Vue from 'vue';
import debounce from 'lodash/debounce';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import {
    ADD_ARROW,
    ADD_MILESTONE,
    ADD_NEW_CONTROLLER,
    CANCEL_CREATING_ARROW,
    CANCEL_NEW_CONTROLLER,
    CANCEL_SELECT_CONTROLLER,
    CHANGE_RATIO,
    CHECK_CONTROLLER_SUMMARY_DETAIL,
    CLOSE_GUIDE,
    CREATING_ARROW,
    DELETE_ARROW,
    DELETE_CONTROLLER,
    DRAGGING_NEW_CONTROLLER,
    EXPAND_CANVAS,
    MOVE_CONTROLLER,
    REMOVE_MILESTONE,
    SELECT_CONTROLLER,
    SET_ACTIVE_CONTROLLER,
    SET_CANVAS,
    SET_JOURNEY,
    CLEAN_JOURNEY,
    SET_LAST_UPDATE_DATE,
    SET_READONLY_CONTROLLER_IDS,
    SET_SAVE_NOTICE,
    SET_SUMMARY_CONTROLLER_ID,
    SET_VALIDATION_ERROR,
    UPDATE_CONTROLLER,
    UPDATE_JOURNEY,
    SET_START_METHOD,
    SET_TEST_SWARM_ID,
    UPDATE_CHECK,
    UPDATE_PANEL_AUTHORIZERINFO_ID,
    UPDATE_SAVE_JOURNEY_STATUS,
    UPDATE_SAVE_TASK_STATUS,
    PAGE_WILL_BE_DESTROY
} from '@/store/vuex/mutationTypes';
import {
    CHECK_CONTROLLER_SUMMARY,
    CHECK_JOURNEY_NEW_VERSION,
    CLEAR_JOURNEY_STORE,
    CLEAR_JOURNEY_CONTROLLER,
    COMPLETE_DRAGGING_NEW_CONTROLLER,
    REFRESH_TASKS,
    RESTORE_JOURNEY,
    SAVE_JOURNEY,
} from '@/store/vuex/actionTypes';
import {translate as t} from '@/locales';
import { JourneyApiV3 } from '@/api';
import {
    AB_TEST_CONTROLLER,
    ADD_CONTACT_TAG_CONTROLLER,
    ATTRIBUTE_CONDITION_CONTROLLER,
    CONTACT_CONTROLLER,
    DECISION_CONTROLLER,
    DELETE_CONTACT_TAG_CONTROLLER,
    ADD_FANS_TAG_CONTROLLER,
    DELETE_FANS_TAG_CONTROLLER,
    EMAIL_CONTROLLER,
    END_CONTROLLER,
    EVENT_CONDITION_CONTROLLER,
    MMS_CONTROLLER,
    SMS_CONTROLLER,
    START_CONTROLLER,
    TAG_CONDITION_CONTROLLER,
    WECHAT_CONTROLLER,
    EMAILTEMPLATE_CONTROLLER,
    LEADS_TRANSFER,
    WECOM_CONTROLLER
} from '../../../journey/draggable-form/canvas/controller/CONTROLLER_TYPES';

/**
 * 拖拽旅程 vuex 子状态树的名字
 * @type {string}
 */
export const DRAGGABLE_JOURNEY_STORE_NAME = 'canvasStore';


/**
 * 控件连线，起止控件id拼接字符串
 * @type {string}
 */
const CONTROLLER_ID_JOINER_IN_ARROW = '__to__';


/**
 * 保存旅程后 2s 提示
 * @type {null}
 */
let noticeTimer = null;


/**
 * 把控件的 output 记录合成一个新数组
 * @param controller
 * @return {Array|Buffer|*|T[]|string}
 */
function combineOutput(controller) {
    return [].concat(
        controller.output || [],
        controller.output1 || [],
        controller.output2 || [],
        controller.output3 || [],
    );
}


/**
 * 从连线起始的控制器上删除结束控制器的id
 * @param fromController
 * @param toControllerId
 */
function deleteToControllerId(fromController, toControllerId) {
    ['output', 'output1', 'output2', 'output3'].forEach(outputType => {
        if (fromController[outputType]) {
            const index = fromController[outputType].indexOf(toControllerId);
            if (index !== -1) {
                fromController[outputType].splice(index, 1);
            }
        }
    });
}

/**
 * 特殊id,用于隐藏'全部联系人'项
 * http://jira.qdum.com/browse/DMARTECH-4480
 * @returns {string}
 */
function getHiddenIdByEnv() {
    let env = process.env.NODE_ENV;
    let id = '';
    switch (env) {
        case 'beta':
        case 'development':
            id = 1833;
            break;
        case 'production':
            id = 3658;
            break;
        default:
            break;
    }
    return id;
}

export default {
    state: {
        lastUpdateDate: '',     // 服务端当前旅程的最近更新时间
        saveNotice: '',         // 旅程保存之后，展示 2s 提示
        journeyInformation: {
            id: '',             // 旅程id
            systemType: 1,      // 历史字段 1 代表 scrm 0 代表老版journey
            updateDate: '',     // 旅程更新时间
            journeyName: '',    // 旅程名称
            language: 0,        // 旅程语言 0 不限 1 中文 2 非中文
            approverId: '',     // 审批人
            isReview: 0,        // 是否是审批人
            // 定时旅程: 旅程时间格式
            timeType: 0,        // 0 绝对时间; 1 相对时间
            relativeDate: '',   // 相对时间的起始时间
            // 定时旅程：重复旅程：重复设置
            repeatFrequency: 0, // 重复间隔天数，0代表不重复
            repeatCount: 0,     // 重复按次数结束时，设定的重复次数
            relativeTime: 0,    // 重复按天数结束时，设定的天数
            repeatEndDate: '',  // 重复按日期结束时，设定的结束日期
            timeZone: '',       // 时区
            approvalStatus: null  // 旅程审批状态 0：未开启 1：待审批 2：申请被拒 3：审批成功
        },
        canvasInformation: {
            width: 1920,
            height: 1200,
            milestones: [],
            controllers: {},    // Map<controllerId, controller>
            showGuide: false,   // 实时旅程欢迎提示
        },
        // 旅程校验结果
        validationResult: {
            justPass: false,    // 刚刚通过校验
            errorId: null,
            errorMessage: '',
            timestamp: 0        // 最近一次
        },
        readonlyControllerIds: [],  // 定时旅程暂停中才会有值，记录已经开始的不能被修改的控件id
        ratio: 1,               // 画布缩放比例
        creatingArrow: {
            fromControllerId: '',
            outputType: 'output',
        },
        dragStage: {controller: null},
        summaryControllerId: '',
        summaryDetailControllerId: '',    // 正在查看用户记录(右侧滑出，展示参与该控件的所有用户)的控件ID
        selectedControllerId: '',   // 点击选中控件的ID
        activeControllerId: '',     // 编辑或在查看详情的控件ID
        startMethod: 'suspend', //2 && (test|start|suspend)
        swarmId: '', // 用户分群 id
        hiddenId: getHiddenIdByEnv(),     //"全部联系人"id
        isChecking: false,           // 是否正处于查看状态
        authorizerInfoId: '',        // 旅程画布左侧选择的微信公众号
        readyPageDestroy: false,
        journeySaving: false,        // 旅程是否正在保存、更新画布数据
        taskSaving: false            // 任务保存状态
    },
    mutations: {
        [SET_TEST_SWARM_ID](state, swarmId) {
            state.swarmId = swarmId;
        },
        [SET_START_METHOD](state, method) {
            state.startMethod = method;
        },
        [CLEAN_JOURNEY](state, type) {
            type.forEach(item => {
                state[item] = '';
            });
        },
        [SET_JOURNEY](state, journey) {
            state.journeyInformation = journey;
            state.lastUpdateDate = journey.updateDate || '';
        },
        [UPDATE_JOURNEY](state, partialJourney) {
            for (let key in partialJourney) {
                if (partialJourney.hasOwnProperty(key))
                    state.journeyInformation[key] = partialJourney[key];
            }
        },
        [SET_SAVE_NOTICE](state, flag) {
            state.saveNotice = flag;
        },
        [SET_LAST_UPDATE_DATE](state, newUpdateDate) {
            state.lastUpdateDate = newUpdateDate;
        },
        [SET_CANVAS](state, canvas) {
            state.canvasInformation = canvas;
        },
        [CHANGE_RATIO](state, ratio) {
            state.ratio = ratio;
        },
        [EXPAND_CANVAS](state, {width, height}) {
            if (width) state.canvasInformation.width = width;
            if (height) state.canvasInformation.height = height;
        },
        [CLOSE_GUIDE](state) {
            state.canvasInformation.showGuide = false;
        },
        [ADD_MILESTONE](state, controllerId) {
            const index = state.canvasInformation.milestones.findIndex(milestone => milestone === controllerId);
            if (index === -1) {
                state.canvasInformation.milestones.push(controllerId);
            }
        },
        [REMOVE_MILESTONE](state, controllerId) {
            const index = state.canvasInformation.milestones.findIndex(milestone => milestone === controllerId);
            if (index !== -1) {
                state.canvasInformation.milestones.splice(index, 1);
            }
        },
        [SET_VALIDATION_ERROR](state, {id, message, justPass}) {
            state.validationResult.justPass = justPass;
            state.validationResult.errorId = id;
            state.validationResult.errorMessage = message;
            state.validationResult.timestamp = (new Date).getTime();
        },
        [SET_READONLY_CONTROLLER_IDS](state, ids) {
            state.readonlyControllerIds = ids;
        },
        [UPDATE_CONTROLLER](state, controller) {
            Vue.set(state.canvasInformation.controllers, controller.id, controller);
        },
        /**
         * 删除一个控件
         * @param state
         * @param controllerId
         */
        [DELETE_CONTROLLER](state, controllerId) {
            const controller = state.canvasInformation.controllers[controllerId];
            // 1. 删除控件涉及到的连接线
            // 1.1 删除控件接收的连接线
            controller.input.forEach(fromControllerId => {
                const fromController = state.canvasInformation.controllers[fromControllerId];
                if (fromController) deleteToControllerId(fromController, controllerId);
            });
            // 1.2 删除控件发出的连接线
            ['output', 'output1', 'output2', 'output3'].forEach(outputType => {
                if (controller[outputType]) {
                    controller[outputType].forEach(toControllerId => {
                        const toController = state.canvasInformation.controllers[toControllerId];
                        if (toController) {
                            let index = toController.input.indexOf(controllerId);
                            toController.input.splice(index, 1);
                        }
                    });
                }
            });
            // 2. 删除控件
            Vue.delete(state.canvasInformation.controllers, `${controllerId}`);
        },
        /**
         * 查看一个控件的统计信息
         * @param state
         * @param controllerId
         */
        [SET_SUMMARY_CONTROLLER_ID](state, controllerId) {
            state.summaryControllerId = controllerId;
        },
        /**
         * 查看一个控件的详细统计信息
         * @param state
         * @param controllerId
         */
        [CHECK_CONTROLLER_SUMMARY_DETAIL](state, controllerId) {
            state.summaryDetailControllerId = controllerId;
        },
        /**
         * 移动控件
         * @param state
         * @param id
         * @param left 目标点 left 值
         * @param top 目标点 top 值
         */
        [MOVE_CONTROLLER](state, {id, left, top}) {
            state.canvasInformation.controllers[id].left = left;
            state.canvasInformation.controllers[id].top = top;
        },
        /**
         * 选中一个控件
         * @param state
         * @param id
         */
        [SELECT_CONTROLLER](state, id) {
            state.selectedControllerId = id;
        },
        /**
         * 取消选择控件
         * @param state
         */
        [CANCEL_SELECT_CONTROLLER](state) {
            state.selectedControllerId = '';
        },
        /**
         * 编辑或查看一个控件的详情
         * @param state
         * @param id
         */
        [SET_ACTIVE_CONTROLLER](state, id) {
            state.activeControllerId = id;
        },
        /**
         * 开始创建一条连接线
         * @param state
         * @param fromControllerId
         * @param outputType
         */
        [CREATING_ARROW](state, {fromControllerId, outputType}) {
            state.creatingArrow.fromControllerId = fromControllerId;
            state.creatingArrow.outputType = outputType;
        },
        /**
         * 中断创建连接线
         * @param state
         */
        [CANCEL_CREATING_ARROW](state) {
            state.creatingArrow.fromControllerId = '';
            state.creatingArrow.outputType = 'output';
        },
        /**
         * 添加一条连接线
         * @param state
         * @param from
         * @param outputType
         * @param to
         */
        [ADD_ARROW](state, {from, outputType, to}) {
            const controllers = state.canvasInformation.controllers;
            controllers[from][outputType].push(to);
            controllers[to].input.push(from);
            state.creatingArrow.fromControllerId = '';
            state.creatingArrow.outputType = 'output';
        },
        /**
         * 删除一条连接线
         * @param state
         * @param from
         * @param to
         * @param outputType
         */
        [DELETE_ARROW](state, {from, to, outputType}) {
            const fromController = state.canvasInformation.controllers[from];
            const toController = state.canvasInformation.controllers[to];
            // 删除连线的发出记录
            if (outputType) {
                if (fromController[outputType]) {
                    let index = fromController[outputType].indexOf(to);
                    fromController[outputType].splice(index, 1);
                } else {
                    console.error(`尝试删除连线异常：从${from}到${to}没有${outputType}记录`);
                }
            } else {
                deleteToControllerId(fromController, to);
            }
            // 删除连线的结束记录
            const index = toController.input.indexOf(from);
            toController.input.splice(index, 1);
        },
        [DRAGGING_NEW_CONTROLLER](state, controller) {
            state.dragStage.controller = controller;
        },
        [CANCEL_NEW_CONTROLLER](state) {
            state.dragStage.controller = null;
        },
        [ADD_NEW_CONTROLLER](state, controller) {
            Vue.set(state.canvasInformation.controllers, controller.id, controller);
            // 用完清空dragStage
            state.dragStage = {left: null, top: null, controller: null};
        },
        [UPDATE_CHECK](state, nowCheckStatus) {
            state.isChecking = nowCheckStatus;
        },
        [UPDATE_PANEL_AUTHORIZERINFO_ID](state, nowAccountId) {
            state.authorizerInfoId = nowAccountId;
        },
        [UPDATE_SAVE_JOURNEY_STATUS](state, saveJourneyStatus) {
            state.journeySaving = saveJourneyStatus;
        },
        [UPDATE_SAVE_TASK_STATUS](state, saveTaskStatus) {
            state.taskSaving = saveTaskStatus;
        },
        [PAGE_WILL_BE_DESTROY](state, destroy) {
            state.readyPageDestroy = destroy;
        }
    },
    actions: {
        async [RESTORE_JOURNEY]({commit, dispatch}, journey) {
            const journeyCanvas = JSON.parse(journey.canvasInformation);
            // if (journey.canvasInformation.getTaskList === undefined){
            //     journeyCanvas.getTaskList = {};
            // }
            delete journey.canvasInformation;

            // 定时旅程，且旅程有实例ID时，获取旅程内不可编辑的控件id列表
            let ids = [];
            if (journey.journeyType !== 2 && journey.journeyInstantiationId) {
                ids = await JourneyApiV3
                    .taskStatus(journey.id, journey.journeyInstantiationId)
                    .then(({body: {data: {ids}}}) => ids);
            }
            commit(SET_READONLY_CONTROLLER_IDS, ids);
            commit(SET_JOURNEY, journey);
            commit(SET_CANVAS, journeyCanvas);
            await dispatch(REFRESH_TASKS);
        },
        // 更新任务控件对应任务的信息
        async [REFRESH_TASKS]({state, commit, getters}) {
            commit(UPDATE_SAVE_TASK_STATUS, true);
            // 任务类型的控件
            const taskControllers = Object
                .values(state.canvasInformation.controllers)
                .filter(controller => controller.pushInfo && controller.pushInfo.taskId);

            // 定时旅程，且旅程有实例ID时，获取旅程内不可编辑的控件id列表
            let ids = [];
            if (state.journeyInformation.journeyType !== 2 && state.journeyInformation.journeyInstantiationId) {
                ids = await JourneyApiV3
                    .taskStatus(state.journeyInformation.id, state.journeyInformation.journeyInstantiationId)
                    .then(({body: {data: {ids}}}) => ids);
            }

            const tasks = await Promise.all(taskControllers.map(taskController => {
                // 可编辑的任务控件，其任务实例ID是无效的，不能传给后台
                const instanceIdValid = !getters.journeyWritable || ids.includes(taskController.id);
                return JourneyApiV3
                    .taskInfo(
                        taskController.pushInfo.taskId,
                        instanceIdValid ? taskController.taskInstantiationId : ''
                    )
                    .then(({body: {data: {task}}}) => task);
            }));
            tasks.forEach((task, index) => {
                const taskController = taskControllers[index];
                const pushInfo = Object.assign({}, taskController.pushInfo, task);
                const tasks = Object.assign({}, task);
                const newController = Object.assign({}, taskController, {name: task.taskName, pushInfo, tasks});
                commit(UPDATE_CONTROLLER, newController);
            });
            commit(UPDATE_SAVE_TASK_STATUS, false);
        },
        [CHECK_JOURNEY_NEW_VERSION]({state, commit}) {
            commit(UPDATE_SAVE_JOURNEY_STATUS, true);
            return new Promise((resolve, reject) => {
                JourneyApiV3
                    .getJourney(state.journeyInformation.id)
                    .then(({body: {data: {journey}}}) => {
                        commit(SET_LAST_UPDATE_DATE, journey.updateDate);
                        commit(UPDATE_SAVE_JOURNEY_STATUS, false);
                        if (state.journeyInformation.updateDate !== journey.updateDate) {
                            reject();
                        } else {
                            resolve();
                        }
                    })
                    .catch(() => {
                        reject();
                        commit(UPDATE_SAVE_JOURNEY_STATUS, false);
                    });
            });
        },
        async [SAVE_JOURNEY]({state, commit, dispatch}, checkNewVersion = true) {
            try {
                commit(UPDATE_SAVE_JOURNEY_STATUS, true);
                if (checkNewVersion) {
                    await dispatch(CHECK_JOURNEY_NEW_VERSION);
                }
                if (state.lastUpdateDate !== state.journeyInformation.updateDate) return;
                // journey 自身的属性字段都是及时更新到 vuex 的，可以直接使用
                // canvasInformation 则需要 JSON.stringify(state.canvasInformation)
                return JourneyApiV3
                    .updateJourney(Object.assign(
                        {},
                        state.journeyInformation,
                        {canvasInformation: JSON.stringify(state.canvasInformation)}
                    ))
                    .then(({body: {data: {journey}}}) => {
                        delete journey.canvasInformation;
                        commit(SET_JOURNEY, journey);
                        // 保存成功，展示 2s 提示
                        commit(SET_SAVE_NOTICE, true);
                        window.clearTimeout(noticeTimer);
                        noticeTimer = setTimeout(() => {
                            commit(SET_SAVE_NOTICE, false);
                        }, 2000);
                        commit(UPDATE_SAVE_JOURNEY_STATUS, false);
                    })
                    .catch(() => {
                        JourneyApiV3
                            .getJourney(state.journeyInformation.id)
                            .then(({body: {data: {journey}}}) => {
                                commit(SET_CANVAS, JSON.parse(journey.canvasInformation));
                                commit(SET_JOURNEY, journey);
                                commit(UPDATE_SAVE_JOURNEY_STATUS, false);
                            });
                    });
            } catch (err) {
                commit(UPDATE_SAVE_JOURNEY_STATUS, false);
                return Promise.reject(err);
            }
        },
        [COMPLETE_DRAGGING_NEW_CONTROLLER]({state, commit}, {id, name, left, top, taskId, authorizerInfoId}) {
            const newController = state.dragStage.controller;
            let journeyType = state.journeyInformation.journeyType; // 旅程类型 0单次 1周期 2实时
            let temp = {
                id,
                name: name || newController.name,
                type: newController.type,
                left,
                top,
                input: [],
                output: [],
                tasks: {},
                authorizerInfoId,
            };
            let _temp = null;
            switch (newController.type) {
                case CONTACT_CONTROLLER:
                    _temp = {
                        summary: '',
                        name: newController.name,
                        contactInfo: {type: newController.sub_type, id: newController.id}
                    };
                    break;
                case EMAIL_CONTROLLER:
                    _temp = {
                        taskStatus: null,
                        pushInfo: {type: 'email', taskId, materialId: newController.id}
                    };
                    break;
                case EMAILTEMPLATE_CONTROLLER:
                    _temp = {
                        taskStatus: null,
                        pushInfo: {type: 'emailTemplate', taskId, materialId: newController.id}
                    };
                    break;
                case SMS_CONTROLLER:
                    _temp = {
                        taskStatus: null,
                        pushInfo: {type: 'sms', taskId, materialId: newController.id},
                    };
                    break;
                case MMS_CONTROLLER:
                    _temp = {
                        taskStatus: null,
                        pushInfo: {type: 'mms', taskId, materialId: newController.id}
                    };
                    break;
                case WECHAT_CONTROLLER:
                    _temp = {
                        taskStatus: null,
                        pushInfo: {
                            type: 'wechat',
                            taskId,
                            materialId: newController.id,
                            wechatType: newController.wechatType,
                            wechatAppid: newController.wechatAppid, // 实时旅程发送
                            subType: newController.subType,
                            msgType: newController.msgType
                        }
                    };
                    break;
                case AB_TEST_CONTROLLER:
                    _temp = {
                        name: t('controller.randomSplit'),
                        summary: '',
                        output1: [],
                        output2: [],
                        output3: [],
                        processInfo: {type: 'ABTest', ABTest: {aRatio: .33, bRatio: .33, cRatio: .34}}
                    };
                    break;
                case DECISION_CONTROLLER:
                    _temp = {
                        name: t('controller.conditionSplit'),
                        summary: '',
                        output1: [],
                        output2: [],
                        processInfo: {
                            type: 'decision',
                            decision: {
                                isInteraction: 0,
                                settings: {
                                    act: 'and',
                                    status: 0,
                                    filter_json: [
                                        {
                                            type: 'contact',
                                            act: 'and',
                                            actChildren: 'and',
                                            status: 0,
                                            rules: []
                                        },
                                        {
                                            type: 'event',
                                            act: 'and',
                                            actChildren: 'and',
                                            status: 0,
                                            rules: []
                                        },
                                        {
                                            type: 'Journey_event',
                                            act: 'and',
                                            actChildren: 'and',
                                            status: 0,
                                            rules: []
                                        }
                                    ]
                                }
                            }
                        }
                    };
                    break;
                case START_CONTROLLER:
                    _temp = {
                        name: t('dragJourney.flowStart'),
                        summary: '',
                        processInfo: {
                            type: 'start',
                            swarmId: '',
                            tigger: 0,
                            decision: {isInteraction: 0, chooseIdList: {}, settings: {}}, // 开始组件settings数据结构优化array=>object
                            incremental: 0
                        }
                    };
                    break;
                case END_CONTROLLER:
                    _temp = {name: t('dragJourney.exit'), summary: '', processInfo: {type: 'end'}};
                    break;
                case ADD_CONTACT_TAG_CONTROLLER:
                    if (journeyType === 2) {
                        // 实时旅程
                        _temp = {
                            name: t('dragJourney.addContactTag'),
                            summary: '',
                            processInfo: {
                                type: 'addTag', // 由于数据库有历史数据，需要以控件类型做判断，故不修改 type 为 addContactTag
                                decision: {isInteraction: 0, chooseIdList: {groups: [], labels: []}, settings: []}
                            },
                        };
                    } else {
                        // 定时旅程
                        _temp = {
                            name: t('dragJourney.addContactTag'),
                            summary: '',
                            pushInfo: {
                                type: 'addTag', // 由于数据库有历史数据，需要以控件类型做判断，故不修改 type 为 addContactTag
                                taskId,
                                taskName: newController.taskName,
                                taskType: newController.taskType,
                                taskDate: '',
                                tags: [],
                            }
                        };
                    }
                    break;
                case DELETE_CONTACT_TAG_CONTROLLER:
                    if (journeyType === 2) {
                        // 实时旅程
                        _temp = {
                            name: t('dragJourney.removeContactTag'),
                            summary: '',
                            processInfo: {
                                type: 'delTag',// 由于数据库有历史数据，需要以控件类型做判断，故不修改 type 为 delContactTag
                                decision: {isInteraction: 0, chooseIdList: {groups: [], labels: []}, settings: []}
                            }
                        };
                    } else {
                        // 定时旅程
                        _temp = {
                            name: t('dragJourney.removeContactTag'),
                            summary: '',
                            pushInfo: {
                                type: 'delTag', // 由于数据库有历史数据，需要以控件类型做判断，故不修改 type 为 delContactTag
                                taskId,
                                taskName: newController.taskName,
                                taskType: newController.taskType,
                                taskDate: '',
                                tags: [],
                            }
                        };
                    }
                    break;
                case ADD_FANS_TAG_CONTROLLER:
                    if (journeyType === 2) {
                        // 实时旅程
                        _temp = {
                            name: t('dragJourney.addFansTag'),
                            summary: '',
                            wechatId: '', // 公众号id 用于选粉丝标签
                            wechatName: '', // 公众号名称
                            processInfo: {
                                type: 'addFansTag',
                                decision: {isInteraction: 0, chooseIdList: {groups: [], labels: []}, settings: []}
                            }
                        };
                    } else {
                        // 定时旅程
                        _temp = {
                            name: t('dragJourney.addFansTag'),
                            summary: '',
                            pushInfo: {
                                type: 'addFansTag',
                                taskId,
                                taskName: newController.taskName,
                                taskType: newController.taskType,
                                taskDate: '',
                                tags: [],
                            }
                        };
                    }

                    break;
                case DELETE_FANS_TAG_CONTROLLER:
                    if (journeyType === 2) {
                        // 实时旅程
                        _temp = {
                            name: t('dragJourney.removeFansTag'),
                            summary: '',
                            wechatId: '', // 公众号id 用于选粉丝标签
                            wechatName: '', // 公众号名称
                            processInfo: {
                                type: 'delFansTag',
                                decision: {isInteraction: 0, chooseIdList: {groups: [], labels: []}, settings: []}
                            }
                        };
                    } else {
                        // 定时旅程
                        _temp = {
                            name: t('dragJourney.removeFansTag'),
                            summary: '',
                            pushInfo: {
                                type: 'delFansTag',
                                taskId,
                                taskName: newController.taskName,
                                taskType: newController.taskType,
                                taskDate: '',
                                tags: [],
                            }
                        };
                    }

                    break;
                case EVENT_CONDITION_CONTROLLER:
                    _temp = {
                        name: t('dragJourney.eventCondition'),
                        summary: '',
                        output1: [],
                        output2: [],
                        processInfo: {
                            type: 'eventDecide',
                            specifyEvent: 0,
                            time: '0:00:10',
                            decision: {isInteraction: 0, chooseIdList: {groups: [], labels: []}, settings: {}} // 开始组件settings数据结构优化array=>object
                        }
                    };
                    break;
                case ATTRIBUTE_CONDITION_CONTROLLER:
                    _temp = {
                        name: t('dragJourney.attrCondition'),
                        summary: '',
                        output1: [],
                        output2: [],
                        processInfo: {
                            type: 'attributeDecide',
                            decision: {
                                isInteraction: 0,
                                settings: {
                                    act: 'and',
                                    time: '0:00:01',
                                    filter_json: [
                                        {type: 'contact', rules: []},
                                        {type: 'event', rules: []}
                                    ]
                                }
                            }
                        }
                    };
                    break;
                case TAG_CONDITION_CONTROLLER:
                    _temp = {
                        name: t('dragJourney.tagCondition'),
                        summary: '',
                        output1: [],
                        output2: [],
                        processInfo: {
                            type: 'tagDecide',
                            decision: {
                                isInteraction: 0,
                                chooseIdList: {groups: [], labels: []},
                                settings: [{relation: 'in', behavior: []}]
                            }
                        }
                    };
                    break;
                case LEADS_TRANSFER:
                    _temp = {
                        name: t('dragJourney.leadTag'),
                        pushInfo: {
                            type: 'clue',
                            taskId,
                            taskName: newController.taskName,
                            taskType: newController.taskType,
                            taskDate: ''
                        }
                    };
                    break;
                //企业微信
                case WECOM_CONTROLLER:
                    _temp = {
                        taskStatus: null,
                        pushInfo: {
                            type: WECOM_CONTROLLER,
                            taskId,
                            subType: newController.subType,
                            materialId: newController.id
                        }
                    };
                    break;
            }
            Object.assign(temp, _temp);
            commit(ADD_NEW_CONTROLLER, temp);
        },
        [CHECK_CONTROLLER_SUMMARY]: debounce(function ({commit, state}, controllerId) {
            // 优化组件销毁时，执行报错
            if (state.readyPageDestroy !== true) {
                commit(SET_SUMMARY_CONTROLLER_ID, controllerId);
            }
        }, 50, {trailing: true}),
        /**
         * 重置旅程子状态树
         * @param commit
         */
        [CLEAR_JOURNEY_STORE]({commit}) {
            commit(SET_CANVAS, {
                width: 1920,
                height: 1200,
                ratio: 1,
                milestones: [],
                controllers: {},
                // getTaskList: {},
            });
            commit(SET_JOURNEY, {});
            commit(SET_VALIDATION_ERROR, {id: '', message: ''});
            commit(SET_READONLY_CONTROLLER_IDS, []);
            commit(CHECK_CONTROLLER_SUMMARY_DETAIL, '');
            clearTimeout(noticeTimer);
        },
        /**
         * 重置旅程控件详情id
         * @param commit
         */
        [CLEAR_JOURNEY_CONTROLLER]({commit}) {
            // {activeControllerId: ''}
            commit(CLEAN_JOURNEY, ['activeControllerId', 'selectedControllerId']);
            commit(UPDATE_CHECK, false);
        }
    },
    getters: {
        /**
         * 旅程是否可编辑
         * 注意旅程可编辑不代表旅程内控件可编辑：定时旅程可能出现一部分可编辑，一部分不可编辑的情况
         * @param state
         * @return {boolean}
         */
        journeyWritable(state) {
            if (state.journeyInformation.journeyType === 2) {
                // 实时旅程 未开始 和 测试结束 和 审批被拒 时（其控件都是可编辑的）
                return state.journeyInformation.journeyStatus === 0
                    || state.journeyInformation.journeyStatus === 8
                    || state.journeyInformation.journeyStatus === 10;

            }
            // 定时旅程 未开始 和 暂停 和 审批被拒 时（控件ID不在 readonlyIds 中的控件可编辑）
            return state.journeyInformation.journeyStatus === 0
                || state.journeyInformation.journeyStatus === 5
                || state.journeyInformation.journeyStatus === 10;
        },
        /**
         * 旅程审批
         * 旅程isReview 0 不可审批  1 可审批
         */
        journeyApprove(state) {
            return state.journeyInformation.isReview === 1;
        },
        arrows(state) {
            const arrows = [];
            const allArrowSet = new Set();
            const matchedArrowSet = new Set();
            const controllersMap = state.canvasInformation.controllers;
            if (!controllersMap) return arrows;
            // 遍历所有控件的 input 列表
            for (const controllerId in controllersMap) {
                if (!controllersMap.hasOwnProperty(controllerId)) continue;
                const controller = controllersMap[controllerId];
                const toControllerId = controller.id;
                // 记录当前控件发出的连接线
                combineOutput(controller)
                    .forEach(to => {
                        allArrowSet.add(controller.id + CONTROLLER_ID_JOINER_IN_ARROW + to);
                    });
                // 遍历当前控件接收的连接线，提示不能找到起点的连线
                controller.input.forEach(fromControllerId => {
                    const fromController = controllersMap[fromControllerId] || {};
                    if (combineOutput(fromController)
                        .includes(toControllerId)) {
                        arrows.push({from: fromControllerId, to: toControllerId});
                        matchedArrowSet.add(fromControllerId + CONTROLLER_ID_JOINER_IN_ARROW + toControllerId);
                    } else {
                        // 未恢复成功的连线
                        console.error(
                            `连接线恢复异常：从 ${fromController.name}[${fromControllerId}]到 ${controller.name}[${toControllerId}]没有output的记录`
                        );
                    }
                });
            }
            [...allArrowSet]
                .filter(arrowStr => !matchedArrowSet.has(arrowStr))
                .forEach(arrow => {
                    const [from, to] = arrow.split(CONTROLLER_ID_JOINER_IN_ARROW);
                    const fromController = controllersMap[from] || {};
                    const toController = controllersMap[to] || {};
                    // 不能找到终点的连线
                    console.error(`连接线恢复异常：从 ${fromController.name}[${from}]到 ${toController.name}[${to}]没有input记录`);
                });

            return uniqWith(arrows, isEqual);
        },
        /**
         * @description 旅程pending状态，用于保证旅程同步操作
         */
        onPending(state) {
            return state.journeySaving || state.taskSaving;
        }
    }
};

let idOffset = 1;

/**
 * 生成id
 * @return {number}
 */
export function uniqId() {
    let seconds = parseInt(((new Date).getTime() - (new Date(2018, 1, 1)).getTime()) / 100);
    return Number(String(seconds)
        .slice(0, 9)) + idOffset++;
}
