<template>
    <div class="data-source-overview">
        <!--概览 详情和表格-->
        <div class="data-view">
            <div class="sdk-view-left pull-left">
                <ul class="view-left-top">
                    <li class="text-msg">
                        <div class="text-svg">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-reflow"></use>
                            </svg>
                        </div>
                        <div class="view-content">{{'dataCenter.update' | t}}</div>
                        <div class="view-name"></div>
                    </li>
                    <li class="text-msg">
                        <div class="text-svg">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-shijian1"></use>
                            </svg>
                        </div>
                        <div class="view-content">{{'dataCenter.realTime' | t}}</div>
                        <div class="view-name"></div>
                    </li>
                    <li class="text-msg">
                        <div class="text-svg">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-chenggong"></use>
                            </svg>
                        </div>
                        <div class="view-content">{{sdk.rate}}%</div>
                        <div class="view-name">{{'dataCenter.successRate' | t}}</div>
                    </li>
                </ul>
                <ul class="view-left-bottom">
                    <li>{{'dataCenter.accessed' | t}}：{{received}}</li>
                    <li>{{'dataCenter.imported' | t}}：{{imported}}</li>
                    <li>{{'dataCenter.importing' | t}}：{{importing}}</li>
                    <li>{{'dataCenter.error' | t}}：{{errNo}}</li>
                </ul>
            </div>
            <div class="view-right pull-right">
                <div class="chart-year">
                    <ul class="content-tabs">
                        <li :class="{active: latestYear == year}" class="content-tab grey" v-for="year in years"
                            @click="fetchYear(year)">
                            {{year}}
                        </li>
                    </ul>
                </div>
                <div class="chart" ref="calendarRef" v-show="calendarShow"></div>
                <block-empty v-show="!calendarShow"/>
            </div>
        </div>
<!--        列表-->
        <div class="simplify-table">
            <table>
                <thead>
                <tr>
                    <td>{{'dataCenter.date' | t}}</td>
                    <td>{{'dataCenter.accessed' | t}}</td>
                    <td>{{'dataCenter.imported' | t}}</td>
                    <td>{{'dataCenter.importing' | t}}</td>
                    <td>{{'dataCenter.error' | t}}</td>
                    <td>{{'dataCenter.operation' | t}}</td>
                </tr>
                </thead>
                <tbody>
                <template v-for="file in fileList">
                    <tr @click="file.errNo > 0 ? openErrorMsg(file) : ''">
                        <td>{{file.dateTime}}</td>
                        <td>{{file.received}}</td>
                        <td>{{file.imported}}</td>
                        <td>{{file.importing}}</td>
                        <td>
                            {{file.errNo}}
                            <svg aria-hidden="true" class="msg-icon down-icon"
                                 v-if="file.errNo > 0"
                                 :style="file.errNo > 0 && errorId === file.id ? 'transform:rotate(180deg)':'transform:rotate(0deg)'">
                                <use xlink:href="#icon-arrow-down"></use>
                            </svg>
                        </td>
                        <td>
                            <span v-if="file.downloadType != 0"
                                  class="action-text" @click.stop="downloadCSV(file.id,file.downloadType)">
                                    {{'dataCenter.download' | t}} sdk
                            </span>
                        </td>
                    </tr>
                    <!--错误信息显示 start-->
                    <tr v-if="errorId === file.id && file.errNo > 0" class="no-hover">
                        <td colspan="6">
                            <div class="error-msg">
                                <div class="error-details">{{errTotalPage >= 100 ? $t('dataCenter.errMsgDesc'):
                                    $t('dataCenter.errDataMsg')}}
                                </div>
                                <div class="simplify-table error-table">
                                    <table>
                                        <thead>
                                        <tr class="no-hover">
                                            <td :width="30">{{'dataCenter.sort' | t}}</td>
                                            <td :width="500">{{'dataCenter.errType' | t}}</td>
                                            <td>{{'dataCenter.errData' | t}}</td>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr v-for="(err,index) in fileErrs" class="no-hover">
                                            <td :width="30">{{index + 1}}</td>
                                            <td :width="500" :title="err.reason">{{err.reason}}</td>
                                            <td :title="err.origin">{{err.origin}}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <div class="no-data" v-if="fileErrs.length === 0">{{'dataCenter.noErrData' | t}}
                                    </div>
                                </div>
                                <pager :now="errPageNow" :total="errTotalPage" @page="toErrPage($event, file)"/>
                            </div>
                        </td>
                    </tr>
                    <!--错误信息显示 end-->
                </template>
                </tbody>
            </table>
            <div class="no-data" v-if="fileList.length <= 0">{{'common.noData' | t}}</div>
            <pager :now="pageNow" :total="totalPage" @page="pageNow = $event"/>
        </div>
        <!--数据预览-->
        <div class="data-preview">
            <div class="preview-title">{{'dataCenter.dataPreview' | t}}</div>
            <preview-list type="sdk"/>
        </div>
        <!--华为2.4.6下载详情-->
        <download-detail-modal v-if="downloadDetailFlag" :themeModules="'dataCenter'" :dataTypeFlag="true"
                               @cancel="cancelDownload" @okDownload="sureDownload"></download-detail-modal>
    </div>
</template>
<script>
    import { EtlApiV1 } from '@/api';
    // 引入echart
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/component/tooltip';
    import 'echarts/lib/component/legend';
    import 'echarts/lib/component/calendar';
    import 'echarts/lib/chart/heatmap';
    import debounce from 'lodash/debounce';
    import {getCalendarChart} from '../../../analysis/chart/calendarChart';
    import {formatNumber} from './../components/number-format.js';
    import previewList from '../components/preview/preview-list.vue';

    const pageList = 10;
    const currentYear = new Date().getFullYear();

    export default {
        name: 'sdk-overview',
        components: {
            previewList
        },
        props: {
            sdk: {
                type: Object,
                required: true
            },
        },

        computed: {
            received() {
                return formatNumber(this.sdk.received);
            },
            imported() {
                return formatNumber(this.sdk.imported);
            },
            importing() {
                return formatNumber(this.sdk.importing);
            },
            errNo() {
                return formatNumber(this.sdk.errNo);
            }
        },

        data() {
            return {
                fileList: [],   //数据列表
                fileErrs: [],   //错误日志列表
                errorId: null,  //错误日志id
                errPageNow: 1,  //错误列表页码
                errTotalPage: 1,
                totalPage: 1,
                pageList,   //pageSize
                pageNow: 1,
                years: [],// 年份列表
                latestYear: '',// 当前年份（年份列表的最后一个：最近年份）
                currentDate: '',// 当前日期（日历格中点击的日期）
                calendarShow: true, // 是否显示日历图
                downloadType: 2,  //0不显示下载,1仅错误数据,2全部数据
                downloadId: '', //id
                srcType: 'sdk', //数据中心下载类型
                type: '',

                downloadDetailFlag: false,//下载详情modal显隐
            };
        },

        watch: {
            pageNow(value) {
                this.getSDKList(value);
            }
        },

        mounted() {
            // 图表初始化
            this.calendarChart = echarts.getInstanceByDom(this.$refs.calendarRef) || echarts.init(this.$refs.calendarRef);

            this.getSDKList();

            // canvas自适应
            window.addEventListener('resize', this.resizeChart, false);
        },

        beforeDestroy() {
            window.removeEventListener('resize', this.resizeChart, false);
        },

        methods: {
            /**
             * 下载数据
             * @param id
             * @param {Number} downloadType  0不显示下载,1仅错误数据,2全部数据
             */
            downloadCSV(id, downloadType) {
                this.downloadId = id;
                this.downloadType = downloadType;
                this.type = downloadType;

                this.downloadDetailFlag = true;
            },
            // 取消下载
            cancelDownload() {
                this.downloadType = this.type;

                this.downloadDetailFlag = false;
            },
            /**
             * 确定下载
             * @param {Object} downloadInfo  下载详情
             */
            sureDownload(downloadInfo) {
                EtlApiV1
                    .getCSVUrl({
                        id: this.downloadId,
                        downloadType: downloadInfo.dataType,
                        email: downloadInfo.emailAddress,
                        srcType: 'sdk',
                        formatType: downloadInfo.formatType,
                        charset: downloadInfo.dataFormat,
                        emailSubject: downloadInfo.emailSubject,
                    })
                    .then(() => {
                        this.$toast(this.$t('dataCenter.acceptEmail'), 'success');
                        this.downloadDetailFlag = false;
                    })
                    .catch(() => {
                        this.downloadDetailFlag = false;
                    });
            },
            /**
             * 错误数据跳转页面
             * @param no
             * @param file
             */
            toErrPage(no, file) {
                this.errPageNow = no;
                this.fetchErr(file);
            },
            // 图表resize
            resizeChart: debounce(function () {
                this.calendarChart.resize();
            }),

            /**
             * 获取sdk列表
             * @param value
             */
            getSDKList(value) {
                this.$loading();
                EtlApiV1
                    .getSDKList({
                        id: this.$route.query.id,
                        pageNo: this.pageNow,
                        pageSize: pageList,
                    })
                    .then(({body: {data: {datas, totalPage, totalRow, years}}}) => {
                        this.fileList = datas;
                        this.totalPage = totalPage;
                        // 获取年份列表
                        this.years = years.length > 0 ? years : [currentYear.toString()];
                        this.$emit('totalRow', totalRow);
                        let maxYear = this.years.reduce((min, max) => {
                            return parseInt(max) > parseInt(min) ? max : min;
                        });
                        this.latestYear = this.latestYear || maxYear;
                        this.$loaded();
                        if (!value) {
                            this.fetchCalendarData();
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        this.$loaded();
                    });
            },

            /**
             * 点击"更新失败"，展开错误信息
             * @param file
             */
            openErrorMsg(file) {
                this.errPageNow = 1;
                if (this.errorId === file.id) {
                    this.errorId = null;
                    this.fileErrs = [];
                    this.errTotalPage = 1;
                } else {
                    this.errorId = file.id;
                    this.fetchErr(file);
                }
            },

            /**
             * 获取错误日志
             * @param file
             */
            fetchErr(file) {
                this.$loading();
                EtlApiV1
                    .getSDKErr({
                        pageNo: this.errPageNow,
                        pageSize: pageList,
                        id: this.$route.query.id,
                        date: file.dateTime
                    })
                    .then(res => {
                        this.fileErrs = res.body.data.errors;
                        this.errTotalPage = res.body.data.totalPage;
                        // 最多显示前100页
                        this.errTotalPage = Math.min(this.errTotalPage, 100);
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            /**
             * 选择年份
             * @param year
             */
            fetchYear(year) {
                this.latestYear = year;
                this.fetchCalendarData();
            },

            // 获取日历图数据
            fetchCalendarData() {
                this.$loading();
                EtlApiV1.getCalendar({
                    begin: this.latestYear ? this.latestYear + '-01-01' : '',
                    end: this.latestYear ? this.latestYear + '-12-31' : '',
                    id: this.$route.query.id,
                    type: 'sdk',
                })
                    .then(res => {
                        let results = res.body.data.results;
                        // 是否显示日历图
                        this.calendarShow = results.length > 0;
                        let successData = [],  // 成功的数据
                            errorData = [],    // 失败的数据
                            successCount = 0,  // 成功数
                            errorCount = 0;    // 失败数

                        results.forEach(result => {
                            // 状态  true:成功， false:失败
                            result.error > 0
                                ? this.$set(result, 'state', false)
                                : this.$set(result, 'state', true);

                            // 获取成功的数据和失败的数据
                            if (result.state === true) {
                                successData.push([
                                    result.date,
                                    result.state,
                                ]);
                            } else {
                                errorData.push([
                                    result.date,
                                    result.state,
                                ]);
                            }

                            // 获取成功的数量和失败的数量
                            successCount += result.success;
                            errorCount += result.error;
                        });
                        // 画图
                        this.calendarChart.setOption(
                            getCalendarChart(this.latestYear, successData, errorData, successCount, errorCount), true);

                        // 图表添加点击事件
                        let _this = this;
                        this.calendarChart.on('click', function (params) {
                            // console.dir(params); // params：点击的日期格的对象
                            // 获取点击的日期
                            _this.currentDate = params.data[0];
                            // 获取当前日期的文件列表
                            _this.$loading();
                            EtlApiV1
                                .getSDKList({
                                    id: _this.$route.query.id,
                                    pageNo: _this.pageNow,
                                    pageSize: pageList,
                                    date: _this.currentDate,
                                })
                                .then(({body: {data: {datas, totalPage, totalRow}}}) => {
                                    _this.fileList = datas;
                                    _this.totalPage = totalPage;
                                    _this.$emit('totalRow', totalRow);
                                    _this.$loaded();
                                })
                                .catch((err) => {
                                    console.error(err);
                                    _this.$loaded();
                                });
                        });
                        this.$loaded();
                    })
                    .catch((err) => {
                        console.error(err);
                        this.$loaded();
                    });
            },
        },
    };
</script>
<style lang="scss">
    @import "../scss/data-source-overview";
</style>
