<template>
    <modal :title="$t('controller.groupBatches')" size="lg" @close="cancel()">
        <p v-if="controller.id === validationResult.errorId" class="error-message">
            {{validationResult.errorMessage}}
        </p>
        <div class="email-controller-form">
            <div class="form-field flex">
                <label class="label" for="taskName">{{$t('controller.stepName')}}</label>
                <div class="field-group">
                    <input type="text" id="taskName" maxlength="200" v-model.trim="task.taskName" class="input xl">
                </div>
            </div>
            <div class="form-field flex">
                <!-- 发票抬头即发件人 -->
                <label class="label" for="sendName">{{$t('controller.sendName')}}</label>
                <div class="field-group">
                    <input type="text" v-model.trim="task.sendName" id="sendName" class="input lg">
                    <label class="label">{{$t('controller.from_address')}}</label>
                    <selector :options="sendAddressList"
                              class="xl"
                              :search="sendAddressList.length > 10"
                              :value="task.senderId"
                              @select="changeSendAddress"/>
                </div>
            </div>
            <div class="form-field flex">
                <label class="label" for="mailSubjectInput">{{$t('controller.personalMail')}}</label>
                <div class="field-group peo">
                    <selector :options="eimlList" :placeholder="$t('controller.perMail')" :value="task.mailSubject"  @select="getGroupList"/>
                    &nbsp;
                    <div class="checkedOks" @click.stop="checkedOk(0)">
                        <checkbox v-model="task.sameSubject">{{'controller.unifiedMail' | t}}</checkbox>
                    </div>
                </div>
            </div>
            <div class="form-field flex">
                <span class="label">{{$t('controller.mailBatch')}}</span>
                <span @click="generate()" class="generateBatch">{{$t('controller.generateBatch')}}</span>
            </div>
            <!-- 生成批次 -->
            <div v-show="showGener" class="main">
                <!-- 标题 -->
                <div class="form-field flex">
                    <span class="batch-content-label"></span>
                    <span class="serial-number">{{$t('controller.batchIdx')}}</span>
                    <span class="labelOne">{{$t('controller.batchName')}}</span>
                    <span class="labelTwo">{{$t('controller.batchTime')}}</span>
                    <span class="labelThree">{{$t('controller.mailMain')}}</span>
                </div>
                <!-- 内容 -->
                <div v-for="(item,index) in tasks" :key="item.index" class="form-field flex">
                    <span class="batch-content-label"></span>
                    <div class="right">
                        <!-- 批次序号 -->
                        <div class="serial-number labelD">{{index + 1}}</div>
                        <!-- 批次名称 -->
                        <div class="labelA labelD" :title="item.taskName">
                            <checkbox v-model="item.sendFlag">{{item.taskNameNum}}</checkbox>
                        </div>
                        <!-- 批次标签与发送时间 -->
                        <div class="labelB labelD">
                            <input type="text" class="input lg" :value="item.taskName" maxlength="100" disabled />
                            <div class="time">
                                 <div class="form-field flex"  @click="setTime(index)">
                                    <template>
                                        <div class="field-group">
                                            <calendar
                                                @input="setTime(index)"
                                                v-model="item.taskDay"
                                                :start="today"/>
                                            <hour-minute-select @input="toggleImmediately(index,$event)"  value="item.taskHourAndMinute"  v-model="item.taskHourAndMinute"/>
                                            <p>{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <!-- 邮件主题与内容 -->
                        <div class="labelC labelD">
                            <div>
                                <input type="text" id="mailSubjectInput" :disabled="index === 0 ? false : task.sameSubject" class="input lg" @input="checkedOk(index)" v-model.trim="item.mailSubject"
                                ref="mailSubjectInput" maxlength="100">
                                <selector :options="fields" :disabled="index === 0 ? false : task.sameSubject" :placeholder="$t('controller.insert')" @select="insertField($event,index)"/>
                            </div>
                            <div class="mesg">
                                <input type="text" class="input lg" disabled @click="showPes(item.id)" :value="item.blockNames" maxlength="100">
                                <i @click="showPes(item.id)" class="iconed icon icon-bianji"></i>
                            </div>
                        </div>
                        <!-- 查看 -->
                        <div @click="showPanel()" class="see icon icon-chakan"></div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 查看详情 -->
        <template v-slot:buttons>
            <button class="btn btn-md btn-theme pull-left export-btn" :disabled="ifCanExport" @click.stop="exportBatch">{{'controller.exportBatch' | t}}</button>
            <button class="btn btn-md btn-white" @click.stop="$test(material)" :disabled="!task.materialId">
                {{'controller.test' | t}}
            </button>
            <button class="btn btn-md btn-theme" @click.stop="confirm()">{{'common.confirm' | t}}</button>
        </template>
        <!-- 详情显示 -->
        <email-controller-mesg v-show="panelShow" ref="emailMesg" @close="close" :controller="controller"></email-controller-mesg>
        <!-- 个性区块设置 -->
        <email-controller-pes v-show="pesShow" ref="emailPes"  @close="closed" :controller="controller"></email-controller-pes>
        <!-- 导出邮件批次弹窗 -->
        <modal :title="$t('controller.exportBatch')" size="md" v-if="showExportModal" @close="closeExport">
            <div class="export-content">
                <input type="text" class="input" v-model="exportAddress" :placeholder="$t('controller.inputExportEmail')">
            </div>
            <template v-slot:buttons>
                <button class="btn btn-md btn-white" @click.stop="closeExport()" :disabled="!task.materialId">
                    {{'report.cancel' | t}}
                </button>
                <button class="btn btn-md btn-theme" @click.stop="confirmExport()">{{'swarm.confirm' | t}}</button>
            </template>
        </modal>
        <!-- 标签不存在或名称更换的提示弹窗 -->
        <modal :title="$t('common.notice')" size="md" v-if="noLabel" @close="noLabel = false">
            <p class="no-label-prompt">标签库已变更，批次{{labels}}对应的标签不存在。</p>
            <p class="no-label-prompt">请修改个性化素材后重新生成旅程（旅程使用素材的副本，不会随素材修改而更新）。</p>
            <template v-slot:buttons>
                <button class="btn btn-md btn-theme" @click.stop="noLabel = false">{{'swarm.confirm' | t}}</button>
            </template>
        </modal>
    </modal>
</template>

<script type="text/ecmascript-6">
    import cloneDeep from 'lodash/cloneDeep';
    import format from 'date-fns/format';
    import getCursorPosition from '@/common/utils/cursorPositioned';
    import DelayTimePicker from '../components/delay-time-picker.vue';
    import {
        ADD_MILESTONE,
        REMOVE_MILESTONE,
        UPDATE_CONTROLLER,
        UPDATE_SAVE_TASK_STATUS
    } from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {CHECK_JOURNEY_NEW_VERSION, SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import { JourneyApiV1, NikeJourneyV3, ContactApiV1, JourneyMaterialApiV1, GeteOriginApi } from '@/api';
    import EmailControllerMesg from './email-controller-mesg.vue';
    import EmailControllerPes from './email-controller-pes.vue';
    import {TIME_ZONE_RNAGES} from '@/common/utils/timeZone';
    import {EMAIL_ADDRESS_REGEXP} from '@/common/utils/regs.js';
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
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
                    senderId: '',
                    sendName: '',
                    sendAddress: '',
                    sendBehavior: '', // 0 过期停止 1 过期即时
                    mailSubject: '',
                    materialId: '',
                    immediately: '', // 0 等待，1 即时，2 定时
                    sameSubject: false, //是否用统一邮件
                    showGener: false
                },
                today: format(new Date(), 'YYYY-MM-DD'),
                sendAddressList: [], //发件地址
                eimlList: [],
                fields: [], //个性字段
                timeOptions: [
                    {id: 1, name: this.$t('controller.immediate')}, // 即时
                    {id: 0, name: this.$t('controller.after')}, // 等待
                    {id: 2, name: this.$t('controller.absolute')}, // 定时
                ],
                material: {},
                panelShow: false, //详情显示
                pesShow: false, //个性区块设置
                showGener: false, // 生成批次列表
                tasks: [],
                departmentId: '', // 部门ID
                searchType: '', // 0 邮件 1短信 2彩信
                timer: TIME_ZONE_RNAGES,
                batchArr: [],             //导出的邮件批次
                showExportModal: false,   //控制导出邮件批次弹窗显隐
                exportAddress: '',       //导出的邮箱
                noLabel: false,           //控制无标签提示弹窗的显隐
                labels: '',               //已经不存在的标签 以、分隔
                labelIdList: [],          //选中批次的集合，用于检查标签是否存在
                flag: true,               //是否有标签已经删除或更改名称，若有 flag为false
                isExport: true,          //点击确认导出时的节流
            };
        },
        mounted() {
            // prepare this.task for editing
            this.$set(this.$data, 'task', Object.assign({}, this.task, this.controller.pushInfo));
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
            // 发件地址列表
            if (this.roleId === 0 || this.roleId === '') {
                JourneyApiV1
                    .getAddress()
                    .then(({body: {data: {addressList}}}) => {
                        this.sendAddressList = addressList.map((address) => ({
                            id: address.senderId,
                            name: address.sendAddress
                        }));
                    });
            } else {
                GeteOriginApi
                    .getAllSendChannel({
                        departmentId: this.departmentId,
                        searchType: 0,
                    })
                    .then(({body: {data: {sendChannel}}}) => {
                        this.sendAddressList = sendChannel.map(address => ({
                            name: address.sendAddress,
                            id: address.senderId,
                        }));
                    });
            }
            // 获取邮件列表
            JourneyMaterialApiV1
                .getMaterials(
                    '',
                    null,
                    1,
                    6,
                    null
                )
                .then((res) => {
                    this.eimlList = res.body.data.materialList.map((eiml) => ({
                        id: eiml.id,
                        name: eiml.materialName
                    }));
                });
            if (this.controller.pushInfo.materialId) {
                this.refreshMaterial();
            }
            // 判断是否已经生成过批次
            this.getBatchTasked();
        },
        methods: {
            ...mapMutations([
                UPDATE_CONTROLLER,
                UPDATE_SAVE_TASK_STATUS,
                ADD_MILESTONE,
                REMOVE_MILESTONE
            ]),
            ...mapActions([
                CHECK_JOURNEY_NEW_VERSION,
                SAVE_JOURNEY
            ]),
            // 获取邮件地址
            changeSendAddress(address) {
                this.task.senderId = address.id;
                this.task.sendAddress = address.name;
            },
            //获取个性化邮件
            getGroupList(email) {
                if (this.task.mailSubject !== email.id){
                    this.task.mailSubjectId = email.materialName;
                    this.task.mailSubject = email.id;
                    this.task.materialId = email.id;
                    this.showGener = false;
                    this.tasks = [];
                }
            },
            // 测试
            refreshMaterial() {
                if (this.task.materialId) {
                    JourneyMaterialApiV1
                        .getMaterial(this.task.materialId)
                        .then(({body: {data: {material}}}) => {
                            material.journeyId = this.stateID;
                            material.controllerId = this.activeControllerId;
                            this.$set(this.$data, 'material', material);
                        });
                } else {
                    this.$set(this.$data, 'material', {});
                }
            },
            // 弹窗打开关闭
            cancel() {
                this.$emit('close');
            },
            mesgClick() {
                this.$refs.emailMesg.getBatchTask();
            },
            pesClick(id) {
                this.$refs.emailPes.getBatchTask(id);
            },
            close() {
                this.panelShow = false;
            },
            closed() {
                this.pesShow = false;
                this.getBatched();
            },
            // 个性化区块返回信息修改
            getBatched(){
                // 旅程版本检查
                this.CHECK_JOURNEY_NEW_VERSION()
                    .then(() => {
                        NikeJourneyV3
                            .getBatchTask(this.stateID,this.activeControllerId,false)
                            .then(({body:{data:{task}}}) => {
                                for (let i = 0;i < this.tasks.length; i++){
                                    this.tasks[i].blockNames = task.taskDetailsDTOS[i].blockNames;
                                }
                                let controller = cloneDeep(this.controller);
                                Object.assign(controller.tasks, this.task, task);
                                this.UPDATE_CONTROLLER(controller);
                                this.SAVE_JOURNEY(false);
                            });
                    })
                    .catch(() => {
                        this.UPDATE_SAVE_TASK_STATUS(false);
                    });
            },
            // 统一邮件
            checkedOk(index) {
                if (this.task.sameSubject === true && index === 0) {
                    for (let t = 0;t < this.tasks.length; t++){
                        this.tasks[t].mailSubject = this.tasks[0].mailSubject;
                    }
                }
            },
            //时间定义
            setTime(index) {
                this.tasks[index].taskDate = this.tasks[index].taskDay + ' ' + this.tasks[index].taskHourAndMinute;
            },
            toggleImmediately(index,value) {
                this.tasks[index].taskHourAndMinute = value;
                this.$set(this.tasks,index,this.tasks[index]);
            },
            // 导出邮件批次
            exportBatch() {
                this.batchArr = [];
                for (let i = 0;i < this.tasks.length; i++){
                    if (this.tasks[i].sendFlag === true || this.tasks[i].sendFlag === 1){
                        this.tasks[i].sendFlag = 1;
                        // 定时旅程
                        if (this.journeyInformation.journeyType !== 2) {
                            // 绝对时间校验
                            if (this.timeType === 0) {
                                // 年月日、小时、分钟都必填
                                if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(this.tasks[i].taskDate)) {
                                    this.$toast(this.$t('controller.taskDate'), 'warn');
                                    return;
                                }
                                // 清空相对时间设置
                                this.task.relativeTime = '';
                            }

                            // 相对时间校验
                            if (this.timeType === 1) {
                                // 相对时间的天数、小时、分钟都必填
                                if (this.task[i].days === '' || !/^\d{2}:\d{2}$/.test(this.tasks[i].relativeTime)) {
                                    this.$toast(this.$t('controller.taskDate'), 'warn');
                                    return;
                                }

                                // 清空绝对时间设置
                                this.task[i].taskDate = '';
                            }
                        } else {
                            // 实时旅程
                            if (this.task.immediately === 2) {
                                // 定时发送
                                // 年月日、小时、分钟都必填
                                if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(this.tasks[i].taskDate)) {
                                    this.$toast(this.$t('controller.taskDate'), 'warn');
                                    return;
                                }
                                // 过期行为设置
                                if (this.task[i].sendBehavior !== 0 && this.tasks[i].sendBehavior !== 1) {
                                    this.$toast(this.$t('controller.expireBehavior'), 'warn');
                                    return;
                                }
                            }
                        }

                    } else {
                        this.tasks[i].sendFlag = 0;
                    }
                }
                this.tasks.forEach((item, index) => {
                    if (item.sendFlag) {
                        this.batchArr.push({
                            id: index + 1,
                            mailSubject: item.mailSubject,
                            taskDate: item.taskDate,
                            taskName: item.taskName,
                        });
                    }
                });
                this.showExportModal = true;
            },
            // 关闭导出邮件批次弹窗
            closeExport() {
                this.showExportModal = false;
                this.exportAddress = '';
            },
            // 确认导出邮件批次
            confirmExport() {
                if (!this.exportAddress) {
                    this.$toast(this.$t('controller.inputExportEmail'), 'warn');
                    return false;
                }
                if (!EMAIL_ADDRESS_REGEXP.test(this.exportAddress)) {
                    this.$toast(this.$t('dataCenter.emailFormatError'), 'warn');
                    return false;
                }
                if (this.isExport) {
                    this.isExport = false;
                    this.$loading();
                    NikeJourneyV3.exportEmailBatch(this.exportAddress, this.batchArr)
                        .then(() => {
                            this.showExportModal = false;
                            this.exportAddress = '';
                            this.isExport = true;
                            this.$loaded();
                            this.$toast(this.$t('report.exportSuccess'), 'success');
                        })
                        .catch(() => {
                            this.showExportModal = false;
                            this.exportAddress = '';
                            this.isExport = true;
                            this.$loaded();
                            this.$toast('导出失败', 'warn');
                        });
                }

            },
            // 保存提交
            confirm() {
                if (this.onPending) {
                    this.$toast(this.$t('dragJourney.delayOperate'),'warn');
                    return;
                }
                this.flag = true;
                this.labels = '';
                this.labelIdList = [];
                if (this.task.taskName === '' || this.task.taskName === null || this.task.sendAddress === '' || this.task.sendName === '' ||
                 this.task.sendOutId === '' || this.task.senderId === '') {
                    this.$toast(this.$t('controller.conditionsAllWarn'), 'warn');
                    return;
                }
                for (let i = 0;i < this.tasks.length; i++){
                    if (this.tasks[i].sendFlag === true || this.tasks[i].sendFlag === 1){
                        this.labelIdList.push({
                            id: this.tasks[i].tagId,
                            name: this.tasks[i].taskName,
                            number: i + 1
                        });
                        this.tasks[i].sendFlag = 1;
                        // 定时旅程
                        if (this.journeyInformation.journeyType !== 2) {
                            // 绝对时间校验
                            if (this.timeType === 0) {
                                // 年月日、小时、分钟都必填
                                if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(this.tasks[i].taskDate)) {
                                    this.$toast(this.$t('controller.taskDate'), 'warn');
                                    return;
                                }
                                // 清空相对时间设置
                                this.task.relativeTime = '';
                            }

                            // 相对时间校验
                            if (this.timeType === 1) {
                                // 相对时间的天数、小时、分钟都必填
                                if (this.task[i].days === '' || !/^\d{2}:\d{2}$/.test(this.tasks[i].relativeTime)) {
                                    this.$toast(this.$t('controller.taskDate'), 'warn');
                                    return;
                                }

                                // 清空绝对时间设置
                                this.task[i].taskDate = '';
                            }
                        } else {
                            // 实时旅程
                            if (this.task.immediately === 2) {
                                // 定时发送
                                // 年月日、小时、分钟都必填
                                if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(this.tasks[i].taskDate)) {
                                    this.$toast(this.$t('controller.taskDate'), 'warn');
                                    return;
                                }
                                // 过期行为设置
                                if (this.task[i].sendBehavior !== 0 && this.tasks[i].sendBehavior !== 1) {
                                    this.$toast(this.$t('controller.expireBehavior'), 'warn');
                                    return;
                                }
                            }
                        }

                    } else {
                        this.tasks[i].sendFlag = 0;
                    }
                }
                ContactApiV1.labelCheck(this.labelIdList)
                    .then(res => {
                        let labelArr = res.body.data.labelList;
                        if (!labelArr.length) {
                            this.flag = true;
                        } else {
                            for (let i = 0; i < labelArr.length; i++) {
                                if (labelArr[i].type !== 1) {
                                    this.flag = false;
                                    this.labels += labelArr[i].number + '、';
                                }
                                if (i === labelArr.length - 1) {
                                    if (!this.flag) {
                                        this.labels = this.labels.slice(0, this.labels.length - 1);
                                        this.noLabel = true;
                                    }
                                }
                            }
                        }
                        if (this.flag) {
                            let activeControllerId = this.activeControllerId;
                            this.UPDATE_SAVE_TASK_STATUS(true);
                            // 旅程版本检查
                            this.CHECK_JOURNEY_NEW_VERSION()
                                .then(() => {
                                    // 更新里程碑设置
                                    this.commitMilestone();
                                    this.tasks.forEach(item => {
                                        item.taskDate = item.taskDay + ' ' + item.taskDate.split(' ')[1];
                                    });
                                    // 更新任务
                                    NikeJourneyV3
                                        .modifyBatchTask(
                                            activeControllerId,
                                            // this.task.excerpta,
                                            '摘要',
                                            this.stateID,
                                            this.task.materialId,
                                            this.task.prepositionTaskId,
                                            false,
                                            this.task.sendAddress,
                                            // this.task.sendBehavior,
                                            0,
                                            this.task.sendName,
                                            this.task.sendOutId,
                                            this.task.senderId,
                                            this.task.taskName,
                                            this.tasks
                                        )
                                        .then(() => {
                                            this.UPDATE_SAVE_TASK_STATUS(false);
                                            let controller = cloneDeep(this.controller);
                                            this.task.taskDetailsDTOS = this.tasks;
                                            Object.assign(controller.tasks, this.task);
                                            controller.name = this.task.taskName;
                                            controller.pushInfo.taskName = this.task.taskName;
                                            controller.tasks.sameSubject = this.task.sameSubject;
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
                        }
                    });
            },
            // 个性区块区间
            insertField(e,index) {
                let targetPos = getCursorPosition(this.$refs.mailSubjectInput,index);
                let content = [...this.tasks[index].mailSubject];
                if (content.length + ('{$' + e.name + '}').length > 100) {
                    this.$toast(this.$t('controller.emailTitleWarn'), 'warn');
                    return false;
                }
                content.splice(targetPos, 0, '{$' + e.name + '}');
                this.tasks[index].mailSubject = content.join('');
                if (this.task.sameSubject === true) {
                    this.checkedOk(0);
                }
            },
            commitMilestone() {
                if (this.isAMileStone !== this.milestone) {
                    this.milestone ? this.ADD_MILESTONE(this.controller.id) : 
                        this.REMOVE_MILESTONE(this.controller.id);
                }
            },

            // 详情显示
            showPanel() {
                this.panelShow = true;
                this.mesgClick();
            },
            // 个性区块设置
            showPes(id){
                this.pesShow = true;
                this.pesClick(id);
            },
            //生成批次
            generate() {
                if (this.task.taskName === '' || this.task.taskName === null || this.task.sendAddress === '' || this.task.sendName === '' ||
                this.task.senderId === '' || this.task.materialId === '') {
                    this.$toast(this.$t('controller.conditionsAllWarn'), 'warn');
                    return;
                }
                // 旅程版本检查
                this.CHECK_JOURNEY_NEW_VERSION()
                    .then(() => {
                        // 生成批次任务
                        NikeJourneyV3
                            .selBatchTask(
                                this.stateID,
                                this.activeControllerId,
                                this.task.materialId,
                                this.task.sendAddress,
                                this.task.sendName,
                                this.task.senderId,
                                this.task.taskName,
                                0
                            )
                            .then(({body: {data:{task}}}) => {
                                this.tasks = task.taskDetailsDTOS;
                                this.showGener = true;
                                this.getBatchTask();
                            });
                    })
                    .catch(() => {
                        this.UPDATE_SAVE_TASK_STATUS(false);
                    });
            },
            // 获取批次任务详情信息
            getBatchTask(){
                NikeJourneyV3
                    .getBatchTask(this.stateID, this.activeControllerId, false)
                    .then(({body: {data: {task}}}) => {
                        task.taskName = this.task.taskName;
                        task.mailSubject = this.task.mailSubject;
                        task.sameSubject = this.task.sameSubject;
                        task.materialId = this.task.materialId;
                        task.showGener = true;
                        this.task = task;
                        for (let i = 0; i < task.taskDetailsDTOS.length; i++) {
                            if (task.taskDetailsDTOS[i].sendFlag === 1) {
                                task.taskDetailsDTOS[i].sendFlag = true;
                            } else {
                                task.taskDetailsDTOS[i].sendFlag = false;
                            }
                            if (task.taskDetailsDTOS[i].taskName.length > 7) {
                                task.taskDetailsDTOS[i].taskNameNum = task.taskDetailsDTOS[i].taskName.substring(0, 5) + '...';
                            } else {
                                task.taskDetailsDTOS[i].taskNameNum = task.taskDetailsDTOS[i].taskName;
                            }
                        }
                        this.tasks = task.taskDetailsDTOS.map(item => {
                            item.taskDay = '';
                            item.taskHourAndMinute = '00:00';
                            return item;
                        });
                        let controller = cloneDeep(this.controller);
                        Object.assign(controller.tasks, this.task);
                        this.UPDATE_CONTROLLER(controller);
                        this.SAVE_JOURNEY(false);
                    });
            },
            //初始化判断
            getBatchTasked() {
                let controller = cloneDeep(this.controller);
                if (controller.tasks.mailSubject === undefined){
                    this.task.mailSubject = controller.pushInfo.materialId;
                }
                if (controller.tasks.showGener === true){
                    NikeJourneyV3
                        .getBatchTask(this.stateID,this.activeControllerId,false)
                        .then(({body:{data:{task}}}) => {
                            this.showGener = true;
                            task.taskName = this.task.taskName;
                            task.mailSubject = controller.tasks.mailSubject;
                            task.materialId = this.task.materialId;
                            if (controller.tasks.sameSubject === null) {
                                task.sameSubject = false;
                            } else {
                                task.sameSubject = controller.tasks.sameSubject;
                            }
                            this.task = task;
                            for (let i = 0;i < task.taskDetailsDTOS.length; i++){
                                if (task.taskDetailsDTOS[i].sendFlag === 1){
                                    task.taskDetailsDTOS[i].sendFlag = true;
                                } else {
                                    task.taskDetailsDTOS[i].sendFlag = false;
                                }
                                if (task.taskDetailsDTOS[i].taskDate !== '' && task.taskDetailsDTOS[i].taskDate != null) {
                                    task.taskDetailsDTOS[i].taskDay = task.taskDetailsDTOS[i].taskDate.split(' ')[0];
                                    task.taskDetailsDTOS[i].taskHourAndMinute = task.taskDetailsDTOS[i].taskDate.split(' ')[1];
                                }
                                if (task.taskDetailsDTOS[i].taskName.length > 7){
                                    task.taskDetailsDTOS[i].taskNameNum = task.taskDetailsDTOS[i].taskName.substring(0,5) + '...';
                                } else {
                                    task.taskDetailsDTOS[i].taskNameNum  = task.taskDetailsDTOS[i].taskName;
                                }
                            }
                            this.tasks = task.taskDetailsDTOS;
                        });
                }
            },
        },
        computed: {
            ...mapGetters(['onPending']),
            ...mapState({
                isAMileStone(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation
                        .milestones.includes(this.controller.id);
                },
                validationResult: state => state[DRAGGABLE_JOURNEY_STORE_NAME].validationResult,
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                stateID: state => state.canvasStore.journeyInformation.id,
                activeControllerId: state => state.canvasStore.activeControllerId,
                roleId: state => state.user.roleId
            }),
            unsubscribeLinkMissing() {
                return this.material.materialContent
                    && !this.material.materialContent.includes('{$PLUGINLINK=unsubscribe}');
            },
            timeType() {
                // 0 绝对时间; 1 相对时间
                return this.journeyInformation.timeType;
            },
            // 是否可以导出批次（若无选中批次则不能导出）
            ifCanExport() {
                let flag = true;
                if (!this.tasks.length) {
                    flag = true;
                    return flag;
                }
                for (let i = 0; i < this.tasks.length; i++) {
                    if (this.tasks[i].sendFlag === true || this.tasks[i].sendFlag === 1) {
                        flag = false;
                    }
                    if (i === this.tasks.length - 1) {
                        return flag;
                    }
                }
            }
        },
        components: { DelayTimePicker,EmailControllerMesg,EmailControllerPes}
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
        .generateBatch{
            width: 155px;
            height: 35px;
            background-color: #888;
            text-align: center;
            line-height: 35px;
            color: #fff;
            cursor: pointer;
            border-radius: 2px;
            box-shadow: 0 0 2px #f4f4f4;
        }

        .serial-number {
            width: 60px;
        }
        .labelOne,.labelA{
            width: 115px;
        }
        .labelTwo,.labelB{
            width: 295px;
        }
        .labelThree,.labelC{
            width: 410px;
        }
        .right{
            width: auto;
            height: auto;
        }
        .labelD{
            float: left;
            .field-group .calendar {
                margin-top: 10px;
            }
        }
        .calendar{
            width: 120px;
            margin: 10px 3px 0 0;
        }
        .hour-minute-select{
            margin: 9px 0 0 0;
        }
        .peo .selector{
            width: 258px;
        }
        .labelC .selector{
            width: 100px;
        }
        .labelC .input.lg{
            width: 23em;
        }
        .labelC .mesg .input.lg{
            width: calc(23em + 122px);
            margin: 10px 0 0 0;
            padding-right: 30px;
            box-sizing: border-box;
        }
        .labelC .mesg .input.lg:disabled{
            background-color: #fff;
        }
        .mesg{
            position: relative;
        }
        .iconed{
            position: absolute;
            top: 16px;
            right: 22px;
            display: block;
            width: 22px;
            height: 21px;
            cursor: pointer;
            text-align: center;
            line-height: 21px;
        }
        .see{
            width: 20px;
            height: 20px;
            float: left;
            margin: 27px 0 0 0;
            cursor: pointer;
            text-align: center;
            line-height: 20px;
        }
        .checkedOks{
            display: inline-block;
        }
    }

    .export-btn {
        margin-top: 7px;
    }

    .export-content {
        display: flex;
        justify-content: center;

        input {
            width: calc(23em + 122px);
        }
    }

    .no-label-prompt {
        font-size: 15px;
        line-height: 30px;
    }

</style>
