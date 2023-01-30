<template>
    <div class="set">
        <sdk-steps class="step" :stepId="$route.query.step" :isAdd="isAdd" type="sdk" @updateSdk="fetchSdk"/>
    </div>
</template>
<script>
    import sdkSteps from './sdk-steps.vue';

    export default {
        name: 'sdk-set',
        components: {
            sdkSteps,
        },
        data() {
            return {
                // sftp 是否为新增
                isAdd: false,
            };
        },
        methods: {
            fetchSdk(sdk) {
                this.$emit('updateSdk', sdk);
            },
        },
    };
</script>
<style lang="scss">
    @import '../scss/set';
</style>