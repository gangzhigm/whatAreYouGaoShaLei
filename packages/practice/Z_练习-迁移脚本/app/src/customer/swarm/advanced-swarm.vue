<template>
    <div class="advanced-swarm content-container">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <!-- 新建/编辑高级分群 头部 -->
        <div class="page-head">
            <div class="content-view">
                <div class="form-field pull-left">
                    <label class="label">{{'swarm.groupName' | t}}</label>
                    <input id="advancedName" class="input name-input" type="text" v-model="advancedName" readonly>
                </div>
                <div class="form-field pull-left">
                    <label class="label placeholder">{{'common.groupName'|t}}</label>
                    <input id="advancedGroup" class="input group-input" type="text" v-model="treeParams.parentGroupName" readonly>
                </div>
                <svg class="pull-left advanced-icon action-icon icon-pencil" aria-hidden="true" v-title:top="$t('form.setting')" @click="advancedModalOpen = true">
                    <use xlink:href="#icon-pencil"></use>
                </svg>
                <button class="pull-right btn btn-md btn-theme" @click="calculateModalOpen">
                    {{'swarm.startCalculate' | t}}
                </button>
                <button class="pull-right btn btn-md btn-white" @click="goBack">
                    {{'common.back' | t}}
                </button>
                <svg class="pull-right advanced-icon" aria-hidden="true" v-title="$t('swarm.advancedIcon')">
                    <use xlink:href="#icon-help"></use>
                </svg>
            </div>
        </div>
        <div class="page-content">
            <!-- 左侧子分群列表 -->
            <div class="left-side">
                <!-- 列表头部 -->
                <div class="swarm-item pull-left" v-if="!listLoading">
                    <div class="item-left">
                        <span>{{ advancedJson.status === 2 ? advancedJson.total : '/' }}</span>
                        <span>{{'swarm.currentNumber' | t}}</span>
                    </div>
                    <!--操作菜单-->
                    <div class="hidden-menu-trigger pull-right item-opt">
                        <svg class="item-icon" aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        <div class="hidden-menu">
                            <button class="btn" @click='openAddSwarm'>{{'swarm.addChildSwarm' | t}}</button>
                            <button class="btn" @click='openCopySwarm'>{{'swarm.copyChildSwarm' | t}}</button>
                        </div>
                    </div>
                    <div class="item-calculationTime" v-if="advancedJson.updateDate && advancedJson.status === 2">
                        ({{'swarm.lastCalculationTime' | t}}{{advancedJson.updateDate}})
                    </div>
                    <div class="item-calculationTime" v-if="!advancedJson.updateDate || advancedJson.status !== 2">
                        ({{'swarm.lastCalculationTime' | t}} /)
                    </div>
                </div>
                <!-- 子分群列表 -->
                <div class="swarm-item item-list pull-left"
                     v-if="!listLoading"
                     :class="{active: swarm.id === item.id,'item-err': item.unValid}"
                     v-for="(item,index) in advancedJson.contactSwarmDtoList"
                     :key="item.id">
                    <div class="item-left" @click="selectSwarm(item)">
                        <span class="item-name" :title="item.name">{{item.name}}</span>
                        <span v-if="item.operation === 0" class="item-include">{{'swarm.include' | t}}</span>
                        <span v-if="item.operation === 1" class="item-exclude">{{'swarm.exclude' | t}}</span>
                        <span v-if="item.operation === ''" class="item-opt-change">
                            <i class="icon icon-loading"></i>
                        </span>
                        <div class="item-num pull-right">
                            <template v-if="!item.calculating">
                                <span v-if="item.status !== 0">{{item.total || 0}}</span>
                                <span v-else>{{'swarm.unCalculate' | t}}</span>
                            </template>
                            <svg v-if="item.status !== 0" class="pull-right" aria-hidden="true" v-title="$t('swarm.swarmNumUpdate')">
                                <use xlink:href="#icon-help"></use>
                            </svg>
                            <i v-if="item.calculating" class="icon icon-loading pull-right"></i>
                        </div>
                    </div>
                    <!--操作菜单-->
                    <div class="hidden-menu-trigger pull-right item-opt">
                        <svg class="item-icon" aria-hidden="true">
                            <use xlink:href="#icon-gengduo"></use>
                        </svg>
                        <div class="hidden-menu">
                            <button class="btn" @click='changeRelation(item)'>
                                {{item.operation === 0 ? 'swarm.cutToExclude' : 'swarm.cutToInclude' | t}}
                            </button>
                            <button class="btn" @click='openSwarmEdit(item)'>{{'common.edit' | t}}
                            </button>
                            <button class="btn" @click='openSwarmDel(item)'>{{'common.del' | t}}
                            </button>
                        </div>
                    </div>
                </div>
                <!--无子分群-->
                <span class="no-data" v-if="swarmNum === 0">{{'common.noData' | t}}</span>
                <!--子分群列表加载-->
                <inline-loading class="list-loading" v-if="listLoading"/>
            </div>
            <!--子分群条件簇及条件-->
            <div class="right-side" v-if="swarm.id">
                <!--条件编辑-->
                <condition-bunch v-if="bunchSwitch"
                                 ref="conditionBunch"
                                 @valid="handleCondition"
                                 :bunchData="swarm.swarmJson"
                                 @loaded="bunchConditionLoaded"
                                 @dataChange="swarmChange"
                                 @unvalid="unvalid">
                </condition-bunch>
                <!--保存按钮-->
                <button v-if="bunchLoaded" class="btn btn-md btn-theme" :disabled="swarm.calculating" @click="calculateSwarm">
                    {{'common.save' | t}}
                    <i v-if="swarm.calculating" class="icon icon-loading"></i>
                </button>
            </div>
            <!--无子分群，条件编辑为空-->
            <div class="right-side" v-if="swarmNum === 0">
                <span class="no-data">{{'common.noData' | t}}</span>
            </div>
        </div>
        <!--编辑高级分群-->
        <confirm class="edit-modal" v-if="advancedModalOpen" :title="$t('swarm.editSwarmAndGroup')" @cancel="cancelAdvanced" @confirm="advancedConfirm">
            <div class="form-field">
                <label class="label">{{'swarm.groupName' | t}}</label>
                <input class="input lg" :class="{error: nameErrorText}" type="text" v-model.trim="advancedJson.name"
                       @click="nameErrorText = ''" :placeholder="$t('swarm.enterGroupName')" maxlength="100"
                       v-title:top.warn.line="nameErrorText">
            </div>
            <div class="form-field">
                <label class="label placeholder" for="pId">{{'swarm.selectGroup'|t}}</label>
                <div class="choose-parent" id="pId" @click.stop="readyCheckGroup">
                    <label class="select-text">
                        {{treeParams.parentGroupName || $t('common.selectHolder')}}
                        <span class="select-icon icon icon-arrow-down"></span>
                    </label>
                    <div class="search-tree-wrapper" v-if="treeParams.groupSelectShow" @click.stop>
                        <!-- 带有搜索功能的树 -->
                        <search-tree :searchTreeData="groupList"
                                     :treeActiveId="treeParams.treeActiveGid"
                                     @getTreeAct="getTreeAct"
                                     :action="false"
                                     :levelStage="true"
                                     :moduleRange="'swarm'">
                        </search-tree>
                    </div>
                </div>
            </div>
        </confirm>
        <!--添加子分群-->
        <confirm v-if="addSwarmOpen" :size="'md'" :autoConfirm="false" :title="$t('swarm.addChildSwarm')" @cancel="cancelAddSwarm" @confirm="confirmAddSwarm">
            <div class="form-field">
                <label class="label">{{'swarm.groupNameLabel' | t}}</label>
                <input class="input lg" :class="{error: swarmNameErrorText}" type="text" v-model.trim="addSwarmName"
                       @click="swarmNameErrorText = ''" :placeholder="$t('swarm.enterGroupName')" maxlength="100"
                       v-title:top.warn.line="swarmNameErrorText">
            </div>
        </confirm>
        <!--修改子分群-->
        <confirm v-if="editSwarmOpen" :size="'md'" :autoConfirm="false" :title="$t('swarm.editChildSwarm')" @cancel="cancelEditSwarm" @confirm="confirmEditSwarm">
            <div class="form-field">
                <label class="label">{{'swarm.groupNameLabel' | t}}</label>
                <input class="input lg" :class="{error: swarmNameErrorText}" type="text" v-model.trim="editSwarm.name"
                       @click="swarmNameErrorText = ''" :placeholder="$t('swarm.enterGroupName')" maxlength="100"
                       v-title:top.warn.line="swarmNameErrorText">
            </div>
        </confirm>
        <!--复制子分群-->
        <confirm v-if="copySwarmOpen" :size="'lg'" :autoConfirm="false" :title="$t('swarm.copyChildSwarm')" @cancel="cancelCopySwarm" @confirm="confirmCopySwarm">
            <div class="form-field">
                <label class="label">{{'swarm.selectChildSwarm' | t}}</label>
                <advancedMultiSelect :group="groupList" :swarmAmount="advancedJson.contactSwarmDtoList.length" @select="copySwarmSelectHandle"/>
            </div>
        </confirm>
        <!--删除子分群-->
        <confirm v-if="delSwarmOpen" :size="'md'" :autoConfirm="false" :title="$t('common.notice')" @cancel="cancelSwarmDel" @confirm="confirmSwarmDel">
            <div class="form-field">
                <p>
                    {{'swarm.deleteConfirmA' | t}}
                    {{delSwarm.name}}
                    {{'swarm.deleteConfirmB' | t}}
                </p>
            </div>
        </confirm>
        <!--确认计算-->
        <confirm class="calculate-open"
                 v-if="calculateOpen"
                 :size="'md'"
                 :autoConfirm="false"
                 :title="$t('swarm.calculate')"
                 @cancel="calculateOpen = false"
                 @confirm="calculateConfirm">
            <div v-if="!calculateOpenLoad" class="form-field">
                <p>{{calculateTime}}</p>
            </div>
            <inline-loading v-if="calculateOpenLoad"/>
        </confirm>
        <!--计算中弹窗-->
        <modal class="calculating-open" v-if="calculatingOpen" :title="$t('swarm.calculate')" :size="'md'">
            <div class="form-field">
                <p>{{'swarm.calculatingCue' | t}}</p>
            </div>
            <template v-slot:buttons>
                <button class="btn btn-md btn-theme" @click="backToList">
                    {{'swarm.backToList' | t}}
                </button>
            </template>
        </modal>
        <!--确认是否保存-->
        <modal class="save-modal" v-if="saveModalOpen" :size="'md'" :title="$t('common.notice')">
            <div class="form-field">
                <p>{{'swarm.saveConfirm' | t}}</p>
            </div>
            <template v-slot:buttons>
                <button class="btn btn-md btn-white" @click="cancelSave">
                    {{'swarm.notSaveModal' | t}}
                </button>
                <button class="btn btn-md btn-theme" @click="confirmSave">
                    {{'swarm.saveModal' | t}}
                </button>
            </template>
        </modal>
        <!--确认是否重新计算-->
        <modal class="recalculate-modal" v-if="reCalculateModal" :size="'md'" :title="$t('common.notice')" @close="reCalculateModal = false">
            <div class="form-field">
                <p>{{'swarm.reCalculateTips' | t}}</p>
            </div>
            <template v-slot:buttons>
                <button class="btn btn-md btn-white" @click="confirmJump">
                    {{'swarm.confirmJump' | t}}
                </button>
                <button class="btn btn-md btn-theme" @click="calculateModalOpen">
                    {{'swarm.reCalculate' | t}}
                </button>
            </template>
        </modal>
    </div>
</template>
<script type="text/ecmascript-6">
import { COMMON_NAME_REGEXP } from '../../common/utils/regs';
import {translate as t} from '@/locales';
import Bus from '../../common/components/group-tree/bus.js';
import { ContactApiV1 } from '@/api';
import conditionBunch from '../../common/components/condition-bunch/conditionBunch.vue';
import advancedMultiSelect from './advanced-multi-select.vue';

export default {
    name: 'advancedSwarm',
    components: { conditionBunch,advancedMultiSelect },
    data () {
        return {
            treeParams: {               // 树组件参数
                parentGroupName: '',
                groupSelectShow: false,
                treeActiveGid: '',
                searchSelectTree: {}
            },
            listLoading: false,         //子分群列表加载
            groupList: [],              //分组列表
            groupId: '',                //分组ID
            advancedName: '',           //分组名称
            nameErrorText: '',          //高级分群名称错误提示
            advancedId: '',             //当前高级分群id
            advancedJson: {},           //高级分群信息
            advancedModalOpen: false,   //编辑高级分群弹窗
            swarm: {                    //当前子分群
                id: '',                 //子分群ID
                name: '',               //子分群名称
                swarmJson: [],          //子分群条件
                calculating: false,     //子分群是否计算中状态
            },
            selectSwarmId: '',          //切换子分群时，标识选择的分群
            addSwarmName: '',           //添加子分群名称
            swarmNameErrorText: '',     //子分群名称错误提示
            bunchSwitch: false,         //子分群切换加载
            bunchLoaded: false,         //右侧分群编辑数据load，判断确认按钮的显示
            addSwarmOpen: false,        //添加分群弹窗
            editSwarmOpen: false,       //编辑分群弹窗
            copySwarmOpen: false,       //复制分群弹窗
            copySelectList: [],         //复制的分群数据
            delSwarmOpen: false,        //删除分群弹窗
            delSwarm: {},               //要删除的分群
            editSwarm: {},              //要编辑的分群
            editSwarmLoading: false,    //编辑分群时的loading
            operationSwarm: {},         //要改变包含排除关系的分群
            calculateOpen: false,       //确认计算弹窗
            calculateOpenLoad: false,   //是否可以开始计算
            calculatingOpen: false,     //计算中弹窗
            saveModalOpen: false,       //是否保存弹窗
            leaveToInfo: '',            //将要跳转的页面
            reCalculateModal: false,    //重新计算弹窗
            isChange: false,            //高级分群是否有改动
        };
    },
    mounted () {
        this.advancedId = this.$route.query.id;
        this.treeParams.treeActiveGid = parseInt(this.$route.query.groupId) || 0;
        this.groupId = parseInt(this.$route.query.groupId) || 0;
        this.getSwarmGroup();
        this.getAdvancedList('init');
        //点击其他地方下拉菜单收起
        window.addEventListener('click', this.eventListener);
    },
    beforeRouteLeave(to, from, next) {
        //离开页面时，提示是否保存
        if (this.swarm.id && this.swarm.hasChange) {
            next(false);
            this.leaveToInfo = to;
            this.selectSwarmId = 'routeLeave';
            this.saveModalOpen = true;
        } else if (this.isChange && !this.calculatingOpen) {
            next(false);
            this.leaveToInfo = to;
            this.reCalculateModal = true;
        } else {
            next();
        }
    },
    computed: {
        crumbs() { // 面包屑导航
            return [
                {name: 'home', text: 'Dmartech'},
                {name: 'swarm', text: t('home.customerSwarm'), query: { groupId: 0}},
                {name: 'advancedSwarm', text: t('swarm.advancedSwarm')}
            ];
        },
        calculateSeconds() {    //计算所需时间(秒)
            let total = 0;
            for (let i = 0; i < this.advancedJson.contactSwarmDtoList.length; i++) {
                total += this.advancedJson.contactSwarmDtoList[i].total;
            }
            return (total / 1666).toFixed();
        },
        calculateTime() {   //计算提示时间
            if (this.calculateSeconds >= 60) {
                return this.$t('swarm.calculateConfirmA') +
                    (this.calculateSeconds / 60).toFixed() +
                    this.$t('time.minute') +
                    this.$t('swarm.calculateConfirmB');
            } else if (this.calculateSeconds >= 10) {
                return this.$t('swarm.calculateConfirmA') +
                    this.calculateSeconds +
                    this.$t('time.second') +
                    this.$t('swarm.calculateConfirmB');
            }
        },
        //子分群数量
        swarmNum() {
            return this.advancedJson.contactSwarmDtoList ? this.advancedJson.contactSwarmDtoList.length : '';
        },
        //'包含'关系的子分群数量
        inCludeNum() {
            let inClude = 0;
            for (let i = 0; i < this.advancedJson.contactSwarmDtoList.length; i++) {
                if (this.advancedJson.contactSwarmDtoList[i].operation === 0) {
                    inClude++;
                }
            }
            return inClude;
        }
    },
    methods: {
        //选中分组的所有父级元素open=true
        fathersOpen(list, id) {
            let fathersArr = [];
            fathersArr = this.$getCurrentFathers(list, id);
            fathersArr.forEach(item => {
                item.open = true;
            });
        },
        //请求用户分组列表
        getSwarmGroup() {
            const tree = [];
            ContactApiV1
                .getGroupList()
                .then(res => {
                    if (res.body.data && res.body.data.rootGroup) {
                        let data = JSON.parse(
                            JSON.stringify(res.body.data.rootGroup)
                        );
                        this.groupList.push(data);
                        this.$traverseTree(this.groupList, tree);
                        this.groupList = tree;
                        //初始化分组
                        this.$nextTick(() => {
                            this.initGroup();
                        });
                    }
                });
        },
        //初始化分组选择
        initGroup() {
            //"全部分组"，open = true 默认展开
            let firstGroup = this.$getCurrentPart(2, this.groupList);
            firstGroup.open = true;
            firstGroup.noSelect = false;
            //默认选中"默认分组"
            if (
                this.treeParams.treeActiveGid !== 0 &&
                this.treeParams.treeActiveGid !== -2 &&
                this.treeParams.treeActiveGid !== -99
            ) {
                let curGroup = this.$getPartById(this.treeParams.treeActiveGid, this.groupList);
                this.treeParams.parentGroupName = curGroup.name;
                this.treeParams.searchSelectTree = curGroup;
            } else {
                let deftGroup = this.$getCurrentPart(1, this.groupList);
                this.treeParams.parentGroupName = deftGroup.name;
                this.treeParams.treeActiveGid = deftGroup.id;
            }
        },
        /**
         * search-tree中选择list的某一项时  接收选中项
         * @param group 选择的分组
         */
        getTreeAct(group) {
            this.treeParams.treeActiveGid = group.id;
            this.treeParams.parentGroupName = group.name;
            this.treeParams.searchSelectTree = group; //search-tree中选中的某一项的id
            this.treeParams.groupSelectShow = false;
        },
        eventListener() {
            this.treeParams.groupSelectShow = false;
        },
        readyCheckGroup() {
            this.treeParams.groupSelectShow = !this.treeParams.groupSelectShow;
            this.$nextTick(() => {
                // 展开当前所在分组的所有父级
                this.fathersOpen(this.groupList, this.treeParams.searchSelectTree.id);
            });
        },
        /**
         * 获取高级分群数据
         * @param init {String} 获取列表后需要的操作 init:初始化页面时自动选择第一个子分群，condition:提示保存并确定后，继续相关操作
         */
        getAdvancedList(init) {
            this.listLoading = true;
            ContactApiV1
                .getAdvanced(this.advancedId)
                .then((res) => {
                    let data = res.body.data;
                    data.contactSwarmDtoList = data.contactSwarmDtoList.map(e => {
                        e.calculating = false;
                        e.unValid = false;
                        return e;
                    });
                    this.advancedJson = data;
                    this.advancedName = data.name;
                    this.listLoading = false;
                    //加载子分群列表
                    if (init === 'init' && this.advancedJson.contactSwarmDtoList.length) {
                        this.selectSwarm(this.advancedJson.contactSwarmDtoList[0]);
                    } else if (init === 'condition') {
                        //提示保存时，确认保存后，继续操作相关内容
                        if (this.selectSwarmId === 'add') {                 //添加子分群
                            this.addSwarmName = '';
                            this.addSwarmOpen = true;
                        } else if (this.selectSwarmId === 'copy') {         //复制子分群
                            this.copySwarmOpen = true;
                        } else if (this.selectSwarmId === 'delete') {       //删除子分群
                            this.delSwarmOpen = true;
                        } else if (this.selectSwarmId === 'edit') {         //编辑子分群（名称）
                            this.editSwarmOpen = true;
                        } else if (this.selectSwarmId === 'operation') {    //更改子分群包含排除关系
                            this.changeRelation();
                        } else if (this.selectSwarmId === 'calculate') {    //计算
                            this.calculateModalOpen();
                        } else if (this.selectSwarmId) {                    //选择其他分群
                            for (let j = 0; j < this.advancedJson.contactSwarmDtoList.length; j++) {
                                if (this.advancedJson.contactSwarmDtoList[j].id === this.selectSwarmId) {
                                    this.getSwarmJson(this.advancedJson.contactSwarmDtoList[j]);
                                    break;
                                }
                            }
                        }
                        this.selectSwarmId = '';
                    } else {
                        //加载右侧条件编辑内容
                        for (let i = 0; i < this.advancedJson.contactSwarmDtoList.length; i++) {
                            if (this.advancedJson.contactSwarmDtoList[i].id === this.swarm.id) {
                                this.getSwarmJson(this.advancedJson.contactSwarmDtoList[i]);
                                break;
                            }
                        }
                    }
                })
                .catch(() => {
                    if (init === 'condition') this.selectSwarmId = '';
                });
        },
        //子分群条件组件加载完毕
        bunchConditionLoaded() {
            setTimeout(() => {
                this.bunchLoaded = true;
                this.swarm.hasChange = false;
            },300);
        },
        //分群条件变更标识
        swarmChange() {
            if (!this.calculatingOpen) this.swarm.hasChange = true;
        },
        //添加子分群弹窗
        openAddSwarm() {
            if (this.advancedJson.contactSwarmDtoList.length >= 20) {
                this.$toast(this.$t('swarm.createUp'), 'warn');
            } else if (this.swarm.id && this.swarm.hasChange) {
                this.selectSwarmId = 'add';
                this.saveModalOpen = true;
            } else {
                this.addSwarmName = '';
                this.addSwarmOpen = true;
            }
        },
        //确定添加子分群
        confirmAddSwarm() {
            if (this.addSwarmName === '') {
                this.swarmNameErrorText = this.$t('swarm.nameNoEmpty');
                this.$toast(this.$t('swarm.enterGroupName'), 'warn');
                return;
            }
            if (!COMMON_NAME_REGEXP.test(this.addSwarmName)) {
                this.swarmNameErrorText = this.$t('swarm.labelNameReg');
                this.$toast(this.$t('swarm.labelNameReg'), 'warn');
                return;
            }
            ContactApiV1
                .saveSwarm({
                    name: this.addSwarmName,
                    groupId: this.groupId,
                    type: 9,
                    parentId: this.advancedId,
                    operation: 0,
                    swarmJson: ''
                })
                .then((res) => {
                    let swarm = res.body.data;
                    this.bunchSwitch = false;
                    this.bunchLoaded = false;
                    this.swarm = {
                        name: swarm.name,
                        swarmJson: [],
                        id: swarm.id,
                        operation: 0,
                        calculating: false
                    };
                    this.$nextTick(() => {
                        this.bunchSwitch = true;
                    });
                    this.addSwarmOpen = false;
                    this.getAdvancedList();
                });
        },
        //取消添加子分群
        cancelAddSwarm() {
            this.swarmNameErrorText = '';
            this.addSwarmOpen = false;
        },
        //打开复制已有分群弹窗
        openCopySwarm() {
            if (this.advancedJson.contactSwarmDtoList.length >= 20) {
                this.$toast(this.$t('swarm.createUp'), 'warn');
            } else if (this.swarm.id && this.swarm.hasChange) {
                this.selectSwarmId = 'copy';
                this.saveModalOpen = true;
            } else {
                this.copySwarmOpen = true;
            }
        },
        /**
         * 选择复制的已有分群
         * @param arr {Array} 复制的分群ids
         */
        copySwarmSelectHandle(arr) {
            this.copySelectList = arr;
        },
        //确认复制已有分群
        confirmCopySwarm() {
            if (!this.copySelectList.length) {
                this.$toast(this.$t('swarm.selectSwarm'), 'warn');
                return;
            }
            this.listLoading = true;
            ContactApiV1
                .advancedCopySwarm({
                    id: this.advancedId,
                    copyIds: this.copySelectList
                })
                .then(() => {
                    this.getAdvancedList();
                    this.copySwarmOpen = false;
                    this.copySelectList = [];
                    this.isChange = true;
                })
                .catch(() => {
                    this.listLoading = false;
                });
        },
        //取消复制已有分群
        cancelCopySwarm() {
            this.copySwarmOpen = false;
            this.copySelectList = [];
        },
        /**
         * 删除分群
         * @param item 要删除的分群
         */
        openSwarmDel(item) {
            if (this.advancedJson.contactSwarmDtoList.length <= 1 && this.advancedJson.status === 2) {
                this.$toast(this.$t('swarm.atLeastOne'), 'warn');
            } else if (this.inCludeNum <= 1 && item.operation === 0) {
                this.$toast(this.$t('swarm.atLeastOneInclude'), 'warn');
            } else if (this.swarm.id && this.swarm.hasChange) {
                this.selectSwarmId = 'delete';
                this.saveModalOpen = true;
                this.delSwarm = {
                    name: item.name,
                    id: item.id
                };
            } else {
                this.delSwarmOpen = true;
                this.delSwarm = {
                    name: item.name,
                    id: item.id
                };
            }
        },
        //确认删除分群
        confirmSwarmDel() {
            ContactApiV1
                .deleteSwarm(this.delSwarm.id)
                .then(() => {
                    this.getAdvancedList();
                    if (this.swarm.id === this.delSwarm.id) {
                        this.bunchSwitch = false;
                        this.bunchLoaded = false;
                        this.swarm = {
                            name: '',
                            swarmJson: [],
                            id: '',
                            operation: 0,
                            calculating: false
                        };
                        this.$nextTick(() => {
                            this.bunchSwitch = true;
                        });
                    }
                    this.delSwarmOpen = false;
                    this.delSwarm = {};
                    this.isChange = true;
                });
        },
        //取消删除分群
        cancelSwarmDel() {
            this.delSwarmOpen = false;
            this.delSwarm = {};
        },
        /**
         * 编辑子分群
         * @param item 要编辑的分群
         */
        openSwarmEdit(item) {
            this.editSwarm = {
                id: item.id,
                name: item.name,
                groupId: this.groupId,
                operation: item.operation,
                type: 9
            };
            if (this.swarm.id && this.swarm.hasChange) {
                this.selectSwarmId = 'edit';
                this.saveModalOpen = true;
            } else {
                this.editSwarmOpen = true;
            }
        },
        //确认编辑子分群
        confirmEditSwarm() {
            if (this.editSwarmLoading) return;
            if (this.editSwarm.name === '') {
                this.swarmNameErrorText = this.$t('swarm.nameNoEmpty');
                this.$toast(this.$t('swarm.enterGroupName'), 'warn');
                return;
            }
            if (!COMMON_NAME_REGEXP.test(this.addSwarmName)) {
                this.swarmNameErrorText = this.$t('swarm.labelNameReg');
                this.$toast(this.$t('swarm.labelNameReg'), 'warn');
                return;
            }
            this.editSwarmLoading = true;
            ContactApiV1
                .swarmDetail(this.editSwarm.id)
                .then((res) => {
                    ContactApiV1
                        .updateSwarm({
                            swarmJson: res.body.data.swarmJson,
                            ...this.editSwarm
                        })
                        .then(() => {
                            this.editSwarmLoading = false;
                            this.swarmNameErrorText = '';
                            this.editSwarmOpen = false;
                            this.swarm.id = this.editSwarm.id;
                            this.getAdvancedList();
                        })
                        .catch(() => {
                            this.editSwarmLoading = false;
                        });
                })
                .catch(() => {
                    this.editSwarmLoading = false;
                });
        },
        //取消编辑子分群
        cancelEditSwarm() {
            this.swarmNameErrorText = '';
            this.editSwarmOpen = false;
        },
        /**
         * 选择子分群
         * @param swarm 选择的子分群
         */
        selectSwarm(swarm) {
            if (this.swarm.id === swarm.id) {
                return;
            }
            if (this.swarm.id && this.swarm.hasChange) {
                this.selectSwarmId = swarm.id;
                this.saveModalOpen = true;
            } else {
                this.getSwarmJson(swarm);
            }
        },
        /**
         * 获取子分群条件
         * @param swarm 子分群
         */
        getSwarmJson(swarm) {
            this.bunchSwitch = false;
            this.bunchLoaded = false;
            ContactApiV1
                .swarmDetail(swarm.id)
                .then((res) => {
                    let json = res.body.data.swarmJson ? JSON.parse(res.body.data.swarmJson) : [];
                    this.swarm = {
                        name: swarm.name,
                        swarmJson: json,
                        id: swarm.id,
                        operation: swarm.operation,
                        calculating: swarm.calculating
                    };
                    this.$nextTick(() => {
                        this.bunchSwitch = true;
                    });
                })
                .catch(() => {
                    this.$nextTick(() => {
                        this.bunchSwitch = true;
                    });
                });
        },
        //确定保存子分群
        confirmSave() {
            this.$refs.conditionBunch.valid();
            this.saveModalOpen = false;
        },
        //取消保存子分群
        cancelSave() {
            if (this.selectSwarmId === 'routeLeave') {
                this.swarm.hasChange = false;
                this.$router.push({
                    name: this.leaveToInfo.name,
                    query: this.leaveToInfo.query
                });
            } else  if (this.selectSwarmId === 'goback') {
                this.swarm.hasChange = false;
                this.$router.go(-1);
            } else if (this.selectSwarmId === 'add') {
                for (let i = 0; i < this.advancedJson.contactSwarmDtoList.length; i++) {
                    if (
                        this.advancedJson.contactSwarmDtoList[i].id === this.swarm.id &&
                        this.advancedJson.contactSwarmDtoList[i].status !== 0
                    ) {
                        this.advancedJson.contactSwarmDtoList[i].unValid = false;
                    }
                }
                this.$nextTick(() => {
                    this.addSwarmName = '';
                    this.addSwarmOpen = true;
                });
            } else if (this.selectSwarmId === 'copy') {
                this.copySwarmOpen = true;
            } else if (this.selectSwarmId === 'delete') {
                this.delSwarmOpen = true;
            } else if (this.selectSwarmId === 'edit') {
                this.editSwarmOpen = true;
            } else if (this.selectSwarmId === 'operation') {
                this.swarm.hasChange = false;
                this.changeRelation();
            } else if (this.selectSwarmId === 'calculate') {
                this.swarm.hasChange = false;
                this.calculateModalOpen();
            } else {
                for (let i = 0; i < this.advancedJson.contactSwarmDtoList.length; i++) {
                    if (
                        this.advancedJson.contactSwarmDtoList[i].id === this.swarm.id &&
                        this.advancedJson.contactSwarmDtoList[i].status !== 0
                    ) {
                        this.advancedJson.contactSwarmDtoList[i].unValid = false;
                    }
                    if (this.advancedJson.contactSwarmDtoList[i].id === this.selectSwarmId) {
                        this.getSwarmJson(this.advancedJson.contactSwarmDtoList[i]);
                    }
                }
            }
            this.$nextTick(() => {
                this.selectSwarmId = '';
                this.saveModalOpen = false;
            });
        },
        /**
         * 改变子分群包含关系
         * @param swarm 子分群
         */
        changeRelation(swarm) {
            if (this.operationSwarm.operation === '') {
                return;
            }
            if (swarm && swarm.id ) {
                this.operationSwarm = {
                    id: swarm.id,
                    name: swarm.name,
                    groupId: this.groupId,
                    operation: swarm.operation,
                    type: 9
                };
            }
            if (this.swarm.id && this.swarm.hasChange) {
                this.selectSwarmId = 'operation';
                this.saveModalOpen = true;
            } else {
                if (this.inCludeNum <= 1 && this.operationSwarm.operation === 0) {
                    this.operationSwarm = {};
                    this.$toast(this.$t('swarm.atLeastOneInclude'), 'warn');
                    return;
                }
                let ope = this.operationSwarm.operation;
                this.operationSwarm.operation = '';
                ContactApiV1
                    .swarmDetail(this.operationSwarm.id)
                    .then((res) => {
                        ContactApiV1
                            .updateSwarm({
                                id: this.operationSwarm.id,
                                name: this.operationSwarm.name,
                                groupId: this.groupId,
                                operation: ope === 0 ? 1 : 0,
                                swarmJson: res.body.data.swarmJson,
                                type: 9
                            })
                            .then(() => {
                                for (let i = 0; i < this.advancedJson.contactSwarmDtoList.length; i++) {
                                    if (this.advancedJson.contactSwarmDtoList[i].id === this.operationSwarm.id) {
                                        this.advancedJson.contactSwarmDtoList[i].operation = ope === 0 ? 1 : 0;
                                    }
                                }
                                if (this.operationSwarm.id === this.swarm.id) {
                                    this.swarm.operation = ope === 0 ? 1 : 0;
                                }
                                this.operationSwarm = {};
                                this.isChange = true;
                            })
                            .catch(() => {
                                this.operationSwarm = {};
                            });
                    })
                    .catch(() => {
                        this.operationSwarm = {};
                    });
            }
        },
        // 确认修改并计算子分群条件
        calculateSwarm() {
            this.selectSwarmId = '';
            this.$refs.conditionBunch.valid();
        },
        /**
         * 子分群条件校验通过后，处理数据
         * @param swarmJson {String} 子分群条件内容
         */
        handleCondition(swarmJson) {
            let json = JSON.parse(swarmJson);
            this.listLoading = true;
            for (let i = 0; i < this.advancedJson.contactSwarmDtoList.length; i++) {
                if (this.advancedJson.contactSwarmDtoList[i].id === this.swarm.id) {
                    this.swarm.swarmJson = json;
                    this.swarm.calculating = true;
                    ContactApiV1
                        .updateSwarm({
                            id: this.swarm.id,
                            name: this.swarm.name,
                            groupId: this.groupId,
                            operation: this.swarm.operation,
                            swarmJson: swarmJson,
                            type: 9
                        })
                        .then(() => {
                            if (this.swarm.hasChange) this.isChange = true;
                            this.swarm.calculating = false;
                            this.swarm.hasChange = false;
                            this.getAdvancedList('condition');
                            if (this.selectSwarmId === 'routeLeave') {
                                this.saveModalOpen = false;
                                this.reCalculateModal = true;
                            } else if (this.selectSwarmId === 'goback') {
                                //保存后返回上一页
                                this.$router.go(-1);
                            }
                        })
                        .catch(() => {
                            this.selectSwarmId = '';
                            this.listLoading = false;
                            this.swarm.calculating = false;
                            this.swarm.unValid = false;
                        });
                    return;
                }
            }
        },
        /**
         * 检验未通过
         * @param boolean {Boolean} 检验是否通过
         */
        unvalid(boolean) {
            for (let i = 0; i < this.advancedJson.contactSwarmDtoList.length; i++) {
                if (this.advancedJson.contactSwarmDtoList[i].id === this.swarm.id) {
                    if (boolean) {
                        this.advancedJson.contactSwarmDtoList[i].unValid = true;
                    } else {
                        this.advancedJson.contactSwarmDtoList[i].unValid = false;
                    }
                    break;
                }
            }
        },
        //编辑保存高级分群
        advancedConfirm() {
            if (this.advancedJson.name === '') {
                this.$toast(this.$t('swarm.enterGroupName'), 'warn');
                this.nameErrorText = this.$t('swarm.nameNoEmpty');
                return;
            }
            if (!COMMON_NAME_REGEXP.test(this.advancedJson.name)) {
                this.$toast(this.$t('swarm.labelNameReg'), 'warn');
                this.nameErrorText = this.$t('swarm.labelNameReg');
                return;
            }
            if (this.treeParams.treeActiveGid === '') {
                this.$toast(this.$t('swarm.pickAGroup'), 'warn');
                return;
            }
            ContactApiV1
                .updateSwarm({
                    id: this.advancedId,
                    name: this.advancedJson.name,
                    groupId: this.treeParams.treeActiveGid,
                    operation: 0,
                    swarmJson: '',
                    type: 8
                })
                .then(() => {
                    this.advancedModalOpen = false;
                    this.advancedName = this.advancedJson.name;
                    this.groupId = this.treeParams.treeActiveGid;
                    this.$router.replace({
                        name: 'advancedSwarm',
                        query: {id: this.advancedId, groupId: this.groupId}
                    });
                    this.$toast(this.$t('common.updateSuccess'), 'success');
                })
                .catch(() => {
                    this.cancelAdvanced();
                });
        },
        //取消编辑高级分群
        cancelAdvanced() {
            this.nameErrorText = '';
            this.advancedModalOpen = false;
            this.advancedJson.name = this.advancedName;
            this.treeParams.treeActiveGid = this.groupId;
            this.initGroup();
        },
        //开始计算
        calculateModalOpen() {
            this.reCalculateModal = false;
            if (this.advancedJson.contactSwarmDtoList.length === 0) {
                this.$toast(this.$t('swarm.atLeastOne'), 'warn');
                return;
            }
            let num = 0;
            for (let i = 0; i < this.advancedJson.contactSwarmDtoList.length; i++) {
                if (this.advancedJson.contactSwarmDtoList[i].status === 0) {
                    num++;
                    this.advancedJson.contactSwarmDtoList[i].unValid = true;
                }
            }
            if (num >= 1) {
                this.$toast(this.$t('swarm.someUncalculate'), 'warn');
                return;
            }
            this.calculateOpenLoad = false;
            if (this.swarm.id && this.swarm.hasChange) {
                this.calculateOpenLoad = true;
                this.selectSwarmId = 'calculate';
                this.saveModalOpen = true;
            }
            if (!this.calculateOpenLoad) {
                if (this.calculateSeconds >= 10) {
                    this.calculateOpen = true;
                } else {
                    this.calculateConfirm();
                }
            }
        },
        //确认计算
        calculateConfirm() {
            if (this.calculateOpenLoad) {
                return;
            }
            this.calculateOpenLoad = true;
            ContactApiV1
                .advancedCalculation(this.advancedId)
                .then((res) => {
                    this.calculateOpen = false;
                    this.calculatingOpen = true;
                    this.getAdvancedList();
                    if (res.body.data && res.body.data.swarmId && res.body.data.swarmId.length) {
                        this.calculatingOpen = false;
                        this.isChange = false;
                        this.$toast(this.$t('swarm.calculateFail'), 'warn');
                    } else {
                        //每隔5s查询计算结果
                        let getStatus = setInterval(() => {
                            ContactApiV1
                                .getAdvancedStatus(this.advancedId)
                                .then((ress) => {
                                    //计算完成
                                    if (ress.body.data.status === 2) {
                                        clearInterval(getStatus);
                                        this.getAdvancedList();
                                        this.calculatingOpen = false;
                                        this.isChange = false;
                                        this.$toast(this.$t('swarm.calculateSuccess'), 'success');
                                        if (this.$route.name === 'swarm') {
                                            Bus.$emit('swarmListUpdate');
                                        }
                                    }
                                    //计算失败
                                    if (ress.body.data.status === 3) {
                                        clearInterval(getStatus);
                                        this.calculatingOpen = false;
                                        this.$toast(this.$t('swarm.calculateFail'), 'warn');
                                    }
                                });
                        },5000);
                    }
                })
                .catch(() => {
                    this.calculateOpen = false;
                });
        },
        //返回列表
        backToList() {
            this.selectSwarmId = 'goback';
            this.$router.go(-1);
        },
        //返回
        goBack() {
            this.selectSwarmId = 'goback';
            if (this.swarm.id && this.swarm.hasChange) {
                this.saveModalOpen = true;
            } else {
                this.$router.go(-1);
            }
        },
        confirmJump() {
            this.isChange = false;
            this.$router.push({
                name: this.leaveToInfo.name,
                query: this.leaveToInfo.query
            });
        }
    }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../common/scss/base/variables';
@import '../../common/scss/base/mixin';

.advanced-swarm{
    .page-head{
        height: 32px;
        padding: 10px 0;
        overflow: hidden;
        .form-field + .form-field {
            margin: 0 0 0 1em;
        }
        .form-field {
            // .label {
            //     width: 60px;
            // }
            #advancedName,#advancedGroup{
                background-color: #ffffff;
            }
        }
        .btn{
            width: 120px;
            margin-left: 10px;
        }
        .advanced-icon{
            display: inline-block;
            width: 16px;
            height: 16px;
            margin-top: 8px;
        }
        .icon-pencil{
            margin-left: 30px;
        }
    }
    .page-content{
        border-top: 1px solid #cccccc;
        background-color: #ffffff;
        .left-side{
            float: left;
            width: 300px;
            height: 100%;
            border-right: 1px solid #cccccc;
            overflow: auto;
            .swarm-item{
                display: inline-block;
                width: 100%;
                height: 70px;
                line-height: 24px;
                padding: 5px 10px;
                box-sizing: border-box;
                border-bottom: 1px solid $border-color;
                cursor: default;
                .item-left{
                    float: left;
                    width: 100px;
                    text-align: center;
                    padding: 6px 0;
                    span{
                        float: left;
                        display: inline-block;
                        width: 100%;
                        overflow: hidden;
                    }
                }
                .item-calculationTime{
                    width: 100%;
                    float: left;
                    color: $color-light-content;
                    margin-top: -15px;
                }
                .item-opt{
                    position: relative;
                    margin-top: 15px;
                    .item-icon{
                        display: inline-block;
                        width: 16px;
                        height: 16px;
                        background-color: $green;
                        fill: #ffffff;
                        border-radius: 5px;
                        padding: 2px;
                    }
                    .hidden-menu{
                        width: 170px;
                        top: $input-field-height;
                        right: 0;
                        @include transform-origin(right top);
                        .btn{
                            width: 100%;
                            border-radius: 0;
                            color: $color-light-content;
                            display: block;
                            text-align: left;
                            margin: 0;
                            cursor: pointer;

                            &:hover{
                                color: $color-content;
                                background-color: #f0f0f0;
                            }
                        }
                    }
                }
                &.active{
                    background-color: $select-bg;
                    .item-opt{
                        .item-icon{
                            background-color: $select-bg;
                        }
                    }
                }
                &.item-err{
                    border: 1px solid $red;
                }
            }
            .item-list{
                position: relative;
                .item-left{
                    width: 270px;
                    text-align: left;
                    cursor: pointer;
                    line-height: 32px;
                    padding: 0 0 0 10px;
                    .item-name{
                        width: 245px;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                    .item-include,.item-exclude{
                        width: auto;
                        height: 18px;
                        line-height: 18px;
                        border-radius: 9px;
                        padding: 0 5px;
                        margin-top: 5px;
                    }
                    .item-include{
                        color: $light-green;
                        border: 1px solid $light-green;
                    }
                    .item-exclude{
                        color: $light-red;
                        border: 1px solid $light-red;
                    }
                    .item-opt-change{
                        width: auto;
                    }
                    .item-num{
                        span{
                            width: auto;
                            font-size: 14px;
                            line-height: 24px;
                            max-width: 180px;
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                        }
                        svg{
                            display: inline-block;
                            width: 18px;
                            height: 18px;
                            margin: 3px 5px;
                        }
                        .icon-loading{
                            float: right;
                            margin-top: -3px;
                        }
                    }
                }
                .item-opt{
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    margin: 0;
                    .item-icon{
                        background-color: #ffffff;
                        fill: #000000;
                    }
                    .hidden-menu{
                        top: 24px;
                        width: 130px;
                        .btn {
                            width: 100%;
                            border-radius: 0;
                            &:hover{
                                color: $color-content;
                                background-color: #f0f0f0;
                            }
                        }
                    }
                }
            }
            .list-loading{
                margin: 38vh auto 0;
            }
        }
        .right-side {
            width: calc(100% - 305px);
            height: calc(100% - 2em - 1px);
            margin-top: 2em;
            padding-left: 2em;
            overflow: auto;
            box-sizing: border-box;
            .condition-main{
                width: 100%;
                .condition-bunch{
                    width: 950px;
                }
            }
            & > button{
                width: 100px;
                margin-top: 5em;
                margin-left: 2em;
            }
        }
        .no-data{
            display: block;
            width: 100%;
            height: 100%;
            font-size: 14px;
            line-height: calc(100vh - #{$header-height + $toolbar-height + $page-head-height + $input-field-height});
            text-align: center;
        }
    }
    .edit-modal{
        .choose-parent {
            display: inline-block;
            position: relative;
            width: 312px;
            $option-height: $input-field-height;
            $border-radius: 4px;
            $hover-bg: #f8f9fa;

            .select-text {
                position: relative;
                display: block;
                @include box-sizing();
                padding-right: $option-height - 2px;
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
                position: fixed;
                width: 310px;
                background-color: white;
                border: 1px solid $border-color;
                border-top: none;
                z-index: $index-container;
            }
        }
    }
    .calculate-open,.calculating-open{
        p{
            font-size: 14px;
            text-align: center;
        }
        .modal-content{
            padding: 50px 0;
        }
        .inline-loading{
            margin: 0 auto;
        }
    }
    .calculating-open{
        .modal-head{
            display: none;
        }
    }
    .save-modal{
        .form-field{
            text-align: center;
        }
        .modal-closer{
            display: none;
        }
    }
}
</style>
