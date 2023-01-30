import {
    ADD_GENERAL_FILTER_CONDITION, ADD_GROUP, ADD_MEASURE, ADD_MEASURE_FILTER_CONDITION, REMOVE_GROUP, REMOVE_MEASURE,
    REPLACE_GROUPS,
    REPLACE_QUERY, UPDATE_ATTR_INFO_LIST, UPDATE_GENERAL_FILTER, UPDATE_GROUP, UPDATE_GROUP_ORDERS, UPDATE_MEASURE,
    UPDATE_MEASURE_ORDERS
} from '@/store/vuex/mutationTypes';
import cloneDeep from 'lodash/cloneDeep';
import uniqWith from 'lodash/uniqWith';
import {isCompleteMeasure} from '../../../analysis/event-analysis/components/query-form.vue';
import {sameMeasure} from '../../../analysis/event-analysis/components/measure.vue';
import {filterConditionFactory, isCompleteCondition} from '../../../analysis/components/query-filter-condition.vue';

export function measureFactory() {
    return {
        type: '',       // 'evaluate'表示查看的是评估模型相关
        evaluateId: '', // 评估模型的ID
        history: false, // 是否自动探索历史数据
        eventIds: [],   // 事件id，任意事件时，填充所有事件ID
        attrId: '',     // 指标属性的ID
        attrGenre: '',  // 属性类型
        // general:总次数，unique:触发用户数，average:人均次数，sum:求和，avg:均值，max:最大值，
        // min:最小值，uniqAvg:人均值,uniqCount:去重数
        aggreator: '',
        format: '',     // 自定义指标的格式化参数 d:取整，2p:百分比，2f:两位小数
        expression: '', // 自定义表达式
        expressionText: '', // 自定义表达式的文字
        numberPrecision: '',// double类型保留的小数位数
        alias: '',
        order: '',      // asc-升序，desc-降序
        filter: {
            relation: 'and',
            conditions: []
        }
    };
}

function groupFactory() {
    return {
        id: '',
        attrGenre: '',      // 属性值类型 0-字符串类型，1-数字类型,2-时间类型 ,3-小数类型，4-布尔类型
        attrId: '',         // 属性ID 只有用户属性有属性id
        attrType: '',       // 属性类型 用户：fans, 时间：event, 分群：group
        collect: false,     // 是否对该字段进行汇总
        order: '',                  // asc-升序，desc-降序
        timePrecision: 'default',   // 时间类型的精度 'default', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'
        numberPrecision: 2, // double类型保留的小数位数
        numberInterval: [], // 数字汇总区间 [13,30,45]
        numberType: 'default',     // 数值类型 "default","integer","interval"
        userGroupInfo: '',  // 分群信息
    };
}


export const EVENT_ANALYSIS_STORE_NAME = 'eventAnalysis';
export default {
    state: {
        query: {
            // query 1/3 指标
            measures: [],
            // query 2/3 分组查看
            byFields: [],
            // query 3/3 筛选条件
            filter: {
                conditions: [],
                relation: 'and',
            },
            // query additional 自定义指标使用的属性列表
            attrInfoList: []
        }
    },
    mutations: {
        [ADD_MEASURE](state, newMeasure) {
            state.query.measures.push(newMeasure);
        },
        [UPDATE_MEASURE](state, {position, newMeasure}) {
            state.query.measures.splice(position, 1, newMeasure);
        },
        [UPDATE_MEASURE_ORDERS](state, orders) {
            state.query.measures = state.query.measures.map((measure, index) => {
                measure.order = orders[index];
                return measure;
            });
        },
        [REMOVE_MEASURE](state, index) {
            state.query.measures.splice(index, 1);
        },
        [ADD_MEASURE_FILTER_CONDITION](state, measureIndex) {
            const measure = state.query.measures[measureIndex];
            measure.filter.conditions.push(filterConditionFactory());
        },
        [UPDATE_GENERAL_FILTER](state, newFilter) {
            state.query.filter = newFilter;
        },
        [ADD_GROUP](state) {
            state.query.byFields.push(groupFactory());
        },
        [UPDATE_GROUP](state, {position, group}) {
            state.query.byFields.splice(position, 1, group);
        },
        [UPDATE_GROUP_ORDERS](state, orders) {
            state.query.byFields = state.query.byFields.map((byField, index) => {
                byField.order = orders[index];
                return byField;
            });
        },
        [REPLACE_GROUPS](state, newGroups) {
            state.query.byFields = newGroups;
        },
        [REMOVE_GROUP](state, index) {
            state.query.byFields.splice(index, 1);
        },
        [ADD_GENERAL_FILTER_CONDITION](state) {
            state.query.filter.conditions.push(filterConditionFactory());
        },
        [UPDATE_ATTR_INFO_LIST](state, list) {
            state.query.attrInfoList = list;
        },
        [REPLACE_QUERY](state, {measures, byFields, filter, attrInfoList}) {
            if (measures) state.query.measures = measures;
            if (byFields) state.query.byFields = byFields;
            if (filter) state.query.filter = filter;
            if (attrInfoList) state.query.attrInfoList = attrInfoList;
        }
    },
    getters: {
        // 缩水版的 query，不完整的、校验不过的 指标、分组、筛选条件会被滤除
        hydratedQuery(state) {
            const queryCopy = cloneDeep(state.query);
            // 指标
            queryCopy.measures = queryCopy.measures.filter(measure => {
                const complete = isCompleteMeasure(measure);
                if (complete) {
                    measure.filter.conditions = measure.filter.conditions.filter(isCompleteCondition);
                }
                return complete;
            });
            // 指标去重
            queryCopy.measures = uniqWith(queryCopy.measures, sameMeasure);
            // 分组
            queryCopy.byFields = queryCopy.byFields.filter(group => group.key);
            // 筛选条件
            queryCopy.filter.conditions = queryCopy.filter.conditions.filter(isCompleteCondition);
            
            return queryCopy;
        }
    }
};
