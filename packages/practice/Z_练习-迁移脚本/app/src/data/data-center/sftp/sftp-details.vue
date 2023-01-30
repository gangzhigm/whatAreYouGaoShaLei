<template>
    <div class="data-source-detail">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1 :title="sftp.dataSet">{{sftp.dataSet}}</h1>
                <div class="creator-name">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-user"></use>
                    </svg>
                    {{sftp.userInfo.name}}
                </div>
                <div class="data-source-tag" title="SFTP">SFTP</div>
                <div class="data-source-tag">{{sftp.total}}{{'dataCenter.row' | t}}</div>
                <!--<button type="button" class="add-sign btn btn-sm">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    添加标记
                </button>-->
                <div class="data-source-tag tag-delete pull-right" v-if="!sftp.isDefault" @click="deleteSftp">{{'common.del' | t}}</div>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view margin">
                <ul class="content-tabs">
                    <li @click="changeList(tab)"
                        class="content-tab grey"
                        :class="{active:buttonName === tab.routeName}"
                        v-for="tab in tabList">{{tab.name}}
                    </li>
                </ul>
                <sftp-overview :sftp="sftp" v-if="buttonName === 'overview'"/>
                <sftp-set v-if="buttonName === 'set'" @updateSftp="updateSftp"/>
                <sftp-document v-if="buttonName === 'upload' && language === 'zh-CN'" class="markdown-container"/>
                <sftp-en-document v-if="buttonName === 'upload' && language === 'en'" class="markdown-container"/>
            </div>
        </div>
    </div>
</template>
<script>
    import { EtlApiV1 } from '@/api';
    import SftpOverview from './sftp-overview.vue';
    import SftpSet from './sftp-set.vue';
    import sftpDocument from './sftp.md';
    import sftpEnDocument from './sftpEn.md';
    import {formatNumber} from './../components/number-format.js';
    import {I18N_STORE_NAME, translate as t} from '@/locales';

    const sftp = {
        userInfo: {
            avatar: null,
            email: '',
            id: 0,
            name: '',
        },
        idDefault: false,
        dataSet: '',
        day: null,
        duration: 0,
        execType: 0,
        hour: 0,
        id: 0,
        lastSuccess: 0,
        minute: 0,
        rate: '',
        sftpUsername: '',
        total: 0,
        uid: 0,
        week: null,
    };
    const tabList = [
        {name: t('dataCenter.overview'), routeName: 'overview'},
        {name: t('dataCenter.setting'), routeName: 'set'},
        {name: t('dataCenter.howUpload'), routeName: 'upload'}
    ];

    export default {
        name: 'sftp-details',
        components: {
            SftpOverview,
            SftpSet,
            sftpDocument,
            sftpEnDocument
        },
        data() {
            return {
                sftp,
                tabList,
            };
        },

        computed: {
            crumbs() {
                return [
                    {name: 'home', text: 'Dmartech'},
                    {name: 'dataCenter', text: this.$t('dataCenter.dataCenter')},
                    {
                        name: 'sftpDetails',
                        text: this.$t('dataCenter.sftpAccess'),
                        query: {
                            id: this.$route.query.id,
                            name: 'overview',
                            previewName: 'user',
                        }
                    }
                ];
            },
            buttonName() {
                if (!this.$route.query.name) {
                    this.$router.replace({
                        name: this.$route.name,
                        query: {...this.$route.query, name: this.tabList[0].routeName}
                    });
                }
                return this.$route.query.name;
            },
            language() {
                return this.$store.state[I18N_STORE_NAME].lang;
            }
        },

        mounted() {
            if (!this.$route.query.name) {
                this.$router.push({
                    name: this.$route.name,
                    query: {
                        id: this.$route.query.id,
                        name: 'overview',
                        previewName: 'user',
                    },
                });
            }

            this.fetchAccountDetails();
        },

        methods: {

            // 实时获取更新的sftp
            updateSftp(sftp) {
                this.sftp = sftp;
            },

            /**
             * 获取账户详情
             * @returns {*}
             */
            fetchAccountDetails() {
                this.$loading();
                EtlApiV1
                    .getSftpDetails(this.$route.query.id)
                    .then(res => {
                        this.sftp = res.body.data.sftp;
                        this.sftp.total = formatNumber(this.sftp.total);
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            // 切换数据
            changeList(tab) {
                switch (tab.routeName) {
                    // 概览
                    case 'overview':
                        this.$router.push({
                            name: this.$route.name,
                            query: {
                                id: this.$route.query.id,
                                name: tab.routeName,
                                previewName: 'user',
                            }
                        });
                        break;
                    // 设置页面默认进入sftp的第一步（step=1）
                    case 'set':
                        this.$router.push({
                            name: this.$route.name,
                            query: {
                                id: this.$route.query.id,
                                name: tab.routeName,
                                step: 1,
                                type: 'sftp',
                            }
                        });
                        break;
                    // 上传
                    case 'upload':
                        this.$router.push({
                            name: this.$route.name,
                            query: {
                                id: this.$route.query.id,
                                name: tab.routeName,
                            }
                        });
                        break;
                }
            },

            // 删除sftp
            deleteSftp() {
                this.$confirm(this.$t('common.delete'), this.$t('dataCenter.sftpDeleteConfirm'))
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            EtlApiV1.deleteSftp(this.sftp.id)
                                .then(() => {
                                    this.$toast(this.$t('dataCenter.deleteSFTPSuccess'), 'success');
                                    // update router
                                    this.$router.replace({name: 'dataCenter'});
                                    this.$loaded();
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        }
                    });
            },
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../scss/data-source-detail";
</style>
