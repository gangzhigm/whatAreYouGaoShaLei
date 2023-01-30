<template>
    <!--授权小程序落地页-->
    <div class="mini-program-result">
        <template v-if="errorMessage">
            <h1>{{ 'wechatAccount.authorizeErr' | t }}</h1>
            <blockquote>{{ errorMessage }}</blockquote>
        </template>
        <inline-loading v-else/>
    </div>
</template>

<script>
import {UPDATE_MINI_PROGRAM_INFO} from '@/store/vuex/actionTypes';
import {mapActions} from 'vuex';
import {WechatApiV1} from '@/api';

export default {
    name: 'mini-program-authorization-result',
    data() {
        return {
            errorMessage: '',
            wechatAppid: '',
            ticket: '',
        };
    },
    mounted() {
        let href = window.location.href;
        this.wechatAppid = href.split('?')[1].match(/(^|&)wechatAppid=([^&]*)/)[2];
        this.ticket = href.split('?')[1].match(/(^|&)ticket=([^&]*)/)[2];
        WechatApiV1
            .createMiniRedirect(this.wechatAppid, this.ticket)
            .then(() => {
                this.waitForAuthorizationComplete();
            })
            .catch((err) => {
                this.errorMessage = err.body.message;
            });
    },
    methods: {
        ...mapActions([UPDATE_MINI_PROGRAM_INFO]),
        async waitForAuthorizationComplete() {
            const success = WechatApiV1
                .getMiniProgramInfo()
                .then(({body: {data}}) => data !== null);
            if (success) {
                // 绑定成功，更新小程序授权信息
                await this.UPDATE_MINI_PROGRAM_INFO();
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

<style lang="scss" scoped>

</style>
