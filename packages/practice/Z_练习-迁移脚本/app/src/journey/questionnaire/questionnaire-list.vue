<template>
    <!--表单列表-->
    <div class="questionnaire-list">
        <div class="content-view">
            <crumbs :crumbs="crumbs"></crumbs>
        </div>
        <div class="page-content">
            <div class="content-view questionnaire-content">
                <!--分组组件-->
                <left-sidebar :SideTreeData="treeData" :fixedList="fixedQuestionnaires"
                                ref="leftSidebar"
                                @select="selectGroup"
                                :allTreeData="totalTreeArry"
                                :moduleRange="'questionnaire'"
                                @sort="getSortType" @modify="saveNewGroup"
                                @delete="deleteGroup" @traverseOpen="traverseOpen" />
                <div class="right-list">
                    <!--表单类型切换tab-->
                    <div class="tab-links">
                        <span class="tab-link" :class="{active:formSource == -1}"
                              @click="formSelectType(-1)">{{isHw ? 'form.allForm' : 'form.allCount' | t}}</span>
                        <span class="tab-link" :class="{active:formSource == 3}" @click="formSelectType(3)">{{'form.dmtForm' | t}}</span>
                        <span class="tab-link" :class="{active:formSource == 2}" @click="formSelectType(2)">{{'form.goldForm' | t}}</span>
                    </div>

                    <!--操作筛选、搜索、创建表单-->
                    <div class='list-title'>
                        <button class="pull-right btn btn-md btn-theme btn-margin" @click="addNewForm" :disabled="$has('journey_form_add_standard')">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-plus"></use>
                            </svg>
                            {{'form.addForm' | t}}
                        </button>
                        <div class="pull-right search-box md">
                            <input type="text" :placeholder="$t('form.enterFormName')" v-model.trim="keyWordsTemp"
                                   @keydown.enter="handleSearch">
                            <svg aria-hidden="true" @click="handleSearch">
                                <use xlink:href="#icon-search"></use>
                            </svg>
                        </div>

                        <div class="hidden-menu-trigger batch-actions">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-batch"></use>
                            </svg>
                            <span class="title-text">{{'form.batchAction' | t}}</span>
                            <div class="hidden-menu">
                                <button class="btn" :disabled="$has('journey_form_batch_move')"
                                        @click='sharingVerify(bulkMoveAction,6)'>{{'form.moveTo' | t}}
                                    <!-- @click='bulkMoveAction'>{{'form.moveTo' | t}} -->
                                </button>
                                <button class="btn" :disabled="$has('journey_form_delete_form')"
                                        @click='sharingVerify(bulkDeleteAction,7)'>{{'form.del' | t}}
                                    <!-- @click='bulkDeleteAction'>{{'form.del' | t}} -->
                                </button>
                            </div>
                        </div>

                    </div>
                    <!--表单列表-->
                    <div class="simplify-table questionnaire-list-table">
                        <table>
                            <thead>
                            <tr>
                                <th width="40">
                                    <choose-all-action @choosePage="choosePageData" @clear="clearChoose"/>
                                </th>
                                <th width="120">{{isHw ? 'form.formSources' : 'form.formSource' | t}}</th>
                                <th width="150">{{'form.formName' | t}}</th>
                                <th width="80">
                                    {{'form.status' | t}}
                                    <div class="filter-box" v-blur="closeStatus">
                                        <svg aria-hidden="true" @click="chooseStatus = !chooseStatus">
                                            <use v-bind:xlink:href="'#icon-' + (chooseStatus ? 'shaixuan-tianchong' : 'shaixuan')"></use>
                                        </svg>
                                        <transition name="drop">
                                            <!---1：全部，金数据表单状态：4未测试 5已测试 6已发布， 标准表单状态：7 正常 8 暂停-->
                                            <div class="drop-list" v-if="chooseStatus">
                                                <radio v-model="dmtGoldStatus" :source="-1">{{'form.allStatus' | t}}
                                                </radio>
                                                <radio v-model="dmtGoldStatus" :source="7">{{'form.normalStatus' | t}}
                                                </radio>
                                                <radio v-model="dmtGoldStatus" :source="8">{{'form.pasStatus' | t}}
                                                </radio>
                                                <radio v-model="dmtGoldStatus" :source="4">{{'form.unTestStatue' | t}}
                                                </radio>
                                                <radio v-model="dmtGoldStatus" :source="5">{{'form.testedStatus' | t}}
                                                </radio>
                                                <radio v-model="dmtGoldStatus" :source="6">{{'form.releasedStatus' |
                                                    t}}
                                                </radio>
                                            </div>
                                        </transition>
                                    </div>
                                </th>
                                <th width="120">{{'material.updater' | t}}</th>
                                <th width="120">
                                    {{'material.updateTime' | t}}
                                    <button type="button" class="table-sort-button"
                                            :title="$t('material.sortUpdateData')"
                                            @click="sortForm('updateDate')">
                                        <svg aria-hidden="true" class="asc"
                                             :class="{active:  sortValue === 'updateDate' && sortOrder === 0}">
                                            <use xlink:href="#icon-caret-down"></use>
                                        </svg>
                                        <svg aria-hidden="true" class="desc"
                                             :class="{active:  sortValue === 'updateDate' && sortOrder === 1}">
                                            <use xlink:href="#icon-caret-down"></use>
                                        </svg>
                                    </button>
                                </th>
                                <th width="120">{{'material.creator' | t}}</th>
                                <th width="120">
                                    {{'form.createDate' | t}}
                                    <button type="button" class="table-sort-button"
                                            :title="$t('material.sortUpdateData')"
                                            @click="sortForm('createDate')">
                                        <svg aria-hidden="true" class="asc"
                                             :class="{active:  sortValue === 'createDate' && sortOrder === 0}">
                                            <use xlink:href="#icon-caret-down"></use>
                                        </svg>
                                        <svg aria-hidden="true" class="desc"
                                             :class="{active:  sortValue === 'createDate' && sortOrder === 1}">
                                            <use xlink:href="#icon-caret-down"></use>
                                        </svg>
                                    </button>
                                </th>
                                <th width="80">{{'form.entries' | t}}</th>
                                <th width="80">{{'form.submitters' | t}}</th>
                                <th width="120">{{'form.action' | t}}</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-if="loading">
                                <td colspan="11">
                                    <inline-loading/>
                                </td>
                            </tr>
                            <tr v-else-if="formList.length === 0">
                                <td colspan="11" class="slim-cell">
                                    <list-empty v-if="keyWords === ''" :name="$t('form.form')"/>
                                    <list-search-empty v-else/>
                                </td>
                            </tr>
                            <tr v-else v-for="item in formList" :key="item.id"
                                :class="{active:checkedItem.indexOf(item.id) !== -1}">
                                <td>
                                    <checkbox :source="item.id" v-model="checkedItem"/>
                                </td>
                                <td :title="item.formSource===2?$t('form.goldDataForm'):$t('form.DmartechForm')">
                                    {{item.formSource === 2 ? $t('form.goldDataForm') : $t('form.DmartechForm')}}
                                </td>
                                <td class="name-ellipsis" :title='item.paperName'>
                                    {{item.paperName}}
                                </td>
                                <td>
                                    <span class='icon icon-radio-check'
                                          v-if='item.status===1 ||item.status===2||item.status===3'
                                          :class="{'orange-text': item.status === 1, 'theme-text': item.status === 2, 'red-text': item.status === 3}">&nbsp;</span>
                                    <span>{{questionnaireStatuses[item.status] | t}}</span>
                                </td>
                                <td class="word-wrapping">{{item.updateName}}</td>
                                <td>{{item.updateDate}}</td>
                                <td class="word-wrapping">{{item.createName}}</td>
                                <td>{{item.createDate}}</td>
                                <td>{{item.commitNum}}</td>
                                <td>{{item.commitPersonNum}}</td>
                                <td width="140px" class="edit">
                                    <!--金数据-->
                                    <template v-if='item.status===4||item.status===5||item.status===6'>
                                        <div class="form-actions">
                                            <!--查看btn-->
                                            <button class="btn"
                                                    :disabled="$has('journey_form_search_jinshuju')"
                                                    @click="sharingVerify(viewFormAction,1,item.id,item.id)">
                                                <svg aria-hidden="true" class="action-icon icon-eye"
                                                     v-title:top="$t('form.view')">
                                                    <use xlink:href="#icon-eye"></use>
                                                </svg>
                                            </button>
                                            <!--编辑btn-->
                                            <button class="btn" v-if="item.status !== 6"
                                                    :disabled="$has('journey_form_edit_jinshuju')"
                                                    @click="sharingVerify(editJinFormAction,2,item.id,item)">
                                                <svg aria-hidden="true" class="action-icon icon-round-pencil"
                                                     v-title:top="$t('form.setting')"
                                                     :disabled="item.status ===6">
                                                    <use xlink:href="#icon-round-pencil"></use>
                                                </svg>
                                            </button>
                                            <!--测试btn-->
                                            <button class="btn" v-if="item.status !== 4 && item.status !== 6"
                                                    :disabled="$has('journey_form_test_jinshuju')"
                                                    @click="sharingVerify(testFormAction,3,item.id,item)">
                                                <svg aria-hidden="true" class="action-icon icon-flask"
                                                     v-title:top="$t('form.test')"
                                                     :disabled="item.status ===6">
                                                    <use xlink:href="#icon-flask"></use>
                                                </svg>
                                            </button>
                                            <!--金数据 表单统计-->
                                            <button class="btn" v-show="item.status !== 4"
                                                    :disabled="$has('journey_form_jinhsuju_statistics')"
                                                    @click="sharingVerify(getFormInfo,4,item.id,item)">
                                                <svg aria-hidden="true" class="action-icon icon-pie"
                                                     v-title:top="$t('form.report')">
                                                    <use xlink:href="#icon-pie"></use>
                                                </svg>
                                            </button>
                                            <!--分享btn-->
                                            <button class="btn"
                                                    v-if="item.status != 4"
                                                    :disabled="$has('journey_form_share')"
                                                    @click="sharingVerify(share,0,item.id,item,3)">
                                                <svg aria-hidden="true" class="action-icon icon-share"
                                                     v-title:top="`${$t('form.share')}`"
                                                     :disabled="$has('journey_form_share')">
                                                    <use xlink:href="#icon-share"></use>
                                                </svg>
                                            </button>
                                            <!--删除btn-->

                                            <button class="btn" v-show="item.status !== 4 && item.status !== 6"
                                                    :disabled="$has('journey_form_delete_onefrom')"
                                                    @click.stop="sharingVerify(deleteAction,5,item.id,item.id,item.status)">
                                                <!-- @click.stop="deleteAction(item.id,item.status)"> -->
                                                <svg aria-hidden="true" class="action-icon icon-delete "
                                                     v-title:top="$t('common.del')"
                                                     :disabled="item.status ===6">
                                                    <use xlink:href="#icon-round-close"></use>
                                                </svg>
                                            </button>
                                            <!--未测试状态-->
                                            <div class="form-hidden-actions icon icon-more hidden-menu-trigger"
                                                 v-if="item.status === 4">
                                                <ul class="hidden-menu">
                                                    <li>
                                                        <button class="btn"
                                                                :disabled="$has('journey_form_test_jinshuju') || item.status === 6"
                                                                @click="sharingVerify(testFormAction,3,item.id,item)">
                                                            {{'form.test' | t}}
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button class="btn"
                                                                v-if="item.status === 4"
                                                                :disabled="$has('journey_form_share')"
                                                                @click="sharingVerify(share,0,item.id,item,3)">
                                                            {{'form.share' | t}}
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button class="btn"
                                                                :disabled="$has('journey_form_jinhsuju_statistics')"
                                                                @click="sharingVerify(getFormInfo,4,item.id,item)">
                                                            {{'form.report' | t}}
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button class="btn"
                                                                :disabled="$has('journey_form_delete_onefrom')"
                                                                @click.stop="sharingVerify(deleteAction,5,item.id,item.id,item.status)">
                                                            {{'common.del' | t}}
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                    </template>
                                    <!--原DMT表单-->
                                    <template v-if='item.status===1||item.status===2||item.status===3'>
                                        <button class="btn" @click="sharingVerify(editFormAction,2,item.id,item.id)"
                                                :disabled="$has('journey_form_edit_jinshuju')">
                                            <svg aria-hidden="true" class="action-icon icon-round-pencil"
                                                 v-title:top="$t('form.setting')">
                                                <use xlink:href="#icon-round-pencil"></use>
                                            </svg>
                                        </button>
                                        <button class="btn" @click="sharingVerify(getFormInfo,4,item.id,item)"
                                                :disabled="$has('journey_form_jinhsuju_statistics')">
                                            <svg aria-hidden="true" class="action-icon icon-pie"
                                                 v-title:top="$t('form.report')">
                                                <use xlink:href="#icon-pie"></use>
                                            </svg>
                                        </button>
                                        <button class="btn"
                                                :disabled="$has('journey_form_share')"
                                                @click="sharingVerify(share,0,item.id,item,4)">
                                            <svg aria-hidden="true" class="action-icon icon-share"
                                                 v-title:top="`${$t('form.share')}`"
                                                 :disabled="item.status ===6">
                                                <use xlink:href="#icon-share"></use>
                                            </svg>
                                        </button>
                                    </template>
                                    <!--现DMT表单，标准表单-->
                                    <template v-if='item.status === 7 || item.status === 8'>
                                        <div class="form-actions">
                                            <button class="btn" :disabled="$has('journey_form_edit_jinshuju')"
                                                    @click="sharingVerify(editStandardFormAction,2,item.id,item)">
                                                <svg aria-hidden="true" class="action-icon icon-round-pencil"
                                                     v-title:top="$t('form.setting')">
                                                    <use xlink:href="#icon-round-pencil"></use>
                                                </svg>
                                            </button>
                                            <!--华为2.4.5按钮样式更改 表单统计btn-->
                                            <button class="btn" @click="sharingVerify(getFormInfo,4,item.id,item)"
                                                    v-if="item.status !== 8"
                                                    :disabled="$has('journey_form_jinhsuju_statistics')">
                                                <svg aria-hidden="true" class="action-icon icon-pie"
                                                     v-title:top="$t('form.report')">
                                                    <use xlink:href="#icon-pie"></use>
                                                </svg>
                                            </button>
                                            <button v-if="item.status === 7" @click="sharingVerify(changeFormStatus,13,item.id,item)"
                                                    class="btn" :disabled="$has('journey_form_pause_form')">
                                                <svg aria-hidden="true" class="action-icon icon-pause"
                                                     v-title:top="$t('journeyList.paused')">
                                                    <use xlink:href="#icon-pause"></use>
                                                </svg>
                                            </button>
                                            <button v-else @click="sharingVerify(changeFormStatus,12,item.id,item)"
                                                    :disabled="$has('journey_form_start_form')"
                                                    class="btn">
                                                <svg aria-hidden="true" class="action-icon icon-kaishi"
                                                     v-title:top="$t('dragJourney.start')">
                                                    <use xlink:href="#icon-kaishi"></use>
                                                </svg>
                                            </button>
                                            <button class="btn" :disabled="$has('journey_form_copy')"
                                                    @click="sharingVerify(copyForm,10,item.id,item)">
                                                <svg aria-hidden="true" class="action-icon icon-copy"
                                                     v-title:top="$t('common.copy')">
                                                    <use xlink:href="#icon-copy"></use>
                                                </svg>
                                            </button>
                                            <button class="btn"
                                                    :disabled="$has('journey_form_share')"
                                                    @click="sharingVerify(share,0,item.id,item,4)">
                                                <svg aria-hidden="true" class="action-icon icon-share"
                                                     v-title:top="`${$t('form.share')}`"
                                                     :disabled="item.status ===6">
                                                    <use xlink:href="#icon-share"></use>
                                                </svg>
                                            </button>
                                            <!--华为2.4.5按钮位置更改 删除btn-->
                                            <div class="form-hidden-actions icon icon-more hidden-menu-trigger"
                                                 v-show="item.status === 8">
                                                <ul class="hidden-menu">
                                                    <li>
                                                        <button class="btn"
                                                                :disabled="$has('journey_form_jinhsuju_statistics')"
                                                                @click="sharingVerify(getFormInfo,4,item.id,item)">
                                                            {{'form.report' | t}}
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button class="btn"
                                                                :disabled="$has('journey_form_delete_onefrom')"
                                                                @click.stop="sharingVerify(deleteAction,5,item.id,item.id,item.status)">
                                                            {{'common.del' | t}}
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>

                                            <!-- 自定义表单  sharingVerify(customize, 15, item.id, item) ,分享权限功能暂未开发 -->
                                            <button :disabled="$has('journey_form_custom_form')"
                                                    class="btn btn-custom-form"
                                                    @click="customize(item)">
                                                <svg aria-hidden="true" class="action-icon icon-custom"
                                                     v-title:top="$t('form.customizeForm')">
                                                    <use xlink:href="#icon-custom"></use>
                                                </svg>
                                            </button>
                                        </div>

                                    </template>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <!--列表分页-->
                    <div class="pager-wrapper">
                        <div class="amount">{{'journey.totalCount' | t}} <span
                                class="theme-text">{{totalCount ? totalCount : 0}}</span>
                            {{'journey.totalUnit' | t}}
                        </div>
                        <pager :total="totalPage" :now="nowPage" @page="handlePage"/>
                    </div>
                </div>
            </div>
            <!-- 批量移至分组弹窗 -->
            <modal class="move" v-if="moveForm" :title="$t('form.moveTo')" @close="cancelMoveForm">
                <div class="form-field" @click="closeGroupSelect">
                    <label class="label placeholder" for="use">{{'form.folder' | t}}</label>
                    <div class="choose-parent" id="use" @click.stop="readyCheckGroup">
                        <label class="select-text">
                            {{parentGroupName || $t('common.selectHolder')}}
                            <span class="select-icon icon icon-arrow-down"></span>
                        </label>
                        <div class="search-tree-wrapper" v-if="groupSelectShow" @click.stop>
                            <search-tree :searchTreeData="groupList" @getTreeAct='getTreeAct' :action="false"
                                         :treeActiveId="treeActiveId"
                                         :levelStage="true"></search-tree>
                        </div>
                    </div>
                </div>
                <template v-slot:buttons>
                    <input type="button"
                           :disabled="!orderBy"
                           class="btn btn-md btn-theme"
                           @click="saveMoveGroup"
                           :value="$t('common.confirm')"/>
                </template>
            </modal>
            <!-- 批量删除表单 -->
            <confirm v-if="bulkDelete" :title="$t('form.delForm')" @cancel="cancelBulkDelete"
                     @confirm="confirmBulkDelete">
                <div class="form-field">
                    {{'form.confirmDel' | t}} {{checkedItem.length}} {{'form.forms' | t}}？
                </div>
            </confirm>
            <!-- 修改表单弹窗 -->
            <confirm v-if="editForm" :title="$t('form.formSetting')" @cancel="cancelEditForm"
                     @confirm="confirmEditForm">
                <div class="form-field">
                    <label class="label">{{'form.formNames' | t}}</label>
                    <input v-title:top.line.warn="errorText" :class="{error: errorText}" @focusin="errorText = ''"
                           type="text" v-model.trim="formName" :placeholder="$t('form.enterFormName')" class="input"
                           maxlength="30">
                </div>
                <div class="form-field">
                    <label class="label">{{'form.formStatus' | t}}</label>
                    <span>{{formStatus}}</span>
                </div>
                <div class="form-field">
                    <label class="label">{{'form.url' | t}}</label>
                    <a class="light-content-text" :href='formAddress' target="_blank">{{formAddress}}</a>
                </div>
                <div class="form-field">
                    <label class="label">{{'form.scan' | t}}</label>
                    <img class="qr-code" :src='imageUrl'/>
                </div>
            </confirm>
        </div>
        <!-- 共享弹框 -->
        <share-model ref="shareModel"/>
    </div>
</template>
<script>
    import shareModel from '../shareModal/shareModal.vue';
    import Creator from '../../analysis/user-group/creator.vue';
    import {COMMON_NAME_REGEXP} from '@/common/utils/regs';
    import LINKS from '../../LINKS';
    import {trackEvent} from '@/monitor';
    import { QuestionnaireApiV1, QuestionnaireApiAuth } from '@/api';
    import { mapState } from 'vuex';

    import Bus from '../../common/components/group-tree/bus.js'; // Bus是在树形组件中传参时使用

    export default {
        components: {Creator, shareModel},
        data() {
            return {
                formSource: -1,         // 表单类型 3：标准表单 2：金数据表单
                groupList: [],          // 可选分组列表
                formList: [],           // 表单列表
                keyWords: '',           // 搜索字段值
                keyWordsTemp: '',       // 临时存储搜索关键字
                moveForm: false,        // 批量移至分组弹窗显隐
                bulkDelete: false,      // 批量删除表单弹窗显隐
                editForm: false,        // 修改表单弹窗显隐
                errorText: '',          // 修改表单，表单名称字段校验错误信息
                checkedItem: [],        // 批量删除表单列表Id集合
                selectId: 0,            // 选择的分组Id
                editId: '',             // 存储将修改的表单Id
                itemId: 0,              // 同selectId
                size: 25,               // 分页每页展示的数据条数
                totalPage: 1,           // 表单数据总页数
                nowPage: 1,             // 当前页数
                orderBy: -1,            // 将要移动的分组Id
                // 表单名称
                formName: '',
                // 表单状态
                formStatus: '',
                // 表单在线地址
                formAddress: '',
                // totalLabels: 0,
                imageUrl: '',           // 原版本（华为版本前）表单，表单二维码地址
                questionnaireStatuses: {
                    1: 'form.unconfigured', // 未配置
                    2: 'form.normal', // 正常
                    3: 'form.abnormal', // 异常
                    4: 'form.untest', // 未测试
                    5: 'form.tested', // 已测试
                    6: 'form.released', // 已发布
                    7: 'form.normal', // 标准表单 （正常、暂停）
                    8: 'journeyList.paused', // 暂停
                },
                // 树形数据
                totalTreeArry: [],
                allTreeData: '',        // 分组数据
                treeData: [],           // 分组子级集合
                fixedQuestionnaires: [//固定menu
                    {id: 0, fieldName: 'allCount', name: this.$t('form.allCount'), type: 'questionnaire'},
                    {id: -2, fieldName: 'createCount', name: this.$t('form.iCreated'), type: 'questionnaire'},
                    {id: -3, fieldName: 'shareCount', name: this.$t('material.type.share'), type: 'questionnaire'},
                ],
                sortType: 1,//排序 1：按创建时间降序 2：按创建时间升序 3：按更新时间降序 4：按更新时间升序 5：按名称降序 6：按名称生序
                parentGroupName: '',    // 一级分组名称
                groupSelectShow: false, // 批量移动分组，分组选择组件显隐
                treeActiveId: '',       // 批量移动分组，分组选择组件，当前选择的分组
                totalCount: 0, // 表单总数据
                requestDone: false, // 请求表单列表完成。

                chooseStatus: false,// 表单状态筛选

                loading: false,    // 请求表单列表过渡显隐
                sortValue: '',//排序字段名称
                sortOrder: '',//0：正序 1：倒序
                dmtGoldStatus: -1,//-1：全部，金数据表单状态：4 未测试 5 已测试 6 已发布，标准表单状态：7 正常 8 暂停
                isSubmit: false
            };
        },
        watch: {
            // 表单搜搜
            keyWords: function () {
                this.nowPage = 1;
                this.getFormList();
            },
            // 表单状态筛选
            dmtGoldStatus() {
                this.getFormList();
            }
        },
        computed: {
            ...mapState({
                user: state => state.user,
            }),
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            },
            crumbs() {
                return [
                    {name: 'index', text: 'Dmartech'},
                    {
                        name: 'journeyFormManagement',
                        text: this.$t('home.leads'),
                        params: {id: 0}
                    }
                ];
            },
        },
        created() {
            this.checkedItem = [];
        },
        mounted() {
            //this.selectGroup('');
            this.nowPage = this.$route.query.page_number || 1;
            this.itemId = parseInt(this.$router.currentRoute.params.id) || 0;
            this.selectId = this.itemId;
            this.getFormGroup();
            this.getFormList();
            this.fixedQuestionnaires[0].name = this.isHw ? this.$t('form.allForm') : this.$t('form.allCount');
            /**
             * 递归树形菜单
             * singleMenu
             * 点击某个分组
             * groupData所点击的分组详情数据
             */
            Bus.$on('singleMenu', questionnaireGroupData => {
                if (questionnaireGroupData.moduleRange === 'questionnaire') {
                    if (questionnaireGroupData.action) {
                        this.selectGroup(questionnaireGroupData.groupData);
                    }
                }
            });
            //华为埋码-营销旅程- 获客中心
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P1203199413E09B');
            }
        },
        methods: {
            /**
             * 获取按钮是否可用的权限
             * @param fn {Function} 回调函数
             * @param type {Number} 接口类型 0:共享 1:查看 2:编辑 3:测试 4:表单统计 5:删除 6: 批量移动 7：批量删除 8:报告发送设置 9:下载详情 10:复制
             *                             15 编辑数据 ，16 查看链接， 17 删除自定义表单， 18 新增自定义表单 ，19 自定义表单
             */
            sharingVerify(fn, type, id, ...fnData) {
                if ([6, 7].includes(type)) {
                    if (this.checkedItem.length === 0) {
                        this.$toast(this.$t('form.selectForm'), 'warn');
                        return;
                    }
                    fn();
                } else if ([0, 1, 2, 3, 4, 5, 8, 9, 10,12,13].includes(type)) {
                    QuestionnaireApiAuth
                        .downloadDetailAccess({
                            paperId: id,
                            type,
                        })
                        .then(({body: {data: {isAccess}}}) => {
                            if (isAccess === 1) {
                                if (type === 10) {
                                    fn(id);
                                } else {
                                    fn(fnData[0], fnData[1]);
                                }
                            } else if (isAccess === 0 && type === 0) {
                                this.$toast(this.$t('form.sharingVerifyShare'), 'warn');
                            } else if (isAccess === 0 && type !== 0) {
                                this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                            }
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                }
            },
            // 开启共享弹框
            share(form, type) {
                this.$refs['shareModel'].show(form.id, type);
            },
            // 表单类别 tabs
            formSelectType(type) {
                this.formSource = type;
                this.nowPage = 1;
                this.getFormList();
            },
            // 隐藏表单状态筛选
            closeStatus() {
                this.chooseStatus = false;
            },
            //按更新时间/创建时间排序
            sortForm(sortValue) {
                this.sortValue = sortValue;
                this.sortOrder = this.sortOrder ? 0 : 1;
                this.getFormList();
            },
            //请求表单列表
            getFormList() {
                this.loading = true;
                QuestionnaireApiV1
                    .getFormList({
                        id: this.itemId,
                        name: this.keyWords,
                        page: this.nowPage,
                        size: this.size,
                        formSource: this.formSource,
                        sortOrder: this.sortOrder,
                        sortValue: this.sortValue,
                        status: this.dmtGoldStatus
                    })
                    .then((res) => {
                        this.formList = res.body.data.papers;
                        this.totalPage = res.body.data.totalPage;
                        this.totalCount = res.body.data.totalElement;
                        this.changeQuery(this.nowPage);
                        this.$loaded();
                        this.requestDone = true;
                        this.loading = false;

                    })
                    .catch(() => {
                        this.$loaded();
                        this.requestDone = true;
                        this.loading = false;
                    });
            },
            // 请求分组列表
            getFormGroup() {
                this.treeData = [];
                const test = [];
                this.totalTreeArry = [];
                const tree = [];
                QuestionnaireApiV1
                    .getFormGroup(this.sortType)
                    .then((res) => {
                        this.allTreeData = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.totalTreeArry.push(this.allTreeData);
                        this.$traverseTree(this.totalTreeArry, tree);
                        this.totalTreeArry = tree;


                        this.treeData = JSON.parse(JSON.stringify(res.body.data.rootGroup.childs));
                        this.$traverseTree(this.treeData, test);
                        this.treeData = test;
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 遍历树数据，将open更改为false
            traverseOpen(data) {
                this.$openToFalse(data);
            },
            // 获取子组件传过来的sortType
            getSortType(sortType) {
                this.sortType = sortType;
                this.getFormGroup();
            },
            close() {
                this.modal.modalShow = false;
            },
            // 新建表单
            addNewForm() {
                if (this.$has('journey_form_add_standard')) return;
                // 修改 jira,DAMRTECH-4672: 数据未加载完成时， 点击跳转，触发beforeRouterEnter，重载路由的问题。
                // 这里根据列表加载情况来延缓点击时机
                if (!this.requestDone) return;
                this.$router.push({
                    name: 'newQuestionnaire',
                    params: {groupId: this.selectId},
                    query: {groupId: this.selectId}
                });
            },
            // 编辑表单
            editJinFormAction(item) {
                if (item.status !== 6) {
                    this.$router.push({name: 'questionnaireForm', params: {groupId: item.groupId, id: item.id}});
                }
            },
            // 测试表单（金数据）
            testFormAction(item) {
                if (item.status !== 6) {
                    this.$router.push({name: 'questionnaireTest', params: {groupId: item.groupId, id: item.id}});
                }
            },
            // 显隐表单分组选项
            readyCheckGroup() {
                this.groupSelectShow = !this.groupSelectShow;
            },
            // 隐藏表单分组选项
            closeGroupSelect() {
                this.groupSelectShow = false;
            },
            // search-tree中选择list的某一项时  接收选中项
            getTreeAct(group) {
                this.treeActiveId = group.id;
                this.parentGroupName = group.name;
                this.orderBy = group.id;
                this.groupSelectShow = false;
            },
            // 点击批量移动按钮
            bulkMoveAction() {
                if (this.checkedItem.length === 0) {
                    this.$toast(this.$t('form.selectForm'), 'warn');
                    return;
                }
                this.$loading();
                QuestionnaireApiV1
                    .getFormGroup(this.sortType)
                    .then((res) => {
                        this.groupList = [];
                        let arr = [];
                        let treeObj = {};

                        treeObj = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.groupList.push(treeObj);
                        this.$traverseTree(this.groupList, arr);
                        this.groupList = arr;
                        //查找到 "全部分组"，open = true
                        let firstGroup = this.$getCurrentPart(2, this.groupList);
                        firstGroup.open = true;
                        firstGroup.noSelect = false;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
                this.moveForm = true;
                this.itemId > 0 ? this.orderBy = this.itemId : this.orderBy = '';
            },
            // 取消移动分组
            cancelMoveForm() {
                this.moveForm = false;
                this.groupSelectShow = false;
                this.orderBy = -1;
                this.parentGroupName = '';
            },
            // 确认批量移动
            saveMoveGroup() {
                this.$loading();
                QuestionnaireApiV1
                    .move(this.orderBy, this.checkedItem)
                    .then(() => {
                        this.moveForm = false;
                        this.$toast(this.$t('form.moveSuccess'), 'success');
                        trackEvent('营销旅程-表单-移动分组', {id: this.checkedItem});
                        this.checkedItem = [];
                        this.orderBy = -1;
                        this.getFormGroup();
                        this.getFormList();
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 取消批量删除
            cancelBulkDelete() {
                this.bulkDelete = false;
            },
            // 确认批量删除
            confirmBulkDelete() {
                this.$loading();
                QuestionnaireApiV1
                    .delForm(this.checkedItem)
                    .then(() => {
                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                        trackEvent('营销旅程-表单-删除', {id: this.checkedItem});
                        this.bulkDelete = false;
                        this.checkedItem = [];
                        this.nowPage = 1;
                        this.getFormList();
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 点击查看按钮
            viewFormAction(formId) {
                this.$router.push({name: 'questionnaireView', params: {groupId: this.selectId, id: formId}});
            },
            // 点击修改按钮
            editFormAction(id) {
                this.$loading();
                this.editForm = true;
                this.editId = id;
                QuestionnaireApiV1
                    .getFormDetail(id)
                    .then((res) => {
                        const formDetails = res.body.data.papers;
                        this.formName = formDetails.paperName;
                        formDetails.status === 1 ? this.formStatus = this.$t('form.unconfigured') : formDetails.status === 2 ? this.formStatus = this.$t('form.normal') : this.$t('form.abnormal');
                        this.formAddress = formDetails.url.trim();
                        this.imageUrl = LINKS.WECHAT_API_BASE + '/api/web-api/wechat/v1/quickMarks/downloadFormQRCode?height=500&url=' + this.formAddress + '&width=500';
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 取消修改表单
            cancelEditForm() {
                this.editForm = false;
                this.editId = '';
                this.errorText = '';
            },
            // 确认修改表单
            confirmEditForm() {
                // check表单名称
                if (this.formName === '') {
                    this.errorText = this.$t('form.formNameNotEmpty');
                    return;
                } else if (!COMMON_NAME_REGEXP.test(this.formName)) {
                    this.errorText = this.$t('form.formNames') + ' ' + this.$t('common.nameSpecial');
                    return;
                }
                this.$loading();
                QuestionnaireApiV1
                    .update(this.editId, this.formName)
                    .then(() => {
                        this.$toast(this.$t('form.editSuccess'), 'success');
                        trackEvent('营销旅程-表单-修改', {id: this.editId});
                        this.getFormList();
                        this.$loaded();
                        this.editForm = false;
                        this.formName = '';
                        this.editId = '';
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 跳转表单报告
            getFormInfo(item) {
                this.$router.push({name: 'questionnaireReport', query: {id: item.id, formSource: item.formSource}});
            },
            // 点击批量删除
            bulkDeleteAction() {
                let notDelete = false;
                if (this.checkedItem.length === 0) {
                    this.$toast(this.$t('form.selectForm'), 'warn');
                    return;
                }
                // 批量删除时不能有已发布的表单
                this.formList.forEach(item => {
                    this.checkedItem.forEach(id => {
                        if (item.id === id && (item.status === 6 || item.status === 7)) {
                            notDelete = true;
                            this.$toast(this.$t('form.cannotDelete'), 'warn');
                        }
                    });
                });
                if (notDelete) {
                    return;
                }
                this.bulkDelete = true;
            },
            // 切换查看分组表单内容
            selectGroup(group) {
                this.itemId = group.id;
                this.$router.push({
                    name: 'journeyFormManagement',
                    params: {id: this.itemId}
                });
                this.checkedItem = [];
                this.selectId = group.id;
                this.itemId = group.id;
                this.nowPage = 1;
                this.creatingNewGroup = false;
                this.keyWords = '';
                this.keyWordsTemp = '';
                this.getFormList();
            },


            // 新建/编辑
            saveNewGroup(creatdDetail) {
                if (this.isSubmit) return;
                this.isSubmit = true;
                if (creatdDetail.groupName && !COMMON_NAME_REGEXP.test(creatdDetail.groupName)) {
                    this.$toast(this.$t('common.filterName'), 'warn');
                    return false;
                }
                if (creatdDetail.optionType === 'create') {
                    QuestionnaireApiV1
                        .addGroup({name: creatdDetail.groupName, parentId: creatdDetail.parentId})
                        .then(() => {
                            this.isSubmit = false;
                            creatdDetail.groupName = '';
                            this.$refs.leftSidebar.closeNewEditModal();
                            this.$toast(this.$t('form.addSuccess'), 'success');
                            trackEvent('营销旅程-表单-新增分组', {name: creatdDetail.groupName});
                            this.getFormGroup();
                        })
                        .catch(() => {
                            this.isSubmit = false;
                            this.$loaded();
                        });
                }
                if (creatdDetail.optionType === 'edit') {
                    QuestionnaireApiV1
                        .updateGroup(this.itemId, creatdDetail.groupName, creatdDetail.parentId)
                        .then(() => {
                            this.isSubmit = false;
                            this.cancelClusterModal();
                            this.$toast(this.$t('form.folderEditSuccess'), 'success');
                            this.$refs.leftSidebar.closeNewEditModal();
                            trackEvent('营销旅程-表单-修改分组', {id: this.itemId});
                            this.getFormGroup();
                        })
                        .catch(() => {
                            this.isSubmit = false;
                            this.$loaded();
                        });
                }
            },
            // 删除分组
            deleteGroup(groupId) {
                if (this.isSubmit) return;
                this.isSubmit = true;
                QuestionnaireApiV1
                    .delGroup(groupId)
                    .then(() => {
                        this.isShowDelete = false;
                        this.$toast(this.$t('form.folderDeleteSuccess'), 'success');
                        trackEvent('营销旅程-表单-删除分组', {id: groupId});
                        this.$router.replace({
                            name: 'journeyFormManagement',
                            params: {id: 0}
                        });
                        this.selectId = 0;
                        this.nowPage = 1;
                        this.itemId = 0;
                        this.getFormGroup();
                        this.getFormList();
                        this.isSubmit = false;
                    })
                    .catch(() => {
                        this.isSubmit = false;
                        this.$loaded();
                    });
            },
            // 编辑分组后清空数据
            cancelClusterModal() {
                this.errorText = '';
                this.editingName = '';
                this.creatingNewGroup = false;
            },
            // 分页操作
            handlePage(e) {
                this.nowPage = e;
                this.getFormList();
            },
            // 重置页面参数
            changeQuery(number) {
                const oldPageNo = ~~this.$route.query.page_number;
                const oldFormSource = this.$route.query.formSource;
                // Fix NavigationDuplicated: Avoided redundant navigation to current location
                if (this.nowPage !== oldPageNo || this.formSource !== oldFormSource) {
                    this.$router.replace({
                        name: 'journeyFormManagement',
                        params: this.$route.params.id ? this.$route.params : {id: 0},
                        query: {
                            page_number: number,
                            formSource: this.formSource
                        }
                    });
                }
            },
            // 删除表单
            deleteAction(id, status) {
                if (status !== 6) {
                    this.$confirm(this.$t('common.delete'), this.$t('form.deleteTip'))
                        .then(sure => {
                            if (sure) {
                                QuestionnaireApiV1
                                    .delForm([id])
                                    .then(() => {
                                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                                        this.nowPage = 1;
                                        this.getFormList();
                                        this.$loaded();
                                    })
                                    .catch(() => {
                                        this.$loaded();
                                    });
                            }
                        });
                }
            },
            // 开始、暂定表单
            changeFormStatus(item) {
                QuestionnaireApiV1
                    .updateFormStatus(item.id, item.status === 7 ? 8 : 7)
                    .then(() => {
                        this.nowPage = 1;
                        this.getFormList();
                    });
            },
            // 复制表单
            copyForm(paperId) {
                QuestionnaireApiV1
                    .copyDmtForm(paperId)
                    .then(res => {
                        this.$toast(res.body.message, 'success');
                        this.nowPage = 1;
                        this.getFormList();
                    });
            },
            // 编辑标准表单
            editStandardFormAction(item) {

                this.$router.push({path: `edit/${item.groupId}`, query: {id: item.id, groupId: item.groupId}});
            },
            // 搜索表单
            handleSearch() {
                this.keyWords = this.keyWordsTemp;
            },
            // 自定义表单配置
            async customize(item) {
                // 检查数据权限 
                const checkPass = await QuestionnaireApiAuth
                    .downloadDetailAccess({ paperId: item.id, type: 19 })
                    .then(({ body: { data: { isAccess } } }) => isAccess);
                if (!checkPass) {
                    this.$toast(this.$t('material.sharingVerifyOption'), 'warn');
                    return;
                }
                this.$router.push({path: `customize/${item.id}`, query: {id: item.id}});
            },
            // 全选当前页数据
            choosePageData() {
                this.checkedItem = this.formList.map(item => item.id);
            },
            // 清空选中数据
            clearChoose() {
                this.checkedItem = [];
            }
        },
    };
</script>
<style type="text/scss" lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .questionnaire-list {
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
                width: 312px;
                max-width: 312px;
                height: $option-height;
                line-height: $option-height - 2px;
                border: 1px solid $form-border;
                text-indent: .8em;
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
                    @include box-shadow(0 1px 3px rgba($theme, .35));

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
                width: 312px;
                max-width: 312px;
                max-height: 300px;
                background-color: white;
                border: 1px solid $border-color;
                border-top: none;
                z-index: $index-container;
            }
        }
        .questionnaire-content {
            display: flex;
        }
        .right-list {
            flex: 1;
            padding: 0 16px;
            float: left;
            background-color: white;
            box-sizing: border-box;
            height: calc(100vh - #{$header-height + $toolbar-height + 24px});
            overflow: auto;
            @include transition(width .5s);

            .list-title {
                padding: 16px 0;
                color: $color-light-content;

                .btn-margin {
                    margin-right: 5px;
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
                        margin-top: ($input-field-height - 16px)/2;
                        fill: currentColor;
                    }

                    .hidden-menu {
                        top: $input-field-height;
                        left: 0;
                        @include transform-origin(left top);

                        .btn {
                            display: block;
                            color: $color-light-content;
                            text-align: left;
                            min-width: 100px;
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

                .questionnaire_total {
                    margin-right: 20px;
                    color: $color-title;
                }

                .search-box {
                    margin-right: 24px;
                }
            }

            .action-icon:first-child {
                margin-left: 0;
            }

            .pager-wrapper {
                display: flex;
                justify-content: space-between;

                .amount {
                    line-height: 64px;
                }
            }
        }

        .qr-code {
            width: 200px;
            height: auto;
            margin-top: 1em;
        }

        .questionnaire-list-table {
            table-layout: fixed;
            width: 100%;
            margin-top: 16px;
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

                &:not([width]) {
                    width: 100%;
                }

                &:last-child {
                    width: 140px;
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

            .name-ellipsis {
                overflow: hidden;
                text-overflow: inherit;
                word-break: break-all;
                white-space: normal;
            }

            td {
                overflow: visible;
            }

            .word-wrapping {
                white-space: normal;
            }

            .btn {
                padding: 0;
                &[disabled] {
                    .action-icon {
                        cursor: not-allowed;
                    }
                }
            }

            /* tr {
                height: 40px;
                border-bottom: 1px solid $border-color;

                &:first-child {
                    background-color: $select-bg;
                }

                td:first-child {
                    text-align: center;
                }

                &:not(:first-child):hover {
                    background-color: $title-bg;
                }
            } */

            .action-icon {
                width: 16px;
                height: 16px;
            }

            .edit {
                button:first-child {
                    svg {
                        margin-left: 0;
                    }
                }

                .btn + .btn {
                    margin: 0;
                }
            }

            .form-actions {
                display: flex;
                align-items: center;

                .btn {
                    display: inline-block;
                    padding-right: 5px;
                }

                .form-hidden-actions {
                    position: relative;

                    .hidden-menu {
                        position: absolute;
                        top: 0;
                        left: -85px;

                        .btn {
                            color: $color-light-content;
                        }
                    }
                }

                .btn-custom-form {
                    .icon-custom {
                        color: $theme;
                    }
                }
            }
        }
    }
</style>