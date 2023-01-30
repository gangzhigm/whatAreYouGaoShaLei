<template>
    <label class="icon checkbox" ref="checkbox" @click.stop="toggle"
           :class="[{disabled}, checked ? 'icon-checkbox-check' : 'icon-checkbox']">
        <slot></slot>
    </label>
</template>
<script type="text/ecmascript-6">
    export default {
        name: 'checkbox',
        props: {
            value: {
                type: [Array, Boolean]
            },
            source: {
                'default': false
            },
            disabled: {
                type: Boolean,
                'default': false
            }
        },
        computed: {
            checked() {
                if (this.value instanceof Array) {
                    let target = typeof this.source === 'object' ? this.source.id : this.source;
                    return this.value.map(value => typeof value === 'object' ? value.id : value).includes(target);
                }
                return this.value;
            }
        },
        methods: {
            toggle() {
                if (this.disabled) return;
                if (this.value instanceof Array) {
                    let target = typeof this.source === 'object' ? this.source.id : this.source;
                    let value = this.value.map(value => typeof value === 'object' ? value.id : value);
                    let index = value.indexOf(target),
                        valueCopy = this.value.slice();

                    index === -1 ? valueCopy.push(this.source) : valueCopy.splice(index, 1);

                    this.$emit('input', valueCopy);
                    this.$emit('checkinput', valueCopy, this.source.labels, index);
                } else {
                    this.$emit('input', !this.value);
                }
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    // @import "../../scss/base/variables";
    @import "../scss/base/mixin";

    .checkbox {
        display: inline-block;
        line-height: 30px;
        color: inherit;
        white-space: nowrap;
        @include user-select(none);

        &:before {
            color: #ccc;
            font-size: 16px;
            width: 16px;
            height: 16px;
            vertical-align: top;
            margin: 7px 8px 7px 0;
            @include user-select(none);
            @include transition(color .2s ease);
        }

        &:hover,
        &.icon-checkbox-check {
            &:before {
                color: #fb6f40;
            }
        }

        &:not(.disabled) {
            cursor: pointer;
        }

        &.disabled {
            cursor: not-allowed;
        }
    }

</style>
