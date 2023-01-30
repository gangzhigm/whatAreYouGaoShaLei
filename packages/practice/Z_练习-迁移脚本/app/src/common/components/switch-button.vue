<template>
    <label class="switch-button dis" :class="{active: value}" v-if="has">
        <slot></slot>
    </label>
    <label class="switch-button" :class="{active: value}" @click="$emit('input', !value)" v-else>
        <slot></slot>
    </label>
</template>
<script>
    export default {
        name: 'switch-button',
        props: {
            value: Boolean,
            has:Boolean //用于switch-button的权限限制
        }
    };
</script>
<style type="text/scss" lang="scss">
    @import "../scss/base/variables";
    @import "../scss/base/mixin";

    .switch-button {
        $height: 24px;
        $width: 40px;

        position: relative;
        display: inline-block;
        cursor: pointer;
        line-height: $height;
        @include user-select(none);

        &:before {
            content: '';
            display: inline-block;
            vertical-align: top;
            width: $width;
            height: $height;
            border-radius: $height/2;
            background-color: $disabled;
            margin-right: 8px;
        }

        &:after {
            content: '';
            position: absolute;
            width: 18px;
            height: 18px;
            top: 0;
            left: 0;
            margin: ($height - 18px)/2;
            border-radius: 100%;
            background-color: white;
            @include transition();
        }

        &.active {
            &:before {
                background-color: $theme;
            }
            &:after {
                @include transform(translateX(16px));
            }
        }
        &[disabled] {
            cursor: not-allowed;
        } 
    }
    .dis{
        cursor:not-allowed;
    }
</style>
