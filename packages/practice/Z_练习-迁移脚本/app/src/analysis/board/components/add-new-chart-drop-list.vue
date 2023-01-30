<template>
    <div class="add-new-chart-drop-list" :class="{wider: type}">
        <i class="tail"></i>
        <transition name="slide-left">
            <div class="methods" v-if="type === ''">
                <button type="button" class="method-btn" @click="type = 'pick'">
                    {{'board.addFromBookmark' | t}}
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-right"></use>
                    </svg>
                </button>
                <button type="button" @click="type = 'create'" class="method-btn">
                    {{'board.addComponent' | t}}
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-right"></use>
                    </svg>
                </button>
            </div>
        </transition>
        <!-- 从书签添加 -->
        <transition name="slide-right">
            <div class="method-sub-list" v-if="type === 'pick'">
                <div class="method-title">
                    <svg aria-hidden="true" @click="type = ''">
                        <use xlink:href="#icon-right"></use>
                    </svg>
                    {{'board.selectBookmark' | t}}
                </div>
                <label class="search-field">
                    <input type="text" :placeholder="$t('board.searchKeywords')" autofocus v-model.trim="keyword">
                    <svg class="search-icon" aria-hidden="true">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </label>
                <ul class="bookmarks" :class="{keyword}" :data-content="$t('board.noRelateBookMarks')" :data-no="$t('board.noBookMarks')">
                    <template v-for="(bookmarks, name) in bookmarkGroups">
                        <li class="title">{{name}}</li>
                        <li v-for="bookmark in bookmarks" :title="bookmark.name"
                            @click="!bookmark.disabled && $emit('pick', bookmark.id)" v-text="bookmark.name"></li>
                    </template>
                </ul>
            </div>
        </transition>
        <!-- 新建组件：去分析页面新建书签 -->
        <transition name="slide-right">
            <div class="method-sub-list" v-if="type === 'create'">
                <div class="method-title">
                    <svg aria-hidden="true" @click="type = ''">
                        <use xlink:href="#icon-right"></use>
                    </svg>
                    {{'board.selectType' | t}}
                </div>
                <router-link v-for="route in ANALYSIS_ROUTES" :to="route" :key="route.name">
                    <svg aria-hidden="true">
                        <use v-bind:xlink:href="'#' + route.icon"></use>
                    </svg>
                    {{route.text}}
                </router-link>
            </div>
        </transition>
    </div>
</template>
<script>
    // 看板详情中添加一个新的图表
    import filterArrayByName from '@/common/utils/filterArrayByName';
    import {ANALYSIS_STORE_NAME} from '@/store/vuex/modules/analysisStore';
    import { mapState } from 'vuex';

    export default {
        name: 'add-new-chart-drop-list',
        props: {
            disabledBookmarkIds: {
                type: Array,
                required: true
            }
        },
        data() {
            return {
                ANALYSIS_ROUTES: [
                    {name: 'attribute', text: this.$t('board.attrAnalysis'), icon: 'icon-user-attr'},
                    {name: 'event', text: this.$t('board.eventAnalysis'), icon: 'icon-bar'},
                    {name: 'visualization', text: this.$t('board.visualization'), icon: 'icon-datasource'}
                ],
                type: '',
                keyword: '',
            };
        },
        computed: {
            ...mapState({
                storeBookmarks: state => state[ANALYSIS_STORE_NAME].bookmarks
            }),
            bookmarkGroups() {
                // const groups = {
                //     '事件分析': [],
                //     '属性分析': [],
                //     '可视化报告': [],
                // };
                const groups = {};
                groups[this.$t('board.eventAnalysis')] = [];
                groups[this.$t('board.attrAnalysis')] = [];
                groups[this.$t('board.visualization')] = [];
                const disabledIdsReg = new RegExp(`^[${this.disabledBookmarkIds.join('|')}]$`, 'g');
                filterArrayByName(this.storeBookmarks, this.keyword)
                    .forEach(bookmark => {
                        const disabled = disabledIdsReg.test(bookmark.id);
                        switch (bookmark.type) { // 0: 属性分析; 1: 事件分析;
                            case 0:
                                groups[this.$t('board.attrAnalysis')] || (groups[this.$t('board.attrAnalysis')] = []);
                                groups[this.$t('board.attrAnalysis')].push({
                                    disabled,
                                    name: bookmark.name,
                                    id: bookmark.id
                                });
                                break;
                            case 1:
                                groups[this.$t('board.eventAnalysis')] || (groups[this.$t('board.eventAnalysis')] = []);
                                groups[this.$t('board.eventAnalysis')].push({
                                    disabled,
                                    name: bookmark.name,
                                    id: bookmark.id
                                });
                                break;
                            case 3:
                                groups[this.$t('board.visualization')] || (groups[this.$t('board.visualization')] = []);
                                groups[this.$t('board.visualization')].push({
                                    disabled,
                                    name: bookmark.name,
                                    id: bookmark.id
                                });
                                break;
                            default:
                                console.error('不能识别的书签：', bookmark);
                        }
                    });
                return groups;
            }
        },
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .add-new-chart-drop-list {
        position: absolute;
        z-index: 2;
        top: 25px;
        right: 50%;
        @include transform(translateX(50%));
        font-size: 14px;
        @include transition(width .2s cubic-bezier(1.0, 0.5, 0.8, 1.0));

        &.wider {
            width: 183px;
        }

        &:not(.wider) {
            width: 180px;
        }

        .tail {
            $size: 5px * 1.414;
            position: absolute;
            z-index: 1;
            top: 0;
            left: 50%;
            width: $size;
            height: $size;
            margin: (-$size/2) 0 0 (-$size/2);
            border-top: 1px solid $border-color;
            border-left: 1px solid $border-color;
            border-top-left-radius: 2px;
            background-color: white;
            @include transform(rotate(45deg));
            @include box-shadow(-1px -1px 1px rgba(#8b9daf, .16));
        }

        .methods {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            border-radius: 4px;
            border: 1px solid $border-color;
            @include box-shadow(0 3px 8px rgba(#8b9daf, .16));
            overflow: hidden;
            @include user-select(none);

            .method-btn {
                @include box-sizing();
                position: relative;
                z-index: 1;
                display: block;
                width: 100%;
                line-height: 36px;
                border: none;
                padding: 0 15px;
                text-align: left;
                color: $color-content;
                @include appearance(none);
                cursor: pointer;
                background-color: white;

                &:hover {
                    background-color: #e6fff7;

                    svg {
                        fill: $theme;
                    }
                }

                svg {
                    float: right;
                    width: 8px;
                    height: 8px;
                    margin-top: 14px;
                }
            }
        }

        .method-sub-list {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            background-color: white;
            line-height: $input-field-height;
            border-radius: 4px;
            border: 1px solid $border-color;
            @include box-shadow(0 3px 8px rgba(#8b9daf, .16));

            .method-title {
                padding: 0 22px 0 8px;
                font-weight: bold;
                border-bottom: 1px solid $select-border;
                text-align: center;
                color: $color-light-content;
                @include user-select(none);

                svg {
                    float: left;
                    fill: currentColor;
                    width: 8px;
                    height: 8px;
                    padding: 3px;
                    margin-top: ($input-field-height - 8px)/2 - 3px;
                    @include transform(rotate(180deg));
                    cursor: pointer;

                    &:hover {
                        background-color: $content-bg;
                    }
                }
            }

            .search-field {
                display: block;
                position: relative;
                height: $input-field-height;
                border-bottom: 1px solid $select-border;
                background-color: $title-bg;
                color: $color-light-content;

                input {
                    @include box-sizing();
                    height: $input-field-height;
                    padding: 0 8px 0 30px;
                    width: 100%;
                    border: none;
                    background-color: transparent;

                    &:hover {
                        background-color: $select-bg;
                    }

                    &:focus {
                        background-color: white;
                    }
                }

                .search-icon {
                    position: absolute;
                    left: 10px;
                    width: 14px;
                    height: 14px;
                    fill: $disabled;
                    top: ($input-field-height - 14px)/2;
                }
            }

            .bookmarks {
                max-height: 10 * $input-field-height;
                overflow: auto;
                @include user-select(none);

                &:empty {
                    padding: 1em 0;
                    text-align: center;
                    color: $disabled;
                    font-style: italic;
                }

                &.keyword:empty:after {
                    content: attr(data-content);
                }

                &:not(.keyword):empty:after {
                    text-align: center;
                    content: attr(data-not);
                    padding: 1em 0;
                    font-size: $disabled;
                }

                li {
                    padding: 0 15px;
                    @include ellipsis();
                }

                :not(.title) {
                    cursor: pointer;

                    &:hover {
                        background-color: #e6fff7;
                    }

                    &.disabled {
                        cursor: default;
                        background-color: $content-bg;
                    }
                }

                .title {
                    color: $color-title;
                    background-color: $title-bg;
                    border-bottom: 1px solid $select-border;
                }
            }

            a {
                display: block;
                padding: 0 15px;
                color: $color-content;

                &:hover {
                    background-color: #e6fff7;

                    svg {
                        fill: $theme;
                    }
                }

                svg {
                    float: left;
                    width: 16px;
                    height: 16px;
                    fill: $color-content;
                    margin: ($input-field-height - 16px)/2 15px 0 0;
                    @include transition();
                }
            }
        }
    }

</style>
