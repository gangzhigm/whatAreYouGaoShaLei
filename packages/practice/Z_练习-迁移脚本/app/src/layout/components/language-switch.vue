<template>
    <div class="language-switch">
        <span class="language" :class="{'theme-text': language === 'zh-CN'}" @click="$changeLang('zh-CN')">中文</span>
        <span class="divider"></span>
        <span class="language" :class="{'theme-text': language === 'en'}" @click="$changeLang('en')">English</span>
    </div>
</template>

<script>
    import {I18N_STORE_NAME} from '@/locales';

    export default {
        name: 'language-switch',
        computed: {
            language() {
                return this.$store.state[I18N_STORE_NAME].lang;
            }
        }
    };
</script>

<style type="text/scss" lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .language-switch {
        $height: 24px;

        float: right;
        margin-top: ($header-height - $height)/2;
        margin-right: ($header-height - $height)/2;
        line-height: $height;
        color: $color-light-content;

        .language {
            margin: 0 8px;
            cursor: pointer;

            &:hover {
                color: $light-theme;
            }

            &:active,
            &.active {
                color: $theme;
            }
        }

        .divider {
            display: inline-block;
            vertical-align: top;
            height: $height / 2;
            margin-top: $height/4;
            width: 0;
            border-left: 1px solid $border-color;
        }
    }
</style>
