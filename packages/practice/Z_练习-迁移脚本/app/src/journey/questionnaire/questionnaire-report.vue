<template>
    <!--表单报告-->
    <div class="content-container questionnaire-report">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <!--头部表单名称展示、发送报告设置按钮、下载详情按钮-->
            <div class="content-view statistics-detail">
                <div class="tab-links" v-if="$route.query.formSource==3">
                    <div class="tab-link" :class="{active:statType===1}" @click="statisticsDetail">{{'form.breakdown' | t}}</div>
                    <div class="tab-link" :class="{active:statType===2}" @click="statisticsOverview">{{'form.overview' | t}}</div>
                </div>
                <h1 v-if="$route.query.formSource==2">{{paperName}}</h1>
                <div>
                    <!--                    统计概览 显示日期选择期-->
                    <date-range format="YYYY-MM-DD" :start="startDate" :end="endDate"
                                @change="changeDate" v-if="statType===2" :partCuts="partCuts"/>
                    <button class="btn btn-md btn-theme send-report"
                            :disabled="$has('journey_form_standard_data')"
                            @click="sendReportAction">
                        {{'form.reportSending' | t}}
                    </button>
                    <button class="btn btn-md btn-theme"
                            :disabled="$has('journey_form_download_statistics')"
                            @click="goDownload">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-download"></use>
                        </svg>
                        {{'form.downloadData' | t}}
                    </button>
                </div>
            </div>
        </div>
        <div class="page-content">
            <!-- 统计明细-->
            <div class='content-view white-bg margin padding' v-if="statType===1">
                <!--提交人数和提交次数 2020.8 线索管理 需求  标准表单显示筛选；金数据显示提交数据-->
                <!--标准表单筛选-->
                <div class="form-filter-wrapper" v-if="formSource === 3">
                    <div class="switch" :class="{expanded}" @click="toggle">
                        {{'form.filterCondition' | t}}
                        <span v-if="companyType===2">({{conditionsNum}}{{'form.conditions' | t}})</span>
                        <svg class="arrow-down" aria-hidden="true">
                            <use xlink:href="#icon-arrow-down"></use>
                        </svg>
                    </div>
                    <!-- 世邦书签 -->
                    <div class="toolbar bookmark" v-if="companyType===2">
                        <span v-if="changeBms" class="toolbar-action" @click="checkoutBookmark">{{$t('eventAnalysis.restoreBookmark')}}</span>
                        <!-- 保存为书签 -->
                        <div class="toolbar-btn" @click.self="openBookmark"
                            v-blur="closeBookmark">
                            <svg aria-hidden="true" @click="openBookmark">
                                <use xlink:href="#icon-star"></use>
                            </svg>
                            {{$t('eventAnalysis.saveAsBookmark')}}
                            <bookmark-form v-if="bookmarkFormOpen" @createBookMark="saveBookmark" @hide="closeBookmark" 
                                :headerBookMarkName="bookmarkName" :bookMarkId="bookmarkId" 
                                @deleteBookMark='delBookmarkById'/>
                        </div>
                        <!-- 书签库 -->
                        <div class="toolbar-btn" v-blur="closeBookmarkLib" @click.self="bookmarkLibOpen = !bookmarkLibOpen">
                            <svg aria-hidden="true" @click="bookmarkLibOpen = !bookmarkLibOpen">
                                <use xlink:href="#icon-bookmarks"></use>
                            </svg>
                            {{'eventAnalysis.bookmarkLibrary' | t}}
                            <bookmark-library :options="bookmarks" v-if="bookmarkLibOpen" :value="bookmarkId"
                                            @hide="closeBookmarkLib" @choose="chooseBookmark"/>
                        </div>
                    </div>
                    <transition name="drop">
                        <div class="query" v-show="expanded">
                            <!--添加筛选条件按钮-->
                            <div class="form-field" v-if="companyType!==2">
                                <label class="label"></label>
                                <span class="theme-text">{{'form.addFilter' | t}}</span>
                                <span class="icon icon-tianjia add-icon" @click="addFilter()"></span>
                            </div>
                            <!--筛选条件选择框-->
                            <div class="form-field flex">
                                <label class="label"></label>
                                <div class="field-group" v-if="expanded">
                                    <!-- 标准版 -->
                                    <form-query-filter v-if="companyType!==2 && filterList.conditions.length > 0" 
                                        :groups="questionnaireFields" :filter="filterList"
                                                       @change="ChangeFilter($event)"
                                                       @update="ChangeFilter($event)"
                                                       :type="'form'"
                                                       :calenderFormat="'yyyy-mm-dd hh:ii'"/>
                                    <!-- 世邦 -->
                                    <form-query-filter-shibang v-else-if='companyType ===2' :groups="questionnaireFields" :filter="filter"
                                                       @addFilterGroup="addFilterGroup"
                                                       @changeRelation="changeRelation"
                                                       :type="'form'"
                                                       :calenderFormat="'yyyy-mm-dd hh:ii'"/>
                                </div>
                            </div>
                            <div class="filter-btn">
                                <!--应用筛选条件-->
                                <button class="btn btn-sm btn-theme" type="button" v-if="companyType!==2 && filterList.conditions.length > 0" @click="filterApplication">
                                    {{'form.application' | t}}
                                </button>
                                <!--世邦应用筛选条件-->
                                <button class="btn btn-sm btn-theme" type="button" v-if="companyType===2 && filter.filterGroup.length > 0" @click="filterApplicationShiBang">
                                    {{'form.run' | t}}
                                </button>
                                <!--清空条件-->
                                <button class="btn btn-sm btn-white" type="button" v-if="filterList.conditions.length > 0 || filter.filterGroup.length > 0" @click="filterClear">
                                    {{'form.clear' | t}}
                                </button>
                            </div>
                        </div>
                    </transition>
                </div>
                <!--提交相关数据-->
                <div class='report-counts' v-if="formSource === 2">
                    <div class='report-count'>
                        <h3>{{submitTime}}</h3>
                        <br>
                        <p>{{'form.entrie' | t}}</p>
                    </div>
                    <div class='report-count'>
                        <h3>{{submitPerson}}</h3>
                        <br>
                        <p>{{'form.submitter' | t}}</p>
                    </div>
                </div>
                <!--表格数据筛选、搜索、删除、表单可展示表头选择框-->
                <div class="head-select">
                    <button class="btn btn-md btn-theme head-select-left" v-if="formSource === 3"
                            :disabled="$has('journey_form_delete_fromdata') || formIds.length === 0"
                            @click="delShow = true">
                        {{'common.del' | t}}
                    </button>
                    <div class="head-select-right">
                        <!--搜索和下拉菜单-->
                        <div class="pull-right search-box search-name" v-if="formSource === 3">
                            <input type="text" :placeholder="companyType === 2 ? '' :$t('common.pleaseChoose')" v-model.trim="keyword"
                                   @keyup.enter="searchForm" :disabled="searchDisabled">
                            <svg aria-hidden="true" @click="searchForm">
                                <use xlink:href="#icon-search"></use>
                            </svg>
                        </div>
                        <!-- 世邦账号下拉框组件 -->
                        <selectorCheckbox v-if="companyType === 2 && formSource === 3" class="pull-right" unique-key="fieldId" v-model="fieldId" 
                            :options="searchFieldOptions" :search="searchFieldOptions.length > 0" ref="selectorCheckbox"></selectorCheckbox>
                        <!-- 标准账号下拉框组件 -->
                        <selector v-else-if="formSource === 3" class="pull-right" unique-key="fieldId" v-model="fieldId" 
                            :options="searchFieldOptions" :search="searchFieldOptions.length > 0"></selector>
                        <questionnaire-table-attribute-selector class="pull-right" v-if="!isFirst"
                                                                @searchOpt="searchOpt"
                                                                @change="selectedAttrsChanged">
                        </questionnaire-table-attribute-selector>
                    </div>
                </div>
                <div class="table-content">
                    <!--表单统计-->
                    <div class="simplify-table table-body"
                         ref="tableContainer" v-if="selectedFieldIds.length != 0 && subscriptionList.length != 0">
                        <table :key='tableKey'>
                            <thead class="table-head">
                            <tr>
                                <th width="50" v-if="selectedFields.length !=0 && formSource === 3" class="first-th">
                                    <checkbox :source="false"
                                              v-model="allChecked"
                                              :title="allChecked ? $t('common.cancelAll') : $t('common.allSelected')"/>
                                </th>
                                <th v-if="selectedFields.length===0"></th>
                                <th :class="{'two-lines-th': (item.content === 'inquiryId' && companyType === 2)}" :style="{minWidth:fieldWidth[index]+'px'}"
                                    v-for="(item,index) in selectedFields" :key="index">
                                    {{language === 'en' ? item.content : item.formRemark}}
                                </th>
                            </tr>
                            </thead>
                            <tbody class="tbody">
                                <tr v-for="(list, index) in subscriptionList" :key="index" @click="showFormEditor(list)">
                                    <td width="50" @click.stop v-if="formSource === 3" class="first-th">
                                        <checkbox v-model="formIds" :source="list._id"></checkbox>
                                    </td>
                                    <td :title="list[item.content]" class="items" v-for="(item, idx) in selectedFields" :key="idx"
                                        :style="{minWidth:fieldWidth[idx]+'px'}"
                                        :class="{'two-lines-td':(item.content === 'inquiryId' && companyType === 2)}">
                                        <p :class="{'two-lines': (item.content === 'inquiryId' && companyType === 2)}">
                                            {{list[item.content]}}
                                            <!-- 复制询盘id -->
                                            <svg v-if="item.content === 'inquiryId' && companyType === 2 && list[item.content]"
                                                class="svg action-icon icon-copy" @click.stop="copyText(list[item.content])"
                                                v-title:top="$t('common.copy')">
                                                <use xlink:href="#icon-copy"></use>
                                            </svg>
                                            <!-- 复制信息id -->
                                            <svg v-if="item.content === 'info_id' && companyType === 2 && list[item.content]"
                                                class="svg action-icon icon-copy" @click.stop="copyText(list[item.content])"
                                                v-title:top="$t('common.copy')">
                                                <use xlink:href="#icon-copy"></use>
                                            </svg>
                                        </p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!--暂无数据-->
                    <div class="simplify-table "
                         ref="tableContainer" v-if="(selectedFieldIds.length ===0 || subscriptionList.length === 0)&&isComplete">
                        <list-empty :name="$t('form.form')"/>
                    </div>
                </div>
                <!--分页-->
                <div class="page-wrapper" v-if="isComplete">
                    <div class="elementNumer">
                        {{'report.totalPages' | t}} {{selectedFieldIds.length ? totalElement : 0}} {{'form.oneRecord'|t}}（{{'form.submitter' | t}}： {{selectedFieldIds.length ? submitPerson : 0}}）
                    </div>
                    <pager :total="totalPage" :now="nowPage" @page="handlePage">
                        {{'contact.everyPage' | t}}
                        <selector :options="pageSizeOptions" :value="size" @input="tapPagesHander" class="tiny"/>
                        {{'contact.maxPage' | t}}
                    </pager>
                </div>
            </div>
            <!--            统计概览-->
            <div class="content-view white-bg margin padding" v-if="statType===2">
                <statistics-overview ref="overview" :formId="questionnaireId" :createdTime="createdTime"
                                     :startDate="startDate" :endDate="endDate"></statistics-overview>
            </div>
        </div>
        <!--删除确认框-->
        <modal :title="$t('common.notice')" v-if="delShow" @close="delShow = false">
            <div>
                {{'form.promptDetail' | t}}
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')"
                       @click="delShow = false"/>
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" @click="delForm"/>
            </template>
        </modal>

        <!--华为2.4.6下载详情-->
        <download-detail-modal v-if="downloadDetailFlag" :themeModules="'formDownload'"
                               :emailDownload="true" :customizeModalTitle="$t('form.downloadData')"
                               @cancel="cancelDownload" @okDownload="downloadReport"></download-detail-modal>

        <!-- 编辑数据 -->
        <clue-data v-if="showClueData" @close="showClueData = false" :answersList="allFormAttrs"
                   :answerItem="answerItem" :form-info="baseInfo" :form-json="formJson" :selectedFields="selectedFields"
                   :paper-id="questionnaireId" @saved="updateFormDataDone" @showFormEditor="showFormEditor"/>
    </div>
</template>
<script>

    import {I18N_STORE_NAME} from '@/locales';
    import FormQueryFilter from './common/form-query-filter.vue';
    import FormQueryFilterShibang from './components/form-query-filter-shibang.vue';
    import cloneDeep from 'lodash/cloneDeep';
    import clueData from './common/clue-data.vue';
    import questionnaireTableAttributeSelector from './common/questionnaire-table-attribute-selector.vue';
    import {subDays, format, startOfISOWeek} from 'date-fns';
    import statisticsOverview from './statistics-overview.vue';
    import selectorCheckbox from './components/selector-checkbox.vue';
    import BookmarkForm from './components/bookmark-form.vue';
    import BookmarkLibrary from './components/bookmark-library.vue';
    import { QuestionnaireApiAuth, QuestionnaireApiV1 } from '@/api';
    import { mapState } from 'vuex';

    export default {
        data() {
            return {
                questionnaireFields: [],    // 当前表单包含的字段
                selectedFields: [],         // 选择的表单表头字段
                selectedFieldIds: [],       // 选择的表单表头字段Id
                subscriptionList: [],       // 表单提交记录列表
                // 提交次数
                submitTime: '',
                // 提交人数
                submitPerson: '',
                // 当前页
                nowPage: 1,
                // 每页显示条数
                size: 10,
                // 总页数
                totalPage: 1,
                // 总条数
                totalElement: 0,
                paperName: '',              // 表单名称
                formSource: '',             // 表单类型 2:金数据表单，3:标准表单
                isAccess: false,

                formIds: [],//删除操作 选中的表单
                delShow: false,             // 删除模态框显隐
                keyword: '',//关键字
                fieldId: '',//搜索时选中的字段值id
                formContent: '',//搜索时选中的字段值string
                searchFieldOptions: [],//搜索时可选的字段值[]

                //下载详情
                downloadDetailFlag: false,

                //标准表单 筛选条件
                expanded: false,//筛选drop展开收起
                filterRelation: 0,
                fieldIdsStr: '',
                //标准表单筛选条件
                filterList: {
                    conditions: [],
                    relation: 0
                },
                showClueData: false,
                formJson: '',// 当前表单配置JSON
                baseInfo: '',// 编辑数据模块， 基本数据
                pageSizeOptions: [//每页显示条数可选
                    {id: 50, name: 50},
                    {id: 30, name: 30},
                    {id: 20, name: 20},
                    {id: 10, name: 10}
                ],
                allFormAttrs: [],//表单字段
                answerItem: '',

                statType: 1,//统计类型 1明细 2概览
                partCuts: ['YESTERDAY', 'TODAY', 'LAST_WEEK', 'THIS_WEEK', 'LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS'],
                startDate:'',
                endDate:'',
                createdTime: '',//表单创建日期
                //世邦表单筛选条件
                filter:{
                    filterGroup: [],
                    filterRelation: 0
                },
                // 书签表单 显示/隐藏
                bookmarkFormOpen: false,
                // 书签列表 显示/隐藏
                bookmarkLibOpen: false,
                bookmarkName: '',//书签名称
                filterCopy:{
                    filterGroup: [],
                    filterRelation: 0
                },
                bookmarks: [],//书签列表
                bookmarkId: '',// 选中的书签id
                isFirst: true,//是否第一次调用
                conditionsNum: 0,//筛选条件数量
                fieldWidth: [], //字段宽度的数组
                tableKey: 0,
                isComplete: false //是否完成请求
            };
        },
        watch: {
            fieldId() {
                this.searchFieldOptions.forEach(f => {
                    if (f.fieldId === this.fieldId) {
                        this.formContent = f.formContent;
                    }
                });
            }
        },
        computed: {
            ...mapState({
                // 系统当前语言
                language: state => state[I18N_STORE_NAME].lang,
                //公司类型 2为世邦用户
                companyType: state => state.user.companyType
            }),
            // 导航
            crumbs() {
                return [
                    {name: 'journey', text: 'Dmartech'},
                    {name: 'journeyFormManagement', text: this.$t('home.leads'), params: {id: 0}},
                    Object.assign({}, this.$route, { text: this.paperName })
                ];
            },
            // 表单Id
            questionnaireId() {
                return this.$route.query.id;
            },
            // 控制checkbox全选按钮状态
            allChecked: {
                get() {
                    //返回布尔值判断状态是否为选中状态
                    return this.formIds.length === this.subscriptionList.length && this.subscriptionList.length !== 0;
                },
                set(newval) {
                    if (newval) {
                        this.formIds = this.subscriptionList.map(item => item._id);
                    } else {
                        this.formIds = [];
                    }
                }
            },
            //书签变动时
            changeBms() {
                if (this.bookmarkId) {
                    let filter = JSON.stringify(this.filter);
                    let filterCopy = JSON.stringify(this.filterCopy);
                    const isChange = !(filterCopy === filter);
                    return isChange;
                }
            },
            searchDisabled() {
                return !this.fieldId && this.companyType === 2;
            }
        },
        components: {
            FormQueryFilter,
            clueData,
            questionnaireTableAttributeSelector,
            statisticsOverview,
            selectorCheckbox,
            FormQueryFilterShibang,
            BookmarkForm,
            BookmarkLibrary
        },
        mounted() {
            this.formIds = [];
            this.nowPage = this.$route.query.pageNo ? ~~this.$route.query.pageNo : 1;
            const pageData = localStorage.getItem('PAGE_SIZE');
            if (pageData && JSON.parse(pageData).questionnaireReport) {
                this.size = ~~JSON.parse(pageData).questionnaireReport;
            }
            /*eslint-disable-next-line*/
            if (this.$route.query.formSource == 3) {
                this.getFormInfos();
            }
            if (this.companyType === 2) {
                this.getFieldOptions();
                this.getBookmarks();
            }  else {
                this.getFormDetails(this.questionnaireId);
            }
            // 操作验证
            QuestionnaireApiAuth
                .downloadDetailAccess({paperId: this.questionnaireId, type: 9})
                .then((res) => {
                    this.isAccess = res.body.data.isAccess === 1 ? false : true;
                });
        },
        methods: {
            fieldWidthInit() {
                this.fieldWidth = [];
                this.tableKey += 1;
                this.$nextTick(() => {   
                    if (!document.getElementsByTagName('tbody')[0]) return;
                    this.fieldWidthCompute();
                });
            },
            //列表字段宽度自适应
            fieldWidthCompute() {
                let fieldWidth = []; //每个字段的最大宽度
                let thead = document.getElementsByTagName('thead')[0].querySelectorAll('tr')[0].querySelectorAll('th');
                const isJSj = this.formSource === 2; //true：金数据，false:标准

                document.getElementsByTagName('tbody')[0].querySelectorAll('tr').forEach((tr) => {
                    tr.childNodes.forEach((td,index) =>{
                        if (index !== 0 && td.nextSibling) {
                            let width = td.nextSibling.clientWidth > 80 ? td.nextSibling.clientWidth : 115;
                            let theadIndex = isJSj ? index - 1 : index;
                            let theadWidth = thead[theadIndex].clientWidth;

                            if (fieldWidth[index - 1]) {
                                fieldWidth[index - 1] = fieldWidth[index - 1] > width ? fieldWidth[index - 1] : width;
                                fieldWidth[index - 1] = fieldWidth[index - 1] > theadWidth ? 
                                    fieldWidth[index - 1] : theadWidth;
                            } else {
                                fieldWidth[index - 1] = width;
                            }
                        }
                    });
                });
                this.fieldWidth = fieldWidth;
            },
            //计算筛选条件的个数
            conditionsNumCompute() {
                this.conditionsNum = 0;
                this.filter.filterGroup.forEach((e) => {
                    this.conditionsNum += e.filterList.length;
                });
            },
            //复制文字
            copyText(text) {
                const el = document.createElement('textarea');
                el.value = text;
                el.setAttribute('readonly', '');
                el.style.position = 'absolute';
                el.style.left = '-9999px';
                document.body.appendChild(el);
                const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                if (selected) {
                    document.getSelection().removeAllRanges();
                    document.getSelection().addRange(selected);
                }
                this.$toast(this.$t('common.copySuccess'), 'success');
            },
            //获取书签列表
            getBookmarks() {
                this.bookmarkId = '';
                QuestionnaireApiV1.getBookmarkList(this.questionnaireId)
                    .then((res) => {
                        if (res.body.code === 200) {
                            this.bookmarks = res.body.data.resultList;
                            let id = '';
                            let item;
                            this.bookmarks.map((e) => {
                                if (e.type === 1) {
                                    id = e.id;
                                    item = e;
                                } 
                            });
                            if (id) {
                                this.bookmarkId = id;
                                this.chooseBookmark(item,true);
                            } else {
                                if (this.isFirst) this.getFormDetails(this.questionnaireId);
                            }
                        } else {
                            this.$toast(res.body.message, 'warn');
                        }
                    });
            },
            //得到书签详情
            checkoutBookmark() {
                this.filter = cloneDeep(this.filterCopy);
            },
            //打开保存标签页面
            openBookmark() {
                this.bookmarkFormOpen = true;
                if (this.bookmarkId) {
                    this.bookmarks.map((e) => {
                        if (e.id === this.bookmarkId) this.bookmarkName = e.name;
                    });
                }
            },
            // 关闭书签表单
            closeBookmark() {
                this.bookmarkFormOpen = false;
                if (!this.bookmarkId) this.bookmarkName = '';
            },
            // 关闭书签列表
            closeBookmarkLib() {
                this.bookmarkLibOpen = false;
            },
            //选择书签
            chooseBookmark(item,isNotLeave) {
                if (this.changeBms && !isNotLeave) {
                    this.$confirm(this.$t('form.willBeLeaving'), this.$t('form.leavePrefix') + this.bookmarkName + this.$t('form.leaveSuffix'))
                        .then(sure => {
                            if (sure) {
                                this.chooseBookmarkAfter(item);
                            }
                        });
                } else {
                    this.chooseBookmarkAfter(item);
                }
            },
            //选择书签后面的逻辑处理
            chooseBookmarkAfter(item) {
                this.bookmarkId = item.id;
                this.bookmarkName = item.name;
                if (item.isFilterClear) {
                    this.filterClear();
                } else {
                    this.filter = JSON.parse(item.filter);
                    this.filter.filterGroup = cloneDeep(this.filter.filterList);
                    this.filterRenderToFront(this.filter);
                    delete this.filter.filterList;
                    this.filter.filterRelation -= 1; // 前端 0为且 1为或 ，后端 1为且 2为或 加-1处理
                    this.filterApplicationShiBang();
                }
            },
            //删除书签
            delBookmarkById() {
                QuestionnaireApiV1.deleteBookmark(this.bookmarkId)
                    .then((res) => {
                        this.bookmarks.splice(this.bookmarks.findIndex(item => item.id === this.bookmarkId), 1);
                        this.chooseBookmark({id: '',name: '',isFilterClear: true},true);
                        this.$toast(res.body.message, 'success');
                    });
            },
            //保存书签
            saveBookmark(creatingNewBookmark){
                const paperId = this.questionnaireId;
                if (this.filter.filterGroup.length === 0) {
                    return this.$toast(this.$t('form.keepAtLeast1Condition'), 'success');
                }
                const filter = JSON.stringify({
                    filterList: this.structureGroupCreate(this.filter).copyGroup,
                    filterRelation: this.filter.filterRelation + 1 // 前端 0为且 1为或 ，后端 1为且 2为或 加+1处理
                });
                if (creatingNewBookmark) {
                    if (this.bookmarks.length >= 50) return this.$toast(this.$t('form.createUpTo50Bookmarks'), 'warn');
                    // 新增
                    QuestionnaireApiV1.addBookmark(paperId, this.bookmarkName, filter)
                        .then((res) => {
                            this.getBookmarks();
                            this.$toast(res.body.message, 'success');
                            this.bookmarkName = '';
                            this.bookmarkFormOpen = false;
                        });
                } else {
                    // 编辑
                    QuestionnaireApiV1.updateBookmark(paperId, this.bookmarkName, filter, Number(this.bookmarkId))
                        .then((res) => {
                            this.getBookmarks();
                            this.$toast(res.body.message, 'success');
                            this.bookmarkFormOpen = false;
                        });
                }
            },
            //获取属性下拉列表
            getFieldOptions() {
                const id = this.questionnaireId;
                QuestionnaireApiAuth
                    .downloadDetailAccess({
                        paperId: id,
                        type: 4,
                    })
                    .then(({body:{data:{isAccess}}})=>{
                        if (isAccess === 1) {
                            QuestionnaireApiV1
                                .getFormTitle({id})
                                .then(({body: {data: {questionsList}}}) => {
                                    // 所有属性列表
                                    let allAttrs = questionsList.map(q => Object.assign({}, q, {
                                        id: q.id,
                                        name: this.language === 'en' ? q.content : q.formRemark
                                    }));
                                    //去掉时间事件类型
                                    this.searchFieldOptions = allAttrs.filter((e)=>{
                                        return  e.type !== 2;
                                    });
                                    //渲染下了框中选中id
                                    let ids = [];
                                    this.searchFieldOptions.forEach((e,i)=>{
                                        if (e.searchCheck) ids.push(i);
                                    });
                                    this.$nextTick(()=>{
                                        setTimeout(()=>{
                                            this.$refs.selectorCheckbox.init(ids);
                                        },1500);
                                    });
                                });
                        } else if (isAccess === 0) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            //搜索时保存选中id
            saveCheckboxIds() {
                const ids = [];
                this.searchFieldOptions.forEach(e=>{
                    if (this.fieldId.includes(e.formContent)) {
                        ids.push(e.id);
                    }
                });
                QuestionnaireApiV1.searchCheck(this.questionnaireId,ids)
                    .then((res) => {
                        if (res.body.code !== 200) {
                            this.$toast(res.body.message, 'warn');
                        }
                    });
            },
            //下载详情
            goDownload() {
                if (this.isAccess) {
                    this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                    return;
                }
                this.downloadDetailFlag = true;
            },
            // 确认下载详情
            cancelDownload() {
                this.downloadDetailFlag = false;
            },
            // 点击下载报告
            downloadReport(info) {
                this.downloadDetailFlag = false;
                let filterList;
                if (this.companyType === 2) {
                    filterList = this.structureGroupCreate(this.filterCopy).copyGroup;
                } else {
                    filterList = this.structureFilterCreate();
                }
                
                // 金数据、普通表单统一用一个接口 2020.03.06
                QuestionnaireApiV1
                    .downloadForm(
                        this.questionnaireId,
                        info.formatType,
                        info.dataFormat,
                        info.emailSubject,
                        info.emailAddress,
                        this.fieldIdsStr.substring(0, this.fieldIdsStr.length - 1),
                        JSON.stringify(filterList),
                        // 前端 0为且 1为或 ，后端 1为且 2为或 加+1处理
                        this.companyType === 2 ? this.filter.filterRelation + 1 : this.filterRelation + 1 
                    )
                    .then((res) => {
                        if (res.body.code === 200) {
                            this.$toast(this.$t('swarm.checkoutEmail'), 'success');
                        } else {
                            this.$toast(res.body.message, 'warn');
                        }
                    });
            },
            // 获取列表
            getFormDetails(id) {
                this.isComplete = false;
                this.$loading();
                this.formIds = [];
                QuestionnaireApiAuth
                    .downloadDetailAccess({
                        paperId: id,
                        type: 4,
                    })
                    .then(({body:{data:{isAccess}}})=>{
                        if ( isAccess === 1 ) {
                            //非首次执行且为世邦用户，调用下面接口
                            if (!this.isFirst && this.companyType === 2) this.saveCheckboxIds();
                            QuestionnaireApiV1
                                .getFormInfo({
                                    id: id,
                                    page: this.nowPage,
                                    size: this.size,
                                    field: this.companyType === 2 ? null : this.formContent,
                                    value: this.keyword,
                                    fieldList: this.companyType === 2 && this.fieldId.constructor === Array ? 
                                        this.fieldId : null 
                                })
                                .then((res) => {
                                    let filter = res.body.data.filter ? JSON.parse(res.body.data.filter).filterList : '';
                                    if (filter) {
                                        this.companyType === 2 ? this.filterGroupRender(res,filter) : 
                                            this.filterListRender(res,filter);
                                    }
                                    
                                    this.subscriptionList = res.body.data.answerList;
                                    this.submitTime = res.body.data.commitNum;
                                    this.submitPerson = res.body.data.commitPersonNum;
                                    this.totalPage = res.body.data.totalPage;
                                    this.totalElement = res.body.data.totalElement;
                                    this.paperName = res.body.data.paperName;
                                    this.formSource = res.body.data.formSource;
                                    this.$loaded();
                                    this.fieldWidthInit(); //设置字段宽度自适应
                                    this.isFirst = false;
                                    this.isComplete = true;
                                })
                                .catch(() => {
                                    this.isComplete = true;
                                    this.$loaded();
                                });
                        } else if ( isAccess === 0 ) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            //标准版 filterList的处理
            filterListRender(res,filter) {
                let list = {
                    conditions: typeof filter === 'string' ? JSON.parse(filter) : filter,
                    relation: JSON.parse(res.body.data.filter).filterRelation - 1 // 前端 0为且 1为或 ，后端 1为且 2为或 加-1处理
                };
                list.conditions = list.conditions.map((c) => {
                    let item = {
                        attrId: c.field,
                        function: c.filterType,
                        params: [],
                        ifBelong: true
                    };
                    item.type = c.hasOwnProperty('type') ? c.type : '';
                    switch (c.filterType) {
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                            item.params.push(c.filterValue);
                            break;
                        case 7:
                        case 8:
                            item.params = c.filterValue;
                            break;
                        case 9:
                        case 13:
                            item.start = c.filterValue.startTime;
                            item.end = c.filterValue.endTime;
                            break;
                        case 10:
                            item.day = c.filterValue.days;
                            item.relative_type = c.filterValue.type;
                            break;
                    }
                    this.fieldIdsStr += c.field + ',';
                    return item;
                });
                this.filterList = list;
                this.expanded = this.isFirst ? false : this.expanded;
            },
            //将数据处理成前端需要结构
            filterRenderToFront(filter) {
                filter.filterGroup.forEach((g) => {
                    g.filterList = g.filterList.map((c) => {
                        let item = {
                            attrId: c.field,
                            function: c.filterType,
                            params: [],
                            ifBelong: true
                        };
                        item.type = c.hasOwnProperty('type') ? c.type : '';
                        switch (c.filterType) {
                            case 1:
                            case 2:
                            case 3:
                            case 4:
                                item.params.push(c.filterValue);
                                break;
                            case 7:
                            case 8:
                                item.params = c.filterValue;
                                break;
                            case 9:
                            case 13:
                                item.start = c.filterValue.startTime;
                                item.end = c.filterValue.endTime;
                                break;
                            case 10:
                                item.day = c.filterValue.days;
                                item.relative_type = c.filterValue.type;
                                break;
                        }
                        return item;
                    });
                    g.filterRelation = g.filterRelation - 1; // 前端 0为且 1为或 ，后端 1为且 2为或 加-1处理
                });
            },
            //世邦 filterList的处理
            filterGroupRender(res,filter) {
                let list = {
                    filterGroup: typeof filter === 'string' ? JSON.parse(filter) : filter,
                    filterRelation: JSON.parse(res.body.data.filter).filterRelation - 1 // 前端 0为且 1为或 ，后端 1为且 2为或 加-1处理
                };
                this.filterRenderToFront(list);
                this.filter = list;
                this.conditionsNumCompute();
                this.filterCopy = cloneDeep(list);
                this.expanded = this.isFirst ? false : this.expanded;
            },
            // 分页页面间跳转
            handlePage(newPage) {
                this.nowPage = newPage;
                this.$router.replace({
                    name: 'questionnaireReport',
                    query: {...this.$route.query, pageNo: newPage}
                });
                this.getFormDetails(this.questionnaireId);
            },
            tapPagesHander($event) {
                // pageSize记录到localStorage, 不区分账号, 同一浏览器共享设置
                let pageJson = localStorage.getItem('PAGE_SIZE');
                if (pageJson) {
                    let pageObj = JSON.parse(pageJson);
                    pageObj.questionnaireReport = $event;
                    localStorage.setItem('PAGE_SIZE', JSON.stringify(pageObj));
                } else {
                    localStorage.setItem('PAGE_SIZE', JSON.stringify({
                        questionnaireReport: $event,
                    }));
                }
                this.nowPage = 1;
                this.size = $event;
                this.$router.replace({
                    name: 'questionnaireReport',
                    query: {...this.$route.query, pageNo: 1}
                });
                this.getFormDetails(this.questionnaireId);
            },
            // 跳转至发送报告设置
            sendReportAction() {
                QuestionnaireApiAuth
                    .downloadDetailAccess({
                        paperId: this.questionnaireId,
                        type: 8,
                    })
                    .then(({body:{data:{isAccess}}})=>{
                        if ( isAccess === 1 ) {
                            this.$router.push({
                                name: 'reportSetting',
                                query: {id: this.questionnaireId, formSource: this.formSource}
                            });
                        } else if ( isAccess === 0 ) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });

            },
            // 选择表头
            selectedAttrsChanged(selectedAttrs,allAttrs) {
                this.questionnaireFields = allAttrs;
                this.selectedFields = selectedAttrs;
                this.selectedFieldIds = selectedAttrs.map(item => item.id);
                if (!this.isFirst) this.fieldWidthInit();
            },
            //搜索的字段值
            searchOpt(e) {
                if (this.companyType !== 2) {
                    this.searchFieldOptions = e.searchFieldOptions;
                    this.fieldId = e.fieldId;
                    this.formContent = e.formContent;
                }
            },
            //删除表单
            delForm() {
                this.delShow = false;
                //删除数据 校验是否具有权限
                // 操作验证
                QuestionnaireApiAuth
                    .downloadDetailAccess({paperId: this.questionnaireId, type: 14})
                    .then((res) => {
                        let isAccess = res.body.data.isAccess;
                        if (isAccess === 1) {
                            QuestionnaireApiV1
                                .delFormData(this.formIds)
                                .then((res) => {
                                    if (res.body.code === 200) {
                                        this.getFormDetails(this.questionnaireId);
                                        this.$toast(this.$t('form.SuccessOperate'), 'success');
                                    }
                                });
                            this.formIds = [];
                        } else if (isAccess === 0) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            //搜索
            searchForm() {
                if (this.searchDisabled) return;
                this.nowPage = 1;
                this.$router.replace({
                    name: 'questionnaireReport',
                    query: {...this.$route.query, pageNo: 1}
                });
                this.getFormDetails(this.questionnaireId);
            },
            //标砖表单筛选条件展开于收起
            toggle() {
                this.expanded = !this.expanded;
            },
            //添加筛选条件 少选标准表单
            addFilter() {
                if (this.filterList.conditions.length >= 30) {
                    this.$toast(this.$t('form.conditionMore30'), 'warn');
                    return;
                }
                const newCondition = {
                    attrId: '', // 属性id
                    function: '',// 1 等于；2 不等于；3 包含；4 不包含；5 有值；6 没值; 7 属于
                    params: [], // 属性值
                    ifBelong: true  // 是否包含属于
                };
                this.filterList.conditions.push(newCondition);
            },
            //世邦，添加条件簇
            addFilterGroup() {
                const newCondition = {
                    attrId: '', // 属性id
                    function: '',// 1 等于；2 不等于；3 包含；4 不包含；5 有值；6 没值; 7 属于
                    params: [], // 属性值
                    ifBelong: true  // 是否包含属于
                };
                const newFilterGroup = {
                    filterList: [newCondition],
                    filterRelation: 0
                };
                this.filter.filterGroup.push(newFilterGroup);
            },
            //或且的切换
            changeRelation(data) {
                if (data.i !== undefined) {
                    this.filter.filterGroup[data.i].filterRelation = data.e === 0 ? 1 : 0;
                } else {
                    this.filter.filterRelation = data.e === 0 ? 1 : 0;
                }
            },
            // 获取时间类型字段Id集合
            getNotBelongIds() {
                let notBelongList = this.questionnaireFields.filter(list => list.type === 2);
                return notBelongList.map(list => list.id);
            },
            // update、change 筛选条件
            ChangeFilter(newFilter) {
                let target = newFilter.conditions[newFilter.position];
                let attrIds = target ? target.attrId : null;
                if (attrIds !== null) {
                    newFilter.conditions[newFilter.position].ifBelong = true;
                    // 时间类型字段，关系值不包含属于
                    if (this.getNotBelongIds().includes(attrIds)) {
                        newFilter.conditions[newFilter.position].ifBelong = false;
                    }
                }
                this.filterList = newFilter;
            },
            //对filterList的结构进行处理
            structureFilterCreate() {
                let jsonData = [];
                cloneDeep(this.filterList).conditions.map((c) => {
                    if (!c.attrId.toString()) return;
                    let item = {};
                    item.field = c.attrId;
                    item.filterType = c.function;
                    item.type = c.hasOwnProperty('type') ? c.type : '';
                    switch (c.function) {
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                            item.filterValue = c.params[0];
                            break;
                        case 7:
                        case 8:
                            item.filterValue = c.params;
                            break;
                        case 9:
                        case 13:
                            item.filterValue = {
                                startTime: c.start,
                                endTime: c.end
                            };
                            break;
                        case 10:
                            item.filterValue = {
                                days: c.day,
                                type: c.relative_type
                            };
                            break;
                    }
                    jsonData.push(item);
                    this.fieldIdsStr += c.attrId + ',';
                });
                return jsonData;
            },
            // 表单筛选条件-相对时段区间校验
            relativeRangeValid (filterList) {
                const relativeRangeList = filterList
                    .filter(item => item.function === 13);
                const res = relativeRangeList.length ? relativeRangeList.every(e => {
                    // 开始时间为空校验
                    let sVolidToday = (e.start.type === 0 && e.start.days && e.start.time);
                    let sVolidPass = (e.start.type === 1 && e.start.time);
                    // 结束时间为空校验
                    let eVolidToday = (e.end.type === 0 && e.end.days && e.end.time);
                    let eVolidPass = (e.end.type === 1 && e.end.time);
                    // 是否为空校验
                    let noEmptyResult = (sVolidToday && eVolidToday) ||
                        (sVolidToday && eVolidPass) ||
                        (sVolidPass && eVolidToday) ||
                        (sVolidPass && eVolidPass);
                    // 结束时间大于开始时间校验
                    let startAndEnd = true;
                    let sTimeArr = e.start.time.split(':');
                    let eTimeArr = e.end.time.split(':');
                    let endGreatStart = (sTimeArr[0] * 3600 + sTimeArr[1] * 60 + sTimeArr[2] * 1) <
                        (eTimeArr[0] * 3600 + eTimeArr[1] * 60 + eTimeArr[2] * 1);
                    if (e.start.type === 1 && e.end.type === 0) startAndEnd = false;
                    if (e.start.type === 1 && e.end.type === 1 && !endGreatStart) startAndEnd = false;
                    if (e.start.type === 0 && e.end.type === 0) {
                        if (e.start.days === e.end.days && !endGreatStart) startAndEnd = false;
                        if (e.start.days < e.end.days) startAndEnd = false;
                    }
                    // 校验不通过时提示
                    if (!noEmptyResult) {
                        this.$toast(this.$t('form.complateFilterCondition'), 'warn');
                    } else if (!startAndEnd) {
                        this.$toast(e.name + this.$t('form.relativeRangeVolid'), 'warn');
                    }
                    return noEmptyResult && startAndEnd;
                }) : true;
                return res;
            },
            //应用筛选条件
            filterApplication() {
                // 筛选条件-相对时段区间校验
                if (!this.relativeRangeValid(this.filterList.conditions)) return;
                this.filterRelation = this.filterList.relation + 1;// 前端 0为且 1为或 ，后端 1为且 2为或 加+1处理
                let filter = {
                    filterList: this.structureFilterCreate(),
                    filterRelation: this.filterRelation
                }; 
                
                this.$loading();
                this.saveCondition(filter);
            },
            //对filterGroup的结构进行处理
            structureGroupCreate(filter) {
                let filterGroupCopy = [];////选择条件完整的数据
                let copyGroup = [];//接口需要用到的参数
                cloneDeep(filter.filterGroup).forEach((e)=>{
                    let copyFilterList = [];
                    let list = [];//存放filterList中选择条件完整的数据
                    e.filterList.forEach((c) => {
                        if (!c.attrId.toString()) return;
                        let item = {};
                        item.field = c.attrId;
                        item.filterType = c.function;
                        item.type = c.hasOwnProperty('type') ? c.type : '';
                        switch (c.function) {
                            case 1:
                            case 2:
                            case 3:
                            case 4:
                                item.filterValue = c.params[0];
                                break;
                            case 7:
                            case 8:
                                item.filterValue = c.params;
                                break;
                            case 9:
                            case 13:
                                item.filterValue = {
                                    startTime: c.start,
                                    endTime: c.end
                                };
                                break;
                            case 10:
                                item.filterValue = {
                                    days: c.day,
                                    type: c.relative_type
                                };
                                break;
                        }
                        list.push(c);
                        copyFilterList.push(item);
                    });
                    if (copyFilterList.length !== 0) {
                        // 前端 0为且 1为或 ，后端 1为且 2为或 加+1处理
                        copyGroup.push({filterList : copyFilterList, filterRelation: e.filterRelation + 1});
                    }
                    if (list.length !== 0) {
                        filterGroupCopy.push({filterList : list, filterRelation: e.filterRelation});
                    }
                });
                return {
                    filterGroupCopy,
                    copyGroup
                };
            },
            //应用筛选条件-世邦
            filterApplicationShiBang() {
                // 筛选条件-相对时段区间校验
                let rangeValid = this.filter.filterGroup.every(filterArr => {
                    return this.relativeRangeValid(filterArr.filterList);
                });
                if (!rangeValid) return;
                this.filter.filterGroup = this.structureGroupCreate(this.filter).filterGroupCopy;
                let filter = {
                    filterList: JSON.stringify(this.structureGroupCreate(this.filter).copyGroup),
                    filterRelation: this.filter.filterRelation + 1// 前端 0为且 1为或 ，后端 1为且 2为或 加+1处理
                }; 
                this.filterCopy = cloneDeep(this.filter);
                this.conditionsNumCompute();
                this.$loading();
                this.saveCondition(filter);
            },
            //清空筛选条件
            filterClear() {
                this.$loading();
                if (this.companyType === 2) {
                    this.filter = {
                        filterGroup: [],
                        filterRelation: 0
                    };
                    this.conditionsNum = 0;
                    this.bookmarkId = '';
                    this.bookmarkName = '';
                    this.saveCondition('');
                    QuestionnaireApiV1
                        .cleanReportLabel({
                            paperId: this.questionnaireId
                        })
                        .then(() => {
                            this.getFormDetails(this.questionnaireId);
                        });
                } else {
                    this.filterRelation = 0;
                    this.fieldIdsStr = '';
                    this.filterList = {
                        conditions: [],
                        relation: 0
                    };
                    this.saveCondition('');
                    this.getFormDetails(this.questionnaireId);
                }
            },
            //保存筛选条件的请求
            saveCondition(param) {
                const configurationLabelId = this.bookmarkId ? this.bookmarkId : '';
                QuestionnaireApiV1
                    .saveFilter(param,configurationLabelId,this.questionnaireId)
                    .then(() => {
                        this.$nextTick(() => {
                            this.nowPage = 1;
                            this.getFormDetails(this.questionnaireId);
                        });
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 编辑当条数据
            async showFormEditor(item) {
                this.answerItem = item;
                // 没操作权限，不允许编辑
                if (this.$has('journey_form_edit_data')) return this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                // 金数据表单字段不允许编辑
                if (this.formSource === 2) return;
                // 检查数据权限 编辑数据15 
                const checkPass = await QuestionnaireApiAuth
                    .downloadDetailAccess({ paperId: this.questionnaireId, type: 15 })
                    .then(({ body: { data: { isAccess } } }) => isAccess);
                if (!checkPass) {
                    this.$toast(this.$t('material.sharingVerifyOption'), 'warn');
                    return;
                }
                let {body: {data :{htmlFieldJson, answersList}}} = await QuestionnaireApiV1
                    .submitFormDetail(item._id, this.questionnaireId);

                this.allFormAttrs = answersList.map(q => Object.assign({}, q, {
                    id: q.questionId,
                    name: q.fieldName
                }));
                let t = answersList.filter(item => item.questionId <= 0 && item.questionId !== -8);
                t.forEach(i => {
                    i.basicTrue = true;
                });

                // 2.5.6 优化地址字段， 地址提交原始数据
                let templateAddressValue = answersList.find(item => item.questionId === -8);

                // 根据domId， 筛选对应值
                // 过滤表单提交按钮、描述、验证码、辅助项
                const canNotEdit = ['submitButton', 'description', 'verificationCode', 'divider', 'carousel'];
                let formJson = JSON.parse(htmlFieldJson).filter(json => !canNotEdit.includes(json.type));
                formJson.forEach(json => {
                    // 用户表单提交值，若无， 使用配置默认值，再无为空
                    const target = answersList.find(form => form.field === json.domId);
                    json.value = target ? target.value : json.placeholder && json.placeholder !== '' ? json.placeholder : '';
                    // 是否是主键 （表单字段匹配DMT字段且是主键）
                    json.isPk = target.isPk;
                    // 是否是同步 （表单单字段匹配DMT字段非主键）
                    json.sync = target.sync;
                    //自定义展示表单字段 是否选中
                    json.check = target.check;
                    //自定义字段 根据排序展示
                    json.sort = target.sort ? target.sort : '';
                    //是否是基础字段
                    json.basicTrue = false;
                    // 添加questionId
                    json.questionId = target.questionId;
                });

                this.formJson = formJson;
                t.forEach(item => {
                    this.formJson.push(item);
                });

                this.formJson.sort(function(a, b) {//按sort由小到大排序 空值排在最后
                    return (b.sort !== '' && b.sort != null) - (a.sort !== '' && a.sort != null) || a.sort - b.sort;
                });

                this.baseInfo = {
                    inquiryId: item.inquiryId ? item.inquiryId : '/',
                    createDate: item.createDate ? item.createDate : '/',
                    extensionValue: item.extensionValue ? item.extensionValue : '/',
                    updateDate: item.updateDate ? item.updateDate : '/',
                    customerId: item.customerId,
                    _id: item._id,
                    // 2.5.6 优化地址字段， 地址提交原始数据
                    templateAddressValue: templateAddressValue ? JSON.parse(templateAddressValue.value) : []
                };

                this.showClueData = true;
            },
            // 数据编辑完成后，更新列表数据
            updateFormDataDone() {
                this.getFormDetails(this.questionnaireId);
            },
            //统计明细
            statisticsDetail() {
                this.statType = 1;
            },
            //统计概览
            statisticsOverview() {
                this.statType = 2;
            },
            changeDate(date){
                if (date.start < this.createdTime ) {
                    this.$toast(this.$t('form.timeLimit'), 'warn');
                    return;
                }
                this.startDate = date.start;
                this.endDate = date.end;
            },
            //获取表单详情
            getFormInfos(){
                QuestionnaireApiV1
                    .getFormInfos(this.questionnaireId)
                    .then((res) => {
                        let start = res.body.data.createDate;
                        let endIndex = start.indexOf('T');
                        this.createdTime = start.substring(0, endIndex);
                        this.endDate =  format(subDays(new Date(), 0), 'YYYY-MM-DD');

                        let monday = format(startOfISOWeek(new Date()), 'YYYY-MM-DD');
                        if (this.createdTime < monday) {//表单创建日期不再本周内
                            this.startDate = monday;
                        } else {//表单创建日期在本周内
                            this.startDate = start.substring(0, endIndex);
                        }
                    });
            },
        },
    };
</script>
<style type="text/scss" lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .questionnaire-report {
        $title-background-color: #f4f5f9;
        
        .page-head {
            @include clearfix();
        }

        .send-report {
            margin-right: 8px;
        }

        .report-counts {
            display: flex;
            height: 160px;
            align-items: center;
            justify-content: stretch;
            text-align: center;
            color: #6e7376;

            .report-count {
                flex: 1;

                + .report-count {
                    border-left: 1px solid $border-color;
                }
            }
        }

        .head-select {
            margin-bottom: 8px;

            .icon-size {
                float: right;
            }

            @include clearfix();

            .head-select-left {
                float: left;
            }

            .head-select-right {
                float: right;

                .search-box {
                    margin: 0 10px;
                }
            }
        }

        .table-content{
            width: 100%;
            overflow: auto;
             &::-webkit-scrollbar {
                height: 10px;
            }
            &::-webkit-scrollbar-thumb {
                border-radius: 10px;
                -webkit-box-shadow: inset 0 0 5px #9b9ba3;
            }
            .simplify-table {
                box-sizing: border-box;
                padding: 0;

                table{
                    width: auto;
                    min-width: 100%;
                    td,th {
                        padding: 0 15px;
                        box-sizing: border-box;
                        white-space: nowrap;
                        max-width: 440px;
                    } 

                    .first-th{
                        padding: 17.5px;
                        min-width: 50px;
                    }

                    .two-lines{
                        display: -webkit-box;
                        text-overflow: ellipsis;
                        -webkit-box-orient: vertical;
                        -webkit-box-pack: center;
                        -webkit-line-clamp: 2;
                        white-space: nowrap;
                        line-height: 22px;
                        overflow: hidden;
                    }

                    .two-lines-td {
                        padding: 0 15px;
                    }

                    thead {
                        display: block;
                        tr {
                            display: inherit;
                        }
                    }
                    tbody {
                        max-height:500px;
                        overflow: auto;
                        display: block;
                        &::-webkit-scrollbar {
                            width: 10px;
                        }
                        &::-webkit-scrollbar-thumb {
                            border-radius: 10px;
                            -webkit-box-shadow: inset 0 0 5px #9b9ba3;
                        }

                        .icon-copy {
                            margin: 0px 0 -3px 10px;
                        }
                        tr {
                            display: inherit;
                        }
                        td {
                            p {
                                max-height: 49px;
                                overflow: hidden;
                                text-overflow:ellipsis;
                                white-space: nowrap;
                            }
                        }
                    }
                }
            }
        }

        .selector {
            .list-container {
                min-width: 88px;
            }
        }
        .form-filter-wrapper {
            position: relative;
            margin-bottom: 30px;
            border: 1px solid $title-bg;
            .switch{
                height: 38px;
                line-height: 38px;
                text-align: center;
                color: $theme;
                background-color: $title-bg;
                cursor: pointer;
                $scale: 5/14;
                &:not(.expanded):hover {
                    &:before {
                        @include transform(scaleY(1));
                    }

                    .arrow-down {
                        @include transform(translateY(5px) scaleY($scale));
                    }
                }
                &.expanded {
                    &:before {
                        @include transform(scaleY(1));
                    }

                    .arrow-down {
                        @include transform(translateY(5px) scaleY($scale) rotate(180deg));
                    }
                }
                &:before {
                    content: '';
                    position: absolute;
                    left: 50%;
                    bottom: -16px;
                    height: 16px;
                    width: 40px;
                    margin-left: -20px;
                    background-color: $theme;
                    border-bottom-left-radius: 4px;
                    border-bottom-right-radius: 4px;
                    @include transition();
                    @include transform-origin(center top);
                    @include transform(scaleY(.625));
                }
                .arrow-down {
                    position: absolute;
                    left: 50%;
                    bottom: -10px;
                    height: 14px;
                    width: 14px;
                    margin-left: -7px;
                    fill: white;
                    @include transition();
                    @include transform(translateY(2px) scaleY($scale));
                }
            }
            .query{
                padding: 20px 10px;
                .add-icon {
                    font-size: 16px;
                    color: $light-green;
                    margin-left: 6px;
                    cursor: pointer;
                    vertical-align: middle;
                    @include user-select(none);
                }
                .filter-btn{
                    margin: 30px 130px;
                }
            }
            .bookmark {
                position: absolute;
                right: 10px;
                top: 0;
            }
        }
        .page-wrapper{
            display: flex;
            justify-content: space-between;
            .elementNumer{
                line-height: 64px;
            }
        }
        .statistics-detail{
            display: flex;
            justify-content: space-between;
        }
    }
</style>
