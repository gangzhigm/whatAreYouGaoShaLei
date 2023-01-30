<template>
    <div class="data-source-detail">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1 :title="api.dataSet">{{api.dataSet}}</h1>
                <div class="creator-name">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-user"></use>
                    </svg>
                    {{api.userInfo.name}}
                </div>
                <!--<div class="tag">-->
                <div class="data-source-tag" title="API">API</div>
                <!--总行数就是已接收的行-->
                <div class="data-source-tag">{{api.received || 0}}{{'dataCenter.row' | t}}</div>
                <!--</div>-->
                <div class="data-source-info"><span>SECRET: </span>{{api.secret || $t('common.noData')}}</div>
                <!--<button type="button" class="add-sign btn btn-sm">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    添加标记
                </button>-->
                <div class="data-source-tag tag-delete pull-right" v-if="!api.isDefault" @click="deleteApi">
                    {{'common.del' | t}}
                </div>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view margin">
                <ul class="content-tabs">
                    <li v-for="tab in tabList"
                        @click="changeList(tab)"
                        class="content-tab grey"
                        :class="{active: buttonName === tab.routeName}">
                        {{tab.name}}
                    </li>
                </ul>
                <api-overview v-if="buttonName === 'overview'" :api="api" @totalRow="api.total = $event"/>
                <api-set v-if="buttonName === 'set'" @updateApi="fetchApi"/>
                <template v-if="buttonName === 'upload'">
                    <api-document v-if="language === 'zh-CN'" class="markdown-container"/>
                    <api-en-document v-if="language === 'en'" class="markdown-container"/>
                </template>
            </div>
        </div>
    </div>
</template>
<script>
    import { EtlApiV1 } from '@/api';
    import ApiOverview from './api-overview.vue';
    import ApiSet from './api-set.vue';
    import ApiDocument from './api.md';
    import ApiEnDocument from './apiEn.md';
    import {formatNumber} from './../components/number-format.js';
    import {trackEvent} from '../../../monitor.js';
    import {I18N_STORE_NAME} from '@/locales';

    const api = {
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
        name: 'api-details',
        components: {
            ApiOverview,
            ApiSet,
            ApiDocument,
            ApiEnDocument,
        },
        data() {
            return {
                api,
                tabList: [
                    {name: this.$t('dataCenter.overview'), routeName: 'overview'},
                    {name: this.$t('dataCenter.setting'), routeName: 'set'},
                    {name: this.$t('dataCenter.howUpload'), routeName: 'upload'}
                ],
            };
        },
        computed: {
            crumbs() {
                return [
                    {name: 'home', text: 'Dmartech'},
                    {name: 'dataCenter', text: this.$t('dataCenter.dataCenter')},
                    {
                        name: 'apiDetails',
                        text: this.$t('dataCenter.api'),
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
            if (this.$route.query.id) {
                this.getAPIDetails();
            }
        },
        methods: {
            // 实时获取api 的数据源名称，secret
            fetchApi(api) {
                this.api.dataSet = api.dataSet;
                this.api.secret = api.secret;
                this.api.url = api.url;
            },

            // 获取api详情
            getAPIDetails() {
                this.$loading();
                EtlApiV1.getAPIDetails(this.$route.query.id)
                    .then(({body: {data: {api}}}) => {
                        this.api = api;
                        this.api.received = formatNumber(this.api.received);
                        this.api.imported = formatNumber(this.api.imported);
                        this.api.importing = formatNumber(this.api.importing);
                        this.api.errNo = formatNumber(this.api.errNo);
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
                        this.$set(query, 'type', 'api');
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

            // 删除api
            deleteApi() {
                this.$confirm(this.$t('dataCenter.confirmDel'), this.$t('dataCenter.delAPIMsg'))
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            EtlApiV1.deleteApi(this.api.id)
                                .then(() => {
                                    this.$toast(this.$t('dataCenter.successMsg'), 'success');
                                    trackEvent('数据中心-删除API', {id: this.api.id});
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
