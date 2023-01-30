<template>
    <div class="reply-rule">
        <div class="rule-box">
            <div class="rule-box-title" :title="send.ruleName" @click="isShowConFun">
                {{'autoReply.rule' | t}}{{index+1}}:&nbsp;&nbsp;&nbsp;{{send.ruleName}}
                <i class="up-down" :class="isShowCon ? 'down':'up'"></i>
            </div>
            <div class="rule-box-name" v-show="isShowCon">
                <div class="name">
                    <i class="icon-dot"></i>
                    {{'autoReply.ruleName' | t}}
                </div>
                <input type="text" v-model.trim="send.ruleName" maxlength="60"
                       :placeholder="$t('autoReply.max60characters')">
                <!--<div class="input-hint">规则名最多60个字</div>-->
            </div>
            <div class="rule-box-keyword" v-show="isShowCon">
                <div class="keyword">
                    <i class="icon-dot"></i>
                    {{'common.keyWord' | t}}
                </div>
                <span class="add-keyword" @click="addKeyword">{{'autoReply.addKeyword' | t}}</span>
            </div>
            <ul v-show="isShowCon">
                <li v-for="(keyword,index) in send.keyWordItems">
                    {{keyword}}
                    <div class="edit">
                        <span v-if="send.patterns[index] === 0" @click="updatePatterns(index,1)">{{'autoReply.notMatchAll' | t}}</span>
                        <span @click="updatePatterns(index,0)" v-else-if="send.patterns[index]===1">{{'autoReply.matchAll' | t}}</span>
                        <span class="icon icon-pencil" @click="editKeyword(keyword,index)"></span>
                        <span class="icon icon-delete" @click="deleteKey(index)"></span>
                    </div>
                </li>
            </ul>
            <!--<div class="rule-box-reply"  v-show="isShowCon">-->
            <!--<div class="reply">-->
            <!--<i class="icon-dot"></i>-->
            <!--回复-->
            <!--</div>-->
            <!---->
            <div class="rule-box-reply" v-show="isShowCon">
                <div class="reply" style="display: inline-block; vertical-align: middle;">
                    <i class="icon-dot"></i>
                    {{'autoReply.reply' | t}}
                </div>
                <div class="rule-box-material" style="display: inline-block; vertical-align: middle;"
                     v-show="isShowCon">
                    <div class="text" @click="chooseType('text', 'text')" v-title="$t('autoReply.text')">
                        <i></i>
                    </div>
                    <div class="img" @click="chooseType('img',1)" v-title="$t('autoReply.img')">
                        <i></i>
                    </div>
                    <div class="audio" @click="chooseType('audio',2)" v-title="$t('autoReply.audio')">
                        <i></i>
                    </div>
                    <div class="video" @click="chooseType('video',3)" v-title="$t('autoReply.video')">
                        <i></i>
                    </div>
                    <div class="imgText" @click="chooseType('imgText',5)" v-title="$t('autoReply.imageText')">
                        <i></i>
                    </div>
                    <div class="webPage" @click="chooseType('webPage',6)" v-title="$t('autoReply.webPage')">
                        <i></i>
                    </div>
                    <div class="toForm" @click="chooseType('toForm',7)" v-title="$t('autoReply.toForm')">
                        <i></i>
                    </div>
                    <div class="appletCard" @click="chooseType('appletCard',8)" v-title="$t('autoReply.appletCard')">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-xiaochengxu"></use>
                        </svg>
                    </div>
                    <div class="menu" @click="chooseType('menu',9)" v-title="$t('autoReply.menuMsg')">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-grid"></use>
                        </svg>
                    </div>
                </div>
                <div class="check" style="display: inline-block; vertical-align: middle;">
                    <checkbox v-model="checkbox"></checkbox>
                    {{'autoReply.replyAll' | t}}
                </div>
                <div class="showFont">
<!--                    <span>{{'QRCode.text' | t}} (<span>{{rule.keyWordContents.length}}</span>)</span>-->
                    <span>{{'QRCode.text' | t}} (<span>{{numberJumps(rule,'text')}}</span>)</span>
                    <span>{{'QRCode.pics' | t}} (<span>{{materialCounts[0]}}</span>)</span>
                    <span>{{'QRCode.audio' | t}} (<span>{{materialCounts[1]}}</span>)</span>
                    <span>{{'QRCode.video' | t}} (<span>{{materialCounts[2]}}</span>)</span>
                    <span>{{'QRCode.appMsg' | t}} (<span>{{materialCounts[3]}}</span>)</span>
                    <span>{{$t('autoReply.webPage')}}(<span>{{numberJumps(rule,6)}}</span>)</span>
                    <span>{{$t('autoReply.toForm')}}(<span>{{numberJumps(this.rule,7)}}</span>)</span>
                    <span>{{$t('autoReply.appletCard')}}(<span>{{numberJumps(rule,8)}}</span>)</span>
                    <span>{{$t('autoReply.menuMsg')}}(<span>{{numberJumps(rule,9)}}</span>)</span>
                </div>
                <!---->
            </div>
            <!---->
            <!--<div class="check">-->
            <!--<checkbox v-model="checkbox"></checkbox>-->
            <!--回复全部-->
            <!--</div>-->

            <!--<div class="rule-box-material"  v-show="isShowCon">-->
            <!--<div class="text" @click="chooseType('text')">-->
            <!--<i></i>-->
            <!--</div>-->
            <!--<div class="img" @click="chooseType('img')">-->
            <!--<i></i>-->
            <!--</div>-->
            <!--<div class="audio" @click="chooseType('audio')">-->
            <!--<i></i>-->
            <!--</div>-->
            <!--<div class="video" @click="chooseType('video')">-->
            <!--<i></i>-->
            <!--</div>-->
            <!--<div class="imgText" @click="chooseType('imgText')">-->
            <!--<i></i>-->
            <!--</div>-->
            <!--</div>-->
            <div class="rule-box-materialList" v-show="isShowCon">
                <div class="material" v-for="(cont, index) in send.pageEchoContent" :key="index" v-if="send.pageEchoContent.length>0">
                    <div class="material-text">
                        <div class="click-stop materialTextTag" id="materialTextTag" v-html="contHtml(cont)" @click.prevent></div>
                        <span class="icon icon-delete" @click="delText(index)"></span>
                    </div>
                </div>
                <div class="material" v-for="(material, index) in send.materialList" v-if="send.materialList.length>0">
                    <div class="material-wrapper">
                        <div class="material-img" v-if="material.type === 1">
                            <img :src="material.url" alt="">
                            <!--<span>图片</span>-->
                            <audio style="display: none" controls></audio>
                        </div>
                        <div class="appmsg-content" v-if="material.type === 5">
                            <div class="appmsg_info">
                                <em class="appmsg_date">{{material.updateDateString}}</em>
                            </div>
                            <div class="cover_appmsg_item">
                                <h4 class="appmsg_title">
                                    <a href="" target="_blank">{{material.title}}</a>
                                </h4>
                                <div class="appmsg_thumb_wrp">
                                    <img :src="material.thumbMediaUrl " alt="">
                                </div>
                                <!--<div class="appmsg_thumb_wrp" :style="{backgroundImage:'url(' + material.thumbMediaUrl + ')'}">-->
                                <!--</div>-->
                                <a :href="material.url" target="_blank" class="preview_mask">
                                    <div class="edit_mask_content">
                                        <p class="">
                                            {{'common.preview' | t}}
                                        </p>
                                    </div>
                                    <span class="vm_box"></span>
                                </a>
                            </div>
                            <div class="appmsg_item has_cover" v-for="child in material.materialItems">
                                <div class="appmsg_thumb_wrp" :style="{backgroundImage:'url(' + child.thumbMediaUrl + ')'}">

                                </div>
                                <h4 class="appmsg_title js_title">
                                    <a href="" target="_blank" data-msgid="100000016" data-idx="1">{{child.title}}</a>
                                </h4>
                                <a :href="child.url" target="_blank" class="edit_mask preview_mask">
                                    <div class="edit_mask_content">
                                        <p class="">{{'common.preview' | t}}</p>
                                    </div>
                                    <span class="vm_box"></span>
                                </a>
                            </div>
                            <audio style="display: none" controls></audio>
                        </div>
                        <div class="material-audio" v-if="material.type === 2">
                            <div class="content">
                                <img src="../images/icon_audio.gif"
                                     v-if="playId === material.id"
                                     @click="pauseAudio(index)"
                                     alt="">
                                <img src="../images/audio.png"
                                     @click="playAudio(index,material.id)"
                                     alt="" v-else>
                                <audio :src="material.url" style="display: none" controls @ended="endedAudio()"></audio>
                                <div class="info">
                                    <div class="title">{{material.name}}</div>
                                    <div class="date">{{material.updateDateString}}</div>
                                </div>
                            </div>
                        </div>
                        <div class="material-video" v-if="material.type === 3">
                            <div class="name">{{material.name}}</div>
                            <div class="date">{{material.updateDateString}}</div>
                            <video :src="material.url" controls></video>
                            <audio style="display: none"></audio>
                        </div>
                        <span class="icon icon-delete" @click="delMaterial(index)"></span>
                    </div>

                </div>
                <div class="material" v-for="(material, index) in send.keyWordContents" v-if="send.keyWordContents.length>0">
                    <div class="material-wrapper">
                        <!--外部页-->
                        <div class="material-webPage" v-if="material.sendType===6 || material.type===6" :title="material.exUrl || material.externalUrl">
                            <h3>{{material.exTitle || material.externalTitle}}</h3>
                            <div class="material-image">
                                <span>{{material.exDescribe || material.externalDescription}}</span>
                                <img :src="material.url || material.externalImageUrl">
                            </div>
                        </div>
                        <!--跳转表单-->
                        <div class="reply-list" v-if="material.sendType===7 || material.type===7" @click.prevent>
                            <div v-if="material.formReplyType==='sheet'">
                                <div class="click-stop" v-if="material.content || material.sheetContent" :title="material.formName"
                                     v-html="materialContent(decodeURIComponent(material.content || material.sheetContent))">
                                </div>
                                <div v-else :title="material.formName">
                                    <a>{{material.formName}}</a>
                                </div>
                            </div>
                            <div class="material-webPage" v-if="material.formReplyType==='external'"
                                 :title="material.formName">
                                <h3>{{material.externalTitle}}</h3>
                                <div class="material-image">
                                    <span>{{material.externalDescription}}</span>
                                    <img :src="material.externalImageUrl">
                                </div>
                            </div>
                        </div>
                        <!--小程序卡片-->
                        <div class="reply-list" v-if="material.sendType===8 || material.type===8" :title="material.pagePath">
                            <a>{{material.miniprogramTitle}}</a>
                        </div>
                        <!-- 菜单-->
                        <div class="reply-list wide-box" v-if="material.sendType===9 || material.type===9">
                            <p>{{material.menuMessage.headContent}}</p>
                            <p class="font-blue" v-for="(item,x) in material.menuMessage.options" :key="x">
                                {{item.content}}
                                <template v-if="isPallUser && groupList">
                                <!-- Pall中国用户，且正确获取了标签分组列表 -->
                                    <template v-if="groupList.$getByKey(item.groupId)">
                                        <!-- 分组数据正常回显 -->
                                        <span class="font-group">
                                            <!-- 分组名 -->
                                            {{ groupList.$getByKey(item.groupId).name }}
                                        </span>
                                        <span v-if="groupList.$getByKey(item.groupId).labelList.$getByKey(item.labelId)"
                                            class="font-label">
                                            <!-- 分组下的标签正常回显 -->
                                            {{groupList.$getByKey(item.groupId).labelList.$getByKey(item.labelId).name}}
                                        </span>
                                        <!-- 标签数据失效 -->
                                        <span v-else class="invalid-tips">{{ $t('massSend.invalidLabel') }}</span>
                                    </template>
                                    <!-- 分组数据失效 -->
                                    <template v-else>
                                        <span class="invalid-tips">{{ $t('massSend.invalidGroup') }}</span>
                                        <span class="invalid-tips">{{ $t('massSend.invalidLabel') }}</span>
                                    </template>
                                </template>
                            </p>
                            <p>{{material.menuMessage.tailContent}}</p>
                        </div>
                        <span class="icon icon-delete" @click="delKeyWordContents(index, material)"></span>
                    </div>
                </div>
            </div>
            <div class="rule-box-bottom" v-show="isShowCon">

                <div class="btn-2">
                    <div class="btn btn-md btn-white" @click="delRule" :disabled="$has('wechat_message_delete_word')">{{'common.del' | t}}</div>
                    <div class="btn btn-md btn-theme addStyle" @click="saveRule" :disabled="$has('wechat_reply_antistop_reply')">{{'common.save' | t}}</div>
                </div>
            </div>
            <div class="rule-box-info" v-show="isShowCon === false">
                <div class="keywords">
                    <span class="title">{{'common.keyWord' | t}}</span>
                    <span class="words" v-for="value in send.keyWordItems">{{value}}</span>
                </div>
                <div class="reply-count">
                    <span class="title">{{'autoReply.reply' | t}}</span>
<!--                    <span>{{'QRCode.text' | t}} <span class="table-color">({{rule.keyWordContents.length}})</span></span>-->
                    <span>{{'QRCode.text' | t}} <span class="theme-color">({{numberJumps(rule,'text')}})</span></span>
                    <span>{{'QRCode.pics' | t}} <span class="theme-color">({{materialCounts[0]}})</span></span>
                    <span>{{'QRCode.audio' | t}} <span class="theme-color">({{materialCounts[1]}})</span></span>
                    <span>{{'QRCode.video' | t}} <span class="theme-color">({{materialCounts[2]}})</span></span>
                    <span>{{'QRCode.appMsg' | t}} <span class="theme-color">({{materialCounts[3]}})</span></span>
                    <span>{{$t('autoReply.webPage')}}<span class="theme-color">({{numberJumps(rule,6)}})</span></span>
                    <span>{{$t('autoReply.toForm')}}<span class="theme-color">({{numberJumps(this.rule,7)}})</span></span>
                    <span>{{$t('autoReply.appletCard')}}<span class="theme-color">({{numberJumps(rule,8)}})</span></span>
                    <span>{{$t('autoReply.menuMsg')}}<span class="theme-color">({{numberJumps(rule,9)}})</span></span>
                </div>
                <div class="allreply" v-if="false"></div>
            </div>
        </div>
        <confirm v-if="editKey" @cancel="cancelEditKeyword" @confirm="sureEditKeyword">
            <div class="form-field">
                <label class="label" for="editKeyword">{{'autoReply.editKeyword' | t}}</label>
                <input class="input" type="text" v-model.trim="editKeywordValue" id="editKeyword" maxlength="16"
                       :placeholder="$t('autoReply.max16characters')">
            </div>
        </confirm>
        <confirm v-if="addKey" @cancel="cancel" @confirm="showKeyword">
            <div class="form-field">
                <label class="label" for="addKeyword">{{'autoReply.addKeyword' | t}}</label>
                <input class="input" v-model.trim="addRuleCon.inputKeywordValue" maxlength="16" type="text"
                       id="addKeyword"
                       :placeholder="$t('autoReply.max16characters')" @keydown.enter.prevent="textEnter">
            </div>
            <div class="form-field">
                <span class="keyword-value" v-for="(value,index) in addRuleCon.inputKeywordList">
                    {{value}}
                    <span class="icon icon-close" @click="delInputKeyword(index)"></span>
                </span>
            </div>
        </confirm>
        <!--文字-->
        <modal :title="$t('autoReply.addText')" v-if="currentMaterialType === 'text'" @close="cancel" size="lg">
            <div class="text-box">
                <material-text ref="materialText" :material="replyMaterial" :isModal="true" @input="updateTextContent($event)"></material-text>
            </div>
            <div class="opt-btn">
                <button class="btn btn-white" @click="cancel">{{$t('common.cancel')}}</button>
                <button class="btn btn-theme" @click="chooseFinish(replyMaterial)">{{$t('common.confirm')}}</button>
            </div>
        </modal>
        <image-text-lib v-if="currentMaterialType === 'imgText'" @choose="chooseFinish" :no-sub-materials="true" @cancel="cancel1"/>
        <image-lib v-if="currentMaterialType === 'img'" @choose="chooseFinish" @cancel="cancel1"/>
        <audio-lib v-if="currentMaterialType === 'audio'" @choose="chooseFinish" @cancel="cancel1"/>
        <video-lib v-if="currentMaterialType === 'video'" @choose="chooseFinish" @cancel="cancel1"/>
        <!-- 外部页 -->
        <modal :title="$t('autoReply.addWebPage')" v-if="currentMaterialType === 'webPage'" size="lg"
               @close="currentMaterialType=''">
            <div class="text-box">
                <material-out ref="materialOut" :material="replyMaterial" @change="updateOut($event)"></material-out>
            </div>
            <div class="opt-btn">
                <button class="btn btn-white" @click="currentMaterialType=''">{{$t('common.cancel')}}</button>
                <button class="btn btn-theme" @click="chooseFinish(replyMaterial)">{{$t('common.confirm')}}</button>
            </div>
        </modal>
        <!--跳转表单 -->
        <modal :title="$t('autoReply.addForm')" v-if="currentMaterialType === 'toForm'" @close="currentMaterialType=''" size="lg">
            <div class="text-box">
                <material-form ref="materialForm" :material="replyMaterial" @change="updateForm($event)"></material-form>
            </div>
            <div class="opt-btn">
                <button class="btn btn-white" @click="currentMaterialType=''">{{$t('common.cancel')}}</button>
                <button class="btn btn-theme" @click="chooseFinish(replyMaterial)">{{$t('common.confirm')}}</button>
            </div>
        </modal>
        <!-- 小程序卡片 -->
        <modal :title="$t('autoReply.addCard')" v-if="currentMaterialType === 'appletCard'" size="lg"
               @close="currentMaterialType=''">
            <div class="text-box">
                <material-mini ref="materialMini" :material="replyMaterial" @change="updateMini($event)"></material-mini>
            </div>
            <div class="opt-btn">
                <button class="btn btn-white" @click="currentMaterialType=''">{{$t('common.cancel')}}</button>
                <button class="btn btn-theme" @click="chooseFinish(replyMaterial)">{{$t('common.confirm')}}</button>
            </div>
        </modal>
        <!-- 菜单回复 -->
        <modal :title="$t('autoReply.addMenu')" v-if="currentMaterialType==='menu'" size="lg"
               @close="currentMaterialType=''">
            <div class="text-box">
                <material-menu ref="materialMenu" :material="replyMaterial"/>
            </div>
            <div class="opt-btn">
                <button class="btn btn-white" @click="currentMaterialType=''">{{$t('common.cancel')}}</button>
                <button class="btn btn-theme" @click="chooseFinish(replyMaterial)">{{$t('common.confirm')}}</button>
            </div>
        </modal>
    </div>
</template>
<script type="text/babel">

    import { WechatApiV1 } from '@/api';
    import ImageTextLib from '../material-libs/image-text-lib.vue';
    import ImageLib from '../material-libs/image-lib.vue';
    import AudioLib from '../material-libs/audio-lib.vue';
    import VideoLib from '../material-libs/video-lib.vue';
    import MaterialText from '../material/material-editor-componets/material-text.vue';
    import MaterialOut from '../material/material-editor-componets/material-out.vue';
    import MaterialForm from '../material/material-editor-componets/material-form.vue';
    import MaterialMini from '../material/material-editor-componets/material-miniprogram.vue';
    import MaterialMenu from '../material/material-editor-componets/material-menu.vue';
    import $ from 'jquery';

    import {logError} from '../../monitor.js';
    import {trackEvent} from '../../monitor';
    import { mapGetters } from 'vuex';
    export default {
        components: {
            ImageTextLib,
            ImageLib,
            AudioLib,
            VideoLib,
            MaterialText,
            MaterialOut,
            MaterialForm,
            MaterialMini,
            MaterialMenu
        },
        props: {
            rule: {
                type: Object
            },
            index: {
                type: Number
            },
            // Pall中国限定，标签分组列表
            groupList: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                isRepeat: false,    // 是否重复提交
                // 需要发送的数据
                send: {
                    id: '', // 规则Id
                    keyWordItems: [],   // 关键字数组
                    content: [],        // 文字回复
                    pageEchoContent:[], //文字回复 用于文字处理后页面回显
                    materialList: [],   // 素材数组
                    patterns: [],       // 匹配模式数组
                    recoilType: 0,      // 是否全部回复
                    ruleName: '',        // 素材名称
                    keyWordContentIds: [], //【表单/外部页/小程序卡片/菜单消息】回复内容id列表
                    keyWordContents:[],//关键词回复内容列表（文字内容、外部页、跳转表单、小程序卡片、菜单消息）
                },
                checkbox: false,        // 回复全部
                currentMaterialType:'',// 选中的素材类型

                isShowCon: false,       // 是否显示内容
                addKey: false,          // 是否显示输入框
                editKey: false,         // 修改关键字弹窗显隐
                // 添加关键词时的内容
                addRuleCon: {
                    inputKeywordValue: '',
                    inputKeywordList: []
                },
                textareaValue: '',      // 文字 的value
                replyMaterial:{}, //回复material
                // 选中的素材
                materialImgText: '',
                showMaterialImgText: false,
                materialImg: '',
                showMaterialImg: false,
                materialAudio: '',
                showMaterialAudio: false,
                materialVideo: '',
                showMaterialVideo: false,

                editKeywordValue: '', // 编辑关键字
                editKeywordIndex: '', // 编辑关键字下标
                playId: '' // 音频 ID
            };
        },
        watch: {},
        mounted() {
            this.getRuleData();
        },

        computed: {
            ...mapGetters([
                'isPallUser',
            ]),
            //【图片 音频 视频 图文】
            materialCounts() {
                return this.rule.materials
                    .map(material => material.type)
                    // [2, 4, 1, 3]
                    .reduce((counts, type) => {
                        if (type === 5) {
                            counts[3]++;
                        } else {
                            counts[type - 1]++;
                        }
                        return counts;
                    }, [0, 0, 0, 0]);
            },
        },
        methods: {
            //回复内容为文字 文字内容处理
            contHtml(cont) {
                let firstHtml = '<div>' + cont + '</div>';
                let content = $(firstHtml);
                if (content.find('a').length > 0) {
                    content.find('a').each((index,ele) => {
                        let appPath = $(ele).attr('data-miniprogram-path') || $(ele).attr('href');
                        $(ele).attr({'title': appPath});
                    });
                    return content.html();
                }
                return cont;
            },
            //判断关键字规则中 文字/外部页/小程序卡片/菜单/跳转表单个数
            numberJumps(rule, typeIsCount) {
                let count = '';
                let arr = [];
                switch (typeIsCount) {
                    case 'text':
                        arr = rule.keyWordContents.filter(item => item.content);
                        count = arr.length;
                        break;
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                        arr = rule.keyWordContents.filter(item =>
                            item.sendType === typeIsCount || item.type === typeIsCount);
                        count = arr.length;
                        break;
                }
                return count;
            },
            //获取规则数据
            getRuleData() {
                this.send.id = this.rule.id;
                this.send.ruleName = this.rule.ruleName;
                this.send.recoilType = this.rule.recoilType;
                this.rule.keyWordContents.forEach((element, index) => {
                    this.contentProcess(element, index);
                });
                this.rule.keyWordItems.forEach((element, index) => {
                    this.send.keyWordItems.splice(index, 1, element.name);
                    this.send.patterns.splice(index, 1, element.patterns);
                });
                this.rule.materials.forEach((element, index) => {
                    this.send.materialList.splice(index, 1, element);
                });
                this.checkbox = this.send.recoilType === 1;
            },
            //回复内容处理 【针对文字 外部页 跳转表单 小程序卡片 菜单】
            contentProcess(element, index) {
                if (element.content) this.send.pageEchoContent.splice(index, 1, element.content);
                if (element.sendType) this.send.keyWordContents.splice(index, 1, element);
                if (element.content) this.send.content.splice(index, 1, element.content);
                if (element.sendType &&
                    (element.sendType === 7 || element.sendType === 8
                        || element.sendType === 9 || element.sendType === 6)) {
                    this.send.keyWordContentIds.splice(index, 1, element.id);
                }
            },
            // 播放语音
            playAudio(index, id) {
                this.playId = id;
                let audio = document.querySelectorAll('audio');
                audio.forEach(function (element) {
                    element.currentTime = 0;
                    element.pause();
                });
                audio[index].play();
            },
            // 暂停语音
            pauseAudio(index) {
                this.playId = '';
                let audio = document.querySelectorAll('audio');
                audio[index].pause();
            },
            endedAudio() {
                this.playId = '';
            },


            // 选择素材
            chooseType(type, tab) {
                this.replyMaterial = {
                    content: '',
                    id: null,
                    type: tab,
                    exUrl: '',
                    exTitle: '',
                    exDescribe: '',
                    formReplyType: 'sheet',
                    miniprogramTitle: '',
                    miniprogramAppid: '',
                    pagePath: '',
                    // 微信菜单消息属性
                    menuMessage: {
                        headContent: '',
                        tailContent: '',
                        options: [
                            { content: '' }
                        ]
                    },
                    typeId:'',
                    miniprogramId:''
                };
                let maxLength = this.send.materialList.length + this.send.content.length + this.send.keyWordContents.length;
                if (maxLength >= 5) {
                    this.$toast(this.$t('autoReply.max5replies'), 'warn');
                    return false;
                }
                this.currentMaterialType = type;
            },

            // 确认选择素材
            chooseFinish(material) {
                switch (material.type) {
                    case 'text':
                        if (!this.$refs.materialText.valid()) return;
                        break;
                    case 1:
                    case 2:
                    case 3:
                        if (!material.id) {
                            this.$toast(this.$t('autoReply.contentEmptyError'), 'warn');
                            return;
                        }
                        break;
                    case 6:
                        if (!this.$refs.materialOut.valid()) return;
                        if (!this.$refs.materialOut.validTitle()) return;
                        if (!this.$refs.materialOut.validCoverMaterial()) return;
                        break;
                    case 7:
                        if (material.formReplyType === 'external') {
                            if (!this.$refs.materialForm.validFormTitle()) return;
                            if (!this.$refs.materialForm.validFormMaterial()) return;
                        }
                        if (material.formReplyType === 'sheet') {
                            if (!material.id) {
                                this.$toast(this.$t('QRCode.validForm'),'warn');
                                return false;
                            }
                        }
                        break;
                    // 回复类型为小程序卡片时，校验标题、appid、小程序路径、素材封面
                    case 8:
                        if (this.replyMaterial.miniprogramId === 0) {
                            if (!this.$refs.materialMini.validTitle()) return;
                            if (!this.$refs.materialMini.validAppid()) return;
                            if (!this.$refs.materialMini.validCover()) return;
                            if (!this.$refs.materialMini.validPagePath()) return;
                        } else {
                            if (!this.$refs.materialMini.validMiniprogram()) return;
                            if (!this.$refs.materialMini.validTitle()) return;
                            if (!this.$refs.materialMini.validCover()) return;
                        }
                        
                        break;
                    // 新增回复类型：菜单消息
                    case 9:
                        if (!this.$refs.materialMenu.valid()) return;
                        break;
                }
                switch (this.currentMaterialType) {
                    case 'text':
                        this.acceptKeywordReply(material);
                        break;
                    case 'img':
                        this.materialImg = material;
                        this.send.materialList.push(this.materialImg);
                        break;
                    case 'audio':
                        this.materialAudio = material;
                        this.send.materialList.push(this.materialAudio);
                        break;
                    case 'video':
                        this.materialVideo = material;
                        this.send.materialList.push(this.materialVideo);
                        break;
                    case 'imgText':
                        this.materialImgText = material;
                        this.send.materialList.push(this.materialImgText);
                        break;
                    case 'webPage':
                    case 'toForm':
                    case 'appletCard':
                    case 'menu':
                        this.send.keyWordContents.push(this.replyMaterial);
                        this.saveKeywordContent();
                        break;
                    default :
                        logError(`[自动回复] <rule /> chooseFinish 无法识别的素材类型`);
                        console.error('未识别的素材类型');
                        break;
                }
                this.currentMaterialType = '';
            },
            // 取消选择素材时
            cancel1() {
                this.currentMaterialType = '';
                this.addKey = false;
            },

            isShowConFun() {
                this.isShowCon = !this.isShowCon;
            },
            // 添加关键字
            addKeyword() {
                if (this.$has('wechat_message_add_keyword')) return;
                this.addKey = true;
            },
            // 删除关键字
            deleteKey(index) {
                this.send.keyWordItems.splice(index, 1);
                this.send.keyWordContentIds.splice(index, 1);
                this.send.patterns.splice(index, 1);
            },
            // 修改匹配模式
            updatePatterns(index, value) {
                this.send.patterns.splice(index, 1, value);
            },

            // 输入框中按回车添加关键字
            textEnter() {
                if (this.addRuleCon.inputKeywordValue.length > 16) {
                    return false;
                }
                if (this.addRuleCon.inputKeywordValue.trim().length === 0) {
                    this.addRuleCon.inputKeywordValue = '';
                    this.$toast(this.$t('autoReply.keywordEmptyError'), 'warn');
                    return false;
                }
                if ((this.addRuleCon.inputKeywordList.length + this.send.keyWordItems.length) >= 10) {
                    this.$toast(this.$t('autoReply.max10characters'), 'warn');
                    this.addRuleCon.inputKeywordValue = '';
                    return false;
                }
                this.addRuleCon.inputKeywordList.push(this.addRuleCon.inputKeywordValue.trim());
                this.addRuleCon.inputKeywordValue = '';
            },
            // 添加关键字 确定按钮
            showKeyword() {
                if (this.addRuleCon.inputKeywordValue.length > 16) {
                    return false;
                }
                if (this.addRuleCon.inputKeywordValue.trim().length !== 0) {
                    this.addRuleCon.inputKeywordList.push(this.addRuleCon.inputKeywordValue);
                }
                if ((this.addRuleCon.inputKeywordList.length + this.send.keyWordItems.length) > 10) {
                    this.$toast(this.$t('autoReply.max10characters'), 'warn');
                    this.addRuleCon.inputKeywordValue = '';
                    return false;
                }

                this.send.keyWordItems = this.send.keyWordItems.concat(this.addRuleCon.inputKeywordList);
                for (let i = 0; i < this.send.keyWordItems.length; i++) {
                    if (this.send.patterns[i] !== 1) {
                        this.send.patterns.splice(i, 1, 0);
                    }

                }
                this.addRuleCon.inputKeywordList.splice(0);
                this.showkey = true;
                this.addKey = false;
                this.addRuleCon.inputKeywordValue = '';
            },
            // 编辑关键字
            editKeyword(value, index) {
                this.editKey = true;
                this.editKeywordValue = value;
                this.editKeywordIndex = index;
            },
            // 编辑确定
            sureEditKeyword() {
                if (this.editKeywordValue.trim().length === 0) {
                    this.$toast(this.$t('autoReply.keywordEmptyError'), 'warn');
                    this.editKeywordValue = '';
                    return false;
                }
                if (this.editKeywordValue.length > 16) {
                    return false;
                }
                this.send.keyWordItems[this.editKeywordIndex] = this.editKeywordValue;
                this.send.keyWordItems.splice(this.editKeywordIndex, 1, this.editKeywordValue);
                this.editKey = false;
            },
            // 编辑取消
            cancelEditKeyword() {
                this.editKey = false;
            },

            // 删除输入时添加的关键字
            delInputKeyword(index) {
                this.addRuleCon.inputKeywordList.splice(index, 1);
            },
            //文字回复
            acceptKeywordReply(material) {
                this.send.content.push(material.content);
                this.textareaValue = material.content;
                if (this.textareaValue.trim() === '') {
                    this.$toast(this.$t('autoReply.replyEmptyError'), 'warn');
                    return false;
                }
                this.currentMaterialType = '';
                this.send.pageEchoContent.push(this.textareaValue);
                this.textareaValue = '';
            },

            // 删除回复文字
            delText(index) {
                this.send.content.splice(index, 1);
                this.send.pageEchoContent.splice(index, 1);
            },
            // 删除回复素材
            delMaterial(index) {
                this.send.materialList.splice(index, 1);
            },
            //删除【外部页、小程序卡片、跳转表单、菜单】
            delKeyWordContents(index, material) {
                if (material.sendType > 5 || material.type > 5) {
                    //外部页 跳转表单 小程序卡片 菜单消息
                    let currentId = material.typeId || material.id;
                    WechatApiV1
                        .delMenuMsg(currentId)
                        .then(() => {
                            let x = this.send.keyWordContentIds.indexOf(currentId);
                            if (x) {
                                this.send.keyWordContentIds.splice(x,1);
                            }
                        });
                }
                this.send.keyWordContents.splice(index, 1);
            },
            // 取消输入时
            cancel() {
                this.addRuleCon.inputKeywordList.splice(0);
                this.addRuleCon.inputKeywordValue = '';
                this.currentMaterialType = '';
                this.addKey = false;
            },
            //保存单个关键字回复内容 -【2.5.7新增接口，只针对于添加外部页、表单、小程序卡片、菜单消息类型】
            saveKeywordContent() {
                let replyObj = {
                    sendType: this.replyMaterial.type,
                    externalTitle: this.replyMaterial.exTitle || this.replyMaterial.externalTitle || '',
                    externalImageUrl: this.replyMaterial.url || this.replyMaterial.externalImageUrl || '',
                    externalUrl: this.replyMaterial.exUrl || this.replyMaterial.customSheetUrl || this.replyMaterial.sheetUrl || '',
                    externalDescription: this.replyMaterial.exDescribe || this.replyMaterial.externalDescription || '',
                    formReplyType: this.replyMaterial.formReplyType,
                    sheetContent: this.replyMaterial.content,
                    sheetUrl: this.replyMaterial.formReplyType === 'sheet' && this.replyMaterial.content === '' ? this.replyMaterial.sheetUrl : '',
                    sheetId:  this.replyMaterial.id,
                    extensionValueId: this.replyMaterial.extensionValueId || '',
                    formName:this.replyMaterial.formName || '',
                    extensionName:this.replyMaterial.extensionName || '',
                    materialMediaId: this.replyMaterial.mediaId || '',
                    pagePath: this.replyMaterial.pagePath || '',
                    miniprogramAppid: this.replyMaterial.miniprogramAppid || '',
                    miniprogramTitle: this.replyMaterial.miniprogramTitle || '',
                    menuMessage: this.replyMaterial.menuMessage || {headContent: '', tailContent: '', options: [{ content: '' }]},
                    miniprogramId:this.replyMaterial.miniprogramId,
                };
                WechatApiV1
                    .saveKeywordContent(replyObj)
                    .then((res) => {
                        this.send.keyWordContentIds.push(res.body.data.keyWordContent.id);
                        this.replyMaterial.typeId = res.body.data.keyWordContent.id;
                        this.replyMaterial = {};
                    });
                this.currentMaterialType = '';
            },
            // 保存时
            saveRule() {
                if (this.$has('wechat_reply_antistop_reply')) return;
                if (this.isRepeat) {
                    return false;
                }
                if (this.send.ruleName === '') {
                    this.$toast(this.$t('autoReply.ruleNameEmptyError'), 'warn');
                    return false;
                }
                if (this.send.keyWordItems.length === 0) {
                    this.$toast(this.$t('autoReply.keywordEmptyErrors'), 'warn');
                    return false;
                }
                if (this.send.materialList.length === 0 && this.send.content.length === 0
                    && this.send.keyWordContents.length === 0) {
                    this.$toast(this.$t('autoReply.replyEmptyErrors'), 'warn');
                    return false;
                }
                let maxLength = this.send.materialList.length + this.send.content.length + this.send.keyWordContents.length;
                if (maxLength > 5) {
                    this.$toast(this.$t('autoReply.max5replies'), 'warn');
                    return false;
                }
                this.isRepeat = true;
                if (this.checkbox) {
                    this.send.recoilType = 1;
                } else {
                    this.send.recoilType = 0;
                }
                const materialIds = this.send.materialList.map(material => {
                    let type = material.type || material.sendType;
                    if (type !== 6 && type !== 7
                        && type !== 8 && type !== 9) {
                        return material.id;
                    }
                });
                WechatApiV1
                    .updateKeywordReply(
                        this.send.id,
                        this.send.content,
                        this.send.keyWordItems,
                        materialIds,
                        this.send.patterns,
                        this.send.ruleName,
                        this.send.recoilType,
                        this.send.keyWordContentIds
                    )
                    .then((res) => {
                        this.$toast(res.body.message, 'success');
                        this.isRepeat = false;
                        this.isShowCon = false;
                        this.$emit('updateSaveRule');
                        trackEvent('微信管理-关键字回复-修改关键字列表');
                    });
            },
            // 删除规则
            delRule() {
                if (this.$has('wechat_message_delete_word')) return;
                this.$confirm(this.$t('common.del'), this.$t('autoReply.delRule'))
                    .then((sure) => {
                        if (sure) {
                            WechatApiV1
                                .delKeywordReply(this.send.id)
                                .then((res) => {
                                    this.$toast(res.body.message, 'success');
                                    this.isShowCon = false;
                                    this.$emit('deleteRule');
                                    trackEvent('微信管理-关键字回复-删除关键字列表');
                                });
                        }
                    });
            },
            // 回复文字
            updateTextContent(text) {
                let textData = {type: 'text', content: text, exUrl: '', exTitle: '', exDescribe: ''};
                this.replyMaterial = Object.assign({}, this.replyMaterial, textData);
            },
            // 回复外部页
            updateOut(material) {
                let outData = Object.assign({}, material, { type: 6 });
                this.replyMaterial = Object.assign({}, this.replyMaterial, outData);
            },
            // 回复表单
            updateForm(material) {
                let formData = Object.assign({}, material, { type: 7 });
                this.replyMaterial = Object.assign({}, this.replyMaterial, formData);
            },
            // 回复小程序卡片
            updateMini(material) {
                let miniData = Object.assign({}, material, { type: 8 });
                this.replyMaterial = Object.assign({}, this.replyMaterial, miniData);
            },
            //回复类型：跳转表单 回复内容
            materialContent(html) {
                return '<div>' + html + '</div>';
            },
        },

    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .reply-rule {
        .words {
            background-color: #0cc2a9 !important;
            border-radius: 10px;
            color: white;
        }

        .title {
            width: 140px;
            @include ellipsis();
        }
        .opt-btn{
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
        }
    }
</style>
