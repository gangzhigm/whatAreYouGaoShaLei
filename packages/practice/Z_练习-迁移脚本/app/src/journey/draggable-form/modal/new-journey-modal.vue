<template>
    <modal class="new-journey-modal" :title="$t('newJourney.create')" neat size="md-lg" @close="closeNewJourney()">
        <div class="journey-type-tabs">
            <div class="journey-type" @click="chooseType(2)" :class="{active: journeyType === 2}">
                {{'newJourney.realTime' | t}}
            </div>
            <div class="journey-type" @click="chooseType(0)" :class="{active: journeyType === 0}">
                {{'newJourney.simple' | t}}
            </div>
            <div class="journey-type" @click="chooseType(1)" :class="{active: journeyType === 1}">
                {{'newJourney.recurring' | t}}
            </div>
        </div>
        <!--华为1.5期 时区-->
        <div class="center-form time-zone">
            <div class="form-field flex">
                <label class="label">{{'newJourney.selectTimeZone' | t}}</label>
                <selector class="xl" :options="timeZoneList" search v-model="timeZone"></selector>
            </div>
            <div class="form-field flex" v-if="journeyType !== 2">
                <label class="label">{{'newJourney.language' | t}}</label>
                <selector class="xl" :options="languageSelectList" v-model="selectLanguage"></selector>
                <i class="icon icon-yiwen1" v-title:left.line="$t('newJourney.languageTip')"></i>
            </div>
        </div>
        <div class="center-form" v-if="journeyType===2&&!requestLoading">
            <div class="form-field flex">
                <label class="label" for="journeyName">{{'journey.journeyName' | t}}</label>
                <input class="input margin-right" type="text" maxlength="200" :placeholder="$t('journey.journeyNameHolder')" v-model.trim="journeyName" id="journeyName">
            </div>
            <div class="form-field flex">
                <span class="label placeholder">{{'newJourney.group' | t}}</span>
                <radio source="use" v-model="groupSource">{{'newJourney.selectGroup' | t}}</radio>
                <radio source="create" v-model="groupSource" :disabled="$has('journey_manage_add_group')">
                    {{'newJourney.addGroup' | t}}
                </radio>
            </div>
            <div class="form-field flex" v-if="groupSource === 'create'">
                <label class="label" for="create"></label>
                <input type="text" class="input hg" id="create" :placeholder="$t('newJourney.groupName')" v-model.trim="groupName" maxlength="255" />
            </div>
            <div class="form-field flex">
                <label class="label placeholder" for="use">
                    {{groupSource === 'create' ? $t('common.parentGroup') : $t('newJourney.selectGroup')}}
                </label>
                <div class="choose-parent" id="use" @click.stop="readyCheckGroup">
                    <label class="select-text">
                        {{parentGroupName || $t('journey.journeyGroupHolder')}}
                        <span class="select-icon icon icon-arrow-down"></span>
                    </label>
                    <!--实时触发-->
                    <div class="search-tree-wrapper" v-if="groupSelectShow" @click.stop>
                        <search-tree :searchTreeData="totalTreeArry" :treeActiveId="selectGroupId" @getTreeAct='getTreeAct' :action="false" :levelStage="groupSource === 'use'"></search-tree>
                    </div>
                </div>
            </div>
            <div class="form-field flex">
                <label class="label">{{'controller.groups' | t}}</label>
                <selector class="margin-right" v-model="swarmId" :options="swarmOptions" search=""></selector>
            </div>
            <div class="form-field flex">
                <label class="label">{{'controller.trigger' | t}}</label>
                <radio :value="trigger" :source="0" @input="changeTrigger">{{'controller.activity' | t}}</radio>
                <radio :value="trigger" :source="1" @input="changeTrigger">{{'controller.updates' | t}}</radio>
            </div>
            <div class="form-field flex">
                <label class="label placeholder"></label>
                <eventModal ref="eventModal" :optionType="trigger?'newJourneyAttr':'newJourneyEvent'" :settingsObj.sync="settings" :errMsg.sync="errMsg" :summary.sync="summary"></eventModal>
            </div>
            <div class="form-field">
                <label class="label placeholder"></label>
                <checkbox v-model="incremental">{{'controller.repeat' | t}}</checkbox>
                <i class="action-icon icon icon-help" v-title:bottom="$t('controller.repeatTip')"></i>
            </div>
            <div class="form-field">
                <restrictions v-if="isHw" ref='restrictions' :journeyType=journeyType :restrictionsType=restrictionsType :showLog='false'></restrictions>
            </div>
        </div>
        <div class="center-form" v-if="journeyType===0">
            <div class="form-field flex">
                <label class="label">{{'journey.journeyName' | t}}</label>
                <input class="input margin-right" type="text" maxlength="200" :placeholder="$t('journey.journeyNameHolder')" v-model.trim="journeyName">
            </div>
            <div class="form-field flex">
                <span class="label placeholder">{{'newJourney.group' | t}}</span>
                <radio source="use" v-model="groupSource">{{'newJourney.selectGroup' | t}}</radio>
                <radio source="create" v-model="groupSource" :disabled="$has('journey_manage_add_group')">
                    {{'newJourney.addGroup' | t}}
                </radio>
            </div>
            <div class="form-field flex" v-if="groupSource === 'create'">
                <label class="label" for="create1"></label>
                <input type="text" class="input hg" id="create1" :placeholder="$t('newJourney.groupName')" v-model.trim="groupName" maxlength="255" />
            </div>
            <div class="form-field flex">
                <label class="label placeholder" for="use1">
                    {{groupSource === 'create' ? $t('common.parentGroup') : $t('newJourney.selectGroup')}}
                </label>
                <div class="choose-parent" id="use1" @click.stop="readyCheckGroup">
                    <label class="select-text">
                        {{parentGroupName || $t('journey.journeyGroupHolder')}}
                        <span class="select-icon icon icon-arrow-down"></span>
                    </label>
                    <div class="search-tree-wrapper" v-if="groupSelectShow" @click.stop>
                        <search-tree :searchTreeData="totalTreeArry" :treeActiveId="selectGroupId" @getTreeAct='getTreeAct' :action="false" :levelStage="groupSource === 'use'"></search-tree>
                    </div>
                </div>
            </div>
            <div class="form-field">
                <restrictions v-if="isHw" ref='restrictions' :journeyType=journeyType :restrictionsType=restrictionsType :showLog='false'></restrictions>
            </div>
        </div>
        <div class="center-form" v-if="journeyType===1">
            <div class="form-field flex">
                <label class="label">{{'journey.journeyName' | t}}</label>
                <input class="input margin-right" type="text" maxlength="200" :placeholder="$t('journey.journeyNameHolder')" v-model.trim="journeyName">
            </div>
            <div class="form-field flex">
                <span class="label placeholder">{{'newJourney.group' | t}}</span>
                <radio source="use" v-model="groupSource">{{'newJourney.selectGroup' | t}}</radio>
                <radio source="create" v-model="groupSource" :disabled="$has('journey_manage_add_group')">
                    {{'newJourney.addGroup' | t}}
                </radio>
            </div>
            <div class="form-field flex" v-if="groupSource === 'create'">
                <label class="label" for="create2"></label>
                <input type="text" class="input hg" id="create2" :placeholder="$t('newJourney.groupName')" v-model.trim="groupName" maxlength="255" />
            </div>
            <div class="form-field flex">
                <label class="label placeholder" for="use2">
                    {{groupSource === 'create' ? $t('common.parentGroup') : $t('newJourney.selectGroup')}}
                </label>
                <div class="choose-parent" id="use2" @click.stop="readyCheckGroup">
                    <label class="select-text">
                        {{parentGroupName || $t('journey.journeyGroupHolder')}}
                        <span class="select-icon icon icon-arrow-down"></span>
                    </label>
                    <div class="search-tree-wrapper" v-if="groupSelectShow" @click.stop>
                        <search-tree :searchTreeData="totalTreeArry" :treeActiveId="selectGroupId" @getTreeAct='getTreeAct' :action="false" :levelStage="groupSource === 'use'"></search-tree>
                    </div>
                </div>
            </div>
            <div class="form-field">
                <label class="label">{{'newJourney.period' | t}}</label>
                <radio v-model="canvasSettings.repeatTypeSelect" :source="0">{{'newJourney.daily' | t}}</radio>
                <radio v-model="canvasSettings.repeatTypeSelect" :source="1">{{'newJourney.weekly' | t}}</radio>
                <radio v-model="canvasSettings.repeatTypeSelect" :source="2">{{'newJourney.monthly' | t}}</radio>
            </div>
            <div class="form-field flex">
                <label class="label">{{'newJourney.every' | t}}</label>
                <div class="field-group">
                    <number-input class="input tiny" :min="1" maxlength="3" v-model="canvasSettings.frequency" />
                    <template v-if="canvasSettings.repeatTypeSelect === 0">{{'newJourney.day' | t}}</template>
                    <template v-if="canvasSettings.repeatTypeSelect === 1">{{'newJourney.week' | t}}</template>
                    <template v-if="canvasSettings.repeatTypeSelect === 2">{{'newJourney.month' | t}}</template>
                </div>
            </div>
            <div class="form-field flex">
                <label class="label">{{'newJourney.ends' | t}}</label>
                <div class="field-group">
                    <selector v-model="canvasSettings.endDateSelect" class="md" :options="canvasSettings.endDateTypeOptions" @select="resetRepeatSettings()"></selector>
                    <number-input v-if="canvasSettings.endDateSelect !== 2" class="input tiny" :min="1" maxlength="3" v-model="canvasSettings.endDate" />
                    <template v-if="canvasSettings.endDateSelect === 0">{{'newJourney.times' | t}}</template>
                    <template v-if="canvasSettings.endDateSelect === 1">{{'newJourney.days' | t}}</template>
                    <calendar v-if="canvasSettings.endDateSelect===2" v-model="canvasSettings.endTime" format="yyyy-mm-dd hh:ii" :start="currentTime" />
                    {{'newJourney.info' | t}}
                </div>
            </div>
            <div class="form-field">
                <restrictions v-if="isHw" ref='restrictions' :journeyType=journeyType :restrictionsType=restrictionsType :isDisabled='true' :showLog='false'></restrictions>
            </div>
        </div>
        <template v-slot:buttons>
            <button type="button" class="btn btn-md btn-white" :disabled="preventButton" @click.stop="closeNewJourney()">
                {{'common.cancel' | t}}
            </button>
            <button type="button" class="btn btn-md btn-theme" :disabled="preventButton" @click.stop="createJourney()">
                {{'common.confirm' | t}}
            </button>
        </template>
    </modal>
</template>
<script type="text/ecmascript-6">

import { ContactApiV1, JourneyApiV3 } from '@/api';
import eventModal
    from '../canvas/controller/sub-controllers/event-condition-controller/event-modal/event-modal.vue';
import format from 'date-fns/format';
import { START_CONTROLLER } from '../canvas/controller/CONTROLLER_TYPES';
import { TIME_ZONE_RNAGES } from '../../../common/utils/timeZone';
import { COMMON_NAME_REGEXP } from '../../../common/utils/regs';
import restrictions from '../../restrictions.vue';
import { mapState } from 'vuex';

export default {
    data () {
        return {
            restrictionsType: 'newJourey',
            requestLoading: false,  //  请求加载
            trigger: 0, //  触发条件
            swarmId: '',    //受众分群id
            swarmOptions: [{ id: '', name: this.$t('controller.noLimit') }],  //受众分群选项
            settings: {},   //设置的实时触发条件
            incremental: 0, //是否允许统一联系人重复参与
            journeyType: 2, //旅程类型
            journeyName: '',    //旅程name
            canvasSettings: {   //设置
                noRepeat: true, //是否重复
                repeatTypeOptions: [ //重复周期
                    { id: 0, name: this.$t('common.day') },
                    { id: 1, name: this.$t('common.week') },
                    { id: 2, name: this.$t('common.month') }
                ],
                repeatTypeSelect: 0,    //重复类型选择
                frequency: '',  //频率
                endDateTypeOptions: [ //结束日期类型选项
                    { id: 0, name: this.$t('common.noOfTimes') },
                    { id: 1, name: this.$t('common.noOfDays') },
                    { id: 2, name: this.$t('common.absoluteDate') }
                ],
                endDateSelect: 0,   //结束日期选择
                endDate: '',    //结束日期
                endTime: '',    //结束时间
                language: this.selectLanguage,  //语言
            },
            currentTime: '',    //当前时间
            preventButton: false,   //按钮是否可点
            selectGroupId: '',  //选中的分组id
            groupSource: 'use',   // use 使用已有的分组 create 创建新的标签
            groupName: '',  //分组name
            timeZoneList: TIME_ZONE_RNAGES,  //时区列表
            timeZone: '',   //时区
            languageSelectList: [   //语言选择下拉菜菜单
                { id: 0, name: this.$t('newJourney.all') },
                { id: 1, name: this.$t('newJourney.chinese') },
                { id: 2, name: this.$t('newJourney.others') }
            ], // 语言选择
            selectLanguage: '', //选中的语言

            treeData: '',
            totalTreeArry: [],
            parentGroupName: '',    //父级分组name
            parentGroupId: '',      //父级分组id
            groupSelectShow: false, //分组下拉菜单是否显示
            sortType: 1,    //类型
            errMsg: '',  //错误信息
            summary: '',    //实时触发-触发条件选项的文字显示
        };
    },
    created () {
        // jira 2566 客戶分群 => 旅程 添加默认分区
        if (this.$route.params.swarmId)
            this.swarmId = this.$route.params.swarmId;
        this.selectGroupId = this.$route.params.groupId || '';
        this.currentTime = format(new Date(), 'YYYY-MM-DD');
        ContactApiV1.getSwarms()
            .then(res => {
                this.swarmOptions = this.swarmOptions.concat(res.body.data.swarmList)
                    .filter(swarm => swarm.id !== this.hiddenId);
                this.requestLoading = false;
            });
        this.getGroupListRequest();

        // 系统配置语言和时区
        this.selectLanguage = this.user.language;
        this.timeZone = this.user.timeZone;
        //点击其他地方下拉菜单收起
        window.addEventListener('click', this.eventListener);
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
         * 选择类型
         * @param e
         */
        chooseType (e) {
            this.journeyType = e;
        },
        //关闭新建弹窗
        closeNewJourney () {
            this.$emit('close');
        },
        /**
         * 更改触发条件
         * @param newTrigger 触发条件
         */
        changeTrigger (newTrigger) {
            if (newTrigger !== this.trigger) {
                this.settings = {};
            }
            this.trigger = newTrigger;
        },
        // 新建旅程
        async createJourney () {
            if (!this.timeZone) {
                return this.$toast(this.$t('personal.timeZoneNoEmpty'), 'warn');
            }
            if (this.selectLanguage === '' && this.journeyType !== 2) {
                return this.$toast(this.$t('newJourney.selectLng'), 'warn');
            }
            if (this.journeyName === '') {
                this.$toast(this.$t('newJourney.nameWarn'), 'warn');
                return;
            }
            if (this.journeyType === 2) {
                if (this.errMsg !== '') {
                    this.$toast(this.errMsg, 'warn');
                    return;
                }
                this.$refs.eventModal.updateSummary();
            } else if (this.journeyType === 1) {
                if (!this.canvasSettings.frequency || isNaN(parseInt(this.canvasSettings.frequency))) {
                    this.$toast(this.$t('newJourney.repeatRate'), 'warn');
                    return;
                } else if (parseInt(this.canvasSettings.frequency) <= 0 || this.canvasSettings.frequency === '0') {
                    this.$toast(this.$t('newJourney.repeatRateA'), 'warn');
                    return false;
                }
                if (this.canvasSettings.endDateSelect === 2) {
                    if (this.canvasSettings.endTime === '') {
                        this.$toast(this.$t('newJourney.endLimit'), 'warn');
                        return false;
                    }
                } else {
                    if (!this.canvasSettings.endDate) {
                        this.$toast(this.$t('newJourney.endLimit'), 'warn');
                        return false;
                    } else if (parseInt(this.canvasSettings.endDate) <= 0 || this.canvasSettings.endDate === '0') {
                        this.$toast(this.$t('newJourney.endLimitA'), 'warn');
                        return false;
                    }
                }
            }
            // {{'newJourney.addGroup' | t}}
            if (this.groupSource === 'create') {
                this.selectGroupId = '';

                // 分组名称校验
                if (!this.groupName) {
                    this.$toast(this.$t('newJourney.groupNameWarn'), 'warn');
                    return false;
                }
                if (this.groupName && !COMMON_NAME_REGEXP.test(this.groupName)) {
                    this.$toast(this.$t('common.filterName'), 'warn');
                    return false;
                }
                await JourneyApiV3
                    .createGroup({
                        name: this.groupName,
                        parentId: this.parentGroupId
                    })
                    .then((res) => {
                        this.selectGroupId = res.body.data.group.id;
                    });
                this.parentGroupId = '';
            } else { //选择已有分组
                if (this.selectGroupId === '') {
                    this.$toast(this.$t('newJourney.groupSelect'), 'warn');
                    return;
                }
            }
            this.$nextTick(() => {
                this.createJourneyRequest(this.computeJourneyInfo());
            });
        },
        //计算旅程信息
        computeJourneyInfo () {
            // 0 = 按次数(repeatCount), 1 = 按天数(relativeTime), 2 = 绝对日期(repeatEndDate)
            let temp = {
                journeyName: '',
                relativeTime: '',
                repeatFrequency: '',
                repeatEndDate: '',
                repeatCount: '',
                incremental: '',
                canvasInformation: JSON.stringify(this.canvasInformation),
                relativeDate: '',
                systemType: 1,
                journeyType: this.journeyType,
                groupId: this.selectGroupId,
                language: this.selectLanguage,
                timeZone: this.timeZone,
                qualification: this.$refs.restrictions ? this.$refs.restrictions.qualification : null,
                hwContactNull: this.$refs.restrictions ? this.$refs.restrictions.hwContactNull : null
            };
            temp.journeyName = this.journeyName;
            if (this.journeyType === 2) {
                temp.incremental = this.incremental;
            } else {
                if (this.canvasSettings.repeatTypeSelect === 0) {
                    temp.repeatFrequency = this.canvasSettings.frequency;
                } else if (this.canvasSettings.repeatTypeSelect === 1) {
                    temp.repeatFrequency = this.canvasSettings.frequency * 7;
                } else if (this.canvasSettings.repeatTypeSelect === 2) {
                    temp.repeatFrequency = this.canvasSettings.frequency * 30;
                }
                if (this.canvasSettings.endDateSelect === 0) {
                    temp.repeatCount = this.canvasSettings.endDate;
                } else if (this.canvasSettings.endDateSelect === 1) {
                    temp.relativeTime = this.canvasSettings.endDate;
                } else if (this.canvasSettings.endDateSelect === 2) {
                    temp.repeatEndDate = this.canvasSettings.endTime;
                    temp.repeatCount = '';
                    temp.relativeTime = '';
                }

                temp.relativeType = 0;
            }
            return temp;
        },
        //重置重复设置
        resetRepeatSettings () {
            this.canvasSettings.endDate = '';
            this.canvasSettings.endTime = '';
        },
        /**
         * 确定创建旅程
         * @param journeyInfo {Object} 旅程info
         */
        createJourneyRequest (journeyInfo) {
            this.preventButton = true;
            JourneyApiV3.createJourney(journeyInfo)
                .then((res) => {
                    this.$router.replace({ name: 'draggableJourney', params: { id: res.body.data.journey.id } });
                })
                .catch(() => {
                    this.preventButton = false;
                });
        },
        // 获取分组列表
        getGroupListRequest () {
            this.totalTreeArry = [];
            let test = [];
            JourneyApiV3
                .getGroupList(this.sortType)
                .then((res) => {
                    this.reviewCount = res.body.data.reviewCount;
                    this.treeData = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                    this.totalTreeArry.push(this.treeData);
                    this.$traverseTree(this.totalTreeArry, test);
                    this.totalTreeArry = test;

                    //查找到 "全部分组"
                    let firstGroup = this.$getCurrentPart(2, this.totalTreeArry);
                    firstGroup.noSelect = false;

                    // 选中默认分组
                    let r = this.$getCurrentPart(this.sortType, firstGroup.childs);
                    let defaultId = r.id;
                    let routeId = this.$route.params.groupId;
                    if (!routeId || routeId === defaultId || routeId <= 0) {
                        this.selectGroupId = defaultId;
                        this.parentGroupName = r.name;
                    } else {
                        this.selectGroupId = routeId;
                        let p = this.$getPartById(Number(this.selectGroupId), this.totalTreeArry);
                        this.parentGroupName = p.name;
                    }
                    this.fathersOpen(this.totalTreeArry, Number(this.selectGroupId));
                });
        },
        //  准备选择分组
        readyCheckGroup () {
            this.groupSelectShow = !this.groupSelectShow;
        },
        //通用方法 下拉菜单的收起
        eventListener () {
            this.groupSelectShow = false;
        },
        /**
         * search-tree中选择list的某一项时  接收选中项
         * @param group {Object} 分组
         */
        getTreeAct (group) {
            this.selectGroupId = group.id;
            this.parentGroupName = group.name;
            this.parentGroupId = group.id;
            this.groupId = group.id;
            this.groupSelectShow = false;
        },
    },
    computed: {
        ...mapState({
            user: state => state.user,
            // 特殊id,用于隐藏'全部联系人'项
            hiddenId: state => state.canvasStore.hiddenId
        }),
        // 华为类型账号
        isHw () {
            return this.user.companyType === 1;
        },
        // 重复周期
        frequencyUnit () {
            if (this.canvasSettings.repeatTypeSelect === 0) return this.$t('common.day');
            if (this.canvasSettings.repeatTypeSelect === 1) return this.$t('common.week');
            if (this.canvasSettings.repeatTypeSelect === 2) return this.$t('common.month');
        },
        /**
         * 画布详情
         * @returns {{width: number, controllers: {}, timeZone: *, milestones: [], height: number}|{width: number, controllers: {'1': *}, timeZone: *, milestones: [], height: number}}
         */
        canvasInformation () {
            if (this.journeyType === 2) {
                let con = {
                    id: 1,
                    name: this.$t('dragJourney.start'),
                    type: START_CONTROLLER,
                    summary: this.summary,
                    left: 40,
                    top: 280,
                    input: [],
                    output: [],
                    processInfo: {
                        type: 'start',
                        swarmId: this.swarmId,
                        tigger: this.trigger,
                        decision: { isInteraction: 0, settings: this.settings },
                        incremental: this.incremental
                    }
                };
                return {
                    width: 1920,
                    height: 1200,
                    milestones: [],
                    controllers: { 1: con },
                    timeZone: this.timeZone
                };
            }
            return { width: 1920, height: 1200, milestones: [], controllers: {}, timeZone: this.timeZone };
        },
    },
    watch: {
        'canvasSettings.repeatTypeSelect' (val) {
            if (val === 3) {
                this.canvasSettings.noRepeat = true;
            } else {
                this.canvasSettings.noRepeat = false;
                if (!this.canvasSettings.frequency || isNaN(parseInt(this.canvasSettings.frequency))) {
                    this.canvasSettings.frequency = 1;
                }
                if (!this.canvasSettings.endDate) this.canvasSettings.endDate = 1;
            }
        },
        eventOptions () {
            this.eventId = '';
        },
        // 新建、选择分组时 获取父级name和id
        groupSource () {
            //新建素材时，全部分组不可选
            let firstGroup = this.$getCurrentPart(2, this.totalTreeArry);
            firstGroup.open = true;
            if (this.groupSource === 'create') {
                firstGroup.noSelect = true;
                this.parentGroupName = this.totalTreeArry[0].name;
                this.selectGroupId = this.totalTreeArry[0].id;
            }
            if (this.groupSource === 'use') {
                firstGroup.noSelect = false;
                // 默认选中 默认分组 id
                let r = this.$getCurrentPart(1, firstGroup.childs);
                let defaultId = r.id;
                let routeId = this.$route.params.groupId;
                if (!routeId || routeId === defaultId || routeId <= 0) {
                    this.selectGroupId = defaultId;
                    this.parentGroupName = r.name;
                } else {
                    this.selectGroupId = routeId;
                    let p = this.$getPartById(Number(this.selectGroupId), this.totalTreeArry);
                    this.parentGroupName = p.name;
                }
            }
        }

    },
    components: { eventModal, restrictions }
};
</script>
<style lang="scss">
@import "../../../common/scss/base/variables";
@import "../../../common/scss/base/mixin";

.new-journey-modal {
    .journey-type-tabs {
        text-align: center;
        margin: 16px 0 32px;
        @include user-select(none);

        .journey-type {
            margin: 0 16px;
            line-height: $input-field-height;
            display: inline-block;
            cursor: pointer;
            @include transition(color 0.2s ease);

            &:hover {
                color: $light-theme;
            }

            &.active {
                color: $theme;
                border-bottom: 2px solid $theme;
            }
        }
    }

    .center-form {
        width: 80%;
        margin-bottom: 32px;

        .icon {
            &.icon-yiwen1 {
                font-size: 15px;
                margin-left: 5px;
            }
        }
    }

    .time-zone {
        margin-bottom: 1em;

        .select-text {
            position: absolute;
            top: 0;
            left: 0;
            width: 414px;
        }
    }

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
            width: 412px;
            max-width: 412px;
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
            width: 412px;
            max-height: 300px;
            background-color: white;
            border: 1px solid $border-color;
            border-top: none;
            z-index: $index-container;
        }
    }
    .margin-right{
        margin-right: 20px;
    }
}
</style>
