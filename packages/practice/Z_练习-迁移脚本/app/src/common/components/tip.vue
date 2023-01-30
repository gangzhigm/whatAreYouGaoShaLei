<template>
    <transition name="fade">
        <div class="tip" :class="[direction, {line, warn}]"
             v-show="open" v-html="message" @mouseenter="show" @mouseleave="leave"></div>
    </transition>
</template>
<script type="text/ecmascript-6">

    export default {
        data() {
            return {
                message: '',
                direction: 'top',
                line: false,
                open: false,
                warn: ''
            };
        },
        methods: {
            leave() {
                this.open = false;
            },
            show() {
                this.open = true;
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../scss/base/variables";
    @import "../scss/base/mixin";

    .tip {
        position: absolute;
        padding: 3px 8px;
        z-index: $index-toast + 1;
        line-height: 18px;
        color: white;
        background-color: $color-content;
        @include border-radius(4px);

        &:first-letter {
            text-transform: capitalize;
        }

        &.warn {
            background-color: $light-red;

            &:after {
                color: $light-red;
            }
        }

        &:not(.line) {
            white-space: pre;
        }

        &.line {
            white-space: nowrap;
        }

        &.top {
            @include transform(translate(-50%, -100%));

            &:after {
                bottom: 0;
                left: 50%;
                margin-left: -5px;
                margin-bottom: -10px;
                border-top-color: currentColor;
            }
        }

        &.bottom {
            @include transform(translate(-50%, 0));

            &:after {
                top: 0;
                left: 50%;
                margin-left: -5px;
                margin-top: -10px;
                border-bottom-color: currentColor;
            }
        }

        &.bottom-left {
            @include transform(translate(-100%, 0));

            &:after {
                top: 0;
                right: 0;
                margin-right: 10px;
                margin-top: -10px;
                border-bottom-color: currentColor;
            }
        }

        &.left {
            @include transform(translate(-100%, -50%));

            &:after {
                right: 0;
                top: 50%;
                margin-top: -5px;
                margin-right: -10px;
                border-left-color: currentColor;
            }
        }

        &.right {
            @include transform(translate(0, -50%));

            &:after {
                left: 0;
                top: 50%;
                margin-top: -5px;
                margin-left: -10px;
                border-right-color: currentColor;
            }
        }

        &:after {
            content: '';
            position: absolute;
            width: 0;
            height: 0;
            border: 5px solid transparent;
            color: $color-content;
            @include border-radius(2px);
        }
    }

</style>
