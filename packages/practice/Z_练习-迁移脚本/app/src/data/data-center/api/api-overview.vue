<template>
    <div class="data-source-overview">
        <!--概览 详情和表格-->
        <div class="data-view">
<!--            概览-->
            <div class="sdk-view-left pull-left">
                <ul class="view-left-top">
                    <li class="text-msg">
                        <div class="text-svg">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-reflow"></use>
                            </svg>
                        </div>
                        <div class="view-content">{{$t('dataCenter.update')}}</div>
                        <div class="view-name"></div>
                    </li>
                    <li class="text-msg">
                        <div class="text-svg">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-shijian1"></use>
                            </svg>
                        </div>
                        <div class="view-content">{{$t('dataCenter.realTime')}}</div>
                        <div class="view-name"></div>
                    </li>
                    <li class="text-msg">
                        <div class="text-svg">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-chenggong"></use>
                            </svg>
                        </div>
                        <div class="view-content">{{api.rate}}%</div>
                        <div class="view-name">{{$t('dataCenter.successRate')}}</div>
                    </li>
                </ul>
                <ul class="view-left-bottom">
                    <li>{{$t('dataCenter.accessed')}}：{{received}}</li>
                    <li>{{$t('dataCenter.imported')}}： {{imported}}</li>
                    <li>{{$t('dataCenter.importing')}}： {{importing}}</li>
                    <li>{{$t('dataCenter.error')}}： {{errNo}}</li>
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
<!--        数据列表-->
        <div class="simplify-table">
            <div class="log-tips">{{'dataCenter.remind' | t}}</div>
            <table>
                <thead>
                <tr>
                    <td>{{$t('dataCenter.date')}}</td>
                    <td>{{$t('dataCenter.accessed')}}</td>
                    <td>{{$t('dataCenter.progress')}}</td>
                    <td>{{$t('dataCenter.successNumber')}}</td>
                    <td>{{$t('dataCenter.errorNumber')}}</td>
                    <td>{{$t('dataCenter.operation')}}</td>
                </tr>
                </thead>
                <tbody v-if="fileList.length > 0">
                <template v-for="file in fileList">
                    <tr @click="file.errNo > 0 && passThirtyDays(file.dateTime) ? openErrorMsg(file) : ''">
                        <td>{{file.dateTime}}</td>
                        <td>{{file.received}}</td>
                        <td v-if="file.received !== 0">{{file.progress}}</td>
                        <td v-else>-</td>
                        <td>{{file.imported}}</td>
                        <td>
                            {{file.errNo}}
                            <svg aria-hidden="true" class="msg-icon down-icon"
                                 v-if="file.errNo > 0 && passThirtyDays(file.dateTime)"
                                 :style="file.errNo > 0 && errorId === file.id ? 'transform:rotate(180deg)':'transform:rotate(0deg)'">
                                <use xlink:href="#icon-arrow-down"></use>
                            </svg>
                        </td>
                        <td>
                             <span v-if="file.downloadType != 0 && passThirtyDays(file.dateTime)"
                                   class="action-text"
                                   @click.stop="downloadCSV(file.id,file.downloadType)">
                                    {{'dataCenter.download' | t}} api
                                </span>
                        </td>
                    </tr>
                    <!--错误信息显示 start-->
                    <tr v-if="errorId === file.id && file.errNo > 0" class="no-hover">
                        <td colspan="6">
                            <div class="error-msg">
                                <div class="error-details">
                                    {{errTotalPage >= 100 ? $t('dataCenter.errMsgDesc') :
                                    $t('dataCenter.errDataMsg')}}
                                </div>
                                <div class="simplify-table error-table">
                                    <table>
                                        <thead>
                                        <tr class="no-hover">
                                            <td :width="30">{{$t('dataCenter.sort')}}</td>
                                            <td :width="500">{{$t('dataCenter.errType')}}</td>
                                            <td>{{$t('dataCenter.errData')}}</td>
                                        </tr>
                                        </thead>
                                        <tbody v-if="fileErrs.length > 0">
                                        <tr v-for="(err,index) in fileErrs" class="no-hover">
                                            <td :width="30">{{index + 1}}</td>
                                            <td :width="500" :title="err.reason">{{err.reason}}</td>
                                            <td :title="err.origin">{{err.origin}}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <list-empty v-if="fileErrs.length === 0" :name="$t('dataCenter.errData')"/>
                                </div>
                            </div>
                            <pager :now="errPageNow" :total="errTotalPage" @page="toErrPage($event, file)"/>
                        </td>
                    </tr>
                    <!--错误信息显示 end-->
                </template>
                </tbody>
            </table>
            <div class="no-data" v-if="fileList.length <= 0">{{$t('common.noData')}}</div>
            <pager :now="pageNow" :total="totalPage" @page="pageNow = $event"/>
        </div>
        <!--数据预览-->
        <div class="data-preview">
            <div class="preview-title">{{$t('dataCenter.dataPreview')}}</div>
            <preview-list type="api"/>
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
    import {formatNumber} from '../components/number-format.js';
    import previewList from '../components/preview/preview-list.vue';

    export default {
        name: 'api-overview',
        components: {
            previewList
        },
        props: {
            api: {
                type: Object,
                required: true
            },
        },

        computed: {
            received() {
                return formatNumber(this.api.received);
            },
            imported() {
                return formatNumber(this.api.imported);
            },
            importing() {
                return formatNumber(this.api.importing);
            },
            errNo() {
                return formatNumber(this.api.errNo);
            }
        },

        data() {
            return {
                fileList: [],   //数据列表
                fileErrs: [],// 错误日志列表
                errorId: null,  //导入错误文件的ID
                errPageNow: 1, //错误列表的页码
                errTotalPage: 1,    //  错误列表的页码总数
                PAGE_SIZE: 10,
                pageNow: 1, //列表页码
                totalPage: 1,   //  列表总是
                years: [],// 年份列表
                latestYear: '',// 当前年份（年份列表的最后一个：最近年份）
                currentDate: '',// 当前日期（日历格中点击的日期）
                calendarShow: true, //日历显隐
                proTimer: null, //计时器
                downloadType: 2,  //0不显示下载,1仅错误数据,2全部数据
                downloadId: '', //下载文件id
                srcType: 'api', //数据中心对应类型
                type: '',   //下载类型

                downloadDetailFlag: false,//下载详情显隐
            };
        },

        watch: {
            //页码
            pageNow(value) {
                clearTimeout(this.proTimer);
                this.proTimer = null;
                this.$loading();
                this.getAPIList(value);
            }
        },

        mounted() {
            // 图表初始化
            this.calendarChart = echarts.getInstanceByDom(this.$refs.calendarRef) || echarts.init(this.$refs.calendarRef);

            this.$loading();
            this.getAPIList();

            // canvas自适应
            window.addEventListener('resize', this.resizeChart, false);
        },

        beforeDestroy() {
            clearTimeout(this.proTimer);
            this.proTimer = null;
            window.removeEventListener('resize', this.resizeChart, false);
        },

        methods: {
            /**
             * 有关于下载数据（downloadType：0不显示下载,1仅错误数据,2全部数据）
             * @param {number} id
             * @param {Number} downloadType  下载类型
             */
            downloadCSV(id, downloadType) {
                this.downloadId = id;
                this.downloadType = downloadType;
                this.type = downloadType;

                //华为2.4.6下载详情
                this.downloadDetailFlag = true;
            },
            // 取消下载
            cancelDownload() {
                this.downloadType = this.type;

                //华为2.4.6下载详情
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
                        srcType: 'api',
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
             * @param no 页码
             * @param file 文件
             */
            toErrPage(no, file) {
                this.errPageNow = no || this.errPageNow;
                this.fetchErr(file);
            },

            // 图表resize
            resizeChart: debounce(function () {
                this.calendarChart.resize();
            }),

            /**
             * 获取API列表
             * @param value
             */
            getAPIList(value) {
                EtlApiV1
                    .getAPIList({
                        id: this.$route.query.id,
                        pageNo: this.pageNow,
                        pageSize: this.PAGE_SIZE,
                    })
                    .then(({body: {data: {datas, totalPage, totalRow, years}}}) => {
                        this.fileList = datas;
                        this.totalPage = totalPage;
                        // 获取年份列表
                        this.years = years.length > 0 ? years : [new Date().getFullYear()];
                        this.$emit('totalRow', totalRow);

                        let maxYear = Math.max(...this.years.map(y => parseInt(y)));
                        this.latestYear = this.latestYear || maxYear;

                        if (this.fileList.length === 0)
                            this.$loaded();
                        if (!value) {
                            this.fetchCalendarData();
                        }
                        this.proTimer = setTimeout(this.getAPIList, 5000);
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            /**
             * 点击"更新失败"，展开错误信息
             * @param file 文件
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
             * @param file 文件
             */
            fetchErr(file) {
                this.$loading();
                EtlApiV1
                    .getErr({
                        pageNo: this.errPageNow,
                        pageSize: this.PAGE_SIZE,
                        id: this.$route.query.id,
                        date: file.dateTime,
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
                EtlApiV1
                    .getCalendar({
                        begin: this.latestYear ? this.latestYear + '-01-01' : '',
                        end: this.latestYear ? this.latestYear + '-12-31' : '',
                        id: this.$route.query.id,
                        type: 'api',
                    })
                    .then(({body: {data: {results}}}) => {
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
                                .getAPIList({
                                    id: _this.$route.query.id,
                                    pageNo: _this.pageNow,
                                    pageSize: this.PAGE_SIZE,
                                    date: _this.currentDate,
                                })
                                .then(({body: {data: {datas, totalPage, totalRow}}}) => {
                                    _this.fileList = datas;
                                    _this.totalPage = totalPage;
                                    _this.$emit('totalRow', totalRow);
                                    window.clearTimeout(_this.proTimer);
                                    _this.proTimer = null;
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
            /**
             * 下载数据只保留30天；
             * @param time 时间
             * @returns {boolean}
             */
            passThirtyDays(time) {
                return (new Date().getTime() - new Date(time).getTime()) <= 30 * 24 * 3600 * 1000;
            }
        },
    };
</script>
<style lang="scss">
    @import "../scss/data-source-overview";
</style>
