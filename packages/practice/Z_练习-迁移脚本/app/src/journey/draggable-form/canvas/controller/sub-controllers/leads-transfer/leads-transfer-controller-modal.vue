<template>
    <leads-transfer-controller-form v-if="writable || isChecking" :controller="controller" :is-checking="isChecking"/>
    <leads-transfer-controller-view v-else :controller="controller"/>
</template>

<script>
    import {LEADS_TRANSFER, getModalName} from '../../CONTROLLER_TYPES';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import LeadsTransferControllerForm from './leads-transfer-controller-form.vue';
    import LeadsTransferControllerView from './leads-transfer-controller-view.vue';
    import { mapState } from 'vuex';
    export default {
        name: getModalName(LEADS_TRANSFER),
        computed: {
            ...mapState({
                controllers: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.controllers,
                activeControllerId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].activeControllerId,
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
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
        components: {
            LeadsTransferControllerForm,
            LeadsTransferControllerView
        }
    };
</script>