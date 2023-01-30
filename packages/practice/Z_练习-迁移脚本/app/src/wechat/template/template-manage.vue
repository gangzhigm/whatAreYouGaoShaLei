<template>
    <div class="template-manage">
        <div class="content-view">
            <crumbs></crumbs>
            <public-account :disabled="readonlyAccount"/>
        </div>
        <div class="tab-links">
            <div class="content-view">
                <router-link class="tab-link" :to="{name: 'myTemplate'}">{{'template.myTemplate' | t}}</router-link>
                <router-link class="tab-link" :to="{name: 'invalidTemplate'}">{{'template.invalidTemplate' | t}}
                </router-link>
                <button v-if="$route.name !== 'templateDetail' && $route.name !== 'invalidTemplateDetail'"
                        id="wechat_template_get_message"
                        :disabled="$has('wechat_template_get_message')"
                        class="pull-right btn btn-md btn-theme btn-round" @click="$emit('remark')">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-refresh"></use>
                    </svg>
                    {{'template.update' | t}}
                </button>
            </div>
        </div>
        <div class="page-content">
            <router-view class="content-view padding white-bg"
                         :class="{margin: $route.name === 'myTemplate' || $route.name === 'invalidTemplate'}"></router-view>
        </div>
    </div>
</template>
<script type="text/babel">
    import {UPDATE_USER_INFO} from '@/store/vuex/mutationTypes';
    import {UPDATE_WECHAT_ACCOUNT_INFO} from '@/store/vuex/actionTypes';

    export default {
        data() {
            return {
                readonlyAccount: false,  // 禁用公众号筛选
            };
        },
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
            //华为埋码-营销旅程- 公众号模板消息
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P120319949FC44C');
            }
        },
        beforeRouteEnter(to, from, next) {
            // 创建图文消息 全局公众号改为旅程选择的公众号
            let authorizerInfoId = ~~to.query.authorizerInfoId;
            if (authorizerInfoId) {
                next(vm => {
                    vm.$store.dispatch(UPDATE_WECHAT_ACCOUNT_INFO, authorizerInfoId);
                });
            }
            next();
        },
        watch: {
            // 模板详情（我的模板和失效模板）时，筛选公众号不可用
            '$route.name'() {
                this.readonlyAccount = this.$route.name === 'templateDetail' || this.$route.name === 'invalidTemplateDetail';
            },
        }
    };
</script>
