<template>
    <div class="content-container visual">
        <div class="content-view">
            <!--工具栏-->
            <div class="toolbar">
                <crumbs class="pull-left"/>
                <span v-if="changeBms" class="toolbar-action" @click="checkoutBookmark">{{'eventAnalysis.restoreBookmark' | t}}</span>
                <div class="toolbar-btn" @click.self="bookmarkFormOpen = !bookmarkFormOpen"
                     key="bookmark-form" v-if='confirmChecked'
                     v-blur="closeBookmarkForm">
                    <svg aria-hidden="true" @click="bookmarkFormOpen = !bookmarkFormOpen">
                        <use xlink:href="#icon-star"></use>
                    </svg>
                    {{'eventAnalysis.saveAsBookmark' | t}}
                    <bookmark-form v-if="bookmarkFormOpen" v-bind="bookmarkInfo" @change="updateBookmark"
                                   @hide="closeBookmarkForm"/>
                </div>
                <div class="toolbar-btn" v-blur="closeBookmarkLib" @click.self="bookmarkLibOpen = !bookmarkLibOpen">
                    <svg aria-hidden="true" @click="bookmarkLibOpen = !bookmarkLibOpen">
                        <use xlink:href="#icon-bookmarks"></use>
                    </svg>
                    {{'eventAnalysis.bookmarkLibrary' | t}}
                    <bookmark-library :options="bookmarks" v-if="bookmarkLibOpen" :value="bookmark.id"
                                      @hide="closeBookmarkLib" @choose="jumpToBookmark"/>
                </div>
                <template>
                    <span class="divider"></span>
                    <button type="button" class="toolbar-btn" @click="refresh"
                            v-title:bottom-left="$t('eventAnalysis.dataUpdateTime') + lastUpdateTime + '<br>' + $t('eventAnalysis.refreshTip')">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-refresh"></use>
                        </svg>
                    </button>
                </template>
            </div>
        </div>
        <!--可视化报告的内容-->
        <div class="visualization-content">
            <div class="content-view">
                <!-- 1/3 查询条件区 -->
                <div class="slider-menu" :class="{active: queryOpen}">
                    <div class="slider-menu-btn" @click="queryOpen = !queryOpen">
                        <span v-if='!confirmChecked || queryOpen'>{{'visualization.selectData' | t}}</span>
                        <p v-else-if='confirmChecked && !queryOpen'>
                            <span class='choose-text'>{{'visualization.selected' | t}}</span>
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-datasource"></use>
                            </svg>&nbsp;{{dataName}}
                        </p>
                    </div>
                    <transition name="drop">
                        <div class="slider-menu-box" v-show="queryOpen">
                            <!-- 这是第一层 数据集） -->
                            <div class="filter-item menu-item">
                                <p class='choose-data' @click='chooseDataAction'>
                                    <template v-if='!confirmChecked || checkedId === -1'>
                                        <svg aria-hidden="true">
                                            <use xlink:href="#icon-plus"></use>
                                        </svg>
                                        <span>{{'visualization.addData' | t}}</span>
                                    </template>
                                    <template v-else>
                                        <svg aria-hidden="true">
                                            <use xlink:href="#icon-datasource"></use>
                                        </svg>&nbsp;{{dataName}}
                                    </template>
                                </p>
                            </div>
                            <!-- 这是第二层 筛选条件 -->
                            <div class="tag">{{'eventAnalysis.filterCondition' | t}}</div>
                            <div class="group-control menu-item">
                                <visual-query-filter :groups="groups" :filter="filter"
                                                     @change="updateOrChangeFilter" @update="updateOrChangeFilter"/>
                                <button type="button" class="add-condition-btn" @click="addCondition">
                                    <svg>
                                        <use xlink:href="#icon-plus"></use>
                                    </svg>
                                    &nbsp;{{'eventAnalysis.filterCondition' | t}}
                                </button>
                            </div>
                        </div>
                    </transition>
                    <div class="pull-down" @click="queryOpen = !queryOpen">
                        <svg class="down-arrow" :class="[queryOpen ? 'turn-on' : 'turn-off']">
                            <use xlink:href="#icon-arrow-down"></use>
                        </svg>
                    </div>
                </div>
                <!-- 2/3 标题区 -->
                <h1 class="analysis-page-title" :title="bookmarkName"
                    v-text="bookmarkName"></h1>
                <button type="button" class="analysis-page-title-edit"
                        :class="{noTitleEdit: !((bookmark && bookmark.name) || bookmarkName)}" @click="editPageTitle"
                        :title="$t('eventAnalysis.editTip')">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-pencil"></use>
                    </svg>
                </button>
                <p class="analysis-page-desc"
                   :title="(bookmark && bookmark.desc) || $t('eventAnalysis.describe') + '……'"
                   v-text="(bookmark && bookmark.desc) || $t('eventAnalysis.describe') + '……'"></p>
                <!-- 3/3 图形区 -->
                <visualization-chart :groups="groups" :group-key.sync="groupKey" :group-key-y.sync="groupKeyY"
                                     :group-key-data.sync="groupKeyData"
                                     :show-name.sync="showName"
                                     :chart-type.sync="chartType"
                                     :group-table-data.sync='groupTableData'
                                     :gauge-show.sync='gaugeShow'
                                     :pie-slice.sync='pieSlice'
                                     :show-name-table.sync='showNameTable'
                                     :draw-chart-data='drawChartData'
                                     :book-mark-name='bookmark.name'
                                     :attrColName.sync='attrColName'
                                     ref="visualChart"
                                     @sendDrawData='fetchChartData($event)'>
                </visualization-chart>
            </div>
            <back-top/>
        </div>
        <!-- 选择数据集弹窗 -->
        <confirm v-if="chooseData" :title="$t('visualization.chooseData')" @cancel="cancleChooseData"
                 @confirm="confirmChooseData">
            <div class="data-field">
                <div class='form-filed-left'>
                    <div class='search-area'>
                        <div class="pull-left search-box">
                            <input type="text" :placeholder="$t('visualization.searchData')" v-model.trim="keyWords">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-search"></use>
                            </svg>
                        </div>
                    </div>
                    <div class='data-list'>
                        <ul>
                            <li v-for='item in options' @click='selectData(item)'
                                :class='{active:clickId === item.id}'>
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-datasource"></use>
                                </svg> &nbsp;
                                {{item.datasourceName}}
                            </li>
                        </ul>
                        <p v-if="filteredOptions.length === 0">{{'visualization.noData' | t}}</p>
                    </div>
                </div>
            </div>
        </confirm>
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
        <kudu-modal></kudu-modal>
    </div>
</template>

<script>
    import { WebServiceBookmarkApiV1, QueryApi, ScheduleApi } from '@/api';
    import {isCompleteCondition} from '../components/visual-query-filter-condition.vue';
    import filterArrayByKeys from '@/common/utils/filterArrayByKeys';
    import {stringify} from '@/common/utils/json';
    import {COMMON_NAME_REGEXP} from '@/common/utils/regs';
    import format from 'date-fns/format';
    import {trackEvent} from '@/monitor';
    // lodash
    import debounce from 'lodash/debounce';
    import cloneDeep from 'lodash/cloneDeep';
    // vuex
    import {ADD_BOOKMARK, UPDATE_BOOKMARK,} from '@/store/vuex/mutationTypes';
    import { mapState, mapMutations } from 'vuex';
    // 组件
    import visualizationChart from './visualization-chart.vue';
    import BookmarkForm from '../bookmark/bookmark-form.vue';
    import BookmarkLibrary from '../bookmark/bookmrak-library.vue';
    import visualQueryFilter from '../components/visual-query-filter.vue';
    import {ANALYSIS_STORE_NAME} from '@/store/vuex/modules/analysisStore';
    import {FETCH_BOOKMARKS} from '@/store/vuex/actionTypes';
    import KuduModal from '../kudumodal.vue';

    export default {
        name: 'visualization',
        components: {
            BookmarkForm,
            BookmarkLibrary,
            visualQueryFilter,
            visualizationChart,
            KuduModal
        },

        data() {
            return {
                // 0. 页面状态
                lastUpdateTime: '',     // 最近更新时间

                // 1. 顶栏
                bookmarkFormOpen: false,    // 书签表单 显示/隐藏
                bookmarkLibOpen: false,     // 书签库 显示/隐藏
                // 书签标题、描述
                pageTitle: '',
                pageTitleEditing: false,
                pageTitleErr: '',
                pageDesc: '',

                // 2. 查询条件 展开/收起
                queryOpen: true,
                chooseData: false,

                // 2-1. 数据集列表
                dataList: [],
                // 选中的数据集详情
                dataSource: {},
                keyWords: '',
                dataName: '',
                checkedId: -1,
                cid: -1,
                clickId: -1,
                // X轴下拉框默认值
                groupKey: '',
                // Y轴下拉框默认值
                groupKeyY: {
                    left: '',
                    right: ''
                },
                // 数据分组下拉框默认值
                groupKeyData: '',
                // 表格图形下拉框默认值
                groupTableData: [],
                // 3. 图形区
                // 图表类型
                chartType: 'line',
                // 数据源下的属性列表
                attrs: [],
                // 是否确认添加数据集
                confirmChecked: false,
                // 数据源对应的表名称
                tableName: '',
                // 时间单位
                unit: '',
                // Y轴
                measures: [],
                // X轴
                byFields: [],
                // 所有显示名:x轴/y轴左右/仪表名
                showName: {x: '', yLeft: '', yRight: '', gauge: ''},
                gaugeShow: 1, // 仪表图（仪表图显示形式）
                showNameTable: [],
                // 画图所需的数据
                drawChartData: [],
                pieSlice: '',
                refreshBookmark: false,
                // X轴选中的字段属性
                attrColName: '',

                // 筛选条件
                filter: {
                    conditions: [],
                    relation: 'and'
                },
            };
        },
        watch: {
            '$route.query.bmsId'(newId) {
                if (newId)
                    this.checkoutBookmark();
            },
        },
        mounted() {
            this.$store.dispatch(FETCH_BOOKMARKS)
                .then(() => {
                    this.cid = this.userId;
                    if (this.$route.query.bmsId) {
                        this.refreshBookmark = true;
                    } else {
                        this.getSoureceDataList(this.cid);
                    }
                });
        },
        destroyed() {
            // 置空filter
            this.filter = {
                relation: 'and',
                conditions: []
            };
        },
        beforeRouteUpdate(to, from, next) {
            if (from.query.bmsId && !to.query.bmsId) {
                localStorage.removeItem(this.LOCAL_CACHE_KEY);
                this.restoreStatus();
                next();
            } else if (from.query.bmsId && this.changeBms) {
                this.leaveGuard(next);
            } else {
                next();
            }
        },
        beforeRouteLeave(to, from, next) {
            if (this.changeBms) {
                this.leaveGuard(next);
            } else {
                next();
            }
        },

        computed: {
            ...mapState({
                userId: state => state.user.cid,
                storeBookmarks: state => state[ANALYSIS_STORE_NAME].bookmarks,
            }),
            // 本地缓存使用的 key
            LOCAL_CACHE_KEY() {
                return this.userId + 'VISUALIZATION_CACHE_KEY';
            },
            // 书签名称
            bookmarkName: {
                get() {
                    let bookmarkName = this.bookmark.id ? this.bookmark.name :
                        (this.dataName ? this.dataName + this.$t('visualization.report') : '');
                    this.bookmarkInfo.headerBookMarkName = bookmarkName;
                    return bookmarkName;
                },
                set(newName) {
                    return newName;
                },
            },
            // 画图请求接口post数据
            reportData() {
                let fields = [];
                let measure = [];

                // 缩水版的 filter，不完整的、校验不过的 筛选条件会被滤除
                const filterCopy = cloneDeep(this.filter);
                // 筛选条件
                filterCopy.conditions = filterCopy.conditions.filter(isCompleteCondition);

                this.byFields.map(item => {
                    if (item.attrId !== '') {
                        fields.push(item);
                    }
                });
                this.measures.map(item => {
                    if (item.attrId !== '') {
                        measure.push(item);
                    }
                });
                return {
                    byFields: fields,
                    chartType: this.chartType,
                    cid: this.userId,
                    filter: filterCopy,
                    fromDate: '',
                    measures: measure,
                    tableName: this.tableName,
                    toDate: '',
                    unit: this.unit
                };
            },

            options() {
                return this.filteredOptions;
            },

            // 关键字查找
            filteredOptions() {
                return filterArrayByKeys(this.dataList, this.keyWords, 'datasourceName');
            },

            // 书签表单用的结构
            bookmarkInfo() {
                return {
                    filterStr: {
                        unit: this.unit,
                        type: this.chartType,
                    },
                    query: {
                        byFields: this.byFields,
                        measures: this.measures,
                        groupId: this.checkedId,
                        tableName: this.tableName,
                        showName: this.showName,
                        gaugeShow: this.gaugeShow,
                        pieSlice: this.pieSlice,
                        attrColName: this.attrColName,
                        filter: this.filter,
                        groupKey: this.groupKey,    // x轴
                        groupKeyY: this.groupKeyY,  // y轴
                        groupKeyData: this.groupKeyData, // 数据分组
                    },
                    headerBookMarkName: this.bookmark.name,
                    desc: this.bookmark.id ? this.bookmark.desc : this.pageDesc,
                    bookMarkId: this.bookmark.id,
                    type: 3,// 可视化报告
                };
            },

            // 所有可用的可视化报告书签
            bookmarks() {
                return this.storeBookmarks.filter(list => list.type === 3);
            },

            // 当前查看的书签，如果不在查看书签，返回空对象
            bookmark() {
                if (this.$route.query.bmsId) {
                    let bookmarkId = Number(this.$route.query.bmsId);
                    let bookmark = this.bookmarks.find(bookmark => bookmark.id === bookmarkId);
                    if (bookmark) {
                        if (this.refreshBookmark) {
                            this.restoreStatus(JSON.parse(bookmark.filterStr), JSON.parse(bookmark.conditionStr));
                            this.refreshBookmark = false;
                        }
                        return bookmark;
                    }
                    if (this.bookmarks.length !== 0) {
                        console.error(`可视化报告：没有找到 ID 为 ${bookmarkId} 的书签`);
                    }
                    return {};
                }
                return {};
            },

            // 书签是否被编辑了
            changeBms() {
                if (this.bookmark.id) {
                    let originalCondition = JSON.parse(this.bookmark.conditionStr);
                    return stringify(originalCondition, 'order') !== stringify(this.bookmarkInfo.query, 'order')
                        || this.bookmark.filterStr !== JSON.stringify(this.bookmarkInfo.filterStr);
                }
                return false;
            },
            // 属性下拉列表
            groups() {
                if (this.checkedId > 0) {
                    this.attrs.map(item => {
                        if (item) {
                            item.name = item.attrShowName;
                        }
                    });
                    return [...this.attrs];
                }
                return [];
            },
        },
        methods: {
            ...mapMutations([
                ADD_BOOKMARK,
                UPDATE_BOOKMARK
            ]),
            //————————————————————书签开始
            // 还原状态（书签）
            restoreStatus(filterStr, query) {
                let {type, unit} = filterStr || {};
                let {
                    measures, byFields, groupId, tableName, showName, gaugeShow, pieSlice, attrColName, filter,
                    groupKey, groupKeyY, groupKeyData,
                } = query || {};
                // 1. 恢复页面状态
                if (filterStr) {
                    this.chartType = type === 'reportChart' ? 'line' : type;
                    this.unit = unit === 'total' ? 'day' : unit;
                    this.measures = measures;
                    this.byFields = byFields;
                    this.clickId = this.checkedId = groupId;
                    this.tableName = tableName;
                    this.showName = showName;
                    this.gaugeShow = gaugeShow;
                    this.pieSlice = pieSlice;
                    this.attrColName = attrColName;
                    this.filter = filter;
                    this.groupKey = groupKey || '';
                    this.groupKeyY = groupKeyY || {left: '', right: ''};
                    this.groupKeyData = groupKeyData || '';
                    this.getSoureceDataList(this.cid);
                } else {
                    // 初始化页面

                    // 取消添加数据集
                    this.clickId = this.checkedId = -1;
                    this.cancleChooseData();

                    this.clearData();

                    this.confirmChecked = false;
                    this.chartType = 'line';
                    this.byFields = [];
                    this.measures = [];
                    this.showName = {
                        gauge: '',
                        x: '',
                        yLeft: '',
                        yRight: '',
                    };

                    // 清空筛选条件
                    this.filter = {
                        relation: 'and',
                        conditions: []
                    };
                }
            },

            handleChartData() {
                switch (this.chartType) {
                    case 'line':
                    case 'bar':
                    case 'cross':
                    case 'pm':
                    case 'arealine':
                    case 'pie':
                    case 'polar':
                        if (this.byFields && this.byFields.length > 0) {
                            this.groupKey = this.byFields[0].attrId;
                            this.groupKeyData = this.byFields[1] ? this.byFields[1].attrId : '';
                        } else {
                            this.groupKey = '';
                            this.groupKeyData = '';
                        }

                        if (this.groupKeyY) {
                            this.groupKeyY.left = this.measures && this.measures.length > 0 ? this.measures[0].attrId : '';
                            this.groupKeyY.right = this.measures && this.measures[1] ? this.measures[1].attrId : '';
                        }

                        this.getNoGaugeChart();
                        break;
                    case 'gauge':
                        if (this.groupKeyY) {
                            this.groupKeyY.left = this.byFields && this.byFields.length > 0 ? this.byFields[0].attrId : '';
                            this.groupKeyY.right = this.byFields && this.byFields[1] ? this.byFields[1].attrId : '';
                            this.getGaugeChart();
                        }
                        break;
                    case 'table':
                        this.groupTableData = [];
                        this.showNameTable = [];
                        if (this.byFields && this.byFields.length > 0) {
                            this.byFields.map(item => {
                                this.groupTableData.push(item.attrId);
                                this.showNameTable.push(item.attrName);
                            });
                        }
                        this.getTableChart();
                        break;
                }
            },

            // 离开页面前检查
            leaveGuard(nextOrEvent) {
                const confirmationMessage = `${this.$t('eventAnalysis.bookMark')}「${this.bookmark.name}」${this.$t('eventAnalysis.bookMarkEdit')}`;
                if (typeof nextOrEvent === 'function') {
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
                    this.$router.replace({name: 'visualization', query: {bmsId: bookmark.id}});
                } else {
                    // 删除在 beforeRouteUpdate 里处理
                }
            },

            // 应用书签内容
            checkoutBookmark() {
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
                this.$router.push({name: 'visualization', query: {bmsId: bookmarkId}});
            },

            // 刷新当前页面
            refresh() {
                this.getDrawChartData();
            },

            // 编辑书签标题和描述
            editPageTitle() {
                this.pageTitle = this.bookmarkName;
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
                    this.pageTitleErr = `${this.$t('eventAnalysis.bookMarkName')}${this.$t('common.nameSpecial')}`;
                    return false;
                }
                if (this.pageTitle.length > 30) {
                    this.pageTitleErr = this.$t('visualization.validNameLength');
                    return false;
                }
                this.pageTitleErr = '';
                if (!this.bookmark.id) {
                    this.$loading();
                    WebServiceBookmarkApiV1
                        .createBookmark({
                            cid: this.userId,
                            conditionStr: JSON.stringify({
                                byFields: this.byFields,
                                measures: this.measures,
                                groupId: this.checkedId,
                                tableName: this.tableName,
                                showName: this.showName,
                                gaugeShow: this.gaugeShow,
                                pieSlice: this.pieSlice,
                                attrColName: this.attrColName,
                                filter: this.filter,
                                groupKey: this.groupKey,
                                groupKeyY: this.groupKeyY,
                                groupKeyData: this.groupKeyData,
                            }),
                            filterStr: JSON.stringify({
                                unit: this.unit,
                                type: this.chartType,
                            }),
                            name: this.pageTitle,
                            desc: this.pageDesc,
                            type: 3, // 可视化报告的书签
                            overviewIds: []
                        })
                        .then(({body: {data: {bookmark}}}) => {
                            trackEvent('数据分析-可视化报告-保存书签');
                            // 1. update rootStore
                            this.ADD_BOOKMARK(bookmark);
                            // 2. update route
                            this.$router.replace({name: 'visualization', query: {bmsId: bookmark.id}});
                            // 3. close modal
                            this.pageTitle = '';
                            this.pageDesc = '';
                            this.pageTitleEditing = false;
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
                        .then(({body: {data: {bookmark}}}) => {
                            trackEvent('数据分析-可视化报告-修改书签');
                            // 1. update rootStore
                            this.UPDATE_BOOKMARK(bookmark);
                            // 2. close modal
                            this.pageTitle = '';
                            this.pageDesc = '';
                            this.pageTitleEditing = false;
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                    // 请求画图数据
                    if (this.byFields.length > 0 && this.measures.length > 0) {
                        this.getDrawChartData();
                    }
                }
            },

            //————————————————————数据集开始
            getSoureceDataList(id) {
                this.$loading();
                ScheduleApi
                    .getDataSource(id)
                    .then(res => {
                        this.dataList = res.body.data;
                        // 回显书签中的数据集信息
                        if (this.checkedId > 0) {
                            this.dataList.map(item => {
                                if (item.id === this.checkedId) {
                                    this.dataName = item.datasourceName;
                                    this.attrs = item.attrs;
                                    this.clickChooseData();
                                    this.handleChartData();
                                }
                            });
                        }
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            // 点击添加数据集弹窗
            chooseDataAction() {
                this.chooseData = true;
            },

            // 取消添加数据集
            cancleChooseData() {
                if (this.checkedId > 0) {
                    this.clickId = this.checkedId;
                    this.chooseData = false;
                    this.keyWords = '';
                } else {
                    this.chooseData = false;
                    this.keyWords = '';
                    this.dataName = '';
                    this.checkedId = -1;
                    this.attrs = [];
                    this.tableName = '';
                    this.unit = '';
                }
            },

            // 点击确认添加数据集
            confirmChooseData() {
                this.checkedId = this.clickId;
                this.dataName = this.dataSource.datasourceName;
                // 切换数据集，清空筛选条件
                const filter = {
                    relation: 'and',
                    conditions: []
                };
                if (this.bookmark.id) {
                    let originalSourceId = JSON.parse(this.bookmark.conditionStr).groupId;
                    if (originalSourceId !== this.checkedId) {
                        this.filter = filter;
                    }
                } else {
                    this.filter = filter;
                }

                if (this.checkedId) {
                    this.confirmChecked = true;
                    this.chooseData = false;
                    this.clearData();
                    this.$refs.visualChart.clearAllSelectes();
                } else {
                    this.$toast(this.$t('visualization.selectData'), 'warn');
                }
            },

            // 回显选中数据集
            clickChooseData() {
                this.confirmChecked = true;
                this.chooseData = false;
                this.$refs.visualChart.clearAllSelectes();
            },

            selectData(item) {
                if (item) {
                    this.dataSource = item;
                    this.clickId = this.dataSource.id;
                    this.attrs = this.dataSource.attrs;
                    this.tableName = this.dataSource.tableName;
                    this.unit = this.dataSource.unit;
                }
            },

            // 清空图表数据
            clearData() {
                this.groupKey = '';
                this.groupKeyY = {
                    left: '',
                    right: '',
                };
                this.groupKeyData = '';
                this.groupTableData = [];
                // 重新选择数据集时清空图表数据
                this.drawChartData = [];
                this.$refs.visualChart.clearData();
            },

            //————————————————————筛选条件开始
            // 添加一条最外层的筛选条件
            addCondition() {
                const newCondition = {
                    valid: true,
                    field: {
                        attrId: '',
                    },
                    attrGenre: 0,
                    numberPrecision: '',// double类型保留的小数位数
                    function: '',
                    params: [],
                    format: '',
                    paramsInterval: ['include', 'include'],
                    userGroupInfo: {
                        id: '',
                    },
                    userGroupRelation: '',  // isTrue:真，isFalse:假
                };
                this.filter.conditions.push(newCondition);
            },

            // update、change 筛选条件
            updateOrChangeFilter(newFilter) {
                this.filter = newFilter;
                // 筛选条件变化后请求画图数据
                this.fetchChartData();
            },

            //————————————————————图形区开始

            // 获取图表数据
            fetchChartData(data) {
                switch (this.chartType) {
                    case 'gauge':
                        // byFields添加值
                        this.byFields = [{attrId: '', attrName: ''}, {attrId: '', attrName: ''}];
                        this.measures = [];
                        if (this.groupKeyY.left > 0) {
                            this.byFields[0].attrId = this.groupKeyY.left;
                            this.byFields[0].attrName = this.showName.yLeft;
                        }
                        if (this.groupKeyY.right > 0) {
                            this.byFields[1].attrId = this.groupKeyY.right;
                            this.byFields[0].attrName = this.showName.yRight;
                        }
                        if (!data) {
                            this.getGaugeChart();
                        }
                        break;
                    case 'table':
                        // 只更改显示名不请求网络,只保存标签
                        this.getTableChart(data);
                        break;
                    default:
                        this.measures = [{aggreator: '', attrId: '', attrName: ''}, {
                            aggreator: '',
                            attrId: '',
                            attrName: ''
                        }];
                        this.byFields = [{attrId: '', attrName: ''}, {attrId: '', attrName: ''}];
                        if (this.groupKeyY.right > 0) {//右侧Y轴有值
                            this.measures[1].attrId = this.groupKeyY.right;
                            this.measures[1].attrName = this.showName.yRight;
                        }
                        if (this.groupKeyData > 0) { //数据分组有值
                            this.byFields[1].attrId = this.groupKeyData;
                        }
                        if (this.groupKeyY.left > 0) { //左侧Y轴有值
                            this.measures[0].attrId = this.groupKeyY.left;
                            this.measures[0].attrName = this.showName.yLeft;
                        }
                        if (this.groupKey > 0) { //x轴有值
                            this.byFields[0].attrId = this.groupKey;
                            this.byFields[0].attrName = this.showName.x;
                        }
                        if (!data) {
                            this.getNoGaugeChart();
                        }
                }
            },

            // 判断是否符合仪表图画图条件，仪表图满足仪表值与目标值都不为空时才可请求数据画图
            getGaugeChart() {
                if (this.groupKeyY.left > 0 && this.groupKeyY.right > 0) {
                    this.getDrawChartData();
                } else {
                    // 清空echarts
                    this.$refs.visualChart.clearChart();
                    this.drawChartData = [];
                }
            },

            // 判断是否符合表格图画图条件，图表类型为table时，只要一个有值，就可请求数据画图
            getTableChart(data) {
                this.byFields = [];
                this.measures = [];
                if (this.groupTableData.length > 0) {
                    if (this.showNameTable.length > 0) {
                        this.groupTableData.map((item, index) => {
                            this.showNameTable.map((name, idx) => {
                                if (index === idx) {
                                    this.byFields.push({attrId: item, attrName: name});
                                }
                            });
                        });
                    }
                    if (!data) {
                        this.getDrawChartData();
                    }
                } else {
                    this.drawChartData = [];
                }
                this.$refs.visualChart.clearChart();
            },

            // 判断其余图表是否符合画图条件
            // 其余图表类型要符合X轴与左侧Y轴都选中时满足基本画图条件才可请求数据画图
            getNoGaugeChart() {
                if (this.groupKey > 0 && this.groupKeyY.left > 0) {
                    this.getDrawChartData();
                } else {
                    this.$refs.visualChart.clearChart();
                    this.drawChartData = [];
                }
            },

            // 请求画图数据
            getDrawChartData: debounce(function () {
                this.$loading();
                QueryApi
                    .getVisualReportData(this.reportData)
                    .then(res => {
                        this.drawChartData = res.body.data;
                        switch (this.chartType) {
                            case 'table':
                                this.$refs.visualChart.drawChartTable(this.drawChartData);
                                break;
                            default:
                                this.drawChart(this.drawChartData);
                        }
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
                // 记录请求数据时的时间
                this.lastUpdateTime = format(new Date(), 'YYYY-MM-DD HH:mm:ss');
            }),

            // 画图
            drawChart(data) {
                this.$nextTick(() => {
                    this.$refs.visualChart.drawChart(data);
                });
            },
        }
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";
    @import "../analysis";

    $padding-left: 40px;
    .visual {
        display: flex;
        flex-direction: column;

        .visualization-content {
            flex: 1;
            overflow: auto;
            padding-bottom: 1em;

            .slider-menu {
                position: relative;
                z-index: $index-container;
                cursor: pointer;
                background-color: white;

                &:hover {
                    @include box-shadow(3px 0 8px rgba(#8b9daf, 0.16));

                    .pull-down {
                        height: 16px;
                        line-height: 16px;
                        padding: 0;

                        .down-arrow {
                            height: 16px;
                        }
                    }
                }

                &.active {
                    .pull-down {
                        height: 16px;
                        line-height: 16px;
                        padding: 0;

                        .down-arrow {
                            height: 16px;
                        }
                    }
                }

                // 设置条件 展开收起
                .slider-menu-btn {
                    width: 100%;
                    height: $toolbar-height;
                    line-height: $toolbar-height;
                    border: 1px solid $border-color;
                    color: $green;
                    cursor: pointer;
                    background-color: $title-bg;
                    text-align: center;
                    box-sizing: border-box;

                    svg {
                        position: relative;
                        top: 2px;
                        width: 14px;
                        height: 14px;
                        fill: $green;
                    }

                    .choose-text {
                        color: $color-light-content;
                    }
                }

                .slider-menu-btn-tip {
                    display: inline-block;
                    color: $color-title;
                    vertical-align: top;
                    width: calc(100% - 130px);
                }

                .slider-menu-box {
                    .tag {
                        position: absolute;
                        width: 60px;
                        height: 24px;
                        line-height: 24px;
                        text-align: center;
                        color: #fff;
                        margin-top: -12px;
                        z-index: 1;
                        background-color: #798491;
                        border-radius: 0 4px 4px 0;
                    }
                }

                .menu-item {
                    padding: 27px 27px;

                    &.filter-item {
                        padding-left: $padding-left;
                        color: $color-title;

                        .choose-data {
                            width: 320px;
                            height: 80px;
                            margin: 0 auto;
                            text-align: center;
                            line-height: 80px;
                            border: 1px dashed $border-color;
                            background-color: $title-bg;
                            color: $green;
                            border-radius: 4px;

                            svg {
                                position: relative;
                                width: 16px;
                                height: 16px;
                                fill: $green;
                                top: 2px;
                            }
                        }
                    }

                    &.group-control {
                        border-top: 1px solid #d6dbe4;

                        .by-fields-groups {
                            padding-left: $padding-left - 20px;

                        }

                        .add-ops-item {
                            padding: 0;
                            line-height: $input-field-height;
                            background-color: inherit;
                            border: none;
                            cursor: pointer;
                            color: $green;
                            margin-left: $padding-left;

                            &:hover {
                                color: $light-green;
                            }
                        }

                        // query 3/3 筛选条件 filter.conditions
                        .add-condition-btn {
                            height: 22px;
                            line-height: 22px;
                            border: none;
                            margin-left: 40px;
                            padding: 0;
                            background-color: transparent;
                            color: $green;
                            cursor: pointer;

                            &:hover {
                                color: $light-green;
                            }

                            svg {
                                display: inline-block;
                                width: 1em;
                                height: 1em;
                                vertical-align: top;
                                margin-top: 5px;
                                fill: currentColor;
                            }
                        }
                    }

                    &.ops-group {
                        position: relative;
                        padding-left: 0;

                        .add-condition-action {
                            display: inline-block;
                            border: none;
                            color: $green;
                            line-height: $input-field-height;
                            cursor: pointer;
                            margin-left: $padding-left;

                            &:hover {
                                color: $light-green;
                            }
                        }

                    }
                }

                // 向下按钮
                .pull-down {
                    position: absolute;
                    left: 48.5%;
                    width: 3%;
                    height: 10px;
                    line-height: 10px;
                    background-color: $green;
                    text-align: center;
                    border: none;
                    border-radius: 0 0 4px 4px;
                    cursor: pointer;
                    @include transition(all .3s ease);
                    //向下箭头
                    .down-arrow {
                        width: 1em;
                        height: .8em;
                        fill: #fff;
                        @include transition(all .3s ease);
                    }

                    .turn-on {
                        transform: rotate(180deg) scale(1, 0.5);
                    }

                    .turn-off {
                        transform: rotate(0deg) scale(1, 0.5);
                    }
                }
            }
        }

        .noTitleEdit {
            margin: 40px 0 0 80px;
        }

        .data-field {
            max-height: 400px;
            border: 1px solid $border-color;
            display: flex;
            display: -webkit-flex;
            flex-wrap: nowrap;
            overflow: auto;
            line-height: 32px;

            .form-filed-left {
                // width: 50%;
                flex: 1;
                height: 100%;

                .search-area {
                    padding: 0 8px;
                    height: 48px;
                    background-color: $title-bg;
                }

                .search-box {
                    margin-top: 8px;
                    width: 100%;
                    margin-left: 0;
                }

                .data-list {
                    ul {
                        li {
                            cursor: pointer;
                            padding: 4px 12px;

                            &:hover {
                                background-color: $select-bg;
                                color: #0cc2a9;

                                svg {
                                    fill: #0cc2a9;
                                }
                            }

                            svg {
                                width: 12px;
                                height: 12px;
                            }

                            &.active {
                                background-color: $select-bg;
                                color: #0cc2a9;

                                svg {
                                    fill: #0cc2a9;
                                }
                            }
                        }
                    }

                    p {
                        padding: 4px 12px;
                        font-style: italic;
                    }
                }
            }

            .form-filed-right {
                position: relative;
                width: 50%;
                padding: 0 12px;

                .no-data {
                    position: absolute;
                    text-align: center;
                    height: 30px;
                    width: 100px;
                    top: 50%;
                    margin-top: -15px;
                    left: 50%;
                    margin-left: -50px;

                }

                .data-detail {
                    svg {
                        width: 12px;
                        height: 12px;
                    }

                    .data-title {
                        height: 48px;
                        line-height: 48px;
                        border-bottom: 1px solid $border-color;
                    }

                    .data-info {
                        .info {
                            margin-left: 24px;
                        }
                    }
                }
            }
        }
    }
</style>
