<template>
    <div class="return-visit-task content-view">
        <!-- 左侧导航栏 -->
        <left-sidebar class="custom-height" :fixedList="fixedGroups" :allTreeData="totalTreeArray"
            :SideTreeData="groupList" @sort="getSortType" @traverseOpen="traverseOpen" @modify="editGroup"
            @delete="deleteGroup" @select="selectGroup" ref="leftSidebar" moduleRange="contactTask" />
        <div class="right-list">
            <div class="return-visit-task-list">
                <div class="list-header">
                    <!-- 创建回访任务按钮 -->
                    <button class="btn btn-md btn-theme btn-margin pull-right" @click="openCreatModal">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        {{'shoppingGuide.addContactTask' | t}}
                    </button>
                    <!--搜索框-->
                    <div class="pull-right search-box lg">
                        <input type="text" :placeholder="$t('shoppingGuide.search')" v-model.trim="params.searchName"
                            @keydown.enter="handleSearch" maxlength="100">
                        <svg aria-hidden="true" @click="handleSearch">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                    <!--批量操作-->
                    <div class="hidden-menu-trigger batch-actions">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-batch"></use>
                        </svg>
                        <span class="title-text">{{'form.batchAction' | t}}</span>
                        <div class="hidden-menu">
                            <button class="btn" @click='bulkMoveAction(2)'>{{'shoppingGuide.moveTo' | t}}</button>
                            <button class="btn" @click='bulkDeleteAction'>{{'shoppingGuide.batchDelete' | t}}</button>
                        </div>
                    </div>
                </div>
                <!-- 回访任务列表 -->
                <table class="simplify-table task-table">
                    <tr>
                        <th class="diff-overflow" width="47">
                            <choose-all-action class="choose-all-action" :choosePageText="$t('shoppingGuide.selectAll')"
                                :clearText="$t('shoppingGuide.clearAll')" @choosePage="choosePageData"
                                @clear="clearChoose" />
                        </th>
                        <th v-for="attr in attrList" :key="attr.fieldName" :width="attr.width">
                            <span>{{attr.name}}</span>
                            <button type="button" class="table-sort-button" v-if="attr.ifSort" @click="sortByAttr(attr)"
                                :title="attr.title || ''">
                                <svg aria-hidden="true" class="asc"
                                    :class="{active:attr.fieldName === params.sortField && params.sortType === 'asc'}">
                                    <use xlink:href="#icon-caret-down">
                                    </use>
                                </svg>
                                <svg aria-hidden="true" class="desc"
                                    :class="{active:attr.fieldName === params.sortField && params.sortType === 'desc'}">
                                    <use xlink:href="#icon-caret-down">
                                    </use>
                                </svg>
                            </button>
                        </th>
                    </tr>
                    <tr v-if="loading" class="no-hover">
                        <td colspan="10" class="slim-cell">
                            <inline-loading />
                        </td>
                    </tr>
                    <template v-else-if="taskList.length > 0">
                        <tr v-for="item in taskList" :key="item.id">
                            <td>
                                <checkbox :source="item.id" v-model="checkedItem" />
                            </td>
                            <td><span class="task-name">{{item.name}}</span></td>
                            <td>{{item.relatedStaff ? item.relatedStaff : '-'}}</td>
                            <td>{{item.returnVisitPerson + '/' + item.taskPerson}}</td>
                            <td>{{item.updateName}}</td>
                            <td>{{item.updateDate.slice(0,16)}}</td>
                            <td>{{item.createName}}</td>
                            <td>{{item.createDate.slice(0,16)}}</td>
                            <td>
                                <button class="btn tag-action-icon" @click="showTaskDetail(item)">
                                    <svg aria-hidden="true" class="icon-eye" v-title:top="$t('shoppingGuide.preview')">
                                        <use xlink:href="#icon-eye"></use>
                                    </svg>
                                </button>
                                <button class="btn tag-action-icon" @click="editTask(item.id)">
                                    <svg aria-hidden="true" class="icon-round-pencil" v-title:top="$t('form.setting')">
                                        <use xlink:href="#icon-round-pencil">
                                        </use>
                                    </svg>
                                </button>
                                <div class="tag-action-icon hidden-menu-trigger">
                                    <svg aria-hidden="true" class="more-icon">
                                        <use xlink:href="#icon-more"></use>
                                    </svg>
                                    <ul class="hidden-menu">
                                        <li class="tag-btn">
                                            <button class="btn" @click="moveTask(item.id)">{{'shoppingGuide.move' | t}}
                                            </button>
                                        </li>
                                        <li>
                                            <button class="btn" @click="copyTask(item.id)">{{'shoppingGuide.copy' | t}}
                                            </button>
                                        </li>
                                        <li class="tag-btn">
                                            <button class="btn tag-btn-click" @click.stop="delTask(item.id)">
                                                {{'shoppingGuide.delete' | t}}
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    </template>
                    <tr v-else class="no-hover">
                        <td class="slim-cell" colspan="10">
                            <list-empty :name="$t('shoppingGuide.returnVisitTask')" v-if="searchNameCopy === ''" />
                            <list-search-empty v-else />
                        </td>
                    </tr>
                </table>
                <div class="list-footer">
                    <div class="total-page">{{'channelCode.total' | t}} <span class="theme-text">{{totalRow}}</span>
                        {{'channelCode.records' | t}}</div>
                    <pager v-if="taskList.length > 0" :now="nowPage" :total="totalPage" @page="toPage" />
                </div>
                <!-- 批量移至分组/移至分组 -->
                <group-move v-if="moveGroup" :title="$t('shoppingGuide.moveTo')" :labelName="$t('shoppingGuide.group')" :groupList="totalTreeArray"
                    :placeHolder="$t('openPlat.pleaseCheck')" @close="cancelMove" @moveDown="groupMoveDown" />
                <!-- 删除回访任务 -->
                <modal v-if="deleted" :title="$t('shoppingGuide.deleteTask')" @close="deleted = false">
                    <p>{{'shoppingGuide.deleteTipss' | t}}</p>
                    <template v-slot:buttons>
                        <button class="btn btn-md btn-white" @click="deleted = false">{{'common.cancel' | t}}</button>
                        <button class="btn btn-md btn-theme" @click="confirm">{{'common.confirm' | t}}</button>
                    </template>
                </modal>
                <!-- 详情 -->
                <modal v-if="taskDetail" :title="$t('shoppingGuide.viewTaskInformation')" @close="closeTaskDetail">
                    <div class="task-detail">
                        <div class="form-field">
                            <label class="label">{{'shoppingGuide.taskName' | t}}</label>
                            <span>{{taskName}}</span>
                        </div>
                        <div class="form-field">
                            <label class="label">{{'shoppingGuide.taskContactsTag' | t}}</label>
                            <div class="tags-list">
                                <span class="customer-tag blue" v-for="(item, index) in checkedContactItem" :key="item.id">
                                    <span class="tag-name-wrapper">
                                        <span class="tag-name" :title="item.name">{{item.name}}</span>
                                    </span>
                                </span>
                            </div>
                        </div>
                        <div class="form-field">
                            <ul class="return-vist-number">
                                <li>
                                    <label class="label-li">{{'shoppingGuide.expectedNumberOfContacts' | t}}</label>
                                    <span class="data-color">{{reviewPerson}}</span>
                                </li>
                                <li>
                                    <label class="label-li">{{'shoppingGuide.relevantEmployees' | t}}</label>
                                    <span class="data-color">{{relatedStaff}}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </modal>
                <!-- 新建回访任务 -->
                <modal v-if="creatTask" :title="$t('shoppingGuide.addContactTask')" @close="cancelCreate">
                    <div class="center-form">
                        <div class="form-field">
                            <label class="label placeholder">{{'shoppingGuide.taskGroup' | t}}</label>
                            <radio source="use" v-model="groupSource">{{'newJourney.selectGroup' | t}}</radio>
                            <radio source="create" v-model="groupSource">
                                {{'newJourney.addGroup' | t}}
                            </radio>
                        </div>
                        <div class="form-field flex" v-if="groupSource === 'create'">
                            <label class="label" for="create2"></label>
                            <input type="text" class="input hg" id="create2" :placeholder="$t('newJourney.groupName')"
                                v-model.trim="groupName" maxlength="255" />
                        </div>
                        <div class="form-field flex">
                            <label class="label placeholder" for="use2">
                                {{groupSource === 'create' ? $t('common.parentGroup') : $t('shoppingGuide.selectGroup')}}
                            </label>
                            <div class="choose-parent" id="use2" @click.stop="readyCheckGroup">
                                <label class="select-text">
                                    {{parentGroupName || $t('journey.journeyGroupHolder')}}
                                    <span class="select-icon icon icon-arrow-down"></span>
                                </label>
                                <div class="search-tree-wrapper" v-if="groupSelectShow" @click.stop>
                                    <search-tree :searchTreeData="totalTreeArry" :treeActiveId="selectGroupId"
                                        @getTreeAct='getTreeAct' :action="false" :levelStage="groupSource === 'use'">
                                    </search-tree>
                                </div>
                            </div>
                        </div>
                    </div>
                    <template v-slot:buttons>
                        <button class="btn btn-md btn-white" @click="cancelCreate">{{'common.cancel' | t}}</button>
                        <button class="btn btn-md btn-theme" @click="addTask">{{'common.confirm' | t}}</button>
                    </template>
                </modal>
                <!-- 回访任务标签人数详情 -->
                <return-tags v-if="returnTaskDetail" :labelIds="this.tagIdList" @close="returnTaskDetail = false">
                </return-tags>
                <!-- 相关员工数量详情 -->
                <relevant-staffs v-if="staffDetail" :labelIds="this.tagIdList" @close="staffDetail = false">
                </relevant-staffs>
            </div>
        </div>
    </div>
</template>

<script type="text/babel">
import GroupMove from '@/common/components/group-move.vue';
import returnTags from './components/return-tags.vue';
import relevantStaffs from './components/relevant-staffs.vue';
import Bus from '@/common/components/group-tree/bus.js'; // Bus是在树形组件中传参时使用
import { WecomApiV1, ContactApiV1 } from '@/api';
import SelectorTree from '@/common/components/selector-tree.vue';
import cloneDeep from 'lodash/cloneDeep';
import {COMMON_NAME_REGEXP} from '../../../../common/utils/regs';
export default {
    components: {
        GroupMove,
        returnTags,
        relevantStaffs,
        SelectorTree
    },
    data () {
        return {
            fixedGroups: [  //固定menu
                { id: 0, fieldName: 'allCount', name: this.$t('shoppingGuide.allTask'), type: 'returnVisitTask' },
                { id: -1, fieldName: 'creatCount', name: this.$t('shoppingGuide.createdbyMe'), type: 'returnVisitTask' }
            ],
            groupList: [],//分组列表
            totalTreeArray: [],
            allTreeData: '',
            sortType: 1,//1：按创建时间降序 2：按创建时间升序 3：按更新时间降序 4：按更新时间升序 5：按名称降序 6：按名称生序
            isSubmit: false,
            groupId: '',//选中的分组id
            reloading: false,
            //表格属性
            attrList: [
                {
                    fieldName: 'name',
                    name: this.$t('shoppingGuide.taskName'),
                    title: this.$t('microPage.arrangeByIntials'),
                    ifSort: true,
                },
                {
                    fieldName: 'staff',
                    name: this.$t('shoppingGuide.numberOfEmployees'),
                    ifSort: false,
                },
                {
                    fieldName: 'total',
                    name: this.$t('shoppingGuide.contactedTotal'),
                    ifSort: false,
                },
                {
                    fieldName: 'updateAccount',
                    name: this.$t('shoppingGuide.lastModifiedBy'),
                    ifSort: false,
                },
                {
                    fieldName: 'updateDate',
                    name: this.$t('shoppingGuide.lastModifiedAt'),
                    title: this.$t('shoppingGuide.arrangeByUpdateTime'),
                    ifSort: true,
                },
                {
                    fieldName: 'createAccount',
                    name: this.$t('shoppingGuide.creator'),
                    ifSort: false,
                },
                {
                    fieldName: 'createDate',
                    name: this.$t('shoppingGuide.createdOn'),
                    title: this.$t('shoppingGuide.arrangeByCreationTime'),
                    ifSort: true,
                },
                {
                    fieldName: 'operation',
                    name: this.$t('shoppingGuide.options'),
                    ifSort: false,
                }
            ],
            loading: false,
            checkedItem: [],//已选中的任务
            // 任务列表
            taskList: [],
            creatTask: false,//创建弹窗
            deleted: false,//删除弹窗
            moveGroup: false,//移动弹窗
            batchMove: false,//批量删除
            taskDetail: false,//任务详情
            nowPage: 1,
            totalPage: 1,
            pageSize: 20,
            totalRow: 0,
            taskName: '',//任务名称
            concatsTag: [],//联系人标签列表
            concatsId: [],//联系人id
            groupSource: 'use',//use使用已有的分组 create创建新的分组
            groupName: '',//新建分组名称
            groupSelectShow: false,//分组下拉菜单是否显示
            parentGroupName: '',//父级分组name
            parentGroupId: '',   //父级分组id
            totalTreeArry: [],
            selectGroupId: '',//新建任务选中的分组id
            returnTaskDetail: false,//回访任务标签人数详情
            staffDetail: false,//相关员工数量
            operType: 1,// 1单个，2批量(指由批量操作按钮触发，而不是选中项数目)
            params: {
                sortType: 'desc',//asc正序 desc 逆序
                sortField: '',  //排序方式
                searchName: '',//关键字
            },
            reviewPerson: '',//预计回访客户数
            relatedStaff: '',//相关员工数
            selectDelId: '',//单个删除的id
            batchDelete: false,//批量删除
            checkedContactItem: [],//选中的标签
            tagsList: [],//标签列表
            taskPerson: '',//总人数
            allLabelList: [],
            tagIdList: [],//联系人标签id
            searchNameCopy: '',
        };
    },
    mounted () {
        this.groupId = parseInt(this.$route.query.groupId) || 0;
        // 获取分组列表
        this.getGroupList();
        // 获取任务列表
        this.getTaskList();
        //点击其他地方下拉菜单收起
        window.addEventListener('click', this.eventListener);
        /**
         * 递归树形菜单
         * singleMenu
         * 点击某个分组
         * groupData所点击的分组详情数据
         */
        Bus.$on('singleMenu', returnTaskData => {
            if (returnTaskData.moduleRange === 'contactTask') {
                if (returnTaskData.action) {
                    this.selectGroup(returnTaskData.groupData);
                }
            }
        });
    },
    destroyed () {
        window.removeEventListener('click', this.eventListener);
    },
    watch: {
        groupSource () {
            //新建素材时，全部分组不可选
            let firstGroup = this.$getCurrentPart(2, this.totalTreeArray);
            firstGroup.open = true;
            if (this.groupSource === 'create') {
                firstGroup.noSelect = true;
                this.parentGroupName = this.totalTreeArray[0].name;
                this.selectGroupId = this.totalTreeArray[0].id;
            }
            if (this.groupSource === 'use' && this.creatTask === true) {
                firstGroup.noSelect = false;
                // 默认选中 默认分组 id
                let r = this.$getCurrentPart(1, firstGroup.childs);
                let defaultId = r.id;
                let routeId = this.$route.query.groupId;
                if (!routeId || routeId === defaultId || routeId <= 0) {
                    this.selectGroupId = defaultId;
                    this.parentGroupName = r.name;
                } else {
                    this.selectGroupId = routeId;
                    let p = this.$getPartById(Number(this.selectGroupId), this.totalTreeArray);
                    this.parentGroupName = p.name;
                }
            }
            // 切换radio时，选中分组的所有父级展开
            this.fathersOpen(this.groupList, Number(this.selectGroupId));
        }
    },
    methods: {
        //选中分组的所有父级元素open=true
        fathersOpen (list, id) {
            let fathersArr = [];
            fathersArr = this.$getCurrentFathers(list, id);
            fathersArr.forEach(item => {
                item.open = true;
            });
        },
        /**
         * 获取子组件传过来的sortType
         * @param sortType
         */
        getSortType (sortType) {
            this.sortType = sortType;
            this.getGroupList();
        },
        /**
         * 遍历树数据，将open更改为false
         * @param data
         */
        traverseOpen (data) {
            this.$openToFalse(data);
        },
        /**
         * 编辑分组
         */
        editGroup (creatdDetail) {
            if (this.isSubmit) return;
            this.isSubmit = true;
            if (creatdDetail.optionType === 'create') {
                WecomApiV1
                    .reviewTaskGroupSave({ name: creatdDetail.groupName, parentId: creatdDetail.parentId })
                    .then((res) => {
                        this.isSubmit = false;
                        this.$toast(res.body.message, 'success');
                        this.getGroupList();
                        this.$refs.leftSidebar.closeNewEditModal();
                    })
                    .catch(()=>{
                        this.isSubmit = false;
                    });
            }
            if (creatdDetail.optionType === 'edit') {
                WecomApiV1
                    .reviewTaskGroupUpdate({
                        id: creatdDetail.groupId,
                        name: creatdDetail.groupName,
                        parentId: creatdDetail.parentId
                    })
                    .then(() => {
                        this.isSubmit = false;
                        this.$toast(this.$t('common.updateSuccess'), 'success');
                        this.getGroupList();
                        this.$refs.leftSidebar.closeNewEditModal();
                    })
                    .catch(()=>{
                        this.isSubmit = false;
                    });
            }
        },
        /**
         * 删除分组
         */
        deleteGroup (groupId) {
            if (this.isSubmit) return;
            this.isSubmit = true;
            WecomApiV1
                .reviewTaskGroupDelete({ id: groupId })
                .then(() => {
                    this.isSubmit = false;
                    this.getGroupList();
                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                }, () => {
                    this.isSubmit = false;
                });
            this.selectGroup('');
        },
        /**
         * 选择分组
         */
        selectGroup (group) {
            this.groupId = group.id;
            this.$router.replace({
                name: 'returnVisitTask',
                query: { groupId: group.id }
            });
            this.checkedItem = [];
            this.nowPage = 1;
            this.params = {
                searchName: '',
                sort: 'desc', //asc正序 desc 逆序
                sortField: '', // 排序方式
            };
            this.getTaskList();
        },
        // 获取用户分组
        getGroupList () {
            this.groupList = [];
            this.totalTreeArray = [];
            const test = [];
            const tree = [];
            WecomApiV1
                .reviewTaskGroupGetGroupList({ sortType: this.sortType })
                .then((res) => {
                    this.allTreeData = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                    this.totalTreeArray.push(this.allTreeData);
                    this.$traverseTree(this.totalTreeArray, tree);
                    this.totalTreeArry = tree;

                    this.groupList = JSON.parse(JSON.stringify(res.body.data.rootGroup.childs));
                    this.$traverseTree(this.groupList, test);
                    this.groupList = test;

                });
        },
        // 获取任务列表
        getTaskList () {
            this.loading = true;
            WecomApiV1
                .reviewTaskGetReviewTaskList({
                    groupId: this.groupId,
                    name: this.params.searchName,
                    sort: this.params.sortType,
                    sortBy: this.params.sortField,
                    pageSize: this.pageSize,
                    page: this.nowPage
                })
                .then(({ body: { data } }) => {
                    this.taskList = data.reviewTaskList;
                    this.totalPage = data.totalPage;
                    this.totalRow = data.totalElement;
                    this.loading = false;
                });
        },
        // 创建任务弹窗
        openCreatModal () {
            let currentGroup = {};
            this.creatTask = true;
            //查找到 "全部分组"
            let firstGroup = this.$getCurrentPart(2, this.totalTreeArry);
            firstGroup.noSelect = false;

            // 默认选中 默认分组 id
            let r = this.$getCurrentPart(1, firstGroup.childs);
            let routeId = Number(this.$route.query.groupId);
            if (routeId <= 0) {
                currentGroup = r;
            } else {
                currentGroup = this.$getPartById(routeId, firstGroup.childs);
            }
            if (!currentGroup) return;
            this.parentGroupName = currentGroup.name;
            this.selectGroupId = currentGroup.id;
            this.fathersOpen(this.totalTreeArry, this.selectGroupId);
        },
        // 创建回访任务
        addTask () {
            if (this.groupSource === 'create' && this.groupName === '') {
                return this.$toast(this.$t('shoppingGuide.groupNameEmpty'), 'warn');
            }
            if (this.groupName && !COMMON_NAME_REGEXP.test(this.groupName)) {
                this.$toast(this.$t('common.filterName'), 'warn');
                return false;
            }
            if (this.groupSource === 'create') {
                WecomApiV1
                    .reviewTaskGroupSave({ name: this.groupName, parentId: this.parentGroupId })
                    .then((res) => {
                        this.selectGroupId = res.body.data.groupId;
                        this.$router.push({ name: 'returnVisitTaskAdd', query: { id: 0, groupId: this.selectGroupId } });
                    });
                this.parentGroupId = '';
            } else {
                this.$router.push({ name: 'returnVisitTaskAdd', query: { id: 0, groupId: this.selectGroupId } });
            }

        },
        // 取消创建
        cancelCreate () {
            this.creatTask = false;
            this.groupSelectShow = false;
            this.groupSource = 'use';
            this.parentGroupId = '';
            this.groupName = '';
            //取消创建回访任务后"全部分组" 状态恢复可选
            let firstGroup = this.$getCurrentPart(2, this.totalTreeArray);
            firstGroup.noSelect = true;
        },
        // 搜索回访任务
        handleSearch () {
            this.nowPage = 1;
            this.params.sort = 'asc';
            this.params.sortField = '';
            this.searchNameCopy = cloneDeep(this.params.searchName);
            this.checkedItem = [];
            this.getTaskList();
        },
        // 批量移动
        /**
         *  @param {number} operType // 1单个，2批量(指由批量操作按钮触发，而不是选中项数目)
         */
        bulkMoveAction (operType) {
            if (this.checkedItem.length === 0) {
                return this.$toast(this.$t('shoppingGuide.noData'), 'warn');
            }
            this.operType = operType;
            this.moveGroup = true;
            let firstGroup = this.$getCurrentPart(2, this.totalTreeArray);
            firstGroup.open = true;
            firstGroup.noSelect = false;
        },
        // 批量删除
        bulkDeleteAction () {
            if (this.checkedItem.length === 0) {
                return this.$toast(this.$t('shoppingGuide.noData'), 'warn');
            }
            this.batchDelete = true;
            this.deleted = true;
        },
        // 全选数据
        choosePageData () {
            this.checkedItem = this.taskList.map(item => item.id);
        },
        // 清空选择
        clearChoose () {
            this.checkedItem = [];
        },
        // 表格排序
        sortByAttr (attr) {
            if (this.params.sortField === attr.fieldName) {
                this.params.sortType = this.params.sortType === 'asc' ? 'desc' : 'asc';
                this.getTaskList();
            } else {
                this.params.sortField = attr.fieldName;
                this.params.sortType = 'asc';
                this.getTaskList();
            }
        },
        // 查看回访任务详情
        showTaskDetail (task) {
            this.taskDetail = true;
            // this.taskName = id.name;
            WecomApiV1
                .reviewTaskSelect(task.id)
                .then(({ body: { data } }) => {
                    this.taskName = data.reviewTask.name;
                    this.reviewPerson = data.reviewTask.reviewPerson ? data.reviewTask.reviewPerson : '0';
                    this.relatedStaff = data.reviewTask.relatedStaff ? data.reviewTask.relatedStaff : '0';
                    this.tagIdList = data.reviewTask.labelIds.split(',');
                    // 获取标签列表
                    this.getTagList();
                });

        },
        // 编辑回访任务
        editTask (id) {
            this.$router.push({ name: 'returnVisitTaskAdd', query: { id: id, groupId: '' } });
        },
        //移动回访任务
        moveTask (id) {
            this.checkedItem = [];
            this.checkedItem.push(id);
            this.bulkMoveAction(1);
        },
        // 复制回访任务
        copyTask (id) {
            WecomApiV1
                .reviewTaskCopy({ id: id })
                .then(() => {
                    this.$toast(this.$t('sharing.copySuccess'), 'success');
                    this.nowPage = 1;
                    this.getTaskList();
                });
        },
        // 显示删除回访任务弹窗
        delTask (id) {
            this.deleted = true;
            this.batchDelete = false;
            this.selectDelId = id;
        },
        // 删除回访任务
        confirm () {
            this.deleteArray = this.batchDelete ? this.checkedItem : [this.selectDelId];
            WecomApiV1
                .reviewTaskDelete({ ids: this.deleteArray })
                .then((res) => {
                    this.$toast(res.body.message, 'success');
                    this.batchDelete = false;
                    this.deleted = false;
                    this.nowPage = 1;
                    this.checkedItem = [];
                    this.getTaskList();
                });
        },
        // 确认移动分组
        groupMoveDown (groupId) {
            WecomApiV1
                .reviewTaskMove({ moveGroupId: groupId, ids: this.checkedItem })
                .then(() => {
                    this.$toast(this.$t('material.moveSuccess'), 'success');
                    this.getTaskList();
                    this.checkedItem = [];
                    //移动标签 成功后 "全部分组" 状态恢复可选
                    let firstGroup = this.$getCurrentPart(2, this.totalTreeArray);
                    firstGroup.noSelect = true;
                });
        },
        //取消移动
        cancelMove() {
            this.moveGroup = false;
            //移动标签弹窗关闭后"全部分组" 状态恢复可选
            let firstGroup = this.$getCurrentPart(2, this.totalTreeArray);
            firstGroup.noSelect = true;
        },
        // 跳页
        toPage (e) {
            this.nowPage = e;
            this.getTaskList();
        },
        readyCheckGroup () {
            this.groupSelectShow = !this.groupSelectShow;
        },
        // 获取分组的数据
        getTreeAct (group) {
            this.selectGroupId = group.id;
            this.parentGroupName = group.name;
            this.parentGroupId = group.id;
            this.groupSelectShow = false;
        },
        // 获取联系标签
        getTagList () {
            ContactApiV1
                .getGroups({ sortType: this.sortType, authorityType: 0 })
                .then((res) => {
                    this.tagsList = res.body.data.rootGroup.childs;
                    // 回显
                    if (this.tagsList.length > 0) {
                        this.allLabelList = [];
                        this.tagsList.filter(item => {
                            if (item.labels.length > 0) {
                                this.allLabelList = this.allLabelList.concat(item.labels);
                            }
                            item.childs.filter(label => {
                                if (label.labels.length > 0) {
                                    this.allLabelList = this.allLabelList.concat(label.labels);
                                }
                                label.childs.filter(name => {
                                    if (name.labels.length > 0) {
                                        this.allLabelList = this.allLabelList.concat(name.labels);
                                    }
                                });
                            });
                        });
                        this.allLabelList.map(item => {
                            this.tagIdList.map(contact => {
                                if (item.id === parseInt(contact)) {
                                    this.checkedContactItem = this.checkedContactItem.concat(item);
                                }
                            });
                        });
                    }
                });
        },
        // 选择分组标签
        checked (val) {
            this.checkedContactItem = val;
        },
        // 关闭详情弹窗
        closeTaskDetail () {
            this.taskDetail = false;
            this.checkedContactItem = [];
        },
        //通用方法 下拉菜单的收起
        eventListener () {
            this.groupSelectShow = false;
        },
    }
};
</script>

<style lang="scss">
@import "../../../../common/scss/base/variables";
@import "../../../../common/scss/base/mixin";
.return-visit-task {
    display: flex;
    padding-top: 10px;
    .custom-height {
        height: calc(100vh - #{$header-height + $toolbar-height + 24px + 82px});
    }
    .right-list {
        flex: 1;
        padding: 0 16px;
        float: left;
        background-color: white;
        box-sizing: border-box;
        height: calc(100vh - #{$header-height + $toolbar-height + 24px + 82px});
        overflow: auto;
        @include transition(width 0.5s);
        .return-visit-task-list {
            .list-header {
                margin-top: 20px;
                .search-box {
                    margin-right: 24px;
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
                }
            }

            .task-table {
                table-layout: fixed;
                width: 100%;
                margin-top: 16px;
                text-align: left;
                border-collapse: collapse;
                border-spacing: 0;
                .tag-action-icon {
                    position: relative;
                    display: inline-block;
                    padding: 0;
                    margin-top: 1px;

                    + .tag-action-icon {
                        margin: 0 0 0 8px;
                    }

                    svg {
                        display: block;
                        width: 16px;
                        height: 16px;
                        @include transition();
                    }
                    &:not([disabled]) {
                        cursor: pointer;
                        .icon-round-pencil {
                            fill: $theme;

                            &:hover {
                                fill: $light-theme;
                            }
                        }
                        .icon-eye {
                            fill: $theme;

                            &:hover {
                                fill: $light-theme;
                            }
                        }
                    }
                    .more-icon {
                        display: block;
                        width: 16px;
                        height: 16px;
                        @include transition();
                        fill: $color-light-content;

                        &:hover {
                            fill: $light-theme;
                        }
                    }
                }
                tr {
                    height: 40px;
                    border-bottom: 1px solid $border-color;
                    &:first-child {
                        background-color: $select-bg;
                    }
                    td:first-child {
                        text-align: center;
                    }
                }
                th {
                    box-sizing: border-box;
                    &:not([width]) {
                        width: 100%;
                    }
                }
                td {
                    word-break: break-word;
                    white-space: normal;
                    .task-name {
                        display: inline-block;
                        padding-right: 10px;
                    }
                }
                .diff-overflow {
                    overflow: unset;
                    .choose-all-action{
                        .btn{
                            white-space: nowrap;
                        }
                    }
                }
            }

            .list-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .task-detail {
                .label {
                    text-align: left;
                }
                .return-vist-number {
                    display: flex;
                    // justify-content: space-between;
                    align-items: center;
                    li {
                        .label-li{
                            display: inline-block;
                            margin-right: 12px;
                            vertical-align: top;
                            color: #595959;
                        }
                        margin-right: 80px;
                    }
                    .data-color {
                        // cursor: pointer;
                        color: $theme;
                    }
                }
            }

            .center-form {
                width: 80%;
                .choose-parent {
                    display: inline-block;
                    position: relative;

                    $option-height: $input-field-height;
                    $border-radius: 4px;
                    $hover-bg: #f8f9fa;

                    .select-text {
                        position: relative;
                        display: block;
                        @include box-sizing();
                        padding-right: $option-height - 2px;
                        width: 333px;
                        max-width: 333px;
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
                        position: absolute;
                        width: 333px;
                        max-height: 300px;
                        background-color: white;
                        border: 1px solid $border-color;
                        border-top: none;
                        z-index: $index-container;
                    }
                }
            }
        }
        .customer-tag {
            display: inline-block;
            vertical-align: top;
            border-radius: 4px;
            border: 1px solid $purple;
            margin: ($input-field-height - 24px)/2 ($input-field-height - 24px)/2
                ($input-field-height - 24px)/2 0;
            padding: 0 8px;
            line-height: 24px;
            color: $purple;

            &.blue {
                background-color: #f2f0ff;
                
            }

            .tag-name-wrapper {
                display: flex;
                .tag-name {
                    display: inline-block;
                    max-width: 400px;
                    @include ellipsis();
                }
            }

            svg {
                float: right;
                width: 14px;
                height: 14px;
                margin: 5px 0 5px 5px;
                fill: white;
                cursor: pointer;

                &:hover {
                    fill: $content-bg;
                }
            }
        }
        .tags-list{
            display: inline-block;
            width: 430px;
            max-height: 110px;
            overflow: scroll;
        }
    }
}
</style>
