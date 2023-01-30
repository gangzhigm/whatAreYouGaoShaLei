<template>
    <modal :title="$t('dragJourney.attrCondition')" size="sl" class="attribute-condition-controller-view"
           @close="$emit('close')">
        <div class="form-field flex modal-item">
            <span class="label">{{'controller.conditions' | t}}</span>
            <div class="field-group">
                <p v-if="timeZone">{{'controller.selectTimeZone' | t}}{{timeZone ? timer.$getByKey(timeZone).name : ''}}</p>
                <div class="condition-bunch">
                    <div class="just" v-if="selectResult.act === 'and'">{{'common.and' | t}}</div>
                    <div class="just" v-if="selectResult.act === 'or'">{{'common.or' | t}}</div>
                    <div class="chooseBox">
                        <div class="user">
                            <span>{{'swarm.contactAttribute' | t}}</span>
                        </div>
                        <div class="choose" :class="selectResult.filter_json[0].rules.length>1?'count-1':''">
                            <div class="maybe" :class="{'disabled': !writable}" v-if="selectResult.filter_json[0].rules.length>1">
                                <div v-if="selectResult.filter_json[0].actChildren === 'and'">{{'common.and' | t}}</div>
                                <div v-if="selectResult.filter_json[0].actChildren === 'or'">{{'common.or' | t}}</div>
                            </div>
                            <attributeViews v-for="(cItem,cIndex) in selectResult.filter_json[0].rules"
                                            :key="cIndex"
                                            :stripItem="cItem"
                                            :type="selectResult.filter_json[0].type"
                                            :optionsData="optionsData"/>
                        </div>
                    </div>
                    <div class="chooseBox">
                        <div class="user">
                            <span>{{'swarm.eventAttribute' | t}}</span>
                        </div>
                        <div class="choose" :class="selectResult.filter_json[1].rules.length>1?'count-1':''">
                            <div class="maybe" :class="{'disabled': !writable}" v-if="selectResult.filter_json[1].rules.length>1">
                                <div v-if="selectResult.filter_json[0].actChildren === 'and'">{{'common.and' | t}}</div>
                                <div v-if="selectResult.filter_json[0].actChildren === 'or'">{{'common.or' | t}}</div>
                            </div>
                            <attributeViews v-for="(eItem,eIndex) in selectResult.filter_json[1].rules"
                                            :key="eIndex"
                                            :stripItem="eItem"
                                            :type="selectResult.filter_json[1].type"
                                            :optionsData="optionsData"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="form-field flex modal-item">
            <span class="label">{{'controller.within' | t}}</span>
            <div class="timer">
                <delay-time-picker v-model="selectResult.time" :forbide="true"/>
                <i class="action-icon icon icon-help" v-title:bottom="$t('controller.withinNotice')"></i>
            </div>
        </div>
        <div class="form-field modal-item">
            <span class="label placeholder"></span>
            <checkbox v-model="milestone" disabled="">{{'controller.set_milestone' | t}}</checkbox>
            <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
        </div>
        <template v-slot:buttons>
            <input type="button" class="btn btn-md btn-white" @click.stop="$emit('close')"
                   :value="$t('common.close')"/>
        </template>
    </modal>
</template>
<script type="text/ecmascript-6">
    import cloneDeep from 'lodash/cloneDeep';
    import attributeViews from './attribute-edit-modal/attribute-views.vue';
    import DelayTimePicker from '../components/delay-time-picker.vue';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {TIME_ZONE_RNAGES} from '@/common/utils/timeZone';
    import { mapState } from 'vuex';

    export default {
        props: {
            controller: Object,
            optionsData: Object
        },
        data() {
            return {
                selectResult: {
                    act:  'and',
                    time:'0:00:00',//等待时间，格式：天:小时:分钟
                    filter_json:[
                        {type:  'contact',rules: []},
                        {type: 'event',rules: []}
                    ]
                },
                timer: TIME_ZONE_RNAGES
            };
        },
        computed: {
            ...mapState({
                storeName: state => state[DRAGGABLE_JOURNEY_STORE_NAME]
            }),
            // 时区
            timeZone() {
                return this.storeName.journeyInformation.timeZone;
            },
            milestone () {
                const milestones = this.storeName.canvasInformation.milestones;
                return milestones.includes(this.controller.id);
            },
            settings () {
                return this.storeName.canvasInformation.controllers[this.controller.id]
                    .processInfo.decision.settings;
            }
        },
        created() {
            const settings = this.settings;
            if (
                (settings && settings.filter_json && settings.filter_json[0].rules.length) ||
                (settings && settings.filter_json && settings.filter_json[1].rules.length)
            ) {
                let stripItem = cloneDeep(settings);
                let isNew = stripItem.filter_json[0].actChildren || stripItem.filter_json[1].actChildren;
                if (!isNew) {
                    const stripAct = stripItem.act;
                    let contactRules = stripItem.filter_json[0].rules.map(rule => {
                        rule.act = stripAct;
                        return rule;
                    });
                    let eventRules = stripItem.filter_json[1].rules.map(rule => {
                        rule.act = stripAct;
                        return rule;
                    });
                    stripItem.filter_json[0] = {
                        type:  'contact',
                        act: 'and',
                        actChildren: stripAct,
                        rules: contactRules
                    };
                    stripItem.filter_json[1] = {
                        type:  'event',
                        act: 'and',
                        actChildren: stripAct,
                        rules: eventRules
                    };
                    stripItem.act = 'and';
                }
                let contactCondition = {type: 'contact',act: 'and',actChildren: 'and',rules: []};
                let eventCondition = {type: 'event',act: 'and',actChildren: 'and',rules: []};
                if (settings.filter_json.length < 2) {
                    if (settings.filter_json[0].type === 'contact') {
                        this.selectResult.filter_json.push(eventCondition);
                    } else {
                        this.selectResult.filter_json.unshift(contactCondition);
                    }
                }
                if (!settings.time) {
                    stripItem.time = '0:00:00';
                }
                this.selectResult = stripItem;
            }
        },
        components: {attributeViews, DelayTimePicker}
    };
</script>
<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import '../../../../../../common/scss/base/mixin';
    .attribute-condition-controller-view,.decision-controller-view{
        .modal-item{
            .label{
                width: 105px;
            }
            .field-group{
                .condition-bunch {
                    .just {
                        background-color: #cccccc;
                    }
                    .chooseBox {
                        .user{
                            margin-bottom: 8px;
                        }
                        .selectBox{
                            background-color: #f0f2f5;
                            border-radius: 4px;
                            overflow: hidden;
                            padding: 0 8px;
                            border-bottom: none;
                            margin: 0 8px 8px 8px;
                            .selector,.cascading,.attr-selector{
                                width: auto;
                                margin: 0 3px;
                                label{
                                    width: auto;
                                    height: 32px;
                                    font-size: 12px;
                                    color: #595959;
                                    line-height: 32px;
                                    padding: 0;
                                    text-indent: 0;
                                    border: none;
                                    .select-icon{
                                        display: none;
                                    }
                                }
                            }
                            .cascading,
                            .attr-selector {
                                vertical-align: top;
                            }
                            span{
                                margin: 0 3px;
                                line-height: 32px;
                                font-size: 12px;
                                color: #595959;
                                &.view-span {
                                    @include ellipsis();
                                    display: inline-block;
                                    max-width: 500px;
                                    height: 30px;
                                }
                                &.view-span-arr {
                                    @include ellipsis();
                                    display: inline-block;
                                    vertical-align: top;
                                    margin:0 10px 4px 0;
                                    // margin-right: 4px;
                                    padding: 0 5px;
                                    max-width: 450px;
                                    height: 18px;
                                    line-height: 18px;
                                    border: 1px solid #cfd5df;
                                    white-space: nowrap;
                                    border-radius: 4px;
                                }
                            }
                            .view-box {
                                display: inline-block;
                                max-width: 500px;
                                padding-top: 6px;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
