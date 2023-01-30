<template>
    <div class="bind-wechat-official-account-now">
        <div class="logo">
            <img src="../../layout/header/logo-with-title.svg" alt="">
        </div>
        <div class="first">
            <p style="padding-bottom: 47px">
                <i>{{'wechatAccount.wechatLicensed' | t}}</i>
            </p>
            <p>{{'wechatAccount.dearCustomer' | t}}</p>
            <p style="padding: 31px 0">{{'wechatAccount.note' | t}}</p>
            <p style="padding-bottom: 42px">{{'wechatAccount.suggest' | t}}</p>
            <p style="padding-bottom: 11px">
                <button class="btn btn-lg login_btn" @click="authorize" type="button">{{'wechatAccount.clickAuth' | t}}</button>
            </p>
            <p>
                <router-link :to="{name: 'home'}" class="btn btn-lg skip-btn" target="_self">{{'wechatAccount.skip' | t}}</router-link>
            </p>
        </div>
    </div>
</template>
<script type="text/babel">

    export default {
        watch: {
            '$store.state.user.authorizerInfoId'(flag) {
                if (flag) {
                    // continue previous action
                    this.$router.replace(this.$route.query.redirect || '/');
                }
            }
        },
        methods: {
            authorize() {
                if (this.$store.state.user.isWx === 1) {
                    let {href} = this.$router.resolve({name: 'wechatAccountAuthorization'});
                    window.open(href);
                } else {
                    this.$toast(this.$t('wechatAccount.notAuth'));
                }
            }
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .bind-wechat-official-account-now {
        position: relative;
        overflow: hidden;
        @include box-sizing;
        height: 100vh;
        width: 100vw;
        background: $content-bg url('../../layout/login/login-bg.svg') no-repeat center;
        @include background-size(cover);

        .logo {
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

        .first {
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
