<template>
    <div class="org-setting">
        <div class="content-view">
            <crumbs></crumbs>
        </div>
        <div class="tab-links">
            <div class="content-view">
                <router-link class="tab-link" :to="{name: 'orgMember'}">{{'EnterPrise.orgMember' | t}}</router-link>
                <router-link class="tab-link" :to="{name: 'privilegeSecurity'}">{{'privilege.privilegeSecurity' | t}}
                </router-link>
                <router-link class="tab-link" :to="{name: 'dataSharing'}">{{'sharing.title' | t}}</router-link>
                <router-link class="tab-link" :to="{name: 'sendChannel'}">{{'sendChannel.title' | t}}</router-link>
                <router-link class="tab-link" :to="{name: 'sentFrequency'}">{{'frequency.title' | t}}</router-link>
                <router-link class="tab-link" :to="{name: 'systemSettings'}">{{'systemSet.title' | t}}</router-link>
                <router-link class="tab-link" :to="{name: 'WeChatPublicNo'}">{{'wechatNo.title' | t}}</router-link>
                <router-link v-if="hasWecom" class="tab-link" :to="{name: 'EnterpriseWeChat'}">{{'enterpriseWeChat.title' | t}}</router-link>
                <router-link class="tab-link" :to="{name: 'MiniProgram'}">{{'miniProgram.title' | t}}</router-link>
                <router-link class="tab-link" :to="{name: 'openPlatform'}">{{'openPlat.title' | t}}</router-link>
            </div>
        </div>
        <div class="page-content">
            <router-view class="content-view margin"></router-view>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    export default {
        name: 'setting',
        computed: {
            ...mapState({
                hasWecom: state => state.user.menus.wecom
            })
        }
    };
</script>
