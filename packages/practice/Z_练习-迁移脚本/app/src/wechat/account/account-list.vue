<template>
    <div class="account-list">
        <div class="content-view">
            <crumbs/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'wechatAccount.wechatAccountMgt' | t}}</h1>
                <button type="button" class="pull-right btn btn-md btn-theme" @click="bindAccount">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'wechatAccount.bindWechatAccount' | t}}
                </button>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view margin">
                <ul v-if="subscriptionList.length" class="subscription-list">
                    <li v-for="item in subscriptionList" class="subscription-item">
                        <div class="avatar">
                            <img :src="item.headImg" alt="avatar">
                        </div>
                        <div class="subscription-info">
                            <h2 class="subscription-name">{{item.principalName}}</h2>
                            <div v-if="item.serviceTypeInfo !== 2" class="subscribe">{{'wechatAccount.subscription' |
                                t}}
                            </div>
                            <div v-if="item.serviceTypeInfo === 2" class="serve">{{'wechatAccount.server' | t}}</div>
                            <div v-if="item.verifyTypeInfo !== -1" class="authorized"><i
                                    class="icon icon-True"></i>{{'wechatAccount.authenticated' | t}}
                            </div>
                            <div v-if="item.verifyTypeInfo === -1" class="unauthorized"><i
                                    class="icon icon-wt-notice"></i>{{'wechatAccount.unauthorized' | t}}
                            </div>
                            <div v-if="item.verifyTypeInfo === -1" class="description">
                                {{'wechatAccount.reAuth' | t}}
                            </div>
                        </div>
                        <div class="btn-wrapper">
                            <input v-if="!Boolean(item.status)" class="btn btn-md btn-theme" type="button"
                                   :value="$t('wechatAccount.authAgain')"
                                   @click="bindAccount()">
                            <!--<input v-if="Boolean(item.status)" class="btn btn-md" type="button" value="解绑公众号" @click="unbinding(item.authorizerInfoId)">-->
                        </div>
                        <!--<p class="valid-until">授权有效期至: {{item.validUntil}}</p>-->
                    </li>
                </ul>
                <list-empty v-if="!subscriptionList.length"/>
            </div>
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
    </div>
</template>

<script type="text/ecmascript-6">
    import { WechatApiV1 } from '@/api';

    export default {
        data() {
            return {
                subscriptionList: [],
                modal: {
                    modalShow: false,
                    cancelShow: true,
                    title: '',
                    modalContent: '',
                    unbindSubscriptionId: 0
                }
            };
        },
        created() {
            // 获取全部公众号
            WechatApiV1
                .getAccounts()
                .then(({body: {data: {authorizerInfoList}}}) => {
                    this.subscriptionList = authorizerInfoList;
                });
        },
        methods: {
            bindAccount() {
                const user = this.$store.state.user;
                if (user.isWx === 1) {
                    if (this.subscriptionList.length >= 1) {
                        this.modal.modalShow = true;
                        this.modal.cancelShow = true;
                        this.modal.title = this.$t('wechatAccount.cannotBindMore');
                        this.modal.modalContent = this.$t('wechatAccount.contectService');
                    } else {
                        this.$router.push({name: 'bindWechatOfficialAccount', query: {redirect: this.$route.fullPath}});
                    }
                } else {
                    this.modal.modalShow = true;
                    this.modal.cancelShow = true;
                    this.modal.title = this.$t('wechatAccount.cannotbind');
                    this.modal.modalContent = this.$t('wechatAccount.notAuth');
                }
            },
            modalConfirm() {
                if (this.modal.title === this.$t('wechatAccount.unBind')) {
                    this.unbindSubscription(this.modal.unbindSubscriptionId);
                } else {
                    this.close();
                }
            },
            close() {
                this.modal.modalShow = false;
            }
        },
    };
</script>

<style lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .account-list {
        .subscription-item {
            overflow: hidden;
            margin-bottom: 10px;
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

            .subscription-info {
                float: left;
                overflow: hidden;
                max-width: 490px;

                .subscription-name {
                    float: left;
                    margin-right: 10px;
                    line-height: 29px;
                    font-weight: normal;
                    color: $color-content;
                }

                .subscribe, .serve {
                    float: left;
                    margin-right: 10px;
                    height: 27px;
                    line-height: 27px;
                    text-align: center;
                    font-size: 12px;
                    border-radius: 14px;
                    border: 1px solid $color-light-content;
                    color: $color-light-content;
                    padding: 0px 10px;
                }

                .authorized,
                .unauthorized {
                    float: left;
                    width: 80px;
                    height: 29px;
                    line-height: 29px;
                    text-align: center;
                    font-size: 14px;
                    color: $color-content;
                    border-radius: 14px;

                    .icon {
                        margin-right: 5px;
                        font-size: 17px;
                    }
                }

                .authorized {
                    color: $green;
                }

                .unauthorized {
                    color: $red;
                }

                .description {
                    clear: left;
                    height: 35px;
                    line-height: 35px;
                    color: $color-light-content;
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
    }

</style>
