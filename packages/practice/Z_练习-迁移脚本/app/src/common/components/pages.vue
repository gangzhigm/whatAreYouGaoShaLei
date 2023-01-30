<template>
    <div class="pager" :class="size" v-if="total > 0">
        <slot></slot>
        <ul class="pages">
            <li class="pages-prev">
                <span class="icon icon-arrow-left" v-if="pageNow === 1"></span>
                <a v-else class="icon icon-arrow-left" href="javascript:void(0);" @click="prevClick"></a>
            </li>
            <!--如果只有一页就不显示固定的第一个分页按钮了,避免重复-->
            <template v-if="pageTotal > 1">
                <li v-for="i in pageBegin" class="pages-li" :class="{active:i == pageNow}">
                    <span v-if="i == pageNow" v-text="i"></span>
                    <a v-else @click="pageClick(i)" v-text="i"></a>
                </li>
            </template>
            <li class="left-rest" v-if="ellipsis[0] > slider">
                <span>...</span>
            </li>
            <li v-for="i in pageMiddle" class="pages-li" :class="{active:i == pageNow}">
                <span v-if="i == pageNow" v-text="i"></span>
                <a v-else @click="pageClick(i)" v-text="i"></a>
            </li>
            <li class="right-rest" v-if="pageTotal - ellipsis[1] > slider">
                <span>...</span>
            </li>
            <li v-for="i in pageEnd" class="pages-li" :class="{active:i == pageNow}">
                <span v-if="i == pageNow" v-text="i"></span>
                <a v-else @click="pageClick(i)" v-text="i"></a>
            </li>
            <li class="pages-next">
                <span v-if="pageNow == pageTotal" class="icon icon-arrow-right"></span>
                <a v-else class="icon icon-arrow-right" @click="nextClick"></a>
            </li>
            <li class="pages-jump" v-if="total && total > 8">
                <input class="input page-input" type="text" :class="pageSize"
                    @input="handleInput" v-model.lazy="pageNum" @keydown.enter="goPage">
                <i class="icon icon-start1 page-go" :class="{'disabled': !pageNum || now==pageNum}" @click="goPage"></i>
            </li>
        </ul>
    </div>
</template>
<script>
    export default {
        name: 'pager',
        props: {
            // 总页数
            total: {
                type: [Number, String],
                required: true
            },
            // 当前页
            now: {
                type: [Number, String],
                default: 1
            },
            size: { // big, sm
                type: String,
                default: 'big'
            },
            length: {
                type: Number,
                default: 8
            }
        },
        data() {
            return {
                //总页数
                pageTotal: this.total,
                //输入的页码
                pageNum: null,
                //显示分页按钮的个数
                // length: 8,
                //前后固定的分页按钮个数
                slider: 1
            };
        },
        watch: {
            total(val) {
                let pageTotal = parseInt(val);
                pageTotal = (isNaN(pageTotal) || pageTotal < 1) ? 1 : pageTotal;
                this.pageTotal = pageTotal;
                this.pageNum = null;
            },
        },
        computed: {
            //当前页
            pageNow() {
                let pageNow = parseInt(this.now);
                pageNow = (isNaN(pageNow) || this.total < 2 || pageNow < 1) ? 1 : pageNow;
                pageNow = pageNow > this.total ? this.total : pageNow;
                return pageNow;
            },
            //前边显示固定分页数
            pageBegin() {
                return Math.min(this.slider, this.ellipsis[0]);
            },
            //中间显示分页数
            pageMiddle() {
                let arr = [];
                for (let i = this.ellipsis[0] + 1; i <= this.ellipsis[1]; i++) {
                    arr.push(i);
                }
                return arr;
            },
            //后边显示分页数
            pageEnd() {
                let arr = [];
                for (let i = this.ellipsis[2] + 1; i <= this.pageTotal; i++) {
                    arr.push(i);
                }
                return arr;
            },
            /**
             * 出现三个点时的分页的范围
             * @returns {*[]}
             * begin: 开始页码
             * end: 结束页码
             * endMax: 结束页码的最大值
             */
            ellipsis() {
                let endMax = this.pageTotal - this.slider;
                let begin = this.pageNow - (this.length / 2) + this.slider;
                begin = begin < 1 ? 1 : begin;
                let end = begin + this.length - 2 * this.slider;
                //当begin达到最小值后需要根据begin重新计算end以保证显示的分页按钮个数不变
                end = begin < this.slider ? (end + this.slider - begin) : end;
                if (end >= endMax) {
                    end = endMax;
                    //当end达到最大值后需要根据end重新计算begin以保证显示的分页按钮个数不变
                    begin = (end - this.length + 2 * this.slider) < 1 ? 1 : (end - this.length + 2 * this.slider);
                }
                return [begin, end, endMax];
            },
            maxLen() {
                return this.total.toString().length;
            },
            pageSize() {
                switch (this.maxLen) {
                    case 1:
                    case 2:
                        return 'sm';
                    case 3:
                    case 4:
                        return 'md';
                    case 5:
                    case 6:
                        return 'lg';
                    case 7:
                    case 8:
                        return 'sl';
                    default:
                        return 'max';
                }
            }
        },
        methods: {
            //上一页
            prevClick() {
                let no = this.pageNow - 1;
                if (no < 1) no = 1;
                this.$emit('page', no);
            },
            //下一页
            nextClick() {
                let no = this.pageNow + 1;
                if (no > this.pageTotal) no = this.pageTotal;
                this.$emit('page', no);
            },
            //点击页码
            pageClick(no) {
                this.$emit('page', no);
            },
            handleInput(e) {
                e.target.value = e.target.value.replace(/^(0+)|[^\d]+/g,'');
                if (e.target.value.length > this.maxLen) {
                    e.target.value = e.target.value.slice(0, this.maxLen);
                }
                if (e.target.value > this.total) {
                    e.target.value = this.total;
                }
                this.pageNum = ~~e.target.value || null;
            },
            goPage() {
                if (!this.pageNum || this.now === this.pageNum) {
                    return;
                }
                this.$emit('page', ~~this.pageNum);
                this.pageNum = null;
            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../scss/base/variables';
    @import '../scss/base/mixin';

    .pager {
        text-align: right;
        @include clearfix();

        .pages {
            float: right;
            margin: 8px auto 8px 8px;
            padding: 8px 0;
            @include user-select(none);
            @include clearfix();
        }

        &.big {
            $size: 32px;
            line-height: $size + 8px * 4;

            .pages {
                li {
                    @include box-sizing();
                    float: left;
                    min-width: $size;
                    height: $size;
                    border: 1px solid $border-color;
                    line-height: $size - 2px;
                    text-align: center;
                    background-color: white;
                    margin-right: 8px;
                    @include border-radius(4px);

                    &.active {
                        color: $green;
                        border-color: $green;
                    }

                    &:last-child {
                        margin-right: 0;
                    }

                    span {
                        @include box-sizing();
                        display: block;
                        width: 100%;
                        padding: 0 5px;
                        height: 100%;
                        cursor: default;
                    }

                    a {
                        @include box-sizing();
                        display: block;
                        width: 100%;
                        padding: 0 5px;
                        height: 100%;
                        color: $color-content;
                        cursor: pointer;

                        &.hover {
                            color: $theme;
                        }
                    }
                }
            }

            .left-rest,
            .right-rest {
                border: none;
                background: transparent;
            }
        }

        &.sm {
            $size: 30px;
            line-height: $size + 8px * 4;

            .pages {
                li {
                    @include box-sizing();
                    float: left;
                    min-width: $size;
                    height: $size;
                    line-height: $size;
                    text-align: center;
                    background-color: #fff;

                    &.active {
                        color: $theme;
                    }

                    &.pages-li {
                        a:hover {
                            text-decoration: underline;
                        }
                    }

                    span {
                        cursor: default;
                    }

                    a {
                        display: block;
                        width: 100%;
                        height: 100%;
                        color: $color-content;

                        &:hover {
                            color: $theme;
                        }
                    }
                }
            }
        }

        .pages-prev,
        .pages-next {
            span {
                color: $disabled;
                cursor: not-allowed;
            }
        }
        .pages-jump {
            .page-input {
                float: left;
                box-sizing: border-box;
                height: 30px;
                min-width: 30px;
                border: none;
                border-top-right-radius: unset;
                border-bottom-right-radius: unset;
                &.sm {
                    width: 30px;
                }
                &.md {
                    width: 45px;
                }
                &.lg {
                    width: 60px;
                }
                &.sl,
                &.max {
                    width: 75px;
                }
            }
            .page-go {
                float: right;
                box-sizing: border-box;
                border: none;
                height: 30px;
                width: 30px;
                cursor: pointer;
                &.disabled {
                    color: $disabled;
                    cursor: default;
                }
            }
        }
    }
</style>
