<template>
    <div class="realtime-controller-panel">
        <div class="controller-type-group" :class="{active: view === 'channel'}" @click="toggleView('channel')">
            <i class="icon icon-duoqutuisong"></i>
            <span class="name">{{'dragJourney.sendOptions' | t}}</span>
        </div>

        <channels v-if="view === 'channel'" @labelDragStart="labelDragStart"/>

        <!--实时流程操作-->
        <div class="controller-type-group" :class="{active: view === 'operation', 'bottom-border': view !== 'operation'}" @click="toggleView('operation')">
            <i class="icon icon-setting"></i>
            <span class="name">{{'dragJourney.flowActions' | t}}</span>
        </div>
        <transition name="operation-slide">
            <template v-if="view === 'operation'">
                <div class="operations-wrapper">
                    <ul class="realtime-journey-operations">
                        <li v-for="operation of operations" :key="operation.type" draggable
                            @dragstart="labelDragStart(operation, $event)">
                            <img :src="getImgSrc(operation.img)">
                            <p class="name">{{operation.name}}</p>
                        </li>
                    </ul>
                </div>
            </template>
        </transition>
    </div>
</template>

<script type="text/ecmascript-6">
    import Channels from './controller-source/channels.vue';
    import {DRAGGING_NEW_CONTROLLER} from '@/store/vuex/mutationTypes';
    import {
        ADD_CONTACT_TAG_CONTROLLER,
        ATTRIBUTE_CONDITION_CONTROLLER,
        DELETE_CONTACT_TAG_CONTROLLER,
        ADD_FANS_TAG_CONTROLLER,
        DELETE_FANS_TAG_CONTROLLER,
        END_CONTROLLER,
        EVENT_CONDITION_CONTROLLER,
        TAG_CONDITION_CONTROLLER,
        LEADS_TRANSFER
    } from '../canvas/controller/CONTROLLER_TYPES';
    import { mapGetters, mapMutations, mapState } from 'vuex';

    export default {
        data() {
            return {
                //当前展开控件
                view: 'operation',
                //  旅程控件
                operations: [
                    // 联系人标签
                    {name: this.$t('dragJourney.addContactTag'), img: 'add-label', type: ADD_CONTACT_TAG_CONTROLLER},
                    {name: this.$t('dragJourney.removeContactTag'), img: 'delete-label', type: DELETE_CONTACT_TAG_CONTROLLER},
                    // 粉丝标签
                    {name: this.$t('dragJourney.addFansTag'), img: 'add-label', type: ADD_FANS_TAG_CONTROLLER},
                    {name: this.$t('dragJourney.removeFansTag'), img: 'delete-label', type: DELETE_FANS_TAG_CONTROLLER},
                    {
                        name: this.$t('dragJourney.eventCondition'),
                        img: 'event-decision',
                        type: EVENT_CONDITION_CONTROLLER
                    },
                    {
                        name: this.$t('dragJourney.attrCondition'),
                        img: 'attr-decision',
                        type: ATTRIBUTE_CONDITION_CONTROLLER
                    },
                    {
                        name: this.$t('dragJourney.tagCondition'),
                        img: 'tag-decision',
                        type: TAG_CONDITION_CONTROLLER
                    },
                    {name: this.$t('dragJourney.exit'), img: 'end', type: END_CONTROLLER}
                ]
            };
        },
        mounted() {
            // 华为定制 线索传递
            if (this.companyType === 1) {
                this.operations.splice(this.operations.length - 1,0,{
                    name: this.$t('dragJourney.leadTag'),
                    img: 'xiansuo',
                    type: LEADS_TRANSFER
                });
            }
        },
        computed: {
            ...mapGetters(['onPending']),
            ...mapState({
                companyType: state => state.user.companyType
            })
        },
        methods: {
            ...mapMutations([
                DRAGGING_NEW_CONTROLLER,
            ]),
            toggleView(view) {
                if (this.view === view) {
                    this.view = '';
                } else {
                    this.view = view;
                }
            },
            /**
             * 拖动控件
             * @param controller 控件
             * @param evt
             */
            labelDragStart(controller, evt) {
                if (this.onPending) {
                    this.$toast(this.$t('dragJourney.delayOperate'), 'warn');
                    return;
                }
                if (evt) evt.dataTransfer.setData('text/plain', 'compatFireFox');
                this.$emit('labelDragStart', controller);
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
        components: {Channels}
    };
</script>

<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    @import "../journey-variables";
    @import "controller-panel";

    .realtime-controller-panel {
        position: absolute;
        width: $wide-panel-width - 1px;
        height: calc(100vh - #{$header-height + $toolbar-height + $page-head-height});
        background: white;
        border-left: 1px solid $border-color;
        border-bottom: 1px solid $border-color;
        user-select: none;

        .channels {
            height: calc(100% - (51px * 2));
        }
        
        .operation-slide-leave-active {
            overflow: hidden !important;
            @include transition(all .5s ease);
            @include transform-origin(center top);
        }
        .operation-slide-leave-to {
            height: 0 !important;
            overflow: hidden;
            opacity: 0.8;
        }
        
        .operations-wrapper {
            height: calc(100% - (51px * 2));
            overflow: auto;
            .realtime-journey-operations {
                will-change: height;
                display: flex;
                flex-wrap: wrap;
                padding-bottom: 24px;
                align-items: flex-start;
                justify-content: start;
                width: 100%;
                transition-duration: .5s;
                @include clearfix();

                li {
                    position: relative;
                    @include box-sizing();
                    margin: 24px 17px 0;
                    padding-top: 20px;
                    border: 1px solid $border-color;
                    width: 120px;
                    height: 120px;
                    text-align: center;
                    color: $color-title;
                    cursor: pointer;

                    &:hover {
                        border-color: $form-border;
                        background-color: $content-bg;
                    }

                    .name {
                        font-size: 14px;
                        margin-top: 15px;
                        @include user-select(none);
                    }
                }
            }
        }
        // 覆盖实时/定时旅程共用的列表高度，因为实时只有2个大类，因此高度多一个51px
        .controller-source-lib .controller-source-list .controller-contents {
            height: calc(100vh - #{$header-height + $toolbar-height + $page-head-height + 51px * 2 + 53px + 46px});
        }
    }
</style>
