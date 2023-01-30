<template>
    <!--    上传证件照片-->
    <div class="upload-id">
        <div class="upload">
            <svg aria-hidden="true" @click="uploadLicense">
                <use xlink:href="#icon-upload"></use>
            </svg>
            <span class="theme-text" @click="uploadLicense">{{ licenseName ? licenseName : imgTitle }}</span>
            <input type="file" style="display: none" ref="uploadInput" @change="uploadImage">
            <span v-if="licenseName&&uploadType===2">
                <button class="btn theme-text" @click="delImage">删除</button>
            </span>
        </div>
    </div>
</template>

<script>
import {WechatApiV1} from '@/api';

export default {
    name: 'upload-documents',
    data() {
        return {
            licenseName: '', //图片name
        };
    },
    props: {
        uploadType: {//1:头像照片 2:修改下程序名称资质证件图片 3:修改类目时需要资质证件图片
            type: Number,
            default: 1
        },
        imgTitle: '',
        appid: {
            type: [Number, String]
        }
    },
    methods: {
        //修改name时上传营业执照
        uploadLicense() {
            this.$refs.uploadInput.click();
        },
        uploadImage(e) {
            const file = e.target.files[0];
            const ImgReg = /\.(jpe?g|png|gif|bmp)$/i;
            e.target.value = '';
            if (ImgReg.test(file.name) === false) {
                this.$toast(this.$t('wechatContent.picFormatErr'));
                return false;
            }
            if (file.size > 1024 * 1024 * 10) {
                this.$toast(this.$t('wechatContent.picSizeError'));
                return false;
            }
            //...ajax 上传临时素材接口
            WechatApiV1
                .getMediaId(file, this.appid)
                .then((res) => {
                    if (this.uploadType === 1) {
                        this.$emit('getAvatarMaterial', res.body.data);
                    }
                    if (this.uploadType === 2) {
                        this.$emit('getMaterial', res.body.data);
                    }
                    if (this.uploadType === 3) {
                        this.$emit('getCertificationImg', res.body.data);
                    }
                });
            this.licenseName = file.name;
        },
        //小程序名称修改 删除资质照片
        delImage() {
            this.licenseName = '';
            this.$emit('delImage');
        },
        resetName() {
            this.licenseName = '';
        }
    }
};
</script>

<style lang="scss" type="text/scss">
@import "../../common/scss/base/_variables.scss";
@import "../../common/scss/base/_mixin.scss";

.upload-id {
    .upload {
        cursor: pointer;

        svg {
            width: 16px;
            height: 16px;
            fill: $theme;
            vertical-align: middle;
        }

        .theme-text {
            vertical-align: middle;
        }
    }
}
</style>
