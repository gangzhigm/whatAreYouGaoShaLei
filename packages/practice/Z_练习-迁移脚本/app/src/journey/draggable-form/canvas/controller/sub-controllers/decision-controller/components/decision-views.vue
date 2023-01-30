<template>
    <div class="selectBox otherCondition">
        <template v-if="isInvalid">
            <span>{{'controller.invalidEvent' | t}}</span>
        </template>
        <template v-else>
            <!--首选项-->
            <legacy-selector class="md"
                             ref="selector1"
                             :options="eventGroupList"
                             :placeholder="$t('controller.conditions')"
                             @select="eventGroupSelect($event)"
                             :disabled="true"/>
            <!--二级选项-->
            <selector v-if="eventList && stripData.echo.opt1"
                      ref="selector2"
                      :options="eventList"
                      v-model="stripData.echo.opt2"
                      @select="eventSelect($event)"
                      :disabled="true"></selector>
            <!--三级选项，某些条件有-->
            <selector v-if="othInteractiveList && stripData.echo.opt2"
                      ref="selector3"
                      :options="othInteractiveList"
                      v-model="stripData.echo.opt3"
                      @select="othInteractiveSelect($event)"
                      :disabled="true"></selector>
            <!--粉丝标签列表-->
            <template v-if="stripData.echo.opt1 === 'wechat' &&
                        stripData.echo.opt2 === 'subscription' &&
                        stripData.echo.opt3">
                <selector :options="optionsDatas.selectorOptions.operatorCommon.subscriptionEvent"
                          v-model="stripData.event" :disabled="true"></selector>
            </template>
            <template v-if="stripData.echo.opt2">
                <!--邮件互动及短信互动-->
                <selector v-if="stripData.echo.opt1 === 'email'"
                          :options="optionsDatas.taskList.email"
                          v-model="stripData.echo.opt3"
                          :disabled="true"></selector>
                <selector v-if="stripData.echo.opt1 === 'mobile'"
                          :options="optionsDatas.taskList.SMS"
                          v-model="stripData.echo.opt3"
                          :disabled="true"></selector>
                <!--邮件互动的邮件链接选择-->
                <template v-if="emailLinks.materialId">
                    <span class="view-span">
                        <span class="view-span-arr" v-for="link in emailLinks.list">{{link}}</span>
                    </span>
                </template>
                <!--粉丝属性选项相关-->
                <template v-if="stripData.echo.opt1 === 'fans_attribute'">
                    <selector v-if="stripData.echo.opt3 === 'fans_lable'"
                              :options="optionsDatas.tagList"
                              v-model="stripData.value"
                              :disabled="true"></selector>
                    <selector v-if="stripData.echo.opt3 === 'interaction_time'"
                              :options="optionsDatas.relationDictionary.dateDictionary"
                              v-model="stripData.operation"
                              :disabled="true"></selector>
                    <template v-if="stripData.echo.opt3 === 'interaction_time' && stripData.field_type === 3">
                        <!--相对时间点的特殊处理框-->
                        <template v-if="stripData.operation === 'currentRelativeTime'">
                            <span class="view-span">{{'swarm.relativeTime' | t}}</span>
                            <span class="view-span">{{stripData.value}}</span>
                            <span class="view-span">{{'time.day' | t}}</span>
                            <selector :options="relative" v-model="stripData.relative_type" :disabled="true"></selector>
                        </template>
                        <template v-if="stripData.operation === 'absoluteTime'">
                            <span class="view-span">{{'swarm.absoluteDateA' | t}}</span>
                            <span class="view-span">{{stripData.value.start}}</span>
                            <span class="view-span">{{'swarm.absoluteDateB' | t}}</span>
                            <span class="view-span">{{stripData.value.end}}</span>
                            <span class="view-span">{{'swarm.absoluteDateC' | t}}</span>
                        </template>
                    </template>
                </template>
                <!--用户分群列表-->
                <template v-if="stripData.echo.opt1 === 'audience_source' && stripData.echo.opt2 === 'contact_swarm'">
                <span class="view-span">
                    <span class="view-span-arr" v-for="item in swarmSelectedOptions">{{item.name}}</span>
                </span>
                </template>
            </template>
        </template>
    </div>
</template>
<script type="text/ecmascript-6">
    import cloneDeep from 'lodash/cloneDeep';
    import LegacySelector from './legacy-selector.vue';

    export default {
        props: {
            act: String,
            stripItem: Object,
            optionsData: Object
        },
        computed: {
            swarmSelectedOptions() {
                let ids = this.stripData.echo.opt3.slice();
                return this.optionsDatas.scrmSwarmList.filter(option => ids.includes(option.id));
            }
        },
        data() {
            return {
                optionsDatas: {},               //各个选项的数据列表
                stripData: {},                  //此条件的数据
                eventGroupList: [],             //互动事件数据列表
                eventList: [],                  //互动事件二级数据列表
                othInteractiveList: [],         //互动事件三级数据列表
                emailLinks: {                   //邮件链接
                    materialId: null,
                    list: []
                },
                scrmSwarmList: [],              //用户分群列表
                //前后关系
                relative: [
                    {name: this.$t('swarm.within'), id: 0},
                    {name: this.$t('swarm.beyond'), id: 1}
                ],
                emptyData: {                    //条件失效时，清空此条件
                    event_group: '',
                    event: '',
                    operation: 'eq',
                    value: '',
                    relative_type: 0,
                    echo: {
                        opt1: '',
                        opt2: '',
                        opt3: ''
                    }
                },
                isInvalid: false
            };
        },
        created() {
            this.optionsDatas = cloneDeep(this.optionsData);
            this.stripData = cloneDeep(this.stripItem);
            if (this.stripItem.echo.opt2 === 'dmd_click_the_link' || this.stripItem.echo.opt2 === 'not_dmd_click_the_link') {
                this.emailLinks.materialId = true;
                this.emailLinks.list = cloneDeep(this.stripItem.value);
            }
            this.loadData();
        },
        methods: {
            loadData() {
                //格式化互动事件数据列表
                this.eventGroupList = this.eventGroupList
                    .concat(
                        [{operatorCn: this.$t('controller.interactions'), isTitle: true, index: -1}],
                        this.optionsDatas.selectorOptions.filterOperator.interactEvent,
                        [{operatorCn: this.$t('controller.recipientAttr'), isTitle: true, index: -2}],
                        this.optionsDatas.selectorOptions.filterOperator.audienceAttribute,
                        [{operatorCn: this.$t('controller.otherConditions'), isTitle: true, index: -3}],
                        this.optionsDatas.selectorOptions.filterOperator.otherConditions
                    );

                this.getInteractiveList(this.eventGroupList);
                //格式化粉丝标签列表
                this.getInteractiveList(this.optionsDatas.selectorOptions.operatorCommon.subscriptionEvent);
                //格式化公众号列表
                this.optionsDatas.selectorOptions.authorizerInfoList.forEach(item => {
                    item.id = item.value;
                    item.name = item.operatorCn;
                });

                //回显数据及判断数据有效性
                let data = cloneDeep(this.stripData);
                let opt1Item = this.eventGroupList
                    .filter(item => (item.operator === data.echo.opt1));
                if (opt1Item && opt1Item.length) {
                    this.$nextTick(() => {
                        this.$refs.selector1.change(opt1Item[0]);
                        if (data.echo.opt2) {
                            let opt2Item = [];
                            if (data.echo.opt1 === 'fans_attribute' && data.echo.opt2 && data.appid) {
                                opt2Item = this.optionsDatas.selectorOptions.authorizerInfoList
                                    .filter(item => (item.value === data.appid));
                            } else {
                                opt2Item = opt1Item[0].child
                                    .filter(item => (item.operator === data.echo.opt2));
                            }
                            if (opt2Item && opt2Item.length) {
                                this.$nextTick(() => {
                                    this.$refs.selector2.change(opt2Item[0]);
                                    let opt3Item = [];
                                    if (data.echo.opt1 !== 'fans_attribute' && data.echo.opt3 && data.appid) {
                                        opt3Item = this.optionsDatas.selectorOptions.authorizerInfoList
                                            .filter(item => (item.value === data.appid));
                                        if (opt3Item.length === 0) {
                                            this.isInvalid = true;
                                            return;
                                        }
                                    } else if (data.echo.opt1 === 'fans_attribute') {
                                        for (let i = 0; i < this.eventGroupList.length; i++) {
                                            if (this.eventGroupList[i].id === 'fans_attribute') {
                                                opt3Item = this.eventGroupList[i].child
                                                    .filter(item => (item.operator === data.echo.opt3));
                                                if (opt3Item.length === 0) {
                                                    this.isInvalid = true;
                                                    return;
                                                }
                                            }
                                        }
                                    } else if (data.echo.opt3 && opt2Item[0].child) {
                                        opt3Item = opt2Item[0].child
                                            .filter(item => (item.operator === data.echo.opt3));
                                        if (opt3Item.length === 0) {
                                            this.isInvalid = true;
                                            return;
                                        }
                                    } else if (data.echo.opt1 === 'audience_source' && data.echo.opt2 === 'contact_swarm') {
                                        this.scrmSwarmList = data.echo.opt3;
                                    }
                                    if (opt3Item && opt3Item.length) {
                                        this.$nextTick(() => {
                                            this.$refs.selector3.change(opt3Item[0]);
                                            this.stripData = cloneDeep(data);
                                            this.checkItem();
                                            this.dateComponentLoad = true;
                                        });
                                    }
                                    this.stripData = cloneDeep(data);
                                    this.checkItem();
                                });
                            } else {
                                this.isInvalid = true;
                            }
                        }
                    });
                } else {
                    this.isInvalid = true;
                }
            },
            //判断数据有效性
            checkItem() {
                if (this.stripData.event &&
                    this.stripData.echo.opt1 === 'wechat' &&
                    this.stripData.echo.opt2 === 'subscription' &&
                    this.stripData.echo.opt3) {
                    let hasItem = this.optionsDatas.selectorOptions.operatorCommon.subscriptionEvent
                        .filter(item => (item.id === this.stripData.event));
                    if (hasItem.length === 0) {
                        this.isInvalid = true;
                        return;
                    }
                }
                if (this.stripData.echo.opt2) {
                    if (this.stripData.echo.opt3 && this.stripData.echo.opt1 === 'email') {
                        let hasItem = this.optionsDatas.taskList.email
                            .filter(item => (item.id === this.stripData.echo.opt3));
                        if (hasItem.length === 0) {
                            this.isInvalid = true;
                            return;
                        }
                    }
                    if (this.stripData.echo.opt3 && this.stripData.echo.opt1 === 'mobile') {
                        let hasItem = this.optionsDatas.taskList.SMS
                            .filter(item => (item.id === this.stripData.echo.opt3));
                        if (hasItem.length === 0) {
                            this.isInvalid = true;
                            return;
                        }
                    }
                    if (this.stripData.echo.opt1 === 'fans_attribute') {
                        if (this.stripData.value && this.stripData.echo.opt3 === 'fans_lable') {
                            let hasItem = this.optionsDatas.tagList
                                .filter(item => (item.id === this.stripData.value));
                            if (hasItem.length === 0) {
                                this.isInvalid = true;
                                return;
                            }
                        }
                        if (this.stripData.operation && this.stripData.echo.opt3 === 'interaction_time') {
                            let hasItem = this.optionsDatas.relationDictionary.dateDictionary
                                .filter(item => (item.id === this.stripData.operation));
                            if (hasItem.length === 0) {
                                this.isInvalid = true;
                                return;
                            }
                        }
                    }
                    if (this.stripData.echo.opt1 === 'participation_log') {
                        let hasItem = this.optionsDatas.taskTempList
                            .filter(item => (item.id === this.stripData.echo.opt3));
                        if (hasItem.length === 0) {
                            this.isInvalid = true;
                            return;
                        }
                    }
                }
                if (this.stripData.echo.opt3.length !== 0 &&
                    this.stripData.echo.opt1 === 'audience_source' &&
                    this.stripData.echo.opt2 === 'contact_swarm') {
                    for (let i = 0; i < this.stripData.echo.opt3.length; i++) {
                        let hasItem = this.optionsDatas.scrmSwarmList
                            .filter(item => (item.id === this.stripData.echo.opt3[i]));
                        if (hasItem.length === 0) {
                            this.isInvalid = true;
                            return;
                        }
                    }
                }
            },
            //互动事件列表动态加载
            getInteractiveList(group) {
                if (group && group.length) {
                    group.forEach(item => {
                        if (item.child && item.child.length) {
                            this.getInteractiveList(item.child);
                        }
                        item.id = item.operator;
                        item.name = item.operatorCn;
                    });
                }
            },
            //选择首选项
            eventGroupSelect(e) {
                this.stripData = {
                    act: this.act,
                    event_group: e.id,
                    event: '',
                    value: '',
                    operation: 'eq',
                    relative_type: 0,
                    echo: {
                        opt1: e.id,
                        opt2: '',
                        opt3: ''
                    }
                };
                this.scrmSwarmList = [];
                this.othInteractiveList = null;
                if (e.id === 'fans_attribute') {
                    this.eventList = this.optionsDatas.selectorOptions.authorizerInfoList;
                } else if (e.child && e.child.length) {
                    this.eventList = e.child;
                } else {
                    this.eventList = [];
                }
            },
            //选择二级事件
            eventSelect(e) {
                this.stripData.event = e.id;
                this.stripData.echo.opt3 = '';
                this.stripData.value = '';
                if (e.child && e.child.length) {
                    this.othInteractiveList = e.child;
                } else {
                    if (this.stripData.echo.opt1 === 'wechat') {
                        this.stripData.appid = '';
                        this.stripData.event = '';
                        this.othInteractiveList = this.optionsDatas.selectorOptions.authorizerInfoList;
                    }
                    if (this.stripData.echo.opt1 === 'email' || this.stripData.echo.opt1 === 'mobile') {
                        this.stripData.task_id = '';
                        this.othInteractiveList = null;
                    }
                    if (this.stripData.echo.opt1 === 'participation_log') {
                        this.othInteractiveList = this.optionsDatas.taskTempList;
                    }
                    if (this.stripData.echo.opt1 === 'audience_source') {
                        if (e.id === 'contact_swarm') {
                            delete this.stripData.appid;
                            this.scrmSwarmList = [];
                            this.othInteractiveList = null;
                        }
                        if (e.id === 'subscription') {
                            this.stripData.appid = '';
                            this.scrmSwarmList = [];
                            this.othInteractiveList = this.optionsDatas.selectorOptions.authorizerInfoList;
                        }
                    }
                    if (this.stripData.echo.opt1 === 'fans_attribute') {
                        for (let i = 0; i < this.eventGroupList.length; i++) {
                            if (this.eventGroupList[i].id === 'fans_attribute') {
                                this.othInteractiveList = this.eventGroupList[i].child;
                            }
                        }
                        this.stripData.appid = e.value;
                        this.stripData.field_id = '';
                        this.stripData.field_name = '';
                        this.stripData.field_type = '';
                    }
                }
            },
            //选择三级事件
            othInteractiveSelect(e) {
                this.stripData.echo.opt3 = e.id;
                if (this.stripData.echo.opt1 === 'wechat') {
                    this.stripData.event = '';
                    this.stripData.appid = e.value;
                    this.stripData.value = e.value;
                }
                if (this.stripData.echo.opt1 === 'participation_log') {
                    this.stripData.value = e.id;
                }
                if (this.stripData.echo.opt1 === 'audience_source') {
                    if (this.stripData.echo.opt2 === 'subscription') {
                        this.stripData.appid = e.value;
                        this.stripData.value = e.value;
                    }
                }
                if (this.stripData.echo.opt1 === 'fans_attribute') {
                    this.stripData.value = '';
                    this.stripData.field_id = e.id;
                    this.stripData.field_name = e.name;
                    if (e.id === 'fans_lable') {
                        this.stripData.field_type = 2;
                    } else {
                        this.stripData.field_type = 3;
                        this.stripData.operation = '';
                    }
                }
            }
        },
        components: {LegacySelector}
    };
</script>
