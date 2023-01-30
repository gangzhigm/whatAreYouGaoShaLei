<template>
    <div class="login">
        <!-- eslint-disable-next-line -->
        <a class="go-official" target="_blank" href="https://www.dmartechforce.com">< < 访问官网，申请免费试用</a>
        <language-switch/>
        <div class="login-form">
            <img class="logo" src="../header/logo-with-title.svg" alt="Dmartech">
            <div class="login-table">
                <input class="login-field" type="text" v-model.trim="email" @keydown.enter="signIn"
                       placeholder="email" maxlength="50">
                <input class="login-field" type="password" v-model.trim="password" placeholder="password"
                       @keydown.enter="signIn" maxlength="60" minlength="3">
                <div class="pending-box pull-right" v-if="loading">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <input class="pull-right btn btn-md btn-theme" v-else type="button" :value="'home.login' | t"
                       :disabled="disableSignIn" @click="signIn">
            </div>
        </div>
        <div class="error-form" v-if="errorCount >= 5">
            {{'home.moreThan1' | t}} {{second}} {{'home.moreThan2' | t}}<br/>
            {{'home.moreThan3' | t}}
        </div>
        <div class="site-info">
            <a href="http://beian.miit.gov.cn/" target="_blank" class="theme-text">{{govRecord}}</a>
            copyright©1999-{{currentYear}} Dmartech All rights reserved.
            <img src="./guard.png">
            <a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=31010602002926" target="_blank"
               class="theme-text">沪公网安备 31010602002926号</a>
        </div>
        <!--两步验证弹窗-->
        <modal v-if="codeModalShow" :title="$t('common.codeLogin')" @close="closeCodeModal">
            <div class="form-field">
                <label class="label" for="email">{{'common.accountNo' | t}}</label>
                <span>{{user.email}}</span>
            </div>
            <div class="form-field">
                <label class="label" for="code">{{'systemSet.smsCode' | t}}</label>
                <input type="text" class="input" id="code" v-model.trim="SMSCode" maxlength="6"
                       @keydown.enter="validateSMSCode">
                <vue-timer :timeCount="TIME_COUNT" :stopTimer="stopTimer" @change="fetchSMSCode('havePhone')"/>
                <p v-if="showTip">{{'systemSet.sendMsg1' | t}}
                    <span class="theme-text">{{phoneText}}</span>{{'systemSet.sendMsg2' | t}}
                </p>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme" :value="$t('home.login')" :disabled="!SMSCode"
                       @click="validateSMSCode"/>
            </template>
        </modal>
        <!--输入手机号-->
        <modal size="lg" v-if="phoneModalShow" :title="$t('common.codeLogin')" @close="closePhoneModal">
            <div class="form-field">
                <label class="label" for="email">{{'common.accountNo' | t}}</label>
                <span>{{user.email}}</span>
            </div>
            <div class="form-field">
                <label class="label"></label>
                <span>{{'common.twoFactorMsg1' | t}}</span><br/>
                <span class="msg">{{'common.twoFactorMsg2' | t}}</span>
            </div>
            <div class="form-field">
                <label class="label" for="phoneNo">{{'systemSet.phone' | t}}</label>
                <!--https://cnpmjs.org/package/vue-tel-input-->
                <vue-tel-input v-model="phone" v-bind="telInputData" @country-changed="countryChanged"/>
                <vue-timer :timeCount="TIME_COUNT" :stopTimer="stopTimer" :disabled="!phone"
                           @change="fetchSMSCode('phoneNull')"/>
            </div>
            <div class="form-field">
                <label class="label" for="code">{{'systemSet.smsCode' | t}}</label>
                <input type="text" class="input" id="code" v-model.trim="SMSCode" maxlength="6"
                       @keydown.enter="fetchSMSCode('phoneNull','login')">
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme" :value="$t('home.login')"
                       :disabled="!canLogin || !SMSCode" @click="validateSMSCode"/>
            </template>
        </modal>
    </div>
</template>
<script>
    import NavHeader from '../header/header.vue';
    import { ManageApi, GeteOriginApi } from '@/api';
    import {
        SIGN_IN,
        LOGIN_IN,
        UPDATE_ACCOUNT_BALANCE,
        UPDATE_MENU_AUTH,
        UPDATE_WECHAT_ACCOUNT_INFO,
        GET_TOKEN,
    } from '@/store/vuex/actionTypes';
    import {PRIVATE_DEVELOPMENT} from '@/private';
    import {initRanges} from '@/common/components/date-range/RANGES';
    import LINKS from '../../LINKS';
    import {getRoutesByMenuRecords} from '@/routes';
    import LanguageSwitch from '../components/language-switch.vue';
    import {SET_PLUGIN_ROUTES, UPDATE_USER_INFO} from '@/store/vuex/mutationTypes';
    import {PHONE_TEXT, PHONE_REGEXP} from '@/common/utils/regs';
    import {allCountries} from '@/common/components/vue-input-tel/vue-tel-input-data';
    import {USER_INFO_SESSION_KEY} from '@/store/vuex/rootStore';
    import {RenderPallForm} from '@/utils/pall-brand-sso';
    import { mapState, mapMutations, mapActions } from 'vuex';

    const TIME_COUNT = 60;
    export default {
        components: {
            LanguageSwitch,
            NavHeader
        },
        data() {
            return {
                email: '',
                password: '',
                loading: false,
                codeModalShow: false,   // 验证码弹窗
                phoneModalShow: false,  // 手机号弹窗
                SMSCode: '',            // 验证码
                TIME_COUNT,
                stopTimer: false,       // 停止倒计时
                showTip: false,         // show 已发送验证码至...
                phone: '',              // 手机号
                areaCode: '',           // 区号
                iso2: '',               // 国家
                allCountries,           // 国际区号列表
                canLogin: false,        // 新增手机号能否登陆
                showTipTimer: null,     // 提示信息计时器存储
                disableSignIn: false,   // 登录按钮可点
                errorCount: null,       // 错误次数
                surplusTime: null,      // 倒计时
                second: 0,              // s
                loginTimer: null,       // 登录倒计时
                currentYear: null,      // 今年
            };
        },
        created() {
            this.currentYear = new Date().getUTCFullYear();
        },
        computed: {
            ...mapState({
                user: state => state.user
            }),
            govRecord() {
                if (window.location.host === 'scrm.dmacloud.com') {
                    return '沪ICP备15019704号-7';
                }
                return '沪ICP备14039474号-14';
            },
            // phone format
            phoneText() {
                return this.user.phone.replace(PHONE_TEXT, '$1****$2');
            },
            telInputData() {
                return {
                    autocomplete: 'on',
                    autofocus: true,
                    defaultCountry: this.user.iso2,
                    disabledFetchingCountry: true,      //禁用基于用户的IP地址获取当前国家/地区
                    enabledCountryCode: true,           //在输入中启用国家/地区代码
                    enabledFlags: true,                 // 在输入中启用标志
                    maxLen: 30,
                    preferredCountries: ['cn'], // 首选国家/地区列表将位于下拉列表的顶部。即['AU', 'BR']
                    placeholder: this.$t('personal.enterPhone'),
                    allCountries: this.allCountries,
                };
            }
        },
        watch: {
            phone() {
                this.phone = this.phone.replace(/\s+/g, '');
            },
            'user.phone'() {
                this.user.phone = this.user.phone.replace(/\s+/g, '');
            }
        },
        methods: {
            ...mapMutations([
                SET_PLUGIN_ROUTES,
                UPDATE_USER_INFO
            ]),
            ...mapActions([
                SIGN_IN,
                UPDATE_WECHAT_ACCOUNT_INFO,
                UPDATE_ACCOUNT_BALANCE,
                GET_TOKEN,
                UPDATE_MENU_AUTH
            ]),
            stopPending() {
                setTimeout(() => {
                    this.loading = false;
                }, 300);
            },
            async signIn() {
                if (this.email === '') {
                    return this.$toast(this.$t('home.emptyAccountWarn'), 'warn');
                }
                if (this.password === '') {
                    return this.$toast(this.$t('home.emptyPasswordWarn'), 'warn');
                }
                this.loading = true;
                const user = await ManageApi
                    .signIn(this.email, this.password)
                    .then(({body: {data: user}}) => user)
                    .catch(err => {
                        // 登录按钮结束 pending
                        this.stopPending();
                        if (err.body.data && err.body.data.errorCount && err.body.data.surplusTime) {
                            this.errorCount = err.body.data.errorCount;
                            this.surplusTime = err.body.data.surplusTime;
                            if (this.errorCount < 5) {
                                let msg = this.$t('home.lessThan1') + this.errorCount + this.$t('home.lessThan2')
                                    + this.$t('home.lessThan3');
                                this.$toast(msg, 'warn');
                            } else {
                                let msg = this.$t('home.moreThan1') + this.surplusTime + this.$t('home.moreThan2')
                                    + this.$t('home.moreThan3');
                                this.$toast(msg, 'warn');
                                this.disableSignIn = true; // 登录按钮置灰
                                this.second = this.surplusTime;
                                this.loginTimer = setInterval(() => {
                                    if (this.second > 0 && this.second <= this.surplusTime) {
                                        this.second--;
                                    } else {
                                        this.clearLoginTimer();
                                    }
                                }, 1000);
                            }
                        }
                    });
                if (!user) {
                    this.stopPending();
                    return;
                }
                if (user) {
                    this.clearLoginTimer();
                    // 华为账号
                    localStorage.setItem('isHw', user.companyType);
                }
                if (user.hwUrl) {
                    // 华为用户单点登录
                    window.open(user.hwUrl, '_self');
                } if (user.pallUrl && user.SAMLRequest) {
                    // Pall中国用户使用outlook单点登录
                    RenderPallForm({ pallUrl: user.pallUrl, SAMLRequest: user.SAMLRequest });
                } else if (user.isAdmin) {
                    // 跳转到管理系统
                    location.href = LINKS.ADMIN_ORIGIN + '?user=' + JSON.stringify(user);
                } else {
                    // 进入 Dmartech
                    // 初始化"上线至今"时间区间
                    initRanges(user.onlineTime);
                    // 记录用户信息，进入已登录状态
                    if (user.timeZone === '' || user.timeZone === null) {
                        user.timeZone = '+08:00';
                    }
                    this.SIGN_IN(user);

                    // 进一步获取数据前，确保已经进入登录状态
                    await this.$nextTick();

                    if (PRIVATE_DEVELOPMENT) {
                        await Promise.all([
                            // 将授权公众号相关字段补充到用户信息中
                            this.UPDATE_WECHAT_ACCOUNT_INFO(),
                            // 获取短信余量
                            this.UPDATE_ACCOUNT_BALANCE(),
                            this.GET_TOKEN(),
                        ]);
                    } else {
                        await Promise.all([
                            // 将授权公众号相关字段补充到用户信息中
                            this.UPDATE_WECHAT_ACCOUNT_INFO(),
                            // 获取短信余量
                            this.UPDATE_ACCOUNT_BALANCE(),
                        ]);
                    }

                    // 将菜单信息补充到用户信息中，并根据菜单信息加载路由
                    const records = await this.UPDATE_MENU_AUTH();

                    // 根据菜单权限注册路由
                    const [routes, pluginRoutes] = getRoutesByMenuRecords(records);
                    this.$router.addRoutes(routes);
                    this.SET_PLUGIN_ROUTES(pluginRoutes);

                    // 私享会提示
                    localStorage.setItem('privateClub', 'privateClub' + user.id);

                    // 私享会提示
                    localStorage.setItem('privateClub', 'privateClub' + user.id);

                    // 登录流程完毕，跳转业务视图
                    await this.$nextTick();

                    /**
                     * 两步验证
                     * 开启-有手机号：弹窗输入短信验证码
                     * 开启-无手机号：弹窗输入手机号和短信验证码
                     * 未开启：直接登录
                     */
                    GeteOriginApi
                        .getSystemConfig(user.id)
                        .then(res => {
                            let canTWoFactor = res.body.data.flag === 0; // 0:有编辑权限 1:没有
                            let twoFactorOpen = res.body.data.status === 0;// 0 启用 1 禁用

                            // 更新用户信息（是否有两步验证权限）
                            this.UPDATE_USER_INFO({
                                canTWoFactor: canTWoFactor,
                                twoFactorOpen: twoFactorOpen
                            });
                            user.canTWoFactor = canTWoFactor;
                            user.twoFactorOpen = twoFactorOpen;
                            localStorage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(user));

                            if (user && user.canTWoFactor && user.twoFactorOpen) { // 开启两步验证
                                if (user.phone) {
                                    this.codeModalShow = true;
                                } else {
                                    this.phoneModalShow = true;
                                }
                            } else { // 无需两步验证
                                this.loginDmartech();
                            }
                        });
                }
            },
            // 点击按钮-获取验证码
            fetchSMSCode(flag, fromType) {
                // 新增手机号
                if (flag === 'phoneNull') {
                    let phone = this.phone;
                    // 请计时器
                    this.stopTimer = true;
                    if (!phone) {
                        this.$toast(this.$t('personal.phoneNoEmpty'), 'warn');
                        return false;
                    }
                    if (phone && !PHONE_REGEXP.test(phone)) {
                        this.$toast(this.$t('personal.phoneCheck'), 'warn');
                        return false;
                    }
                    if (phone && !this.areaCode) {
                        this.$toast(this.$t('personal.areaCodeNull'), 'warn');
                        return false;
                    }
                    // 登陆
                    if (this.SMSCode && fromType === 'login') {
                        // 请计时器
                        this.stopTimer = true;
                        this.validateSMSCode();
                        return;
                    }
                    // 发送验证码
                    // 开启计时器
                    this.stopTimer = false;

                    // 显示验证码提示信息
                    this.showTipTimeOut();

                    // 全部验证都通过才可点击登陆
                    this.canLogin = true;
                    GeteOriginApi
                        .sendSMSCode(this.user.email, this.loginPwd, phone, this.areaCode)
                        .catch(() => {
                            this.stopTimer = true;
                            this.canLogin = false;
                        });
                }
                // 已有手机号
                if (flag === 'havePhone') {
                    let phone = this.user.phone;

                    // 显示验证码提示信息
                    this.showTipTimeOut();
                    GeteOriginApi
                        .sendSMSCode(this.user.email, this.loginPwd, phone, this.user.areaCode);
                }
            },
            // 关闭验证码弹窗
            closeCodeModal() {
                this.codeModalShow = false;
                this.stopPending();
                this.SMSCode = '';
                this.phone = '';
            },
            // 关闭手机号弹窗
            closePhoneModal() {
                this.phoneModalShow = false;
                this.stopPending();
                this.SMSCode = '';
                this.phone = '';
            },
            // 校验验证码是否正确
            validateSMSCode() {
                let phone = this.phone ? this.phone : this.user.phone;
                GeteOriginApi
                    .verifySMSCode(this.user.email, this.SMSCode, phone)
                    .then(() => {
                        // 新增手机号，验证码正确后，先更新用户信息（主要是更新手机号）
                        if (this.phone) {
                            this.updateUser();
                        }
                        // 验证码正确-更新passTwoFactorOpen状态为true
                        this.UPDATE_USER_INFO({passTwoFactorOpen: true});
                        let user = JSON.parse(localStorage.getItem(USER_INFO_SESSION_KEY));
                        user.passTwoFactorOpen = true;
                        localStorage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(user));

                        this.loginDmartech();
                    });
            },
            // 更新 user
            updateUser() {
                // 获取个人信息（除手机号之外
                let personInfo;
                ManageApi
                    .getUser({id: this.user.id})
                    .then(res => {
                        personInfo = res.body.data.subUser;
                        // 更新个人信息（主要是手机号
                        ManageApi
                            .savePersonal({
                                id: this.user.id,
                                loginName: personInfo.loginName,
                                phone: this.phone,
                                areaCode: this.phone ? this.areaCode : '',
                                iso2: this.phone ? this.iso2 : '',
                                surname: personInfo.surname,
                                theName: personInfo.theName,
                                timeZone: personInfo.timeZone,
                                userName: personInfo.userName
                            })
                            .then(() => {
                                // 保存到 localstorage
                                this.UPDATE_USER_INFO({
                                    phone: this.phone,
                                    areaCode: this.areaCode,
                                    iso2: this.iso2
                                });
                                let user = JSON.parse(localStorage.getItem(USER_INFO_SESSION_KEY));
                                user.phone = this.phone;
                                user.areaCode = user.phone ? this.areaCode : '';
                                user.iso2 = user.phone ? this.iso2 : '';
                                localStorage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(user));
                            });
                    });
            },
            // 登入 Dmartech
            loginDmartech() {
                localStorage.setItem(LOGIN_IN, (new Date).getTime());
                const redirectRoute = this.$route.query.redirect &&
                this.$route.query.cid === this.user.cid
                    ? JSON.parse(this.$route.query.redirect)
                    : {path: '/'};
                this.$router.replace(redirectRoute);
            },
            // 选择国家区号
            countryChanged(obj) {
                this.areaCode = obj.dialCode.toString();// 区号
            },
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
            },
            // 清除登录定时器
            clearLoginTimer() {
                if (this.second === 0) {
                    clearInterval(this.loginTimer);
                    this.loginTimer = null;
                }
                this.disableSignIn = false;
                this.errorCount = 0;
            }
        }
    };
</script>
<style lang="scss" type="text/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .login {
        width: 100vw;
        height: 100vh;
        background: url("login-bg.svg") no-repeat center;
        background-size: cover;

        .msg {
            margin-left: 130px;
        }

        .vue-tel-input {
            display: inline-flex;
            height: 32px;
            width: 272px;
            border-radius: 4px;
            border: 1px solid $border-color;
            box-shadow: none;
            border-radius: 4px;
            font-size: 12px;
            line-height: 16px;
            vertical-align: middle;

            &:hover {
                border-color: $theme;
            }

            .vti__selection {
                width: 80px;
            }

            .vti__dropdown {
                outline: none;
            }

            .vti__dropdown-list {
                width: 272px;
            }
        }

        .go-official {
            float: left;
            margin-top: ($header-height - 24px)/2;
            margin-left: ($header-height - 24px)/2;
            line-height: 24px;
            color: #E4E4E4;
            &:hover {
                text-decoration: underline;
            }
        }
    }

    .login-form {
        position: absolute;
        left: 50%;
        top: 50%;
        @include transform(translate(-50%, -50%));
        display: flex;
        max-width: 688px;
        margin: auto;
        align-items: center;

        @media (max-width: 700px) {
            flex-direction: column;

            .logo {
                width: 85%;
                height: auto;
            }

            .login-table {
                border-top: 1px solid #8daac5;
                margin-top: 2em;
            }
        }

        @media (min-width: 700px) {
            flex-direction: row;

            .logo {
                height: 160px;
                width: auto;
            }

            .login-table {
                border-left: 1px solid #8daac5;
                margin-left: 2em;
            }
        }

        .login-table {
            padding: 2em;
            white-space: nowrap;
        }

    }

    .error-form {
        position: absolute;
        left: 67%;
        top: 70%;
        @include transform(translate(-50%, -50%));
        display: flex;
        max-width: 688px;
        margin: auto;
        align-items: center;
        color: white;
        font-size: 16px;
        word-break: break-word;
    }

    .login-field {
        display: block;
        width: 240px;
        padding: .4rem 1em;
        line-height: 20px;
        margin-bottom: 1em;
        border: 1px solid $border-color;
        color: $theme;
        letter-spacing: 1px;
        border-radius: 4px;
        opacity: .7;
        background-color: $nav-bg;
        @include transition();

        &:focus {
            border-color: $dark-theme;
            @include box-shadow();
        }

        &:-webkit-autofill {
            -webkit-box-shadow: 0 0 0 1000px black inset;
            -webkit-text-fill-color: #fbfbfb !important;
        }
    }

    .site-info {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 1em;
        text-align: center;
        color: $color-light-content;
    }

    .pending-box {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: space-between;
        height: $input-field-height;
        width: 2em;
        margin-right: 1.5em;

        span {
            width: 0.3em;
            height: 1em;
            background-color: $green;
        }

        span:nth-of-type(1) {
            animation: grow 1s -0.45s ease-in-out infinite;
        }

        span:nth-of-type(2) {
            animation: grow 1s -0.3s ease-in-out infinite;
        }

        span:nth-of-type(3) {
            animation: grow 1s -0.15s ease-in-out infinite;
        }

        span:nth-of-type(4) {
            animation: grow 1s ease-in-out infinite;
        }

        @keyframes grow {
            0%,
            100% {
                transform: scaleY(1);
            }

            50% {
                transform: scaleY(2);
            }
        }
    }
</style>
