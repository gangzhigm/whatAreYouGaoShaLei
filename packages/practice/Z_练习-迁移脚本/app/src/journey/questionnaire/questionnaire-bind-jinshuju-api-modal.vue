<template>
    <modal class="questionnaire-bind-jinshuju-api-modal" @close="$emit('close')"
        :title="$t('form.KingDataAPI')" size="lg">
        <!--绑定金数据API注意note-->
        <div class="form-field">
            <p class="orange-text">{{'form.attention' | t}}{{'punctuation.colon' | t}}</p>
            <p class="light-content-text">{{'form.attentionContent' | t}}</p>
            <!-- <p class="light-content-text">{{'form.attentionContent1' | t}}</p> -->
        </div>
        <!--金数据帐号平台-->
        <div class="form-field">
            <label class="label">{{'form.countKind' | t}}</label>
            <radio v-model="meal" :value="1" :source="1">{{'form.personSeal' | t}}</radio>
            <radio v-model="meal" :value="2" :source="2">{{'form.companySeal' | t}}</radio>
        </div>
        <!--金数据API Key-->
        <div class="form-field flex">
            <label class="label">{{'form.apiKey' | t}}</label>
            <div class="form-group">
                <input v-if="meal === 1" class="input lg" :class="{error: cancelApi}" type="text"
                        :placeholder="$t('form.placeApiKey')" :disabled="notEdit"
                        v-model.trim="perapi.key" @focus="canapi" @blur="conapi('perapi')">
                <input v-if="meal === 2" class="input lg" :class="{error: cancelApi}" type="text"
                        :placeholder="$t('form.placeApiKey')" :disabled="notEdit"
                        v-model.trim="comapi.key" @focus="canapi" @blur="conapi('comapi')">
            </div>
        </div>
        <!--金数据API Secret-->
        <div class="form-field flex">
            <label class="label">{{'form.apisecret' | t}}</label>
            <div class="form-group">
                <input v-if="meal === 1" class="input lg" :class="{error: cancelSecret}" type="text"
                        :placeholder="$t('form.placeApiSecret')" :disabled="notEdit"
                        v-model.trim="perapi.secret" @focus="cansecret" @blur="consecret('perapi')">
                <input v-if="meal === 2" class="input lg" :class="{error: cancelSecret}" type="text"
                        :placeholder="$t('form.placeApiSecret')" :disabled="notEdit"
                        v-model.trim="comapi.secret" @focus="cansecret" @blur="consecret('comapi')">
            </div>
        </div>
        <!--企业版API访问地址-->
        <div class="form-field flex" v-if="meal === 2">
            <label class="label">{{'form.companySealAddress' | t}}</label>
            <div class="form-group">
                <input class="input address-size" :class="{error: cancelAddress}" type="text"
                        :placeholder="$t('form.placeApiAddress')" v-model="comapi.address" @focus="canads"
                        @blur="conads" :disabled="notEdit">
            </div>
        </div>
        <!--新增绑定展示的操作按钮-->
        <div class="form-field" v-if="!notEdit">
            <span class="label placeholder"></span>
            <button class="btn btn-md btn-theme" @click="saveApi">{{'common.save' | t}}</button>
            <button class="btn btn-md btn-theme-border" @click="$emit('close')">{{'common.cancel' | t}}
            </button>
        </div>
        <!--编辑、更新时的操作按钮-->
        <div class="form-field" v-else>
            <span class="label placeholder"></span>
            <button class="btn btn-md btn-theme" @click="showEditNotice=true">{{'form.edit' | t}}</button>
        </div>
        <!--指引API相关数据示例-->
        <div class="bind-tips">
            <p class="light-content-text">{{'form.bindGuide' | t}}</p>
            <img src="./img/bind-api-tip.jpg" alt="jinshuju-guide">
        </div>
        <!--确认更新API时的提示-->
        <modal v-if="showEditNotice" :title="$t('form.attention')">
            {{'form.attentionContent' | t}}
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme" :value="$t('form.confirmEdit')"
                       @click="confirmEdit">
                <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')"
                       @click="showEditNotice=false">
                
            </template>
        </modal>
    </modal>
</template>
<script>
    import { QuestionnaireApiJinShuJu } from '@/api';

    export default {
        data() {
            return {
                groupId: 0,         // 表单分组Id
                edit: false,        // 金数据API Id
                meal: 1,            // 金数据套餐类型
                perapi: {
                    key: '',
                    secret: '',
                    address: '',
                },                  // 绑定金数据的相关数据（个人）
                comapi:{
                    key: '',
                    secret: '',
                    address: ''
                },                  // 绑定金数据的相关数据（企业）
                cancelApi: false,   // 校验金数据字段值Key是否为空
                cancelSecret: false,    // 校验金数据字段值Secret是否为空
                cancelAddress: false,   // 校验金数据字段值ddress是否为空
                notEdit: false,         // 是否已绑定API
                showEditNotice: false,  // 确认更新API时的提示模态框显隐
            };
        },
        watch: {
            // 切换个人与企业
            meal() {
                this.cancelApi = false;
                this.cancelSecret = false;
                this.cancelAddress = false;
            }
        },
        created() {
            this.groupId = this.$route.params.groupId || 0;
            // 获取已绑定金数据API内容
            QuestionnaireApiJinShuJu
                .findJinByApi()
                .then(res => {
                    // 有金数据账号
                    if (res.body.data && res.body.data.apiKey) {
                        let api = {
                            key: res.body.data.apiKey,
                            secret: res.body.data.apiSecret,
                            address: res.body.data.url,
                        };
                        this.meal = res.body.data.packageType || 1;
                        this.meal === 1 ? this.perapi = api : this.comapi = api;
                        this.edit = res.body.data.id;
                        this.notEdit = true;
                    } else { //无金数据账号
                        this.notEdit = false;
                    }
                });
        },
        methods: {
            // Key选项，清空错误提示
            canapi() {
                this.cancelApi = false;
            },
            // secret选项，清空错误提示
            cansecret() {
                this.cancelSecret = false;
            },
            // Address选项，清空错误提示
            canads() {
                this.cancelAddress = false;
            },
            // 校验Key选项
            conapi(api) {
                this.cancelApi = !this[api].key;
            },
            // 校验secret选项
            consecret(api) {
                this.cancelSecret = !this[api].secret;
            },
            // 校验Address选项
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
                            this.$toast(this.$t('common.saveSuccess'), 'success');
                            this.notEdit = true;
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
                            this.$toast(this.$t('common.saveSuccess'), 'success');
                            this.notEdit = true;
                        });
                }
            },
            // 点击确认更新绑定的API内容
            confirmEdit() {
                this.notEdit = false;
                this.showEditNotice = false;
            }
        }
    };
</script>
<style lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .questionnaire-bind-jinshuju-api-modal {

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
