<template>
    <!-- 微信控件modal -->
    <!-- 表单 -->
    <wechat-controller-form v-if="writable || isChecking" :controller="controller" @close="close"/>
    <!-- 查看详情 -->
    <wechat-controller-view v-else :controller="controller" @close="close"/>
</template>

<script lang="jsx">
    import {getModalName, WECHAT_CONTROLLER} from '../../CONTROLLER_TYPES';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {SET_ACTIVE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import WechatControllerForm from './wechat-controller-form.vue';
    import WechatControllerView from './wechat-controller-view.vue';
    import { mapMutations, mapState } from 'vuex';

    export default {
        name: getModalName(WECHAT_CONTROLLER),
        components: {WechatControllerView, WechatControllerForm},
        computed: {
            ...mapState({
                controllers: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.controllers,
                activeControllerId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].activeControllerId,
                readonlyIds: state => state[DRAGGABLE_JOURNEY_STORE_NAME].readonlyControllerIds,
                isChecking: state => state[DRAGGABLE_JOURNEY_STORE_NAME].isChecking
            }),
            controller() {
                return this.controllers[this.activeControllerId];
            },
            writable() {
                // 旅程可编辑，且控件ID不在 readonlyIds 中
                return this.$store.getters.journeyWritable && !this.readonlyIds.includes(this.controller.id);
            }
        },
        methods: {
            ...mapMutations([
                SET_ACTIVE_CONTROLLER
            ]),
            close() {
                this.SET_ACTIVE_CONTROLLER('');
            }
        }
    };
</script>

