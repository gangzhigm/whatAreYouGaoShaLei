<template>
    <div class="evaluation-definition slide-form">
        <div class="form-title" v-if="!disableButton">
            <span class="icon-right icon"></span>
            {{scoreId === '' ? $t('metaData.addAssessDefined') : $t('metaData.editAssessDefined')}}
        </div>
        <div class="form-title" v-else>
            <span class="icon-right icon"></span>
            {{'metaData.viewAssessDefined' | t}}
        </div>
        <div class="form-content">
            <div class="form-field">
                <label class="label" for="name">{{'metaData.enable' | t}}</label>
                <switch-button :value="scoreObject.enable" @input="changeEnable" :disabled="disableButton"/>
            </div>
            <div class="form-field">
                <label class="label" for="name">{{'metaData.assessName' | t}}</label>
                <input class="input" id="name" type="text" v-model.trim="scoreObject.name" maxlength="255"
                       @focus="errorName=''" :disabled="disableButton"
                       :placeholder="$t('metaData.assessDefinedName')" v-title:top.line.warn="errorName" :class="{error: errorName}">
            </div>

            <div class="form-field">
                <label class="label" for="remark">{{'metaData.explain' | t}}</label>
                <textarea v-model.trim="scoreObject.desc" class='textarea' id="remark" maxlength="255" :disabled="disableButton"
                          :placeholder="$t('metaData.assessDefinedExplain')"></textarea>
            </div>
            <div class="form-field">
                <label class="label">{{'metaData.calculateDefined' | t}}</label>
                <selector class="select-field" type="select" search
                          :options="computDefList" v-model="ruleId"
                          @select="changeRule" v-title:right.line.warn="errorRule"
                          :class="{error: errorRule}" :disabled="disableButton"></selector>
                <span>{{'metaData.fullMarks' | t}}：{{modelSelected.score}}  {{'metaData.points' | t}}</span>
            </div>
            <div class="form-field">
                <label class="label" >{{'metaData.operatingPlan' | t}}</label>
                <span>{{'metaData.everyDay' | t}}</span>
                <time-picker :value="runTime" :error="errorRunTime" @input="changeRunTime" :disabled="disableButton" v-title:top.line.warn="errorRunTime" :class="{error: errorRunTime}"></time-picker>
            </div>
            <div class="form-field">
                <label class="label">{{'metaData.rankDisplay' | t}}</label>
                <checkbox v-model="rankDisplay" :disabled="disableButton">{{'metaData.rankDisplayDescription' | t}}</checkbox>
                <svg class="notation-icon" aria-hidden="true" v-title="$t('metaData.rankDisplayNotation')">
                    <use xlink:href="#icon-help"></use>
                </svg>
            </div>

            <div class="e-content-condition">
                <h4 @click="defaultShow = !defaultShow">
                    {{'metaData.defineRatingLevels' | t}}
                    <div class="oper-btn arrow-down"
                         :style="defaultShow?'transform:rotate(180deg)':'transform:rotate(0deg)'">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-arrow-down"></use>
                        </svg>
                    </div>
                </h4>

                <div class="e-content-description">
                    <p> {{'metaData.defineRatingDescription' | t}}</p>
                </div>

                <div class='evaluation-item' v-for="(item,index) in calculates" :key="index">
                    <div class="score-item-title">
                        <div class="tag">
                            {{'metaData.ratingLevel' | t}}{{index + 1}}
                        </div>
                        <div class="handle-btn">
                            <div class="oper-btn arrow-down"
                                 :style="item.itemShow?'transform:rotate(180deg)':'transform:rotate(0deg)'"
                                 @click="changeDefaultShow(item)">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-arrow-down"></use>
                                </svg>
                            </div>
                            <div class="oper-btn copy" @click="copyCalculates(item,index,calculates)" v-show="!disableButton">
                                <!--复制 start-->
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-copy"></use>
                                </svg>
                            </div>

                            <!--上移下移-->
                            <div class="oper-btn copy" @click="changeSort(index,calculates,'down')" v-show="!disableButton">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-xiayi"></use>
                                </svg>
                            </div>
                            <div class="oper-btn copy" @click="changeSort(index,calculates,'up')" v-show="!disableButton">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-shangyi"></use>
                                </svg>
                            </div>

                            <!--删除 start-->
                            <svg aria-hidden="true" class="oper-btn close" v-show="!disableButton"
                                 @click="delEvaluationDefinition(calculates,index)">
                                <use xlink:href="#icon-round-close"></use>
                            </svg>
                        </div>
                    </div>
                    <!--一项分值等级 start-->
                    <div class="evaluation-item-content">
                        <!--<div class="score-result">
                            <selector class="max-length-15 lg" type="select"
                                      :options="evaluationTypeList" v-model="item.showDef.type"
                                      @select="changeEvaluationType(item)"></selector>
                            &lt;!&ndash;<input type="text" class="input" v-model="item.showDef.content"&ndash;&gt;
                            &lt;!&ndash;@change="changeShowName(item)">&ndash;&gt;
                            <input type="text" class="input" v-model="item.showDef.content"
                                   @keyup="changeShowName(item)" @change="changeShowName(item)"
                                   v-title:top.line.warn="errorText[index]" :class="{error: errorText[index]}">

                            <span>{{'metaData.displayOf' | t}}</span>
                            <input type="text" class="input" v-model="item.showDef.showName"
                                   @change="changeShow(item)">
                        </div>-->

                        <div class="score-result">
                            <span class="rule-text">{{'metaData.scoreRange' | t}}</span>
                            <selector class="max-length-15 lg" type="select"
                                      :options="functionList" :disabled="disableButton"
                                      v-model="item.showDef.scoreCondition.function"
                                      @select="changeResult(item)"/>
                            <!--<input type="text" class="input"-->
                            <!--v-if="item.showDef.scoreCondition .function !== 'notBetween' && item.showDef.scoreCondition .function !=='between'"-->
                            <!--v-model="item.showDef.scoreCondition .params[0]" @change="changeParams(item)">-->
                            <!--分值计算结果：小数-->
                            <number-input :precision="4" :disabled="disableButton"
                                          v-if="item.showDef.scoreCondition .function !== 'notBetween' && item.showDef.scoreCondition .function !=='between'"
                                          type="int" class="input"
                                          v-model="item.showDef.scoreCondition.params[0]"
                                          v-title:top.line.warn="errorResult[index]"
                                          :class="{error: errorResult[index]}"/>
                            <!--区间和不在区间-->
                            <div class="between-box" v-else>
                                <selector class="max-length-15 lg" type="select"
                                          :options="notBetweenSelectList" :disabled="disableButton"
                                          v-model="item.showDef.scoreCondition .paramsInterval[0]"/>
                                <number-input type="int" class="input" :disabled="disableButton"
                                              v-model="item.showDef.scoreCondition.params[0]"
                                              v-title:top.line.warn="errorSection0[index]"
                                              :class="{error: errorSection0[index]}"/>
                                {{'metaData.to' | t}}
                                <number-input type="int" class="input" :disabled="disableButton"
                                              v-model="item.showDef.scoreCondition.params[1]"
                                              v-title:top.line.warn="errorSection1[index]"
                                              :class="{error: errorSection1[index]}"/>
                                <selector class="max-length-15 lg" type="select"
                                          :options="notBetweenSelectList1" :disabled="disableButton"
                                          v-model="item.showDef.scoreCondition .paramsInterval[1]"/>
                            </div>
                        </div>
                        <div class="score-result">
                            <span class="rule-text">{{'metaData.ratingLevel' | t}}</span>
                            <input type="text" class="input ratingLevel" v-model="item.showDef.showName" :disabled="disableButton">
                        </div>

                    </div>
                    <!--一项评估定义 end-->
                </div>

                <button class="btn btn-sm btn-theme add-score" v-show="!disableButton"
                        type="button" @click="addEvaluationDefinition(calculates)">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'metaData.addLevel' | t}}
                </button>
            </div>
        </div>
        <div class="e-save-box">
            <button v-if="scoreId" type="button" class="btn btn-md btn-red pull-left"
                    :title="unDeletableTip" :disabled="!!unDeletableTip || disableButton" @click="delScoreConfirm">
                {{'metaData.delete' | t}}
            </button>
            <button class="btn btn-md btn-theme-border" type="button" @click="cancel" :disabled="disableButton">{{'common.cancel' | t}}</button>
            <button class="btn btn-md btn-theme" type="button" @click="save" :disabled="loading || disableButton">{{'common.save' | t}}
            </button>
        </div>
    </div>
</template>
<script>
    import { 
        ContactApiV1,
        webServUserGroupApiV1,
        WebServAttrApiV1,
        WebServEventApiV1,
        WebServGradeApiV1
    } from '@/api';
    import cloneDeep from 'lodash/cloneDeep';
    import debounce from 'lodash/debounce';
    import ScoreFilter from './filter/score-query-filter.vue';
    import {format} from 'date-fns';
    import {COMMON_NAME_REGEXP} from '@/common/utils/regs';
    import Tree from '../../../common/components/selector-tree.vue';
    import {logError,trackEvent} from '@/monitor';
    import timePicker from './components/time-picker.vue';
    import { mapState } from 'vuex';

    //判断不是合法的数字类型返回''，数字类型或小数。小数位数小于4位不处理，大于4位四舍五入
    function formatScore(score) {
        let str = score;
        if (score) {
            if (isNaN(score)) {
                //不是数字类型
                str = '';
            } else {
                //数字类型或小数。小数位数小于4位不处理，大于4位四舍五入
                //正则：只能为数字,分正负数,如果有小数位,最多只能是4位小数
                let g = /^[+-]?\d+(?:\.\d{1,4})?$/;
                if (!g.test(score)) {
                    //不符合四位小数如1.23456四舍五入1.2346
                    str = Number(score)
                        .toFixed(4);
                }
            }

        }
        return str;
    }

    const COMMON_FUNCTION = [
        {id: 'equal', name: '='},
        {id: 'less', name: '<'},
        {id: 'lessEqual', name: '≤'},
        {id: 'greaterEqual', name: '≥'},
        {id: 'greater', name: '>'}
    ];
    export default {
        props: {
            updateObj: '',
            scoreGroupSelect: {
                type: Array
            },
            disableButton: false,
        },

        data() {
            return {
                scoreId: '',
                scoreObject: {
                    enable: false,
                    status: 1, // 执行完成
                    labels: [],
                },
                copyScoreBObj: {},
                defaultShow: true,
                //过滤条件
                filterList: {
                    conditions: [],
                    relation: 'and'
                },
                // 用户属性
                userAttrList: [],
                // 用户分群
                userGroupAttrList: [],
                // 元事件
                metaEventList: [],
                // 书签
                labels: [],
                labelList: null,
                isShowLabelList: false,
                computDefList: [],

                // 评估计算规则
                ruleId: '',
                ruleName: '',

                notBetweenSelectList: [
                    {id: 'include', name: '['},
                    {id: 'exclude', name: '('}
                ],
                notBetweenSelectList1: [
                    {id: 'include', name: ']'},
                    {id: 'exclude', name: ')'}
                ],

                // 评估定义类型
                evaluationTypeList: [
                    {id: 'percent', name: this.$t('metaData.percent')},
                    {id: 'number', name: this.$t('metaData.number')},
                    {id: 'text', name: this.$t('metaData.text')}
                ],

                functionList: [
                    ...COMMON_FUNCTION,
                    {id: 'between', name: this.$t('metaData.between')},
                    {id: 'notBetween', name: this.$t('metaData.notBetween')}
                ],

                calculates: [
                    {
                        functionList: COMMON_FUNCTION, // 需要删除
                        itemShow: false, // 是否展开
                        showDef: {
                            type: 'percent',
                            content: '',
                            showName: '',
                            isChangeName: false,
                            scoreCondition: {
                                function: 'equal',
                                params: [],
                                paramsInterval: ['include', 'exclude'],
                            }
                        },
                        filter: {
                            relation: 'and',
                            conditions: []
                        }
                    }
                ],
                // 如果已经被引用了，则不能删除，这里是不能删除时候的提示
                unDeletableTip: '',
                //校验用
                errorName: '',
                errorRunTime:'',
                errorRule: '',
                errorText: [],
                errorResult: [],
                errorSection0: [],
                errorSection1: [],
                isSave: false,
                checkedVipItem: [],
                groupList: [],
                keyword: [],
                idArray: [],
                allLabelList: [],
                sortType:1,
                enable:true,
                runTime:'23:00',
                rankDisplay:false,
                showTime:'',

            };
        },
        computed:{
            ...mapState(['loading']),
            //选择的打分模型
            modelSelected(){
                let rs = this.computDefList.find(item =>{
                    return item.id === this.ruleId;
                });
                return rs ? rs : {score : 0};
            }
        },
        watch: {
            //折叠/全部展开
            defaultShow(newValue) {
                this.calculates.forEach(item => {
                    item.itemShow = newValue;
                });
            },
            checkedVipItem(val) {
                this.keyword = [];
                this.idArray = [];
                // 获取被选中的标签名
                for (let i = 0; i < val.length; i++) {
                    this.keyword.push(val[i].name);
                }
                // 获取被选中的标签ID
                for (let i = 0; i < val.length; i++) {
                    this.idArray.push(val[i].id);
                }
            }
        },
        mounted() {

            // 不为空为编辑，为空的话是新增
            if (this.updateObj.id !== '') {
                this.scoreId = this.updateObj.id;
                /*if (this.updateObj.buttonName !== 'evaluationDefinition') {
                    return;
                }*/
                this.getEvaluation();
            } else {
                this.scoreId = '';
                this.scoreObject = {
                    name: '',
                    targets: [0],
                    desc: '',
                    labels: [],
                    //realTimeData: false,
                    enable: false,
                    //最后执行时间
                    lastUpdateTime: '',
                    //状态:0执行中,1执行完成
                    status: 1
                };
                //默认选中第一个分值计算规则
                if (this.computDefList && this.computDefList.length > 0) {
                    this.ruleId = this.computDefList[0].id;
                    this.ruleName = this.computDefList[0].name;
                }

                this.calculates = [
                    {
                        functionList: COMMON_FUNCTION, // 需要删除
                        itemShow: true, // 是否展开
                        showDef: {
                            type: 'percent',
                            content: '',
                            showName: '',
                            isChangeName: false,
                            scoreCondition: {
                                function: 'equal',
                                params: [],
                                paramsInterval: ['include', 'exclude'],
                            }
                        },
                        filter: {
                            relation: 'and',
                            conditions: [
                                // {
                                // attrGenre: 0, //过滤属性对应的类型 0：字符串，1：数字，2-时间
                                // eventId: '', //首次对应的事件id
                                // field: {
                                // attrId: '', //过滤属性的attrId
                                // },
                                // conditionType: 'fans',
                                // function: '', //过滤属性对应的函数
                                // params: [], //函数对应的参数
                                // format: 'day',
                                // collectFunction: '',
                                // paramsInterval: ['include', 'include'],
                                // type: '',    //过滤条件的类型
                                // userGroupInfo: {},
                                // numberPrecision: '', //精度
                                // userGroupRelation: '',
                                // functionSelectList: '',  //增加的过滤选项 需要删除的
                                // }
                            ]
                        }
                    }
                ];
                //新增调用一下标签列表
                this.getVipLabel();
            }
            //调用计算属性
            this.getComputDefList();

            //新增时须给this.errorText.push('');，否则为undefined
            this.calculates.forEach(() => {
                this.errorText.push('');
                this.errorResult.push('');
                this.errorSection0.push('');
                this.errorSection1.push('');
            });
        },
        methods: {
            changeEnable(val){
                if (this.disableButton){
                    return;
                }
                this.scoreObject.enable = val;
            },
            changeRunTime(val){
                this.runTime = val;
            },
            checked(val) {
                this.checkedVipItem = val;
                this.keyword = [];
                this.idArray = [];
                // 获取被选中的标签名
                for (let i = 0; i < val.length; i++) {
                    this.keyword.push(val[i].name);
                }
                // 获取被选中的标签ID
                for (let i = 0; i < val.length; i++) {
                    this.idArray.push(val[i].id);
                }
            },
            // 获取会员标签
            getVipLabel() {
                this.$loading();
                ContactApiV1
                    .getGroups({
                        sortType: this.sortType
                    })
                    .then((res) => {
                        this.groupList = res.body.data.rootGroup.childs;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            changeDefaultShow(item) {
                this.$set(item, 'itemShow', !item.itemShow);
                let trueLen = this.calculates.filter(list => list.itemShow === true).length;
                let falseLen = this.calculates.filter(list => list.itemShow === false).length;
                if (trueLen === this.calculates.length) {
                    this.defaultShow = true;
                } else if (falseLen === this.calculates.length) {
                    this.defaultShow = false;
                }
            },
            // 删除评估定义
            delEvaluationDefinition(list, index) {
                list.splice(index, 1);
            },

            // 新增评估定义
            addEvaluationDefinition(list) {
                let obj = {
                    functionList: COMMON_FUNCTION, // 需要删除
                    itemShow: true, // 是否展开
                    showDef: {
                        type: 'percent',
                        content: '',
                        showName: '',
                        isChangeName: false,
                        scoreCondition: {
                            function: 'equal',
                            params: [],
                            paramsInterval: ['include', 'exclude'],
                        }
                    },
                    filter: {
                        relation: 'and',
                        conditions: []
                    }
                };
                list.push(obj);
                //点击新增评估定义时
                this.errorText = [];
                this.errorResult = [];
                this.errorSection0 = [];
                this.errorSection1 = [];
                list.forEach(() => {
                    this.errorText.push('');
                    this.errorResult.push('');
                    this.errorSection0.push('');
                    this.errorSection1.push('');
                });
            },

            // 改变评估类型
            changeEvaluationType(item) {
                // let type = item.showDef.type;
                // item.functionList = this.functionMap[type];
                item.showDef.scoreCondition.function = 'equal';
                item.showDef.content = '';
                item.showDef.showName = '';
                item.showDef.isChangeName = false;
                item.showDef.scoreCondition.params = [];
            },

            // 改变显示名称
            changeShowName(item) {
                this.showNameRules(item);
            },
            //显示为变化时
            changeShow(item) {
                item.showDef.isChangeName = true;
                //显示为空时，显示为的值根据前面发生变化
                if (item.showDef.showName === '') {
                    item.showDef.isChangeName = false;
                    this.showNameRules(item);
                }
            },
            //分值计算结果
            changeParams(item) {
                //判断是否是数值型，不是返回''
                let params = item.showDef.scoreCondition.params[0];
                this.$set(item.showDef.scoreCondition.params, 0, formatScore(params));


            },
            // 百分比的显示名称的命名规则
            showNameRulesPercent(item) {
                if (item.showDef.content) {
                    //存在值在格式化显示值
                    if (item.showDef.scoreCondition.function === 'equal') {
                        item.showDef.showName = item.showDef.content + '%';
                    } else {
                        let list = item.functionList.$getByKey(item.showDef.scoreCondition.function);
                        const functionName = list ? list.name : '';
                        item.showDef.showName = functionName + item.showDef.content + '%';
                    }

                } else {
                    item.showDef.showName = '';
                }

            },

            // 数值的显示名称的命名规则
            showNameRulesNumber(item) {
                if (item.showDef.content) {
                    //存在值在格式化显示值
                    if (item.showDef.scoreCondition.function === 'equal') {
                        item.showDef.showName = item.showDef.content;
                    } else {
                        let list = item.functionList.$getByKey(item.showDef.scoreCondition.function);
                        const functionName = list ? list.name : '';
                        item.showDef.showName = functionName + item.showDef.content;
                    }

                } else {
                    item.showDef.showName = '';
                }
            },

            // 文本的显示名称的命名规则
            showNameRulesText(item) {
                if (item.showDef.content) {
                    //存在值在格式化显示值
                    item.showDef.showName = item.showDef.content;
                } else {
                    item.showDef.showName = '';
                }
            },

            // 显示名称的命名规则
            showNameRules(item) {
                const type = item.showDef.type;
                if (type === 'percent') {
                    //数字格式,小数4位
                    item.showDef.content = formatScore(item.showDef.content);
                    //名称已改变，不在进行显示为变化
                    if (item.showDef.isChangeName) {
                        return;
                    }
                    //显示为变化
                    this.showNameRulesPercent(item);

                } else if (type === 'number') {
                    //数字格式,小数4位
                    item.showDef.content = formatScore(item.showDef.content);
                    //名称已改变，不在进行显示为变化
                    if (item.showDef.isChangeName) {
                        return;
                    }
                    //显示为变化
                    this.showNameRulesNumber(item);
                } else {
                    //名称已改变，不在进行显示为变化
                    if (item.showDef.isChangeName) {
                        return;
                    }
                    //显示为变化
                    this.showNameRulesText(item);
                }
            },

            // 等于 大于 小于
            changeResult(item) {
                item.showDef.scoreCondition.params = [];
                if (item.showDef.isChangeName) {
                    return;
                }
                this.showNameRules(item);
            },

            // 改变打分模型
            changeRule(e) {
                this.ruleName = e.name;
                // this.modelSelected = e;
            },

            //得到评估定义列表
            getComputDefList() {
                this.$loading();
                WebServGradeApiV1
                    .getComputDefList({name:''})
                    .then((res) => {
                        this.computDefList = res.body.data.calculates;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            // 得到用户属性
            getUserAttributes() {
                return WebServAttrApiV1
                    .getAttributes({attrType: 0, isFilter: '', isResult: ''})
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

            // 更新过滤条件filterList
            updateFilter(index, newFilter) {
                const copy = cloneDeep(this.calculates[index]);
                copy.filter = newFilter;
                this.calculates.splice(index, 1, copy);
            },

            // 增加分值定义
            additionScore(list) {
                let filterList = {
                    conditions: [
                        // {
                        // attrGenre: 0, //过滤属性对应的类型 0：字符串，1：数字，2-时间
                        // eventId: '', //首次对应的事件id
                        // field: {
                        // attrId: '', //过滤属性的attrId
                        // },
                        // conditionType: 'fans',
                        // function: '', //过滤属性对应的函数
                        // params: [], //函数对应的参数
                        // format: 'day',
                        // collectFunction: '',
                        // paramsInterval: ['include', 'include'],
                        // type: '',    //过滤条件的类型
                        // userGroupInfo: {},
                        // numberPrecision: '', //精度
                        // userGroupRelation: '',
                        // functionSelectList: '',  //增加的过滤选项 需要删除的
                        // }
                    ],
                    relation: 'and'
                };
                list.push(
                    {
                        id: '',
                        score: 0,
                        show: this.$t('metaData.ultimateAdiposis'),
                        itemShow: true,
                        filter: filterList
                    }
                );
            },

            // 删除分值定义
            deleteScore(list, index) {
                list.splice(index, 1);
            },

            //增加过滤条件
            createFilter(list) {
                let obj = {
                    attrGenre: '', //过滤属性对应的类型 0：字符串，1：数字，2-时间
                    eventId: '', //首次对应的事件id
                    field: {
                        attrId: '', //过滤属性的attrId
                    },
                    conditionType: '',
                    function: '', //过滤属性对应的函数
                    params: [], //函数对应的参数
                    format: 'day',
                    collectFunction: 'equal',
                    paramsInterval: ['include', 'include'],
                    type: '',    //过滤条件的类型
                    userGroupInfo: {},
                    numberPrecision: '', //精度
                    userGroupRelation: '',
                    functionSelectList: '',  //增加的过滤选项 需要删除的
                };
                list.push(obj);
            },

            // 得到评估详情
            getEvaluation() {
                this.$loading();
                WebServGradeApiV1
                    .getEvaluationDefinition(this.scoreId)
                    .then((
                        {
                            body: {
                                data: {
                                    evaluate: {
                                        status, lastUpdateTime, enable,
                                        // realTimeData,
                                        name, targets, labels, desc, calculates,
                                        executeTime,show,showTime
                                    }
                                }
                            }
                        }) => {
                        this.$loaded();
                        let targets1 = targets.split(',');
                        this.scoreObject.name = name;
                        this.scoreObject.targets = targets1.map(item => Number(item));
                        this.scoreObject.labels = labels;
                        this.scoreObject.desc = desc;
                        //this.scoreObject.realTimeData = realTimeData;
                        this.scoreObject.enable = enable;
                        this.scoreObject.lastUpdateTime = lastUpdateTime;
                        this.scoreObject.status = status;

                        this.ruleId = calculates[0].calcId;
                        this.ruleName = calculates[0].calcName;
                        this.calculates = JSON.parse(calculates[0].rules).evaluates;

                        this.runTime = executeTime.slice(0,2) + ':' + executeTime.slice(2,4);
                        this.rankDisplay = show ? show : false;
                        this.showTime = showTime;
                        //校验用的字段
                        this.errorText = [];
                        this.errorResult = [];
                        this.errorSection0 = [];
                        this.errorSection1 = [];
                        this.calculates.forEach(item => {
                            // let functionList = this.functionMap[item.showDef.type];
                            //this.$set(item, 'itemShow', false);
                            this.$set(item, 'itemShow', this.defaultShow);
                            // this.$set(item, 'functionList', functionList);

                            //编辑时须给this.errorText.push('');，否则为undefined
                            this.errorText.push('');
                            this.errorResult.push('');
                            this.errorSection0.push('');
                            this.errorSection1.push('');
                        });

                        // 显示标签
                        this.checkedVipItem = [];
                        this.allLabelList = [];
                        let labelsChecked = labels ? JSON.parse(labels).id : [];
                        // 获取所有会员标签
                        tagMoContactApiV1del
                            .getGroups({
                                sortType: this.sortType
                            })
                            .then((res) => {
                                this.groupList = res.body.data.rootGroup.childs;
                                // 将选中的会员标签回显
                                if (labelsChecked.length > 0) {
                                    this.groupList.filter(item => {
                                        if (item.labels.length > 0) {
                                            this.allLabelList = this.allLabelList.concat(item.labels);
                                        }
                                        item.childs.filter(label => {
                                            if (label.labels.length > 0) {
                                                this.allLabelList = this.allLabelList.concat(label.labels);
                                            }
                                            label.childs.filter(name => {
                                                if (name.labels.length > 0) {
                                                    this.allLabelList = this.allLabelList.concat(name.labels);
                                                }
                                            });
                                        });
                                    });
                                    this.allLabelList.map(item => {
                                        labelsChecked.map(contact => {
                                            if (item.id === parseInt(contact)) {
                                                this.checkedVipItem = this.checkedVipItem.concat(item);
                                            }
                                        });
                                    });
                                    if (this.checkedVipItem.length !== labelsChecked.length) {
                                        logError(`[元数据-分值评估-评估定义]<evaluation-definition.vue> getEvaluation 不能识别的会员标签ID ${labelsChecked} :521`);
                                    }
                                    this.checkedVipItem.filter(item => {
                                        this.keyword.push(item.name);
                                    });
                                }
                            });
                        // 是否可以删除，如果已经被引用了，则不能删除
                        WebServGradeApiV1
                            .deleteEDRelation(this.scoreId)
                            .then(({body: {data: {evaluates, count}}}) => {
                                this.unDeletableTip = count > 0
                                    ? this.$t('metaData.assessLinkedLabel') + evaluates.join(',') + this.$t('metaData.usedAssessDefined')
                                    : '';
                            });
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            //为 Calculates 增加 order 值，从 1 开始
            addCalculatesOrder(){
                this.calculates.forEach((item,index) =>{
                    item.order = index + 1;
                });
            },
            getBeiJingTime(){
                //获取当地时间
                let localTime = new Date();
                //格林威治时间-当地时间的分钟数
                let offsetMinute = localTime.getTimezoneOffset();
                //判断当地时间是否是北京时间
                if (offsetMinute === -480){
                    localTime = new Date();
                } else {
                    localTime = new Date(localTime.getTime()  + offsetMinute  * 60 * 1000 + 8 * 60 * 60 * 1000);
                }

                function dateFormat(date, fmt) {
                    let o = {
                        'M+': date.getMonth() + 1, //月份
                        'd+': date.getDate(), //日
                        'h+': date.getHours(), //小时
                        'm+': date.getMinutes(), //分
                        's+': date.getSeconds(), //秒
                        'q+': Math.floor((date.getMonth() + 3) / 3), //季度
                        'S': date.getMilliseconds() //毫秒
                    };
                    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
                    for (let k in o)
                        if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
                    return fmt;
                }
                return dateFormat(localTime,'yyyy-MM-dd hh:mm:ss');
            },
            // 组装保存或编辑需要send的数据
            checkSendObj() {
                let targets = this.scoreObject.targets.join(',');
                let executeTime = this.runTime.replace(':','');
                let labels1 = [];
                labels1 = this.idArray.join(',');
                this.addCalculatesOrder();
                let obj = {
                    evaluates: this.calculates
                };
                let calculates = [{
                    id: null,
                    calcId: this.ruleId,
                    calcName: this.ruleName,
                    rules: JSON.stringify(obj)
                }];
                if (this.rankDisplay){
                    this.showTime = this.getBeiJingTime();
                } else {
                    this.showTime = '';
                }
                return {
                    name: this.scoreObject.name,
                    targets: targets,
                    labels: labels1,
                    desc: this.scoreObject.desc,
                    //realTimeData: this.scoreObject.realTimeData,
                    enable: this.scoreObject.enable,
                    //lastUpdateTime: this.scoreObject.lastUpdateTime,
                    //status: this.scoreObject.status,
                    calculates: calculates,
                    executeTime:executeTime,
                    show:this.rankDisplay,
                    showTime:this.showTime
                };
            },

            // 新增保存
            addSave: debounce(function () {
                this.$loading();
                let targets = this.scoreObject.targets.join(',');
                let labels1 = {};
                labels1.id = this.idArray;
                labels1.name = this.keyword;
                this.addCalculatesOrder();
                let obj = {
                    evaluates: this.calculates
                };
                let calculates = [{
                    id: null,
                    calcId: this.ruleId,
                    calcName: this.ruleName,
                    rules: JSON.stringify(obj)
                }];
                if (this.rankDisplay){
                    this.showTime = this.getBeiJingTime();
                } else {
                    this.showTime = '';
                }
                let executeTime = this.runTime.replace(':','');
                let sendObj = {
                    name: this.scoreObject.name,
                    targets: targets,
                    labels:  JSON.stringify(labels1),
                    desc: this.scoreObject.desc,
                    //realTimeData: this.scoreObject.realTimeData,
                    enable: this.scoreObject.enable,
                    //lastUpdateTime: this.scoreObject.lastUpdateTime,
                    // status: this.scoreObject.status,
                    calculates: calculates,
                    executeTime:executeTime,
                    show:this.rankDisplay,
                    showTime:this.showTime
                };
                WebServGradeApiV1
                    .createEvaluationDefinition(sendObj)
                    .then(({body: {data}}) => {
                        this.$loaded();
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                        trackEvent('数据中心-元数据-新建评估定义', {name: sendObj.name});
                        this.$emit('success', data);
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            }, 300),

            // 编辑保存
            updateSave() {
                this.$loading();
                let labels1 = {};
                labels1.id = this.idArray;
                labels1.name = this.keyword;
                let sendObj = this.checkSendObj();
                sendObj.id = this.scoreId;
                sendObj.labels = JSON.stringify(labels1);
                WebServGradeApiV1
                    .updateEvaluationDefinition(sendObj)
                    .then(({body: {data}}) => {
                        this.$loaded();
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                        trackEvent('数据中心-元数据-修改评估定义', {id: sendObj.id});
                        this.$emit('success', data);
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            // 保存前的校验
            check() {
                let flag = true;
                this.errorName = '';
                this.errorRule = '';
                this.errorRunTime = '';
                this.errorText = [];
                this.errorResult = [];
                this.errorSection0 = [];
                this.errorSection1 = [];
                this.calculates.forEach(() => {
                    this.errorText.push('');
                    this.errorResult.push('');
                    this.errorSection0.push('');
                    this.errorSection1.push('');
                });
                // 分值定义名称不能为空
                if (this.scoreObject.name === '') {
                    this.errorName = this.$t('metaData.assessDefinedCannotEmpty');
                    return false;
                }
                if (!COMMON_NAME_REGEXP.test(this.scoreObject.name)) {
                    this.errorName = this.$t('metaData.assessDefinedName') + ' ' + this.$t('common.nameSpecial');
                    return false;
                }
                if (this.ruleId === '') {
                    this.errorRule = this.$t('metaData.assessDefinedErrorRule');
                    return false;
                }
                // 运行计划不能为空
                if (this.runTime === '') {
                    this.errorRunTime = this.$t('metaData.runTimeCannotEmpty');
                    return false;
                }
                this.calculates.forEach(() => {
                    this.errorText.push('');
                    this.errorResult.push('');
                    this.errorSection0.push('');
                    this.errorSection1.push('');
                });
                //判断前两行不能为
                this.calculates.forEach((item, index) => {

                    /*if (item.showDef.content === '') {
                        this.errorText[index] = this.$t('metaData.showDefErrorText');
                        return flag = false;
                    }*/

                    // if (item.showDef.showName === '') {
                    // this.$toast('评估定义第' + (index + 1) + '项的显示为不能为空');
                    // return flag = false
                    // }
                    //区间判断4项，不是区间判断一项
                    if (
                        item.showDef.scoreCondition.function !== 'notBetween'
                        && item.showDef.scoreCondition.function !== 'between'
                    ) {
                        //不是
                        if (item.showDef.scoreCondition.params[0] === ''
                            || item.showDef.scoreCondition.params[0] === 'undefined'
                            || item.showDef.scoreCondition.params[0] === undefined) {
                            this.errorResult[index] = this.$t('metaData.showDefErrorResult');
                            // TODO: unclean codes
                            // eslint-disable-next-line
                            return flag = false;
                        }

                    } else {
                        //区间，【12,34】
                        if (item.showDef.scoreCondition.params[0] === ''
                            || item.showDef.scoreCondition.params[0] === 'undefined'
                            || item.showDef.scoreCondition.params[0] === undefined) {
                            this.errorSection0[index] = this.$t('showDefErrorText');
                            // TODO: unclean codes
                            // eslint-disable-next-line
                            return flag = false;
                        }
                        if (item.showDef.scoreCondition.params[1] === ''
                            || item.showDef.scoreCondition.params[1] === 'undefined'
                            || item.showDef.scoreCondition.params[1] === undefined) {
                            this.errorSection1[index] = this.$t('showDefErrorText');
                            // TODO: unclean codes
                            // eslint-disable-next-line
                            return flag = false;
                        }
                        // if (item.showDef.scoreCondition.paramsInterval[0] !== item.showDef.scoreCondition.paramsInterval[1]) {
                        // this.$toast('评估定义第' + (index + 1) + '项的分值计算结果区间符号前后两项不一致');
                        // return flag = false
                        // }

                    }
                });

                return flag;
            },

            // 保存分值定义
            save: debounce(function () {
                if (this.loading) return;
                if (!this.check()) return;
                this.isSave = true;
                this.calculates.forEach(item => {
                    item.showDef.content = item.showDef.showName;
                });
                this.$nextTick(() => {
                    //不用判断从哪个页面进去的，只判断筛选条件是否通过验证
                    let flag = true;
                    if (this.$refs.scorefilter) {
                        flag = this.$refs.scorefilter.every(sf => sf.valid());
                    }
                    if (!flag) return;
                    this.scoreId === '' ? this.addSave() : this.updateSave();
                });
            }, 300),

            //全局计算，调用接口，200 status变为0计算中，500出错status变为1已完成 ，若后台计算变成1已完成，最后更新日期。或0计算中，（用户在点击详情），
            globalCompute: debounce(function () {
                if (!this.scoreId) return;
                this.scoreObject.status = '0';//计算中
                this.$loading();
                WebServGradeApiV1
                    .globalCompute(this.scoreId)
                    .then(() => {
                        this.$toast(this.$t('metaData.golbalComputing'));
                        this.$loaded();
                    })
                    .catch(() => {
                        this.scoreObject.status = '1'; //已完成
                        this.$loaded();
                    });

            }, 300),
            // 删除评估定义
            delScoreConfirm() {
                this.$emit('delete',this.updateObj);
                /*this.$confirm(this.$t('common.delete'), this.$t('metaData.deleteLevelsConfirm'))
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            WebServGradeApiV1
                                .deleteEvaluationDefinition(this.scoreId)
                                .then(() => {
                                    //向父组件发送消息删除成功，将页面关闭
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    trackEvent('数据中心-元数据-删除评估定义', {id: this.scoreId});
                                    this.$emit('delete');
                                    this.$loaded();
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        }
                    });*/
            },
            // 还原
            cancel() {
                this.scoreObject = {
                    name: this.$t('metaData.score'),
                    targets: [0],
                    desc: '',
                    labels: [],
                    //realTimeData: false,
                    //计算方式：false实时计算 true数据预处理
                    enable: false,
                    lastUpdateTime: '',
                    //全局计算状态 1执行完成 0执行中
                    status: 1,
                    groups: [
                        {
                            groupName: this.$t('metaData.defaultGroup'),
                            isDefault: true,
                            scoreDefs: [
                                {
                                    id: 0,
                                    score: -2,
                                    itemShow: false,
                                    show: this.$t('metaData.age'),
                                    filter: {
                                        conditions: [],
                                        relation: 'and'
                                    },
                                }
                            ]
                        }
                    ]
                };
                this.$emit('cancel');
            },
            //复制
            copyCalculates(calculate, index, list) {
                //复制之前需判断评估定义不能为空
                // if (calculate.showDef.content === '' || calculate.showDef.showName === '') {
                // this.$toast('执行复制操作时百分比和显示为不能为空');
                // return;
                // }
                //复制一个新对象通过score
                let newCalculate = cloneDeep(calculate);
                list.splice((index + 1), 0, newCalculate);
                this.errorText = [];
                this.errorResult = [];
                this.errorSection0 = [];
                this.errorSection1 = [];
                list.forEach(() => {
                    this.errorText.push('');
                    this.errorResult.push('');
                    this.errorSection0.push('');
                    this.errorSection1.push('');
                });
            },

            //上移下移
            changeSort(index,list,flag){
                if (flag === 'up'){
                    if (index !== 0){
                        let temp = cloneDeep(list[index - 1]);
                        list.splice((index - 1), 1, list[index]);
                        list.splice(index, 1, temp);

                    }
                } else if (flag === 'down'){
                    if (index !== (list.length - 1)){
                        let temp = cloneDeep(list[index + 1]);
                        list.splice((index + 1), 1, list[index]);
                        list.splice(index, 1, temp);
                    }
                }
            },
        },
        components: {
            timePicker,
            ScoreFilter,
            'selector-tree': Tree
        },
        filters: {
            changeDate(val) {
                if (val === '' || val === null) return;
                return format(val, 'YYYY-MM-DD HH:mm:ss');
            }
        }
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    $margin-left: 45px;
    .evaluation-definition {
        //计算方式
        .compute-div {
            display: inline-block;
            .compute-tip {
                font-weight: 700;
                padding-left: 10px;
            }
        }
        .notation-icon{
            display: inline-block;
            width: 18px;
            height: 18px;
            position: relative;
            top: 3px;
            left: 5px;
        }
        .e-content-condition {
            .e-content-description{
                padding: 0 16px 10px;
                margin: 10px 0;
                border-bottom: 1px solid $border-color;
            }
            .evaluation-item {
                margin-bottom: 18px;
                position: relative;
                .evaluation-item-content {
                    position: relative;
                    @include transition();
                    .selector {
                        min-width: 50px;
                        margin-right: 10px;
                    }
                    .score-result {
                        margin-bottom: 10px;
                        margin-left: $margin-left;
                        .rule-text {
                            display: inline-block;
                            height: 32px;
                            line-height: 32px;
                        }
                        .between-box {
                            display: inline-block;
                            margin-top: 10px;
                            .selector {
                                width: 80px;
                                min-width: 80px;
                                margin-left: 5px;
                            }
                            .input {
                                margin-right: 3px;
                                width: 50px;
                            }
                        }
                        .ratingLevel{
                            width: 312px;
                        }
                    }
                }
                @at-root .score-item-content {
                    &:hover {
                        background-color: $title-bg;
                    }

                    .add-ops-item {
                        color: $light-green;
                        cursor: pointer;
                        margin: 5px 0 8px $margin-left;
                        padding: 0;
                    }
                }
            }

        }
    }

</style>
