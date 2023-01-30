<template>
    <modal :title="$t('controller.flow_start')" @close="$emit('close')" class="start-controller-view">
        <inline-loading v-if="loading"/>
        <template v-else>
            <div class="form-field flex">
                <span class="label">{{'controller.name'| t}}</span>
                <span :title="journey.journeyName" class="title-flex-1">{{journey.journeyName}}</span>
            </div>
            <div class="form-field flex">
                <span class="label">{{'controller.groups'| t}}</span>
                <div class="field-group">
                    <selector class="xl" :value="swarmId" :disabled="true" :options="swarmOptions"></selector>
                </div>
            </div>
            <div class="form-field flex">
                <span class="label">{{'controller.trigger'| t}}</span>
                <div class="field-group">
                    <checkbox :value="true" disabled>
                        <template v-if="trigger === 0">{{'controller.activity'| t}}</template>
                        <template v-else>{{'controller.updates'| t}}</template>
                    </checkbox>
                    <eventModal :optionType="optionType" :controller="controller" :loading="loading"
                        :settingsObj="settings" :summary.sync="summary" :writable="false"></eventModal>
                </div>
            </div>
            <div class="form-field flex">
                <span class="label placeholder"></span>
                <div class="field-group">
                    <checkbox :value="incremental" disabled>{{'controller.repeat'| t}}</checkbox>
                    <i class="action-icon icon icon-help" v-title:bottom="$t('controller.repeatTip')"></i>
                </div>
            </div>
            <div class="form-field flex">
                <span class="label placeholder"></span>
                <div class="field-group">
                    <checkbox :value="isAMileStone" disabled>{{'controller.set_milestone' | t}}</checkbox>
                    <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
                </div>
            </div>
            <div class="form-field restrictionsHeigh">
                <restrictions v-if="isHw" :startController='true' :showLog='true' :isReadonly="true"></restrictions>
            </div>
        </template>
        <template v-slot:buttons>
            <input type="button" class="btn btn-md btn-white" @click="$emit('close')"
                   :value="$t('common.close')"/>
        </template>
    </modal>
</template>

<script type="text/ecmascript-6">

    import { ContactApiV1, WechatApiV1 } from '@/api';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import eventModal from '../event-condition-controller/event-modal/event-modal.vue';
    import restrictions from '../../../../../restrictions.vue';
    import { mapState } from 'vuex';

    export default {
        props: {
            controller: Object
        },
        components: {eventModal,restrictions},
        data() {
            return {
                loading: true,
                swarmOptions: [{id: '', name: this.$t('controller.noLimit')}],
                settings: {},
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
                }
            }),
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            },
            // 分群id
            swarmId() {
                return this.controller.processInfo.swarmId;
            },
            trigger() {
                // 0 当会员触发事件时,
                // 1 当会员属性变更时,
                return ~~this.controller.processInfo.tigger;
            },
            optionType() {
                return this.trigger ? 'newJourneyAttr' : 'newJourneyEvent';
            },
            incremental() {
                return this.controller.processInfo.incremental;
            }
        },
        created() {
            this.settings = this.controller.processInfo.decision.settings || {};
            this.summary = this.controller.summary ? this.controller.summary : '';
            // 校验粉丝标签更新
            const settingsKeys = Object.keys(this.settings);
            if (settingsKeys.length > 0 && settingsKeys.includes('labelType') && this.settings.labelType === 'fanLabel') {
                this.checkFanLabel();
            }
            // 联系人分群列表
            ContactApiV1
                .getSwarms()
                .then(({body: {data: {swarmList}}}) => {
                    this.swarmOptions = this.swarmOptions.concat(swarmList);
                    this.loading = false;
                });
        },
        methods: {
            checkFanLabel() {
                WechatApiV1
                    .checkFanLabel(this.settings.value)
                    .then(({body: {data}}) => {
                        let templateSummary = this.summary.trim().split(' ');
                        templateSummary.splice(templateSummary.length - 1, 1, data.name);
                        this.summary = templateSummary.toString().replace(/,/g, ' ');
                    });
            }
        }
    };
</script>
<style lang="scss">
    .start-controller-view {
        .restrictionsHeigh {
            height: 66px;
        }
        .form-field {
            &.flex {
                .title-flex-1 {
                    flex: 1;
                }
            }
        }
    }
</style>