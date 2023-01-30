<template>
    <div class="content-container event-analysis">
        <div class="content-view">
            <!-- 工具栏 -->
            <div class="toolbar">
                <!--筛选条件改变后 运行 重新获取数据-->
                <button type="button" class="btn btn-sm btn-theme" @click="refresh" v-title="$t('eventAnalysis.run')">
                    {{'eventAnalysis.run' | t}}
                </button>
                <crumbs class="pull-left"/>
                <span v-if="changeBms" class="toolbar-action" @click="checkoutBookmark">{{ 'eventAnalysis.restoreBookmark' | t}}</span>
                <div class="toolbar-btn" @click.self="bookmarkFormOpen = !bookmarkFormOpen"
                     v-if="hydratedQuery.measures.length !== 0" key="bookmark-form"
                     v-blur="closeBookmarkForm">
                    <svg aria-hidden="true" @click="bookmarkFormOpen = !bookmarkFormOpen">
                        <use xlink:href="#icon-star"></use>
                    </svg>
                    {{ 'eventAnalysis.saveAsBookmark' | t }}
                    <bookmark-form v-if="bookmarkFormOpen" v-bind="bookmarkInfo" @change="updateBookmark"
                                   @hide="closeBookmarkForm"/>
                </div>
                <div class="toolbar-btn" v-blur="closeBookmarkLib" @click.self="bookmarkLibOpen = !bookmarkLibOpen">
                    <svg aria-hidden="true" @click="bookmarkLibOpen = !bookmarkLibOpen">
                        <use xlink:href="#icon-bookmarks"></use>
                    </svg>
                    {{ 'eventAnalysis.bookmarkLibrary' | t }}
                    <bookmark-library :options="bookmarks" v-if="bookmarkLibOpen" :value="bookmark.id"
                                      @hide="closeBookmarkLib" @choose="jumpToBookmark"/>
                </div>
                <template v-if="hydratedQuery.measures.length !== 0">
                    <span class="divider"></span>
                    <button type="button" class="toolbar-btn" @click="refresh"
                            v-title:bottom-left="$t('eventAnalysis.dataUpdateTime') + lastUpdateTime + `<br>`+ $t('eventAnalysis.refreshTip')">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-refresh"></use>
                        </svg>
                    </button>
                    <span class="divider"></span>
                    <button type="button" class="toolbar-btn" :disabled="storeLoading" @click="downloadDetailFlag = true"
                            v-title="$t('downloadDetails.download')">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-download"></use>
                        </svg>
                    </button>
                </template>
            </div>
        </div>
        <!-- 事件分析的内容 -->
        <div class="event-analysis-content">
            <div class="content-view">
                <!-- 1/4 查询条件 -->
                <query-form v-if="kuduStatus !== '' && kuduStatus !== 0 && kuduStatus !== 2"
                            @change="queryChange"
                            @alias-change="aliasChange"
                            ref="queryForm"/>

                <!-- 2/4 书签标题、描述 -->
                <h1 class="analysis-page-title" :title="bookmark.id ? bookmark.name : queryName.measureNames.join('，')"
                    v-text="bookmark.id ? bookmark.name : queryName.measureNames.join('，')"></h1>
                <button type="button" class="analysis-page-title-edit" @click="editPageTitle"
                        :title="$t('eventAnalysis.editTip')">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-pencil"></use>
                    </svg>
                </button>
                <p class="analysis-page-desc"
                   :title="(bookmark && bookmark.desc) || $t('eventAnalysis.describe') + '……'"
                   v-text="(bookmark && bookmark.desc) || $t('eventAnalysis.describe') + '……'"></p>

                <!-- 3/4 图形区 -->
                <analysis-chart ref="analysisChart"
                                :chart-type.sync="chartType"
                                :title="queryName.measureNames.join('，')"
                                :original-time="originalTime " :compare-time="compareTime"
                                :graph-data="graphData" :comparing-data="!!compareFromDate"
                                :groups="groups" :group-key.sync="groupKey"
                                :measures="measureOptions" :measure-keys.sync="measureKeys"
                                :series="byFieldOptions" :series-keys.sync="seriesKeys"
                                :chart-types="chartTypes" @childKeys='childKeys'>
                    <date-range format="YYYY-MM-DD HH:mm:ss" @change="rangeChange" class="overlap-right"
                                :dynamic.sync="dynamic" :dateRangeText.sync="dateRangeText"
                                :dynamicTimeParams="dynamicTimeParams"
                                :compareDynamicTimeParams="compareDynamicTimeParams"
                                :title="dateRangeMaxTip" v-click-into-view
                                :start="fromDate" :end="toDate" :max="timeUnitOption.limit"
                                comparable :compare-start="compareFromDate" :compare-end="compareToDate"
                                :hasPieSlice="hasPieSlice"/>
                    <selector class="md overlap-left" type="select" v-click-into-view
                              v-title:bottom-left.line="timeUnitTip" :options="unitOptions" v-model="unit"
                              @select="changeTimeType"/>
                </analysis-chart>

                <!-- 4/4 table表格 -->
                <div class="table-wrap" v-show="firstDateLength > 0">
                    <div class="search">
                        <div class="pull-left">
                            <div class="search-box md">
                                <input type="text" v-model.trim="copyListKeyWord"
                                       :placeholder="hydratedQuery.byFields.length === 0 ? $t('eventAnalysis.noFilter') : $t('eventAnalysis.filter')"
                                       :disabled="hydratedQuery.byFields.length === 0"
                                       @keyup.enter="searchKeyWord" @input="lazySearchKeyword">
                                <svg aria-hidden="true" v-if="copyListKeyWord !== ''" @click="clearKeyWord">
                                    <use xlink:href="#icon-round-close"></use>
                                </svg>
                                <svg aria-hidden="true" @click="searchKeyWord">
                                    <use xlink:href="#icon-search"></use>
                                </svg>
                            </div>
                            <checkbox v-if="!isChangeTable" v-model="checkedTotal">{{ 'eventAnalysis.showTotal' | t }}
                            </checkbox>
                            <radio v-if="isChangeTable && compareFromDate" v-model="checkedOriginalTime">{{
                                'eventAnalysis.originTime' | t }}
                            </radio>
                            <radio v-if="isChangeTable && compareFromDate" v-model="checkedCompareTime">{{
                                'eventAnalysis.compareTime' | t}}
                            </radio>
                            <selector class="lg select-type" type="select"
                                      v-if="isChangeTable && compareFromDate && hydratedQuery.measures.length > 1"
                                      :options="measureOptions" v-model="measuresType"/>
                        </div>
                        <div class="table-operate">
                            <span @click="changeTable" class="icon icon-change" :class="{active: isChangeTable}"></span>
                            <span @click="isShowPoint = !isShowPoint" class="icon icon-point"
                                  :class="{active: isShowPoint}"></span>
                        </div>
                    </div>
                    <div class="table-summation"
                         v-show="checkedTotal && hydratedQuery.measures.length > 1 && !isChangeTable && hydratedQuery.byFields.length > 0">
                        <div class="table-content" ref="tableSummation"></div>
                        <div class="page-box">
                            <pager :now="pageSummationNow" :total="totalSummationPage"
                                   @page="pageSummationNow = $event"/>
                        </div>
                    </div>
                    <div class="table-box">
                        <ul class="table-tab" v-if="compareFromDate && !isChangeTable">
                            <li :class="compareIndex === 0?'active':''" @click="showCompareData(0)">{{originalTime}}
                            </li>
                            <li :class="compareIndex === 1?'active':''" @click="showCompareData(1)">{{compareTime}}
                            </li>
                        </ul>
                        <div class="table-content" ref="table"
                             v-show="isChangeTable && allData || !isChangeTable"></div>
                    </div>
                    <list-search-empty v-if="isChangeTable && allData === 0"/>
                    <div class="page-box" v-if="firstDateLength > 0">
                        <span class="pages-text">{{ 'eventAnalysis.showNormData' | t }} {{MAX_DATA_LENGTH}} {{ 'eventAnalysis.data' | t }} </span>
                        <pager :now="pageNow" :total="totalPage" @page="pageNow = $event"/>
                    </div>
                </div>
            </div>
            <back-top/>
        </div>
        <!-- 书签名称、描述 - modal -->
        <confirm v-if="pageTitleEditing"
                 :title="$t('eventAnalysis.modalTitle')"
                 @cancel="cancelPageTitleEdit"
                 @confirm="savePageTitle">
            <div class="title-and-desc-form">
                <label for="title" class="label">{{'template.title' | t}}</label>
                <input class="input" :class="{error: pageTitleErr}" type="text" v-model.trim="pageTitle"
                       id="title" :placeholder="$t('eventAnalysis.modalInput')" maxlength="30"
                       v-title:top.warn.line="pageTitleErr">
                <br>
                <br>
                <label for="desc" class="label">{{'eventAnalysis.description' | t}}</label>
                <textarea class="textarea" v-model.trim="pageDesc" id="desc"
                          :placeholder="$t('eventAnalysis.describe') + '……'"
                          maxlength="255"></textarea>
            </div>
        </confirm>
        <kudu-modal @kuduStau="kuduStatus = $event"></kudu-modal>
        <!--华为2.4.6下载详情-->
        <download-detail-modal v-if="downloadDetailFlag" :themeModules="'dataAnalysis'" :emailDownload="false"
                               @cancel="cancelDownload" @okDownload="downloadCSV"></download-detail-modal>

    </div>
</template>
<script>

    import { WebServiceBookmarkApiV1, QueryApi } from '@/api';
    import debounce from 'lodash/debounce';
    import cloneDeep from 'lodash/cloneDeep';
    import format from 'date-fns/format';
    import Range from '@/common/components/date-range/Range';
    import RANGES, {LAST_WEEK} from '@/common/components/date-range/RANGES';
    import {COMMON_NAME_REGEXP} from '@/common/utils/regs';
    import {stringify} from '@/common/utils/json';
    // vuex
    import eventAnalysisStore, {EVENT_ANALYSIS_STORE_NAME} from '@/store/vuex/modules/eventAnalysisStore';
    import {ADD_BOOKMARK, REPLACE_QUERY, UPDATE_BOOKMARK} from '@/store/vuex/mutationTypes';
    import {FETCH_BOOKMARKS, FETCH_EVALUATES} from '@/store/vuex/actionTypes';
    import { mapState, mapMutations, mapActions } from 'vuex';
    // 组件
    import BookmarkForm from '../bookmark/bookmark-form.vue';
    import BookmarkLibrary from '../bookmark/bookmrak-library.vue';
    import QueryForm from './components/query-form.vue';
    import AnalysisChart from '../analysis-chart.vue';

    import MegaTable from '@/common/utils/MegaTable';
    import {trackEvent} from '@/monitor';
    import KuduModal from '../kudumodal.vue';
    import {
        addArrow,
        addJumpClass,
        effectiveTable,
        orderByGroup,
        orderByNum,
        orderByTime,
        orderByTotal,
        originalHorizontalTable,
        originalVerticalTableTable,
        pointData,
        sortData,
        summationTable
    } from './table-handle';
    import {translate} from '@/locales';
    import {ANALYSIS_STORE_NAME} from '@/store/vuex/modules/analysisStore';

    export const TIME_UNIT_OPTIONS = [
        {id: 'minute', name: translate('eventAnalysis.useMinute'), limit: 1},
        {id: 'hour', name: translate('eventAnalysis.useHour'), limit: 30},
        {id: 'day', name: translate('eventAnalysis.useDay'), limit: 365},
        {id: 'week', name: translate('eventAnalysis.useWeek'), limit: Infinity},
        {id: 'month', name: translate('eventAnalysis.useMonth'), limit: Infinity},
        {id: 'year', name: translate('eventAnalysis.useYear'), limit: Infinity},
    ];

    export const UNIT_RANGE_LIMIT_MAP = {
        minute: 1,
        hour: 30,
        day: 365,
        week: Infinity,
        month: Infinity,
        year: Infinity
    };

    const MAX_DATA_LENGTH = 100;

    export default {
        components: {
            AnalysisChart,
            QueryForm,
            BookmarkForm,
            BookmarkLibrary,
            KuduModal
        },
        data() {
            return {
                chartTypes: [
                    'line', // 线图
                    'bar',  // 柱图
                    'ring',  // 环形图
                    // 'scatter', // todo 散点图(气泡)
                    // 'map',  // todo 地图
                    'pie',  // 饼图
                    // 'polar', // 极坐标
                ],
                MAX_DATA_LENGTH,

                // 0. 页面状态
                lastUpdateTime: '', // 最近更新时间

                // 1. 顶栏
                bookmarkFormOpen: false,        // 书签表单 显示/隐藏
                bookmarkLibOpen: false, // 书签库 显示/隐藏

                // 2. 查询条件：查询条件对应的名称
                queryName: {
                    fieldNames: [],
                    measureNames: [],
                },

                // 书签标题、描述
                pageTitle: '',
                pageTitleEditing: false,
                pageTitleErr: '',
                pageDesc: '',

                // 3. 图形区
                // 图形区条件之一：时间区间
                fromDate: '',        // 区间开始时间
                toDate: '',          // 区间结束时间
                dateRangeText: '',
                compareFromDate: '', // 对比区间开始时间
                compareToDate: '',   // 对比区间结束时间
                timeType: '',               // dynamic
                dynamicTimeParams: [],      // ["-5","0","week"]
                compareTimeType: '',        // dynamic
                compareDynamicTimeParams: [],// ["-5","0","day"]
                // 图形区条件之二：显示指标、分组

                // 图形区条件之三：echarts类型
                chartType: 'line',
                // 图形区条件之四：时间单位(x轴的展示维度)
                unit: 'day',
                groups: [{name: translate('eventAnalysis.time'), id: 'time'}],
                groupKey: 'time',
                measureKeys: {
                    left: [],
                    right: []
                },
                series: [],
                seriesKeys: [],

                // 4. 表格区
                // 表格筛选关键字
                copyListKeyWord: '',
                // 表格显示控制
                isShowPoint: false,
                isChangeTable: true,    // 转置
                checkedTotal: false,
                checkedOriginalTime: true,
                checkedCompareTime: false,
                measuresType: 0,
                allData: 0,
                pageNow: 1,
                pageSummationNow: 1,
                totalPage: 0,
                totalSummationPage: 0,
                sortValue: 'asc', // 升序降序
                firstAjax: true,
                firstDateLength: 0,
                compareIndex: 0,

                // 5. 查询结果
                _originalData: false,
                _table: null,
                _tableSummation: null,
                _reportData: [],
                _transposedReportData: [],
                _summationTable: [],
                _compareSummationTable: [],
                _compareData: [],
                _searchTable: [],
                _transposedCompareData: [],
                // x轴显示分组
                yAxisDataList: [{
                    id: 1
                }],
                // 图表的数据
                graphData: [{rows: []}],

                // 6. echarts 实例
                lineChart: null,
                barChart: null,
                pieSlice: '',

                downloadDetailFlag: false,
                downloadInfo:{
                    formatType:'',
                    dataFormat:''
                },
                kuduStatus: ''
            };
        },
        computed: {
            ...mapState({
                userId: state => state.user.cid,
                storeLoading: state => state.loading,
                storeBookmarks: state => state[ANALYSIS_STORE_NAME].bookmarks,
                // 完整的查询条件
                query: state => state[EVENT_ANALYSIS_STORE_NAME].query,
                // 评估模型列表：query 1/3 指标里的一部分可选项
                evaluates: state => state[ANALYSIS_STORE_NAME].evaluates
            }),
            // 本地缓存使用的 key
            LOCAL_CACHE_KEY() {
                return this.userId + 'EVENT_ANALYSIS_CACHE_KEY';
            },
            // 书签表单用的结构
            bookmarkInfo() {
                let measures = cloneDeep(this.hydratedQuery.measures)
                    .map(list => {
                        delete list.order;
                        return list;
                    });
                let byFields = cloneDeep(this.hydratedQuery.byFields)
                    .map(list => {
                        delete list.order;
                        return list;
                    });
                return {
                    filterStr: {
                        queryName: this.queryName,
                        start: this.fromDate,
                        end: this.toDate,
                        compareStart: this.compareFromDate,
                        compareEnd: this.compareToDate,
                        timeType: this.timeType,
                        dynamicTimeParams: this.dynamicTimeParams,
                        compareTimeType: this.compareTimeType,
                        compareDynamicTimeParams: this.compareDynamicTimeParams,
                        unit: this.unit,
                        type: this.chartType,
                        measureKeys: this.measureKeys,
                        seriesKeys: this.seriesKeys
                    },
                    query: {
                        measures,
                        byFields,
                        ...this.hydratedQuery,
                        pieSlice: this.pieSlice
                    },
                    headerBookMarkName: this.bookmark.name,
                    desc: this.bookmark.id ? this.bookmark.desc : this.pageDesc,
                    bookMarkId: this.bookmark.id,
                    type: 1,
                };
            },
            // 所有可用的事件分析书签
            bookmarks() {
                return this.storeBookmarks.filter(list => list.type === 1);
            },
            // 当前查看的书签，如果不在查看书签，返回空对象
            bookmark() {
                if (this.$route.query.bmsId) {
                    let bookmarkId = Number(this.$route.query.bmsId);
                    let bookmark = this.bookmarks.find(bookmark => bookmark.id === bookmarkId);
                    if (bookmark) {
                        return bookmark;
                    }
                    if (this.bookmarks.length !== 0) {
                        console.warn(`事件分析：没有找到 ID 为 ${bookmarkId} 的书签`);
                    }
                    return {};
                }
                return {};
            },
            // 书签是否被编辑了
            changeBms() {
                if (this.bookmark.id) {
                    let originalCondition = JSON.parse(this.bookmark.conditionStr);
                    return (stringify(originalCondition, 'order') !== stringify(this.bookmarkInfo.query, 'order')
                        || this.bookmark.filterStr !== JSON.stringify(this.bookmarkInfo.filterStr));
                }
                return false;
            },
            // 缩水版查询条件，不包含任何空的、不完整的条件
            hydratedQuery() {
                return this.$store.getters.hydratedQuery;
            },
            // 指标中是否引用了"预处理"的评估模型
            preprocessingEvaluates() {
                const evaluateIds = this.query.measures.map(measure => measure.evaluateId)
                    .filter(id => id);
                // evaluate.enable === true 代表预处理
                const evaluates = this.evaluates.length && evaluateIds.length
                    ? evaluateIds.map(id => this.evaluates.$getByKey(id))
                        .filter(evaluate => evaluate.enable)
                    : [];
                // caveat: 选择"预处理"的评估模型会自动将timeType 变成 'month'
                if (evaluates.length) {
                    if (this.unit !== 'month' && this.unit !== 'year') {
                        this.unit = 'month';
                        this.changeTimeType();
                    }
                }
                return evaluates;
            },
            dynamic: {
                get() {
                    return this.timeType === 'dynamic';
                },
                set(flag) {
                    this.timeType = flag ? 'dynamic' : '';
                    this.compareTimeType = flag ? 'dynamic' : '';
                }
            },
            // 当前时间区间包含天数
            rangeDaysCount() {
                const r = new Range(this.fromDate, this.toDate);
                return r.daysCount();
            },
            // 可选的时间单位选项
            unitOptions() {
                return TIME_UNIT_OPTIONS.map(option => Object.assign(
                    {},
                    option,
                    {
                        disabled: this.preprocessingEvaluates.length
                            ? (option.id !== 'year' && option.id !== 'month')
                            : this.rangeDaysCount > option.limit
                    }
                ));
            },
            // 当前选中的时间单位
            timeUnitOption() {
                return TIME_UNIT_OPTIONS.find(opt => opt.id === this.unit);
            },
            // 展示在时间区间组件上，`最多可选天数`的提示。根据当前所选的时间单位生成
            dateRangeMaxTip() {
                return this.timeUnitOption.limit === Infinity
                    ? ''
                    : `${this.timeUnitOption.name} ${this.$t('eventAnalysis.check')}，${this.$t('eventAnalysis.chooseTimeTipTxt')}${this.timeUnitOption.limit}${this.$t('eventAnalysis.chooseTimeTipDay')}`;
            },
            // 展示在时间单位下拉框上，`有的时间单位不可选`的提示。根据是否选择了评估模型、已经选择了多少天生成
            timeUnitTip() {
                if (this.preprocessingEvaluates.length) {
                    let name = this.preprocessingEvaluates[0].name;
                    name = (name.length > 10 ? name.slice(0, 10) + '...' : name) +
                        (this.preprocessingEvaluates[1] ? this.$t('eventAnalysis.timeUnitTip') : '');
                    return `${this.$t('eventAnalysis.evaluationModel')}【${name}】 ${this.$t('eventAnalysis.timeUnitTipEnable')}`;
                }
                return this.unitOptions.some(opt => opt.disabled)
                    ? `${this.$t('common.selectedA')}  ${this.rangeDaysCount} ${this.$t('common.day')}， ${this.$t('eventAnalysis.timeUnitTipSelect')}  ${this.unitOptions.find(opt => !opt.disabled).name} `
                    : '';
            },
            // 显示指标可选列表
            measureOptions() {
                // 指标的序号作为选中了哪些指标的标识
                return this.hydratedQuery.measures
                    .map((measure, index) => ({
                        id: index,
                        name: this.queryName.measureNames[index],
                        ...measure
                    }));
            },
            // 已选择的指标中，第几个指标是百分比
            percentMeasureIndices() {
                const indices = [];
                this.measureKeys.left
                    .concat(this.measureKeys.right)
                    .forEach((indexOfMeasures, indexOfSelectedOnes) => {
                        // '2p' stands for 百分比
                        if (this.hydratedQuery.measures[indexOfMeasures].format === '2p') {
                            indices.push(indexOfSelectedOnes);
                        }
                    });
                return indices;
            },
            // 显示分组可选列表
            byFieldOptions() {
                const zeroByFields = this.hydratedQuery.byFields.length === 0;
                // 分组的序号作为选中了哪些分组的标识
                const options =
                    this.graphData[0].rows
                        .map((item, index) => ({
                            id: index,
                            name: zeroByFields ? this.$t('eventAnalysis.total') : (item.byValues.join(',') || this.$t('eventAnalysis.unknown')),
                        }));
                if (options.length === 0) options.push({name: this.$t('eventAnalysis.total'), id: 0});
                return options;
            },

            // 选择对比时间后，表格顶部tab页文字
            originalTime() {
                return this.dateRangeText.split('/')[0];
            },
            // 选择对比时间后，表格顶部tab页文字
            compareTime() {
                let arr = this.dateRangeText.split('/');
                if (this.$refs.analysisChart) {
                    if (arr.length > 1) {
                        this.$refs.analysisChart.cutFlag = false;
                        this.$refs.analysisChart.cutData = '';
                    } else {
                        this.$refs.analysisChart.cutFlag = true;
                    }
                }
                return arr.length > 1 ? arr[1] : '';
            },
            pageList() {
                return 9;
            },
            hasPieSlice() {
                if (this.pieSlice > 0) {
                    return true;
                }
                return false;
            }
        },
        watch: {
            '$route.query.bmsId'(newId) {
                if (newId)
                    this.checkoutBookmark();
            },
            checkedTotal() {
                if (this.compareTime !== '' && this.isChangeTable) {
                    this.drawCompareTable();
                } else {
                    this.drawTable();
                }
            },
            isShowPoint() {
                if (this.compareTime !== '' && this.isChangeTable) {
                    this.drawCompareTable();
                } else {
                    this.drawTable();
                }
            },
            pageNow() {
                if (this.compareTime !== '' && this.isChangeTable) {
                    this.drawCompareTable();
                } else {
                    this.drawTable();
                }
            },
            pageSummationNow() {
                this.pagination();
            },
            checkedOriginalTime(val) {
                this.checkedCompareTime = !val;
                this.drawCompareTable();
            },
            checkedCompareTime(val) {
                this.checkedOriginalTime = !val;
            },
            measuresType() {
                this.drawCompareTable();
            },
            copyListKeyWord() {
                this.pageNow = 1;
            }
        },
        beforeCreate() {
            this.$store.registerModule(EVENT_ANALYSIS_STORE_NAME, eventAnalysisStore);
        },
        destroyed() {
            // 清空状态
            this.REPLACE_QUERY({
                measures: [],
                byFields: [],
                attrInfoList: [],
                filter: {
                    relation: 'and',
                    conditions: []
                }
            });
            this.$store.unregisterModule(EVENT_ANALYSIS_STORE_NAME);
        },
        beforeRouteUpdate(to, from, next) {
            if (from.query.bmsId && this.changeBms) {
                this.leaveGuard(next, to);
            } else if (from.query.bmsId && !to.query.bmsId) {
                localStorage.removeItem(this.LOCAL_CACHE_KEY);
                this.resetStatus();
                next();
            } else {
                next();
            }
        },
        beforeRouteLeave(to, from, next) {
            if (this.changeBms) {
                this.leaveGuard(next, to);
            } else {
                next();
            }
        },
        async created() {
            await this.FETCH_EVALUATES();
            await this.FETCH_BOOKMARKS();
            // 1. 读取时间戳对应的数据
            if (this.$route.query.timeStamp) {
                let key = this.$route.query.timeStamp === this.LOCAL_CACHE_KEY + '_USER'
                    ? this.LOCAL_CACHE_KEY
                    : this.$route.query.timeStamp;

                this.$router.replace({path: '/event'});
                let cache = JSON.parse(localStorage.getItem(key));
                this.restoreStatus(JSON.parse(cache.filterStr), JSON.parse(cache.conditionStr));
                return;
            } else if (this.$route.query.bmsId) {
                // 2. 书签跳转
                this.checkoutBookmark();
            } else if (localStorage.getItem(this.LOCAL_CACHE_KEY)) {
                // 4. 读取localStorage的数据还原页面
                let cache = JSON.parse(localStorage.getItem(this.LOCAL_CACHE_KEY));
                this.restoreStatus(JSON.parse(cache.filterStr), JSON.parse(cache.conditionStr));
            } else {
                // 没有任何数据状态可用，初始化一些基础状态
                // 1. 保证时间区间有内容
                if (this.timeType !== 'dynamic') {
                    this.fromDate = format(RANGES[LAST_WEEK].start, 'YYYY-MM-DD HH:mm:ss');
                    this.toDate = format(RANGES[LAST_WEEK].end, 'YYYY-MM-DD HH:mm:ss');
                }
                // 2. 请求数据
                this.refresh();
            }
            // 画布自适应宽度
            window.addEventListener('resize', this.resizeChart, false);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.resizeChart, false);
            window.removeEventListener('beforeunload', this.leaveGuard);
        },
        methods: {
            ...mapMutations([
                REPLACE_QUERY,
                ADD_BOOKMARK,
                UPDATE_BOOKMARK
            ]),
            ...mapActions([
                FETCH_EVALUATES,
                FETCH_BOOKMARKS
            ]),
            // 还原状态
            restoreStatus(filterStr, query) {
                let {
                    queryName, start, end, compareStart, compareEnd, type,
                    unit = this.unitOptions[0].id, measureKeys, seriesKeys, timeType,
                    dynamicTimeParams,
                    compareTimeType,
                    compareDynamicTimeParams
                } = filterStr || {};
                // 1. 有数据状态可以使用，恢复页面状态
                if (filterStr) {
                    this.queryName = queryName;
                    this.fromDate = start;
                    this.toDate = end;
                    this.compareFromDate = compareStart;
                    this.compareToDate = compareEnd;
                    this.timeType = timeType;
                    this.dynamicTimeParams = dynamicTimeParams;
                    this.compareTimeType = compareTimeType;
                    this.compareDynamicTimeParams = compareDynamicTimeParams;
                    this.chartType = type === 'reportChart' ? 'line' : type;
                    this.unit = unit === 'total' ? 'day' : unit;
                    this.measureKeys = measureKeys;
                    this.seriesKeys = seriesKeys;
                }

                // 2. 保证时间区间有内容
                if (this.timeType !== 'dynamic') {
                    this.fromDate = start || format(RANGES[LAST_WEEK].start, 'YYYY-MM-DD HH:mm:ss');
                    this.toDate = end || format(RANGES[LAST_WEEK].end, 'YYYY-MM-DD HH:mm:ss');
                }

                // 3. 同步 vuex 中的 query
                const measures = filterStr ? filterStr.measures : this.query.measures;
                const byFields = filterStr ? filterStr.byFields : this.query.byFields;
                const filter = filterStr ? filterStr.filter : this.query.filter;
                this.pieSlice = query.pieSlice;
                this.REPLACE_QUERY(query || ({measures, byFields, filter}));

                // 4. 清空表格搜索
                this.copyListKeyWord = '';
                this.pageNow = 1;

                this.refresh();
            },
            resetStatus() {
                // 1. 没有数据状态可以使用，重置各状态
                this.compareFromDate = ''; // 对比区间开始时间
                this.compareToDate = '';   // 对比区间结束时间
                this.timeType = '';
                this.dynamicTimeParams = [];
                this.compareTimeType = '';
                this.compareDynamicTimeParams = [];
                this.chartType = 'line';
                this.unit = 'day';
                this.REPLACE_QUERY({
                    measures: [],
                    byFields: [],
                    attrInfoList: [],
                    filter: {
                        relation: 'and',
                        conditions: []
                    }
                });

                // 2. 保证时间区间有内容
                if (this.timeType !== 'dynamic') {
                    this.fromDate = format(RANGES[LAST_WEEK].start, 'YYYY-MM-DD HH:mm:ss');
                    this.toDate = format(RANGES[LAST_WEEK].end, 'YYYY-MM-DD HH:mm:ss');
                }

                // 3. 清空表格搜索
                this.copyListKeyWord = '';
                this.pageNow = 1;
                // 4. 选中一个默认指标
                this.$refs.queryForm.addOneMeasure();
            },
            // 离开页面前检查
            leaveGuard(nextOrEvent, to) {
                this.saveLocalStorage();
                const confirmationMessage = `${this.$t('eventAnalysis.bookMark')} 「${this.bookmark.name}」 ${this.$t('eventAnalysis.bookMarkEdit')}`;
                if (typeof nextOrEvent === 'function') {
                    if (to.name === 'eventUserList') {
                        return nextOrEvent(true);
                    }
                    this.$confirm(this.$t('eventAnalysis.leave'), confirmationMessage)
                        .then(sure => {
                            if (sure) {
                                nextOrEvent(true);
                            } else {
                                nextOrEvent(false);
                            }
                        });
                } else {
                    if (this.changeBms) {
                        (nextOrEvent || window.event).returnValue = confirmationMessage;     //Gecko + IE
                        return confirmationMessage; //Webkit, Safari, Chrome etc.
                    }
                }
            },
            // 保存/更新了书签
            updateBookmark(bookmark) {
                if (bookmark.id) {
                    // 更新或新建
                    this.$router.replace({name: 'event', query: {bmsId: bookmark.id}});
                } else {
                    // 删除在 beforeRouteUpdate 里处理
                }
            },
            // 应用书签内容
            checkoutBookmark() {
                this.firstAjax = true;
                this.restoreStatus(JSON.parse(this.bookmark.filterStr), JSON.parse(this.bookmark.conditionStr));
            },
            // 关闭书签弹框
            closeBookmarkForm() {
                this.bookmarkFormOpen = false;
            },
            // 关闭书签库弹框
            closeBookmarkLib() {
                this.bookmarkLibOpen = false;
            },
            // 跳转到书签
            jumpToBookmark(bookmarkId) {
                this.$router.push({name: 'event', query: {bmsId: bookmarkId}});
            },
            // 刷新当前页面
            refresh() {
                //重置排序
                this.sortValue = 'desc';
                this.copyListKeyWord = '';
                this.hydratedQuery && this.hydratedQuery.measures.forEach((measures) => {
                    this.$set(measures, 'order', '');
                });
                this.hydratedQuery && this.hydratedQuery.byFields.forEach((byFields) => {
                    this.$set(byFields, 'order', '');
                });
                if (this.$refs.analysisChart) {
                    this.$refs.analysisChart.cutData = '';
                }
                this.isFetchAnalysisReport();
            },
            // 获取书签名称
            getCsvName() {
                //获取当前日期
                let time = new Date();

                function timeFormat(value) {
                    return value > 9 ? value : '0' + value;
                }

                let nowDay = time.getFullYear() + '-' + timeFormat(time.getMonth() + 1) + '-' + timeFormat(time.getDate());

                //去除特殊的字符
                function replaceSpecialStr(str) {
                    let str1 = str.replace(/['"\\/\b\f\n\r\t]/g, '');
                    let str2 = str1.replace(/[|*:"<>?]/g, '');
                    return str2;
                }

                //是否存在书签名称，若不存在则使用图表标题名称
                if (this.bookmark.name === '' || this.bookmark.name === undefined) {
                    if (this.downloadInfo.formatType === 'Excel') {
                        return replaceSpecialStr(this.queryName.measureNames.join(',')) + nowDay + '.xls';
                    }
                    if (this.downloadInfo.dataFormat === 'utf8') {
                        return replaceSpecialStr(this.queryName.measureNames.join(',')) + nowDay + 'utf8.csv';
                    }
                    return replaceSpecialStr(this.queryName.measureNames.join(',')) + nowDay + 'gb18030.csv';
                }
                if (this.downloadInfo.formatType === 'Excel') {
                    return replaceSpecialStr(this.bookmark.name) + nowDay + '.xls';
                }
                if (this.downloadInfo.dataFormat === 'utf8') {
                    return replaceSpecialStr(this.bookmark.name) + nowDay + 'utf8.csv';
                }
                return replaceSpecialStr(this.bookmark.name) + nowDay + 'gb18030.csv';
            },
            //取消下载
            cancelDownload() {
                this.downloadDetailFlag = false;
            },
            // 下载CSV文件
            downloadCSV(info) {
                this.downloadInfo.formatType = info.formatType;
                this.downloadInfo.dataFormat = info.dataFormat;
                this.downloadDetailFlag = false;
                if (!this._originalData[0] || this._originalData[0].rows.length === 0) {
                    return this.$toast(this.$t('common.noData'), 'warn');
                }
                let measures = this.hydratedQuery.measures.map((list, index) => {
                    list.attrName = this.queryName.measureNames[index];
                    return list;
                });
                let byFields = this.hydratedQuery.byFields.map((list, index) => {
                    list.attrName = this.queryName.fieldNames[index];
                    return list;
                });
                let sendObj = {
                    byFields: byFields,

                    byFieldsFilter: [this.copyListKeyWord],
                    cid: this.userId,

                    csvName: this.getCsvName(),
                    downloadCompare: !this.isChangeTable && this.compareIndex === 1, //默认表格且选择的是对比时间 传true
                    downloadFull: this.isChangeTable,  //转置后的下载true
                    filter: this.hydratedQuery.filter,

                    fromDate: this.fromDate, //2017-05-10 00:00:00
                    toDate: this.toDate, //2017-10-15 23:00:00
                    compareFromDate: this.compareFromDate,
                    compareToDate: this.compareToDate,
                    timeType: this.timeType,
                    dynamicTimeParams: this.dynamicTimeParams,
                    compareTimeType: this.compareTimeType,
                    compareDynamicTimeParams: this.compareDynamicTimeParams,
                    unit: this.unit,

                    measures: measures,
                    timeOrder: this.sortValue,
                    formatType: info.formatType,
                    dataFormat: info.dataFormat
                };
                QueryApi
                    .downloadEventData(sendObj)
                    .then((res) => {
                        const blob = res.body;
                        const reader = new FileReader();
                        reader.readAsDataURL(blob);
                        reader.onload = (e) => {
                            const a = document.createElement('a');
                            a.download = this.getCsvName();
                            // 后端设置的文件名称在res.headers的 "content-disposition": "form-data; name=\"attachment\"; filename=\"20181211191944.zip\"",
                            a.href = e.target.result;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        };
                    });

            },
            // 查询条件变化
            queryChange(name) {
                this.queryName = name;
                // this.refresh();
            },
            // 查询条件别名变化
            aliasChange(name) {
                // 先赋值给queryName
                this.queryName = name;
                // 如果正在 loading，则不能直接消化数据，而是等到请求结束时自动消化
                // if (this.storeLoading) return;
                // this.digestData();
            },
            editPageTitle() {
                this.pageTitle = this.bookmark.id ? this.bookmark.name : this.queryName.measureNames.join('，');
                this.pageDesc = this.bookmark.id ? this.bookmark.desc : '';
                this.pageTitleEditing = true;
            },
            cancelPageTitleEdit() {
                this.pageTitle = '';
                this.pageTitleErr = '';
                this.pageDesc = '';
                this.pageTitleEditing = false;
            },
            // 编辑了页面标题(书签名称)后，点击了保存按钮，保存(或者更新)书签
            savePageTitle() {
                if (this.pageTitle === '') {
                    this.pageTitleErr = this.$t('eventAnalysis.validNameDataNone');
                    return false;
                }
                if (!COMMON_NAME_REGEXP.test(this.pageTitle)) {
                    this.pageTitleErr = this.$t('eventAnalysis.bookMarkName') + this.$t('common.nameSpecial');
                    return false;
                }
                if (this.pageTitle.length > 30) {
                    this.pageTitleErr = this.$t('eventAnalysis.validNameLength');
                    return false;
                }
                this.$loading();
                this.pageTitleErr = '';
                if (!this.bookmark.id) {
                    WebServiceBookmarkApiV1
                        .createBookmark({
                            cid: this.userId,
                            conditionStr: JSON.stringify({
                                measures: this.measures,
                                byFields: this.byFields,
                                ...this.hydratedQuery
                            }),
                            filterStr: JSON.stringify({
                                queryName: this.queryName,
                                start: this.fromDate,
                                end: this.toDate,
                                compareStart: this.compareFromDate,
                                compareEnd: this.compareToDate,
                                timeType: this.timeType,
                                dynamicTimeParams: this.dynamicTimeParams,
                                compareTimeType: this.compareTimeType,
                                compareDynamicTimeParams: this.compareDynamicTimeParams,
                                unit: this.unit,
                                type: this.chartType,
                                measureKeys: this.measureKeys,
                                seriesKeys: this.seriesKeys
                            }),
                            name: this.pageTitle,
                            desc: this.pageDesc,
                            type: 1, // 事件分析的书签
                            overviewIds: []
                        })
                        .then(({body: {data: {bookmark}}}) => {
                            this.$loaded();
                            trackEvent('数据分析-事件分析-添加书签');
                            // 1. update rootStore
                            this.ADD_BOOKMARK(bookmark);
                            // 2. update route
                            this.$router.replace({name: 'event', query: {bmsId: bookmark.id}});
                            // 3. close modal
                            this.pageTitle = '';
                            this.pageDesc = '';
                            this.pageTitleEditing = false;
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                } else {
                    let newBookmark = cloneDeep(this.bookmark);
                    newBookmark.name = this.pageTitle;
                    newBookmark.desc = this.pageDesc;
                    WebServiceBookmarkApiV1
                        .updateBookmark(newBookmark)
                        .then(({body: {data: {bookmark}}}) => {
                            trackEvent('数据分析-事件分析-修改书签');
                            this.$loaded();
                            // 1. update rootStore
                            this.UPDATE_BOOKMARK(bookmark);
                            // 2. close modal
                            this.pageTitle = '';
                            this.pageDesc = '';
                            this.pageTitleEditing = false;
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                }
            },
            // 消化现有数据：画图、制表、缓存到本地
            digestData() {
                // 画图
                this.drawChart();
                // 画表
                this.updateTable();
            },
            isFetchAnalysisReport() {
                let getStatus = setInterval(() => {
                    if (this.kuduStatus !== '') {
                        clearInterval(getStatus);
                        if (this.kuduStatus !== 0 && this.kuduStatus !== 2) {
                            this.fetchAnalysisReport();
                        }
                    }
                },100);
            },
            // 请求查询分析结果
            fetchAnalysisReport: debounce(function () {
                let copyListKeyWord;
                if (this.firstDateLength >= MAX_DATA_LENGTH && this.copyListKeyWord !== '') {
                    copyListKeyWord = this.copyListKeyWord;
                } else {
                    copyListKeyWord = '';
                }

                // 没有可用指标，无法查询结果
                if (this.hydratedQuery.measures.length === 0) return;

                this.$loading();

                QueryApi
                    .getEventReportData({
                        cid: this.userId,
                        byFieldsFilter: [copyListKeyWord],
                        fromDate: this.fromDate,    // 2017-05-10 00:00:00
                        toDate: this.toDate,        // 2017-10-15 23:00:00
                        compareFromDate: this.compareFromDate,
                        compareToDate: this.compareToDate,
                        timeType: this.timeType,
                        dynamicTimeParams: this.dynamicTimeParams,
                        compareTimeType: this.compareTimeType,
                        compareDynamicTimeParams: this.compareDynamicTimeParams,
                        unit: this.unit,
                        ...this.hydratedQuery
                    })
                    .then(({body: {data}}) => {
                        this._originalData = this.compareTime !== '' ? sortData(data) : data;
                        this.graphData = cloneDeep(data)
                            .slice(0, 2);
                        this.$nextTick(() => {
                            // 书签中没有选择显示分组
                            const noSeriesKeysInBookmark = this.bookmark.id
                                && JSON.parse(this.bookmark.filterStr).seriesKeys.length === 0;

                            // 自动选择显示分组是否必要
                            // 当前没选择任何显示分组、且排除空选书签第一次发请求的特例
                            const autoCompleteNecessary = this.seriesKeys.length === 0 //
                                && !(this.firstAjax && noSeriesKeysInBookmark); // 进入页面的第一次请求，且书签中没有选择显示分组

                            // 显示分组，默认选前 20 个
                            if (autoCompleteNecessary) {
                                this.seriesKeys = this.graphData[0].rows.length === 0
                                    ? []
                                    : this.graphData[0].rows
                                        .slice(0, Math.min(this.graphData[0].rows.length, 20))
                                        .map((n, index) => index);
                            } else if (this.seriesKeys.length > this.graphData[0].rows.length) {
                                this.seriesKeys = this.graphData[0].rows.map((n, index) => index);
                            }
                            this.digestData();
                            if (this.pieSlice && this.firstAjax) {
                                this.$refs.analysisChart.cutData = this.pieSlice;
                                this.$refs.analysisChart.fathData();
                            }
                            this.firstAjax = false;
                        });
                        if (this._originalData) {
                            this.firstDateLength = this._originalData[0].rows.length;
                        }
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });

                // 记录请求数据时的时间
                this.lastUpdateTime = format(new Date(), 'YYYY-MM-DD HH:mm:ss');
                // 离开页面前检查是否有未保存分群
                window.addEventListener('beforeunload', this.leaveGuard);
            }, 500),
            // 将状态保存到本地
            saveLocalStorage() {
                let filterStr = {
                    queryName: this.queryName,
                    start: this.fromDate,
                    end: this.toDate,
                    compareStart: this.compareFromDate,
                    compareEnd: this.compareToDate,
                    timeType: this.timeType,
                    dynamicTimeParams: this.dynamicTimeParams,
                    compareTimeType: this.compareTimeType,
                    compareDynamicTimeParams: this.compareDynamicTimeParams,
                    type: this.chartType,
                    unit: this.unit,
                    measureKeys: this.measureKeys,
                    seriesKeys: this.seriesKeys
                };
                let localObject = {
                    id: this.bookmark.id,
                    name: this.bookmark.name,
                    filterStr: JSON.stringify(filterStr),
                    conditionStr: JSON.stringify(this.query),
                };
                localStorage.setItem(this.LOCAL_CACHE_KEY, JSON.stringify(localObject));
                if (!this.changeBms && this.bookmark.id === Number(this.$route.query.bmsId)) {
                    localStorage.removeItem(this.LOCAL_CACHE_KEY);
                }
                return localObject;
            },
            // 时间区间变化
            rangeChange({start, end, compareStart, compareEnd, dynamicTimeParams, compareDynamicTimeParams}) {
                this.fromDate = start;
                this.toDate = end;
                this.compareFromDate = compareStart;
                this.compareToDate = compareEnd;
                this.dynamicTimeParams = dynamicTimeParams;
                this.compareDynamicTimeParams = compareDynamicTimeParams;
                this.refresh();
            },
            // 改变x轴 按天 按分钟 按月
            changeTimeType() {
                this.$nextTick(() => {
                    this.refresh();
                });
            },
            /**
             * 绘制图形
             */
            drawChart() {
                this.$nextTick(() => {
                    this.$refs.analysisChart.drawChart();
                    // 每次画图之后都把状态缓存的本地
                    this.saveLocalStorage();
                });
            },
            /**
             * 表格
             */
            filterTable() {
                let _currentTable = [],
                    table = [];
                const measuresCount = this.hydratedQuery.measures.length;
                const byFieldsCount = this.hydratedQuery.byFields.length;
                const comparing = this.compareTime !== ''; // 是否选择了对比区间
                const keyword = this.copyListKeyWord.trim();

                if (comparing && this.isChangeTable) {
                    // 对比时间 + 转置
                    _currentTable = this._transposedReportData;
                } else {
                    if (!this.isChangeTable) {
                        // 非转置
                        _currentTable = comparing && this.compareIndex === 1
                            ? this._compareData
                            : this._reportData;

                        // 不合计
                        if (!this.checkedTotal) {
                            if (measuresCount === 1) {
                                _currentTable = _currentTable.slice(0, 1)
                                    .concat(_currentTable.slice(2));
                            } else {
                                if (byFieldsCount === 0) {
                                    _currentTable = _currentTable.slice(0, 1)
                                        .concat(_currentTable.slice(2));
                                }
                            }
                        }
                        // order
                        if (measuresCount === 1) {
                            _currentTable = orderByTime(_currentTable, this.sortValue, this.unit);
                        } else {
                            let index = this.hydratedQuery.measures.findIndex(measure => measure.order);
                            if (index !== -1) {
                                let position = byFieldsCount > 0 ? 2 : 1;
                                _currentTable = orderByNum(
                                    position + index, _currentTable,
                                    this.hydratedQuery.measures[index].order);
                            }
                        }
                    } else {
                        _currentTable = this._transposedReportData;
                        // 如果分组没有被排序，则按照 this.sortValue 排序
                        let byFieldOrdering = this.hydratedQuery.byFields.some(byField => byField.order);
                        if (!byFieldOrdering) {
                            if (measuresCount === 1) {
                                _currentTable = orderByTotal(byFieldsCount, _currentTable, this.sortValue);
                            } else {
                                _currentTable = orderByTotal(byFieldsCount + 1, _currentTable, this.sortValue);
                            }
                        }
                    }
                }

                if (keyword === '') {
                    this._searchTable = _currentTable;
                    return;
                }

                if (byFieldsCount === 0) {
                    this.copyListKeyWord = '';
                    this._searchTable = _currentTable;
                    return;
                }

                let keyWordIndex = [];
                if (!this.isChangeTable) {
                    keyWordIndex.push(true);

                    if (measuresCount === 1) {
                        for (let i = 1; i < _currentTable[0].length; i++) {
                            keyWordIndex.push(_currentTable[0][i].includes(keyword));
                        }
                        for (let row = 0; row < _currentTable.length; row++) {
                            table[row] = [];
                            // TODO: not clear
                            // eslint-disable-next-line
                            keyWordIndex.forEach((keyWordIndex, col) => {
                                if (keyWordIndex) {
                                    table[row].push(_currentTable[row][col]);
                                }
                            });
                        }
                    } else {
                        for (let i = 1; i < _currentTable.length; i++) {
                            keyWordIndex.push(_currentTable[i][1].includes(keyword));
                        }
                        keyWordIndex.forEach((keyWordIndex, row) => {
                            if (keyWordIndex) {
                                table.push(_currentTable[row]);
                            }
                        });
                    }
                    table = table.map((list, index) => {
                        if (list.length === 1) {
                            if (index === 0) {
                                list.push(this.$t('eventAnalysis.selectNothing'));
                            } else {
                                list.push('');
                            }
                        }
                        return list;
                    });
                } else {
                    for (let i = 1; i < _currentTable.length; i++) {
                        keyWordIndex.push(false);
                        this.hydratedQuery.byFields.forEach((byField, index) => {
                            if (_currentTable[i][index].includes(keyword)) {
                                keyWordIndex[i] = true;
                            }
                        });
                    }
                    keyWordIndex.forEach((keyWordIndex, row) => {
                        if (keyWordIndex) {
                            table.push(_currentTable[row]);
                        }
                    });
                }

                if (this.isChangeTable) {
                    let head = _currentTable.slice(0, 1);
                    table = head.concat(table);
                }

                this._searchTable = table;
            },
            changeTable() {
                this.isChangeTable = !this.isChangeTable;
                // this.copyListKeyWord = '';
                this.sortValue = 'desc';
                this.hydratedQuery.measures.forEach((measures) => {
                    this.$set(measures, 'order', '');
                });
                this.hydratedQuery.byFields.forEach((byFields) => {
                    this.$set(byFields, 'order', '');
                });

                this.pageNow = 1;
                if (this.compareTime !== '' && this.isChangeTable) {
                    this.drawCompareTable();
                } else {
                    this.drawTable();
                }
            },
            updateTable(originalData = this._originalData) {
                if (!originalData) return;
                originalData.forEach((originalData, index) => {
                    if (index < 2) {
                        if (!originalData.rows[0]) return;
                        originalData.rows.map((rows) => {
                            rows.values.map((values) => {
                                values.map((value, valueIdx) => {
                                    if (this.percentMeasureIndices.includes(valueIdx)) {
                                        value[0] = value[0] + '%%';
                                    }
                                });
                            });
                        });
                        originalData.rollupRows.map(rollupRows => {
                            rollupRows.values.map((values) => {
                                values.map((value, valueIdx) => {
                                    if (this.percentMeasureIndices.includes(valueIdx)) {
                                        value[0] = value[0] + '%%';
                                    }
                                });
                            });
                        });
                    }
                });
                let byFields = originalData[0].byFields;
                // let rollupRows = originalData[0].rollupRows;
                let columns = originalData[0].rows;
                let firstColumn = originalData[0].series;


                let horizontalTable = [],
                    verticalTable = [],
                    compareHorizontalTable = [],
                    // sums = [],
                    // rowIdx = 0,
                    colIdx = 0;
                let byFieldsLen = byFields.length;
                // 转置表格：上侧多出1行表头, 左侧多出 byFields.length + 1(合计) 列
                let colLen = byFieldsLen + firstColumn.length + 1;
                //有对比时间
                if (this.compareTime !== '') {
                    // 默认表格：上侧多出1行表头+1行合计、左侧多出1列表头
                    horizontalTable = originalHorizontalTable(
                        this.queryName.fieldNames, this.queryName.measureNames, originalData[0]);
                    compareHorizontalTable = effectiveTable(originalHorizontalTable(
                        this.queryName.fieldNames, this.queryName.measureNames, originalData[1]), 0);
                    this._compareSummationTable = summationTable(
                        this.queryName.fieldNames, this.queryName.measureNames, originalData[1]);
                    verticalTable[0] = [];
                    if (this.hydratedQuery.measures.length === 1) {
                        //转置之后的数组
                        for (colIdx = 0; colIdx < colLen + 1; colIdx++) { // 列
                            if (colIdx < byFieldsLen) {
                                verticalTable[0].push(this.queryName.fieldNames[colIdx]);
                            } else if (colIdx === byFieldsLen) {
                                verticalTable[0].push(this.$t('eventAnalysis.period'));
                            } else if (colIdx === byFieldsLen + 1) {
                                verticalTable[0].push(this.$t('eventAnalysis.summation'));
                            } else {
                                verticalTable[0].push(
                                    originalData[0].series[colIdx - byFieldsLen - 2] + '<br>'
                                    + originalData[1].series[colIdx - byFieldsLen - 2]
                                );
                            }
                        }
                        let rowNum = 3 * this.hydratedQuery.measures.length;
                        for (let i = 0, rowIdx = 1; rowIdx < columns.length * rowNum; rowIdx += rowNum, i++) { // 行
                            for (let measuresIdx = 0; measuresIdx < rowNum; measuresIdx++) {
                                verticalTable[rowIdx + measuresIdx] = [];
                            }
                            for (colIdx = 0; colIdx < colLen + 1; colIdx++) { // 列
                                let index = rowIdx - i * (rowNum - 1);
                                for (let measuresIdx = 0; measuresIdx < rowNum; measuresIdx++) {

                                    let compareIndex = (rowIdx + measuresIdx - 1) % 3;
                                    let idx = parseInt((rowIdx + measuresIdx - 1) / 3) % this.hydratedQuery.measures.length;
                                    let time;
                                    if (compareIndex === 0) {
                                        time = this.originalTime;
                                    } else if (compareIndex === 1) {
                                        time = this.compareTime;
                                    } else {
                                        time = this.$t('eventAnalysis.compared');
                                    }

                                    if (colIdx < byFieldsLen) {
                                        verticalTable[rowIdx + measuresIdx]
                                            .push(originalData[0].rows[index - 1].byValues[colIdx]);
                                    } else if (colIdx === byFieldsLen) {
                                        verticalTable[rowIdx + measuresIdx].push({
                                            text: time,
                                            compareIndex: compareIndex
                                        });
                                    } else if (colIdx === byFieldsLen + 1) {
                                        let values = originalData[compareIndex].rollupRows[index - 1]
                                            ? originalData[compareIndex].rollupRows[index - 1].values[0][idx][0] : '-';
                                        verticalTable[rowIdx + measuresIdx].push(values);
                                    } else {
                                        verticalTable[rowIdx + measuresIdx]
                                            .push(compareIndex === 2
                                                ? originalData[compareIndex].rows[index - 1]
                                                    .values[colIdx - byFieldsLen - 2][idx][0]
                                                : originalData[compareIndex].rows[index - 1]
                                                    .values[colIdx - byFieldsLen - 2][idx]
                                            );
                                    }
                                }
                            }
                        }
                    } else {
                        //转置之后的数组
                        for (colIdx = 0; colIdx < colLen + 2; colIdx++) { // 列
                            if (colIdx < byFieldsLen) {
                                verticalTable[0].push(this.queryName.fieldNames[colIdx]);
                            } else if (colIdx === byFieldsLen) {
                                verticalTable[0].push(this.$t('eventAnalysis.norm'));
                            } else if (colIdx === byFieldsLen + 1) {
                                verticalTable[0].push(this.$t('eventAnalysis.period'));
                            } else if (colIdx === byFieldsLen + 2) {
                                verticalTable[0].push(this.$t('eventAnalysis.summation'));
                            } else {
                                verticalTable[0].push(
                                    originalData[0].series[colIdx - byFieldsLen - 3] + '<br>'
                                    + originalData[1].series[colIdx - byFieldsLen - 3]
                                );
                            }
                        }
                        let rowNum = this.hydratedQuery.measures.length * 3;
                        for (let i = 0, rowIdx = 1; rowIdx < columns.length * rowNum; rowIdx += rowNum, i++) { // 行
                            for (let measuresIdx = 0; measuresIdx < rowNum; measuresIdx++) {
                                verticalTable[rowIdx + measuresIdx] = [];
                            }
                            for (colIdx = 0; colIdx < colLen + 2; colIdx++) { // 列
                                let index = rowIdx - i * (rowNum - 1);
                                for (let measuresIdx = 0; measuresIdx < rowNum; measuresIdx++) {
                                    let compareIndex = (rowIdx + measuresIdx - 1) % 3;
                                    let idx = parseInt((rowIdx + measuresIdx - 1) / 3) % this.hydratedQuery.measures.length;
                                    let time;
                                    if (compareIndex === 0) {
                                        time = this.originalTime;
                                    } else if (compareIndex === 1) {
                                        time = this.compareTime;
                                    } else {
                                        time = this.$t('eventAnalysis.compared');
                                    }

                                    if (colIdx < byFieldsLen) {
                                        verticalTable[rowIdx + measuresIdx]
                                            .push(originalData[0].rows[index - 1].byValues[colIdx]);
                                    } else if (colIdx === byFieldsLen) {
                                        let obj = compareIndex < 2 ? {
                                            text: this.queryName.measureNames[idx],
                                            compareIndex: compareIndex,
                                            userCountInside: this.hydratedQuery.measures[idx].userCountInside,
                                            measures: this.hydratedQuery.measures[idx]
                                        } : this.queryName.measureNames[idx];
                                        verticalTable[rowIdx + measuresIdx].push(obj);
                                    } else if (colIdx === byFieldsLen + 1) {
                                        verticalTable[rowIdx + measuresIdx].push({
                                            text: time,
                                            compareIndex: compareIndex
                                        });
                                    } else if (colIdx === byFieldsLen + 2) {
                                        let values = originalData[compareIndex].rollupRows[index - 1].values[0][idx][0];
                                        verticalTable[rowIdx + measuresIdx].push(values);
                                    } else {
                                        let values = compareIndex === 2
                                            ? originalData[compareIndex].rows[index - 1]
                                                .values[colIdx - byFieldsLen - 3][idx][0]
                                            : originalData[compareIndex].rows[index - 1]
                                                .values[colIdx - byFieldsLen - 3][idx];
                                        verticalTable[rowIdx + measuresIdx].push(values);
                                    }
                                }

                            }

                        }
                    }
                } else {
                    // 默认表格：上侧多出1行表头+1行合计、左侧多出1列表头
                    horizontalTable = originalHorizontalTable(
                        this.queryName.fieldNames, this.queryName.measureNames, originalData[0]
                    );
                    verticalTable = originalVerticalTableTable(
                        this.queryName.fieldNames, this.queryName.measureNames,
                        this.hydratedQuery.measures, originalData[0]
                    );
                }

                if (this.hydratedQuery.measures.length !== 1) {
                    this._summationTable = summationTable(
                        this.queryName.fieldNames, this.queryName.measureNames, originalData[0]
                    );
                    this.pagination();
                }

                this._reportData = horizontalTable;
                this._transposedReportData = verticalTable;
                this._compareData = compareHorizontalTable;

                this.pageNow = 1;
                if (this.compareTime !== '' && this.isChangeTable) {
                    this.drawCompareTable();
                } else {
                    this.drawTable();
                }
            },
            pushRouter(measures, measuresName, compareIndex, sliceDate, sliceByValues, valueNum) {
                let value = valueNum instanceof Array ? valueNum[0] : valueNum;
                if (value <= 0) return;
                let fromDate, toDate;
                fromDate = compareIndex === 0 ? this.fromDate : this.compareFromDate;
                toDate = compareIndex === 0 ? this.toDate : this.compareToDate;

                let sendDataObj = {
                    byFields: this.hydratedQuery.byFields,
                    byFieldsFilter: [this.copyListKeyWord],
                    cid: this.userId,
                    filter: this.hydratedQuery.filter,
                    fromDate: fromDate, //2017-05-10 00:00:00
                    toDate: toDate, //2017-10-15 23:00:00
                    timeType: this.timeType,
                    dynamicTimeParams: this.dynamicTimeParams,
                    compareTimeType: this.compareTimeType,
                    compareDynamicTimeParams: this.compareDynamicTimeParams,
                    unit: this.unit,
                    measures: [measures],
                    attrInfoList: this.hydratedQuery.attrInfoList,
                };
                let time = sliceDate === this.$t('eventAnalysis.summation') || sliceDate === ''
                    ? `${this.$t('eventAnalysis.summation')}: ` + (compareIndex === 0 ? this.originalTime : this.compareTime)
                    : `${this.$t('time.date')}:` + sliceDate;

                let filterOrigin = {};
                this._originalData[0].rows.forEach(row => {
                    let key = row.byValues.join(',');
                    filterOrigin[key] = row.byValuesOrigin;
                });
                let timeOrigin = {};
                this._originalData[0].series.forEach((row, index) => {
                    timeOrigin[row] = this._originalData[0].seriesOrigin[index];
                });
                let queryObj = {
                    'sliceByValues': filterOrigin[sliceByValues.join(',')] || [],
                    sliceByTitle: sliceByValues,
                    'sliceDate': timeOrigin[sliceDate] || '',
                    'titleList': this.queryName.fieldNames.slice(),
                    'markName': (this.bookmark.name || measuresName),
                    'value': value,
                    'time': time
                };
                localStorage.setItem(this.LOCAL_CACHE_KEY + '_USER', JSON.stringify({
                    queryObj: queryObj,
                    sendDataObj: sendDataObj,
                    userListData: {},
                    eventObj: this.saveLocalStorage(),
                    bmsId: this.$route.query.bmsId
                }));
                this.$router.push({
                    name: 'eventUserList',
                    query: {
                        'timeStamp': this.LOCAL_CACHE_KEY + '_USER'
                    }
                });
            },
            showCompareData(index) {
                this.compareIndex = index;
                this.pageNow = 1;
                if (this.compareTime !== '' && this.isChangeTable) {
                    this.drawCompareTable();
                } else {
                    this.drawTable();
                }
                if (this.hydratedQuery.measures.length > 1 && this.hydratedQuery.byFields.length > 0) {
                    this.pagination();
                }
            },
            pagination() {
                let arr = this.compareIndex === 0 ? this._summationTable : this._compareSummationTable;
                let _this = this;
                let table;
                let head = arr.slice(0, 1);
                if (this.pageSummationNow - 1 === 0) {
                    table = arr.slice(1, this.pageList * this.pageSummationNow);
                } else {
                    table = arr.slice(
                        this.pageList * (this.pageSummationNow - 1),
                        this.pageList * (this.pageSummationNow - 1) + (this.pageList - 1)
                    );
                }
                table = head.concat(table);
                if (!this._tableSummation) {
                    this._tableSummation = new MegaTable(this.$refs.tableSummation, {
                        className: 'table',
                        data: table,
                        clickHandler: function (cell, {col, row, data}) {
                            if (row === 0) return;
                            _this.hydratedQuery.measures.forEach((measures, measuresIdx) => {
                                if (measures.userCountInside) {
                                    if (col === measuresIdx + 2) {
                                        _this.pushRouter(
                                            measures,
                                            _this.queryName.measureNames[measuresIdx],
                                            _this.compareIndex,
                                            '',
                                            [data[row][1]],
                                            data[row][col]
                                        );
                                    }
                                }
                            });
                        }
                    });
                } else {
                    this._tableSummation.setData(table);
                }
                this.totalSummationPage = Math.ceil(arr.length / this.pageList);
                let startCol = this.hydratedQuery.measures.length !== 1 && this.hydratedQuery.byFields.length !== 0 ? 2 : 1;
                for (let row = 1; row < table.length; row++) {
                    for (let col = startCol; col < table[row].length; col++) {
                        if (
                            this.hydratedQuery.measures[col - startCol]
                            && this.hydratedQuery.measures[col - startCol].userCountInside
                        ) {
                            addJumpClass(this.$refs.tableSummation.getElementsByTagName('table')[0].rows[row].cells[col]);
                        }
                    }
                }
            },
            changePage(arr = this._searchTable) {
                let headNum;
                if (this.hydratedQuery.measures.length > 1 && this.hydratedQuery.byFields.length > 1) {
                    headNum = 1;
                } else {
                    headNum = !this.isChangeTable && this.checkedTotal ? 2 : 1;
                }
                let head = arr.slice(0, headNum);
                let data = arr.slice(headNum);
                data = data.slice(this.pageList * (this.pageNow - 1), this.pageList * this.pageNow);
                this.allData = arr.length - head.length;
                this.totalPage = Math.ceil(this.allData / this.pageList);
                let table = head.concat(data);
                table = pointData(table, this.isShowPoint);
                this.setTable(table);
            },
            tableArrow() {
                //加箭头
                if (!this.isChangeTable) {//添加排序图标
                    if (this.hydratedQuery.measures.length === 1) {
                        addArrow(this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[0], this.sortValue);
                    } else {
                        if (this.queryName.fieldNames.length > 0) {
                            for (let i = 0; i < this.hydratedQuery.measures.length + 2; i++) {
                                if (i === 0) {
                                    addArrow(
                                        this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[0],
                                        this.sortValue
                                    );
                                } else if (i === 1) {
                                    addArrow(
                                        this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[1],
                                        this.hydratedQuery.byFields[0].order
                                    );
                                } else {
                                    addArrow(
                                        this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[i],
                                        this.hydratedQuery.measures[i - 2].order
                                    );
                                }
                            }
                        } else {
                            for (let i = 0; i < this.hydratedQuery.measures.length + 1; i++) {
                                if (i === 0) {
                                    addArrow(
                                        this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[0],
                                        this.sortValue
                                    );
                                } else {
                                    addArrow(
                                        this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[i],
                                        this.hydratedQuery.measures[i - 1].order
                                    );
                                }
                            }
                        }
                    }

                } else {
                    let current = 0;
                    this.hydratedQuery.byFields.forEach((list, index) => {
                        if (list.order) {
                            addArrow(this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[index], list.order);
                        } else {
                            current++;
                            addArrow(this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[index], '');
                        }
                    });
                    let order = current === this.hydratedQuery.byFields.length ? this.sortValue : '';
                    if (this.hydratedQuery.measures.length === 1) {
                        addArrow(
                            this.$refs.table.getElementsByTagName('table')[0]
                                .rows[0].cells[this.hydratedQuery.byFields.length],
                            order
                        );
                    } else {
                        addArrow(
                            this.$refs.table.getElementsByTagName('table')[0]
                                .rows[0].cells[this.hydratedQuery.byFields.length + 1],
                            order
                        );
                    }
                }
            },
            // 渲染的表格
            drawTable: debounce(function () {
                this.filterTable();
                this.changePage();
                this.tableArrow();
            }, 100),
            // 渲染表格
            tableStyle(table) {
                let startCol = 0,
                    // startRow = 0,
                    col = 0,
                    row = 0;
                let byFieldsLen = this.hydratedQuery.byFields.length;
                if (!this.isChangeTable) {
                    startCol = this.hydratedQuery.measures.length !== 1 && byFieldsLen !== 0 ? 2 : 1;
                    if (this.hydratedQuery.measures.length === 1) {
                        if (this.hydratedQuery.measures[0].userCountInside) {
                            for (row = 1; row < table.length; row++) {
                                for (col = startCol; col < table[row].length; col++) {
                                    addJumpClass(this.$refs.table.getElementsByTagName('table')[0].rows[row].cells[col]);
                                }
                            }
                        }
                    } else {
                        for (row = 1; row < table.length; row++) {
                            for (col = startCol; col < table[row].length; col++) {
                                if (this.hydratedQuery.measures[col - startCol].userCountInside) {
                                    addJumpClass(this.$refs.table.getElementsByTagName('table')[0].rows[row].cells[col]);
                                }
                            }
                        }
                    }
                } else {
                    if (this.hydratedQuery.measures.length === 1) {
                        if (this.compareTime !== '') {
                            startCol = byFieldsLen + 1;
                        } else {
                            startCol = byFieldsLen;
                        }
                    } else {
                        if (this.compareTime !== '') {
                            startCol = byFieldsLen + 2;
                        } else {
                            startCol = byFieldsLen + 1;
                        }
                    }

                    if (this.hydratedQuery.measures.length === 1) {
                        if (this.hydratedQuery.measures[0].userCountInside) {
                            for (row = 1; row < table.length; row++) {
                                for (col = startCol; col < table[row].length; col++) {
                                    addJumpClass(this.$refs.table.getElementsByTagName('table')[0].rows[row].cells[col]);
                                }
                            }
                        }
                    } else {
                        for (row = 1; row < table.length; row++) {
                            for (col = startCol; col < table[row].length; col++) {
                                if (table[row][byFieldsLen].userCountInside) {
                                    addJumpClass(this.$refs.table.getElementsByTagName('table')[0].rows[row].cells[col]);
                                }
                            }
                        }
                    }
                }
            },
            // 对比时间的表格
            drawCompareTable() {
                this.filterTable();
                let table = this._searchTable;
                let byFieldsCount = this.hydratedQuery.byFields.length;
                let position = this.hydratedQuery.measures.length !== 1 ? byFieldsCount + 2 : byFieldsCount + 1;
                let timePosition = this.checkedOriginalTime ? 0 : 1;
                table = orderByGroup(
                    table, this.sortValue, 3 * this.hydratedQuery.measures.length,
                    this.measuresType, timePosition, position
                );
                this.allData = table.length - 1;
                this.totalPage = Math.ceil(this.allData / 49);

                this.changePage(table);
                addArrow(this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[position], this.sortValue);
            },
            setTable(table) {
                let _this = this;
                if (!this._table) {
                    this._table = new MegaTable(this.$refs.table, {
                        className: 'table',
                        data: table,
                        clickHandler: function (cell, {col, row, data}) {
                            let byFieldsCount = _this.hydratedQuery.byFields.length;
                            if (_this.compareTime !== '' && _this.isChangeTable) {
                                if (row === 0) {
                                    let position = _this.hydratedQuery.measures.length !== 1
                                        ? byFieldsCount + 2 : byFieldsCount + 1;
                                    if (position === col) {
                                        _this.sortValue = _this.sortValue === 'asc' ? 'desc' : 'asc';
                                        _this.hydratedQuery.measures.forEach(list => {
                                            _this.$set(list, 'order', '');
                                        });
                                        _this.hydratedQuery.byFields.forEach(list => {
                                            _this.$set(list, 'order', '');
                                        });
                                        _this.pageNow = 1;
                                        _this.drawCompareTable();
                                    }
                                } else {
                                    if (_this.hydratedQuery.measures.length === 1) {
                                        if (_this.hydratedQuery.measures[0].userCountInside && col > byFieldsCount) {
                                            let compareIndex = data[row][byFieldsCount].compareIndex < 2
                                                ? data[row][byFieldsCount].compareIndex : 2;
                                            if (compareIndex !== 2) {
                                                let sliceDate = col === byFieldsCount + 1
                                                    ? '' : data[0][col].split('<br>')[compareIndex];
                                                let sliceByValues = _this.hydratedQuery.byFields
                                                    .map((list, index) => data[row][index]);

                                                if (sliceDate !== '-') {
                                                    _this.pushRouter(
                                                        _this.hydratedQuery.measures[0],
                                                        _this.queryName.measureNames[0],
                                                        compareIndex,
                                                        sliceDate,
                                                        sliceByValues,
                                                        data[row][col]
                                                    );
                                                }
                                            }

                                        }
                                    } else {
                                        let compareIndex = data[row][byFieldsCount].compareIndex < 2
                                            ? data[row][byFieldsCount].compareIndex : 2;
                                        if (data[row][byFieldsCount].userCountInside && col > byFieldsCount + 1) {
                                            let sliceDate = col === byFieldsCount + 2
                                                ? '' : data[0][col].split('<br>')[compareIndex];
                                            let sliceByValues = _this.hydratedQuery.byFields
                                                .map((list, index) => data[row][index]);
                                            if (sliceDate !== '-') {
                                                _this.pushRouter(
                                                    data[row][byFieldsCount].measures,
                                                    data[row][byFieldsCount].text,
                                                    compareIndex, sliceDate,
                                                    sliceByValues,
                                                    data[row][col]
                                                );
                                            }
                                        }
                                    }
                                }

                            } else {
                                if (!_this.isChangeTable) {//转置 按日期排序
                                    if (col === 0 && row === 0) {
                                        _this.sortValue = _this.sortValue === 'asc' ? 'desc' : 'asc';
                                        let table = orderByTime(_this._searchTable, _this.sortValue, _this.unit);
                                        _this.hydratedQuery.measures.forEach(list => {
                                            _this.$set(list, 'order', '');
                                        });
                                        _this.hydratedQuery.byFields.forEach(list => {
                                            _this.$set(list, 'order', '');
                                        });
                                        _this.changePage(table);
                                        _this.tableArrow();
                                        _this.pageNow = 1;
                                    } else {
                                        if (row === 0) {
                                            if (_this.hydratedQuery.measures.length !== 1) {
                                                let table = _this._searchTable;
                                                if (col !== 0) {
                                                    _this.sortValue = '';
                                                    addArrow(
                                                        _this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[0],
                                                        ''
                                                    );
                                                }
                                                if (byFieldsCount > 0) {
                                                    if (col === 1) {
                                                        _this.hydratedQuery.byFields[0].order =
                                                            _this.hydratedQuery.byFields[0].order === 'asc'
                                                                ? 'desc'
                                                                : 'asc';
                                                        _this.hydratedQuery.measures.forEach(list => {
                                                            _this.$set(list, 'order', '');
                                                        });
                                                        _this.pageNow = 1;
                                                        _this.isFetchAnalysisReport();
                                                    } else {
                                                        _this.hydratedQuery.byFields[0].order = '';
                                                        _this.hydratedQuery.measures.forEach((list, i) => {
                                                            if (i === col - 2) {
                                                                let order = list.order === 'asc' ? 'desc' : 'asc';
                                                                _this.$set(list, 'order', order);
                                                            } else {
                                                                _this.$set(list, 'order', '');
                                                            }
                                                        });

                                                        table = orderByNum(
                                                            col, _this._searchTable,
                                                            _this.hydratedQuery.measures[col - 2].order
                                                        );
                                                    }
                                                } else {
                                                    _this.hydratedQuery.measures.forEach((list, i) => {
                                                        if (i === col - 1) {
                                                            let order = list.order === 'asc' ? 'desc' : 'asc';
                                                            _this.$set(list, 'order', order);
                                                            table = orderByNum(
                                                                col, _this._searchTable,
                                                                _this.hydratedQuery.measures[col - 1].order,
                                                                _this.checkedTotal
                                                            );
                                                        } else {
                                                            _this.$set(list, 'order', '');
                                                        }
                                                    });
                                                }

                                                _this.changePage(table);
                                                // _this.currentTable = table;
                                                _this.tableArrow();

                                            }
                                        }
                                    }
                                } else {
                                    if (row === 0) {
                                        if (_this.hydratedQuery.measures.length === 1) {
                                            if (col === byFieldsCount) {//转置 按合计排序
                                                _this.sortValue = _this.sortValue === 'asc' ? 'desc' : 'asc';
                                                let table = orderByTotal(
                                                    byFieldsCount,
                                                    _this._searchTable,
                                                    _this.sortValue
                                                );
                                                _this.hydratedQuery.measures.forEach(list => {
                                                    _this.$set(list, 'order', '');
                                                });
                                                _this.hydratedQuery.byFields.forEach(list => {
                                                    _this.$set(list, 'order', '');
                                                });
                                                _this.changePage(table);
                                                // _this.currentTable = table;
                                                _this.tableArrow();
                                                addArrow(cell, _this.sortValue);
                                            } else if (col < byFieldsCount) {
                                                _this.sortValue = '';
                                                _this.hydratedQuery.byFields.forEach((list, i) => {
                                                    if (i === col) {
                                                        _this.$set(list, 'order', list.order === 'asc' ? 'desc' : 'asc');
                                                    } else {
                                                        _this.$set(list, 'order', '');
                                                    }
                                                });
                                                if (byFieldsCount !== 0) {
                                                    _this.isFetchAnalysisReport();
                                                }
                                            }
                                        } else {
                                            if (col === byFieldsCount + 1) {//转置 按合计排序
                                                _this.sortValue = _this.sortValue === 'asc' ? 'desc' : 'asc';
                                                let table = orderByTotal(
                                                    byFieldsCount + 1,
                                                    _this._searchTable,
                                                    _this.sortValue
                                                );
                                                _this.hydratedQuery.measures.forEach(list => {
                                                    _this.$set(list, 'order', '');
                                                });
                                                _this.hydratedQuery.byFields.forEach(list => {
                                                    _this.$set(list, 'order', '');
                                                });
                                                _this.changePage(table);
                                                _this.tableArrow();
                                                addArrow(cell, _this.sortValue);
                                            } else if (col < byFieldsCount) {
                                                _this.hydratedQuery.byFields.forEach((list, i) => {
                                                    if (i === col) {
                                                        _this.$set(list, 'order', list.order === 'asc' ? 'desc' : 'asc');
                                                    } else {
                                                        _this.$set(list, 'order', '');
                                                    }
                                                });
                                                _this.sortValue = '';
                                                _this.isFetchAnalysisReport();
                                            }
                                        }
                                    }

                                    // fix http://jira.qdum.com/browse/DMARTECH-1050
                                    // DMARTECH-1050 数据分析-事件分析：表中数据点击至非首页数据，点击表中任意位置，数据列表跳至首页，操作如gif
                                    // _this.pageNow = 1;
                                }


                                if (byFieldsCount === 0) {
                                    if (!_this.isChangeTable) {
                                        if (row !== 0) {
                                            if (_this.hydratedQuery.measures.length === 1) {
                                                if (_this.hydratedQuery.measures[0].userCountInside && col > 0) {
                                                    let sliceDate = _this.checkedTotal && row === 1 ? '' : data[row][0];
                                                    _this.pushRouter(
                                                        _this.hydratedQuery.measures[0],
                                                        _this.queryName.measureNames[0],
                                                        _this.compareIndex,
                                                        sliceDate,
                                                        [],
                                                        data[row][col]
                                                    );
                                                }
                                            } else {
                                                _this.hydratedQuery.measures.forEach((measures, measuresIdx) => {
                                                    if (measures.userCountInside) {
                                                        if (col === measuresIdx + 1) {
                                                            let sliceDate = _this.checkedTotal && row === 1
                                                                ? '' : data[row][0];
                                                            _this.pushRouter(
                                                                measures,
                                                                _this.queryName.measureNames[measuresIdx],
                                                                _this.compareIndex, sliceDate, [], data[row][col]
                                                            );
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    } else {
                                        if (row !== 0) {
                                            if (_this.hydratedQuery.measures.length === 1) {
                                                if (_this.hydratedQuery.measures[0].userCountInside) {
                                                    let sliceDate = col === 0 ? '' : data[0][col];
                                                    _this.pushRouter(
                                                        _this.hydratedQuery.measures[0],
                                                        _this.queryName.measureNames[0],
                                                        _this.compareIndex, sliceDate, [],
                                                        data[row][col]
                                                    );
                                                }
                                            } else {
                                                if (col > 0 && data[row][0].userCountInside) {
                                                    let sliceDate = col === 1 ? '' : data[0][col];
                                                    _this.pushRouter(
                                                        data[row][0].measures, data[row][0].text,
                                                        _this.compareIndex, sliceDate, [], data[row][col]
                                                    );
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    if (row !== 0 && col !== 0) {
                                        if (!_this.isChangeTable) {
                                            if (_this.hydratedQuery.measures.length === 1) {
                                                if (_this.hydratedQuery.measures[0].userCountInside) {
                                                    let sliceDate = _this.checkedTotal && row === 1 ? '' : data[row][0];
                                                    _this.pushRouter(
                                                        _this.hydratedQuery.measures[0],
                                                        _this.queryName.measureNames[0],
                                                        _this.compareIndex, sliceDate,
                                                        [data[0][col]],
                                                        data[row][col]
                                                    );
                                                }
                                            } else {
                                                _this.hydratedQuery.measures.forEach((measures, measuresIdx) => {
                                                    if (measures.userCountInside) {
                                                        if (col === measuresIdx + 2) {
                                                            _this.pushRouter(
                                                                measures, _this.queryName.measureNames[measuresIdx],
                                                                _this.compareIndex,
                                                                data[row][0],
                                                                [data[row][1]],
                                                                data[row][col]
                                                            );
                                                        }
                                                    }
                                                });
                                            }
                                        } else {
                                            if (_this.hydratedQuery.measures.length === 1) {
                                                if (_this.hydratedQuery.measures[0].userCountInside) {
                                                    let sliceByValues = _this.hydratedQuery.byFields
                                                        .map((list, index) => data[row][index]);
                                                    let sliceDate = col === 1 ? '' : data[0][col];
                                                    _this.pushRouter(
                                                        _this.hydratedQuery.measures[0],
                                                        _this.queryName.measureNames[0],
                                                        _this.compareIndex, sliceDate,
                                                        sliceByValues,
                                                        data[row][col]
                                                    );
                                                }
                                            } else {
                                                if (col > byFieldsCount) {
                                                    if (data[row][byFieldsCount].userCountInside) {
                                                        let sliceByValues = _this.hydratedQuery.byFields
                                                            .map((list, index) => data[row][index]);
                                                        let sliceDate = col === byFieldsCount + 1 ? '' : data[0][col];
                                                        let compareIndex = _this.compareTime !== ''
                                                            ? data[row][byFieldsCount].compareIndex : _this.compareIndex;
                                                        _this.pushRouter(
                                                            data[row][byFieldsCount].measures,
                                                            data[row][byFieldsCount].text,
                                                            compareIndex, sliceDate, sliceByValues,
                                                            data[row][col]
                                                        );
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });
                } else {
                    this._table.setData(table);
                }
                this.tableStyle(table);
            },
            // 筛选行、列
            searchKeyWord() {
                if (this.firstDateLength >= MAX_DATA_LENGTH) {
                    return this.isFetchAnalysisReport();
                }
                this.pageNow = 1;
                this.filterTable();
                if (this.compareTime !== '' && this.isChangeTable) {
                    this.drawCompareTable();
                } else {
                    this.drawTable();
                }
            },
            lazySearchKeyword: debounce(function () {
                this.searchKeyWord();
            }, 3000),
            clearKeyWord() {
                this.copyListKeyWord = '';
                this.searchKeyWord();
            },
            // 子组件修改的key数组
            childKeys(keyArr, rows) {
                this.seriesKeys = keyArr;
                // const newRows = Object.assign({}, this.graphData[0], {rollupRows: rows});
                // this.graphData.splice(0, 1, newRows);
                this.$set(this.graphData[0], 'rows', rows);
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "event-analysis";
    @import "../analysis";
</style>
