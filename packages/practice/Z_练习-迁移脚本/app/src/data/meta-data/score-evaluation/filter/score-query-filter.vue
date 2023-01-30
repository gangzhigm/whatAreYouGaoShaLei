<template>
    <div class="score-analysis-filter" :class="{indent, 'only-one': filter.conditions.length === 1}"
         v-if="filter.conditions.length">
        <button type="button" class="filter-relation" v-if="filter.conditions.length > 1" @click="changeRelation">
            {{filter.relation === 'and' ? $t('common.and') : $t('common.or')}}
        </button>
        <condition ref="condition" v-for="(condition, index) in conditions" :groups="groups"
                   :isSave="isSave"
                   :condition="condition" :eventIdList="eventIdList"
                   :key="condition.id" @change="modifyCondition($event, index)">
            <button class="action-icon icon icon-delete"
                    v-if="!(required && filter.conditions.length === 1)"
                    @click="modifyCondition(false, index)"></button>
        </condition>
    </div>
</template>
<script>
    // filters editor
    import Condition, {isCompleteCondition} from './score-query-filter-condition.vue';
    import cloneDeep from 'lodash/cloneDeep';

    /**
     * compare two hydrated conditions group
     * @param a
     * @param b
     * @return {boolean}
     */
    function isSameConditions(a, b) {
        const hydratedA = a.filter(isCompleteCondition);
        const hydratedB = b.filter(isCompleteCondition);

        return hydratedA.length === hydratedB.length
            && JSON.stringify(hydratedA) === JSON.stringify(hydratedB);
    }

    export default {
        name: 'score-query-filter',
        model: {
            prop: 'filter',
            event: 'change',
        },
        props: {
            eventIdList: {
                type: Array,
                default() {
                    return [];
                }
            },
            groups: Array,
            filter: Object, // {relation, conditions}
            indent: Boolean,
            isSave: {
                type: Boolean,
                default: false
            },
            required: Boolean // 至少有一个条件
        },
        computed: {
            conditions() {
                this.filter.conditions
                    .forEach((condition, index) => {
                        condition.id = condition.id || (new Date).getTime() + String(index);
                    });
                return this.filter.conditions;
            }
        },
        methods: {
            //验证
            changeRelation() {
                const newRelation = this.filter.relation === 'and' ? 'or' : 'and';
                this.$emit('change', Object.assign({}, this.filter, {relation: newRelation}));
            },
            modifyCondition(newCondition, position) {
                // update the condition properly, could be editing/deleting
                const targetConditions = this.filter.conditions;
                const conditionsCopy = cloneDeep(targetConditions);
                if (newCondition) {
                    // edit
                    conditionsCopy.splice(position, 1, newCondition);
                } else {
                    // delete
                    conditionsCopy.splice(position, 1);
                }

                // actual change check
                if (isSameConditions(targetConditions, conditionsCopy)) {
                    this.$emit('update', {relation: this.filter.relation, conditions: conditionsCopy});
                } else {
                    this.$emit('change', {relation: this.filter.relation, conditions: conditionsCopy});
                }
            },
            //判断进来的页面的筛选条件是否通过验证
            valid() {
                let flag = true;
                //不为空
                if (this.$refs.condition) {
                    flag = this.$refs.condition.every(condition => condition.valid === undefined || condition.valid);
                }
                return flag;
            }
        },
        components: {
            Condition
        },
    };
</script>
<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    $padiing-left: 45px * 2;
    .score-analysis-filter {
        position: relative;

        .query-field {
            display: inline-block;
            line-height: $input-field-height - 10px;
            padding: 4px 10px;
            border-radius: 4px;
            border: 1px solid $border-color;
            //2
            margin-top: 2px;
            margin-bottom: 2px;

            &:focus {
                border-color: $color-content;
                @include box-shadow();
            }

            &.tiny {
                width: 2em;
            }
        }

        &.indent {
            margin-left: $input-field-height;
        }

        &.only-one {
            .score-query-filtr-condition {
                padding-left: $padiing-left / 2;
            }
            + .add-ops-item {
                margin-left: $padiing-left / 2;
            }
        }

        &:not(.only-one) {
            + .add-ops-item {
                margin-left: $padiing-left;
            }
        }

        .filter-relation {
            position: absolute;
            z-index: $index-container;
            left: $padiing-left - $input-field-height - round($input-field-height/2);
            top: 50%;
            width: $input-field-height;
            height: $input-field-height;
            line-height: $input-field-height - 2px;
            border: 1px solid $border-color;
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
