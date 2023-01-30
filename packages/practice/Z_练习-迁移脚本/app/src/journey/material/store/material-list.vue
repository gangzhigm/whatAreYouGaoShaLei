<template>
    <div class="material-store">
        <div class="content-view">
            <crumbs/>
        </div>
        <div class="content-view material-content">
            <!-- 左边侧边栏公用组件 -->
            <left-sidebar :SideTreeData="treeData" :fixedList="fixedGroups"
                            ref="leftSideba" @select="selectGroup"
                            :allTreeData="totalTreeArry" :moduleRange="'materialModule'"
                            @sort="getSortType" @modify="editGroup" @delete="delGroup"
                            @traverseOpen="traverseOpen" />
            <!--分组内素材列表-->
            <div class="right-group-content">
                <!--分组导航-->
                <div class="tab-links">
                    <span class="tab-link" :class="{active: type === 'all'}"
                          @click="changeType('all')">{{'material.type.all' |
                        t}}</span>
                    <span v-show="sharePageShow" class="tab-link" :class="{active: type === '5'}"
                          @click="changeType('5')">{{'material.type.email' |
                        t}}</span>
                    <span class="tab-link" v-show="isNike && sharePageShow" :class="{active: type === '6'}"
                          @click="changeType('6')">{{'material.type.emailTemplate'
                        | t}}</span>
                    <span v-show="sharePageShow" class="tab-link" :class="{active: type === '0'}"
                          @click="changeType('0')">{{'material.type.sms' | t}}</span>
                    <span v-show="sharePageShow" class="tab-link" :class="{active: type === '2'}"
                          @click="changeType('2')">{{'material.type.MMS' | t}}</span>
                    <button class="pull-right btn btn-md btn-round btn-theme"
                            type="button" @click="createMaterial" :disabled="$has('journey_material_add_material')">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        {{'material.add' | t}}
                    </button>
                    <div class="pull-right search-box">
                        <input type="text" v-model="name" maxlength="100"
                               :placeholder="$t('material.keyword')"
                               @keydown.enter="search">
                        <svg aria-hidden="true" @click="search">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                    <!-- 自定义展示列 -->
                    <div class="pull-right">
                        <material-list-attribute-selector v-if="initMaterialAttr.length"
                                                          :initAttrIds="initMaterialAttr"
                                                          @change="changeMaterialAttr">
                        </material-list-attribute-selector>
                    </div>
                </div>
                <div class="operate-top">
                    <!--批量操作-->
                    <div class="operate hidden-menu-trigger batch-actions pull-left">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-batch"></use>
                        </svg>
                        <span class="button-action">{{'material.batchOperation' | t}}</span>
                        <div class="hidden-menu">
                            <button class="btn" :disabled="$has('journey_material_batch_move')"
                                    @click="sharingVerify(openMoveGroupModal(2),{},2,10)">{{'material.moveToGroup'
                                | t}}
                            </button>
                            <button class="btn" :disabled="$has('journey_material_batch_delete')"
                                    @click="sharingVerify(batchDeleteMaterial,{},2,9)">{{'material.batchDel'
                                | t}}
                            </button>
                            <button class="btn" v-if="isShowRemoveFromGroup"
                                    @click="removeMaterialsFromGroup" :disabled="$has('journey_material_group_out')">
                                {{'material.removeFromGroup' | t}}
                            </button>
                        </div>
                    </div>

                    <!-- 切换列表或缩略图 -->
                    <div v-if="type === '5'" class="display-change pull-left">
                        <span class="display-list"
                              :class="{active: displayType === 'list'}"
                              @click="changeDisplayType('list')">
                        </span>
                        <span class="display-thumbnail"
                              :class="{active: displayType === 'thumbnail'}"
                              @click="changeDisplayType('thumbnail')">
                        </span>
                        <selector v-if="displayType === 'thumbnail' && !$has('journey_material_sort_material')"
                                  class="thumbnail-sort"
                                  :options="thumbnailSortItems"
                                  :value="thumbnailSort"
                                  @select="changeThumbnailSort"></selector>
                    </div>
                    <router-link class="pull-right operate go-headerfooter theme-text"
                                 :to="{name: 'headerfooterEmail'}">{{'material.goHeaderFooter'
                        | t}}
                    </router-link>
                </div>
                <!--素材列表展示-->
                <table v-if="type !== '5' || displayType === 'list'" class="simplify-table material-list-table">
                    <tr>
                        <!--th 素材名称 类型 更新者 更新时间 创建者 创建时间 操作 -->
                        <th width=40>
                            <div class="choose-all-actions hidden-menu-trigger">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-menu"></use>
                                </svg>
                                <div class="hidden-menu">
                                    <button class="btn" :disabled="$has('journey_material_multiple_choice')"
                                            @click="chooseCurrentPage">{{'material.selectCurrentPage'
                                        | t}}
                                    </button>
                                    <button class="btn" :disabled="$has('journey_material_multiple_choice')"
                                            @click="clearChoose">{{'material.clearSelect'
                                        | t}}
                                    </button>
                                </div>
                            </div>
                        </th>
                        <th v-for="(item, index) in materialAttrDictionary"
                            :key="index"
                            :width="item.id === 1 ? 150 : 100">
                            <span>{{item.name}}</span>
                            <template v-if="item.id === 1">
                                <button type="button" class="table-sort-button"
                                        :disabled="$has('journey_material_sort_material')" @click="ListSort('name')"
                                        :title="$t('material.sortLetter')">
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
                            </template>
                            <template v-else-if="item.id === 4">
                                <button type="button" class="table-sort-button"
                                        :disabled="$has('journey_material_sort_material')" @click="ListSort('updateDate')"
                                        :title="$t('material.sortUpdateData')">
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
                            </template>
                            <template v-else-if="item.id === 6">
                                <button type="button" class="table-sort-button"
                                        :disabled="$has('journey_material_sort_material')" @click="ListSort('createDate')"
                                        :title="$t('material.sortCreateData')">
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
                            </template>
                            <template v-else-if="item.id === 7">
                                <button type="button" class="table-sort-button"
                                        :disabled="$has('journey_material_sort_material')" @click="ListSort('copyCount')"
                                        :title="$t('material.sortCopyCount')">
                                    <svg aria-hidden="true"
                                         class="asc"
                                         :class="{active:  sortValue === 'copyCount' && sortOrder === 0}">
                                        <use xlink:href="#icon-caret-down"></use>
                                    </svg>
                                    <svg aria-hidden="true"
                                         class="desc"
                                         :class="{active: sortValue === 'copyCount' && sortOrder === 1}">
                                        <use xlink:href="#icon-caret-down"></use>
                                    </svg>
                                </button>
                            </template>
                        </th>
                        <th width=100>{{'material.operation' | t}}</th>
                        <!-- 华为2.2期 不显示缩略图 2019.11.01-->
                        <!-- <th width="120">{{'material.materialPreview' | t}}</th> -->
                        <!-- 更新者 -->
                    </tr>
                    <tr v-if="searchEmpty || realEmpty">
                        <td colspan="8">
                            <list-search-empty/>
                        </td>
                    </tr>
                    <tr v-if="loading">
                        <td colspan="8">
                            <inline-loading/>
                        </td>
                    </tr>
                    <tr v-else v-for="material in materials" :key="material.id">
                        <td @click.stop>
                            <checkbox v-model="ids" :source="material.id"
                                      :disabled="$has('journey_material_multiple_choice')"></checkbox>
                        </td>
                        <template>
                            <td v-if="material.headId || material.footId"
                                :title="material.materialName + $t('punctuation.openParenthesis') +
                                $t('material.tagHeaderFooter') + $t('punctuation.closeParenthesis')">
                                <div class="material-name-box">
                                    <span class="material-name">{{material.materialName}}</span>
                                    <span class="end-tag">{{'material.tagHeaderFooter' | t}}</span>
                                </div>
                            </td>
                            <td v-else :title="material.materialName">
                                <div class="material-name-box">
                                    <span class="material-name">{{material.materialName}}</span>
                                </div>
                            </td>
                        </template>
                        <td>
                            <div class="material-type">
                                <span v-text="getMaterialType(material.type)"></span>
                            </div>
                        </td>
                        <!-- 华为2.2期 不显示缩略图 2019.11.01-->
                        <!-- <td>
                            <div class="material"
                                 :class="{'icon-disabled': $has('journey_material_preview_material')}"
                                 @click="preview(material)">
                                <div class="material-preview">
                                    <img v-if="material.type === 1|| material.type === 3 || material.type === 6"
                                         :src="material.previewUrl || EmailPreviewDefault">
                                    <span v-else-if="material.type === 0">{{material.materialContent}}</span>
                                    <div v-else-if="material.type === 2"
                                         v-for="mmsmaterial in material.otherCount.mmsContent" :key="mmsmaterial.id">
                                        <span>{{mmsmaterial.mmsContent}}</span>
                                        <img :src="mmsmaterial.pictureUrl">
                                    </div>
                                </div>
                            </div>
                        </td> -->
                        <td :title="material.updateName">{{material.updateName}}</td>
                        <td :title="material.updateDate | cutSeconds">{{material.updateDate | cutSeconds}}</td>
                        <td :title="material.createName">{{material.createName}}</td>
                        <td :title="material.createDate">{{material.createDate.substring(0, 16)}}</td>
                        <td v-if="isShowCopyNum" :title="material.copyNum">{{material.copyCount}}</td>
                        <td>
                            <div class="material-actions">
                                <button type="button" class="material-action icon icon-search"
                                        @click="sharingVerify(preview,material,2,4)"
                                        :disabled="$has('journey_material_preview_material')"
                                        v-title:top="$t('material.preview')"></button>
                                <button type="button" class="material-action icon icon-pencil"
                                        @click="sharingVerify(edit,material,2,3)"
                                        :disabled="$has('journey_material_edit_material')"
                                        v-title:top="$t('material.edit')"></button>
                                <div class="material-action icon icon-more hidden-menu-trigger">
                                    <div class="hidden-menu">
                                        <button class="btn" :disabled="$has('journey_material_move_material')"
                                                @click="sharingVerify(moveOneToGroup,material,2,11)">{{'material.move' |
                                            t}}
                                        </button>
                                        <button class="btn" :disabled="$has('journey_material_copy_material')"
                                                @click="sharingVerify(duplicate,material,2,5)">{{'common.copy' | t}}
                                        </button>
                                        <button class="btn" :disabled="$has('journey_material_test_material')"
                                                @click="sharingVerify(test,material,2,6)">{{'material.test' | t}}
                                        </button>
                                        <!-- 列表项内部共享功能 -->
                                        <button class="btn" :disabled="$has('journey_material_share_material')"
                                                v-if="shareBtnShow(material)"
                                                @click="sharingVerify(share,material,1,12)">{{'material.share' | t}}
                                        </button>
                                        <button class="btn" :disabled="$has('journey_material_delete_material')"
                                                @click="sharingVerify(del,material,2,7)">{{'material.del' | t}}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
                <!-- 素材缩略图展示 -->
                <div v-if="type === '5' && displayType === 'thumbnail'" class="material-thumbnail">
                    <div v-if="searchEmpty || realEmpty">
                        <list-search-empty/>
                    </div>
                    <div v-else-if="materials_loading">
                        <inline-loading/>
                    </div>
                    <ul v-else>
                        <li v-for="material in materials" :key="'tn' + material.id" class="hidden-menu-trigger">
                            <div class="img-preview">
                                <img :src="material.previewUrl || EmailPreviewDefault">
                            </div>
                            <div class="thumbnail-infos">
                                <span class="thumbnail-info pull-left" v-text="getMaterialType(material.type)"></span>
                                <span v-if="isShowCopyNum" class="thumbnail-info pull-right">{{'material.copyNum' | t}} {{material.copyCount}}</span>
                                <p class="thumbnail-title">{{material.materialName}}</p>
                                <span class="thumbnail-info pull-left">{{material.updateDate | cutSeconds}}</span>
                                <span v-if="material.headId || material.footId" class="thumbnail-hficon pull-right">
                                      {{'material.tagHeaderFooter' | t}}
                                </span>
                            </div>
                            <div class="thumbnail-actions hidden-menu">
                                <button class="thumbnail-action btn"
                                        :disabled="$has('journey_material_preview_material')"
                                        @click="sharingVerify(preview,material,2,4)">
                                        {{'material.preview' | t}}
                                </button>
                                <button class="thumbnail-action btn"
                                        :disabled="$has('journey_material_edit_material')"
                                        @click="sharingVerify(edit,material,2,3)">
                                        {{'material.edit' | t}}
                                </button>
                                <button class="thumbnail-action btn"
                                        :disabled="$has('journey_material_move_material')"
                                        @click="sharingVerify(moveOneToGroup,material,2,11)">
                                        {{'material.move' | t}}
                                </button>
                                <button class="thumbnail-action btn"
                                        :disabled="$has('journey_material_copy_material')"
                                        @click="sharingVerify(duplicate,material,2,5)">
                                        {{'common.copy' | t}}
                                </button>
                                <button class="thumbnail-action btn"
                                        :disabled="$has('journey_material_test_material')"
                                        @click="sharingVerify(test,material,2,6)">
                                        {{'material.test' | t}}
                                </button>
                                <!-- 列表项内部共享功能 -->
                                <button v-if="shareBtnShow(material)"
                                        class="thumbnail-action btn"
                                        :disabled="$has('journey_material_share_material')"
                                        @click="sharingVerify(share,material,1,12)">
                                        {{'material.share' | t}}
                                </button>
                                <button class="thumbnail-action btn"
                                        :disabled="$has('journey_material_delete_material')"
                                        @click="sharingVerify(del,material,2,7)">
                                        {{'material.del' | t}}
                                </button>
                            </div>
                        </li>
                        <!-- 防止最后一行数量不足导致无法对齐 -->
                        <li v-for="empty in 10" :key="'empty' + empty" class="layout-empty"></li>
                    </ul>
                </div>
                <div class="pager-wrapper">
                    <span class="amount"> {{'journey.totalCount' | t}} <span
                            class="theme-text">{{totalCount}}</span>
                        {{'journey.totalUnit' | t}} </span>
                    <pager :total="totalPage" :now="pageNumber"
                           @page="switchPage"/>
                </div>
                <back-top ref="topper"></back-top>

                <!-- 选择新增素材的类别 -->
                <modal @close="cancelCreateMaterial" :title="$t('material.add')"
                       v-if="newModalShow">
                    <div class="tac">
                        <div class="create-btn">
                            <router-link tag="button" type="button" class="icon icon-mail"
                                         :to="{
                                         name: 'createEmailMethods',
                                         query: {type: type,groupId: activeGroupId},
                                         params: {groupId: activeGroupId}}"/>
                            <span>{{'material.email' | t}}</span>
                        </div>
                        <div class="create-btn">
                            <router-link tag="button" type="button" class="icon icon-sms"
                                         :to="{
                                         name: 'createSMS',
                                         query: {type: type,groupId: activeGroupId},
                                         params: {groupId: activeGroupId}}"/>
                            <span>{{'material.sms' | t}}</span>
                        </div>
                        <div class="create-btn">
                            <router-link tag="button" type="button" class="icon icon-mms"
                                         :to="{
                                         name: 'createMMS',
                                         query: {type: type,groupId: activeGroupId},
                                         params: {groupId: activeGroupId}}"/>
                            <span>{{'material.mms' | t}}</span>
                        </div>
                    </div>
                </modal>

                <!-- 批量移动分组 -->
                <group-change-modal v-if="groupMoveModalOpen" :ids="ids" :operType="operType" @move="moveGroup"
                                    @close="closeGroupMoveModal"/>

            </div>
        </div>
        <!-- 共享弹框 -->
        <share-model ref="shareModel"/>
    </div>
</template>
<script type="text/babel">
    import { JourneyMaterialApiV1, JourneyMaterialApiV3 } from '@/api';
    // 共享弹框
    import shareModel from '../../shareModal/shareModal.vue';
    import cloneDeep from 'lodash/cloneDeep';
    import {trackEvent} from '../../../monitor';
    import GroupEditModal from '../group-operation-modal/group-edit-modal.vue';
    import GroupChangeModal from '../group-operation-modal/group-change-modal.vue';
    import materialListAttributeSelector from './material-list-attribute-selector.vue';

    import Bus from '../../../common/components/group-tree/bus.js'; // Bus是在树形组件中传参时使用
    import { mapState } from 'vuex';
    import { uniqId } from '@/store/vuex/modules/canvasStore';

    import EmailPreviewDefault  from './default-email-preview.jpg';

    export default {
        components: {
            GroupEditModal,
            GroupChangeModal,
            shareModel,
            materialListAttributeSelector
        },
        data() {
            return {
                newGroupName: '',//创建分组name
                parentId: '',//上一级分组id
                groupModal: {
                    display: false,
                    title: this.$t('material.create'),
                    groupName: '',//分组name
                    id: ''
                },
                groupList: [],      //分组列表
                name: '',           // 名称关键字
                type: 'all',           // 当前展示的素材类型 'all' for all, 0 for sms, 1 for email, 2 for mms
                materials: [],          //素材
                ids: [], // 已选中素材ids
                totalPage: 0, //素材totalPage
                totalCount: Infinity, //素材totalRow
                // materials_sort: '',
                loading: false,   //加载完成之前loading
                groupMoveModalOpen: false, // 移动分组弹出层
                EmailPreviewDefault: EmailPreviewDefault,

                newModalShow: false, // 创建新素材type modal
                copyStatus: false, //复制素材

                // 树形数据
                allTreeData: '', // 后台返回的数据是没有被"全部分组"包裹的，需要自定义一个最外层的分组 ➡ "全部分组" {}
                totalTreeArry: [],  //素材的分组数据,递归结构需要把allTreeData push到数组中[{allTreeData}]
                treeData: [], // 素材分组[{},{},{}]
                fixedGroups: [//固定menu
                    {id: 0, fieldName: 'allCount', name: this.$t('material.type.all'), type: 'material'},
                    {id: -2, fieldName: 'createCount', name: this.$t('material.type.iCreated'), type: 'material'},
                    {id: -3, fieldName: 'shareCount', name: this.$t('material.type.share'), type: 'material'},
                ],
                sortType: 1,//排序 1：按创建时间降序 2：按创建时间升序 3：按更新时间降序 4：按更新时间升序 5：按名称降序 6：按名称生序
                defaultGroup: 1,//1:默认分组，0：非默认
                sortValue: '',//排序字段（name,createDate,updateDate,copyCount）
                sortOrder: '',//排序顺序（0:升序，1:降序）
                materialAttrDictionary: [   //列表展示的属性
                    {id: 1, name: this.$t('material.name')},
                    {id: 2, name: this.$t('material.materialType')},
                    {id: 3, name: this.$t('material.updater')},
                    {id: 4, name: this.$t('material.updateTime')},
                    {id: 5, name: this.$t('material.creator')},
                    {id: 6, name: this.$t('material.createData')}
                ],
                initMaterialAttr: [], //初始状态下，列表展示的属性
                displayType: 'list',//列表展示或缩略图展示
                thumbnailSortItems: [   //缩略图展示的排序
                    {id: 1, sortValue: 'copyCount', sortOrder: 0, name: this.$t('material.copyNumHight')},
                    {id: 2, sortValue: 'copyCount', sortOrder: 1, name: this.$t('material.copyNumlow')},
                    {id: 3, sortValue: 'name', sortOrder: 0, name: this.$t('material.titleHight')},
                    {id: 4, sortValue: 'name', sortOrder: 1, name: this.$t('material.titlelow')},
                    {id: 5, sortValue: 'updateDate', sortOrder: 0, name: this.$t('material.updateHight')},
                    {id: 6, sortValue: 'updateDate', sortOrder: 1, name: this.$t('material.updatelow')},
                ],
                thumbnailSort: 6,
                materialOperating: false,    //素材是否正在执行某项操作
                operType: 1, // 1单个，2批量(指由批量操作按钮触发，而不是选中项数目)
                isSubmit: false,
                activeGroupId: Number(this.$route.query.groupId || 0)
            };
        },
        computed: {
            ...mapState({
                // 是否是 nike 账号
                isNike: state => state.user.isNikeCount,
                // 华为账号
                isHw: state => state.user.companyType === 1,
                roleId: state => state.user.roleId

            }),
            sharePageShow() {
                // 当前为共享给我的素材列表页面时不显示
                return this.activeGroupId === -3 ? false : true;
            },
            //search为空
            searchEmpty() {
                return !this.loading && this.name !== '' && this.materials.length === 0;
            },
            realEmpty() {
                return !this.loading && this.name === '' && this.materials.length === 0;
            },
            pageNumber() {
                if (typeof this.$route.query.pageNumber === 'string' || typeof this.$route.query.pageNumber === 'number') {
                    return parseInt(this.$route.query.pageNumber);
                }
                return 1;
            },
            // 列表项共享功能显示隐藏
            shareBtnShow() {
                // 1 代码邮件 3 拖拽邮件 5 6 分批次
                return function (data) {
                    return [1, 3, 5, 6].includes(parseInt(data.type));
                };
            },
            // 是否显示复制数
            isShowCopyNum() {
                let copyNumArr = this.materialAttrDictionary.filter(attr => attr.id === 7);
                return copyNumArr.length;
            },
            // 是否显示批量移出分组
            isShowRemoveFromGroup() {
                return this.defaultGroup !== 1 &&
                    this.activeGroupId && this.activeGroupId !== -2 && this.activeGroupId !== -3;
            }
        },
        watch: {
            '$route.query.type'(newVal, oldVal) {
                if (Number(newVal) !== Number(oldVal)) this.changeType(String(newVal));
            }
        },
        created() {
            // 当前为共享给我的素材列表页面时为全部素材分组
            this.type = this.activeGroupId === -3 ? 'all' : String(this.$route.query.type);
        },
        updated() {
            // 当前为共享给我的素材列表页面时为全部素材分组
            this.type = this.activeGroupId === -3 ? 'all' : this.type;
        },
        mounted() {
            this.name = this.$route.query.name || '';
            this.type = this.$route.query.type === 0 ? '0' : (this.$route.query.type ? String(this.$route.query.type) : 'all');
            this.fetchMaterials();//获取素材列表
            this.getTreeGroupList();//获取侧边栏分组
            this.getMaterialsStatus();//获取展示类型（列表或缩略图）及是否显示复制数
            /**
             * 递归树形菜单
             * singleMenu
             * 点击某个分组
             * groupData所点击的分组详情数据
             */
            Bus.$on('singleMenu', materialGroupData => {
                if (materialGroupData.moduleRange === 'materialModule') {
                    if (materialGroupData.action) {
                        this.selectGroup(materialGroupData.groupData);
                    }
                }
            });
            if (this.isHw) {
                if (this.type === 5) {
                    //邮件
                    //华为埋码-营销旅程-个性化邮件
                    window.hwa('trackPageView', 'P120319968CD75A');
                   
                } else if (this.type === 0) {
                    //短信
                    //华为埋码-营销旅程-个性化短信
                    window.hwa('trackPageView', 'P1203199622C121');
                } else if (this.type === 2) {
                    //彩信
                    //华为埋码-营销旅程-个性化彩信
                    window.hwa('trackPageView', 'P120319938EC92B');
                }
            }
        },
        beforeRouteLeave(to, from, next) {
            to.params.echoQuery = from.query;
            next();
        },
        methods: {
            /**
             * 华为cdp标签预览
             * @param  {Object} material
             */
            previewEmail(material) {
                JourneyMaterialApiV1
                    .previewMaterialLabel(material.id)
                    .then(res => {
                        let labelList = res.body.data.labelList;
                        this.$preview({material: material, labelList});
                    });
            },
            /**
             * 获取按钮是否可用的权限
             * @param fn {Function} 回调函数
             * @param material {Object} 素材对象
             * @param type {Number} 接口类型 1:共享按钮 2: 其他按钮
             * @param shareType {Number} 3:编辑素材 4: 预览素材5: 复制素材 6:测试素材 7:删除素材 8:导出HTML 9: 批量删除10:批量移动 11:移动 12:共享
             */
            sharingVerify(fn, material, type, shareType) {
                // 主账号不做任何限制
                if (this.roleId === 0 || this.roleId === '') { // 主账号
                    fn(material);
                } else {
                    if (this.materialOperating) return;
                    this.materialOperating = true;
                    const API_DATA = {
                        materialId: material.id,
                        materialType: 1,
                        type: type,
                        shareType: shareType
                    };
                    if ([3, 4, 5, 6, 7, 11].includes(shareType)) {
                        JourneyMaterialApiV1
                            .sharingVerify(API_DATA)
                            .then(({body: {data: {isAccess}}}) => {
                                if (isAccess === 1) {
                                    fn(material);
                                } else {
                                    this.$toast(this.$t('material.sharingVerifyOption'), 'warn');
                                }
                                this.materialOperating = false;
                            })
                            .catch(() => {
                                this.materialOperating = false;
                            });
                    } else if ([9, 10].includes(shareType)) {
                        if (this.ids.length === 0) {
                            this.materialOperating = false;
                            return this.$toast(this.$t('material.noMaterial'), 'warn');
                        }
                        this.materialOperating = false;
                        fn(material);
                        // 移除批量校验
                        // let Timer;
                        // const verifyList = [];
                        // this.ids.forEach(item => {
                        //     API_DATA.materialId = item;
                        //     JourneyMaterialApiV1
                        //         .sharingVerify(API_DATA)
                        //         .then(({body: {data: {isAccess}}}) => {
                        //             verifyList.push(isAccess === 1);
                        //         });
                        //     clearInterval(Timer);
                        //     Timer = setInterval(() => {
                        //         if (verifyList.length === this.ids.length) {
                        //             clearInterval(Timer);
                        //             if (verifyList.includes(false)) {
                        //                 if (parseInt(shareType) === 9) {
                        //                     this.$toast(this.$t('material.sharingVerifyBatchDelete'), 'warn');
                        //                 } else if (parseInt(shareType) === 10) {
                        //                     this.$toast(this.$t('material.sharingVerifyBatchMove'), 'warn');
                        //                 }
                        //             } else {
                        //                 fn(material);
                        //             }
                        //             this.materialOperating = false;
                        //         }
                        //     }, 100);
                        // });
                    } else if ([12].includes(shareType)) {
                        delete API_DATA.shareType;
                        JourneyMaterialApiV1
                            .sharingVerify(API_DATA)
                            .then(() => {
                                fn(material);
                                this.materialOperating = false;
                            })
                            .catch(() => {
                                this.materialOperating = false;
                            });
                    }
                }
            },
            /**
             * 获取素材类型
             * @param type 0：短信 1：邮件（H5编码） 2：彩信 3：邮件（拖拽式）
             * 6：nike 分批次素材
             * @returns {string}
             */
            getMaterialType(type) {
                switch (type) {
                    case 0:
                        return this.$t('material.sms');
                    case 1:
                        return this.$t('material.type.emailH5');
                    case 2:
                        return this.$t('material.mms');
                    case 3:
                        return this.$t('material.type.emailDrag');
                    case 6:
                        return this.$t('material.type.emailTemplate');
                }
            },
            //获取分组列表 (公用样式tree-menu)
            getTreeGroupList() {
                this.treeData = [];
                this.totalTreeArry = [];
                const test = [];
                const tree = [];
                JourneyMaterialApiV3
                    .getTreeGroupList({
                        sortType: this.sortType
                    })
                    .then((res) => {
                        this.allTreeData = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.totalTreeArry.push(this.allTreeData);
                        this.$traverseTree(this.totalTreeArry, tree);
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
            // 获取子组件传过来的sortType
            getSortType(sortType) {
                this.sortType = sortType;
                this.getTreeGroupList();
            },

            /**
             * 选择分组
             * @param group 选择的分组
             */
            selectGroup(group) {
                if (group.id === Number(this.$route.query.groupId)) return;

                this.activeGroupId = group.id;

                if (this.activeGroupId && this.activeGroupId !== 0) {
                    let p = this.$getPartById(this.activeGroupId, this.treeData);
                    if (p) {
                        this.defaultGroup = p.default;
                    }
                }
                
                this.$router.replace({
                    name: this.$route.name,
                    query: Object.assign({}, this.$route.query, {
                        groupId: this.activeGroupId,
                        name: this.name,
                        pageNumber: 1,
                        type: this.type,
                        // sort: this.materials_sort,
                    }),
                    params: {groupId: this.activeGroupId},
                });
                this.fetchMaterials();
            },

            /**
             *  新增分组
             *  @param e 新建or编辑
             */
            openGroupModal(e) {
                if (e === 'new') {
                    this.groupModal.display = true;
                    this.groupModal.title = this.$t('material.create');
                } else {
                    this.groupModal.display = true;
                    this.groupModal.title = this.$t('material.edit');
                    this.groupModal.groupName = e.name;
                    this.groupModal.id = e.id;
                }
            },
            closeModal() {
                this.groupModal.display = false;
                this.getTreeGroupList();
            },
            //编辑成功
            editSuccess() {
                this.groupModal.display = false;
                this.getTreeGroupList();
            },
            /** 素材列表排序
             * @param sortValue
             * @constructor
             */
            ListSort(sortValue) {
                this.sortValue = sortValue;
                this.sortOrder = this.sortOrder ? 0 : 1;
                this.fetchMaterials();
            },
            // 获取素材列表
            fetchMaterials() {
                this.loading = true;
                let type = this.type === 'all' ? '' : this.type;
                // 若为共享给我的列表
                if (this.activeGroupId === -3) {
                    JourneyMaterialApiV1
                        .findMaterials({
                            keyword: this.name,
                            pageNumber: this.pageNumber,
                            sortValue: this.sortValue,
                            sortOrder: this.sortOrder
                        })
                        .then(({body: {data: {materialList, totalRow, totalPage}}}) => {
                            materialList.forEach((elm) => {
                                if (elm.otherCount) {
                                    elm.materialMms = elm.otherCount.mmsContent;
                                }
                            });
                            this.materials = materialList;
                            this.materials.forEach(material => {
                                material.previewUrl = material.previewUrl + '?t=' + uniqId();
                            });
                            this.totalPage = totalPage;
                            this.totalCount = totalRow;
                            this.loading = false;
                        });
                } else {
                    // 若为非共享给我的列表
                    JourneyMaterialApiV1
                        .getMaterials(
                            this.activeGroupId || '',
                            this.name,
                            this.pageNumber,
                            type,
                            // this.materials_sort,// 0更新时间降序；1更新时间升序；2名称降序；3名称升序；4创建时间降序；5创建时间升序
                            this.sortValue,
                            this.sortOrder
                        )
                        .then(({body: {data: {materialList, totalRow, totalPage}}}) => {
                            materialList.forEach((elm) => {
                                if (elm.otherCount) {
                                    elm.materialMms = elm.otherCount.mmsContent;
                                }
                            });
                            this.materials = materialList;
                            this.materials.forEach(material => {
                                material.previewUrl = material.previewUrl + '?t=' + uniqId();
                            });
                            this.totalPage = totalPage;
                            this.totalCount = totalRow;
                            this.loading = false;
                        });
                }
            },
            //搜索
            search() {
                this.$router.replace({
                    name: this.$route.name,
                    query: Object.assign({}, this.$route.query, {name: this.name, pageNumber: 1})
                });
                this.fetchMaterials();
                trackEvent('营销旅程-素材-筛选', {keyword: this.name});
            },
            /** 切换素材种类
             * @param type 5:邮件 0：短信 2：彩信 ''：全部
             */
            changeType(type) {
                this.clearChoose();
                this.$refs.topper.backTop();

                if (this.type !== type) this.type = type;
                this.name = '';
                this.$router.replace({
                    name: this.$route.name,
                    query: Object.assign({}, this.$route.query, {
                        groupId: this.activeGroupId,
                        name: this.name,
                        pageNumber: 1,
                        type: this.type,
                        // sort: this.materials_sort,
                    }),
                    params: {groupId: this.activeGroupId},
                });
                if (type === '5' && this.displayType === 'thumbnail') {
                    let sortItem = this.thumbnailSortItems
                        .filter(sort => sort.sortValue === this.sortValue && sort.sortOrder === this.sortOrder);
                    if (sortItem.length) {
                        this.thumbnailSort = sortItem[0].id;
                    } else {
                        this.thumbnailSort = 6;
                        this.sortValue = '';
                        this.sortOrder = '';
                    }
                }
                this.fetchMaterials();
            },
            /** 开启共享弹框
             * @param material
             */
            share(material) {
                // 1 固定为邮件
                this.$refs['shareModel'].show(material.id, 1, material);
            },
            // 全选当前页
            chooseCurrentPage() {
                this.ids = this.materials.map(({id}) => id);
            },
            // 清空当前所选
            clearChoose() {
                this.ids = [];
            },
            //移动分组
            moveGroup() {
                this.closeGroupMoveModal();
                this.$nextTick(() => {
                    this.fetchMaterials();
                    this.clearChoose();
                });
            },
            // 移至分组
            /**
             *  @param {number} operType // 1单个，2批量(指由批量操作按钮触发，而不是选中项数目)
             */
            openMoveGroupModal(operType) {
                if (this.ids.length === 0) {
                    return this.$toast(this.$t('material.noMaterial'), 'warn');
                }
                this.operType = operType;
                this.groupMoveModalOpen = true;
            },
            //关闭移动分组弹窗
            closeGroupMoveModal() {
                this.operType = 1;
                this.groupMoveModalOpen = false;
            },
            // 从分组中移除
            removeMaterialsFromGroup() {
                if (this.ids.length === 0) {
                    return this.$toast(this.$t('material.noMaterial'), 'warn');
                }
                JourneyMaterialApiV3.moveGroup({
                    groupId: this.activeGroupId,
                    materialIds: this.ids,
                    status: 0, // 全选（0：NO，1：YES）
                    type: 1, // 0：移进，1：移出
                    operType: 2 // 批量(指由批量操作按钮触发，而不是选中项数目)
                })
                    .then(({ body: { message } }) => {
                        this.$toast(message, 'success');
                        trackEvent('素材移出分组');
                        this.$nextTick(() => {
                            this.fetchMaterials();
                            this.ids = [];
                        });
                    });
            },
            // 批量删除
            batchDeleteMaterial() {
                if (this.ids.length === 0) {
                    this.$toast(this.$t('material.noMaterial'), 'warn');
                    return;
                }
                this.$confirm(this.$t('common.del'), this.$t('material.deleteConfirmTxt'))
                    .then((sure) => {
                        if (sure)
                            JourneyMaterialApiV1
                                .batchDel(this.ids)
                                .then(() => {
                                    this.totalCount--;
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    this.clearChoose();
                                    this.switchPage(1);
                                });
                    });
            },
            // 创建新素材
            createMaterial() {
                if (this.materialOperating) return;
                if (this.type === 'all')
                    this.newModalShow = true;
                else {
                    // 短信
                    if (this.type === '0') {
                        this.$router.push(
                            {
                                name: 'createSMS',
                                query: {
                                    tab: this.type,
                                    groupType: this.type,
                                    groupId: this.activeGroupId,
                                    pageNumber: this.pageNumber ? this.pageNumber : 1
                                },
                                params: {groupId: this.activeGroupId}
                            });
                    } else if (this.type === '1' || this.type === '5' || this.type === '6') {
                        // 邮件
                        this.$router.push({
                            name: 'createEmailMethods',
                            query: {
                                tab: this.type,
                                groupType: this.type,
                                groupId: this.activeGroupId,
                                pageNumber: this.pageNumber ? this.pageNumber : 1
                            },
                            params: {groupId: this.activeGroupId}
                        });
                    } else if (this.type === '2') {
                        // 彩信
                        this.$router.push({
                            name: 'createMMS',
                            query: {
                                tab: this.type,
                                groupType: this.type,
                                groupId: this.activeGroupId,
                                pageNumber: this.pageNumber ? this.pageNumber : 1
                            },
                            params: {groupId: this.activeGroupId}
                        });
                    }
                }
            },
            //取消创建素材
            cancelCreateMaterial() {
                this.newModalShow = false;
            },
            /**编辑素材
             * @param material
             */
            edit(material) {
                let name = '';
                if (material.type === 3) {
                    name = 'draggableEmail';
                    JourneyMaterialApiV1
                        .checkMaterialEdit(material.id)
                        .then(res => {
                            if (res.body.code === 200) {
                                this.$router.push({
                                    name: name,
                                    query: {
                                        id: material.id,
                                        type: this.type,
                                        groupId: material.groupId || this.activeGroupId,
                                        groupType: material.type,
                                        headId: material.headId,
                                        footId: material.footId,
                                        pageNumber: this.pageNumber ? this.pageNumber : 1
                                    },
                                    params: {material}
                                });
                            }
                        });
                } else if (material.type === 1) {
                    name = 'editEmail';
                    this.$router.push({
                        name: 'editEmail',
                        query: {
                            id: material.id,
                            type: this.type,
                            groupId: material.groupId || this.activeGroupId,
                            groupType: material.type,
                            headId: material.headId,
                            footId: material.footId,
                            pageNumber: this.pageNumber ? this.pageNumber : 1

                        },
                        params: {material}
                    });
                } else if (material.type === 6) {
                    name = 'editNikeEmail';
                    this.$router.push({
                        name: 'editNikeEmail',
                        query: {
                            id: material.id,
                            type: this.type,
                            groupId: material.groupId || this.activeGroupId,
                            groupType: material.type,
                            templateJson: material.templateJson
                            // pageNumber: this.pageNumber ? this.pageNumber : 1
                        }
                    });
                } else {
                    if (material.type === 0) name = 'editSMS';
                    else if (material.type === 2) name = 'editMMS';
                    // else if (material.type === 6) name = 'templateEmail';
                    this.$router.push({
                        name: name,
                        query: {
                            id: material.id,
                            type: this.type,
                            groupId: material.groupId || this.activeGroupId,
                            groupType: material.type,
                            pageNumber: this.pageNumber ? this.pageNumber : 1,

                        },
                        params: {material}
                    });
                }
            },
            /** 预览素材
             * @param material
             * @returns {Promise<void>}
             */
            async preview(material) {
                if (material.type === 0 || material.type === 2) {
                    let isAccess = await JourneyMaterialApiV1
                        .checkMaterialPreview(material.id)
                        .then((res) => {
                            return res.body;
                        });
                    if (isAccess.code !== 200) {
                        this.$toast(isAccess.message, 'warn');
                        return;
                    }
                }
                const previewMaterial = Object.assign({}, material);
                // 邮件类型素材预览
                if (material.type === 1 || material.type === 3 || material.type === 6) {
                    JourneyMaterialApiV1
                        .getMaterial(material.id)
                        .then(({body: {data: {material}}}) => {
                            if (this.isHw) { // 华为cdp标签预览
                                this.previewEmail(material);
                            } else {
                                this.$preview({material: material});
                            }
                        });
                    return;
                }
                this.$preview({material: previewMaterial});
            },
            /**移动单个素材
             * @param material
             */
            moveOneToGroup(material) {
                this.ids = [];
                this.ids.push(material.id);
                this.openMoveGroupModal(1);
                this.$nextTick(() => {
                    this.fetchMaterials();
                });
            },
            /**复制素材
             * @param id
             * @param materialName
             */
            duplicate({id, materialName}) {
                if (this.copyStatus) return false;

                if (materialName.length + 10 > 100) {
                    this.$toast(this.$t('material.duplicateNameTooLong'), 'warn');
                    return;
                }
                this.copyStatus = true;
                JourneyMaterialApiV1
                    .duplicate(id)
                    .then(res => {
                        if (res.body.data && res.body.data.material) {
                            let material = res.body.data.material;
                            material.materialMms = material.type === 2 ? material.otherCount.mmsContent : [];
                            material.previewUrl = material.previewUrl + '?t=' + uniqId();
                            this.materials.unshift(material);
                            this.totalCount++;
                            this.$toast(this.$t('material.copySuccess'), 'success');
                            this.$refs.topper.backTop();
                        }
                        this.copyStatus = false;
                        this.fetchMaterials();
                    })
                    .catch(() => {
                        this.copyStatus = false;
                    });
            },
            /**测试素材
             * @param material
             */
            test(material) {
                // 邮件类素材，测试时需要实时获取主题
                if (material.type === 1 || material.type === 3 || material.type === 6) {
                    JourneyMaterialApiV1
                        .getMaterial(material.id)
                        .then(({body: {data: {material}}}) => {
                            this.$test(cloneDeep(material), material.testSubject ? material.testSubject : '');
                        });
                    return;
                }

                this.$test(cloneDeep(material));
            },
            /**删除素材
             * @param material
             */
            del(material) {
                this.$confirm(this.$t('common.del'), this.$t('material.deleteConfirmTxt'))
                    .then((sure) => {
                        if (sure)
                            JourneyMaterialApiV1
                                .delMaterial(material.id)
                                .then(() => {
                                    this.materials.$deleteByKey(material.id);
                                    this.totalCount--;
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    this.switchPage(1);
                                });
                    });
            },
            /**分页
             * @param pageNumber
             */
            switchPage(pageNumber) {
                let newQuery = Object.assign({}, this.$route.query, {name: this.name, pageNumber});
                this.$router.push({
                    name: this.$route.name,
                    params: this.$route.params,
                    query: newQuery
                });
                this.fetchMaterials();
            },
            /**优化后---确定新建/编辑
             * @param creatdDetail create：新建，edit：编辑
             */
            editGroup(creatdDetail) {
                if (this.isSubmit) return;
                this.isSubmit = true;
                if (creatdDetail.optionType === 'create') {
                    JourneyMaterialApiV3
                        .createGroup({name: creatdDetail.groupName, parentId: creatdDetail.parentId})
                        .then((res) => {
                            this.isSubmit = false;
                            if (res.body.code === 200) {
                                this.$toast(res.body.message, 'success');
                                this.getTreeGroupList();
                                this.$refs.leftSideba.closeNewEditModal();
                            } else {
                                this.$toast(res.body.message, 'warn');
                            }
                        })
                        .catch(() => {
                            this.isSubmit = false;
                        });
                }
                if (creatdDetail.optionType === 'edit') {
                    JourneyMaterialApiV3
                        .modifyGroupName({
                            groupId: creatdDetail.groupId,
                            name: creatdDetail.groupName,
                            parentId: creatdDetail.parentId
                        })
                        .then((res) => {
                            this.isSubmit = false;
                            if (res.body.code === 200) {
                                this.$toast(this.$t('common.updateSuccess'), 'success');
                                this.getTreeGroupList();
                                this.$refs.leftSideba.closeNewEditModal();
                            } else {
                                this.$toast(res.body.message, 'warn');
                            }
                        })
                        .catch(() => {
                            this.isSubmit = false;
                        });
                }
            },
            /**确定删除分组
             * @param groupId
             */
            delGroup(groupId) {
                if (this.isSubmit) return;
                this.isSubmit = true;
                JourneyMaterialApiV3
                    .deleteGroup({groupId: groupId})
                    .then(() => {
                        this.isSubmit = false;
                        this.getTreeGroupList();
                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                        this.$router.push({ name: 'materialStore', query: { groupId: 0 } });
                    }, () => {
                        this.isSubmit = false;
                        this.$toast(this.$t('common.deleteFailed'), 'warn');
                    });
               
            },
            //获取展示模式（列表或缩略图），是否展示复制数
            getMaterialsStatus() {
                this.materials_loading = true;
                JourneyMaterialApiV1
                    .getMaterialsStatus()
                    .then((res) => {
                        if (res.body.data.materialStatus) {
                            this.displayType = 'thumbnail';
                        }
                        this.initMaterialAttr = res.body.data.copyStatus ? [1,2,3,4,5,6,7] : [1,2,3,4,5,6];
                        this.materials_loading = false;
                    })
                    .catch(() => {
                        this.materials_loading = false;
                    });
            },
            //切换展示模式（列表或缩略图）
            changeDisplayType(type) {
                if (type === this.displayType) return;
                this.displayType = type;
                JourneyMaterialApiV1
                    .saveMaterialsStatus({materialStatus: type === 'list' ? 0 : 1});
                let sortItem = this.thumbnailSortItems
                    .filter(sort => sort.sortValue === this.sortValue && sort.sortOrder === this.sortOrder);
                if (sortItem.length) {
                    this.thumbnailSort = sortItem[0].id;
                } else {
                    this.thumbnailSort = 6;
                    this.sortValue = '';
                    this.sortOrder = '';
                    this.fetchMaterials();
                }
            },
            /**自定义展示列
             * @param groupId
             */
            changeMaterialAttr(attr) {
                this.materialAttrDictionary = attr;
            },
            /**缩略图升降序
             * @param sortItem
             */
            changeThumbnailSort(sortItem) {
                this.thumbnailSort = sortItem.id;
                this.sortValue = sortItem.sortValue;
                this.sortOrder = sortItem.sortOrder;
                this.fetchMaterials();
            }
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';

    .material-store {
        .material-content {
            display: flex;
        }
        .right-group-content {
            @include clearfix();
            flex: 1;
            .operate-top {
                margin-top: 16px;
                @include clearfix();
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

            .display-change {
                display: inline-block;

                span {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    margin: 6px;
                    cursor: pointer;

                    &.display-list {
                        background: url("./list-icon.png") no-repeat 0 0;
                        background-size: 20px;

                        &.active {
                            background: url("./list-active-icon.png") no-repeat 0 0;
                            background-size: 20px;
                        }
                    }

                    &.display-thumbnail {
                        background: url("./Thumbnail-icon.png") no-repeat -2px -2px;
                        background-size: 24px;

                        &.active {
                            background: url("./Thumbnail-active-icon.png") no-repeat -2px -2px;
                            background-size: 24px;
                        }
                    }
                }

                .thumbnail-sort {
                    width: 200px;
                    vertical-align: top;

                    .icon-arrow-down:before {
                        position: absolute;
                        top: -5px;
                        right: 5px;
                    }
                }
            }

            .search-box {
                margin-right: 16px;
            }

            .material-list-table {
                table-layout: fixed;
                width: 100%;
                margin-top: 16px;
                text-align: left;
                border-collapse: collapse;
                border-spacing: 0;

                th:not([width]) {
                    width: 100%;
                }

                td {
                    .material-name-box {
                        display: flex;
                        align-items: center;

                        .end-tag {
                            display: inline-block;
                            background-color: $light-orange;
                            padding: 0 4px;
                            margin-left: 2px;
                            border-radius: 5px;
                            color: #fff;
                            flex-shrink: 0;
                            height: 18px;
                        }

                        .material-name {
                            display: inline-block;
                            overflow: hidden;
                            white-space: normal;
                            padding: 5px 0;
                        }
                    }


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

                tr {
                    height: 40px;
                    border-bottom: 1px solid $border-color;

                    &:first-child {
                        background-color: $select-bg;
                    }

                    .journey-name {
                        max-width: 320px;
                        display: inline-block;
                        vertical-align: middle;
                        @include ellipsis;
                    }

                    td:first-child {
                        text-align: center;
                    }

                    &:not(:first-child):hover {
                        background-color: $title-bg;
                    }
                }

                .action-icon {
                    width: 16px;
                    height: 16px;
                }

                .material-sort {
                    svg {
                        width: 14px;
                        height: 14px;
                        display: inline-block;
                        vertical-align: middle;
                        fill: currentColor;
                    }
                }
            }

            .material-thumbnail {
                width: 100%;
                margin-top: 16px;
                overflow: hidden;

                ul {
                    display: flex;
                    justify-content: space-around;
                    flex-wrap: wrap;

                    li {
                        width: 288px;
                        position: relative;
                        border: 1px solid $border-color;
                        margin: 5px 0;

                        .img-preview {
                            display: flex;
                            align-items: center;
                            position: relative;
                            width: 100%;
                            height: 300px;
                            background-color: #eee;

                            img {
                                margin: 0 auto;
                                max-width: 100%;
                                max-height: 100%;
                            }
                        }

                        .thumbnail-infos {
                            width: 100%;
                            padding: 0 5px;
                            box-sizing: border-box;
                            border-top: 1px solid $border-color;

                            .thumbnail-info {
                                display: inline-block;
                                line-height: 24px;
                                color: $color-light-content;
                            }

                            p {
                                width: 100%;
                                display: -webkit-box;
                                font-size: 14px;
                                color: $color-title;
                                line-height: 20px;
                                height: 40px;
                                text-overflow: ellipsis;
                                -webkit-box-orient: vertical;
                                -webkit-box-pack: center;
                                -webkit-line-clamp: 2;
                                white-space: normal;
                                overflow: hidden;
                            }

                            .thumbnail-hficon {
                                display: inline-block;
                                padding: 2px 8px;
                                color: #fff;
                                text-align: center;
                                background-color: $light-orange;
                                border-radius: 2px;
                                margin: 2px 0;
                            }
                        }

                        .thumbnail-actions {
                            position: absolute;
                            top: 0;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            background: rgba(0,0,0,0.65);
                            padding: 100px 0;
                            @include transform-origin(center center);

                            .thumbnail-action {
                                float: left;
                                font-size: 14px;
                                line-height: $input-field-height;
                                color: #fff;
                                text-align: center;
                                margin: 15px 32px;
                                padding: 0;
                            }
                        }

                        &.layout-empty {
                            height: 1px;
                            visibility: hidden;
                            margin: 0;
                            border: none;
                        }
                    }
                }
            }

            .pager-wrapper {
                display: flex;
                justify-content: space-between;

                .amount {
                    line-height: 64px;
                }
            }

            .batch-actions {
                svg {
                    width: 16px;
                    height: 16px;
                    margin-top: -3px;
                }

                .button-action {
                    font-size: 12px;
                }
            }
        }

        //华为2.2期 不显示缩略图 2019.11.01
        // $material-gutter: 50px;
        // $material-width: 100px;
        // $material-height: 100px;
        // $material-preview-height: 80px;

        // .material {
        //     display: inline-block;
        //     position: relative;
        //     @include box-sizing();
        //     vertical-align: top;
        //     width: $material-width;
        //     height: $material-height;
        //     border: 1px solid #e1e1e1;
        //     font-size: 12px;
        //     @include border-radius(2px);
        //     background-color: white;
        //     margin: 4px 0;
        //     cursor: pointer;

        //     &.icon-disabled {
        //         cursor: not-allowed;
        //         pointer-events: none;
        //     }

        //     .material-preview {
        //         height: $material-preview-height;
        //         padding: 9px;
        //         background-color: $content-bg;
        //         color: $color-light-content;
        //         word-break: break-all;
        //         line-height: normal;
        //         white-space: pre-wrap;
        //         overflow: hidden;

        //         img {
        //             display: block;
        //             margin: auto;
        //             max-width: 100%;
        //             width: auto;
        //             height: auto;
        //         }
        //     }
        // }

        .material-type {
            line-height: 32px;
            @include border-radius(100%);
            @include transition(opacity 0.2s ease);

            .icon-sms {
                background-color: $green;
            }

            .icon-mail,
            .icon-dnd-email {
                background-color: $purple;
            }

            .icon-mms {
                background-color: $orange;
            }
        }

        .material-actions {
            display: inline-block;
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
                    position: absolute;

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

        .create-btn {
            display: inline-block;
            margin: 24px 30px;
            font-size: 14px;

            button {
                display: block;
                width: 120px;
                height: 120px;
                line-height: 120px - 2px;
                margin-bottom: 15px;
                font-size: 65px;
                color: $border-color;
                border: 1px dashed currentColor;
                background-color: transparent;
                @include border-radius(100%);
                @include transition();
                cursor: pointer;

                &.icon-sms,
                &.icon-mms,
                &.icon-mail {
                    &:hover {
                        color: $color-light-content;
                        border-color: $color-light-content;
                        background-color: #eaeaea;
                    }
                }
            }
        }

    }
</style>
