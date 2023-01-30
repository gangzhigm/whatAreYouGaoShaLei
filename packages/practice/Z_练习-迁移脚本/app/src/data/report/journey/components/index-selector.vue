<template>
    <div class="index-selector">
        <div class="index-content" v-for="(indicator, cur) in setIndexResult" :key="cur">
            <selector search :options="userAttributeList" v-model="indicator.userAttribute"
                      @select="selectUserAttribute(indicator)"></selector>
            <selector :options="relationList" v-model="indicator.relation"
                      @select="selectRelation(indicator)"></selector>
            <input class="input eq-input" type="text" v-if="indicator.relation === 1" v-model.trim="indicator.values"
                   @input="inputContent(indicator)" maxlength="30"/>

            <!--relation 2 属于 -->
            <!--值类型  1文本，限制 300 字符
                       2数字，限制 12 字符-->
            <query-filter-condition-value v-if="indicator.relation === 2" :precision="30"
                                          :valueType="indicator.field_type === 2 ? 'number' : 'text'"
                                          :maxlength="indicator.field_type === 2 ? 12 : 300"
                                          inputType="many" :options="valueList" v-model="indicator.values"
                                          :prohibitedInput="canEnteredCount === 0" :maxTag="30"
                                          @change="notify(indicator)"></query-filter-condition-value>
            <template v-if="indicator.relation === 2">
                <span class="icons icon icon-help" v-title:top="tip"></span>
                <span class="icons icon icon-pencil" @click="editByRawValue(indicator, cur)"></span>
            </template>
            <span class="of" v-if="returnResult(indicator) && selectType === 'index'">{{'metaData.of' | t}}</span>
            <multi-select v-if="returnResult(indicator) && selectType === 'index'"
                          :options="dataTypeList" v-model="indicator.dataType" :dropDirection="'bottom'"
                          shortcutAction :placeholder="$t('common.selectHolder')"
                          @change="selectDataType"></multi-select>
            <template v-if="cur === setIndexResult.length - 1 && !valueChosen">
                <i class="icons icon icon-tianjia" @click="addIndexRule"></i>
            </template>
            <template v-if="setIndexResult&&setIndexResult.length > 1">
                <i class="icons icon icon-delete" @click="deleteIndexRule(cur)"></i>
            </template>
        </div>
        <template v-if="!setIndexResult.length">
            <i class="icons icon icon-tianjia" @click="addIndexRule"></i>
            <!-- <i class="icons icon icon-delete" @click="deleteIndexRule"></i> -->
        </template>
        <!--属于弹窗-->
        <confirm v-if="editRawValues" :title="$t('analysis.batchInput')" :autoConfirm="false" @cancel="reset"
                 @confirm="digestRawValues">
            <textarea class="textarea full-width" rows="20" autofocus="true" v-model="rawData.values"
                      @input="rebase"></textarea>
            <span class="disabled-text">{{'analysis.note' | t}}</span>
            <span class="pull-right">{{batchCount}}/{{canEnteredCount}}({{'data.remainingInput' | t}})</span>
        </confirm>
    </div>
</template>

<script>
    import { ContactApiV1 } from '@/api';
    import queryFilterConditionValue from '../../../../analysis/components/query-filter-condition-value.vue';
    import {customIndicatorField} from '../customIndicatorField';
    import uniq from 'lodash/uniq';

    export default {
        name: 'index-selector',
        props: {
            // index: '用于导出的特殊指标'  userAttribute: '用户自定义图标'
            selectType: {
                type: String,
                default: 'index',
            },
            value: {
                type: Array
            }
        },
        components: {
            queryFilterConditionValue
        },
        data() {
            return {
                // 选择的规则
                setIndexResult: [
                    {
                        userAttribute: '',
                        relation: '',
                        values: '',
                        dataType: [],
                        field_name: '',
                        field_type: ''
                    }
                ],
                // 用户属性
                userAttributeList: [],
                // 全部数据类型
                dataTypeList: customIndicatorField,
                valueList: [],
                editRawValues: false, // 属于-批量输入弹窗
                rawData: {}, // 当前属于输入框展示内容
                count: 30, // 当前属于输入框余量
            };
        },
        watch: {
            value(data) {
                this.setIndexResult = data.length ? data : [{
                    userAttribute: '',
                    relation: '',
                    values: '',
                    dataType: [],
                    field_name: '',
                    field_type: ''
                }];
            }
        },
        computed: {
            // 当前属于输入框余量
            canEnteredCount() {
                let len = 30;
                if (this.setIndexResult.length > 0) {
                    let equalValuesArray = this.setIndexResult.filter(elm => elm.values && elm.relation === 1);
                    let belongValuesArray = this.setIndexResult.filter((elm, index) => elm.values.length > 0
                        && elm.relation === 2 && index !== this.rawData.index)
                        .map(value => value.values);
                    len = 30 - belongValuesArray.reduce((cur, value) => value.length + cur, 0)
                        - equalValuesArray.length - this.batchCount;
                }
                this.count = len + this.batchCount;
                return len > 0 ? len : 0;
            },
            // 属于-当前输入框已经输入的内容array
            batchArray() {
                let arr = [];
                if (this.rawData.values) {
                    arr = this.rawData.values.split('\n')
                        .map(line => String(line)
                            .trim())
                        .filter(line => line);
                }
                return arr;
            },
            // 属于-当前输入框已经输入的个数
            batchCount() {
                return this.batchArray.length > 0 ? this.batchArray.length : 0;
            },
            tip() {
                return this.$t('data.conditionTip');
            },
            // 条件簇内有选择了“有值”的项
            valueChosen() {
                if (this.setIndexResult[0] && this.setIndexResult[0].relation === 3) {
                    return true;
                }
                return false;
            },
            relationList() {
                if (this.setIndexResult.length > 1 || this.selectType === 'index') {
                    return [
                        {
                            name: this.$t('analysis.equal'),
                            id: 1
                        },
                        {
                            name: this.$t('data.appertaining'),
                            id: 2
                        },
                    ];
                }
                return [
                    {
                        name: this.$t('analysis.equal'),
                        id: 1
                    },
                    {
                        name: this.$t('data.appertaining'),
                        id: 2
                    },
                    {
                        name: this.$t('data.hasValue'),
                        id: 3
                    }
                ];
            }
        },
        mounted() {
            // 获取用户属性
            ContactApiV1
                .customWorld(0)
                .then(({body: {data}}) => {
                    let canIUserList = data.customerFieldList.filter(customer => customer.fieldType === 1 ||
                        customer.fieldType === 2 || customer.fieldType === 6);
                    this.userAttributeList = canIUserList.map(
                        ({fieldCn, id, fieldType, fieldName}) => {
                            return {name: fieldCn, id, fieldType, field_name: fieldName};
                        }
                    );
                });
        },
        methods: {
            addIndexRule() {
                if (this.canEnteredCount === 0) {
                    this.$toast(this.$t('data.most30Data'), 'warn');
                    return false;
                }
                this.$nextTick(() => {
                    if (this.setIndexResult.length && this.setIndexResult.filter(index => index.userAttribute === '' ||
                        index.relation === '' || index.values === '' || (!index.dataType.length && this.selectType === 'index')).length) {
                        return this.$toast(this.$t('data.lastLevelDateNone'), 'warn');
                    }
                    this.setIndexResult.push({
                        userAttribute: '',
                        relation: '',
                        values: '',
                        dataType: [],
                        field_name: '',
                        field_type: ''
                    });
                });
            },
            // 选择用户属性
            selectUserAttribute(items) {
                items.relation = '';
                items.values = '';
                items.dataType = [];
                items.field_name = this.userAttributeList.$getByKey(items.userAttribute).field_name;
                items.field_type = this.userAttributeList.$getByKey(items.userAttribute).fieldType;
                this.$emit('input', this.setIndexResult);
            },
            // 选择筛选关系
            selectRelation(items) {
                items.values = items.relation === 2 ? [] : '';
                items.dataType = [];
                this.$emit('input', this.setIndexResult);
            },
            // 条件内容
            inputContent(items) {
                if (this.selectType === 'userAttribute') {
                    return this.$emit('input', this.setIndexResult);
                }
                if (items.values) {
                    // 邮件比较数据 - 特殊指标默认全选
                    items.dataType = customIndicatorField.map(data => data.id);
                }
            },
            // 选择数据类型
            selectDataType() {
                this.$emit('input', this.setIndexResult);
            },
            // 删除当前rule
            deleteIndexRule(cur) {
                if (cur || cur === 0) {
                    this.setIndexResult.splice(cur, 1);
                } else {
                    this.setIndexResult.pop();
                }
            },
            notify(items) {
                if (this.selectType === 'userAttribute') {
                    return this.$emit('input', this.setIndexResult);
                }
                if (items.values.length) {
                    // 邮件比较数据 - 特殊指标默认全选
                    items.dataType = customIndicatorField.map(data => data.id);
                }
            },
            returnResult(items) {
                return (items.relation === 1 && items.values !== '') || (items.relation === 2 && items.values.length);
            },
            // 展示批量输入
            editByRawValue(index, cur) {
                this.rawData = Object.assign({}, index);
                this.rawData.values = this.rawData.values.join('\n');
                this.rawData.index = cur;
                this.editRawValues = true;
            },
            // 重置批量输入弹窗内容
            reset() {
                this.editRawValues = false;
                this.rawData = {};
            },
            // 确定批量输入弹窗内容
            digestRawValues() {
                let valueType = this.rawData.field_type;
                switch (valueType) {
                    // 文本
                    case 1:
                        if (this.validateStr(this.batchArray)) {
                            this.rawData.values = uniq(this.batchArray);
                            this.setIndexResult[this.rawData.index].values = this.rawData.values;
                            // 邮件比较数据 - 特殊指标默认全选
                            this.setIndexResult[this.rawData.index].dataType = customIndicatorField.map(data => data.id);
                            this.reset();
                        }
                        break;
                    // 小数
                    case 2:
                        if (this.validateNum(this.batchArray)) {
                            this.rawData.values = uniq(this.batchArray);
                            this.setIndexResult[this.rawData.index].values = this.rawData.values;
                            // 邮件比较数据 - 特殊指标默认全选
                            this.setIndexResult[this.rawData.index].dataType = customIndicatorField.map(data => data.id);
                            this.reset();
                        }
                        break;
                }
                this.$emit('input', this.setIndexResult);
            },
            // 限定批量弹窗的数据总数
            rebase() {
                if (this.batchCount > this.count) {
                    this.$toast(this.$t('data.most30Data'), 'warn');
                    let limitArr = this.batchArray.slice(0, this.count);
                    this.rawData.values = limitArr.join('\n');
                    this.rawData.values += '\n';
                }
            },
            /**
             * 校验数组多选框string类型
             * @param arr Array 被校验的数组
             * @returns {*}
             */
            validateStr(arr) {
                if (this.batchCount > this.count) {
                    this.$toast(this.$t('data.most30Data'), 'warn');
                    return false;
                } else if (!arr.every(e => {
                    return e.length < 301;
                })) {
                    this.$toast(this.$t('swarm.singleFormart') + this.$t('swarm.maxChars'), 'warn');
                    return false;
                }
                return true;
            },
            /**
             * 校验数组多选框number类型
             * @param arr Array 被校验的数组
             * @returns {*}
             */
            validateNum(arr) {
                let string = /^\d+(\.\d+)?$/; // 非负浮点数
                if (this.batchCount > this.count) {
                    this.$toast(this.$t('data.most30Data'), 'warn');
                    return false;
                } else if (!arr.every(e => {
                    return e.length < 13 && string.test(e);
                })) {
                    this.$toast(this.$t('swarm.singleFormart') + this.$t('swarm.numberFormatLimit') + '12', 'warn');
                    return false;
                }
                return true;
            },
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .index-selector {
        .index-content {
            margin-bottom: 8px;
            padding-left: 3px;

            .of {
                margin: 0 5px;
                font-size: 14px;
            }

            .multi-select {
                margin: -8px 0 8px 0;
            }

            .selector,
            input,
            .icons {
                vertical-align: top;
            }
        }

        .icons {
            font-size: 16px;
            cursor: pointer;
            margin-left: 5px;

            &.icon-tianjia {
                color: $green;
            }

            &.icon-pencil {
                color: $green;
                font-size: 14px;
            }

            &.icon-delete {
                color: $light-red;
            }
        }

        .eq-input {
            margin-bottom: 16px;
        }

        .query-filter-condition-value {
            max-width: 420px;
            min-height: 32px;
            box-sizing: border-box;

            .keyword-input {
                line-height: 22px;
            }

            .value-item {
                line-height: 18px;
            }

            &.many {
                margin-bottom: 16px;
            }
        }
    }
</style>
