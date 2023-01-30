<template>
    <div class="set">
        <js-sdk-steps class="step" :stepId="$route.query.step" :isAdd="isAdd" type="sdk" @updateSdk="fetchSdk"/>
    </div>
</template>
<script>
    import jsSdkSteps from './js-sdk-steps.vue';

    export default {
        name: 'js-sdk-set',
        components: {
            jsSdkSteps,
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