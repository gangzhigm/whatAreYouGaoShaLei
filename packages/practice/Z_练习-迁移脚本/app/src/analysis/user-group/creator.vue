<template>
    <div class="user-group-creator">
        <input type="text" class="input full-width" :value="value" @input="$emit('input', $event.target.value)"
               maxlength="30" v-title:top.line.warn="errorText" @keydown.enter="$emit('confirm')"
               :class="{error: errorText}" @focusin="$emit('clear')">
        <input type="button" class="btn btn-sm btn-theme-border" :value="$t('common.cancel')" @click="$emit('cancel')">
        <input type="button" class="btn btn-sm btn-theme" :value="$t('common.confirm')" @click="$emit('confirm')">
    </div>
</template>
<script>
    /**
     * 新建分组、分群，以及编辑分组、分群名称时使用的组件
     * 名称长度最大 30 个字符
     */
    export default {
        name: 'creator',
        props: {
            value: String,
            errorText: String
        }
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";

    .user-group-creator {
        padding: 8px 16px;
        text-align: right;
        background-color: $select-bg;

        .input {
            margin-bottom: 8px;
            text-align: left;
        }
    }
</style>