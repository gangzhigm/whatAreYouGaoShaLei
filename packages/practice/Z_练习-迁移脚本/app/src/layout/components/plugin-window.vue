<template>
    <iframe :src="pluginSrc" class="plugin-window"></iframe>
</template>
<script>
    /**
     * Dmartech 定制化功能入口
     */
    export default {
        name: 'plugin-window',
        computed: {
            pluginSrc() {
                return '/plugin' + this.$route.path;
            }
        },
        mounted() {
            window.goHome = () =>{
                this.$router.push({name: 'index'});
            };
        },
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .plugin-window {
        border: none;
        width: 100%;
        height: calc(100vh - #{$header-height});
    }
</style>
