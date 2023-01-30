<template>
    <modal :title="$t('scoring.scoringLibrary')" @close="$emit('close')" size="lg" class="scoring-factor-modal">
        <div class="scoring-content">
            <p class="scoring-desc">{{'scoring.libaryDesc' | t}}</p>
            <div class="pull-right search-box">
                <input type="text" v-model.trim="keyWords"
                    :placeholder="$t('scoring.search')" @keydown.enter="searchList">
                <svg aria-hidden="true" @click="searchList">
                    <use xlink:href="#icon-search"></use>
                </svg>
            </div>
            <div class="detail-msg">
                <!-- 批量操作 -->
                <div class="batch hidden-menu-trigger">
                    <svg aria-hidden="true" class="all-tag">
                        <use xlink:href="#icon-batch"></use>
                    </svg>
                    <span class="light-content-text">{{'scoring.batchAction' | t}}</span>
                    <ul class="hidden-menu">
                        <li class="tag-btn">
                            <button class="btn tag-btn-click" @click="handleDel()" :disabled="$has('datacentre_scorerating_dels')">
                            {{'scoring.batchDel' | t}}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            <table class="simplify-table scoring-table">
                <tr>
                    <th v-for="th in thList" :key="th.id" :width="th.width">
                        <div class="tag-name">
                            {{th.name}}
                            <div v-if="th.id === 3" class="filter-box" v-blur="closeStatus">
                                <svg aria-hidden="true" @click="chooseStatus = !chooseStatus">
                                    <use v-bind:xlink:href="'#icon-' + (chooseStatus ? 'shaixuan-tianchong' : 'shaixuan')"></use>
                                </svg>
                                <transition name="drop">
                                    <div class="drop-list" v-if="chooseStatus">
                                        <radio :source="''" v-model="scoringType" @input="sift">{{'scoring.all' | t}}</radio>
                                        <radio :source="0" v-model="scoringType" @input="sift">{{'scoring.attribute' | t}}</radio>
                                        <radio :source="1" v-model="scoringType" @input="sift">{{'scoring.event' | t}}</radio>
                                    </div>
                                </transition>
                            </div>
                        </div>
                        <!--全选-->
                        <div class="hidden-menu-trigger tag-action-menu" v-if="th.id === 1">
                            <svg aria-hidden="true" class="menu-icon">
                                <use xlink:href="#icon-menu"></use>
                            </svg>
                            <ul class="hidden-menu">
                                <li @click="checkData">{{'tag.allSelectedNowPage' | t}}</li>
                                <li @click="clearData">{{'tag.clearAll' | t}}</li>
                            </ul>
                        </div>
                    </th>
                </tr>
                 <tr v-if="loading" class="no-hover">
                    <td colspan="6" class="slim-cell">
                        <inline-loading />
                    </td>
                </tr>
                <template v-else-if="factorList.length > 0">
                    <tr v-for="(item,index) in factorList" :key="index">
                        <td @click.stop>
                            <checkbox v-model="checkedIds" :source="item.id"/>
                        </td>
                        <td>{{item.name}}</td>
                        <td>
                            <svg aria-hidden="true" class="icon event-icon" v-if="item.type === 0 && fieldEventName(item).flag">
                                <use xlink:href="#icon-shuxing"></use>
                            </svg>
                            <customer-icon v-if="item.type===1 && fieldEventName(item).flag" 
                                            :eventGroupName="fieldEventName(item).iconName"
                                            :eventName="fieldEventName(item).eventName"></customer-icon>
                            <span class="desc" v-text="fieldEventName(item).fieldName" :class="{'red-text' : !fieldEventName(item).flag}"></span>
                        </td>
                        <td>{{item.rulesCount}}</td>
                        <td>{{item.scoreFloor}} ~ {{item.scoreCeil}}</td>
                        <td>
                            <!--操作-->
                            <button class="btn tag-action-icon"
                                    v-title="$t('form.view')"
                                    @click.stop="checkModal(item)">
                                <svg aria-hidden="true" class="icon-round-pencil">
                                    <use xlink:href="#icon-eye" :title="$t('form.view')"></use>
                                </svg>
                            </button>
                            <button class="btn tag-action-icon"
                                    v-title="$t('form.shareDelete')"
                                    :disabled="$has('datacentre_scorerating_deltemplate')"
                                    @click.stop="delScore(item)">
                                <svg aria-hidden="true" class="icon-pie"
                                    :class="{'icon-disable': $has('datacentre_scorerating_deltemplate')}">
                                    <use xlink:href="#icon-round-close" :title="$t('form.shareDelete')"></use>
                                </svg>
                            </button>
                        </td>
                    </tr>
                </template>
                <tr v-else class="no-hover">
                    <td class="slim-cell" colspan="6">
                        <list-empty v-if="keyWords === ''"/>
                        <list-search-empty v-else/>
                    </td>
                </tr>
            </table>
            <div class="total-page pull-left">{{'channelCode.total' | t}} <span class="theme-text">{{totalRow}}</span> {{'channelCode.records' | t}}</div>
            <pager v-if="factorList.length > 0" :now="nowPage" :total="totalPage" @page="toPage"/>
        </div>
        <!-- 删除评分因子模板弹窗 -->
        <modal :title="$t('scoring.delTemplate')" v-if="delModal" @close="delModal = false">
            <p v-if="allDel">{{'scoring.confirmDel' | t}}【{{checkedIds.length}}】{{'scoring.scoringFactor' | t}}</p>
            <p v-else>{{'scoring.confirmTempalte' | t}}</p>
            <template v-slot:buttons>
                <button class="btn btn-md btn-white"  @click="delModal = false">{{'common.cancel' | t}}</button>
                <button class="btn btn-md btn-theme" @click="deleteOk">{{'common.ok' | t}}</button>
            </template>
        </modal>
        <scoring-factor-edit v-if="factorInfo" @close="factorInfo = false" :factorId="factorId" :writable="false" :getClose="getClose"/>
    </modal>
</template>
<script type="text/babel">
    import { ScoringV1, ContactApi, ContactApiV1   } from '@/api';
    import ScoringFactorEdit from './scoring-factor-edit.vue';
    import customerIcon from '@/customer/list/customer-icon.vue';
    import {I18N_STORE_NAME} from '@/locales';
    import { mapState } from 'vuex';
    export default 
    {
        name: 'scoring-factor-modal', // 评分因子模板框弹框
        props: {

        },
        components: {
            ScoringFactorEdit,
            customerIcon
        },
        data() {
            return {
                // 页码
                nowPage: 1,
                totalPage: 1,
                totalRow: 0,
                keyWords: '',
                loading: false,
                checkedIds: [],// 选中的模板ids
                delModal: false, // 删除评分因子模板弹窗
                allDel: false, // 是否批量删除
                selectOneId: '', //单个删除选中的id
                chooseStatus: false, //模板筛选状态
                scoringType: '', // 模板筛选状态列表 0: 属性因子 1：事件因子 不传或者其他： 全部
                factorInfo: false,
                factorId: '', //事件因子id(查看时需要传至编辑因子的子组件)
                eventFieldList: [], //事件因子列表
                userAttrGroups: [], //所有联系人属性 属性因子
                customerFieldList: [],//属性因子列表
                // 表格头标题
                thList: [
                    {id: 1, name: '',width: 40},
                    {id: 2, name: this.$t('scoring.tempalteName')},
                    {id: 3, name: this.$t('scoring.filedsOrEvents')},
                    {id: 4, name: this.$t('scoring.ruleCount'), width: 100},
                    {id: 5, name: this.$t('scoring.scoreRange'),width: 120},
                    {id: 6, name: this.$t('scoring.actions'),width: 120},
                ],
                factorList: [],
            };
        },
        computed: {
            ...mapState({
                // 语言状态
                lang: state => state[I18N_STORE_NAME].lang === 'zh-CN'
            })
        },
        mounted() {
            this.getScoringList();
            this.eventFieldHandler();
            this.getRelationshipList();
        },  
        methods: {
            // 获取评分因子列表数据
            getScoringList() {
                this.loading = true;
                ScoringV1
                    .scoringFactorList({
                        scoringModelId: '',
                        type: this.scoringType,
                        keyword: this.keyWords,
                        isTemplate: true,
                        pageNumber: this.nowPage
                    })
                    .then(res => {
                        this.totalPage = res.body.data.totalPage;
                        this.totalRow = res.body.data.totalRow;
                        this.factorList = res.body.data.factorList;
                        this.attributeOrEventId = res.body.data.attributeOrEventId;
                        this.loading = false;
                    });
            },
            getClose() {
                this.getScoringList();
                this.factorInfo = false;
            },
            // 筛选因子
            sift() {
                this.nowPage = 1;
                this.getScoringList();
            },
            // 搜索
            searchList() {
                this.nowPage = 1;
                this.getScoringList();
            },
            // 关闭模板状态筛选
            closeStatus() {
                this.chooseStatus = false;
            },
            // 查看单个模板
            checkModal(item) {
                this.factorId = item.id;
                this.factorInfo = true;
            },
            // 删除单个模板
            delScore(item) {
                this.allDel = false;
                this.delModal = true;
                this.selectOneId = item.id;
            },
            // 确定删除模板
            deleteOk() {
                this.loading = true;
                let deleteArray = this.allDel ? this.checkedIds : [this.selectOneId];
                ScoringV1
                    .deleteScoringFactor({factorIdArray:deleteArray})
                    .then((res) => {
                        this.allDel = false;
                        this.delModal = false;
                        this.nowPage = 1;
                        this.checkedIds = [];
                        deleteArray = [];
                        this.getScoringList();
                        this.loading = false;
                        this.$toast(this.$t('scoring.deletedSuccessfully'), 'success');
                        
                    })
                    .catch((res) => {
                        if (res.body.errorCode) {
                            this.allDel = false;
                            this.delModal = false;
                            this.nowPage = 1;
                            this.checkedIds = [];
                            deleteArray = [];
                            this.getScoringList();
                            this.loading = false;
                            this.$toast(res.body.message, 'warn');
                        }
                    });
            },
            // 批量删除
            handleDel() {
                if (this.checkedIds.length === 0) {
                    this.$toast(this.$t('scoring.selectFactor'), 'warn');
                    return;
                }
                this.delModal = true;
                this.allDel = true;
            },
            // 全选当前页数据
            checkData() {
                this.checkedIds = this.factorList.map(item => item.id);
            },
            // 清除数据
            clearData() {
                this.checkedIds = [];
            },
            // 页码
            toPage(e) {
                this.nowPage = e;
                this.getScoringList();
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
                        let basic = [], member = [], tag = [], wecomAttr = [], consume = [], senior = [], etc = [];
                        for (let i = 0; i < len; i++) {
                            switch (Boolean(othAttr[i])) {
                                //case /^openid_wx/.test(othAttr[i].fieldName):
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
                        this.userAttrGroups = [
                            {name: this.$t('swarm.basicInfo'), id: 0, child: basic},
                            {name: this.$t('swarm.memberInfo'), id: 1, child: member},
                            {name: this.$t('swarm.labelInfo'), id: 2, child: tag},
                            {name: this.$t('swarm.consumerInfo'), id: 3, child: consume},
                            {name: this.$t('swarm.advancedInfo'), id: 4, child: senior},
                            {name: this.$t('swarm.wechatInfo'), id: 5, child: wechatAttr},
                            {name: this.$t('home.wecom'), id: 7, child: wecomAttr},
                            {name: this.$t('swarm.customInfo'), id: 6, child: etc},
                            { name: this.$t('swarm.scoringInfo'), id: 8, child: rating }
                        ];
                    });
            },
            //获取事件属性
            async eventFieldHandler() {
                await ContactApi.getEventGroupList()
                    .then((res) => {
                        let reqNum = 0;
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
                                    reqNum += 1;
                                });
                            return eventGroup;
                        });
                        let numInterval = setInterval(() => {
                            intervalNum += 1;
                            if (reqNum === this.eventFieldList.length) {
                                clearInterval(numInterval);
                            }
                        }, 100);
                        if (intervalNum > 300) {
                            clearInterval(numInterval);
                        }
                    });
            },
            // 获取字段名称
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

        }
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../../common/scss/base/_variables';
    @import '../../../common/scss/base/_mixin';
    .scoring-factor-modal{
        .scoring-content {
            flex: 1;
            overflow: auto;
            padding: 24px 16px 16px 16px;
            margin-left: 8px;
            background-color: white;
            .scoring-desc {
                width:65%;
                @include ellipsis;
            }
            .search-box {
                margin-right: 16px;
            }
            .detail-msg {
                line-height: 32px;
                .batch {
                    display: inline-block;
                    width: 120px;
                }
                .hidden-menu-trigger {
                    position: relative;
                    cursor: pointer;

                    &:hover {
                        color: $color-title;
                    }

                    svg {
                        width: 16px;
                        height: 16px;
                        vertical-align: top;
                        margin-top: ($input-field-height - 16px)/2;
                        fill: currentColor;
                    }

                    .hidden-menu {
                        top: $input-field-height;
                        left: 0;
                        text-align: left;
                        @include transform-origin(left top);
                    }
                }
                .tag-btn {
                    padding: 0;
                    margin: 0;
                }
            }
            .scoring-table {
                table-layout: fixed;
                width: 100%;
                margin-top: 16px;
                text-align: left;
                border-collapse: collapse;
                border-spacing: 0;
                .tag-action-menu {
                    float: right;
                    position: relative;
                    right: 30%;
                    .menu-icon {
                        display: block;
                        width: 16px;
                        height: 16px;
                        @include transition();
                        fill: $color-light-content;

                        &:hover {
                            fill: $light-theme;
                        }

                        &:active {
                            fill: $dark-theme;
                        }
                    }
                    .hidden-menu {
                        left: 0;
                        @include transform-origin(left top);
                    }
                }
                .tag-action-icon {
                    position: relative;
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    margin-top: 1px;

                    + .tag-action-icon {
                        margin: 0 0 0 8px;
                    }

                    svg {
                        display: block;
                        width: 16px;
                        height: 16px;
                        @include transition();
                    }
                    &:not([disabled]) {
                        cursor: pointer;
                        .icon-round-pencil {
                            fill: $theme;

                            &:hover {
                                fill: $light-theme;
                            }
                        }
                        .icon-pie {
                            fill: $red;

                            &:hover {
                                fill: $light-red;
                            }
                        }
                    }
                    .more-icon {
                        display: block;
                        width: 16px;
                        height: 16px;
                        @include transition();
                        fill: $color-light-content;

                        &:hover {
                            fill: $light-theme;
                        }
                    }
                }
                .tag-name {
                    display: inline-block;
                    .filter-box {
                        display: inline-block;
                        position: relative;
                        svg {
                            fill: currentColor;
                            width: 14px;
                            height: 14px;
                            vertical-align: middle;
                            margin-left: 1px;
                            cursor: pointer;
                        }
                        .checkbox {
                            padding: 0 10px;
                            display: block;
                            margin: 0;
                        }
                        .drop-list {
                            position: absolute;
                            z-index: 1;
                            left: 0;
                            top: 100%;
                            border-radius: 4px;
                            border: 1px solid $border-color;
                            background-color: $content-bg;
                            line-height: $input-field-height;
                            white-space: nowrap;
                        }
                    }
                }
                th {
                    box-sizing: border-box;

                    &:not([width]) {
                        width: 100%;
                    }
                }
                tr {
                    height: 40px;
                    border-bottom: 1px solid $border-color;

                    &:first-child {
                        background-color: $select-bg;
                    }

                    td:first-child,:last-child {
                        text-align: center;
                    }

                    &:not(:first-child):hover {
                        background-color: $title-bg;
                    }
                }
                td {
                    word-break: break-word;
                    white-space: normal;
                }
                .total-page {
                    margin-top: 10px;
                }
                .desc {
                    position: relative;
                    top: -5px;
                }
            }
        }
    }
</style>

