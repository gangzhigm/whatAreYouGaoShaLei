<template>
    <!-- 事件判断控件modal -->
    <!-- 表单 -->
    <event-condition-controller-form v-if="writable && !isChecking"
                                     :controller="controller"
                                     @close="close"/>
    <!-- 查看详情 -->
    <event-condition-controller-view v-else
                                     :controller="controller"
                                     @close="close"/>
</template>

<script>
    import {EVENT_CONDITION_CONTROLLER, getModalName} from '../../CONTROLLER_TYPES';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {SET_ACTIVE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import EventConditionControllerForm from './event-condition-controller-form.vue';
    import EventConditionControllerView from './event-condition-controller-view.vue';
    import { mapMutations, mapState } from 'vuex';

    export default {
        name: getModalName(EVENT_CONDITION_CONTROLLER),
        components: {EventConditionControllerView, EventConditionControllerForm},
        computed: {
            ...mapState({
                controllers: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.controllers,
                activeControllerId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].activeControllerId,
                isChecking: state => state[DRAGGABLE_JOURNEY_STORE_NAME].isChecking
            }),
            controller() {
                return this.controllers[this.activeControllerId];
            },
            writable() {
                return this.$store.getters.journeyWritable;
            }
        },
        methods: {
            ...mapMutations([SET_ACTIVE_CONTROLLER]),
            close() {
                this.SET_ACTIVE_CONTROLLER('');
            }
        }
    };
</script>

