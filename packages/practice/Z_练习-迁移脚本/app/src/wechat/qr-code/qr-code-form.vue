<template>
    <div class="qr-code-form">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <div class="pull-right">
                    <button type="button" class="btn btn-md btn-theme-border" @click='returnBack'>
                        {{'common.back' | t}}
                    </button>
                    <button type="button" class="btn btn-md btn-theme" @click="confirm"
                            :disabled="loading">{{'common.confirm' | t}}
                    </button>
                </div>
                <h1>{{subscriptionName}}</h1>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view white-bg padding margin form-container">
                <div class="form-field flex">
                    <label class="label">{{'QRCode.amount' | t}}</label>
                    <p class='create-buttons'>
                        <button class='create-button single-create-button' @click='createSingleBtn'
                                :class='{active:isSingleCreate,disabled:isUpdate}' :disabled='isUpdate'>
                            {{'QRCode.single' | t}}
                        </button>
                        <button class='create-button bulk-create-button' @click='bulkCreateBtn'
                                :class='{active:isBulkCreate,disabled:isUpdate}' :disabled='isUpdate'>
                            {{'QRCode.multiple' | t}}
                        </button>
                    </p>
                </div>
                <div class='form-field flex'>
                    <label class="label">{{'QRCode.type' | t}}</label>
                    <p v-if='subscriptionId>0'>{{type === 1 ? $t('QRCode.temporary') : $t('QRCode.permanent')}}</p>
                    <template v-else>
                        <radio :source="true" v-model="subscriptionType" :disabled='isUpdate'>
                            {{'QRCode.temporary' | t}}
                        </radio>&nbsp;&nbsp;
                        <radio :source="false" v-model="subscriptionType" :disabled='isUpdate'>
                            {{'QRCode.permanent' | t}}
                        </radio>&nbsp;
                        <i class="icon icon-yiwen1" v-title:right="$t('QRCode.permanentDesc')"></i>
                    </template>
                </div>
                <div class='form-field'>
                    <label class="label" v-if='isBulkCreate'>{{'QRCode.preFix' | t}}</label>
                    <label class="label" v-else>{{'QRCode.name' | t}}</label>
                    <input type='text'
                           :placeholder="isBulkCreate? $t('QRCode.enterPreFix') : $t('QRCode.search')"
                           class='input lg'
                           v-model.trim='name'
                           v-title:top.line.warn="errorText" :class="{error: errorText}"
                           @focusin="errorText = ''" maxlength="30"/>
                </div>
                <div class='form-field name-description' v-if='isBulkCreate'>
                    <label class="label"></label>
                    <span>{{'QRCode.preFixDesc' | t}}</span>
                </div>
                <div class='form-field flex' v-if='isBulkCreate'>
                    <label class="label">{{'QRCode.multipleName' | t}}</label>
                    <div class="upload-file"><label class="upload-btn pull-left btn btn-md btn-theme">
                        {{'QRCode.upload' | t}}
                        <input type="file" ref="inputFile"
                               accept="text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                               @change="uploadFile" style='display:none'>
                    </label>&nbsp;<a class='action-text' @click="downloadDetailFlag = true">{{'downloadDetails.download'
                        | t}}</a>
                    </div>
                </div>
                <div class='form-field content-detail-fans'>
                    <label class="label">{{'QRCode.followerTags' | t}}</label>
                    <div class='content-input' v-blur="cancelOpenFans">
                        <div class='query-filter-label-value' @click="inputFocusFans">
                            <div class="value-item " v-for="(option,index) in checkedItem" :key="option.id">
                                {{option.name}}
                                <button ref="button" tabindex="-1" class="icon icon-close"
                                        @click="delItemFans(index)"></button>
                            </div>
                            <div class="keyword-input inputType">
                                <input ref="inputFans"
                                       style='width:110px' class='input-label'
                                       @focus="openFans" @keyup.delete="deleteSelectFans" maxlength="0">
                            </div>
                            <transition name='drop'>
                                <div class='selector-group' v-show='isShowFansSelection'
                                     :class="{'selector-content':checkedItem.length>0}">
                                    <span v-if='fansList.length===0'>{{'QRCode.noTags' | t}}</span>
                                    <p v-for='item in fansList' class='drop-down' :key="item.id">
                                        <checkbox :source="item" v-model="checkedItem">&nbsp;&nbsp;{{item.name}}
                                        </checkbox>
                                    </p>
                                </div>
                            </transition>
                        </div>
                    </div>
                    &nbsp;<i class="icon icon-yiwen1" v-title:right="$t('QRCode.followerTagsDesc')"></i>
                </div>
                <div class='form-field content-detail-vip'>
                    <label class="label">{{'QRCode.DmartechLabels' | t}}</label>
                    <selector-tree :options='groupList' @checkOptions='checked($event)' v-model='checkedVipItem' :maxlength="200"/>
                </div>
                <div class="form-field">
                    <label class="label">{{'QRCode.codeGroup' | t}}</label>
                    <radio source="use" v-model="groupSource">{{'QRCode.chooseGoup' | t}}</radio>
                    <radio source="create" v-model="groupSource" :disabled="$has('wechat_qrcode_add_group')">
                        {{'QRCode.newGroup' | t}}
                    </radio>
                </div>
                <div class='form-field'>
                    <div class="form-field" v-if="groupSource === 'create'">
                        <label class="label"></label>
                        <input type="text" class="input lg" :placeholder="$t('material.groupName')"
                               v-model.trim="groupName" maxlength="255">
                    </div>
                    <div class="form-field">
                        <label class="label placeholder" for="use">
                            {{groupSource === 'create' ? $t('common.parentGroup') :
                            $t('newJourney.selectGroup')}}</label>
                        <div class="choose-parent choose-group" id="use" @click.stop="readyCheckGroup">
                            <label class="select-text">
                                {{parentGroupName || $t('common.selectHolder')}}
                                <span class="select-icon icon icon-arrow-down"></span>
                            </label>
                            <div class="search-tree-wrapper" v-if="groupSelectShow" @click.stop>
                                <search-tree :searchTreeData="orderOptions" :treeActiveId="groupId"
                                             @getTreeAct='getTreeAct' :action="false"
                                             :levelStage="groupSource === 'use'"></search-tree>
                            </div>

                        </div>
                    </div>
                </div>
                <div class='form-field flex'>
                    <label class="label reply">{{'QRCode.replyAfterScan' | t}}</label>
                    <material-editor v-model="material" :types="types"
                                     ref="material" :no-sub-materials="true"/>
                </div>
            </div>
        </div>

        <!--华为2.4.6下载详情-->
        <download-detail-modal v-if="downloadDetailFlag" :themeModules="'qrCode'" :emailDownload="false"
                               @okDownload="okDownload" @cancel="cancelDownload"></download-detail-modal>
    </div>
</template>
<script type="text/ecmascript-6">
    import { ContactApiV1, WechatApiV1 } from '@/api';
    import MaterialEditor from '../material/material-editor.vue';
    import LINKS from '../../LINKS';
    import SelectorTree from '../../common/components/selector-tree.vue';
    import {COMMON_NAME_REGEXP} from '../../common/utils/regs';
    import {logError, trackEvent} from '../../monitor';
    import { mapGetters } from 'vuex';

    export default {
        components: {
            MaterialEditor,
            SelectorTree
        },
        data() {
            return {
                loading: false,
                qrCode: {},      // 二维码详情
                checkedItem: [], // 选中的粉丝标签list
                checkedVipItem: [], // 选中的会员标签list
                groupList: [],          // 分组列表
                subscriptionType: true, // 类型 1临时 2 永久
                // 选中的素材
                material: {
                    replyType: 0,
                    type: 0,
                    content: '',
                },
                orderOptions: [], // 分组树形数据
                isSingleCreate: true, // 单个创建
                isBulkCreate: false, // 批量创建
                groupId: '', // 二维码分组
                subscriptionId: -1, // 粉丝标签分组
                subscriptionName: '', // 页面 title
                // 扫码回复类型  0不回复；1图片；2语音；3视频；5图文；'text'文本；6链接（外部页）；7表单；8小程序卡片 9菜单消息（非Pall用户）
                types: [0, 5, 'text', 1, 2, 3, 6, 7, 8],
                createType: 1, // 创建数量：1单个创建，2批量创建
                type: 1, // 二维码类型：1临时，2永久
                name: '', // 二维码名称/二维码名称前缀
                isUpdate: false, // 是否是更新二维码
                idArray: [], // 标签中被选中的id数组
                fileName: '', // 文件名
                // 下载地址
                downloadUrl: LINKS.WECHAT_API_BASE + '/api/web-api/wechat/v1/quickMarks/downloadQRCodeTemplate',
                errorText: '', // 二维码名称 错误提示
                errorTextGroup: '', // group 错误提示
                fansList: [],   // 粉丝列表
                isShowFansSelection: false, // 是否显示粉丝标签下拉列表
                fansIdArray: [], // 粉丝标签 ids
                allLabelList: [], // 标签列表
                replyType: '', // 回复类型
                reply: '', // 回复内容
                oldExtensionValueId: '', // 历史数据的表单ID
                groupSource: 'use',   // use 使用已有的分组 create 创建新的分组
                groupName: '',  // 分组名
                parentGroupName: '',    // 父级分组名
                groupSelectShow: false, // 是否已选分组
                downloadDetailFlag: false, // 是否显示下载详情弹窗
            };
        },
        computed: {
            // 面包屑
            crumbs() {
                return [
                    {name: 'wechat', text: 'Dmartech'},
                    {name: 'subscriptionManage', text: this.$t('home.subscriptionManage')},
                    {name: 'qrCodeEdit', text: this.subscriptionName}
                ];
            },
            ...mapGetters([
                'isPallUser',
            ]),
        },
        watch: {
            // 新建、选择分组时 获取父级name和id
            groupSource() {
                if (this.groupSource === 'create') {
                    this.parentGroupName = this.orderOptions[0].name;
                    this.groupId = this.orderOptions[0].id;
                    this.orderOptions[0].noSelect = true;
                }
                if (this.groupSource === 'use') {
                    // 默认选中 默认分组 id
                    let r = this.$getCurrentPart(1, this.orderOptions[0].childs);
                    let defaultId = r.id;
                    let routeId = this.$route.query.groupId;
                    if (!routeId || routeId === defaultId || routeId <= 0) {
                        this.groupId = defaultId;
                        this.parentGroupName = r.name;
                    } else {
                        this.groupId = routeId;
                        let p = this.$getPartById(Number(this.groupId), this.orderOptions);
                        this.parentGroupName = p.name;
                    }
                    // 全部分组不得点击 jira-9906
                    this.orderOptions[0].noSelect = false;
                }
                // 切换radio时，选中分组的所有父级展开
                this.fathersOpen(this.orderOptions, Number(this.groupId));
            },

            subscriptionType(val) {
                this.type = val ? 1 : 2;
            },
            checkedItem(val) {
                this.fansIdArray = [];
                if (val.length > 20) {
                    this.checkedItem = val.slice(0, 20);
                }
                // 获取被选中的粉丝ID
                for (let i = 0; i < val.length; i++) {
                    this.fansIdArray.push(val[i].id);
                }
            },
            checkedVipItem(val) {
                this.idArray = [];
                // 获取被选中的会员标签ID
                for (let i = 0; i < val.length; i++) {
                    this.idArray.push(val[i].id);
                }
            },
        },
        mounted() {
            // Pall中国限定 除Pall用户以外的标准用户，才有【菜单消息】
            if (!this.isPallUser) {
                this.types.push(9);
            }
            //点击其他地方下拉菜单收起
            window.addEventListener('click', this.eventListener);

            this.getGroup();
            this.subscriptionId = this.$route.params.id;

            if (parseInt(this.subscriptionId) > 0) {
                this.subscriptionName = this.$t('QRCode.edit');
                this.isUpdate = true;
                this.isSingleCreate = false;
                this.isBulkCreate = false;
                this.getSubscriptionDetails(this.subscriptionId);
                return;
            }
            this.getVipLabel();
            this.getLabel();
            
            this.groupId = this.$route.query.id > 0 ? this.$route.query.id : '';
            this.isUpdate = false;
            this.subscriptionName = this.$t('QRCode.create');
        },
        methods: {
            //选中分组的所有父级元素open=true
            fathersOpen(list, id) {
                let fathersArr = [];
                fathersArr = this.$getCurrentFathers(list, id);
                fathersArr.forEach(item => {
                    item.open = true;
                });
            },
            // 下拉菜单的收起
            eventListener() {
                this.groupSelectShow = false;
            },
            // 选择分组
            readyCheckGroup() {
                this.groupSelectShow = !this.groupSelectShow;
            },
            // 取消选择分组
            closeGroupSelect() {
                this.groupSelectShow = false;
            },
            // search-tree中选择list的某一项时  接收选中项
            getTreeAct(group) {
                this.groupId = group.id;
                this.parentGroupName = group.name;
                this.groupSelectShow = false;
            },
            //粉丝标签点击时获取焦点
            inputFocusFans() {
                if (this.$refs.inputFans.focus) {
                    this.$refs.inputFans.focus();
                } else {
                    this.$refs.inputFans.$el.focus();
                }
            },
            // 点击删除粉丝标签存在的选项
            delItemFans(index) {
                let value = this.checkedItem.slice();
                value.splice(index, 1);
                this.checkedItem = value;
                if (this.$refs.inputFans.focus) {
                    this.$refs.inputFans.focus();
                } else {
                    this.$refs.inputFans.$el.focus();
                }
            },
            // 删除已选中粉丝标签的选项（delete按键）
            deleteSelectFans(e) {
                if (!e.isComposing && this.checkedItem.length > 0) {
                    this.checkedItem.pop();
                }
            },
            // 获取二维码详情
            async getSubscriptionDetails(id) {
                this.$loading();
                await WechatApiV1
                    .getSubscriptionDetail(id)
                    .then((res) => {
                        this.$loaded();
                        const detail = res.body.data;
                        this.qrCode = detail;
                        this.type = detail.type;
                        this.name = detail.name;
                        this.idArray = detail.contactFilters;
                        this.fansIdArray = detail.tags;
                        this.rebackTag();
                        this.rebackFansTag();
                        if (detail.material) {
                            this.material = detail.material;//（必填）
                        }
                        // 获取回复类型
                        this.replyType = detail.replyType;
                        if (this.replyType !== 'text') {
                            this.material.content = '';
                        }
                        if (this.replyType === 'sheet') {
                            this.material = this.formSetMaterial(detail);
                        }
                        // 回复类型
                        switch (this.replyType) {
                            // 小程序卡片
                            case 'miniprogrampage':
                                this.material = {
                                    type: 8,
                                    url: detail.material.url,
                                    miniprogramTitle: detail.miniprogramTitle || '',
                                    miniprogramAppid: detail.miniprogramAppid || '',
                                    pagePath: detail.pagePath,
                                    name: detail.material.name,
                                    updateDateString: detail.material.updateDateString,
                                    materialId: detail.material.mediaId,
                                    miniprogramId: detail.miniprogramId,
                                };
                                this.reply = detail.material.mediaId;
                                break;
                            // 外部页
                            case 'external':
                                this.material = {
                                    type: 6,
                                    url: detail.externalImageUrl || detail.material.url,
                                    exUrl: detail.externalUrl || '',
                                    exTitle: detail.externalTitle || '',
                                    exDescribe: detail.externalDescription || '',//2.5.2外部页添加描述
                                    name: detail.material.name,
                                    updateDateString: detail.material.updateDateString,
                                    mediaId: detail.material.mediaId,
                                };
                                this.reply = detail.material.mediaId;
                                break;
                            // 文字
                            case 'text':
                                this.material = {
                                    type: 'text',
                                    content: detail.reply,
                                };
                                break;
                            // 图文消息
                            case 'news':
                                this.material.type = 5;
                                break;
                            // 图片
                            case 'image':
                                this.material.type = 1;
                                break;
                            // 视频
                            case 'video':
                                this.material.type = 3;
                                break;
                            // 音频
                            case 'voice':
                                this.material.type = 2;
                                break;
                            // 不回复
                            case 'noReply':
                                this.material.type = 0;
                                break;
                            case 'menuMessage':
                                this.material.type = 9;
                                this.material.menuMessage = detail.menuMessage;
                                break;
                        }
                        this.groupId = detail.quickMarkGroups[0];
                        let p = this.$getPartById(this.groupId, this.orderOptions);
                        this.parentGroupName = p.name;
                        this.fathersOpen(this.orderOptions, Number(this.groupId));
                    })
                    .catch(() => {
                        this.$loaded();
                        this.getLabel();
                        this.getVipLabel();
                    });
            },
            // 获取所有会员标签
            rebackTag() {
                const sortType = 1; // 分组默认排序
                ContactApiV1
                    .getGroups(sortType)
                    .then((res) => {
                        this.$loaded();
                        this.groupList = res.body.data.rootGroup.childs;
                        // 将选中的会员标签回显
                        if (this.idArray.length > 0) {
                            this.allLabelList = [];
                            this.groupList.filter(item => {
                                if (item.labels.length > 0) {
                                    this.allLabelList = this.allLabelList.concat(item.labels);
                                }
                                item.childs.filter(label => {
                                    if (label.labels.length > 0) {
                                        this.allLabelList = this.allLabelList.concat(label.labels);
                                    }
                                    label.childs.filter(name => {
                                        if (name.labels.length > 0) {
                                            this.allLabelList = this.allLabelList.concat(name.labels);
                                        }
                                    });
                                });
                            });
                            this.allLabelList.map(item => {
                                this.idArray.map(contact => {
                                    if (item.id === parseInt(contact)) {
                                        this.checkedVipItem = this.checkedVipItem.concat(item);
                                    }
                                });
                            });
                            if (this.checkedVipItem.length !== this.idArray.length) {
                                // logError(`[微信管理-二维码列表]<qr-code-add.vue> getSubscriptionDetails 不能识别的会员标签ID ${this.idArray} :369`);
                            }
                        }
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 获取所有粉丝标签
            rebackFansTag() {
                this.$loading();
                // 获取所有粉丝标签，将选中的粉丝标签显示
                WechatApiV1
                    .getTagList({openIds: '', type: 0})
                    .then((res) => {
                        this.$loaded();
                        this.fansList = res.body.data.tagList;
                        if (this.fansIdArray.length > 0) {
                            this.fansList.filter(item => {
                                this.fansIdArray.filter(tag => {
                                    //6388 粉丝标签回显更改为使用微信标签tagId
                                    if (item.tagId === parseInt(tag)) {
                                        this.checkedItem = this.checkedItem.concat(item);
                                    }
                                });
                            });
                            if (this.fansIdArray.length !== this.checkedItem.length) {
                                logError(`[微信管理-二维码列表]<qr-code-form.vue> getSubscriptionDetails 不能识别的粉丝标签ID ${this.fansIdArray} :393`);
                            }
                        }
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 获取分组列表
            getGroup() {
                const sortType = 1; // 分组默认排序
                WechatApiV1
                    .getSubscriptionGroup(sortType)
                    .then((res) => {
                        this.orderOptions = [];
                        let test = [];
                        let treeObj = {};
                        treeObj = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.orderOptions.push(treeObj);
                        this.$traverseTree(this.orderOptions, test);
                        this.orderOptions = test;

                        // 选中默认分组
                        let r = this.$getCurrentPart(1, this.orderOptions[0].childs);
                        let defaultId = r.id;
                        let routeId = this.$route.query.groupId;
                        if (!routeId || routeId === defaultId || routeId <= 0) {
                            this.groupId = defaultId;
                            this.parentGroupName = r.name;
                        } else {
                            this.groupId = routeId;
                            let p = this.$getPartById(Number(this.groupId), this.orderOptions);
                            this.parentGroupName = p.name;
                        }
                        // 全部分组不得点击 jira-9906
                        this.orderOptions[0].noSelect = false;
                        this.fathersOpen(this.orderOptions, Number(this.groupId));
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 获取会员标签
            getVipLabel() {
                this.$loading();
                ContactApiV1
                    .getGroups({
                        sortType: this.sortType
                    })
                    .then((res) => {
                        this.groupList = res.body.data.rootGroup.childs;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 获取粉丝标签:全部粉丝标签加载完毕后才可判断是否有选中状态
            getLabel() {
                this.$loading();
                WechatApiV1
                    .getTagList({openIds: '', type: 0})
                    .then((res) => {
                        this.fansList = res.body.data.tagList;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 上传文件
            uploadFile() {
                if (!this.$refs.inputFile.files[0]) return;
                if (this.$refs.inputFile.files[0].size > 2097152) {
                    this.$toast(this.$t('QRCode.file'), 'warn');
                    return false;
                }
                this.$loading();
                WechatApiV1
                    .uploadFile(this.$refs.inputFile.files[0])
                    .then((res) => {
                        this.$loaded();
                        this.fileName = res.body.data.fileName;
                        this.$toast(this.$t('QRCode.uploadSuccess'), 'success');
                        trackEvent('微信管理-二维码-上传文件', {name: this.fileName});
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 点击单个创建
            createSingleBtn() {
                this.createType = 1;
                this.isSingleCreate = true;
                this.isBulkCreate = false;
            },
            // 点击批量创建
            bulkCreateBtn() {
                this.createType = 2;
                this.isSingleCreate = false;
                this.isBulkCreate = true;
            },
            async confirm() {
                // 二维码名称校验
                if (this.name === '') {
                    this.errorText = this.$t('QRCode.nameNotNull');
                    return;
                } else if (!COMMON_NAME_REGEXP.test(this.name)) {
                    this.errorText = this.$t('QRCode.special');
                    return;
                }
                if (this.groupSource === 'create') {
                    if (!this.groupName) {
                        this.errorTextGroup = this.$t('QRCode.groupNameNotNull');
                        return;
                    } else if (!COMMON_NAME_REGEXP.test(this.groupName)) {
                        this.errorTextGroup = this.$t('QRCode.groupSpecial');
                        return;
                    }
                } else {
                    if (!this.groupId) {
                        this.$toast(this.$t('QRCode.selectGroup'), 'warn');
                        return false;
                    }
                }
                // 批量创建确认是否上传文件
                if (this.createType === 2) {
                    if (this.fileName === '') {
                        this.$toast(this.$t('QRCode.validUpload'), 'warn');
                        return false;
                    }
                }
                // 回复类型为表单， 回复样式为外部页时
                if (this.material.type === 7 && this.material.formReplyType === 'external') {
                    if (!this.$refs.material.validFormMaterial()) return;
                    if (!this.$refs.material.validFormTitle()) return;
                }
                if (!this.$refs.material.validAll()) {
                    return;
                }
                // 回复类型信息
                switch (this.material.type) {
                    case 0:
                        this.replyType = 'noReply';
                        this.reply = '';
                        break;
                    case 1:
                        this.replyType = 'image';
                        this.reply = this.material.mediaId;
                        break;
                    case 2:
                        this.replyType = 'voice';
                        this.reply = this.material.mediaId;
                        break;
                    case 3:
                        this.replyType = 'video';
                        this.reply = this.material.mediaId;
                        break;
                    // 回复类型为text时，内容必填
                    case 'text':
                        this.replyType = 'text';
                        //安卓手机微信端a标签内有换行符号会显示代码
                        this.reply = this.material.content.replace(/\r/g, '').replace(/\n<\/a>/g, '</a>\n');
                        break;
                    case 5:
                        this.replyType = 'news';
                        this.reply = this.material.articleId;
                        break;
                    // 回复类型为外部页时，校验链接、标题、素材封面
                    case 6:
                        this.replyType = 'external';
                        this.reply = this.material.mediaId;
                        break;
                    case 7:
                        this.reply = this.replyType === 'sheet' ? this.reply : null;
                        this.replyType = 'sheet';
                        break;
                    // 回复类型为小程序卡片时，校验标题、appid、素材封面
                    case 8:
                        this.replyType = 'miniprogrampage';
                        this.reply = this.material.mediaId;
                        break;
                    // 新增回复类型：菜单消息
                    case 9:
                        this.replyType = 'menuMessage';
                        this.reply = '';
                }

                if (this.groupSource === 'create') {
                    await WechatApiV1
                        .saveOrUpdate({
                            id: 0,
                            name: this.groupName,
                            parentId: this.groupId,
                        })
                        .then((res) => {
                            this.groupId = res.body.data.id;
                        });
                }

                this.loading = true;
                this.$loading();
                const postData = this.arrangePostData(this.subscriptionId);
                // 修改二维码
                if (this.subscriptionId > 0) {
                    WechatApiV1
                        .updateSubscription(postData)
                        .then(() => {
                            this.loading = false;
                            this.$toast(this.$t('common.updateSuccess'), 'success');
                            trackEvent('微信管理-二维码-修改', {id: this.subscriptionId});
                            this.returnBack();
                            this.$loaded();
                        })
                        .catch(() => {
                            this.loading = false;
                            this.$loaded();
                        });
                } else {
                    WechatApiV1
                        .addAubscription(postData)
                        .then(() => {
                            this.$toast(this.$t('common.createSuccess'), 'success');
                            trackEvent('微信管理-二维码-新建', {name: this.name});
                            this.loading = false;
                            this.returnBack();
                            this.$loaded();
                        })
                        .catch(() => {
                            this.loading = false;
                            this.$loaded();
                        });
                }
            },
            // 选择会员标签
            checked(val) {
                this.checkedVipItem = val;
            },
            // 打开粉丝标签选择下拉列表
            openFans() {
                this.isShowFansSelection = true;
            },
            // 取消粉丝标签选择
            cancelOpenFans() {
                this.isShowFansSelection = false;
            },
            // 返回
            returnBack() {
                this.clearData();
                this.$router.go(-1);
            },
            // 清除数据
            clearData() {
                this.name = '';
                this.createType = 1;
                this.groupId = '';
                this.idArray = [];
                this.replyType = '';
                this.fansIdArray = [];
                this.subscriptionType = true;
                this.fileName = '';
                this.keyword = [];
                this.checkedItem = [];
                this.checkedVipItem = [];
                this.material = {
                    type: 0,
                    content: '',
                };
            },
            // 根据素材id获取素材详情
            getMaterialDetail(session) {
                WechatApiV1.getMaterial(session)
                    .then((res) => {
                        this.material = res.body.data.material;
                        this.material.type = 5;
                        this.material.content = '';
                        this.replyType = 'news';
                        this.reply = res.body.data.material.mediaId;
                    });
            },
            //取消下载
            cancelDownload() {
                this.downloadDetailFlag = false;
            },
            //确定下载
            okDownload(info) {
                this.downloadDetailFlag = false;
                let href = this.downloadUrl + '?formatType=' + info.formatType + '&dataFormat=' + info.dataFormat;
                window.open(href);
            },
            arrangePostData(id) {
                const postData = {
                    name: this.name,
                    quickMarkGroups: [this.groupId],
                    contactFilters: this.idArray,
                    replyType: this.replyType,
                    tags: this.fansIdArray,
                    type: this.type,
                    reply: this.reply,
                    // 2.5.5表单添加外部页回复
                    externalImageUrl: this.material.url || this.material.externalImageUrl || '',
                    externalTitle: this.material.exTitle || this.material.externalTitle || '',
                    externalDescription: this.material.exDescribe || this.material.externalDescription || '', // 2.5.2外部页添加描述
                    externalUrl: this.material.exUrl || this.material.sheetUrl || '',
                    fileName: this.fileName,
                    sheetContent: this.material.content,
                    customSheetUrl: this.material.customSheetUrl || '',
                    customFormId: this.material.customFormId || '',
                    extensionValueId: this.oldExtensionValueId,
                    newExtensionValueId: this.material.extensionValueId || '',
                    newSheetId: this.material.id,
                    formReplyType: this.material.formReplyType,
                    sheetUrl: this.material.sheetUrl || '',
                    materialId: this.material.materialId || '',
                    miniprogramAppid: this.material.miniprogramAppid || '',
                    miniprogramTitle: this.material.miniprogramTitle || '',
                    pagePath: this.material.pagePath || '',
                    menuMessage: this.material.menuMessage || null,
                    miniprogramId: this.material.miniprogramId,
                };
                if (id > 0) {
                    postData.id = parseInt(id);
                } else {
                    postData.createType = this.createType;
                }
                return postData;
            },
            formSetMaterial(detail) {
                this.reply = detail.reply === null ? null : parseInt(detail.reply);
                const defaultResult = {
                    replyType: 7,
                    type: 7,
                    content: detail.sheetContent,
                    id: detail.newSheetId ? parseInt(detail.newSheetId) : parseInt(detail.reply),
                    customSheetUrl: detail.customSheetUrl || '',
                    customFormId: detail.customFormId || null,
                    formReplyType: detail.formReplyType || '',
                };
                defaultResult.sheetUrl = detail.sheetUrl;
                if (detail.material) {
                    defaultResult.materialId = detail.material.mediaId;
                }
                this.oldExtensionValueId = detail.extensionValueId || '';
                defaultResult.extensionValueId = detail.newExtensionValueId || detail.extensionValueId;
                if (detail.externalTitle) {
                    defaultResult.externalTitle = detail.externalTitle;
                    defaultResult.externalDescription = detail.externalDescription;
                    defaultResult.externalImageUrl = detail.externalImageUrl;
                    if (detail.material) {
                        defaultResult.updateDateString = detail.material.updateDateString || '';
                        defaultResult.name = detail.material.name || '';
                    }
                }
                return defaultResult;
            }
        }
    };
</script>
<style lang="scss">
    @import '../../common/scss/base/_variables.scss';
    @import '../../common/scss/base/_mixin.scss';
    @import '../material/_material.scss';

    $option-height: $input-field-height;
    $border-radius: 4px;
    $hover-bg: #f8f9fa;

    .qr-code-form {
        .name-description {
            color: $color-light-content;
            line-height: 20px;
            margin-top: 4px;
        }
        // 修复宽度塌陷
        .form-container {
            min-width: 1350px;
        }
        .form-field {
            .content-input {
                display: inline-block;
                position: relative;
            }

            .create-buttons {
                .active {
                    background-color: $theme;
                    border-color: $theme;
                    color: white;
                }

                .disabled {
                    background-color: $content-bg;
                }
            }

            .reply {
                height: 53px;
                line-height: 53px;
                white-space: nowrap;
            }

            .create-button {
                cursor: pointer;
                display: inline-block;
                width: 88px;
                height: 32px;
                line-height: 30px;
                text-align: center;
                border: 1px solid $form-border;
                background-color: white;
            }

            .single-create-button {
                border-radius: 4px 0 0 4px;
                border-right: none;
            }

            .bulk-create-button {
                border-radius: 0 4px 4px 0;
                margin-left: -4px;
            }
        }

        // 粉丝标签选择
        .query-filter-label-value {
            display: inline-flex;
            position: relative;
            flex-wrap: wrap;
            min-width: $form-input-width;
            vertical-align: middle;
            border: 1px solid $form-border;
            padding: 2px 5px 2px 0;
            border-radius: 4px;
            align-items: center;
            cursor: text;
            background-color: white;
            max-width: 600px;
            @include box-sizing();

            .inputType {
                position: relative;
                line-height: 18px;
                margin: 2px 0;

                .input-label {
                    width: 50px;
                    border: 1px solid transparent;
                    background-color: inherit;
                    text-indent: 5px;
                }
            }

            .value-item {
                border: 1px solid #826dee;
                margin: 2px;
                padding-left: 5px;
                border-radius: 3px;
                cursor: pointer;
                @include transition();
                background-color: #f2f0ff;
                color: $purple;
                line-height: 20px;

                &:hover {
                    background-color: #dbd5fb;
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

                    &:hover {
                        background-color: #ef6266;
                        color: white;
                    }
                }
            }

            .selector-group {
                position: absolute;
                left: 0;
                right: 0;
                min-height: $input-field-height;
                max-height: $input-field-height * 8;
                border: 1px solid $border-color;
                border-radius: 4px;
                top: $input-field-height + 4px;
                z-index: $index-menu - 1;
                background-color: #fff;
                overflow: auto;

                .drop-down {
                    margin-left: 8px;
                    display: block;
                    height: $input-field-height;
                    line-height: $input-field-height;
                }
            }
        }

        .choose-group {
            @include chooseGroup();
        }
    }

</style>
