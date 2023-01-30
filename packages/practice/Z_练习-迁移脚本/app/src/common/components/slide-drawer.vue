<template>
    <transition name="drawer-slide">
        <div class="slide-drawer" v-show="value" :style="{ width: `${width}px` }">
            <div class="drawer-title">
                <span class="icon-right icon title-font" @click="close"></span>
                <span v-if="title" class="title-font">{{ title }}</span>
                <slot name="header"></slot>
            </div>
            <div class="drawer-content" ref="drawerContent">
                <slot></slot>
            </div>
        </div>
    </transition>
</template>

<script type="text/ecmascript-6">
export default {
    name: 'SlideDrawer',
    props: {
        // 显隐控制
        value: {
            type: Boolean,
            default: false,
        },
        // 标题
        title: {
            type: String,
        },
        // 宽度
        width: {
            type: Number,
            default: 650
        }
    },
    methods: {
        close () {
            this.$emit('input', false);
        },
        // 滚动到底部 外部调用
        scrollToBottom(val) {
            this.$refs.drawerContent.scrollTop = val || this.$refs.drawerContent.scrollHeight;
        },
        getContentHeight() {
            return this.$refs.drawerContent.scrollHeight;
        }
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../scss/base/variables';
@import '../scss/base/mixin';

.drawer-slide-enter,
.drawer-slide-leave-to {
    @include transform(translateX(100%));
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
    @include transition(all 0.6s ease);
}

.slide-drawer {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: $index-popup;
    height: 100%;
    // width: 650px;
    background-color: white;
    @include box-shadow(0 0 62px rgba(#444a51, 0.45));

    .drawer-title {
        height: $header-height;
        background-color: #4e545a;
        color: #fff;
        // @include ellipsis();

        .icon-right {
            display: inline-block;
            width: 16px;
            margin: 0 10px 0 18px;
            cursor: pointer;
            @include transform(rotate(180deg));
        }

        .title-font {
            line-height: $header-height;
            font-size: 16px;
        }
    }

    .drawer-content {
        overflow: auto;
        padding: 10px;
        height: calc(100% - #{$header-height});
        @include box-sizing();
    }

    .drawer-footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: right;
        background-color: $title-bg;
        border-top: 1px solid $select-border;
        padding: 10px 11px;
    }
}
</style>