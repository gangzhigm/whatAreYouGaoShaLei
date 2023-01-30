<template>
    <div class="micro-page-data">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'microPage.microDataTitle' | t}}</h1>
            </div>
        </div>
        <div class="page-contents">
            <div class="content-view white-bg padding margin form-container">
                <div class="content-left">
                    <div class="phone-img">
                        <img src="./img/preview.png"/>
                    </div>
                    <div class="view">
                        <iframe class="iframe-preview" :src="htmlLink"></iframe>
                    </div>
                </div>
                <div class="content-right">
                    <h2 class="data-title">{{microName}}</h2>
                    <div class="line">
                        <p class="online-time">{{'microPage.onlineDate' | t}}  {{onlineDate}}{{'microPage.onLineto' | t}}  <span class="theme-text">{{onlineDay}}</span> {{'microPage.days' | t}}</p>
                        <p class="downline-time" v-if="offlineDate">{{'microPage.offlineDate' | t}}  {{offlineDate}}{{'microPage.onLinefor' | t}}  <span class="theme-text">{{offlineDay}}</span> {{'microPage.days' | t}}</p>
                    </div>
                    <div class="people-box">
                        <div class="people">{{'microPage.todayCount' | t}} {{todayVisitCount}}</div>
                        <div class="people">{{'microPage.totlaCount' | t}} {{totalVisitCount}}</div>
                        <div class="people">{{'microPage.newCount' | t}} {{newCount}}</div>
                    </div>
                    <div class="data-btn">
                        <h2>{{'microPage.allData' | t}}</h2>
                    </div>
                    <div class="simplify-table">
                        <table>
                            <thead>
                                <tr>
                                    <td>{{'microPage.createDate' | t}}</td>
                                    <td>{{'microPage.visitCount' | t}}</td>
                                    <td>{{'microPage.visitPeopleCount' | t}}</td>
                                    <td>{{'microPage.visitTotalCount' | t}}</td>
                                    <td>{{'microPage.forwardCount' | t}}</td>
                                    <td>{{'microPage.formCount' | t}}</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="loading" class="no-hover">
                                    <td colspan="6" class="slim-cell">
                                        <inline-loading />
                                    </td>
                                </tr>
                                <template v-else-if="dataList.length > 0">
                                    <tr class="hover-default" v-for="(item, index) in dataList" :key="index">
                                        <td>{{item.createDate}}</td>
                                        <td>{{item.visitCount}}</td>
                                        <td class="theme-text hover-cursor" @click="openContact(item,type = 0)">{{item.visitPeopleCount}}</td>
                                        <td>{{item.visitTotalCount}}</td>
                                        <td class="theme-text hover-cursor" @click="openContact(item,type = 1)">{{item.forwardCount}}</td>
                                        <td class="theme-text hover-cursor" @click="openContact(item,type = 3)">{{item.formCount}}</td>
                                    </tr>
                                </template>
                                <tr v-else class="no-hover">
                                    <td class="slim-cell" colspan="6">
                                        <list-empty />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <modal v-if="contactModal" :title="modalTitle()" @close="contactModal = false" size="lg">
            <div class="simplify-table">
                <div class="detail-btn">
                    <button class="btn btn-md btn-theme pull-right" @click="getModalLists()">
                        {{'microPage.query' | t}}
                    </button>
                    <div class="pull-right search-box">
                        <input type="text" v-model.trim="keyWords"
                            :placeholder="$t('microPage.searchHolder')" @keydown.enter="getModalLists"
                            :maxlength="100">
                        <svg aria-hidden="true" @click="getModalLists">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                </div>
                <table>
                  <thead>
                      <tr>
                          <td>{{'microPage.wxName' | t}}</td>
                          <td>{{'microPage.wxAvatar' | t}}</td>
                          <td>{{'microPage.openId' | t}}</td>
                          <td>{{'microPage.visitTime' | t}}</td>
                          <td>{{'microPage.operation' | t}}</td>
                      </tr>
                  </thead>
                  <tbody>
                       <tr v-if="modalLoading" class="no-hover">
                            <td colspan="5" class="slim-cell">
                                <inline-loading />
                            </td>
                        </tr>
                        <template v-else-if="modalList.length > 0">
                            <tr v-for="(item, index) in modalList" :key="index">
                                <td>{{'microPage.weChat' | t}}</td>
                                <td class="avatar">
                                    <div class="icon icon-contacts-solid chat-avatar-box alter"></div>
                                </td>
                                <td :title="item.openId">{{item.openId}}</td>
                                <td>{{item.time}}</td>
                                <td>
                                  <button class="btn">
                                      <svg aria-hidden="true" class="way" v-title="$t('follower.linkContact')"
                                          @click="contact(item)">
                                          <use xlink:href="#icon-lianxiren"></use>
                                      </svg>
                                  </button>
                                </td>
                            </tr>
                        </template>
                        <tr v-else class="no-hover">
                            <td class="slim-cell" colspan="5">
                                <list-empty v-if="keyWords === ''"/>
                                <list-search-empty v-else/>
                            </td>
                        </tr>
                  </tbody>
                </table>
                <div class="total-page pull-left">{{'channelCode.total' | t}} <span class="theme-text">{{totalRow}}</span> {{'channelCode.records' | t}}</div>
                <pager v-if="modalList.length > 0" :now="nowPage" :total="totalPage" @page="toPage"/>
            </div>
        </modal>
    </div>
</template>
<script type="text/babel">
    import { WechatApiV1, ContactApiV1, MicroPageApi} from '@/api';
    
    export default {
        data() {
            return {
                // 统计数据详情
                microName: '', // 微页面名称
                todayVisitCount: '', //今日访问人数
                totalVisitCount: '', // 累计访问人数
                newCount: '', // 新用户数
                onlineDate: '', // 上线时间
                onlineDay: '', // 上线天数
                offlineDate: '', // 下线时间
                offlineDay: '', // 下线天数
                dataList: [],
                createDate: '',// 创建时间
                loading: false,
                contactModal: false, // 联系人列表弹窗
                modalLoading: false,
                modalList: [], // 联系人列表弹窗数据
                keyWords: '', // 联系人列表弹窗关键字
                // 页码
                nowPage: 1,
                totalPage: 1,
                totalRow: 0,
                appId: '', //小程序id
                type: '', // 操作类型type 0：访问  1：转发 3：表单
                htmlLink: '', //预览图
            };
        },
        computed: {
            crumbs() {
                return [
                    {name: 'wecom', text: 'Dmartech'},
                    {name: 'microPageList', text: this.$t('home.microPage')},
                    {name: 'microPageData',  text: this.$t('microPage.microPageData')}
                ];
            },
        },
        mounted() {
            //TODO
            // 获取微页面详情
            this.getInfo();
            this.getStastInfo();
            this.getStastList();
        },
        methods: {
            // 联系人列表弹窗
            openContact(item){
                this.keyWords = '';
                this.createDate = item.createDate;
                this.contactModal = true;
                this.getModalLists();
            },
            modalTitle() {
                switch (this.type) {
                    case 0 :
                        return this.$t('microPage.visitTitle');
                    case 1 :
                        return this.$t('microPage.forwordTitle');
                    case 3 : 
                        return this.$t('microPage.formTitle');
                }
            },
            // 页码
            toPage(e) {
                this.nowPage = e;
                this.getModalLists();
            },
            // 获取微页面详情(获取预览图)
            getInfo() {
                MicroPageApi
                    .showPage({id: ~~this.$route.query.id})
                    .then(({ body: { message, data } }) => {
                        this.microName = data.pageName;
                        this.htmlLink = data.htmlLink;
                        this.appId = data.appId;
                    });
            },
            // 获取统计数据详情
            getStastInfo() {
                WechatApiV1
                    .microInfo({microId: ~~this.$route.query.id})
                    .then(({ body: { message, data } }) => {
                        this.todayVisitCount = data.todayVisitCount;
                        this.totalVisitCount = data.totalVisitCount;
                        this.newCount = data.newCount;
                        this.onlineDate = data.onlineDate;
                        this.onlineDay = data.onlineDay;
                        this.offlineDate = data.offlineDate;
                        this.offlineDay = data.offlineDay;
                    });
            },
            // 获取统计数据列表
            getStastList() {
                WechatApiV1
                    .dataStatistics({microId: ~~this.$route.query.id})
                    .then(({ body: { message, data } }) => {
                        if (data.list) {
                            this.dataList = data.list;
                        }
                    })
                    .catch(({ body: { message } }) => {
                        this.$toast(message, 'warn');
                    });
            },
            // 微页面数据统计联系人弹窗列表
            getModalLists() {
                WechatApiV1
                    .contactList({
                        id:  ~~this.$route.query.id,
                        type: ~~this.type,
                        pageNum: ~~this.nowPage,
                        pageSize: 10,
                        condition: this.keyWords,
                        createDate: this.createDate,
                    })
                    .then(({ body: { message, data } }) => {
                        this.modalList = data.list;
                        this.totalRow = data.totalRow;
                        this.totalPage = data.totalPage;
                    })
                    .catch(({ body: { message } }) => {
                        this.$toast(message, 'warn');
                    });
            },
            // 跳转联系人
            contact(item) {
                ContactApiV1.getCustomerId(this.appId, item.openId, 2).then(res => {
                    if (res.body.data.customerId) {
                        const custom = this.$router.resolve({
                            name: 'customerDetail',
                            query: {id: res.body.data.customerId}
                        });
                        window.open(custom.href, '_blank');
                    }
                });
            },
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../common/scss/base/variables";
    @import "../common/scss/base/mixin";
    .micro-page-data {
        .page-contents {
            .form-container {
                min-width: 1350px;
                padding: 16px 80px 24px 80px;
                display: flex;
                @include box-sizing();
                height: 75vh;
                    .content-left {
                        width: 30%;
                        margin-right: 20px;
                        .phone-img {
                            width: 270px;
                            height: 570px;
                            margin: 0 auto;
                            position: absolute;
                        }
                        .view {
                            width: 225px;
                            height: 356px;
                            position: relative;
                            top: 125px;
                            left: 20px;
                            overflow: hidden;
                            .iframe-preview {
                                position: absolute;
                                left: -78px;
                                top: -120px;
                                width: 378px;
                                height: 590px;
                                pointer-events:none;
                                transform: scale(0.6);
                            }
                        }
                    }
                    .content-right {
                        width: 60%;
                        .line {
                            display: flex;
                            justify-content: left;
                            margin: 30px 0;
                            .online-time {
                                margin-right: 40px;
                            }
                        }
                        .people-box {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 30px;
                            .people {
                                width: 28%;
                                height: 100px;
                                background: $content-bg;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                            }
                        }
                        .data-btn {
                            margin-bottom: 20px;
                        }
                        .simplify-table {
                            height: 30vh;
                            overflow-y: scroll;
                        }
                        .hover-default {
                            &:hover {
                                background-color: white;
                                cursor: default;
                            }
                        }
                    }
            }
        }
        
        .detail-btn {
            display: block;
            height: 32px;
            margin-bottom: 20px;
            .btn {
                margin-left: 20px;
            }
        }
        .avatar {
            .chat-avatar-box {
                display: inline-block;
                width: 40px;
                height: 40px;
                background-size: contain;
                background-repeat: no-repeat;
                @include border-radius(4px);
                &.alter {
                    font-size: 40px;
                }
            }
        }
        .way {
            display: inline-block;
            width: 24px;
            height: 24px;
            fill: $theme;
            cursor: pointer;
        }
        .hover-cursor {
            cursor: pointer;
        }
    }
</style>
