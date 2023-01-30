
<template>
    <!-- 编辑评分因子弹窗 -->
    <modal :title="factorRule.id ? $t('newScoring.scoringFactorEdit') : (writable ? $t('newScoring.addScoringFactor') :  $t('newScoring.factorTemplate'))" @close="$emit('close')" size="lg">
        <div class="scoring-factor-edit">
          <attribute-scoring v-if="isType === 0"
                              :isCreate="factorRule.id" 
                              :rulesObj="attributeRules" 
                              ref="attribute" :writable="writable" 
                              :factorRule="factorRule"
                              :attributeOrEventId="(factorRule.id || factorId) ? editattributeOrEventId : attributeOrEventId"
                              :factorId="factorId"></attribute-scoring>
          <event-scoring  v-if="isType === 1" 
                          ref="event"
                          :isCreate="factorRule.id"
                          :rules="eventrRules" 
                          :range="eventRange" 
                          :writable="writable"
                          :attributeOrEventId="(factorRule.id || factorId) ? editattributeOrEventId : attributeOrEventId" 
                          :factorRule="factorRule"
                          :getFiledName="getFiledName"
                          :factorId="factorId"></event-scoring>
        </div>
        <template v-slot:buttons>
            <input type="button" class="btn btn-md btn-white" :value="$t('common.close')"
                   @click="$emit('close')"/>
            <template v-if="writable">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.ok')"
                   v-if="isType === 1" @click="eventOk"/>
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.ok')"
                      v-if="isType === 0" @click="attributeOk"/>
            </template>
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.ok')"
                      v-if="!writable" @click="$emit('close')"/>
        </template>   
    </modal>
</template>
<script type="text/babel">
    import { ScoringV2 } from '@/api';
    import AttributeScoring from './attribute-scoring.vue';
    import EventScoring from './event-scoring.vue';
    export default {
        name: 'scoring-factor-edit', // 编辑评分因子弹框
        components: {
            AttributeScoring,
            EventScoring
        },
        props: {
            // 因子id
            factorId: {
                type: Number,
                default: null,
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
            // 获取查看因子模板父组件传过来的关闭弹窗刷新模板方法
            getClose: {
                type: Function,
                default: null
            },
        },
        data() {
            return {
                isType: this.factorRule.type, // 评分因子类型。0:属性因子 1:事件因子
                attributeOrEventId: (this.factorRule.id || this.factorId) ? '' : (this.factorRule.type === 0 ? this.factorRule.attributeOrEventInfo.id : this.factorRule.attributeOrEventInfo.event_group_id), // 新建时属性或事件id
                editattributeOrEventId: this.factorRule.attributeOrEventId, // 编辑时属性或事件id
                // 属性因子
                attributeRules: {
                    lowestScore: 0, // 得分下限
                    highestScore: 0, // 得分上限
                    scoringTitle: '', // 属性因子名称
                    rules:[
                        {
                            conditions: [
                                {
                                    value: '',
                                    operation: '',
                                    fieldType: (this.factorRule.id || this.factorId) ? '' : this.factorRule.attributeOrEventInfo.type,
                                    fieldId: (this.factorRule.id || this.factorId) ? '' : this.factorRule.attributeOrEventInfo.id,
                                    field_name: (this.factorRule.id || this.factorId) ? '' : this.factorRule.attributeOrEventInfo.fieldName,
                                    relative_type: 0,
                                    isWarn: false,
                                    id: Date.now().toString(36),
                                }
                            ], 
                            relation: 'and', //且or或
                            openStatus: true, // 得分or扣分
                            score: 0, // 分数
                            expectedNumber: 0,  // 预估人数，计算后用于回显
                            id: Date.now().toString(36),
                        }
                    ],
                },
                // 事件因子
                eventRange: {
                    scoringTitle: '', // 事件因子名称
                    scoreFloor: 0,// 得分下限
                    scoreCeil: 0,// 得分上限
                },
                eventrRules: 
                  {
                      relation: 'and', // or:或 and:且；事件因子固定为and
                      score: 0, // 得分，负分则为-1
                      openStatus: true, // true:得分  false：扣分。方便用于回显
                      maxScore: 0, // 得分上限
                      expectedNumber: 0, // 预估人数，计算后用于回显
                      eventGroup: (this.factorRule.id || this.factorId) ? '' : this.factorRule.attributeOrEventInfo.event_group, //事件分组
                      eventGroupId: (this.factorRule.id || this.factorId) ? '' : this.factorRule.attributeOrEventInfo.event_group_id, // 事件分组id
                      event: (this.factorRule.id || this.factorId) ? '' : this.factorRule.attributeOrEventInfo.fieldName, // 事件名称
                      eventId: (this.factorRule.id || this.factorId) ? '' : this.factorRule.attributeOrEventInfo.id, // 事件id
                      isAppoint: 0,// false, // 是否为任意邮件 0任意 1 指定
                      isCardinality: false, // 是否只计一次得分
                      dynamicTime: 'day', // 时间单位，当前固定为day
                      timeType: 0,//'dynamic', // 1 default：绝对时间  0 dynamic:相对时间
                      fromDate: 30,  // 绝对时间的起始日期
                      toDate: 0, // 绝对时间的结束日期
                      conditions: [
                          {
                              // 'app_id' // 公众号 'event_key'// 微信扫码 ‘form_id //表单 ’label_id‘ // 标签 ’wecom_channel_code_id‘ // 企业微信活码
                              field_name: '',  // 不同事件对应不同字段
                              fieldType: 1,
                              operation: 'eq', // 当前固定为等于
                              value: '', // 任务实例id/公众号app_id/微信二维码id/表单id/标签id/企业微信活码
                              task_instantiation_id: '',
                              journey_instantiation_id: '',
                              journey_group_id: '',
                              isWarn: false,
                          }
                      ],
                  },
                eventToField: [
                    {
                        fieldName: 'task_instantiation_id',// 任务实例id
                        field_type: 2,  
                        events: {
                            'dmd_open': '邮件打开',
                            'dmd_click': '邮件点击',
                            'dmd_sent': '邮件发送',
                            'sms_click_link': '短信点击',
                            'sms_send': '短信发送',
                            'mms_click_link': '彩信点击',
                            'mms_send': '彩信发送',
                            'wx_customer_news': '客服消息',
                            'wx_template_news': '模板消息',
                            'wecom_contact_group_msg_contact': '联系人企业群发-联系人',
                            'wecom_agent_msg_content': '应用消息-联系人'
                        }
                    },
                    {
                        fieldName: 'app_id',  // 公众号app_id
                        field_type: 1,
                        events: {
                            'wx_reply_message': '微信回复',
                            'wx_subscribe': '微信关注',
                            'wx_unsubscribe': '微信取消关注',
                            'wx_click_menu': '微信点击菜单'
                        }
                    },
                    {
                        fieldName: 'event_key',  // 如果是微信扫码事件，则此字段为微信二维码id
                        field_type: 1,
                        events: {
                            'wx_scan': '微信扫码'
                        }
                    },
                    {
                        fieldName: 'form_id',  // 表单id
                        field_type: 2,
                        events: {
                            'form_open': '表单打开',
                            'form_submit': '表单提交'
                        }
                    },
                    {
                        fieldName: 'label_id',  // 标签id
                        field_type: 2,
                        events: {
                            'label_add': '标签新增',
                            'label_remove': '标签移除',
                            'fans_label_add': '粉丝标签新增',
                            'fans_label_remove': '粉丝标签移除'
                        }
                    },
                    {
                        fieldName: 'wecom_channel_code_id',  // 企业微信活码id
                        field_type: 1,
                        events: {
                            'wecom_scan_code': '企业微信扫码'
                        }
                    }
                ],
                errorCode: '', //是否异步操作删除原型
            };
        },
        mounted() {
            if (this.factorRule.id || this.factorId) {
                this.getFactorInfo();
            } else {
                if (this.isType === 1) {
                    this.getFiledName();
                }
            }
        },
        methods: {
            // 通过event找到conditions对应的field_name
            getFiledName() {
                this.eventToField.map(item => {
                    if (item.events[this.eventrRules.event]) {
                        this.eventrRules.conditions.map(ite => {
                            ite.field_name = item.fieldName;
                            ite.fieldType = item.field_type;
                        });
                    }
                });
            },
           
            // 获取单个评分因子详情
            getFactorInfo() {
                ScoringV2
                    .scoringFactor({
                        factorId: !this.writable ? this.factorId : this.factorRule.id,
                        scoringModelId: this.writable ? this.factorRule.scoringModelId : ''
                    })
                    .then(res => {
                        let data = res.body.data.scoringFactor;
                        this.isType = data ? data.type : '';
                        let scoreRules =  data ? JSON.parse(data.scoreRules) : '';
                        this.editattributeOrEventId = data ? data.attributeOrEventId : '';
                        if (this.isType === 0) {
                            // 属性
                            this.attributeRules.lowestScore = data.scoreFloor;
                            this.attributeRules.highestScore = data.scoreCeil;
                            this.attributeRules.scoringTitle = data.name;
                            this.attributeRules.rules = scoreRules.rules;
                            scoreRules.rules.map(item => {
                                item.score = Math.abs(item.score);
                            });
                            this.attributeRules.rules.map(item => {
                                if (item.conditions.length > 0) {
                                    item.conditions.map( ite => {
                                        if (!ite.value) {
                                            this.$toast(this.$t('controller.invalidCondition'),'warn');
                                        }
                                    });
                                }
                                
                            });
                        } else if (this.isType === 1){  
                            // 事件
                            this.eventRange.scoringTitle = data.name;
                            this.eventRange.scoreFloor = data.scoreFloor;
                            this.eventRange.scoreCeil = data.scoreCeil;
                            this.eventrRules  = scoreRules.rules[0];
                            scoreRules.rules[0].score = Math.abs(scoreRules.rules[0].score);
                            scoreRules.rules[0].maxScore = Math.abs(scoreRules.rules[0].maxScore);
                            this.eventrRules.isAppoint = (scoreRules.rules[0].isAppoint ? 0 : 1 );
                            this.eventrRules.timeType = (scoreRules.rules[0].timeType === 'dynamic' ? 0 : 1);
                            if (this.eventrRules.timeType === 0) {
                                this.eventrRules.fromDate = Math.abs(scoreRules.rules[0].fromDate);
                                this.eventrRules.toDate = scoreRules.rules[0].toDate;
                            }
                            if (scoreRules.rules[0].conditions.field_name) {
                                this.eventrRules.conditions.map(item => {
                                    if (!item.value) {
                                        this.$toast(this.$t('controller.invalidCondition'),'warn');
                                    }
                                });
                            }
                            
                        }
                    })
                    .catch((res) => {
                        if (res.body.errorCode && this.writable) {
                            if (res.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                                this.$parent.closeScoreEdit();
                                this.$router.push({name: 'scorerating'});
                                this.$toast(res.body.message, 'warn');
                            } else if (res.body.errorCode === 'FACTOR_DOES_NOT_EXIST') {
                                this.$parent.closeScoreEdit();
                                this.$parent.getScoringList(false);
                                this.$toast(res.body.message, 'warn');
                            }
                        } else if (res.body.errorCode && !this.writable) {
                            this.$toast(res.body.message, 'warn');
                            this.getClose();
                        } else {
                            this.$toast(res.body.message, 'warn');
                        }
                    });
            },
            // 确定保存新建/编辑分群
            saveRule() {
                let factor = this.isType === 0 ? 
                    {
                        type: 'contact',
                        rules: this.attributeRules.rules
                    }
                    :  
                    {
                        type: 'event',
                        rules: [this.eventrRules]
                    };
                const scoreMax = Math.max(...factor.rules.map(item => item.openStatus ? Number(item.maxScore) : 0));
                let afterScore = 0;
                if (this.factorRule.newFactorFlag || this.factorRule.id === ''){
                    afterScore = scoreMax + this.$parent.$refs['flow'].fullScore;
                    if ( afterScore > 100){
                        this.$toast(`${this.$t('newScoring.theFullScoreShallNotBeGreaterThan100')}（${this.$t('newScoring.now')}：${afterScore}），${this.$t('newScoring.pleaseResetRules')}`, 'success');
                        return false;
                    }
                } else {
                    const editFactorScore = this.$parent.$refs['flow'].scoringFactorList.find(item=>item.id === this.factorRule.id).scoreCeil;
                    afterScore = scoreMax + this.$parent.$refs['flow'].fullScore - editFactorScore;
                }
                if ( afterScore > 100){
                    this.$toast(`${this.$t('newScoring.theFullScoreShallNotBeGreaterThan100')}（${this.$t('newScoring.now')}：${afterScore}），${this.$t('newScoring.pleaseResetRules')}`, 'warn');
                    return false;
                }
                
                if (this.isType === 0) {
                    this.attributeRules.rules.map(item => {
                        if (!item.openStatus) {
                            item.score = -item.score;
                        } 
                        item.maxScore = item.score;
                        item.conditions.map(ite => {
                            delete ite.isWarn;
                            delete ite.id;
                        });
                    });
                } else {
                    this.eventrRules.conditions.map(item => {
                        delete item.isWarn;
                    });
                    if (!this.eventrRules.openStatus) {
                        this.eventrRules.score = -this.eventrRules.score;
                        this.eventrRules.maxScore = -this.eventrRules.maxScore;
                    }
                    this.eventrRules.isAppoint = (this.eventrRules.isAppoint === 0 ? true : false );
                    this.eventrRules.timeType = (this.eventrRules.timeType === 0 ? 'dynamic' : 'default');
                    if (this.eventrRules.timeType === 'dynamic') {
                        this.eventrRules.fromDate = -this.eventrRules.fromDate;
                        this.eventrRules.toDate = 0;
                    }
                }
                
                let obj = {
                    scoringModelId: this.factorRule.scoringModelId,
                    id: this.factorRule.newFactorFlag ? '' : this.factorRule.id,
                    type: this.isType,
                    name: this.isType === 0 ? this.attributeRules.scoringTitle : this.eventRange.scoringTitle,
                    isTemplate: this.factorRule.isTemplate,
                    attributeOrEventId: this.factorRule.id ? this.editattributeOrEventId : 
                        (this.isType === 0 ? this.factorRule.attributeOrEventId : 
                            this.factorRule.attributeOrEventInfo.event_group_id),
                    scoreRules: JSON.stringify(factor)
                };
                
                ScoringV2
                    .saveScoringFactor(obj)
                    .then( res => {
                        this.$emit('close', 1);
                        this.$toast(this.$t('sendChannel.success'), 'success');
                    })
                    .catch((res) => {
                        if (res.body.errorCode) {
                            if (res.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                                this.$toast(res.body.message, 'warn');
                            } else if (res.body.errorCode === 'FACTOR_DOES_NOT_EXIST') {
                                this.$toast(res.body.message, 'warn');
                            } else if (res.body.errorCode === 'FACTOR_TO_LIMIT') {
                                this.$toast(res.body.message, 'warn');
                            }
                        } else {
                            this.$toast(res.body.message, 'warn');
                        }
                        this.$emit('close', 0);
                    });
            },
            // 属性事件确定校验
            attributeOk() {
                if (this.$refs.attribute.checkField() && this.$refs.attribute.valid() === 0) {
                    this.saveRule();
                }
            },
            //行为事件确定
            eventOk() {  
                this.$refs.event.checkField();
                if (this.$refs.event.checkField()) {
                    this.$refs.event.valid();
                    if (this.eventrRules.isAppoint === 0) {
                        if (this.$refs.event.checkField()) {
                            this.saveRule();
                        }
                    } else {
                        if (this.$refs.event.valid() && this.$refs.event.checkField()) {
                            this.saveRule();
                        }
                    }
                }
            }
        }
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../../../../../common/scss/base/_variables';
    @import '../../../../../../common/scss/base/_mixin';

</style>
