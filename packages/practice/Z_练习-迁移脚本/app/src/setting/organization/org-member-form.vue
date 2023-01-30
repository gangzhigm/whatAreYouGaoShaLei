<template>
    <div class="org-member-form">
        <div class="content-view padding margin white-bg">
            <div class="create-title">
                {{($route.params.id && $route.params.id != 0) ? $t('EnterPrise.edit') : $t('EnterPrise.addUser')}}
                <button type="button" class="save-btn btn btn-md btn-theme" @click="saveSubUser">
                    {{'common.save' | t}}
                </button>
            </div>
            <div class="create-content">
                <div class="field-group-label">{{'EnterPrise.LoginInfo' | t}}</div>
                <!--新增-->
                <div class="form-field flex" v-if="$route.params.id==0">
                    <label class="label" for="email">{{'EnterPrise.editEmail' | t}}</label>
                    <input class="input" id="email" type="text" maxlength="190" :class="{error: loginNameErrorText}"
                           @click="loginNameErrorText = ''"
                           v-title:top.warn.line="loginNameErrorText" v-model.trim="loginName"
                           :placeholder="$t('EnterPrise.enterEmail')">
                </div>
                <!--新增-->
                <div class="form-field flex" v-if="$route.params.id==0">
                    <label class="label"></label>
                    <span>{{'EnterPrise.editEmailTip' | t}}</span>
                </div>
                <!--编辑-->
                <!-- 账号邮箱 -->
                <div class="form-field" v-if="$route.params.id!=0">
                    <label class="label" for="email">{{'EnterPrise.editEmail' | t}}</label>
                    <div class="login-name">
                        {{loginName}}
                        <span class="resetPwd" @click.stop="resetPassShow()">{{'EnterPrise.resetPassword' | t}}</span>
                    </div>
                </div>
                <!-- 有效期至 -->
                <div class="form-field flex">
                    <label class="label" for="validTime">{{'EnterPrise.validTime' | t}}</label>
                    <calendar format="yyyy-mm-dd" :start="nowDate" :end="parentValidTime" v-model="validTime" />
                </div>
                <!-- 成员名称 -->
                <div class="form-field flex">
                    <label class="label" for="memberName">{{'EnterPrise.editMemberName' | t}}</label>
                    <input class="input" id="memberName" type="text" maxlength="30" v-model.trim="userName"
                           @click="userNameErrorText = ''" :class="{error: userNameErrorText}"
                           v-title:top.warn.line="userNameErrorText"
                           :placeholder="$t('EnterPrise.enterMemberName')">
                </div>
                <div class="form-field flex" v-if="$route.params.id!=0">
                    <label class="label" for="phone">{{'EnterPrise.editMemberPhone' | t}}</label>
                    <label v-if="phone">{{phone}}</label>
                    <label v-else>{{'EnterPrise.MembersNotFilled' | t }}</label>
                </div>
                <div class="form-field flex">
                    <label class="label" for="memberNo">{{'EnterPrise.editMemberNo' | t}}</label>
                    <input class="input" id="memberNo" type="text" maxlength="30" v-model.trim="userNumber"
                           :class="{error: userNumberErrorText}"
                           v-title:top.warn.line="userNumberErrorText"
                           :placeholder="$t('EnterPrise.enterMemberNo')">
                </div>
                <div class="form-field flex">
                    <label class="label" for="familyName">{{'EnterPrise.editFamilyName' | t}}</label>
                    <input class="input" id="familyName" type="text" maxlength="30" v-model.trim="surname"
                           :class="{error: surnameErrorText}"
                           v-title:top.warn.line="surnameErrorText"
                           :placeholder="$t('EnterPrise.enterFamilyName')">
                </div>
                <div class="form-field flex">
                    <label class="label" for="name">{{'EnterPrise.editName' | t}}</label>
                    <input class="input" id="name" type="text" maxlength="30" v-model.trim="theName"
                           :class="{error: theNameErrorText}"
                           v-title:top.warn.line="theNameErrorText"
                           :placeholder="$t('EnterPrise.enterName')">
                </div>
                <div class="form-field flex">
                    <label class="label" for="timezone">{{'EnterPrise.editTimeZone' | t}}</label>
                    <selector :options="timeZoneRanges" v-model="timeZone" search
                              :placeholder="$t('EnterPrise.enterTimeZone')"></selector>
                </div>
                <div class="form-field flex">
                    <label class="label" for="editAccountStatus">{{'EnterPrise.editAccountStatus' | t}}</label>
                    <radio v-model="status" :value="3" :source="3">{{'EnterPrise.accountUsable' | t}}</radio>
                    <radio v-model="status" :value="4" :source="4">{{'EnterPrise.accountDisabled' | t}}</radio>
                </div>
                <div class="field-group-label">{{'EnterPrise.belongToDepartments' | t}}</div>
                <!--部门-->
                <div class="form-field flex">
                    <label class="label" for="editAccountStatus">{{'EnterPrise.enterDepartment' | t}}</label>
                    <search-base-tree :wm="'flex'" :parentOrgSelect="false"
                                      :list="editTreeList" v-model="departmentId"
                    ></search-base-tree>
                </div>
                <!--安全组-->
                <div class="field-group-label">{{'EnterPrise.configureSecurityGroup' | t}}</div>
                <div class="form-field flex">
                    <label class="label" for="roleIds"></label>
                    <shuttle-box v-bind="shuttleInfo" v-model="roleIds"/>
                </div>
                <!--配置模块许可-->
                <div class="field-group-label">{{'EnterPrise.configurationModuleLicense' | t}}</div>
                <div class="form-field flex flex-direction-column">
                    <div class="configuration-module-license" v-for="item in moduleList" :key="item.id">
                        <checkbox v-model="moduleIds" :source="item.id" :disabled="item.isDisabled">{{item.menuName}}
                        </checkbox>
                    </div>
                </div>
            </div>
        </div>
        <!-- 重置密码 -->
        <confirm v-if="isShowResetPwd"
                 :title="$t('EnterPrise.resetPwd')"
                 @cancel="closeResetPwd"
                 @confirm="resetPassWord">
            <div class="form-field">
                {{resetPwdDescription}}
            </div>
            <div class="form-field reset-pwd-field">
                <checkbox v-model="resetType" :source="'email'">{{'EnterPrise.editEmail' | t}}</checkbox>
                <checkbox v-model="resetType" :source="'phone'">{{'EnterPrise.phone' | t}}</checkbox>
            </div>
        </confirm>
    </div>
</template>
<script type="text/babel">
    import { ManageApi, DepartmentApiV1, GeteOriginApi } from '@/api';
    import SearchBaseTree from './components/search-base-tree.vue';
    import cloneDeep from 'lodash/cloneDeep';
    import {EMAIL_ADDRESS_REGEXP, MEMBER_NAME_REGEXP, COMMON_NAME_REGEXP} from '@/common/utils/regs';
    import {TIME_ZONE_RNAGES} from '@/common/utils/timeZone';
    import format from 'date-fns/format';
    
    const beforeLeave = new Map();
    const afterLeave = new Map();
    export default {
        data() {
            return {
                nowDate: format(new Date(), 'YYYY-MM-DD'),
                //edit
                id: 0,
                //重置密码时需要使用
                gateId: 0,
                loginName: '',
                validTime: '', // 有效期至
                parentValidTime: '', // 主账号有效期至
                userName: '',
                phone: '',
                userNumber: '',
                surname: '',
                theName: '',
                timeZone: '+08:00',
                timeZoneRanges: TIME_ZONE_RNAGES,
                status: 3,
                treeList: [],
                //部门树
                editTreeList: [],
                departmentId: 0,
                //安全组列表
                //角色列表
                allList: [],
                //安全组ids
                roleIds: '',
                //角色名称
                roleName: '',
                //模块许可
                moduleList: [],
                moduleIds: [],
                //模块ids
                menuIds: '',
                //验证邮箱
                loginNameErrorText: '',
                //名称
                userNameErrorText: '',
                //工号
                userNumberErrorText: '',
                //名字
                surnameErrorText: '',
                //姓氏
                theNameErrorText: '',
                //重置密码描述
                isShowResetPwd: false,
                resetPwdDescription: '',
                resetType: [],
                //跳转提示
                synced: false,
            };
        },
        beforeRouteLeave(to, from, next) {
            afterLeave.set('id', this.id)
                .set('loginName', this.loginName)
                .set('validTime', this.validTime)
                .set('departmentId', this.departmentId)
                .set('phone', this.phone)
                .set('menuIds', this.menuIds)
                .set('moduleIds', [...new Set(this.moduleIds)].join(','))
                .set('roleIds', this.roleIds)
                .set('status', this.status)
                .set('surname', this.surname)
                .set('theName', this.theName)
                .set('timeZone', this.timeZone)
                .set('userName', this.userName)
                .set('userNumber', this.userNumber);
            let moduleIds = this.judgeResultFun(afterLeave.get('moduleIds').split(','), beforeLeave.get('moduleIds') === undefined ? beforeLeave.get('moduleList') : beforeLeave.get('moduleIds').split(','));
            let loginName = afterLeave.get('loginName') === (beforeLeave.get('loginName') === undefined ? '' : beforeLeave.get('loginName'));
            let validTime = afterLeave.get('validTime') === (beforeLeave.get('validTime') === undefined ? '' : beforeLeave.get('validTime'));
            let departmentId = afterLeave.get('departmentId') === (beforeLeave.get('departmentId') === undefined ? 0 : beforeLeave.get('departmentId'));
            let roleIds = this.judgeResultFun(afterLeave.get('roleIds').split(','), beforeLeave.get('roleIds') === undefined ? [''] : beforeLeave.get('roleIds').split(','));
            let status = afterLeave.get('status') === (beforeLeave.get('status') === undefined ? 3 : beforeLeave.get('status'));
            let surname = afterLeave.get('surname') === (beforeLeave.get('surname') === undefined ? '' : beforeLeave.get('surname'));
            let theName = afterLeave.get('theName') === (beforeLeave.get('theName') === undefined ? '' : beforeLeave.get('theName'));
            let timeZone = afterLeave.get('timeZone') === (beforeLeave.get('timeZone') === undefined ? '+08:00' : beforeLeave.get('timeZone'));
            let userName = afterLeave.get('userName') === (beforeLeave.get('userName') === undefined ? '' : beforeLeave.get('userName'));
            let userNumber = afterLeave.get('userNumber') === (beforeLeave.get('userNumber') === undefined ? '' : beforeLeave.get('userNumber'));
            function vail() {
                if (moduleIds && loginName && validTime && departmentId 
                    && roleIds && status && surname && theName 
                    && timeZone && userName && userNumber) {
                    return true;
                }
                return false;
            }
            if (!this.synced) {
                if (vail()) {
                    next();
                } else {
                    this.$confirm(this.$t('EnterPrise.leaveConfirm'), this.$t('EnterPrise.leaveReminder'))
                        .then(sure => {
                            next(sure);
                        });
                }
            } else {
                next();   
            }
        },
        mounted() {
            // 编辑
            /*eslint-disable-next-line*/
            if (this.$route.params.id && this.$route.params.id != 0) {
                this.id = this.$route.params.id;
                this.gateId = this.$route.query.gateId;
                //查询员工信息
                this.getUser();
            } else {
                //新增
                this.departmentId = this.$route.query.departmentId ? Number(this.$route.query.departmentId) : 0;
                //部门
                this.getAllDepartment();
                //安全组
                this.getRoleList();
                //模块
                this.getModuleList('add');
                this.initValidTime();
            }

        },
        methods: {
            /**
             * @description: 对比顺序不同的两个数组元素是否相同
             * @param {array} arr1
             * @param {array} arr2
             * @return {boolean}
             */            
            judgeResultFun(arr1, arr2) {
                let flag = true;
                if (arr1 === arr2) {
                    flag = true;
                } else {
                    if (arr1.length !== arr2.length) {
                        flag = false;
                    } else {
                        arr1.forEach(item => {
                            if (arr2.indexOf(item) === -1) {
                                flag = false;
                            }
                        });
                    }
                }
                return flag;
            },
            resetPassShow() {
                this.isShowResetPwd = true;
                this.resetType = [];
                this.resetPwdDescription = this.$t('EnterPrise.resetPwdDescription');
            },
            closeResetPwd() {
                this.isShowResetPwd = false;
                this.resetType = [];
            },
            //重置密码
            resetPassWord() {
                let phone = this.phone;
                let loginName = this.loginName;
                //至少选择一项
                if (this.resetType.length === 0) {
                    this.$toast(this.$t('EnterPrise.resetPwdError'), 'warn');
                    return;
                } else if (this.resetType.length === 1) {
                    //选择某一个时，另一个传递''
                    if (this.resetType[0] === 'email') {
                        phone = '';
                    } else {
                        loginName = '';
                        //选择了手机号码，但手机号码未配置
                        if (phone === '' || phone == null || phone.length === 0) {
                            this.$toast(this.$t('EnterPrise.resetPwdPhoneError'), 'warn');
                            return;
                        }
                    }
                }
                this.isShowResetPwd = false;
                GeteOriginApi.resetPassWord({email: loginName, phone: phone, userId: this.gateId})
                    .then(() => {
                        this.$toast(this.$t('EnterPrise.resetPwdSuccess'), 'success');
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            //得到用户信息
            getUser() {
                this.$loading();
                ManageApi.getSubUser(this.id)
                    .then((res) => {
                        let subUser = res.body.data.subUser;
                        this.id = subUser.id;
                        this.loginName = subUser.loginName;
                        this.initValidTime(subUser.validTime, subUser.parentValidTime);
                        this.departmentId = subUser.departmentId;
                        this.loginName = subUser.loginName;
                        this.phone = subUser.phone;
                        //模块
                        this.menuIds = subUser.menuIds;
                        this.moduleIds = (this.menuIds && this.menuIds.length > 0) ? this.menuIds.split(',')
                            .map(item => Number(item)) : [];
                        //安全组
                        this.roleIds = subUser.roleIds;
                        this.status = subUser.status;
                        this.surname = subUser.surname;
                        this.theName = subUser.theName;
                        this.timeZone = subUser.timeZone;
                        this.userName = subUser.userName;
                        this.userNumber = subUser.userNumber;
                        beforeLeave.set('id', subUser.id)
                            .set('loginName', subUser.loginName)
                            .set('validTime', this.validTime)
                            .set('departmentId', subUser.departmentId)
                            .set('phone', subUser.phone)
                            .set('menuIds', subUser.menuIds)
                            .set('moduleIds', [...new Set(this.moduleIds)].join(','))
                            .set('roleIds', subUser.roleIds)
                            .set('status', subUser.status)
                            .set('surname', subUser.surname)
                            .set('theName', subUser.theName)
                            .set('timeZone', subUser.timeZone)
                            .set('userName', subUser.userName)
                            .set('userNumber', subUser.userNumber);
                        //编辑
                        //部门
                        this.getAllDepartment();
                        //安全组
                        this.getRoleList();
                        //模块
                        this.getModuleList('edit');
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            //获取组织节点列表
            getAllDepartment() {
                this.$loading();
                DepartmentApiV1.getAllDepartment()
                    .then((res) => {
                        this.$loaded();
                        this.treeList = res.body.data.children;
                        this.initDt(this.treeList);
                        this.editTreeList = cloneDeep(this.treeList);
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            /**
             * 01初始化树
             * spread 展开
             * checked 选中
             * title 名称
             * @param dt
             */
            initDt(dt) {
                for (let i = 0; i < dt.length; i++) {
                    let item = dt[i];
                    this.$set(item, 'spread', false);
                    this.$set(item, 'checked', false);
                    this.$set(item, 'title', item.departmentName);
                    if (item.children) {
                        this.initDt(item.children);
                    }
                }
            },
            // 获取角色列表
            getRoleList() {
                this.$loading();
                GeteOriginApi
                    .getRoleList(this.$store.state.user.cid, '', 0)
                    .then((res) => {
                        this.allList = res.body.data.roles;
                        //添加属性
                        this.handleAllList();
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            /**
             * 获取模块列表
             * @param flag
             */
            getModuleList(flag) {
                this.$loading();
                GeteOriginApi
                    .getModuleList()
                    .then((res) => {
                        let list = res.body.data.moduleList;
                        for (let i = 0; i < list.length; i++) {
                            let item = list[i];
                            if (flag === 'add') {
                                //select all
                                if (item.showName === 'index') {
                                    //首页不可编辑
                                    this.$set(item, 'isDisabled', true);
                                } else {
                                    this.$set(item, 'isDisabled', false);
                                }
                                this.moduleIds.push(item.id);

                            } else {
                                if (item.showName === 'index' || item.showName === 'personalSetting') {
                                    //首页不可编辑
                                    this.$set(item, 'isDisabled', true);
                                    this.moduleIds.push(item.id);
                                } else {
                                    this.$set(item, 'isDisabled', false);
                                }
                            }

                        }
                        this.moduleList = list;
                        let moduleArr = [];
                        this.moduleList.forEach(item => {
                            moduleArr.push(String(item.id));
                        });
                        beforeLeave.set('moduleList', moduleArr);
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            valid() {
                this.loginNameErrorText = '';
                this.userNameErrorText = '';
                this.userNumberErrorText = '';
                this.surnameErrorText = '';
                this.theNameErrorText = '';
                if (this.loginName === '') {
                    this.loginNameErrorText = this.$t('data.emailEmpty');
                    return false;
                } else if (!EMAIL_ADDRESS_REGEXP.test(this.loginName)) {
                    this.loginNameErrorText = this.$t('swarm.emailFormatError');
                    return false;
                } else if (this.userName === '') {
                    this.userNameErrorText = this.$t('EnterPrise.enterMemberName');
                    return false;
                } else if (!MEMBER_NAME_REGEXP.test(this.userName)) {
                    this.userNameErrorText = this.$t('EnterPrise.MemberNameReg');
                    return false;
                } else if (this.userNumber !== '' && !COMMON_NAME_REGEXP.test(this.userNumber)) {
                    this.userNumberErrorText = this.$t('EnterPrise.labelNameReg');
                    return false;
                } else if (this.surname !== '' && !COMMON_NAME_REGEXP.test(this.surname)) {
                    this.surnameErrorText = this.$t('EnterPrise.labelNameReg');
                    return false;
                } else if (this.theName !== '' && !COMMON_NAME_REGEXP.test(this.theName)) {
                    this.theNameErrorText = this.$t('EnterPrise.labelNameReg');
                    return false;
                } else if (this.timeZone === '') {
                    this.$toast(this.$t('EnterPrise.enterTimeZone'), 'warn');
                    return false;
                } else if (this.departmentId === '' || this.departmentId === 0) {
                    this.$toast(this.$t('EnterPrise.enterSuperOrgName'), 'warn');
                    return false;
                } else if (this.roleIds === '') {
                    this.$toast(this.$t('EnterPrise.enterSecurityGroups'), 'warn');
                    return false;
                }
                return true;
            },
            saveSubUser() {
                if (this.valid()) {
                    /*eslint-disable*/
                    if (this.$route.params.id && this.$route.params.id != 0) {
                        //编辑
                        ManageApi
                            .editSubuser({
                                id: this.id,
                                departmentId: this.departmentId,
                                loginName: this.loginName,
                                validTime: this.validTime,
                                //模块ids
                                menuIds: [...new Set(this.moduleIds)].join(','),
                                //模块数量
                                moduleCount: this.moduleCount,
                                phone: this.phone,
                                //安全组
                                roleIds: this.roleIds,
                                //安全组数量
                                roleRemark: this.roleRemark,
                                status: this.status,
                                surname: this.surname,
                                theName: this.theName,
                                timeZone: this.timeZone,
                                userName: this.userName,
                                userNumber: this.userNumber,
                            })
                            .then(() => {
                                this.synced = true;
                                this.$toast(this.$t('common.updateSuccess'), 'success');
                                this.returnBack();
                            });
                    } else {
                        //新增
                        ManageApi
                            .addSubuser({
                                departmentId: this.departmentId,
                                loginName: this.loginName,
                                validTime: this.validTime,
                                //模块ids
                                menuIds: [...new Set(this.moduleIds)].join(','),
                                //模块数量
                                moduleCount: this.moduleCount,
                                phone: this.phone,
                                //安全组
                                roleIds: this.roleIds,
                                //安全组数量
                                roleRemark: this.roleRemark,
                                status: this.status,
                                surname: this.surname,
                                theName: this.theName,
                                timeZone: this.timeZone,
                                userName: this.userName,
                                userNumber: this.userNumber,
                            })
                            .then(() => {
                                this.synced = true;
                                this.$toast(this.$t('common.createSuccess'), 'success');
                                this.returnBack();
                            });
                    }

                }


            },
            //清空验证
            clearError() {
                this.loginNameErrorText = '';
                this.userNameErrorText = '';
                this.userNumberErrorText = '';
                this.surnameErrorText = '';
                this.theNameErrorText = '';
            },
            returnBack() {
                this.clearData();
                this.$router.go(-1);
            },
            clearData() {
                this.id = 0;
                this.departmentId = 0;
                this.loginName = '';
                let nowDate = new Date();
                this.validTime = format(nowDate.setDate(nowDate.getDate() + 365), 'YYYY-MM-DD');
                this.menuIds = '';
                this.phone = '';
                this.roleIds = '';
                this.status = 3;
                this.surname = '';
                this.theName = '';
                this.timeZone = '';
                this.userName = '';
                this.userNumber = '';
            },
            //返回
            back() {
                this.$router.push({name: 'orgMember'});
            },
            //编辑时选中
            handleAllList() {
                let ary = this.roleIds.split(',')
                    .map(item => Number(item));
                for (let i = 0; i < this.allList.length; i++) {
                    let item = this.allList[i];
                    this.$set(item, 'sel', false);
                    for (let x = 0; x < ary.length; x++) {
                        if (ary[x] == item.id) {
                            item.sel = true;
                        }
                    }
                }
            },
            // 新建用户初始有效期
            /**
             * 初始化有效期默认值和可选范围
             * @param {string} validTime 有效期默认值，可为空或undefined
             * @param {string} parentValidTime 有效期选择范围至，可为空或undefined
             */
            initValidTime(validTime, parentValidTime) {
                // 获取 有效期可选范围截止时间（取参或当前账号有效期）
                const validTimeEnd = parentValidTime ? parentValidTime : this.$store.state.user.validTime; // YYYY-MM-DD hh:mm:ss
                this.parentValidTime = validTimeEnd ? format(Date.parse(validTimeEnd), 'YYYY-MM-DD') : ''; // 无限使用时间为空
                // 计算365天后的时间戳（此处需求要求：不考虑闰年，固定365天后，不是+1年整）
                const date = new Date();
                let nextYearStamp = date.setDate(date.getDate() + 365);
                // 获取今日00:00:00时间戳
                // const todayTail = Date.parse(new Date(new Date().toLocaleDateString()));
                if (validTime) {
                    // 默认失效日期在今天及以后，才自动选中
                    this.validTime = format(Date.parse(validTime), 'YYYY-MM-DD');
                } else if (validTimeEnd && (Date.parse(validTimeEnd) - nextYearStamp) < 0) {
                    // 有效期至1年内，则选中可选范围截止时间
                    this.validTime = this.parentValidTime;
                } else {
                    // 有效期1年以上，默认选中当前+365天
                    this.validTime = format(nextYearStamp, 'YYYY-MM-DD');
                }
            }
        },
        components: {
            SearchBaseTree
        },
        computed: {
            shuttleInfo() {
                return {
                    titles: [this.$t('EnterPrise.allSecurityGroup'), this.$t('EnterPrise.selectSecurityGroup')],
                    dataList: this.allList,
                    selectedVal: this.roleIds,
                    fromPage: 'setting',
                    search: true,
                };
            },
            //角色数量
            roleRemark() {
                if (this.roleIds && this.roleIds.split(',').length > 0) {
                    return this.roleIds.split(',').length;
                }
                return 0;
            },
            //模块数量
            moduleCount() {
                if (this.moduleIds && this.moduleIds.length > 0) {
                    return [...new Set(this.moduleIds)].length;
                }
                return 0;
            }
        },
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    $border-color: #e0e0e0;
    .org-member-form {
        .create-title {
            font-size: 16px;
            height: 48px;
            line-height: 48px;
            padding: 0 20px;
            border: 1px solid $select-border;
            position: relative;

            .save-btn {
                position: absolute;
                right: 20px;
                top: 9px;
            }
        }

        .create-content {
            width: 800px;
            margin: auto;
            padding-top: 50px;
            @include box-sizing();
        }

        .field-group-label {
            font-size: 14px;
            font-weight: bold;
            padding-left: 65px;
            margin-top: 0.5em;
            margin-bottom: 0.5em;
        }

        .flex-direction-column {
            flex-direction: column;
        }

        .configuration-module-license {
            margin-left: 126px;
        }

        .login-name {
            display: inline-block;
            width: 670px;
        }

        .resetPwd {
            cursor: pointer;
            color: $green;
            margin-left: 16px;
        }

        .reset-pwd-field {
            label.checkbox {
                margin-right: 10px;
            }
        }
    }
</style>
