<template>
    <div class="content-container board" v-if="board">
        <div class="content-view">
            <div class="toolbar">
                <crumbs class="pull-left" :crumbs="routeCrumbs"/>
            </div>
        </div>
        <div class="page-head">
            <div class="content-view">
                <!-- 看板名称 -->
                <h1 :title="board.name">
                    <template v-if="!editing">
                        {{board.name}}
                        <svg aria-hidden="true" class="board-name-editor" v-if="board.type !== 2 && !editing"
                             @click.stop="editBoard">
                            <use xlink:href="#icon-pencil"></use>
                        </svg>
                    </template>
                    <input v-if="editing" class="pull-left input" type="text" v-autofocus
                           v-model.trim="editingBoardName" @keydown.esc="editing = false"
                           @keydown.enter="editBoardComplete" v-blur="editBoardComplete" maxlength="30">
                </h1>
                <!-- 分组管理 -->
                <div class="chart-group-manage" v-title:top.line="$t('board.groupManagement')" v-if="board.type !== 2"
                     v-blur="closeChartGroupManagePanel">
                    <svg aria-hidden="true" class="icon-btn" v-if="board.type !== 2"
                         @click.stop="toggleChartGroupManagePanel">
                        <use xlink:href="#icon-grid"></use>
                    </svg>
                    <transition name="drop">
                        <div class="chart-group-drop-list" v-if="managingChartGroup">
                            <i class="tail"></i>
                            <draggable v-model="chartGroups" @change="orderGroups"
                                       :group="{name: 'group'}" :animation="150" :disabled="board.type === 2">
                                <div class="group action-icon-trigger" v-for="group in chartGroups" :key="group.id"
                                     :class="{active: deletingGroupIdOnPanel === group.id, edit: editingGroupId === group.id}">
                                    <template v-if="editingGroupId !== group.id">
                                        <div class="pull-right action-icon icon icon-close"
                                             @click.self="deletingGroupIdOnPanel = group.id">
                                            <inline-confirm v-if="deletingGroupIdOnPanel === group.id" static-positioned
                                                            :text="group.boardShows && group.boardShows.length ? $t('board.deleteOnceSure') : $t('board.deleteGroupSure')"
                                                            @cancel="deletingGroupIdOnPanel = ''"
                                                            @confirm="deleteGroup(group)"/>
                                        </div>
                                        <button class="pull-right action-icon icon icon-pencil"
                                                @click="editGroup(group)"></button>
                                        <p class="chart-group-name">{{group.name}}</p>
                                    </template>
                                    <div class="edit-group-form" v-else>
                                        <p class="edit-group-form-width-holder">{{group.name}}</p>
                                        <input type="text" v-model.trim="editingGroupName" maxlength="30" v-autofocus
                                               @keydown.enter="updateGroup(group)">
                                        <button type="button" class="pull-right btn btn-sm btn-theme"
                                                :disabled="editingGroupName.trim() === ''" @click="updateGroup(group)">
                                            {{'common.confirm' | t}}
                                        </button>
                                        <button type="button" class="pull-right btn btn-sm btn-theme-border"
                                                @click="cancelEditGroup">
                                            {{'common.cancel' | t}}
                                        </button>
                                    </div>
                                </div>
                            </draggable>
                            <div class="edit-group-form" v-if="creatingNewGroupOnPanel">
                                <input type="text" v-model.trim="editingGroupName" maxlength="30" v-autofocus
                                       @keydown.enter="saveNewGroup" @keydown.esc="cancelNewGroup">
                                <button type="button" class="pull-right btn btn-sm btn-theme" @click="saveNewGroup">
                                    {{'common.confirm' | t}}
                                </button>
                                <button type="button" class="pull-right btn btn-sm btn-theme-border"
                                        @click="cancelNewGroup">
                                    {{'common.cancel' | t}}
                                </button>
                            </div>
                            <div class="add-group-action icon icon-plus" v-if="!creatingNewGroupOnPanel"
                                 @click="createGroupOnPanel">
                                &nbsp;{{'board.addgroups' | t}}
                            </div>
                        </div>
                    </transition>
                </div>
                <!-- 其他操作 -->
                <selector v-if="board.type!== 2 && ACTION_OPTIONS.length" class="icon-size pull-right" auto-width
                          type="select" :options="ACTION_OPTIONS" icon="setting" @input="actionOnBoard"/>
                <a class="download-btn pull-right" v-title:top="$t('board.importexc')" @click='downloadExcel'>
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-download"></use>
                    </svg>
                </a>
                <!-- 刷新频率 -->
                <selector v-if="board.type!==2" class="pull-right" type="select" :options="REFRESH_OPTIONS"
                          v-model="refreshInterval"/>

                <!-- 分享信息 -->
                <!-- 屏蔽分享功能
                <div class="share-info">
                    <template v-if="board.type === 2">
                        分享自
                        <strong>{{board.userInfo.name}}</strong>
                        (<a class="theme-text" :href="'mailto:' + board.userInfo.email">{{board.userInfo.email}}</a>)
                    </template>
                    <template v-else>
                        <span class="disabled-text">已分享 <b class="theme-text">{{board.users.length}}</b> 人</span>
                        <button class="share-btn icon icon-plus" @click="sharing = true">
                            <img v-for="user in board.users" :src="user.avatar" class="avatar">
                        </button>
                    </template>
                </div>
                -->
            </div>
        </div>
        <div class="page-content">
            <div class="report-group" v-for="group in chartGroups" :key='group.id'>
                <div class="content-view">
                    <div class="report-group-head">
                        <h2 :title="group.name">{{group.name}}</h2>
                        <!-- 展开/收起 -->
                        <div class="report-group-action">
                            <button type="button" class="report-group-icon-btn arrow-down"
                                    :class="{open: !hiddenGroupIds[group.id]}"
                                    v-title:top.line="hiddenGroupIds[group.id] ? $t('board.opengroup') : $t('board.closegroup')"
                                    @click="$set(hiddenGroupIds, group.id, !hiddenGroupIds[group.id])">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-arrow-down"></use>
                                </svg>
                            </button>
                        </div>
                        <!-- 删除 -->
                        <div class="report-group-action" v-if="board.type !== 2">
                            <button type="button" class="report-group-icon-btn close"
                                    v-title:top.line="$t('board.deletegroup')"
                                    @click="deletingGroupId = group.id">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-close"></use>
                                </svg>
                            </button>
                            <inline-confirm v-if="deletingGroupId === group.id" @cancel="deletingGroupId = ''"
                                            :text="group.boardShows && group.boardShows.length ? $t('board.deleteOnceSure') : $t('board.deleteGroupSure')"
                                            @confirm="deleteGroup(group)"/>
                        </div>
                        <!-- 新增图表 -->
                        <div class="report-group-action" v-if="board.type !== 2">
                            <button type="button" class="report-group-icon-btn plus"
                                    v-title:top.line="$t('board.addcoms')"
                                    @mousedown.stop="recruitingGroupId = recruitingGroupId === group.id ? '' : group.id">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-plus"></use>
                                </svg>
                            </button>
                            <add-new-chart-drop-list :disabled-bookmark-ids="[]" v-if="recruitingGroupId === group.id"
                                                     v-blur="stopRecruiting" @pick="recruit"/>
                        </div>
                    </div>
                </div>
                <transition name="drop">
                    <div class="report-group-content" v-if="!hiddenGroupIds[group.id]">
                        <!-- 所有图表区块 -->
                        <draggable class="board-charts" v-model="group.boardShows"
                                   :group="{name: 'chart'}" :animation="250" :disabled="board.type === 2"
                                   :handle="'.board-charts-chart'" @change="orderCharts($event, group)">
                            <p v-if="!group.boardShows.length">{{'board.groupNoCharts' | t}}</p>
                            <template v-else>
                                <chart class="board-charts-chart" v-for="chart in group.boardShows" :key="chart.id"
                                       v-bind="chart" :boardType="board.type"
                                       @config="chartConfigChange(chart, group, $event)"
                                       @date="updateDate(chart,$event)"
                                       @delete="deleteChart(chart, group)" ref="charts"/>
                            </template>
                        </draggable>
                    </div>
                </transition>
            </div>
            <div class="content-view" v-if="board.type !== 2">
                <div class="new-group-form" v-if="creatingNewGroup" ref="newGroupField">
                    <input type="text" class="new-group-field" v-autofocus
                           v-model.trim="editingGroupName" maxlength="30" :placeholder="$t('board.placecomsName')"
                           @keydown.enter="saveNewGroup" @keydown.esc="cancelNewGroup">
                    <button type="button" class="btn btn-sm btn-theme-border" @click="cancelNewGroup"> {{'common.cancel'
                        | t}}
                    </button>
                    <button type="button" class="btn btn-sm btn-theme" @click="saveNewGroup">{{'common.confirm' | t}}
                    </button>
                </div>
                <button type="button" class="new-report-group-btn" @click="createGroup" v-else>
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'board.addReportgoups' | t}}
                </button>
            </div>
            <back-top/>
        </div>
        <!-- 分享模态框 -->
        <!-- 屏蔽分享功能
        <share-modal v-if="sharing" :board-id="board.id" @close="sharing = false"/>
        -->
    </div>
</template>
<script>
    import { WebServiceApiV1, QueryApi } from '@/api';
    import cloneDeep from 'lodash/cloneDeep';
    import debounce from 'lodash/debounce';
    import {UPDATE_BOARD} from '@/store/vuex/mutationTypes';
    import {FETCH_BOOKMARKS} from '@/store/vuex/actionTypes';
    import AddNewChartDropList from './components/add-new-chart-drop-list.vue';
    // import ShareModal from './components/share-modal.vue';
    import Chart, {DEFAULT_CHART_CONFIG} from './components/board-chart.vue';
    import difference from 'lodash/difference';
    import {downloadArrayBufferAsFile} from '@/common/utils/downloadUtils';
    import {trackEvent} from '@/monitor';
    import {translate as t} from '@/locales';
    import {ANALYSIS_STORE_NAME} from '@/store/vuex/modules/analysisStore';
    import { mapState, mapMutations, mapActions } from 'vuex';

    export const timeOptions = [
        {id: 'total', name: t('board.totals'), limit: Infinity},
        {id: 'minute', name: t('board.byMinute'), limit: 1},
        {id: 'hour', name: t('board.byHour'), limit: 30},
        {id: 'day', name: t('board.byDay'), limit: 365},
        {id: 'week', name: t('board.byWeek'), limit: Infinity},
        {id: 'month', name: t('board.byMonth'), limit: Infinity},
        {id: 'year', name: t('board.byYear'), limit: Infinity},
    ];

    // 默认的看板配置
    export const DEFAULT_BOARD_CONFIG = {
        refreshInterval: 'manually',    // 刷新间隔
    };

    export default {
        components: {
            Chart,
            AddNewChartDropList,
            // ShareModal
        },
        data() {
            return {
                // 编辑
                editing: false,
                editingBoardName: '',
                // 分组管理
                managingChartGroup: false,
                editingGroupId: '',
                creatingNewGroupOnPanel: false, // 顶部新建分组
                creatingNewGroup: false,        // 内容区新建分组
                deletingGroupIdOnPanel: '',
                editingGroupName: '',
                // 分享
                sharing: false,
                // 刷新间隔
                REFRESH_OPTIONS: [
                    {id: 'manually', name: this.$t('board.manuallyRefresh'),},
                    {id: 10 * 60 * 1000, name: this.$t('board.every10minutes'),},
                    {id: 15 * 60 * 1000, name: this.$t('board.every15minutes'),},
                    {id: 30 * 60 * 1000, name: this.$t('board.every30minutes'),},
                    {id: 60 * 60 * 1000, name: this.$t('board.every1hour'),},
                    {id: 2 * 60 * 60 * 1000, name: this.$t('board.every2hours'),},
                ],
                refreshTimer: null,
                // 其他操作
                ACTION_OPTIONS: [
                    // todo
                    // {id: 'exportAsPPT', name: '导出为PowerPoint'},
                    // {id: 'setAsSlidesShow', name: '设置为SlidesShow'},
                    // {id: 'setAsScheduledReport', name: '设置为定时报表'},
                    // {id: 'manageScheduledReport', name: '管理定时报表'}
                ],
                // 图表分组
                chartGroups: [],        // 所有的图表分组
                recruitingGroupId: '',  // 正在添加图表的分组
                deletingGroupId: '',    // 正在删除的图表分组ID
                hiddenGroupIds: {},     // 收起的图表分组IDs
                sendDataArray: [],
            };
        },
        computed: {
            ...mapState({
                userId: state => state.user.cid,
                storeBoards: state => state[ANALYSIS_STORE_NAME].boards,
                storeBookmarks: state => state[ANALYSIS_STORE_NAME].bookmarks
            }),
            routeCrumbs() {
                return [
                    {name: 'index', text: 'Dmartech'},
                    {name: 'boards', text: this.$t('home.board')},
                    Object.assign({}, this.$route, {text: this.board.name})
                ];
            },
            boardId() {
                return parseInt(this.$route.params.id);
            },
            board() {
                const id = parseInt(this.$route.params.id);
                return this.storeBoards.find(board => board.id === id);
            },
            // 自动刷新的频率
            refreshInterval: {
                get() {
                    let config = (this.board && this.board.config) ? JSON.parse(this.board.config) : DEFAULT_BOARD_CONFIG;
                    return config.refreshInterval;
                },
                set(newInterval, oldInterval) {
                    if (newInterval !== oldInterval) {
                        this.saveBoard({config: JSON.stringify({refreshInterval: newInterval})});
                        this.$nextTick(() => {
                            this.autoRefresh();
                        });
                    }
                }
            },
            bookmarks() {
                return this.storeBookmarks.filter(list => list.type !== 2);
            },
        },
        created() {
            if (sessionStorage.getItem('boardViewCount') == null) {
                this.$loading();
                WebServiceApiV1
                    .getBoard(this.boardId)
                    .then(({body: {data: {board}}}) => {
                        this.$loaded();
                        this.chartGroups = board.boardGroups;
                        sessionStorage.setItem(
                            'boardViewCount',
                            this.$route.params.id
                        );
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            } else {
                this.$loading();
                WebServiceApiV1
                    .getChartGroups(this.boardId)
                    .then(({body: {data: {boardGroups}}}) => {
                        this.chartGroups = boardGroups;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            }
        },
        mounted() {
            // 1. 初始化自动刷新
            this.autoRefresh();
            // 2. 监听 window resize
            window.addEventListener('resize', this.resize, false);
        },
        beforeDestroy() {
            sessionStorage.removeItem('boardViewCount');
            clearTimeout(this.refreshTimer);
            window.removeEventListener('resize', this.resize, false);
        },
        methods: {
            ...mapMutations([
                UPDATE_BOARD
            ]),
            ...mapActions([
                FETCH_BOOKMARKS
            ]),
            // resize all charts
            resize: debounce(function () {
                if (this.$refs.charts) {
                    this.$refs.charts.forEach(chart => {
                        if (typeof chart.resize === 'function') {
                            chart.resize();
                        }
                    });
                }
            }, 300),
            // 强制刷新
            async refresh() {
                // 1. re-fetch bookmarks
                await this.FETCH_BOOKMARKS();
                // 2. re-fetch all widget's data
                this.$nextTick(() => {
                    this.$refs.charts.forEach(chart => {
                        if (typeof chart.refresh === 'function') {
                            chart.refresh();
                        } else {
                            console.error('刷新所有图/表时，此图/表没有提供refresh方法: ', chart.$el);
                        }
                    });
                });
                // 3. re-launch autoRefresh
                this.autoRefresh();
            },
            autoRefresh: debounce(function () {
                clearTimeout(this.refreshTimer);
                if (typeof this.refreshInterval !== 'number') {
                    return;
                }
                this.refreshTimer = setTimeout(() => {
                    this.refresh();
                }, this.refreshInterval);
            }, 100),
            // 编辑看板名称：开始
            editBoard() {
                this.editing = true;
                this.editingBoardName = this.board.name;
            },
            // 编辑看板名称：结束
            editBoardComplete() {
                if (this.board.name === this.editingBoardName) {
                    this.editing = false;
                    return false;   // name doesn't change
                }
                if (this.editingBoardName === '') {
                    this.editing = false;
                    return false;
                }
                this.saveBoard({name: this.editingBoardName});
                this.editing = false;
            },
            saveBoard(partial = {}) {
                // save the new config
                const newBoard = Object.assign({}, cloneDeep(this.board), partial);
                // save data to back end later.
                this.$loading();
                WebServiceApiV1
                    .update(newBoard)
                    .then(() => {
                        this.$loaded();
                        trackEvent('数据看板-新增组件');
                        // update local state first
                        this.UPDATE_BOARD(newBoard);
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 图表分组管理 - 开关管理下拉列表
            toggleChartGroupManagePanel() {
                if (this.managingChartGroup) {
                    this.closeChartGroupManagePanel();
                } else {
                    this.managingChartGroup = true;
                }
            },
            // 图表分组管理 - 关闭管理下拉列表
            closeChartGroupManagePanel() {
                if (this.managingChartGroup) {
                    this.managingChartGroup = false;
                    this.creatingNewGroupOnPanel = false;
                    this.editingGroupId = '';
                    this.editingGroupName = '';
                    this.deletingGroupIdOnPanel = '';
                }
            },
            orderGroups() {
                WebServiceApiV1.updateGroupOrder(this.board.id, this.chartGroups.map(group => group.id));
            },
            // 图表分组管理 - 添加新的分组
            createGroupOnPanel() {
                this.creatingNewGroupOnPanel = true;
                this.creatingNewGroup = false;
                this.editingGroupId = '';
                this.editingGroupName = '';
            },
            // 图表分组管理 - 添加新的分组
            createGroup() {
                this.creatingNewGroupOnPanel = false;
                this.creatingNewGroup = true;
                this.editingGroupId = '';
                this.editingGroupName = '';
                this.$nextTick(() => {
                    this.$refs.newGroupField.focus();
                });
            },
            // 图表分组管理 - 保存新的分组
            saveNewGroup() {
                if (this.editingGroupName === '') {
                    this.$toast(this.$t('board.groupNameNoEmpty'), 'warn');
                    return false;
                }
                this.creatingNewGroupOnPanel = false;
                this.creatingNewGroup = false;
                this.$loading();
                WebServiceApiV1
                    .createChartGroup(this.boardId, this.editingGroupName)
                    .then(({body: {data: {boardGroup}}}) => {
                        trackEvent('数据看板-新建分组', {name: this.editingGroupName});
                        this.chartGroups.push(boardGroup);
                        this.editingGroupName = '';
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 图表分组管理 - 取消创建新分组
            cancelNewGroup() {
                this.creatingNewGroupOnPanel = false;
                this.creatingNewGroup = false;
                this.editingGroupName = '';
            },
            // 图表分组管理 - 编辑分组名称
            editGroup(group) {
                this.editingGroupName = group.name;
                this.editingGroupId = group.id;
                this.creatingNewGroupOnPanel = false;
                this.creatingNewGroup = false;
            },
            // 图表分组管理 - 更新分组名称
            updateGroup(group) {
                if (this.editingGroupName.trim() === '') {
                    return false;
                }
                this.$loading();
                WebServiceApiV1
                    .updateChartGroup(group.id, this.editingGroupName)
                    .then(({body: {data: {boardGroup}}}) => {
                        group.name = boardGroup.name;
                        trackEvent('数据看板-修改分组名称', {name: this.editingGroupName});
                        this.editingGroupId = '';
                        this.editingGroupName = '';
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 图表分组管理 - 取消编辑分组名称
            cancelEditGroup() {
                this.editingGroupName = '';
                this.editingGroupId = '';
            },
            // 图表分组管理 - 删除
            deleteGroup(group) {
                this.$loading();
                WebServiceApiV1
                    .removeChartGroup(group.id)
                    .then(() => {
                        this.$loaded();
                        trackEvent('数据看板-删除分组', {id: group.id});
                        this.chartGroups.$deleteByKey(group.id);
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // todo 对看板的一些操作
            actionOnBoard(action) {
                switch (action) {
                    default:
                        console.error('一个未定义的概览操作', action);
                }
            },
            // 停止给分组添加图表
            stopRecruiting() {
                this.recruitingGroupId = '';
            },
            // 给图表分组添加一个图表
            recruit(bookmarkId) {
                this.$loading();
                WebServiceApiV1
                    .addChart(bookmarkId, this.recruitingGroupId, JSON.stringify(DEFAULT_CHART_CONFIG))
                    .then(({body: {data: {boardShow}}}) => {
                        this.$loaded();
                        trackEvent('数据看板-新增图表', {id: this.recruitingGroupId});
                        const group = this.chartGroups.find(group => group.id === this.recruitingGroupId);
                        group.boardShows.push(boardShow);
                        this.recruitingGroupId = '';
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 排序
            orderCharts({added, removed, moved}, group) {
                if (added) {
                    WebServiceApiV1.addChart(added.element.bookmarkId, group.id, added.element.config);
                }
                if (removed) {
                    this.deleteChart(removed.element, group);
                }
                if (moved) {
                    WebServiceApiV1.updateChartOrder(group.id, group.boardShows.map(chart => chart.id));
                }
            },
            // 删除一个图/表
            deleteChart(chart, group) {
                this.$loading();
                WebServiceApiV1
                    .removeChart(chart.id)
                    .then(() => {
                        this.$loaded();
                        trackEvent('数据看板-删除图表', {id: chart.id});
                        // fixme 更新书签的原因：移除书签中的被引用记录
                        // this.FETCH_BOOKMARKS();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
                group.boardShows.$deleteByKey(chart.id);
            },
            chartConfigChange(chart, group, newConfigPartial) {
                const oldConfig = JSON.parse(chart.config);
                const newConfig = Object.assign(oldConfig, newConfigPartial);
                chart.config = JSON.stringify(newConfig);
                WebServiceApiV1.updateChart(chart.bookmarkId, group.id, chart.config, chart.id);
            },
            //下载文件的名称
            getExcelName() {
                //去除特殊的字符
                function replaceSpecialStr(str) {
                    let str1 = str.replace(/['"\\/\b\f\n\r\t]/g, '');
                    let str2 = str1.replace(/[|*:"<>?]/g, '');
                    return str2;
                }

                if (this.chartGroups.length > 0) {
                    return replaceSpecialStr(this.board.name) + '.xlsx';
                }
            },
            // 可视化报告数据结构
            reportDataVisual(byFields, measures, tableName, type, filter, unit, start, end) {
                let fields = [];
                let measure = [];
                byFields.forEach(item => {
                    if (item.attrId !== '') {
                        fields.push(item);
                    }
                });
                measures.forEach(item => {
                    if (item.attrId !== '') {
                        measure.push(item);
                    }
                });
                return {
                    byFields: fields,
                    chartType: type,
                    cid: this.userId,
                    filter: filter,
                    fromDate: start,
                    measures: measure,
                    tableName: tableName,
                    toDate: end,
                    unit: unit
                };
            },
            // 属性分析数据结构
            reportDataAttr(measures, byFields, byFieldsFilter, filter) {
                return {
                    cid: this.userId,
                    measures: measures,
                    byFields: byFields,
                    byFieldsFilter: byFieldsFilter,
                    filter: filter,
                };
            },
            // 事件分析数据结构
            reportDataEvent(
                start, end, compareStart, compareEnd, timeType,
                dynamicTimeParams, compareTimeType, compareDynamicTimeParams, measures, byFields,
                unit, filter, attrInfoList
            ) {
                let time = unit !== 'total' ? unit : 'year';
                return {
                    fromDate: start,
                    toDate: end,
                    compareFromDate: compareStart,
                    compareToDate: compareEnd,
                    timeType: timeType,
                    dynamicTimeParams: dynamicTimeParams,
                    compareTimeType: compareTimeType,
                    compareDynamicTimeParams: compareDynamicTimeParams,
                    measures: measures,
                    byFields: byFields,
                    unit: time,
                    filter: filter,
                    attrInfoList: attrInfoList,
                    byFieldsFilter: [''],
                    cid: this.userId,
                };
            },
            // 导出Excel
            downloadExcel() {
                // 所有图标的id数组
                let labelIds = [];
                // 有事件控件的id数组
                let sendIdArray = [];
                // 接口请求数据
                let sendData = [];
                if (this.chartGroups.length === 0) {
                    this.$toast(this.$t('board.addLabelFirst'), 'warn');
                    return;
                }
                this.chartGroups.forEach(item => {
                    item.boardShows.forEach(board => {
                        labelIds.push(board.bookmarkId);
                    });
                });
                if (labelIds.length === 0) {
                    this.$toast(this.$t('board.addLabelFirst'), 'warn');
                    return;
                }
                // 有时间控件的图表去重
                this.sendDataArray = this.sendDataArray.length > 0 ? this.unique(this.sendDataArray) : [];
                this.sendDataArray.forEach(item => {
                    sendIdArray.push(item.bookmarkId);
                });
                // 获取不显示时间控件的可视化报告id
                let differentIds = difference(labelIds, sendIdArray);
                labelIds.forEach(id => {
                    this.bookmarks.forEach(item => {
                        if (item.id === id) {
                            let conditionStr = JSON.parse(item.conditionStr);
                            let filterStr = JSON.parse(item.filterStr);
                            switch (item.type) {
                                case 0: //属性分析
                                    sendData.push({});
                                    sendData[sendData.length - 1].name = item.name;
                                    sendData[sendData.length - 1].type = 'user';
                                    sendData[sendData.length - 1].dtoStr =
                                        JSON.stringify(this.reportDataAttr(conditionStr.measures, conditionStr.byFields,
                                            conditionStr.byFieldsFilter, conditionStr.filter));
                                    break;
                                case 1:  //事件
                                    this.sendDataArray.forEach(date => {
                                        if (date.bookmarkId === id) {
                                            let measuresArr = [];
                                            sendData.push({});
                                            conditionStr.measures.forEach(item => {
                                                item.attrName = item.alias;
                                                measuresArr.push(item);
                                            });
                                            sendData[sendData.length - 1].name = item.name;
                                            sendData[sendData.length - 1].type = 'event';
                                            sendData[sendData.length - 1].dtoStr =
                                                JSON.stringify(this.reportDataEvent(date.dateEventAnalysis.start,
                                                    date.dateEventAnalysis.end,
                                                    date.dateEventAnalysis.compareStart,
                                                    date.dateEventAnalysis.compareEnd,
                                                    date.dateEventAnalysis.timeType,
                                                    date.dateEventAnalysis.dynamicTimeParams,
                                                    date.dateEventAnalysis.compareTimeType,
                                                    date.dateEventAnalysis.compareDynamicTimeParams,
                                                    measuresArr, conditionStr.byFields, filterStr.unit,
                                                    conditionStr.filter, conditionStr.attrInfoList));
                                        }
                                    });
                                    break;
                                case 3:  //可视化
                                    // 有时间控件
                                    this.sendDataArray.forEach(date => {
                                        if (date.bookmarkId === id) {
                                            sendData.push({});
                                            sendData[sendData.length - 1].name = item.name;
                                            sendData[sendData.length - 1].type = 'schedule';
                                            sendData[sendData.length - 1].dtoStr =
                                                JSON.stringify(this.reportDataVisual(conditionStr.byFields,
                                                    conditionStr.measures,
                                                    conditionStr.tableName, filterStr.type,
                                                    conditionStr.filter, filterStr.unit,
                                                    date.fromDate, date.toDate));
                                        }
                                    });
                                    // 没有时间控件
                                    differentIds.forEach(differentId => {
                                        if (differentId === item.id) {
                                            sendData.push({});
                                            sendData[sendData.length - 1].name = item.name;
                                            sendData[sendData.length - 1].type = 'schedule';
                                            sendData[sendData.length - 1].dtoStr =
                                                JSON.stringify(this.reportDataVisual(conditionStr.byFields,
                                                    conditionStr.measures,
                                                    conditionStr.tableName, filterStr.type,
                                                    conditionStr.filter, filterStr.unit, '', ''));
                                        }
                                    });
                                    break;
                            }
                        }
                    });
                });
                this.exportExcel(sendData);
            },
            //下载报表数据
            exportExcel(data) {
                this.$loading();
                let name = this.getExcelName();
                QueryApi
                    .exportExcel(data)
                    .then(res => {
                        downloadArrayBufferAsFile(name, res.body, 'text/html')
                            .catch(err => {
                                let msg = typeof err === 'string' ? err : this.$t('board.downloadError');
                                this.$toast(msg, 'warn');
                            });
                        this.$loaded();
                        trackEvent('数据看板-下载');
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            updateDate(chart, data) {
                this.$nextTick(() => {
                    let isExit = false;
                    this.sendDataArray.forEach((item, index) => {
                        if (item.bookmarkId === data.bookmarkId && item.groupId === chart.groupId) {
                            this.sendDataArray[index] = data;
                            isExit = true;
                        }
                    });
                    if (!isExit) {
                        this.sendDataArray.push(data);
                    }
                });
            },
            // 数组去重
            unique(arr) {
                let res = [arr[0]];
                for (let i = 1; i < arr.length; i++) {
                    let repeat = false;
                    for (let j = 0; j < res.length; j++) {
                        if (arr[i].bookmarkId === res[j].bookmarkId) {
                            repeat = true;
                            break;
                        }
                    }
                    if (!repeat) {
                        res.push(arr[i]);
                    }
                }
                return res;
            },
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .board {

        h1:hover .board-name-editor {
            opacity: 1;
        }

        // 看板名称 - 编辑图标
        .board-name-editor {
            display: inline-block;
            opacity: 0;
            width: 14px;
            height: 14px;
            vertical-align: top;
            margin: ($input-field-height - 14px)/2 0;
            fill: $color-light-content;
            @include transition();
            cursor: pointer;

            &:hover {
                fill: $light-theme;
            }

            &:active {
                fill: $dark-theme;
            }
        }

        // 分组管理
        .chart-group-manage {
            position: relative;
            display: inline-block;
            vertical-align: top;
            width: 14px;
            height: 14px;
            margin: ($input-field-height - 14px)/2 0 0 8px;

            .icon-btn {
                display: block;
                width: 14px;
                height: 14px;
                fill: $theme;
                cursor: pointer;
            }

            .chart-group-drop-list {
                position: absolute;
                z-index: 1;
                top: 25px;
                min-width: 200px;
                max-width: 300px;
                left: -27px;
                padding: 6px 0;
                white-space: nowrap;
                background-color: white;
                border-radius: 4px;
                border: 1px solid $border-color;
                @include box-shadow(0 3px 8px rgba(#8b9daf, .16));

                .tail {
                    $size: 5px * 1.414;
                    position: absolute;
                    z-index: 1;
                    top: 0;
                    left: 32px;
                    width: $size;
                    height: $size;
                    margin: (-$size/2) 0 0 (-$size/2);
                    border-top: 1px solid $border-color;
                    border-left: 1px solid $border-color;
                    border-top-left-radius: 2px;
                    background-color: white;
                    @include transform(rotate(45deg));
                    @include box-shadow(-1px -1px 1px rgba(#8b9daf, .16));
                }

                .group {
                    padding: 0 8px 0 14px;
                    @include user-select(none);

                    &.edit {
                        padding: 0;
                        @include user-select(auto);
                    }

                    &.active,
                    &:hover {
                        background-color: $select-bg;
                    }

                    .chart-group-name {
                        @include ellipsis;
                    }
                }

                .edit-group-form {
                    padding: 4px 8px;
                    background-color: $select-bg;
                    line-height: 0;
                    @include clearfix();

                    .edit-group-form-width-holder {
                        height: 0;
                        overflow: hidden;
                    }

                    input[type="text"] {
                        display: block;
                        @include box-sizing();
                        width: 100%;
                        line-height: 20px;
                        padding: 2px .5em;
                        border: none;
                        outline: none;
                        background-color: white;

                        ~ .btn {
                            margin-top: 4px;
                            margin-left: 8px;
                        }
                    }
                }

                .add-group-action {
                    padding: 0 8px 0 14px;
                    color: $theme;
                    cursor: pointer;
                }
            }
        }

        // 图标下拉框
        .icon-size {
            margin-left: 16px;
        }

        // 分享信息
        .share-info {
            float: right;
            margin-right: 16px;

            $size: 24px;

            .share-btn {
                position: relative;
                height: $size;
                line-height: $size - 2px;
                vertical-align: top;
                margin-top: ($input-field-height - $size)/2;
                padding: 0 $size 0 0;
                border: none;
                @include appearance(none);
                cursor: pointer;
                color: $theme;
                background-color: transparent;

                &:hover {
                    color: $light-theme;

                    .avatar {
                        margin-right: -4px;
                        border-color: currentColor;
                        background-color: white;
                    }
                }

                &:active {
                    color: $dark-theme;
                }

                &:before {
                    position: absolute;
                    z-index: 1;
                    right: 0;
                    top: 0;
                    width: $size - 2px;
                    margin-left: -8px;
                    border-radius: 100%;
                    border: 1px dashed currentColor;
                    background-color: white;
                    @include transition(border-color .2s linear);
                }

                .avatar {
                    float: left;
                    width: $size - 2px;
                    height: $size - 2px;
                    margin-right: -8px;
                    border: 1px solid $border-color;
                    border-radius: 100%;
                    background-color: $content-bg;
                    @include transition();
                }
            }
        }

        // 报表分组
        .report-group {
            margin-bottom: 6px;
        }

        .report-group-head {
            font-size: 18px;
            line-height: 49px;
            border-bottom: 1px solid $border-color;

            h2 {
                display: inline-block;
                font-weight: normal;
            }
        }

        .report-group-action {
            position: relative;
            float: right;
            width: 16px;
            height: 16px;
            margin: 17px 0 0 16px;

            @at-root .report-group-icon-btn {
                display: block;
                width: 100%;
                height: 100%;
                padding: 0;
                border: none;
                border-radius: 100%;
                @include appearance(none);
                cursor: pointer;
                background-color: $form-border;

                svg {
                    display: block;
                    fill: white;
                }

                &.plus {
                    &:hover {
                        background-color: $light-theme;
                    }

                    &:active {
                        background-color: $dark-theme;
                    }

                    svg {
                        width: 10px;
                        height: 10px;
                        margin: 3px auto;
                    }
                }

                &.arrow-down {
                    @include transition();

                    &:hover {
                        background-color: $light-blue;
                    }

                    &:active {
                        background-color: $dark-blue;
                    }

                    &.open {
                        @include transform(rotate(180deg));
                    }

                    svg {
                        width: 8px;
                        height: 8px;
                        margin: 4px auto;
                    }
                }

                &.close {
                    &:hover {
                        background-color: $light-red;
                    }

                    &:active {
                        background-color: $dark-red;
                    }

                    svg {
                        width: 8px;
                        height: 8px;
                        margin: 4px auto;
                    }
                }
            }
        }

        .new-report-group-btn {
            display: block;
            width: 100%;
            line-height: 46px;
            margin-top: 1em;
            margin-bottom: 80px;
            padding: 0;
            border: 1px dashed $border-color;
            text-align: center;
            color: $color-light-content;
            background-color: white;
            cursor: pointer;
            @include transition();

            &:hover {
                color: $light-theme;
                background-color: darken(white, 1%);
            }

            &:active {
                color: $dark-theme;
                background-color: darken(white, 1%);
            }

            svg {
                width: 10px;
                height: 10px;
                fill: currentColor;
            }
        }

        .new-group-form {
            display: flex;
            align-items: center;
            border-bottom: 1px solid $border-color;

            .new-group-field {
                flex: 1;
                border: none;
                padding: 0;
                font-size: 18px;
                line-height: 49px;
                background-color: transparent;
            }
        }

        .board-charts {
            padding-top: 10px;
            min-width: 1000px;
            margin: 0 calc(3% - 12px);

            p {
                text-align: center;
                font-style: italic;
                line-height: 4em;
                color: $disabled;
                @include user-select(none);
            }
        }

        .download-btn {
            margin-left: 8px;
            position: relative;
            cursor: pointer;

            svg {
                height: 16px;
                width: 16px;
                fill: $green;
                position: relative;
                top: 4px;
            }
        }
    }

</style>
