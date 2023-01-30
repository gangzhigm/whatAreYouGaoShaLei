<template>
    <div class="mass-send">
        <div class="content-view">
            <crumbs></crumbs>
            <public-account/>
        </div>
        <div class="tab-links">
            <div class="content-view">
                <router-link class="tab-link" :to="{name: 'massSendForm'}">{{'massSend.createMessage' | t}}</router-link>
                <router-link class="tab-link" :to="{name: 'massSentList'}">{{'massSend.sent' | t}}</router-link>
            </div>
        </div>
        <div class="page-content">
            <router-view/>
        </div>
    </div>
</template>
<script type="text/babel">
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
            //华为埋码-公众号运营-微信群发
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P1203199401F826');
            }
        }
    };
</script>
