<template>
    <div class="set">
        <api-steps class="step" :stepId="$route.query.step" :isAdd="isAdd" type="api" @updateApi="fetchApi"/>
    </div>
</template>
<script>
    import apiSteps from './api-steps.vue';

    export default {
        name: 'api-set',
        components: {
            apiSteps,
        },
        data() {
            return {
                // sftp 是否为新增
                isAdd: false,
            };
        },
        methods: {
            // 更新api
            fetchApi(api) {
                this.$emit('updateApi', api);
            },
        },
    };
</script>
<style lang="scss">
    @import '../scss/set';
</style>