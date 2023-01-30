<!--发送通道title树形图-->
<template>
    <div class="department-title-tree">
        <div class="department" v-for="item in list">
            <div class="department-list">
                <ul class="department-left-list">
                    <li>
                        <button v-if="item.children && item.children.length>0"
                                :class="[item.spread? 'open':'']"
                                type="button" class="toggle-action-btn" @click="toggle(item)">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-right"></use>
                            </svg>
                        </button>
                        <span v-else  class="toggle-action"></span>
                        <p class="department-name" :class="{'active': item.checked}" :title="item.departmentName" :id="'id'+item.departmentName">
                            {{item.departmentName}}</p>
                    </li>
                </ul>
            </div>
            <div v-if="item.children" class="children-item" v-show="item.spread">
                <span></span>
                <department-tree :list="item.children" @selectItem="handleClick"></department-tree>
            </div>
            <div>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'departmentTree',
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
                belowHeight: ''
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
            },
            toggle(item){
                item.spread = !item.spread;
            },
        },
    };
</script>

<style type="text/css" lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .department-title-tree {
        .department, .children-item {
            line-height: 40px;
            font-size: 13px;
            white-space: nowrap;
            width: 100%;
        }
        .department span {
            cursor: pointer;
            vertical-align: middle;
        }
        .department {
            .department-list {
                height: 40px;
                line-height: 40px;
                .department-left-list {
                    padding-left: 10px;
                    background-color: white;
                    box-sizing: border-box;
                    @include clearfix();
                    li {
                        float: left;
                        .toggle-action-btn {
                            position: relative;
                            width: 16px;
                            height: 16px;
                            margin-top: 12px;
                            vertical-align: top;
                            border: none;
                            padding: 0;
                            border-radius: 100%;
                            background-color: $form-border;
                            @include transition();
                            float: left;
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

                        .toggle-action {
                            position: relative;
                            width: 16px;
                            height: 16px;
                            margin-top: 12px;
                            vertical-align: top;
                            padding: 0;
                            float: left;
                        }
                        .department-name {
                            padding-left: 4px;
                            max-width: 160px;
                            overflow: hidden;
                            @include ellipsis();
                        }
                        .active {
                            color: $green;
                            svg {
                                fill: $green;
                            }
                        }
                    }
                }
            }
        }
        .children-item {
            padding-left: 20px;
            box-sizing: border-box;
        }
    }
</style>