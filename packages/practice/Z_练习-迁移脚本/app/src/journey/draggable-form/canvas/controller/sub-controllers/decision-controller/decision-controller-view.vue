<template>
    <modal class="decision-controller-view" :title="controller.name" size="sl" @close="close()">
        <inline-loading v-if="requestLoading || !eventListLoading"/>
        <template v-else>
            <div class="form-field flex modal-item">
                <label class="label">{{'controller.conditions' | t}}</label>
                <div class="field-group">
                    <div class="decision-conditions">
                        <div class="condition-bunch">
                            <div class="just" v-if="conditionAct === 'and'">{{'common.and' | t}}</div>
                            <div class="just" v-if="conditionAct === 'or'">{{'common.or' | t}}</div>
                            <div class="chooseBox">
                                <div class="user">
                                    <span>{{'swarm.contactAttribute' | t}}</span>
                                </div>
                                <attributeViews v-for="(cItem,cIndex) in selectResult.filter_json[0].rules"
                                                :key="cIndex"
                                                :stripItem="cItem"
                                                :type="selectResult.filter_json[0].type"
                                                :optionsData="optionsData"/>
                            </div>
                            <div class="chooseBox">
                                <div class="user">
                                    <span>{{'swarm.eventAttribute' | t}}</span>
                                </div>
                                <attributeViews v-for="(eItem,eIndex) in selectResult.filter_json[1].rules"
                                                :key="eIndex"
                                                :stripItem="eItem"
                                                :type="selectResult.filter_json[1].type"
                                                :optionsData="optionsData"/>
                            </div>
                            <div class="chooseBox">
                                <div class="user">
                                    <span>{{'swarm.OtherInteractive' | t}}</span>
                                </div>
                                <decisionViews v-for="(oItem,oIndex) in selectResult.filter_json[2].rules"
                                                :key="oIndex"
                                                :act="conditionAct"
                                                :stripItem="oItem"
                                                :optionsData="optionsData"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template v-slot:buttons>
            <input type="button" class="btn btn-md btn-theme" @click="close()" :value="$t('common.close')"/>
        </template>
    </modal>
</template>

<script type="text/ecmascript-6">
    import { ContactApiV1, ContactApiV3, WecomApiV1, JourneyApiV3, ContactApi, QuestionnaireApiV1, WechatApiV1 } from '@/api';
    import cloneDeep from 'lodash/cloneDeep';
    import attributeViews from '../attribute-condition-controller/attribute-edit-modal/attribute-views.vue';
    import decisionViews from './components/decision-views.vue';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {I18N_STORE_NAME} from '@/locales';
    import { mapState } from 'vuex';
    
    export default {
        props: {
            controller: Object
        },
        data() {
            return {
                requestLoading: true,
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
                        {name:this.$t('swarm.intoGroup'), id:'由群成员邀请入群（直接邀请入群）'},
                        {name:this.$t('swarm.linkGroup'), id:'由群成员邀请入群（通过邀请链接入群）'},
                        {name:this.$t('swarm.qrCodeGroup'), id:'通过扫描群二维码入群'}
                    ],
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
                    tagList: []
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
                conditionAct: 'and',
                eventListLoading: false
            };
        },
        computed: {
            ...mapState({
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
            }),
        },
        created() {
            const settings = this.settings;
            if (
                (settings && settings.filter_json && settings.filter_json[0].rules.length) ||
                (settings && settings.filter_json && settings.filter_json[1].rules.length) ||
                (settings && settings.filter_json && settings.filter_json[2].rules.length)
            ) {
                this.selectResult = cloneDeep(settings);
                this.conditionAct = settings.filter_json[0].actChildren ||
                    settings.filter_json[1].actChildren ||
                    settings.filter_json[2].actChildren;
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
                    this.getWechatListRequest(),
                    this.getStaffList(),
                    this.getWecomGroupList()
                ])
                .then((values) => {
                    this.optionsData.selectorOptions = values[0].body.data;
                    this.tagListHandler(values[1]);
                    this.fansListHandler(values[1]);
                    this.getTaskTempListHandler(values[2]);
                    this.customerFieldHandler(values[3]);
                    this.relationHandler(values[4]);
                    this.journeyGroupHandler(values[5]);
                    this.scrmSwarmListHandler(values[6]);
                    this.eventFieldHandler(values[7]);
                    this.getFormListHandler(values[8]);
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
                                type: 5,    //企业微信
                                subType: 2,     //子任务类型（0：客服消息，1：模板消息，2：应用消息，3：群发消息）
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
                val.body.data.customerFieldList.map(e => {
                    let tag = {};
                    tag.name = this.lang ? e.fieldCn : e.nameEn;
                    tag.id = e.id;
                    tag.type = e.fieldType;
                    tag.fieldName = e.fieldName;
                    e.isWechat ? wechatAttr.push(tag) : othAttr.push(tag);
                });
                let len = othAttr.length;
                let basic = [], member = [], tag = [], wecomAttr = [], consume = [], senior = [], etc = [];
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
                            'wecom_group_name','wecom_source', 'wecom_channel_code', 'external_userid'].includes(othAttr[i].fieldName):
                            wecomAttr.push(othAttr[i]);
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
                    {name: this.$t('swarm.customInfo'),id: 6,child: etc}
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
                        let resList = res.body.data.groupList.filter(e => e.value !== '');
                        this.optionsData.wecomGroupNameList = resList.map(e => {
                            let arr = {};
                            arr.id = e.chatId;
                            arr.name = e.value;
                            return arr;
                        });
                    });
            },
            close() {
                this.$emit('close');
            }
        },
        components: {decisionViews, attributeViews}
    };
</script>
