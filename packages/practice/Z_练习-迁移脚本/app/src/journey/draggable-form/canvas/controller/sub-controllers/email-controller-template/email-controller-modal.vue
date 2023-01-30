<template>
    <!-- 邮件控件modal -->
    <!-- 表单 -->
    <email-controller-form v-if="writable"
                           :controller="controller"
                           @close="close"/>
    <!-- 查看详情 -->
    <email-controller-view v-else
                           :controller="controller"
                           @close="close"/>
</template>

<script>
    import {EMAILTEMPLATE_CONTROLLER, getModalName} from '../../CONTROLLER_TYPES';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {SET_ACTIVE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import EmailControllerForm from './email-controller-form.vue';
    import EmailControllerView from './email-controller-view.vue';
    import { mapMutations, mapState } from 'vuex';

    export default {
        name: getModalName(EMAILTEMPLATE_CONTROLLER),
        components: {EmailControllerView, EmailControllerForm},
        computed: {
            ...mapState({
                controllers: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.controllers,
                activeControllerId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].activeControllerId,
                readonlyIds: state => state[DRAGGABLE_JOURNEY_STORE_NAME].readonlyControllerIds
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

