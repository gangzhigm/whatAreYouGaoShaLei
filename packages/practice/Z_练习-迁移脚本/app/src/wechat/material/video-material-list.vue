<template>
    <div class="video-material-list">
        <div class="content-view padding margin white-bg">
            <div class="material-title">
                {{'wechatContent.video' | t}}（{{'common.total' | t}} <span
                    class="theme-text">{{material.totalRow}}</span>）
                <!-- <router-link :to="{name: 'videoForm'}" class="pull-right btn btn-md btn-theme">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'wechatContent.addVideo' | t}}
                </router-link> -->
                <!-- 2.5.7版本，发现微信只支持公众号后台上传的视频能通过审核，因此暂时隐藏上传功能 -->
                <!-- <button id="wechat_material_add_video" :disabled="$has('wechat_material_add_video')" @click="jumpToVideoFrom" class="pull-right btn btn-md btn-theme">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'wechatContent.addVideo' | t}}
                </button> -->
            </div>
            <div class="table">
                <table>
                    <thead>
                        <tr>
                            <th width="150">{{'wechatContent.video' | t}}</th>
                            <th>{{'wechatContent.fileName' | t}}</th>
                            <!-- <th>{{'wechatContent.usage' | t}}</th> -->
                            <th>{{'wechatContent.approvalStates' | t}}</th>
                            <th>{{'wechatContent.createTime' | t}}</th>
                            <th width="100">{{'wechatContent.operation' | t}}</th>
                        </tr>
                    </thead>
                </table>
                <div class="infinite-list" v-load="scrollGetMaterial">
                    <table>
                        <tbody>
                            <tr v-for="material in material.materialList" :key="material.id">
                                <!-- 视频本体 -->
                                <td width="150">
                                    <div class="video-name">
                                        <div class="video">
                                            <!-- TODO：微信官方获取视频的接口，通过审核的视频是返回视频封面url(cover_url)的,后台目前没有存这个数据，后期优化需要加上 -->
                                            <div class="video-play" @click="playVideo(material)">
                                                <!-- <video preload="metadata" :src="material.url"></video> -->
                                                <!-- 通过微信审核的视频，返回地址为https://mp.weixin. -->
                                                <img src="./images/videoPlay.png" alt="">
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td :title="material.name">{{ material.name }}</td>
                                <!-- 为了兼容后台历史代码，用use字段表示是否通过微信的审核，保持原有的state表示是否（true表示未使用过，false表示使用过）被其他模块使用过 -->
                                <!-- <td>{{ material.state ? $t('wechatContent.unused') : $t('wechatContent.used') }}</td> -->
                                <td>{{ material.use ?  $t('wechatContent.approved') : $t('wechatContent.unapproved')}}</td>
                                <td>{{ material.updateDateString }}</td>
                                <td width="100">
                                    <button class="btn action-icon icon icon-delete active"
                                        :disabled="$has('wechat_material_delete_video')" @click="deleteVideo(material.id)"
                                        v-title="$t('common.del')">
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="loading > 0">
                                <td colspan="5"><inline-loading :offset="loading === 2 ? 'sm' : 'lg'" /></td>
                            </tr>
                            <tr v-else-if="!material.materialList.length">
                                <td colspan="5"><list-empty/></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- 预览非微信视频 -->
            <modal size="lg" :title="$t('wechatContent.previewVideo')" @close="closeVideo" v-if="videoUrl">
                <video class="preview-video" ref="video" :src="videoUrl" preload="metadata" controls="controls"></video>
            </modal>
        </div>
        <back-top></back-top>
    </div>
</template>
<script type="text/babel">

    import { WechatApiV1 } from '@/api';
    import {trackEvent} from '../../monitor';

    export default {
        mounted() {
            this.loading = 1;
            WechatApiV1
                .getMaterials('', 1, 3, null)
                .then((res) => {
                    this.material.materialList = res.body.data.fieldList;
                    this.material.totalRow = res.body.data.totalRow;
                    this.material.totalPage = res.body.data.totalPage;
                    this.loading = 0;
                })
                .catch(() => {
                    this.loading = 0;
                });
        },
        data() {
            return {
                videoUrl: '',
                material: {
                    materialList: [],
                    page: 1,
                    totalRow: '',
                    totalPage: '',
                },
                loading: 0 // 加载状态 0加载完成，1初始化加载，2加载更多
            };
        },
        methods: {
            deleteVideo(mediaId) {
                this
                    .$confirm(
                        this.$t('wechatContent.deleteVideoConfirm'),
                        this.$t('wechatContent.deleteVideoTip')
                    )
                    .then((sure) => {
                        if (sure) {
                            WechatApiV1
                                .delMaterial(mediaId)
                                .then((res) => {
                                    this.$toast(res.body.message, 'success');
                                    trackEvent('微信管理-删除视频素材');
                                    WechatApiV1.getMaterials('', 1, 3, null)
                                        .then((res) => {
                                            this.material.materialList = res.body.data.fieldList;
                                            this.material.totalRow = res.body.data.totalRow;
                                            this.material.totalPage = res.body.data.totalPage;
                                            //  页码初始化
                                            this.material.page = 1;
                                        });
                                });
                        }
                    });
            },
            playVideo(material) {
                // 视频通过审核后返回的是一个mp.weixin.qq.com地址，新页面打开预览
                // 原视频预览逻辑，当前页弹窗播放，暂时废弃 this.videoUrl = material.url;
                if (material.use && material.url.indexOf('mp.weixin.qq.com') !== -1) {
                    window.open(material.url, '_blank');
                } else {
                    this.$toast(this.$t('wechatContent.unPlayable'), 'warn');
                }
            },
            closeVideo() {
                this.$refs.video.pause();
                this.videoUrl = '';
            },
            scrollGetMaterial() {
                if (this.loading) return;
                this.material.page++;
                if (this.material.page <= this.material.totalPage) {
                    this.loading = 2;
                    WechatApiV1.getMaterials('', this.material.page, 3, null)
                        .then((res) => {
                            let { fieldList } = res.body.data;
                            //将数据放入 materialList
                            this.material.materialList = this.material.materialList.concat(fieldList);
                            this.$nextTick(function () {
                                this.loading = 0;
                            });
                        })
                        .catch(() => {
                            this.loading = 0;
                            this.material.page--;
                        });
                }
            },
            jumpToVideoFrom() {
                this.$router.push({name:'videoForm'});
            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .video-material-list {
        @import "./material";
        .infinite-list {
            overflow-y: auto;
            max-height: calc(100vh - 335px);
        }

        .table table tbody {
            td:not(.action-td) {
                padding: 10px 10px;
            }
        }
        
        div.video-name {
            width: 15%;
            font-size: 0;
            div.video {
                width: 150px;
                height: 8.76vh;
                position: relative;
                video {
                    @include box-sizing();
                    width: 150px;
                    height: 8.76vh;
                    border: 1px solid $border-color;
                }
                .video-play {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 150px;
                    height: 8.76vh;
                    background: rgba(0, 0, 0, .5);
                    img {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        margin: auto;
                        width: 48px;
                        height: 48px;
                    }
                    &:hover {
                        cursor: pointer;
                    }
                }
            }
            div.name {
                @include ellipsis;
                width: 15%;
            }
        }

        .preview-video {
            display: block;
            min-width: 250px;
            min-height: 250px;
            max-height: 80vh;
            max-width: 80vw;
            margin: auto;
        }

        .name {
            @include ellipsis;
            width: 15%;
        }
    }
</style>
