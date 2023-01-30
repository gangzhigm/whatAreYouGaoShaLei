<template>
    <div class="selectBox flex">
        <template v-if="isInvalid">
            <span>{{'controller.invalidEvent' | t}}</span>
        </template>
        <template v-else>
            <!--首选项，2种类型（联系人，行为事件）-->
            <template>
                <cascading :disabled="true" v-if="type === 'contact'" :placeholder="$t('swarm.contactAttribute')"
                           v-model="stripData.field_id" :list="optionsData.customerFieldList" @noitem="noitem()"></cascading>
                <cascading :disabled="true" v-if="type === 'event'" :placeholder="$t('swarm.eventAttribute')"
                           v-model="stripData.event_id" :list="optionsData.eventFieldList" @noitem="noitem()"></cascading>
            </template>
            <template v-if="stripData.event_id && stripData.event_id !== ''">
                <!--行为事件次级选项-->
                <event-attr-selector :disabled="true" v-model="stripData.field_id" :eventID="stripData.event_id"
                                     :formSource="stripData.form_id !== null && stripData.form_id !== undefined" @noitem="noitem"></event-attr-selector>
                <!--行为事件选择旅程或旅程任务-->
                <cascading :disabled="true" v-if="stripData.field_name === 'journey_source'" :key="'journey'"
                           :placeholder="$t('swarm.selectJourney')" :journey="true" :journeyGroup="stripData.journey_group_id"
                           :list="optionsData.journeyGroupData" v-model="stripData.journey_instantiation_id" @noitem="noitem()"></cascading>
                           <!-- 来源表单类型限定 -->
                <template  v-if="stripData.form_id !== null && stripData.form_id !== undefined">
                    <cascading :key="'form'" :placeholder="$t('swarm.selectFormField')" :eventId="stripData.event_id"
                               :journeyGroup="stripData.form_id" :form="true" :list="optionsData.formList" v-model="stripData.field_id"
                               @noitem="noitem" :disabled="true"></cascading>
                    <template v-if="stripData.form_id && stripData.field_id">
                        <!--关系选项-->
                        <selector :options="formSourceLabel" v-model="stripData.operation" :disabled="true"></selector>
                        <!--表单提交记录-->
                        <template v-if="stripData.operation!=='exists' && stripData.operation!=='missing'">
                            <selector class="lg" v-if="stripData.operation && stripData.operation!=='belong'"
                                      :options="stripData.searchResultList"
                                      :search="'async'"
                                      :disabled="true"
                                      v-model="stripData.value"
                                      :class="{'label-selector':stripData.field_name === 'form_id'}"></selector>
                            <template v-if="stripData.operation==='belong'">
                                <div class="view-box">
                                    <span class="view-span-arr" :title="item.name" :key="item.id" v-for="item in formSourceSelectedOptions">{{item.name}}</span>
                                </div>
                            </template>
                        </template>
                    </template>
                    <!-- <span class="icon icon-help margin-right" v-title:top="$t('swarm.submitRecordsTip')"></span> -->
                </template>
                <!-- 非表单来源类型 -->
                <template v-else>
                    <task-selector :disabled="true" v-if="stripData.field_name === 'task_source'" v-model="stripData.task_instantiation_id"
                                   :journey="stripData.journey_instantiation_id" :journeyGroup="stripData.journey_group_id"
                                   :list="optionsData.journeyGroupData" @noitem="noitem()"></task-selector>
                    <!--行为事件选择事件总数-->
                    <template v-if="stripData.field_name === 'event_count'">
                        <span class="view-span">{{stripData.event_data_start}}</span>
                        <span class="view-span">~</span>
                        <span class="view-span">{{stripData.event_data_end}}</span>
                        <selector :disabled="true" :options="doOrNot" v-model="stripData.relative_type"></selector>
                        <selector :disabled="true" v-if="stripData.relative_type === 0" :options="relativeList(201)" v-model="stripData.operation"></selector>
                        <template v-if="stripData.limitSize === 2 && stripData.relative_type === 0">
                            <span class="view-span">{{stripData.value.start}}</span>
                            <span class="view-span">~</span>
                            <span class="view-span">{{stripData.value.end}}</span>
                        </template>
                        <span class="view-span" :title="stripData.value" v-if="stripData.limitSize===1 && stripData.relative_type === 0">{{stripData.value}}</span>
                    </template>
                    <template v-if="stripData.field_name === 'form_id'">
                        <!--关系选项-->
                        <selector :disabled="true" :options="formLabel" v-model="stripData.operation"></selector>
                        <!--表单列表-->
                        <selector :disabled="true" class="lg" v-if="stripData.operation && stripData.operation!=='belong'"
                                  :options="optionsData.formList"
                                  v-model="stripData.value"
                                  :class="{'label-selector':stripData.field_name === 'form_id'}"></selector>
                        <template v-if="stripData.operation==='belong'">
                            <div class="view-box">
                                <span class="view-span-arr" :title="item.name" v-for="item in formSelectedOptions">{{item.name}}</span>
                            </div>
                        </template>
                    </template>
                    <template v-if="stripData.field_name === 'label_id'">
                        <template v-if="stripData.event === 'fans_label_add'">
                            <!--关系选项-->
                            <selector :disabled="true" :options="formLabel" v-model="stripData.operation"></selector>
                            <!--标签列表-->
                            <selector :disabled="true" class="lg" v-if="stripData.operation && stripData.operation!=='belong'"
                                      :options="optionsData.fansList"
                                      v-model="stripData.value"
                                      :class="{'label-selector':stripData.field_name === 'label_id'}"></selector>
                            <template v-if="stripData.operation==='belong'">
                            <div class="view-box">
                                <span class="view-span-arr" :title="item.name" v-for="item in fansSelectedOptions">{{item.name}}</span>
                            </div>
                            </template>
                        </template>
                        <template v-else>
                            <!--关系选项-->
                            <selector :disabled="true" :options="formLabel" v-model="stripData.operation"></selector>
                            <!--标签列表-->
                            <selector :disabled="true" class="lg" v-if="stripData.operation && stripData.operation!=='belong'"
                                      :options="optionsData.tabList"
                                      v-model="stripData.value"
                                      :class="{'label-selector':stripData.field_name === 'label_id'}"></selector>
                            <template v-if="stripData.operation==='belong'">
                                <div class="view-box">
                                    <span class="view-span-arr" :title="item.name" v-for="item in labelSelectedOptions">{{item.name}}</span>
                                </div>
                            </template>
                        </template>
                    </template>
                </template>
            </template>
            <template v-if="stripData.field_name !== 'event_count' &&
                        stripData.field_name !== 'journey_source' &&
                        stripData.field_name !== 'task_source' &&
                        stripData.field_name !== 'form_id' &&
                        stripData.field_name !== 'label_id' &&
                        !stripData.form_id">
                <!--关系选项-->
                <selector :disabled="true" v-if="stripData.field_id !== '' && stripData.field_type !== 0"
                          :options="relativeList()" v-model="stripData.operation"></selector>
                <template v-if="stripData.operation !== 'belong'">
                    <!--文本框-->
                    <template v-if="stripData.field_type === 1">
                        <span class="view-span" :title="stripData.value" v-if="stripData.limitSize ===1">{{stripData.value}}</span>
                    </template>
                    <!--数字框-->
                    <template v-if="stripData.field_type === 2 || stripData.field_type === 6">
                        <template v-if="stripData.limitSize === 2">
                            <span class="view-span">{{stripData.value.start}}</span>
                            <span class="view-span">~</span>
                            <span class="view-span">{{stripData.value.end}}</span>
                        </template>
                        <span class="view-span" :title="stripData.value" v-if="stripData.limitSize===1">{{stripData.value}}</span>
                    </template>
                </template>
                <!-- 新增多选框  -->
                <template v-if="stripData.operation === 'belong'">
                <div class="view-box">
                    <span class="view-span-arr" :title="item" v-for="item in stripData.value">{{item}}</span>
                </div>
                </template>
                <!--数组框-->
                <template v-if="stripData.field_type === 4">
                    <selector :disabled="true" class="lg" v-if="stripData.limitSize===1"
                              :options="optionsData.tabList" :search="true" v-model="stripData.value"
                              :class="{'label-selector':stripData.field_name === 'label_ids'}">
                    </selector>
                </template>
                <!--时间框-->
                <template v-if="stripData.field_type === 3">
                    <span class="view-span" :title="stripData.value" v-if="stripData.limitSize===1&&stripData.operation!=='currentRelativeTime'">{{stripData.value}}</span>
                    <!--相对时间点的特殊处理框-->
                    <template v-if="stripData.operation === 'currentRelativeTime' && stripData.limitSize === 1">
                        <span class="view-span">{{'swarm.relativeTime' | t}}</span>
                        <span class="view-span" :title="stripData.value">{{stripData.value}}</span>
                        <span class="view-span">{{'time.day' | t}}</span>
                        <selector :disabled="true" :options="relative" v-model="stripData.relative_type"></selector>
                    </template>
                    <template v-if="stripData.limitSize===2">
                        <span class="view-span">{{'swarm.absoluteDateA' | t}}</span>
                        <span class="view-span">{{stripData.value.start}}</span>
                        <span class="view-span">{{'swarm.absoluteDateB' | t}}</span>
                        <span class="view-span">{{stripData.value.end}}</span>
                        <span class="view-span">{{'swarm.absoluteDateC' | t}}</span>
                    </template>
                </template>
            </template>
        </template>
    </div>
</template>
<script type="text/ecmascript-6">
    import cloneDeep from 'lodash/cloneDeep';
    import cascading from '../../../../../../../common/components/condition-bunch/cascading.vue';
    import taskSelector from '../../../../../../../common/components/condition-bunch/taskSelector.vue';
    import eventAttrSelector from '../../../../../../../common/components/condition-bunch/eventAttrSelector.vue';
    import { QuestionnaireApiV1 } from '@/api';

    export default {
        props: {
            stripItem: Object,
            type: String,
            optionsData: Object
        },
        data() {
            return {
                stripData: {},
                //前后关系
                relative: [
                    {name: this.$t('swarm.within'), id: 0},
                    {name: this.$t('swarm.beyond'), id: 1}
                ],
                //是否做过
                doOrNot: [
                    {name: this.$t('userGroup.done'), id: 0},
                    {name: this.$t('userGroup.noDone'), id: 1}
                ],
                //行为事件-表单id及标签id关系
                formLabel: [
                    {name: this.$t('analysis.equal'), id: 'eq',limitSize: 1},
                    {name: this.$t('analysis.unEqual'), id: 'ne',limitSize: 1},
                    {name: this.$t('analysis.belong'), id: 'belong',limitSize: 1}
                ],
                isInvalid: false,
                formSourceLabel: [
                    {name: this.$t('analysis.equal'), id: 'eq',limitSize: 1},
                    {name: this.$t('analysis.unEqual'), id: 'ne',limitSize: 1},     //6271要求放开此运算符
                    {name: this.$t('analysis.belong'), id: 'belong',limitSize: 1},
                    {name: this.$t('analysis.value'), id: 'exists',limitSize: 1},
                    {name: this.$t('analysis.none'), id: 'missing',limitSize: 1}        //6271要求放开此运算符
                ],
            };
        },
        created() {
            this.stripData = cloneDeep(this.stripItem);
            if (!this.stripData.searchResultList) this.stripData.searchResultList = [];
            if (this.stripData.form_id) {
                this.getSubmitList('');
            }
            this.checkItem();
        },
        computed: {
            formSelectedOptions() {
                if (this.stripData.operation === 'belong') {
                    let ids = this.stripData.value.slice();
                    return this.optionsData.formList.filter(option => ids.includes(option.id));
                }
            },
            labelSelectedOptions() {
                if (this.stripData.operation === 'belong') {
                    let ids = this.stripData.value.slice();
                    return this.optionsData.tabList.filter(option => ids.includes(option.id));
                }
            },
            fansSelectedOptions() {
                if (this.stripData.operation === 'belong') {
                    let ids = this.stripData.value.slice();
                    return this.optionsData.fansList.filter(option => ids.includes(option.id));
                }
            },
            formSourceSelectedOptions() {
                if (this.stripData.operation === 'belong') {
                    let ids = this.stripData.value.slice();
                    return this.stripData.searchResultList.filter(option => ids.includes(option.id));
                }
            }
        },
        methods: {
            //检查数据有效性
            checkItem() {
                if (this.stripData.hasOwnProperty('form_id')) {
                    let hasItem = this.formSourceLabel.filter(item => (item.id === this.stripData.operation));
                    if (hasItem.length === 0) {
                        this.isInvalid = true;
                        return;
                    }
                } else if (this.stripData.field_name !== 'event_count' &&
                    this.stripData.field_name !== 'journey_source' &&
                    this.stripData.field_name !== 'task_source') {
                    if (this.stripData.value && this.stripData.field_type === 4 && this.stripData.limitSize === 1) {
                        let hasItem = this.optionsData.tabList.filter(item => (item.id === this.stripData.value));
                        if (hasItem.length === 0) {
                            this.isInvalid = true;
                            return;
                        }
                    }
                    if (this.stripData.operation && this.stripData.field_id !== '' && this.stripData.field_type !== 0) {
                        let relativeList = this.relativeList();
                        let hasItem = relativeList.filter(item => (item.id === this.stripData.operation));
                        if (hasItem.length === 0) {
                            this.isInvalid = true;
                            return;
                        }
                    }
                }
                if (this.stripData.field_name === 'event_count' && this.stripData.value) {
                    let hasItem = this.optionsData.relationDictionary.doCondition
                        .filter(item => (item.id === this.stripData.operation));
                    if (hasItem.length === 0) {
                        this.isInvalid = true;
                    }
                }
            },
            noitem() {
                this.isInvalid = true;
            },
            //关系列表
            relativeList(type) {
                switch (type ? type : this.stripData.field_type) {
                    case 1:
                        return this.optionsData.relationDictionary.stringDictionary;
                    case 2:
                        return this.optionsData.relationDictionary.numberDictionary;
                    case 6:
                        return this.optionsData.relationDictionary.numberDictionary;
                    case 3:
                        return this.optionsData.relationDictionary.dateDictionary;
                    case 4:
                        return this.optionsData.relationDictionary.arrayDictionary;
                    case 201:
                        return this.optionsData.relationDictionary.doCondition;
                }
            },
            getSubmitList(e) {
                let records = [];
                let stripItem = this.stripData;
                QuestionnaireApiV1
                    .getSubmitValue(stripItem.field, stripItem.form_id, e)
                    .then(res => {
                        if (res.body.data.submitRecords && res.body.data.submitRecords.length > 0) {
                            res.body.data.submitRecords.forEach(e => {
                                if (e) {
                                    records.push({
                                        id: e,
                                        name: e
                                    });
                                }
                            });
                        }
                        if (stripItem.value && !e) {
                            if (typeof stripItem.value === 'string') {
                                let ext = records.filter(e => {
                                    return e.id === stripItem.value;
                                });
                                if (ext.length === 0) {
                                    let selected = {
                                        id: stripItem.value,
                                        name: stripItem.value
                                    };
                                    records = [selected, ...records];
                                }
                            } else {
                                let ext = records.filter(e => {
                                    return stripItem.value.includes(e.id);
                                });
                                if (ext.length === 0) {
                                    let array = [];
                                    stripItem.value.forEach(e => {
                                        array.push({
                                            id: e,
                                            name: e
                                        });
                                    });
                                    records = [...array, ...records];
                                }
                            }
                        }
                        this.$set(stripItem, 'searchResultList', records);
                        this.stripData = cloneDeep(stripItem);
                    });
            },
        },
        components: {cascading,taskSelector,eventAttrSelector}
    };
</script>
