<template>
    <!-- 邮件控件modal -->
    <!-- 表单 -->
    <decision-controller-form v-if="writable && !isChecking"
                              :controller="controller"
                              @close="close"/>
    <decision-controller-form v-else
                              :controller="controller"
                              :writable="false"
                              @close="close"/>
    <!-- 查看详情 -->
    <!-- <decision-controller-view v-else
                              :controller="controller"
                              @close="close"/> -->
</template>

<script>
    import {DECISION_CONTROLLER, getModalName} from '../../CONTROLLER_TYPES';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {SET_ACTIVE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import DecisionControllerForm from './decision-controller-form.vue';
    import DecisionControllerView from './decision-controller-view.vue';
    import { mapMutations, mapState } from 'vuex';

    export default {
        name: getModalName(DECISION_CONTROLLER),
        components: {DecisionControllerForm, DecisionControllerView},
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
                // 定时旅程可编辑，且控件ID不在 readonlyIds 中
                return this.$store.getters.journeyWritable && !this.readonlyIds.includes(this.controller.id);
            }
        },
        methods: {
            ...mapMutations([
                SET_ACTIVE_CONTROLLER
            ]),
            close() {
                this.$parent.$parent.$emit('modalDisplay', false);
                this.SET_ACTIVE_CONTROLLER('');
            }
        }
    };
</script>

