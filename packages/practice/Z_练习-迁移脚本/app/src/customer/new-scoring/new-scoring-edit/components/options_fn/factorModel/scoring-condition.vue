
<template>
    <div class="scoring-condition" >
        <div class="condition">
            <div class="scoring-box">
                <div ref="classify" :class="rulesObj.conditions.length > 1 ? 'classify border border-left' : 'classify'">
                    <div class="maybe" @click="switcherUser(rulesObj)" v-if="rulesObj.conditions.length > 1">
                        <span v-if="rulesObj.relation == 'and'">{{'common.and' | t}}</span>
                        <span v-if="rulesObj.relation == 'or'">{{'common.or' | t}}</span>
                    </div>
                    <template>
                        <div class="choose-box">
                            <div class="choose" v-for="(ite,index) in rulesObj.conditions" :key="index" :class="{'last-selector': index + 1 === rulesObj.conditions.length}"> 
                              <selector :options="formSourceLabel"
                                        class="selector-l"
                                        v-model="ite.operation"
                                        :disabled="!writable"
                                        @select="relativeChange($event, ite)"></selector>
                              <template v-if="ite.operation && 
                                              ite.operation !== 'belong' && 
                                              ite.operation !== 'nbelong' &&
                                              ite.operation !== 'exists' &&
                                              ite.operation !== 'range' &&
                                              ite.operation !== 'missing' &&
                                              fieldType === 1">
                                  <searchable-input  v-if="writable" :maxlength="100" :searchResultList="searchResultList"
                                      :target="ite" :isFactor="true" @search="searchTarget($event,ite)" @select="selectResult(ite)" :key="ite.id">
                                  </searchable-input>
                                  <span v-else>{{ite.value || ''}}</span>
                              </template>
                              <template v-if="ite.operation === 'belong' || ite.operation === 'nbelong'">
                                  <!-- 文本 -->
                                  <template v-if="fieldType === 1">
                                      <query-filter-condition-value :maxlength="5000" :options="searchResultList" inputType="many"
                                                      v-if="ite.field_name === 'dmd_click_url'" valueType="text" :maxTag="99"
                                                      v-model="ite.value" :disabled="!writable" @select="changeIsWarn(ite)"/>
                                      <query-filter-condition-value :maxlength="1024" :options="searchResultList" inputType="many"
                                                                    v-else-if="ite.field_name === 'sms_url'" valueType="text" :maxTag="99"
                                                                    v-model="ite.value" :disabled="!writable" @select="changeIsWarn(ite)"/>
                                      <query-filter-condition-value :maxlength="300" :options="searchResultList" inputType="many"
                                                                    v-else valueType="text" :maxTag="99"
                                                                    v-model="ite.value" :disabled="!writable" @select="changeIsWarn(ite)"/>
                                  </template>
                                  <!-- 数字 -->
                                 <query-filter-condition-value  :maxlength="12" :options="searchResultList" inputType="many" :ifRange="false" :ifReg="true"
                                                                v-if="fieldType === 2" valueType="number" :maxTag="99" v-model="ite.value"
                                                                :disabled="!writable" @select="changeIsWarn(ite)"/>
                               
                              </template>
                              <template v-if="fieldType === 2">
                                  <input v-if="ite.operation === 'gt' || ite.operation === 'lt' || ite.operation === 'eq' || ite.operation === 'ne'" 
                                         :disabled="!writable" v-model.trim="ite.value" class="input md" type="number" maxlength="20" @input="valChange(ite)">
                              </template>
                              <template v-if="ite.operation === 'range'">
                                   <input class="input" v-model="ite.value.start" type="text" :maxlength="20" style="width:50px;" :disabled="!writable" @input="changeIsWarn(ite)">
                                   <span>{{'data.to' | t}}</span>
                                   <input class="input" v-model="ite.value.end" type="text" :maxlength="20" style="width:50px;" :disabled="!writable" @input="changeIsWarn(ite)">
                              </template>
                              <!-- 日期 -->
                              <template v-if="fieldType === 3">
                                  <template v-if="ite.operation === 'currentRelativeTime'">
                                        <span>{{'swarm.relativeTime' | t}}</span>
                                        <input class="input tiny" v-if="writable" v-model="ite.value" type="number" :maxlength="3" @input="changeIsWarn(ite)">
                                        <span v-if="!writable">{{ite.value || ''}}</span>
                                        <span>{{'time.day' | t}}</span>
                                        <selector :disabled="!writable" :class="{disabled: !writable}" :options="relative" v-model="ite.relative_type" style="width:85px;" @select="changeIsWarn(ite)">
                                        </selector>
                                  </template>
                                  <template v-if="ite.operation === 'absoluteTime'">
                                      <span>{{'swarm.absoluteDateA' | t}}</span>
                                      <calendar v-if="writable" v-model="ite.value.start" :end="ite.value.end" style="width:85px;" @input="changeIsWarn(ite)"/>
                                      <span v-if="!writable">{{ite.value.start}}</span>
                                      <span>{{'swarm.absoluteDateB' | t}}</span>
                                      <calendar v-if="writable" v-model="ite.value.end" :start="ite.value.start" style="width:85px;" @input="changeIsWarn(ite)"/>
                                      <span v-if="!writable">{{ite.value.end}}</span>
                                      <span>{{'swarm.absoluteDateC' | t}}</span>
                                  </template>
                              </template>
                              <!-- 组合类型 -->
                              <template v-if="fieldType === 4">
                                    <!--标签列表-->
                                    <template v-if="ite.field_name === 'label_ids'">
                                        <condition-group-tablist v-if="groupListLoaded && ite.operation && ite.operation!=='belong' && ite.operation!=='nbelong'"
                                                                 :key="index"
                                                                 :tabList="selectList(ite.field_name)"
                                                                 @select="changeIsWarn(ite)"
                                                                 :disabled="!writable"
                                                                 v-model="ite.value">
                                        </condition-group-tablist>
                                        <swarmMultiSelect class="countHide"
                                                          style="width: 200px;"
                                                          :key="Date.now().toString(36)"
                                                          :search="true"
                                                          :noSwarm="true"
                                                          :disabled="!writable"
                                                          @input="changeIsWarn(ite)"
                                                          v-if="ite.operation==='belong' || ite.operation==='nbelong'"
                                                          :title="mulitSelectTitle(ite.field_name)"
                                                          v-model="ite.value"
                                                          :options="selectList(ite.field_name)"/>
                                    </template>
                                    <template v-else>
                                        <selector class="lg"
                                            :key="index"
                                            :class="{'label-selector':tagAndWecom(ite.field_name)}"
                                            v-if="ite.operation && ite.operation!=='belong' && ite.operation!=='nbelong'"
                                            :options="selectList(ite.field_name)"
                                            :search="true"
                                            @select="changeIsWarn(ite)"
                                            :disabled="!writable"
                                            v-model="ite.value">
                                        </selector>
                                        <swarmMultiSelect class="countHide"
                                                          style="width: 200px;"
                                                          :key="Date.now().toString(36)"
                                                          :search="true"
                                                          :noSwarm="true"
                                                          :disabled="!writable"
                                                          @input="changeIsWarn(ite)"
                                                          v-if="ite.operation==='belong' || ite.operation==='nbelong'"
                                                          :title="mulitSelectTitle(ite.field_name)"
                                                          v-model="ite.value"
                                                          :options="selectList(ite.field_name)"/>
                                    </template>
                              </template>
                              <span v-if="(ite.operation === 'belong' || ite.operation === 'nbelong') && fieldType !== 4 && writable" class="action-icon icon icon-pencil batch-icon "
                                          @click="editByRawValue(ite)"></span>
                              <svg aria-hidden="true" class="icon quxiao-icon" v-if="writable" @click="delScore(rulesObj,index)">
                                  <use xlink:href="#icon-quxiao"></use>
                              </svg>
                              <p class="not-complete" v-if="ite.isWarn">
                                  <span class="icon icon-warn"></span>
                                  <span> {{'swarm.curInvalid' | t}} </span>
                              </p>
                            </div>
                            <!-- 添加条件 -->
                            <div @click="addScore(rulesObj.conditions)" class="add-score" v-if="writable">
                                <svg aria-hidden="true" class="icon add-icon">
                                    <use xlink:href="#icon-add"></use>
                                </svg>
                                <span class="theme-text">{{'newScoring.addCondition' | t}}</span>
                            </div>
                        </div>
                    </template>
                </div>
                <!-- 得分 -->
                <div class="score">
                    <!-- <switch-button class="switch-btn" v-model="rulesObj.openStatus" :has="!writable" @input="switchBtn(rulesObj)">
                        <span class="add" v-if="rulesObj.openStatus">+</span>
                        <span class="sub" v-else>-</span>
                    </switch-button> -->
                    <input  type="number" 
                            class="input" 
                            v-model.trim="rulesObj.score"
                            :disabled="!writable"
                            @blur="getScoreBlur(rulesObj)"
                            style="width: 40px;margin: 0 10px;">
                    <span>{{'newScoring.points' | t}}</span>
                </div>
                <!-- 预估人数 -->
                <div class="plan-num">
                  <span>{{rulesObj.expectedNumber}}</span>
                  <i class="icon icon-yiwen1" v-title:top="$t('newScoring.expectedTip')"></i>
                </div>
                <!-- 删除 -->
                <div class="delete">
                    <button class="btn del-icon-btn" :disabled="!writable" 
                    v-title="$t('form.shareDelete')" @click="$emit('delRule')">
                         <svg aria-hidden="true" class="icon del-icon">
                            <use xlink:href="#icon-shanchu"></use>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <!-- 属于或不属于弹窗 -->
        <confirm v-if="editRawValues" :title="$t('analysis.batchInput')" :autoConfirm="false" @cancel="reset" @confirm="digestRawValues(conditionData)">
            <textarea class="textarea full-width" rows="20" autofocus="true" v-model="rawData.value" @input="rebase"></textarea>
            <span class="disabled-text">{{'analysis.note' | t}}</span>
            <span class="pull-right" :class="{'red-text':this.batchCount === 99}">{{batchCount}}/99</span>
        </confirm>
    </div>
</template>
<script type="text/babel">
    import { ContactApiV1, WecomApiV1 } from '@/api';
    import uniq from 'lodash/uniq';
    import conditionGroupTablist from '@/customer/swarm/condition-group-tablist.vue';
    import searchableInput from '@/customer/swarm/searchable-input.vue';
    import QueryFilterConditionValue from '@/analysis/components/query-filter-condition-value.vue';
    import swarmMultiSelect from '@/journey/draggable-form/canvas/controller/sub-controllers/components/swarm-multi-select.vue';

    export default {
        name: 'scoring-condition', // 属性因子条件小组件
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
            // 属性或事件传过来的类型对象
            // attributeOrEventInfo: {
            //     type: Object,
            //     default: () => {
            //         return {};
            //     }
            // }
        },
        components: {
            QueryFilterConditionValue,
            searchableInput,
            swarmMultiSelect,
            conditionGroupTablist
        },
        data() {
            return {
                fieldType: this.rulesObj.conditions[0].fieldType, // （1：文本；2：数字；3：日期; 4: 集合类型 ）
                //前后关系
                relative: [
                    { name: this.$t('swarm.within'), id: 0 },
                    { name: this.$t('swarm.beyond'), id: 1 }
                ],
                editRawValues: false,// 是否批量输入
                conditionData: '', // 暂时存放的条件数据
                formSourceLabel: [],
                rawData: {
                    value: '', // 批量输入字符串
                    valueType: '', // 数据类型
                },
                searchResultList: [], //自动补全搜索结果
                groupList: [], // 标签列表
                groupListLoaded: false,    // 标签列表加载完毕
                staffNameList:[],//企业微信员工姓名列表
                staffMobileList:[],//企业微信员工手机号列表
                staffEmailList:[],//企业微信员工邮箱列表
                wecomGroupList:[], //企业微信所属群列表
            };
        },
        created() {
            // （1：文本；2：数字；3：日期; 4: 集合类型 ）
            if (this.fieldType === 1) {
                this.formSourceLabel = [
                    { name: this.$t('analysis.equal'), id: 'eq', limitSize: 1 },
                    { name: this.$t('analysis.unEqual'), id: 'ne', limitSize: 1 },// 不等于
                    { name: this.$t('analysis.belong'), id: 'belong', limitSize: 1 },
                    { name: this.$t('swarm.notBelong'), id: 'nbelong', limitSize: 1 }, // 不属于
                    { name: this.$t('analysis.value'), id: 'exists', limitSize: 1 },
                    { name: this.$t('analysis.none'), id: 'missing', limitSize: 1 },  // 没值
                    { name: this.$t('controller.contains'), id: 'in', limitSize: 1 },  
                    { name: this.$t('controller.notContains'), id: 'nin', limitSize: 1 }, // 不包含
                ];
            } else if (this.fieldType === 2){
                this.formSourceLabel = [
                    { name: this.$t('analysis.equal'), id: 'eq', limitSize: 1 },
                    { name: this.$t('analysis.unEqual'), id: 'ne', limitSize: 1 },// 不等于
                    { name: this.$t('analysis.belong'), id: 'belong', limitSize: 1 },
                    { name: this.$t('swarm.notBelong'), id: 'nbelong', limitSize: 1 }, // 不属于
                    { name: this.$t('analysis.value'), id: 'exists', limitSize: 1 },
                    { name: this.$t('analysis.none'), id: 'missing', limitSize: 1 },  // 没值
                    { name: this.$t('analysis.moreThan'), id: 'gt', limitSize: 1},// 大于
                    { name: this.$t('analysis.lessThan'), id: 'lt', limitSize: 1}, // 小于
                    { name: this.$t('analysis.range'), id: 'range', limitSize: 2},  // 区间
                ];
            } else if (this.fieldType === 3) {
                this.formSourceLabel = [
                    { name: this.$t('analysis.value'), id: 'exists', limitSize: 1 },
                    { name: this.$t('analysis.none'), id: 'missing', limitSize: 1 },  // 没值
                    { name: this.$t('analysis.absoluteTime'), id: 'absoluteTime', limitSize: 2 },  // 绝对时间
                    { name: this.$t('analysis.relativeTime'), id: 'currentRelativeTime', limitSize: 1},  // 相对时间 
                ];
            } else if (this.fieldType === 4) {
                this.formSourceLabel = [
                    {name: this.$t('analysis.equal'), id: 'eq', limitSize: 1},
                    {name: this.$t('analysis.unEqual'), id: 'ne', limitSize: 1},
                    {name: this.$t('analysis.belong'), id: 'belong', limitSize: 1},
                    {name: this.$t('swarm.notBelong'), id: 'nbelong', limitSize: 1}
                ];
            }
        },
        computed: {
            // 属于 不属于 计算标签个数
            batchCount () {
                if (this.rawData.value) {
                    let verifyArray = this.rawData.value
                        .split('\n')
                        .map(line => String(line).trim())
                        .filter(line => line);
                    return verifyArray.length;
                }
                return 0;
            },
        },
        mounted() {
            this.getGroupList();
            this.getStaffNameList();
            this.getStaffMobileList();
            this.getStaffEmailList();
            this.getWecomGroupList();
        },
      
        methods: {
            // 校验错误后 输入值 错误提示 消失
            valChange (item) {
                if (item.value && item.value.length !== 0) {
                    item.isWarn = false;
                }
            },

            // 校验错误后 输入值 错误提示 消失
            changeIsWarn(item) {
                if (item.value && item.value.length !== 0) {
                    item.isWarn = false;
                }
            },
            // 获取企业微信员工姓名列表
            getStaffNameList() {
                WecomApiV1.getStaffListNoPage(1).then(res => {
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
            },
            // 获取企业微信员工手机号列表
            getStaffMobileList() {
                WecomApiV1.getStaffListNoPage(2).then(res => {
                    let resList = res.body.data.staffList.filter(e => e.value !== '');
                    this.staffMobileList = resList.map(e => {
                        let arr = {};
                        arr.name = e.value;
                        arr.id = e.userId;
                        return arr;
                    });
                });
            },
            // 获取企业微信员工邮箱列表
            getStaffEmailList() {
                WecomApiV1.getStaffListNoPage(3).then(res => {
                    let resList = res.body.data.staffList.filter(e => e.value !== '');
                    this.staffEmailList = resList.map(e => {
                        let arr = {};
                        arr.name = e.value;
                        arr.id = e.userId;
                        return arr;
                    });
                });
            },
            // 获取企业微信所属群列表
            getWecomGroupList() {
                WecomApiV1.getWecomGroupList().then(res => {
                    let resList = res.body.data.groupList.filter(e => e.value !== '');
                    this.wecomGroupList = resList.map(e => {
                        let arr = {};
                        arr.name = e.value;
                        arr.id = e.chatId;
                        return arr;
                    });
                });
            },
            // 获取标签列表
            getGroupList() {
                ContactApiV1
                    .relation()
                    .then(res => {
                        this.groupList = res.body.data.groupList.map(e => {
                            let arrList = {};
                            arrList.name = e.groupName;
                            arrList.id = e.groupId;
                            return arrList;
                        });
                        this.groupListLoaded = true;
                    });
            },
            /**
              * 标签选择/员工选择 title
              * type event：行为事件 attributes：联系人属性
              */
            mulitSelectTitle(filedName) {
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
            //标签和企业微信部分属性 list
            selectList(filedName){
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
            //标签个企业微信部分属性显示一致
            tagAndWecom(filedName) {
                return filedName === 'label_ids' || filedName === 'wecom_staff_name' ||
                    filedName === 'wecom_staff_mobile' || filedName === 'wecom_staff_email' ||
                    filedName === 'wecom_group_name';
            },
            // 验证属性值
            validAttr() {
                let isRule = true;
                this.rulesObj.conditions.forEach((item,index) => {
                    // 非空值验证
                    if (item.field_name === 'event_count') {
                        if (
                            // item.event_data_start === '' ||
                            // item.event_data_end === '' ||
                            (item.relative_type === 0 && item.value === '') ||
                            (item.relative_type === 0 && item.operation === 'range' && item.value.start === '') ||
                            (item.relative_type === 0 && item.operation === 'range' && item.value.end === '')
                        ) {
                            this.$toast(this.$t('swarm.invalidRule'), 'warn');
                            item.isWarn = true;
                            this.$set(this.rulesObj.conditions,index, item);
                            isRule = false;
                        }
                        if (item.limitSize === 2) {
                            if (Number(item.value.start) >= Number(itema.value.end)) {
                                this.$toast(this.$t('swarm.rangeWrong'), 'warn');
                                item.isWarn = true;
                                this.$set(this.rulesObj.conditions,index, item);
                                isRule = false;
                            }
                        }
                    } else {
                        if (
                            item.fieldId === '' ||
                            item.operation === '' ||
                            (item.value === '' && item.limitSize !== 0) ||
                            (item.value.start === '' && item.limitSize !== 0) ||
                            (item.value.end === '' && item.limitSize !== 0) ||
                            (item.value.length === 0 && item.limitSize !== 0)
                        ) {
                            this.$toast(this.$t('swarm.invalidRule'), 'warn');
                            item.isWarn = true;
                            this.$set(this.rulesObj.conditions,index, item);
                            isRule = false;
                        }
                    }
                    
                    // 文本类型验证
                    if (item.fieldType === 1) {
                        if (['belong','nbelong'].includes(item.operation)) {
                            if (item.value.length === 0) {
                                return this.$toast(this.$t('swarm.infoNotComplete'), 'warn');
                            } else if (!this.validateStr(item.value)) {
                                item.isWarn = true;
                                this.$set(this.rulesObj.conditions,index, item);
                                isRule = false;
                            }
                        } else if (item.value.length > 100 && item.field_name !== 'dmd_click_url' && item.field_name !== 'sms_url') {
                            this.$toast(this.$t('swarm.max100Chars'), 'warn');
                            item.isWarn = true;
                            this.$set(this.rulesObj.conditions,index, item);
                            isRule = false;
                        }
                    }
                    // 数字类型验证
                    if (item.fieldType === 2 || item.fieldType === 6) {
                        if (item.field_name !== 'event_count' || item.relative_type !== 1) {
                            let string = /^\d+(\.\d+)?$/;
                            if (item.limitSize === 1) {
                                if (item.operation === 'belong' || item.operation === 'nbelong') {
                                    if (item.value.length === 0) {
                                        this.$toast(
                                            this.$t('swarm.infoNotComplete'),
                                            'warn'
                                        );
                                        item.isWarn = true;
                                        this.$set(this.rulesObj.conditions,index, item);
                                        isRule = false;
                                    } else if (item.field_name !== 'form_id' && item.field_name !== 'label_id') {
                                        if (!this.validateNum(item.value)) {
                                            item.isWarn = true;
                                            this.$set(this.rulesObj.conditions,index, item);
                                            isRule = false;
                                        }
                                    }
                                } else if (
                                    !string.test(item.value) ||
                                    item.value.length > 20
                                ) {
                                    this.$toast(this.$t('swarm.numberFormatErr'), 'warn');
                                    item.isWarn = true;
                                    this.$set(this.rulesObj.conditions,index, item);
                                    isRule = false;
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
                                    item.isWarn = true;
                                    this.$set(this.rulesObj.conditions,index, item);
                                    isRule = false;
                                }
                                if (Number(item.value.start) >= Number(item.value.end)) {
                                    this.$toast(this.$t('swarm.rangeWrong'), 'warn');
                                    item.isWarn = true;
                                    this.$set(this.rulesObj.conditions,index, item);
                                    isRule = false;
                                }
                            }
                        }
                    }
                    // 时间验证
                    if (item.fieldType === 3) {
                        if (item.operation === 'currentRelativeTime' && item.limitSize === 1) {
                            if (item.value.length > 3) {
                                this.$toast(this.$t('swarm.max3Chars'), 'warn');
                                item.isWarn = true;
                                this.$set(this.rulesObj.conditions,index, item);
                                isRule = false;
                            }
                            let detection = /^([0-9]*)$/;
                            if (!detection.test(item.value)) {
                                this.$toast(this.$t('swarm.positiveInteger'), 'warn');
                                item.isWarn = true;
                                this.$set(this.rulesObj.conditions,index, item);
                                isRule = false;
                            }
                        }
                    }
                    // 数组类型验证
                    if (item.fieldType === 4) {
                        if (item.value === '' || item.length === 0) {
                            this.$toast(this.$t('swarm.pickAGroup'), 'warn');
                            item.isWarn = true;
                            this.$set(this.rulesObj.conditions,index, item);
                            isRule = false;
                        }
                    }
                    if (
                        item.fieldType !== 1 &&
                        item.fieldType !== 2 &&
                        item.fieldType !== 3 &&  
                        item.fieldType !== 4
                        //  &&item.fieldType !== 6
                    ) {
                        item.isWarn = true;
                        this.$set(this.rulesObj.conditions,index, item);
                        isRule = false;
                    }
                });
                return isRule;
            },
            // 切换与或非
            switcherUser(item) {
                if (this.writable) {
                    switch (item.relation) {
                        case 'and':
                            item.relation = 'or';
                            break;
                        case 'or':
                            item.relation = 'and';
                            break;
                    }
                } else {
                    return false;
                }
                
            },
            // 分数限制0~100
            getScoreBlur(data) {
                if (data.score === '' || data.score < 0) {
                    data.score = 0;
                } else if (data.score > 100) {
                    data.score = 100;
                } else if (String(data.score).indexOf('.') > -1) {
                    data.score = Math.round(data.score);
                }
                data.score = Number(data.score);
                this.$emit('score', data);
            },
            // 切换得分与扣分
            // switchBtn(data) {
            //     this.$emit('score', data);
            // },
            // 选择关系
            relativeChange(e, ite) {
                ite.limitSize = e.limitSize;
                ite.operation = e.id;
                if (e.id === 'exists') {
                    ite.value = '1';
                } else if (e.id === 'missing') {
                    ite.value = '0';
                } else if (e.limitSize === 1 || e.limitSize === 0) {
                    ite.value = (ite.operation === 'belong' || ite.operation === 'nbelong') ? [] : '';
                } else {
                    ite.value = {
                        start: '',
                        end: ''
                    };
                }
                ite.isWarn = false;
            },
            // 添加条件
            addScore(conditions) {
                if (conditions.length >= 3) {
                    this.$toast(this.$t('newScoring.addThree'), 'warn');
                } else {
                    conditions.push(
                        {
                            value: '',
                            operation: '',
                            fieldType: this.rulesObj.conditions[0].fieldType,
                            field_name: this.rulesObj.conditions[0].field_name,
                            relative_type: 0,
                            fieldId: this.rulesObj.conditions[0].fieldId,
                            isWarn: false,
                            id: Date.now().toString(36),
                        }
                    );
                }
            },
            // 删除条件
            delScore(item, index) {
                item.conditions.splice(index, 1);
                if (item.conditions.length === 0) {
                    this.$emit('delRule');
                }
            },
            // 展示批量输入
            editByRawValue (Child) {
                this.conditionData = Child;
                this.rawData.valueType = Child.fieldType;
                this.rawData.value = Child.value.join('\n');
                this.editRawValues = true;
            },
            // 处理批量输入
            digestRawValues (data) {
                let verifyArray = this.rawData.value
                    .split('\n')
                    .map(line => String(line).trim())
                    .filter(line => line);
                let valueType = this.rawData.valueType;
                switch (valueType) {
                    // 文本
                    case 1:
                        if (this.validateStr(verifyArray)) {
                            data.value = uniq(verifyArray);
                            this.reset();
                        }
                        break;
                    // 小数
                    case 2:
                        if (this.validateNum(verifyArray)) {
                            data.value = uniq(verifyArray);
                            this.reset();
                        }
                        break;
                }
            },
            // 重置批量输入弹窗内容
            reset () {
                this.editRawValues = false;
                this.rawData = {
                    value: '', // 批量输入字符串
                    valueType: '', // 数据类型
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
            validateNum(arr) {
                let string = /^\d+(\.\d+)?$/; // 非负浮点数
                if (arr.length > 99) {
                    this.$toast(this.$t('swarm.max99items'), 'warn');
                    return false;
                } else if (!arr.every(e => { return e.length < 13 && string.test(e)})) {
                    this.$toast(this.$t('swarm.singleFormart') + this.$t('swarm.numberFormatLimit') + '12', 'warn');
                    return false;
                }
                return true;
            },
            /**
             * 输入框加载匹配的搜索结果列表
             * @param params 搜索数据
             */
            searchTarget(params,ite) {
                if (!String(params.value).trim().length) {
                    this.searchResultList = [];
                    return;
                }
                
                // 输入框有值时清空 校验提示
                if (ite.value) ite.isWarn = false ;

                ContactApiV1
                    .getCustomerByQuery(
                        params.fieldName,
                        String(params.value).trim()
                    )
                    .then(({ body: { data: { list } } }) => {
                        this.searchResultList = list;
                    })
                    .catch(() => {
                        this.searchResultList = [];
                    });
            },
            // 重置搜索列表
            selectResult(item) {
                this.searchResultList = [];
                if (item.value) {
                    item.isWarn = false;
                }
            },
           
        }
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../../../../../common/scss/base/_variables';
    @import '../../../../../../common/scss/base/_mixin';
    .scoring-condition{
        width: 90%;
        .condition {
          padding-bottom: 40px;
          border-bottom: 1px solid #ccc;
          margin-top: 20px;
            .scoring-box {
                display: flex;
                // 条件
                .classify {
                    width: 60%;
                    position: relative;
                    border-left: 1px transparent solid;
                    &.border-left {
                        border-left: 1px #cccccc solid;
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

                    &.border::before {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 21px;
                        height: 1px;
                        background-color: #cccccc;
                    }

                    &.border::after {
                        content: '';
                        position: absolute;
                        left: 0;
                        bottom: 0;
                        width: 21px;
                        height: 1px;
                        background-color: #cccccc;
                    }
                    .choose-box {
                          margin-left: 22px;
                          // height: var(--height);
                          .choose {
                            margin-bottom: 20px;
                            .selector-l {
                                width: 125px;
                            }
                            .quxiao-icon {
                                width: 20px;
                                height: 20px;
                                fill: $red;
                                cursor: pointer;
                                position: relative;
                                top: 7px;
                                margin-left: 10px;
                            }
                             .label-selector {
                                  width: 200px;

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
                                    max-width: 190px;
                                    overflow: auto;
                                    max-height: 125px;
                                }
                            }
                            @include clearfix();
                          }
                          .last-selector {
                              margin-bottom: 0;
                          }
                        .add-score {
                          position: absolute;
                          cursor: pointer;
                          width: 100px;
                          .add-icon {
                            width: 20px;
                            height: 20px;
                            fill: $theme;
                            position: absolute;
                            margin-top: 6px;
                          }
                          .theme-text {
                              position: relative;
                              left: 44px;
                          }
                        }
                        .not-complete {
                            color: #f67d7d;
                            font-size: 14px;
                        }
                    }
                }
                // 得分
                .score {
                    display: flex;
                    width: 30%;
                    margin-left: 25px;
                    align-items: center;
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
                // 预估人数
                .plan-num {
                    width: 10%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    input {
                        margin-right: 10px;
                        width: 70px;
                    }
                    .icon-yiwen1 {
                        display: inline-block;
                        margin-left: 10px;
                    }
                }
                .delete {
                    width: 10%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    .del-icon-btn {
                      svg {
                        width: 24px;
                        height: 24px;
                      }
                      &:not([disabled]) {
                          cursor: pointer;
                          .del-icon {
                              fill: $red;
                          }
                      }
                  }
                }
            }
        }  
    }
</style>

