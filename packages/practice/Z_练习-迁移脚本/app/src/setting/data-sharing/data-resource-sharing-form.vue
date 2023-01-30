<template>
    <div class="data-sharing-form">
        <div class="content-view padding margin white-bg">
            <div class="create-title">
                {{($route.params.id && $route.params.id != 0) ? $t('sharing.editRule') : $t('sharing.addRule')}}
                <button type="button"
                        class="save-btn btn btn-md btn-theme"
                        @click="saveRule">
                    {{'common.save' | t}}
                </button>
            </div>
            <div class="create-content">
                <!-- 规则名称 -->
                <div class="field-group-label">{{'sharing.rulesName' | t}}</div>
                <div class="form-field">
                    <input class="input md"
                           type="text"
                           maxlength="100"
                           :class="{error: rulesNameErrorText}"
                           @click="rulesNameErrorText = ''"
                           v-title:top.warn.line="rulesNameErrorText"
                           v-model.trim="rulesName"
                           :placeholder="$t('sharing.enterRulesName')">
                    <switch-button v-model="openStatus"></switch-button>
                </div>
                <!-- 共享数据 -->
                <div class="field-group-label">{{'sharing.sharedSource' | t}}</div>
                <div class="form-field">
                    <!--过滤器-->
                    <div class="filter">
                        <div class="classify">
                            <div class="maybe" @click="switcherUser">
                                <span v-if="relation == 'and'">{{'common.and' | t}}</span>
                                <span v-if="relation == 'or'">{{'common.or' | t}}</span>
                            </div>
                            <template>
                                <div class="chooseBox">
                                    <div class="user">
                                        <span>{{'EnterPrise.enterSecurityGroups' | t}} / {{'EnterPrise.belongToDepartments' | t}}</span>
                                        <div class="add"
                                             v-if="obj.value.length < 4"
                                             @click="addCommodity(obj.value)">
                                            <i class="icon icon-tianjia"></i>
                                        </div>
                                    </div>
                                    <div class="choose"
                                         v-for="(value,cur) in obj.value" :key="cur">
                                        <div class="selectBox">
                                            <selector :options="optionRoleOrDepartment"
                                                      class="selector-l"
                                                      v-model="value.typeId"
                                                      @select="changefirstSel($event,cur)"></selector>
                                            <selector :options="optionYesOrNo"
                                                      class="selector-s"
                                                      v-model="value.include"
                                                      @select="changeSecondSel($event,cur)"></selector>
                                            <div class='input selectBox-input content-input'
                                                 @click="inputFocusFans(cur)" v-blur="cancelOpenFans"
                                                 v-if="value.typeId && value.include">
                                                <div class="value-item" v-for="(option,index) in value.ids"
                                                     :key="index">
                                                    {{option.cName}}
                                                    <button ref="button" tabindex="-1" class="icon icon-close"
                                                            @click.stop="delItemFans(option.id,cur)"></button>
                                                </div>
                                                <div class="keyword-input inputType">
                                                    <input ref="inputFans"
                                                           style='width:110px;position: absolute;z-index: -100;'
                                                           class='input-label'
                                                           @focus="openFans(value)" @keyup.delete="deleteSelectFans"
                                                           maxlength="0">
                                                </div>
                                                <transition name='drop'>
                                                    <div class='selector-group' v-show='value.isShowFansSelection'
                                                         :class="{'selector-content':roleList.length>0}">
                                                        <template v-if="value.typeId == '0'">
                                                            <span v-if='roleList.length===0'>{{'QRCode.noTags' | t}}</span>
                                                            <p v-for='(item, itemIndex) in roleModalList'
                                                               class='drop-down' :title="item.name" :key="itemIndex">
                                                                <checkbox :source="item" v-model="value.ids"
                                                                          :disabled="value.ids.length >= 4">&nbsp;&nbsp;{{item.cName}}
                                                                </checkbox>
                                                            </p>
                                                        </template>
                                                        <template v-if="value.typeId == '1'">
                                                            <span v-if='roleList.length===0'>{{'QRCode.noTags' | t}}</span>
                                                            <p v-for='(item, itemIndex) in departmentModalList'
                                                               class='drop-down' :title="item.name" :key="itemIndex">
                                                                <checkbox :source="item" v-model="value.ids"
                                                                          :disabled="value.ids.length >= 4">&nbsp;&nbsp;{{item.cName}}
                                                                </checkbox>
                                                            </p>
                                                        </template>
                                                    </div>
                                                </transition>
                                            </div>
                                            <span @click="delCommodity(cur)">
                                                <i class="icon icon-iconless"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
                <!-- 共享给 -->
                <!--安全组-->
                <template>
                    <p class="data-sharing-form field-group-label">{{'sharing.sharedTo' | t}}</p>
                    <p>{{'sharing.configDesc' | t}}</p>
                </template>
                <p class="field-group-label">{{'sharing.addSecurityGroups' | t}}</p>
                <div class="form-field flex">
                    <shuttle-box v-bind="shuttleInfo" v-model="selShareRoleList"/>
                </div>
                <div class="option-box">
                    <div class="links">
                        <ul class="links-view">
                            <li class="tab-link" v-for="source in allSourceist" :key="source.typeCode"
                                :class="{'active':curTab==source.typeCode}"
                                @click="changeTab(source.typeCode)">
                                {{`sharing.${typeNameMap[source.typeCode]}` | t}}
                            </li>
                        </ul>
                    </div>
                    <div class="option-table">
                        <div class="simplify-table" v-if="selShareRoleList && selShareRoleList.split(',').length > 0">
                            <table class="simplify-table-body">
                                <thead>
                                <tr>
                                    <td>{{'sharing.securityGrpups' | t}}</td>
                                    <td v-for="item in shareRuleToShowList[curTab]" :key="item.actionCode">
                                        {{`sharing.${item.showName}` | t}}
                                        <svg v-if="item.actionCode === 1004 || item.actionCode === 1005"
                                             class="check-swarm-icon pull-right"
                                             aria-hidden="true"
                                             v-title="$t('sharing.checkConditionsTip')">
                                            <use xlink:href="#icon-help"></use>
                                        </svg>
                                    </td>
                                    <!-- 表单共享数据权限表头，按目前需求不做配置，前端写死 -->
                                    <td v-if="curTab===3">
                                        {{`sharing.shareForm` | t}}
                                    </td>
                                    <!-- 邮件共享数据权限表头，按目前需求不做配置，前端写死 -->
                                    <td v-if="curTab===2">
                                        {{`sharing.shareEmail` | t}}
                                    </td>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="(shareToShowitem, shareToShowIndex) in shareToShowList"
                                    :key="shareToShowIndex">
                                    <td class="title-name" :title='shareToShowitem.cName'>{{shareToShowitem.cName}}</td>
                                    <td class="center-td" :title='`sharing.${item.showName}` | t'
                                        v-for="(item, index) in shareToShowitem.value[curTab]" :key="index"
                                        @click="changeSource(shareToShowIndex, index, item.actionCode)">
                                        <!-- 行内样式 禁止点击事件 =》 用于解决点击无效与多次响应问题。checkbox组件存在点击不能更改自身数据问题，待以后全局修复 -->
                                        <checkbox style="pointer-events:none"
                                                  :source="`${shareToShowIndex}${item.actionCode}`" v-model="item.sel"
                                                  v-if="test" @click.stop="changeSource(shareToShowIndex, index, item.actionCode)"/>
                                    </td>
                                    <!-- 表单共享数据权限表体，按目前需求不做配置，前端写死 -->
                                    <td class="center-td" :title='`sharing.shareForm` | t' v-if="curTab===3">
                                        <checkbox style="pointer-events:none" :disabled="true"/>
                                    </td>
                                    <!-- 邮件共享数据权限表体，按目前需求不做配置，前端写死 -->
                                    <td class="center-td" :title='`sharing.shareEmail` | t' v-if="curTab===2">
                                        <checkbox style="pointer-events:none" :disabled="true"/>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script type="text/babel">
    import { ResourceShareApi } from '@/api';
    // import { logError } from '../../monitor.js';
    import cascadingSelector from '../../customer/swarm/cascading-selector.vue';
    import ConfigureSecurity from './components/configure-security.vue';
    import {COMMON_NAME_REGEXP} from '../../common/utils/regs';
    import isEqual from 'lodash/isEqual';
    //接口目前无法根据请求头的语言参数返回对应语言表头,因此暂时手动映射
    const nameMap = {
        1001: 'editorialGrouping',
        1002: 'deleteGrouping',
        1003: 'editorialConditions',
        1004: 'checkGrouping',
        1005: 'checkConditions',
        1006: 'downloadCsv',
        1007: 'beginJourney',
        2001: 'editPalette',
        2002: 'previewMaterial',
        2003: 'reproductiveMaterial',
        2004: 'testMaterial',
        2005: 'deleteMaterial',
        2006: 'exportHTML',
        2007: 'moveMaterial',
        3001: 'viewTheForm',
        3002: 'editForm',
        3003: 'testForm',
        3004: 'viewStatistics',
        3005: 'downloadDetails',
        3006: 'sendData',
        3007: 'copyForm',
        3008: 'log',
        3009: 'startForm',
        3010: 'pauseForm',
        3011: 'delForm',
        3012: 'delData',
        3014: 'editData',
        3015: 'checkLink',
        3016: 'delCustomForm',
        3017: 'addCustomForm',
        3018: 'customizeForm',
        4001: 'editorialJourney',
        4002: 'reproductiveJourney',
        4003: 'suspensionOfTravel',
        4004: 'continueTheJourney', // 接口中已被废弃，原因不明
        4005: 'testJourney',
        4006: 'cancelTheJourney',
        4007: 'viewReports',
        4008: 'startTheJourney',
        4009: 'application',
        4010: 'approvalLog',
        4011: 'deleteTheJourney',
        4012: 'endOfTheTest',
        4013: 'testEndEditor',
        4014: 'approval',
        4015: 'withdraw',
        4016: 'checkJourney',
        4017: 'continueJourney',
        4018: 'test',
        5001: 'rename',
        5002: 'moveToGrouping',
        5003: 'journal',
        5004: 'delete',
        5005: 'editorialRules',
        5006: 'recalculation',
        5007: 'hideShow',
        6001: 'viewRecords',
        7001: 'editPalette',
        7002: 'viewPalette',
        7003: 'copyPalette',
        7004: 'movePalette',
        7005: 'delPalette'
    };
    const beforeLeave = new Map();
    const leaveAfter = new Map();
    export default {
        components: {
            cascadingSelector, ConfigureSecurity
        },
        data() {
            return {
                rulesName: '', //规则名
                openStatus: true, //开启状态
                rulesNameErrorText: '', //规则名报错提示
                obj: {title: 'sharing.groupNoEmpty', typeId: '', value: []},
                synced: false,//保存状态，用于路由钩子判断是否返回
                allSourceist: [],//当前列表
                allRoleList: [],//所有安全组列表
                testOne: [],
                relation: 'and',

                roleList: [],
                departmentList: [],

                roleModalList: [],

                departmentModalList: [],
                test: true,
                shareList: [],
                selShareRoleList: '',
                shareToShowList: [],//当前列表
                shareRuleToShowList: [],
                selIndex: -1,
                curTab: 1,
                optionRoleOrDepartment: [{id: '0', name: '安全组', value: '0'}, {id: '1', name: '部门', value: '1'}],//所有部门列表
                optionYesOrNo: [{id: '1', name: '是', value: '1'}],//所有部门列表
                isShowFansSelection: false,
                selShareList: [],
                // 共享权限tab国际化映射(临时)
                typeNameMap: {
                    1: 'segmentation',
                    2: 'content',
                    3: 'form',
                    4: 'journeys',
                    5: 'label',
                    6: 'formReportRecord',
                    7: 'headerFooter'
                }
            };
        },
        beforeRouteLeave(to, from, next) {
            let shareJsons = {};
            for (let i = 0; i < this.allSourceist.length; i++) {
                shareJsons[i + 1] = [];
            }
            this.shareToShowList.forEach(ele => {
                if (ele.value) {
                    Object.keys(ele.value)
                        .forEach(key => {
                            let selIds = [];
                            ele.value[key].forEach(item => {
                                if (item.sel === true) {
                                    selIds.push(item.actionCode);
                                }
                            });
                            shareJsons[key].push({
                                roleId: ele.id,
                                ids: selIds
                            });
                        });
                }
            });
            let filterJsons = {'role': [], 'department': [], 'relation': this.relation};
            for (let i of this.obj.value) {
                switch (i.typeId) {
                    case '0' :
                        filterJsons.role.push({
                            include: Number(i.include),
                            ids: i.ids.map(item => item.id)
                        });
                        break;
                    case '1' :
                        filterJsons.department.push({
                            include: Number(i.include),
                            ids: i.ids.map(item => item.id)
                        });
                        break;
                }
            }


            leaveAfter.set('shareJson', shareJsons)
                .set('filterJson', filterJsons)
                .set('selShareRoleList', this.selShareRoleList)
                .set('rulesName',  this.rulesName)
                .set('openStatus', this.openStatus);
            let shareJson = this.contrastArr(beforeLeave.get('shareJson'), leaveAfter.get('shareJson'));
            let filterJson = this.compareObj(beforeLeave.get('filterJson'), leaveAfter.get('filterJson'));
            let ShareRoleList = this.judgeResultFun(beforeLeave.get('selShareRoleList') ?  beforeLeave.get('selShareRoleList').split(',') : [''], leaveAfter.get('selShareRoleList').split(','));
            let ruleName = (beforeLeave.get('rulesName') ? beforeLeave.get('rulesName') : '') === leaveAfter.get('rulesName');
            let openStatu = (beforeLeave.get('openStatus') ? beforeLeave.get('openStatus') : true) === leaveAfter.get('openStatus');
            if (!this.synced) {
                if (ruleName && openStatu && ShareRoleList && filterJson && shareJson) {
                    next();
                } else {
                    this.$confirm(this.$t('sharing.leaveConfirm'), this.$t('sharing.leaveReminder'))
                        .then(sure => {
                            next(sure);
                        });
                }
            } else {
                next();
            }
        },
        watch: {
            'selShareRoleList'(val, oldval) {
                if (!oldval && val) {
                    const arr = [];
                    this.selShareRoleList.split(',')
                        .filter(item => {
                            const curItem = Object.assign(
                                {value: JSON.parse(JSON.stringify(this.shareRuleToShowList))},
                                // ps: the type of 'item' is String
                                this.roleList.find(roleItem => roleItem.id === ~~item));
                            if (curItem.cName) {
                                arr.push(curItem);
                            } else {
                                this.$toast(this.$t('sharing.errorNullShareItemToast'), 'warn');
                            }
                        });
                    this.shareToShowList = arr;
                } else if (!val) {
                    this.shareToShowList = [];
                } else {
                    let arrSel = val.split(',')
                        .filter(item => {
                            return oldval.split(',')
                                .indexOf(item) === -1;
                        });
                    let arrDel = oldval.split(',')
                        .filter(item => {
                            return val.split(',')
                                .indexOf(item) === -1;
                        });
                    const arr = [];
                    arrSel.filter(item => {
                        const curItem = Object.assign(
                            {value: JSON.parse(JSON.stringify(this.shareRuleToShowList))},
                            // item may String
                            /*eslint-disable-next-line*/
                            this.roleList.find(roleItem => roleItem.id == item));
                        arr.push(curItem);
                    });
                    for (let i of arrDel) {
                        // i may String
                        /*eslint-disable-next-line*/
                        this.shareToShowList = this.shareToShowList.filter(item => item.id != i);
                    }
                    this.shareToShowList = this.shareToShowList.concat(arr);
                }
            },
            'roleModalList'() {
                if (this.obj.value[this.selIndex] && this.obj.value[this.selIndex].idsSel) {
                    const arr = [];
                    this.obj.value[this.selIndex].idsSel.split(',')
                        .filter(item => {
                            // item may String
                            /*eslint-disable-next-line*/
                            const curItem = this.roleList.find(roleItem => roleItem.id == item);
                            arr.push(curItem);
                        });
                    this.obj.value[this.selIndex].ids = arr;
                }
            },
            'departmentModalList'() {
                if (this.obj.value[this.selIndex] && this.obj.value[this.selIndex].idsSel) {
                    const arr = [];
                    this.obj.value[this.selIndex].idsSel.split(',')
                        .filter(item => {
                            // item may String
                            /*eslint-disable-next-line*/
                            const curItem = this.departmentList.find(departmentItem => departmentItem.id == item);
                            arr.push(curItem);
                        });
                    this.obj.value[this.selIndex].ids = arr;
                }
            },
        },
        computed: {
            ruleId() {
                return this.$route.params.id;
            },
            shuttleInfo() {
                return {
                    titles: [this.$t('EnterPrise.allSecurityGroup'), this.$t('EnterPrise.selectSecurityGroup')],
                    dataList: this.shareList,
                    selectedVal: this.selShareRoleList,
                    fromPage: 'custom',
                    search: true,
                };
            },
        },
        async mounted() {
            await this.getAllRoleResourceShare();
            await this.getAllDepartmentResourceShare();
            await this.getShareTypeResourceShare();
            /*eslint-disable-next-line*/
            if (this.$route.params.id != 0) {
                await this.getRule();
            }
            await this.$loaded();
        },
        methods: {
            // 共享资源数据对比
            compareObj(obj1, obj2) {
                if (obj1) {
                    if (obj1.relation !== obj2.relation) return false;
                    if ((obj1.hasOwnProperty('department') && obj2.hasOwnProperty('department'))
                        && (obj1.hasOwnProperty('role') && obj2.hasOwnProperty('role'))) {
                        let a = isEqual(obj1.department, obj2.department);
                        let b = isEqual(obj1.role, obj2.role);
                        if (a && b) {
                            return true;
                        }
                        return false;
                    }
                    return false;
                }
                return true;
            },

            /**
             * @description: 对比顺序不同的两个数组元素是否相同
             * @param {array} arr1
             * @param {array} arr2
             * @return {boolean}
             */
            judgeResultFun(arr1, arr2) {
                let flag = true;
                if (arr1.length !== arr2.length) {
                    flag = false;
                } else {
                    arr1.forEach(item => {
                        if (arr2.indexOf(item) === -1) {
                            flag = false;
                        }
                    });
                }
                return flag;
            },
            // 下方权限列表数据对比
            contrastArr(arr1, arr2) {
                let boolarr = [];
                for (let item1 in arr1 ) {
                    arr1[item1].forEach((res) => {
                        if (Number(res.ids) === 0) {
                            res.ids = [];
                        }
                    });
                    for (let item2 in arr2) {
                        if (arr1[item1].length === arr2[item2].length) {
                            arr1[item1].forEach((res1) => {
                                arr2[item2].forEach((res2) => {
                                    if (item1 === item2) {
                                        if (res1.roleId === res2.roleId) {
                                            boolarr.push(isEqual(res1.ids, res2.ids));
                                        }
                                    }
                                });
                            });
                        } else {
                            return false;
                        }
                    }
                }
                if (boolarr.indexOf(false) > -1) {
                    return false;
                }
                return true;
            },
            cancelOpenFans() {
                for (let i of this.obj.value) {
                    i.isShowFansSelection = false;
                }
            },
            //粉丝标签点击时获取焦点
            inputFocusFans(index) {
                /*eslint-disable*/
                // this.obj.value[index].typeId some String some Number
                if (this.obj.value[index].typeId == '0' && this.obj.value[index].ids.length === this.roleModalList.length) {
                    this.cancelOpenFans();
                    return false;
                }
                if (this.obj.value[index].typeId == '1' && this.obj.value[index].ids.length === this.departmentModalList.length) {
                    this.cancelOpenFans();
                    return false;
                }
                if (this.obj.value[index].ids.length >= 4) {
                    if (this.obj.value[index].ids.length >= 4 && this.obj.value[index].typeId == 0) {
                        this.$toast(this.$t('sharing.errorLongHeightGroupToast'), 'warn');
                    } else if (this.obj.value[index].ids.length >= 4 && this.obj.value[index].typeId == 1) {
                        this.$toast(this.$t('sharing.errorLongHeightDepartmentToast'), 'warn');
                    }
                    this.cancelOpenFans();
                    return false;
                }
                if (this.$refs.inputFans[index].focus) {
                    this.$refs.inputFans[index].focus();
                } else {
                    this.$refs.inputFans[index].$el.focus();
                }
            },
            openFans(data) {
                data.isShowFansSelection = true;
            },


            delItemFans(index, cur) {
                this.obj.value[cur].ids = this.obj.value[cur].ids.filter(item => item.id != index);
            },
            // 获取共享类型列表
            async getShareTypeResourceShare() {
                await this.$loading();
                await ResourceShareApi
                    .getShareTypeResourceShare()
                    .then(res => {
                        // 此处接口返回的结构为 {body:{data:{sourceType:[{actionCode:0001,actionName:'foo'}]}}}
                        // actionName并不会跟随请求头的语言参数返回对应文本，永远是中文，因此表头显示名称由前端根据actionCode手动映射
                        this.allSourceist = res.body.data.sourceType;
                        this.shareToShowList = this.allSourceist;
                        let obj = {};
                        this.allSourceist.forEach(item => {
                            item.actionType = item.actionType.map(e => {
                                e.sel = false;
                                return e;
                            });
                            const actionTypeShow = item.actionType.map(ele => ({
                                actionCode: ele.actionCode,
                                showName: nameMap[ele.actionCode],
                                sel: ele.sel
                            }));
                            obj = Object.assign({[item.typeCode]: actionTypeShow}, obj);
                        });
                        this.shareRuleToShowList = obj;
                        if (this.$route.query.id == 0) {
                            this.$loaded();
                        }
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 获取所有部门
            async getAllDepartmentResourceShare() {
                await this.$loading();
                await ResourceShareApi
                    .getAllDepartmentResourceShare()
                    .then(res => {
                        this.departmentList =
                            res.body.data.departmentList.map(item => {
                                item.sel = false;
                                item.cName = item.name;
                                return item;
                            });
                        this.departmentModalList = JSON.parse(JSON.stringify(this.departmentList));
                        if (this.$route.query.id == 0) {
                            this.$loaded();
                        }
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 获取所有安全组
            async getAllRoleResourceShare() {
                await this.$loading();
                await ResourceShareApi
                    .getAllRoleResourceShare()
                    .then(res => {
                        this.roleList = res.body.data.allRoleList.map(item => {
                            item.sel = false;
                            return item;
                        });
                        this.roleModalList = JSON.parse(JSON.stringify(this.roleList));
                        this.shareList = JSON.parse(JSON.stringify(this.roleList));
                        if (this.$route.query.id == 0) {
                            this.$loaded();
                        }
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 添加选项
            addCommodity(value) {
                if (value.length < 4) {
                    value.push({
                        'isShowFansSelection': false,
                        'include': '',
                        'ids': [],
                        'idsSel': '',
                        'typeId': ''
                    });
                }
            },
            // 变更第一选择项
            changefirstSel(value, cur) {
                // 不能多次连续选择同一类别
                if (this.obj.value.length >= 3) {
                    const roleValue = this.obj.value.filter(item => item.typeId.length > 0 && item.typeId === '0');
                    const departmentValue = this.obj.value.filter(item => item.typeId.length > 0 && item.typeId === '1');
                    if (roleValue.length > 2 || departmentValue.length > 2) {
                        this.$toast(this.$t('sharing.errorRepeatToast'), 'warn');
                        this.obj.value.splice(cur, 1);
                    }
                    return false;
                }
                this.obj.value[cur].typeId = value.id;
                this.obj.value[cur].ids = [];
            },
            // 切换与或非
            switcherUser() {
                switch (this.relation) {
                    case 'and':
                        this.relation = 'or';
                        break;
                    case 'or':
                        this.relation = 'and';
                        break;
                }
            },
            // 变更第二选择项
            changeSecondSel(value) {
                this.obj.value.include = value.id;
            },
            changeSource(index, selfIndex, actionCode) {
                this.shareToShowList[index].value[this.curTab][selfIndex].sel =
                    !this.shareToShowList[index].value[this.curTab][selfIndex].sel;
                // 优化DMARTECH-3850逻辑： 原逻辑根据位置判断目标 改为根据actionCode判断
                // actionCode 1001: 编辑分群, 1004: 查看分群,
                //            2001: 编辑素材, 2002: 预览素材,
                //            3002: 编辑表单, 3001: 查看表单,
                //            4016: 查看旅程, 4001: 编辑旅程, 4008: 开启旅程
                if ([1001, 1004, 2001, 2002, 3002, 3001, 4001, 4008, 4016].includes(actionCode)) {
                    let linkageCodes = [
                        [1001, 1004],
                        [2001, 2002],
                        [3002, 3001],
                        [4001, 4016],
                        [4008, 4001],
                        [4008, 4016]
                    ];
                    linkageCodes.forEach(cur => {
                        this.linkage(index, selfIndex, cur[1], cur[0], false, false);
                        this.linkage(index, selfIndex, cur[0], cur[1], true, true);
                    });
                }
                this.test = false;
                this.$nextTick(function () {
                    this.test = true;
                });
            },
            changeTab(data) {
                this.curTab = data;
            },
            // 校验
            valid() {
                this.rulesNameErrorText = '';
                if (this.rulesName === '') {
                    this.rulesNameErrorText = this.$t('sharing.nameNoEmpty');
                    return false;
                } else if (!COMMON_NAME_REGEXP.test(this.rulesName)) {
                    this.rulesNameErrorText = this.$t('sharing.ruleNameReg');
                    return false;
                } else if (this.obj.value.filter(item => item.typeId && item.typeId == '0' && !item.include).length > 0) {
                    this.$toast(this.$t('sharing.groupNoEmpty'), 'warn');
                    return false;
                } else if (this.obj.value.filter(item => item.typeId && item.typeId == '0' && item.include.length == 0).length > 0) {
                    this.$toast(this.$t('sharing.groupNoEmpty'), 'warn');
                    return false;
                } else if (this.obj.value.filter(item => item.typeId && item.typeId == '0' && item.ids.length == 0).length > 0) {
                    this.$toast(this.$t('sharing.groupNoEmpty'), 'warn');
                    return false;
                } else if (this.obj.value.filter(item => item.typeId && item.typeId == '1' && item.include.length == 0).length > 0) {
                    this.$toast(this.$t('sharing.editDepartment'), 'warn');
                    return false;
                } else if (this.obj.value.filter(item => item.typeId && item.typeId == '1' && !item.include).length > 0) {
                    this.$toast(this.$t('sharing.editDepartment'), 'warn');
                    return false;
                } else if (this.obj.value.filter(item => item.typeId && item.typeId == '1' && item.ids.length == 0).length > 0) {
                    this.$toast(this.$t('sharing.editDepartment'), 'warn');
                    return false;
                } else if (this.obj.value.filter(item => item.typeId && item.typeId == '0' && item.ids.length == 0).length > 0) {
                    this.$toast(this.$t('sharing.groupNoEmpty'), 'warn');
                    return false;
                } else if (this.obj.value.length == 0) {
                    this.$toast(this.$t('sharing.groupNoEmpty'), 'warn');
                    return false;
                } else if (this.obj.value.filter(item => item.ids.length == 0).length > 0) {
                    this.$toast(this.$t('sharing.groupNoEmpty'), 'warn');
                    return false;
                } else if (this.shareToShowList.length == 0 || this.shareToShowList[0].typeCode) {
                    // 需要产品提供中英文 文案
                    this.$toast('共享给安全组不能为空', 'warn');
                    return false;
                } else if (this.obj.value.filter(item => item.typeId && item.typeId == '1' && item.ids.length == 0).length > 0) {
                    this.$toast(this.$t('sharing.editDepartment'), 'warn');
                    return false;
                }
                return true;
            },
            saveRule() {
                if (this.valid()) {
                    this.$nextTick(() => {
                        this.$loading();
                        let filterJson = {'role': [], 'department': [], 'relation': this.relation};
                        for (let i of this.obj.value) {
                            switch (i.typeId) {
                                case '0' :
                                    filterJson.role.push({
                                        include: i.include,
                                        ids: i.ids.map(item => item.id)
                                    });
                                    break;
                                case '1' :
                                    filterJson.department.push({
                                        include: i.include,
                                        ids: i.ids.map(item => item.id)
                                    });
                                    break;
                            }
                        }
                        let shareJson = {};
                        for (let i = 0; i < this.allSourceist.length; i++) {
                            shareJson[i + 1] = [];
                        }
                        this.shareToShowList.forEach(ele => {
                            if (ele.value) {
                                Object.keys(ele.value)
                                    .forEach(key => {
                                        let selIds = [];
                                        ele.value[key].forEach(item => {
                                            if (item.sel == true) {
                                                selIds.push(item.actionCode);
                                            }
                                        });
                                        shareJson[key].push({
                                            roleId: ele.id,
                                            ids: selIds
                                        });
                                    });
                            }
                        });
                        ResourceShareApi
                            .saveRulesResourceShare({
                                filterJson: JSON.stringify(filterJson),
                                shareJson: JSON.stringify(shareJson),
                                id: parseInt(this.ruleId),
                                name: this.rulesName,
                                openStatus: this.openStatus,
                            })
                            .then(() => {
                                this.$loaded();
                                if (this.$route.params.id == 0) {
                                    this.$toast(this.$t('common.saveSuccess'), 'success');
                                } else {
                                    this.$toast(this.$t('common.updateSuccess'), 'success');
                                }
                                this.synced = true;
                                this.$router.replace({
                                    name: 'dataSharing',
                                    params: {tab: 2},
                                    query: {
                                        tabbar: 2,
                                        curPage: this.$route.query.curPage,
                                        keyWords: this.$route.query.keyWords
                                    }
                                });
                            })
                            .catch(() => {
                                this.$loaded();
                            });
                    });
                }
            },
            //编辑时获取单条规则详情
            getRule() {
                this.$loading();
                let toastKey = true;
                ResourceShareApi
                    .getRulesResourceShare(this.$route.params.id)
                    .then(res => {
                        let data = res.body.data;
                        if (data.id) {
                            this.rulesName = data.name;
                            this.openStatus = data.openStatus;
                            this.relation = JSON.parse(data.filterJson).relation;
                            beforeLeave.set('filterJson', JSON.parse(data.filterJson))
                                .set('shareJson', JSON.parse(data.shareJson))
                                .set('rulesName',  data.name)
                                .set('openStatus', data.openStatus);
                            for (let i of JSON.parse(data.filterJson).role) {
                                const arr = [];
                                // TODO: not clear
                                // eslint-disable-next-line no-loop-func
                                i.ids.filter(item => {
                                    const curItem = this.roleList.find(roleItem => roleItem.id == item);
                                    if (curItem) {
                                        arr.push(curItem);
                                    } else if (toastKey) {
                                        this.$toast(this.$t('sharing.errorNullRuleItemToast'), 'warn');
                                        toastKey = false;
                                    }
                                });
                                const data = {
                                    'isShowFansSelection': false,
                                    'include': '1',
                                    'ids': arr,
                                    'idsSel': i.ids,
                                    'typeId': '0'
                                };
                                this.obj.value.push(data);
                            }
                            for (let i of JSON.parse(data.filterJson).department) {
                                const arr = [];
                                // TODO: not clear
                                // eslint-disable-next-line no-loop-func
                                i.ids.filter(item => {
                                    const curItem = this.departmentList.find(roleItem => roleItem.id == item);
                                    if (curItem) {
                                        arr.push(curItem);
                                    } else if (toastKey) {
                                        this.$toast(this.$t('sharing.errorNullRuleItemToast'), 'warn');
                                        toastKey = false;
                                    }
                                });
                                const data = {
                                    'isShowFansSelection': false,
                                    'include': '1',
                                    'ids': arr,
                                    'idsSel': i.ids,
                                    'typeId': '1'
                                };
                                this.obj.value.push(data);
                            }
                            Object.keys(JSON.parse(data.shareJson))
                                .forEach(key => {
                                    JSON.parse(data.shareJson)[key].forEach(i => {
                                        this.selShareRoleList = this.selShareRoleList.length == 0 ? i.roleId.toString() : `${this.selShareRoleList},${i.roleId}`;
                                    });
                                });
                            this.selShareRoleList = Array.from(new Set(this.selShareRoleList.split(',')))
                                .toString();
                                beforeLeave.set('selShareRoleList', this.selShareRoleList);
                            this.$nextTick(function () {
                                this.selShareList = this.shareList.filter(item => {
                                    return this.selShareRoleList.split(',')
                                        .includes(item.id.toString());
                                });

                                Object.keys(JSON.parse(data.shareJson))
                                    .forEach(key => {
                                        JSON.parse(data.shareJson)[key].forEach(i => {
                                            this.shareToShowList.find(item => {
                                                if (item.id == i.roleId) {
                                                    i.ids.forEach(j => {
                                                        item.value[key].find(valueIds => {
                                                            if (valueIds.actionCode == j) {
                                                                valueIds.sel = true;
                                                            }
                                                        });
                                                    });
                                                }
                                            });
                                        });
                                    });
                            });
                        }
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            delCommodity(cur) {
                this.obj.value.splice(cur, 1);
            },
            /**
             * @param index { Number } 所在安全组序位
             * @param selfIndex { Number } 所在权限列序位
             * @param sourceCode { Number } 操作源code
             * @param optCode { Number } 关联动作code
             * @param source { Boolean } 操作源动作
             * @param opt { Boolean } 关联动作
             * @description 勾选checkbox处理特殊关联
             */

            linkage(index, selfIndex, sourceCode, optCode, source, opt) {
                let target = this.shareToShowList[index].value[this.curTab];
                if (target[selfIndex].actionCode === sourceCode && target[selfIndex].sel === source) {
                    let checkIndex = target.findIndex(e => e.actionCode === optCode);
                    this.shareToShowList[index].value[this.curTab][checkIndex].sel = opt;
                }
            }
        },
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .data-sharing-form {
        .content-view {
            min-width: 1200px;
            overflow-x: hidden;
        }

        .create-title {
            font-size: 16px;
            height: 48px;
            line-height: 48px;
            padding: 0 20px;
            border: 1px solid #e4e9ed;
            position: relative;

            .save-btn {
                position: absolute;
                right: 20px;
                top: 9px;
            }
        }

        .create-content {
            width: 1080px;
            margin: auto;
            padding-top: 50px;
            @include box-sizing();
        }

        .save {
            margin: 32px 0;
            text-align: center;
        }

        .field-group-label {
            font-size: 14px;
            font-weight: bold;
            // padding-left: 65px;
            margin-top: 2em;
            margin-bottom: 1em;
        }

        .configure-security {
            // margin-left: 126px;
            .btn + .btn {
                margin-left: 0px;
            }

            .btn-content {
                margin-top: 30px;
            }

            .security-item {
                cursor: pointer;
            }
        }

        .filter {
            margin-bottom: 30px;

            .classify {
                position: relative;
                border-left: 1px #cccccc solid;

                .just {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    text-align: center;
                    line-height: 22px;
                    margin-left: -12px;
                    margin-top: -12px;
                    @include border-radius(5px);
                    background-color: #cccccc;
                    color: #ffffff;
                    width: 24px;
                    height: 24px;
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

                &:before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 21px;
                    height: 1px;
                    background-color: #cccccc;
                }

                &:after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 21px;
                    height: 1px;
                    background-color: #cccccc;
                }

                .chooseBox {
                    background-color: #ffffff;
                    min-width: 610px;
                    max-width: 980px;
                    margin-left: 40px;
                    margin-bottom: 20px;
                    border: 1px #eeeeee solid;

                    .cascading-selection {
                        height: 32px;
                    }

                    .user {
                        min-width: 610px;
                        max-width: 980px;
                        background-color: #fafafa;

                        span {
                            display: inline-block;
                            padding: 13px 0px 13px 17px;
                        }

                        .add {
                            float: right;
                            padding: 13px 12px 13px 0;

                            .icon-tianjia {
                                color: #0cc2a9;
                                cursor: pointer;
                                font-size: 16px;
                            }
                        }

                        @include clearfix();
                    }

                    .choose {
                        margin: 10px 0 10px 30px;
                        position: relative;

                        .selectBox {
                            margin: 10px 0 0 30px;

                            .selector {
                                margin-right: 10px;
                            }

                            .icon-iconless {
                                font-size: 16px;
                                float: right;
                                padding-right: 12px;
                                cursor: pointer;
                            }

                            .label-selector {
                                width: 200px;

                                .select-list {
                                    max-height: 324px;
                                }
                            }

                            @include clearfix();
                        }


                    }

                    .count-1 {
                        border-left: 1px #cccccc solid;

                        &:before {
                            content: '';
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 21px;
                            height: 1px;
                            background-color: #cccccc;
                        }

                        &:after {
                            content: '';
                            position: absolute;
                            left: 0;
                            bottom: 0;
                            width: 21px;
                            height: 1px;
                            background-color: #cccccc;
                        }
                    }
                }
            }
        }

        .shuttle-content {
            overflow: hidden;
            display: flex;
            flex-direction: row;
            width: 466px;
            padding: 8px;
            border: solid 1px $select-border;
            @include border-radius(4px);
            background-color: #fff;

            .attribute-list {
                @include ellipsis();
                display: flex;
                flex-direction: column;
                flex: 3;

                .head {
                    line-height: 32px;
                    text-align: center;
                    background-color: $light-green;
                    color: #fff;
                    border-top-left-radius: 4px;
                    border-top-right-radius: 4px;
                }

                .select-list {
                    border-bottom-left-radius: 4px;
                    border-bottom-right-radius: 4px;
                    border-left: 1px solid $border-color;
                    border-right: 1px solid $border-color;
                    border-bottom: 1px solid $border-color;
                    max-height: $input-field-height * 8;
                    overflow: auto;

                    .option {
                        line-height: $input-field-height;
                        padding: 0 8px;

                        &:last-child {
                            margin-bottom: 0;
                        }

                        &:not(.disabled):hover {
                            background-color: $hover-bg;
                        }

                        &.disabled {
                            color: $disabled;
                            cursor: not-allowed;
                        }

                        .checkbox {
                            display: block;
                            @include ellipsis();
                        }
                    }
                }
            }

            .btn-content {
                display: flex;
                flex: 1;
                flex-direction: column;
                justify-content: space-evenly;
                align-items: center;

                .btn {
                    margin: 0;
                }
            }
        }

        .input {
            margin-right: 10px;
        }

        .links {
            flex-grow: 0;
            flex-shrink: 0;
            width: 160px;

            .links-view {
                .tab-link {
                    line-height: 32px;
                    font-size: 14px;
                    color: $color-light-content;
                    cursor: pointer;

                    &:hover {
                        color: $theme;
                    }

                    &.active {
                        color: $theme;
                    }
                }
            }
        }
    }

    .option-box {
        width: calc(100% - 30px);
        display: inline-flex;
        margin-top: 2em;

        .option-table {
            flex: 1;
            overflow-x: auto;
        }
    }

    .form-field {
        .privilege-input {
            width: 277px;
        }

        .privilege-textarea {
            width: 277px;
        }
    }

    .edit-modal {
        padding: 10px;
        background: #fff;
        position: absolute;
        z-index: 100;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .simplify-table {
        .simplify-table-body {
            width: auto;

            .title-name {
                max-width: 330px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            td {
                .check-swarm-icon {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                }
            }
        }
    }

    .icon-plus {
        color: #0cc2a9;
    }

    .selectBox-input {
        cursor: pointer;
        display: inline-block;
        min-width: 160px;
        height: 20px;

        .selector-group {
            background: #fff;
            width: 100%;
            max-height: 200px;
            overflow-y: scroll;
            border: 1px solid $border-color;
            border-radius: 4px;
        }
    }

    .option-title {
        display: inline-block;
        cursor: pointer;
    }

    .value-item {
        display: inline-block;
        border: 1px solid $purple;
        margin-right: 10px;
        padding-left: 5px;
        border-radius: 3px;
        cursor: pointer;
        white-space: nowrap;
        @include transition();
        background-color: #f2f0ff;
        color: $purple;

        &:hover {
            background-color: #dbd5fb;
        }

        button {
            padding: 0 3px;
            cursor: pointer;
            border: 1px solid transparent;
            line-height: 18px;
            border-bottom-right-radius: 3px;
            border-top-right-radius: 3px;
            color: $purple;
            background-color: transparent;
            @include transition();

            &:hover {
                background-color: #ef6266;
                color: white;
            }
        }
    }

    .center-td {
        text-align: center;
    }

    .inputType {
        position: relative;
        line-height: 18px;
        margin: 2px 0;

        .input-label {
            //background: red;
            width: 50px;
            border: 1px solid transparent;
            background-color: inherit;
            text-indent: 5px;
        }
    }

    .selector-group {
        position: absolute;
        left: 0;
        right: 0;
        min-height: $input-field-height;
        max-height: $input-field-height * 8;
        border: 1px solid $border-color;
        border-radius: 4px;
        top: $input-field-height + 4px;
        z-index: $index-menu - 1;
        background-color: #fff;
        overflow: auto;

        .drop-down {
            margin-left: 8px;
            display: block;
            height: $input-field-height;
            line-height: $input-field-height;

            .text-appended {
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }

    .content-input {
        min-width: calc(100% - 400px);
        display: inline-block;
        position: relative;
    }

    .selector-l {
        width: 145px;
    }

    .selector-s {
        width: 60px;
    }
</style>
