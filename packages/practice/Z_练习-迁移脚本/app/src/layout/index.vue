<template>
    <div>
        <nav-header />
        <router-view v-if="routerViewShow" />
        <!-- 在线客服按钮 -->
        <customer-service-button v-if="!isDevelopment"/>
        <!-- 权限限制弹出层 -->
        <modal v-if="authLock.message" :title="authLock.title" readonly>
            <div v-if="authLock.message" v-html="authLock.message"></div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme" :value="$t('home.goLogin')"
                       @click="goLogin">
                <input v-if="user.authorization" type="button"
                       class="btn btn-md btn-theme-border" :value="$t('home.whatever')" @click="whatever">
            </template>
        </modal>
    </div>
</template>
<script type="text/babel">
    import NavHeader from './header/header.vue';
    import {CLEAR_USER_INFO, SET_AUTH_LOCK} from '@/store/vuex/mutationTypes';
    import CustomerServiceButton from './components/customer-service-button.vue';
    import analysisStore, {ANALYSIS_STORE_NAME} from '@/store/vuex/modules/analysisStore';
    import {FETCH_BOARDS, FETCH_BOOKMARKS, FETCH_EVALUATES} from '@/store/vuex/actionTypes';
    import { mapGetters, mapState, mapMutations, mapActions } from 'vuex';
    export default {
        data() {
            return {
                routerViewShow: true
            };
        },
        computed: {
            ...mapGetters(['validTimeText']),
            ...mapState(['authLock', 'user']),
            isAnalysis() {
                return this.$route.matched[0].name === 'analysis';
            },
            isDevelopment() {
                return process.env.NODE_ENV === 'development';
            }
        },
        watch: {
            isAnalysis(newVal) {
                if (newVal) {
                    this.initialAnalysis();
                } else {
                    this.$store.unregisterModule(ANALYSIS_STORE_NAME);
                }
            }
        },
        created() {
            if (this.isAnalysis) {
                this.initialAnalysis();
            }
        },
        components: {
            CustomerServiceButton,
            NavHeader
        },
        mounted() {
            if (process.env.NODE_ENV !== 'development') {
                this.getCountType();
            }
        },
        methods: {
            ...mapMutations([
                CLEAR_USER_INFO,
                SET_AUTH_LOCK
            ]),
            ...mapActions([
                FETCH_BOOKMARKS,
                FETCH_BOARDS,
                FETCH_EVALUATES
            ]),
            goLogin() {
                const {href} = this.$router.resolve({
                    name: 'login',
                    query: {
                        redirect: JSON.stringify({
                            name: this.$route.name,
                            query: this.$route.query,
                            params: this.$route.query
                        })
                    }
                });

                this.CLEAR_USER_INFO();
                this.SET_AUTH_LOCK({});

                this.$nextTick(() => {
                    // 菜单权限需要重新注册，vue-router 不支持动态移除路由记录，
                    // 所以只能触发页面刷新，从而使用新的权限信息
                    location.href = href;
                });
            },
            whatever() {
                this.SET_AUTH_LOCK({});
            },
            // 展示客服按钮
            getCountType() {
                // 华为定制客服
                if (this.user.companyType === 1) {
                    this.loadHuaWeiService();
                    // 普通
                } else {
                    if (!window.KF5SupportBoxAPI) {
                        this.loadNormalService();
                    } else {
                        window.KF5SupportBoxAPI.showButton();
                    }
                }
            },
            loadHuaWeiService() {
                let Script = document.createElement('script');
                Script.id = 'ze-snippet';
                Script.src = `//static.zdassets.com/ekr/snippet.js?key=40952091-7f0b-4cc0-a4a1-11cae10b460f`;
                document.getElementsByTagName('head')[0].appendChild(Script);

                Script.onload = () =>{
                    /*eslint-disable*/
                    if (zE) {
                        zE(function () {
                            zE.show();
                        });
                    }
                };
            },
            loadNormalService() {
                let Script = document.createElement('script');
                Script.id = 'kf5-provide-supportBox';
                Script.src = `//assets-cdn.kf5.com/supportbox/main.js?${new Date().getDay()}`;
                Script.setAttribute('kf5-domain', 'webpower.kf5.com');
                Script.charset = 'utf-8';
                document.getElementsByTagName('head')[0].appendChild(Script);
                Script.onload = () =>{
                    window.KF5SupportBoxAPI.init();
                    const that = this;
                    window.KF5SupportBoxAPI.ready(function () {
                        // 传递用户信息给组件使用
                        window.KF5SupportBoxAPI.identify({
                            name: that.user.userName,
                            email: that.user.email,
                            // 自定义用户信息
                            metadata: [
                                {name: 'id', value: that.user.id},
                                {name: 'cid', value: that.user.cid},
                                {name: '是否开通微信', value: that.user.isWx},
                                {name: '套餐名称', value: that.user.mealName},
                                {name: '套餐有效期', value: that.validTimeText},
                                {name: '短信余量', value: that.user.smsSurplus},
                                {name: '彩信余量', value: that.user.mmsSurplus}
                            ]
                        });
                    });
                };
            },
            initialAnalysis() {
                this.$store.registerModule(ANALYSIS_STORE_NAME, analysisStore);
                this.FETCH_BOOKMARKS();
                this.FETCH_BOARDS();
                this.FETCH_EVALUATES();
            },
        }
    };
</script>
