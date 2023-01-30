<template>
    <div class='cascading-selection' v-blur="close">
        <label class="select-text" @click="toggle">
            <span v-if="text" class="text-select-name">{{text}}</span>
            <span v-else class="placeholder">{{placeholder ? placeholder : $t('common.selectHolder')}}</span>
            <span class="select-icon icon icon-arrow-down"></span>
        </label>
        <transition name="drop">
            <div class="csedes" v-if="showList">
                <inline-loading v-if="loading"/>
                <div v-if='!loading' class='drop-down-list'>
                    <ul>
                        <li v-if='list.length === 0'>{{'common.noData' | t}}</li>
                        <!--一级列表-->
                        <li v-else v-for='parent in list' @click='selectGroup(parent.id)'
                            :class='{active: parent.id === startOrClick}' :title="parent.name">
                            {{parent.name}}
                            <span class="icon icon-arrow-right"></span>
                            <ul v-if="parent.id === startOrClick">
                                <li v-if='selectedGroup && selectedGroup.child.length === 0'>{{'common.noData' | t}}</li>
                                <!--二级列表-->
                                <li v-else v-for='child in selectedGroup.child' @click.stop='selectPaper(child)'
                                    :class='{active: child.id === value}' :title="child.name">{{child.name}}
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </transition>
    </div>
</template>
<script type="text/ecmascript-6">
    export default {
        props: {
            value: '',              //二级列表值
            list: Array,            //列表数据
            placeholder: {
                type: String
            },
        },
        data () {
            return {
                groupId: '',        //一级列表ID
                showList: false,    //列表数据loading
            };
        },
        computed: {
            //选中项的名称
            text() {
                if (this.value) {
                    let selectedGroup = this.list.find(group => group.id === this.selectedGroupId);
                    let selectedForm = '';
                    if (selectedGroup && selectedGroup.child) {
                        selectedForm = selectedGroup.child.find(paper => paper.id === this.value);
                    }
                    if (selectedGroup && selectedForm) {
                        return selectedForm.name;
                    }
                    return false;
                }
                return false;
            },
            //列表数据loading
            loading() {
                if (this.list) {
                    return false;
                }
                return true;
            },
            //当前选中一级列表ID
            selectedGroupId(){
                if (this.value) {
                    for (let i = 0; i < this.list.length; i++) {
                        let element = this.list[i].child;
                        let len = element.length;
                        for (let j = 0; j < len; j++) {
                            if (element[j].id === this.value) {
                                return i;
                            }
                        }
                    }
                } else {
                    return 0;
                }
            },
            //当前选中一级列表项
            selectedGroup() {
                return this.list[this.startOrClick];
            },
            //当前选中一级列表ID
            startOrClick() {
                return this.groupId === '' ? this.selectedGroupId : this.groupId; 
            }
        },
        watch: {
            list() {
                if (this.value && this.list.length) {
                    let childList = [];
                    for (let i = 0; i < this.list.length; i++) {
                        let element = this.list[i].child;
                        let len = element.length;
                        for (let j = 0; j < len; j++) {
                            if (element[j].id === this.value) {
                                this.groupId = this.list[i].id;
                                childList = this.list[i] ? this.list[i].child : [];
                            }
                        }
                    }
                    childList.length || this.$emit('noitem');
                }
            }
        },
        methods: {
            //打开/关闭下拉框
            toggle() {
                this.showList = !this.showList;
            },
            //关闭下拉框
            close() {
                this.showList = false;
            },
            /**
             * 选择一级列表
             * @param groupId 选择的一级列表项的ID
             */
            selectGroup(groupId) {
                this.groupId = groupId;
            },
            /**
             * 选择二级列表
             * @param child 选择的二级列表项
             */
            selectPaper(child) {
                this.$emit('input', child.id);
                this.showList = false;
                this.$emit('select', child);
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .cascading-selection {
        display: inline-block;
        position: relative;
        vertical-align: middle;
        label {
            display: inline-block;
            position: relative;
            width: 282px;
            height: $input-field-height - 2px;
            line-height: $input-field-height - 2px;
            border: 1px solid $form-border;
            border-radius: 4px;
            padding-right: 8px;
            cursor: pointer;
            padding-left: 1em;
            &:hover {
                border-color: $light-green;
            }
            .icon {
                float: right;
            }
            .placeholder{
                color: #bfbfbf;
            }
            .text-select-name {
                display:inline-block;
                max-width: 260px;
                overflow: hidden;
                @include ellipsis();
                
            }
        }
        .csedes{
            width: 302px;
            position: absolute;
            left: 0;
            top: 33px;
            background-color: #fff;
            overflow: hidden;
            z-index: 1;
            border-right: 1px solid $form-border;
            border-radius: 4px;
        }
        .drop-down-list {
            display: flex;
            width: 302px;
            background-color: white;
            border: 1px solid $form-border;
            border-radius: 4px;
            position: relative;

            ul {
                width: 50%;
                height: 100%;
                overflow: auto;
                ul {
                    position: absolute;
                    top: 0;
                    right: 0;
                    border-left: 1px solid $form-border;
                }

                li {
                    padding: 0 8px 0 16px;
                    height: $input-field-height;
                    line-height: $input-field-height;
                    @include ellipsis();
                    cursor: pointer;

                    &:hover {
                        background-color: $hover-bg;
                    }

                    .icon {
                        float: right;
                    }
                }
                .active {
                    background-color: $select-bg;

                    &:hover {
                        background-color: $select-bg;
                    }
                }
            }
        }
    }
</style>
