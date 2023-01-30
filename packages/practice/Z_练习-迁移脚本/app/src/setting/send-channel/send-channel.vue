<template>
    <div class="page-content white-bg sent-channel">
        <!--右侧查询-->
        <div class="list-title">
            <search :dt="editTreeList" @handleClickInfo="getId"></search>
        </div>
        <!--表格数据-->
        <div class="sent-channel-list">
            <ul class="sent-channel-title">
                <li class="sendChannel-department">{{'sendChannel.department' | t}}</li>
                <li>{{'sendChannel.departmentName' | t}}</li>
                <li>{{'sendChannel.emailAddress' | t}}</li>
                <li>{{'sendChannel.smsSender' | t}}</li>
                <li>{{'sendChannel.mmsSender' | t}}</li>
                <li>{{'sendChannel.weChat' | t}}</li>
            </ul>
            <div class="list-left" v-if="showSendChannel">
                <title-tree :list="editTreeList" v-model="departmentId"></title-tree>
            </div>
            <div class="list-right" v-if="showSendChannel">
                <list-tree :list="editTreeList" v-model="departmentId" @showModel="showSentManage($event)"></list-tree>
            </div>
            <!--邮件 && 短信 && 彩信 && 微信的发送通道-->
            <modal :title="sendSenderTitile"
                   v-if="addSender"
                   @close="closeSentSender">
                <p v-if="sendType ===0">{{describe}}</p>
                <p v-if="sendType ===1">{{describe}}</p>
                <p v-if="sendType ===2">{{describe}}</p>
                <p v-if="sendType ===3">{{describe}}</p>
                <button class="sent-theme-text" @click="addAddress">{{addAddressTitle}}</button>
                <div class="simplify-table margin send-table">
                    <table>
                        <thead>
                        <tr>
                            <td>{{sender}}</td>
                            <td>{{'sendChannel.action' | t}}</td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="send in sendList">
                            <td>{{send.sendAddress}}</td>
                            <td>
                                <button class="action-icon icon icon-pencil" v-if="sendType ===0"
                                        @click.self='editChannel(send)' v-title:top="$t('common.edit')"
                                        :disabled="$has('enterprise_edit_send_user')"></button>
                                <button class="action-icon icon icon-delete"
                                        @click.self='delChannel(send)'
                                        v-title:top="$t('common.del')">
                                </button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <div v-if="!sendList">
                        <list-empty/>
                    </div>
                </div>
            </modal>
            <!--添加发件地址-->
            <modal v-if="addNewAddress" :title="senderTitle" @close="closeNewSender">
                <!--邮件-->
                <template v-if="sendType === 0">
                    <div class="form-field flex">
                        <label class="label">{{'sendChannel.from_address' | t}}</label>
                        <div class="field-group">
                            <selector class="xl" :options="sendAddressList" :search="sendAddressList.length > 10"
                                      @select="choseEmaliField($event)" v-model="emailAddressId"
                                      :disabled="editEmailAddress"/>
                        </div>
                    </div>
                    <div class="form-field flex" v-if="!$has('enterprise_edit_send_user')">
                        <label class="label">发件人</label>
                        <div class="field-group">
                            <template v-for="(sender, index) in senders">
                                <!--编辑发件地址，实际上是（发件人）-->
                                <div v-if="editEmailAddress">
                                    <!--编辑发件人（单条）-->
                                    <template v-if="sender.btnsShow">
                                        <input type="text" class="input lg" v-model.trim="sender.name"
                                               maxlength="100"/>
                                        <button type="button" class="btn btn-sm btn-theme"
                                                @click.self="editEmailSender(sender)">{{'common.save' | t}}
                                        </button>
                                        <button type="button" class="btn btn-sm btn-white"
                                                @click.self="closeBtns(sender, index)">{{'common.cancel' | t}}
                                        </button>
                                    </template>
                                    <!--查看发件人-->
                                    <template v-if="sender.id && !sender.btnsShow">
                                        <span>{{sender.name}}</span>
                                        <button class="action-icon icon icon-pencil" @click.self='showBtns(sender)'
                                                v-title:top="$t('common.edit')">
                                        </button>
                                        <button class="action-icon icon icon-iconless"
                                                @click.self='delSenders(sender, index)'
                                                v-title:top="$t('common.del')">
                                        </button>
                                    </template>
                                </div>
                                <!--新增发件地址（发件人）多条-->
                                <div v-if="!editEmailAddress">
                                    <input type="text" class="input lg" v-model="sender.name" maxlength="100"/>
                                    <button class="action-icon icon icon-iconless"
                                            @click.self='delSenders(sender, index)' v-title:top="$t('common.del')">
                                    </button>
                                </div>
                            </template>
                        </div>
                    </div>
                    <button type="button" class="add-condition-btn" v-if="!$has('enterprise_edit_send_user')"
                            @click="addSenders">
                        <svg>
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        {{'sendChannel.addEmailSender' | t}}
                    </button>
                </template>
                <!--短信-->
                <div class="form-field flex" v-if="sendType === 1">
                    <label class="label">{{'sendChannel.smsSignature' | t}}</label>
                    <div class="field-group">
                        <selector :options="smsList"
                                  class="xl"
                                  :search="smsList.length > 10"
                                  @select="choseSmsField($event)"
                                  v-model="smsId"/>
                    </div>
                </div>
                <!--彩信-->
                <div class="form-field flex" v-if="sendType === 2">
                    <label class="label">{{'sendChannel.mmsSignature' | t}}</label>
                    <div class="field-group">
                        <selector :options="mmsList"
                                  class="xl"
                                  :search="mmsList.length > 10"
                                  @select="choseMmsField($event)"
                                  v-model="mmsId"/>
                    </div>
                </div>
<!--                weChat公众号-->
                <div class="form-field flex" v-if="sendType === 3">
                    <label class="label">{{'sendChannel.Accounts' | t}}</label>
                    <div class="field-group">
                        <selector :options="weChatList"
                                  class="xl"
                                  :search="weChatList.length > 10"
                                  @select="choseWeChatField($event)"
                                  v-model="weChatId"/>
                    </div>
                </div>
                <template v-slot:buttons>
                    <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')"
                           @click="saveNewSender">
                </template>
            </modal>
        </div>
    </div>
</template>
<script>
    import { SmsServiceApiV1, JourneyApiV1, DepartmentApiV1, GeteOriginApi, SenderApi, WechatApiV1 } from '@/api';
    import TitleTree from './title-tree.vue';
    import ListTree from './list-tree.vue';
    import cloneDeep from 'lodash/cloneDeep';
    import Search from './search.vue';

    export default {
        name: 'sent-channel',
        components: {
            TitleTree,
            ListTree,
            Search
        },
        data() {
            return {
                showSendChannel: false,
                addSender: false,
                addNewAddress: false,
                sendAddress: '',        // 通道(邮件地址，短彩信活动) name
                editTreeList: [],
                departmentId: '',       // 部门ID
                departmentName: '',     // 部门名称
                sendList: [],           // 发送通道列表
                sendType: '',           // 0 邮件 1短信 2彩信 3微信
                sendSenderTitile: '',   // 邮件 && 短信 && 彩信 && 微信 的发送通道弹框标题
                addAddressTitle: '',    // 邮件 && 短信 && 彩信 && 微信 的发送通道新增按钮
                sender: '',             // 邮件 && 短信 && 彩信 && 微信 的发送通道弹框列表标题的展示
                describe: '',
                activeOrgId: '',
                // 邮件
                sendAddressList: [],    // 邮件-活动列表
                emailAddressId: '',     // 邮件-发件地址id (实际上是发件地址的senderId)
                senders: [
                    {
                        name: '',
                        sendType: 1,    // 1 管理员配置 2 员工自定义
                        btnsShow: false,// （保存，取消）按钮显示
                    }
                ],// 发件人
                editEmailAddress: false, // 邮件-编辑邮件发送通道（邮件发件地址）
                // 短信
                smsList: [],
                smsId: '',
                sendoutId: '',      // 短信活动id
                message: '',        // 短信签名
                // 彩信
                mmsList: [],
                mmsId: '',
                //微信
                weChatId: '',
                weChatList: [],
            };
        },

        mounted() {
            // 发件地址列表
            JourneyApiV1
                .getAddress(1, 1)
                .then(({body: {data: {addressList}}}) => {
                    this.sendAddressList = addressList.map((address) => ({
                        id: address.senderId,
                        name: address.sendAddress
                    }));
                });
            // 短信&&彩信签名列表
            SmsServiceApiV1
                .getSendOutList()
                .then(({body: {data: {sendouts}}}) => {
                    this.smsList = sendouts
                        .map(({sendoutId: id, sendoutName: name, type, message}) => ({id, name, type, message}))
                        .filter(item => (item.type !== 1));
                    this.mmsList = sendouts
                        .map(({sendoutId: id, sendoutName: name, type}) => ({id, name, type}))
                        .filter(item => (item.type === 1));
                });
            //微信公众号列表
            WechatApiV1
                .isBindWeChat()
                .then(({body:{data:{wechatList}}}) => {
                    wechatList.forEach((item) => {
                        let newObj = {};
                        for (let i = 0; i < wechatList.length; i++) {
                            newObj.id = item.id;
                            newObj.name = item.wechatName;
                        }
                        this.weChatList.push(newObj);
                    });
                });

            this.getAllDepartment();
        },
        computed: {
            // 邮件 && 短信 && 彩信 && 微信的发送通道新增中通道弹框标题
            senderTitle() {
                switch (this.sendType) {
                    case 0:
                        return this.editEmailAddress
                            ? this.$t('sendChannel.editSenderTitle')
                            : this.$t('sendChannel.senderTitle');
                    case 1:
                        return this.$t('sendChannel.addSender');
                    case 2:
                        return this.$t('sendChannel.addSender');
                    case 3:
                        return this.$t('sendChannel.addWeChat');
                }
            }
        },
        methods: {
            getId(item) {
                document.getElementById('id' + item.departmentName).scrollIntoView();
            },
            //获取组织节点列表
            getAllDepartment() {
                this.$loading();
                DepartmentApiV1.getAllDepartment()
                    .then((res) => {
                        this.$loaded();
                        this.treeList = res.body.data.children;
                        this.initDt(this.treeList);
                        this.editTreeList = cloneDeep(this.treeList);
                        if (this.editTreeList) {
                            this.showSendChannel = true;
                        }
                    });
            },
            //递归实现
            //@leafId  要查找的id，
            //@nodes   为原始Json数据
            //@path    供递归使用，不要赋值
            findPathByLeafId: function (leafId, nodes, path) {
                if (path === undefined) {
                    path = [];
                }
                for (let i = 0; i < nodes.length; i++) {
                    let tmpPath = path.concat();
                    tmpPath.push(nodes[i]);
                    if (leafId === nodes[i].id) {
                        return tmpPath;
                    }
                    if (nodes[i].children) {
                        let findResult = this.findPathByLeafId(leafId, nodes[i].children, tmpPath);
                        if (findResult) {
                            return findResult;
                        }
                    }
                }
            },
            /**
             * 01初始化树
             * spread 展开
             * checked 选中
             * @param dt
             */
            initDt(dt) {
                for (let i = 0; i < dt.length; i++) {
                    let item = dt[i];
                    this.$set(item, 'spread', true);
                    this.$set(item, 'checked', false);
                    this.$set(item, 'departmentName', item.departmentName);
                    this.$set(item, 'emailSendCount', item.emailSendCount);
                    this.$set(item, 'smsSendCount', item.smsSendCount);
                    this.$set(item, 'mmsSendCount', item.mmsSendCount);
                    if (item.children) {
                        this.initDt(item.children);
                    }
                }
            },
            // 邮件/短信/彩信/微信有关于新增通道中的相关name的获取
            choseEmaliField(e) {
                this.sendAddress = e.name;
                this.emailAddressId = e.id;
            },
            choseSmsField(e) {
                this.sendAddress = e.name;
                this.sendoutId = e.id;
                this.message = e.message;
            },
            choseMmsField(e) {
                this.sendAddress = e.name;
                this.sendoutId = e.id;
            },
            choseWeChatField(e) {
                this.sendAddress = e.name;
                this.emailAddressId = e.id; //邮件活动号// 如果是微信的话 该值为微信id
            },
            // 发件地址列表
            getAllSendList() {
                GeteOriginApi
                    .getAllSendChannel({
                        departmentId: this.departmentId,
                        searchType: this.sendType,
                    })
                    .then(({body: {data: {sendChannel}}}) => {
                        this.sendList = sendChannel;
                    });
            },
            showSentManage(event) {
                this.departmentName = event.departmentName;
                this.departmentId = event.id;
                this.sendType = event.sendType;
                if (this.sendType === 0) {
                    this.sendSenderTitile = this.$t('sendChannel.emailAddress');
                    this.addAddressTitle = this.$t('sendChannel.addNewSender');
                    this.sender = this.$t('sendChannel.emailAddress');
                    this.describe =
                        this.$t('sendChannel.configureEmail')
                        + this.departmentName +
                        this.$t('sendChannel.describeEmail');
                } else if (this.sendType === 1) {
                    this.sendSenderTitile = this.$t('sendChannel.smsSender');
                    this.addAddressTitle = this.$t('sendChannel.addSender');
                    this.sender = this.$t('sendChannel.SMS');
                    this.describe =
                        this.$t('sendChannel.configureSms')
                        + this.departmentName +
                        this.$t('sendChannel.describeSms');
                } else if (this.sendType === 2) {
                    this.sendSenderTitile = this.$t('sendChannel.mmsSender');
                    this.addAddressTitle = this.$t('sendChannel.addSender');
                    this.sender = this.$t('sendChannel.MMS');
                    this.describe = this.$t('sendChannel.configureMms')
                        + this.departmentName +
                        this.$t('sendChannel.describeMms');
                } else if (this.sendType === 3) {
                    this.sendSenderTitile = this.$t('sendChannel.ConfigureAccounts');
                    this.addAddressTitle = this.$t('sendChannel.addWeChat');
                    this.sender = this.$t('sendChannel.Accounts');
                    this.describe = this.$t('sendChannel.userWeChat');
                }
                this.addSender = true;
                this.getAllSendList();
            },
            closeSentSender() {
                this.addSender = false;
                if (this.sendType === 0) {
                    this.emailAddressId = '';
                } else if (this.sendType === 1) {
                    this.smsId = '';
                } else if (this.sendType === 2) {
                    this.mmsId = '';
                } else {
                    this.weChatId = '';
                }
                this.sendList = [];
                this.getAllDepartment();
            },
            addAddress() {
                if (this.sendType === 0) {
                    this.emailAddressId = '';
                } else if (this.sendType === 1) {
                    this.smsId = '';
                } else if (this.sendType === 2) {
                    this.mmsId = '';
                } else {
                    this.weChatId = '';
                }
                this.addNewAddress = true;

            },
            closeNewSender() {
                this.addNewAddress = false;
                this.editEmailAddress = false;
                if (this.sendType === 0) {
                    this.emailAddressId = '';
                    this.senders = [{name: '', senderType: 1, btnsShow: false}];
                } else if (this.sendType === 1) {
                    this.smsId = '';
                } else if (this.sendType === 2) {
                    this.mmsId = '';
                } else {
                    this.weChatId = '';
                }
                this.getAllDepartment();
            },
            valid() {
                if (this.sendType === 0) {
                    if (!this.emailAddressId) {
                        this.$toast(this.$t('sendChannel.emailSelect'), 'warn');
                        return false;
                    }
                } else if (this.sendType === 1) {
                    if (!this.smsId) {
                        this.$toast(this.$t('sendChannel.select'), 'warn');
                        return false;
                    }
                } else if (this.sendType === 2) {
                    if (!this.mmsId) {
                        this.$toast(this.$t('sendChannel.select'), 'warn');
                        return false;
                    }
                } else {
                    if (!this.weChatId) {
                        this.$toast(this.$t('sendChannel.selectAccount'), 'warn');
                        return false;
                    }
                }
                return true;
            },
            // 保存发送通道（邮件/短信/彩信/微信）
            saveChannel() {
                // 筛选 name 不为空的发件人
                let senders = this.senders.filter(sender => sender.name !== '' && sender.name !== null);
                GeteOriginApi
                    .saveSendChannel({
                        departmentId: this.departmentId,
                        sendAddress: this.sendAddress,
                        sendType: this.sendType,
                        senderId: this.emailAddressId,
                        sendoutId: this.sendoutId,
                        message: this.message,
                        senderList: senders,
                    })
                    .then(() => {
                        this.$toast(this.$t('sendChannel.success'), 'success');
                        this.closeNewSender();
                        this.getAllSendList();
                    });
            },
            // 邮件-编辑发件地址-显示按钮组
            showBtns(sender) {
                sender.btnsShow = true;
            },
            // 邮件-编辑发件地址-隐藏按钮组
            closeBtns(sender, index) {
                if (sender.id) {
                    this.fetchSenderByDepIdSendId();
                } else {
                    this.senders.splice(index, 1);
                }
            },
            // 编辑邮件发件人
            editEmailSender(sender) {
                if (!sender.name) {
                    this.$toast(this.$t('sendChannel.emailSenderNull'), 'warn');
                    return false;
                }
                // 编辑
                if (sender.id) {
                    SenderApi
                        .modifyEmailSender({
                            id: sender.id,
                            name: sender.name,
                        })
                        .then(res => {
                            this.$toast(res.body.message, 'success');
                            this.fetchSenderByDepIdSendId();
                        });
                } else {
                    // 保存
                    SenderApi
                        .saveEmailSender({
                            departmentId: this.departmentId,
                            name: sender.name,
                            sendAddressId: this.emailAddressId,
                            senderType: 1
                        })
                        .then(res => {
                            this.$toast(res.body.message, 'success');
                            this.fetchSenderByDepIdSendId();
                        });
                }
            },
            // 邮件-删除发件人
            delEmailSender(sender) {
                SenderApi
                    .delEmailSender(sender.id)
                    .then(res => {
                        this.$toast(res.body.message, 'success');
                        this.fetchSenderByDepIdSendId();
                    });
            },
            saveNewSender() {
                if (!this.valid()) {
                    return;
                }
                if (this.editEmailAddress) {
                    this.closeNewSender();
                    this.getAllSendList();
                } else {
                    this.saveChannel();
                }
            },
            // 获取发件人列表
            fetchSenderByDepIdSendId() {
                SenderApi
                    .getSenderByDepIdSendId(this.departmentId, this.emailAddressId)
                    .then(res => {
                        this.senders = res.body.data.senderList;
                        this.senders.map(sender => {
                            this.$set(sender, 'btnsShow', false);
                        });
                    });
            },
            // 邮件-编辑发送通道
            editChannel(send) {
                this.emailAddressId = send.senderId;
                this.addNewAddress = true;
                this.editEmailAddress = true;// 发件地址只读
                // 获取发件人列表
                this.fetchSenderByDepIdSendId();
            },
            // 邮件-添加发件人
            addSenders() {
                if (this.senders.length >= 10) {
                    this.$toast(this.$t('sendChannel.upTen'), 'warn');
                    return;
                }
                let sender = {name: '', senderType: 1, btnsShow: true};
                this.senders.push(sender);

            },
            // 邮件-删除发件人
            delSenders(sender, index) {
                if (this.editEmailAddress && sender.id) {
                    this.$confirm(this.$t('common.defaultConfirmTitle'),
                        this.$t('sendChannel.confirm') + `【${sender.name}】 ` + this.$t('sendChannel.if'))
                        .then(sure => {
                            if (sure) {
                                this.delEmailSender(sender);
                            }
                        });
                } else {
                    this.senders.splice(index, 1);
                }
            },
            // 删除发送通道
            delChannel(send) {
                let  confirm = '';
                if (send.sendType === 3 ) {//微信
                    confirm = this.$t('sendChannel.afterDel');
                } else {
                    confirm = this.$t('sendChannel.confirm') + `【${send.sendAddress}】 ` + this.$t('sendChannel.if');
                }
                this.$confirm(this.$t('common.defaultConfirmTitle'), confirm)
                    .then(sure => {
                        if (sure) {
                            GeteOriginApi.deleteSendChannel({
                                id: send.id
                            })
                                .then(() => {
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    this.getAllSendList();
                                });
                        }
                    });
            },
        },
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .sent-channel {
        min-width: 1500px;
        .sent-theme-text {
            padding: 10px 0;
            border: none;
            color: $green;
            cursor: pointer;
        }

        .list-title {
            position: relative;
            height: 32px;
            padding: 13px 0;

            .search-box {
                margin-right: 16px;
            }
        }

        .sent-channel-list {
            width: 100%;

            .sent-channel-title {
                width: 100%;
                line-height: 40px;
                height: 40px;
                background-color: $title-bg;
                color: #6e7376;
                font-weight: bold;
                display: flex;

                li {
                    width: 16%;

                    &:nth-child(1) {
                        margin-left: 20px;
                    }

                    span {
                        color: $theme;
                        cursor: pointer;
                    }
                }
                .sendChannel-department{
                    width: 21%;
                }

            }

            .list-left {
                float: left;
                width: 21%;
                overflow-x: scroll;
                background-color: white;
                box-sizing: border-box;
                padding-left: 28px;
            }

            .list-right {
                float: left;
                width: calc(100% - 21%);
                overflow-x: scroll;
                background-color: white;
                box-sizing: border-box;
            }
        }

        .send-table {
            max-height: 300px;
            overflow-x: auto;

            tr {
                td {
                    &:nth-child(2) {
                        width: 100px;
                    }
                }
            }
        }

        .modify-send {
            max-height: 500px;
            overflow-y: auto;


        }

        .add-condition-btn {
            height: 22px;
            line-height: 22px;
            border: none;
            padding: 0;
            margin-left: 120px;
            background-color: transparent;
            color: $green;
            cursor: pointer;

            &:hover {
                color: $light-green;
            }

            svg {
                display: inline-block;
                width: 1em;
                height: 1em;
                vertical-align: top;
                margin-top: 5px;
                fill: currentColor;
            }
        }

        .icon-iconless {
            color: $red;

            &:hover {
                color: $light-red;
            }
        }
    }
</style>
