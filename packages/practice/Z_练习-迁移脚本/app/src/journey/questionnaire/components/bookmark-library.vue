<template>
    <transition name="drop">
        <div class="bookmark-library">
            <label class="search-field">
                <input type="text" v-model.trim="keyword" :placeholder="$t('bookmark.keywordsSearch')" autofocus>
                <span class="icon icon-search"></span>
            </label>
            <ul class="bookmarks" :data-content="$t('board.noBookMarks')">
                <li v-for="(item,index) in filteredOptions" :title="item.name" :key="index"
                    :class="{active: value === item.id}"
                    v-text="item.name"
                    @click.stop="change(item)"></li>
            </ul>
        </div>
    </transition>
</template>
<script>

    import filterArrayByName from '@/common/utils/filterArrayByName';

    export default {
        props: {
            options: Array,
            value: ''
        },
        data() {
            return {
                keyword: ''
            };
        },
        computed: {
            filteredOptions() {
                return filterArrayByName(this.options, this.keyword);
            }
        },
        methods: {
            closeBookmarks() {
                this.$emit('hide');
            },
            // 选择一个列表项
            change(option) {
                this.$emit('choose', option);
                this.closeBookmarks();
            }
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .bookmark-library {
        $item-height: $input-field-height + 2;
        width: 320px;
        position: absolute;
        z-index: $index-menu;
        top: $toolbar-height + 2;
        right: 0;
        border: 1px solid $select-border;
        color: initial;
        background-color: white;
        text-align: left;
        @include box-shadow(0 3px 8px rgba(#8b9daf, .16));

        &:before {
            content: '';
            position: absolute;
            right: 35px;
            top: -(10px/1.414);
            width: 10px;
            height: 10px;
            border-radius: 3px;
            border-top: 1px solid $select-border;
            border-right: 1px solid $select-border;
            background-color: $title-bg;
            @include transform(rotate(-45deg));
        }

        .search-field {
            position: relative;
            display: flex;
            align-items: center;
            height: $input-field-height;
            border-bottom: 1px solid $select-border;
            background-color: $title-bg;
            @include border-radius(0);
            color: $color-light-content;
            input {
                height: $input-field-height;
                padding: 0 8px 0 28px;
                width: 100%;
                border: none;
                background-color: transparent;
                &:hover {
                    background-color: $select-bg;
                    & + .icon-search {
                        background-color: $select-bg;
                    }
                }
                &:focus {
                    background-color: #fff;
                    & + .icon-search {
                        background-color: #fff;
                    }
                }
            }
            .icon-search {
                $offset: ($input-field-height - 14px) / 2;
                position: absolute;
                width: 26px;
                height: $input-field-height - 2px;
                line-height: $input-field-height;
                text-align: center;
                left: 1px;
                top: 1px;
                background-color: transparent;
            }
        }

        .bookmarks {
            overflow-y: auto;
            max-height: 500px;

            &:empty:before {
                display: block;
                text-align: center;
                font-style: italic;
                color: $disabled;
                content: attr(data-content);
                line-height: 4 * $item-height;
            }

            li {
                padding: 0 18px;
                cursor: pointer;
                height: $item-height;
                line-height: $item-height;
                @include ellipsis();
                + li {
                    margin-top: 1px;
                }

                &:hover {
                    background-color: $hover-bg;
                }

                &.disabled {
                    cursor: default;
                    color: $disabled;
                    background-color: white;
                }

                &.active {
                    color: white;
                    background: $light-green;
                    border-color: $light-green;
                }
            }
        }
    }
</style>