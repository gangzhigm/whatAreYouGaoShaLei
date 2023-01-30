<template>
    <label class="radio" @click="toggle" :class="{disabled, 'text-appended': $slots.default, checked}">
        <svg aria-hidden="true">
            <use v-bind:xlink:href="'#icon-radio' + (checked ? '-check' : '')"></use>
        </svg>
        <slot></slot>
    </label>
</template>
<script type="text/ecmascript-6">
    export default {
        name: 'radio',
        props: {
            value: {
                require: true,
                type: [Number, String, Boolean]
            },
            source: {
                type: [Number, String, Boolean]
            },
            disabled: {
                type: Boolean,
                'default': false
            },
        },
        computed: {
            checked() {
                return this.value === this.source;
            }
        },
        methods: {
            toggle() {
                if (this.disabled) return;
                this.$emit('input', this.source);
                //用于判断选中按钮值的变化
                this.$emit('valChange', this.value);
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../scss/base/variables";
    @import "../scss/base/mixin";

    .radio {
        display: inline-block;
        vertical-align: inherit;
        cursor: pointer;

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
        }

        &:hover {
            color: $light-theme;

            svg {
                fill: currentColor;
            }
        }

        &.checked {
            color: $theme;

            svg {
                fill: currentColor;
                @include box-shadow(0 0 4px rgba(#2ecbb5, .35));
            }
        }

        &.disabled {
            pointer-events: none;

            svg {
                background-color: $content-bg;
            }
        }

        svg {
            vertical-align: middle;
            fill: $form-border;
            border-radius: 100%;
        }

        & + .radio {
            margin-left: 16px;
        }
    }

</style>
