<template>
    <div class="event-inputer">
        <!-- 普通input框 -->
        <template v-if="type!=='belong' && type!=='nbelong'">
            <number-input v-if="valueType === 'number'" v-model="eventValue" class="input" type="float" />
            <input v-else v-model.trim="eventValue" class="input full-width" :type="valueType">
        </template>
        <!-- belong类型数组选择框 -->
        <template v-else>
            <query-filter-condition-value :maxlength="300" :options="valueList" inputType="many" v-if="valueType==='text'" valueType="text"
                :maxTag="99" v-model="eventValue" @change="update" />
            <query-filter-condition-value :maxlength="12" :options="valueList" inputType="many" :ifRange="false" :ifReg="true"
                v-if="valueType === 'number'" valueType="number" :maxTag="99" v-model="eventValue" @change="update" />
            <div class="batch-icon">
                <span class="action-icon icon icon-pencil" @click="editByRawValue()"></span>
            </div>
        </template>
        <confirm v-if="editRawValues" :title="$t('analysis.batchInput')" :autoConfirm="false" @cancel="resetBelong" @confirm="digestRawValues">
            <textarea autofocus="true" class="textarea full-width" rows="20" v-model="rawValues" @input="rebase"></textarea>
            <span class="disabled-text">{{'analysis.note' | t}}</span>
            <span class="pull-right" :class="{'red-text':this.batchCount === 99}">{{batchCount}}/99</span>
        </confirm>
    </div>
</template>

<script type="text/ecmascript-6">
import QueryFilterConditionValue from '../../../../../../../../analysis/components/query-filter-condition-value.vue';
import uniq from 'lodash/uniq';
export default {
    props: {
        settings: Array,
        restoreValue: Object,
        type: String
    },
    components: { QueryFilterConditionValue },
    data() {
        return {
            eventValue: '',
            valueList: [],
            rawValues: [],
            editRawValues: false, //展示批量窗口
        };
    },
    computed: {
        valueType() {
            return this.settings[2].type === 2 ? 'number' : 'text';
        },
        batchCount() {
            if (this.rawValues) {
                let verifyArray = this.rawValues.split('\n')
                    .map(line => String(line)
                        .trim())
                    .filter(line => line);
                return verifyArray.length;
            }
            return 0;
        }
    },
    watch: {
        eventValue() {
            this.update();
        },
        type() {
            this.reset();
            this.update();
        }
    },
    created() {
        this.restore();
    },
    methods: {
        restore() {
            if (this.restoreValue.operator === 'value') {
                this.eventValue = this.restoreValue.value;
            } else {
                this.eventValue = (this.type === 'belong' || this.type === 'nbelong') ? [] : '';
            }
        },
        reset() {
            if (this.type === 'belong' || this.type === 'nbelong') {
                this.eventValue = [];
            } else {
                this.eventValue = '';
            }
        },
        update() {
            let errMsg = '';
            if (this.eventValue === '' ||  this.eventValue.length === 0) {
                errMsg = this.$t('controller.completeCondition');
            }
            this.$emit('change', {
                operator: 'value',
                value: this.eventValue,
                errMsg: errMsg
            });
        },

        // 展示批量输入
        editByRawValue() {
            this.rawValues = this.eventValue.join('\n');
            this.editRawValues = true;
        },
        digestRawValues() {
            let verifyArray = this.rawValues.split('\n')
                .map(line => String(line)
                    .trim())
                .filter(line => line);
            let valueType = this.valueType;
            switch (valueType) {
                // 文本
                case 'text':
                    if (this.validateStr(verifyArray)) {
                        this.eventValue = uniq(verifyArray);
                        this.update();
                        this.resetBelong();
                    }
                    break;
                // 小数
                case 'number':
                    if (this.validateNum(verifyArray)) {
                        this.eventValue = uniq(verifyArray);
                        this.update();
                        this.resetBelong();
                    }
                    break;
            }

        },
        // 重置批量输入弹窗内容
        resetBelong() {
            this.editRawValues = false;
            this.rawValues = '';
        },
        // 限定批量弹窗的数据总数
        rebase() {
            if (this.batchCount > 99) {
                let verifyArray = this.rawValues.split('\n')
                    .map(line => String(line)
                        .trim())
                    .filter(line => line)
                    .slice(0, 99);
                this.$toast(this.$t('swarm.max99items'), 'warn');
                this.rawValues = verifyArray.join('\n');
                this.rawValues += '\n';
            }
        },
        /**
        * 校验数组多选框string类型
        * @param arr Array 被校验的数组
        * @returns {*}
        */
        validateStr(arr) {
            if (arr.length > 99) {
                this.$toast(this.$t('swarm.max99items'), 'warn');
                return false;
            } else if (!arr.every(e => { return e.length < 301 })) {
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
            if (arr.length > 99) {
                this.$toast(this.$t('swarm.max99items'), 'warn');
                return false;
            } else if (!arr.every(e => { return e.length < 13 && string.test(e)})) {
                this.$toast(this.$t('swarm.singleFormart') + this.$t('swarm.numberFormatLimit') + '12', 'warn');
                return false;
            }
            return true;
        }
    },
};
</script>
<style lang="scss">
@import '../../../../../../../../common/scss/base/variables';
@import '../../../../../../../../common/scss/base/mixin';

.event-inputer {
    .query-filter-condition-value {
        // margin-top: 16px;
        min-height: 32px;
        box-sizing: border-box;
        // max-width: 40%;
        .keyword-input {
            height: 22px;
            box-sizing: border-box;
            input {
                display: block;
                height: 20px;
            }
        }
        .value-item {
            height: 20px;
            line-height: 20px;
            box-sizing: border-box;
        }
        &.many {
            max-width: calc(100% - 40px);
        }
    }
    .batch-icon {
        // margin-top: 16px;
        display: inline-block;
    }
}
</style>

