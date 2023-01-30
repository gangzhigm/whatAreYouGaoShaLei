<template>
    <!-- 属性判断控件modal -->
    <!-- 表单 -->
    <attribute-controller-form v-if="!requestLoading && writable && eventListLoading && !isChecking"
                               :optionsData="optionsData"
                               :controller="controller"
                               @close="close"/>
    <!-- 查看详情 -->
    <!-- <attribute-controller-view v-else-if="!requestLoading && (!writable || isChecking) && eventListLoading"
                               :optionsData="optionsData"
                               :controller="controller"
                               @close="close"/> -->
    <attribute-controller-form v-else-if="!requestLoading && (!writable || isChecking) && eventListLoading"
        :optionsData="optionsData" :controller="controller" :writable="false" @close="close"/>
</template>

<script type="text/ecmascript-6">
    import {I18N_STORE_NAME} from '@/locales';
    import { mapMutations, mapState} from 'vuex';
    import { ContactApiV1,WecomApiV1, JourneyApiV3, ContactApi, QuestionnaireApiV1, WechatApiV1 } from '@/api';
    import AttributeControllerForm from './attribute-edit-modal/attribute-condition-controller-form.vue';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {ATTRIBUTE_CONDITION_CONTROLLER, getModalName} from '../../CONTROLLER_TYPES';
    import {SET_ACTIVE_CONTROLLER} from '@/store/vuex/mutationTypes';

    export default {
        name: getModalName(ATTRIBUTE_CONDITION_CONTROLLER),
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
                    wechatList: [],   //公众号列表
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
                        {name:this.$t('swarm.noSend'),id:'未发送'},],
                    relationDictionary: {
                        stringDictionary: [],   // 字符串类型
                        numberDictionary: [],   // 数值类型
                        dateDictionary: [],     // 日期类型
                        arrayDictionary: [],    // 数组类型
                        doCondition: []
                    }
                },
                eventListLoading: false
            };
        },
        created() {
            let promiseList = [
                ContactApiV1.customWorld(0,1,'',1),
                ContactApi.getEventGroupList(),
                ContactApiV1.relation(),
                JourneyApiV3.getGroupList(),
                QuestionnaireApiV1.getFormListNoPage(0),
                this.getWechatListRequest(),
                this.getStaffList(),
                this.getWecomGroupList()
            ];
            Promise.all(promiseList)
                .then((values) => {
                    this.customerFieldHandler(values[0]);
                    this.eventFieldHandler(values[1]);
                    this.relationHandler(values[2]);
                    this.journeyGroupHandler(values[3]);
                    this.getFormListHandler(values[4]);
                    this.wechatListHandler(values[5]);
                    this.getStaffList(values[6]);
                    this.getWecomGroupList(values[7]);

                    this.requestLoading = false;
                });
        },
        methods: {
            ...mapMutations([
                SET_ACTIVE_CONTROLLER
            ]),
            close() {
                this.SET_ACTIVE_CONTROLLER('');
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
                    tag.field = e.field;
                    // e.isWechat ? wechatAttr.push(tag) : othAttr.push(tag);
                    // e.isScoring ? rating.push(tag) : othAttr.push(tag);
                    if (e.isWechat) {
                        wechatAttr.push(tag);
                    } else if (e.isScoring) {
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
                            'wecom_group_name','wecom_source', 'wecom_channel_code', 'external_userid'].includes(othAttr[i].fieldName):
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
                    {name: this.$t('home.wecom'),id: 7,child: wecomAttr},
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
            // 获取公众号列表
            getWechatListRequest() {
                return WechatApiV1.getWechatAccounts();
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
        },
        computed: {
            ...mapState({
                storeName: state => state[DRAGGABLE_JOURNEY_STORE_NAME],
                lang: state => state[I18N_STORE_NAME].lang === 'zh-CN'
            }),
            activeControllerId() {
                return this.storeName.activeControllerId;
            },
            isChecking() {
                return this.storeName.isChecking;
            },
            controller () {
                return this.storeName.canvasInformation.controllers[this.activeControllerId];
            },
            writable() {
                return this.$store.getters.journeyWritable;
            }
        },
        components: {AttributeControllerForm}
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .attribute-condition-controller-form,
    .attribute-condition-controller-view {

        // 内部两个弹出层都用到了
        .combination-relation {
            float: left;
            width: $input-field-height*1.5;
            // 时区逻辑添加一行字，这里需要减掉 （2019-09-12）
            height: calc(100% - 32px);
            position: relative;
            $size: $input-field-height;

            &:before {
                content: '';
                position: absolute;
                left: $size/2 - 5px;
                top: $size/2;
                right: 0;
                height: 50%;
                border-left: 2px solid #0cc4a9;
                border-top: 2px solid #0cc4a9;
            }

            &:after {
                content: '';
                position: absolute;
                left: $size/2 - 5px;
                bottom: $size/2;
                right: 0;
                height: 50%;
                border-left: 2px solid #0cc4a9;
                border-bottom: 2px solid #0cc4a9;
            }

            .relation-btn {
                position: absolute;
                z-index: 1;
                top: 50%;
                left: 0;
                margin-top: -$size/2 + 5px;
                padding: 0;
                width: $size - 10px;
                height: $size - 10px;
                line-height: $size - 10px;
                border: none;
                text-align: center;
                border-radius: 4px;
                background-color: #0cc4a9;
                color: white;
                cursor: pointer;
            }
        }
    }
    .attribute-condition-controller-view {
        .combination-relation {
            height: 100%;
        }
    }
</style>
