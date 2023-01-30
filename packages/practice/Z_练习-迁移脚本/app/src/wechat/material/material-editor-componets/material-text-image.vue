<template>
    <div class="material-text-image">
        <div class="chosen-material" v-if="material.url || hasId || material.thumbMediaUrl">
            <div class="material-preview">
                <!-- 图文 -->
                <div class="material-list">
                    <div class="imageText-content">
                        <div class="shell"
                             :class="{scroll: material.materialItems && material.materialItems.length > 1}">
                            <div class="un-sync" v-if="!hasId || hasId === ''">
                                {{'wechatContent.noSynce' | t}}
                            </div>
                            <div class="image-item"
                                 :class="{two: material.materialItems && material.materialItems.length === 1,
                                    three: material.materialItems && material.materialItems.length > 1}">
                                <!--main material-->
                                <div class="image-main">
                                    <div class="image-url"
                                         :style="{backgroundImage:'url(' + material.thumbMediaUrl + ')'}"></div>
                                    <h4>{{material.title}}</h4>
                                    <a href="javaScript:void(0)" target="_blank" class="preview_mask"
                                       v-if="!hasId || hasId === ''">
                                        <div class="edit_mask_content">
                                            <p class="">{{'wechatContent.noSynced' | t}}</p>
                                        </div>
                                        <span class="vm_box"></span>
                                    </a>
                                    <a :href="material.articleId ? material.url : material.temporaryUrl" target="_blank" class="preview_mask" v-else>
                                        <div class="edit_mask_content">
                                            <p v-text="$t('QRCode.preview')"></p>
                                        </div>
                                        <span class="vm_box"></span>
                                    </a>
                                </div>
                                <!--sub material-->
                                <div class="image-sub" v-for="materialItem in material.materialItems">
                                    <div class="box item-title">{{materialItem.title}}</div>
                                    <div class="box image-url"
                                         :style="{backgroundImage:'url(' + materialItem.thumbMediaUrl + ')'}"></div>
                                    <a :href="materialItem.articleId ? materialItem.url : materialItem.temporaryUrl" target="_blank" class="preview_mask">
                                        <div class="edit_mask_content">
                                            <p v-text="$t('QRCode.preview')"></p>
                                        </div>
                                        <span class="vm_box"></span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="material-info">
                    <span class="pull-right icon icon-delete" @click="delMaterial"
                          v-title:top="$t('QRCode.editorDelete')"></span>
                <p class="material-name">{{material.name || material.title}}</p>
                <p class="material-name">{{material.updateDateString}}</p>
            </div>
        </div>
        <template v-else>
            <div class="choose-material" @click="openLib = true">
                <span>{{'QRCode.chooseContents' | t}}</span>
            </div>
            <label class="create-material" key="content" :class="{'isDisabled':$has('wechat_material_add_news')}">
                <a @click="createImgText">
                    <span>{{'QRCode.newAppMsg' | t}}</span>
                </a>
            </label>
        </template>
        <image-text-lib v-if="openLib" @choose="chooseFinish" @cancel="openLib = false"
                        :mpnewsType="mpnewsType" :no-sub-materials="noSubMaterials"/>
    </div>
</template>
<script type="text/babel">
    import { WechatApiV1 } from '@/api';
    import ImageTextLib from '../../material-libs/image-text-lib.vue';
    export default {
        props: {
            material: {
                type: Object
            },
            noSubMaterials: Boolean,
            mpnewsType: {
                type: Number,
                default: 2
            }
        },
        data() {
            return {
                openLib: false,
            };
        },
        computed: {
            hasId() {
                let id = this.mpnewsType === 2 ? this.material.articleId : this.material.mediaId;
                return id || '';
            }
        },
        methods: {
            // 新建图文素材
            createImgText() {
                if (this.$has('wechat_material_add_news')) return;
                WechatApiV1
                    .createMainMaterial()
                    .then(({body: {data}}) => {
                        this.$router.push({
                            name: 'imageTextCreate',
                            query: {id: data.id}
                        });
                    });
            },
            // 判断素材是否完整
            isMaterialComplete() {
                if (!this.material) {
                    this.$toast(this.$t('wechatContent.pickImageText'), 'warn');
                    return false;
                }
                if (!this.material.title || !this.material.thumbMediaUrl) {
                    this.$toast(this.$t('wechatContent.pickImageText'), 'warn');
                    return false;
                }
                if (this.material.materialItems) {
                    for (let i = 0; i < this.material.materialItems.length; i++) {
                        if (
                            this.material.materialItems[i].title === '' ||
                            this.material.materialItems[i].thumbMediaUrl === ''
                        ) {
                            this.$toast(this.$t('wechatContent.notACompleteAppMessage') + '，' + this.$t('wechatContent.notACompleteAppMessageTip'), 'warn');
                            return false;
                        }
                    }
                }

                return true;
            },
            // 选择图文素材
            chooseFinish(material) {
                material.content = '';
                // this.$refs.content.innerHTML='';
                material.exUrl = '';
                material.exTitle = '';
                material.exDescribe = '';
                this.openLib = false;
                if (material.title) {
                    material.name = material.title;
                }
                this.emit(material);
            },
            // 删除所选素材
            delMaterial() {
                this.openLib = false;
                this.emit({
                    articleId: '',
                    mediaId: '',
                    name: '',
                    updateDateString: '',
                    url: '',
                    thumbMediaUrl: ''
                });
            },
            emit(material) {
                this.$emit('change', material);
            }
        },
        components: { ImageTextLib }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .material-text-image{
        .choose-material,
        .create-material {
            @include box-sizing();
            display: inline-block;
            vertical-align: top;
            width: 270px - 2px;
            height: 210px - 2px;
            padding: 13px;
            margin: 21px 0 16px 27px;
            border: 1px dashed $border-color;
            text-align: center;
            cursor: pointer;

            &:hover {
                border-color: $theme;
            }

            span {
                display: inline-block;
                padding-top: 40px;
                line-height: 24px;
                margin-top: 68px;
            }
        }

        .create-material {
            margin-right: 27px;

            a {
                display: block;
                height: 100%;
                color: #000000;
            }

            span {
                background: url("../images/icon-new-material.png") center top no-repeat;
            }

            input {
                display: none;
            }
        }

        .choose-material {
            background: url("../../images/blury-lib-bg.png") center/280px auto no-repeat;
            background-clip: content-box;
            @include transition(all .3s linear);

            &:hover {
                background-size: 310px auto;
            }

            span {
                background: url("../images/icon-material-lib.png") center top no-repeat;
            }
        }

        .chosen-material {
            display: inline-block;
            overflow: hidden;
            width: 270px - 2px;
            height: 210px - 2px;
            margin: 18px 27px;
            border: 1px solid $border-color;

            .material-preview {
                position: relative;
                height: 160px;
                background-color: $content-bg;
                border-bottom: 1px solid $border-color;

                img {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    top: 0;
                    margin: auto;
                    width: auto;
                    height: auto;
                    max-width: 100%;
                    max-height: 100%;
                }

                .material-list {
                    .imageText-content {
                        flex-grow: 1;
                        position: relative;
                        width: 100%;
                        border: 1px solid $border-color;
                        margin: 0;

                        &:hover {
                            @include box-shadow(0 3px 8px rgba(#8b9daf, 0.16));
                        }

                        .shell {
                            height: 160px;
                        }

                        .scroll {
                            overflow-y: auto;
                        }

                        // 图文内容
                        .image-item {
                            position: relative;
                            height: 100%;
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
                                width: calc(100% + 8px);
                                text-align: center;
                                background: rgba(0, 0, 0, 0.5);
                                color: #fff;
                            }
                        }

                        .two {
                            height: 70%;

                            .image-sub {
                                height: 30%;
                                width: calc(100% - 16px);

                                .box {
                                    line-height: 30px;
                                }

                                .preview_mask {
                                    position: absolute;
                                    left: -8px;
                                    right: -8px;
                                    top: 100%;
                                    bottom: 0;
                                    display: none;
                                    height: calc(30% + 8px);
                                    width: calc(100% + 16px);
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
                                // width: calc(100% - 16px);
                                .box {
                                    line-height: 40px;
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
                            margin: 8px;

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
                            right: 0;
                            width: 100px;
                            height: 20px;
                            line-height: 20px;
                            text-align: center;
                            background: #0cc2a9;
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
                    }
                }
            }

            .material-info {
                padding: 9px 1em 0;

                .icon {
                    width: 30px;
                    height: 30px;
                    line-height: 30px;
                    text-align: center;
                    background-color: white;
                    font-size: 16px;
                    cursor: pointer;

                    &:hover {
                        color: $red;
                    }
                }

                p {
                    @include ellipsis();
                    line-height: 15px;
                    color: $color-light-content;
                }
            }
        }
    }
    .isDisabled{
        @include noPermission();
    }
</style>
