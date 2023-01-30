<template>
    <div class="data-center">
        <div class="content-view">
            <crumbs/>
            <div class="data-center-title">
                <button class="btn btn-md btn-theme add-access-btn" @click="dataAccess">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'dataCenter.dataAccess' | t}}
                </button>

                <div class="data-center-summary-text left">
                    <p class="title-item">{{count}}</p>
                    <p class="content-item">{{'dataCenter.source' | t}}</p>
                </div>
                <div class="data-center-summary-text">
                    <p class="title-item">{{total}}</p>
                    <p class="content-item">{{'dataCenter.totalRow' | t}}</p>
                </div>
            </div>
        </div>
        <div class="data-center-chart" ref="dataSetRef"></div>

        <modal :title="$t('dataCenter.dataAccess')" v-if="isDataAccess" @close="closeDataAccess">
            <div class="access-type">
                <div>{{'dataCenter.severAccess' | t}}</div>
                <!--服务器端SDK-->
                <div class="data-access">
                    <button :disabled="$has('datacentre_data_add_sdk')" 
                            @click="accessSdk" class="btn data-access-btn">
                        <svg aria-hidden="true" :class="{'icon-disable' : $has('datacentre_data_add_sdk')}">
                            <use xlink:href="#icon-sdk"></use>
                        </svg>
                    </button>
                    SDK
                </div>
                <!--API-->
                <div class="data-access">
                    <button :disabled="$has('datacentre_data_add_api')" class="btn data-access-btn" 
                            @click="accessApi">
                        <svg aria-hidden="true" :class="{'icon-disable' : $has('datacentre_data_add_api')}">
                            <use xlink:href="#icon-api"></use>
                        </svg>
                    </button>
                    API
                </div>
            </div>
            <div class="access-type">
                <div>{{'dataCenter.clientAccess' | t}}</div>
                <!--SDK-->
                <div class="data-access">
                    <button :disabled="$has('datacentre_data_add_jssdk')" 
                            @click="accessJsSdk" class="btn data-access-btn">
                        <svg aria-hidden="true" :class="{'icon-disable' : $has('datacentre_data_add_jssdk')}">
                            <use xlink:href="#icon-js"></use>
                        </svg>
                    </button>
                    JS-SDK
                </div>
            </div>
            <div class="access-type">
                <div>{{'dataCenter.dataFileAccess' | t}}</div>
                <div class="data-access">
                    <button :disabled="$has('datacentre_data_add_sftp')" 
                            @click="accessStfp" class="btn data-access-btn">
                        <svg aria-hidden="true" :class="{'icon-disable' : $has('datacentre_data_add_sftp')}">
                            <use xlink:href="#icon-sftp"></use>
                        </svg>
                    </button>
                    SFTP
                </div>
            </div>
            <div class="access-type">
                <div>{{'dataCenter.accessTool' | t}}</div>
                <div class="data-access">
                    <button type="button" class="data-access-btn" @click="developing">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-log"></use>
                        </svg>
                    </button>
                    {{'dataCenter.logAccess' | t}}
                </div>
                <div class="data-access">
                    <button type="button" class="data-access-btn" @click="developing">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-history"></use>
                        </svg>
                    </button>
                    {{'dataCenter.historyAccess' | t}}
                </div>
            </div>
        </modal>
    </div>
</template>
<script>
    import { EtlApiV1 } from '@/api';
    import echarts from 'echarts/lib/echarts';
    import 'echarts-gl';
    import {getDataSet3dChart} from './chart/dataSet3DChart.js';
    import {formatNumber} from './components/number-format.js';
    import debounce from 'lodash/debounce';

    export default {
        data() {
            return {
                isDataAccess: false,    // 数据接入弹框
                dataSets: [],   // 数据源列表
                dataCount: 0,   // 数据源count
                dataTotal: 0,   // 数据源总行数
                dataSetChart: {}, // 数据源图表
            };
        },
        computed: {
            // count
            count() {
                return this.dataCount;
            },
            // 总行数
            total() {
                return formatNumber(this.dataTotal);
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
            // 图表初始化
            this.dataSetChart = echarts.getInstanceByDom(this.$refs.dataSetRef) || echarts.init(this.$refs.dataSetRef);

            // 获取数据源列表
            EtlApiV1
                .getDataSets()
                .then(res => {
                    this.dataTotal = res.body.data.total;
                    this.dataCount = res.body.data.count;
                    this.dataSets = res.body.data.dataSets;
                    this.dataSetChart.setOption(getDataSet3dChart(this.dataSets), true);
                    // 是否具有查看数据详情的权限
                    let clickFlag = this.$has('datacentre_data_search_source');
                    if (clickFlag) {
                        return ;
                    }
                    // 图表添加点击事件
                    let _this = this;
                    this.dataSetChart.on('click', function (params) {
                        let id = params.data.id;
                        let type = params.data.type;
                        let language = params.data.language;
                        if (id) {  // && type && params.data.value[2] > 0
                            if (type === 'sdk' && language === 'javascript') {
                                _this.$router.push({
                                    name: 'jsSdkDetails',
                                    query: {
                                        id,
                                        name: 'overview',
                                        previewName: 'user',
                                    },
                                }); 
                                return;
                            }
                            switch (type) {
                                case 'sftp' :
                                    _this.$router.push({
                                        name: 'sftpDetails',
                                        query: {
                                            id,
                                            name: 'overview',
                                            previewName: 'user',
                                        },
                                    });
                                    break;
                                case 'sdk':
                                    _this.$router.push({
                                        name: 'sdkDetails',
                                        query: {
                                            id,
                                            name: 'overview',
                                            previewName: 'user',
                                        },
                                    });
                                    break;
                                case 'api':
                                    _this.$router.push({
                                        name: 'apiDetails',
                                        query: {
                                            id,
                                            name: 'overview',
                                            previewName: 'user',
                                        },
                                    });
                                    break;
                            }
                        }
                    });
                });

            // canvas自适应
            window.addEventListener('resize', this.resizeChart, false);

            //华为埋码-CPM同意与偏好管理-多渠道数据采集工具
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P12031994AEC263');
            }
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.resizeChart, false);
        },
        methods: {
            // 图表resize
            resizeChart: debounce(function () {
                this.dataSetChart.resize();
            }),

            // 数据接入弹框
            dataAccess() {
                this.isDataAccess = true;
            },

            // 关闭 数据接入弹框
            closeDataAccess() {
                this.isDataAccess = false;
            },

            // 功能开发中...
            developing() {
                this.$toast(this.$t('dataCenter.inDevelopment'), 'warn');
            },
            accessSdk() {
                this.$router.push({name:'sdk',query: {step: 1, type: 'serveSdk'}});
            },
            accessStfp() {
                this.$router.push({name:'sftp',query: {step: 1, type: 'sftp'}});
            },
            accessApi() {
                this.$router.push({name:'api',query: {step: 1, type: 'api'}});
            },
            accessJsSdk() {
                this.$router.push({name:'jsSdk',query: {step: 1, type: 'jsSdk'}});
            }
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .data-center {
        background-color: $content-bg;

        .data-center-title {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;

            .add-access-btn {
                position: absolute;
                right: 0;
                top: 0;
            }

            .data-center-summary-text {

                + .data-center-summary-text {
                    margin-left: 40px;
                    padding-left: 40px;
                    border-left: 1px solid $border-color;
                }

                &.left {
                    text-align: right;
                }
            }

            .title-item {
                font-size: 18px;
            }

            .content-item {
                margin-top: 10px;
                color: $color-light-content;
                font-size: 14px;
            }
        }

        .data-center-chart {
            height: calc(100vh - #{$header-height + $toolbar-height + $header-height}) // 菜单栏，工具栏，title栏
        }

        .access-type {
            border-bottom: 1px solid $border-color;
            margin: 0 24px 16px 16px;
            padding-bottom: 16px;

            $data-access-btn-width: 78px;

            .data-access {
                display: inline-block;
                vertical-align: top;
                margin: 16px 24px 0 0;
                text-align: center;
            }
            
            .data-access-btn {
                display: block;
                width: $data-access-btn-width;
                height: $data-access-btn-width;
                margin: auto auto 8px;
                border: 1px solid $border-color;
                border-radius: 4px;
                background-color: #fff;
                @include appearance(none);
                @include transition();

                &:not([disabled]):hover {
                    border-color: $light-green;
                    cursor: pointer;
                    svg {
                        fill: $light-green;
                    }
                }

                svg {
                    vertical-align: top;
                    width: 50px;
                    height: 50px;
                    fill: #d6dbe4;
                    @include transition();

                }
            }
        }
    }
</style>
