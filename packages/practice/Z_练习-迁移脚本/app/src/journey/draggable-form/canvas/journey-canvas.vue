<template>
    <div class="journey-canvas" :class="{wider}" ref="container">
        <!-- 旅程画布 -->
        <div class="canvas-wrapper"
             @mousedown.self="canvasDragStart"
             @mousemove.self="canvasDragging"
             @mouseout.self="canvasDragEnd"
             @mouseup.self="canvasDragEnd"
             @dragover="allowDrag($event)"
             @drop="allowDrop($event)"
             @mousemove="updateCursorPosition"
             :style="canvasStyle">
            <svg class="arrow-container">
                <arrow v-for="arrow in arrows" :key="arrow.from + 'to' + arrow.to" :from="arrow.from" :to="arrow.to"/>
                <arrow-drawer v-if="creatingArrow.fromControllerId" :cursorPosition="cursorPosition"/>
            </svg>
            <controller v-for="controller in canvasInformation.controllers"
                        :key="controller.id"
                        :controller="controller"
                        :memberTag="memberTag"
                        :swarmList="swarmList"
                        @expand="expandCanvas"/>
        </div>
        <!-- 旅程画布缩放 -->
        <canvas-size-toolbar/>
    </div>
</template>

<script type="text/ecmascript-6">

    import { ContactApiV1, JourneyApiV1, JourneyApiV3, JourneyMaterialApiV1, GeteOriginApi, SenderApi, WechatApiV1 } from '@/api';
    import cloneDeep from 'lodash/cloneDeep';
    import controller, {CONTROLLER_DEFAULT_HEIGHT, CONTROLLER_DEFAULT_WIDTH} from './controller/controller.vue';
    import {AD_EMAIL_PREFIX} from './controller/sub-controllers/email-controller/email-controller-form.vue';
    import ArrowDrawer from './arrow/arrow-drawer.vue';
    import arrow from './arrow/arrow.vue';
    import CanvasSizeToolbar, {RATIO_STEP} from './canvas-size-toolbar.vue';
    import {DRAGGABLE_JOURNEY_STORE_NAME, uniqId} from '@/store/vuex/modules/canvasStore';
    import {
        CHECK_JOURNEY_NEW_VERSION,
        COMPLETE_DRAGGING_NEW_CONTROLLER,
        SAVE_JOURNEY
    } from '@/store/vuex/actionTypes';
    import {
        EXPAND_CANVAS,
        UPDATE_PANEL_AUTHORIZERINFO_ID,
        UPDATE_CONTROLLER,
        UPDATE_SAVE_TASK_STATUS,
        // UPDATE_JOURNEY
    } from '@/store/vuex/mutationTypes';
    import {
        EMAIL_CONTROLLER,
        SMS_CONTROLLER,
        WECHAT_CONTROLLER,
        MMS_CONTROLLER,
        EMAILTEMPLATE_CONTROLLER,
        LEADS_TRANSFER,
        ADD_CONTACT_TAG_CONTROLLER,
        DELETE_CONTACT_TAG_CONTROLLER,
        ADD_FANS_TAG_CONTROLLER,
        DELETE_FANS_TAG_CONTROLLER,
        WECOM_CONTROLLER
    } from './controller/CONTROLLER_TYPES';
    import {timeZoneToday} from '@/common/utils/timeZone';
    import format from 'date-fns/format';
    import { initTaskInfo } from '@/journey/draggable-form/utils/configHandler';
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';

    const CANVAS_EXPAND_STEP = 4;

    export default {
        data() {
            return {
                dragScrollBefore: null, //拖拽滚动之前
                task: {
                    taskName: ''
                },
                cursorPosition: {left: -1, top: -1},    //鼠标位置
                canvasDrag: {   //画布拖拽
                    flag: false,
                    beforeLeft: '',
                    beforeTop: '',
                },
                senderList: [],     // 发件人列表
                sendAddressList: [], // 发件地址列表
                // 邮件控件
                emailController: {
                    taskType: 0,        // 任务类型
                    senderId: '',       // 发件地址 id
                    sendAddress: '',    // 发件地址
                    sendNameId: '',     // 发件人 id
                    sendName: '',       // 发件人 name
                },
                publicAccountList: [],  // 公众号列表
                memberTag: [],          // 联系人标签数据
                swarmList: [],          // 联系人分群数据
            };
        },
        mounted() {
            this.fetchSender();
            this.fetchAccountList();
            this.getMemberTag();
            this.getSwarmList();
        },
        methods: {
            ...mapMutations([
                EXPAND_CANVAS,
                UPDATE_SAVE_TASK_STATUS,
                UPDATE_CONTROLLER,
                UPDATE_PANEL_AUTHORIZERINFO_ID
            ]),
            ...mapActions([
                CHECK_JOURNEY_NEW_VERSION,
                COMPLETE_DRAGGING_NEW_CONTROLLER,
                SAVE_JOURNEY
            ]),
            // 获取公众号列表
            fetchAccountList() {
                WechatApiV1
                    .getWechatAccounts()
                    .then(res => {
                        let authList = res.body.data.authorizerInfoList;
                        this.publicAccountList = authList.map(auth => ({
                            id: auth.authorizerInfoId,
                            WxAppId: auth.WxAppId,
                            name: auth.principalName,
                            serviceTypeInfo: auth.serviceTypeInfo,
                        }));
                    });
            },
            // 获取公众号
            getAccount(id) {
                if (!id) return '';
                let target = this.publicAccountList.$getByKey(id);
                return target && Object.keys(target).length > 0 ? target : '';
            },
            // 获取所有发件人列表
            fetchSenderList() {
                SenderApi
                    .getSenderAll(this.emailController.senderId)
                    .then(res => {
                        this.senderList = res.body.data.senderList;
                        if (this.senderList.length <= 0) return;
                        this.senderList.map(sender => {
                            this.$set(sender, 'btnsShow', false);
                        });
                        this.emailController.sendNameId = this.senderList[0].id;
                        this.emailController.sendName = this.senderList[0].name;
                    });
            },
            // 获取发件地址、发件人
            fetchSender() {
                // 主账号
                if (this.roleId === 0 || this.roleId === '') {
                    // 发件地址列表
                    JourneyApiV1
                        .getAddressCanvas()
                        .then(res => {
                            if (res && res.body && res.body.data && res.body.data.addressList) {
                                if (res.body.data.addressList.length <= 0) return;
                                let addressList = res.body.data.addressList;
                                this.sendAddressList = addressList.map((address) => ({
                                    id: address.senderId,
                                    name: address.sendAddress
                                }));
                                // 默认发件地址 id
                                this.emailController.senderId = this.sendAddressList[0].id;
                                this.emailController.sendAddress = this.sendAddressList[0].name;
                                // 发件人列表
                                this.fetchSenderList();
                            }
                        });
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
                            this.emailController.senderId = this.sendAddressList[0].id;
                            this.emailController.sendAddress = this.sendAddressList[0].name;
                            this.fetchSenderList();
                        });
                }
            },
            //获取联系人标签列表
            getMemberTag() {
                ContactApiV1
                    .getGroupsOld()
                    .then((res) => {
                        let group = cloneDeep(res.body.data.groupList[0].groupList);
                        this.getMemberTagList(group);
                    });
            },
            //调整联系人标签分组结构
            getMemberTagList(group) {
                if (group && group.length) {
                    group.forEach(item => {
                        if (item.groupList && item.groupList.length) {
                            this.getMemberTagList(item.groupList);
                        }
                        this.memberTag.push(item);
                    });
                }
            },
            // 获取分群列表
            getSwarmList() {
                ContactApiV1
                    .getSwarms()
                    .then(res => {
                        this.swarmList = res.body.data.swarmList;
                    });
            },
            /**
             *  拓展画布
             * @param direction 方向
             */
            expandCanvas(direction) {
                if (direction === 'width') {
                    this.$refs.container.scrollLeft += CANVAS_EXPAND_STEP;
                    this.EXPAND_CANVAS({width: this.canvasInformation.width + CANVAS_EXPAND_STEP});
                }
                if (direction === 'height') {
                    this.$refs.container.scrollTop += CANVAS_EXPAND_STEP;
                    this.EXPAND_CANVAS({height: this.canvasInformation.height + CANVAS_EXPAND_STEP});
                }
            },
            /**
             * 开始拖拽画布
             * @param e
             */
            canvasDragStart(e) {
                this.canvasDrag.flag = true;
                this.canvasDrag.beforeLeft = e.clientX;
                this.canvasDrag.beforeTop = e.clientY;
            },
            /**
             * 画布拖拽ing
             * @param e
             */
            canvasDragging(e) {
                if (this.canvasDrag.flag) {
                    let journeyWrapper = this.$refs.container;
                    journeyWrapper.scrollLeft += -(e.clientX - this.canvasDrag.beforeLeft) / 5;
                    journeyWrapper.scrollTop += -(e.clientY - this.canvasDrag.beforeTop) / 5;
                } else {
                    this.canvasDragEnd();
                }
            },
            // 画布拖拽结束
            canvasDragEnd() {
                this.canvasDrag.flag = false;
                this.canvasDrag.beforeLeft = '';
                this.canvasDrag.beforeTop = '';
                // 连接线终点重置
                this.cursorPosition.left = -1;
                this.cursorPosition.top = -1;
            },
            /**
             * 更新鼠标位置
             * @param e
             */
            updateCursorPosition(e) {
                if (this.creatingArrow.fromControllerId) {
                    let container = this.$refs.container;
                    this.cursorPosition.left = e.clientX - container.offsetLeft + container.scrollLeft;
                    this.cursorPosition.top = e.clientY - container.offsetTop + container.scrollTop;
                }
            },
            /**
             * 是否允许拖拽
             * @param e
             */
            allowDrag(e) {
                if (this.onPending) {
                    this.$toast(this.$t('dragJourney.delayOperate'),'warn');
                    return;
                }
                e.dataTransfer.dropEffect = 'move';
                e.preventDefault();
                e.stopPropagation();
            },

            async allowDrop(e) {
                if (this.onPending) {
                    this.$toast(this.$t('dragJourney.delayOperate'),'warn');
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                if (this.controllerStageController) {
                    this.UPDATE_SAVE_TASK_STATUS(true);
                    let container = this.$refs.container;
                    let left = e.clientX - CONTROLLER_DEFAULT_WIDTH / 2 - container.offsetLeft + container.scrollLeft,
                        top = e.clientY - CONTROLLER_DEFAULT_HEIGHT / 2 - container.offsetTop + container.scrollTop;
                    let controllerFrontId = uniqId();
                    let taskInfo = {
                        taskName: this.controllerStageController.name,
                        subType: '',
                        taskType: '',
                        controllerId: controllerFrontId,
                        materialId: '',
                        authorizerInfoId: ''
                    };
                    const date = new Date(timeZoneToday(this.journeyInformation.timeZone));
                    const min = date.getMinutes();
                    date.setMinutes(min + 5);
                    const taskDate = format(date, 'YYYY-MM-DD HH:mm');
                    switch (this.controllerStageController.type) {
                        case EMAIL_CONTROLLER:
                            taskInfo.taskType = this.emailController.taskType;
                            taskInfo.materialId = this.controllerStageController.id;

                            // 主题尝试设置为素材主题
                            if (taskInfo.materialId) {
                                const {body: {data: {material}}} =
                                    await JourneyMaterialApiV1.getMaterial(taskInfo.materialId);
                                if (!material.testSubject) {//没有值得时候 后台返回的material.testSubject === null
                                    taskInfo.mailSubject = AD_EMAIL_PREFIX;
                                } else {
                                    taskInfo.mailSubject = material.testSubject.indexOf(AD_EMAIL_PREFIX) > -1
                                        ? material.testSubject
                                        : AD_EMAIL_PREFIX + material.testSubject;
                                }
                            } else {
                                taskInfo.mailSubject = AD_EMAIL_PREFIX;
                            }
                            // 定时旅程
                            if (this.journeyInformation.journeyType !== 2) {
                                taskInfo.taskDate = taskDate;
                            }
                            taskInfo.senderId = this.emailController.senderId;          // 发件地址 id
                            taskInfo.sendAddress = this.emailController.sendAddress;    // 发件地址
                            taskInfo.sendNameId = this.emailController.sendNameId;      // 发件人 id
                            taskInfo.sendName = this.emailController.sendName;          // 发件人 name
                            break;
                        case EMAILTEMPLATE_CONTROLLER:
                            taskInfo.taskType = 6;
                            taskInfo.materialId = this.controllerStageController.id;
                            break;
                        case SMS_CONTROLLER:
                            taskInfo.taskType = 1;
                            taskInfo.materialId = this.controllerStageController.id;
                            break;
                        case MMS_CONTROLLER:
                            taskInfo.taskType = 3;
                            taskInfo.materialId = this.controllerStageController.id;
                            // 定时旅程
                            if (this.journeyInformation.journeyType !== 2) {
                                taskInfo.taskDate = taskDate;
                            }
                            break;
                        case WECHAT_CONTROLLER:
                            taskInfo.taskType = 2;
                            taskInfo.wechatType = this.controllerStageController.wechatType;
                            taskInfo.authorizerInfoId = this.panelAccountId;
                            taskInfo.subType = this.controllerStageController.subType;
                            initTaskInfo(this.controllerStageController, taskInfo);
                            // 定时旅程
                            if (this.journeyInformation.journeyType !== 2) {
                                taskInfo.taskDate = taskDate;
                            }
                            break;
                        case LEADS_TRANSFER:
                            //  华为定制 线索
                            taskInfo.taskType = 4;
                            break;
                        case ADD_CONTACT_TAG_CONTROLLER:
                            // 添加联系人标签 定时旅程
                            if (this.journeyInformation.journeyType !== 2) {
                                taskInfo.taskType = 5;
                            }
                            break;
                        case DELETE_CONTACT_TAG_CONTROLLER:
                            // 移除联系人标签 定时旅程
                            if (this.journeyInformation.journeyType !== 2) {
                                taskInfo.taskType = 9;
                            }
                            break;
                        case ADD_FANS_TAG_CONTROLLER:
                            // 添加粉丝标签 定时旅程
                            if (this.journeyInformation.journeyType !== 2) {
                                taskInfo.taskType = 7;
                            }
                            break;
                        case DELETE_FANS_TAG_CONTROLLER:
                            // 移除粉丝标签 定时旅程
                            if (this.journeyInformation.journeyType !== 2) {
                                taskInfo.taskType = 8;
                            }
                            break;
                        case WECOM_CONTROLLER:
                            // 企业微信：应用消息(subType: 14,wechatType: agentMsg) 企业群发(subType: 14,wechatType: groupMsg)
                            taskInfo.wechatType = this.controllerStageController.subType === 14 ? 'agentMsg' : 'groupMsg';
                            taskInfo.taskType = 10;
                            taskInfo.subType = this.controllerStageController.subType;
                            break;
                    }

                    if (taskInfo.taskType !== '') {
                        // 任务类控件
                        let count = 0;
                        let sameNameTaskControllers = Object.values(this.canvasInformation.controllers)
                            .filter(ctlr => ctlr.pushInfo && ctlr.pushInfo.taskId) // 任务控件
                            // "同名控件"
                            .filter(ctlr => {
                                // 拆解控件名，名字+计数后缀
                                let res = ctlr.name.match(/^(.+)\(([0-9]+)\)$/);

                                // "同名控件"包含：任务素材 id 相同、任务名称相同、任务名称去掉计数后缀之后相同
                                if (
                                    ctlr.pushInfo.materialId === taskInfo.materialId
                                    || ctlr.name === taskInfo.taskName
                                    || (res && res[1] === taskInfo.taskName)
                                ) {
                                    // 记录已使用的最大计数
                                    if (res && count < res[2]) {
                                        count = Number(res[2]);
                                    }

                                    return true;
                                }
                            });

                        if (sameNameTaskControllers.length !== 0) {
                            taskInfo.taskName = taskInfo.taskName + `(${count + 1})`;
                        }

                        // 左侧边栏选中的公众号
                        let panelAccount = this.getAccount(this.panelAccountId);
                        // 旅程版本检查
                        this.CHECK_JOURNEY_NEW_VERSION()
                            .then(() => {
                                if (taskInfo.taskType !== 6) {
                                    // 创建任务
                                    JourneyApiV3
                                        .createTask(~~this.$route.params.id, taskInfo)
                                        .then((res) => {
                                            // 拖放成功: 把vuex暂存的标签数据存入控制器。列表中，并生成对应的控制器
                                            this.COMPLETE_DRAGGING_NEW_CONTROLLER({
                                                left,
                                                top,
                                                id: controllerFrontId,
                                                taskId: res.body.data.task.id,
                                                name: taskInfo.taskName,
                                                authorizerInfoId: taskInfo.authorizerInfoId,
                                            });
                                            this.afterCreateTaskSave(panelAccount, res, taskInfo, controllerFrontId);
                                            // this.$store.commit(UPDATE_JOURNEY,
                                            //     {authorizerInfoId: panelAccount.id});

                                            // 定时旅程的邮件控件
                                            // 由于设置了默认值，需要更新任务和更新旅程（画布）
                                            if (this.journeyInformation.journeyType !== 2
                                                && this.emailController.taskType === 0) {
                                                this.updateCanvas(controllerFrontId, taskInfo, panelAccount);
                                            } else {
                                                this.UPDATE_SAVE_TASK_STATUS(false);
                                            }
                                        })
                                        .catch(() => {
                                            this.UPDATE_SAVE_TASK_STATUS(false);
                                        });
                                } else {
                                    // 拖放成功: 把vuex暂存的标签数据存入控制器。列表中，并生成对应的控制器
                                    this.COMPLETE_DRAGGING_NEW_CONTROLLER({
                                        left,
                                        top,
                                        id: controllerFrontId,
                                        taskId: '',
                                        name: taskInfo.taskName
                                    });
                                    let cont = this.canvasInformation.controllers;
                                    const controller = cloneDeep(cont[controllerFrontId]);
                                    Object.assign(controller.pushInfo, taskInfo);
                                    this.UPDATE_SAVE_TASK_STATUS(false);
                                    this.UPDATE_CONTROLLER(controller);
                                    this.SAVE_JOURNEY(false);
                                }
                            })
                            .catch(() => {
                                this.UPDATE_SAVE_TASK_STATUS(false);
                            });
                    } else {
                        // 非任务类控件
                        this.COMPLETE_DRAGGING_NEW_CONTROLLER({
                            left,
                            top,
                            id: controllerFrontId
                        });
                        this.UPDATE_SAVE_TASK_STATUS(false);
                        this.SAVE_JOURNEY();
                    }
                }
            },
            afterCreateTaskSave(panelAccount, res, taskInfo, controllerFrontId) {
                // fixme temporary fix: controller.pushInfo 没有被更新
                let cont = this.canvasInformation.controllers;
                const controller = cloneDeep(cont[controllerFrontId]);
                controller.authorizerInfoId = panelAccount.id;

                controller.pushInfo.authorizerInfoId = panelAccount.id;
                controller.pushInfo.authorizerInfoName = panelAccount.name;
                controller.pushInfo.wechatAppid = panelAccount.WxAppId;

                controller.tasks.authorizerInfoId = panelAccount.id;
                controller.tasks.authorizerInfoName = panelAccount.name;
                controller.tasks.wechatAppid = panelAccount.WxAppId;
                Object.assign(controller.pushInfo, taskInfo, res.body.data.task);
                this.UPDATE_PANEL_AUTHORIZERINFO_ID(taskInfo.authorizerInfoId);
                this.UPDATE_CONTROLLER(controller);
                this.SAVE_JOURNEY(false);
            },
            updateCanvas(controllerFrontId, taskInfo, panelAccount) {
                let cont = this.canvasInformation.controllers;
                const controller = cloneDeep(cont[controllerFrontId]);
                JourneyApiV3
                    .updateTask(controller.pushInfo)
                    .then(({body: {data: {task}}}) => {
                        Object.assign(controller.pushInfo, taskInfo, task);
                        controller.name = task.taskName;
                        controller.pushInfo.authorizerInfoId = panelAccount.id;
                        controller.pushInfo.authorizerInfoName = panelAccount.name;
                        controller.pushInfo.wechatAppid = panelAccount.WxAppId;
                        this.UPDATE_SAVE_TASK_STATUS(false);
                        this.UPDATE_CONTROLLER(controller);
                        this.SAVE_JOURNEY(false);
                    })
                    .catch(() => {
                        this.UPDATE_SAVE_TASK_STATUS(false);
                    });
            }
        },
        computed: {
            ...mapGetters([
                'onPending',
                'journeyWritable',
                //箭头
                'arrows'
            ]),
            ...mapState({
                ratio: state => state[DRAGGABLE_JOURNEY_STORE_NAME].ratio,
                // 旅程详情
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                // 画布详情
                canvasInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation,
                //创建箭头 连线
                creatingArrow: state => state[DRAGGABLE_JOURNEY_STORE_NAME].creatingArrow,
                controllerStageController: state => state[DRAGGABLE_JOURNEY_STORE_NAME].dragStage.controller,
                activeControllerId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].activeControllerId,
                isChecking: state => state[DRAGGABLE_JOURNEY_STORE_NAME].isChecking,
                // 旅程左侧选中的公众号
                panelAccountId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].authorizerInfoId,
                roleId: state => state.user.roleId
            }),
            canvasStyle() {
                // 背景svg初始size是 10px，比例每变化2次，这个size变化1px
                const gridBackgroundSize = 10 - parseInt((1 - this.ratio) / RATIO_STEP / 2);

                return {
                    width: this.canvasInformation.width + 'px',
                    height: this.canvasInformation.height + 'px',
                    'background-size': `${gridBackgroundSize}px ${gridBackgroundSize}px`
                };
            },
            //旅程id
            journeyId() {
                return this.journeyInformation.id;
            },
            // 定时旅程不可编辑时，宽度要大一点
            wider() {
                return this.journeyInformation.journeyType !== 2 &&
                    (!this.journeyWritable || this.isChecking);
            },
            controller() {
                const controllers = this.canvasInformation.controllers;
                return controllers[this.activeControllerId];
            }
        },
        components: {controller, ArrowDrawer, arrow, CanvasSizeToolbar}
    };
</script>

<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    @import "../journey-variables";

    .journey-canvas {
        float: right;
        position: relative;
        overflow: auto;
        height: calc(100vh - #{$header-height + $toolbar-height + $page-head-height});
        background: $content-bg;
        cursor: grab;
        cursor: -webkit-grab;
        @include user-select(none);
        width: calc(100vw - #{$wide-panel-width + 1px});

        &:active {
            cursor: grabbing;
            cursor: -webkit-grabbing;
        }

        &.wider {
            width: calc(100vw - #{$slim-panel-width});
        }

        .canvas-wrapper {
            position: relative;
            border: 3px solid $content-bg;
            background: white url("./grid.svg") repeat left top;
            background-size: 10px 10px;
            @include user-select(none);
        }

        .arrow-container {
            position: relative;
            overflow: visible;
        }
    }
</style>
