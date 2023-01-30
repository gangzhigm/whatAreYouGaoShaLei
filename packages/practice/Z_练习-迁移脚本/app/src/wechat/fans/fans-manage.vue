<template>
    <div class="fans-manage">
        <div class="loading" v-if="syncStatus">{{'follower.syncIng' | t}}</div>
        <div class="content-view">
            <crumbs></crumbs>
            <public-account/>
        </div>
        <div class="tab-links">
            <div class="content-view">
                <router-link class="tab-link" :to="{name: 'wechatFansNow'}">
                    {{'follower.followers' | t}}
                </router-link>
                <router-link class="tab-link" :to="{name: 'wechatFansUsedToBe'}">
                    {{'follower.unFollow' | t}}
                </router-link>
                <template v-if="$route.name === 'wechatFansNow'">
                    <!--粉丝标签管理-->
                    <button type="button" class="pull-right btn btn-md btn-theme" :disabled="$has('wechat_fanslable')"
                            @click="toGetTagList">
                        {{'follower.weChatTags' | t}}
                    </button>
                    <div class="pull-right attribute-btn">
                        <button type="button" class="btn btn-md btn-theme"  @click="getSyncStatus(1)"
                                :disabled="nextDate || $has('wechat_sync_fans_attributes')">
                            {{nextDate ? $t('follower.openTime') + this.nextDate : $t('follower.syncTitle' )}}
                        </button>
                        <i class="icon icon-help" v-title:bottom="$t('follower.threeDays')"></i>
                    </div>
                </template>
            </div>
        </div>
        <!--粉丝标签管理弹窗-->
        <modal :title="$t('follower.weChatTags')" size="lg" class="tags-modal" v-if="tagsModalFlag"
               @close="closeTagModal">
            <div class="head-options">
                <button class="btn btn-md btn-theme" @click="syncFansTag">{{ 'follower.syncTag' | t}}</button>
                <div class="option-right">
                    <div class="search-box md">
                        <input type="text" v-model.trim="searchName" :placeholder="$t('follower.tagName')" @keyup.enter="searchTag">
                        <svg aria-hidden="true" @click="searchTag">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                    <button type="button" class="btn btn-md btn-theme" id="wechat_fans_add_lable"
                            :disabled="$has('wechat_fanslable')" @click="$emit('remark')">
                        {{'follower.newTag' | t}}
                    </button>
                </div>
            </div>
            <div class="simplify-table auto-width tags-list-table">
                <table>
                    <thead>
                    <tr>
                        <td width="800px">{{'follower.tagName' | t}}</td>
                        <td>{{'follower.Action' | t}}</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-if="tagsLoading || tagsList.length === 0">
                        <td class="slim-cell" colspan="7">
                            <inline-loading v-if="tagsLoading"/>
                            <list-empty v-else/>
                        </td>
                    </tr>
                    <tr v-for="(tag,index) in tagsList" :key="index">
                        <td class="tag-name">
                            {{tag.name}}
                        </td>
                        <td>
                            <button type="button" class="tag-action icon icon-pencil"
                                    v-if="tag.tagId > 2"
                                    @click="reTagName(tag)"
                                    v-title:top="$t('tag.reName')"></button>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <!--列表分页-->
                <div class="pager-wrapper">
                    <div class="amount pull-left">{{'journey.totalCount' | t}} <span
                            class="theme-text">{{tagsNumber}}</span>
                        {{'journey.totalUnit' | t}}
                    </div>
                    <pager class="pull-right" :total="totalPage" :now="nowPage" @page="handlePage"/>
                </div>
            </div>
        </modal>
        <!--标签重命名-->
        <confirm :title="$t('follower.TagReName')" v-if="reModalFlag" @cancel="cancelReName" @confirm="sureReName">
            <div class="form-field">
                <label class="label">{{'follower.tagName' | t}}</label>
                <input type="text" v-model.trim="fanTagName" class="input"/>
            </div>
        </confirm>
        <div class="page-content">
            <router-view class="content-view padding margin white-bg" @refreshTagList="refreshTagList"
                         ref="fansManage" @refreshSyncStatus="getSyncStatus(0)"></router-view>
        </div>
        <!--同步粉丝属性-->
        <modal :title="$t('follower.syncTitle')" :iconFlag="true" :iconName="'icon-help'"
               :titleHelp="$t('follower.syncTitleHelp')" @close="syncFlag=false" v-if="syncFlag">
            <div class="form-field">
                <label class="label">{{'follower.syncTimeTitle' | t}}
                    <i class="icon icon-help" v-title:right="$t('follower.supportTime')"></i>
                </label>
                <calendar :start="nowDate" :end="endDate" v-model="sendDate" :hoursDisabled="hoursDisabled"
                          format="yyyy-mm-dd hh:ii" :showTodayBtn="false"></calendar>
                <p class="sync-notice">
                    <span>{{'follower.syncRate' | t}}</span>
                    <br>
                    <span>{{'follower.syncNotice' | t}}{{'follower.syncState' | t}}</span>
                </p>
                <p class="sync-limit">{{'follower.syncDateLimit' | t}}</p>
            </div>
            <template v-slot:buttons>
                <button class="btn btn-md btn-white" @click="cancelSync">{{'common.cancel' | t}}</button>
                <button class="btn btn-md btn-theme" @click="syncAttribute">{{'common.confirm' | t}}</button>
            </template>
        </modal>
    </div>
</template>
<script type="text/babel">
    import { WechatApiV1 } from '@/api';
    import format from 'date-fns/format';
    import addDays from 'date-fns/add_days';
    import isAfter from 'date-fns/is_after';
    import addSeconds from 'date-fns/add_seconds';
    import {getDateInstance} from '../../common/utils/dateUtils';


    export default {
        data() {
            return {
                tagsModalFlag: false, // tags 弹窗显隐
                tagsLoading: true, //tags数据加载
                tagsList: [], //tags列表
                totalPage: 1, //总页数
                nowPage: 1, //当前页
                tagsNumber: 0, //标签总数
                reModalFlag: false,//标签重命名modal
                fanTagName: '',
                searchName: '',
                tag: {},

                syncStatus:false,//是否有同步粉丝属性任务进行中（true:有任务进行中，false:没有任务进行）
                nextDate:null,//下次开始时间(若三天内有过任务则有值)
                syncFlag: false,//同步粉丝属性弹窗显隐
                //同步时间选择时仅可选择当天20:00-22:59时间端，其余时间置灰
                nowDate: '',
                endDate: '',
                sendDate: this.getTimeFormat(new Date(),'20:00'),//默认开始时间 - 当日的:20:00
                hoursDisabled: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 23],//时间选择器 设置的不可点的hour
            };
        },
        computed: {
            user() {
                return this.$store.state.user;
            },
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            }
        },
        mounted() {
            this.getSyncStatus(0);
            this.nowDate = this.getTimeFormat(new Date(),'19:59');
            this.endDate = this.getTimeFormat(new Date(),'22:59');
            //华为埋码-公众号运营-粉丝管理
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P12031993B44BC7');
            }
        },
        methods: {
            //获取当前时间比较可选时间20:00-22:55
            compareTime() {
                let time = '';
                let stamp = new Date().getTime();//当前时间戳
                // 设置可选 开始时间
                let start = new Date(this.getTimeFormat(new Date(),'20:00').replace(/-/g, '/')
                    .replace(/-/g, '/')).getTime();
                // 设置可选 结束时间
                let end = new Date(this.getTimeFormat(new Date(),'22:55').replace(/-/g, '/')
                    .replace(/-/g, '/')).getTime();
                //当日时间在20:00之前
                if (stamp < start) {
                    time = start;
                }
                //时间在20:00-22:55之间
                if ((start <= stamp) && (stamp < end)) {
                    let HH = new Date().getHours();
                    let mm = new Date().getMinutes();//获取当前时间分钟数
                    mm = parseInt((mm / 5) + 1) * 5;
                    let min = mm < 10 ? '0' + mm : mm;
                    let hourMin = HH + ':' + min;
                    time = this.getTimeFormat(new Date(), hourMin);
                    //当前时间的前一分钟 避免整分时，分钟面板整分不可选
                    this.nowDate = format(new Date(), 'YYYY-MM-DD HH:mm');
                }
                //时间在当日22:55之后,获取次日20:00时间
                if (stamp >= end) {
                    time = this.getTimeFormat(addDays(new Date(), 1),'20:00');
                    this.nowDate = this.getTimeFormat(addDays(new Date(), 1),'19:59');
                    this.endDate = this.getTimeFormat(addDays(new Date(), 1),'22:59');
                }
                this.sendDate = format(time, 'YYYY-MM-DD HH:mm');//转换时间按格式
            },
            //获取粉丝标签列表
            getFansTags() {
                WechatApiV1
                    .getFansTags(this.nowPage, this.searchName)
                    .then((res) => {
                        this.tagsList = res.body.data.tagList;
                        this.tagsNumber = res.body.data.totalRow;
                        this.totalPage = res.body.data.totalPage;
                        this.tagsLoading = false;
                    })
                    .catch((err) => {
                        console.error(err);
                        this.tagsLoading = false;
                    });
            },
            toGetTagList() {
                this.tagsModalFlag = true;
                this.getFansTags();
            },
            //搜索标签
            searchTag() {
                this.nowPage = 1;
                this.getFansTags();
            },
            // 分页操作
            handlePage(e) {
                this.nowPage = e;
                this.getFansTags();
            },
            //标签重命名
            reTagName(tag) {
                this.fanTagName = tag.name;
                this.tag = tag;
                this.reModalFlag = true;
            },
            //取消重命名
            cancelReName() {
                this.reModalFlag = false;
            },
            //确定重命名
            sureReName() {
                const RegCn = /[\u4e00-\u9fa5]/g;
                let value = this.fanTagName;
                value = value.replace(RegCn, 'aa');
                let confirmLength = value.length;
                if (!this.fanTagName) {
                    this.$toast(this.$t('follower.labelNameEmpty'));
                    return;
                }
                if (confirmLength > 12) {
                    this.$toast(this.$t('follower.cannotOver6'));
                    return;
                }
                //检验通过后确定编辑
                WechatApiV1
                    .editFansTag(this.tag.tagId, this.fanTagName)
                    .then((res) => {
                        if (res.body.code === 200) {
                            this.$toast(this.$t('form.SuccessOperate'), 'success');
                            this.nowPage = 1;
                            this.searchName = '';
                            this.getFansTags();
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                    });
                this.reModalFlag = false;
            },
            //关闭标签列表弹窗
            closeTagModal() {
                this.tagsModalFlag = false;
                this.searchName = '';
                this.nowPage = 1;
                this.$refs.fansManage.getFansList();
                this.$refs.fansManage.getTagList();
            },
            //新建标签后刷新数据列表
            refreshTagList() {
                this.nowPage = 1;
                this.searchName = '';
                this.getFansTags();
            },
            // 同步粉丝标签
            syncFansTag() {
                WechatApiV1
                    .getSynStatus()
                    .then(({body: {data}}) => {
                        // 0 未同步 1 同步中
                        if (data.status === 1) return this.$toast(this.$t('follower.syncAwait'), 'warn');
                        this.$confirm(this.$t('follower.syncConfirm'), this.$t('follower.syncFanTips'), this.$t('follower.confirmBtnTxt'))
                            .then(res => {
                                if (res) {
                                    this.requestSyncFansTag();
                                }
                            });
                    });
            },
            // 发送同步粉丝标签请求
            requestSyncFansTag() {
                WechatApiV1
                    .syncFansTag()
                    .then(() => {
                        this.$toast(this.$t('follower.syncSucceed'), 'success');
                        this.nowPage = 1;
                        this.getFansTags();
                    });
            },
            /**
            * 准备同步粉丝属性,先查询是否有同步粉丝属性任务正在进行
            * @param type 0:首次载入 1：点击事件
            */
            getSyncStatus(type) {
                this.compareTime();
                WechatApiV1
                    .getSyncFansStatus()
                    .then(({body:{data}}) => {
                        this.syncStatus = data.status;
                        this.nextDate = data.nextDate;
                        if (type === 1) {
                            if (!this.nextDate) {
                                this.syncFlag = true;
                            } else {
                                this.$toast(this.$t('follower.threeDaysLimit'),'warn');
                            }
                        }
                    });
            },
            /**
             * 确定粉丝同步属性
             * @param
             */
            syncAttribute() {
                let target = getDateInstance(this.sendDate);
                // 所选时间至少要比当前时间晚 5 秒
                if (isAfter(addSeconds(new Date(), 5), target)) {
                    return this.$toast(this.$t('follower.selectSyncTime'), 'warn');
                }
                this.syncFlag = false;
                WechatApiV1
                    .syncFansAttribute(this.sendDate)
                    .then((res) => {
                        this.nextDate = res.body.data.nextDate;
                        this.compareTime();
                        this.$toast(this.$t('follower.successfullyViewLogs'),'success');
                    });
            },
            /**
             * 取消粉丝同步
             * @param
             */
            cancelSync() {
                this.syncFlag = false;
                this.compareTime();
            },
            /**
             * 获取时间点
             * @param time 时分 格式：20:00
             */
            getTimeFormat(newDate,time) {
                let Y = newDate.getFullYear();
                let M = (newDate.getMonth() + 1);
                M = M < 10 ? '0' + M : M;  //判断月是否大于10
                let D = newDate.getDate();
                D = D < 10 ? '0' + D : D;//判断日是否大于10
                return Y + '-' + M + '-' + D + ' ' + time;
            }
        }
    };
</script>
<style type="text/scss" lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .fans-manage {
        .attribute-btn {
            margin-right: 20px;
        }

        .tags-modal {
            .head-options {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;

                .search-box {
                    margin-right: 10px;
                }
            }

            .pager-wrapper {
                @include clearfix();
            }

            .amount {
                line-height: 60px;
            }

            .tags-list-table {
                tbody {
                    .tag-name {
                        max-width: 600px;
                        overflow: visible;
                        white-space: normal;
                    }
                }

                .tag-action {
                    border: none;
                    font-size: 16px;
                    background-color: transparent;
                    color: $green;
                    cursor: pointer;

                    &:disabled {
                        color: $disabled;
                        cursor: not-allowed;
                    }
                }
            }
        }

        .sync-notice {
            margin: 20px 50px 0 50px;
            line-height: 24px;
            word-break: break-word;
        }

        .sync-limit {
            color: $disabled;
            margin: 0 50px 0 50px;
            line-height: 24px;
            word-break: break-word;
        }

        .modal {
            position: relative;

            .title-help {
                position: absolute;
                top: 0;
            }
        }
        .calendar{
            input{
                width: 390px;
            }
        }
    }


</style>
