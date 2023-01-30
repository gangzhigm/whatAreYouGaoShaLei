<template>
    <div class="done-filter">
        <div class="done-filter-main action-icon-trigger" :class="{error: !valid}" v-title:top.line.warn="errorText">
            {{'analysis.during' | t}}&nbsp;
            <!-- 时间区间 -->
            <date-range format="YYYY-MM-DD HH:mm:ss" :start="filterCopy.fromDate" :end="filterCopy.toDate" align="left"
                        :dynamic.sync="dynamic" :dynamicTimeParams="filterCopy.dynamicTimeParams"
                        @change="rangeChange"/>
            <!-- 做过/没做过 -->
            <selector class="md" :options="DID_OR_NOT_OPTIONS" v-model="didOrNot"/>
            <!-- 事件 -->
            <selector :options="events" :value="eventId" @select="changeEvent"/>
            <template v-if="didOrNot">
                <!-- 至少、至多、等于、区间、不在区间 -->
                <selector class="md" :options="NUMERICAL_FUNCTION_OPTIONS" :value="filterCopy.function"
                          @input="changeFunction"/>

                <!-- 大于、小于、大于等于、小于等于 -->
                <number-input :min="1" class="input sm"
                              v-if="filterCopy.function === 'greaterEqual' || filterCopy.function === 'lessEqual' || filterCopy.function === 'equal'"
                              :value="filterCopy.params[0]"
                              @sync="updateParams(0, $event)"/>

                <!-- 数值类型 区间 -->
                <template v-if="filterCopy.function === 'between'">
                    <selector class="tiny" type="select"
                              :options="RANGE_LEFT_OPTIONS"
                              @select="changeParamsInterval(0,$event)"
                              :value="filterCopy.paramsInterval[0]"/>
                    <number-input :min="1" class="input sm" :value="filterCopy.params[0]"
                                  @sync="updateParams(0, $event)"/>
                    &nbsp;{{'common.to'| t}}&nbsp;
                    <number-input :min="1" class="input sm" :value="filterCopy.params[1]"
                                  @sync="updateParams(1, $event)"/>
                    <selector class="tiny" :style="{marginLeft:'10px'}" type="select"
                              @select="changeParamsInterval(1,$event)"
                              :options="RANGE_RIGHT_OPTIONS" :value="filterCopy.paramsInterval[1]"/>
                </template>

                <!-- 数值类型 不在区间 -->
                <template v-if="filterCopy.function === 'notBetween'">
                    <selector class="tiny" type="select"
                              :options="RANGE_LEFT_OPTIONS"
                              @select="changeParamsInterval(0,$event)"
                              :value="filterCopy.paramsInterval[0]"/>
                    <number-input :min="1" class="input sm" :value="filterCopy.params[0]"
                                  @sync="updateParams(0, $event)"/>
                    &nbsp;{{'common.to' | t}}&nbsp;
                    <number-input :min="1" class="input sm" :value="filterCopy.params[1]"
                                  @sync="updateParams(1, $event)"/>
                    <selector class="tiny" :style="{marginLeft:'10px'}" type="select"
                              @select="changeParamsInterval(1,$event)"
                              :options="RANGE_RIGHT_OPTIONS" :value="filterCopy.paramsInterval[1]"/>
                </template>
                &nbsp;{{'userGroup.times' | t}}
            </template>
            <button class="action-icon icon icon-plus" @click="addCondition">&nbsp;{{'eventAnalysis.filterCondition' | t}}</button>
            <button class="action-icon icon icon-delete" @click="deleteDoneFilter"></button>
        </div>
        <query-filter :groups="optionGroups" :incompleteAsValid="false" :filter="filterCopy.filter"
                      :autoValidation="autoValidation"
                      :eventIdList="eventIds" @change="updateFilter" @update="updateFilter"/>
    </div>
</template>
<script>
    import cloneDeep from 'lodash/cloneDeep';
    import intersectionBy from 'lodash/intersectionBy';
    import {ARBITRARY_EVENT_ID} from '../components/ANALYSIS_QUERY_RULES';
    import {filterConditionFactory, paramValid} from '../components/query-filter-condition.vue';
    import QueryFilter from '../components/query-filter.vue';

    export default {
        name: 'done-filter',
        components: {
            QueryFilter
        },
        props: {
            autoValidation: Boolean,
            filter: Object,
            // {
            //      fromDate: '',
            //      toDate: '',
            //      timeType, // dynamic 动态时间
            //      dynamicTimeParams,  // [-5,0,'day']
            //      eventId: '',
            //      function: '',
            //      params: [],
            //      paramsInterval: [],
            //      filter: {relation, conditions}
            // }
            events: Array,
            userAttrs: Array,
            userGroups: Array,
        },
        data() {
            return {
                DID_OR_NOT_OPTIONS: [
                    {name: this.$t('userGroup.done'), id: 1},
                    {name: this.$t('userGroup.noDone'), id: 0}
                ],
                NUMERICAL_FUNCTION_OPTIONS: [
                    {id: 'greaterEqual', name: this.$t('userGroup.atLeast')},
                    {id: 'lessEqual', name: this.$t('userGroup.atMost')},
                    {id: 'equal', name: this.$t('analysis.equal')},
                    {id: 'between', name: this.$t('analysis.range')},
                    {id: 'notBetween', name: this.$t('analysis.notRange')},
                ],
                RANGE_LEFT_OPTIONS: [
                    {id: 'include', name: '['},
                    {id: 'exclude', name: '('}
                ],
                RANGE_RIGHT_OPTIONS: [
                    {id: 'include', name: ']'},
                    {id: 'exclude', name: ')'}
                ],
                filterCopy: {
                    fromDate: '',
                    toDate: '',
                    timeType: '', // dynamic 动态时间
                    dynamicTimeParams: [],  // [-5,0,'day']
                    eventId: '',
                    function: '',
                    params: [],
                    paramsInterval: [],
                    filter: {
                        relation: '',
                        conditions: []
                    }
                },
                errorText: ''
            };
        },
        computed: {
            dynamic: {
                get() {
                    return this.filterCopy.timeType === 'dynamic';
                },
                set(flag) {
                    this.filterCopy.timeType = flag ? 'dynamic' : '';
                }
            },
            didOrNot: {
                get() {
                    if (
                        this.filterCopy.function === 'equal'
                        && this.filterCopy.params.length !== 0
                        && this.filterCopy.params[0] === 0
                    ) {
                        return 0;
                    }
                    return 1;
                },
                set(didOrNot, old) {
                    if (didOrNot === old) return;
                    if (didOrNot === 0) {
                        this.filterCopy.function = 'equal';
                        this.filterCopy.params = [0];
                        this.notify();
                    } else {
                        this.filterCopy.function = '';
                        this.filterCopy.params = [];
                        this.notify();
                    }
                }
            },
            eventId: { // 处理 "任意事件" 带来的问题
                get() {
                    return this.filterCopy.eventId === 0 ? ARBITRARY_EVENT_ID : this.filterCopy.eventId;
                },
                set(id) {
                    this.filterCopy.eventId = id === ARBITRARY_EVENT_ID ? 0 : id;
                }
            },
            optionGroups() {
                const events = this.events.filter(({id}) =>
                    this.filterCopy.eventId === 0 || id === this.filterCopy.eventId
                );
                let groups = [];
                if (events.length) {
                    let eventAttrs = [],
                        availableAttrKeys = [];

                    // 选择指标后，生成可用的筛选条件选项
                    const attrs = intersectionBy(...(events.map(event => event.attributes)), attr => attr.key);
                    this.attrOptions = attrs
                        .map(attribute => {
                            if (attribute.attrType === 2) {
                                eventAttrs.push(attribute);
                            }
                            availableAttrKeys.push(attribute.key);
                            return attribute;
                        });
                    availableAttrKeys.push(
                        ...(this.userAttrs.concat(this.userGroups)
                            .map(item => item.key))
                    );
                    // 筛选条件选项组
                    groups = [
                        {title: this.$t('eventAnalysis.eventAttribute'), icon: 'event-analysis', options: eventAttrs},
                        {title: this.$t('eventAnalysis.userAttribute'), icon: 'fans-attr', options: this.userAttrs.slice()},
                        {title: this.$t('home.userGroup'), icon: 'user-group', options: this.userGroups.slice()},
                    ].filter(group => group.options.length);

                    // 之前选定的筛选条件如果不在新的可选列表中，该条件应该被清除
                    const newConditions = this.filterCopy.filter.conditions.filter(condition =>
                        availableAttrKeys.includes(condition.type + '_' + condition.field.attrId) || !condition.field.attrId
                    );
                    if (newConditions.length !== this.filterCopy.filter.conditions.length) {
                        let newFilter = cloneDeep(this.filterCopy.filter);
                        newFilter.conditions = newConditions;
                        this.$nextTick(() => {
                            this.updateFilter(newFilter);
                        });
                    }
                }
                return groups;
            },
            eventIds() {
                return this.filterCopy.eventId === 0
                    ? this.events.slice(1)
                        .map(event => event.id)
                    : [this.filterCopy.eventId];
            },
            complete() {
                let paramsComplete = false;
                if (this.filterCopy.function === 'between' || this.filterCopy.function === 'notBetween') {
                    paramsComplete = paramValid(this.filterCopy.params[0]) && paramValid(this.filterCopy.params[1]);
                } else {
                    paramsComplete = paramValid(this.filterCopy.params[0]);
                }
                return this.filterCopy.eventId !== ''
                    && (
                        (this.filterCopy.fromDate && this.filterCopy.toDate)
                        || (this.filterCopy.timeType === 'dynamic' && this.filterCopy.dynamicTimeParams.length === 3)
                    )
                    && this.filterCopy.function
                    && paramsComplete;
            },
            valid() {
                this.errorText = '';
                if (!this.autoValidation) {
                    return true;
                }
                if (!this.complete) {
                    this.errorText = this.$t('analysis.inComplete');
                    return false;
                }
                let firstNumber = parseInt(this.filterCopy.params[0]);
                switch (this.filterCopy.function) {
                    case 'lessEqual': // 至多
                        if (firstNumber < 1) {
                            this.errorText = this.$t('userGroup.atMostTip');
                            return false;
                        }
                        break;
                    case 'between': // 区间
                        if (this.filterCopy.params.length < 2) {
                            this.errorText = this.$t('userGroup.incompleteInterval');
                            return false;
                        } else if (parseInt(this.filterCopy.params[0]) >= parseInt(this.filterCopy.params[1])) {
                            this.errorText = this.$t('userGroup.verifyInterval');
                            return false;
                        }
                        break;
                    case 'notBetween':
                        if (this.filterCopy.params.length < 2) {
                            this.errorText = this.$t('userGroup.incompleteInterval');
                            return false;
                        } else if (parseInt(this.filterCopy.params[0]) >= parseInt(this.filterCopy.params[1])) {
                            this.errorText = this.$t('userGroup.verifyInterval');
                            return false;
                        }
                        break;
                    default:
                        if (isNaN(firstNumber)) {
                            this.errorText = this.$t('analysis.enterNumber');
                            return false;
                        }
                        break;
                }
                let filterValid = true;
                for (let condition of this.filterCopy.filter.conditions) {
                    filterValid = filterValid && (condition.valid === undefined || condition.valid);
                }
                return filterValid;
            },
        },
        watch: {
            autoValidation(auto, oldAuto) {
                if (auto === true && oldAuto === false) {
                    // update valid
                    this.$nextTick(() => {
                        if (this.valid !== this.filterCopy.valid) {
                            this.notify();
                        }
                    });
                }
            }
        },
        mounted() {
            this.filterCopy = cloneDeep(this.filter);
        },
        methods: {
            notify() {
                this.$nextTick(() => {
                    let newFilter = Object.assign(cloneDeep(this.filterCopy), {valid: this.valid});
                    this.$emit('change', newFilter);
                });
            },
            deleteDoneFilter() {
                this.$emit('change', false);
            },
            rangeChange({start, end, dynamicTimeParams}) {
                this.filterCopy.fromDate = start;
                this.filterCopy.toDate = end;
                this.filterCopy.dynamicTimeParams = dynamicTimeParams;
                this.notify();
            },
            changeEvent(event) {
                if (this.eventId === event.id) return;
                this.eventId = event.id;
                if (this.didOrNot) {
                    this.filterCopy.function = '';
                    this.filterCopy.params = [];
                }
                this.filterCopy.paramsInterval = [];
                this.notify();
            },
            changeFunction(newFunction) {
                this.filterCopy.function = newFunction;
                if (newFunction === 'between' || newFunction === 'notBetween') {
                    this.filterCopy.params = [];
                    this.filterCopy.paramsInterval = ['include', 'include'];
                } else {
                    this.filterCopy.params = [];
                    this.filterCopy.paramsInterval = [];
                }
                this.notify();
            },
            changeParamsInterval(index, e) {
                const paramsIntervalCopy = this.filterCopy.paramsInterval.slice();
                paramsIntervalCopy.splice(index, 1, e.id);
                this.filterCopy.paramsInterval = paramsIntervalCopy;
                this.notify();
            },
            updateParams(index, newValue) {
                const paramsCopy = cloneDeep(this.filterCopy.params);
                paramsCopy.splice(index, 1, newValue);
                this.filterCopy.params = paramsCopy;
                this.notify();
            },
            updateFilter(newFilter) {
                this.filterCopy.filter = newFilter;
                this.notify();
            },
            addCondition() {
                const conditionsCopy = this.filterCopy.filter.conditions.slice();
                conditionsCopy.push(filterConditionFactory());
                this.updateFilter(Object.assign({}, this.filterCopy.filter, {conditions: conditionsCopy}));
            }
        }
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .done-filter {
        position: relative;

        .done-filter-main {
            padding: 5px;

            &.error {
                background-color: rgba($light-red, .2);
            }
        }

        + .done-filter {
            border-top: 1px solid $border-color;
        }
    }

</style>
