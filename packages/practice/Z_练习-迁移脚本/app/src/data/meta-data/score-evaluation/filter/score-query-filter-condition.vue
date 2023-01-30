<template>
    <div class="score-query-filtr-condition action-icon-trigger" :class="{error: !valid && isSave}">
        <!-- 四级联动之一：类型选择 -->
        <selector class="max-length-8 lg" search type="groupSelect"
                  :options="groups[0]" :value="conditionMirror.conditionType" @select="changeType"
                  v-title:top.line.warn="errorMessage[0]" :class="{error: errorMessage[0]}"/>
        <span style="line-height: 35px"> {{'metaData.of' | t}} &nbsp;&nbsp;</span>
        <!-- 四级联动之二：属性选择 -->
        <selector class="max-length-8 lg" search type="select" key="attSelect"
                  :options="attributeOptions" :value="conditionMirror.field.attrId" @select="changeAttr"
                  v-title:top.line.warn="errorMessage[1]" :class="{error: errorMessage[1]}"/>
        <!-- 四级联动之三：属性相关function选择 -->
        <selector class="max-length-8" type="select" key="attrFunctionSelect"
                  :options="functionOptions" :value="functionValue" @input="changeFunction"
                  v-title:top.line.warn="errorMessage[2]" :class="{error: errorMessage[2]}"/>
        <!-- 四级联动之四：value设定 -->
        <!-- 等于和不等于 存在于文本型 -->
        <query-filter-condition-value
                v-if="conditionMirror.attrGenre === 0 && (functionValue === 'equal' || functionValue === 'notEqual')"
                valueType="text" inputType="many" :options="valueList" v-model="conditionMirror.params"
                @search="refreshValueList" @change="notify" v-title:top.line.warn="errorParams"
                :class="{error: errorParams}"/>

        <!-- 等于和不等于 存在于整数型 -->
        <query-filter-condition-value
                v-if="conditionMirror.attrGenre === 1 && (functionValue === 'equal' || functionValue === 'notEqual')"
                valueType="integer" inputType="many" :options="valueList" v-model="conditionMirror.params"
                @search="refreshValueList" @change="notify" v-title:top.line.warn="errorParams||errorInt"
                :class="{error: errorParams||errorInt}"/>

        <!-- 等于和不等于 存在于数值型 -->
        <query-filter-condition-value
                v-if="conditionMirror.attrGenre === 3 && (functionValue === 'equal' || functionValue === 'notEqual')"
                :precision="conditionMirror.numberPrecision"
                valueType="number" inputType="many" :options="valueList" v-model="conditionMirror.params"
                @search="refreshValueList" @change="notify" v-title:top.line.warn="errorParams"
                :class="{error: errorParams}"/>

        <!-- 包含、不包含、正则匹配、正则不匹配  只存在文本型 -->
        <!-- 包含、不包含，只存在文本型 -->
        <query-filter-condition-value
                v-if="(conditionMirror.attrGenre === 0) && (functionValue === 'contain' || functionValue === 'notContain')"
                :key="functionValue"
                valueType="text" inputType="single" :options="valueList" v-model="conditionMirror.params"
                @search="refreshValueList" @change="notify" v-title:top.line.warn="errorParams"
                :class="{error: errorParams}"/>

        <!-- 正则匹配、正则不匹配，只存在文本型 -->
        <query-filter-condition-value
                v-if="(conditionMirror.attrGenre === 0) && (functionValue === 'rlike' || functionValue === 'notRlike')"
                :key="functionValue" :trim="false"
                valueType="text" inputType="single" :options="valueList" v-model="conditionMirror.params"
                @change="notify" v-title:top.line.warn="errorParams"
                :class="{error: errorParams}"/>

        <!-- 整数类型 大于、小于、大于等于、小于等于 -->
        <number-input
                v-if="conditionMirror.attrGenre === 1 && (functionValue === 'greater' || functionValue === 'less' || functionValue === 'greaterEqual' ||functionValue === 'lessEqual')"
                type="int" class="query-field" :value="conditionMirror.params[0]" @sync="updateParams(0, $event)"
                v-title:top.line.warn="errorParams" :class="{error: errorParams}"/>

        <!-- 浮点数类型 大于、小于、大于等于、小于等于 -->
        <number-input
                v-if="conditionMirror.attrGenre === 3 && (functionValue === 'greater' || functionValue === 'less' || functionValue === 'greaterEqual' ||functionValue === 'lessEqual')"
                :precision="conditionMirror.numberPrecision"
                type="float" class="query-field" :value="conditionMirror.params[0]" @sync="updateParams(0, $event)"
                v-title:top.line.warn="errorParams" :class="{error: errorParams}"/>

        <!--整数类型 区间 -->
        <template
                v-if="(conditionMirror.attrGenre === 1) && functionValue === 'between'">
            <selector class="max-length-8 min-width" type="select" :options="notBetweenSelectList"
                      @select="changeParamsInterval(0,$event)"
                      :value="conditionMirror.paramsInterval[0]"></selector>
            <number-input
                    type="int" class="query-field" :value="conditionMirror.params[0]" @sync="updateParams(0, $event)"
                    v-title:top.line.warn="errorParams" :class="{error: errorParams}"/>
            &nbsp;{{'common.to' | t}}&nbsp;
            <number-input
                    type="int" class="query-field" :value="conditionMirror.params[1]" @sync="updateParams(1, $event)"
                    v-title:top.line.warn="errorParamsLast||errorLess" :class="{error: errorParamsLast||errorLess}"/>

            <selector class="max-length-8 min-width" :style="{marginLeft:'10px'}" type="select"
                      @select="changeParamsInterval(1,$event)"
                      :options="notBetweenSelectList1" :value="conditionMirror.paramsInterval[1]"></selector>
        </template>

        <!--浮点数类型 区间 -->
        <template
                v-if="(conditionMirror.attrGenre === 3) && functionValue === 'between'">
            <selector class="max-length-8 min-width" type="select" :options="notBetweenSelectList"
                      @select="changeParamsInterval(0,$event)"
                      :value="conditionMirror.paramsInterval[0]"></selector>
            <number-input :precision="conditionMirror.numberPrecision"
                          type="float" class="query-field" :value="conditionMirror.params[0]"
                          @sync="updateParams(0, $event)" v-title:top.line.warn="errorParams"
                          :class="{error: errorParams}"/>
            &nbsp;{{'common.to' | t}}&nbsp;
            <number-input :precision="conditionMirror.numberPrecision"
                          type="float" class="query-field" :value="conditionMirror.params[1]"
                          @sync="updateParams(1, $event)" v-title:top.line.warn="errorParamsLast||errorLess"
                          :class="{error: errorParamsLast||errorLess}"/>

            <selector class="max-length-8 min-width" :style="{marginLeft:'10px'}" type="select"
                      @select="changeParamsInterval(1,$event)"
                      :options="notBetweenSelectList1" :value="conditionMirror.paramsInterval[1]"></selector>
        </template>

        <!--整数类型 区间 -->
        <template
                v-if="(conditionMirror.attrGenre === 1) && functionValue === 'notBetween'">
            <selector class="max-length-8 min-width" type="select" :options="notBetweenSelectList"
                      @select="changeParamsInterval(0,$event)"
                      :value="conditionMirror.paramsInterval[0]"></selector>
            <number-input
                    type="int" class="query-field" :value="conditionMirror.params[0]" @sync="updateParams(0, $event)"
                    v-title:top.line.warn="errorParams" :class="{error: errorParams}"/>
            &nbsp;{{'common.to' | t}}&nbsp;
            <number-input
                    type="int" class="query-field" :value="conditionMirror.params[1]" @sync="updateParams(1, $event)"
                    v-title:top.line.warn="errorParamsLast||errorLess" :class="{error: errorParamsLast||errorLess}"/>

            <selector class="max-length-8 min-width" :style="{marginLeft:'10px'}" type="select"
                      @select="changeParamsInterval(1,$event)"
                      :options="notBetweenSelectList1" :value="conditionMirror.paramsInterval[1]"></selector>
        </template>

        <!--浮点数类型 区间 -->
        <template
                v-if="(conditionMirror.attrGenre === 3) && functionValue === 'notBetween'">
            <selector class="max-length-8 min-width" type="select" :options="notBetweenSelectList"
                      @select="changeParamsInterval(0,$event)"
                      :value="conditionMirror.paramsInterval[0]"></selector>
            <number-input :precision="conditionMirror.numberPrecision"
                          type="float" class="query-field" :value="conditionMirror.params[0]"
                          @sync="updateParams(0, $event)" v-title:top.line.warn="errorParams"
                          :class="{error: errorParams}"/>
            &nbsp;{{'common.to' | t}}&nbsp;
            <number-input :precision="conditionMirror.numberPrecision"
                          type="float" class="query-field" :value="conditionMirror.params[1]"
                          @sync="updateParams(1, $event)" v-title:top.line.warn="errorParamsLast||errorLess"
                          :class="{error: errorParamsLast||errorLess}"/>

            <selector class="max-length-8 min-width" :style="{marginLeft:'10px'}" type="select"
                      @select="changeParamsInterval(1,$event)"
                      :options="notBetweenSelectList1" :value="conditionMirror.paramsInterval[1]"></selector>
        </template>

        <!-- 时间类型 汇总 -->
        <template v-if="conditionMirror.attrGenre === 2 && functionValue === 'collect'">
            <selector class="max-length-8" type="select"
                      :options="collectSelectList" @select="changeValueList" :value="conditionMirror.format"/>
            <selector class="max-length-8" type="select" @select="changeCollectFunction"
                      :options="collectList" :value="conditionMirror.function"
                      v-title:top.line.warn="errorParamsTime" :class="{error: errorParamsTime}"/>
            <query-filter-condition-value valueType="text" inputType="many" :options="valueList"
                                          :prohibitedInput="true"
                                          :isLocalValue="true"
                                          v-model="conditionMirror.params" @search="refreshValueList" @change="notify"
                                          v-title:top.line.warn="errorParams" :class="{error: errorParams}"/>
        </template>

        <!-- 时间类型 区间 -->
        <template v-if="conditionMirror.attrGenre === 2 && functionValue === 'between'">
            <calendar class="filter-calendar" format="yyyy-mm-dd hh:ii:ss"
                      :value="conditionMirror.params[0]"
                      @input="updateParams(0, $event)" v-title:top.line.warn="errorParams"
                      :class="{error: errorParams}"/>
            <span style="line-height: 35px">{{'common.to' | t}}</span>
            <calendar class="filter-calendar" format="yyyy-mm-dd hh:ii:ss" :start="conditionMirror.params[0]"
                      :value="conditionMirror.params[1]"
                      @input="updateParams(1, $event)" v-title:top.line.warn="errorParamsLast"
                      :class="{error: errorParamsLast}"/>
        </template>

        <!-- 时间类型 相对当前时间区间 -->
        <template v-if="conditionMirror.attrGenre === 2 && functionValue === 'relativeBetween'">
            {{'metaData.during' | t}}
            <time-anchor v-title:top="relativeBetweenStartTip" :value="relativeBetweenStart"
                         @change="relativeBetweenStart = $event"
                         @input="changRelativeTime($event,'relativeBetweenStartTip')"></time-anchor>
            &nbsp;<span v-title:top.line.warn="errorParams"
                        :class="{error: errorParams}">&nbsp;{{'common.to' | t}}</span>
            <time-anchor v-title:top="relativeBetweenEndTip" :value="relativeBetweenEnd"
                         @change="relativeBetweenEnd = $event"
                         @input="changRelativeTime($event,'relativeBetweenEndTip')"/>
        </template>

        <!--相对当前时间点-->
        <template v-if="conditionMirror.attrGenre === 2 && functionValue ==='relative'">
            <span>{{'metaData.during' | t}}</span>
            <label v-title:top="relativeTimeTip">
                <number-input class="query-field tiny"
                              :value="relativeTime" @sync="relativeTime = $event"
                              @edit="changRelativeTime($event, 'relativeTimeTip')"
                              v-title:bottom.line.warn="errorParams" :class="{error: errorParams}"/>
            </label>
            <span>{{'time.day' | t}}</span>
            <selector :options="relativeTimeOptions" type="select"
                      :value="conditionMirror.params[2]"
                      @input="updateParams(2, $event)"/>
        </template>
        <!-- 相对事件发生时间 -->
        <template v-if="conditionMirror.attrGenre === 2 && functionValue ==='relativeEventTime'">
            {{'metaData.during' | t}}
            <selector :options="relativeEventTimeOptions" :value="conditionMirror.params[0]"
                      @input="changeRelativeEventTimeOption"/>
            <template
                    v-if="conditionMirror.params.length && (conditionMirror.params[0] === '1' || conditionMirror.params[0] === '-1')">
                <number-input class="query-field tiny"
                              :value="relativeEventTime" @sync="relativeEventTime = $event"
                              v-title:top.line.warn="errorParams" :class="{error: errorParams}"/>
                <selector :options="relativeEventTimeUnits" :value="conditionMirror.params[2]"
                          @input="updateParams(2, $event)"/>
                {{'metaData.within' | t}}
            </template>
        </template>
        <!--编辑删除-->
        <button class="action-icon icon icon-pencil"
                v-if="(conditionMirror.function === 'equal' && functionValue !== 'collect' ) || functionValue === 'notEqual'"
                @click="editByRawValue"></button>
        <span class="action-icon icon icon-help" v-if="tip" v-title:top="tip"></span>
        <slot></slot>
        <div class="calendar-shortcuts"
             v-if="conditionMirror.attrGenre === 2 && functionValue === 'between'">
            <button v-for="shortcut in SHORTCUT_DATES" class="calendar-shortcut"
                    :class="{active: matchedRangeKey === shortcut.id}"
                    @click="setShortcut(shortcut.id)" :key="shortcut.id">{{shortcut.name}}
            </button>
        </div>
        <confirm size="md" v-if="editRawValues" :title="this.$t('metaData.batchInput')" :autoConfirm="false"
                 @cancel="editRawValues = false"
                 @confirm="digestRawValues">
            <textarea class="raw-value-textarea" v-model="rawValues"></textarea>
            <p class="disabled-text">{{'metaData.note' | t}}</p>
        </confirm>

    </div>
</template>
<script>
    import { WebServAttrApiV1 } from '@/api';
    import {COLLECT_MAP, FUNCTION_MAP} from '../../../../analysis/components/ANALYSIS_QUERY_RULES';
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
    } from '../../../../common/components/date-range/RANGES';
    import format from 'date-fns/format';
    import cloneDeep from 'lodash/cloneDeep';
    import debounce from 'lodash/debounce';
    import subDays from 'date-fns/sub_days';
    import addDays from 'date-fns/add_days';
    import TimeAnchor from '../../../../analysis/components/time-anchor.vue';
    import QueryFilterConditionValue from '../../../../analysis/components/query-filter-condition-value.vue';

    // 创建一个新的 condition
    export function filterConditionFactory() {
        return {
            id: (new Date).getTime(),   // 前端虚构的唯一字段，表征condition的身份
            key: '',            // 前端虚构的唯一字段
            valid: true,
            type: '',
            field: {
                attrId: '',
            },
            conditionType: 'user',
            attrGenre: 0,
            numberPrecision: '',// double类型保留的小数位数
            function: '',
            params: [],
            format: 'day',
            paramsInterval: ['include', 'include'],
            //用户分群添加userGroupInfo
            userGroupInfo: {
                id: '',
            },
            userGroupRelation: '',  // isTrue:真，isFalse:假
            //后台需要字段itemKey 例如：event_123 user_123 group_123
            itemKey: '',

        };
    }

    export function isCompleteCondition(condition) {
        return condition.field.attrId
            && condition.function !== ''
            && (
                (condition.params.length !== 0 && condition.params.join('') !== '')
                || condition.function === 'isSet'    // 有值
                || condition.function === 'notSet'   // 没值
                || condition.function === 'isTrue'   // 没值
                || condition.function === 'isFalse'   // 没值
            );
    }

    // filters editor
    export default {
        name: 'score-query-filter-condition',
        components: {
            TimeAnchor,
            QueryFilterConditionValue
        },
        props: {
            eventIdList: {
                type: Array,
                default: []
            },
            condition: Object,
            groups: Array,     // 三级联动之一的选项
            isSave: Boolean
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
                    {name: this.$t('time.last30Days'), id: LAST_30_DAYS},
                    {name: this.$t('metaData.toDate'), id: LIFETIME},
                ],
                collectSelectList: [
                    {id: 'minute', name: this.$t('time.minute')},
                    {id: 'hour', name: this.$t('time.hour')},
                    {id: 'day', name: this.$t('common.day')},
                    {id: 'week', name: this.$t('common.week')},
                    {id: 'month', name: this.$t('common.month')},
                    {id: 'quarter', name: this.$t('metaData.quarter')}
                ],
                collectList: [
                    {id: 'equal', name: this.$t('metaData.equal')},
                    {id: 'notEqual', name: this.$t('metaData.unequal')},
                ],
                notBetweenSelectList: [
                    {id: 'include', name: '['},
                    {id: 'exclude', name: '('}
                ],
                notBetweenSelectList1: [
                    {id: 'include', name: ']'},
                    {id: 'exclude', name: ')'}
                ],
                conditionType: '',
                conditionMirror: {
                    key: '',            // 前端虚构的唯一字段
                    conditionType: '',
                    type: '',           // 三级联动之一：所选属性的类型: fans:用户属性，group:用户分群 event 元事件
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
                    //后台需要字段itemKey 例如：event_123 user_123 group_123
                    itemKey: '',
                },
                // 三级联动之三的推荐选项
                valueKeyword: '',
                valueList: [],
                relativeTimeOptions: [ // 相对时间方向
                    {id: 'within', name: this.$t('metaData.within')},
                    {id: 'before', name: this.$t('metaData.before')}
                ],
                relativeEventTimeOptions: [
                    {id: '1', name: this.$t('metaData.after')},
                    {id: '-1', name: this.$t('metaData.before')},
                    {id: 'day', name: this.$t('metaData.thisDay')},
                    {id: 'week', name: this.$t('metaData.thisWeek')},
                    {id: 'month', name: this.$t('metaData.thisMonth')},
                ],
                relativeEventTimeUnits: [
                    {id: 'second', name: this.$t('time.second')},
                    {id: 'minute', name: this.$t('time.minute')},
                    {id: 'hour', name: this.$t('time.hour')},
                    {id: 'day', name: this.$t('time.day')},
                ],
                editRawValues: false,   // 批量输入输入框
                rawValues: '',          // 批量输入字符串
                relativeBetweenStartTip: '',
                relativeBetweenEndTip: '',
                relativeTimeTip: '',
                errorMessage: ['', '', ''],
                errorParams: '',
                errorParamsTime: '',
                errorInt: '',
                errorLess: '',
                errorParamsLast: ''
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
                //this.conditionMirror.attrGenre不存在时默认传0
                if (this.conditionMirror.attrGenre) {
                    return FUNCTION_MAP[this.conditionMirror.attrGenre];
                }
                return FUNCTION_MAP[0];
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
                                return this.$t('metaData.tipOne');
                            default:
                                return '';
                        }
                    // 整数类型
                    case 1:
                        switch (this.conditionMirror.function) {
                            case 'equal':
                            case 'notEqual':
                                return this.$t('metaData.tipTwo');
                            case 'between':
                                return this.$t('metaData.tipValue');
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
                                return this.conditionMirror.params[2] === 'before' ? tip + this.$t('metaData.notContained') : tip + this.$t('metaData.contained');
                            }
                            case 'between':
                                return this.$t('metaData.tipTime');
                            case 'relativeBetween': {
                                let startOffset = parseInt(this.relativeBetweenStart);
                                let endOffset = parseInt(this.relativeBetweenEnd);
                                let startTip = isNaN(startOffset)
                                    ? this.$t('metaData.notControl')
                                    : format(addDays(new Date(), startOffset), 'YYYY-MM-DD');
                                let endTip = isNaN(endOffset)
                                    ? this.$t('metaData.notControl')
                                    : format(addDays(new Date(), endOffset), 'YYYY-MM-DD');
                                return this.$t('metaData.valueOne') + startTip + ',' + this.$t('metaData.valueTwo') + endTip + this.$t('metaData.borderValue');
                            }
                            default:
                                return '';
                        }
                    // 小数类型
                    case 3:
                        switch (this.conditionMirror.function) {
                            case 'equal':
                            case 'notEqual':
                                return this.$t('metaData.tipNumber');
                            case 'between':
                                return this.$t('metaData.tipNumberTwo');
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
                const message = this.$t('metaData.showDefErrorText');
                this.errorMessage = ['', '', ''];
                this.errorParams = '';
                this.errorInt = '';
                this.errorLess = '';
                this.errorParamsLast = '';
                this.errorParamsTime = '';
                if (!this.isSave) return false;
                //第一项conditionType不能为空
                if (conditionMirror.conditionType === '') {
                    this.errorMessage[0] = message;
                    return false;
                }
                //第二项conditionMirror.field.attrId
                if (conditionMirror.field.attrId === '') {
                    this.errorMessage[1] = message;
                    return false;
                }
                //第三项functionValue不能为空
                if (this.functionValue === '') {
                    this.errorMessage[2] = message;
                    return false;
                }
                //第三项conditionMirror.function  汇总：collect
                if (conditionMirror.function === 'collect') {
                    this.errorParamsTime = message;
                    return false;
                }
                //第三项为有值、没值,直接return true，不用再往下走了
                if (
                    conditionMirror.function === 'isSet'
                    || conditionMirror.function === 'notSet'
                    || conditionMirror.function === 'isTrue'
                    || conditionMirror.function === 'isFalse'
                ) {
                    return true;
                }
                if (conditionMirror.params.length === 0) {
                    this.errorParams = message;
                    return false;
                }
                // if (!this.complete) {
                // return true;
                // }
                //第四项 conditionMirror.params
                if (conditionMirror.function === 'between' || conditionMirror.function === 'relative') {
                    //相对当前时间区间用到conditionMirror.params[0]，此处判断是否是相对当前时间区间
                    if (conditionMirror.attrGenre !== 2) {
                        //区间第一项是否为空校验
                        if (conditionMirror.params[0] === '') {
                            this.errorParams = message;
                            return false;
                        }
                        //区间第二项是否为空校验
                        if (conditionMirror.params[1] === '') {
                            this.errorParamsLast = message;
                            return false;
                        }
                    }

                } else if (
                    conditionMirror.function !== 'isSet'
                    && conditionMirror.function !== 'notSet'
                    && conditionMirror.function !== 'isTrue'
                    && conditionMirror.function !== 'isFalse'
                ) {
                    if (conditionMirror.attrGenre !== 2) {
                        //区间第一项是否为空校验
                        if (conditionMirror.params[0] === '') {
                            this.errorParams = message;
                            return false;
                        }
                        //区间第二项是否为空校验
                        if (conditionMirror.params[1] === '') {
                            this.errorParamsLast = message;
                            return false;
                        }
                    }
                }

                // 整数类型校验
                if (
                    conditionMirror.attrGenre === 1
                    && conditionMirror.function !== 'isSet'
                    && conditionMirror.function !== 'notSet'
                ) {
                    if (conditionMirror.function === 'between' || conditionMirror.function === 'notBetween') {
                        if (isNaN(conditionMirror.params[0]) || Number.parseFloat(conditionMirror.params[0]) % 1 !== 0) {
                            this.errorParams = message;
                            return false;
                        }

                        if (isNaN(conditionMirror.params[1]) || Number.parseFloat(conditionMirror.params[1]) % 1 !== 0) {
                            this.errorParamsLast = message;
                            return false;
                        }

                        if (Number.parseFloat(conditionMirror.params[0]) >= Number.parseFloat(conditionMirror.params[1])) {
                            this.errorLess = this.$t('metaData.valueTip');
                            return false;
                        }
                        return true;
                    }
                    if (isNaN(conditionMirror.params[0]) || Number.parseFloat(conditionMirror.params[0]) % 1 !== 0) {
                        this.errorParams = message;
                        return false;
                    }
                    return true;
                }

                // 时间类型校验
                if (conditionMirror.attrGenre === 2) {
                    switch (conditionMirror.function) {
                        // 相对当前时间点
                        case 'relative':
                            if (
                                isNaN(conditionMirror.params[0])
                                || Number.parseFloat(conditionMirror.params[0]) % 1 !== 0
                            ) {
                                this.errorParams = message;
                                return false;
                            }
                            return true;
                        // 相对当前时间区间
                        case 'relativeBetween': {
                            let start = parseInt(conditionMirror.params[0]),
                                end = parseInt(conditionMirror.params[1]);
                            if (isNaN(start) && isNaN(end)) {
                                this.errorParams = this.$t('metaData.TimeRangeTip');
                                return false;
                            } else if (!isNaN(start) && !isNaN(end) && end < start) {
                                this.errorParams = this.$t('metaData.valueTipTwo');
                                return false;
                            }
                            return true;
                        }
                        //相对事件发生时间
                        case 'relativeEventTime':
                            if (
                                isNaN(conditionMirror.params[1])
                                || Number.parseFloat(conditionMirror.params[1]) % 1 !== 0
                            ) {
                                this.errorParams = message;
                                return false;
                            }
                            return true;
                        // 绝对时间
                        case 'between':
                            if (conditionMirror.params[0] === '') {
                                this.errorParams = message;
                                return false;
                            }
                            if (conditionMirror.params[1] === '') {
                                this.errorParamsLast = message;
                                return false;
                            }
                            break;
                    }
                }

                // 小数类型校验
                if (
                    conditionMirror.attrGenre === 3
                    && conditionMirror.function !== 'isSet'
                    && conditionMirror.function !== 'notSet'
                ) {
                    if (conditionMirror.function === 'between' || conditionMirror.function === 'notBetween') {
                        if (isNaN(conditionMirror.params[0])) {
                            this.errorParams = message;
                            return false;
                        }

                        if (isNaN(conditionMirror.params[1])) {
                            this.errorParamsLast = message;
                            return false;
                        } else if (
                            Number.parseFloat(conditionMirror.params[0]) >= Number.parseFloat(conditionMirror.params[1])
                        ) {
                            this.errorLess = this.$t('metaData.valueTip');
                            return false;
                        }
                        return true;
                    }
                    if (isNaN(conditionMirror.params[0])) {
                        this.errorInt = this.$t('metaData.typeTip');
                        return false;
                    }
                    return true;
                }

                // all pass, then then valid.
                return true;
            },
            attributeOptions() {
                let selectObj = this.groups[1][0];
                let key = this.conditionMirror.conditionType;
                let options = [];
                if (key > -1) {
                    this.groups[0].forEach(item => {
                        item.options.forEach(dom => {
                            options.push(dom);
                        });
                    });
                    let type = options.find(type => type.id === key);
                    if (type) {
                        type.attributes.forEach(item => {
                            item.name = item.meaning;
                        });
                    }
                    return type ? type.attributes : [];
                }
                if (key === 'user' || key === 'group') {
                    return selectObj[key];
                }
            }
        },
        mounted() {
            this.conditionMirror = cloneDeep(this.condition);
            // switch (this.conditionMirror.type) { // 0:用户, 1:商品，2:行为，undefined 用户分群
            // case 'fans': // 用户属性
            // this.conditionMirror.type = 0;
            // break;
            // case 1: // 商品属性 暂无
            // break;
            // case 'event': // 行为 AKA 事件属性
            // this.conditionMirror.type = 2;
            // break;
            // case 'group': // fixme 用户分群
            // this.conditionMirror.type = undefined;
            // break;
            // default:
            // break;
            // }
        },
        methods: {
            changRelativeTime(value, target) {
                let offset = parseInt(value);
                switch (target) {
                    case 'relativeBetweenStartTip':
                    case 'relativeBetweenEndTip':
                        this[target] = isNaN(offset)
                            ? this.$t('metaData.notControl')
                            : format(addDays(new Date(), offset), 'YYYY-MM-DD') + this.$t('metaData.contain');
                        break;
                    case 'relativeTimeTip':
                        offset = parseInt(value) || 0;
                        this[target] = format(subDays(new Date(), offset), 'YYYY-MM-DD');
                        break;
                }
            },
            notify: debounce(function () {
                let newCondition = cloneDeep(this.conditionMirror);
                newCondition.valid = this.valid;
                this.$emit('change', newCondition);
            }, 300),

            // 四级联动之一
            changeType(type) {
                if (type.id !== 'user' && type.id !== 'group') {
                    //元事件id event
                    this.conditionMirror.conditionType = type.id;
                    this.conditionMirror.eventId = type.id;
                } else {
                    //用户属性user或者用户分群group
                    this.conditionMirror.conditionType = type.id;
                    this.conditionMirror.eventId = '';
                }
                this.conditionMirror.userGroupInfo.id = '';
                this.conditionMirror.field.attrId = '';
                this.conditionMirror.function = '';
                this.conditionMirror.params = [];
                this.notify();
            },

            changeAttr(newAttr) {
                if (newAttr.id !== this.conditionMirror.field.attrId || !this.conditionMirror.field.attrId) {
                    //newAttr.type==='group'是用户分群
                    if (newAttr.type && newAttr.type === 'group') {
                        //用户分群
                        this.conditionMirror.userGroupInfo.id = newAttr.id;
                        //后台需要字段itemKey 例如：event_123 user_123 group_123
                        this.conditionMirror.itemKey = 'group_' + newAttr.id;
                        this.conditionMirror.type = 'group';
                    } else {
                        //用户属性或者元事件
                        this.conditionMirror.userGroupInfo.id = '';
                        //后台需要字段itemKey 例如：event_123 user_123 group_123
                        if (newAttr.type && newAttr.type === 'user') {
                            this.conditionMirror.itemKey = 'user_' + newAttr.id;
                            this.conditionMirror.type = 'user';
                        } else {
                            this.conditionMirror.itemKey = 'event_' + newAttr.id;
                            this.conditionMirror.type = 'event';
                        }
                    }
                    // 更新联动第一级相关字段 1/3
                    //this.conditionMirror.type = newAttr.attrType;

                    this.conditionMirror.attrLength = newAttr.attrLength;
                    // 更新联动第一级相关字段 2/3
                    this.conditionMirror.attrGenre = 'attrGenre' in newAttr ? newAttr.attrGenre : 4; // 4 布尔值，选择用户分群时
                    this.conditionMirror.numberPrecision = newAttr.attrGenre === 3 ? newAttr.attrLength : '';
                    // 更新联动第一级相关字段 3/3 this.conditionMirror.field.attrId
                    this.conditionMirror.field.attrId = newAttr.id;
                    this.conditionMirror.key = newAttr.key;
                    // 清除联动第二、第三级所选
                    this.conditionMirror.function = '';
                    this.conditionMirror.params = [];
                    if (this.conditionMirror.attrGenre === 100) {
                        this.conditionMirror.attrGenre = 4;
                    }
                    this.notify();
                }
            },
            changeFunction(newFunction) {
                if (newFunction !== this.conditionMirror.function) {
                    this.conditionMirror.function = newFunction;
                    //format只在汇总collect时候传递值，如：minute，其他情况传递空
                    this.conditionMirror.format = '';
                    if (this.conditionMirror.function === 'collect') {
                        this.conditionMirror.params = [];
                        this.conditionMirror.format = 'minute';
                    } else if (this.conditionMirror.function === 'relativeBetween') {
                        this.conditionMirror.params = ['', '', 'day'];

                    } else if (this.conditionMirror.function === 'relative') {
                        this.conditionMirror.params = ['', 'day', 'within'];

                    } else if (this.conditionMirror.function === 'between') {
                        if (this.conditionMirror.attrGenre === 1 || this.conditionMirror.attrGenre === 3) {
                            this.conditionMirror.params = ['', ''];
                        } else {
                            this.conditionMirror.params = ['', ''];
                        }

                    } else if (this.conditionMirror.function === 'relativeEventTime') {
                        this.conditionMirror.params = ['-1', '', this.relativeEventTimeUnits[3].id];
                    } else {
                        this.conditionMirror.params = [];
                        //this.conditionMirror.format = 'minute';
                        // 有值 没值
                        if (this.conditionMirror.function === 'isSet' || this.conditionMirror.function === 'notSet') {
                            this.notify();
                        }
                        //为真为假
                        if (this.conditionMirror.function === 'isFalse' || this.conditionMirror.function === 'isTrue') {
                            this.notify();
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
            changeCollectFunction(e) {
                this.conditionMirror.function = e.id;
                this.conditionMirror.params = [];
            },

            // 获取10个推荐value，用户属性和事件分析
            refreshValueList(keyword = '') {
                this.valueList = [];
                let _eventList = [];
                if (this.conditionMirror.conditionType !== 'user' && this.conditionMirror.conditionType !== 'group') {
                    //事件
                    _eventList.push(this.conditionMirror.conditionType);
                } else {
                    //用户属性和分群
                    _eventList = [0];
                }
                // 如果选的是汇总，就从本地取提示列表
                if (this.functionValue === 'collect') {
                    this.valueList = COLLECT_MAP[this.conditionMirror.format];
                    return;
                }
                // 0:用户, 1:商品，2:事件
                let type = 0;
                switch (this.conditionMirror.type) {
                    case 'user': // 用户属性
                        type = 0;
                        break;
                    case 'event': // 事件属性
                        type = 2;
                        break;
                    default:
                        break;
                }
                let sendObj = {
                    attrId: this.conditionMirror.field.attrId,
                    attrType: type,
                    attrLength: this.conditionMirror.attrLength,
                    attrGenre: this.conditionMirror.attrGenre,
                    eventIds: _eventList,
                    keyword: keyword,
                    limit: 10 + this.conditionMirror.params.length
                };
                WebServAttrApiV1
                    .getValueList(sendObj)
                    .then(({body: {data: {values}}}) => {
                        this.valueList = values;
                    })
                    .catch(err => {
                        console.error(err);
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
                this.conditionMirror.params = this.rawValues.split('\n')
                    .map(line => String(line)
                        .trim())
                    .filter(line => line);
                this.rawValues = '';
                this.editRawValues = false;
                this.notify();
            },
            setShortcut(shortcut) {
                const range = RANGES[shortcut];
                this.conditionMirror.params = [
                    format(range.start, 'YYYY-MM-DD HH:mm:ss'),
                    format(range.end, 'YYYY-MM-DD HH:mm:ss')
                ];
                this.notify();
            },
        }
    };
</script>
<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    $padding-left: 45px * 2;
    .score-query-filtr-condition {
        position: relative;
        padding: 5px 0 5px $padding-left;

        &:hover {
            background-color: $select-bg;

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
                left: $padding-left - $input-field-height;
                top: -10px;
                bottom: 0;
                width: 0;
                border-left: 1px solid $border-color;
            }

            &:first-of-type:before {
                top: round($input-field-height/2);
                width: $input-field-height;
                border-top: 1px solid $border-color;
            }

            &:last-of-type:before {
                left: $padding-left - $input-field-height;
                bottom: round($input-field-height/2);
                width: $input-field-height;
                border-bottom: 1px solid $border-color;
            }
        }

        .selector {
            margin-right: 10px;
            margin-bottom: 5px;
            //1
            .select-text {
                margin-top: 2px;
                margin-bottom: 2px;
            }

            &.error {
                border-color: $red;
            }
        }

        .number-input {
            &.error {
                border-color: $red;
            }
        }

        .filter-calendar {
            vertical-align: top;
            //3
            margin-top: 2px;
            margin-bottom: 2px;
        }

        .min-width {
            width: 60px;
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

        .raw-value-textarea {
            @include box-sizing();
            resize: vertical;
            width: 100%;
            padding: .5em;
            line-height: 1.4em;
            min-height: 1.4em * 5 + 1em;
            max-height: 1.4em * 15 + 1em;
            border: 1px solid $border-color;

            &:focus {
                @include box-shadow(0 0 3px $disabled inset);
            }
        }
    }
</style>
