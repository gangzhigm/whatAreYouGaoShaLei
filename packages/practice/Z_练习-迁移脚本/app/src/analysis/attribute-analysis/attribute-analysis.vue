<template>
    <div class="content-container attribute-analysis">
        <div class="content-view">
            <div class="toolbar">
                <!--筛选条件改变后 运行 重新获取数据-->
                <button type="button" class="btn btn-sm btn-theme" @click="refresh" v-title="$t('eventAnalysis.run')">
                    {{'eventAnalysis.run' | t}}
                </button>
                <crumbs class="pull-left" />
                <span v-if="changeBms" class="toolbar-action" @click="checkoutBookmark">{{$t('eventAnalysis.restoreBookmark')}}</span>
                <div class="toolbar-btn" @click.self="bookmarkFormOpen = !bookmarkFormOpen" v-blur="closeBookmark">
                    <svg aria-hidden="true" @click="bookmarkFormOpen = !bookmarkFormOpen">
                        <use xlink:href="#icon-star"></use>
                    </svg>
                    {{$t('eventAnalysis.saveAsBookmark')}}
                    <bookmark-form v-if="bookmarkFormOpen" v-bind="bookmarkInfo" @change="updateBookmark" @hide="closeBookmark" />
                </div>
                <div class="toolbar-btn" v-blur="closeBookmarkLib" @click.self="bookmarkLibOpen = !bookmarkLibOpen">
                    <svg aria-hidden="true" @click="bookmarkLibOpen = !bookmarkLibOpen">
                        <use xlink:href="#icon-bookmarks"></use>
                    </svg>
                    {{'eventAnalysis.bookmarkLibrary' | t}}
                    <bookmark-library :options="bookmarks" v-if="bookmarkLibOpen" :value="bookmark.id" @hide="closeBookmarkLib" @choose="chooseBookmark" />
                </div>
                <span class="divider"></span>
                <button type="button" class="toolbar-btn" @click="refresh" v-title="$t('eventAnalysis.dataUpdateTime') + '：' + refreshDate + ' ' + refreshTime + '<br/>' + $t('eventAnalysis.refreshTip')">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-refresh"></use>
                    </svg>
                </button>
                <span class="divider"></span>
                <button type="button" class="toolbar-btn" :disabled="storeLoading" @click="downloadDetailFlag = true" v-title="$t('downloadDetails.download')">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-download"></use>
                    </svg>
                </button>
            </div>
        </div>
        <div class="attribute-analysis-content">
            <div class="content-view">
                <!-- 1/4 查询条件区 -->
                <div class="slider-menu" :class="{active: queryOpen}">
                    <div class="slider-menu-btn" @click="queryOpen = !queryOpen">
                        {{'eventAnalysis.setCondition' | t}}
                    </div>
                    <!--<scrolling-tips class="slider-menu-btn-tip" @click.native="closeSetting"></scrolling-tips>-->
                    <transition name="drop">
                        <div class="slider-menu-box" v-show="queryOpen">
                            <!-- 这是第一层 显示数据（指标） -->
                            <div class="tag">{{'eventAnalysis.display' | t}}</div>
                            <div class="filter-item menu-item" v-for="(measure, index) in measures" :key="index">
                                <!-- 固定选项："用户数"的id为0 -->
                                <measure-select :option-groups="measureOptionGroups" :attr-id="measure.attrId || 0" :aggreator="measure.aggreator" @select="chooseMeasure" />
                            </div>
                            <!-- 这是第二层 数组分组 -->
                            <div class="tag">{{'eventAnalysis.group' | t}}</div>
                            <div class="group-control menu-item">
                                <query-group :byFields="dataGroup" :options="byFieldOptionGroups" @change="chooseByField" @delete="deleteDateGroup" />
                                <button v-if="dataGroup && (dataGroup.length !== attrsAndGroups.length) || dataGroup.length === 0" type="button" class="add-ops-item icon icon-plus" @click="addDateGroup(dataGroup)">&nbsp;{{'eventAnalysis.group' | t}}
                                </button>
                            </div>
                            <!--这是第三层 过滤条件-->
                            <div class="tag">{{'eventAnalysis.filterCondition' | t}}</div>
                            <div class="ops-group menu-item">
                                <query-filter :groups="filterOptionGroups" :filter="filterList" @change="changeFilter" @update="changeFilter" />
                                <span class="icon icon-plus add-condition-action" @click="createFilter">&nbsp;{{'eventAnalysis.filterCondition' | t}}</span>
                            </div>
                        </div>
                    </transition>
                    <div class="pull-down" @click="queryOpen = !queryOpen">
                        <svg class="down-arrow" :class="[queryOpen ? 'turn-on' : 'turn-off']">
                            <use xlink:href="#icon-arrow-down"></use>
                        </svg>
                    </div>
                </div>
                <!-- 2/4 标题区 -->
                <h1 class="analysis-page-title" :title="bookmark.id ? bookmark.name : reportTitleName" v-text="bookmark.id ? bookmark.name : reportTitleName"></h1>
                <button type="button" class="analysis-page-title-edit" @click="editPageTitle" :title="$t('eventAnalysis.editTip')">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-pencil"></use>
                    </svg>
                </button>
                <p class="analysis-page-desc" :title="(bookmark && bookmark.desc) || $t('eventAnalysis.describe') + '……'" v-text="(bookmark && bookmark.desc) || $t('eventAnalysis.describe') + '……'"></p>

                <!-- 3/4 图形区 -->
                <analysis-chart ref="analysisChart" :chart-type.sync="chartType" @update:chartType="cacheToLocal(localCacheKey)" :title="reportTitleName" :graph-data="[allReportData]" :groups="byFields" :group-key.sync="groupKey" @update:groupKey="getReportDataList" :measures="selectedMeasureOptions" :measure-keys.sync="measureKeys" :series="dataSeries" :series-keys.sync="seriesKeys" @childKeys='childKeys' />
                <!-- 4/4 表格区 -->
                <div class="report-wrap">
                    <div class="table-wrap" v-if="firstDateLength > 0">
                        <div class="search-box md">
                            <input type="text" :placeholder="$t('attributeAnalysis.filterColumn')" v-model.trim="copyListKeyWord" @keyup.enter="immediatelySearch" @input="lazySearchKeyword()">
                            <svg aria-hidden="true" v-if="copyListKeyWord !== ''" @click="clearKeyWord('column')">
                                <use xlink:href="#icon-round-close"></use>
                            </svg>
                            <svg aria-hidden="true" @click="immediatelySearch">
                                <use xlink:href="#icon-search"></use>
                            </svg>
                        </div>
                        <div class="search-box md" v-if="dataGroup.length > 1">
                            <input type="text" :placeholder="$t('attributeAnalysis.filterLine')" v-model.trim="copyTitleKeyWord" @keyup.enter="immediatelySearch" @input="lazySearchKeyword()">
                            <svg aria-hidden="true" v-if="copyTitleKeyWord !== ''" @click="clearKeyWord('row')">
                                <use xlink:href="#icon-round-close"></use>
                            </svg>
                            <svg aria-hidden="true" @click="immediatelySearch">
                                <use xlink:href="#icon-search"></use>
                            </svg>
                        </div>
                        <table v-if="searchList.thead.length">
                            <thead :style="{width:`${theadWidth}%`}">
                                <tr>
                                    <th @click="sortTitleWord">
                                        {{title}}
                                        <div class="sort-box">
                                            <i class="top-i" :class="{checked:this.sortValue === 'asc'}"></i>
                                            <i class="bottom-i" :class="{checked:this.sortValue !== 'asc'}"></i>
                                        </div>
                                    </th>
                                    <th v-for="(item,idx) in searchList.thead" :key="idx" v-if="(pageNow - 1) * pageList <= idx && idx < pageNow * pageList">
                                        {{item[0] === '' ? '-' : item[0]}}
                                    </th>
                                </tr>
                            </thead>
                            <tbody :style="{width:`${100 - theadWidth}%`}">
                                <tr v-for="(item,index) in searchList.tbody" :key="index">
                                    <td :title="item.byValues">
                                        {{item.byValues.join(',') === '' ? '-' : item.byValues.join(',')}}
                                    </td>
                                    <td :class="searchList.tbody > 6 && 'max'" :style="{lineHeight:(dataGroup.length > 0 && dataGroup[0].attrGenre === 2) && idx > 0 && item.values[idx - 1][0][0] !== 0 && value[0][1] !== '-'?'14px':''}" v-for="(value,idx) in item.values" :key="idx" v-if="(pageNow - 1) * pageList <= idx && idx < pageNow * pageList">
                                        <p v-if="measures[0].attrId === '' && measures[0].aggreator === 'count' && value[0][0] !== '-'" class="router-p" @click="getSliceByValues(idx,item.byValuesOrigin,value[0][0])">
                                            {{value[0][0]}}
                                        </p>
                                        <p v-else>{{value[0][0]}}</p>
                                        <p v-if="(dataGroup.length > 0 && dataGroup[0].attrGenre === 2) && idx > 0 && item.values[idx - 1][0][0] !== 0 && value[0][1] !== '-'" :style="{color:value[0][1]<0?'#f06067':'#0cc2a9'}">
                                            {{value[0][1]}}%</p>

                                    </td>
                                </tr>
                                <tr v-if="searchList.tbody.length === 0">
                                    <td>{{'eventAnalysis.selectNothing' | t}}</td>
                                    <td v-for="(item,idx) in searchList.thead" :key="idx" v-if="(pageNow - 1) * pageList <= idx && idx < pageNow * pageList">--
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <list-search-empty v-if="!searchList.thead.length" />
                    </div>
                    <div class="page-box" v-if="searchList.thead.length > 0">
                        <span class="pages-text">{{'common.total' | t}} {{searchList.thead.length}} {{'eventAnalysis.line' | t}}，{{'attributeAnalysis.currentDisplay' | t}} {{(pageNow - 1) * pageList + 1}} - {{pageNow === totalPage ? searchList.thead.length : pageNow * pageList}} {{'eventAnalysis.line' | t}}</span>
                        <pager :now="pageNow" :total="totalPage" @page="pageNow= $event" />
                    </div>
                </div>
            </div>
            <back-top />
        </div>
        <!-- 书签名称、描述 - modal -->
        <modal :title="$t('eventAnalysis.modalTitle')" v-if="pageTitleEditing" @close="cancelPageTitleEdit">
            <div class="title-and-desc-form">
                <label for="title" class="label">{{'template.title' | t}}</label>
                <input class="input" :class="{error: pageTitleErr}" type="text" v-model.trim="pageTitle" id="title" :placeholder="$t('eventAnalysis.modalInput')" maxlength="30" v-title:top.warn.line="pageTitleErr">
                <br>
                <br>
                <label for="desc" class="label">{{'eventAnalysis.description' | t}}</label>
                <textarea class="textarea" v-model.trim="pageDesc" id="desc" :placeholder="$t('eventAnalysis.describe') + '……'" maxlength="255"></textarea>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')" @click="cancelPageTitleEdit">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" @click="savePageTitle">
            </template>
        </modal>
        <kudu-modal @kuduStau="kuduSta"></kudu-modal>
        <!--华为2.4.6下载详情-->
        <download-detail-modal v-if="downloadDetailFlag" :themeModules="'dataAnalysis'" :emailDownload="false" @cancel="cancelDownload" @okDownload="exportData"></download-detail-modal>
    </div>
</template>
<script>
import {
    QueryApi,
    WebServiceBookmarkApiV1,
    webServUserGroupApiV1,
    WebServAttrApiV1
} from '@/api';
import debounce from 'lodash/debounce';
import LINKS from '../../LINKS';
import { filterConditionFactory, isCompleteCondition } from '../components/query-filter-condition.vue';
import { ANALYSIS_STORE_NAME, KEY_PREFIXES } from '@/store/vuex/modules/analysisStore';
import cloneDeep from 'lodash/cloneDeep';
import BookmarkForm from '../bookmark/bookmark-form.vue';
import BookmarkLibrary from '../bookmark/bookmrak-library.vue';
import MeasureSelect from './measure-select.vue';
import { FETCH_BOOKMARKS } from '@/store/vuex/actionTypes';
import downCsv from '@/common/utils/downloadUtils';
import { AGGREATOR_OPTIONS_MAP } from '../chart/chartConfig';
import { COMMON_NAME_REGEXP } from '@/common/utils/regs';

import QueryFilter from '../components/query-filter.vue';
import QueryGroup from '../components/query-group.vue';
import { ADD_BOOKMARK, CLOSE_SEARCH, UPDATE_BOOKMARK } from '@/store/vuex/mutationTypes';
import AnalysisChart from '../analysis-chart.vue';
import { stringify } from '@/common/utils/json';
import { trackEvent } from '@/monitor';
import KuduModal from '../kudumodal.vue';
import { mapState, mapActions, mapMutations } from 'vuex';

const pageList = 9;

// 表格行列筛选功能使用
const lazySearchKeyword = debounce(function (async) {
    this.searchKeyWord(async);
}, 3000);

export default {
    components: {
        AnalysisChart,
        BookmarkLibrary,
        BookmarkForm,
        MeasureSelect,
        QueryFilter,
        QueryGroup,
        KuduModal
    },
    data () {
        return {
            pageList,
            firstAjax: true,
            firstDateLength: 0,
            // 书签表单 显示/隐藏
            bookmarkFormOpen: false,
            // 书签列表 显示/隐藏
            bookmarkLibOpen: false,
            // 查询条件 展开/收起
            queryOpen: false,
            // 查询条件之一：指标
            measures: [
                {
                    aggreator: 'count',   //count,uniqCount,sum,avg,max,min
                    attrId: '',
                    attrType: '',    //用户：user, 首次：first, 分群：group
                    eventId: '',     //对应的事件id
                    userGroupInfo: {}, //分群信息
                    attrName: this.$t('eventAnalysis.userAmount'),
                }
            ],
            // 查询条件之二：数据分组(按xx查看)
            dataGroup: [],
            // 查询条件之三：过滤条件(筛选条件)
            filterList: {
                conditions: [],
                relation: 'and'
            },
            userAttrs: [],
            userGroups: [],
            // 数据表格 - 查询关键字
            listKeyWord: '',
            copyListKeyWord: '',
            listKeyWordCache: '',
            titleKeyWord: '',
            copyTitleKeyWord: '',
            titleKeyWordCache: '',
            // 书签标题、描述
            pageTitle: '',
            pageTitleEditing: false,
            pageTitleErr: '',
            pageDesc: '',
            // 图形区条件之三：echarts类型
            chartType: 'line',
            groupKey: '',   // 选择显示的分组key
            measureKeys: {  // 选择显示的指标keys
                left: [],
                right: []
            },
            seriesKeys: [], // 选择显示的数据系列 keys
            allData: {
                theadObj: {
                    xGroupList: []
                },
                tbodyObj: {
                    bodyTitle: [],
                    xGroupList: []
                },
            },
            pageNow: 1,
            // 所有数据
            allReportData: {},
            isSendSearchKeyWord: false,
            // 升序降序
            sortValue: 'asc',
            // 画布
            myChart: null,
            // 更新显示时间
            refreshTime: '',
            refreshDate: '',
            pieSlice: '', // 数据切片

            downloadDetailFlag: false,
            downloadInfo: {
                formatType: '',
                dataFormat: ''
            },
            kuduStatus: '', //kudu数据库状态
        };
    },
    computed: {
        ...mapState({
            isDropdownSearch: state => state[ANALYSIS_STORE_NAME].isDropdownSearch,
            userId: state => state.user.cid,
            storeBookmarks: state => state[ANALYSIS_STORE_NAME].bookmarks,
            storeLoading: state => state.loading
        }),
        title () {
            if (!this.dataGroup.length) {
                return this.$t('eventAnalysis.userAmount');
            }
            let obj = this.measureOptions.find(list => list.id === this.dataGroup[0].attrId);
            return obj ? (obj.name || obj.attrName) : '';
        },
        localCacheKey () {
            return this.userId + 'ATTRIBUTE_ANALYSIS_CACHE';
        },
        // 不同下拉分组列表
        dataSeries () {
            const zeroByFields = this.dataGroup.length === 0;
            const dataRows = ((this.chartType === 'pie' || this.chartType === 'ring' || this.chartType === 'map') ? this.allReportData.rollupRows : this.allReportData.rows) || [];
            const options = dataRows
                .map((item, index) => ({
                    id: index,
                    name: (zeroByFields || item.byValues.length === 0) ? this.$t('eventAnalysis.total') : item.byValues.join(','),
                }));
            if (options.length === 0) options.push({ name: this.$t('eventAnalysis.total'), id: 0 });
            return options;
        },
        // 纬度list
        byFields () {
            return this.dataGroup
                .filter(({ attrId }) => !!attrId)
                .map(({ attrId }) => this.measureOptions.$getByKey(attrId));
        },
        searchList () {
            let theadSource = this.allData.theadObj;
            let tbodySource = this.allData.tbodyObj;
            let filterList = [];

            let thead = theadSource.xGroupList.slice(),
                tbody = tbodySource.bodyTitle.slice();

            if (this.listKeyWord) {
                thead = thead.filter((item, idx) => {
                    item[0] = String(item[0]);
                    if (item[0].indexOf(this.listKeyWord) === -1) {
                        filterList.push(idx);
                        return false;
                    }
                    return true;
                });
                tbody.forEach((item, i) => {
                    tbody[i] = Object.assign({}, item, {
                        values: item.values.filter((e, index) => filterList.indexOf(index) === -1)
                    });
                });
            }
            if (this.titleKeyWord && tbody.length && tbody[0].byValues.length > 0) {
                tbody = tbody.filter(item => {
                    let str = item.byValues.join(',');
                    return str.indexOf(this.titleKeyWord) !== -1;
                });

            }
            //记录请求数据时的时间
            let refDate = new Date();
            let refreshYear = refDate.getFullYear();
            let refreshMonth = refDate.getMonth() + 1;
            let refreshDay = refDate.getDate();
            let refreshHours = refDate.getHours();
            let refreshMinutes = refDate.getMinutes();
            let refreahSeconds = refDate.getSeconds();
            this.refreshDate = `${refreshYear}-${refreshMonth}-${refreshDay}`;
            this.refreshTime = `${refreshHours < 10 ? `0${refreshHours}` : refreshHours}:${refreshMinutes < 10 ? `0${refreshMinutes}` : refreshMinutes}:${refreahSeconds < 10 ? `0${refreahSeconds}` : refreahSeconds}`;
            return {
                thead: thead, tbody: tbody
            };
        },
        totalPage () {
            return Math.ceil(this.searchList.thead.length / this.pageList);
        },
        theadWidth () {
            if (this.searchList.tbody.length > 6) {
                return 20;
            } else if (this.searchList.tbody.length === 2) {
                return 45;
            } else if (this.searchList.tbody.length === 0) {
                return 50;
            }
            return 100 / (this.searchList.tbody.length + 1);
        },
        //图表的标题名字
        reportLastTitle () {
            if (this.measures === null || this.measures === undefined) return '';

            let measure = this.measures[0];

            if (!measure) return '';

            if (measure.attrName === this.$t('eventAnalysis.userAmount')) {
                return this.$t('eventAnalysis.userAmount');
            }
            let aggreators = AGGREATOR_OPTIONS_MAP[1];
            let targetAggreator = aggreators.find(aggreator => aggreator.id === measure.aggreator);
            let targetList = measure.attrType === 'user'
                ? this.measureOptionGroups[0].options
                : this.measureOptionGroups[1].options;
            let targetAttr = targetList.find((elm) => elm.id === measure.attrId);
            return `${targetAttr ? targetAttr.name : ''} ${this.$t('eventAnalysis.of')} ${targetAggreator ? targetAggreator.name : ''}`;
        },
        //图表的标题名字
        reportTitleName () {
            if (this.dataGroup === null || this.dataGroup === undefined) return '';
            let names = this.dataGroup
                .map(group => {
                    // fixme 应该使用 key 而不是 id
                    const attrOrGroup = this.attrsAndGroups.find(item => item.id === group.attrId);
                    return attrOrGroup ? attrOrGroup.name : '';
                })
                .join(this.$t('punctuation.comma'));

            return names
                ? `${this.$t('eventAnalysis.accordingTo')} ${names} ${this.$t('eventAnalysis.check')} ${this.reportLastTitle}`
                : this.reportLastTitle;
        },
        bookmarkInfo () {
            let byFields = cloneDeep(this.sendDataObj.byFields)
                .map(list => {
                    delete list.order;
                    return list;
                });
            return {
                filterStr: {
                    chartType: this.chartType,          // 图形
                    listKeyWord: this.listKeyWord,      // 关键字
                    titleKeyWord: this.titleKeyWord,    // 关键字
                    groupKey: this.groupKey,            // 图形展示组件选了那个分组的 Key，线图的 X轴
                    measureKeys: this.measureKeys,      // 图形展示组件选了那些指标的 keys, 线图的 Y轴
                    seriesKeys: this.seriesKeys         // 图形展示组件选了哪些数据系列 keys, 线图中有哪几条线
                },
                query: {
                    byFields,
                    ...this.sendDataObj,
                    pieSlice: this.pieSlice
                },
                headerBookMarkName: this.bookmark.name,
                desc: this.bookmark.id ? this.bookmark.desc : this.pageDesc,
                bookMarkId: this.bookmark.id,
                type: 0
            };
        },
        bookmarks () {
            return this.storeBookmarks.filter(list => list.type === 0);
        },
        bookmark () {
            if (this.$route.query.bmsId) {
                let bookmarkId = Number(this.$route.query.bmsId);
                let bookmark = this.bookmarks.find(bookmark => bookmark.id === bookmarkId);
                if (bookmark) {
                    return bookmark;
                }
                if (this.bookmarks.length !== 0) {
                    console.warn(`属性分析：没有找到 ID 为 ${bookmarkId} 的书签`);
                }
                return {};
            }
            return {};
        },
        changeBms () {
            if (this.bookmark.id) {
                let sQuery = JSON.parse(this.bookmark.conditionStr);
                let sFilterStr = JSON.parse(this.bookmark.filterStr);
                let blackListKeys = ['byFieldsFilter', 'listKeyWord', 'titleKeyWord', 'order'];
                let slicePie = this.$refs.analysisChart
                    && sQuery.pieSlice
                    && this.$refs.analysisChart.cutData !== sQuery.pieSlice;
                return slicePie
                    || stringify(sQuery, blackListKeys) !== stringify(this.bookmarkInfo.query, blackListKeys)
                    || stringify(sFilterStr, blackListKeys) !== stringify(this.bookmarkInfo.filterStr, blackListKeys);
            }
            return false;
        },
        // 指标可选项
        measureOptionGroups () {
            return [
                { title: this.$t('eventAnalysis.userAttribute'), icon: 'user-attr', options: this.userAttrs },
                { title: this.$t('home.userGroup'), icon: 'user-group', options: this.userGroups }
            ];
        },
        // 分组可选项，分组的选项不能重复选择
        byFieldOptionGroups () {
            let groups = cloneDeep(this.filterOptionGroups);
            const selectedIds = this.dataGroup.map(group => group.attrId);
            groups.forEach(group => {
                group.options.forEach(option => {
                    option.disabled = selectedIds.includes(option.id);
                });
            });
            return groups;
        },
        // 筛选条件可选项
        filterOptionGroups () {
            return [
                {
                    title: this.$t('eventAnalysis.userAttribute'),
                    icon: 'user-attr',
                    options: this.userAttrs.slice(1)
                },
                { title: this.$t('home.userGroup'), icon: 'user-group', options: this.userGroups },
            ];
        },
        // 指标所有可选项的列表，包括"用户数"
        measureOptions () {
            return this.userAttrs.concat(this.userGroups);
        },
        selectedMeasureOptions () {
            return this.measures
                .map((measure, measureIndex) => {
                    const measureOption = this.measureOptions.find(option =>
                        option.id === measure.attrId
                        || (option.id === 0 && measure.attrId === '') // 用户数
                    );
                    if (measureOption) {
                        return Object.assign({}, measureOption, { id: measureIndex, name: this.reportLastTitle });
                    }
                    return false;
                })
                .filter(o => o);
        },
        // 用户属性、用户分群列表，不包括"用户数"
        attrsAndGroups () {
            return this.measureOptions.slice(1);
        },
        sendDataObj () {
            let filter = cloneDeep(this.filterList);
            filter.conditions = filter.conditions.filter(isCompleteCondition);

            // 分组列表中的第一项，会用来给数据分组(线图的X轴)，所以这里要调整顺序，把 groupKey 选中的项目放在数组第一位
            let byFields = this.dataGroup.filter(group => !!group.attrId);
            byFields = byFields.$deleteByKey(this.groupKey)
                .concat(byFields);

            return {
                byFieldsFilter: [this.listKeyWord, this.titleKeyWord],
                byFields,
                cid: this.userId,
                filter: filter,
                measures: this.measures.filter(measure => measure.attrId || measure.aggreator)
            };
        }
    },
    created () {
        if (this.isDropdownSearch) {
            this.queryOpen = this.isDropdownSearch;
        }
        this.CLOSE_SEARCH();
    },
    async mounted () {
        await this.FETCH_BOOKMARKS();
        await Promise.all([this.getUserAttributes(), this.getUserGroupList()]);

        // 1. 读取时间戳对应的数据
        if (this.$route.query.timeStamp) {
            let key = this.$route.query.timeStamp === this.LOCAL_CACHE_KEY + '_USER'
                ? this.LOCAL_CACHE_KEY
                : this.$route.query.timeStamp;
            this.getLocalStorageData(key);
            this.$router.replace({ path: '/attribute' });
        } else if (this.$route.query.bmsId) {
            // 2. 点击书签管理的选项跳转到这
            this.checkoutBookmark();
        } else if (localStorage.getItem(this.localCacheKey)) {
            // 3. 读取localStorage的数据还原页面
            let eventObj = JSON.parse(localStorage.getItem(this.localCacheKey));
            if (this.$route.query.bmsId) {
                if (Number(eventObj.bookmarkId) === Number(this.$route.query.bmsId)) {
                    this.getLocalStorageData(this.localCacheKey);
                } else {
                    this.checkoutBookmark();
                }
            } else {
                this.getLocalStorageData(this.localCacheKey);
            }
        } else {
            // 4. 既没有书签、也没有本地缓存，第一次进入页面
            this.refresh();
        }

    },
    beforeRouteUpdate (to, from, next) {
        if (from.query.bmsId && !to.query.bmsId) {
            // 删除了书签
            localStorage.removeItem(this.localCacheKey);
            this.dataGroup = [];
            this.chartType = 'line';
            this.filterList = {
                relation: 'and',
                conditions: []
            };
            this.chooseMeasure({ id: 0 });  // 指标选中默认项目
            next();
        } else if (from.query.bmsId && this.changeBms) {
            this.leaveGuard(next, to);
        } else {
            next();
        }
    },
    beforeRouteLeave (to, from, next) {
        if (this.changeBms) {
            this.leaveGuard(next, to);
        } else {
            next();
        }
    },
    beforeDestroy () {
        window.removeEventListener('beforeunload', this.leaveGuard);
    },
    watch: {
        '$route.query.bmsId' (newId) {
            if (newId)
                this.checkoutBookmark();
        }
    },
    methods: {
        ...mapMutations([
            CLOSE_SEARCH,
            ADD_BOOKMARK,
            UPDATE_BOOKMARK
        ]),
        ...mapActions([
            FETCH_BOOKMARKS
        ]),
        // 从子组件中获取kudu数据库的状态值
        kuduSta (data) {
            this.kuduStatus = data;
        },
        leaveGuard (nextOrEvent, to) {
            const confirmationMessage = `${this.$t('eventAnalysis.bookMark')}「${this.bookmark.name}」${this.$t('eventAnalysis.bookMarkEdit')}`;
            if (typeof nextOrEvent === 'function') {
                if (to.name === 'attributeUserList') {
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
        chooseBookmark (id) {
            this.$router.push({ name: 'attribute', query: { bmsId: id } });
        },
        updateBookmark (bookmark) {
            if (bookmark.id) {
                // 更新或新建
                this.$router.push({ name: 'attribute', query: { bmsId: bookmark.id } });
            } else {
                // 删除在beforeRouteUpdate里处理
            }
        },
        // 改变过滤条件filterList
        changeFilter (newFilter) {
            this.$refs.analysisChart.cutData = '';
            this.filterList = newFilter;
            // this.refresh();
        },
        //下载文件的名称
        getCsvName () {
            //获取当前日期
            let time = new Date();

            function timeFormat (value) {
                return value > 9 ? value : '0' + value;
            }

            let nowDay = time.getFullYear() + '-' + timeFormat(time.getMonth() + 1) + '-' + timeFormat(time.getDate());

            //去除特殊的字符
            function replaceSpecialStr (str) {
                let str1 = str.replace(/['"\\/\b\f\n\r\t]/g, '');
                let str2 = str1.replace(/[|*:"<>?]/g, '');
                return str2;
            }

            if (!this.bookmark.id) {
                if (this.downloadInfo.formatType === 'Excel') {
                    return replaceSpecialStr(this.reportTitleName) + nowDay + '.xls';
                }
                if (this.downloadInfo.dataFormat === 'utf8') {
                    return replaceSpecialStr(this.reportTitleName) + nowDay + 'utf8.csv';
                }
                return replaceSpecialStr(this.reportTitleName) + nowDay + 'gb18030.csv';
            }
            if (this.downloadInfo.formatType === 'Excel') {
                return replaceSpecialStr(this.bookmark.name) + nowDay + '.xls';
            }
            if (this.downloadInfo.dataFormat === 'utf8') {
                return replaceSpecialStr(this.bookmark.name) + nowDay + 'utf8.csv';
            }
            return replaceSpecialStr(this.bookmark.name) + nowDay + 'gb18030.csv';
        },
        //跳转到user-list时的操作
        getSliceByValues (index, title, value) {
            let theadActive = this.searchList.thead[index][1];
            let theadTitle = this.searchList.thead[index][0];
            let titleList = this.byFields.map(byField => byField.name);
            let queryObj = {
                sliceByValues: [theadActive, ...title],
                sliceByTitle: [theadTitle, ...title],
                titleList,
                bookmarkName: this.bookmark.name,
                value
            };
            this.cacheToLocal(this.localCacheKey + '_USER', queryObj);
            this.$router.push({
                name: 'attributeUserList',
                query: {
                    'timeStamp': this.localCacheKey + '_USER'
                }
            });
        },
        //页面刷新事件
        refresh () {
            this.listKeyWord = '';
            this.titleKeyWord = '';
            this.copyListKeyWord = '';
            this.copyTitleKeyWord = '';
            if (this.sendDataObj.measures.length > 0) {
                // this.firstAjax = true;
                this.getReportDataList();
            }
        },
        // 关闭书签表单
        closeBookmark () {
            this.bookmarkFormOpen = false;
        },
        // 关闭书签列表
        closeBookmarkLib () {
            this.bookmarkLibOpen = false;
        },
        // 得到用户属性
        getUserAttributes () {
            this.$loading();
            return WebServAttrApiV1
                .getAttributesAuth({ attrType: 0, isFilter: '', isResult: '',isDataAnalysis:true })
                .then(res => {
                    this.userAttrs = res.body.data.attributeList
                        .map(item => Object.assign(
                            item,
                            {
                                name: item.meaning,
                                key: KEY_PREFIXES.USER_ATTR + item.id,
                                disabled: false,
                                type: 'user',
                            }
                        ));
                    // 固定选项"用户数" id === 0
                    this.userAttrs.unshift({
                        id: 0,
                        key: KEY_PREFIXES.USER_ATTR + 0,
                        name: this.$t('eventAnalysis.userAmount'),
                        attrGenre: 1,
                        disabled: false,
                        type: 'user'
                    });
                    this.$loaded();
                })
                .catch(() => {
                    this.$loaded();
                });
        },
        // 得到用户分群
        getUserGroupList () {
            this.$loading();
            return webServUserGroupApiV1
                .getUserGroups()
                .then(res => {
                    this.userGroups = res.body.data.userGroupList
                        .filter(group => group.enable)
                        .map(item => ({
                            key: KEY_PREFIXES.USER_GROUP + item.id,
                            attrGenre: 4, // 布尔类型
                            attrType: 'group',
                            type: 'group',
                            disabled: false,
                            ...item
                        }));
                    this.$loaded();
                })
                .catch(() => {
                    this.$loaded();
                });
        },
        // 选择用户属性、对属性的操作
        chooseMeasure (attr, aggreator) {
            this.$refs.analysisChart.cutData = '';
            if (attr.id === 0) { // 固定选项："用户数"
                this.measures = [{
                    aggreator: 'count',
                    attrId: '',
                    attrType: '',
                    eventId: '',
                    attrGenre: '',
                    userGroupInfo: {},
                    attrName: this.$t('eventAnalysis.userAmount'),
                }];
            } else {
                this.measures[0].aggreator = aggreator.id;
                this.measures[0].attrId = attr.id;
                this.measures[0].attrType = attr.attrType || attr.type;  // 用户：user, 分群：group
                this.measures[0].eventId = attr.id;     //对应的事件id 首次时间才填写
                this.measures[0].userGroupInfo = attr.key.includes(KEY_PREFIXES.USER_GROUP) ? { id: attr.id } : {};
                this.measures[0].attrName = attr.name;
            }
            // this.refresh();
        },
        //增加数据分组
        addDateGroup (list) {
            //2.添加数据分组
            let item = {
                id: (new Date()).getTime(),
                attrGenre: '',  //属性类型
                attrId: '',     //属性ID ,只有用户、首次两种属性有属性id
                attrType: '',   //属性类型 ,用户：user, 首次：first, 分群：group
                collect: false,    //是否对该字段进行汇总
                eventId: '',     //事件对应的id, 当查看的是用户首次类型时，填对应的事件id,其他不填
                numberInterval: [],//数字汇总区间,[13,30,45]
                numberType: 'default', //数值的类型 代表是默认、取整、自定义区间
                numberPrecision: '',  //数值精度
                timePrecision: 'default',//查看的时间单位,minute,hour,day,week,month,quarter,year
                userGroupInfo: { //分群信息
                    id: ''
                },
                attrName: '', //选项名称
            };
            list.push(item);
        },
        //删除数据分组
        deleteDateGroup ({ index, target }) {
            //3.删除数据分组时
            this.dataGroup.splice(index, 1);
            if (target.attrId !== '') {// 存储存在的分组
                this.$nextTick(() => {
                    if (this.byFields.length === 0) {
                        this.groupKey = '';
                    } else {
                        if (this.groupKey === '' || this.groupKey === target.attrId) {
                            this.groupKey = this.byFields[0].id;
                        }
                    }
                    // this.refresh();
                });
            }
        },
        // 分组change
        chooseByField (newField) {
            const changingGroupKey = this.byFields[newField.position]
                && this.byFields[newField.position].id === this.groupKey;
            this.$set(this.dataGroup, newField.position, newField.group);
            this.$nextTick(() => {
                if (this.groupKey === '' && this.byFields.length !== 0) {
                    this.groupKey = this.byFields[0].id;
                } else if (changingGroupKey) {
                    this.groupKey = this.byFields[newField.position].id;
                }
                // this.refresh();
            });
        },
        // 这三层 增加过滤条件
        createFilter () {
            let obj = filterConditionFactory();
            const firstAvailableOption = this.attrsAndGroups.length ? this.attrsAndGroups[0] : null;
            if (firstAvailableOption) {
                obj.attrGenre = firstAvailableOption.attrGenre;
                obj.field.attrId = firstAvailableOption.id;
                obj.key = firstAvailableOption.key;
                obj.function = firstAvailableOption.attrGenre === 2 ? 'collect' : 'equal';
                obj.format = 'day';
                obj.type = firstAvailableOption.type;
                obj.numberPrecision = firstAvailableOption.attrLength;
            }
            this.filterList.conditions.push(obj);
        },
        // 请求报表数据
        getReportDataList: debounce(function () {
            if (this.kuduStatus === 1) {
                this.pageNow = 1;
                this.$loading();
                QueryApi
                    .getReportData(this.sendDataObj)
                    .then(({ body: { data } }) => {
                        data.rollupRows = data.totalRows;
                        delete data.totalRows;
                        this.$loaded();
                        // let wsortData = JSON.parse(JSON.stringify(data)).rollupRows;
                        // wsortData.sort(function(a, b){
                        //     return a.value - b.value;
                        // });
                        this.allReportData = JSON.parse(JSON.stringify(data));
                        // this.allReportData.rollupRows = wsortData;
                        // 显示分组，默认选前十个，最多选中全部
                        this.$nextTick(() => {
                            // 书签中没有选择显示分组
                            const noSeriesKeysInBookmark = this.bookmark.id
                                && JSON.parse(this.bookmark.filterStr).seriesKeys.length === 0;

                            // 自动选择显示分组是否必要
                            // 当前没选择任何显示分组、且排除空选书签第一次发请求的特例
                            const autoCompleteNecessary = this.seriesKeys.length === 0 //
                                && !(this.firstAjax && noSeriesKeysInBookmark); // 进入页面的第一次请求，且书签中没有选择显示分组
                            const dataRows = this.chartType === 'pie' || this.chartType === 'ring' || this.chartType === 'map'
                                ? this.allReportData.rollupRows
                                : this.allReportData.rows;

                            if (autoCompleteNecessary) {
                                this.seriesKeys = dataRows
                                    .slice(0, Math.min(dataRows.length, 20))
                                    .map((n, index) => index);
                            } else if (this.seriesKeys.length > dataRows.length) {
                                // 所选数量不能超过可选数量
                                this.seriesKeys = dataRows.map((n, index) => index);
                            }

                            if (this.pieSlice && this.firstAjax) {
                                this.$refs.analysisChart.cutData = this.pieSlice;
                                this.$refs.analysisChart.fathData();
                            }
                            this.firstAjax = false;
                        });

                        //表示当前返回的是否是全部的数据 true代表是部分 false代表是全部
                        if (data.truncated) {
                            this.$toast(this.$t('attributeAnalysis.partialData'), 'success');
                            this.titleKeyWordCache = '';
                            this.listKeyWordCache = '';
                        } else {
                            this.titleKeyWordCache = this.titleKeyWord;
                            this.listKeyWordCache = this.listKeyWord;
                        }
                        //表格的数据
                        this.getTableData(data);
                        //图形的数据
                        this.drawChart();
                        if (this.firstAjax) {
                            this.firstDateLength = this.allReportData.rows.length;
                        }
                    })
                    .catch(() => {
                        this.$loaded();
                    });
                window.addEventListener('beforeunload', this.leaveGuard);
            }
        }, 100),
        //将当前的选项保存在本地localStorage
        cacheToLocal (localObjectName, queryObj) {
            let sendObj = {
                byFields: this.dataGroup,
                filter: this.filterList,
                measures: this.measures,
                cid: this.userId
            };
            let localObject = {
                bookmarkId: this.bookmark.id,  //书签id
                chartType: this.chartType,  //图形
                listKeyWord: '', //关键字
                titleKeyWord: '', //关键字
                groupKey: this.groupKey,            // 图形展示组件选了那个分组的 Key，线图的 X轴
                measureKeys: this.measureKeys,      // 图形展示组件选了那些指标的 keys, 线图的 Y轴
                seriesKeys: this.seriesKeys,        // 图形展示组件选了哪些数据系列 keys, 线图中有哪几条线
                sendDataObj: sendObj,
                queryObj: queryObj,  //跳转到userList页面的时候需要的参数
                userListData: {}
            };
            localStorage.setItem(localObjectName, JSON.stringify(localObject));
            if (Number(this.bookmark.id) === Number(this.$route.query.bmsId) && !this.changeBms) {
                localStorage.removeItem(this.localCacheKey);
            }
        },
        //图形的数据
        drawChart () {
            this.$nextTick(() => {
                if (this.$refs.analysisChart)
                    this.$refs.analysisChart.drawChart();
                // 将选项保存在本地
                this.cacheToLocal(this.localCacheKey);
            });
        },
        //表格的数据
        getTableData (data) {
            //列标题和x轴
            data.series = data.seriesOrigin.map((item, index) => {
                return [data.series[index], item];
            });

            this.allData.theadObj.xGroupList = data.series;
            this.allData.tbodyObj.bodyTitle = data.rows;
            //这是表头部分
            if (data.byFields.length > 0) {
                // numb
            }
            if (data.series.length === 0 && data.rows.length === 1) {
                data.series.push([this.$t('eventAnalysis.total'), '']);
                this.allData.theadObj.xGroupList = data.series;
            }
            if (data.rows.length === 1) {
                this.searchList.tbody[0].byValues.push(this.$t('attributeAnalysis.amount'));
            }
        },
        editPageTitle () {
            this.pageTitle = this.bookmark.id ? this.bookmark.name : this.reportTitleName;
            this.pageDesc = this.bookmark.id ? this.bookmark.desc : '';
            this.pageTitleEditing = true;
        },
        cancelPageTitleEdit () {
            this.pageTitle = '';
            this.pageTitleErr = '';
            this.pageDesc = '';
            this.pageTitleEditing = false;
        },
        // 编辑了页面标题(书签名称)后，点击了保存按钮，保存(或者更新)书签
        savePageTitle () {
            if (this.pageTitle === '') {
                this.pageTitleErr = this.$t('eventAnalysis.validNameDataNone');
                return false;
            }
            if (!COMMON_NAME_REGEXP.test(this.pageTitle)) {
                this.pageTitleErr = `${this.$t('eventAnalysis.bookMarkName')}${this.$t('common.nameSpecial')}`;
                return false;
            }
            this.pageTitleErr = '';
            if (!this.bookmark.id) {
                let byFields = cloneDeep(this.sendDataObj.byFields)
                    .map(list => {
                        delete list.order;
                        return list;
                    });
                this.$loading();
                WebServiceBookmarkApiV1
                    .createBookmark({
                        cid: this.userId,
                        conditionStr: JSON.stringify({
                            byFields,
                            ...this.sendDataObj
                        }),
                        filterStr: JSON.stringify({
                            chartType: this.chartType,          // 图形
                            listKeyWord: this.listKeyWord,      // 关键字
                            titleKeyWord: this.titleKeyWord,    // 关键字
                            groupKey: this.groupKey,            // 图形展示组件选了那个分组的 Key，线图的 X轴
                            measureKeys: this.measureKeys,      // 图形展示组件选了那些指标的 keys, 线图的 Y轴
                            seriesKeys: this.seriesKeys         // 图形展示组件选了哪些数据系列 keys, 线图中有哪几条线
                        }),
                        name: this.pageTitle,
                        desc: this.pageDesc,
                        type: 0, // 属性分析的书签
                        overviewIds: []
                    })
                    .then(({ body: { data: { bookmark } } }) => {
                        trackEvent('数据分析-属性分析-添加书签');
                        // 1. update rootStore
                        this.ADD_BOOKMARK(bookmark);
                        // 2. update route
                        this.$router.replace({ name: 'attribute', query: { bmsId: bookmark.id } });
                        // 3. close modal
                        this.pageTitle = '';
                        this.pageTitleEditing = false;
                        this.pageDesc = '';
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            } else {
                let newBookmark = cloneDeep(this.bookmark);
                newBookmark.name = this.pageTitle;
                newBookmark.desc = this.pageDesc;
                this.$loading();
                WebServiceBookmarkApiV1
                    .updateBookmark(newBookmark)
                    .then(({ body: { data: { bookmark } } }) => {
                        trackEvent('数据分析-属性分析-修改书签');
                        // 1. update rootStore
                        this.UPDATE_BOOKMARK(bookmark);
                        // 2. close modal
                        this.pageTitle = '';
                        this.pageTitleEditing = false;
                        this.pageDesc = '';
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            }
        },
        changeReportType (type) {
            this.chartType = type;
            this.drawChart();
        },
        //得到书签详情
        checkoutBookmark () {
            this.$loading();
            this.$nextTick(() => {
                let { conditionStr, filterStr } = this.bookmark;
                let obj = JSON.parse(conditionStr);
                let bookmarkFilter = JSON.parse(filterStr);
                // 调接口数据概览自己的类型,若类型为空，则默认设置为线图
                this.chartType = bookmarkFilter.chartType || 'line';
                this.bookmarkLibOpen = false;
                //表示从书签请求的数据
                this.titleKeyWord = bookmarkFilter.titleKeyWord;
                this.listKeyWord = bookmarkFilter.listKeyWord;
                this.copyListKeyWord = this.listKeyWord;
                this.copyTitleKeyWord = this.titleKeyWord;
                this.groupKey = bookmarkFilter.groupKey;            // 图形展示组件选了那个分组的 Key，线图的 X轴
                this.measureKeys = bookmarkFilter.measureKeys;      // 图形展示组件选了那些指标的 keys, 线图的 Y轴
                this.seriesKeys = bookmarkFilter.seriesKeys;         // 图形展示组件选了哪些数据系列 keys, 线图中有哪几条线
                this.dataGroup = obj.byFields;
                this.filterList = obj.filter;
                this.measures = obj.measures;
                this.pieSlice = obj.pieSlice;
                if (this.measures) {
                    //非undefined
                    if (!this.measures[0].attrName) {
                        this.$set(this.measures[0], 'attrName', this.$t('eventAnalysis.userAmount'));
                    }
                } else {
                    //undefined
                    this.measures = [{
                        aggreator: 'count',
                        attrId: '',
                        attrType: '',
                        userGroupInfo: {},
                        attrName: this.$t('eventAnalysis.userAmount'),
                    }];
                }
                if (this.filterList) {
                    //不为undefined时
                    this.filterList.conditions.forEach(e => {
                        // fill condition.key if necessary
                        e.key = e.key || (e.type === 'group'
                            ? (KEY_PREFIXES.USER_ATTR + e.field.attrId)
                            : (KEY_PREFIXES.USER_GROUP + e.field.attrId));
                        // fill userGroupInfo.id if necessary
                        if (e.type === 'group') {
                            e.userGroupInfo = e.userGroupInfo || { id: e.field.attrId };
                        } else {
                            e.userGroupInfo = { id: '' };
                        }
                    });
                } else {
                    //undefined时
                    this.filterList = {
                        relation: 'and',
                        conditions: []
                    };
                }
                if (!this.dataGroup) {
                    // undefined时
                    this.dataGroup = [];
                }
                this.firstAjax = true;
                this.getReportDataList();
            });
        },
        //取消下载
        cancelDownload () {
            this.downloadDetailFlag = false;
        },
        //下载报表数据
        exportData (info) {
            this.downloadInfo.formatType = info.formatType;
            this.downloadInfo.dataFormat = info.dataFormat;
            this.downloadDetailFlag = false;
            let obj = {
                csvName: this.getCsvName(),
                ...this.sendDataObj,
            };
            downCsv(
                'post',
                'param',
                JSON.stringify(obj),
                LINKS.QUERY_API_BASE + '/api/export/user/analytics?' + 'formatType=' + info.formatType + '&dataFormat=' + info.dataFormat
            );
        },
        // 筛选行、列
        searchKeyWord (_async) {
            let async = true;
            if (_async !== undefined) {
                async = _async;
            } else {
                if (this.allReportData.truncated) { // 现有数据为部分数据
                    async = true;
                } else {
                    if (this.isSendSearchKeyWord) {
                        if (this.copyListKeyWord.includes(this.listKeyWord)
                            && this.copyTitleKeyWord.includes(this.titleKeyWord)) {
                            async = false;
                        }
                    } else {
                        if (this.copyListKeyWord.includes(this.listKeyWordCache)
                            && this.copyTitleKeyWord.includes(this.titleKeyWordCache)) {
                            async = false;
                        }
                    }
                }
            }
            this.listKeyWord = this.copyListKeyWord;
            this.titleKeyWord = this.copyTitleKeyWord;
            if (async) {
                this.isSendSearchKeyWord = true;
                this.getReportDataList();
            }
        },
        immediatelySearch () {
            if (this.request) this.request.abort();
            if (lazySearchKeyword.cancel) lazySearchKeyword.cancel();
            this.searchKeyWord();
        },
        lazySearchKeyword: lazySearchKeyword,
        clearKeyWord (direction) {
            let async = true;
            if (direction === 'row') {
                this.copyTitleKeyWord = '';
            } else {
                this.copyListKeyWord = '';
            }
            if (!this.allReportData.truncated && !this.isSendSearchKeyWord) {
                async = false;
            }
            this.lazySearchKeyword(async);
        },
        //TitleWord排序 按第一个分组排序
        sortTitleWord () {
            this.sortValue = this.sortValue === 'asc' ? 'desc' : 'asc';
            if (this.dataGroup.length) {
                this.$set(this.dataGroup[0], 'order', this.sortValue);
            }
            return this.getReportDataList();
        },
        //将选项从本地local中取出来
        getLocalStorageData (localName) {
            let obj = JSON.parse(localStorage.getItem(localName));
            this.bookmarkLibOpen = false;
            this.dataGroup = obj.sendDataObj.byFields;
            this.filterList = obj.sendDataObj.filter;
            this.filterList.conditions.forEach(e => {
                // fill condition.key if necessary
                e.key = e.key || (e.type === 'group'
                    ? (KEY_PREFIXES.USER_ATTR + e.field.attrId)
                    : (KEY_PREFIXES.USER_GROUP + e.field.attrId));
                // fill userGroupInfo.id if necessary
                if (e.type === 'group') {
                    e.userGroupInfo = e.userGroupInfo || { id: e.field.attrId };
                } else {
                    e.userGroupInfo = { id: '' };
                }
            });
            if (this.measures) {
                this.measures = obj.sendDataObj.measures;
            }
            //表示的是从local本地提取的数据 而不是从书签或是其他的方式
            //将resetLocalStatus抽出来
            this.chartType = obj.chartType;  //图形的类型
            this.listKeyWord = obj.listKeyWord; //关键字
            this.titleKeyWord = obj.titleKeyWord; //关键字
            this.copyListKeyWord = obj.listKeyWord;
            this.copyTitleKeyWord = obj.titleKeyWord;
            this.groupKey = obj.groupKey;  //已勾选项
            this.firstAjax = true;
            this.getReportDataList();
        },
        // 子组件修改的key数组
        childKeys (keyArr, rows) {
            this.seriesKeys = keyArr;
            this.allReportData.rollupRows = rows;
        }
    }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import "attributes-analysis";
@import "../analysis";
</style>
