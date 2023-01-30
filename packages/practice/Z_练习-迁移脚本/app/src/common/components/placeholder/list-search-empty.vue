<template>
    <div class="search-empty">
        <template v-if="action">{{'common.noResult' | t}}，
            <span class="action-text" @click="$emit('action')">{{action}}</span>
        </template>
        <template v-else>{{'common.noResult' | t}}</template>
    </div>
</template>
<script>
    export default {
        name: 'list-search-empty',
        props: {
            action: String
        }
    };
</script>
<style lang="scss">
    @import "../../scss/base/variables";
    @import "../../scss/base/mixin";
    // 查询列表数据为空时的列表提示
    .search-empty {
        padding-top: 112px;
        padding-bottom: 16px;
        line-height: $input-field-height;
        text-align: center;
        cursor: default;
        background: white url("./table-no-result.png") no-repeat 50.5% 36px;
        @include background-size(auto 60px);
        color: $color-light-content;
    }
</style>
