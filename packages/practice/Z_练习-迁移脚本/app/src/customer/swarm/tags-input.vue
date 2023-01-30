<template>
    <div class="tags-wrap" v-blur="add">
        <div class="tags" v-if="inputType === 'many'" transition="tags" v-for="(item,index) in labels">
            <span :title="item">{{item}}</span>
            <button ref="button" tabindex="-1" class="icon icon-close" @click="delTag(index)"></button>
        </div>
        <input ref="newLabel" class="tags-input" type="text" :placeholder="$t('contact.newLabelName')" v-model="tag"
               @keyup.enter="addTag(tag)"
               :maxlength="maxlength"
               @keydown.delete="delTag(labels.length - 1, true)"
               @input="changeFlag">
    </div>
</template>
<script>
    import {TAGANDWEBPAGE_NAME_REGEXP} from '../../common/utils/regs.js';

    export default {
        name: 'tags-input',
        props: {
            labels: {
                type: Array,
                required: true
            },
            inputType: {
                type: String,
                default: 'many' // single/many
            },
            maxlength: {
                type: Number,
                default: 200
            },
            // 最多允许输入的标签数
            maxTag: {
                type: Number,
            },
            // 正则校验，
            ifReg: {
                type: Boolean,
                default: false,
            }
        },
        data() {
            return {
                tag: '',
            };
        },
        methods: {
            // 联系人管理-创建用户-创建多个标签
            changeFlag() {
                if (this.tag) this.$emit('changeFlag', false, false);
                else this.$emit('changeFlag', true, false);
            },
            // 点击空白处保存所输入的结果
            add() {
                if (this.tag !== '') {
                    this.addTag(this.tag);
                }
            },
            addTag(tag) {
                if (this.maxTag && this.labels.length === this.maxTag) {
                    this.$toast(this.$t('analysis.maxLimit') + this.maxTag + this.$t('analysis.items'), 'warn');
                    this.$emit('changeFlag', false, false);
                } else if (tag !== '' && this.ifReg && !TAGANDWEBPAGE_NAME_REGEXP.test(tag)) {
                    this.$toast(this.$t('tag.nameReg'), 'warn');
                    this.$emit('changeFlag', false, false);
                } else if (tag !== '') {
                    this.labels.push(tag);
                    this.tag = '';
                    this.$emit('create', tag);
                }
            },
            delTag(index) {
                if (this.$refs.newLabel.value !== '') return;
                if (index >= 0) {
                    this.labels.splice(index, 1);
                    this.$emit('del', index);
                }
            },
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    //输入框tags
    .tags-wrap {
        display: inline-flex;
        flex-wrap: wrap;
        border: 1px solid $form-border;
        width: 298px;
        padding: 0 6px;
        outline: none;
        border-radius: 4px;

        .tags {
            line-height: 22px;
            border: 1px solid $purple;
            margin: 3px 10px 3px 0;
            padding-left: 5px;
            border-radius: 3px;
            cursor: pointer;
            white-space: nowrap;
            @include transition();
            background-color: #f2f0ff;
            color: $purple;

            &:hover {
                background-color: #dbd5fb;
            }

            span {
                display: inline-block;
                vertical-align: middle;
                max-width: 260px;
                @include ellipsis();
            }

            button {
                padding: 0 3px;
                cursor: pointer;
                border: 1px solid transparent;
                line-height: 18px;
                border-bottom-right-radius: 3px;
                border-top-right-radius: 3px;
                color: $purple;
                background-color: transparent;
                @include transition();

                &:hover {
                    background-color: #ef6266;
                    color: white;
                }
            }
        }

        input {
            width: 75px;
            height: 26px;
            border: 1px solid transparent;
            background-color: inherit;
        }
    }

</style>
