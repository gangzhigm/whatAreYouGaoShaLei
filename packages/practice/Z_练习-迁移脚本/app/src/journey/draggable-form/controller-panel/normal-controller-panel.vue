<template>
    <div class="controller-panel">
        <!-- 受众来源 -->
        <div class="controller-type-group" :class="{active: view === 'source'}" @click="toggleView('source')">
            <i class="icon icon-mubiaoshouzhong"></i>
            <span class="name">{{'dragJourney.recipients' | t}}</span>
        </div>
        <recipients v-if="view === 'source'" @labelDragStart="labelDragStart"/>

        <!-- 发送渠道 -->
        <div class="controller-type-group" :class="{active: view === 'channel'}" @click="toggleView('channel')">
            <i class="icon icon-duoqutuisong"></i>
            <span class="name">{{'dragJourney.sendOptions' | t}}</span>
        </div>
        <channels v-if="view === 'channel'" @labelDragStart="labelDragStart"/>

        <!-- 流程控制 -->
        <div class="controller-type-group" :class="{active: view === 'operation', 'bottom-border': view !== 'operation'}"
             @click="toggleView('operation')">
            <i class="icon icon-liuchengkongzhi"></i>
            <span class="name">{{'dragJourney.flowActions' | t}}</span>
        </div>
        <transition name="normal-journey-slide">
            <div class="process-control" v-if="view === 'operation'">
                <ul class="process-wrapper">
                    <li v-for="controller in controllers" draggable
                        @dragstart="labelDragStart(controller, $event)">
                        <template>
                            <img class="process-img" v-if="controller.view === 'img'" :src="getImgSrc(controller.img)">
                            <i :class="controller.icon" class="icon" v-else/>
                        </template>
                        <p :class="controller.view ==='img' ? 'name-img' : 'name'">{{controller.name}}</p>
                        <i class="icon icon-tuozhuai"></i>
                    </li>
                </ul>
            </div>
        </transition>
    </div>
</template>
<script type="text/ecmascript-6">
    import Recipients from './controller-source/recipients.vue';
    import Channels from './controller-source/channels.vue';
    import {DRAGGING_NEW_CONTROLLER} from '@/store/vuex/mutationTypes';
    import {
        AB_TEST_CONTROLLER, ADD_CONTACT_TAG_CONTROLLER, ADD_FANS_TAG_CONTROLLER,
        DECISION_CONTROLLER, DELETE_CONTACT_TAG_CONTROLLER, DELETE_FANS_TAG_CONTROLLER,
        LEADS_TRANSFER,
        NEW_AB_TEST_CONTROLLER
    } from '../canvas/controller/CONTROLLER_TYPES';
    import { mapGetters, mapMutations, mapState } from 'vuex';

    export default {
        data() {
            return {
                view: 'operation',
                controllers: [
                    {
                        icon: 'icon-tiaojianfenzhi',
                        name: this.$t('controller.conditionSplit'),
                        ind: 0,
                        type: DECISION_CONTROLLER,
                        view: 'icon', // 控件：icon类型
                    },
                    {
                        icon: 'icon-suiji',
                        name: this.$t('controller.randomSplit'),
                        ind: 1,
                        type: AB_TEST_CONTROLLER,
                        view: 'icon', // 控件：icon类型
                    },

                    // 联系人标签
                    {
                        name: this.$t('dragJourney.addContactTag'),
                        img: 'add-label',
                        ind: 2,
                        type: ADD_CONTACT_TAG_CONTROLLER,
                        view: 'img', // 控件：img类型
                    },
                    {
                        name: this.$t('dragJourney.removeContactTag'),
                        img: 'delete-label',
                        ind: 3,
                        type: DELETE_CONTACT_TAG_CONTROLLER,
                        view: 'img', // 控件：img类型
                    },
                    // 粉丝标签
                    {
                        name: this.$t('dragJourney.addFansTag'),
                        img: 'add-label',
                        ind: 4,
                        type: ADD_FANS_TAG_CONTROLLER,
                        view: 'img', // 控件：img类型
                    },
                    {
                        name: this.$t('dragJourney.removeFansTag'),
                        img: 'delete-label',
                        ind: 5,
                        type: DELETE_FANS_TAG_CONTROLLER,
                        view: 'img', // 控件：img类型
                    },
                    {
                        icon: 'icon-ABceshi',
                        name: this.$t('controller.ABTest'),
                        ind: 6,
                        type: NEW_AB_TEST_CONTROLLER,
                        view: 'icon', // 控件：icon类型
                    },
                ]
            };
        },
        computed: {
            ...mapGetters(['onPending']),
            ...mapState({
                companyType: state => state.user.companyType
            })
        },
        mounted() {
            // 华为定制 线索传递
            if (this.companyType === 1) {
                this.controllers.push({
                    name: this.$t('dragJourney.leadTag'),
                    icon: 'icon-xiansuo',
                    type: LEADS_TRANSFER,
                    ind: 1,
                });
            }
        },
        methods: {
            ...mapMutations([
                DRAGGING_NEW_CONTROLLER
            ]),
            toggleView(view) {
                if (this.view === view) {
                    this.view = '';
                } else {
                    this.view = view;
                }
            },
            labelDragStart(controller, evt) {
                if (this.onPending) {
                    this.$toast(this.$t('dragJourney.delayOperate'), 'warn');
                    return;
                }
                if (evt) evt.dataTransfer.setData('text/plain', 'compatFireFox');
                // 开始拖拽: 把拖动标签的数据提交，暂存到vuex
                this.DRAGGING_NEW_CONTROLLER(controller);
            },
            /**
             * 获取img name
             * @param name
             * @returns {any}
             */
            getImgSrc(name) {
                return new URL(`./images/${name}.png`, import.meta.url).href;
            }
        },
        components: {Recipients, Channels}
    };
</script>

<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    @import "../journey-variables";
    @import "controller-panel";

    .controller-panel {
        float: left;
        position: relative;
        overflow: hidden;
        width: $wide-panel-width - 1px;
        height: calc(100vh - #{$header-height + $toolbar-height + $page-head-height});
        background: white;
        border-right: 1px solid $border-color;
        border-bottom: 1px solid $border-color;
        user-select: none;

        .channels,
        .recipients {
            height: calc(100% - (51px * 3));
            overflow: auto;
        }
        // transition动画样式 start
        .normal-journey-slide-leave-active {
            overflow: hidden !important;
            @include transition(all .5s ease);
            @include transform-origin(center top);
        }
        .normal-journey-slide-leave-to {
            height: 0 !important;
            overflow: hidden !important;
            opacity: 0.8;
        }
        // transition动画样式 end
        .process-control {
            height: calc(100% - (51px * 3));
            overflow: auto;
            transition-duration: .5s;

            .process-wrapper {
                height: 100%;
                @include clearfix();
            }

            li {
                position: relative;
                float: left;
                box-sizing: border-box;
                margin: 12px 17px;
                width: 120px;
                height: 120px;
                text-align: center;
                border: 1px solid $border-color;

                &:hover,
                &.dragging {
                    background: #f0f0f0;
                    cursor: move;

                    .icon-tuozhuai {
                        visibility: visible;
                    }
                }

                $process-img-top: 20px;

                .process-img {
                    position: relative;
                    top: $process-img-top;
                }

                .icon {
                    line-height: 78px;
                    color: $color-light-content;
                }

                .icon-tiaojianfenzhi {
                    font-size: 60px;
                }

                .icon-ABceshi {
                    font-size: 72px;
                }

                .icon-suiji {
                    font-size: 45px;
                }

                .icon-tuozhuai {
                    visibility: hidden;
                    font-size: 30px;
                    position: absolute;
                    top: 20px;
                    right: 0;
                }

                .icon-xiansuo {
                    font-size: 45px;
                }

                .name {
                    font-size: 14px;
                    color: $color-content;
                    @include user-select(none);
                }

                .name-img {
                    font-size: 14px;
                    margin-top: $process-img-top + 15px;
                    color: $color-content;
                    @include user-select(none);
                }
            }
        }
    }
</style>
