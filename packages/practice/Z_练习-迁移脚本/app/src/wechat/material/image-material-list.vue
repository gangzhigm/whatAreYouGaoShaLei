<template>
    <div class="image-material-list">
        <div class="content-view padding margin white-bg">
            <div class="material-title">
                {{'wechatContent.pics' | t}}（{{'common.total' | t}} <span
                    class="theme-text">{{material.totalRow}}</span>）<span class="comments">{{'wechatContent.uploadSizeLimit' | t}}</span>
                <label class="upload-btn pull-right btn btn-md btn-theme" :disabled="$has('wechat_material_upload_image')"> 
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-upload"></use>
                    </svg>
                    {{'wechatContent.localUpload' | t}}
                    <input id="wechat_material_upload_image" type="file" ref="upload" @change="uploadImg" :disabled="$has('wechat_material_upload_image')">
                </label>
                <span class="pull-right light-content-text">{{'wechatContent.uploadLimit' | t}},{{'wechatContent.uploadFormat' | t}}</span>
            </div>
            <div class="group-edit" v-if="material.materialList.length">
                <checkbox :source="false" v-model="allCheck" :disabled="$has('wechat_material_delete_image')">{{'common.allSelected' | t}}</checkbox>
                &nbsp;&nbsp;
                <button type="button" class="btn btn-md btn-theme" :disabled="checkbox.length <= 0||$has('wechat_material_delete_image')"
                        @click="delMaterials">
                    {{'common.del' | t}}
                </button>
            </div>
            <transition-group tag="div" class="materials" name="cards" v-load="scrollGetMaterial">
                <div class="material" v-for="material in material.materialList" :key="material.id">
                    <div class="info">
                        <img :src="material.url" alt="">
                        <div class="preview" @click="showImgPreview(material.url)">
                            <span class="icon icon-search"></span>
                        </div>
                    </div>
                    <checkbox class="materialName" :source="material.id" v-model="checkbox" :disabled="$has('wechat_material_delete_image')">
                        <span :title="material.name">{{material.name}}</span>
                    </checkbox>
                    <div class="material-edit">
                        <button class="btn icon icon-delete" :disabled="$has('wechat_material_delete_image')" @click="delMaterial(material.id)"
                             v-title="$t('common.del')"></button>
                    </div>
                </div>
            </transition-group>
            <div class="load-hint" v-if="material.page >= material.totalPage && !loading">
                {{'wechatContent.noMoreMaterials' | t}}
            </div>
            <!-- 预览 -->
            <modal :title="$t('wechatContent.previewPic')" size="lg" v-if="imgPreview" @close="closeImgPreview">
                <img class="preview-image" :src="imgPreview" alt="">
            </modal>
            <!--  上传 -->
            <backdrop v-if="uploading">
                <inline-loading></inline-loading>
                <p style="text-align: center;color: white">{{'wechatContent.materialUploading' | t}}</p>
            </backdrop>
        </div>
        <back-top></back-top>
    </div>
</template>
<script type="text/babel">
    import Backdrop from './../../common/components/modal/backdrop.vue';
    import { WechatApiV1 } from '@/api';
    import {trackEvent} from '@/monitor';
    import { mapState } from 'vuex';

    export default {
        components: {
            Backdrop
        },
        mounted() {
            this.$loading();
            WechatApiV1.getMaterials(name, 1, 1, null)
                .then((res) => {
                    let {fieldList, totalRow, totalPage} = res.body.data;
                    this.material.materialList = fieldList;
                    this.material.totalRow = totalRow;
                    this.material.totalPage = totalPage;
                    this.$loaded();
                })
                .catch(() => {
                    this.$loaded();
                });

        },
        data() {
            return {
                checkbox: [],
                material: {
                    materialList: [],
                    page: 1,
                    totalRow: '',
                    totalPage: ''
                },
                uploading: false,
                imgPreview: '',
            };
        },
        computed: {
            ...mapState(['loading']),
            allCheck: {
                get() {
                    return this.checkbox.length === this.material.materialList.length;
                },
                set(newVal) {
                    if (newVal) {
                        this.checkbox = this.material.materialList.map(material => material.id);
                    } else {
                        this.checkbox = [];
                    }
                }
            }
        },
        methods: {
            // 批量删除素材
            delMaterials() {
                if (this.checkbox.length > 0) {
                    this
                        .$confirm(
                            this.$t('common.del'),
                            this.$t('wechatContent.picsDeleteConfirm')
                        )
                        .then((sure) => {
                            if (sure)
                                WechatApiV1
                                    .delMaterials(this.checkbox)
                                    .then((res) => {
                                        this.$toast(res.body.message, 'success');
                                        trackEvent('微信管理-批量删除图片素材');
                                        WechatApiV1
                                            .getMaterials(name, 1, 1, null)
                                            .then((res) => {
                                                let {fieldList, totalRow, totalPage} = res.body.data;
                                                this.material.materialList = fieldList;
                                                this.material.totalRow = totalRow;
                                                this.material.totalPage = totalPage;
                                                // this.$refs.content.scrollTop = 0;
                                                // 页码初始化
                                                this.material.page = 1;
                                            });
                                    });
                            this.checkbox = [];
                        });
                }
            },
            // 删除单个素材
            delMaterial(mediaId) {
                // 发送delete请求
                this
                    .$confirm(
                        this.$t('common.del'),
                        this.$t('wechatContent.picDeleteConfirm')
                    )
                    .then((sure) => {
                        if (sure)
                            WechatApiV1
                                .delMaterial(mediaId)
                                .then((res) => {
                                    this.$toast(res.body.message, 'success');
                                    trackEvent('微信管理-单个删除图片素材');
                                    WechatApiV1.getMaterials(name, 1, 1, null)
                                        .then((res) => {
                                            let {fieldList, totalRow, totalPage} = res.body.data;
                                            this.material.materialList = fieldList;
                                            this.material.totalRow = totalRow;
                                            this.material.totalPage = totalPage;
                                            // 页码初始化
                                            this.material.page = 1;
                                        });
                                });
                    });
            },
            // 滚动加载数据
            scrollGetMaterial() {
                if (this.loading) return;
                this.material.page++;
                if (this.material.page <= this.material.totalPage) {
                    this.$loading();
                    WechatApiV1.getMaterials('', this.material.page, 1, null)
                        .then((res) => {
                            let {fieldList} = res.body.data;
                            //将数据放入 materialList
                            this.material.materialList = this.material.materialList.concat(fieldList);
                            this.$nextTick(function () {
                                this.$loaded();
                            });
                        })
                        .catch(() => {
                            this.$loaded();
                            this.material.page--;
                        });
                }
            },
            // 上传图片
            uploadImg(e) {
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
                this.uploading = true;
                WechatApiV1
                    .uploadImg(file, 1, file.name)
                    .then((res) => {
                        this.$toast(res.body.message, 'success');
                        this.uploading = false;
                        trackEvent('微信管理-上传图片素材');
                        WechatApiV1.getMaterials('', 1, 1, null)
                            .then((res) => {
                                this.material.materialList = res.body.data.fieldList;
                                this.material.totalRow = res.body.data.totalRow;
                                this.material.totalPage = res.body.data.totalPage;
                                // 页码初始化
                                this.material.page = 1;
                            });
                    })
                    .catch(() => {
                        this.uploading = false;
                    });
            },
            // showimg
            showImgPreview(Url) {
                this.imgPreview = Url;
                window.addEventListener('keydown', this.escape);
            },
            closeImgPreview() {
                this.imgPreview = '';
                window.removeEventListener('keydown', this.escape);
            },
            escape(e) {
                if (e.keyCode === 27) {
                    this.closeImgPreview();
                }
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .image-material-list {

        @import 'material';

        .group-edit {
            $edit-height: 50px;
            padding: ($edit-height - $input-field-height)/2 20px;
            background-color: $content-bg;
            border-bottom: none;
        }

        .materials {
            font-size: 0;
            max-width: 1350px;
            margin: auto;
            max-height: 62vh;
            overflow: scroll;

            .material {
                position: relative;
                display: inline-block;
                margin: 16px 8px 0;
                font-size: 12px;
                width: 22%;
                @include box-sizing();
                border: 1px solid $border-color;

                &:hover {
                    @include box-shadow(0 3px 8px rgba(#8b9daf, 0.16));
                }

                .materialName {
                    padding: 0 16px;
                    @include ellipsis;
                    line-height: 30px;
                    font-size: 14px;
                    display: block;
                }

                div.info {
                    position: relative;
                    height: 17.3vh;
                    overflow: hidden;

                    img {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        margin: auto;
                        height: auto;
                        width: 100%;
                    }

                    .preview {
                        position: absolute;
                        display: none;
                        left: 0;
                        top: 0;
                        height: 17.3vh;
                        line-height: 17.3vh;
                        text-align: center;
                        width: 100%;
                        background: rgba(0, 0, 0, .6);
                        color: #fff;
                        cursor: pointer;
                        font-size: 40px;
                    }
                    &:hover {
                        .preview {
                            display: block;
                        }
                    }
                }

                .material-edit {
                    @include box-sizing();
                    height: 40px;
                    border-top: 1px solid $border-color;
                    background-color: #f4f4f4;
                    text-align: center;

                    .icon {
                        display: inline-block;
                        font-size: 20px;
                        line-height: 40px;
                        color: $color-content;

                        &:hover {
                            cursor: pointer;
                            color: $color-title;
                        }
                        &.disabled {
                            cursor: not-allowed;
                            color: $disabled;
                        }
                    }
                }
            }
        }

        .preview-image {
            display: block;
            min-width: 50px;
            min-height: 50px;
            max-width: 100%;
            margin: auto;
        }

        .comments{
            margin-left: 10px;
            color: #0cc2a9;
        }
    }
</style>
