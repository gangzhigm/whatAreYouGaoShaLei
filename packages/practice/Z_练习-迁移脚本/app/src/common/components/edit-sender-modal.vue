<template>
    <!--编辑发件人 modal -->
    <modal class="sender-content" v-if="editSenderShow" :title="$t('sendChannel.setSender')" @close="closeEditSender">
        <div class="form-field flex">
            <label class="label" for="sendName"></label>
            <div class="field-group" id="sendName">
                <template v-for="(sender, index) in senderList">
                    <div v-if="sender.btnsShow">
                        <input type="text" class="input lg" v-model.trim="sender.name"
                               maxlength="100"/>
                        <button type="button" class="btn btn-sm btn-theme"
                                @click.self="editEmailSender(sender)">{{'common.save' | t}}
                        </button>
                        <button type="button" class="btn btn-sm btn-white"
                                @click.self="closeBtns(sender, index)">{{'common.cancel' | t}}
                        </button>
                    </div>
                    <!--查看发件人-->
                    <div class="sender-name" v-if="sender.id && !sender.btnsShow">
                        <span>{{sender.name}}</span>
                        <!-- 用户自己创建的才能操作-->
                        <template v-if="roleId === '' || roleId === 0 || sender.senderType === 2">
                            <button class="action-icon icon icon-pencil" @click='showBtns(sender)'
                                    v-title:top="$t('common.edit')">
                            </button>
                            <button class="action-icon icon icon-iconless"
                                    @click.self='delSenders(sender, index)'
                                    v-title:top="$t('common.del')">
                            </button>
                        </template>
                    </div>
                </template>
            </div>
        </div>
        <button type="button" class="add-condition-btn" @click="addSenders">
            <svg>
                <use xlink:href="#icon-plus"></use>
            </svg>
            {{'sendChannel.addEmailSender' | t}}
        </button>
        <template v-slot:buttons>
            <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')"
                   @click="closeEditSender">
        </template>
    </modal>
</template>

<script>
    import { SenderApi } from '@/api';

    // 发件人类型   2 用户创建  1 管理员创建
    const senderType = 2;

    export default {
        name: 'edit-sender-modal',
        props: {
            // 编辑发件人弹窗
            editSenderShow: {
                type: Boolean,
                require: true,
            },
            // 发件人列表
            senderList: {
                type: Array,
                require: true
            }
        },
        data() {
            return {
                senderType,
            };
        },
        computed: {
            roleId() {
                const USER_INFO = String(process.env.NODE_ENV).toUpperCase() + '_USER_INFO';
                return JSON.parse(localStorage.getItem(USER_INFO)).roleId;
            } 
        },
        methods: {
            // 关闭编辑发件人弹窗
            closeEditSender() {
                this.$emit('change');
                this.$emit('close');
            },
            // 编辑发件人
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
                            this.$emit('change');
                        });
                } else {
                    // 保存
                    SenderApi
                        .saveEmailSender({
                            departmentId: '',
                            name: sender.name,
                            sendAddressId: '',
                            senderType: this.senderType
                        })
                        .then(res => {
                            this.$toast(res.body.message, 'success');
                            this.$emit('change');
                        });
                }
            },
            // 隐藏按钮组
            closeBtns(sender, index) {
                if (sender.id) {
                    this.$emit('change');
                } else {
                    this.senderList.splice(index, 1);
                }
            },
            // 显示按钮组
            showBtns(sender) {
                sender.btnsShow = true;
            },
            // 邮件-删除发件人
            delEmailSender(sender) {
                SenderApi
                    .delEmailSender(sender.id)
                    .then(res => {
                        this.$toast(res.body.message, 'success');
                        this.$emit('change');
                    });
            },
            // 删除发件人
            delSenders(sender, index) {
                if (sender.id) {
                    this.$confirm(this.$t('common.defaultConfirmTitle'),
                        this.$t('sendChannel.confirm') + `【${sender.name}】 ` + this.$t('sendChannel.if'))
                        .then(sure => {
                            if (sure) {
                                this.delEmailSender(sender);
                                this.$emit('change');
                            }
                        });
                } else {
                    this.senderList.splice(index, 1);
                }
            },
            // 添加发件人-用户创建，可以添加 20 条
            addSenders() {
                let userSenderList = this.senderList.filter(sender => sender.senderType === this.senderType);
                if (userSenderList.length >= 20) {
                    this.$toast(this.$t('sendChannel.upTwenty'), 'warn');
                    return;
                }
                let sender = {name: '', senderType: this.senderType, btnsShow: true};
                this.senderList.push(sender);
            }
        }
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .sender-content {
        .sender-name {
            margin-right: 95px;
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
