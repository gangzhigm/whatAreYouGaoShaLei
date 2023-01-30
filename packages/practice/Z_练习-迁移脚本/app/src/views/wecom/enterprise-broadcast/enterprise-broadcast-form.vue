<template>
    <div class="enterprise-broadcast-form">
        <div class="content-view">
            <crumbs :crumbs="crumbs" />
        </div>
        <!-- 标题 -->
        <div class="page-head">
            <div class="content-view">
                <h1 v-if="formId===0">{{'enterpriseBroadcast.newMessage' | t}}</h1>
                <h1 v-else>{{ title }}</h1>
            </div>
        </div>
        <!-- 标题end -->
        <div class="page-content">
            <div class="content-view padding margin white-bg en-form-content-view">
                <!-- 群发选择 -->
                <div class="group-sending-options">
                    <h1>{{'enterpriseBroadcast.groupSendingOptions' | t}}</h1>
                    <alert class="alert" :message="message" type="info" showIcon />
                    <div class="method radios">
                        <span>{{'enterpriseBroadcast.sendMode' | t}}</span>
                        <radio :source="1" v-model="sendMode" @input="methodChange" :disabled="formId!==0">
                            {{'enterpriseBroadcast.groupMsg' | t}}</radio>
                        <radio :source="2" v-model="sendMode" @input="methodChange" :disabled="formId!==0">
                            {{'enterpriseBroadcast.agentMsg' | t}}</radio>
                    </div>
                    <div class="type radios">
                        <span>{{'enterpriseBroadcast.sendType' | t}}</span>
                        <radio :source="1" v-model="sendType" @input="typeChange" :disabled="formId!==0">
                            {{'enterpriseBroadcast.contact' | t}}
                        </radio>
                        <radio :source="2" v-model="sendType" @input="typeChange" :disabled="formId!==0">
                            {{'enterpriseBroadcast.enterpriseGroup' | t}}</radio>
                    </div>
                </div>
                <!-- 基础信息 -->
                <div class="basics">
                    <h1>{{'enterpriseBroadcast.baseMessage' | t}}</h1>
                    <div class="group-name info">
                        <span v-if="sendMode===2&&sendType===2"
                            :class="{'lang-span':language==='en'}">{{'enterpriseBroadcast.name' | t}}</span>
                        <span v-else :class="{'lang-span':language==='en'}">{{'enterpriseBroadcast.groupName' | t}}</span>
                        <input class="search-box" type="text" maxlength="50" v-model.trim="sendName">
                    </div>
                    <!-- 选择群发部门 -->
                    <div v-if="sendType===1" class="select-staff info">
                        <!-- 联系人 -->
                        <span :class="{'lang-span':language==='en'}">{{'enterpriseBroadcast.selectDepartments' | t}}</span>
                        <multi-select class="xl hg multi-select" :options="departSelectList" v-model="departCheckedItem" :uniqueKey="'wxDepartmentId'"
                            :placeholder="placeholder" :autoWidth="false" :dropDirection="'bottom'" />
                    </div>
                    <!-- 选择群发员工 -->
                    <div class="select-staff info">
                        <!-- 联系人 -->
                        <span v-if="sendType===1" :class="{'lang-span':language==='en'}">{{'enterpriseBroadcast.selectStaff' | t}}</span>
                        <!-- 企业群发+企业群 -->
                        <span v-else-if="sendMode===1&&sendType===2"
                            :class="{'lang-span':language==='en'}">{{'enterpriseBroadcast.selectGroupOwner' | t}}
                            <i class="action-icon icon icon-yiwen1"
                                v-title:right="$t('enterpriseBroadcast.hoverGroupOwner')"></i>
                        </span>
                        <!-- 应用消息+企业群 -->
                        <span v-else-if="sendMode===2&&sendType===2"
                            :class="{'lang-span':language==='en'}">{{'enterpriseBroadcast.selectGroupChat' | t}}</span>
                        <div class="field-group">
                            <multi-select class="xl hg multi-select" :options="selectList" v-model="checkedItem"
                                :placeholder="placeholder" :shortcutAction="true" :search="'async'" :autoWidth="false"
                                :dropDirection="'bottom'" :uniqueKey="'id'" :max="100" />
                        </div>
                    </div>
                </div>
                <div class="group-message-preview">
                    <!-- 群发消息 -->
                    <div class="group-message">
                        <h1>{{'enterpriseBroadcast.groupMessage' | t}}</h1>
                        <!-- 素材 -->
                        <div class="max-height">
                            <template v-for="(msg,i) in msgList">
                                <!-- eslint-disable-next-line -->
                                <div class="msg-list">
                                    <p>{{'enterpriseBroadcast.groupMessage' | t}}{{i+1}}</p>
                                    <wecom-material-editor :msgtypes="msgtypes(i)" :msgtype.sync="msg.msgtype"
                                        :id='"editor"+i' :val.sync="msg[msg.msgtype]" @switch="handleSwitch(msg)"
                                        ref="editor">
                                    </wecom-material-editor>
                                    <span v-title:top="$t('enterpriseBroadcast.deleted')" class="icon icon-iconless"
                                        v-if="delMsgShow(i)" @click="delMsg(i)"></span>
                                </div>
                            </template>
                        </div>
                        <!-- 添加素材 -->
                        <p :class="language==='zh-CN'?'add-group-message zh-Add-group':'add-group-message'"
                            @click="addMsg" v-if="msgList.length<10">
                            {{'enterpriseBroadcast.addGroupMessage' | t}}</p>
                        <!-- 群发时间 -->
                        <div class="send-type radios">
                            <span>{{'enterpriseBroadcast.groupMessageTime' | t}}</span>
                            <radio :source="1" v-model="messageType" @input="messageTypeChange" :disabled="formId!==0">
                                {{'enterpriseBroadcast.sendImmediately' | t}}</radio>
                            <radio :source="2" v-model="messageType" @input="messageTypeChange" :disabled="formId!==0">
                                {{'enterpriseBroadcast.timedSend' | t}}</radio>
                        </div>
                        <div class="send-date" v-if="messageType===2">
                            <calendar v-model="sendDate" :showTodayBtn="false" :disabled="formId!==0" />
                            <hour-minute-select v-model="sendTime" :disabled="formId!==0" />
                        </div>
                        <!-- 通知员工 -->
                        <button class="notify-employees btn btn-md btn-theme btn-margin" @click="submit">
                            {{'enterpriseBroadcast.notifyEmployees' | t}}
                        </button>
                    </div>
                    <!-- 预览 -->
                    <ent-broadcast-preview :attachments="msgList"></ent-broadcast-preview>
                </div>
            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
import { I18N_STORE_NAME } from '@/locales';
import { WecomApiV1 } from '@/api';
import { WecomMaterialEditor } from '@/views/wecom/components';
import { methodList, typeList } from './common';
import cloneDeep from 'lodash/cloneDeep';
import EntBroadcastPreview from './components/ent-broadcast-preview.vue';
import { mapState } from 'vuex';

export default {
    name: 'EnterpriseBroadcastForm', // 企业群发
    data () {
        return {
            sendMode: 1,//群发方式 1 企业群发 2 应用消息
            sendType: 1,//群发类型 1 联系人 2 企业群
            sendName: '',//群发名称or 名称
            checkedItem: [], // 选中的粉丝标签list
            selectList: [],//下拉框列表
            departCheckedItem: [], //选中的部门
            departSelectList: [], //部门列表
            contactOptions: [],//联系人列表
            groupOwnerOptions: [],//群主列表
            groupChartOptions: [],//群聊列表
            sendDate: '',//发送日期
            sendTime: '',//发送时间
            messageType: 1,//1:立即发送2:定时发送
            msgList: [],//素材列表
            formId: null,//表单id
            title: '',//编辑状态下的名称
            isSubmit: false,//是否正在提交
        };
    },
    computed: {
        ...mapState({
            language: state => state[I18N_STORE_NAME].lang
        }),
        // 导航
        crumbs () {
            const text = this.formId === 0 ? this.$t('enterpriseBroadcast.newMessage') : this.title;
            return [
                { name: 'index', text: 'Dmartech' },
                { name: 'entBroadcast', text: this.$t('home.entBroadcast') },
                Object.assign({}, this.$route, { text: text })
            ];
        },
        //提示
        message () {
            let message = '';
            if (this.sendMode === methodList[1].source) {
                if (this.sendType === typeList[1].source) {
                    //企业群发 +联系人
                    message = this.$t('enterpriseBroadcast.tips1');
                } else {
                    //企业群发 +企业群
                    message = this.$t('enterpriseBroadcast.tips3');
                }
            } else {
                if (this.sendType === typeList[1].source) {
                    //应用消息 +联系人
                    message = this.$t('enterpriseBroadcast.tips2');
                } else {
                    //应用消息 +企业群
                    message = this.$t('enterpriseBroadcast.tips4');
                }
            }
            return message;
        },
        placeholder () {
            return this.$t('common.selectHolder');
        }
    },
    methods: {
        methodChange () {
            this.msgListInit();
            if (this.formId === 0) this.messageType = 1;
            this.sendName = '';
            this.optionsChange();
        },
        typeChange () {
            this.msgListInit();
            if (this.formId === 0) this.messageType = 1;
            this.sendName = '';
            this.optionsChange();
        },
        messageTypeChange () {
            this.sendDate = '';
            this.sendTime = '';
        },
        //下框数据根据 群发方式 联系人类型
        optionsChange () {
            this.checkedItem = [];
            this.departCheckedItem = [];
            let options = [];
            let all = [];
            this.selectList = [];
            if (this.sendMode === methodList[1].source) {
                if (this.sendType === typeList[1].source) {
                    //企业群发 +联系人
                    options = this.contactOptions;
                } else {
                    //企业群发 +企业群
                    options = this.groupOwnerOptions;
                }
            } else {
                if (this.sendType === typeList[1].source) {
                    //应用消息 +联系人
                    options = this.contactOptions;
                } else {
                    //应用消息 +企业群
                    options = this.groupChartOptions;
                }
            }
            if (options.length > 0) this.selectList = [...all, ...options];
        },
        //删除按钮是否显示
        delMsgShow (i) {
            let show = false;
            if (this.sendMode === methodList[1].source) {
                show = i !== 0;
            } else {
                show = this.msgList.length !== 1;
            }
            return show;
        },
        // 可选素材类型, 影响类型radio内容和顺序 ex. ['none', 'text', 'image', 'link', 'miniprogram']
        msgtypes (i) {
            let list = [];
            if (this.sendMode === methodList[1].source) {
                if (i === 0) {
                    list = ['text'];
                } else {
                    list = ['image', 'link', 'miniprogram'];
                }
            } else {
                list = ['text', 'image', 'link'];
            }
            return list;
        },
        //获取联系人列表
        getContact () {
            WecomApiV1.getStaffListNoPage().then(({ body }) => {
                let list = body.data.staffList;
                list.forEach(e => {
                    e.id = e.userId;
                    e.name = e.value;
                });
                this.contactOptions = list;
                if (this.sendType === typeList[1].source) {
                    this.getDeptList();
                }
            });
        },
        //获取群主列表
        getGroupOwner () {
            WecomApiV1.getGroupOwnerList().then(({ body }) => {
                let list = body.data.groupList;
                list.forEach(e => {
                    e.id = e.userid;
                });
                this.groupOwnerOptions = list;
                if (this.sendType !== typeList[1].source && this.sendMode === methodList[1].source) {
                    this.formId === 0 ? this.addInit() : this.editInit();
                }
            });
        },
        //获取群聊列表
        getGroupChat () {
            WecomApiV1.getWecomGroupList().then(({ body }) => {
                let list = body.data.groupList;
                list.forEach(e => {
                    e.id = e.chatId;
                    e.name = e.value || this.$t('common.groupChatNameNotSet');
                });
                this.groupChartOptions = list;
                if (this.sendType !== typeList[1].source && this.sendMode !== methodList[1].source) {
                    this.formId === 0 ? this.addInit() : this.editInit();
                }
            });
        },
        //获取部门列表
        getDeptList() {
            WecomApiV1
                .getDeptList()
                .then(({ body: { data:{ department } } }) => {
                    const deptArr = this.flatArray(department[0].childs);
                    this.departSelectList = deptArr;
                    this.formId === 0 ? this.addInit() : this.editInit();
                });
        },
        // 扁平化数组
        flatArray(arr, newArr = []) {
            arr.forEach((item)=>{
                typeof (item) === 'object' && item.name && newArr.push(item);
                item.childs && item.childs instanceof Array && this.flatArray(item.childs,newArr);
            });
            return newArr;
        },
        valid (i) {
            return this.$refs.editor[i].valid();
        },
        //提交前的校验
        vaildForm () {
            let checked = true;//true:校验通过 false:校验未通过
            //校验群名
            if (!this.sendName.trim()) {
                checked = false;
                this.$toast(this.$t('enterpriseBroadcast.pleaseFillInTheGroupName'), 'warn');
                return checked;
            }
            //校验联系人/群主/群聊
            if (this.sendType === 1) {
                if (this.departCheckedItem.length === 0 && this.checkedItem.length === 0) {
                    this.$toast(this.$t('enterpriseBroadcast.pleaseSelectStaff'), 'warn');
                    checked = false;
                }
            } else if (this.checkedItem.length === 0) {
                if (this.sendMode === methodList[1].source) {
                    this.$toast(this.$t('enterpriseBroadcast.pleaseSelectGroupOwner'), 'warn');
                    checked = false;
                } else {
                    this.$toast(this.$t('enterpriseBroadcast.pleaseSelectGroupChat'), 'warn');
                    checked = false;
                }
            }
            if (!checked) return checked;

            //素材校验
            if (this.sendMode === methodList[1].source) {
                if (this.msgList.length === 1) {
                    checked = this.valid(0);
                    if (!checked) this.goAnchor(0);
                } else {
                    this.msgList.forEach((e, i) => {
                        if (i > 0) {
                            if (!checked) {
                                this.valid(i);
                            } else {
                                checked = this.valid(i);
                                this.goAnchor(i);
                            }
                        }
                    });
                }
            } else {
                this.msgList.forEach((e, i) => {
                    if (!checked) {
                        this.valid(i);
                    } else {
                        checked = this.valid(i);
                        this.goAnchor(i);
                    }
                });
            }
            //群发时间
            if (this.messageType === 2) {
                if (!this.sendDate || this.sendTime.length !== 5) {
                    this.$toast(this.$t('enterpriseBroadcast.sendTimeToast'), 'warn');
                    checked = false;
                } else {
                    let sendTime = `${this.sendDate} ${this.sendTime}:00`;
                    //判断定时发送时间是否过期
                    if (new Date().getTime() > new Date(sendTime).getTime()) {
                        this.formId === 0 ? this.$toast(this.$t('enterpriseBroadcast.pleaseReselectTheTime'), 'warn')
                            : this.$toast(this.$t('enterpriseBroadcast.sentMessageCannotBeEdited'), 'warn');
                        checked = false;
                    }
                }
                return checked;
            }
            return checked;
        },
        //提交数据
        submit () {
            if (!this.vaildForm()) return;
            if (this.isSubmit) return this.$toast(this.$t('enterpriseBroadcast.subAgain'), 'warn');
            this.isSubmit = true;
            let ids = '';
            let departIds = '';
            this.checkedItem.map(e => {
                ids += e + ',';
            });
            this.departCheckedItem.map(e => {
                departIds += e + ',';
            });
            ids = ids.substring(0, ids.length - 1);
            departIds = departIds.substring(0, departIds.length - 1);
            let content = '';
            let attachments = [];
            if (this.sendMode === 1) {
                content = this.msgList[0].text.content;
                attachments = this.msgList.filter((e, i) => {
                    return i > 0;
                });
            } else {
                attachments = this.msgList;
            }
            const params = {
                sendName: this.sendName,
                sendContent: content,
                sendMode: this.sendMode,
                sendType: this.sendType,
                messageType: this.messageType,
                sendDate: this.messageType === 1 ? '' : `${this.sendDate} ${this.sendTime}:00`,
                attachments: attachments,
            };
            //employeeIds 员工id/群主id  chatId 群主群聊id
            if (this.sendType === 2 && this.sendMode === 2) {
                params.chatId = this.selectList.length === this.checkedItem.length ? 'all' : ids;//全选的时候传 all
            } else {
                params.employeeIds = (this.checkedItem.length && this.selectList.length === this.checkedItem.length) ? 'all' : ids;
            }
            if (this.sendType === 1) params.departIds = departIds;
            if (this.formId !== 0) params.id = this.formId;
            this.$loading();
            WecomApiV1.saveMessage(params).then(() => {
                this.formId === 0 ? this.$toast(this.$t('common.createSuccess'), 'success')
                    : this.$toast(this.$t('common.updateSuccess'), 'success');
                this.$loaded();
                setTimeout(() => {
                    this.isSubmit = false;
                    this.$router.push({ name: 'entBroadcast' });
                }, 500);
            })
                .catch(() => {
                    this.$loaded();
                    this.isSubmit = false;
                });
        },
        //切换素材
        handleSwitch (target) {
            Object.keys(target).forEach(key => {
                if (key !== 'msgtype' && key !== target.msgtype) {
                    this.$delete(target, key);
                }
            });
        },
        //删除素材
        delMsg (i) {
            this.msgList.splice(i, 1);
        },
        // 新增时的初始化
        addInit () {
            this.msgListInit();
            this.optionsChange();
        },
        //编辑时的初始化
        editInit () {
            WecomApiV1.getMessage(this.formId).then(({ body }) => {
                let detail = body.data.messageDetail;
                this.sendMode = detail.sendMode;
                this.sendType = detail.sendType;
                this.messageType = detail.messageType;
                this.sendName = detail.sendName;
                this.title = cloneDeep(detail.sendName);
                if (this.messageType === 2) {
                    let sendTime = detail.sendTime.split(' ');
                    this.sendDate = sendTime[0];
                    this.sendTime = sendTime[1].substring(0, sendTime[1].length - 3);
                }
                if (this.sendMode === 1) {
                    const content = [{
                        msgtype: 'text',
                        text: {
                            content: detail.sendContent
                        }
                    }];
                    this.msgList = [...content, ...detail.attachments];
                } else {
                    this.msgList = detail.attachments;
                }
                this.optionsChange();
                let ids;
                let departIds;
                if (this.sendType === 2 && this.sendMode === 2) {
                    ids = detail.chatId ? detail.chatId.split(',') : [];
                } else {
                    ids = detail.employeeIds ? detail.employeeIds.split(',') : [];
                }

                ids.forEach(e => {
                    if (this.selectList.findIndex(item => item.id === e) !== -1) {
                        this.checkedItem.push(e);
                    }
                });
                
                if (this.sendType === 1) {
                    departIds = detail.departIds ? detail.departIds.split(',') : [];
                    departIds.forEach(e => {
                        if (this.departSelectList.findIndex(item => item.wxDepartmentId === Number(e)) !== -1) {
                            this.departCheckedItem.push(Number(e));
                        }
                    });
                }
            });
        },
        //素材列表初始化
        msgListInit () {
            this.msgList = [{
                msgtype: 'text',
                text: {
                    content: ''
                }
            }];
        },
        //新增素材
        addMsg () {
            this.$refs.editor[0].$refs.msgEditor.errorText = '';
            let msg;
            if (this.sendMode === methodList[1].source) {
                msg = {
                    msgtype: 'image',
                    image: {
                        media_id: '',
                    }
                };
            } else {
                msg = {
                    msgtype: 'text',
                    text: {
                        content: ''
                    }
                };
            }
            this.msgList.push(msg);
        },
        //跳转错误信息处
        goAnchor (index) {
            this.$el.querySelector(`#editor${index}`).scrollIntoView({
                behavior: 'smooth',  // 平滑过渡
                block: 'start'  // 上边框与视窗顶部平齐。默认值
            });
        }
    },
    components: {
        WecomMaterialEditor,
        EntBroadcastPreview
    },
    created () {
        this.formId = Number(this.$route.params.id);
        this.getContact();
        this.getGroupOwner();
        this.getGroupChat();
    },
};
</script>

<style lang="scss">
@import '../../../common/scss/base/variables';
@import '../../../common/scss/base/mixin';
.enterprise-broadcast-form {
    .page-content {
        .en-form-content-view {
            padding: 16px 80px 24px 80px;
            min-width: 1215px;
            > h1 {
                font-size: 20px;
                width: 1000px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .group-sending-options {
                .alert {
                    margin: 20px;
                }
                > .radios {
                    margin-left: 20px;
                    display: flex;
                    align-items: center;
                    text-align: right;
                    span {
                        margin-right: 20px;
                        max-width: 140px;
                        min-width: 100px;
                    }
                }
                .type {
                    margin: 20px 0 0 20px;
                }
            }

            .basics {
                margin-top: 20px;
                > .info {
                    margin: 20px 0 0 20px;
                    display: flex;
                    align-items: center;
                    text-align: right;
                    > span {
                        max-width: 140px;
                        min-width: 100px;
                        margin-right: 20px;
                    }
                    > .lang-span {
                        min-width: 130px;
                    }
                    > input {
                        margin-left: 0;
                    }
                    .search-box {
                        border-radius: 4px;
                        min-width: 312px;
                        padding: 0;
                    }
                }
                .select-staff {
                    .multi-select {
                        text-align: left;
                        width: 314px;
                    }
                }
            }
            .group-message-preview {
                display: flex;
                .group-message {
                    min-width: 700px;
                    margin-top: 20px;
                    .msg-list {
                        display: flex;
                        padding: 30px 20px;
                        > p {
                            margin-right: 20px;
                            padding-top: 10px;
                            max-width: 140px;
                            min-width: 100px;
                            text-align: right;
                        }
                        > .icon {
                            color: #d9250d;
                            font-size: 14px;
                            margin: 10px 0 0 20px;
                            height: 14px;
                        }
                    }
                    .add-group-message {
                        color: $green;
                        cursor: pointer;
                        display: inline-block;
                    }
                    > .radios {
                        margin-left: 20px;
                        display: flex;
                        align-items: center;
                        text-align: right;
                        span {
                            margin-right: 20px;
                            max-width: 140px;
                            min-width: 100px;
                        }
                    }
                    .send-type {
                        margin-top: 40px;
                    }
                    .send-date,
                    .notify-employees,
                    .add-group-message {
                        margin: 40px 0 0 136px;
                    }
                    > .zh-Add-group {
                        margin-left: 146px;
                    }
                    .notify-employees {
                        text-transform: unset;
                    }
                }
            }
        }
    }
}
</style>