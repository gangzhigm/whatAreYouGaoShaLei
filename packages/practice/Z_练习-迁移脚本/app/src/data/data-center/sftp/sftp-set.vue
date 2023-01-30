<template>
    <div class="set">
        <sftp-steps class="step" :stepId="$route.query.step" :isAdd="isAdd" type="sftp" @updateSftp="updateSftp"/>
    </div>
</template>
<script>
    import SftpSteps from './sftp-steps.vue';

    export default {
        name: 'sftp-set',
        components: {
            SftpSteps,
        },
        data() {
            return {
                // sftp 是否为新增
                isAdd: false,
            };
        },
        methods: {
            updateSftp(sftp) {
                this.$emit('updateSftp', sftp);
            }
        },
    };
</script>
<style lang="scss">
    @import '../scss/set';
    @import '../scss/step-anchor';
</style>