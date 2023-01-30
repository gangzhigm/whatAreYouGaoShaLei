<template>
    <modal class="decision-controller-form"
             :title="$t('controller.conditionSplit')"
             :size="'sl'"
             @close="close()">
        <p v-if="controller.id === validationResult.errorId" class="error-message">
            {{validationResult.errorMessage}}
        </p>
        <div class="form-field flex modal-item">
            <label class="label" for="taskName">{{'controller.controllerName' | t}}</label>
            <div class="field-group">
                <input class="input lg" id="taskName" type="text" v-model.trim="name" maxlength="255" :disabled="!writable">
            </div>
        </div>
        <div class="form-field flex modal-item">
            <label class="label">{{'controller.conditions' | t}}</label>
            <div class="field-group">
                <inline-loading v-if="requestLoading || !eventListLoading"/>
                <div class="decision-conditions" v-else>
                    <div class="condition-bunch">
                        <div class="just">{{'common.and' | t}}</div>
                        <div class="chooseBox">
                            <div class="user">
                                <span>{{'swarm.contactAttribute' | t}}</span>
                                <div class="add" v-if="writable" @click="addStripItem(selectResult.filter_json[0],'contact')">
                                    <i class="icon icon-tianjia"></i>
                                </div>
                            </div>
                            <div class="choose" :class="contactLoog.length>1?'count-1':''">
                                <div class="maybe" :class="{'disabled': !writable}" v-if="contactLoog.length>1">
                                    <div v-if="selectResult.filter_json[0].actChildren === 'and'" @click="changeAct(0,'or')">{{'common.and' | t}}</div>
                                    <div v-if="selectResult.filter_json[0].actChildren === 'or'" @click="changeAct(0,'and')">{{'common.or' | t}}</div>
                                </div>
                                <eventSettings v-for="(cItem,cIndex) in contactLoog"
                                               :key="cItem"
                                               :num="cIndex"
                                               :stripItem="selectResult.filter_json[0].rules[cIndex]"
                                               :type="selectResult.filter_json[0].type"
                                               :optionsData="optionsData"
                                               ref="contactSettings"
                                               :writable="writable"
                                               :rulesLength="true"
                                               @select="resultChange($event, cIndex, selectResult.filter_json[0].type)"
                                               @delResult="deleteResult($event,cIndex,'contact')"/>
                            </div>
                        </div>
                        <div class="chooseBox">
                            <div class="user">
                                <span>{{'swarm.eventAttribute' | t}}</span>
                                <div class="add" v-if="writable" @click="addStripItem(selectResult.filter_json[1],'event')">
                                    <i class="icon icon-tianjia"></i>
                                </div>
                            </div>
                            <div class="choose" :class="eventLoog.length>1?'count-1':''">
                                <div class="maybe" :class="{'disabled': !writable}" v-if="eventLoog.length>1">
                                    <div v-if="selectResult.filter_json[1].actChildren === 'and'" @click="changeAct(1,'or')">{{'common.and' | t}}</div>
                                    <div v-if="selectResult.filter_json[1].actChildren === 'or'" @click="changeAct(1,'and')">{{'common.or' | t}}</div>
                                </div>
                                <eventSettings v-for="(eItem,eIndex) in eventLoog"
                                               :key="eItem"
                                               :num="eIndex"
                                               :stripItem="selectResult.filter_json[1].rules[eIndex]"
                                               :type="selectResult.filter_json[1].type"
                                               :optionsData="optionsData"
                                               ref="eventSettings"
                                               :writable="writable"
                                               :rulesLength="true"
                                               @select="resultChange($event, eIndex, selectResult.filter_json[1].type)"
                                               @delResult="deleteResult($event,eIndex,'event')"/>
                            </div>
                        </div>
                        <div class="chooseBox">
                            <div class="user">
                                <span>{{'swarm.OtherInteractive' | t}}</span>
                                <div class="add" v-if="writable" @click="addStripItem(selectResult.filter_json[2],'Journey_event')">
                                    <i class="icon icon-tianjia"></i>
                                </div>
                            </div>
                            <div class="choose" :class="interactiveLoog.length>1?'count-1':''">
                                <div class="maybe" :class="{'disabled': !writable}" v-if="interactiveLoog.length>1">
                                    <div v-if="selectResult.filter_json[2].actChildren === 'and'" @click="changeAct(2,'or')">{{'common.and' | t}}</div>
                                    <div v-if="selectResult.filter_json[2].actChildren === 'or'" @click="changeAct(2,'and')">{{'common.or' | t}}</div>
                                </div>
                                <decision-selector v-for="(iItem,iIndex) in interactiveLoog"
                                                   :key="iItem"
                                                   :num="iIndex"
                                                   :stripItem="selectResult.filter_json[2].rules[iIndex]"
                                                   :type="selectResult.filter_json[2].type"
                                                   :act="selectResult.filter_json[2].actChildren"
                                                   :optionsData="optionsData"
                                                   ref="otherSettings"
                                                   :writable="writable"
                                                   @select="resultChange"
                                                   @delResult="deleteResult($event,iIndex,'Journey_event')"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    <template v-slot:buttons>
        <template v-if="writable">
            <input type="button" class="btn btn-md btn-theme-border" @click.stop="close()"
                   :value="$t('common.cancel')"/>
            <input type="button" class="btn btn-md btn-theme" tabindex="1" autofocus @click.stop="confirm(false)"
                   :value="$t('common.confirm')"/>
        </template>
        <input v-else type="button" class="btn btn-md btn-theme-border" @click.stop="close()"
               :value="$t('common.close')"/>
    </template>
    </modal>
</template>

<script type="text/ecmascript-6">
    import { ContactApiV1, ContactApiV3, WecomApiV1, JourneyApiV3, ContactApi, QuestionnaireApiV1, WechatApiV1 } from '@/api';
    import cloneDeep from 'lodash/cloneDeep';
    import DecisionSelector from './components/decision-selector.vue';
    import eventSettings from '../attribute-condition-controller/attribute-edit-modal/event-settings.vue';
    import {UPDATE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME, uniqId} from '@/store/vuex/modules/canvasStore';
    import {SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import {I18N_STORE_NAME} from '@/locales';
    import { mapActions, mapMutations, mapState } from 'vuex';

    export default {
        provide(){
            return {
                optimizeRelativeTime:false, //  用于判断相对时间是否需要添加提前/延后N天的条件，如果后面需要前部添加的话，则去掉此处的provide以及子组件的inject
            };
        },
        props: {
            controller: Object,
            writable: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                requestLoading: true,
                name: '',
                optionsData: {
                    authorizerInfoId: '',
                    customerFieldList: [],      // 联系人属性列表
                    eventFieldList: [],         // 行为事件列表
                    journeyGroupData: [],       // 旅程分组列表
                    tabList: [],                // 标签
                    formList: [],   //表单列表
                    wechatList: [],   //粉丝列表
                    wecomStaffNameList:[],      //企业微信所属员工name列表
                    wecomStaffMobileList:[],    //企业微信所属员工mobile列表
                    wecomStaffEmailList:[],     //企业微信所属员工Email列表
                    wecomGroupNameList: [],     //企业微信联系人所属群名称
                    groupOfWay:[                //行为事件-联系人加企业微信群-入群方式
                        {name: this.$t('swarm.intoGroup'), id:'由群成员邀请入群（直接邀请入群）'},
                        {name:this.$t('swarm.linkGroup'), id:'由群成员邀请入群（通过邀请链接入群）'},
                        {name:this.$t('swarm.qrCodeGroup'), id:'通过扫描群二维码入群'}],
                    executionStatus: [          //行为事件-联系人企业群发-联系人-执行状态未发送
                        {name:this.$t('journeyList.completed'),id:'已完成'},
                        {name:this.$t('swarm.bennSend'),id:'已发送'},
                        {name:this.$t('swarm.noSend'),id:'未发送'},
                    ],
                    relationDictionary: {
                        stringDictionary: [],   // 字符串类型
                        numberDictionary: [],   // 数值类型
                        dateDictionary: [],     // 日期类型
                        arrayDictionary: [],    // 数组类型
                        doCondition: []
                    },
                    selectorOptions: [],        // 条件分支首选项
                    taskList: {                 // 互动事件的末级选项列表
                        email: [],
                        SMS: [],
                        wechat: [],
                        emailTemplate: [],
                        agentMsg: []
                    },
                    scrmSwarmList: [],          // 受众来源的末级分群列表
                    taskTempList: [],           //参与记录的末级选项列表
                    tagList: [],
                    masterWechat: []            //子账号获取主账号当前控件用到的公众号信息
                },
                selectResult: {
                    act:  'and',
                    status: 0,
                    filter_json:[
                        {
                            type:  'contact',
                            act: 'and',
                            actChildren: 'and',
                            status: 0,
                            rules: []
                        },
                        {
                            type: 'event',
                            act: 'and',
                            actChildren: 'and',
                            status: 0,
                            rules: []
                        },
                        {
                            type: 'Journey_event',
                            act: 'and',
                            actChildren: 'and',
                            status: 0,
                            rules: []
                        }
                    ]
                },
                contactLoog: [],
                eventLoog: [],
                interactiveLoog: [],
                eventListLoading: false
            };
        },
        computed: {
            ...mapState({
                validationResult: state => state[DRAGGABLE_JOURNEY_STORE_NAME].validationResult,
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                // 特殊id,用于隐藏'全部联系人'项
                hiddenId: state => state.canvasStore.hiddenId,
                settings (state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME]
                        .canvasInformation.controllers[this.controller.id]
                        .processInfo.decision.settings;
                },
                authorizerInfoId: state => state.user.authorizerInfoId,
                lang: state => state[I18N_STORE_NAME].lang === 'zh-CN'
            })
        },
        created() {
            // recover name
            this.name = this.controller.name;

            const settings = this.settings;
            if (
                (settings && settings.filter_json && settings.filter_json[0].rules.length) ||
                (settings && settings.filter_json && settings.filter_json[1].rules.length) ||
                (settings && settings.filter_json && settings.filter_json[2].rules.length)
            ) {
                this.selectResult = cloneDeep(settings);
                //初始化时，清洗旧数据，将事件块内的单条事件/单条属性的act关系修正为'and'
                this.resetAct(0);
                this.resetAct(1);
                this.resetAct(2);
                this.contactLoog = settings.filter_json[0].rules.map(() => uniqId());
                this.eventLoog = settings.filter_json[1].rules.map(() => uniqId());
                this.interactiveLoog = settings.filter_json[2].rules.map(() => uniqId());
            }
            Promise
                .all([
                    ContactApiV3.decisionOptions(),
                    this.getTagListRequest(),
                    JourneyApiV3.getTaskTempList(this.journeyInformation.id),
                    ContactApiV1.customWorld(0,1,'',1),
                    ContactApiV1.relation(),
                    JourneyApiV3.getGroupList(),
                    ContactApiV1.getSwarms(),
                    ContactApi.getEventGroupList(),
                    QuestionnaireApiV1.getFormListNoPage(0),
                    WechatApiV1.isBindWeChat(),
                    this.getWechatListRequest(),
                    this.getStaffList(),
                    this.getWecomGroupList()
                ])
                .then((values) => {
                    this.optionsData.selectorOptions = values[0].body.data;
                    this.tagListHandler(values[1]);
                    this.getTaskTempListHandler(values[2]);
                    this.customerFieldHandler(values[3]);
                    this.relationHandler(values[4]);
                    this.journeyGroupHandler(values[5]);
                    this.scrmSwarmListHandler(values[6]);
                    this.eventFieldHandler(values[7]);
                    this.getFormListHandler(values[8]);
                    this.allWechatListHandler(values[9]);
                    this.wechatListHandler(values[10]);
                    this.getStaffList(values[11]);
                    this.getWecomGroupList(values[12]);
                    this.requestLoading = false;
                });

            this.getPrepositionTask({
                journeyId: this.journeyInformation.id,
                type: 'all',
                controllerId: this.controller.id
            });
        },
        methods: {
            ...mapMutations([
                UPDATE_CONTROLLER
            ]),
            ...mapActions([
                SAVE_JOURNEY,
            ]),
            getTagListRequest() {
                return this.authorizerInfoId
                    ? WechatApiV1.getJourneyTagList()
                    : Promise.resolve({body: {code: 200, data: {tagList: []}}});
            },
            tagListHandler(val) {
                this.optionsData.tagList = val.body.data.tagList.map((i) => {
                    i.id = i.tagId;
                    return i;
                });
            },
            scrmSwarmListHandler(val) {
                // 删除"全部联系人"控件
                this.optionsData.scrmSwarmList = val.body.data.swarmList.filter(swarm => swarm.id !== this.hiddenId);
            },
            getTaskTempListHandler(val) {
                this.optionsData.taskTempList = val.body.data.taskTemplateList.map((i) => {
                    i.name = i.taskName;
                    return i;
                });
            },
            getPrepositionTask() {
                ['email', 'SMS', 'wechat', 'emailTemplate', 'agentMsg'].forEach((type, index) => {
                    JourneyApiV3
                        .prepositionTask(type === 'agentMsg' ?
                            {
                                journeyId: this.journeyInformation.id,
                                type: 5,
                                subType: 2,
                                controllerId: this.controller.id
                            } :
                            {
                                journeyId: this.journeyInformation.id,
                                type: index + 1, // 1,2,3分别代表邮件、短信、微信
                                controllerId: this.controller.id
                            }
                        )
                        .then(({body: {data: {taskList}}}) => {
                            this.optionsData.taskList[type] = taskList
                                .map(task => ({name: task.taskName, ...task}));
                        });
                });
            },
            // 获取公众号列表
            getWechatListRequest() {
                return WechatApiV1.getWechatAccounts();
            },
            customerFieldHandler(val) {
                let wechatAttr = [];
                let othAttr = [];
                let rating = [];
                val.body.data.customerFieldList.map(e => {
                    let tag = {};
                    tag.name = this.lang ? e.fieldCn : e.nameEn;
                    tag.id = e.id;
                    tag.type = e.fieldType;
                    tag.fieldName = e.fieldName;
                    // e.isWechat ? wechatAttr.push(tag) : othAttr.push(tag);
                    if (e.isWechat) {
                        wechatAttr.push(tag);
                    } else if (e.isScoring){
                        rating.push(tag);
                    } else {
                        othAttr.push(tag);
                    }
                });
                let len = othAttr.length;
                let basic = [], member = [], tag = [], wecomAttr = [], consume = [], senior = [], etc = [], mini = [];
                for (let i = 0; i < len; i++) {
                    switch (Boolean(othAttr[i])) {
                        case ['mobile', 'email', '微信openid', 'unionid', 'customer_id', 'name', 'sex', 'address', 'create_date', 'update_date', 'job_title_dmt',
                            'company_type_dmt', 'number_of_Employees_dmt', 'budget_amount', 'sex_dmt', 'annual_revenue', 'company_name_dmt'].includes(othAttr[i].fieldName):
                            basic.push(othAttr[i]);
                            break;
                        case ['member_id', 'integral', '会员等级', '会员加入日期', 'member_grade', 'member_date', '会员状态', 'customer_create_date'].includes(othAttr[i].fieldName):
                            member.push(othAttr[i]);
                            break;
                        case ['微信标签', '系统标签', '会员标签', '粉丝标签', 'label_ids'].includes(othAttr[i].fieldName):
                            tag.push(othAttr[i]);
                            break;
                        case ['sale_count', 'sale_total', 'first_sale_date', 'last_sale_date'].includes(othAttr[i].fieldName):
                            consume.push(othAttr[i]);
                            break;
                        case ['price_index', 'active_index', 'consume_index', 'wechat_influence_date', 'sms_influence_date', 'mail_influence_date'].includes(othAttr[i].fieldName):
                            senior.push(othAttr[i]);
                            break;
                        case ['wecom_sex', 'wecom_name', 'wecom_corp_full_name', 'wecom_staff_name', 'wecom_staff_mobile', 'wecom_staff_email',
                            'wecom_group_name','wecom_source', 'wecom_channel_code','external_userid'].includes(othAttr[i].fieldName):
                            wecomAttr.push(othAttr[i]);
                            break;
                        case ['miniprogram_openid', 'miniprogram_nickname', 'miniprogram_avatarUrl'].includes(othAttr[i].fieldName):
                            mini.push(othAttr[i]);
                            break;
                        default:
                            etc.push(othAttr[i]);
                            break;
                    }
                }
                this.optionsData.customerFieldList = [
                    {name: this.$t('swarm.basicInfo'),id: 0,child: basic},
                    {name: this.$t('swarm.memberInfo'),id: 1,child: member},
                    {name: this.$t('swarm.labelInfo'),id: 2,child: tag},
                    {name: this.$t('swarm.consumerInfo'),id: 3,child: consume},
                    {name: this.$t('swarm.advancedInfo'),id: 4,child: senior},
                    {name: this.$t('swarm.wechatInfo'),id: 5,child: wechatAttr},
                    {name: '企业微信',id: 7,child: wecomAttr},
                    {name: this.$t('swarm.customInfo'),id: 6,child: etc},
                    {name: this.$t('swarm.scoringInfo'),id: 8,child: rating },
                    {name: this.$t('swarm.miniprogramInfo'), id: 9, child: mini }
                ];
            },
            eventFieldHandler(val) {
                this.optionsData.eventFieldList = val.body.data.contactEvnentsGroupDTO.map((e,i) => {
                    let eventGroup = {};
                    eventGroup.id = e.id;
                    eventGroup.fieldName = e.name;
                    eventGroup.name = this.lang ? e.nameCn : e.nameEn;
                    eventGroup.child = [];
                    ContactApi
                        .getEventList(e.id)
                        .then(res => {
                            eventGroup.child = res.body.data.contactEvnentsDTO.map(v => {
                                let events = {};
                                events.id = v.id;
                                events.fieldName = v.nameEs;
                                events.name = this.lang ? v.nameCn : v.nameEn;
                                events.event_group = e.name;
                                events.event_group_id = v.evnentsGroupId;
                                return events;
                            });
                            if (i === (val.body.data.contactEvnentsGroupDTO.length - 1)) {
                                this.eventListLoading = true;
                            }
                        });
                    return eventGroup;
                });
            },
            getFormListHandler(val) {
                this.optionsData.formList = val.body.data.papers.map(e => {
                    let form = {};
                    form.name = e.paperName;
                    form.id = e.id;
                    return form;
                });
            },
            // 获取公众号列表
            wechatListHandler(res) {
                this.optionsData.wechatList = res.body.data.authorizerInfoList
                    .map(({authorizerInfoId: id, principalName: name}) => ({id, name}));
            },
            relationHandler(val) {
                // 标签列表
                this.optionsData.tabList = val.body.data.groupList
                    .map(tag => ({
                        id: tag.groupId,
                        name: tag.groupName
                    }));
                // 各类型关系选择列表
                let fieldObject = val.body.data.operators;
                this.optionsData.relationDictionary.stringDictionary = fieldObject.str.map(element => {
                    let str = {};
                    str.name = element.operatorCn;
                    str.id = element.operator;
                    str.type = element.type;
                    str.limitSize = element.limitSize;
                    return str;
                });
                this.optionsData.relationDictionary.numberDictionary = fieldObject.num.map(element => {
                    let num = {};
                    num.name = element.operatorCn;
                    num.id = element.operator;
                    num.type = element.type;
                    num.limitSize = element.limitSize;
                    return num;
                });
                this.optionsData.relationDictionary.dateDictionary = fieldObject.dat.map(element => {
                    let dat = {};
                    dat.name = element.operatorCn;
                    dat.id = element.operator;
                    dat.type = element.type;
                    dat.limitSize = element.limitSize;
                    return dat;
                });
                this.optionsData.relationDictionary.arrayDictionary = fieldObject.arr.map(element => {
                    let arr = {};
                    arr.name = element.operatorCn;
                    arr.id = element.operator;
                    arr.type = element.type;
                    arr.limitSize = element.limitSize;
                    return arr;
                });
                this.optionsData.relationDictionary.doCondition = fieldObject.num_event_count.map(element => {
                    let ec = {};
                    ec.name = element.operatorCn;
                    ec.id = element.operator;
                    ec.type = element.type;
                    ec.limitSize = element.limitSize;
                    return ec;
                });
            },
            journeyGroupHandler(val) {
                let allGroup = val.body.data.rootGroup.childs;
                this.getJourneyGroupData(allGroup);
            },
            // 旅程分组列表动态加载
            getJourneyGroupData(group) {
                if (group && group.length) {
                    group.forEach(item => {
                        if (item.childs && item.childs.length) {
                            this.getJourneyGroupData(item.childs);
                        }
                        delete item.childs;
                        this.optionsData.journeyGroupData.push(item);
                    });
                }
            },
            // 处理子账号查看共享旅程时，公众号的数据
            allWechatListHandler(val) {
                let wechatList = val.body.data.wechatList.map((e,i) => {
                    let wechat = {};
                    wechat.index = i;
                    wechat.limitSize = 0;
                    wechat.operator = 'subscription';
                    wechat.operatorCn = e.wechatName;
                    wechat.value = e.appid;
                    wechat.wechatId = e.id;
                    return wechat;
                });
                this.optionsData.masterWechat = wechatList;
                if (!this.writable) {
                    this.optionsData.selectorOptions.authorizerInfoList = wechatList;
                }
            },
            //获取员工列表
            getStaffList() {
                WecomApiV1
                    .getStaffListNoPage(1)
                    .then((res) => {
                        let resList = res.body.data.staffList.filter(e => e.value !== '');
                        this.optionsData.wecomStaffNameList = resList.map(e => {
                            let arr = {};
                            arr.id = e.userId;
                            arr.name = e.value;
                            return arr;
                        });
                    });
                WecomApiV1
                    .getStaffListNoPage(2)
                    .then((res) => {
                        let resList = res.body.data.staffList.filter(e => e.value !== '');
                        this.optionsData.wecomStaffMobileList = resList.map(e => {
                            let arr = {};
                            arr.id = e.userId;
                            arr.name = e.value;
                            return arr;
                        });
                    });
                WecomApiV1
                    .getStaffListNoPage(3)
                    .then((res) => {
                        let resList = res.body.data.staffList.filter(e => e.value !== '');
                        this.optionsData.wecomStaffEmailList = resList.map(e => {
                            let arr = {};
                            arr.id = e.userId;
                            arr.name = e.value;
                            return arr;
                        });
                    });
            },
            //拉取企业微信群列表
            getWecomGroupList() {
                WecomApiV1
                    .getWecomGroupList()
                    .then((res) => {
                        res.body.data.groupList.forEach(e => {
                            if (!e.value) e.value = this.$t('common.groupChatNameNotSet');
                        });
                        let resList = res.body.data.groupList;

                        this.optionsData.wecomGroupNameList = resList.map(e => {
                            let arr = {};
                            arr.id = e.chatId;
                            arr.name = e.value;
                            return arr;
                        });
                    });
            },
            // 添加一条规则
            addStripItem(groupItem,type) {
                let addItem = {};
                addItem.act = groupItem.actChildren;
                if (groupItem.type === 'event') {
                    addItem.event_group = '';
                    addItem.event_group_id = '';
                    addItem.event = '';
                    addItem.event_id = '';
                    addItem.actChildren = 'and';
                    addItem.item_rules = [];
                } else {
                    addItem.field_id = '';
                    addItem.field = '';
                    addItem.field_name = '';
                    addItem.field_type = '';
                    addItem.operation = '';
                    addItem.value = '';
                    addItem.limitSize = 0;
                    addItem.relative_type = 0;
                }
                if (groupItem.type === 'Journey_event') {
                    addItem = {};
                    addItem.act = groupItem.actChildren;
                    addItem.event_group = '';
                    addItem.event = '';
                    addItem.operation = 'eq';
                    addItem.value = '';
                    addItem.relative_type = 0;
                    addItem.echo = {
                        opt1: '',
                        opt2: '',
                        opt3: ''
                    };
                }

                if (type === 'contact') {
                    if (this.contactLoog.length >= 15) {
                        this.$toast(this.$t('swarm.mostFifteen'),'warn');
                        return;
                    }
                    this.contactLoog.push(uniqId());
                } else if (type === 'event') {
                    if (this.eventLoog.length >= 15) {
                        this.$toast(this.$t('swarm.mostFifteen'),'warn');
                        return;
                    }
                    this.eventLoog.push(uniqId());
                } else if (type === 'Journey_event') {
                    if (this.interactiveLoog.length >= 15) {
                        this.$toast(this.$t('swarm.mostFifteen'),'warn');
                        return;
                    }
                    this.interactiveLoog.push(uniqId());
                }
                groupItem.rules.push(addItem);
            },
            // 删除一条规则
            deleteResult(autoSave,index,type) {
                if (type === 'contact') {
                    this.contactLoog.splice(index, 1);
                    this.selectResult.filter_json[0].rules.splice(index, 1);
                    this.resetAct(0);
                } else if (type === 'event') {
                    this.eventLoog.splice(index, 1);
                    this.selectResult.filter_json[1].rules.splice(index, 1);
                    this.resetAct(1);
                } else if (type === 'Journey_event') {
                    this.interactiveLoog.splice(index, 1);
                    this.selectResult.filter_json[2].rules.splice(index, 1);
                    this.resetAct(2);
                }
                if (autoSave) {
                    this.confirm(autoSave);
                }
            },
            // 确定一条规则
            resultChange(result,stripIndex,stripType) {
                if (stripType === 'contact') {
                    if (this.selectResult.filter_json[0].rules[stripIndex]) {
                        this.selectResult.filter_json[0].rules[stripIndex] = result;
                    } else {
                        this.$set(this.selectResult.filter_json[0].rules, stripIndex, result);
                    }
                } else if (stripType === 'event') {
                    if (this.selectResult.filter_json[1].rules[stripIndex]) {
                        this.selectResult.filter_json[1].rules[stripIndex] = result;
                    } else {
                        this.$set(this.selectResult.filter_json[1].rules, stripIndex, result);
                    }
                } else if (stripType === 'Journey_event') {
                    if (this.selectResult.filter_json[2].rules[stripIndex]) {
                        this.selectResult.filter_json[2].rules[stripIndex] = result;
                    } else {
                        this.$set(this.selectResult.filter_json[2].rules, stripIndex, result);
                    }
                }
            },
            changeAct(type,act) {
                if (!this.writable) {
                    return;
                }
                this.selectResult.filter_json[type].actChildren = act;
                for (let i = 0; i < this.selectResult.filter_json[type].rules.length; i++) {
                    this.selectResult.filter_json[type].rules[i].act = act;
                }
            },
            // 提交
            confirm(autoSave) {
                // 数据没有显示出来时，点击确定按钮会直接关闭表单
                if (this.requestLoading) {
                    this.close();
                }

                if (!this.name) {
                    this.$toast(this.$t('controller.controlsName'), 'warn');
                    return;
                }
                let conditionNum = 0;
                conditionNum = this.selectResult.filter_json[0].rules.length
                    + this.selectResult.filter_json[1].rules.length
                    + this.selectResult.filter_json[2].rules.length;
                if (conditionNum < 1) {
                    this.$toast(this.$t('controller.emptyCondition'),'warn');
                    return;
                }
                let validContact, validEvent, validOth;
                if (this.selectResult.filter_json[0].rules.length > 0) {
                    let res = this.$refs.contactSettings.filter(contact => {
                        return !contact.valid();
                    });
                    validContact = res.length > 0;
                }
                if (this.selectResult.filter_json[1].rules.length > 0) {
                    let result = this.$refs.eventSettings.filter(event => {
                        return !event.valid();
                    });
                    validEvent = result.length > 0;
                }
                if (this.selectResult.filter_json[2].rules.length > 0) {
                    let result = this.$refs.otherSettings.filter(other => {
                        return !other.othValidSingleRule();
                    });
                    validOth = result.length > 0;
                }

                if (validContact || validEvent || validOth) {
                    return;
                }

                let temp = cloneDeep(this.controller);
                temp.name = this.name;
                for (let item of this.selectResult.filter_json) {
                    if (item.type === 'Journey_event') {
                        for (let rule of item.rules) {
                            if (
                                rule.echo.opt1 === 'email' ||
                                rule.echo.opt1 === 'mobile' ||
                                rule.echo.opt1 === 'wechat' ||
                                rule.echo.opt1 === 'agentMsg'
                            ) {
                                temp.processInfo.decision.isInteraction = 1;
                            }
                        }
                    } else {
                        for (let rule of item.rules) {
                            if (
                                rule.field_name === 'mail_influence_date' ||
                                rule.field_name === 'sms_influence_date' ||
                                rule.field_name === 'wechat_influence_date'
                            ) {
                                temp.processInfo.decision.isInteraction = 1;
                            }
                        }
                    }
                }
                temp.processInfo.decision.settings = this.selectResult;
                this.UPDATE_CONTROLLER(temp);
                this.SAVE_JOURNEY();
                if (!autoSave) {
                    this.close();
                }
            },
            close() {
                this.$emit('close');
            },
            resetAct(index) {
                if (this.selectResult.filter_json[index].rules && this.selectResult.filter_json[index].rules.length === 1) {
                    this.selectResult.filter_json[index].actChildren = 'and';
                    this.selectResult.filter_json[index].rules[0].act = 'and';
                }
            }
        },

        components: {DecisionSelector, eventSettings}
    };
</script>
<style lang="scss" scoped>
    @import "../../../../../../common/scss/base/variables";
    @import '../../../../../../common/scss/base/mixin';
    .modal-item{
        .field-group{
            .condition-bunch {
                .just {
                    background-color: #cccccc;
                    cursor: default;
                }
                .chooseBox {
                    .choose{
                        margin: 10px 0 10px 15px;
                        position: relative;
                        .maybe {
                            position: absolute;
                            top: 50%;
                            left: 0;
                            text-align: center;
                            line-height: 22px;
                            margin-left: -12px;
                            margin-top: -12px;
                            @include border-radius(5px);
                            background-color: #0cc4a9;
                            color: #ffffff;
                            width: 24px;
                            height: 24px;
                            cursor: pointer;
                            &.disabled {
                                background-color: $disabled;
                                cursor: default;
                            }
                        }
                    }

                    .count-1 {
                        border-left: 1px #cccccc solid;

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
    }
</style>
