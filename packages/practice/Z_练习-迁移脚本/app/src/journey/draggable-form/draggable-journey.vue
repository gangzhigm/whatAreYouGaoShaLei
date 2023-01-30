<template>
    <div class="draggable-journey">
        <div class="content-view">
            <crumbs :crumbs="crumbs" />
        </div>
        <div class="page-head">
            <div class="content-view">
                <!-- 旅程操作 -->
                <journey-actions v-if="!isChecking" />
                <wave-pending v-if="onPending" />
                <template v-else>
                    <!-- 旅程保存提醒 -->
                    <transition name="fade">
                        <div class="save-notice" v-show="saveNotice">
                            {{'dragJourney.changesSaved' | t}}
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-dengdaishijian"></use>
                            </svg>
                        </div>
                    </transition>
                </template>
                <h1 class="journey-title" :class="{edit: !loading && writable && !isChecking}" @click="renameJourney()">
                    <span class="journey-name" :title="journey.journeyName">{{journey.journeyName}}</span>
                    <svg aria-hidden="true" class="edit-icon" v-if="!loading && writable && !isChecking">
                        <use xlink:href="#icon-pencil"></use>
                    </svg>
                    <!-- 旅程状态 -->
                    <!--10 可编辑，需要显示状态-->
                    <span v-if="journey.journeyStatus === 10 || isChecking" v-show="!loading" class="status-label" :class="JOURNEY_STATUS_MAP[journey.journeyStatus]">
                        {{journeyStatusText}}
                    </span>
                    <!--其他旅程状态 可编辑，不显示状态-->
                    <span v-else v-show="!loading && !writable" class="status-label" :class="JOURNEY_STATUS_MAP[journey.journeyStatus]">
                        {{journeyStatusText}}
                    </span>
                </h1>
                <div class="status-right" :class="{'isOverstep':isOverstep}">
                    <!-- 旅程语言 -->
                    <span v-show="!loading && journey.journeyType !== 2" :class="languageLabelClass" v-title:right="journeyLanguage">
                        {{journeyLanguage}}</span>
                    <!-- 限制条件 当用户是华为用户，非实时旅程时显示 -->
                    <div class='restrictionsJourneyTop' v-if="isHw&&(journey.journeyType===0||journey.journeyType===1)">
                        <p v-if="journey.qualification===0" v-title:bottom="$t('common.shortOffchecked')">{{'common.shortOffchecked' | t}}</p>
                        <p v-if="journey.qualification===1&&journey.hwContactNull===0" v-title:bottom="$t('common.shortOnUnchecked')">{{'common.shortOnUnchecked' | t}}</p>
                        <p v-if="journey.qualification===1&&journey.hwContactNull===1" v-title:bottom="$t('common.shortOnchecked')">{{'common.shortOnchecked' | t}}</p>
                        <i class="action-icon icon icon-rizhi" v-title:right="$t('common.restrictionsRecord')" @click="modalOpen"></i>
                        <restrictionsRocord v-if="modalShow" ref="restrictionsRocord"></restrictionsRocord>
                    </div>
                </div>
                <!-- 必审（该旅程必须通过审核开始）提示 -->
                <div v-if="journey.approvalStatus" class="to-approval">
                    <span>{{ 'dragJourney.applied' | t }}</span>
                    <svg :aria-disabled="true" class="icon" v-title="$t('dragJourney.appliedNote')">
                        <use xlink:href="#icon-help"></use>
                    </svg>
                </div>
            </div>
        </div>

        <!-- 旅程画布顶部提示信息 -->
        <journey-notice v-if="!loading" />

        <!-- 编辑旅程时的控件面板 -->
        <component :is="controllerPanelComponents" v-if="writable && !isChecking"></component>
        <!-- 非编辑时，旅程信息展示边栏 -->
        <component :is="metaComponents" v-else-if="journey.id" />

        <!-- 旅程日历视图 -->
        <journey-calendar v-if="calendarView" />
        <!-- 旅程画布 -->
        <journey-canvas v-else />

        <!-- 非实时旅程可用 -->
        <ul v-if="journey.journeyType !== 2 && !calendarView" class="canvas-setting">
            <!-- 旅程设置 - 重复 -->
            <li v-if="journey.journeyType === 1" v-title:left="journey.journeyStatus === 0 || journey.journeyStatus===10 ? repeatTip : $t('journey.startNotEdit')" @click="repeatSetting" :class="{disabled: journey.journeyStatus !== 0 || journey.journeyStatus !== 10}">
                <i class="icon icon-zhongfushezhi"></i>
            </li>
            <!-- 旅程设置 - 其他 -->
            <li v-title:left="journey.journeyStatus === 0 || journey.journeyStatus === 10 ? $t('journey.othersSet') : $t('journey.startNotEdit')" @click="otherSetting" :class="{disabled: journey.journeyStatus !== 0 || journey.journeyStatus !== 10}">
                <i class="icon icon-setting"></i>
            </li>
        </ul>
        <!-- 旅程设置 - 重复 -->
        <repeatSettingModal v-if="writable && repeatModalShow" @close="repeatModalShow = false" />
        <!-- 旅程设置 - 其他 -->
        <otherSettingModal v-if="writable && otherModalShow" @close="otherModalShow = false" />

        <!-- 控件统计信息 - 跟随控件 -->
        <controller-summary />
        <!-- 控件统计信息详细记录 - 右侧边栏 -->
        <controller-summary-detail />

        <!-- controller detail modal -->
        <component v-if="controllerDetailModal" :is="controllerDetailModal" />

        <!-- 重命名旅程表单 -->
        <rename-modal v-if="writable && renameModalShow" @rename="confirmRename" @close="closeRenameModal" />

        <!-- 新建旅程面板 -->
        <newJourneyModal v-if="newJourneyModalShow" @close="closeNewJourney()"></newJourneyModal>

        <!-- 实时旅程 欢迎提示 -->
        <guideModal />

        <!-- 旅程被编辑，需要载入新版本 -->
        <modal v-if="$route.params.id && !loading && lastUpdateDate !== journey.updateDate" :title="$t('dragJourney.updateJourneyNotice')" readonly>
            {{'dragJourney.updateJourneyText' | t}}
            <template v-slot:buttons>
                <button class="btn btn-md btn-theme" v-text="$t('dragJourney.reloadNewVersion')" @click="$router.go(0)">
                </button>
            </template>
        </modal>
    </div>
</template>

<script type="text/ecmascript-6">
import normalControllerPanel from './controller-panel/normal-controller-panel.vue';
import realtimeControllerPanel from './controller-panel/realtime-controller-panel.vue';

import JourneyNotice from './journey-notice.vue';
import JourneyActions from './journey-actions/journey-actions.vue';

import normalMetaV3 from './meta/normal-meta-v3.vue';
import runtimeMeta from './meta/runtime-meta.vue';
import ControllerSummary from './meta/controller-summary.vue';
import ControllerSummaryDetail from './meta/controller-summary-detail.vue';
import journeyCanvas from './canvas/journey-canvas.vue';
import JourneyCalendar from './calendar/journey-calendar.vue';

import newJourneyModal from './modal/new-journey-modal.vue';
import renameModal from './modal/rename-modal.vue';
import repeatSettingModal, { getRepeatCountAndType } from './modal/repeat-setting-modal.vue';
import otherSettingModal from './modal/other-setting-modal.vue';
import StartControllerModal from './canvas/controller/sub-controllers/start-controller/start-controller-modal.vue';
import ContactControllerModal
    from './canvas/controller/sub-controllers/contact-controller/contact-controller-modal.vue';
import DecisionControllerModal
    from './canvas/controller/sub-controllers/decision-controller/decision-controller-modal.vue';
import ABTestControllerModal
    from './canvas/controller/sub-controllers/ABTest-controller/AB-test-controller-modal.vue';
import NewABTestControllerModal
    from './canvas/controller/sub-controllers/new-ABTest-controller/new-AB-test-controller-modal.vue';
import TagConditionControllerModal
    from './canvas/controller/sub-controllers/tag-condition-controller/tag-condition-controller-modal.vue';
import EventConditionControllerModal
    from './canvas/controller/sub-controllers/event-condition-controller/event-condition-controller-modal.vue';
import AttributeConditionControllerModal
    from './canvas/controller/sub-controllers/attribute-condition-controller/attribute-condition-controller-modal.vue';
import SMSControllerModal from './canvas/controller/sub-controllers/sms-controller/sms-controller-modal.vue';
import MMSControllerModal from './canvas/controller/sub-controllers/mms-controller/mms-controller-modal.vue';
import EmailControllerModal from './canvas/controller/sub-controllers/email-controller/email-controller-modal.vue';
import EmailTemplateControllerModal
    from './canvas/controller/sub-controllers/email-controller-template/email-controller-modal.vue';
import WechatControllerModal
    from './canvas/controller/sub-controllers/wechat-controller/wechat-controller-modal.vue';
import ContactTagControllerModal
    from './canvas/controller/sub-controllers/tag-controllers/contact-tag-controller-modal.vue';
import FansTagControllerModal
    from './canvas/controller/sub-controllers/tag-controllers/fans-tag-controller-modal.vue';
import EndControllerModal from './canvas/controller/sub-controllers/end-controller/end-controller-modal.vue';
import LeadsTransferControllerModal
    from './canvas/controller/sub-controllers/leads-transfer/leads-transfer-controller-modal.vue';
import wecomControllerModal from './canvas/controller/sub-controllers/wecom-controller/wecom-controller-modal.vue';

import guideModal from './modal/guide-modal.vue';
import { JourneyApiV3 } from '@/api';
import canvasStore, { DRAGGABLE_JOURNEY_STORE_NAME } from '@/store/vuex/modules/canvasStore';
import { UPDATE_JOURNEY, UPDATE_CHECK, PAGE_WILL_BE_DESTROY, UPDATE_SAVE_JOURNEY_STATUS } from '@/store/vuex/mutationTypes';
import { trackEvent } from '../../monitor';
import {
    CLEAR_JOURNEY_STORE,
    RESTORE_JOURNEY,
    SAVE_JOURNEY,
    CLEAR_JOURNEY_CONTROLLER
} from '@/store/vuex/actionTypes';
import {
    ADD_CONTACT_TAG_CONTROLLER,
    DELETE_CONTACT_TAG_CONTROLLER,
    ADD_FANS_TAG_CONTROLLER,
    DELETE_FANS_TAG_CONTROLLER,
    getModalName
} from './canvas/controller/CONTROLLER_TYPES';
import maskLoading from '@/common/components/mask-loading.vue';
import restrictionsRocord from '../restrictionsRecord.vue';
import debounce from 'lodash/debounce';
import { I18N_STORE_NAME } from '@/locales';
import { mapGetters, mapState } from 'vuex';

export default {
    data () {
        return {
            loading: false,
            modalShow: false,//记录弹窗是否开启
            // 0:未开始 1:进行中 2:已完成 3:已取消 4:全部状态 5:已暂停 6:测试中 7-8 测试结束 9 待审批 10 审批被拒
            JOURNEY_STATUS_MAP: [
                'un-started',
                'progress',
                'complete',
                'canceled',
                'all',
                'pause',
                'testing',
                'test-complete',
                'test-complete',
                'pending',
                'rejected'
            ],
            newJourneyModalShow: true,  //新建旅程弹窗显隐
            repeatModalShow: false, //  旅程设置-重复 弹窗显隐
            otherModalShow: false,  //  旅程设置-其他 弹窗显隐
            renameModalShow: false, //  重命名旅程 弹窗显隐
            saveTimer: null, //  自动保存旅程
            screenWidth: 0,
            isOverstep: false,//限制条件宽度是否大于剩余的宽度,
            unHwAndOverstep: false,//非华为用户并且是限制条件大于剩余宽度
        };
    },
    beforeCreate () {
        this.$store.registerModule(DRAGGABLE_JOURNEY_STORE_NAME, canvasStore);
    },
    created () {
        if (~~this.$route.params.id !== 0) {
            this.newJourneyModalShow = false;
            this.fetchJourney(~~this.$route.params.id);
        }

        if (Boolean(this.$route.query.isChecking) === true) {
            this.$store.commit(UPDATE_CHECK, true);
        }

        this.$store.commit(PAGE_WILL_BE_DESTROY, false);
    },
    beforeRouteUpdate (to, from, next) {
        if (~~to.params.id !== 0) {
            this.newJourneyModalShow = false;
            this.fetchJourney(~~to.params.id);
        }
        next();
    },
    beforeRouteLeave (to, from, next) {
        if (this.onPending) {
            this.$toast(this.$t('dragJourney.leaveTip'), 'warn');
            next(false);
        } else {
            window.clearInterval(this.saveTimer);
            next();
        }
    },
    beforeDestroy () {
        this.$store.dispatch(CLEAR_JOURNEY_STORE);
        this.$store.commit(PAGE_WILL_BE_DESTROY, true);
        window.clearInterval(this.saveTimer);
    },
    destroyed () {
        this.$store.dispatch(CLEAR_JOURNEY_CONTROLLER);
        this.$store.unregisterModule(DRAGGABLE_JOURNEY_STORE_NAME);
    },
    mounted () {
        const that = this;
        this.$nextTick(() => {
            window.addEventListener('resize', that.setScreenWidth, false);

            setTimeout(() => {
                this.isOverstepFun();
            }, 500);
        });
    },
    methods: {
        //打开限制条件的操作记录
        modalOpen () {
            this.modalShow = true;
            this.$nextTick(() => {
                this.$refs.restrictionsRocord.getList();
            });
        },
        //  重命名旅程
        renameJourney () {
            if (this.onPending) {
                this.$toast(this.$t('dragJourney.delayOperate'), 'warn');
                return;
            }
            if (this.writable && !this.isChecking) {
                this.renameModalShow = true;
            }
        },
        /**
         * 确认重命名
         * @param name {String}
         */
        confirmRename (name) {
            let oldName = this.journey.journeyName;
            this.$store.commit(UPDATE_JOURNEY, { journeyName: name });
            this.$store.dispatch(SAVE_JOURNEY)
                .then(() => {
                    this.renameModalShow = false;
                    trackEvent('重命名旅程');
                })
                .catch(() => {
                    this.$store.commit(UPDATE_JOURNEY, { journeyName: oldName });
                });
        },
        //  关闭重命名弹窗
        closeRenameModal () {
            this.renameModalShow = false;
        },
        //  取消新建旅程
        closeNewJourney () {
            this.newJourneyModalShow = false;
            if (this.$route.query.redirect) {
                this.$router.push({ name: this.$route.query.redirect });
            } else {
                this.$router.push({
                    name: 'journeyRecords',
                    params: this.$route.params,
                    query: this.$route.query,
                });
            }
        },
        //重复设置
        repeatSetting () {
            if (this.journey.journeyStatus === 0) {
                this.repeatModalShow = true;
            }
        },
        //  其他设置
        otherSetting () {
            // 旅程状态为 未开始 和 审批被拒
            if (this.journey.journeyStatus === 0 || this.journey.journeyStatus === 10) {
                this.otherModalShow = true;
            }
        },
        /**
         * 获取旅程
         * @param journeyId 旅程id
         */
        fetchJourney (journeyId) {
            this.$store.commit(UPDATE_SAVE_JOURNEY_STATUS, true);
            this.loading = true;
            JourneyApiV3
                .getJourney(journeyId)
                .then(({ body: { data: { journey } } }) => {
                    this.$store
                        .dispatch(RESTORE_JOURNEY, journey)
                        .then(() => {
                            this.loading = false;
                            this.$store.commit(UPDATE_SAVE_JOURNEY_STATUS, false);
                        });

                    // 30 分钟自动保存旅程
                    clearInterval(this.saveTimer);
                    if (this.writable) {
                        this.saveTimer = window.setInterval(this.saveJourney, 30 * 60 * 1000);
                    }
                })
                .catch(() => {
                    this.$store.commit(UPDATE_SAVE_JOURNEY_STATUS, false);
                });
        },
        //保存旅程
        saveJourney () {
            this.$store.dispatch(SAVE_JOURNEY);
        },
        //计算isOverstep
        isOverstepFun (saveNotice) {
            if (this.isChecking) return;
            let width = document.getElementsByClassName('content-view')[0].offsetWidth;
            let journeyActionWidth = document.getElementsByClassName('journey-actions')[0].offsetWidth;
            let journeyTitleWidth = document.getElementsByClassName('journey-title')[0].offsetWidth;
            let saveNoticeWidth = document.getElementsByClassName('save-notice')[0] ? document.getElementsByClassName('save-notice')[0].offsetWidth : 0;
            let statusRightWidth = document.getElementsByClassName('status-right')[0].offsetWidth + 9;
            if (this.isOverstep && this.isHw) {
                let journeyTopWidth = document.getElementsByClassName('restrictionsJourneyTop')[0].offsetWidth + 9;
                statusRightWidth = journeyTopWidth;
            }

            let surplus;
            if (saveNotice) {
                surplus = width - journeyActionWidth - journeyTitleWidth - saveNoticeWidth;
            } else {
                surplus = width - journeyActionWidth - journeyTitleWidth;
            }
            this.isOverstep = surplus < statusRightWidth;
            this.unHwAndOverstep = !this.isHw && (surplus < 0 || surplus < statusRightWidth) &&
                this.saveNotice && (this.language !== 'zh-CN');
        },
        //设置屏幕宽度
        setScreenWidth: debounce(function () {
            this.screenWidth = document.body.clientWidth;
        })
    },
    watch: {
        //屏幕宽度变换时计算isOverstep
        screenWidth () {
            this.isOverstepFun();
        },
        //保存旅程时计算isOverstep
        saveNotice (val) {
            this.$nextTick(() => {
                this.isOverstepFun(val);
            });
        }
    },
    computed: {
        ...mapGetters(['onPending']),
        ...mapState({
            //语言
            language: state => state[I18N_STORE_NAME].lang,
            user: state => state.user,
            storeName: state => state[DRAGGABLE_JOURNEY_STORE_NAME]
        }),
        languageLabelClass () {
            if (this.isHw) {
                return 'language-label';
            }
            if (this.unHwAndOverstep) {
                return 'language-label unHwAndOverstep';
            }
            return 'language-label language-lineheight';
        },
        // 华为类型账号
        isHw () {
            return this.user && this.user.companyType === 1;
        },
        //面包屑
        crumbs () {
            return [
                { name: 'home', text: 'Dmartech' },
                { name: 'journeyRecords', text: this.$t('home.journey') },
                Object.assign({}, this.$route, { text: this.journey.journeyName })
            ];
        },
        // 定时旅程，日历视图
        calendarView () {
            return this.$route.query.calendarView;
        },
        // 旅程
        journey () {
            return this.storeName.journeyInformation;
        },
        //最后更新日期
        lastUpdateDate () {
            return this.storeName.lastUpdateDate;
        },
        // 保存notice
        saveNotice () {
            return this.onPending ? '' : this.storeName.saveNotice;
        },
        // 旅程状态显示
        journeyStatusText () {
            switch (this.journey.journeyStatus) {
                case 0: {
                    return this.$t('journeyList.draft');
                }
                case 1: {
                    return this.$t('journeyList.running');   //进行中
                }
                case 2: {
                    return this.$t('journeyList.completed'); //已完成
                }
                case 3: {
                    return this.$t('journeyList.cancelled'); //已取消
                }
                case 5: {
                    return this.$t('journeyList.paused');    //已暂停
                }
                case 6: {
                    return this.$t('journeyList.testing');   //测试中
                }
                case 7:
                case 8: {
                    return this.$t('journeyList.inReview');  //测试结束
                }
                case 9: {
                    return this.$t('journeyList.pending');   //待审批
                }
                case 10: {
                    return this.$t('journeyList.rejected');   //审批被拒
                }
            }
        },
        // 旅程语言显示
        journeyLanguage () {
            let pre = this.$t('newJourney.lng');
            switch (this.journey.language) {
                case 1:
                    return pre + this.$t('newJourney.chinese');
                case 2:
                    return pre + this.$t('newJourney.others');
                case 0:
                default:
                    return pre + this.$t('newJourney.all');
            }
        },
        //  画布详情
        canvasInformation () {
            return this.storeName.canvasInformation;
        },
        //  非编辑时，旅程侧边展示栏
        metaComponents () {
            return this.journey.journeyType !== 2 ? 'normalMetaV3' : 'runtimeMeta';
        },
        // 编辑旅程时的控件面板
        controllerPanelComponents () {
            return this.journey.journeyType !== 2 ? 'normalControllerPanel' : 'realtimeControllerPanel';
        },
        //周期重复 提示
        repeatTip () {
            const noRepeat = this.journey.repeatFrequency === 0; // 重复间隔天数为 0，代表不重复
            let tip = `<p style="border-bottom:1px solid white;margin-bottom:5px;">${this.$t('journey.repeatConfigTitle')}</p>`;

            if (noRepeat) {
                // 不重复
                tip += this.$t('journey.noRepeat');
            } else {
                let { count, type } = getRepeatCountAndType(this.journey.repeatFrequency);
                // 重复
                tip += `${this.$t('journey.every')} ${count} ${type.name} ${this.$t('journey.canvasRepeat')}${this.$t('punctuation.comma')}`;

                if (this.journey.repeatCount) {
                    // 按次数
                    tip += `<br>${this.journey.repeatCount} ${this.$t('journey.times')}${this.$t('newJourney.info')}`;
                } else if (this.journey.relativeTime) {
                    // 按天数
                    tip += `<br>${this.journey.relativeTime} ${this.$t('common.day')}${this.$t('newJourney.info')}`;
                } else if (this.journey.repeatEndDate) {
                    // 按日期
                    tip += `<br>${this.journey.repeatEndDate} ${this.$t('newJourney.info')}`;
                }
            }
            return tip;
        },
        /**
         * 是否可编辑
         * @returns {default.getters.journeyWritable}
         */
        writable () {
            return this.$store.getters.journeyWritable;
        },
        //controller detail弹窗
        controllerDetailModal () {
            const controllers = this.canvasInformation.controllers;
            const activeControllerId = this.storeName.activeControllerId;
            return activeControllerId ? getModalName(controllers[activeControllerId].type) : '';
        },
        // 正在检查
        isChecking () {
            return this.storeName.isChecking;
        },
        // 旅程左侧选中的公众号
        panelAccountId () {
            return this.storeName.authorizerInfoId;
        },
    },
    components: {
        normalControllerPanel,
        realtimeControllerPanel,
        journeyCanvas,
        JourneyCalendar,
        normalMetaV3,
        runtimeMeta,
        ControllerSummary,
        ControllerSummaryDetail,
        newJourneyModal,
        renameModal,
        repeatSettingModal,
        otherSettingModal,
        [StartControllerModal.name]: StartControllerModal,
        [ContactControllerModal.name]: ContactControllerModal,
        [DecisionControllerModal.name]: DecisionControllerModal,
        [ABTestControllerModal.name]: ABTestControllerModal,
        [NewABTestControllerModal.name]: NewABTestControllerModal,
        [TagConditionControllerModal.name]: TagConditionControllerModal,
        [EventConditionControllerModal.name]: EventConditionControllerModal,
        [AttributeConditionControllerModal.name]: AttributeConditionControllerModal,
        [SMSControllerModal.name]: SMSControllerModal,
        [MMSControllerModal.name]: MMSControllerModal,
        [EmailControllerModal.name]: EmailControllerModal,
        [EmailTemplateControllerModal.name]: EmailTemplateControllerModal,
        [WechatControllerModal.name]: WechatControllerModal,
        [getModalName(ADD_CONTACT_TAG_CONTROLLER)]: ContactTagControllerModal,
        [getModalName(DELETE_CONTACT_TAG_CONTROLLER)]: ContactTagControllerModal,
        [getModalName(ADD_FANS_TAG_CONTROLLER)]: FansTagControllerModal,
        [getModalName(DELETE_FANS_TAG_CONTROLLER)]: FansTagControllerModal,
        wecomControllerModal,

        [EndControllerModal.name]: EndControllerModal,
        [LeadsTransferControllerModal.name]: LeadsTransferControllerModal,
        JourneyNotice,
        JourneyActions,
        guideModal,
        maskLoading,
        restrictionsRocord
    }
};
</script>
<style lang="scss">
@import "../../common/scss/base/variables";
@import "../../common/scss/base/mixin";
.draggable-journey {
    @include clearfix();

    .page-head {
        border-bottom: 1px solid $border-color;
        height: 27px;
        .content-view {
            min-width: 1220px;
        }
    }

    .status-right {
        display: flex;
        float: left;
        flex-direction: column;
        margin-left: 8px;
        > span {
            line-height: 14px;
            white-space: nowrap;
            overflow: hidden;
            -ms-text-overflow: ellipsis;
            text-overflow: ellipsis;
        }
        .language-lineheight {
            line-height: 32px;
        }

        &.isOverstep {
            flex-direction: unset;
            .restrictionsJourneyTop {
                margin-left: 10px;
                line-height: 14px;
                i {
                    line-height: 14px;
                    margin: 0px 0 0px 4px;
                }
            }
            .language-lineheight {
                margin-left: 0;
            }
            .unHwAndOverstep {
                line-height: 14px;
            }
        }
    }

    .restrictionsJourneyTop {
        display: flex;
        font-size: 12px;
        p {
            white-space: nowrap;
            overflow: hidden;
            -ms-text-overflow: ellipsis;
            text-overflow: ellipsis;
        }
        i {
            margin: 6px 0 6px 4px;
        }
    }

    .to-approval {
        display: inline-block;
        margin-left: 8px;
        svg {
            width: 16px;
            height: 16px;
            cursor: pointer;
            vertical-align: -4px;
        }
    }

    .journey-title {
        float: left;
        &.edit {
            line-height: $input-field-height - 1px;

            &:hover {
                background: $theme;
                border-bottom: 1px dashed white;
                cursor: pointer;
                color: white;

                .journey-name {
                    border-bottom: none;
                }
            }

            .journey-name {
                border-bottom: 1px dashed $color-light-content;
            }

            .edit-icon {
                width: 20px;
                height: 20px;
                fill: currentColor;
                vertical-align: top;
                margin-top: ($input-field-height - 20px)/2;
            }
        }

        .journey-name {
            display: inline-block;
            vertical-align: top;
            max-width: 18em;
            @include ellipsis;
        }

        .language-label {
            font-size: 12px;
        }
        .status-label {
            $status-label-height: 20px;
            display: inline-block;
            @include box-sizing();
            height: $status-label-height;
            padding: 0 7px;
            font-size: 12px;
            margin-top: $input-field-height - $status-label-height - 7px;
            vertical-align: top;
            font-weight: normal;
            @include user-select(none);
            @include border-radius($status-label-height/2);

            &.complete,
            &.canceled,
            &.test-complete,
            &.un-started {
                color: $color-light-content;
                line-height: $status-label-height - 2px;
                border: 1px solid $color-light-content;
            }

            &.pause {
                color: white;
                line-height: $status-label-height;
                @include linear-gradient(to right, $theme, #0b9b87);
                @include box-shadow(0 0 9px rgba($theme, 0.75));
            }

            &.testing,
            &.progress,
            &.pending {
                color: white;
                line-height: $status-label-height;
                @include linear-gradient(to right, $theme, #0b9b87);
                @include box-shadow(0 0 9px rgba($theme, 0.75));
            }

            &.rejected {
                color: white;
                line-height: $status-label-height;
                @include linear-gradient(to right, $dark-red, #eb5150);
                @include box-shadow(0 0 9px rgba($dark-red, 0.75));
            }
        }
    }

    .save-notice {
        float: right;
        line-height: $input-field-height;
        color: $color-light-content;
        font-style: italic;

        svg {
            width: 22px;
            height: 22px;
            vertical-align: top;
            margin: ($input-field-height - 22px)/2 ($input-field-height - 22px)/2
                0 0;
            fill: currentColor;
        }
    }

    .canvas-setting {
        position: fixed;
        z-index: 1;
        top: $header-height + $toolbar-height + $page-head-height + 32px;
        right: 24px;
        width: 34px;
        border: 1px solid $border-color;
        background-color: white;
        @include user-select(none);

        li {
            height: 34px;
            line-height: 34px;
            text-align: center;
            font-size: 18px;
            color: $color-light-content;
            border-bottom: 1px solid $border-color;
            cursor: pointer;

            &:hover {
                color: $color-content;
            }

            &:nth-last-of-type(1) {
                border-bottom: none;
            }

            &.disabled {
                color: $color-light-content;
                cursor: auto;
            }
        }
    }

    .error-message {
        color: $red;
        background-color: rgba($red, 0.25);
        line-height: 20px;
        padding: ($input-field-height - 20px)/2 1em;
        margin-bottom: 8px;
    }

    .belong-list {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        flex-wrap: wrap;

        .belong-item {
            &:not(:last-child):after {
                content: ",";
            }
        }
    }

    .decision-controller-form,
    .decision-controller-view {
        .modal-content {
            height: calc(80vh - 154px);
            overflow-y: auto;
        }
    }

    .form-field {
        &.flex {
            label[for="taskName"] + span {
                flex: 1;
            }
        }
    }
}
</style>
