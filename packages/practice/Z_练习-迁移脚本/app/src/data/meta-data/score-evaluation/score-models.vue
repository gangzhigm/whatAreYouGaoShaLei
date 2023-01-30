<template>
    <div class="score-evaluation slide-form">
        <div class="form-title" v-if="!disableButton">
            <span class="icon-right icon"></span>
            {{scoreId === '' ? $t('metaData.add') : $t('metaData.edit')}}{{'metaData.calculateDefineTitle' | t}}
        </div>
        <div class="form-title" v-else>
            <span class="icon-right icon"></span>
            {{$t('metaData.view')}}{{'metaData.calculateDefineTitle' | t}}
        </div>
        <div class="form-content">
            <div class="form-field">
                <label class="label" for="name">{{'metaData.assessName' | t}}</label>
                <input type="text" class="input" id="name" v-model.trim="calculate.name" :placeholder="$t('metaData.calculateDefinedName')"
                       maxlength="255"  :disabled="disableButton"
                       @focus="errorName=''"
                       v-title:top.line.warn="errorName" :class="{error: errorName}">
            </div>
            <!--<div class="form-field">
                <label class="label">{{'metaData.subject' | t}}</label>
                <checkbox v-model="targets" :source="0">{{'metaData.assessUser' | t}}</checkbox>
                &lt;!&ndash;<checkbox  v-model="targets" :source="1"></checkbox>物品&ndash;&gt;
                &lt;!&ndash;<checkbox  v-model="targets" :source="2"></checkbox>事件&ndash;&gt;
            </div>
            <div class="form-field">
                <label class="label">{{'metaData.label' | t}}</label>
                <selector-tree :options='groupList' @checkOptions='checked($event)' v-model='checkedVipItem'>
                </selector-tree>
            </div>-->
            <div class="form-field">
                <label class="label" for="remark">{{'metaData.explain' | t}}</label>
                <textarea id="remark" class="textarea" :disabled="disableButton" v-model.trim="calculate.desc" :placeholder="$t('metaData.calculateDefinedExplain')"
                          maxlength="255"></textarea>
            </div>
            <div class="e-content-condition">
                <h4>
                    {{'metaData.defineModelFactor' | t}}
                    <div class="oper-btn arrow-down"
                         @click="defaultShow = !defaultShow"
                         :style="defaultShow?'transform:rotate(180deg)':'transform:rotate(0deg)'">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-arrow-down"></use>
                        </svg>
                    </div>
                </h4>

                <div class="e-content-description">
                    <p> {{'metaData.fullMarks' | t}}：{{fullMarks}}  {{'metaData.points' | t}} ({{'metaData.fullMarksDescription' | t}})</p>
                </div>

                <!--first-->
                <div class="event-filter-group" v-for="(grade,index) in calculate.grades">
                    <div class="score-item-title">
                        <div class="tag">
                            {{'metaData.scoreFactor' | t}}{{index + 1}}
                        </div>
                        <div class="handle-btn">
                            <svg aria-hidden="true" class="oper-btn close" @click="delScoreDef(grade,index)"
                                 v-show="!disableButton"
                                 v-if="calculate.grades.length > 1">
                                <use xlink:href="#icon-round-close"></use>
                            </svg>
                            <div class="oper-btn arrow-down"
                                 :style="grade.scoreShow?'transform:rotate(180deg)':'transform:rotate(0deg)'"
                                 @click="changeDefaultShow(grade)">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-arrow-down"></use>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="event-filter-group-head">

                        <span class="event-filter-item">{{'metaData.scoreFactor' | t}}</span>

                        <selector type="select" search :options="scoreDefOptions" class="max-length-15 lg" :disabled="disableButton"
                                  v-model="grade.gradeId" @select="changeScore(grade)"></selector>
                        <!--得分范围-->
                        <span>
                               {{'metaData.scoringRange' | t}}
                            (<span v-text="getMinMaxValue(grade,'min')"></span> ~ <span v-text="getMinMaxValue(grade,'max')"></span>)
                            <!--(
                                {{grade.gradeItems === '' ? 0 : grade.gradeItems.split(',').length}}

                                /
                                {{scoreDefOptions.$getByKey(grade.gradeId) != null && scoreDefOptions.$getByKey(grade.gradeId).groups != null ? scoreDefOptions.$getByKey(grade.gradeId).groups[0].scoreDefs.length : '' }}
                                )-->
                            </span>
                    </div>

                    <div class="event-filter-group-head">
                        <span class="event-filter-item">{{'metaData.enableScoringRules' | t}}</span>
                        <p class="event-filter-p">
                            {{'metaData.enableRulesDescription' | t}}
                        </p>
                    </div>
                    <transition name="fade" mode="out-in">
                        <div class='event-filter-group-content' v-if="grade.scoreShow">

                            <div class="score-item-check">
                                <!--all checked-->
                                <checkbox class='check' :value="getAllCheck(grade)" @input="setAllCheck(grade)" :disabled="disableButton">{{'common.allSelected' | t}}
                                </checkbox>
                                <span class="selected-list-title">{{'metaData.choosed' | t}}</span>
                                <ul class="check-item">
                                    <!--<li v-if="grade.gradeItems !== ''"
                                        v-for="(scoreItem,idx) in grade.gradeItems.split(',')">
                                        {{scoreDefOptions.$getByKey(grade.gradeId).groups[0].scoreDefs
                                        .find(item => Number(scoreItem) === Number(item.id)).show}}
                                        <span v-if="idx !== grade.gradeItems.split(',').length - 1">,</span>
                                    </li>-->
                                    <li v-if="grade.gradeItems !== ''">
                                        {{grade.gradeItems.split(',').length}}
                                    </li>
                                    <li v-else>
                                        {{'metaData.unSelect' | t}}
                                    </li>
                                </ul>

                                <checkbox class='check hide-unchecked' v-model="grade.hideUncheck" :disabled="disableButton">{{'metaData.hideUnselected' | t}}
                                </checkbox>
                            </div>

                            <!--two-->
                            <template
                                    v-if="scoreDefOptions.$getByKey(grade.gradeId) && scoreDefOptions.$getByKey(grade.gradeId).groups">
                                <div class="score-item"
                                     v-for="(scoreItem,ind) in scoreDefOptions.$getByKey(grade.gradeId).groups[0].scoreDefs">
<!--                                    隐藏单个-->
                                    <!--<button class="icon icon-arrow-down"
                                    :style="scoreItem.itemShow?'transform:rotate(180deg)':'transform:rotate(0deg)'"
                                    @click="scoreItem.itemShow = !scoreItem.itemShow"></button>-->
                                    <!--three-->
                                    <transition name="fade" mode="out-in">
                                        <div class="event-filter-group-middle"
                                             @click="toggleCheck(scoreItem.id,index)"
                                             :class="{'active icon icon-correct':grade.gradeItems.split(',').some(s => Number(s) === scoreItem.id)}"
                                             v-if="!grade.hideUncheck || grade.gradeItems.split(',').some(s => Number(s) === scoreItem.id)">
                                                <span class="event-filter-tip">
                                                    {{'metaData.scoreSymbol' | t}}{{scoreItem.score}}
                                                    <!--分值和显示为一致时，不显示显示为-->
                                                    <template v-if="scoreItem.score != scoreItem.show">
                                                        {{'metaData.displayOf' | t}}{{scoreItem.show}}
                                                    </template>
                                                </span>
                                            <div class="score-item-content">
                                                <div class="cover"></div>
                                                <score-filter :groups="scoreGroupSelect"
                                                              :filter="scoreItem.filter"
                                                              :eventIdList="[0]"/>
                                            </div>
                                        </div>
                                    </transition>
                                    <!--three-->
                                </div>
                                <!--two-->
                            </template>
                            <!---->
                        </div>
                    </transition>
                </div>
                <button class="btn btn-sm btn-theme add-score" type="button" v-show="!disableButton"
                        @click="addGrade">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'metaData.addFactor' | t}}
                </button>
            </div>
        </div>
        <div class="e-save-box">
            <button type="button" class="btn btn-md btn-red pull-left" v-if="scoreId" @click="delScoreConfirm"
                     :disabled="disableButton">{{'metaData.delete' | t}}
            </button>
            <button type="button" class="btn btn-md btn-theme-border" @click="cancel" :disabled="disableButton">{{'common.cancel' | t}}</button>
            <button type="button" class="btn btn-md btn-theme" @click="save" :disabled="storeLoading || disableButton">{{'common.save' | t}}
            </button>
        </div>
    </div>
</template>
<script>
    import { ContactApiV1, WebServGradeApiV1 } from '@/api';
    import ScoreFilter from './filter/score-query-filter.vue';
    import difference from 'lodash/difference';
    import uniq from 'lodash/uniq';
    import {COMMON_NAME_REGEXP} from '@/common/utils/regs';
    import Tree from '../../../common/components/selector-tree.vue';
    import {logError,trackEvent} from '@/monitor';
    import { mapState } from 'vuex';
    export default {
        props: {
            //编辑对象
            updateObj: '',
            //条件的第一个选项
            scoreGroupSelect: {
                type: Array
            },
            disableButton: false,
        },
        data() {
            return {
                //标签列表
                labelList: [],
                scoreId: '',
                //所有集合
                computDefList: [],
                // 如果已经被引用了，则不能删除，这里是不能删除时候的提示
                unDeletableTip: '',
                //计算定义
                calculate: {
                    desc: '',
                    grades: [],
                    labels: [],
                    name: '',
                    targets: '0'
                },
                //选则的主体
                targets: [],
                // 用户属性
                userAttrList: [],
                // 用户分群
                userGroupAttrList: [],
                // 全部分值定义和部门分值定义
                AllScoreDefOptions: [],
                // 书签
                isShowLabelList: false,
                //全部展开/全部隐藏
                defaultShow: true,
                errorName: '',
                loading: false,
                checkedVipItem: [],
                groupList: [],
                keyword: [],
                idArray: [],
                allLabelList: [],
                sortType:1,

                hideUnchecked:false,
            };
        },
        computed: {
            ...mapState({
                storeLoading: state => state.loading
            }),
            //分值定义
            scoreDefOptions() {
                //全部分值列表
                //查找已经选中的分值列表
                this.calculate.grades.forEach(grade => {
                    //添加是否可选
                    this.AllScoreDefOptions.forEach(item => {
                        if (grade.gradeId === item.id) {
                            this.$set(item, 'disabled', true);
                        }
                    });

                });
                return this.AllScoreDefOptions;
            },
            fullMarks(){
                let sum = 0;
                this.calculate.grades.forEach((grade) =>{
                    //收集每个打分因子已选中的分数，放在此数组里
                    let gradeValueBox = [];
                    grade.gradeItems.split(',').forEach((scoreItem) =>{
                        if (this.scoreDefOptions.$getByKey(grade.gradeId)){
                            let valueItem = this.scoreDefOptions.$getByKey(grade.gradeId).groups[0].scoreDefs
                                .find(item => Number(scoreItem) === Number(item.id));
                            if (valueItem && valueItem.score){
                                gradeValueBox.push(parseInt(valueItem.score));
                            }
                        }
                    });

                    if (gradeValueBox.length > 0){
                        sum += Math.max(...gradeValueBox);
                    }
                });
                return sum;
            },
        },
        watch: {
            //监听主体变化，根据主体变化查找分值计算规则
            'calculate.targets'(curVal) {
                if (curVal) {
                    //查找主体为curVal的分值列表
                    this.getScoreDefOpt(curVal.toString());

                } else {
                    //默认查找主体为0的分值列表
                    this.getScoreDefOpt(0);
                }

            },
            //折叠/全部展开
            defaultShow(newValue) {
                // 展开/关闭
                this.calculate.grades.forEach(grade => {
                    grade.scoreShow = newValue;
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
        async mounted() {
            // 不为空为编辑，为空的话是新增
            if (this.updateObj.id !== '') {
                this.scoreId = this.updateObj.id;
                this.getComputDefinition(this.scoreId);
            } else {
                this.scoreId = '';
                this.targets = [0];
                //新增时调用一下标签列表
                this.getVipLabel();
                //新增时，清空编辑时或许存下的数据
                this.clearObj();
            }

            // 得到默认主体为用户的分值定义
            // 20200616 去除了主体字段
            await this.getScoreDefOpt(0);
            if (this.calculate.grades.length === 0) {
                this.addGrade();
            }
        },
        methods: {
            //获取满分值

            //计算最大最小分值
            getMinMaxValue(grade,type){
                let gradeValueBox = [];
                //收集每个打分因子已选中的分数，放在此数组里
                grade.gradeItems.split(',').forEach((scoreItem) =>{
                    if (this.scoreDefOptions.$getByKey(grade.gradeId)){
                        let valueItem = this.scoreDefOptions.$getByKey(grade.gradeId).groups[0].scoreDefs
                            .find(item => Number(scoreItem) === Number(item.id));
                        if (valueItem && valueItem.score){
                            gradeValueBox.push(parseInt(valueItem.score));
                        }
                    }
                });
                if (type === 'min'){
                    if (gradeValueBox.length > 0){
                        return Math.min(...gradeValueBox);
                    }
                    return 0;
                }
                if (type === 'max'){
                    if (gradeValueBox.length > 0){
                        return Math.max(...gradeValueBox);
                    }
                    return 0;
                }

                /*if (this.scoreDefOptions.$getByKey(grade.gradeId)){
                    this.scoreDefOptions.$getByKey(grade.gradeId).groups[0].scoreDefs.forEach(item =>{
                        gradeValueBox.push(item.score);
                    });
                }
                let minus = gradeValueBox.filter(item =>{ return item < 0 } );
                let plus = gradeValueBox.filter(item =>{ return item > 0 } );
                if (type === 'min'){
                    let sum = 0;
                    minus.forEach(item =>{
                        sum += item;
                    });
                    return sum;
                }
                if (type === 'max'){
                    let sum = 0;
                    plus.forEach(item =>{
                        sum += item;
                    });
                    return sum;
                }*/
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
                this.$set(item, 'scoreShow', !item.scoreShow);
                const scoreDefs = this.calculate.grades;
                let trueLen = scoreDefs.filter(list => list.scoreShow === true).length;
                let falseLen = scoreDefs.filter(list => list.scoreShow === false).length;
                if (trueLen === scoreDefs.length) {
                    this.defaultShow = true;
                } else if (falseLen === scoreDefs.length) {
                    this.defaultShow = false;
                }
            },
            toggleCheck(id, index) {
                if (this.disableButton){
                    return;
                }
                let gradeItems = this.calculate.grades[index].gradeItems;
                let arr = gradeItems.split(',').filter(list => list !== '');
                let idx = arr.indexOf(String(id));
                if (idx > -1) {
                    arr.splice(idx, 1);
                } else {
                    arr.push(id);
                }
                this.$set(this.calculate.grades[index], 'gradeItems', arr.join(','));
            },
            valid() {
                this.errorName = '';
                let decide = true;
                if (this.calculate.name === '') {
                    this.errorName = this.$t('metaData.calculateDefinedNotEmpty');
                    decide = false;
                }
                if (!COMMON_NAME_REGEXP.test(this.calculate.name)) {
                    this.errorName = this.$t('metaData.calculateDefinedName') + ' ' + this.$t('common.nameSpecial');
                    decide = false;
                }
                return decide;
            },
            //得到计算详情
            getComputDefinition(id) {
                this.$loading();
                WebServGradeApiV1
                    .getComputDefinition(id)
                    .then(({body: {data: {calculate: {id, name, targets, desc, labels, grades}}}}) => {
                        this.$loaded();
                        let targets1 = targets.split(',');
                        //  主体
                        this.targets = targets1.map(item => Number(item));
                        this.calculate = {
                            id: id,
                            name: name,
                            targets: targets1.map(item => Number(item)),
                            desc: desc,
                            labels: labels,
                            grades: grades
                        };
                        //设置折叠 及 显示
                        this.calculate.grades.forEach(grade => {
                            this.$set(grade, 'scoreShow', this.defaultShow);
                            this.$set(grade, 'hideUncheck', false);
                        });
                        // 显示标签
                        this.checkedVipItem = [];
                        this.allLabelList = [];
                        let labelsChecked = labels ? JSON.parse(labels).id : [];
                        // 获取所有会员标签
                        ContactApiV1
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
                                        logError(`[元数据-分值评估-计算定义]<score-evaluation.vue> getComputDefinition 不能识别的会员标签ID ${labelsChecked} :521`);
                                    }
                                    this.checkedVipItem.filter(item => {
                                        this.keyword.push(item.name);
                                    });
                                }
                            });
                        // 是否可以删除，如果已经被引用了，则不能删除
                        WebServGradeApiV1
                            .deleteComputDefRelation(id)
                            .then(({body: {data: {evaluates, count}}}) => {
                                this.unDeletableTip = count > 0
                                    ? this.$t('metaData.assessDefinedSymbol') + evaluates.join(',') + this.$t('metaData.usedCalculateRuleCannotDelete')
                                    : '';
                            });
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            //根据主体得到分值定义列表选项
            getScoreDefOpt(targets) {
                return WebServGradeApiV1
                    .getScoreDefList({targets: targets,name:''})
                    .then(({body: {data: {grades}}}) => {
                        grades.forEach(grade => {
                            //可选不可选
                            this.$set(grade, 'disabled', false);
                            grade.groups[0].scoreDefs.forEach(scoreDef => {
                                scoreDef.filter = JSON.parse(scoreDef.filter);
                                //折叠
                                this.$set(scoreDef, 'itemShow', true);
                            });
                        });
                        this.AllScoreDefOptions = grades;
                    });
            },
            //删除分值定义
            delScoreDef(grade, index) {
                //根据index删除
                // let gradeArr = this.calculate.grades;
                this.calculate.grades.splice(index, 1);
                this.scoreDefOptions.forEach(item => {
                    if (item.id === grade.gradeId) {
                        this.$set(item, 'disabled', false);
                    }
                });
                this.getFullMarks();
            },
            // 删除计算定义
            delScoreConfirm() {
                this.$emit('delete',this.updateObj);
                /*this.$confirm(this.$t('metaData.deleteConfirm'), `${this.$t('metaData.sureDelete')} ${this.calculate.name} ${this.$t('metaData.deleteEndText')}`)
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            WebServGradeApiV1
                                .delComputDef(this.scoreId)
                                .then(() => {
                                    //向父组件发送消息删除成功，将页面关闭
                                    this.$emit('success');
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    trackEvent('数据中心-元数据-删除计算定义', {id: this.scoreId});
                                    this.$loaded();
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        }
                    });*/
            },
            //增加计算规则定义
            addGrade() {
                //全部分值,默认选中第一个分值定义的所有分值
                if (this.scoreDefOptions.length > 0 && this.scoreDefOptions[0].groups != null) {

                    //得到可选项的index
                    let index = -1;
                    index = this.scoreDefOptions.findIndex(item => item.disabled === false);
                    if (index === -1) {
                        this.$toast(this.$t('metaData.scoreDefOptionToast'), 'warn');
                        return;
                    }
                    //分值,选中第index项，并且将列表index项变为不可用
                    this.scoreDefOptions[index].disabled = true;

                    //全选 --0618 修改为默认不选中
                    let idArr = [];
                    /*let scoreArr = this.scoreDefOptions[index].groups[0].scoreDefs;
                    scoreArr.forEach(item => {
                        idArr.push(item.id);
                    });*/

                    //新增时默认选中第一项
                    this.calculate.grades.push({
                        gradeId: this.scoreDefOptions[index].id,
                        gradeItems: idArr.join(','),
                        gradeName: this.scoreDefOptions[index].name,
                        groupId: this.scoreDefOptions[index].groups[0].id,
                        scoreShow: this.defaultShow,
                        hideUncheck:false
                    });
                }
            },
            //分值定义切换时
            changeScore(grade) {
                //查找已经选中的分值列表
                this.scoreDefOptions.forEach(item => {
                    this.$set(item, 'disabled', false);
                });
                this.calculate.grades.forEach(m => {
                    //添加是否可选
                    this.scoreDefOptions.forEach(item => {
                        if (m.gradeId === item.id) {
                            this.$set(item, 'disabled', true);
                        }
                    });

                });
                //--0618 修改为默认不选中
                let idArr = [];
                /*let scoreArr = this.scoreDefOptions.$getByKey(grade.gradeId).groups[0].scoreDefs;
                scoreArr.forEach(item => {
                    idArr.push(item.id);
                });*/
                //名字和分值id
                grade.gradeName = this.scoreDefOptions.$getByKey(grade.gradeId).name;
                grade.gradeItems = idArr.join(',');
                grade.groupId = this.scoreDefOptions.$getByKey(grade.gradeId).groups[0].id;
                grade.scoreShow = this.defaultShow;
            },
            //新增
            addSave() {
                //标签名是否重复
                let repeatCheck = false;
                this.computDefList.forEach(item => {
                    if (item.name === this.calculate.name) {
                        repeatCheck = true;
                        this.$toast(this.$t('metaData.computeDefineNotRepet'), 'warn');
                    }
                });

                if (repeatCheck) return;
                let labels1 = {};
                labels1.id = this.idArray;
                labels1.name = this.keyword;
                this.$loading();
                WebServGradeApiV1
                    .createComputDef({
                        name: this.calculate.name,
                        labels: JSON.stringify(labels1),
                        targets: this.targets.join(),
                        grades: this.calculate.grades,
                        desc: this.calculate.desc,
                    })
                    .then((/*{body: {code, data: {calculate}}}*/) => {
                        this.$loaded();
                        this.$toast(this.$t('common.createSuccess'), 'success');
                        trackEvent('数据中心-元数据-新建计算定义', {name: this.calculate.name});
                        this.$emit('success');
                    })
                    .catch(() => {
                        this.$loaded();
                    });


            },
            updateSave() {
                this.$confirm(this.$t('metaData.notice'), `${this.$t('metaData.updateModelConfirm')}`)
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            let labels1 = {};
                            labels1.id = this.idArray;
                            labels1.name = this.keyword;
                            WebServGradeApiV1
                                .updateComputDef({
                                    id: this.calculate.id,
                                    name: this.calculate.name,
                                    labels: JSON.stringify(labels1),
                                    targets: this.targets.join(),
                                    grades: this.calculate.grades,
                                    desc: this.calculate.desc,
                                })
                                .then((/*{body: {code, data: {calculate}}}*/) => {
                                    this.$loaded();
                                    this.$toast(this.$t('common.saveSuccess'), 'success');
                                    trackEvent('数据中心-元数据-修改计算定义', {id: this.calculate.id});
                                    this.$emit('success');
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        }
                    });

            },
            // 保存前的校验
            check() {
                if (this.targets.length === 0) {
                    this.$toast(this.$t('metaData.unlessOneSubject'), 'warn');
                    return false;
                }
                // 不能全不选
                for (let i = 0; i < this.calculate.grades.length; i++) { 
                    if (this.calculate.grades[i].gradeItems === '') {
                        this.$toast(this.calculate.grades[i].gradeName + this.$t('metaData.calculateGradesToast'), 'warn');
                        return false;
                    }
                }
                return true;
            },
            //保存
            save() {
                if (this.storeLoading) return;
                if (!this.valid()) return;
                if (!this.check()) return;
                this.scoreId === '' ? this.addSave() : this.updateSave();
            },
            //全选或反选
            setAllCheck(grade) {
                const allIds = this.scoreDefOptions
                    .$getByKey(grade.gradeId).groups[0].scoreDefs
                    .map(item => item.id);
                const selectedIds = grade.gradeItems.split(',').filter(s => s.length)
                    .map(Number);
                const allChecked = difference(allIds, selectedIds).length === 0;
                grade.gradeItems = allChecked
                    ? difference(selectedIds, allIds).join(',')
                    : uniq(allIds, selectedIds).join(',');
            },
            getAllCheck(grade) {
                if (this.scoreDefOptions.$getByKey(grade.gradeId)) {
                    const allIds = this.scoreDefOptions
                        .$getByKey(grade.gradeId).groups[0].scoreDefs
                        .map(item => item.id);
                    const selectedIds = grade.gradeItems.split(',').filter(s => s.length)
                        .map(Number);
                    return difference(allIds, selectedIds).length === 0;
                }

            },
            // 改变过滤条件filterList
            // changeFilter(index, newFilter) {
            //     this.scoreObject.groups[0].scoreDefs[index].filter = newFilter;
            // },

            // 更新过滤条件filterList
            // updateFilter(index, newFilter) {
            //     this.scoreObject.groups[0].scoreDefs[index].filter = newFilter;
            // },
            //还原calculate
            clearObj() {
                if (this.scoreDefOptions.length > 0 && this.scoreDefOptions[0].groups != null) {
                    //全部可选
                    this.scoreDefOptions.forEach(item => {
                        this.$set(item, 'disabled', false);
                    });

                    //选中第一项    //--0618 修改为默认不选中
                    let idArr = [];
                    /*let scoreArr = this.scoreDefOptions[0].groups[0].scoreDefs;
                    scoreArr.forEach(item => {
                        idArr.push(item.id);
                    });*/
                    //选中第一项，并且变为不可用
                    this.scoreDefOptions[0].disabled = true;

                    this.calculate = {
                        desc: '',
                        grades: [
                            {
                                gradeId: this.scoreDefOptions[0].id,
                                gradeItems: idArr.join(','),
                                gradeName: this.scoreDefOptions[0].name,
                                groupId: this.scoreDefOptions[0].groups[0].id,
                                scoreShow: this.defaultShow,
                            }
                        ],
                        labels: [],
                        name: '',
                        targets: '0'
                    };
                }
            },
            // 还原
            cancel() {
                this.$emit('cancel');
            },
        },
        filters: {
            changeConditionType: function (value) {
                //fans 用户属性,event 用户分群
                let name = '';
                if (value === 'user') {
                    name = '用户属性';
                } else if (value === 'event') {
                    name = this.$t('metaData.userSwarm');
                } else {
                    name = this.$t('metaData.userAttr');
                }
                return name;
            },
        },
        components: {
            ScoreFilter,
            'selector-tree': Tree
        }
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    @import "../data-item.scss";

    $margin-left: 45px;
    .score-evaluation {
        .e-content-condition {
            .e-content-description{
                padding: 0 16px 10px;
                margin: 10px 0;
                border-bottom: 1px solid $border-color;
            }
            .event-filter-group {
                background: white;
                margin-bottom: 15px;
                position: relative;
                .event-filter-group-head {
                    position: relative;
                    margin-left: $margin-left;
                    margin-bottom: 8px;
                }
                .event-filter-item{
                    display: inline-block;
                    width: 100px;
                    text-align: left;
                }
                .event-filter-p{
                    display: inline-block;
                    width: calc(100% - 200px);
                    vertical-align: top;
                }
                .event-filter-group-content {
                    padding: 0 16px 0 $margin-left;
                    .score-item-check {
                        padding: 16px 0;
                        color: $color-light-content;
                        vertical-align: top;
                        .check {
                            margin-right: 25px;
                        }
                        .check-item {
                            color: $green;
                            display: inline-block;
                            max-width: 350px;
                            vertical-align: middle;
                            li {
                                display: inline-block;
                            }
                        }
                        .hide-unchecked{
                            float: right;
                        }
                        .selected-list-title{
                            display: inline-block;
                            vertical-align: top;
                        }
                    }
                    .score-item {
                        padding-bottom: 5px;
                        @at-root .event-filter-group-middle {
                            padding: 8px 16px;
                            margin-bottom: 6px;
                            border: 1px solid $border-color;
                            border-radius: 4px;
                            overflow: auto;
                            position: relative;
                            max-height: 300px;
                            background: $title-bg;
                            cursor: pointer;
                            &.active {
                                box-shadow: 0 0 0 1px $green;
                                border: 1px solid $green;
                                &:before, &:after {
                                    position: absolute;
                                    right: 0;
                                }
                                &:before {
                                    color: #fff;
                                    z-index: 1;
                                    top: 3px;
                                }
                                &:after {
                                    top: 0;
                                    content: '';
                                    display: block;
                                    width: 0;
                                    border: 16px solid transparent;
                                    border-top-color: $green;
                                    border-right-color: $green;
                                }
                            }

                            //  不知道干嘛的
                            .filter-group-relation {
                                width: 30px;
                                position: absolute;
                                top: 22px;
                                left: 5px;

                                .relation-topline {
                                    margin: 15px 0 0 20px;
                                    border-left: 1px solid $border-color;
                                    border-top: 1px solid $border-color;
                                    width: 100%;
                                    height: calc(50% - 30px);
                                }
                                button {
                                    width: 36px;
                                    height: 36px;
                                    background-color: $blue;
                                    color: white;
                                    border: none;
                                    border-radius: 3px;
                                    cursor: pointer;
                                }
                                .relation-bottomline {
                                    margin: 0 0 15px 20px;
                                    border-left: 1px solid $border-color;
                                    border-bottom: 1px solid $border-color;
                                    width: 100%;
                                    height: calc(50% - 30px);
                                }
                            }

                            .event-filter-item {
                                padding-top: 10px;
                                margin-left: 67px;
                            }

                            .score-item-content {
                                position: relative;
                                margin-left: -$margin-left;
                                .selector.lg {
                                    min-width: 60px;
                                }
                                .cover {
                                    background: transparent;
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    z-index: $index-container;
                                    width: 99%;
                                    height: 100%;
                                }

                            }
                        }
                    }
                }
            }
        }
    }
</style>
