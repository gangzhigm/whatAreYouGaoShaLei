<template>
    <div class="meta-data">
        <div class="content-view">
            <div class="toolbar">
                <crumbs class="pull-left"/>
            </div>
        </div>
        <div class="tab-links">
            <div class="content-view" v-if="'scoreReport' === $route.name " >
                <a class="tab-link">
                    {{'metaData.scoreReport' | t}}
                </a>
            </div>

            <div class="content-view" v-else>
<!--                事件分组-->
                <router-link class="tab-link" :to="{name:'eventGroup'}">{{'metaData.eventGroup' | t}}</router-link>
<!--                事件管理-->
                <router-link class="tab-link" :to="{name:'metaEvent'}">{{'metaData.eventMgt' | t}}</router-link>
<!--                用户属性-->
                <router-link class="tab-link" :to="{name:'userAttribute'}">{{'metaData.userAttr' | t}}</router-link>
<!--                事件属性-->
                <router-link class="tab-link" :to="{name:'eventAttribute'}">{{'metaData.eventAttr' | t}}</router-link>
<!--                分值评估-->
<!--                <router-link class="tab-link" :to="{name:'scoreList', query: $route.query}">{{'metaData.scoreEva' | t}}</router-link>-->
            </div>
        </div>
        <router-view class="content-view"/>
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
            //华为埋码-用户数据管理- 用户元数据配置管理
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P12031993DB3982');
            }
        }
    };
</script>
<style lang="scss" type="text/scss" ref="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";
</style>
