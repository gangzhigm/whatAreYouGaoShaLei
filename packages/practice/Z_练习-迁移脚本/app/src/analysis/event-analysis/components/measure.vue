<template>
    <div class="event-analysis-query-measure action-icon-trigger">
        <custom-indicators :options="events" v-if="customizing"
                           :format="measure.format" :measure-express="measure.expressionText"
                           :alias="measure.alias" @custom="customize" :currentMeasure="measure"/>
        <template v-else>
            <selector class="hg" :options="measureOptionGroups" search type="groupSelect"
                      unique-key="key" v-model="optionKey"/>
            &nbsp;{{'eventAnalysis.of' | t}}&nbsp;
            <attr-select :options="attrOptions" :measure-type="measure.type"
                         :attrId="measure.attrId" :aggreator="measure.aggreator"
                         :disabled="!optionKey" @update="changeAttr"/>
            <label>
                &nbsp;{{'eventAnalysis.demonstrate' | t}}&nbsp;
                <input type="text" class="input lg" v-model.trim="alias" @change="updateAlias"
                       :class="{error: aliasWarn}" v-title:top.warn="aliasWarn" maxlength="30">
            </label>
            <checkbox v-if="measure.type === 'evaluate'" :value="measure.history"
                      @input="changeMeasure({history: !measure.history})">{{'eventAnalysis.autoSearch' | t}}
            </checkbox>
        </template>
        <button v-if="!noOptionsAvailable" class="action-icon icon icon-reflow" @click="toggleCustom"></button>
        <slot></slot>
        <button v-if="!noOptionsAvailable" class="action-icon icon icon-plus" @click="$emit('addFilter')"
                :disabled="measure.expressionText==='' && customizing">&nbsp;{{'eventAnalysis.filterCondition' | t}}
        </button>
        <query-filter :groups="attrGroups" :filter="measure.filter" @change="changeMeasure({filter: $event})"
                      :eventIdList="indexEventIds" :evaluateValueLists="evaluateValueLists"
                      @update="updateMeasure({filter: $event})"/>
    </div>
</template>
<script>
    import cloneDeep from 'lodash/cloneDeep';
    import intersectionBy from 'lodash/intersectionBy';
    import uniqBy from 'lodash/uniqBy';
    import isEqual from 'lodash/isEqual';
    import AttrSelect, {GENERAL_AGGREATORS} from './attr-select.vue';
    import CustomIndicators from './custom-indicators.vue';
    import QueryFilter, {isSameConditions} from '../../components/query-filter.vue';
    import {KEY_PREFIXES} from '@/store/vuex/modules/analysisStore';
    import {EVENT_ANALYSIS_STORE_NAME, measureFactory} from '@/store/vuex/modules/eventAnalysisStore';
    import {UPDATE_ATTR_INFO_LIST} from '@/store/vuex/mutationTypes';
    import {ARBITRARY_EVENT_ID} from '../../components/ANALYSIS_QUERY_RULES';
    import {COMMON_NAME_REGEXP} from '@/common/utils/regs';


    // 两个 measure 是否相同
    export function sameMeasure(measureA, measureB) {
        for (let key in measureA) {
            if (!measureA.hasOwnProperty(key)) {
                continue;
            }
            if (key === 'filter') {
                if (
                    measureA.filter.relation !== measureB.filter.relation
                    || !isSameConditions(measureA.filter.conditions, measureB.filter.conditions)
                ) {
                    return false;
                }
            } else {
                if (!isEqual(measureA[key], measureB[key])) {
                    return false;
                }
            }
        }
        return true;
    }

    export default {
        components: {
            AttrSelect,
            CustomIndicators,
            QueryFilter
        },
        name: 'measure',
        props: {
            measure: Object,
            // {
            //     type: '',       // 'evaluate'表示查看的是评估模型相关
            //     evaluateId: '', // 评估模型的ID
            //     history: false, // 是否自动探索历史数据
            //     eventIds: [],   // 事件id，任意事件时，填充所有事件ID
            //     attrId: '',     // 指标属性的ID
            //     attrGenre: '',  // 属性类型
            //     general:总次数，unique:触发用户数，average:人均次数，sum:求和，avg:均值，max:最大值，
            //     min:最小值，uniqAvg:人均值,uniqCount:去重数
            //     aggreator: '',
            //     format: '',     // 自定义指标的格式化参数 d:取整，2p:百分比，2f:两位小数
            //     expression: '', // 自定义表达式
            //     expressionText: '', // 自定义表达式的文字
            //     numberPrecision: '',// double类型保留的小数位数
            //     order: '',          // asc-升序，desc-降序, 置空则不排序
            //     alias: '',
            //     filter: {
            //          relation: 'and',
            //          conditions: []
            //     }
            // },
            events: Array,
            evaluates: Array,
            userAttrs: Array,
            userGroups: Array,
        },
        data() {
            return {
                attrOptions: [],    // updated inside attrGroups getter
                _measureCache: null,
                alias: '',          // data 里面放一个 alias 字段，因为需要及时校验alias的状态
                customizing: false
            };
        },
        computed: {
            noOptionsAvailable() {
                return this.events.length === 0 && this.evaluates.length === 0;
            },
            measureOptionGroups() {
                return [
                    // fixme no proper icons
                    {title: this.$t('eventAnalysis.evaluationModel'), icon: '', options: this.evaluates},
                    {title: this.$t('eventAnalysis.event'), icon: 'event-analysis', options: this.events}
                ];
            },
            indexEventIds() {
                return this.measure.eventIds;
            },
            eventId: {
                get() {
                    return this.measure.eventIds.length > 1 ? ARBITRARY_EVENT_ID : this.measure.eventIds[0];
                },
                set(id, oldId) {
                    const changed = id !== oldId;
                    if (id === ARBITRARY_EVENT_ID) {
                        this.changeMeasure({
                            eventIds: this.events.slice(1)
                                .map(event => event.id),
                            ...(changed ? {attrId: '', alias: '', aggreator: GENERAL_AGGREATORS[0].id} : {})
                        });
                    } else {
                        this.changeMeasure({
                            eventIds: [id],
                            ...(changed ? {attrId: '', alias: '', aggreator: GENERAL_AGGREATORS[0].id} : {})
                        });
                    }
                }
            },
            // 可选为指标：评估模型、事件
            optionKey: {
                get() {
                    // 1/2 评估模型
                    if (this.measure.type === 'evaluate') {
                        return KEY_PREFIXES.EVALUATE_MEASURE + this.measure.evaluateId;
                    }
                    // 2/2 事件
                    return KEY_PREFIXES.EVENT_MEASURE +
                        (this.measure.eventIds.length > 1
                            ? ARBITRARY_EVENT_ID
                            : this.measure.eventIds[0]);
                },
                set(key, oldKey) {
                    const changed = key !== oldKey;
                    // 1/2 评估模型
                    if (key.includes(KEY_PREFIXES.EVALUATE_MEASURE)) {
                        if (changed)
                            this.changeMeasure({
                                type: 'evaluate',
                                evaluateId: key.replace(KEY_PREFIXES.EVALUATE_MEASURE, ''),
                                history: false,
                                eventIds: [],
                                attrId: '',
                                alias: '',
                                aggreator: GENERAL_AGGREATORS[1].id,
                            });
                    } else {
                        // 2/2 事件
                        let id = key.replace(KEY_PREFIXES.EVENT_MEASURE, '');
                        if (id === ARBITRARY_EVENT_ID) {
                            this.changeMeasure({
                                type: '',
                                evaluateId: '',
                                history: false,
                                eventIds: this.events.slice(1)
                                    .map(event => event.id),
                                ...(changed ? {attrId: '', alias: '', aggreator: GENERAL_AGGREATORS[0].id} : {})
                            });
                        } else {
                            this.changeMeasure({
                                type: '',
                                evaluateId: '',
                                history: false,
                                eventIds: [id],
                                ...(changed ? {attrId: '', alias: '', aggreator: GENERAL_AGGREATORS[0].id} : {})
                            });
                        }
                    }
                }
            },
            attrGroups() {
                const isEvaluate = this.measure.type === 'evaluate';
                let firstGroup = null;
                let groups = [];

                if (isEvaluate) {
                    let evaluate = this.evaluates.find(item => item.key === this.optionKey);
                    // 1. 评估模型对应的可选项（①触发用户数;②评估值（注意，根据评估类型决定过滤规则，数值型或文本型）;③评估定义显示名称）
                    firstGroup = {
                        title: this.$t('eventAnalysis.evaluationModel'),
                        icon: '', // fixme no proper icon
                        options: evaluate.attributes,
                    };
                    this.attrOptions = evaluate.attributes.slice();
                } else {
                    // 事件属性
                    let eventAttrs = [];
                    let events = this.eventId === ARBITRARY_EVENT_ID
                        ? this.events
                        : this.measure.eventIds
                        // notice: id 可能为字符串，可能为数字，此处使用 双等号
                        /*eslint-disable-next-line*/
                            .map(id => this.events.find(event => event.id == id))
                            .filter(e => e);    // in case this.events not ready
                    // 选择指标后，生成可用的属性选项、可用的筛选条件选项
                    const attrs = intersectionBy(...(events.map(event => event.attributes)), attr => attr.key);
                    this.attrOptions = attrs
                        .map(attribute => {
                            if (attribute.attrType === 2) {
                                eventAttrs.push(attribute);
                            }
                            return attribute;
                        });
                    firstGroup = {title: this.$t('eventAnalysis.eventAttribute'), icon: 'event-analysis', options: eventAttrs};
                }

                // 指标内部的筛选条件选项组
                groups = [
                    firstGroup,
                    {title: this.$t('eventAnalysis.userAttribute'), icon: 'fans-attr', options: this.userAttrs.slice()},
                    {title: this.$t('home.userGroup'), icon: 'user-group', options: this.userGroups.slice()},
                ].filter(group => group.options.length);

                let availableOptions = [];
                groups.forEach(group => {
                    group.options.map(item => availableOptions.push(item));
                });
                // 之前选定的筛选条件如果不在新的可选列表中，该条件应该被清除
                let newConditions = [];
                this.measure.filter.conditions.forEach(condition => {
                    if (!condition.field.attrId) {
                        newConditions.push(condition);
                    } else {
                        availableOptions.forEach(item => {
                            if (
                                item.key === condition.type + '_' + condition.field.attrId &&
                                item.attrGenre === condition.attrGenre
                            ) {
                                newConditions.push(condition);
                            }
                        });
                    }
                });
                if (newConditions.length !== this.measure.filter.conditions.length) {
                    let newFilter = cloneDeep(this.measure.filter);
                    newFilter.conditions = newConditions;
                    this.changeMeasure({filter: newFilter});
                }
                return groups;
            },
            attrInfoList() {
                return this.$store.state[EVENT_ANALYSIS_STORE_NAME].query.attrInfoList;
            },
            // 指标选择评估定义后，筛选条件中相应可用的推荐值列表
            evaluateValueLists() {
                const isEvaluate = this.measure.type === 'evaluate';
                const result = {
                    contents: [],
                    showNames: [],
                };
                if (isEvaluate) {
                    let evaluate = this.evaluates.find(item => item.key === this.optionKey);
                    try {
                        let rules = JSON.parse(evaluate.calculates[0].rules).evaluates;
                        result.contents = rules.map(rule => rule.showDef.content);
                        result.showNames = rules.map(rule => rule.showDef.showName);
                    } catch (e) {
                        console.error(e);
                    }
                    return result;
                }
                return {
                    contents: [],
                    showNames: [],
                };
            },
            aliasWarn() {
                const alias = this.alias.trim();
                if (alias === '') {
                    return '';
                }
                return COMMON_NAME_REGEXP.test(alias) ? '' : this.$t('common.nameSpecial');
            }
        },
        mounted() {
            if (this.measure.expression) {
                this.customizing = true;
            }
            // data 里面放一个 alias 字段，因为需要及时校验alias的状态
            this.alias = this.measure.alias;
        },
        watch: {
            'measure.alias'(str) {
                if (str !== this.alias) this.alias = str;
            },
            'measure.expressionText'(str) {
                this.customizing = str !== '';
            },
            '$route.query.bmsId'() {
                this._measureCache = null;
            }
        },
        methods: {
            getKey(key) {
                this.optionKey = key;
            },
            toggleCustom() {
                const cache = cloneDeep(this.measure);
                this.customizing = !this.customizing;

                if (this.customizing) {
                    if (this._measureCache &&
                        this._measureCache.alias &&
                        this._measureCache.expression &&
                        this._measureCache.format
                    ) {
                        // 如果有缓存，则直接恢复
                        this.updateMeasure(this._measureCache);
                    } else {
                        // 如果没有有缓存，不能更新指标，等待自定义指标组件点击保存
                    }
                } else {
                    if (this._measureCache) {
                        // 如果有缓存，则直接恢复
                        this.changeMeasure(this._measureCache);
                    } else {
                        // 如果没有有缓存，则初始化
                        let newMeasure = measureFactory();
                        delete newMeasure.filter; // fix 筛选条件被意外清空：http://jira.qdum.com/browse/DWFX-68
                        // 任意事件
                        newMeasure.eventIds = this.events.slice(1)
                            .map(event => event.id);
                        // 总次数
                        newMeasure.aggreator = 'general';
                        this.changeMeasure(newMeasure);
                    }
                }
                this._measureCache = cache;
            },
            // 自定义事件
            customize({name, format, expression, expressionText, arbitrary, eventIds, attrInfoList}) {
                // 以空 measure 为基础，来达到 清空measure其他字段 的目的
                const emptyMeasure = measureFactory();
                delete emptyMeasure.filter; // fix 筛选条件被意外清空：http://jira.qdum.com/browse/DWFX-68
                this.changeMeasure(Object.assign(emptyMeasure, {
                    alias: name,
                    format,
                    expression,
                    expressionText,
                    eventIds: arbitrary ? this.events.slice(1)
                        .map(event => event.id) : eventIds
                }));
                this.$store.commit(
                    UPDATE_ATTR_INFO_LIST,
                    uniqBy(this.attrInfoList.concat(attrInfoList), attr => attr.attrId)
                );
            },
            changeAttr({attr: {id: attrId, attrGenre, attrLength}, aggreator}) {
                this.changeMeasure({
                    attrId,
                    aggreator,
                    attrGenre,
                    numberPrecision: attrGenre === 3 ? attrLength : ''
                });
            },
            changeMeasure(newMeasurePartial) {
                // 指标中是否包含"用户数"
                const newMeasure = Object.assign({}, this.measure, newMeasurePartial);
                const userCountAgg = GENERAL_AGGREATORS.find(agg => agg.name.includes(this.$t('eventAnalysis.userAmount')));
                newMeasure.userCountInside = userCountAgg && newMeasure.aggreator === userCountAgg.id;
                this.$emit('change:measure', newMeasure);
            },
            updateAlias() {
                if (!this.aliasWarn) {
                    this.$emit('update:alias', this.alias);
                }
            },
            updateMeasure(newMeasurePartial) {
                this.$emit('update:measure', Object.assign({}, this.measure, newMeasurePartial));
            }
        }
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .event-analysis-query-measure {
        padding: 8px 10px;

        &:hover {
            background-color: rgba($theme, .2);
        }

        &:before {
            display: inline-block;
            width: 20px;
            height: 20px;
            line-height: 20px;
            margin-right: 10px;
            text-align: center;
            content: attr(data-index);
            color: $blue;
        }

        // input 输入框
        .query-field {
            display: inline-block;
            line-height: $input-field-height - 10px;
            padding: 4px 10px;
            border-radius: 3px;
            border: 1px solid $border-color;

            &:focus {
                border-color: $color-content;
                @include box-shadow();
            }

            &.error {
                border-color: $light-red;
                background-color: rgba($light-red, .2);
            }
        }

    }
</style>
