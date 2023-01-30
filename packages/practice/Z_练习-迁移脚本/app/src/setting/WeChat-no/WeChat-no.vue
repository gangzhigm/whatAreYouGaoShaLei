<template>
    <div class="account-list">
        <div class="bind-btn">
            <button type="button" class="pull-right btn btn-md btn-theme"
                    :disabled="$has('enterprise_wechat_bundle_accounts')"
                    @click="bindAccount">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-plus"></use>
                </svg>
                {{'wechatAccount.bindWechatAccount' | t}}
            </button>
        </div>
        <div class="page-content">
            <!-- 2020.7.21 世邦 可绑定多公众号 更改为列表 -->
            <div class="simplify-table auto-width weChat-no">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{'wechatNo.officialAccounts' | t}}</th>
                            <th>
                                <span>{{'wechatNo.types' | t}}</span>
                                <span class="icon icon-yiwen1"
                                      v-title:right="$t('wechatNo.weChatType')"></span>
                            </th>
                            <th>{{'wechatNo.options' | t}}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading" class="no-hover">
                            <td colspan="24" class="slim-cell">
                                <inline-loading />
                            </td>
                        </tr>
                        <tr v-else-if="subscriptionList.length > 0" v-for="item in subscriptionList">
                            <td>
                                <div class="subscription-td">
                                    <div class="avatar">
                                        <img :src="item.headImg" alt="avatar">
                                    </div>
                                    <span class="principal-name">{{item.principalName}}</span>
                                </div>
                            </td>
                            <td>
                                <span v-if="item.serviceTypeInfo !== 2" class="subscribe">
                                    {{'wechatAccount.subscription' | t}}
                                </span>
                                <span v-if="item.serviceTypeInfo === 2" class="serve">{{'wechatAccount.server' | t}}</span>
                                <span v-if="item.verifyTypeInfo !== -1" class="authorized">
                                    ({{'wechatAccount.authenticated' | t}})
                                </span>
                                <span v-if="item.verifyTypeInfo === -1" class="unauthorized">
                                    （{{'wechatAccount.unauthorized' | t}}）
                                </span>
                                <span v-if="item.verifyTypeInfo === -1" class="description">
                                    {{'wechatAccount.reAuth' | t}}
                                </span>
                            </td>
                            <td>
                                <button class="btn unbind-operation" :class="{operationColor: !$has('enterprise_wechat_unbundle_accounts')}"
                                        :disabled="$has('enterprise_wechat_unbundle_accounts')"
                                        @click="unbindWeChat(item)">
                                    {{'wechatNo.unBind' | t}}
                                </button>
                                <button class="btn unbind-operation" :class="{operationColor: !$has('enterprise_wechat_Sync')}"
                                        :disabled="$has('enterprise_wechat_Sync')"
                                        @click="synchronize(item.authorizerInfoId)">
                                    {{'wechatNo.sync' | t}}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <list-empty v-if="!subscriptionList.length && !loading"/>
            <pager :total="totalPage" :now="nowPage" @page="handlePage"></pager>
        </div>
        <modal v-if="modal.modalShow" :title="modal.title" @close="close">
            {{modal.modalContent}}
            <template v-slot:buttons>
                <input v-if="modal.cancelShow" type="button" class="btn btn-md btn-white"
                       @click="close()"
                       :value="$t('common.cancel')"/>
                <input type="button" class="btn btn-md btn-theme" tabindex="1" autofocus
                       @click="modalConfirm()" :value="$t('wechatAccount.gotIt')"/>
            </template>
        </modal>
        <!--ready解绑公众号-->
        <modal v-if="unbindFlag" :title="$t('wechatNo.unbundleWe')" @close="cancelUnbind">
            <div>
                <p class="unbind-DMT"> {{'wechatNo.readyUnbound' | t}}</p>
                <checkbox v-model="agreeFlag">{{'wechatNo.unbindDMT' | t}}</checkbox>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-white" @click="cancelUnbind" :value="$t('common.cancel')"/>
                <input type="button" class="btn btn-md btn-theme" :disabled="!agreeFlag"
                       @click="successUnbind" :value="$t('wechatNo.unbundleNow')"/>
            </template>
        </modal>
    </div>
</template>

<script>
    import { ManageApi ,WechatApiV1 } from '@/api';

    export default {
        name: 'Wechat-no',
        data() {
            return {
                subscriptionList: [],
                modal: {
                    modalShow: false,
                    cancelShow: true,
                    title: '',
                    modalContent: '',
                },
                unbindFlag: false,//ready解绑公众号弹窗显隐
                agreeFlag: false, // 解绑按钮可点不可点
                unbindQrCode: {}, //要解绑的公众号
                totalPage: 1,
                nowPage: 1,
                loading: false
            };
        },
        mounted() {
            this.getAccounts();
        },
        methods: {
            // 获取全部公众号
            getAccounts() {
                this.loading = true; 
                WechatApiV1
                    .getAccounts(this.nowPage)
                    .then((res) => {
                        this.loading = false; 
                        this.subscriptionList = res.body.data.authorizerInfoList;
                        this.totalPage = res.body.data.totalPage;
                    });
                this.$parent.$on('account', () => {
                    this.bindAccount();
                });
            },
            //绑定公众号
            bindAccount() {
                ManageApi
                    .checkWeChat()
                    .then((res) => {
                        let flag = res.body.data.flag;//0可绑定，1不可绑定（达到上线后不可绑定/没有权限不可绑定）

                        if (flag === 0) {
                            let {href} = this.$router.resolve({name: 'wechatAccountAuthorization'});
                            window.open(href);
                        }
                        if (flag === 1) {
                            let msg = res.body.message;
                            this.modal.modalShow = true;
                            this.modal.cancelShow = true;
                            this.modal.title = this.$t('wechatAccount.cannotbind');
                            this.modal.modalContent = msg;
                        }
                    });
            },
            modalConfirm() {
                this.close();
            },
            close() {
                this.modal.modalShow = false;
            },
            // 同步
            synchronize (id) {
                this.$confirm(null, this.$t('wechatNo.syncTip'))
                    .then(sure => {
                        if (sure) {
                            this.loading = true; 
                            WechatApiV1
                                .synAuthorization(id)
                                .then(() => {
                                    this.loading = false; 
                                    this.getAccounts();
                                });
                        }
                    });
            },
            //    准备解绑
            unbindWeChat(item) {
                this.unbindQrCode = item;
                this.unbindFlag = true;
            },
            //取消解绑
            cancelUnbind() {
                this.agreeFlag = false;
                this.unbindFlag = false;
                this.unbindQrCode = {};
            },
            //解绑公众号
            successUnbind() {
                this.agreeFlag = false;
                this.unbindFlag = false;
                WechatApiV1
                    .unbindQrCode(this.unbindQrCode.authorizerInfoId)
                    .then((res) => {
                        if (res.body.code === 200) {
                            this.unbindQrCode = {};
                            this.nowPage = 1;
                            this.getAccounts();
                            this.$toast(this.$t('wechatNo.UnbundSuccess'),'success');
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            },
            // 分页操作
            handlePage(e) {
                this.nowPage = e;
                this.getAccounts();
            },
        },
    };
</script>

<style lang="scss">
    @import '../../common/scss/base/_variables.scss';
    @import '../../common/scss/base/_mixin.scss';
    .account-list {
        .bind-btn {
            @include clearfix();
            margin-bottom: 10px;
        }
        .subscription-item {
            overflow: hidden;
            padding: 20px;
            border: 1px solid $border-color;
            border-radius: 5px;
            background-color: white;
            @include clearfix();

            .avatar {
                float: left;
                overflow: hidden;
                margin-right: 20px;
                width: 67px;
                height: 67px;
                border-radius: 50%;

                img {
                    height: 100%;
                }
            }

            .btn-wrapper {
                box-sizing: border-box;
                float: right;
                padding: 12px 40px;
                width: 190px;
                height: 100%;

                input {
                    float: right;
                    display: block;
                    width: 112px;
                    border: 1px solid $border-color;

                    &.btn-journey {
                        border: none;
                    }
                }
            }

            .valid-until {
                clear: left;
                padding: 0 17px;
                height: 34px;
                line-height: 34px;
                color: $color-light-content;
                border-top: 1px solid $border-color;
            }
        }
        .page-content{
            .weChat-no{
                .unbind-operation{
                    padding: 0;
                }
                .operationColor{
                    color: $green;
                }
                .subscription-td{
                    .avatar {
                        float: left;
                        overflow: hidden;
                        margin-right: 20px;
                        width: 67px;
                        height: 67px;
                        border-radius: 50%;
                        img {
                            height: 100%;
                        }
                    }
                    .principal-name{
                        line-height: 67px;
                    }
                }
            }
        }
        .unbind-DMT{
            padding: 10px 0;
        }
    }

</style>
