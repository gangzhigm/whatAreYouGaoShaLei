<template>
    <div class="event-analysis-query-form">
        <div class="switch" :class="{expanded}" @click="toggle">
            {{'eventAnalysis.setCondition' | t}}
            <svg class="arrow-down" aria-hidden="true">
                <use xlink:href="#icon-arrow-down"></use>
            </svg>
        </div>
        <transition name="drop">
            <div class="query" v-show="expanded">
                <!-- query 1/3 measures 指标-->
                <div class="query-measures">
                    <button class="tag">{{'eventAnalysis.norm' | t}}</button>
                    <span class="line"></span>
                    <query-measure v-for="(measure, index) in measures" :key="index" :data-index="measureIndices[index]"
                                   :events="events" :measure="measure" :evaluates="evaluates"
                                   :user-attrs="userAttrs" :user-groups="userGroups"
                                   @change:measure="changeMeasure($event, index)"
                                   @update:measure="updateMeasure($event, index)"
                                   @update:alias="updateAlias(measure, $event, index)"
                                   @addFilter="addFilterForMeasure(index)">
                        <button class="action-icon icon icon-close" v-if="measures.length > 1"
                                @click="removeMeasure(index)"></button>
                    </query-measure>
                    <button type="button" class="add-measure-btn" @click="addOneMeasure"
                            v-title:right="$t('eventAnalysis.addNorm')">
                        <svg>
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        &nbsp;{{'eventAnalysis.norm' | t}}
                    </button>
                </div>
                <!-- query 2/3 byFields 分组-->
                <div class="query-byField">
                    <button class="tag">{{'eventAnalysis.group' | t}}</button>
                    <span class="line"></span>
                    <div class="event-analysis-groups">
                        <query-group :byFields="byFields" :options="byFieldOptionGroups"
                                     @change="chooseByField"
                                     @delete="deleteDateGroup"/>
                        <button type="button" class="add-group-btn" @click="addOneGroup">
                            <svg>
                                <use xlink:href="#icon-plus"></use>
                            </svg>
                            &nbsp;{{'eventAnalysis.group' | t}}
                        </button>
                    </div>
                </div>
                <!-- query 3/3 filter 筛选条件 -->
                <!-- eventIdList 用于获取事件相关推荐值时传给后台；
                     evaluateValueLists 评估模型指标对应属性的推荐值;
                 -->
                <div class="query-filer">
                    <button class="tag">{{'eventAnalysis.filterCondition' | t}}</button>
                    <span class="line"></span>
                    <query-filter :groups="measureFilteredOptionGroups" :filter="filter" @change="changeFilter"
                                  :eventIdList="filterEventIdList"
                                  :evaluateValueLists="evaluateValueLists"
                                  @update="updateFilter"/>
                    <button type="button" class="add-condition-btn" @click="addCondition">
                        <svg>
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        &nbsp;{{'eventAnalysis.filterCondition' | t}}
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
    import { webServUserGroupApiV1, WebServAttrApiV1, WebServEventApiV1 } from '@/api';
    import debounce from 'lodash/debounce';
    import cloneDeep from 'lodash/cloneDeep';
    import intersection from 'lodash/intersection';
    import intersectionBy from 'lodash/intersectionBy';
    import intersectionWith from 'lodash/intersectionWith';
    import QueryMeasure from './measure.vue';
    import QueryFilter from '../../components/query-filter.vue';
    import QueryGroup from '../../components/query-group.vue';
    import { mapState, mapMutations } from 'vuex';
    import {EVENT_ANALYSIS_STORE_NAME, measureFactory} from '@/store/vuex/modules/eventAnalysisStore';
    import {
        ADD_GENERAL_FILTER_CONDITION,
        ADD_GROUP,
        ADD_MEASURE,
        ADD_MEASURE_FILTER_CONDITION,
        CLOSE_SEARCH,
        REMOVE_GROUP,
        REMOVE_MEASURE,
        REPLACE_GROUPS,
        UPDATE_GENERAL_FILTER,
        UPDATE_GROUP,
        UPDATE_MEASURE
    } from '@/store/vuex/mutationTypes';
    import {GENERAL_AGGREATORS, NONE_NUMERICAL_AGGREATORS, NUMERICAL_AGGREATORS} from './attr-select.vue';
    import {ARBITRARY_EVENT_ID} from '../../components/ANALYSIS_QUERY_RULES';
    import {ANALYSIS_STORE_NAME, KEY_PREFIXES} from '@/store/vuex/modules/analysisStore';

    export function isCompleteMeasure(measure) {
        return (measure.eventIds.length && (measure.attrId || measure.aggreator)) // 事件指标
            || (measure.expression && measure.format) // 自定义事件指标
            || (measure.type === 'evaluate' && measure.evaluateId); // 评估模型指标
    }

    /**
     * 给重复的名字加后缀
     * @param {Array<String>} names
     */
    function postfixRepeatedNames(names) {
        const nameIndicesMap = {};
        return names.map(name => {
            const count = nameIndicesMap[name];
            if (count) {
                nameIndicesMap[name] = nameIndicesMap[name] + 1;
                name = name + `(${count})`;
            } else {
                nameIndicesMap[name] = 1;
            }
            return name;
        });
    }

    export default {
        name: 'query-form',
        data() {
            return {
                expanded: false,     // 收起/展开
                userAttrs: [],
                eventAttrs: [],
                userGroups: [],
                events: [],         // 事件列表；query 1/3 指标可选项
                dataReady: false    // 基础数据获取完毕flag，
            };
        },
        computed: {
            // 获取筛选条件的eventIdList
            filterEventIdList() {
                return [].concat(...this.measures.map(measure => measure.eventIds));
            },
            // 指标内选择评估定义后，筛选条件中相应可用的推荐值列表
            evaluateValueLists() {
                const contentLists = [];
                const showNameLists = [];
                this.selectedEvaluates
                    .map(evaluate => {
                        try {
                            let rules = JSON.parse(evaluate.calculates[0].rules).evaluates;
                            contentLists.push(rules.map(rule => rule.showDef.content));
                            showNameLists.push(rules.map(rule => rule.showDef.showName));
                        } catch (e) {
                            console.error(e);
                        }
                    });
                return {
                    contents: intersection(...contentLists),
                    showNames: intersection(...showNameLists)
                };
            },
            // 分组列表；由 measureFilteredOptionGroups 处理得来
            byFieldOptionGroups() {
                const groups = cloneDeep(this.measureFilteredOptionGroups);
                const byFieldKeys = this.byFields.map(byField => byField.key);
                groups.forEach(group => {
                    group.options.forEach(option => {
                        option.disabled = byFieldKeys.includes(option.key);
                    });
                });
                return groups;
            },
            // 指标联动的可选项组，分组需要过滤使用，筛选条件直接使用
            // 分组列表；query 2/3 按xx查看可选项 分组(byFields)：包含事件属性、用户属性、分群
            // 筛选条件；query 3/3 筛选条件可选项 筛选条件(filter)：包含事件属性、用户属性、分群
            measureFilteredOptionGroups() {
                const eventMeasureExisted = this.selectedEvents.length;
                const evaluateExisted = this.selectedEvaluates.length;
                const groups = [],
                    userAttrs = this.userAttrs.slice(),
                    userGroups = this.userGroups.slice();
                if (eventMeasureExisted && !evaluateExisted) {
                    let selectedAttrArrs = this.selectedEvents.map(event => event.attributes),
                        eventAttrs = intersectionBy(this.eventAttrs, ...selectedAttrArrs, attr => attr.key);
                    groups.push({
                        title: this.$t('eventAnalysis.eventAttribute'),
                        icon: 'event-analysis',
                        options: eventAttrs.length ? eventAttrs : [{
                            id: 'not-valid-option',
                            name: this.$t('eventAnalysis.notValidOption'),
                            disabled: true
                        }]
                    });
                } else if (!eventMeasureExisted && evaluateExisted) {
                    let selectedEvaluateAttrs = this.selectedEvaluates.map(evaluate => evaluate.attributes),
                        evaluateAttrs = intersectionWith(
                            ...selectedEvaluateAttrs,
                            (a, b) => a.key === b.key && a.attrGenre === b.attrGenre
                        );
                    groups.push({
                        title: this.$t('eventAnalysis.evaluationModel'),
                        icon: '', // fixme no proper icon
                        options: evaluateAttrs
                    });

                }
                if (userAttrs.length) groups.push({
                    title: this.$t('eventAnalysis.userAttribute'),
                    icon: 'fans-attr',
                    options: userAttrs
                });
                if (userGroups.length) groups.push({
                    title: this.$t('home.userGroup'),
                    icon: 'user-group',
                    options: userGroups
                });
                let availableKeys = [];
                groups.forEach(group => {
                    group.options.map(item => availableKeys.push(item.key));
                });
                const trimmedByFields = this.byFields.filter(item => availableKeys.includes(item.key) || !item.key);
                const trimmedConditions = this.filter.conditions
                    .filter(condition =>
                        availableKeys.includes(condition.type + '_' + condition.field.attrId) || !condition.field.attrId
                    );
                if (this.dataReady) {
                    this.REPLACE_GROUPS(trimmedByFields);
                    this.updateFilter({relation: this.filter.relation, conditions: trimmedConditions});
                }

                return groups;
            },
            selectedEvaluates() {
                const selectedEvaluateIds = this.measures.filter(measure => measure.evaluateId)
                    .map(measure => Number(measure.evaluateId));
                return this.evaluates.filter(evaluate => selectedEvaluateIds.includes(evaluate.id));
            },
            selectedEvents() {
                const selectedEventIds = this.measures.reduce((arr, measure) => {
                    return arr.concat(measure.eventIds);
                }, []);
                // notice: id 可能为字符串，可能为数字，此处使用 双等号
                /*eslint-disable-next-line*/
                return this.events.filter(event => selectedEventIds.some(id => id == event.id));
            },
            // 指标名字数组
            // 优先级：别名 > 指标名 > 属性名 > 属性操作名(aggreator.name)
            measureNames() {
                return postfixRepeatedNames(
                    this.$store.getters.hydratedQuery.measures
                        .map(({alias, eventIds, attrId, aggreator: aggId, type, evaluateId}) => {
                            let name = '';
                            if (alias) {
                                name = alias;
                            } else if (eventIds.length) {
                                // 事件
                                let event = null;
                                if (eventIds.length === 1) {
                                    // notice: id 可能为字符串，可能为数字，此处使用 双等号
                                    /*eslint-disable-next-line*/
                                    event = this.events.find(event => event.id == eventIds[0]);
                                    name = event.name;
                                } else {
                                    event = this.events.find(event => event.id === ARBITRARY_EVENT_ID);
                                    name = this.$t('eventAnalysis.anyEvent'); // 任意事件的eventIds包含所有eventId
                                }
                                let attr = event.attributes.find(attr => attr.id === attrId);
                                let aggreator = NUMERICAL_AGGREATORS.concat(NONE_NUMERICAL_AGGREATORS, GENERAL_AGGREATORS)
                                    .find(agg => agg.id === aggId);
                                if (attr || aggreator) {
                                    name += this.$t('eventAnalysis.of') + (attr ? attr.meaning : '') + (aggreator ? aggreator.name : '');
                                }
                            } else if (type === 'evaluate' && evaluateId) {
                                // 评估定义
                                let evaluate = this.evaluates.find(item => item.id === Number(evaluateId));
                                name = evaluate.name;
                                let attr = evaluate.attributes.find(attr => attr.id === attrId);
                                let aggreator = NUMERICAL_AGGREATORS.concat(NONE_NUMERICAL_AGGREATORS, GENERAL_AGGREATORS)
                                    .find(agg => agg.id === aggId);
                                if (attr || aggreator) {
                                    name += this.$t('eventAnalysis.of') + (attr ? attr.meaning : '') + (aggreator ? aggreator.name : '');
                                }
                            }
                            return name;
                        }));
            },
            fieldNames() { // 分组名字数组
                const groups = this.measureFilteredOptionGroups.reduce((acc, grp) => acc.concat(grp.options), []);
                return this.$store.getters.hydratedQuery.byFields
                    .map(group => {
                        const target = groups.find(grp => grp.key === group.key);
                        return target ? target.name : '';
                    });
            },
            measureIndices() {
                return this.measures.map((measure, index) => {
                    const round = parseInt(index / 26);
                    const length = index % 26;
                    return String.fromCharCode(65 + length) + (round ? round : '');
                });
            },
            ...mapState({
                measures: state => state[EVENT_ANALYSIS_STORE_NAME].query.measures,
                byFields: state => state[EVENT_ANALYSIS_STORE_NAME].query.byFields,
                filter: state => state[EVENT_ANALYSIS_STORE_NAME].query.filter,
                isDropdownSearch: state => state[ANALYSIS_STORE_NAME].isDropdownSearch,
                // 评估模型；query 1/3 指标可选项组成部分
                evaluates: state => state[ANALYSIS_STORE_NAME].evaluates,
                userId: state => state.user.cid
            }),
        },
        created() {
            if (this.isDropdownSearch) {
                this.expanded = this.isDropdownSearch;
            }
            this.CLOSE_SEARCH();
            Promise
                .all([
                    WebServEventApiV1.getEventList(this.userId,'',true),
                    this.fetchAttributes(0),    // 0用户属性
                    this.fetchAttributes(2),    // 2事件属性
                    this.fetchUserGroups()      // 用户分群
                ])
                .then(([{body: {data: {eventList}}}, userAttrs, eventAttrs, userGroups]) => {
                    // 1.1 事件列表
                    const events = eventList.map(event => {
                        event.name = event.meaning;
                        event.key = KEY_PREFIXES.EVENT_MEASURE + event.id;
                        event.attributes.forEach(attr => {
                            attr.name = attr.meaning;
                            // init key for event.attributes
                            switch (attr.attrType) { // 0:用户, 1:商品，2:行为，undefined 用户分群
                                case 0: // 用户属性
                                    attr.key = KEY_PREFIXES.USER_ATTR + attr.id;
                                    break;
                                case 1: // 商品属性 暂无
                                    break;
                                case 2: // 行为 AKA 事件属性
                                    attr.key = KEY_PREFIXES.EVENT_ATTR + attr.id;
                                    break;
                                case undefined: // fixme 用户分群
                                    attr.key = KEY_PREFIXES.USER_GROUP + attr.id;
                                    break;
                                default:
                                    console.warn('事件分析：遍历指标内的筛选条件可用选项时，以下属性没有合适的分组：');
                                    break;
                            }
                        });
                        return event;
                    });

                    if (events.length > 0) {
                        events.unshift({
                            name: this.$t('eventAnalysis.anyEvent'),
                            id: ARBITRARY_EVENT_ID,
                            key: KEY_PREFIXES.EVENT_MEASURE + ARBITRARY_EVENT_ID,
                            attributes: intersectionBy(...(events.map(event => event.attributes)), attr => attr.key)
                        });
                    }

                    // 1.3 用户属性
                    userAttrs.forEach(userAttr => {
                        userAttr.key = KEY_PREFIXES.USER_ATTR + userAttr.id;
                    });
                    // 1.4 事件属性
                    eventAttrs.forEach(eventAttr => {
                        eventAttr.key = KEY_PREFIXES.EVENT_ATTR + eventAttr.id;
                    });
                    // 1.5 用户分组
                    userGroups.forEach(userGroup => {
                        userGroup.key = KEY_PREFIXES.USER_GROUP + userGroup.id;
                    });

                    this.events = events;
                    this.userAttrs = userAttrs;
                    this.eventAttrs = eventAttrs;
                    this.userGroups = userGroups;

                    // 1.6 标记基础数据获取完毕
                    this.dataReady = true;

                    // 2 自动选中一条 measure
                    if (
                        this.measures.length === 0
                        && (this.events.length !== 0 || this.evaluates.length !== 0)
                    ) {
                        this.addOneMeasure();
                    }
                });
        },
        methods: {
            toggle() {
                this.expanded = !this.expanded;
            },
            // 获取数据 0用户属性 2事件属性
            fetchAttributes(type) {
                return WebServAttrApiV1.getAttributes({attrType: type, isFilter: '', isResult: '',isDataAnalysis:true})
                    .then(({body: {data: {attributeList: attrs}}}) => {
                        return attrs.map(attr => {
                            attr.name = attr.meaning;
                            return attr;
                        });
                    });
            },
            fetchUserGroups() {
                return webServUserGroupApiV1
                    .getUserGroups()
                    .then(({body: {data: {userGroupList}}}) => {
                        return userGroupList
                            .filter(group => group.enable)
                            .map(group => {
                                // according to ANALYSIS_QUERY_RULES.FUNCTION_MAP, userGroup behaves like a boolean genre
                                group.attrGenre = 4;
                                return group;
                            });
                    });
            },
            // 通知外部组件，query发生了变化，一般在校验通过之后
            notify: debounce(function () {
                this.$emit('change', {
                    measureNames: this.measureNames,
                    fieldNames: this.fieldNames,
                });
            }, 500),
            notifyAlias: debounce(function () {
                this.$emit('alias-change', {
                    measureNames: this.measureNames,
                    fieldNames: this.fieldNames,
                });
            }, 300),
            // 添加一个指标
            addOneMeasure() {
                let newMeasure;
                // 没有提供新的measure，复制前一个，但是不包含筛选条件部分
                let measuresLen = this.measures.length;
                if (measuresLen > 0) {
                    let lastMeasure = this.measures[measuresLen - 1];
                    if (
                        lastMeasure.expression
                        || (
                            lastMeasure.eventIds.length === 0
                            || (lastMeasure.type === 'evaluate' && lastMeasure.evaluateId)
                        )
                    ) {
                        newMeasure = measureFactory();
                        // 事件id，任意事件时，填充所有事件ID
                        newMeasure.eventIds = this.events.slice(1)
                            .map(event => event.id);
                        // 总次数
                        newMeasure.aggreator = 'general';
                    } else {
                        newMeasure = cloneDeep(lastMeasure);
                        newMeasure.filter = {relation: 'and', conditions: []};
                    }
                } else {
                    newMeasure = measureFactory();
                    // 选中任意事件
                    if (this.events.length) {
                        // 事件id，任意事件时，填充所有事件ID
                        newMeasure.eventIds = this.events.slice(1)
                            .map(event => event.id);
                        // 总次数
                        newMeasure.aggreator = 'general';
                    }  else if (this.evaluates.length >= 1) {
                        // 选中第一个评估模型

                        // 评估模型
                        newMeasure.type = 'evaluate';
                        // 评估模型ID
                        newMeasure.evaluateId = this.evaluates[0].id;
                        // "触发用户数"
                        newMeasure.aggreator = GENERAL_AGGREATORS[1].id;
                    }
                }
                this.ADD_MEASURE(newMeasure);
                if (this.$store.getters.hydratedQuery.measures && this.$store.getters.hydratedQuery.measures.length)
                    this.notify();
            },
            // 编辑更新一个指标
            changeMeasure(newMeasure, index) {
                this.UPDATE_MEASURE({
                    position: index,
                    newMeasure
                });
                if (this.$store.getters.hydratedQuery.measures && this.$store.getters.hydratedQuery.measures.length)
                    this.notify();
            },
            updateMeasure(newMeasure, index) {
                this.UPDATE_MEASURE({
                    position: index,
                    newMeasure
                });
            },
            updateAlias(measure, newAlias, index) {
                const newMeasure = cloneDeep(measure);
                newMeasure.alias = newAlias;
                this.UPDATE_MEASURE({
                    position: index,
                    newMeasure,
                });
                this.notifyAlias();
            },
            // 删掉一个指标
            removeMeasure(index) {
                const targetMeasure = this.measures[index];
                this.REMOVE_MEASURE(index);
                // 如果删除的是一个完整的指标，那么通知外部
                if (isCompleteMeasure(targetMeasure))
                    this.notify();
            },
            // 给指标添加一个筛选条件
            addFilterForMeasure(index) {
                this.ADD_MEASURE_FILTER_CONDITION(index);
            },
            // 添加一个空分组
            addOneGroup() {
                this.ADD_GROUP();
            },
            chooseByField(newField) {
                this.UPDATE_GROUP(newField);
                this.notify();
            },
            deleteDateGroup({index, target}) {
                this.REMOVE_GROUP(index);
                if (target.id) {
                    this.notify();
                }
            },
            // 添加一条最外层的筛选条件
            addCondition() {
                this.ADD_GENERAL_FILTER_CONDITION();
            },
            // 更新筛选条件
            updateFilter(newFilter) {
                this.UPDATE_GENERAL_FILTER(newFilter);
            },
            // 筛选条件change
            changeFilter(newFilter) {
                this.UPDATE_GENERAL_FILTER(newFilter);
                this.notify();
            },
            ...mapMutations([
                REPLACE_GROUPS,
                CLOSE_SEARCH,
                ADD_MEASURE,
                UPDATE_MEASURE,
                REMOVE_MEASURE,
                ADD_MEASURE_FILTER_CONDITION,
                ADD_GROUP,
                UPDATE_GROUP,
                REMOVE_GROUP,
                ADD_GENERAL_FILTER_CONDITION,
                UPDATE_GENERAL_FILTER
            ])
        },
        components: {
            QueryMeasure,
            QueryFilter,
            QueryGroup
        }
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .event-analysis-query-form {
        position: relative;
        border: 1px solid $border-color;

        &:hover {
            @include box-shadow(3px 0 8px rgba(#8b9daf, 0.16));
        }

        // 设置条件 展开收起
        .switch {
            height: 38px;
            line-height: 38px;
            text-align: center;
            color: $theme;
            background-color: $title-bg;
            cursor: pointer;

            $scale: 5/14;

            &:not(.expanded):hover {
                &:before {
                    @include transform(scaleY(1));
                }

                .arrow-down {
                    @include transform(translateY(5px) scaleY($scale));
                }
            }

            &.expanded {
                &:before {
                    @include transform(scaleY(1));
                }

                .arrow-down {
                    @include transform(translateY(5px) scaleY($scale) rotate(180deg));
                }
            }

            &:before {
                content: '';
                position: absolute;
                left: 50%;
                bottom: -16px;
                height: 16px;
                width: 40px;
                margin-left: -20px;
                background-color: $theme;
                border-bottom-left-radius: 4px;
                border-bottom-right-radius: 4px;
                @include transition();
                @include transform-origin(center top);
                @include transform(scaleY(.625));
            }

            .arrow-down {
                position: absolute;
                left: 50%;
                bottom: -10px;
                height: 14px;
                width: 14px;
                margin-left: -7px;
                fill: white;
                @include transition();
                @include transform(translateY(2px) scaleY($scale));
            }
        }

        .query {
            position: relative;
            background-color: white;
            padding-top: 2px;
            border-top: 1px solid $border-color;

            .query-measures, .query-filer, .query-byField {
                position: relative;
            }

            .tag {
                display: block;
                width: auto;
                height: 24px;
                margin: 12px 0 8px;
                padding: 0 8px;
                text-align: center;
                line-height: 24px;
                color: white;
                background-color: #798491;
                border-radius: 0 4px 4px 0;
                @include user-select(none);
                border: none;
                position: relative;
                z-index: 1;
            }

            .line {
                top: 12px;
                position: absolute;
                left: 0;
                right: 0;
                height: 0;
                border-top: 1px solid #d6dbe4;
            }
        }

        // query 1/3 指标 measures
        .add-measure-btn {
            height: 22px;
            line-height: 22px;
            border: none;
            margin: 8px 0 8px 40px;
            padding: 0;
            background-color: transparent;
            color: $green;
            cursor: pointer;

            &:hover {
                color: $light-green;
            }

            svg {
                display: inline-block;
                width: 1em;
                height: 1em;
                fill: currentColor;
                vertical-align: top;
                margin-top: 5px;
            }
        }

        // query 2/3 分组 byFields
        .event-analysis-groups {
            .by-fields-groups {
                padding-left: 20px;
            }
        }

        .add-group-btn {
            height: 22px;
            line-height: 22px;
            border: none;
            margin: 8px 0 8px 40px;
            padding: 0;
            background-color: transparent;
            color: $green;
            cursor: pointer;

            &:hover {
                color: $light-green;
            }

            svg {
                display: inline-block;
                width: 1em;
                height: 1em;
                vertical-align: top;
                margin-top: 5px;
                fill: currentColor;
            }
        }

        // query 3/3 筛选条件 filter.conditions
        .add-condition-btn {
            height: 22px;
            line-height: 22px;
            border: none;
            margin: 8px 0 24px 40px;
            padding: 0;
            background-color: transparent;
            color: $green;
            cursor: pointer;

            &:hover {
                color: $light-green;
            }

            svg {
                display: inline-block;
                width: 1em;
                height: 1em;
                vertical-align: top;
                margin-top: 5px;
                fill: currentColor;
            }
        }
    }
</style>
