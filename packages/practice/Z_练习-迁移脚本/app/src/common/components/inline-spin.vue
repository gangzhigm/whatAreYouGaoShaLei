<template>
    <i class="icon icon-loading inline-spin" ref="spin"></i>
</template>

<script type="text/ecmascript-6">
export default {
    // 行内spin组件
    name: 'InlineSpin',
    props: {
        // spin图标的字号
        fontSize: {
            type: Number,
            default: 14
        },
        // spin的颜色 默认dmt主题色 可定义为16进制颜色 或 'unset'
        color: {
            type: String,
        }
    },
    mounted() {
        if (this.fontSize) {
            this.$refs.spin.style.fontSize = `${this.fontSize}px`;
        }
        if (this.color) {
            this.$refs.spin.style.color = this.color;
        }
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import "../scss/base/variables";
@import "../scss/base/mixin";
.inline-spin {
    display: inline-block;
    color: $theme;
    animation: spin 1s linear infinite;
}
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>