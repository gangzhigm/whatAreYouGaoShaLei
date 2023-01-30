<template>
    <div class="wecom-config">
        <!-- 企微应用引导 -->
        <div class="content-view padding margin white-bg wecom-auth">
            <h6>
                {{'shoppingGuide.wecomConfig' | t}}
            </h6>
            <p>{{'shoppingGuide.wecomConfigTip' | t}}</p>
            <div v-for="(text, index) in wecomStep" :key="index">
                <p class="wecom-step-title" :class="[{'step-title': [1,3,5].includes(index + 1)}, {'theme': index === 3}]">
                    {{text}}
                    <span v-if="index === 3" class="copy-path">
                        {{agentPath}}
                        <button type="button"
                            class="btn btn-md btn-theme"
                            v-clipboard:copy="agentPath"
                            v-clipboard:success="onCopy"
                            v-clipboard:error="onCopyErr">
                            {{'common.copy' | t}}
                        </button>
                    </span>
                </p>
                <img v-if="index === 1" :src="wecomAuthImg[0]">
            </div>
        </div>
    </div>
</template>
<script type="text/babel">

    import { WecomApiV1 } from '@/api';
    import wecomAuthImgUse from '../image/wecomAuth1.png';

    export default {
        data () {
            return {
                wecomStep: [],          //绑定企微应用步骤说明
                wecomAuthImg: [         //绑定企微应用说明图片
                    wecomAuthImgUse
                ],
                workAgentID: '',        //应用ID
                wxCorpId: '',           //企业ID
            };
        },
        computed: {
            agentPath() {
                return 'pages/waiting_signin/waiting_signin?agentid=' + this.workAgentID + '&corpid=' + this.wxCorpId;
            }
        },
        created () {
            // 企微应用步骤说明
            for (let i = 1; i < 7; i++) {
                let stepText = 'shoppingGuide.wecomStep' + i;
                this.wecomStep.push(this.$t(stepText));
            }
            // 获取企微应用ID
            this.getWorkAgentID();
        },
        methods: {
            // 获取企微应用ID
            async getWorkAgentID() {
                let workID = await WecomApiV1
                    .getConfigList()
                    .then(({ body: { data: { resultList } } }) => resultList[0].id);

                WecomApiV1
                    .getConfigDetails(workID)
                    .then(({body: {data}}) => {
                        this.workAgentID = data.agentId;
                        this.wxCorpId = data.wxCorpId;
                    });
            },
            // 复制路径成功
            onCopy() {
                this.$toast(this.$t('microPage.copied'),'success');
            },
            // 复制路径失败
            onCopyErr() {
                this.$toast(this.$t('microPage.copyErr'), 'error');
            },
        }
    };
</script>
<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .wecom-config {
        h6 {
            font-size: 16px;
            line-height: 24px;
            margin: 15px auto;
        }

        .wecom-auth {
            height: calc(100vh - 200px);
            overflow-y: scroll;

            p {
                line-height: 32px;

                &.step-title {
                    font-size: 16px;
                    margin-top: 30px;
                }

                &.theme, .theme {
                    color: $theme;
                }

                .copy-path {
                    display: flex;
                    width: 100%;
                    margin: 15px auto;
                    color: $color-content;

                    .btn {
                        margin-left: 30px;
                    }
                }
            }

            img {
                width: 950px;
                margin: 15px auto;
            }
        }
    }
</style>
