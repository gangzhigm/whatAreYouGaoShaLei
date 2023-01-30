<template>
    <div class="condition-group">
        <button class="content-relation-btn" type="button" @click="toggleRelation(0)">
            {{relations[0] === 'and' ? $t('common.and') : $t('common.or')}}
        </button>
        <div class="condition-content">
            <!--用户满足属性-->
            <div class="attr-item">
                <div class="attr-top" @click="userAttrOpen = !userAttrOpen">
                    <svg aria-hidden="true" :class="{open: userAttrOpen}">
                        <use xlink:href="#icon-right"></use>
                    </svg>
                    {{'userGroup.userAttribute' | t}}...
                </div>
                <transition-group name="drop">
                    <div v-show="userAttrOpen && userFilter.conditions.length" key="list">
                        <query-filter :groups="userOptionGroups" :filter="userFilter" :incompleteAsValid="false"
                                      :autoValidation="autoValidation"
                                      @change="updateUserFilter" @update="updateUserFilter"/>
                    </div>
                    <button v-show="userAttrOpen" class="add-condition-action"
                            @click="addUserFilterCondition" key="button">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        {{'userGroup.addRule' | t}}
                    </button>
                </transition-group>
            </div>
            <!--做过-->
            <div class="attr-item" :class="{multi: doneFilters.length > 1}">
                <div class="attr-top" @click="doneAttrOpen = !doneAttrOpen">
                    <svg aria-hidden="true" :class="{open: doneAttrOpen}">
                        <use xlink:href="#icon-right"></use>
                    </svg>
                    {{'userGroup.done' | t}}...
                </div>
                <transition-group name="drop">
                    <div v-show="doneAttrOpen" key="list">
                        <button v-if="doneFilters.length > 1" @click="toggleRelation(1)"
                                class="content-relation-btn" type="button">
                            {{relations[1] === 'and' ? $t('common.and') : $t('common.or')}}
                        </button>
                        <!-- 未添加 key 属性，因为每个组件的内部状态需要保持 -->
                        <done-filter v-for="(filter, index) in doneFilters"
                                     :key="ids[index]"
                                     :autoValidation="autoValidation"
                                     :user-attrs="userAttrs"
                                     :user-groups="userGroups"
                                     :events="events" :filter="filter"
                                     @change="updateDoneFilter($event, index)"/>
                    </div>
                    <button v-show="doneAttrOpen" class="add-condition-action" @click="addDoneFilter" key="button">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        {{'userGroup.addRule' | t}}
                    </button>
                </transition-group>
            </div>
            <!-- 行为序列 -->
            <!-- 聚合指标 -->
        </div>
    </div>
</template>
<script>
    import {filterConditionFactory} from '../components/query-filter-condition.vue';
    import {DoneFilterUtils} from './user-group.vue';
    import DoneFilter from './done-filter.vue';
    import QueryFilter from '../components/query-filter.vue';
    import cloneDeep from 'lodash/cloneDeep';
    import {uniqId} from '@/store/vuex/modules/canvasStore';

    export default {
        components: {
            DoneFilter,
            QueryFilter,
        },
        name: 'condition-group',
        props: {
            autoValidation: Boolean,
            userFilter: Object,
            doneFilters: Array,
            relations: Array,
            events: Array,
            userAttrs: Array,
            userGroups: Array,
        },
        data() {
            return {
                userAttrOpen: true,
                doneAttrOpen: true,
            };
        },
        computed: {
            userOptionGroups() {
                return [
                    {title: this.$t('eventAnalysis.userAttribute'), icon: 'fans-attr', options: this.userAttrs},
                    {title: this.$t('home.userGroup'), icon: 'user-group', options: this.userGroups}
                ];
            },
            ids() {
                return this.doneFilters.map(() => uniqId());
            }
        },
        methods: {
            toggleRelation(index) {
                const copy = this.relations.slice();
                copy[index] = copy[index] === 'and' ? 'or' : 'and';
                this.$emit('update:relations', copy);
            },
            updateUserFilter(newFilter) {
                this.$emit('update:userFilter', newFilter);
            },
            addUserFilterCondition() {
                const newConditions = this.userFilter.conditions.slice();
                newConditions.push(filterConditionFactory());
                const newFilter = {
                    relation: this.userFilter.relation,
                    conditions: newConditions
                };
                if (!this.userAttrOpen) {
                    this.userAttrOpen = true;
                }
                this.updateUserFilter(newFilter);
            },
            updateDoneFilter(newFilter, index) {
                const doneFiltersCopy = cloneDeep(this.doneFilters);
                if (newFilter) {
                    doneFiltersCopy.splice(index, 1, newFilter);
                } else {
                    doneFiltersCopy.splice(index, 1);
                }
                this.$emit('update:doneFilters', doneFiltersCopy);
            },
            addDoneFilter() {
                const doneFiltersCopy = cloneDeep(this.doneFilters);
                let newOne = DoneFilterUtils.flatten(DoneFilterUtils.create());
                if (this.autoValidation) {
                    newOne.valid = false;
                }
                doneFiltersCopy.push(newOne);
                if (!this.doneAttrOpen) {
                    this.doneAttrOpen = true;
                }
                this.$emit('update:doneFilters', doneFiltersCopy);
            }
        }
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .condition-group {
        position: relative;
        margin: 16px 0;
        padding-left: 40px;

        &:before {
            content: '';
            position: absolute;
            left: 15px;
            top: 0;
            bottom: 0;
            border-left: 2px solid $form-border;
            width: 0;
        }

        .content-relation-btn {
            position: absolute;
            left: 0;
            top: 50%;
            width: $input-field-height;
            height: $input-field-height;
            line-height: $input-field-height - 4px;
            border: 2px solid $form-border;
            border-radius: 4px;
            padding: 0;
            @include transform(translateY(-50%));
            @include transition();
            cursor: pointer;
            @include user-select(none);

            &:hover {
                background-color: $content-bg;
            }
        }

        .condition-content {
            width: calc(100% - 20px);

            // 添加按钮
            .add-condition-action {
                padding: 0;
                border: none;
                margin: 10px 0 10px 40px;
                line-height: 20px;
                background-color: transparent;
                color: $theme;
                cursor: pointer;
                @include appearance(none);
                @include user-select(none);

                &:hover {
                    color: $light-theme;
                }

                &:active {
                    color: $dark-theme;
                }

                svg {
                    float: left;
                    width: 8px;
                    height: 8px;
                    margin: 6px 8px 0 0;
                    fill: currentColor;
                }
            }
            //用户属性满足
            .attr-item {
                position: relative;
                border: 1px solid $form-border;
                border-radius: 4px;

                + .attr-item {
                    margin-top: 16px;
                }

                &.multi:before {
                    content: '';
                    position: absolute;
                    top: 50px;
                    left: 20px;
                    bottom: 60px;
                    border-left: 1px solid $border-color;
                    width: 0;
                }

                .attr-top {
                    padding: 0 10px;
                    line-height: $input-field-height;
                    background-color: $form-border;
                    @include user-select(none);
                    cursor: pointer;

                    svg {
                        float: left;
                        width: 8px;
                        height: 8px;
                        margin: floor(($input-field-height - 8px)/2) 8px 0 0;
                        fill: currentColor;
                        @include transition();

                        &.open {
                            @include transform(rotate(90deg));
                        }
                    }
                }

                .content-relation-btn {
                    margin: -5px 0 0 3px;

                    ~ .done-filter {
                        margin-left: 40px;
                    }
                }
            }
        }
    }
</style>
