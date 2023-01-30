<template>
    <modal :title="$t('controller.flow_start')" :size="'md-lg'" @close="close">
        <div class="form-field">
            <label class="label" for="journeyName">{{'controller.name'| t}}</label>
            <input maxlength="200" :value="journey.journeyName" id="journeyName" disabled class="input" type="text">
        </div>
        <div class="form-field">
            <label class="label">{{'controller.groups'| t}}</label>
            <selector class="xl" v-model="swarmId" :options="swarmOptions" search/>
        </div>
        <div class="form-field">
            <span class="label">{{'controller.trigger'| t}}</span>
            <radio :value="trigger" :source="0" @input="changeTrigger">{{'controller.activity'| t}}</radio>
            <radio :value="trigger" :source="1" @input="changeTrigger">{{'controller.updates'| t}}</radio>
        </div>
        <div class="form-field flex">
            <span class="label placeholder"></span>
            <eventModal ref="eventModal" :optionType="optionType" :controller="controller" :loading="loading"
                        :settingsObj.sync="settings" :errMsg.sync="errMsg" :summary.sync="summary"></eventModal>
        </div>
        <div class="form-field">
            <span class="label placeholder"></span>
            <checkbox v-model="incremental">{{'controller.repeat'| t}}</checkbox>
            <i class="action-icon icon icon-help" v-title:bottom="$t('controller.repeatTip')"></i>
        </div>
        <div class="form-field">
            <span class="label placeholder"></span>
            <checkbox v-model="chooseStone">{{'controller.set_milestone' | t}}</checkbox>
            <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
        </div>
        <div class="form-field restrictionsHeigh">
            <restrictions v-if="isHw" ref="restrictions" :showLog='true' :isReadonly='journey.journeyStatus === 7'></restrictions>
        </div>
        <template v-slot:buttons>
            <input type="button" class="btn btn-md btn-theme" @click="confirm"
                   :value="$t('common.confirm')"/>
        </template>
    </modal>
</template>

<script type="text/ecmascript-6">

    import { ContactApiV1 } from '@/api';
    import cloneDeep from 'lodash/cloneDeep';
    import eventModal from '../event-condition-controller/event-modal/event-modal.vue';
    import {ADD_MILESTONE, REMOVE_MILESTONE, UPDATE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import restrictions from '../../../../../restrictions.vue';
    import { mapActions, mapMutations, mapState } from 'vuex';

    export default {
        props: {
            controller: Object
        },
        components: {eventModal,restrictions},
        data() {
            return {
                swarmId: '',
                swarmOptions: [{id: '', name: this.$t('controller.noLimit')}],
                settings: {},
                errMsg:'',
                trigger: 0,
                incremental: 0,
                chooseStone: 0,
                loading: true,
                summary: '',
            };
        },
        computed: {
            ...mapState({
                user: state => state.user,
                journey: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                isAMileStone(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation
                        .milestones.includes(this.controller.id);
                },
                // 特殊id,用于隐藏'全部联系人'项
                hiddenId: state => state.canvasStore.hiddenId
            }),
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            },
            optionType() {
                return this.trigger ? 'newJourneyAttr' : 'newJourneyEvent';
            }
        },
        created() {
            // 若用本地数据无需放到接口里。hot-fix-4909: 修复触发条件回显有问题（放到接口里，回显操作拿不到数据）。
            // 回显开始控件表单
            this.trigger = this.controller.processInfo.tigger;
            this.settings = cloneDeep(this.controller.processInfo.decision.settings);
            this.summary = this.controller.summary ? this.controller.summary : '';
            this.incremental = this.controller.processInfo.incremental;
            this.chooseStone = this.isAMileStone;
            // 1. 联系人分群列表
            ContactApiV1
                .getSwarms()
                .then(({body: {data: {swarmList}}}) => {
                    // 删除"全部联系人"
                    swarmList = swarmList.filter(s => s.id !== this.hiddenId);
                    this.swarmOptions = this.swarmOptions.concat(swarmList);

                    // 2. 回显开始控件表单受众分群
                    this.swarmId = this.controller.processInfo.swarmId === this.hiddenId
                        ? '' : this.controller.processInfo.swarmId;
                    this.settings = cloneDeep(this.controller.processInfo.decision.settings);
                    this.loading = false;
                });
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
            changeTrigger(newTrigger) {
                if (!this.loading && newTrigger !== this.trigger) {
                    this.settings = {};
                }
                this.trigger = newTrigger;
            },
            close() {
                this.$emit('close');
            },
            confirm() {
                if (this.errMsg){
                    this.$toast(this.errMsg, 'warn');
                    return;
                }
                
                this.$nextTick(() => {
                    this.commitController();
                    this.commitMilestone();
                    this.SAVE_JOURNEY();
                    this.$refs.eventModal.updateSummary();
                    if (this.$refs.restrictions) {
                        this.journey.qualification = this.$refs.restrictions.isON ? 1 : 0;
                        this.journey.hwContactNull = this.$refs.restrictions.isChecked ? 1 : 0;
                    }
                    this.close();
                });
            },
            commitController() {
                let controller = cloneDeep(this.controller);
                controller.summary = this.summary;
                controller.processInfo.tigger = this.trigger;
                controller.processInfo.swarmId = this.swarmId;
                controller.processInfo.incremental = this.incremental;
                controller.processInfo.decision.settings = this.settings;
                this.UPDATE_CONTROLLER(controller);
            },
            // milestone
            commitMilestone() {
                if (this.isAMileStone !== this.chooseStone) {
                    this.chooseStone ? this.ADD_MILESTONE(this.controller.id) : 
                        this.REMOVE_MILESTONE(this.controller.id);
                }
            }
        }
    };
</script>
<style lang="scss">
    .restrictionsHeigh{
      height: 66px;
    }
    .form-field {
        .min-width{
            width: 66px;
        }
    }
    
</style>