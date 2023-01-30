<template>
    <div class="sub-actions">
        <!-- 测试结束编辑 -->
        <button class="action" type="button"
                v-if="actions.includes('testEditJourney')"
                v-title:top.line="$t('sharing.testEndEditor')"
                @click="edit"
                :disabled="$has('journey_manage_test_edit') || onPending">
            <i class="icon icon-bianji"></i>
        </button>
        <!-- 保存 -->
        <button class="action" type="button"
                v-if="actions.includes('SaveJourney')"
                v-title:top.line="$t('dragJourney.save')"
                :disabled="onPending"
                @click="saveJourney">
            <i class="icon icon-baocun"></i>
        </button>
        <!-- 测试旅程 -->
        <button class="action" type="button"
                v-if="actions.includes('testJourney')"
                v-title:top.line="$t('dragJourney.test')"
                :disabled="$has('journey_manage_test_journey') || onPending"
                @click="$emit('test')">
            <i class="icon icon-flask"></i>
        </button>
        <!-- 结束测试 -->
        <button class="action" type="button"
                v-if="actions.includes('stopTest')"
                v-title:top.line="$t('dragJourney.stopTest')"
                @click="stopTestRequest"
                :disabled="$has('journey_manage_test_end') || onPending">
            <i class="icon icon-pause"></i>
        </button>
        <!-- 删除 -->
        <button class="action" type="button"
                v-if="actions.includes('deleteJourney')"
                v-title:top.line="$t('common.del')"
                @click="deleteJourney"
                :disabled="$has('journey_manage_delete_journey') || onPending">
            <i class="icon icon-delete"></i>
        </button>
        <!-- 取消 -->
        <button class="action" type="button"
                v-if="!this.$route.query.calendarView && actions.includes('CancelJourney')"
                v-title:top.line="$t('dragJourney.cancel')"
                @click="cancelJourney"
                :disabled="$has('journey_manage_cancel_journey') || onPending">
            <i class="icon icon-quxiao"></i>
        </button>

        <!-- 日历视图 -->
        <button class="action" type="button"
                v-if="actions.includes('goCalendar')"
                v-title:top.line="$t($route.query.calendarView ? 'dragJourney.canvas' : 'dragJourney.calendar')"
                :disabled="onPending"
                @click="toggleCalendar">
            <i class="icon icon-flow" v-if="$route.query.calendarView"></i>
            <i class="icon icon-rili" v-else></i>
        </button>
        <!-- 查看报告 -->
        <button class="action" type="button"
                v-if="actions.includes('checkReport')"
                v-title:top.line="$t('dragJourney.report')"
                @click="checkReport"
                :disabled="$has('journey_manage_search_report') || onPending">
            <i class="icon icon-shuju"></i>
        </button>
        <!-- 日志 -->
        <button class="action" type="button" :disabled="$has('journey_manage_examine_log') || onPending"
            v-if="actions.includes('viewLog')"
                v-title:top.line="$t('dragJourney.approvalLog')" @click="viewLog">
            <i class="icon icon-log"></i>
        </button>
        <modal v-if="showLog" :title="$t('dragJourney.approvalLog')" @close="showLog = false" size="lg">
            <div class="simplify-table">
                <table>
                    <thead>
                    <tr>
                        <td>{{'dragJourney.result' | t}}</td>
                        <td>{{'dragJourney.reason' | t}}</td>
                        <td>{{'dragJourney.operationName' | t}}</td>
                        <td>{{'dragJourney.operationDate' | t}}</td>
                    </tr>
                    </thead>
                    <tbody :data-no-data="$t('common.noData')">
                    <tr v-for="(l, index) in logList" :key="index">
                        <td :title="l.operationEvent">{{l.operationEvent}}</td>
                        <td :title="l.reason">{{l.reason}}</td>
                        <td :title="l.operationBy">{{l.operationBy}}</td>
                        <td :title="l.operationDate">{{l.operationDate}}</td>
                    </tr>
                    </tbody>
                </table>
                <div class="no-data" v-if="logList.length === 0">{{'common.noData' | t}}</div>
            </div>
        </modal>
    </div>
</template>

<script type="text/ecmascript-6">
    import {logError} from '../../../monitor.js';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import { JourneyApiV3 } from '@/api';
    import {trackEvent} from '../../../monitor';
    import {SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import { mapActions, mapGetters, mapState } from 'vuex';

    const LOCAL_JOURNEY_DATA = 'LOCAL_JOURNEY_DATA';

    export default {
        data() {
            return {
                showLog: false, // 显示审批日志
                logList: [], // 日志列表
                logLoading: false,
            };
        },
        computed: {
            ...mapGetters(['onPending']),
            ...mapState({
                journey: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                userInfo: state => state.user,
            }),
            actions() {
                if (!this.journey.id) {
                    return [];
                }
                // 旅程状态：0:未开始 1:进行中 2:已完成 3:已取消 4:全部状态 5:已暂停 6:测试中 7-8 测试结束 9 待审批 10 审批被拒
                if (this.journey.journeyType === 2) {
                    // 实时旅程
                    switch (this.journey.journeyStatus) {
                        case 0:
                            return ['SaveJourney', 'testJourney', 'deleteJourney', 'viewLog'];
                        case 1:
                            return ['checkReport', 'viewLog'];
                        case 2:
                            return [];
                        case 5:
                            return ['checkReport', 'viewLog'];
                        case 6:
                            return ['stopTest', 'viewLog'];
                        case 7:
                            return ['testEditJourney', 'deleteJourney', 'viewLog'];
                        case 8:
                            return ['SaveJourney', 'testJourney', 'deleteJourney', 'viewLog'];
                        case 9: // 待审批旅程不能编辑
                            return ['viewLog'];
                        case 10: // 审批被拒 同 未开始
                            return ['SaveJourney', 'testJourney', 'deleteJourney', 'viewLog'];
                        default:
                            logError(`[营销旅程] <action-group /> computeActions 错误监控:错误的{journeyStatus:${this.journey}} :52`);
                            break;
                    }
                } else {
                    // 非实时旅程
                    switch (this.journey.journeyStatus) {
                        case 0:
                            return ['SaveJourney', 'deleteJourney', 'viewLog'];
                        case 1:
                            return ['goCalendar', 'checkReport', 'CancelJourney', 'viewLog'];
                        case 2:
                            return ['goCalendar', 'checkReport', 'viewLog'];
                        case 3:
                            return ['goCalendar', 'checkReport', 'viewLog'];
                        case 5:
                            return ['SaveJourney', 'CancelJourney', 'viewLog'];
                        case 9: // 待审批旅程不能编辑
                            return ['viewLog'];
                        case 10: // 审批被拒 同 未开始
                            return ['SaveJourney', 'deleteJourney', 'viewLog'];
                        default:
                            logError(`[营销旅程] <action-group /> computeActions 错误监控:错误的{journeyStatus:${this.journey}} :74`);
                            break;
                    }
                }
            },
            // 该用户是否有审批权限
            canApproval() {
                return this.userInfo.canApproval;
            },
            approvalState(){
                return this.userInfo.approvalState;
            },
        },
        methods: {
            ...mapActions([
                SAVE_JOURNEY
            ]),
            // 编辑
            edit() {
                JourneyApiV3
                    .testEdit(this.$route.params.id)
                    .then(() => {
                        location.reload();
                    });
            },
            // 保存
            saveJourney() {
                this.SAVE_JOURNEY();
            },
            // 结束测试
            stopTestRequest() {
                JourneyApiV3
                    .stopTest(this.$route.params.id)
                    .then(() => {
                        this.$toast(this.$t('journey.endTest'), 'success');
                        trackEvent('结束旅程测试');
                        location.reload();
                    });
            },
            // 删除
            deleteJourney() {
                this.$confirm(this.$t('common.delete'), this.$t('common.deleteSure'))
                    .then(sure => {
                        if (sure) {
                            JourneyApiV3
                                .deleteJourney(this.$route.params.id)
                                .then(() => {
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    trackEvent('删除旅程');
                                    this.$router.push({name: 'journeyRecords'});
                                });
                        }
                    });
            },
            // 取消
            cancelJourney() {
                this.$confirm(this.$t('common.confirmCancel'), this.$t('common.cancelSure'))
                    .then(sure => {
                        if (sure) {
                            JourneyApiV3.cancelJourney(~~this.$route.params.id)
                                .then(() => {
                                    this.$toast(this.$t('common.cancelSuccess'), 'success');
                                    trackEvent('取消旅程');
                                    window.setTimeout(() => {
                                        location.reload();
                                    }, 300);
                                });
                        }
                    });
            },
            // 日历视图
            async toggleCalendar() {
                let isAccess = await JourneyApiV3
                    .checkReportAccess(this.$route.params.id)
                    .then((res) => {
                        return res.body.code === 200 ? false : true;
                    });
                if (isAccess){
                    this.$toast(this.$t('components.noAuthorized'),'warn');
                    return;
                }
                const calendarView = this.$route.query.calendarView ? undefined : 1;
                const newRoute = Object.assign(
                    {},
                    this.$route,
                    {query: Object.assign({}, this.$route.query, {calendarView})}
                );
                this.$router.replace(newRoute);
            },
            // 查看报告
            async checkReport() {
                let isAccess = await JourneyApiV3
                    .checkReportAccess(this.$route.params.id)
                    .then((res) => {
                        return res.body.code === 200 ? false : true;
                    });
                if (isAccess){
                    this.$toast(this.$t('components.noAuthorized'),'warn');
                    return;
                }
                let journeyID = this.journey.journeyInstantiationId;
                trackEvent('查看旅程报告');
                let journeyData = {
                    dataSourceId: 1,
                    journeyId: this.journey.id,
                };
                localStorage.setItem(LOCAL_JOURNEY_DATA, JSON.stringify(journeyData));
                this.$router.push({
                    name: 'journeyReviewReport',
                    params: {journeyInstantiationId: journeyID}
                });
            },
            // 查看审批日志
            viewLog() {
                this.showLog = true;
                this.logLoading = true;
                JourneyApiV3
                    .getApprovalLog(this.journey.id)
                    .then(res => {
                        trackEvent('查看旅程审批日志');
                        this.logList = res.body.data.list;
                        this.logLoading = false;
                    })
                    .catch(() => {
                        this.logLoading = false;
                    });
            },
        }
    };
</script>

<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .sub-actions {
        position: relative;
        box-sizing: border-box;
        float: right;
        margin-right: 12px;

        .action {
            float: left;
            position: relative;
            width: $input-field-height;
            height: 100%;
            line-height: $input-field-height - 2px;
            text-align: center;
            border: 1px solid $border-color;
            padding: 0;
            cursor: pointer;
            background-color: white;

            &:first-of-type {
                border-top-left-radius: 4px;
                border-bottom-left-radius: 4px;
            }

            &:last-of-type {
                border-top-right-radius: 4px;
                border-bottom-right-radius: 4px;
            }

            i {
                display: block;
                font-size: 18px;
                font-weight: bold;
                color: $color-light-content;
            }

            &:disabled {
                i {
                    cursor: not-allowed;
                    color: $disabled;
                }
            }

            &:hover {
                color: $color-content;
                z-index: 1;
                @include box-shadow(0 1px 4px $form-border);
            }

            + .action {
                border-left: none;
            }
        }

        .no-data {
            text-align: center;
            font-style: italic;
            color: $color-light-content;
            margin-top: 16px;
        }
    }
</style>
