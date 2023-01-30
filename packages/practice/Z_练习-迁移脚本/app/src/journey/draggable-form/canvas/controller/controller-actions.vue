<template>
    <transition name="pop">
        <div class="controller-actions" :class="direction">
            <div class="controller-action-icon icon icon-pencil" @click.stop="editController"></div>
            <div v-if="deletable" class="controller-action-icon icon icon-delete"
                 @click.stop="deleteController"></div>
        </div>
    </transition>
</template>
<script type="text/ecmascript-6">
    import debounce from 'lodash/debounce';
    import { JourneyApiV3, NikeJourneyV3 } from '@/api';
    import {
        DELETE_CONTROLLER,
        REMOVE_MILESTONE,
        SET_ACTIVE_CONTROLLER,
        UPDATE_SAVE_TASK_STATUS
    } from '@/store/vuex/mutationTypes';
    import {
        EMAIL_CONTROLLER,
        SMS_CONTROLLER,
        MMS_CONTROLLER,
        START_CONTROLLER,
        WECHAT_CONTROLLER,
        EMAILTEMPLATE_CONTROLLER,
        NEW_AB_TEST_CONTROLLER,
        LEADS_TRANSFER,
        ADD_CONTACT_TAG_CONTROLLER,
        DELETE_CONTACT_TAG_CONTROLLER,
        ADD_FANS_TAG_CONTROLLER,
        DELETE_FANS_TAG_CONTROLLER,
        WECOM_CONTROLLER
    } from './CONTROLLER_TYPES';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {CHECK_JOURNEY_NEW_VERSION, SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';

    const HEIGHT = 48;
    export default {
        data() {
            return {
                direction: 'top'
            };
        },
        computed: {
            ...mapGetters(['onPending']),
            ...mapState({
                selectedControllerId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].selectedControllerId,
                controller(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation
                        .controllers[this.selectedControllerId];
                },
                journeyId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation.id,
                journeyType: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation.journeyType,
                pushInfo(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME]
                        .canvasInformation.controllers[this.controller.id].pushInfo;
                },
                journeyInfoState: state => state.canvasStore.journeyInformation
            }),
            deletable() {
                return this.controller.type !== START_CONTROLLER;
            }
        },
        mounted() {
            this.$el._scrollingParent = null;
            // 找出所有的滚动容器
            // 监听滚动容器的滚动事件，滚动会触发cancel
            let parent = this.$el.parentNode;
            while (parent !== document.body) {
                if ('auto' === window.getComputedStyle(parent)
                    .getPropertyValue('overflow')) {
                    parent.addEventListener('scroll', this.position, false);
                    this.$el._scrollingParent = parent;
                    break;
                }
                parent = parent.parentNode;
            }
            // 立即更新位置
            this.position();
        },
        beforeDestroy() {
            // 解除对容器滚动事件的监听
            this.$el._scrollingParent.removeEventListener('scroll', this.position, false);
            delete this.$el._scrollingParent;
        },
        methods: {
            ...mapActions([
                CHECK_JOURNEY_NEW_VERSION,
                SAVE_JOURNEY
            ]),
            ...mapMutations([
                SET_ACTIVE_CONTROLLER,
                UPDATE_SAVE_TASK_STATUS,
                DELETE_CONTROLLER,
                REMOVE_MILESTONE
            ]),
            position: debounce(function () {
                let rect = this.$el.parentElement.getBoundingClientRect();
                this.direction = rect.top - HEIGHT >= this.$el._scrollingParent.offsetTop ? 'top' : 'bottom';
            }, 60, {'leading': true}),
            editController() {
                this.SET_ACTIVE_CONTROLLER(this.controller.id);
            },
            deleteController() {
                if (this.onPending) {
                    this.$toast(this.$t('dragJourney.delayOperate'),'warn');
                    return;
                }
                // 移除里程牌
                this.REMOVE_MILESTONE(this.controller.id);
                // 新AB控件保存后才调用特定删除接口
                let pushInfo = this.pushInfo;
                // 进入任务pending状态
                this.UPDATE_SAVE_TASK_STATUS(true);
                if (
                    this.controller.type === EMAIL_CONTROLLER
                    || this.controller.type === SMS_CONTROLLER
                    || this.controller.type === MMS_CONTROLLER
                    || this.controller.type === WECHAT_CONTROLLER
                    || this.controller.type === LEADS_TRANSFER
                    || this.controller.type === WECOM_CONTROLLER
                ) {
                    this.CHECK_JOURNEY_NEW_VERSION()
                        .then(() => {
                            // 邮件、短信、微信控件：调用删除接口之后才能删除
                            JourneyApiV3
                                .deleteTask(this.controller.pushInfo.taskId, 0, this.controller.id)
                                .then(() => {
                                    // 结束任务pending状态
                                    this.UPDATE_SAVE_TASK_STATUS(false);
                                    this.DELETE_CONTROLLER(this.controller.id);
                                    this.SAVE_JOURNEY(false);
                                })
                                .catch(() => {
                                    this.UPDATE_SAVE_TASK_STATUS(false);
                                });
                        })
                        .catch(() => {
                            this.UPDATE_SAVE_TASK_STATUS(false);
                        });
                } else if (this.controller.type === EMAILTEMPLATE_CONTROLLER) {
                    this.CHECK_JOURNEY_NEW_VERSION()
                        .then(() => {
                            // 分批发送删除
                            let state = this.journeyInfoState;
                            NikeJourneyV3
                                .delBatchTask(state.id, this.controller.id)
                                .then(() => {
                                    this.UPDATE_SAVE_TASK_STATUS(false);
                                })
                                .catch(() => {
                                    this.UPDATE_SAVE_TASK_STATUS(false);
                                });
                            this.DELETE_CONTROLLER(this.controller.id);
                            this.SAVE_JOURNEY(false);
                        })
                        .catch(() => {
                            this.UPDATE_SAVE_TASK_STATUS(false);
                        });
                } else if (this.controller.type === NEW_AB_TEST_CONTROLLER && pushInfo) {
                    // 新AB测试控件删除
                    this.CHECK_JOURNEY_NEW_VERSION()
                        .then(() => {
                            JourneyApiV3
                                .deleteABController(this.controller.id, this.journeyId)
                                .then(() => {
                                    this.UPDATE_SAVE_TASK_STATUS(false);
                                    this.DELETE_CONTROLLER(this.controller.id);
                                    this.SAVE_JOURNEY(false);
                                })
                                .catch(() => {
                                    this.UPDATE_SAVE_TASK_STATUS(false);
                                });
                        })
                        .catch(() => {
                            this.UPDATE_SAVE_TASK_STATUS(false);
                        });
                } else if (this.journeyType !== 2 && (this.controller.type === ADD_CONTACT_TAG_CONTROLLER
                    || this.controller.type === DELETE_CONTACT_TAG_CONTROLLER
                    || this.controller.type === ADD_FANS_TAG_CONTROLLER
                    || this.controller.type === DELETE_FANS_TAG_CONTROLLER)) {
                    // 定时旅程-删除 添加联系人标签、移除联系人标签、添加粉丝标签、移除粉丝标签 控件：调用删除接口之后才能删除
                    this.CHECK_JOURNEY_NEW_VERSION()
                        .then(() => {
                            // 邮件、短信、微信控件：调用删除接口之后才能删除
                            JourneyApiV3
                                .deleteTask(this.controller.pushInfo.taskId, 0, this.controller.id)
                                .then(() => {
                                    this.UPDATE_SAVE_TASK_STATUS(false);
                                    this.DELETE_CONTROLLER(this.controller.id);
                                    this.SAVE_JOURNEY(false);
                                })
                                .catch(() => {
                                    this.UPDATE_SAVE_TASK_STATUS(false);
                                });
                        })
                        .catch(() => {
                            this.UPDATE_SAVE_TASK_STATUS(false);
                        });
                } else {
                    this.UPDATE_SAVE_TASK_STATUS(false);
                    // 其他控件直接删除
                    this.DELETE_CONTROLLER(this.controller.id);
                    this.SAVE_JOURNEY();
                }
            }
        }
    };
</script>
<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .controller-actions {
        $height: 36px;
        $width: 76px;

        position: absolute;
        display: flex;
        z-index: 1;
        width: $width;
        height: $height;
        left: 50%;
        margin-left: -$width/2;
        border-radius: 4px;
        text-align: center;
        background-color: black;
        cursor: pointer;
        @include transition();

        &.top {
            bottom: 100%;
            margin-bottom: 8px;

            &:after {
                bottom: -4px;
                @include transform(translateX(-50%) rotate(45deg));
            }
        }

        &.bottom {
            top: 100%;
            margin-top: 0px;

            &:after {
                top: -4px;
                @include transform(translateX(-50%) rotate(-135deg));
            }
        }

        .controller-action-icon {
            flex: 1;
            line-height: $height;
            font-size: 18px;
            color: $form-border;
            @include transition(color .2s ease);

            &:hover {
                color: white;
            }
        }

        &:after {
            content: '';
            position: absolute;
            left: $width/2;
            width: 8px;
            height: 8px;
            z-index: -1;
            border-bottom-right-radius: 2px;
            background-color: black;
        }
    }
</style>
