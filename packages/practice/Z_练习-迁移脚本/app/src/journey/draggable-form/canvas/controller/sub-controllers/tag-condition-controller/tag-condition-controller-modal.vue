<template>
    <modal :title="$t('dragJourney.tagCondition')" :size="'lg'" class="tag-condition-controller-modal" @close="close">
        <template v-if="writable && !isChecking">
            <div class="form-field flex">
                <div class="field-group">
                    <span class="label">{{'controller.condition' | t}}</span>
                    <selector class="md" v-model="members.includeId" :options="includeOptions"/>
                    <!-- 会员标签 -->
                    <!-- <multi-select :options="fildtadList" v-model="fildtags" @input="select" drop-direction="bottom" :auto-width="false"></multi-select> -->
                    <member-tag :isMulti="true" :list="members" @choose="changeMemberId($event)" :max="10"></member-tag>
                </div>
            </div>
            <div class="form-field flex">
                <div class="field-group">
                    <span class="label">{{'controller.wait' | t}}</span>
                    <div class="timer">
                        <delay-time-picker v-model="time" :forbide="!writable"/>
                    </div>
                    <span>&nbsp;{{'controller.waitTail' | t}}</span>
                </div>
            </div>
            <div class="form-field flex">
                <div class="field-group">
                    <span class="label placeholder"></span>
                    <checkbox v-model="milestone">{{'controller.set_milestone' | t}}</checkbox>
                    <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="form-field flex">
                <span class="label">{{'controller.condition' | t}}</span>
                <template v-if="members.includeId === 0">{{'controller.contains' | t}}</template>
                <template v-else>{{'controller.notContains' | t}}</template>
                <div class="tag-groups">
                    <div class="tag-group" v-for="(item,index) of members.selectedList">
                        <span class="tag" :title="item.name">{{item.name}}</span>
                    </div>
                </div>
            </div>
            <div class="form-field flex">
                <span class="label">{{'controller.wait' | t}}</span>
                <div class="timer">
                    <p>{{viewTime}}</p>
                </div>
                <span>&nbsp;{{'controller.waitTail' | t}}</span>
            </div>
            <div class="form-field flex">
                <span class="label placeholder"></span>
                <checkbox v-model="milestone" disabled="">{{'controller.set_milestone' | t}}</checkbox>
                <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
            </div>
        </template>

        <template v-slot:buttons>
            <input v-if="writable && !isChecking" type="button" class="btn btn-md btn-theme" @click="confirm"
                   :value="$t('common.confirm')"/>
            <input v-else type="button" class="btn btn-md btn-white" @click="close"
                   :value="$t('common.close')"/>
        </template>
    </modal>
</template>
<script type="text/ecmascript-6">
    import cloneDeep from 'lodash/cloneDeep';
    import MemberTag from '../components/member-tag.vue';
    import {
        ADD_MILESTONE,
        REMOVE_MILESTONE,
        SET_ACTIVE_CONTROLLER,
        UPDATE_CONTROLLER
    } from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {getModalName, TAG_CONDITION_CONTROLLER} from '../../CONTROLLER_TYPES';
    import {SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import DelayTimePicker from '../components/delay-time-picker.vue';
    import { mapActions, mapMutations, mapState } from 'vuex';

    export default {
        name: getModalName(TAG_CONDITION_CONTROLLER),
        components: {
            MemberTag,
            DelayTimePicker
        },
        data() {
            return {
                milestone: 0,
                includeOptions: [
                    {name: this.$t('controller.contains'), id: 0},
                    {name: this.$t('controller.notContains'), id: 1}
                ],
                members: {selectedList: [], chooseIdList: {groups: [], labels: []}, includeId: 0},
                time: '',//等待时间，格式：天:小时:分钟
            };
        },
        computed: {
            ...mapState({
                controllers: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.controllers,
                activeControllerId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].activeControllerId,
                isAMileStone(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation
                        .milestones.includes(this.controller.id);
                },
                isChecking: state => state[DRAGGABLE_JOURNEY_STORE_NAME].isChecking
            }),
            controller() {
                return this.controllers[this.activeControllerId];
            },
            writable() {
                return this.$store.getters.journeyWritable;
            },
            viewTime() {
                if (this.time) {
                    let arr = this.time.split(':');
                    return arr[0] + this.$t('controller.days') + arr[1]
                        + this.$t('controller.hours') + arr[2] + this.$t('controller.minutes');
                }
                return '-';
            }
        },
        created() {
            this.milestone = this.isAMileStone;
            let settings = this.controller.processInfo.decision.settings;
            this.members.includeId = settings[0].relation === 'in' ? 0 : 1;
            this.members.selectedList = settings[0].behavior;
            this.members.chooseIdList = this.controller.processInfo.decision.chooseIdList;
            this.time = this.controller.processInfo.time || '0:00:01';
        },
        methods: {
            ...mapMutations([
                SET_ACTIVE_CONTROLLER,
                ADD_MILESTONE,
                REMOVE_MILESTONE,
                UPDATE_CONTROLLER
            ]),
            ...mapActions([
                SAVE_JOURNEY
            ]),
            close() {
                this.SET_ACTIVE_CONTROLLER('');
            },
            confirm() {
                if (this.time === '' || this.time.length < '0:00:00'.length) {
                    this.$toast(this.$t('controller.completeTime'), 'warn');
                    return;
                }
                if (this.time.split(':')
                    .join('') < 1) {
                    this.$toast(this.$t('controller.atleast1min'), 'warn');
                    return;
                }
                if (this.isAMileStone !== this.milestone) {
                    this.milestone ? this.ADD_MILESTONE(this.controller.id) : 
                        this.REMOVE_MILESTONE(this.controller.id);
                }
                let con = cloneDeep(this.controller);
                con.processInfo.decision.settings[0].relation = this.members.includeId ? 'nin' : 'in';
                con.processInfo.decision.settings[0].behavior = this.members.selectedList;
                con.processInfo.decision.chooseIdList = this.members.chooseIdList;
                con.processInfo.time = this.time;
                con.processInfo.decision.settings[0].time = this.time;
                this.UPDATE_CONTROLLER(con);

                this.SAVE_JOURNEY();
                this.close();
            },
            changeMemberId(e) {
                this.members.selectedList = e.selectedList;
                this.members.chooseIdList = e.chooseIdList;
            },
        }
    };
</script>
<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .tag-condition-controller-modal {
        .member-tag {
            width: 300px;
        }

        .tag-group {
            position: relative;
            display: inline-block;

            .tag {
                display: inline-block;
                min-width: 75px;
                height: 25px;
                line-height: 23px;
                vertical-align: top;
                margin: ($input-field-height - 25px)/2 5px;
                padding: 0 10px;
                box-sizing: border-box;
                border-radius: 3px;
                color: $dark-purple;
                border: 1px solid $dark-purple;
                width: 48px;
                @include ellipsis();
            }
        }

        .form-field {
            .tag-groups {
                width: 400px;
            }
        }
    }
</style>
