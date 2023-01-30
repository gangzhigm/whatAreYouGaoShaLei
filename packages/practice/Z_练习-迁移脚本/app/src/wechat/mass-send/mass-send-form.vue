<template>
    <div class="content-view padding margin white-bg mass-send-form">
        <div class="form-field">
            <label>{{'massSend.messageType' | t}}</label>
            <br>
            <radio :source="2" v-model="type">{{'massSend.massSend' | t}}</radio>&nbsp;&nbsp;
            <radio :source="3" v-model="type">{{'massSend.serviceMessage' | t}}</radio>&nbsp;&nbsp;
            <radio :source="1" v-model="type" @input="fetchTemplates">{{'massSend.templateMessage' | t}}</radio>
            <p class="light-content-text" v-if="type === 1 && !isSubscriptionAccount">
                {{'massSend.templateMessageContent' | t}}
                <a href="https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1433751288" target="_blank"
                   rel="noopener" class="theme-text"
                   :title="$t('massSend.templateRule')">{{'massSend.templateRule' | t}}</a>
            </p>
            <p v-if="type === 3" class="light-content-text">
                <i class="icon icon-warn"></i>
                {{'massSend.customerTip' | t}}
                <span class="theme-text"
                      v-title:bottom="$t('massSend.behaviorContent')">
                    {{'massSend.interactive' | t}}
                </span>
                {{'massSend.customerServiceTip' | t}}
            </p>
        </div>
        <!-- 群发消息、客服消息 -->
        <template v-if="type === 3 || type === 2">
            <div class="form-field">
                <label v-if="type === 2">{{'massSend.recipient' | t}}</label>
                <label v-if="type === 3">{{'massSend.recipientMessage' | t}}</label>
                <br>
                <selector unique-key="tagId" v-model="tagId" :options="tagList"
                          :search="tagList.length > 10"></selector>
                <span v-if="type === 2 && tagId === 0" class="light-content-text">
                    <i class="icon icon-warn"></i>
                    {{'massSend.imageTextDel' | t}}
                </span>
            </div>
            <div class="form-field">
                <label>{{'massSend.sendType' | t}}</label>
                <br>
                <selector v-model="sendType" :options="sendTypeOptions"></selector>
            </div>
            <div class="form-field" v-if="sendType !== 0">
                <label>{{'massSend.sendTime' | t}}</label>
                <br>
                <calendar :start="nowDate" v-model="sendDate" format="yyyy-mm-dd hh:ii"></calendar>
            </div>
            <div class="form-field">
                <label>{{'massSend.chooseContent' | t}}</label>
                <br>
                <material-editor v-model="material"
                                 :maxLength="type === 2 ? 300 : 600"
                                 v-if="type === 2 || type === 3"
                                 :types="types"
                                 :no-sub-materials="type === 3"
                                  ref="material"
                                 :panelNotice="type === 2 ? $t('QRCode.notOutLink') : ''"
                                 :mpnewsType="this.type === 2 ? 1 : 2"></material-editor>
            </div>
        </template>
        <!-- 模板消息 -->
        <template v-if="type === 1 && !isSubscriptionAccount">
            <div class="form-field">
                <label>{{'massSend.recipient' | t}}</label>
                <br>
                <selector v-model="tagId" unique-key="tagId" :options="tagList" :search="tagList.length > 10"/>
                <template v-if="tagId !== undefined && tagId !== -1">
                    &nbsp;{{'massSend.chooseCustomer' | t}}
                    <strong class="theme-text">{{groupSelectedPn}}</strong>
                    {{groupSelectedPn > 1 ? $t('massSend.users') : $t('massSend.user')}}
                    <template v-if="groupNeedTime">，{{'massSend.needTime' | t}}
                        <strong class="theme-text">{{groupNeedTime}}</strong>
                        {{groupNeedTime === 2 ? $t('massSend.minutes') : $t('massSend.hours')}}
                    </template>
                </template>
            </div>
            <div class="form-field inline">
                <label>{{'massSend.sendType' | t}}</label>
                <br>
                <selector v-model="sendType" :options="sendTypeOptions"></selector>
            </div>
            <div class="form-field" v-if="sendType !== 0">
                <label>{{'massSend.sendTime' | t}}</label>
                <br>
                <calendar :start="nowDate" v-model="sendDate" format="yyyy-mm-dd hh:ii"></calendar>
            </div>
            <div class="form-field">
                <label>{{'massSend.chooseTemplate' | t}}</label>
                <br>
                <div class="template-store">
                    <div class="search-box">
                        <input type="text" id="keyword" v-model.trim="keyword" :placeholder="$t('massSend.keyword')"
                               @keydown.enter="search" maxlength="255">
                        <svg aria-hidden="true" @click="search">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                    <div class="templates">
                        <div class="materials" v-for="material in materials">
                            <div class="material-preview" @click="id = [material.id]"
                                 :class="{selected: id === material.id}">
                                <checkbox :source="material.id" v-model="id" single></checkbox>
                                <div class="previewtext">
                                    <p v-for="list in material.sendContentArr" class="preContent"
                                       :title="rep(list)" v-html="list"></p>
                                </div>
                            </div>
                            <div class="material-info">
                                <a class="material-name" target="_blank">{{material.title}}</a>
                                <p class="material-name">{{material.updateDate}}</p>
                            </div>
                        </div>
                    </div>
                    <inline-loading v-if="loading"></inline-loading>
                    <p v-if="!loading && materials.length === 0" class="tac disabled-text">
                        {{'massSend.noTemplateTip' | t}}
                        <br>
                        <br>
                    </p>
                </div>
            </div>
        </template>
        <!-- 订阅号不支持模板消息功能 -->
        <div v-if="type === 1 && isSubscriptionAccount" class="function-disabled-tip">
            {{'massSend.functionDisabledTip' | t}}
        </div>
        <div class="form-field" v-if="!(type === 1 && isSubscriptionAccount)">
            <!-- type=2 群发消息 -->
            <button v-show="type==2" type="button" class="btn btn-theme btn-md"
                    :disabled="$has('wechat_message_create_message')"
                    @click="submit">{{'massSend.sendMessage' | t}}
            </button>
            <!-- type=3 客服消息 -->
            <button v-show="type==3" type="button" class="btn btn-theme btn-md"
                    :disabled="$has('wechat_message_create_intermessage')"
                    @click="submit">{{'massSend.sendMessage' | t}}
            </button>
            <!-- type=1 模板消息 -->
            <button v-show="type == 1" type="button" class="btn btn-theme btn-md"
                    :disabled="$has('wechat_message_create_templatemessage')"
                    @click="submit">{{'massSend.sendMessage' | t}}
            </button>
        </div>
        <!-- 微信群发 非原创图文处理-->
        <modal :title="$t('massSend.nonOriginal')" v-if="imageTextShow && material.type ==5" @close="imageTextShow = false">
            <div>
                <p>
                    {{'massSend.graphicSpecification' | t}}
                    <a class="detail-url" href="https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Batch_Sends_and_Originality_Checks.html" target="_blank">
                        {{'massSend.detailUrl' | t}}
                    </a>
                </p>
                <h4>{{'massSend.chooseWay' | t}}</h4>
                <div>
                    <radio :source="1" v-model="groupSending">{{'massSend.continueSend' | t}}</radio>
                    <br><br>
                    <radio :source="0" v-model="groupSending">{{'massSend.stopSend' | t}}</radio>
                </div>
            </div>
            <template v-slot:buttons>
                <span>{{'massSend.confirmContent' | t}}</span>
                <input type="button" class="btn btn-md btn-white" :value="$t('common.cancel')" @click="imageTextShow = false">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" @click="graphicProcess">
            </template>
        </modal>
    </div>
</template>
<script type="text/babel">
    import isAfter from 'date-fns/is_after';
    import addSeconds from 'date-fns/add_seconds';
    import format from 'date-fns/format';
    import MaterialEditor from '../material/material-editor.vue';
    import {getDateInstance} from '../../common/utils/dateUtils';
    import {trackEvent} from '../../monitor';
    import { WechatApiV1 } from '@/api';
    const MESSAGE_CACHE_KEY = 'MESSAGE_CACHE_KEY';

    export default {
        components: {
            MaterialEditor
        },
        data() {
            return {
                type: 2,    // 消息类型 1模板消息 2群发消息 3客服消息
                tagId: -1,       // 选中的分组id，-1是占位选项"请选择"的tagId
                tagList: [],     // 联系人分组列表
                groupSelectedPn: 0, // 选中分组中的人数
                groupNeedTime: 0, // 发送信息需要的时间
                // 发送类型
                sendType: 0,
                sendTypeOptions: [
                    {name: this.$t('massSend.sendImm'), id: 0},
                    {name: this.$t('massSend.timingSend'), id: 1}
                ],
                nowDate: format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                // 定时发送
                sendDate: '',

                // 选中的素材
                material: {},

                // 群发时的内容
                textContent: {},
                // 模板素材展示
                keyword: '',
                id: [], // 模板已选 ids
                materials: [],
                loading: true,

                imageTextShow: false,//非图文处理弹窗
                groupSending: 0, //非原创图文 是否继续群发 1：继续群发；0：停止群发
                materialRequest: {}, //接口
            };
        },
        computed: {
            //获取账号是否为服务号
            isSubscriptionAccount() {
                return this.$store.state.user.isSubscriptionAccount;
            },
            types() {
                // material-editor类型：群发消息2为默认，客服消息3新增[外部页，跳转菜单，小程序卡片，菜单消息]项
                return this.type === 2 ? [5, 'text', 1, 2, 3] : [5, 'text', 1, 2, 3, 6, 7, 8, 9];
            }
        },
        mounted() {
            let session = JSON.parse(sessionStorage.getItem('DefaultValue'));
            if (session) {
                this.getMaterialDetail(session);
                sessionStorage.removeItem('DefaultValue');
            }
            WechatApiV1
                .getTagList('')
                .then(res => {
                    this.tagList = [
                        {name: this.$t('massSend.choose'), tagId: -1},
                        {name: this.$t('massSend.allUsers'), tagId: 0, customerCount: null},
                        ...res.body.data.tagList
                    ];
                    this.tagId = this.tagList[0].tagId;
                    // 获取全部联系人的数量
                    WechatApiV1
                        .getAllTagsCount()
                        .then(res => {
                            this.tagList[1].customerCount = res.body.data.count;
                            let messageData = JSON.parse(sessionStorage.getItem(MESSAGE_CACHE_KEY));
                            if (messageData) {
                                this.type = messageData.type;
                                setTimeout(() => {
                                    this.tagId = messageData.tagId;
                                    this.sendType = messageData.sendType;
                                    this.sendDate = messageData.sendDate;
                                }, 100);
                            }
                        });
                });
        },
        methods: {
            rep(list) {
                list = list.replace(/<(span.*?)(style.*?)>/g, '');
                list = list.replace(/<\/span>/g, '');
                return list;
            },
            // 获取模板消息列表
            fetchTemplates() {
                if (this.isSubscriptionAccount) return;
                this.loading = true;
                WechatApiV1
                    .templateList(this.$store.state.user.authorizerInfoId, this.keyword, 1)
                    .then(({body: {data: {wxTemplateList}}}) => {
                        this.loading = false;
                        this.materials = wxTemplateList;
                    });
            },
            // 搜索
            search() {
                this.fetchTemplates();
            },
            // 发送
            submit() {
                if (this.tagId === -1) {
                    this.$toast(this.$t('massSend.alRecipientSelected'), 'warn');
                    return;
                }
                // 定时发送，确保所选时间不是过去的时间
                if (this.sendType === 1) {
                    let target = getDateInstance(this.sendDate);
                    // 选择了时间
                    if (!this.sendDate) {
                        return this.$toast(this.$t('massSend.sendTimeToast'), 'warn');
                    }
                    // 所选时间至少要比当前时间晚 5 秒
                    if (isAfter(addSeconds(new Date(), 5), target)) {
                        return this.$toast(this.$t('massSend.expire'), 'warn');
                    }
                }
                if (this.type === 2 || this.type === 3) {
                    // 使用组件material-editor中的全类型校验
                    if (!this.$refs.material.validAll()){
                        return false;
                    }
                    //群发消息
                    if (this.type === 2) {
                        if (this.material.type === 5) {
                            this.imageTextShow = true;
                        } else {
                            this.$confirm(this.$t('massSend.massSendConfirm'), this.$t('massSend.confirmContent'))
                                .then(sure => {
                                    if (sure) {
                                        this.sendMsgAjax();
                                    }
                                });

                        }
                    }
                    //客服消息
                    if (this.type === 3) {
                        this.$confirm(this.$t('massSend.massSendConfirm'), this.$t('massSend.confirmContent'))
                            .then(sure => {
                                if (sure) {
                                    // 客服消息
                                    if (this.type === 3) {
                                        this.materialRequest = {
                                            type: this.material.type,
                                            startDate: this.sendType === 0 ? '' : this.sendDate,
                                            tagId: this.tagId,
                                            content: this.material.type === 'text'
                                                ? this.material.content.replace(/<br>/g, '')
                                                    .replace(/&nbsp;/g, '')
                                                : '',
                                        };
                                        // 1:图片 2:音频 3: 视频 text:文本 5: 图文消息 6: 外部页 7: 跳转表单 8 : 小程序卡片 9:菜单消息
                                        switch (this.material.type) {
                                            case 1 :
                                            case 2 :
                                            case 3 :
                                            case 5 :
                                                this.materialRequest.id = this.material.id;
                                                break;
                                            case 'text' :
                                                this.materialRequest.id = '';
                                                break;
                                            case 6 :
                                                this.materialRequest.id = this.material.id;
                                                this.materialRequest.externalTitle = this.material.exTitle; //【6.外部页/7.表单外部页】外部页标题
                                                this.materialRequest.externalImageUrl = this.material.url; //【6.外部页/7.表单外部页】外部页图片url
                                                this.materialRequest.externalUrl = this.material.exUrl; //【6.外部页/7.表单外部页】外部页链接
                                                this.materialRequest.externalDescription = this.material.exDescribe; //【6.外部页/7.表单外部页】外部页描述
                                                break;
                                            case 7 :
                                                this.materialRequest.id = this.material.materialCoverId;
                                                this.materialRequest.externalTitle = this.material.externalTitle; //【6.外部页/7.表单外部页】外部页标题
                                                this.materialRequest.externalImageUrl = this.material.externalImageUrl;//【6.外部页/7.表单外部页】外部页图片url
                                                this.materialRequest.externalUrl = this.material.customSheetUrl ? 
                                                    this.material.customSheetUrl : this.material.sheetUrl;//【6.外部页/7.表单外部页】外部页链接
                                                this.materialRequest.externalDescription = 
                                                    this.material.externalDescription; //【6.外部页/7.表单外部页】外部页描述
                                                this.materialRequest.formReplyType = this.material.formReplyType; //【7.表单】表单回复类型(external:外部页  sheet:表单)
                                                this.materialRequest.sheetContent = this.material.content; //【7.表单】表单回复文本内容
                                                this.materialRequest.sheetUrl = this.material.type === 7 && this.material.content === '' ? this.material.sheetUrl : ''; //【7.表单】表单链接(表单文本内容为空时回复此表单链接)
                                                this.materialRequest.sheetId = this.material.id; //【7.表单】表单id，用于回显
                                                this.materialRequest.extensionValueId = this.material.extensionValueId; //【7.表单】表单扩展链接id，用于回显
                                                this.materialRequest.formName = this.material.formName; //表单跳转外部页-表单名称
                                                this.materialRequest.formExtensionValue = this.material.extensionName; //表单跳转外部页-表单扩展值
                                                break;
                                            case 8 :
                                                this.materialRequest.id = this.material.id;
                                                this.materialRequest.pagePath = this.material.pagePath;//【8.小程序卡片 】小程序卡片路径
                                                this.materialRequest.miniprogramAppid = this.material.miniprogramAppid; //【8.小程序卡片 】小程序卡片appid
                                                this.materialRequest.miniprogramTitle = this.material.miniprogramTitle; //【8.小程序卡片 】小程序卡片标题
                                                break;
                                            case 9 :
                                                this.materialRequest.id = this.material.id;
                                                this.materialRequest.menuMessage = this.material.menuMessage || null; // Object类型//【9.菜单消息】菜单消息
                                        }
                                        WechatApiV1
                                            .createServiceMsg(this.materialRequest)
                                            .then(() => {
                                                this.$toast(this.$t('common.sendSuccess'), 'success');
                                                trackEvent('微信管理-发送客服消息');
                                                //跳转记录页
                                                this.$router.push({
                                                    name: 'customerMassage'
                                                });
                                            })
                                            .catch((err) => {
                                                this.$toast(this.$t('massSend.sedFailure') + err.body.message + ')',);
                                            });
                                    }
                                }
                            });
                    }
                }
                if (this.type === 1) {
                    if (this.id[0] === undefined) {
                        this.$toast(this.$t('massSend.chooseConfirm'), 'warn');
                        return false;
                    }

                    this.$confirm(this.$t('massSend.massSendConfirm'), this.$t('massSend.confirmContent'))
                        .then(sure => {
                            if (sure) {
                                WechatApiV1
                                    .createModalMsg({
                                        groupId: this.tagId,
                                        sendDate: this.sendDate,
                                        status: this.sendType,
                                        wxTemplateId: this.id[0],
                                    })
                                    .then(() => {
                                        this.$toast(
                                            this.$t('common.sendSuccess') +
                                            (this.groupNeedTime ? this.$t('massSend.needTime') + ` ${this.groupNeedTime} ${this.groupNeedTime === 2 ? this.$t('massSend.minutes') : this.$t('massSend.hours')}，` : '') +
                                            this.$t('massSend.noRepeat'),
                                            'success'
                                        );
                                        this.tagId = -1;
                                        this.id = [];
                                        trackEvent('微信管理-发送模板消息');
                                        //跳转记录页
                                        this.$router.push({
                                            name: 'templateMassage'
                                        });
                                    })
                                    .catch(err => {
                                        this.$toast(this.$t('common.sendFailed') + ',' + this.$t('massSend.failedReason') + ':(' + err.body.message + ')',);
                                    });
                            }
                        });
                }
            },
            //非原创图文处理
            graphicProcess() {
                this.sendMsgAjax();
                this.imageTextShow = false;
            },
            // 调用 群发消息 接口
            sendMsgAjax() {
                WechatApiV1
                    .createSentMsg({
                        materialId: this.material.type === 'text' ? '' : this.material.id,
                        materialType: this.material.type,
                        sendDate: this.sendType === 0 ? '' : this.sendDate,
                        tagId: this.tagId,
                        text: this.material.type === 'text'
                            ? this.material.content.replace(/<br>/g, '')
                                .replace(/&nbsp;/g, '')
                            : '',
                        sendIgnoreReprint: this.groupSending
                    })
                    .then(() => {
                        this.$toast(this.$t('common.sendSuccess'), 'success');
                        trackEvent('微信管理-群发消息');
                        //跳转记录页
                        this.$router.push({
                            name: 'groupMessage'
                        });
                    })
                    .catch(err => {
                        this.$toast( err.body.message, 'warn');
                    });
            },
            // 根据素材id获取素材详情
            getMaterialDetail(session) {
                WechatApiV1.getMaterial(session)
                    .then((res) => {
                        this.material = res.body.data.material;
                        this.material.content = '';
                        this.material.type = 5;
                    });
            }
        },
        beforeRouteLeave(to, form, next) {
            // 跳转到图文消息编辑&新建
            if (to.name === 'imageTextCreate' && this.type === 2) {
                let messageData = {
                    type: this.type,
                    tagId: this.tagId,
                    sendType: this.sendType,
                    sendDate: this.sendDate,
                };
                sessionStorage.setItem(MESSAGE_CACHE_KEY, JSON.stringify(messageData));
                next();
            } else {
                sessionStorage.removeItem(MESSAGE_CACHE_KEY);
                next();
            }
        },
        watch: {
            type() {
                this.tagId = this.tagList[0].tagId;
                this.sendType = 0;
                this.sendDate = '';
                this.material = {};
                this.id = [];
            },
            tagId() {
                if (this.tagId === -1) return;
                let i;
                for (i = 0; i < this.tagList.length; i++) {
                    if (this.tagId === this.tagList[i].tagId) {
                        break;
                    }
                }
                switch (true) {
                    case this.tagList[i].customerCount <= 100:
                        this.groupSelectedPn = this.tagList[i].customerCount;
                        this.groupNeedTime = 0;
                        break;
                    case this.tagList[i].customerCount <= 1000 &&
                    this.tagList[i].customerCount > 100:
                        this.groupSelectedPn = this.tagList[i].customerCount;
                        this.groupNeedTime = 2;
                        break;
                    case this.tagList[i].customerCount > 1000:
                        this.groupSelectedPn = this.tagList[i].customerCount;
                        this.groupNeedTime =
                            Math.ceil(this.tagList[i].customerCount / 10000) / 2;
                        break;
                }
            },
            'material.type':function(){
                if (this.material.type !== 5) {
                    this.groupSending = 0;
                }
            }
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .mass-send-form {
        // 修复material-editor折叠问题
        min-width: 1115px;
        .calendar {
            width: 170px;
        }

        /*模板素材*/
        .template-store {
            width: 960px;
            margin-top: 8px;
            border: 1px solid $border-color;
            text-align: right;
            background-color: $content-bg;

            .search-box {
                margin: 16px;
            }

            .templates {
                overflow: auto;
                text-align: left;
                max-height: 3 * 200px + 8px * 6;
            }

            .materials {
                $width: 302px;
                $height: 199px;
                display: inline-block;
                width: $width;
                margin-bottom: 16px;
                margin-left: 8px;
                margin-right: 8px;

                .material-preview {
                    position: relative;
                    height: 148px - 2px - 4px;
                    border: 1px solid $border-color;
                    padding: 2px;
                    background-color: $content-bg;
                    background-clip: content-box;
                    cursor: pointer;

                    &:hover,
                    &.selected {
                        border-color: $theme;
                    }

                    .previewtext {
                        margin: auto;
                        width: auto;
                        height: 148px;
                        background-color: #fff;
                        max-width: 100%;
                        max-height: 100%;
                        overflow: hidden;
                        box-sizing: border-box;
                        padding: 10px 40px 0;
                    }

                    .preContent {
                        line-height: 18px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .checkbox {
                        position: absolute;
                        left: 11px;
                        top: 11px;
                    }
                }

                .material-info {
                    padding: 6px 1em;
                    background-color: #eeeeee;
                    @include ellipsis();
                    line-height: 20px;

                    a {
                        color: $color-content;

                    }
                }

            }
        }

        .function-disabled-tip {
            text-align: center;
            width: 80vw;
            height: 60vh;
            line-height: 60vh;
            margin-top: 8px;
            background-color: $content-bg;
        }
        .detail-url{
            color: $green;
        }
    }

</style>
