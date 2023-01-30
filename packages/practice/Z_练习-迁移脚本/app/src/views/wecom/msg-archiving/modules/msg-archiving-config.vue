<template>
    <div class="msg-archiving-config">
        <div class="config-block">
            <span class="config-title">I.{{ 'msgArch.cfgTitle1' | t }}</span>
            <span class="theme-text config-desc" @click="showDescModal('descStepI')">{{ 'msgArch.desc' | t }}></span>
            <p class="light-content-text indent">{{ 'msgArch.cfgText1' | t }}</p>
        </div>
        <div class="config-block">
            <span class="config-title">II.{{ 'msgArch.cfgTitle2' | t }}</span>
            <span class="theme-text config-desc" @click="showDescModal('descStepII')">{{ 'msgArch.desc' | t }}></span>
            <p class="light-content-text indent">{{ 'msgArch.cfgText2' | t }}</p>
            <div class="indent">
                <span class="config-tag ip-trusted">{{ ipTrusted }}</span>
                <button class="btn btn-theme btn-sm" v-clipboard:copy="ipTrusted" v-clipboard:success="handleIpCopy"
                    :disabled="!ipTrusted || ipCopying">{{ 'common.copy' | t }}</button>
            </div>
        </div>
        <div class="config-block">
            <span class="config-title">III.{{ 'msgArch.cfgTitle3' | t }}</span>
            <span class="theme-text config-desc" @click="showDescModal('descStepIII')">{{ 'msgArch.desc' | t }}></span>
            <div class="indent">
                <span class="light-content-text">{{ 'msgArch.cfgText3' | t }}</span>
                <button class="btn btn-theme btn-sm" v-clipboard:copy="publicKey" v-clipboard:success="handleKeyCopy"
                    :disabled="!publicKey || keyCopying">{{ 'common.copy' | t }}</button>
            </div>
            <textarea class="textarea indent pub-key" rows="20" v-model="publicKey" disabled></textarea>
        </div>
        <div class="config-block">
            <span class="config-title">IV.{{ 'msgArch.cfgTitle4' | t }}</span>
            <span class="theme-text config-desc" @click="showDescModal('descStepIV')">{{ 'msgArch.desc' | t }}></span>
            <p class="light-content-text indent">{{ 'msgArch.cfgText4' | t }}</p>
            <div class="form-field">
                <label class="label">Secret</label>
                <input type="text" class="input lg" :class="{ error: error.secret }"
                    v-title:top.line.warn="error.secret" maxlength="255" v-model.trim="secret"
                    @focusin="error.secret = ''">
            </div>
            <div class="form-field">
                <label class="label">{{ 'msgArch.pubKeyVer' | t }}</label>
                <input type="text" class="input lg" :class="{ error: error.pubKeyVer }"
                    v-title:top.line.warn="error.pubKeyVer" maxlength="255" v-model.trim="pubKeyVer"
                    @focusin="error.pubKeyVer = ''">
            </div>
        </div>
        <div class="tool-bar">
            <button class="btn btn-md btn-theme" @click="handleFinish">{{ 'msgArch.finished' | t}}</button>
        </div>
    </div>
</template>

<script lang="jsx" type="text/jsx">
import { WecomApiV1 } from '@/api';
import { throttle } from 'lodash';

const getUrl = (url) => {
    return new URL(url, import.meta.url).href;
};

export default {
    name: 'MsgArchivingConfig',
    data () {
        return {
            ipTrusted: this.$t('common.loading'), // 可信IP地址
            publicKey: this.$t('common.loading'), // 加密公钥
            secret: '',
            pubKeyVer: '', // 公钥版本号
            // 错误提示
            error: {
                secret: '',
                pubKeyVer: ''
            },
            pending: false,
            descStepI: getUrl('../assets/step1.png'),
            descStepII: getUrl('../assets/step2.png'),
            descStepIII: getUrl('../assets/step3.png'),
            descStepIV: getUrl('../assets/step4.png'),
            ipCopying: false,
            keyCopying: false
        };
    },
    mounted () {
        this.getInfo();
    },
    methods: {
        getInfo () {
            WecomApiV1
                .getChatPublicConfig()
                .then(({ body: { data: { ipTrusted, publicKey } } }) => {
                    this.ipTrusted = ipTrusted;
                    this.publicKey = publicKey;
                })
                .catch(() => {
                    this.ipTrusted = this.$t('common.noData');
                    this.publicKey = this.$t('common.noData');
                });
            WecomApiV1
                .getChatConfig()
                .then(({ body: { data: { chatSecret, chatPublicKeyVersion } } }) => {
                    this.secret = chatSecret;
                    this.pubKeyVer = chatPublicKeyVersion;
                })
                .catch(() => {
                    this.secret = '';
                    this.pubKeyVer = '';
                });
            this.keyCopying = false;
            this.ipCopying = false;
        },
        // 复制ip成功回调方法
        handleIpCopy () {
            this.ipCopying = true;
            setTimeout(() => {
                this.ipCopying = false;
                this.$toast(this.$t('msgArch.copied'), 'success');
            }, 3000);
        },
        // 复制key成功回调方法
        handleKeyCopy () {
            this.keyCopying = true;
            setTimeout(() => {
                this.keyCopying = false;
                this.$toast(this.$t('msgArch.copied'), 'success');
            }, 3000);
        },
        /**
         * @description 显示图文说明
         * @param {string} step 步骤名
         */
        showDescModal (step) {
            const contentHtml = () => {
                return (
                    <div style={{
                        width: '100%',
                        height: '800px',
                        backgroundImage: `url(${this[step]})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat'
                    }}>
                    </div>
                );
            };
            this.$confirm(this.$t('msgArch.desc'), contentHtml(), '', this.$t('common.close'), false, false, 'lg');
        },
        // 配置完成按钮动作
        handleFinish: throttle(function () {
            if (this.pending) return;
            if (!this.secret) {
                this.error.secret = this.$t('msgArch.emptySecret');
                return;
            }
            if (!this.pubKeyVer) {
                this.error.pubKeyVer = this.$t('msgArch.emptyPubKeyVer');
                return;
            }
            WecomApiV1
                .saveChatConfit(this.secret, this.pubKeyVer)
                .then(() => {
                    this.$toast(this.$t('msgArch.cfgSuccess'), 'success');
                    this.getInfo();
                    this.pending = false;
                })
                .catch(() => {
                    this.pending = false;
                });
        }, 1500)
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../../common/scss/base/variables';
@import '../../../../common/scss/base/mixin';

.msg-archiving-config {
    .config-block {
        .config-title {
            font-size: 16px;
            font-weight: 500;
        }

        .config-desc {
            cursor: pointer;
        }

        .indent {
            margin: 5px 0px 5px 20px;

            .light-content-text {
                margin-right: 10px;
            }
        }

        .config-tag {
            display: inline-block;
            margin-right: 10px;
            border: 1px solid $border-color;
            padding: 0 1em;
            line-height: 22px;
            vertical-align: top;
            text-align: center;
            color: $color-light-content;
            background-color: $disabled-bg;
            @include border-radius(4px);
            @include box-sizing();
            &.ip-trusted {
                width: 118px;
            }
        }

        .pub-key {
            width: 500px;
            &:hover {
                resize: none;
                border-color: $form-border;
            }
        }
    }

    .tool-bar {
        padding-top: 20px;
        text-align: center;
    }
}
</style>