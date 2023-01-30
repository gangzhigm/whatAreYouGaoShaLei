<template>
    <selector class="public-account" :options="publicAccountList" v-model="accountId" search :placeholder="placeholder"
              @select="selectAccount" :disabled="disabled"/>
</template>

<script>
    import { WechatApiV1} from '@/api';
    import {UPDATE_USER_INFO} from '@/store/vuex/mutationTypes';
    import {USER_INFO_SESSION_KEY} from '@/store/vuex/rootStore';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import { mapState, mapMutations } from 'vuex';

    export default {
        name: 'public-account', // 多公众号
        props: {
            // 提示信息
            placeholder: {
                type: String,
                default: '公众号名称' // todo 国际化
            },
            // 模块
            // 微信模块，微信报告-wechat
            // 旅程模块：journey
            module: {
                type: String,
                default: 'wechat'
            },
            // 禁用
            disabled: {
                type: Boolean,
                default: false,
            }
        },
        data() {
            return {
                publicAccountList: [],// 公众号列表
                accountId: null, // 公众号id
            };
        },
        computed: {
            ...mapState({
                listenWechatId: state => state.user.authorizerInfoId,
                user: state => state.user,
                draggableAuthorizerInfoId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].authorizerInfoId
            })
        },
        watch: {
            listenWechatId:function() {
                window.location.reload();
            }
        },
        mounted() {
            // 获取公众号列表
            WechatApiV1
                .getWechatAccounts()
                .then(res => {
                    this.publicAccountList = res.body.data.authorizerInfoList.map(auth => ({
                        id: auth.authorizerInfoId,
                        WxAppId: auth.WxAppId,
                        name: auth.principalName,
                        serviceTypeInfo: auth.serviceTypeInfo,
                    }));

                    // 微信模块 + 微信报告：公众号默认值
                    if (this.module === 'wechat') {
                        this.accountId = ~~JSON.stringify(JSON.parse(this.listenWechatId));
                    }

                    // 旅程模块 公众号默认值
                    if (this.module === 'journey' && this.publicAccountList.length > 0) {
                        this.accountId = this.draggableAuthorizerInfoId
                            || this.publicAccountList[0].id;
                    }
                    this.$emit('getAccountList', this.publicAccountList);
                });
        },
        methods: {
            selectAccount(e) {
                this.accountId = e.id;

                // 微信模块 + 微信报告：给当前用户赋值所选公众号
                if (this.module === 'wechat') {
                    if (this.listenWechatId === this.accountId) return;
                    this.UPDATE_USER_INFO({authorizerInfoId: this.accountId});
                    localStorage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(this.user));
                    window.location.reload();
                }
                this.$emit('select', e);
            },
            ...mapMutations([
                UPDATE_USER_INFO
            ])
        },
    };
</script>
