<template>
    <div class="material-list" v-load="load">
        <transition-group tag="div" class="list" name="cards">
            <div class="imageText-content" v-for="material in materials" :key="material.id">
                <div class="shell" :class="{scroll: material.materialItems.length > 2 || isMaterialComplete(material)}">
                    <div class="un-sync" v-if="isDraft && (!material.mediaId || material.mediaId === '')">
                        {{'wechatContent.noSynce' | t}}
                    </div>
                    <div class="hint" v-if="isMaterialComplete(material)">
                        <p>{{'wechatContent.notACompleteAppMessage' | t}}</p>
                        <p>{{'wechatContent.notACompleteAppMessageTip' | t}}</p>
                    </div>
                    <!-- 未发布的图文与发布状态不为0的同为发布失败 -->
                    <template v-if="!isNaN(material.publishStatus) && material.mediaId ">
                        <div class="announcing un-sync" v-if="material.publishStatus === 1">{{ 'wechatContent.announcing' | t }}</div>
                        <div class="publish-fail un-sync" v-else-if="material.publishStatus !== 0">
                            {{ 'wechatContent.publishFail' | t }}
                        </div>
                    </template>

                    <div class="image-item"
                         :class="{two: material.materialItems.length === 1, three: material.materialItems.length >= 2}">
                        <!-- fix-10137 未同步不跳转 -->
                        <a class="no-synced" :style="{height: 136 + (material.materialItems.length * 92.4) + 'px'}"
                           v-if="isDraft && (!material.mediaId || material.mediaId === '')">
                            <div class="edit_mask_content">
                                <p>
                                    {{'wechatContent.noSynced' | t}}
                                </p>
                            </div>
                            <span class="vm_box"></span>
                        </a>
                        <!--main material-->
                        <div class="image-main">
                            <div class="image-url"
                                 :style="{backgroundImage:'url(' + material.thumbMediaUrl + ')'}"></div>
                            <h4>{{material.title}}</h4>
                            <div v-if="isDraft ? material.mediaId : material.articleId" class="preview_mask">
                                <a :href="pcPreviewUrl(material, material.mpnewsType)" target="_blank" class='pc-preview'>
                                    {{'wechatContent.pcPreview' | t}}
                                </a>
                                <span class='mobile-preview' @click="sendPreview(material, material.mpnewsType)">{{'wechatContent.mobilePreview' | t}}</span>
                            </div>
                        </div>
                        <!--sub material-->
                        <div class="image-sub" v-for="materialItem in material.materialItems">
                            <div class="box item-title">{{materialItem.title}}</div>
                            <div class="box image-url"
                                 :style="{backgroundImage:'url(' + materialItem.thumbMediaUrl + ')'}">
                            </div>
                            <div v-if="isDraft ? material.mediaId : material.articleId" class="preview_mask">
                                <a :href="pcPreviewUrl(materialItem, material.mpnewsType)" target="_blank" class='pc-preview'>
                                    {{'wechatContent.pcPreview' | t}}
                                </a>
                                <span class='mobile-preview' @click="sendPreview(materialItem, material.mpnewsType)">{{'wechatContent.mobilePreview' | t}}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <!--时间-->
                <div class="image-time">{{material.updateDateString}}</div>
                <!--编辑-->
                <div class="image-edit">
                    <!-- <router-link class="edit" :to="{name: 'imageTextEdit',query:{id: material.id} }">
                        <svg aria-hidden="true" class="icon" v-title="$t('common.edit')">
                            <use xlink:href="#icon-pencil"></use>
                        </svg>
                    </router-link> -->
                    <button v-if="isDraft" class="btn publish" :disabled="$has('wechat_material_publish') || !material.mediaId || material.mediaId === ''"
                            @click="draftPublish(material)" v-title="$t('wechatContent.publish')">
                        <svg v-if="material.publishStatus === 1" aria-hidden="true" class="icon icon-classic-loading">
                            <use xlink:href="#icon-classic-loading"></use>
                        </svg>
                        <svg v-else t="1638927432271" class="icon" viewBox="0 0 1024 1024" version="1.1"
                             xmlns="http://www.w3.org/2000/svg" p-id="70991" width="16" height="16">
                            <path d="M537.6 164.1984V435.2a25.6 25.6 0 1 1-51.2 0V164.1984L421.4784 229.12a25.6 25.6 0 1 1-36.1984-36.1984L512 66.2016l126.72 126.72a25.6 25.6 0 1 1-36.1984 36.1984L537.6 164.1984zM719.872 230.4a25.6 25.6 0 1 1 0-51.2H819.2c42.0352 0 76.8 32.4608 76.8 73.3696v621.2608c0 40.96-34.7648 73.3696-76.8 73.3696H204.8c-42.0352 0-76.8-32.4608-76.8-73.3696V252.5696c0-40.96 34.7648-73.3696 76.8-73.3696h102.8608a25.6 25.6 0 1 1 0 51.2H204.8c-14.5408 0-25.6 10.3424-25.6 22.1696v621.2608c0 11.8272 11.0592 22.1696 25.6 22.1696h614.4c14.5408 0 25.6-10.3424 25.6-22.1696V252.5696c0-11.8272-11.0592-22.1696-25.6-22.1696h-99.328zM332.8 563.2h358.4a25.6 25.6 0 1 1 0 51.2h-358.4a25.6 25.6 0 1 1 0-51.2z m0 153.6h358.4a25.6 25.6 0 1 1 0 51.2h-358.4a25.6 25.6 0 1 1 0-51.2z"
                                  :fill="$has('wechat_material_publish') || !material.mediaId || material.mediaId === '' ? '#bfbfbf' : '#666666'" p-id="70992"></path>
                        </svg>
                    </button>
                    <button class="btn edit" id="wechat_material_edit_news" :disabled="(isDraft ? $has('wechat_material_edit_news') : $has('wechat_material_add_draft')) || material.publishStatus === 1"
                            v-title="isDraft ? $t('common.edit') : $t('wechatContent.addDraft')" @click="jumpToEdit(material)">
                        <svg v-if="isDraft" aria-hidden="true" class="icon">
                            <use xlink:href="#icon-pencil"></use>
                        </svg>
                        <svg v-else t="1640327083737" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6919" width="24" height="24">
                            <path d="M803.915716 1024H144.320809A110.0275 110.0275 0 0 1 34.29331 913.9725V181.120942a110.0275 110.0275 0 0 1 110.027499-110.0275h513.081605a36.770848 36.770848 0 0 1 0 73.256652h-513.081605a36.770848 36.770848 0 0 0-36.770848 36.770848v732.851558a36.770848 36.770848 0 0 0 36.770848 36.770849H803.915716a36.770848 36.770848 0 0 0 36.770849-36.770849V327.634245a36.770848 36.770848 0 0 1 73.256651 0v586.338255A110.0275 110.0275 0 0 1 803.915716 1024z"
                                fill="#666666" p-id="6920">
                            </path>
                            <path d="M588.706488 437.661744a36.770848 36.770848 0 0 1-25.939126-10.831723 36.200758 36.200758 0 0 1 0-51.878251L926.770256 10.948876a36.200758 36.200758 0 0 1 51.878251 0 36.200758 36.200758 0 0 1 0 51.878252L614.645613 427.685157a37.340939 37.340939 0 0 1-25.939125 10.831723zM437.347414 437.661744H217.577461a36.770848 36.770848 0 1 1 0-73.256651h219.769953a36.770848 36.770848 0 1 1 0 73.256651zM657.402414 657.431698H217.577461a36.770848 36.770848 0 1 1 0-73.256651h439.824953a36.770848 36.770848 0 0 1 0 73.256651z"
                                fill="#666666" p-id="6921">
                            </path>
                        </svg>
                    </button>
                    <button class="btn delete" id="wechat_material_delete_news" :disabled="$has('wechat_material_delete_news') || material.publishStatus === 1"
                            v-title="$t('common.del')" @click="delMaterial(material.id, material.state)">
                        <svg aria-hidden="true" class="icon">
                            <use xlink:href="#icon-delete"></use>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="empty" key="1"></div>
            <div class="empty" key="2"></div>
            <div class="empty" key="3"></div>
            <div class="empty" key="4"></div>
            <div class="empty" key="5"></div>
        </transition-group>
    </div>
</template>

<script>
    import { WechatApiV1 } from '@/api';
    import { throttle } from 'lodash';
    export default {
        name: 'image-text',
        props: {
            // 素材列表
            materials: {
                type: Array,
                required: true,
            },
            // 处于草稿箱页面
            isDraft: {
                type: Boolean,
                default: true
            }
        },
        methods: {
            // 判断素材是否完整
            isMaterialComplete(material) {
                if (
                    material.title === '' ||
                    material.thumbMediaUrl === ''
                ) {
                    return true;
                }
                for (let i = 0; i < material.materialItems.length; i++) {
                    if (
                        material.materialItems[i].title === '' ||
                        material.materialItems[i].thumbMediaUrl === ''
                    ) {
                        return true;
                    }
                }
                return false;
            },

            // 删除素材
            delMaterial(id, state) {
                this.$emit('del', id, state);
            },
            sendPreview(material, mpnewsType) {
                // mpnewsType 图文类型（1.草稿 2.已发布图文）
                const url = mpnewsType === 1 ? material.temporaryUrl : material.url;
                if (url) this.$emit('showPreview',url);
            },
            jumpToEdit(material) {
                // 视频图文不可编辑
                if (this.isDraft && material.mediaId && !material.thumbMediaId) {
                    this.$toast(this.$t('wechatContent.videoImageTextNoEdit'), 'warn');
                    return;
                }
                if (this.isDraft) {
                    this.$router.push({name:'imageTextEdit',query: { id: material.id, addDraft: this.isDraft ? 0 : 1 }});
                } else {
                    WechatApiV1
                        .convertToDraft(material.id)
                        .then(() => {
                            this.$emit('reload');
                        });
                }
            },
            load() {
                this.$emit('load');
            },
            // 发布草稿
            draftPublish: throttle(function (material) {
                if (material.publishStatus === 1) return;
                this.$confirm(this.$t('wechatContent.publish'), this.$t('wechatContent.confirmPublish'))
                    .then(sure => {
                        if (sure) this.$emit('draftPublish', material.id);
                    });
            }, 300),
            pcPreviewUrl(material, mpnewsType) {
                // mpnewsType 图文类型（1.草稿 2.已发布图文）
                return mpnewsType === 1 ? material.temporaryUrl : material.url;
            }
        }
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .material-list {
        max-height: 62vh;
        overflow: scroll;
        .list {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
        }
        .empty {
            flex-grow: 1;
            position: relative;
            width: 14.5vw;
            margin: 0 8px 16px 8px;
            border: none;
        }
        .imageText-content {
            flex-grow: 1;
            position: relative;
            width: 14.5vw;
            margin: 0 8px 16px 8px;
            border: 1px solid $border-color;
            &:hover {
                @include box-shadow(0 3px 8px rgba(#8b9daf, 0.16));
            }
            .shell {
                height: 33vh;
            }
            .scroll {
                margin-bottom: 8px;
                overflow-y: auto;
            }
            // 图文内容
            .image-item {
                position: relative;
                height: calc(100% - 8px);
                margin: 8px;
                .no-synced {
                    position: absolute;
                    left: -8px;
                    right: -8px;
                    top: -8px;
                    display: none;
                    min-height: 33vh;
                    text-align: center;
                    background: rgba(0, 0, 0, 0.5);
                    color: #fff;
                    z-index: 1;
                }
                &:hover {
                    .no-synced {
                        display: block;
                    }
                }
            }
            .image-main {
                height: 100%;
                &:hover {
                    .preview_mask {
                        display: block;
                    }
                }
                .preview_mask {
                    position: absolute;
                    left: -8px;
                    right: -8px;
                    top: -8px;
                    display: none;
                    height: calc(100% + 16px);
                    text-align: center;
                    background: rgba(0, 0, 0, 0.5);
                    color: #fff;
                }
            }

            .two {
                height: 70%;
                .image-sub {
                    height: 36%;
                    .box {
                        line-height: 84px;
                    }
                    .preview_mask {
                        position: absolute;
                        left: -8px;
                        right: -8px;
                        top: 100%;
                        bottom: 0;
                        display: none;
                        height: 43%;
                        text-align: center;
                        background: rgba(0, 0, 0, 0.5);
                        color: #fff;
                    }
                }
            }
            .three {
                position: relative;
                height: 40%;
                .image-sub {
                    position: relative;
                    height: 66%;
                    .box {
                        line-height: 90px;
                    }
                    .preview_mask {
                        position: absolute;
                        top: -8px;
                        right: 0;
                        bottom: 0;
                        left: -8px;
                        display: none;
                        width: calc(100% + 16px);
                        height: calc(100% + 16px);
                        text-align: center;
                        background: rgba(0, 0, 0, 0.5);
                        color: #fff;
                    }
                }
            }
            .image-sub {
                margin: 8px 0;
                &:hover {
                    .preview_mask {
                        display: block;
                    }
                }
                .box {
                    float: left;
                    width: 50%;
                    height: 100%;
                }
            }

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

            .image-url {
                height: 100%;
                overflow: hidden;
                background-repeat: no-repeat;
                background-position: center center;
                background-size: cover;
            }

            h4 {
                position: relative;
                top: -32px;
                width: calc(100% - 16px);
                height: 32px;
                line-height: 32px;
                margin: 0;
                padding: 0 8px;
                font-style: normal;
                background-color: rgba(0, 0, 0, .6);
                color: white;
                overflow: hidden;
                @include user-select(none);
                @include ellipsis();
            }

            // 多个图文的title
            .item-title {
                @include ellipsis();
            }

            // 未同步至微信
            .un-sync {
                position: absolute;
                z-index: 1;
                right: 0;
                top: 0;
                width: 5.5vw;
                height: 2vh;
                line-height: 2vh;
                text-align: center;
                background: $green;
                color: #fff;
                cursor: default;
            }

            // 图文信息不完整
            .hint {
                padding: 14px;
                line-height: 20px;
                p {
                    color: #ffbe00;
                }
            }

            // 时间
            .image-time {
                font-size: 13px;
                height: 24px;
                line-height: 24px;
                padding-left: 8px;
                border-top: 1px solid #e7e7eb;
            }

            // 编辑
            .image-edit {
                box-sizing: border-box;
                height: 32px;
                border-top: 1px solid $border-color;
                background-color: #f4f4f4;
                text-align: center;
                display: flex;
                .btn + .btn {
                    margin: 0;
                }
                .publish {
                    flex-grow: 1;
                    &:disabled {
                        svg {
                            cursor: not-allowed;
                        }
                    }
                    .icon-classic-loading {
                        @include animation(rotate 1s linear infinite);
                        cursor: not-allowed;
                    }
                    @keyframes rotate {
                        0% {
                            @include transform(rotate(0deg));
                        }
                        100% {
                            @include transform(rotate(360deg));
                        }
                    }
                }
                .edit {
                    flex-grow: 1;
                    height: 100%;
                    border-right: 1px solid $border-color;
                    border-left: 1px solid $border-color;
                    @include box-sizing(border-box);
                }
                .delete {
                    flex-grow: 1;
                    height: 100%;
                }
                .icon {
                    width: 16px;
                    height: 16px;
                    margin: 8px;
                    fill: $color-light-content;
                }
            }
        }
        .preview_mask {
            .pc-preview,
            .mobile-preview { 
                color: #fff;
                position: relative;
                top: calc(50% - 8px);
            }
            .mobile-preview {
                cursor: pointer;
                margin-left: 24px;
            }
        }
    }
</style>
