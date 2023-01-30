<template>
    <div class="dmartech-home">
        <div class="content-view">
            <crumbs/>
        </div>
        <!-- 华为专用首页组件 -->
        <huawei-customed v-if="this.user.companyType === 1" />
        <!-- 其他用户首页微应用容器 -->
        <div v-else id="home-spa-container" class="external-content" :class="{ 'no-height-box': homeAppErr}"></div>
        <outdated-home v-if="homeAppErr" />
        <!--账号过期时间提示-->
        <modal class="expire-tip" v-if="showExpire" :title="$t('common.accountExpire')" @close="showExpire = false">
            <svg aria-hidden="true" class="expire-tip-icon">
                <use xlink:href="#icon-warn"></use>
            </svg>
            <p>{{'common.accountExpireA' | t}}{{validTime}}</p>
            <p v-if="isAdmin">{{'common.accountExpireB' | t}}</p>
            <p v-else>{{'common.accountExpireSub' | t}}</p>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.ok')" @click="showExpire = false"/>
            </template>
        </modal>

        <!-- 登录账号不属于华为EBG 提醒 -->
        <modal v-if="loginErrTip" :title="$t('home.functionDisabled')" @close="loginErrTip = false">
            {{'home.loginErr' | t}}
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme" @click="loginErrTip = false"
                    :value="$t('wechatAccount.gotIt')">
            </template>
        </modal>
    </div>
</template>
<script type="text/ecmascript-6">
    import startQiankun from '@/plugins/qiankun';
    import HuaweiCustomed from './modules/huawei-customed.vue';
    import OutdatedHome from './modules/outdated-home.vue';
    import { mapGetters, mapState } from 'vuex';

    const ENV = process.env.NODE_ENV;
    // 华为账号导出oss
    const HWExportType = localStorage.getItem('HW_EXPORT_TYPE');// 华为oss下载type
    const HWExportUuid = localStorage.getItem('HW_EXPORT_UUID');// 华为oss下载uuid

    export default {
        data() {
            return {
                // 新增联系人概览
                showExpire: false,      // 账号过期时间提示是否显示
                validTime: '',          // 账号过期时间
                loginErrTip: false, // 登录账号不属于华为EBG
            };
        },
        computed: {
            ...mapGetters(['homeAppErr']),
            ...mapState(['user']),
            // 是否为主账号
            isAdmin() {
                this.user.roleId === 0 || this.user.roleId === '';
            },
            user() {
                return this.$store.state.user;
            },
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            }
        },
        created() {
            //区分普通用户和华为用户 companyType：华为用户1  普通用户0
            if (this.user.companyType !== 1) {
                // 基础模版Dom加载后初始化qiankun框架
                if (!window.qiankunStarted) {
                    window.qiankunStarted = true;
                    startQiankun();
                }
            }
            // 华为oss导出
            this.hwOss();
        },
        mounted() {
            // 账号过期时间提示
            if (this.user.validTime) {
                this.validTime = this.user.validTime;
                let limitTime = new Date(this.validTime).getTime() - new Date().getTime();
                let todayNotice = localStorage.getItem('TODAY_VALIDTIME_NOTICE' + this.user.id) ?
                    localStorage.getItem('TODAY_VALIDTIME_NOTICE' + this.user.id)
                        .toString() : '';
                let today = new Date().getDate()
                    .toString();
                if (todayNotice !== today && (limitTime === 30 || limitTime <= 15 * 24 * 60 * 60 * 1000)) {
                    this.showExpire = true;
                    localStorage.setItem('TODAY_VALIDTIME_NOTICE' + this.user.id, new Date().getDate());
                }
            }

            //华为埋码-DMARTECH平台首页
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P12031996D69986');
            }
        },
        methods: {
            // 华为oss导出
            hwOss() {
                // 已登录的非华为账号
                if (this.$route.params.come === 'hwOss') this.loginErrTip = true;

                // 本地缓存无type、uuid
                if (!HWExportType || !HWExportUuid) return;

                switch (ENV) {
                    case 'development':
                    case 'beta':
                        if (this.user.companyType === 1 && this.user.cid === 381) {
                            let {href} = this.$router.resolve({
                                name: 'exportoss',
                                query: {type: HWExportType, uuid: HWExportUuid}
                            });
                            window.open(href, '_self');
                        } else {
                            this.loginErrTip = true;
                        }
                        localStorage.setItem('HW_EXPORT_TYPE', '');
                        localStorage.setItem('HW_EXPORT_UUID', '');
                        break;
                    case 'production':
                        // cid=471为生产环境内部测试用
                        if (this.user.companyType === 1 && (this.user.cid === 1260 || this.user.cid === 471)) {
                            let {href} = this.$router.resolve({
                                name: 'exportoss',
                                query: {type: HWExportType, uuid: HWExportUuid}
                            });
                            window.open(href, '_self');
                        } else {
                            this.loginErrTip = true;
                        }
                        localStorage.setItem('HW_EXPORT_TYPE', '');
                        localStorage.setItem('HW_EXPORT_UUID', '');
                        break;
                }
            },
        },
        components: { HuaweiCustomed, OutdatedHome }
    };
</script>
<style lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .dmartech-home {
        height: calc(100vh - 56px);
        .external-content {
            overflow-y: auto;
            height: calc(100vh - 96px);
        }
        .expire-tip {
            p {
                font-size: 14px;
                line-height: 32px;
                padding: 0 15px;
                word-break: normal;
            }

            .modal {
                position: relative;
                width: 524px;

                .modal-head {
                    padding-left: 45px;
                }

                .expire-tip-icon {
                    display: inline-block;
                    width: 24px;
                    height: 24px;
                    fill: $theme;
                    position: absolute;
                    top: 11px;
                    left: 25px;
                }
            }
        }
        .no-height-box {
            height: 0;
        }
    }
</style>
