<template>
    <transition name="backdrop-fade">
        <div class="backdrop" @scroll.stop.self.prevent :class="{scroll}">
            <slot></slot>
        </div>
    </transition>
</template>
<script>
    export default {
        name: 'backdrop',
        props: {
            scroll: {
                type: Boolean,
                default: true
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../scss/base/variables";
    @import "../../scss/base/mixin";

    .backdrop {
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: $index-popup + 10;
        background-color: rgba(black, .56);

        &.scroll {
            overflow: auto;
        }

        &:not(.scroll) {
            overflow: hidden;
        }
    }

    .backdrop-fade-enter-active,
    .backdrop-fade-leave-active {
        @include transition(opacity .3s ease)
    }

    .backdrop-fade-enter,
    .backdrop-fade-leave-to {
        opacity: 0
    }

</style>