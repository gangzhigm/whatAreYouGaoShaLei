<template>
    <div class="new-scoring-quick">
        <!-- 面包屑导航 -->
        <div class="content-view">
            <crumbs :crumbs="crumbs"></crumbs>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{ 'newScoring.importSysPresetModel' | t }}</h1>
            </div>
        </div>
        <div class="page-content content-view margin white-bg">
            <!-- 1、属性维度 -->
            <template v-if="step === 1 && !loading">
                <div class="quick-box">
                    <h1>{{ 'newScoring.attrStandard' | t }}</h1>
                    <span class="quick-tip">{{ 'newScoring.attrTips' | t }}</span>
                    <div class="quick-title">
                        <span>{{ 'newScoring.attr' | t }}</span>
                        <span>{{ 'newScoring.scoreRule' | t }}</span>
                    </div>
                    <ul>
                        <li class="quick-item" v-for="(attr, index) in attrArr" :key="index">
                            <div class="pull-left" :style="{height:`${attr.scoreRules.rules.length * 42}px`}">
                                <p>{{attr.showName.split('(')[0] || '/'}}</p>
                                <p>{{attr.scoreRules.rules[0].conditions[0].field_name}}</p>
                            </div>
                            <div class="pull-right" v-for="(rule, indexs) in attr.scoreRules.rules" :key="indexs">
                                <span style="width: 150px">{{'newScoring.' + rule.conditions[0].operation | t}}</span>
                                <input v-if="['eq', 'gt', 'lt'].includes(rule.conditions[0].operation)" class="input lg"
                                    type="text"
                                    maxlength="100"
                                    v-model.trim="rule.conditions[0].value"
                                    @input="changeIsWarn(rule.conditions[0])">
                                <div v-if="rule.conditions[0].operation === 'range'">
                                    <input class="input"
                                        v-model="rule.conditions[0].value.start"
                                        type="text"
                                        :maxlength="20"
                                        style="width:100px;"
                                        @input="changeIsWarn(rule.conditions[0])">
                                    <span>{{'data.to' | t}}</span>
                                    <input class="input"
                                        v-model="rule.conditions[0].value.end"
                                        type="text"
                                        :maxlength="20"
                                        style="width:100px;"
                                        @input="changeIsWarn(rule.conditions[0])">
                                </div>
                                <span style="width: 150px"> + {{rule.score}}{{'newScoring.point' | t}}</span>
                                <span class="warn" v-if="rule.conditions[0].isWarn">
                                    <svg>
                                        <use xlink:href="#icon-warn"></use>
                                    </svg>
                                    {{'swarm.invalidRule' | t}}
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>
            </template>
            <!-- 2、事件维度 -->
            <template v-if="step === 2">
                <div class="quick-box">
                    <h1>{{ 'newScoring.eventStandard' | t }}</h1>
                    <span class="quick-tip">{{ 'newScoring.eventTips' | t }}</span>
                    <div class="quick-title">
                        <span>{{ 'newScoring.event' | t }}</span>
                        <span>{{ 'newScoring.scoreRule' | t }}</span>
                    </div>
                    <ul v-if="!eventLoading">
                        <li class="quick-item" v-for="(event, index) in eventArr" :key="index">
                            <div class="pull-left">
                                <p>{{event.showName.split('(')[0] || '/'}}</p>
                                <p>{{event.scoreRules.rules[0].event}}</p>
                            </div>
                            <div class="pull-right quick-event">
                                <div>
                                    <span>{{'newScoring.recent' | t}}</span>
                                    <input  class="input" 
                                            type="number" 
                                            v-model="event.scoreRules.rules[0].fromDate"
                                            @blur="dateBlur(event.scoreRules.rules[0])"
                                            style="width: 50px;">
                                    <span>{{'newScoring.days' | t}}</span>
                                    <span v-if="event.scoreRules.rules[0].conditions[0].field_name">{{'newScoring.daysAfter' | t}}</span>
                                </div>
                                <div v-if="event.scoreRules.rules[0].conditions[0].field_name">
                                    <radio :source="0" v-model="event.scoreRules.rules[0].isAppoint" @input="typeChange($event, event.scoreRules.rules[0].conditions[0])">{{'newScoring.any' | t}}</radio>
                                    <radio :source="1" v-model="event.scoreRules.rules[0].isAppoint" @input="typeChange($event, event.scoreRules.rules[0].conditions[0])"></radio>
                                    <!-- 来源任务 -->
                                    <template v-if="event.scoreRules.rules[0].conditions[0].field_name === 'task_instantiation_id'">
                                        <task-selector  v-model="event.scoreRules.rules[0].conditions[0].task_instantiation_id"
                                                        :journey="event.scoreRules.rules[0].conditions[0].journey_instantiation_id"
                                                        :journeyGroup="event.scoreRules.rules[0].conditions[0].journey_group_id" :disabled="!event.scoreRules.rules[0].isAppoint"
                                                        :list="journeyGroupData" @select="factorChange($event, event.scoreRules.rules[0].conditions[0])">
                                        </task-selector>
                                    </template>
                                    <!-- 公众号 -->
                                    <template v-if="event.scoreRules.rules[0].conditions[0].field_name === 'app_id'">
                                        <selector :options="wechatList"
                                            v-model="event.scoreRules.rules[0].conditions[0].id" :disabled="!event.scoreRules.rules[0].isAppoint"
                                            @select="wechatChange($event, event.scoreRules.rules[0].conditions[0])"></selector>
                                    </template>
                                    <!-- 表单 -->
                                    <template v-if="event.scoreRules.rules[0].conditions[0].field_name === 'form_id'">
                                        <selector style="width: 224px;margin-right: 10px;" :options="formList"
                                            v-model="event.scoreRules.rules[0].conditions[0].value" :disabled="!event.scoreRules.rules[0].isAppoint"
                                            search @select="formChange(event.scoreRules.rules[0].conditions[0])"></selector>
                                    </template>
                                </div>
                                <div class="quick-event-score">
                                    <span>{{event.scoreRules.rules[0].score}}{{'newScoring.eventPoint' | t}}</span>
                                    <span>{{'newScoring.upLimit' | t}}{{event.scoreRules.rules[0].maxScore}}{{'newScoring.point' | t}}</span>
                                </div>
                                <div class="warn" v-if="event.scoreRules.rules[0].isAppoint && event.scoreRules.rules[0].conditions[0].isWarn">
                                    <svg :style="lang ? 'margin-left: 321px;' : 'margin-left: 335px;'">
                                        <use xlink:href="#icon-warn"></use>
                                    </svg>
                                    {{'swarm.invalidRule' |t}}
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </template>
            <!-- 3、规则等级 -->
            <div v-show="step === 3">
                <div class="quick-box">
                    <h1>{{ 'newScoring.scoreLevel' | t }}</h1>
                    <level-modal :disabled="isSubmiting" v-model="grades"></level-modal>
                </div>
            </div>
        </div>
        <div class="page-foot">
            <button class="btn btn-white" :disabled="isSubmiting" @click="cancel">{{'common.cancel' | t}}</button>
            <button v-if="step < 3" class="btn btn-theme pull-right" :disabled="isSubmiting" @click="next">{{'newScoring.nextStep' | t}}</button>
            <button v-if="step === 3" class="btn btn-theme pull-right" :disabled="isSubmiting" @click="createModel">{{'newScoring.createModel' | t}}</button>
            <button v-if="step > 1" class="btn btn-white pull-right" :disabled="isSubmiting" @click="previous">{{'newScoring.preStep' | t}}</button>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
import { individualAttr, companyAttr, individualEvent, companyEvent } from './quick-data';
import { ScoringV2, ContactApiV1, JourneyApiV3, QuestionnaireApiV1, WechatApiV1 } from '@/api';
import taskSelector from '@/common/components/condition-bunch/taskSelector.vue';
import cascading from '@/common/components/condition-bunch/cascading.vue';
import levelModal from './level-modal.vue';
import cloneDeep from 'lodash/cloneDeep';
import {I18N_STORE_NAME} from '@/locales';
import { mapState } from 'vuex';

export default {
    components: {
        taskSelector,
        cascading,
        levelModal
    },
    data () {
        return {
            loading: true,
            eventLoading: true,
            step: 1,
            grades: [], // 等级规则
            journeyGroupData: [], // 来源任务
            wechatList:[], // 微信公众号列表
            formList: [], // 来源表单
            attrArr: [],    // 属性列表
            eventArr: [],   // 事件列表
            isSubmiting: false  //提交状态
        };
    },
    computed: {
        ...mapState({
            lang: state => state[I18N_STORE_NAME].lang === 'zh-CN'
        }),
        crumbs () {
            return [
                { name: 'wecom', text: 'Dmartech' },
                { name: 'scorerating', text: this.$t('newScoring.newScoring') },
                Object.assign({}, this.$route, {
                    text: this.$t('newScoring.quickModel')
                })
            ];
        }
    },
    created () {
        if (this.$route.query.modeType === 'individual') {
            this.attrArr = cloneDeep(individualAttr);
            this.eventArr = cloneDeep(individualEvent);
            this.getWechatListRequest();
        } else {
            this.attrArr = cloneDeep(companyAttr);
            this.eventArr = cloneDeep(companyEvent);
            this.getList();
            this.getFormListHandler();
        }
        this.getAttr();
        this.getEvent();
    },
    methods: {
        /**
         * 旅程分组列表初始化列表结构
         * @param group 旅程分组数据
         */
        getJourneyGroupData(group) {
            if (group && group.length) {
                group.forEach(item => {
                    if (item.childs && item.childs.length) {
                        this.getJourneyGroupData(item.childs);
                    }
                    delete item.childs;
                    this.journeyGroupData.push(item);
                });
            }
        },
        // 获取来源任务列表
        getList() {
            JourneyApiV3
                .getGroupList()
                .then(res => {
                    let allGroup = res.body.data.rootGroup.childs;
                    this.getJourneyGroupData(allGroup);
                });
        },
        // 获取表单列表
        getFormListHandler() {
            QuestionnaireApiV1
                .getFormListNoPage(0)
                .then(res => {
                    this.formList = res.body.data.papers.map(e => {
                        let form = {};
                        form.name = e.paperName;
                        form.id = e.id;
                        return form;
                    });
                });   
        },
        // 获取公众号列表
        getWechatListRequest() {
            WechatApiV1
                .getWechatAccounts()
                .then(res => {
                    this.wechatList = res.body.data.authorizerInfoList
                        .map(({authorizerInfoId: id, principalName: name, WxAppId: WxAppId}) => ({id, name,WxAppId}));
                });
        },
        // 补全属性列表
        getAttr() {
            ContactApiV1.customWorld(0, 1, '', 1)
                .then(res => {
                    res.body.data.customerFieldList.forEach(attr => {
                        this.attrArr.forEach(item => {
                            item.scoreRules.rules.forEach(items => {
                                if (attr.fieldName === items.conditions[0].field_name) {
                                    item.name =  '';
                                    item.showName = (this.lang ? attr.fieldCn : attr.nameEn) + '(' + attr.field + ')';
                                    item.attributeOrEventId = attr.id;
                                    items.conditions[0].fieldType = attr.fieldType;
                                    items.conditions[0].fieldId = attr.id;
                                }
                            });
                        });
                    });
                    this.loading = false;
                });
        },
        // 获取便捷模式事件
        getEvent() {
            ContactApiV1.getEventList()
                .then(res => {
                    let eventList = [];
                    if (this.$route.query.modeType === 'individual') {
                        res.body.data.list.forEach(event => {
                            // 个人模型
                            if (['wx_subscribe',
                                'wx_unsubscribe',
                                'wx_scan',
                                'place_an_order',
                                'visit_website_dmt',
                                'make_an_appointment'].includes(event.name)) {
                                this.eventArr.forEach(item => {
                                    if (item.rules[0].event === event.name) {
                                        item.rules[0].eventGroup = event.evnentsGroupName;
                                        item.rules[0].eventGroupId = event.evnentsGroupId;
                                        item.rules[0].eventId = event.id;
                                        let scoreRules = cloneDeep(item);
                                        let eventObj = {
                                            name: '',
                                            scoringModelId: '',
                                            showName: (this.lang ? event.nameCn : event.nameEn) + '(' + event.name + ')',
                                            type: 1,
                                            attributeOrEventId: event.evnentsGroupId,
                                            scoreRules: scoreRules
                                        };
                                        eventList.push(eventObj);
                                    }
                                });
                            }
                        });
                    } else {
                        res.body.data.list.forEach(event => {
                            // 企业模型
                            if (['dmd_open',
                                'dmd_click',
                                'dmd_unsubscribe',
                                'form_submit',
                                'wecom_employee_add_contact',
                                'download_files_dmt',
                                'participate_conference',
                                'visit_website_dmt'].includes(event.name)) {
                                this.eventArr.forEach(item => {
                                    if (item.rules[0].event === event.name) {
                                        item.rules[0].eventGroup = event.evnentsGroupName;
                                        item.rules[0].eventGroupId = event.evnentsGroupId;
                                        item.rules[0].eventId = event.id;
                                        let scoreRules = cloneDeep(item);
                                        let eventObj = {
                                            name: '',
                                            scoringModelId: '',
                                            showName: (this.lang ? event.nameCn : event.nameEn) + '(' + event.name + ')',
                                            type: 1,
                                            attributeOrEventId: event.evnentsGroupId,
                                            scoreRules: scoreRules
                                        };
                                        eventList.push(eventObj);
                                    }
                                });
                            }
                        });
                    }
                    this.eventArr = cloneDeep(eventList);
                    this.eventLoading = false;
                });
        },
        // 输入1-365天
        dateBlur(rule) {
            let fromDate = rule.fromDate;
            if (fromDate === '' || fromDate < 1) {
                fromDate = 1;
            } else if (fromDate > 365) {
                fromDate = 365;
            } else if (String(fromDate).indexOf('.') > -1) {
                fromDate = Math.round(fromDate);
            }
            rule.fromDate = fromDate;
        },
        // 任意或指定任务
        typeChange(e, data) {
            data.isWarn = false;
            if (!e) {
                data.value = '';
                if (data.field_name === 'task_instantiation_id') {
                    data.task_instantiation_id = '';
                    data.journey_instantiation_id = '';
                    data.journey_group_id = '';
                }
                if (data.field_name === 'app_id') {
                    data.id = '';
                }
            }
        },
        // 邮件任务选择
        factorChange(e, data) {
            if (data.field_name === 'task_instantiation_id') {
                data.journey_instantiation_id = e.selectJourneyID;
                data.journey_group_id = e.selectJourneyGroup;
                data.value = ~~(e.taskIDS.toString());
            }
            data.isWarn = false;
        },
        // 公众号选择
        wechatChange(e, data) {
            data.isWarn = false;
            if (data.field_name === 'app_id') {
                data.value = e.WxAppId;
            }
        },
        // 表单选择
        formChange(data) {
            data.isWarn = false;
        },
        // 校验错误后 输入值 错误提示 消失
        changeIsWarn(item) {
            if (item.value) {
                item.isWarn = false;
            }
        },
        // 上一步
        previous() {
            this.step -= 1;
        },
        // 取消
        cancel() {
            this.$router.go(-1);
        },
        // 下一步
        next() {
            let isWarn = false;
            if (this.step === 1) {
                this.attrArr.forEach(attr => {
                    attr.scoreRules.rules.forEach(rule => {
                        if (rule.conditions[0].operation === 'range') {
                            if (!rule.conditions[0].value.start || !rule.conditions[0].value.end) {
                                rule.conditions[0].isWarn = true;
                                isWarn = true;
                            }
                        } else if (!rule.conditions[0].value) {
                            rule.conditions[0].isWarn = true;
                            isWarn = true;
                        }
                    });
                });
            }
            if (this.step === 2) {
                this.eventArr.forEach(event => {
                    if (event.scoreRules.rules[0].isAppoint && !event.scoreRules.rules[0].conditions[0].value) {
                        event.scoreRules.rules[0].conditions[0].isWarn = true;
                        isWarn = true;
                    }
                });
            }
            if (isWarn) {
                this.$forceUpdate();
                this.$toast(this.$t('swarm.invalidRule'), 'warn');
                return;
            }
            this.step += 1;
        },
        // 获取当前日期
        getNowFormatDate() {
            let date = new Date();
            let seperator1 = '';
            
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let hour = date.getHours();
            let minutes = date.getMinutes() ;
            let seconds = date.getSeconds();
            let strDate = date.getDate();
            
            if (month >= 1 && month <= 9) {
                month = '0' + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = '0' + strDate;
            }
            let currentdate = year + seperator1 + month + seperator1 + strDate + hour  + minutes  + seconds;
            return currentdate;
        },
        // 创建模型
        async createModel() {
            this.$loading();
            this.isSubmiting = true;
            let modelId = await ScoringV2
                .addScoringModel({
                    scoringRange: 0,
                    modelName: this.$t('newScoring.userMatrixModel') + this.getNowFormatDate(),
                    type: 1,
                    mode: 1
                })
                .then(({body: {data: {modelId}}}) => {
                    return modelId;
                })
                .catch(() => {
                    this.$loaded();
                    this.isSubmiting = false;
                });
            if (modelId) {
                let list = cloneDeep([...this.attrArr, ...this.eventArr]);
                list.forEach(prop => {
                    prop.scoringModelId = modelId;
                    prop.scoreRules.rules[0].isAppoint = prop.scoreRules.rules[0].isAppoint === 0 ? true : false;
                    let ruleJson = JSON.stringify(prop.scoreRules);
                    prop.scoreRules = ruleJson;
                    delete prop.showName;
                });
                ScoringV2
                    .saveScoringFactorSimple(list)
                    .then(() => {
                        // 保存等级规则
                        ScoringV2
                            .editGrades(modelId, this.grades)
                            .then(() => {
                                this.$loaded();
                                this.$toast(this.$t('menu.synSuccess'), 'success');
                                this.$router.push({
                                    name: 'editNewScoreRating',
                                    query: { modelId: modelId }
                                });
                            })
                            .catch((err) => {
                                if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                                    this.$toast(err.body.message, 'warn');
                                }
                                this.$loaded();
                                this.isSubmiting = false;
                            });
                    })
                    .catch(() => {
                        this.$loaded();
                        this.isSubmiting = false;
                    });
            }
        }
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../common/scss/base/_variables';
@import '../../../common/scss/base/_mixin';

.new-scoring-quick {
    .quick-box {
        width: 1100px;
        margin: 30px auto 100px;
        font-size: 14px;

        h1 {
            font-size: 18px;
            font-weight: normal;
            color: $color-content;
            text-align: center;
        }

        .quick-tip {
            display: inline-block;
            margin: $input-field-height auto 10px;
        }

        .quick-title {
            background: $title-bg;
            line-height: $toolbar-height;
            text-align: center;

            &>span:first-child {
                display: inline-block;
                width: 245px;
                border-right: 2px solid #fff;
            }

            &>span:last-child {
                display: inline-block;
                width: 845px;
            }
        }

        &>ul {
            &>li {
                display: inline-block;
                width: 100%;
                line-height: $input-field-height;
                box-sizing: border-box;
                border-top: 1px solid $form-border;

                &:first-child {
                    border-top: none;
                }

                span {
                    display: inline-block;
                }
            }

            .quick-item {
                padding: 10px 0;

                .pull-left {
                    width: 245px;
                    min-height: 43px;
                    text-align: center;
                    display: flex;
                    flex-wrap: wrap;
                    align-content: center;

                    p {
                        width: 100%;
                        line-height: 16px;
                    }
                }

                .pull-right {
                    display: flex;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    width: 775px;
                    padding: 5px 30px;

                    &>span {
                        text-align: center;
                    }

                    .warn {
                        display: inline-block;
                        width: 100%;
                        color: $red;
                        line-height: 16px;

                        svg {
                            width: 16px;
                            height: 16px;
                            fill: $red;
                            vertical-align: bottom;
                        }
                    }
                }

                .quick-event {
                    width: 845px;
                    padding: 5px;

                    .cascading .csedes .drop-down-list ul {
                        width: 150px;
                    }

                    .selector {
                        width: 224px;

                        .select-text span{
                            display:inline-block;
                            max-width: 185px;
                            overflow: hidden;
                            @include ellipsis();
                        }
                    }
                    
                    .quick-event-score {
                        width: 250px;

                        &>span:first-child {
                            width: 95px;
                            text-align: right;
                        }

                        &>span:last-child {
                            float: right;
                            width: 125px;
                        }
                    }
                }
            }
        }
    }

    .page-foot {
        position: fixed;
        bottom: 0;
        width: 100%;
        background: #fff;
        border-top: 1px solid $border-color;

        .btn {
            line-height: $input-field-height;
            padding: 0 15px;
            margin: 10px 15px;
        }

        .btn-white {
            border: none;
        }
    }
}
</style>
