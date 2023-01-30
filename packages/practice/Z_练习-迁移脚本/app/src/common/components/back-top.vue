<template>
    <transition name="fade">
        <a v-show="visible" class="back-to-top" :class="relative ? 'relative' : 'fixed'" @click.prevent="backTop">
            <svg aria-hidden="true">
                <use xlink:href="#icon-mp-top"></use>
            </svg>
        </a>
    </transition>
</template>
<script type="text/ecmascript-6">

    import {addMouseWheelListener, removeMouseWheelListener} from '../utils/passiveEventUtils';

    export default {
        name: 'back-top',
        props: {
            container: null,
            relative: Boolean,
        },
        data() {
            return {
                visible: false,
                _container: null,
            };
        },
        mounted() {
            this._container = this.container || this.$el.parentNode;
            this._container.addEventListener('scroll', this._checker, false);
            addMouseWheelListener(this._container, this._checker);
        },
        beforeDestroy() {
            this._container.removeEventListener('scroll', this._checker, false);
            removeMouseWheelListener(this._container, this._checker);
        },
        methods: {
            _checker() {
                if (this._container.scrollTop > 50 !== this.visible) {
                    this.visible = !this.visible;
                }
            },
            // 点击按钮返回顶部
            backTop() {
                this._container.scroll({top: 0, left: 0, behavior: 'smooth'});
            }
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../scss/base/variables";
    @import "../scss/base/mixin";

    .back-to-top {
        right: 24px;
        bottom: 24px;
        width: 40px;
        height: 40px;
        border: none;
        text-align: center;
        position: relative;
        @include border-radius(100%);
        background-color: $light-theme;
        @include transition();
        cursor: pointer;
        z-index: $index-menu;
        @include box-shadow(0px 6px 12px 0px rgba(#bfc7d2, .82));

        &.fixed {
            position: fixed;
        }

        &.relative {
            position: absolute;
        }

        &:hover {
            background-color: $theme;
            @include box-shadow(0px 6px 12px 0px rgba(#1accb3, .79));
        }

        &:active {
            background-color: $dark-theme;
        }

        svg {
            position: absolute;
            top: 50%;
            left: 50%;
            margin-top: -9.5px;
            margin-left: -8px;
            width: 16px;
            height: 19px;
            vertical-align: -2.4px;
            fill: white;
            overflow: hidden;
            pointer-events: none;
        }
    }

</style>
