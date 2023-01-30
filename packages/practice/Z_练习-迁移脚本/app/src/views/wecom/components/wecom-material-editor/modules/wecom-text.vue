<template>
    <div class="wecom-text" :class="{ empty: readonly && !value.content, error: errorText}">
        <!-- 编辑模式输入 -->
        <textarea v-if="!readonly" class="textarea text-editor" :value="value.content" v-title:top.line.warn="errorText"
            :maxlength="maxlength" @input="inputHandle" @focusin="errorText = ''"
            @compositionstart="compositionStartHandle" @compositionend="compositionEndHandle">
        </textarea>
        <!-- 只读模式查看 -->
        <div v-else-if="value.content" class="text-editor-view light-content-text">{{value.content}}</div>
        <!-- 只读模式下无数据提示 -->
        <div v-else class="text-editor-view light-content-text">{{ 'common.noData' | t }}</div>
        <!-- 字数统计栏 -->
        <div v-if="!readonly || value.content.length > 0" class="text-count">
            <span class="theme-text">{{value.content.length}}</span>
            <span class="light-content-text">/{{maxlength}}</span>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
export default {
    name: 'WecomText',
    props: {
        value: {
            type: Object,
            default: () => ({})
        },
        // 只读模式
        readonly: {
            type: Boolean,
            default: false
        },
        maxlength: {
            type: [Number, String],
            default: 1000
        }
    },
    data () {
        return {
            isComposing: false,
            errorText: ''
        };
    },
    methods: {
        // 文本输入
        inputHandle(e) {
            if (this.isComposing) return;
            this.$emit('input', { content: e.target.value });
        },
        // 有输入法时，正在输入
        compositionStartHandle() {
            this.isComposing = true;
        },
        // 输入法输入完成
        compositionEndHandle(e) {
            if (this.isComposing) {
                this.isComposing = false;
                this.inputHandle(e);
            }
        },
        // 校验方法 返回布尔值
        valid () {
            if (!this.value.content.trim()) {
                this.$emit('input', { content: '' });
                this.errorText = this.$t('QRCode.validReply');
                this.$toast(this.$t('controller.fillContentWarn'), 'warn');
                return false;
            }
            return true;
        }
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../../../common/scss/base/variables';
@import '../../../../../common/scss/base/mixin';

.wecom-text {
    width: 270px;
    height: 163px;
    border: 1px solid $border-color;
    border-radius: 4px;
    @include box-sizing();
    &.empty {
        height: unset;
        text-align: center;
    }
    &.error {
        border-color: $red;
    }
    .text-editor {
        width: 100%;
        height: calc(100% - 15px);
        border: none;
        resize: none;
        &:focus {
            box-shadow: unset;
        }
    }
    .text-editor-view {
        max-height: 148px;
        overflow-y: auto;
        white-space: pre-wrap;
        padding: 5px;
        @include box-sizing();
    }
    .text-count {
        padding-right: 5px;
        text-align: end;
    }
}
</style>