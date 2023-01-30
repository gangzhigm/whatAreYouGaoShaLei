<template>
    <!-- AB测试控件modal -->
    <modal class="AB-test-controller-modal" :title="$t('controller.randomSplit')" @close="close">
        <!-- 编辑 -->
        <div v-if="writable && !isChecking" class="radio-box" @mousemove="sliderDrag($event)" @mouseup.stop="sliderDragend()">
            <div class="ratio-line">
                <template v-if="bRatio !== ''">
                    <div class="planA" :style="{width:aRatio*100+'%'}" v-title:top="Math.round(aRatio*100)+'%'"></div>
                    <div class="planB" :style="{width:bRatio*100+'%'}" v-title:top="BNum+'%'"></div>
                    <div class="planC" :style="{width:(1-aRatio-bRatio)*100+'%'}" v-title:top="Math.round((1-aRatio-bRatio)*100)+'%'"></div>
                    <div class="slider" :style="{left:aRatio*100-3.5 +'%'}" @mousedown="sliderDragstart($event)">
                        <i class="icon icon-tuozhuai1"></i>
                    </div>
                    <div class="slider" :style="{left:(aRatio + bRatio)*100 +'%'}" @mousedown="sliderTwoDragstart($event)">
                        <i class="icon icon-tuozhuai1"></i>
                    </div>
                </template>
                <template v-else>
                    <div class="planA" :style="{width:aRatio*100+'%'}" v-title:top="Math.round(aRatio*100)+'%'"></div>
                    <div class="planB" :style="{width:(1-aRatio)*100+'%'}" v-title:top="Math.round((1-aRatio)*100)+'%'"></div>
                    <div class="slider" :style="{left:aRatio*100-0.99+'%'}" @mousedown="sliderDragstart($event)"><i
                            class="icon icon-tuozhuai1"></i></div>
                </template>
            </div>
        </div>
        <!-- 编辑 & 查看详情 -->
        <div class="detail" :style="{height: bRatio !== '' ? '156px' : '100px'}">
            <div class="planA">
                <div class="left">
                    <div class="color"></div>
                </div>
                <p class="name">{{'controller.A' | t}}</p>
                <p class="right">{{Math.round(aRatio*100)}}%</p>
            </div>
            <div class="planB">
                <div class="left">
                    <div class="color"></div>
                </div>
                <p class="name">{{'controller.B' | t}}</p>
                <p v-if="bRatio !== ''" class="right">{{BNum}}%</p>
                <p v-else class="right">{{Math.round((1-aRatio)*100)}}%</p>
            </div>
            <div v-if="bRatio !== ''" class="planC">
                <div class="left">
                    <div class="color"></div>
                </div>
                <p class="name">{{'controller.C' | t}}</p>
                <p class="right">{{Math.round((1-aRatio-bRatio)*100)}}%</p>
            </div>
        </div>

        <template v-slot:buttons>
            <input v-if="writable && !isChecking" type="button" class="btn btn-md btn-theme" @click="confirm"
                   :value="$t('common.confirm')"/>
            <input v-else type="button" class="btn btn-md btn-white" @click="close"
                   :value="$t('common.close')"/>
        </template>
    </modal>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import cloneDeep from 'lodash/cloneDeep';
    import {AB_TEST_CONTROLLER, getModalName} from '../../CONTROLLER_TYPES';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {SET_ACTIVE_CONTROLLER, UPDATE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import {SAVE_JOURNEY} from '@/store/vuex/actionTypes';

    export default {
        name: getModalName(AB_TEST_CONTROLLER),
        data() {
            return {
                aRatio: .33,
                bRatio: .33,
                aPlusB: 0,
                slideBeforeLeft: '',
                slideTowBeforeLeft: ''
            };
        },
        computed: {
            ...mapState({
                storeName: state => state[DRAGGABLE_JOURNEY_STORE_NAME]
            }),
            activeControllerId() {
                return this.storeName.activeControllerId;
            },
            readonlyIds() {
                return this.storeName.readonlyControllerIds;
            },
            isChecking() {
                return this.storeName.isChecking;
            },
            controller() {
                return this.storeName.canvasInformation.controllers[this.activeControllerId];
            },
            writable() {
                // 定时旅程可编辑，且控件ID不在 readonlyIds 中
                return this.$store.getters.journeyWritable && !this.readonlyIds.includes(this.controller.id);
            },
            // 由于取百分比值为向上取整，可能出现ABC相加不足100%情况
            BNum() {
                return 100 - Math.round(this.aRatio * 100) - Math.round((1 - this.aRatio - this.bRatio) * 100);
            }
        },
        created() {
            this.aRatio = this.controller.processInfo.ABTest.aRatio;
            this.bRatio = this.controller.processInfo.ABTest.bRatio >= 0 ? this.controller.processInfo.ABTest.bRatio : '';
        },
        methods: {
            ...mapMutations([ 
                SET_ACTIVE_CONTROLLER,
                UPDATE_CONTROLLER,
                SET_ACTIVE_CONTROLLER
            ]),
            ...mapActions([
                SAVE_JOURNEY
            ]),
            sliderDragstart(e) {
                this.slideBeforeLeft = e.clientX;
                if (this.bRatio !== '') this.aPlusB = this.aRatio + this.bRatio;
            },
            sliderTwoDragstart(e) {
                this.slideTowBeforeLeft = e.clientX;
            },
            sliderDrag(e) {
                if (this.slideBeforeLeft === '' && this.slideTowBeforeLeft === '') return;
                if (this.bRatio !== '') {
                    if (this.slideBeforeLeft !== '') {
                        this.aRatio += (e.clientX - this.slideBeforeLeft) / 508;
                        if (this.aRatio <= 0) {
                            this.aRatio = 0;
                            this.bRatio = this.aPlusB;
                            return;
                        }
                        if (this.aRatio >= this.aPlusB) {
                            this.aRatio = this.aPlusB;
                            this.bRatio = 0;
                            return;
                        }
                        this.bRatio = this.aPlusB - this.aRatio;
                        this.slideBeforeLeft = e.clientX;
                    }
                    if (this.slideTowBeforeLeft !== '') {
                        this.bRatio += (e.clientX - this.slideTowBeforeLeft) / 508;
                        if (this.bRatio >= 1 - this.aRatio) {
                            this.bRatio = 1 - this.aRatio;
                            return;
                        }
                        if (this.bRatio <= 0) {
                            this.bRatio = 0;
                            return;
                        }
                        this.slideTowBeforeLeft = e.clientX;
                    }
                } else {
                    this.aRatio += (e.clientX - this.slideBeforeLeft) / 508;
                    if (this.aRatio >= 1) {
                        this.aRatio = 1;
                        return;
                    }
                    if (this.aRatio <= 0) {
                        this.aRatio = 0;
                        return;
                    }
                    this.slideBeforeLeft = e.clientX;
                }
            },
            sliderDragend() {
                this.slideBeforeLeft = '';
                this.slideTowBeforeLeft = '';
                this.aPlusB = 0;
            },
            close() {
                this.SET_ACTIVE_CONTROLLER('');
            },
            confirm() {
                let newController = cloneDeep(this.controller);
                newController.processInfo.ABTest.aRatio = Math.round(this.aRatio * 100) / 100;
                if (this.bRatio !== '') {
                    newController.processInfo.ABTest.bRatio = this.BNum / 100;
                    newController.processInfo.ABTest.cRatio = Math.round((1 - this.aRatio - this.bRatio) * 100) / 100;
                }
                this.UPDATE_CONTROLLER(newController);
                this.SAVE_JOURNEY();
                this.SET_ACTIVE_CONTROLLER('');
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .AB-test-controller-modal {
        .radio-box {
            width: 574px;
            padding: 15px 33px 25px;
            @include box-sizing();

            .ratio-line {
                position: relative;
                margin: 0 auto;
                width: 508px;
                height: 17px;

                .planA, .planB, .planC {
                    float: left;
                    height: 100%;
                }

                .planA {
                    background: #ead11a;
                }

                .planB {
                    background: #11da51;
                }

                .planC {
                    background: #7070ff;
                }

                .slider, .sliderTwo {
                    position: absolute;
                    top: -5px;
                    width: 18px;
                    height: 28px;
                    background: #dadada;
                    border-radius: 3px;
                    cursor: default;

                    .icon {
                        line-height: 28px;
                        font-size: 16px;
                        color: $color-content;
                    }
                }
            }
        }

        .detail {
            margin: 0 auto;
            width: 506px;

            .planA, .planB, .planC {
                height: 42px;
                border: 1px solid $border-color;

                .left, .name, .right {
                    float: left;
                    height: 100%;
                    font-size: 14px;
                    line-height: 42px;
                    text-align: left;
                }

                .left {
                    width: 42px;
                    border-right: 1px solid $border-color;

                    .color {
                        margin: 6px 0 0 6px;
                        width: 30px;
                        height: 30px;
                    }
                }

                .name {
                    width: 305px;
                    padding-left: 12px;
                }

                .right {
                    width: 132px;
                    padding-left: 12px;
                }
            }

            .planA {
                margin-bottom: 12px;

                .left {
                    .color {
                        background: #ead11a;
                    }
                }

                .name {
                    color: #917f01;
                }

                .right {
                    color: #917f01;
                    background: #fdfbe9;
                }
            }

            .planB {
                margin-bottom: 12px;

                .left {
                    .color {
                        background: #11da51;
                    }
                }

                .name {
                    color: #0ab240;
                }

                .right {
                    color: #0ab240;
                    background: #e6fceb;
                }
            }
            
            .planC {
                .left {
                    .color {
                        background: #7070ff;
                    }
                }

                .name {
                    color: #7070ff;
                }

                .right {
                    color: #7070ff;
                    background: #bcbcff;
                }
            }
        }
    }
</style>
