<template>
    <div class="wechat-preview">
        <div v-if="pageType === 'summary'" class="summary-preview-wrapper">
            <div class="main-material">
                <div class="img-wrapper" :class="{ zipped: previewItem.materialItems && previewItem.materialItems.length > 0 }">
                    <div class="image-url" :style="{backgroundImage:'url(' + previewItem.thumbMediaUrl + ')'}"></div>
                    <div class="preview_mask" @click="openPreview(previewItem)">
                        <div class="edit_mask_content">
                            <p v-text="$t('QRCode.preview')"></p>
                        </div>
                        <span class="vm_box"></span>
                    </div>
                    <h4>{{ previewItem.title }}</h4>
                </div>
                <!-- 有materialItems列表的多图文素材 -->
                <template v-if="previewItem.materialItems && previewItem.materialItems.length > 0">
                    <ul class="sub-material-wrapper">
                        <li class="sub-material" v-for="item in previewItem.materialItems" :key="item.id">
                            <div class="content">
                                <p class="sub-title">{{textSplice(item.title, 86, true)}}</p>
                                <img :src="item.thumbMediaUrl" class="sub-trumb">
                            </div>
                            <div class="shadow" @click="openPreview(item)">
                                <p class="preview-tips" v-text="$t('QRCode.preview')"></p>
                            </div>
                        </li>
                    </ul>
                </template>
            </div>
            <div class="title-box">
                <p>{{ previewItem.name || previewItem.title }}</p>
                <p>{{ previewItem.updateDateString }}</p>
            </div>
        </div>
        <div v-if="pageType === 'detail'" class="detail-preview-wrapper">
            <p class="back" @click="back()">&lt;&nbsp;{{'material.backToCover' | t}}</p>
            <div class="content-title" ref="contentTitle">
                <p class="title">{{selectedMaterial.title}}</p>
                <p class="dataAuthor">
                    <span>{{selectedMaterial.author}}</span>
                    {{selectedMaterial.updateDateString}}&nbsp;
                </p>
            </div>
            <div class="main-content" ref="contentView"></div>
            <a v-if="selectedMaterial.contentSourceUrl" class="original-link"
                :href="snapShot ? '' : selectedMaterial.contentSourceUrl" :target="snapShot ? '' : '_blank'">原文链接</a>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    import {sliceWords} from '../../common/utils/mixin';

    export default {
        props: {
            previewItem: Object,
            // 是否快照模式，用于显示微信图文副本
            snapShot: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                // 2 kinds of page type: summary(default) and detail
                pageType: 'summary',
                selectedMaterial: {},
                imageSrc: ''
            };
        },
        methods: {
            textSplice(content, slice, ellipsis) {
                return sliceWords(content, slice, ellipsis);
            },
            /**
             * 进入图文消息详情预览
             * 当编辑模式（旅程未开始，尚未生成图文消息副本），使用mp.weixin.com打开新页面预览
             * 当快照模式（已经生成图文消息副本）时，本页切换视图，且所有链接不可跳转
             */
            openPreview(item) {
                if (this.snapShot) {
                    this.selectMaterial(item);
                } else {
                    if (!item.temporaryUrl && !item.url) {
                        this.selectMaterial(item);
                    } else {
                        let url = this.previewItem.mpnewsType === 1 ? item.temporaryUrl : item.url;
                        if (url) window.open(url, '_blank');
                    }
                }
            },
            selectMaterial(material) {
                this.selectedMaterial = material;
                this.pageType = 'detail';
                this.$nextTick(() => {
                    this.$refs.contentView.innerHTML = material.content;
                    let aList = this.$refs.contentView.querySelectorAll('a');
                    // 快照模式禁止a标签跳转
                    aList.forEach(ele => {
                        ele.setAttribute('href', 'javaScript:void(0)');
                        ele.setAttribute('target', '');
                    });
                });
            },
            back() {
                this.$refs.contentView.innerHTML = null;
                this.pageType = 'summary';
                this.selectedMaterial = {};
            },
        }
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .wechat-preview {
        margin: 0 auto;
        width: 677px;
        padding: 20px;

        .summary-preview-wrapper {
            overflow-y: auto;
            overflow-x: hidden;
            margin: 0 auto;
            max-width: 490px;
            border: 1px solid $border-color;
            border-radius: 10px;
            cursor: pointer;

            .main-material {
                padding: 20px 20px 0 20px;
                border-bottom: 1px solid $border-color;

                .img-wrapper {
                    position: relative;
                    overflow: hidden;
                    height: 255px;

                    &:hover {
                        .preview_mask {
                            display: block;
                        }
                    }
                    // 多图文素材时压缩主素材图高度
                    &.zipped {
                        height: 150px;
                    }

                    .image-url {
                        height: 100%;
                        overflow: hidden;
                        background-repeat: no-repeat;
                        background-position: center center;
                        background-size: cover;
                    }

                    .preview_mask {
                        position: absolute;
                        left: -8px;
                        right: -8px;
                        top: -8px;
                        display: none;
                        height: calc(100% + 16px);
                        width: calc(100% + 8px);
                        text-align: center;
                        @include linear-gradient(rgba(0, 0, 0, .2), rgba(0, 0, 0, .8));
                        color: #fff;
                        .edit_mask_content {
                            text-align: center;
                            display: inline-block;
                            vertical-align: middle;
                            font-size: 14px;
                            p {
                                margin: 0 auto;
                            }
                        }

                        .vm_box {
                            display: inline-block;
                            height: 100%;
                            vertical-align: middle;
                        }
                    }

                    h4 {
                        overflow: hidden;
                        position: relative;
                        top: -45px;
                        margin: 0;
                        padding: 0 16px;
                        width: calc(100% - 16px);
                        height: 45px;
                        line-height: 45px;
                        font-size: 16px;
                        font-style: normal;
                        background-color: rgba(0, 0, 0, .6);
                        color: white;
                        @include user-select(none);
                        @include ellipsis();
                    }
                }
            }

            .sub-material-wrapper {
                .sub-material {
                    position: relative;
                    height: 85px;
                    .content {
                        box-sizing: border-box;
                        padding: 10px 16px;
                        height: 100%;

                        .sub-title {
                            float: left;
                            @include box-sizing();
                            margin-right: 29px;
                            height: 100%;
                            width: -webkit-calc(100% - #{29px + 65px});
                            width: calc(100% - #{29px + 65px});
                            padding: 20px 0;
                            font-size: 16px;
                            line-height: 1.5em;
                            @include ellipsis();
                            color: $color-content;
                        }

                        .sub-trumb {
                            float: left;
                            display: block;
                            width: 65px;
                            height: 65px;
                        }
                    }

                    .shadow {
                        display: none;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        @include linear-gradient(rgba(0, 0, 0, .2), rgba(0, 0, 0, .8));

                        p {
                            margin: 24px auto;
                            font-size: 14px;
                            text-align: center;
                            color: #fff;
                        }
                    }

                    &:hover {
                        .shadow {
                            display: block;
                        }
                    }

                }
                &>.sub-material:not(:last-child) {
                    border-bottom: 1px solid $border-color;
                }
            }

            .title-box {
                padding: 10px 20px 10px 20px;
                p {
                    margin-top: 5px;
                    white-space: nowrap;
                    overflow: hidden;
                    -ms-text-overflow: ellipsis;
                    text-overflow: ellipsis;
                    line-height: 15px;
                    color: #8c8c8c;
                    @include ellipsis;
                }
            }
        }

        .detail-preview-wrapper {
            .back {
                margin-bottom: 10px;
                line-height: $input-field-height;
                color: $color-light-content;
                cursor: pointer;
            }

            .content-title {
                margin: 0 auto;

                .title {
                    margin-bottom: 14px;
                    font-size: 22px;
                    font-weight: normal;
                }

                .dataAuthor {
                    margin-bottom: 22px;
                    line-height: $input-field-height;
                    font-size: 15px;
                    color: $color-light-content;
                    // color: #666666;
                    span {
                        margin-right: 10px;
                        color: #999999;
                    }
                }
            }
            .main-content {
                width: 100%;
                margin: 0 auto;
                overflow-y: auto;
                .mini-program-text {
                    padding-left: 14px;
                    background: url('../../wechat/material/material-editor-componets/miniprogram-icon.png') no-repeat left top;
                    background-size: 14px 14px;
                }
            }
            .original-link {
                text-decoration: none;
            }
        }
    }
</style>
