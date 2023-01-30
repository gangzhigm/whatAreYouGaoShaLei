<template>
    <div class="config-wecom-agent-now" v-if="loaded">
        <div class="logo-block">
            <img src="../../layout/header/logo-with-title.svg" alt="">
        </div>
        <div class="tips-block">
            <p style="padding-bottom: 47px">
                <i>{{'home.wecom' | t}}</i>
            </p>
            <p>{{'wechatAccount.dearCustomer' | t}}</p>
            <p style="padding: 31px 0">{{'wecom.goCfgTips' | t}}</p>
            <p style="padding-bottom: 11px">
                <button class="btn btn-lg login_btn" @click="$router.push({ name: 'EnterpriseWeChat' })"
                    type="button">{{'wecom.goCfg' | t}}</button>
            </p>
            <p>
                <router-link :to="{ name: 'home' }" class="btn btn-lg skip-btn" target="_self">{{'wecom.skipCfg' | t}}
                </router-link>
            </p>
        </div>
    </div>
</template>
<script type="text/babel">

import { GeteOriginApi } from '@/api';
export default {
    name: 'ConfigWecomAgentNow',
    data () {
        return {
            loaded: false,
        };
    },
    created() {
        this.getPageAuth();
    },
    methods: {
        // 判断账户是否开通导购助手服务
        async getPageAuth() {
            if ([
                'returnVisitTask',
                'returnVisitTaskAdd',
                'returnVisitTaskEdit',
                'customerGroup',
                'customerGroupAdd',
                'customerGroupEdit',
                'staffManage',
                'salesData',
                'otherConfig',
                'wecomConfig'
            ].includes(this.$route.query.name)) {
                // 判断账户是否开通导购助手服务
                const auth = await GeteOriginApi
                    .getGlobalConfByConfigName({configName: 'journey_shoppingguide'})
                    .then(({ body: { data } }) => {
                        return data.status === 1;
                    })
                    .catch(() => {
                        next({ name: 'home' });
                    });
                if (auth) {
                    this.loaded = true;
                } else {
                    // auth为false，未开通增值服务，跳转导购助手页面显示未开通服务提示，增加authValid参数，防止routes/index.js中拦截
                    this.$router.push({ name: 'shoppingGuide', params: {authValid: 1} });
                }
            } else {
                this.loaded = true;
            }
        },
    }
};

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../common/scss/base/variables';
@import '../../common/scss/base/mixin';

.config-wecom-agent-now {
    position: relative;
    overflow: hidden;
    @include box-sizing;
    height: 100vh;
    width: 100vw;
    background: $content-bg url('../../layout/login/login-bg.svg') no-repeat
        center;
    @include background-size(cover);

    .logo-block {
        position: absolute;
        left: 3%;
        top: 3%;
        width: 200px;
    }

    .login_btn {
        width: 100%;
        @include linear-gradient(left, #0cc4a9, #17f8a8);
    }

    .skip-btn {
        display: block;
        color: $color-title;
        background-color: #585656;
    }

    .tips-block {
        position: absolute;
        color: #c9c9c9;
        width: 324px;
        height: 350px;
        top: 50%;
        left: 50%;
        margin: -180px 0 0 -162px;

        p {
            font-size: 14px;
            i {
                font-size: 24px;
            }
        }
    }
}
</style>
