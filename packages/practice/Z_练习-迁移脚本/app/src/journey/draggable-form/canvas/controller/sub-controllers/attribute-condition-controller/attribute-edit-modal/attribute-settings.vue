<template>
    <!-- 条件簇-单条件-属性选择器 -->
    <div class="attribute-settings">
        <template v-if="invalidAttr">
            <div class="invalid-text"> {{'controller.invalidAttribute' | t}} </div>
        </template>
        <template v-else>
            <!--行为事件次级选项-->
            <event-attr-selector :class="{disabled: !writable}" v-if="eventId" :noEC="noEC"
                :formSource="stripData.form_id !== null && stripData.form_id !== undefined" :disabled="!writable" v-model="stripData.field_id"
                :eventID="eventId" @select="eventAttrChange($event)" @noitem="noitem">
            </event-attr-selector>
            <!-- 来源表单类型限定 -->
            <template v-if="stripData.form_id !== null && stripData.form_id !== undefined">
                <!-- <cascading :key="'form'" :class="{'view-mode': !writable}" :placeholder="$t('swarm.selectFormField')" v-model="stripData.field_id"
                    :eventId="eventId" :journeyGroup="stripData.form_id" :form="true" :list="optionsData.formList" :showParentName="true"
                    :viewMode="!writable" @select="formChange($event)" @noitem="noitem"></cascading> -->
                <div class="form-source-box" :class="{'disabled': !writable}">
                    <!-- 表单选择列表 -->
                    <selector :class="{'lg': writable, 'disabled': !writable}" :options="optionsData.formList" v-model="stripData.form_id" :disabled="!writable"
                        :search="true" :showTitle="!writable" @select="handleFormSelect" @invalid="handleFormInvalid"></selector>
                    <!-- 表单属性 -->
                    <selector v-if="stripData.form_id" :class="{'lg': writable, 'disabled': !writable}" :options="formFieldList" v-model="stripData.field_id" :disabled="!writable"
                        :search="true" :showTitle="!writable" :loading="formFieldLoading" @select="formChange($event)"></selector>
                </div>
                <template v-if="stripData.form_id && stripData.field_id">
                    <selector :options="formSourceLabel" v-model="stripData.operation" :disabled="!writable" :class="{disabled: !writable}"
                        @select="relativeChange($event,true)"></selector>
                    <div class="inline-belong" v-if="stripData.operation!=='exists' && stripData.operation!=='missing'">
                        <!-- <selector class="lg" :class="{'label-selector':stripData.field_name === 'form_id','disabled': !writable}"
                            v-if="stripData.operation && stripData.operation!=='belong' && stripData.operation!=='nbelong'"
                            :options="searchResultList" :search="'async'" @search="getSubmitList($event,stripData)" :disabled="!writable"
                            @select="getSubmitList('',stripData)" @hide="getSubmitList('',stripData)" v-model="stripData.value"></selector>
                        <swarmMultiSelect class="countHide" :noSwarm="true" v-if="stripData.operation==='belong' || stripData.operation==='nbelong'"
                            :title="$t('swarm.submitRecords')" v-model="stripData.value" :search="'async'" @search="getSubmitList($event,stripData)"
                            :disabled="!writable" :options="searchResultList" :sourceForm="true" /> -->
                        <template v-if="stripData.operation && stripData.operation !== 'belong' && stripData.operation!=='nbelong'">
                            <searchable-input v-if="writable" :maxlength="100" :searchResultList="searchResultList" :target="stripData"
                                :emptySearch="true" :size="'md'" @search="getSubmitList($event.value)" @select="selectResult('reSearch')">
                            </searchable-input>
                            <span v-else>{{stripData.value || ''}}</span>
                        </template>
                        <template v-if="stripData.operation === 'belong' || stripData.operation==='nbelong'">
                            <query-filter-condition-value class="multi-form-source" :maxlength="300" :options="searchResultList" inputType="many"
                                valueType="text" :maxTag="99" v-model="stripData.value" @search="getSubmitList($event)"
                                @select="selectResult('default')" :disabled="!writable" />
                            <span v-if="writable" class="action-icon icon icon-pencil" @click="editByRawValue"></span>
                        </template>
                        <span v-if="writable &&stripData.operation && stripData.operation!=='exists' && stripData.operation!=='missing'"
                            class="icon icon-help margin-right" v-title:top="$t('swarm.submitRecordsTip')"></span>
                        <span class="icon icon-close" v-if="delAttrShow&&writable" @click.stop="$emit('delAttr')"></span>
                    </div>
                </template>
            </template>
            <!-- 非来源表单类型 -->
            <template v-else>
                <!--行为事件选择旅程或旅程任务-->
                <cascading v-if="stripData.field_name === 'journey_source'" :class="{'view-mode': !writable}" :key="'journey'" :type="'journey'"
                    v-model="stripData.journey_instantiation_id" :placeholder="$t('swarm.selectJourney')" :journey="true"
                    :journeyGroup="stripData.journey_group_id" :list="optionsData.journeyGroupData" :showParentName="true" :viewMode="!writable"
                    @select="journeyChange($event)" @noitem="noitem"></cascading>
                <task-selector v-if="stripData.field_name === 'task_source'" :class="{'view-mode': !writable}" :type="'journeyTask'"
                    v-model="stripData.task_instantiation_id" :journey="stripData.journey_instantiation_id" :journeyGroup="stripData.journey_group_id"
                    :list="optionsData.journeyGroupData" :viewMode="!writable" @select="taskChange($event)" @noitem="noitem"></task-selector>
                <!--行为事件选择事件总数-->
                <template v-if="stripData.field_name === 'event_count'">
                    <date-range v-if="writable" :start="stripData.event_data_start" :end="stripData.event_data_end" format="YYYY-MM-DD HH:mm:ss"
                        @change="rangeChange($event)" />
                    <span v-if="!writable">{{stripData.event_data_start}}&nbsp;~&nbsp;{{stripData.event_data_end}}</span>
                    <selector :options="doOrNot" v-model="stripData.relative_type" :disabled="!writable" :class="{disabled: !writable}"
                        @select="doOrNotHandler"></selector>
                    <selector v-if="stripData.relative_type === 0" :options="relativeList(201)" v-model="stripData.operation" :disabled="!writable"
                        :class="{disabled: !writable}" @select="relativeChange($event)"></selector>
                    <template v-if="stripData.limitSize === 2 && stripData.relative_type === 0">
                        <div class="times">
                            <input v-if="writable" v-model="stripData.value.start" class="input lg" type="text" maxlength="6">
                            <span v-if="!writable">{{stripData.value.start}}</span>
                            <span>{{'journey.times' | t}}</span>
                        </div>
                        <span>{{'data.to' | t}}</span>
                        <div class="times">
                            <input v-if="writable" v-model="stripData.value.end" class="input lg" type="text" maxlength="6"
                                @input="timesValid($event,stripData)">
                            <span v-if="!writable">{{stripData.value.end}}</span>
                            <span>{{'journey.times' | t}}</span>
                        </div>
                    </template>
                    <div class="times" v-if="stripData.limitSize===1 && stripData.relative_type === 0">
                        <input v-if="writable" v-model="stripData.value" class="input lg" type="text" maxlength="6"
                            @input="timesValid($event,stripData)">
                        <span v-if="!writable">{{stripData.value}}</span>
                        <span>{{'journey.times' | t}}</span>
                    </div>
                    <span v-if="writable" class="icon icon-help margin-right" v-title:top="$t('controller.onlyOneEventCount')"></span>
                </template>
                <template v-if="stripData.field_name === 'form_id'">
                    <!--关系选项-->
                    <selector :options="formLabel" :disabled="!writable" :class="{disabled: !writable}" v-model="stripData.operation"
                        @select="relativeChange($event)"></selector>
                    <!--表单列表-->
                    <selector class="lg" :class="{'label-selector':stripData.field_name === 'form_id','disabled': !writable}"
                        v-if="stripData.operation && stripData.operation!=='belong' && stripData.operation !=='nbelong'"
                        :options="optionsData.formList" :search="true" v-model="stripData.value" :disabled="!writable"></selector>
                    <swarmMultiSelect class="countHide" :search="true" :noSwarm="true" v-if="stripData.operation==='belong' || stripData.operation==='nbelong'"
                        :title="$t('sharing.form')" v-model="stripData.value" :options="optionsData.formList" :disabled="!writable" />
                </template>
                <!--联系人属性选择标签、行为事件选择标签 stripData.field_name === 'label_id' || stripData.field_name === 'label_ids'-->
                <!--企业微信及联系人标签、粉丝标签相关-->
                <template v-if="tagAndWecomFlag(stripData.field_name)">
                    <!--行为事件-标签新增/标签移除-->
                    <template v-if="isFanTagEvent && !fansListLoading">
                        <selector :options="optionsData.wechatList" v-model="stripData.appid" :disabled="!writable" :class="{disabled: !writable}"
                                  @select="wechatChange($event)"></selector>
                        <!--关系选项-->
                        <selector v-if="stripData.appid" :options="formLabel" v-model="stripData.operation" :disabled="!writable" :class="{disabled: !writable}"
                            @select="relativeChange($event)"></selector>
                        <!--标签列表-->
                        <selector class="lg" :class="{'label-style': !writable && isNike,'label-selector':stripData.field_name === 'label_id','disabled': !writable}"
                            v-if="stripData.operation && stripData.operation!=='belong' && stripData.operation !=='nbelong'"
                            :options="fansList" :search="true" v-model="stripData.value" :disabled="!writable"></selector>
                        <swarmMultiSelect class="countHide" :class="{'label-style': !writable && isNike}" :loadAll="!writable && isNike" :search="true" :noSwarm="true" v-if="stripData.operation==='belong' || stripData.operation==='nbelong'"
                            :title="mulitSelectTitle('event', stripData)" v-model="stripData.value" :disabled="!writable" :options="fansList" />
                    </template>
                    <!--联系人标签-->
                    <template v-else-if="stripData.field_name === 'label_id' || stripData.field_name === 'label_ids'">
                        <!--关系选项-->
                        <selector :options="formLabel" v-model="stripData.operation" :disabled="!writable" :class="{disabled: !writable}"
                            @select="relativeChange($event)"></selector>
                        <!--标签列表-->
                        <selector class="lg" ref="singleTab" :class="{'label-style': !writable && isNike,'label-selector':stripData.field_name === 'label_id','disabled': !writable}"
                            v-if="stripData.operation && stripData.operation!=='belong' && stripData.operation!=='nbelong'" @load="singleTabLoadMore" @hide="singleTabSearch('')"
                            :options="filterSingleTabList" :search="'async'" @search="singleTabSearch" :disabled="!writable" v-model="stripData.value" @select="singleTabSearch('')"></selector>
                        <swarmMultiSelect class="countHide" :class="{'label-style': !writable && isNike}" :loadAll="!writable && isNike" :search="true" :noSwarm="true"
                                          v-if="stripData.operation==='belong' || stripData.operation==='nbelong'" :title="mulitSelectTitle('attributes', stripData)"
                                          v-model="stripData.value" :disabled="!writable" :options="tagOrWecomList(stripData.field_name)" :maxlength="200"/>
                    </template>
                    <template v-else>
                        <!--关系选项-->
                        <selector :options="formLabel" v-model="stripData.operation" :disabled="!writable" :class="{disabled: !writable}"
                            @select="relativeChange($event)"></selector>
                        <!--标签列表-->
                        <selector class="lg" :class="{'label-style': !writable && isNike,'label-selector':stripData.field_name === 'label_id','disabled': !writable}"
                            v-if="stripData.operation && stripData.operation!=='belong' && stripData.operation!=='nbelong'"
                            :options="tagOrWecomList(stripData.field_name)" :search="true" :disabled="!writable" v-model="stripData.value"></selector>
                        <swarmMultiSelect class="countHide" :class="{'label-style': !writable && isNike}" :loadAll="!writable && isNike" :search="true" :noSwarm="true"
                                          v-if="stripData.operation==='belong' || stripData.operation==='nbelong'" :title="mulitSelectTitle('attributes', stripData)"
                                          v-model="stripData.value" :disabled="!writable" :options="tagOrWecomList(stripData.field_name)" :maxlength="200"/>
                    </template>
                </template>
            </template>
            <template v-if="otherAttributesFlag(stripData)">
                <!--关系选项-->
                <selector v-if="stripData.field_id !== '' && stripData.field_type !== 0" :options="relativeList()" v-model="stripData.operation"
                    :disabled="!writable" :class="{disabled: !writable}" @select="relativeChange($event)"></selector>
                <template v-if="stripData.operation !== 'belong' && stripData.operation!=='nbelong'">
                    <!--文本框-->
                    <template v-if="stripData.field_type === 1&&type === 'contact'">
                        <template v-if="writable">
                            <searchable-input v-if="stripData.limitSize ===1" :maxlength="100" :searchResultList="searchResultList"
                                :target="stripData" @search="searchTarget($event, 'contact')" @select="selectResult">
                            </searchable-input>
                        </template>
                        <template v-else>
                            <span v-if="stripData.limitSize !== 0">{{stripData.value || ''}}</span>
                        </template>
                    </template>
                    <!--文本框-->
                    <template v-if="stripData.field_type === 1 && type === 'event'">
                        <template v-if="stripData.limitSize ===1 && writable">
                            <input class="input lg"
                                   type="text"
                                   maxlength="5000"
                                   v-if="stripData.field_name === 'dmd_click_url'"
                                   v-model.trim="stripData.value">
                            <input class="input lg"
                                   type="text"
                                   maxlength="1024"
                                   v-else-if="stripData.field_name === 'sms_url'"
                                   v-model.trim="stripData.value">
                            <searchable-input v-else-if="eventSearchFlag(stripData.field_name)" :maxlength="100" :searchResultList="searchResultList"
                                              :target="stripData" @search="searchTarget($event, 'event')" @select="selectResult">
                            </searchable-input>
                            <!--联系人加企业微信群-入群方式/联系人企业群发-联系人-执行状态未发送 -> 以下拉形式展示 前端固定选项 -->
                            <selector :disabled="!writable" :class="{disabled: !writable}" v-model="stripData.value"
                                      v-else-if="stripData.field_name==='wecom_group_join_scene'||stripData.field_name==='wecom_send_status'"
                                      :options="stripData.field_name==='wecom_group_join_scene' ? optionsData.groupOfWay : optionsData.executionStatus">
                            </selector>
                            <input class="input lg"
                                   type="text"
                                   maxlength="100"
                                   v-else
                                   v-model.trim="stripData.value">
                        </template>
                        <span class="disabled-input" :title="stripData.value" v-if="stripData.limitSize ===1 && !writable">{{stripData.value}}</span>
                    </template>
                    <!--数字框-->
                    <template v-if="stripData.field_type === 2 || stripData.field_type === 6">
                        <template v-if="stripData.limitSize === 2">
                            <input class="input md" v-if="writable" v-model="stripData.value.start" type="text" maxlength="20">
                            <span v-if="!writable">{{stripData.value.start}}</span>
                            <span>{{'data.to' | t}}</span>
                            <input class="input md" v-if="writable" v-model="stripData.value.end" type="text" maxlength="20">
                            <span v-if="!writable">{{stripData.value.end}}</span>
                        </template>
                        <input v-if="stripData.limitSize===1&&writable" v-model="stripData.value" class="input md" type="text" maxlength="20">
                        <span v-if="stripData.limitSize===1&&!writable">{{stripData.value}}</span>
                    </template>
                </template>
                <!-- belong多选框  -->
                <template v-if="(stripData.operation === 'belong' || stripData.operation==='nbelong') && type !== 'event'">
                    <query-filter-condition-value :maxlength="12" :options="searchResultList" inputType="many" :ifRange="false" :ifReg="true"
                        v-if="(stripData.field_type === 2 || stripData.field_type === 6)" valueType="number" :maxTag="99" :disabled="!writable"
                        v-model="stripData.value" />
                    <query-filter-condition-value :maxlength="300" :options="searchResultList" inputType="many" v-if="stripData.field_type === 1"
                        valueType="text" :maxTag="99" v-model="stripData.value" @search="belongSearch($event)" @select="selectResult"
                        :disabled="!writable" />
                    <span v-if="writable" class="action-icon icon icon-pencil" @click="editByRawValue"></span>
                </template>
                <template v-if="(stripData.operation === 'belong' || stripData.operation==='nbelong') && type === 'event'">
                    <template v-if="stripData.field_type === 1">
                        <query-filter-condition-value :maxlength="5000" :options="searchResultList" inputType="many" :disabled="!writable"
                                                      v-if="stripData.field_name === 'dmd_click_url'" valueType="text" :maxTag="99"
                                                      v-model="stripData.value" />
                        <query-filter-condition-value :maxlength="1024" :options="searchResultList" inputType="many" :disabled="!writable"
                                                      v-else-if="stripData.field_name === 'sms_url'" valueType="text" :maxTag="99"
                                                      v-model="stripData.value" />
                        <query-filter-condition-value :maxlength="300" :options="searchResultList" inputType="many" :disabled="!writable"
                                                      v-else valueType="text" :maxTag="99"
                                                      v-model="stripData.value" />
                    </template>
                    <query-filter-condition-value :maxlength="12" :options="searchResultList" inputType="many" :ifRange="false" :ifReg="true"
                        v-if="(stripData.field_type === 2 || stripData.field_type === 6)" valueType="number" :maxTag="99" v-model="stripData.value"
                        :disabled="!writable" />
                    <span v-if="writable" class="action-icon icon icon-pencil" @click="editByRawValue"></span>
                </template>
                <!--&lt;!&ndash;数组框 标签&ndash;&gt;-->
                <!--<template v-if="stripData.field_type === 4 && (stripData.field_name==='label_ids'||stripData.field_name==='label_id')">-->
                    <!--<selector class="lg" v-if="stripData.limitSize===1" :disabled="!writable" :options="optionsData.tabList" :search="true"-->
                        <!--v-model="stripData.value" :class="{'label-selector':stripData.field_name === 'label_ids','disabled': !writable}">-->
                    <!--</selector>-->
                <!--</template>-->
                <!--时间框-->
                <template v-if="stripData.field_type === 3">
                    <calendar v-if="writable && stripData.limitSize===1&&stripData.operation!=='currentRelativeTime'" v-model="stripData.value" />
                    <span v-if="!writable &&stripData.limitSize===1&&stripData.operation!=='currentRelativeTime'">{{stripData.value}}</span>
                    <!--相对时间点的特殊处理框-->
                    <template v-if="stripData.operation === 'currentRelativeTime' && stripData.limitSize === 1">
                        <span>{{'swarm.relativeTime' | t}}</span>
                        <input class="input tiny" v-if="writable" v-model="stripData.value" type="text" maxlength="3">
                        <span v-if="!writable">{{stripData.value || ''}}</span>
                        <span>{{'time.day' | t}}</span>
                        <selector :disabled="!writable" :class="{disabled: !writable}" :options="relative" v-model="stripData.relative_type">
                        </selector>
                    </template>
                    <!--绝对时间-->
                    <template v-if="stripData.limitSize===2">
                        <span>{{'swarm.absoluteDateA' | t}}</span>
                        <calendar v-if="writable" v-model="stripData.value.start" :end="stripData.value.end" />
                        <span v-if="!writable">{{stripData.value.start}}</span>
                        <span>{{'swarm.absoluteDateB' | t}}</span>
                        <calendar v-if="writable" v-model="stripData.value.end" :start="stripData.value.start" />
                        <span v-if="!writable">{{stripData.value.end}}</span>
                        <span>{{'swarm.absoluteDateC' | t}}</span>
                    </template>
                </template>
            </template>
            <span class="icon icon-close" v-if="(stripData.form_id==null||stripData.form_id=== undefined)&&delAttrShow&&writable"
                @click.stop="$emit('delAttr')"></span>
            <template v-if="eventId&&writable">
                <p class="not-complete" v-if="isWarn">
                    <span class="icon icon-warn"></span>
                    <span> {{'swarm.curInvalid' | t}} </span>
                </p>
            </template>
            <!--数组弹窗-->
            <confirm v-if="editRawValues" :title="$t('analysis.batchInput')" :autoConfirm="false" @cancel="reset" @confirm="digestRawValues">
                <textarea class="textarea full-width" rows="20" autofocus="true" v-model="rawData.value" @input="rebase"></textarea>
                <span class="disabled-text">{{'analysis.note' | t}}</span>
                <span class="pull-right" :class="{'red-text':this.batchCount === 99}">{{batchCount}}/99</span>
            </confirm>
        </template>
    </div>
</template>
<script type="text/ecmascript-6">

import { mapState } from 'vuex';
import { ContactApi, ContactApiV1, QuestionnaireApiV1, WechatApiV1 } from '@/api';
import cloneDeep from 'lodash/cloneDeep';
import cascading from '../../../../../../../common/components/condition-bunch/cascading.vue';
import taskSelector from '../../../../../../../common/components/condition-bunch/taskSelector.vue';
import eventAttrSelector from '../../../../../../../common/components/condition-bunch/eventAttrSelector.vue';
import QueryFilterConditionValue from '../../../../../../../analysis/components/query-filter-condition-value.vue';
import swarmMultiSelect from '../../components/swarm-multi-select.vue';
import uniq from 'lodash/uniq';
import searchableInput from '../../../../../../../customer/swarm/searchable-input.vue';
import debounce from 'lodash/debounce';
import filterArrayByName from '@/common/utils/filterArrayByName';

export default {
    inject :['optimizeRelativeTime'], // 如果该功能全面开放，则需要删除相关页面的provide,swarm-modal，swarm-view-modal，decision-controller-form，attribute-condition-controller-form

    props: {
        attribute: Object,
        optionsData: Object,
        eventId: {
            type: Number,
            default: null,
            // requred: true
        },
        eventName: {
            type: String,
            default: ''
        },
        delAttrShow: {
            type: Boolean,
            default: false
        },
        writable: {
            type: Boolean,
            default: true
        },
        type: {
            type: String
        },
        isEventCount: {
            type: String,   //判断是否有‘事件总数’或‘不等于’，‘无值’
            default: ''
        },
        canempty: {
            type: Boolean,
            default: false
        }, //是否可以保存空条件簇（也可用来判断是否联系人分群）
    },
    computed: {
        ...mapState({
            // 是否是 nike 账号
            isNike: state => state.user.isNikeCount
        }),
        batchCount() {
            if (this.rawData.value) {
                let verifyArray = this.rawData.value.split('\n').map(line => String(line).trim())
                    .filter(line => line);
                return verifyArray.length;
            }
            return 0;
        },
        isFanTagEvent() {
            return (this.eventName === 'fans_label_add') || (this.eventName.indexOf('fans_label_remove') > -1);
        },
        // 动态加载用户标签单选下拉列表
        filterSingleTabList() {
            return this.singleTabList.slice(0, this.singleTabCount);
        },
    },
    watch: {
        stripData: {
            handler: function (val) {
                this.isWarn = false;
                this.$emit('select', val);

                // 用户标签等于、不等于单选下拉框，数据量过大时影响性能，此处滚动加载优化，回显选项放到首页
                let selectTab = this.optionsData.tabList.filter(item => item.id === this.stripData.value);
                if (['label_id', 'label_ids'].includes(this.stripData.field_name) && !['belong', 'nbelong'].includes(this.stripData.operation) && selectTab.length) {
                    this.singleTabList = [...new Set([selectTab[0], ...this.optionsData.tabList])];
                } else {
                    this.singleTabList = this.optionsData.tabList;
                }
            },
            deep: true
        },
        attribute: {
            handler: function (val) {
                this.stripData.act = val.act;
            },
            deep: true
        },
        isEventCount(val) {
            this.isEventCountHandler(val);
        }
    },
    data() {
        return {
            stripData: {},
            relationDic: {},    //关系选项，根据是否已选‘事件总数’进行变动
            noEC: false,    //是否隐藏‘事件总数’
            //前后关系
            relative: [
                { name: this.$t('swarm.within'), id: 0 },
                { name: this.$t('swarm.beyond'), id: 1 },
            ],
            //是否做过
            doOrNot: [
                { name: this.$t('userGroup.done'), id: 0 }
            ],
            editRawValues: false,   // 批量输入输入框
            rawData: {
                value: '', // 批量输入字符串
                valueType: '', // 数据类型
            },
            //行为事件-表单id及标签id关系
            formLabel: [
                { name: this.$t('analysis.equal'), id: 'eq', limitSize: 1 },
                { name: this.$t('analysis.unEqual'), id: 'ne', limitSize: 1 },
                { name: this.$t('analysis.belong'), id: 'belong', limitSize: 1 },
                { name: this.$t('swarm.notBelong'), id: 'nbelong', limitSize: 1}
            ],
            formSourceLabel: [
                { name: this.$t('analysis.equal'), id: 'eq', limitSize: 1 },
                // { name: this.$t('analysis.unEqual'), id: 'ne', limitSize: 1 },     //6271要求联系人分群中放开此运算符
                { name: this.$t('analysis.belong'), id: 'belong', limitSize: 1 },
                // { name: this.$t('swarm.notBelong'), id: 'nbelong', limitSize: 1 }, //6271临时增加
                { name: this.$t('analysis.value'), id: 'exists', limitSize: 1 },
                // { name: this.$t('analysis.none'), id: 'missing', limitSize: 1 }        //6271要求联系人分群中放开此运算符
            ],
            searchResultList: [], // 自动补全搜索结果
            isWarn: false, //是否报错
            invalidAttr: false, //是否失效属性
            formFieldLoading: false, // 表单属性加载
            formFieldList: [], // 表单属性列表
            fansList: [], //公众号列表
            fansListLoading: false,
            singleTabList: [],  // 用户标签单选列表（性能问题，单独创建数组）
            singleTabCount: 20, // 用户标签单选列表每页数量
        };
    },
    created() {

        // 如果是联系人分群的话，相对时间后面需要添加 在N天前的这一天／在N天后的这一天
        if (this.optimizeRelativeTime && this.type !== 'event') {
            this.relative = [
                { name: this.$t('swarm.within'), id: 0 },
                { name: this.$t('swarm.beyond'), id: 1 },
                { name: this.$t('swarm.dayBefore'), id: 2 },
                { name: this.$t('swarm.dayAfter'), id: 3 },
            ];
        }

        // 联系人分群的行为事件，字符串类型属性的关系符添加 不属于
        if (this.canempty) {
            this.formSourceLabel = [
                { name: this.$t('analysis.equal'), id: 'eq', limitSize: 1 },
                { name: this.$t('analysis.unEqual'), id: 'ne', limitSize: 1 },     //6271要求联系人分群中放开此运算符
                { name: this.$t('analysis.belong'), id: 'belong', limitSize: 1 },
                { name: this.$t('swarm.notBelong'), id: 'nbelong', limitSize: 1 }, //6271临时增加
                { name: this.$t('analysis.value'), id: 'exists', limitSize: 1 },
                { name: this.$t('analysis.none'), id: 'missing', limitSize: 1 }        //6271要求联系人分群中放开此运算符
            ];
        } else {
            this.formSourceLabel = [
                { name: this.$t('analysis.equal'), id: 'eq', limitSize: 1 },
                { name: this.$t('analysis.belong'), id: 'belong', limitSize: 1 },
                { name: this.$t('swarm.notBelong'), id: 'nbelong', limitSize: 1 },
                { name: this.$t('analysis.value'), id: 'exists', limitSize: 1 },
            ];
        }
        this.stripData = cloneDeep(this.attribute);
        this.relationDic = cloneDeep(this.optionsData.relationDictionary);
        this.isEventCountHandler(this.isEventCount);
        if (this.stripData.form_id && this.stripData.field) {
            this.getFormFieldList();
            this.getSubmitList('');
        }
        this.checkItem();
    },
    methods: {
        // 用户标签单选列表滚动加载
        singleTabLoadMore() {
            if (this.singleTabCount >= this.singleTabList.length) return;
            if (this.singleTabList.length > this.singleTabCount + 20) {
                this.singleTabCount += 20;
            } else {
                this.singleTabCount = this.singleTabList.length;
            }
        },
        // 用户标签单选列表搜索
        singleTabSearch(keyword) {
            let time = keyword ? 1 : 199;
            setTimeout(() => {
                this.$refs.singleTab.scrollTop();
                this.singleTabCount = 20;
            }, time);
            let searchTabArr = filterArrayByName(this.optionsData.tabList, keyword);
            if (this.stripData.value) {
                let selectTab = searchTabArr.filter(item => item.id === this.stripData.value);
                if (!selectTab.length) {
                    this.singleTabList = [
                        this.optionsData.tabList.filter(item => item.id === this.stripData.value)[0],
                        ...searchTabArr
                    ];
                } else this.singleTabList = [...new Set([selectTab[0], ...searchTabArr])];
            } else this.singleTabList = searchTabArr;
        },
        //检查数据有效性
        checkItem() {
            if (this.stripData.form_id) {
                let hasItem = this.formSourceLabel.some(item => (item.id === this.stripData.operation));
                if (!hasItem) {
                    this.noitem();
                    return;
                }
            } else if (this.stripData.field_name !== 'event_count' &&
                this.stripData.field_name !== 'journey_source' &&
                this.stripData.field_name !== 'task_source') {
                let fields = [
                    'wecom_staff_name', 'wecom_staff_mobile', 'wecom_staff_email',
                    'wecom_group_name', 'wecom_group_join_scene','wecom_send_status',
                    'label_id','label_ids'
                ];
                if (!this.isFanTagEvent && this.stripData.value &&
                    fields.includes(this.stripData.field_name) && this.stripData.limitSize === 1) {
                    let list = this.tagOrWecomList(this.stripData.field_name);
                    let hasItem = [];
                    if (Object.prototype.toString.call(this.stripData.value) === '[object Array]') {
                        //属于 不属于
                        hasItem = list.filter(item => (this.stripData.value.includes(item.id)));
                    } else {
                        //等于 不等于
                        hasItem = list.filter(item => (item.id === this.stripData.value));
                    }
                    if (hasItem.length === 0) {
                        this.$toast(this.$t('controller.invalidCondition'), 'warn');
                        if (this.writable) {
                            this.$emit('delAttr');
                        } else {
                            this.invalidAttr = true;
                        }
                        return;
                    }

                }
                if (this.stripData.operation && this.stripData.field_id !== '' && this.stripData.field_type !== 0) {
                    let relativeList = this.relativeList();
                    let hasItem = relativeList.filter(item => (item.id === this.stripData.operation));
                    if (hasItem.length === 0) {
                        this.$toast(this.$t('controller.invalidCondition'), 'warn');
                        if (this.writable) {
                            this.$emit('delAttr');
                        } else {
                            this.invalidAttr = true;
                        }
                        return;
                    }
                }
                if (this.isFanTagEvent && (this.stripData.field_name === 'label_id' || this.stripData.field_name === 'label_ids')) {
                    let hasItem = this.optionsData.wechatList.filter(e => e.id === this.stripData.appid)[0];
                    // 编辑状态、查看模式-任务控件的公众号id不在公众号列表里
                    if (!hasItem) {
                        this.noitem();
                        return;
                    }
                    this.wechatChange({id: this.stripData.appid},'init');
                }
            }
            if (this.stripData.field_name === 'event_count' && this.stripData.value) {
                let hasItem = this.optionsData.relationDictionary.doCondition
                    .filter(item => (item.id === this.stripData.operation));
                if (hasItem.length === 0) {
                    this.$nextTick(() => {
                        this.$toast(this.$t('controller.invalidCondition'), 'warn');
                        if (this.writable) {
                            this.$emit('delAttr');
                        } else {
                            this.invalidAttr = true;
                        }
                    });
                }
            }
        },
        noitem() {
            this.$toast(this.$t('controller.invalidCondition'), 'warn');
            if (this.writable) {
                this.$emit('delAttr');
            } else {
                // this.$toast(this.$t('controller.readonlyInvalid'), 'warn');
                this.invalidAttr = true;
            }
        },
        // 行为事件次级选项
        eventAttrChange(e) {
            if (e.fieldName === 'event_count') {
                this.stripData.event_data_start = '';
                this.stripData.event_data_end = '';
                this.stripData.operation = 'eq';
                this.stripData.limitSize = 1;
            } else {
                delete this.stripData.event_data_start;
                delete this.stripData.event_data_end;
                this.stripData.operation = '';
                this.stripData.limitSize = 0;
            }
            if (e.fieldName === 'journey_source' || e.fieldName === 'task_source') {
                this.stripData.journey_instantiation_id = null;
                this.stripData.journey_group_id = null;
                this.stripData.task_instantiation_id = null;
            } else {
                delete this.stripData.journey_instantiation_id;
                delete this.stripData.journey_group_id;
                delete this.stripData.task_instantiation_id;
            }
            this.stripData.relative_type = 0;
            this.stripData.value = '';
            if (e.fieldName === 'form_source') {
                this.$set(this.stripData, 'form_id', '');
                this.$set(this.stripData, 'field', '');
                this.stripData.field_id = '';
                this.stripData.field_name = '';
                this.stripData.field_type = '';
            } else {
                this.stripData.field_id = e.id;
                this.stripData.field_name = e.fieldName;
                this.stripData.field_type = e.fieldType;
                delete this.stripData.form_id;
                delete this.stripData.field;
            }
            this.searchResultList = [];
        },
        // 行为事件选择旅程
        journeyChange(e) {
            this.stripData.value = e.journeyInstantiationIds;
            this.stripData.journey_instantiation_id = e.id;
            this.stripData.journey_group_id = e.groupId;
            this.stripData.operation = 'belong';
        },
        // 行为事件选择任务
        taskChange(e) {
            this.stripData.value = e.taskIDS;
            this.stripData.journey_instantiation_id = e.selectJourneyID;
            this.stripData.journey_group_id = e.selectJourneyGroup;
            this.stripData.operation = 'belong';
        },
        // 事件总数选择时间
        rangeChange(e) {
            this.stripData.event_data_start = e.start;
            this.stripData.event_data_end = e.end;
            this.stripData.field_name = '';
            this.stripData.field_name = 'event_count';
        },
        // 选择关系
        relativeChange(e, get) {
            this.stripData.limitSize = e.limitSize;
            this.stripData.operation = e.id;
            if (e.id === 'exists') {
                this.stripData.value = '1';
            } else if (e.id === 'missing') {
                this.stripData.value = '0';
            } else if (e.limitSize === 1 || e.limitSize === 0) {
                this.stripData.value = (this.stripData.operation === 'belong' || this.stripData.operation === 'nbelong') ? [] : '';
            } else {
                this.stripData.value = {
                    start: '',
                    end: ''
                };
            }
            if (get && e.id !== 'exists' && e.id !== 'missing') this.getSubmitList('');
        },
        //关系列表
        relativeList(type) {
            // 联系人属性添加"属于"、"不属于"
            let arr = [
                {name: this.$t('analysis.equal'), id: 'eq', limitSize: 1, type: 6},
                {name: this.$t('analysis.unEqual'), id: 'ne', limitSize: 1, type: 6},
                {name: this.$t('analysis.belong'), id: 'belong', limitSize: 1, type: 6},
                {name: this.$t('swarm.notBelong'), id: 'nbelong', limitSize: 1, type: 6}
            ];
            switch (type ? type : this.stripData.field_type) {
                case 1:
                    return this.relationDic.stringDictionary;
                case 2:
                    return this.relationDic.numberDictionary;
                case 6:
                    return this.relationDic.numberDictionary;
                case 3:
                    return this.relationDic.dateDictionary;
                case 4:
                    // return this.relationDic.arrayDictionary;
                    return arr;
                case 201:
                    return this.relationDic.doCondition;
            }
        },
        //事件总数-是否做过
        doOrNotHandler() {
            this.stripData.operation = 'eq';
            this.stripData.value = '';
        },
        //事件总数-选择‘做过’选项时，禁止输入0
        timesValid(e, stripData) {
            if (e.target.value === '0') {
                if (stripData.limitSize === 2 && stripData.relative_type === 0) {
                    stripData.value.end = '';
                } else {
                    stripData.value = '';
                }
            }
        },
        // 展示批量输入
        editByRawValue() {
            this.rawData.valueType = this.stripData.field_type;
            this.rawData.value = this.stripData.value.join('\n');
            this.editRawValues = true;
        },
        digestRawValues() {
            let verifyArray = this.rawData.value.split('\n').map(line => String(line).trim())
                .filter(line => line);
            let valueType = this.rawData.valueType;
            switch (valueType) {
                // 文本
                case 1:
                    if (this.validateStr(verifyArray)) {
                        this.stripData.value = uniq(verifyArray);
                        this.reset();
                    }
                    break;
                // 小数
                case 2:
                    if (this.validateNum(verifyArray)) {
                        this.stripData.value = uniq(verifyArray);
                        this.reset();
                    }
                    break;
            }

        },
        // 重置批量输入弹窗内容
        reset() {
            this.editRawValues = false;
            this.rawData = {
                value: '', // 批量输入字符串
                valueType: '', // 数据类型
            };
        },
        // 限定批量弹窗的数据总数
        rebase() {
            if (this.batchCount > 99) {
                let verifyArray = this.rawData.value.split('\n')
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
        validateStr(arr) {
            if (arr.length > 99) {
                this.$toast(this.$t('swarm.max99items'), 'warn');
                return false;
            } else if (!arr.every(e => { return e.length < 301 }) && this.stripData.field_name !== 'dmd_click_url' && this.stripData.field_name !== 'sms_url') {
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
        getSubmitList(e) {
            if (!this.optionsData.formList.$getByKey(this.stripData.form_id)) return;
            let stripItem = this.stripData;
            let key = '';
            if (this.stripData.operation !== 'belong'  && this.stripData.operation !== 'nbelong') {
                key = e || this.stripData.value;
            } else {
                key = e;
            }
            QuestionnaireApiV1
                .getSubmitValue(stripItem.field, stripItem.form_id, key)
                .then(res => {
                    if (res.body.data.submitRecords) {
                        this.searchResultList = res.body.data.submitRecords;
                    } else {
                        this.searchResultList = [];
                    }
                });
        },
        handleFormSelect() {
            let stripItem = Object.assign({}, this.stripData);
            stripItem.field_name = '';
            stripItem.field = '';
            stripItem.field_id = '';
            stripItem.field_type = '';
            stripItem.operation = '';
            stripItem.value = '';
            this.getFormFieldList();
            this.stripData = cloneDeep(stripItem);
        },
        getFormFieldList() {
            this.formFieldLoading = true;
            ContactApi
                .getFormFields(this.eventId, this.stripData.form_id)
                .then (res => {
                    if (res.body.data && res.body.data.formFieldDto) {
                        this.formFieldList = res.body.data.formFieldDto.map(e => {
                            return {
                                id: e.id,
                                name: e.fieldCn,
                                fieldName: e.fieldName,
                                field: e.field,
                                fieldType: e.fieldType
                            };
                        });
                    } else {
                        this.formFieldList = [];
                    }
                    this.formFieldLoading = false;
                })
                .catch(() => {
                    this.formFieldList = [];
                    this.formFieldLoading = false;
                });
        },
        // 表单提交选择类型
        formChange(e) {
            let stripItem = this.stripData;
            stripItem.field_name = e.fieldName;
            stripItem.field = e.field;
            stripItem.field_type = e.fieldType;
            stripItem.operation = '';
            stripItem.value = '';
            this.stripData = cloneDeep(stripItem);
            this.searchResultList = [];
        },
        /**
             * 输入框加载匹配的搜索结果列表
             * @param params 搜索数据
             */
        searchTarget(params, type) {
            if (!String(params.value).trim().length) {
                this.searchResultList = [];
                return;
            }
            if (type === 'contact') {
                //联系人属性
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
            } else {
                //行为事件
                ContactApiV1
                    .getEventCustomerParamByQuery(params.fieldName, String(params.value).trim())
                    .then((res) => {
                        this.searchResultList = res.body.data.list;
                    })
                    .catch(() => {
                        this.searchResultList = [];
                    });
            }

        },
        /**
             * 重置pickList搜索结果列表
             * @param target 条件数据
             */
        selectResult(e) {
            if (e === 'default') {
                this.getSubmitList('');
            } else if (e === 'reSearch') {
                this.getSubmitList(this.stripData.value);
            } else {
                this.searchResultList = [];
            }
        },
        /**
             * 多选框加载匹配的搜索结果列表
             * @param value 搜索数据
             */
        belongSearch: debounce(function (value) {
            if (this.stripData.field_type === 1) {
                if (!String(value).trim().length) {
                    this.searchResultList = [];
                    return;
                }
                ContactApiV1
                    .getCustomerByQuery(this.stripData.field_name, String(value).trim())
                    .then(({ body: { data: { list } } }) => {
                        this.searchResultList = list;
                    })
                    .catch(() => {
                        this.searchResultList = [];
                    });
            }
        }, 500),
        //选择公众号
        wechatChange(e,init) {
            this.fansListLoading = true;
            WechatApiV1
                .getJourneyTagList('','',e.id)
                .then(({body: {data: {tagList}}})=>{
                    this.fansList = tagList;
                    if (!init) {
                        this.stripData.value = '';
                        this.stripData.operation = '';
                    }
                    if (init === 'init') {
                        if (this.stripData.operation === 'eq' || this.stripData.operation === 'ne') {
                            let item = tagList.filter(item => item.id === this.stripData.value)[0];
                            if (!item) this.$toast(this.$t('controller.invalidCondition'), 'warn');
                        } else {
                            let tags = this.stripData.value.map((value) => {
                                let hasTag = tagList.filter(item => item.id === value)[0];
                                if (hasTag) return hasTag;
                            });
                            if (tags.length < 1) this.$toast(this.$t('controller.invalidCondition'), 'warn');
                        }
                    }
                    this.fansListLoading = false;
                })
                .catch(() => {
                    this.fansListLoading = false;
                });
        },
        // 验证属性值
        validAttr() {
            // 非空验证
            if (this.stripData.field_name === 'event_count') {
                if (
                    this.stripData.event_data_start === '' ||
                    this.stripData.event_data_end === '' ||
                    (this.stripData.relative_type === 0 && this.stripData.value === '') ||
                    (this.stripData.relative_type === 0 && this.stripData.operation === 'range' && this.stripData.value.start === '') ||
                    (this.stripData.relative_type === 0 && this.stripData.operation === 'range' && this.stripData.value.end === '')
                ) {
                    this.$toast(this.$t('swarm.invalidRule'), 'warn');
                    this.isWarn = true;
                    return false;
                }
                if (this.stripData.limitSize === 2) {
                    if (Number(this.stripData.value.start) >= Number(this.stripData.value.end)) {
                        this.$toast(this.$t('swarm.rangeWrong'), 'warn');
                        this.isWarn = true;
                        return false;
                    }
                }
            } else if (this.stripData.field_name === 'journey_source' || this.stripData.field_name === 'task_source') {
                if (this.stripData.journey_instantiation_id === '' || this.stripData.journey_group_id === '' || this.stripData.value === '') {
                    this.$toast(this.$t('swarm.invalidRule'), 'warn');
                    this.isWarn = true;
                    return false;
                }
            } else {
                if (
                    this.stripData.field_id === '' ||
                    this.stripData.operation === '' ||
                    (this.stripData.value === '' && this.stripData.limitSize !== 0) ||
                    (this.stripData.value.start === '' && this.stripData.limitSize !== 0) ||
                    (this.stripData.value.end === '' && this.stripData.limitSize !== 0) ||
                    (this.stripData.value.length === 0 && this.stripData.limitSize !== 0)
                ) {
                    this.$toast(this.$t('swarm.invalidRule'), 'warn');
                    this.isWarn = true;
                    return false;
                }
            }
            // 文本类型验证
            if (this.stripData.field_type === 1) {
                if (this.stripData.operation === 'belong' || this.stripData.operation === 'nbelong') {
                    if (this.stripData.value.length === 0) {
                        return this.$toast(this.$t('swarm.infoNotComplete'), 'warn');
                    } else if (!this.validateStr(this.stripData.value)) {
                        this.isWarn = true;
                        return false;
                    }
                } else if (this.stripData.value.length > 100 && this.stripData.field_name !== 'dmd_click_url' && this.stripData.field_name !== 'sms_url') {
                    this.$toast(this.$t('swarm.max100Chars'), 'warn');
                    this.isWarn = true;
                    return false;
                }
            }
            // 数字类型验证
            if (this.stripData.field_type === 2 || this.stripData.field_type === 6) {
                if (this.stripData.field_name !== 'event_count' || this.stripData.relative_type !== 1) {
                    let string = /^\d+(\.\d+)?$/;
                    if (this.stripData.limitSize === 1) {
                        if (this.stripData.operation === 'belong' || this.stripData.operation === 'nbelong') {
                            if (this.stripData.value.length === 0) {
                                this.$toast(
                                    this.$t('swarm.infoNotComplete'),
                                    'warn'
                                );
                                this.isWarn = true;
                                return false;
                            } else if (this.stripData.field_name !== 'form_id' && this.stripData.field_name !== 'label_id') {
                                if (!this.validateNum(this.stripData.value)) {
                                    this.isWarn = true;
                                    return false;
                                }
                            }
                        } else if (
                            !string.test(this.stripData.value) ||
                            this.stripData.value.length > 20
                        ) {
                            this.$toast(this.$t('swarm.numberFormatErr'), 'warn');
                            this.isWarn = true;
                            return false;
                        }
                    }
                    if (this.stripData.limitSize === 2) {
                        if (
                            !string.test(this.stripData.value.start) ||
                            !string.test(this.stripData.value.end) ||
                            this.stripData.value.start.length > 20 ||
                            this.stripData.value.end.length > 20
                        ) {
                            this.$toast(this.$t('swarm.numberFormatErr'), 'warn');
                            this.isWarn = true;
                            return false;
                        }
                        if (Number(this.stripData.value.start) >= Number(this.stripData.value.end)) {
                            this.$toast(this.$t('swarm.rangeWrong'), 'warn');
                            this.isWarn = true;
                            return false;
                        }
                    }
                }
            }
            // 时间验证
            if (this.stripData.field_type === 3) {
                if (this.stripData.operation === 'currentRelativeTime' && this.stripData.limitSize === 1) {
                    if (this.stripData.value.length > 3) {
                        this.$toast(this.$t('swarm.max3Chars'), 'warn');
                        this.isWarn = true;
                        return false;
                    }
                    let detection = /^[1-9]\d*$/;
                    if (!detection.test(this.stripData.value)) {
                        this.$toast(this.$t('swarm.positiveInteger'), 'warn');
                        this.isWarn = true;
                        return false;
                    }
                }
            }
            // 数组类型验证
            if (this.stripData.field_type === 4) {
                if (this.stripData.value === '' || this.stripData.length === 0) {
                    this.$toast(this.$t('swarm.pickAGroup'), 'warn');
                    this.isWarn = true;
                    return false;
                }
            }
            if (
                this.stripData.field_type !== 1 &&
                this.stripData.field_type !== 2 &&
                this.stripData.field_type !== 3 &&
                this.stripData.field_type !== 4 &&
                this.stripData.field_type !== 6
            ) {
                this.isWarn = true;
                return false;
            }
            return true;
        },
        emptyAttr(e) {
            this.stripData = cloneDeep(e);
        },
        //判断是否有‘事件总数’或‘不等于’，‘无值’，并对相应选择框的列表内容进行变更
        isEventCountHandler(val) {
            if (val === 'event') {
                this.formLabel = [
                    { name: this.$t('analysis.equal'), id: 'eq', limitSize: 1 },
                    { name: this.$t('analysis.belong'), id: 'belong', limitSize: 1 }
                ];
                this.formSourceLabel = [
                    { name: this.$t('analysis.equal'), id: 'eq', limitSize: 1 },
                    { name: this.$t('analysis.belong'), id: 'belong', limitSize: 1 },
                    { name: this.$t('analysis.value'), id: 'exists', limitSize: 1 }
                ];
                let dic = {};
                for (let key in this.relationDic) {
                    dic[key] = [];
                    for (let i = 0; i < this.relationDic[key].length; i++) {
                        if (this.relationDic[key][i].id !== 'ne' && this.relationDic[key][i].id !== 'missing' && this.relationDic[key][i].id !== 'nin'
                            && this.relationDic[key][i].id !== 'nbelong') {
                            dic[key].push(this.relationDic[key][i]);
                        }
                    }
                }
                this.relationDic = dic;
                this.noEC = this.stripData.field_name !== 'event_count' ? true : false;
            } else {
                this.formLabel = [
                    { name: this.$t('analysis.equal'), id: 'eq', limitSize: 1 },
                    { name: this.$t('analysis.unEqual'), id: 'ne', limitSize: 1 },
                    { name: this.$t('analysis.belong'), id: 'belong', limitSize: 1 },
                    { name: this.$t('swarm.notBelong'), id: 'nbelong', limitSize: 1}
                ];
                if (this.canempty) {
                    this.formSourceLabel = [
                        { name: this.$t('analysis.equal'), id: 'eq', limitSize: 1 },
                        { name: this.$t('analysis.unEqual'), id: 'ne', limitSize: 1 },     //6271要求联系人分群中放开此运算符
                        { name: this.$t('analysis.belong'), id: 'belong', limitSize: 1 },
                        { name: this.$t('swarm.notBelong'), id: 'nbelong', limitSize: 1 }, //6271临时增加
                        { name: this.$t('analysis.value'), id: 'exists', limitSize: 1 },
                        { name: this.$t('analysis.none'), id: 'missing', limitSize: 1 }        //6271要求联系人分群中放开此运算符
                    ];
                } else {
                    this.formSourceLabel = [
                        { name: this.$t('analysis.equal'), id: 'eq', limitSize: 1 },
                        { name: this.$t('analysis.belong'), id: 'belong', limitSize: 1 },
                        { name: this.$t('swarm.notBelong'), id: 'nbelong', limitSize: 1 }, //6271临时增加
                        { name: this.$t('analysis.value'), id: 'exists', limitSize: 1 },
                    ];
                }
                this.relationDic = cloneDeep(this.optionsData.relationDictionary);
                this.noEC = val === 'operation' ? true : false;
            }
        },

        /**
         * @description 来源表单类型 - 选中表单失效的特殊处理
         */
        handleFormInvalid() {
            if (this.writable) {
                this.$toast(this.$t('controller.invalidCondition'), 'warn');
                this.$emit('delAttr');
            } else {
                this.invalidAttr = true;
            }
        },
        //标签+企业微信部分属性 页面显示类型
        tagAndWecomFlag(filedName) {
            return filedName === 'wecom_staff_name' || filedName === 'wecom_staff_mobile'
                || filedName === 'wecom_staff_email' || filedName === 'wecom_group_name'
                || filedName === 'wecom_group_join_scene' || filedName === 'wecom_send_status'
                || filedName === 'label_id' || filedName === 'label_ids';
        },
        //其他属性
        otherAttributesFlag(stripData) {
            return stripData.field_name !== 'event_count' &&
                stripData.field_name !== 'journey_source' &&
                stripData.field_name !== 'task_source' &&
                stripData.field_name !== 'form_id' &&
                stripData.field_name !== 'label_id' &&
                stripData.field_name !== 'label_ids' &&
                stripData.field_name !== 'wecom_staff_name' &&
                stripData.field_name !== 'wecom_staff_mobile' &&
                stripData.field_name !== 'wecom_staff_email' &&
                stripData.field_name !== 'wecom_group_name' &&
                stripData.field_name !== 'wecom_send_status' &&
                stripData.field_name !== 'wecom_group_join_scene' &&
                !stripData.form_id;
        },
        //根据类型返回标签列表还是企业微信相关list
        tagOrWecomList(filedName) {
            switch (filedName) {
                case 'wecom_staff_name':
                    return this.optionsData.wecomStaffNameList;
                case 'wecom_staff_mobile':
                    return this.optionsData.wecomStaffMobileList;
                case 'wecom_staff_email':
                    return this.optionsData.wecomStaffEmailList;
                case 'wecom_group_name':
                    return this.optionsData.wecomGroupNameList;
                case 'wecom_group_join_scene':
                    return this.optionsData.groupOfWay;
                case 'wecom_send_status':
                    return this.optionsData.executionStatus;
                case 'label_id':
                case 'label_ids':
                    return this.optionsData.tabList;
            }
        },
        //分群条件 行为事件 相关属性 是否显示模糊搜索
        eventSearchFlag(filedName) {
            return filedName === 'wecom_add_way' || filedName === 'wecom_channel_code' ||
                filedName === 'wecom_staff_id' || filedName === 'external_userid' ||
                filedName === 'journey_name' || filedName === 'mission_name' ||
                filedName === 'group_name' || filedName === 'wecom_group_id';
        },
        /**
         *标签选择/员工选择 title
         * type event：行为事件 attributes：联系人属性
         */
        mulitSelectTitle(type, stripData) {
            if (type === 'event') {
                this.isFanTagEvent ? this.$t('sharing.label') : this.$t('channelCode.staff');
            } else {
                switch (stripData.field_name) {
                    case 'label_id':
                    case 'label_ids':
                        return this.$t('sharing.label');
                    case 'wecom_staff_name':
                    case 'wecom_staff_mobile':
                    case 'wecom_staff_email':
                        return this.$t('channelCode.staff');
                }
            }
        }
    },
    components: {
        cascading,
        taskSelector,
        eventAttrSelector,
        QueryFilterConditionValue,
        swarmMultiSelect,
        searchableInput
    }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../../../../../common/scss/base/variables';
@import '../../../../../../../common/scss/base/mixin';
.attribute-settings {
    vertical-align: top;
    display: inline-block;
    padding-left: 15px;
    &.contact-attr {
        padding-left: 0;
    }
    &.event-attr {
        padding: 5px 0;
        display: block;
        border-bottom: 1px dashed #cccccc;
        &:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
    }
    .invalid-text {
        line-height: 32px;
        width: 100%;
        padding-left: 15px;
    }
    .icon-close {
        color: #f67d7d;
        margin-left: 5px;
    }
    .not-complete {
        color: #f67d7d;
        font-size: 14px;
    }
    .swarm-multi-select .visual-mode {
        &.disabled {
            background-color: unset;
        }
        .selected-option {
            width: auto;
            margin-bottom: 4px;
        }
    }
    .label-style {
        &.disabled {
            width: 750px;
        }
        .visual-mode {
            max-height: 250px;
            &.disabled {
                .selected-option {
                    max-width: 690px;
                }
            }
        }
        .select-text {
            max-width: 740px;
        }
    }
    .inline-belong {
        vertical-align: top;
        display: inline-block;
    }
    .form-source-box {
        display: inline-block;
        &.disabled {
            .selector {
                display: block;
                max-width: 600px;
                .select-text{
                    line-height: unset;
                    height: unset;
                }
            }
        }
    }
}
</style>
