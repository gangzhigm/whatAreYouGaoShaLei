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
            <div class="title">{{$t('dataCenter.createPrivateKey')}}</div>
            <div class="sub-content step2">
                <div class="form-field">
                    <label class="label" for="name">{{$t('dataCenter.sourceName')}}</label>
                    <input type="text" class="input" :class="{error: sourceNameErr}" id="name" maxlength="30"
                           :placeholder="$t('dataCenter.sourceName')" v-model="api.dataSet" v-title:top.warn.line="sourceNameErr"
                           :disabled="api.isDefault" @click="sourceNameErr = ''" @keydown.enter="createApi">
                </div>
                <div class="shell">
                    <button class="btn btn-md btn-theme" @click="createApi" :disabled="api.isDefault">
                        {{$t('dataCenter.create')}}
                    </button>
                </div>
            </div>
        </div>
        <!--step 2-->
        <div class="step" v-if="stepId == 2">
            <div class="title">{{$t('dataCenter.createPrivateKey')}}</div>
            <div class="sub-content">
                <div class="form-field">
                    <label class="label" for="name">SECRET</label>
                    <span>{{api.secret || '暂无'}}</span>
                    <button type="button" class="action-icon icon icon-refresh" :class="{disabled: api.isDefault}"
                            @click="updateSecret"
                            :disabled="api.isDefault">
                        {{$t('dataCenter.rebuilt')}}
                    </button>
                </div>
                <div class="shell">
                    <router-link tag="button" class="btn btn-md btn-theme" v-if="isAdd"
                                 :to="{name:'api',
                                 query: {id: this.$route.query.id, step: 3, type: 'api'}}">
                        {{$t('dataCenter.next')}}
                    </router-link>
                    <router-link tag="button" class="btn btn-md btn-theme" v-else
                                 :to="{name:'apiDetails',
                                 query: {id: this.$route.query.id, name: 'set', step: 3, type: 'api'}}">
                        {{$t('dataCenter.next')}}
                    </router-link>
                </div>
            </div>
        </div>
        <!--step 3-->
        <div class="step" v-if="stepId == 3">
            <div class="title">{{$t('dataCenter.createPrivateKey')}}</div>
            <div class="sub-content step3">
                <div class="icon">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-success"></use>
                    </svg>
                </div>
                <div class="msg-name">{{$t('dataCenter.succeed')}}</div>
                <div class="msg-text">{{$t('dataCenter.viewStatus')}}</div>
                <div class="shell">
                    <router-link tag="button" class="btn btn-md btn-theme"
                                 :to="{name:'apiDetails', query: {id: $route.query.id}}">
                        {{$t('dataCenter.viewSource')}}
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { EtlApiV1 } from '@/api';
    import {COMMON_NAME_REGEXP} from '../../../common/utils/regs';
    import {trackEvent} from '../../../monitor';

    export default {
        name: 'api-steps',
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
                api: {
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
                    name: 'api',
                    query: {
                        // id: query.id,
                        // name: query.name,
                        step: 1,
                        type: 'api',
                    }
                });
            }
            // 进入页面默认获取api详情信息
            if (query.id != null && query.id !== '' && query.id !== undefined) {
                this.fetchApi();
            }
        },
        methods: {
            // step 1 数据源名称校验
            verify() {
                this.sourceNameErr = '';

                if (!this.api.dataSet) {
                    this.sourceNameErr = this.$t('dataCenter.sourceNameNoEmpty');
                    return false;
                }

                if (!COMMON_NAME_REGEXP.test(this.api.dataSet)) {
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
                    if (this.api.isDefault) {
                        // 跳转到相应的step
                        this.$router.push({
                            name: this.$route.name,
                            query: {
                                id: this.$route.query.id,
                                name: this.$route.query.name,
                                step: no ? no : this.$route.query.step,
                                type: 'api',
                            },
                        });
                        return;
                    }

                    if (!this.verify()) {
                        return;
                    }

                    // api step 1 保存
                    this.$loading();
                    EtlApiV1.updateApi({id: this.api.id, dataSet: this.api.dataSet})
                        .then(res => {
                            this.api = res.body.data.api;
                            trackEvent('数据中心-第一步保存');
                            // 更新api
                            this.$emit('updateApi', this.api);

                            // 跳转到相应的step
                            this.$router.push({
                                name: this.$route.name,
                                query: {
                                    id: this.$route.query.id,
                                    name: this.$route.query.name,
                                    step: no ? no : this.$route.query.step,
                                    type: 'api',
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
                                type: 'api'
                            },
                        });
                    }
                }
            },

            // step 1 创建 service api
            createApi() {
                if (!this.verify()) {
                    return;
                }
                // 新增
                if (this.isAdd) {
                    this.$loading();
                    EtlApiV1
                        .getApi({dataSet: this.api.dataSet})
                        .then(res => {
                            this.api = res.body.data.api;
                            trackEvent('数据中心-创建service api');
                            // 创建密钥
                            this.$router.push({
                                name: 'api',
                                query: {
                                    id: this.api.id, step: 2,
                                    type: 'api'
                                },
                            });
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                } else {
                    // 修改
                    this.$loading();
                    EtlApiV1.updateApi({id: this.api.id, dataSet: this.api.dataSet})
                        .then(res => {
                            this.api = res.body.data.api;

                            // 更新api
                            this.$emit('updateApi', this.api);
                            trackEvent('数据中心-修改api');
                            // 创建密钥
                            this.$router.push({
                                name: 'apiDetails',
                                query: {
                                    id: this.api.id,
                                    name: 'set',
                                    step: 2,
                                    type: 'api'
                                },
                            });
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                }
            },

            //获取api详情
            fetchApi() {
                this.$loading();
                EtlApiV1
                    .getAPIDetails(this.$route.query.id)
                    .then(res => {
                        this.api = res.body.data.api;
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
                                .updateApiSecret(this.api.id)
                                .then(res => {
                                    this.api = res.body.data.api;
                                    // 更新api
                                    this.$emit('updateApi', this.api);
                                    trackEvent('数据中心-生成密钥');
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
        .icon-refresh{
            display: inline-block;
            min-width: 80px;
        }
        // step 2
        .step2 {
            .disabled {
                &:hover {
                    color: $disabled;
                }
            }
        }

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
