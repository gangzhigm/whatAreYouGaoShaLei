<template>
    <transition name="slide-right">
        <div class="controller-summary-detail" v-if="controllerId" v-blur="close">
            <div class="pack">
                <div class="hand" @click="close">
                    <i class="icon icon-arrowright"></i>
                    <span>{{'journey.hide' | t}}</span>
                </div>
            </div>
            <div class="search-box">
                <input type="text" v-model.trim="keyword" :placeholder="$t('journey.search')" maxlength="100"
                       @keydown.enter="search">
                <svg aria-hidden="true" @click="search">
                    <use xlink:href="#icon-search"></use>
                </svg>
            </div>
            <div class="content-box">
                <div v-for="item in user" class="userInfo">
                    <p class="userName" @click="showContent(item)"
                       :title="item.name || item.nickName || $t('journey.unknownCustomer')">
                        {{item.name || item.nickName || $t('journey.unknownCustomer')}}
                    </p>
                    <transition name="slide-fade">
                        <div class="userContent" v-show="item.show">
                            <div class="uheader-img">
                                <img :src="item.headUrl" v-if="item.headUrl">
                                <i class="icon icon-lianxiren" v-else></i>
                            </div>
                            <div class="udetail">
                                <p>{{'journey.phone' | t}}{{'punctuation.colon' | t}} {{item.mobile || $t('journey.no')}}</p>
                                <p>{{'journey.email' | t}}{{'punctuation.colon' | t}} {{item.email || $t('journey.no')}}</p>
                                <p>{{'journey.WeChatName' | t}}{{'punctuation.colon' | t}} {{item.nickName || $t('journey.no')}}</p>
                                <p>{{'journey.enterTime' | t}}{{'punctuation.colon' | t}} {{item.createTime}}</p>
                                <!-- <p v-if="item.officialAccount">关注公众号：{{item.officialAccount||'暂不支持'}}</p>
                                <p v-if="item.openId">openid：{{item.openId||'暂不支持'}}</p>
                                <p v-if="item.unionId">uid：{{item.unionId||'暂不支持'}}</p> -->
                            </div>
                        </div>
                    </transition>
                </div>
                <template v-if="user.length === 0">
                    <list-search-empty v-if="keyword"/>
                    <list-empty v-else/>
                </template>
            </div>
            <pager v-if="totalPage" size="sm" :length="4" :total="totalPage" :now="page" @page="handlePage"></pager>
        </div>
    </transition>
</template>

<script type="text/ecmascript-6">
    import { RtJourneyV1, WechatApiV1} from '@/api';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {CHECK_CONTROLLER_SUMMARY_DETAIL} from '@/store/vuex/mutationTypes';
    import {logError} from '../../../monitor.js';
    import { mapMutations, mapState } from 'vuex';

    export default {
        data() {
            return {
                keyword: '',
                totalPage: 1,
                page: 1,
                user: []
            };
        },
        methods: {
            ...mapMutations([
                CHECK_CONTROLLER_SUMMARY_DETAIL
            ]),
            search() {
                this.page = 1;
                this.getUserDetail();
            },
            showContent(e) {
                e.show = !e.show;
            },
            handlePage(page) {
                this.page = page;
                this.getUserDetail();
            },
            close() {
                this.page = 1;
                this.CHECK_CONTROLLER_SUMMARY_DETAIL('');
            },
            //ajax
            getUserDetail() {
                RtJourneyV1
                    .getUsersLogOfController({
                        content: this.keyword,
                        controllerName: this.controller.type,
                        controllerId: this.controller.id,
                        journeyInstantiationId: this.journeyInformation.journeyInstantiationId,
                        pageNo: this.page
                    })
                    .then(({body: {data: {data, totalPage}}}) => {
                        this.user = data.map((item) => {
                            item.show = false;
                            item.nickName = '';
                            item.headUrl = '';
                            item.createTime = item.createDate.slice(0, 10) + ' ' + item.createDate.slice(11, 19);
                            return item;
                        });
                        this.totalPage = totalPage;
                        this.getUserHeader();
                    })
                    .catch(res => {
                        this.$loaded();
                        this.$toast(res.body.message, 'warn');
                        this.page = 1;
                    });
            },
            /**
             * 获取用户头像和昵称
             */
            getUserHeader() {
                if (this.user.length === 0) return;
                let openIds = this.user.map(({openId}) => openId)
                    .filter(openId => openId)
                    .join(',');
                if (openIds.length && this.authorizerInfoId) {
                    WechatApiV1.getUserBasic(openIds)
                        .then(({body: {data: {headUrls}}}) => {
                            this.user.forEach((item) => {
                                let len = headUrls.length;
                                for (let i = 0; i < len; i++) {
                                    if (item.openId === headUrls[i].openid) {
                                        item.nickName = headUrls[i].nickName || null;
                                        item.headUrl = headUrls[i].headUrl || null;
                                        break;
                                    }
                                }
                                return item;
                            });
                        });
                }
            }
        },
        computed: {
            ...mapState({
                storeName: state => state[DRAGGABLE_JOURNEY_STORE_NAME],
                authorizerInfoId: state => state.user.authorizerInfoId,
            }),
            journeyInformation() {
                return this.storeName.journeyInformation;
            },
            controller() {
                const controller = this.storeName.canvasInformation.controllers[this.controllerId];
                if (!controller) {
                    logError(`[营销旅程] <controller-summary-detail /> controller 在展示参与控件的用户列表是没有找到控件,控件{ID:${this.controllerId}} :104`);
                    return {};
                }
                return controller;
            },
            controllerId() {
                return this.storeName.summaryDetailControllerId;
            }
        },
        watch: {
            controllerId: function (newId, oldId) {
                if (newId !== oldId) {
                    this.keyword = '';
                }
                if (newId) {
                    this.getUserDetail();
                }
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../common/scss/base/_variables.scss";
    @import "../../../common/scss/base/mixin";

    .controller-summary-detail {
        @include box-shadow(-2px 4px 10px #333333);
        background-color: $title-bg;
        position: fixed;
        right: 0;
        bottom: 0;
        z-index: 2;
        top: 169px;
        width: 299px;
        overflow-x: hidden;
        overflow-y: auto;
        padding: 16px 24px;

        .pack {
            padding-bottom: 24px;
            font-size: 14px;

            .hand {
                cursor: pointer;
                width: 50px;
            }
        }

        .search-box {
            width: 100%;
            margin-left: 0;
        }

        .content-box {
            box-sizing: border-box;
            margin-top: 8px;
            padding: 8px 16px;
            border: 1px solid $border-color;
            background-color: white;

            .userInfo + .userInfo {
                border-top: 1px dotted $border-color;
            }

            .userName {
                line-height: $input-field-height;
                position: relative;
                cursor: pointer;
                @include ellipsis();
            }

            .userContent {
                margin-bottom: 8px;
                display: -webkit-flex;
                display: flex;
                -webkit-flex: 1;
                flex: 1;
                -webkit-align-items: center;
                align-items: center;
                justify-content: space-between;

                .uheader-img {
                    width: 60px;
                    height: 60px;
                    margin-right: 5px;

                    img {
                        width: 100%;
                        height: 100%;
                        display: block;
                        line-height: 1;
                        border-radius: 4px;
                    }

                    .icon {
                        font-size: 60px;
                        line-height: 60px;
                        display: -webkit-flex;
                        display: flex;
                        color: white;
                        background-color: rgb(156, 156, 156);
                        border-radius: 4px;
                    }
                }

                .udetail {
                    display: -webkit-flex;
                    display: flex;
                    -webkit-flex: 1;
                    flex: 1;
                    -webkit-flex-direction: column;
                    flex-direction: column;
                    -webkit-justify-content: space-around;
                    justify-content: space-around;
                    overflow: hidden;

                    p {
                        display: block;
                        line-height: 1.3;
                        width: 100%;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }
            }
        }

        .slide-fade-enter-active {
            transition: all .3s ease;
        }

        .slide-fade-leave-active {
            transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
        }

        .slide-fade-enter, .slide-fade-leave-to {
            transform: translateX(10px);
            opacity: 0;
        }
    }
</style>
