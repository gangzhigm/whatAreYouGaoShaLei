<template>
    <div class="personal-setting">
        <div class="content-view">
            <crumbs/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <div class="pull-right">
                    <button type="button" class="btn btn-md btn-theme" @click="savePersonal">{{'common.save' | t}}
                    </button>
                </div>
                <h1>{{'personal.personalSettings' | t}}</h1>
            </div>
        </div>
        <div class="page-content">
            <div class='content-view white-bg padding margin'>
                <h4 class="login-Info">{{'personal.loginInfo' | t}}</h4>
                <div class="form-field flex">
                    <label class="label">{{'personal.email' | t}}</label>
                    <p class='login-name'>
                        {{personalSetting.loginName}}
                    </p>
                    <button class="personal-theme-text" @click="settingPassword">{{'personal.general' | t}}</button>
                </div>
                <div class="form-field">
                    <label for="userName" class="label">{{'personal.userName' | t}}</label>
                    <input id="userName" type="text" class="input setting-input" v-model.trim="personalSetting.userName"
                           autofocus maxlength="30" @focusin="errorTextUserName = ''"
                           v-title:top.line.warn="errorTextUserName" :class="{error: errorTextUserName}">
                </div>
                <div class="form-field">
                    <label class="label">{{'personal.jobNumber' | t}}</label>
                    <span>{{personalSetting.userNumber}}</span>
                </div>
                <div class="form-field">
                    <label class="label" for="phoneNo">{{'personal.phone' | t}}</label>
                    <!--https://cnpmjs.org/package/vue-tel-input-->
                    <vue-tel-input v-model="personalSetting.phone" v-bind="telInputData"
                                   @country-changed="countryChanged"/>
                    <vue-timer :time-count="TIME_COUNT" :disabled="!personalSetting.phone"
                               :stopTimer="stopTimer" @change="fetchSMSCode"/>
                </div>
                <div class="form-field " v-if="personalSetting.phone">
                    <label class="label">{{'personal.validateCode' | t}}</label>
                    <input type="text" class="input setting-input" v-model.trim="personalSetting.smsCode"
                           maxlength="10">
                </div>
                <div class="form-field">
                    <label class="label">{{'personal.lastName' | t}}</label>
                    <input type="text" class="input setting-input" v-model.trim="personalSetting.surname" autofocus
                           maxlength="30" @focusin="errorTextLastName = ''"
                           v-title:top.line.warn="errorTextLastName" :class="{error: errorTextLastName}">
                </div>
                <div class="form-field">
                    <label class="label">{{'personal.firstName' | t}}</label>
                    <input type="text" class="input setting-input" v-model.trim="personalSetting.theName" autofocus
                           maxlength="30" @focusin="errorTextFirstName = ''"
                           v-title:top.line.warn="errorTextFirstName" :class="{error: errorTextFirstName}">
                </div>
                <div class="form-field">
                    <label class="label">{{'personal.timeZone' | t}}</label>
                    <selector class="xl " :options="timeZoneRanges" search
                              v-model="personalSetting.timeZone"></selector>
                </div>
                <div class="form-field">
                    <label class="label">{{'personal.defaultLanguage' | t}}</label>
                    <selector :options="languageList" class="xl" v-model="personalSetting.language"></selector>
                </div>
                <div v-if="personalSetting.status === 3 || personalSetting.status === 4">
                    <div class="form-field flex">
                        <label class="label">{{'personal.userStatus' | t}}</label>
                        <span>{{personalSetting.status === 3 ? activate : deactive}}</span>
                    </div>
                    <div class="setting-form">
                        <h4 class="label">{{'personal.department' | t}}</h4>
                        <div class="form-field flex">
                            <label class="label">
                                <span>{{'personal.selectDepartment' | t}}</span>
                            </label>
                            <span>{{personalSetting.departmentName}}</span>
                        </div>
                    </div>
                    <div class="setting-form">
                        <h4 class="label">{{'personal.selectedSecurityGrpups' | t}}</h4>
                        <div class="form-field flex">
                            <label class="label">{{'personal.securityGrpups' | t}}</label>
                            <span>{{personalSetting.roleNames}}</span>
                        </div>
                    </div>
                    <div class="setting-form">
                        <h4 class="label">{{'personal.Licensing' | t}}</h4>
                        <div class="form-field flex">
                            <label class="label">{{'personal.Licen' | t}}</label>
                            <span>{{personalSetting.menuNames}}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 修改密码 -->
        <confirm :title="$t('home.changePassword')" v-if="changePasswordModalOpen" @cancel="cancelPasswordChange"
                 @confirm="changePassword">
            <div class="form-field">
                <label class="label" for="old-password">{{'home.oldPassword' | t}}</label>
                <password v-model="oldPassword" id="old-password"/>
            </div>
            <div class="form-field flex">
                <label class="label" for="new-password">{{'home.newPassword' | t}}</label>
                <div class="field-group">
                    <password v-model="newPassword" id="new-password"/>
                    <p class="light-content-text">{{'home.passwordLengthTip' | t}}</p>
                </div>
            </div>
        </confirm>
    </div>
</template>
<script type="text/babel">
    import {TIME_ZONE_RNAGES} from '@/common/utils/timeZone';
    import {UPDATE_USER_INFO} from '@/store/vuex/mutationTypes';
    import Password from '../layout/header/password.vue';
    import {MEMBER_NAME_REGEXP, COMMON_NAME_REGEXP, PHONE_REGEXP} from '@/common/utils/regs';
    import {allCountries} from '@/common/components/vue-input-tel/vue-tel-input-data';
    import {USER_INFO_SESSION_KEY} from '@/store/vuex/rootStore';
    import { ManageApi, GeteOriginApi } from '@/api';
    import { mapState, mapMutations } from 'vuex';

    const TIME_COUNT = 60;

    export default {
        components: {
            Password,
        },
        data() {
            return {
                // 修改密码
                changePasswordModalOpen: false, // 修改密码弹出层
                oldPassword: '',
                newPassword: '',
                personalSetting: {
                    id: '',
                    phone: '',
                    smsCode: '',//验证码
                    surname: '',
                    theName: '',
                    timeZone: '',
                    userName: '',
                    status: '',
                    language: '',  // 默认语言
                },
                activate: this.$t('personal.activate'),
                deactive: this.$t('personal.deactive'),
                timeZoneRanges: TIME_ZONE_RNAGES,
                // 正则验证
                errorTextUserName: '',
                errorTextLastName: '',
                errorTextFirstName: '',
                TIME_COUNT,
                stopTimer: false,   // 停止倒计时
                allCountries,       // 国际区号列表
                areaCode: '',   // 区号
                iso2: '',       // 国家
                languageList: [
                    {id: 0, name: this.$t('newJourney.all')},
                    {id: 1, name: this.$t('newJourney.chinese')},
                    {id: 2, name: this.$t('newJourney.others')}
                ],        // 默认语言列表
            };
        },
        computed: {
            ...mapState(['user']),
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
        mounted() {
            this.getUser();
        },
        watch: {
            'personalSetting.phone'() {
                this.personalSetting.phone = this.personalSetting.phone.replace(/\s+/g, '');
            }
        },
        methods: {
            ...mapMutations([
                UPDATE_USER_INFO
            ]),
            getUser() {
                ManageApi
                    .getUser({
                        id: this.user.id,
                    })
                    .then((res) => {
                        this.personalSetting = res.body.data.subUser;

                        if (res.body.data.subUser.timeZone === '' || res.body.data.subUser.timeZone === null) {
                            this.personalSetting.timeZone = '+08:00';
                        }

                        this.UPDATE_USER_INFO({
                            phone: this.personalSetting.phone,
                            areaCode: this.personalSetting.areaCode,
                            iso2: this.personalSetting.iso2,
                            language: ~~this.personalSetting.language,
                            timeZone: this.personalSetting.timeZone
                        });
                        let user = JSON.parse(localStorage.getItem(USER_INFO_SESSION_KEY));
                        user.phone = this.personalSetting.phone;
                        user.areaCode = user.phone ? this.personalSetting.areaCode : '';
                        user.iso2 = user.phone ? this.personalSetting.iso2 : '';
                        // 语言与时区
                        user.language = ~~this.personalSetting.language;
                        user.timeZone = this.personalSetting.timeZone;
                        localStorage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(user));
                        // 保存重新获取信息后，要清空计时器
                        this.stopTimer = true;
                    });
            },
            // 选择国家区号
            countryChanged(obj) {
                this.areaCode = obj.dialCode.toString();// 区号
                this.iso2 = obj.iso2;// 国家
            },
            settingPassword() {
                this.changePasswordModalOpen = true;
            },
            cancelPasswordChange() {
                this.newPassword = '';
                this.oldPassword = '';
                this.changePasswordModalOpen = false;
            },
            changePassword() {
                if (this.newPassword === '') {
                    return this.$toast(this.$t('home.newPasswordEmptyWarn'), 'warn');
                }
                if (this.newPassword.length < 8 || this.newPassword.length > 20) {
                    return this.$toast(this.$t('home.newPasswordLengthWarn'), 'warn');
                }
                if (this.oldPassword === '') {
                    return this.$toast(this.$t('home.oldPasswordEmptyWarn'), 'warn');
                }
                if (this.oldPassword.length < 8 || this.oldPassword.length > 20) {
                    return this.$toast(this.$t('home.oldPasswordLengthWarn'), 'warn');
                }
                GeteOriginApi
                    .changePassword(
                        this.user.email,
                        this.newPassword,
                        this.oldPassword
                    )
                    .then(() => {
                        this.$toast(this.$t('home.changeSuccess'), 'success');
                        this.newPassword = '';
                        this.oldPassword = '';
                        this.changePasswordModalOpen = false;
                    });
            },

            // 获取验证码
            fetchSMSCode() {
                if (this.personalSetting.phone) {
                    if (!PHONE_REGEXP.test(this.personalSetting.phone)) {
                        this.$toast(this.$t('personal.phoneCheck'), 'warn');
                        this.stopTimer = true;
                        return false;
                    }
                    this.stopTimer = false;
                    GeteOriginApi
                        .sendSMSCode(this.user.email, '', this.personalSetting.phone, this.areaCode)
                        .catch(() => {
                            this.stopTimer = true;
                        });
                }
            },
            // 验证
            verify() {
                this.errorTextUserName = '';
                this.errorTextLastName = '';
                this.errorTextFirstName = '';
                if (!this.personalSetting.userName) {
                    this.errorTextUserName = this.$t('personal.userNameNoEmpty');
                    return false;
                }
                if (!MEMBER_NAME_REGEXP.test(this.personalSetting.userName)) {
                    this.errorTextUserName = this.$t('personal.userNameReg');
                    return false;
                }
                if (this.personalSetting.phone) {
                    if (!PHONE_REGEXP.test(this.personalSetting.phone)) {
                        this.$toast(this.$t('personal.phoneCheck'), 'warn');
                        return false;
                    } else if (!this.areaCode) {
                        this.$toast(this.$t('personal.areaCodeNull'), 'warn');
                        return false;
                    } else if (!this.personalSetting.smsCode) {
                        this.$toast(this.$t('personal.validateCodeNull'), 'warn');
                        return false;
                    }
                }
                if (this.user.canTWoFactor && this.user.twoFactorOpen && !this.personalSetting.phone) {
                    this.$toast(this.$t('personal.phoneNull'), 'warn');
                    return false;
                }
                if (!COMMON_NAME_REGEXP.test(this.personalSetting.surname)) {
                    this.errorTextLastName = this.$t('personal.lastNameReg');
                    return false;
                }
                if (!COMMON_NAME_REGEXP.test(this.personalSetting.theName)) {
                    this.errorTextFirstName = this.$t('personal.firstNameReg');
                    return false;
                }
                if (!this.personalSetting.timeZone) {
                    this.$toast(this.$t('personal.timeZoneNoEmpty'), 'warn');
                    return false;
                }
                if (this.personalSetting.language === '') {
                    this.$toast(this.$t('personal.languageNoEmpty'),' warn');
                    return false;
                }
                return true;
            },
            //保存
            savePersonal() {
                if (!this.verify()) {
                    return;
                }
                // 有手机号、验证码，保存用户信息
                if (this.personalSetting.phone && this.personalSetting.smsCode) {
                    // 校验验证码
                    GeteOriginApi.verifySMSCode(this.user.email, this.personalSetting.smsCode, this.personalSetting.phone)
                        .then(() => {
                            this.savePersonInfo();
                        });
                    return;
                }
                // 无手机号，保存用户信息
                this.savePersonInfo();
            },
            // 保存用户信息
            savePersonInfo() {
                ManageApi
                    .savePersonal({
                        id: this.user.id,
                        loginName: this.personalSetting.loginName,
                        phone: this.personalSetting.phone,
                        areaCode: this.personalSetting.phone ? this.areaCode : '', // 区号
                        iso2: this.personalSetting.phone ? this.iso2 : '',  // 国家
                        surname: this.personalSetting.surname,
                        theName: this.personalSetting.theName,
                        timeZone: this.personalSetting.timeZone,
                        userName: this.personalSetting.userName,
                        language: this.personalSetting.language
                    })
                    .then(() => {
                        this.$toast(this.$t('personal.success'), 'success');
                        this.getUser();
                    });
            }
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../common/scss/base/variables";
    @import "../common/scss/base/mixin";

    .personal-setting {
        .form-field {
            .setting-input {
                width: 277px;
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
        }

        .label {
            margin: 0 12px 0 0;
            width: 144px;
            vertical-align: top;
            text-align: right;
        }

        .personal-theme-text {
            border: none;
            color: $green;
            cursor: pointer;
        }

        .login-Info {
            width: 144px;
            vertical-align: top;
            margin-right: 12px;
            color: $color-content;
            text-align: right;
        }

        .setting-form {
            margin: 14px 0;
        }

        .login-name {
            width: 17em;
        }
    }
</style>
