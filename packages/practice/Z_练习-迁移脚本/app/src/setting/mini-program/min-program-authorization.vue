<template>
    <!--    授权公众号起始页-->
    <inline-loading/>
</template>

<script>
import {WechatApiV1} from '@/api';

const metaTags = document.head.getElementsByTagName('meta');
for (let index = 0; index < metaTags.length; index++) {
    if (metaTags[index].name === 'referrer') {
        metaTags[index].content = 'always';
        break;
    }
}

export default {
    name: 'min-program-authorization',
    mounted() {
        let WxAppId = this.$route.query.appid;
        WechatApiV1
            .reuseAccountCreateMini(WxAppId)
            .then((res) => {
                let {href: wechatRedirectUrl} = this.$router.resolve({name: 'MiniProgramAuthorizationResult'});
                let redirect = location.origin + wechatRedirectUrl + '?wechatAppid=' + WxAppId;
                location.href = res.body.data.url + '&redirect_uri=' + encodeURIComponent(redirect);
            });
    },
};
</script>
