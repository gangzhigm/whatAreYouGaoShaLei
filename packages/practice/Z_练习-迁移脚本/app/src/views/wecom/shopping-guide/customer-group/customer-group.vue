<template>
    <div v-if="isAuthMicroPage" class="return-visit-task content-view">
        <!-- 左边侧边栏公用组件 -->
        <left-sidebar class="custom-height"
            :SideTreeData="treeData"
            :fixedList="fixedGroups"
            ref="leftSideba"
            @select="selectGroup"
            :allTreeData="totalTreeArry"
            :moduleRange="'microModule'"
            @sort="getSortType"
            @modify="editGroup"
            @delete="delGroup"
            @traverseOpen="traverseOpen"
        />
        <!-- 表格 -->
        <div class="right-group-content">
            <div class="taesb">
                <!--批量操作-->
                <batch-operation class="batch" :btnList="operateList" @btnEvent="batchOperation"></batch-operation>
                <!-- 新建客户分组 -->
                <button
                    class="pull-right btn btn-md btn-theme btn-margin"
                    type="button"
                    @click="createPage"
                >
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{ 'shoppingGuide.customerGroupAdd' | t }}
                </button>
                <div class="pull-right search-box">
                    <input
                        type="text"
                        v-model.trim="keyword"
                        :placeholder="$t('shoppingGuide.keyword')"
                        @keydown.enter="search(true)"
                    />
                    <svg aria-hidden="true" @click="search(true)">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </div>
            </div>
            <!--素材列表展示-->
            <table class="simplify-table micro-list-table">
                <!--th表头 -->
                <tr>
                    <th width="6%">
                        <div class="choose-all-actions hidden-menu-trigger">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-menu"></use>
                            </svg>
                            <div class="hidden-menu">
                                <button class="btn" @click="chooseCurrentPage">
                                    {{ 'microPage.selectCurrentPage' | t }}
                                </button>
                                <button class="btn" @click="clearChoose">{{ 'microPage.clearSelect' | t }}</button>
                            </div>
                        </div>
                    </th>
                    <th v-for="(item, i) in tableTitle" :key="item.id" :width="filedsWidth[i] + '%'">   
                        <span>{{ item.name }}</span>
                        <template v-if="item.type === 'sort'">
                            <button
                                type="button"
                                class="table-sort-button"
                                :title="item.title"
                                @click="sortByAttr(item)"
                            >
                                <svg
                                    aria-hidden="true"
                                    class="asc"
                                    :class="{ active: sortField === item.tName && sortType === 'asc' }"
                                >
                                    <use xlink:href="#icon-caret-down"></use>
                                </svg>
                                <svg
                                    aria-hidden="true"
                                    class="desc"
                                    :class="{ active: sortField === item.tName && sortType === 'desc' }"
                                >
                                    <use xlink:href="#icon-caret-down"></use>
                                </svg>
                            </button>
                        </template>
                    </th>
                    <th width="12%">{{ 'shoppingGuide.options' | t }}</th>
                </tr>
                <!-- 加载动画 -->
                <tr v-if="loading" class="no-hover">
                    <td colspan="24" class="slim-cell">
                        <inline-loading />
                    </td>
                </tr>
                <tr v-for="(l, i) in microList" :key="i" v-else>
                    <!-- 复选框 -->
                    <td @click.stop width="6%">
                        <checkbox
                            v-model="checkIds"
                            :source="l.id"
                        ></checkbox>
                    </td>
                    <template v-for="(colums, key, i) in l">
                        <td v-if="!['id','groupId','noWechatIds'].includes(key)" :width="filedsWidth[i] + '%'">
                            <!-- 未添加企业微信客户 -->
                            <span type="button" @click="notadded(l)" v-if="key === fileds[5]" class="reshu">{{ colums}}</span>
                            <!-- 创建时间和更新时间的逻辑处理 -->
                            <span v-else-if="['createDate', 'updateDate'].includes(key)">{{
                                colums.substring(0, 16)
                            }}</span>
                            <span v-else>{{ colums }}</span>
                        </td> 
                    </template>

                    <td width="12%">
                        <div class="micro-actions">
                            <!-- 查看 -->
                            <button
                                type="button"
                                class="micro-action icon action-icon icon-eye"
                                v-title:top="$t('microPage.view')"
                                @click="viewEvent(l.id)"
                            ></button>
                            <!-- 编辑 -->
                            <button
                                type="button"
                                class="micro-action icon action-icon icon-round-pencil"
                                v-title:top="$t('microPage.edit')"
                                @click="jumpToEdit(l)"
                            ></button>
                            <hidden-menu-trigger
                                :btnList="triggerRender(l)"
                                @btnEvent="menuTriggerEvent($event, l.id)"
                            >
                            </hidden-menu-trigger>
                        </div>
                    </td>
                </tr>
            </table>
            <!-- 无匹配结果 -->
            <list-empty v-if="microList.length === 0 && !loading && !keyword" />
            <list-search-empty v-if="microList.length === 0 && !loading && keyword" />
            <!-- 分页 -->
            <div class="pager-wrapper page-com">
                <div class="amount">
                    {{ 'pagination.totalCount' | t }} <span class="theme-text">{{ totalRow }}</span>
                    {{ 'pagination.totalUnit' | t }}
                </div>
                <pager :total="totalPage" :now="pageNum" @page="handlePage"></pager>
            </div>
            <!--新建客户分组-->
            <modal :title="$t('shoppingGuide.createCustomer')" v-if="createPageShow" @close="closeCreatePage">
                <!-- 选择分组 -->
                <div class="form-field">
                    <label class="label">{{ 'shoppingGuide.Group' | t }}</label>
                    <radio source="use" v-model="createForm.groupSource" @input="sourceChange">
                        {{ 'shoppingGuide.selectGroup' | t }}</radio
                    >
                    <radio source="create" v-model="createForm.groupSource" @input="sourceChange">
                        {{ 'shoppingGuide.createGroup' | t }}
                    </radio>
                </div>
                <div class="form-field">
                    <div class="form-field" v-if="createForm.groupSource === 'create'">
                        <label class="label"></label>
                        <input
                            type="text"
                            class="input lg"
                            :placeholder="$t('common.groupName')"
                            v-model.trim="createForm.groupName"
                            v-title:top.line.warn="groupErrText"
                            :class="{ error: groupErrText }"
                            @focusin="groupErrText = ''"
                            maxlength="255"
                        />
                    </div>
                    <div class="form-field">
                        <label class="label placeholder" for="use">
                            {{
                                createForm.groupSource === 'create'
                                    ? $t('common.parentGroup')
                                    : $t('microPage.selectGroup')
                            }}</label
                        >
                        <div class="choose-parent choose-group" id="use" @click.stop="readyCheckGroup">
                            <label class="select-text">
                                {{ createForm.parentName}}
                                <span class="select-icon icon icon-arrow-down"></span>
                            </label>
                            <div class="search-tree-wrapper" v-if="groupSelectShow" @click.stop>
                                <search-tree
                                    :searchTreeData="groupOptions"
                                    :treeActiveId="createForm.groupId"
                                    @getTreeAct="getTreeAct"
                                    :action="false"
                                    :levelStage="createForm.groupSource === 'use'"
                                >
                                </search-tree>
                            </div>
                        </div>
                    </div>
                </div>
                <template v-slot:buttons>
                    <input
                        type="button"
                        class="btn btn-md btn-theme-border"
                        :value="$t('shoppingGuide.cancel')"
                        @click="cancel"
                    />
                    <input
                        type="button"
                        class="btn btn-md btn-theme"
                        :value="$t('common.confirm')"
                        @click="saveCreatePage"
                    />
                </template>
            </modal>

            <!-- 批量移动分组 -->
            <group-move
                :title="groupTitle"
                v-if="groupMoveModalOpen"
                :groupList="groupOptions"
                :placeHolder="$t('openPlat.pleaseCheck')"
                @close="groupMoveModalOpen = false"
                @moveDown="moveGroup"
                :labelName="$t('shoppingGuide.group')"
            />
            <!--未添加企微客户列表-->
            <modal :title="$t('shoppingGuide.Notlist')" v-if="customerList" @close="microCustomer" size="lg">
                <!-- 查询 -->
                <div class="listss">
                    <input type="text"  class="phoneNumber" v-model.trim="querye" :placeholder="$t('shoppingGuide.numberInquiry')" @keydown.enter="customersearch">
                </div>
                <!-- 未添加企微客户列表 -->
                <table class="simplify-table questionnaire-list-table">
                    <!--th表头 -->
                    <tr>
                        <th v-for="(item, i) in notAdded" :key="item.id" :width="Width[i] + '%'">
                            <span>{{ item.name }}</span>
                            <!-- 归属员工 -->
                            <FilterDrop
                                v-if="item.type === 'filter' && filterShow"
                                :value="filterValue"
                                :list="employeeslist"
                                @valueChange="valChange"
                            >
                            </FilterDrop>
                        </th>
                        <th width="12%">{{ 'shoppingGuide.options' | t }}</th>
                    </tr>
                    <!-- 加载动画 -->
                    <tr v-if="results" class="no-hover">
                        <td colspan="24" class="slim-cell">
                            <inline-loading />
                        </td>
                    </tr>
                    <tr v-for="(le, i) in wechat" :key="i" v-else>
                        <td width="17%">
                            <span>{{le.isWecom}}</span>
                        </td>
                        <td width="18%">
                            <span>{{le.customerName}}</span>
                        </td>
                        <td width="17%">
                            <span>{{le.newWecomStaffName}}</span>
                        </td>
                        <td width="17%">
                            <span>{{le.customerMobile}}</span>
                        </td>
                        <td width="18%">
                            <span>{{le.lastTaskTime}}</span>
                        </td>
                        <td width="12%">
                            <!-- 未添加企微客户的详情 -->
                            <button
                                type="button"
                                class="micro-action icon action-icon icon-eye icon-user1"
                                @click="details(le)"
                            ></button>
                        </td>
                    </tr>
                </table>
                <list-empty v-if="wechat.length === 0 && !results && keywordCopy !== ''" />
                <list-search-empty v-else-if="wechat.length === 0 && !results && keywordCopy === ''" />
                <!-- 分页 -->
                <pager :total="totalPagee" :now="paramse.pageNumber" @page="SelectPage" v-if="wechat.length !== 0">
                    {{'shoppingGuide.everyPage' | t}}
                    <selector :options="pageSizeOptions"
                            :value="paramse.pageSize"
                            @input="tapPagesHander"
                            class="tiny"/>
                    {{'shoppingGuide.maxPage' | t}}
                </pager>
            </modal>

            <!-- 查看客户分组信息 -->
            <modal :title="$t('shoppingGuide.information')" v-if="View" @close="iewCustomer" >
                <!-- 客户分组名称 -->
                <div class="form-fielde">
                    <label class="label placeholder" for="use">{{'shoppingGuide.cuerGroup' | t}}</label>
                    <input class="inpuet" type="text" v-model="customerName" readonly="readonly"/>
                </div>
                <!-- 选择客户分组标签 -->
                <div class="form-fielde flex">
                    <label class="label">
                        {{'shoppingGuide.selectLabel' | t}}
                    </label>
                    <div class="roll">
                        <span class="customer-tag blue" v-for="(item, index) in checkedContactItem" :key="item.id">
                            <span class="tag-name-wrapper">
                                <span class="tag-name" :title="item.name">{{item.name}}</span>
                            </span>
                        </span> 
                    </div>
                </div>
                <!-- 预计客户数量 -->
                <div class="form-fielde flex">
                    <label class="label">
                        {{'shoppingGuide.estimatedCustomers' | t}}
                    </label>
                    <div class="field-group">
                        <span type="button" class="customers" @click="stomers">{{estimated }}</span>
                        <span type="button" class="calculate" @click="recalculate">{{'shoppingGuide.calculates' | t}}</span>
                    </div>
                </div>
            </modal>

            <!--客户分组标签人数详情-->
            <!-- <modal :title="$t('shoppingGuide.tagNumber')" v-if="numberdetails" @close="close"
            >
                <div class="yond" v-for="(item, index) in people" :key="index">
                    <span class="Beyond">{{ item.name }}</span>
                    <span class="persons" @click="number">{{ item.labelPerson }}</span>
                </div>
                <template v-slot:buttons>
                    <input type="button" class="btn btn-md btn-theme-border" :value="$t('shoppingGuide.cancel')" @click="opcancel"/>
                    <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" @click="saveCreatePages"/>
                </template>
            </modal> -->
        </div>
    </div>
</template>

<script type="text/babel">
import { WecomApiV1 ,ContactApiV1} from '@/api';
import { translate as t } from '@/locales';
import GroupMove from '@/common/components/group-move.vue';
import Bus from '@/common/components/group-tree/bus.js'; // Bus是在树形组件中传参时使用
import {COMMON_NAME_REGEXP} from '../../../../common/utils/regs';
import cloneDeep from 'lodash/cloneDeep';

export default {
    components: {
        GroupMove
    },
    data () {
        return {
            numberdetails:false,//标签人数详情
            querye:'',//未添加客户的模糊查询
            estimated:'', //查看按钮预计客户数量
            customerName:'',//查看客户分组名称
            View:false, //查看按钮弹
            gropId:'2',
            paramse: {
                pageNumber: 1,
                pageSize: 10,
            },
            checkedContactItem:[],//客户分组标签
            checkedContId:[],//客户分组标签
            pageSizeOptions: [
                {id: 50, name: 50},
                {id: 30, name: 30},
                {id: 20, name: 20},
                {id: 10, name: 10}
            ],//未添加企微客户数页面的分页
            wechat: [],
            totalPagee: 0, // 总页数
            treeData: [], // 微页面分组[{},{},{}]
            fixedGroups: [//固定menu
                { id: 0, fieldName: 'allCount', name: this.$t('shoppingGuide.type.all') },
                { id: -1, fieldName: 'createCount', name: this.$t('shoppingGuide.type.iCreated') }
            ],
            totalTreeArry: [],  //递归结构需要把allTreeData push到数组中[{allTreeData}]
            sortGroupType: 1,//分组得排序 1：按创建时间降序 2：按创建时间升序 3：按更新时间降序 4：按更新时间升序 5：按名称降序 6：按名称升序
            sortField: '',//查询列表排序字段
            sortType: '',//查询列表排序顺序（asc:升序，desc:降序）
            keyword: '',
            //批量操作按钮
            operateList: [{
                name: 'shoppingGuide.moveTo',
                disabled: '',
                type: 'moveToGroup'
            }, {
                name: 'shoppingGuide.batchDelete',
                disabled: '',
                type: 'batchDel'
            }],
            //客户分组列表
            tableTitle: [
                { id: 1, name: t('shoppingGuide.customerGroupName'), type: 'sort', tName: 'name', title: t('microPage.arrangeByIntials') },
                { id: 2, name: t('shoppingGuide.customerGroups')},
                { id: 3, name: t('shoppingGuide.customerListe')},
                { id: 4, name: t('shoppingGuide.Updating')},
                { id: 5, name: t('shoppingGuide.updateTime'), type: 'sort', tName: 'updateDate', title: t('shoppingGuide.updateTme') },
                { id: 6, name: t('shoppingGuide.creatorAccount')},
                { id: 7, name: t('shoppingGuide.creationTime'), type: 'sort', tName: 'createDate', title: t('microPage.arrangeByCreationTime') },
            ],
            //未添加企业微客户列表
            notAdded: [
                { id: 1, name: t('shoppingGuide.contacts')},
                { id: 2, name: t('shoppingGuide.contactName')},
                { id: 3, name: t('shoppingGuide.employees'),type: 'filter'},
                { id: 4, name: t('shoppingGuide.number')},
                { id: 5, name: t('shoppingGuide.marketingTime') ,type: 'sort', tName: 'createDatee'},
            ],
            loading: true,
            results: true,
            keywordCopy:'',
            fileds: [
                'id',
                'name',
                'groupId',
                'customerPerson',
                'noWechatIds',
                'noWechatPerson',
                'updateName',
                'updateDate',
                'createName',
                'createDate'
            ],//所有字段
            microList: [],// 表格数据
            checkIds: [], //选中数据的id
            filedsWidth: [11, 8, 10, 12, 12, 12, 12],//客户分组宽度
            Width: [17,17,17,17,20],//未添加企业为客户宽度
            //更多操作的按钮
            triggerList: [{
                name: 'shoppingGuide.move',
                disabled: '',
                type: 'move'
            }, {
                name: 'shoppingGuide.delete',
                disabled: '',
                type: 'delete'
            }, {
                name: 'shoppingGuide.copy',
                disabled: '',
                type: 'copy'
            }],
            // 归属员工状态 
            statusList: [],
            filterValue: '',//状态
            filterShow: true,
            totalRow: 0,//总数
            totalPage: 1,// 分页数
            size: 20,//每页展示数量
            pageNum: 1,//当前页数
            sortBy:'updateDate',//排序字段
            createPageShow: false,//创建页面是否显示
            customerList: false,//未添加企微客户列表是否显示
            //创建客户
            createForm: {
                parentId: '',
                groupName: '',
                groupSource: 'use',
                pageName: '',
                parentName: ''
            },
            groupSelectShow: false, // 是否已选分组
            groupOptions: [],//分组信息
            groupErrText: '',//分组名称校验信息
            isSubmit: false,
            groupMoveModalOpen: false,//移动分组弹窗
            pageId: '',//客户分组id
            isBatchMove: false, //批量移动分组
            groupId: 0,//分组id
            groupTitle: '',
            isAuthMicroPage: true,  //是否有权限
            viewInfo:'',
            people:[],//查看详情标签人数
            employeeslist:[], //归属员工数组
            screening:[] ,
            groupList: [],  // 分组列表
            allLabelList: [], // 选择联系人标签列表
            getInfo: {
                name: '', // 客户分组名称
                contactLabelIds: [], // 联系人标签id列表
            }, 
        };
    },
    mounted () {
        this.groupId = this.$route.query.groupId;
        this.init();
        /**
         * 递归树形菜单
         * singleMenu
         * 点击某个分组
         * groupData所点击的分组详情数据
         */
        Bus.$on('singleMenu', channelGroupData => {
            if (channelGroupData.moduleRange === 'microModule') {
                if (channelGroupData.action) {
                    this.pageNum = 1;
                    this.selectGroup(channelGroupData.groupData);
                }
            }
        });
        //点击其他地方下拉菜单收起
        window.addEventListener('click', this.eventListener);
    },
    destroyed () {
        window.removeEventListener('click', this.eventListener);
    },
    methods: {
        // 点击标签人数跳转
        number(){
            this.$router.push({
                name: 'tagManage',
            });
        },
        // 归属员工
        employees(){
            this.employeeslist = [];
            if (this.filterValue === '无') {
                let ok = {
                    name:'无',
                    source:'无',
                };
                this.employeeslist.unshift(ok);
            } else if (this.filterValue === '全部') {
                let whole = {
                    name:'全部',
                    source:'全部',
                };
                this.employeeslist.unshift(whole);
            }
            this.statusList.forEach(itme =>{
                let params = {
                    name:itme,
                    source:itme,
                };
                this.employeeslist.push(params);
            });
            this.filterShow = false;
            this.$nextTick(() => {
                this.filterShow = true;
            });
        },
        //查看标签人数
        stomers(){
            // let calculation = this.checkedContId.map(item=>{
            //     return item * 1;
            // });
            // WecomApiV1.numberTags({ labelIds: calculation})
            //     .then((res) => {
            //         this.numberdetails = true;
            //         this.people = res.body.data.labelJson;
            //     });
        },
        close(){
            this.numberdetails = false;
        },
        // 查看的重新计算
        recalculate(){
            this.checkedContId = this.getInfo.contactLabelIds;
            let calculation = this.checkedContId.map(item=>{
                return item * 1;
            });
            WecomApiV1.recalculates({labelIds : calculation})
                .then(res =>{
                    this.estimated = res.body.data.customerPerson;
                    this.$toast(this.$t('common.successOperate'), 'success');
                });
        },
        // 未添加企微客户详情
        details(le){
            const url = this.$router.resolve({
                name: 'customerDetail',
                query: {id: le.customerId}
            });
            window.open(url.href, '_blank');
        },
        notadded(l){
            this.groupingId = l.id;
            this.querye = '',
            this.getTableData();
            this.customerList = true;
        },
        tapPagesHander($event) {
            this.paramse.pageSize = $event;
            this.paramse.pageNumber = 1;
            this.getTableData();
        },
        // 获取未添加企微客户列表
        getTableData() {
            this.results = true;
            let enterprise = {
                id : this.groupingId ,
                pageNum: this.paramse.pageNumber,
                pageSize: this.paramse.pageSize,
                searchName:this.querye
            };
            WecomApiV1.enterpriseMicroUsers(enterprise)
                .then(res => {
                    this.results = false;
                    this.$loaded();
                    this.wechat = res.body.data.contactList;
                    this.totalPagee = res.body.data.totalPage;
                    this.statusList = res.body.data.staffNameSet;
                    this.screening = res.body.data.contactList;
                    if (this.statusList.length === 0 ){
                        this.filterValue = '无';
                    } else {
                        this.filterValue = '全部';
                    }
                    this.employees();
                });
        },
        init () {
            this.getGroupTree();
            this.search();
        },
        search (isInput = false) {
            if (isInput) this.pageNum = 1;
            this.loading = true;
            let params = {
                name: this.keyword,
                groupId: this.groupId,
                page:this.pageNum,
                pageSize:this.size,
                sort:this.sortType,
                sortBy:this.sortField,
            };
            WecomApiV1.customerGroupGetCustomerGroupList(params)
                .then(({ body: { data } }) => {
                    this.loading = false;
                    let list = data.customerGroupList || [];
                    this.microList = this.filedsSort(list, this.fileds);
                    this.totalRow = data.totalElement;
                    this.totalPage = data.totalPage;
                    this.clearChoose();
                })
                .catch(({ body }) => {
                    new Error(body);
                    this.loading = false;
                });
        },
        // 未添加企微客户列表模糊查询
        customersearch(){
            this.results = true;
            this.paramse.pageNumber = 1;
            let enterprise = {
                id: this.groupingId,
                pageNum: this.paramse.pageNumber,
                pageSize: this.paramse.pageSize,
                searchName:this.querye
            };
            this.keywordCopy = cloneDeep(this.querye);
            WecomApiV1.enterpriseMicroUsers(enterprise)
                .then(res => {
                    this.results = false;
                    this.$loaded();
                    this.wechat = res.body.data.contactList;
                    this.totalPagee = res.body.data.totalPage;
                    this.statusList = res.body.data.staffNameSet;
                    this.screening = res.body.data.contactList;
                    if (this.statusList.length === 0 ){
                        this.filterValue = '无';
                    } else {
                        this.filterValue = '全部';
                    }
                    this.employees();
                });
        },
        /**
         * 获取树结构
         */
        getGroupTree () {
            WecomApiV1.customerGroupGroupGetGroupList({ sortType: this.sortGroupType })
                .then(({ body: { data } }) => {
                    let totalTreeArry = [];
                    this.$traverseTree([Object.assign({}, data.rootGroup)], totalTreeArry);
                    this.totalTreeArry = totalTreeArry;
                    const treeData = [];
                    this.$traverseTree([...data.rootGroup.childs], treeData);
                    this.treeData = treeData;
                });
        },
        // 获取子组件传过来的sortGroupType
        getSortType (sortGroupType) {
            this.sortGroupType = sortGroupType;
            this.getGroupTree();
        },
        /**
        * 选择分组
        * @param group 选择的分组
        */
        selectGroup (group) {
            this.groupId = group.id;
            this.$router.replace({ name: 'customerGroup', query: { groupId: group.id } });
            this.search();
        },
        /**优化后---确定新建/编辑
         * @param creatdDetail create：新建，edit：编辑
         */
        editGroup (creatdDetail) {
            if (this.isSubmit) return;
            this.isSubmit = true;
            if (creatdDetail.optionType === 'create') {
                WecomApiV1.customerGroupGroupSave({name: creatdDetail.groupName, parentId: creatdDetail.parentId})
                    .then((res) => {
                        this.isSubmit = false;
                        this.$toast(res.body.message, 'success');
                        this.getGroupTree();
                        this.$refs.leftSideba.closeNewEditModal();
                    })
                    .catch(() => { 
                        this.isSubmit = false;
                    });
            }
            if (creatdDetail.optionType === 'edit') {
                WecomApiV1.customerGroupGroupUpdate({
                    id: creatdDetail.groupId, 
                    name: creatdDetail.groupName, 
                    parentId: creatdDetail.parentId
                })
                    .then((res) => {
                        this.isSubmit = false;
                        this.$toast(this.$t('common.updateSuccess'), 'success');
                        this.getGroupTree();
                        this.$refs.leftSideba.closeNewEditModal();
                    })
                    .catch(() => { 
                        this.isSubmit = false;
                    });
            }
        },
        /**确定删除分组
         * @param groupId
         */
        delGroup (groupId) {
            if (this.isSubmit) return;
            this.isSubmit = true;
            WecomApiV1.customerGroupGroupDelete({id:groupId})
                .then((res) => {
                    this.isSubmit = false;
                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                    this.getGroupTree();
                }, () => {
                    this.isSubmit = false;
                });
            this.selectGroup('');
        },
        // 遍历树数据，将open更改为false
        traverseOpen (data) {
            this.$openToFalse(data);
        },
        /**
         * 打开新建页面弹窗
         */
        createPage () {
            this.groupSelectShow = false;
            this.createForm = {
                parentId: '',
                name: '',
                groupSource: 'use',
                pageName: '',
                parentName: '',
                groupId:''
            };
            this.createPageShow = true;
            this.getGroupOptions();
        },
        /**
         * 批量操作点击事件
         */
        batchOperation (type) {
            if (this.checkIds.length === 0) {
                this.$toast(this.$t('microPage.noActionableData'), 'warn');
                return;
            }
            switch (type) {
                case this.operateList[0].type:
                    this.batchMove();
                    break;
                case this.operateList[1].type: {
                    this.$confirm(this.$t('shoppingGuide.deletecustomer'), this.$t('shoppingGuide.DeleteContent'))
                        .then(sure => {
                            if (sure) {
                                this.batchDel();
                            }
                        });
                    break;
                }

                default:
                    break;
            }
        },
        //批量移动
        batchMove () {
            this.groupTitle = this.$t('microPage.moveTo');
            this.isBatchMove = true;

            this.getGroupOptions(() => {
                this.groupMoveModalOpen = true;
            });
        },
        //批量删除
        batchDel () {
            if (this.loading) return;
            this.loading = true;

            const params = {
                id: this.checkIds
            };
            WecomApiV1.customerGroupDelete(params)
                .then(() => {
                    this.loading = false;
                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                    this.search();
                    this.checkIds = [];
                })
                .catch(({ body }) => {
                    this.loading = false;
                    new Error(body);
                });
        },
        /** 
        * 列表排序
        * @param sortField
        * @constructor
        */
        sortByAttr (item) {
            if (this.sortField === item.tName) {
                this.sortType = this.sortType === 'asc' ? 'desc' : 'asc';
                this.search();
            } else {
                this.sortField = item.tName;
                this.sortType = 'asc';
                this.search();
            }
        },
        //对表格中字段进行排序
        filedsSort (list, fileds) {
            let sortList = [];
            list.forEach(e => {
                let obj = {};
                fileds.forEach(f => {
                    obj[f] = e[f];
                });
                sortList.push(obj);
            });
            return sortList;
        },
        // 全选当前页
        chooseCurrentPage () {
            this.checkIds = [];
            this.checkIds = this.microList.map(e => e.id);
        },
        // 清空当前所选
        clearChoose () {
            this.checkIds = [];
        },
        //选择状态时出发的事件
        valChange (e) {
            let screen = [];
            this.filterValue = e;
            if (this.filterValue !== '全部') {
                this.screening.forEach(item =>{
                    if (item.newWecomStaffName === this.filterValue) {
                        screen.push(item);
                    }
                });
                this.wechat = screen;
            } else {
                this.wechat = this.screening;
            }
        },
        //页码变动
        handlePage (e) {
            this.pageNum = e;
            this.search();
        },
        // 查看
        viewEvent (id) {
            this.checkedContactItem = [];
            this.View = true;
            WecomApiV1.customerGroupSelect({ id:id})
                .then((res) => {
                    this.viewInfo = res.body.data.customerGroup;
                    this.customerName = this.viewInfo.name;
                    this.estimated = this.viewInfo.customerPerson;
                    this.getInfo.contactLabelIds = res.body.data.customerGroup.labelIds.split(',');
                    this.getVipLabel();
                });
        },
        // 获取联系人标签
        getVipLabel() {
            this.$loading();
            ContactApiV1
                .getGroups({
                    sortType: this.sortType,
                    authorityType:0
                })
                .then((res) => {
                    this.groupList = res.body.data.rootGroup.childs;
                    // 将选中的会员标签回显
                    if (this.getInfo.contactLabelIds.length > 0) {                           
                        this.allLabelList = [];
                        this.groupList.filter(item => {
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
                            this.getInfo.contactLabelIds.map(contact => {
                                if (item.id === parseInt(contact)) {
                                    this.checkedContactItem = this.checkedContactItem.concat(item);
                                }
                            });
                        });
                    }
                    this.$loaded();
                });
        },
        //隐藏按钮的点击事件
        menuTriggerEvent (type, id) {
            switch (type) {
                //移动
                case this.triggerList[0].type:
                    this.isBatchMove = false;
                    this.pageId = id;
                    this.groupMoveModalOpen = true;
                    this.groupTitle = this.$t('microPage.moveToGroup');
                    this.getGroupOptions();
                    break;
                //删除
                case this.triggerList[1].type:
                    this.$confirm(this.$t('shoppingGuide.deletecustomer'), this.$t('shoppingGuide.DeleteContent'))
                        .then(sure => {
                            if (sure) {
                                this.delEvent(id);
                            }
                        });
                    break;
                //复制
                case this.triggerList[2].type:
                    this.copyEvent(id);
                    break;
                default:
                    break;
            }
        },
        //复制
        copyEvent (id) {
            if (this.loading) return;
            this.loading = true;
            WecomApiV1.customerGroupCopy({ id })
                .then(() => {
                    this.loading = false;
                    this.$toast(this.$t('microPage.copied'), 'success');
                    this.search();
                })
                .catch((res)=>{
                    if (res.body.message === '客户组名称超长或已存在') {
                        this.search();
                    }
                });
        },
        //删除
        delEvent (id) {
            if (this.loading) return;
            this.loading = true;
            WecomApiV1.customerGroupDelete({ id })
                .then(() => {
                    this.loading = false;
                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                    //如果是当前页面最后一条数据被删除，就跳转到上一页
                    if (this.microList.length === 1 && this.pageNum !== 1) {
                        this.pageNum -= 1;
                    }
                    this.search();
                });
        },
        //操作权限显隐的逻辑处理
        triggerRender () {
            let list = [];
            this.triggerList.forEach((e) => {
                list.push(this.btnShowRender(e));
            });
            return list;
        },
        btnShowRender (e) {
            let obj = Object.assign({}, e);
            obj.isShow = true;
            return obj;
        },
        iewCustomer () {
            this.checkedContactItem = [];
            this.View = false;
        },
        closeCreatePage () {
            this.groupErrText = '';
            this.createPageShow = false;
        },
        // 企业微客户列表叉号
        microCustomer (){
            this.customerList = false;
            this.paramse.pageNumber = 1;
            this.paramse.pageSize = 10;
        },
        // 获取分页
        SelectPage(page) {
            this.paramse.pageNumber = page;
            this.getTableData();
        },
        // 取消按钮
        cancel(){
            this.groupErrText = '';
            this.createPageShow = false;
        },  
        //创建页面提交的逻辑
        saveCreatePage () {
            if (this.createForm.groupSource === 'create') {
                if (!this.createForm.groupName) {
                    this.groupErrText = this.$t('microPage.groupNameNotNull');
                } else if (this.createForm.groupName && !COMMON_NAME_REGEXP.test(this.createForm.groupName)) {
                    this.$toast(this.$t('common.filterName'), 'warn');
                } else {
                    let parent = {
                        name: this.createForm.groupName,
                        parentId : this.createForm.groupId
                    };
                    WecomApiV1.customerGroupGroupSave(parent)
                        .then(res =>{
                            this.$router.push({name:'customerGroupAdd', query: { id: '',groupId:res.body.data.groupId }});
                        });
                }
            } else if (this.createForm.groupSource === 'use') {
                this.$router.push({name:'customerGroupAdd', query: { id: '',groupId:this.createForm.groupId}});
            }
            
        },
        //跳转 为页面的编辑或新建页面
        jumpToEdit (l) {
            this.$router.push({
                name: 'customerGroupEdit',
                query: {id: l.id ,groupId:l.groupId}
            });
        },

        // 选择分组
        readyCheckGroup () {
            this.groupSelectShow = !this.groupSelectShow;
        },
        // search-tree中选择list的某一项时  接收选中项
        getTreeAct (group) {
            this.createForm.groupId = group.id;
            this.createForm.parentName = group.name;
            this.groupSelectShow = false;
        },
        //获取分组列表
        getGroupOptions (callback) {
            const params = {
                sortType: 1
            };
            WecomApiV1.customerGroupGroupGetGroupList(params)
                .then(({ body: { data } }) => {
                    this.groupOptions = [];
                    this.groupOptions.push(Object.assign({}, data.rootGroup));
                    let list = [];
                    this.$traverseTree(this.groupOptions, list);
                    this.groupOptions = list;
                    const groupId = this.groupId || ~~this.$route.query.groupId;
                    const fixedGroupsList = [this.fixedGroups[0].id, this.fixedGroups[1].id];

                    this.createForm.groupId = fixedGroupsList.includes(groupId) ?
                        this.groupOptions[0].childs[0].id : groupId;

                    this.createForm.parentName = fixedGroupsList.includes(groupId) ?
                        this.groupOptions[0].childs[0].name
                        : this.groupNameRender(groupId);

                    this.groupOptions[0].open = true;
                    this.groupOptions[0].noSelect = false;
                    callback && callback();
                });
        },
        /**
         * 遍历树结构
         */
        readNodes (nodes = [], arr = []) {
            for (let item of nodes) {
                arr.push(item);
                if (item.childs && item.childs.length) this.readNodes(item.childs, arr);
            }
            return arr;
        },
        /**
         * 根据id 获取相应的分组名称
         * groupId: 分组id
         */
        groupNameRender (groupId) {
            const nodes = this.readNodes(this.groupOptions[0].childs);
            return nodes.filter(e => {
                return e.id === groupId;
            })[0].name;
        },
        //新建客户分组类型改变时
        sourceChange (val) {
            if (val === 'use') {
                this.groupOptions[0].noSelect = false;
                const groupId = ~~this.$route.query.groupId;
                const fixedGroupsList = [this.fixedGroups[0].id, this.fixedGroups[1].id];

                this.createForm.groupId = fixedGroupsList.includes(groupId) ?
                    this.groupOptions[0].childs[0].id : groupId;

                this.createForm.parentName = fixedGroupsList.includes(groupId) ?
                    this.groupOptions[0].childs[0].name
                    : this.groupNameRender(groupId);
                this.gropId = this.createForm.groupId;
            } else {
                this.groupOptions[0].noSelect = true;
                this.createForm.groupId = this.groupOptions[0].id;
                this.createForm.parentName = this.groupOptions[0].name;
                this.gropId = this.createForm.groupId;
            }
        },
        //移动分组 
        moveGroup (groupId) {
            if (this.loading) return;
            this.loading = true;
            this.closeGroupMoveModal();

            //isBatchMove? 批量：单个
            let batch = {
                ids: this.isBatchMove ? this.checkIds : [this.pageId],
                moveGroupId: groupId
            };
            WecomApiV1.customerGroupMove(batch)
                .then(() => {
                    this.loading = false;
                    this.$toast(this.$t('common.successOperate'), 'success');
                    this.search();
                    this.checkIds = [];
                })
                .catch(({ body }) => {
                    this.loading = false;
                    new Error(body);
                });
        },
        //关闭移动分组页面
        closeGroupMoveModal () {
            this.groupMoveModalOpen = false;
        },
        // 弹窗的取消按钮
        opcancel(){
            this.close();
        },
        // 弹窗确认按钮
        saveCreatePages(){
            this.close();
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
    .return-visit-task{
        display: flex;
        padding-top: 10px;
        .custom-height {
            height: calc(100vh - #{$header-height + $toolbar-height + 24px + 82px});
        }
        .right-group-content {
            flex: 1;
            padding: 0 16px;
            float: left;
            background-color: white;
            box-sizing: border-box;
            height: calc(100vh - #{$header-height + $toolbar-height + 24px + 82px});
            .yond {
                width: 100%;
                height: 30px;
                margin: 0 0 10px 20px;
                .Beyond {
                    display: inline-block;
                    width: 300px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .persons {
                    display: inline-block;
                    margin-left: 25px;
                    cursor: pointer;
                    color: #0cc2a9;
                }
            }
            .taesb{
                height: 30px;
                width: 100%;
                padding: 15px 0 15px 0;
                background-color: #fff;
                margin: 5px 0 0 0;
                .search-box{
                    margin: 0 30px 0 10px;
                }
            }
            .batch{
                margin: 0px;
                float: left;
            }
            .form-fielde{
                line-height: 32px;
                .label{
                    width: 140px;
                    text-align: left;
                    font-size: 12px;
                    display: inline-block;
                    vertical-align: top;
                    margin-right: 12px;
                    color: #595959;
                }
            }
            .questionnaire-list-table {
                table-layout: fixed;
                width: 100%;
                margin: 0px 0 16px 0;
                text-align: left;
                border-collapse: collapse;
                border-spacing: 0;

                table {
                    tr {
                        th {
                            padding: 0 10px;
                        }
                    }
                }

                th {
                    box-sizing: border-box;
                    overflow: visible;
                    text-align: center;
                    &:not([width]) {
                        width: 100%;
                    }

                    &:last-child {
                        width: 140px;
                    }
                }

                td {
                    overflow: visible;
                }

                .btn {
                    padding: 0;
                    &[disabled] {
                        .action-icon {
                            cursor: not-allowed;
                        }
                    }
                }

                tr {
                    height: 40px;
                    border: 1px solid $border-color;

                    &:first-child {
                        background-color:  #f2f2f2
                    }

                    td {
                        text-align: center;
                    }

                    &:not(:first-child):hover {
                        background-color: $title-bg;
                    }
                }

                .action-icon {
                    width: 20px;
                    height: 20px;
                }

            }
            .form-fielde.flex {
                display: flex;
                align-items: center;
                justify-items: center;
            }
            .form-fielde + .form-fielde {
                margin-top: 1em;
            }
            .customers{
                font-size: 14px;
                color: #0cc2a9;
            }
            .calculate{
                margin-left: 30px;
                font-size: 14px;
                cursor:pointer;
                color: #0cc2a9;
            }
            .inpuet{
                border: none;
                width: 250px;
            }
            .listss{
                height: 50px;
                text-align: right;
            }
            .phoneNumber{
                margin: 5px 10px 0 0;
                border: 1px solid  #e0e5ea;
                height: 30px;
                width: 200px;
            }
            .reshu{
                cursor:pointer;
                color: #0cc2a9;
            }
            .btn.btn-margin{
                margin-right: 16px;
            }
            .list-table{
                background-color: #fff;
                table-layout: fixed;
                width: 100%;
                text-align: left;
                border-collapse: collapse;
                border-spacing: 0;
            }
            .micro-list-table {
                background-color: #fff;
                table-layout: fixed;
                width: 100%;
                text-align: left;
                border-collapse: collapse;
                border-spacing: 0;
                min-width: 800px;

                th:not([width]) {
                    width: 100%;
                }

                .choose-all-actions {
                    width: 14px;
                    height: 14px;
                    margin: 5px auto;
                    padding: 3px;
                    position: relative;
                    cursor: pointer;

                    svg {
                        display: block;
                        width: 14px;
                        height: 14px;
                        fill: currentColor;
                    }

                    &:hover {
                        color: $theme;
                    }

                    .hidden-menu {
                        top: 100%;
                        left: 0;
                        @include transform-origin(left top);

                        .btn {
                            display: block;
                            color: $color-light-content;
                            border-radius: 0;
                            min-width: 110px;
                            text-align: left;
                            font-size: 12px;
                            text-transform: lowercase;

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

                tr {
                    height: 40px;
                    border-bottom: 1px solid $border-color;
                    &:first-child {
                        background-color: $select-bg;
                    }

                    td:first-child {
                        text-align: center;
                    }
                    td {
                        & > span {
                            // padding: 0 10px;
                            width: calc(100% - 20px);
                            display: inline-block;
                        }
                    }

                    &:not(:first-child):hover {
                        background-color: $title-bg;
                    }

                    .micro-actions {
                        display: inline-block;
                        cursor: pointer;
                        user-select: none;
                        .micro-action {
                            border: none;
                            font-size: 16px;
                            background-color: transparent;
                            text-transform: lowercase;

                            &:disabled {
                                color: $disabled;
                                cursor: not-allowed;
                            }
                        }
                        > .btn {
                            padding: 0;
                            margin: 0;
                            .action-icon {
                                width: 16px;
                                height: 16px;
                            }
                        }
                    }
                }
            }
            .page-com {
                justify-content: flex-end;
                background-color: #fff;
                @include pagerWrapper();
            }

            .choose-group {
                @include chooseGroup();
            }
            .roll{
                width: 80%;
                max-height:103px;
                word-wrap: break-word;
                overflow-x: hidden;
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
        }
    }    
</style>
