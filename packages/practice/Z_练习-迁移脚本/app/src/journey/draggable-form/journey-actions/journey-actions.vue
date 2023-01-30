<template>
    <div class="journey-actions">
        <!-- 主操作：开始、暂停、申请审批、审批-->
        <span v-if="!journey.approvalStatus && allowStart">
            <!-- 开始btn -->
            <button v-show="btnText === 0"  class="pull-right btn btn-md btn-theme ml8" type="button" @click="startJourneyValid(0)"
                     :disabled="$has('journey_manage_start_journey') || onPending">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-kaishi"></use>
                </svg>
                {{'dragJourney.start' | t}}
            </button>
            <!-- 继续btn -->
            <button v-show="btnText === 1"  class="pull-right btn btn-md btn-theme ml8" type="button" @click="startJourneyValid(0, true)"
                    :disabled="$has('journey_manage_restart_journey') || onPending">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-kaishi"></use>
                </svg>
                {{'dragJourney.continue' |t}}
            </button>
        </span>

        <button v-if="allowPause && btnText === 2" class="pull-right btn btn-md btn-theme ml8" type="button" @click="pauseJourney"
                :disabled="$has('journey_manage_pause_journey') || onPending">
            <svg aria-hidden="true">
                <use xlink:href="#icon-pause"></use>
            </svg>
            {{'dragJourney.pause' | t}}
        </button>
        <!--有审批权限显示审批相关按钮 申请审批，审批，撤回，审批日志-->
        <!-- 申请审批 -->
        <button v-if="allowPending" :disabled="$has('journey_manage_approval_journey') || onPending"
                class="pull-right btn btn-md btn-theme ml8" type="button"
                @click="pendingJourney">
            {{'dragJourney.approval' | t}}
        </button>
        <!-- 撤回（申请人） -->
        <button v-if="allowWithdraw" :disabled="$has('journey_manage_withdraw_journey') || onPending"
                class="pull-right btn btn-md btn-theme ml8" type="button"
                @click="withdrawJourney">
            {{'dragJourney.withdraw' | t}}
        </button>
        <!-- 审批（审批人） -->
        <button v-if="allowApproval" :disabled="$has('journey_manage_examination_journey') || onPending"
                class="pull-right btn btn-md btn-theme ml8" type="button"
                @click="approvalJourney">
            {{'dragJourney.examination' | t}}
        </button>

        <!-- 旅程可用操作: 保存、删除、等等 -->
        <sub-actions @test="pickASwarm"/>

        <!-- 1 测试前选择分群弹出层 -->
        <modal v-if="allowStart && pickSwarmModalShow"
               :title="$t('controller.journey_test')"
               @close="abortTest">
            <div class="form-field">
                <span class="label">{{$t('controller.test_group')}}</span>
                <selector class="xl"
                          :placeholder="$t('controller.test_placeholder')"
                          v-model="testSwarmId"
                          :options="swarms"
                          search/>
            </div>
            <template v-slot:buttons>
                <input type="button"
                       class="btn btn-md btn-theme"
                       :disabled="!testSwarmId"
                       @click="testJourney"
                       :value="$t('common.confirm')"/>
            </template>
        </modal>

        <!-- 2 开始旅程弹出层 选择 测试 or 正式开始 -->
        <modal v-if="startModalShow"
               :title="$t('dragJourney.startTips')"
               @close="closeStartModal">
            <p class="start-tips">{{'dragJourney.tipsDesc' | t}}</p>
            <div class="form-field flex">
                <span class="label">{{'dragJourney.handling' | t}}</span>
                <div class="field-group">
                    <radio class="radio" id="journey_manage_test_journey"
                           :disabled="$has('journey_manage_test_journey')"
                           v-model="startMethod" :source="'test'">{{'controller.nowTest' | t}}
                    </radio>
                    <div v-if="startMethod === 'test'" class="choose-group">
                        {{'controller.test_group' | t}}
                        <selector class="xl" v-model="testSwarmId" :options="swarms" search/>
                    </div>
                    <br v-else>
                    <template>
                        <!--提交审批-->
                        <radio class="radio" v-if="operateType !== 0" v-model="startMethod" :source="'start'">
                            {{'dragJourney.submitApproval' | t}}
                        </radio>
                        <!--正式开始-->
                        <radio class="radio" v-else v-model="startMethod" :source="'start'">
                            {{'dragJourney.officialStart' | t}}
                        </radio>
                    </template>
                </div>
            </div>
            <template v-slot:buttons>
                <input type="button"
                       class="btn btn-md btn-theme"
                       :disabled="startMethod === ''"
                       @click="testJourney"
                       :value="$t('common.confirm')"/>
            </template>
        </modal>

        <!-- 3 开始前、测试前校验 -->
        <journey-validate-modal v-if="validateModalShow"
                                :operateType="operateType"
                                :testSwarmId="testSwarmId"
                                @success="successValidateModel"
                                @close="closeValidateModal" @refresh="startRefreshModal($event)" @start="start"/>

        <!--4 检验通过, 任务统计,确认开始-->
        <journey-confirm-modal
                v-if="confirmModelShow"
                :operateType="operateType"
                @start="start"
                @test="testHandle"
                @close="closeConfirmModel">
        </journey-confirm-modal>

        <!-- 素材更新列表 -->
        <modal v-if="refreshMaterial" :title="$t('dragJourney.isUpdate')" @close="closeRefresh" size="sl">
            <p>{{'dragJourney.testMaterial' | t}} {{materialList.length}} {{'dragJourney.updateTip' | t}}</p>
            <div class="simplify-table">
                <table>
                    <thead>
                    <tr>
                        <td>{{'dragJourney.sendName' | t}}</td>
                        <td>{{'dragJourney.sendMaterial' | t}}</td>
                        <td class="tar">{{'dragJourney.sendVersion' | t}}</td>
                        <td :width="30"></td>
                        <td>{{'dragJourney.newVersion' | t}}</td>
                        <td>{{'dragJourney.ifUpdate' | t}}</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in materialList">
                        <td :title="item.taskName">{{item.taskName}}</td>
                        <td :title="item.materialName">{{item.materialName}}</td>
                        <td class="tar">{{item.sendMaterialDate}}</td>
                        <td class="tac" :width="30">
                            <span class="pk-action" @click="showCompareModal(item)">PK</span>
                        </td>
                        <td>{{item.newMaterialDate}}</td>
                        <td>
                            <radio class="radio" :source="false" v-model="item.status">{{'dragJourney.noUpdate' | t}}
                            </radio>
                            <radio class="radio" :source="true" v-model="item.status">{{'dragJourney.update' | t}}
                            </radio>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <template v-slot:buttons>
                <input type="button"
                       class="btn btn-md btn-theme"
                       @click="updateHandle"
                       :value="$t('dragJourney.reStart')"/>
            </template>
        </modal>
        <!-- 素材对比 -->
        <modal v-if="compareObj.taskId" :title="$t('dragJourney.materialCompare')" @close="closeCompareModal"
               size="lg">
            <div class="compare-content" :class="{'lg-versiton': oldMaterial.type === 0}">
                <div class="compare-version">
                    <p class="light-content-text">{{compareObj.sendMaterialDate}}</p>
                    <div class="version-content">
                        <inline-loading v-if="oldMaterialLoading"/>
                        <preview :material="oldMaterial" :toolbar="false" v-else-if="oldMaterial.id"/>
                        <p class="no-material" v-else>{{'dragJourney.previewFailed' | t}}</p>
                    </div>
                    <input type="button" class="btn btn-md btn-theme" :value="$t('dragJourney.useOldVersion')"
                           @click="chooseVersion(false)"/>
                </div>
                <p class="pk-content"><span class="pk-action">PK</span></p>
                <div class="compare-version">
                    <p class="light-content-text">{{compareObj.newMaterialDate}}</p>
                    <div class="version-content">
                        <inline-loading v-if="newMaterialLoading"/>
                        <preview :material="newMaterial" :toolbar="false" v-else-if="newMaterial.id"/>
                        <p class="no-material" v-else>{{'dragJourney.previewFailed' | t}}</p>
                    </div>
                    <input type="button" class="btn btn-md btn-theme" :value="$t('dragJourney.useNewVersion')"
                           @click="chooseVersion(true)"/>
                </div>
            </div>
        </modal>
    </div>
</template>

<script type="text/ecmascript-6">
    import { ContactApiV1, JourneyApiV3, JourneyMaterialApiV1 } from '@/api';
    import SubActions from './sub-actions.vue';
    import {trackEvent} from '../../../monitor';
    import {DRAGGABLE_JOURNEY_STORE_NAME, uniqId} from '@/store/vuex/modules/canvasStore';
    import {SAVE_JOURNEY, CHECK_JOURNEY_NEW_VERSION} from '@/store/vuex/actionTypes';
    import JourneyValidateModal from './validate-modal/journey-validate-modal.vue';
    import JourneyConfirmModal from './validate-modal/journey-confirm-model.vue';
    import Preview from '../../material/preview.vue';
    import {END_CONTROLLER} from '../canvas/controller/CONTROLLER_TYPES';
    import {
        ADD_ARROW,
        ADD_NEW_CONTROLLER,
        SET_START_METHOD,
        SET_TEST_SWARM_ID,
        SET_JOURNEY,
        SET_SAVE_NOTICE,
        UPDATE_SAVE_TASK_STATUS
    } from '@/store/vuex/mutationTypes';
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';

    export default {
        components: {
            SubActions,
            JourneyValidateModal,
            JourneyConfirmModal,
            Preview
        },
        data() {
            return {
                isContinue: false,//是否走继续审批的流程
                testSwarmId: '',    //测试分群id
                swarms: [], //分群list
                pickSwarmModalShow: false,  //选择分群弹窗显隐
                startModalShow: false,  //开始弹窗显隐
                startMethod: '',    // test、start
                validateModalShow: false, // 检测状态
                refreshMaterial: false, //刷新
                materialList: [],   //素材list
                compareObj: {}, // 正在 PK 中的
                oldMaterial: {},    //原素材
                newMaterial: {},    //新素材
                oldMaterialLoading: true,   //原素材加载
                newMaterialLoading: true,   //新素材加载
                starting: false, // 正在启动旅程（测试/正式开始）
                confirmModelShow: false,    //确定弹窗显隐

                // 点击按钮 0 开始，1 申请审批，2 审批
                // 不同按钮页面展示不一样
                operateType: 0,
            };
        },
        methods: {
            ...mapActions([
                CHECK_JOURNEY_NEW_VERSION,
                SAVE_JOURNEY
            ]),
            ...mapMutations([
                UPDATE_SAVE_TASK_STATUS,
                SET_JOURNEY,
                SET_SAVE_NOTICE,
                SET_TEST_SWARM_ID,
                SET_START_METHOD,
                ADD_NEW_CONTROLLER,
                ADD_ARROW
            ]),
            /**
             * 测试
             * @param swarmId
             * @returns {Promise<void>}
             */
            async testHandle(swarmId) {
                if (swarmId) {
                    this.$toast(this.$t('journeyList.perform'), 'warn');

                    if (this.starting) return;
                    this.starting = true;

                    if (this.journey.journeyType === 2) {
                        await this.createEndControl();
                        JourneyApiV3.testJourney(this.journey.id, swarmId)
                            .then(() => {
                                window.location.reload();
                            });
                    }
                }
            },
            // close journey-confirm-model
            closeConfirmModel() {
                this.confirmModelShow = false;
            },
            // 素材更新
            updateHandle() {
                this.refreshMaterial = false;
                this.confirmModelShow = true;
            },
            //  验证 弹窗
            successValidateModel() {
                this.closeValidateModal();
                this.confirmModelShow = true;
            },
            /**
             * 开始弹窗
             * @param list {Array}
             */
            startRefreshModal(list) {
                this.closeValidateModal();
                this.refreshMaterial = true;
                this.materialList = list;
            },
            // 关闭
            closeRefresh() {
                this.refreshMaterial = false;
            },
            /**
             * 显示比较
             * @param item {Object}
             */
            showCompareModal(item) {
                this.$set(this.$data, 'compareObj', item);
                this.getMaterialCopy(item.sendMaterialId);
                this.getMaterial(item.newMaterialId);
            },
            /**
             * 获取素材
             * @param id
             */
            getMaterial(id) {
                JourneyMaterialApiV1
                    .getMaterial(id)
                    .then(({body: {data: {material}}}) => {
                        this.newMaterial = material;
                        this.$set(this.$data, 'newMaterial', material);
                        this.newMaterialLoading = false;
                    })
                    .catch(() => {
                        this.newMaterialLoading = false;
                    });
            },
            /**
             * 素材复制
             * @param id
             */
            getMaterialCopy(id) {
                JourneyMaterialApiV1
                    .getMaterialCopy(id)
                    .then(({body: {data: {material}}}) => {
                        this.$set(this.$data, 'oldMaterial', material);
                        this.oldMaterialLoading = false;
                    })
                    .catch(() => {
                        this.oldMaterialLoading = false;
                    });
            },
            // 关闭弹窗
            closeCompareModal() {
                this.$set(this.$data, 'compareObj', {});
            },
            /**
             * 选择
             * @param version
             */
            chooseVersion(version) {
                this.compareObj.status = version;
                this.$set(this.$data, 'compareObj', {});
                this.$set(this.$data, 'oldMaterial', {});
                this.$set(this.$data, 'newMaterial', {});
            },
            //获取分群
            fetchSwarms() {
                ContactApiV1
                    .getSwarms()
                    .then(({body: {data: {swarmList}}}) => {
                        // 删除"全部联系人"
                        this.swarms = swarmList.filter(s => s.id !== this.hiddenId);
                    });
            },
            // 开始旅程前校验是否有新版本
            async startJourneyValid(operateType, isContinue = false) {
                if (isContinue) {
                    // 判断继续旅程的权限
                    const result = await JourneyApiV3
                        .checkStatus(this.journey.id, 1)
                        .then(({ body }) => body);
                    if (result.code !== 200) {
                        this.$toast(result.message, 'warn');
                        return;
                    }
                }
                // 旅程版本检查
                this.CHECK_JOURNEY_NEW_VERSION()
                    .then(() => {
                        this.startJourney(operateType);
                    })
                    .catch(() => {
                        this.UPDATE_SAVE_TASK_STATUS(false);
                    });
            },
            /**
             * 开始旅程
             * @param operateType
             * @returns {Promise<void>}
             */
            async startJourney(operateType) {
                // 开始前清除选择的测试分群
                this.startMethod = '';
                this.testSwarmId = '';
                const journey = this.storeName;
                this.operateType = operateType;
                if (this.journey.journeyStatus !== 7) {
                    await JourneyApiV3.updateJourney(Object.assign(
                        {}, journey.journeyInformation,
                        {canvasInformation: JSON.stringify(journey.canvasInformation)}
                    ))
                        .then(({body: {data: {journey}}}) => {
                            delete journey.canvasInformation;
                            this.SET_JOURNEY(journey);
                            // 保存成功，展示 2s 提示
                            this.SET_SAVE_NOTICE(true);
                            setTimeout(() => {
                                this.SET_SAVE_NOTICE(false);
                            }, 2000);
                            this.isContinue = true;
                        })
                        .catch(({body}) => {
                            this.isContinue = false;
                            this.$toast( body.message, 'warn');
                        });
                }

                if (
                    this.journey.journeyType === 2 &&
                    (
                        this.journey.journeyStatus === 0
                        || this.journey.journeyStatus === 8
                        || this.journey.journeyStatus === 7
                        || this.journey.journeyStatus === 10 // 审批被拒
                    )
                ) {
                    this.showStartModal();
                } else {
                    if (this.isContinue) {
                        this.validateModalShow = true;
                    }
                }
            },
            // 暂停旅程
            pauseJourney() {
                JourneyApiV3
                    .pauseJourney(~~this.$route.params.id)
                    .then(() => {
                        this.$toast(this.$t('dragJourney.paused'), 'success');
                        trackEvent('暂停旅程');
                        window.setTimeout(() => {
                            window.location.reload();
                        }, 300);
                    });
            },
            // 申请审批
            pendingJourney() {
                this.startJourneyValid(1);
            },
            // 撤回审批
            withdrawJourney() {
                this.$confirm(this.$t('dragJourney.confirmWithDraw'), this.$t('dragJourney.withdrawMsg'))
                    .then(sure => {
                        if (sure) {
                            JourneyApiV3
                                .revocationPending(this.journey.id)
                                .then(res => {
                                    this.$toast(res.body.message, 'success');
                                    window.location.reload();
                                });
                        }
                    });
            },
            // 审批旅程
            approvalJourney() {
                this.startJourneyValid(2);
            },
            // 关闭旅程校验
            closeValidateModal() {
                // 申请审批
                if (this.operateType === 1) {
                    this.startMethod = 'test';
                } else {
                    this.testSwarmId = '';
                }
                this.validateModalShow = false;
            },
            // 测试前选择分群
            pickASwarm() {
                this.startMethod = 'test';
                this.fetchSwarms();
                this.pickSwarmModalShow = true;
            },
            //中止测试
            abortTest() {
                this.testSwarmId = '';
                this.pickSwarmModalShow = false;
            },
            //开始弹窗
            showStartModal() {
                this.fetchSwarms();
                this.startModalShow = true;
            },
            //关闭弹窗
            closeStartModal() {
                this.testSwarmId = '';
                this.startMethod = '';
                this.startModalShow = false;
            },
            // 测试
            async testJourney() {
                if (this.startMethod === 'test' && !this.testSwarmId) {
                    this.$toast(this.$t('dragJourney.selectiveSlustering'), 'warn');
                    return;
                }
                if (this.startMethod === 'test') {
                    // 判断测试旅程的权限
                    const result = await JourneyApiV3
                        .checkStatus(this.journey.id, 0)
                        .then(({ body }) => body);
                    if (result.code !== 200) {
                        this.$toast(result.message, 'warn');
                        return;
                    }
                }
                this.SET_TEST_SWARM_ID(this.testSwarmId);

                if (this.journey.journeyStatus !== 7) {
                    this.SAVE_JOURNEY();
                }
                this.SET_START_METHOD(this.startMethod);
                this.pickSwarmModalShow = false;
                this.startModalShow = false;
                this.startMethod = '';
                this.validateModalShow = true;
            },
            // 开始
            async start() {
                this.$toast(this.$t('journeyList.perform'), 'warn');

                if (this.starting) return;
                this.starting = true;

                try {
                    // 旅程开始前，实时旅程的所有控件都要自动补全结束控件
                    if (this.journey.journeyType === 2) {
                        await this.createEndControl();
                    }

                    // 有测试分群则进入测试流程，没有则正式开始
                    if (this.testSwarmId) {
                        await JourneyApiV3
                            .testJourney(this.journey.id, this.testSwarmId)
                            .then(() => {
                                trackEvent('开始测试旅程');
                            });
                    } else {
                        let taskList = this.materialList.map(({taskId, status}) => ({taskId, status: status ? 1 : 0}));
                        //审批操作，审批状态传 0
                        let approvalStatus = this.operateType === 2 ? 0 : '';
                        await JourneyApiV3
                            .startJourney(this.journey.id, taskList, approvalStatus)
                            .then(() => {
                                trackEvent('开始旅程');
                            });
                    }

                    window.location.reload();
                } catch (e) {
                    this.starting = false;
                }
            },
            // 创建结束按钮
            async createEndControl() {
                for (let fromControllerId in this.controllers) {
                    if (!this.controllers.hasOwnProperty(fromControllerId)) {
                        continue;
                    }
                    const fromController = this.controllers[fromControllerId];
                    const outputTypes = 'output1' in fromController ? ['output1', 'output2'] : ['output'];
                    // 结束控件不需要自动结束
                    if (fromController.type === END_CONTROLLER) {
                        continue;
                    }
                    outputTypes.forEach(outputType => {
                        if (fromController[outputType] && fromController[outputType].length === 0) {
                            let newEndController = {
                                id: uniqId(),
                                name: this.$t('dragJourney.exit'),
                                type: END_CONTROLLER,
                                left: fromController.left + 150,
                                top: outputType === 'output' ? fromController.top : fromController.top + 150,
                                input: [],
                                summary: '',
                                processInfo: {type: 'end'}
                            };
                            this.ADD_NEW_CONTROLLER(newEndController);
                            this.ADD_ARROW({
                                from: Number(fromControllerId),
                                to: newEndController.id,
                                outputType
                            });
                        }
                    });
                }
                await this.SAVE_JOURNEY();
            }
        },
        computed: {
            ...mapGetters({
                onPending: 'onPending',
                journeyWritable: 'journeyWritable',
                // 是否可以审批 0不可（申请人） 1可以（审批人）
                isApproval: 'journeyApprove'
            }),
            ...mapState({
                userInfo: state => state.user,
                // 特殊id,用于隐藏'全部联系人'项
                hiddenId: state => state.canvasStore.hiddenId,
                storeName: state => state[DRAGGABLE_JOURNEY_STORE_NAME]
            }),
            // 旅程
            journey() {
                return this.storeName.journeyInformation;
            },
            controllers(){
                return this.storeName.canvasInformation.controllers;
            },
            allowStart() {
                // 实时旅程在暂停、测试结束，不可编辑，但是可以开始
                // 5 已暂停
                // 7 测试结束
                return this.journeyWritable
                    || (this.journey.journeyType === 2
                        && (this.journey.journeyStatus === 5 || this.journey.journeyStatus === 7));
            },
            //自定义num，区分显示 开始/继续 btn的显隐 0：开始，1：继续， 2：暂停
            btnText() {
                if (this.journey.journeyStatus === 0
                    || this.journey.journeyStatus === 7
                    || this.journey.journeyStatus === 8
                    || this.journey.journeyStatus === 10
                    || this.journey.journeyStatus === 9) {
                    return 0;
                }
                if (this.journey.journeyStatus === 1) return 2;
                if (this.journey.journeyStatus === 5) return 1;
            },
            allowPause() {
                // 进行中的非重复旅程是可以被暂停的
                return this.journey.journeyType !== 1
                    && this.journey.journeyStatus === 1
                    && !this.journey.repeatCount
                    && !this.journey.repeatEndDate
                    && !this.$route.query.calendarView;
            },
            // 旅程申请人（创建人）
            founder() {
                return this.userInfo.email === this.journey.createName;
            },
            // 申请审批
            allowPending() {
                // 1.有审批权限 2.当前用户是旅程创建人 3.旅程状态是未开始、暂停、审批被拒、测试完成、非待审批
                const status = this.journey.journeyStatus;
                if (this.userInfo.canApproval && this.userInfo.approvalState && this.founder
                    && status !== 9
                    && (status === 0 || status === 5 || status === 7 || status === 8 || status === 10))
                    return true;
            },
            // 撤回
            allowWithdraw() {
                // 1.有审批权限 2.当前用户是旅程创建人 3.旅程状态是待审批
                if (!this.userInfo.canApproval) return false;
                if (this.founder && this.journey.journeyStatus === 9 &&
                    this.userInfo.canApproval && this.userInfo.approvalState) return true;
            },
            // 审批
            allowApproval() {
                // 1.有审批权限 2.旅程状态是待审批且当前用户可以审批
                if (!this.userInfo.canApproval) return false;
                if (this.journey.journeyStatus === 9 && this.isApproval
                    && this.userInfo.canApproval && this.userInfo.approvalState) return true;
            },
            // 旅程是否正在更新中， 包括更新任务、删除后更新
            journeySaving() {
                return this.storeName.journeySaving;
            }
        }
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";

    .journey-actions {
        float: right;

        .ml8 {
            margin-left: 8px;
        }

        .start-tips {
            line-height: 20px;
        }

        .choose-group {
            margin-left: 24px;

            .selector {
                margin-left: 15px;
            }
        }

        .pk-action {
            display: inline-block;
            width: 24px;
            height: 24px;
            line-height: 24px;
            text-align: center;
            border: 1px solid $purple;
            background-color: $purple;
            color: #fff;
            border-radius: 50%;
            margin: 0 auto;

            &:hover {
                background-color: $light-purple;
                border: 1px solid $light-purple;
            }
        }

        .compare-content {
            display: flex;
            flex-direction: row;

            .pk-content {
                display: flex;
                flex: 1;
                flex-direction: row;
                align-items: center;
            }

            .compare-version {
                width: 46%;
                text-align: center;

                .version-content {
                    height: 300px;
                    margin-bottom: $input-field-height/2;
                    border: 1px solid $border-color;

                    .no-material {
                        margin-top: 132px;
                    }
                }
            }

            &.lg-versiton {
                .version-content {
                    height: auto;

                    .no-material {
                        margin-top: 50%;
                    }
                }
            }

            .email-preview-frame {
                height: 300px;
            }

            .material-preview-wrapper {
                height: 480px;
                overflow-y: scroll;
            }
        }
    }
</style>
