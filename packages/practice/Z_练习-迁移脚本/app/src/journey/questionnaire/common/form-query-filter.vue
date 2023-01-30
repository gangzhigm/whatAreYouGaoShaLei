<template>
    <div class="form-filter" :class="{indent, 'only-one': filter.conditions.length === 1}"
         v-show="filter.conditions.length">
        <button type="button" class="filter-relation" v-if="filter.conditions.length > 1" @click="changeRelation">
            {{filter.relation === 0 ? $t('common.and') : $t('common.or')}}
        </button>
        <condition v-for="(condition, index) in filter.conditions" :groups="groups" :condition="condition"
                   :incompleteAsValid="incompleteAsValid" :autoValidation="autoValidation" :key="condition.id"
                   :ifBelong="ifBelong || condition.ifBelong" @delEmpty="delEmpty($event, index)"
                   :calenderFormat="calenderFormat" :type="type"
                   @change="modifyCondition($event, index)">
        </condition>
    </div>
</template>

<script>
    // filters editor
    import Condition, {isCompleteCondition} from './form-query-filter-condition.vue';
    import {stringify} from '../../../common/utils/json';

    /**
     * compare two hydrated conditions group
     * @param a
     * @param b
     * @return {boolean}
     */
    export function isSameConditions(a, b) {
        const hydratedA = a.filter(isCompleteCondition);
        const hydratedB = b.filter(isCompleteCondition);

        return hydratedA.length === hydratedB.length
            && stringify(hydratedA, 'valid') === stringify(hydratedB, 'valid');
    }

    export default {
        name: 'form-query-filter',
        components: {
            Condition,
        },
        model: {
            prop: 'filter',
            event: 'change',
        },
        props: {
            filterIndex: Number, // 当前条件簇序列
            groups: Array,
            filter: Object, // {relation: 0 并且；1 或者, conditions}
            indent: Boolean,
            autoValidation: {
                type: Boolean,
                default: true
            }, // 自动校验
            incompleteAsValid: { // 不完整的条件当做校验通过
                type: Boolean,
                default: true
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
        methods: {
            // 对应问题 4149 ，向上传导当前已删除值
            delEmpty(data) {
                if (data.attrId.length > 0 && this.filter.conditions.find( item => item.attrId === data.attrId )) {
                    this.$emit('delEmpty', {dataIndex: this.filterIndex, id: data.attrId});
                }
            },
            changeRelation() {
                const newRelation = this.filter.relation === 0 ? 1 : 0;
                this.$emit('change', Object.assign({}, this.filter, {relation: newRelation}));
            },
            modifyCondition(newCondition, position) {
                // update the condition properly, could be editing/deleting
                const targetConditions = this.filter.conditions;
                const conditionsCopy = targetConditions.slice();
                if (newCondition) {
                    // edit
                    conditionsCopy.splice(position, 1, newCondition);
                } else {
                    // delete
                    conditionsCopy.splice(position, 1);
                    this.$emit('update', {relation: this.filter.relation, conditions: conditionsCopy, position: position});
                }

                // actual change check
                if (isSameConditions(targetConditions, conditionsCopy)) {
                    this.$emit('update', {relation: this.filter.relation, conditions: conditionsCopy, position: position});
                } else {
                    this.$emit('change', {relation: this.filter.relation, conditions: conditionsCopy, position: position});
                }
            }
        },
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .form-filter {
        position: relative;
        padding: 8px 5px 8px 0;

        &.indent {
            margin-left: $input-field-height;
        }
        .filter-relation {
            position: absolute;
            z-index: $index-container;
            @include box-sizing();
            left: 5px;
            top: 50%;
            width: $input-field-height - 2px;
            height: $input-field-height - 10px;
            line-height: $input-field-height - 10px - 2px;
            border: 1px solid $form-border;
            border-radius: 4px;
            padding: 0;
            border: 1px solid #fff;
            box-sizing: border-box;
            @include transform(translateY(-50%));
            @include transition();
            cursor: pointer;

            &:hover {
                @include box-shadow();
                background-color: $content-bg;
            }

            &:before {
                content: '';
                position: absolute;

            }
        }
    }
</style>
