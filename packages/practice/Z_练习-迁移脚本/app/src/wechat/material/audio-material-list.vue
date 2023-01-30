<template>
    <div class="audio-material-list">
        <div class="content-view padding margin white-bg">
            <div class="material-title">
                {{'wechatContent.audio' | t}}（{{'common.total' | t}} <span
                    class="theme-text">{{material.totalRow}}</span>）
                <label class="upload-btn pull-right btn btn-md btn-theme" :disabled="$has('wechat_material_upload_voice')">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-upload"></use>
                    </svg>
                    {{'wechatContent.localUpload' | t}}
                    <input type="file" id="wechat_material_upload_voice" ref="inputFile" accept="audio/mp3" @change="uploadFile" :disabled="$has('wechat_material_upload_voice')">
                </label>
                <span class="pull-right light-content-text">{{'wechatContent.audioSizeLimit' | t}}</span>
            </div>
            <transition-group tag="div" class="materials" name="cards" v-load="scrollGetMaterial">
                <div class="material" v-for="material in material.materialList" :key="material.id">
                    <div class="content" :class="{playable: material.url}"
                         :title="material.url ? $t('wechatContent.clickToPlayAudio') : $t('wechatContent.audioUnPlayable')"
                         @click="material.url && toggle(material.id)">
                        <audio v-if="material.url" :ref="material.id" controls :src="material.url" @ended="endedAudio"></audio>
                        <img v-show="playId === material.id" src="../images/icon_audio.gif">
                        <img v-show="playId !== material.id" src="../images/audio.png">
                    </div>
                    <p class="title" :title="material.name">{{material.name}}</p>
                    <p class="date">{{material.updateDateString}}</p>
                    <!--<span class="length">时长</span>-->
                    <div class="material-edit">
                        <button class="btn icon icon-delete" :disabled="$has('wechat_material_delete_voice')" @click="delMaterial(material.id)" v-title="$t('common.del')"></button>
                    </div>
                </div>
            </transition-group>
            <div class="load-hint" v-if="material.page >= material.totalPage && !$store.state.loading">
                {{'wechatContent.noMoreMaterials' | t}}
            </div>
        </div>
        <backdrop v-if="uploading">
            <inline-loading></inline-loading>
            <p style="text-align: center;color: white">{{'wechatContent.materialUploading' | t}}</p>
        </backdrop>
        <back-top></back-top>
    </div>
</template>
<script type="text/babel">
    import Backdrop from './../../common/components/modal/backdrop.vue';
    import { WechatApiV1 } from '@/api';
    import {trackEvent} from '../../monitor';

    export default {
        components: {
            backdrop: Backdrop
        },
        mounted() {
            this.$loading();
            WechatApiV1.getMaterials(name, 1, 2, null)
                .then((res) => {
                    let {fieldList} = res.body.data;
                    this.material.materialList = fieldList;
                    this.material.totalRow = res.body.data.totalRow;
                    this.material.totalPage = res.body.data.totalPage;
                    this.$nextTick(() => {
                        this.$loaded();
                    });
                    this.accessToken = res.body.data.accessToken;
                })
                .catch(() => {
                    this.$loaded();
                });
        },
        data() {
            return {
                playId: '',
                material: {
                    materialList: [],
                    page: 1,
                    totalRow: '',
                    totalPage: ''
                },
                uploading: false,
                accessToken: '',
            };
        },
        methods: {
            // 音频播放
            materials(e) {
                WechatApiV1.getVoice(this.accessToken, e);
            },
            // uploadfile
            uploadFile() {
                // const audioReg = /\.(mp3)$/i;
                const audioReg = /\.(mp3|wma|wav|amr)$/i;
                if (audioReg.test(this.$refs.inputFile.files[0].name) === false) {
                    this.$toast(this.$t('wechatContent.audioFormatErr'));
                    return false;
                }
                if (this.$refs.inputFile.files[0].size > 2 * 1024 * 1024) {
                    this.$toast(this.$t('wechatContent.audioSizeErr'));
                    return false;
                }
                this.audioFile = this.$refs.inputFile.files[0];
                this.$refs.inputFile.value = '';
                this.uploading = true;
                WechatApiV1
                    .createAudio(this.audioFile, 2, this.audioFile.name)
                    .then((res) => {
                        this.uploading = false;
                        this.$toast(res.body.message, 'success');
                        this.audioFile = '';
                        // this.isUpload = true;
                        trackEvent('微信管理-上传语音素材');
                        WechatApiV1.getMaterials(name, 1, 2, null)
                            .then((res) => {
                                let {fieldList} = res.body.data;
                                this.material.materialList = fieldList;
                                this.material.totalPage = res.body.data.totalPage;
                                this.material.totalRow = res.body.data.totalRow;
                                // 页码初始化
                                this.material.page = 1;
                            });
                    })
                    .catch(() => {
                        this.uploading = false;
                    });
            },
            // 删除单个素材
            delMaterial(mediaId) {
                // 发送delete请求
                this.$confirm(this.$t('common.del'), this.$t('wechatContent.audioDeleteConfirm'))
                    .then((sure) => {
                        if (sure)
                            WechatApiV1
                                .delMaterial(mediaId)
                                .then((res) => {
                                    this.$toast(res.body.message, 'success');
                                    trackEvent('微信管理-单个删除语音素材');
                                    WechatApiV1.getMaterials(name, 1, 2, null)
                                        .then((res) => {
                                            let {fieldList} = res.body.data;
                                            this.material.materialList = fieldList;
                                            this.material.totalPage = res.body.data.totalPage;
                                            this.material.totalRow = res.body.data.totalRow;
                                            // 页码初始化
                                            this.material.page = 1;
                                        })
                                        .catch((err) => {
                                            this.$toast(err.body.message);
                                        });
                                });
                    });
            },
            toggle(id) {
                const lastAudio = this.playId && this.$refs[this.playId][0];
                const currentAudio = this.$refs[id][0];
                if (id === this.playId) {
                    currentAudio.paused ? currentAudio.play() : currentAudio.pause();
                } else {
                    if (lastAudio) {
                        lastAudio.pause();
                        lastAudio.currentTime = 0;
                    }
                    currentAudio.play();
                    this.playId = id;
                }
            },
            endedAudio() {
                this.playId = '';
            },

            // 滚动 事件
            scrollGetMaterial() {
                if (this.$store.state.loading) return;
                this.material.page++;
                if (this.material.page <= this.material.totalPage) {
                    this.$loading();
                    WechatApiV1.getMaterials('', this.material.page, 2, null)
                        .then((res) => {
                            let {fieldList} = res.body.data;
                            //将数据放入 materialList
                            this.material.materialList = this.material.materialList.concat(fieldList);
                            this.material.totalPage = res.body.data.totalPage;
                            this.material.totalRow = res.body.data.totalRow;
                            this.$nextTick(function () {
                                this.$loaded();
                            });
                        })
                        .catch(() => {
                            this.$loaded();
                            this.material.page--;
                        });
                }
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .audio-material-list {
        @import 'material';

        .materials {
            font-size: 0;
            max-width: 1250px;
            margin: auto;
            max-height: 62vh;
            overflow: scroll;
        }

        .material {
            position: relative;
            display: inline-block;
            font-size: 12px;
            margin: 16px 8px 0;
            width: 22%;
            @include box-sizing();
            border: 1px solid $border-color;

            &:hover {
                @include box-shadow(0 3px 8px rgba(#8b9daf, 0.16));
            }

            .content {
                position: relative;
                padding: 10px;
                font-size: 0;
                background-color: rgba(black, .1);

                &.playable {
                    cursor: pointer;
                    @include transition();

                    &:hover {
                        background-color: rgba(black, .16);
                    }
                }

                audio {
                    display: none;
                }

                img {
                    display: block;
                    height: 40px;
                    width: 40px;
                    margin: 5.1vh auto;
                }
            }

            .title {
                padding: 4px 10px 0;
                font-size: 16px;
                @include ellipsis();
            }

            .date {
                padding: 4px 10px;
                font-size: 12px;
            }

            .length {
                display: inline-block;
                vertical-align: top;
                font-size: 12px;
                padding: 4px 10px;
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
</style>
