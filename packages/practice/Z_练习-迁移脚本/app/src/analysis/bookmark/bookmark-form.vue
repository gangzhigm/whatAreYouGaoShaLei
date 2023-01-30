<template>
    <transition name="drop" mode="out-in">
        <div class="bookmark-form">
            <div class="update-save" v-if="bookMarkId">
                <span :class="{checked: !creatingNewBookmark}"
                      @click="save('update')">{{'bookmark.updateBookmark' | t}}</span>
                <span :class="{checked: creatingNewBookmark}"
                      @click="save('create')">{{'bookmark.saveBookmark' | t}}</span>
            </div>
            <!--必须放在update-save 之后-->
            <div class="triangle"></div>
            <div class="book-marks-middle-box">
                <label for="bookmark-name">{{'bookmark.bookmarkName' | t}}</label>
                <div class="form-field flex">
                    <input type="text" id="bookmark-name" v-model.trim="bookMarkName" maxlength="30"
                           class="input"
                           v-title:top.line.warn="errorText" :class="{error: errorText}" @focusin="errorText = ''">
                </div>
                <div class="form-field">
                    <button type="button" class="pull-left icon icon-delete btn btn-md"
                            v-if="!creatingNewBookmark && bookMarkId"
                            @click.stop="deleteBookMarkItem(bookMarkId)"> {{'bookmark.deleteBookmark' | t}}
                    </button>
                    <button type="button" class="pull-right btn btn-md btn-theme save-btn" @click="createBookMark">
                        {{'common.save' | t}}
                    </button>
                    <button type="button" class="pull-right btn btn-md btn-white " @click.stop="hide">{{'common.cancel'
                        | t}}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>
<script>
    import { WebServiceBookmarkApiV1 } from '@/api';
    import {FETCH_BOARDS, FETCH_BOOKMARKS} from '@/store/vuex/actionTypes';
    import {COMMON_NAME_REGEXP} from '@/common/utils/regs';
    import {trackEvent} from '@/monitor';
    import {ANALYSIS_STORE_NAME} from '@/store/vuex/modules/analysisStore';
    import { mapState, mapActions } from 'vuex';

    export default {
        props: {
            bookMarkId: Number | String,
            headerBookMarkName: String,
            filterStr: Object,
            query: Object,
            type: Number,
            desc: String,
        },
        data() {
            return {
                creatingNewBookmark: true,
                bookMarkName: this.headerBookMarkName || '',
                errorText: ''
            };
        },
        computed: {
            ...mapState({
                userId: state => state.user.cid,
                storeBookmarks: state => state[ANALYSIS_STORE_NAME].bookmarks
            }),
            referenceIds() {
                let bookmark = this.storeBookmarks.find(list => list.id === this.bookMarkId);
                return bookmark ? bookmark.overviewIds : [];
            }
        },
        watch: {
            headerBookMarkName(val) {
                this.bookMarkName = val;
            }
        },
        mounted() {
            // 获取书签列表
            this.getBookMarks();
            this.creatingNewBookmark = !this.bookMarkId;
        },
        methods: {
            ...mapActions([
                FETCH_BOOKMARKS,
                FETCH_BOARDS
            ]),
            hide() {
                this.$emit('hide');
            },

            // 保存为新书签，更新当前书签
            save(flag) {
                if (flag === 'create') {
                    this.creatingNewBookmark = true;
                    this.bookMarkName = '';
                } else {
                    this.creatingNewBookmark = false;
                    this.bookMarkName = this.headerBookMarkName;
                }
            },

            //得到书签列表
            async getBookMarks() {
                await Promise.all([this.FETCH_BOOKMARKS(), this.FETCH_BOARDS()]);
            },

            valid() {
                this.errorText = '';
                if (this.bookMarkName === '') {
                    this.errorText = this.$t('bookmark.bookmarkNameNoEmpty');
                    return false;
                }
                if (!COMMON_NAME_REGEXP.test(this.bookMarkName)) {
                    this.errorText = this.$t('bookmark.bookmarkNameReg');
                    return false;
                }
                if (this.bookMarkName.length > 30) {
                    this.errorText = this.$t('bookmark.bookmark30Character');
                    return false;
                }
                // if (
                //     this.$parent.chartType === 'map'
                //     && this.$parent.byFields
                //     && this.$parent.byFields.length !== 1
                //     && this.$parent.byFields[0].name !== '省'
                // ) {
                //     this.errorText = '当前书签没有要保存的数据!';
                //     return false;
                // }
                return true;
            },

            //保存为书签
            createBookMark() {
                if (this.valid()) {
                    let bookmarkInfo = {
                        cid: this.userId,
                        conditionStr: JSON.stringify(this.query),
                        filterStr: JSON.stringify(this.filterStr),
                        name: this.bookMarkName,
                        desc: this.desc,
                        type: this.type,
                        overviewIds: this.creatingNewBookmark ? [] : this.referenceIds
                    };

                    if (this.creatingNewBookmark) {
                        // 新增
                        WebServiceBookmarkApiV1
                            .createBookmark(bookmarkInfo)
                            .then(({body: {data: {bookmark}}}) => {
                                //新增一个数据概览显示项
                                this.$toast(this.$t('common.saveSuccess'), 'success');
                                this.getBookMarks()
                                    .then(() => {
                                        this.$emit('change', bookmark);
                                        this.hide();
                                    });
                            });
                    } else {
                        // 编辑
                        WebServiceBookmarkApiV1
                            .updateBookmark({
                                id: this.bookMarkId,
                                ...bookmarkInfo
                            })
                            .then(({body: {data: {bookmark}}}) => {
                                this.$toast(this.$t('common.updateSuccess'), 'success');
                                this.getBookMarks()
                                    .then(() => {
                                        this.$emit('change', bookmark);
                                        this.hide();
                                    });
                            });
                    }
                }
            },

            //删除书签
            async deleteBookMarkItem(id) {
                const sure = await this.$confirm(this.$t('common.del'), this.referenceIds.length > 0
                    ? this.$t('bookmark.bookmark') + `「${this.bookMarkName}」` + this.$t('bookmark.bookmarkDeleteConfirm')
                    : this.$t('bookmark.confirmDelete') + `「${this.bookMarkName}」` + this.$t('bookmark.deleteConfirm'));
                if (sure) {
                    try {
                        if (this.referenceIds.length > 0) {
                            await WebServiceBookmarkApiV1
                                .updateBookmark({
                                    id: this.bookMarkId,
                                    cid: this.userId,
                                    conditionStr: JSON.stringify(this.query),
                                    filterStr: JSON.stringify(this.filterStr),
                                    name: this.bookMarkName,
                                    desc: this.desc,
                                    type: this.type,
                                    overview: []
                                });
                        }

                        await WebServiceBookmarkApiV1.deleteBookmark(id)
                            .then(() => {
                                trackEvent('数据分析-删除书签');
                            });
                        await this.getBookMarks();
                        this.$emit('change', {id: '', name: ''});
                        // 如果删除的书签正好是当前正在展示的书签，则跳转路由离开该书签
                        if (this.$route.query.bmsId && parseInt(this.$route.query.bmsId) === id) {
                            let newQuery = Object.assign({}, (this.$route.query));
                            delete newQuery.bmsId;
                            this.$router.replace({
                                name: this.$route.name,
                                params: this.$route.params,
                                query: newQuery
                            });
                        }
                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                        this.hide();

                    } catch (e) {
                        console.error(e);
                    }
                }
            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .bookmark-form {
        position: absolute;
        top: $toolbar-height + 2;
        right: 0;
        width: 335px;
        line-height: $input-field-height;
        border: 1px solid $select-border;
        box-sizing: border-box;
        background-color: white;
        z-index: $index-menu;
        @include box-shadow(0 3px 8px rgba(#8b9daf, .16));

        .triangle {
            position: absolute;
            right: 46px;
            top: -6px;
            width: 10px;
            height: 10px;
            z-index: -1;
            border-top-left-radius: 4px;
            transform: rotate(45deg);
            border-top: 1px solid $select-border;
            border-left: 1px solid $select-border;
            background-color: white;
        }

        .update-save {
            background-color: $title-bg;

            span {
                display: inline-block;
                width: 49%;
                text-align: center;
                vertical-align: top;
                color: $color-title;
                border-bottom: 2px solid transparent;
                cursor: pointer;

                &.checked {
                    color: $light-green;
                    border-bottom: 2px solid $light-green;
                }
            }

            & + .triangle {
                background-color: $title-bg;
            }
        }

        .book-marks-middle-box {
            padding: 16px;
            color: $color-content;
            @include clearfix();

            button.icon-delete {
                color: $red;
                padding-left: 0;

                &:hover {
                    color: $dark-red;
                }
            }

            .save-btn {
                margin-left: 16px;
            }
        }

    }
</style>
