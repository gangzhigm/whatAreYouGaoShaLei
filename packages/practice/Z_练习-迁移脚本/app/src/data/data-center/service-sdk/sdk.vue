<template>
    <div class="sdk">
        <sdk-steps :stepId="$route.query.step" :isAdd="isAdd"/>
    </div>
</template>
<script>
    import sdkSteps from './sdk-steps.vue';

    export default {
        components: {
            sdkSteps,
        },
        data() {
            return {
                // sftp 是否为新增
                isAdd: true,
            };
        },
        mounted() {
            let query = this.$route.query;
            // 地址栏改地址
            if (!query.id || !query.name || !query.step || !query.type) {
                this.$router.push({
                    name: this.$route.name,
                    query: {
                        id: query.id,
                        name: query.name,
                        step: query.step,
                        type: query.type,
                    },
                });
            }
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
</style>