<template>
    <div class="setting white-bg">
        <!--旅程审批-->
        <div class="form-field">
            <label for="config">{{'systemSet.pending' | t}}</label>
            <switch-button id="config" :has="$has('enterprise_system_examine_flow')" v-model="open"
                           @input="editConfig"/>
            <label class="theme-text-cursor" v-if="!canApproval" @click="upgrade">{{'systemSet.upgrade' | t}}</label>
            <p>{{ 'systemSet.setApprovalNote' | t }}</p>
        </div>
        <modal v-if="showUpgrade" :title="$t('common.notice')" @close="showUpgrade = false">
            <label class="label">{{'systemSet.message' | t}}</label>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')"
                       @click="showUpgrade = false">
            </template>
        </modal>

        <!--两步验证-->
        <div class="form-field">
            <label for="twoStep">{{'systemSet.twoStepVerify' | t}}</label>
            <label id="twoStep" class="switch-button"
                   :class="{active: twoFactor,dis: $has('enterprise_system_login_checkout') || ssoLogin}"
                   v-model="twoFactor" @click="editTwoFactor">
                <slot/>
            </label>
            <label class="theme-text" v-if="user.phone">{{'systemSet.phone' | t}} : {{phoneText}}</label>
            <label v-if="phoneEmpty">{{'systemSet.phoneText1' | t}}
                <router-link class="theme-text" :to="{name: 'personalSetting'}">
                    {{'personal.personalSettings' | t}}
                </router-link>
                {{'systemSet.phoneText2' | t}}</label>
            <p>{{'systemSet.phoneTip1' | t}}</p>
            <p>{{'systemSet.phoneTip2' | t}}</p>
        </div>
        <!--登录密码 弹窗-->
        <modal v-if="pwdShow" :title="$t('systemSet.openTwo')" @close="closePwdModal">
            <div class="form-field">
                <label class="label" for="pwd">{{'systemSet.inputPwd' | t}}</label>
                <password id="pwd" v-model.trim="loginPwd"/>
            </div>
            <template v-slot:buttons>
                <button type="button" class="btn btn-md btn-theme" :disabled="!loginPwd" @click="fetchSMSCode">
                    {{'systemSet.sendCode' | t}}
                </button>
            </template>
        </modal>

        <!--手机验证码 弹窗-->
        <modal v-if="SMSCodeShow" :title="$t('systemSet.openTwo')" @close="closeSMSCodeModal">
            <div class="form-field">
                <label class="label" for="code">{{'systemSet.smsCode' | t}}</label>
                <input type="text" class="input" id="code" v-model.trim="SMSCode" maxlength="6">
                <vue-timer :time-count="TIME_COUNT" :showTimer="showTimer" :stopTimer="stopTimer"
                           @change="fetchSMSCode"/>
                <p v-if="showTip">{{'systemSet.sendMsg1' | t}}
                    <span class="theme-text">{{phoneText}}</span>{{'systemSet.sendMsg2' | t}}
                </p>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" :disabled="!SMSCode"
                       @click="openTwoFactor"/>
            </template>
        </modal>

        <!--关闭两步验证弹窗-->
        <modal v-if="closeTwoFactorShow" :title="$t('systemSet.closeTwo')" @close="closeToFactorModal">
            <label>{{'systemSet.confirmClose' | t}}</label>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')"
                       @click="closeToFactorModal">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')"
                       @click="closeTwoFactor"/>
            </template>
        </modal>
    </div>
</template>

<script>
    import { GeteOriginApi } from '@/api';
    import {UPDATE_USER_INFO} from '@/store/vuex/mutationTypes';
    import Password from '@/layout/header/password.vue';
    import {PHONE_TEXT} from '@/common/utils/regs';
    import {USER_INFO_SESSION_KEY} from '@/store/vuex/rootStore';
    import { mapState, mapMutations } from 'vuex';

    const TIME_COUNT = 60;

    export default {
        name: 'system-settings',
        components: {
            Password,
        },
        data() {
            return {
                showUpgrade: false,     // 是否显示弹窗 (无权限显示弹窗)
                pwdShow: false,         // pwd弹窗
                SMSCodeShow: false,     // 验证码弹窗
                loginPwd: '',           // 登录密码
                SMSCode: '',            // 验证码
                closeTwoFactorShow: false,// 关闭两步验证弹窗
                TIME_COUNT,
                showTimer: true,        // 显示倒计时
                stopTimer: false,       // 停止倒计时
                showTip: false,         // 显示 已发送验证码至...
                canTWoFactor: false,    // 有两步校验权限
                twoFactorOpen: false,   // 两步校验开启
                showTipTimer: null,     // 提示信息计时器存储
                loadedFactor: false,   // 请求获取两步验证信息完成
                ssoLogin: false,          // 账号是否是单点登录
                open: false,            // 是否开启(旅程审批权限）
            };
        },
        mounted() {
            this.open = this.approvalState;
            // 获取两步验证权限
            this.fetchTwoFactor();

            //华为埋码-CPM同意与偏好管理-旅程审批管理
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P1203199545C887');
            }
        },
        computed: {
            ...mapState(['user']),
            // 旅程审批权限
            canApproval() {
                return this.user.canApproval;
            },
            // 旅程审批状态
            approvalState() {
                return this.user.approvalState;
            },
            // phone format
            phoneText() {
                return this.user.phone.replace(PHONE_TEXT, '$1****$2');
            },
            // 两步验证状态
            twoFactor() {
                // 1. 有两步验证权限
                // 2. 后台返回的twoFactorOpen为 true
                return this.canTWoFactor && this.twoFactorOpen;
            },
            // 手机号为空：两步验证关闭 && 无手机号 =》再开启两步验证，手机号需要必填
            phoneEmpty() {
                return !this.twoFactor && !this.user.phone;
            },
            user() {
                return this.$store.state.user;
            },
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            }
        },
        methods: {
            ...mapMutations([UPDATE_USER_INFO]),
            // 修改旅程审批
            editConfig(e) {
                if (!this.canApproval) {
                    this.$toast(this.$t('systemSet.update'), 'warn');
                    this.open = false;
                    return;
                }
                this.open = !e;
                GeteOriginApi
                    .changeConfig(this.user.id)
                    .then(res => {
                        this.open = e;
                        let approvalState = this.open;
                        this.UPDATE_USER_INFO({approvalState});
                        let user = JSON.parse(localStorage.getItem(USER_INFO_SESSION_KEY));
                        user.canApproval = this.canApproval;
                        user.approvalState = approvalState;
                        localStorage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(user));
                        this.$toast(res.body.message, 'success');
                    })
                    .catch(() => {
                        this.open = !e;
                    });
            },
            // 升级套餐
            upgrade() {
                this.showUpgrade = true;
            },
            // 两步验证
            editTwoFactor() {
                if (this.$has('enterprise_system_login_checkout') || this.ssoLogin) {
                    return;
                }
                // 修改4832
                if (!this.canTWoFactor && this.loadingFactor === true) { // 套餐未配置系统设置（两步验证）
                    this.$toast(this.$t('systemSet.noTwoAuth'), 'warn');
                    return false;
                }
                if (this.twoFactor) {
                    this.closeTwoFactorShow = true;
                    return;
                }
                if (this.phoneEmpty) {
                    this.$toast(this.$t('systemSet.phoneNull'), 'warn');
                } else {
                    this.pwdShow = true;
                }
            },
            // 关闭登录密码弹窗
            closePwdModal() {
                this.pwdShow = false;
                this.loginPwd = '';
            },
            // 获取验证码
            fetchSMSCode() {
                GeteOriginApi
                    .sendSMSCode(this.user.email, this.loginPwd, this.user.phone, this.user.areaCode)
                    .then(() => {
                        // 关闭密码弹窗
                        this.pwdShow = false;
                        // 打开验证码弹窗
                        this.SMSCodeShow = true;

                        // 展示验证码填写信息
                        this.showTipTimeOut();
                    });
            },
            // 关闭验证码弹窗
            closeSMSCodeModal() {
                this.SMSCodeShow = false;
                this.SMSCode = '';
                this.closePwdModal();
            },
            // 确认-开启两步验证
            openTwoFactor() {
                GeteOriginApi
                    .verifySMSCode(this.user.email, this.SMSCode, this.user.phone)
                    .then(() => {
                        this.modifyTwoFactor();
                    })
                    .catch(() => {
                        this.closePwdModal();
                    });
            },
            // 编辑两步验证
            modifyTwoFactor() {
                GeteOriginApi
                    .changeTwoFactor(this.user.id)
                    .then(res => {
                        this.$toast(res.body.message, 'success');
                        this.closeSMSCodeModal();
                        this.fetchTwoFactor();
                    });
            },
            // 获取用户两步验证权限
            fetchTwoFactor() {
                this.loadedFactor = false;
                GeteOriginApi
                    .getSystemConfig(this.user.id)
                    .then(res => {
                        this.canTWoFactor = res.body.data.flag === 0; // 0:有编辑权限 1:没有
                        this.twoFactorOpen = res.body.data.status === 0;// 0 启用 1 禁用
                        this.ssoLogin = res.body.data.ssologin === 1;  // 1 单点登录 没值非单点登录
                        this.loadingFactor = true;
                        // 更新用户信息（是否有两步验证权限）
                        this.UPDATE_USER_INFO({
                            canTWoFactor: this.canTWoFactor,
                            twoFactorOpen: this.twoFactorOpen
                        });
                        let user = JSON.parse(localStorage.getItem(USER_INFO_SESSION_KEY));
                        user.canTWoFactor = this.canTWoFactor;
                        user.twoFactorOpen = this.twoFactorOpen;
                        // 若开启两步验证，需要更新验证登录态字段。
                        if (user.twoFactorOpen === true && user.canTWoFactor) {
                            user.passTwoFactorOpen = true;
                            // 不仅要存到本地还要更新到user
                            this.UPDATE_USER_INFO({
                                passTwoFactorOpen: true
                            });
                        }
                        localStorage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(user));
                    });
            },
            // 关闭两步验证弹窗
            closeToFactorModal() {
                this.closeTwoFactorShow = false;
            },
            // 确认-关闭两步验证
            closeTwoFactor() {
                this.closeToFactorModal();
                this.modifyTwoFactor();
            },
            // 弹窗验证码填写信息显示隐藏
            showTipTimeOut() {
                if (this.showTipTimer) {
                    clearTimeout(this.showTipTimer);
                    this.showTipTimer = null;
                }
                this.showTip = true;
                this.showTipTimer = setTimeout(() => {
                    this.showTip = false;
                    clearTimeout(this.showTipTimer);
                }, 61000);
            }
        }
    };
</script>

<style type="text/scss" lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .setting {
        padding: 24px;

        .theme-text-cursor {
            cursor: pointer;
        }
    }
</style>
