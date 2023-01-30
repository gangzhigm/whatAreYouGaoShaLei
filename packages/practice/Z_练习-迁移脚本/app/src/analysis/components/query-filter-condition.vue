<template>
    <div class="query-filter-condition action-icon-trigger" :class="{error: !valid}"
         v-title:top.line.warn="errorParams">
        <!-- 三级联动之一：属性选择 -->
        <selector class="max-length-15 hg" search type="groupSelect" key="attSelect"
                  :disabled="groups.length === 0"
                  :options="groups" :value="conditionMirror.field.attrId" @select="changeAttr"/>
        <!-- 三级联动之二：属性相关function选择 -->
        <selector class="max-length-8" type="select" key="attrFunctionSelect"
                  :disabled="groups.length === 0 || functionOptions.length === 0 || conditionMirror.field.attrId === ''"
                  :options="functionOptions" :value="functionValue" @input="changeFunction"/>
        <!-- 三级联动之三：value设定 -->
        <!-- 等于和不等于 存在于文本型 -->
        <query-filter-condition-value
                v-if="conditionMirror.attrGenre === 0 && (functionValue === 'equal' || functionValue === 'notEqual')"
                valueType="text" inputType="many" :options="valueList" v-model="conditionMirror.params"
                @search="refreshValueList" @change="notify"/>

        <!-- 等于和不等于 存在于整数型 -->
        <query-filter-condition-value
                v-if="conditionMirror.attrGenre === 1 && (functionValue === 'equal' || functionValue === 'notEqual')"
                valueType="integer" inputType="many" :options="valueList" v-model="conditionMirror.params"
                @search="refreshValueList" @change="notify"/>

        <!-- 等于和不等于 存在于数值型 -->
        <query-filter-condition-value
                v-if="conditionMirror.attrGenre === 3 && (functionValue === 'equal' || functionValue === 'notEqual')"
                :precision="conditionMirror.numberPrecision"
                valueType="number" inputType="many" :options="valueList" v-model="conditionMirror.params"
                @search="refreshValueList" @change="notify"/>

        <!-- 包含、不包含，只存在文本型 -->
        <query-filter-condition-value
                v-if="(conditionMirror.attrGenre === 0) && (functionValue === 'contain' || functionValue === 'notContain')"
                :key="functionValue"
                valueType="text" inputType="single" :options="valueList" v-model="conditionMirror.params"
                @search="refreshValueList" @change="notify"/>

        <!-- 正则匹配、正则不匹配，只存在文本型 -->
        <query-filter-condition-value
                v-if="(conditionMirror.attrGenre === 0) && (functionValue === 'rlike' || functionValue === 'notRlike')"
                :key="functionValue" :trim="false" valueType="text" inputType="single" :options="[]"
                v-model="conditionMirror.params" @change="notify"/>

        <!-- 整数类型 大于、小于、大于等于、小于等于 -->
        <number-input
                v-if="conditionMirror.attrGenre === 1 && (functionValue === 'greater' || functionValue === 'less' || functionValue === 'greaterEqual' ||functionValue === 'lessEqual')"
                type="int" class="input" :value="conditionMirror.params[0]" @sync="updateParams(0, $event)"/>

        <!-- 浮点数类型 大于、小于、大于等于、小于等于 -->
        <number-input
                v-if="conditionMirror.attrGenre === 3 && (functionValue === 'greater' || functionValue === 'less' || functionValue === 'greaterEqual' ||functionValue === 'lessEqual')"
                :precision="conditionMirror.numberPrecision"
                type="float" class="input" :value="conditionMirror.params[0]" @sync="updateParams(0, $event)"/>

        <!--整数类型 区间 -->
        <template v-if="conditionMirror.attrGenre === 1 && functionValue === 'between'">
            <selector class="max-length-8 tiny" type="select" :options="notBetweenSelectList"
                      @select="changeParamsInterval(0,$event)"
                      :value="conditionMirror.paramsInterval[0]"/>
            <number-input type="int" class="input" :value="conditionMirror.params[0]" @sync="updateParams(0, $event)"/>
            &nbsp;{{'common.to' | t}}&nbsp;
            <number-input type="int" class="input" :value="conditionMirror.params[1]" @sync="updateParams(1, $event)"
                          v-title:top.line.warn="errorLess" :class="{error: errorLess}"/>
            <selector class="max-length-8 tiny" :style="{marginLeft:'10px'}" type="select"
                      @select="changeParamsInterval(1,$event)"
                      :options="notBetweenSelectList1" :value="conditionMirror.paramsInterval[1]"/>
        </template>

        <!--浮点数类型 区间 -->
        <template v-if="conditionMirror.attrGenre === 3 && functionValue === 'between'">
            <selector class="max-length-8 tiny" type="select" :options="notBetweenSelectList"
                      @select="changeParamsInterval(0,$event)"
                      :value="conditionMirror.paramsInterval[0]"/>
            <number-input :precision="conditionMirror.numberPrecision"
                          type="float" class="input" :value="conditionMirror.params[0]"
                          @sync="updateParams(0, $event)"/>
            &nbsp;{{'common.to' | t}}&nbsp;
            <number-input :precision="conditionMirror.numberPrecision"
                          type="float" class="input" :value="conditionMirror.params[1]"
                          @sync="updateParams(1, $event)" v-title:top.line.warn="errorLess"
                          :class="{error: errorLess}"/>
            <selector class="max-length-8 tiny" :style="{marginLeft:'10px'}" type="select"
                      @select="changeParamsInterval(1,$event)"
                      :options="notBetweenSelectList1" :value="conditionMirror.paramsInterval[1]"/>
        </template>

        <!--整数类型 不在区间 -->
        <template v-if="conditionMirror.attrGenre === 1 && functionValue === 'notBetween'">
            <selector class="max-length-8 tiny" type="select" :options="notBetweenSelectList"
                      @select="changeParamsInterval(0,$event)" :value="conditionMirror.paramsInterval[0]"/>
            <number-input type="int" class="input" :value="conditionMirror.params[0]" @sync="updateParams(0, $event)"/>
            &nbsp;{{'common.to' | t}}&nbsp;
            <number-input type="int" class="input" :value="conditionMirror.params[1]" @sync="updateParams(1, $event)"
                          v-title:top.line.warn="errorLess" :class="{error: errorLess}"/>

            <selector class="max-length-8 tiny" :style="{marginLeft:'10px'}" type="select"
                      @select="changeParamsInterval(1,$event)"
                      :options="notBetweenSelectList1" :value="conditionMirror.paramsInterval[1]"/>
        </template>

        <!--浮点数类型 不在区间 -->
        <template v-if="conditionMirror.attrGenre === 3 && functionValue === 'notBetween'">
            <selector class="max-length-8 tiny" type="select" :options="notBetweenSelectList"
                      @select="changeParamsInterval(0,$event)"
                      :value="conditionMirror.paramsInterval[0]"/>
            <number-input :precision="conditionMirror.numberPrecision"
                          type="float" class="input" :value="conditionMirror.params[0]"
                          @sync="updateParams(0, $event)"/>
            &nbsp;{{'common.to' | t}}&nbsp;
            <number-input :precision="conditionMirror.numberPrecision"
                          type="float" class="input" :value="conditionMirror.params[1]"
                          @sync="updateParams(1, $event)" v-title:top.line.warn="errorLess"
                          :class="{error: errorLess}"/>
            <selector class="max-length-8 tiny" :style="{marginLeft:'10px'}" type="select"
                      @select="changeParamsInterval(1,$event)"
                      :options="notBetweenSelectList1" :value="conditionMirror.paramsInterval[1]"/>
        </template>

        <!-- 时间类型 汇总 -->
        <template v-if="conditionMirror.attrGenre === 2 && functionValue === 'collect'">
            <selector class="max-length-8" type="select"
                      :options="collectSelectList" @select="changeValueList" :value="conditionMirror.format"/>
            <selector class="max-length-8" type="select" @input="changeCollectFunction"
                      :options="collectList" :value="conditionMirror.function"/>
            <query-filter-condition-value valueType="text" inputType="many" :options="valueList"
                                          :prohibitedInput="true"
                                          :isLocalValue="true"
                                          v-model="conditionMirror.params" @search="refreshValueList" @change="notify"/>
        </template>
        <!-- 时间类型 区间 -->
        <template v-if="conditionMirror.attrGenre === 2 && functionValue === 'between'">
            <calendar format="yyyy-mm-dd hh:ii" :end="conditionMirror.params[1] || ''"
                      :value="conditionMirror.params[0]"
                      @input="updateParams(0, $event + ':00')"/>
            &nbsp;{{'common.to' | t}}&nbsp;
            <calendar format="yyyy-mm-dd hh:ii" :start="conditionMirror.params[0]"
                      :value="conditionMirror.params[1]"
                      @input="updateParams(1, $event + ':00')"/>
        </template>
        <!-- 时间类型 相对当前时间区间 -->
        <template v-if="conditionMirror.attrGenre === 2 && functionValue === 'relativeBetween'">
            {{'analysis.during' | t}}
            <time-anchor v-title:top="relativeBetweenStartTip" :value="relativeBetweenStart"
                         @change="relativeBetweenStart = $event"
                         @input="changRelativeTime($event,'relativeBetweenStartTip')"/>
            &nbsp;{{'common.to' | t}}&nbsp;
            <time-anchor v-title:top="relativeBetweenEndTip" :value="relativeBetweenEnd"
                         @change="relativeBetweenEnd = $event"
                         @input="changRelativeTime($event,'relativeBetweenEndTip')"/>
        </template>
        <!--相对当前时间点-->
        <template v-if="conditionMirror.attrGenre === 2 && functionValue ==='relative'">
            <span>{{'analysis.during' | t}}</span>
            <label v-title:top="relativeTimeTip">
                <number-input class="input tiny" :value="relativeTime" @sync="relativeTime = $event"
                              @edit="changRelativeTime($event, 'relativeTimeTip')"/>
            </label>
            <span>{{'common.day' | t}}</span>
            <selector :options="relativeTimeOptions" type="select"
                      :value="conditionMirror.params[2]"
                      @input="updateParams(2, $event)"/>
        </template>
        <!-- 相对事件发生时间 -->
        <template v-if="conditionMirror.attrGenre === 2 && functionValue ==='relativeEventTime'">
            {{'analysis.during' | t}}
            <selector :options="relativeEventTimeOptions" :value="conditionMirror.params[0]"
                      @input="changeRelativeEventTimeOption"/>
            <template
                    v-if="conditionMirror.params.length && (conditionMirror.params[0] === '1' || conditionMirror.params[0] === '-1')">
                <number-input class="input tiny" :value="relativeEventTime" @sync="relativeEventTime = $event"/>
                <selector :options="relativeEventTimeUnits" :value="conditionMirror.params[2]"
                          @input="updateParams(2, $event)"/>
                {{'analysis.withins' | t}}
            </template>
        </template>
        <!--编辑删除-->
        <button class="action-icon icon icon-pencil"
                v-if="(conditionMirror.function === 'equal' && functionValue !== 'collect' ) || functionValue === 'notEqual'"
                @click="editByRawValue"></button>
        <span class="action-icon icon icon-help" v-if="tip" v-title:top="tip"></span>
        <button class="action-icon icon icon-close" @click="deleteCondition" v-if="deleteBtn"
                :title="$t('common.delete')"></button>
        <button class="action-icon icon icon-round-close" @click="resetCondition" v-if="resetBtn"
                :title="$t('analysis.reset')"></button>
        <div class="calendar-shortcuts"
             v-if="conditionMirror.attrGenre === 2 && functionValue === 'between'">
            <button v-for="shortcut in SHORTCUT_DATES" class="calendar-shortcut"
                    :class="{active: matchedRangeKey === shortcut.id}"
                    @click="setShortcut(shortcut.id)" :key="shortcut.id">{{shortcut.name}}
            </button>
        </div>
        <confirm v-if="editRawValues" :title="$t('analysis.batchInput')" @cancel="editRawValues = false"
               @confirm="digestRawValues">
            <textarea class="textarea full-width" v-model="rawValues"></textarea>
            <p class="disabled-text">{{'analysis.note' | t}}</p>
        </confirm>
    </div>
</template>
<script>
    import { WebServAttrApiV1 } from '@/api';
    import {COLLECT_MAP, FUNCTION_MAP} from './ANALYSIS_QUERY_RULES';
    import RANGES, {
        LAST_30_DAYS,
        LAST_7_DAYS,
        LAST_MONTH,
        LAST_WEEK,
        LAST_YEAR,
        LIFETIME,
        THIS_MONTH,
        THIS_WEEK,
        THIS_YEAR
    } from '../../common/components/date-range/RANGES';
    import format from 'date-fns/format';
    import cloneDeep from 'lodash/cloneDeep';
    import debounce from 'lodash/debounce';
    import uniq from 'lodash/uniq';
    import subDays from 'date-fns/sub_days';
    import addDays from 'date-fns/add_days';
    import {KEY_PREFIXES} from '@/store/vuex/modules/analysisStore';
    import TimeAnchor from './time-anchor.vue';
    import QueryFilterConditionValue from './query-filter-condition-value.vue';

    // 创建一个新的 condition
    export function filterConditionFactory() {
        const newCondition = {
            id: (new Date).getTime(),   // 前端虚构的唯一字段，表征condition的身份
            key: '',            // 前端虚构的唯一字段，表征第一级下拉框所选项目
            valid: true,
            type: '',           // fans-用户属性过滤，event-事件属性过滤，group-分群属性过滤
            field: {
                attrId: '',
            },
            attrGenre: 0,
            numberPrecision: '',// double类型保留的小数位数
            function: '',
            params: [],
            format: '',
            paramsInterval: ['include', 'include'],
            userGroupInfo: {
                id: '',
            },
            userGroupRelation: '',  // isTrue:真，isFalse:假
        };
        Object.defineProperty(newCondition, 'id', {
            enumerable: false,
            id: (new Date).getTime(),
            configurable: false,
            writable: false
        });
        return newCondition;
    }

    /**
     * 判断筛选条件的参数是否有效
     * @param param
     */
    export function paramValid(param) {
        return param !== '' && param !== undefined && param !== null && !Number.isNaN(param);
    }

    /**
     * detect whether a query-filter-condition is complete.
     * @param condition
     * @return {boolean}
     */
    export function isCompleteCondition(condition) {
        if (condition.field.attrId) {
            if (condition.userGroupInfo && condition.userGroupInfo.id && condition.userGroupRelation) {
                return true;
            } else if (condition.function !== '') {
                let paramsLen = condition.params.length,
                    firstParam = condition.params[0],
                    secondParam = condition.params[1];
                switch (condition.function) {
                    case 'isSet':
                    case 'notSet':
                    case 'isTrue':
                    case 'isFalse':
                        return true;
                    case 'between':     // 区间
                    case 'notBetween':  // 不在区间
                        return paramValid(firstParam) && paramValid(secondParam);
                    case 'relativeEventTime': // 相对事件发生时间
                        return paramValid(secondParam);
                    default:
                        return paramsLen !== 0 && (paramValid(firstParam) || paramValid(secondParam));
                }
            }
        }
        return false;
    }

    // filters editor
    export default {
        name: 'query-filter-condition',
        components: {
            TimeAnchor,
            QueryFilterConditionValue
        },
        props: {
            eventIdList: { // 用于获取事件相关推荐值时传给后台
                type: Array,
                default: []
            },
            evaluateValueLists: Object,  // 评估模型指标对应属性的推荐值
            condition: Object,
            groups: Array,     // 三级联动之一的选项
            resetBtn: {
                type: Boolean,
                default: false,
            },
            deleteBtn: {
                type: Boolean,
                default: true,
            },
            incompleteAsValid: { // 不完整的条件当做校验通过
                type: Boolean,
                default: true
            },
            autoValidation: { // 自动校验
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                SHORTCUT_DATES: [
                    {name: this.$t('time.thisWeek'), id: THIS_WEEK},
                    {name: this.$t('time.lastWeek'), id: LAST_WEEK},
                    {name: this.$t('time.thisMonth'), id: THIS_MONTH},
                    {name: this.$t('time.lastMonth'), id: LAST_MONTH},
                    {name: this.$t('time.thisYear'), id: THIS_YEAR},
                    {name: this.$t('time.lastYear'), id: LAST_YEAR},
                    {name: this.$t('time.last7Days'), id: LAST_7_DAYS},
                    {name: this.$t('analysis.lastOneMonth'), id: LAST_30_DAYS},
                    {name: this.$t('analysis.sofar'), id: LIFETIME},
                ],
                collectSelectList: [
                    {id: 'minute', name: this.$t('time.minute')},
                    {id: 'hour', name: this.$t('time.hour')},
                    {id: 'day', name: this.$t('time.day')},
                    {id: 'week', name: this.$t('time.week')},
                    {id: 'month', name: this.$t('time.month')},
                    {id: 'quarter', name: this.$t('time.season')},
                ],
                collectList: [
                    {id: 'equal', name: this.$t('analysis.equal')},
                    {id: 'notEqual', name: this.$t('analysis.unEqual')},
                ],
                notBetweenSelectList: [
                    {id: 'include', name: '['},
                    {id: 'exclude', name: '('}
                ],
                notBetweenSelectList1: [
                    {id: 'include', name: ']'},
                    {id: 'exclude', name: ')'}
                ],
                conditionMirror: {
                    key: '',            // 前端虚构的唯一字段
                    type: '',           // 三级联动之一：所选属性的类型: fans:用户属性，group:用户分群
                    field: {
                        attrId: '',     // 三级联动之一：所选属性的id，历史原因导致套在了field对象里
                    },
                    attrGenre: 0,       // 三级联动之一：所选属性的字段类型：0-字符串类型，1-数字类型,2-时间类型 ,3-小数类型，4-布尔类型
                    // 三级联动之二：操作，包括：
                    // equal,notEqual,contain,notContain,isSet,notSet,isEmpty,notEmpty,rlike,notRlike,between,less,
                    // lessEqual,greater,greaterEqual,isTrue,isFalse,like,relativeBefore,relativeWithin,relativeBetween
                    numberPrecision: '',// double类型保留的小数位数
                    function: '',
                    format: '',
                    paramsInterval: ['', ''],
                    params: [],   // 三级联动之三：最终选择的value
                    userGroupInfo: {
                        id: '',
                    },
                    userGroupRelation: '',  // isTrue:真，isFalse:假
                },
                // 三级联动之三的推荐选项
                valueKeyword: '',
                valueList: [],
                relativeTimeOptions: [ // 相对时间方向
                    {id: 'within', name: this.$t('analysis.withins'),},
                    {id: 'before', name: this.$t('analysis.before'),}
                ],
                relativeEventTimeOptions: [
                    {id: '1', name: this.$t('analysis.after')},
                    {id: '-1', name: this.$t('analysis.before')},
                    {id: 'day', name: this.$t('analysis.thisDay')},
                    {id: 'week', name: this.$t('analysis.thisWeek')},
                    {id: 'month', name: this.$t('analysis.thisMonth')},
                ],
                relativeEventTimeUnits: [
                    {id: 'second', name: this.$t('analysis.second')},
                    {id: 'minute', name: this.$t('time.minute')},
                    {id: 'hour', name: this.$t('time.hour')},
                    {id: 'day', name: this.$t('time.day')},
                ],
                editRawValues: false,   // 批量输入输入框
                rawValues: '',          // 批量输入字符串
                relativeBetweenStartTip: '',
                relativeBetweenEndTip: '',
                relativeTimeTip: '',
                errorParams: '',
                errorLess: '',
            };
        },
        computed: {
            matchedRangeKey() {
                if (this.conditionMirror.attrGenre === 2 && this.conditionMirror.function === 'between') {
                    let target = this.SHORTCUT_DATES.find(
                        shortcut => (
                            format(RANGES[shortcut.id].start, 'YYYY-MM-DD HH:mm:ss') === this.conditionMirror.params[0]
                            && format(RANGES[shortcut.id].end, 'YYYY-MM-DD HH:mm:ss') === this.conditionMirror.params[1]
                        )
                    );
                    return target ? target.id : '';
                }
                return '';
            },

            // 三级联动之二 function
            functionValue() {
                if (
                    this.conditionMirror.attrGenre === 2
                    && (
                        this.conditionMirror.function === 'equal'
                        || this.conditionMirror.function === 'notEqual'
                    )
                ) {
                    return 'collect';
                }
                return this.conditionMirror.function;
            },
            // 三级联动之二的选项
            functionOptions() {
                // 没有事件环境，'相对事件时间'不可选
                if (this.eventIdList.length === 0) {
                    return FUNCTION_MAP[this.conditionMirror.attrGenre].filter(list => list.id !== 'relativeEventTime');
                }
                return FUNCTION_MAP[this.conditionMirror.attrGenre];
            },
            tip() {
                switch (this.conditionMirror.attrGenre) {
                    // 字符串
                    case 0 :
                        switch (this.conditionMirror.function) {
                            // 等于、不等于、包含、不包含
                            case 'equal':
                            case 'notEqual':
                            case 'contain':
                            case 'notContain':
                                return this.$t('analysis.tipOne');
                            default:
                                return '';
                        }
                    // 整数类型
                    case 1:
                        switch (this.conditionMirror.function) {
                            case 'equal':
                            case 'notEqual':
                                return this.$t('analysis.tipTwo');
                            case 'between':
                                return '';
                            default:
                                return '';
                        }
                    // 时间类型
                    case 2:
                        switch (this.conditionMirror.function) {
                            case 'relative': {
                                let offset = parseInt(this.relativeTime) || 0;
                                let date = subDays(new Date(), offset);
                                let tip = format(date, 'YYYY-MM-DD');
                                return this.conditionMirror.params[2] === 'before' ? tip + this.$t('analysis.notContained') : tip + this.$t('analysis.contained');
                            }
                            case 'between':
                                return this.$t('analysis.tipTime');
                            case 'relativeBetween': {
                                let startOffset = parseInt(this.relativeBetweenStart);
                                let endOffset = parseInt(this.relativeBetweenEnd);
                                let startTip = isNaN(startOffset)
                                    ? this.$t('analysis.notControl')
                                    : format(addDays(new Date(), startOffset), 'YYYY-MM-DD');
                                let endTip = isNaN(endOffset)
                                    ? this.$t('analysis.notControl')
                                    : format(addDays(new Date(), endOffset), 'YYYY-MM-DD');
                                return this.$t('analysis.valueOne') + startTip + this.$t('analysis.valueTwo') + endTip + this.$t('analysis.borderValue');
                            }
                            default:
                                return '';
                        }
                    // 小数类型
                    case 3:
                        switch (this.conditionMirror.function) {
                            case 'equal':
                            case 'notEqual':
                                return this.$t('analysis.tipNumber');
                            case 'between':
                                return this.$t('analysis.tipNumberTwo');
                            default:
                                return '';
                        }
                    default:
                        return '';
                }
            },
            relativeTime: {
                get() {
                    this.changRelativeTime(this.conditionMirror.params[0], 'relativeTimeTip');
                    return this.conditionMirror.params[0];
                },
                set(int) {
                    this.conditionMirror.params.splice(0, 1, int);
                    this.notify();
                }
            },
            relativeEventTime: {
                get() {
                    return this.conditionMirror.params[1];
                },
                set(int) {
                    this.conditionMirror.params.splice(1, 1, int);
                    this.notify();
                }
            },
            relativeBetweenStart: {
                get() {
                    this.changRelativeTime(this.conditionMirror.params[0], 'relativeBetweenStartTip');
                    return this.conditionMirror.params[0];
                },
                set(int) {
                    this.conditionMirror.params.splice(0, 1, int);
                    this.notify();
                }
            },
            relativeBetweenEnd: {
                get() {
                    this.changRelativeTime(this.conditionMirror.params[1], 'relativeBetweenEndTip');
                    return this.conditionMirror.params[1];
                },
                set(int) {
                    this.conditionMirror.params.splice(1, 1, int);
                    this.notify();
                }
            },
            complete() {    // condition是否完整
                return isCompleteCondition(this.conditionMirror);
            },
            valid() {
                const conditionMirror = this.conditionMirror;
                this.errorParams = '';
                this.errorLess = '';

                if (!this.autoValidation) {
                    return true;
                }

                // 不完整直接return true；完整的话走校验
                if (!this.complete) {
                    if (this.incompleteAsValid) {
                        return true;
                    }
                    this.errorParams = this.$t('analysis.inComplete');
                    return false;
                }
                // 整数类型校验
                if (
                    conditionMirror.attrGenre === 1
                    && conditionMirror.function !== 'isSet'
                    && conditionMirror.function !== 'notSet'
                ) {
                    if (conditionMirror.function === 'between' || conditionMirror.function === 'notBetween') {
                        //两项都填了
                        if (
                            Number.parseFloat(conditionMirror.params[0]) >= Number.parseFloat(conditionMirror.params[1])
                        ) {
                            this.errorLess = this.$t('analysis.valueTip');
                            return false;
                        }
                        return true;
                    }
                    return true;
                }

                // 时间类型校验
                if (conditionMirror.attrGenre === 2) {
                    if (conditionMirror.function === 'relativeBetween') {
                        let start = parseInt(conditionMirror.params[0]),
                            end = parseInt(conditionMirror.params[1]);
                        if (!isNaN(start) && !isNaN(end) && end < start) {
                            this.errorParams = this.$t('analysis.valueTimeTip');
                            return false;
                        }
                    }
                }

                // 小数类型校验
                if (
                    conditionMirror.attrGenre === 3
                    && conditionMirror.function !== 'isSet'
                    && conditionMirror.function !== 'notSet'
                ) {
                    if (conditionMirror.function === 'between' || conditionMirror.function === 'notBetween') {
                        if (
                            Number.parseFloat(conditionMirror.params[0]) >= Number.parseFloat(conditionMirror.params[1])
                        ) {
                            this.errorLess = this.$t('analysis.valueTip');
                            return false;
                        }
                        return true;
                    }
                    return true;
                }

                // all pass, then then valid.
                return true;
            }
        },
        watch: {
            autoValidation(auto, oldAuto) {
                if (auto === true && oldAuto === false) {
                    // update valid
                    this.$nextTick(() => {
                        if (this.valid !== this.conditionMirror.valid) {
                            this.notify();
                        }
                    });
                }
            }
        },
        mounted() {
            this.conditionMirror = cloneDeep(this.condition);
            const keyRecoveryNeeded = !this.conditionMirror.key && this.conditionMirror.field.attrId;
            switch (this.conditionMirror.type) { // 0:用户, 1:商品，2:行为，undefined 用户分群
                case 'user': // 用户属性
                    this.conditionMirror.type = 0;
                    if (keyRecoveryNeeded) {
                        this.conditionMirror.key = KEY_PREFIXES.USER_ATTR + this.conditionMirror.field.attrId;
                    }
                    break;
                case 1: // 商品属性 暂无
                    break;
                case 'event': // 行为 AKA 事件属性
                    this.conditionMirror.type = 2;
                    if (keyRecoveryNeeded) {
                        this.conditionMirror.key = KEY_PREFIXES.EVENT_ATTR + this.conditionMirror.field.attrId;
                    }
                    break;
                case 'group': // fixme 用户分群
                    this.conditionMirror.type = undefined;
                    if (keyRecoveryNeeded) {
                        this.conditionMirror.key = KEY_PREFIXES.USER_GROUP + this.conditionMirror.field.attrId;
                    }
                    break;
                default:
                    if (this.conditionMirror.field.attrId) {
                        console.error('没有定义的 condition.type: ', this.condition);
                    }
                    break;
            }
            if (this.conditionMirror.field.attrId && !this.conditionMirror.key) {
                console.error('condition.key undefined: ', this.condition);
            }
            // update valid
            this.$nextTick(() => {
                if (this.valid !== this.conditionMirror.valid) {
                    this.notify();
                }
            });
        },
        methods: {
            changRelativeTime(value, target) {
                let offset = parseInt(value);
                switch (target) {
                    case 'relativeBetweenStartTip':
                    case 'relativeBetweenEndTip':
                        this[target] = isNaN(offset)
                            ? this.$t('analysis.notControl')
                            : format(addDays(new Date(), offset), 'YYYY-MM-DD') + this.$t('analysis.contain');
                        break;
                    case 'relativeTimeTip':
                        offset = parseInt(value) || 0;
                        this[target] = format(subDays(new Date(), offset), 'YYYY-MM-DD');
                        break;
                }
            },
            notify: debounce(function () {
                let newCondition;
                if (this.valid) {
                    newCondition = cloneDeep(this.conditionMirror);
                    switch (newCondition.type) { // 0:用户, 1:商品，2:行为，undefined 用户分群
                        case 0: // 用户属性
                            newCondition.type = 'user';
                            break;
                        case 1: // 商品属性 暂无
                            break;
                        case 2: // 行为 AKA 事件属性
                            newCondition.type = 'event';
                            break;
                        case undefined: // fixme 用户分群
                            if (newCondition.key.includes(KEY_PREFIXES.USER_GROUP)) {
                                newCondition.type = 'group';
                            } else if (newCondition.key.includes(KEY_PREFIXES.EVALUATE)) {
                                newCondition.type = 'evaluate';
                            }
                            break;
                        default:
                            break;
                    }
                } else {
                    newCondition = cloneDeep(this.condition);
                }
                newCondition.valid = this.valid;
                Object.defineProperty(newCondition, 'id', {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: this.condition.id
                });
                this.$emit('change', newCondition);
            }, 300),
            changeAttr(newAttr) {
                // be aware, newAttr could be a real attribute, a userGroup, etc.
                if (newAttr.key !== this.conditionMirror.key || !this.conditionMirror.key) {
                    // 更新联动第一级相关字段 1/3
                    this.conditionMirror.type = newAttr.attrType;
                    if (newAttr.key.includes(KEY_PREFIXES.USER_GROUP)) { // selecting a group
                        this.conditionMirror.userGroupInfo.id = newAttr.id;
                    } else {
                        this.conditionMirror.userGroupInfo.id = '';
                        // 清除联动第二级所选
                        this.conditionMirror.userGroupRelation = '';
                        this.conditionMirror.function = '';
                    }
                    // 更新联动第二级相关字段 2/3
                    this.conditionMirror.attrGenre = newAttr.attrGenre;
                    this.conditionMirror.numberPrecision = newAttr.attrGenre === 3 ? newAttr.attrLength : '';
                    // 更新联动第三级相关字段 3/3 this.conditionMirror.field.attrId
                    this.conditionMirror.field.attrId = newAttr.id;
                    this.conditionMirror.key = newAttr.key;
                    // 清除联动第三级所选
                    this.conditionMirror.params = [];
                    this.notify();
                }
            },
            changeFunction(newFunction) {
                const isUserGroup = this.conditionMirror.key.includes(KEY_PREFIXES.USER_GROUP);
                if (isUserGroup) {
                    if (newFunction !== this.conditionMirror.userGroupRelation) {
                        this.conditionMirror.function = newFunction;
                        this.conditionMirror.userGroupRelation = newFunction;
                        this.conditionMirror.params = [];
                        this.notify();
                    }
                } else {
                    if (newFunction !== this.conditionMirror.function) {
                        this.conditionMirror.function = newFunction;
                        this.conditionMirror.userGroupRelation = '';

                        switch (this.conditionMirror.function) {
                            case 'collect':
                                this.conditionMirror.params = [];
                                this.conditionMirror.format = 'day';
                                break;
                            case 'relativeBetween':
                                this.conditionMirror.params = ['', '', 'day'];
                                this.conditionMirror.format = '';
                                break;
                            case 'relative':
                                this.conditionMirror.params = ['', 'day', 'within'];
                                this.conditionMirror.format = '';
                                break;
                            case 'between':
                                this.conditionMirror.format = '';
                                if (this.conditionMirror.attrGenre === 1 || this.conditionMirror.attrGenre === 3) {
                                    this.conditionMirror.params = ['', ''];
                                } else {
                                    this.conditionMirror.params = ['', ''];
                                }
                                break;
                            case 'relativeEventTime':
                                this.conditionMirror.params = ['-1', '', this.relativeEventTimeUnits[3].id];
                                this.conditionMirror.format = '';
                                break;
                            default:
                                this.conditionMirror.params = [];
                                this.conditionMirror.format = '';
                                // 有值\没值\为真\为假
                                if (
                                    this.conditionMirror.function === 'isSet' ||
                                    this.conditionMirror.function === 'notSet' ||
                                    this.conditionMirror.function === 'isTrue' ||
                                    this.conditionMirror.function === 'isFalse'
                                ) {
                                    this.notify();
                                }
                                break;
                        }
                    }
                }
            },
            // 获取当function为collect推荐的value
            changeValueList(e) {
                if (e.id !== this.conditionMirror.format) {
                    this.conditionMirror.format = e.id;
                    this.conditionMirror.function = 'collect';
                    this.conditionMirror.params = [];
                }
            },
            // 获取当function为collect时的等于和不等于
            changeCollectFunction(newFunction) {
                this.conditionMirror.function = newFunction;
                this.conditionMirror.userGroupRelation = '';
                this.conditionMirror.params = [];
            },
            // 获取10个推荐value
            refreshValueList(keyword = '') {
                this.valueList = [];

                // 如果选的是汇总，就从本地取提示列表
                if (this.functionValue === 'collect') {
                    this.valueList = COLLECT_MAP[this.conditionMirror.format];
                    return;
                }
                // 评估定义
                if (this.conditionMirror.key.includes(KEY_PREFIXES.EVALUATE)) {
                    if (this.conditionMirror.field.attrId === -1) {
                        // 评估值
                        this.valueList = this.evaluateValueLists.contents;
                    } else if (this.conditionMirror.field.attrId === -2) {
                        // 评估定义显示名称
                        this.valueList = this.evaluateValueLists.showNames;
                    }
                    return;
                }

                WebServAttrApiV1
                    .getValueList({
                        attrId: this.conditionMirror.field.attrId,
                        attrGenre: this.conditionMirror.attrGenre,
                        attrLength: this.conditionMirror.numberPrecision || '', // 字段必须传, 空字符串fallback
                        attrType: this.conditionMirror.type,
                        eventIds: this.conditionMirror.type === 2 ? this.eventIdList : [], // type === 2 为事件
                        keyword,
                        limit: 10 + this.conditionMirror.params.length
                    })
                    .then(({body: {data: {values}}}) => {
                        this.valueList = values;
                    });
            },
            updateParams(index, newValue) {
                this.conditionMirror.params.splice(index, 1, newValue);
                this.notify();
            },
            // 包含不包含区间
            changeParamsInterval(index, e) {
                this.conditionMirror.paramsInterval.splice(index, 1, e.id);
                if (this.conditionMirror.params[0] !== '' && this.conditionMirror.params[1] !== '') this.notify();
            },
            changeRelativeEventTimeOption(optionId) {
                if (optionId === 'day' || optionId === 'week' || optionId === 'month') {
                    this.conditionMirror.params = [optionId];
                    this.notify();
                } else {
                    this.conditionMirror.params = [optionId, '', this.relativeEventTimeUnits[3].id];
                }
            },
            // 展示批量输入
            editByRawValue() {
                this.rawValues = this.conditionMirror.params.join('\n');
                this.editRawValues = true;
            },
            digestRawValues() {
                let verifyArray = this.rawValues.split('\n')
                    .map(line => String(line)
                        .trim())
                    .filter(line => line);
                switch (this.conditionMirror.attrGenre) {
                    // 文本
                    case 0:
                        this.conditionMirror.params = uniq(verifyArray);
                        this.rawValues = '';
                        this.editRawValues = false;
                        this.notify();
                        break;
                    // 整数
                    case 1:
                        if (verifyArray.some(value => isNaN(value) || Number.parseFloat(value) % 1 !== 0)) {
                            this.$toast(this.$t('analysis.enterInteger'), 'warn');
                        } else if (verifyArray.some(value => {
                            let a = value.split('');
                            if (a[0] === '.' || a[a.length - 1] === '.' || a.some(e => isNaN(e))) {
                                return true;
                            }
                        })) {
                            this.$toast(this.$t('analysis.enterInteger'), 'warn');
                        } else {
                            this.conditionMirror.params = uniq(verifyArray);
                            this.rawValues = '';
                            this.editRawValues = false;
                            this.notify();

                        }
                        break;
                    // 小数
                    case 3:
                        if (verifyArray.some(value => isNaN(value))) {
                            this.$toast(this.$t('analysis.enterNumber'), 'warn');
                        } else {
                            this.conditionMirror.params = uniq(verifyArray);
                            this.rawValues = '';
                            this.editRawValues = false;
                            this.notify();
                        }
                        break;
                }

            },
            setShortcut(shortcut) {
                const range = RANGES[shortcut];
                this.conditionMirror.params = [
                    format(range.start, 'YYYY-MM-DD HH:mm:ss'),
                    format(range.end, 'YYYY-MM-DD HH:mm:ss')
                ];
                this.notify();
            },
            deleteCondition() {
                this.$emit('change', false);
            },
            resetCondition() {
                this.conditionMirror = filterConditionFactory();
                this.$emit('reset');
            }
        }
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    $padding-left: 40px;
    .query-filter-condition {
        position: relative;
        padding: 8px 0 8px $padding-left;

        &:hover {
            background-color: rgba($theme, .2);

            .calendar-shortcuts {
                display: inline-block;
                visibility: visible;
            }
        }

        &.error {
            background-color: rgba($light-red, .2);
        }

        @at-root .filter-relation ~ & {
            &:before {
                content: '';
                position: absolute;
                left: 16px;
                top: -10px;
                bottom: 0;
                width: 0;
                border-left: 1px solid $form-border;
            }

            &:first-of-type:before {
                top: round($input-field-height/2) + 5px;
                width: $padding-left - 16;
                border-top: 1px solid $border-color;
                border-top-left-radius: 4px;
            }

            &:last-of-type:before {
                bottom: round($input-field-height/2) + 5px;
                width: $input-field-height + 5px;
                border-bottom: 1px solid $border-color;
                border-bottom-left-radius: 4px;
            }
        }

        .selector {
            margin-right: 8px;
        }

        .calendar-shortcuts {
            display: none;
            visibility: hidden;
            vertical-align: top;
            max-width: 210px;
            margin-left: 5px;

            .calendar-shortcut {
                margin-right: 3px;
                border: none;
                line-height: 15px;
                padding: 1px 5px;
                background-color: transparent;
                border-radius: 2px;
                @include transition(all .2s ease);
                color: #0cc3a8;
                cursor: pointer;

                &:hover {
                    color: white;
                    background-color: #0cc3a8;
                }

                &.active {
                    color: white;
                    background-color: #0cc3a8;
                }
            }
        }
    }
</style>
