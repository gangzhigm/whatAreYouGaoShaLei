<template>
    <div class="group-tree-multi" v-blur="closeDropBox" @click.stop="groupSelectShow = !groupSelectShow">
        <div class="select-text">
            <span v-if="!treeActiveArr.length">{{placeHolder}}</span>
            <span class="value-item" v-for="(option,index) in treeActiveItemArr" :key="option.id" :title="option.name">
                {{option.name}}
                <button ref="button" tabindex="-1" class="icon icon-close" @click.stop="delGroup(index)"></button>
            </span>
            <span class="select-icon icon icon-arrow-down"></span>
        </div>
        <transition name="drop">
            <div class="search-tree-wrapper" v-if="groupSelectShow" @click.stop>
                <search-tree :searchTreeData="groupList"
                    :max="max"
                    :multi="true"
                    :multiArr="treeActiveArr"
                    @getTreeArray="changeGroup"
                    :action="false"
                    :levelStage="true">
                </search-tree>
            </div>
        </transition>
    </div>
</template>

<script type="text/ecmascript-6">
export default {
    name: 'group-tree-multi',
    props: {
        // 分组数据
        groupList: {
            type: Array,
            required: true
        },
        placeHolder: {
            type: String,
            default: function () {
                return this.$t('common.selectHolder');
            }
        },
        // 最多可选几项
        max: {
            type: [Number, String],
            default: Infinity
        },
    },
    data() {
        return {
            // 分组选择器显隐
            groupSelectShow: false,
            // 当前选中的分组Ids
            treeActiveArr: [],
            treeActiveItemArr: [],
        };
    },
    methods: {
        // 选择分组
        changeGroup(arr) {
            this.treeActiveArr = arr;
            this.$emit('changeArr', this.treeActiveArr);
            this.treeActiveItemArr = [];
            this.getItemArr(this.groupList);
        },
        // 遍历递归数据
        getItemArr(dt) {
            dt.forEach(ev => {
                if (this.treeActiveArr.includes(ev.id)) {
                    this.treeActiveItemArr.push(ev);
                }
                if (!ev.childs || ev.childs.length <= 0) return;
                this.getItemArr(ev.childs);
            });
        },
        // 删除已选分组
        delGroup(index) {
            let groupArr = this.treeActiveItemArr.slice();
            groupArr.splice(index, 1);
            this.treeActiveItemArr = groupArr;
            this.treeActiveArr = this.treeActiveItemArr.map(item => item.id);
            this.$emit('changeArr', this.treeActiveArr);
        },
        // 关闭下拉框
        closeDropBox() {
            this.groupSelectShow = false;
        },
    }
};
</script>

<style lang="scss">
    @import '../scss/base/variables';
    @import '../scss/base/mixin';

    .group-tree-multi {
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
            min-height: 32px;
            line-height: $option-height - 2px;
            border: 1px solid $form-border;
            text-indent: .8em;
            @include border-radius($border-radius);
            @include user-select(none);
            background-color: white;
            overflow: hidden;

            .value-item {
                float: left;
                position: relative;
                max-width: 245px;
                display: inline-block;
                border: 1px solid #826dee;
                margin: 4px 2px;
                padding: 0 20px 0 5px;
                border-radius: 3px;
                cursor: pointer;
                @include transition();
                background-color: #f2f0ff;
                color: $purple;
                line-height: 20px;
                @include ellipsis();

                &:hover {
                    background-color: #dbd5fb;
                }

                button {
                    position: absolute;
                    right: 0;
                    top: 0;
                    padding: 0 3px;
                    cursor: pointer;
                    border: 1px solid transparent;
                    line-height: 18px;
                    border-bottom-right-radius: 3px;
                    border-top-right-radius: 3px;
                    color: $purple;
                    background-color: transparent;

                    &:hover {
                        background-color: #ef6266;
                        color: white;
                    }
                }
            }

            .select-icon {
                position: absolute;
                right: 8px;
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
</style>