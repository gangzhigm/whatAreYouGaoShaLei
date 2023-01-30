<template>
    <div class="form-filter" :class="disabled ?'readonly':''">
        <button type="button" class="filter-relation" @click="changeRelation(filter.filterRelation)">
            {{filter.filterRelation === 0 ? $t('common.and') : $t('common.or')}}
        </button>
        <div class="query-condition condition-top" v-if="filter.filterGroup.length === 0"></div>
        <!-- 二级条件 -->
        <div class="query-condition" v-if="filter.filterGroup.length > 0">
            <div class="query-condition-child" v-for="(list,i) in filter.filterGroup" :key="i">
                <button type="button" class="filter-relation" @click="changeRelation(list.filterRelation,i)">
                    {{list.filterRelation === 0 ? $t('common.and') : $t('common.or')}}
                </button>
                <condition v-for="(condition, index) in list.filterList" :condition="condition" :groups="groups"
                    :incompleteAsValid="incompleteAsValid" :autoValidation="autoValidation" :key="condition.id"
                    :ifBelong="ifBelong || condition.ifBelong" :calenderFormat="calenderFormat" :type="type"
                    @change="modifyCondition($event, index,i)">
                </condition>
                <div class="query-condition" v-if="list.filterList.length > 0">
                    <span v-if="!disabled" class="theme-text">{{'form.addFilter' | t}}</span>
                    <span v-if="!disabled" class="icon icon-tianjia add-icon" @click="addFilter(list.filterList)"></span>
                </div>
            </div>
        </div>
        <!-- 二级条件end -->
        <p class="condition-btn" v-if="filter.filterGroup.length === 0">
            <span class="theme-text">{{'form.addFilter' | t}}</span>
            <span class="icon icon-tianjia add-icon" @click="addFilterGroup()"></span>
        </p>
        <div class="query-condition condition-bottom" v-if="filter.filterGroup.length === 0"></div>
        <!-- 添加条件 -->
        <div class="query-condition" v-if="filter.filterGroup.length > 0">
            <span v-if="!disabled" class="theme-text">{{'form.addConditionBunch' | t}}</span>
            <span v-if="!disabled" class="icon icon-tianjia add-icon" @click="addFilterGroup()"></span>
        </div>
    </div>
</template>

<script>
// filters editor
import Condition, { isCompleteCondition } from '../common/form-query-filter-condition.vue';
import { stringify } from '../../../common/utils/json';

/**
 * compare two hydrated conditions group
 * @param a
 * @param b
 * @return {boolean}
 */
export function isSameConditions (a, b) {
    const hydratedA = a.filter(isCompleteCondition);
    const hydratedB = b.filter(isCompleteCondition);

    return hydratedA.length === hydratedB.length
        && stringify(hydratedA, 'valid') === stringify(hydratedB, 'valid');
}

export default {
    name: 'form-query-filter-shibang',
    components: {
        Condition,
    },
    model: {
        prop: 'filter',
        event: 'change',
    },
    props: {
        disabled: {
            default: false,
            type: Boolean
        },
        filterIndex: Number, // 当前条件簇序列
        groups: Array,
        filter: Object, // {filterRelation: 0 并且；1 或者, filterList}
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
        //添加条件簇
        addFilterGroup () {
            if (this.filter.filterGroup.length === 5) return this.$toast(this.$t('form.conditionBunchesMore5'), 'warn');
            this.$emit('addFilterGroup');
        },
        //添加筛选条件
        addFilter (list) {
            if (list.length === 10) return this.$toast(this.$t('form.conditionMore10'), 'warn');
            const newCondition = {
                attrId: '', // 属性id
                function: '',// 1 等于；2 不等于；3 包含；4 不包含；5 有值；6 没值; 7 属于
                params: [], // 属性值
                ifBelong: true  // 是否包含属于
            };
            list.push(newCondition);
        },
        //或且的切换
        changeRelation (e, i) {
            if (this.disabled) return;
            this.$emit('changeRelation',{
                i: i,
                e: e
            });
        },
        modifyCondition (newCondition, index, i) {
            if (newCondition) {
                // 编辑
                this.filter.filterGroup[i].filterList.splice(index, 1, newCondition);
            } else {
                // 删除
                this.filter.filterGroup[i].filterList.splice(index, 1);
                if (this.filter.filterGroup[i].filterList.length === 0) {
                    this.filter.filterGroup.splice(i, 1);
                }
            }
        }
    },
};
</script>
<style lang="scss">
@import '../../../common/scss/base/variables';
@import '../../../common/scss/base/mixin';

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
    .query-condition {
        padding: 8px 0 8px 40px;
        position: relative;
        line-height: 12px;
        &:first-of-type::before {
            border-top: 1px solid #e0e5ea;
            border-top-left-radius: 4px;
            top: 21px;
            width: 24px;
        }
        &::before {
            border-left: 1px solid #cfd5df;
            bottom: 0;
            content: '';
            left: 16px;
            position: absolute;
            top: 0px;
            width: 0;
        }
        &:last-of-type::before {
            border-bottom: 1px solid #e0e5ea;
            border-bottom-left-radius: 4px;
            bottom: 15px;
            width: 24px;
        }
    }

    .condition-top {
        &:first-of-type::before {
            top: -4px;
        }
    }
    .condition-bottom {
        &:last-of-type::before {
            bottom: -4px;
        }
    }

    .condition-btn {
        padding-left: 40px;
    }

    .query-condition-child {
        padding-left: 70px;
        position: relative;
        button {
            left: 70px;
        }
    }
}

.readonly {
    pointer-events: none;
}
</style>
