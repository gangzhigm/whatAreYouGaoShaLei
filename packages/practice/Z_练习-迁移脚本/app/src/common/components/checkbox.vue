<template>
    <label class="checkbox" @click="toggle" :class="{disabled, 'text-appended': $slots.default, checked}">
        <svg aria-hidden="true">
            <use v-bind:xlink:href="'#icon-checkbox' + (checked ? '-check' : '')"></use>
        </svg>
        <slot></slot>
    </label>
</template>
<script type="text/ecmascript-6">
    export default {
        name: 'checkbox',
        props: {
            value: {
                type: [Array, Boolean, Number]
            },
            source: null,
            max: {
                type: [Number, String],
                default: Infinity
            },
            disabled: {
                type: Boolean,
                'default': false
            }
        },
        computed: {
            noSource() {
                return typeof this.source === 'undefined';
            },
            checked() {
                if (this.value instanceof Array) {
                    if (this.source && this.source.id) {
                        return this.value.findIndex((item) => item.id === this.source.id) !== -1;
                    }
                    return this.value.includes(this.source);
                } else if (typeof this.value === 'number') {
                    if (this.noSource) {
                        // 不传入 source 时，checkbox 在 0, 1 之间切换
                        return this.value === 1;
                    }
                    return this.value === this.source;
                } else if (typeof this.value === 'boolean') {
                    return this.value;
                }
            }
        },
        methods: {
            toggle() {
                if (this.disabled) return;
                if (this.value instanceof Array) {
                    let valueCopy = this.value.slice();
                    let sourceIndex = -1;
                    if (this.source && this.source.id) {
                        sourceIndex = this.value.findIndex((item) => item.id === this.source.id);
                    } else {
                        sourceIndex = this.value.indexOf(this.source);
                    }
                    if (sourceIndex === -1 && this.value.length >= Number(this.max)) {
                        this.$toast(this.$t('common.mostSelectA') + this.max + this.$t('common.mostSelectB'), 'warn');
                        return;
                    }
                    sourceIndex === -1 ? valueCopy.push(this.source) : valueCopy.splice(sourceIndex, 1);

                    this.$emit('input', valueCopy);
                    this.$emit('source', this.source);
                } else if (typeof this.value === 'number') {
                    if (this.noSource) {
                        // 不传入 source 时，checkbox 在 0, 1 之间切换
                        this.$emit('input', Number(!this.value));
                    } else {
                        this.$emit('input', Number(this.source));
                    }
                } else if (typeof this.value === 'boolean') {
                    this.$emit('input', !this.value);
                }
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../scss/base/variables";
    @import "../scss/base/mixin";

    .checkbox {
        display: inline-block;
        vertical-align: inherit;
        cursor: pointer;
        @include transition(color .2s ease);

        &:not(.tiny) svg {
            width: 14px;
            height: 14px;
        }

        &.tiny svg {
            width: 12px;
            height: 12px;
        }

        &.text-appended svg {
            margin-right: 1px;
            margin-top: -1px;
        }

        &:not(.disabled):hover {
            color: $light-theme;

            svg {
                fill: $theme;
            }
        }

        &.checked {
            color: $theme;

            svg {
                fill: $theme;
            }

            &:not(.disabled) svg {
                @include box-shadow(0 0 4px rgba(#2ecbb5, .35));
            }
        }

        &.disabled {
            cursor: not-allowed;

            &:not(.checked) svg {
                background-color: $content-bg;
            }
        }

        svg {
            vertical-align: middle;
            fill: $form-border;
            @include transition(fill .2s ease);
        }
    }

</style>
