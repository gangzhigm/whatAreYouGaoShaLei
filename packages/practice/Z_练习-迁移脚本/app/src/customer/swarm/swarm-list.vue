<template>
    <div class="swarm-list">
        <!--正文-->
        <div class="list-container">
            <div class='list-title'>
                <!--创建分群/高级分群-->
                <button class="btn btn-md btn-theme btn-margin  pull-right"
                    v-if="(authInfo.companyType === 1 || cid) && groupId !== -99"
                    @click="advancedModalOpen = true"
                    :disabled="$has('customer_swarm_add_swarm')">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'swarm.createAdvancedGroup' | t}}
                </button>
                <button class="btn btn-md btn-theme btn-margin pull-right" v-if="groupId !== -99" @click="addSwarm"
                        :disabled="$has('customer_swarm_add_swarm')">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'swarm.createGroup' | t}}
                </button>
                <!--搜索框-->
                <div class="pull-right search-box md" v-if="groupId !== -99">
                    <input type="text" :placeholder="$t('swarm.enterSwarmName')" v-model.trim="params.searchName" @keydown.enter="handleSearch"
                        maxlength="100">
                    <svg aria-hidden="true" @click="handleSearch">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </div>
                <!--批量操作-->
                <div class="hidden-menu-trigger batch-actions" v-if="groupId !== -99">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-batch"></use>
                    </svg>
                    <span class="title-text">{{'form.batchAction' | t}}</span>
                    <div class="hidden-menu">
                        <button class="btn" @click='bulkMoveAction' :disabled="$has('customer_swarm_batch_move_swarm')">{{'form.moveTo' | t}}
                        </button>
                        <button class="btn" @click='bulkDeleteAction' :disabled="$has('customer_swarm_batch_delete_swarm')">{{'form.del' | t}}
                        </button>
                    </div>
                </div>
            </div>

            <!--表格数据-->
            <div class="simplify-table swarm-group-table">
                <table>
                    <thead>
                        <tr>
                            <th class="diff-overflow" width="47">
                                <choose-all-action v-if="groupId !== -99"
                                                   @choosePage="choosePageData" @clear="clearChoose"/>
                            </th>
                            <th :class="attr.fieldName" v-for="attr in attrList" :key="attr.fieldName" :width="attr.width">
                                <span>{{ attr.name }}</span>
                                <button type="button" class="table-sort-button" v-if="attr.ifSort && groupId !== -99"
                                    :disabled="swarmList.length === 0" @click="sortByAttr(attr)" :title="attr.title || ''">
                                    <svg aria-hidden="true" class="asc"
                                        :class="{active: attr.fieldName === params.sortField && params.sort === 'asc'}">
                                        <use xlink:href="#icon-caret-down">
                                        </use>
                                    </svg>
                                    <svg aria-hidden="true" class="desc"
                                        :class="{active: attr.fieldName === params.sortField && params.sort === 'desc'}">
                                        <use xlink:href="#icon-caret-down">
                                        </use>
                                    </svg>
                                </button>
                                <span v-if="attr.fieldName === 'status'" class="icon icon-help" v-title="$t('swarm.statusIcon')"></span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading" class="no-hover">
                            <td colspan="10" class="slim-cell">
                                <inline-loading />
                            </td>
                        </tr>
                        <template v-else-if="swarmList.length > 0">
                            <tr v-for="item in swarmList" :key="item.id">
                                <td>
                                    <checkbox :source="item.id" v-if="groupId !== -99" v-model="checkedItem" />
                                </td>
                                <td :title="item.name">
                                    <div class="name">
                                        <span v-if="item.type === 8">&#9812</span>
                                        {{!!item.name ? item.name : ' / '}}
                                    </div>
                                </td>
                                <td>{{swarmType(item.type)}}</td>
                                <td v-text="matchSwarmStatus(item)"></td>
                                <td v-text="matchSwarmTotal(item)"></td>
                                <td :title="item.createName">{{!!item.createName ? item.createName : ' / '}}
                                </td>
                                <td>{{!!item.createDate ? item.createDate : ' / '}}
                                </td>
                                <td :title="item.updateName">{{!!item.updateName ? item.updateName : ' / '}}
                                </td>
                                <td>{{!!item.updateDate ? item.updateDate : ' / '}}
                                </td>
                                <td class="edit">
                                    <!--渠道退订-->
                                    <button class="btn" v-if="groupId === -99" :disabled="$has('customer_swarm_check_swarm')"
                                            @click="swarmDetail(item)">
                                        <svg aria-hidden="true" class="action-icon icon-eye"
                                            :class="{'icon-disable':$has('customer_swarm_check_swarm')}"
                                            v-title:top="$t('form.view')">
                                            <use xlink:href="#icon-eye"></use>
                                        </svg>
                                    </button>
                                    <!--其他-->
                                    <template v-if="groupId !== -99">
                                        <button class="btn" :disabled="item.status === 0 || item.status === 1 ||
                                        (item.type !== 1 && item.type !== 8) || $has('customer_swarm_check_swarm')" @click="swarmDetail(item)">
                                            <svg aria-hidden="true" class="action-icon icon-eye" :class="{'icon-disable':item.status === 0
                                                || item.status === 1 || (item.type !== 1 && item.type !== 8) || $has('customer_swarm_check_swarm')}"
                                                v-title:top="$t('form.view')">
                                                <use xlink:href="#icon-eye"></use>
                                            </svg>
                                        </button>
                                        <button class="btn"
                                                :disabled="$has('view_segment_criteria')"
                                                @click="swarmView(item)">
                                            <svg aria-hidden="true" class="action-icon icon-search"
                                                :class="{'icon-disable':$has('view_segment_criteria')}" v-title:top="$t('swarm.swarmView')">
                                                <use xlink:href="#icon-search"></use>
                                            </svg>
                                        </button>
                                        <button class="btn"
                                                :disabled="item.status === 1 || (item.type !== 1 && item.createName !== authInfo.email) || $has('customer_swarm_edit_swarm')"
                                                @click="editSwarm(item)">
                                            <svg aria-hidden="true" class="action-icon icon-round-pencil"
                                                :class="{'icon-disable':item.status === 1 || (item.type !== 1 && item.createName !== authInfo.email) || $has('customer_swarm_edit_swarm')}"
                                                v-title:top="$t('form.setting')">
                                                <use xlink:href="#icon-round-pencil">
                                                </use>
                                            </svg>
                                        </button>
                                        <button class="btn" v-if="item.type === 1"
                                                :disabled="$has('customer_swarm_tracing_swarm')"
                                                @click="tracingSwarm(item)">
                                            <svg aria-hidden="true" class="action-icon icon-suyuan"
                                                :class="{'icon-disable': $has('customer_swarm_tracing_swarm')}"
                                                v-title:top="$t('swarm.tracing')">
                                                <use xlink:href="#icon-suyuan">
                                                </use>
                                            </svg>
                                        </button>
                                        <button class="btn"
                                                @click="swarmCopy(item)">
                                            <svg aria-hidden="true" class="action-icon icon-copy"
                                                v-title:top="$t('common.copy')">
                                                <use xlink:href="#icon-copy"></use>
                                            </svg>
                                        </button>
                                        <button class="btn"
                                                :disabled="(item.type !== 1 && item.createName !== authInfo.email) || $has('customer_swarm_delete_swarm')"
                                                @click="delSwarm(item)">
                                            <svg aria-hidden="true" class="action-icon icon-delete"
                                                :class="{'icon-disable':(item.type !== 1 && item.createName !== authInfo.email) || $has('customer_swarm_delete_swarm')}"  v-title:top="$t('common.del')">
                                                <use xlink:href="#icon-round-close">
                                                </use>
                                            </svg>
                                        </button>
                                    </template>
                                </td>
                            </tr>
                        </template>
                        <tr v-else>
                            <td colspan="10" class="slim-cell">
                                <list-search-empty v-if="params.searchName !== ''" />
                                <list-empty v-else />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <pager :total="params.totalPage" :now="params.pageNumber" @page="selectPage">
                <div class="pull-left">
                    {{'journey.totalCount' | t}}
                    <span class="theme-text">{{totalRow ? totalRow : 0}}</span>
                    {{'journey.totalUnit' | t}}
                </div>
            </pager>
        </div>

        <!-- 批量移至分组弹窗 -->
        <modal class="move" v-if="showMoveSwarm" :title="$t('swarm.moveTo')" @close="cancelMoveSwarm">
            <div class="form-field" @click="closeGroupSelect">
                <label class="label placeholder" for="use">{{'form.folder' | t}}</label>
                <div class="choose-parent" id="use" @click.stop="readyCheckGroup">
                    <label class="select-text">
                        {{treeParams.parentGroupName || $t('common.selectHolder')}}
                        <span class="select-icon icon icon-arrow-down"></span>
                    </label>
                    <div class="search-tree-wrapper" v-if="treeParams.groupSelectShow" @click.stop>
                        <search-tree :searchTreeData="allTreeData" @getTreeAct="getTreeAct" :action="false" :treeActiveId="treeParams.treeActiveGid"
                            :levelStage="true"></search-tree>
                    </div>
                </div>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme"
                       :value="$t('common.confirm')"
                       @click="saveMoveGroup"/>
            </template>
        </modal>
        <!-- 批量删除表单 -->
        <confirm v-if="showBulkDelete" :title="$t('swarm.delSwarm')" @cancel="cancelBulkDelete" @confirm="confirmBulkDelete">
            <div class="form-field">
                {{'swarm.confirmDel' | t}} {{checkedItem.length}}
                {{'swarm.swarms' | t}}？{{'common.deleteSure' | t}}
            </div>
        </confirm>
        <!-- 新建高级分群弹窗 -->
        <confirm v-if="advancedModalOpen" :title="$t('swarm.createAdvancedGroup')" @cancel="cancelAdvanced" @confirm="addAdvanced">
            <div class="form-field">
                <label class="label">{{'swarm.groupName' | t}}</label>
                <input class="input lg" :class="{error: advancedNameError}" type="text" v-model.trim="advancedName"
                       @click="advancedNameError = ''" :placeholder="$t('swarm.enterGroupName')" maxlength="100"
                       v-title:top.warn.line="advancedNameError">
            </div>
            <div class="form-field" @click="closeGroupSelect">
                <label class="label placeholder" for="use">{{'form.folder' | t}}</label>
                <div class="choose-parent" @click.stop="readyCheckGroup">
                    <label class="select-text">
                        {{treeParams.parentGroupName || $t('common.selectHolder')}}
                        <span class="select-icon icon icon-arrow-down"></span>
                    </label>
                    <div class="search-tree-wrapper" v-if="treeParams.groupSelectShow" @click.stop>
                        <search-tree :searchTreeData="allTreeData" @getTreeAct="getTreeAct" :action="false" :treeActiveId="treeParams.treeActiveGid"
                                     :levelStage="true"></search-tree>
                    </div>
                </div>
            </div>
        </confirm>
        <!-- 高级分群创建中加载弹窗 -->
        <modal v-if="advancedLoadOpen" :title="$t('swarm.createAdvancedGroup')" :readonly="true">
            <div class="form-field">
                <inline-loading :offset="'md'"></inline-loading>
            </div>
        </modal>
    </div>
</template>
<script type="text/babel">
import { ContactApiV1 } from '@/api';
import { logError } from '@/monitor';
import CustomerTableAttributeSelector from '../customer-table-attribute-selector.vue';
import Bus from '../../common/components/group-tree/bus.js'; // Bus是在树形组件中传参时使用
import { COMMON_NAME_REGEXP } from '@/common/utils/regs';

export default {
    components: {
        CustomerTableAttributeSelector
    },
    props: {
        // 分组id
        groupId: {
            type: Number,
            required: true
        },
        // 树型组件数据
        allTreeDataDefault: {
            type: Array
        },
        // 已保存的条件簇
        addModalParams: {
            type: Object,
            required: true
        },
    },
    data () {
        return {
            loading: false, // 列表读取
            allTreeData: [],//分组列表数据
            totalRow: 0, // 总分群数
            swarmList: [], // 分群列表
            //表格属性
            attrList: [
                {
                    fieldName: 'name',
                    name: this.$t('swarm.groupName'),
                    title: this.$t('swarm.arrangedByname'),
                    ifSort: true,
                    width: 180
                },
                {
                    fieldName: 'type',
                    name: this.$t('journeyList.type'),
                    ifSort: false,
                    width: 60
                },
                {
                    fieldName: 'status',
                    name: this.$t('journeyList.status'),
                    ifSort: false,
                    width: 75
                },
                {
                    fieldName: 'total',
                    name: this.$t('swarm.total'),
                    ifSort: false,
                    width: 80
                },
                {
                    fieldName: 'createName',
                    name: this.$t('swarm.creator'),
                    title: this.$t('swarm.arrangedByCreator'),
                    ifSort: true,
                    width: 130
                },
                {
                    fieldName: 'createDate',
                    name: this.$t('form.createDate'),
                    ifSort: false,
                    width: 130
                },
                {
                    fieldName: 'updateName',
                    name: this.$t('swarm.updater'),
                    ifSort: false,
                    width: 130
                },
                {
                    fieldName: 'updateDate',
                    name: this.$t('swarm.updateTime'),
                    title: this.$t('swarm.arrangedByUpdateTime'),
                    ifSort: true,
                    width: 130
                },
                {
                    fieldName: 'operation',
                    name: this.$t('form.action'),
                    ifSort: false,
                    width: 150
                }
            ], // 表头属性列表
            //全页面参数
            params: {
                pageNumber: 1,
                searchName: '', // 关键字
                sort: 'asc', //asc正序 desc 逆序
                sortField: '', // 排序方式
                totalPage: 0 // 总页数
            },
            // 分组数参数
            treeParams: {
                parentGroupName: '', //分组
                groupSelectShow: false,
                treeActiveGid: '', // 选中的分组id
                searchSelectTree: {}
            },
            checkedItem: [], //已选中项目
            showMoveSwarm: false, //移动分群
            showBulkDelete: false, // 批量删除中
            advancedModalOpen: false,   //添加高级分群弹窗
            advancedLoadOpen: false,    //添加高级分群loading
            advancedName: '',   //高级分群名称
            advancedNameError: '',  //高级分群名称错误提示
            scoringId: '' //评分报告id
        };
    },
    mounted () {
        //点击其他地方下拉菜单收起
        window.addEventListener('click', this.eventListener);
        Bus.$on('swarmListUpdate',() => {
            this.getUserGroupTables();
        });
        if (this.groupId === undefined || this.groupId === null) {
            logError(
                `[联系人分群] <swarmUser /> mounted 进入联系人分群列表页没有当前分群的id`
            );
        } else {
            this.params.pageNumber =
                parseInt(this.$route.query.pageNumber) || 1;
            this.params.searchName = this.$route.query.searchName || '';
            this.getUserGroupTables();
        }
        this.allTreeData = this.allTreeDataDefault; // 接收初始值
        const { scoringId } = this.$route.query;
        this.scoringId = Number(scoringId);
        
        //华为埋码
        if (this.isHw) {
            //UEM埋码
            window.hwa('trackPageView', 'P12031997B85F0D');
        }

    },
    watch: {
        groupId () {
            this.swarmList = [];
            this.params.totalPage = 1;
            this.totalRow = 0;
            this.resetList();
            // this.getUserGroupTables();
            this.treeParams.treeActiveGid = this.groupId;
        },
        allTreeDataDefault (val) {
            this.allTreeData = val;
        },
        showMoveSwarm() {
            let  firstGroup = this.$getCurrentPart(2, this.allTreeData);
            if (this.showMoveSwarm) {
                //移动分组时查找到 "全部分组"，open = true 默认展开
                firstGroup.noSelect = false;
                firstGroup.open = true;
            } else {
                firstGroup.noSelect = true;
            }
        },
        advancedModalOpen() {
            let firstGroup = this.$getCurrentPart(2, this.allTreeData);
            if (this.advancedModalOpen) {
                // 新建高级分群时查找到 "全部分组"，open = true 默认展开
                firstGroup.noSelect = false;
                firstGroup.open = true;

                // 默认选中"默认分组"
                let deftGroup = this.$getCurrentPart(1, firstGroup.childs);
                if (this.groupId !== 0 && this.groupId !== -2 && this.groupId !== -99) {
                    let curGroup = this.$getPartById(this.groupId, this.allTreeData);
                    this.treeParams.treeActiveGid = this.groupId;
                    this.treeParams.parentGroupName = curGroup.name;
                    this.treeParams.searchSelectTree = curGroup;
                    this.treeParams.groupSelectShow = false;
                } else {
                    this.treeParams.treeActiveGid = deftGroup.id;
                    this.treeParams.parentGroupName = deftGroup.name;
                }
                // 展开当前所在分组的所有父级
                this.fathersOpen(this.allTreeData, this.treeParams.treeActiveGid);
            } else {
                firstGroup.noSelect = true;
            }
        },
    },
    computed: {
        //账户信息
        authInfo() {
            return this.$store.state.user;
        },
        cid() {
            // pro环境832，beta环境353
            return this.authInfo.cid === 832 || this.authInfo.cid === 353;
        },
        // 华为类型账号
        isHw() {
            return this.authInfo.companyType === 1;
        }
    },
    methods: {
        /**
         * 判断分群类型
         * @param type 分群类型 1标准 6预置 8高级
         */
        swarmType(type) {
            switch (type) {
                case 1:
                    return this.$t('swarm.normal');
                case 6:
                    return this.$t('swarm.preset');
                case 8:
                    return this.$t('swarm.advanced');
            }
        },
        // 获取列表
        getUserGroupTables () {
            this.loading = true;
            if (this.groupId === -99) {
                ContactApiV1
                    .getSystemSwarmList()
                    .then(res => {
                        const data = res.body.data;
                        this.swarmList = data.systemSwarmList;
                        this.params.totalPage = 1;
                        this.totalRow = data.systemSwarmList.length;
                        this.loading = false;
                    })
                    .catch(() => {
                        this.loading = false;
                    });
            } else {
                ContactApiV1
                    .getSwarmList(
                        this.groupId,
                        this.params.pageNumber,
                        this.params.searchName,
                        this.params.sort,
                        this.params.sortField
                    )
                    .then(res => {
                        const data = res.body.data;
                        this.swarmList = data.swarmList;
                        this.params.totalPage =
                            data.totalPage > 100 ? 100 : data.totalPage;
                        this.totalRow = data.totalRow;
                        this.loading = false;
                        if (this.scoringId) {
                            this.swarmList.filter(item=>{
                                if (item.id === this.scoringId){
                                    this.swarmDetail(item);
                                } 
                            });
                        }
                    })
                    .catch(() => {
                        this.loading = false;
                    });
            }
        },
        // 搜索
        handleSearch () {
            this.params.pageNumber = 1;
            this.params.sort = 'asc';
            this.params.sortField = '';
            this.checkedItem = [];
            this.getUserGroupTables();
            this.$router.push({
                name: 'swarm',
                query: { groupId: this.groupId, pageNumber: this.params.pageNumber, searchName: this.params.searchName }
            });
        },

        // <table操作组>
        // 转到分群详情
        async swarmDetail (e) {
            let hasAuth = await ContactApiV1
                .swarmCheckAction({
                    swarmId: e.id,
                    actionType: 1004
                })
                .then((res) => {
                    return res.body.code;
                });
            if (e.createName !== this.authInfo.email && hasAuth !== 200) {
                return;
            }
            this.$emit('selectSwarm', e);
        },

        /**
         * 点击修改分群
         * @param item 分群数据
         */
        editSwarm (item) {
            if (item.type === 1) {
                this.checkedItem = [];
                let curGroup = this.$getPartById(item.groupId, this.allTreeData);
                let treeParams = this.treeParams;
                treeParams.treeActiveGid = item.groupId;
                treeParams.parentGroupName = curGroup.name;
                treeParams.searchSelectTree = curGroup;
                let addModalParams = this.addModalParams;
                addModalParams.swarmId = item.id;
                addModalParams.swarmName = item.name;
                addModalParams.swarmJson = JSON.parse(item.swarmJson);
                // 展开当前所在分组的所有父级
                this.fathersOpen(this.allTreeData, item.groupId);

                let edit = {
                    addModalParams: this.addModalParams,
                    treeParams: this.treeParams
                };
                this.$emit('editSwarm', edit);
            } else {
                this.$router.push({
                    name: 'advancedSwarm',
                    query: {id: item.id, groupId: item.groupId}
                });
            }
        },

        /**
         * 删除分群列表
         * @param item 分群数据
         */
        delSwarm (item) {
            this.$confirm(
                this.$t('common.delete'),
                this.$t('common.deleteSure')
            ).then(sure => {
                if (sure) {
                    ContactApiV1.deleteSwarm(item.id).then(() => {
                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                        this.params.pageNumber = 1;
                        this.getUserGroupTables();
                    });
                }
            });
        },
        /**
         * 点击查看分群
         * @param item 分群数据
         */
        async swarmView(item) {
            // 判断标准分群是否可以查看
            let hasAuth = await ContactApiV1
                .swarmCheckAction({
                    swarmId: item.id,
                    actionType: 1005
                })
                .then((res) => {
                    return res.body.code;
                });
            if (item.createName !== this.authInfo.email && hasAuth !== 200) {
                return;
            }
            if (item.type === 1) {
                this.checkedItem = [];
                let curGroup = this.$getPartById(item.groupId, this.allTreeData);
                let treeParams = this.treeParams;
                treeParams.treeActiveGid = item.groupId;
                treeParams.parentGroupName = curGroup.name;
                treeParams.searchSelectTree = curGroup;
                let addModalParams = this.addModalParams;
                addModalParams.swarmId = item.id;
                addModalParams.swarmName = item.name;
                addModalParams.swarmJson = JSON.parse(item.swarmJson);
                // 展开当前所在分组的所有父级
                this.fathersOpen(this.allTreeData, item.groupId);

                let edit = {
                    addModalParams: this.addModalParams,
                    treeParams: this.treeParams
                };
                this.$emit('swarmView', edit);
            } else {
                this.$router.push({
                    name: 'advancedSwarmView',
                    query: {id: item.id, groupId: item.groupId}
                });
            }
        },
        /**
         * 点击查看分群溯源信息
         * @param item 分群数据
         */
        tracingSwarm(item) {
            this.$emit('swarmTracing', item.id);
        },
        /**
         * 点击复制分群
         * @param item 分群数据
         */
        swarmCopy(item) {
            if (item.name.length > 97) {
                this.$toast(this.$t('swarm.swarmNameLengthOver'), 'warn');
                return;
            }
            ContactApiV1
                .copySwarm(item.id)
                .then(() => {
                    this.$toast(this.$t('sharing.copySuccess'), 'success');
                    this.params.pageNumber = 1;
                    this.getUserGroupTables();
                })
                .catch();
        },
        /**
         * 排序
         * @param attr 排序参数
         */
        sortByAttr (attr) {
            if (this.params.sortField === attr.fieldName) {
                this.params.sort = this.params.sort === 'asc' ? 'desc' : 'asc';
            } else {
                this.params.sortField = attr.fieldName;
                this.params.sort = 'asc';
            }
            this.checkedItem = [];
            this.getUserGroupTables();
        },

        /**
         * 跳页
         * @param pageNumber 页码
         */
        selectPage (pageNumber) {
            this.params.pageNumber = pageNumber;
            this.getUserGroupTables();
            this.$router.push({
                name: 'swarm',
                query: { groupId: this.groupId, pageNumber: pageNumber, searchName: this.params.searchName }
                // params: { pageNumber: pageNumber }
            });
        },

        // <重置操作组>
        // 列表条件初期化
        resetList () {
            this.params = {
                pageNumber: 1,
                searchName: '', // 关键字
                sort: 'asc', //asc正序 desc 逆序
                sortField: '', // 排序方式
                totalPage: 0 // 总页数
            };
            this.checkedItem = [];
        },

        // 树组件参数初期化
        resetTreeParams () {
            this.treeParams = {
                parentGroupName: '', //分组
                groupSelectShow: false,
                treeActiveGid: '', // 选中的分组id
                searchSelectTree: {}
            };
        },

        //选中分组的所有父级元素open=true
        fathersOpen(list, id) {
            let fathersArr = [];
            fathersArr = this.$getCurrentFathers(list, id);
            fathersArr.forEach(item => {
                item.open = true;
            });
        },

        // <弹窗操作组>

        // 点击新建分群
        addSwarm () {
            this.checkedItem = [];
            let treeParams = this.treeParams;
            // 默认选中"默认分组"
            let deftGroup = this.$getCurrentPart(1, this.allTreeData[0].childs);

            if (this.groupId !== 0 && this.groupId !== -2 && this.groupId !== -99) {
                let curGroup = this.$getPartById(this.groupId, this.allTreeData);
                treeParams.treeActiveGid = this.groupId;
                treeParams.parentGroupName = curGroup.name;
                treeParams.searchSelectTree = curGroup;
                treeParams.groupSelectShow = false;
            } else {
                treeParams.treeActiveGid = deftGroup.id;
                treeParams.parentGroupName = deftGroup.name;
            }

            //新建分群时查找到 "全部分组"
            let  firstGroup = this.$getCurrentPart(2, this.allTreeData);
            firstGroup.noSelect = false;

            // 展开当前所在分组的所有父级
            this.fathersOpen(this.allTreeData, treeParams.treeActiveGid);

            let addModalParams = {
                nameErrorText: '',
                swarmId: '', // 当前分群id
                swarmName: '', // 当前分群名
                swarmJson: [] //条件簇关系
            };
            let edit = {
                addModalParams: addModalParams,
                treeParams: treeParams
            };
            this.$emit('editSwarm', edit);
        },

        // 关闭组选
        closeGroupSelect () {
            this.treeParams.groupSelectShow = false;
        },

        // <tree-menu 限定方法>
        // 弹窗中 tree-menu是否显示
        readyCheckGroup () {
            this.treeParams.groupSelectShow = !this.treeParams.groupSelectShow;
        },

        /**
         * search-tree中选择list的某一项时  接收选中项
         * @param group 分组数据
         */
        getTreeAct (group) {
            this.treeParams.treeActiveGid = group.id;
            this.treeParams.parentGroupName = group.name;
            this.treeParams.searchSelectTree = group; //search-tree中选中的某一项的id
            this.treeParams.groupSelectShow = false;
        },
        //判断是否选中了非本账号创建的高级分群
        creatorReg() {
            let reg = this.checkedItem.some(e => {
                let selected = this.swarmList.find(item => {
                    return item.id === e;
                });
                if (selected.type !== 1 && selected.createName !== this.authInfo.email) {
                    return true;
                }
                return false;
            });
            return reg;
        },
        // <批量操作组>
        // 点击批量移动按钮
        bulkMoveAction () {
            if (this.checkedItem.length === 0) {
                this.$toast(this.$t('swarm.selectSwarm'), 'warn');
                return;
            }
            if (this.creatorReg()) {
                this.$toast(this.$t('swarm.bulkMoveErr'), 'warn');
                return;
            }
            this.showMoveSwarm = true;
        },
        // 取消移动分组
        cancelMoveSwarm () {
            this.showMoveSwarm = false;
            this.resetTreeParams();
        },

        // 确认批量移动
        saveMoveGroup () {
            ContactApiV1
                .batchRemoveSwarm(
                    this.treeParams.treeActiveGid,
                    this.checkedItem
                )
                .then(() => {
                    this.showMoveSwarm = false;
                    this.checkedItem = [];
                    this.$toast(this.$t('swarm.moveSuccess'), 'success');
                    this.getUserGroupTables();
                    this.resetTreeParams();
                })
                .catch();
        },

        // 点击批量删除
        bulkDeleteAction () {
            if (this.checkedItem.length === 0) {
                this.$toast(this.$t('swarm.selectSwarm'), 'warn');
                return;
            }
            if (this.creatorReg()) {
                this.$toast(this.$t('swarm.bulkDelErr'), 'warn');
                return;
            }
            this.showBulkDelete = true;
        },

        // 取消批量删除
        cancelBulkDelete () {
            this.showBulkDelete = false;
            this.resetTreeParams();
        },

        // 确认批量删除
        confirmBulkDelete () {
            ContactApiV1
                .batchDeleteSwarm(this.checkedItem)
                .then(() => {
                    this.showBulkDelete = false;
                    this.resetTreeParams();
                    this.checkedItem = [];
                    this.$toast(this.$t('swarm.deleteSuccess'), 'success');
                    this.getUserGroupTables();
                })
                .catch();
        },
        //通用方法 下拉菜单的收起
        eventListener () {
            this.treeParams.groupSelectShow = false;
        },

        // 取消
        cancel () {
            this.confirm = false;
            this.exportAttrIds = [];
        },

        /**
         * 分群状态
         * @param item 分群数据
         */
        matchSwarmStatus(item) {
            if (item.type === 1) return this.$t('swarm.calculated');                //标准分群
            else if (item.createName !== this.authInfo.email) return '/';                 //高级分群共享分群
            if (item.status === 0) return this.$t('swarm.unCalculate');         //高级分群未计算
            else if (item.status === 1) return this.$t('swarm.calculating');    //高级分群计算中
            else if (item.status === 2) return this.$t('swarm.calculated');     //高级分群计算完成
            return '/';
        },
        /**
         * 分群人数
         * @param item 分群数据
         */
        matchSwarmTotal(item) {
            if (item.type === 1 || item.type === 6) {
                return item.total; // 1 标准分群；6 系统预置分群
            }
            if (item.status === 2) {
                return item.total; // 高级分群计算完成
            }
            return '/'; // 高级分群计算中和未计算
        },
        // 新建高级分群
        addAdvanced() {
            if (this.advancedName === '') {
                this.$toast(this.$t('swarm.enterGroupName'), 'warn');
                this.advancedNameError = this.$t('swarm.nameNoEmpty');
                return;
            }
            if (!COMMON_NAME_REGEXP.test(this.advancedName)) {
                this.$toast(this.$t('swarm.labelNameReg'), 'warn');
                this.advancedNameError = this.$t('swarm.labelNameReg');
                return;
            }
            if (this.treeParams.treeActiveGid === '') {
                this.$toast(this.$t('swarm.pickAGroup'), 'warn');
                return;
            }
            this.advancedLoadOpen = true;
            ContactApiV1
                .saveSwarm({
                    name: this.advancedName,
                    groupId: this.treeParams.treeActiveGid,
                    type: 8,
                    parentId: 0,
                    operation: 0,
                    swarmJson: ''
                })
                .then((res) => {
                    this.$router.push({
                        name: 'advancedSwarm',
                        query: {id: res.body.data.id, groupId: this.treeParams.treeActiveGid}
                    });
                })
                .catch(() => {
                    this.advancedLoadOpen = false;
                });
        },
        //取消新建高级分群
        cancelAdvanced() {
            this.advancedModalOpen = false;
            this.advancedName = '';
            this.advancedNameError = '';
            this.resetTreeParams();
        },
        // 全选当前页数据
        choosePageData() {
            this.checkedItem = this.swarmList.map(item => item.id);
        },
        // 清空选中数据
        clearChoose() {
            this.checkedItem = [];
        }
    }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../common/scss/base/variables';
@import '../../common/scss/base/mixin';

.swarm-list {
    .edit {
        .btn {
            padding: 0;
        }
    }
    .choose-parent {
        display: inline-block;
        position: relative;
        width: 314px;
        $option-height: $input-field-height;
        $border-radius: 4px;
        $hover-bg: #f8f9fa;

        .select-text {
            position: relative;
            display: block;
            @include box-sizing();
            padding-right: $option-height - 2px;
            height: $option-height;
            line-height: $option-height - 2px;
            border: 1px solid $form-border;
            text-indent: 0.8em;
            @include border-radius($border-radius);
            @include user-select(none);
            background-color: white;
            @include ellipsis();

            &:not(.disabled):hover {
                border-color: $theme;
            }

            &:not(.disabled) {
                cursor: pointer;
            }

            &.disabled {
                color: $disabled;
                cursor: not-allowed;
                background-color: $content-bg;

                .select-icon {
                    color: $disabled;
                }
            }

            &.placeholder {
                color: $disabled;
            }

            &.active {
                border-color: $theme;
                @include box-shadow(0 1px 3px rgba($theme, 0.35));

                .select-icon {
                    color: $theme;
                }
            }

            .select-icon {
                height: $option-height - 2px;
                width: $option-height - 2px;
                position: absolute;
                top: 0;
                right: 0;
                text-align: center;
                text-indent: 0;
                color: $color-light-content;
            }
        }

        .search-tree-wrapper {
            position: fixed;
            width: 312px;
            max-width: 312px;
            max-height: 300px;
            background-color: white;
            border: 1px solid $border-color;
            border-top: none;
            z-index: $index-container;
        }
    }
    .swarm-group-table {
        min-width: 960px;
        table-layout: fixed;
        width: 100%;
        text-align: left;
        border-collapse: collapse;
        border-spacing: 0;

        th {
            box-sizing: border-box;
        }

        td {
            overflow: hidden;
            word-break: break-all;
            white-space: normal;
            text-overflow: inherit;
            .name{
                display: flex;
                align-items: center;
            }
        }

        .btn {
            padding: 0;
        }

        .action-icon {
            width: 16px;
            height: 40px;
            margin: 0;
        }

        .edit {
            button:first-child {
                svg {
                    margin-left: 0;
                }
            }

            .btn + .btn {
                margin: 0;
                .icon-search, .icon-suyuan{
                    color: $green;
                }
            }
        }
        .diff-overflow {
            overflow: unset;
        }
    }
}
</style>
