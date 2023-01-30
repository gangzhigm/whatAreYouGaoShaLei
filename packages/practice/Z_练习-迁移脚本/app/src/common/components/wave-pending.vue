<template>
    <div class="wave-pending">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
    </div>
</template>

<script type="text/ecmascript-6">
    export default {
        name: 'wave-pending',
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../scss/base/variables';
    @import '../scss/base/mixin';

    .wave-pending {
        float: right;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: space-between;
        margin-right: 1.5em;
        width: 2em;
        height: $input-field-height;
        line-height: $input-field-height;
        span {
            width: 0.3em;
            height: 1em;
            background-color: $green;
        }

        span:nth-of-type(1) {
            animation: grow 1s -0.45s ease-in-out infinite;
        }

        span:nth-of-type(2) {
            animation: grow 1s -0.3s ease-in-out infinite;
        }

        span:nth-of-type(3) {
            animation: grow 1s -0.15s ease-in-out infinite;
        }

        span:nth-of-type(4) {
            animation: grow 1s ease-in-out infinite;
        }

        @keyframes grow {
            0%,
            100% {
                transform: scaleY(1);
            }

            50% {
                transform: scaleY(2);
            }
        }
    }
</style>