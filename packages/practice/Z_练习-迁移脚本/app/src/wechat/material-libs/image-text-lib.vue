<template>
    <modal size="lg" @close="$emit('cancel')" :title="$t('wechatContent.pickImageText')" neat>
        <div class="material-lib image-text-lib">
            <div class="material-head">
                <span class="pull-left light-content-text" v-if="noSubMaterials">{{'wechatContent.oneItemOnly' | t}}</span>
                <div class="search-box">
                    <input type="text" v-model.trim="keyword"
                           :placeholder="$t('wechatContent.title') + '/' + $t('wechatContent.author') + '/' + $t('wechatContent.abstract')"
                           @keydown.enter="search"
                           maxlength="255">
                    <svg aria-hidden="true" @click="search">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </div>
            </div>
            <div class="material-list" v-load="scrollGetMaterial">
                <div class="material" v-for="(material,index) in materials" :key="index">
                    <div class="material-preview" @click="id = [material.id]"
                         :class="{selected: id[0] === material.id}">
                        <checkbox class="top" :source="material.id" v-model="id"></checkbox>
                        <img :src="material.thumbMediaUrl" :alt="material.title">
                    </div>
                    <div class="material-info">
                        <a class="material-name" target="_blank" :href="material.url">{{material.title}}</a>
                        <p class="material-name">{{material.updateDateString}}</p>
                    </div>
                </div>
                <p class="loading-tip" v-if="pageNumber > totalPage">{{'wechatContent.noMoreMaterials' | t}}</p>
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
        name: 'image-text-lib',
        props: {
            noSubMaterials: { // 限制多图文素材(客服消息)
                type: Boolean,
                default: false
            },
            mpnewsType: {   //图文素材列表返回草稿还是已发布
                type: Number,
                default: 2
            }
        },
        data() {
            return {
                keyword: '',
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
                    .getMaterials(this.keyword, this.pageNumber, 5, null, undefined, this.noSubMaterials, '', '', this.mpnewsType)
                    .then(({body: {data: {fieldList: materials, totalPage, totalRow}}}) => {
                        let materialList = this.mpnewsType === 1 ? materials.filter(item => !item.hasOwnProperty('publishStatus')) : materials;
                        materialList = materialList.filter(material => material.hasOwnProperty('mediaId') || material.hasOwnProperty('articleId'));
                        if (reset) {
                            this.materials = materialList;
                            this.totalPage = totalPage;
                        } else {
                            this.materials = this.materials.concat(materialList);
                            this.totalPage = totalPage;
                        }
                        this.$nextTick(() => {
                            this.loaded = true;
                            if (this.materials.length < 10 && this.pageNumber < totalPage) {
                                this.pageNumber++;
                                this.fetchMaterials();
                            }
                        });
                    });
            },
            search() {
                this.fetchMaterials(true);
            },
            sure() {
                if (this.id.length !== 0) {
                    let material = this.materials.find(material => this.id.includes(material.id));
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

    .image-text-lib {
        .material {
            $width: 302px;
            $height: 199px;
            display: inline-block;
            vertical-align: top;
            width: $width;
            margin: 0 8px 8px;

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

                img {
                    display: block;
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

                .top {
                    z-index: 1;
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
