
<template>
    <div class="form-field score-rule">
        <!-- 因子名称 -->
        <div class="form-field">
          <label class="label">{{'scoring.scoringName' | t}}</label>
          <input type="text" class="input" v-model.trim="rulesObj.scoringTitle"  
                  v-title:top.line.warn="errorTitle" :class="{error: errorTitle}" :placeholder="$t('scoring.enterUpTo100Characters')"
                  @focusin="errorTitle = ''" :maxlength="100" v-if="writable">
          <span class="factor-title" v-else>{{rulesObj.scoringTitle}}</span>
        </div>
        <!-- 得分范围 -->
        <div class="form-field">
          <label class="label">{{'scoring.scoreRange' | t}}</label>
          <span>{{rulesObj.lowestScore}}</span> ~ <span>{{rulesObj.highestScore}}</span>
          <p class="attribute-tip">{{'scoring.rulesDesc' | t}}</p>
        </div>
        <!-- 评分规则 -->
        <label class="label">{{'scoring.scoreRules' | t}}</label>
        <inline-spin v-if="nameLaoding"/>
        <template v-else>
            <svg aria-hidden="true" class="icon event-icon" v-if="fieldEventName().flag">
                <use xlink:href="#icon-shuxing"></use>
            </svg>
            <span class="desc" v-text="fieldEventName().fieldName" :class="{'red-text' : !fieldEventName().flag}"></span>
        </template>
        <div class="middle-box" v-if="fieldEventName().flag">
          <!-- 条件标题 -->
          <th class="title">
              <td>{{'scoring.conditions' | t}}</td>
              <td>{{'scoring.score' | t}}</td>
              <td>{{'scoring.audience' | t}}
                <svg aria-hidden="true" class="icon icon-reset" v-if="writable && rulesObj.rules.length !== 0" @click="peopleCount">
                      <use xlink:href="#icon-reset"></use>
                </svg>
              </td>
              <td>{{'scoring.actions' | t}}</td>
          </th>
          <div class="scoring-empty" v-if="rulesObj.rules.length === 0">
              {{'scoring.scoringEmpty' | t}}
          </div>
          <!-- 条件组件 -->
          <scoring-condition 
                v-for="(item, index) in rulesObj.rules" 
                :writable="writable"
                :key="item.id" :rulesObj="item" 
                @delRule="delRule(index, rulesObj)" 
                @score="score"
                ref="scoringConditions"/>
        </div>
        <button class="btn btn-sm btn-theme btns" v-if="writable && fieldEventName().flag" @click="addRule" >+{{'scoring.addRule' | t}}</button>
    </div>
</template>
<script type="text/babel">
    import { ContactApiV1, ScoringV1 } from '@/api';
    import ScoringCondition from './scoring-condition.vue';
    import customerIcon from '@/customer/list/customer-icon.vue';
    import {I18N_STORE_NAME} from '@/locales';
    import { mapState } from 'vuex';
    export default {
        name: 'attribute-scoring', // 属性因子
        components: {
            ScoringCondition,
            customerIcon
        },
        props: {
            // 添加规则的对象
            rulesObj: {
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
            // 属性或事件id
            attributeOrEventId: {
                type:  [Number, String],
                default: null
            },
            // 因子id
            factorId: {
                type: Number,
                default: null,
            },
            // 是否为新建(有值为编辑)
            isCreate: {
                type:[Number, String],
                default: null,
            }
        },
        data() {
            return {
                errorTitle: '', // 名称错误提示
                userAttrGroups: [], //所有联系人属性 属性因子
                customerFieldList: [],//属性因子列表
                attribute: '',
                nameLaoding: true,
            };
        },
        computed: {
            ...mapState({
                // 语言状态
                lang: state => state[I18N_STORE_NAME].lang === 'zh-CN'
            })
        },
        created() {
            this.getRelationshipList(); 
        },
        methods: {
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
                            {name: this.$t('swarm.scoringInfo'), id: 8, child: rating },
                        ];
                    })
                    .then(() => {
                        this.nameLaoding = false;
                        if (!this.isCreate && this.writable) {
                            this.$set(this.rulesObj, 'scoringTitle', this.fieldEventName().fieldName);
                        }
                    });
            },
            // 匹配字段名称
            fieldEventName() {
                let obj = {
                    iconName: '',
                    fieldName: '',
                    flag: true,
                };
                this.attribute = this.customerFieldList.find((item)=>{
                    return item.id === this.attributeOrEventId;
                });
                if (!this.attribute) {
                    obj.fieldName = this.$t('scoring.fieldAvailable');
                    obj.flag = false;
                } else {
                    obj.fieldName = this.attribute.fieldCn + '( ' + this.attribute.fieldName + ' )';
                    obj.flag = true;
                }
                obj.iconName = '';
                return obj;
            },
            // 校验是否为空
            valid() {
                let res = this.$refs.scoringConditions.filter(attr => {
                    return attr.validAttr() === false;
                });
                return res.length;
            },
            // 计算预估人数
            peopleCount() {
                if (!this.isCreate) {
                    this.$toast(this.$t('scoring.saveFactorFirst'), 'warn');
                } else {
                    if (this.attribute) {
                        ScoringV1
                            .countExpected({factorId: this.isCreate})
                            .then(res => {
                                let data = res.body.data.scoringFactor;
                                let scoreRules = JSON.parse(data.scoreRules);
                                let arrtibuteRules  = scoreRules.rules;
                                this.rulesObj.rules.map(item => {
                                    arrtibuteRules.map(ite => {
                                        if (item.id === ite.id) {
                                            item.expectedNumber = ite.expectedNumber;
                                        }
                                    });
                                });
                                this.$toast(this.$t('menu.synSuccess'), 'success');
                            })
                            .catch((res) => {
                                if (res.body.errorCode) {
                                    this.$toast(res.body.message, 'warn');
                                }
                            });
                    } else {
                        this.$toast(this.$t('scoring.fieldAvailable'), 'warn');
                    }   
                    
                }
            },
            // 校验因子名称是否为空
            checkTitle() {
                if (this.rulesObj.scoringTitle === '') {
                    this.errorTitle = this.$t('scoring.dataRequired');
                    return false;
                }
                return true;
            },
            // 保存时检查字段是否失效
            checkField() {
                if (!this.attribute) {
                    this.$toast(this.$t('scoring.saveAvailable'), 'warn');
                    return false;
                }
                return true;
            },
            // 添加规则
            addRule() {
                if (this.rulesObj.rules.length >= 5) {
                    this.$toast(this.$t('scoring.addFive'), 'warn');
                } else {
                    if (this.rulesObj.rules.length > 0) {
                        this.rulesObj.rules.push(
                            {
                                conditions: [
                                    {
                                        value: '',
                                        operation: '',
                                        fieldType: this.rulesObj.rules[0].conditions[0].fieldType,
                                        field_name: this.rulesObj.rules[0].conditions[0].field_name,
                                        fieldId: this.rulesObj.rules[0].conditions[0].fieldId,
                                        relative_type: 0,
                                        isWarn: false,
                                    }
                                ],    
                                relation: 'and', //且or或
                                openStatus: true, // 得分or扣分
                                score: 0, // 分数
                                expectedNumber: 0,  // 预估人数，计算后用于回显
                                id: Date.now().toString(36),
                            }
                        );
                    } else {
                        this.customerFieldList.find((item)=>{
                            if (item.id === this.attributeOrEventId) {
                                this.rulesObj.rules.push(
                                    {
                                        conditions: [
                                            {
                                                value: '',
                                                operation: '',
                                                fieldType: item.fieldType,
                                                field_name: item.fieldName,
                                                fieldId: item.id,
                                                relative_type: 0,
                                                isWarn: false,
                                            }
                                        ],    
                                        relation: 'and', //且or或
                                        openStatus: true, // 得分or扣分
                                        score: 0, // 分数
                                        expectedNumber: 0,  // 预估人数，计算后用于回显
                                        id: Date.now().toString(36),
                                    }
                                );
                            }
                        });
                    }
                    
                }
            },
            
            // 规则范围计算
            count() {
                let arr1 = []; 
                let arr2 = []; 
                this.rulesObj.rules.map(item => {
                    if (!item.openStatus) {
                        arr2.push(~~item.score);
                    } else {
                        arr1.push(~~item.score);
                    }
                    this.rulesObj.highestScore = Math.max(...arr1);
                    this.rulesObj.lowestScore = -Math.max(...arr2);
                    if (arr1.length === 0) {
                        this.rulesObj.highestScore = 0;  
                    }
                    if (arr2.length === 0) {
                        this.rulesObj.lowestScore = 0;
                    }
                    if (this.rulesObj.rules.length === 1){
                        if (!item.openStatus) {
                            this.rulesObj.highestScore = 0;
                        } else {
                            this.rulesObj.lowestScore = 0;
                        }
                    }
                });
            },
            // 删除规则
            delRule(index, data) {
                data.rules.splice(index, 1);
                this.count();
                if (data.rules.length === 0) {
                    this.rulesObj.highestScore = 0;
                    this.rulesObj.lowestScore = 0;
                }
            },
            // 更新得分范围
            score(score) {
                if (score.openStatus) {
                    if (score.score > this.rulesObj.highestScore) {
                        this.rulesObj.highestScore = ~~score.score;
                    } else {
                        this.rulesObj.highestScore = ~~this.rulesObj.highestScore;
                    }
                } else {
                    if (score.score > Math.abs(this.rulesObj.lowestScore)) {
                        this.rulesObj.lowestScore = -(~~score.score);
                    } else {
                        this.rulesObj.lowestScore = -(~~this.rulesObj.lowestScore);
                    }
                }
                this.count();
            }
        }
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../../common/scss/base/_variables';
    @import '../../../common/scss/base/_mixin';
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
        .attribute-tip {
            margin-left: 130px;
        }
        .middle-box {
            margin-left: 100px;
            .title {
              width: 780px;
              background: $content-bg;
              td {
                  padding: 0 10px;
              }
              td:nth-of-type(1) {
                width: 440px;
              }
              td:nth-of-type(2) {
                width: 165px;
              }
              td:nth-of-type(3) {
                width: 80px;
              }
              td:nth-of-type(4) {
                width: 47px;
              }
              .icon-reset {
                  cursor: pointer;
                  width: 16px;
                  height: 16px;
                  position: relative;
                  top: 3px;
                  fill: $disabled;
              }
            }
            .scoring-empty {
                height: 50px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }
        .btns {
            margin: 30px 0 0 100px;
        }
    }
    
</style>


