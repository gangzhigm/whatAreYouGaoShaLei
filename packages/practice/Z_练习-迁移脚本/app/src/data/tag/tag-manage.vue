<template>
    <div class="content-container tag-manage">
        <div class="content-view">
            <crumbs/>
        </div>
        <div class="setRule" v-if="!ruleStatus">
            <div class="content-view set-rule-word">
                {{'tag.notUsing' | t}}
            </div>
            <div class="close" @click="ruleStatus=true"><i class="icon icon-close"></i></div>
        </div>
        <div class="tag-content content-view">
            <!--左侧导航-->
            <left-sidebar :SideTreeData="groups" :fixedList="fixedGroups"
                        ref="leftSidebar"
                        @select="showLabels"
                        :allTreeData="totalTreeArry"
                        :moduleRange="'tagManageModule'"
                        @sort="getSortType" @modify="editGroup"
                        @delete="delGroup" @traverseOpen="traverseOpen"></left-sidebar>
            <!-- 标签内容 -->
            <div class="tag-detail right-group-content">
                <inline-loading v-if="labelsLoading"/>
                <template v-else>
                    <div class="detail-btn">
                        <!--http://jira.qdum.com/browse/DMARTECH-8669 中删掉此功能-->
                        <!--<span class="theme-text" v-if="this.$route.query.groupId != -3">
                            {{'tag.viewSubgroups' | t}}
                        </span>
                        <switch-button :value="isShow" @input="showSub(group)"
                                       :disabled="storeLoading || group.id === 1 || group.level === 3"
                                       v-if="this.$route.query.groupId != -3"/>-->
                        <button class="btn btn-md btn-theme pull-right" @click="createTag"
                                :disabled="$has('datacentre_label_add_label') || group.id === ''">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-plus"></use>
                            </svg>
                            {{'tag.addLabel' | t}}
                        </button>
                        <div class="pull-right search-box">
                            <input type="text" v-model.trim="searchName" :placeholder="$t('tag.keyword')"
                                   @keydown.enter="searchLabels($route.query.groupId)">
                            <svg aria-hidden="true" @click="searchLabels($route.query.groupId)">
                                <use xlink:href="#icon-search"></use>
                            </svg>
                        </div>
                    </div>
                    <div class="detail-msg">
                        <!--批量操作-->
                        <div class="batch hidden-menu-trigger">
                            <svg aria-hidden="true" class="all-tag">
                                <use xlink:href="#icon-batch"></use>
                            </svg>
                            <span class="light-content-text">{{'tag.batchOperation' | t}}</span>
                            <ul class="hidden-menu">
                                <li class="tag-btn">
                                    <button class="btn tag-btn-click" :disabled="$has('datacentre_label_batch_move')"
                                            @click="batchMove">
                                        {{'tag.moveGroup' | t}}
                                    </button>
                                </li>
                                <li class="tag-btn">
                                    <button class="btn tag-btn-click"
                                            :disabled="$has('datacentre_label_delete_datacentre')"
                                            @click="batchDelete">{{'tag.tatchDelete' | t}}
                                    </button>
                                </li>
                                <li class="tag-btn" v-if="this.$route.query.groupId != -3">
                                    <button class="btn tag-btn-click" :disabled="$has('datacentre_label_batch_conceal')"
                                            @click="batchHideShow(2,'batch')">
                                        {{'tag.batchHide' | t}}
                                    </button>
                                </li>
                                <li class="tag-btn">
                                    <button class="btn tag-btn-click" :disabled="$has('datacentre_label_batch_conceal')"
                                            @click="batchHideShow(1,'batch')">
                                        {{'tag.batchShow' | t}}
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <span class="light-content-text">{{'tag.now' | t}}【{{ currentGroupName }}】{{'tag.total' | t}}
                            <span class="theme-text">{{totalRow}}</span>
                            {{'tag.labelsSelect' | t}}
                            <span class="theme-text"> {{checkedCount}} </span>
                            {{'tag.ge' | t}}
                        </span>
                    </div>

                    <table class="simplify-table tag-table">
                        <tr>
                            <th v-for="th in thList" :width="th.width" :key="th.id">
                                <div class="tag-name">
                                    {{th.name}}
                                    <span v-if="th.id === 7 && $route.query.groupId !== -3" :title="tagStatusText">
                                        ({{tagStatusText}})
                                    </span>
                                </div>
                                <!--全选-->
                                <div class="hidden-menu-trigger tag-action-menu" v-if="th.id === 1">
                                    <svg aria-hidden="true" class="menu-icon">
                                        <use xlink:href="#icon-menu"></use>
                                    </svg>
                                    <ul class="hidden-menu">
                                        <li @click="checkData(0)">{{'tag.allSelectedNowPage' | t}}</li>
                                        <li @click="checkData(1)">{{'tag.allSelected' | t}}</li>
                                        <li @click="clearData">{{'tag.clearAll' | t}}</li>
                                    </ul>
                                </div>
                                <!--所在分组-->
                                <div class="filter-box" v-if="th.id === 4" v-blur="closeGroup">
                                    <svg class="filter-icon"
                                         aria-hidden="true"
                                         @click="showGroup">
                                        <use v-bind:xlink:href="'#icon-' + (chooseTagGroup ? 'shaixuan-tianchong' : 'shaixuan')"></use>
                                    </svg>
                                    <transition name="drop">
                                        <div class="drop-list" v-if="chooseTagGroup">
                                            <div class="search-tree-wrapper">
                                                <search-tree :searchTreeData="curTreeDataList"
                                                             :treeActiveId="curSelectedGroup.id"
                                                             @getTreeAct='getTreeActByGroup'
                                                             :action="true"
                                                             :levelStage="true"
                                                             :moduleRange="'tagManageModule'"
                                                             :show-radio="true"/>
                                            </div>
                                        </div>
                                    </transition>
                                </div>
                                <!--是否隐藏标签-->
                                <div class="filter-box" v-if="th.id === 7" v-blur="closeStatus">
                                    <svg class="filter-icon" :class="{disabled: hideDisabled}" aria-hidden="true"
                                         @click="showTagStatus">
                                        <use v-bind:xlink:href="'#icon-' + (chooseTagStatus ? 'shaixuan-tianchong' : 'shaixuan')"></use>
                                    </svg>
                                    <transition name="drop">
                                        <div class="drop-list" v-if="chooseTagStatus">
                                            <radio class="drop-radio" v-model="tagStatus" :source="2">{{'tag.all' |
                                                t}}
                                            </radio>
                                            <radio class="drop-radio" v-model="tagStatus" :source="1">{{'common.yes' |
                                                t}}
                                            </radio>
                                            <radio class="drop-radio" v-model="tagStatus" :source="0">{{'common.no' |
                                                t}}
                                            </radio>
                                        </div>
                                    </transition>
                                </div>
                                <!--为空和0：更新时间倒叙查询，1更新时间正序，2创建时间倒叙，3创建时间正序-->
                                <!--更新时间-->
                                <template v-if="th.id === 8">
                                    <button type="button" class="table-sort-button" @click="listSort('updateDate')"
                                            :title="$t('material.sortUpdateData')">
                                        <svg aria-hidden="true"
                                             class="asc"
                                             :class="{active: sortValue === 'updateDate' && sortOrder === 'asc'}">
                                            <use xlink:href="#icon-caret-down"></use>
                                        </svg>
                                        <svg aria-hidden="true"
                                             class="desc"
                                             :class="{active: sortValue === 'updateDate' && sortOrder === 'desc'}">
                                            <use xlink:href="#icon-caret-down"></use>
                                        </svg>
                                    </button>
                                </template>
                                <!--创建时间-->
                                <template v-if="th.id === 9">
                                    <button type="button" class="table-sort-button" @click="listSort('createDate')"
                                            :title="$t('material.sortCreateData')">
                                        <svg aria-hidden="true"
                                             class="asc"
                                             :class="{active: sortValue === 'createDate' && sortOrder === 'asc'}">
                                            <use xlink:href="#icon-caret-down"></use>
                                        </svg>
                                        <svg aria-hidden="true"
                                             class="desc"
                                             :class="{active: sortValue === 'createDate' && sortOrder === 'desc'}">
                                            <use xlink:href="#icon-caret-down"></use>
                                        </svg>
                                    </button>
                                </template>
                            </th>
                        </tr>
                        <tr v-if="labels.length === 0">
                            <td colspan="11">
                                <list-search-empty/>
                            </td>
                        </tr>
                        <tr v-else v-for="label in labels" :key="label.id">
                            <td @click.stop>
                                <checkbox v-model="checkedIds" :source="label.id" @input="toggleLabel(label.id)" />
                            </td>
                            <td>{{label.id}}</td>
                            <td><span class="tag-name">{{label.name}}</span></td>
                            <td>{{label.groupName}}</td>
                            <td>{{label.count}}</td>
                            <td>
                                <!--进度-->
                                <template v-if="label.progress">
                                    <div class="progress-bar">
                                        <div class="progress-bar__outer">
                                            <div class="progress-bar__inner" :style="{width: label.progress,
                                             backgroundColor: label.progress == '100%' ? '#29bdfb' : '#f26565'}"></div>
                                        </div>
                                    </div>
                                    {{label.progress}}
                                </template>
                                <div v-else>/</div>
                            </td>
                            <td :class="{themeRed: label.isConceal === 1}">
                                <span v-if="label.isConceal === 0">{{'common.no' | t}}</span>
                                <span v-if="label.isConceal === 1">{{'common.yes' | t}}</span>
                            </td>
                            <td>{{label.updateDate}}</td>
                            <td>{{label.createDate}}</td>
                            <td>{{label.createName}}</td>
                            <td>
                                <!--操作-->
                                <button class="btn tag-action-icon" v-title="$t('tag.settingRules')" 
                                        :disabled="$has('datacentre_label_edit_rule')"
                                        @click.stop="setRules(label)">
                                    <svg aria-hidden="true" class="icon-round-pencil"
                                         :class="{'icon-disable': $has('datacentre_label_edit_rule')}">
                                        <use xlink:href="#icon-round-pencil" :title="$t('tag.settingRules')"></use>
                                    </svg>
                                </button>
                                <button class="btn tag-action-icon" v-title="$t('tag.recalcuation')" 
                                        :disabled="$has('datacentre_label_recount_label')"
                                         @click.stop="reCount(label)">
                                    <svg aria-hidden="true" class="icon-refresh"
                                         :class="{'icon-disable': $has('datacentre_label_recount_label')}">
                                        <use xlink:href="#icon-refresh" :title="$t('tag.recalcuation')"></use>
                                    </svg>
                                </button>
                                <div class="tag-action-icon hidden-menu-trigger">
                                    <svg aria-hidden="true" class="more-icon">
                                        <use xlink:href="#icon-more"></use>
                                    </svg>
                                    <ul class="hidden-menu">
                                        <li class="tag-btn">
                                            <button class="btn tag-btn-click"
                                                    :disabled="$has('datacentre_label_rename_label')"
                                                    @click.stop="editTag(label)">{{'tag.reName' | t}}
                                            </button>
                                        </li>
                                        <li class="tag-btn">
                                            <button class="btn tag-btn-click"
                                                    :disabled="$has('datacentre_label_move_group')"
                                                    @click.stop="showMove(label.id)">{{'tag.moveGroup' | t}}
                                            </button>
                                        </li>
                                        <li class="tag-btn"
                                            @click="hiddenOrShow(label.isConceal,label.id,'single')">
                                            <button class="btn tag-btn-click"
                                                    :disabled="$has('datacentre_label_one_conceal')"
                                                    v-text="label.isConceal === 1 ? $t('tag.setDisplay') : $t('contact.makeHidden')"
                                                    @click="hiddenOrShow(label.isConceal,label.id,'single')"></button>
                                        </li>
                                        <li class="tag-btn">
                                            <button class="btn tag-btn-click"
                                                    :disabled="$has('datacentre_label_log_label')"
                                                    @click.stop="showJournal(label)">{{'tag.journal' | t}}
                                            </button>
                                        </li>
                                        <li class="tag-btn">
                                            <button class="btn tag-btn-click"
                                                    :disabled="$has('datacentre_label_delete_label')"
                                                    @click.stop="deleteLabel(label.id)">{{'tag.delete' | t}}
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    </table>
                    <pager v-if="labels.length > 0" :now="pageNow" :total="totalPage" @page="toPage"/>
                </template>
            </div>
        </div>

        <!-- 标签重命名 新建标签 -->
        <modal v-if="isEdit" :title="label.id ? $t('tag.labelRename') : $t('tag.addLabel')" @close="cancelTag">
            <div class="form-field">
                <label for="title" class="label">{{'tag.name' | t}}</label>
                <input class="input name-input" :class="{error: labelNameErr}" type="text" id="title"
                       v-model.trim="label.updateName" :placeholder="$t('tag.inputName')"
                       @click="labelNameErr = ''" maxlength="255" v-title:top.warn.line="labelNameErr">
            </div>
            <!-- 选择分组 -->
            <div class="form-field choose-parent-wrapper" v-if="chooseGroupShow">
                <label class="label placeholder" for="use">{{'material.targetGroup' | t}}</label>
                <div class="choose-parent" @click.stop>
                    <input type="text" class="input hg" id="use" :placeholder="this.$t('tag.selectGroup')"
                           v-model="parentGroupName" readonly @click.stop="readyCheckGroup"/>
                    <svg class="icon select-icon" aria-hidden="true" width="14" height="14"
                         @click="readyCheckGroup">
                        <use xlink:href="#icon-arrow-down"></use>
                    </svg>
                    <div class="search-tree-wrapper" v-if="groupSelectShow">
                        <search-tree :searchTreeData="totalTreeArry" :treeActiveId="treeActiveId"
                                     @getTreeAct='getTreeAct' :action="false" :levelStage="true"
                                     :moduleRange="'tagManageModule'"></search-tree>
                    </div>
                </div>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-white" :value="$t('common.cancel')"
                       @click="cancelTag">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.save')"
                       @click="saveTag(label)">
            </template>
        </modal>

        <!-- 编辑规则 -->
        <modal size="sl" v-if="isRule" :title="$t('tag.setRule') + label.name" @close="cancelSetRule">
            <rules :conditions="ruleContent" :label="label" @add="addCustomerTag" @move="moveCustomerTag"></rules>
        </modal>

        <!-- 移至分组 -->
        <modal v-if="isMove" :title="$t('tag.moveGroup')" @close="isMoveClose">
            <div class="form-field choose-parent-wrapper">
                <label class="label placeholder" for="use">{{'material.targetGroup' | t}}</label>
                <div class="choose-parent" @click.stop>
                    <input type="text" class="input hg" id="use" :placeholder="this.$t('tag.selectGroup')"
                           v-model="parentGroupName" readonly @click.stop="readyCheckGroup"/>
                    <svg class="icon select-icon" aria-hidden="true" width="14" height="14"
                         @click="readyCheckGroup">
                        <use xlink:href="#icon-arrow-down"></use>
                    </svg>
                    <div class="search-tree-wrapper" v-if="groupSelectShow">
                        <search-tree :searchTreeData="totalTreeArry" :treeActiveId="treeActiveId"
                                     @getTreeAct="getTreeAct" :action="false" :levelStage="true"
                                     :moduleRange="'tagManageModule'"></search-tree>
                    </div>
                </div>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-white" :value="$t('common.cancel')"
                       @click="isMoveClose">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.save')"
                       @click="saveMove"
                       :disabled="group.name === $t('tag.all') || group.id === 0 || parentGroupName === ''">
            </template>
        </modal>

        <!-- 日志 -->
        <modal v-if="journalLabel.id" :title="$t('tag.journal')" @close="closeJournal" size="lg">
            <div class="log-tips">{{'tag.remind' | t}}</div>
            <div class="simplify-table auto-width">
                <table>
                    <thead>
                    <tr class="no-hover">
                        <td>{{'time.date' | t}}</td>
                        <td>{{'tag.content' | t}}</td>
                        <td>{{'tag.schedule' | t}}</td>
                        <td>{{'tag.proTarget' | t}}</td>
                        <td>{{'tag.succTarget' | t}}</td>
                        <td>{{'tag.handlingErrors' | t}}
                            <i class="icon icon-yiwen1" v-title:bottom="$t('tag.errorExplain')"></i>
                        </td>
                        <td>{{'time.duration' | t}}</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-if="journalLoading || logDtoList.length === 0">
                        <td class="slim-cell" colspan="7">
                            <inline-loading v-if="journalLoading"/>
                            <list-empty v-else/>
                        </td>
                    </tr>
                    <tr v-else v-for="(log,i) in logDtoList" :key="i">
                        <td>{{log.startTime}}</td>
                        <td>
                            <span v-show="log.typeName === '1'">{{'tag.batchAdd' | t}}</span>
                            <span v-show="log.typeName === '2'">{{'tag.batchDel' | t}}</span>
                            <span v-show="log.typeName === '3'">{{'tag.uploadTag' | t}}</span>
                            <div class="hidden-menu-trigger condition-menu">
                                <span class="action-text" v-show="log.typeName === '1' || log.typeName === '2'">({{'tag.condition' | t}})</span>
                                <span class="action-text"
                                      v-show="log.typeName === '3'">({{'tag.uploadDetails' | t}})</span>
                                <ul class="hidden-menu">
                                    <li>
                                        <span>{{'tag.tagName' | t}}：{{log.name}}</span>
                                    </li>
                                    <template v-if="log.typeName === '3'">
                                        <li>
                                            <span>{{'tag.toUpload' | t}}：{{log.detailContent}}</span>
                                        </li>
                                        <li>
                                            <span>{{'tag.uploadTime' | t}}：{{log.startTime}}</span>
                                        </li>
                                    </template>
                                    <li v-show="log.typeName === '1' || log.typeName === '2'">
                                        <span>{{'tag.condition' | t}}：</span>
                                        <span>{{'common.total' | t}}{{log.count}}{{'tag.tips' | t}}</span>
                                        <div class="condition" v-for="(cause,index) in log.causes" :key="index">
                                            <p v-show="index !== 0">
                                                {{(cause.act === 'and' ? 'common.and' : 'common.or') | t}}
                                            </p>
                                            <div class="rules" v-for="(tip,rIndex) in cause.rules" :key="rIndex">
                                                <p v-show="rIndex !== 0 && tip.act === 'and'">{{'common.and' | t}}</p>
                                                <p v-show="rIndex !== 0 && tip.act === 'or'">{{'common.or' | t}}</p>
                                                <!-- 相对时间 -->
                                                <p v-if="tip.operation === 'currentRelativeTime'">
                                                    {{lang === 'zh-CN'?tip.name:tip.field_name}}&nbsp;{{tip.operatorCn}}&nbsp;
                                                    {{'tag.in' | t}}{{tip.value}}{{'tag.day' | t}}&nbsp;
                                                    {{tip.relative_type === 1 ? $t('tag.before') : $t('tag.within')}}
                                                </p>
                                                <!-- 绝对时间 -->
                                                <p v-else-if="tip.operation === 'absoluteTime'">
                                                    {{lang === 'zh-CN'?tip.name:tip.field_name}}&nbsp;{{tip.operatorCn}}&nbsp;
                                                    {{'tag.in' | t}}{{tip.value.start}}{{'common.to' |
                                                    t}}{{tip.value.end}}&nbsp;
                                                    {{'tag.between' | t}}
                                                </p>
                                                <p v-else>
                                                    {{lang === 'zh-CN'?tip.name:tip.field_name}}&nbsp;{{tip.operatorCn}}&nbsp;{{tip.value}}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </td>
                        <template v-if="log.typeName !== '3'">
                            <td>{{log.progress}}%</td>
                            <td>{{log.totalCount}}</td>
                            <td>
                                <span>{{log.finishCount}}</span>
                                <a :href="log.successFileUrl" class="action-text" target="_blank"
                                   v-show="parseInt(log.progress) === 100 && log.totalCount > 0">
                                    {{'common.download' | t}}
                                </a>
                            </td>
                            <td>{{log.errorCount}}</td>
                            <td>
                                {{log.days}} {{'tag.day' | t}}
                                {{log.hours}} {{'tag.hours' | t}}
                                {{log.minutes}} {{'tag.minutes' | t}}
                            </td>
                        </template>
                        <template v-else>
                            <td>
                                <router-link class="action-text" target="_blank"
                                             :to="{name: 'sftpDetails', query: {id: log.fileId}}">
                                    {{'tag.view' | t}}
                                </router-link>
                            </td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                        </template>
                    </tr>
                    </tbody>
                </table>
                <pager v-if="logDtoList.length > 0"
                       :now="journalPageNumber"
                       :total="journalTotalPage"
                       @page="toJournalPage">
                    {{logDtoList.length > 0 ? 1 : 0}}-{{logDtoList.length}}{{'tag.logs' | t}},
                    {{'common.total' | t}}&nbsp;{{logDtoList.length}}&nbsp;{{'tag.logs' | t}}&nbsp;
                </pager>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-white" :value="$t('common.close')"
                       @click="closeJournal">
            </template>
        </modal>
        <!-- 隐藏设置-->
        <modal v-if="hiddenModal" :title="$t('common.remind')" @close="hiddenModal = false">
            <div>
                <span>{{labelSet}}</span>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-white" :value="$t('common.cancel')"
                       @click="hiddenModal = false">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.save')" @click="sureLabelHideShow">
            </template>
        </modal>

        <!-- 删除标签 -->
        <modal v-if="delTagsFlag" :title="$t('tag.sureDel')" @close="delTagsFlag = false">
            <div>
                <p class="del-tag-title">{{'tag.deleteConfirm1' | t}}</p>
                {{'tag.deleteConfirm2' | t}}<br><br>{{'tag.deleteConfirm3' | t}}
                <p class="sure-del del-tag-title">{{'tag.deleteConfirm4' | t}}</p>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-white" :value="$t('common.cancel')"
                       @click="delTagsFlag = false">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" @click="sureDelTags">
            </template>
        </modal>
    </div>
</template>
<script type="text/babel">
    import { ContactApiV1 } from '@/api';
    import rules from './rules.vue';
    import tagTree from './tag-tree.vue';
    import {trackEvent} from '@/monitor';
    import {getDateInstance} from '@/common/utils/dateUtils';
    import {I18N_STORE_NAME} from '@/locales';
    import Bus from '../../common/components/group-tree/bus.js';
    import {TAGANDWEBPAGE_NAME_REGEXP} from '@/common/utils/regs';
    import { mapState } from 'vuex';
    import debounce from 'lodash/debounce';

    export default {
        name: 'tagManage',
        components: {
            rules,
            tagTree,
        },
        data() {
            return {
                ruleStatus: true, // 是否可以打标签
                searchName: '',
                // 页码
                pageNow: 1,
                totalPage: 1,
                totalRow: 0,

                // 标签分组
                groups: [], // 标签分组
                group: {}, // 分组
                fromGroupId: 0, // 标签移动前的分组的id
                thList: [
                    {id: 1, name: '', width: 40},
                    {id: 2, name: 'ID'},
                    {id: 3, name: this.$t('tag.tagName')},
                    {id: 4, name: this.$t('tag.group')},
                    {id: 5, name: this.$t('tag.count')},
                    {id: 6, name: this.$t('tag.tagTitle')},
                    {id: 7, name: this.$t('tag.isHiddenTag'), width: 140},
                    {id: 8, name: this.$t('tag.updateTime')},
                    {id: 9, name: this.$t('tag.createDate')},
                    {id: 10, name: this.$t('tag.creator')},
                    {id: 11, name: this.$t('tag.operate')},
                ],
                chooseTagStatus: false,// 筛选-是否隐藏标签
                tagStatus: 2,   // 标签状态 0显示，1隐藏，2全部
                tagStatusText: this.$t('tag.all'), // 标签状态text
                // 筛选-所在分组
                all: {id: -4, name: this.$t('tag.all')}, // 全部
                chooseTagGroup: false,// 筛选-所在分组
                curTreeDataList: [],// 筛选-所在分组-分组列表
                curSelectedGroup: {}, // 筛选-所在分组-选中的分组
                sortOrder: 'desc', // 排序方式 desc、asc
                sortValue: '', // 排序字段 updateDate、createDate

                // 标签
                isEdit: false, // add edit
                checkedIds: [],// 选中的标签ids
                cancelIds: [], // 取消的ids
                isRule: false, // 设置规则
                labels: [], // 标签列表
                labelsLoading: true,
                // 进行中的标签 {id: {typeName, progress}}
                processLabelsMap: {},
                //标签
                label: {
                    name: '',   //标签name
                    updateDate: '', //更新时间
                    count: 0,   //重新计算
                    delStatus: 0,   //标签可否设置状态
                    updateName: '', //更新后name
                },
                batchType: 0, // 批量操作类型 0：全选当前页；1：全选所有页
                isShow: false, // 查看子分组下标签
                ids: [], // 标签ids
                labelNameErr: '',// 错误提示
                isMove: false, // 移至分组
                ruleContent: [], // 设置规则的内容

                attributes: [], //属性list
                operators: [],
                logDtoList: [],//日志列表
                journalLoading: true, //日志加载
                journalPageNumber: 1,   //  日志pageNumber
                journalTotalPage: 1,    //日志totalPage
                journalLabel: {},//存当前操作的labels对象

                currentGroupName: this.$t('tag.allLabel'),//当前分组name

                // 树形数据
                totalTreeArry: [],
                allTreeData: '',
                fixedGroups: [//固定menu
                    {id: 0, fieldName: 'allCount', name: this.$t('tag.allLabel'), type: 'tagManage'},
                    {id: -2, fieldName: 'createCount', name: this.$t('tag.iCreated'), type: 'tagManage'},
                    {id: -3, fieldName: 'hiddenCount', name: this.$t('tag.hiddenTags'), type: 'tagManage'},
                ],
                sortType: 1,//排序 1：按创建时间降序 2：按创建时间升序 3：按更新时间降序 4：按更新时间升序 5：按名称降序 6：按名称生序

                parentGroupName: '',
                groupSelectShow: false,
                treeActiveId: '',    //对应分组active高亮
                chooseGroupShow: false,//新建标签时可选择上级，重命名时不可选择上级

                //标签隐藏
                labelType: '',//请求标签列表是。''为全部标签，0显示，1隐藏
                hiddenModal: false, //设置显隐标签弹窗
                labelSet: '',   //是否将label设置为隐藏/显示提示语
                singleLabelId: '',//标签隐藏/显示 (单个)id
                singleOrBatch: '',//单一操作'single'，批量操作 'batch'
                hideShowType: '',//1 显示 2隐藏
                labelIds: [],//备注：在新建联系人时新建标签时可选择隐藏，表示标签ids[]全量,在此处的批量隐藏/显示重传[]即可
                delTagsFlag: false, // 标签删除确认弹窗
                hideDisabled: false, // 筛选 是否隐藏标签 是否可点击
                isSubmit: false
            };
        },

        mounted() {
            //首次加载页面时清空group
            this.$router.replace({name: 'tagManage', query: {groupId: 0}});
            //点击其他地方下拉菜单收起
            window.addEventListener('click', this.eventListener);

            this.fetchGroups();
            this.group = this.fixedGroups[0];
            this.fetchLabels();
            // 是否可以打标签
            ContactApiV1.getPageStatus()
                .then(res => {
                    this.ruleStatus = res.body.data.ruleStatus;
                });
            /**
             * 递归树形菜单
             * singleMenu
             * 点击某个分组
             * groupData所点击的分组详情数据
             */
            Bus.$on('singleMenu', tagGroupData => {
                if (tagGroupData.moduleRange === 'tagManageModule') {
                    this.parentGroupName = tagGroupData.groupData.name;
                    if (tagGroupData.action) {
                        this.currentGroupName = tagGroupData.groupData.name;
                        this.showLabels(tagGroupData.groupData);
                    }
                }
            });
            //华为埋码-用户数据管理- 用户个性化标签管理
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P120319943BBBCD');
            }
        },

        destroyed() {
            window.removeEventListener('click', this.eventListener);
        },

        watch: {
            // 筛选-所在分组树级数据
            curTreeDataList() {
                if (this.curTreeDataList.length <= 0) return;
                // 筛选-所在分组-默认选中第一个
                this.curSelectedGroup = this.curTreeDataList[0];
                const fixedGroupIds = this.fixedGroups.map(fixedGroup => fixedGroup.id);
                if (fixedGroupIds.includes(this.group.id)) {
                    this.isShow = this.curSelectedGroup.id === this.all.id;
                }
            },
            // 筛选标签状态 0显示 1隐藏
            tagStatus() {
                switch (this.tagStatus) {
                    case 2:
                        this.labelType = '';
                        this.tagStatusText = this.$t('tag.all');
                        break;
                    case 0:
                        this.labelType = 0;
                        this.tagStatusText = this.$t('common.no');
                        break;
                    case 1:
                        this.labelType = 1;
                        this.tagStatusText = this.$t('common.yes');
                        break;
                }
                this.pageNow = 1;
                let groupId,
                    isShow;
                // -2 我创建的
                if (Number(this.$route.query.groupId) === -2) {
                    groupId = this.$route.query.groupId;
                    isShow = true;
                } else {
                    this.searchGroupId = null;
                    // 筛选-所在分组-选中"全部"
                    if (this.curSelectedGroup.id === this.all.id) {
                        groupId = this.$route.query.groupId;
                        isShow = true;
                    } else {
                        isShow = false;
                        groupId = this.curSelectedGroup.id;
                    }
                }
                this.fetchLabels(groupId, isShow);
            },
        },
        computed: {
            ...mapState({
                // 语言状态
                lang: state => state[I18N_STORE_NAME].lang,
                storeLoading: state => state.loading
            }),
            // 分组id=-2时，筛选所在分组-当前选中的所在分组的id
            searchGroupId: {
                get() {
                    if (Number(this.$route.query.groupId) === -2 && this.curSelectedGroup.id !== this.all.id) {
                        return this.curSelectedGroup.id;
                    }
                    return null;
                },
                set(newVal) {
                    return newVal;
                }
            },
            // 选中的标签数量
            checkedCount() {
                return this.batchType === 0
                    ? this.checkedIds.length
                    : (this.cancelIds.length > 0 ? this.totalRow - this.cancelIds.length : this.totalRow);
            },
            user() {
                return this.$store.state.user;
            },
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            }
        },

        methods: {
            // 显示 所在分组筛选
            showGroup() {
                if (this.storeLoading || this.labelsLoading) return;
                // 标签列表-筛选-所在分组："全部分组" 不可选
                let firstGroup = this.curTreeDataList.filter(group => group.default === 2)[0];
                if (firstGroup) firstGroup.noSelect = false;
                this.chooseTagGroup = !this.chooseTagGroup;
            },
            // 关闭 所在分组筛选
            closeGroup() {
                this.chooseTagGroup = false;
            },
            // 是否隐藏标签筛选
            showTagStatus() {
                if (this.$route.query.groupId === -3) return;
                this.chooseTagStatus = !this.chooseTagStatus;
            },
            // 关闭 是否隐藏标签筛选
            closeStatus() {
                this.chooseTagStatus = false;
            },
            /**
             * 列表排序
             * @param sortValue 升降排序
             */
            listSort(sortValue) {
                this.sortValue = sortValue;
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                this.pageNow = 1;
                this.fetchLabels();
            },

            /**
             * 日志弹窗
             * @param label 标签
             */
            showJournal(label) {
                this.$set(this.$data, 'journalLabel', label);
                this.journalLoading = true;
                this.journalPageNumber = 1;
                this.journalTotalPage = 1;
                this.logDtoList = [];

                // 获取自定义字段
                const userAttrsRequest = ContactApiV1
                    .customWorld(0)
                    .then(({body: {data: {customerFieldList}}}) => customerFieldList);

                // 订单属性
                const orderAttrsRequest = ContactApiV1
                    .customWorld(1)
                    .then(({body: {data: {customerFieldList}}}) => customerFieldList);

                // 商品属性
                const commodityAttrsRequest = ContactApiV1
                    .customWorld(2)
                    .then(({body: {data: {customerFieldList}}}) => customerFieldList);

                // 获取字段关系
                const relationsRequest = ContactApiV1
                    .relation()
                    .then(({body: {data: {operators}}}) => [...operators.dat, ...operators.str, ...operators.num]);

                // 回显文本
                Promise
                    .all([userAttrsRequest, orderAttrsRequest, commodityAttrsRequest, relationsRequest])
                    .then(([user, order, commodity, operators]) => {
                        this.attributes = [...user, ...order, ...commodity];
                        this.operators = operators;
                        this.getLogList();
                    });
            },
            /**
             * 解析规则
             * @param rules 规则
             * @returns {*}
             */
            parseRulesToText(rules) {
                rules.forEach(rule => {
                    // 添加中文的name
                    const targetAttr = this.attributes.find(attr => attr.id === rule.field_id);
                    if (targetAttr) rule.name = targetAttr.fieldCn;

                    // 添加中文的条件
                    const targetOperator = this.operators.find(optr => optr.operator === rule.operation);
                    if (targetOperator) rule.operatorCn = targetOperator.operatorCn;
                });
                return rules;
            },
            //关闭日志弹窗
            closeJournal() {
                this.$set(this.$data, 'journalLabel', {});
                this.journalPageNumber = 1;
                this.journalTotalPage = 1;
                this.logDtoList = [];
            },

            //日志弹窗加载数据
            getLogList() {
                this.journalLoading = true;
                ContactApiV1
                    .getProgressLog({
                        labelId: this.journalLabel.id,
                        pageNumber: this.journalPageNumber,
                        pageSize: 5
                    })
                    .then(({body: {data: {logDtoList}}}) => {
                        this.logDtoList = logDtoList.map(log => {
                            log.name = this.journalLabel.name;

                            if (log.totalCount === 0)
                                log.progress = (100).toFixed(1);
                            else
                                log.progress =
                                    ((parseInt(log.finishCount) + parseInt(log.errorCount)) / parseInt(log.totalCount)
                                        * 100).toFixed(1);

                            // 计算持续的时间   x天x小时x分钟   未结束的endTime返回当前时间
                            let leave = getDateInstance(log.endTime) - getDateInstance(log.startTime);
                            log.days = Math.floor(leave / (24 * 3600 * 1000));
                            leave = leave % (24 * 3600 * 1000);
                            log.hours = Math.floor(leave / (3600 * 1000));
                            leave = leave % (3600 * 1000);
                            log.minutes = Math.floor(leave / (60 * 1000));

                            // 处理筛选条件的 JSON
                            if (log.typeName !== '3') {
                                let rules = [];
                                let list = JSON.parse(log.detailContent);
                                log.causes = [];
                                list.forEach(item => {
                                    if (item.rules.length > 0) {
                                        rules = rules.concat(item.rules);
                                        item.rules = this.parseRulesToText(item.rules);
                                        log.causes.push(item);
                                    }
                                });
                                log.count = rules.length;
                            }
                            return log;
                        });
                        logDtoList.length && (this.journalTotalPage = this.logDtoList[0].totalPage);
                        this.journalLoading = false;
                    })
                    .catch(() => {
                        this.journalLoading = false;
                    });
            },
            /**
             * model页码
             * @param no 页码
             */
            toJournalPage(no) {
                this.journalPageNumber = no;
                this.getLogList();
            },
            /**
             * 页码
             * @param no 页码
             */
            toPage(no) {
                this.pageNow = no || this.pageNow;
                // 筛选-当前分组-跳转页面后记住当前所选分组
                let groupId;
                if (this.curSelectedGroup.id) {
                    // 我创建的-筛选所在分组
                    if (Number(this.group.id) === -2) {
                        groupId = Number(this.group.id);
                    } else {
                        groupId = this.curSelectedGroup.id === this.all.id ? this.fromGroupId : this.curSelectedGroup.id;
                    }
                }
                this.fetchLabels(groupId);
            },

            /**
             * 选择标签
             * @param labelId 标签id
             */
            toggleLabel(labelId) {
                const cancelIndex = this.cancelIds.findIndex(id => id === labelId);
                cancelIndex === -1 ? this.cancelIds.push(labelId) : this.cancelIds.splice(cancelIndex, 1);
            },

            /**
             * 获取分组下的标签列表
             * @param group 分组
             */
            showLabels(group) {
                if (!isNaN(Number(group.id))) {
                    this.group = group;
                    if (this.group.id === 0 || this.group.id === -2) {
                        this.parentGroupName = '';
                        this.treeActiveId = '';
                    }
                }
                if (!this.group.id) this.group.id = 0;
                this.$router.replace({name: 'tagManage', query: {groupId: this.group.id}});
                this.currentGroupName = group.name;
                // 清空选中的标签
                this.batchType = 0;
                this.checkedIds = [];
                this.cancelIds = [];
                this.fromGroupId = group.id;
                this.pageNow = 1;
                this.fetchGroupSelectList(this.group);
                // 隐藏标签 分组
                if (Number(this.$route.query.groupId) === -3) {
                    this.tagStatus = 1; // 标签是否隐藏-置为是
                    this.hideDisabled = true;
                } else {
                    this.tagStatus = 2;
                    this.hideDisabled = false;
                }
                this.curSelectedGroup = {}; // 筛选-所在分组 置为"全部"
                this.fetchLabels(this.group.id);
            },
            /**
             * 获取子组件传过来的sortType
             * @param sortType 排序类型
             */
            getSortType(sortType) {
                this.sortType = sortType;
                this.fetchGroups();
            },
            /**
             * 优化后---确定新建/编辑分组
             * @param creatdDetail 新建详情
             */
            editGroup(creatdDetail) {
                if (this.isSubmit) return;
                this.isSubmit = true;
                if (creatdDetail.parentId === '') {
                    creatdDetail.parentId = this.allTreeData.id;
                }
                if (creatdDetail.optionType === 'create') {
                    ContactApiV1
                        .createLabelGroup({name: creatdDetail.groupName, parId: creatdDetail.parentId})
                        .then((res) => {
                            this.isSubmit = false;
                            if (res.body.code === 200) {
                                this.$toast(res.body.message, 'success');
                                this.fetchGroups();
                                this.$refs.leftSidebar.closeNewEditModal();
                            } else {
                                this.$toast(res.body.message, 'warn');
                            }
                        })
                        .catch(() => {
                            this.isSubmit = false;
                        });
                }
                if (creatdDetail.optionType === 'edit') {
                    ContactApiV1
                        .editLabelGroup({
                            id: creatdDetail.groupId,
                            name: creatdDetail.groupName,
                            parId: creatdDetail.parentId
                        })
                        .then((res) => {
                            this.isSubmit = false;
                            if (res.body.code === 200) {
                                this.$toast(this.$t('common.updateSuccess'), 'success');
                                this.fetchGroups();
                                this.$refs.leftSidebar.closeNewEditModal();
                            } else {
                                this.$toast(res.body.message, 'warn');
                            }
                        })
                        .catch(() => {
                            this.isSubmit = false;
                        });
                }
            },
            /**
             * 确定删除分组
             * @param groupId 分组id
             */
            delGroup(groupId) {
                if (this.isSubmit) return;
                this.isSubmit = true;
                ContactApiV1
                    .deleteLabelGroup(groupId)
                    .then(res => {
                        this.isSubmit = false;
                        if (res.body.code === 200) {
                            this.$toast(res.body.message, 'success');
                            //删除分组 清空页面url的groupId
                            this.$router.replace({name: 'tagManage', query: {groupId: 0}});
                            this.group.id = 0;
                            this.fetchGroups();
                            this.fetchLabels();
                            this.currentGroupName = this.$t('tag.allLabel');
                        } else {
                            this.$toast(res.body.message, 'warn');
                        }
                    })
                    .catch(() => {
                        this.isSubmit = false;
                        this.$loaded();
                    });
            },

            /**
             * 是否查看子分组下标签
             * @param group 分组
             */
            showSub(group) {
                if (this.storeLoading || group.id === 1 || group.level === 3) {
                    this.isShow = false;
                } else {
                    this.isShow = !this.isShow;
                    this.pageNow = 1;
                    const groupId = this.$route.query.groupId;
                    this.fetchLabels(groupId);
                }
            },

            // 获取分组列表
            fetchGroups() {
                const test = [];
                const tree = [];
                this.$loading();
                ContactApiV1
                    .getGroups({sortType: this.sortType, modelType: 0})
                    .then(res => {
                        this.allTreeData = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.totalTreeArry = [];
                        this.totalTreeArry.push(this.allTreeData);
                        this.$traverseTree(this.totalTreeArry, tree);
                        this.totalTreeArry = tree;

                        this.groups = JSON.parse(JSON.stringify(res.body.data.rootGroup.childs));
                        this.$traverseTree(this.groups, test);
                        this.groups = test;
                        this.fetchGroupSelectList();
                        this.$loaded();
                    })
                    .catch(err => {
                        console.error(err);
                        this.$loaded();
                    });
            },
            // 筛选-所在分组
            fetchGroupSelectList() {
                this.curTreeDataList = [];
                const groupId = Number(this.$route.query.groupId);
                let fixedGroup = this.fixedGroups.map(group => group.id)
                    .includes(groupId);
                // 固定分组
                if (fixedGroup) {
                    this.curTreeDataList = this.totalTreeArry.slice(0);
                    this.curTreeDataList.map(data => this.$set(data, 'open', true));
                    this.curTreeDataList.unshift(this.all);
                } else {
                    // 自定义分组
                    this.curTreeDataList.push(Object.assign({}, this.group));
                    this.curTreeDataList.map(data => this.$set(data, 'open', true));
                    if (this.curTreeDataList.length > 0
                        && this.curTreeDataList[0].childs
                        && this.curTreeDataList[0].childs.length > 0) {
                        // 添加"全部"
                        this.curTreeDataList.unshift(this.all);
                    }
                }
                // 筛选-所在分组-默认选中第一个
                if (this.curTreeDataList.length > 0 && !this.curSelectedGroup.id) {
                    this.curSelectedGroup = this.curTreeDataList[0];
                }
                // 选中分组的所有父级展开
                let id =
                    this.curTreeDataList && this.curTreeDataList.length > 0
                        ? this.curTreeDataList[0].id
                        : this.treeActiveId;
                this.fathersOpen(this.curTreeDataList, id);
            },
            /**
             * 遍历树数据，将open更改为false
             * @param data 分组数据
             */
            traverseOpen(data) {
                this.$openToFalse(data);
            },
            /**
             * 全选（当前页、所有页）数据
             * @param type 0 全选当前页；1：全选所有页
             */
            checkData(type) {
                if (this.labels.length <= 0) {
                    this.$toast(this.$t('tag.noLabel'), 'warn');
                    return false;
                }
                this.batchType = type;
                this.checkedIds = [];
                this.cancelIds = [];
                this.labels.forEach(label => {
                    const index = this.checkedIds.findIndex(id => id === label.id);
                    const cancelIndex = this.cancelIds.findIndex(id => id === label.id);
                    if (index === -1) {
                        this.checkedIds.push(label.id);
                    }
                    if (cancelIndex !== -1) {
                        this.cancelIds.splice(index, 1);
                    }
                });
            },

            // 清除数据
            clearData() {
                this.batchType = 0;
                if (this.checkedIds.length > 0) {
                    this.checkedIds = [];
                    this.cancelIds = [];
                    this.$toast(this.$t('tag.clearAlready'), 'success');
                    return;
                }
                this.$toast(this.$t('tag.notSelectLabel'), 'warn');
            },

            // 批量移至分组
            batchMove() {
                if (this.checkedIds.length <= 0) {
                    this.$toast(this.$t('tag.notSelectLabel'), 'warn');
                    return;
                }
                this.showMove(this.checkedIds);
            },

            // 批量删除
            batchDelete() {
                if (this.checkedIds.length <= 0) {
                    this.$toast(this.$t('tag.notSelectLabel'), 'warn');
                    return;
                }
                this.deleteLabel(this.checkedIds);
            },

            // 搜索
            searchLabels(groupId) {
                this.pageNow = 1;
                this.fetchLabels(groupId);
            },

            /**
             * 获取标签列表
             * @param groupId {number} 分组id
             * @param isShow 是否隐藏标签
             */
            fetchLabels(groupId, isShow = this.isShow) {
                this.labelsLoading = true;
                if (!groupId && groupId !== 0) {
                    groupId = this.fromGroupId;
                }
                this.$nextTick(() => {
                    ContactApiV1
                        .getLabels({
                            groupId,
                            isShow,
                            pageNumber: this.pageNow,
                            type: this.labelType,
                            searchName: this.searchName,
                            sortValue: this.sortValue,
                            sortOrder: this.sortOrder,
                            searchGroupId: this.searchGroupId,
                        })
                        .then(res => {
                            this.labels = res.body.data.labelList;
                            this.totalPage = res.body.data.totalPage;
                            this.totalRow = res.body.data.totalRow;
                            this.labelsLoading = false;
                            // 翻页时选中当前页的数据
                            if (this.batchType === 1) {
                                this.checkData(this.batchType);
                            }
                        })
                        .catch(() => {
                            this.labelsLoading = false;
                        });
                });
            },

            //选中分组的所有父级元素open=true
            fathersOpen(list, id) {
                let fathersArr = [];
                fathersArr = this.$getCurrentFathers(list, id);
                fathersArr.forEach(item => {
                    item.open = true;
                });
            },
            // 新建标签弹框
            createTag() {
                let currentGroup = {};
                // 清空label
                this.label = {
                    name: '',
                    updateDate: '',
                    count: 0,
                    delStatus: 0,
                };
                this.isEdit = true;
                this.chooseGroupShow = true;
                //新建标签 "全部分组" 不可选
                let firstGroup = this.$getCurrentPart(2, this.totalTreeArry);
                firstGroup.noSelect = false;

                // 默认选中 默认分组 id
                let r = this.$getCurrentPart(1, this.groups);
                let routeId = this.$route.query.groupId;
                if (routeId <= 0) {
                    currentGroup = r;
                } else {
                    currentGroup = this.$getPartById(routeId, this.groups);
                }
                if (!currentGroup) return;
                this.parentGroupName = currentGroup.name;
                this.treeActiveId = currentGroup.id;
                this.fathersOpen(this.totalTreeArry, this.treeActiveId);
            },

            /**
             * 编辑标签
             * @param label {Object} 标签
             */
            editTag(label) {
                this.label = label;
                this.label.updateName = label.name;
                this.isEdit = true;
            },

            /**
             * 移动至分组弹窗 typeof item = Array || typeof item = number
             * @param item
             */
            showMove(item) {
                //移动标签 "全部分组"不可选 open=true
                let firstGroup = this.$getCurrentPart(2, this.totalTreeArry);
                firstGroup.noSelect = false;
                firstGroup.open = true;

                this.parentGroupName = '';
                this.treeActiveId = '';
                this.ids = [];
                switch (this.batchType) {
                    // 全选当前页
                    case 0:
                        typeof item === 'number'
                            ? (this.ids.indexOf(item) === -1 ? this.ids.push(item) : this.ids)
                            : this.ids = item;
                        break;
                    // 全选所有页： 不取消传空数组，取消了传取消的ids
                    case 1:
                        this.ids = this.cancelIds;
                        break;
                }
                this.isMove = true;
            },
            //取消移动
            isMoveClose() {
                this.isMove = false;
                this.parentGroupName = '';
                //移动标签弹窗关闭后"全部分组" 状态恢复可选
                let firstGroup = this.$getCurrentPart(2, this.totalTreeArry);
                firstGroup.noSelect = true;
            },

            // 保存 移动至分组
            saveMove() {
                this.$loading();
                ContactApiV1.moveToGroup(this.group.id, this.fromGroupId, this.batchType, this.ids, this.isShow)
                    .then(() => {
                        this.pageNow = 1;
                        this.fetchLabels(this.fromGroupId);
                        this.checkedIds = [];
                        this.cancelIds = [];
                        this.isMove = false;
                        this.$toast(this.$t('tag.moveSuccess') + '【 ' + this.group.name + '】', 'success');
                        trackEvent('标签移动分组');
                        //移动标签 成功后 "全部分组" 状态恢复可选
                        let firstGroup = this.$getCurrentPart(2, this.totalTreeArry);
                        firstGroup.noSelect = true;
                        this.$loaded();
                    })
                    .catch(err => {
                        console.error(err);
                        this.$loaded();
                    });
            },

            // 关闭标签弹框
            cancelTag() {
                this.labelNameErr = '';
                this.isEdit = false;
                this.chooseGroupShow = false;
                this.groupSelectShow = false;

                //移动标签弹窗关闭后"全部分组" 状态恢复可选
                let firstGroup = this.$getCurrentPart(2, this.totalTreeArry);
                firstGroup.noSelect = true;
            },

            /**
             * 保存标签
             * @param label {Object} 标签
             * @returns {boolean}
             */
            saveTag:debounce(function(label) {
                if (!label.updateName || label.updateName === '') {
                    this.labelNameErr = this.$t('tag.nameNoEmpty');
                    return false;
                }
                if (!TAGANDWEBPAGE_NAME_REGEXP.test(label.updateName)) {
                    this.labelNameErr = this.$t('tag.nameReg');
                    return false;
                }
                this.labelNameErr = '';
                // 编辑
                if (label.id) {
                    this.$loading();
                    ContactApiV1
                        .editLabel({id: label.id, name: label.updateName})
                        .then(() => {
                            // 这里应该重新获取下标签列表，但是原本就被注释掉， 这里不做修改 2019-11-11；
                            this.label.name = label.updateName;
                            this.cancelTag();
                            this.$toast(this.$t('tag.updateSuccess'), 'success');
                            trackEvent('编辑标签');
                            this.$loaded();
                        })
                        .catch(err => {
                            console.error(err);
                            this.cancelTag();
                            this.$loaded();
                        });
                } else {
                    // 新增
                    this.addTag(this.treeActiveId, label.updateName);
                }
            },200),

            /**
             * 添加一个新标签
             * @param groupId {Number} 分组id
             * @param labelName {String} 标签name
             */
            addTag(groupId, labelName) {
                this.group.id = groupId;
                if (!groupId || groupId <= 0) {
                    let r = this.$getCurrentPart(1, this.groups);
                    groupId = r.id;
                }
                this.$loading();
                ContactApiV1
                    .createLabel({groupId, name: labelName})
                    .then(() => {
                        this.cancelTag();
                        this.fetchLabels(this.$route.query.groupId);
                        this.curSelectedGroup = this.all;
                        this.$toast(this.$t('tag.addSuccess'), 'success');
                        trackEvent('新增标签');
                        this.$loaded();
                    })
                    .catch(() => {
                        this.cancelTag();
                        this.$loaded();
                    });
            },

            /**
             * 准备删除标签 typeof item = Array || typeof item = number
             * @param item
             */
            deleteLabel(item) {
                switch (this.batchType) {
                    // 全选当前页
                    case 0 :
                        this.ids = typeof item === 'number' ? [item] : item;
                        break;
                    // 全选所有页： 不取消传空数组，取消了传取消的ids
                    case 1:
                        this.ids = this.cancelIds;
                        break;
                }
                this.delTagsFlag = true;
            },
            //最后确认删除标签
            sureDelTags() {
                this.delTagsFlag = false;
                this.$loading();
                ContactApiV1.deleteLabel(this.fromGroupId, this.batchType, this.ids, this.isShow)
                    .then(() => {
                        this.pageNow = 1;
                        this.fetchLabels();
                        this.checkedIds = [];
                        this.ids = [];
                        trackEvent('删除标签');
                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                        this.$loaded();
                    })
                    .catch(err => {
                        console.error(err);
                        this.$loaded();
                    });
            },

            /**
             * 重新计算
             * @param label {Object} 标签
             */
            reCount(label) {
                this.checkedIds = [];
                this.$loading();
                ContactApiV1.reCount(label.id)
                    .then(res => {
                        label.updateDate = res.body.data.updateDate;
                        label.count = res.body.data.count;
                        this.fetchLabels();
                        this.$toast(this.$t('tag.reCalcuate'), 'success');
                        trackEvent('重新计算标签');
                        this.$loaded();
                    })
                    .catch(err => {
                        console.error(err);
                        this.$loaded();
                    });
            },

            // 设置规则-添加会员标签
            addCustomerTag() {
                this.fetchLabels();
                this.cancelSetRule();
            },

            /**
             * 设置规则-移除会员标签
             * @param jsonStr
             */
            moveCustomerTag(jsonStr) {
                let moveConfirmationMessage = this.$t('tag.moveConfirm');
                this.$confirm(this.$t('tag.deleteMemberLabel'), moveConfirmationMessage)
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            ContactApiV1.moveLabelProperty(this.label.id, jsonStr)
                                .then(() => {
                                    this.cancelSetRule();
                                    this.$toast(this.$t('tag.deleteLabel') + '【' + this.label.name + '】', 'success');
                                    trackEvent('移除会员标签');
                                    this.$loaded();
                                })
                                .catch(err => {
                                    console.error(err);
                                    this.$loaded();
                                });
                        } else {
                            this.cancelSetRule();
                        }
                    });
            },

            /**
             * 设置规则-获取值
             * @param label {Object} 标签
             */
            setRules(label) {
                this.label = label; // 给label赋值，添加会员标签时用
                this.checkedIds = [];
                if (label.delStatus === 1) {
                    this.$toast(this.$t('tag.cannotSetting'), 'warn');
                    return;
                }
                this.$loading();
                ContactApiV1.getRules(this.label.id)
                    .then(res => {
                        if (res.body.data) {
                            let rule = res.body.data;
                            if (rule.json) {
                                this.ruleContent = JSON.parse(rule.json);
                            } else {
                                this.ruleContent = [];
                            }
                            this.$loaded();
                            this.isRule = true;
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        this.$loaded();
                    });
            },

            // 关闭设置规则弹框
            cancelSetRule() {
                this.isRule = false;
                this.ruleContent = [];
            },

            /**
             * search-tree中选择list的某一项时  接收选中项
             * @param group
             */
            getTreeAct(group) {
                this.treeActiveId = group.id;
                this.parentGroupName = group.name;
                this.group = group;
                this.groupSelectShow = false;
            },
            /**
             * 筛选-所在分组-选中分组
             * search-tree中选择list的某一项时  接收选中项
             * @param group
             * */
            getTreeActByGroup(group) {
                this.curSelectedGroup = group;
                this.currentGroupName = this.group.name;
                this.groupSelectShow = false;

                // 我创建的-筛选所在分组
                let groupId;
                if (Number(this.$route.query.groupId) === -2) {
                    groupId = Number(this.$route.query.groupId);
                } else {
                    groupId = this.curSelectedGroup.id === this.all.id
                        ? this.$route.query.groupId : this.curSelectedGroup.id;
                }

                // 自定义分组-选中"全部"显示子分组下标签
                const isShow = this.curSelectedGroup.id === this.all.id || false;
                this.pageNow = 1;
                this.fetchLabels(groupId, isShow);
            },
            // ready选择分组
            readyCheckGroup() {
                this.groupSelectShow = !this.groupSelectShow;
            },
            //通用方法 下拉菜单的收起
            eventListener() {
                this.groupSelectShow = false;
            },
            /**
             * 单一标签操作
             * @param isConceal 是否隐藏
             * @param id    标签id
             * @param single {String} 表示单一标签操作
             */
            hiddenOrShow(isConceal, id, single) {
                this.singleOrBatch = single;
                this.singleLabelId = id;
                this.hiddenModal = true;
                if (isConceal === 1) {
                    this.labelSet = this.$t('tag.sureToShow');
                } else {
                    this.labelSet = this.$t('tag.sureToHide');
                }
            },
            /**
             * 标签批量操作
             * @param type {Number} 设置标签类型（隐藏/显示）
             * @param batch {String} 表示批量操作
             */
            batchHideShow(type, batch) {
                if (this.checkedIds.length === 0) {
                    this.$toast(this.$t('tag.notSelectLabel'), 'warn');
                    return;
                }
                this.singleOrBatch = batch;
                this.hideShowType = type;
                this.hiddenModal = true;
                if (type === 1) {
                    this.labelSet = this.$t('tag.sureToShow');
                } else {
                    this.labelSet = this.$t('tag.sureToHide');
                }
            },
            //确定标签隐藏/显示
            sureLabelHideShow() {
                if (this.singleOrBatch === 'single') {//单一标签隐藏/显示
                    ContactApiV1.singleHideShow(this.singleLabelId)
                        .then((res) => {
                            if (res.body.code === 200) {
                                this.fetchLabels();
                                this.$toast(this.$t('form.SuccessOperate'), 'success');
                            }

                        });
                } else {//批量隐藏/显示
                    let groupId = null;
                    let checkedLabels = [];
                    let uncheckLabelIds = [];
                    if (this.batchType === 1) {
                        groupId = this.fromGroupId;
                        checkedLabels = [];
                        uncheckLabelIds = this.cancelIds;
                    } else {
                        checkedLabels = this.checkedIds;
                        uncheckLabelIds = [];
                    }
                    ContactApiV1.batchHideShow(
                        groupId,
                        checkedLabels,
                        this.labelIds,
                        this.isShow,
                        this.hideShowType,
                        uncheckLabelIds)
                        .then((res) => {
                            if (res.body.code === 200) {
                                this.fetchLabels();
                                this.$toast(this.$t('form.SuccessOperate'), 'success');
                                this.checkedIds = [];
                            }
                        });
                }
                this.hiddenModal = false;
            }
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    $option-height: $input-field-height;
    $border-radius: 4px;

    .tag-manage {
        .search-tree-wrapper {
            border: 1px solid $border-color;
            border-top: none;
            width: 328px;
            max-height: 300px;
            position: absolute;
            background: #fff;
        }

        .search-box {
            margin-right: 16px;
        }

        .setRule {
            position: relative;
            height: 40px;
            line-height: 40px;
            @include clearfix();
            background-color: #daecf8;

            .set-rule-word {
                color: #006699;
            }

            .close {
                position: absolute;
                right: 0;
                top: 0;

                .icon-close {
                    color: #a0d7e7;
                    cursor: pointer;
                    padding-right: 10px;
                }
            }
        }

        .tag-content {
            display: flex;
            padding-bottom: 43px;
        }


        .tag-detail {
            flex: 1;
            overflow: auto;
            padding: 24px 16px 16px 16px;
            background-color: white;
            border: 1px solid $border-color;

            .detail-btn {
                line-height: 32px;

                .icon-help {
                    width: 16px;
                    height: 16px;
                    vertical-align: middle;
                }
            }

            .detail-msg {
                line-height: 32px;

                .batch {
                    display: inline-block;
                    width: 120px;
                }

                .hidden-menu-trigger {
                    position: relative;
                    cursor: pointer;

                    &:hover {
                        color: $color-title;
                    }

                    svg {
                        width: 16px;
                        height: 16px;
                        vertical-align: top;
                        margin-top: ($input-field-height - 16px)/2;
                        fill: currentColor;
                    }

                    .hidden-menu {
                        top: $input-field-height;
                        left: 0;
                        text-align: left;
                        @include transform-origin(left top);
                    }
                }
            }

            .tag-table {
                table-layout: fixed;
                width: 100%;
                margin-top: 16px;
                text-align: left;
                border-collapse: collapse;
                border-spacing: 0;

                .themeRed {
                    color: $red;
                }

                .progress-bar {
                    padding-right: 50px;
                    display: inline-block;
                    vertical-align: middle;
                    width: 100%;
                    margin-right: -55px;
                    box-sizing: border-box;

                    .progress-bar__outer {
                        height: 6px;
                        margin-right: 8px;
                        border-radius: 100px;
                        background-color: $disabled;
                        overflow: hidden;
                        position: relative;
                        vertical-align: middle;
                    }

                    .progress-bar__inner {
                        position: absolute;
                        left: 0;
                        top: 0;
                        height: 100%;
                        text-align: right;
                        border-radius: 100px;
                        line-height: 1;
                        white-space: nowrap;
                        transition: width .6s ease;
                    }
                }

                .progress__text {
                    display: inline-block;
                    vertical-align: middle;
                    margin-left: 10px;
                    line-height: 1;
                }

                th {
                    box-sizing: border-box;

                    &:not([width]) {
                        width: 100%;
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

                    &:not(:first-child):hover {
                        background-color: $title-bg;
                    }
                }

                td {
                    word-break: break-word;
                    white-space: normal;

                    .tag-name {
                        padding-right: 10px;
                    }
                }

                .btn {
                    padding: 0;
                }

                .filter-box {
                    display: inline-block;
                    position: relative;

                    .disabled {
                        cursor: not-allowed;
                    }

                    .filter-icon {
                        fill: currentColor;
                        width: 14px;
                        height: 14px;
                        vertical-align: middle;
                        margin-left: 1px;
                    }

                    .drop-radio {
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

                .tag-action-menu {
                    float: right;
                    position: relative;
                    right: 30%;

                    .menu-icon {
                        display: block;
                        width: 16px;
                        height: 16px;
                        @include transition();
                        fill: $color-light-content;

                        &:hover {
                            fill: $light-theme;
                        }

                        &:active {
                            fill: $dark-theme;
                        }
                    }

                    .hidden-menu {
                        left: 0;
                        @include transform-origin(left top);
                    }
                }

                .tag-name {
                    display: inline-block;
                }

                .tag-action-icon {
                    position: relative;
                    display: inline-block;
                    width: 16px;
                    height: 16px;
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
                        .icon-refresh {
                            fill: $blue;

                            &:hover {
                                fill: $light-blue;
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

                .hidden-menu-trigger {
                    position: relative;
                    display: inline-block;
                    height: 16px;

                    .hidden-menu {
                        position: absolute;
                        text-align: left;
                        @include transform-origin(left top);

                        li {
                            padding: 0 15px;
                        }
                    }
                }
            }

            .tag-btn {
                padding: 0;
                margin: 0;
            }

            .tag-btn-click {
                width: 100%;
                text-align: left;
                color: $color-light-content;

                &:hover {
                    color: $color-content;
                }
            }
        }


        // 日志弹窗
        .log-tips {
            margin-bottom: $input-field-height/2;
        }

        .condition-menu {
            .hidden-menu {
                max-height: 200px;
                overflow-y: auto;

                .condition {
                    margin-left: 60px;
                    line-height: 25px;

                    .rules {
                        margin-left: 20px;
                    }
                }
                &>li {
                    white-space: normal;
                }
            }
        }

        .form-field {
            .name-input {
                width: 328px;
            }
        }

        .choose-parent-wrapper {
            margin-top: 10px;

            .choose-parent {
                display: inline-block;
                position: relative;

                .select-icon {
                    position: relative;
                    right: 10%;
                    top: 4px;
                    fill: $color-light-content;
                }
            }
        }

        .del-tag-title {
            font-size: 14px;
            margin: 10px 0;
        }

        .sure-del {
            font-weight: bold;
        }
    }
</style>
