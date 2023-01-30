<template>
    <transition name="fade-in">
        <div class="loading"> {{'common.loading' | t}}</div>
    </transition>
</template>
<script>
    export default {
        name: 'loading'
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../scss/base/variables";
    @import "../scss/base/mixin";

    $loading-height: 24px;
    $loading-border: #77e3d4;
    $loading-bg: #d9eded;
    $gradient-left: #d9eded;
    $gradient-right: #8be4d8;

    .loading {
        position: relative;
        z-index: -1;
        overflow: hidden;
        height: $loading-height - 2px;
        line-height: $loading-height - 2px;
        text-align: center;
        border-top: 1px solid $loading-border;
        border-bottom: 1px solid $loading-border;
        color: $green;
        background-color: $loading-bg;
        @include user-select(none);
        @include transform-origin(center top);
        @include transition(all .5s ease);
        will-change: height;

        &:before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            border-radius: 10px;
            @include linear-gradient(to right, $gradient-left, $gradient-right);
            @include animation(toRight 2s linear infinite);
            z-index: -1;
        }

        &:after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            border-radius: 10px;
            @include linear-gradient(to right, $gradient-left, $gradient-right);
            @include animation(toRight 2s 1s linear infinite);
            z-index: -1;
        }
    }

    @keyframes toRight {
        0% {
            @include transform(translateX(-200%));
        }
        100% {
            @include transform(translateX(200%));
        }
    }

    .fade-in-enter-active,
    .fade-in-leave-active {
        height: $loading-height - 2px;
    }

    .fade-in-enter,
    .fade-in-leave-to {
        opacity: 0.5;
        height: 0;
    }

</style>