<template>
    <div class="journey-report">
        <div class="toolbar content-view">
            <crumbs class="pull-left"/>
        </div>
        <div class="tab-links">
            <div class="content-view">
                <router-link class="tab-link" :to="{name:'journeyReviewReport'}">{{'data.overview' | t}}</router-link>
                <router-link class="tab-link" :to="{name:'journeySendReport'}">{{'data.reports' | t}}</router-link>
                <router-link class="tab-link" :to="{name:'journeyExportReport'}">{{'data.exportData' | t}}</router-link>
            </div>
        </div>
        <router-view />
    </div>
</template>
<script>
    export default {
        computed: {
            user() {
                return this.$store.state.user;
            },
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            }
        },
        mounted() {
            //华为埋码-营销报告-营销旅程报告
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P12031996B079D0');
            }
        },
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    @import "chart";
</style>
