<template>
    <div class="header-footer">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="content-view">
            <!-- 左侧头尾模板分组边栏 -->
            <left-sidebar :SideTreeData="treeData" :fixedList="fixedGroups" ref="leftSidebar"
                            @select="selectGroup" :allTreeData="totalTreeArry"
                            @sort="getSortType" @modify="editGroup"
                            @delete="sureDelGroup"
                            :moduleRange="'headerfooterEmail'"
                            @traverseOpen="traverseOpen" />
            <!--分组内素材列表-->
            <div class="right-group-content">
                <!--分组导航-->
                <div class="tab-links">
                    <span class="tab-link" :class="{active: type === 'all'}" @click="changeType('all')">
                        {{'material.type.allTemplate' | t}}</span>
                    <span class="tab-link" :class="{active: type === '1'}" @click="changeType('1')">
                        {{'material.type.emailHeader' | t}}</span>
                    <span class="tab-link" :class="{active: type === '2'}" @click="changeType('2')">
                        {{'material.type.emailFooter' | t}}</span>
                    <button type="button" class="pull-right btn btn-md btn-round btn-theme" @click="createMaterialTemp"
                            :disabled="$has('journey_material_add_material')">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        {{'material.addTemplate' | t}}
                    </button>
                    <div class="pull-right search-box">
                        <input type="text" v-model="name" maxlength="100" :placeholder="$t('material.keyword')"
                               @keydown.enter="search">
                        <svg aria-hidden="true" @click="search">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                </div>
                <!--素材列表-->
                <table class="simplify-table materialTemp-list-table">
                    <!--  素材名称；更新者；更新时间； 创建者；创建时间；操作菜单 -->
                    <tr>
                        <!-- 华为2.2期 去掉表格中预览 2019-11-14-->
                        <!-- <th width="120">{{'material.materialPreview' | t}}</th> -->
                        <th width=150>
                            <span>{{'material.name' | t}}</span>
                            <button type="button" class="table-sort-button" @click="listSort('name')"
                                    :title="$t('material.sortLetter')" :disabled="$has('journey_material_sort_material')">
                                <svg aria-hidden="true"
                                        class="asc"
                                        :class="{active:  sortValue === 'name' && sortOrder === 0}">
                                    <use xlink:href="#icon-caret-down"></use>
                                </svg>
                                <svg aria-hidden="true"
                                        class="desc"
                                        :class="{active: sortValue === 'name' && sortOrder === 1}">
                                    <use xlink:href="#icon-caret-down"></use>
                                </svg>
                            </button>
                        </th>
                        <th width=100>{{'material.emailType' | t}}</th>
                        <th width=100>{{'material.updater'| t}}</th>
                        <th width=100>
                            <span>{{'material.updateTime' | t}}</span>
                            <button type="button" class="table-sort-button" @click="listSort('updateDate')"
                                    :title="$t('material.sortUpdateData')" :disabled="$has('journey_material_sort_material')">
                                <svg aria-hidden="true"
                                        class="asc"
                                        :class="{active:  sortValue === 'updateDate' && sortOrder === 0}">
                                    <use xlink:href="#icon-caret-down"></use>
                                </svg>
                                <svg aria-hidden="true"
                                        class="desc"
                                        :class="{active: sortValue === 'updateDate' && sortOrder === 1}">
                                    <use xlink:href="#icon-caret-down"></use>
                                </svg>
                            </button>
                        </th>
                        <th width=100>{{'material.creator' | t}}</th>
                        <th width=100>
                            <span>{{'material.createData' |t}}</span>
                            <button type="button" class="table-sort-button" @click="listSort('createDate')"
                                    :title="$t('material.sortCreateData')" :disabled="$has('journey_material_sort_material')">
                                <svg aria-hidden="true"
                                        class="asc"
                                        :class="{active:  sortValue === 'createDate' && sortOrder === 0}">
                                    <use xlink:href="#icon-caret-down"></use>
                                </svg>
                                <svg aria-hidden="true"
                                        class="desc"
                                        :class="{active: sortValue === 'createDate' && sortOrder === 1}">
                                    <use xlink:href="#icon-caret-down"></use>
                                </svg>
                            </button>
                        </th>
                        <th width=100>{{'material.operation' | t}}</th>
                    </tr>
                    <tr v-if="searchEmpty || realEmpty">
                        <td colspan="7">
                            <list-search-empty/>
                        </td>
                    </tr>
                    <tr v-if="loading">
                        <td colspan="7">
                            <inline-loading/>
                        </td>
                    </tr>
                    <tr v-else v-for="materialTemp in materialTemps" :key="materialTemp.id">
                        <!-- 华为2.2期 去掉预览缩略图 2019-11-4 -->
                        <!-- <td>
                            <div class="material"
                                 :class="{'icon-disabled': $has('journey_material_preview_material')}"
                                 @click="preview(materialTemp)">
                                <div class="material-preview">
                                    <img :src="materialTemp.previewUrl || EmailPreviewDefault">
                                </div>
                            </div>
                        </td> -->
                        <td :title="materialTemp.name">
                            <span>{{materialTemp.name}}</span>
                        </td>
                        <td>
                            <span>{{materialTemp.type == 1 ? $t('material.headerEmail') : $t('material.footerEmail') }}</span>
                        </td>
                        <td :title="materialTemp.updateName">
                            <span>{{materialTemp.updateName}}</span>
                        </td>
                        <td :title="materialTemp.updateDate">{{materialTemp.updateDate.substring(0,16)}}</td>
                        <td :title="materialTemp.createName">
                            <span>{{materialTemp.createName}}</span>
                        </td>
                        <td :title="materialTemp.createDate">{{materialTemp.createDate.substring(0,16)}}</td>
                        <td>
                            <div class="material-actions">
                                <button type="button" class="material-action icon icon-search"
                                        @click="sharingVerify(preview,materialTemp,2,4)"
                                        :disabled="$has('journey_material_preview_material')"
                                        v-title="$t('material.preview')"></button>
                                <button type="button" class="material-action icon icon-pencil"
                                        @click="sharingVerify(editTemp,materialTemp,2,3)"
                                        :disabled="$has('journey_material_edit_material')"
                                        v-title="$t('material.edit')"></button>
                                <div class="material-action icon icon-more hidden-menu-trigger">
                                    <div class="hidden-menu">
                                        <button class="btn"
                                                :disabled="$has('journey_material_move_material')"
                                                @click="sharingVerify(moveOneToGroup,materialTemp,2,11)">{{'material.move' | t}}
                                        </button>
                                        <button class="btn" :disabled="$has('journey_material_copy_material')"
                                                @click="sharingVerify(duplicate,materialTemp,2,5)">{{'common.copy' | t}}
                                        </button>
                                        <button class="btn" :disabled="$has('journey_material_share_material')"
                                                @click="sharingVerify(share,materialTemp,1,12)">{{'material.share' | t}}
                                        </button>
                                        <button class="btn" :disabled="$has('journey_material_delete_material')"
                                                @click="sharingVerify(del,materialTemp,2,7)">{{'material.del' | t}}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
                <div class="pager-wrapper">
                    <div class="amount">{{'journey.totalCount' | t}} <span class="theme-text"> {{totalCount}} </span> {{'journey.totalUnit' | t}}</div>
                    <pager :total="totalPage" :now="pageNumber" @page="switchPage"/>
                </div>

                <back-top ref="topper"></back-top>

                <!-- 批量移动分组 -->
                <group-change-modal v-if="groupMoveModalOpen"
                                    :ids="ids"
                                    :modalType="modalType"
                                    @move="moveGroup"
                                    @close="closeGroupMoveModal"/>
            </div>
        </div>
        <!-- 共享弹框 -->
        <share-model ref="shareModel"/>
    </div>
</template>
<script type="text/babel">
    import { JourneyMaterialApiV1, EmailHeadFootGroupV1, EmailHeadFootV1 } from '@/api';
    // 共享弹框
    import shareModel from '../../shareModal/shareModal.vue';
    import {trackEvent} from '@/monitor';
    import GroupChangeModal from '../group-operation-modal/group-change-modal.vue';
    import Bus from '../../../common/components/group-tree/bus.js'; // Bus是在树形组件中传参时使用
    import { mapState } from 'vuex';

    import EmailPreviewDefault from './default-email-preview.jpg';

    export default {
        components: {
            GroupChangeModal,
            shareModel
        },
        data() {
            return {
                totalTreeArry:[],
                allTreeData: '',
                treeData: [],

                //固定menu
                fixedGroups: [
                    {id: 0, fieldName: 'allCount', name: this.$t('material.type.allTemplate'), type: 'materialTemp'},
                    {id: -2, fieldName: 'createCount', name: this.$t('material.type.iCreated'), type: 'materialTemp'},
                    {id: -3, fieldName: 'shareCount', name: this.$t('material.type.share'), type: 'materialTemp'},
                ],
                sortType: 1,//排序 1：按创建时间降序 2：按创建时间升序 3：按更新时间降序 4：按更新时间升序 5：按名称降序 6：按名称生序
                modalType: 'HeaderFooter',
                name: '',           // 名称关键字
                type: '',           // 当前展示的素材类型 'all' for all, 0 for header, 2 for footer
                materialTemps: [],
                ids: [], // 已选中素材ids
                totalPage: 0,
                totalCount: Infinity,
                loading: false,
                groupMoveModalOpen: false, // 移动分组弹出层
                EmailPreviewDefault: EmailPreviewDefault,
                copyStatus: false,
                sortOrder:'',
                sortValue:'',
                pageNumber: 1,
                isSubmit: false
            };
        },
        computed: {
            ...mapState({
                roleId: state => state.user.roleId
            }),
            crumbs() {
                return [
                    {name: 'home', text: 'Dmartech'},
                    {name: 'materialStore', text: this.$t('material.contentManagement')},
                    {
                        name: 'headerfooterEmail',
                        text: this.$t('home.HeaderFooterEmail')
                    }
                ];
            },
            activeGroupId: {
                get() {
                    return this.$route.query.groupId ? parseInt(this.$route.query.groupId) : '';
                },
                set(groupId) {
                    this.$router.push({
                        name: 'headerfooterEmail',
                        query: {groupId},
                        params: {groupId},
                    });
                }
            },
            searchEmpty() {
                return !this.loading && this.name !== '' && this.materialTemps.length === 0;
            },
            realEmpty() {
                return !this.loading && this.name === '' && this.materialTemps.length === 0;
            }
        },
        beforeRouteUpdate(to, from, next) {
            if (to.query.name || to.query.type) {
                this.fetchMaterialTemps();
            }
            next();
        },
        beforeRouteLeave(to, from, next) {
            to.params.echoQuery = from.query;
            next();
        },
        mounted() {
            this.name = this.$route.query.name || '';
            this.type = this.$route.query.type || 'all';
            this.pageNumber = this.$route.query.pageNumber || 1;
            this.fetchMaterialTemps();
            this.fetchGroupList();

            // single
            Bus.$on('singleMenu', materialTempGroup => {
                if (materialTempGroup.moduleRange === 'headerfooterEmail') {
                    if (materialTempGroup.action) {
                        this.selectGroup(materialTempGroup.groupData);
                    }
                }
            });
        },
        methods: {
            /**
             * 获取按钮是否可用的权限
             * @param fn {Function} 回调函数
             * @param material {Object} 素材对象
             * @param type {Number} 接口类型 1:共享按钮 2: 其他按钮
             * @param shareType {Number} 3:编辑素材 4: 预览素材5: 复制素材 6:测试素材 7:删除素材 8:导出HTML 9: 批量删除10:批量移动 11:移动 12:共享
             */
            sharingVerify(fn,material,type, shareType) {
                // 主账号不做任何限制
                if (this.roleId === 0 || this.roleId === '') { // 主账号
                    fn(material);
                } else {
                    // materialType 2 指定头尾模板类型
                    const API_DATA = {materialId: material.id, materialType: 2, type: type, shareType: shareType};
                    if ( [3, 4, 5, 6, 7, 11].includes(shareType) ) {
                        JourneyMaterialApiV1
                            .sharingVerify(API_DATA)
                            .then(({body:{data:{isAccess}}}) => {
                                if ( isAccess === 1 ) {
                                    fn(material);
                                } else {
                                    this.$toast(this.$t('material.sharingVerifyOption'), 'warn');
                                }
                            });
                    } else if ([12].includes(shareType)) {
                        delete API_DATA.shareType;
                        JourneyMaterialApiV1
                            .sharingVerify(API_DATA)
                            .then(() => { fn(material) });
                    }
                }
            },
            // group list
            fetchGroupList() {
                this.treeData = [];
                this.totalTreeArry = [];
                const test = [];
                const tree = [];
                EmailHeadFootGroupV1
                    .getHeaderFooterGroupList(this.sortType)
                    .then((res) => {
                        this.allTreeData = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.totalTreeArry.push(this.allTreeData);
                        this.$traverseTree(this.totalTreeArry,tree);
                        this.totalTreeArry = tree;

                        this.treeData = JSON.parse(JSON.stringify(res.body.data.rootGroup.childs));
                        this.$traverseTree(this.treeData, test);
                        this.treeData = test;
                    });
            },
            // 遍历树数据，将open更改为false
            traverseOpen(data) {
                this.$openToFalse(data);
            },
            // select group
            selectGroup(group) {
                this.activeGroupId = group.id;
                this.name = '';
                this.pageNumber = 1;
                this.$router.replace({
                    name: this.$route.name,
                    query: Object.assign({}, this.$route.query, {
                        groupId: this.activeGroupId,
                        name: this.name,
                        pageNumber: 1,
                        type: this.type,
                    })
                });
                this.fetchMaterialTemps();
            },
            // group sort
            getSortType(sortType) {
                this.sortType = sortType;
                this.fetchGroupList();
            },
            // group edit
            editGroup(group) {
                if (this.isSubmit) return;
                this.isSubmit = true;
                if (group.optionType === 'create') {
                    EmailHeadFootGroupV1
                        .createHeaderFooterGroup({
                            name: group.groupName,
                            parentId: group.parentId
                        })
                        .then(res => {
                            this.isSubmit = false;
                            this.$toast(res.body.message, 'success');
                            this.fetchGroupList();
                            this.$refs.leftSidebar.closeNewEditModal();
                        })
                        .catch(() => {
                            this.isSubmit = false;
                        });
                }
                if (group.optionType === 'edit') {
                    EmailHeadFootGroupV1
                        .editHeaderFooterGroup({
                            id: group.groupId,
                            name: group.groupName,
                            parentId: group.parentId
                        })
                        .then(() => {
                            this.isSubmit = false;
                            this.$toast(this.$t('common.updateSuccess'), 'success');
                            this.fetchGroupList();
                            this.$refs.leftSidebar.closeNewEditModal();
                        }, () => {
                            this.isSubmit = false;
                            this.$toast(this.$t('common.updateFailed'), 'warn');
                        })
                        .catch(() => {
                            this.isSubmit = false;
                        });
                }
            },
            // group del
            sureDelGroup(groupId) {
                if (this.isSubmit) return;
                this.isSubmit = true;
                this.deleteGroup(groupId);
                this.activeGroupId = '';
            },
            // 删除分组
            deleteGroup(id) {
                EmailHeadFootGroupV1
                    .deleteHeaderFooterGroup(id)
                    .then(() => {
                        this.isSubmit = false;
                        this.fetchGroupList();
                        this.$toast(this.$t('common.deleteSuccess'),'success');
                    }, () => {
                        this.isSubmit = false;
                        this.$toast(this.$t('common.deleteFailed'), 'warn');
                    });
            },
            // list排序
            listSort(sortValue){
                this.sortValue = sortValue;
                this.sortOrder = this.sortOrder ? 0 : 1;
                this.fetchMaterialTemps();
            },
            // 获取素材模板列表
            fetchMaterialTemps() {
                this.loading = true;
                // -3 为 共享给我的组ID
                if (this.activeGroupId === -3) {
                    JourneyMaterialApiV1
                        .findMaterialsByHead({
                            keyword: this.name,
                            pageNumber: this.pageNumber,
                            type: this.type.replace('all', ''),
                            sortOrder:this.sortOrder,
                            sortValue:this.sortValue
                        })
                        .then(({body: {data: {materialList, totalRow, totalPage}}}) => {
                            this.materialTemps = materialList;
                            this.totalPage = totalPage;
                            this.totalCount = totalRow;
                            this.loading = false;
                        });
                } else {
                    EmailHeadFootV1
                        .getHeaderFooterList({
                            groupId: this.activeGroupId,
                            name: this.name,
                            pageNumber: this.pageNumber,
                            type: this.type.replace('all', ''),
                            sortOrder:this.sortOrder,
                            sortValue:this.sortValue
                        })
                        .then(({body: {data: {emailHeadFootList, totalRow, totalPage}}}) => {
                            this.materialTemps = emailHeadFootList;
                            this.totalPage = totalPage;
                            this.totalCount = totalRow;
                            this.loading = false;
                        });
                }
            },
            // 获取搜索列表
            search(e) {
                this.pageNumber = 1;
                if (this.name) {
                    e.preventDefault();
                } else {
                    this.fetchMaterialTemps();
                }
                trackEvent('营销旅程-素材-头尾模板-筛选', {keyword: this.name});
                this.$router.replace({
                    name: this.$route.name,
                    query: Object.assign({}, this.$route.query, {
                        name: this.name,
                        pageNumber: 1
                    })
                });
            },
            // 切换素材种类
            changeType(type) {
                this.$refs.topper.backTop();

                if (this.type !== type) this.type = type;
                this.name = '';
                this.pageNumber = 1;
                this.$router.replace({
                    name: this.$route.name,
                    query: Object.assign({}, this.$route.query, {
                        groupId: this.activeGroupId,
                        name: this.name,
                        pageNumber: 1,
                        type: this.type,
                    }),
                    params: {groupId: this.activeGroupId},
                });
            },
            // 手动创建新模板
            createMaterialTemp() {
                this.$router.push({
                    name: 'createHeaderFooter',
                    query: {groupId: this.activeGroupId},
                });
            },
            // 编辑素材模板
            editTemp(materialTemp) {
                this.$router.push({
                    name: 'richHeaderFooter',
                    query: {
                        id: materialTemp.id,
                        groupId: materialTemp.groupId || this.activeGroupId,
                        pageNumber:this.pageNumber,
                        type:this.type,
                    }
                });
            },
            // 预览素材模板
            preview(materialTemp) {
                const previewMaterial = Object.assign({}, materialTemp, {isHF: true});
                this.$preview({material: previewMaterial});
            },
            // 开启共享弹框
            share(material){
                // 2 指定为头尾模板
                this.$refs['shareModel'].show(material.id,2);
            },
            // 移动单个素材模板
            moveOneToGroup(materialTemp) {
                this.ids = [];
                this.ids.push(materialTemp.id);
                this.groupMoveModalOpen = true;
            },
            // 移至分组
            moveGroup() {
                this.closeGroupMoveModal();
                this.$nextTick(() => {
                    this.fetchMaterialTemps();
                    this.fetchGroupList();
                });
            },
            closeGroupMoveModal() {
                this.groupMoveModalOpen = false;
                this.ids = [];
            },
            // 复制素材
            duplicate({id, name}) {
                if (this.copyStatus) return false;

                if (name.length + 10 > 100) {
                    this.$toast(this.$t('material.duplicateNameTooLong'), 'warn');
                    return;
                }
                this.copyStatus = true;
                EmailHeadFootV1
                    .copyHeaderFooter(id)
                    .then(({body: {data: {emailHeadFoot}}}) => {
                        this.materialTemps.unshift(emailHeadFoot);
                        this.totalCount++;
                        this.$toast(this.$t('material.copySuccess'), 'success');
                        this.copyStatus = false;
                        this.fetchMaterialTemps();
                        this.fetchGroupList();
                    });
                this.$refs.topper.backTop();
            },
            // 删除素材
            del({id}) {
                this.$confirm(this.$t('common.del'), this.$t('material.deleteConfirmTxt'))
                    .then((sure) => {
                        if (sure)
                            EmailHeadFootV1
                                .deleteHeaderFooter(id)
                                .then(() => {
                                    this.materialTemps.$deleteByKey(id);
                                    this.totalCount--;
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    this.fetchMaterialTemps();
                                    this.switchPage(1);
                                });
                    });
            },
            // 分页
            switchPage(pageNumber) {
                this.pageNumber = pageNumber;
                let newQuery = Object.assign({}, this.$route.query, {name: this.name, pageNumber});
                this.$router.push({
                    name: 'headerfooterEmail',
                    params: this.$route.params,
                    query: newQuery
                });
                this.fetchMaterialTemps();
            },
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .header-footer {
        .right-group-content {
            .tab-links{
                margin-bottom: 10px;
            }
            @include clearfix();
            .search-box {
                margin-right: 16px;
            }

            .materialTemp-list-table {
                table-layout: fixed;
                width: 100%;
                margin-top: 16px;
                text-align: left;
                border-collapse: collapse;
                border-spacing: 0;
                th {
                    box-sizing: border-box;
                    &:not([width]) {
                        width: 100%;
                    }
                }

                td {
                    span{
                        float: left;
                        width: 100%;
                        padding-left: 5px;
                    }
                }

                tr {
                    height: 40px;
                    border-bottom: 1px solid $border-color;

                    &:first-child {
                        background-color: $select-bg;
                    }
                    &:not(:first-child):hover {
                        background-color: $title-bg;
                    }
                }
                .operate {
                    display: inline-block;
                    padding: 0 18px;
                    height: $input-field-height;
                    line-height: $input-field-height;
                    font-size: 14px;
                    cursor: pointer;
                    user-select: none;

                    svg {
                        display: inline-block;
                        width: 14px;
                        height: 14px;
                        vertical-align: middle;
                        fill: currentColor;
                    }

                    .hidden-menu {
                        .btn {
                            display: block;
                            color: $color-light-content;
                            border-radius: 0;

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
        }

        $material-width: 100px;
        $material-height: 100px;
        $material-preview-height: 80px;

        .material {
            display: inline-block;
            position: relative;
            @include box-sizing();
            vertical-align: top;
            width: $material-width;
            height: $material-height;
            border: 1px solid #e1e1e1;
            font-size: 12px;
            @include border-radius(2px);
            background-color: white;
            margin: 4px 0;
            cursor: pointer;

            &.icon-disabled {
                cursor: not-allowed;
                pointer-events: none;
            }

            .material-preview {
                height: $material-preview-height;
                padding: 9px;
                background-color: $content-bg;
                color: $color-light-content;
                word-break: break-all;
                line-height: normal;
                white-space: pre-wrap;
                overflow: hidden;

                img {
                    display: block;
                    margin: auto;
                    max-width: 100%;
                    width: auto;
                    height: auto;
                }
            }
        }

        .material-actions {
            display: inline-block;
            // position: relative;
            // top: -33px;
            cursor: pointer;
            user-select: none;

            .material-action {
                border: none;
                font-size: 16px;
                background-color: transparent;

                &:disabled {
                    color: $disabled;
                    cursor: not-allowed;
                }
            }

            .icon-search {
                color: $theme;
            }

            .icon-pencil {
                color: $theme;
            }

            .hidden-menu-trigger {
                position: relative;
                display: inline-block;
                height: 16px;

                .hidden-menu {
                    // position: relative;
                    // top: $input-field-height - 2;

                    .btn {
                        display: block;
                        color: $color-light-content;
                        border-radius: 0;
                        white-space: nowrap;

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

        .pager-wrapper{
            display: flex;
            justify-content: space-between;
            .amount{
                line-height: 64px;
            }
        }
    }
</style>
