<template>
    <div class="app-analysis">
        <div class="page-content">
            <div class="content-view margin">
                <div class="form-field">
                    <!-- switch all/single -->
                    <div class="pull-left">
                        <p class="create-buttons">
                            <button class="create-button single-create-button" @click="allBtn" :class="{ active: isAll, disabled: !isAll }" :disabled="isAll">
                                {{ 'report.allGroup' | t }}
                            </button>
                            <button class="create-button bulk-create-button" @click="singleBtn" :class="{ active: !isAll, disabled: isAll }" :disabled="!isAll">
                                {{ 'report.singleGroup' | t }}
                            </button>
                        </p>
                    </div>
                    <!-- date-renge for single group only -->
                    <div class="pull-left l-margin" v-if="!isAll">
                        <date-range format="YYYY-MM-DD" :start="singleStartDate" :end="singleEndDate" :max="90" @change="singleDate"></date-range>
                    </div>
                    <!-- selector for single group only -->
                    <div class="pull-left" v-if="!isAll">
                        <selector class="pull-right" auto-width v-model="singleMsgId" :disabled="singleTitleList.length == 0" :value="singleMsgId" :options="singleTitleList" @select="handleSingleTiltle($event)"></selector>
                    </div>
                    <!-- daily/hourly switcher for all only -->
                    <div class="pull-right" v-if="isAll">
                        <p class="create-buttons">
                            <button class="create-button single-create-button" @click="dailyBtn" :class="{ active: isDaily, disabled: !isDaily }" :disabled="isDaily">
                                {{ 'report.dailyReport' | t }}
                            </button>
                            <button class="create-button bulk-create-button" @click="hourlyBtn" :class="{ active: !isDaily, disabled: isDaily }" :disabled="!isDaily">
                                {{ 'report.hourlyReport' | t }}
                            </button>
                        </p>
                    </div>
                </div>
                <!-- article title summary -->
                <ul class="list" v-if="this.pandect.addToFavUser&&this.isDaily">
                    <li v-if="!isAll">
                        <img src="../img/background.png" alt="" />
                        <div class="limg singlePic"></div>
                        <div class="memberTotal" :tip="$t('data.oneDayDelay')">
                            <p class="total">{{ pandect.targetUser }}</p>
                            <p class="name">{{ 'report.targetUser' | t }}</p>
                        </div>
                    </li>
                    <li v-if="isAll">
                        <img src="../img/background.png" alt="" />
                        <div class="limg firPic"></div>
                        <div class="memberTotal" :tip="$t('data.oneDayDelay')">
                            <p class="total">{{ pandect.intPageReadCount }}</p>
                            <p class="name">
                                {{ 'report.totalReadCount' | t }}
                            </p>
                        </div>
                    </li>
                    <li v-if="isAll">
                        <img src="../img/background.png" alt="" />
                        <div class="limg secPic"></div>
                        <div class="memberTotal" :tip="$t('data.oneDayDelay')">
                            <p class="total">{{ pandect.intPageReadUser }}</p>
                            <p class="name">
                                {{ 'report.totalUserCount' | t }}
                            </p>
                        </div>
                    </li>

                    <li v-if="!isAll">
                        <img src="../img/background.png" alt="" />
                        <div class="limg secPic"></div>
                        <div class="memberTotal" :tip="$t('data.oneDayDelay')">
                            <p class="total">{{ pandect.intPageReadUser }}</p>
                            <p class="name">{{ 'report.userCount' | t }}</p>
                        </div>
                    </li>
                    <li v-if="!isAll">
                        <img src="../img/background.png" alt="" />
                        <div class="limg firPic"></div>
                        <div class="memberTotal" :tip="$t('data.oneDayDelay')">
                            <p class="total">{{ pandect.intPageReadCount }}</p>
                            <p class="name">{{ 'report.readCount' | t }}</p>
                        </div>
                    </li>

                    <li v-if="isAll">
                        <img src="../img/background.png" alt="" />
                        <div class="limg thrPic"></div>
                        <div class="memberTotal" :tip="$t('data.oneDayDelay')">
                            <p class="total">{{ pandect.oriPageReadCount }}</p>
                            <p class="name">
                                {{ 'report.originalReadCount' | t }}
                            </p>
                        </div>
                    </li>
                    <li>
                        <img src="../img/background.png" alt="" />
                        <div class="limg forPic"></div>
                        <div class="memberTotal" :tip="$t('data.oneDayDelay')">
                            <p class="total">{{ pandect.shareCount }}</p>
                            <p class="name">{{ 'report.shareCount' | t }}</p>
                        </div>
                    </li>
                    <li>
                        <img src="../img/background.png" alt="" />
                        <div class="limg fivPic"></div>
                        <div class="memberTotal" :tip="$t('data.oneDayDelay')">
                            <p class="total">{{ pandect.addToFavUser }}</p>
                            <p class="name">{{ 'report.collectCount' | t }}</p>
                        </div>
                    </li>
                </ul>
                <div class="charts">
                    <!-- 1. 图文分析 -->
                    <div class="chart">
                        <div class="chart-head">
                            <div class="pull-left">
                                <h5>{{ 'report.appAnalysis' | t }}</h5>
                                <span class="disabled-text">{{
                                    'data.oneDayDelay' | t
                                }}</span>
                            </div>
                            <selector class="pull-right" auto-width v-model="userReadType" :options="userReadList" v-if="userReadList.length > 0" @select="initAppChart"></selector>
                        </div>
                        <inline-loading v-if="charts.app_read_chart_loading"></inline-loading>
                        <div class="chart-body lg" ref="app_read_chart" v-else-if="!charts.app_read_chart_loading&&userReadList.length > 0"></div>
                        <block-empty v-else/>
                    </div>
                    <!-- 2. Reading source analysis -->
                    <div class="chart">
                        <div class="chart-head">
                            <div class="pull-left">
                                <h5>{{'report.readingSource' | t}}</h5>
                                <span class="disabled-text">{{'data.oneDayDelay' | t}}</span>
                            </div>
                            <div v-if="sourceKeysList.length > 0" class="form-field pull-right">
                                <div class="pull-right">
                                    <p class="create-buttons">
                                        <button class="create-button single-create-button" @click="usersBtn" :class="{ active: isUsers, disabled: !isUsers }" :disabled="isUsers">
                                            {{ 'report.users' | t }}
                                        </button>
                                        <button class="create-button bulk-create-button" @click="frequencyBtn" :class="{ active: !isUsers, disabled: isUsers }" :disabled="!isUsers">
                                            {{ 'report.frequency' | t }}
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <inline-loading v-if="charts.reading_source_loading"></inline-loading>
                        <div class="chart-body xl" ref="reading_source_chart" v-else-if="!charts.reading_source_loading&&sourceKeysList.length > 0"></div>
                        <block-empty v-else/>
                    </div>
                    <!-- 3.  Trend-->
                    <div class="chart" v-if="isDaily">
                        <div class="chart-head">
                            <div class="pull-left">
                                <h5>{{ 'report.trend' | t }}</h5>
                                <span class="disabled-text">{{'data.oneDayDelay' | t}}</span>
                            </div>
                            <selector class="pull-right" auto-width v-model="trendType" :options="trendList" v-if="trendList.length > 0" @select="initTrendChart"></selector>
                        </div>
                        <inline-loading v-if="charts.trend_chart_loading"></inline-loading>
                        <div class="chart-body lg" ref="trend_chart" v-else-if="!charts.trend_chart_loading&&trendList.length > 0"></div>
                        <block-empty v-else/>
                    </div>
                </div>
                <!-- 4. 表格 -->
                <div class="simplify-table scroll">
                    <inline-loading v-if="tableLoading"></inline-loading>
                    <table v-else-if="!tableLoading">
                        <thead>
                            <tr>
                                <th class="right-border" rowspan="2">
                                    <span>{{ 'report.time' | t }}</span>
                                    <button type="button" class="table-sort-button" :disabled="!this.isDaily" @click="sortByAttr('time')">
                                        <svg aria-hidden="true" class="asc">
                                            <use xlink:href="#icon-caret-down"></use>
                                        </svg>
                                        <svg aria-hidden="true" class="desc">
                                            <use xlink:href="#icon-caret-down"></use>
                                        </svg>
                                    </button>
                                </th>
                                <th class="right-border" rowspan="2" v-if="!this.isDaily">
                                    <span>{{ 'report.hour' | t }}</span>
                                    <button type="button" class="table-sort-button" @click="sortByAttr('time')">
                                        <svg aria-hidden="true" class="asc">
                                            <use xlink:href="#icon-caret-down"></use>
                                        </svg>
                                        <svg aria-hidden="true" class="desc">
                                            <use xlink:href="#icon-caret-down"></use>
                                        </svg>
                                    </button>
                                </th>
                                <!-- v-if="!(item.id == 2 && !isDaily)" -->
                                <th class="right-border" v-for="item in tableHeaderList" :key="item.id" colspan="2">
                                    <span>{{ item.name }}</span>
                                </th>
                            </tr>
                            <tr>
                                <!-- v-if="!((item.id == 3 || item.id == 4) && !this.isDaily)" -->
                                <th class="right-border" v-for="item in tableSubList" :key="item.id">
                                    <span>{{ item.name }}</span>
                                    <button type="button" class="table-sort-button" @click="sortByAttr(item.attr)">
                                        <svg aria-hidden="true" class="asc">
                                            <use xlink:href="#icon-caret-down"></use>
                                        </svg>
                                        <svg aria-hidden="true" class="desc">
                                            <use xlink:href="#icon-caret-down"></use>
                                        </svg>
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="hour_empty">
                                <td colspan="10" v-if="tableList.length === 0">
                                    <list-empty />
                                </td>
                            </tr>
                            <tr v-for="item in tableList" :key="item.id">
                                <td class="right-border">{{ item.refDate }}</td>
                                <td class="right-border" v-if="!isDaily">{{ item.refHour }}</td>
                                <td class="right-border">{{ item.intPageReadUser }}</td>
                                <td class="right-border">{{ item.intPageReadCount }}</td>
                                <td class="right-border" v-if="isDaily">{{ item.intPageFromSessionReadUser }}</td>
                                <td class="right-border" v-if="isDaily">{{ item.intPageFromSessionReadCount }}</td>
                                <td class="right-border">{{ item.intPageFromFeedReadUser }}</td>
                                <td class="right-border">{{ item.intPageFromFeedReadCount }}</td>
                                <td class="right-border">{{ item.shareUser }}</td>
                                <td class="right-border">{{ item.shareCount }}</td>
                                <td class="right-border">{{ item.addToFavUser }}</td>
                                <td>{{ item.addToFavCount }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <pager v-if="tableList.length > 0 && isAll" :total="totalPage" :now="query.pageNum" @page="SelectPage">
                    {{'contact.everyPage' | t}}
                    <selector :options="pageSizeOptions" :value="query.pageSize" @input="tapPagesHander" class="tiny" />
                    {{'contact.maxPage' | t}}
                </pager>
            </div>
        </div>
    </div>
</template>
<script type="text/babel">
import { WechatApiV1 } from '@/api';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/dataZoom';
import format from 'date-fns/format';
import '../journey/_chart.scss';
import { setSeries, setOptions, setPieOptions } from './chartOptions';
import { getDateInstance } from '../../../common/utils/dateUtils';
import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
import addDays from 'date-fns/add_days';

export default {
    data () {
        return {
            endDate: '',
            startDate: '',
            //单篇群发的日期
            singleEndDate: '',
            singleStartDate: '',
            // 单篇群发文章列表
            singleTitleList: [],
            // 单篇群发选中文章id
            singleMsgId: '',
            // 单篇群发选中文章date
            singleRefDate: '',
            // 是否全部群发
            isAll: true,
            // 是否日报
            isDaily: true,
            // 来源图-是否根人数筛选
            isUsers: true,
            // 存放总览数据
            pandect: {},
            // 存放图文分析总数据
            userReadAnalysis: {},
            // 图文分析选择列表
            userReadList: [],
            //图文分析选中项
            userReadType: 0,
            //存放趋势图总览数据
            trendAnalysis: {},
            //趋势图选择列表
            trendList: [],
            //趋势图选择项
            trendType: 0,
            //存放来源图总数据
            sourceAnalysis: {},
            charts: {
                app_read_chart: null,
                app_read_chart_loading: false,
                reading_source_chart: null,
                reading_source_loading: false,
                trend_chart: null,
                trend_chart_loading: false
            },
            query: {
                startDate: '',//查询开始时间
                endDate: '',//查询结束时间
                pageNum: 1,
                pageSize: 10,
                sort: 'asc', //asc for sync ,desc reverse
                sortField: 'refDate',
            },
            tableLoading: false,
            tableList: [],
            totalPage: '',
            totalRow: '',
            pageSizeOptions: [
                { id: 50, name: 50 },
                { id: 30, name: 30 },
                { id: 20, name: 20 },
                { id: 10, name: 10 }
            ]
        };
    },
    computed: {
        userReadSelected () {
            if (this.userReadList.length > 0) {
                let key = this.userReadList[this.userReadType].attr;
                return this.userReadAnalysis[key];
            }
        },
        trendSelected () {
            if (this.trendList.length > 0) {
                let key = this.trendList[this.trendType].attr;
                return this.trendAnalysis[key];
            }
        },
        tableHeaderList () {
            if (this.isDaily) {
                return [
                    {
                        id: 1,
                        name: this.$t('report.graphReading')
                    },
                    {
                        id: 2,
                        name: this.$t('report.conReading')
                    },
                    {
                        id: 3,
                        name: this.$t('report.momentsReading')
                    },
                    {
                        id: 4,
                        name: this.$t('report.shareForwarding')
                    },
                    {
                        id: 5,
                        name: this.$t('report.weChatCollection')
                    },
                ];
            }
            return [
                {
                    id: 1,
                    name: this.$t('report.graphReading')
                },
                {
                    id: 2,
                    name: this.$t('report.momentsReading')
                },
                {
                    id: 3,
                    name: this.$t('report.shareForwarding')
                },
                {
                    id: 4,
                    name: this.$t('report.weChatCollection')
                }];
        },
        tableSubList () {
            if (this.isDaily) {
                return [
                    {
                        id: 1,
                        name: this.$t('report.users'),
                        attr: 'intPageReadUser'
                    },
                    {
                        id: 2,
                        name: this.$t('report.frequency'),
                        attr: 'intPageReadCount'
                    },
                    {
                        id: 3,
                        name: this.$t('report.users'),
                        attr: 'intPageFromSessionReadUser'
                    },
                    {
                        id: 4,
                        name: this.$t('report.frequency'),
                        attr: 'intPageFromSessionReadCount'
                    },
                    {
                        id: 5,
                        name: this.$t('report.users'),
                        attr: 'intPageFromFeedReadUser'
                    },
                    {
                        id: 6,
                        name: this.$t('report.frequency'),
                        attr: 'intPageFromFeedReadCount'
                    },
                    {
                        id: 7,
                        name: this.$t('report.users'),
                        attr: 'shareUser'
                    },
                    {
                        id: 8,
                        name: this.$t('report.frequency'),
                        attr: 'shareCount'
                    },
                    {
                        id: 9,
                        name: this.$t('report.users'),
                        attr: 'addToFavUser'
                    },
                    {
                        id: 10,
                        name: this.$t('report.frequency'),
                        attr: 'addToFavCount'
                    }
                ];
            }
            return [
                {
                    id: 1,
                    name: this.$t('report.users'),
                    attr: 'intPageReadUser'
                },
                {
                    id: 2,
                    name: this.$t('report.frequency'),
                    attr: 'intPageReadCount'
                },
                {
                    id: 3,
                    name: this.$t('report.users'),
                    attr: 'intPageFromFeedReadUser'
                },
                {
                    id: 4,
                    name: this.$t('report.frequency'),
                    attr: 'intPageFromFeedReadCount'
                },
                {
                    id: 5,
                    name: this.$t('report.users'),
                    attr: 'shareUser'
                },
                {
                    id: 6,
                    name: this.$t('report.frequency'),
                    attr: 'shareCount'
                },
                {
                    id: 7,
                    name: this.$t('report.users'),
                    attr: 'addToFavUser'
                },
                {
                    id: 8,
                    name: this.$t('report.frequency'),
                    attr: 'addToFavCount'
                }
            ];
        },
        sourceKeysList () {
            return Object.keys(this.sourceAnalysis);
        }
    },
    props: {
        hourlyRefDate: {
            type: String,
            default: format(new Date(), 'YYYY-MM-DD'),
            required: true,
        }
    },
    mounted () {
        this.$emit('childActived');
        this.startDate = format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
        this.endDate = format(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
        this.singleStartDate = format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
        this.singleEndDate = format(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
        if (this.isAll) {
            this.initCharts();
        } else {
            this.getSingleTitleList();
        }
        window.addEventListener('resize', this.resize, false);
        this.$once('hook:beforeDestroy', () => {
            window.removeEventListener('resize', this.resize, false);
        });
    },
    methods: {
        // 全局-初始化全部渲染
        initCharts () {
            this.getAppReading();
            this.getReadingSource();
            if (this.isDaily) {
                this.getPandect();
                this.getTrend();
            }
            this.getTable();
        },
        // 重置日期选择
        resetAllDate(){
            this.startDate = format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
            this.endDate = format(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
            this.singleStartDate = format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
            this.singleEndDate = format(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
        },
        // 全局-清空全部渲染
        resetCharts () {
            this.singleTitleList = [],
            this.singleMsgId = '',
            this.singleRefDate = '',
            this.isUsers = true,
            this.pandect = {},
            this.userReadAnalysis = {},
            this.userReadList = [],
            this.userReadType = 0,
            this.trendAnalysis = {},
            //趋势图选择列表
            this.trendList = [],
            //趋势图选择项
            this.trendType = 0,
            //存放来源图总数据
            this.sourceAnalysis = {},
            this.charts = {
                app_read_chart: null,
                app_read_chart_loading: false,
                reading_source_chart: null,
                reading_source_loading: false,
                trend_chart: null,
                trend_chart_loading: false
            },
            this.tableLoading = false,
            this.tableList = [],
            this.totalPage = '',
            this.totalRow = '',
            this.query = {
                startDate: '',//查询开始时间
                endDate: '',//查询结束时间
                pageNum: 1,
                pageSize: 10,
                sort: 'asc', //asc for sync ,desc reverse
                sortField: 'refDate',
            };
            if (this.app_read_chart) {
                this.app_read_chart.clear();
            }
            if (this.reading_source_chart) {
                this.reading_source_chart.clear();
            }
            if (this.trend_chart) {
                this.trend_chart.clear();
            }
            this.tableList = [];
        },
        // 全局-日期选择
        sure ({ start, end }) {
            this.startDate = start;
            this.endDate = end;
            if (this.startDate === '') {
                this.$toast(this.$t('report.startTime'), 'warn');
                return;
            }
            if (this.endDate === '') {
                this.$toast(this.$t('report.endTime'), 'warn');
                return;
            }
            this.$nextTick(() => {
                this.initCharts();
            });
        },
        /**
         * 全局-构建折线图筛选列表
         * @param {Object} obj 请求获得的全部列表数据 {key:{count:[1,2,3...],users:[1,2,3...]},key:{count:[1,2,3...],users:[1,2,3...]},...}
         * @return {Array} opts 返回构建后的列表
         */
        fetchOptions (obj) {
            let array = Object.keys(obj);
            let opts = [];
            let resMap = new Map(array.map((item, i) => [i, item]));
            for (const [key, value] of resMap) {
                let map = {
                    addToFav: this.$t('report.weChatCollection'),
                    intPageRead: this.$t('report.graphReading'),
                    oriPageRead: this.$t('report.oriPageReading'),
                    share: this.$t('report.shareForwarding'),
                    all: this.$t('report.allChannels'),
                    feedRead: this.$t('report.moments'),
                    friendsForwarded: this.$t('report.friendsForwarded'),
                    histmsgRead: this.$t('report.historicalNewsPage'),
                    kanyikanRead: this.$t('report.takeALook'),
                    otherRead: this.$t('report.otherRead'),
                    session: this.$t('report.session'),
                    souyisouRead: this.$t('report.search'),
                    tencentWeibo: this.$t('report.tencentWeibo'),
                };
                let interName = map[value] ? map[value] : value;
                let obj = { id: key, name: interName, attr: value };
                opts.push(obj);
            }
            return opts;
        },
        /**
         * 全局-初始化折线图
         * @param {String} chartName 表格名
         * @param {Object} selected 选中项
         * @param {Array} nameList 图例名称
         *
         */
        initLineChart (chartName, selected, nameList ) {
            if (this[chartName]) {
                this[chartName].clear();
            }
            this.$nextTick(()=>{
                let legendArr = nameList.length === 2 ?  [{ name: nameList[0], icon: 'roundRect' },
                    { name: nameList[1], icon: 'roundRect' }] : [{ name: nameList[0], icon: 'roundRect' }];
                let series = setSeries(selected, nameList);
                // 获取时间
                let start = this.isAll ? getDateInstance(this.startDate) : this.singleRefDate;
                let end = this.isAll ? getDateInstance(this.endDate) : this.singleEndDate;
                let dayDiff = differenceInCalendarDays(end, start);
                let xAxisData = [];
                if (this.isAll) {
                    if (this.isDaily) {
                        for (let i = 0; i <= dayDiff; i++) {
                            xAxisData[i] = format(addDays(start, i), 'MM-DD');
                        }
                    } else {
                        xAxisData = ['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','09:00','10:00','11:00','12:00',
                            '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
                    }
                } else {
                    let dayLength = selected.users.length;
                    for (let i = 0; i < dayLength; i++) {
                        xAxisData[i] = format(addDays(start, i), 'MM-DD');
                    }
                }
                let options = setOptions(xAxisData, legendArr, series);
                this.$nextTick(() => {
                    this[chartName] = echarts.init(this.$refs[chartName]);
                    this[chartName].setOption(options);
                });
            });
        },
        // 全局-请求 图文数据
        getAppReading () {
            let func;
            let params = {};
            this.charts.app_read_chart_loading = true;
            if (this.isAll) {
                if (this.isDaily) {
                    func = 'userReadAnalysis';
                    params.endDate = this.endDate;
                    params.startDate = this.startDate;
                } else {
                    func = 'userReadHourAnalysis';
                    params = this.hourlyRefDate;
                }
            } else {
                func = 'singleAnalysis';
                params.refDate = this.singleRefDate;
                params.msgid = this.singleMsgId;
            }
            WechatApiV1[func](params)
                .then(res => {
                    this.charts.app_read_chart_loading = false;
                    if (res.body.data !== null && res.body.data !== undefined) {
                        this.userReadAnalysis = res.body.data;
                        let opts = this.fetchOptions(this.userReadAnalysis);
                        this.userReadList = opts;
                        if (this.app_read_chart) {
                            this.app_read_chart.clear();
                        }
                        this.$nextTick(()=>{
                            this.initAppChart();
                        });
                    }
                })
                .catch(() => {
                    this.$loaded();
                    this.charts.app_read_chart_loading = false;
                });

        },
        // 全局-初始化 图文chart
        initAppChart(){
            let obj = {
                addToFav: [this.$t('report.collectCount')],
                intPageRead: [this.$t('report.readCount'), this.$t('report.userCount')],
                oriPageRead: [this.$t('report.originalReadCount'), this.$t('report.originalReadUser')],
                share:[this.$t('report.shareCount'), this.$t('report.shareUser')],
            };
            let key = this.userReadList[this.userReadType].attr;
            let nameList = obj[key];
            this.initLineChart('app_read_chart', this.userReadSelected, nameList);
        },
        // 全局-请求 来源数据
        getReadingSource () {
            let func;
            let params = {};
            this.charts.reading_source_loading = true;
            if (this.isAll) {
                if (this.isDaily) {
                    func = 'articleUserReadSource';
                    params.endDate = this.endDate;
                    params.startDate = this.startDate;
                } else {
                    // 全部群发-小时报
                    func = 'userReadSource';
                    params = this.hourlyRefDate;
                }
            } else {
                func = 'singleSource';
                params = this.singleMsgId;
            }
            WechatApiV1[func](params)
                .then(res => {
                    this.charts.reading_source_loading = false;
                    if (res.body.data !== null && res.body.data !== undefined) {
                        this.sourceAnalysis = res.body.data;
                        this.$nextTick(()=>{
                            this.initSourceChart();
                        });
                    }
                })
                .catch(() => {
                    this.$loaded();
                    this.charts.reading_source_loading = false;
                });

        },
        // 全局-初始化 来源chart
        initSourceChart () {
            if (this.source_chart) {
                this.source_chart.clear();
            }
            this.reading_source_chart = echarts.init(this.$refs.reading_source_chart);
            let key = this.isUsers ? 'users' : 'count';
            let legendDataArr = [
                { name: this.$t('report.session'), icon: 'roundRect' },
                { name: this.$t('report.friendsForwarded'), icon: 'roundRect' },
                { name: this.$t('report.moments'), icon: 'roundRect' },
                { name: this.$t('report.tencentWeibo'), icon: 'roundRect' },
                { name: this.$t('report.historicalNewsPage'), icon: 'roundRect' },
                { name: this.$t('report.search'), icon: 'roundRect' },
                { name: this.$t('report.takeALook'), icon: 'roundRect' },
                { name: this.$t('report.otherRead'), icon: 'roundRect' },
            ];
            let curSeriedsArr = [
                { value: this.sourceAnalysis.session[key], name: this.$t('report.session') },
                { value: this.sourceAnalysis.friendsForwarded[key], name: this.$t('report.friendsForwarded') },
                { value: this.sourceAnalysis.feedRead[key], name: this.$t('report.moments') },
                { value: this.sourceAnalysis.tencentWeibo[key], name: this.$t('report.tencentWeibo') },
                { value: this.sourceAnalysis.histmsgRead[key], name: this.$t('report.historicalNewsPage') },
                { value: this.sourceAnalysis.souyisouRead[key], name: this.$t('report.search') },
                { value: this.sourceAnalysis.kanyikanRead[key], name: this.$t('report.takeALook') },
                { value: this.sourceAnalysis.otherRead[key], name: this.$t('report.otherRead') },
            ];
            let options = setPieOptions(this.$t('report.readingSource'), legendDataArr, curSeriedsArr);
            this.reading_source_chart.setOption(options);
        },
        // 全局-请求 趋势数据
        getTrend () {
            this.charts.trend_chart_loading = true;
            let func;
            let params = {};
            if (this.isAll) {
                if (this.isDaily) {
                    func = 'articleUserReadTrend';
                    params.endDate = this.endDate;
                    params.startDate = this.startDate;
                }
            } else {
                func = 'singleTrend';
                params.refDate = this.singleRefDate;
                params.msgid = this.singleMsgId;
            }
            WechatApiV1[func](params)
                .then(res => {
                    this.charts.trend_chart_loading = false;
                    this.trendAnalysis = res.body.data;
                    let opts = this.fetchOptions(this.trendAnalysis);
                    this.trendList = opts;
                    if (this.trend_chart) {
                        this.trend_chart.clear();
                    }
                    this.$nextTick(()=>{
                        this.initTrendChart();
                    });
                })
                .catch(() => {
                    this.$loaded();
                    this.charts.trend_chart_loading = false;
                });

        },
        // 全局-初始化 趋势chart
        initTrendChart () {
            let nameList = [this.$t('report.readCount'), this.$t('report.userCount')];
            this.initLineChart('trend_chart', this.trendSelected, nameList);
        },
        // 全局-chart-resize属性追加
        resize () {
            [this.app_read_chart, this.reading_source_chart, this.trend_chart]
                .forEach(chart => {
                    if (chart && chart.resize) {
                        chart.resize();
                    }
                });
        },
        // 全局-请求 & 初始化 表格数据
        getTable () {
            this.tableLoading = true;
            let func;
            let params = {};
            if (this.isAll) {
                if (this.isDaily) {
                    func = 'articleUserReadReport';
                    params = this.query;
                    params.startDate = this.startDate;
                    params.endDate = this.endDate;
                } else {
                    func = 'userReadeHourReport';
                    params = this.query;
                    params.refDate = this.hourlyRefDate;
                    params.startDate = '';
                    params.endDate = '';
                }

            } else {
                func = 'singleReport';
                params = this.query;
                params.startDate = this.singleRefDate;
                params.endDate = this.singleEndDate;
                params.msgid = this.singleMsgId;
            }
            WechatApiV1[func](params)
                .then(res => {
                    this.tableLoading = false;
                    if (res.body.data !== null && res.body.data !== undefined) {
                        if (res.body.data.list.length > 0) {
                            this.tableList = res.body.data.list;
                            if (this.isAll) {
                                this.totalPage = res.body.data.totalPage;
                                this.totalRow = res.body.data.totalRow;
                            }
                        }
                    }
                })
                .catch(() => {
                    this.$loaded();
                    this.tableLoading = false;
                });

        },
        // 全局-表格排序
        sortByAttr (attr) {
            if (attr === 'time') {
                if (this.isDaily) {
                    attr = 'refDate';
                } else {
                    attr = 'refHour';
                }
            }
            this.query.sortField = attr;
            this.query.sort = this.query.sort === 'asc' ? 'desc' : 'asc';
            this.tableList = [];
            this.getTable();
        },
        // 全局-切换为日报
        dailyBtn () {
            this.resetAllDate();
            this.resetCharts();
            this.isDaily = true;
            this.$emit('childDaily', true);
            this.$nextTick(() => {
                this.initCharts();
            });
        },
        // 全部群发-切换为小时报
        hourlyBtn () {
            this.resetAllDate();
            this.resetCharts();
            this.isDaily = false;
            this.$emit('childDaily', false);
            this.$nextTick(() => {
                this.initCharts();
            });
        },
        // 全局-切换为全部群发
        allBtn () {
            this.resetAllDate();
            this.resetCharts();
            this.isAll = true;
            this.isDaily = true;
            this.$emit('childAll', true);
            this.$nextTick(() => {
                this.initCharts();
            });
        },
        // 全局-切换为单篇群发
        singleBtn () {
            this.resetAllDate();
            this.resetCharts();
            this.isAll = false;
            this.isDaily = true;
            this.$emit('childAll', false);
            this.$emit('childDaily', true);
            this.$nextTick(() => {
                this.getSingleTitleList();
            });
        },
        // 全局-来源分析-切换为按人数
        usersBtn () {
            this.isUsers = true;
            this.initSourceChart();
        },
        // 全局-来源分析-切换为按次数
        frequencyBtn () {
            this.isUsers = false;
            this.initSourceChart();
        },
        // 全部群发-获取分页
        SelectPage (page) {
            this.query.pageNum = page;
            this.$nextTick(() => {
                this.getTable();
            });
        },
        // 全部群发-点击页码动作
        tapPagesHander ($event) {
            this.query.pageNum = 1;
            this.query.pageSize = $event;
            this.$nextTick(() => {
                this.getTable();
            });
        },
        // 单篇群发-日期选择
        singleDate ({ start, end }) {
            this.singleStartDate = start;
            this.singleEndDate = end;
            if (this.singleStartDate === '') {
                this.$toast(this.$t('report.startTime'), 'warn');
                return;
            }
            if (this.singleEndTime === '') {
                this.$toast(this.$t('report.endTime'), 'warn');
                return;
            }
            this.$nextTick(() => {
                this.getSingleTitleList();
            });
        },
        // 单篇群发-获取文章列表
        getSingleTitleList () {
            WechatApiV1
                .titles(this.singleEndDate, this.singleStartDate)
                .then(res => {
                    if (res.body.data.titles) {
                        let titles = res.body.data.titles;
                        if (titles.length > 0) {
                            titles = titles.map(e => { return { id: e.msgid, name: e.title, refDate: e.refDate } });
                            this.singleTitleList = titles;
                            this.singleMsgId = this.singleTitleList[0].id;
                            this.singleRefDate = this.singleTitleList[0].refDate;
                            this.initCharts();
                        } else {
                            this.resetCharts();
                            this.$toast(this.$t('report.noResult'), 'warn');
                        }
                    } else {
                        this.resetCharts();
                    }
                });
        },
        // 单篇群发-选择文章列表
        handleSingleTiltle (e) {
            this.singleRefDate = e.refDate;
            this.singleMsgId = e.id;
            this.$nextTick(() => {
                this.initCharts();
            });
        },
        // 日报-获取概览数据
        getPandect () {
            let func;
            let params = {};
            if (this.isAll) {
                if (this.isDaily) {
                    // 全部群发
                    func = 'articleTitle';
                    params.endDate = this.endDate;
                    params.startDate = this.startDate;
                }
            } else {
                // 单篇群发
                func = 'singleTitle';
                params.refDate = this.singleRefDate;
                params.msgid = this.singleMsgId;
            }
            WechatApiV1[func](params)
                .then(res => {
                    if (res.body.data !== null && res.body.data !== undefined) {
                        this.pandect = res.body.data;
                        this.pandect.intPageReadCount = this.pandect.intPageReadCount.toLocaleString();
                        this.pandect.intPageReadUser = this.pandect.intPageReadUser.toLocaleString();
                        this.pandect.shareCount = this.pandect.shareCount.toLocaleString();
                        this.pandect.addToFavUser = this.pandect.addToFavUser.toLocaleString();
                        if (this.isAll) {
                            this.pandect.oriPageReadCount = this.pandect.oriPageReadCount.toLocaleString();
                        } else {
                            this.pandect.targetUser = this.pandect.targetUser.toLocaleString();
                        }
                    }
                })
                .catch(() => {
                    this.$loaded();
                });
        },
        // 小时报-日期选择
        hourlySure () {
            this.$nextTick(()=>{
                this.initCharts();
            });
        },

    }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../common/scss/base/variables';
@import '../../../common/scss/base/mixin';

.app-analysis {
    .form-field {
        margin-bottom: 15px;
        @include clearfix();
    }
    .range-maximum-tip {
        float: right;
        color: $color-light-content;
        padding-right: 8px;
    }
    .list {
        display: flex;
        margin-bottom: 16px;
        :not(:last-child) {
            margin-right: 15px;
        }
        li {
            flex: 1;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            position: relative;
            background-image: url('../img/background.png');
            background-repeat: no-repeat;
            background-size: contain;
            img {
                z-index: 0;
                display: block;
                width: 100%;
                height: auto;
            }
        }
        .limg {
            position: absolute;
            left: 10%;
            top: 32%;
            height: 32%;
            width: 25%;
            background-repeat: no-repeat;
            background-size: contain;
        }
        .singlePic {
            background-image: url('../img/men.png');
        }
        .firPic {
            background-image: url('../img/paper.png');
        }
        .secPic {
            background-image: url('../img/men.png');
        }
        .thrPic {
            background-image: url('../img/paper.png');
        }
        .forPic {
            background-image: url('../img/share.png');
        }
        .fivPic {
            background-image: url('../img/fav.png');
        }
        .memberTotal {
            height: 66px;
            position: absolute;
            right: 16px;
            top: 50%;
            width: 130px;
            text-align: right;
            margin-top: -33px;
            word-break: normal;
            &:after {
                content: attr(tip);
                color: $color-light-content;
                line-height: $input-field-height;
            }
            .total {
                color: #0cc2a9;
                font-size: 20px;
                padding-bottom: 10px;
            }
            .name {
                font-size: 16px;
                color: #999999;
            }
        }
    }
    .charts .chart .chart-head {
        overflow: unset;
        @include clearfix();
        .selector {
            margin: unset;
        }
    }
    .l-margin {
        margin-left: 15px;
    }
    .simplify-table table tr th,
    .simplify-table table tr td {
        text-align: center;
    }
    .right-border {
        border-right: 1px solid #e0e5ea;
    }
    .block-empty {
        height: 352px;
    }
    .hour_empty {
        cursor: unset;
        td {
            background-color: #fff;
        }
    }
}
</style>
