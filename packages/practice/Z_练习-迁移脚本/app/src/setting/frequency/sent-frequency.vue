<template>
    <!--有关于发送频率限制的页面-->
    <div class="white-bg padding sent-frequency">
        <!--发送频次限额-->
        <div class="frequency-switch-model form-field">
            <div class="frequency-switch-content">
                <span> {{'frequency.sentFrequency' | t}}</span>
                <p class="frequency-describe disabled-text">{{'frequency.restrictedDescription' | t}}</p>
                <p class="disabled-text disable">{{'frequency.frequencylimit' | t}}</p>
                <switch-button class="switch" v-model="ruleObj.openStatus">
                    {{ruleObj.openStatus ? $t('frequency.open') : $t('frequency.close')}}
                </switch-button>
            </div>
            <button class="frequency-theme-text" @click="downExport">{{'frequency.frequencyEmail' | t}}</button>
        </div>
        <!--运行模式-->
        <div class="operation-mode form-field">
            <p class="title">{{'frequency.operatingMode' | t}}</p>
            <div class="mode-inner">
                <radio :source="0" v-model="ruleObj.runMode">{{'frequency.globalMode' | t}}</radio>
                <radio :source="1" v-model="ruleObj.runMode">{{'frequency.conditionMode' | t}}</radio>
            </div>
        </div>
        <!-- 频次周期 -->
        <p class="cycle">{{'frequency.frequencyperiod' | t}}:({{'frequency.currentperiod' | t}}:<span class="date">{{sentRuless}}<span class="transverse">-</span>{{sentrules}}</span>)</p>
        <!--运行周期-->
        <div class="operation-cycle form-field">
            <p>{{'frequency.loop' | t}}</p>
            <div class="custom-content">
                <selector class="lg" :options="cycleList" v-model="ruleObj.periodType"></selector>
                <!--有关于运行周期中自定义模块(天，周，月)-->
                <selector class="custom-selector" v-if="ruleObj.periodType == 'custom' " :options="customList"
                          v-model="ruleObj.customType"></selector>
                <div v-if="ruleObj.periodType == 'custom' ">
                    <div class="custom-message"
                         v-if="ruleObj.customType == 'day' || ruleObj.customType == 'week'|| ruleObj.customType == 'month' ">
                        {{'frequency.every' | t}}
                        <number-input class="input tiny" v-model="ruleObj.periodNumber"/>
                        <span v-if="ruleObj.customType == 'day' ">{{'frequency.loopDay' | t}}</span>
                        <span v-if="ruleObj.customType == 'week' ">{{'frequency.loopWeek' | t}}</span>
                        <span v-if="ruleObj.customType == 'month' ">{{'frequency.loopMonth' | t}}</span>
                    </div>
                </div>
            </div>
        </div>
        <!--条件模式-->
        <div v-if="ruleObj.runMode === 1" class="condition-mode form-field">
            <!--条件字段-->
            <div class="condition-field form-field">
                <p class="title">{{'frequency.conditionField' | t}}</p>
                <p class="disabled-text">{{'frequency.conditionFieldDes' | t}}</p>
                <div class="field-group">
                    <selector class="lg" :options="strFieldList" search v-model="ruleObj.conditionField"
                              :disabled="conditionRuleList.length > 0"></selector>
                    <span>{{'frequency.updateConditionFieldDes' | t}}</span>
                </div>
            </div>
            <!--限制规则-->
            <div class="rules form-field">
                <p class="title">{{'frequency.restrictionRules' | t}}</p>
                <p class="disabled-text">{{'frequency.maxRules' | t}}</p>
            </div>
            <div class="form-field btn-areas">
                <!--批量删除按钮-->
                <button class="btn btn-md btn-theme" @click="delMore">{{'form.del' | t}}</button>
                <button class="btn btn-md btn-theme" @click="createNewRule">{{'frequency.createNewRule' | t}}</button>
            </div>

            <!--规则列表-->
            <div class="simplify-table">
                <table>
                    <thead>
                    <tr>
                        <th width="28">
                            <checkbox v-model="selectAllConditionRule"></checkbox>
                        </th>
                        <th>{{'sharing.rulesName' | t}}</th>
                        <th>{{'frequency.email' | t}}</th>
                        <th>{{'frequency.sms' | t}}</th>
                        <th>{{'frequency.mms' | t}}</th>
                        <th>{{'frequency.wechatService' | t}}</th>
                        <th>{{'frequency.wechatTemplate' | t}}</th>
                        <th>{{'sharing.operation' | t}}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(conditionRule, index) in conditionRuleList" :key="index"
                        @click="editConditionRule(index)">
                        <td @click.stop>
                            <checkbox :source="index" v-model="selectedConditionRule"></checkbox>
                        </td>
                        <td :title="conditionRule.ruleName">{{conditionRule.ruleName}}</td>
                        <td>{{transName(conditionRule.email)}}</td>
                        <td>{{transName(conditionRule.sms)}}</td>
                        <td>{{transName(conditionRule.mms)}}</td>
                        <td>{{transName(conditionRule.wechatService)}}</td>
                        <td>{{transName(conditionRule.wechatTemplate)}}</td>
                        <td>
                            <svg aria-hidden="true"
                                 class="action-icon icon-pencil"
                                 @click.stop="editConditionRule(index)" v-title:top="$t('common.edit')">
                                <use xlink:href="#icon-round-pencil"></use>
                            </svg>
                            <svg aria-hidden="true"
                                 class="action-icon icon-delete"
                                 @click.stop="deleteConditionRule(index)" v-title:top="$t('common.del')">
                                <use xlink:href="#icon-round-close"></use>
                            </svg>
                        </td>
                    </tr>
                    <tr v-if="conditionRuleList.length === 0">
                        <td class="empty" colspan="8">
                            <list-empty/>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!--频次限额table列表-->
        <div v-if="ruleObj.runMode === 0" class="simplify-table form-field">
            <p>{{'frequency.sendingAmount' | t}}</p>
            <table>
                <thead>
                <tr>
                    <td>{{'frequency.messageType' | t}}</td>
                    <td>{{'frequency.upperLimit' | t}}</td>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{{'frequency.email' | t}}</td>
                    <td>
                        <radio :source="1" v-model="globalModeRule.emailLimit"></radio>
                        <number-input class="input sm" v-model="globalModeRule.email"
                                      :disabled="globalModeRule.emailLimit === -1"
                                      :min="1" max="999"
                                      :placeholder="$t('frequency.inputTxt')"
                                      maxlength="3"/>
                        <span>{{'frequency.times' | t}}</span>
                        <radio :source="-1" v-model="globalModeRule.emailLimit"></radio>
                        {{'frequency.restriction' | t}}
                    </td>
                </tr>
                <tr>
                    <td>{{'frequency.sms' | t}}</td>
                    <td>
                        <radio :source="1" v-model="globalModeRule.smsLimit"></radio>
                        <number-input class="input sm" v-model="globalModeRule.sms"
                                      :disabled="globalModeRule.smsLimit === -1"
                                      :min="1" max="999"
                                      :placeholder="$t('frequency.inputTxt')"
                                      maxlength="3"/>
                        <span>{{'frequency.times' | t}}</span>
                        <radio :source="-1" v-model="globalModeRule.smsLimit"></radio>
                        {{'frequency.restriction' | t}}
                    </td>
                </tr>
                <tr>
                    <td>{{'frequency.mms' | t}}</td>
                    <td>
                        <radio :source="1" v-model="globalModeRule.mmsLimit"></radio>
                        <number-input class="input sm" :disabled="globalModeRule.mmsLimit === -1"
                                      v-model="globalModeRule.mms"
                                      :min="1" max="999"
                                      :placeholder="$t('frequency.inputTxt')"
                                      maxlength="3"/>
                        <span>{{'frequency.times' | t}}</span>
                        <radio :source="-1" v-model="globalModeRule.mmsLimit"></radio>
                        {{'frequency.restriction' | t}}
                    </td>
                </tr>
                <tr>
                    <td>{{'frequency.wechatService' | t}}</td>
                    <td>
                        <radio :source="1" v-model="globalModeRule.wechatServiceLimit"></radio>
                        <number-input class="input sm" :disabled="globalModeRule.wechatServiceLimit === -1"
                                      v-model="globalModeRule.wechatService"
                                      :min="1" max="999"
                                      :placeholder="$t('frequency.inputTxt')"
                                      maxlength="3"/>
                        <span>{{'frequency.times' | t}}</span>
                        <radio :source="-1" v-model="globalModeRule.wechatServiceLimit"></radio>
                        {{'frequency.restriction' | t}}
                    </td>
                </tr>
                <tr>
                    <td>{{'frequency.wechatTemplate' | t}}</td>
                    <td>
                        <radio :source="1" v-model="globalModeRule.wechatTemplateLimit"></radio>
                        <number-input class="input sm" :disabled="globalModeRule.wechatTemplateLimit === -1"
                                      v-model="globalModeRule.wechatTemplate" :min="1" max="999"
                                      :placeholder="$t('frequency.inputTxt')"
                                      maxlength="3"/>
                        <span>{{'frequency.times' | t}}</span>
                        <radio :source="-1" v-model="globalModeRule.wechatTemplateLimit"></radio>
                        {{'frequency.restriction' | t}}
                    </td>
                </tr>
                </tbody>
            </table>  
        </div>
        <!---底部选择-->
        <ul class="quota-choose form-field">
            <li>{{'frequency.limitSend' | t}}</li>
            <li>
                <radio :source="1" v-model="ruleObj.limitStatus"></radio>
                {{'frequency.sending' | t}}
            </li>
            <li>
                <radio :source="2" v-model="ruleObj.limitStatus"></radio>
                {{'frequency.noSending' | t}}
            </li>
            <li class="quota-btn">
                <button v-if="recive" class="btn btn-md btn-theme"
                        id="enterprise_frequency_add_rule"
                        :disabled="$has('enterprise_frequency_add_rule')"
                        @click="saveRules">
                    {{'frequency.save' | t}}
                </button>
                <button type="button" class="btn btn-md btn-theme" disabled v-if="!recive">
                    {{'frequency.recive' | t}}
                </button>
                <span v-if="!recive">{{'frequency.Tips' | t}}</span>
            </li>
        </ul>
        <!--保存设置规则-->
        <modal :title="$t('frequency.notice')" v-if="rulesSave" @close="rulesSave = false">
            <p>{{'frequency.saveConfirm' | t}} </p>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-white" :value="$t('frequency.restoreSettings')"
                       @click="closelRulesModal">
                <input type="button" class="btn btn-md btn-theme" :value="$t('frequency.continueSave')"
                       @click="continueSave">
            </template>
        </modal>
        <!--下载当前运行周期发送频次日志(输入邮箱模块)-->
        <modal :title="$t('frequency.downloadLog')" v-if="exportModel"
               @close="closeExportModal">
            <div class="form-field flex">
                <label class="label">{{'frequency.timespan' | t}}</label>
                <!--<span>{{periodTime}}{{'frequency.upToNow' | t}}</span>-->
                <div class="filed-group">
                    <selector class="lg" :options="periodTime" v-model="exportDate"/>
                    <p class="disabled-text">{{'frequency.exportDateNote' | t}}</p>
                </div>
            </div>
            <div class="form-field">
                <label class="label">{{'contact.formatType' | t}}</label>
                <radio :source="'Excel'" v-model="exportFileType">Excel</radio>
                <radio :source="'CSV'" v-model="exportFileType" @input="selectExportCSV">CSV</radio>
            </div>
            <div class="form-field" v-if="exportFileType === 'CSV'">
                <label class="label">{{'contact.dataFormat' | t}}</label>
                <radio :source="'utf8'" v-model="exportCSVDataType">utf8</radio>
                <radio :source="'gb18030'" v-model="exportCSVDataType">gb18030</radio>
            </div>
            <div class="form-field">
                <label class="label">{{'contact.emailSubject' | t}}</label>
                <input type="text" class="input" v-model.trim="exportTheme" maxlength="60">
            </div>
            <div class="form-field">
                <label class="label">{{'frequency.emailAddress' | t}}</label>
                <input class="input" v-model.trim="email" type="text"
                       :placeholder="$t('frequency.exportAddress')" maxlength="50">
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme"
                       @click="exportBtn" :value="$t('frequency.export')">
            </template>
        </modal>
        <!--点击导出后的确认弹框-->
        <modal :title="$t('frequency.notice')" v-if="exportSent" @close="closeExportSentLog">
            <p>
                {{'frequency.exportDescribe' | t}}
            </p>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme"
                       @click="exportSentLog" :value="$t('frequency.confirm')">
            </template>
        </modal>
        <!--编辑、新增规则条件-->
        <confirm :size="'lg'" :title="$t('frequency.createModeTitle')" :autoConfirm="false"
                 v-if="showCreateConditionRule"
                 @cancel="hiddenCreateConditionRule" @confirm="saveConditionRule">
            <!--规则名称-->
            <div class="form-field">
                <span class="title">{{'sharing.rulesName' | t}}</span>
                <input type="text" class="input" v-model.trim="conditionRule.name" maxlength="255">
            </div>
            <!--条件设置-->
            <div class="form-field">
                <p class="title">{{'frequency.conditionSetting' | t}}</p>
                <p class="disabled-text">{{'frequency.conditionSettingDes' | t}}</p>
            </div>
            <!--筛选字段-->
            <div class="form-field">
                <p class="title">{{'frequency.filterFieldDes' | t}}</p>
                <query-filter-condition-value
                        :maxlength="300" :options="sendFieldList" inputType="many"
                        valueType="text" :maxTag="99" v-model="conditionRule.sendField"/>
                <span class="action-icon icon icon-pencil" @click="editByRawValue"></span>
                <!--大小写功能暂不做-->
                <!--<p>-->
                <!--<checkbox v-model="conditionRule.fieldCaseSensitive">{{'frequency.fieldCaseSensitive' | t}}</checkbox>-->
                <!--</p>-->
            </div>
            <!--发送限制-->
            <div class="form-field">
                <p class="title">{{'frequency.upperLimit' | t}}</p>
                <div class="simplify-table">
                    <table>
                        <thead>
                        <tr>
                            <th>{{'frequency.channel' | t}}</th>
                            <th>{{'frequency.limitQuantity' | t}}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="sendLimit in conditionRuleSendLimit" :key="sendLimit.id">
                            <td>{{sendLimit.name}}</td>
                            <td>
                                <radio :source="1" v-model="sendLimit.isValue"></radio>
                                <number-input class="input sm" :disabled="sendLimit.isValue === 2"
                                              v-model="sendLimit.value"
                                              :min="1" max="999"
                                              :placeholder="$t('frequency.inputTxt')"
                                              maxlength="3"/>
                                <span>{{'frequency.times' | t}}</span>
                                <radio :source="2" v-model="sendLimit.isValue"></radio>
                                {{'frequency.restriction' | t}}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </confirm>

        <!--批量输入输入框-->

        <confirm v-if="editRawValues" :title="$t('analysis.batchInput')"
                 :autoConfirm="false" @cancel="reset" @confirm="digestRawValues">
            <textarea class="textarea full-width" rows="20" autofocus="true" v-model="rawData.value"
                      @input="rebase"></textarea>
            <span class="disabled-text">{{'analysis.note' | t}}</span>
            <!--<span class="pull-right" :class="{'red-text':this.batchCount === 99}">{{batchCount}}/99</span>-->
        </confirm>

        <!--字段值重复提示弹窗-->

        <confirm v-if="showFieldRepeatModal" :title="$t('frequency.notice')"
                 @cancel="closeCheckFieldRepeat" @confirm="closeCheckFieldRepeat">
            <p>{{'frequency.filedRepeatNote' | t}}</p>
            <ul class="field-repeat-list">
                <li v-for="(filed, index) in fieldRepeatList" :key="index">{{filed}}</li>
            </ul>
        </confirm>

        <div v-if="!recive" class="tip">
            <p>{{'frequency.Tips' | t}} <span class="dot"></span></p>
        </div>
    </div>
</template>

<script type="text/babel">
    import {EMAIL_ADDRESS_REGEXP} from '@/common/utils/regs';
    import QueryFilterConditionValue from '../../analysis/components/query-filter-condition-value.vue';
    import {uniq, intersection, difference, flattenDeep} from 'lodash';
    import {I18N_STORE_NAME} from '@/locales';
    import { ContactApi, ContactExportApiV3, ManageApi } from '@/api';
    import format from 'date-fns/format';

    export default {
        data() {
            return {
                // 周期列表
                cycleList: [
                    {name: this.$t('frequency.day'), id: 'day'},
                    {name: this.$t('frequency.week'), id: 'week'},
                    {name: this.$t('frequency.month'), id: 'month'},
                    {name: this.$t('frequency.custom'), id: 'custom'},
                ],

                // 有关于自定义周期列表
                customList: [
                    {name: this.$t('frequency.days'), id: 'day'},
                    {name: this.$t('frequency.weeks'), id: 'week'},
                    {name: this.$t('frequency.months'), id: 'month'},
                ],

                // 有关于保存规则中的各个字段
                ruleObj: {
                    limitStatus: 1,
                    openStatus: false,
                    periodNumber: '',
                    periodType: 'day',
                    customType: '',
                    runMode: 0,                 // 运行模式
                    conditionField: '',         // 条件字段
                    sentRules: []
                },
                sentRuless:'',
                sentrules:'',
                periodTime: [], //数据范围
                rulesSave: false,
                exportModel: false,
                exportSent: false,
                recive: false, //重置中的按钮
                // 下载当前运行周期发送频次日志中需要输入的邮箱
                email: this.$store.state.user.email,
                strFieldList: [],       // 条件字段列表
                conditionRuleList: [],            // 条件规则列表
                selectedConditionRule: [],
                showCreateConditionRule: false,   // 展示新增、编辑条件模式限制规则
                conditionRule: {
                    sendField: [],
                    name: '',
                    fieldCaseSensitive: false
                },                                 // 新增条件模式规则设置
                sendFieldList: [],
                editRawValues: false,              // 展示批量输入模态框
                rawData: {
                    value: ''
                },
                conditionRuleSendLimit: [
                    {
                        id: 1, name: this.$t('frequency.email'), value: '', isValue: 2, key: 'email'
                    },
                    {
                        id: 2, name: this.$t('frequency.sms'), value: '', isValue: 2, key: 'sms'
                    },
                    {
                        id: 3, name: this.$t('frequency.mms'), value: '', isValue: 2, key: 'mms'
                    },
                    {
                        id: 4, name: this.$t('frequency.wechatService'), value: '', isValue: 2, key: 'wechatService'
                    },
                    {
                        id: 5, name: this.$t('frequency.wechatTemplate'), value: '', isValue: 2, key: 'wechatTemplate'
                    }
                ],                                  // 条件发送限制
                exportDate: '',                     // 选择要导出数据的日期
                showFieldRepeatModal: false,        // 字段值重复弹窗显隐
                fieldRepeatList: [],                // 重复字段值集合
                nowAllSendField: [],                // 规则字段值集合
                exportFileType: 'Excel',            // 导出文件类型
                exportCSVDataType: '',              // 导出CSV文件类型时选择的数据类型
                exportTheme: this.$t('frequency.exportDefaultEmailTheme'),  // 导出邮件主题
                globalModeRule: {
                    email: '',
                    mms: '',
                    sms: '',
                    wechatService: '',
                    wechatTemplate: '',
                    emailLimit: -1,
                    mmsLimit: -1,
                    smsLimit: -1,
                    wechatServiceLimit: -1,
                    wechatTemplateLimit: -1
                },                                   // 全局模式配置
                currentEditConditionRule: '',        // 当前编辑的规则
            };
        },
        components: {
            QueryFilterConditionValue
        },
        computed: {
            user() {
                return this.$store.state.user;
            },
            // 华为类型账号
            isHw() {
                return this.user.companyType === 1;
            },
            // 选中全部条件模式规则
            selectAllConditionRule: {
                get() {
                    return this.conditionRuleList.length !== 0 &&
                        this.selectedConditionRule.length === this.conditionRuleList.length;
                },
                set(value) {
                    if (value) {
                        this.selectedConditionRule = this.conditionRuleList.map((rule, index) => index);
                    } else {
                        this.selectedConditionRule = [];
                    }
                    return value;
                }
            },
            lang() {
                return this.$store.state[I18N_STORE_NAME].lang;
            }
        },
        mounted() {
            this.getRuleDetails();
            this.getStatus = setInterval(() => {
                this.checkStatus();
            }, 5000);
            this.getFieldList();

            //华为埋码-CPM同意与偏好管理-营销旅程频次
            if (this.isHw) {
                //UEM埋码
                window.hwa('trackPageView', 'P12031997BD7201');
            }
        },
        beforeRouteLeave(to, from, next) {
            let cancelText = this.$t('frequency.cancelText');
            let confirmText = this.$t('frequency.confirmText');
            this.$confirm(this.$t('frequency.notice'), this.$t('frequency.leavePageNote'), confirmText, cancelText, true)
                .then(res => {
                    if (!res) {
                        clearInterval(this.getStatus);
                        next();
                    }
                });
        },
        beforeDestroy() {
            clearInterval(this.getStatus);
        },
        methods: {
            arrangeSendRules() {
                if (this.ruleObj.runMode === 0) {
                    let rule = this.ruleObj.sentRules[0];
                    this.globalModeRule = {
                        email: rule.email > -1 ? rule.email : '',
                        mms: rule.mms > -1 ? rule.mms : '',
                        sms: rule.sms > -1 ? rule.sms : '',
                        wechatService: rule.wechatService > -1 ? rule.wechatService : '',
                        wechatTemplate: rule.wechatTemplate > -1 ? rule.wechatTemplate : '',
                        emailLimit: rule.email > -1 ? 1 : -1,
                        mmsLimit: rule.mms > -1 ? 1 : -1,
                        smsLimit: rule.sms > -1 ? 1 : -1,
                        wechatServiceLimit: rule.wechatService > -1 ? 1 : -1,
                        wechatTemplateLimit: rule.wechatTemplate > -1 ? 1 : -1
                    };
                    this.conditionRuleList = [];
                } else {
                    this.conditionRuleList = [...this.ruleObj.sentRules];
                    this.globalModeRule = {
                        email: '',
                        mms: '',
                        sms: '',
                        wechatService: '',
                        wechatTemplate: '',
                        emailLimit: -1,
                        mmsLimit: -1,
                        smsLimit: -1,
                        wechatServiceLimit: -1,
                        wechatTemplateLimit: -1
                    };
                }
            },
            // 获取当前规则
            getRuleDetails() {
                ManageApi
                    .getRules()
                    .then(res => {
                        let data = res.body.data;
                        if (data.beginTime !== undefined) {
                            this.sentRuless = data.beginTime;
                            this.sentRuless = format(this.sentRuless, 'YYYY/MM/DD');
                        }
                        if (data.endTime !== undefined) {
                            this.sentrules = data.endTime;
                            this.sentrules = format(this.sentrules, 'YYYY/MM/DD');
                        }
                        // 导出日历时间段选择列表
                        this.periodTime = data.periodTime.map(date => {
                            let names = date.endTime ? `${date.beginTime} ${this.$t('data.to')} ${date.endTime}` :
                                `${date.beginTime} ${this.$t('frequency.upToNow')}`;
                            return {
                                ...date,
                                name: names,
                                id: new Date(date.beginTime).getTime()
                            };
                        });
                        this.ruleObj.runMode = data.runMode || 0;
                        this.ruleObj.limitStatus = data.limitStatus || 1;

                        this.ruleObj.openStatus = data.openStatus || false;
                        if (data.periodNumber) {
                            this.ruleObj.periodNumber = data.periodNumber === -1 ? '' : data.periodNumber;
                        }
                        this.ruleObj.periodType = data.periodNumber > -1 ? 'custom' : data.periodType ? data.periodType : 'day';

                        if (data.periodNumber !== -1) this.ruleObj.customType = data.periodType;

                        if (data.factor) {
                            this.ruleObj.conditionField = JSON.parse(data.factor).fieldId;
                        } else {
                            this.ruleObj.conditionField = '';
                        }

                        this.ruleObj.sentRules = data.sentRules || [];

                        if (this.ruleObj.sentRules.length) {
                            this.arrangeSendRules();
                            // 规则字段值集合
                            this.nowAllSendField = flattenDeep(data.sentRules.map(rule => {
                                if (rule.values && rule.values.length) return rule.values;
                            }));
                        }
                    });
            },
            checkStatus() {
                ManageApi
                    .getCheckStatus()
                    .then(({body: {data}}) => {
                        if (data.isOk === true) {
                            this.recive = true;
                            this.getRuleDetails();
                            this.closeInterval();
                        } else {
                            this.recive = false;
                        }
                    })
                    .catch(() => {
                        this.recive = true;
                        this.closeInterval();
                    });
            },
            closeInterval() {
                clearInterval(this.getStatus);
            },
            // 保存规则提示 && 取消关闭 && 确认保存
            saveRules() {

                if (this.ruleObj.runMode === 0 && !this.globalRuleCheck()) return;

                if (this.ruleObj.runMode === 1 && !this.conditionAllRuleCheck()) return;

                this.rulesSave = !this.rulesSave;
            },
            closelRulesModal() {
                this.rulesSave = !this.rulesSave;
                this.getRuleDetails();
            },
            continueSave() {
                if (this.ruleObj.periodType !== 'custom') {
                    this.ruleObj.periodNumber = -1;
                }
                if (this.ruleObj.periodType === 'custom') {
                    this.ruleObj.periodType = this.ruleObj.customType;
                }

                if (this.ruleObj.runMode === 0) {
                    this.globalDataRange();
                } else {
                    this.ruleObj.conditionalFrequencyDTOList = this.conditionRuleList;
                    let factor = this.strFieldList.filter(field => field.id === this.ruleObj.conditionField)[0];
                    // 删除obj内容， 会影响原数组
                    let postFactor = {
                        ...factor
                    };
                    delete postFactor.id;
                    delete postFactor.name;
                    this.ruleObj.factor = JSON.stringify(postFactor);
                }

                ManageApi
                    .saveRules(this.ruleObj)
                    .then(() => {
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                        this.rulesSave = false;
                        this.getRuleDetails();
                        this.recive = false;
                        this.getStatus = setInterval(() => {
                            this.checkStatus();
                        }, 5000);
                    });
            },
            // 下载当前运行周期发送频次日志 && 下载当前运行周期发送频次日志中邮箱验证 && 关闭邮箱弹框 &&
            downExport() {
                this.exportModel = !this.exportModel;
            },
            exportBtn() {
                if (!this.exportDate) {
                    return this.$toast(this.$t('data.pleaseSelectDates'), 'warn');
                }
                if (!this.exportTheme) {
                    return this.$toast(this.$t('contact.emailEmpty'), 'warn');
                }
                if (!this.email || this.email === '') {
                    return this.$toast(this.$t('frequency.labelNameEmpty'), 'warn');
                }
                if (!EMAIL_ADDRESS_REGEXP.test(this.email)) {
                    return this.$toast(this.$t('frequency.emailFormatError'), 'warn');
                }
                if (this.isHw){
                    if (!this.email.includes('@huawei.com') && !this.email.includes('@qdum.com')) {
                        this.$toast(this.$t('common.emailTypeWaring'), 'warn');
                        return;
                    }
                }
                this.exportModel = !this.exportModel;
                this.exportSent = !this.exportSent;
            },
            // 关闭导出模态框
            closeExportModal() {
                this.email = this.$store.state.user.email;
                this.exportTheme = this.$t('frequency.exportDefaultEmailTheme');
                this.exportDate = '';
                this.exportModel = false;
                this.exportFileType = 'Excel';
                this.exportCSVDataType = '';
            },
            // 点击导出后的确认弹框的关闭 && 确认导出
            closeExportSentLog() {
                this.exportSent = !this.exportSent;
            },
            exportSentLog() {
                let postData = {
                    email: this.email,
                    beginTime: this.periodTime.$getByKey(this.exportDate).beginTime,
                    endTime: this.periodTime.$getByKey(this.exportDate).endTime,
                    dataFormat: this.exportCSVDataType,
                    emailSubject: this.exportTheme,
                    formatType: this.exportFileType
                };
                ContactExportApiV3
                    .exportSentLog(postData)
                    .then(() => {
                        this.exportSent = !this.exportSent;
                        this.closeExportModal();
                        this.$toast(this.$t('data.acceptEmail'), 'success');
                    });
            },

            // 批量删除
            delMore() {
                if (!this.selectedConditionRule.length) return this.$toast(this.$t('frequency.selectDelCondition'), 'warn');

                this.deleteConditionRule(this.selectedConditionRule);
            },
            // 编辑条件规则
            editConditionRule(index) {
                this.currentEditConditionRule = index;
                let ruleItems = this.conditionRuleList[index];

                this.conditionRule.sendField = ruleItems.values;
                this.conditionRule.name = ruleItems.ruleName;
                // 编辑时， 验证重复字段值要去除当前编辑的
                this.nowAllSendField = difference(this.nowAllSendField, ruleItems.values);
                // 回显表格项目配置
                Object.keys(ruleItems)
                    .forEach(key => {
                        this.conditionRuleSendLimit.forEach(rule => {
                            if (key === rule.key) {
                                rule.value = ruleItems[key] > -1 ? ruleItems[key] : '';
                                rule.isValue = ruleItems[key] > -1 ? 1 : 2;
                            }
                        });
                    });

                this.showCreateConditionRule = true;
            },
            // 删除条件规则
            deleteConditionRule(index) {
                this.$confirm(this.$t('frequency.notice'), this.$t('frequency.deleteRuleNote'))
                    .then(res => {
                        if (res) {
                            if (typeof index === 'number') {
                                this.conditionRuleList.splice(index, 1);
                            } else {
                                let deleteList = [];
                                index.forEach(elm => {
                                    deleteList.push(this.conditionRuleList[elm]);
                                });
                                this.conditionRuleList = difference(this.conditionRuleList, deleteList);

                                // 清空选中的项
                                this.selectedConditionRule = [];
                            }

                            // 当规则删除为空时， 要清空储存的字段值集合
                            if (!this.conditionRuleList.length) this.nowAllSendField = [];
                        }
                    });
            },
            // 新增条件模式限制规则
            createNewRule() {
                if (this.conditionRuleList.length >= 15) return this.$toast(this.$t('frequency.errMaxRules'), 'warn');

                this.showCreateConditionRule = true;
            },
            editByRawValue() {
                this.rawData.value = this.conditionRule.sendField.join('\n');
                this.editRawValues = true;
            },
            // 重置多项输入框内容
            reset() {
                this.editRawValues = false;
                this.rawData.value = '';
            },
            // 多项输入框添加内容
            digestRawValues() {
                let verifyArray = this.rawData.value.split('\n')
                    .map(line => String(line)
                        .trim())
                    .filter(line => line);

                if (verifyArray.filter(arr => arr.length > 300).length) {
                    return this.$toast(`${this.$t('swarm.singleFormart')}${this.$t('swarm.maxChars')}`, 'warn');
                }
                this.conditionRule.sendField = uniq(verifyArray);

                this.reset();
            },
            // 限定批量弹窗的数据总数
            rebase() {
                let verifyArray = this.rawData.value.split('\n')
                    .map(line => String(line)
                        .trim())
                    .filter(line => line);
                if (verifyArray.length > 99) {
                    this.$toast(this.$t('swarm.max99items'), 'warn');
                    verifyArray.slice(0, 99);
                    this.rawData.value = verifyArray.join('\n');
                    this.rawData.value += '\n';
                }
            },
            // 关闭新建规则模态框
            hiddenCreateConditionRule() {
                this.showCreateConditionRule = false;
                this.conditionRule = {
                    sendField: [],
                    name: '',
                    fieldCaseSensitive: false
                };
                this.conditionRuleSendLimit.forEach(limit => {
                    limit.value = '';
                    limit.isValue = 2;
                });
                this.nowAllSendField = flattenDeep(this.conditionRuleList.map(rule => rule.values));
                this.currentEditConditionRule = '';
            },
            // 保存新增规则内容
            saveConditionRule() {
                if (this.checkConditionFieldRepeat()) {
                    this.showFieldRepeatModal = true;
                    return;
                }

                if (this.conditionRuleCheck()) {
                    let createData = {};

                    this.conditionRuleSendLimit.forEach(limit => {
                        createData[limit.key] = limit.isValue === 2 ? -1 : limit.value;
                    });

                    createData.ruleName = this.conditionRule.name;
                    createData.values = this.conditionRule.sendField;

                    // 編輯
                    if (this.currentEditConditionRule !== '') {
                        this.conditionRuleList[this.currentEditConditionRule] = createData;
                    } else {
                    // 新增
                        this.conditionRuleList.push(createData);
                    }

                    this.hiddenCreateConditionRule();
                }
            },
            // 验证条件字段值重复
            checkConditionFieldRepeat() {
                this.fieldRepeatList = intersection(this.conditionRule.sendField, this.nowAllSendField);
                return this.fieldRepeatList.length !== 0;
            },

            // 检测条件模式新建规则
            conditionRuleCheck() {
                let result = true;
                // 拦截规则名称为空
                if (!this.conditionRule.name) {
                    result = false;
                    return this.$toast(this.$t('frequency.inputRuleName'), 'warn');
                }
                // 拦截规则字段为空
                if (!this.conditionRule.sendField.length) {
                    result = false;
                    return this.$toast(this.$t('frequency.inputFiledValue'), 'warn');
                }
                // 拦截限制规则为空
                if (this.conditionRuleSendLimit.filter(rule => rule.value === '' && rule.isValue === 1).length) {
                    result = false;
                    return this.$toast(this.$t('frequency.inputSendLimit'), 'warn');
                }

                return result;
            },
            // 检测全局模式配置规则
            globalRuleCheck() {
                if (this.ruleObj.periodType === 'custom' && this.ruleObj.periodNumber.length === 0) {
                    this.$toast(this.$t('frequency.loopNameEmpty'), 'warn');
                    return false;
                }
                if (this.globalModeRule.emailLimit === 1 && this.globalModeRule.email.length === 0) {
                    this.$toast(this.$t('frequency.sendingAmountEmpty'), 'warn');
                    return false;
                }
                if (this.globalModeRule.mmsLimit === 1 && this.globalModeRule.mms.length === 0) {
                    this.$toast(this.$t('frequency.sendingAmountEmpty'), 'warn');
                    return false;
                }
                if (this.globalModeRule.smsLimit === 1 && this.globalModeRule.sms.length === 0) {
                    this.$toast(this.$t('frequency.sendingAmountEmpty'), 'warn');
                    return false;
                }
                if (this.globalModeRule.wechatServiceLimit === 1 && this.globalModeRule.wechatService.length === 0) {
                    this.$toast(this.$t('frequency.sendingAmountEmpty'), 'warn');
                    return false;
                }
                if (this.globalModeRule.wechatTemplateLimit === 1 && this.globalModeRule.wechatTemplate.length === 0) {
                    this.$toast(this.$t('frequency.sendingAmountEmpty'), 'warn');
                    return false;
                }

                return true;
            },
            // 全局模式，数据传参整理
            globalDataRange() {
                this.ruleObj.conditionalFrequencyDTOList = [
                    {
                        email: this.globalModeRule.emailLimit > -1 ? this.globalModeRule.email : -1,
                        mms: this.globalModeRule.mmsLimit > -1 ? this.globalModeRule.mms : -1,
                        sms: this.globalModeRule.smsLimit > -1 ? this.globalModeRule.sms : -1,
                        wechatService: this.globalModeRule.wechatServiceLimit > -1 ? this.globalModeRule.wechatService : -1,
                        wechatTemplate: this.globalModeRule.wechatTemplateLimit > -1 ?
                            this.globalModeRule.wechatTemplate : -1,
                    }
                ];
            },
            // 关闭重复字段值模态框
            closeCheckFieldRepeat() {
                this.showFieldRepeatModal = false;
                this.fieldRepeatList = [];
            },
            // 获取用户属性
            getFieldList() {
                ContactApi
                    .getFieldListByType()
                    .then(res => {
                        this.strFieldList = res.body.data.fieldList.map(field => {
                            return {
                                ...field,
                                name: this.lang === 'en' ? field.fieldName : field.fieldCn,
                                id: field.fieldId
                            };
                        });
                    });
            },
            // 选择导出文件类型为CSV时， 默认导出数据类型为utf8
            selectExportCSV() {
                this.exportCSVDataType = 'utf8';
            },
            transName(data) {
                return data > -1 ? `${data} ${this.$t('frequency.times')}` : this.$t('frequency.restriction');
            },
            // 检测条件模式配置规则
            conditionAllRuleCheck() {
                let result = true;
                if (!this.ruleObj.conditionField) {
                    result = false;
                    return this.$toast(this.$t('frequency.inputConditionFiled'), 'warn');
                }

                if (!this.ruleObj.periodType || !this.ruleObj.periodNumber && this.ruleObj.periodType === 'custom') {
                    result = false;
                    return this.$toast(this.$t('frequency.selectOperatingMode'), 'warn');
                }

                if (!this.conditionRuleList.length) {
                    result = false;
                    return this.$toast(this.$t('frequency.conditionRuleNone'), 'warn');
                }

                return result;
            }
        },
    };
</script>

<style lang="scss" type="text/scss">
    @import "../../common/scss/base/_variables.scss";
    @import "../../common/scss/base/_mixin.scss";

    .sent-frequency {
        .disable{
            padding: 0 0 10px 0;
            line-height: 23px;
        }
        .date{
            padding: 0 0 0 8px;
        }
        .transverse{
            padding: 0 6px;
        }
        .frequency-switch-model {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;

            // 下载日志按钮
            .frequency-theme-text {
                float: right;
                border: none;
                color: $green;
                cursor: pointer;
                background: rgba(0, 0, 0, 0);
            }
        }

        // 发送
        .frequency-describe {
            padding-top: 0px;
            height: 23px;
        }
        .disabled-text{
            color: #595959;
        }
        .cycle{
            height: 20px;
            font-size: 14px;
            margin: 10px 0;
        }
        // 运行周期
        .operation-cycle {
            // margin: 20px 0 20px 0;

            p {
                margin-bottom: 10px;
            }

            // 运行周期中的自定义模块
            .custom-content {
                display: flex;
                margin-top: 10px;

                .error {
                    background-color: rgba($light-red, .2);
                }

                .custom-selector {
                    margin-left: 10px;
                }

                .custom-message {
                    margin-left: 10px;
                }

            }
        }

        // 频次限额列表
        .simplify-table {
            p {
                margin-bottom: 10px;
            }
        }

        // 当发送某一类型的消息给单个联系人的次数达到限额
        .quota-choose {
            li {
                margin-top: 10px;
            }
        }

        .condition-mode {
            .btn {
                margin: 8px 0;
            }

            .btn-areas {
                display: flex;
                justify-content: space-between;
            }
        }

        .query-filter-condition-value.many {
            line-height: 22px;
            max-height: 85px;
            overflow: auto;
        }

        .query-filter-condition-value {
            .value-item {
                .value-item-text {
                    max-width: 138px;
                }
            }
        }

        .field-repeat-list {
            max-height: 160px;
            overflow: auto;

            li {
                padding: 0 8px;
                line-height: 32px;
            }
        }

        .simplify-table {
            table {
                tbody {
                    tr {
                        td {
                            line-height: normal;
                            white-space: normal;
                            word-break: break-all;
                            padding: 5px 16px;
                        }

                        .empty {
                            padding: 0;
                        }
                    }
                }
            }
        }

        .tip {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            z-index: 10;
            background: rgba(0, 0, 0, .6);
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 15px;

            p {
                width: 500px;
                height: 80px;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #999;
                background: #fff;
                border: 1px solid #c0c0c0;
                @include box-sizing(border-box);
                @include border-radius(8px);
            }

            .dot {
                &:before {
                    content: '...';
                    position: absolute;
                    animation: dot 2s infinite step-start both;
                }

                &:after {
                    content: '...';
                    color: transparent;
                }
            }

            @keyframes dot {
                33% {
                    content: '.';
                }
                66% {
                    content: '..';
                }
            }
        }

        .frequency-notice {
            z-index: 100;
        }
    }
</style>
