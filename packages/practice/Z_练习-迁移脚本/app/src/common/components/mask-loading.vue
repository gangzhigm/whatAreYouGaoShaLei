/**
 * Created by Dean on 2020/06/05
 */
<template>
    <div class="mask-loading">
        <template v-if="tips">
            <p>{{tips}} <span class="dot"></span></p>
        </template>
        <template v-else>
            <inline-loading></inline-loading>
        </template>
    </div>
</template>

<script>

export default {
    name: 'MaskLoading',
    props: {
        tips: {
            type: String,
            default: ''
        } // 提示文字，可为空
    },
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import "../scss/base/variables";
@import "../scss/base/mixin";
.mask-loading {
    z-index: 99;
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 15px;

    p {
        width: 500px;
        height: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #999;
        background: #fff;
        border: 1px solid #c0c0c0;
        @include box-sizing(border-box);
        @include border-radius(8px);
    }

    .dot {
        &:before {
            content: '...';
            position: absolute;
            animation: dot 2s infinite step-start both;
        }

        &:after {
            content: '...';
            color: transparent;
        }
    }

    @keyframes dot {
        33% {
            content: '.';
        }
        66% {
            content: '..';
        }
    }
}
</style>