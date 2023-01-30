<template>
    <div class="qr-code-list">
        <div class="content-view">
            <crumbs/>
            <public-account/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'home.subscriptionManage' | t}}</h1>
                <button class='pull-right btn btn-theme btn-md' id="wechat_qrcode_download_qrcode"
                        :disabled="$has('wechat_qrcode_download_data')" @click="openDownloadModal">
                    {{'downloadDetails.download' | t}}
                </button>
            </div>
        </div>
        <div class="page-content content-view">
            <left-sidebar :SideTreeData="groupList" :fixedList="fixedGroups" ref="leftSidebar"
                        @select="selectGroup" :allTreeData="totalTreeArray" :moduleRange="'qr-code'"
                        @sort="getSortType" @modify="editGroup" @delete="deleteGroup"
                        @traverseOpen="traverseOpen" />
            <div class="right-list">
                <div class='list-title'>
                    <div class="pull-left qr-code_total">{{'journey.totalCount' | t}} <span
                            class="theme-text">{{qrCodeTotal ? qrCodeTotal : 0}}</span>
                        {{'journey.totalUnit' | t}}
                    </div>
                    <div class="hidden-menu-trigger batch-actions">
                        <span class="title-text">{{'QRCode.bathAction' | t}}</span>
                        <svg aria-hidden="true" class="all-tag pull-left">
                            <use xlink:href="#icon-batch"></use>
                        </svg>
                        <div class="hidden-menu">
                            <button class="btn" @click.stop="bulkDownloadAction('qrcode')" :disabled="$has('wechat_qrcode_batch_download')">
                                {{'QRCode.batchDownload' | t}}
                            </button>
                            <button class="btn" @click.stop="bulkDownloadAction('record')"
                                :disabled="$has('wechat_qrcode_scan_record_batch_download')">
                                {{'QRCode.batchDownloadRecord' | t}}
                            </button>
                            <button class="btn" @click.stop="startGroupMove"
                                    :disabled="$has('wechat_qrcode_move_to')">
                                {{'form.moveTo' | t}}
                            </button>
                            <button class="btn" @click.stop="bulkDeleteAction('')" :disabled="$has('wechat_qrcode_batch_delete') ">
                                {{'QRCode.batchDelete' | t}}
                            </button>
                        </div>
                    </div>
                    <button class='pull-right btn btn-theme btn-md' id="wechat_qrcode_add_qrcode"
                            :disabled="$has('wechat_qrcode_add_qrcode')" @click='addNewSubscription'>
                        {{'QRCode.create' | t}}
                    </button>
                    <div class="pull-right search-box md">
                        <input type="text" :placeholder="$t('QRCode.search')" v-model.trim="keyWords"
                                @keydown.enter="searchList">
                        <svg aria-hidden="true" @click="searchList">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                </div>
                <div class="simplify-table">
                    <table>
                        <thead>
                            <tr>
                                <td class="diff-overflow" width="20px">
                                    <choose-all-action @choosePage="choosePageData" @clear="clearChoose"/>
                                </td>
                                <td>{{'QRCode.name' | t}}</td>
                                <td>{{'QRCode.account' | t}}</td>
                                <td>{{'QRCode.group' | t}}</td>
                                <td>{{'QRCode.code' | t}}</td>
                                <td :title="$t('QRCode.totalScan')">
                                    <i class="icon icon-yiwen1" v-title:bottom="$t('QRCode.totalScanDesc')"></i>
                                    {{'QRCode.totalScan' | t}}
                                </td>
                                <td :title="$t('QRCode.totalFollower')">
                                    <i class="icon icon-yiwen1" v-title:bottom="$t('QRCode.totalFollowerDesc')"></i>
                                    {{'QRCode.totalFollower' | t}}
                                </td>
                                <td :title="$t('QRCode.totalUnFollow')">
                                    <i class="icon icon-yiwen1" v-title:bottom="$t('QRCode.totalUnFollowDesc')"></i>
                                    {{'QRCode.totalUnFollow' | t}}
                                </td>
                                <td>
                                    {{'QRCode.date' | t}}
                                    <button
                                    type="button"
                                    class="table-sort-button"
                                    :title="$t('microPage.arrangeByCreationTime')"
                                >
                                    <svg
                                        aria-hidden="true"
                                        class="asc"
                                        @click="listSort(0)"
                                        :class="{ active: sortOrder === 0 }"
                                    >
                                        <use xlink:href="#icon-caret-down"></use>
                                    </svg>
                                    <svg
                                        aria-hidden="true"
                                        class="desc"
                                        @click="listSort(1)"
                                        :class="{ active: sortOrder === 1 }"
                                    >
                                        <use xlink:href="#icon-caret-down"></use>
                                    </svg>
                                </button>
                                </td>
                                <td>{{'QRCode.action' | t}}</td>
                            </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(item,index) in subscriptionList" :key="index"
                            :class="{active:checkedItem.indexOf(item.id) !== -1}">
                            <td width="20px">
                                <checkbox :source="item.id" v-model="checkedItem"></checkbox>
                            </td>
                            <td :title='item.name'>{{item.name}}</td>
                            <td :title='item.principalName'>{{item.principalName}}</td>
                            <td :title='item.groupName'>{{item.groupName}}</td>
                            <td><img :src='item.imageUrl' class='subscription-img'/></td>
                            <td>{{item.scanCount}}</td>
                            <td>{{item.scanConcernCount}}</td>
                            <td>{{item.unSubscribeCount}}</td>
                            <td>{{item.createDate}}</td>
                            <td>
                                <svg aria-hidden="true" class="action-icon icon-eye"
                                        @click="viewSubscription(item.id)"
                                        :class="{'icon-disable':$has('wechat_qrcode_details_qrcode')}">
                                    <use xlink:href="#icon-eye"></use>
                                </svg>

                                <svg aria-hidden="true" class="action-icon icon-round-pencil"
                                        @click="editSubscription(item.id)"
                                        :class="{'icon-disable':$has('wechat_qrcode_edit_qrcode')}">
                                    <use xlink:href="#icon-round-pencil"></use>
                                </svg>

                                <svg aria-hidden="true" class="action-icon icon-delete"
                                        @click.stop="bulkDeleteAction(item.id)"
                                        :class="{'icon-disable':$has('wechat_qrcode_delete_qrcode')}">
                                    <use xlink:href="#icon-round-close"></use>
                                </svg>
                            </td>
                        </tr>
                        <tr v-if="subscriptionList.length === 0">
                            <td class="slim-cell" colspan="10">
                                <list-empty v-if="keyWords === ''" :name="$t('QRCode.code')"/>
                                <list-search-empty v-else/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <pager :total="totalPage" :now="nowPage" @page="handlePage">
                    <selector :options="pageSizeOptions"
                              :value="pageSize"
                              @input="tapPagesHander"
                              class="md"/>
                </pager>
            </div>
        </div>
        <!-- 下载二维码弹窗 -->
        <qr-code-download-modal v-if="downloadModalOpen"
                                :ids="checkedItem"
                                :qrcodename="qrcodeName"
                                @close="closeQrcodeModal"/>
        <!-- 下载二维码扫码记录 -->
        <download-detail-modal v-if="qrcodeDwnload" :themeModules="'downloadRecord'" :emailDownload="true"
                               @cancel="cancelDownload" @okDownload="download" 
                               :downloadRecords = checkRecord :customizeModalTitle="$t('QRCode.batchDownloadRecord')"/>

        <!-- 删除二维码 -->
        <confirm v-if="bulkDelete" :title="$t('QRCode.codeDelete')"
                 @cancel="cancelBulkDelete"
                 @confirm="confirmBulkDelete">
            <!--单个删除-->
            <template v-if="isClickDeleteBtn">
                {{'QRCode.delMsg' | t}}
            </template>
            <!--批量删除-->
            <template v-else>
                {{'QRCode.preContent' | t}} {{checkedItem.length}} {{'QRCode.endContent' | t}}
            </template>

        </confirm>
        <!-- 分组移动 -->
        <group-move v-if="showGroupMoveModal" :groupList="totalTreeArray" :placeHolder="$t('openPlat.pleaseCheck')"
                    @close="showGroupMoveModal = false" @moveDown="groupMoveDown"/>
        <!-- 下载数据 -->
        <confirm :title="$t('downloadDetails.download')" v-if="downloadModal" @cancel="downloadCancel" @confirm="downloadSure">
            <div class="form-field">
                <span class="label">{{'QRCode.dataRange' | t}}</span>
                <span>{{'QRCode.groupQrcodeList' | t}}</span>
            </div>
            <div class="form-field flex">
                <label class="label">{{'QRCode.selectGroups' | t}}</label>
                <group-tree-multi ref="downloadGroup" :groupList="totalTreeArray" :max="'5'" @changeArr="changeDownloadGroup"></group-tree-multi>
            </div>
            <!--格式类型-->
            <div class="form-field">
                <label class="label">{{'contact.formatType' | t}}</label>
                <radio source="Excel" v-model="downloadFormatType">Excel</radio>
                <radio source="CSV" v-model="downloadFormatType">CSV</radio>
            </div>
            <!--数据格式-->
            <div class="form-field" v-if="downloadFormatType === 'CSV'">
                <label class="label">{{'contact.dataFormat' | t}}</label>
                <radio source="utf8" v-model="downloadDataFormat">utf8</radio>
                <radio source="gb18030" v-model="downloadDataFormat">gb18030</radio>
            </div>
            <!-- 邮件主题 -->
            <div class="form-field">
                <label class="label">{{'contact.emailSubject' | t}}</label>
                <input type="text" class="input" v-model="downloadEmailSubject" maxlength="60"/>
            </div>
            <div class="form-field">
                <label class="label" for="email">{{'contact.receiveEmail' | t}}</label>
                <input id="email" v-model.trim="downloadEmailText" class="input" type="text">
            </div>
        </confirm>
    </div>
</template>

<script type="text/ecmascript-6">
    import Creator from '../../analysis/user-group/creator.vue';
    import { WechatApiV1 } from '@/api';
    import {trackEvent} from '../../monitor';
    import QrCodeDownloadModal from './qr-code-download-modal.vue';
    import Bus from '../../common/components/group-tree/bus.js'; // Bus是在树形组件中传参时使用
    import GroupMove from '@/common/components/group-move.vue';
    import GroupTreeMulti from '@/common/components/group-tree-multi.vue';
    import { translate as t } from '@/locales';
    export default {
        components: {QrCodeDownloadModal, Creator, GroupMove, GroupTreeMulti},
        data() {
            return {
                downloadModal: false,//下载数据弹窗
                downloadFormatType: 'Excel',//下载数据格式类型
                downloadDataFormat: 'utf8',//下载数据格式
                downloadEmailSubject: this.$t('QRCode.qrcodeListData'),//下载数据邮件主题
                downloadEmailText: '',//下载数据接受邮箱
                downloadGroupIds: [],//下载数据分组ids
                groupList: [],  //分组列表
                subscriptionList: [], // 二维码列表
                keyWords: '',   // 关键字
                downloadModalOpen: false, // 显示下载弹窗
                qrcodeDwnload: false, // 显示下载二维码扫码记录弹窗
                bulkDelete: false,  // 删除二维码弹窗
                checkedItem: [],    // 选中的二维码ids
                selectGroupId: '',  // 选中的分组 id
                selectSubscriptionId: '',   // 单个删除选中的 id
                qrcodeName: '',
                // 分页
                totalPage: 1,
                nowPage: 1,
                qrCodeTotal: 0,
                pageSize: 10,               //每页数量
                pageSizeOptions: [          //每页数量选项列表
                    {id: 50, name: 50 + t('QRCode.numPerPage')},
                    {id: 40, name: 40 + t('QRCode.numPerPage')},
                    {id: 30, name: 30 + t('QRCode.numPerPage')},
                    {id: 20, name: 20 + t('QRCode.numPerPage')},
                    {id: 10, name: 10 + t('QRCode.numPerPage')}
                ],
                sortOrder: 1,               //排序方式（0.正序 1.倒序）

                isClickDeleteBtn: false, // 单个删除按钮
                deleteArray: [],         // 需要删除的二维码

                // 左侧分组树
                allTreeData: '',
                totalTreeArray: [],
                sortType: 1,//排序 1：按创建时间降序 2：按创建时间升序 3：按更新时间降序 4：按更新时间升序 5：按名称降序 6：按名称生序
                //固定menu
                fixedGroups: [
                    {id: 0, name: this.$t('QRCode.allQRCode'), type: 'qr-code'},
                    {id: -2, name: this.$t('QRCode.iCreated'), type: 'qr-code'},
                ],
                checkRecord: 0, // 已选择二维码的个数
                showGroupMoveModal: false,
                isSubmit: false
            };
        },
        created() {
            this.checkedItem = [];
        },
        computed: {
            user() {
                return this.$store.state.user;
            },
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            }
        },
        mounted() {
            if (!this.$route.query.groupId) {
                this.$router.replace({
                    name: 'subscriptionManage',
                    query: {page_number: this.nowPage, groupId: 0}
                });
                this.selectGroupId = '';
            } else {
                if (this.$route.query.page_number) {
                    this.nowPage = this.$route.query.page_number;
                } else {
                    this.nowPage = 1;
                }
                if (~~this.$route.query.groupId === 0) {
                    this.selectGroupId = '';
                } else {
                    this.selectGroupId = ~~this.$route.query.groupId;
                }
                if (this.$route.query.keyWords) {
                    this.keyWords = this.$route.query.keyWords;
                } else {
                    this.keyWords = '';
                }
            }
            // 下载数据预置接受邮箱
            this.downloadEmailText = this.$store.state.user.email;
            // 获取分组列表
            this.getGroup();
            // 获取二维码
            this.getSubscriptionList();
            /**
             * 递归树形菜单
             * singleMenu
             * 点击某个分组
             * groupData所点击的分组详情数据
             */
            Bus.$on('singleMenu', qrcodeGroupData => {
                if (qrcodeGroupData.moduleRange === 'qr-code') {
                    if (qrcodeGroupData.action) {
                        this.selectGroup(qrcodeGroupData.groupData);
                    }
                }
            });
            //华为埋码
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P1203199728C683');
            }
        },
        methods: {
            /**
             * 遍历树数据，将open更改为false
             * @param data
             */
            traverseOpen(data) {
                this.$openToFalse(data);
            },
            /**
             * 获取子组件传过来的sortType
             * @param sortType
             */
            getSortType(sortType) {
                this.sortType = sortType;
                this.getGroup();
            },
            // 获取分组列表
            getGroup() {
                this.groupList = [];
                this.totalTreeArray = [];
                const test = [];
                const tree = [];
                WechatApiV1
                    .getSubscriptionGroup({
                        sortType: this.sortType
                    })
                    .then((res) => {
                        this.allTreeData = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.totalTreeArray.push(this.allTreeData);
                        this.$traverseTree(this.totalTreeArray, tree);
                        this.totalTreeArray = tree;
                        this.groupList = JSON.parse(JSON.stringify(res.body.data.rootGroup.childs));
                        this.$traverseTree(this.groupList, test);
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // search
            searchList() {
                this.nowPage = 1;
                this.getSubscriptionList();
            },
            // 列表排序
            listSort(sortOrder) {
                this.sortOrder = sortOrder;
                this.getSubscriptionList();
            },
            // 获取二维码列表
            getSubscriptionList() {
                this.$loading();
                WechatApiV1
                    .getSubscriptionList({
                        keyword: this.keyWords,
                        pageNumber: this.nowPage,
                        groupId: this.selectGroupId,
                        sortValue: 'createDate',
                        sortOrder: this.sortOrder,
                        rows: this.pageSize
                    })
                    .then((res) => {
                        this.subscriptionList = res.body.data.quickMarkList;
                        this.totalPage = res.body.data.totalPage;
                        this.qrCodeTotal = res.body.data.totalRow;
                        this.changeQuery('page', this.nowPage);
                        this.changeQuery('words', this.keyWords);
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 分页操作
            handlePage(e) {
                this.nowPage = e;
                this.getSubscriptionList();
            },
            // 选择每页数量
            tapPagesHander(num) {
                this.nowPage = 1;
                this.pageSize = num;
                this.getSubscriptionList();
            },
            // add
            addNewSubscription() {
                this.id = '';
                this.$router.push({name: 'qrCodeEdit', params: {id: 0}, query: {groupId: this.selectGroupId}});
            },
            // 点击批量下载以及下载二维码记录按钮
            bulkDownloadAction(type) {
                if (this.checkedItem.length === 0) {
                    this.$toast(this.$t('QRCode.check'), 'warn');
                    return;
                }
                if (type === 'qrcode') {
                    this.downloadModalOpen = true;
                    if (this.checkedItem.length === 1) {
                        this.qrcodeName = this.subscriptionList.filter(item => item.id === this.checkedItem[0])[0].name;
                    }
                }
                if (type === 'record') {
                    this.qrcodeDwnload = true;
                    this.checkRecord = this.checkedItem.length;
                }
            },
            // 取消删除二维码
            cancelBulkDelete() {
                this.bulkDelete = false;
                this.isClickDeleteBtn = false;
            },
            // 确认删除
            confirmBulkDelete() {
                this.$loading();
                this.deleteArray = this.isClickDeleteBtn ? [this.selectSubscriptionId] : this.checkedItem;
                WechatApiV1
                    .bulkDelSubscription(this.deleteArray)
                    .then(() => {
                        this.$toast(this.$t('QRCode.delSuccess'), 'success');
                        trackEvent('微信管理-二维码-删除', {deleteIds: this.selectSubscriptionId});
                        this.bulkDelete = false;
                        this.isClickDeleteBtn = false;
                        this.checkedItem = [];
                        this.deleteArray = [];
                        this.nowPage = 1;
                        this.getSubscriptionList();
                        this.getGroup();
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            /**
             * edit
             * @param itemId id
             */
            editSubscription(itemId) {
                this.$router.push({name: 'qrCodeEdit', params: {id: itemId}});
            },
            /**
             * view detail
             * @param itemId id
             */
            viewSubscription(itemId) {
                this.$router.push({name: 'qrCodeView', params: {id: itemId}});
            },
            // 点击批量删除
            bulkDeleteAction(id) {
                // 判断点击行内按钮还是批量删除按钮
                if (id) {
                    this.selectSubscriptionId = id;
                    this.bulkDelete = true;
                    this.isClickDeleteBtn = true;
                } else {
                    if (this.checkedItem.length === 0) {
                        this.$toast(this.$t('QRCode.check'), 'warn');
                    } else {
                        this.bulkDelete = true;
                        this.isClickDeleteBtn = false;
                    }
                }

            },
            /**
             * 选择分组
             * @param {Object} group 分组
             */
            selectGroup(group) {
                if (group.id === 0) {
                    this.selectGroupId = '';
                } else {
                    this.selectGroupId = group.id;
                }
                this.$router.push({name: 'subscriptionManage', query: {groupId: group.id}});

                this.checkedItem = [];
                this.nowPage = 1;
                this.Id = group.id;
                this.keyWords = '';
                this.getSubscriptionList();
            },
            /**
             * edit group
             * @param {Object} createdDetail
             */
            editGroup(createdDetail) {
                if (this.isSubmit) return;
                this.isSubmit = true;
                if (createdDetail.optionType === 'create') {
                    WechatApiV1
                        .saveOrUpdate({id: 0, name: createdDetail.groupName, parentId: createdDetail.parentId})
                        .then((res) => {
                            this.isSubmit = false;
                            this.$toast(res.body.message, 'success');
                            this.getGroup();
                            this.$refs.leftSidebar.closeNewEditModal();
                        })
                        .catch(() => {
                            this.isSubmit = false;
                        });
                }
                if (createdDetail.optionType === 'edit') {
                    WechatApiV1
                        .saveOrUpdate({
                            id: createdDetail.groupId,
                            name: createdDetail.groupName,
                            parentId: createdDetail.parentId
                        })
                        .then(() => {
                            this.isSubmit = false;
                            this.$toast(this.$t('common.updateSuccess'), 'success');
                            this.getGroup();
                            this.$refs.leftSidebar.closeNewEditModal();
                        })
                        .catch(() => {
                            this.isSubmit = false;
                        });
                }
            },

            // 删除分组
            deleteGroup(groupId) {
                if (this.isSubmit) return;
                this.isSubmit = true;
                WechatApiV1
                    .delGroup(groupId)
                    .then(() => {
                        this.isSubmit = false;
                        this.getGroup();
                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                        trackEvent('微信管理-二维码-删除分组', {groupId: groupId});
                    }, () => {
                        this.isSubmit = false;
                        this.$toast(this.$t('common.deleteFailed'), 'warn');
                    });
                this.selectGroup(this.selectGroupId = '');
            },
            /**
             * change route query
             * @param type
             * @param param
             */
            changeQuery(type, param) {
                if (type === 'page') {
                    this.$router.replace({
                        name: 'subscriptionManage',
                        query: Object.assign({}, this.$route.query, {page_number: param})
                    });
                }
                if (type === 'words') {
                    this.$router.replace({
                        name: 'subscriptionManage',
                        query: Object.assign({}, this.$route.query, {keyWords: param})
                    });
                }
            },
            // 取消下载二维码
            closeQrcodeModal() {
                this.downloadModalOpen = false;
                this.qrcodeName = '';
            },
            // 取消下载二维码扫码记录
            cancelDownload() { 
                this.qrcodeDwnload = false;
            },
            // 确定下载二维码扫码记录
            download(info) {
                WechatApiV1
                    .downloadQrcodeNew({
                        quickMarkIds: this.checkedItem,
                        emailSubject: info.emailSubject,
                        emailAddress: info.emailAddress,
                        dataFormat: info.dataFormat,
                        formatType: info.formatType
                    })
                    .then(() => {
                        this.$toast(this.$t('QRCode.downloadSuccess'), 'success');
                        this.qrcodeDwnload = false;
                        this.checkedItem = [];
                    });
            },
            // 移动分组准备
            startGroupMove() {
                if (!this.checkedItem.length) return this.$toast(this.$t('QRCode.selectQrCode'), 'warn');
                this.showGroupMoveModal = true;
                let firstGroup = this.$getCurrentPart(2, this.totalTreeArray);
                firstGroup.open = true;
                firstGroup.noSelect = false;
            },
            // 确定移动分组
            groupMoveDown(groupId) {
                WechatApiV1
                    .moveGroup({quickMarkGroupId: groupId, ids: this.checkedItem})
                    .then(() => {
                        this.$toast(this.$t('QRCode.moveSuccess'), 'success');
                        this.checkedItem = [];
                        this.getSubscriptionList();
                    });
            },
            // 全选当前页数据
            choosePageData() {
                this.checkedItem = this.subscriptionList.map(item => item.id);
            },
            // 清空选中数据
            clearChoose() {
                this.checkedItem = [];
            },
            // 开始下载数据
            openDownloadModal() {
                this.downloadModal = true;
                let firstGroup = this.$getCurrentPart(2, this.totalTreeArray);
                firstGroup.open = true;
                firstGroup.noSelect = false;
            },
            // 下载数据分组选项
            changeDownloadGroup(arr) {
                this.downloadGroupIds = arr;
            },
            // 取消下载数据
            downloadCancel() {
                this.downloadModal = false;
                this.downloadGroupIds = [];
                this.downloadEmailSubject = this.$t('QRCode.qrcodeListData');
                this.downloadEmailText = this.$store.state.user.email;
                this.downloadDataFormat = 'utf8';
                this.downloadFormatType = 'Excel';
            },
            // 下载数据确认
            downloadSure() {
                if (this.$refs.downloadGroup.groupSelectShow) return;
                if (!this.downloadGroupIds.length) {
                    this.$toast(this.$t('QRCode.selectGroup'), 'warn');
                    return;
                }
                if (!this.downloadEmailSubject.trim()) {
                    this.$toast(this.$t('contact.emailEmpty'), 'warn');
                    return;
                }
                if (!this.downloadEmailText.trim()) {
                    this.$toast(this.$t('QRCode.emptyEmailAddress'), 'warn');
                    return;
                }
                WechatApiV1
                    .downloadQRCodeDataList({
                        groupIds: this.downloadGroupIds,
                        emailSubject: this.downloadEmailSubject,
                        emailAddress: this.downloadEmailText,
                        dataFormat: this.downloadFormatType === 'Excel' ? '' : this.downloadDataFormat,
                        formatType: this.downloadFormatType
                    })
                    .then(() => {
                        this.$toast(this.$t('message.checkoutEmail'), 'success');
                        this.downloadCancel();
                    });
            },
        },
    };
</script>
<style lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .qr-code-list {
        .page-head {
            margin-bottom: 10px;
        }
        .left-group-sidebar {
            height: calc(100vh - #{$header-height + $toolbar-height + 24px + 70px});
        }
        .right-list {
            flex: 1;
            padding: 16px;
            background-color: white;
            box-sizing: border-box;
            height: calc(100vh - #{$header-height + $toolbar-height + 24px + 70px});
            overflow: auto;
            @include transition(width .5s);

            .list-title {
                padding: 16px 0;
                color: $color-light-content;
                @include clearfix();

                .qr-code_total {
                    margin-right: 20px;
                    color: $color-title;
                }

                .hidden-menu-trigger {
                    position: relative;
                    line-height: 20px;
                    top: -1px;
                    cursor: pointer;
                    display: inline-block;

                    &:hover svg {
                        fill: $color-title;
                    }

                    svg {
                        display: block;
                        width: 14px;
                        height: 14px;
                        fill: $color-content;
                    }

                    .hidden-menu {
                        top: 20px;
                        left: 0;
                        @include transform-origin(left top);

                        .btn {
                            display: block;
                            color: $color-light-content;
                            text-align: left;
                            min-width: 120px;
                            font-size: 12px;
                            margin-left: 0;

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

                    .all-tag {
                        position: relative;
                        top: 2px;
                        right: 2px;
                    }
                }

                .btn {
                    margin-left: 24px;
                }
            }

            .subscription-img {
                width: 32px;
                height: 32px;
            }

            .action-icon:first-child {
                margin-left: 0;
            }
        }

        .diff-overflow {
            overflow: unset;
        }
    }

</style>
