<template>
    <backdrop class="image-text-preview">
        <div class="center">
            <div class="btnList">
                <ul>
                    <li :class="activeType === 1 ? 'selected':''" @click="active(1)">{{'wechatContent.appMessage' | t}}</li>
                    <!--<li :class="activeType === 2 ? 'selected':''" @click="active(2)">消息正文</li>-->
                    <li :class="activeType === 3 ? 'selected':''" @click="active(3)">{{'wechatContent.shareFriend' | t}}</li>
                    <li :class="activeType === 4 ? 'selected':''" @click="active(4)">{{'wechatContent.sendToFriend' | t}}</li>
                </ul>
            </div>
            <div class="send-preview" @click="sendPreview" v-if="choosedMaterial&&choosedMaterial.url">{{'wechatContent.sendMobile' | t}}</div>
            <div class="close-preview" @click="cancelPreview">{{'common.close' | t}}</div>
            <div class="phone">
                <div class="phone-hd">{{'wechatContent.youmi' | t}}</div>
                <div class="phone-content">
                    <!--图文消息-->
                    <div class="imgText" v-show="activeType === 1">
                        <component class="first"
                                   :is="materials[0].url ? 'a' : 'div'"
                                   :href="materials[0].url"
                                   :title="materials[0].url ? $t('wechatContent.newPreview') : ''"
                                   target="_blank">
                            <div class="card_cover_appmsg_inner"
                                 :style="{backgroundImage:'url(' + materials[0].thumbMediaUrl + ')'}">
                                <!--<img class="card_cover_thumb" src="">-->
                            </div>
                            <strong class="card_cover_title" :title="materials[0].title">{{materials[0].title}}</strong>
                        </component>
                        <component class="card_appmsg_item"
                                   v-for="material in materials.slice(1)"
                                   :key="material.id"
                                   :is="(material.url || (material.material && material.material.url)) ? 'a' : 'div'"
                                   :href="material.url || (material.material ? material.material.url : '')" target="_blank">
                            <img class="card_appmsg_thumb" :src="material.thumbMediaUrl">
                            <div class="card_appmsg_content" :title="material.title">{{material.title}}</div>
                        </component>
                    </div>
                    <!--分享到朋友圈-->
                    <div class="share" v-show="activeType === 3">
                        <div class="wx_phone_preview_moments" v-for="(material,index) in materials">
                            <img class="moments_user_avatar" src="./images/qdum.jpg" alt="">
                            <div class="moments_content_wrp">
                                <p class="moments_nickname">{{'wechatContent.wechatGroup' | t}}</p>
                                <component class="moments_content"
                                           :is="(material.url || (material.material && material.material.url)) ? 'a' : 'div'"
                                           :href="material.url || (material.material ? material.material.url : '')" target="_blank">
                                    <img class="moments_appmsg_thumb" :src="material.thumbMediaUrl">
                                    <span class="moments_appmsg_title" :title="material.title">{{material.title}}</span>
                                </component>
                            </div>
                        </div>
                    </div>
                    <!--发送给朋友-->
                    <div class="send" v-show="activeType === 4">
                        <div class="wx_phone_preview_chat" v-for="material in materials">
                            <img class="chat_user_avatar" src="./images/qdum.jpg">
                            <component class="chat_content"
                                       :is="(material.url || (material.material && material.material.url)) ? 'a' : 'div'"
                                       :href="material.url || (material.material ? material.material.url : '')"
                                       target="_blank">
                                <div class="chat_appmsg_msg jsPhoneViewCard">
                                    <div class="chat_appmsg_title" :title="material.title">{{material.title}}</div>
                                    <div class="chat_appmsg_content">
                                        <img class="chat_appmsg_thumb" :src="material.thumbMediaUrl">
                                        <div class="chat_appmsg_desc" :title="material.digest">{{material.digest}}</div>
                                    </div>
                                    <span class="chat_arrow_wrp">
                                        <i class="chat_arrow arrow_out"></i>
                                        <i class="chat_arrow arrow_in"></i>
                                    </span>
                                </div>
                            </component>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <modal :title="$t('wechatContent.sendPreview')" v-if="isSendPreview" @close="cancelSendPreview" >
            <div class="send-preview-modal">
                <img :src='imageUrl' class="image-preview"/>
                <p>{{'wechatContent.scan' | t}}</p>
                <p class="preview-item">{{'wechatContent.previewQRcode' | t}}</p>
            </div>
        </modal>
    </backdrop>
</template>
<script type="text/babel">
    import {MATERIAL_STORE} from '@/store/vuex/modules/imgTextStore';
    import { WechatApiV1 } from '@/api';
    import { mapState } from 'vuex';

    export default {
        props: {
            choosedMaterial: Object
        },
        data() {
            return {
                activeType: 1,
                isSendPreview: false,
                imageUrl: '',
            };
        },
        computed: {
            ...mapState({
                materials: state => state[MATERIAL_STORE].materials
            }),
        },
        methods: {
            active(type) {
                this.activeType = type;
            },
            cancelPreview() {
                this.$emit('close');
            },
            sendPreview() {
                
                WechatApiV1
                    .previewPicture(this.choosedMaterial.url)
                    .then((res) => {
                        this.imageUrl = res.body.data.url;
                        this.isSendPreview = true;
                    })
                    .catch(() => {
                        this.$toast(this.$t('wechatContent.previewFailed'),'warn');
                        this.$loaded();
                    });
            },
            cancelSendPreview() {
                this.isSendPreview = false;
                this.imageUrl = '';
            }
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';

    .image-text-preview {
        .center {
            width: 330px;
            height: 670px;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;

            .btnList {
                position: absolute;
                left: -140px;
                top: 80px;
                color: #000;

                ul:nth-of-type(1) {
                    @include border-radius(5px);
                    text-align: center;
                    overflow: hidden;
                    font-size: 14px;

                    li {
                        @include box-sizing();
                        background-color: #f0eff4;
                        white-space: nowrap;
                        cursor: pointer;
                        min-width: 120px;
                        line-height: 40px;

                        &.selected {
                            background-color: $dark-green;
                            color: #fff;
                            border-bottom-color: $dark-green;
                        }
                    }

                    li + li {
                        border-top: 1px solid $border-color;
                    }
                }
            }

            .close-preview,
            .send-preview {
                @include box-sizing();
                font-size: 14px;
                text-align: center;
                position: absolute;
                bottom: 100px;
                left: -140px;
                background-color: #fff;
                white-space: nowrap;
                cursor: pointer;
                min-width: 120px;
                line-height: 40px;
                @include border-radius(5px);

                &:hover {
                    background: #f0eff4;
                }

                &.selected {
                    background-color: #47b54a;
                    color: #fff;
                    border-bottom-color: #5bab5e;
                }
            }
            .send-preview {
                bottom: 150px;
                &:hover {
                    background-color: $dark-green;
                    color: #fff;
                }
            }


            .phone {
                position: absolute;
                left: 0;
                top: 0;
                width: 330px;
                height: 670px;
                background-image: url("images/wx_phone.png");

                .phone-hd {
                    position: absolute;
                    left: 18px;
                    top: 85px;
                    text-align: center;
                    width: 285px;
                    height: 38px;
                    line-height: 38px;
                    color: #fff;
                    background: #323232;
                }

                .phone-content {
                    @include box-sizing();
                    position: absolute;
                    top: 123px;
                    left: 18px;
                    width: 285px;
                    height: 470px;
                    background: #f2f2f2;
                    overflow: hidden;
                }

                .imgText {
                    padding: 15px;

                    .first {
                        display: block;
                        background: #fff;
                        position: relative;

                        .card_cover_appmsg_inner {
                            height: 140px;
                            overflow: hidden;
                            background-repeat: no-repeat;
                            background-position: center center;
                            background-size: cover;
                        }

                        .card_cover_title {
                            display: block;
                            margin-top: -$input-field-height;
                            padding: 0 6px;
                            font-size: 14px;
                            line-height: $input-field-height;
                            color: #fff;
                            background: rgba(0, 0, 0, 0.5);
                            @include ellipsis();
                        }
                    }

                    .card_appmsg_item {
                        display: block;
                        background: #fff;
                        overflow: hidden;
                        padding: 6px;
                        border-top: 1px solid #e7e7eb;

                        .card_appmsg_thumb {
                            float: right;
                            margin-left: 10px;
                            width: 45px;
                            height: 45px;
                        }
                    }
                }

                .share {
                    position: relative;
                    overflow: auto;
                    background-color: #fff;
                    height: 470px;

                    .wx_phone_preview_moments {
                        overflow: hidden;
                        padding: 15px;

                        .moments_user_avatar {
                            width: 28px;
                            height: 28px;
                            float: left;
                            margin-right: 12px;
                        }

                        .moments_content_wrp {
                            overflow: hidden;

                            .moments_nickname {
                                font-size: 12px;
                                padding-bottom: 5px;
                            }

                            .moments_content {
                                display: block;
                                overflow: hidden;
                                background-color: #f0eff4;
                                padding: 8px 10px;

                                .moments_appmsg_thumb {
                                    float: left;
                                    width: 30px;
                                    height: 30px;
                                    margin-right: 5px;
                                }

                                .moments_appmsg_title {
                                    display: block;
                                    overflow: hidden;
                                    line-height: 30px;
                                    @include ellipsis;
                                }
                            }
                        }
                    }
                }

                .send {
                    position: relative;
                    overflow: auto;
                    background-color: #f2f2f2;
                    height: 470px;

                    .wx_phone_preview_chat {
                        overflow: hidden;
                        padding: 15px;

                        .chat_user_avatar {
                            float: left;
                            width: 28px;
                            height: 28px;
                        }

                        .chat_content {
                            display: block;
                            overflow: hidden;
                            padding-left: 12px;
                            padding-right: 30px;

                            .chat_appmsg_msg {
                                position: relative;
                                background-color: #fff;
                                padding: 8px 10px;
                                border: 1px solid #e7e7eb;
                                @include border-radius(5px);

                                .chat_appmsg_title {
                                    padding-bottom: 5px;
                                    width: auto;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    white-space: nowrap;
                                    word-wrap: normal;
                                }

                                .chat_appmsg_content {
                                    overflow: hidden;

                                    .chat_appmsg_thumb {
                                        float: left;
                                        width: 40px;
                                        height: 40px;
                                        margin-right: 5px;
                                    }

                                    .chat_appmsg_desc {
                                        font-size: 12px;
                                        color: #8d8d8d;
                                        margin-top: 3px;
                                        max-height: 3.2em;
                                        overflow: hidden;
                                    }
                                }

                                .chat_arrow_wrp {
                                    position: absolute;
                                    left: -6px;
                                    top: 6px;

                                    .chat_arrow {
                                        position: absolute;
                                        display: inline-block;
                                        width: 0;
                                        height: 0;
                                        border-width: 6px;
                                        border-style: dashed;
                                        border-color: transparent;
                                        border-left-width: 0;
                                        border-right-color: #e7e7eb;
                                        border-right-style: solid;
                                    }

                                    .arrow_in {
                                        left: 1px;
                                        border-right-color: #fff;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
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
    }

</style>
