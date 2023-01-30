<template>
    <div class="selectBox otherCondition" :class="{'colored':num%2===0,'disabled': !writable}">
        <template v-if="isInvalid">
            <span>{{'controller.invalidEvent' | t}}</span>
        </template>
        <template v-else>
            <!--首选项-->
            <legacy-selector class="md"
                         :class="{disabled: !writable}"
                         ref="selector1"
                         :options="eventGroupList"
                         :placeholder="$t('controller.conditions')"
                         :disabled="!writable"
                         @select="eventGroupSelect($event)"/>
            <!--二级选项-->
            <selector v-if="eventList && stripData.echo.opt1"
                  ref="selector2"
                  :options="eventList"
                  :disabled="!writable"
                  v-model="stripData.echo.opt2"
                  @select="eventSelect($event)"></selector>
            <!--三级选项，某些条件有-->
            <selector v-if="othInteractiveList && stripData.echo.opt2"
                  ref="selector3"
                  :options="othInteractiveList"
                  :disabled="!writable"
                  v-model="stripData.echo.opt3"
                  @select="othInteractiveSelect($event)"></selector>
            <!--粉丝标签列表-->
            <template v-if="stripData.echo.opt1 === 'wechat' &&
                        stripData.echo.opt2 === 'subscription' &&
                        stripData.echo.opt3">
            <selector :options="optionsDatas.selectorOptions.operatorCommon.subscriptionEvent" 
                      :disabled="!writable" v-model="stripData.event"></selector>
            </template>
            <template v-if="stripData.echo.opt2">
            <!--邮件互动及短信互动-->
            <selector v-if="stripData.echo.opt1 === 'email'"
                      :options="optionsDatas.taskList.email"
                      :disabled="!writable"
                      v-model="stripData.echo.opt3"
                      @select="taskIdSelect($event)"></selector>
            <selector v-if="stripData.echo.opt1 === 'mobile'"
                      :options="optionsDatas.taskList.SMS"
                      :disabled="!writable"
                      v-model="stripData.echo.opt3"
                      @select="taskIdSelect($event)"></selector>
            <!-- 应用消息 互动 -->
            <selector v-if="stripData.echo.opt1 === 'agentMsg'"
                      :options="optionsDatas.taskList.agentMsg"
                      :disabled="!writable"
                      v-model="stripData.echo.opt3"
                      @select="taskIdSelect($event)"></selector>
            <!--邮件互动的邮件链接选择-->
            <template v-if="emailLinks.materialId">
                <template v-if="writable">
                    <div class="links-wrapper">
                    <div class="left-part">{{'controller.urlList' | t}}</div>
                    <ul class="links">
                        <li v-for="link in emailLinks.list" :key="link.href" class="link" :title="link.href">
                            {{link.href}}
                        </li>
                    </ul>
                    <div class="right-part" @click.stop="openSelectPreview()">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-pencil"></use>
                        </svg>
                    </div>
                </div>
                </template>
                <template v-else>
                    <div class="view-span">
                        <span class="view-span-arr" v-for="link in viewEmailLinks.list">{{link}}</span>
                    </div>
                </template>
            </template>
            <!--粉丝属性选项相关-->
            <template v-if="stripData.echo.opt1 === 'fans_attribute'">
                <selector v-if="stripData.echo.opt3 === 'fans_lable'"
                          :options="optionsDatas.tagList"
                          :disabled="!writable"
                          v-model="stripData.value"></selector>
                <selector v-if="stripData.echo.opt3 === 'interaction_time'"
                          :options="optionsDatas.relationDictionary.dateDictionary"
                          :disabled="!writable"
                          v-model="stripData.operation"
                          @select="timeSelect($event)"></selector>
                <template v-if="stripData.echo.opt3 === 'interaction_time' && stripData.field_type === 3">
                    <template v-if="writable">
                            <!--相对时间点的特殊处理框-->
                        <template v-if="stripData.operation === 'currentRelativeTime'">
                            <span>{{'swarm.relativeTime' | t}}</span>
                            <input v-model="stripData.value" class="relative-time input" type="text" maxlength="3" @input="checkNum($event)">
                            <span>{{'time.day' | t}}</span>
                            <selector :options="relative" v-model="stripData.relative_type"></selector>
                        </template>
                        <template v-if="stripData.operation === 'absoluteTime' && dateComponentLoad">
                            <span>{{'swarm.absoluteDateA' | t}}</span>
                            <calendar v-model="stripData.value.start" :end="stripData.value.end"/>
                            <span>{{'swarm.absoluteDateB' | t}}</span>
                            <calendar v-model="stripData.value.end" :start="stripData.value.start"/>
                            <span>{{'swarm.absoluteDateC' | t}}</span>
                        </template>
                    </template>
                    <template v-else>
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
            </template>
            </template>
            <!--删除条件-->
            <span v-if="writable" class="icon icon-iconless" @click.stop="deleteStripData()"></span>
            <!--邮件链接选择弹窗-->
            <email-links-picker v-if="selectPreviewShow" :selectLinks="emailLinks.list"
                            :materialId="emailLinks.materialId" @commitSelect="commitLinks($event)"
                            @close="closeSelectPreview()"/>
            <!--用户分群选择框-->
            <swarmMultiSelect v-if="stripData.echo.opt1 === 'audience_source' && stripData.echo.opt2 === 'contact_swarm'"
                              :title="$t('controller.userGroup')"
                              :options="optionsDatas.scrmSwarmList"
                              :disabled="!writable"
                              :search="true"
                              v-model="scrmSwarmList"
                              @select="commitSwarm"/>
            <p class="not-complete" v-if="writable&&isWarn">
                <span class="icon icon-warn"></span>
                <span> {{'swarm.curInvalid' | t}} </span>
            </p>
        </template>
    </div>
</template>
<script type="text/ecmascript-6">
    import cloneDeep from 'lodash/cloneDeep';
    import LegacySelector from './legacy-selector.vue';
    import EmailLinksPicker from './email-links-picker.vue';
    import swarmMultiSelect from '../../components/swarm-multi-select.vue';
    import { WechatApiV1 } from '@/api';

    export default {
        props: {
            stripItem: Object,
            type: String,
            act: String,
            optionsData: Object,
            num: Number,
            writable: {
                type: Boolean,
                default: true
            }
        },
        computed: {
            batchCount (){
                if (this.rawData.value) {
                    let verifyArray = this.rawData.value.split('\n').map(line => String(line).trim())
                        .filter(line => line);
                    return verifyArray.length;
                }
                return 0;
            },
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
                viewEmailLinks: {               //只读模式邮件链接
                    materialId: null,
                    list: []
                },
                selectPreviewShow: false,       //邮件链接弹框判断
                scrmSwarmList: [],              //用户分群列表
                //前后关系
                relative: [
                    {name: this.$t('swarm.within'), id: 0},
                    {name: this.$t('swarm.beyond'), id: 1}
                ],
                dateComponentLoad: false,        //日期组件是否加载
                isInvalid: false,
                isWarn: false,
                wechatId: '',                    //当前公众号id
            };
        },
        created() {
            this.optionsDatas = cloneDeep(this.optionsData);
            this.stripData = cloneDeep(this.stripItem);
            if (!this.writable) {
                if (this.stripItem.echo.opt2 === 'dmd_click_the_link' || this.stripItem.echo.opt2 === 'not_dmd_click_the_link') {
                    this.viewEmailLinks.materialId = true;
                    this.viewEmailLinks.list = cloneDeep(this.stripItem.value);
                }
            }
            this.loadData();
        },
        watch: {
            stripData: {
                handler:function(){
                    this.isWarn = false;
                    this.commitResult();
                },
                deep:true
            }
        },
        methods: {
            async getTagList() {
                this.optionsDatas.tagList = await WechatApiV1
                    .getJourneyTagList('','',this.wechatId)
                    .then((res) => {
                        return res.body.data.tagList.map((i) => {
                            i.id = i.tagId;
                            return i;
                        });
                    });
            },
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
                //根据公众号加载粉丝标签列表
                if (data.appid && this.optionsDatas.masterWechat.length) {
                    let sub = this.optionsDatas.masterWechat.find(e => {
                        return e.value === data.appid;
                    });
                    let subSec = this.optionsDatas.selectorOptions.authorizerInfoList.find(e => {
                        return e.value === data.appid;
                    });
                    if (typeof sub === 'object' && typeof subSec === 'object') {
                        this.wechatId = sub.wechatId;
                        this.getTagList();
                    }
                }
                let opt1Item = this.eventGroupList
                    .filter(item => (item.operator === data.echo.opt1));
                if (opt1Item && opt1Item.length) {
                    this.$nextTick(() => {
                        this.$refs.selector1.change(opt1Item[0]);
                        if (data.echo.opt2) {
                            let weChat = '';
                            if (this.optionsDatas.masterWechat.length) {
                                weChat = this.optionsDatas.masterWechat.find(e => {
                                    return e.value === data.appid;
                                });
                            }
                            let opt2Item = [];
                            if (data.echo.opt1 === 'fans_attribute' && data.echo.opt2 && data.appid) {
                                opt2Item = this.optionsDatas.selectorOptions.authorizerInfoList
                                    .filter(item => (item.value === data.appid));
                            } else {
                                opt2Item = opt1Item[0].child
                                    .filter(item => (item.operator === data.echo.opt2));
                            }
                            if (
                                (opt2Item && opt2Item.length) ||
                                (data.echo.opt1 === 'fans_attribute' && data.echo.opt2 && data.appid && typeof weChat === 'object')
                            ) {
                                this.$nextTick(() => {
                                    this.$refs.selector2.change(opt2Item[0] || weChat);
                                    let opt3Item = [];
                                    if (data.echo.opt1 !== 'fans_attribute' && data.echo.opt3 && data.appid) {
                                        opt3Item = this.optionsDatas.selectorOptions.authorizerInfoList
                                            .filter(item => (item.value === data.appid));
                                        if (opt3Item.length === 0 && typeof weChat !== 'object') {
                                            this.clearStripData();
                                            return;
                                        }
                                    } else if (data.echo.opt1 === 'fans_attribute') {
                                        for (let i = 0; i < this.eventGroupList.length; i++) {
                                            if (this.eventGroupList[i].id === 'fans_attribute') {
                                                opt3Item = this.eventGroupList[i].child
                                                    .filter(item => (item.operator === data.echo.opt3));
                                                if (opt3Item.length === 0) {
                                                    this.clearStripData();
                                                    return;
                                                }
                                            }
                                        }
                                    } else if (data.echo.opt3 && opt2Item[0].child) {
                                        opt3Item = opt2Item[0].child
                                            .filter(item => (item.operator === data.echo.opt3));
                                        if (opt3Item.length === 0) {
                                            this.clearStripData();
                                            return;
                                        }
                                    } else if (data.echo.opt1 === 'audience_source' && data.echo.opt2 === 'contact_swarm') {
                                        this.scrmSwarmList = data.echo.opt3;
                                    }
                                    if (
                                        (opt3Item && opt3Item.length) ||
                                        (data.echo.opt1 !== 'fans_attribute' && data.echo.opt3 && data.appid && typeof weChat === 'object')
                                    ) {
                                        this.$nextTick(() => {
                                            this.$refs.selector3.change(opt3Item[0] || weChat);
                                            this.stripData = cloneDeep(data);
                                            this.checkItem();
                                            this.dateComponentLoad = true;
                                        });
                                    }
                                    this.stripData = cloneDeep(data);
                                    this.checkItem();
                                });
                            } else {
                                this.clearStripData();
                            }
                        }
                    });
                } else if (data.echo.opt1) {
                    this.$nextTick(() => {
                        this.clearStripData();
                    });
                } else {
                    this.dateComponentLoad = true;
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
                        this.$nextTick(() => {
                            this.clearStripData();
                        });
                        return;
                    }
                }
                if (this.stripData.echo.opt2) {
                    if (this.stripData.echo.opt3 && this.stripData.echo.opt1 === 'email') {
                        let hasItem = this.optionsDatas.taskList.email
                            .filter(item => (item.id === this.stripData.echo.opt3));
                        if (hasItem.length === 0) {
                            this.$nextTick(() => {
                                this.clearStripData();
                            });
                            return;
                        }
                    }
                    if (this.stripData.echo.opt3 && this.stripData.echo.opt1 === 'mobile') {
                        let hasItem = this.optionsDatas.taskList.SMS
                            .filter(item => (item.id === this.stripData.echo.opt3));
                        if (hasItem.length === 0) {
                            this.$nextTick(() => {
                                this.clearStripData();
                            });
                            return;
                        }
                    }
                    //应用消息回显校验
                    if (this.stripData.echo.opt3 && this.stripData.echo.opt1 === 'agentMsg') {
                        let hasItem = this.optionsDatas.taskList.agentMsg
                            .filter(item => (item.id === this.stripData.echo.opt3));
                        if (hasItem.length === 0) {
                            this.$nextTick(() => {
                                this.clearStripData();
                            });
                            return;
                        }
                    }
                    if (this.stripData.echo.opt1 === 'fans_attribute') {
                        //if (this.stripData.value && this.stripData.echo.opt3 === 'fans_lable') {
                        //    let hasItem = this.optionsDatas.tagList
                        //        .filter(item => (item.id === this.stripData.value));
                        //    if (hasItem.length === 0) {
                        //        this.$nextTick(() => {
                        //            this.clearStripData();
                        //        });
                        //        return;
                        //    }
                        //}
                        if (this.stripData.operation && this.stripData.echo.opt3 === 'interaction_time') {
                            let hasItem = this.optionsDatas.relationDictionary.dateDictionary
                                .filter(item => (item.id === this.stripData.operation));
                            if (hasItem.length === 0) {
                                this.$nextTick(() => {
                                    this.clearStripData();
                                });
                                return;
                            }
                        }
                    }
                    if (this.stripData.echo.opt1 === 'participation_log') {
                        let hasItem = this.optionsDatas.taskTempList
                            .filter(item => (item.id === this.stripData.echo.opt3));
                        if (hasItem.length === 0) {
                            this.$nextTick(() => {
                                this.clearStripData();
                            });
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
                            this.$nextTick(() => {
                                this.clearStripData();
                            });
                            return;
                        }
                    }
                }
                if (this.stripData.emailLinks && this.stripData.emailLinks.materialId) {
                    this.emailLinks = this.stripData.emailLinks;
                }
            },
            clearStripData() {
                if (this.writable) {
                    this.$toast(this.$t('controller.invalidCondition'),'warn');
                    this.$emit('delResult');
                } else {
                    this.isInvalid = true;
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
                this.emailLinks.materialId = null;
                this.emailLinks.list = [];
            },
            //选择事件二级
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
                    if (this.stripData.echo.opt1 === 'email' ||
                        this.stripData.echo.opt1 === 'mobile' ||
                        this.stripData.echo.opt1 === 'agentMsg') {
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
                        this.stripData.event = e.operator;
                        for (let i = 0; i < this.eventGroupList.length; i++) {
                            if (this.eventGroupList[i].id === 'fans_attribute') {
                                this.othInteractiveList = this.eventGroupList[i].child;
                                this.stripData.operation = 'eq';
                            }
                        }
                        this.stripData.appid = e.value;
                        this.stripData.field_id = '';
                        this.stripData.field_name = '';
                        this.stripData.field_type = '';
                        //根据公众号加载粉丝标签列表
                        let sub = this.optionsDatas.masterWechat.find(item => {
                            return item.value === e.value;
                        });
                        let subSec = this.optionsDatas.selectorOptions.authorizerInfoList.find(item => {
                            return item.value === e.value;
                        });
                        if (typeof sub === 'object' && typeof subSec === 'object') {
                            this.wechatId = sub.wechatId;
                            this.getTagList();
                        }
                    }
                }
                this.emailLinks.materialId = null;
                this.emailLinks.list = [];
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
                    this.stripData.field_name = e.id;
                    if (e.id === 'fans_lable') {
                        this.stripData.operation = 'eq';
                        this.stripData.field_type = 2;
                    } else {
                        this.stripData.field_type = 3;
                        this.stripData.operation = '';
                    }
                }
            },
            //选择时间类型
            timeSelect(e) {
                if (e.id === 'absoluteTime') {
                    this.stripData.value = {
                        start: '',
                        end: ''
                    };
                } else if (e.id === 'currentRelativeTime') {
                    this.stripData.value = '';
                } else if (e.id === 'exists') {
                    this.stripData.value = '1';
                } else if (e.id === 'missing') {
                    this.stripData.value = '0';
                }
            },
            //邮件互动、短信互动选择任务
            taskIdSelect(e) {
                this.stripData.task_id = e.id;
                this.emailLinks.list = [];
                if (
                    this.stripData.echo.opt2 === 'dmd_click_the_link' ||
                    this.stripData.echo.opt2 === 'not_dmd_click_the_link' ||
                    this.stripData.event === 'dmd_click_the_link' ||
                    this.stripData.event === 'not_dmd_click_the_link'
                ) {
                    this.emailLinks.materialId = e.materialId;
                    this.stripData.value = [];
                } else {
                    this.emailLinks.materialId = null;
                    this.stripData.value = e.id;
                }
            },
            //确定选择的邮件链接
            commitLinks(e) {
                this.emailLinks.list = e;
                this.stripData.value = e.map(link => {
                    return link.href;
                });
            },
            //确定选择的用户分群
            commitSwarm(ids) {
                if (ids.length > 5) {
                    this.$toast(this.$t('controller.swarmMax'), 'warn');
                    ids.splice(ids.length - 1, 1);
                }
                this.stripData.value = this.scrmSwarmList;
                this.stripData.echo.opt3 = this.scrmSwarmList;
            },
            openSelectPreview() {
                this.selectPreviewShow = true;
            },
            closeSelectPreview() {
                this.selectPreviewShow = false;
            },
            checkNum(e) {
                let number = e.target.value.replace(/[^\d]/g, '');
                if (number === '0') {
                    number = '';
                }
                if (number.indexOf('.') < 0 && number !== '') {
                    number = parseInt(number);
                }
                this.stripData.value = number;
            },
            // 删除规则
            deleteStripData() {
                this.$emit('delResult');
            },
            //提交
            commitResult() {
                if (this.emailLinks.materialId) {
                    this.stripData.emailLinks = this.emailLinks;
                } else {
                    delete this.stripData.emailLinks;
                }
                this.$emit('select', this.stripData, this.num, this.type);
            },
            //其他行为事件条件验证
            othValidSingleRule() {
                let item = Object.assign({}, this.stripData);
                if (item.event_group === '' || item.event === '' || item.operation === '') {
                    this.$toast(this.$t('swarm.invalidRule'), 'warn');
                    this.isWarn = true;
                    return false;
                }
                if (item.value === '' || item.value.length === 0) {
                    this.$toast(this.$t('swarm.invalidRule'), 'warn');
                    this.isWarn = true;
                    return false;
                }
                if (item.field_type === 3) {
                    if (item.operation === 'currentRelativeTime' && item.limitSize === 1) {
                        if (item.value.length > 3) {
                            this.$toast(this.$t('swarm.max3Chars'), 'warn');
                            this.isWarn = true;
                            return false;
                        }
                        let detection = /^([0-9]*)$/;
                        if (!detection.test(item.value)) {
                            this.$toast(this.$t('swarm.positiveInteger'), 'warn');
                            this.isWarn = true;
                            return false;
                        }
                    }
                    if (item.operation === 'absoluteTime') {
                        if (item.value.start === '' || item.value.end === '') {
                            this.$toast(this.$t('swarm.invalidRule'), 'warn');
                            this.isWarn = true;
                            return false;
                        }
                    }
                }
                return true;
            },
        },
        components: {LegacySelector,EmailLinksPicker,swarmMultiSelect}
    };
</script>
<style lang="scss">
    @import "../../../../../../../common/scss/base/variables";
    @import "../../../../../../../common/scss/base/mixin";
    .otherCondition{
        position: relative;
        margin-left: 30px;
        padding: 10px 40px 10px 15px;
        margin-bottom: 5px;
        line-height: normal;
        background-color: rgba(218, 236, 248, 0.5);
        &.colored {
            background-color: rgba(230, 249, 246, 0.5);
        }
        .md{
            width: 222px;
        }
        .selector{
            margin-bottom: 5px;
            .placeholder{
                color: #bfbfbf;
            }
        }
        .relative-time{
            width: 2em !important;
        }
        .swarm-multi-select{
            margin-bottom: 15px !important;
            .visual-mode{
                span{
                    line-height: 18px !important;
                }
            }
            .select-mode{
                span{
                    line-height: 35px !important;
                }
            }
        }
        .calendar{
            span{
                width: 120px;
            }
        }
        .links-wrapper {
            clear: both;
            overflow: hidden;
            display: flex;
            margin-top: 8px;
            border: 1px solid $border-color;
            border-radius: 4px;
            background-color: $title-bg;
            width: 80%;

            .left-part {
                line-height: 32px;
                flex: 0.5;
                text-align: center;
            }

            .links {
                flex: 1;
                padding: ($input-field-height - 20px)/2 16px 0;
                line-height: 20px;
                background-color: white;

                li {
                    display: inline-block;
                    vertical-align: top;
                    max-width: 200px;
                    @include ellipsis();
                    margin: 0 ($input-field-height - 20px)/2 ($input-field-height - 20px)/2 0;
                }
            }

            .right-part {
                background-color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                color: $theme;
                cursor: pointer;

                svg {
                    width: 16px;
                    height: 16px;
                    margin: ($input-field-height - 16px)/2;
                    fill: currentColor;
                }

                &:hover {
                    color: $light-theme;
                    background-color: $content-bg;
                }
            }
        }
        .icon-iconless {
            position: absolute;
            top: 10px;
            right: 5px;
            font-size: 16px;
            padding-right: 12px;
            cursor: pointer;
            line-height: 32px;
            color: #f67d7d;
        }
        &.disabled {
            .legacy-selector,
            .selector {
                width: unset;
                max-width: 200px;
            }   
            .swarm-multi-select {
                width: unset;
                max-width: 500px;
                z-index: unset;
                padding-left: 8px;
                div {
                    background-color: unset;
                    .selected-option {
                        // background-color: unset;
                        margin-bottom: 5px;
                    }
                }
            }
            .select-text.disabled {
                line-height: 32px;
                border: none;
                width: unset;
                color: unset;
                padding: 0;
                background-color: unset;
                .icon {
                    display: none;
                }
            }
        }
        .view-span {
            @include ellipsis();
            display: inline-block;
            max-width: 500px;
            vertical-align: top;
            line-height: 32px;
            margin-left: 10px;
        }
        .view-span-arr {
            @include ellipsis();
            display: inline-block;
            vertical-align: middle;
            margin:0 10px 4px 0;
            // margin-right: 4px;
            padding: 0 5px;
            max-width: 450px;
            height: 18px;
            line-height: 18px;
            border: 1px solid #cfd5df;
            white-space: nowrap;
            border-radius: 4px;
        }
        .not-complete {
            color: #f67d7d;
            font-size: 14px;
        }
    }
</style>
