<template>
    <div class="condition-main">
        <inline-loading v-if="loading" />
        <div class="condition-bunch" v-else>
            <div class="just">{{'common.and' | t}}</div>
            <div v-if="groupItem.rules.length" :class="['chooseBox',{disabled: !writable}]" v-for="(groupItem,groupIndex) in swarmJson[0].filter_json" :key="groupItem.keyID">
                <div class="user">
                    <span v-if="groupItem.type === 'contact'">{{'swarm.contactAttribute' | t}}</span>
                    <span v-if="groupItem.type === 'event'">{{'swarm.eventAttribute' | t}}</span>
                    <span v-if="groupItem.type === 'sales'">{{'swarm.orderAttribute' | t}}</span>
                    <span v-if="groupItem.type === 'goods'">{{'swarm.productAttribute' | t}}</span>
                    <div class="add" :class="{disabled: !writable || groupItem.type === 'sales' || groupItem.type === 'goods'}" @click="addStripItem(groupItem)">
                        <i class="icon icon-tianjia"></i>
                    </div>
                </div>
                <div class="choose" :class="groupItem.rules.length > 1 ? 'count-1' : ''" v-if="groupItem.rules.length > 0">
                    <div class="maybe" v-if="groupItem.rules.length>1" :class="{disabled: !writable}" @click="switchAct(groupItem)">
                        <span v-if="groupItem.actChildren==='and'">{{'common.and' | t}}</span>
                        <span v-if="groupItem.actChildren==='or'">{{'common.or' | t}}</span>
                    </div>
                    <eventSettings v-if="groupItem.type === 'contact' || groupItem.type === 'event'" v-for="(stripItem,stripIndex) in groupItem.rules" :key="stripItem.keyID" ref="stripSettings" :writable="writable" :num="stripIndex" :canempty="true" :stripItem="stripItem" :type="groupItem.type" :optionsData="optionsData" :rulesLength="rulesLength" @select="resultChange($event,groupItem,stripIndex)" @delResult="deleteResult($event,groupItem,groupIndex,stripIndex)" />
                    <eventSettings v-if="groupItem.type === 'sales' || groupItem.type === 'goods'" v-for="(stripItem,stripIndex) in groupItem.rules" :key="stripItem.keyID" ref="stripSettings" :writable="false" :num="stripIndex" :canempty="true" :stripItem="stripItem" :type="groupItem.type" :optionsData="optionsData" :rulesLength="rulesLength" @select="resultChange($event,groupItem,stripIndex)" @delResult="deleteResult($event,groupItem,groupIndex,stripIndex)" />
                </div>
            </div>
            <!--添加条件簇-->
            <span class="add-bunch" :class="{disabled: !writable}" v-if="!bunchModelShow" @click.stop="bunchModelShow = true">{{'swarm.addBunch' | t}}</span>
            <div class="add-bunch-model" v-if="bunchModelShow">
                <div class="add-bunch-models">
                    <checkbox v-model="addBunch.contact">{{'swarm.contactBunch' | t}}</checkbox>
                    <checkbox v-model="addBunch.event">{{'swarm.eventBunch' | t}}</checkbox>
                </div>
                <button class="btn btn-sm btn-theme" @click.stop="AddBunch()">{{'swarm.add' | t}}</button>
                <button class="btn btn-sm btn-white" @click.stop="cancelAddBunch()">{{'common.cancel' | t}}</button>
            </div>
        </div>
    </div>
</template>

<script type="text/babel">

import { ContactApiV1, WecomApiV1, JourneyApiV3, ContactApi, QuestionnaireApiV1, WechatApiV1 } from '@/api';
import eventSettings from '../../../journey/draggable-form/canvas/controller/sub-controllers/attribute-condition-controller/attribute-edit-modal/event-settings.vue';
import cloneDeep from 'lodash/cloneDeep';
import { uniqId } from '@/store/vuex/modules/canvasStore';
import {I18N_STORE_NAME} from '@/locales';
import { mapState } from 'vuex';
export default {
    name: 'conditionBunch',
    components: { eventSettings },
    props: {
        bunchData: {
            type: Array,
            required: true
        },
        writable: {
            type: Boolean,
            default: true
        },
        /**
         * 获取自定义字段关系
         * type 权限限制 0是没有权限限制，非0是有权限限制，默认为1
         */
        hasPower: {
            type: Number,
            default: 1 
        }
    },
    watch: {
        loading (val) {
            this.$emit('loading', val);
        }
    },
    data () {
        return {
            swarmJson: [],     // 分群所有条件data
            //条件选项数据
            optionsData: {
                customerFieldList: [],      // 联系人属性列表
                eventFieldList: [],         // 行为事件列表
                salesSelectList: [],        // 订单属性列表
                goodsSelectList: [],        // 商品属性列表
                journeyGroupData: [],       // 旅程分组列表
                tabList: [],                // 标签
                formList: [],               // 表单列表
                wechatList: [],               // 公众号列表
                wecomStaffNameList: [],      //企业微信所属员工name列表
                wecomStaffMobileList: [],      //企业微信所属员工mobile列表
                wecomStaffEmailList: [],      //企业微信所属员工Email列表
                wecomGroupNameList: [],     //企业微信联系人所属群名称
                groupOfWay: [
                    { name: this.$t('swarm.intoGroup'), id: '由群成员邀请入群（直接邀请入群）' },
                    { name: this.$t('swarm.linkGroup'), id: '由群成员邀请入群（通过邀请链接入群）' },
                    { name: this.$t('swarm.qrCodeGroup'), id: '通过扫描群二维码入群' }],//行为事件-联系人加企业微信群-入群方式
                executionStatus: [
                    { name: this.$t('journeyList.completed'), id: '已完成' },
                    { name: this.$t('swarm.bennSend'), id: '已发送' },
                    { name: this.$t('swarm.noSend'), id: '未发送' },], //行为事件-联系人企业群发-联系人-执行状态
                relationDictionary: {
                    stringDictionary: [],   // 字符串类型
                    numberDictionary: [],   // 数值类型
                    dateDictionary: [],     // 日期类型
                    arrayDictionary: [],    // 数组类型
                    doCondition: []         // 做过时，条件选项
                }
            },
            eventListLoading: true,    //行为事件列表是否加载完毕
            bunchModelShow: false,    //添加条件簇选项显示
            addBunch: {    //添加的条件簇
                contact: false,
                event: false
            },
            requestLoading: true
        };
    },
    computed: {
        ...mapState({
            // 语言状态
            lang: state => state[I18N_STORE_NAME].lang === 'zh-CN'
        }),
        loading () {     //选项列表是否加载完成
            if (!this.requestLoading && !this.eventListLoading) {
                this.$emit('loaded');
                return false;
            }
            return true;
        },
        rulesLength () {
            let allRules = 0;
            for (let bunch of this.swarmJson[0].filter_json) {
                for (let rule of bunch.rules) {
                    if (rule.childs && rule.childs.length) {
                        allRules = allRules + rule.childs.length;
                    } else {
                        allRules = allRules + 1;
                    }
                }
            }
            if (allRules > 1) return true;
            return false;
        }
    },
    created () {
        if (this.bunchData.length > 0) {
            this.swarmJson = cloneDeep(this.bunchData);
            for (let bunch of this.swarmJson[0].filter_json) {
                bunch.keyID = uniqId();
                for (let rule of bunch.rules) {
                    rule.keyID = uniqId();
                    rule.isWarn = '';
                    if (rule.childs && rule.childs.length) {
                        for (let child of rule.childs) {
                            child.keyID = uniqId();
                            child.isWarn = '';
                        }
                    }
                }
                // 事件块中子事件为单条时，act关系重置为'and'
                if (bunch.rules && bunch.rules.length === 1) {
                    bunch.actChildren = 'and';
                    bunch.rules[0].act = 'and';
                }
            }
        } else {
            this.swarmJson = [{
                act: 'and',
                filter_json: [{
                    keyID: uniqId(),
                    act: 'and',
                    actChildren: 'and',
                    type: 'contact',
                    rules: [{
                        keyID: uniqId(),
                        act: 'and',
                        field_id: '',
                        field: '',
                        field_name: '',
                        field_type: '',
                        operation: '',
                        value: '',
                        limitSize: 0,
                        relative_type: 0
                    }]
                }, {
                    keyID: uniqId(),
                    act: 'and',
                    actChildren: 'and',
                    type: 'event',
                    rules: [{
                        keyID: uniqId(),
                        act: 'and',
                        event_group: '',
                        event_group_id: '',
                        event: '',
                        event_id: '',
                        actChildren: 'and',
                        item_rules: []
                    }]
                }]
            }];
        }
        let promiseList = [
            ContactApiV1.customWorld(0, 1, '', 1),
            ContactApi.getEventGroupList(),
            JourneyApiV3.getGroupList(),
            ContactApiV1.relation(this.hasPower),
            QuestionnaireApiV1.getFormListNoPage(0),
            this.getWechatListRequest(),
            this.getStaffList(),
            this.getWecomGroupList(),
        ];
        Promise.all(promiseList)
            .then((values) => {
                this.customerFieldHandler(values[0]);
                //this.salesFieldHandler(values[1]);
                //this.goodsFieldHandler(values[2]);
                this.eventFieldHandler(values[1]);
                this.journeyGroupHandler(values[2]);
                this.relationHandler(values[3]);
                this.getFormListHandler(values[4]);
                this.wechatListHandler(values[5]);
                this.getStaffList(values[6]);
                this.getWecomGroupList(values[7]);

                this.$emit('loaded');
                this.requestLoading = false;
            });
    },
    methods: {
        //联系人属性选项列表
        customerFieldHandler (res) {
            let wechatAttr = [];
            let othAttr = [];
            let rating = [];
            res.body.data.customerFieldList.map(e => {
                let tag = {};
                tag.name = this.lang ? e.fieldCn : e.nameEn;
                tag.id = e.id;
                tag.type = e.fieldType;
                tag.fieldName = e.fieldName;
                // e.isWechat ? wechatAttr.push(tag) : othAttr.push(tag);
                // e.isScoring ? rating.push(tag) : othAttr.push(tag);
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
                        'wecom_group_name', 'wecom_source', 'wecom_channel_code', 'external_userid'].includes(othAttr[i].fieldName):
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
                { name: this.$t('swarm.basicInfo'), id: 0, child: basic },
                { name: this.$t('swarm.memberInfo'), id: 1, child: member },
                { name: this.$t('swarm.labelInfo'), id: 2, child: tag },
                { name: this.$t('swarm.consumerInfo'), id: 3, child: consume },
                { name: this.$t('swarm.advancedInfo'), id: 4, child: senior },
                { name: this.$t('swarm.wechatInfo'), id: 5, child: wechatAttr },
                { name: this.$t('home.wecom'), id: 7, child: wecomAttr },
                { name: this.$t('swarm.customInfo'), id: 6, child: etc },
                { name: this.$t('swarm.scoringInfo'), id: 8, child: rating },
                { name: this.$t('swarm.miniprogramInfo'), id: 9, child: mini }
            ];
        },
        //订单属性选项列表
        //salesFieldHandler(res) {
        //    this.optionsData.salesSelectList = res.body.data.customerFieldList.map(e => {
        //        let sales = {};
        //        sales.name = e.fieldCn;
        //        sales.id = e.id;
        //        sales.type = e.fieldType;
        //        sales.fieldName = e.fieldName;
        //        return sales;
        //    });
        //},
        //商品属性选项列表
        //goodsFieldHandler(res) {
        //    this.optionsData.goodsSelectList = res.body.data.customerFieldList.map(e => {
        //        let goods = {};
        //        goods.name = e.fieldCn;
        //        goods.id = e.id;
        //        goods.type = e.fieldType;
        //        goods.fieldName = e.fieldName;
        //        return goods;
        //    });
        //},
        //行为事件选项列表
        eventFieldHandler (res) {
            if (!res.body.data.contactEvnentsGroupDTO.length) {
                this.eventListLoading = false;
            }
            let reqNum = 0;
            let intervalNum = 0;
            this.optionsData.eventFieldList = res.body.data.contactEvnentsGroupDTO.map((e, i) => {
                let eventGroup = {};
                eventGroup.id = e.id;
                eventGroup.fieldName = e.name;
                eventGroup.name = this.lang ? e.nameCn : e.nameEn;
                eventGroup.child = [];
                ContactApi
                    .getEventList(e.id)
                    .then(ress => {
                        eventGroup.child = ress.body.data.contactEvnentsDTO.map(v => {
                            let events = {};
                            events.id = v.id;
                            events.fieldName = v.nameEs;
                            events.name = this.lang ? v.nameCn : v.nameEn;
                            events.event_group = e.name;
                            events.event_group_id = v.evnentsGroupId;
                            return events;
                        });
                        reqNum += 1;
                    });

                return eventGroup;
            });
            let numInterval = setInterval(() => {
                intervalNum += 1;
                if (reqNum === this.optionsData.eventFieldList.length) {
                    clearInterval(numInterval);
                    this.eventListLoading = false;
                }
            }, 100);
            if (intervalNum > 300) {
                clearInterval(numInterval);
                this.eventListLoading = false;
            }
        },
        //获取旅程分组数据
        journeyGroupHandler (res) {
            let allGroup = res.body.data.rootGroup.childs;
            this.getJourneyGroupData(allGroup);
        },
        // 获取标签选项列表及字段关系
        relationHandler (res) {
            this.optionsData.tabList = res.body.data.groupList.map(e => {
                let arrList = {};
                arrList.name = e.groupName;
                arrList.id = e.groupId;
                return arrList;
            });
            let fieldObject = res.body.data.operators;
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
            this.optionsData.relationDictionary.stringDictionary = fieldObject.str.map(element => {
                let str = {};
                str.name = element.operatorCn;
                str.id = element.operator;
                str.type = element.type;
                str.limitSize = element.limitSize;
                return str;
            });
        },
        // 获取表单列表
        getFormListHandler (res) {
            this.optionsData.formList = res.body.data.papers.map(e => {
                let form = {};
                form.name = e.paperName;
                form.id = e.id;
                return form;
            });
        },
        // 获取公众号列表
        wechatListHandler (res) {
            this.optionsData.wechatList = res.body.data.authorizerInfoList
                .map(({ authorizerInfoId: id, principalName: name }) => ({ id, name }));
        },
        //获取员工列表
        getStaffList () {
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
        getWecomGroupList () {
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
        /**
         * 旅程分组列表初始化列表结构
         * @param group 旅程分组数据
         */
        getJourneyGroupData (group) {
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
        getWechatListRequest () {
            return WechatApiV1.getWechatAccounts();
        },
        /**
         * 校验数组多选框string类型
         * @param arr Array 被校验的数组
         * @returns {*}
         */
        validateStr (arr) {
            if (arr.length > 99) {
                this.$toast(this.$t('swarm.max99items'), 'warn');
                return false;
            } else if (!arr.every(e => { return e.length < 301 })) {
                this.$toast(this.$t('swarm.singleFormart') + this.$t('swarm.maxChars'), 'warn');
                return false;
            }
            return true;
        },
        /**
         * 校验数组多选框number类型
         * @param arr Array 被校验的数组
         * @returns {*}
         */
        validateNum (arr) {
            let string = /^\d+(\.\d+)?$/; // 非负浮点数
            if (arr.length > 99) {
                this.$toast(this.$t('swarm.max99items'), 'warn');
                return false;
            } else if (!arr.every(e => { return e.length < 13 && string.test(e) })) {
                this.$toast(this.$t('swarm.singleFormart') + this.$t('swarm.numberFormatLimit') + '12', 'warn');
                return false;
            }
            return true;
        },
        /**
         *  “且”，“或”
         * @param groupItem 条件簇数据
         */
        switchAct (groupItem) {
            if (!this.writable) return;
            if (groupItem.actChildren === 'and') {
                groupItem.actChildren = 'or';
                groupItem.rules.forEach(e => {
                    e.act = 'or';
                });
            } else if (groupItem.actChildren === 'or') {
                groupItem.actChildren = 'and';
                groupItem.rules.forEach(e => {
                    e.act = 'and';
                });
            }
        },
        /**
         * 添加一条规则
         * @param groupItem 条件簇数据
         */
        addStripItem (groupItem) {
            if (groupItem.rules.length >= 15) {
                this.$toast(this.$t('swarm.mostFifteen'), 'warn');
                return;
            }
            let addItem = {};
            addItem.keyID = uniqId();
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
            groupItem.rules.push(addItem);
        },
        /**
         * 确定一条规则
         * @param result 规则数据
         * @param groupItem 条件簇
         * @param stripIndex 条件索引
         */
        resultChange (result, groupItem, stripIndex) {
            this.$set(groupItem.rules, stripIndex, result);
            this.$emit('dataChange');
        },
        /**
         * 删除规则
         * @param groupItem 条件簇数据
         * @param groupIndex 条件簇索引
         * @param stripIndex 条件索引
         */
        deleteResult (autoSave, groupItem, groupIndex, stripIndex, childIndex) {
            let allRules = 0;
            for (let bunch of this.swarmJson[0].filter_json) {
                for (let rule of bunch.rules) {
                    if (rule.childs && rule.childs.length) {
                        allRules = allRules + rule.childs.length;
                    } else {
                        allRules = allRules + 1;
                    }
                }
            }
            if (allRules <= 1) {
                this.addStripItem(this.swarmJson[0].filter_json[0]);
            }
            this.$nextTick(() => {
                if (childIndex) {
                    groupItem.rules[stripIndex].childs.splice(childIndex, 1);
                } else if (groupItem.rules.length === 1) {
                    groupItem.rules.splice(stripIndex, 1);
                    this.$nextTick(() => {
                        this.swarmJson[0].filter_json.splice(groupIndex, 1);
                    });
                } else {
                    groupItem.rules.splice(stripIndex, 1);
                }
                for (let bunch of this.swarmJson[0].filter_json) {
                    if (bunch.rules && bunch.rules.length === 1) {
                        bunch.actChildren = 'and';
                        bunch.rules[0].act = 'and';
                    }
                }
                if (autoSave) {
                    let swarmJson = JSON.stringify(this.swarmJson);
                    this.$emit('valid', swarmJson, true);
                } else {
                    this.$emit('dataChange');
                }
            });
        },
        // 添加条件簇
        AddBunch () {
            let addNum = 0;
            Object.keys(this.addBunch).map((key) => {
                if (this.addBunch[key]) {
                    addNum = addNum + 1;
                }
            });
            if ((this.swarmJson[0].filter_json.length + addNum) > 15) {
                this.$toast(this.$t('swarm.mostFifteenBunch'), 'warn');
                this.cancelAddBunch();
                return;
            }
            Object.keys(this.addBunch).map((key) => {
                if (this.addBunch[key]) {
                    let bunch = {
                        keyID: uniqId(),
                        act: 'and',
                        actChildren: 'and',
                        type: key,
                        rules: [],
                    };
                    let rule = {};
                    rule.keyID = uniqId();
                    rule.act = 'and';
                    if (key === 'event') {
                        rule.event_group = '';
                        rule.event_group_id = '';
                        rule.event = '';
                        rule.event_id = '';
                        rule.actChildren = 'and';
                        rule.item_rules = [];
                    } else {
                        rule.field_id = '';
                        rule.field = '';
                        rule.field_name = '';
                        rule.field_type = '';
                        rule.operation = '';
                        rule.value = '';
                        rule.limitSize = 0;
                        rule.relative_type = 0;
                    }
                    bunch.rules.push(rule);
                    this.swarmJson[0].filter_json.push(bunch);
                }
            });
            this.cancelAddBunch();
        },
        //取消添加条件簇
        cancelAddBunch () {
            this.bunchModelShow = false;
            this.addBunch.contact = false;
            this.addBunch.event = false;
        },
        //整体校验并保存
        valid () {
            let stripValid = this.$refs.stripSettings.filter(strip => {
                return !strip.valid();
            });
            if (stripValid.length > 0) {
                this.$emit('unvalid', true);
                return;
            }
            // 校验通过
            this.$nextTick(() => {
                // 删除搜索展示列表字段
                let dataJSON = cloneDeep(this.swarmJson);
                let rulesNum = 0;
                for (let i = dataJSON[0].filter_json.length - 1; i >= 0; i--) {
                    delete dataJSON[0].filter_json[i].keyID;
                    for (let j = dataJSON[0].filter_json[i].rules.length - 1; j >= 0; j--) {
                        delete dataJSON[0].filter_json[i].rules[j].isWarn;
                        delete dataJSON[0].filter_json[i].rules[j].keyID;
                        if (dataJSON[0].filter_json[i].type === 'event') {
                            if (dataJSON[0].filter_json[i].rules[j].event_id) {
                                for (let k = dataJSON[0].filter_json[i].rules[j].item_rules.length - 1; k >= 0; k--) {
                                    delete dataJSON[0].filter_json[i].rules[j].item_rules[k].isWarn;
                                }
                                rulesNum++;
                            } else {
                                dataJSON[0].filter_json[i].rules.splice(j, 1);
                            }
                        } else {
                            if (dataJSON[0].filter_json[i].rules[j].field_id) {
                                rulesNum++;
                            } else {
                                dataJSON[0].filter_json[i].rules.splice(j, 1);
                            }
                        }
                    }
                    if (!dataJSON[0].filter_json[i].rules.length) {
                        dataJSON[0].filter_json.splice(i, 1);
                    } else {
                        rulesNum++;
                    }
                }
                if (!rulesNum) {
                    this.$toast(this.$t('swarm.contactBunchNotDelete'), 'warn');
                    return;
                }
                let swarmJson = JSON.stringify(dataJSON);
                this.$emit('valid', swarmJson);
                this.$emit('unvalid', false);
            });
        }
    },
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import "../../scss/base/variables";
@import "../../scss/base/mixin";
.condition-main {
    display: inline-block;
    width: 950px;
    & > .condition-bunch {
        position: relative;
        border-left: 1px #cccccc solid;

        .just {
            position: absolute;
            top: 50%;
            left: 0;
            text-align: center;
            line-height: 22px;
            margin-left: -12px;
            margin-top: -12px;
            @include border-radius(5px);
            background-color: #cccccc;
            color: #ffffff;
            width: 24px;
            height: 24px;
            cursor: default;
        }

        &:before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            width: 21px;
            height: 1px;
            background-color: #cccccc;
        }

        &:after {
            content: "";
            position: absolute;
            left: 0;
            bottom: 0;
            width: 21px;
            height: 1px;
            background-color: #cccccc;
        }

        .chooseBox {
            background-color: #ffffff;
            max-width: 980px;
            margin-left: 30px;
            margin-bottom: 20px;
            border: 1px #eeeeee solid;

            .user {
                max-width: 980px;
                background-color: #fafafa;
                line-height: 32px;
                span {
                    display: inline-block;
                    padding-left: 20px;
                }

                .add {
                    float: right;

                    .icon-tianjia {
                        line-height: 20px;
                        color: #0cc2a9;
                        cursor: pointer;
                        font-size: 16px;
                        padding-right: 17px;
                    }
                }

                @include clearfix();
            }

            .choose {
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
                        background-color: #ccc;
                    }
                }
            }

            .count-1 {
                border-left: 1px #cccccc solid;

                &:before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 21px;
                    height: 1px;
                    background-color: #cccccc;
                }

                &:after {
                    content: "";
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 21px;
                    height: 1px;
                    background-color: #cccccc;
                }
            }
            &.disabled {
                .user {
                    margin-bottom: 8px;
                }
                .choose {
                    .maybe {
                        background-color: #cccccc;
                        cursor: default;
                    }
                }
            }
        }

        .add-bunch {
            display: inline-block;
            font-size: 16px;
            color: #0cc4a9;
            margin-left: 30px;
            cursor: pointer;
        }
        .add-bunch-model {
            margin-left: 30px;
            font-size: 14px;
            .add-bunch-models {
                float: left;
                margin-right: 20px;
            }
        }
        .add,
        .icon-iconless,
        .add-bunch {
            &.disabled {
                display: none;
            }
        }
    }
}
</style>
