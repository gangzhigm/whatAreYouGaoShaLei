<template>
    <div class="function-reply">
        <div class="content-view">
            <crumbs></crumbs>
            <public-account/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1> {{'home.reply' | t}} </h1>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view padding margin white-bg reply-container">
                <ul class="new-list">
                    <!-- 被关注自动回复 -->
                    <li class="one" @click="firstKey" :class="{active: oneReply}">
                        <span>{{'autoReply.followedReply' | t}} &nbsp;<i class="icon icon-caret-down"></i></span>
                    </li>
                    <transition name="drop">
                        <div v-if="oneReply" class="follow-reply">
                            <div class="form-field">
                                <!--0不回复；1图片；2语音；3视频；5图文；'text'文本；6链接（外部页）；7表单；8小程序卡片；9：菜单-->
                                <material-editor ref="followedEditor" :types="[5, 'text', 1, 2, 3, 6, 7, 8, 9]" :isModal="true"
                                                 v-model="material" :no-sub-materials="true"></material-editor>
                            </div>
                            <div class="form-field">
                                <button type="button" class="btn btn-theme btn-md"
                                        id="wechat_reply_sub_reply"
                                        :disabled="$has('wechat_reply_sub_reply')"
                                        @click="saveFocusedReply">{{'common.save' | t}}</button>
                                <button type="button" class="btn btn-md btn-white"
                                        id="wechat_message_delete_sub"
                                        :disabled="$has('wechat_message_delete_sub')"
                                        @click="delFollowed"
                                        v-if="concernReplyId!==''">{{'common.del' | t}}
                                </button>
                            </div>
                        </div>
                    </transition>
                    <!-- 消息自动回复 -->
                    <li class="one" @click="two" :class="{active: twoReply}">
                        <span>{{'autoReply.messageReply' | t}} &nbsp;<i class="icon icon-caret-down"></i></span>
                    </li>
                    <transition name="drop">
                        <div class="msg-reply" v-if="twoReply">
                            <div class="form-field">
                                <!-- Pall中国限定 自动回复 无【菜单消息】 -->
                                <material-editor ref="autoEditor" v-model="selfMaterial" :isModal="true"
                                    :types="isPallUser ? [5, 'text', 1, 2, 3, 6, 7, 8] : [5, 'text', 1, 2, 3, 6, 7, 8, 9]"
                                    :no-sub-materials="true" />
                            </div>
                            <div class="form-field">
                                <button type="button" class="btn btn-theme btn-md"
                                        id="wechat_reply_auto_reply"
                                        :disabled="$has('wechat_reply_auto_reply')"
                                        @click="saveAutoReply">{{'common.save' | t}}</button>
                                <button type="button" class="btn btn-md btn-white"
                                        id="wechat_message_delete_auto"
                                        :disabled="$has('wechat_message_delete_auto')"
                                        @click="deleteTwo"
                                        v-if="this.automaticReplyId!==''">{{'common.del' | t}}
                                </button>
                            </div>
                        </div>
                    </transition>
                    <!-- 关键字回复 -->
                    <li class="one" @click="three" :class="{active: keyWorldReply}">
                        <span>
                            {{'autoReply.KeyReply' | t}} &nbsp;<i class="icon icon-caret-down"></i>
                        </span>
                    </li>
                    <transition name="drop">
                        <div class="keywords-reply" v-show="keyWorldReply">
                            <div class="form-field">
                                <button type="button" class="btn btn-md btn-theme icon icon-plus"
                                        id="wechat_message_add_rule"
                                        :disabled="$has('wechat_message_add_rule')"
                                        @click="addRule">
                                    {{'autoReply.addNewRule' | t}}
                                </button>
                                <div class="rule-box" v-if="isAdd">
                                    <div class="rule-box-title" @click="isShowConFun">
                                        {{'autoReply.newRule' | t}} <i class="up-down" :class="isShowCon ? 'down':'up'"></i>
                                    </div>
                                    <div class="rule-box-name" v-show="isShowCon">
                                        <div class="name"><i class="icon-dot"></i> {{'autoReply.ruleName' | t}}</div>
                                        <input class="input" type="text" v-model.trim="newRule.name" maxlength="60"
                                               :placeholder="$t('autoReply.max60characters')">
                                    </div>
                                    <div class="rule-box-keyword" v-show="isShowCon">
                                        <div class="keyword"><i class="icon-dot"></i> {{'common.keyWord' | t}}</div>
                                        <button class="btn add-keyword" id="wechat_message_add_keyword" :disabled="$has('wechat_message_add_keyword')" @click="addKeyword">{{'autoReply.addKeyword' | t}}</button>
                                    </div>
                                    <ul v-show="showKey && isShowCon">
                                        <li v-for="(keyword,index) in newRule.keywordList">
                                            {{keyword}}
                                            <div class="edit">
                                                <span v-if="newRule.patterns[index] === 0"
                                                      @click="updatePatterns(index,1)">{{'autoReply.notMatchAll' | t}}</span>
                                                <span @click="updatePatterns(index,0)"
                                                      v-else-if="newRule.patterns[index] === 1">{{'autoReply.matchAll' | t}}</span>
                                                <span class="icon icon-pencil"
                                                      @click="editKeyword(keyword,index)"></span>
                                                <span class="icon icon-delete" @click="deleteKey(index)"></span>
                                            </div>
                                        </li>
                                    </ul>
                                    <div class="rule-box-reply" v-show="isShowCon">
                                        <div class="reply"
                                             style="display: inline-block; vertical-align: middle;">
                                            <i class="icon-dot"></i>
                                            {{'autoReply.reply' | t}}
                                        </div>
                                        <div class="rule-box-material"
                                             style="display: inline-block; vertical-align: middle;"
                                             v-show="isShowCon">
                                            <div class="text" @click="chooseType('text','text')" v-title="$t('autoReply.text')">
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
                                            <span>{{'QRCode.text' | t}} (<span>0</span>)</span>
                                            <span>{{'QRCode.pics' | t}} (<span>0</span>)</span>
                                            <span>{{'QRCode.audio' | t}} (<span>0</span>)</span>
                                            <span>{{'QRCode.video' | t}} (<span>0</span>)</span>
                                            <span>{{'QRCode.appMsg' | t}} (<span>0</span>)</span>
                                            <span>{{$t('autoReply.webPage')}}(<span>0</span>)</span>
                                            <span>{{$t('autoReply.toForm')}}(<span>0</span>)</span>
                                            <span>{{$t('autoReply.appletCard')}}(<span>0</span>)</span>
                                            <span>{{$t('autoReply.menuMsg')}}(<span>0</span>)</span>
                                        </div>
                                    </div>
                                    <div class="rule-box-materialList" v-show="isShowCon">
                                        <div class="material" v-for="(value,index) in newRule.pageEchoContent" :key="index" v-if="newRule.pageEchoContent.length>0">
                                            <div class="material-text">
                                                <div class="click-stop materialTextTag" id="materialTextTag"
                                                     v-html="contHtml(value)" @click.prevent></div>
                                                <span class="icon icon-delete" @click="delText(index)"></span>
                                            </div>
                                        </div>
                                        <div class="material" v-for="(material,index) in newRule.materialList" v-if="newRule.materialList.length>0">
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
                                                        <!--<div class="appmsg_thumb_wrp"-->
                                                        <!--:style="{backgroundImage:'url(' + material.thumbMediaUrl + ')'}">-->
                                                        <!--<img :src="material.thumbMediaUrl " alt="">-->
                                                        <!--</div>-->
                                                        <div class="appmsg_thumb_wrp">
                                                            <img :src="material.thumbMediaUrl " alt="">
                                                        </div>
                                                        <a :href="material.url" target="_blank"
                                                           class="preview_mask">
                                                            <div class="edit_mask_content">
                                                                <p class="">
                                                                    {{'common.preview' | t}}
                                                                </p>
                                                            </div>
                                                            <span class="vm_box"></span>
                                                        </a>
                                                    </div>
                                                    <div class="appmsg_item has_cover"
                                                         v-for="child in material.materialItems">
                                                        <div class="appmsg_thumb_wrp"
                                                             :style="{backgroundImage:'url(' + child.thumbMediaUrl + ')'}">

                                                        </div>
                                                        <h4 class="appmsg_title js_title">
                                                            <a href="" target="_blank" data-msgid="100000016"
                                                               data-idx="1">{{child.title}}</a>
                                                        </h4>
                                                        <a :href="child.url" target="_blank"
                                                           class="edit_mask preview_mask">
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
                                                        <audio :src="material.url" style="display: none" controls
                                                               @ended="endedAudio()"></audio>
                                                        <div class="info">
                                                            <p class="title">{{material.name}}</p>
                                                            <p class="date">{{material.updateDateString}}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="material-video" v-if="material.type === 3">
                                                    <div class="name">{{material.name}}</div>
                                                    <div class="date">{{material.sendDateString}}</div>
                                                    <video :src="material.url" controls></video>
                                                    <audio style="display: none"></audio>
                                                </div>
                                                <!--外部页-->
                                                <div class="material-webPage" v-if="material.type===6" :title="material.exUrl">
                                                    <h3>{{material.exTitle}}</h3>
                                                    <div class="material-image">
                                                        <span>{{material.exDescribe}}</span>
                                                        <img :src="material.url">
                                                    </div>
                                                </div>
                                                <!--跳转表单-->
                                                <div class="reply-list" v-if="material.type===7" @click.prevent>
                                                    <div v-if="material.formReplyType==='sheet'">
                                                        <div class="click-stop" v-if="material.content" :title="material.formName"
                                                             v-html="materialContent(decodeURIComponent(material.content))">
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
                                                <div class="reply-list" v-if="material.type===8" :title="material.pagePath">
                                                    <a>{{material.miniprogramTitle}}</a>
                                                </div>
                                                <!-- 菜单 未保存的视图-->
                                                <div class="reply-list" v-if="material.type===9">
                                                    <p>{{material.menuMessage.headContent}}</p>
                                                    <p class="font-blue" v-for="(item,x) in material.menuMessage.options" :key="x">
                                                        {{item.content}}
                                                        <template v-if="isPallUser && groupList && groupList.$getByKey(item.groupId)">
                                                            <span class="font-group">
                                                                {{groupList.$getByKey(item.groupId).name}}
                                                            </span>
                                                            <span v-if="groupList.$getByKey(item.groupId).labelList.$getByKey(item.labelId)"
                                                                class="font-label">
                                                                {{groupList.$getByKey(item.groupId).labelList.$getByKey(item.labelId).name}}
                                                            </span>
                                                        </template>
                                                    </p>
                                                    <p>{{material.menuMessage.tailContent}}</p>
                                                </div>
                                                <span class="icon icon-delete" @click="delMaterial(index,material)"></span>
                                            </div>

                                        </div>
                                    </div>
                                    <div class="rule-box-bottom" v-show="isShowCon">
                                        <div class="btn-2">
                                            <button class="btn btn-md btn-white"
                                                    id="wechat_message_delete_word"
                                                    :disabled="$has('wechat_message_delete_word')"
                                                    @click="delRule">{{'common.del' | t}}</button>
                                            <button class="btn btn-md btn-theme addStyle"
                                                    id="wechat_reply_antistop_reply"
                                                    :disabled="$has('wechat_reply_antistop_reply')"
                                                    @click="saveRule">{{'common.save' | t}}
                                            </button>
                                        </div>
                                    </div>
                                    <div class="rule-box-info" v-show="isShowCon === false">
                                        <div class="keywords">
                                            <span class="title">{{'common.keyWord' | t}}</span>
                                            <span v-for="value in newRule.keywordList">{{value}}</span>
                                        </div>
                                        <div class="reply-count">
                                            <span class="title">{{'autoReply.reply' | t}}</span>
                                            <span>{{'QRCode.text' | t}} (<span>0</span>)</span>
                                            <span>{{'QRCode.pics' | t}} (<span>0</span>)</span>
                                            <span>{{'QRCode.audio' | t}} (<span>0</span>)</span>
                                            <span>{{'QRCode.video' | t}} (<span>0</span>)</span>
                                            <span>{{'QRCode.appMsg' | t}} (<span>0</span>)</span>
                                        </div>
                                        <div class="allreply" v-if="false"></div>
                                    </div>
                                </div>
                                <v-rule v-for="(rule, index) in rule.ruleList"
                                    :group-list="groupList"
                                    :rule="rule"
                                    :index="index"
                                    @deleteRule="updateRule"
                                    @updateSaveRule="updateRule"
                                    :key="rule.id"
                                ></v-rule>
                                <pager :total="allPage" :now="page" @page="handlePage"></pager>
                                <confirm v-if="editKey" @cancel="cancelEditKeyword"
                                         @confirm="sureEditKeyword">
                                    <div class="form-field">
                                        <label class="label" for="editKeyword">{{'autoReply.editKeyword' | t}}</label>
                                        <input class="input" v-model="editKeywordValue" maxlength="16" id="editKeyword"
                                               :placeholder="$t('autoReply.max16characters')"/>
                                    </div>
                                </confirm>
                                <confirm v-if="addKey" @cancel="cancelAddKeyword" @confirm="showKeyword">
                                    <div class="form-field">
                                        <label class="label" for="newKeyword">{{'autoReply.addKeyword' | t}}</label>
                                        <input class="input" type="text" v-model.trim="keywordValue" id="newKeyword"
                                               :placeholder="$t('autoReply.max16characters')" maxlength="16"
                                               @keydown.enter.prevent="textEnter"/>
                                    </div>
                                    <div class="form-field">
                                        <span class="keyword-value" v-for="(value,index) in inputKeywordList">
                                            {{value}}
                                            <span class="icon icon-close" @click="delKeyword(index)"></span>
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
                                <image-text-lib v-if="currentMaterialType === 'imgText'" @choose="chooseFinish" :no-sub-materials="true"
                                                @cancel="cancel"/>
                                <image-lib v-if="currentMaterialType === 'img'" @choose="chooseFinish" @cancel="cancel"/>
                                <audio-lib v-if="currentMaterialType === 'audio'" @choose="chooseFinish" @cancel="cancel"/>
                                <video-lib v-if="currentMaterialType === 'video'" @choose="chooseFinish" @cancel="cancel"/>
                                <!-- 外部页 -->
                                <modal :title="$t('autoReply.addWebPage')" v-if="currentMaterialType === 'webPage'" size="lg" @close="currentMaterialType=''">
                                    <div class="text-box">
                                        <material-out ref="materialOut" :material="replyMaterial"
                                                      @change="updateOut($event)"></material-out>
                                    </div>
                                    <div class="opt-btn">
                                        <button class="btn btn-white" @click="currentMaterialType=''">{{$t('common.cancel')}}</button>
                                        <button class="btn btn-theme" @click="chooseFinish(replyMaterial)">{{$t('common.confirm')}}</button>
                                    </div>
                                </modal>
                                <!--跳转表单 -->
                                <modal :title="$t('autoReply.addForm')" v-if="currentMaterialType === 'toForm'"
                                       @close="currentMaterialType=''" size="lg">
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
                                <modal :title="$t('autoReply.addMenu')" v-if="currentMaterialType === 'menu'" size="lg"
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
                        </div>
                    </transition>
                </ul>
            </div>
        </div>
    </div>
</template>
<script type="text/babel">
    import { ContactApiV1, WechatApiV1 } from '@/api';
    import rule from './rule.vue';
    import MaterialEditor from '../material/material-editor.vue';
    import MaterialText from '../material/material-editor-componets/material-text.vue';
    import MaterialOut from '../material/material-editor-componets/material-out.vue';
    import MaterialForm from '../material/material-editor-componets/material-form.vue';
    import MaterialMini from '../material/material-editor-componets/material-miniprogram.vue';
    import MaterialMenu from '../material/material-editor-componets/material-menu.vue';
    import ImageTextLib from '../material-libs/image-text-lib.vue';
    import ImageLib from '../material-libs/image-lib.vue';
    import AudioLib from '../material-libs/audio-lib.vue';
    import VideoLib from '../material-libs/video-lib.vue';
    import {logError} from '../../monitor.js';
    import {trackEvent} from '../../monitor';
    import { mapGetters } from 'vuex';
    import $ from 'jquery';


    export default {
        components: {
            'v-rule': rule,
            MaterialEditor,
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
        data() {
            return {
                id: '',
                // 被关注自动回复
                material: {},       // 素材
                oneReply: false,    // 被关注自动回复显隐
                concernReplyId: '', // 被关注自动回复 ID

                // 消息自动回复
                selfMaterial: {},   // 消息自动回复
                twoReply: false,    // 消息自动回复显隐
                automaticReplyId: '',   // 消息自动回复 ID

                // 关键词自动回复
                keyWorldReply: false, // 关键词自动回复显隐
                // 关键字
                rule: {
                    ruleList: [],
                },
                newRule: {
                    name: '',         // 名
                    content: [],      // 匹配模式
                    pageEchoContent:[],//回复类型是'text'时 仅页面回显使用
                    patterns: [],
                    keywordList: [],  // 关键字数组
                    materialList: [], // 素材数组
                    keyWordContentIds: [],//【表单/外部页/小程序卡片/菜单消息】回复内容id列表
                },
                checkbox: false,        // 回复全部
                isAdd: false,           // 是否添加规则
                isShowCon: false,       // 是否显示内容
                showKey: false,         // 显示关键字
                keywordValue: '',       // 输入的关键字
                inputKeywordList: [],   // 输入的关键字数组
                keywordList: [],        // 输入完毕存放的数组
                addKey: false,          // 是否显示输入框
                editKey: false,         // 修改关键字弹窗显隐
                currentMaterialType: '',        // 弹框的素材类型
                textareaValue: '',      // 文字 的value
                materialImgText: '',    // 选中的素材
                materialImg: '',        // 选中的图片
                materialAudio: '',      // 选中的音频
                materialVideo: '',      // 选中的视频
                editKeywordValue: '',   // 编辑关键字
                editKeywordIndex: '',   // 编辑关键字下标
                playId: '',             // 音频 ID
                // 分页
                page: 1,
                allPage: 0,
                //关键字规则素材
                replyMaterial:{},
                // Pall中国限定 菜单消息分组列表
                groupList: []
            };
        },
        computed: {
            ...mapGetters([
                'isPallUser',
            ]),
            user() {
                return this.$store.state.user;
            },
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            }
        },
        mounted() {
            this.followedFetchDigest();
            this.getMsgFetch();
            this.getKeywordReplyList(this.page);
            if (this.isPallUser) {
                // Pall中国限定 获取菜单消息分组列表
                ContactApiV1
                    .getGroupsOld()
                    .then(({ body: { data: { groupList } } }) => {
                        this.groupList = groupList[0].groupList;
                    });
            }

            //华为埋码-公众号运营-自动回复
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P12031994E3EE6E');
            }
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
                    return  content.html();
                }
                return cont;
            },
            /**
             * 获取关键字规则列表
             * @param pageNumber
             * @param keyword
             * @return {*|Request}
             */
            getKeywordReplyList(page) {
                WechatApiV1
                    .getKeywordReply(page, '')
                    .then((res) => {
                        this.rule.ruleList = res.body.data.filedList;
                        this.allPage = res.body.data.totalPage;
                    });
            },
            // 翻页
            handlePage(e) {
                this.page = e;
                this.getKeywordReplyList(e);
            },
            // 被关注自动回复
            firstKey() {
                if (!this.oneReply) {
                    this.oneReply = true;
                    this.twoReply = false;
                    this.keyWorldReply = false;
                } else {
                    this.oneReply = false;
                    this.twoReply = false;
                    this.keyWorldReply = false;
                }

            },
            // 消息自动回复
            two() {
                if (!this.twoReply) {
                    this.oneReply = false;
                    this.twoReply = true;
                    this.keyWorldReply = false;
                } else {
                    this.oneReply = false;
                    this.twoReply = false;
                    this.keyWorldReply = false;
                }
            },
            // 关键词自动回复
            three() {
                if (!this.keyWorldReply) {
                    this.oneReply = false;
                    this.twoReply = false;
                    this.keyWorldReply = true;
                } else {
                    this.oneReply = false;
                    this.twoReply = false;
                    this.keyWorldReply = false;
                }
            },
            // 删除被关注自动回复
            delFollowed() {
                WechatApiV1
                    .delReply(this.concernReplyId)
                    .then(() => {
                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                        trackEvent('微信管理-自动回复-删除回复');
                        this.followedFetchDigest();
                    });


            },
            // 删除消息自动回复
            deleteTwo() {
                WechatApiV1
                    .delReply(this.automaticReplyId)
                    .then(() => {
                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                        trackEvent('微信管理-自动回复-删除回复');
                        this.getMsgFetch();
                    });
            },
            // 被关注 自动回复获取列表
            followedFetchDigest(){
                WechatApiV1
                    .getFollowReply()
                    .then((res) => {
                        let concernReply = res.body.data.concernReply;
                        if (concernReply === null) {//没有设置被关注自动回复
                            this.material = {
                                type: 'text', content: ''
                            };
                        } else {
                            if (!concernReply.id) {
                                logError(`[自动回复] <reply /> followedFetchDigest 后台未返回必要的id :473`);
                            }
                            this.concernReplyId = concernReply.id || '';
                            let concernReplyValue = concernReply.concernReplyValue || '';//回复类型是'text'的字段concernReplyValue
                            let materialDTO = concernReply.materialDTO || ''; //回复类型是图片/音频/视频时的字段materialDTO
                            let sendType = concernReply.sendType || ''; //回复类型是5图文/6外部页/7跳转表单/8小程序卡片/9菜单时的字段 sendType
                            if ((concernReplyValue || !concernReplyValue) && !sendType) {
                                this.material = {
                                    type: 'text', content: concernReplyValue
                                };
                            }
                            if (materialDTO && (!sendType || sendType === 5)) {
                                this.material = this.includeImgReply(materialDTO);
                            }
                            if (sendType && sendType > 5) {
                                this.material = this.replyTypeMaterial(concernReply);
                            }

                        }
                    });
            },
            //根据回复类型 判断素材字段 【外部页 小程序 跳转表单 菜单】
            replyTypeMaterial(detail){
                let defaultResult = {};
                let replyContent = {};
                switch (detail.sendType) {
                    case 6:
                        replyContent = {
                            type: 6,
                            url: detail.externalImageUrl || detail.material.url,
                            exUrl: detail.externalUrl || '',
                            exTitle: detail.externalTitle || '',
                            exDescribe: detail.externalDescription || '',//2.5.2外部页添加描述
                            name: detail.name || detail.materialDTO.name || '',
                            updateDateString: detail.updateDateString || detail.materialDTO.updateDateString || '',
                            mediaId: detail.mediaId || detail.materialDTO.mediaId || '',
                            materialId: detail.materialDTO.id || detail.id,
                        };
                        break;
                    case 7:
                        defaultResult = {
                            replyType: 7,
                            type: 7,
                            content: detail.sheetContent,
                            id: detail.sheetId,
                            customSheetUrl: detail.customSheetUrl || '',
                            customFormId: detail.customFormId || null,
                            formReplyType: detail.formReplyType || '',
                            externalUrl: detail.externalUrl || detail.customSheetUrl || detail.sheetUrl || ''
                        };
                        if (detail.materialDTO) {
                            defaultResult.materialId = detail.materialDTO.mediaId;
                            defaultResult.sheetUrl = detail.materialDTO.sheetUrl;
                        }
                        if (detail.extensionValueId) defaultResult.extensionValueId = detail.extensionValueId;
                        if (detail.externalTitle) {
                            defaultResult.externalTitle = detail.externalTitle;
                            defaultResult.externalDescription = detail.externalDescription;
                            defaultResult.externalImageUrl = detail.externalImageUrl;
                            if (detail.materialDTO) {
                                defaultResult.updateDateString = detail.materialDTO.updateDateString || '';
                                defaultResult.name = detail.materialDTO.name || '';
                                defaultResult.materialId = detail.materialDTO.id || '';
                            }
                        }
                        replyContent = defaultResult;
                        break;
                    case 8:
                        replyContent = {
                            type: 8,
                            url: detail.materialDTO.url,
                            miniprogramTitle: detail.miniprogramTitle || '',
                            miniprogramAppid: detail.miniprogramAppid || '',
                            pagePath: detail.pagePath,
                            name: detail.materialDTO.name,
                            updateDateString: detail.materialDTO.updateDateString,
                            mediaId: detail.materialDTO.mediaId,
                            materialId: detail.materialDTO.id || detail.id,
                            miniprogramId: detail.miniprogramId,
                        };
                        break;
                    case 9:
                        replyContent = {
                            type: 9,
                            // 微信菜单消息属性
                            menuMessage: detail.menuMessage,
                        };
                        break;
                }
                return replyContent;
            },
            //根据回复类型 判断素材字段 【图文 音频 视频 图片】
            includeImgReply(materialDTO) {
                let replyContent = {
                    type: materialDTO.type,
                    url: materialDTO.url,
                    id: materialDTO.id,
                    mediaId: materialDTO.mediaId,
                    articleId: materialDTO.articleId,
                    thumbMediaUrl: materialDTO.thumbMediaUrl,
                    thumbMediaId: materialDTO.thumbMediaId,
                    title: materialDTO.title,
                    updateDateString: materialDTO.updateDateString,
                    name: materialDTO.name,
                };
                return replyContent;
            },
            /**
             * 自动回复保存接口所需参数
             * @param material
             * @param type 1被关注自动回复 2消息自动回复
             */
            autoResponse(materialData, type) {
                let autoResponseObj = {};
                let replyId = type === 1 ? this.concernReplyId : this.automaticReplyId;
                //0不回复；1图片；2语音；3视频；5图文；'text'文本；6链接（外部页）；7表单；8小程序卡片
                switch (materialData.type) {
                    case 'text':
                        autoResponseObj = {
                            id: replyId,
                            concernReplyValue: materialData.content.replace(/<br>/g, '').replace(/&nbsp;/g, ''),
                        };
                        break;
                    case 1:
                    case 2:
                    case 3:
                        autoResponseObj = {
                            id: replyId,
                            materialId: materialData.id,
                        };
                        break;
                    case 5:
                        autoResponseObj = {
                            id: replyId,
                            materialId:materialData.id,
                            sendType: materialData.type,
                        };
                        break;
                    case 6:
                        autoResponseObj = {
                            id: replyId,
                            materialId: materialData.materialId || materialData.id,
                            sendType: materialData.type,
                            externalTitle: materialData.exTitle,
                            externalImageUrl: materialData.url,
                            externalUrl: materialData.exUrl,
                            externalDescription: materialData.exDescribe,
                        };
                        break;
                    case 7:
                        autoResponseObj = {
                            id: replyId,
                            materialId: materialData.formReplyType === 'sheet' ? '' : materialData.materialCoverId || materialData.materialId,
                            sendType: materialData.type,
                            formReplyType: materialData.formReplyType,
                            externalImageUrl: materialData.url || materialData.externalImageUrl || '',
                            externalTitle: materialData.exTitle || materialData.externalTitle || '',
                            externalDescription: materialData.exDescribe || materialData.externalDescription || '', // 2.5.2外部页添加描述
                            externalUrl: materialData.exUrl || materialData.customSheetUrl || materialData.sheetUrl || materialData.externalUrl || '',
                            sheetContent: materialData.content,
                            sheetUrl: materialData.sheetUrl || materialData.customSheetUrl || '',
                            sheetId: materialData.id,
                            extensionValueId: materialData.extensionValueId || '',
                        };
                        break;
                    case 8:
                        autoResponseObj = {
                            id: replyId,
                            materialId : materialData.id || materialData.materialId,
                            sendType: materialData.type,
                            pagePath: materialData.pagePath || '',
                            miniprogramAppid: materialData.miniprogramAppid || '',
                            miniprogramTitle: materialData.miniprogramTitle || '',
                            miniprogramId: materialData.miniprogramId,
                        };
                        break;
                    case 9:
                        autoResponseObj = {
                            id: replyId,
                            materialId : materialData.id,
                            sendType: materialData.type,
                            menuMessage:materialData.menuMessage
                        };
                        break;

                }
                return autoResponseObj;
            },
            //保存回复前校验
            validSave(material,type){
                if (material.content && material.id && material.headContent) {
                    this.$toast(this.$t('autoReply.contentEmptyError'),'warn');
                    return;
                }
                let refObject = type === 1 ? this.$refs.followedEditor : this.$refs.autoEditor;
                if (!refObject.validAll()) return;
                if (type === 1) {
                    let focusedReplyData = this.autoResponse(this.material,1);
                    WechatApiV1
                        .saveAddedReply(focusedReplyData)
                        .then((res) => {
                            this.$toast(res.body.message, 'success');
                            trackEvent('微信管理-自动回复-保存关注时自动回复的内容');
                            this.followedFetchDigest();
                        });
                } else {
                    let autoReplyData = this.autoResponse(this.selfMaterial,2);
                    WechatApiV1
                        .saveMsgReply(autoReplyData)
                        .then((res) => {
                            this.$toast(res.body.message, 'success');
                            trackEvent('微信管理-自动回复-保存自动回复的内容');
                            this.getMsgFetch();
                        });
                }
            },
            // 被关注时自动回复 保存事件
            saveFocusedReply() {
                this.validSave(this.material, 1);
            },
            // 查询 消息自动回复
            getMsgFetch() {
                WechatApiV1
                    .getMsgReply()
                    .then((res) => {
                        let automaticReply = res.body.data.automaticReply;
                        if (automaticReply === null) {//没有设置消息自动回复
                            this.selfMaterial = {
                                type: 'text', content: ''
                            };
                        } else {
                            this.id = automaticReply.id || '';
                            this.automaticReplyId = this.id || '';
                            let concernReplyValue = automaticReply.concernReplyValue || ''; //回复类型是'text'的字段concernReplyValue
                            let materialDTO = automaticReply.materialDTO || ''; //回复类型是图片/音频/视频时的字段materialDTO
                            let sendType = automaticReply.sendType || ''; //回复类型是5图文/6外部页/7跳转表单/8小程序卡片/9菜单时的字段 sendType
                            if (concernReplyValue || !concernReplyValue) {
                                this.selfMaterial = {
                                    type: 'text', content: concernReplyValue
                                };
                            }
                            if (materialDTO && (!sendType || sendType === 5)) {
                                this.selfMaterial = this.includeImgReply(materialDTO);
                            }
                            if (sendType && sendType > 5) {
                                this.selfMaterial = this.replyTypeMaterial(automaticReply);
                            }
                        }
                    });
            },
            // 保存事件 消息自动回复
            saveAutoReply() {
                this.validSave(this.selfMaterial, 2);
            },
            // 关键字回复
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

            // 添加规则
            addRule() {
                this.isAdd = !this.isAdd;
                this.isShowCon = !this.isShowCon;
            },
            // 删除规则
            delRule() {
                this.$confirm(this.$t('common.del'), this.$t('autoReply.delRule'))
                    .then((sure) => {
                        if (sure) {
                            this.isAdd = false;
                            this.newRule.name = '';
                            // this.newRule.content.length = 0;
                            this.newRule.content.splice(0);
                            this.newRule.pageEchoContent.splice(0);
                            this.newRule.patterns.length = 0;
                            this.newRule.keywordList.length = 0;
                            this.newRule.materialList.length = 0;
                            this.newRule.keyWordContentIds = [];
                        }
                    });
            },

            // 展示、隐藏内容
            isShowConFun() {
                this.isShowCon = !this.isShowCon;
            },
            // 编辑关键字
            editKeyword(value, index) {
                this.editKey = true;
                this.editKeywordValue = value;
                this.editKeywordIndex = index;
            },
            // 确定编辑关键词
            sureEditKeyword() {
                if (this.editKeywordValue.trim().length === 0) {
                    this.$toast(this.$t('autoReply.keywordEmptyError'),'warn');
                    this.editKeywordValue = '';
                    return false;
                }
                this.newRule.keywordList.splice(this.editKeywordIndex, 1, this.editKeywordValue);
                this.editKey = false;
            },
            // 取消编辑关键词
            cancelEditKeyword() {
                this.editKey = false;
            },
            // 删除关键字
            deleteKey(index) {
                this.newRule.keywordList.splice(index, 1);
                this.newRule.patterns.splice(index, 1);
            },
            // 添加关键字
            addKeyword() {
                this.addKey = true;
            },
            // 修改匹配模式
            updatePatterns(index, value) {
                this.newRule.patterns.splice(index, 1, value);
            },

            // enter
            textEnter() {
                if (this.keywordValue.length > 16) {
                    return false;
                }
                if (this.keywordValue.trim().length === 0) {
                    this.$toast(this.$t('autoReply.keywordEmptyError'),'warn');
                    this.keywordValue = '';
                    return false;
                }
                if ((this.inputKeywordList.length + this.newRule.keywordList.length) >= 10) {
                    this.$toast(this.$t('autoReply.max10characters'),'warn');
                    this.keywordValue = '';
                    return false;
                }
                this.inputKeywordList.push(this.keywordValue.trim());
                this.keywordValue = '';
            },
            // 删除关键词
            delKeyword(index) {
                this.inputKeywordList.splice(index, 1);
            },
            // 添加关键字 确定按钮
            showKeyword() {
                if (this.keywordValue.length > 16) {
                    return false;
                }
                if (this.keywordValue.trim().length !== 0) {
                    this.inputKeywordList.push(this.keywordValue);
                }
                if ((this.inputKeywordList.length + this.newRule.keywordList.length) > 10) {
                    this.$toast(this.$t('autoReply.max10characters'),'warn');
                    this.keywordValue = '';
                    return false;
                }
                this.keywordValue = '';
                this.newRule.keywordList = this.newRule.keywordList.concat(this.inputKeywordList);
                for (let i = 0; i < this.newRule.keywordList.length; i++) {
                    if (this.newRule.patterns[i] !== 1) {
                        this.newRule.patterns[i] = 0;
                    }

                }
                this.inputKeywordList.length = 0;
                this.showKey = true;
                this.addKey = false;
            },
            // 取消添加关键字
            cancelAddKeyword() {
                this.keywordValue = '';
                this.inputKeywordList.length = 0;
                this.addKey = false;
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
                    typeId:'',//关键词自动回复-删除外部页、表单、小程序卡片、菜单消息【新增接口，只针对于新增回复类型】
                    miniprogramId:'',
                };

                if ((this.newRule.materialList.length + this.newRule.content.length) >= 5) {
                    this.$toast(this.$t('autoReply.max5replies'),'warn');
                    return false;
                }
                this.currentMaterialType = type;
            },
            // 确认选择该素材
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
                        if (!this.$refs.materialMini.validTitle()) return;
                        if (!this.$refs.materialMini.validAppid()) return;
                        if (!this.$refs.materialMini.validCover()) return;
                        if (!this.$refs.materialMini.validPagePath()) return;
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
                        this.newRule.materialList.push(this.materialImg);
                        break;
                    case 'audio':
                        this.materialAudio = material;
                        this.newRule.materialList.push(this.materialAudio);
                        break;
                    case 'video':
                        this.materialVideo = material;
                        this.newRule.materialList.push(this.materialVideo);
                        break;
                    case 'imgText':
                        this.materialImgText = material;
                        this.newRule.materialList.push(this.materialImgText);
                        break;
                    case 'webPage':
                    case 'toForm':
                    case 'appletCard':
                    case 'menu':
                        this.newRule.materialList.push(this.replyMaterial);
                        this.saveKeywordContent();
                        break;
                    default :
                        logError(`[自动回复] <replay /> chooseFinish 无法识别的素材类型 :744`);
                        console.error('未识别的素材类型');
                        break;
                }
                this.currentMaterialType = '';
            },
            //文字回复
            acceptKeywordReply(material) {
                this.newRule.content.push(material.content);
                this.textareaValue = material.content;
                if (this.textareaValue === '') {
                    this.$toast(this.$t('autoReply.replyEmptyError'),'warn');
                    return false;
                }
                this.currentMaterialType = '';
                this.newRule.pageEchoContent.push(this.textareaValue);
                this.textareaValue = '';
            },
            // 删除回复文字
            delText(index) {
                this.newRule.content.splice(index, 1);
                this.newRule.pageEchoContent.splice(index, 1);
            },
            // 删除回复素材
            delMaterial(index,material) {
                if (material.type > 5) {
                    //外部页 跳转表单 小程序卡片 菜单消息
                    WechatApiV1
                        .delMenuMsg(material.typeId)
                        .then(() => {
                            let x = this.newRule.keyWordContentIds.indexOf(material.typeId);
                            this.newRule.keyWordContentIds.splice(x,1);
                        });
                }
                this.newRule.materialList.splice(index, 1);
            },

            /**
             * 单个回复类型保存
             *自动回复-关键词回复-确定【2.5.7新增接口，只针对于添加外部页、表单、小程序卡片、菜单消息类型】
             */
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
                    miniprogramId: this.replyMaterial.miniprogramId,
                };
                WechatApiV1
                    .saveKeywordContent(replyObj)
                    .then(({body:{data}}) => {
                        this.newRule.keyWordContentIds.push(data.keyWordContent.id);
                        this.replyMaterial.typeId = data.keyWordContent.id;
                        this.replyMaterial = {};
                    });
                this.currentMaterialType = '';
            },
            // 保存规则
            saveRule() {
                let recoilType = null;
                if (this.newRule.name === '') {
                    this.$toast(this.$t('autoReply.ruleNameEmptyError'), 'warn');
                    return false;
                }
                if (this.newRule.keywordList.length === 0) {
                    this.$toast(this.$t('autoReply.keywordEmptyErrors'), 'warn');
                    return false;
                }
                if (this.newRule.materialList.length === 0 && this.newRule.content.length === 0) {
                    this.$toast(this.$t('autoReply.replyEmptyErrors'), 'warn');
                    return false;
                }
                if ((this.newRule.materialList.length + this.newRule.content.length) > 5) {
                    this.$toast(this.$t('autoReply.max5replies'), 'warn');
                    return false;
                }
                if (this.checkbox) {
                    recoilType = 1;
                } else {
                    recoilType = 0;
                }
                const materialIds = this.newRule.materialList.map(material => {
                    if (material.type !== 6 && material.type !== 7
                        && material.type !== 8 && material.type !== 9) {
                        return material.id;
                    }
                });
                WechatApiV1
                    .saveKeywordReply(
                        this.newRule.content,
                        this.newRule.keywordList,
                        materialIds,
                        this.newRule.patterns,
                        this.newRule.name,
                        recoilType,
                        this.newRule.keyWordContentIds
                    )
                    .then((res) => {
                        this.$toast(res.body.message, 'success');
                        this.isAdd = false;
                        this.newRule.name = '';
                        this.newRule.content.splice(0);
                        this.newRule.pageEchoContent.splice(0);
                        this.newRule.patterns.splice(0);
                        this.newRule.keywordList.splice(0);
                        this.newRule.materialList.splice(0);
                        trackEvent('微信管理-关键字回复-保存关键字列表');
                        this.getKeywordReplyList(1);
                        this.page = 1;
                        this.newRule.keyWordContentIds = [];
                    });
            },
            // 取消
            cancel() {
                this.textareaValue = '';
                this.currentMaterialType = '';
                this.addKey = false;
            },

            // 更新规则
            updateRule() {
                this.getKeywordReplyList(1);
                this.page = 1;
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
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .function-reply {
        .reply-container {
            min-width: 1135px;
        }

        .icon-caret-down {
            display: inline-block;
        }

        .new-list {
            .one {
                width: 100%;
                min-height: 56px;
                background-color: white;
                margin-bottom: 8px;
                cursor: pointer;
                span {
                    font-size: 14px;
                    font-weight: 800;
                    display: inline-block;
                    margin-top: 18px;
                    margin-left: 15px;
                }

                ~ .one {
                    margin-top: 1em;
                }

                &.active {
                    background-color: #ecf4f2;

                    .icon-caret-down {
                        @include transform(rotate(180deg))
                    }
                }

                &:hover {
                    background-color: #ecf4f2;
                }
            }

            .follow-reply {
                background-color: white;
            }
        }

        /*关键词*/
        $title-background-color: #f4f5f9;
        .keywords-reply {
            .icon-dot {
                display: inline-block;
                vertical-align: top;
                width: 8px;
                height: 8px;
                background: url("images/icon_dot.png");
            }
            .rule-box {
                @include box-sizing();
                width: 100%;
                margin: 20px 0;
                border: 1px solid $border-color;
                .rule-box-title {
                    @include ellipsis;
                    height: 40px;
                    line-height: 40px;
                    padding: 0 20px;
                    background: $title-background-color;
                    font-size: 14px;
                    border-bottom: 1px solid $border-color;
                    i.up-down {
                        float: right;
                        width: 0;
                        height: 0;
                        margin-top: 14px;
                        border: 5px solid $color-light-content;
                        @include transform(rotate(45deg));
                        &.up {
                            border-top-color: transparent;
                            border-left-color: transparent;
                        }
                        &.down {
                            border-bottom-color: transparent;
                            border-right-color: transparent;
                        }
                    }
                    &:hover {
                        cursor: pointer;
                    }
                }
                .rule-box-name {
                    @include box-sizing();
                    padding: 10px;
                    height: 80px;
                    font-size: 0;
                    .name {
                        display: inline-block;
                        vertical-align: top;
                        width: 80px;
                        height: 35px;
                        font-size: 14px;
                        line-height: 35px;
                        i {
                            margin-top: 13.5px;
                        }
                    }
                    input {
                        display: inline-block;
                        vertical-align: top;
                        padding: 0 20px;
                        width: 397px;
                        font-size: 14px;
                        @include box-sizing();
                        height: $input-field-height;
                        @include border-radius(5px);
                        border: 1px solid $border-color;
                    }
                    .input-hint {
                        font-size: 14px;
                        padding-left: 80px;
                        color: $color-light-content;
                    }
                }
                .rule-box-keyword {
                    @include box-sizing();
                    padding: 10px;
                    height: 40px;
                    line-height: 20px;
                    border-top: 1px solid $border-color;
                    border-bottom: 1px solid $border-color;

                    .keyword {
                        display: inline-block;
                        vertical-align: top;
                        width: 80px;
                        height: 20px;
                        font-size: 14px;

                        i {
                            margin-top: 6px;
                        }
                    }

                    .add-keyword {
                        float: right;
                        font-size: 14px;
                        color: $blue;
                        &:hover {
                            cursor: pointer;
                            text-decoration: underline;
                        }
                    }
                }
                ul {
                    padding-left: 20px;
                    li {
                        @include box-sizing();
                        height: 50px;
                        line-height: 50px;
                        border-bottom: 1px solid $border-color;
                        .edit {
                            float: right;
                            height: 50px;
                            span {
                                margin: 0 10px;
                            }
                            span:nth-of-type(1) {
                                color: $blue;
                                &:hover {
                                    cursor: pointer;
                                    text-decoration: underline;
                                }
                            }
                            span.icon-delete, span.icon-pencil {
                                &:hover {
                                    cursor: pointer;
                                }

                            }
                        }
                    }
                }
                .rule-box-reply {
                    @include box-sizing();
                    padding: 10px;
                    border-bottom: 1px solid $border-color;

                    .reply {
                        display: inline-block;
                        vertical-align: top;
                        font-size: 14px;
                        line-height: 20px;
                        i {
                            margin-top: 6px;
                        }
                    }
                    .check {
                        height: 20px;
                        line-height: 20px;
                        font-size: 14px;
                        .icon-checkbox {
                            font-size: 16px;
                        }
                    }
                }
                .rule-box-material {
                    line-height: normal;
                    margin: 0 15px 0 30px;
                    font-size: 0;

                    div {
                        display: inline-block;
                        vertical-align: top;
                        padding: 5px 8px;
                        border: 1px #e0e0e0 solid;
                        i {
                            display: inline-block;
                            vertical-align: top;
                            width: 20px;
                            height: 20px;
                        }
                        span {
                            color: $color-light-content;
                            font-size: 14px;
                            &.active {
                                color: #000;
                            }
                        }
                        &:hover {
                            cursor: pointer;
                        }
                    }
                    .imgText {
                        i {
                            background: url("../images/material-editor-tab-icons.png") 0 170px;
                            &:hover {
                                background-position: 0 140px;
                            }
                        }
                    }
                    .text {
                        i {
                            background: url("../images/material-editor-tab-icons.png") 0 410px;
                            &:hover {
                                background-position: 0 380px;
                            }
                        }
                    }
                    .img {
                        i {
                            background: url("../images/material-editor-tab-icons.png") 0 350px;
                            &:hover {
                                background-position: 0 320px;
                            }
                        }
                    }
                    .audio {
                        i {
                            background: url("../images/material-editor-tab-icons.png") 0 230px;
                            &:hover {
                                background-position: 0 200px;
                            }
                        }
                    }
                    .video {
                        i {
                            background: url("../images/material-editor-tab-icons.png") 0 290px;
                            &:hover {
                                background-position: 0 260px;
                            }
                        }
                    }
                    .webPage {
                        i {
                            background: url("../images/material-editor-tab-icons.png") 0 -360px no-repeat;

                            &:hover{
                                background-position: 0 -390px;
                            }
                        }

                    }
                    .toForm {
                        i {
                            background: url("../images/material-editor-tab-icons.png") 0 -300px no-repeat;
                            &:hover{
                                background-position: 0 -330px;
                            }
                        }
                    }
                    .appletCard,.menu{
                        svg {
                            width: 20px;
                            height: 20px;
                            fill: #b2b2b2;
                            &:hover {
                                fill: #000;
                            }
                        }
                    }
                }
                .rule-box-materialList {
                    .material {
                        position: relative;
                        padding: 10px 20px;
                        border-bottom: 1px solid $border-color;
                        span.icon-delete {
                            font-size: 16px;
                            &:hover {
                                cursor: pointer;
                            }
                        }
                        .material-wrapper{
                            display: flex;
                            justify-content: space-between;
                        }
                        .material-text {
                            line-height: 20px;
                            font-size: 14px;
                            height: 100%;
                            display: flex;
                            justify-content: space-between;
                            .mini-pro {
                                padding-left: 14px;
                                background: url('../material/material-editor-componets/miniprogram-icon.png') no-repeat left top;
                                background-size: 14px 14px;
                            }
                            .materialTextTag {
                                a{
                                    color: #0000FF;
                                }
                            }
                        }
                        .material-img {
                            img {
                                width: 100px;
                                height: 100px;
                                background-position: center center;
                                background-repeat: no-repeat;
                                background-size: cover;
                            }
                            span {
                                display: inline-block;
                                vertical-align: top;
                            }

                        }
                        .appmsg-content {
                            position: relative;
                            display: inline-block;
                            vertical-align: top;
                            width: 295px;
                            padding: 0;
                            border: 1px solid $border-color;
                            .appmsg_title {
                                font-weight: 400;
                                font-style: normal;
                                font-size: 14px;
                                line-height: 1.6;
                                overflow: hidden;
                                word-wrap: break-word;
                                word-break: break-all;
                                color: #222;
                            }
                            .appmsg_info {
                                font-size: 13px;
                                line-height: 20px;
                                margin: 0 14px;
                                padding: 12px 0;
                                border-bottom: 1px solid #e7e7eb;
                                .appmsg_date {
                                    font-weight: 400;
                                    font-style: normal;
                                }
                            }
                            .cover_appmsg_item {
                                position: relative;
                                margin: 12px 14px 12px;
                                .appmsg_title {
                                    margin: 0;
                                    font-size: 14px;
                                    padding-top: 0;
                                    padding-left: 5px;
                                    line-height: 28px;
                                    position: absolute;
                                    bottom: 0;
                                    left: 0;
                                    right: 0;
                                    background: rgba(0, 0, 0, 0.6);
                                    font-weight: 400;
                                    font-style: normal;
                                    overflow: hidden;
                                    word-wrap: break-word;
                                    word-break: break-all;
                                    color: #222;
                                    a {
                                        color: #fff;
                                    }
                                }
                                .appmsg_thumb_wrp {
                                    height: 160px;
                                    overflow: hidden;
                                    background-repeat: no-repeat;
                                    background-position: center center;
                                    background-size: cover;
                                }
                                .preview_mask {
                                    text-align: center;
                                    position: absolute;
                                    display: none;
                                    left: -14px;
                                    right: -14px;
                                    top: -12px;
                                    bottom: -12px;
                                    background: rgba(0, 0, 0, .5);
                                    color: #fff;
                                    .edit_mask_content {
                                        text-align: center;
                                        display: inline-block;
                                        vertical-align: middle;
                                        font-size: 14px;
                                        p {
                                            margin: 0 auto;
                                        }
                                    }
                                    .vm_box {
                                        display: inline-block;
                                        height: 100%;
                                        vertical-align: middle;
                                    }
                                }
                                &:hover {
                                    .preview_mask {
                                        display: block;
                                    }
                                }
                            }
                            .appmsg_item {
                                position: relative;
                                padding: 12px 14px;
                                border-top: 1px solid #e7e7eb;
                                .appmsg_thumb_wrp {
                                    float: right;
                                    width: 78px;
                                    height: 78px;
                                    margin-left: 14px;
                                    overflow: hidden;
                                    background-repeat: no-repeat;
                                    background-position: center center;
                                    background-size: cover;
                                }
                                .appmsg_title {
                                    line-height: 24px;
                                    height: 78px;
                                    overflow: hidden;
                                    margin: 0;
                                    padding-top: 14px;
                                    a {
                                        display: block;
                                        color: #222;
                                    }
                                }
                                .edit_mask {
                                    font-size: 0;
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background: rgba(0, 0, 0, 0.6);
                                    color: #fff;
                                    z-index: 1;
                                    text-align: center;
                                    padding: 14px;
                                    .edit_mask_content {
                                        text-align: center;
                                        display: inline-block;
                                        vertical-align: middle;
                                        font-size: 14px;
                                        p {
                                            margin: 0 auto;
                                        }
                                    }
                                    .vm_box {
                                        display: inline-block;
                                        height: 100%;
                                        vertical-align: middle;
                                    }
                                }
                                .preview_mask {
                                    display: none;
                                }
                                &:hover {
                                    .preview_mask {
                                        display: block;
                                    }
                                }
                            }
                        }

                        .material-audio {
                            position: relative;
                            display: inline-block;
                            margin: 10px 0;
                            width: 297px;
                            font-size: 12px;
                            height: 100px;
                            @include box-sizing();
                            border: 1px solid $border-color;
                            div.content {
                                @include box-sizing();
                                width: 100%;
                                height: 100px;
                                padding: 10px;
                                font-size: 0;
                                img {
                                    width: 80px;
                                    height: 80px;
                                    cursor: pointer;
                                }
                                .info {
                                    display: inline-block;
                                    vertical-align: top;
                                    font-size: 16px;
                                    margin-left: 10px;
                                    width: 140px;
                                    height: 80px;
                                    .titles {
                                        display: block;
                                        vertical-align: top;
                                    }
                                    .date {
                                        font-size: 12px;
                                    }
                                }
                                .length {
                                    display: inline-block;
                                    vertical-align: top;
                                    font-size: 12px;
                                }
                            }
                            p {
                                padding-left: 15px;
                                @include ellipsis;
                                line-height: 30px;
                            }
                            span.icon-delete {
                                float: right;
                                font-size: 16px;
                            }
                        }
                        .material-video {
                            padding: 10px;
                            position: relative;
                            display: inline-block;
                            margin: 10px 0;
                            font-size: 12px;
                            width: 300px;
                            @include box-sizing();
                            border: 1px solid $border-color;
                            .name {
                                font-size: 14px;
                            }
                            .date {
                                font-size: 14px;
                            }
                            video {
                                width: 100%;
                                height: 160px;
                            }
                        }
                        .material-webPage{
                            width: 300px;
                            padding: 10px;
                            border: 1px solid $border-color;
                            .material-image{
                                display: flex;
                                justify-content: space-between;
                                align-items: flex-start;
                            }
                            img{
                                width: 80px;
                            }
                        }
                        .reply-list{
                            width: 300px;
                            &.wide-box {
                                width: 100%;
                            }
                            a {
                                color: #0000FF;
                            }
                        }
                        .font-blue{
                            color: #0000FF;
                            .font-group {
                                color: #6495ED; // CornflowerBlue    
                            }
                            .font-label {
                                color: #00BFFF; // DeepSkyBlue
                            }
                            .invalid-tips {
                                color: #f67d7d;
                            }
                        }
                        .click-stop {
                            a {
                                .hidden-menu{
                                    top: 0;
                                    /*right: 0;*/
                                    width: 300px;
                                    height: 34px;
                                    line-height: 32px;
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
                                &:hover{
                                    .hidden-menu{
                                        opacity: 1;
                                        @include transform(scale(1, 1));
                                    }
                                }
                            }
                        }
                    }
                }
                .rule-box-bottom {
                    height: 50px;
                    line-height: 50px;
                    padding-left: 20px;
                    background: white;
                    .btn-2 {
                        float: right;
                    }
                }
                .rule-box-info {
                    padding: 20px 30px;
                    font-size: 14px;
                    .keywords {
                        > span {
                            padding: 2px 10px;
                            background: $border-color;

                            &:nth-of-type(1) {
                                padding: 0;
                                background: white;
                            }
                        }
                    }
                    div {
                        height: 30px;
                        line-height: 30px;
                        span.title {
                            display: inline-block;
                            vertical-align: top;
                            height: 24px;
                            width: 80px;
                            margin: 0;
                        }
                        > span {
                            margin: 0 10px;
                        }
                    }
                }
            }

            .keyword-value {
                display: inline-block;
                margin: 10px 5px 0;
                padding: 5px 10px;
                height: 20px;
                line-height: 20px;
                @include border-radius(5px);
                background: #e5e7ec;
                .icon {
                    &:hover {
                        font-size: 10px;
                        cursor: pointer;
                        background: $color-light-content;
                    }
                }
            }
            .text-box{
                border: 1px solid $border-color;
            }
        }

        .showFont {
            display: inline-block;
            text-align: right;
            @include width-calc(calc(100% - 320px));
            color: #999999;
            vertical-align: middle;
            > span {
                margin: 0 5px;
            }
        }
        .addStyle {
            vertical-align: 0;
            margin-right: 10px;
        }
        .opt-btn{
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
        }
        .theme-color{
            color: $green;
        }
    }
</style>
