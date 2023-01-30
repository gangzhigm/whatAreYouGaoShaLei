<template>
    <div class="org-member">
        <!-- 正文 -->
        <div class="page-content org-member-content">
            <div class="left-list" :class="{ collapsed: sidebarCollapsed }">
                <div class="siderbar-container">
                    <button id="enterprise_member_add_department" :disabled="$has('enterprise_member_add_department')"
                            type="button" class="btn create-btn" @click="addOrganization">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        {{'EnterPrise.createOrg' | t}}
                    </button>
                    <search-org-field :dt="treeList" @selectOrganization="selectOrganization($event)"></search-org-field>
                    <div class="org-tree-div">
                        <inline-loading v-if="orgLoading"></inline-loading>
                        <org-tree v-else :list="treeList" @selectItem="selectTreeItem($event)"
                                @delete="handleTreeDelete($event)"
                                @edit="handleTreeEdit($event)"></org-tree>
                    </div>
                </div>
            </div>
            <div class="right-list">
                <div class="title-text">{{activeOrgName}}</div>
                <div class="list-title">
                    <div class="pull-left">
                        <!--批量操作-->
                        <div class="hidden-menu-trigger batch-actions">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-batch"></use>
                            </svg>
                            <span>{{'form.batchAction' | t}}</span>
                            <div class="hidden-menu">
                                <button class="btn" @click="handleActive()"
                                    :disabled="$has('enterprise_member_active_user') || !checkedItems.length">
                                    {{'EnterPrise.activeAndReset' | t}}
                                </button>
                                <button class="btn" @click="forbidden(checkedItems)"
                                    :disabled="$has('enterprise_member_active_user') || !checkedItems.length">
                                    {{'EnterPrise.disabled' | t}}
                                </button>
                            </div>
                        </div>
                    </div>
                    <button :disabled="$has('enterprise_member_add_user')"
                            class="btn btn-theme btn-md pull-right add-button" @click="addNewUser">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        {{'EnterPrise.addUser' | t}}
                    </button>
                    <div class="pull-right search-box xl">
                        <input type="text" :placeholder="$t('EnterPrise.search')" v-model.trim="keyWords"
                               @keyup.enter="checkSelectType">
                        <svg aria-hidden="true" @click="checkSelectType">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                </div>
                <div class="simplify-table">
                    <table>
                        <thead>
                        <tr>
                            <th class="diff-overflow" width="47">
                                <choose-all-action @choosePage="choosePageData" @clear="clearChoose"/>
                            </th>
                            <th>
                                {{'EnterPrise.userName' | t}}
                            </th>
                            <th>{{'EnterPrise.email' | t}}</th>
                            <th>{{'EnterPrise.phone' | t}}</th>
                            <th>{{'EnterPrise.role' | t}}</th>
                            <th>{{'EnterPrise.module' | t}}</th>
                            <th class="filter-th">
                                {{'EnterPrise.status' | t}}
                                <div class="filter-box" v-blur="handleFilterBlur">
                                    <svg aria-hidden="true" @click="statusShow = !statusShow">
                                        <use v-bind:xlink:href="'#icon-' + (statusShow ? 'shaixuan-tianchong' : 'shaixuan')"></use>
                                    </svg>
                                    <transition name="drop">
                                        <div class="drop-list" v-if="statusShow">
                                            <radio v-model="currentStatus" :source="-1">{{'journey.status.all' | t}}
                                            </radio>
                                            <radio v-model="currentStatus" :source="0">{{'EnterPrise.using' | t}}
                                            </radio>
                                            <radio v-model="currentStatus" :source="1">{{'EnterPrise.disabled' | t}}
                                            </radio>
                                        </div>
                                    </transition>
                                </div>
                            </th>
                            <!-- <th width="120">{{'EnterPrise.validTime' | t}}</th> -->
                            <th width="120">
                                <span>{{'EnterPrise.validTime' | t}}</span>
                                <button type="button" class="table-sort-button" :disabled="!userList.length"
                                    :title="$t('EnterPrise.arrangedByValidTime')" @click="sortByValidTime">
                                    <svg aria-hidden="true" class="asc"
                                        :class="{active: sort === 1}">
                                        <use xlink:href="#icon-caret-down">
                                        </use>
                                    </svg>
                                    <svg aria-hidden="true" class="desc"
                                        :class="{active: sort === 0}">
                                        <use xlink:href="#icon-caret-down">
                                        </use>
                                    </svg>
                                </button>
                            </th>
                            <th width="120">{{'EnterPrise.options' | t}}</th>
                        </tr>
                        </thead>
                        <tbody>
                            <template v-if="!fetching && userList && userList.length > 0">
                                <tr class="no-hover" :class="{ 'warn': dateComparer(item.validTime) }" v-for="item in userList" :key="item.id">
                                    <td>
                                        <checkbox :source="item.id" v-model="checkedItems" />
                                    </td>
                                    <td :title='item.userName'>{{item.userName}}</td>
                                    <td :title='item.loginName'>{{item.loginName}}</td>
                                    <td :title='item.phone'>{{item.phone}}</td>
                                    <td :title='item.roleRemark'>{{item.roleRemark}}</td>
                                    <td :title='item.moduleCount'>{{item.moduleCount}}</td>
                                    <td :title="item.status === 3 ? $t('EnterPrise.using') : $t('EnterPrise.disabled')">
                                        <span class="theme-text" v-if="item.status === 3">{{ 'EnterPrise.using' | t }}</span>
                                        <span class="red-text" v-else>{{ 'EnterPrise.disabled' | t}}</span>
                                    </td>
                                    <td :title="item.validTime">{{ dateHandler(item.validTime) || '/'}}</td>
                                    <td>
                                        <button v-if="item.status===3" class="btn pull-left nomargin"
                                            :disabled="$has('enterprise_member_active_user')">
                                            <svg aria-hidden="true"
                                                :class="{'icon-disable':$has('enterprise_member_active_user')}"
                                                class="action-icon icon-pause"
                                                v-title:top="$t('EnterPrise.deactive')"
                                                @click="forbidden(item)">
                                                <use xlink:href="#icon-pause"></use>
                                            </svg>
                                        </button>
                                        <button v-if="item.status===4" class="btn pull-left nomargin"
                                            :disabled="$has('enterprise_member_active_user')">
                                            <svg aria-hidden="true"
                                                :class="{'icon-disable':$has('enterprise_member_active_user')}"
                                                class="action-icon icon-kaishi"
                                                v-title:top="$t('EnterPrise.active')"
                                                @click="handleActive(item)">
                                                <use xlink:href="#icon-kaishi"></use>
                                            </svg>
                                        </button>
                                        <button class="btn pull-left nomargin" :disabled="$has('enterprise_member_edit_user')">
                                            <svg aria-hidden="true"
                                                id="enterprise_member_edit_user"
                                                :class="{'icon-disable':$has('enterprise_member_edit_user')}"
                                                class="action-icon icon-pencil"
                                                @click="editUser(item)" v-title:top="$t('common.edit')">
                                                <use xlink:href="#icon-round-pencil"></use>
                                            </svg>
                                        </button>
                                        <button class="btn pull-left nomargin" :disabled="$has('enterprise_member_delete_user')">
                                            <svg aria-hidden="true"
                                                id="enterprise_member_delete_user"
                                                :class="{'icon-disable':$has('enterprise_member_delete_user')}"
                                                class="action-icon icon-delete"
                                                @click="deleteAction(item)" v-title:top="$t('common.del')">
                                                <use xlink:href="#icon-round-close"></use>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            </template>
                            <tr v-else class="no-hover">
                                <td colspan="9">
                                    <inline-loading v-if="fetching" />
                                    <list-search-empty v-else-if="keyWords !== ''"/>
                                    <list-empty v-else :name="$t('EnterPrise.user')"/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <pager :total="totalPage" :now="nowPage" @page="handlePage"></pager>
            </div>
        </div>
        
        <!-- 激活账号弹窗 -->
        <confirm v-if="activeShow"
            :title="$t('EnterPrise.activeUser')"
            @cancel="cancelActive"
            @confirm="activeRequest(activatingItem)">
            <div class="form-label-inline">
                <span v-if="activatingItem.id">{{ 'EnterPrise.setValidTime' | t}}</span>
                <span v-else>
                    {{ 'EnterPrise.setValidTimeFor' | t }}
                    {{ checkedItems.length }}
                    {{ 'EnterPrise.userTips' | t }}
                </span>
            </div>
            <calendar v-model="activatingItem.validTime" format="yyyy-mm-dd" :start="activatingItem.curDate"
                :end="activatingItem.parentValidTime" />
        </confirm>

        <!-- 删除 -->
        <confirm v-if="isDelete"
                 :title="$t('common.defaultConfirmTitle')"
                 @cancel="closeDelete"
                 @confirm="deleteConfirm">
            {{'EnterPrise.deleteConfirm' | t}}
        </confirm>
        <!--编辑/新增部门-->
        <confirm v-if="showAddOrg" class="org-member-confirm"
                 :title="addOrEditOrg=='edit' ? $t('EnterPrise.editOrg') :  $t('EnterPrise.createOrg')"
                 @cancel="cancelAdd"
                 @confirm="confirmAdd">
            <div class="form-field">
                <label for="groupTitle" class="label">{{'EnterPrise.orgName' | t}}</label>
                <input class="input" :class="{error: nameErrorText}" type="text"
                       v-model.trim="addOrEditObj.departmentName" @click="nameErrorText = ''"
                       :placeholder="$t('EnterPrise.enterOrgName')" maxlength="64"
                       v-title:top.warn.line="nameErrorText">
            </div>
            <div class="form-field">
                <label for="groupTitle" class="label">{{'EnterPrise.superOrgName' | t}}</label>
                <search-base-tree
                        ref="sbt"
                        :wm="'lg'"
                        :list="editTreeList"
                        v-model="addOrEditObj.parentId"
                ></search-base-tree>
            </div>
        </confirm>
    </div>
</template>
<script type="text/babel">
    import { ManageApi, DepartmentApiV1 } from '@/api';
    import { SHOW_SIDE_BAR } from '@/store/vuex/mutationTypes';
    import SearchBaseTree from './components/search-base-tree.vue';
    import OrgTree from './components/org-tree.vue';
    import SearchOrgField from './components/search-org-field.vue';
    import cloneDeep from 'lodash/cloneDeep';
    import {DEPARTMENT_NAME_REGEXP} from '@/common/utils/regs';
    import format from 'date-fns/format';
    import { mapState } from 'vuex';

    export default {
        data() {
            return {
                orgLoading: true,
                //组织节点tree
                treeList: [],
                //编辑edit/新增add组织
                showAddOrg: false,
                addOrEditOrg: 'add',
                //保存对象
                addOrEditObj: {
                    departmentName: '',
                    title: '',
                    id: 0,
                    parentId: 0,
                },
                //编辑树
                editTreeList: [],
                //新增员工
                nameErrorText: '',
                //编辑保存树的id，删除树使用父级
                activeOrgId: '',
                activeParentId: 0,
                keyWords: '',
                //0手机号 1邮箱
                searchType: '',
                //用户列表
                allUserList: [],
                //当前显示的成员
                userList: [],
                totalPage: 1,
                nowPage: 1,
                //禁用/启用删除
                userId: '',
                deleteSubscription: '',
                //删除/禁用
                isDelete: false,
                checkedItems: [], // 选中项
                fetching: true,
                activatingItem: null,
                activeShow: false, // 激活弹窗
                sort: -1,
                currentStatus: -1, // 当前状态 -1全部 1禁用 0启用
                statusShow: false, // 选择器展开状态
            };
        },
        computed: {
            ...mapState(['sidebarCollapsed']),
            //activeOrgName
            activeOrgName() {
                if (this.treeList && this.treeList.length > 0) {
                    let rs = this.findPathByLeafId(this.activeOrgId, this.treeList);
                    if (rs) {
                        for (let i = 0; i < rs.length; i++) {
                            // this.activeOrgId get from query may String
                            // eslint-disable-next-line
                            if (rs[i].id == this.activeOrgId) {
                                return rs[i].title;
                            }
                        }
                    }
                    return this.treeList[0].departmentName;
                }

            }
        },
        watch: {
            currentStatus() {
                this.handlePage(1);
                this.statusShow = false;
                this.getUserList();
            }
        },
        mounted() {
            this.$store.commit(SHOW_SIDE_BAR, true);
            this.activeParentId = this.$route.query.activeParentId || '';
            this.activeOrgId = this.$route.query.activeOrgId || '';
            this.keyWords = this.$route.query.keyWords || '';
            this.nowPage = this.$route.query.nowPage || 1;
            //子成员账号
            this.getUserList();
            //01获取组织列表
            this.getAllDepartment();
        },
        beforeDestroy() {
            this.$store.commit(SHOW_SIDE_BAR, false);
        },
        methods: {
            // 01获取组织节点列表
            getAllDepartment() {
                this.orgLoading = true;
                DepartmentApiV1.getAllDepartment()
                    .then((res) => {
                        let list = res.body.data.children;
                        //部门树添加spread: false,checked: false,
                        this.initDt(list);
                        //弹框树
                        this.editTreeList = cloneDeep(list);
                        //左侧部门树
                        this.treeList = cloneDeep(list);
                        this.initDtChecked(this.treeList, true);
                        //没有当前部门默认选中第一个
                        if (this.activeOrgId === '' && this.treeList && this.treeList[0]) {
                            this.activeOrgId = this.treeList[0].id;
                            this.activeParentId = this.treeList[0].parentId;
                            this.$router.replace({
                                name: this.$route.name,
                                query: Object.assign({}, this.$route.query, {
                                    activeParentId: this.activeParentId,
                                    activeOrgId: this.activeOrgId,
                                })
                            });
                        }
                        //根据activeOrgId展开选中
                        if (this.activeOrgId) {
                            //查找相关父级,01除了本身全部打开，02本身选中
                            let orgObjArray = this.findPathByLeafId(this.activeOrgId, this.treeList);
                            for (let i = 0; i < orgObjArray.length; i++) {
                                // this.activeOrgId get from query may String
                                // eslint-disable-next-line
                                if (orgObjArray[i].id == this.activeOrgId) {
                                    orgObjArray[i].checked = true;//选中
                                } else {
                                    orgObjArray[i].spread = true;//展开
                                }
                            }
                        }
                        this.orgLoading = false;
                    })
                    .catch(() => {
                        this.orgLoading = false;
                        this.$loaded();
                    });
            },
            /**
             * 02初始化树全部展开
             * spread 展开
             * @param dt
             */
            initDtChecked(dt, flag) {
                for (let i = 0; i < dt.length; i++) {
                    let item = dt[i];
                    this.$set(item, 'spread', flag);
                    if (item.children) {
                        this.initDtChecked(item.children, flag);
                    }
                }
            },
            /**
             * 01初始化树
             * spread 展开
             * checked 选中
             * title 名称
             * @param dt
             */
            initDt(dt) {
                for (let i = 0; i < dt.length; i++) {
                    let item = dt[i];
                    this.$set(item, 'spread', false);
                    this.$set(item, 'checked', false);
                    this.$set(item, 'title', item.departmentName);
                    if (item.children) {
                        this.initDt(item.children);
                    }
                }
            },
            //递归实现
            //@leafId  为你要查找的id，
            //@nodes   为原始Json数据
            //@path    供递归使用，不要赋值
            findPathByLeafId: function (leafId, nodes, path) {
                if (path === undefined) {
                    path = [];
                }
                for (let i = 0; i < nodes.length; i++) {
                    let tmpPath = path.concat();
                    tmpPath.push(nodes[i]);
                    // this.activeOrgId get from query may String
                    // eslint-disable-next-line
                    if (leafId == nodes[i].id) {
                        return tmpPath;
                    }
                    if (nodes[i].children) {
                        let findResult = this.findPathByLeafId(leafId, nodes[i].children, tmpPath);
                        if (findResult) {
                            return findResult;
                        }
                    }
                }
            },
            //点击新建组织部门
            addOrganization() {
                this.initDt(this.editTreeList);
                this.showAddOrg = true;
                this.addOrEditOrg = 'add';
                this.addOrEditObj.id = 0;
                this.addOrEditObj.departmentName = '';
                this.addOrEditObj.title = '';
                this.addOrEditObj.parentId = 0;
            },
            //验证
            valid() {
                this.nameErrorText = '';
                if (this.addOrEditObj.departmentName === '') {
                    this.nameErrorText = this.$t('EnterPrise.nameNoEmpty');
                    return false;
                }
                if (!DEPARTMENT_NAME_REGEXP.test(this.addOrEditObj.departmentName)) {
                    this.nameErrorText = this.$t('EnterPrise.labelNameReg');
                    return;
                }
                if (!this.addOrEditObj.parentId) {
                    this.$toast(this.$t('EnterPrise.enterSuperOrgName'), 'warn');
                    return false;
                }
                //编辑时需要判断一下父级不能选择本身
                if (this.addOrEditObj.id !== 0 && this.addOrEditObj.id === this.addOrEditObj.parentId) {
                    this.$toast(this.$t('EnterPrise.enterSuperOrgError'), 'warn');
                    return false;
                }
                return true;
            },
            // 保存部门
            confirmAdd() {
                if (this.valid()) {
                    // 新增组织
                    if (this.addOrEditObj.id === '' || this.addOrEditObj.id === 0) {
                        DepartmentApiV1
                            .addDepartment({
                                departmentName: this.addOrEditObj.departmentName,
                                parentId: this.addOrEditObj.parentId,
                            })
                            .then(({body: {data: {department: {id, parentId}}}}) => {
                                this.$toast(this.$t('common.createSuccess'), 'success');
                                this.activeOrgId = id;
                                this.activeParentId = parentId;
                                this.clearData();
                                //得到部门数据
                                this.getAllDepartment();
                                //关闭弹窗
                                this.showAddOrg = false;
                                this.$loaded();

                            })
                            .catch(() => {
                                this.$loaded();
                            });
                    } else {
                        // 修改组织
                        DepartmentApiV1
                            .addDepartment({
                                id: this.addOrEditObj.id,
                                departmentName: this.addOrEditObj.departmentName,
                                parentId: this.addOrEditObj.parentId,
                            })
                            .then(({body: {data: {department: {id, parentId}}}}) => {
                                this.$toast(this.$t('common.createSuccess'), 'success');
                                this.activeOrgId = id;
                                this.activeParentId = parentId;
                                this.clearData();
                                //得到部门数据
                                this.getAllDepartment();
                                //关闭弹窗
                                this.showAddOrg = false;
                                this.$loaded();
                            })
                            .catch(() => {
                                this.$loaded();
                            });
                    }
                }
            },
            // 点击取消添加部门
            cancelAdd() {
                this.showAddOrg = false;
                this.nameErrorText = '';
            },
            clearData() {
                this.addOrEditObj.departmentName = '';
                this.addOrEditObj.title = '';
                this.addOrEditObj.id = 0;
                this.addOrEditObj.parentId = 0;
                this.nameErrorText = '';
            },
            //编辑部门
            handleEdit(item) {
                this.activeOrgId = item.cur.id;
                this.activeParentId = item.cur.parentId;
                this.initDt(this.editTreeList);
                this.addOrEditObj.id = item.cur.id;
                this.addOrEditObj.departmentName = item.cur.title;
                this.addOrEditObj.title = item.cur.title;
                this.addOrEditObj.parentId = item.cur.parentId;
                this.showAddOrg = true;
                this.addOrEditOrg = 'edit';
            },
            //选删除部门
            async handleDelete(item) {
                this.activeOrgId = item.cur.id;
                this.activeParentId = item.cur.parentId;
                //01判断有没有自部门
                if (item.cur && item.cur.children && item.cur.children.length > 0) {
                    //判断是否存在子部门
                    this.$toast(this.$t('EnterPrise.deleteCheck'), 'warn');
                    return;
                }
                //删除之前需要判读一下是否存在员工
                let res = await ManageApi
                    .getSubUserList({
                        parentId: item.cur.parentId,
                        departmentId: item.cur.id,
                        searchKeyword: this.keyWords,
                        searchType: this.searchType,
                        userId: this.$store.state.user.id
                    });
                let userList = res.body.data.userList;
                //02判断存在员工不
                if (userList && userList.length > 0) {
                    //判断是否存在子部门
                    this.$toast(this.$t('EnterPrise.deleteCheck'), 'warn');
                    return;
                }
                //删除
                this.$confirm(this.$t('common.delete'), this.$t('common.deleteSure'))
                    .then(sure => {
                        if (sure) {
                            DepartmentApiV1
                                .deleteOrg(item.cur.id)
                                .then(() => {
                                    //删除部门-激活父级
                                    this.activeOrgId = item.par.id;
                                    this.activeParentId = item.par.parentId;
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    this.getAllDepartment();
                                });
                        }
                    });

            },
            //选择部门
            selectOrganization(item) {
                this.activeOrgId = item.cur.id;
                this.activeParentId = item.cur.parentId;
                this.keyWords = '';
                this.nowPage = 1;
                this.$router.replace({
                    name: this.$route.name,
                    query: Object.assign({}, this.$route.query, {
                        activeParentId: this.activeParentId,
                        activeOrgId: this.activeOrgId,
                        keyWords: '',
                        nowPage: 1
                    })
                });
                this.getUserList();
            },
            //用户查询
            checkSelectType() {
                //邮箱
                this.searchType = 1;
                this.nowPage = 1;
                this.$router.replace({
                    name: this.$route.name,
                    query: Object.assign({}, this.$route.query, {
                        keyWords: this.keyWords,
                        nowPage: 1
                    })
                });
                this.getUserList();
            },
            // 获取用户列表
            getUserList() {
                this.fetching = true;
                let params = {
                    parentId: this.activeParentId,
                    departmentId: this.activeOrgId,
                    searchKeyword: this.keyWords,
                    searchType: this.keyWords ? 1 : '',// 有查询关键字传 1，没有不传
                    userId: this.$store.state.user.id,
                };
                if (this.sort > -1) {
                    params.sort = this.sort;
                }
                if (this.currentStatus > -1) {
                    params.currentStatus = this.currentStatus;
                }
                ManageApi
                    .getSubUserList(params)
                    .then((res) => {
                        this.allUserList = res.body.data.userList;
                        this.totalPage = Math.ceil(this.allUserList.length / 10);
                        if (this.nowPage <= this.totalPage) {
                            this.handlePage(this.nowPage);
                        } else {
                            this.handlePage(1);
                            this.userList = this.allUserList.slice(0, 10);
                        }
                        //查询全部时此属性传递''
                        this.searchType = '';
                        this.fetching = false;
                    })
                    .catch(() => {
                        this.fetching = false;
                    });
            },
            //分页
            handlePage(e) {
                this.nowPage = e;
                this.$router.replace({
                    name: this.$route.name,
                    query: Object.assign({}, this.$route.query, {
                        nowPage: e
                    })
                });
                if (e === 1) {
                    this.userList = this.allUserList.slice(0, 10);
                } else if (e === Math.ceil(this.allUserList.length / 10)) {
                    this.userList = this.allUserList.slice(10 * (e - 1));
                } else {
                    this.userList = this.allUserList.slice(10 * (e - 1), 10 * e);
                }
            },
            //禁用
            forbidden(item) {
                const tips = Array.isArray(item) ?
                    this.$t('EnterPrise.forbidFor') + this.checkedItems.length + this.$t('EnterPrise.forbidUserTips') :
                    this.$t('EnterPrise.forbiddenConfirm');
                const idString = Array.isArray(item) ? this.checkedItems.join(',') : item.id;
                this.$confirm(this.$t('common.defaultConfirmTitle'), tips)
                    .then(sure => {
                        if (sure) {
                            this.forbidRequest(idString);
                        }
                    });
            },
            //启用
            handleActive(target) {
                let params = { curDate: format(new Date(), 'YYYY-MM-DD') };
                if (target) {
                    this.activatingItem = Object.assign(
                        params,
                        target,
                        this.initValidTime(target.validTime, target.parentValidTIme)
                    );
                } else {
                    this.activatingItem = Object.assign(
                        params,
                        { ids: this.checkedItems.join(',') },
                        this.initValidTime()) ;
                }
                this.activeShow = true;
            },
            // 取消激活
            cancelActive() {
                this.activeShow = false;
                this.activatingItem = null;
            },
            //关闭删除
            closeDelete() {
                this.isDelete = false;
                this.userId = '';
            },
            // 确认删除
            deleteConfirm() {
                this.$loading();
                ManageApi
                    .deleteSubuser({id: this.userId, Ids: ''})
                    .then(() => {
                        this.isDelete = false;
                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                        this.userId = '';
                        this.getUserList();
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            /**
             * 调用【启用】接口
             */
            activeRequest({ id, ids, validTime }) {
                let idString = id || ids;
                ManageApi
                    .userActive(idString, validTime)
                    .then(() => {
                        this.$toast(this.$t('EnterPrise.activeSuccess'), 'success');
                        this.checkedItems = [];
                        this.activatingItem = null;
                        this.activeShow = false;
                        this.getUserList();
                    })
                    .catch(() => {
                        this.checkedItems = [];
                        this.activatingItem = null;
                        this.activeShow = false;
                    });
            },
            /**
             * 调用【禁用】接口
             * @param {string} ids 目标id/ids 多个用逗号分割
             */
            forbidRequest(ids) {
                ManageApi
                    .userForbidden(ids)
                    .then(() => {
                        this.$toast(this.$t('EnterPrise.forbiddenSuccess'), 'success');
                        this.checkedItems = [];
                        this.handlePage(1);
                        this.getUserList();
                    })
                    .catch(() => {
                        this.checkedItems = [];
                    });
            },
            
            //删除
            deleteAction(item) {
                if (item) {
                    this.isDelete = true;
                    this.userId = item.id;
                }
            },
            // 新增用户
            addNewUser() {
                this.id = '';
                //选择User
                if (Number(this.activeParentId) === 0) {
                    this.$router.push({
                        name: 'addMemberForm',
                        params: {id: 0},
                        query: {departmentId: 0}
                    });
                } else {
                    this.$router.push({
                        name: 'addMemberForm',
                        params: {id: 0},
                        query: {departmentId: this.activeOrgId}
                    });
                }

            },
            // 修改按钮
            editUser(item) {
                let query = cloneDeep(this.$route.query);
                query.nowPage = this.nowPage;
                this.$router.replace({
                    name: this.$route.name,
                    query: query
                });
                this.$router.push({name: 'editMemberForm', params: {id: item.id}, query: {gateId: item.gateId}});
            },
            //点击一项
            selectTreeItem(item) {
                let selectItem = {cur: item, par: {}};
                this.selectOrganization(selectItem);
            },
            //删除一项
            handleTreeDelete(item) {
                let selectItem = {cur: item, par: {}};
                this.handleDelete(selectItem);
            },
            //编辑
            handleTreeEdit(item) {
                let selectItem = {cur: item, par: {}};
                this.handleEdit(selectItem);
            },
            /**
             * 时间格式处理 YYYY-MM-DD hh:mm:ss 处理为YYYY-MM-DD
             */
            dateHandler(str) {
                if (!str) return '';
                return format(Date.parse(str), 'YYYY-MM-DD');
            },
            /**
             * 计算时间差，判断有效期小等于30天
             */
            dateComparer(target) {    
                return (Date.parse(target) - new Date()) / (1000 * 3600 * 24) <= 30;
            },
            // 全选当前页数据
            choosePageData() {
                this.checkedItems = Array.from(new Set([...this.checkedItems, ...this.userList.map(item => item.id)]));
            },
            // 清空选中数据
            clearChoose() {
                this.checkedItems = [];
            },
            // 根据有效期排序
            sortByValidTime() {
                this.sort = this.sort === 1 ? 0 : 1;
                this.checkedItems = [];
                this.getUserList();
            },
            handleFilterBlur() {
                this.statusShow = false;
            },
            /**
             * 初始化有效期默认值和可选范围
             * @param {string} vTime 有效期默认值，可为空或undefined
             * @param {string} parentVTime 有效期选择范围至，可为空或undefined
             * @return {object} {validTime, parentValidTime}
             */
            initValidTime(vTime, parentVTime) {
                // 获取 有效期可选范围截止时间（取参或当前账号有效期）
                const validTimeEnd = parentVTime ? parentVTime : this.$store.state.user.validTime; // YYYY-MM-DD hh:mm:ss
                const parentValidTime = validTimeEnd ? format(Date.parse(validTimeEnd), 'YYYY-MM-DD') : ''; // 无限使用时间为空
                // 计算365天后的时间戳（此处需求要求：不考虑闰年，固定365天后，不是+1年整）
                const date = new Date();
                let nextYearStamp = date.setDate(date.getDate() + 365);
                let validTime = '';
                // 获取今日00:00:00时间戳
                const todayTail = Date.parse(new Date(new Date().toLocaleDateString()));
                if (vTime && Date.parse(vTime) >= todayTail) {
                    // 默认失效日期在今天及以后，才自动选中
                    validTime = format(Date.parse(vTime), 'YYYY-MM-DD');
                } else if (validTimeEnd && (Date.parse(validTimeEnd) - nextYearStamp) < 0) {
                    // 有效期至1年内，则选中可选范围截止时间
                    validTime = parentValidTime;
                } else {
                    // 有效期1年以上，默认选中当前+365天
                    validTime = format(nextYearStamp, 'YYYY-MM-DD');
                }
                return { validTime, parentValidTime };
            }
        },
        components: {
            OrgTree, SearchBaseTree, SearchOrgField
        },
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .org-member {
        .org-member-content {
            display: flex;
        }
        .left-list {
            @include box-sizing();
            position: relative;
            float: left;
            overflow: hidden;
            width: 300px;
            margin-right: 8px;
            height: calc(100vh - #{$header-height + $toolbar-height + 24px * 2 + $tab-nav-height });
            background-color: white;
            @include transition(width .5s);

            .siderbar-container {
                height: 100%;
                width: 300px;
            }
            
            &.collapsed {
                width: 0;
                margin: unset;
                overflow: hidden;
                @include transition(width .5s);
                .org-tree-div {
                    overflow: hidden;
                }
            }

            .create-btn {
                display: block;
                width: calc(100% - 32px);
                margin: 16px;
                padding: 0;
                line-height: 46px;
                border: 1px dashed $disabled;
                border-radius: 4px;
                background-color: white;               
                @include appearance(none);

                &:hover {
                    border-style: solid;
                }

                svg {
                    fill: currentColor;
                    height: 10px;
                    width: 10px;
                    vertical-align: top;
                    margin: 18px 2px 18px 0;
                }
                &:not([disabled]) {
                    cursor: pointer;
                    border-color: $theme;
                    color: $theme;
                }
            }

            .org-tree-div {
                height: calc(100% - 113px);
                overflow: auto;
                box-sizing: border-box;
                padding: 5px;
                width: 100%;
            }
        }

        .right-list {
            flex: 1;
            padding: 16px;
            float: left;
            @include box-sizing();
            background-color: white;
            height: calc(100vh - #{$header-height + $toolbar-height + 24px * 2 + $tab-nav-height});
            overflow-y: scroll;

            .list-title {
                padding-bottom: 16px;
                @include clearfix();

                .add-button {
                    margin-left: 24px;
                }
            }

            .action-icon:first-child {
                margin-left: 0;
            }

            .password-hidden {
                position: absolute;
                margin: 16px 0 0 8px;
                line-height: 8px;
            }

            .xl {
                width: 406px;
            }
            .nomargin {
                margin-right: 8px;
                padding: 0;
            }

            .simplify-table table tbody tr.warn {
                background-color: #fefbe8;
            }

            .diff-overflow {
                overflow: unset;
                #choose-all-action {
                    margin: unset;
                }
            }

            .hidden-menu {
                top: $input-field-height;
                left: 0;
                @include transform-origin(left top);

                .btn {
                    display: block;
                    width: 100%;
                    min-width: 120px;
                    color: $color-light-content;
                    text-align: left;
                    white-space: nowrap;
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

            .filter-box {
                display: inline-block;
                position: relative;

                svg {
                    fill: currentColor;
                    width: 14px;
                    height: 14px;
                    vertical-align: middle;
                    margin-left: 1px;
                }

                .radio {
                    padding: 0 10px;
                    display: block;
                    margin: 0;
                }

                .drop-list {
                    position: absolute;
                    z-index: 1;
                    left: 0;
                    top: 100%;
                    border-radius: 4px;
                    border: 1px solid $border-color;
                    background-color: $content-bg;
                    line-height: $input-field-height;
                    white-space: nowrap;
                }
            }

            .filter-th {
                overflow: visible;
            }
        }
        .form-label-inline {
            padding: 10px 0;
        }
    }

</style>
