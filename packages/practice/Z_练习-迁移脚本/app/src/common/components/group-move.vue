<template>
    <modal class="group-move" :title="title" @close="cancelMoveForm">
        <div class="form-field" @click="groupSelectShow = false">
            <label class="label placeholder" for="use">{{labelName}}</label>
            <div class="choose-parent" id="use" @click.stop="groupSelectShow = !groupSelectShow">
                <label class="select-text">
                    {{selectedGroupName || placeHolder}}
                    <span class="select-icon icon icon-arrow-down"></span>
                </label>
                <div class="search-tree-wrapper" v-if="groupSelectShow" @click.stop>
                    <search-tree :searchTreeData="groupList" @getTreeAct="selectedGroup" :action="false"
                                 :treeActiveId="treeActiveId"
                                 :levelStage="true"></search-tree>
                </div>
            </div>
        </div>
        <template v-slot:buttons>
            <input type="button"
                   :disabled="!treeActiveId"
                   class="btn btn-md btn-theme"
                   @click="saveMoveGroup"
                   :value="$t('common.confirm')"/>
        </template>
    </modal>
</template>

<script>
export default {
    name: 'group-move',
    props: {
        title: {
            type: String,
            default: function () {
                return this.$t('form.moveTo');
            }
        },
        labelName: {
            type: String,
            default: function () {
                return this.$t('QRCode.moveGroupLabelName');
            }
        },
        groupList: {
            type: Array,
            required: true
        },
        placeHolder: {
            type: String,
            default: function () {
                return this.$t('common.selectHolder');
            }
        }
    },
    data() {
        return {
            // 分组选择器显隐
            groupSelectShow: false,
            // 当前选中的分组名称
            selectedGroupName: '',
            // 当前选项中的分组Id
            treeActiveId: '',
        };
    },
    methods: {
        // 关闭弹窗
        cancelMoveForm() {
            this.$emit('close');
        },
        // 确定保存移动
        saveMoveGroup() {
            this.$emit('moveDown', this.treeActiveId);
            this.cancelMoveForm();
        },
        // 选择分组
        selectedGroup(group) {
            this.treeActiveId = group.id;
            this.selectedGroupName = group.name;
            this.groupSelectShow = false;
        }
    }
};
</script>

<style lang="scss">
    @import '../scss/base/variables';
    @import '../scss/base/mixin';

    .group-move {
        .choose-parent {
            display: inline-block;
            position: relative;

            $option-height: $input-field-height;
            $border-radius: 4px;
            $hover-bg: #f8f9fa;

            .select-text {
                position: relative;
                display: block;
                @include box-sizing();
                padding-right: $option-height - 2px;
                width: 312px;
                max-width: 312px;
                height: $option-height;
                line-height: $option-height - 2px;
                border: 1px solid $form-border;
                text-indent: .8em;
                @include border-radius($border-radius);
                @include user-select(none);
                background-color: white;
                @include ellipsis();

                &:not(.disabled):hover {
                    border-color: $theme;
                }

                &:not(.disabled) {
                    cursor: pointer;
                }

                &.disabled {
                    color: $disabled;
                    cursor: not-allowed;
                    background-color: $content-bg;

                    .select-icon {
                        color: $disabled;
                    }
                }

                &.placeholder {
                    color: $disabled;
                }

                &.active {
                    border-color: $theme;
                    @include box-shadow(0 1px 3px rgba($theme, .35));

                    .select-icon {
                        color: $theme;
                    }
                }

                .select-icon {
                    height: $option-height - 2px;
                    width: $option-height - 2px;
                    position: absolute;
                    top: 0;
                    right: 0;
                    text-align: center;
                    text-indent: 0;
                    color: $color-light-content;
                }
            }

            .search-tree-wrapper {
                position: absolute;
                width: 312px;
                max-width: 312px;
                max-height: 300px;
                background-color: white;
                border: 1px solid $border-color;
                border-top: none;
                z-index: $index-container;
            }
        }
    }
</style>