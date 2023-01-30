<template>
    <div class="reload">
        <p class="content">
            <span class="loadFailed-txt">{{'data.loadFailed' | t}}</span>
            <span class="reload-txt" @click="$emit('reload')">{{'data.reload' | t}}</span>
        </p>
    </div>
</template>

<script>
    export default {
        name: 'reload'
    };
</script>

<style lang="scss">
    @import '../../../../common/scss/base/variables';
    @import '../../../../common/scss/base/mixin';

    .reload {
        padding: 15px 0;
        .content {
            margin: 25px auto;
            display: flex;
            justify-content: center;
            span {
                font-size: 13px;
            }
            .reload-txt {
                margin-left: 8px;
                color: $light-blue;
                cursor: pointer;
            }
        }
    }
</style>