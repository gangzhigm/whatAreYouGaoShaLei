<template>
    <div class="shopping-guide" v-if="isAuthLoaded">
        <div class="toolbar content-view">
            <crumbs class="pull-left" :crumbs="crumbs" />
        </div>
        <template v-if="isAuthShoppingGuide">
            <!-- 导购助手 -->
            <template v-if="hasMiniAuth">
                <div class="tab-links">
                    <div class="content-view">
                        <router-link class="tab-link" :to="{name:'returnVisitTask',query:{groupId:0}}">{{'shoppingGuide.returnVisitTask' | t}}</router-link>
                        <router-link class="tab-link" :to="{name:'customerGroup'}">{{'shoppingGuide.customerGroup' | t}}</router-link>
                        <router-link class="tab-link" :to="{name:'staffManage'}">{{'shoppingGuide.staffManage' | t}}</router-link>
                        <router-link class="tab-link" :to="{name:'salesData'}">{{'shoppingGuide.salesData' | t}}</router-link>
                        <router-link class="tab-link" :to="{name:'otherConfig'}">{{'shoppingGuide.otherConfig' | t}}</router-link>
                        <router-link class="tab-link" :to="{name:'wecomConfig'}">{{'shoppingGuide.wecomConfig' | t}}</router-link>
                    </div>
                </div>
                <router-view />
            </template>
            <!-- 未授权小程序 -->
            <template v-else>
                <!-- 去授权小程序 -->
                <div class="content-view white-bg mini-auth">
                    {{'shoppingGuide.noMiniAuth' | t}}
                    <button class="btn btn-theme btn-lg" @click="goAuth">{{'shoppingGuide.goAuthorize' | t}}</button>
                </div>
            </template>
        </template>
        <template v-else>
            <div class="content-view margin padding white-bg">
                <span>{{ 'shoppingGuide.noShoppingGuideAuth' | t }}</span>
            </div>
        </template>
    </div>
</template>
<script type="text/babel">

    import { GeteOriginApi, WechatApiV1 } from '@/api';

    export default {
        components: {},
        data () {
            return {
                isAuthShoppingGuide: false,  //是否有导购助手权限
                hasMiniAuth: false,   //是否绑定可用小程序
                isAuthLoaded: false,    //是否已经获取增值服务权限及小程序信息
            };
        },
        computed: {
            crumbs() {
                return (this.isAuthShoppingGuide && this.hasMiniAuth) ? '' : [
                    {name: 'index', text: 'Dmartech'},
                    {name: 'shoppingGuide', text: this.$t('home.shoppingGuide')}
                ];
            },
        },
        created () {
            // 获取是否开通导购助手服务
            this.getPageAuth();
        },
        methods: {
            // 判断账户是否开通导购助手服务
            getPageAuth() {
                GeteOriginApi
                    .getGlobalConfByConfigName({configName: 'journey_shoppingguide'})
                    .then(({ body: { data } }) => {
                        this.isAuthShoppingGuide = (data.status === 1) ? true : false;
                        this.getMiniProgramInfo();
                    })
                    .catch(() => {
                        this.isAuthLoaded = true;
                    });
            },
            // 获取小程序详情(是否已经发布1： 未发布 2： 已经发布)
            getMiniProgramInfo() {
                WechatApiV1
                    .getMiniProgramInfo()
                    .then(({ body: { data } }) => {
                        this.hasMiniAuth = (data && data.releaseStatus === 2 && data.subType === 2) ? true : false;
                        this.isAuthLoaded = true;
                        if (!this.isAuthShoppingGuide || !this.hasMiniAuth) document.title = 'Dmartech - ' + this.$t('home.shoppingGuide');
                    });
            },
            // 前往授权
            goAuth() {
                // 跳转微页面授权
                this.$router.push({name:'MiniProgram'});
            },
        }
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .shopping-guide {

        .mini-auth {
            font-size: 14px;
            padding: 12px 24px;

            .btn-lg {
                height: 32px;
                line-height: 32px;
                margin-left: 15px;
            }
        }
    }
</style>
