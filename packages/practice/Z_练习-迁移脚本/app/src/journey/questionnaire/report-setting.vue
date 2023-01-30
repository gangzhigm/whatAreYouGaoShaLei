<template>
    <!--发送报告设置-->
    <div class="content-container report-setting">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'form.reportSend' | t}}</h1>
                <button class="btn btn-theme" :disabled="$has('journey_form_logs')"
                        @click="getRuleLogList">{{'form.log' | t}}</button>
            </div>
        </div>
        <div class="page-content">
            <div class='content-view white-bg margin padding'>
                <!--设置报告表单名称-->
                <div class="form-field">
                    <label class="label">{{'form.selectedForm' | t}}</label>
                    <span>{{paperName}}</span>
                </div>
                <!--当前数据量-->
                <div class="form-field">
                    <label class="label">{{'form.currentData' | t}}</label>
                    <span>{{totalElement}}</span>
                </div>
                <!--添加发送规则按钮-->
                <div class="form-field">
                    <label class="label"></label>
                    <button class="btn btn-theme btn-md rule-setting" @click="addRule">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        {{'form.sendRuleSetting' | t}}
                    </button>
                </div>
                <transition-group name="fade">
                    <!-- 可编辑状态 -->
                    <div class="rule-container" v-for="(rule,index) in ruleList" :key="rule.id">
                        <!--规则展示名称： 规则名称（编辑）、新规则（新建）-->
                        <div class="rule-title" @click="changeEditStatus(rule)">
                            <span v-if="hasNewRule&&rule.id===-1">{{'form.newRule' | t}}</span>
                            <span v-else>{{'form.rule' | t}}{{hasNewRule?index:index+1}}：{{rule.name}}</span>
                            <i class="up-down" :class="rule.isEdit ? 'down':'up'"></i>
                        </div>
                        <!-- 新建、编辑规则-->
                        <div class="rule-content" v-if="rule.isEdit">
                            <!--规则名称-->
                            <div class="form-field">
                                <label class="label">{{'form.ruleName' | t}}</label>
                                <input type="input" class="input" v-model="rule.name" maxlength="200"/>
                            </div>
                            <!--字段筛选-->
                            <div class="form-field">
                                <label class="label">{{'form.filter' | t}}</label>
                                <multi-select :options="questionnaireSelectordOptions" v-model="rule.fieldIdList"
                                              @input="changeField(rule)"
                                              :placeholder="$t('form.selectFiled')"></multi-select>
                                <checkbox v-model="rule.allChecked" @input="changeCheckAllStatus(rule,$event)"/>
                                {{'form.selectAll' | t}}
                            </div>
                            <template v-if="filterEnabled">
                                <!--添加筛选条件按钮-->
                                <div class="form-field" v-if="companyType!==2">
                                    <label class="label"></label>
                                    <span class="theme-text">{{'form.addFilter' | t}}</span>
                                    <span class="icon icon-tianjia add-icon" @click="addFilter(rule)"></span>
                                </div>
                                <!--筛选条件选择框-->
                                <div class="form-field flex">
                                    <label class="label"></label>
                                    <div class="field-group">
                                        <!-- 标准版 -->
                                        <form-query-filter :groups="questionnaireSelectordOptions" :filter="rule.filterList"
                                            @change="updateOrChangeFilter(rule,$event)"
                                            @update="updateOrChangeFilter(rule,$event)"
                                            :calenderFormat="'yyyy-mm-dd hh:ii'"
                                            :type="'form'"
                                            v-if="companyType!==2 && rule.filterList&&rule.filterList.conditions.length>0"/>
                                        <!-- 世邦 -->
                                        <form-query-filter-shibang v-else-if="companyType===2 && rule.filter.filterGroup" 
                                            :groups="questionnaireSelectordOptions" :filter="rule.filter" :type="'form'"
                                            @addFilterGroup="addFilterGroup(rule)"
                                            @changeRelation="changeRelation($event,rule)"
                                            :calenderFormat="'yyyy-mm-dd hh:ii'"/>
                                    </div>
                                </div>
                            </template>
                            <!--发送时间配置-->
                            <div class="form-field flex">
                                <label class="label">{{'form.sendTime' | t}}</label>
                                <div class="field-group">
                                    <selector :options="dateTypeList" v-model="rule.sendType"
                                              @input="changeDateType(rule)"></selector>
                                    <selector v-if="rule.sendType !== 2" :options="timeZone"
                                              v-model="rule.timeZone" @input="changeTimeZone(rule)"
                                              class="xl"></selector>
                                    <template v-if="rule.timeZone !== ''">
                                        <template v-if="rule.sendType === 3">
                                            {{'form.startTime' | t}}
                                        </template>
                                        <calendar v-if="rule.sendType !== 2"
                                                  v-model="rule.pushDate" format="yyyy-mm-dd hh:ii"
                                                  :start="getTodayDate(rule.timeZone)" :showTodayBtn="false"
                                                  :today-height-light="rule.timeZone === '+08:00'"
                                                  :initial-date="getTodayDate(rule.timeZone)"
                                                  :minuteStep="1" />
                                    </template>
                                </div>
                            </div>
                            <template v-if="rule.sendType === 3 && rule.timeZone !== ''">
                                <div class="form-field">
                                    <label class="label">{{'newJourney.period' | t}}</label>
                                    {{'newJourney.every' | t}}
                                    <number-input class="input tiny" v-model="rule.repeatPeriodic" :min="1" maxlength="3"/>
                                    <selector class="frequency" :options="frequencyList"
                                              v-model="rule.timeType"></selector>
                                    {{'newJourney.once' | t}}
                                    <i class="icon icon-yiwen1" v-title="$t('form.sendSettingExportDateNote')"></i>
                                </div>
                                <div class="form-field flex periodic">
                                    <label class="label">{{'newJourney.ends' | t}}</label>
                                    <selector :options="startDate" v-model="rule.periodicSendType"
                                              @input="changeByDate(rule)"></selector>
                                    <template v-if="rule.periodicSendType===1">
                                        <number-input class="input tiny" v-model="rule.periodicSendValue" :min="1"/>
                                        {{'visualization.times' | t}} {{'form.after' | t}}
                                    </template>
                                    <template v-if="rule.periodicSendType===2">
                                        <number-input class="input tiny" v-model="rule.periodicSendValue" :min="1"/>
                                        {{'time.day' | t}} {{'form.after' | t}}
                                    </template>
                                    <template v-if="rule.periodicSendType===3">
                                        <calendar v-model="rule.periodicSendValue" format="yyyy-mm-dd hh:ii"
                                                  :start="getTodayDate(rule.timeZone)" :showTodayBtn="false"
                                                  :today-height-light="rule.timeZone === '+08:00'"
                                                  :initial-date="getTodayDate(rule.timeZone)" />
                                    </template>
                                </div>
                            </template>
                            <!--格式类型-->
                            <div class="form-field">
                                <label class="label">{{'contact.formatType' | t}}</label>
                                <radio source="Excel" v-model="rule.formatType" @input="testA($event,rule)">Excel
                                </radio>
                                <radio source="CSV" v-model="rule.formatType" @input="testA($event,rule)">CSV</radio>
                            </div>
                            <!--数据格式-->
                            <div class="form-field" v-if="dataFormatShow">
                                <label class="label">{{'contact.dataFormat' | t}}</label>
                                <radio source="utf8" v-model="rule.dataFormat">utf8</radio>
                                <radio source="gb18030" v-model="rule.dataFormat">gb18030</radio>
                            </div>
                            <!-- 邮件主题 -->
                            <div class="form-field">
                                <label class="label">{{'contact.emailSubject' | t}}</label>
                                <input type="text" class="input" maxlength="60" v-model="rule.emailSubject"/>
                            </div>
                            <div class="form-field flex">
                                <label class="label">{{'form.receiveMail' | t}}</label>
                                <div class="field-group email-group">
                                    <div v-for="(mail,index) in rule.emailList">
                                        <input type="text"
                                               v-model.trim="rule.emailList[index]" :key="index"
                                               class="input lg test-input">
                                        <span class="icon icon-tianjia add-icon"
                                              @click="addEmail(rule.emailList)"></span>
                                        <span class="icon icon-iconless delete-icon"
                                              @click="removeEmail(index,rule.emailList)"
                                              v-if="rule.emailList.length !== 1"></span>
                                    </div>
                                </div>
                            </div>
                            <!-- 是否有数据时才发送报告 -->
                            <div class="form-field">
                                <checkbox class="has-data-to-send" v-model="rule.dataAmountCheck">{{'form.hasDataToSend' | t}}</checkbox>
                            </div>
                            <!--按钮-->
                            <div class="rule-footer">
                                <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.del')"
                                       @click="deleteRule(rule)">
                                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')"
                                       @click="confirmToAddRule(rule,index)">
                            </div>
                        </div>
                        <!-- 不可编辑状态 查看规则-->
                        <div class="rule-content" v-else>
                            <!--规则名称-->
                            <div class="form-field">
                                <label class="label">{{'form.ruleName' | t}}</label>
                                <span>{{rule.name}}</span>
                            </div>
                            <!--筛选规则-->
                            <div class="form-field flex">
                                <label class="label">{{'form.filter' | t}}</label>
                                <div class="field-group">
                                    <button v-for="name in toName(rule.fieldIdList)"
                                            class="btn btn-theme btn-sm name-text">{{name}}
                                    </button>
                                </div>
                            </div>
                            <!--规则条件-->
                            <div class="form-field flex" v-if="filterEnabled">
                                <label class="label">{{'form.filterCondition' | t}}</label>
                                <div class="field-group">
                                    <p v-if="companyType !==2 && rule.filterList.conditions.length===0">{{'common.noData' | t}}</p>
                                    <p v-if="companyType ===2 && rule.filter.filterGroup.length===0">{{'common.noData' | t}}</p>
                                    <div v-if="companyType !==2">
                                        <p v-for="filter in toNameFilter(rule.filterList.conditions)" >
                                            {{filter.name}}
                                            <span class="theme-text">{{filter.relation}}</span>
                                            {{filter.value}}
                                            <template v-if="filter.start && filter.end">
                                                {{'swarm.absoluteDateA' | t}}
                                                {{filter.start}}
                                                {{'swarm.absoluteDateB' | t}}
                                                {{filter.end}}
                                                {{'swarm.absoluteDateC' | t}}
                                            </template>
                                            <template v-if="filter.day">
                                                {{'swarm.relativeTime' | t}}
                                                {{filter.day}}
                                                {{'common.day' | t}}
                                                {{filter.relative_type === 0 ? 'swarm.within' : 'swarm.beyond' | t}}
                                            </template>
                                        </p>
                                    </div>
                                    <div v-if="companyType ===2 && rule.filter.filterGroup.length!==0">
                                        <!-- 世邦 -->
                                        <form-query-filter-shibang :groups="questionnaireSelectordOptions" :filter="rule.filter" :disabled="true"
                                            :type="'form'" :calenderFormat="'yyyy-mm-dd hh:ii'"/>
                                        </div>
                                </div>
                            </div>
                            <!--发送时间-->
                            <div class="form-field flex">
                                <label class="label">{{'form.sendTime' | t}}</label>
                                <div class="field-group">
                                    <span class='time-text' v-if="rule.sendType !== 2">
                                        {{'form.timeZone' | t}}{{toZoneTimeName(rule.timeZone)}}
                                    </span>
                                    <span v-if="rule.sendType===3" class='time-text'>{{'form.periodSend' | t}}</span>
                                    <span v-else-if="rule.sendType===2" class='time-text'>{{'form.sendNow' | t}}</span>
                                    <span v-else class='time-text'>{{'form.timeSend' | t}}</span>
                                    <template v-if="rule.sendType===3">
                                        <!--2.4.3版本，时区时间就是当前时区的时间，这里的timeZone删除-->
                                        {{'form.startTime' | t}}{{rule.pushDate}}
                                    </template>
                                    <span v-if="rule.sendType===1">{{rule.pushDate}}</span>
                                </div>
                            </div>
                            <template v-if="rule.sendType===3">
                                <div class="form-field">
                                    <label class="label">{{'newJourney.period' | t}}</label>
                                    {{'newJourney.every' | t}} {{rule.repeatPeriodic}}
                                    <span v-if="rule.timeType !== ''">
                                        {{ frequencyList.$getByKey(rule.timeType).name }}
                                    </span>
                                </div>
                                <div class="form-field">
                                    <label class="label">{{'newJourney.ends' | t}}</label>
                                    <span v-if="rule.periodicSendType===1" class='time-text'>
                                            {{'common.noOfTimes' | t}} {{rule.periodicSendValue}}{{'visualization.times' | t}} {{'form.after' | t}}
                                        </span>
                                    <span v-if="rule.periodicSendType===2" class='time-text'>
                                            {{'common.noOfDays' | t}} {{rule.periodicSendValue}} {{'time.day' | t}} {{'form.after' | t}}
                                        </span>
                                    <span v-if="rule.periodicSendType===3" class='time-text'>
                                            {{'common.absoluteDate' | t}} {{rule.periodicSendValue}}
                                        </span>
                                </div>
                            </template>
                            <!--格式类型-->
                            <div class="form-field" v-if="rule.formatType">
                                <label class="label">{{'contact.formatType' | t}}</label>
                                <span>{{rule.formatType}}</span>
                            </div>
                            <!--格式为csv的编码方式-->
                            <div class="form-field" v-if="rule.formatType === 'CSV'">
                                <label class="label">{{'contact.dataFormat' | t}}</label>
                                <span>{{rule.dataFormat}}</span>
                            </div>
                            <!--邮件主题-->
                            <div class="form-field" v-if="rule.emailSubject">
                                <label class="label">{{'contact.emailSubject' | t}}</label>
                                <span>{{rule.emailSubject}}</span>
                            </div>
                            <!--邮箱-->
                            <div class="form-field flex">
                                <label class="label">{{'form.receiveMail' | t}}</label>
                                <div class="field-group">
                                    <p v-for="mail in rule.emailList">{{mail}}</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </transition-group>
            </div>
        </div>
        <!--        日志弹窗-->
        <modal :title="$t('form.logRecord')" size="lg" v-if="logFlag" @close="closeLogModal" class="log-modal">
            <div class="log-list-header">
                <div class="form-field">
                    <label for="time" class="">{{'form.time' | t}}</label>
                    <date-range format="YYYY-MM-DD" :start="fromDate" :end="toDate" @change="getDate"/>
                </div>
                <div class="form-field">
                    <label for="rule" class="">{{'form.ruleTitle' | t}}</label>
                    <selector :options="rulesList" v-model="ruleId" :search="true"></selector>
                </div>
                <div class="form-field">
                    <label for="type" class="">{{'form.types' | t}}</label>
                    <selector :options="logType" v-model="choseLogType"></selector>
                </div>
                <div class="form-field">
                    <button class="btn btn-theme" @click="inquireLog">{{'form.inquire' | t}}</button>
                </div>
            </div>
            <div class="content-log-list simplify-table">
                <table>
                    <thead>
                    <tr>
                        <th colspan="2">{{'form.types' | t}}</th>
                        <th colspan="8">{{'form.ruleTitleName' | t}}</th>
                        <th colspan="2">{{'form.operationDetail' | t}}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <!--加载前数据-->
                    <tr v-if="loading">
                        <td colspan="12">
                            <inline-loading/>
                        </td>
                    </tr>
                    <!--有数据-->
                    <tr v-else-if="logsList.length != 0" v-for="log in logsList">
                        <td colspan="2" v-if="log.type === 0" class="center-td">{{'form.added' | t}}</td>
                        <td colspan="2" v-if="log.type === 1" class="center-td">{{'form.modify' | t}}</td>
                        <td colspan="2" v-if="log.type === 2" class="center-td">{{'form.delete' | t}}</td>
                        <td colspan="8" class="name-wrap center-td">{{log.ruleName}}</td>
                        <td class="data-td center-td" colspan="2" @click="optDetail(log)"><span>{{'form.viewMore' | t}}</span></td>
                    </tr>
                    <!--无数据-->
                    <tr v-else>
                        <td colspan="12">
                            <list-search-empty/>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <!--列表分页-->
            <div class="pager-wrapper">
                <div class="amount">{{'journey.totalCount' | t}}
                    <span class="theme-text">
                        {{totalPageElement}}
                    </span>
                    {{'journey.totalUnit' | t}}
                </div>
                <pager :total="logTotalPage" :now="logCurrentPage" @page="handlePage"/>
            </div>
        </modal>
        <!--        操作详情 弹窗-->
        <modal :title="this.$t('form.operationDetail')" v-if="optDetailFlag" @close="optDetailFlag = false">
            <ul>
                <li class="log-detail">
                    <p class="detail-name">{{'form.ruleTitleName' | t}}：</p>
                    <span>{{logDetail.ruleName}}</span>
                </li>
                <li class="log-detail">
                    <p class="detail-name">{{'form.changeItem' | t}}：</p>
                    <span>{{'form.originalValue' | t}}：{{logDetail.details.originalValue}} <br><br>
                        {{'form.currentValue' | t}}：{{logDetail.details.currentValue}}</span>
                </li>
                <li class="log-detail">
                    <p class="detail-name">{{'form.updaterEmail' | t}}：</p>
                    <span>{{logDetail.details.updateName}}</span>
                </li>
                <li class="log-detail">
                    <p class="detail-name">{{'tag.updateTime' | t}}</p>
                    <span>{{logDetail.details.updateDate}}</span>
                </li>
                <li class="log-detail">
                    <p class="detail-name">{{'form.creatorEmail' | t}}</p>
                    <span>{{logDetail.details.createName}}</span>
                </li>
                <li class="log-detail">
                    <p class="detail-name">{{'QRCode.date' | t}}：</p>
                    <span>{{logDetail.details.createDate}}</span>
                </li>
            </ul>
        </modal>
    </div>
</template>
<script>

    import {I18N_STORE_NAME} from '@/locales';
    import {EMAIL_ADDRESS_REGEXP, COMMON_NAME_REGEXP} from '@/common/utils/regs';
    import uniq from 'lodash/uniq';
    import FormQueryFilter from './common/form-query-filter.vue';
    import FormQueryFilterShibang from './components/form-query-filter-shibang.vue';
    import format from 'date-fns/format';
    import {TIME_ZONE_RNAGES, timeZoneToday} from '@/common/utils/timeZone';
    import cloneDeep from 'lodash/cloneDeep';
    import { QuestionnaireApiV1, QuestionnaireApiAuth } from '@/api';
    import { mapState } from 'vuex';

    export default {
        data() {
            return {
                questionnaireFields: [],    // 表单表头列表
                totalElement: 0, //当前数量
                paperName: '', //表单名称
                dateTypeList: [
                    {id: 2, name: this.$t('form.sendNow')},
                    {id: 3, name: this.$t('form.periodSend')},
                    {id: 1, name: this.$t('form.timeSend')},
                ],                          //  发送时间类型
                startDate: [
                    {id: 1, name: this.$t('common.noOfTimes')},
                    {id: 2, name: this.$t('common.noOfDays')},
                    {id: 3, name: this.$t('common.absoluteDate')},
                ],                          // 发送周期类别
                ruleList: [],               // 规则列表
                selectMap: [
                    {id: 'equal', name: this.$t('analysis.equal')},
                    {id: 'notEqual', name: this.$t('analysis.unEqual')},
                    {id: 'contain', name: this.$t('analysis.contains')},
                    {id: 'notContain', name: this.$t('analysis.notContain')},
                    {id: 'isSet', name: this.$t('analysis.value')},
                    {id: 'notSet', name: this.$t('analysis.none')},
                ],                          // 设置规则的条件列表
                saving: false,              // 保存状态

                // 当前页
                nowPage: 1,
                // 每页显示条数
                size: 10,

                //下载详情
                downloadShow: false,
                dataFormatShow: false,      // 导出数据格式展示显隐

                //发送频次
                frequencyList: [
                    { id: 0, name: this.$t('newJourney.days')},
                    { id: 1, name: this.$t('newJourney.hours')},
                    { id: 2, name: this.$t('newJourney.minutes')},
                    { id: 3, name: this.$t('common.month')}
                ],
                timeType: 0, // 选中的发送频次
                logFlag: false, //日志弹窗显隐
                fromDate: '',   // 起始日期
                toDate: '',     // 结束日期
                rulesList: [{id: -1, name: this.$t('form.all')}], //规则
                ruleId: -1,// 日志中选中的规则
                logType: [{id: -1, name: this.$t('form.all')},
                    {id: 0, name: this.$t('form.added')},
                    {id: 1, name: this.$t('form.modify')},
                    {id: 2, name: this.$t('form.delete')}],//日志类型
                choseLogType: -1,//-1:全部，0:新增，1:修改，2:删除
                loading: false,    // 请求表单列表过渡显隐
                logsList: [],//日志列表
                logSize: 10,               // 日志分页每页展示的数据条数
                logTotalPage: 0,           // 日志数据总页数
                totalPageElement: 0,
                logCurrentPage: 1,             // 日志当前页数
                optDetailFlag: false, //c操作详情弹窗显隐
                logDetail:{},//日志详情           
            };
        },
        components: {
            FormQueryFilter,
            FormQueryFilterShibang
        },
        computed: {
            ...mapState({
                //公司类型 2为世邦用户
                companyType: state => state.user.companyType,
                user: state => state.user,
                // 系统语言
                language: state => state[I18N_STORE_NAME].lang
            }),
            
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            },
            crumbs() {
                return [
                    {name: 'home', text: 'Dmartech'},
                    {name: 'journeyFormManagement', text: this.$t('home.leads'), params: {id: 0}},
                    Object.assign({}, this.$route, { text: this.paperName })
                ];
            },
            // 整理过的表单表头列表
            questionnaireSelectordOptions() {
                return this.questionnaireFields.map(q => Object.assign({}, q, {
                    id: q.id,
                    name: this.language === 'en' ? q.content : q.remark
                }));
            },
            // 表单Id
            questionnaireId() {
                return this.$route.query.id;
            },
            // 是否有新建规则
            hasNewRule() {
                return this.ruleList.some(item => item.id < 0);
            },
            // 时区
            timeZone() {
                return TIME_ZONE_RNAGES;
            },
            // 是否开启筛选器 金数据表单类型(formSource === 2) 后台逻辑不支持条件筛选
            filterEnabled() {
                return ~~this.$route.query.formSource !== 2;
            }
        },
        created() {
            this.fromDate = format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
            this.toDate = format(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
        },
        mounted() {
            this.getFormDetails(this.questionnaireId);
            this.getFormTitle(this.questionnaireId);
        },
        methods: {
            //世邦，添加条件簇
            addFilterGroup(rule) {
                const newCondition = {
                    attrId: '', // 属性id
                    function: '',// 1 等于；2 不等于；3 包含；4 不包含；5 有值；6 没值; 7 属于
                    params: [], // 属性值
                    ifBelong: true  // 是否包含属于
                };
                const newFilterGroup = {
                    filterList: [newCondition],
                    filterRelation: 0
                }; 
                rule.filter.filterGroup.push(newFilterGroup);
            },
            //或且的切换
            changeRelation(data,rule) {
                if (data.i !== undefined) {
                    rule.filter.filterGroup[data.i].filterRelation = data.e === 0 ? 1 : 0;
                } else {
                    rule.filter.filterRelation = data.e === 0 ? 1 : 0;
                }
            },
            // 选择导出格式
            testA(e, rule) {
                if (e === 'CSV') {
                    this.dataFormatShow = true;
                    rule.dataFormat = 'utf8';
                } else {
                    this.dataFormatShow = false;
                    rule.dataFormat = '';
                }
            },
            // 获取列表
            getFormDetails(id) {
                this.$loading();
                QuestionnaireApiAuth
                    .downloadDetailAccess({
                        paperId: id,
                        type: 4,
                    })
                    .then(({body: {data: {isAccess}}}) => {
                        if (isAccess === 1) {
                            QuestionnaireApiV1
                                .getFormInfo({
                                    id: id,
                                    page: this.nowPage,
                                    size: this.size,
                                    field: '',
                                    value: ''
                                })
                                .then((res) => {
                                    this.paperName = res.body.data.paperName;
                                    this.totalElement = res.body.data.totalElement;
                                    this.$loaded();
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        } else if (isAccess === 0) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            // 获取表单列表title
            getFormTitle(id) {
                this.$loading();
                QuestionnaireApiAuth
                    .downloadDetailAccess({
                        paperId: id,
                        type: 4,
                    })
                    .then(({body: {data: {isAccess}}}) => {
                        if (isAccess === 1) {
                            QuestionnaireApiV1
                                .getFormTitle({id})
                                .then(({body: {data: {questionsList}}}) => {
                                    this.questionnaireFields = questionsList;
                                    // 获取表头列表后再获取规则
                                    this.getRuleList();
                                    this.$loaded();
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        } else if (isAccess === 0) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            // 获取规则列表
            getRuleList(type) {
                let ruleType = type ? type : '';
                this.$loading();
                QuestionnaireApiAuth
                    .downloadDetailAccess({
                        paperId: this.questionnaireId,
                        type: 8,
                    })
                    .then(({body: {data: {isAccess}}}) => {
                        if (isAccess === 1) {
                            QuestionnaireApiV1
                                .getFormRules(this.questionnaireId, ruleType)
                                .then(({body: {data: {sendRuleList}}}) => {
                                    let list = sendRuleList;
                                    list.forEach(item => {
                                        item.isEdit = false;
                                        this.saving = false;
                                        if (item.fieldIdList &&
                                            item.fieldIdList.length === this.questionnaireSelectordOptions.length) {
                                            item.allChecked = true;
                                        } else {
                                            item.allChecked = false;
                                        }
                                        this.getFilterRender(item);
                                    });
                                    if (ruleType === 1) {
                                        this.rulesList = this.rulesList.concat(list);
                                        this.rulesList = this.rulesList.filter((x, index)=>{
                                            let ruleIds = [];
                                            this.rulesList.forEach((item) => {
                                                ruleIds.push(item.id);
                                            });
                                            return ruleIds.indexOf(x.id) === index;
                                        });
                                    } else {
                                        this.ruleList = list;
                                    }
                                    this.$loaded();
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        } else if (isAccess === 0) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            //获取的筛选条件并处理内部结构
            getFilterRender(item) {
                if (this.companyType !== 2) {
                    if (item.filterList && item.filterList.length > 0) {
                        item.filterList = {
                            relation: item.filterRelation === 2 ? 1 : 0,
                            conditions: item.filterList
                        };
                        item.filterList.conditions.forEach(filter => {
                            filter.attrId = filter.field;
                            filter.function = filter.filterType;
                            filter.ifBelong = !this.getNotBelongIds().includes(filter.attrId);
                            if (filter.filterType === 7 || filter.filterType === 8) {
                                filter.params = filter.filterValue;
                            } else if (filter.filterType === 9) {
                                filter.params = [];
                                filter.start = filter.filterValue ? filter.filterValue.startTime : '';
                                filter.end = filter.filterValue ? filter.filterValue.endTime : '';
                            } else if (filter.filterType === 10) {
                                filter.params = [];
                                filter.day = filter.filterValue ? filter.filterValue.days : '';
                                filter.relative_type = filter.filterValue ? filter.filterValue.type : '';
                            } else if (filter.filterType === 13) {
                                filter.params = [];
                                filter.start = filter.filterValue ? filter.filterValue.startTime : {};
                                filter.end = filter.filterValue ? filter.filterValue.endTime : {};
                            } else {
                                filter.params = [filter.filterValue];
                            }
                        });
                    } else {
                        item.filterList = {relation: 0, conditions: []};
                    }
                } else {
                    item.filter = {
                        filterRelation: item.filterRelation === 2 ? 1 : 0,
                        filterGroup: []
                    };
                    item.filterList.map((e) => {
                        let filterList = [];
                        e.filterList.map(filter => {
                            filter.attrId = filter.field;
                            filter.function = filter.filterType;
                            filter.ifBelong = !this.getNotBelongIds().includes(filter.attrId);
                            if (filter.filterType === 7 || filter.filterType === 8) {
                                filter.params = filter.filterValue;
                            } else if (filter.filterType === 9) {
                                filter.params = [];
                                filter.start = filter.filterValue ? filter.filterValue.startTime : '';
                                filter.end = filter.filterValue ? filter.filterValue.endTime : '';
                            } else if (filter.filterType === 10) {
                                filter.params = [];
                                filter.day = filter.filterValue ? filter.filterValue.days : '';
                                filter.relative_type = filter.filterValue ? filter.filterValue.type : '';
                            } else if (filter.filterType === 13) {
                                filter.params = [];
                                filter.start = filter.filterValue ? filter.filterValue.startTime : {};
                                filter.end = filter.filterValue ? filter.filterValue.endTime : {};
                            } else {
                                filter.params = [filter.filterValue];
                            }
                            filterList.push(filter);
                        });
                        item.filter.filterGroup.push({
                            filterList : filterList, 
                            filterRelation: e.filterRelation === 2 ? 1 : 0
                        });
                    });
                }
            },
            // 发送时间列表切换
            changeDateType(item) {
                item.periodicSendType = '';
                item.periodicSendValue = '';
                // 默认系统配置时区
                item.timeZone = this.user.timeZone && item.sendType !== 2 ? this.user.timeZone : '';
                item.pushDate = '';
                item.repeatPeriodic = '';
            },
            // 周期发送，结束时间类型切换
            changeByDate(item) {
                item.periodicSendValue = '';
            },
            // 添加一个邮箱输入框
            addEmail(list) {
                if (list.length < 50) {
                    list.push('');
                } else {
                    this.$toast(this.$t('form.maxFifty'), 'warn');
                }
            },
            // 删除一个邮箱输入框
            removeEmail(index, list) {
                list.splice(index, 1);
            },
            // 添加新规则
            addRule() {
                if (this.hasNewRule) {
                    return;
                }
                this.ruleList.unshift({
                    id: -1,
                    name: '',
                    isEdit: true,
                    sendType: 2,
                    emailList: [this.user.email],
                    fieldIdList: [],
                    filterList: {
                        relation: 0,
                        conditions: []
                    },
                    timeZone: '',
                    periodicSendType: 1,
                    allChecked: false,
                    pushDate: '',
                    formatType: 'Excel',
                    dataFormat: '',
                    emailSubject: this.$t('form.formExport'),
                    timeType: 0,
                    filter: {
                        filterGroup: [],
                        filterRelation: 0
                    },
                    dataAmountCheck: false
                });
            },
            // 字段筛选下拉框更改时，全选状态更改
            changeField(rule) {
                if (rule.fieldIdList.length === this.questionnaireSelectordOptions.length) {
                    rule.allChecked = true;
                } else {
                    rule.allChecked = false;
                }
            },
            // 全选checkbox更改
            changeCheckAllStatus(rule, e) {
                // 全选
                if (e) {
                    rule.fieldIdList = this.questionnaireSelectordOptions.map(item => item.id);
                } else {
                    rule.fieldIdList = [];
                }
            },
            // 添加筛选条件
            addFilter(item) {
                if (item.filterList.conditions.length >= 30) {
                    this.$toast(this.$t('form.conditionMore30'), 'warn');
                    return;
                }
                const newCondition = {
                    attrId: '', // 属性id
                    function: '',// 1 等于；2 不等于；3 包含；4 不包含；5 有值；6 没值; 7 属于
                    params: [], // 属性值
                    ifBelong: true  // 是否包含属于
                };
                item.filterList.conditions.push(newCondition);
            },
            // update、change 筛选条件
            updateOrChangeFilter(item,newFilter) {
                let target = newFilter.conditions[newFilter.position];
                let attrIds = target ? target.attrId : null;
                if (attrIds !== null) {
                    newFilter.conditions[newFilter.position].ifBelong = true;
                    // 时间类型字段，关系值不包含属于
                    if (this.getNotBelongIds().includes(attrIds)) {
                        newFilter.conditions[newFilter.position].ifBelong = false;
                    }
                }

                item.filterList = newFilter;
            },
            //过滤筛选条件不完整的数据
            filterGroupRender(filterGroup,index) {
                let filterGroupCopy = [];
                filterGroup.map((g) => {
                    let list = [];
                    g.filterList.map((filter) => {
                        if (!filter.attrId.toString()) return;
                        list.push(filter);
                    });
                    if (list.length !== 0) {
                        filterGroupCopy.push({filterList : list, filterRelation: g.filterRelation});
                    }
                });
                this.ruleList[index].filter.filterGroup = filterGroupCopy;
            },
            // 筛选条件-相对时段区间校验
            relativeRangeValid (filterList) {
                const relativeRangeList = filterList
                    .filter(item => item.function === 13);
                const res = relativeRangeList.length ? relativeRangeList.every(e => {
                    // 开始时间为空校验
                    let sVolidToday = (e.start.type === 0 && e.start.days && e.start.time);
                    let sVolidPass = (e.start.type === 1 && e.start.time);
                    // 结束时间为空校验
                    let eVolidToday = (e.end.type === 0 && e.end.days && e.end.time);
                    let eVolidPass = (e.end.type === 1 && e.end.time);
                    // 是否为空校验
                    let noEmptyResult = (sVolidToday && eVolidToday) ||
                        (sVolidToday && eVolidPass) ||
                        (sVolidPass && eVolidToday) ||
                        (sVolidPass && eVolidPass);
                    // 结束时间大于开始时间校验
                    let startAndEnd = true;
                    let sTimeArr = e.start.time.split(':');
                    let eTimeArr = e.end.time.split(':');
                    let endGreatStart = (sTimeArr[0] * 3600 + sTimeArr[1] * 60 + sTimeArr[2] * 1) <
                        (eTimeArr[0] * 3600 + eTimeArr[1] * 60 + eTimeArr[2] * 1);
                    if (e.start.type === 1 && e.end.type === 0) startAndEnd = false;
                    if (e.start.type === 1 && e.end.type === 1 && !endGreatStart) startAndEnd = false;
                    if (e.start.type === 0 && e.end.type === 0) {
                        if (e.start.days === e.end.days && !endGreatStart) startAndEnd = false;
                        if (e.start.days < e.end.days) startAndEnd = false;
                    }
                    // 校验不通过时提示
                    if (!noEmptyResult) {
                        this.$toast(this.$t('form.complateFilterCondition'), 'warn');
                    } else if (!startAndEnd) {
                        this.$toast(e.name + this.$t('form.relativeRangeVolid'), 'warn');
                    }
                    return noEmptyResult && startAndEnd;
                }) : true;
                return res;
            },
            // 各规则之间的发送时间不能相同
            pushDateValid(item) {
                if (!item.pushDate) {
                    this.$toast(this.$t('form.complatePushDate'), 'warn');
                    return false;
                }
                let exSelfList = this.ruleList
                    .filter(rule => item.id !== rule.id);
                let notRepeat = exSelfList.length ? exSelfList.every(e => {
                    return this.getCurrentTime(item.timeZone, item.pushDate) !==
                        this.getCurrentTime(e.timeZone, e.pushDate);
                }) : true;
                if (!notRepeat) this.$toast(this.$t('form.pushDateDuplicated'), 'warn');
                return notRepeat;
            },
            // 时区转换
            /**
             * @param timeZone { String }   目标时区参数  默认东八区北京时间
             * @param timeStr { String }   目标时区的时间参数
             */
            getCurrentTime(timeZone,timeStr) {
                if (!timeZone) timeZone = '+08:00';
                // 目标时区与格林尼治时区差值毫秒数
                let zoneOffset = timeZone.split(':')[0] * 3600000;
                let zoneOffsetHalf = timeZone.split(':')[1] !== '00' ? timeZone.split(':')[1] * 60000 : 0;
                let zoneOffsetTotal = zoneOffset + zoneOffsetHalf;
                // 本地时间与格林尼治时区差值毫秒数
                let localOffset = -(new Date().getTimezoneOffset() * 60000);
                // 本地时间与目标时区差值毫秒数
                let totalOffset = localOffset - zoneOffsetTotal;
                // 目标时区时间转为本地时区时间毫秒数
                let localTime = new Date(timeStr).getTime() + totalOffset;
                return localTime;
            },
            async confirmToAddRule(item,index) {
                if (this.saving) return;
                this.saving = true;
                // 规则名称校验
                if (item.name === '') {
                    this.$toast(this.$t('form.nameNoEmpty'), 'warn');
                    this.saving = false;
                    return;
                }
                if (!COMMON_NAME_REGEXP.test(item.name)) {
                    this.$toast(`${this.$t('form.ruleName')}${this.$t('common.nameSpecial')}`, 'warn');
                    this.saving = false;
                    return;
                }
                // 筛选字段校验
                if (item.fieldIdList.length === 0) {
                    this.$toast(this.$t('form.selectFilter'), 'warn');
                    this.saving = false;
                    return;
                }
                if (this.companyType !== 2) {
                    // 筛选条件-相对时段区间校验
                    if (!this.relativeRangeValid(item.filterList.conditions)) {
                        this.saving = false;
                        return;
                    }
                } else {
                    let rangeValid = item.filter.filterGroup.every(filterArr => {
                        return this.relativeRangeValid(filterArr.filterList);
                    });
                    if (!rangeValid) {
                        this.saving = false;
                        return;
                    }
                }
                // 发送时间必须间隔1分钟
                if (item.sendType !== 2 && !this.pushDateValid(item)) {
                    this.saving = false;
                    return;
                }
                if (this.companyType === 2) this.filterGroupRender(item.filter.filterGroup,index);
                // 发送时间校验
                // 周期发送
                if (item.sendType === 3 &&
                    (item.periodicSendValue === '' ||
                        item.timeZone === '' ||
                        item.pushDate === '' ||
                        item.periodicSendType === '' ||
                        item.repeatPeriodic === '')) {
                    this.$toast(this.$t('form.notData'), 'warn');
                    this.saving = false;
                    return;
                }

                // 周期发送拦截开始时间晚于结束时间。
                let pushDate = new Date(item.pushDate).getTime();
                let periodicSend = new Date(item.periodicSendValue).getTime();
                if (item.sendType === 3 && item.periodicSendType === 3 && periodicSend - pushDate < 0) {
                    this.saving = false;
                    return this.$toast(this.$t('analysis.valueTimeTip'), 'warn');
                }

                // 定时发送
                if (item.sendType === 1 && (item.pushDate === '' || item.timeZone === '')) {
                    this.$toast(this.$t('form.notData'), 'warn');
                    this.saving = false;
                    return;
                }
                if (!item.formatType) {
                    this.$toast(this.$t('form.emptyFormatType'), 'warn');
                    this.saving = false;
                    return;
                }
                if (!item.emailSubject) {
                    this.$toast(this.$t('form.emptyEmailSubject'), 'warn');
                    this.saving = false;
                    return;
                }
                // 邮箱校验
                let validEmails = item.emailList
                    .map((address) => address)
                    .filter(address => EMAIL_ADDRESS_REGEXP.test(address));
                if (validEmails.length === 0) {
                    this.$toast(this.$t('form.atLeastOneEmail'), 'warn');
                    this.saving = false;
                    return;
                }
                if (this.isHw){
                    let emailIsHuaWei = validEmails.map((address) => address).filter(address => (address.includes('@huawei.com') || address.includes('@qdum.com')));
                    if (validEmails.length !== emailIsHuaWei.length) {
                        this.$toast(this.$t('common.emailTypeWaring'), 'warn');
                        this.saving = false;
                        return;
                    }
                }

                let notice = '';
                // 如果有重复邮箱，不会重复发送
                if (uniq(item.emailList).length !== item.emailList.length) {
                    notice += this.$t('material.repeatAddressTip') + this.$t('punctuation.period');
                }
                // 如果有不合格的邮箱，不会给它们发送
                if (validEmails.length !== item.emailList.length) {
                    notice += this.$t('material.badEmlNoConfirm');
                }

                if (notice) {
                    let confirmed = await this.$confirm(this.$t('common.notice'), notice);
                    if (confirmed) {
                        this.saveRule(item, validEmails);
                    }
                    this.saving = false;
                    return;
                }
                this.saveRule(item, validEmails);
            },
            // 保存规则
            saveRule(item, validEmails) {
                let obj = {filterList: []};
                obj.emailList = [...new Set(validEmails)];
                obj.fieldIdList = item.fieldIdList;
                this.filterRender(item,obj);
                obj.id = item.id > 0 ? item.id : '';
                obj.name = item.name;
                obj.sendType = item.sendType;
                obj.periodicSendType = item.periodicSendType;
                obj.periodicSendValue = item.periodicSendValue;
                obj.repeatPeriodic = item.repeatPeriodic;
                obj.pushDate = item.pushDate;
                obj.timeZone = item.timeZone;
                obj.paperId = this.questionnaireId;
                obj.formatType = item.formatType;
                obj.dataFormat = item.dataFormat;
                obj.emailSubject = item.emailSubject;
                obj.timeType = item.timeType;
                obj.dataAmountCheck = item.dataAmountCheck;
                QuestionnaireApiV1
                    .saveRule(obj)
                    .then(() => {
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                        this.getRuleList();
                    })
                    .catch(() => {
                        this.saving = false;
                    });
            },
            //筛选条件的逻辑处理
            filterRender(item,obj) {
                //世邦
                if (this.companyType === 2) {
                    obj.filterRelation = item.filter.filterRelation === 1 ? 2 : 1;
                    item.filter.filterGroup.map((e) => {
                        let filterList = [];
                        e.filterList.map((elm) => {
                            let value = '';
                            if (elm.function === 7 || elm.function === 8) {
                                value = elm.params;
                            } else if (elm.function === 9 || elm.function === 13) {
                                value = {
                                    startTime: elm.start,
                                    endTime: elm.end,
                                };
                            } else if (elm.function === 10) {
                                value = {
                                    days: elm.day,
                                    type: elm.relative_type,
                                };
                            } else {
                                value = elm.params[0];
                            }
                            filterList.push({
                                field: elm.attrId,
                                filterType: elm.function,
                                filterValue: value,
                                type: elm.type
                            });
                        });
                        if (filterList.length !== 0) obj.filterList.push({
                            filterList : filterList, 
                            filterRelation: e.filterRelation === 1 ? 2 : 1
                        });
                    });
                } else {
                    //标准
                    item.filterList.conditions.map(elm => {
                        let value = '';
                        if (elm.function === 7 || elm.function === 8) {
                            value = elm.params;
                        } else if (elm.function === 9 || elm.function === 13) {
                            value = {
                                startTime: elm.start,
                                endTime: elm.end,
                            };
                        } else if (elm.function === 10) {
                            value = {
                                days: elm.day,
                                type: elm.relative_type,
                            };
                        } else {
                            value = elm.params[0];
                        }
                        obj.filterList.push({
                            field: elm.attrId,
                            filterType: elm.function,
                            filterValue: value,
                            type: elm.type
                        });
                    });
                    obj.filterRelation = item.filterList.relation ? 2 : 1;
                }
            },
            changeEditStatus(item) {
                item.isEdit = !item.isEdit;
            },
            // 删除规则
            deleteRule(item) {
                this.$confirm(this.$t('common.delete'), this.$t('form.deleteConfirm'))
                    .then(sure => {
                        if (sure) {
                            if (item.id < 0) {
                                this.ruleList.shift();
                            } else {
                                QuestionnaireApiV1
                                    .deletRule(item.id)
                                    .then(() => {
                                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                                        this.getRuleList();
                                    });
                            }
                        }
                    });
            },
            // 字段筛选名字
            toName(ids) {
                if (ids && ids.length > 0) {
                    let nameArr = [];
                    this.questionnaireSelectordOptions.forEach(option => {
                        ids.forEach(id => {
                            if (id === option.id) {
                                nameArr.push(option.name);
                            }
                        });
                    });
                    return nameArr;
                }
            },
            // 筛选条件名字
            toNameFilter(conditions) {
                let nameArr = [];
                let con = cloneDeep(conditions);
                this.questionnaireSelectordOptions.map(option => {
                    con.map(item => {
                        if (item.attrId === option.id) {
                            let relation = '';
                            switch (item.function) {
                                case 1:
                                    relation = this.$t('analysis.equal');
                                    break;
                                case 2:
                                    relation = this.$t('analysis.unEqual');
                                    break;
                                case 3:
                                    relation = this.$t('analysis.contains');
                                    break;
                                case 4:
                                    relation = this.$t('analysis.notContain');
                                    break;
                                case 5:
                                    relation = this.$t('analysis.value');
                                    break;
                                case 6:
                                    relation = this.$t('analysis.none');
                                    break;
                                case 7:
                                    relation = this.$t('analysis.belong');
                                    break;
                                case 8:
                                    relation = this.$t('swarm.notBelong');
                                    break;
                                case 9:
                                    relation = this.$t('analysis.absoluteTime');
                                    break;
                                case 10:
                                    relation = this.$t('analysis.relativeTime');
                                    break;
                                case 11:
                                    relation = this.$t('analysis.value');
                                    break;
                                case 12:
                                    relation = this.$t('analysis.none');
                                    break;
                                case 13:
                                    relation = this.$t('analysis.relativeTimeInterval');
                                    break;
                            }
                            if (item.function === 13) {
                                let startDaysNum = item.filterValue.startTime.days ?
                                    this.$t('controller.the') + item.filterValue.startTime.days + this.$t('time.day') : '';
                                let endDaysNum = item.filterValue.endTime.days ?
                                    this.$t('controller.the') + item.filterValue.endTime.days + this.$t('time.day') : '';
                                let startType = item.filterValue.startTime.type === 0 ?
                                    this.$t('time.past') :
                                    this.$t('common.today');
                                let endType = item.filterValue.endTime.type === 0 ?
                                    this.$t('time.past') :
                                    this.$t('common.today'); 
                                item.start = startType + ' ' + startDaysNum + ' ' + item.filterValue.startTime.time;
                                item.end = endType + ' ' + endDaysNum + ' ' + item.filterValue.endTime.time;
                            }
                            nameArr.push({name: option.name,relation: relation,
                                value: item.function === 7 || item.function === 8 ?
                                    item.params.toString() : item.params[0],
                                day: item.day,relative_type: item.relative_type,start: item.start,end: item.end});
                        }
                    });
                });
                return nameArr;
            },
            // 时区名
            toZoneTimeName(timeZone) {
                let name = '';
                this.timeZone.forEach(option => {
                    if (option.id === timeZone) {
                        name = option.name;
                    }
                });
                return name;
            },
            // 更改时区， 选项重置
            changeTimeZone(rule) {
                rule.periodicSendType = '';
                rule.periodicSendValue = '';
                rule.pushDate = '';
                rule.repeatPeriodic = '';
            },
            // 获取时区下的当前时间
            getTodayDate(timeZone) {
                return format(new Date(timeZoneToday(timeZone)), 'YYYY-MM-DD HH:mm');
            },
            // 获取时间类型字段Id集合
            getNotBelongIds() {
                let notBelongList = this.questionnaireSelectordOptions.filter(list => list.type === 2);
                return notBelongList.map(list => list.id);
            },
            //获取日志列表
            getRuleLogList() {
                QuestionnaireApiAuth
                    .downloadDetailAccess({
                        paperId: this.questionnaireId,
                        type: 11,
                    })
                    .then(({body: {data: {isAccess}}}) => {
                        if (isAccess === 1) {
                            this.getRuleList(1);
                            this.loading = true;
                            this.logFlag = true;
                            QuestionnaireApiV1
                                .getRuleLogList(
                                    this.ruleId,
                                    this.toDate,
                                    this.fromDate,
                                    this.choseLogType,
                                    this.logSize,
                                    this.logCurrentPage,
                                    this.questionnaireId
                                )
                                .then((res) => {
                                    this.logsList = res.body.data.logs;
                                    this.totalPageElement = res.body.data.totalElement;
                                    this.logTotalPage = res.body.data.totalPage;
                                    this.loading = false;
                                })
                                .catch((err) => {
                                    console.error(err);
                                    this.loading = false;
                                });
                        } else if (isAccess === 0) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            inquireLog() {
                this.logCurrentPage = 1;
                this.getRuleLogList();
            },
            // 分页操作
            handlePage(e) {
                this.logCurrentPage = e;
                this.getRuleLogList();
            },
            //    查看日志记录详情
            optDetail(log) {
                this.logDetail = log;
                this.optDetailFlag = true;
            },
            closeLogModal() {
                //关闭日志弹窗后还原初始值
                this.logFlag = false;
                this.rulesList = [{id: -1, name: this.$t('form.all')}];
                this.ruleId = -1;
                this.choseLogType = -1;
                this.logCurrentPage = 1;
                this.fromDate = format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
                this.toDate = format(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
            },
            /**
             * 更改时间
             */
            getDate (date) {
                this.fromDate = date.start;
                this.toDate = date.end;
            },
        }
    };
</script>
<style type="text/scss" lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .report-setting {
        $title-background-color: #f4f5f9;

        .page-head {
            .content-view {
                display: flex;
                justify-content: space-between;
            }
        }

        .page-content {
            .content-view {
                padding-bottom: 300px;
            }
        }

        .log-modal {
            .log-list-header {
                display: flex;
                justify-content: flex-end;

                .form-field {
                    margin-top: 0;
                    margin-right: 10px;
                }
            }

            .content-log-list {
                margin-top: 10px;

                th {
                    padding: 0 10px;
                    text-align: center;
                }

                tr {
                    cursor: default;
                    td {
                        padding: 0;
                        word-wrap: normal;
                    }
                    .center-td {
                        text-align: center;
                    }
                    .name-wrap {
                        text-overflow: inherit;
                        word-break: break-all;
                        white-space: normal;

                    }
                }
                .data-td {
                    color: $green;
                    cursor: pointer;
                }
            }

            .pager-wrapper {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
        }


        .rule-setting {
            svg {
                fill: currentColor;
                height: 14px;
                width: 14px;
            }
        }

        .rule-container {
            @include clearfix();
            border: 1px solid $border-color;
            margin: 16px 32px;
            border-radius: 4px;

            .select-text {
                max-width: 500px;
            }

            .form-field {
                input {
                    &.tiny {
                        width: 4em;
                    }
                }
                .icon-yiwen1 {
                    cursor: pointer;
                    font-size: 14px;
                }
                .has-data-to-send {
                    margin-left: 65px;
                    margin-bottom: 1em;
                }
            }
        }

        .rule-title {
            @include ellipsis;
            height: 40px;
            line-height: 40px;
            padding: 0 20px;
            background: $title-background-color;
            font-size: 14px;
            border-bottom: 1px solid $border-color;

            i.up-down {
                float: right;
                margin-right: 16px;
                width: 0;
                height: 0;
                margin-top: 14px;
                border: 5px solid $color-light-content;
                @include transform(rotate(45deg));

                &.up {
                    border-top-color: transparent;
                    border-left-color: transparent;
                }

                &.down {
                    border-bottom-color: transparent;
                    border-right-color: transparent;
                }
            }
        }

        .rule-content {
            margin-top: 16px;

            .name-text {
                margin-right: 8px;
            }

            .test-input {
                margin-bottom: 8px;
                display: inline-block;
            }

            .add-icon {
                font-size: 16px;
                color: $light-green;
                margin-left: 6px;
                cursor: pointer;
                vertical-align: middle;
                @include user-select(none);
            }

            .delete-icon {
                font-size: 16px;
                color: $light-red;
                margin-left: 6px;
                cursor: pointer;
                vertical-align: middle;
                @include user-select(none);
            }

            .theme-text {
                margin: 0 16px;
            }

            .field-group {
                .time-text {
                    margin-left: 8px;
                }
            }

            .frequency {
                width: 60px;
            }
        }

        .rule-footer {
            width: 100%;
            padding: 8px 16px 8px 0;
            border-top: 1px solid $border-color;
            text-align: right;
            box-sizing: border-box;
        }

        .periodic {
            .selector, .input {
                flex: none;
                margin-right: 3px;
            }
        }

        .query-filter-condition-value.many {
            line-height: 22px;
        }

        .log-detail{
            padding: 10px;
            border-bottom: 1px solid $border-color;
            display: flex;
            .detail-name {
                display: inline-block;
                width: 105px;
                flex-shrink: 0;
            }
        }
    }
</style>
