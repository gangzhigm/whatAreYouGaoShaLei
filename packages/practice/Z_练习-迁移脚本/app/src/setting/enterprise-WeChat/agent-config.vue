<template>
    <div class="agent-config">
        <div class="page-content">
            <h6>{{'enterpriseWeChat.integrateWeCom' | t}}</h6>
            <div v-if="!id && !isCorpId" class="config-box">
                <div class="config-title">{{'enterpriseWeChat.installingApp' | t}}</div>
                <div class="config-content">
                    <p>
                        {{'enterpriseWeChat.insStep1' | t}}
                        <span class="theme" @click="viewGraphic(1)">{{'enterpriseWeChat.textImg' | t}} ></span>
                    </p>
                    <p>
                        {{'enterpriseWeChat.insStep2' | t}}
                    </p>
                    <div class="form-field">
                        <label class="submit-label">{{'enterpriseWeChat.companyID' | t}}:</label>
                        <input type="text" class="input lg" v-model.trim="corpId">
                    </div>
                    <button class="btn btn-md btn-theme" :disabled="loading" @click="submit">{{'common.submit' | t}}</button>
                </div>
            </div>
            <div v-else class="config-box">
                <div class="config-title">{{'enterpriseWeChat.installingApp' | t}}</div>
                <div v-if="!dataLoading" class="config-content">
                    <div class="form-field">
                        <label class="submit-label">{{'enterpriseWeChat.companyID' | t}}:</label>
                        <span>{{corpId}}</span>
                    </div>
                    <p>
                        {{'enterpriseWeChat.insStep3' | t}}
                    </p>
                    <img class="scan-img" :src="scanUrl">
                    <p>
                        {{'enterpriseWeChat.insStep4' | t}}
                    </p>
                    <p>
                        {{'enterpriseWeChat.insStep5' | t}}
                        <span class="theme" @click="viewGraphic(2)">{{'enterpriseWeChat.textImg' | t}} ></span>
                    </p>
                    <p>
                        {{'enterpriseWeChat.insStep6' | t}}
                        <span class="theme" @click="viewGraphic(3)">{{'enterpriseWeChat.textImg' | t}} ></span>
                    </p>
                    <p>
                        {{'enterpriseWeChat.insStep7' | t}}
                        <span class="theme" @click="viewGraphic(4)">{{'enterpriseWeChat.textImg' | t}} ></span>
                    </p>
                    <p>
                        {{'enterpriseWeChat.pageName' | t}}: 
                        <span class="copy-content">用户画像</span>
                        <span class="theme" @click="copyOption($event,'userAvatar')">
                            {{$t('common.copy')}}
                        </span>
                    </p>
                    <p>
                        {{'enterpriseWeChat.pageLink' | t}}: 
                        <span class="copy-content">{{pageLink}}</span>
                        <span class="theme" @click="copyOption($event,'pageLink')">
                            {{$t('common.copy')}}
                        </span>
                    </p>
                    <p>
                        {{'enterpriseWeChat.insStep8' | t}}
                    </p>
                </div>
                <inline-loading v-else></inline-loading>
            </div>
            <div class="check-copy">
                <input type="text" id="userAvatar" value="用户画像">
                <input type="text" id="pageLink" :value="pageLink">
            </div>
        </div>
        <graphicStepsModal v-if="graphicFlag" :stepImages="stepImages" @close="close"></graphicStepsModal>
    </div>
</template>

<script>
    import { WecomApiV1 } from '@/api';
    import graphicStepsModal from './graphicStepsModal.vue';
    const getUrl = (url) => {
        return new URL(url, import.meta.url).href;
    };

    export default {
        name: 'AgentConfig',
        data() {
            return {
                id: '',//新建id''
                corpId: '', // 企业ID
                pageLink: '',   // 页面链接
                dataLoading: false,
                scanUrl: '',    //二维码链接
                graphicFlag: false,//图文说明弹窗显隐
                loading: false,
                stepImages: [],//步骤图片
                step1: [{url: getUrl('../images/insStep1.png')}],
                step2: [{url: getUrl('../images/conStep1.png')}],
                step3: [{url: getUrl('../images/conStep2.png')}],
                step4: [{url: getUrl('../images/conStep3-1.png')},
                    {url: getUrl('../images/conStep3-2.png')},
                    {url: getUrl('../images/conStep3-3.png')}
                ],
                isCorpId: '',    //新建应用提交企业id后，显示第二页信息
            };
        },
        created() {
            this.isCorpId = this.$route.query.isCorpId || '';
            if (this.isCorpId) {
                this.corpId = this.isCorpId;
                this.dataLoading = true;
                this.getScanUrl();
                this.pageLink = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + this.corpId + '&redirect_uri=' + location.origin + '/work/&response_type=code&scope=snsapi_base&state=' + this.corpId + '#wechat_redirect';
            }
        },
        mounted() {
            this.id = this.$route.query.id || '';
            if (this.$route.query.id) {
                this.getConfigDetails();
            }
        },
        components: {
            graphicStepsModal
        },
        methods: {
            //获取配置详情
            getConfigDetails() {
                this.dataLoading = true;
                WecomApiV1
                    .getConfigDetails(this.id)
                    .then(({body: {data}}) => {
                        this.corpId = data.wxCorpId || '';
                        this.getPublicConfig();
                        this.getScanUrl();
                    })
                    .catch(() => {
                        this.dataLoading = false;
                    });
            },
            //获取应用公共配置相关信息
            getPublicConfig() {
                WecomApiV1
                    .getPublicConfig(this.id)
                    .then((res) => {
                        this.pageLink = res.body.data.sideWindowUrl.replace(/{corpId}/g, this.corpId);
                        this.dataLoading = false;
                    })
                    .catch(() => {
                        this.dataLoading = false;
                    });
            },
            // 获取二维码
            getScanUrl() {
                WecomApiV1
                    .getWwAppTypeTemplateQrCodeUrl()
                    .then((res) => {
                        this.scanUrl = res.body.data.url;
                        this.dataLoading = false;
                    })
                    .catch(() => {
                        this.dataLoading = false;
                    });
            },
            //查看图文说明
            viewGraphic(stepNum) {
                this.graphicFlag = true;
                switch (stepNum) {
                    case 1:
                        this.stepImages = this.step1;
                        break;
                    case 2:
                        this.stepImages = this.step2;
                        break;
                    case 3:
                        this.stepImages = this.step3;
                        break;
                    case 4:
                        this.stepImages = this.step4;
                        break;
                }
            },
            close() {
                this.graphicFlag = false;
            },
            //复制功能
            copyOption(e, copyOpt) {
                e.target.disabled = true;
                let copyVal = document.getElementById(copyOpt);
                copyVal.select();
                document.execCommand('Copy');
                this.$toast(this.$t('form.copied'), 'success');
                setTimeout(() => {
                    e.target.disabled = false;
                }, 3000);
            },
            //提交配置
            submit() {
                if (this.loading) return;
                if (!this.corpId.trim()) {
                    this.$toast(this.$t('enterpriseWeChat.companyIDInvalid'), 'warn');
                    return;
                }
                this.loading = true;
                this.$loading();
                WecomApiV1
                    .saveCropId(this.corpId, 'general')
                    .then((res) => {
                        this.scanUrl = res.body.data.url;
                        this.pageLink = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + this.corpId + '&redirect_uri=' + location.origin + '/work/&response_type=code&scope=snsapi_base&state=' + this.corpId + '#wechat_redirect';
                        this.isCorpId = this.corpId;
                        this.$router.replace({
                            name: 'AgentConfig',
                            query: {isCorpId: this.corpId}
                        });
                        this.loading = false;
                        this.$loaded();
                    })
                    .catch((err) => {
                        console.error(err);
                        this.loading = false;
                        this.$loaded();
                    });
            },
        }
    };
</script>

<style lang="scss">
    @import '../../common/scss/base/_variables.scss';
    @import '../../common/scss/base/_mixin.scss';

    .agent-config {
        @include box-sizing();
        background-color: white;
        height: calc(
                100vh - #{$header-height + $toolbar-height + 24px * 2 +
                $tab-nav-height}
        );
        overflow-y: scroll;

        h6 {
            font-size: 16px;
            text-align: center;
            line-height: calc(#{$input-field-height * 2});
        }

        .config-box {
            width: 520px;
            margin: 0 auto;
            border: 1px solid $border-color;
            line-height: $input-field-height;

            .config-title {
                font-size: 14px;
                padding: 10px 15px;
                background-color: $title-bg;
                
            }

            .config-content {
                padding: 10px 15px;
                line-height: 24px;

                p, .form-field {
                    margin: 20px 0;

                    .copy-content {
                        margin: 0 10px;
                    }
                }

                .btn {
                    display: block;
                    margin: 15px auto;
                    padding: 0 30px;
                }

                .scan-img {
                    display: block;
                    margin: 0 auto;
                    width: 300px;
                    height: 300px;
                }

                .btn-prev {
                    cursor: pointer;
                }
            }
        }

        .theme {
            color: $theme;
            cursor: pointer;
        }

        .check-copy {
            opacity: 0;
            position: absolute;
        }
    }
</style>
