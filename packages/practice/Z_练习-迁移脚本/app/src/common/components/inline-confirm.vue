<template>
    <div class="inline-confirm" v-blur="cancel" :class="{static: staticPositioned}">
        <i class="tail" ref="tail"></i>
        <div class="text" v-text="text" :title="text"></div>
        <button type="button" class="btn btn-sm btn-theme-border" @click="cancel">{{'common.cancel' | t}}</button>
        <button type="button" class="btn btn-sm btn-theme" @click="confirm">{{'common.confirm' | t}}</button>
    </div>
</template>
<script>
    import debounce from 'lodash/debounce';

    const HEIGHT = 110;
    const WIDTH = 270;

    export default {
        name: 'inline-confirm',
        props: {
            staticPositioned: Boolean,
            text: String,
            bottomOffset: {
                type: Number,
                default: 0
            },
        },
        mounted() {
            this.$el._scrollingContainers = [];
            // 立即更新位置
            if (!this.staticPositioned) this.position();
            // 找出所有的滚动容器
            // 监听滚动容器的滚动事件，滚动会触发cancel
            let parent = this.$el.parentNode;
            while (parent !== document.body) {
                if ('auto' === window.getComputedStyle(parent).getPropertyValue('overflow')) {
                    parent.addEventListener('scroll', this.cancel, false);
                    this.$el._scrollingContainers.push(parent);
                }
                parent = parent.parentNode;
            }
        },
        beforeDestroy() {
            // 解除对容器滚动事件的监听
            this.$el._scrollingContainers.forEach(node => {
                node.removeEventListener('scroll', this.cancel, false);
            });
            delete this.$el._scrollingContainers;
        },
        methods: {
            confirm() {
                this.$emit('confirm');
            },
            cancel() {
                this.$emit('cancel');
            },
            position: debounce(function () {
                let rect = this.$el.parentElement.getBoundingClientRect();
                let top = rect.top + rect.height + 5 + this.bottomOffset;
                let left = rect.left + rect.width / 2 - 135;
                let transformStr = '';
                // 1. 不能超出窗口左、右边
                if (left < 5) {
                    let offset = 5 - left;
                    transformStr += `translateX(-${offset}px)`;
                    left = 5;
                } else if (left + WIDTH + 5 > window.innerWidth) {
                    let offset = left + WIDTH + 5 - window.innerWidth;
                    transformStr += `translateX(${offset}px)`;
                    left = left - offset;
                }
                // 2. 超出窗口下边时，向上展开
                if (top + HEIGHT + 5 > window.innerHeight) {
                    top = rect.top - HEIGHT - 5 - this.bottomOffset;
                    this.$refs.tail.style.top = '100%';
                    transformStr += ' rotate(-135deg)';
                } else {
                    this.$refs.tail.style.top = '0';
                    transformStr += ' rotate(45deg)';
                }

                this.$refs.tail.style.webkitTransform = transformStr;
                this.$refs.tail.style.MozTransform = transformStr;
                this.$refs.tail.style.msTransform = transformStr;
                this.$refs.tail.style.OTransform = transformStr;
                this.$refs.tail.style.transform = transformStr;
                this.$el.style.top = top + 'px';
                this.$el.style.left = left + 'px';
            }, 60, {'leading': true})
        }
    };
</script>
<style type="text/scss" lang="scss">
    @import "../scss/base/variables";
    @import "../scss/base/mixin";

    .inline-confirm {
        z-index: $index-popup;
        @include box-sizing();
        width: 270px;
        height: 110px;
        font-size: 14px;
        line-height: normal;
        padding: 19px 16px;
        border: 1px solid $border-color;
        border-radius: 3px;
        text-align: right;
        color: $color-light-content;
        background-color: white;
        @include box-shadow(0 3px 8px rgba(#8b9daf, .16));

        &.static {
            position: absolute;
            left: 50%;
            @include transform(translateX(-50%));
        }

        &:not(.static) {
            position: fixed;
        }

        .tail {
            $size: 5px * 1.414;
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            width: $size;
            height: $size;
            margin: (-$size/2) 0 0 (-$size/2);
            border-top: 1px solid $border-color;
            border-left: 1px solid $border-color;
            border-top-left-radius: 2px;
            background-color: white;
            @include transform(rotate(45deg));
            @include box-shadow(-1px -1px 1px rgba(#8b9daf, .16));
        }

        .text {
            text-align: left;
            line-height: 20px;
            height: 40px;
            margin-bottom: 5px;
            display: -webkit-box;
            overflow: hidden;
            white-space: normal;
            text-overflow: ellipsis;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
        }
    }

</style>
