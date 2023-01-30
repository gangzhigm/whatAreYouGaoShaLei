<template>
    <div class="edit-model-options-area">
        <!-- 维度切换tab -->
        <div class="edit-model-options-title">
            <span class="edit-model-options-title-tit">{{'newScoring.scoringCriteria' | t}}</span>
            <span 
                class="edit-model-options-title-option"
                v-text="$t('newScoring.AttrTitle')"
                :class="activeCheck(0)" @click="activeClick(0)"></span>
            <span 
                class="edit-model-options-title-option" 
                v-text="$t('newScoring.EventTitle')"
                :class="activeCheck(1)" @click="activeClick(1)"></span>
        </div>
        <!-- 操作区域 -->
        <div class="edit-model-options-plane">
            <!-- 因子列表区域 -->
            <div class="edit-model-options-plane-search-area">
                <OptionsList :modelId="modelId" :eventFieldList="eventFieldList" :customerFieldList="customerFieldList" :type="activeType" @create="changeFactor" @createByMove="createByMove" @start="isMoving = true"></OptionsList>
            </div>
            <!-- 操作面板区域 -->
            <div class="edit-model-options-plane-options-area">
                <OptionsFlow :modelId="modelId" :type="activeType" :isMoving="isMoving" @editFactor="changeFactor" ref="flow"></OptionsFlow>
            </div>
        </div>
        <!-- 因子编辑弹框 -->
        <ScoringFactorModal v-if="factorEditFlag" :factorRule="editFactorRule"
                    @close="closeScoreEdit" />
    </div>
</template>

<script type="text/ecmascript-6">
import ScoringFactorModal from './factorModel/scoring-factor-edit.vue';
// 全部因子列表组件
import OptionsList from './edit-model-options-list.vue';
// 打分模型因子列表组件
import OptionsFlow from './edit-model-options-flow.vue';
import { ContactApi, ContactApiV1 } from '@/api';
import {I18N_STORE_NAME} from '@/locales';
import { mapState } from 'vuex';
export default {
    props: {
        modelId:{
            type:Number,
            default:0
        }
    },
    components:{
        OptionsList,
        OptionsFlow,
        ScoringFactorModal
    },
    data () {
        return {
            activeType: 0, // 当前模式  0: 属性相关 | 1: 事件相关
            eventFieldList:[], // 事件因子库
            customerFieldList:[], // 自定义因子库
            factorEditFlag:false, // 因子编辑框开关
            editFactorRule:{}, // 当前编辑因子项
            editFactorIndex:-1,
            isMoving: false,
            reqNum: 0
        };
    },
    computed: {
        ...mapState({
            // 语言状态
            lang: state => state[I18N_STORE_NAME].lang === 'zh-CN'
        }),
        // 切换当前模式显示效果
        activeCheck(){
            return function(data){
                return data === this.activeType ? 'active' : '';
            };
        }
    },
    beforeMount(){
        // 获取自定义字段以及事件字段用于显示名称
        this.getRelationshipList();
        this.eventFieldHandler();
    },
    methods: {
        //关闭因子编辑弹窗
        closeScoreEdit(type) {
            if (type === 1){
                if (this.editFactorIndex >= 0){
                    this.$refs['flow'].getListToSort(this.editFactorIndex);
                    this.$nextTick(()=>{
                        this.editFactorIndex = -1;
                    });
                } else {
                    this.$refs['flow'].reload();
                }
            }
            
            this.factorEditFlag = false;
            this.isMoving = false;
        },
        // 获取自定义字段
        async getRelationshipList() {
            // 获取自定义字段
            await ContactApiV1.customWorld(0, 1, '', 1)
                .then(res => {
                    let wechatAttr = [];
                    let othAttr = [];
                    let rating = [];
                    this.customerFieldList = res.body.data.customerFieldList;
                    res.body.data.customerFieldList.map(e => {
                        let tag = {};
                        tag.name = this.lang ? e.fieldCn : e.nameEn;
                        tag.id = e.id;
                        tag.type = e.fieldType;
                        tag.fieldName = e.fieldName;
                        if (e.isWechat) {
                            wechatAttr.push(tag);
                        } else if (e.isScoring){
                            rating.push(tag);
                        } else {
                            othAttr.push(tag);
                        }
                    });
                    let len = othAttr.length;
                    let basic = [], member = [], tag = [], wecomAttr = [], consume = [], senior = [], etc = [];
                    for (let i = 0; i < len; i++) {
                        switch (Boolean(othAttr[i])) {
                            case [
                                'mobile', 'email', '微信openid', 'unionid', 'customer_id', 'name',
                                'sex', 'address', 'create_date', 'update_date', 'job_title_dmt',
                                'company_type_dmt', 'number_of_Employees_dmt', 'budget_amount', 'sex_dmt', 'annual_revenue', 'company_name_dmt'
                            ].includes(othAttr[i].fieldName):
                                basic.push(othAttr[i]);
                                break;
                            case [
                                'member_id', 'integral', '会员等级', '会员加入日期', 'member_grade',
                                'member_date', '会员状态', 'customer_create_date'
                            ].includes(othAttr[i].fieldName):
                                member.push(othAttr[i]);
                                break;
                            case [
                                '微信标签', '系统标签', '会员标签',
                                '粉丝标签', 'label_ids'
                            ].includes(othAttr[i].fieldName):
                                tag.push(othAttr[i]);
                                break;
                            case [
                                'sale_count', 'sale_total',
                                'first_sale_date', 'last_sale_date'
                            ].includes(othAttr[i].fieldName):
                                consume.push(othAttr[i]);
                                break;
                            case [
                                'price_index', 'active_index', 'consume_index',
                                'wechat_influence_date', 'sms_influence_date', 'mail_influence_date'
                            ].includes(othAttr[i].fieldName):
                                senior.push(othAttr[i]);
                                break;
                            case [
                                'wecom_sex', 'wecom_name', 'wecom_corp_full_name',
                                'wecom_staff_name', 'wecom_staff_mobile', 'wecom_staff_email',
                                'wecom_group_name', 'wecom_source', 'wecom_channel_code',
                                'external_userid'].includes(othAttr[i].fieldName):
                                wecomAttr.push(othAttr[i]);
                                break;
                            default:
                                etc.push(othAttr[i]);
                                break;
                        }
                    }
                });
        },
        //获取事件属性
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
                            });
                        return eventGroup;
                    });
                    let numInterval = setInterval(() => {
                        intervalNum += 1;
                        if (this.reqNum === this.eventFieldList.length) {
                            clearInterval(numInterval);
                        }
                    }, 100);
                    if (intervalNum > 300) {
                        clearInterval(numInterval);
                    }
                });
        },
        // 获取字段名称 被子组件 edit-model-options-list 调用
        fieldEventName(factor) {
            let scoreRules = JSON.parse(factor.scoreRules);
            let obj = {
                iconName: '',
                fieldName: '',
                eventName: '',
                flag: true,
            };
            if (factor.type === 0) {//属性因子
                let attribute = this.customerFieldList.find((item) => {
                    return item.id === factor.attributeOrEventId;
                });
                if (!attribute) {
                    obj.fieldName = this.$t('scoring.fieldAvailable');
                    obj.flag = false;
                } else {
                    obj.fieldName = attribute.fieldCn + '( ' + attribute.fieldName + ' )';
                    obj.flag = true;
                }
                obj.iconName = '';
                obj.eventName = '';
                return obj;
            }
            if (factor.type === 1) {//事件因子
                let eventGroupId = scoreRules.rules[0].eventGroupId;
                let eventId = scoreRules.rules[0].eventId;
                let groupObj = this.eventFieldList.find((item) => {
                    return item.id === eventGroupId;
                });
                if (!groupObj) {
                    obj.fieldName = this.$t('scoring.eventAvailable');
                    obj.flag = false;
                    return obj;
                }
                let event = groupObj.child.find((item) => {
                    return item.id === eventId;
                });
                if (!event) {
                    obj.fieldName = this.$t('scoring.fieldAvailable');
                    obj.flag = false;
                } else {
                    obj.fieldName = event.name + '( ' + event.fieldName + ' )';
                    obj.iconName = event.event_group;
                    obj.eventName = event.fieldName;
                    obj.flag = true;
                }
                return obj;
            }
        },
        // 点击创建事件，唤醒列表重新获取事件
        changeFactor(data){
            this.editFactorRule = data;
            this.factorEditFlag = true;
            this.isMoving = true;
        },
        // 拖拽创建事件，唤醒列表重新获取排序事件
        createByMove(data){
            this.editFactorIndex = data.index;
            this.$nextTick(()=>{
                this.changeFactor(data.factorRule);
            });
        },
        // 切换当前模式
        activeClick(data){
            this.activeType = data;
        }
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../../common/scss/base/_variables";
    @import "../../../../../common/scss/base/_mixin";
    .edit-model-options-area{
        margin-top:20px;
        background: #ffffff;
        width:100%;
        height:calc(100% - 158px);
        .edit-model-options-title{
            position: relative;
            display:flex;
            flex-direction:row;
            align-items:center;
            justify-content:center;
            border-bottom:1px solid rgba(217,217,217,1);
            padding:10px;
            .edit-model-options-title-tit {
                position: absolute;
                left: 10px;
                font-size: 14px;
                line-height: $input-field-height;
            }
            .edit-model-options-title-option{
                user-select: none;
                cursor: pointer;
                font-size:14px;
                line-height: $input-field-height;
                box-sizing:border-box;
                border:1px solid rgba(217,217,217,1);
                padding:0 15px;
                &.active{
                    background-color:$theme;
                    color:#fff;
                    border-color: $theme;
                }
                &:nth-of-type(2n) {
                    border-radius: 5px 0 0 5px;
                    border-right: none;
                }
                &:last-child {
                    border-radius: 0 5px 5px 0;
                    border-left: none;
                }
            }
        }
        .edit-model-options-plane{
            height:calc(100% - 55px);
            display:flex;
            flex-direction:row;
            align-items:flex-start;
            justify-content:space-between;
            width:100%;
            .edit-model-options-plane-search-area{
                width:25%;
                height:100%;
            }
            .edit-model-options-plane-options-area{
                height:100%;
                width:74%;
            }
        }
    }
    
</style>
