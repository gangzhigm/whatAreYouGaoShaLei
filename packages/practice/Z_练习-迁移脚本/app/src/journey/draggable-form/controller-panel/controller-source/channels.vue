<template>
    <transition name="scale-list">
        <div class="channels">
            <div class="controller-source-lib">
                <!-- 一级列表-素材类别选择 -->
                <transition name='slide-left'>
                    <ul v-if="pageShow === 'start'" class="controller-source-types">
                        <li class="group-name" v-if="!isRealtimeJourney">{{'dragJourney.traditional' | t}}</li>
                        <!-- 邮件 -->
                        <li class="label" @click="gopage('email')">
                            {{'dragJourney.email' | t}}<i class="icon icon-fanhui start-back"></i>
                        </li>
                        <!-- 批次邮件 -->
                        <li class="label" v-show="isNike" @click="gopage('emailTemplate')">
                            {{'dragJourney.emailTemplate' | t}}<i class="icon icon-fanhui start-back"></i>
                        </li>
                        <!-- 短信 -->
                        <li class="label" @click="gopage('sms')">
                            {{'dragJourney.sms' | t}}<i class="icon icon-fanhui start-back"></i>
                        </li>
                        <!-- 彩信 -->
                        <li class="label" @click="gopage('mms')">
                            {{'dragJourney.mms' | t}}<i class="icon icon-fanhui start-back"></i>
                        </li>
                        <!-- 微信类消息 -->
                        <template v-if="!isRealtimeJourney">
                            <li class="group-name">{{'dragJourney.wechat' | t}}</li>
                            <!-- 群发消息 -->
                            <wechat-sub-channels v-if="!isRealtimeJourney" :title="$t('massSend.massSend')" :expand="massExpand"
                                @toggle="toggleView('massExpand')" @pick="gopage('picText', $event)" />
                        </template>
                        <!-- 客服消息 -->
                        <wechat-sub-channels :title="$t('dragJourney.wechatMessages')" :expand="svcExpand"
                            :types="[5, 4, 1, 2, 3, 6, 7, 8]" @toggle="toggleView('svcExpand')" @pick="gopage('service', $event)" />
                        <!-- 模板消息 -->
                        <li class="label"
                            @click="gopage('template')">
                            {{'dragJourney.wechatTemplates' | t}}<i class="icon icon-fanhui start-back"></i>
                        </li>
                        <!-- 企业微信 title -->
                        <li class="group-name">{{'dragJourney.wechatWork' | t}}</li>
                        <!-- 企业群发 -->
                        <li class="label" v-if="!isRealtimeJourney" @click="gopage('groupmsg')">
                            {{'dragJourney.groupmsg' | t}}<i class="icon icon-fanhui start-back"></i>
                        </li>
                        <!-- 应用消息 -->
                        <li class="label" @click="gopage('agentmsg')">
                            {{'dragJourney.agentmsg' | t}}<i class="icon icon-fanhui start-back"></i>
                        </li>
                    </ul>
                </transition>
                <!-- 二级列表-素材控件列表 -->
                <transition name='slide-right'>
                    <div v-if="pageShow !== 'start'" class="controller-source-list">
                        <div class="go-back" :class="{accountBack: showPublicAccount}" @click="gopage('start')">
                            <i class="icon icon-fanhui1"></i>
                        </div>
                        <!--公众号-->
                        <public-account class="lg" v-show="showPublicAccount" module="journey" @select="selectAccount"
                                        :disabled="accountDisabled"/>
                        <!-- 以下微信类子组件 不显示工具栏：4文本 6外部页 7表单 8小程序卡片
                            订阅号类型的模版消息 不显示工具栏-->
                        <div class="tool-bar"
                            v-if="![4, 6, 7, 8].includes(wechatMsgType) && !wecomWorkType && !(pageShow === 'template' && isSubscriptionAccount)">
                            <div class="sort">
                                <span>{{'dragJourney.sortBy' | t}}：</span>
                                <span v-title:top="$t('dragJourney.sort')" @click="contactSort('updateSort')">
                                    {{(sort.updateSort ? 'dragJourney.dateAsc' : 'dragJourney.dateDesc') | t}}
                                </span>
                                <span v-title:top="$t('dragJourney.sort')" @click="contactSort('nameSort')">
                                    {{(sort.nameSort ? 'dragJourney.nameAsc' : 'dragJourney.nameDesc') | t}}
                                </span>
                            </div>
                            <div class="tools">
                                <div @click="createMaterialRoute">
                                    <i v-title:top="$t('dragJourney.add')" class="icon icon-plus"></i>
                                </div>
                                <div @click="refreshMaterial()">
                                    <i v-title:top="$t('dragJourney.refresh')" class="icon icon-refresh"></i>
                                </div>
                                <div v-show="pageShow !=='template'" @click="closeSearch()">
                                    <i v-title:top.line="$t('dragJourney.search')" class="icon icon-search"></i>
                                </div>
                            </div>
                            <transition name="search-box">
                                <div v-show="search.searchShow" class="search" @keydown.enter="searchContact()">
                                    <input type="text" maxlength="100" :placeholder="$t('dragJourney.search')"
                                        v-model.trim="search.content">
                                    <i @click="searchContact()" class="icon icon-search"></i>
                                    <i @click="closeSearchList" class="icon icon-close"></i>
                                </div>
                            </transition>
                        </div>
                        <div class="tips-box" v-if="pageShow === 'template' && isSubscriptionAccount">
                            <alert class="alert tips" :message="$t('massSend.functionDisabledTip')" type="info" showIcon />
                        </div>
                        <template v-else-if="![4, 6, 7, 8].includes(wechatMsgType)">
                            <ul v-if="contentList.length" class="controller-contents" v-load="loadMore"
                                :class="{searching: search.searchShow, 'service-center-message': !isRealtimeJourney && pageShow === 'service'}">
                                <li v-for="item in contentList" :key="item.id" draggable
                                    @dragstart="labelDragStart($event, item)" @dragend="labelDragEnd">
                                    <div class="title-box" :class="{
                                        'pic-summary': wechatMsgType === 1 || wechatMsgType === 3,
                                        'with-char-count': pageShow === 'sms' || pageShow === 'mms'
                                    }">
                                        <p class="name" :title="item.name">{{item.name}}</p>
                                        <p class="light-content-text">{{item.time}}</p>
                                    </div>
                                    <template v-if="pageShow === 'sms'">
                                        <span class="char-count">
                                            {{item.contentCount + item.signatureLength}}
                                            {{'dragJourney.char' | t}}
                                        </span>
                                        <span>
                                            {{Math.ceil((item.contentCount + item.signatureLength) / 72)}}
                                            {{'dragJourney.smsUnit' | t}}
                                        </span>
                                    </template>
                                    <template v-if="pageShow === 'mms'">
                                        <span class="char-count">{{availableKB(item)}}</span>
                                        <span>
                                            {{item.materialContent.length}}
                                            {{'dragJourney.smsUnit' | t}}
                                        </span>
                                    </template>
                                    <div v-if="wechatMsgType === 1" class="preview-btn zoom" @click="previewPic(item.url)">
                                        <img :src="item.url" :alt="item.name">
                                    </div>
                                    <!-- 视频类型可弹出预览 -->
                                    <a v-if="wechatMsgType === 3 && item.url && item.url.indexOf('mp.weixin.qq.com') !== -1"
                                        class="preview-btn play" :href="item.url" target="_blank">
                                        <img src="../../../../wechat/material/images/videoPlay.png" :alt="item.name">
                                    </a>
                                    <i class="icon icon-tuozhuai"></i>
                                </li>
                            </ul>
                        </template>
                        <div v-else-if="wechatMsgType" class="drag-box" draggable @dragstart="labelDragStart($event)"
                            @dragend="labelDragEnd">
                            <div class="controller-icon">
                                <svg aria-hidden="true">
                                    <use v-bind:xlink:href="'#' + wechatIcon"></use>
                                </svg>
                            </div>
                        </div>
                        <div v-if="wecomWorkType" class="drag-box" draggable @dragstart="labelDragStart($event,wecomWorkType)"
                            @dragend="labelDragEnd">
                            <div class="controller-icon">
                                <svg aria-hidden="true">
                                    <use v-bind:xlink:href="'#' + wechatWorkIcon"></use>
                                </svg>
                            </div>
                        </div>
                        <inline-loading v-if="loading"/>
                        <template v-else-if="contentList.length === 0 && ![0, 4, 6, 7, 8].includes(wechatMsgType)">
                            <list-empty v-if="!search.searchShow"/>
                            <list-search-empty v-else
                                               @action="goBack"
                                               :action="$t('common.back')"/>
                        </template>

                        <div v-if="pageShow === 'service' && wechatMsgType === 5" class="service-hint">
                            <i class="icon icon-yiwen2"></i>
                            {{'wechatContent.oneItemOnly' | t}}
                        </div>
                    </div>
                </transition>
            </div>
            <!-- 预览 -->
            <modal :title="$t('wechatContent.previewPic')" size="lg" v-if="previewShow" @close="closeImgPreview">
                <img class="preview-image" :src="previewUrl" alt="">
            </modal>
        </div>
    </transition>
</template>
<script type="text/ecmascript-6">
    import { SmsServiceApiV1, JourneyMaterialApiV1, GeteOriginApi, WechatApiV1 } from '@/api';
    import {UNSUBSCRIBE_SMS_POSTFIX} from '../../../material/form/sms-material-form.vue';
    import {logError} from '@/monitor.js';
    import {
        EMAIL_CONTROLLER,
        MMS_CONTROLLER,
        SMS_CONTROLLER,
        WECHAT_CONTROLLER,
        EMAILTEMPLATE_CONTROLLER,
        WECOM_CONTROLLER
    } from '../../canvas/controller/CONTROLLER_TYPES';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {UPDATE_PANEL_AUTHORIZERINFO_ID} from '@/store/vuex/mutationTypes';
    import WechatSubChannels from './modules/wechat-sub-channels.vue';
    import {initDragItem} from '@/journey/draggable-form/utils/configHandler';
    import { mapGetters, mapMutations, mapState } from 'vuex';

    const LINK_REG = /<url>.*?<\/url>/gi;
    export default {
        data() {
            return {
                loading: false,
                pageShow: 'start',
                search: {
                    searchShow: false,
                    content: ''
                },
                currentPageNumber: 1,
                sort: {
                    updateSort: true, // true = asc, false = desc
                    nameSort: true
                },
                contentList: [],
                sortStatus: 0,
                totalPages: 0,
                signatures: [],
                departmentId: '', // 部门ID
                searchType: '', // 0 邮件 1短信 2彩信
                publicAccount: {}, // 公众号
                publicAccountList: [], // 公众号列表
                accountDisabled: false, // 公众号可操作
                massExpand: false, // 群发消息展开
                svcExpand: false, // 服务消息展开
                wechatMsgType: 0, // 微信类子组件 5图文 4文本 1图片 2语音 3视频 6外部页 7表单 8小程序卡片
                wecomWorkType: '', // 企业微信控件类型 groupmsg企业群发 agentmsg应用消息
                previewShow: false,
                previewUrl: ''
            };
        },
        computed: {
            ...mapGetters(['onPending']),
            ...mapState({
                // 是否是 nike 账号
                isNike: state => state.user.isNikeCount,
                isRealtimeJourney: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation.journeyType === 2,
                roleId: state => state.user.roleId,
                authorizerInfoId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].authorizerInfoId
            }),
            //获取账号是否为订阅号
            isSubscriptionAccount() {
                if (!this.publicAccount) return false;
                return this.publicAccount.serviceTypeInfo === 0 || this.publicAccount.serviceTypeInfo === 1;
            },
            // 微信素材-选择公众号
            showPublicAccount() {
                return this.pageShow === 'picText' || this.pageShow === 'service' || this.pageShow === 'template';
            },
            // 无列表拖拽控件的图标
            wechatIcon() {
                switch (this.wechatMsgType) {
                    case 4:
                        return 'icon-wenben';
                    case 6:
                        return 'icon-wangyekuang';
                    case 7:
                        return 'icon-biaodan1';
                    case 8:
                        return 'icon-xiaochengxu1';
                    default :
                        return 'icon-wechat';
                }
            },
            // 企业微信拖拽控件的图标
            wechatWorkIcon() {
                switch (this.wecomWorkType) {
                    case 'groupmsg':
                        return 'icon-tuwenxinxi';
                    case 'agentmsg':
                        return 'icon-message';
                }
            }
        },
        watch: {
            massExpand(val) {
                if (val) {
                    this.svcExpand = false;
                }
            },
            svcExpand(val) {
                if (val) {
                    this.massExpand = false;
                }
            }
        },
        created() {
            // 主账号
            if (this.roleId === 0 || this.roleId === '') {
                SmsServiceApiV1
                    .getSendOutList()
                    .then(res => {
                        if (res.body.data && res.body.data.sendouts) {
                            let sendouts = res.body.data.sendouts;
                            sendouts.forEach((el) => {
                                el.id = el.sendoutId;
                                el.name = el.sendoutName;
                            });
                            this.signatures = sendouts;
                        }
                    });
            } else {
                GeteOriginApi
                    .getAllSendChannel({
                        departmentId: this.departmentId,
                        searchType: 1,
                    })
                    .then(res => {
                        if (res.body.data && res.body.data.sendChannel) {
                            let sendChannel = res.body.data.sendChannel;
                            sendChannel.forEach((el) => {
                                el.name = el.sendAddress;
                            });
                            this.signatures = sendChannel;
                        }
                    });
            }

            this.fetchAccountList();
        },
        methods: {
            ...mapMutations([
                UPDATE_PANEL_AUTHORIZERINFO_ID
            ]),
            createMaterialRoute() {
                const routes = ['imageList', 'audioList', 'videoList', '', 'imageTextCreate'];
                switch (this.pageShow) {
                    case 'email': // 新建邮件素材
                        this.$router.push({name: 'createEmailMethods'});
                        break;
                    case 'emailTemplate': // 新建分批邮件素材
                        this.$router.push({name: 'createEmailMethods'});
                        break;
                    case 'sms': // 新建短信素材
                        this.$router.push({name: 'createSMS'});
                        break;
                    case 'mms': // 新建彩信素材
                        this.$router.push({name: 'createMMS'});
                        break;
                    case 'service': // 新建图文消息（客服消息）
                    case 'picText': // 新建图文消息
                        if (this.$has('wechat_material_add_news')) break;
                        this.$router.push({name: routes[this.wechatMsgType - 1],
                            query: { authorizerInfoId: this.publicAccount.id } });
                        break;
                    case 'template': // 管理微信模板
                        if (this.$has('wechat_template_value_message')) break;
                        this.$router.push({name: 'myTemplate',query: {authorizerInfoId: this.publicAccount.id}});
                        break;
                }
            },
            // 整个彩信素材剩余 KB 数
            availableKB({materialContent}) {
                let total = 0; // KB
                materialContent.forEach(subMaterial => {
                    total += subMaterial.size;
                });
                return `${Math.max(total, 0)
                    .toFixed(2)}kb`;
            },
            goCreate() {
                let {href} = this.$router.resolve(this.createMaterialRoute);
                window.open(href);
            },
            goBack() {
                switch (this.pageShow) {
                    case 'email':
                    case 'emailTemplate':
                    case 'sms':
                    case 'mms':
                        this.search.content = '';
                        this.getMaterialList({reset: true});
                        this.search.searchShow = false;
                        break;
                    // 微信类型：群发消息、客服消息
                    case 'picText':
                    case 'service':
                        if ([1, 2, 3, 5].includes(this.wechatMsgType)) {
                            this.getWechatMaterials(true, this.wechatMsgType);
                            this.search.content = '';
                        }
                        this.search.searchShow = false;
                        this.wechatMsgType = 0;
                        break;
                    default:
                        logError(`[营销旅程] <channels /> goBack 选择了不能识别的步骤标签{pageShow:${this.pageShow}}  :188`);
                        break;
                }
            },
            labelDragStart(e, i) {
                if (this.onPending) {
                    this.$toast(this.$t('dragJourney.delayOperate'),'warn');
                    return;
                }
                e.dataTransfer.setData('text/plain', 'compatFireFox');
                // 文字，表单，外部页，小程序无预置内容
                if (!i) {
                    const config = initDragItem(this.pageShow === 'picText', this.wechatMsgType);
                    let temp = {
                        id: null,
                        name: '',
                        time: '',
                        type: WECHAT_CONTROLLER,
                        msgType: this.wechatMsgType
                    };
                    switch (this.wechatMsgType) {
                        case 4:
                            temp.name = this.$t('common.new') + ' ' + this.$t('QRCode.text');
                            break;
                        case 6:
                            temp.name = this.$t('common.new') + ' ' + this.$t('QRCode.webPage');
                            break;
                        case 7:
                            temp.name = this.$t('common.new') + ' ' + this.$t('form.form');
                            break;
                        case 8:
                            temp.name = this.$t('common.new') + ' ' + this.$t('wechatContent.miniCard');
                            break;
                        default :
                            this.$emit('labelDragStart', i);
                            break;
                    }
                    Object.assign(temp, config);
                    this.$emit('labelDragStart', temp);
                } else if (i === 'groupmsg' || i === 'agentmsg') {
                    //企业微信控件 应用消息：agentmsg，企业群发：groupmsg
                    let initTemp = {
                        type: WECOM_CONTROLLER,
                        subType: i === 'groupmsg' ? 15 : 14,
                        name: i === 'groupmsg' ? this.$t('common.new') + this.$t('dragJourney.groupmsg') :
                            this.$t('common.new') + this.$t('dragJourney.agentmsg')
                    };
                    this.$emit('labelDragStart', initTemp);
                } else {
                    this.$emit('labelDragStart', i);
                }
            },
            labelDragEnd() {
                this.$emit('labelDragEnd');
            },
            closeSearchList() {
                this.search.searchShow = false;
                this.search.content = '';
            },
            // 拖拽控件列表视图
            gopage(page, type) {
                this.pageShow = page;
                switch (page) {
                    // 返回素材分类列表
                    case 'start':
                        this.contentList = [];
                        this.currentPageNumber = 1;
                        this.search.searchShow = false;
                        this.search.content = '';
                        this.sortStatus = null;
                        this.wechatMsgType = 0;
                        this.wecomWorkType = '';
                        break;
                    case 'email':
                    case 'emailTemplate':
                    case 'sms':
                    case 'mms':
                        this.getMaterialList({reset: true});
                        this.search.searchShow = false;
                        this.search.content = '';
                        break;
                    case 'picText':
                    case 'service':
                        this.wechatMsgType = type;
                        if (!this.publicAccountList.length) return;
                        // 只有图文，图片，语音，视频 需要拉取素材列表
                        if ([1, 2, 3, 5].includes(type)) {
                            this.getWechatMaterials(true, type);
                        }
                        this.search.searchShow = false;
                        this.search.content = '';
                        break;
                    case 'template':
                        if (this.publicAccountList.length > 0) {
                            this.search.searchShow = false;
                            this.search.content = '';
                            if (!this.isSubscriptionAccount) {
                                this.getWechatTemplates();
                            }
                        }
                        break;
                    case 'groupmsg':    //企业群发
                        this.wecomWorkType = page;
                        break;
                    case 'agentmsg':    //应用消息
                        this.wecomWorkType = page;
                        break;
                    default:
                        logError(`[营销旅程] <channels /> gopage 选择了无法识别的回复类型{page:${this.pageShow}}  :267`);
                        break;
                }
            },
            // 素材排序
            contactSort(type) {
                switch (this.pageShow) {
                    case 'email':
                    case 'emailTemplate':
                    case 'sms':
                    case 'mms':
                        this.sort[type] = !this.sort[type];
                        if (type === 'updateSort' && this.sort[type] === true) {
                            this.currentPageNumber = 1;
                            this.getMaterialList({reset: true, sort: 0});
                            this.sortStatus = 0;
                        } else if (type === 'updateSort' && this.sort[type] === false) {
                            this.currentPageNumber = 1;
                            this.getMaterialList({reset: true, sort: 1});
                            this.sortStatus = 1;
                        } else if (type === 'nameSort' && this.sort[type] === true) {
                            this.currentPageNumber = 1;
                            this.getMaterialList({reset: true, sort: 2});
                            this.sortStatus = 2;
                        } else if (type === 'nameSort' && this.sort[type] === false) {
                            this.currentPageNumber = 1;
                            this.getMaterialList({reset: true, sort: 3});
                            this.sortStatus = 3;
                        }
                        break;
                    case 'picText':
                    case 'service':
                        this.sort[type] = !this.sort[type];
                        if (type === 'updateSort' && this.sort[type] === true) {
                            this.currentPageNumber = 1;
                            this.sortStatus = 0;
                            this.getWechatMaterials(true, this.wechatMsgType);
                        } else if (type === 'updateSort' && this.sort[type] === false) {
                            this.currentPageNumber = 1;
                            this.sortStatus = 1;
                            this.getWechatMaterials(true, this.wechatMsgType);
                        } else if (type === 'nameSort' && this.sort[type] === true) {
                            this.currentPageNumber = 1;
                            this.sortStatus = 2;
                            this.getWechatMaterials(true, this.wechatMsgType);
                        } else if (type === 'nameSort' && this.sort[type] === false) {
                            this.currentPageNumber = 1;
                            this.sortStatus = 3;
                            this.getWechatMaterials(true, this.wechatMsgType);
                        }
                        break;
                    case 'template':
                        this.sort[type] = !this.sort[type];
                        if (type === 'updateSort' && this.sort[type] === true) {
                            this.sortStatus = 0;
                            this.getWechatTemplates(0);
                        } else if (type === 'updateSort' && this.sort[type] === false) {
                            this.sortStatus = 1;
                            this.getWechatTemplates(1);
                        } else if (type === 'nameSort' && this.sort[type] === true) {
                            this.sortStatus = 2;
                            this.getWechatTemplates(2);
                        } else if (type === 'nameSort' && this.sort[type] === false) {
                            this.sortStatus = 3;
                            this.getWechatTemplates(3);
                        }
                        break;
                    default:
                        logError(`[营销旅程] <channels /> contactSort 出现了无法识别的回复类型{type:${this.pageShow}}  :370`);
                        break;
                }
            },
            loadMore() {
                if (this.loading) return;
                if (this.pageShow === 'email' || this.pageShow === 'sms' || this.pageShow === 'emailTemplate') {
                    if (this.currentPageNumber >= this.totalPages) return;
                    this.currentPageNumber++;
                    this.getMaterialList({reset: false, name: this.search.content, sort: this.sortStatus});
                }
                if (this.pageShow === 'picText' || this.pageShow === 'service') {
                    if (this.currentPageNumber >= this.totalPages) return;
                    this.currentPageNumber++;
                    this.getWechatMaterials(false, this.wechatMsgType);
                }
            },
            // 搜索素材列表
            searchContact() {
                this.currentPageNumber = 1;
                switch (this.pageShow) {
                    case 'email':
                    case 'emailTemplate':
                    case 'sms':
                    case 'mms':
                        this.getMaterialList({
                            reset: true,
                            sort: this.sortStatus,
                            name: this.search.content,
                        });
                        break;
                    case 'picText':
                    case 'service':
                        this.currentPageNumber = 1;
                        this.getWechatMaterials(true, this.wechatMsgType);
                        break;
                    case 'template':
                        this.getWechatTemplates();
                        break;
                    default:
                        logError(`[营销旅程] <channels /> searchContact 搜索前选择了不正确的回复类型{pageShow:${this.pageShow}}  :418`);
                        break;
                }
                // this.getMaterialList({name: this.search.content, reset: true})
            },
            closeSearch() {
                this.search.searchShow = true;
                this.search.content = '';
                // this.getMaterialList({reset: true})
            },
            // 重置素材列表
            refreshMaterial() {
                this.currentPageNumber = 1;
                switch (this.pageShow) {
                    case 'email':
                    case 'emailTemplate':
                    case 'sms':
                    case 'mms':
                        this.getMaterialList({
                            reset: true,
                            sort: this.sortStatus,
                            name: this.search.content
                        });
                        break;
                    case 'picText':
                    case 'service':
                        this.getWechatMaterials(true, this.wechatMsgType);
                        break;
                    case 'template':
                        this.getWechatTemplates();
                        break;
                    default:
                        logError(`[营销旅程] <channels /> refreshMaterial 需要刷新的回复类型无法识别{pageShow:${this.pageShow}},在此之前可能已经出现了类型错误  :457`);
                        break;
                }
            },
            // 以下是 ajax
            getMaterialList({name, sort, reset}) {
                // sort 1更新时间升序；2名称降序；3名称升序；null或者其他更新时间降序
                this.loading = true;
                this.totalPages = 0;
                let type = null;
                if (this.pageShow === 'sms') type = 0;
                if (this.pageShow === 'mms') type = 2;
                if (this.pageShow === 'email') type = 5;
                if (this.pageShow === 'emailTemplate') type = 6;
                if (reset) {
                    JourneyMaterialApiV1
                        .getMaterials('', name, 1, type, sort)
                        .then(({body: {data: {materialList, totalPage}}}) => {
                            this.totalPages = totalPage;
                            this.contentList = materialList.map(item => {
                                if (this.pageShow === 'sms') {
                                    return {
                                        id: item.id,
                                        name: item.materialName,
                                        time: item.updateDate.slice(5),
                                        type: SMS_CONTROLLER,
                                        materialContent: item.materialContent,
                                        signatureId: item.signatureId,
                                        contentCount: this.contentCount(item),
                                        signatureLength: this.getSignatureLength(item)
                                    };
                                }
                                if (this.pageShow === 'mms') {
                                    return {
                                        id: item.id,
                                        name: item.materialName,
                                        time: item.updateDate.slice(5),
                                        type: MMS_CONTROLLER,
                                        materialContent: item.otherCount && item.otherCount.mmsContent ?
                                            item.otherCount.mmsContent : [],
                                        signatureId: item.signatureId,
                                        contentCount: this.contentCount(item),
                                        signatureLength: this.getSignatureLength(item),
                                    };
                                }
                                if (this.pageShow === 'email') {
                                    return {
                                        id: item.id,
                                        name: item.materialName,
                                        time: item.updateDate.slice(5),
                                        type: EMAIL_CONTROLLER
                                    };
                                }
                                if (this.pageShow === 'emailTemplate') {
                                    return {
                                        id: item.id,
                                        name: item.materialName,
                                        time: item.updateDate.slice(5),
                                        type: EMAILTEMPLATE_CONTROLLER
                                    };
                                }
                            });
                            this.loading = false;
                        });
                } else {
                    JourneyMaterialApiV1
                        .getMaterials('', name, this.currentPageNumber, type, sort)
                        .then(({body: {data: {materialList, totalPage}}}) => {
                            this.totalPages = totalPage;
                            this.contentList = this.contentList.concat(materialList.map(item => {
                                if (this.pageShow === 'sms') {
                                    return {
                                        id: item.id,
                                        name: item.materialName,
                                        time: item.updateDate.slice(5),
                                        type: SMS_CONTROLLER,
                                        materialContent: item.materialContent,
                                        signatureId: item.signatureId,
                                        contentCount: this.contentCount(item),
                                        signatureLength: this.getSignatureLength(item)
                                    };
                                }
                                if (this.pageShow === 'mms') {
                                    return {
                                        id: item.id,
                                        name: item.materialName,
                                        time: item.updateDate.slice(5),
                                        type: MMS_CONTROLLER,
                                        materialContent: item.otherCount.mmsContent,
                                        signatureId: item.signatureId,
                                        contentCount: this.contentCount(item),
                                        signatureLength: this.getSignatureLength(item),
                                    };

                                }
                                if (this.pageShow === 'email') {
                                    return {
                                        id: item.id,
                                        name: item.materialName,
                                        time: item.updateDate.slice(5),
                                        type: EMAIL_CONTROLLER
                                    };
                                }
                                if (this.pageShow === 'emailTemplate') {
                                    return {
                                        id: item.id,
                                        name: item.materialName,
                                        time: item.updateDate.slice(5),
                                        type: EMAILTEMPLATE_CONTROLLER
                                    };
                                }

                            }));

                            this.loading = false;
                        });
                }
            },
            contentCount(item) {
                const materialContent = item.otherCount && item.otherCount.mmsContent ?
                    item.otherCount.mmsContent : item.materialContent;
                //有短链
                LINK_REG.lastIndex = 0;
                if (LINK_REG.test(materialContent)) {
                    return (
                        materialContent.length
                        - (materialContent.lastIndexOf('</url>') - materialContent.indexOf('<url>') + 6)
                        + 14
                        + UNSUBSCRIBE_SMS_POSTFIX.length
                    );
                }
                return materialContent.length + UNSUBSCRIBE_SMS_POSTFIX.length;
            },
            getSignatureLength(sms) {
                if (sms.signatureId === null) {
                    return 0;
                }
                for (let signature of this.signatures) {
                    if (signature.id === sms.signatureId) {
                        return signature.name.length;
                    }
                }
            },
            /**
              * 获取微信消息列表
              * @param {boolean} reset
              * @param {string | number} type 微信消息类型
              */
            getWechatMaterials(reset, type) {
                this.totalPages = 0;
                this.loading = true;
                this.accountDisabled = true;
                let dummyLs = [];
                const config = initDragItem(this.pageShow === 'picText', this.wechatMsgType);
                // 客服消息只能选择单图文消息
                const noSubMaterials = this.pageShow === 'service' && this.wechatMsgType === 5;
                const videoType = type === 3 ? 1 : undefined;
                let mpnewsType = type === 5 ? (this.pageShow === 'picText' ? 1 : 2) : '';
                WechatApiV1
                    .getMaterials(
                        this.search.content,
                        this.currentPageNumber,
                        type,
                        null, // status
                        this.sortStatus,
                        noSubMaterials,
                        this.publicAccount.id, // 公众号id
                        videoType, //视频类型的审核通过参数1
                        mpnewsType
                    )
                    .then(({body: {data: {fieldList, totalPage}}}) => {
                        this.totalPages = totalPage;
                        let materialList = mpnewsType === 1 ? fieldList.filter(item => !item.hasOwnProperty('publishStatus')) : fieldList;
                        materialList = materialList.filter(material => material.hasOwnProperty('mediaId') || material.hasOwnProperty('articleId'));
                        for (let item of materialList) {
                            let temp = {
                                id: null,
                                name: '',
                                time: '',
                                type: WECHAT_CONTROLLER,
                                msgType: this.wechatMsgType
                            };
                            temp.id = item.id;
                            temp.name = this.wechatMsgType === 1 || this.wechatMsgType === 2 ? item.name : item.title;
                            temp.time = item.updateDateString.slice(5);
                            if (this.wechatMsgType === 1 || this.wechatMsgType === 3) {
                                temp.url = item.url;
                            }
                            Object.assign(temp, config);
                            dummyLs.push(temp);
                        }
                        if (reset) {
                            this.contentList = dummyLs;
                            this.loading = false;
                            this.accountDisabled = false;
                        } else {
                            this.contentList = this.contentList.concat(dummyLs);
                            this.loading = false;
                            this.accountDisabled = false;
                        }
                        if (type === 5 && this.contentList.length < 10 && this.currentPageNumber < totalPage) {
                            this.currentPageNumber++;
                            this.getWechatMaterials(false, 5);
                        }
                    })
                    .catch(() => {
                        this.loading = false;
                        this.accountDisabled = false;
                    });
            },
            /**
             * 获取模板消息
             * @param sort 排序
             * @param officilaId 公众号id
             */
            getWechatTemplates(sort = null) {
                this.loading = true;
                WechatApiV1
                    .templateList(this.publicAccount.id, '', 1, sort)
                    .then(({body: {data: {wxTemplateList}}}) => {
                        this.contentList = wxTemplateList.map(item => ({
                            id: item.id,
                            name: item.title,
                            time: item.updateDate,
                            type: WECHAT_CONTROLLER,
                            wechatType: 'template',
                            subType: 2
                        }));

                        this.loading = false;
                        this.accountDisabled = false;
                    })
                    .catch(() => {
                        this.loading = false;
                        this.accountDisabled = false;
                    });
            },
            // 获取公众号列表
            fetchAccountList() {
                WechatApiV1
                    .getWechatAccounts()
                    .then(res => {
                        let authList = res.body.data.authorizerInfoList;
                        this.publicAccountList = authList.map(auth => ({
                            id: auth.authorizerInfoId,
                            WxAppId: auth.WxAppId,
                            name: auth.principalName,
                            serviceTypeInfo: auth.serviceTypeInfo,
                        }));

                        if (this.publicAccountList.length > 0) {
                            // 查找当前旅程store中是否选择了公众号
                            const aId = this.authorizerInfoId;
                            if (aId) {
                                // 回显上次选择的公众号
                                this.publicAccount = this.publicAccountList.$getByKey(aId);
                            } else {
                                // 否则默认选中列表中的第一项，并commit进状态库
                                this.publicAccount = this.publicAccountList[0];
                                this.UPDATE_PANEL_AUTHORIZERINFO_ID(this.publicAccount.id);
                            }
                        }
                    });
            },
            // 选择公众号
            selectAccount(account) {
                this.accountDisabled = true;
                this.publicAccount = account;
                this.contentList = [];
                this.currentPageNumber = 1;
                this.search.content = '';
                switch (this.pageShow) {
                    case 'picText':
                    case 'service':
                        this.getWechatMaterials(true, this.wechatMsgType);
                        break;
                    case 'template':
                        if (!this.isSubscriptionAccount) {
                            this.getWechatTemplates();
                        } else {
                            this.accountDisabled = false;
                        }
                        break;
                }
                this.UPDATE_PANEL_AUTHORIZERINFO_ID(this.publicAccount.id);
            },
            /**
              * 切换微信消息抽屉
              * @param {String} type 目标类型
              */
            oggleView(type) {
                this[type] = !this[type];
            },
            /**
              * 切换微信消息抽屉
              * @param {String} type 目标类型
              */
            toggleView(type) {
                this[type] = !this[type];
            },
            /**
             * 展示图片素材详情
             * @param {string} url 图片地址
             */
            previewPic(url) {
                if (!url) return;
                this.previewShow = true;
                this.previewUrl = url;
            },
            closeImgPreview() {
                this.previewShow = false;
                this.previeUrl = '';
            },

        },
        components: { WechatSubChannels }
    };
</script>
<style lang="scss">
    @import "controller-source-lib";

    // Fix-9126. 样式表为多处所用， 不更改引用样式表
    .channels {
        .controller-source-lib {
            .controller-source-list {
                .controller-contents {
                    li {
                        width: 294px;

                        .title-box {
                            flex: 1;
                            max-width: 20em;
                            &.with-char-count {
                                max-width: 14em;
                            }
                        }

                        .char-count {
                            margin-right: 5px;
                        }
                    }
                }
            }
        }
        .tips-box {
            width: 270px;
            padding: 10px;
            .tips {
                width: 100%;
            }
        }
    }
</style>
