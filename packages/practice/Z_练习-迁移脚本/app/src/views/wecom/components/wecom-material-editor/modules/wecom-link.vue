<template>
    <div class="wecom-link" :class="{ readonly: readonly}">
        <!-- 链接url -->
        <div class="form-field">
            <label class="label">{{'QRCode.url' | t}}</label>
            <input v-if="!readonly" type="text" class="input lg" :class="{ error: error.url }"
                v-title:top.line.warn="error.url" :value="value.url"
                @input="handleInput({ url: $event.target.value.trim() })" @focusin="error.url = ''">
            <div v-else class="input-view light-content-text" :title="value.url || $t('common.noData')">
                {{ value.url || $t('common.noData') }}</div>
        </div>
        <!-- 标题title -->
        <div class="form-field">
            <label class="label">{{'QRCode.title' | t}}</label>
            <input v-if="!readonly" type="text" class="input lg" :class="{ error: error.title }"
                v-title:top.line.warn="error.title" maxlength="60" :value="value.title"
                @input="handleInput({ title: $event.target.value.trim() })" @focusin="error.title = ''">
            <div v-else class="input-view light-content-text" :title="value.title || $t('common.noData')">
                {{ value.title || $t('common.noData') }}</div>
        </div>
        <!-- 描述 -->
        <div class="form-field">
            <label class="label">{{'QRCode.description' | t}}</label>
            <textarea v-if="!readonly" class="textarea rewidth" rows="5" v-title:top.line.warn="error.desc"
                :class="{ error: error.desc }" autofocus="false" maxlength="200" :value="value.desc"
                @input="handleInput({ desc: $event.target.value.trim() })" @focusin="error.desc = ''"></textarea>
            <div v-else class="textarea-view light-content-text" :title="value.desc || $t('common.noData')">
                {{ value.desc || $t('common.noData') }}</div>
        </div>
        <!-- 封面 -->
        <div class="form-field">
            <label class="label">{{'QRCode.cover' | t}}</label>
            <wecom-image :value="{ media_id: value.picurl }" :readonly="readonly"
                @input="handleInput({ picurl: $event.media_id })" ref="img" />
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
import WecomImage from './wecom-image.vue';
import { TAGANDWEBPAGE_NAME_REGEXP, COMMON_URL_REGEXP } from '@/common/utils/regs.js';


export default {
    name: 'WecomLink',
    props: {
        value: {
            type: Object, // { title, picurl, desc, url }
            default: () => ({})
        },
        // 只读模式
        readonly: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            error: {
                url: '', // url错误提示
                title: '', // 标题错误提示
                desc: '' // 描述错误提示
            }
        };
    },
    watch: {},
    methods: {
        /**
         * @description 标题输入
         * @param {string} val 输入值
         */
        handleInput (val) {
            this.$emit('input', Object.assign(this.value, val));
        },
        /**
         * @description 校验 供外部调用
         */
        valid () {
            // URL校验
            if (!this.value.url) {
                this.$toast(this.$t('controller.urlWarn'), 'warn');
                this.error.url = this.$t('QRCode.emptyUrl');
                return false;
            }
            if (!COMMON_URL_REGEXP.test(this.value.url)) {
                this.$toast(this.$t('controller.urlWarn'), 'warn');
                this.error.url = this.$t('QRCode.badUrl');
                return false;
            }
            // 标题校验
            if (!this.value.title.trim()) {
                this.$toast(this.$t('controller.titleWarn'), 'warn');
                this.error.title = this.$t('controller.titleWarn');
                return false;
            }
            if (!TAGANDWEBPAGE_NAME_REGEXP.test(this.value.title)) {
                this.error.title = this.$t('QRCode.titleInvalid');
                return false;
            }
            // 描述校验
            if (!this.value.desc) {
                this.$toast(this.$t('wecomComponents.descEmpty'), 'warn');
                this.error.desc = this.$t('wecomComponents.descEmpty');
                return false;
            }
            // 封面校验 调用img组件自身校验，使用自定义提示语
            return this.$refs.img.valid();
        }
    },
    components: { WecomImage }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../../../common/scss/base/variables';
@import '../../../../../common/scss/base/mixin';

.wecom-link {
    .form-field:not(.flex) > .textarea {
        width: 270px;
        resize: none;
    }
    &.readonly {
        .form-field {
            line-height: unset;
        }
    }
}
</style>