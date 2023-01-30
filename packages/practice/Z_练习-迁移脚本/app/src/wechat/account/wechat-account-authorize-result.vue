<template>
    <div class="content-view white-bg padding margin">
        <template v-if="errorMessage">
            <h1>{{'wechatAccount.authorizeErr' | t}}</h1>
            <blockquote>{{errorMessage}}</blockquote>
        </template>
        <inline-loading v-else/>
    </div>
</template>
<script>
    import { WechatApiV1 } from '@/api';
    import {UPDATE_WECHAT_ACCOUNT_INFO} from '@/store/vuex/actionTypes';
    import { mapActions } from 'vuex';

    const metaTags = document.head.getElementsByTagName('meta');
    for (let index = 0; index < metaTags.length; index++) {
        if (metaTags[index].name === 'referrer') {
            metaTags[index].content = 'always';
            break;
        }
    }

    export default {
        data() {
            return {
                errorMessage: '',
                //复用公众号-公众号扫码授权创建小程序，还是用公众号授权的那一套，需要改动的点如下，
                // 1：前端拼重定向地址时需要拼一个appType=3的参数，
                // 重定向到空白页调用/bindingRedirect接口时需要传appType=3，
                appType: '',
                href: '',
                appid:'',
            };
        },
        mounted() {
            // const queryStr = window.location.href.split('?')[1];
            this.href = window.location.href;
            this.appType = this.href.split('?')[1].match(/(^|&)appType=([^&]*)/)[2];
            let index = this.href.indexOf('&');
            const queryStr = this.href.substring(index);
            WechatApiV1
                .pushAuthorizationParams(queryStr, this.appType)
                .then((res) => {
                    this.appid = res.body.data ? res.body.data.appid : '';
                    this.waitForAuthorizationComplete();
                })
                .catch(err => {
                    if (err.response.body) {
                        this.errorMessage = err.response.body.message;
                    } else {
                        this.errorMessage = err.text || err.responseText;
                    }
                });
        },
        methods: {
            ...mapActions([UPDATE_WECHAT_ACCOUNT_INFO]),
            async waitForAuthorizationComplete() {
                const success = WechatApiV1
                    .subscriptionStatus()
                    .then(({body: {data: {bindingStatus}}}) => parseInt(bindingStatus) === 1);
                if (success) {
                    // 绑定成功，更新公众号授权信息(会通知到其他 tab 页)
                    await this.UPDATE_WECHAT_ACCOUNT_INFO();
                    if (this.href.indexOf('appType=3') > -1) {
                        WechatApiV1
                            .reuseAccountCreateMini(this.appid)
                            .then((res) => {
                                let {href: wechatRedirectUrl} = this.$router.resolve({name: 'MiniProgramAuthorizationResult'});
                                let redirect = location.origin + wechatRedirectUrl + '?wechatAppid=' + this.appid;
                                location.href = res.body.data.url + '&redirect_uri=' + encodeURIComponent(redirect);
                            });
                        return;
                    }
                    window.close();// 关闭当前临时页
                } else {
                    // 没有返回信息，继续等待
                    setTimeout(() => {
                        this.waitForAuthorizationComplete();
                    }, 1000);
                }
            }
        }
    };
</script>
