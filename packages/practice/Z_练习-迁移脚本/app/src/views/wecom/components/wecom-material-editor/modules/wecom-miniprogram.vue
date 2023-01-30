<template>
    <div class="wecom-miniprogram" :class="{ readonly: readonly}">
        <template v-for="field in fields">
            <div class="form-field" :key="field">
                <label class="label">{{ labelSet[field] }}</label>
                <input v-if="!readonly" type="text" class="input lg" :class="{ error: error[field] }"
                    v-title:top.line.warn="error[field]" :value="value[field]" :maxlength="maxlenSet[field]"
                    @input="handleInput($event.target.value.trim(), field)" @focusin="error[field] = ''">
                <div v-else :key="field" class="input-view light-content-text"
                    :title="value[field] || $t('common.noData')">
                    {{ value[field] || $t('common.noData') }}</div>
                <i v-if="field === 'appid'" class="icon icon-help" v-title="$t('wecomComponents.appidTip')"></i>
            </div>
        </template>
        <!-- 封面 -->
        <div class="form-field">
            <label class="label">{{'QRCode.cover' | t}}</label>
            <wecom-image :value="{ media_id: value.pic_media_id }" :readonly="readonly"
                @input="handleInput($event.media_id, 'pic_media_id')" ref="img"/>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
import WecomImage from './wecom-image.vue';
import { TAGANDWEBPAGE_NAME_REGEXP } from '@/common/utils/regs.js';


export default {
    props: {
        value: {
            type: Object, // { title, pic_media_id, appid, page }
            default: () => ({})
        },
        // 只读模式
        readonly: {
            type: Boolean,
            default: false
        }
    },
    name: 'WecomMiniprogram',
    data () {
        // 输入项类型
        const FIELDS = ['title', 'appid', 'page'];
        // 输入项label
        const LABEL_SET = {
            title: this.$t('wecomComponents.appletTitle'),
            appid: this.$t('wecomComponents.appid'),
            page: this.$t('wecomComponents.appletPath')
        };
        // 输入项长度限制 无限制255
        const MAXLEN_SET = {
            title: 30,
            appid: 255,
            page: 255
        };
        return {
            fields: FIELDS,
            labelSet: LABEL_SET,
            maxlenSet: MAXLEN_SET,
            error: {
                title: '',
                pic_media_id: '',
                appid: '',
                page: ''
            }
        };
    },
    methods: {
        /**
         * @description 标题、输入
         * @param {string} val 输入值
         * @param {string} field 输入项类型
         */
        handleInput (val, field) {
            const newVal = {};
            newVal[field] = val;
            this.$emit('input', Object.assign(this.value, newVal));
        },
        /**
         * @description 校验 供外部调用
         */
        valid() {
            // 标题校验
            if (!this.value.title) {
                this.error.title = this.$t('QRCode.titleEmpty');
                return false;
            }
            if (!TAGANDWEBPAGE_NAME_REGEXP.test(this.value.title)) {
                this.error.title = this.$t('QRCode.titleInvalid');
                return false;
            }
            // appid校验
            if (!this.value.appid) {
                this.error.appid = this.$t('wechatContent.enterAppid');
                return false;
            }
            // page校验
            if (!this.value.page) {
                this.error.page = this.$t('wechatContent.enterAppPath');
                return false;
            }
            // 封面校验 调用img组件自身校验，使用自定义提示语
            return this.$refs.img.valid();
        }
    },
    components: { WecomImage },
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
.wecom-miniprogram {
    &.readonly {
        .form-field {
            line-height: unset;
        }
    }
    .icon {
        font-size: 16px;
        vertical-align: middle;
    }
}
</style>