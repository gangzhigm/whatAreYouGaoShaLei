<template>
    <div v-if="controller.pushInfo.subType === 14">
        <!-- 应用消息控件modal -->
        <!-- 编辑 -->
        <wecom-controller-form v-if="writable || isChecking"
                             :controller="controller"
                             @close="close"/>
        <!-- 查看详情 -->
        <wecom-controller-view v-else
                             :controller="controller"
                             @close="close"/>
    </div>
    <div v-else>
        <!-- 企业群发控件modal -->
        <!-- 编辑 -->
        <group-msg-controller-form v-if="writable || isChecking"
                             :controller="controller"
                             @close="close"/>
        <!-- 查看详情 -->
        <group-msg-controller-view v-else
                             :controller="controller"
                             @close="close"/>
    </div>
</template>

<script>
    import {getModalName, WECOM_CONTROLLER} from '../../CONTROLLER_TYPES';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {SET_ACTIVE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import WecomControllerForm from './wecom-controller-form.vue';
    import WecomControllerView from './wecom-controller-view.vue';
    import GroupMsgControllerForm from '../groupMsg-controller/groupMsg-controller-form.vue';
    import GroupMsgControllerView from '../groupMsg-controller/groupMsg-controller-view.vue';
    import { mapMutations, mapState } from 'vuex';

    export default {
        name: getModalName(WECOM_CONTROLLER),
        components: {WecomControllerForm, WecomControllerView, GroupMsgControllerForm, GroupMsgControllerView},
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

