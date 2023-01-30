<template>
    <div class="text-link-editor">
        <span v-if="isChecking && !value">{{ 'common.noData' | t }}</span>
        <template v-show="!isChecking || value">
            <div :id="textEditorName"
                 :class="textEditorName"
                 class="text-editor"
                 ref="textEditor"
                 :contenteditable="!isChecking"></div>
            <div class="text-editor-panel">
                <button v-if="!isChecking"
                        class="btn btn-sm btn-white pull-left"
                        type="button"
                        :disabled="!currentRange"
                        @click="goAddLink()">
                    {{'wechatContent.insertLink' | t}}
                </button>
                <p v-if="isChecking" class="pull-right">
                    {{'common.total' | t}}
                    <span class="theme-text">&nbsp;{{textContentLength}}&nbsp;</span>
                    {{'QRCode.word' | t}}
                    ({{'wechatContent.includeLinkText' | t}})
                </p>
                <p v-else class="pull-right">
                    {{'QRCode.alsoUCanEnter' | t}}
                    <span class="theme-text">&nbsp;{{maxLength - textContentLength}}&nbsp;</span>
                    {{'QRCode.word' | t}}
                    <span v-if="maxLength != 300">({{'wechatContent.includeLinkText' | t}})</span>
                </p>
            </div>
            <div class="preview">
                <p class="light-content-text" v-if="value === ''">
                    {{'wechatContent.previewForm' | t}}
                </p>
                <button class="btn btn-md btn-theme" type="button" v-else @click="isPreview = true">
                    {{'wechatContent.previews' | t}}
                </button>
            </div>
            <!--链接hover弹窗-->
            <div class="hover-box">
                <span class="hover-info">{{hoverLink.formName}}</span>
                <input v-if="!isChecking"
                       type="button"
                       class="btn hover-btn btn-modify"
                       :value="$t('form.modify')"
                       @click="hoverModify" />
                <input v-if="!isChecking"
                       type="button"
                       class="btn hover-btn btn-del"
                       :value="$t('wechatContent.clean')"
                       @click="hoverDel" />
            </div>
            <div class="content-html" v-html="contentHtml"></div>
            <!--添加链接弹窗-->
            <modal class="link-modal" :size="'lg'" v-if="showLinkModal" :title="$t('wechatContent.insertLink')" @close="close">
                <div class="form-field flex">
                    <label class="label">{{'wechatContent.linkTitle' | t}}：</label>
                    <input type="text"
                           class="input lg"
                           :class="{error: errorTitleText}"
                           v-title:top.line.warn="errorTitleText"
                           v-model.trim="hoverLink.title"
                           @focusin="errorTitleText = ''"
                           maxlength="30"
                           :placeholder="$t('wechatContent.enterLinkTitle')"
                           :disabled="linkTitleDisabled">
                </div>
                <div class="form-field flex">
                    <label class="label">{{'QRCode.chooseForm' | t}}：</label>
                    <questionnaire-picker :value="Number(hoverLink.id)"
                                          :customId="Number(hoverLink.customFormId)"
                                          :formExtend="Number(hoverLink.extensionValueId)"
                                          :is-checking="isChecking"
                                          use="QRCode"
                                          @formName="hoverLink.formName = $event"
                                          @select="selectNormalForm"
                                          @textLink="getQuestionnaireUrl"
                                          @selectExtended="setFormExtended"
                                          @selectCustom="selectCustomForm"/>
                </div>
                <template v-slot:buttons>
                    <input type="button"
                           class="btn btn-md btn-white"
                           :value="$t('common.cancel')"
                           @click="close()"/>
                    <input type="button"
                           class="btn btn-md btn-theme"
                           :value="$t('common.confirm')"
                           @click="confirm()"/>
                </template>
            </modal>
            <!-- 预览弹出层 -->
            <modal :title="$t('wechatContent.previewText')" @close="isPreview = false" v-if="isPreview">
                <div class="content-preview-container">
                    <div class="content-preview-scroll-box">
                        <div class="content-preview">
                            <div class="bubble" v-html="contentHtml"></div>
                        </div>
                    </div>
                </div>
                <template v-slot:buttons>
                    <button class="btn btn-md btn-white" type="button" @click="isPreview = false">
                        {{'common.close' | t}}
                    </button>
                </template>
            </modal>
        </template>
    </div>
</template>
<script>
    import $ from 'jquery';
    import QuestionnairePicker from '@/journey/material/questionnaire-picker.vue';
    import {uniqId} from '@/store/vuex/modules/canvasStore';
    import { COMMON_URL_REGEXP,TAGANDWEBPAGE_NAME_REGEXP } from '@/common/utils/regs';
    import debounce from 'lodash/debounce';

    export default {
        name: 'text-link-editor',
        props: {
            value: String,
            form: {
                type: Object
            },
            maxLength: {
                type: [Number,String],
                default: 600
            },
            // 查看模式
            isChecking: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                textEditorName: 'text-editor' + uniqId(),
                isPreview: false,
                showLinkModal: false,
                errorTitleText: '',             //标题输入错误或为空提示
                linkTitleDisabled: false,       //有选中区域，打开后标题不可编辑
                contentText: '',                //编辑区text
                range: null,                    //当前选中区域
                selection: null,                //当前选中区域
                linkElemArr: [],                //当前a标签Arr
                hoverLink: {                    //当前hover的链接的标识
                    uniqId: '',
                    title: '',
                    sheetUrl: '',
                    formName: '',
                    id: null,
                    customFormId: null,
                    extensionValueId: null
                },
                inputZhcn: false,               //当前是否中文输入
                zhcnLength: 0,                  //中文输入前的编辑区域文本长度
                zhcnHtml: '',                   //中文输入前的编辑区域内容，用于中文输入后总长度超出maxLength时恢复
                zhcnRangeLength: 0,             //中文输入前选中的范围
                linkLength: ''                  //链接的总长度
            };
        },
        computed: {
            textContentLength() {
                if (this.maxLength !== 300) {
                    return Number(this.contentText.substring(0, this.maxLength).length) + this.linkLength;
                }
                return Number(this.contentText.substring(0, this.maxLength).length);
            },
            currentRange() {
                // 判断当前焦点是否在编辑器内
                if (this.range) {
                    let range = this.range.commonAncestorContainer;
                    if (
                        range.id === this.textEditorName ||
                        range.parentElement.id === this.textEditorName ||
                        $(range.parentElement).parent()
                            .hasClass(this.textEditorName) ||
                        $(range.parentElement).parent()
                            .parent()
                            .hasClass(this.textEditorName)
                    ) {
                        return true;
                    }
                    return false;
                }
                return false;
            },
            contentHtml() {
                return this.textContentLength > 0 ? $('#' + this.textEditorName).html() : '';
            }
        },
        mounted() {
            setTimeout(() => {
                this.$nextTick(() => {
                    let textEditor = document.getElementById(this.textEditorName);
                    if (this.value) {
                        textEditor.innerHTML = this.value;
                        $('#' + this.textEditorName).contents()
                            .each((index,node) => {
                                if (node.nodeType === 1) {
                                    let text = decodeURIComponent(node.innerHTML);
                                    $(node).html(text);
                                } else if (node.nodeType === 3) {
                                    let text = decodeURIComponent(node.textContent).replace(/\n/g,'<br>');
                                    $(node).replaceWith(text);
                                }
                            });
                    } else {
                        textEditor.innerHTML = '';
                    }
                    this.contentText = textEditor.innerText;
                    //禁止拖拽
                    $('#' + this.textEditorName).on('dragover drop', function(event){
                        event.preventDefault();
                        return false;
                    });
                    //中文输入法(控制文本长度)
                    $('#' + this.textEditorName)
                        .on('compositionstart',() => {
                            this.inputZhcn = true;
                            this.zhcnLength = this.textContentLength;
                        })
                        .on('compositionend',event => {
                            if (this.zhcnLength + event.originalEvent.data.length - this.zhcnRangeLength > this.maxLength) {
                                textEditor.innerHTML = this.zhcnHtml;
                            }
                            this.inputZhcn = false;
                        });
                    // 监听文本区编辑操作
                    let _this = this;
                    ['focus','blur','keyup','keydown','mouseup','paste'].forEach(function(type){
                        textEditor.addEventListener(type,e => {
                            let keyCode = e.keyCode ? e.keyCode : '';
                            if (type === 'keydown') {
                                _this.contentText = textEditor.innerText;
                            }
                            //控制字数开始
                            let contentLength = textEditor.innerText.length;
                            //paste事件文本长度
                            let pastedData = '';
                            if (type === 'paste') {
                                let clipboardData = e.clipboardData || window.clipboardData;
                                pastedData = clipboardData.getData('Text');
                                let selectData = window.getSelection().getRangeAt(0);
                                contentLength = contentLength +
                                    pastedData.length -
                                    (selectData.endOffset - selectData.startOffset)
                                    - 1;
                                e.preventDefault();
                                if (contentLength >= _this.maxLength) {
                                    pastedData = pastedData.slice(0,_this.maxLength - contentLength - 1);
                                }
                                document.execCommand('insertText',false,pastedData);
                            }
                            if (contentLength >= _this.maxLength &&
                                type !== 'mouseup' &&
                                keyCode !== 8 && keyCode !== 46 &&
                                !(e.keyCode === 88 && (e.ctrlKey || e.metaKey)) &&
                                !(e.keyCode === 67 && (e.ctrlKey || e.metaKey))) {
                                e.preventDefault();
                            }
                            setTimeout(() => {
                                if (!_this.inputZhcn) {
                                    _this.zhcnHtml = textEditor.innerHTML;
                                    _this.zhcnRangeLength = _this.range ?
                                        (_this.range.endOffset - _this.range.startOffset) : 0;
                                    //监听编辑
                                    if (type !== 'keydown') {
                                        _this.textChange(type);
                                    }
                                }
                            },1);
                        });
                    });
                    //初始化链接，更新唯一标识,计算链接字数
                    this.linkLength = 0;
                    $('#' + this.textEditorName).find('a')
                        .each((index,elem) => {
                            $(elem).attr('uniqId',uniqId());
                            this.linkLength += $(elem).attr('href').length;
                            if (!$(elem).attr('data-formname')) {
                                $(elem).attr('data-formname',this.form.formName || '');
                            }
                            if (!$(elem).attr('data-formid')) {
                                $(elem).attr('data-formid',this.form.id || '');
                            }
                            if (!$(elem).attr('data-customid')) {
                                $(elem).attr('data-customid',this.form.customFormId || '');
                            }
                            if (!$(elem).attr('data-extensionid')) {
                                $(elem).attr('data-extensionid',this.form.extensionValueId || '');
                            }
                        });
                    //链接hover弹窗
                    let hoverDom = $('.hover-box');
                    $('#' + this.textEditorName).on('mouseenter', 'a', e => {
                        let linkDom = $(e.currentTarget);
                        if (!linkDom.hasClass('wait-del')) {
                            //当前hover标签的相关信息
                            this.hoverLink = {
                                uniqId: linkDom.attr('uniqid'),
                                title: linkDom.text(),
                                sheetUrl: linkDom.attr('href'),
                                formName: linkDom.attr('data-formname'),
                                id: linkDom.attr('data-formid') || null,
                                customFormId: linkDom.attr('data-customid') || null,
                                extensionValueId: linkDom.attr('data-extensionid') || null
                            };
                            hoverDom.show();
                            let position = linkDom.position();
                            let topResult = position.top + linkDom.height();
                            hoverDom.css({
                                top: topResult,
                                left: position.left
                            });
                        }
                    })
                        .on('mouseleave', 'a', () => {
                            hoverDom.hide();
                        });
                    hoverDom.on('mouseenter', () => {
                        hoverDom.show();
                    })
                        .on('mouseleave', () => {
                            hoverDom.hide();
                        });
                    //只读模式下，新标签页打开链接
                    if (this.isChecking) {
                        $('#' + this.textEditorName).on('click', 'a', e => {
                            e.preventDefault();
                            let linkDom = $(e.currentTarget);
                            window.open(linkDom.attr('href'));
                        });
                    }
                    //预览模式下，新标签页打开链接
                    $('.text-link-editor').on('click', '.bubble a', e => {
                        e.preventDefault();
                        let linkDom = $(e.currentTarget);
                        window.open(linkDom.attr('href'));
                    });
                    //初始化链接信息数组
                    this.addLinkArr();
                });
            },100);
        },
        methods: {
            //编辑区域change
            textChange(type) {
                let textEditor = document.getElementById(this.textEditorName);
                //获取选中区域
                if (window.getSelection) {
                    this.selection = window.getSelection();
                } else if (document.selection) {
                    this.selection = document.selection.createRange();
                }
                this.range = this.selection.getRangeAt(0);
                this.$forceUpdate();
                this.linkHandle(type);
                if (textEditor.innerHTML === '<br>') {
                    textEditor.innerHTML = '';
                }
                this.contentText = textEditor.innerText;
                this.emit();
            },
            //链接变动时的处理
            linkHandle(type) {
                this.linkElemArr.forEach(item => {
                    //处理被选区分割的链接或粘贴已有链接等有多个相同uniq的情况
                    let arr = this.linkElemArr.filter(elems => {
                        return item.uniqId === elems.uniqId;
                    });
                    if (arr.length > 1) {
                        $('#' + this.textEditorName).find('a[uniqId="' + item.uniqId + '"]')
                            .addClass('wait-del')
                            .attr('href', 'javascript:void(0)')
                            .removeAttr('uniqId');
                    } else {
                        //处理链接的增删改
                        $('#' + this.textEditorName)
                            .find('a')
                            .each((index,elem) => {
                                //输入或替换内容时，直接替换a标签会使光标错乱，所以blur时替换a标签
                                if (type === 'blur' && !$(elem).attr('uniqId')) {
                                    $(elem).replaceWith(elem.innerHTML);
                                }
                                //内容变更
                                let uniq = $(elem).attr('uniqId');
                                /*eslint-disable-next-line*/
                                if (item.uniqId == uniq && item.text !== elem.innerHTML) {
                                    //输入或替换内容时，更改a标签样式及属性，稍后或blur时删除
                                    $('a[uniqId="' + uniq + '"]')
                                        .addClass('wait-del')
                                        .attr('href', 'javascript:void(0)')
                                        .removeAttr('uniqId');
                                }
                            });
                    }
                });
                this.addLinkArr();
                if (type === 'paste') {
                    this.pasteInit();
                }
            },
            //粘贴后重新初始化
            pasteInit: debounce(function() {
                $('#' + this.textEditorName).find('a')
                    .not('.wait-del')
                    .each((index,elem) => {
                        $(elem).attr('uniqId',uniqId())
                            .removeAttr('style');
                    });
                this.addLinkArr();
            },100),
            //添加链接信息至数组
            addLinkArr() {
                //更新当前链接信息数组linkElemArr
                this.linkElemArr = [];
                $('#' + this.textEditorName).find('a[uniqId]')
                    .each((index,elem) => {
                        let linkObj = {
                            uniqId: $(elem).attr('uniqId'),
                            text: elem.innerHTML
                        };
                        this.linkElemArr.push(linkObj);
                    });
                this.getAllLinkLength();
            },
            // 计算链接字数
            getAllLinkLength() {
                this.linkLength = 0;
                $('#' + this.textEditorName).find('a')
                    .not('.wait-del')
                    .each((index,elem) => {
                        this.linkLength += $(elem).attr('href').length;
                    });
            },
            //hover修改按钮
            hoverModify() {
                this.linkTitleDisabled = false;
                this.showLinkModal = true;
            },
            //hover清除按钮
            hoverDel() {
                let delDom = $('#' + this.textEditorName).find('a[uniqid=' + this.hoverLink.uniqId + ']');
                delDom.replaceWith(delDom.html());
                $('.hover-box').hide();
                this.emit();
                this.getAllLinkLength();
            },
            //点击插入链接按钮
            goAddLink() {
                this.hoverLink = {
                    uniqId: '',
                    title: '',
                    sheetUrl: '',
                    formName: '',
                    id: null,
                    customFormId: null,
                    extensionValueId: null
                };
                if (!this.range.collapsed) {
                    this.hoverLink.title = this.selection.toString();
                    this.linkTitleDisabled = true;
                }
                this.showLinkModal = true;
            },
            //添加链接
            confirm() {
                //校验信息
                if (this.hoverLink.title.trim() === '') {
                    this.errorTitleText = this.$t('wechatContent.enterLinkTitle');
                    return;
                }
                if (!TAGANDWEBPAGE_NAME_REGEXP.test(this.hoverLink.title)) {
                    this.errorTitleText = this.$t('QRCode.titleInvalid');
                    return;
                }
                if (!COMMON_URL_REGEXP.test(this.hoverLink.sheetUrl) || !this.hoverLink.id) {
                    this.$toast(this.$t('QRCode.validForm'),'warn');
                    return;
                }
                let textHtml = $('#' + this.textEditorName).html();
                //添加链接
                if (!this.hoverLink.uniqId) {
                    //恢复选区
                    let selection = document.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(this.range);
                    //有选择区域，添加链接
                    if (!this.range.collapsed) {
                        document.execCommand('createLink',
                            false,
                            this.hoverLink.sheetUrl);
                        $('#' + this.textEditorName).find('a')
                            .not('[uniqId]')
                            .attr({
                                'href': this.hoverLink.sheetUrl,
                                'data-formname': this.hoverLink.formName,
                                'data-formid': this.hoverLink.id || '',
                                'data-customid': this.hoverLink.customFormId || '',
                                'data-extensionid': this.hoverLink.extensionValueId || ''
                            });
                    } else {
                        //未选择区域，添加链接
                        let linkHtml = '';
                        let dataFormid = this.hoverLink.id || '';
                        let dataCustomid = this.hoverLink.customFormId || '';
                        let dataExtensionid = this.hoverLink.extensionValueId || '';
                        linkHtml = '<a href="' + this.hoverLink.sheetUrl + '"' +
                            '               data-formname="' + this.hoverLink.formName + '"' +
                            '               data-formid="' + dataFormid + '"' +
                            '               data-customid="' + dataCustomid + '"' +
                            '               data-extensionid="' + dataExtensionid + '">' + this.hoverLink.title + '</a>';
                        document.execCommand('insertHTML', false, linkHtml);
                    }
                    //新链接添加唯一标识
                    $('#' + this.textEditorName).find('a')
                        .not('[uniqId]')
                        .not('.wait-del')
                        .each((index,elem) => {
                            const uniq = uniqId().toString();
                            $(elem).attr('uniqId',uniq);
                        });
                    //新链接选取包含原有某些链接时的处理
                    this.linkHandle();
                } else {
                    $('#' + this.textEditorName).find('a[uniqid=' + this.hoverLink.uniqId + ']')
                        .attr({
                            'href': this.hoverLink.sheetUrl,
                            'data-formname': this.hoverLink.formName,
                            'data-formid': this.hoverLink.id || '',
                            'data-customid': this.hoverLink.customFormId || '',
                            'data-extensionid': this.hoverLink.extensionValueId || ''
                        })
                        .html(this.hoverLink.title);
                }
                this.getAllLinkLength();
                if ($('#' + this.textEditorName).text().length + this.linkLength > this.maxLength) {
                    $('#' + this.textEditorName).html(textHtml);
                    this.$toast(this.$t('wechatContent.overLength'), 'warn');
                    return;
                }
                this.addLinkArr();
                this.close();
            },
            //取消添加链接
            close() {
                this.emit();
                this.selection = null;
                this.range = null;
                this.showLinkModal = false;
                this.linkTitleDisabled = false;
                this.hoverLink = {
                    uniqId: '',
                    title: '',
                    sheetUrl: '',
                    formName: '',
                    id: null,
                    customFormId: null,
                    extensionValueId: null
                };
                this.errorTitleText = '';
            },
            emit() {
                let textEditor = document.getElementById(this.textEditorName);
                let text = textEditor.innerHTML
                    .replace(/<div>/g,'\n')
                    .replace(/<\/div>/g,'')
                    .replace(/<br>/g,'\n')
                    .replace(/ uniqid="[^"]*"/g,'')
                    .replace(/ style="[^"]*"/g,'');
                const parser = new DOMParser();
                const dom = parser.parseFromString(text, 'text/html');
                let textStr = '';
                Array.from(dom.body.childNodes)
                    .map(node => {
                        let str = node.tagName === 'A' && encodeURIComponent(node.textContent).length
                            ? `<a href="${node.attributes['href'].value}" data-formname="${node.attributes['data-formname'].value}" data-formid="${node.attributes['data-formid'].value}" data-customid="${node.attributes['data-customid'].value}" data-extensionid="${node.attributes['data-extensionid'].value}">${encodeURIComponent(node.textContent.replace('\n',''))}</a>`
                            : encodeURIComponent(node.textContent);
                        textStr += str;
                    });
                this.$emit('input',textStr);
            },
            selectNormalForm(e) {
                const formData = {
                    id: e.id,
                    customFormId: null,
                    formName: e.paperName
                };
                Object.assign(this.hoverLink, formData);
                this.$emit('select', e);
            },
            getQuestionnaireUrl(link) {
                this.hoverLink.sheetUrl = link;
                this.$emit('textLink', link);
            },
            setFormExtended(e) {
                this.hoverLink.sheetUrl = e.url || this.hoverLink.sheetUrl;
                this.hoverLink.extensionValueId = e.id;
                this.$emit('selectExtended', e);
            },
            selectCustomForm(e) {
                const formData = {
                    customFormId: e.id,
                    id: e.formId,
                    formName: e.formName
                };
                Object.assign(this.hoverLink, formData);
                this.$emit('selectCustom', e);
            },
        },
        components: { QuestionnairePicker }
    };
</script>
<style lang="scss" type="text/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .text-link-editor{
        flex: 1;
        height: auto;
        .text-editor{
            border: 1px solid $border-color;
        }

        .link-modal{
            .form-field{
                .input {
                    max-width: 425px;
                }
            }
        }

        .text-editor-panel{
            padding: 0;
            margin-top: 5px;
            border: none;
        }

        .preview {
            text-align: center;
            margin-top: $input-field-height;
        }

        .content-preview-container {
            overflow: hidden;
            position: relative;
            width: 414px;
            height: 736px;
            margin: auto;
            background: url("./images/official-account-head.jpg") no-repeat center top, url("./images/official-account-menu.jpg") no-repeat center bottom;
            @include background-size(contain);
        }

        .content-preview-scroll-box {
            overflow: auto;
            height: 623px;
            margin-top: 64px;
            margin-bottom: 50px;
        }

        .content-preview {
            min-height: 100%;
            padding: 46px 0 32px 60px;
            box-sizing: border-box;
            background: #ebebeb url("./images/official-account-content.jpg") no-repeat left top;
            @include background-size(100% auto);
        }

        .bubble {
            $wechat-bubble-border: #cccccc;
            position: relative;
            display: inline-block;
            box-sizing: border-box;
            max-width: 280px;
            padding: 10px;
            color: black;
            line-height: 20px;
            min-height: 40px;
            letter-spacing: 1px;
            font-size: 15px;
            background-color: white;
            border-radius: 4px;
            border: 1px solid $wechat-bubble-border;

            &:before {
                content: '';
                $size: 5px * 1.414;
                position: absolute;
                z-index: 1;
                top: 20px;
                left: 0;
                width: $size;
                height: $size;
                margin: (-$size/2) 0 0 (-$size/2);
                border-top: 1px solid $wechat-bubble-border;
                border-left: 1px solid $wechat-bubble-border;
                border-top-left-radius: 2px;
                background-color: white;
                @include transform(rotate(-45deg));
            }

            a {
                color: $blue;

                &:hover {
                    color: $light-blue;
                }

                &:active {
                    color: $dark-blue;
                }
            }
        }

        .content-html{
            display: none;
        }
    }
</style>
