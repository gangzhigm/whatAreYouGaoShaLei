<template>
    <modal :title="controller.name" @close="cancel()" :size="'md-lg'">
        <div class="form-field flex">
            <span class="label">{{'controller.conditions' | t}}</span>
            <eventModal ref="eventModal" :optionType="controller.type" :controller="controller"
                        :settingsObj.sync="settings" :errMsg.sync="errMsg" :summary.sync="summary"></eventModal>
        </div>
        <div class="form-field flex">
            <span class="label">{{'controller.within' | t}}</span>
            <div class="timer">
                <delay-time-picker v-model="time"/>
                <i class="action-icon icon icon-help" v-title:bottom="$t('controller.withinNotice')"></i>
                <p class="time-zone">{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
            </div>
        </div>
        <div class="form-field">
            <span class="label placeholder"></span>
            <checkbox v-model="milestone">{{'controller.set_milestone' | t}}</checkbox>
            <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
        </div>
        <template v-slot:buttons>
            <!--<input  type="button" class="btn btn-md btn-white" @click.stop="cancel()" :value="$t('common.cancel')"/>-->
            <input type="button" class="btn btn-md btn-theme" @click.stop="confirm()"
                   :value="$t('common.confirm')"/>
        </template>
    </modal>
</template>
<script type="text/ecmascript-6">
    import cloneDeep from 'lodash/cloneDeep';
    import eventModal from './event-modal/event-modal.vue';
    import DelayTimePicker from '../components/delay-time-picker.vue';
    import {ADD_MILESTONE, REMOVE_MILESTONE, UPDATE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import {TIME_ZONE_RNAGES} from '@/common/utils/timeZone';
    import { mapActions, mapMutations, mapState } from 'vuex';

    export default {
        props: {
            controller: Object
        },
        data() {
            return {
                time: '',
                milestone: 0,
                settings: {},
                errMsg:'',
                timer: TIME_ZONE_RNAGES,
                summary: '',
            };
        },
        created() {
            this.time = this.controller.processInfo.time;
            this.settings = cloneDeep(this.controller.processInfo.decision.settings);
            this.summary = this.controller.summary;
            this.milestone = this.isAMileStone;
        },
        methods: {
            ...mapActions([
                SAVE_JOURNEY
            ]),
            ...mapMutations([
                UPDATE_CONTROLLER,
                ADD_MILESTONE, 
                REMOVE_MILESTONE
            ]),
            cancel() {
                this.$emit('close');
            },
            confirm() {
                let validate = this.validate();
                if (validate) {
                    return;
                }
                this.$refs.eventModal.updateSummary();
                this.$nextTick(() => {
                    this.commitController();
                    this.commitMilestone();
                    this.SAVE_JOURNEY();
                    this.$emit('close');
                });
            },
            validate() {
                if (this.time === '' || this.time.length < '0:00:00'.length) {
                    this.$toast(this.$t('controller.completeTime'), 'warn');
                    return true;
                }
                if (this.time.split(':').join('') < 1) {
                    this.$toast(this.$t('controller.eventatleast1min'), 'warn');
                    return true;
                }
                if (this.errMsg){
                    this.$toast(this.errMsg, 'warn');
                    return true;
                }
                return false;
            },
            isInteractionHandler(controller) {
                let con = controller;
                let arr = ['email', 'mobile', 'mms'];
                if (con.processInfo.decision.settings.operatorType) {
                    con.processInfo.decision.isInteraction =
                        arr.includes(con.processInfo.decision.settings.operatorType) ? 1 : 0;
                }
                return con;
            },
            commitController() {
                let controller = cloneDeep(this.controller);
                controller.summary = this.summary;
                controller.processInfo.time = this.time;
                controller.processInfo.decision.settings = this.settings;
                controller.processInfo.specifyEvent = 1;
                controller = this.isInteractionHandler(controller);
                this.UPDATE_CONTROLLER(controller);
            },
            // milestone
            commitMilestone() {
                if (this.isAMileStone !== this.milestone) {
                    this.milestone ? this.ADD_MILESTONE(this.controller.id) : 
                        this.REMOVE_MILESTONE(this.controller.id);
                }
            },
        },
        computed: {
            ...mapState({
                isAMileStone(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation
                        .milestones.includes(this.controller.id);
                },
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation
            })
        },
        components: {eventModal, DelayTimePicker}
    };
</script>
<style lang="scss">
    .timer {
        .time-zone {
            width: 450px;
        }
    }
</style>
