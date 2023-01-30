<template>
    <modal size="lg" @close="$emit('cancel')" :title="$t('wechatContent.pickAudio')" neat>
        <div class="audio-lib material-lib">
            <div class="material-list" v-load="scrollGetMaterial">
                <div class="material" v-for="(material,index) in materials" :key="material.mediaId"
                     @click="id = [material.mediaId]"
                     :class="{selected: id[0] === material.mediaId}">
                    <checkbox :source="material.mediaId" v-model="id" single></checkbox>
                    <div class="audio-icon">
                        <img src="../images/audio.png" :alt="material.name"/>
                    </div>
                    <div class="material-info">
                        <a class="material-name" @click.stop target="_blank" :href="material.url">{{material.name}}</a>
                        <p class="material-name">{{material.updateDateString}}</p>
                    </div>
                </div>
                <p class="loading-ip" v-if="pageNumber > totalPage">{{'wechatContent.noMoreMaterials' | t}}</p>
                <p class="loading-ip" v-else-if="totalPage === 1"/>
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
        name: 'audio-lib',
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
                    .getMaterials('', this.pageNumber, 2, undefined, undefined, undefined, this.officialId)
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
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";
    @import "./material-lib";

    .audio-lib {
        padding: 16px 0 16px 16px;

        .material {
            $width: 302px;
            $height: 96px;
            display: inline-block;
            position: relative;
            vertical-align: top;
            margin: 0 16px 16px 0;
            width: $width - 2px;
            border: 1px solid $border-color;
            cursor: pointer;

            &:nth-of-type(3n) {
                margin-right: 0;
            }

            &:hover,
            &.selected {
                border-color: $theme;
            }

            .audio-icon {
                float: left;
                width: $height - 4px;
                height: $height - 4px;
                margin: 2px;
                background-color: $content-bg;

                img {
                    display: block;
                    margin: auto;
                    width: auto;
                    height: auto;
                    max-width: 100%;
                    -webkit-writing-mode: vertical-lr;
                    -ms-writing-mode: tb;
                    writing-mode: vertical-lr;
                    max-height: 100%;
                }
            }

            .checkbox {
                position: absolute;
                line-height: normal;
                left: 11px;
                top: 11px;
            }

            .material-info {
                height: $height - 28px * 2;
                padding: 28px 1em;
                @include ellipsis();
                line-height: 20px;
                border-left: 1px solid $border-color;

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
