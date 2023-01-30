<template>
    <div class="content-container swarm">
        <div class="content-view">
            <crumbs />
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'home.customerSwarm' | t}}</h1>
                <!--上传数据按钮-->
                <button :disabled="$has('customer_list_upload_csv')" class="pull-right btn btn-md btn-theme" @click="customerUpload">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-upload"></use>
                    </svg>
                    {{'contact.uploadData' | t}}
                </button>
                <!--创建联系人按钮-->
                <button type="button" :disabled="$has('customer_list_add_customer')" class="pull-right btn btn-md btn-theme create-user"
                    @click="showCreateForm">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'contact.createContact' | t}}
                </button>
            </div>
        </div>
        <div class="swarm-content content-view">
            <!-- 左侧用户分组边栏 -->
            <left-sidebar class="custom-height" :SideTreeData="treeData" :fixedList="fixedSwarms" ref="leftSidebar" @select="selectGroup"
                :allTreeData="totalTreeArry" :moduleRange="'swarm'" @sort="getSortType" @modify="saveOrEditGroup" @delete="deleteGroup"
                    @traverseOpen="traverseOpen"></left-sidebar>
            <div class="right-list">
                <!-- 分组页header -->
                <div class="header-inline" v-if="childView === 1" :title="curGroup">
                    <div class="header-text">
                        {{curGroup}}
                    </div>
                </div>
                <!-- 分群页header -->
                <div class="header-inline" v-if="childView === 2">
                    <!--返回列表页-->
                    <div class="btn no-padding" @click="backToGroup">
                        <!-- <span class="icon icon-fanhui1"></span> -->
                        <span class="icon icon-fanhui1"></span>
                    </div>
                    <div class="header-text">
                        {{swarmName}}
                    </div>
                    <!--菜单操作-->
                    <div class="hidden-menu-trigger batch-actions">
                        <svg aria-hidden="true" class="gengduo">
                            <use xlink:href="#icon-gengduo"></use>
                        </svg>
                        <div class="hidden-menu">
                            <button class="btn" @click.stop="showDownload" :disabled="$has('customer_swarm_search_customer')">
                                {{'downloadDetails.download' | t}}
                            </button>
                            <button class="btn" @click.stop="detailEditSwarm" v-if="swarmGroupId"
                                :disabled="$has('customer_swarm_edit_swarm') || (curSwarm.type !== 1 && curSwarm.createName !== authInfo.email)">
                                {{'swarm.editGroup' | t}}
                            </button>
                            <button class="btn" @click.stop="startJourney" :disabled="$has('customer_swarm_start_journey')
                                || (curSwarm.type !== 1 && curSwarm.createName !== authInfo.email)">
                                {{'swarm.beginJourney' | t}}
                            </button>
                        </div>
                    </div>
                </div>
                <!-- 组内分群列表 -->
                <swarm-list v-if="childView===1&&!reloading&&groupId!==''" :groupId="groupId" @selectSwarm="selectSwarm" :allTreeDataDefault="totalTreeArry"
                    :addModalParams="addModalParams" @editSwarm="editSwarm" @swarmView="swarmView" @swarmTracing="swarmTracing" ref="swarmList" />
                <!-- 分群内用户列表 -->
                <swarm-detail :id="swarmId" :swarmName="swarmName" v-if="childView===2" ref="swarmDetail">
                </swarm-detail>
            </div>
        </div>
        <template>
            <!--分群弹窗，编辑/查看分群-->
            <swarm-modal v-if="showAddSwarm" :allTreeData="totalTreeArry" :treeParams="treeParams" :addModalParams="addModalParams"
                @cancel="cancelAddSwarm" @confirm="confirmAddSwarm" @hideGroup="hideGroup" :disabled="swarmDisabled">
            </swarm-modal>
        </template>

        <!-- 创建用户 -->
        <customer-form v-if="createFormShow" @close="createFormShow=false" @complete="completeCreate" />

        <!-- 查看分群溯源 -->
        <modal v-if="swarmTracingView" :title="$t('swarm.queryTracing')" @close="closeSwarmTracing" size="lg">
            <div class="tracing-content">
                <!--搜索框-->
                <div class="pull-right search-box md">
                    <input type="text" :placeholder="$t('swarm.searchTracing')" v-model.trim="traceKeyword"
                           @keydown.enter="handleTracingSearch" maxlength="100">
                    <svg aria-hidden="true" @click="handleTracingSearch">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </div>
                <!-- 溯源列表 -->
                <div class="tracing-list simplify-table">
                    <table>
                        <thead>
                            <tr>
                                <td v-for="(item, index) in tracingTitles"
                                    :key="index" :width="index === 3 ? '80' : '200'">{{item}}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="tracingLoading || tracingList.length === 0">
                                <td class="slim-cell" colspan="4">
                                    <inline-loading v-if="tracingLoading"/>
                                    <list-empty v-else/>
                                </td>
                            </tr>
                            <tr v-else v-for="(trace, index) in tracingList" :key="index">
                                <td>{{trace.userName}}</td>
                                <td>{{trace.loginName}}</td>
                                <td>{{trace.phone}}</td>
                                <td class="tracing-num">
                                    <i class="tracing-load" v-show="traceNumList[index].loading"></i>
                                    <span class="tracing-view"
                                          v-if="traceNumList[index].num === '' && !traceNumList[index].loading"
                                          @click="getTraceNum(trace, index)">{{'tag.view' | t}}</span>
                                    <span v-if="traceNumList[index].num !== ''">{{traceNumList[index].num}}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <pager v-if="tracingList.length > 0"
                       :now="tracingPageNumber"
                       :total="tracingTotalPage"
                       @page="toTracingPage">
                </pager>
            </div>
            <button slot="buttons" class="btn btn-md btn-white" @click="closeSwarmTracing">{{$t('common.close')}}</button>
        </modal>
    </div>
</template>
<script type="text/babel">
import { ContactApiV1, ManageApi } from '@/api';
import swarmList from './swarm-list.vue';
import swarmDetail from './swarm-detail.vue';
import CustomerForm from '../list/customer-form.vue';
import Bus from '../../common/components/group-tree/bus.js'; // Bus是在树形组件中传参时使用
import swarmModal from './swarm-modal.vue';

export default {
    components: {
        swarmList,
        swarmDetail,
        CustomerForm,
        swarmModal
    },
    mounted () {
        this.groupId = parseInt(this.$route.query.groupId) || 0;
        this.getSwarmGroup();
        /**
         * 递归树形菜单
         * singleMenu
         * 点击某个分组
         * groupData所点击的分组详情数据
         */
        Bus.$on('singleMenu', groupData => {
            if (groupData.moduleRange === 'swarm') {
                if (groupData.action) {
                    this.selectGroup(groupData.groupData);
                }
            }
        });
    },
    computed: {
        //账户信息
        authInfo() {
            return this.$store.state.user;
        },
    },
    data () {
        return {
            groupId: '',            //分组ID
            createFormShow: false, //创建联系人弹窗
            childView: 1, // 子页面 1.分群列表 2.分群内联系人列表
            sortType: 3, // 1.创建时间降序 2.创建时间升序 3.更新时间降序 4.更新时间升序
            // 5.分组名称降序 6.分组名称升序 默认:更新时间降序
            // 树形数据
            totalTreeArry: [], // left-sidebar左侧分组数据
            allTreeData: {}, // left-sidebar总数据对象
            treeData: [], // left-sidebar根数据
            curGroup: this.$t('swarm.allswarm'), // 当前分组名称
            fixedSwarms: [
                //固定menu
                {
                    id: 0,
                    fieldName: 'allCount',
                    name: this.$t('swarm.allswarm'),
                    type: 'swarm'
                },
                {
                    id: -2,
                    fieldName: 'createCount',
                    name: this.$t('swarm.iCreated'),
                    type: 'swarm'
                },
                {
                    id: -99,
                    fieldName: 'CustomizedCount',
                    name: this.$t('swarm.Unsubscribers'),
                    type: 'swarm'
                }
            ],
            showAddSwarm: false, // 显示新建/编辑分群
            // 分群条件（分群页显示）
            swarmJson: [],
            swarmGroupId: '',
            swarmId: '', // 分群id
            swarmName: '', //分群名称
            // 添加/编辑弹窗临时属性
            addModalParams: {
                nameErrorText: '',
                swarmId: '', // 当前分群id
                swarmName: '', // 当前分群名
                swarmJson: [] //条件簇关系
            },
            // 分组数参数
            treeParams: {
                parentGroupName: '', //分组
                groupSelectShow: false,
                treeActiveGid: '', // 选中的分组id
                searchSelectTree: {}
            },
            reloading: false, // 左侧重选分组reload分组页
            swarmDisabled: false,   //分群是否可编辑（查看分群时true）
            swarmType: 1,       //分群类型
            curSwarm: null,
            swarmTracingView: false,    //分群溯源弹窗
            tracingTitles: [    //分群溯源表头
                this.$t('EnterPrise.userName'),
                this.$t('EnterPrise.email'),
                this.$t('EnterPrise.phone'),
                this.$t('swarm.tracingData')
            ],
            traceSwarmId: '',   //溯源的分群id
            tracingDisplayList: [],    //分群溯源数据列表
            tracingList: [],    //分群溯源当前页数据列表
            tracingLoading: false,  //分群溯源数据加载
            tracingPageNumber: 1,   //分群溯源列表当前页
            tracingTotalPage: 1,    //分群溯源列表总页数
            traceNumList: [],       //存储每页成员的溯源数据
            traceKeyword: '',       //分群溯源搜索关键词
        };
    },
    methods: {
        //请求用户分组列表
        getSwarmGroup () {
            this.resetSwarm();
            this.childView = 1; // 子页面切回分群列表
            this.swarmId = 0; //分群id置空
            this.swarmName = '';

            this.treeData = [];
            const test = [];
            this.totalTreeArry = [];
            const tree = [];
            ContactApiV1
                .getGroupList(this.sortType)
                .then(res => {
                    if (res.body.data && res.body.data.rootGroup) {
                        this.allTreeData = JSON.parse(
                            JSON.stringify(res.body.data.rootGroup)
                        );
                        this.totalTreeArry.push(this.allTreeData);
                        this.$traverseTree(this.totalTreeArry, tree);
                        this.totalTreeArry = tree;

                        this.treeData = JSON.parse(
                            JSON.stringify(res.body.data.rootGroup.childs)
                        );
                        this.$traverseTree(this.treeData, test);
                        this.treeData = test;

                        let curObj = {};
                        if (this.groupId > 0 ) {
                            curObj = this.$getItself(this.groupId, this.totalTreeArry);
                        } else {
                            this.fixedSwarms.forEach(item => {
                                if (item.id === this.groupId) {
                                    curObj = item;
                                }
                            });
                        }
                        this.curGroup = curObj.name;
                    }
                });
        },
        /**
         * 遍历树数据，将open更改为false
         * @param data 分组数据
         */
        traverseOpen (data) {
            this.$openToFalse(data);
        },
        /**
         * 获取子组件传过来的sortType
         * @param sortType 排序数据
         */
        getSortType (sortType) {
            this.sortType = sortType;
            this.getSwarmGroup();
        },
        /**
         * 新建/编辑分组
         * @param creatdDetail 分组数据
         */
        saveOrEditGroup (creatdDetail) {
            if (this.isSubmit) return;
            this.isSubmit = true;
            let groupId = creatdDetail.groupId || 0;
            ContactApiV1
                .saveOrUpdate(
                    groupId,
                    creatdDetail.groupName,
                    creatdDetail.parentId
                )
                .then(() => {
                    this.isSubmit = false;
                    creatdDetail.groupName = '';
                    this.$refs.leftSidebar.closeNewEditModal();
                    if (!groupId) {
                        this.$toast(this.$t('form.addSuccess'), 'success');
                    } else {
                        this.$toast(this.$t('common.updateSuccess'), 'success');
                    }
                    this.getSwarmGroup();
                })
                .catch(() => {
                    this.isSubmit = false;
                });
        },

        /**
         * 选择分组
         * @param group 分组数据
         */
        selectGroup (group) {
            this.reloading = true;
            this.resetSwarm();
            this.childView = 1; // 子页面切回分群列表
            this.curSwarm = null;
            this.curGroup = group.name;
            if (group.id !== this.groupId ){
                this.$router.replace({
                    name: 'swarm',
                    query: { groupId: group.id }
                });
                this.groupId = group.id;
            }
            this.$nextTick(() => {
                this.reloading = false;
            });
        },
        /**
         * 删除分组
         * @param id 分组数据id
         */
        deleteGroup (id) {
            if (this.isSubmit) return;
            this.isSubmit = true;
            ContactApiV1
                .deleteGroup(id)
                .then(() => {
                    this.isSubmit = false;
                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                    this.getSwarmGroup();
                })
                .catch(() => {
                    this.isSubmit = false;
                });
            this.selectGroup('');
        },

        /**
         * 选择分群
         * @param swarm 分群数据
         */
        selectSwarm (swarm) {
            this.swarmId = swarm.id;
            this.swarmName = swarm.name;
            this.curSwarm = swarm;
            if (this.groupId !== -99) {
                this.swarmGroupId = swarm.groupId || '';
                this.swarmType = swarm.type;
                this.swarmJson = swarm.type === 1 ? JSON.parse(swarm.swarmJson) : [];
                // 添加/编辑弹窗临时属性
                this.addModalParams = {
                    nameErrorText: '',
                    swarmId: this.swarmId, // 当前分群id
                    swarmName: this.swarmName, // 当前分群名
                    swarmJson: this.swarmJson //条件簇关系
                };
                let curGroup = this.$getPartById(swarm.groupId, this.totalTreeArry);
                // 分组数参数
                this.treeParams = {
                    parentGroupName: curGroup.name,
                    groupSelectShow: false,
                    treeActiveGid: swarm.groupId, // 选中的分组id
                    searchSelectTree: curGroup
                };
            }
            this.childView = 2;
        },
        // 返回分组
        backToGroup () {
            this.$route.query.scoringId = '';
            this.resetSwarm();
            this.childView = 1;
            this.curSwarm = null;
        },
        async showDownload () {
            // 检查分群下载数据权限1006
            let hasAuth = await ContactApiV1
                .swarmCheckAction({
                    swarmId: this.swarmId,
                    actionType: 1006
                })
                .then((res) => {
                    return res.body.code;
                });
            if (hasAuth !== 200) {
                return;
            }
            this.$refs.swarmDetail.confirm = true;
        },
        detailEditSwarm () {
            if (this.swarmType === 1) {
                this.showAddSwarm = true;
            } else {
                this.$router.push({
                    name: 'advancedSwarm',
                    query: {id: this.swarmId, groupId: this.swarmGroupId}
                });
            }
        },
        async startJourney () {
            // 检查分群开启旅程权限1007
            let hasAuth = await ContactApiV1
                .swarmCheckAction({
                    swarmId: this.swarmId,
                    actionType: 1007
                })
                .then((res) => {
                    return res.body.code;
                });
            if (hasAuth !== 200) {
                return;
            }
            this.$router.push({
                name: 'draggableJourney',
                params: { swarmId: this.swarmId, id: 0 },
                query: { redirect: this.$route.name }
            });
        },
        // 创建联系人
        showCreateForm () {
            this.createFormShow = true;
        },
        customerUpload () {
            this.$router.push({ name: 'customerUpload' });
        },
        /**
         * 分组页编辑分群
         * @param e 分组及分群数据
         */
        editSwarm (e) {
            this.addModalParams = e.addModalParams;
            this.treeParams = e.treeParams;
            this.showAddSwarm = true;
            //编辑分群时， "全部分组"不可选，noSelect = false，默认展开 open = true
            let  firstGroup = this.$getCurrentPart(2, this.totalTreeArry);
            firstGroup.open = true;
            firstGroup.noSelect = false;
        },
        /**
         * 分组页查看分群条件
         * @param e 分组及分群数据
         */
        swarmView (e) {
            this.swarmDisabled = true;
            this.editSwarm(e);
        },
        /**
         * 查看分群溯源
         * @param id 分群ID
         */
        swarmTracing (id) {
            this.traceSwarmId = id;
            this.swarmTracingView = true;
            this.getSwarmTracingList();
        },
        // 重置分群溯源数据
        initTracingLists() {
            this.tracingDisplayList = [];
            this.tracingList = [];
            this.traceNumList = [];
            this.tracingPageNumber = 1;
            this.tracingTotalPage = 1;
        },
        // 搜索分群溯源数据
        handleTracingSearch() {
            this.initTracingLists();
            this.getSwarmTracingList();
        },
        /**
         * 溯源弹窗页面跳转
         * @param no 页码
         */
        toTracingPage(no) {
            this.tracingPageNumber = no;
            this.getSwarmTracingDisplayList();
        },
        // 获取分群溯源全部数据
        getSwarmTracingList() {
            this.tracingLoading = true;
            ManageApi
                .getSubUserList({
                    searchKeyword: this.traceKeyword,
                    searchType: this.traceKeyword ? 1 : '',// 有查询关键字传 1，没有不传
                    userId: this.$store.state.user.id,
                })
                .then(({body: {data: {userList}}}) => {
                    this.tracingDisplayList = userList.length ? userList : [];
                    this.tracingTotalPage = Math.ceil(this.tracingDisplayList.length / 10);
                    this.getSwarmTracingDisplayList();
                })
                .catch(() => {
                    this.getSwarmTracingDisplayList();
                });
        },
        // 获取分群溯源当前页数据
        getSwarmTracingDisplayList() {
            this.tracingLoading = true;
            if (this.tracingDisplayList.length) {
                // 接口无法分页，前端处理，获取当前页列表
                let pageNum = (this.tracingPageNumber - 1) * 10;
                this.tracingList = this.tracingDisplayList.slice(pageNum, pageNum + 10);
                // 重置当前页溯源数据列表
                let numList = [];
                for (let i = 0; i < this.tracingList.length; i++) {
                    numList.push({num: '', loading: false});
                }
                this.traceNumList = numList;
            }
            this.tracingLoading = false;
        },
        /**
         * 获取分群成员的溯源数据
         * @param trace 成员信息
         * @param index 列表中的成员位置
         */
        getTraceNum(trace, index) {
            this.traceNumList[index].loading = true;
            //接口获取数据
            ContactApiV1
                .getSwarmCountByChildAccount({
                    swarmId: this.traceSwarmId,
                    gateId: trace.gateId,
                    departmentId: trace.departmentId
                })
                .then(({body: {data: {swarmCount}}}) => {
                    this.traceNumList[index].num = swarmCount;
                    this.traceNumList[index].loading = false;
                })
                .catch(() => {
                    this.traceNumList[index].loading = false;
                });
        },
        // 关闭分群溯源
        closeSwarmTracing() {
            this.swarmTracingView = false;
            this.traceKeyword = '';
            this.initTracingLists();
        },
        // 添加/编辑弹窗初期化
        resetAddModal () {
            this.addModalParams = {
                nameErrorText: '',
                swarmId: '', // 当前分群id
                swarmName: '', // 当前分群名
                swarmJson: [] //条件簇关系
            };
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
        // 重置分群相关信息
        resetSwarm () {
            this.swarmId = '';
            this.swarmName = '';
            this.swarmGroupId = '';
            this.swarmJson = [];
            this.swarmType = 1;
            this.resetAddModal();
            this.resetTreeParams();
        },
        // 取消编辑分群
        cancelAddSwarm () {
            this.showAddSwarm = false;
            this.swarmDisabled = false;
            //取消新建分群时，"全部分组" 状态更改为可选
            let  firstGroup = this.$getCurrentPart(2, this.totalTreeArry);
            firstGroup.noSelect = true;
        },
        /**
         * 分组页新建/编辑分群完成
         * @param e 分组及分群数据
         */
        confirmAddSwarm (e) {
            this.showAddSwarm = false;
            this.swarmDisabled = false;
            if (this.childView === 1) {
                this.$refs.swarmList.getUserGroupTables();
                this.resetAddModal();
                this.resetTreeParams();
                this.curSwarm = null;
            } else {
                this.addModalParams = e.addModalParams;
                this.treeParams = e.treeParams;
                this.swarmId = e.addModalParams.swarmId;
                this.swarmName = e.addModalParams.swarmName;
                this.swarmGroupId = e.treeParams.treeActiveGid;
                this.swarmJson = e.treeParams.swarmJson;
                this.$refs.swarmDetail.getUserGroupTables();
            }
            //确定新建分群时，"全部分组" 状态更改为可选
            let  firstGroup = this.$getCurrentPart(2, this.totalTreeArry);
            firstGroup.noSelect = true;
        },
        // 失焦关闭组选框
        hideGroup () {
            this.treeParams.groupSelectShow = false;
        },
        completeCreate () {
            this.$router.replace({name: 'memberList'});
        }
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../common/scss/base/variables';
@import '../../common/scss/base/mixin';
.swarm {
    .page-head {
        .create-user {
            margin-right: 16px;
        }
    }
    .swarm-content {
        display: flex;
        padding-top: 10px;
        @include clearfix();
        .custom-height {
            height: calc(100vh - #{$header-height + $toolbar-height + 24px + 82px});
        }
        .right-list {
            flex: 1;
            padding: 0 16px;
            float: left;
            background-color: white;
            box-sizing: border-box;
            height: calc(
                100vh - #{$header-height + $toolbar-height + 24px + 82px}
            );
            overflow: auto;
            @include transition(width .5s);

            .header-inline {
                height: 28px;
                margin-top: 10px;
                padding: 0;
                line-height: 28px;

                .header-text {
                    vertical-align: top;
                    display: inline-block;
                    max-width: 50%;
                    @include ellipsis();
                }
                .btn {
                    vertical-align: top;
                    display: inline-block;
                    color: $theme;
                    text-transform: none;
                    &.no-padding {
                        padding: 0;
                    }
                }
                svg.gengduo {
                    width: 16px;
                    height: 16px;
                    fill: $color-light-content;
                }
            }
            .list-title {
                // padding: 16px 0;
                padding-bottom: 16px;
                color: $color-light-content;

                .btn-margin {
                    margin-right: 5px;
                }

                .swarm_total {
                    margin-right: 20px;
                    color: $color-title;
                }

                .search-box {
                    margin-right: 24px;
                    width: 300px;
                }

                .create-group{
                    position: relative;
                    .btn{
                        width: 135px;
                    }
                    .hidden-menu {
                        display: block;
                        top: $input-field-height;
                        left: 0;
                        border: none;
                        @include transform-origin(center top);

                        .btn {
                            color: white;
                            text-align: center;
                            font-size: 14px;
                            height: 32px;
                            line-height: 32px;
                            margin: 1px 0 0;

                            &:hover {
                                color: white;
                                background-color: #3dceba;
                            }
                        }
                    }
                }
            }

            .swarm-name {
                display: inline-block;
                max-width: 20em;
                @include ellipsis;
            }

            .action-icon:first-child {
                margin-left: 0;
            }

            .hidden-menu {
                top: $input-field-height;
                left: 0;
                @include transform-origin(left top);

                .btn {
                    display: block;
                    color: $color-light-content;
                    text-align: left;
                    min-width: 120px;
                    font-size: 12px;

                    &:hover {
                        color: $color-content;
                        background-color: #f0f0f0;
                    }
                }

                .btn + .btn {
                    margin: 0;
                }
            }
            .batch-actions {
                position: relative;
                display: inline-block;
                cursor: pointer;
                line-height: $input-field-height;

                &:hover {
                    color: $color-title;
                }

                svg {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    vertical-align: top;
                    margin-top: ($input-field-height - 18px)/2;
                    fill: currentColor;
                    &.gengduo {
                        padding-right: 84px;
                    }
                }
            }
        }
    }
    .tracing-content {
        .search-box {
            margin-bottom: 15px;
        }

        .tracing-list {
            table {
                table-layout: fixed;

                tr td {
                    min-height: 47px;
                    white-space: normal;
                    
                    .tracing-load {
                        display: inline-block;
                        width: 35px;
                        height: 35px;
                        background: url('./trace-loading.gif') no-repeat 0 0;
                        background-size: contain;
                    }
                    .tracing-view {
                        color: $theme;
                    }
                    span {
                        padding: 0 5px;
                    }
                }

                tr {
                    &:hover {
                        background-color: #fff;
                    }
                }
            }
        }
    }
}
</style>
