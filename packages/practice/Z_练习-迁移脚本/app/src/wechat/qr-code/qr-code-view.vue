<template>
    <div class="qr-code-view">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <button type="button" class='btn btn-theme btn-md pull-right' @click='back'>{{'common.back' | t}}
                </button>
                <h1>{{subscriptionName}}</h1>
            </div>
        </div>
        <div class="page-content">
            <div class='content-view white-bg margin padding'>
                <table class="qr-code-view-table">
                    <tbody>
                    <tr>
                        <td class='border-cell' width="16%">{{'QRCode.code' | t}}</td>
                        <td class='border-cell' width="11%">{{'QRCode.name' | t}}</td>
                        <td>{{subscriptionName}}</td>
                    </tr>
                    <tr>
                        <td class='border-cell tac' rowspan="3">
                            <img :src="imgUrl" class='qr-code-img'/>
                            <br>
                            <button class='btn btn-theme btn-md' id="wechat_qrcode_download_qrcode" :disabled="$has('wechat_qrcode_download_qrcode')"  @click='downloadModalOpen = true'>
                                {{'QRCode.downLoadImage' | t}}
                            </button>
                        </td>
                        <td class='border-cell'>
                            {{'QRCode.labels' | t}}
                        </td>
                        <td class='slim'>
                            <table>
                                <thead>
                                <tr>
                                    <td :title="$t('QRCode.followerTag')">{{'QRCode.followerTag' | t}}</td>
                                    <td :title="$t('QRCode.dmartechLabel')">{{'QRCode.dmartechLabel' | t}}</td>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td class="border-cell">
                                        <template v-if='fansIdList.length===0'>{{'QRCode.noFollowerTag' | t}}</template>
                                        <template v-else>
                                            <div class='label-line' v-if='fansItemOne.length>0'>
                                                <span v-for="fans in fansItemOne" class='label-name'
                                                      :title='fans.name'>{{fans.name}}</span>
                                            </div>
                                            <div class='label-line' v-if='fansItemTwo.length>0'>
                                                <span v-for="fans in fansItemTwo" class='label-name'
                                                      :title='fans.name'>{{fans.name}}</span>
                                                <div class="hidden-menu-trigger" v-if='showDown'>
                                                    <span class="title-text">{{'QRCode.allTag' | t}}</span>
                                                    <svg class="nav-link-group-arrow" aria-hidden="true">
                                                        <use xlink:href="#icon-arrow-down"></use>
                                                    </svg>
                                                    <ul class="hidden-menu">
                                                        <li v-for='fans in fansItem'>{{fans.name}}</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </template>
                                    </td>
                                    <td v-if='contactIdList.length===0'>{{'QRCode.noMemberTag' | t}}</td>
                                    <td v-else>
                                        <div class='label-line' v-if='checkedVipItemOne.length>0'>
                                            <span :title="contact.name" v-for="contact in checkedVipItemOne" class='label-name'>{{contact.name}}</span>
                                        </div>
                                        <div class='label-line' v-if='checkedVipItemTwo.length>0'>
                                            <span :title="contact.name" v-for="contact in checkedVipItemTwo" class='label-name'>{{contact.name}}</span>
                                            <div class="hidden-menu-trigger" v-if='showDownVip'>
                                                <span class="title-text">{{'QRCode.allTag' | t}}</span>
                                                <svg class="nav-link-group-arrow" aria-hidden="true">
                                                    <use xlink:href="#icon-arrow-down"></use>
                                                </svg>
                                                <ul class="hidden-menu">
                                                    <li v-for='contact in checkedVipItem'>{{contact.name}}
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td class="border-cell">
                            {{'QRCode.codeStatistics' | t}}
                        </td>
                        <td class="slim">
                            <table>
                                <thead>
                                    <tr>
                                        <td style="border-right:1px solid #e0e5ea;" :title="$t('QRCode.allFans')" colspan="2">{{'QRCode.allFans' | t}}</td>
                                        <td style="border-right:1px solid #e0e5ea;" :title="$t('QRCode.newFans')" colspan="3">{{'QRCode.newFans' | t}}
                                            <i class="icon icon-yiwen1"
                                           v-title:bottom="$t('QRCode.newFansDesc')"></i>
                                        </td>
                                        <td :title="$t('QRCode.oldFans')" colspan="3">{{'QRCode.oldFans' | t}}
                                            <i class="icon icon-yiwen1"
                                           v-title:bottom="$t('QRCode.oldFansDesc')"></i>
                                        </td>
                                    </tr>
                                </thead>
                                <tr class="wecahrtDec">
                                    <td :title="$t('QRCode.totalScans')">{{'QRCode.totalScans' | t}}
                                        <i class="icon icon-yiwen1"
                                           v-title:bottom="$t('QRCode.totalScansDesc')"></i></td>
                                    <td :title="$t('QRCode.totalScan')" class="titleWrap">{{'QRCode.totalScan' | t}}
                                        <i class="icon icon-yiwen1"
                                           v-title:bottom="$t('QRCode.totalScanDesc')"></i></td>
                                    <td :title="$t('QRCode.newConcerns')">{{'QRCode.newConcerns' | t}}
                                        <i class="icon icon-yiwen1"
                                           v-title:bottom="$t('QRCode.NewfansnewconcernsDesc')"></i>
                                    </td>
                                    <td :title="$t('QRCode.cancelAttention')">{{'QRCode.cancelAttention' | t}}
                                        <i class="icon icon-yiwen1"
                                           v-title:bottom="$t('QRCode.NewfansunconcernsDesc')"></i>
                                    </td>
                                    <td :title="$t('QRCode.netAttention')">{{'QRCode.netAttention' | t}}
                                        <i class="icon icon-yiwen1"
                                           v-title:bottom="$t('QRCode.NewfansconcernsDesc')"></i>
                                    </td>
                                    <td :title="$t('QRCode.alreadyConcerned')">{{'QRCode.alreadyConcerned' | t}}
                                        <i class="icon icon-yiwen1"
                                           v-title:bottom="$t('QRCode.OldfansnewconcernsDesc')"></i>
                                    </td>
                                    <td :title="$t('QRCode.cancelAttention')">{{'QRCode.cancelAttention' | t}}
                                        <i class="icon icon-yiwen1"
                                           v-title:bottom="$t('QRCode.OldfansunconcernsDesc')"></i>
                                    </td>
                                    <td :title="$t('QRCode.netAttention')">{{'QRCode.netAttention' | t}}
                                        <i class="icon icon-yiwen1"
                                           v-title:bottom="$t('QRCode.OldfansconcernsDesc')"></i>
                                    </td>
                                </tr>
                                <tbody>
                                <tr class="wecahrtNum">
                                    <td v-for="(item, index) in fansData" :key="index" @click="getFansList(subscriptionId, index)" :class="{active:active === index}">{{ item }}</td>
                                </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td class="border-cell tac">
                            <p>{{'QRCode.followers' | t}}</p>
                            <br>
                            <a class='btn btn-theme btn-md' :href='exportUrl' rel="noopener" :class="{'icon-disable':$has('wechat_qrcode_export_qrcode')}">
                                {{'QRCode.exportExcel' | t}}
                            </a>
                        </td>
                        <div class="simplify-table slim">
                            <table>
                                <thead>
                                <tr>
                                    <td style='width:120px;' :title="$t('QRCode.followerName')">{{'QRCode.followerName' | t}}</td>
                                    <!-- jira-9833：移除“性别”、“地区”、“语言”的选项 -->
                                    <!-- <td style="width:35px;" :title="$t('follower.sex')">{{'follower.sex' | t}}</td>
                                    <td style="width:35px;" :title="$t('follower.province')">{{'follower.province' | t}}</td>
                                    <td style="width:35px;" :title="$t('follower.city')">{{'follower.city' | t}}</td> -->
                                    <td :title="$t('QRCode.scanTime')">{{'QRCode.scanTime' | t}}</td>
                                    <td :title="$t('QRCode.followTime')">{{'QRCode.followTime' | t}}</td>
                                    <td :title="$t('QRCode.unfollowTime')">{{'QRCode.unfollowTime' | t}}</td>
                                    <td :title="$t('QRCode.followStatus')">{{'QRCode.followStatus' | t}}</td>
                                    <td :title="$t('QRCode.totalScans')">{{'QRCode.totalScans' | t}}</td>
                                    <td title="Unionid">Unionid</td>
                                    <td title="Openid">Openid</td>
                                </tr>
                                </thead>
                                <tbody>
                                    <template v-if='fansList.length !== 0'>
                                        <tr v-for="fans in fansList" @click="contact(fans)" :key="fans.openid">
                                            <td :title="fans.nickname">{{fans.nickname}}</td>
                                            <!-- <td :title="fans.sex">{{fans.sex}}</td>
                                            <td :title="fans.province">{{fans.province}}</td>
                                            <td :title="fans.city">{{fans.city}}</td> -->
                                            <td :title="fans.scanTime">{{fans.scanTime}}</td>
                                            <td :title="fans.followTime">{{fans.followTime}}</td>
                                            <td :title="fans.unfollowTime">{{fans.unfollowTime}}</td>
                                            <td :title="fans.currentState">{{fans.currentState}}</td>
                                            <td :title="fans.totalScanTimes">{{fans.totalScanTimes}}</td>
                                            <td :title="fans.unionid">{{fans.unionid}}</td>
                                            <td :title="fans.openid">{{fans.openid}}</td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                        <list-empty v-if="fansList.length === 0" :name="$t('follower.follower')"/>
                        <pager :total="totalPage" :now="nowPage" @page="handlePage"/>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <!-- 下载二维码弹窗 -->
        <qr-code-download-modal v-if="downloadModalOpen"
                                :ids="[subscriptionId]"
                                :qrcodename="subscriptionName"
                                @close="downloadModalOpen = false"/>
    </div>
</template>

<script type="text/ecmascript-6">
    import { ContactApiV1, WechatApiV1 } from '@/api';
    import LINKS from '../../LINKS';
    import {logError} from '@/monitor';
    import QrCodeDownloadModal from './qr-code-download-modal.vue';
    import {I18N_STORE_NAME} from '@/locales';
    import { mapState } from 'vuex';


    export default {
        components: {QrCodeDownloadModal},
        data() {
            return {
                subscriptionId: '', // 二维码id
                subscriptionName: '', // 二维码name
                imgUrl: '', // 图片 url
                // 粉丝标签列表
                fansLabelList: [],
                // 会员标签id列表
                contactIdList: [],
                // 粉丝列表（表单）
                fansList: [],
                // 分页
                totalPage: 1,
                nowPage: 1,
                // 下载弹窗是否开启
                downloadModalOpen: false,
                // 所有会员分组及标签列表
                groupList: [],
                // 会员标签列表
                contactLabelList: [],
                // 选中的会员标签
                checkedVipItem: [],
                // 选中的粉丝id列表
                fansIdList: [],
                // 选中的粉丝标签
                fansItem: [],
                fansItemOne: [],
                fansItemTwo: [],
                // 选中的会员标签
                checkedVipItemOne: [],
                checkedVipItemTwo: [],
                showDown: false,
                showDownVip: false,
                sortType:1,
                // 二维码统计列表
                fansData: [],
                active: 0
            };
        },
        computed: {
            ...mapState({
                lang: state => state[I18N_STORE_NAME].lang,
                user: state => state.user
            }),
            crumbs() {
                return [
                    {name: 'wechat', text: 'Dmartech'},
                    {name: 'subscriptionManage', text: this.$t('home.subscriptionManage')},
                    {name: 'qrCodeView', params: {id: this.$route.params.id}, text: this.subscriptionName}
                ];
            },
            exportUrl() {
                let languages = this.lang;
                if (this.lang === 'zh-CN') languages = 'zh';
                return LINKS.WECHAT_API_BASE
                    + '/api/web-api/wechat/v1/quickMarkItems/downloadCustomer?'
                    + 'quickMarkId=' + this.subscriptionId
                    + '&type=' + this.active
                    + '&wechat_id=' + this.user.authorizerInfoId
                    + '&language=' + languages;
            }
        },
        mounted() {
            this.subscriptionId = this.$route.params.id;
            // 获取二维码详情
            this.getSubscriptionDetails(this.subscriptionId);
            // 获取二维码详情粉丝列表
            this.getFansList(this.subscriptionId, this.active);

        },
        methods: {
            // 跳转联系人
            contact(fans) {
                ContactApiV1.getCustomerId(this.user.appId, fans.openid, 1).then( res =>{
                    if (res.body.data.customerId){
                        const custom = this.$router.resolve({name: 'customerDetail', query: { id: res.body.data.customerId }});
                        window.open(custom.href,'_blank');
                    }
                });
            },
            // 获取二维码详情
            getSubscriptionDetails(id) {
                this.$loading();
                WechatApiV1
                    .getSubscriptionDetail(id)
                    .then((res) => {
                        const detail = res.body.data;
                        this.subscriptionName = detail.name;
                        this.imgUrl = detail.imageUrl;
                        // 粉丝标签id数组
                        this.fansIdList = detail.tags;
                        // 会员标签id数组
                        this.contactIdList = detail.contactFilters;
                        // 全部粉丝总扫码次数 totalScanTimes,
                        // 全部粉丝总扫码人数 totalScanFollow
                        // 新粉丝新关注 newFollow,
                        // 新粉丝净关注 newFollowNow
                        // 新粉丝取关 newUnfollow,
                        // 老粉丝已关注 areadyFollow,
                        // 老粉丝净关注 oldFollowNow,
                        // 老粉丝取关 oldUnfollow,
                        //二维码统计列表
                        this.fansData.push(
                            detail.totalScanTimes,
                            detail.totalScanFollow,
                            detail.newFollow,
                            detail.newUnfollow,
                            detail.newFollowNow,
                            detail.areadyFollow,
                            detail.oldUnfollow,
                            detail.oldFollowNow);
                        // 获取所有会员标签
                        ContactApiV1
                            .getGroups({
                                sortType: this.sortType
                            })
                            .then((res) => {
                                this.groupList = res.body.data.rootGroup.childs;
                                // 将选中的会员标签名显示
                                if (this.contactIdList.length > 0) {
                                    this.groupList.filter(item => {
                                        if (item.labels.length > 0) {
                                            this.contactLabelList = this.contactLabelList.concat(item.labels);
                                        }
                                        item.childs.filter(label => {
                                            if (label.labels.length > 0) {
                                                this.contactLabelList = this.contactLabelList.concat(label.labels);
                                            }
                                            label.childs.filter(name => {
                                                if (name.labels.length > 0) {
                                                    this.contactLabelList = this.contactLabelList.concat(name.labels);
                                                }
                                            });
                                        });
                                    });
                                    this.contactLabelList.map(item => {
                                        this.contactIdList.map(contact => {
                                            if (item.id === parseInt(contact)) {
                                                this.checkedVipItem = this.checkedVipItem.concat(item);
                                            }
                                        });
                                    });
                                    if (this.contactIdList.length !== this.checkedVipItem.length) {
                                        logError(`[微信管理-二维码列表]<qr-code-view.vue> getSubscriptionDetails 不能识别的会员标签ID ${this.contactIdList} :305`);
                                    }
                                    if (this.checkedVipItem.length > 5 && this.checkedVipItem.length <= 9) {
                                        this.checkedVipItemOne = this.checkedVipItem.slice(0, 5);
                                        this.checkedVipItemTwo = this.checkedVipItem.slice(5);
                                    } else if (this.checkedVipItem.length <= 5) {
                                        this.checkedVipItemOne = this.checkedVipItem;
                                    } else if (this.checkedVipItem.length > 9) {
                                        this.checkedVipItemOne = this.checkedVipItem.slice(0, 5);
                                        this.checkedVipItemTwo = this.checkedVipItem.slice(5, 9);
                                        this.showDownVip = true;
                                    }
                                }
                                this.$loaded();
                            })
                            .catch(() => {
                                this.$loaded();
                            });
                        // 获取所有粉丝标签
                        WechatApiV1
                            .getTagList({openIds: '', type: 0})
                            .then((res) => {
                                this.fansLabelList = res.body.data.tagList;
                                // 将选中的粉丝标签名显示
                                if (this.fansIdList.length > 0) {
                                    this.fansLabelList.filter(item => {
                                        this.fansIdList.filter(tag => {
                                            //fix-6388 粉丝标签使用微信标签id更改为tagId
                                            if (item.tagId === parseInt(tag)) {
                                                this.fansItem = this.fansItem.concat(item);
                                            }
                                        });
                                    });
                                    if (this.fansItem.length !== this.fansIdList.length) {
                                        logError(`[微信管理-二维码列表]<qr-code-view.vue> getSubscriptionDetails 不能识别的粉丝标签ID ${this.fansIdList} :336`);
                                    }
                                    if (this.fansItem.length > 5 && this.fansItem.length <= 9) {
                                        this.fansItemOne = this.fansItem.slice(0, 5);
                                        this.fansItemTwo = this.fansItem.slice(5);
                                    } else if (this.fansItem.length <= 5) {
                                        this.fansItemOne = this.fansItem;
                                    } else if (this.fansItem.length > 9) {
                                        this.fansItemOne = this.fansItem.slice(0, 5);
                                        this.fansItemTwo = this.fansItem.slice(5, 9);
                                        this.showDown = true;
                                    }
                                }
                                this.$loaded();
                            })
                            .catch(() => {
                                this.$loaded();
                            });
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 获取粉丝列表
            getFansList(id, index) {
                this.$loading();
                this.active = index;
                WechatApiV1
                    .getFansList({quickMarkId: id, pageNumber: this.nowPage, type: index})
                    .then((res) => {
                        this.totalPage = res.body.data.totalPage;
                        this.fansList = res.body.data.quickMarkItemList;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            back() {
                this.$router.go(-1);
            },
            handlePage(e) {
                this.nowPage = e;
                this.getFansList(this.subscriptionId, this.active);
            }
        }
    };
</script>
<style lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';
    @import '../material/material';

    .qr-code-view {

        .qr-code-view-table {
            table-layout: fixed;
            width: 100%;
            border-spacing: 0;
            border-collapse: collapse;
            background-color: white;
            border: 1px solid $border-color;

            table {
                table-layout: fixed;
                width: 100%;
                border-spacing: 0;
                border-collapse: collapse;
            }

            tr + tr {
                border-top: 1px solid $border-color;
            }

            td {
                height: 47px;

                &:not(.slim) {
                    padding: 0 16px;
                }
            }

            thead {
                background-color: $title-bg;
                color: #6e7376;
                font-weight: bold;
            }

            .border-cell {
                border-right: 1px solid $border-color;
            }
        }

        .qr-code-img {
            display: block;
            width: 160px;
            height: auto;
            margin: 0 auto;
        }

        .label-line {
            white-space: nowrap;

            .label-name {
                display: inline-block;
                width: 6em;
                padding: 8px 0;
                margin-right: 1em;
                @include ellipsis;
            }

            .hidden-menu-trigger {
                display: inline-block;
                position: relative;
                padding: 8px 0;
                vertical-align: top;
                cursor: pointer;

                &:hover svg {
                    fill: $color-title;
                }

                svg {
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    fill: $color-content;
                }

                .hidden-menu {
                    z-index: 100;
                    max-height: 200px;
                    overflow: auto;
                    top: $input-field-height;
                    left: 0;
                    @include transform-origin(left top);
                }

                .all-tag {
                    position: relative;
                    top: 2px;
                    right: 2px;
                }
            }
        }

        .wecahrtNum>td, .wecahrtDec>td {
            border-right: 1px solid #e0e5ea;
        }
        .wecahrtDec>td:last-child, .wecahrtNum>td:last-child{
            border-right:none;
        }
        .wecahrtDec{
            border-bottom:1px solid #e0e5ea;
        }
        .active {
            color:#3dceba;
        }
        .wecahrtNum>td:hover{
            color:#3dceba;
        }
        .titleWrap {
            word-break:keep-all;
        }
    }

</style>
