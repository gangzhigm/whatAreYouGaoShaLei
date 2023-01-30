<template>
    <modal size="lg" @close="$emit('cancel')" :title="$t('wechatContent.pickVideo')" neat>
        <div class="material-lib video-lib">
            <div class="material-list" v-load="scrollGetMaterial">
                <div class="material" v-for="(material) in materials" :key="material.mediaId">
                    <div class="material-preview" @click="id = [material.mediaId]"
                        :class="{selected: id[0] === material.mediaId}">
                        <checkbox :source="material.mediaId" v-model="id" single></checkbox>
                        <!-- TODO：微信官方获取视频的接口，通过审核的视频是返回视频封面url(cover_url)的,后台目前没有存这个数据，后期优化需要加上 -->
                        <img src="../material/images/videoPlay.png" alt="">
                        <!-- <video :src="material.url" :alt="material.name"></video> -->
                    </div>
                    <div class="material-info">
                        <a class="material-name" target="_blank" :href="material.url">{{material.title}}</a>
                        <p class="material-name">{{material.updateDateString}}</p>
                    </div>
                </div>
                <p class="loading-tip" v-if="pageNumber > totalPage || totalPage < 2">{{'wechatContent.noMoreMaterials' | t}}</p>
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
        name: 'video-lib',
        props: {
            // 目标公众号id，非必填
            officialId: {
                type: Number
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
        created() {
            // materialModel
            //     .syncVideo()
            //     .then((res) => {
            //         this.fetchMaterials(true);
            //     });
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
                    .getMaterials('', this.pageNumber, 3, undefined, undefined, undefined, this.officialId, 1)
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
                    let material = this.materials.find(material =>
                        this.id.includes(material.mediaId)
                    );
                    if (material) this.$emit('choose', material);
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
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";
    @import "./material-lib";

    .video-lib {
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

                img,
                video {
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

                .checkbox {
                    position: absolute;
                    line-height: normal;
                    left: 11px;
                    top: 11px;
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
