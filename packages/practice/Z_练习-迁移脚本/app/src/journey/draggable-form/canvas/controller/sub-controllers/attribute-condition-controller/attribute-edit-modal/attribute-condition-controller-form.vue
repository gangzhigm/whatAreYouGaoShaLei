<template>
    <modal :title="$t('dragJourney.attrCondition')" size="sl" class="attribute-condition-controller-form"
           @close="$emit('close')">
        <div class="form-field flex modal-item">
            <span class="label">{{'controller.conditions' | t}}</span>
            <div class="field-group">
                <p v-if="timeZone">{{'controller.selectTimeZone' | t}}{{timeZone ? timer.$getByKey(timeZone).name : ''}}</p>
                <div class="condition-bunch">
                    <div class="just">{{'common.and' | t}}</div>
                    <div class="chooseBox">
                        <div class="user">
                            <span>{{'swarm.contactAttribute' | t}}</span>
                            <div class="add" v-if="writable" @click="addStripItem(selectResult.filter_json[0],'contact')">
                                <i class="icon icon-tianjia"></i>
                            </div>
                        </div>
                        <div class="choose" :class="contactLoog.length>1?'count-1':''">
                            <div class="maybe" :class="{'disabled': !writable}" v-if="contactLoog.length>1">
                                <div v-if="selectResult.filter_json[0].actChildren === 'and'" @click="changeAct(0,'or')">{{'common.and' | t}}</div>
                                <div v-if="selectResult.filter_json[0].actChildren === 'or'" @click="changeAct(0,'and')">{{'common.or' | t}}</div>
                            </div>
                            <eventSettings v-for="(cItem,cIndex) in contactLoog"
                                           :key="cItem"
                                           :num="cIndex"
                                           :stripItem="selectResult.filter_json[0].rules[cIndex]"
                                           :type="selectResult.filter_json[0].type"
                                           :optionsData="optionsData"
                                           ref="contactSettings"
                                           :writable="writable"
                                           :rulesLength="true"
                                           @select="resultChange($event,cIndex,'contact')"
                                           @delResult="deleteResult($event,cIndex,'contact')"/>
                        </div>
                    </div>
                    <div class="chooseBox">
                        <div class="user">
                            <span>{{'swarm.eventAttribute' | t}}</span>
                            <div class="add" v-if="writable" @click="addStripItem(selectResult.filter_json[1],'event')">
                                <i class="icon icon-tianjia"></i>
                            </div>
                        </div>
                        <div class="choose" :class="eventLoog.length>1?'count-1':''">
                            <div class="maybe" :class="{'disabled': !writable}" v-if="eventLoog.length>1">
                                <div v-if="selectResult.filter_json[1].actChildren === 'and'" @click="changeAct(1,'or')">{{'common.and' | t}}</div>
                                <div v-if="selectResult.filter_json[1].actChildren === 'or'" @click="changeAct(1,'and')">{{'common.or' | t}}</div>
                            </div>
                            <eventSettings v-for="(eItem,eIndex) in eventLoog"
                                           :key="eItem"
                                           :num="eIndex"
                                           :stripItem="selectResult.filter_json[1].rules[eIndex]"
                                           :type="selectResult.filter_json[1].type"
                                           :optionsData="optionsData"
                                           :writable="writable"
                                           ref="eventSettings"
                                           :rulesLength="true"
                                           @select="resultChange($event,eIndex,'event')"
                                           @delResult="deleteResult($event,eIndex,'event')"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="form-field flex modal-item">
            <span class="label">{{'controller.wait' | t}}</span>
            <div class="timer">
                <delay-time-picker v-if="writable" v-model="selectResult.time" :forbide="!writable"/>
                <p v-else>{{viewTime}}</p>
            </div>
            <span>&nbsp;{{'controller.waitTail' | t}}</span>
            <i class="action-icon icon icon-help" v-title:bottom="$t('controller.withinNoticeAttr')"></i>
        </div>
        <div class="form-field modal-item">
            <span class="label placeholder"></span>
            <checkbox v-model="milestone" :disabled="!writable">{{'controller.set_milestone' | t}}</checkbox>
            <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
        </div>

        <template v-slot:buttons>
            <template v-if="writable">
                <input type="button" class="btn btn-md btn-white" @click.stop="$emit('close')"
                       :value="$t('common.cancel')"/>
                <input type="button" class="btn btn-md btn-theme" @click.stop="confirm()"
                       :value="$t('common.confirm')"/>
            </template>
            <input v-else type="button" class="btn btn-md btn-white" @click.stop="$emit('close')"
                       :value="$t('common.close')"/>
        </template>
    </modal>
</template>
<script type="text/ecmascript-6">
    import { mapActions, mapState, mapMutations } from 'vuex';
    import cloneDeep from 'lodash/cloneDeep';
    import eventSettings from './event-settings.vue';
    import DelayTimePicker from '../../components/delay-time-picker.vue';
    import {ADD_MILESTONE, REMOVE_MILESTONE, UPDATE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME, uniqId} from '@/store/vuex/modules/canvasStore';
    import {SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import {TIME_ZONE_RNAGES} from '@/common/utils/timeZone';

    export default {
        provide(){
            return {
                optimizeRelativeTime:false, //  用于判断相对时间是否需要添加提前/延后N天的条件，如果后面需要前部添加的话，则去掉此处的provide以及子组件的inject
            };
        },
        props: {
            controller: Object,
            optionsData: Object,
            writable: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                milestone: 0,
                selectResult: {
                    act:  'and',
                    time:'0:00:01',//等待时间，格式：天:小时:分钟
                    filter_json:[
                        {
                            type:  'contact',
                            act: 'and',
                            actChildren: 'and',
                            rules: []
                        },
                        {
                            type: 'event',
                            act: 'and',
                            actChildren: 'and',
                            rules: []
                        }
                    ]
                },
                timer: TIME_ZONE_RNAGES,
                contactLoog: [],
                eventLoog: [],
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
            isAMileStone () {
                const milestones = this.storeName.canvasInformation.milestones;
                return milestones.includes(this.controller.id);
            },
            settings () {
                return this.storeName.canvasInformation.controllers[this.controller.id]
                    .processInfo.decision.settings;
            },
            viewTime() {
                if (this.selectResult.time) {
                    let arr = this.selectResult.time.split(':');
                    return arr[0] + this.$t('controller.days') + arr[1]
                        + this.$t('controller.hours') + arr[2] + this.$t('controller.minutes');
                }
                return '-';
            }
        },
        created() {
            const settings = this.settings;
            if (
                (settings && settings.filter_json[0] && settings.filter_json[0].rules.length) ||
                (settings && settings.filter_json[1] && settings.filter_json[1].rules.length)
            ) {
                let stripItem = cloneDeep(settings);
                let isNew = (stripItem.filter_json[0] && stripItem.filter_json[0].actChildren) ||
                    (stripItem.filter_json[1] && stripItem.filter_json[1].actChildren);
                if (!isNew) {
                    const stripAct = stripItem.act;
                    if (stripItem.filter_json[0] && stripItem.filter_json[0].rules) {
                        let contactRules = stripItem.filter_json[0].rules.map(rule => {
                            rule.act = stripAct;
                            return rule;
                        });
                        stripItem.filter_json[0] = {
                            type:  'contact',
                            act: 'and',
                            actChildren: stripAct,
                            rules: contactRules
                        };
                    }
                    if (stripItem.filter_json[1] && stripItem.filter_json[1].rules) {
                        let eventRules = stripItem.filter_json[1].rules.map(rule => {
                            rule.act = stripAct;
                            return rule;
                        });
                        stripItem.filter_json[1] = {
                            type:  'event',
                            act: 'and',
                            actChildren: stripAct,
                            rules: eventRules
                        };
                    }
                    stripItem.act = 'and';
                }
                let contactCondition = {type: 'contact',act: 'and',actChildren: 'and',rules: []};
                let eventCondition = {type: 'event',act: 'and',actChildren: 'and',rules: []};
                if (settings.filter_json.length < 2) {
                    if (settings.filter_json[0].type === 'contact') {
                        stripItem.filter_json.push(eventCondition);
                        this.contactLoog = settings.filter_json[0].rules.map(() => uniqId());
                    } else {
                        stripItem.filter_json.unshift(contactCondition);
                        this.eventLoog = settings.filter_json[0].rules.map(() => uniqId());
                    }
                } else {
                    this.contactLoog = settings.filter_json[0].rules.map(() => uniqId());
                    this.eventLoog = settings.filter_json[1].rules.map(() => uniqId());
                }
                if (!settings.time) {
                    this.selectResult.time = '0:00:01';
                }
                this.selectResult = stripItem;
                //初始化时，清洗旧数据，将事件块内的单条事件/单条属性的act关系修正为'and'
                this.resetAct(0);
                this.resetAct(1);
            }
            this.milestone = this.isAMileStone;
        },
        methods: {
            ...mapMutations([
                UPDATE_CONTROLLER,
                ADD_MILESTONE,
                REMOVE_MILESTONE
            ]),
            ...mapActions([SAVE_JOURNEY]),
            // 添加一条规则
            addStripItem(groupItem,type) {
                let addItem = {};
                addItem.act = groupItem.actChildren;
                if (groupItem.type === 'event') {
                    addItem.event_group = '';
                    addItem.event_group_id = '';
                    addItem.event = '';
                    addItem.event_id = '';
                    addItem.actChildren = 'and';
                    addItem.item_rules = [];
                } else {
                    addItem.field_id = '';
                    addItem.field = '';
                    addItem.field_name = '';
                    addItem.field_type = '';
                    addItem.operation = '';
                    addItem.value = '';
                    addItem.limitSize = 0;
                    addItem.relative_type = 0;
                }

                if (type === 'contact') {
                    if (this.contactLoog.length + this.eventLoog.length >= 15) {
                        this.$toast(this.$t('controller.mostFifteenCondition'),'warn');
                        return;
                    }
                    this.contactLoog.push(uniqId());
                } else if (type === 'event') {
                    if (this.contactLoog.length + this.eventLoog.length >= 15) {
                        this.$toast(this.$t('controller.mostFifteenCondition'),'warn');
                        return;
                    }
                    this.eventLoog.push(uniqId());
                }
                groupItem.rules.push(addItem);
            },
            // 删除一条规则
            deleteResult(autoSave,index,type) {
                if (type === 'contact') {
                    this.contactLoog.splice(index, 1);
                    this.selectResult.filter_json[0].rules.splice(index, 1);
                    this.resetAct(0);
                } else if (type === 'event') {
                    this.eventLoog.splice(index, 1);
                    this.selectResult.filter_json[1].rules.splice(index, 1);
                    this.resetAct(1);
                }
                if (autoSave) {
                    this.confirm(autoSave);
                }
            },
            // 确定一条规则
            resultChange(result,stripIndex,stripType) {
                if (stripType === 'contact') {
                    if (this.selectResult.filter_json[0].rules[stripIndex]) {
                        this.selectResult.filter_json[0].rules[stripIndex] = result;
                    } else {
                        this.$set(this.selectResult.filter_json[0].rules, stripIndex, result);
                    }
                } else if (stripType === 'event') {
                    if (this.selectResult.filter_json[1].rules[stripIndex]) {
                        this.selectResult.filter_json[1].rules[stripIndex] = result;
                    } else {
                        this.$set(this.selectResult.filter_json[1].rules, stripIndex, result);
                    }
                }
            },
            // 提交
            confirm(autoSave) {
                if (this.selectResult.time === '' || this.selectResult.time.length < '0:00:00'.length) {
                    this.$toast(this.$t('controller.completeTime'), 'warn');
                    return;
                }
                if (this.selectResult.time.split(':').join('') < 1) {
                    this.$toast(this.$t('controller.atleast1min'), 'warn');
                    return;
                }
                if (this.selectResult.filter_json[0].rules.length + this.selectResult.filter_json[1].rules.length < 1) {
                    this.$toast(this.$t('controller.emptyCondition'),'warn');
                    return;
                }
                let errContacts = [],
                    errEvents = [];
                if (this.selectResult.filter_json[0].rules.length > 0) {
                    errContacts = this.$refs.contactSettings.filter(contact => {
                        return !contact.valid();
                    });
                }
                if (this.selectResult.filter_json[1].rules.length > 0) {
                    errEvents = this.$refs.eventSettings.filter(event => {
                        return !event.valid();
                    });
                }
                if (errContacts.length + errEvents.length > 0) {
                    return;
                }
                for (let bunch of this.selectResult.filter_json) {
                    for (let i = 0; i < bunch.rules.length; i++) {
                        delete bunch.rules[i].searchResultList;
                    }
                }
                let newController = cloneDeep(this.controller);
                newController.processInfo.time = this.selectResult.time;
                newController.processInfo.decision.settings = this.selectResult;
                for (let item of newController.processInfo.decision.settings.filter_json) {
                    for (let rule of item.rules) {
                        if (
                            rule.field_name === 'mail_influence_date' ||
                            rule.field_name === 'sms_influence_date' ||
                            rule.field_name === 'wechat_influence_date'
                        ) {
                            newController.processInfo.decision.isInteraction = 1;
                        }
                    }
                }
                this.UPDATE_CONTROLLER(newController);
                this.commitMilestone();
                this.SAVE_JOURNEY();
                if (!autoSave) {
                    this.$emit('close');
                }
            },
            commitMilestone() {
                if (this.isAMileStone !== this.milestone) {
                    this.milestone ? this.ADD_MILESTONE(this.controller.id) : this.REMOVE_MILESTONE(this.controller.id);
                }
            },
            changeAct(type,act) {
                if (!this.writable) {
                    return;
                }
                this.selectResult.filter_json[type].actChildren = act;
                for (let i = 0; i < this.selectResult.filter_json[type].rules.length; i++) {
                    this.selectResult.filter_json[type].rules[i].act = act;
                }
            },
            resetAct(index) {
                if (this.selectResult.filter_json[index].rules && this.selectResult.filter_json[index].rules.length === 1) {
                    this.selectResult.filter_json[index].actChildren = 'and';
                    this.selectResult.filter_json[index].rules[0].act = 'and';
                }
            }
        },
        components: {eventSettings, DelayTimePicker}
    };
</script>
<style lang="scss">
    @import "../../../../../../../common/scss/base/variables";
    @import '../../../../../../../common/scss/base/mixin';

    .modal-item{
        .label{
            width: 105px;
        }
        .field-group{
            .condition-bunch {
                width: 950px;
                position: relative;
                border-left: 1px #cccccc solid;

                .just {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    text-align: center;
                    line-height: 22px;
                    margin-left: -12px;
                    margin-top: -12px;
                    @include border-radius(5px);
                    background-color: #cccccc;
                    color: #ffffff;
                    width: 24px;
                    height: 24px;
                    cursor: default;
                    &.disabled {
                        background-color: $disabled;
                        cursor: default;
                    }
                }

                &:before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 21px;
                    height: 1px;
                    background-color: #cccccc;
                }

                &:after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 21px;
                    height: 1px;
                    background-color: #cccccc;
                }

                .chooseBox {
                    background-color: #ffffff;
                    max-width: 980px;
                    margin-left: 30px;
                    margin-bottom: 20px;
                    border: 1px #eeeeee solid;

                    .choose{
                        margin: 10px 0 10px 15px;
                        position: relative;
                        .maybe {
                            position: absolute;
                            top: 50%;
                            left: 0;
                            text-align: center;
                            line-height: 22px;
                            margin-left: -12px;
                            margin-top: -12px;
                            @include border-radius(5px);
                            background-color: #0cc4a9;
                            color: #ffffff;
                            width: 24px;
                            height: 24px;
                            cursor: pointer;
                            &.disabled {
                                background-color: $disabled;
                                cursor: default;
                            }
                        }
                    }
                    .count-1 {
                        border-left: 1px #cccccc solid;

                        &:before {
                            content: '';
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 21px;
                            height: 1px;
                            background-color: #cccccc;
                        }

                        &:after {
                            content: '';
                            position: absolute;
                            left: 0;
                            bottom: 0;
                            width: 21px;
                            height: 1px;
                            background-color: #cccccc;
                        }
                    }
                    .user {
                        max-width: 980px;
                        background-color: #fafafa;

                        span {
                            display: inline-block;
                            padding-left: 20px;
                        }
                        // 样式污染 待修改
                        .add {
                            float: right;

                            .icon-tianjia {
                                line-height: 20px;
                                color: #0cc2a9;
                                cursor: pointer;
                                font-size: 16px;
                                padding-right: 17px;
                            }
                        }

                        @include clearfix();
                    }

                }
            }
        }
    }
</style>
