<template>
    <div class="micro-page-list" v-if="isAuthLoaded">
        <div class="content-view">
            <crumbs />
        </div>
        <div v-if="isAuthMicroPage" class="content-view micro-content">
            <!-- 左边侧边栏公用组件 -->
            <left-sidebar
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
                <!--分组导航-->
                <div class="tab-links">
                    <span class="tab-link active">{{ 'microPage.type.all' | t }}</span>
                    <button
                        class="pull-right btn btn-md btn-round btn-theme"
                        type="button"
                        @click="createPage"
                    >
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        {{ 'microPage.createPage' | t }}
                    </button>
                    <div class="pull-right search-box">
                        <input
                            type="text"
                            v-model="keyword"
                            maxlength="100"
                            :placeholder="$t('microPage.keyword')"
                            @keydown.enter="search(true)"
                        />
                        <svg aria-hidden="true" @click="search(true)">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                </div>

                <!--批量操作-->
                <batch-operation :btnList="operateList" @btnEvent="batchOperation"></batch-operation>

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
                                >
                                    <svg
                                        aria-hidden="true"
                                        class="asc"
                                        @click="listSort(item.tName, 'asc')"
                                        :class="{ active: sortField === item.tName && sortType === 'asc' }"
                                    >
                                        <use xlink:href="#icon-caret-down"></use>
                                    </svg>
                                    <svg
                                        aria-hidden="true"
                                        class="desc"
                                        @click="listSort(item.tName, 'desc')"
                                        :class="{ active: sortField === item.tName && sortType === 'desc' }"
                                    >
                                        <use xlink:href="#icon-caret-down"></use>
                                    </svg>
                                </button>
                            </template>
                            <!-- 筛选 -->
                            <FilterDrop
                                v-if="item.type === 'filter'"
                                :value="filterValue"
                                :list="statusList"
                                @valueChange="valChange"
                                attribute="id"
                            >
                            </FilterDrop>
                        </th>
                        <th width="12%">{{ 'microPage.options' | t }}</th>
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
                            <td v-if="!['id', 'groupId', 'onlineDate'].includes(key)" :width="filedsWidth[i] + '%'">
                                <!-- 状态 -->
                                <span v-if="key === fileds[2]">{{ statusRender(colums) }}</span>
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
                                    @click="editEvent(l)"
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

                <!--新建微页面-->
                <modal :title="$t('microPage.createPage')" v-if="createPageShow" @close="closeCreatePage">
                    <div class="form-field">
                        <label class="label">{{ 'microPage.mPageName' | t }}</label>
                        <input
                            type="text"
                            :placeholder="$t('microPage.enterMircopageMax')"
                            class="input lg"
                            v-model.trim="createForm.pageName"
                            v-title:top.line.warn="pageErrText"
                            :class="{ error: pageErrText }"
                            @focusin="pageErrText = ''"
                            maxlength="200"
                        />
                    </div>
                    <!-- 选择分组 -->
                    <div class="form-field">
                        <label class="label">{{ 'microPage.pageGroup' | t }}</label>
                        <radio source="use" v-model="createForm.groupSource" @input="sourceChange">
                            {{ 'microPage.selectGroup' | t }}</radio
                        >
                        <radio source="create" v-model="createForm.groupSource" @input="sourceChange">
                            {{ 'microPage.createGroup' | t }}
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
                                    {{ createForm.parentName || $t('common.selectHolder') }}
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
                />

                <!-- 查看 -->
                <modal size="lg" class="micro-view" :title="$t('microPage.view')" v-if="viewShow" @close="viewClose">
                    <div v-if="viewLoading" class="view-flex-loading">
                        <inline-loading />
                    </div>
                    <div v-else class="view-flex">
                        <div class="photo-preview">
                            <div class="photo-preview-img">
                                <iframe class="iframe-preview" :src="viewInfo.htmlLink"></iframe>
                            </div>
                        </div>
                        <!-- 草稿状态 -->
                        <div class="view-draft" v-if="viewInfo.status === 0">
                            <div class="code-preview">
                                <img :src="viewInfo.qrCodePath" />
                                <p>{{ 'microPage.scanCodePreview' | t }}</p>
                            </div>
                            <p>{{ 'microPage.draftStatusTips' | t }}</p>
                        </div>
                        <!-- 发布状态 -->
                        <div class="view-publish" v-else>
                            <div class="code-preview">
                                <img :src="viewInfo.qrCodePath" />
                                <p>{{ 'microPage.scanCodePreview' | t }}</p>
                            </div>
                            <!-- 小程序码 -->
                            <div class="wxaCode" v-if="viewInfo.wxaCode">
                                <img :src="viewInfo.wxaCode" />
                                <button
                                    class="btn btn-md btn-round btn-theme"
                                    type="button"
                                    @click="downloadCode(viewInfo)"
                                >
                                    {{ 'microPage.download' | t }}
                                </button>
                            </div>
                            <!-- 复制链接 -->
                            <div class="copy-link" v-if="urlLink">
                                <p>{{ urlLink }}</p>
                                <button
                                    class="btn btn-md btn-theme"
                                    type="button"
                                    v-clipboard:copy="urlLink"
                                    v-clipboard:success="onCopy"
                                    v-clipboard:error="onError"
                                >
                                    {{ 'microPage.copyLink' | t }}
                                </button>
                            </div>
                        </div>
                    </div>
                </modal>
            </div>
        </div>
        <div class="content-view margin padding white-bg" v-else>
            <span>{{ 'microPage.noMicroPageAuth' | t }}</span>
        </div>
    </div>
</template>
<script type="text/babel">
import { MicroPageApi, microPageGroupApi, GeteOriginApi } from '@/api';
import { translate as t } from '@/locales';
import GroupMove from '@/common/components/group-move.vue';
import Bus from '@/common/components/group-tree/bus.js'; // Bus是在树形组件中传参时使用
import { COMMON_NAME_REGEXP } from '@/common/utils/regs';
import LINKS from '../LINKS';

export default {
    components: {
        GroupMove
    },
    data () {
        return {
            treeData: [], // 微页面分组[{},{},{}]
            fixedGroups: [//固定menu
                { id: 0, fieldName: 'allCount', name: this.$t('microPage.type.all') },
                { id: -1, fieldName: 'createCount', name: this.$t('microPage.type.iCreated') }
            ],
            totalTreeArry: [],  //微页面的分组数据,递归结构需要把allTreeData push到数组中[{allTreeData}]
            sortGroupType: 1,//分组得排序 1：按创建时间降序 2：按创建时间升序 3：按更新时间降序 4：按更新时间升序 5：按名称降序 6：按名称升序
            defaultGroup: 1,//1:默认分组，0：非默认
            sortField: 'createDate',//查询列表排序字段
            sortType: 'desc',//查询列表排序顺序（asc:升序，desc:降序）
            keyword: '',
            //批量操作按钮
            operateList: [{
                name: 'microPage.moveToGroup',
                disabled: '',
                type: 'moveToGroup'
            }, {
                name: 'microPage.batchDel',
                disabled: '',
                type: 'batchDel'
            }],
            //列表展示的属性
            tableTitle: [
                { id: 1, name: t('microPage.pageName'), type: 'sort', tName: 'pageName', title: t('microPage.arrangeByIntials') },
                { id: 2, name: t('microPage.status'), type: 'filter' },
                { id: 3, name: t('microPage.lastModifiedBy') },
                { id: 4, name: t('microPage.lastModifiedAt'), type: 'sort', tName: 'updateDate', title: t('microPage.arrangeByupdateTime') },
                { id: 5, name: t('microPage.creatorBy') },
                { id: 6, name: t('microPage.createdOn'), type: 'sort', tName: 'createDate', title: t('microPage.arrangeByCreationTime') },
                { id: 7, name: t('microPage.visitors'), type: 'sort', tName: 'visitorCount', title: t('microPage.arrangeByVisitNumber') }
            ],
            loading: true,
            fileds: [
                'id',
                'pageName',
                'status',
                'updateName',
                'updateDate',
                'createName',
                'createDate',
                'visitorCount',
                'groupId',
                'onlineDate'
            ],//所有字段
            microList: [],// 表格数据
            checkIds: [], //选中数据的id
            filedsWidth: [12, 10, 12, 12, 12, 12, 12],
            //更多操作的按钮
            triggerList: [{
                name: 'microPage.move',
                disabled: '',
                type: 'move'
            }, {
                name: 'microPage.offline',
                disabled: '',
                type: 'offline'
            }, {
                name: 'microPage.delete',
                disabled: '',
                type: 'delete'
            }, {
                name: 'microPage.copy',
                disabled: '',
                type: 'copy'
            }, {
                name: 'microPage.statistics',
                disabled: '',
                type: 'statistics'
            }],
            // 微页面状态 默认 为空全选 0草稿 1发布 可支持多选 0,1
            statusList: [{
                id: '',
                name: t('microPage.all')
            }, {
                id: 0,
                name: t('microPage.draft')
            }, {
                id: 1,
                name: t('microPage.publish')
            }],
            filterValue: '',//状态
            totalRow: 0,//总数
            totalPage: 1,// 分页数
            size: 10,//每页展示数量
            pageNum: 1,//当前页数
            createPageShow: false,//创建页面是否显示
            //创建微页面需要提交的内容
            createForm: {
                parentId: '',
                groupName: '',
                groupSource: 'use',
                pageName: '',
                parentName: ''
            },
            groupSelectShow: false, // 是否已选分组
            groupOptions: [],//分组信息
            pageErrText: '',//微页面名称校验信息
            groupErrText: '',//分组名称校验信息
            isSubmit: false,
            groupMoveModalOpen: false,//移动分组弹窗
            pageId: '',//微页面id
            isBatchMove: false, //批量移动分组
            groupId: 0,//分组id
            viewShow: false,
            viewInfo: {},//预览的信息
            groupTitle: '',
            viewLoading: false,
            isAuthMicroPage: false,  //是否有微页面权限
            isAuthLoaded: false,    //是否已经获取权限
            urlLink: '',    //跳转小程序链接
        };
    },
    created () {
        GeteOriginApi
            .getGlobalConfByConfigName({configName: 'journey_mircopage'})
            .then(({ body: { data } }) => {
                this.isAuthMicroPage = (data.status === 1) ? true : false;
                this.isAuthLoaded = true;
            })
            .catch(() => {
                this.isAuthLoaded = true;
            });
        this.groupId = ~~this.$route.query.groupId || 0;
    },
    mounted () {
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
    },
    methods: {
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
                sortField: this.sortField,
                sortType: this.sortType,
                pageNum: this.pageNum,
                status: this.filterValue
            };
            MicroPageApi.findMicroPageList(params)
                .then(({ body: { data } }) => {
                    this.loading = false;
                    let list = data.list || [];
                    this.microList = this.filedsSort(list, this.fileds);
                    this.totalPage = data.totalPage || 0;
                    this.totalRow = data.totalElement || 0;
                    this.clearChoose();
                })
                .catch(({ body }) => {
                    new Error(body);
                    this.loading = false;
                });
        },
        /**
         * 获取树结构
         */
        getGroupTree () {
            microPageGroupApi.getGroupTree({ sortType: this.sortGroupType })
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
            this.$router.push({ name: 'microPageList', query: { groupId: group.id } });
            this.search();
        },
        /**优化后---确定新建/编辑
         * @param creatdDetail create：新建，edit：编辑
         */
        editGroup (creatdDetail) {
            if (this.isSubmit) return;
            this.isSubmit = true;
            const params = {
                name: creatdDetail.groupName,
                parentId: creatdDetail.parentId,
                id: creatdDetail.optionType === 'edit' ? creatdDetail.groupId : ''
            };
            microPageGroupApi.groupSaveOrUpdate(params)
                .then(({ body }) => {
                    this.isSubmit = false;
                    creatdDetail.optionType === 'edit' ? this.$toast(this.$t('common.updateSuccess'), 'success')
                        : this.$toast(body.message, 'success');
                    this.getGroupTree();
                    this.$refs.leftSideba.closeNewEditModal();
                })
                .catch(() => {
                    this.isSubmit = false;
                });
        },
        /**确定删除分组
         * @param groupId
         */
        delGroup (groupId) {
            if (this.isSubmit) return;
            this.isSubmit = true;
            microPageGroupApi.delGroupTree(groupId)
                .then(() => {
                    this.isSubmit = false;
                    this.$refs.leftSideba.closeNewEditModal();
                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                    this.$router.push({ name: 'microPageList', query: { groupId: 0 } });
                    this.groupId = 0;
                    this.search(true);
                    this.getGroupTree();
                })
                .catch(() => {
                    this.isSubmit = false;
                });
        },
        // 遍历树数据，将open更改为false
        traverseOpen (data) {
            this.$openToFalse(data);
        },
        /**
         * 打开创建页面弹窗
         */
        createPage () {

            this.groupSelectShow = false;
            this.pageErrText = '';
            this.createForm = {
                parentId: '',
                name: '',
                groupSource: 'use',
                pageName: '',
                parentName: ''
            };
            this.getGroupOptions(() => {
                this.createPageShow = true;
            });
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
                    let flag = false;
                    this.checkIds.forEach(e => {
                        if (flag) return;
                        const index = this.microList.findIndex(ele => {
                            return (e === ele.id) && (ele.status === this.statusList[2].id);
                        });
                        if (index !== -1) flag = true;
                    });

                    if (flag) return this.$toast(this.$t('microPage.batcnDelTips'), 'warn');

                    this.$confirm(this.$t('microPage.deletingMicroPage'), this.$t('microPage.deletingMicroPageTips'))
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
                ids: this.checkIds
            };

            MicroPageApi.batchDel(params)
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
        listSort (sortField, sortType) {
            this.sortType = sortType;
            this.sortField = sortField;
            this.search();
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
            this.filterValue = e;
            this.search();
        },
        /**
         * 状态处理
         */
        statusRender (val) {
            return this.statusList.filter(e => e.id === val)[0].name;
        },
        //页码变动
        handlePage (e) {
            this.pageNum = e;
            this.search();
        },
        viewEvent (id) {
            this.viewShow = true;
            this.viewLoading = true;
            MicroPageApi.viewMicroPage({ id })
                .then(({ body: { data } }) => {
                    this.urlLink = LINKS.ORIGIN + LINKS.WEB_BASE + '/mpomp?id=' + id;
                    this.viewLoading = false;
                    this.viewInfo = data;
                })
                .catch(({ body }) => {
                    this.viewLoading = false;
                    new Error(body);
                });
        },
        //编辑
        editEvent ({ id, groupId, pageName }) {
            this.$router.push({ query: { id, groupId, pageName }, name: 'microPageEdit' });
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
                //下线
                case this.triggerList[1].type:
                    this.$confirm(this.$t('microPage.mircopageOffline'), this.$t('microPage.mircopageOfflineTips'))
                        .then(sure => {
                            if (sure) {
                                this.offlineEvent(id);
                            }
                        });
                    break;
                //删除
                case this.triggerList[2].type:
                    this.$confirm(this.$t('microPage.deletingMicroPage'), this.$t('microPage.deletingMicroPageTips'))
                        .then(sure => {
                            if (sure) {
                                this.delEvent(id);
                            }
                        });
                    break;
                //复制
                case this.triggerList[3].type:
                    this.copyEvent(id);
                    break;
                //统计
                case this.triggerList[4].type:
                    this.$router.push({
                        name: 'microPageData',
                        query: {
                            id: id
                        }
                    });
                    break;
                default:
                    break;
            }
        },
        //复制
        copyEvent (id) {
            if (this.loading) return;
            this.loading = true;
            MicroPageApi.copyMicroPage({ id })
                .then(() => {
                    this.loading = false;
                    this.$toast(this.$t('microPage.copied'), 'success');
                    this.search();
                })
                .catch(({ body }) => {
                    this.loading = false;
                    new Error(body);
                });
        },
        //删除
        delEvent (id) {
            if (this.loading) return;
            this.loading = true;
            MicroPageApi.delMicroPage({ id })
                .then(() => {
                    this.loading = false;
                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                    //如果是当前页面最后一条数据被删除，就跳转到上一页
                    if (this.microList.length === 1 && this.pageNum !== 1) {
                        this.pageNum -= 1;
                    }
                    this.search();
                })
                .catch(({ body }) => {
                    this.loading = false;
                    new Error(body);
                });
        },
        //下线
        offlineEvent (id) {
            if (this.loading) return;
            this.loading = true;
            MicroPageApi.offlineMicroPage({ id })
                .then(() => {
                    this.loading = false;
                    this.$toast(this.$t('microPage.successfullyOffline'), 'success');
                    this.search();
                })
                .catch(({ body }) => {
                    this.loading = false;
                    new Error(body);
                });
        },
        //操作权限显隐的逻辑处理
        triggerRender (info) {

            let list = [];
            this.triggerList.forEach((e) => {
                list.push(this.btnShowRender(info, e));
            });
            return list;
        },
        btnShowRender (info, e) {
            const { status, onlineDate } = info;
            let obj = Object.assign({}, e);
            if (e.type === this.triggerList[1].type) {//下线
                obj.isShow = status === this.statusList[2].id;
            } else if (e.type === this.triggerList[2].type) {//删除
                obj.isShow = status !== this.statusList[2].id;
            } else if (e.type === this.triggerList[4].type) {//统计
                obj.isShow = onlineDate ? true : false;
            } else {
                obj.isShow = true;
            }

            return obj;
        },
        closeCreatePage () {
            this.createPageShow = false;
        },
        //创建页面提交的逻辑
        saveCreatePage () {
            if (this.isSubmit) return;
            if (!this.createForm.pageName) {
                this.pageErrText = this.$t('microPage.nameNotNull');
                return;
            }

            if (this.createForm.groupSource === 'create') {
                if (!this.createForm.groupName) {
                    this.groupErrText = this.$t('microPage.groupNameNotNull');
                    return;
                }
                if (!COMMON_NAME_REGEXP.test(this.createForm.groupName)) {
                    this.$toast(this.$t('common.nameSpecial'), 'warn');
                    return;
                }
                this.isSubmit = true;
                const params = {
                    name: this.createForm.groupName,
                    parentId: this.createForm.groupId,
                    id: ''
                };
                microPageGroupApi.groupSaveOrUpdate(params)
                    .then(({ body: { data } }) => {
                        this.isSubmit = false;
                        this.jumpToEdit(data.groupId);
                    })
                    .catch(({ body }) => {
                        this.isSubmit = false;
                        new Error(body);
                    });
            } else {
                this.jumpToEdit(this.createForm.groupId);
            }
        },
        //跳转 为页面的编辑或新建页面
        jumpToEdit (groupId) {
            this.$router.push({
                name: 'microPageCreate',
                query: {
                    id: 0,
                    pageName: this.createForm.pageName,
                    groupId: groupId
                }
            });
            this.closeCreatePage();
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
            microPageGroupApi.findGroupOptions(params)
                .then(({ body: { data } }) => {
                    this.groupOptions = [];
                    this.groupOptions.push(Object.assign({}, data.rootGroup));
                    let list = [];
                    this.$traverseTree(this.groupOptions, list);
                    this.groupOptions = list;

                    const groupId = ~~this.$route.query.groupId;
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
        //微页面分组类型改变时
        sourceChange (val) {
            if (val === 'use') {
                const groupId = ~~this.$route.query.groupId;
                const fixedGroupsList = [this.fixedGroups[0].id, this.fixedGroups[1].id];

                this.createForm.groupId = fixedGroupsList.includes(groupId) ?
                    this.groupOptions[0].childs[0].id : groupId;

                this.createForm.parentName = fixedGroupsList.includes(groupId) ?
                    this.groupOptions[0].childs[0].name
                    : this.groupNameRender(groupId);
            } else {
                this.createForm.groupId = this.groupOptions[0].id;
                this.createForm.parentName = this.groupOptions[0].name;
            }
        },
        //移动分组 
        moveGroup (groupId) {
            if (this.loading) return;
            this.loading = true;
            this.closeGroupMoveModal();

            //isBatchMove? 批量：单个
            const params = {
                ids: this.isBatchMove ? this.checkIds : [this.pageId],
                groupId: groupId
            };

            MicroPageApi.batchMoveGroup(params)
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
        viewClose () {
            this.viewShow = false;
            this.urlLink = '';
        },
        // 复制成功
        onCopy () {
            this.$toast(this.$t('microPage.copied'), 'success');
        },
        // 复制失败
        onError () {
            this.$toast(this.$t('microPage.copyErr'), 'error');
        },
        //下载二维码
        downloadCode (item) {
            let alink = document.createElement('a');
            alink.href = `${item.wxaCode}?response-content-type=application/octet-stream`;
            alink.click();
        }
    }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../common/scss/base/variables';
@import '../common/scss/base/mixin';

.micro-page-list {
    .right-group-content {
        @include clearfix();
        flex: 1;
        .tab-links {
            .search-box {
                margin-right: 16px;
            }
        }

        .micro-list-table {
            table-layout: fixed;
            width: 100%;
            margin-top: 16px;
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
                        padding: 0 10px;
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
            @include pagerWrapper();
        }

        .choose-group {
            @include chooseGroup();
        }
    }

    .view-flex-loading {
        width: 100%;
        height: 559px;
        display: flex;
        align-items: center;
    }

    .view-flex {
        display: flex;
        padding: 0 5%;
        .photo-preview {
            width: 267px;
            height: 559px;
            background: url('./img/preview.png') no-repeat;
            position: relative;
            .photo-preview-img {
                position: absolute;
                top: 126px;
                bottom: 78px;
                left: 22px;
                right: 20px;
                overflow: hidden;
                .iframe-preview {
                    position: absolute;
                    left: -78px;
                    top: -120px;
                    width: 378px;
                    height: 590px;
                    pointer-events:none;
                    transform: scale(0.6);
                }
            }
        }
        .view-draft {
            display: flex;
            align-items: center;
            flex-direction: column;
            justify-content: center;
            margin: 0 auto;
            .code-preview {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 200px;
                border: 1px solid #ddd;
                padding: 10px;
                img {
                    width: 100%;
                }
            }
            & > p {
                color: $green;
                margin-top: 10px;
            }
        }

        .view-publish {
            display: flex;
            flex-direction: column;
            margin-left: 30px;
            .code-preview {
                padding: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 140px;
                border: 1px solid #ddd;
                margin-bottom: 40px;
                img {
                    width: 100%;
                }
            }
            .wxaCode {
                display: flex;
                align-items: center;
                margin-bottom: 40px;
                margin-left: 160px;
                img {
                    background-size: 200px;
                    width: 200px;
                    height: 200px;
                    margin-right: 20px;
                }
                button {
                    text-transform: lowercase;
                }
            }
            .copy-link {
                display: flex;
                margin-left: 120px;
                border: 1px solid #ccc;
                p {
                    width: 280px;
                    line-height: 32px;
                }
                span {
                    color: $green;
                    cursor: pointer;
                }
            }
        }
    }
}
</style>