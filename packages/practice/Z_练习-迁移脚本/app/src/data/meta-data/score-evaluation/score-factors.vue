<template>
    <div class="score-definition slide-form">
        <div class="form-title">
            <span class="icon-right icon"></span>
            {{scoreId === '' ? $t('metaData.addScoreFactor') : $t('metaData.editScoreFactor')}}
        </div>
        <div class="form-content">
            <div class="form-field">
                <label class="label" for="name">{{'metaData.assessName' | t}}</label>
                <input type="text" class="input" id="name" v-model.trim="scoreObject.name" maxlength="30"
                       @focus="errorName=''"
                       :placeholder="$t('metaData.scoreFactorName')" v-title:top.line.warn="errorName"
                       :class="{error: errorName}">
            </div>
            <!--<div class="form-field">
                <label class="label">{{'metaData.subject' | t}}</label>
                <checkbox v-if="false" :source="false" v-model="allChecked"></checkbox>
                <checkbox :source="0" v-model="scoreObject.targets" disabled>{{'metaData.assessUser' | t}}</checkbox>
                <checkbox v-if="false" :source="1" v-model="scoreObject.targets"></checkbox>
                <checkbox v-if="false" :source="2" v-model="scoreObject.targets"></checkbox>
            </div>-->
            <!--<div class="form-field">
                <label class="label">{{'metaData.label' | t}}</label>
                <selector-tree :options='groupList' @checkOptions='checked($event)' v-model='checkedVipItem'/>
            </div>-->
            <div class="form-field">
                <label class="label" for="remark">{{'metaData.explain' | t}}</label>
                <textarea v-model.trim="scoreObject.desc" class="textarea" id="remark" maxlength="255"
                          :placeholder="$t('metaData.scoreFactorExplain')"></textarea>
            </div>

            <div class="e-content-condition" v-for="item in scoreObject.groups">
                <h4>
                    {{'metaData.assessDefined' | t}}
                    <div class="oper-btn arrow-down"
                         @click="defaultShow = !defaultShow"
                         :style="defaultShow?'transform:rotate(180deg)':'transform:rotate(0deg)'">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-arrow-down"></use>
                        </svg>
                    </div>
                </h4>

                <div class="e-content-description">
                    {{'metaData.assessDefineDescription' | t}}
                </div>
                <!--可拖拽 start-->
<!--                <draggable v-model="item.scoreDefs" class="draggable" >-->

                    <div class="score-item" v-for="(score,index) in item.scoreDefs">
                        <div class="score-item-title">
                            <div class="tag">
                                {{'metaData.scoringRules' | t}}{{index + 1}}
                            </div>
                            <div class="handle-btn">
                                <div class="oper-btn arrow-down"
                                     :style="score.itemShow?'transform:rotate(180deg)':'transform:rotate(0deg)'"
                                     @click="changeDefaultShow(score)">
                                    <svg aria-hidden="true">
                                        <use xlink:href="#icon-arrow-down"></use>
                                    </svg>
                                </div>
                                <div class="oper-btn copy" @click="copyScore(index,item.scoreDefs)">
                                    <!--复制 start-->
                                    <svg aria-hidden="true">
                                        <use xlink:href="#icon-copy"></use>
                                    </svg>
                                </div>

                                <!--上移下移-->
                                <div class="oper-btn copy" @click="changeScoreSort(index,item.scoreDefs,'down')">
                                    <!--复制 start-->
                                    <svg aria-hidden="true">
                                        <use xlink:href="#icon-xiayi"></use>
                                    </svg>
                                </div>
                                <div class="oper-btn copy" @click="changeScoreSort(index,item.scoreDefs,'up')">
                                    <!--复制 start-->
                                    <svg aria-hidden="true">
                                        <use xlink:href="#icon-shangyi"></use>
                                    </svg>
                                </div>

                                <!--复制 start-->
                                <svg aria-hidden="true" class="oper-btn close"
                                     @click="deleteScore(score,item.scoreDefs,index)"
                                     v-if="scoreObject.groups[0].scoreDefs.length > 1">
                                    <use xlink:href="#icon-round-close"></use>
                                </svg>
                                <transition name="fade">
                                    <div class="gradeItem-delete" v-if="score.itemDel">
                                        <div class="delete-content">
                                            <p>{{delItemTip}}{{'metaData.defineUsedConfirmDelete' | t}}</p>
                                        </div>
                                        <div class="delete-box">
                                            <button class="cancel-btn"
                                                    @click.stop="score.itemDel = false">
                                                {{'common.cancel' | t}}
                                            </button>
                                            <button class="confirm-btn"
                                                    @click="deleteConfirm(score,item.scoreDefs,index)">
                                                {{'metaData.delete' | t}}
                                            </button>
                                        </div>
                                    </div>
                                </transition>
                            </div>
                        </div>
                        <div class="score-item-header">
                            <span>{{'metaData.get' | t}}</span>
                            <!----><!--<input type="text" class="input" maxlength="12" v-model.trim="score.score"
                                   @keyup="changeShowName(score)" @change="changeShowName(score)"
                                   v-title:top.line.warn="errorScores[index]" :class="{error: errorScores[index]}">-->

                            <!--<span>{{'metaData.displayOf' | t}}</span>
                            <input type="text" class="input" maxlength="30" v-model.trim="score.show"
                                   @change="changeShow(score)">-->

                            <number-input :precision="4"
                                          type="int" class="input" maxlength="12" @change="changeShowName(score)"
                                          v-model.trim="score.score"
                                          v-title:top.line.warn="errorScores[index]"
                                          :class="{error: errorScores[index]}"/>
                            <span>{{'metaData.point' | t}}</span>
                            <!--区间和不在区间-->
                        </div>
                        <div class="score-item-header">
                            <span>{{'metaData.scoringCondition' | t}}</span>
                        </div>
                        <transition name="fade" mode="out-in">
                            <div class="score-item-content" v-if="score.itemShow">
                                <score-filter ref="scorefilter" :groups="scoreGroupSelect" required
                                              :filter="score.filter" :isSave="isSave"
                                              @change="changeFilter(index,$event)"
                                              :eventIdList="[0]"
                                              @update="updateFilter(index,$event)"/>
                                <button type="button" class="btn btn-sm add-ops-item" @click="createFilter(score)">
                                    <svg aria-hidden="true">
                                        <use xlink:href="#icon-plus"></use>
                                    </svg>
                                    {{'metaData.filterCondition' | t}}
                                </button>
                            </div>
                        </transition>
                    </div>

<!--                </draggable>-->
                <!--可拖拽 end-->
                <button class="btn btn-sm btn-theme add-score" @click="additionScore(item.scoreDefs)">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'metaData.scoringRules' | t}}
                </button>
            </div>
        </div>
        <div class="e-save-box">
            <button v-if="scoreId" class="btn btn-md btn-red pull-left" @click="delScoreConfirm" type="button"
                    >{{'metaData.delete' | t}}
            </button>
            <button type="button" class="btn btn-md btn-theme-border" @click="cancel">{{'common.cancel' | t}}</button>
            <button type="button" class="btn btn-md btn-theme" @click="save" :disabled="loading">
                {{'common.save' | t}}
            </button>
        </div>
    </div>
</template>
<script>
    import { ContactApiV1, WebServGradeApiV1 } from '@/api';
    import ScoreFilter from './filter/score-query-filter.vue';
    import debounce from 'lodash/debounce';
    import cloneDeep from 'lodash/cloneDeep';
    import {COMMON_NAME_REGEXP} from '@/common/utils/regs';
    import SelectorTree from '../../../common/components/selector-tree.vue';
    import {logError, trackEvent} from '@/monitor';
    import { mapState } from 'vuex';

    //判断不是合法的数字类型返回''，数字类型或小数。小数位数小于4位不处理，大于4位四舍五入
    function formatScore(score) {
        let str = score;
        if (score && score !== '-') {
            if (isNaN(score)) {
                //不是数字类型
                str = '';
            } else {
                //数字类型或小数。小数位数小于4位不处理，大于4位四舍五入
                //正则：只能为数字,分正负数,如果有小数位,最多只能是4位小数
                let g = /^[+-]?\d+(?:\.\d{0,4})?$/;
                if (!g.test(score)) {
                    //不符合四位小数如1.23456四舍五入1.2346
                    str = Number(score)
                        .toFixed(4);
                }
            }

        }
        return str;
    }

    export default {
        props: {
            updateObj: '',
            scoreGroupSelect: {
                type: Array
            }
        },
        computed: {
            ...mapState(['loading'])
        },
        data() {
            return {
                scoreId: '',
                scoreObject: {
                    name: '',
                    targets: [0],
                    desc: '',
                    labels: [],
                    groups: [
                        {
                            groupName: this.$t('metaData.assessDefined'),
                            isDefault: true,
                            scoreDefs: [
                                // {
                                // id: 0,
                                // score: '',
                                // itemShow: true,
                                // show: '',
                                // //显示为是否改变
                                // isChangeName:false,
                                // filter: {
                                // conditions: [],
                                // relation: 'and'
                                // },
                                // }
                            ]
                        }
                    ]
                },
                allChecked: '',
                defaultShow: true,
                // 用户属性
                userAttrList: [],
                // 用户分群
                userGroupAttrList: [],
                // 书签
                labels: [],
                labelList: null,
                //和删除分值项相关
                delItemTip: '',
                delItemId: '',
                // 如果已经被引用了，则不能删除，这里是不能删除时候的提示
                unDeletableTip: '',
                errorName: '',
                errorScores: [],
                isSave: false,
                checkedVipItem: [],
                groupList: [],
                keyword: [],
                idArray: [],
                allLabelList: [],
                sortType:1,
            };
        },
        mounted() {
            // 不为空为编辑，为空的话是新增
            if (this.updateObj.id !== '') {
                this.scoreId = this.updateObj.id;
                if (this.updateObj.buttonName !== 'scoreFactors') {
                    return;
                }
                this.getScoreDetail(this.scoreId);
            } else {
                this.scoreId = '';
                this.scoreObject = {
                    name: '',
                    targets: [0],
                    desc: '',
                    labels: [],
                    groups: [
                        {
                            groupName: this.$t('metaData.defaultGroup'),
                            isDefault: true,
                            scoreDefs: [
                                {
                                    id: 0,
                                    score: '',
                                    itemShow: true,
                                    show: '',
                                    //显示为是否改变
                                    isChangeName: false,
                                    filter: {
                                        conditions: [],
                                        relation: 'and'
                                    },
                                }
                            ]
                        }
                    ]
                };

                //新增时调用一下标签列表
                this.getVipLabel();

                //新增时须给this.errorScores.push('');，否则为undefined
                this.errorScores.push('');
                this.createFilter(this.scoreObject.groups[0].scoreDefs[0]);
            }
        },
        watch: {
            //折叠/全部展开
            defaultShow(newValue) {
                this.scoreObject.groups[0].scoreDefs.forEach(item => {
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
        methods: {
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
            changeDefaultShow(item) {
                this.$set(item, 'itemShow', !item.itemShow);
                const scoreDefs = this.scoreObject.groups[0].scoreDefs;
                let trueLen = scoreDefs.filter(list => list.itemShow === true).length;
                let falseLen = scoreDefs.filter(list => list.itemShow === false).length;
                if (trueLen === scoreDefs.length) {
                    this.defaultShow = true;
                } else if (falseLen === scoreDefs.length) {
                    this.defaultShow = false;
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

            // 改变过滤条件filterList
            changeFilter(index, newFilter) {
                this.scoreObject.groups[0].scoreDefs[index].filter = newFilter;
            },

            // 更新过滤条件filterList
            updateFilter(index, newFilter) {
                this.scoreObject.groups[0].scoreDefs[index].filter = newFilter;
            },

            // 增加分值定义
            additionScore(list) {
                list.push({
                    id: '',
                    score: '',
                    show: '',
                    itemShow: true,
                    filter: {
                        conditions: [],
                        relation: 'and'
                    }
                });
                //校验用
                this.errorScores = [];
                list.forEach(() => {
                    this.errorScores.push('');
                });
                //增加分值定义时同时增加一条筛选条件
                const index = this.scoreObject.groups[0].scoreDefs.length;
                this.createFilter(this.scoreObject.groups[0].scoreDefs[index - 1]);
            },

            // 删除分值定义
            deleteScore(score, list, index) {
                //初始化时删除弹框全部关闭
                list.map(item => {
                    item.itemDel = false;
                });

                if (score.id) {
                    //删除数据库
                    //是否在计算定义使用
                    this.$loading();
                    WebServGradeApiV1
                        .relationScoreDef(score.id)
                        .then(({body: {data: {calculates, count}}}) => {
                            this.$loaded();
                            if (count > 0) {
                                //存在使用，需二次确认是否要删除
                                //删除页面弹出
                                this.delItemTip = calculates.join(',').length > 10
                                    ? (calculates.join(',')
                                        .substr(0, 10) + '...')
                                    : calculates.join(',');
                                this.delItemId = score.id;
                                score.itemDel = true;
                            } else {
                                //未使用直接删掉
                                this.delItemId = score.id;
                                this.deleteConfirm(score, list, index);
                            }
                        })
                        .catch(err => {
                            console.error(err);
                            this.$loaded();
                        });

                } else {
                    //删除分值，从页面删掉
                    list.splice(index, 1);
                }

            },
            //弹框点击确定
            deleteConfirm(score, list, index) {
                this.$loading();
                WebServGradeApiV1
                    .deleteScoreItem(this.delItemId)
                    .then(() => {
                        //删除分值，从页面删掉
                        list.splice(index, 1);
                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                        trackEvent('数据中心-元数据-删除打分因子', {id: this.delItemId});
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });

            },
            //增加过滤条件
            createFilter(score) {
                let obj = {
                    attrGenre: '', //过滤属性对应的类型 0：字符串，1：数字，2-时间
                    eventId: '', //首次对应的事件id
                    field: {
                        attrId: '', //过滤属性的attrId
                    },
                    conditionType: '',
                    function: '', //过滤属性对应的函数
                    params: [], //函数对应的参数
                    format: '',
                    collectFunction: 'equal',
                    paramsInterval: ['include', 'include'],
                    type: '',    //过滤条件的类型
                    userGroupInfo: {},
                    numberPrecision: '', //精度
                    userGroupRelation: '',
                    functionSelectList: '',  //增加的过滤选项 需要删除的
                };
                score.filter.conditions.push(obj);
            },

            // 得到分值详情
            getScoreDetail(id) {
                this.$loading();
                WebServGradeApiV1
                    .getScoreDefinition(id)
                    .then(({body: {data: {grade: {name, targets, desc, labels, groups}}}}) => {
                        this.$loaded();
                        groups[0].scoreDefs.forEach(item => {
                            //折叠
                            //this.$set(item, 'itemShow', false);
                            this.$set(item, 'itemShow', this.defaultShow);
                            this.$set(item, 'itemDel', false);
                            //显示为值是否改变
                            this.$set(item, 'isChangeName', false);
                            item.filter = JSON.parse(item.filter);
                        });
                        let targets1 = targets.split(',');
                        this.scoreObject = {
                            name: name,
                            targets: targets1.map(item => Number(item)),
                            desc: desc,
                            labels: labels,
                            groups: groups
                        };

                        //编辑时须给this.errorScores.push('');，否则为undefined
                        this.errorScores = [];
                        this.scoreObject.groups[0].scoreDefs.forEach(() => {
                            this.errorScores.push('');
                        });
                        // 是否可以删除，如果已经被引用了，则不能删除
                        WebServGradeApiV1
                            .deleteSdRelation(id)
                            .then(({body: {data: {calculates, count}}}) => {
                                this.unDeletableTip = count > 0
                                    ? this.$t('metaData.calculateDefine') + calculates.join(',') + this.$t('metaData.usedScoreCannotDelete')
                                    : '';
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
                                        logError(`[元数据-分值评估-打分因子]<score-definition.vue> getScoreDetail 不能识别的会员标签ID ${labelsChecked} :521`);
                                    }
                                    this.checkedVipItem.filter(item => {
                                        this.keyword.push(item.name);
                                    });
                                }
                            });
                    })
                    .catch(err => {
                        console.error(err);
                    });
            },

            // 新增保存
            addSave: debounce(function () {
                this.$loading();
                let {desc, groups, name, targets} = this.scoreObject;
                let groups1 = JSON.parse(JSON.stringify(groups));
                groups1[0].scoreDefs.forEach(item => {
                    item.filter = JSON.stringify(item.filter);
                });
                let labels1 = {};
                labels1.id = this.idArray;
                labels1.name = this.keyword;
                let sendObj = {
                    desc: desc,
                    labels: JSON.stringify(labels1),
                    groups: groups1,
                    name: name,
                    targets: targets.join(',')
                };
                WebServGradeApiV1
                    .createScoreDefinition(sendObj)
                    .then(({body: {data: {grade}}}) => {
                        this.$loaded();
                        this.$toast(this.$t('common.createSuccess'), 'success');
                        trackEvent('数据中心-元数据-新建打分因子', {name: sendObj.name});
                        this.$emit('success', grade);
                    })
                    .catch(err => {
                        this.$loaded();
                        console.error(err);
                    });
            }, 300),

            // 编辑保存
            updateSave() {
                this.$confirm(this.$t('metaData.notice'), `${this.$t('metaData.updateFactorConfirm')}`)
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            let {desc, groups, name, targets} = this.scoreObject;
                            let groups1 = JSON.parse(JSON.stringify(groups));

                            groups1[0].scoreDefs.forEach(item => {
                                item.filter = JSON.stringify(item.filter);
                            });
                            let labels1 = {};
                            labels1.id = this.idArray;
                            labels1.name = this.keyword;
                            let sendObj = {
                                id: this.scoreId,
                                desc: desc,
                                labels: JSON.stringify(labels1),
                                groups: groups1,
                                name: name,
                                targets: targets.join(',')
                            };
                            WebServGradeApiV1
                                .updateScoreDefinition(sendObj)
                                .then(({body: {data}}) => {
                                    this.$loaded();
                                    this.$toast(this.$t('common.updateSuccess'), 'success');
                                    trackEvent('数据中心-元数据-修改打分因子', {id: sendObj.id});
                                    this.$emit('success', data);
                                })
                                .catch(err => {
                                    this.$loaded();
                                    console.error(err);
                                });
                        }
                    });

            },
            // 删除打分因子
            delScoreConfirm() {
                this.$emit('delete',this.updateObj);
                /*this.$confirm(this.$t('metaData.deleteConfirm'), `${this.$t('metaData.sureDelete')} ${this.scoreObject.name} ${this.$t('metaData.deleteEndText')}`)
                    .then(sure => {
                        if (sure) {
                            WebServGradeApiV1
                                .deleteScoreDefinition(this.scoreId)
                                .then(() => {
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    trackEvent('数据中心-元数据-删除计算分值', {id: this.scoreId});
                                    this.$emit('delete');
                                });
                        }
                    });*/
            },

            // 保存前的校验
            check() {
                let flag = true;
                this.errorName = '';
                this.errorScores = [];
                this.scoreObject.groups[0].scoreDefs.forEach(() => {
                    this.errorScores.push('');
                });
                // 打分因子名称不能为空
                if (this.scoreObject.name === '') {
                    this.errorName = this.$t('metaData.scoreObjectErrorName');
                    return false;
                }
                if (!COMMON_NAME_REGEXP.test(this.scoreObject.name)) {
                    this.errorName = this.$t('metaData.scoreFactorName') + ' ' + this.$t('common.nameSpecial');
                    return false;
                }
                //分值不能为空
                let {groups} = this.scoreObject;
                let groups1 = JSON.parse(JSON.stringify(groups));

                groups1[0].scoreDefs.forEach(() => {
                    this.errorScores.push('');
                });
                //分值不能为空，至少含有一个条件
                groups1[0].scoreDefs.forEach((item, index) => {
                    //分值不能为空
                    if (item.score === '') {
                        this.errorScores[index] = this.$t('metaData.scoreNotEmpty');
                        // TODO: unclean codes
                        // eslint-disable-next-line
                        return flag = false;
                    }
                    //至少含有一个条件
                    // if (item.filter.conditions.length === 0) {
                    // this.$toast('第' + (index + 1) + '项至少含有一条筛选条件');
                    // return flag = false
                    // }
                });
                return flag;
            },

            // 保存打分因子
            save: debounce(function () {
                if (this.loading) return;
                if (!this.check()) return;
                this.isSave = true;
                //不用判断从哪个页面进去的，只判断筛选条件是否通过验证
                this.$nextTick(() => {
                    let flag = true;
                    if (this.$refs.scorefilter) {
                        flag = this.$refs.scorefilter.every(sf => sf.valid());
                    }
                    if (!flag) return;
                    this.scoreId === '' ? this.addSave() : this.updateSave();
                });
            }, 300),
            // 取消
            cancel() {
                this.scoreObject = {
                    name: this.$t('metaData.score'),
                    targets: [0],
                    desc: '',
                    labels: [],
                    groups: [
                        {
                            groupName: this.$t('metaData.assessDefined'),
                            isDefault: true,
                            scoreDefs: [
                                {
                                    id: 0,
                                    score: -2,
                                    itemShow: true,
                                    itemDel: false,
                                    show: this.$t('metaData.age'),
                                    //显示为是否改变
                                    isChangeName: false,
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
            //显示为变化
            changeShow(score) {
                score.isChangeName = true;
                //显示为空时，显示为的值根据前面发生变化
                if (score.show === '') {
                    score.isChangeName = false;
                    score.show = score.score;
                }

            },
            //分值变化时显示为也相应变化
            changeShowName(scoreObj) {
                let score = scoreObj.score;
                //不为合法返回''，数字类型或小数。小数位数小于4位不处理，大于4位四舍五入
                scoreObj.score = formatScore(score);

                //名称已改变，不在进行显示为变化
                if (scoreObj.isChangeName) {
                    return;
                }
                scoreObj.show = scoreObj.score;

            },
            //复制打分因子
            copyScore: debounce(function (index, list) {
                const target = list[index];
                //复制之前需判断分值显示条件等不能为空,筛选条件score.filter.conditions.length===0
                // if (target.score === '') {
                // this.$toast('执行复制操作时分值不能为空');
                // return;
                // }
                //复制一个新对象通过score
                let newScore = cloneDeep(target);
                //复制的newScore id不为空，需清除id
                delete newScore.id;
                newScore.filter.conditions.forEach(condition => {
                    delete condition.id;
                });
                list.splice((index + 1), 0, newScore);
                //校验用
                this.errorScores = [];
                this.scoreObject.groups[0].scoreDefs.forEach(() => {
                    this.errorScores.push('');
                });
            }, 300),

            //上移下移
            changeScoreSort(index,list,flag){
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
            }
        },
        components: {
            ScoreFilter,
            SelectorTree
        }
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    @import "../data-item.scss";

    $margin-left: 45px;
    .score-definition {

        .e-content-condition {
            .e-content-description{
                padding: 0 16px 10px;
                margin: 10px 0;
                border-bottom: 1px solid $border-color;
            }
            .score-item {
                margin-bottom: 18px;
                position: relative;

                .score-item-header {
                    position: relative;
                    margin-left: $margin-left;
                    margin-bottom: 8px;
                }

                .score-item-content {
                    &:hover {
                        background-color: $title-bg;
                    }

                    .add-ops-item {
                        color: $light-green;
                        cursor: pointer;
                        margin-top: 5px;
                        margin-bottom: 8px;
                        padding: 0;
                    }
                }

                .selector.lg {
                    min-width: 60px;
                }
            }
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

</style>
