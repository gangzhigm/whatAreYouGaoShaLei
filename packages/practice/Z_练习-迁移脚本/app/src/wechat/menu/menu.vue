<template>
    <div class="function-menu">
        <div class="content-view">
            <crumbs :crumbs="crumbs"></crumbs>
            <public-account :disabled="readonlyAccount"/>
        </div>
        <div class="tab-links">
            <!--自定义菜单/个性化菜单-->
            <div class="content-view" v-if="$route.name === 'diyMenu' || $route.name === 'customizeMenu'">
                <router-link class="tab-link" :to="{name: 'diyMenu'}">{{'menu.menu' | t}}</router-link>
                <router-link class="tab-link" :to="{name: 'customizeMenu'}">{{'home.customizeMenu' | t}}</router-link>
            </div>
            <!--新增个性化菜单-->
            <div class="content-view" v-if="$route.name === 'createCustomizeMenuForm' ">
                <router-link :to="{name: 'createCustomizeMenuForm'}" class="tab-link">{{'home.customizeMenuForm' | t}}
                </router-link>
            </div>
            <!--编辑个性化菜单-->
            <div class="content-view" v-if="$route.name === 'editCustomizeMenuForm'">
                <router-link :to="{name: 'editCustomizeMenuForm'}" class="tab-link">{{'home.editCustomizeMenu' | t}}
                </router-link>
            </div>
        </div>
        <div class="page-content">
            <router-view class="content-view padding margin white-bg"></router-view>
        </div>
        <!--        <div :class="{content: $route.name != 'customizeMenuForm'}">-->
        <!--            <router-view class="content-inner-wrapper"></router-view>-->
        <!--        </div>-->
    </div>
</template>
<script type="text/babel">
    export default {
        data() {
            return {
                crumbs:[]
            };
        },
        computed: {
            readonlyAccount() {
                return (this.$route.name === 'editCustomizeMenuForm' || this.$route.name === 'createCustomizeMenuForm') ?
                    true : false;
            },
            user() {
                return this.$store.state.user;
            },
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            }
        },
        mounted() {
            this.curmbs(this.$route.name);
            //华为埋码-公众号运营-个性化菜单栏
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P12031996934FC6');
            }
        },
        watch:{
            //监听路由更改crumbs
            '$route'() {
                this.curmbs(this.$route.name);
            },
        },
        methods:{
            curmbs(routerName) {
                switch (routerName) {
                    case 'diyMenu':
                        this.crumbs = [
                            {name: 'index', text: 'Dmartech'},
                            {name: 'menus', text: this.$t('home.customizeMenus')},
                            {name: 'diyMenu', text: this.$t('home.diyMenu')}
                        ];
                        break;
                    case 'customizeMenu':
                        this.crumbs = [
                            {name: 'index', text: 'Dmartech'},
                            {name: 'menus', text: this.$t('home.customizeMenus')},
                            {name: 'customizeMenu', text: this.$t('home.customizeMenu')}
                        ];
                        break;
                    case 'createCustomizeMenuForm':
                        this.crumbs = [
                            {name: 'index', text: 'Dmartech'},
                            {name: 'menus', text: this.$t('home.customizeMenus')},
                            {name: 'customizeMenu', text: this.$t('home.customizeMenu')},
                            {name: 'createCustomizeMenuForm', text: this.$t('home.customizeMenuForm')}
                        ];
                        break;
                    case 'editCustomizeMenuForm':
                        this.crumbs = [
                            {name: 'index', text: 'Dmartech'},
                            {name: 'menus', text: this.$t('home.customizeMenus')},
                            {name: 'customizeMenu', text: this.$t('home.customizeMenu')},
                            {name: 'editCustomizeMenuForm', text: this.$t('home.editCustomizeMenu')}
                        ];
                        break;
                }
            }
        }
    };
</script>
