<!--单选tree-->
<template>
    <div class="base-tree">
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
            <!--根目录节点不能进行选择-->
            <span class="t-title" v-if="parentSelect==false && item.parentId==0" :title="item.title">
                {{ item.title}}</span>
            <!--非根目录节点能进行选择-->
            <span class="t-title" @click="handleTitleClick(item)" :class="{'active': item.checked}"
                  v-if="parentSelect" :title="item.title">
                 <svg aria-hidden="true">
                    <use v-bind:xlink:href="'#icon-radio' + (item.checked ? '-check' : '')"></use>
                </svg>
                {{ item.title}}</span>

            <div v-if="item.children" class="children-item" v-show="item.spread">
                <base-tree :list="item.children" @selectItem="handleClick"></base-tree>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'BaseTree',
        props: {
            list: Array,
            parentSelect: {
                type: Boolean,
                'default': true
            },
        },
        data() {
            return {
                arrow: 'arrow',
            };
        },
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
            handleTitleClick: function (item) {
                //初始化
                this.initDt(this.list);
                item.checked = true;
                this.$emit('selectItem', item);
            },
            handleClick: function (item) {
                this.handleTitleClick(item);
            }
        },
        components: {}
    };
</script>

<style type="text/css" lang="scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';

    .base-tree {
        width: 100%;
        .parent, .children-item {
            line-height: 30px;
            font-size: 13px;
            white-space: nowrap;
            width: 100%;
        }
        .parent span {
            cursor: pointer;
            vertical-align: middle;
        }
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
                margin-top: 7px;
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
            .t-title {
                width: 95%;
                display: inline-block;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                svg {
                    width: 14px;
                    height: 14px;
                    vertical-align: sub;
                    fill: $form-border;
                    border-radius: 100%;
                }
            }
            .active {
                color: $green;
                svg {
                    fill: $green;
                }
            }
        }
        .edit-wrapper {
            display: inline-block;
        }
        .edit {
            padding: 0 2px;
        }
        .children-item {
            padding-left: 25px;
        }
    }
</style>
