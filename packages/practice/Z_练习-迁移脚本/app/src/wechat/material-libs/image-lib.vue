<template>
    <modal size="lg" @close="$emit('cancel')" :title="$t('wechatContent.pickImage')" neat @load="scrollGetMaterial">
        <div class="material-title" v-if="isLocalUp">
            <label class="upload-btn btn btn-md btn-theme" :disabled="$has('wechat_material_upload_image')"> 
                <svg aria-hidden="true">
                    <use xlink:href="#icon-upload"></use>
                </svg>
                {{'wechatContent.localUpload' | t}}
                <input id="wechat_material_upload_image" type="file" ref="upload" @change="uploadImg" :disabled="$has('wechat_material_upload_image')">
            </label>
            <span class="light-content-text">{{'wechatContent.localUploadLimit' | t}}</span>
        </div>
        <div class="material-lib image-lib">
            <div class="material-list" v-load="scrollGetMaterial">
                <div class="material" v-for="(material,index) in materials" :key="material.mediaId">
                    <div class="material-preview" @click="id = [material.mediaId]"
                         :class="{selected: id[0] === material.mediaId}">
                        <checkbox :source="material.mediaId" v-model="id"></checkbox>
                        <img :src="material.url" :alt="material.name" rel="noreferrer">
                    </div>
                    <div class="material-info">
                        <a class="material-name" target="_blank" :href="material.url">{{material.name}}</a>
                    </div>
                </div>
                <p class="loading-tip" v-if="pageNumber > totalPage">{{'wechatContent.noMoreMaterials' | t}}</p>
                <p class="loading-tip" v-else>{{(loaded ? 'pagination.scrollForMore' : 'common.loading') | t}}</p>
            </div>
        </div>
        <template v-slot:buttons>
            <div class="btn btn-md btn-white" @click="$emit('cancel')">{{'common.cancel' | t}}</div>
            <div class="btn btn-md btn-theme" @click="sure">{{'common.confirm' | t}}</div>
        </template>
    </modal>
</template>
<script type="text/babel">
    import { WechatApiV1 } from '@/api';

    export default {
        name: 'image-lib',
        props: {
            // 目标公众号id，非必填
            officialId: {
                type: Number
            },
            // 是否开启本地上传
            isLocalUp: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                id: [],
                materials: [],
                pageNumber: 1,
                loaded: true,
                totalPage: Infinity,
            };
        },
        mounted() {
            this.fetchMaterials(true);
        },
        methods: {
            fetchMaterials(reset) {
                if (!this.loaded) return;
                this.loaded = false;
                if (reset) {
                    this.pageNumber = 1;
                }
                WechatApiV1
                    .getMaterials('', this.pageNumber, 1, undefined, undefined, undefined, this.officialId)
                    .then(({body: {data: {fieldList: materials, totalPage}}}) => {
                        if (reset) {
                            this.materials = materials;
                            this.totalPage = totalPage;
                        } else {
                            this.materials = this.materials.concat(materials);
                            this.totalPage = totalPage;
                        }

                        this.$nextTick(() => {
                            this.loaded = true;
                        });
                    });
            },
            sure() {
                if (this.id.length !== 0) {
                    let material = this.materials.find(material => this.id.includes(material.mediaId));
                    if (material)
                        this.$emit('choose', material);

                }
            },
            // 滚动加载
            scrollGetMaterial() {
                if (this.loaded) {
                    this.pageNumber++;
                    if (this.pageNumber <= this.totalPage) {
                        this.fetchMaterials(false);
                    }
                }
            },
            // 上传本地图片
            uploadImg(e) {
                const file = e.target.files[0];
                const ImgReg = /\.(jpg|png)$/i;
                e.target.value = '';
                if (ImgReg.test(file.name) === false) {
                    this.$toast(this.$t('wechatContent.localUploadLimitFormatErr'));
                    return false;
                }
                if (file.size > 1024 * 1024 * 1) {
                    this.$toast(this.$t('wechatContent.picSizeErr'));
                    return false;
                }
                this.uploading = true;
                WechatApiV1
                    .uploadLocalImg(file)
                    .then((res) => {
                        this.$emit('choose', res.body.data);
                    });
            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";
    @import "./material-lib";

    .material-title{
        padding: 16px 0 0 32px;

        .upload-btn {

            input {
                display: none;
            }
        }

        .light-content-text{
            margin-left: 10px;
        }
    }

    .image-lib {
        padding: 16px 0 16px 16px;

        .material {
            $width: 302px;
            $height: 199px;
            display: inline-block;
            vertical-align: top;
            margin-bottom: 16px;
            width: $width;

            &:nth-of-type(3n + 2) {
                margin-left: 16px;
                margin-right: 16px;
            }

            .material-preview {
                position: relative;
                height: 148px - 2px - 4px;
                border: 1px solid $border-color;
                padding: 2px;
                background-color: $content-bg;
                background-clip: content-box;
                cursor: pointer;

                &:hover,
                &.selected {
                    border-color: $theme;
                }

                img {
                    display: block;
                    margin: auto;
                    width: auto;
                    height: auto;
                    max-width: 100%;
                    max-height: 100%;
                }

                .checkbox {
                    position: absolute;
                    line-height: normal;
                    left: 11px;
                    top: 11px;
                    z-index: 1;
                }
            }

            .material-info {
                padding: 6px 1em;
                background-color: #eeeeee;
                @include ellipsis();
                line-height: 20px;

                a {
                    color: $color-content;

                    &:hover {
                        color: $theme;
                        text-decoration: underline;
                    }
                }
            }
        }

    }
</style>
