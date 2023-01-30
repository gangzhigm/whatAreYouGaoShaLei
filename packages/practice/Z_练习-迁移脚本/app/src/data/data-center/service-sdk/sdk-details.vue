<template>
    <div class="data-source-detail">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1 :title="sdk.dataSet">{{sdk.dataSet}}</h1>
                <div class="creator-name">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-user"></use>
                    </svg>
                    {{sdk.userInfo.name}}
                </div>
                <div class="data-source-tag" title="SDK">SDK</div>
                <!--总行数就是已接收的行-->
                <div class="data-source-tag">{{sdk.received || 0}} {{'dataCenter.row' | t}}</div>
                <div class="data-source-info"><span>SECRET: </span>{{sdk.secret || '暂无'}}</div>
                <!--<button type="button" class="add-sign btn btn-sm">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    添加标记
                </button>-->
                <div class="data-source-tag tag-delete pull-right" @click="deleteSdk">{{'common.del' | t}}</div>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view margin">
                <ul class="content-tabs">
                    <li v-for="tab in tabList" @click="changeList(tab)"
                        class="content-tab grey"
                        :class="{active:buttonName === tab.routeName}">
                        {{tab.name}}
                    </li>
                </ul>

                <sdk-overview v-if="buttonName === 'overview'" :sdk="sdk" @totalRow="sdk.total = $event"/>
                <sdk-set v-if="buttonName === 'set'" @updateSdk="fetchSdk"/>
                <sdk-document class="markdown-container" v-if="buttonName === 'upload'" :sdk="sdk"></sdk-document>
            </div>
        </div>
    </div>
</template>
<script>
    import { EtlApiV1 } from '@/api';
    import SdkOverview from './sdk-overview.vue';
    import SdkSet from './sdk-set.vue';
    import SdkDocument from './sdk-doc.vue';
    import {formatNumber} from '../components/number-format.js';
    import {translate as t} from '@/locales';

    const tabList = [
        {name: t('dataCenter.overview'), routeName: 'overview'},
        {name: t('dataCenter.setting'), routeName: 'set'},
        {name: t('dataCenter.howUpload'), routeName: 'upload'}
    ];
    const sdk = {
        dataSet: '',
        userInfo: {
            name: ''
        },
        total: 0,
        secret: '',
        key: '',
        received: 0,
        imported: 0,
        importing: 0,
        errNo: 0,
        rate: 0,
    };
    export default {
        name: 'sdk-details',
        components: {
            SdkOverview,
            SdkSet,
            SdkDocument
        },
        data() {
            return {
                sdk,
                tabList,
            };
        },
        computed: {
            crumbs() {
                return [
                    {name: 'home', text: 'Dmartech'},
                    {name: 'dataCenter', text: this.$t('dataCenter.dataCenter')},
                    {
                        name: 'sdkDetails',
                        text: this.$t('dataCenter.severSDKAccess'),
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
            }
        },
        mounted() {
            if (this.$route.query.id) {
                this.getSDKDetails();
            }
        },
        methods: {
            // 实时获取sdk 的数据源名称，secret
            fetchSdk(sdk) {
                this.sdk.dataSet = sdk.dataSet;
                this.sdk.secret = sdk.secret;
            },

            // 获取sdk详情
            getSDKDetails() {
                this.$loading();
                EtlApiV1.getSDKDetails(this.$route.query.id)
                    .then(({body: {data: {sdk}}}) => {
                        this.sdk = sdk;
                        this.sdk.received = formatNumber(this.sdk.received);
                        this.sdk.imported = formatNumber(this.sdk.imported);
                        this.sdk.importing = formatNumber(this.sdk.importing);
                        this.sdk.errNo = formatNumber(this.sdk.errNo);
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            changeList(tab) {
                let query = {
                    ...this.$route.query,
                    name: tab.routeName,
                    step: this.$route.query.step ? this.$route.query.step : 1,
                };
                switch (tab.routeName) {
                    case 'overview':
                        this.$router.replace({
                            name: this.$route.name,
                            query: query
                        });
                        break;
                    case 'set':
                        this.$set(query, 'type', 'sdk');
                        this.$router.replace({
                            name: this.$route.name,
                            query: query
                        });
                        break;
                    case 'upload':
                        this.$router.replace({
                            name: this.$route.name,
                            query: query
                        });
                        break;
                    default:
                        this.$router.push({
                            name: this.$route.name,
                            query: query
                        });
                }
            },

            // 删除sdk
            deleteSdk() {
                this.$confirm(this.$t('common.delete'), this.$t('dataCenter.deleteSDKConfirm'))
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            EtlApiV1.deleteSdk(this.sdk.id)
                                .then(() => {
                                    this.$toast(this.$t('dataCenter.deleteSDKSuccess'), 'success');
                                    this.$router.replace({name: 'dataCenter'});
                                    this.$loaded();
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        }
                    });
            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../scss/data-source-detail";
</style>
