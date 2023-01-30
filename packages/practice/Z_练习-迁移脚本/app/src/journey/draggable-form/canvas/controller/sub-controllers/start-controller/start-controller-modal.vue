<template>
    <!-- 开始控件modal -->
    <!-- 表单 -->
    <start-controller-form v-if="writable && !isChecking" :controller="controller" @close="close"/>
    <!-- 查看详情 -->
    <start-controller-view v-else :controller="controller" @close="close"/>
</template>

<script>
    import {getModalName, START_CONTROLLER} from '../../CONTROLLER_TYPES';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {SET_ACTIVE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import StartControllerForm from './start-controller-form.vue';
    import StartControllerView from './start-controller-view.vue';
    import { mapMutations, mapState } from 'vuex';

    export default {
        name: getModalName(START_CONTROLLER),
        components: {StartControllerView, StartControllerForm},
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
            ...mapMutations([
                SET_ACTIVE_CONTROLLER
            ]),
            close() {
                this.SET_ACTIVE_CONTROLLER('');
            }
        }
    };
</script>

