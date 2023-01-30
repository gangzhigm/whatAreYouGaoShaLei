<template>
    <modal :title="controller.name" @close="cancel">
        <div class="form-field flex">
            <span class="label">{{'controller.conditions' | t}}</span>
            <div class="field-group">
                <eventModal :optionType="controller.type" :controller="controller"
                        :settingsObj="settings" :summary.sync="summary" :writable="false"></eventModal>
            </div>
        </div>
        <div class="form-field">
            <span class="label">{{'controller.within' | t}}</span>
            <delay-time-picker :forbide="true" :value="time"/>
            <i class="action-icon icon icon-help" v-title:bottom="$t('controller.withinNotice')"></i>
            <p>{{timeZone ? timer.$getByKey(timeZone).name : ''}}</p>
        </div>
        <div class="form-field">
            <span class="label placeholder"></span>
            <checkbox disabled :value="chooseEvent">{{'controller.set_milestone' | t}}</checkbox>
            <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
        </div>
        <template v-slot:buttons>
            <input type="button" class="btn btn-md btn-white" @click.stop="confirm()"
               :value="$t('common.close')"/>
        </template>
    </modal>
</template>
<script type="text/ecmascript-6">
    import DelayTimePicker from '../components/delay-time-picker.vue';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {TIME_ZONE_RNAGES} from '../../../../../../common/utils/timeZone';
    import eventModal from './event-modal/event-modal.vue';
    import { WechatApiV1 } from '@/api';
    import { mapState } from 'vuex';

    export default {
        props: {
            display: Boolean,
            controller: Object
        },
        components: {DelayTimePicker, eventModal},
        data() {
            return {
                chooseEvent: 0,
                time: '',
                timer: TIME_ZONE_RNAGES,
                settings: {},
                summary: '',
            };
        },
        created() {
            this.chooseEvent = this.getMilestones.includes(this.controller.id);
            this.settings = this.controller.processInfo.decision.settings || {};
            this.summary = this.controller.summary ? this.controller.summary : '';
            this.time = this.controller.processInfo.time;
            // 校验粉丝标签更新
            const settingsKeys = Object.keys(this.settings);
            if (settingsKeys.length > 0 && settingsKeys.includes('labelType') && this.settings.labelType === 'fanLabel') {
                this.checkFanLabel();
            }
        },
        computed: {
            ...mapState({
                getMilestones: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.milestones,
                timeZone: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation.timeZone
            })
        },
        methods: {
            cancel() {
                this.$emit('close');
            },
            confirm() {
                this.$emit('close');
            },
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
