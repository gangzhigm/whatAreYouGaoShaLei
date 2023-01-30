<template>
    <modal class="temp-test-modal" :title="testTitle" size="lg" @close="cancel()">
        <div class="form-field">
            <label class="label">{{'controller.targetAccount' | t}}</label>
            <input disabled class="input" :value="principalName">
            <!--<selector :options="materialTest.subscriptList" v-model="materialTest.subscriptId" :value="materialTest.subscriptList[0]"></selector>-->
        </div>
        <div class="form-field flex">
            <label class="label">{{'controller.fans' | t}}</label>
            <!--粉丝列表-->
            <div class="fanList">
                <div class="tag-list">
                    <selector unique-key="tagId" v-model="tagId" :options="tagList"
                            :search="tagList.length > 10" @input="FollowerList('clearSelect')"></selector>
                </div>
                <div class="title">
                    <div class="icon icon-menu btnsa hidden-menu-trigger">
                        <ul class="hidden-menu">
                            <li @click="nowData">{{'follower.allSelectedNowPage' | t}}</li>
                            <li @click="clearNowPage">{{'controller.clearNowPage' | t}}</li>
                        </ul>
                    </div>
                    <div class="pull-right search-box">
                        <input type="text" class="seach-input" :placeholder="$t('controller.search')" v-model.trim="searchName" maxlength="50"
                            @keydown.enter="searchContent()">
                        <svg aria-hidden="true" v-if="searchName !== ''" @click="seeAll">
                            <use xlink:href="#icon-round-close"></use>
                        </svg>
                        <svg aria-hidden="true" @click="searchContent">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                    {{'controller.fansMsgA' | t}}
                    <strong class="theme-text">{{materialTest.selectedIds.length}}</strong>
                    {{'controller.fansMsgB' | t}}
                    <!-- <span class="title-name">{{'controller.fans' | t}}</span> -->
                    <button type="button" class="btn btn-sm btn-white" @click="clears">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-refresh"></use>
                        </svg>
                        {{'common.cancel' | t}}
                    </button>
                </div>
                <inline-loading v-if="!followerListLoaded"></inline-loading>
                <template v-else-if="materialTest.fansList.length !== 0">
                    <ul class="getList">
                        <li v-for="fan in materialTest.fansList" :key="fan.id" class="list-content" :title="fan.nickName"
                             @click="toggle(fan.openid)">
                            <checkbox :value="materialTest.selectedIds.includes(fan.openid)"></checkbox>
                            <div class="avatar">
                                <img :src="fan.headimgurl || defaultImage" alt="avatar">
                            </div>
                            <span class="list-info">{{fan.nickname}}</span>
                            <span class="list-info" :title="fan.openid">{{fan.openid}}</span>
                        </li>
                        <!--<div v-if="materialTest.fansList == [] && materialTest.searchEmpty == false"-->
                        <!--class="emptySubscription">没有任何互动粉丝，使用微信向公众号发送任意内容即可成为互动粉丝。-->
                        <!--</div>-->
                        <!--<div v-if="materialTest.searchEmpty" class="searchEmpty">没有找到粉丝，请确保该粉丝48小时内与公众号有过互动或未取消关注，<span-->
                        <!--class="see-all" @click="seeAll()">查看全部</span></div>-->
                    </ul>
                    <pager :total="materialTest.totalPage" :now="pageNumber" @page="switchPage"></pager>
                </template>
                <list-search-empty v-else-if="searchName"/>
                <list-empty v-else/>
            </div>
            
        </div>
        <template v-slot:buttons>
            <button class="btn btn-md btn-white" @click="cancel">{{'common.cancel' | t}}</button>
            <button class="btn btn-md btn-theme" @click="testShow" :disabled="!testLoading">{{testLoading ?
                $t('controller.nowTest') : $t('controller.sending')}}
            </button>
        </template>
    </modal>
</template>

<script type="text/ecmascript-6">
    import { WechatApiV1 } from '@/api';
    import { setTestConfig } from '@/journey/draggable-form/utils/configHandler';
    import cloneDeep from 'lodash/cloneDeep';
    import defaultImage from './images/headDefaultImage.png';

    export default {
        props: {
            controller: Object,
            materialId: [String, Number],
            accountId: [String, Number],
        },
        data() {
            return {
                testTitle: '',
                testLoading: true,
                principalName: '',
                searchName: '',
                materialTest: {
                    fansList: [],
                    totalPage: 1,
                    selectedIds: []
                },
                tagId: 0,  // 选中的标签id，-1是占位选项"所有用户"的tagId
                tagList: [], //标签列表
                followerListLoaded: false,
                defaultImage: defaultImage,
            };
        },
        created() {
            this.testMaterial();
            switch (this.controller.pushInfo.wechatType) {
                case 'template':
                    this.testTitle = this.$t('controller.tempMsg');
                    break;
                case 'service':
                    this.testTitle = this.$t('controller.serviceMsg');
                    break;
                case 'picText':
                    this.testTitle = this.$t('controller.tempImgMsg');
                    break;
                case 'pics':
                case 'mdPics':
                    this.testTitle = this.$t('controller.wechatPicTest');
                    break;
                case 'audio':
                case 'mdAudio':
                    this.testTitle = this.$t('controller.wechatAudioTest');
                    break;
                case 'video':
                case 'mdVideo':
                    this.testTitle = this.$t('controller.wechatVideoTest');
                    break;
                case 'sheet':
                case 'mdSheet':
                    this.testTitle = this.$t('controller.wechatTextTest');
                    break;
                case 'external':
                    this.testTitle = this.$t('controller.wechatOutTest');
                    break;
                case 'form':
                    this.testTitle = this.$t('controller.wechatFormTest');
                    break;
                case 'miniProgramCard':
                    this.testTitle = this.$t('controller.wechatMiniTest');
                    break;
                case 'wechatTest' :
                    this.testTitle = this.$t('template.tempTest');
                    break;
            }

            //获取标签列表
            WechatApiV1
                .getTagList('')
                .then(res => {
                    this.tagList = [
                        {name: this.$t('massSend.allUsers'), tagId: 0, customerCount: null},
                        ...res.body.data.tagList
                    ];
                    this.tagId = this.tagList[0].tagId;
                });
        },
        methods: {
            // 选择当前页全部数据
            nowData() {
                let aset = cloneDeep(this.materialTest.selectedIds);
                this.materialTest.fansList.forEach(e => {
                    aset.push(e.openid);
                });
                this.materialTest.selectedIds = [...new Set(aset)];
            },
            // 删除当前页已选项
            clearNowPage() {
                let clearArr = [];
                let pageArr = this.materialTest.fansList.map(item => item.openid);
                this.materialTest.selectedIds.map(selected => {
                    if (!pageArr.includes(selected)) {
                        clearArr.push(selected);
                    }
                });
                this.materialTest.selectedIds = clearArr;
            },
            toggle(openid) {
                let index = this.materialTest.selectedIds.indexOf(openid);
                if (index !== -1) {
                    this.materialTest.selectedIds.splice(index, 1);
                } else {
                    this.materialTest.selectedIds.push(openid);
                }
            },
            cancel() {
                this.$emit('close');
            },
            confirm() {
                this.$emit('close');
            },
            testShow() {
                if (this.materialTest.selectedIds.length === 0) {
                    this.$toast(this.$t('template.choiceFans'), 'warn');
                    return;
                }
                if (this.materialTest.selectedIds.length > 1000) {
                    this.$toast(this.$t('template.mostFans'), 'warn');
                    return;
                }
                this.testLoading = false;
                if (this.controller.pushInfo.wechatType === 'template' || this.controller.pushInfo.wechatType === 'wechatTest') {
                    WechatApiV1
                        .testSendWxTemplate(this.materialId, this.materialTest.selectedIds)
                        .then(() => {
                            this.$toast(this.$t('common.sendSuccess'), 'success');
                            this.testLoading = true;
                            this.cancel();
                        })
                        .catch(err => {
                            this.$toast(err.body.message);
                            this.testLoading = true;
                            this.cancel();
                        });
                } else {
                    const config = setTestConfig(this.controller.pushInfo);
                    let params = {
                        officialId: this.officeId,
                        openIds: this.materialTest.selectedIds
                    };
                    Object.assign(params, config);
                    WechatApiV1
                        .messageSendsTestByWechat(params)
                        .then(() => {
                            this.$toast(this.$t('common.sendSuccess'), 'success');
                            this.testLoading = true;
                            this.cancel();
                        })
                        .catch(err => {
                            this.$toast(err.body.message);
                            this.testLoading = true;
                            this.cancel();
                        });
                }
            },
            testMaterial() {
                this.testModal = true;
                this.materialTest.fansList = [];
                this.materialTest.totalPage = 1;
                this.materialTest.selectedIds = [];
                this.searchName = '';
                this.pageNumber = 1;
                WechatApiV1
                    .getWechatAccounts()
                    .then(res => {
                        if (res.body.data.authorizerInfoList.length) {
                            if (this.controller.pushInfo.wechatType === 'wechatTest') {
                                this.officeId = this.accountId;
                                let account = res.body.data.authorizerInfoList
                                    .filter(auth => auth.authorizerInfoId === this.accountId)[0];
                                if (account) {
                                    this.principalName = account.principalName;
                                } else {
                                    this.$toast(this.$t('controller.noAccount'), 'warn');
                                    return false;
                                }
                            } else {
                                this.officeId = this.controller.pushInfo.authorizerInfoId;
                                let account = res.body.data.authorizerInfoList
                                    .filter(auth => auth.authorizerInfoId === this.controller.pushInfo.authorizerInfoId)[0];
                                if (account) {
                                    this.principalName = account.principalName;
                                } else {
                                    this.$toast(this.$t('controller.noAccount'), 'warn');
                                    return false;
                                }
                            }
                            this.FollowerList();
                        } else {
                            this.officeId = '';
                            this.principalName = '';
                            this.$toast(this.$t('controller.bindAccount'), 'warn');
                        }
                    });
                
                // this.materialTest.fansList= [];
                // this.materialTest .totalPage= 1;
                // this.materialTest .selectedIds= [];
                //     this.searchName:'',
                //     this. pageNumber:1,
                // }
            },
            // 翻页
            switchPage(e) {
                this.pageNumber = e;
                this.FollowerList();
            },
            searchContent() {
                this.pageNumber = 1;
                this.FollowerList();
            },
            seeAll() {
                this.searchName = '';
                this.searchContent();
            },
            clears() {
                this.materialTest.selectedIds = [];
            },
            FollowerList(mode) {
                this.followerListLoaded = false;
                let type = 1;
                WechatApiV1
                    .getFollowerList(this.officeId, this.pageNumber, this.searchName, type, this.tagId ? this.tagId : '')
                    .then(res => {
                        if (mode === 'clearSelect') this.clears();
                        this.materialTest.fansList = res.body.data.followerList;
                        this.materialTest.fansList.forEach((e) => {
                            e.name = e.nickname;
                        });
                        this.materialTest.totalPage = res.body.data.totalPage;
                        this.followerListLoaded = true;
                    })
                    .catch(() => {
                        this.followerListLoaded = true;
                    });
            }
        },
    };
</script>
<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .temp-test-modal {
        /*粉丝列表*/
        .fanList {
            // @include clearfix();
            flex: 1;

            .tag-list {
                margin-bottom: 1em;
            }

            .title {
                padding: 8px 16px;
                background-color: $title-bg;
                border: 1px solid $border-color;
                color: $color-title;
                font-size: 14px;

                .btnsa {
                    cursor: pointer;
                    display: inline-block;
                    font-size: 16px;
                    position: relative;
                    vertical-align: top;
                }
            }

            .getList {
                max-height: 49px * 5;
                overflow-y: auto;
                overflow-x: hidden;
                border: 1px solid $border-color;
                border-bottom: none;
                border-top: none;

                .list-content {
                    @include clearfix();
                    padding: 8px 16px;
                    cursor: pointer;
                    border-bottom: 1px dotted $border-color;

                    .checkbox {
                        float: left;
                        margin-right: 16px;
                    }

                    .avatar {
                        float: left;
                        overflow: hidden;
                        margin-right: 16px;
                        width: $input-field-height;
                        height: $input-field-height;

                        img {
                            display: block;
                            width: 100%;
                        }
                    }

                    .list-info {
                        display: inline-block;
                        width: 200px;
                        @include ellipsis;
                    }

                    &:hover {
                        background-color: $content-bg;
                    }

                    &.active {
                        background: #fff9da;
                    }
                }

                .emptySubscription, .searchEmpty {
                    height: 48px;
                    line-height: 48px;
                    text-align: center;
                    color: $color-light-content;
                    border-bottom: 1px solid $border-color;

                    .see-all {
                        line-height: 48px;
                        color: #8fdbcf;
                        cursor: pointer;
                    }
                }
            }
        }
    }
</style>
<style scoped lang="scss">
    .temp-test-modal{
        .search-box{
            .seach-input {
                padding-right: 48px;
            }
        }
        
    }
    
</style>