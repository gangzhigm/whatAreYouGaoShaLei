<template>
    <div class="applets-content" :class="{ 'is-checking': isChecking}">
        <div class="form-field">
            <label class="label">{{'wechatContent.appid' | t}}：</label>
            <input v-if="!isChecking" type="text" class="input lg" :class="{error: errorAppidText}"
                v-title:top.line.warn="errorAppidText" @focusin="errorAppidText = ''"
                :value="material.miniprogramAppid" @input="emit({miniprogramAppid: $event.target.value.trim()})"
                :placeholder="$t('wechatContent.enterAppid')">
            <span v-else>{{ material.miniprogramAppid }}</span>
            <svg aria-hidden="true" class="icon icon-help" v-title:right="$t('wechatContent.appidTips')">
                <use xlink:href="#icon-help"></use>
            </svg>
        </div>
        <div class="form-field">
            <label class="label ">{{'wechatContent.appPath' | t}}：</label>
            <input v-if="!isChecking" type="text" class="input lg" :class="{error: errorPagePathText}"
                v-title:top.line.warn="errorPagePathText" @focusin="errorPagePathText = ''"
                :value="material.pagePath" @input="emit({pagePath: $event.target.value.trim()})"
                :placeholder="$t('wechatContent.enterAppPath')">
            <span v-else>{{ material.pagePath }}</span>
        </div>
        <div class="form-field">
            <label class="label">url：</label>
            <input v-if="!isChecking" type="text" class="input lg" :class="{error: errorUrl}"
                v-title:top.line.warn="errorUrl" @focusin="errorUrl = ''" :value="material.weChatUrl"
                @input="emit({weChatUrl: $event.target.value.trim()})" :maxlength="urlMaxLth"
                :placeholder="$t('wechatContent.enterMiniUrl')">
            <span v-else>{{ material.weChatUrl }}</span>
        </div>
    </div>
</template>
<script type="text/babel">

export default {
    props: {
        urlMaxLth: {
            type: Number,
            default: 30
        },
        material: {
            type: Object
        },
        // 查看模式
        isChecking: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            errorAppidText: '',
            errorUrl: '',
            errorPagePathText: '',
            openLib: false,
        };
    },
    methods: {
        // 校验url
        validUrl () {
            if (!this.material.weChatUrl) {
                this.errorUrl = this.$t('wechatContent.enterMiniUrl');
                return false;
            }
            if (!/^https?:\/\/[^.]*\..*/.test(this.material.weChatUrl)) {
                this.$toast(this.$t('menu.menuContent') + this.$t('menu.urlEmptyError'), 'warn');
                return false;
            }
            this.errorUrl = '';
            return true;
        },
        // 校验appid
        validAppid () {
            if (!this.material.miniprogramAppid) {
                this.errorAppidText = this.$t('wechatContent.enterAppid');
                return false;
            }
            this.errorAppidText = '';
            return true;
        },
        // 校验pagePath
        validPagePath () {
            if (!this.material.pagePath) {
                this.errorPagePathText = this.$t('wechatContent.enterAppPath');
                return false;
            }
            this.errorPagePathText = '';
            return true;
        },
        emit (material) {
            this.$emit('change', material);
        }
    }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../common/scss/base/variables';
@import '../../../common/scss/base/mixin';

.applets-content {
    margin: 0 auto;
    padding: 16px 32px;
    .form-field {
        .label {
            width: 145px;
        }
    }
    
    .icon {
        fill: currentColor;
        height: 14px;
        margin-left: 1px;
        vertical-align: middle;
        width: 14px;
    }
}
</style>