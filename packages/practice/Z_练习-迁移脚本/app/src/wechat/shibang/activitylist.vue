<template>
    <div class="activity-list">
        <iframe :src="frameSrc" class="activity-iframe"></iframe>
    </div>
</template>
<script type="text/ecmascript-6">
    import LINKS from '../../LINKS';

    export default {
        name: 'activitylist',// 世邦定制-二维码活动列表
        computed: {
            frameSrc() {
                return LINKS.WEB_BASE + '/shibangui/activitylist';
            },
        },
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .activity-list {

        .activity-iframe {
            border: none;
            width: 100%;
            height: calc(100vh - #{$header-height + $toolbar-height});
        }
    }
</style>
