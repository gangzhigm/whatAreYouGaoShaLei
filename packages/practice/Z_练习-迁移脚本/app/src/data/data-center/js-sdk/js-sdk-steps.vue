<template>
    <div class="js-sdk">
        <!--步骤-->
        <ul class="steps">
            <li v-for="i in total" :class="[i <= pageNow ? 'active' : '', !isAdd ? 'edit': '']"
                @click="!isAdd ? pageClick(i) : ''">
                <!--@click="!isAdd ? pageClick(i) : (i <= pageNow ? pageClick(i) : '')"-->
                <template v-if="i <= pageNow">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-correct"></use>
                    </svg>
                </template>
                <template v-else>
                    {{i}}
                </template>
            </li>
        </ul>
        <!--step 1-->
        <div class="step" v-if="stepId == 1">
            <div class="title">{{'dataCenter.createPrivateKey' | t}}</div>
            <div class="sub-content">
                <div class="form-field">
                    <label class="label" for="name">{{'dataCenter.sourceName' | t}}</label>
                    <input type="text" class="input" :class="{error: sourceNameErr}" id="name" maxlength="30"
                           :placeholder="$t('dataCenter.sourceName')" v-model="sdk.dataSet" v-title:top.warn.line="sourceNameErr"
                           @click="sourceNameErr = ''">
                </div>
                <div class="form-field sdk-margin">
                    <label class="label" for="safeSwitch">{{'dataCenter.securityCheck' | t}}</label>
                    <switch-button id="safeSwitch" v-model="sdk.safeEnabled"></switch-button>
                </div>
                <div class="form-field" v-if="sdk.safeEnabled">
                    <label class="label" for="expireInput">{{'dataCenter.expire' | t}}</label>
                    <input type="text" class="input" :class="{error: expireErr}" id="expireInput"
                            maxlength="7" :placeholder="$t('dataCenter.expire')" v-model="sdk.expire"
                            v-title:top.warn.line="expireErr" @click="expireErr = ''">
                    {{'analysis.second' | t}}
                </div>
                <div class="shell">
                    <button class="btn btn-md btn-theme" @click="createJsSdk">
                        {{'dataCenter.createPrivateKey' | t}}
                    </button>
                </div>
            </div>
        </div>
        <!--step 2-->
        <div class="step selectable" v-if="stepId == 2">
            <div class="title">{{'dataCenter.createPrivateKey' | t}}</div>
            <div class="sub-content">
                <div class="form-field">
                    <label class="label" for="secret">SECRET</label>
                    <span id="secret">{{sdk.secret || this.$t('common.noData')}}</span>
                    <button class="action-icon icon icon-refresh" @click="updateSecret">
                    {{'dataCenter.rebuilt' | t}}
                    </button>
                </div>
                <div class="form-field" v-if="sdk.safeEnabled">
                    <label class="label" for="key">KEY</label>
                    <span id="key">{{sdk.key || this.$t('common.noData')}}</span>
                    <button class="action-icon icon icon-refresh" @click="updateKey">
                    {{'dataCenter.rebuilt' | t}}
                    </button>
                </div>
                <div class="form-field" v-if="!sdk.safeEnabled">
                    <label class="label" for="safeEnabled">{{'dataCenter.securityCheck' | t}}</label>
                    <span id="safeEnabled">{{'dataCenter.closed' | t}}</span>
                </div>
                <div class="form-field" v-if="sdk.expire&&sdk.safeEnabled">
                    <label class="label" for="expire">{{'dataCenter.expire' | t}}</label>
                    <span id="expire">{{sdk.expire || this.$t('common.noData')}}</span>
                    <span v-if="sdk.expire">{{'analysis.second' | t}}</span>
                </div>
                <div class="shell">
                    <router-link tag="button" class="btn btn-md btn-theme" v-if="isAdd"
                                 :to="{name:'jsSdk',
                                 query: {id: this.$route.query.id, step: 3, type: 'jsSdk'}}">
                        {{'dataCenter.next' | t}}
                    </router-link>
                    <router-link tag="button" class="btn btn-md btn-theme" v-else
                                 :to="{name:'jsSdkDetails',
                                 query: {id: this.$route.query.id, name: 'set', step: 3, type: 'jsSdk'}}">
                        {{'dataCenter.next' | t}}
                    </router-link>
                </div>
            </div>
        </div>
        <!--step 3-->
        <div class="step" v-if="stepId == 3">
            <div class="title">{{'dataCenter.createPrivateKey' | t}}</div>
            <div class="sub-content step3">
                <div class="icon">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-success"></use>
                    </svg>
                </div>
                <div class="msg-name">{{'dataCenter.succeed' | t}}</div>
                <div class="msg-text">{{'dataCenter.viewStatus' | t}}</div>
                <div class="shell">
                    <router-link tag="button" class="btn btn-md btn-theme"
                                 :to="{name:'jsSdkDetails', query: {id: $route.query.id}}">
                        {{'dataCenter.viewSource' | t}}
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { EtlApiV1 } from '@/api';
    import {COMMON_NAME_REGEXP} from '../../../common/utils/regs';

    export default {
        name: 'js-sdk-steps',
        props: {
            // 步骤id
            stepId: {
                type: [Number, String],
                required: true,
            },
            // 是否为新增
            isAdd: {
                type: Boolean,
                required: true,
            },
        },
        computed: {
            //当前步骤
            pageNow() {
                return this.$route.query.step;
            },
            safeEnabled() {
                return this.sdk.safeEnabled;
            }
        },
        data() {
            return {
                sdk: {
                    id: this.$route.query.id,
                    safeEnabled: true,
                    expire: 300,
                },
                tempExpire: 300, //临时存储有效时长
                // 总步数
                total: 3,
                sourceNameErr: '',
                expireErr: '',
            };
        },
        mounted() {
            let query = this.$route.query;
            // 地址栏改地址
            if (!query.id || !query.step || !query.type) {
                this.$router.push({
                    name: 'jsSdk',
                    query: {
                        // id: query.id,
                        // name: query.name,
                        step: 1,
                        type: 'jsSdk',
                    }
                });
            }
            // 进入页面默认获取sdk详情信息
            if (query.id !== null && query.id !== '' && query.id !== undefined) {
                this.fetchSdk();
            }
        },
        watch: {
            safeEnabled(val) {
                if (val) {
                    this.sdk.expire = this.tempExpire;
                } else {
                    this.tempExpire = this.sdk.expire ? this.sdk.expire : 300;
                    this.sdk.expire = '';
                }
            }
        },
        methods: {
            // step 1 数据源名称校验
            verify() {
                this.sourceNameErr = '';
                this.expireErr = '';
                if (!this.sdk.dataSet) {
                    this.sourceNameErr = this.$t('dataCenter.sourceNameNoEmpty');
                    return false;
                }

                if (!COMMON_NAME_REGEXP.test(this.sdk.dataSet)) {
                    this.sourceNameErr = this.$t('dataCenter.sourceNameReg');
                    return false;
                }
                if (this.sdk.safeEnabled) {
                    let reg = /^[1-9]\d*$/;
                    if (!this.sdk.expire && this.sdk.expire !== 0) {
                        this.expireErr = this.$t('dataCenter.expireNoEmpty');
                        return false;
                    }
                    if (!reg.test(this.sdk.expire)) {
                        this.expireErr = this.$t('dataCenter.expireReg');
                        return false;
                    }
                    // this.sdk.expire may ''
                    /*eslint-disable-next-line*/
                    if (this.sdk.expire > 2592000 || this.sdk.expire == 0){
                        this.expireErr = this.$t('dataCenter.expireRangeReg');
                        return false;
                    }
                }
                return true;
            },

            /**
             * 点击页码跳转
             * 新增时页码不可向前点击，只能回退(todo)
             * 修改时都可以点击
             * @param no    点击的页码
             */
            pageClick(no) {
                // 修改
                if (!this.isAdd) {
                    // sdk step 1 保存
                    if (!this.verify()) {
                        return;
                    }
                    this.$loading();
                    EtlApiV1.updateServiceSdk({id: this.sdk.id, dataSet: this.sdk.dataSet,
                        expire: this.sdk.expire, safeEnabled: this.sdk.safeEnabled})
                        .then(res => {
                            this.sdk = res.body.data.sdk;
                            this.tempExpire = this.sdk.expire ? this.sdk.expire : 300;
                            // 更新sdk
                            this.$emit('updateSdk', this.sdk);
                            // 跳转到相应的step
                            this.$router.push({
                                name: this.$route.name,
                                query: {
                                    id: this.$route.query.id,
                                    name: this.$route.query.name,
                                    step: no ? no : this.$route.query.step,
                                    type: 'jsSdk',
                                },
                            });

                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                } else {
                    // 新增
                    if (no < this.pageNow) {
                        this.$router.push({
                            name: this.$route.name,
                            query: {
                                id: this.$route.query.id,
                                step: no ? no : this.$route.query.step,
                                type: 'jsSdk'
                            },
                        });
                    }
                }
            },

            // step 1 创建 service sdk todo 多次点击创建密钥
            createJsSdk() {
                if (!this.verify()) {
                    return;
                }
                // 新增
                if (this.isAdd) {
                    this.$loading();
                    EtlApiV1
                        .getServiceSdk({dataSet: this.sdk.dataSet, language: 'javascript', expire: this.sdk.expire, safeEnabled: this.sdk.safeEnabled})
                        .then(res => {
                            this.sdk = res.body.data.sdk;
                            this.tempExpire = this.sdk.expire ? this.sdk.expire : 300;
                            // 创建密钥
                            this.$router.push({
                                name: 'jsSdk',
                                query: {id: this.sdk.id, step: 2, type: 'jsSdk'},
                            });
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                } else {
                    // 修改
                    this.$loading();
                    EtlApiV1.updateServiceSdk({id: this.sdk.id, dataSet: this.sdk.dataSet,
                        expire: this.sdk.expire, safeEnabled: this.sdk.safeEnabled})
                        .then(res => {
                            this.sdk = res.body.data.sdk;
                            this.tempExpire = this.sdk.expire ? this.sdk.expire : 300;
                            // 更新sdk
                            this.$emit('updateSdk', this.sdk);

                            // 创建密钥
                            this.$router.push({
                                name: 'jsSdkDetails',
                                query: {
                                    id: this.sdk.id,
                                    name: 'set',
                                    // previewName: 'user',
                                    step: 2,
                                    type: 'jsSdk'
                                },
                            });
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                }
            },

            //获取sdk详情
            fetchSdk() {
                this.$loading();
                EtlApiV1
                    .getSDKDetails(this.$route.query.id)
                    .then(res => {
                        this.sdk = res.body.data.sdk;
                        this.tempExpire = this.sdk.expire ? this.sdk.expire : 300;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            // 更新密钥
            updateSecret() {
                const confirmationMessage = this.$t('dataCenter.reCreate');
                this.$confirm(this.$t('dataCenter.confirmCreate'), confirmationMessage)
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            EtlApiV1
                                .updateServiceSecret(this.sdk.id)
                                .then(res => {
                                    this.sdk = res.body.data.sdk;
                                    this.tempExpire = this.sdk.expire ? this.sdk.expire : 300;
                                    this.$emit('updateSdk', this.sdk);
                                    this.$loaded();
                                });
                        }
                    })
                    .catch(() => {
                        this.$loaded();
                    });

            },

            // 更新Key
            updateKey () {
                const confirmationMessage = this.$t('dataCenter.reCreate');
                this.$confirm(this.$t('dataCenter.confirmCreate'), confirmationMessage)
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            EtlApiV1
                                .updateServiceKey(this.sdk.id)
                                .then(res => {
                                    this.sdk = res.body.data.sdk;
                                    this.tempExpire = this.sdk.expire ? this.sdk.expire : 300;
                                    this.$emit('updateSdk', this.sdk);
                                    this.$loaded();
                                });
                        }
                    })
                    .catch(() => {
                        this.$loaded();
                    });

            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../scss/step-anchor';
    @import '../scss/step-content';
    .js-sdk {
        .step {
        // step 3
            .step3 {
                .icon {
                    text-align: center;
                    margin: 40px 0 8px 0;
                    svg {
                        width: 40px;
                        height: 40px;
                        fill: $green;
                    }
                }
            }
        }
        .selectable {
            user-select: text;
        }
    }

</style>
