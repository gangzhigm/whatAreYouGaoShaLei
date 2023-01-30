<template>
    <inline-loading v-if="requestLoading"></inline-loading>
    <div class="event-modal" v-else>
        <div class="event-modal-content" v-if="writable">
            <!-- 一级条件选框 -->
            <div class="tag-box" v-blur="close">
                <div class="trigger" @click.stop="toggle">
                    <template v-if="settingsEmu[1]">
                        {{settingsEmu[0].operatorCn}}-{{settingsEmu[1].operatorCn || settingsEmu[1].fieldCn}}
                    </template>
                    <i class="select-icon icon-arrow-down icon"></i>
                </div>
                <transition name="drop">
                    <div class="eventChoose" v-if="eventChoose">
                        <!-- 事件选择器 左侧父级列表 -->
                        <div class="left">
                            <p v-for="(item,index) in parentMenu" :key="index" @click.stop="chooseParent(item,index)" :class="{choose:parentId===index.toString()}">{{item.operatorCn}}</p>
                        </div>
                        <!-- 事件选择器 右侧子级列表 -->
                        <div class="right" v-if="childMenu&&childMenu.length">
                            <div class="search-box" v-if="!isSubscriptionAccount">
                                <input type="text" v-model.trim="keyword" :placeholder="$t('common.selectKeywordHolder')" maxlength="100" @keydown.enter="search">
                                <svg aria-hidden="true" @click="search">
                                    <use xlink:href="#icon-search"></use>
                                </svg>
                            </div>
                            <p v-for="(item, index) in searchChildMenu || childMenu" :key="index" @click.stop="chooseChild(item, index)" :class="{choose: childName === item.operatorCn || childName === item.fieldCn,
                               disabled: isSubscriptionAccount && item.operator === 'wx_scan'}" :title="isSubscriptionAccount && item.operator === 'wx_scan' ? $t('QRCode.functionDisabledTip') : ''">
                                {{item.operatorCn||item.fieldCn}}
                            </p>
                        </div>
                    </div>
                </transition>
            </div>
            <!-- 二级关系符选框 -->
            <template v-if="secondInputerDisplay">
                <!-- 企业微信条件 -->
                <selector v-if="settingsObj.operatorType === 'wecom'" v-model="eventId" :options="eventOptions" :search="'async'" @search="wecomSearch" @hide="hideWecomList" @select="selectEventHandler($event)">
                </selector>
                <!-- 小程序条件 -->
                <selector v-else-if="settingsObj.operatorType === 'miniprogram'" :placeholder="$t('wechatContent.chooseMicropage')" v-model="eventId" @hide="hideWecomList" :options="eventOptions" @select="selectEventHandler($event)"></selector>
                <!-- 其他条件 -->
                <selector v-else v-model="eventId" :options="eventOptions" @select="selectEventHandler($event)"></selector>
            </template>
            <!-- 粉丝标签公众号选框 -->
            <selector v-if="fanlabelType === 'fanLabel'" v-model="fanLabelApp" :options="otherOptions['wechat']" @select="wechatHandler($event)"></selector>
            <!-- 三级数值选框（文本，数字，时间，标签） -->
            <thirdInputer v-if="thirdInputerDisplay" :fieldType="fieldType" :type="valueType" :options="options" :settings="settingsEmu" :wechatId="wechatId" @update="update($event)" :auto="auto" ref="thirdInputer"></thirdInputer>
        </div>
        <div class="event-modal-content" v-else>
            <div>{{readOnlyText}}</div>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
import { ContactApi, ContactApiV1, WecomApiV1, JourneyApiV3, ContactApiV3, QuestionnaireApiV1, WechatApiV3, WechatApiV1, ScoringV1, MicroPageApi} from '@/api';
import thirdInputer from './third-inputer.vue';
import { deleteEmptyInArray } from '@/common/utils/mixin';
import { logError } from '@/monitor';
import { EVENT_CONDITION_CONTROLLER } from '../../../CONTROLLER_TYPES';
import QueryFilterConditionValue from '../../../../../../../analysis/components/query-filter-condition-value.vue';
import cloneDeep from 'lodash/cloneDeep';
import filterArrayByName from '@/common/utils/filterArrayByName';
import {I18N_STORE_NAME} from '@/locales';
import { mapState } from 'vuex';

export default {
    props: {
        // 选项类型：会员触发事件/会员属性变更
        optionType: String,
        // settings参数对象
        settingsObj: {
            type: Object,
            default: {
                operatorType: '',
                operator: '',
                value: '',
            }
        },
        errMsg: {
            type: String,
            default: ''
        },
        summary: {
            type: String,
            default: ''
        },
        controller: Object,
        loading: Boolean,
        writable: {
            type: Boolean,
            default: true
        }
    },
    components: { thirdInputer, QueryFilterConditionValue },
    created () {
        this.settingsCopy = cloneDeep(this.settingsObj);
        let promiseList = [
            this.getEventOptionsRequest(), // [0].全部事件条件分支数据（用于选项回显）
            this.getPrepositionRequest(1), // [1]邮件列表
            this.getPrepositionRequest(2), // [2]短信列表
            this.getPrepositionWechatRequest(0), // [3]客服消息
            this.getCustomerFieldRequest(), // [4]属性变化事件
            this.getSubscriptionListRequest(), // [5]公众号列表
            this.getFormListRequest(), // [6]获取表单分组
            this.getEventRequest(), // [7] 自定义事件列表
            this.getPrepositionWechatRequest(1), // [8]模板消息
            this.getPrepositionRequest(4), // [9]彩信列表
            this.getTagList(), // [10]获取筛选后的标签
            this.getGroupOldList(), // [11][old会员标签]
            WechatApiV1.isBindWeChat(),// 处理子账号查看共享旅程时，公众号的数据
            this.getAllStaffList(),  //[13]企业微信员工列表
            this.getAllWecomGroupList(),   //[14]企业微信员工列表
            this.getAllChannelCodeList(),    //[15]企业微信活码列表
            this.getScoringChangeList(),     //[16]评分模型列表
            this.getMicroPageList(),        //[17]微页面列表
        ];
        Promise.all(promiseList)
            .then((values) => {
                this.eventStore = values[0]; // 暂存全部事件条件分支数据
                this.optionTypeDecition(values[0]);
                this.otherOptions['str'] = this.operatorCommonHandler(values[0].operatorCommon.str); // str otherOptions['9']
                this.otherOptions['num'] = this.operatorCommonHandler(values[0].operatorCommon.num); // num otherOptions['10']
                this.otherOptions['dat'] = this.operatorCommonHandler(values[0].operatorCommon.dat); // num otherOptions['11']

                this.taskHandler('email', values[1].taskList); // email otherOptions['1']
                this.taskHandler('mobile', values[2].taskList); // sms otherOptions['2']
                this.taskHandler('wx_customer_news', values[3].taskList); // wechat客服消息 otherOptions['17'] subType 0
                this.customerFieldHandler(values[4]); // 属性变化事件，需要三级input otherOptions['6']
                this.subscriptionListHandler(values[5]); // 微信：公众号选项 otherOptions['4'] &扫描带参二维码otherOptions['20']
                this.FormRequestHandler(values[6]); //表单分组 otherOptions['15']
                this.EventRequestHandler(values[7]); //自定义事件 otherOptions['19']

                this.taskHandler('wx_template_news', values[8].taskList); // 微信模板消息 childForm 21 subType 1
                this.taskHandler('mms', values[9].taskList); // mms otherOptions[*new]
                this.otherOptions['fanLabel'] = values[10]; // 粉丝标签
                this.otherOptions['memberLabel'] = values[11]; // 会员标签
                this.wechatListHandler(values[12]);
                this.wecomDataHandler('wecom_employee_add_contact', values[13]);    //otherOptions.wecom_employee_add_contact
                this.wecomDataHandler('wecom_contact_delete_employee', values[13]);    //otherOptions.wecom_contact_delete_employee
                this.wecomDataHandler('wecom_add_group', values[14]);    //otherOptions.wecom_add_group
                this.wecomDataHandler('wecom_scan_code', values[15]);    //otherOptions.wecom_scan_code
                this.scoringAllModelListHandler(values[16]); //评分事件
                this.microPageListHandler('micropage_enter', values[17]);  //微页面
                this.microPageListHandler('micropage_share', values[17]);  //微页面
                this.Initialization();
                
            });
    },
    data () {
        return {
            //页面临时setting数组，模拟旧的结构
            settingsEmu: [],
            // 全部逻辑关系符
            requestLoading: true,
            parentMenu: [], // 事件选择：父级列表
            childMenu: [], // 事件选择：子级列表
            eventStore: null, // 暂存全部事件
            otherOptions: {}, // 存储全部页面选项
            eventChoose: false, // 事件选择器显示
            parentId: '', // 事件选择器 父级index
            childName: '', // 事件选择器 子级回显名称
            eventOptions: [], // 二级operator选项 或 自定义事件
            valueType: '',  // 最后一级动态组件类型
            options: [], // 三级组件选项列表
            auto: false,    // 为 true 时，最后一级组件不需要 reset
            eventId: '', // 事件id
            wechatId: -1, //当前公众号id
            fanLabelApp: '', //当前公众号appid
            fanLabelAppName: '', //当前公众号名称
            secondInputerDisplay: false,
            thirdInputerDisplay: false,
            invalid: false, //事件失效状态
            //settings拷贝对象，用于添加回显内容
            settingsCopy: {
                operatorType: '',
                operator: '',
                value: '',
            },
            groupData: [],          //分组结构调整后数据，更新标签名称用
            masterWechat: [],       //子账号获取主账号当前控件用到的公众号信息
            keyword: '',            //子级列表搜索关键字
            searchChildMenu: '',    //子级列表搜索后数组
            wecomKeyWord: '',       //二级选项搜索词
        };
    },
    computed: {
        ...mapState({
            //获取账号是否为订阅号
            isSubscriptionAccount: state => state.user.isSubscriptionAccount,
            roleId: state => state.roleId,
            lang: state => state[I18N_STORE_NAME].lang === 'zh-CN'
        }),
        //label类型选项
        labelOptions () {
            return [
                { id: 1, name: this.$t('QRCode.followerTag'), limitSize: 1, labelType: 'fanLabel' },
                { id: 2, name: this.$t('QRCode.dmartechLabel'), limitSize: 1, labelType: 'memberLabel' }
            ];
        },
        fieldType () {
            return this.settingsObj.fieldType || '';
        },
        // 完成全部事件选择
        isCompleted () {
            switch (this.settingsObj.operatorType) {
                case 'email':
                case 'mobile':
                case 'mms':
                    if (!this.settingsObj.operator || !this.settingsObj.taskId) {
                        return false;
                    }
                    return true;
                case 'wecom':
                    if (!this.settingsObj.operator || !this.settingsObj.value) {
                        return false;
                    }
                    return true;
                case 'wechat':
                    if (!this.settingsObj.operator) {
                        return false;
                    }
                    if (['wx_subscribe', 'wx_unsubscribe', 'wx_click_menu', 'wx_reply_message'].includes(this.settingsObj.operator)) {
                        if (this.settingsObj.appId) {
                            return true;
                        }
                        return false;
                    } else if (['wx_template_news', 'wx_customer_news'].includes(this.settingsObj.operator)) {
                        if (this.settingsObj.taskId) {
                            return true;
                        }
                        return false;
                    }
                    if (this.settingsObj.appId && this.settingsObj.value) {
                        return true;
                    }
                    return false;
                case 'form':
                    if (this.settingsObj.operator && this.settingsObj.formGroupId && this.settingsObj.value) {
                        return true;
                    }
                    return false;
                case 'custom':
                    if (this.settingsObj.value) {
                        return true;
                    }
                    return false;
                case 'label':
                    if (this.settingsObj.labelType && this.settingsObj.labelType === 'fanLabel') {
                        if (this.settingsObj.operator && this.settingsObj.labelType &&
                            (this.settingsObj.value)) {
                            return true;
                        }
                        return false;
                    } else if (this.settingsObj.labelType && this.settingsObj.labelType === 'memberLabel') {
                        if (this.settingsObj.operator && this.settingsObj.labelType &&
                            (this.settingsObj.value && this.settingsObj.value.length > 0)) {
                            return true;
                        }
                        return false;
                    }
                    return false;
                case 'attribute_change':
                    if (!this.settingsObj.fieldType) {
                        return false;
                    }
                    if (this.settingsObj.operator && this.settingsObj.fieldName) {
                        if (this.settingsObj.fieldType === 4) {
                            if (this.settingsObj.value && this.settingsObj.value > 0) {
                                return true;
                            }
                            return false;
                        }
                        if (this.settingsObj.contactFieldOperator) {
                            if (this.settingsObj.fieldType === 3) {
                                if (this.settingsObj.contactFieldOperator === 'absoluteTime') {
                                    if (this.settingsObj.value
                                        && this.settingsObj.value.start
                                        && this.settingsObj.value.end) {
                                        return true;
                                    }
                                    return false;
                                } else if (this.settingsObj.contactFieldOperator === 'currentRelativeTime') {
                                    if ((this.settingsObj.value !== undefined && this.settingsObj.value !== '')
                                        && (this.settingsObj.relativeType !== undefined && this.settingsObj.relativeType !== '')) {
                                        return true;
                                    }
                                    return false;
                                }
                                return true;
                            }
                            // eq等于, ne不等于, in包含, nin不包含, gt大于, lt小于
                            if (['eq', 'ne', 'in', 'nin', 'gt', 'lt']
                                .includes(this.settingsObj.contactFieldOperator)) {
                                if (this.settingsObj.value !== undefined && this.settingsObj.value !== '') {
                                    return true;
                                }
                                return false;
                            } else if (this.settingsObj.contactFieldOperator === 'exists') {
                                return true;
                            } else if (this.settingsObj.contactFieldOperator === 'range') {
                                if (this.settingsObj.value &&
                                    this.settingsObj.value.start && this.settingsObj.value.end) {
                                    return true;
                                }
                                return false;
                            }
                            //belong
                            if (this.settingsObj.value && this.settingsObj.value.length > 0) {
                                return true;
                            }
                            return false;
                        }
                        return false;
                    }
                    return false;
                case 'computational_engine_event':
                    if (this.settingsObj.operator && this.settingsObj.operatorType && this.settingsObj.value) {
                        return true;
                    }
                    return false;
                case 'miniprogram':
                    if (!this.settingsObj.operator || !this.settingsObj.value) {
                        return false;
                    }
                    return true;
                default:
                    return false;
            }
        },
        readOnlyText () {
            if (this.settingsCopy.appId && this.summaryCopy) {
                return this.summaryCopy;
            } else if (this.settingsCopy.labelType === 'memberLabel' ||
                (this.settingsCopy.operatorType === 'attribute_change' && this.settingsCopy.fieldType === 4)) {
                return this.settingsCopy.value.length > 0 ? this.summaryCopy : this.$t('controller.invalidEvent');
            } else if (!this.settingsEmu.length) {
                return this.$t('controller.invalidEvent');
            }
            let conditions = '';
            let operator = this.settingsEmu[1].operatorCn || this.settingsEmu[1].fieldCn;
            conditions = this.settingsEmu[0].operatorCn + ' ' + '-' + ' ' + operator;
            let event = '';
            if (this.settingsCopy.appId && this.masterWechat.length) {
                let weChat = this.masterWechat.find(e => {
                    return e.id === this.settingsCopy.appId;
                });
                if (typeof weChat === 'object') {
                    event = weChat.name;
                }
            } else if (this.eventId && this.eventOptions.length > 0) {
                let res = this.eventOptions.find(e => {
                    return e.id === this.eventId;
                });
                if (typeof res === 'object') {
                    event = res.name;
                } else {
                    event = '';
                }
            } else {
                event = '';
            }
            let value = '';
            let i = this.settingsCopy;
            let val = '';
            if (i.value !== '' && i.value !== undefined && i.operatorType !== 'wecom' && i.operatorType !== 'computational_engine_event' && i.operatorType !== 'miniprogram' && i.operatorType !== 'email') {
                if (Array.isArray(i.value) && i.value.length) {
                    if (i.value.length === 1) {
                        val = i.name ? i.name : i.value[0];
                    } else {
                        val = i.value.join(',');
                    }
                } else if (typeof (i.value) === 'object') {
                    val = i.value.start + this.$t('common.to') + i.value.end;
                } else {
                    if (this.settingsObj.fieldType && this.settingsObj.fieldType === 3) {
                        let end = this.settingsObj.relativeType ? this.$t('tag.before') : this.$t('tag.within');
                        val = i.value + this.$t('common.day') + end;
                    } else {
                        val = i.name ? i.name : i.value;
                    }
                }
                value = val;
            } else if (i.operatorType === 'form') {
                return this.$t('controller.invalidEvent');
            } else {
                value = '';
            }
            if (!this.isCompleted) {
                return this.$t('controller.invalidEvent');
            }
            if (this.settingsObj.operatorType !== 'custom') {
                if (value) {
                    return conditions + ' ' + event + ' ' + value;
                }
                return conditions + ' ' + event;
            }
            return conditions;
        },
        fanlabelType () {
            if (this.settingsEmu[2] && this.settingsEmu[2].labelType && this.settingsEmu[2].labelType === 'fanLabel') {
                return this.settingsEmu[2].labelType;
            }
            return '';
        },
        // summary拷贝对象
        summaryCopy () {
            return this.summary;
        }
    },
    watch: {
        requestLoading (val) {
            if (!val) {
                if (this.settingsEmu && this.settingsEmu.length) {
                    this.restoreDisplay();
                }
            }
        },
        eventChoose (val) {
            if (val) {
                if (this.settingsEmu[0] && this.settingsEmu[1]) {
                    this.restoreDisplay();
                }
            }
        },
        optionType (val) {
            if (val && !this.loading) {
                this.childMenu = [];
                this.settingsEmu = [];
                this.optionTypeDecition(this.eventStore);
            }
        },
        isCompleted (val) {
            if (this.writable) {
                if (val) {
                    this.$emit('update:errMsg', '');
                    this.updateSummary();
                } else {
                    this.$emit('update:errMsg', this.$t('controller.eventWarn'));
                    this.$emit('update:summary', '');
                }
            }
        }
    },
    methods: {
        updateSummary () {
            if (!this.writable && this.summary) return;
            let summary = '';
            let val = '';
            for (let i of this.settingsEmu) {
                if (i.value !== '' && i.value !== undefined) {
                    if (Array.isArray(i.value) && i.value.length) {
                        if (i.value.length === 1) {
                            val = i.value[0];
                        } else {
                            // TODO: not clear
                            // eslint-disable-next-line
                            i.value.forEach(e => {
                                if (val) {
                                    val = val + ',' + '' + e;
                                } else {
                                    val = e;
                                }
                            });
                        }
                    } else if (typeof (i.value) === 'object') {
                        val = i.value.start + this.$t('common.to') + i.value.end;
                    } else {
                        if (this.settingsObj.fieldType && this.settingsObj.fieldType === 3) {
                            let end = this.settingsObj.relativeType ? this.$t('tag.before') : this.$t('tag.within');
                            val = i.value + this.$t('common.day') + end;
                        } else {
                            val = i.value;
                        }
                    }
                } else {
                    val = '';
                }
                if (val !== undefined) {
                    summary = summary + ' ' + (i.operatorCn || i.name || val);
                } else {
                    summary = summary + ' ' + (i.operatorCn || i.name);
                }
            }
            if (this.settingsEmu[2] && this.settingsEmu[2].labelType && this.settingsEmu[2].labelType === 'fanLabel') {
                let nameArr = summary.trim().split(' ');
                nameArr.splice(nameArr.length - 1, 0, this.fanLabelAppName);
                summary = nameArr.toString().replace(/,/g, ' ');
            }
            this.$emit('update:summary', summary);
        },
        // 页面初期化
        Initialization () {
            let tempSettings = [];
            let vue = this;
            /**
             *  筛选并push条件数组
             *  @param  {Array} list 筛选源列表
             *  @param  {String, Number} key 列表中每项的key
             *  @param  {String, Number} value 目标value
             */
            function pushChild (list, key, target) {
                let res = list.find(e => {
                    return e[key] === vue.settingsObj[target];
                });
                if (typeof res === 'object') {
                    tempSettings.push(res);
                } else if (target === 'appId' && vue.masterWechat.length) {
                    let weChat = vue.masterWechat.find(e => {
                        return e[key] === vue.settingsObj[target];
                    });
                    if (typeof weChat === 'object') {
                        tempSettings.push(weChat);
                    } else {
                        vue.invalid = true;
                    }
                } else {
                    vue.invalid = true;
                }
            }
            if (this.settingsObj.operatorType) {
                // 获得一级（事件选择器 父级）选项
                tempSettings = this.parentMenu.filter(e => {
                    return e.operator === this.settingsObj.operatorType;
                });
                this.invalid = tempSettings.length === 0;
                let reg = false; //循环失效校验
                // 获得一级（时间选择器 子级）选项 ，第二级，第三级选项
                if (tempSettings.length) {
                    if (this.settingsObj.operator && this.settingsObj.operatorType !== 'custom') {
                        switch (this.settingsObj.operatorType) {
                            case 'email':
                            case 'mobile':
                            case 'mms':
                                pushChild(tempSettings[0].child, 'operator', 'operator');
                                pushChild(this.otherOptions[this.settingsObj.operatorType], 'id', 'taskId');
                                break;
                            case 'wecom':
                                pushChild(tempSettings[0].child, 'operator', 'operator');
                                pushChild(this.otherOptions[this.settingsObj.operator], 'id', 'value');
                                break;
                            // 表单事件
                            case 'form':
                                // 子级选项
                                pushChild(tempSettings[0].child, 'operator', 'operator');
                                // 二级选项（表单分组）
                                pushChild(this.otherOptions['form'], 'id', 'formGroupId');
                                break;
                            // 标签事件
                            case 'label':
                                // 子级选项
                                pushChild(tempSettings[0].child, 'operator', 'operator');
                                //二级选项
                                pushChild(this.labelOptions, 'labelType', 'labelType');
                                this.valueType = this.settingsObj.labelType;
                                // 三级选项
                                reg = true;
                                if (this.settingsObj.labelType === 'fanLabel') {
                                    this.fanLabelApp = this.settingsObj.appId || '';
                                    this.fanLabelApp ? this.wechatHandler({ id: this.fanLabelApp }) :
                                        (!this.writable || this.$toast(this.$t('controller.invalidCondition'), 'warn'));
                                    let result = {
                                        errMsg: '',
                                        name: '',
                                        operator: 'fanLabel',
                                        value: this.settingsObj.value
                                    };
                                    reg = false;
                                    tempSettings.push(result);
                                    this.settingsCopy.name = result.name[0];
                                    break;
                                } else {
                                    let group = cloneDeep(this.otherOptions['memberLabel'][0].groupList);
                                    this.getGroupData(group);
                                    let name = this.traverseList(this.settingsObj.value[0]);
                                    if (name) {
                                        let obj = {
                                            errMsg: '',
                                            name: [name],
                                            operator: 'memberLabel',
                                            selectedList: [{
                                                id: this.settingsObj.value[0],
                                                name: name
                                            }],
                                            value: [this.settingsObj.value[0]]
                                        };
                                        reg = false;
                                        tempSettings.push(obj);
                                        this.settingsCopy.name = obj.name[0];
                                    }
                                }
                                break;
                            // 微信事件
                            case 'wechat':
                                // 子级选项
                                pushChild(tempSettings[0].child, 'operator', 'operator');
                                // 二级选项
                                if (['wx_subscribe', 'wx_unsubscribe', 'wx_click_menu', 'wx_reply_message'].includes(this.settingsObj.operator)) {
                                    pushChild(this.otherOptions['wechat'], 'id', 'appId');
                                } else if (this.settingsObj.operator === 'wx_scan') {
                                    pushChild(this.otherOptions['wx_scan'], 'id', 'appId');
                                } else if (['wx_template_news', 'wx_customer_news'].includes(this.settingsObj.operator)) {
                                    pushChild(this.otherOptions[this.settingsObj.operator], 'id', 'taskId');
                                } else {
                                    reg = true;
                                }
                                //三级选项
                                if (this.settingsObj.operator === 'wx_scan') {
                                    WechatApiV1
                                        .getQuickMarkList()
                                        .then(res => {
                                            this.options = res.body.data.quickMarkGroup.map((i) => {
                                                i.name = i.groupName;
                                                return i;
                                            });
                                            this.auto = false;
                                            this.valueType = 'QRList';
                                            let target;
                                            for (let e of this.options) {
                                                reg = true;
                                                let res = e.quickMarkList.find(item => {
                                                    return item.quickMarkId === this.settingsObj.value;
                                                });
                                                if (typeof res === 'object') {
                                                    target = {
                                                        name: res.quickMarkName,
                                                        value: res.quickMarkId,
                                                        groupValue: e.id,
                                                        operator: 'value'
                                                    };
                                                    reg = false;
                                                    tempSettings.push(target);
                                                    break;
                                                }
                                            }
                                            this.thirdInputerDisplay = true;

                                        });
                                }
                                break;

                            // 属性变化事件，有三或四级选项
                            case 'attribute_change':
                                // 子级项目
                                pushChild(this.otherOptions.attribute_change, 'field', 'fieldName');
                                switch (this.settingsObj.fieldType) {
                                    // 字符串类型
                                    case 1:
                                        pushChild(this.otherOptions.str, 'operator', 'contactFieldOperator');
                                        tempSettings.push({
                                            errMsg: '',
                                            operator: 'value',
                                            value: this.settingsObj.value
                                        });
                                        break;
                                    // 数字类型
                                    case 2:
                                    case 6:
                                        pushChild(this.otherOptions.num, 'operator', 'contactFieldOperator');

                                        tempSettings.push({
                                            errMsg: '',
                                            operator: 'value',
                                            value: this.settingsObj.value
                                        });
                                        break;
                                    // 时间类型
                                    case 3:
                                        // 二级选项
                                        pushChild(this.otherOptions.dat, 'operator', 'contactFieldOperator');
                                        if (this.settingsObj.contactFieldOperator === 'absoluteTime') {
                                            tempSettings.push({
                                                errMsg: '',
                                                operator: 'value',
                                                value: this.settingsObj.value
                                            });
                                        } else if (this.settingsObj.contactFieldOperator === 'currentRelativeTime') {
                                            tempSettings.push({
                                                errMsg: '',
                                                operator: 'value',
                                                relativeType: this.settingsObj.relativeType,
                                                value: this.settingsObj.value
                                            });
                                        }
                                        break;
                                    // 标签类型
                                    case 4:
                                        reg = true;
                                        if (this.settingsObj.value[0]) {
                                            let group = cloneDeep(this.otherOptions['memberLabel'][0].groupList);
                                            this.getGroupData(group);
                                            let name = this.traverseList(this.settingsObj.value[0]);
                                            if (name) {
                                                let obj = {
                                                    errMsg: '',
                                                    name: [name],
                                                    operator: 'memberLabel',
                                                    selectedList: [{
                                                        id: this.settingsObj.value[0],
                                                        name: name
                                                    }],
                                                    value: [this.settingsObj.value[0]]
                                                };
                                                reg = false;
                                                tempSettings.push(obj);
                                                this.settingsCopy.name = obj.name[0];
                                            }
                                        }
                                        break;
                                }
                                break;
                            // 评分事件
                            case 'computational_engine_event':
                                //子级选项
                                pushChild(tempSettings[0].child, 'operator', 'operator');
                                // 二级选项
                                pushChild(this.otherOptions['computational_engine_event'], 'id', 'value');
                                break;
                            case 'miniprogram':
                                pushChild(tempSettings[0].child, 'operator', 'operator');
                                pushChild(this.otherOptions[this.settingsObj.operator], 'id', 'value');
                                break;
                        }
                    } else {
                        // 自定义事件，无operator
                        pushChild(this.otherOptions.custom, 'name', 'value');
                    }
                    this.$nextTick(() => {
                        if (this.invalid || reg) {
                            this.invalidReset();
                        } else {
                            this.settingsEmu = tempSettings;
                        }
                    });
                } else {
                    this.settingsEmu = [];
                }
            } else {
                this.settingsEmu = [];
                this.$emit('update:settingsObj', {});
            }
            this.$nextTick(() => {
                if (this.settingsEmu.length === 0) {
                    this.$emit('update:errMsg', this.$t('controller.eventWarn'));
                }
                this.requestLoading = false;
            });
        },
        // 获取全部事件条件分支数据（用于选项回显）
        getEventOptionsRequest () {
            return ContactApiV3
                .eventDesitionBranch()
                .then(res => {
                    return res.body.data;
                })
                .catch();
        },
        // 获取邮件、SMS列表
        getPrepositionRequest (type, subType) {
            if (!this.controller || this.controllerId) {
                return { taskList: [] };
            }
            let params = {
                journeyId: this.$route.params.id,
                type: type,
                controllerId: this.controller.id
            };
            if (subType) params.subType = subType;
            if (~~this.$route.params.id) {
                return JourneyApiV3
                    .prepositionTask(params)
                    .then(res => {
                        return res.body.data;
                    })
                    .catch();
            }
            return new Promise((resolve) => {
                resolve({ taskList: [] });
            });
        },
        // 获取微信列表
        getPrepositionWechatRequest (subType) {
            if (~~this.$route.params.id) {
                return JourneyApiV3
                    .prepositionTask({
                        journeyId: this.$route.params.id,
                        type: 3,
                        subType,
                        controllerId: this.controller.id
                    })
                    .then(res => {
                        return res.body.data;
                    })
                    .catch();
            }
            return new Promise((resolve) => {
                resolve({ taskList: [] });
            });
        },
        // 获取属性变化事件
        getCustomerFieldRequest (status = 0) {
            return ContactApiV1
                .customerField(status, '', 0)
                .then(({body:{data}}) => {
                    data.customerFieldList = data.customerFieldList.filter(item=>{
                        if (item.isScoring !== true){
                            return item;
                        }
                    });
                    return data;
                })
                .catch();
        },
        // 获取关注公众号
        getSubscriptionListRequest () {
            return WechatApiV3
                .allSubscriptionList()
                .then(res => {
                    return res.body.data;
                })
                .catch();
        },
        // 获取表单分组
        getFormListRequest () {
            return QuestionnaireApiV1
                .getFormGroupList()
                .then(res => {
                    return res.body.data;
                })
                .catch();
        },
        // 获取自定义事件列表
        getEventRequest () {
            return ContactApi
                .getContactEvnentsCustom()
                .then(res => {
                    return res.body.data;
                })
                .catch();
        },
        // 获取会员标签
        getGroupOldList () {
            return ContactApiV1
                .getGroupsOld()
                .then(res => {
                    if (res.body.data && res.body.data.groupList) {
                        return res.body.data.groupList;
                    }
                    return [];
                })
                .catch(() => {
                    return [];
                });
        },
        // 获取粉丝标签
        getTagList () {
            return [];
            //if (this.$store.state.user && this.$store.state.user.authorizerInfoId) {
            //    return fansModel
            //        .getJourneyTagList()
            //        .then(res => {
            //            if (res.body.data && res.body.data.tagList) {
            //                return res.body.data.tagList;
            //            }
            //        });
            //} else {
            //    return [];
            //}
        },
        // 获取二维码列表
        getQuickMarkListRequest () {
            WechatApiV1
                .getQuickMarkList()
                .then(res => {
                    this.options = res.body.data.quickMarkGroup.map((i) => {
                        i.name = i.groupName;
                        return i;
                    });
                    this.auto = false;
                    this.valueType = 'QRList';
                    this.thirdInputerDisplay = true;
                });
        },
        //获取评分变更列表
        getScoringChangeList () {
            return ScoringV1
                .getScoringModel()
                .then(res => {
                    return res.body.data;
                })
                .catch();
        },
        getMicroPageList(){
            return MicroPageApi
                .getMicroPageList('')
                .then(res=>{
                    return res.body.data;
                });
        },
        // 处理子账号查看共享旅程时，公众号的数据
        wechatListHandler (res) {
            let wechatList = res.body.data.wechatList.map(e => {
                let wechat = {};
                wechat.id = e.appid;
                wechat.limitSize = 1;
                wechat.name = e.wechatName;
                wechat.operator = 'wechat_list';
                wechat.value = e.appid;
                wechat.wechatId = e.id;
                return wechat;
            });
            this.masterWechat = wechatList;
        },
        getAllStaffList () {         //[13]企业微信员工列表
            return WecomApiV1
                .getStaffListNoPage(1, '')
                .then(res => {
                    return res.body.data.staffList.filter(e => e.value !== '');
                })
                .catch(() => {
                    return [];
                });
        },
        getAllWecomGroupList () {       //[14]企业微信员工列表
            return WecomApiV1
                .getWecomGroupList('')
                .then(res => {
                    res.body.data.groupList.forEach(e => {
                        if (!e.value) e.value = this.$t('common.groupChatNameNotSet');
                    });

                    return res.body.data.groupList;
                })
                .catch(() => {
                    return [];
                });
        },
        getAllChannelCodeList () {     //[15]企业微信活码列表
            return WecomApiV1
                .getAllChannelCodeList('')
                .then(res => {
                    return res.body.data.list.filter(e => e.value !== '');
                })
                .catch(() => {
                    return [];
                });
        },

        toggle () {
            this.eventChoose = !this.eventChoose;
        },
        close () {
            this.eventChoose = false;
        },
        chooseParent (e, index) {
            if (!this.validateChildForm(e)) {
                return;
            }
            this.searchChildMenu = '';
            this.keyword = '';
            this.clearSecondSelector();
            this.clearThirdInput();
            this.$emit('update:settingsObj', {});// 清空条件
            this.settingsEmu = [];
            this.secondInputerDisplay = e.operator !== ('custom' && 'miniprogram'); //自定义事件只有一级
            this.parentId = index.toString(); //选中父项高亮
            this.childName = ''; //清空子项高亮
            this.$emit('update:settingsObj', { operatorType: e.operator }); // 条件选框父级赋值，子级清空
            this.settingsEmu = [e];
            switch (e.operator) {
                // 自定义时间，属性变化事件，父级对象无child，子级从otherOptions中取
                case 'custom':
                case 'attribute_change':
                    this.childMenu = this.otherOptions[e.operator];
                    break;
                default:
                    this.childMenu = e.child;
                    break;
            }
        },
        //搜索属性变化事件二级列表
        search () {
            if (!this.keyword) {
                this.searchChildMenu = '';
            } else {
                this.searchChildMenu = cloneDeep(filterArrayByName(
                    this.childMenu, this.keyword, this.childMenu[0].operatorCn ? 'operatorCn' : 'fieldCn'
                ));
            }
        },
        chooseChild (e) {
            if (this.isSubscriptionAccount && e.operator === 'wx_scan') {
                return;
            }
            /* if (!this.validateChildForm(e)) {
                return;
            } */
            this.clearSecondSelector();
            this.clearThirdInput();
            this.childName = e.operatorCn || e.fieldCn;
            this.eventChoose = false;
            if (e.field === 'label_ids') {
                // 特殊处理-属性变化事件-标签
                this.secondInputerDisplay = false;
                this.auto = false;
                this.valueType = 'memberLabel';
                this.thirdInputerDisplay = true;
            }
            // this.$emit('update:settings', [this.settings[0], e]);
            switch (this.settingsEmu[0].operator) {
                case 'email':
                case 'mobile':
                case 'mms':
                case 'form':
                case 'wechat':
                case 'label':
                case 'wecom':
                    this.$emit('update:settingsObj', {
                        operatorType: this.settingsEmu[0].operator,
                        operator: e.operator
                    });
                    break;
                case 'custom':
                    // 自定义事件只有一级，选择结束
                    this.$emit('update:settingsObj', {
                        operatorType: this.settingsEmu[0].operator,
                        value: e.name
                    });
                    break;
                // 属性变化事件，增加fieldType判断二级选框类型
                case 'attribute_change':
                    this.$emit('update:settingsObj', {
                        operatorType: this.settingsEmu[0].operator,
                        operator: e.operator,
                        fieldType: e.fieldType,
                        fieldName: e.field
                    });
                    break;
                case 'computational_engine_event':
                    this.$emit('update:settingsObj', {
                        operatorType: this.settingsEmu[0].operator,
                        operator: e.operator,
                    });
                    break;
                case 'miniprogram':
                    this.$emit('update:settingsObj', {
                        operatorType: this.settingsEmu[0].operator,
                        operator: e.operator
                    });
                    break;
            }
            this.settingsEmu = [this.settingsEmu[0], e];
            this.$nextTick(() => {
                if (this.settingsEmu[0].operator !== 'custom') {
                    this.restoreEventOptions();
                }
            });
        },
        // 二级关系符选框
        selectEventHandler (e) {
            let tempSettings = cloneDeep(this.settingsEmu);
            tempSettings = tempSettings.slice(0, 2);
            tempSettings.push(e);
            if (!e.auto) {
                // this.$emit('update:settingsObj', tempSettings);
                this.settingsEmu = tempSettings;
            }
            if (e.limitSize === 1) {
                if (e.operator === '_表单分组列表') {
                    if (!e.auto) {
                        this.$emit('update:settingsObj', {
                            operatorType: this.settingsObj.operatorType,
                            operator: this.settingsObj.operator,
                            formGroupId: e.id,
                        });
                    }
                    this.selectPaperListHandler(e.id);
                } else if (e.operator === 'wechat_list' && this.settingsObj.operator === 'wx_scan') {
                    if (!e.auto) {
                        this.$emit('update:settingsObj', {
                            operatorType: this.settingsObj.operatorType,
                            operator: this.settingsObj.operator,
                            appId: '',
                            value: ''
                        });
                    }
                    this.thirdInputerDisplay = false;
                    this.getQuickMarkListRequest();
                } else if (['eq', 'ne', 'in', 'nin', 'exists', 'gt', 'lt', 'belong', 'nbelong'].includes(e.operator)) {
                    this.auto = e.auto;
                    if (!e.auto) {
                        this.settingsEmu = this.settingsEmu.slice(0, 2);
                        this.$emit('update:settingsObj', {
                            operatorType: this.settingsObj.operatorType,
                            operator: this.settingsObj.operator,
                            fieldType: this.settingsObj.fieldType,
                            fieldName: this.settingsObj.fieldName,
                            contactFieldOperator: e.operator
                        });
                    }
                    this.valueType = e.operator === 'belong' ? 'belong' : (e.operator === 'nbelong' ? 'nbelong' : `eventInputer-${new Date().getTime()}`);
                    this.thirdInputerDisplay = true;
                } else if (e.labelType) {
                    this.auto = false;
                    this.valueType = new RegExp('粉丝|follower', 'i').test(e.name) ? 'fanLabel' : 'memberLabel';
                    this.thirdInputerDisplay = true;
                    this.$emit('update:settingsObj', {
                        operatorType: this.settingsObj.operatorType,
                        operator: this.settingsObj.operator,
                        labelType: e.labelType,
                        value: this.settingsObj.value || []
                    });
                } else if (e.operator === 'currentRelativeTime') {
                    this.auto = false;
                    this.valueType = 'relativeTime';
                    this.thirdInputerDisplay = true;
                    this.$emit('update:settingsObj', {
                        operatorType: this.settingsObj.operatorType,
                        operator: this.settingsObj.operator,
                        fieldType: this.settingsObj.fieldType,
                        fieldName: this.settingsObj.fieldName,
                        contactFieldOperator: e.operator
                    });
                }
            } else if (e.limitSize === 2) {
                if (e.operator === 'range') {
                    this.auto = false;
                    this.valueType = 'eventRange';
                    this.thirdInputerDisplay = true;
                } else if (e.operator === 'absoluteTime') {
                    this.auto = false;
                    this.valueType = 'absoluteTime';
                    this.thirdInputerDisplay = true;
                }
                this.$emit('update:settingsObj', {
                    operatorType: this.settingsObj.operatorType,
                    operator: this.settingsObj.operator,
                    fieldType: this.settingsObj.fieldType,
                    fieldName: this.settingsObj.fieldName,
                    contactFieldOperator: e.operator
                });
            } else if (!e.limitSize) {
                // 最多只有二级选项的类别
                this.thirdInputerDisplay = false;
                if (['wx_subscribe', 'wx_unsubscribe', 'wx_click_menu', 'wx_reply_message'].includes(this.settingsObj.operator)) {
                    this.$emit('update:settingsObj', {
                        operatorType: this.settingsObj.operatorType,
                        operator: this.settingsObj.operator,
                        appId: e.id
                    });
                } else if (e.operator === 'exists') {
                    this.$emit('update:settingsObj', {
                        operatorType: this.settingsObj.operatorType,
                        operator: this.settingsObj.operator,
                        fieldType: this.settingsObj.fieldType,
                        fieldName: this.settingsObj.fieldName,
                        contactFieldOperator: e.operator
                    });
                } else if (['wecom_employee_add_contact', 'wecom_contact_delete_employee', 'wecom_add_group', 'wecom_scan_code'].includes(this.settingsObj.operator)) {
                    //企业微信相关
                    this.$emit('update:settingsObj', {
                        operatorType: this.settingsObj.operatorType,
                        operator: this.settingsObj.operator,
                        value: e.id
                    });
                    this.hideWecomList();
                } else if (e.operator === 'scoring_list') {
                    this.$emit('update:settingsObj', {
                        operatorType: this.settingsObj.operatorType,
                        operator: this.settingsObj.operator,
                        value: e.id
                    });
                } else if (['micropage_enter','micropage_share'].includes(this.settingsObj.operator)){
                    this.$emit('update:settingsObj', {
                        operatorType: this.settingsObj.operatorType,
                        operator: this.settingsObj.operator,
                        value: e.id
                    });
                    this.hideWecomList();
                } else {
                    this.$emit('update:settingsObj', {
                        operatorType: this.settingsObj.operatorType,
                        operator: this.settingsObj.operator,
                        taskId: e.id
                    });
                }
            }
            if (!e.noEmit) {
                // this.$emit('update:settings', tempSettings);
                this.settingsEmu = tempSettings;
            }
            this.updateSummary();
        },
        //粉丝标签公众号选框
        wechatHandler (e) {
            this.settingsEmu[3] = {
                errMsg: '',
                name: [],
                operator: 'fanLabel',
                value: ''
            };
            this.$emit('update:settingsObj', {
                operatorType: this.settingsObj.operatorType,
                operator: this.settingsObj.operator,
                labelType: this.settingsObj.labelType,
                value: '',
                appId: e.id
            });
            //根据公众号加载粉丝标签列表
            let account = this.otherOptions.wechat.filter(item => item.id === e.id)[0];
            let mainAccount = this.roleId === 0 || this.roleId === ''; // 主账号
            let sub = this.masterWechat.find(item => {
                return item.value === e.id;
            });
            if (account && sub) {
                this.wechatId = sub.wechatId;
                this.fanLabelApp = e.id;
                this.fanLabelAppName = account.name;
            } else if (this.writable) {
                this.$toast(this.$t(mainAccount ? 'controller.invalidCondition' : 'controller.permissionDenied'), 'warn');
            }
        },
        // 清空二级选项
        clearSecondSelector () {
            this.wecomKeyWord = '';
            this.eventId = '';
            this.eventOptions = [];
        },
        // 清空三级选项
        clearThirdInput () {
            if (this.thirdInputerDisplay) {
                this.$refs.thirdInputer.reset();
                this.thirdInputerDisplay = false;
            }
        },
        // 填充[事件选择器]父级选项
        optionTypeDecition (data) {
            this.clearSecondSelector();
            this.secondInputerDisplay = false;
            this.clearThirdInput();
            if (data) {
                let e = data.filterOperator.eventTrigger;
                e[0].child = e[0].child.slice(0, 5); // 削除微信事件的[收到模板消息，收到客服消息]
                switch (this.optionType) {
                    case 'newJourneyEvent':
                        this.parentMenu = e;
                        break;
                    case 'newJourneyAttr':
                        this.parentMenu = data.filterOperator.eventChange;
                        break;
                    case EVENT_CONDITION_CONTROLLER:
                        this.parentMenu = data.filterOperator.eventCommon
                            .concat(data.filterOperator.eventChange);
                        break;
                    default:
                        logError(`[营销旅程] <event-modal /> 出现了无法处理的类型{optionType: ${this.optionType}} :240`);
                        break;
                }
            }
        },
        restoreDisplay () {
            // 高亮父级选项
            for (let index in this.parentMenu) {
                if (this.parentMenu.hasOwnProperty(index)) {
                    if (this.settingsObj.operatorType === this.parentMenu[index].operator) {
                        this.parentId = index;
                        break;
                    }
                }
            }
            // let account = this.otherOptions.wechat.filter(item => item.id === this.settingsObj.appId)[0];
            // let mainAccount = this.roleId === 0 || this.roleId === ''; // 主账号

            // 填充子级选项
            switch (this.settingsObj.operatorType) {
                case 'email':
                case 'mobile':
                case 'mms':
                case 'form':
                case 'label':
                case 'wecom':
                    this.childMenu = this.settingsEmu[0].child;
                    break;
                case 'wechat':
                    this.childMenu = this.settingsEmu[0].child;
                    /*TODO 详见http://jira.qdum.com/browse/DMARTECH-7036备注：暂不提示 */
                    // if (account) {
                    //     this.childMenu = this.settingsEmu[0].child;
                    // } else {
                    //     this.$toast(this.$t(mainAccount
                    //         ? 'controller.unboundAccount'
                    //         : 'controller.permissionDenied'), 'warn');
                    // }
                    break;
                case 'custom':
                case 'attribute_change':
                    this.childMenu = this.otherOptions[this.settingsObj.operatorType];
                    break;
            }
            // 高亮子级
            if (!this.settingsEmu.contactFieldOperator || this.settingsEmu.contactFieldOperator !== 'exists') {
                for (let index in this.childMenu) {
                    if (this.settingsEmu[1].operatorCn) {
                        if (this.settingsEmu[1].operatorCn === this.childMenu[index].operatorCn) {
                            this.childName = this.childMenu[index].operatorCn;
                            break;
                        }
                    }
                    if (this.settingsEmu[1].fieldCn) {
                        if (this.settingsEmu[1].fieldCn === this.childMenu[index].fieldCn) {
                            this.childName = this.childMenu[index].fieldCn;
                            break;
                        }
                    }
                }
            }
            // 填充第三级选项，回显选选中项目
            if (this.settingsEmu[1].field === 'label_ids') {
                // 属性变化事件中的标签
                this.secondInputerDisplay = false;
                this.auto = false;
                this.valueType = 'memberLabel';
                this.eventId = '';
                this.thirdInputerDisplay = true;
            } else if (this.settingsEmu[2]) {
                this.secondInputerDisplay = true;
                this.eventId = this.settingsEmu[2].id;
                this.restoreEventOptions();
                if (this.settingsEmu[2].operator !== '_表单分组列表') {
                    this.selectEventHandler(Object.assign({}, this.settingsEmu[2], { auto: true, noEmit: true }));
                } else {
                    this.selectPaperListHandler(this.settingsEmu[2].id);
                }
            } else if (this.settingsObj.operatorType !== 'custom') {
                this.secondInputerDisplay = true;
                this.eventId = '';
                // console.warn('[Error-monitoring] The second selector has no value, please confirm whether it is a custom event;');
            }
        },
        restoreEventOptions () {
            switch (this.settingsObj.operatorType) {
                case 'email':
                case 'mobile':
                case 'mms':
                case 'form':
                    this.eventOptions = this.otherOptions[this.settingsObj.operatorType];
                    break;
                case 'wechat':
                    if (['wx_subscribe', 'wx_unsubscribe', 'wx_click_menu', 'wx_reply_message'].includes(this.settingsObj.operator)) {
                        this.eventOptions = this.otherOptions['wechat'];
                    } else if (['wx_template_news', 'wx_customer_news', 'wx_scan'].includes(this.settingsObj.operator)) {
                        this.eventOptions = this.otherOptions[this.settingsObj.operator];
                    }
                    break;
                case 'label':
                    this.eventOptions = this.labelOptions;
                    break;
                case 'attribute_change':
                    if (this.settingsObj.fieldType === 1) {
                        this.eventOptions = this.otherOptions['str'];
                    } else if (this.settingsObj.fieldType === 2 || this.settingsObj.fieldType === 6) {
                        this.eventOptions = this.otherOptions['num'];
                    } else if (this.settingsObj.fieldType === 3) {
                        this.eventOptions = this.otherOptions['dat'];
                    } else if (this.settingsObj.fieldType === 4) {
                        this.options = this.otherOptions['memberLabel'];
                    }
                    break;
                case 'wecom':
                    this.eventOptions = this.otherOptions[this.settingsObj.operator];
                    break;
                case 'computational_engine_event':
                    this.eventOptions = this.otherOptions[this.settingsObj.operatorType];
                    break;
                case 'miniprogram':
                    this.eventOptions = this.otherOptions[this.settingsObj.operator];
                    break;

            }
            this.secondInputerDisplay = (this.settingsObj.operatorType !== 'attribute_change' || this.settingsObj.fieldType !== 4);
        },
        // 错误监控
        validateChildForm (e) {
            let parent = ['email', 'mobile', 'mms', 'wechat', 'form', 'label'].includes(e.operator) && !e.child.length;
            if (parent) {
                this.thirdInputerDisplay = false;
                this.auto = false;
                this.valueType = '';
                this.eventOptions = [];
                this.eventId = '';
                console.warn('错误监控: 该项数据不完整');
                return false;
            }
            return true;
        },

        // 回显名称map
        operatorCommonHandler (list) {
            return list.map((i) => {
                i.name = i.operatorCn;
                return i;
            });
        },
        // 自定义事件选项map otherOptions[6]
        customerFieldHandler (data) {
            this.otherOptions['attribute_change'] = data.customerFieldList.map((i) => {
                i.operator = 'contactField';
                i.name = this.lang ? i.fieldCn : i.nameEn;
                i.fieldCn = this.lang ? i.fieldCn : i.nameEn;
                i.limitType = 0;
                i.limitSize = 1;
                return i;
            });
        },
        // 公众号选项map
        subscriptionListHandler (data) {
            this.otherOptions['wechat'] = [];
            this.otherOptions['wx_scan'] = [];
            data.authorizerInfoList.forEach(e => {
                this.otherOptions['wechat'].push({
                    id: e.value,
                    value: e.value,
                    name: e.operatorCn,
                    limitSize: 0,
                    operator: e.operator
                });
                this.otherOptions['wx_scan'].push({
                    id: e.value,
                    value: e.value,
                    name: e.operatorCn,
                    limitSize: 1,
                    operator: e.operator
                });
            });
        },
        // 表单分组列表map
        FormRequestHandler (data) {
            this.otherOptions['form'] = data.paperGroups.map((i) => {
                i.operator = '_表单分组列表';
                i.limitSize = 1;
                i.limitType = 1;
                return i;
            });
        },
        // 自定义事件列表map
        EventRequestHandler (data) {
            let eventList = data.contactEvnentsDTO.map(e => {
                if (!e.isPreset) {
                    return {
                        operatorCn: this.lang ? e.nameCn : e.nameEn,
                        value: e.name,
                        id: e.id,
                        operator: 'value',
                        name: e.name
                    };
                }
            });
            this.otherOptions['custom'] = deleteEmptyInArray(eventList);
        },
        // 获取当前分组下的表单列表
        selectPaperListHandler (id) {
            QuestionnaireApiV1
                .getFormListNoPage(id)
                .then(res => {
                    if (res.body.data && res.body.data.papers) {
                        // 正常或者已发布状态的表单可以进行选择2,6,7：标准（华为）开始的表单
                        this.options = res.body.data.papers.filter(paper => {
                            if (paper.status === 2 || paper.status === 6 || paper.status === 7) {
                                paper.name = paper.paperName;
                                return true;
                            }
                            return false;
                        });
                        this.$nextTick(() => {
                            if (this.settingsObj.value) {
                                let result = this.options.find(e => {
                                    return e.id === this.settingsObj.value;
                                });
                                if (typeof result === 'object') {
                                    result = {
                                        name: result.name,
                                        operator: 'value',
                                        value: result.id
                                    };
                                    this.settingsEmu.push(result);
                                    this.settingsCopy.name = result.name;
                                } else {
                                    this.settingsCopy.value = '';
                                }
                            }
                        });
                        this.auto = false;
                        this.valueType = 'eventSelector';
                        this.thirdInputerDisplay = true;
                    }
                });
        },
        // 选项map
        taskHandler (key, taskList) {
            this.otherOptions[key] = taskList.map((i) => {
                i.value = i.id;
                i.name = i.taskName;
                i.limitType = 0;
                i.operator = 'task_id';
                return i;
            });
        },
        //企业微信相关列表数据处理
        wecomDataHandler (key, taskList) {
            this.otherOptions[key] = taskList.length ? taskList.map((i) => {
                i.id = i.userId || i.chatId || i.id;
                i.name = i.value;
                return i;
            }) : [];
        },
        // 评分模型全部列表
        scoringAllModelListHandler(data){
            this.otherOptions['computational_engine_event'] = [];  
            data.scoreModelList.forEach(i => {
                this.otherOptions['computational_engine_event'].push({
                    id: i.id,
                    value: i.id,
                    operator: 'scoring_list',
                    name : i.name
                });
            });
        },
        // 微页面列表
        microPageListHandler(key,data){
            this.otherOptions[key] = data.list.length ? data.list.map(item=>{
                item.value = item.name;
                return item;
            }) : [];
        },
        //企业微信相关列表下拉框搜索
        wecomSearch (keyWord) {
            this.wecomKeyWord = keyWord;
            this.eventOptions = [];
            switch (this.settingsObj.operator) {
                case 'wecom_employee_add_contact':
                case 'wecom_contact_delete_employee':  //[13]企业微信员工列表
                    WecomApiV1
                        .getStaffListNoPage(1, this.wecomKeyWord).then(res => {
                            let list = res.body.data.staffList.filter(e => e.value !== '');
                            this.eventOptions = list.length ? list.map((i) => {
                                i.id = i.userId;
                                i.name = i.value;
                                return i;
                            }) : [];
                        });
                    break;
                case 'wecom_add_group':   //[14]企业微信群列表
                    WecomApiV1
                        .getWecomGroupList({ value: this.wecomKeyWord }).then(res => {
                            let list = res.body.data.groupList.filter(e => e.value !== '');
                            this.eventOptions = list.length ? list.map((i) => {
                                i.id = i.chatId;
                                i.name = i.value;
                                return i;
                            }) : [];
                        });
                    break;
                case 'wecom_scan_code':    //[15]企业微信活码列表
                    WecomApiV1
                        .getAllChannelCodeList({ keyword: this.wecomKeyWord }).then(res => {
                            let list = res.body.data.list.filter(e => e.value !== '');
                            this.eventOptions = list.length ? list.map((i) => {
                                i.name = i.value;
                                return i;
                            }) : [];
                        });
                    break;
            }
        },
        //企业微信相关下拉框关闭时，重置列表数据
        hideWecomList () {
            this.eventOptions = this.otherOptions[this.settingsObj.operator];
        },
        // 回显重新调整联系人标签分组结构this.groupData
        getGroupData (group) {
            if (group && group.length) {
                group.forEach(item => {
                    if (item.groupList && item.groupList.length) {
                        this.getGroupData(item.groupList);
                    }
                    this.groupData.push(item);
                });
            }
        },
        // 根据联系人标签分组结构this.groupData更新标签名称
        traverseList (e) {
            let name = '';
            for (let i = 0; i < this.groupData.length; i++) {
                let fItem = this.groupData[i].labelList.filter(sitem => e === sitem.id);
                if (fItem.length) {
                    name = fItem[0].name;
                    break;
                }
            }
            return name;
        },
        // 更新数据
        update (e) {
            this.settingsEmu = e;
            switch (e[0].operator) {
                case 'attribute_change':
                    if (e[2].operator === 'exists') {
                        this.$emit('update:settingsObj', {
                            operatorType: 'attribute_change',
                            operator: e[1].operator,
                            fieldType: e[1].fieldType,
                            fieldName: e[1].field,
                            contactFieldOperator: e[2].operator,
                        });
                    } else if (e[1].fieldType === 1 || e[1].fieldType === 2 || e[1].fieldType === 6 || e[2].operator === 'absoluteTime') {
                        this.$emit('update:settingsObj', {
                            operatorType: 'attribute_change',
                            operator: e[1].operator,
                            fieldType: e[1].fieldType,
                            fieldName: e[1].field,
                            contactFieldOperator: e[2].operator,

                            value: e[3].value
                        });
                    } else if (e[2].operator === 'currentRelativeTime') {
                        this.$emit('update:settingsObj', {
                            operatorType: 'attribute_change',
                            operator: e[1].operator,
                            fieldType: e[1].fieldType,
                            fieldName: e[1].field,
                            contactFieldOperator: e[2].operator,

                            value: e[3].value,
                            relativeType: e[3].relativeType
                        });
                    } else if (e[2].operator === 'memberLabel') {
                        this.$emit('update:settingsObj', {
                            operatorType: 'attribute_change',
                            operator: e[1].operator,
                            fieldType: e[1].fieldType,
                            fieldName: e[1].field,
                            // contactFieldOperator: e[2].operator,
                            value: e[2].value,
                        });
                    }
                    break;
                case 'wechat':
                    if (e[1].operator === 'wx_scan') {
                        this.$emit('update:settingsObj', {
                            operatorType: e[0].operator,
                            operator: e[1].operator,
                            appId: e[2].id, // 公众号appid
                            value: e[3].value //二维码id
                        });
                    }
                    break;
                case 'form':
                    this.$emit('update:settingsObj', {
                        operatorType: e[0].operator,
                        operator: e[1].operator,
                        formGroupId: e[2].id, // 表单分组id
                        value: e[3].value, // 表单id
                        name: e[3].name // 表单name
                    });
                    break;
                case 'label':
                    this.$emit('update:settingsObj', {
                        operatorType: e[0].operator,
                        operator: e[1].operator,
                        labelType: e[2].labelType, // 标签类型id
                        appId: e[2].labelType === 'fanLabel' ? this.fanLabelApp : '',
                        value: e[3].value // 标签id
                    });
                    break;
                default:
                    this.childMenu = e.child;
                    break;
            }
            this.$emit('update:errMsg', e[e.length - 1].errMsg);
            this.updateSummary();
        },
        invalidReset () {
            if (this.writable) {
                this.invalid = false;
                this.settingsEmu = [];
                this.$emit('update:settingsObj', {});
                this.$emit('update:errMsg', this.$t('controller.eventWarn'));
                this.$toast(this.$t('controller.invalidCondition'), 'warn');
            }
        }
    },
};

</script>
<style lang="scss">
@import "../../../../../../../common/scss/base/variables";
@import "../../../../../../../common/scss/base/mixin";

.event-modal {
    width: 100%;
    flex: 1;
    .event-modal-content {
        max-width: 415px;
        .tag-box {
            cursor: pointer;
            position: relative;
            line-height: $input-field-height - 2px;
            vertical-align: middle;

            .trigger {
                height: $input-field-height - 2px;
                padding: 0 $input-field-height - 2px 0 0.8em;
                border: 1px solid $form-border;
                border-radius: 4px;

                &.active {
                    border-color: $theme;
                }
            }

            .select-icon {
                height: $input-field-height - 2px;
                width: $input-field-height - 2px;
                position: absolute;
                top: 0;
                right: 0;
                color: $color-light-content;
                text-align: center;
            }

            .eventChoose {
                position: absolute;
                top: $input-field-height + 4px;
                left: 0;
                width: 100%;
                background-color: white;
                z-index: $index-menu - 1;
                border: 1px solid $border-color;
                border-radius: 4px;
                display: flex;

                .left {
                    width: 50%;
                    border-right: 1px solid $border-color;
                    // flex: 1;
                }

                .right {
                    flex: 1;
                    overflow-x: visible;
                    overflow-y: auto;
                    max-height: 352px;
                    display: inline-block;

                    .disabled {
                        color: $disabled;

                        &:hover {
                            background: $disabled-bg;
                        }
                    }
                    .search-box {
                        width: calc(100% - 2px);
                        margin: 0;
                        border-radius: 0;
                    }
                }

                p {
                    text-align: left;
                    padding: 0 16px;
                    height: 32px;
                    line-height: 32px;
                    @include ellipsis();

                    &:hover {
                        color: #ffffff;
                        background-color: $green;
                    }

                    &.choose {
                        color: #ffffff;
                        background-color: $green;
                    }
                }
            }
        }

        > .selector {
            width: 100%;
            margin-top: 16px;
        }
    }
}
</style>
