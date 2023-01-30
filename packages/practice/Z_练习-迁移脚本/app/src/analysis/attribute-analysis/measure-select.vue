<template>
    <div class="measure-select" v-blur="close">
        <label class="select-value" @click="open = !open"
               :title="text">
            {{text || $t('common.selectHolder')}}
            <span class="select-icon icon icon-arrow-down"></span>
        </label>
        <transition name="drop">
            <ul class="dropdown-menu" v-if="open">
                <!-- 固定选项"用户数" id === 0 -->
                <li v-for="option in options"
                    :class="{active: option.id === selectedAttr.id, noHover: option.title}">
                    <p v-if="option.title" class="group-title">{{option.title}}</p>
                    <p v-else :title="option.name" @click="chooseAttr(option)" class="option-name">{{option.name}}</p>
                    <svg aria-hidden="true" class="icon-right" v-if="option.id && !option.title">
                        <use xlink:href="#icon-right"></use>
                    </svg>
                    <ul class="second-menu" v-if="option.id"><!-- exclude falsy value -->
                        <li v-for="item in aggreatorOptionsMap[option.attrGenre === 1 ? 1 : 2]"
                            @click="chooseAgg(option, item)"
                            :class="{active:selectedAgg && item.id === selectedAgg.id && option.id === selectedAttr.id}">
                            {{item.name}}
                        </li>
                    </ul>
                </li>
            </ul>
        </transition>
    </div>
</template>
<script type="text/babel">
    import {AGGREATOR_OPTIONS_MAP} from '../chart/chartConfig';

    export default {
        name: 'measure-select',
        props: {
            // 下拉选项组列表
            optionGroups: {
                type: Array,
                required: true
            },
            attrId: [String, Number],
            aggreator: String,
        },
        data() {
            return {
                open: false,
                aggreatorOptionsMap: AGGREATOR_OPTIONS_MAP,
            };
        },
        computed: {
            options() {
                // options当做groups使用 ex: [Aoptions, Boptions, Coptions];
                let options = [];

                this.optionGroups.forEach(group => {
                    options.push({
                        title: group.title,
                        icon: group.icon,
                    });
                    options = options.concat(group.options);
                });

                return options;
            },
            selectedAttr() {
                // fixme 应该使用 key 而不是 id
                return this.options.$getByKey(this.attrId);
            },
            selectedAgg() {
                for (const key in AGGREATOR_OPTIONS_MAP) {
                    const options = AGGREATOR_OPTIONS_MAP[key];
                    const target = options.$getByKey(this.aggreator);
                    if (target) {
                        return target;
                    }
                }
            },
            text() {
                let str = '';
                if (this.selectedAttr) {
                    str += this.selectedAttr.name;
                    // "用户数"是一个固定选项，其 id === 0
                    if (this.selectedAttr.id === 0) {
                        return str;
                    }
                    if (this.selectedAgg) {
                        str += this.$t('eventAnalysis.of') + this.selectedAgg.name;
                    }
                }
                return str;
            }
        },
        methods: {
            close() {
                this.open = false;
            },
            // 一级菜单选择特殊的aggreator: 目前只有"用户数"一个固定选项，其 id === 0
            chooseAttr(option) {
                if (option.id === 0) {
                    this.$emit('select', option);
                    this.open = false;
                }
            },
            // 二级菜单选择 attr、aggreator
            chooseAgg(attr, agg) {
                this.$emit('select', attr, agg);
                this.open = false;
            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../common/scss/base/variables';
    @import "../../common/scss/base/mixin";

    $hover-bg: #f8f9fa;
    .measure-select {
        $height: $input-field-height;
        position: relative;
        display: inline-block;
        vertical-align: middle;
        cursor: pointer;
        color: $color-content;
        min-width: 312px;

        .select-value {
            position: relative;
            display: block;
            @include box-sizing();
            width: 100%;
            min-width: 200px;
            max-width: 400px;
            padding-right: ($input-field-height - 2px);
            line-height: $input-field-height - 2px;
            text-indent: .8em;
            border: 1px solid $form-border;
            border-radius: 4px;
            background-color: white;
            @include user-select(none);
            @include ellipsis();

            &:not(.disabled) {
                cursor: pointer;
            }

            &.disabled {
                cursor: not-allowed;
            }

            &.placeholder {
                color: rgba($color-content, .8);
            }

            &.active {
                border-color: $theme;
                border-bottom-right-radius: 0;
                border-bottom-left-radius: 0;

                .select-icon:before {
                    border-top-color: $theme;
                }
            }
        }

        .select-icon {
            width: $input-field-height - 2px;
            position: absolute;
            top: 0;
            right: 0;
            color: $color-light-content;
        }

        .dropdown-menu {
            position: absolute;
            z-index: $index-menu;
            top: $input-field-height + 4;
            width: 275px;
            background-color: white;
            border: 1px solid $border-color;
            @include border-radius(4px);
            @include box-shadow(0 3px 8px rgba(#8b9daf, .16));
            margin-bottom: 50px;

            .active {
                background-color: $select-bg;
            }

            & > li {
                position: relative;
                height: $input-field-height;
                box-sizing: border-box;
                cursor: pointer;
                user-select: none;
                line-height: $input-field-height;
                margin: 1px 0;

                &:last-child {
                    margin-bottom: 0;
                }

                .icon-right {
                    display: none;
                    position: absolute;
                    right: 8px;
                    top: 0;
                    width: 12px;
                    height: $input-field-height;
                    fill: $color-light-content;
                }

                .option-name {
                    padding: 0 1em;
                    cursor: pointer;
                    width: 170px;
                    @include ellipsis();
                }

                .group-title {
                    background-color: $title-bg;
                    color: $color-light-content;
                    font-weight: bold;
                    @include ellipsis();
                    padding: 0 1em;
                }

                &:hover {
                    &:not(.noHover) {
                        background-color: $hover-bg;
                    }

                    .second-menu,
                    .icon-right {
                        display: block;
                    }
                }

                .second-menu {
                    display: none;
                    position: absolute;
                    left: calc(100% + 3px);
                    top: 0;
                    @include border-radius(4px);
                    background-color: white;
                    @include box-shadow(0 3px 8px rgba(#8b9daf, .16));
                    border: 1px solid $border-color;
                    width: 180px;

                    & > li {
                        height: $input-field-height;
                        padding: 0 1em;

                        &:hover {
                            background-color: $hover-bg;
                        }
                    }
                }
            }
        }
    }

</style>
