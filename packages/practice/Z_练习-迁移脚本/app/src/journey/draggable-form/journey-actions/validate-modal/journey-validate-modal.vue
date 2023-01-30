<template>
    <modal :title="$t('journey.validation')" @close="close">
        <div class="journey-validate-modal">
            <div class="validate-process" :class="status">
                <img v-if="status !== 'success'" src="./validate-plane.png" alt="">
                <h5 class="validate-process-text" v-if="status === 'start' || status === 'validating'">
                    <template v-if="status === 'start'">{{'journey.validatePrepare' | t}}</template>
                    <template v-if="status === 'validating'">{{'journey.validating' | t}}</template>
                </h5>
                <validate-progress v-if="!validateComplete || status === 'success'" :fill="fill"
                                   @transitionend="handleTransitionEnd"/>
                <div v-else class="notice-test">
                    <p class="report">
                        {{'journey.validationComplete' | t}}
                        <span v-if="status === 'success'">{{'journey.validationPass' | t}}</span>
                        <span v-if="status === 'error'">{{'journey.validationFail' | t}}</span>
                        <br>
                        <span class="red-text">{{errorMessage}}</span>
                    </p>
                </div>
            </div>
        </div>
        <template v-slot:buttons>
            <template v-if="status === 'error'">
                <!--旅程状态为 待审批 且 该用户可以审批 且 点击审批按钮-->
                <input v-if="journey.journeyStatus === 9 && isApproval && operateType === 2" type="button"
                       class="btn btn-theme btn-md"
                       :value="$t('dragJourney.sendBack')" @click="rejectedPending">
                <input v-else type="button" class="btn btn-theme btn-md" :value="$t('journey.goFix')" @click="close">
            </template>
            <template v-if="status === 'refresh'">
                <input type="button" class="btn btn-theme btn-md" :value="$t('dragJourney.ignore')" @click="start">
                <input type="button" class="btn btn-white btn-md" :value="$t('dragJourney.updateMaterial')"
                       @click="refreshMaterial">
            </template>
        </template>
    </modal>
</template>

<script type="text/ecmascript-6">
    import ValidateProgress from './validation-progress.vue';
    import { JourneyApiV3 } from '@/api';
    import {SET_VALIDATION_ERROR} from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore.js';
    import { mapGetters, mapMutations, mapState } from 'vuex';

    export default {
        components: {ValidateProgress},
        props: {
            testSwarmId: [Number, String],

            // 操作类型 0 开始，1 申请审批，2 审批
            operateType: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                requesting: false,
                fill: 0,
                validateComplete: false,
                errorId: false,
                errorMessage: '',
                intervalTimer: null,
                hasError: 0, // 0 = success , 1 = error
                materialStatus: 0, // 0 = 无更新  1 = 有更新
                materialList: []
            };
        },
        computed: {
            ...mapGetters([
                'journeyWritable',
                'journeyApprove'
            ]),
            ...mapState({
                journey: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                startMethod: state => state[DRAGGABLE_JOURNEY_STORE_NAME].startMethod
            }),
            status() {
                if (this.fill === 0) return 'start';
                if (Math.round(this.fill) === 100 && !this.requesting && !this.hasError && this.materialStatus) return 'refresh';
                if (Math.round(this.fill) === 100 && !this.requesting && !this.hasError && !this.materialStatus) return 'success';
                if (Math.round(this.fill) === 100 && !this.requesting && this.hasError) return 'error';
                return 'validating';
            },
            nextText() {
                return this.testSwarmId ? this.$t('journey.startTest') : this.$t('journey.startJourney');
            },
            allowStart() {
                // 实时旅程在暂停、测试结束时，不可编辑，但是可以开始
                // 审批被拒，可以开始，可以编辑
                return this.journeyWritable
                    || (
                        this.journey.journeyType === 2
                        && (
                            this.journey.journeyStatus === 5    // 已暂停
                            || this.journey.journeyStatus === 7 // 测试结束
                            || this.journey.journeyStatus === 9 // 待审批
                            || this.journey.journeyStatus === 10 // 审批被拒
                        )
                    );
            },
            // 是否可以审批
            isApproval() {
                return this.journeyApprove;
            },
        },
        watch: {
            fill() {
                if (this.validateComplete && !this.requesting) {
                    window.clearInterval(this.intervalTimer);
                    this.fill = 100;
                }
            },
            status(validateMessage) {
                /**
                 * journeyType === 1 或者 journeyType === 0 为定时旅程或单次旅程
                 * 或者为实时旅程,但是必须是正式的 start
                 */
                if (
                    ((this.journey.journeyType === 1 || this.journey.journeyType === 0) || (this.allowStart && this.startMethod === 'start'))
                    && validateMessage === 'success'
                ) {
                    this.initStatus();
                    this.$emit('success');
                } else if (

                    /**
                     * 如果是实时旅程, 并且是立即测试, 直接执行
                     * 如果是实时旅程, 并且是暂停状态的, 直接执行
                     * startMethod vuex中的状态默认为暂停
                     */
                    this.allowStart
                    && (this.startMethod === 'test' || this.startMethod === 'suspend')
                    && validateMessage === 'success'
                ) {
                    this.initStatus();
                    this.$emit('success');
                }
            }
        },
        mounted() {
            this.reValidate();
        },
        beforeDestroy() {
            window.clearInterval(this.intervalTimer);
        },
        methods: {
            ...mapMutations([SET_VALIDATION_ERROR]),
            close() {
                this.initStatus();
                this.$emit('close');
            },
            // 退回审批
            rejectedPending() {
                this.$confirm(this.$t('dragJourney.sendBack'), this.$t('dragJourney.confirmBack'))
                    .then(sure => {
                        if (sure) {
                            JourneyApiV3
                                .rejectedPending(this.journey.id, this.errorMessage)
                                .then(res => {
                                    this.$toast(res.body.message, 'success');
                                    this.close();
                                    window.location.reload();
                                });
                        }
                    });
            },
            refreshMaterial() {
                this.initStatus();
                this.$emit('refresh', this.materialList);
            },
            handleTransitionEnd() {
                this.validateComplete = true;
            },
            increaseFill() {
                if (this.requesting) {
                    window.clearInterval(this.intervalTimer);
                    this.intervalTimer = window.setInterval(() => {
                        if (this.fill < 100) this.fill += 5;
                    }, 10);
                }
            },
            initStatus() {
                this.requesting = false;
                this.fill = 0;
                this.validateComplete = false;
                this.errorId = null;
                this.hasError = 0;
                this.materialStatus = 0;
                this.errorMessage = '';
            },
            reValidate() {
                this.initStatus();
                this.requesting = true;
                this.increaseFill();
                window.setTimeout(this.checkJourneyRequest, 1000);
            },
            // 以下是 ajax
            checkJourneyRequest() {
                this.requesting = true;
                const approval = this.operateType === 0 ? 0 : 1;//是否提交检测 0:未提交 1：提交
                JourneyApiV3
                    .checkJourneyApproval(this.journey.id,approval)
                    .then(({body: {data: {error, id, status, materialStatus, materialList}}}) => {
                        this.hasError = status;
                        this.materialStatus = materialStatus || 0;
                        if (materialList) {
                            materialList.forEach(material => {
                                material.status = false;
                            });
                        }
                        this.materialList = materialList;
                        this.errorId = id;
                        this.errorMessage = error;
                        this.requesting = false;
                        this.fill = 100;
                        this.validateComplete = true;

                        this.SET_VALIDATION_ERROR({
                            id,
                            message: error,
                            justPass: status === 0
                        });
                    });
            },
            start() {
                this.initStatus();
                this.$emit('success');
            }
        }
    };
</script>
<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .journey-validate-modal {
        .validate-process {
            padding: 20px 45px 0;

            &.start,
            &.validating {
                background: url("validate-bg.png") no-repeat 52% 20px;

                img {
                    @include keyframes(floating) {
                        0% {
                            opacity: .2;
                            top: 15px;
                        }
                        30% {
                            opacity: .4;
                            top: 10px;
                        }
                        50% {
                            opacity: .6;
                            top: 15px;
                        }
                        100% {
                            opacity: 1;
                            top: 5px;
                        }
                    }
                    @include animation(floating 1.2s ease infinite alternate);
                }
            }

            &.complete {
                .icon-correct {
                    display: inline-block;
                    border-radius: 100%;
                    width: 15px;
                    line-height: 15px;
                    text-align: center;
                    color: white;
                    background-color: $green;
                }

                .icon-warn {
                    color: $red;
                }
            }

            img {
                position: relative;
                display: block;
                margin: 45px auto 60px;
            }
        }

        .validate-process-text {
            margin-bottom: 15px;
            font-weight: normal;
            line-height: 30px;
        }

        .notice-test {
            line-height: 1.6em;

            .report {
                margin-bottom: 15px;
                font-size: 14px;
                font-weight: bold;

                span:last-child {
                    line-height: 1.8em;
                }
            }
        }
    }
</style>
