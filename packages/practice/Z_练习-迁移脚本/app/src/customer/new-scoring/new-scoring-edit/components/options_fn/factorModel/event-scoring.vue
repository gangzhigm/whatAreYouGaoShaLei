
<template>
    <div class="form-field score-rule">
        <!-- 评分规则 -->
        <label class="label">{{'newScoring.scoreRules' | t}}</label>
       
        <template v-if='!nameLaoding && reqNum === eventFieldList.length'>
            <customer-icon :eventGroupName="fieldEventName().iconName" :eventName="rules.event" v-if="fieldEventName().flag"></customer-icon>
            <span class="desc" v-text="fieldEventName().fieldName" :class="{'red-text' : !fieldEventName().flag}"></span>
        </template>
        <inline-spin v-else/>
        
        <!-- 条件 -->
        <div class="form-field" v-if="fieldEventName().flag">
            <label class="label">{{'newScoring.conditions' | t}}</label>
            <!-- 时间 -->
            <selector v-model="rules.timeType" :options="timeOptions" @select="selectDate" :disabled="!writable"/>
            <template v-if="rules.timeType === 0">
                <span>{{'newScoring.past' | t}}</span>
                <input  class="input" 
                        type="number" 
                        v-model="rules.fromDate"
                        @blur="dateBlur"
                        :disabled="!writable"
                        style="width: 50px;">
                <span>{{'newScoring.days' | t}}</span>
                <i class="icon icon-yiwen1" v-title:right="$t('newScoring.dateTipNext') + rules.fromDate + $t('newScoring.dateTipLast')" ></i>
            </template>
            <template v-if="rules.timeType === 1">
                <span>{{'swarm.absoluteDateA' | t}}</span>
                <calendar v-model="rules.fromDate" :end="rules.toDate" :disabled="!writable"/>
                <span>{{'swarm.absoluteDateB' | t}}</span>
                <calendar  v-model="rules.toDate" :start="rules.fromDate" :disabled="!writable"/>
                <span>{{'swarm.absoluteDateC' | t}}</span>
                <i class="icon icon-yiwen1" v-title:right="$t('newScoring.dateTip')"></i>
            </template>
            <!-- 任意or指定radio -->
            <template v-if="isTD && isCustomization">
                <div class="event-radio">
                    <radio :source="0" v-model="rules.isAppoint" :disabled="!writable">{{'newScoring.any' | t}}&nbsp;{{eventName}}</radio>
                    <radio :source="1" v-model="rules.isAppoint" :disabled="!writable">{{'newScoring.assigned' | t}}&nbsp;{{eventName}}</radio>
                </div>
                <!-- 指定事件 -->
                <template v-if="rules.isAppoint === 1">
                    <div class="event-title">
                        <p>{{eventName}}&nbsp;{{'newScoring.list' | t}}</p>
                    </div>
                    <p class="red-text event-tip" v-if="isWarns">{{'newScoring.fieldRequired' | t}}</p>
                    <div class="event-hidden" :class="{'over-hidden': rules.conditions.length > 6}">
                            <div class="event-input" v-for="(item, index) in rules.conditions" :key="index">
                                <span>{{index + 1}}</span>
                                 <!-- 来源任务 -->
                                <template v-if="item.field_name === 'task_instantiation_id'">
                                    <task-selector  v-model="item.task_instantiation_id" :journey="item.journey_instantiation_id"
                                                    :journeyGroup="item.journey_group_id" :viewMode="!writable"
                                                    :list="journeyGroupData" @select="factorChange($event, item)">
                                    </task-selector>
                                </template>
                                <!-- 公众号 -->
                                <template v-if="item.field_name === 'app_id'">
                                    <selector :options="wechatList" v-model="item.id" :disabled="!writable" @select="wechatChange($event, item)" @invalid="invalid(item)"></selector>
                                </template>
                                <!-- 微信扫码 -->
                                <template v-if="item.field_name === 'event_key'">
                                    <selector :options="wechatList" v-trigger v-model="item.journey_instantiation_id" :disabled="!writable" @select="wechatChange($event, item, index)" @invalid="invalid(item)" @click="handleClick(item.journey_instantiation_id, item, index)"></selector>
                                    <selector :options="qrcodeList[index].list" v-model="item.value" search 
                                              :disabled="!writable" @select="selectList($event, item)" @load="wechatBlurs(index)" 
                                              @invalid="invalid(item)" v-if="listFlag"></selector>
                                </template>
                                <!-- 表单 -->
                                <template v-if="item.field_name === 'form_id'">
                                   <selector :options="formList" v-model="item.value" search :disabled="!writable" @select="wechatChange($event, item)" @invalid="invalid(item)"></selector>
                                </template>
                                <!-- 标签 -->
                                <template v-if="item.field_name === 'label_id'">
                                    <template v-if="rules.event === 'label_add' || rules.event === 'label_remove'">
                                        <condition-group-tablist v-if="tabListLoaded"
                                                                 :key="index"
                                                                 :tabList="tabList"
                                                                 @select="wechatChange($event, item)"
                                                                 @invalid="invalid(item)"
                                                                 :disabled="!writable"
                                                                 v-model="item.value">
                                        </condition-group-tablist>
                                    </template>
                                    <!-- 粉丝标签 -->
                                    <template v-if="rules.event === 'fans_label_add' || rules.event === 'fans_label_remove'">
                                        <selector :options="wechatList" v-trigger v-model="item.journey_instantiation_id" :disabled="!writable" @select="wechatChange($event, item, index)" @invalid="invalid(item)"  @click="handleClick(item.journey_instantiation_id, item, index)"></selector>
                                        <selector :options="fansList[index].list" v-model="item.value" search 
                                                   :disabled="!writable" @select="selectList($event, item)" 
                                                   @invalid="invalid(item)" v-if="listFlag"></selector>
                                    </template>
                                </template>
                                <!-- 企业微信扫码 -->
                                <template v-if="item.field_name === 'wecom_channel_code_id'">
                                    <selector :options="wecomList" v-model="item.value" search 
                                              :disabled="!writable" @select="wechatChange($event, item)" @load="wecomBlur()" @invalid="invalid(item)"></selector>
                                </template>
                                <!-- 删除事件 -->
                                <svg aria-hidden="true" class="icon del-icon" @click="delEvent(rules.conditions, index)" v-if="writable">
                                    <use xlink:href="#icon-quxiao"></use>
                                </svg>
                                <p class="red-text" v-if="item.isWarn">{{'newScoring.fieldRequired' | t}}</p>
                            </div>
                    </div>    
                    <!-- 添加事件     -->
                    <div @click="addEvent()" class="add-event"  v-if="writable">
                        <svg aria-hidden="true" class="icon add-icon">
                            <use xlink:href="#icon-add"></use>
                        </svg>
                        <span class="theme-text">{{'newScoring.add' | t}}&nbsp;{{eventName}}</span>
                    </div>
                </template>
                <!-- 事件是否计一次分 -->
                <div class="event-check">
                    <checkbox :source="true" v-model="rules.isCardinality" v-if="writable">{{'newScoring.each' | t}}&nbsp;{{eventName}}&nbsp;{{'newScoring.only' | t}}</checkbox>
                </div>
            </template>
            <!-- 预估人数 -->
            <div class="event-estimate">
                <span>{{'newScoring.audience' | t}}：</span><span>{{rules.expectedNumber}}</span>
                <svg aria-hidden="true" class="icon icon-reset" v-if="writable" @click="peopleCount">
                      <use xlink:href="#icon-reset"></use>
                </svg>
                <i class="icon icon-yiwen1" v-title:right="$t('newScoring.expectedTip')"></i>
            </div>
        </div>
        <!-- 得分 -->
        <div class="form-field">
            <label class="label">{{'newScoring.score' | t}}</label>
            <switch-button class="switch-btn" v-model="rules.openStatus" @input="scoreRange" :has="!writable">
                <span class="add" v-if="rules.openStatus">+</span>
                <span class="sub" v-else>-</span>
            </switch-button>
            <input  class="input" 
                    type="number" 
                    style="width:50px;"
                    :disabled="!writable" 
                    v-model.trim="rules.score"
                    @blur="numBlur">
            <span class="score-num">{{'newScoring.per' | t}}</span>
            <span v-if="rules.openStatus">{{'newScoring.scoreLimt' | t}}</span>
            <span v-else>{{'newScoring.deductionLimt' | t}}</span>
            <input  class="input" 
                    type="number" 
                    style="width:50px;"
                    :disabled="!writable" 
                    v-model.trim="rules.maxScore"
                    @blur="topBlur">
        </div>
        <!-- 评分范围 -->
        <div class="form-field">
          <label class="label">{{'newScoring.scoreUpperLimit' | t}}</label>
          + <span>{{range.scoreCeil}}</span>
          <p class="event-tip">{{'newScoring.eventRules' | t}}</p>
        </div>
        <!-- 因子名称 -->
        <div class="form-field">
          <label class="label">{{'newScoring.mark' | t}}</label>
          <input type="text" class="input" v-model.trim="range.scoringTitle" 
                  v-title:top.line.warn="errorTitle" :class="{error: errorTitle}"
                  @focusin="errorTitle = ''" :placeholder="$t('newScoring.enterUpTo100Characters')" 
                  :maxlength="100" v-if="writable">
          <span class="factor-title" v-else>{{range.scoringTitle}}</span>
        </div>
    </div>
</template>
<script type="text/babel">
    import { JourneyApiV3, QuestionnaireApiV1, WechatApiV1, ContactApiV1, WecomApiV1, ContactApi, ScoringV2 } from '@/api';
    import taskSelector from '@/common/components/condition-bunch/taskSelector.vue';
    import cascading from '@/common/components/condition-bunch/cascading.vue';
    import customerIcon from '@/customer/list/customer-icon.vue';
    import conditionGroupTablist from '@/customer/swarm/condition-group-tablist.vue';
    import { throttle } from 'lodash';
    import {I18N_STORE_NAME} from '@/locales';
    import { mapState } from 'vuex';
    export default {
        name: 'event-scoring', // 事件因子
        props: {
            // 评分规则
            rules: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 得分范围以及标题名称
            range: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 是否可编辑
            writable: {
                type: Boolean,
                default: true,
            },
            // 新建/编辑因子需要传的值
            factorRule: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 获取父组件通过event找到conditions对应的field_name方法
            getFiledName: {
                type: Function,
                default: null
            },
            // 属性或事件id
            attributeOrEventId: {
                type: [Number, String],
                default: null
            },
            // 因子id
            factorId: {
                type: Number,
                default: null,
            },
            // 是否为新建(有值为编辑)
            isCreate: {
                type: [Number, String],
                default: null,
            }
        },
        components: {
            taskSelector,
            cascading,
            customerIcon,
            conditionGroupTablist
        },
        data() {
            return {
                journeyGroupData: [], // 来源任务
                wechatList:[], // 微信公众号列表
                formList: [], // 来源表单
                tabList: [], // 标签列表
                tabListLoaded: false,    // 标签列表加载完毕
                qrcodeList: [{list: [], totalPage: 0, pageNumber: 1}], // 微信二维码列表
                wecomList: [], // 渠道活码列表
                fansList: [{list: []}], // 粉丝标签列表
                wechatId: null, // 选择的二维码id
                wecomPageNumber: 1, // 渠道活码列表页数
                wecomtotalPage: 1, // 渠道活码总页数
                errorTitle: '', // 名称错误提示
                timeOptions: [
                    {name: this.$t('newScoring.relativeDate'), id: 0},
                    {name: this.$t('newScoring.absoluteDate'),id: 1}
                ],
                wechat_public: this.$t('newScoring.accounts'),
                email: this.$t('newScoring.email'),
                sms: this.$t('newScoring.sms'),
                qr_code: this.$t('newScoring.qrcode'),
                custom_mess: this.$t('newScoring.customer'),
                template_mess: this.$t('newScoring.tempalte'),
                form: this.$t('newScoring.form'),
                mms: this.$t('newScoring.mms'),
                label: this.$t('newScoring.tag'),
                wecom: this.$t('newScoring.wecom'),
                apply_mess: this.$t('newScoring.agent'),
                mass: this.$t('newScoring.broadcast'),
                eventFieldList: [], //事件因子列表
                groupObj: '',
                events:'',
                isWarns: false,
                nameLaoding: true,
                listFlag: false,
                reqNum:0
            };
        },
        // 自定义指令点击事件
        directives:{
            trigger:{
                inserted(el,binging){
                    el.click();
                }
            }
        },
        computed: {
            ...mapState({
                // 语言状态
                lang: state => state[I18N_STORE_NAME].lang === 'zh-CN'
            }),
            // 获取事件名称
            eventName() {
                switch (this.rules.event){
                    case 'dmd_open' : 
                    case 'dmd_click': 
                    case 'dmd_sent': 
                        return this.email; // 邮件事件
                    case 'sms_click_link' : 
                    case 'sms_send' : 
                        return this.sms; // 短信事件
                    case 'wx_reply_message' : 
                    case 'wx_subscribe' : 
                    case 'wx_unsubscribe' : 
                    case 'wx_click_menu' : 
                        return this.wechat_public; // 微信公众号
                    case 'wx_scan' : return this.qr_code; // 二维码
                    case 'click_menu' : return this.click_menu; // 点击菜单
                    case 'wx_customer_news' : return this.custom_mess; // 客服消息
                    case 'wx_template_news' : return this.template_mess; //模板消息
                    case 'form_open' : 
                    case 'form_submit' : 
                        return this.form; //表单
                    case 'mms_click_link' : 
                    case 'mms_send' : 
                        return this.mms; //彩信
                    case 'label_add' : 
                    case 'label_remove' : 
                    case 'fans_label_add' : 
                    case 'fans_label_remove' : 
                        return this.label; //标签
                    case 'wecom_scan_code' : return this.wecom; //企业微信扫码
                    case 'wecom_agent_msg_content' : return this.apply_mess; //应用消息
                    case 'wecom_contact_group_msg_contact' : return this.mass; //企业群发
                }
            },
            // 是否为退订
            isTD() {
                if (this.rules.event === 'sms_unsubscribe' || 
                    this.rules.event === 'dmd_unsubscribe' ||
                    this.rules.event === 'dmd_softbounce' ||
                    this.rules.event === 'dmd_hardbounce' ||
                    this.rules.event === 'global_unsubscribe' ||
                    this.rules.event === 'create_user' ||
                    this.rules.event === 'merge_user' ||
                    this.rules.event === 'attribute_change' ||
                    this.rules.event === 'eval_rank_change' ||
                    this.rules.event === 'wecom_employee_add_contact' ||
                    this.rules.event === 'wecom_contact_delete_employee' ||
                    this.rules.event === 'wecom_add_group' ||
                    this.rules.event === 'wecom_quit_group' ||
                    this.rules.event === 'wecom_agent_msg_staff'
                ){
                    return false;
                }
                return true;
            },
            // 是否为自定义事件
            isCustomization() {
                let event = ['dmd_open','dmd_click','dmd_sent','sms_click_link',
                    'sms_click_link', 'sms_send','sms_send', 'wx_reply_message',
                    'wx_subscribe','wx_unsubscribe', 'wx_click_menu','wx_scan',
                    'click_menu', 'wx_customer_news', 'wx_template_news', 'form_open',
                    'form_submit', 'mms_click_link', 'mms_send', 'label_add', 'label_remove',
                    'fans_label_add', 'fans_label_remove', 'wecom_scan_code', 'wecom_agent_msg_content',
                    'wecom_contact_group_msg_contact', 'sms_unsubscribe' ,'dmd_unsubscribe' ,'dmd_softbounce' ,
                    'dmd_hardbounce' ,'global_unsubscribe' ,'create_user' , 'merge_user' ,'attribute_change' ,
                    'eval_rank_change' ,'wecom_employee_add_contact' ,'wecom_contact_delete_employee' ,'wecom_add_group' ,
                    'wecom_quit_group' ,'wecom_agent_msg_staff'
                ];
                let customization = event.indexOf(this.rules.event);
                if (customization === -1) {
                    return false;
                }
                return true;
            }
        },
        mounted() {
            this.getList();
            this.getWechatListRequest();
            this.eventFieldHandler();
            this.getFormListHandler();
            this.relationHandler();
            this.wecomTest();
        },
        methods: {
            handleClick(id, data, index) {
                if (data.field_name === 'event_key') {
                    // 获取二维码列表
                    WechatApiV1
                        .getSubscriptionList({keyword:'', pageNumber: 1,groupId: '', wechatId: id})
                        .then(res => {
                            let arr = this.qrcodeList;
                            for (let i = 0; i < this.rules.conditions.length; i++) {
                                let obj = {};
                                obj.list = res.body.data.quickMarkList;
                                obj.totalPage = res.body.data.totalPage;
                                obj.pageNumber = 1;
                                arr.push(obj);
                                if (arr.length > 1) {
                                    arr.map((item, index) => {
                                        if (item.list.length === 0) {
                                            arr.splice(index, 1);
                                        }
                                    });
                                }
                            }
                            this.qrcodeList = arr;
                            this.listFlag = true;
                        });
                }
                if (this.rules.event === 'fans_label_add' || this.rules.event === 'fans_label_remove') {
                    // 获取粉丝标签列表
                    WechatApiV1
                        .getJourneyTagList('','',id)
                        .then(({body: {data: {tagList}}}) => {
                            let arr = this.fansList;
                            for (let i = 0; i < this.rules.conditions.length; i++) {
                                let obj = {};
                                obj.list = tagList;
                                arr.push(obj);
                                if (arr.length > 1) {
                                    arr.map((item, index) => {
                                        if (item.list.length === 0) {
                                            arr.splice(index, 1);
                                        }
                                    });
                                }
                            }
                            this.fansList = arr;
                            this.listFlag = true;
                        });
                }
            },
            // 校验是否配置企业微信
            async wecomTest() {
                const list =  await WecomApiV1
                    .getConfigList()
                    .then(({ body: { data: { resultList } } }) => resultList);
                if (list && list.length > 0) {
                    this.getWecomList();
                }
            } ,          
            // 获取事件属性列表
            async eventFieldHandler() {
                await ContactApi.getEventGroupList()
                    .then((res) => {
                        let intervalNum = 0;
                        this.eventFieldList = res.body.data.contactEvnentsGroupDTO.map((e) => {
                            let eventGroup = {};
                            eventGroup.id = e.id;
                            eventGroup.fieldName = e.name;
                            eventGroup.name = this.lang ? e.nameCn : e.nameEn;
                            eventGroup.child = [];
                            this.nameLaoding = true;
                            ContactApi
                                .getEventList(e.id)
                                .then(ress => {
                                    eventGroup.child = ress.body.data.contactEvnentsDTO.map(v => {
                                        let events = {};
                                        events.id = v.id;
                                        events.fieldName = v.name;
                                        events.name = this.lang ? v.nameCn : v.nameEn;
                                        events.event_group = e.name;
                                        events.event_group_id = v.evnentsGroupId;
                                        return events;
                                    });
                                    this.reqNum += 1;
                                })
                                .then(() => {
                                    this.nameLaoding = false;
                                    // if (!this.isCreate && this.writable) {
                                    //     this.$set(this.range, 'scoringTitle', this.fieldEventName().fieldName);
                                    // }
                                });
                            return eventGroup;
                        });
                        let numInterval = setInterval(() => {
                            intervalNum += 1;
                            if (this.reqNum === this.eventFieldList.length) {
                                clearInterval(numInterval);
                            }
                        },100);
                        if (intervalNum > 300) {
                            clearInterval(numInterval);
                        }
                    });
            },
            // 字段匹配
            fieldEventName() {
                let obj = {
                    iconName: '',
                    fieldName: '',
                    flag: true,
                };
                this.groupObj = this.eventFieldList.find((item)=>{
                    return item.id === this.attributeOrEventId;
                });
                
                this.events = this.groupObj ? this.groupObj.child.find((item)=>{
                    return item.id ===  this.rules.eventId;
                }) : '';
                
                if (this.events || this.groupObj) {
                    obj.fieldName = this.events ? this.events.name + '( ' + this.events.fieldName + ' )' : '';
                    obj.iconName =  this.events ? this.events.event_group : '';
                    obj.flag = true;
                    if (!this.events) {
                        obj.flag = false;
                        obj.fieldName = this.$t('newScoring.fieldAvailable');
                    }
                } else {
                    obj.flag = false;
                    obj.fieldName = this.$t('newScoring.fieldAvailable');
                }
                return obj;
            },
            // 保存时检查字段有效性
            checkField() {
                if (!this.events || !this.groupObj) {
                    this.$toast(this.$t('newScoring.saveAvailable'), 'warn');
                    return false;
                }
                return true;
            },
            // 校验是否为空
            valid() {
                let isEmpty = true;
                if (this.isCustomization) {
                    this.rules.conditions.map(item => {
                        if (!item.value) {
                            // item.isWarn = true;
                            this.$set(item, 'isWarn', true);
                            isEmpty = false;
                        }
                    });
                }
                if (this.rules.conditions.length === 0 && this.isCustomization) {
                    this.isWarns = true;
                    isEmpty = false;
                }
                return isEmpty;
            },
            // 校验标题
            // checkTitle() {
            //     if (this.range.scoringTitle === '') {
            //         this.errorTitle = this.$t('newScoring.dataRequired');
            //         return false;
            //     }
            //     return true;
            // },
            selectList(e, data) {
                data.isWarn = false;
            },
            // 获取当前日期
            getNowFormatDate() {
                let date = new Date();
                let seperator1 = '-';
                let year = date.getFullYear();
                let month = date.getMonth() + 1;
                let strDate = date.getDate();
                if (month >= 1 && month <= 9) {
                    month = '0' + month;
                }
                if (strDate >= 0 && strDate <= 9) {
                    strDate = '0' + strDate;
                }
                let currentdate = year + seperator1 + month + seperator1 + strDate;
                return currentdate;
            },
            // 选择时间
            selectDate() {
                if (this.rules.timeType === 1){
                    this.rules.fromDate = this.getNowFormatDate();
                    this.rules.toDate = this.getNowFormatDate();
                } else {
                    this.rules.fromDate = 30;
                    this.rules.toDate = 0;
                }
            },
            // 来源任务不会出现条件失效的情况（已经和测试确认）
            // noitem(item) {
            //     this.$toast(this.$t('controller.invalidCondition'), 'warn');
            //     item.value = '';
            //     item.isWarn = true;
            // },
            invalid(item) {
                this.$toast(this.$t('controller.invalidCondition'), 'warn');
                item.value = '';
                item.isWarn = true;
            },
            // 计算预估人数
            peopleCount() {
                if (!this.isCreate) {
                    this.$toast(this.$t('newScoring.saveFactorFirst'), 'warn');
                } else {
                    if (this.events && this.groupObj) {
                        ScoringV2
                            .countExpected({
                                factorId: this.isCreate,
                                scoringModelId: this.factorRule.scoringModelId
                            })
                            .then(res => {
                                let data = res.body.data.scoringFactor;
                                let scoreRules = JSON.parse(data.scoreRules);
                                let eventrRules  = scoreRules.rules[0];
                                this.rules.expectedNumber = eventrRules.expectedNumber;
                                this.$toast(this.$t('menu.synSuccess'), 'success');
                                
                            })
                            .catch((res) => {
                                if (res.body.errorCode) {
                                    this.$toast(res.body.message, 'warn');
                                }
                            });
                    } else {
                        this.$toast(this.$t('controller.invalidCondition'), 'warn');
                    }   
                    
                }
            },
            // 行为事件选择
            factorChange(e, data) {
                if (data.field_name === 'task_instantiation_id') {
                    data.journey_instantiation_id = e.selectJourneyID;
                    data.journey_group_id = e.selectJourneyGroup;
                    data.value = ~~(e.taskIDS.toString());
                }
                data.isWarn = false;
            },
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
            wechatChange(e, data, index) {
                this.wechatId = e.id;
                data.isWarn = false;
                if (data.field_name === 'app_id') {
                    data.value = e.WxAppId;
                }
            },
            // 滚动加载二维码列表
            wechatBlurs: throttle(function(index) {
                if (this.qrcodeList[index].totalPage > this.qrcodeList[index].pageNumber) {
                    this.qrcodeList[index].pageNumber++;
                    WechatApiV1
                        .getSubscriptionList({keyword:'', pageNumber: this.qrcodeList[index].pageNumber, groupId: '', wechatId: this.wechatId})
                        .then(res => {
                            this.qrcodeList[index].list = this.qrcodeList[index].list.concat(res.body.data.quickMarkList);
                        });
                }
               
            },700),
            // 获取公众号列表
            getWechatListRequest() {
                WechatApiV1
                    .getWechatAccounts()
                    .then(res => {
                        this.wechatList = res.body.data.authorizerInfoList
                            .map(({authorizerInfoId: id, principalName: name, WxAppId: WxAppId}) => ({id, name,WxAppId}));
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
            // 获取标签列表
            relationHandler() {
                ContactApiV1
                    .relation()
                    .then(res => {
                        this.tabList =  res.body.data.groupList.map(e => {
                            let arrList = {};
                            arrList.name = e.groupName;
                            arrList.id = e.groupId;
                            return arrList;
                        });
                        this.tabListLoaded = true;
                    });
            },
            // 获取渠道活码
            getWecomList() {
                WecomApiV1
                    .getList({
                        keyword: '',
                        pageNumber: this.wecomPageNumber,
                        groupId: ''
                    })
                    .then(({ body: { data } }) => {
                        this.wecomList = data.list;
                        this.wecomTotalPage = data.totalPage;
                    });
            },
            // 滚动加载渠道活码
            wecomBlur: throttle(function() {
                if (this.wecomTotalPage > this.wecomPageNumber) {
                    this.wecomPageNumber++;
                    WecomApiV1
                        .getList({
                            keyword: '',
                            pageNumber: this.wecomPageNumber,
                            groupId: ''
                        })
                        .then(({ body: { data } }) => {
                            this.wecomList = this.wecomList.concat(data.list);
                        });
                }
            }, 700),
            // 失去焦点可输入0~100
            numBlur() {
                if (this.rules.score === '' || this.rules.score < 0) {
                    this.rules.score = 0;
                } else if (this.rules.score > 100) {
                    this.rules.score = 100;
                } else if (String(this.rules.score).indexOf('.') > -1) {
                    this.rules.score = Math.round(this.rules.score);
                }
                this.scoreRange();
            },
            topBlur() {
                if (this.rules.maxScore === '' || this.rules.maxScore < 0) {
                    this.rules.maxScore = 0;
                } else if (this.rules.maxScore > 100) {
                    this.rules.maxScore = 100;
                } else if (String(this.rules.maxScore).indexOf('.') > -1) {
                    this.rules.maxScore = Math.round(this.rules.maxScore);
                }
                this.scoreRange();
            },
            // 输入1-365天
            dateBlur() {
                if (this.rules.fromDate === '' || this.rules.fromDate < 1) {
                    this.rules.fromDate = 1;
                } else if (this.rules.fromDate > 365) {
                    this.rules.fromDate = 365;
                } else if (String(this.rules.fromDate).indexOf('.') > -1) {
                    this.rules.fromDate = Math.round(this.rules.fromDate);
                }  
            },
            // 得分范围
            scoreRange() {                
                // 得分
                if (this.rules.openStatus) {
                    this.range.scoreFloor = 0;
                    this.range.scoreCeil = this.rules.maxScore;
                   
                } else {
                    // 扣分
                    this.range.scoreCeil = 0;
                    this.range.scoreFloor = this.rules.maxScore === 0 ? 0 : '-' + this.rules.maxScore;
                }
            },
            // 添加事件
            addEvent() {
                this.isWarns = false;
                if (this.rules.conditions.length < 50) {
                    this.rules.conditions.push({
                        field_name: '',  // 不同事件对应不同字段
                        fieldType: 1,
                        operation: 'eq', // 当前固定为等于
                        value: '', // 任务实例id/公众号app_id/微信二维码id/表单id/标签id/企业微信活码
                        task_instantiation_id: '',
                        journey_instantiation_id: '',
                        journey_group_id: '',
                        isWarn: false,
                    });
                    if (this.rules.event === 'fans_label_add' || this.rules.event === 'fans_label_remove') {
                        this.fansList.push({id: '', list:[]});
                    }
                    if (this.rules.conditions[0].field_name === 'event_key') {
                        this.qrcodeList.push({id: '', list:[], pageNumber: 1, totalPage: 1});
                    }
                    
                } else {
                    this.$toast(this.$t('newScoring.addFifty') + this.eventName, 'warn');
                }
                
                this.getFiledName();
                
            },
            // 删除某一个事件
            delEvent(item, index) {
                item.splice(index, 1);
                if (this.rules.event === 'fans_label_add' || this.rules.event === 'fans_label_remove') {
                    this.fansList.splice(index, 1);
                }
                if (this.rules.conditions.length > 0) {
                    if (this.rules.conditions[0].field_name === 'event_key') {
                        this.qrcodeList.splice(index, 1);
                    }
                }
                
            }
        }
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../../../../../common/scss/base/_variables';
    @import '../../../../../../common/scss/base/_mixin';
    .score-rule {
        .desc {
            position: absolute;
            margin-left: 10px;
        }
        .event-icon {
            position: relative;
            top: 0;
            left: 0;
            margin-top: 5px;
            width: 24px;
            height: 24px;
        }
        .factor-title {
            width: 760px;
            display: inline-block;
        }
        .middle-box {
            margin-left: 130px;
            min-height: 150px;
        }
        .event-radio, .event-title, .add-event, .event-input, .event-check, .event-estimate, .event-tip{
            margin-left: 130px;
        }
        .event-title {
            line-height: 32px;
            background: $content-bg;
            width: 330px;
            margin-left: 130px;
            padding-left: 10px;
        }
        .add-event {
            cursor: pointer;
            width: 135px;
            .add-icon {
              width: 20px;
              height: 20px;
              fill: $theme;
              position: absolute;
              margin-top: 6px;
            }
            .theme-text {
                position: relative;
                left: 40px;
            }
        }
        .event-hidden {
            max-height: 475px;
            width: 480px;
            
            .event-input {
                .cascading .csedes .drop-down-list ul {
                   width: 150px;
                }
                margin-top: 10px;
                .del-icon {
                    cursor: pointer;
                    width: 24px;
                    height: 24px;
                    fill: $red;
                    position: relative;
                    top: 8px;
                }
            }
        }
        .over-hidden {
            overflow-y: scroll;
            width: auto;
        }
      
        .event-estimate {
            .icon-reset {
                width: 16px;
                height: 16px;
                fill: $disabled;
                position: relative;
                top: 2px;
                left: 5px;
                cursor: pointer;
                margin-right: 10px;
            }
        }
        .score-num {
            margin-right: 20px;
        }
        .switch-btn {
          color: #ffffff;
          .add {
              position: absolute;
              left: 8px;
          }
          .sub {
              position: absolute;
              left: 26px;
          }
        }
    }
</style>

