<template>
    <div>
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
                           @click="sourceNameErr = ''" @keydown.enter="createServiceSdk">
                </div>
                <div class="shell">
                    <button class="btn btn-md btn-theme" @click="createServiceSdk">
                        {{'dataCenter.createPrivateKey' | t}}
                    </button>
                </div>
            </div>
        </div>
        <!--step 2-->
        <div class="step" v-if="stepId == 2">
            <div class="title">{{'dataCenter.createPrivateKey' | t}}</div>
            <div class="sub-content">
                <div class="form-field">
                    <label class="label" for="name">SECRET</label>
                    <span>{{sdk.secret || '暂无'}}</span>
                    <button class="action-icon icon icon-refresh" @click="updateSecret">
                        {{'dataCenter.rebuilt' | t}}
                    </button>
                </div>
                <div class="shell">
                    <router-link tag="button" class="btn btn-md btn-theme" v-if="isAdd"
                                 :to="{name:'sdk',
                                 query: {id: this.$route.query.id, step: 3, type: 'serveSdk'}}">
                        {{'dataCenter.next' | t}}
                    </router-link>
                    <router-link tag="button" class="btn btn-md btn-theme" v-else
                                 :to="{name:'sdkDetails',
                                 query: {id: this.$route.query.id, name: 'set', step: 3, type: 'serveSdk'}}">
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
                                 :to="{name:'sdkDetails', query: {id: $route.query.id}}">
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
        name: 'sdk-steps',
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
        },
        data() {
            return {
                sdk: {
                    id: this.$route.query.id,
                },
                // 总步数
                total: 3,
                sourceNameErr: '',
            };
        },
        mounted() {
            let query = this.$route.query;
            // 地址栏改地址
            if (!query.id || !query.step || !query.type) {
                this.$router.push({
                    name: 'sdk',
                    query: {
                        // id: query.id,
                        // name: query.name,
                        step: 1,
                        type: 'serveSdk',
                    }
                });
            }
            // 进入页面默认获取sdk详情信息
            if (query.id !== null && query.id !== '' && query.id !== undefined) {
                this.fetchSdk();
            }
        },
        methods: {
            // step 1 数据源名称校验
            verify() {
                this.sourceNameErr = '';

                if (!this.sdk.dataSet) {
                    this.sourceNameErr = this.$t('dataCenter.sourceNameNoEmpty');
                    return false;
                }

                if (!COMMON_NAME_REGEXP.test(this.sdk.dataSet)) {
                    this.sourceNameErr = this.$t('dataCenter.sourceNameReg');
                    return false;
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
                    EtlApiV1.updateServiceSdk({id: this.sdk.id, dataSet: this.sdk.dataSet})
                        .then(res => {
                            this.sdk = res.body.data.sdk;

                            // 更新sdk
                            this.$emit('updateSdk', this.sdk);

                            // 跳转到相应的step
                            this.$router.push({
                                name: this.$route.name,
                                query: {
                                    id: this.$route.query.id,
                                    name: this.$route.query.name,
                                    step: no ? no : this.$route.query.step,
                                    type: 'serveSdk',
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
                                type: 'serveSdk'
                            },
                        });
                    }
                }
            },

            // step 1 创建 service sdk todo 多次点击创建密钥
            createServiceSdk() {
                if (!this.verify()) {
                    return;
                }
                // 新增
                if (this.isAdd) {
                    this.$loading();
                    EtlApiV1
                        .getServiceSdk({dataSet: this.sdk.dataSet, language: 'java'})
                        .then(res => {
                            this.sdk = res.body.data.sdk;

                            // 创建密钥
                            this.$router.push({
                                name: 'sdk',
                                query: {id: this.sdk.id, step: 2, type: 'serveSdk'},
                            });
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                } else {
                    // 修改
                    this.$loading();
                    EtlApiV1.updateServiceSdk({id: this.sdk.id, dataSet: this.sdk.dataSet})
                        .then(res => {
                            this.sdk = res.body.data.sdk;

                            // 更新sdk
                            this.$emit('updateSdk', this.sdk);

                            // 创建密钥
                            this.$router.push({
                                name: 'sdkDetails',
                                query: {
                                    id: this.sdk.id,
                                    name: 'set',
                                    // previewName: 'user',
                                    step: 2,
                                    type: 'serveSdk'
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
                                    this.$emit('updateSdk', {
                                        dataSet: this.sdk.dataSet,
                                        secret: this.sdk.secret,
                                    });
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
</style>
