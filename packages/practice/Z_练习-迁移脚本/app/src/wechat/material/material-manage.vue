<template>
    <div class="material-manage">
        <div class="content-view">
            <crumbs></crumbs>
            <public-account :disabled="readonlyAccount"/>
        </div>
        <div class="tab-links">
            <div class="content-view">
                <router-link class="tab-link" :to="{name: 'imageTextList'}">{{'wechatContent.draftBox' | t}}</router-link>
                <router-link class="tab-link" :to="{name: 'imageList'}">{{'wechatContent.pics' | t}}</router-link>
                <router-link class="tab-link" :to="{name: 'audioList'}">{{'wechatContent.audio' | t}}</router-link>
                <router-link class="tab-link" :to="{name: 'videoList'}">{{'wechatContent.video' | t}}</router-link>
                <router-link class="tab-link" :to="{name: 'publish'}">{{'wechatContent.published' | t}}</router-link>
                <template v-if="$route.name !== 'imageTextCreate' && $route.name !== 'imageTextEdit'">
                    <button class="pull-right sync-btn btn btn-md btn-theme btn-round icon"
                            :class="{'icon-loading': isSync}"
                            id="wechat_material_syn_news"
                            :disabled="$has('wechat_material_syn_news') || isSync" @click="syncMaterial">
                        {{(isSync ? 'wechatContent.syncing' : 'wechatContent.syncWeChatMaterial') | t}}
                    </button>
                    <selector class="pull-right" :options="ranges" v-model="startDate" :disabled="isSync"
                              :placeholder="$t('wechatContent.syncRange')"></selector>
                </template>
            </div>
        </div>
        <router-view class="page-content"></router-view>
    </div>
</template>
<script type="text/babel">
    import { WechatApiV1 } from '@/api';
    import format from 'date-fns/format';
    import {startOfWeek, subDays} from 'date-fns';
    import {getDateInstance} from '../../common/utils/dateUtils';
    import {trackEvent} from '../../monitor';

    export default {
        data() {
            const today = new Date();
            const threeDaysAgo = subDays(today, 3);
            const thisWeekMonday = startOfWeek(today, {weekStartsOn: 1});
            const thirtyDaysAgo = subDays(today, 30);
            const onlineDate = this.$store.state.user.onlineTime
                ? getDateInstance(this.$store.state.user.onlineTime)
                : new Date(0);
            return {
                // 同步
                isSync: false,
                creatingImgText: false, // 防止重复创建
                dropdown: false,
                ranges: [
                    {
                        name: this.$t('time.today'),
                        date: format(today, 'YYYY-MM-DD') + ' 00:00:00',
                        id: 'today'
                    },
                    {
                        name: this.$t('time.last3Days'),
                        date: format(threeDaysAgo, 'YYYY-MM-DD') + ' 00:00:00',
                        id: '3Day'
                    },
                    {
                        name: this.$t('time.thisWeek'),
                        date: format(thisWeekMonday, 'YYYY-MM-DD') + ' 00:00:00',
                        id: 'week'
                    },
                    {
                        name: this.$t('time.last30Days'),
                        date: format(thirtyDaysAgo, 'YYYY-MM-DD') + ' 00:00:00',
                        id: '30Day'
                    },
                    {
                        name: this.$t('time.sinceOnline'),
                        date: format(onlineDate, 'YYYY-MM-DD') + ' 00:00:00',
                        id: 'sinceOnline'
                    },
                ],
                startDate: '',
                postValue: '',
            };
        },
        created() {
            this.getUpdateStatus();
        },
        computed: {
            //禁用公众号筛选
            readonlyAccount() {
                let imageTextList = this.$route.path === '/wechat/material/image-text';
                let imageList = this.$route.path === '/wechat/material/img';
                let audioList = this.$route.path === '/wechat/material/audio';
                let videoList = this.$route.path === '/wechat/material/video';
                // can't get the original demands, so add another new case on these weird codes, don't ask why, just add it;
                let publishList = this.$route.path === '/wechat/material/publish';
                return !imageTextList && !imageList && !audioList && !videoList && !publishList;
            },
            user() {
                return this.$store.state.user;
            },
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            }
        },
        mounted() {
            //华为埋码-营销旅程- 公众号素材管理
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P120319959BCAB6');
            }
        },
        methods: {
            // 同步微信素材
            syncMaterial() {
                if (this.startDate === '') {
                    this.$toast(this.$t('wechatContent.pickRangeFirst'), 'warn');
                    return;
                }
                this
                    .$confirm(
                        this.$t('wechatContent.confirmSync'),
                        this.$t('wechatContent.syncTip')
                    )
                    .then(sure => {
                        const start = this.ranges.find(rang => rang.id === this.startDate).date;
                        if (sure) {
                            this.isSync = true;
                            this.$loading();
                            WechatApiV1
                                .syncMaterials(start)
                                .then(() => {
                                    this.$t('wechatContent.syncStart');
                                    setTimeout(() => {
                                        this.getUpdateStatus(true);
                                    }, 10000);
                                    trackEvent('微信管理-同步素材');
                                })
                                .catch(() => {
                                    this.isSync = false;
                                    this.$loaded();
                                });
                        }
                    });
            },
            // 获取素材同步状态
            getUpdateStatus(reset) {
                WechatApiV1
                    .checkSynStatus()
                    .then(res => {
                        if (res.body.data.synStatus === 1) {
                            this.isSync = true;
                            setTimeout(() => {
                                this.getUpdateStatus(reset);
                            }, 10000);
                        } else if (res.body.data.synStatus === 0) {
                            if (reset) {
                                this.syncComplete();
                            }
                        }
                    });
            },
            syncComplete() {
                this.$toast(this.$t('wechatContent.syncSuccessTip'));
                this.isSync = false;
                this.$loaded();
                setTimeout(() => {
                    location.reload();
                }, 3000);
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    .material-manage {
        .sync-btn {
            margin-left: 16px;
        }
    }
</style>
