<template>
    <div class="attr-select" v-blur="close" :class="{open: show, disabled}">
        <div class="text" @click="toggle" v-if="type !== 'dropList'">
            {{currentText}}
            <span class="select-icon icon icon-arrow-down"></span>
        </div>
        <transition name="drop">
            <ul class="attr-select-list" v-show="show || type === 'dropList'">
                <li v-for="agg in generalAggreators" @click="pick({id: ''}, agg)"
                    :class="{active: aggreator === agg.id}">
                    {{agg.name}}
                </li>
                <li v-for="(attr, index) in numericalOptions"
                    :class="{active: attr.id === attrId}">
                    {{attr.name}}
                    <svg aria-hidden="true" class="icon-right">
                        <use xlink:href="#icon-right"></use>
                    </svg>
                    <ul class="attr-select-aggreator-list">
                        <li v-for="item in NUMERICAL_AGGREATORS"
                            :class="{active: attr.id === attrId && aggreator === item.id}"
                            @click="pick(attr, item)">
                            {{item.name}}
                        </li>
                    </ul>
                </li>
                <li class="expand" v-if="noneNumericalOptions.length && !expanded" @click="expanded = true">{{'eventAnalysis.more' | t}}...</li>
                <li v-if="noneNumericalOptions.length && expanded"
                    v-for="(attr, index) in noneNumericalOptions"
                    :class="{active: attr.id === attrId}">
                    {{attr.name}}
                    <svg aria-hidden="true" class="icon-right">
                        <use xlink:href="#icon-right"></use>
                    </svg>
                    <ul class="attr-select-aggreator-list">
                        <li v-for="item in NONE_NUMERICAL_AGGREATORS"
                            :class="{active: attr.id === attrId && aggreator === item.id}"
                            @click="pick(attr, item)">
                            {{item.name}}
                        </li>
                    </ul>
                </li>
            </ul>
        </transition>
    </div>
</template>
<script>
    import { translate } from '@/locales';

    export const GENERAL_AGGREATORS = [
            {id: 'general', name: translate('eventAnalysis.allTimes')},
            {id: 'unique', name: translate('eventAnalysis.userNumber')},
            {id: 'average', name: translate('eventAnalysis.eachTime')}
        ],
        NUMERICAL_AGGREATORS = [
            {id: 'uniqAvg', name: translate('eventAnalysis.eachValue')},
            {id: 'sum', name: translate('eventAnalysis.allValue')},
            {id: 'max', name: translate('eventAnalysis.maxValue')},
            {id: 'min', name: translate('eventAnalysis.minValue')},
            {id: 'avg', name: translate('eventAnalysis.averageValue')}
        ],
        NONE_NUMERICAL_AGGREATORS = [
            {id: 'uniqCount', name: translate('eventAnalysis.deduplication')}
        ];

    export default {
        name: 'attr-select',
        props: {
            options: Array,
            attrId: [String, Number],
            aggreator: String,
            disabled: Boolean,
            measureType: String,
            type: {
                type: String,
                default: ''
            },
        },
        data() {
            return {
                show: false,
                expanded: false,
                NUMERICAL_AGGREATORS,
                NONE_NUMERICAL_AGGREATORS,
            };
        },
        computed: {
            generalAggreators() {
                return this.measureType === 'evaluate' ? GENERAL_AGGREATORS.slice(1, 2) : GENERAL_AGGREATORS;
            },
            numericalOptions() {
                return this.options.filter(option => option.attrGenre === 1 || option.attrGenre === 3);
            },
            noneNumericalOptions() {
                return this.options.filter(option => option.attrGenre !== 1 && option.attrGenre !== 3);
            },
            currentText() {
                const attr = this.options.find(attr => attr.id === this.attrId);
                const aggreator = this.generalAggreators
                    .concat(this.NUMERICAL_AGGREATORS, this.NONE_NUMERICAL_AGGREATORS)
                    .find(o => o.id === this.aggreator);
                return (attr ? attr.name : '') + (aggreator ? aggreator.name : '');
            }
        },
        methods: {
            close() {
                this.show = false;
            },
            toggle() {
                if (this.disabled) return;
                this.show = !this.show;
            },
            pick(attr = {id: ''}, aggreator = {id: ''}) {
                if (attr.id !== this.attrId || aggreator.id !== this.aggreator) {
                    this.$emit('update', {attr, aggreator: aggreator.id});
                }
                this.close();
            }
        }
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .attr-select {
        display: inline-block;
        vertical-align: top;
        position: relative;
        height: $input-field-height;
        min-width: 12em;
        white-space: nowrap;
        color: $color-content;
        cursor: pointer;
        background-color: white;
        @include user-select(none);
        @include border-radius(4px);

        &.open {
            .text {
                border-color: $theme;
                @include box-shadow(0 1px 3px rgba($theme, .35));
                &:after {
                    border-top-color: $border-color;
                }
            }
        }

        &.disabled {
            cursor: not-allowed;
        }

        .text {
            padding: 0 2em 0 .8em;
            line-height: $input-field-height - 2px;
            height: $input-field-height - 2px;
            border: 1px solid $form-border;
            @include border-radius(4px);
            .select-icon {
                height: $input-field-height;
                line-height: $input-field-height;
                width: $input-field-height - 2px;
                position: absolute;
                top: 0;
                right: 0;
                color: $color-light-content;
                text-align: center;
            }

            &:hover {
                border-color: $theme;
            }
        }

        .attr-select-list {
            display: block;
            position: relative;
            z-index: $index-menu;
            line-height: $input-field-height;
            background-color: white;
            text-align: left;
            border: 1px solid $border-color;
            top: 4px;
            @include border-radius(4px);
            @include box-shadow(0 3px 8px rgba(#8b9daf, .16));

            li {
                position: relative;
                padding: 0 1em;
                @include transition();
                line-height: $input-field-height;

                &:hover {
                    background-color: $hover-bg;
                    .attr-select-aggreator-list,
                    .icon-right {
                        display: block;
                    }
                }

                &.expand {
                    color: $theme;
                    cursor: pointer;
                    font-style: italic;
                }

                &.active {
                    background-color: $select-bg;
                }

                &:first-child {
                    border-top-left-radius: 4px;
                    border-top-right-radius: 4px;
                }

                &:last-child {
                    border-bottom-left-radius: 4px;
                    border-bottom-right-radius: 4px;
                }

                .icon-right {
                    position: absolute;
                    display: none;
                    right: 8px;
                    top: 0;
                    width: 12px;
                    height: 32px;
                    fill: $color-light-content;
                }

            }
        }

        .attr-select-aggreator-list {
            display: none;
            position: absolute;
            left: calc(100% + 3px);
            top: 0;
            @include border-radius(4px);
            background-color: white;
            @include box-shadow(0 3px 8px rgba(#8b9daf, .16));
            border: 1px solid $border-color;
        }
    }
</style>
