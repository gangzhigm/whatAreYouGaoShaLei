<template>
    <div class="wecom-image">
        <!-- 预览框（始终显示） -->
        <div v-if="value && value.media_id" class="image-container preview"
            :style="{ backgroundImage: `url('${value.media_id}')` }" ref="preview">
            <div class="preview-mask">
                <div class="action-toolbar">
                    <!-- 查看大图 -->
                    <a class="icon icon-eye" :href="value.media_id" target="_blank"></a>
                    <!-- 删除当前图片 -->
                    <span v-if="!readonly" class="icon icon-round-close" @click="handleDel"></span>
                </div>
            </div>
        </div>
        <!-- 上传框 仅在非只读模式（默认）显示 -->
        <template v-else-if="!readonly">
            <label class="image-container upload" :class="{'error': errorText}" v-title:top.line.warn="errorText"
                @click="errorText = ''">
                <input type="file" @change="uploadImage" ref="image">
                <div v-if="uploading" class="light-content-text upload-tips">{{ 'material.uploading' | t }}...</div>
                <div v-else class="upload-tips">
                    <div class="icon icon-xinjian"></div>
                    <span>{{ 'wecomComponents.uploadImg' | t }}</span>
                </div>
            </label>
        </template>

        <!-- 只读模式下无数据提示 -->
        <div v-else class="image-container no-data">
            <div class="no-data-tips light-content-text">
                <span class="icon icon-image"></span>
                <p>{{ 'common.noData' | t }}</p>
            </div>
        </div>
        <p class="light-content-text">*{{ 'wecomComponents.imageLimit' | t }}</p>
    </div>
</template>

<script type="text/ecmascript-6">
import { JourneyApiV3 } from '@/api';

export default {
    name: 'WecomImage',
    props: {
        value: {
            type: Object,
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
            uploading: false, // 上传状态
            errorText: ''
        };
    },
    methods: {
        /**
         * @description 上传图片
         * @param {*} e input事件参数
         */
        uploadImage (e) {
            const file = e.target.files[0];
            e.target.value = '';
            if (!/\.(jpg|png)$/i.test(file.name)) {
                this.$toast(this.$t('wecomComponents.imageFormatValid'), 'warn');
                return false;
            }
            if (file.size > 1024 * 1024 * 2) {
                this.$toast(this.$t('wecomComponents.imageFormatValid'), 'warn');
                return false;
            }
            this.uploading = true;
            this.$emit('uploading', true);
            JourneyApiV3
                .uploadWecomImg(file)
                .then(({ body: { message, data } }) => {
                    this.$toast(message, 'success');
                    this.$emit('input', { media_id: data.url });
                    this.uploading = false;
                    this.$emit('uploading', false);
                })
                .catch(() => {
                    this.uploading = false;
                    this.$emit('uploading', false);
                });
        },
        /**
         * @description 删除图片
         */
        handleDel () {
            this.$emit('input', { media_id: '' });
        },
        /**
         * @description 校验
         * @param {string} tips 自定义错误提示，不传时默认为“请上传图片”
         */
        valid (tips) {
            const tst = tips || this.$t('wecomComponents.imageValid');
            if (!this.value.media_id) {
                this.$toast(tst, 'warn');
                this.errorText = tst;
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

.wecom-image {
    display: inline-block;
    .image-container {
        display: inline-block;
        overflow: hidden;
        margin-bottom: 5px;
        width: 270px;
        height: 163px;
        border-width: 1px;
        border-radius: 4px;
        border-color: $border-color;
        vertical-align: top;
        @include box-sizing();

        &.preview {
            border-style: solid;
            background-repeat: no-repeat;
            background-size: contain;
            background-position: center center;

            &:hover {
                .preview-mask {
                    display: block;
                }
            }

            .preview-mask {
                position: relative;
                display: none;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                color: #fff;

                .action-toolbar {
                    position: absolute;
                    top: 0;
                    right: 0;

                    .icon {
                        padding-right: 6px;
                        font-size: 18px;
                        cursor: pointer;
                        color: #fff;
                    }
                }
            }
        }

        &.upload {
            position: relative;
            border-style: dashed;
            vertical-align: top;
            text-align: center;
            cursor: pointer;

            &:hover {
                border-color: $theme;
            }
            &.error {
                border-color: $red;
                .icon {
                    color: $red;
                }
            }
            .upload-tips {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            input {
                display: none;
            }

            .icon-xinjian {
                font-size: 32px;
                color: $theme;
            }
        }

        &.no-data {
            border-style: solid;
            position: relative;
            text-align: center;
            .no-data-tips {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                span {
                    font-size: 50px;
                }
            }
        }
    }
}
</style>