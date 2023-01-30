<template>
    <!-- 条件簇-单条件-事件选择器 -->
    <div class="event-settings select-box" :class="{'colored':num%2===0,'disabled': !writable}">
        <template v-if="validEvent">
            <div class="event-box"> {{'controller.invalidEvent' | t}} </div>
        </template>
        <template v-else>
            <!--首选项，2种类型（联系人，行为事件）-->
            <div class="event-box" :class="{'event-cascading':type==='event'}">
                <cascading v-if="type === 'contact'" :class="{'view-mode': !writable}" :placeholder="$t('swarm.contactAttribute')"
                    v-model="stripData.field_id" :list="optionsData.customerFieldList" :viewMode="!writable" @select="projectChange($event)"
                    @noitem="noitem"></cascading>
                <cascading class="event-cascading" :class="{'view-mode': !writable}" v-if="type === 'event'" :placeholder="$t('swarm.eventAttribute')"
                    v-model="stripData.event_id" :list="optionsData.eventFieldList" :addable="addAttrShow&&writable"
                    :disabled="(stripData.item_rules&&stripData.item_rules.length>1)" :viewMode="!writable" @select="projectChange($event)"
                    @noitem="noitem" @addAttr="handleAddAttr">
                </cascading>
                <selector v-if="type === 'sales'" class="view-mode" :options="optionsData.salesSelectList" v-model="stripData.field_id"></selector>
                <selector v-if="type === 'goods'" class="view-mode" :options="optionsData.goodsSelectList" v-model="stripData.field_id"></selector>
            </div>
            <!-- 联系人属性 -->
            <template v-if="type !== 'event'&&stripData.field_id">
                <attribute-settings class="contact-attr" :eventId="stripData.event_id" :attribute="stripData" :optionsData="optionsData"
                    :writable="writable" :type="type" ref="contactAttr" @delAttr="deleteStripData" @select="handleAttrChange($event)" />
            </template>
            <!-- 行为事件 -->
            <template v-else-if="stripData.event_id && stripData.event_id !== ''">
                <div class="event-block" :class="{'with-act': stripData.item_rules.length>1}">
                    <div class="maybe-attr" :class="{disabled: !writable}" v-if="stripData.item_rules.length>1">
                        <div v-if="stripData.actChildren === 'and'" @click="changeAct">{{'common.and' | t}}</div>
                        <div v-if="stripData.actChildren === 'or'" @click="changeAct">{{'common.or' | t}}</div>
                    </div>
                    <div class="attrBox">
                        <attribute-settings class="event-attr" v-for="(uid, index) in dummyChild" :key="uid" :eventId="stripData.event_id"
                            :eventName="stripData.event" :attribute="stripData.item_rules[index]" :optionsData="optionsDataEvent"
                            :delAttrShow="dummyChild.length>1" :canempty="canempty" :writable="writable" :type="type" :isEventCount="isEventCount"
                            ref="eventAttrs" @delAttr="handleDelAttr($event,uid)" @select="handleAttrChange($event,uid)" />
                    </div>
                </div>
            </template>
            <span v-if="rulesLength && (type === 'contact' || type === 'event')" class="icon icon-iconless del-all" :class="{disabled: !writable}"
                @click.stop="deleteStripData(false)"></span>
            <span v-if="type === 'sales' || type === 'goods'" class="icon icon-iconless sales-goods-del" @click.stop="deleteStripData()"></span>
            <p class="not-complete" v-if="isWarn">
                <span class="icon icon-warn"></span>
                <span> {{'swarm.curInvalid' | t}} </span>
            </p>
        </template>
    </div>
</template>
<script type="text/ecmascript-6">
import cascading from '../../../../../../../common/components/condition-bunch/cascading.vue';
import attributeSettings from './attribute-settings.vue';
import cloneDeep from 'lodash/cloneDeep';
import { uniqId } from '@/store/vuex/modules/canvasStore';


export default {
    props: {
        stripItem: Object,
        type: String,
        optionsData: Object,
        num: Number,
        writable: {
            type: Boolean,
            default: true
        },
        canempty: {
            type: Boolean,
            default: false
        }, //是否可以保存空条件簇（仅限分群）
        rulesLength: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            stripData: {},
            isWarn: false,
            isEventCount: '',   //判断是否有‘事件总数’或‘不等于’，‘无值’
            dummyChild: [],
            validEvent: false,
            optionsDataEvent: {} //行为事件专用关系符，临时增加了'不属于' feature-6271(parent:6269)
        };
    },
    computed: {
        addAttrShow() {
            return Boolean(this.stripData.item_rules && this.stripData.item_rules.length < 30
                && this.stripData.event_id && this.stripData.event_id !== '');
        },
        stripAct: {
            get: function () {
                return this.stripItem.act;
            },
            set: function (val) {
                this.stripData.act = val;
            }
        }
    },
    watch: {
        stripData: {
            handler: function (val) {
                this.$emit('select', val);
                this.isWarn = false;
                this.isEventCountHandler();
            },
            deep: true
        }
    },
    created() {
        //if (this.type === 'event') {
        //    let temp = cloneDeep(this.optionsData);
        //    temp.relationDictionary.stringDictionary.splice(
        //        temp.relationDictionary.stringDictionary.findIndex(e => {
        //            return e.id === 'belong';
        //        }) + 1, 0,
        //        {
        //            id: 'nbelong',
        //            limitSize: 1,
        //            name: this.$t('swarm.notBelong'),
        //            type: 1
        //        }
        //    );
        //    temp.relationDictionary.numberDictionary.splice(
        //        temp.relationDictionary.numberDictionary.findIndex(e => {
        //            return e.id === 'belong';
        //        }) + 1, 0,
        //        {
        //            id: 'nbelong',
        //            limitSize: 1,
        //            name: this.$t('swarm.notBelong'),
        //            type: 1
        //        }
        //    );
        //    this.optionsDataEvent = Object.assign({}, temp);
        //} else {
        //    this.optionsDataEvent = cloneDeep(this.optionsData);
        //}
        this.optionsDataEvent = cloneDeep(this.optionsData);
        this.stripData = cloneDeep(this.stripItem);
        if (this.type === 'event' && !this.stripData.item_rules) {
            let fn = (key) => {
                this.stripData.item_rules[0][key] = this.stripData[key];
                delete this.stripData[key];
            };
            let topKeys = ['act', 'event_group', 'event_group_id', 'event', 'event_id', 'item_rules', 'actChildren'];
            this.stripData.actChildren = 'and';
            this.stripData.item_rules = [{
                act: 'and',
            }];
            Object.keys(this.stripData).forEach(e => {
                if (!topKeys.includes(e)) {
                    fn(e);
                }
            });
        }
        if (this.stripData.item_rules) {
            this.resetAct();
            this.dummyChild = this.stripData.item_rules.map(() => uniqId());
        }
        this.isEventCountHandler();
    },
    methods: {
        noitem() {
            this.$toast(this.$t('controller.invalidCondition'), 'warn');
            if (this.writable) {
                this.$emit('delResult', false);
            } else {
                // this.$toast(this.$t('controller.readonlyInvalid'), 'warn');
                this.validEvent = true;
            }
        },
        // 选择首选项
        projectChange(e) {
            //事件总数限定条件start
            // delete this.stripData.event_data_start;
            // delete this.stripData.event_data_end;
            // delete this.stripData.journey_instantiation_id;
            // delete this.stripData.journey_group_id;
            // delete this.stripData.task_instantiation_id;
            //事件总数限定条件end
            if (this.type === 'event') {
                delete this.stripData.limitSize;
                delete this.stripData.operation;
                delete this.stripData.relative_type;
                delete this.stripData.value;

                delete this.stripData.form_id;
                delete this.stripData.field;

                this.stripData.event_group = e.event_group;
                this.stripData.event_group_id = e.event_group_id;
                this.stripData.event = e.fieldName;
                this.stripData.item_rules = [{
                    act: 'and',
                    field_name: '',
                    field_id: '',
                    field_type: '',
                    form_id: '',
                    field: ''
                }];
                this.stripData.item_rules[0].limitSize = 0;
                this.stripData.item_rules[0].operation = '';
                this.stripData.item_rules[0].relative_type = 0;
                this.stripData.item_rules[0].value = '';
                this.stripData.item_rules[0].appid = '';
                this.stripData.item_rules[0].form_id = null;
                this.stripData.item_rules[0].field = null;
                this.$nextTick(() => {
                    this.$refs.eventAttrs[0].emptyAttr(this.stripData.item_rules[0]);
                });
                this.dummyChild = [uniqId()];
            } else {
                this.stripData.limitSize = 0;
                this.stripData.operation = '';
                this.stripData.relative_type = 0;
                this.stripData.value = '';
                // this.$set(this.stripData, 'form_id', null);
                // this.$set(this.stripData, 'field', null);
                this.stripData.field_name = e.fieldName;
                this.stripData.field = e.field;
                this.stripData.field_type = e.type;
                this.$nextTick(() => {
                    this.$refs.contactAttr.emptyAttr(this.stripData);
                });
            }
        },
        // 删除整条规则
        deleteStripData(autoSave) {
            if (this.type === 'sales' || this.type === 'goods') {
                this.$emit('delResult');
            } else if (this.writable) {
                this.$emit('delResult', autoSave);
            } else {
                this.validEvent = true;
            }
        },
        changeAct() {
            if (!this.writable) {
                return;
            }
            let temp = Object.assign({}, this.stripData);
            let acted = temp.actChildren === 'or' ? 'and' : 'or';
            temp.actChildren = acted;
            temp.item_rules.forEach(e => {
                e.act = acted;
            });
            this.stripData = cloneDeep(temp);
        },
        // 行为事件添加一条属性
        handleAddAttr() {
            // act: groupItem.actChildren,
            this.stripData.item_rules.push(
                {
                    act: this.stripData.actChildren,
                    field_id: '',
                    field: '',
                    field_name: '',
                    field_type: '',
                    operation: '',
                    value: '',
                    limitSize: 0,
                    relative_type: 0,
                }
            );
            this.dummyChild.push(uniqId());
        },
        // 行为事件删除一条属性
        handleDelAttr(e, uid) {
            if (this.writable) {
                let realIndex = this.dummyChild.findIndex(e => e === uid);
                this.stripData.item_rules.splice(realIndex, 1);
                this.dummyChild.splice(realIndex, 1);
                this.$nextTick(() => {
                    if (!this.dummyChild.length) {
                        this.handleAddAttr();
                    }
                });
            } else {
                this.validEvent = true;
            }
            this.resetAct();
        },
        handleAttrChange(e, target) {
            if (this.type !== 'event') {
                this.stripData = cloneDeep(e);
            } else {
                let realIndex = this.dummyChild.findIndex(e => e === target);
                this.stripData.item_rules[realIndex] = cloneDeep(e);
                this.$emit('select', Object.assign({}, this.stripData, { act: this.stripAct }));
                this.isEventCountHandler();
            }
        },
        isEventCountHandler() {
            //判断是否有‘事件总数’或‘不等于’，‘无值’
            if (this.type === 'event') {
                let event = this.stripData.item_rules.some(rule => {
                    return rule.field_name === 'event_count';
                });
                let operation = this.stripData.item_rules.some(rule => {
                    return rule.operation === 'ne' || rule.operation === 'missing' || rule.operation === 'nin'
                        || rule.operation === 'nbelong';
                });
                this.isEventCount = event ? 'event' : (operation ? 'operation' : '');
            }
        },
        valid() {
            let wrongNum = 0;
            if (this.type === 'sales' || this.type === 'goods') {
                this.$toast(this.$t('swarm.delSalesOrGoodsBunch'), 'warn');
                this.isWarn = true;
                wrongNum++;
            } else if (this.type === 'contact') {
                if (!this.stripData.field_id) {
                    if (this.canempty) {
                        wrongNum = 0;
                    } else {
                        this.isWarn = true;
                        wrongNum++;
                    }
                } else if (!this.$refs.contactAttr.validAttr()) {
                    this.isWarn = true;
                    wrongNum++;
                }
            } else {
                if (!this.stripData.event_id) {
                    if (this.canempty) {
                        wrongNum = 0;
                    } else {
                        this.isWarn = true;
                        wrongNum++;
                    }
                } else if (!this.stripData.item_rules) {
                    this.isWarn = true;
                    wrongNum++;
                } else if (this.stripData.item_rules.length > 0) {
                    let res = this.$refs.eventAttrs.filter(attr => {
                        return attr.validAttr() === false;
                    });
                    wrongNum = wrongNum + res.length;
                }
            }
            if (wrongNum > 0) {
                return false;
            }
            return true;
        },
        //当前行为事件只有一个属性时，自动重置act关系为且 'and'
        resetAct() {
            if (this.stripData.item_rules && this.stripData.item_rules.length === 1) {
                let temp = Object.assign({}, this.stripData);
                temp.actChildren = 'and';
                temp.item_rules[0].act = 'and';
                this.stripData = cloneDeep(temp);
            }
        }
    },
    components: { cascading, attributeSettings }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../../../../../common/scss/base/variables';
@import '../../../../../../../common/scss/base/mixin';
.event-settings {
    background-color: rgba(218, 236, 248, 0.5);

    &.select-box {
        position: relative;
        margin-left: 30px;
        padding: 10px 40px 10px 15px;
        margin-bottom: 5px;
        line-height: normal;

        .action-icon {
            line-height: unset;
        }
        .selector {
            margin-right: 10px;
            vertical-align: top;
        }

        .label-selector {
            width: 300px;

            .select-list {
                max-height: 324px;
            }
        }
        .query-filter-condition-value {
            max-width: 370px;
            min-height: 32px;
            box-sizing: border-box;
            &.multi-form-source {
                min-width: 130px;
                max-width: 500px;
            }
            .keyword-input input {
                width: 50px;
                height: 17px;
                border: 1px solid transparent;
                background-color: inherit;
            }
        }
        span:not(.placeholder):not(.selected-option) {
            line-height: 32px;
            vertical-align: top;
            &.icon-pencil {
                vertical-align: top;
            }
        }
        .disabled-input{
            display: inline-block;
            max-width: 100%;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            cursor: default;
        }
        input {
            vertical-align: top;
        }
        .date-range {
            margin-right: 10px;
            .panel-content {
                input {
                    width: 100%;
                }
            }
            .panel-footer {
                input {
                    width: auto;
                }
            }
        }
        .modal {
            span {
                line-height: normal;
            }
            input {
                vertical-align: middle;
                width: auto;
            }
        }
        .times {
            display: inline-block;
            position: relative;
            vertical-align: top;
            input {
                padding-right: 25px;
            }
            span {
                position: absolute;
                right: 10px;
                top: 0;
            }
        }
        @include clearfix();
    }
    &.colored {
        background-color: rgba(230, 249, 246, 0.5);
    }
    .event-box {
        display: inline-block;
        &.event-cascading {
            display: block;
            @include clearfix();
        }
    }
    .event-block {
        margin: 5px 0 5px 15px;
        position: relative;
        .maybe-attr {
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
        }
        .attrBox {
            position: relative;
            margin-left: 30px;
            // padding: 10px 10px 0 0;
            line-height: normal;
        }
    }
    .with-act {
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
    .del-all {
        position: absolute;
        top: 10px;
        right: 5px;
        font-size: 16px;
        padding-right: 12px;
        cursor: pointer;
        line-height: 32px;
        color: #f67d7d;
    }
    > .not-complete {
        margin-left: 15px;
        color: #f67d7d;
        font-size: 14px;
    }
    &.disabled {
        &.select-box {
            border-radius: 4px;
            padding: 0 8px;
            margin: 0 8px 8px 30px;
            border: none;
            .times {
                @include clearfix();
                span {
                    line-height: 32px;
                    position: unset;
                    right: unset;
                    top: unset;
                }
            }
        }

        .attr-selector {
            margin: 0 10px 0 0;
        }
        .selector {
            width: unset;
            .select-text {
                text-indent: 0;
                width: auto;
            }
        }
        .attr-selector label,
        .selector .select-text {
            line-height: 32px;
            border: none;
            width: unset;
            color: unset;
            padding: 0;
            background-color: unset;
            cursor: default;
            .icon {
                display: none;
            }
        }
        .add,
        .icon-iconless,
        .add-bunch {
            display: none;
        }
        .sales-goods-del {
            display: inline-block;
            position: absolute;
            top: 0;
            right: 9px;
            font-size: 16px;
            cursor: pointer;
            line-height: 32px;
            color: #f67d7d;
        }
        .event-block .maybe-attr {
            background-color: $disabled;
            cursor: default;
        }
        .query-filter-condition-value {
            max-width: unset;
            padding-top: 5px;
        }
    }
}
</style>
