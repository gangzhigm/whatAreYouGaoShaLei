<template>
    <modal class="wechat-controller-form" :title="title" size="lg" @close="cancel()">
        <p v-if="controller.id===validationResult.errorId" class="error-message">
            {{validationResult.errorMessage}}
        </p>
        <div class="form-field flex">
            <label class="label" for="taskName">{{$t('controller.step_title')}}</label>
            <span v-if="isChecking">{{task.taskName}}</span>
            <div v-else class="field-group">
                <input maxlength="200" type="text" v-model.trim="task.taskName" id="taskName" class="input xl">
            </div>
        </div>
        <div class="form-field flex timer">
            <template v-if="this.journeyInformation.journeyType === 2">
                <label class="label">{{$t('controller.send_wait')}}</label>
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
                        <radio :source="0" v-model="sendBehavior">
                            {{'controller.stopWhenExpired' | t}}
                        </radio>
                        <radio :source="1" v-model="sendBehavior">
                            {{'controller.realTimeWhenExpired' | t}}
                        </radio>
                        <i class="action-icon icon icon-help" v-title:bottom="$t('controller.expireTip')"></i>
                        <p>{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
                    </template>
                </div>
            </template>
            <template v-else>
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
            </template>
        </div>
        <!--公众号-->
        <div class="form-field">
            <label class="label placeholder">{{'template.wechatAccount' | t}}</label>
            <span v-if="isChecking">{{accountName}}</span>
            <selector v-else class="lg" :options="publicAccountList" v-model="task.authorizerInfoId"
                      @select="selectAccount"/>
        </div>
        <div class="form-field" v-if="journeyInformation.journeyType === 2">
            <label class="label placeholder"></label>
            <checkbox v-model="milestone" :disabled="isChecking">{{'controller.set_milestone' | t}}</checkbox>
            <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
        </div>
        <!-- 模版消息素材选项 -->
        <div v-if="controller.pushInfo.wechatType==='template'" class="form-field flex"
             :class="{noStone:journeyInformation.journeyType !== 2}">
            <!-- 这里 微信模版 -->
            <span class="label">{{$t('controller.wechat_template_content')}}</span>
            <div class="field-group">
                <material-store :show-btn="!isChecking" v-model="task.materialId" type="template" ref="materialStore"
                                :writable="writable" :is-checking="isChecking" :official-id="officialId"
                                :officialList="publicAccountList" :status-approve="statusApprove"></material-store>
            </div>
        </div>
        <!-- 其他类型微信消息素材选项 -->
        <template v-else>
            <!-- 非原创图文消息处理 仅限群发消息-图文消息 -->
            <div class="form-field non-original" v-if="controller.pushInfo.wechatType === 'picText'">
                <span>{{$t('controller.nonOriginal')}}</span>
                <span class="icon icon-yiwen1"
                      v-title:right="this.$t('controller.graphicRules')+this.$t('controller.detailUrl')"></span>
                <div class="field-group original-rule">
                    <span class="rule">
                        {{'controller.originalRule' | t}}
                    </span>
                    <div>
                        <radio :disabled="isChecking" :source="1" v-model="groupSending">
                            {{'controller.continueSend' | t}}
                        </radio>
                        <br>
                        <radio :disabled="isChecking" :source="0" v-model="groupSending">
                            {{'controller.stopSend' | t}}
                        </radio>
                    </div>
                </div>
            </div>
            <!--消息素材详情-->
            <div class="form-field flex">
                <!-- 素材label -->
                <span class="label">{{materialType}}</span>
                <!-- 素材编辑器 -->
                <div class="field-group">
                    <!-- 原图文消息（群发消息/客服消息）旧素材选择器 -->
                    <div v-if="controller.pushInfo.subType === 0 || controller.pushInfo.subType === 1"
                         class="wechat-content">
                        <!--提示-->
                        <p class="notice-text"
                           v-if="!waitRefresh && !materialStoreShow && controller.pushInfo.wechatType === 'service'">
                            <i class="icon icon-tixing"></i>
                            {{'controller.WeChatTips' | t}}
                            <a class="action-text"
                               href="https://mp.weixin.qq.com/cgi-bin/announce?action=getannouncement&announce_id=115383153198yAvN&version=&lang=en_US&token="
                               rel="noopener" target="_blank">
                                {{'controller.WeChatOfficial' | t}}
                            </a>
                        </p>
                        <!--添加素材-->
                        <template v-if="!waitRefresh && !materialStoreShow">
                            <!--编辑模式-->
                            <template v-if="!isChecking">
                                <div class="select-material"
                                     @click.stop="browseMaterialList()">
                                    <img src="../select-material.png" alt="select-material">
                                    {{'controller.choose_a_material'|t}}
                                </div>
                                <div class="add-material" @click.stop="goCreatMaterial()">
                                    <img src="../add-material.png" alt="add-material"
                                         :class="{'isDisabled':$has('wechat_material_add_news')}">
                                    {{'controller.create_a_material' | t}}
                                </div>
                            </template>
                            <!--查看模式-->
                            <span v-else>{{'common.noData' | t}}</span>
                        </template>
                        <!--刷新-->
                        <template v-if="waitRefresh && !materialStoreShow">
                            <!--编辑模式-->
                            <div v-if="!isChecking" class="refresh"
                                 @click.stop="browseMaterialLists()">
                                <img src="../refresh.png" alt="refresh">{{'controller.refreshLoad' | t}}
                            </div>
                            <!--查看模式-->
                            <span v-else>{{'common.noData' | t}}</span>
                        </template>

                        <new-material-store v-show="materialStoreShow"
                                            v-model="task.materialId"
                                            type="wechat"
                                            ref="materialStore"
                                            :wechat-type="controller.pushInfo.wechatType"
                                            @reset="deleteMaterial()" @goMaterial="goWechatMaterial"
                                            @chooseAgain="deleteMaterial" :show-btn="!isChecking" :writable="writable"
                                            :officialId="officialId"
                                            :is-checking="isChecking" :status-approve="statusApprove"></new-material-store>
                    </div>
                    <div v-else class="wechat-content">
                        <inline-loading v-if="materialLoading"/>
                        <material-editor v-else
                                         v-model="material"
                                         :is-checking="isChecking"
                                         :types="[editorType]"
                                         :official-id="officialId"
                                         :key="materialKey"
                                         for-journey-use
                                         :panelNotice="controller.pushInfo.subType === 10 ? $t('QRCode.notOutLink') : ''"
                                         :mpnewsType="controller.pushInfo.wechatType === 'picText' ? 1 : 2"
                                         ref="materialEditor"/>
                        <!-- 素材预览工具，和已有素材组件功能重复，暂时冻结 -->
                        <!-- <template v-if="['pics', 'audio', 'video', 'mdPics', 'mdAudio', 'mdVideo'].includes(controller.pushInfo.wechatType)">
                            <div class="btn-icon-group">
                                <button type="button" class="icon icon-pencil" v-title:top="$t('common.edit')" />
                                <button type="button" class="icon icon-reset"
                                        v-title:top="$t('journey.reselect')" />
                                <button type="button" class="icon icon-delete"
                                        v-title:top="$t('common.del')" />
                            </div>
                        </template> -->
                    </div>
                    <!-- <p class="light-content-text">{{$t('controller.email_journey_warn')}}</p> -->
                </div>
            </div>
        </template>

        <template-test-modal v-if="testTemplateModalOpen" :controller="controller"
                             :material-id="task.materialId"
                             @close="testTemplateModalOpen = false"/>

        <template v-if="!isChecking" v-slot:buttons>
            <span v-if="noPicTextTest" class="no-pictext-cap">{{noPicTextTest}}</span>
            <button v-if="!noPicTextTest" class="btn btn-md btn-white" @click.stop="testMaterial" :disabled="disableTest">
                {{'material.test' | t}}
            </button>
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
    import MaterialStore from '../../../../calendar/components/material-store.vue';
    import NewMaterialStore from './newMaterial-stores.vue';
    import TemplateTestModal from './temp-test-modal.vue';
    import DelayTimePicker from '../components/delay-time-picker.vue';
    import { JourneyApiV3, WechatApiV1 } from '@/api';
    import {
        ADD_MILESTONE,
        REMOVE_MILESTONE,
        UPDATE_CONTROLLER,
        UPDATE_SAVE_TASK_STATUS,
        UPDATE_USER_INFO
    } from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME, uniqId} from '@/store/vuex/modules/canvasStore';
    import {CHECK_JOURNEY_NEW_VERSION, SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import {logError} from '../../../../../../monitor';
    import {TIME_ZONE_RNAGES, timeZoneToday} from '@/common/utils/timeZone';
    import {USER_INFO_SESSION_KEY} from '@/store/vuex/rootStore';
    import MaterialText from '@/wechat/material/material-editor-componets/material-text.vue';
    import MaterialEditor from '@/wechat/material/material-editor.vue';
    import {materialMapper, materialReMapper, resetMaterial} from '@/journey/draggable-form/utils/configHandler';
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';

    export default {
        props: {
            controller: Object
        },
        data() {
            return {
                milestone: 0,
                materialStoreShow: false,
                waitRefresh: false,
                task: {
                    taskId: null,
                    taskName: '',
                    materialId: null,
                    sendBehavior: '', // 0 过期停止 1 过期即时
                    immediately: '', // 0 等待，1 即时，2 定时
                    days: '',
                    relativeTime: '',
                    taskDate: '',
                    groupSending: '',//1:继续群发；0：停止群发
                    authorizerInfoId: '',
                },
                timeOptions: [
                    {id: 1, name: this.$t('controller.immediate')}, // 即时
                    {id: 0, name: this.$t('controller.after')}, // 等待
                    {id: 2, name: this.$t('controller.absolute')}, // 定时
                ],
                testTemplateModalOpen: false,    // 模板测试弹出层
                timer: TIME_ZONE_RNAGES,
                groupSending: 0,//1:继续群发；0：停止群发
                publicAccountList: [], // 公众号列表
                publicAccount: {}, // 公众号
                officialId: null,       // 公众号id
                accountName: '',      // 查看时显示选中的公众号名称
                material: {},
                materialLoading: true,
                previewMode: false,
                materialKey: 0, //给组件添加唯一key值 为避免文字组件切换时文字不清空
            };
        },
        computed: {
            ...mapGetters(['onPending']),
            ...mapState({
                // 旅程左侧选中的公众号
                panelAccountId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].authorizerInfoId,
                validationResult: state => state[DRAGGABLE_JOURNEY_STORE_NAME].validationResult,
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                isAMileStone(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation
                        .milestones.includes(this.controller.id);
                },
                isChecking: state => state[DRAGGABLE_JOURNEY_STORE_NAME].isChecking,
                readonlyIds: state => state[DRAGGABLE_JOURNEY_STORE_NAME].readonlyControllerIds,
                roleId: state => state.user.roleId,
                user: state => state.user
            }),
            //默认选中的公众号
            account() {
                return this.publicAccountList.filter(account => account.id === this.task.authorizerInfoId)[0];
            },
            title() {
                let title = this.controller.name;
                if (title) return title;
                if (this.controller.pushInfo.wechatType === 'template') {
                    return this.$t('controller.send_wechat_template');
                } else if (this.controller.pushInfo.wechatType === 'service') {
                    return this.$t('controller.send_wechat_message');
                }
                return this.$t('controller.WeChatGraphic');
            },
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
                    if (!this.task.taskDate) {
                        this.task.taskDate = this.defaultTaskDay;
                    }
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
                        return this.task.taskDate ? this.task.taskDate.split(' ')[1] : '';
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
            },
            writable() {
                // 旅程可编辑，且控件ID不在 readonlyIds 中
                return this.$store.getters.journeyWritable && !this.readonlyIds.includes(this.controller.id);
            },
            // 当前素材类型
            materialType() {
                // 5图文 4文本 1图片 2语音 3视频 6外部页 7表单 8小程序卡片
                switch (this.controller.pushInfo.wechatType) {
                    case 'picText':
                    case 'service':
                        return this.$t('controller.image_text_content');
                    case 'pics':
                    case 'mdPics':
                        return this.$t('wechatContent.imgMaterial');
                    case 'audio':
                    case 'mdAudio':
                        return this.$t('wechatContent.audioMaterial');
                    case 'video':
                    case 'mdVideo':
                        return this.$t('wechatContent.videoMaterial');
                    case 'sheet':
                    case 'mdSheet':
                        return this.$t('wechatContent.textContent');
                    case 'external':
                        return this.$t('wechatContent.urlOptions');
                    case 'form':
                        return this.$t('wechatContent.formOptions');
                    case 'miniProgramCard':
                        return this.$t('wechatContent.miniOptions');
                }
            },
            editorType() {
                // 将 旅程模块 定义的素材类型转换为 微信模块 的素材类型
                // 5 图文 text文本 1图片 2语音 3视频 6外部页 7表单 8小程序卡片
                switch (this.controller.pushInfo.wechatType) {
                    case 'picText':
                    case 'service':
                        return 5;
                    case 'pics':
                    case 'mdPics':
                        return 1;
                    case 'audio':
                    case 'mdAudio':
                        return 2;
                    case 'video':
                    case 'mdVideo':
                        return 3;
                    case 'sheet':
                    case 'mdSheet':
                        return 'text';
                    case 'external':
                        return 6;
                    case 'form':
                        return 7;
                    case 'miniProgramCard':
                        return 8;
                    default:
                        return -1;
                }
            },
            // 群发消息-图文消息：屏蔽测试按钮并提示
            noPicTextTest() {
                let tip = '';
                if (this.controller.pushInfo.wechatType === 'picText') tip = this.$t('controller.wechatNotSupportTest');
                return tip;
            },
            // 禁用测试按钮
            disableTest() {
                switch (this.controller.pushInfo.wechatType) {
                    case 'picText':
                    case 'service':
                    case 'pics':
                    case 'mdPics':
                    case 'audio':
                    case 'mdAudio':
                    case 'video':
                    case 'mdVideo':
                    case 'template':
                        return !this.task.materialId;
                    case 'sheet':
                    case 'mdSheet':
                    case 'external':
                    case 'form':
                    case 'miniProgramCard':
                        return false;
                    default:
                        return false;
                }
            },
            // 旅程待审批状态
            statusApprove() {
                return this.journeyInformation.journeyStatus === 9;
            },
            // 定时旅程-默认任务时间 当前时区的时间 + 5 分钟
            defaultTaskDay() {
                let date = new Date(timeZoneToday(this.journeyInformation.timeZone));
                let min = date.getMinutes();
                date.setMinutes(min + 5);
                return format(date, 'YYYY-MM-DD HH:mm');
            },
            // 发送行为计算属性
            sendBehavior: {
                get: function() {
                    return this.task.sendBehavior;
                },
                set: function(val) {
                    this.task = Object.assign({}, this.task, { sendBehavior: val });
                }
            }
        },
        watch: {
            material: {
                handler: function () {
                    this.$nextTick(() => {
                        const config = materialMapper(this.controller.pushInfo.wechatType, this.material);
                        this.task = Object.assign(this.task, config);
                    });
                },
                deep: true
            }
        },
        created() {
            // prepare this.task for editing
            this.$set(this.$data, 'task', Object.assign({}, this.controller.pushInfo));
            this.task.days === null && (this.task.days = '');
            !this.task.taskName && (this.task.taskName = this.controller.name);
            // 0 等待，1即时，2定时
            this.task.immediately = ~~this.task.immediately;

            // prepare milestone for editing
            this.milestone = this.isAMileStone;

            this.groupSending = this.task.groupSending ? this.task.groupSending : 0;

            this.fetchAccountList();
        },
        methods: {
            ...mapActions([
                CHECK_JOURNEY_NEW_VERSION,
                SAVE_JOURNEY
            ]),
            ...mapMutations([
                UPDATE_SAVE_TASK_STATUS,
                ADD_MILESTONE,
                REMOVE_MILESTONE,
                UPDATE_CONTROLLER,
                UPDATE_USER_INFO
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

                        // 查看时显示选中的公众号名称
                        if (this.isChecking) this.accountName = this.getAccountName(this.task.authorizerInfoId);

                        // 公众号列表
                        if (this.publicAccountList.length <= 0) {
                            this.task.authorizerInfoId = null;
                            // 重新选择素材
                            this.deleteMaterial();
                            this.resetMaterials();
                            this.$toast(this.$t('controller.permissionDenied'), 'warn');
                        } else {
                            // 任务控件的公众号id不在公众号列表里
                            let getAccount = this.publicAccountList
                                .filter(account => account.id === this.task.authorizerInfoId)[0];
                            if (!getAccount) {
                                this.task.authorizerInfoId = null;
                                // 重新选择素材
                                this.deleteMaterial();
                                this.resetMaterials();

                                // 主账号
                                let mainAccount = this.roleId === 0 || this.roleId === '';
                                this.$toast(this.$t(mainAccount
                                    ? 'controller.unboundAccount'
                                    : 'controller.permissionDenied'), 'warn');
                            } else {
                                this.publicAccount = getAccount;
                                this.officialId = this.publicAccount.id;
                            }

                            // 图文消息自动选中素材
                            if (this.publicAccount.id) {
                                const {pushInfo} = this.controller;
                                if (['picText', 'service'].includes(pushInfo.wechatType)) {
                                    // 图文素材单独处理
                                    if (pushInfo.materialId) {
                                        this.browseMaterialList();
                                        this.$refs.materialStore.autoChooseMaterial(pushInfo.materialId);
                                    }
                                } else {
                                    materialReMapper(pushInfo)
                                        .then(config => {
                                            this.material = Object.assign({}, config);
                                            this.material.miniprogramId = pushInfo.miniProgramId;
                                            this.materialLoading = false;
                                        });
                                }
                            }
                        }
                    });
            },
            /**
             * 选择公众号
             * @param account
             */
            selectAccount(account) {
                this.materialKey = uniqId();
                if (this.publicAccount && this.publicAccount.id === account.id) return;
                this.publicAccount = account;
                this.officialId = this.publicAccount.id;
                this.task.authorizerInfoId = this.publicAccount.id;
                this.task.authorizerInfoName = this.publicAccount.name;
                this.task.wechatAppid = this.publicAccount.WxAppId;
                // 切换公众号重新选择素材
                this.deleteMaterial();
                this.resetMaterials();
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
                        this.task.sendBehavior = 0;
                        break;
                    default:
                        logError('不能识别的 task.immediately: ' + immediately);

                }
            },
            cancel() {
                this.deleteMaterial();
                this.$emit('close');
            },
            confirm() {
                if (this.onPending) {
                    this.$toast(this.$t('dragJourney.delayOperate'),'warn');
                    return;
                }
                if (!this.task.taskName) {
                    this.$toast(this.$t('journey.taskNameNotEmpty'), 'warn');
                    return false;
                }
                // 编辑已经解绑的公众号生成的控件时，强制要求重新选择公众号
                if (!this.task.authorizerInfoId) {
                    this.$toast(this.$t('sendChannel.selectAccount'), 'warn');
                    return;
                }
                // 定时旅程
                if (this.journeyInformation.journeyType !== 2) {
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
                } else {
                    // 实时旅程
                    if (this.task.immediately === 2) {
                        // 定时发送
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
                if (![0, 1, 2].includes(this.controller.pushInfo.subType)) {
                    if (!this.$refs.materialEditor.validAll()) return false;
                }
                // 旅程版本检查
                this.CHECK_JOURNEY_NEW_VERSION()
                    .then(() => {
                        // 更新里程碑设置
                        if (this.isAMileStone !== this.milestone) {
                            this.milestone ? this.ADD_MILESTONE(this.controller.id) : 
                                this.REMOVE_MILESTONE(this.controller.id);
                        }
                        //群发：picText  客服：service 模版消息：template
                        if (this.controller.pushInfo.wechatType === 'picText') {
                            this.task.groupSending = this.groupSending;
                        }
                        // 更新任务
                        this.updateJourneyTask();
                    })
                    .catch(() => {
                        this.UPDATE_SAVE_TASK_STATUS(false);
                    });
                this.cancel();
                this.task.groupSending = '';
            },
            // 更新任务
            updateJourneyTask() {
                this.UPDATE_SAVE_TASK_STATUS(true);
                JourneyApiV3
                    .updateTask(this.task)
                    .then(({body: {data: {task}}}) => {
                        this.UPDATE_SAVE_TASK_STATUS(false);
                        let controller = cloneDeep(this.controller);
                        Object.assign(controller.pushInfo, this.task, task);
                        controller.name = this.task.taskName;
                        controller.authorizerInfoId = this.publicAccount.id;

                        controller.pushInfo.authorizerInfoId = this.publicAccount.id;
                        controller.pushInfo.authorizerInfoName = this.publicAccount.name;
                        controller.pushInfo.wechatAppid = this.publicAccount.WxAppId;
                        controller.pushInfo.miniProgramId = this.material.miniprogramId;

                        controller.tasks.authorizerInfoId = this.publicAccount.id;
                        controller.tasks.authorizerInfoName = this.publicAccount.name;
                        controller.tasks.wechatAppid = this.publicAccount.WxAppId;
                        this.UPDATE_CONTROLLER(controller);
                        this.SAVE_JOURNEY(false);
                    })
                    .catch(() => {
                        this.UPDATE_SAVE_TASK_STATUS(false);
                    });
            },
            goWechatMaterial() {
                this.waitRefresh = true;
                this.materialStoreShow = false;
            },
            deleteMaterial() {
                this.materialStoreShow = false;
                this.waitRefresh = false;
            },
            goCreatMaterial() {
                if (this.$has('wechat_material_add_news')) return;
                if (!this.account && this.publicAccountList.length > 0) {
                    this.$toast(this.$t('sendChannel.selectAccount'), 'warn');
                    return false;
                }
                this.waitRefresh = true;
                // 微信任务控件：全局公众号改为旅程选择的公众号
                this.UPDATE_USER_INFO({authorizerInfoId: this.publicAccount.id});
                localStorage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(this.user));
                let {href} = this.$router.resolve({name: 'imageTextCreate'});
                window.open(href);
            },
            browseMaterialList() {
                if (!this.account && this.publicAccountList.length > 0) {
                    this.$toast(this.$t('sendChannel.selectAccount'), 'warn');
                    return false;
                }
                this.materialStoreShow = true;
                this.$refs.materialStore.browseList();
            },
            browseMaterialLists() {
                this.materialStoreShow = true;
                //更改调用子组件加载模板列表的方法
                this.$refs.materialStore.browseList();
            },
            testMaterial() {
                let controller = cloneDeep(this.controller);
                if (controller.pushInfo.authorizerInfoId) {
                    if (['sheet',
                        'mdSheet',
                        'external',
                        'form',
                        'miniProgramCard'
                    ].includes(this.controller.pushInfo.wechatType) && !this.$refs.materialEditor.validAll()) {
                        return false;
                    }
                    Object.assign(controller.pushInfo, this.task);
                    controller.authorizerInfoId = this.task.authorizerInfoId;

                    controller.pushInfo.authorizerInfoId = this.task.authorizerInfoId;
                    controller.pushInfo.authorizerInfoName = this.task.authorizerInfoName;
                    controller.pushInfo.wechatAppid = this.task.wechatAppid;

                    controller.tasks.authorizerInfoId = this.task.authorizerInfoId;
                    controller.tasks.authorizerInfoName = this.task.authorizerInfoName;
                    controller.tasks.wechatAppid = this.task.wechatAppid;
                    this.UPDATE_CONTROLLER(controller);
                    this.testTemplateModalOpen = true;
                } else {
                    this.$toast(this.$t('controller.bindAccount'), 'warn');
                    return false;
                }
            },
            getSendBehavior(sendBehavior) {
                return sendBehavior === 0 ? this.$t('controller.stopWhenExpired') : this.$t('controller.realTimeWhenExpired');
            },
            // 获取公众号名称
            getAccountName(id) {
                if (!id) return '';
                let target = this.publicAccountList.$getByKey(id);
                return target && Object.keys(target).length > 0 ? target.name : '';
            },
            /**
             * 重置素材
             *
             */
            resetMaterials() {
                if (['template', 'picText', 'service'].includes(this.controller.pushInfo.wechatType)) {
                    this.task.materialId = null;
                } else {
                    this.material = Object.assign({}, resetMaterial(this.controller.pushInfo.wechatType));
                    this.$set(this.material, 'type', this.editorType);
                }
                this.materialLoading = false;
            }

        },
        components: {
            MaterialStore,
            NewMaterialStore,
            DelayTimePicker,
            TemplateTestModal,
            MaterialText,
            MaterialEditor
        }
    };
</script>
<style lang="scss" type="text/scss">

    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .wechat-controller-form {
        .timer {
            .calendar {
                margin-top: 0;
            }

            .hour-minute-select {
                margin-top: 0;
            }
        }

        .wechatTemplate {
            position: relative;
            min-height: 246px;
        }

        .noStone {
            padding: 32px 0 0;
        }

        .wechat-content {
            position: relative;
            min-height: 346px;
            max-width: 840px;
            border: 1px solid $border-color;
            border-radius: 4px;
            overflow: hidden;

            .notice-text {
                padding: ($input-field-height - 20px)/2 8px;
                line-height: 20px;
                color: $color-light-content;
            }

            .select-material,
            .add-material {
                position: absolute;
                top: 22%;
                left: 50%;
                z-index: 1;
                overflow: hidden;
                width: 176px;
                height: 225px;
                line-height: 3em;
                font-size: 14px;
                color: $color-light-content;
                cursor: pointer;
                text-align: center;

                img {
                    display: block;
                    box-sizing: border-box;
                    padding: 50px;
                    width: 176px;
                    height: 180px;
                    border: 1px solid $border-color;
                    border-radius: 5px;
                }
            }

            .select-material {
                @include transform(translateX(-110%));
            }

            .add-material {
                @include transform(translateX(10%));
            }

            .refresh {
                position: absolute;
                top: 50%;
                left: 50%;
                @include transform(translate(-50%, -50%));
                line-height: 3em;
                font-size: 14px;
                color: $color-light-content;
                cursor: pointer;

                img {
                    display: block;
                    width: 54px;
                    margin: 0 auto;
                }
            }
        }

        .non-original {
            .original-rule {
                margin-left: 125px;

                .rule {
                    color: $disabled;
                }
            }
        }

        .btn-icon-group {
            position: absolute;
            right: 8px;
            top: 8px;
            text-align: center;

            .icon {
                display: block;
                @include box-sizing();
                width: $input-field-height;
                font-size: 14px;
                line-height: $input-field-height - 2px;
                padding: 0;
                background-color: white;
                cursor: pointer;
                border: 1px solid $border-color;
                @include transition();
                color: $color-content;

                &:hover {
                    color: $theme;
                    background-color: $content-bg;
                }

                ~ button {
                    border-top: none;
                }

                &.isDisabled {
                    cursor: not-allowed;
                    pointer-events: auto;
                }
            }
        }
    }

    .tip {
        .detail-url {
            color: $green;
        }
    }

    .isDisabled {
        @include noPermission();
    }
</style>
