<template>
    <div class="email-report-nike">
        <div class="page-head">
            <div class="content-view">
                <h1>{{'report.emailReport' | t}}</h1>
            </div>
            <div class="top-button">
                <div class="details-button" @click="skipDetails">
                    <span class="btn btn-md btn-theme">{{'report.labelDetails' | t}}</span>
                </div>
                <div>
                    <label>
                        <input type="file" ref="importLabel" v-show="false" @change="importLabel" accept=".xlsx">
                        <span class="btn btn-md btn-theme">{{'report.importLabel' | t}}</span>
                    </label>
                </div>
            </div>
        </div>
        <div class="page-content report-content">
            <div class="content-view">
                <!-- 左侧分组列表 -->
                <div class="left-list">
                    <div class="all-group">
                        <div class="pull-right">{{groupCounts}}</div>
                        <p>{{'report.allGrouping' | t}}</p>
                    </div>
                    <div class="titlesas">
                        <span class="titlesas-name">{{'report.groupList' | t}}</span>
                        <i class="icon icon-refresh titlesas-refresh" @click="gainList"
                           v-title:bottom="$t('report.refresh')"></i>
                        <selector class="icon-size titlesas-sort" auto-width icon="sort"
                                :shortcutAction="false"
                                v-model="orderBy"
                                :options="orderOptions"
                                @select="gainList"/>
                        <button type="button"
                                class="btn btn-md btn-round btn-theme titlesas-add"
                                @click="addGroup">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-plus"></use>
                            </svg>
                            {{'report.createGroup' | t}}
                        </button>
                    </div>
                    <div class="search-field">
                        <input type="text" v-model="keyword" :placeholder="$t('report.searchKeyword')"
                               @keyup.enter="gainList">
                        <span class="icon icon-search" @click="gainList"></span>
                    </div>
                    <div class="group-list">
                        <div class="group-item" :class="activeId == item.id ? 'active' : ''" v-for="(item, index) in groupList" :key="index" @click="getGroupMsg(item.id)">
                            <p class="name">{{item.name}}</p>
                            <div class="pull-right">
                                <svg aria-hidden="true" class="edit-button" @click='editGroup(item)'>
                                    <use xlink:href="#icon-pencil"></use>
                                </svg>
                                <svg aria-hidden="true" class="delete-button" @click='deleteGroup(item.id)'>
                                    <use xlink:href="#icon-round-close"></use>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 右侧分组数据 -->
                <div class="right-list">
                    <div class="search-title">
                        <div class="right-btn">
                            <button type="button" class="btn btn-md btn-theme" v-if="!PKDataShow" @click="exportGroupsData = true">{{'report.exportGroupData' | t}}</button>
                            <button type="button" class="btn btn-md btn-theme" v-if="!PKDataShow" @click="groupPK">{{'report.groupPK' | t}}</button>
                            <button type="button" class="btn btn-md btn-theme" v-if="PKDataShow" @click="exportGroupsData = true">{{'report.exportPKData' | t}}</button>
                            <button type="button" class="btn btn-md btn-theme" v-if="PKDataShow" @click="backToGroupData">{{'report.back' | t}}</button>
                        </div>
                        <template>
                            <p v-if="queryOpen && !PKDataShow" class="title">{{'report.setScreeningCriteria' | t}}</p>
                            <p v-if="!queryOpen && !PKDataShow && getConditions.length == 0" class="title">{{'swarm.filterGroup' | t}}{{0}}{{'report.condition' | t}}</p>
                            <p v-if="!queryOpen && !PKDataShow && getConditions.length <= 35 && getConditions.length > 0" class="title">{{'swarm.filterGroup' | t}}{{getConditions}}{{'swarm.soOn' | t}}{{getConditions.split('、').length}}{{'report.condition' | t}}</p>
                            <p v-if="!queryOpen && !PKDataShow && getConditions.length > 35" class="title">{{'swarm.filterGroup' | t}}{{getConditions.slice(0, 35) + '...'}}{{'swarm.soOn' | t}}{{getConditions.split('、').length}}{{'report.condition' | t}}</p>
                            <p v-if="PKDataShow && getPKGroups.length > 35" class="title">{{getPKGroups.slice(0, 35) + '...'}}{{'swarm.soOn' | t}}{{getPKGroups.split('、').length}}{{'report.groupsNum' | t}}</p>
                            <p v-if="PKDataShow && getPKGroups.length <= 35" class="title">{{getPKGroups}}</p>
                        </template>
                    </div>
                    <transition>
                        <div class="search-info" v-show="queryOpen">
                            <div class="search-criteria-title">{{'report.setScreeningCriteria' | t}}</div>
                            <div class="search-criteria-content">
                                <!-- 筛选条件主体 -->
                                <div class="condition-content">
                                    <div class="just">{{'report.and' | t}}</div>    <!-- 最外层 且 / 或 -->
                                    <!-- 每一个筛选项 -->
                                        <!-- 推送人数范围 -->
                                    <div class="attr-item pushNumberRange">
                                        <!-- 筛选项头部title部分 -->
                                        <div class="attr-top">
                                            <p class="attr-item-title">{{'report.pushNumberRange' | t}}</p>
                                            <div class="icon-tianjia icon add" @click="addRange(pushNumber.pushCount)"></div>
                                        </div>
                                        <!-- 筛选项筛选主体部分 -->
                                        <div class="push-number" :class="pushNumber.pushCount.length > 1 ? 'summation' : ''">
                                            <div class="maybe" v-if="pushNumber.pushCount.length > 1" @click="switcherCount">          <!-- 内层每一项 且 / 或 -->
                                                <span v-if="pushNumber.act == 'and'">{{'report.and' | t}}</span>
                                                <span v-if="pushNumber.act == 'or'">{{'report.or' | t}}</span>
                                            </div>
                                            <!-- 点击加减号增加删除的每一项 -->
                                            <div class="condition-screen-item" v-for="(item, index) in pushNumber.pushCount" :key="index">
                                                <div class="selectBox">
                                                    <selector
                                                        :options="pushNumberOptions"
                                                        v-model="item.rangeId"
                                                        @select="changeNumberRange($event, index)"
                                                        class="screenSelect">
                                                    </selector>
                                                    <div class="icon-iconless icon del" @click="delScreen(index)"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- 标签选择部分 -->
                                        <!-- 第一个一级标签 -->
                                    <div class="attr-item">
                                        <!-- 筛选项头部title部分 -->
                                        <div class="attr-top">
                                            <p class="attr-item-title">{{'report.firstTagTitle' | t}}</p>
                                            <div class="icon-tianjia icon add" @click="addCondition(labelConditionList[0].rules, 'campaign info')"></div>
                                        </div>
                                        <!-- 筛选项筛选主体部分 -->
                                        <div class="push-number" :class="labelConditionList[0].rules.length > 1 ? 'summation' : ''">
                                            <div class="maybe" v-if="labelConditionList[0].rules.length > 1" @click="switcherLabels(0)">          <!-- 内层每一项 且 / 或 -->
                                                <span v-if="labelConditionList[0].act == 'and'">{{'report.and' | t}}</span>
                                                <span v-if="labelConditionList[0].act == 'or'">{{'report.or' | t}}</span>
                                            </div>
                                            <!-- 点击加减号增加删除的每一项 -->
                                            <div class="condition-screen-item" v-for="(item, index) in labelConditionList[0].rules" :key="index">
                                                <div class="selectBox">
                                                    <cascading-multi
                                                        :options="label1Options"
                                                        :searchOptions="searchLabel1Options"
                                                        dropDirection="bottom"
                                                        :autoWidth="false"
                                                        v-model="item.names"
                                                        :uniqueKey="'name'"
                                                        :placeholder="$t('contact.selectAttr')"
                                                        @searchLv3="searchLv3('campaign info', $event)"
                                                        @getLevel3Labels="getLevel3Labels('campaign info', $event)"
                                                        @delLabel="delLabel(index, 'campaign', arguments)"
                                                        @labelLen="getLabelLength"
                                                        @select="select($event, index, item, 'campaign')"/>
                                                    <div class="icon-iconless icon del" @click="delTagCampaign(index)"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="attr-item">
                                        <!-- 筛选项头部title部分 -->
                                        <div class="attr-top">
                                            <p class="attr-item-title">{{'report.secondTagTitle' | t}}</p>
                                            <div class="icon-tianjia icon add" @click="addCondition(labelConditionList[1].rules, 'audience')"></div>
                                        </div>
                                         <!-- 筛选项筛选主体部分 -->
                                        <div class="push-number" :class="labelConditionList[1].rules.length > 1 ? 'summation' : ''">
                                            <div class="maybe" v-if="labelConditionList[1].rules.length > 1" @click="switcherLabels(1)">          <!-- 内层每一项 且 / 或 -->
                                                <span v-if="labelConditionList[1].act == 'and'">{{'report.and' | t}}</span>
                                                <span v-if="labelConditionList[1].act == 'or'">{{'report.or' | t}}</span>
                                            </div>
                                            <!-- 点击加减号增加删除的每一项 -->
                                            <div class="condition-screen-item" v-for="(item, index) in labelConditionList[1].rules" :key="index">
                                                <div class="selectBox">
                                                    <cascading-multi
                                                        :options="label2Options"
                                                        :searchOptions="searchLabel2Options"
                                                        dropDirection="bottom"
                                                        :autoWidth="false"
                                                        v-model="item.names"
                                                        :uniqueKey="'name'"
                                                        :placeholder="$t('contact.selectAttr')"
                                                        @searchLv3="searchLv3('audience', $event)"
                                                        @getLevel3Labels="getLevel3Labels('audience', $event)"
                                                        @delLabel="delLabel(index, 'audience', arguments)"
                                                        @labelLen="getLabelLength"
                                                        @select="select($event, index, item, 'audience')"/>
                                                    <div class="icon-iconless icon del" @click="delAudience(index)"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="attr-item">
                                        <!-- 筛选项头部title部分 -->
                                        <div class="attr-top">
                                            <p class="attr-item-title">{{'report.thirdTagTitle' | t}}</p>
                                            <div class="icon-tianjia icon add" @click="addCondition(labelConditionList[2].rules, 'creative')"></div>
                                        </div>
                                         <!-- 筛选项筛选主体部分 -->
                                        <div class="push-number" :class="labelConditionList[2].rules.length > 1 ? 'summation' : ''">
                                            <div class="maybe" v-if="labelConditionList[2].rules.length > 1" @click="switcherLabels(2)">          <!-- 内层每一项 且 / 或 -->
                                                <span v-if="labelConditionList[2].act == 'and'">{{'report.and' | t}}</span>
                                                <span v-if="labelConditionList[2].act == 'or'">{{'report.or' | t}}</span>
                                            </div>
                                            <!-- 点击加减号增加删除的每一项 -->
                                            <div class="condition-screen-item" v-for="(item, index) in labelConditionList[2].rules" :key="index">
                                                <div class="selectBox">
                                                    <cascading-multi
                                                        :options="label3Options"
                                                        :searchOptions="searchLabel3Options"
                                                        dropDirection="bottom"
                                                        :autoWidth="false"
                                                        v-model="item.names"
                                                        :uniqueKey="'name'"
                                                        :placeholder="$t('contact.selectAttr')"
                                                        @searchLv3="searchLv3('creative', $event)"
                                                        @getLevel3Labels="getLevel3Labels('creative', $event)"
                                                        @delLabel="delLabel(index, 'creative', arguments)"
                                                        @labelLen="getLabelLength"
                                                        @select="select($event, index, item, 'creative')"/>
                                                    <div class="icon-iconless icon del" @click="delCreative(index)"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- 条件筛选模块 保存修改 取消 -->
                            <div class="footer">
                                <!--修改筛选条件-->
                                <button type="button" class="btn btn-theme btn-md" @click="saveCondition">
                                    {{'report.save' | t}}
                                </button>
                                <button type="button" class="btn btn-theme-border btn-md" @click="cancelAmend">
                                    {{'report.cancel' | t}}
                                </button>
                            </div>
                        </div>
                    </transition>
                    <div class="pull-down" :class="[queryOpen ? 'turn-on' : 'turn-off']" v-if="!PKDataShow" @click="queryOpen = !queryOpen">
                        <svg class="down-arrow" :class="[queryOpen ? 'turn-on' : 'turn-off']">
                            <use xlink:href="#icon-arrow-down"></use>
                        </svg>
                    </div>
                    <div class="data-details">
                        <group-data :tableType="tableType" :tableDataList="tableDataList" @getTableData="tabelChange" />
                    </div>
                </div>
            </div>
        </div>
        <!-- 导出分组数据弹窗 / 导出PK数据 -->
        <confirm
            v-if="exportGroupsData"
            :title="$t('report.exportData')"
            @cancel="cancelExport"
            @confirm="confirmExport"
        >
            <div class="specifyMailbox">
                <label for="exportData" class="exportLabel">{{'report.specifyMailbox' | t}}:</label>
                <input class="input" type="text" id="exportData" v-model="exportEmail">
            </div>
        </confirm>
        <!-- 创建 / 编辑分组 -->
        <confirm
            v-if="groupEditor"
            :title="editGroupId ? $t('report.editGroup') : $t('report.createGroup')"
            @cancel="cancelGroup"
            @confirm="confirmGroup"
        >
            <div class="specifyMailbox">
                <label for="editGroup" class="exportLabel">{{'newJourney.groupName' | t}}:</label>
                <input class="input" type="text" id="editGroup" v-model="groupName">
            </div>
        </confirm>
        <!-- 分组PK -->
        <confirm
            v-if="showGroupsPK"
            :title="$t('report.groupPK')"
            @cancel="cancelPK"
            @confirm="confirmPK"
        >
            <div class="groupPK">
                <multi-select
                    :options="groupList"
                    class="full-width"
                    dropDirection="bottom"
                    :autoWidth="false"
                    v-model="comparisonIds"
                    :placeholder="$t('contact.selectAttr')"/>
            </div>
        </confirm>
    </div>
</template>
<script>
    import { JourneyApiV2 } from '@/api';
    import cascadingMulti from '../components/cascading-multi.vue';
    import groupData from '../components/group-data-nike.vue';
    import {EMAIL_ADDRESS_REGEXP} from '../../../../common/utils/regs';
    export default {
        data() {
            return {
                keyword: '',            //左侧分组列表搜索关键字
                groupName: '',          //创建分组弹窗分组名称
                groupCounts: '',        //分组数量
                activeId: '',           //选中的分组id
                editGroupId: '',        //判断是创建分组还是编辑分组
                orderBy: '',            //左侧分组列表排序方法选择
                queryOpen: false,       //数据筛选条件模块是否下拉
                lv2NameList: [],            //二级标签名列表
                campaignLevel3List: [],     //campaign选中的三级标签列表
                exportGroupsData: false,    //导出分组数据弹窗
                exportEmail: '',
                groupEditor: false,       //创建 / 编辑分组弹窗
                showGroupsPK: false,      //分组PK弹窗
                addIds: [],               //选中的分组集合
                comparisonIds: [],         //分组PK选中的分组id列表
                PKDataShow: false,        //设置筛选条件右侧按钮显隐
                orderOptions: [         //分组列表排序方法
                    {id: 1, name: this.$t('report.createNeartofar')},
                    {id: 2, name: this.$t('report.createFarandnear')},
                    {id: 3, name: this.$t('report.updateNeartofar')},
                    {id: 4, name: this.$t('report.updateFarandnear')},
                    {id: 5, name: this.$t('report.nameFarandnear')},
                    {id: 6, name: this.$t('report.nameNearandfar')}
                ],
                pushNumber: {
                    'act': 'and',
                    'pushCount': []
                },
                labelConditionList: [
                    {level1: 'campaign info', act: 'or', rules: []},
                    {level1: 'audience', act: 'or', rules: []},
                    {level1: 'creative', act: 'or', rules: []},
                ],
                groupList: [],
                pushNumberOptions: [                 //推送人数范围下拉列表
                    {
                        name: '0-20w',
                        min: 0,
                        max: 200000,
                        id: 0,
                    },
                    {
                        name: '20-40w',
                        min: 200000,
                        max: 400000,
                        id: 1,
                    },
                    {
                        name: '40-60w',
                        min: 400000,
                        max: 600000,
                        id: 2,
                    },
                    {
                        name: '60-80w',
                        min: 600000,
                        max: 800000,
                        id: 3,
                    },
                    {
                        name: '80-100w',
                        min: 800000,
                        max: 1000000,
                        id: 4,
                    },
                    {
                        name: '100-120w',
                        min: 1000000,
                        max: 1200000,
                        id: 5,
                    },
                    {
                        name: '120w+',
                        min: 1200000,
                        id: 6,
                    }
                ],
                label1Options: [],                        //第一个标签多级选择下拉框
                label2Options: [],                        //第二个标签多级选择下拉框
                label3Options: [],                        //第三个标签多级选择下拉框
                searchLabel1Options: [],                  //第一个标签多级选择下拉框（搜索时使用， 用于查找三级标签的二级标签是什么）
                searchLabel2Options: [],                  //第一个标签多级选择下拉框（搜索时使用， 用于查找三级标签的二级标签是什么）
                searchLabel3Options: [],                  //第一个标签多级选择下拉框（搜索时使用， 用于查找三级标签的二级标签是什么）
                tableDataList: [],                   //表格数据
                checkedLv2: '',                      //缓存二级标签名
                LIST_LENGHT: [],                     //在拼装数据格式中用于缓存选中项数组（也就是e）
                rulesList: [],
                tableType:true,                       //表格样式为邮件标签
            };
        },
        computed: {
            getPKGroups() {
                let nameArr = [];
                this.addIds.map(item => {
                    this.groupList.map(option => {
                        if (item === option.id) {
                            nameArr.push(option.name);
                        }
                    });
                });
                return nameArr.join('、');
            },
            getConditions() {
                let conditionArr = [];
                if (this.pushNumber.pushCount.length !== 0) {
                    this.pushNumber.pushCount.forEach(item => {
                        let range = (parseInt(item.min) / 10000) + '-' + ((parseInt(item.min) / 10000) + 20) + 'w';
                        conditionArr.push(range);
                    });
                }
                if (this.labelConditionList.length !== 0) {
                    this.labelConditionList.forEach(option => {
                        if (option.rules.length !== 0) {
                            option.rules.forEach(rules => {
                                if (rules.rule.length !== 0) {
                                    rules.rule.forEach(rule => {
                                        if (rule.level3.length !== 0) {
                                            rule.level3.forEach(item => {
                                                let label = rule.level2Name + '-' + item.level3Name;
                                                conditionArr.push(label);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                return conditionArr.join('、');
            }
        },
        mounted() {
            this.getGroupList();
        },
        methods: {
            //跳转至明细页面
            skipDetails(){
                this.$router.push({
                    name: 'emailReportDetailsNike',
                });
            },
            //获取分组列表
            getGroupList() {
                this.$loading();
                JourneyApiV2.getGroupList(this.keyword, this.orderBy)
                    .then(res => {
                        this.groupList = res.body.data.groupList;
                        this.groupCounts = res.body.data.groupCounts;
                        this.getTableData();
                        this.$loaded();
                    });
            },
            //获取表格数据
            getTableData() {
                if (this.addIds.length === 0) {
                    this.addIds.push(this.groupList[0].id);
                    this.getGroupMsg(this.groupList[0].id);
                } else {
                    JourneyApiV2.getTableData(this.addIds, 0)
                        .then(res => {
                            this.tableDataList = res.body.data.records;
                        });
                }
            },
            //分组PK按钮点击
            groupPK() {
                this.addIds = [];
                this.showGroupsPK = true;
                this.getGroupList();
            },
            /**
             * 发送数据  数据格式拼接
             * idx: 是三个一级标签的哪一个 0：compaignInfo   1: audience   2: creative
             * e: 当前行选中的标签集合
             * index: 当前是一级标签下的哪一行
             */
            sendFormat(idx, e, index) {
                //如果当前一级标签下的当前行没有选中的标签
                if (this.labelConditionList[idx].rules[index].rule.length === 0) {
                    this.labelConditionList[idx].rules[index].rule.push({
                        'level2Name': this.checkedLv2,
                        'level3': [{
                            'level3Name': e[e.length - 1]
                        }]
                    });
                } else {    //如果当前一级标签下的当前行有选中的标签，那么需要判断当前行为是删除标签还是增加标签
                    let isFlag = false;
                    for (let i = 0; i < this.labelConditionList[idx].rules[index].rule.length; i++) {
                        //说明是选中三级标签并且选中标签的兄弟标签有选中状态，或者是清除当前点击的三级标签
                        if (this.labelConditionList[idx].rules[index].rule[i].level2Name === this.checkedLv2) {
                            isFlag = true;
                        }
                    }
                    if (isFlag) {//说明是选中三级标签并且选中标签的兄弟标签有选中状态，或者是清除当前点击的三级标签
                        for (let i = 0, len = this.labelConditionList[idx].rules[index].rule.length; i < len; i++) {
                            //找到当前点击的是二级标签下的哪一个三级标签
                            if (this.labelConditionList[idx].rules[index].rule[i].level2Name === this.checkedLv2) {
                                let lv3List = this.labelConditionList[idx].rules[index].rule[i].level3;
                                if (e.length === 0) {     //说明现在没有标签选中
                                    this.labelConditionList[idx].rules[index].rule = []; //清空rule
                                    this.labelConditionList[idx].rules.splice(index, 1);
                                    // this.labelConditionList[idx].rules = [];

                                } else {    //有标签处于选中状态
                                    if (this.LIST_LENGHT.length < e.length) {     //说明是增加选中的标签
                                        lv3List.push({
                                            'level3Name': e[e.length - 1]
                                        });
                                    } else {      //说明是去掉选中的标签
                                        if (lv3List.length === 1) {
                                            this.labelConditionList[idx].rules[index].rule.splice(i ,1);
                                        } else {
                                            for (let r = 0; r < this.LIST_LENGHT.length; r++) {
                                                if (!e.includes(this.LIST_LENGHT[r])) {
                                                    lv3List.splice(r, 1);
                                                }
                                            }
                                        }
                                    }
                                }
                                break;
                            }
                        }
                    } else {
                        //是选中三级标签，并且选中标签的兄弟标签没有选中状态
                        this.labelConditionList[idx].rules[index].rule.push({
                            'level2Name': this.checkedLv2,
                            'level3': [{
                                'level3Name': e[e.length - 1]
                            }]
                        });
                    }
                }
                this.LIST_LENGHT = e;
            },
            //更新删除当前数据之前选中标签的数量，用于跟e做对比，大于e表示删除标签，小于e表示增加标签
            getLabelLength(val) {
                this.LIST_LENGHT = val;
            },
            //点击标签后关闭按钮删除选中的标签
            delLabel(index, level1Name, arg) {
                if (level1Name === 'campaign') {
                    this.checkedLv2 = arg[1];
                    this.sendFormat(0, arg[0], index);
                } else if (level1Name === 'audience') {
                    this.checkedLv2 = arg[1];
                    this.sendFormat(1, arg[0], index);
                } else {
                    this.checkedLv2 = arg[1];
                    this.sendFormat(2, arg[0], index);
                }
            },
            select(e, index, item, level1Name) {
                if (level1Name === 'campaign') {
                    this.sendFormat(0, e, index);
                } else if (level1Name === 'audience') {
                    this.sendFormat(1, e, index);
                } else {
                    this.sendFormat(2, e, index);
                }
            },
            //导入标签按钮点击事件
            importLabel(e) {
                const file = e.target.files[0];
                if (!file) {
                    return false;
                }
                if (!/\.xlsx$/i.test(file.name)) {
                    this.$toast(this.$t('report.fileType'), 'warn');
                    return false;
                }
                JourneyApiV2.importLabels(file)
                    .then(() => {
                        this.$toast(this.$t('report.importSuccess'), 'success');
                    });
                this.$refs.importLabel.value = '';
            },
            //左侧分组列表 搜索
            gainList() {
                this.getGroupList();
            },
            //创建分组按钮点击事件
            addGroup() {
                this.activeId = '';
                this.groupEditor = true;
            },
            //编辑分组按钮点击事件
            editGroup(item) {
                this.editGroupId = item.id;
                this.groupName = item.name;
                this.groupEditor = true;
            },
            //点击分组获取分组详细信息
            getGroupMsg(id) {
                this.activeId = id;
                this.addIds = [];
                this.addIds.push(id);
                JourneyApiV2.groupMsg(id)
                    .then(res => {
                        if (res.body.code === 200) {
                            const condition = res.body.data.journeyNikeGroupDTO;
                            if (condition.countRules != null) {
                                const pushNumber = JSON.parse(condition.countRules);
                                this.$set(this.$data, 'pushNumber', pushNumber);
                            } else {
                                let pushNumber = {
                                    'act': 'and',
                                    'pushCount': []
                                };
                                this.$set(this.$data, 'pushNumber', pushNumber);
                            }
                            if (condition.labelRules) {
                                const labelConditionList = JSON.parse(condition.labelRules);
                                for (let i = 0, len = labelConditionList.length; i < len; i++) {
                                    if (labelConditionList[i].rules.length !== 0) {
                                        this.getLevel2Labels(labelConditionList[i].level1);
                                    }
                                }
                                this.$set(this.$data, 'labelConditionList', labelConditionList);
                            } else {
                                let labelConditionList = [
                                    {level1: 'campaign info', act: 'or', rules: []},
                                    {level1: 'audience', act: 'or', rules: []},
                                    {level1: 'creative', act: 'or', rules: []},
                                ];
                                this.$set(this.$data, 'labelConditionList', labelConditionList);
                            }
                        }
                    });
                JourneyApiV2.getTableData(this.addIds, 0)
                    .then(res => {
                        this.tableDataList = res.body.data.records;
                    });
            },
            //推送人数范围 且与或的连接
            switcherCount() {
                if (this.pushNumber.act === 'and') {
                    this.pushNumber.act = 'or';
                } else if (this.pushNumber.act === 'or') {
                    this.pushNumber.act = 'and';
                }
            },
            //标签 且与或的连接
            switcherLabels(index) {
                if (this.labelConditionList[index].act === 'and') {
                    this.labelConditionList[index].act = 'or';
                } else if (this.labelConditionList[index].act === 'or') {
                    this.labelConditionList[index].act = 'and';
                }
            },
            //删除分组按钮点击事件
            deleteGroup(id) {
                this.$confirm(this.$t('common.delete'), this.$t('common.deleteSure'))
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            JourneyApiV2.delGroup(id)
                                .then((res) => {
                                    if (res.body.code === 200) {
                                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                                        this.getGroupList();
                                        this.activeId = '';
                                        this.$loaded();
                                    }
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        }
                    });
            },
            //添加推送人数范围筛选条件（加号）
            addRange(list) {
                if (list.length === 0) {
                    list.push({
                        'min': '',        //最小
                        'max': '',        //最大
                    });
                } else {
                    if (list[list.length - 1].min === '' && list[list.length - 1].max === '') {
                        this.$toast(this.$t('swarm.infoNotComplete'));
                    } else {
                        list.push({
                            'min': '',
                            'max': '',
                        });
                    }
                }
            },
            //添加标签筛选条件（加号）
            addCondition(list, lv1Name) {
                // let rule = [];
                if (list.length === 0) {
                    this.getLevel2Labels(lv1Name);
                    list.push({
                        'rule': [],
                        'names': []
                    });
                } else {
                    if (list[list.length - 1].names.length === 0) {
                        this.$toast(this.$t('swarm.infoNotComplete'));
                        return;
                    }
                    list.push({
                        'rule': [],
                        'names': []
                    });
                }
            },
            //获取二级标签
            getLevel2Labels(level1Name) {
                JourneyApiV2.getLabelName(level1Name, '', '', 2)
                    .then(res => {
                        if (res.body.code === 200) {
                            if (level1Name === 'campaign info' && this.label1Options.length === 0) {
                                for (let i = 0, len = res.body.data.labelList.length; i < len; i++) {
                                    this.label1Options.push({
                                        name: res.body.data.labelList[i],
                                        id: i,
                                        child: []
                                    });
                                    this.searchLabel1Options.push({
                                        name: res.body.data.labelList[i],
                                        id: i,
                                        child: []
                                    });
                                }
                                this.label1Options.forEach(option => {
                                    this.getLevel3Labels('campaign info', option.name);
                                });
                            } else if (level1Name === 'audience' && this.label2Options.length === 0) {
                                for (let i = 0, len = res.body.data.labelList.length; i < len; i++) {
                                    this.label2Options.push({
                                        name: res.body.data.labelList[i],
                                        id: i,
                                        child: []
                                    });
                                    this.searchLabel2Options.push({
                                        name: res.body.data.labelList[i],
                                        id: i,
                                        child: []
                                    });
                                }
                                this.label2Options.forEach(option => {
                                    this.getLevel3Labels('audience', option.name);
                                });
                            } else if (level1Name === 'creative' && this.label3Options.length === 0) {
                                for (let i = 0, len = res.body.data.labelList.length; i < len; i++) {
                                    this.label3Options.push({
                                        name: res.body.data.labelList[i],
                                        id: i,
                                        child: []
                                    });
                                    this.searchLabel3Options.push({
                                        name: res.body.data.labelList[i],
                                        id: i,
                                        child: []
                                    });
                                }
                                this.label3Options.forEach(option => {
                                    this.getLevel3Labels('creative', option.name);
                                });
                            }
                        }
                    });
            },
            //获取三级标签
            getLevel3Labels(level1Name, level2Name) {
                this.checkedLv2 = level2Name;
                JourneyApiV2.getLabelName(level1Name, level2Name, '', 3)
                    .then(res => {
                        if (res.body.code === 200) {
                            if (level1Name === 'campaign info' && this.label1Options.length !== 0) {      //是第一个标签
                                for (let i = 0, len = this.label1Options.length; i < len; i++) {
                                    if (this.label1Options[i].name === level2Name) {
                                        this.label1Options[i].child = [];
                                        this.searchLabel1Options[i].child = [];
                                        if (res.body.data.labelList.length !== 0) {
                                            for (let j = 0, len = res.body.data.labelList.length; j < len; j++) {
                                                this.label1Options[i].child.push({
                                                    name: res.body.data.labelList[j],
                                                    id: j
                                                });
                                                this.searchLabel1Options[i].child.push({
                                                    name: res.body.data.labelList[j],
                                                    id: j
                                                });
                                            }
                                        }
                                    }
                                }

                            } else if (level1Name === 'audience' && this.label2Options.length !== 0) {    //是第二个标签
                                for (let i = 0, len = this.label2Options.length; i < len; i++) {
                                    if (this.label2Options[i].name === level2Name) {
                                        this.label2Options[i].child = [];
                                        this.searchLabel2Options[i].child = [];
                                        if (res.body.data.labelList.length !== 0) {
                                            for (let j = 0, len = res.body.data.labelList.length; j < len; j++) {
                                                this.label2Options[i].child.push({
                                                    name: res.body.data.labelList[j],
                                                    id: j
                                                });
                                                this.searchLabel2Options[i].child.push({
                                                    name: res.body.data.labelList[j],
                                                    id: j
                                                });
                                            }
                                        }
                                    }
                                }
                            } else if (level1Name === 'creative' && this.label3Options.length !== 0) {
                                for (let i = 0, len = this.label3Options.length; i < len; i++) {
                                    if (this.label3Options[i].name === level2Name) {
                                        this.label3Options[i].child = [];
                                        this.searchLabel3Options[i].child = [];
                                        if (res.body.data.labelList.length !== 0) {
                                            for (let j = 0, len = res.body.data.labelList.length; j < len; j++) {
                                                this.label3Options[i].child.push({
                                                    name: res.body.data.labelList[j],
                                                    id: j
                                                });
                                                this.searchLabel3Options[i].child.push({
                                                    name: res.body.data.labelList[j],
                                                    id: j
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });
            },
            //搜索三级标签
            searchLv3(lv1Name, keyword) {
                if (keyword === '') {
                    this.getLevel3Labels(lv1Name, this.checkedLv2);
                } else {
                    JourneyApiV2.getLabelName(lv1Name, this.checkedLv2, keyword, 4)
                        .then(res => {
                            if (lv1Name === 'campaign info') {
                                for (let i = 0, len = this.label1Options.length; i < len; i++) {
                                    if (this.label1Options[i].name === this.checkedLv2) {
                                        this.label1Options[i].child = [];
                                        for (let j = 0, len = res.body.data.labelList.length; j < len; j++) {
                                            this.label1Options[i].child.push({
                                                name: res.body.data.labelList[j],
                                                id: j
                                            });
                                        }
                                    }
                                }
                            } else if (lv1Name === 'audience') {
                                for (let i = 0, len = this.label2Options.length; i < len; i++) {
                                    if (this.label2Options[i].name === this.checkedLv2) {
                                        this.label2Options[i].child = [];
                                        for (let j = 0, len = res.body.data.labelList.length; j < len; j++) {
                                            this.label2Options[i].child.push({
                                                name: res.body.data.labelList[j],
                                                id: j
                                            });
                                        }
                                    }
                                }
                            } else {
                                for (let i = 0, len = this.label3Options.length; i < len; i++) {
                                    if (this.label3Options[i].name === this.checkedLv2) {
                                        this.label3Options[i].child = [];
                                        for (let j = 0, len = res.body.data.labelList.length; j < len; j++) {
                                            this.label3Options[i].child.push({
                                                name: res.body.data.labelList[j],
                                                id: j
                                            });
                                        }
                                    }
                                }
                            }
                        });
                }
            },
            //推送人数范围下拉列表点击选择事件
            changeNumberRange(e, index) {
                this.pushNumber.pushCount[index].min = e.min;
                this.pushNumber.pushCount[index].max = e.max;
                this.rangeId = e.id;
            },
            //推送人数范围删除范围点击事件
            delScreen(index) {
                this.pushNumber.pushCount.splice(index, 1);
            },
            //campaign info 标签删除点击事件
            delTagCampaign(index) {
                this.labelConditionList[0].rules.splice(index, 1);
                if (index === 0) {
                    this.label1Options = [];
                }
            },
            //audience 标签删除点击事件
            delAudience(index) {
                this.labelConditionList[1].rules.splice(index, 1);
                if (index === 0) {
                    this.label2Options = [];
                }
            },
            //creative 标签删除点击事件
            delCreative(index) {
                this.labelConditionList[2].rules.splice(index, 1);
                if (index === 0) {
                    this.label3Options = [];
                }
            },
            //条件筛选模块保存修改
            saveCondition() {
                let flag = false;
                this.labelConditionList.forEach(item => {
                    if (item.rules.length !== 0) {
                        flag = true;
                    }
                });
                if (!flag && this.pushNumber.pushCount.length === 0) {
                    this.$toast(this.$t('report.noCondition'), 'warn');
                    return;
                }
                if (!flag) {
                    this.$toast(this.$t('report.checkLabels'), 'warn');
                    return;
                }
                if (this.pushNumber.pushCount.length === 0) {
                    this.$toast(this.$t('report.checkPushNumber'), 'warn');
                    return;
                }
                if (this.pushNumber.pushCount.length !== 0 && this.pushNumber.pushCount[this.pushNumber.pushCount.length - 1].min === '') {
                    this.$toast(this.$t('swarm.infoNotComplete'));
                    return;
                }
                if (this.labelConditionList[0].rules.length !== 0 &&
                this.labelConditionList[0].rules[this.labelConditionList[0].rules.length - 1].rule.length === 0) {
                    this.$toast(this.$t('swarm.infoNotComplete'));
                    return;
                }
                if (this.labelConditionList[1].rules.length !== 0 &&
                this.labelConditionList[1].rules[this.labelConditionList[1].rules.length - 1].rule.length === 0) {
                    this.$toast(this.$t('swarm.infoNotComplete'));
                    return;
                }
                if (this.labelConditionList[2].rules.length !== 0 &&
                this.labelConditionList[2].rules[this.labelConditionList[2].rules.length - 1].rule.length === 0) {
                    this.$toast(this.$t('swarm.infoNotComplete'));
                    return;
                }
                JourneyApiV2.saveGroupData(this.pushNumber, this.labelConditionList, this.activeId)
                    .then(res => {
                        if (res.body.code === 200) {
                            this.$toast(this.$t('common.saveSuccess'), 'success');
                            this.getTableData();
                        }
                    });
            },
            //条件筛选模块取消修改
            cancelAmend() {
                this.queryOpen = false;
            },
            //导出分组数据、PK数据弹窗确认
            confirmExport() {
                let lv2 = [];
                let lv3 = [];
                if (this.exportEmail === '' || this.exportEmail === undefined || this.exportEmail == null) {
                    this.$toast(this.$t('report.exportEmail'), 'warn');
                    return;
                }
                if (!EMAIL_ADDRESS_REGEXP.test(this.exportEmail)) {
                    this.$toast(this.$t('dataCenter.emailFormatError'), 'warn');
                    return;
                }
                if (this.addIds.length === 1) {       //导出分组数据
                    for (let i = 0; i < this.labelConditionList.length; i++) {
                        if (this.labelConditionList[i].rules.length !== 0) {
                            for (let j = 0; j < this.labelConditionList[i].rules.length; j++) {
                                if (this.labelConditionList[i].rules[j].rule.length !== 0) {
                                    for (let z = 0; z < this.labelConditionList[i].rules[j].rule.length; z++) {
                                        lv2.push(this.labelConditionList[i].rules[j].rule[z].level2Name);
                                        for (let m = 0;
                                            m < this.labelConditionList[i].rules[j].rule[z].level3.length; m++) {
                                            lv3.push(this.labelConditionList[i].rules[j].rule[z].level3[m].level3Name);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    lv2 = lv2.join(',');
                    lv3 = lv3.join(',');
                } else {          //导出PK数据
                    for (let i = 0; i < this.rulesList.length; i++) {
                        if (this.rulesList[i].rules.length !== 0) {
                            for (let j = 0; j < this.rulesList[i].rules.length; j++) {
                                if (this.rulesList[i].rules[j].rule.length !== 0) {
                                    for (let z = 0; z < this.rulesList[i].rules[j].rule.length; z++) {
                                        if (!lv2.includes(this.rulesList[i].rules[j].rule[z].level2Name)) {
                                            lv2.push(this.rulesList[i].rules[j].rule[z].level2Name);
                                        }
                                        for (let m = 0;
                                            m < this.rulesList[i].rules[j].rule[z].level3.length; m++) {
                                            if (!lv3.includes(this.rulesList[i].rules[j].rule[z].level3[m].level3Name)) {
                                                lv3.push(this.rulesList[i].rules[j].rule[z].level3[m].level3Name);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    lv2 = lv2.join(',');
                    lv3 = lv3.join(',');
                }
                this.$loading();
                JourneyApiV2.exportData(this.exportEmail, this.addIds, lv2, lv3, 0)
                    .then(res => {
                        if (res.body.code === 200) {
                            this.$toast(this.$t('report.exportSuccess'), 'success');
                            this.exportGroupsData = false;
                            this.exportEmail = '';
                            this.$loaded();
                        } else {
                            this.exportGroupsData = false;
                            this.exportEmail = '';
                            this.$loaded();
                        }
                    });
            },
            //导出分组数据/ PK数据弹窗关闭
            cancelExport() {
                this.exportGroupsData = false;
                this.exportEmail = '';
            },
            //创建 / 编辑分组弹窗关闭
            cancelGroup() {
                this.editGroupId = '';
                this.groupName = '';
                this.groupEditor = false;
            },
            confirmGroup() {
                if (this.groupName === '' || this.groupName === undefined || this.groupName == null) {
                    this.$toast(this.$t('report.nameNoEmpty'), 'warn');
                    return;
                }
                if (this.activeId) {    //编辑分组
                    this.$loading();
                    JourneyApiV2.updateGroup(this.activeId, this.groupName)
                        .then(res => {
                            if (res.body.code === 200) {
                                this.$toast(this.$t('common.updateSuccess'), 'success');
                                this.groupEditor = false;
                                this.editGroupId = '';
                                this.groupName = '';
                                this.getGroupList();
                                this.$loaded();
                            }
                        })
                        .catch(() => {
                            this.groupEditor = false;
                            this.editGroupId = '';
                            this.groupName = '';
                            this.$loaded();
                        });
                } else {       //新建分组
                    this.$loading();
                    JourneyApiV2.createGroup(this.groupName)
                        .then(res => {
                            if (res.body.code === 200) {
                                this.$toast(this.$t('common.createSuccess'), 'success');
                                this.groupEditor = false;
                                this.groupName = '';
                                this.labelConditionList = [
                                    {level1: 'campaign info', act: 'or', rules: []},
                                    {level1: 'audience', act: 'or', rules: []},
                                    {level1: 'creative', act: 'or', rules: []},
                                ];
                                this.getGroupList();
                                this.$loaded();
                            }
                        })
                        .catch(() => {
                            this.groupEditor = false;
                            this.groupName = '';
                            this.$loaded();
                        });
                }

            },
            //点击tab切换(总数据 / 标签数据切换)
            tabelChange(val) {
                let type = val - 1;
                this.$loading();
                this.tableDataList = [];
                JourneyApiV2.getTableData(this.addIds, type)
                    .then(res => {
                        if (res.body.code === 200) {
                            this.tableDataList = res.body.data.records;
                            this.$loaded();
                        }
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            //分组PK弹窗确定
            confirmPK() {
                if (this.comparisonIds.length === 0) {
                    this.$toast(this.$t('report.checkGroups'), 'warn');
                    return;
                }
                if (this.comparisonIds.length < 2) {
                    this.$toast(this.$t('report.comparisonGroups'), 'warn');
                    return;
                }
                this.PKDataShow = true;
                this.showGroupsPK = false;
                this.queryOpen = false;
                this.addIds = this.comparisonIds;
                this.$loading();
                this.addIds.map(id => {
                    JourneyApiV2.groupMsg(id)
                        .then(res => {
                            let rules = JSON.parse(res.body.data.journeyNikeGroupDTO.labelRules);
                            rules.map(option => {
                                this.rulesList.push(option);
                            });
                        });
                });
                JourneyApiV2.getTableData(this.comparisonIds, 0)
                    .then(res => {
                        if (res.body.code === 200) {
                            this.tableDataList = res.body.data.records;
                            this.comparisonIds = [];
                            this.$loaded();
                        }
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            //分组PK弹窗关闭
            cancelPK() {
                this.showGroupsPK = false;
                this.comparisonIds = [];
            },
            //设置数据筛选条件右侧返回按钮
            backToGroupData() {
                this.addIds = [];
                this.getTableData();
                this.PKDataShow = false;
            }
        },
        components: {
            cascadingMulti, groupData
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";
    .email-report-nike {
        .screenSelect {
            width: 70%;
        }

        .page-head {
            position: relative;
            .top-button {
                position: absolute;
                top:20px;
                right:58px;
                cursor: pointer;
                display: flex;
                align-items:center;
            }
            .details-button{
                margin-right: 12px;
            }
            .choose-file {
                width: 73px;
                opacity: 0;
            }
        }
        .report-content {
            display: flex;
            padding-top: 24px;
            padding-bottom: 43px;
            height: calc(100% - #{$toolbar-height + $page-head-height + 43px + 24px});
            // width: 100%;

            .content-view {
                width: 100%;

                .left-list {
                    height: calc(100vh - #{$header-height + $toolbar-height + 24px * 2 + 74px});
                    background-color: white;
                    width: 300px;
                    overflow: auto;
                    float: left;

                    .all-group {
                        height: 48px;
                        line-height: 48px;
                        padding: 0 16px;
                        border-bottom: 1px solid #e9e4ed;

                        .pull-right {
                            float: right;
                        }
                    }

                    .titlesas {
                        font-size: 14px;
                        height: 60px;
                        line-height: 60px;
                        padding-left: 10px;

                        .titlesas-refresh {
                            margin-left: 10px;
                            cursor: pointer;
                        }
                        .titlesas-sort {
                            margin-left: 10px;
                            cursor: pointer;
                        }
                        .titlesas-add {
                            margin-left: 10px;
                            cursor: pointer;
                        }
                    }

                    .search-field {
                        position: relative;
                        display: flex;
                        align-items: center;
                        height: $input-field-height;
                        border-bottom: 1px solid $select-border;
                        background-color: $title-bg;
                        @include border-radius(0);
                        color: $color-light-content;

                        input {
                            height: $input-field-height;
                            padding: 0 8px 0 28px;
                            width: 100%;
                            min-width: 5em; // 否则placeholder显示不全
                            border: none;
                            background-color: transparent;

                            &:hover {
                                background-color: $select-bg;

                                & + .icon-search {
                                    background-color: $select-bg;
                                }
                            }

                            &:focus {
                                background-color: #fff;

                                & + .icon-search {
                                    background-color: #fff;
                                }
                            }
                        }

                        .icon-search {
                            $offset: ($input-field-height - 14px) / 2;
                            position: absolute;
                            width: 26px;
                            height: $input-field-height - 2px;
                            line-height: $input-field-height;
                            text-align: center;
                            left: 1px;
                            top: 1px;
                            background-color: transparent;
                        }
                    }

                    .group-item {
                        padding: 0 16px;
                        line-height: 48px;
                        cursor: pointer;

                        &:hover {
                            color: $theme;
                            background-color: $select-bg;

                            .edit-button {
                                opacity: 1;
                            }

                            .delete-button {
                                opacity: 1;
                            }
                        }

                        .name {
                            display: inline-block;
                            width: 140px;
                            overflow: hidden;
                            @include ellipsis();
                            line-height: 100%;
                        }

                        svg {
                            width: 14px;
                            height: 14px;
                            fill: $form-border;
                            position: relative;
                            top: 2px;
                        }
                    }
                    .group-item.active {
                        background-color: $select-bg;
                    }
                }

                .right-list {
                    margin-left: 18px;
                    @include width-calc(calc(100% - 320px));
                    float: left;
                    @include box-sizing();
                    background-color: white;
                    height: calc(100vh - #{$header-height + $toolbar-height + 24px * 2 + 74px});
                    overflow-y: scroll;
                    position: relative;

                    .search-title {
                        position: relative;
                        height: 48px;
                        border-bottom: 1px solid #e9e4ed;
                        line-height: 48px;

                        .right-btn {
                            position: absolute;
                            right: 10px;
                            top: 0px;
                        }

                        .title {
                            font-size: 14px;
                            text-align: center;
                            color: #0cc2a9;
                        }
                    }
                    .search-info {
                        width: 100%;
                        border-bottom: 1px solid #e0e5ea;
                        .search-criteria-title {
                            font-size: 14px;
                            line-height: 48px;
                            padding-left: 20px;
                        }

                        .search-criteria-content {
                            width: 70%;
                            min-width: 950px;
                            padding-left: 40px;

                            .condition-content {
                                width: calc(100% - 20px);
                                border-left: 1px solid #ccc;
                                position: relative;

                                .just {
                                    background-color: #ccc;
                                    border-radius: 5px;
                                    color: #fff;
                                    height: 24px;
                                    width: 24px;
                                    position: absolute;
                                    top: 50%;
                                    left: 0;
                                    line-height: 22px;
                                    margin-left: -12px;
                                    margin-top: -12px;
                                    text-align: center;
                                }

                                &:before {
                                    content: '';
                                    position: absolute;
                                    left: 0;
                                    top: 0;
                                    width: 21px;
                                    height: 1px;
                                    background-color: #cccccc;
                                }

                                &:after {
                                    content: '';
                                    position: absolute;
                                    left: 0;
                                    bottom: 0;
                                    width: 21px;
                                    height: 1px;
                                    background-color: #cccccc;
                                }

                                .attr-item {
                                    line-height: 32px;
                                    border: 1px solid #eee;
                                    border-radius: 4px;
                                    background-color: #fafafa;
                                    margin: 0 0 20px 40px;

                                    .attr-top {
                                        padding:0 20px;
                                        line-height: 66px;
                                        // background-color: #cfd5df;
                                        display: flex;

                                        .attr-item-title {
                                            flex: 1;
                                        }
                                        .add {
                                            font-size: 16px;
                                            color: #0cc2a9;
                                            cursor: pointer;
                                        }
                                    }

                                    .push-number {
                                        margin: 10px 0 20px 30px;
                                        padding-right: 20px;
                                        position: relative;

                                        .condition-screen-item {
                                            margin: 10px 0 0 30px;

                                            .selectBox {
                                                margin-bottom: 10px;
                                                display: flex;
                                                justify-content: space-between;
                                            }

                                            .del {
                                                font-size: 16px;
                                                cursor: pointer;
                                            }
                                        }

                                        .maybe {
                                            width: 24px;
                                            height: 24px;
                                            background-color: #0cc4a9;
                                            border-radius: 5px;
                                            color: #fff;
                                            line-height: 22px;
                                            text-align: center;
                                            cursor: pointer;
                                            position: absolute;
                                            left: 0;
                                            top: 50%;
                                            margin-left: -12px;
                                            margin-top: -12px;
                                        }
                                    }

                                    .summation {
                                        border-left: 1px solid #ccc;

                                        &:before {
                                            content: '';
                                            position: absolute;
                                            left: 0;
                                            top: 0;
                                            width: 21px;
                                            height: 1px;
                                            background-color: #cccccc;
                                        }

                                        &:after {
                                            content: '';
                                            position: absolute;
                                            left: 0;
                                            bottom: 0;
                                            width: 21px;
                                            height: 1px;
                                            background-color: #cccccc;
                                        }
                                    }
                                }
                            }
                        }

                        .footer {
                            border-top: 1px solid #ecf4f2;
                            background-color: white;
                            padding: 14px 0 14px 80px;
                        }
                    }

                    .pull-down {
                        width: 3%;
                        height: 10px;
                        position: absolute;
                        left: 48.5%;
                        line-height: 10px;
                        background-color: $green;
                        text-align: center;
                        border: none;
                        border-radius: 0 0 4px 4px;
                        cursor: pointer;
                        @include transition(all .3s ease);

                        //向下箭头
                        .down-arrow {
                            width: 1em;
                            height: .8em;
                            fill: #fff;
                            @include transition(all .3s ease);
                        }

                        .turn-on {
                            transform: rotate(180deg) scale(1, 0.5);
                        }

                        .turn-off {
                            transform: rotate(0deg) scale(1, 0.5);
                        }

                        &:hover {
                            height: 16px;
                            line-height: 16px;
                            padding: 0;

                            .down-arrow {
                                height: 16px;
                            }

                        }

                        &.active {
                            height: 16px;
                            line-height: 16px;
                            padding: 0;

                            .down-arrow {
                                height: 16px;
                            }
                        }
                    }
                    .data-details {
                        padding: 32px 0;
                    }
                }
            }
        }

        .cascading-selection {
            width: 96%;
            .select-text {
                width: 70%;
            }
            .csedes {
                width: 72%;
            }
            .drop-down-list {
                width: 100%;
            }
        }

        .specifyMailbox {
            line-height: $input-field-height;

            .exportLabel {
                color: #595959;
                display: inline-block;
                margin-right: 12px;
                text-align: right;
                vertical-align: top;
                width: 114px;
            }
        }

        .groupPK {
            margin-left: 76px;
            .full-width {
                width: 80%;
            }
        }

        .input {
            height: $input-field-height;
            padding: 0 8px 0 8px;
            width: 60%;
            min-width: 5em; // 否则placeholder显示不全
            border: none;
            background-color: transparent;
            border: 1px solid #cfd5df;

            &:hover {
                background-color: $select-bg;

                & + .icon-search {
                    background-color: $select-bg;
                }
            }

            &:focus {
                background-color: #fff;

                & + .icon-search {
                    background-color: #fff;
                }
            }
        }
    }
</style>
