<template>
    <div class="content-material-imgText" :class="extraClass">
        <div class="content-view padding margin white-bg">
            <div class="search-box">
                <input type="text"
                       :placeholder="$t('wechatContent.title') + '/' + $t('wechatContent.author') + '/' + $t('wechatContent.abstract')"
                       v-model.trim="searchValue" @keyup.enter="searchMaterial">
                <svg aria-hidden="true" @click="searchMaterial">
                    <use xlink:href="#icon-search"></use>
                </svg>
            </div>
            <template v-if="isImgText">
                <button type="button" id="wechat_material_add_news" :disabled="$has('wechat_material_add_news')"
                    @click="createImgText" class="pull-right btn btn-md btn-theme">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'wechatContent.createAppMessage' | t}}
                </button>
                <p class="material-title">
                        {{'wechatContent.draft' | t}}
                        （{{'common.total' | t}}<span class="theme-text">{{totalRow}}</span>）
                        <span class="red-text">{{'wechatContent.imageTextTip' | t}}</span>
                </p>
            </template>
            <div v-else class="material-title">
                <span class="published-count-box">{{ $t('wechatContent.publish') }}&nbsp;{{totalRow}}</span>
                <span class="red-text">{{'wechatContent.imageTextPublishTip' | t}}</span>
            </div>
            <!--图文列表-->
            <image-text @load="scrollGetMaterial" :materials="materials" :is-draft="isImgText" @reload="goDraft"
                @del="delMaterial" @showPreview="showPreview" @draftPublish="publish"/>
        </div>
        <back-top/>
        <modal :title="$t('wechatContent.sendPreview')" v-if="isSendPreview" @close="cancelSendPreview" >
            <div class="send-preview-modal">
                <img :src='imageUrl' class="image-preview"/>
                <p>{{'wechatContent.scan' | t}}</p>
                <p class="preview-item">{{'wechatContent.previewQRcode' | t}}</p>
            </div>
        </modal>
    </div>
</template>
<script type="text/babel">
    import { WechatApiV1 } from '@/api';
    import {trackEvent} from '@/monitor';
    import ImageText from './common/image-text.vue';

    export default {
        props: {
            // 页面实例用于微信-草稿页
            isImgText: {
                type: Boolean,
                default: true
            },
            // 被复用时的附加类名
            extraClass: {
                type: String,
            },
            // 图文类型（1.草稿 2.已发布图文）
            mpnewsType: {
                type: Number,
                default: 1
            }
        },
        components: {
            ImageText,
        },
        mounted() {
            this.fetchMaterials();
        },
        data() {
            return {
                materials: [], // 图文列表
                page: 1,
                totalRow: '',
                totalPage: '',
                searchValue: '',
                postValue: '',
                isSendPreview: false,
                imageUrl: '',
            };
        },
        methods: {
            // 获取素材列表
            fetchMaterials() {
                this.$loading();
                WechatApiV1
                    .getMaterials('', 1, 5, 1, undefined, undefined, undefined, undefined, this.mpnewsType)
                    .then(res => {
                        this.totalRow = res.body.data.totalRow;
                        this.totalPage = res.body.data.totalPage;
                        this.materials = res.body.data.fieldList;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 添加素材
            createImgText() {
                WechatApiV1
                    .createMainMaterial()
                    .then(res => {
                        trackEvent('微信管理-创建图文素材');
                        this.$router.push({
                            name: 'imageTextCreate',
                            query: {id: res.body.data.material.id}
                        });
                    });
            },
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
            searchMaterial() {
                this.$loading();
                this.page = 1;
                WechatApiV1
                    .getMaterials(this.searchValue, 1, 5, null, undefined, undefined, undefined, undefined, this.mpnewsType)
                    .then(res => {
                        this.totalRow = res.body.data.totalRow;
                        this.totalPage = res.body.data.totalPage;
                        this.postValue = this.searchValue;
                        this.materials = res.body.data.fieldList;
                        this.$loaded();
                    });
            },
            delMaterial(mediaId, state) {
                // 发送delete请求
                if (!state) {
                    this.$toast(this.$t('wechatContent.unDeletable'), 'warn');
                    return;
                }
                const tips = this.isImgText ? this.$t('wechatContent.appMessageDeleteTip') : this.$t('wechatContent.publishedDelTip');
                this.$confirm(this.$t('common.delete'), tips)
                    .then(sure => {
                        if (sure)
                            WechatApiV1
                                .delMaterial(mediaId, this.mpnewsType)
                                .then(res => {
                                    this.$toast(res.body.message, 'success');
                                    trackEvent('微信管理-删除图文素材');
                                    WechatApiV1
                                        .getMaterials(this.searchValue, 1, 5, null, undefined,
                                            undefined, undefined, undefined, this.mpnewsType)
                                        .then(res => {
                                            this.totalRow = res.body.data.totalRow;
                                            this.totalPage = res.body.data.totalPage;
                                            //  页码初始化
                                            this.page = 1;
                                            this.fetchMaterials();
                                        });
                                });
                    });
            },
            // 滚动加载数据
            scrollGetMaterial() {
                if (this.$store.state.loading) return;
                this.page++;
                if (this.page <= this.totalPage) {
                    this.$loading();
                    WechatApiV1
                        .getMaterials(
                            this.postValue,
                            this.page,
                            5,
                            null,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            this.mpnewsType
                        )
                        .then(res => {
                            res.body.data.fieldList.forEach(elem => {
                                this.materials.push(elem);
                            });
                            this.$nextTick(function () {
                                this.$loaded();
                            });
                        })
                        .catch(() => {
                            this.$loaded();
                            this.page--;
                        });
                } else {
                    this.page--;
                }
            },
            cancelSendPreview() {
                this.isSendPreview = false;
                this.imageUrl = '';
            },
            showPreview(url) {
                this.$loading();
                WechatApiV1
                    .previewPicture(url)
                    .then((res) => {
                        this.$loaded();
                        this.imageUrl = res.body.data.url;
                        this.isSendPreview = true;
                    })
                    .catch(() => {
                        this.$toast(this.$t('wechatContent.previewFailed'),'warn');
                        this.$loaded();
                    });
            },
            // 草稿箱发布
            publish(id) {
                this.$loading();
                WechatApiV1
                    .draftPublish(id)
                    .then(() => {
                        this.$loaded();
                        this.fetchMaterials();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            goDraft() {
                this.$router.push({name:'imageTextList'});
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .content-material-imgText {
        @import "./material";
        .send-preview-modal {
            text-align: center;

            .image-preview {
                width: 120px;
                height: 120px;
                margin-bottom: 1em;
            }
            .preview-item {
                margin-top: 1em;
                color: $color-light-content;
            }
        }
        .published-count-box {
            @include box-sizing();
            margin-left: 8px;
            height: 34px;
            padding: 8px;
            background-color: $theme;
            color: #fff;
        }
    }
</style>
