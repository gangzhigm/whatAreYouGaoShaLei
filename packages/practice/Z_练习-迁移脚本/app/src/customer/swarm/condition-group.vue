<template>
    <div class="swarm-condition-group">

        <!--过滤器-->
        <div class="filter"  v-if="!listLoading">
            <div class="classify">
                <div class="just">{{'common.and' | t}}
                </div>
                <!--联系人属性满足-->
                <div class="chooseBox">
                    <div class="user">
                        <span>{{'swarm.contactAttribute' | t}}</span>
                        <div class="add" @click="addUser(obj[0].rules, 0)">
                            <i class="icon icon-tianjia"></i>
                        </div>
                    </div>
                    <!--<div v-if="obj.length > 0 && obj[0].type === 'contact'" class="box">-->
                    <div class="choose" :class="obj[0].rules.length>1?'count-1':''" v-if="obj[0].rules.length>0">
                        <div class="maybe" v-if="obj[0].rules.length>1" @click="switcherUser(0)">
                            <span v-if="obj[0].rules[0].act==='and'">{{'common.and' | t}}</span>
                            <span v-if="obj[0].rules[0].act==='or'">{{'common.or' | t}}</span>
                        </div>
                        <div class="selectBox" v-for="(Child,index) in obj[0].rules" :key="Child.keyID">
                            <cascading :placeholder="$t('swarm.contactAttrPlaceholder')" v-model="Child.field_id" :list="userAttrGroups" @select="changePriceIdList($event, index, Child)" @noitem="noitem(index)" />
                            <!--<cascading-selector :placeholder="$t('swarm.contactAttrPlaceholder')" v-model="Child.field_id" :list="userAttrGroups"
                                                    @select="changePriceIdList($event, index, Child)" @noitem="noitem(index)"/>-->
                            <selector :options="Child.user_choose" v-model="Child.operation" @select="changeUser($event,index,Child)">
                            </selector>
                            <template v-if="Child.field_name === 'label_ids'">
                                <!--标签列表-->
                                <condition-group-tablist v-if="Child.operation && Child.operation!=='belong' && Child.operation!=='nbelong'" :tabList="selectList(Child.field_name)" v-model="Child.value">
                                </condition-group-tablist>
                                <swarmMultiSelect class="countHide" :search="true" :noSwarm="true" v-if="Child.operation==='belong' || Child.operation==='nbelong'" :title="mulitSelectTitle(Child.field_name)" v-model="Child.value" :options="selectList(Child.field_name)" />
                            </template>
                            <template v-else-if="tagAndWecom(Child.field_name)">
                                <!--标签列表-->
                                <selector class="lg" :class="{'label-selector':tagAndWecom(Child.field_name)}" v-if="Child.operation && Child.operation!=='belong' && Child.operation!=='nbelong'" :options="selectList(Child.field_name)" :search="true" v-model="Child.value">
                                </selector>
                                <swarmMultiSelect class="countHide" :search="true" :noSwarm="true" v-if="Child.operation==='belong' || Child.operation==='nbelong'" :title="mulitSelectTitle(Child.field_name)" v-model="Child.value" :options="selectList(Child.field_name)" />
                            </template>
                            <template v-else>
                                <!--文本框-->
                                <template v-if="Child.text && Child.operation !== 'belong' && Child.operation !== 'nbelong'">
                                    <searchable-input v-if="Child.limitSize ===1" :maxlength="100" :searchResultList="Child.searchResultList" :target="Child" @search="searchTarget(Child,$event)" @select="selectResult(Child)">
                                    </searchable-input>
                                </template>
                                <!--数字框-->
                                <template v-if="Child.number && Child.operation !== 'belong' && Child.operation !== 'nbelong'">
                                    <template v-if="Child.limitSize === 2">
                                        <input v-model.trim="Child.value.start" class="input md" type="text" maxlength="20">
                                        <input v-model.trim="Child.value.end" class="input md" type="text" maxlength="20">
                                    </template>
                                    <input v-if="Child.limitSize===1" v-model.trim="Child.value" class="input md" type="text" maxlength="20">
                                </template>
                                <!--数组框-->
                                <template v-if="Child.arr && Child.operation !== 'belong' && Child.operation !== 'nbelong'">
                                    <selector class="lg" v-if="Child.limitSize===1" :options="groupList" :search="true" v-model="Child.value" :class="{'label-selector':Child.field_name === 'label_ids'}">
                                    </selector>
                                </template>
                                <!-- belong多选框  -->
                                <template v-if="Child.operation === 'belong' || Child.operation === 'nbelong'">
                                    <query-filter-condition-value :maxlength="12" :options="valueList" inputType="many" :ifRange="false" :ifReg="true" v-if="Child.number" valueType="number" :maxTag="99" v-model="Child.value" />
                                    <query-filter-condition-value :maxlength="300" :options="Child.searchResultList" inputType="many" v-if="Child.text" valueType="text" :maxTag="99" v-model="Child.value" @search="belongSearch(Child,$event)" @select="selectResult(Child)" />
                                </template>
                                <!--时间框-->
                                <template v-if="Child.time && Child.operation !== 'belong' && Child.operation !== 'nbelong'">
                                    <calendar v-if="Child.limitSize===1&&Child.relative_number===false" v-model="Child.value" />
                                    <!--相对时间点的特殊处理框-->
                                    <template v-if="Child.relative_number && Child.limitSize === 1">
                                        <span>{{'swarm.relativeTime' | t}}</span>
                                        <input v-model="Child.value" class="input tiny" type="text" maxlength="3">
                                        <span>{{'time.day' | t}}</span>
                                        <selector :options="relative" v-model="Child.relative_type">
                                        </selector>
                                    </template>
                                    <template v-if="Child.limitSize===2">
                                        {{'swarm.absoluteDateA' | t}}
                                        <calendar v-model="Child.value.start" :end="Child.value.end" />
                                        {{'swarm.absoluteDateB' | t}}
                                        <calendar v-model="Child.value.end" :start="Child.value.start" />
                                        {{'swarm.absoluteDateC' | t}}
                                    </template>
                                </template>
                                <span v-if="Child.operation === 'belong' || Child.operation === 'nbelong'" class="action-icon icon icon-pencil batch-icon " @click="editByRawValue(Child, '0', index)"></span>
                            </template>
                            <span class="icon icon-iconless" v-if="obj.length < 4 || obj[0].rules.length > 1" @click="delUser(0,index)"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <inline-loading v-if="listLoading"></inline-loading>

        <confirm v-if="editRawValues" :title="$t('analysis.batchInput')" :autoConfirm="false" @cancel="reset" @confirm="digestRawValues">
            <textarea class="textarea full-width" rows="20" autofocus="true" v-model="rawData.value" @input="rebase"></textarea>
            <span class="disabled-text">{{'analysis.note' | t}}</span>
            <span class="pull-right" :class="{'red-text':this.batchCount === 99}">{{batchCount}}/99</span>
        </confirm>
    </div>
</template>
<script type="text/ecmascript-6">

import { ContactApiV1, WecomApiV1 } from '@/api';
import cascading from '@/common/components/condition-bunch/cascading.vue';
import QueryFilterConditionValue from '../../analysis/components/query-filter-condition-value.vue';
import uniq from 'lodash/uniq';
import { logError } from '../../monitor.js';
import debounce from 'lodash/debounce';
import searchableInput from './searchable-input.vue';
import { cloneDeep } from 'lodash';
import swarmMultiSelect from '../../journey/draggable-form/canvas/controller/sub-controllers/components/swarm-multi-select.vue';
import conditionGroupTablist from './condition-group-tablist.vue';
import { uniqId } from '@/store/vuex/modules/canvasStore';
import {I18N_STORE_NAME} from '@/locales';
import { mapState } from 'vuex';

export default {
    name: 'swarmConditionGroup',
    props: {
        // 已保存的条件簇
        swarmJson: {
            type: Array,
            required: true
        },
        emptyValid: {
            type: Boolean,
            default: false
        },
        addable: {
            type: Boolean,
            default: true
        }
    },
    components: {
        cascading,
        QueryFilterConditionValue,
        searchableInput,
        swarmMultiSelect,
        conditionGroupTablist
    },
    data () {
        return {
            // 关系组
            relative: [
                { name: this.$t('swarm.within'), id: 0 },
                { name: this.$t('swarm.beyond'), id: 1 }
            ],
            // 默认初始对象
            obj: [
                {
                    act: 'and',
                    actChildren: 'and',
                    status: 0,
                    type: 'contact',
                    rules: []
                },
            ],
            originalObj: [], // 原始对象
            userAttrGroups: [], //所有联系人属性
            order: [], //所有订单属性
            commodity: [], //所有商品属性
            groupList: [], //关系列表
            valueList: [],
            rawData: {
                type: '', // number 从属类型：0联系人属性，1订单属性，2商品属性
                value: '', // 批量输入字符串
                valueType: '', // 数据类型
                index: '' //当前child该类型属性中的index
            },
            editRawValues: false,
            staffNameList: [],//企业微信员工列表
            staffMobileList: [],//企业微信员工列表
            staffEmailList: [],//企业微信员工列表
            wecomGroupList: [], //企业微信群列表
            listLoading:false, // 加载共享时的数据
            validationList:[], // 检验是否有失效时与之匹配的列表
        };
    },
    mounted () {
        this.getRelationshipList();
    },
    computed: {
        ...mapState({
            // 语言状态
            lang: state => state[I18N_STORE_NAME].lang === 'zh-CN'
        }),
        userAttrOpen () {
            return this.obj.length < 16 && this.addable;
        },
        batchCount () {
            if (this.rawData.value) {
                let verifyArray = this.rawData.value
                    .split('\n')
                    .map(line => String(line).trim())
                    .filter(line => line);
                return verifyArray.length;
            }
            return 0;
        }
    },
    methods: {
        checkItem() {
            if (this.swarmJson.length > 0) {
                let JSON = cloneDeep(this.swarmJson);
                let fields = [
                    'wecom_staff_name', 'wecom_staff_mobile', 'wecom_staff_email',
                    'wecom_group_name', 'label_ids'
                ];
                let hasItem = [];

                // pickList搜索字段需要加载每个规则里
                for (let i = 0; i < JSON.length; i++) {
                    for (let j = JSON[i].rules.length - 1; j >= 0; j--) {
                        JSON[i].rules[j].searchResultList = [];
                        JSON[i].rules[j].keyID = uniqId();

                        this.getValidationList(JSON[i].rules[j].field_name); // 获取各个属性列表的相关数据

                        if (JSON[i].rules[j].operation && JSON[i].rules[j].field_id !== '' && JSON[i].rules[j].field_type !== 0) {
                            let hasItem = JSON[i].rules[j].user_choose
                                .filter(item => (item.id === JSON[i].rules[j].operation));
                            if (hasItem.length === 0) {
                                this.$toast(this.$t('controller.invalidCondition'), 'warn');
                                JSON[i].rules.splice(j, 1);
                            }
                        }

                        // JSON中是否包含 企业微信员工姓名/手机号/邮箱/群名，标签，存在则进行过滤匹配判断是否失效
                        if (fields.includes(JSON[i].rules[j].field_name)) {
                            if (Object.prototype.toString.call(JSON[i].rules[j].value) === '[object Array]') {
                                // 属于 不属于
                                hasItem = this.validationList
                                    .filter(item => (JSON[i].rules[j].value.includes(item.id)));
                            } else {
                                // 等于 不等于
                                hasItem = this.validationList.filter(item => (item.id === JSON[i].rules[j].value));
                            }
                            if (hasItem.length === 0) {
                                this.$toast(this.$t('controller.invalidCondition'), 'warn');
                                JSON[i].rules.splice(j, 1);
                            }
                        }
                    }
                }
                this.obj = cloneDeep(JSON);
                if (!this.obj[0].rules.length) {
                    this.addUser(this.obj[0].rules, 0);
                }
            }
        },

        // 根据field_name的不同，赋值不同的数据
        getValidationList(fieldName){
            switch (fieldName) {
                case 'label_ids':
                    this.validationList = this.groupList;
                    break;
                case 'wecom_staff_name':
                    this.validationList = this.staffNameList;
                    break;
                case 'wecom_staff_mobile':
                    this.validationList = this.staffMobileList;
                    break;
                case 'wecom_staff_email':
                    this.validationList = this.staffEmailList;
                    break;
                case 'wecom_group_name':
                    this.validationList = this.wecomGroupList;
                    break;
            }
        },
        noitem (index) {
            this.obj[0].rules.splice(index, 1);
            this.$nextTick(() => {
                if (!this.obj[0].rules.length) {
                    this.addUser(this.obj[0].rules, 0);
                }
            });
            this.$toast(this.$t('controller.invalidCondition'), 'warn');
        },
        async getRelationshipList () {
            // 如果swarmJson有数据代表是编辑，则先获取数据后再进行验证是否失效
            if (this.swarmJson.length > 0) this.listLoading = true;

            // 获取自定义字段
            await ContactApiV1.customWorld(0, 1, '', 1)
                .then(res => {
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
                        if (e.isWechat) {
                            wechatAttr.push(tag);
                        } else if (e.isScoring){
                            rating.push(tag);
                        } else {
                            othAttr.push(tag);
                        }
                    });
                    let len = othAttr.length;
                    let basic = [],
                        member = [],
                        tag = [],
                        wecomAttr = [],
                        consume = [],
                        senior = [],
                        etc = [],
                        mini = [];
                    for (let i = 0; i < len; i++) {
                        switch (Boolean(othAttr[i])) {
                            //case /^openid_wx/.test(othAttr[i].fieldName):
                            case [
                                'mobile',
                                'email',
                                '微信openid',
                                'unionid',
                                'customer_id',
                                'name',
                                'sex',
                                'address',
                                'create_date',
                                'update_date',
                                'job_title_dmt',
                                'company_type_dmt',
                                'number_of_Employees_dmt',
                                'budget_amount',
                                'sex_dmt',
                                'annual_revenue',
                                'company_name_dmt'
                            ].includes(othAttr[i].fieldName):
                                basic.push(othAttr[i]);
                                break;
                            case [
                                'member_id',
                                'integral',
                                '会员等级',
                                '会员加入日期',
                                'member_grade',
                                'member_date',
                                '会员状态',
                                'customer_create_date'
                            ].includes(othAttr[i].fieldName):
                                member.push(othAttr[i]);
                                break;
                            case [
                                '微信标签',
                                '系统标签',
                                '会员标签',
                                '粉丝标签',
                                'label_ids'
                            ].includes(othAttr[i].fieldName):
                                tag.push(othAttr[i]);
                                break;
                            case [
                                'sale_count',
                                'sale_total',
                                'first_sale_date',
                                'last_sale_date'
                            ].includes(othAttr[i].fieldName):
                                consume.push(othAttr[i]);
                                break;
                            case [
                                'price_index',
                                'active_index',
                                'consume_index',
                                'wechat_influence_date',
                                'sms_influence_date',
                                'mail_influence_date'
                            ].includes(othAttr[i].fieldName):
                                senior.push(othAttr[i]);
                                break;
                            case ['wecom_sex',
                                'wecom_name',
                                'wecom_corp_full_name',
                                'wecom_staff_name',
                                'wecom_staff_mobile',
                                'wecom_staff_email',
                                'wecom_group_name',
                                'wecom_source',
                                'wecom_channel_code',
                                'external_userid',
                                'new_wecom_staff_id'].includes(othAttr[i].fieldName):
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
                    this.userAttrGroups = [
                        {
                            name: this.$t('swarm.basicInfo'),
                            id: 0,
                            child: basic
                        },
                        {
                            name: this.$t('swarm.memberInfo'),
                            id: 1,
                            child: member
                        },
                        {
                            name: this.$t('swarm.labelInfo'),
                            id: 2,
                            child: tag
                        },
                        {
                            name: this.$t('swarm.consumerInfo'),
                            id: 3,
                            child: consume
                        },
                        {
                            name: this.$t('swarm.advancedInfo'),
                            id: 4,
                            child: senior
                        },
                        {
                            name: this.$t('swarm.wechatInfo'),
                            id: 5,
                            child: wechatAttr
                        },
                        {
                            name: '企业微信',
                            id: 7,
                            child: wecomAttr
                        },
                        {
                            name: this.$t('swarm.customInfo'),
                            id: 6,
                            child: etc
                        },
                        {
                            name: this.$t('swarm.scoringInfo'),
                            id: 8,
                            child: rating
                        },
                        {
                            name: this.$t('swarm.miniprogramInfo'),
                            id: 9,
                            child: mini
                        }
                    ];
                });
            // await ContactApiV1.customWorld(1,1,'',1).then(res => {
            //     this.order = res.body.data.customerFieldList.map(e => {
            //         let or = {};
            //         or.name = e.fieldCn;
            //         or.id = e.id;
            //         or.type = e.fieldType;
            //         or.fieldName = e.fieldName;
            //         return or;
            //     });
            // });
            // await ContactApiV1.customWorld(2,1,'',1).then(res => {
            //     this.commodity = res.body.data.customerFieldList.map(e => {
            //         let com = {};
            //         com.name = e.fieldCn;
            //         com.id = e.id;
            //         com.type = e.fieldType;
            //         com.fieldName = e.fieldName;
            //         return com;
            //     });
            // });
            // 获取字段关系
            await ContactApiV1.relation().then(res => {
                this.groupList = res.body.data.groupList.map(e => {
                    let arrList = {};
                    arrList.name = e.groupName;
                    arrList.id = e.groupId;
                    return arrList;
                });
                this.fieldObject = res.body.data.operators;
                // 旧数据user_choose参数添加不属于选项
                if (this.obj.length > 0) {
                    for (let i = 0; i < this.obj.length; i++) {
                        for (let j = this.obj[i].rules.length - 1; j >= 0; j--) {
                            if (this.obj[i].rules[j].field_type === 1) {
                                this.obj[i].rules[j].user_choose = this.fieldObject.str.map(element => {
                                    let str = {};
                                    str.name = element.operatorCn;
                                    str.id = element.operator;
                                    str.type = element.type;
                                    str.limitSize = element.limitSize;
                                    return str;
                                });
                            }
                            // 新增 type = 6 (部门id, 创建人)
                            if (this.obj[i].rules[j].type === 2 || this.obj[i].rules[j].type === 6) {
                                this.obj[i].rules[j].user_choose = this.fieldObject.num.map(element => {
                                    let num = {};
                                    num.name = element.operatorCn;
                                    num.id = element.operator;
                                    num.type = element.type;
                                    num.limitSize = element.limitSize;
                                    return num;
                                });
                            }
                            if (this.obj[i].rules[j].type === 3) {
                                this.obj[i].rules[j].user_choose = this.fieldObject.dat.map(element => {
                                    let dat = {};
                                    dat.name = element.operatorCn;
                                    dat.id = element.operator;
                                    dat.type = element.type;
                                    dat.limitSize = element.limitSize;
                                    return dat;
                                });
                            }
                            if (this.obj[i].rules[j].type === 4) {
                                this.obj[i].rules[j].user_choose = this.fieldObject.arr.map(element => {
                                    let arr = {};
                                    arr.name = element.operatorCn;
                                    arr.id = element.operator;
                                    arr.type = element.type;
                                    arr.limitSize = element.limitSize;
                                    return arr;
                                });
                            }
                        }
                    }
                }
            });
            //1表示搜索企业微信所属员工名称;2表示搜索企业微信所属员工手机号;3表示搜索企业微信所属员工邮箱
            await WecomApiV1.getStaffListNoPage(1).then(res => {
                let resList = res.body.data.staffList.filter(e => e.value !== '');
                this.staffNameList = resList.map(e => {
                    let arr = {};
                    if (e.value) {
                        arr.name = e.value;
                        arr.id = e.userId;
                    }
                    return arr;
                });
            });
            await WecomApiV1.getStaffListNoPage(2).then(res => {
                let resList = res.body.data.staffList.filter(e => e.value !== '');
                this.staffMobileList = resList.map(e => {
                    let arr = {};
                    arr.name = e.value;
                    arr.id = e.userId;
                    return arr;
                });
            });
            await WecomApiV1.getStaffListNoPage(3).then(res => {
                let resList = res.body.data.staffList.filter(e => e.value !== '');
                this.staffEmailList = resList.map(e => {
                    let arr = {};
                    arr.name = e.value;
                    arr.id = e.userId;
                    return arr;
                });
            });
            await WecomApiV1.getWecomGroupList().then(res => {
                let resList = res.body.data.groupList.filter(e => e.value !== '');
                this.wecomGroupList = resList.map(e => {
                    let arr = {};
                    arr.name = e.value;
                    arr.id = e.chatId;
                    return arr;
                });
            });

            if (this.swarmJson.length > 0) this.listLoading = false;
            this.checkItem();  // 检测条件是否失效
        },
        //标签个企业微信部分属性显示一致
        tagAndWecom (filedName) {
            return filedName === 'wecom_staff_name' || filedName === 'wecom_staff_mobile' ||
                filedName === 'wecom_staff_email' || filedName === 'wecom_group_name';
        },
        //标签和企业微信部分属性 list
        selectList (filedName) {
            switch (filedName) {
                case 'label_ids':
                    return this.groupList;
                case 'wecom_staff_name':
                    return this.staffNameList;
                case 'wecom_staff_mobile':
                    return this.staffMobileList;
                case 'wecom_staff_email':
                    return this.staffEmailList;
                case 'wecom_group_name':
                    return this.wecomGroupList;
            }
        },
        /**
         *标签选择/员工选择 title
         * type event：行为事件 attributes：联系人属性
         */
        mulitSelectTitle (filedName) {
            switch (filedName) {
                case 'label_id':
                case 'label_ids':
                    return this.$t('sharing.label');
                case 'wecom_staff_name':
                case 'wecom_staff_mobile':
                case 'wecom_staff_email':
                    return this.$t('channelCode.staff');
            }
        },
        // 联系人属性
        addUser (list, count) {
            if (list.length === 0) {
                list.push({
                    keyID: uniqId(),
                    act: 'and', // or、 and
                    field_id: '', //字段id
                    field_name: '', //字段名称
                    field_type: '', //字段类型
                    operation: '', //条件
                    value: '', //值   "value": {"start":"", "end":""}
                    user_choose: [],
                    limitSize: '',
                    relative_type: 0,
                    text: false,
                    arr: false,
                    number: false,
                    time: false,
                    relative_number: false,
                    searchResultList: [],
                });
            } else {
                if (this.obj[count].rules.length > 14) {
                    this.$toast(this.$t('swarm.max15Rules'), 'warn');
                    return;
                }
                let item = list[list.length - 1];
                if (
                    !this.validSingleEmpty(
                        item,
                        this.$t('swarm.infoNotComplete')
                    )
                )
                    return;
                if (!this.validSingleRule(item)) return;
                list.push({
                    keyID: uniqId(),
                    act: 'and', // or、 and
                    field_id: '', //字段id
                    field_name: '', //字段名称
                    field_type: '', //字段类型
                    operation: '', //条件
                    value: '', //值   "value": {"start":"", "end":""}
                    user_choose: [],
                    limitSize: '',
                    relative_type: 0,
                    text: false,
                    number: false,
                    time: false,
                    relative_number: false,
                    searchResultList: [],
                });

                if (
                    item.field_type !== 1 &&
                    item.field_type !== 2 &&
                    item.field_type !== 3 &&
                    item.field_type !== 4
                ) {
                    logError(
                        `[联系人分群] <swarm /> addUser 新增联系人中{item.field_type}不是正确的值 :1372`
                    );
                }
            }

            this.limitNumber = 0;
        },
        // 删除
        delUser (count, index) {
            this.obj[count].rules.splice(index, 1);
            this.limitNumber = 0;
        },
        // 切换且与或
        switcherUser (index) {
            if (this.obj[index].rules[0].act === 'and') {
                this.obj[index].rules.forEach(e => {
                    e.act = 'or';
                });
            } else if (this.obj[index].rules[0].act === 'or') {
                this.obj[index].rules.forEach(e => {
                    e.act = 'and';
                });
            }
        },
        // 字段关系筛选(各属性共用)
        changePriceIdList (e, index, Child) {
            // resize一下;
            Child.operation = '';
            Child.value = '';
            Child.number = false;
            Child.text = false;
            Child.time = false;
            Child.arr = false;
            this.$nextTick(() => {
                Child.field_name = e.fieldName;
                Child.field_type = e.type;
                if (e.type === 1) {
                    Child.user_choose = this.fieldObject.str.map(element => {
                        let str = {};
                        str.name = element.operatorCn;
                        str.id = element.operator;
                        str.type = element.type;
                        str.limitSize = element.limitSize;
                        return str;
                    });
                }
                // 新增 type = 6 (部门id, 创建人)
                if (e.type === 2 || e.type === 6) {
                    Child.user_choose = this.fieldObject.num.map(element => {
                        let num = {};
                        num.name = element.operatorCn;
                        num.id = element.operator;
                        num.type = element.type;
                        num.limitSize = element.limitSize;
                        return num;
                    });
                }
                if (e.type === 3) {
                    Child.user_choose = this.fieldObject.dat.map(element => {
                        let dat = {};
                        dat.name = element.operatorCn;
                        dat.id = element.operator;
                        dat.type = element.type;
                        dat.limitSize = element.limitSize;
                        return dat;
                    });
                }
                if (e.type === 4) {
                    // Child.user_choose = this.fieldObject.arr.map(element => {
                    //     let arr = {};
                    //     arr.name = element.operatorCn;
                    //     arr.id = element.operator;
                    //     arr.type = element.type;
                    //     arr.limitSize = element.limitSize;
                    //     return arr;
                    // });
                    // 联系人属性添加"属于"、"不属于"

                    Child.user_choose = [
                        { name: this.$t('analysis.equal'), id: 'eq', limitSize: 1, type: 6 },
                        { name: this.$t('analysis.unEqual'), id: 'ne', limitSize: 1, type: 6 },
                        { name: this.$t('analysis.belong'), id: 'belong', limitSize: 1, type: 6 },
                        { name: this.$t('swarm.notBelong'), id: 'nbelong', limitSize: 1, type: 6 }
                    ];
                }
                if (
                    e.type !== 1 &&
                    e.type !== 2 &&
                    e.type !== 3 &&
                    e.type !== 4 &&
                    e.type !== 6
                ) {
                    logError(
                        `[联系人分群] <swarm /> changePriceIdList 字段关系筛选中{type}不是正确的值 :1713`
                    );
                }
            });
        },
        // 限制输入框的个数(各属性共用)
        changeUser (event, index, tag) {
            if (event.type === 1) {
                // 文本框
                tag.text = true;
                tag.number = false;
                tag.time = false;
                tag.arr = false;
                this.limitNumber = event.limitSize;
                tag.limitSize = event.limitSize;
            }
            if (event.type === 2) {
                // 数字框
                tag.text = false;
                tag.number = true;
                tag.time = false;
                tag.limitNumber = event.limitSize;
                tag.limitSize = event.limitSize;
                tag.arr = false;
            }
            if (event.type === 3) {
                // 时间框
                if (tag.operation === 'currentRelativeTime') {
                    tag.time = true;
                    tag.relative_number = true;
                    tag.number = false;
                    tag.text = false;
                    tag.arr = false;
                } else {
                    tag.text = false;
                    tag.number = false;
                    tag.arr = false;
                    tag.time = true;
                }

                tag.limitSize = event.limitSize;
                this.limitNumber = event.limitSize;
            }
            // 新增arr类型
            if (event.type === 6) {
                tag.text = false;
                tag.number = false;
                tag.time = false;
                tag.arr = true;
                this.limitNumber = event.limitSize;
                tag.limitSize = event.limitSize;
            }

            if (event.limitSize === 1 || event.limitSize === 0) {
                if (tag.operation === 'belong' || tag.operation === 'nbelong') {
                    tag.value = [];
                } else {
                    tag.value = '';
                }
            } else {
                tag.value = {
                    start: '',
                    end: ''
                };
            }

            if (
                event.type !== 1 &&
                event.type !== 2 &&
                event.type !== 3 &&
                event.type !== 6
            ) {
                logError(
                    `[联系人分群] <swarm /> chageUser 限制输入框的个数时发现了不正确的{type} :1791`
                );
            }
        },

        // 展示批量输入
        editByRawValue (Child, type, index) {
            this.rawData.type = type; //从属于联系人属性，订单属性，商品属性
            this.rawData.valueType = Child.field_type;
            this.rawData.value = Child.value.join('\n');
            this.rawData.index = index;
            this.editRawValues = true;
        },
        // 处理批量输入
        digestRawValues () {
            let verifyArray = this.rawData.value
                .split('\n')
                .map(line => String(line).trim())
                .filter(line => line);
            let type = this.rawData.type;
            let valueType = this.rawData.valueType;
            let index = this.rawData.index;
            switch (valueType) {
                // 文本
                case 1:
                    if (this.validateStr(verifyArray)) {
                        this.obj[type].rules[index].value = uniq(verifyArray);
                        this.reset();
                    }
                    break;
                // 小数
                case 2:
                    if (this.validateNum(verifyArray)) {
                        this.obj[type].rules[index].value = uniq(verifyArray);
                        this.reset();
                    }
                    break;
            }
        },
        // 重置批量输入弹窗内容
        reset () {
            this.editRawValues = false;
            this.rawData = {
                type: '', // number 从属类型：0联系人属性，1订单属性，2商品属性
                value: '', // 批量输入字符串
                valueType: '', // 数据类型
                index: '' // 当前child该类型属性中的index
            };
        },
        // 限定批量弹窗的数据总数
        rebase () {
            if (this.batchCount > 99) {
                let verifyArray = this.rawData.value
                    .split('\n')
                    .map(line => String(line).trim())
                    .filter(line => line)
                    .slice(0, 99);
                this.$toast(this.$t('swarm.max99items'), 'warn');
                this.rawData.value = verifyArray.join('\n');
                this.rawData.value += '\n';
            }
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
            } else if (
                !arr.every(e => {
                    return e.length < 301;
                })
            ) {
                this.$toast(
                    this.$t('swarm.singleFormart') + this.$t('swarm.maxChars'),
                    'warn'
                );
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
            } else if (
                !arr.every(e => {
                    return e.length < 13;
                }) ||
                !arr.some(e => string.test(e))
            ) {
                this.$toast(
                    this.$t('swarm.singleFormart') +
                    this.$t('swarm.numberFormatLimit') +
                    '12',
                    'warn'
                );
                return false;
            }
            return true;
        },

        /**
         * 验证单个rule
         * @param item Object 单条rule
         * @param emptyText String 非空提示
         * @returns {*}
         */
        validSingleRule (item) {
            // 验证当是文本时候
            if (item.field_type === 1) {
                if (item.operation === 'belong' || item.operation === 'nbelong') {
                    if (item.value.length === 0) {
                        return this.$toast(
                            this.$t('swarm.infoNotComplete'),
                            'warn'
                        );
                    } else if (!this.validateStr(item.value)) {
                        return;
                    }
                } else if (item.value.length > 100) {
                    this.$toast(this.$t('swarm.max100Chars'), 'warn');
                    return;
                }
            }
            if (item.field_type === 4) {
                if (item.value === '') {
                    this.$toast(this.$t('swarm.pickAGroup'), 'warn');
                    return;
                }
            }
            // 数字类型验证
            if (item.field_type === 2) {
                let string = /^\d+(\.\d+)?$/;
                if (item.limitSize === 1) {
                    if (item.operation === 'belong' || item.operation === 'nbelong') {
                        if (item.value.length === 0) {
                            this.$toast(
                                this.$t('swarm.infoNotComplete'),
                                'warn'
                            );
                            return false;
                        } else if (!this.validateNum(item.value)) {
                            return false;
                        }
                    } else if (
                        !string.test(item.value) ||
                        item.value.length > 20
                    ) {
                        this.$toast(this.$t('swarm.numberFormatErr'), 'warn');
                        return false;
                    }
                }
                if (item.limitSize === 2) {
                    if (
                        !string.test(item.value.start) ||
                        !string.test(item.value.end) ||
                        item.value.start.length > 20 ||
                        item.value.end.length > 20
                    ) {
                        this.$toast(this.$t('swarm.numberFormatErr'), 'warn');
                        return false;
                    }
                    if (Number(item.value.start) >= Number(item.value.end)) {
                        this.$toast(this.$t('swarm.rangeWrong'), 'warn');
                        item.isWarn = true;
                        isRule = false;
                    }
                }
            }
            // 时间验证
            if (item.field_type === 3) {
                if (item.relative_number === true && item.limitSize === 1) {
                    if (item.value.length > 3) {
                        this.$toast(this.$t('swarm.max3Chars'), 'warn');
                        return false;
                    }
                    let detection = /^([0-9]*)$/;
                    if (!detection.test(item.value)) {
                        this.$toast(this.$t('swarm.positiveInteger'), 'warn');
                        return false;
                    }
                }
            }

            if (
                item.field_type !== 1 &&
                item.field_type !== 2 &&
                item.field_type !== 3 &&
                item.field_type !== 4
            ) {
                /* logError(
                    `[联系人分群] <swarm /> amend 验证联系人属性中{item.field_type}不是正确的值 :924`
                ); */
                return false;
            }
            return true;
        },

        /**
         * 验证单个rule非空
         * @param item Object 单条rule
         * @param emptyText String 非空提示
         * @returns {*}
         */
        validSingleEmpty (item, emptyText) {
            // 非空验证
            if (
                item.field_id === '' ||
                item.operation === '' ||
                (item.value === '' && item.limitSize !== 0) ||
                (item.value.start === '' && item.limitSize !== 0) ||
                (item.value.end === '' && item.limitSize !== 0) ||
                (item.value.length === 0 && item.limitSize !== 0)
            ) {
                this.$toast(emptyText, 'warn');
                return false;
            }
            return true;
        },

        // 整体校验
        valid () {
            if (this.emptyValid) {
                let arr = this.obj.filter(e => {
                    return e.rules.length > 0;
                });
                if (!arr.length) {
                    this.$toast(this.$t('swarm.optionEmptyError'), 'warn');
                    return;
                }
            }
            // 非空校验
            if (!this.obj[0].rules.every(rule => {
                return this.validSingleEmpty(rule, this.$t('swarm.invalidContactRule'));
            })) return;

            // 联系人属性
            if (!this.obj[0].rules.every(rule => {
                return this.validSingleRule(rule);
            })) return;

            // 额外添加的联系人属性
            if (this.obj.length > 3) {
                let extra = this.obj.filter((item, index) => {
                    return item.type === 'contact' && index !== 0;
                });
                // 非空校验
                if (!extra.every(item => {
                    return item.rules.every(rule => {
                        return this.validSingleEmpty(rule, this.$t('swarm.invalidContactRule'));
                    });
                })) return;

                if (!extra.every(item => {
                    return item.rules.every(rule => {
                        return this.validSingleRule(rule);
                    });
                })) return;
            }

            this.obj.forEach(item => {
                // 将操作关系符为 ‘有值’ ‘没值’的规则value赋值
                item.rules.forEach(e => {
                    if (e.operation === 'exists') {
                        e.value = '1';
                    }
                    if (e.operation === 'missing') {
                        e.value = '0';
                    }
                });
                // 且或的转变,传送
                if (item.rules.length !== 0) {
                    if (item.rules[0].act === 'and') {
                        item.actChildren = 'and';
                        item.rules.forEach(e => {
                            e.act = 'and';
                        });
                    } else if (item.rules[0].act === 'or') {
                        item.actChildren = 'or';
                        item.rules.forEach(e => {
                            e.act = 'or';
                        });
                    }
                }
            });

            // 校验通过
            this.$nextTick(() => {
                // 删除搜索展示列表字段
                this.obj.forEach(json => {
                    if (json.type === 'contact') {
                        json.rules.forEach(rule => {
                            if (rule.searchResultList) {
                                delete rule.searchResultList;
                            }
                            if (rule.keyID) {
                                delete rule.keyID;
                            }
                        });
                    }
                });
                let swarmJosn = JSON.stringify(this.obj);
                this.$emit('valid', swarmJosn);
            });
        },
        searchTarget (target, params) {
            if (!String(params.value).trim().length) {
                target.searchResultList = [];
                return;
            }
            ContactApiV1
                .getCustomerByQuery(
                    params.fieldName,
                    String(params.value).trim()
                )
                .then(({ body: { data: { list } } }) => {
                    target.searchResultList = list;
                })
                .catch(() => {
                    target.searchResultList = [];
                });
        },
        belongSearch: debounce(function (target, value) {
            if (target.field_type === 1) {
                if (!String(value).trim().length) {
                    target.searchResultList = [];
                    return;
                }
                ContactApiV1
                    .getCustomerByQuery(target.field_name, String(value).trim())
                    .then(({ body: { data: { list } } }) => {
                        target.searchResultList = list;
                    })
                    .catch(() => {
                        target.searchResultList = [];
                    });
            }
        }, 500),
        // 重置pickList搜索结果列表
        selectResult (target) {
            target.searchResultList = [];
        },
        // 添加额外的联系人属性
        addUserFilterCondition () {
            if (this.obj[0].rules.length === 0) {
                return this.$toast(
                    this.$t('swarm.cantAdd') +
                    this.$t('punctuation.comma') +
                    this.$t('swarm.emptyDefaultContact'),
                    'warn'
                );
            }
            if (this.obj.length > 14) {
                return this.$toast(this.$t('swarm.cantAdd'), 'warn');
            }

            if (this.obj.length > 3) {
                let extra = this.obj.filter((item, index) => {
                    return item.type === 'contact' && index !== 0;
                });
                if (
                    !extra.every(item => {
                        return item.rules.length > 0;
                    })
                )
                    return this.$toast(
                        this.$t('swarm.cantAdd') +
                        this.$t('punctuation.comma') +
                        this.$t('swarm.infoNotComplete'),
                        'warn'
                    );
            }

            let item = {
                act: 'and',
                actChildren: 'and',
                status: 0,
                type: 'contact',
                rules: []
            };
            this.obj.push(item);
        },
        // 删除额外的联系人属性
        delUserFilterCondition (item, count) {
            if (item.rules.length > 0) {
                this.$confirm(
                    this.$t('common.defaultConfirmTitle'),
                    this.$t('swarm.deleteConfirm')
                ).then(sure => {
                    if (sure) {
                        this.obj.splice(count + 3, 1);
                    }
                });
            } else {
                this.obj.splice(count + 3, 1);
            }
        }
    },
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import "../../common/scss/base/variables";
@import "../../common/scss/base/mixin";
.swarm-condition-group {
    width: calc(100% - 150px);
    display: inline-block;
    @include clearfix();
    // 过滤器
    .filter {
        padding-bottom: 40px;

        .classify {
            position: relative;
            border-left: 1px #cccccc solid;
            // 添加按钮
            .add-condition-action {
                padding: 0;
                border: none;
                margin-left: 40px;
                line-height: 20px;
                background-color: transparent;
                color: $theme;
                cursor: pointer;
                @include appearance(none);
                @include user-select(none);

                &:hover {
                    color: $light-theme;
                }

                &:active {
                    color: $dark-theme;
                }

                svg {
                    float: left;
                    width: 8px;
                    height: 8px;
                    margin: 6px 8px 0 0;
                    fill: currentColor;
                }
            }
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
                min-width: 610px;
                max-width: 980px;
                margin-left: 40px;
                margin-bottom: 20px;
                border: 1px #eeeeee solid;
                &.extra {
                    display: inline-block;
                }
                .user {
                    // min-width: 610px;
                    // max-width: 980px;
                    background-color: #fafafa;

                    span {
                        display: inline-block;
                        padding: 13px 0px 13px 17px;
                    }

                    .add {
                        float: right;
                        padding: 13px 12px 13px 0;

                        .icon-tianjia {
                            color: #0cc2a9;
                            cursor: pointer;
                            font-size: 16px;
                        }
                        .icon-delete {
                            color: $light-red;
                            cursor: pointer;
                            font-size: 16px;
                        }
                    }

                    @include clearfix();
                }

                .choose {
                    margin: 10px 0 10px 30px;
                    position: relative;

                    .selectBox {
                        position: relative;
                        margin: 10px 0 0 30px;
                        line-height: unset;
                        padding-right: 40px;

                        .selector {
                            // margin-right: 10px;
                            vertical-align: top;
                        }
                        .cascading {
                            height: $input-field-height;
                            vertical-align: top;
                        }
                        .icon-iconless {
                            position: absolute;
                            right: 0;
                            top: 0;
                            font-size: 16px;
                            padding: 0 12px;
                            cursor: pointer;
                            line-height: 32px;
                        }

                        .label-selector {
                            width: 300px;

                            .select-list {
                                max-height: 324px;
                            }
                        }
                        .query-filter-condition-value {
                            min-height: 32px;
                            box-sizing: border-box;
                            .keyword-input {
                                height: 22px;
                                box-sizing: border-box;
                                input {
                                    display: block;
                                    height: 20px;
                                }
                            }
                            .value-item {
                                height: 20px;
                                line-height: 20px;
                                box-sizing: border-box;
                            }
                            &.many {
                                max-width: 360px;
                                // overflow: auto;
                                // max-height: 125px;
                            }
                        }

                        @include clearfix();
                    }

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
            }
            .value-string {
                position: relative;
            }
        }
    }

    .query-filter-condition-value {
        .options {
            li {
                line-height: normal;
            }
        }
    }
}
</style>
