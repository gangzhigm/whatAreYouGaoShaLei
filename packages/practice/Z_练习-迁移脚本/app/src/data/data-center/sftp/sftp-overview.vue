<template>
    <div class="data-source-overview">
        <!--概览 详情和表格-->
        <div class="data-view">
            <div class="sftp-view-left pull-left">
                <ul>
                    <li class="text-msg">
                        <div class="text-svg">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-run-success"></use>
                            </svg>
                        </div>
                        <div class="view-content">{{sftp.lastSuccess || '0秒前'}}</div>
                        <div class="view-name">{{'dataCenter.recentlySuccess' | t}}</div>
                    </li>
                    <li class="text-msg">
                        <div class="text-svg">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-shijian1"></use>
                            </svg>
                        </div>
                        <div class="view-content">{{sftp.duration || 0}}S</div>
                        <div class="view-name">{{'dataCenter.averageTime' | t}}</div>
                    </li>
                    <li class="text-msg">
                        <div class="text-svg">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-chenggong"></use>
                            </svg>
                        </div>
                        <div class="view-content">{{sftp.rate || 0}}%</div>
                        <div class="view-name">{{'dataCenter.successRate' | t}}</div>
                    </li>
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
            <div class="log-tips">{{'dataCenter.remind' | t}}</div>
            <table>
                <thead>
                <tr>
                    <td>{{'dataCenter.date' | t}}</td>
                    <td>{{'dataCenter.fileName' | t}}</td>
                    <td>{{'dataCenter.uploader' | t}}</td>
                    <td>{{'dataCenter.fileRow' | t}}</td>
                    <td :title="$t('dataCenter.DataRowD')">{{'dataCenter.DataRowD' | t}}</td>
                    <td>{{'dataCenter.progress' | t}}</td>
                    <td >{{'dataCenter.successNumber' | t}}</td>
                    <td :title="$t('dataCenter.successNumberD')">{{'dataCenter.successNumberD' | t}}</td>
                    <td>{{'dataCenter.errorNumber' | t}}</td>
                    <td>{{'dataCenter.durationTime' | t}}</td>
                    <td>{{'dataCenter.operation' | t}}</td>
                </tr>
                </thead>
                <tbody>
                <template v-for="file in fileList">
                    <tr @click="!file.result && passThirtyDays(file.beginTime) ? openErrorMsg(file) : ''">
                        <td>{{file.beginTime}}</td>
                        <td :title="file.fileName">{{file.fileName}}</td>
                        <td :title="file.uploader">{{file.uploader}}</td>
                        <td>{{file.totalRow}}</td>
                        <td>{{file.totalRowsDeduplication}}</td>
                        <td>
                            <span v-show="file.status === 2">{{'common.loading' | t}}</span><!-- 加载中 -->
                            <span v-show="file.status === 1">100.0%</span><!-- 已完成 -->
                            <span v-show="file.status === 3">{{file.progress}}</span><!-- 导入中 -->
                        </td>
                        <td>{{file.rows}}</td>
                        <td>{{file.rowsDeduplication}}</td>
                        <!--错误数 = 总行数 - 已更新的行-->
                        <td>
                            <span>{{file.errNo}}</span>
                            <svg aria-hidden="true" class="msg-icon down-icon"
                                 v-if="file.result !== null && !file.result && passThirtyDays(file.beginTime)"
                                 :style="!file.result && errorId === file.id ? 'transform:rotate(180deg)':'transform:rotate(0deg)'">
                                <use xlink:href="#icon-arrow-down"></use>
                            </svg>
                        </td>
                        <td>{{file.duration}}</td>
                        <td>
                            <span v-if="file.downloadType !== 0 && passThirtyDays(file.beginTime)" class="action-text"
                                  @click.stop="downloadCSV(file.id,file.downloadType)">{{'dataCenter.download' | t}} sftp</span>
                        </td>
                    </tr>
                    <!--错误信息显示 start-->
                    <tr v-if="file.result !== null && !file.result && errorId === file.id" class="no-hover">
                        <td colspan="8">
                            <div class="error-msg">
                                <div class="error-details">
                                    {{errTotalPage >= 100 ? $t('dataCenter.errMsgDesc') :
                                    $t('dataCenter.errDataMsg')}}
                                </div>
                                <div class="error-table">
                                    <table>
                                        <thead>
                                        <tr class="no-hover">
                                            <td :width="30">{{'dataCenter.sort' | t}}</td>
                                            <td :width="500">{{'dataCenter.errType' | t}}</td>
                                            <td>{{'dataCenter.errData' | t}}</td>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr v-for="err in fileErrs">
                                            <td :width="30">{{err.row}}</td>
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
            <pager :now="pageNow" :total="totalPage" @page="toPage($event)"/>
            <div class="no-data" v-if="fileList.length === 0">{{'common.noData' | t}}</div>
        </div>
        <!--数据预览-->
        <div class="data-preview">
            <div class="preview-title">{{'dataCenter.dataPreview' | t}}</div>
            <preview-list type="sftp"/>
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
    import previewList from '../components/preview/preview-list.vue';
    import {getCalendarChart} from '../../../analysis/chart/calendarChart';
    import {translate as t} from '@/locales';

    const pageList = 10;
    const currentYear = new Date().getFullYear();

    /**
     * 文件持续时间转换(可能跨天)
     * @param secondTime    秒数
     * @returns {string}
     */
    function formatDuration(secondTime) {
        let time = parseInt(secondTime) + t('time.second');
        if (parseInt(secondTime) > 60) {
            let second = parseInt(secondTime) % 60;
            let min = parseInt(secondTime / 60);
            time = min + t('time.minute') + second + t('time.second');
            if (min > 60) {
                min = parseInt(secondTime / 60) % 60;
                let hour = parseInt(parseInt(secondTime / 60) / 60);
                time = hour + t('time.hour') + min + t('time.minute') + second + t('time.second');
                if (hour > 24) {
                    hour = parseInt(parseInt(secondTime / 60) / 60) % 24;
                    let day = parseInt(parseInt(parseInt(secondTime / 60) / 60) / 24);
                    time = day + t('time.day') + hour + t('time.hour') + min + t('time.minute') + second + t('time.second');
                }
            }
        }
        return time;
    }

    export default {
        name: 'sftp-overview',
        components: {
            previewList,
        },
        props: {
            sftp: Object,
        },
        data() {
            return {
                pageList,   //pageSize
                pageNow: 1, //页码
                totalPage: 1,
                errPageNow: 1,  //错误导入文件列表页码
                errTotalPage: 1,
                errorId: null,  //有错误导入的文件的id
                fileList: [],// 文件列表
                fileErrs: [],// 错误日志列表
                years: [],// 年份列表
                latestYear: '',//（年份列表的最后一个：最近年份）
                currentDate: '',    //当前日期（日历格中点击的日期）
                calendarChart: {},  //日历表
                calendarShow: true,// 是否显示日历图
                proTimer: null, //计时器
                downloadType: 2,  //0不显示下载,1仅错误数据,2全部数据
                downloadId: '',
                srcType: '',    //数据中心类型
                type: '',

                downloadDetailFlag: false,// 下载modal显隐
            };
        },

        watch: {
            // 最近成功运行的时分秒天月年显示
            sftp() {
                let minute = 60,
                    hour = 60 * minute,
                    day = 24 * hour,
                    month = 30 * day,
                    year = 365 * day,
                    lastSuccess = this.sftp.lastSuccess;

                if (lastSuccess < minute) {
                    this.sftp.lastSuccess = Math.floor(lastSuccess) + this.$t('dataCenter.secondAgo');
                } else if (lastSuccess > minute && lastSuccess < hour) {
                    this.sftp.lastSuccess = Math.floor(lastSuccess / minute) + this.$t('dataCenter.minuteAgo');
                } else if (lastSuccess > hour && lastSuccess < day) {
                    this.sftp.lastSuccess = Math.floor(lastSuccess / hour) + this.$t('dataCenter.hourAgo');
                } else if (lastSuccess > day && lastSuccess < month) {
                    this.sftp.lastSuccess = Math.floor(lastSuccess / day) + this.$t('dataCenter.dayAgo');
                } else if (lastSuccess > month && lastSuccess < year) {
                    this.sftp.lastSuccess = Math.floor(lastSuccess / month) + this.$t('dataCenter.monthAgo');
                } else if (lastSuccess > year) {
                    this.sftp.lastSuccess = Math.floor(lastSuccess / year) + this.$t('dataCenter.yearAgo');
                }
                return this.sftp;
            },
        },

        mounted() {
            // 图表初始化
            this.calendarChart = echarts.getInstanceByDom(this.$refs.calendarRef) || echarts.init(this.$refs.calendarRef);

            if (!this.$route.query.name) {
                this.$router.push({
                    name: this.$route.name,
                    query: {id: this.$route.query.id, name: 'dataOverview', previewName: 'user'},
                });
            }

            // 获取文件列表
            this.$loading();
            this.fetchFiles();
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

                //华为2.4.6 下载详情
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
                        srcType: 'sftp',
                        formatType: downloadInfo.formatType,
                        charset: downloadInfo.dataFormat,
                        emailSubject: downloadInfo.emailSubject,
                    })
                    .then(() => {
                        this.$toast(this.$t('dataCenter.acceptEmail'), 'success');
                        this.downloadDetailFlag = false;
                    });
            },
            /**
             * 切换页码
             * @param no
             */
            toPage(no) {
                clearTimeout(this.proTimer);
                this.proTimer = null;
                this.pageNow = no;
                this.$loading();
                this.fetchFiles();
            },
            /**
             * 错误数据列表 切换页码
             * @param no
             * @param file
             */
            toErrPage(no, file) {
                this.errPageNow = no;
                this.fetchErr(this.errPageNow, this.pageList, file.id);
            },

            // 图表resize
            resizeChart: debounce(function () {
                this.calendarChart.resize();
            }),

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
                    this.fetchErr(this.errPageNow, this.pageList, file.id);
                }
            },

            /**
             * 获取文件的错误日志
             * @param pageNo
             * @param pageSize
             * @param fileId
             */
            fetchErr(pageNo, pageSize, fileId) {
                EtlApiV1
                    .getSftpErr({pageNo, pageSize, id: fileId})
                    .then(res => {
                        this.fileErrs = res.body.data.errors;
                        // 最多显示前100页
                        this.errTotalPage = Math.min(res.body.data.totalPage, 100);
                    });
            },

            /**
             * 选择年份
             * @param year
             */
            fetchYear(year) {
                clearTimeout(this.proTimer);
                this.proTimer = null;
                this.latestYear = year;
                this.$loading();
                this.fetchFiles();
            },
            // 获取文件列表
            fetchFiles() {
                if (!this.$route.query.id) {
                    return;
                }
                EtlApiV1
                    .getFiles({
                        pageNo: this.pageNow,
                        pageSize: this.pageList,
                        sftpId: this.$route.query.id,
                        date: this.currentDate,
                    })
                    .then(res => {
                        this.fileList = res.body.data.files;
                        this.totalPage = res.body.data.totalPage;
                        // 获取年份列表
                        this.years = res.body.data.years.length > 0 ? res.body.data.years : [currentYear.toString()];
                        let maxYear = this.years.reduce((min, max) => {
                            return parseInt(max) > parseInt(min) ? max : min;
                        });
                        this.latestYear = this.latestYear || maxYear;
                        // 持续时间转换
                        this.fileList.map(file => {
                            file.duration = formatDuration(file.duration);
                        });
                        // 获取日历图数据
                        this.fetchCalendarData();
                        this.proTimer = setTimeout(this.fetchFiles, 5000);
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 获取日历图数据
            fetchCalendarData() {
                EtlApiV1
                    .getCalendar({
                        begin: this.latestYear ? this.latestYear + '-01-01' : '',
                        end: this.latestYear ? this.latestYear + '-12-31' : '',
                        id: this.$route.query.id,
                        type: 'sftp',
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
                                .getFiles({
                                    pageNo: 1,
                                    pageSize: _this.pageList,
                                    sftpId: _this.$route.query.id,
                                    date: _this.currentDate,
                                })
                                .then(res => {
                                    _this.pageNow = _this.pageNo;
                                    _this.fileList = res.body.data.files;
                                    _this.totalPage = res.body.data.totalPage;
                                    _this.$loaded();
                                })
                                .catch(err => {
                                    console.error(err);
                                    _this.$loaded();
                                });
                        });
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            /**
             * 下载数据只保留30天；
             * @param time
             * @returns {boolean}
             */
            passThirtyDays(time) {
                return (new Date().getTime() - new Date(time).getTime()) <= 30 * 24 * 3600 * 1000;
            }
        }
    };
</script>
<style lang="scss">
    @import "../scss/data-source-overview";
</style>
