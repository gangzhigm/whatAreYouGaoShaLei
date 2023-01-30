<template>
    <div class="msg-reply">
        <div class="editable" contenteditable="true" ref="content" key="text"
             style="overflow-y: auto;overflow-x: hidden;" @change="checkLength" @input="checkLength"></div>
        <div class="editor_toolbar">
            <p class="editor_tip js_editorTip">
                {{'message.alsoUCanEnter' | t}} <span class="editor-tip-count">{{300 - contentValueLength}}</span> {{'message.word' | t}}
            </p>
            <div class="emotion_switch" @click.self="toggleEmoji" v-blur="hideEmoji">
                <transition name="drop">
                    <ul class="emotions" v-show="showEmotions">
                        <li class="emotions_item" v-for="(emoji,index) in emojiList">
                            <img :src="emoji.url" alt="" @mousedown.prevent="insertHtmlAtCaret(index,$event)">
                        </li>
                    </ul>
                </transition>
            </div>
        </div>
        <div class="btn btn-md btn-theme" style="margin: 10px 0;" @click="send">{{'common.send' | t}}</div>
        <div class="btn btn-md btn-cancel btn-white" @click="cancel">{{'message.hide' | t}}</div>
    </div>
</template>
<script type="text/babel">
    import { WechatApiV1 } from '@/api';
    import emojiList from '../../common/utils/emoji/emojiList';
    import {trackEvent} from '../../monitor';

    export default {
        props: {
            msgId: String,
            openId: String
        },
        data() {
            return {
                sending: false,
                // 回复的内容
                innerText: '',

                showEmotions: false,
                // 所有表情图片
                emojiList: emojiList,

                contentValueLength: 0,
            };
        },
        methods: {
            checkLength() {
                // let imgList = this.$refs.content.innerHTML.match(/img.+?/g);
                // const imgLength = imgList ? imgList.length : 0;
                this.contentValueLength = this.$refs.content.innerText.substring(0, 300).length;
            },
            toggleEmoji() {
                this.showEmotions = !this.showEmotions;
            },
            hideEmoji() {
                if (this.showEmotions)
                    this.showEmotions = false;
            },
            insertHtmlAtCaret(index, /*event*/) {
                this.$refs.content.focus();
                let html = '<img src="' + this.emojiList[index].url + '" data-title="' + this.emojiList[index].dataTitle
                    + '" style="width: 20px; height: 20px">';
                let sel, range;
                if (window.getSelection) {
                    // IE9 and non-IE
                    sel = window.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        range = sel.getRangeAt(0);
                        range.deleteContents();
                        // Range.createContextualFragment() would be useful here but is
                        // non-standard and not supported in all browsers (IE9, for one)
                        let el = document.createElement('div');
                        el.innerHTML = html;

                        let frag = document.createDocumentFragment(), node, lastNode;
                        while ((node = el.firstChild)) {
                            lastNode = frag.appendChild(node);
                        }
                        range.insertNode(frag);
                        if (lastNode) {
                            range = range.cloneRange();
                            range.setStartAfter(lastNode);
                            range.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                    }
                    this.checkLength();
                }
            },

            // 取消事件
            cancel() {
                this.innerText = '';
                this.$emit('cancel');
            },
            send() {
                if (this.$refs.content.innerText.length > 300) {
                    this.$toast(this.$t('message.max300Chars'),'warn');
                    return false;
                }
                if (!this.sending) {
                    this.sending = !this.sending;
                    const Regexp = /\[.+?]/g;
                    let dataTitleList = this.$refs.content.innerHTML.match(Regexp);
                    let html = this.$refs.content.innerHTML;
                    if (dataTitleList !== null) {
                        for (let a = 0; a < dataTitleList.length; a++) {
                            html = html.replace(/<img.+?>/, dataTitleList[a]);
                        }
                    }
                    this.$refs.content.innerHTML = html;
                    if (this.$refs.content.innerText.trim().length === 0) {
                        this.$toast(this.$t('message.textNotEmpty'),'warn');
                        this.$refs.content.innerHTML = '';
                        this.sending = !this.sending;
                        return false;
                    }
                    this.innerText = this.$refs.content.innerText;
                    WechatApiV1
                        .sendMsg(this.msgId, this.openId, this.innerText, 4)
                        .then(() => {
                            this.$toast(this.$t('common.sendSuccess'), 'success');
                            this.$refs.content.innerText = '';
                            this.innerText = '';
                            this.sending = !this.sending;
                            this.contentValueLength = 0;
                            this.$emit('sendFinish');
                            trackEvent('微信管理-消息管理-发送消息');
                        });
                }
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .msg-reply {
        margin: 15px 0 0;
        background-color: #fff;
        padding-left: 10px;
        padding-top: 6px;
        padding-right: 40px;

        .editable {
            padding: 14px 20px;
            outline: 0;
            word-wrap: break-word;
            word-break: break-all;
            background-color: #fff;
            height: 90px;
            font-size: 14px;
            line-height: 20px;
            border: 1px solid $border-color;
            img {
                float: none !important;
                display: inline-block;
                cursor: pointer;
                width: 20px;
                height: 20px;
                vertical-align: middle;
                -webkit-background-size: 20px auto;
                background-size: 20px auto;
            }
        }
        .editor_toolbar {
            position: relative;
            padding: 0 15px;
            line-height: 36px;
            background-color: #fff;
            border: 1px solid $border-color;
            border-top: 0;

            .emotion_switch {
                display: inline-block;
                width: 20px;
                height: 20px;
                background: url('../images/emotion_editor.png') 0 0 no-repeat;
                vertical-align: middle;
                cursor: pointer;

                &:hover {
                    background-position: 0 -24px;
                }

            }
            p.editor_tip {
                float: right;
                color: #8d8d8d;
                .editor-tip-count {
                    color: #0cc2a9;
                }
            }
            ul.emotions {
                z-index: 10;
                position: absolute;
                top: 36px;
                left: 0;
                -moz-user-select: none;
                overflow: hidden;
                border-top: 1px solid #c0bfc5;
                border-right: 1px solid #c0bfc5;
                background-color: #e7e7eb;
                width: 384px;
                li {
                    @include box-sizing();
                    float: left;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    line-height: 24px;
                    font-size: 0;
                    text-align: center;
                    border-bottom: 1px solid #c0bfc5;
                    border-left: 1px solid #c0bfc5;
                    background-color: #fff;
                    img {
                        display: inline-block;
                        vertical-align: middle;
                        width: 20px !important;
                        height: 20px !important;
                        cursor: pointer;
                        -webkit-background-size: 20px auto;
                        background-size: 20px auto;
                    }
                    span {
                        cursor: pointer;
                        width: 20px;
                        height: 20px;
                        vertical-align: middle;
                        display: inline-block;
                        background: transparent url('../images/icon.png') no-repeat;
                        -webkit-background-size: 20px auto;
                        background-size: 20px auto;
                    }
                }
            }
        }

        .btn-send {
            @include box-sizing();
            width: 100px;
            height: 35px;
            line-height: 33px;
            background: $dark-green;
            border: 0;
            margin: 10px;
            color: #fff;
            cursor: pointer;
        }
    }
</style>
