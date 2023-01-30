<template>
    <svg class="inline-loading" :class="offset">
        <circle cx="4" cy="20" r="4"></circle>
        <circle cx="9" cy="9" r="4"></circle>
        <circle cx="20" cy="4" r="4"></circle>
        <circle cx="31" cy="9" r="4"></circle>
        <circle cx="36" cy="20" r="4"></circle>
        <circle cx="31" cy="31" r="4"></circle>
        <circle cx="20" cy="36" r="4"></circle>
        <circle cx="9" cy="31" r="4"></circle>
    </svg>
</template>
<script type="text/ecmascript-6">
    export default {
        name: 'inline-loading',
        props: {
            offset: { // lg, md, sm
                type: String,
                'default': 'lg'
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../scss/base/variables";
    @import "../scss/base/mixin";

    @include keyframes(scale) {
        from {
            r: 4px;
            opacity: 1;
        }
        to {
            r: 3px;
            opacity: .5;
        }
    }

    .inline-loading {
        position: relative;
        display: block;
        width: 40px;
        height: 40px;

        &.lg {
            margin: 10vh auto;
        }
        &.md {
            margin: 5vh auto;
        }
        &.sm {
            margin: 10px auto;
        }
        &.drop {
            margin: 45vh auto 3vh;
        }
        circle {
            fill: $theme;

            &:nth-child(1) {
                @include animation(scale .8s -.8s ease infinite);
            }
            &:nth-child(2) {
                @include animation(scale .8s -.7s ease infinite);
            }
            &:nth-child(3) {
                @include animation(scale .8s -.6s ease infinite);
            }
            &:nth-child(4) {
                @include animation(scale .8s -.5s ease infinite);
            }
            &:nth-child(5) {
                @include animation(scale .8s -.4s ease infinite);
            }
            &:nth-child(6) {
                @include animation(scale .8s -.3s ease infinite);
            }
            &:nth-child(7) {
                @include animation(scale .8s -.2s ease infinite);
            }
            &:nth-child(8) {
                @include animation(scale .8s -.1s ease infinite);
            }
        }

    }

</style>
