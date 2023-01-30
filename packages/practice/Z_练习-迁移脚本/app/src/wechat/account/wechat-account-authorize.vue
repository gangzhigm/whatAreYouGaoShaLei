<template>
    <inline-loading/>
</template>
<script>
    import { WechatApiV1 } from '@/api';

    const metaTags = document.head.getElementsByTagName('meta');
    for (let index = 0; index < metaTags.length; index++) {
        if (metaTags[index].name === 'referrer') {
            metaTags[index].content = 'always';
            break;
        }
    }

    export default {
        name: 'wechat-account-authorize',
        data() {
            return {
                appType: '',
            };
        },
        mounted() {
            this.appType = this.$route.query.appType || '';
            let {href: wechatRedirectUrl} = this.$router.resolve({name: 'wechatAccountAuthorizeResult'});
            WechatApiV1
                .getAuthorizationUrl()
                .then(res => {
                    location.href = res.body.data.url + '&redirect_uri=' + location.origin + wechatRedirectUrl
                        + '?appType=' + this.appType;
                });
        }
    };
</script>
