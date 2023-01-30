<template>
    <div  class="new-AB-test-controller-modal">
        <new-AB-test-controller-form v-if="writable || isChecking"
                                     @close="close"
                                     :controller="controller">
        </new-AB-test-controller-form>
        <!--发送详情-->
        <new-AB-test-controller-detail v-else
                                       @close="close"
                                       :controller="controller">
        </new-AB-test-controller-detail>
    </div>
</template>

<script>
    import {NEW_AB_TEST_CONTROLLER, getModalName} from '../../CONTROLLER_TYPES';
    import {SET_ACTIVE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import NewABTestControllerDetail from './new-AB-test-controller-detail.vue';
    import NewABTestControllerForm from './new-AB-test-controller-form.vue';
    import { mapMutations, mapState } from 'vuex';

    export default {
        name: getModalName(NEW_AB_TEST_CONTROLLER),
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
            ...mapMutations({
                SET_ACTIVE_CONTROLLER
            }),
            close() {
                this.SET_ACTIVE_CONTROLLER('');
            },
        },
        components: {
            NewABTestControllerDetail,
            NewABTestControllerForm
        }
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .new-AB-test-controller-modal {
        .modal-content {
            overflow: scroll;
            max-height: 600px;
        }
    }
</style>