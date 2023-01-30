<template>
    <div class="material-text">
        <span v-if="isChecking && !this.material.content">{{ 'common.noData' | t }}</span>
        <template v-show="!isChecking || this.material.content">
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
                    {{'wechatContent.insertLinks' | t}}
                </button>
                <p class="pull-left">
                    <span v-if="panelNotice" class="panel-notice">{{panelNotice}}</span>
                </p>
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
            <!--添加链接或小程序弹窗-->
            <modal class="link-modal" v-if="showLinkModal" :title="$t('wechatContent.insertLinks')" @close="close">
                <div class="insert-type">
                    <radio :source="0" v-model="insertType">{{'wechatContent.url' | t}}</radio>
                    <radio :source="1" v-model="insertType">{{'wechatContent.miniProgram' | t}}</radio>
                </div>
                <!--插入链接-->
                <div v-if="insertType === 0" class="insert-url">
                    <div class="form-field">
                        <label class="label">{{'wechatContent.linkTitle' | t}}：</label>
                        <input type="text"
                               class="input lg"
                               :class="{error: errorTitleText}"
                               v-title:top.line.warn="errorTitleText"
                               v-model.trim="linkData.title"
                               @focusin="errorTitleText = ''"
                               maxlength="30"
                               :placeholder="$t('wechatContent.enterLinkTitle')"
                               :disabled="linkTitleDisabled">
                    </div>
                    <div class="form-field">
                        <label class="label">{{'wechatContent.links' | t}}：</label>
                        <input type="text"
                               class="input lg"
                               :class="{error: errorLinkText}"
                               v-title:top.line.warn="errorLinkText"
                               v-model.trim="linkData.link"
                               @focusin="errorLinkText = ''"
                               :placeholder="$t('QRCode.enterUrl')">
                    </div>
                </div>
                <!--插入小程序-->
                <div v-if="insertType === 1" class="insert-miniProgram">
                    <div class="form-field">
                        <label class="label">{{'wechatContent.chooseMiniprogram' | t}}：</label>
                        <selector class="mini-program-select lg"
                            :class="{error: errorMiniprogramText}"
                            v-title:top.line.warn="errorMiniprogramText" 
                            @select="select($event)" 
                            :placeholder="$t('wechatContent.chooseMiniprogram')" 
                            :options="miniprogramList" 
                            :uniqueKey="'miniprogramId'" 
                            v-model="miniprogramId"></selector>
                    </div>
                    <div class="form-field">
                            <label class="label">{{'wechatContent.linkTitle' | t}}：</label>
                            <input type="text"
                                class="input lg"
                                :class="{error: errorTitleText}"
                                v-title:top.line.warn="errorTitleText"
                                v-model.trim="miniProgramData.title"
                                @focusin="errorTitleText = ''"
                                maxlength="30"
                                :placeholder="$t('wechatContent.enterLinkTitle')"
                                :disabled="linkTitleDisabled">
                    </div>
                    <template v-if="miniprogramId === 0">
                        <div class="form-field">
                            <label class="label">{{'wechatContent.appid' | t}}：</label>
                            <input type="text"
                                class="input lg"
                                :class="{error: errorAppidText}"
                                v-title:top.line.warn="errorAppidText"
                                v-model.trim="miniProgramData.appid"
                                @focusin="errorAppidText = ''"
                                :placeholder="$t('wechatContent.enterAppid')">
                            <svg aria-hidden="true" class="icon icon-help" v-title:right="$t('wechatContent.appidTips')">
                                <use xlink:href="#icon-help"></use>
                            </svg>
                        </div>
                        <div class="form-field">
                            <label class="label">{{'wechatContent.appPath' | t}}：</label>
                            <input type="text"
                                class="input lg"
                                :class="{error: errorAppPathText}"
                                v-title:top.line.warn="errorAppPathText"
                                v-model.trim="miniProgramData.appPath"
                                @focusin="errorAppPathText = ''"
                                :placeholder="$t('wechatContent.enterAppPath')">
                        </div>
                        <div class="form-field">
                            <label class="label">{{'wechatContent.alternatePage' | t}}：</label>
                            <input type="text"
                                class="input lg"
                                :class="{error: errorLinkText}"
                                v-title:top.line.warn="errorLinkText"
                                v-model.trim="miniProgramData.link"
                                @focusin="errorLinkText = ''"
                                :placeholder="$t('wechatContent.enterAlternatePage')">
                            <svg aria-hidden="true" class="icon icon-help" v-title:right="$t('wechatContent.appPathTips')">
                                <use xlink:href="#icon-help"></use>
                            </svg>
                    </div>
                    </template>
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
            <!--链接hover弹窗-->
            <div class="hover-box">
                <span class="hover-info">{{hoverLink.appid ? hoverLink.appPath : hoverLink.link}}</span>
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
        </template>
    </div>
</template>
<script type="text/babel">
    import $ from 'jquery';
    import {uniqId} from '@/store/vuex/modules/canvasStore';
    import {COMMON_URL_REGEXP} from '../../../common/utils/regs.js';
    import debounce from 'lodash/debounce';
    import { WechatApiV1 } from '@/api';
    export default {
        props: {
            material: {
                type: Object
            },
            maxLength: {
                type: [Number,String],
                default: 600
            },
            panelNotice: {                      //底部panel说明
                type: String,
                default: ''
            },
            // 查看模式
            isChecking: {
                type: Boolean,
                default: false
            },
            //判断文字的位置 false：非弹窗中；true: 弹窗中。解决弹窗中文字超出弹窗的问题
            isModal: {
                type: Boolean,
                default: false
            },
            // 目标公众号id，非必填
            officialId: {
                type: Number
            }
        },
        data() {
            return {
                textEditorName: 'text-editor' + uniqId(),
                contentText: '',                //编辑区text
                showLinkModal: false,           //添加链接及小程序弹框
                insertType: 0,                  //添加类型 链接：0，小程序：1
                linkData: {                     //添加链接的数据
                    title: '',
                    link: ''
                },
                miniProgramData: {              //添加小程序的数据
                    title: '',
                    appid: '',
                    appPath: '',
                    link: ''
                },
                linkTitleDisabled: false,       //有选中区域，打开后标题不可编辑
                errorTitleText: '',             //标题输入错误或为空提示
                errorLinkText: '',              //链接输入错误或为空提示
                errorAppidText: '',             //小程序appid为空提示
                errorAppPathText: '',           //小程序路径为空提示
                errorMiniprogramText:'',        //选择小程序为空提示
                range: null,                    //当前选中区域
                selection: null,                //当前选中区域
                linkElemArr: [],                //当前a标签Arr
                hoverLink: {                    //当前hover的链接的标识
                    uniqId: '',
                    title: '',
                    link: '',
                    appid: '',
                    appPath: ''
                },
                inputZhcn: false,               //当前是否中文输入
                zhcnLength: 0,                  //中文输入前的编辑区域文本长度
                zhcnHtml: '',                   //中文输入前的编辑区域内容，用于中文输入后总长度超出maxLength时恢复
                zhcnRangeLength: 0,             //中文输入前选中的范围
                linkLength: '',                 //链接的总长度
                miniprogramList: [
                    {miniprogramId: 0, name: this.$t('wechatContent.otherMiniprogram')}
                ],            //小程序列表
                miniprogramId: '',              //小程序id
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
            }
        },
        mounted() {
            setTimeout(() => {
                this.$nextTick(() => {
                    this.isModal === false ? $('#' + this.textEditorName).css('width',this.$parent.$el.clientWidth - 3) : '';
                    let textEditor = document.getElementById(this.textEditorName);
                    if (this.material.content) {
                        textEditor.innerHTML = this.material.content.replace(/\n/g,'<br>')
                            .replace(/\s\s/g,'&nbsp; ');
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
                            if ($(elem).attr('data-miniprogram-appid')) {
                                $(elem).addClass('mini-pro');
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
                                link: linkDom.attr('href') === 'http:' ? '' : linkDom.attr('href'),
                                appid: linkDom.attr('data-miniprogram-appid') || '',
                                appPath: linkDom.attr('data-miniprogram-path') || ''
        
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
                    //初始化链接信息数组
                    this.addLinkArr();
                    window.addEventListener('resize', this.resize, false);
                });
            },100);
            this.getMiniprogramList(this.officialId);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.resize, false);
        },
        methods: {
            resize() {
                if (!this.isModal) {
                    $('#' + this.textEditorName).css('width',1);
                    $('#' + this.textEditorName).css('width',this.$parent.$el.clientWidth - 3);
                }
            },
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
                this.linkData.title = this.hoverLink.title;
                this.miniProgramData.title = this.hoverLink.title;
                if (!this.hoverLink.appid) {
                    this.linkData = {
                        title: this.hoverLink.title,
                        link: this.hoverLink.link
                    };
                    this.insertType = 0;
                } else {
                    this.getMiniAppid(this.hoverLink.appid);
                    this.miniProgramData = {
                        title: this.hoverLink.title,
                        appid: this.hoverLink.appid,
                        appPath: this.hoverLink.appPath,
                        link: this.hoverLink.link
                    };
                    this.insertType = 1;
                }
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
                    link: '',
                    appid: '',
                    appPath: ''
                };
                this.linkData.title = '';
                this.linkData.link = '';
                if (!this.range.collapsed) {
                    this.linkData.title = this.selection.toString();
                    this.miniProgramData.title = this.selection.toString();
                    this.linkTitleDisabled = true;
                }
                this.showLinkModal = true;
            },
            //添加链接
            confirm() {
                //校验信息
                if (this.insertType === 0) {
                    if (this.linkData.title.trim() === '') {
                        this.errorTitleText = this.$t('wechatContent.enterLinkTitle');
                        return;
                    }
                    if (this.linkData.link.trim() === '') {
                        this.errorLinkText = this.$t('QRCode.enterUrl');
                        return;
                    }
                    if (!COMMON_URL_REGEXP.test(this.linkData.link)) {
                        this.errorLinkText = this.$t('QRCode.badUrl');
                        return;
                    }
                } else {
                    if (!String(this.miniprogramId)) {
                        this.errorMiniprogramText = this.$t('wechatContent.selectMiniprogram');
                        return;
                    }
                    if (this.miniProgramData.title.trim() === '') {
                        this.errorTitleText = this.$t('wechatContent.enterLinkTitle');
                        return;
                    }
                    if (this.miniprogramId === 0) {
                        if (this.miniProgramData.appid.trim() === '') {
                            this.errorAppidText = this.$t('wechatContent.enterAppid');
                            return;
                        }
                        if (this.miniProgramData.appPath.trim() === '') {
                            this.errorAppPathText = this.$t('wechatContent.enterAppPath');
                            return;
                        }
                    }
                    if (!COMMON_URL_REGEXP.test(this.miniProgramData.link) && this.miniProgramData.link.trim() !== '') {
                        this.errorLinkText = this.$t('QRCode.badUrl');
                        return;
                    }
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
                            this.insertType === 0 ? this.linkData.link : (this.miniProgramData.link || 'http://'));
                        if (this.insertType === 1) {
                            //无选中区域添加的链接，无法添加小程序参数，此处添加
                            $('#' + this.textEditorName).find('a')
                                .not('[uniqId]')
                                .addClass('mini-pro')
                                .attr({
                                    'href': this.miniProgramData.link,
                                    'data-miniprogram-appid': this.miniProgramData.appid,
                                    'data-miniprogram-path': this.miniProgramData.appPath
                                });
                        }
                    } else {
                        //未选择区域，添加链接
                        let linkHtml = '';
                        if (this.insertType === 0) {
                            //链接
                            linkHtml = '<a href="' + this.linkData.link + '">' + this.linkData.title + '</a>';
                        } else {
                            //小程序
                            linkHtml = '<a href="' + this.miniProgramData.link + '"' +
                                '               class="mini-pro"' +
                                '               data-miniprogram-appid="' + this.miniProgramData.appid + '"' +
                                '               data-miniprogram-path="' + this.miniProgramData.appPath + '">' +
                                this.miniProgramData.title + '</a>';
                        }
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
                    //修改链接
                    if (this.insertType === 0) {
                        $('#' + this.textEditorName).find('a[uniqid=' + this.hoverLink.uniqId + ']')
                            .removeClass('mini-pro')
                            .removeAttr('data-miniprogram-appid','data-miniprogram-path')
                            .attr('href',this.linkData.link)
                            .html(this.linkData.title);
                    } else {
                        $('#' + this.textEditorName).find('a[uniqid=' + this.hoverLink.uniqId + ']')
                            .html(this.miniProgramData.title)
                            .addClass('mini-pro')
                            .attr({
                                'href': this.miniProgramData.link,
                                'data-miniprogram-appid': this.miniProgramData.appid,
                                'data-miniprogram-path': this.miniProgramData.appPath
                            });
                    }
                }
                this.getAllLinkLength();
                if (this.maxLength !== 300) {
                    if ($('#' + this.textEditorName).text().length + this.linkLength > this.maxLength) {
                        $('#' + this.textEditorName).html(textHtml);
                        this.$toast(this.$t('wechatContent.overLength'), 'warn');
                        return false;
                    }
                } else {
                    if ($('#' + this.textEditorName).text().length > this.maxLength) {
                        $('#' + this.textEditorName).html(textHtml);
                        this.$toast(this.$t('wechatContent.overLength'), 'warn');
                        return false;
                    }
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
                this.linkData = {
                    title: '',
                    link: ''
                };
                this.miniProgramData = {
                    title: '',
                    appid: '',
                    appPath: '',
                    link: ''
                };
                this.hoverLink = {
                    uniqId: '',
                    title: '',
                    link: '',
                    appid: '',
                    appPath: ''
                };
                this.insertType = 0;
                this.errorTitleText = '';
                this.errorLinkText = '';
                this.errorAppidText = '';
                this.errorAppPathText = '';
                this.errorMiniprogramText = '';
                this.miniprogramId = '';
            },
            unescapeHtml(string) {
                let entityMap = {
                    '&amp;': '&',
                    '&lt;': '<',
                    '&gt;': '>',
                    '&quot;': '"',
                    '&#39;': '\'',
                    '&#x2F;': '/'
                };
                return String(string).replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;/g, (s) => {
                    return entityMap[s];
                });
            },
            emit() {
                let textEditor = document.getElementById(this.textEditorName);
                let text = textEditor.innerHTML
                    .replace(/<div>/g,'\n')
                    .replace(/<\/div>/g,'')
                    .replace(/<br>/g,'\n')
                    .replace(/&nbsp;/g,' ')
                    .replace(/ uniqid="[^"]*"/g,'')
                    .replace(/ style="[^"]*"/g,'')
                    .replace(/ class="mini-pro"/g,'');
                let contentStr = this.unescapeHtml(text);
                this.$emit('input',contentStr);
            },
            // 校验内容 素材对象未初始化/文字内容为空/只含有空格,不通过
            valid() {
                if (!this.material || !this.material.content || !this.material.content.trim()) {
                    this.$toast(this.$t('QRCode.validReply'),'warn');
                    return false;
                }
                return true;
            },
            // 获取小程序列表
            getMiniprogramList(id) {
                WechatApiV1.
                    selectMiniprogram(id)
                    .then((res)=>{
                        res.body.data.list.map((item)=>{
                            return this.miniprogramList.unshift(item);
                        });
                    });
            },
            getMiniAppid(appid,officialId){
                WechatApiV1.
                    getAppid(appid,officialId)
                    .then((res)=>{
                        this.miniprogramId = res.body.data.id;
                    });
            },
            select(e){
                this.linkTitleDisabled ? this.miniProgramData.title : this.miniProgramData.title = '';
                if (e.miniprogramId === 0) {
                    this.miniProgramData.appid = '';
                    this.miniProgramData.appPath = '';
                } else {
                    this.miniProgramData.appid = e.appid;
                    this.miniProgramData.appPath = e.path;
                }
                this.errorMiniprogramText = '';
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .material-text,.text-link-editor{
        position: relative;
        height: 346px;
        .text-editor {
            font-size: 14px;
            position: relative;
            z-index: 1;
            @include box-sizing();
            overflow-y: auto;
            overflow-x: hidden;
            height: 315px - 2px;
            width: 100%;
            padding: .5rem;
            outline: none;
            &:focus {
                @include box-shadow(0 0 0 1px $dark-green, 0 3px 3px rgba($dark-green, .1))
            }
            &>div{
                width: 100%;
            }
            img {
                display: inline-block;
                cursor: pointer;
                width: 20px;
                height: 20px;
                vertical-align: middle;
                @include background-size(20px auto);
            }
            a:not(.wait-del):link{
                color: #0000ff;
            }
            a:not(.wait-del):visited{
                color: #0000ff;
            }
            .mini-pro{
                padding-left: 14px;
                background: url('miniprogram-icon.png') no-repeat left top;
                background-size: 14px 14px;
                &.wait-del{
                    background: none;
                    padding-left: 0;
                }
            }
            .wait-del{
                color: $color-content;
                cursor: default;
            }
        }

        .text-editor-panel {
            position: relative;
            padding: 0 14px;
            line-height: 32px;
            border-top: 1px solid $border-color;
            @include clearfix();
            .btn-sm{
                margin-top: 4px;
            }
            .panel-notice{
                display: inline-block;
                max-width: 720px;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                margin-left: 5px;
                color: $color-light-content;
            }
        }

        .link-modal{
            .insert-type{
                label{
                    margin: 0 0 20px 130px;
                }
            }
            .icon {
                fill: currentColor;
                height: 14px;
                margin-left: 1px;
                vertical-align: middle;
                width: 14px;
            }
        }

        .hover-box{
            display: none;
            position: absolute;
            width: 300px;
            height: 34px;
            line-height: 32px;
            background-color: #ffffff;
            border: 1px solid $border-color;
            z-index: 1;
            span{
                display: inline-block;
                max-width: 200px;
                color: #169BD5;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
            .hover-btn{
                display: inline-block;
                float: right;
                color: #169BD5;
                padding: 0 5px;
            }
        }
    }
    .mini-program-select{
        .select-text{
            .select-icon{
                right: 10px;
            }
        }
    }
</style>
