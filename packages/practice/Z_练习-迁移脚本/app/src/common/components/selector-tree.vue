<template>
    <div class='selector-tree' v-blur="cancelOpen" @click="inputFocus"
         :class="{'disabled-content':disabled && checkedItem.length===0}">
        <div class="value-item " v-for="(option,index) in checkedItem" :class='{disabledLabel:disabled}'>
            {{option.name}}
            <button ref="button" tabindex="-1" class="icon icon-close"
                    @click="delItem(index)" :disabled='disabled' :class='{disabledButton:disabled}'></button>
        </div>
        <span v-if="checkedItem.length === 0" class="placeholder">{{placeholder ? placeholder : $t('common.selectHolder')}}</span>
        <div class="keyword-input inputType">
            <input ref="inputVip" :disabled='disabled' style='width:110px'
                   @focus="open" @keydown.delete="deleteSelect" :value="''"
                   aria-autocomplete="none" class='input-label' maxlength="0">
            <transition name='drop'>
                <div v-show='isShowSelection' class='selector-content'>
                    <template v-if="!loading">
                        <div class="selector-search">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-search"></use>
                            </svg>
                            <input type="text" v-model.trim="keyword" :placeholder="$t('components.filter')"
                                   :maxlength="maxlength"
                                   class='search-value' @click.stop>
                        </div>
                        <ul v-for='(list,index) in filteredGroupList' class='label-group' :key='index'>
                            <!-- 一级分组一 -->
                            <li class='groupLevel1'>
                                <button type="button" class="toggle-action-btn"
                                        :class="{open: openViews.clusterIds.includes(list.id)}"
                                        @mouseenter="toggleCluster(list.id)">
                                    <svg aria-hidden="true">
                                        <use xlink:href="#icon-right"></use>
                                    </svg>
                                </button>
                                <span class='level-span level1-span'> {{list.name}} </span>
                            </li>
                            <!-- 二级标签 -->
                            <draggable v-if="openViews.clusterIds.includes(list.id)">
                                <li class='groupLevel2' v-for='(label,index) in list.labels' :key='index'>
                                    <checkbox :source="label" v-model="checkedItem"
                                              :disabled="label.disabled || (checkedItem.length >= max && !checkedItem.includes(label))">
                                        <span class='level-span level2-span'> {{label.name}} </span>
                                    </checkbox>
                                </li>
                                <li>
                                    <ul v-for='(group,index) in list.childs' :key='index'>
                                        <!-- 二级分组 -->
                                        <li class='groupLevel2'>
                                            <button type="button" class="toggle-action-btn"
                                                    :class="{open: openViews.clusterIds.includes(group.id)}"
                                                    @mouseenter="toggleCluster(group.id)">
                                                <svg aria-hidden="true">
                                                    <use xlink:href="#icon-right"></use>
                                                </svg>
                                            </button>
                                            <span class='level-span group2-span'> {{group.name}} </span>
                                        </li>
                                        <!-- 三级标签 -->
                                        <draggable v-if="openViews.clusterIds.includes(group.id)">
                                            <li>
                                                <ul v-for='(labelThree,index) in group.labels' :key='index'>
                                                    <li class='groupLevel3'>
                                                        <checkbox :source="labelThree" v-model="checkedItem"
                                                                  :disabled="labelThree.disabled || (checkedItem.length >= max && !checkedItem.includes(labelThree))">
                                                            <span class='level-span level3-span'> {{labelThree.name}} </span>
                                                        </checkbox>
                                                    </li>
                                                </ul>
                                            </li>
                                            <!-- 三级分组 -->
                                            <li class='groupLevel3'>
                                                <ul v-for='(groupThree,index) in group.childs' :key='index'>
                                                    <li>
                                                        <button type="button" class="toggle-action-btn"
                                                                @mouseenter="toggleCluster(groupThree.id)"
                                                                :class="{open: openViews.clusterIds.includes(groupThree.id)}">
                                                            <svg aria-hidden="true">
                                                                <use xlink:href="#icon-right"></use>
                                                            </svg>
                                                        </button>
                                                        <span class='level-span group3-span'>
                                                        {{groupThree.name}}
                                                    </span>
                                                    </li>
                                                    <!-- 四级标签 -->
                                                    <draggable v-if="openViews.clusterIds.includes(groupThree.id)">
                                                        <li>
                                                            <ul v-for='(labelFour,index) in groupThree.labels'
                                                                :key='index'>
                                                                <li class='groupLevel4'>
                                                                    <checkbox :source="labelFour" v-model="checkedItem"
                                                                              :disabled="labelFour.disabled || (checkedItem.length >= max && !checkedItem.includes(labelFour))">
                                                                    <span class='level-span level4-span'>
                                                                        {{labelFour.name}}
                                                                    </span>
                                                                    </checkbox>
                                                                </li>
                                                            </ul>
                                                            <ul v-if='groupThree.labels.length===0'>
                                                                <li class='disabled groupThree'>{{'components.noTags' |
                                                                    t}}
                                                                </li>
                                                            </ul>
                                                        </li>
                                                        <!-- 四级分组 -->
                                                        <li class='groupLevel4'>
                                                            <ul v-for='(groupLast,index) in groupThree.childs'
                                                                :key='index'>
                                                                <li>
                                                                    <button type="button" class="toggle-action-btn"
                                                                            @mouseenter="toggleCluster(groupLast.id)"
                                                                            :class="{open: openViews.clusterIds.includes(groupLast.id)}">
                                                                        <svg aria-hidden="true">
                                                                            <use xlink:href="#icon-right"></use>
                                                                        </svg>
                                                                    </button>
                                                                    <span class='level-span group4-span'>{{groupLast.name}}</span>
                                                                </li>
                                                                <draggable
                                                                        v-if="openViews.clusterIds.includes(groupLast.id)">
                                                                    <li>
                                                                        <ul v-for='(labelLast,index) in groupLast.labels'
                                                                            :key='index'>
                                                                            <li class='groupLevel5'>
                                                                                <checkbox :source="labelLast"
                                                                                          v-model="checkedItem"
                                                                                          :disabled="labelLast.disabled || (checkedItem.length >= max && !checkedItem.includes(labelLast))">
                                                                                    <span class='level-span level5-span'>{{labelLast.name}}</span>
                                                                                </checkbox>
                                                                            </li>
                                                                        </ul>
                                                                        <ul v-if='groupLast.labels.length===0'>
                                                                            <li class='disabled groupThree'>
                                                                                {{'components.noTags' | t}}
                                                                            </li>
                                                                        </ul>
                                                                    </li>
                                                                </draggable>
                                                            </ul>
                                                        </li>
                                                    </draggable>
                                                </ul>
                                                <ul v-if='group.childs.length===0 && group.labels.length===0'>
                                                    <li class='disabled'>{{'components.noTags' | t}}</li>
                                                </ul>
                                            </li>
                                        </draggable>
                                    </ul>
                                    <ul v-if='list.childs.length===0 && list.labels.length===0'>
                                        <li class='disabled groupOne'>{{'components.noTags' | t}}</li>
                                    </ul>
                                </li>
                            </draggable>
                        </ul>
                        <ul v-if="filteredGroupList.length === 0 && keyword === ''">
                            <li class='disabled'>{{'components.noTags' | t}}</li>
                        </ul>
                        <div v-if="keyword !== '' && filteredGroupList.length === 0" class='no-search-result'>
                            {{'components.noresult' | t}}
                        </div>
                    </template>
                    <inline-loading v-else/>
                </div>
            </transition>
        </div>
    </div>
</template>
<script type="text/babel">

    import cloneDeep from 'lodash/cloneDeep';

    export default {
        name: 'selector-tree',
        props: {
            value: {
                type: Array,
                required: true
            },
            // 下拉列表项
            options: {
                type: Array,
                required: true,
            },
            search: {
                type: Boolean,
                required: false
            },
            disabled: {
                type: Boolean,
                required: false,
                default: false,
            },
            max: {
                type: Number,
                default: Infinity
            },
            // 选项加载中
            loading: {
                type: Boolean,
                default: false
            },
            maxlength: {
                type: Number,
                default: 60
            },
            placeholder: {
                type: String,
            },
        },
        watch: {
            options(value) {
                this.groupList = [...value];
            }
        },
        computed: {
            checkedItem: {
                get: function () {
                    return this.value;
                },
                set: function (val) {
                    this.$emit('checkOptions', val);
                }
            },
            filteredGroupList() {
                const optionsCopy = cloneDeep(this.options);
                let filterList = [];
                const filterMethod = (groupList, targetGroup) => {
                    if (this.keyword === '') {
                        filterList = groupList;
                    } else {
                        groupList.map(group => {
                            let filteredGroup = Object.assign({}, group, {labels: [], childs: []});
                            if (group.labels) {
                                filteredGroup.labels =
                                    group.labels.filter(label => label.name.indexOf(this.keyword) !== -1);
                            }

                            if (group.childs && group.childs.length > 0) {
                                filterMethod(group.childs, filteredGroup.childs);
                            }
                            if (filteredGroup.labels.length > 0 || filteredGroup.childs.length > 0) {
                                targetGroup.push(filteredGroup);
                            }
                        });
                    }
                };
                filterMethod(optionsCopy, filterList);
                return filterList;
            }
        },
        data() {
            return {
                // 各个分组的展开、收起状态
                openViews: {
                    clusterIds: [],
                },
                keyword: '',
                groupList: [],
                isShowSelection: false,
            };
        },
        methods: {
            //分群分组列表展示
            toggleCluster(clusterId) {
                //分组中的分群的userGroupClusterId是否有和分组id相同的
                const index = this.openViews.clusterIds.findIndex(id => id === clusterId);
                index === -1
                    ? this.openViews.clusterIds.push(clusterId)
                    : this.openViews.clusterIds.splice(index, 1);
            },
            cancelOpen() {
                this.isShowSelection = false;
                this.keyword = '';
            },
            open() {
                this.isShowSelection = true;
            },
            //会员标签点击时获取焦点
            inputFocus() {
                if (this.$refs.inputVip.focus) {
                    this.$refs.inputVip.focus();
                } else {
                    this.$refs.inputVip.$el.focus();
                }
            },
            // 点击删除会员标签存在的选项
            delItem(index) {
                let value = this.checkedItem.slice();
                value.splice(index, 1);
                this.checkedItem = value;
                if (this.$refs.inputVip.focus) {
                    this.$refs.inputVip.focus();
                } else {
                    this.$refs.inputVip.$el.focus();
                }
            },
            // 删除已选中会员标签的选项（delete按键）
            deleteSelect(e) {
                if (!e.isComposing && this.filteredGroupList.length > 0) {
                    this.checkedItem.pop();
                }
            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .selector-tree {
        position: relative;
        display: inline-flex;
        flex-wrap: wrap;
        min-width: $form-input-width;
        vertical-align: middle;
        border: 1px solid $form-border;
        padding: 2px 5px 2px 0;
        border-radius: 4px;
        align-items: center;
        cursor: text;
        background-color: white;
        max-width: 600px;
        @include box-sizing();

        &.disabled-content {
            background-color: $content-bg;
        }

        .disabledLabel {
            background-color: $content-bg;
            color: rgb(84, 84, 84);
            border: 1px solid $border-color;

            &:hover {
                background-color: $content-bg;
            }

            .disabledButton {
                background-color: $content-bg;
                color: rgb(84, 84, 84);

                &:hover {
                    background-color: $content-bg;
                    color: rgb(84, 84, 84);
                }
            }
        }

        .inputType {
            position: relative;
            display: inline-block;
            line-height: 18px;
            margin: 3px 0;

            .input-label {
                width: 50px;
                height: 16px;
                border: 1px solid transparent;
                background-color: inherit;
                text-indent: 5px;
            }
        }

        .value-item {
            display: inline-block;
            border: 1px solid #826dee;
            margin: 2px;
            padding-left: 5px;
            border-radius: 3px;
            cursor: pointer;
            @include transition();
            background-color: #f2f0ff;
            color: $purple;
            word-break: break-word;
            line-height: 18px;

            &:hover {
                background-color: #dbd5fb;
            }

            button {
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

        .selector-content {
            position: absolute;
            top: 100%;
            margin-top: 4px;
            border: 1px solid $form-border;
            z-index: $index-menu;
            background-color: white;
            border-radius: 4px;
            min-height: 160px;
            max-height: 300px;
            width: 220px;
            overflow: auto;
        }

        .selector-search {
            width: 100%;
            height: 32px;
            background-color: $title-bg;
            display: flex;

            svg {
                width: 16px;
                height: 16px;
                margin: ($input-field-height - 16px)/2;
                fill: $color-light-content;
            }

            .search-value {
                flex: 1;
                border: none;
                height: $input-field-height;
                background-color: transparent;
            }
        }

        .label-group {
            margin-left: 8px;
            margin-top: 4px;

            .level-span {
                display: inline-block;
                vertical-align: top;
                @include ellipsis();
            }

            .groupLevel1 {
                line-height: 24px;

                .level1-span {
                    max-width: 160px;
                }

            }

            li {
                line-height: 24px;
                white-space: nowrap;

                .checkbox {
                    margin-right: 8px;
                }
            }
        }

        .disabled {
            color: $disabled;
            font-style: italic;
            line-height: 24px;
        }

        .groupOne {
            margin-left: 20px;
        }

        .groupThree {
            margin-left: 20px;
        }

        .groupLevel2 {
            margin-left: 24px;
            position: relative;

            .level2-span,
            .group2-span {
                max-width: 140px;
            }
        }

        .groupLevel3 {
            margin-left: 50px;

            .group3-span,
            .level3-span {
                max-width: 110px;
            }


        }

        .groupLevel4 {
            margin-left: 30px;

            .group4-span,
            .level4-span {
                max-width: 90px;
            }
        }

        .groupLevel5 {
            margin-left: 24px;

            .level5-span {
                max-width: 70px;
            }
        }

        .toggle-action-btn {
            position: relative;
            width: 16px;
            height: 16px;
            margin: 4px 8px 4px 0;
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

        .no-search-result {
            color: $disabled;
            font-style: italic;
            height: 28px;
            line-height: 28px;
            padding-left: 16px;
        }
        .placeholder {
            position: absolute;
            left: 10px;
            line-height: 24px;
            color: $disabled;
        }
        // }
    }
</style>
