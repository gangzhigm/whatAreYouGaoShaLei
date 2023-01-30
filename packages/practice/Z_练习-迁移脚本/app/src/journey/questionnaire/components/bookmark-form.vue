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
                    <input type="text" id="bookmark-name" v-model.trim="bookMarkName" maxlength="30" class="input"
                        v-title:top.line.warn="errorText" :class="{error: errorText}" @focusin="errorText = ''">
                </div>
                <div class="form-field">
                    <button type="button" class="pull-left icon icon-delete btn btn-md"
                        v-if="!creatingNewBookmark && bookMarkId" @click.stop="deleteBookMarkItem">
                        {{'bookmark.deleteBookmark' | t}}
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
import { COMMON_NAME_REGEXP } from '@/common/utils/regs';

export default {
    props: {
        bookMarkId: Number | String,
        headerBookMarkName: String
    },
    data () {
        return {
            creatingNewBookmark: true,
            bookMarkName: this.headerBookMarkName || '',
            errorText: '',
            bookMarkNameCopy: this.headerBookMarkName || ''
        };
    },
    watch: {
        bookMarkName (val) {
            this.$parent.bookmarkName = val;
        }
    },
    mounted () {
        // 获取书签列表
        this.creatingNewBookmark = !this.headerBookMarkName;
    },
    methods: {
        hide () {
            this.$emit('hide');
        },
        // 保存为新书签，更新当前书签
        save (flag) {
            if (flag === 'create') {
                this.creatingNewBookmark = true;
                this.bookMarkName = '';
            } else {
                this.creatingNewBookmark = false;
                this.bookMarkName = this.bookMarkNameCopy;
            }
        },
        //校验
        valid () {
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
            return true;
        },
        //保存为书签
        createBookMark () {
            if (this.valid()) {
                this.$emit('createBookMark', this.creatingNewBookmark);
            }
        },
        //删除书签
        deleteBookMarkItem () {
            this.$confirm(this.$t('form.confirmTheOperation'), this.$t('form.confirmToDeleteTheBookmark'))
                .then(sure => {
                    if (sure) {
                        this.$parent.delBookmarkById();
                    }
                });
        }
    }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../common/scss/base/variables';
@import '../../../common/scss/base/mixin';

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
    @include box-shadow(0 3px 8px rgba(#8b9daf, 0.16));

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
