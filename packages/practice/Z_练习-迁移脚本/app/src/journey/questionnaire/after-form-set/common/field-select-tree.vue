<template>
    <div class='journey-picker' v-blur="close">
        <label @click="toggle">
            <span class="journey-name" :title="text">{{text}}</span>
            <span class="select-icon icon icon-arrow-down"></span>
        </label>
        <transition name="drop">
            <div v-if='showList' class='drop-down-list'>
                <template>
                    <ul>
                        <li v-if='groupList.length === 0'>{{'material.noGroup' | t}}</li>
                        <li v-else v-for='group in groupList' @click='selectGroup(group)'
                            :title='group.name'
                            :class='{active: group.id === groupId}'>
                            <span class="group-name">{{group.name}}</span>
                            <span class="icon icon-arrow-right"></span>
                        </li>
                    </ul>
                    <ul>
                        <!--<input type="text" v-model="searchJourneyName" :placeholder="$t('common.selectKeywordHolder')"-->
                               <!--@keydown.enter="selectGroup(groupId, 1)"/>-->
                        <!--<span class="icon icon-search"  @click="selectGroup(groupId)"></span>-->
                        <li v-if='childList.length === 0'>{{'common.noData' | t}}</li>
                        <li v-else v-for='paper in childList' @click='selectChild(paper)'
                            :class="{active: paper.id === childId}"
                            :title='paper.name'>{{paper.name}}
                        </li>
                    </ul>
                </template>
            </div>
        </transition>
    </div>
</template>
<script type="text/ecmascript-6">
    export default {
        name: 'field-select-tree',
        props: {
            value: String,
            options: Array
        },
        data() {
            return {
                showList: false,
                groupList: [],
                childList: [],
                groupId: -1,
                childId: -1,
                text: '',
                searchJourneyName: '',
            };
        },
        mounted() {
            this.groupList = this.options;
            if (this.value) {
                this.groupId = ~~this.value.split(',')[0];
                this.childList = this.groupList.$getByKey(this.groupId).childList;
                if (this.childList[0].name !== '全部') {
                    this.childList.unshift({name: '全部'});
                }
                this.childList.forEach((elm,index) =>{
                    elm.id = index + 1;
                });
                this.childId = ~~this.value.split(',')[1];
                this.text = this.childList.$getByKey(this.childId).name;
            }
        },
        methods: {
            toggle() {
                this.showList = !this.showList;
            },
            close() {
                this.showList = false;
            },
            selectGroup(group) {
                if (group.childList[0].name !== '全部') {
                    group.childList.unshift({name: '全部'});
                }
                group.childList.forEach((elm,index) =>{
                    elm.id = index + 1;
                });
                this.childList = group.childList;
                this.groupId = group.id;
            },
            selectChild(child) {
                this.text = child.name;
                this.childId = child.id;
                let result = {
                    id: `${this.groupId},${child.id}`,
                    value: `${this.groupList.$getByKey(this.groupId).name},${child.name}`
                };
                this.$emit('input', result);
                this.showList = false;
            },
        },
        filters: {
            ellipsis: function (value, n) {
                return value.length > n
                    ? value.substring(0, n - 1) + ' ..'
                    : value;
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .journey-picker {
        display: inline-block;
        vertical-align: middle;
        position: relative;
        width: 310px;
        .journey-name {
            display: inline-block;
            width: 180px;
            @include ellipsis();
        }

        label {
            display: block;
            position: relative;
            width: 282px;
            height: $input-field-height - 2px;
            line-height: $input-field-height - 2px;
            border: 1px solid $border-color;
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
        }
        .drop-down-list {
            position: absolute;
            z-index: 1;
            display: flex;
            left: 0;
            top: 100%;
            margin-top: 4px;
            width: 302px;
            height: 160px;
            background-color: white;
            border: 1px solid $border-color;
            border-radius: 4px;

            ul {
                flex: 1;
                height: 100%;
                overflow: auto;
                position: relative;

                + ul {
                    border-left: 1px solid $border-color;
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
                    .group-name {
                        display: inline-block;
                        width: 88px;
                        @include ellipsis();
                    }
                }
                .active {
                    background-color: $select-bg;

                    &:hover {
                        background-color: $select-bg;
                    }
                }
            }
            input {
                height: $input-field-height;
                padding: 0 8px 0 28px;
                width: calc(100% - 38px);
                border: none;
                background-color: transparent;

                &:hover {
                    background-color: $select-bg;

                    & + .icon-search {
                        background-color: $select-bg;
                    }
                }

                &:focus {
                    background-color: #fff;

                    & + .icon-search {
                        background-color: #fff;
                    }
                }
            }
            .icon-search {
                $offset: ($input-field-height - 14px) / 2;
                position: absolute;
                width: 26px;
                height: $input-field-height - 2px;
                line-height: $input-field-height;
                text-align: center;
                left: 1px;
                top: 1px;
                background-color: transparent;
            }
        }
    }
</style>
