<template>
    <div class="query-filter-condition action-icon-trigger" :class="{error: !valid}"
         v-title:top.line.warn="errorParams">
        <!-- 三级联动之一：属性选择 -->
        <selector class="max-length-15 lg" search type="select" key="attSelect"
                  :disabled="groups.length === 0"
                  :options="groups" :value="conditionMirror.attrId" @select="changeAttr"/>
        <!-- 三级联动之二：属性相关function选择 -->
        <selector class="max-length-8" type="select" key="attrFunctionSelect"
                  :disabled="groups.length === 0 || functionOptions.length === 0 || conditionMirror.attrId === ''"
                  :options="functionOptions" :value="conditionMirror.function" @input="changeFunction"/>
        <!-- 三级联动之三：value设定 -->
        <!-- 多选框 -->
        <query-filter-condition-value
                :maxlength="300" :options="valueList" inputType="many"
                v-if="conditionMirror.function === 7 || conditionMirror.function === 8" valueType="text" :maxTag="99"
                @change="notify" v-model="conditionMirror.params"/>
        <!-- 等于和不等于 存在于文本型 -->
        <query-filter-condition-value
                v-if="conditionMirror.function === 1 || conditionMirror.function === 2"
                valueType="text" inputType="single" :options="[]" v-model="conditionMirror.params"
                @change="notify"/>
        <!-- 包含、不包含，只存在文本型 -->
        <query-filter-condition-value
                v-if="conditionMirror.function === 3 || conditionMirror.function === 4"
                :key="conditionMirror.function"
                valueType="text" inputType="single" :options="[]" v-model="conditionMirror.params"
                @change="notify"/>
        <!--绝对时间-->
        <div class="absolute-date" v-if="conditionMirror.function === 9">
            <span>{{'swarm.absoluteDateA' | t}}</span>
            <calendar :format="calenderFormat" v-model="conditionMirror.start" :end="conditionMirror.end" @input="notify"/>
            <span>{{'swarm.absoluteDateB' | t}}</span>
            <calendar :format="calenderFormat" v-model="conditionMirror.end" :start="conditionMirror.start" @input="notify"/>
            <span>{{'swarm.absoluteDateC' | t}}</span>
        </div>
        <!--相对时间-->
        <template v-if="conditionMirror.function === 10">
            <span>{{'swarm.relativeTime' | t}}</span>
            <number-input class="input tiny" v-model="conditionMirror.day" max="999" @sync="notify"/>
            <span>{{'time.day' | t}}</span>
            <selector :options="relative" v-model="conditionMirror.relative_type" @input="notify"/>
        </template>
        <!--相对时段区间-->
        <template v-if="conditionMirror.function === 13">
            <selector class="sm" :options="intervalRelative" v-model="conditionMirror.start.type" @input="changeRelativeType('start')"/>
            <div class="relative-range" v-if="conditionMirror.start.type === 0">
                <span>{{'controller.the' | t}}</span>
                <number-input class="input"
                            v-model="conditionMirror.start.days"
                            :min="1"
                            max="999"
                            @sync="notify"/>
                <span>{{'time.day' | t}}</span>
            </div>
            <div class="relative-range">
                <selector class="tiny" :options="intervalTimeList" v-model="relativeRangeTime.start.hh" @input="notify"/>
                <selector class="tiny" :options="intervalTimeListSixty" v-model="relativeRangeTime.start.mm" @input="notify"/>
                <selector class="tiny" :options="intervalTimeListSixty" v-model="relativeRangeTime.start.ss" @input="notify"/>
            </div>
            <span class="relative-range-to">{{'common.to' | t}}</span>
            <selector class="sm" :options="intervalRelative" v-model="conditionMirror.end.type" @input="changeRelativeType('end')"/>
            <div class="relative-range" v-if="conditionMirror.end.type === 0">
                <span>{{'controller.the' | t}}</span>
                <number-input class="input"
                            v-model="conditionMirror.end.days"
                            :min="1"
                            max="999"
                            @sync="notify"/>
                <span>{{'time.day' | t}}</span>
            </div>
            <div class="relative-range">
                <selector class="tiny" :options="intervalTimeList" v-model="relativeRangeTime.end.hh" @input="notify"/>
                <selector class="tiny" :options="intervalTimeListSixty" v-model="relativeRangeTime.end.mm" @input="notify"/>
                <selector class="tiny" :options="intervalTimeListSixty" v-model="relativeRangeTime.end.ss" @input="notify"/>
            </div>
        </template>
        <span v-if="conditionMirror.function === 7 || conditionMirror.function === 8"
            class="action-icon icon icon-pencil" @click="editByRawValue"></span>
        <!--编辑删除-->
        <button class="action-icon icon icon-close" @click="deleteCondition" v-if="deleteBtn" :title="$t('common.del')"></button>
        <confirm v-if="editRawValues" :title="$t('analysis.batchInput')"
                    :autoConfirm="false" @cancel="reset" @confirm="digestRawValues">
                    <textarea class="textarea full-width" autofocus="true" rows="20" v-model="rawData" @input="rebase"></textarea>
                    <span class="disabled-text">{{'analysis.note' | t}}</span>
                    <span class="pull-right" :class="{'red-text':this.batchCount === 99}">{{batchCount}}/99</span>
        </confirm>
    </div>
</template>

<script>
    import QueryFilterConditionValue from '../../../analysis/components/query-filter-condition-value.vue';

    import cloneDeep from 'lodash/cloneDeep';
    import uniq from 'lodash/uniq';
    import format from 'date-fns/format';

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
        if (condition.attrId) {
            if (condition.function !== '') {
                let paramsLen = condition.params.length,
                    firstParam = condition.params[0],
                    secondParam = condition.params[1];
                switch (condition.function) {
                    case 5:
                    case 6:
                    case 11:
                    case 12:
                        return true;
                    default:
                        return paramsLen !== 0 && (paramValid(firstParam) || paramValid(secondParam));
                }
            }
        }
        return false;
    }

    export default {
        name: 'form-query-filter-condition',
        props: {
            condition: Object,
            groups: Array,     // 三级联动之一的选项
            autoValidation: { // 自动校验
                type: Boolean,
                default: true
            },
            incompleteAsValid: { // 不完整的条件当做校验通过
                type: Boolean,
                default: true
            },
            deleteBtn: {
                type: Boolean,
                default: true,
            },
            // 判断是否支持belong关系符
            ifBelong: {
                type: Boolean,
                default: false
            },
            calenderFormat: {
                type: String,
                default: 'yyyy-mm-dd'
            },
            type: {
                type: String,
                default: ''
            }
        },
        components: {
            QueryFilterConditionValue,
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
            },
            condition(value) {
                this.conditionMirror = cloneDeep(value);
            },
            relativeRangeTime: {
                handler(value) {
                    let con = this.conditionMirror;
                    if (con.function === 13 && con.start.time && con.end.time) {
                        let sh = value.start.hh;
                        let sm = value.start.mm;
                        let ss = value.start.ss;
                        let eh = value.end.hh;
                        let em = value.end.mm;
                        let es = value.end.ss;
                        this.conditionMirror.start.time = sh + ':' + sm + ':' + ss;
                        this.conditionMirror.end.time = eh + ':' + em + ':' + es;
                        this.notify();
                    }
                },
                deep: true
            },
        },
        computed: {
            valid() {
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

                // all pass, then then valid.
                return true;
            },
            batchCount (){
                if (this.rawData) {
                    let verifyArray = this.rawData.split('\n')
                        .map(line => String(line)
                            .trim())
                        .filter(line => line);
                    return verifyArray.length;
                }
                return 0;
            },
            // 常规条件
            normalFunction() {
                return [
                    {id: 1, name: this.$t('analysis.equal')},
                    {id: 2, name: this.$t('analysis.unEqual')},
                    {id: 3, name: this.$t('analysis.contains')},
                    {id: 4, name: this.$t('analysis.notContain')},
                    {id: 5, name: this.$t('analysis.value')},
                    {id: 6, name: this.$t('analysis.none')}
                ];
            },
            // 包含属于、不属于条件
            belongFunction() {
                return this.normalFunction.concat(
                    {id: 7, name: this.$t('analysis.belong')},
                    {id: 8, name: this.$t('swarm.notBelong')}
                );
            },
            // 时间类型条件
            timeFunction() {
                let functionList = [
                    {id: 9, name: this.$t('analysis.absoluteTime')},
                    {id: 10, name: this.$t('analysis.relativeTime')},
                    {id: 11, name: this.$t('analysis.value')},
                    {id: 12, name: this.$t('analysis.none')}
                ];
                if (this.type === 'form') functionList.splice(2, 0, {id: 13, name: this.$t('analysis.relativeTimeInterval')});
                return functionList;
            },
            relative() {
                return [
                    { name: this.$t('swarm.within'), id: 0 },
                    { name: this.$t('swarm.beyond'), id: 1 }
                ];
            },
            intervalRelative() {
                return [
                    { name: this.$t('time.past'), id: 0 },
                    { name: this.$t('common.today'), id: 1 }
                ];
            },
            intervalTimeList() {
                let intervalTimeList = [];
                for (let i = 0; i < 24; i++) {
                    let name = i < 10 ? '0' + i : i.toString();
                    intervalTimeList.push({name: name, id: name});
                }
                return intervalTimeList;
            },
            intervalTimeListSixty() {
                let intervalTimeList = [];
                for (let i = 0; i < 60; i++) {
                    let name = i < 10 ? '0' + i : i.toString();
                    intervalTimeList.push({name: name, id: name});
                }
                return intervalTimeList;
            },
            functionOptions() {
                let opts = [];
                let groupsTarget = this.groups.filter(item => item.id === this.conditionMirror.attrId)[0];
                let groupsType = groupsTarget && groupsTarget.fieldType;
                let type = groupsTarget && groupsTarget.type;
                if (groupsType === 6 || type === 2) {
                    opts = this.timeFunction;
                    return opts;
                }
                opts = this.ifBelong ? this.belongFunction : this.normalFunction;
                return opts;
            },
        },
        mounted() {
            this.conditionMirror = cloneDeep(this.condition);
            this.conditionMirror.name = this.conditionMirror.attrId !== '' ? this.groups
                .filter(e => e.id === this.conditionMirror.attrId)[0].name : '';
            if (this.conditionMirror.function === 13) {
                let start = this.conditionMirror.start.time.split(':');
                let end = this.conditionMirror.end.time.split(':');
                this.relativeRangeTime = {
                    start: {
                        hh: start[0],
                        mm: start[1],
                        ss: start[2]
                    },
                    end: {
                        hh: end[0],
                        mm: end[1],
                        ss: end[2]
                    }
                };
            }
        },
        updated(){
            // 对应问题 4149 ，向上传导当前已删除值
            if ( this.groups.length > 0 && !this.groups.find(item => this.conditionMirror.attrId === item.id) ) {
                this.$emit('delEmpty', this.conditionMirror);
            }
        },
        data() {
            return {
                conditionMirror: {
                    attrId: '',     // 三级联动之一：所选属性的id
                    // 三级联动之二：操作，包括：
                    // 1 equal, 2 notEqual, 3 contain, 4 notContain, 5 isSet, 6 notSet, 7 belong
                    function: '',
                    params: [],   // 三级联动之三：最终选择的value
                    // 日期类型最终选择的value
                    end: '',
                    start: '',
                    day: '',
                    relative_type: ''
                },
                errorParams: '',
                errorLess: '',
                valueList: [],
                editRawValues: false,   // 批量输入输入框
                rawData: '',
                // 三级联动之二的选项
                // relation：0 并且；1 或者
                // relation：1 等于；2 不等于；3 包含；4 不包含；5 有值；6 没值
                relativeRangeTime: {
                    start: {
                        hh: '00',
                        mm: '00',
                        ss: '00'
                    },
                    end: {
                        hh: '00',
                        mm: '00',
                        ss: '00'
                    }
                }
            };
        },
        methods: {
            notify(){
                let newCondition;
                if (this.valid) {
                    newCondition = cloneDeep(this.conditionMirror);
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
            },
            // 第一级联动 属性
            changeAttr(newAttr) {
                // 更新联动第一级相关字段 1/3
                this.conditionMirror.id = newAttr.id;
                this.conditionMirror.name = newAttr.name;
                // 清除联动第二级所选
                this.conditionMirror.function = '';

                // 更新联动第二级相关字段 2/3

                // 更新联动第三级相关字段 3/3 this.conditionMirror.attrId
                this.conditionMirror.attrId = newAttr.id;
                if (newAttr.hasOwnProperty('type')) this.conditionMirror.type = newAttr.type;
                // 清除联动第三级所选
                this.conditionMirror.params = [];
                this.conditionMirror.start = '';
                this.conditionMirror.end = '';
                this.conditionMirror.day = '';
                this.conditionMirror.relative_type = '';

                this.notify();
            },
            // 第二级联动 function
            changeFunction(newFunction) {
                if (newFunction === 5 || newFunction === 6) {
                    this.conditionMirror.params = [];
                }
                if (newFunction !== this.conditionMirror.function) {
                    if (newFunction === 13) {
                        this.conditionMirror.start = {
                            type: 0,
                            days: '',
                            time: '00:00:00'
                        };
                        this.conditionMirror.end = {
                            type: 0,
                            days: '',
                            time: '00:00:00'
                        };
                    } else {
                        this.conditionMirror.start = '';
                        this.conditionMirror.end = '';
                    }
                    this.conditionMirror.function = newFunction;
                    this.conditionMirror.params = [];
                    this.conditionMirror.day = '';
                    this.conditionMirror.relative_type = '';
                    this.notify();
                }
            },
            // 更改相对时段区间“今天”或“过去”
            changeRelativeType(type) {
                type === 'start' ? this.conditionMirror.start.days = '' : this.conditionMirror.end.days = '';
                this.notify();
            },
            // 删除筛选条件
            deleteCondition() {
                this.$emit('change', false);
            },
            // 展示批量输入
            editByRawValue() {
                this.rawData = this.conditionMirror.params.join('\n');
                this.editRawValues = true;
            },
            digestRawValues() {
                let verifyArray = this.rawData.split('\n')
                    .map(line => String(line)
                        .trim())
                    .filter(line => line);
                // 文本
                if (verifyArray.length > 99) {
                    this.$toast(this.$t('swarm.max99items'), 'warn');
                } else if (!verifyArray.every(e => {
                    return e.length < 301;
                })) {
                    this.$toast(this.$t('swarm.singleFormart') + this.$t('swarm.maxChars'), 'warn');
                } else {
                    this.conditionMirror.params = uniq(verifyArray);
                    this.reset();
                    this.notify();
                }

            },
            // 重置批量输入弹窗内容
            reset() {
                this.editRawValues = false;
                this.rawData = '';
            },
            // 限定批量弹窗的数据总数
            rebase() {
                if (this.batchCount > 99) {
                    let verifyArray = this.rawData.split('\n')
                        .map(line => String(line)
                            .trim())
                        .filter(line => line)
                        .slice(0, 99);
                    this.$toast(this.$t('swarm.max99items'), 'warn');
                    this.rawData = verifyArray.join('\n');
                    this.rawData += '\n';
                }
            },
            //获取当前时间
            getNowTime() {
                return format(new Date(), 'HH:mm:ss');
            },
            //相对时段区间开始时间选择范围
            frontTimeRange() {
                if (this.isSameDay()) return this.conditionMirror.end.time;
                return '';
            },
            //相对时段区间结束时间选择范围
            BehindTimeRange() {
                if (this.isSameDay()) return this.conditionMirror.start.time;
                return '';
            },
            //相对时段区间选择的是否为同一天
            isSameDay() {
                let start = this.conditionMirror.start;
                let end = this.conditionMirror.end;
                if (start.type === end.type && start.days === end.days) return true;
                return false;
            }
        },
    };
</script>

<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    $padding-left: 40px;
    .query-filter-condition {
        position: relative;
        padding: 8px 0 8px $padding-left;

        &:hover {
            background-color: rgba($theme, .2);
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
            vertical-align: bottom;
            &.sm {
                width: 60px;
            }
        }
        .action-icon {
            vertical-align: bottom;
        }
        .absolute-date {
            display: inline-flex;
            align-items: center;
            .calendar {
                margin: 0 5px;
            }
        }
        .relative-range {
            display: inline-block;
            margin-top: 5px;
            vertical-align: bottom;
            .input {
                width: 26px;
            }
        }
        .relative-range-to {
            line-height: 32px;
            margin-right: 8px;
        }
    }
</style>