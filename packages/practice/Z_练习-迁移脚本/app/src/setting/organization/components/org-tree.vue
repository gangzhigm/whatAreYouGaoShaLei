<!--含有删除/编辑按钮的组织结构-->
<template>
    <div class="org-tree">
        <div class="parent"
             v-for="item in list"
             :key="item.id">
            <button v-if="item.children && item.children.length>0" :class="[item.spread? 'open':'']" type="button"
                    class="toggle-action-btn" @click="item.spread=!item.spread">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-right"></use>
                </svg>
            </button>
            <span v-else class="toggle-action-span">
            </span>
            <div class="title-btn" @click.stop="handleTitleClick(item)" :class="{'tree-active': item.checked}">
                <span class="tree-title" :title="item.title">{{ item.title }}</span>
                <div class="edit-wrapper" v-if="item.parentId!=0">
                    <button class="btn pull-left nomargin" :disabled="$has('enterprise_member_edit_department')">
                        <svg aria-hidden="true" :class="{'icon-disable':$has('enterprise_member_edit_department')}"
                            class="action-icon icon-round-pencil" @click.stop='handleEdit(item)'>
                            <use xlink:href="#icon-pencil"></use>
                        </svg>&nbsp;&nbsp;
                    </button>
                    <button class="btn pull-left nomargin" :disabled="$has('enterprise_member_delete_department')">
                        <svg aria-hidden="true" :class="{'icon-disable':$has('enterprise_member_delete_department')}"
                            class="action-icon icon-delete" @click.stop='handleDelete(item)'>
                            <use xlink:href="#icon-round-close"></use>
                        </svg>&nbsp;&nbsp;
                    </button>    
                </div>
            </div>
            <div v-if="item.children" class="children-item" v-show="item.spread">
                <org-tree :list="item.children" @selectItem="handleSelectItem($event)" @delete="handleDelete($event)"
                          @edit="handleEdit($event)"></org-tree>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'orgTree',
        props: {
            list: Array
        },
        data() {
            return {
                arrow: 'arrow',
            };
        },
        computed: {},
        methods: {
            //初始化数据
            initDt: function (dt) {
                for (let i = 0; i < dt.length; i++) {
                    let item = dt[i];
                    item.checked = false;
                    if (item.children) {
                        this.initDt(item.children);
                    }
                }
            },
            handleEdit(item) {
                this.initDt(this.list);
                item.checked = true;
                this.$emit('edit', item);
            },
            handleDelete(item) {
                this.initDt(this.list);
                item.checked = true;
                this.$emit('delete', item);
            },
            //选择了一项
            handleTitleClick(item) {
                this.initDt(this.list);
                item.checked = true;
                this.$emit('selectItem', item);
            },
            handleSelectItem(item) {
                this.handleTitleClick(item);
            }
        },
        components: {}
    };
</script>

<style type="text/css" lang="scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';
    .org-tree {
        .parent {
            .toggle-action-span {
                display: inline-block;
                position: relative;
                right: 2px;
                width: 16px;
                height: 16px;
                margin-top: 6px;
                margin-left: 6px;
                vertical-align: top;
            }
            .toggle-action-btn {
                position: relative;
                right: 2px;
                width: 16px;
                height: 16px;
                margin-top: 6px;
                margin-left: 6px;
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
            width: 220px;
            @include clearfix();
            .title-btn {
                width: 100%;
                cursor: pointer;
                display: inline-block;
                .tree-title {
                    display: inline-block;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    max-width: 140px;
                    vertical-align: top;
                }
                .edit-wrapper {
                    display: none;
                    padding-left: 5px;
                    svg {
                        width: 14px;
                        height: 14px;
                        margin-left: unset;
                        position: relative;
                        top: 2px;
                        cursor: pointer;
                    }
                    .editButton {
                        fill: $green;
                    }
                    .deleteButton {
                        fill: $red;
                    }
                }
                &:hover {
                    color: $green;
                    .edit-wrapper {
                        display: inline-block;
                    }
                }
                .nomargin {
                    margin:0;
                    padding:0;
                }

            }
            .tree-active {
                color: $green;
                .edit-wrapper {
                    display: inline-block;
                }

            }
        }
        .parent, .children-item {
            line-height: 30px;
            font-size: 13px;
            white-space: nowrap;
        }
        .parent span {
            cursor: pointer;
        }
        .children-item {
            padding-left: 25px;
        }

    }
</style>
