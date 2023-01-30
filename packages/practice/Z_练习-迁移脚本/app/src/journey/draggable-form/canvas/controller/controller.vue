<template>
    <div class="controller-wrapper"
         :class="{configurable: writable}"
         :draggable="draggable"
         @dragstart.stop="ondragstart($event)"
         @drag.stop="ondrag($event)"
         @dragend.stop="ondragend"
         @mouseenter="showSummary"
         @mousewheel="closeSummary"
         @mouseleave="closeSummary"
         :style="positionStyle">
        <div class="controller"
             :class="{vertical: isVerticalController}"
             @click.stop="selectController"
             v-blur="unSelectController">
            <component class="controller-icon"
                       :is="controller.type"
                       :controller="controller"/>
            <controller-actions v-if="writable && selectedControllerId === controller.id && !isChecking"/>
            <!-- 连接线入口 -->
            <div v-if="inputAnchorAvailable"
                 class="input-anchor"
                 :class="{'vertical-controller': isVerticalController, 'hover-in': inputHoverIn}"
                 @mouseup="completeDrawingArrow"
                 @mouseover.stop="safariInputHover(true)" @mouseout="safariInputHover(false)"></div>
            <!-- A/B测试控件连接线出口 -->
            <template v-if="isABTestController">
                <li v-if="outputAnchorAvailable.output1" :style="{top: controller.processInfo.ABTest.bRatio >= 0 ? '3px' : '13px'}"
                    @mousedown="startDrawingArrow('output1')"
                    class="a-output-anchor"></li>
                <li v-if="outputAnchorAvailable.output2" :style="{top: controller.processInfo.ABTest.bRatio >= 0 ? '25px' : '37px'}"
                    @mousedown="startDrawingArrow('output2')"
                    class="b-output-anchor"></li>
                <li v-if="outputAnchorAvailable.output3 && controller.processInfo.ABTest.bRatio >= 0"
                    @mousedown="startDrawingArrow('output3')"
                    class="c-output-anchor"></li>
            </template>
            <!-- 判断类控件连接线出口 -->
            <template v-else-if="isVerticalController">
                <div v-if="outputAnchorAvailable.output1"
                     @mousedown="startDrawingArrow('output1')"
                     class="yes-output-anchor">Y
                </div>
                <div v-if="outputAnchorAvailable.output2"
                     @mousedown="startDrawingArrow('output2')"
                     class="no-output-anchor">N
                </div>
            </template>
            <!-- 单出口控件的连接线出口 -->
            <div v-else-if="notEndController && outputAnchorAvailable.output"
                 class="output-anchor"
                 @mousedown="startDrawingArrow('output')"></div>
        </div>
        <div class="controller-information">
            <p class="light-content-text">{{controllerName}}</p>
            <!--添加粉丝标签和移除粉丝标签不显示summary
            http://jira.qdum.com/browse/DMARTECH-7383-->
            <p class="disabled-text"
               v-if="controller.type !== 'addFansTagController' && controller.type !== 'delFansTagController'"
               v-title="controller.summary">{{controller.summary}}</p>
        </div>
        <div v-if="controller.id === validationResult.errorId" class="notice-icon error">
            <i class="icon icon-cuowu1" style="right: -0.5px;position:absolute;top:0;"></i>
        </div>
        <div v-if="controller.pushInfo && controller.pushInfo.sendStatus === 2" class="notice-icon complete">
            <i class="icon icon-wancheng"></i>
        </div>
        <div v-if="controller.pushInfo && controller.pushInfo.taskType === 6  && this.sendStatus === 2"
             class="notice-icon complete">
            <i class="icon icon-wancheng"></i>
        </div>
        <div v-if="controller.pushInfo && controller.pushInfo.sendStatus === 3" class="notice-icon cancel">
            <i class="icon icon-quxiao"></i>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import browserDifferentiate from '../../../../common/utils/browserDifferentiate';
    import { NikeJourneyV3, WechatApiV1 } from '@/api';
    import cloneDeep from 'lodash/cloneDeep';

    import StartController from './sub-controllers/start-controller/start-controller.vue';
    import EndController from './sub-controllers/end-controller/end-controller.vue';
    import WechatController from './sub-controllers/wechat-controller/wechat-controller.vue';
    import ABTestController from './sub-controllers/ABTest-controller/ABTest-controller.vue';
    import ContactController from './sub-controllers/contact-controller/contact-controller.vue';
    import DecisionController from './sub-controllers/decision-controller/decision-controller.vue';
    import EmailController from './sub-controllers/email-controller/email-controller.vue';
    import EmailControllerTemplage from './sub-controllers/email-controller-template/email-controller.vue';
    import SMSController from './sub-controllers/sms-controller/sms-controller.vue';
    import MMSController from './sub-controllers/mms-controller/mms-controller.vue';
    import AddContactTagController from './sub-controllers/tag-controllers/add-contact-tag-controller.vue';
    import DeleteContactTagController from './sub-controllers/tag-controllers/del-contact-tag-controller.vue';
    import AddFansTagController from './sub-controllers/tag-controllers/add-fans-tag-controller.vue';
    import DeleteFansTagController from './sub-controllers/tag-controllers/del-fans-tag-controller.vue';
    import EventConditionController from './sub-controllers/event-condition-controller/event-condition-controller.vue';
    import AttributeConditionController
        from './sub-controllers/attribute-condition-controller/attribute-condition-controller.vue';
    import TagConditionController from './sub-controllers/tag-condition-controller/tag-condition-controller.vue';
    import ControllerActions from './controller-actions.vue';
    import NewABTestController from './sub-controllers/new-ABTest-controller/new-AB-test-controller.vue';
    import LeadsTransferController from './sub-controllers/leads-transfer/leads-transfer-controller.vue';
    import WecomController from './sub-controllers/wecom-controller/wecom-controller.vue';
    import {
        ADD_ARROW,
        CANCEL_CREATING_ARROW,
        CANCEL_NEW_CONTROLLER,
        CANCEL_SELECT_CONTROLLER,
        CREATING_ARROW,
        MOVE_CONTROLLER,
        SELECT_CONTROLLER,
        SET_ACTIVE_CONTROLLER,
        UPDATE_CONTROLLER
    } from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {CHECK_CONTROLLER_SUMMARY, SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import {
        AB_TEST_CONTROLLER,
        ATTRIBUTE_CONDITION_CONTROLLER,
        CONTACT_CONTROLLER,
        DECISION_CONTROLLER,
        END_CONTROLLER,
        EVENT_CONDITION_CONTROLLER,
        START_CONTROLLER,
        TAG_CONDITION_CONTROLLER,
        EMAILTEMPLATE_CONTROLLER,
        NEW_AB_TEST_CONTROLLER,
        ADD_FANS_TAG_CONTROLLER,
        DELETE_FANS_TAG_CONTROLLER,
        ADD_CONTACT_TAG_CONTROLLER,
        DELETE_CONTACT_TAG_CONTROLLER
    } from './CONTROLLER_TYPES';
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';

    export const CONTROLLER_DEFAULT_WIDTH = 62;
    export const CONTROLLER_DEFAULT_HEIGHT = 110;
    export const ANCHOR_SIZE = 12;
    export const LARGE_ANCHOR_SIZE = 15;

    export default {
        props: {
            controller: Object,
            memberTag: {    //会员标签信息数据，实时更新会员标签信息用
                type: Array,
                default: []
            },
            swarmList: {    //联系人分群列表数据，实时更新分群名称用
                type: Array,
                default: []
            }
        },
        data() {
            return {
                start: {
                    left: 0,
                    top: 0,
                    scrollLeft: 0,
                    scrollTop: 0
                },
                end: {
                    left: 0,
                    top: 0
                },
                inputHoverIn: false, // safari input hover style 兼容
                sendStatus: 0,
                wechatList: [],//公司已绑定的公众号
                filterTagArr: [],//粉丝标签列表
                wechatId: '',//公众号id
                controlTypeList: [ADD_FANS_TAG_CONTROLLER, DELETE_FANS_TAG_CONTROLLER,
                    START_CONTROLLER,EVENT_CONDITION_CONTROLLER]
            };
        },
        mounted () {
            if (this.controlTypeList.includes(this.controller.type) && this.writable) {
                this.isBindWeChat();
            }
            if (this.controller.tasks && this.controller.tasks.taskDetailsDTOS
                && this.controller.tasks.taskDetailsDTOS.length > 0) {
                let activeControllerId = this.controller.tasks.controllerId;
                let stateID = this.stateID;
                NikeJourneyV3
                    .getBatchTask(
                        stateID,
                        activeControllerId,
                        false
                    )
                    .then(({body: {data: {task}}}) => {
                        this.sendStatus = task.sendStatus;
                    });
            }
            if (this.memberTag.length > 0) {
                this.updateMemberTag();
            }
            if (this.swarmList.length > 0 &&
                this.controller.type === CONTACT_CONTROLLER &&
                this.controller.contactInfo.type === 'contact') {
                this.updateContactSummary();
            }
        },
        watch: {
            memberTag(val) {
                if (val.length > 0) {
                    this.updateMemberTag();
                }
            },
            swarmList(val) {
                if (val.length > 0 && this.controller.type === CONTACT_CONTROLLER) {
                    this.$nextTick(() => {
                        this.updateContactSummary();
                    });
                }
            }
        },
        computed: {
            ...mapGetters(['onPending']),
            ...mapState({
                stateID: state => state.canvasStore.journeyInformation.id,
                storeName: state => state[DRAGGABLE_JOURNEY_STORE_NAME],
            }),
            journeyInformation() {
                return this.storeName.journeyInformation;
            },
            ratio() {
                return this.storeName.ratio;
            },
            canvasInformation() {
                return this.storeName.canvasInformation;
            },
            validationResult() {
                return this.storeName.validationResult;
            },
            readonlyIds() {
                return this.storeName.readonlyControllerIds;
            },
            selectedControllerId() {
                return this.storeName.selectedControllerId;
            },
            isChecking() {
                return this.storeName.isChecking;
            },
            creatingArrow() {
                return this.storeName.creatingArrow;
            },
            taskSaving() {
                return this.storeName.taskSaving;
            },
            journeySaving() {
                return this.storeName.journeySaving;
            },
            fromControllerId() {
                return !!this.creatingArrow.fromControllerId;
            },
            controllerName() {
                switch (this.controller.type) {
                    case START_CONTROLLER:
                        return this.$t('controller.flow_start');
                    case EVENT_CONDITION_CONTROLLER:
                        return this.$t('dragJourney.eventCondition');
                    case ATTRIBUTE_CONDITION_CONTROLLER:
                        return this.$t('dragJourney.attrCondition');
                    case TAG_CONDITION_CONTROLLER:
                        return this.$t('dragJourney.tagCondition');
                    case END_CONTROLLER:
                        return this.$t('dragJourney.exit');
                    case AB_TEST_CONTROLLER:
                        return this.$t('controller.randomSplit');
                    case NEW_AB_TEST_CONTROLLER:
                        return this.$t('controller.ABTest');
                    default:
                        return this.controller.name;
                }
            },
            isABTestController() {
                return this.controller.type === AB_TEST_CONTROLLER;
            },
            notEndController() {
                return this.controller.type !== END_CONTROLLER && this.controller.type !== EMAILTEMPLATE_CONTROLLER;
            },
            /**
             * 控件连接线入口是否可用：
             * 控件是可编辑状态、控件不是旅程起始控件（"开始控件"、"受众来源"）、非查看状态
             * @type Boolean
             */
            inputAnchorAvailable() {
                return this.writable
                    && this.controller.type !== START_CONTROLLER
                    && this.controller.type !== CONTACT_CONTROLLER
                    && !this.isChecking;
            },
            /**
             * 控件连接线出口是否可用:
             * 控件可编辑，或者 定时旅程 && 暂停状态 && 有尚未使用的出口
             * @type Object
             */
            outputAnchorAvailable() {
                const flags = {
                    output: false,
                    output1: false,
                    output2: false,
                    output3: false
                };
                if (this.writable && !this.isChecking) {
                    flags.output = true;
                    flags.output1 = true;
                    flags.output2 = true;
                    flags.output3 = true;
                } else if (
                    this.journeyInformation.journeyType !== 2
                    && this.journeyInformation.journeyStatus === 5) {
                    flags.output = !(
                        this.controller.output
                        && this.controller.output.some(ctrlId => this.readonlyIds.includes(ctrlId))
                    );
                    flags.output1 = !(
                        this.controller.output1
                        && this.controller.output1.some(ctrlId => this.readonlyIds.includes(ctrlId))
                    );
                    flags.output2 = !(
                        this.controller.output2
                        && this.controller.output2.some(ctrlId => this.readonlyIds.includes(ctrlId))
                    );
                    flags.output3 = !(
                        this.controller.output3
                        && this.controller.output3.some(ctrlId => this.readonlyIds.includes(ctrlId))
                    );
                }
                return flags;
            },
            draggable() {
                return this.controller.type !== START_CONTROLLER && !this.fromControllerId;
            },
            positionStyle() {
                // controller 是绝对定位的，controller.left 是 left 值 controller.top 是 top 值
                return {
                    left: this.controller.left * this.ratio + 'px',
                    top: this.controller.top * this.ratio + 'px',
                    transform: 'scale(' + this.ratio + ')'
                };
            },
            writable() {
                if (this.journeyInformation.journeyType === 2) {
                    // 实时旅程 未开始 和 测试结束 和 审批被拒 时，其控件都是可编辑的
                    return this.journeyInformation.journeyStatus === 0
                        || this.journeyInformation.journeyStatus === 8
                        || this.journeyInformation.journeyStatus === 10;

                }
                // 定时旅程 未开始 和 暂停 和 审批被拒 时，且控件ID不在 readonlyIds 中
                return (this.journeyInformation.journeyStatus === 0
                    || this.journeyInformation.journeyStatus === 5
                    || this.journeyInformation.journeyStatus === 10)
                    && !this.readonlyIds.includes(this.controller.id);
            },
            isVerticalController() {
                return [
                    DECISION_CONTROLLER,
                    EVENT_CONDITION_CONTROLLER,
                    ATTRIBUTE_CONDITION_CONTROLLER,
                    TAG_CONDITION_CONTROLLER
                ].includes(this.controller.type);
            }
        },
        methods: {
            ...mapActions([
                CHECK_CONTROLLER_SUMMARY,
                SAVE_JOURNEY
            ]),
            ...mapMutations([
                CANCEL_NEW_CONTROLLER,
                MOVE_CONTROLLER,
                CREATING_ARROW,
                ADD_ARROW,
                SET_ACTIVE_CONTROLLER,
                CANCEL_CREATING_ARROW,
                SELECT_CONTROLLER,
                CANCEL_SELECT_CONTROLLER,
                UPDATE_CONTROLLER
            ]),
            // 显示 控件统计信息半透明浮层
            showSummary() {
                if (this.writable || this.isChecking) return;
                // 定时旅程：条件分支控件没有浮层信息
                if (this.controller.type === DECISION_CONTROLLER) return;

                this.CHECK_CONTROLLER_SUMMARY(this.controller.id);
            },
            // 隐藏 控件统计信息半透明浮层
            closeSummary() {
                if (this.writable || this.isChecking) return;
                this.CHECK_CONTROLLER_SUMMARY('');
            },
            // 以下是关于控制器拖拽的方法
            rangeDetection(left, top) {
                // forbiddenRange: 小于该范围无法drop
                let forbiddenRange = {left: 360, top: 200};
                // extendRange: 拖动到该范围(比例)自动延展画布
                let extendRangeRatio = {left: .95, top: .95};
                // 返回 1：可以drop， 0：超出画布范围不可drop， -1：增加画布宽度， -2：增加画布高度
                if (left < forbiddenRange.left || top < forbiddenRange.top) return 0;
                if (left > window.innerWidth * extendRangeRatio.left) return -1;
                if (top > window.innerHeight * extendRangeRatio.top) return -2;
                if (
                    left > forbiddenRange.left && left < window.innerWidth * extendRangeRatio.left
                    && top > forbiddenRange.top && top < window.innerHeight * extendRangeRatio.top
                ) return 1;
            },
            ondragstart(e) {
                if (this.draggable) {
                    e.dataTransfer.setData('text/plain', this.controller.id);
                    this.CANCEL_NEW_CONTROLLER();
                    if (browserDifferentiate().browser === 'Firefox') {
                        this.start.left = e.screenX;
                        this.start.top = e.screenY;
                    } else {
                        this.start.left = e.pageX;
                        this.start.top = e.pageY;
                    }
                    this.start.scrollLeft = this.$parent.$el.scrollLeft;
                    this.start.scrollTop = this.$parent.$el.scrollTop;
                }
            },
            ondrag(e) {
                if (this.draggable) {
                    this.end.left = e.pageX;
                    this.end.top = e.pageY;
                    // 拖拽至边界时，自动扩展画布
                    // this code won't work on firefox. Firefox's drag event's position fields are always 0
                    const rangeDetectionResult = this.rangeDetection(this.end.left, this.end.top);
                    if (this.end.left - this.start.left >= 10 && rangeDetectionResult === -1) {
                        this.$emit('expand', 'width');
                    }
                    if (this.end.top - this.start.top >= 10 && rangeDetectionResult === -2) {
                        this.$emit('expand', 'height');
                    }
                }
            },
            ondragend(e) {
                if (this.draggable) {
                    // 火狐浏览器bug：drag事件上的位置相关字段一直都是0，所以在这里获取
                    // bug 链接：https://bugzilla.mozilla.org/show_bug.cgi?id=505521
                    if (browserDifferentiate().browser === 'Firefox') {
                        this.end.left = e.screenX;
                        this.end.top = e.screenY;
                    }
                    let rangeNum = this.rangeDetection(this.end.left, this.end.top);
                    if (rangeNum === 0) return;
                    let leftMoved = this.end.left - this.start.left + this.$parent.$el.scrollLeft - this.start.scrollLeft;
                    let topMoved = this.end.top - this.start.top + this.$parent.$el.scrollTop - this.start.scrollTop;
                    this.MOVE_CONTROLLER({
                        id: this.controller.id,
                        left: this.controller.left + leftMoved,
                        top: this.controller.top + topMoved
                    });
                }
            },
            startDrawingArrow(outputType) {
                // 实时旅程只允许输出一条线
                if (
                    this.journeyInformation.journeyType === 2
                    && this.controller[outputType].length
                    && this.controller[outputType][0]
                ) {
                    return;
                }
                this.CREATING_ARROW({
                    fromControllerId: this.controller.id,
                    outputType
                });
                this.switchDrag(false);
                document.addEventListener('mouseup', this.cancelDrawingArrow, false);
            },
            completeDrawingArrow() {
                const {fromControllerId, outputType} = this.creatingArrow;
                const toControllerId = this.controller.id;
                const controllersMap = this.canvasInformation.controllers;
                const fromController = controllersMap[fromControllerId];
          
                let otherOutputType = '';
                let otherOutputTypeTwo = '';
                if (fromController.type === AB_TEST_CONTROLLER) {
                    switch (outputType) {
                        case 'output1':
                            otherOutputType = 'output2';
                            otherOutputTypeTwo = 'output3';
                            break;
                        case 'output2':
                            otherOutputType = 'output1';
                            otherOutputTypeTwo = 'output3';
                            break;
                        case 'output3':
                            otherOutputType = 'output1';
                            otherOutputTypeTwo = 'output2';
                            break;
                    }
                } else {
                    otherOutputType = outputType !== 'output' ? 'output1output2'.replace(outputType, '') : '';
                }

                function loopCheck(ids) {
                    const topIds = [];
                    const currentIds = new Set();
                    ids.forEach(id => {
                        currentIds.add(controllersMap[id].id);
                        topIds.push(...(controllersMap[id].input));
                    });
                    if (currentIds.has(toControllerId)) {
                        return true;
                    }
                    if (topIds.length === 0) {
                        return false;
                    }
                    return loopCheck(topIds);
                }

                if (fromController.type === AB_TEST_CONTROLLER && this.controller.type === NEW_AB_TEST_CONTROLLER) {
                    this.$toast(this.$t('dragJourney.ABTestNotNewABTest'), 'warn');
                }                

                if (
                    // 不在创建连线的状态
                    !fromControllerId
                    // 起点终点在一个组件上
                    || fromControllerId === toControllerId
                    // 会构成成循环
                    || loopCheck(fromController.input)
                    // 实时旅程的控件只能有一条进入线
                    || (this.journeyInformation.journeyType === 2 && this.controller.input.length >= 1)
                    // 双出口控件的另一个出口已经连接到目标控件
                    || (otherOutputType && fromController[otherOutputType] &&
                        fromController[otherOutputType].includes(toControllerId))
                    || (otherOutputTypeTwo && fromController[otherOutputTypeTwo] &&
                        fromController[otherOutputTypeTwo].includes(toControllerId))
                    // 随机分支不能连接新AB控件
                    || (fromController.type === AB_TEST_CONTROLLER && this.controller.type === NEW_AB_TEST_CONTROLLER)
                    // AB控件不能连接随机分支
                    || (fromController.type === NEW_AB_TEST_CONTROLLER && this.controller.type === AB_TEST_CONTROLLER)
                    // AB控件不能自连
                    || (fromController.type === NEW_AB_TEST_CONTROLLER && this.controller.type === NEW_AB_TEST_CONTROLLER)
                ) {
                    return;
                }
                // 符合条件，创建连接线
                this.ADD_ARROW({
                    from: fromControllerId,
                    outputType,
                    to: toControllerId
                });
                this.SAVE_JOURNEY();
                this.switchDrag(true);
            },
            cancelDrawingArrow(e) {
                e.stopPropagation();
                this.CANCEL_CREATING_ARROW();
                document.removeEventListener('mouseup', this.cancelDrawingArrow, false);
            },
            // 以下个是关于控制器及其编辑面板hover和点击选择的方法
            selectController() {
                if (this.onPending) {
                    this.$toast(this.$t('dragJourney.delayOperate'),'warn');
                    return;
                }
                if (!this.writable || this.isChecking) {
                    this.SET_ACTIVE_CONTROLLER(this.controller.id);
                    this.switchDrag(false);
                }
                this.SELECT_CONTROLLER(this.controller.id);
            },
            unSelectController() {
                // 数据正在请求接口时， 不要清空当前选中态
                if (!this.onPending &&
                    this.controller.id === this.selectedControllerId) {
                    this.CANCEL_SELECT_CONTROLLER();
                }
            },
            safariInputHover(flag) {
                if (
                    browserDifferentiate().browser === 'Safari'
                    || (browserDifferentiate().browser === 'Chrome'
                    && Number(browserDifferentiate().version) <= 55.0)
                ) {
                    this.inputHoverIn = flag;
                }
            },
            switchDrag(flag) {
                // fixme related to Safari, 需要确认
                if (browserDifferentiate().browser === 'safari') {
                    let canvasWrapper = document.querySelector('.journey-canvas');
                    canvasWrapper.style.overflow = flag ? 'auto' : 'hidden';
                }
            },
            //获取公司已绑定的公众号
            isBindWeChat() {
                WechatApiV1
                    .isBindWeChat()
                    .then((res) => {
                        this.wechatList = res.body.data.wechatList;
                        if (this.wechatList && this.wechatList.length > 0) {//有绑定的公众号
                            //开始控件/事件属性控件
                            if (this.controller.type === START_CONTROLLER ||
                                this.controller.type === EVENT_CONDITION_CONTROLLER) {
                                //判断-增加标签 && 粉丝标签
                                if (this.controller.processInfo.decision.settings.labelType === 'fanLabel') {
                                    let appId = this.controller.processInfo.decision.settings.appId;
                                    this.wechatList.forEach((item) => {
                                        if (item.appid === appId) {
                                            this.wechatId = item.id;
                                            this.getTagList(this.wechatId);
                                        }
                                    });
                                }
                            }
                            //移除粉丝标签控件/添加粉丝标签控件
                            if (this.controller.type === ADD_FANS_TAG_CONTROLLER ||
                                this.controller.type === DELETE_FANS_TAG_CONTROLLER) {
                                //判断旅程类型 2实时旅程
                                if (this.journeyInformation.journeyType === 2) {
                                    //有选择公众号条件并且选择了粉丝标签
                                    if (this.controller.wechatId &&
                                        this.controller.processInfo.decision.settings.length > 0) {
                                        this.wechatId = this.controller.wechatId;
                                        this.getTagList(this.wechatId);
                                    }
                                } else {//定时旅程（单次/周期）
                                    if (this.controller.pushInfo.wechatId && this.controller.pushInfo.tags.length > 0) {
                                        this.wechatId = this.controller.pushInfo.wechatId;
                                        this.getTagList(this.wechatId);
                                    }
                                }

                            }
                        }

                    });// 公众号的数据
            },
            //获取某公众号下的粉丝标签
            getTagList(wechatId) {
                WechatApiV1
                    .getTagList('', '', wechatId)
                    .then(res => {
                        if (res.body.data && res.body.data.tagList && res.body.data.tagList.length > 0) {
                            this.filterTagArr = res.body.data.tagList;
                            this.commitSummary();
                        }
                    });
            },
            //更改summary
            commitSummary() {
                //添加粉丝标签 addFansTagController
                //移除粉丝标签 delFansTagController
                //开始控件 startController
                //事件判断 eventDecideController
                let con = cloneDeep(this.controller);
                if (this.controller.type === START_CONTROLLER ||
                    this.controller.type === EVENT_CONDITION_CONTROLLER) {
                    let arr = [];
                    let str = '';
                    arr = this.filterTagArr.filter(tag => tag.id === this.controller.processInfo.decision.settings.value);
                    let summaryArr = con.summary.trim().split(' ');
                    for (let i = 0; i < summaryArr.length - 1; i++) {
                        str += summaryArr[i] + ' ';
                    }
                    con.summary = str + arr[0].name;
                    this.UPDATE_CONTROLLER(con);
                }
                if (this.controller.type === ADD_FANS_TAG_CONTROLLER ||
                    this.controller.type === DELETE_FANS_TAG_CONTROLLER) {
                    let result = [];
                    //重新匹配粉丝标签
                    //循环判断数组a里的元素在b里面有没有，有的话就放入新建立的数组中
                    let setList = [];
                    setList = this.journeyInformation.journeyType === 2 ?
                        con.processInfo.decision.settings : con.pushInfo.tags;
                    for (let i = 0; i < setList.length; i++) {
                        for (let j = 0; j < this.filterTagArr.length; j++) {
                            if (setList[i].tagId === this.filterTagArr[j].tagId) {
                                result.push(this.filterTagArr[j]);
                            }
                        }
                    }
                    this.journeyInformation.journeyType === 2 ?
                        con.processInfo.decision.settings = result : con.pushInfo.tags = result;
                    this.UPDATE_CONTROLLER(con);
                }
            },
            // 根据联系人标签分组结构this.memberTagGroupData更新标签名称
            traverseList(e) {
                let obj = {};
                for (let i = 0; i < this.memberTag.length; i++) {
                    let fItem = this.memberTag[i].labelList.filter(sitem => e.id === sitem.id);
                    if (fItem.length) {
                        obj = fItem[0];
                        break;
                    }
                }
                return obj;
            },
            //更新控件会员标签信息
            updateMemberTag() {
                let memberSelectedList = [];
                let con = cloneDeep(this.controller);
                let conType = this.journeyInformation.journeyType;
                if (conType !== 2) {
                    if (con.type === ADD_CONTACT_TAG_CONTROLLER || con.type === DELETE_CONTACT_TAG_CONTROLLER) {
                        let tags = con.pushInfo.tags || [];
                        if (tags.length > 0) {
                            memberSelectedList = this.memberTag.filter(y => {
                                return tags.some(x => y.id === x.id);
                            });
                        }
                        // 标签被全部删除
                        if (tags.length !== memberSelectedList.length && !memberSelectedList.length) {
                            this.tagAllClear();
                        }
                    }
                } else {
                    if (!con.processInfo || !con.processInfo.decision || !con.processInfo.decision.settings) {
                        return;
                    }
                    //添加联系人标签控件、移除联系人标签控件使用数据
                    let settings = con.processInfo.decision.settings || [];
                    //开始控件、事件判断控件使用数据
                    let operatorType = con.processInfo.decision.settings.operatorType || '';
                    let labelType = con.processInfo.decision.settings.labelType || '';
                    let fieldType = con.processInfo.decision.settings.fieldType || '';
                    let tagValue = con.processInfo.decision.settings.value || [];
                    //标签判断控件使用数据
                    let tagDecide = (con.type === TAG_CONDITION_CONTROLLER) ?
                        con.processInfo.decision.settings[0].behavior : [];
                    switch (con.type) {
                        case START_CONTROLLER:
                        case EVENT_CONDITION_CONTROLLER:
                            if (
                                labelType === 'memberLabel' ||
                                (operatorType === 'attribute_change' && fieldType === 4)
                            ) {
                                memberSelectedList = tagValue.length > 0 ?
                                    [{id: tagValue[0]}] : [];
                            }
                            break;
                        case TAG_CONDITION_CONTROLLER:
                            if (tagDecide.length > 0) {
                                memberSelectedList = tagDecide;
                            }
                            break;
                        case ADD_CONTACT_TAG_CONTROLLER:
                        case DELETE_CONTACT_TAG_CONTROLLER:
                            if (settings.length > 0) {
                                memberSelectedList = this.memberTag.filter(y => {
                                    return settings.some(x => y.id === x.id);
                                });
                            }
                            // 标签被全部删除
                            if (settings.length !== memberSelectedList.length && !memberSelectedList.length) {
                                this.tagAllClear();
                            }
                            break;
                    }
                }
                if (memberSelectedList.length > 0) {
                    let newList = memberSelectedList.filter(item => {
                        item.name = this.traverseList(item).name;
                        return this.traverseList(item).id;
                    });
                    let summaryString = '';
                    const operatorType = con.processInfo.decision.settings.operatorType || '';
                    const fieldType = con.processInfo.decision.settings.fieldType || '';
                    const createTag = this.$t('controller.createTag');
                    const removeTag = this.$t('controller.removeTag');
                    const followerTag = this.$t('QRCode.followerTag');
                    const dmartechLabel = this.$t('QRCode.dmartechLabel');
                    const labelEvent = this.$t('controller.labelEvent');
                    if (con.type === START_CONTROLLER || con.type === EVENT_CONDITION_CONTROLLER) {
                        let tagOpt = (con.processInfo.decision.settings.operator === 'label_add') ? createTag : removeTag;
                        let tagLabel = (con.processInfo.decision.settings.labelType === 'fanLabel') ? followerTag : dmartechLabel;
                        if ((operatorType === 'attribute_change' && fieldType === 4)) tagOpt = '';
                        summaryString = labelEvent + ' ' + tagOpt + ' ' + tagLabel + ' ' +
                            ((newList.length > 0) ? newList[0].name : '');
                        con.processInfo.decision.settings.value = (newList.length > 0) ?
                            [newList[0].id] : [];
                    } else {
                        newList.map(item => {
                            summaryString += item.name + ' ';
                        });
                        if (con.type === TAG_CONDITION_CONTROLLER) {
                            con.processInfo.decision.settings[0].behavior = newList;
                        } else if (con.type === ADD_CONTACT_TAG_CONTROLLER || con.type === DELETE_CONTACT_TAG_CONTROLLER) {
                            if (conType === 2) con.processInfo.decision.settings = newList;
                            if (conType !== 2) con.pushInfo.tags = newList;
                        }
                    }
                    con.summary = summaryString;
                    let commitTime = setInterval(() => {
                        this.UPDATE_CONTROLLER(con);
                        this.$forceUpdate();
                        clearInterval(commitTime);
                    },100);
                }
            },
            updateContactSummary() {
                if (this.controller.contactInfo.type === 'contact') {
                    let con = cloneDeep(this.controller);
                    let swarm = this.swarmList.filter(s => s.id === con.contactInfo.id);
                    con.name = swarm.length ? swarm[0].name : con.name;
                    this.UPDATE_CONTROLLER(con);
                }
            },
            tagAllClear() {
                this.$nextTick(() => {
                    let commitTime = setInterval(() => {
                        const taskSaving = this.taskSaving;
                        const journeySaving = this.journeySaving;
                        if (!taskSaving && !journeySaving) {
                            let templateCon = cloneDeep(this.controller);
                            templateCon.summary = '';
                            this.UPDATE_CONTROLLER(templateCon);
                            clearInterval(commitTime);
                        }
                    },100);
                });
            }
        },
        components: {
            [WechatController.name]: WechatController,
            [ABTestController.name]: ABTestController,
            [NewABTestController.name]: NewABTestController,
            [ContactController.name]: ContactController,
            [DecisionController.name]: DecisionController,
            [EmailController.name]: EmailController,
            [EmailControllerTemplage.name]: EmailControllerTemplage,
            [SMSController.name]: SMSController,
            [MMSController.name]: MMSController,
            [AddContactTagController.name]: AddContactTagController,
            [DeleteContactTagController.name]: DeleteContactTagController,
            [AddFansTagController.name]: AddFansTagController,
            [DeleteFansTagController.name]: DeleteFansTagController,
            [EventConditionController.name]: EventConditionController,
            [AttributeConditionController.name]: AttributeConditionController,
            [TagConditionController.name]: TagConditionController,
            [StartController.name]: StartController,
            [EndController.name]: EndController,
            [LeadsTransferController.name]: LeadsTransferController,
            ControllerActions,
            WecomController
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .controller-wrapper {
        $controller-width: 62px;
        $controller-height: 110px;
        $anchor-size: 12px;
        $large-anchor-size: 15px;

        position: absolute;
        left: 0;
        top: 0;
        width: $controller-width;
        height: $controller-height;
        @include user-select(none);
        cursor: default;
        @include transform-origin(left top);
        z-index: 1;

        &.configurable {
            cursor: move;
        }

        .controller {
            margin-bottom: 8px;
            height: $controller-width;

            &.vertical {
                margin-bottom: ($controller-width * 1.414 - $controller-width)/2 + 8px;
            }

            .controller-icon {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
                text-align: center;
                border-radius: 12px;

                svg,
                img {
                    // fix safari dragging the svg/img won't work as expect.
                    pointer-events: none;
                }
            }

            .input-anchor {
                position: absolute;
                left: -$anchor-size/2;
                top: $controller-width / 2 - $anchor-size/2;
                width: $anchor-size - 4px;
                height: $anchor-size - 4px;
                border: 2px solid #34b6fa;
                border-radius: 50%;
                background-color: white;

                &:hover,
                &.hover-in {
                    border-color: $theme;
                    background-color: $theme;
                    @include box-shadow(0 0 1px 5px rgba(255, 125, 158, .4));
                }

                &.vertical-controller {
                    left: -($controller-width * 1.414 - $controller-width)/2;
                }
            }

            .output-anchor {
                position: absolute;
                right: -$anchor-size/2;
                top: $controller-width / 2 - $anchor-size/2;
                width: $anchor-size - 2px;
                height: $anchor-size - 2px;
                border: 1px solid transparent;
                border-radius: 50%;
                background-color: #34b6fa;

                &:hover,
                &.hover-in {
                    border-color: $theme;
                    background-color: $theme;
                    @include box-shadow(0 0 1px 5px rgba(255, 125, 158, .4));
                }
            }

            // 判断控件 yes 分支的 output anchor
            .yes-output-anchor {
                position: absolute;
                top: $controller-width / 2 - $large-anchor-size / 2;
                right: -($controller-width * 1.414 - $controller-width)/2 - $large-anchor-size/2;
                width: $large-anchor-size - 2px;
                height: $large-anchor-size - 2px;
                text-align: center;
                border-radius: 50%;
                color: #00b734;
                border: 1px solid #00b734;
                background-color: white;

                &:hover,
                &.hover-in {
                    @include box-shadow(0 0 1px 5px rgba(0, 183, 52, .4));
                }
            }

            // 判断控件 no 分支的 output anchor
            .no-output-anchor {
                position: absolute;
                top: $controller-width + ($controller-width * 1.414 - $controller-width)/2 - $large-anchor-size/2;
                left: $controller-width / 2 - $large-anchor-size / 2;
                width: $large-anchor-size - 2px;
                height: $large-anchor-size - 2px;
                text-align: center;
                border-radius: 50%;
                color: #e03418;
                border: 1px solid #e03418;
                background-color: white;

                &:hover,
                &.hover-in {
                    @include box-shadow(0 0 1px 5px rgba(255, 125, 158, .4));
                }
            }

            // A/B测试出口 - A
            .a-output-anchor {
                position: absolute;
                right: -$anchor-size/2;
                top: $controller-width / 2 - $anchor-size/2 - $anchor-size;
                width: $anchor-size - 2px;
                height: $anchor-size - 2px;
                border: 1px solid transparent;
                border-radius: 50%;
                background-color: #ead01b;

                &:hover,
                &.hover-in {
                    @include box-shadow(0 0 1px 5px rgba(#ead01b, .4));
                }
            }

            // A/B测试出口 - B
            .b-output-anchor {
                position: absolute;
                right: -$anchor-size/2;
                top: $controller-width / 2 - $anchor-size/2 + $anchor-size;
                width: $anchor-size - 2px;
                height: $anchor-size - 2px;
                border: 1px solid transparent;
                border-radius: 50%;
                background-color: #11d952;

                &:hover,
                &.hover-in {
                    @include box-shadow(0 0 1px 5px rgba(#11d952, .4));
                }
            }
            
            // A/B测试出口 - C
            .c-output-anchor {
                position: absolute;
                right: -$anchor-size/2;
                top: $controller-width - $controller-width / 3 + $anchor-size/2;
                width: $anchor-size - 2px;
                height: $anchor-size - 2px;
                border: 1px solid transparent;
                border-radius: 50%;
                background-color: #7070ff;

                &:hover,
                &.hover-in {
                    @include box-shadow(0 0 1px 5px rgba(#7070ff, .4));
                }
            }
        }

        .controller-information {
            line-height: 20px;
            text-align: center;

            p {
                max-width: 100%;
                @include ellipsis();
            }
        }

        .notice-icon {
            position: absolute;
            right: 12%;
            top: -8%;
            width: 20px;
            height: 20px;
            line-height: 19px;
            font-size: 23px;

            border-radius: 50%;

            &.error {
                z-index: 0;
                background: white;
                color: #d23b28;
                font-weight: bold;
            }

            &.complete {
                z-index: 0;
                color: $theme;
                background: white;

                .icon {
                    position: relative;
                    left: -1px;
                }
            }

            &.cancel {
                z-index: 0;
                background: white;

                .icon {
                    position: relative;
                    left: -2px;
                    color: $color-light-content;
                }
            }

        }
    }
</style>
