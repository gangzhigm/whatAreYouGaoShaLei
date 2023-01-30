<template>
    <div class="visual-filter" :class="{indent, 'only-one': filter.conditions.length === 1}"
         v-show="filter.conditions.length">
        <button type="button" class="filter-relation" v-if="filter.conditions.length > 1" @click="changeRelation">
            {{filter.relation === 'and' ? $t('common.and') : $t('common.or')}}
        </button>
        <condition v-for="(condition, index) in conditions" :groups="groups" :condition="condition"
                   :incompleteAsValid="incompleteAsValid" :autoValidation="autoValidation" :key="condition.id"
                   @change="modifyCondition($event, index)">
        </condition>
    </div>
</template>

<script>
    // filters editor
    import Condition, {isCompleteCondition} from './visual-query-filter-condition.vue';
    import {stringify} from '../../common/utils/json';

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
        name: 'visual-query-filter',
        components: {
            Condition,
        },
        model: {
            prop: 'filter',
            event: 'change',
        },
        props: {
            groups: Array,
            filter: Object, // {relation, conditions}
            indent: Boolean,
            autoValidation: {
                type: Boolean,
                default: true
            }, // 自动校验
            incompleteAsValid: { // 不完整的条件当做校验通过
                type: Boolean,
                default: true
            },
        },
        computed: {
            conditions() {
                this.filter.conditions
                    .forEach((condition, index) => {
                        if (!condition.id || Object.getOwnPropertyDescriptor(condition, 'id').enumerable) {
                            delete condition.id;
                            Object.defineProperty(condition, 'id', {
                                enumerable: false,
                                configurable: false,
                                writable: false,
                                value: (new Date).getTime() + String(index)
                            });
                        }
                    });
                return this.filter.conditions;
            }
        },
        methods: {
            changeRelation() {
                const newRelation = this.filter.relation === 'and' ? 'or' : 'and';
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
                    this.$emit('update', {relation: this.filter.relation, conditions: conditionsCopy});
                }

                // actual change check
                if (isSameConditions(targetConditions, conditionsCopy)) {
                    this.$emit('update', {relation: this.filter.relation, conditions: conditionsCopy});
                } else {
                    this.$emit('change', {relation: this.filter.relation, conditions: conditionsCopy});
                }
            }
        },
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .visual-filter {
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
            width: $input-field-height - 10px;
            height: $input-field-height - 10px;
            line-height: $input-field-height - 10px - 2px;
            border: 1px solid $form-border;
            border-radius: 4px;
            padding: 0;
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
