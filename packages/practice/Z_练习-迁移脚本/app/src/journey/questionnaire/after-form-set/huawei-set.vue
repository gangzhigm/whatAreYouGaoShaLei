<template>
    <!--发送给华为线索管理-->
    <div class="huawei-content">
        <h3>{{'form.sendHuawei' | t}}</h3>
        <div class="margin">
            {{'form.sendDesc' | t}}
        </div>
        <!--发送全部表单数据-->
        <div class="margin">
            <radio :source="0" v-model="matchType">{{'form.sendAllData' | t}}</radio>
        </div>
        <!--增加条件判断，发送符合条件的表单数据-->
        <div class="margin">
            <radio :source="1" v-model="matchType">{{'form.sendSomeData' | t}}</radio>
            <template v-if="matchType === 1">
                <div class="margin-sub">{{'form.satisfied' | t}}</div>
                <div :class="{'condition-group': conditionGroupList.length > 1}">
                    <div class="btn-relation">
                        <button type="button" class="filter-relation-group" v-if="conditionGroupList.length > 1"
                                @click="changeGroupRelation">
                            {{groupRelation === 0 ? $t('common.and') : $t('common.or')}}
                        </button>
                    </div>
                    <div class="group-control menu-item" v-for="(condition,cur) in conditionGroupList" :key="cur">
                        <form-query-filter  :ifBelong="true"
                                            :groups="groups" 
                                            :filter="condition.filter"
                                            :filterIndex="cur"
                                           @delEmpty="delEmpty"
                                           @change="updateOrChangeFilter(condition,$event)"
                                           @update="updateOrChangeFilter(condition,$event)"/>
                        <button type="button" class="add-condition-btn" @click="addCondition(condition)">
                            <svg>
                                <use xlink:href="#icon-plus"></use>
                            </svg>
                            &nbsp;{{'eventAnalysis.filterCondition' | t}}
                        </button>
                        <button type="button" class="del-condition-btn" @click="removeCondition(cur)">
                            <svg>
                                <use xlink:href="#icon-close"></use>
                            </svg>
                        </button>
                    </div>
                </div>
                <!--添加条件簇-->
                <button type="button" class="add-condition-btn add-condition-btn-group" @click="addConditionGroup">
                    <svg>
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    &nbsp;{{'form.filterConditionGroup' | t}}
                </button>
            </template>
        </div>
        <!--保存-->
        <button type="button" class="btn btn-md btn-theme save-btn" @click="saveHuawei">
            {{'common.save' | t}}
        </button>
    </div>
</template>

<script>
    import FormQueryFilter from '../common/form-query-filter.vue';
    import {cloneDeep} from 'lodash';
    import { QuestionnaireApi, QuestionnaireApiV1 } from '@/api';

    export default {
        name: 'set-huawei',
        components: {
            FormQueryFilter,
        },
        props: {
            formId: {
                type: [Number, String],
                required: true
            }
        },
        data() {
            return {
                matchType: 0, // 0 全部表单; 1 根据规则筛选
                // 筛选条件下拉框
                groups: [],
                // 筛选条件簇
                conditionGroupList: [],
                // 条件簇关系
                groupRelation: 0,
            };
        },
        watch: {
            // matchType为0（全部表单）时，清空filter
            matchType() {
                if (this.matchType === 0) {
                    this.conditionGroupList = [];
                }
            },
        },
        mounted() {
            this.fetchFieldList();
            this.fetchClues();
        },
        destroyed() {
            // 置空filter
            this.conditionGroupList = [];
        },
        methods: {
            // 对应问题 4149，检测为空后空置当前数据
            delEmpty(data){
                this.conditionGroupList[data.dataIndex].filter.conditions.find( item => {
                    if (item.attrId === data.id) {
                        item = Object.assign(item, {attrId: '', function: ''}); 
                    }
                });
            },
            // 获取表单字段列表
            fetchFieldList() {
                QuestionnaireApiV1
                    .getAllField(this.formId)
                    .then(res => {
                        if (res.body.data) {
                            let dataList = res.body.data;
                            this.groups = dataList.map(data => {
                                let g = {};
                                g.id = data.field;
                                g.name = data.fieldName;
                                g.fieldType = data.fieldType;
                                return g;
                            });
                        }
                    });
            },
            // 获取表单规则列表
            fetchClues() {
                QuestionnaireApi
                    .getClues(this.formId)
                    .then(res => {
                        if (res.body.data) {
                            let matchRule = res.body.data;
                            this.matchType = matchRule.matchType;
                            this.groupRelation = matchRule.relation || 0;
                            if (matchRule.rules) {
                                matchRule.rules.forEach(rules => {
                                    rules.filter = {};
                                    rules.filter.relation = rules.relation || 0;
                                    rules.filter.conditions = rules.rule.map(r => {
                                        let c = {attrId: '', function: '', params: []};
                                        c.attrId = r.field;
                                        c.function = r.relation;
                                        if (r.value) {
                                            if (r.relation === 7 || r.relation === 8) {
                                                c.params = r.value;
                                            } else if (r.relation === 9){
                                                c.end = r.value.endTime;
                                                c.start = r.value.startTime;
                                            } else if (r.relation === 10) {
                                                c.day = r.value.days;
                                                c.relative_type = r.value.type;
                                            } else {
                                                c.params.push(r.value);
                                            }
                                        }
                                        return c;
                                    });
                                });
                                this.conditionGroupList = matchRule.rules;
                            }
                        }
                    });
            },
            // update、change 筛选条件
            updateOrChangeFilter(items, newFilter) {
                items.filter = newFilter;
            },
            // 添加一条筛选条件
            addCondition(items) {
                if (items.filter.conditions.length >= 50) {
                    this.$toast(this.$t('form.conditionMore'), 'warn');
                    return;
                }
                const newCondition = {
                    attrId: '', // 属性id
                    function: '',// 1 等于；2 不等于；3 包含；4 不包含；5 有值；6 没值
                    params: [], // 属性值
                };
                items.filter.conditions.push(newCondition);
            },
            // 删除条件簇
            removeCondition(cur) {
                this.conditionGroupList.splice(cur, 1);
            },
            // 添加条件簇
            addConditionGroup() {
                if (this.conditionGroupList.length >= 20) {
                    this.$toast(this.$t('form.conditionGroupMore'), 'warn');
                    return false;
                }
                this.conditionGroupList.push({
                    filter: {
                        relation: 0, //0 并且；1 或者
                        conditions: [
                            /*{
                                attrId: '',
                                function: '',
                                params: []
                            }*/
                        ]
                    },
                });
            },
            // 切换条件簇间的关系
            changeGroupRelation() {
                this.groupRelation = this.groupRelation === 0 ? 1 : 0;
            },
            // 保存
            saveHuawei() {
                // 多层组件导致数据dom更新耗时（待优化）；
                setTimeout(() => {
                    // 格式化filter {relation: 0,rule:[{field:'name',relation:0,value:'名称'}]}
                    let formatFilter = {};
                    formatFilter.relation = this.groupRelation;
                    formatFilter.rules = [];
                    if (this.matchType === 1 && !this.conditionGroupList.length) {
                        return this.$toast(this.$t('form.filterValid'), 'warn');
                    }
                    this.conditionGroupList.forEach(elm => {
                        let filter = {};
                        filter.rule = elm.filter.conditions.map(c => {
                            let valIsNull = c.function === 5 || c.function === 6; // 有值，没值
                            let obj = {};
                            obj.field = c.attrId;
                            obj.relation = c.function;
                            if (!valIsNull) { // 选择有值没值 不传 value
                                if (obj.relation === 7 || obj.relation === 8) {
                                    obj.value = c.params;
                                } else if (obj.relation === 9) {
                                    obj.value = {
                                        startTime: c.start,
                                        endTime: c.end
                                    };
                                } else if (obj.relation === 10) {
                                    obj.value = {
                                        days: c.day,
                                        type: c.relative_type
                                    };
                                } else {
                                    obj.value = c.params[0];
                                }
                            }
                            return obj;
                        });
                        filter.relation = elm.filter.relation;
                        formatFilter.rules.push(filter);
                    });


                    // 过滤field为空，relation为空的条件
                    let newFilter = {};
                    let someError = 0;
                    newFilter = cloneDeep(formatFilter);
                    newFilter.rules.forEach(rules => {
                        if (rules.rule.length === 0 ){
                            someError += 1;
                        }
                        rules.rule.forEach(i => {
                            if (!i.field) someError += 1;
                            if (!i.relation) someError += 1;
                            // 有值， 无值过滤
                            if (!i.value && i.relation !== 5 && i.relation !== 6 &&
                                i.relation !== 11 && i.relation !== 12) someError += 1;
                            if (toString.call(i.value) === '[object Array]' && i.value.length === 0) someError += 1;
                            if (toString.call(i.value) === '[object Object]' &&
                                (!Object.keys(i.value).length || !Object.values(i.value).length ||
                                    Object.values(i.value).includes(undefined) || Object.values(i.value).includes(null))) {
                                someError += 1;
                            }
                        });
                    });
                    if (someError && this.matchType === 1) {
                        this.$toast(this.$t('data.refineData'), 'warn');
                        return;
                    }
                    // newFilter.rule = finalRule;
                    // json格式
                    let matchRule = JSON.stringify(newFilter);
                    QuestionnaireApi
                        .saveClues(this.formId, matchRule, this.matchType)
                        .then(res => {
                            this.$toast(res.body.message, 'success');
                        });
                }, 300);
            },
        },
    };
</script>

<style type="text/scss" lang="scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';

    $padding-left: 40px;
    .huawei-content {
        .margin {
            margin: 32px;
        }

        .margin-sub {
            margin: 16px;
        }

        .menu-item {

            &.group-control {
                .visual-filter .filter-relation {
                    width: 24px;
                }

                .by-fields-groups {
                    padding-left: $padding-left - 20px;

                }

                .add-ops-item {
                    padding: 0;
                    line-height: $input-field-height;
                    background-color: inherit;
                    border: none;
                    cursor: pointer;
                    color: $green;
                    margin-left: $padding-left;

                    &:hover {
                        color: $light-green;
                    }
                }

            }
        }

        .condition-group {
            position: relative;
            border-left: 1px solid $green;

            .btn-relation {
                position: absolute;
                z-index: $index-container;
                @include box-sizing();
                left: -16px;
                top: 50%;
                padding: 8px 0;
                background: #fff;
                @include transform(translateY(-50%));

                .filter-relation-group {
                    width: $input-field-height - 2px;
                    height: $input-field-height - 10px;
                    line-height: $input-field-height - 10px - 2px;
                    border: 1px solid $form-border;
                    border-radius: 4px;
                    padding: 0;
                    border: 1px solid #fff;
                    box-sizing: border-box;
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


        }

        // query 筛选条件 filter.conditions
        .add-condition-btn, .del-condition-btn {
            height: 22px;
            line-height: 22px;
            border: none;
            margin-left: 40px;
            padding: 0;
            background-color: transparent;
            color: $green;
            cursor: pointer;

            &:hover {
                color: $light-green;
            }

            svg {
                display: inline-block;
                width: 1em;
                height: 1em;
                vertical-align: top;
                margin-top: 5px;
                fill: currentColor;
            }
        }

        .del-condition-btn {
            color: $red;

            &:hover {
                color: $light-red;
            }

            margin-left: 8px;
        }

        .add-condition-btn-group {
            padding: 5px 8px;
            border-radius: 4px;
            @include box-sizing();
            height: auto;
            border: 1px solid $green;
            margin-top: 8px;
        }
    }
</style>