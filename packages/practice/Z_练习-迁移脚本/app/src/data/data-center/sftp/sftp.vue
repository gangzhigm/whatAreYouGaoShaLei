<template>
    <div class="sftp">
        <sftp-steps :stepId="$route.query.step" :isAdd="isAdd" type="sftp"/>
    </div>
</template>
<script>
    import SftpSteps from './sftp-steps.vue';

    export default {
        components: {
            SftpSteps,
        },
        data() {
            return {
                // sftp 是否为新增
                isAdd: true,
            };
        },
        mounted() {
            if (!this.$route.query.step) {
                this.$router.push({
                    name: this.$route.name,
                    query: {step: 1},
                });
            }
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
</style>