<template>
    <div class="meta-data">
        <div class="content-view">
            <div class="toolbar">
                <crumbs class="pull-left"/>
            </div>
        </div>
        <div class="content-view" id="score-list">
            <div class="data-item">
                <div class="content-top">
                    <div class="content-guide">
                        {{'metaData.quickGuide' | t}}
                    </div>
                    <div class="content-tabs">
                        <button class="btn btn-md btn-theme pull-right" @click="addScoreItem" type="button">
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-plus"></use>
                            </svg>
                            {{'metaData.add' | t}}
                        </button>

                        <div class="search-box md pull-right">
                            <input type="text" :placeholder="$t('metaData.searchKeyWord')" v-model.trim="keyWordsTemp"
                                   @keydown.enter="handleSearch">
                            <svg aria-hidden="true" @click="handleSearch">
                                <use xlink:href="#icon-search"></use>
                            </svg>
                        </div>
                        <div @click="changeList(tab)"
                             class="content-tab white"
                             :class="{active: buttonName === tab.routeName}"
                             v-for="tab in tabList">{{tab.name}}
                        </div>
                    </div>
                </div>
                <div class="simplify-table metadata-table-content score-list-table">
                    <table>
                        <thead>
                        <tr>
                            <td>{{'metaData.assessName' | t}}</td>
                            <td>{{'metaData.explain' | t}}</td>
                            <!--                        <td>{{'metaData.label' | t}}</td>-->
                            <td v-if="buttonName === 'scoreFactors'">{{'metaData.rulesNumber' | t}}</td>

                            <td v-if="buttonName === 'scoreModels'">{{'metaData.fullMarks' | t}}</td>
                            <td v-if="buttonName === 'scoreModels'">{{'metaData.factorsNumber' | t}}</td>

                            <td v-if="buttonName === 'evaluationDefinition'">{{'metaData.status' | t}}</td>
                            <td v-if="buttonName === 'evaluationDefinition'">{{'metaData.contanCalculateDefine' | t}}</td>
                            <td v-if="buttonName === 'evaluationDefinition'">{{'metaData.recentlyRun' | t}}</td>
                            <!--                        <td>{{'metaData.explain' | t}}</td>-->
                            <td :width="200" class="center-td" >{{'tag.operate' | t}}</td>
                        </tr>
                        </thead>
                    </table>
                    <div class=" simplify-table">
                        <table>
                            <tbody>
                            <tr v-for="item in options" class="label-tr">
                                <td :title="item.name">{{item.name}}</td>
                                <!--0:用户, 1:物品, 2:事件-->
                                <td :title="item.desc">{{item.desc}}</td>

                                <!--打分因子-->
                                <td v-if="buttonName === 'scoreFactors'">
                                    {{item.gradeRuleNum}}
                                </td>

                                <!--打分模型-->
                                <td v-if="buttonName === 'scoreModels'">
                                    {{item.score}}
                                </td>
                                <td v-if="buttonName === 'scoreModels'">
                                    {{item.gradeNum}}
                                </td>

                                <!--评级规则-->
                                <td v-if="buttonName === 'evaluationDefinition'">{{item.enable | enable}}</td>
                                <td v-if="buttonName === 'evaluationDefinition'">
                                    <template v-for="calculate in item.calculates">
                                        {{calculate.calcName}}
                                    </template>
                                </td>
                                <td v-if="buttonName === 'evaluationDefinition'">{{item.lastRun}}</td>
                                <!--<td>
                                    <template v-for="target in item.targets">
                                        {{target | changeTarget}}
                                    </template>
                                </td>-->
                                <!--<td class="label-td" :width="60">
                                    <svg aria-hidden="true" class="action-icon icon-round-pencil"
                                         @click.stop="updateItem(item)">
                                        <use xlink:href="#icon-round-pencil"></use>
                                    </svg>
                                </td>-->
                                <td class="label-td center-td" :width="200">
                                    <!--编辑-->
                                    <svg aria-hidden="true" class="action-icon icon-round-pencil"
                                         @click.stop="updateItem(item)"
                                         v-title:top="$t('dragJourney.edit')">
                                        <use xlink:href="#icon-round-pencil"></use>
                                    </svg>

                                    <!--关联-->
                                    <svg aria-hidden="true" class="action-icon icon-share common-button-color" v-if="buttonName === 'scoreFactors' || buttonName === 'scoreModels'"
                                         @click.stop="showItemRelation(item)"
                                         v-title:top="$t('metaData.relation')">
                                        <use xlink:href="#icon-share"></use>
                                    </svg>

                                    <!--报告-->
                                    <svg aria-hidden="true" class="action-icon icon-bar common-button-color" v-if="buttonName === 'evaluationDefinition'"
                                         @click.stop="jumpReport(item)"
                                         v-title:top="$t('metaData.report')">
                                        <use xlink:href="#icon-bar"></use>
                                    </svg>

                                    <!--日志-->
                                    <svg aria-hidden="true" class="action-icon icon-info common-button-color" v-if="buttonName === 'evaluationDefinition'"
                                         @click.stop="showRunLog(item)"
                                          v-title:top="$t('metaData.log')">
                                        <use xlink:href="#icon-info"></use>
                                    </svg>

                                    <!--删除-->
                                    <svg aria-hidden="true" class="action-icon icon-shanchu common-button-color"
                                         @click.stop="deleteItem(item)"
                                         v-title:top="$t('tag.delete')">
                                        <use xlink:href="#icon-shanchu"></use>
                                    </svg>

                                    <!--<span @click.stop="updateItem(item)" class="common-button-text">{{'metaData.edit' | t}}</span>
                                    <span @click.stop="showItemRelation(item)" class="common-button-text" v-if="buttonName === 'scoreFactors' || buttonName === 'scoreModels'">{{'metaData.relation' | t}}</span>
                                    <span @click.stop="jumpReport(item)" class="common-button-text" v-if="buttonName === 'evaluationDefinition'">{{'metaData.report' | t}}</span>
                                    <span @click.stop="showRunLog(item)" class="common-button-text" v-if="buttonName === 'evaluationDefinition'">{{'metaData.log' | t}}</span>
                                    <span @click.stop="deleteItem(item)" class="common-button-text">{{'metaData.delete' | t}}</span>-->
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <list-empty v-if="list.length === 0"/>
                    </div>
                    <div class="page-box" v-if="list.length >= pageList">
                        <pager :now="pageNow" :total="totalPage" @page="pageNow = $event"/>
                    </div>
                </div>
            </div>

            <!--打分因子关联模型弹窗-->
            <modal class="factors-modal" :title="$t('metaData.factorsRelation')" v-if="isShowFactorsRelation" @close="isShowFactorsRelation = false" size="md">
                <div class="simplify-table">
                    <table>
                        <thead>
                        <tr>
                            <td width="300px">{{'metaData.name' | t}}</td>
                            <td width="60px">{{'metaData.operation' | t}}</td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-if="factorsRelationList.length === 0">
                            <td colspan="2">
                                <list-empty />
                            </td>
                        </tr>
                        <tr v-for="(item, index) in factorsRelationList">
                            <td :title="item.name">{{item.name}}</td>
                            <td>
                                <span @click="viewRelateModel(item)" class="common-button-text">{{'metaData.view' | t}}</span>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <template v-slot:buttons>
                    <button type="button"
                            class="btn btn-md btn-white"
                            @click="isShowFactorsRelation = false">
                        {{'common.close' | t}}
                    </button>
                </template>
            </modal>
            <!--打分模型关联弹窗-->
            <modal class="models-modal" :title="$t('metaData.modelsRelation')" v-if="isShowModelsRelation" @close="isShowModelsRelation = false" size="md">
                <div class="simplify-table">
                    <table>
                        <thead>
                        <tr>
                            <td width="300px">{{'metaData.assessDefinedName' | t}}</td>
                            <td width="60px">{{'metaData.operation' | t}}</td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-if="modelsRelationList.length === 0">
                            <td colspan="2">
                                <list-empty />
                            </td>
                        </tr>
                        <tr v-for="(item, index) in modelsRelationList">
                            <td :title="item.name">{{item.name}}</td>
                            <td>
                                <span @click="viewRelateRules(item)" class="common-button-text">{{'metaData.view' | t}}</span>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <template v-slot:buttons>
                    <button type="button"
                            class="btn btn-md btn-white"
                            @click="isShowModelsRelation = false">
                        {{'common.close' | t}}
                    </button>
                </template>
            </modal>

            <!--运行日志-->
            <modal class="rule-log" :title="$t('metaData.runLog')" v-if="isShowRuleLog" @close="isShowRuleLog = false" size="lg">
                <div class="simplify-table">
                    <table>
                        <thead>
                        <tr>
                            <td width="100px">{{'metaData.startTime' | t}}</td>
                            <td width="100px">{{'metaData.endTime' | t}}</td>
                            <td width="100px">{{'metaData.status' | t}}</td>
                            <td width="100px">{{'metaData.consuming' | t}}</td>
                        </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item) in ruleLogList">
                                <td :title="item.start">{{item.startTime}}</td>
                                <td :title="item.end">{{item.endTime | endTime}}</td>
                                <td :title="item.status">{{item.status}}</td>
                                <td :title="item.time">{{item.spendTime}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <template v-slot:buttons>
                    <button type="button"
                            class="btn btn-md btn-white"
                            @click="isShowRuleLog = false">
                        {{'common.close' | t}}
                    </button>
                </template>
            </modal>
            <transition name="slide">
                <!--新增打分因子-->
                <score-factors v-if="isShowScoreDef" ref='sd' :scoreGroupSelect="scoreGroupSelect" :disableButton="disableButton"
                               @cancel="revertDefinition" @success="updateDefinitionList" @delete="deleteDefinition"
                               :updateObj="updateObject" v-blur="closeVirtualEvent"/>
                <!--新增打分模型-->
                <score-models ref='se' v-else-if="isShowComputDef" :scoreGroupSelect="scoreGroupSelect" :disableButton="disableButton"
                              :updateObj="updateObject" @cancel="revertDefinition" @success="updateComputDefList" @delete="deleteDefinition"
                              v-blur="closeVirtualEvent"/>
                <!--新增评级规则-->
                <evaluation-definition ref='ed' v-else-if="isShowScoreEval" :updateObj="updateObject" :disableButton="disableButton"
                                       @success="updateEvaluationList" :scoreGroupSelect="scoreGroupSelect" @delete="deleteDefinition"
                                       @cancel="revertDefinition"
                                       v-blur="closeVirtualEvent"/>
            </transition>
        </div>
    </div>

</template>
<script>
    import {
        webServUserGroupApiV1,
        WebServAttrApiV1,
        WebServLabelApiV1,
        WebServEventApiV1,
        WebServCalclogsV1,
        WebServGradeApiV1
    } from '@/api';
    import scoreFactors from './score-factors.vue';
    import scoreModels from './score-models.vue';
    import EvaluationDefinition from './evaluation-definition.vue';
    import {translate as t} from '@/locales';
    import {trackEvent} from '../../../monitor';

    const tabList = [
        {name: t('metaData.scoreFactor'), routeName: 'scoreFactors'},
        {name: t('metaData.calculateDefined'), routeName: 'scoreModels'},
        {name: t('metaData.ratingRules'), routeName: 'evaluationDefinition'}
    ];
    const pageList = 9;
    export default {
        data() {
            return {
                pageNow: 1,
                pageList,
                tabList,
                scoreDefList: [],
                computDefList: [],
                scoreEvalList: [],
                isShowName: false,
                //add  打分因子 打分模型 评级规则
                isShowScoreDef: false,
                isShowComputDef: false,
                isShowScoreEval: false,
                //关联弹窗
                isShowFactorsRelation:false,
                isShowModelsRelation:false,
                factorsRelationList:[],
                modelsRelationList:[],
                //日志弹窗
                isShowRuleLog:false,
                ruleLogList:[],
                //标签列表
                labelList: [],
                // 需要编辑的obj
                updateObject: {},
                userAttrList: [],
                userGroupAttrList: [],
                scoreGroupSelect: [
                    [
                        {
                            id: 'user',
                            name: this.$t('metaData.userAttr'),
                            title: this.$t('metaData.userAttr'),
                            icon: 'fans-attr',
                            options: [{id: 'user', name: this.$t('metaData.userAttr')}]
                        },
                        {
                            id: 'event',
                            name: this.$t('metaData.metaevent'),
                            title: this.$t('metaData.metaevent'),
                            icon: 'fans-attr',
                            options: []
                        }
                    ],
                    [{
                        'user': [],
                        'event': []
                    }]
                ],
                metaEventList: [],

                keyWordsTemp:'',
                disableButton:false,

            };
        },
        components: {
            scoreFactors,
            scoreModels,
            EvaluationDefinition
        },
        filters: {
            //状态
            enable:function(value){
                // true  显示启用 false 停止
                if (value === true){
                    return t('metaData.activating');
                } else if (value === false) {
                    return t('metaData.stop');
                }
                return value;
            },
            //完成时间为空时 替换为计算中
            endTime:function(value) {
                if (!value){
                    return '计算中';
                }
                return value;
            },
            //主体
            changeTarget: function (value) {
                //0:用户, 1:物品, 2:事件
                let name = '';
                if (value === '0') {
                    name = t('metaData.assessUser');
                } else if (value === '1') {
                    name = t('metaData.object');
                } else {
                    name = t('metaData.events');
                }
                return name;
            },
            //打分因子
            changeScore: function (grades) {
                //返回格式：09,01,打分因子0411,测试分值01【10】
                let str = grades.map(grade => grade.gradeName)
                    .join(',');
                return str;
            }
        },

        mounted() {
            //得到打分因子列表
            this.getScoreDefList();
            //得到打分模型列表
            this.getComputDefList();
            //得到评级规则列表
            this.getScoreEvalList();
            //得到标签列表
            // this.getLabelList();

            this.$nextTick(() => {
                this.getAllDataGroup();
            });
        },
        methods: {
            //搜索
            handleSearch(){
                switch (this.buttonName) {
                    case 'scoreFactors':
                        this.getScoreDefList();
                        break;
                    case 'scoreModels':
                        this.getComputDefList();
                        break;
                    case 'evaluationDefinition':
                        this.getScoreEvalList();
                        break;
                }
            },

            //得到 打分因子 列表
            getScoreDefList() {
                this.$loading();
                WebServGradeApiV1
                    .getScoreDefList({targets: '',name:this.keyWordsTemp})
                    .then((res) => {
                        this.$loaded();
                        this.scoreDefList = res.body.data.grades;
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            //得到打分模型列表
            getComputDefList() {
                this.$loading();
                WebServGradeApiV1
                    .getComputDefList({name:this.keyWordsTemp})
                    .then((res) => {
                        this.computDefList = res.body.data.calculates;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            //得到评级规则列表
            getScoreEvalList() {
                this.$loading();
                WebServGradeApiV1
                    .getScoreEvalList({targets: '',name:this.keyWordsTemp})
                    .then((res) => {
                        this.$loaded();
                        this.scoreEvalList = res.body.data.evaluates;
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            //得到标签列表
            getLabelList() {
                this.$loading();
                WebServLabelApiV1
                    .getLabelArray(0, this.$store.state.user.cid)
                    .then(({body: {data: {labels}}}) => {
                        this.labelList = labels;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            // 切换数据
            changeList(tab) {
                this.keyWordsTemp = '';
                //得到打分因子列表
                this.getScoreDefList();
                //得到打分模型列表
                this.getComputDefList();
                //得到评级规则列表
                this.getScoreEvalList();
                this.pageNow = this.buttonName !== tab.routeName ? 1 : this.pageNow;
                this.$router.push({
                    name: this.$route.name,
                    query: {name: tab.routeName}
                });
            },

            // 新增
            addScoreItem() {
                this.updateObject = {id: '', buttonName: this.buttonName};
                this.open();
            },

            // 新增或编辑的时候展开右侧窗口
            open() {
                this.disableButton = false;
                this.$nextTick(() => {
                    switch (this.buttonName) {
                        case 'scoreFactors':
                            this.isShowScoreDef = true;
                            break;
                        case 'scoreModels':
                            this.isShowComputDef = true;
                            break;
                        case 'evaluationDefinition':
                            this.isShowScoreEval = true;
                            break;
                    }
                });
            },

            // 点击编辑单个tr
            updateItem(item) {
                this.updateObject = item;
                this.updateObject.buttonName = this.buttonName;
                this.open();
            },
            //点击删除
            deleteItem(item){
                this.updateObject = item;
                this.updateObject.buttonName = this.buttonName;

                //删除打分因子、打分模型需校验是否有关联信息
                if (this.tabNumber === 1 || this.tabNumber === 2){
                    this.$loading();
                    WebServGradeApiV1
                        .getGradeModel(item.id,this.tabNumber)
                        .then((res) => {
                            this.$loaded();
                            if (res.body.data.list && res.body.data.list.length === 0){
                                //无关联直接执行操作
                                this.deleteItemConfirmed(item,this.tabNumber);
                            } else {
                                //有关联 需进行确认
                                this.$nextTick(() => {
                                    switch (this.buttonName) {
                                        case 'scoreFactors':
                                            // this.isShowScoreDef = true;
                                            this.$confirm(this.$t('metaData.deleteConfirm'), `${this.$t('metaData.deleteFactorConfirm')}`)
                                                .then(sure => {
                                                    if (sure) {
                                                        this.deleteItemConfirmed(item,this.tabNumber);
                                                    }
                                                });
                                            break;
                                        case 'scoreModels':
                                            // this.isShowComputDef = true;
                                            this.$confirm(this.$t('metaData.deleteConfirm'), `${this.$t('metaData.deleteModelConfirm')}`)
                                                .then(sure => {
                                                    if (sure) {
                                                        this.deleteItemConfirmed(item,this.tabNumber);
                                                    }
                                                });
                                            break;
                                    }
                                });
                            }
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                } else {
                    //删除评级规则每次都要确认
                    this.$confirm(this.$t('metaData.deleteConfirm'), `${this.$t('metaData.deleteLevelsConfirm')}`)
                        .then(sure => {
                            if (sure) {
                                this.deleteItemConfirmed(item,this.tabNumber);
                            }
                        });
                }
            },
            //确认删除
            deleteItemConfirmed(item,type){
                this.$loading();
                if (type === 1) {
                    WebServGradeApiV1
                        .deleteScoreDefinition(item.id)
                        .then(() => {
                            this.$toast(this.$t('common.deleteSuccess'), 'success');
                            trackEvent('数据中心-元数据-删除打分因子', {id: item.id});
                            this.getScoreDefList();
                            this.closeDataOperate();
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                } else if (type === 2) {
                    WebServGradeApiV1
                        .delComputDef(item.id)
                        .then(() => {
                            this.$toast(this.$t('common.deleteSuccess'), 'success');
                            trackEvent('数据中心-元数据-删除打分模型', {id: item.id});
                            this.getComputDefList();
                            this.closeDataOperate();
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                } else if (type === 3) {
                    WebServGradeApiV1
                        .deleteEvaluationDefinition(item.id)
                        .then(() => {
                            this.$toast(this.$t('common.deleteSuccess'), 'success');
                            trackEvent('数据中心-元数据-删除评级规则', {id: item.id});
                            this.getScoreEvalList();
                            this.closeDataOperate();
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                }
            },

            //点击关联按钮弹窗
            showItemRelation(item){
                switch (this.buttonName) {
                    case 'scoreFactors':
                        this.isShowFactorsRelation = true;
                        this.getItemRelationList(item,1);
                        break;
                    case 'scoreModels':
                        this.isShowModelsRelation = true;
                        this.getItemRelationList(item,2);
                        break;
                    case 'evaluationDefinition':
                        break;
                }
            },
            getItemRelationList(item,type){
                this.factorsRelationList = [];
                this.modelsRelationList = [];
                this.$loading();
                WebServGradeApiV1
                    .getGradeModel(item.id,type)
                    .then((res) => {
                        this.$loaded();
                        if (type === 1){
                            this.factorsRelationList = res.body.data.list;
                        } else if (type === 2){
                            this.modelsRelationList = res.body.data.list;
                        }

                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            //关联打分模型
            viewRelateModel(item){
                this.updateObject = item;
                //查看关联信息时不可编辑
                this.disableButton = true;
                this.isShowComputDef = true;
            },
            //关联评级规则
            viewRelateRules(item){
                this.updateObject = item;
                //查看关联信息时不可编辑
                this.disableButton = true;
                this.isShowScoreEval = true;
            },
            //评级规则日志
            showRunLog(item){

                //得到评估定义列表
                this.$loading();
                WebServCalclogsV1
                    .getEvaluationLogs(item.id)
                    .then((res) => {
                        this.isShowRuleLog = true;
                        this.ruleLogList = res.body.data.logList;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            //跳转评级报告页
            jumpReport(item){
                this.$router.push({
                    name: 'scoreReport',
                    query: {name:'scoreReport',id: item.id}
                });
            },

            // 打分因子相关
            // 更新打分因子的列表
            updateDefinitionList() {
                this.getScoreDefList();
                this.closeDataOperate();
            },

            // 更新打分模型的列表
            updateComputDefList() {
                this.getComputDefList();
                this.closeDataOperate();
            },

            // 从自组件中点击删除 直接调用列表删除方法
            deleteDefinition(item) {
                this.deleteItem(item);
            },

            // 评估定义相关
            // 更新评估定义列表
            updateEvaluationList() {
                this.getScoreEvalList();
                this.closeDataOperate();
            },

            // 还原新增状态
            revertDefinition() {
                this.closeVirtualEvent();
            },

            //关闭新增虚拟事件
            closeVirtualEvent() {
                let timeout = setTimeout(() => {
                    switch (this.buttonName) {
                        case 'scoreFactors':
                            this.getScoreDefList();
                            break;
                        case 'scoreModels':
                            this.getComputDefList();
                            break;
                        case 'evaluationDefinition':
                            this.getScoreEvalList();
                            break;
                    }
                    this.closeDataOperate();
                    clearTimeout(timeout);
                }, 200);

            },

            //关闭新增页面时Data的变化
            closeDataOperate() {
                let _this = this;
                _this.isShowScoreDef = false;
                _this.isShowComputDef = false;
                _this.isShowScoreEval = false;
                // _this.attrs = [];
            },

            // 得到用户属性
            getUserAttributes() {
                return WebServAttrApiV1.getAttributes({attrType: 0, isFilter: '', isResult: ''})
                    .then((res) => {
                        this.userAttrList = res.body.data.attributeList.map(item => {
                            return {
                                attrGenre: item.attrGenre,
                                attrType: item.attrType,
                                id: item.id,
                                name: item.meaning,
                                isSecondSelect: true,
                                attrLength: item.attrLength,
                                disabled: false,
                                type: 'user'
                            };
                        });

                    });
            },

            // 得到用户分群
            getUserGroupList() {
                return webServUserGroupApiV1
                    .getUserGroups()
                    .then(res => {
                        this.userGroupAttrList = res.body.data.userGroupList
                            .filter(group => group.enable)
                            .map(item => {
                                return {
                                    id: item.id,
                                    name: item.name,
                                    type: 'group',
                                    isSecondSelect: true,
                                    disabled: false,
                                    attrGenre: 100,
                                    userGroupInfo: JSON.stringify(item)
                                };
                            });
                    });

            },

            // 得到元事件列表
            getMetaEventList() {
                return WebServEventApiV1
                    .getMetaEventList('')
                    .then((res) => {
                        this.metaEventList = res.body.data.eventList;
                        this.metaEventList.forEach(item => {
                            item.name = item.meaning;
                        });
                    });
            },

            // 请求都完成以后再将选项拼接起来
            async getAllDataGroup() {
                await Promise.all([this.getUserAttributes(), this.getUserGroupList(), this.getMetaEventList()]);
                this.scoreGroupSelect = [
                    [
                        {
                            id: 'user',
                            name: this.$t('metaData.userAttr'),
                            title: this.$t('metaData.userAttr'),
                            icon: 'fans-attr',
                            options: [{id: 'user', name: this.$t('metaData.userAttr')}]
                        },
                        {
                            id: 'group',
                            name: this.$t('metaData.userSwarm'),
                            title: this.$t('metaData.userSwarm'),
                            icon: 'fans-attr',
                            options: [{id: 'group', name: this.$t('metaData.userSwarm')}]
                        },
                        {
                            id: 'event',
                            name: this.$t('metaData.metaevent'),
                            title: this.$t('metaData.metaevent'),
                            icon: 'fans-attr',
                            options: this.metaEventList
                        }
                    ],
                    [{
                        'user': this.userAttrList.slice(),
                        'group': this.userGroupAttrList.slice(),
                        'event': []
                    }]
                ];
            },
        },
        watch:{
            totalPage(total){
                this.pageNow = this.pageNow > total ? total : this.pageNow;
            }
        },
        computed: {
            options() {
                let arr = this.list.slice((this.pageNow - 1) * pageList, this.pageNow * pageList);
                arr.map((item) => {
                    if (item.labels.length !== 0) {
                        item.labelsObj = JSON.parse(item.labels);
                    } else {
                        item.labelsObj = [];
                    }
                });
                return arr;
            },
            totalPage() {
                let total = Math.ceil(this.list.length / this.pageList);
                return total > 0 ? total : 1 ;
            },
            list() {
                switch (this.buttonName) {
                    case 'scoreFactors':
                        return this.scoreDefList;
                    case 'scoreModels':
                        return this.computDefList;
                    case 'evaluationDefinition':
                        return this.scoreEvalList;
                    default:
                        return [];
                }
            },
            tabNumber(){
                switch (this.buttonName) {
                    case 'scoreFactors':
                        return 1;
                    case 'scoreModels':
                        return 2;
                    case 'evaluationDefinition':
                        return 3;
                    default:
                        return '';
                }
            },
            buttonName() {
                if (!this.$route.query.name) {
                    this.$router.push({
                        name: this.$route.name,
                        query: {name: this.tabList[0].routeName}
                    });
                }
                return this.$route.query.name;
            }
        }

    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../data-item";
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    $margin-left: 45px;
    #score-list {
        .content-top {
            padding-bottom: 0;
            .content-guide{
                height: 30px;
                line-height: 30px;
                padding: 0 15px;
                margin-bottom: 15px;
                border: 1px solid $form-border;
                background-color: $title-bg;
                color: $color-title;
            }
            .search-box{
                margin-right: 20px;
            }
        }

        .slide-form {
            width: 665px;
        }

        //edit
        tbody {
            tr.label-tr {
                td {
                    .label {
                        display: inline-block;
                        padding: 3px 4px;
                        border-radius: 4px;
                        border: 1px solid $form-border;

                        + .label {
                            margin-left: 9px;
                        }

                        .color {
                            display: inline-block;
                            width: 16px;
                            height: 16px;
                            vertical-align: text-bottom;
                            border-radius: 2px;
                        }
                    }
                }

                .label-td {
                    overflow: visible !important;
                }

                &:hover {
                    //td悬浮时标签换颜色，但是不悬浮时，看不见也不明显，若白色，字体和边框换成主题蓝或者灰
                    /*td {*/
                    /*span.label {*/
                    /*color: #ccc;*/
                    /*}*/
                    /*}*/

                    .label-td {
                        button {
                            display: inline-block;
                        }
                    }
                }
            }

        }

        //page
        .page-box {
            @include clearfix();
            line-height: 65px;

            .pages-text {
                float: left;
            }

            .pages-box {
                float: right;
            }
        }

        //三个页面的表头
        .e-content-condition {
            padding: 1em 0;

            h4 {
                background-color: $title-bg;
                margin: 0 0 10px 0;
                padding: 10px 16px;
                font-size: 16px;
                font-weight: normal;

                .oper-btn {
                    height: 16px;
                    width: 16px;
                    float: right;
                    color: #fff;
                    border: hidden;
                    cursor: pointer;
                    position: relative;
                    border-radius: 100%;
                    text-align: center;

                    &.arrow-down {
                        background-color: $disabled;

                        svg {
                            width: 10px;
                            height: 16px;
                            fill: #fff;
                        }
                    }
                }
            }

            .score-item-title {
                .tag {
                    width: 70px;
                    height: 24px;
                    line-height: 24px;
                    color: #fff;
                    background-color: #798491;
                    border-top-right-radius: 4px;
                    border-bottom-right-radius: 4px;
                    text-align: center;
                    margin-bottom: 20px;
                    

                    &:before {
                        content: '';
                        position: absolute;
                        display: block;
                        width: calc(100% - 70px);
                        top: 12px;
                        left: 70px;
                        border-top: 1px solid $border-color;
                    }
                }

                .handle-btn {
                    position: absolute;
                    right: 0;
                    top: 5px;
                    @include clearfix();

                    .oper-btn {
                        width: 16px;
                        height: 16px;
                        border-radius: 100%;
                        float: right;
                        margin-right: 16px;
                        cursor: pointer;
                        text-align: center;

                        &.copy,
                        &.arrow-down {
                            background-color: $disabled;

                            svg {
                                width: 10px;
                                height: 16px;
                                fill: #fff;

                            }
                        }

                        &.close {
                            fill: $disabled
                        }

                        .gradeItem-delete {
                            position: absolute;
                            bottom: 0;
                            right: 0;
                            z-index: $index-popup;
                            border: 1px solid #d1dce7;
                            background-color: white;
                            padding: 10px;

                            .delete-content {
                                width: 200px;
                                font-size: 16px;
                                padding: 20px;
                                text-align: center;

                                p {
                                    font-weight: 700;
                                    padding-bottom: 10px;
                                }

                                span {
                                    color: #c8cacb;
                                }

                            }

                            .delete-box {
                                display: block;
                                padding: 5px 0;
                                font-size: 14px;
                                @include clearfix();

                                button {
                                    float: right;
                                    padding: 0 10px;
                                    margin-left: 11px;
                                    line-height: 30px;
                                    height: 30px;
                                }

                                .cancel-btn {
                                    background-color: white;
                                    border-radius: 3px;
                                    color: $green;
                                    border: 1px solid $green;

                                    &:hover {
                                        color: $light-green;
                                    }

                                }

                                .confirm-btn {
                                    border: none;
                                    background-color: $red;
                                    color: white;
                                    border-radius: 3px;

                                }

                            }

                        }
                    }

                }
            }
        }

        //三个页面的添加按钮
        .add-score {
            margin-left: $margin-left;
            cursor: pointer;
        }
        .common-button-text{
            color: $theme;
            cursor: pointer;
        }
        .common-button-color{
            color: $theme;
        }
        .center-td{
            text-align: center;
        }
        .factors-modal{
            z-index: 29;
        }
        .models-modal{
            z-index: 29;
        }
        .score-list-table{
            max-height: calc(100vh - 230px);
        }
        .rule-log {
            .simplify-table {
                overflow: auto;
                height: 500px;
            }
        }
    }

</style>
