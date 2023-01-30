<template>
    <div class="questionnaire-bind-jinshuju-api">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="content-view bind-form white-bg padding">
            <div class="form-field">
                <p class="orange-text">{{'form.attention' | t}}{{'punctuation.colon' | t}}</p>
                <p class="light-content-text">{{'form.attentionContent' | t}}</p>
                <p class="light-content-text">{{'form.attentionContent1' | t}}</p>
            </div>
            <div class="form-field">
                <label class="label">{{'form.countKind' | t}}</label>
                <radio v-model="meal" :value="1" :source="1">{{'form.personSeal' | t}}</radio>
                <radio v-model="meal" :value="2" :source="2">{{'form.companySeal' | t}}</radio>
            </div>
            <div class="form-field flex">
                <label class="label">{{'form.apiKey' | t}}</label>
                <div class="form-group">
                    <input v-if="meal === 1" class="input lg" :class="{error: cancelApi}" type="text"
                           :placeholder="$t('form.placeApiKey')"
                           v-model.trim="perapi.key" @focus="canapi" @blur="conapi('perapi')">
                    <input v-if="meal === 2" class="input lg" :class="{error: cancelApi}" type="text"
                           :placeholder="$t('form.placeApiKey')"
                           v-model.trim="comapi.key" @focus="canapi" @blur="conapi('comapi')">
                </div>
            </div>
            <div class="form-field flex">
                <label class="label">{{'form.apisecret' | t}}</label>
                <div class="form-group">
                    <input v-if="meal === 1" class="input lg" :class="{error: cancelSecret}" type="text"
                           :placeholder="$t('form.placeApiSecret')"
                           v-model.trim="perapi.secret" @focus="cansecret" @blur="consecret('perapi')">
                    <input v-if="meal === 2" class="input lg" :class="{error: cancelSecret}" type="text"
                           :placeholder="$t('form.placeApiSecret')"
                           v-model.trim="comapi.secret" @focus="cansecret" @blur="consecret('comapi')">
                </div>
            </div>
            <div class="form-field flex" v-if="meal === 2">
                <label class="label">{{'form.companySealAddress' | t}}</label>
                <div class="form-group">
                    <input class="input address-size" :class="{error: cancelAddress}" type="text"
                           :placeholder="$t('form.placeApiAddress')" v-model="comapi.address" @focus="canads"
                           @blur="conads">
                </div>
            </div>
            <div class="form-field">
                <span class="label placeholder"></span>
                <button class="btn btn-md btn-theme" @click="saveApi">{{'common.save' | t}}</button>
                <button class="btn btn-md btn-theme-border" @click="$router.back()">{{'common.cancel' | t}}
                </button>
            </div>
            <div class="bind-tips">
                <p class="light-content-text">{{'form.bindGuide' | t}}</p>
                <img src="./img/bind-api-tip.jpg" alt="jinshuju-guide">
            </div>
        </div>
        <modal v-if="successTip" :title="$t('common.notice')" @close="closeTip">
            <div class="notice">{{'form.saveNotice' | t}}</div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme-border" :value="$t('form.bcList')"
                       @click="closeTip('back')">
                <input type="button" class="btn btn-md btn-theme" :value="$t('form.ntList')"
                       @click="closeTip('next')">
            </template>
        </modal>
    </div>
</template>
<script>
    import { QuestionnaireApiJinShuJu } from '@/api';

    export default {
        data() {
            return {
                groupId: 0,
                successTip: false, // 保存成功弹窗提示
                edit: false,
                meal: 1, // 金数据套餐类型
                perapi: {
                    key: '',
                    secret: '',
                    address: '',
                },
                comapi:{
                    key: '',
                    secret: '',
                    address: ''
                },
                cancelApi: false,
                cancelSecret: false,
                cancelAddress: false,
            };
        },
        watch: {
            meal() {
                this.cancelApi = false;
                this.cancelSecret = false;
                this.cancelAddress = false;
            }
        },
        computed: {
            crumbs() {
                return [
                    {name: 'journey', text: 'Dmartech'},
                    {name: 'journeyFormManagement', text: this.$t('home.leads'), params: {id: 0}},
                    {name: 'jinshujuAPI', text: this.$t('home.jinshujuAPI')}
                ];
            },
        },
        created() {
            this.groupId = this.$route.params.groupId || 0;
            QuestionnaireApiJinShuJu
                .findJinByApi()
                .then(res => {
                    if (res.body.data) {
                        let api = {
                            key: res.body.data.apiKey,
                            secret: res.body.data.apiSecret,
                            address: res.body.data.url,
                        };
                        this.meal = res.body.data.packageType || 1;
                        this.meal === 1 ? this.perapi = api : this.comapi = api;
                        this.edit = res.body.data.id;
                    }
                });
        },
        methods: {
            closeTip(act) {
                this.successTip = false;
                if (act === 'back') {
                    this.$router.back();
                } else if (act === 'next') {
                    this.$router.push({name: 'questionnaireForm', params: {groupId: this.groupId, id: -1}});
                }
            },
            canapi() {
                this.cancelApi = false;
            },
            cansecret() {
                this.cancelSecret = false;
            },
            canads() {
                this.cancelAddress = false;
            },
            conapi(api) {
                this.cancelApi = !this[api].key;
            },
            consecret(api) {
                this.cancelSecret = !this[api].secret;
            },
            conads() {
                this.cancelAddress = !this.comapi.address;
            },
            // 保存api
            saveApi() {
                let api = this.meal === 1 ? 'perapi' : 'comapi';
                if (!this[api].key) {
                    this.$toast(this.$t('form.noneKey'), 'round-close');
                    this.conapi(api);
                    return;
                }
                if (!this[api].secret) {
                    this.$toast(this.$t('form.noneSecret'), 'round-close');
                    this.consecret(api);
                    return;
                }
                if (this.meal === 2 && !this.comapi.address) {
                    this.$toast(this.$t('form.noneAddress'), 'round-close');
                    this.conads();
                    return;
                }
                let params;
                if (this.edit) {
                    if (this.meal === 1) {
                        params = {
                            id: this.edit,
                            apiKey: this.perapi.key,
                            apiSecret: this.perapi.secret,
                            packageType: this.meal,
                            url: ''
                        };
                    } else {
                        params = {
                            id: this.edit,
                            apiKey: this.comapi.key,
                            apiSecret: this.comapi.secret,
                            packageType: this.meal,
                            url: this.comapi.address
                        };
                    }
                    // 编辑
                    QuestionnaireApiJinShuJu
                        .editKingApi(params)
                        .then(() => {
                            this.successTip = true;
                        });
                } else {
                    if (this.meal === 1) {
                        params = {
                            apiKey: this.perapi.key,
                            apiSecret: this.perapi.secret,
                            packageType: this.meal,
                            url: ''
                        };
                    } else {
                        params = {
                            apiKey: this.comapi.key,
                            apiSecret: this.comapi.secret,
                            packageType: this.meal,
                            url: this.comapi.address
                        };
                    }
                    // 创建
                    QuestionnaireApiJinShuJu
                        .createKingApi(params)
                        .then(() => {
                            this.successTip = true;
                        });
                }
            }
        }
    };
</script>
<style lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .bind-form {
        overflow: auto;
        height: calc(100vh - #{$header-height + $toolbar-height + $input-field-height});

        .label {
            white-space: nowrap;
            width: 128px;
        }

        .bind-tips {
            margin-top: $input-field-height;
            padding-top: 16px;
            border-top: 1px solid $border-color;

            img {
                display: block;
                width: 500px;
                margin-top: $input-field-height/2;
                border: 1px solid $border-color;
            }
        }
        .address-size {
            width: 50em;
        }
    }
</style>
