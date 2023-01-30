<template>
    <div class="list-empty">
        <template v-if="action">
            {{'common.noAny' | t}} {{name ? name : $t('components.data')}}，<span class="action-text" @click="$emit('action')">{{action}}</span>
        </template>
        <template v-else>{{'common.noAny' | t}} {{name ? name : $t('components.data')}}</template>
    </div>
</template>
<script>

    export default {
        name: 'list-empty',
        props: {
            name: {
                type: String,
            },
            action: String
        }
    };
</script>
<style lang="scss">
    @import "../../scss/base/variables";
    @import "../../scss/base/mixin";

    // 没有任何数据时的列表提示
    .list-empty {
        padding-top: 112px;
        padding-bottom: 16px;
        line-height: $input-field-height;
        text-align: center;
        cursor: default;
        background: white url("./table-no-data.png") no-repeat 50.5% 16px;
        @include background-size(auto 80px);
        color: $color-light-content;
    }
</style>
