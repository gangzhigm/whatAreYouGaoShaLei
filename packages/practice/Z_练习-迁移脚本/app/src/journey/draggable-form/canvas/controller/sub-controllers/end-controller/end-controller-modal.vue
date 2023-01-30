<template>
    <!-- 结束控件modal -->
    <modal class="end-controller-modal" :title="$t('dragJourney.exit')" @close="close">
        <div class="form-field">
            <span class="label">{{'controller.exitFlow' | t}}</span>
            <checkbox v-model="milestone" :disabled="!writable || isChecking">{{'controller.set_milestone' | t}}</checkbox>
            <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
        </div>

        <template v-slot:buttons>
            <!-- 表单 -->
            <button v-if="writable && !isChecking" class="btn btn-md btn-theme" @click="confirm">{{'common.confirm' | t}}</button>
            <!-- 查看详情 -->
            <button v-else class="btn btn-md btn-white" @click="close">{{'common.close' | t}}</button>
        </template>
    </modal>
</template>

<script>
    import {END_CONTROLLER, getModalName} from '../../CONTROLLER_TYPES';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {ADD_MILESTONE, REMOVE_MILESTONE, SET_ACTIVE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import {SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import { mapActions, mapMutations, mapState } from 'vuex';

    export default {
        name: getModalName(END_CONTROLLER),
        data() {
            return {
                milestone: false
            };
        },
        computed: {
            ...mapState({
                controllers:state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.controllers,
                activeControllerId:state => state[DRAGGABLE_JOURNEY_STORE_NAME].activeControllerId,
                isAMileStone(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation
                        .milestones.includes(this.controller.id);
                },
                isChecking: state => state[DRAGGABLE_JOURNEY_STORE_NAME].isChecking
            }),
            writable() {
                return this.$store.getters.journeyWritable;
            },
            controller() {
                return this.controllers[this.activeControllerId];
            }
        },
        created() {
            this.milestone = this.isAMileStone;
        },
        methods: {
            ...mapMutations([
                SET_ACTIVE_CONTROLLER,
                ADD_MILESTONE,
                REMOVE_MILESTONE
            ]),
            ...mapActions([SAVE_JOURNEY]),
            close() {
                this.SET_ACTIVE_CONTROLLER('');
            },
            confirm() {
                if (this.isAMileStone !== this.milestone) {
                    this.milestone ? this.ADD_MILESTONE(this.controller.id) : 
                        this.REMOVE_MILESTONE(this.controller.id);
                    this.SAVE_JOURNEY();
                }
                this.close();
            }
        },
    };
</script>

