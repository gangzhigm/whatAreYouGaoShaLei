<template>
    <div class="tag-tree">
        <!--全部-->
        <div class="level level-0" :class="{active: defaultGroup.id === checkedGroupId}"
             @click="showLabels(defaultGroup)" :title="defaultGroup.name">
            <button type="button" class="toggle-action-btn"
                    :class="{open:expand}" @click="toggleAllGroup">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-right"></use>
                </svg>
            </button>
            <template>
                <span class="pull-right" v-if="defaultGroup.id === checkedGroupId">{{groups.allSum}}</span>
                <span class="pull-right icon icon-gengduo" v-else></span>
            </template>
            <button type="button" class="add-action-btn" :disabled="$has('datacentre_label_add_group')"
                    @click="addGroup(defaultGroup.id)">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-plus"></use>
                </svg>
            </button>
            {{defaultGroup.name}}
        </div>
        <template v-if="expand" v-for="topLevel in groups">
            <!--一级分组-->
            <div class="level level-1" :class="{active: topLevel.id === checkedGroupId}" v-if="topLevel.groupList"
                 @click="showLabels(topLevel)" :title="topLevel.name">
                <button type="button" class="toggle-action-btn" :class="{open:checkedGroupIds.includes(topLevel.id)}"
                        v-if="topLevel.id !== 1" @click="toggleSubGroup(topLevel.id)">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-right"></use>
                    </svg>
                </button>
                <template>
                    <span class="pull-right" v-if="topLevel.id === checkedGroupId">{{topLevel.topSum}}</span>
                    <span class="pull-right icon icon-gengduo" v-else></span>
                </template>
                <button type="button" class="add-action-btn" :disabled="$has('datacentre_label_add_group')"
                        v-if="topLevel.id !== 1" @click="addGroup(topLevel.id)">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                </button>
                <!--默认分组不能编辑，默认分组ID为1-->
                <template v-if="topLevel.id !== 1">
                    <div class="delete-action-btn">
                        <svg aria-hidden="true" :class="{'icon-disable':$has('datacentre_label_delete_group')}"
                             @click="deleteGroup(topLevel.id,topLevel.name)">
                            <use xlink:href="#icon-round-close"></use>
                        </svg>
                    </div>
                    <button type="button" class="edit-action-btn" :disabled="$has('datacentre_label_edit_group')"
                            @click="editGroup(topLevel)">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-pencil"></use>
                        </svg>
                    </button>
                </template>
                {{topLevel.name}}
            </div>
            <div class="empty level-1-empty" :no-group="$t('tag.noGroup')"
                 v-if="topLevel.id !== 1 && topLevel.groupList.length <= 0 && checkedGroupIds.includes(topLevel.id)"></div>
            <!--二级分组-->
            <div class="level-2" v-if="topLevel.groupList"
                 v-for="secondLevel in topLevel.groupList">
                <div class="level-2-group" :class="{active: secondLevel.id === checkedGroupId}"
                     v-if="checkedGroupIds.includes(topLevel.id)" :title="secondLevel.name"
                     @click="showLabels(secondLevel)">
                    <button type="button" class="toggle-action-btn"
                            :class="{open:checkedGroupIds.includes(secondLevel.id)}"
                            @click="toggleSubGroup(secondLevel.id)">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-right"></use>
                        </svg>
                    </button>
                    <template>
                        <span class="pull-right"
                              v-if="secondLevel.id === checkedGroupId">{{secondLevel.secondSum}}</span>
                        <span class="pull-right icon icon-gengduo" v-else></span>
                    </template>
                    <button type="button" class="add-action-btn" :disabled="$has('datacentre_label_add_group')"
                            @click="addGroup(secondLevel.id)">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                    </button>
                    <div class="delete-action-btn">
                        <svg aria-hidden="true" :class="{'icon-disable':$has('datacentre_label_delete_group')}"
                             @click="deleteGroup(secondLevel.id,secondLevel.name)">
                            <use xlink:href="#icon-round-close"></use>
                        </svg>
                    </div>
                    <button type="button" class="edit-action-btn" :disabled="$has('datacentre_label_edit_group')"
                            @click="editGroup(secondLevel)">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-pencil"></use>
                        </svg>
                    </button>
                    {{secondLevel.name}}
                </div>
                <div class="empty level-2-empty" :no-group="$t('tag.noGroup')"
                     v-if="secondLevel.groupList.length <= 0 && checkedGroupIds.includes(topLevel.id) && checkedGroupIds.includes(secondLevel.id)"></div>
                <!--三级分组-->
                <div class="level-2"
                     v-if="secondLevel.groupList && checkedGroupIds.includes(secondLevel.id)">
                    <div class="level-3-group" :class="{active: threeLevel.id === checkedGroupId}"
                         v-if="checkedGroupIds.includes(topLevel.id)" v-for="threeLevel in secondLevel.groupList"
                         @click="showLabels(threeLevel)" :title="threeLevel.name">
                        <template>
                            <span class="pull-right"
                                  v-if="threeLevel.id === checkedGroupId">{{threeLevel.labelCount}}</span>
                            <span class="pull-right icon icon-gengduo" v-else></span>
                        </template>
                        <div class="delete-action-btn">
                            <svg aria-hidden="true" :class="{'icon-disable':$has('datacentre_label_delete_group')}"
                                 @click="deleteGroup(threeLevel.id, threeLevel.name)">
                                <use xlink:href="#icon-round-close"></use>
                            </svg>
                        </div>
                        <button type="button" class="edit-action-btn" :disabled="$has('datacentre_label_edit_group')"
                                @click="editGroup(threeLevel)">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-pencil"></use>
                            </svg>
                        </button>
                        {{threeLevel.name}}
                    </div>
                </div>
            </div>
        </template>
        <confirm v-if="showGroup"
                 :title="editingGroup.id ? $t('tag.editGroup') :  $t('tag.addGroup')"
                 @cancel="cancelGroup"
                 @confirm="saveGroup">
            <div class="form-field">
                <label for="groupTitle" class="label">{{'tag.name' | t}}</label>
                <input class="input lg" :class="{error: groupErrorText}" type="text" id="groupTitle"
                       v-model.trim="editingGroup.name" @click="groupErrorText = ''"
                       :placeholder="$t('tag.inputGroupName')" maxlength="30" v-title:top.warn.line="groupErrorText">
            </div>
        </confirm>
    </div>
</template>

<script>
    import { ContactApiV1 } from '@/api';
    import cloneDeep from 'lodash/cloneDeep';
    import {COMMON_NAME_REGEXP} from '../../common/utils/regs';
    import {trackEvent} from '../../monitor';

    export default {
        name: 'tag-tree',
        props: {
            groups: {
                type: Array,
                required: true,
            },
            // 选中的分组ID
            checkedGroupId: {
                type: Number,
                required: true,
            },
        },
        data() {
            return {
                expand: true, // 展开 全部
                groupId: 0, // 分组id
                showGroup: false,
                editingGroup: {}, // 编辑中的分组
                groupErrorText: '',
                defaultGroup: {
                    id: 0,
                    name: this.$t('tag.all'),    // 全部
                },
                checkedGroupIds: [],// 各个分组的展开、收起状态
            };
        },
        mounted() {
            // 获取分组下的标签列表
            this.showLabels(this.defaultGroup);
        },
        methods: {
            // 分组的校验
            verify() {
                this.groupErrorText = '';
                if (!this.editingGroup.name) {
                    this.groupErrorText = this.$t('tag.noEmptyGroupName');
                    return false;
                }

                if (!COMMON_NAME_REGEXP.test(this.editingGroup.name)) {
                    this.groupErrorText = this.$t('tag.groupNameReg');
                    return false;
                }

                if (this.groups.some(
                    group => group.id !== this.editingGroup.id && this.editingGroup.name === group.name
                )) {
                    this.groupErrorText = this.$t('tag.doubleGroupName');
                    return false;
                }

                return true;
            },

            // 显示添加分组弹框
            addGroup(groupId) {
                this.editingGroup = {
                    name: '',
                };
                this.groupId = groupId;
                this.showGroup = true;
            },

            // 编辑分组
            editGroup(group) {
                this.editingGroup = cloneDeep(group);
                this.groupErrorText = '';
                this.showGroup = true;
            },

            // 关闭分组弹框
            cancelGroup() {
                this.editingGroup = {};
                this.groupErrorText = '';
                this.showGroup = false;
            },

            // 保存分组
            saveGroup() {
                if (!this.verify()) {
                    return;
                }
                if (this.editingGroup.id) { // 编辑分组
                    this.$loading();
                    ContactApiV1
                        .editLabelGroup({
                            id: this.editingGroup.id,
                            name: this.editingGroup.name
                        })
                        .then(() => {
                            this.groups.filter(group => {
                                if (group.id === this.editingGroup.id) {
                                    group.name === this.editingGroup.name
                                        ? this.cancelGroup()
                                        : group.name = this.editingGroup.name;
                                }
                                group.groupList.filter(secondGroup => {
                                    if (secondGroup.id === this.editingGroup.id) {
                                        secondGroup.name === this.editingGroup.name
                                            ? this.cancelGroup()
                                            : secondGroup.name = this.editingGroup.name;
                                    }
                                    secondGroup.groupList.filter(threeGroup => {
                                        if (threeGroup.id === this.editingGroup.id) {
                                            threeGroup.name === this.editingGroup.name
                                                ? this.cancelGroup()
                                                : threeGroup.name = this.editingGroup.name;
                                        }
                                    });
                                });
                            });
                            this.cancelGroup();
                            this.$toast(this.$t('tag.editGroupNameSuccess'), 'success');
                            trackEvent('编辑标签分组');
                            this.$loaded();
                        })
                        .catch(err => {
                            console.error(err);
                            this.$loaded();
                        });
                } else {    // 添加分组
                    this.$loading();
                    ContactApiV1
                        .createLabelGroup({
                            name: this.editingGroup.name,
                            parId: this.groupId
                        })
                        .then(() => {
                            this.cancelGroup();
                            this.$emit('list');
                            this.$toast(this.$t('tag.addGroupSuccess'), 'success');
                            trackEvent('创建标签分组');
                            this.$loaded();
                        })
                        .catch(err => {
                            console.error(err);
                            this.$loaded();
                        });
                }
            },

            // 展开全部
            toggleAllGroup() {
                this.expand = !this.expand;
                this.checkedGroupIds = [];
            },

            //分组列表展示
            toggleSubGroup(groupId) {
                //分组中的Id是否有和分组id相同的
                const index = this.checkedGroupIds.findIndex(id => id === groupId);
                index === -1
                    ? this.checkedGroupIds.push(groupId)
                    : this.checkedGroupIds.splice(index, 1);
            },

            // 删除分组
            deleteGroup(id, name) {
                this.$confirm(this.$t('common.defaultConfirmTitle'), this.$t('tag.confirm') + `【${name}】 ` + this.$t('tag.if') + this.$t('tag.deleteGroup'))
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            ContactApiV1.deleteLabelGroup(id)
                                .then(() => {
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    trackEvent('删除标签分组');

                                    // 删除分组后选中"全部"
                                    this.showLabels(this.defaultGroup);
                                    this.$emit('list');
                                    this.$loaded();
                                })
                                .catch(err => {
                                    console.error(err);
                                    this.$loaded();
                                });
                        }
                    });
            },

            // 显示分组下的标签
            showLabels(group) {
                this.$emit('click', group);
            }
        },
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .tag-tree {
        .empty {
            color: $disabled;
            font-style: italic;
            line-height: 48px;
            background-color: white;

            &:after {
                content: attr(no-group);
            }
        }

        .level-1-empty {
            padding: 0 16px 0 64px;
        }

        .level-2-empty {
            padding: 0 16px 0 80px;
        }

        .level {
            height: 48px;
            line-height: 48px;
            @include user-select(none);
            @include ellipsis();
        }

        .level,
        .level-2-group,
        .level-3-group {
            &:hover {
                background-color: #cef3ee;

                .delete-action-btn,
                .edit-action-btn {
                    opacity: 1;
                }
            }
        }

        .active {
            background-color: #cef3ee;

            .delete-action-btn,
            .edit-action-btn {
                opacity: 1;
            }
        }

        .level-0 {
            padding: 0 16px;
            cursor: pointer;
        }

        .level-1 {
            padding: 0 16px 0 32px;
            cursor: pointer;
        }

        .level-2 {
            outline: none;

            .level-2-group {
                padding: 0 16px 0 48px;
                line-height: 48px;
                cursor: pointer;
                @include ellipsis();
            }

            .level-3-group {
                padding: 0 16px 0 80px;
                height: 48px;
                line-height: 48px;
                cursor: pointer;
                @include ellipsis();
            }
        }

        .toggle-action-btn {
            position: relative;
            right: 8px;
            width: 16px;
            height: 16px;
            margin-top: 16px;
            vertical-align: top;
            border: none;
            padding: 0;
            border-radius: 100%;
            background-color: $form-border;
            @include transition();

            &:not([disabled]) {
                cursor: pointer;

                &:hover {
                    background-color: $blue;
                }
            }

            &.open {
                svg {
                    @include transform(rotate(90deg));
                }
            }

            svg {
                display: block;
                width: 8px;
                height: 8px;
                margin: 4px;
                fill: white;
                cursor: inherit;
                @include transition();
            }
        }

        .delete-action-btn {
            position: relative;
            opacity: 0;
            float: right;
            width: 16px;
            height: 16px;
            margin: 16px 16px 0 0;
            border-radius: 100%;
            cursor: pointer;

            &.active {
                opacity: 1;

                svg {
                    fill: $red;
                }
            }

            svg {
                display: block;
                width: 14px;
                height: 14px;
                margin: auto;
                fill: $form-border;
                cursor: inherit;
                @include transition();

                &:hover {
                    fill: $red;
                }
            }
        }

        .edit-action-btn {
            position: relative;
            opacity: 0;
            float: right;
            width: 14px;
            height: 14px;
            margin: 17px 16px 0 0;
            border: none;
            padding: 0;
            background-color: transparent;
            cursor: pointer;

            svg {
                display: block;
                width: 14px;
                height: 14px;
                margin: auto;
                fill: $form-border;
                @include transition(fill .2s ease);

                &:hover {
                    fill: $theme;
                }
            }
        }

        .add-action-btn {
            position: relative;
            float: right;
            width: 16px;
            height: 16px;
            margin: 16px 16px 0 0;
            border: none;
            padding: 0;
            background-color: transparent;
            cursor: pointer;

            svg {
                display: block;
                width: 14px;
                height: 14px;
                margin: auto;
                fill: $form-border;
                @include transition(fill .2s ease);

                &:hover {
                    fill: $theme;
                }
            }
        }
    }
</style>
