<template>
    <div class="security-group">
        <div class="content-view white-bg padding">
            <span class="edit-group-text">{{'privilege.edit' | t}}</span>
            <button class="btn btn-md btn-theme pull-right" @click="save">{{'common.save' | t}}</button>
        </div>
        <div class="content-view margin padding white-bg flex">
            <div class="links">
                <ul class="links-view" v-for="link in settingList" :key="link.id">
                    <li class="tab-link" :class="{active: link.id===linkId}" @click="changeLink(link.id)">
                        {{link.name}}
                    </li>
                </ul>
            </div>
            <div class="content">
                <!--基本信息-->
                <base-info v-show="linkId===1" v-model="securityData.role" ref="baseInfo"
                           :securityGroup="securityGroup" @valid="validBase"></base-info>
                <operate-authority v-show="linkId===2" v-model="securityData.operationList"></operate-authority>
                <management-authority v-show="linkId===3" v-model="securityData.manageList"></management-authority>
                <data-authority v-show="linkId===4" v-model="securityData.dataList"></data-authority>
                <field-permission v-show="linkId===5" @passList="changePermission($event)"
                                  :attributes="attributes" :fields="fields"></field-permission>
            </div>

        </div>
        <!-- 离开页面的弹窗 -->
        <modal v-if="nextModal" :title="$t('sharing.nextSure')" @close="nextModal = false">
            <div>
                {{'sharing.saveTips' | t}}
            </div>
            <template v-slot:buttons>
                <button type="button" class="btn btn-md btn-white" @click="nextModal = false">
                    {{'common.cancel' | t}}
                </button>
                <button type="button" class="btn btn-md btn-white" @click="leaveNoSave()">
                    {{'sharing.cancelSave' | t}}
                </button>
                <button type="button" class="btn btn-md btn-theme" @click="leaveSave()">
                    {{'sharing.confirmSave' | t}}
                </button>
            </template>
        </modal>
    </div>
</template>

<script>
    import { WebServAttrApiV1, GeteOriginApi, GroupV1 } from '@/api';
    import BaseInfo from './security-group/base-info.vue';
    import DataAuthority from './security-group/data-authority.vue';
    import ManagementAuthority from './security-group/manage-authority.vue';
    import OperateAuthority from './security-group/operate-authority.vue';
    import FieldPermission from './security-group/field-permission.vue';
    import cloneDeep from 'lodash/cloneDeep';
    import isEqual from 'lodash/isEqual';
    import { mapState } from 'vuex';

    let beforeLeave = new Map();
    let afterLeave = new Map();
    export default {
        name: 'security-group',
        data() {
            return {
                settingList: [
                    {
                        name: this.$t('privilege.baseInfo'),
                        id: 1
                    },
                    {
                        name: this.$t('privilege.operateAuthority'),
                        id: 2
                    },
                    {
                        name: this.$t('privilege.managementAuthority'),
                        id: 3
                    },
                    {
                        name: this.$t('privilege.dataAuthority'),
                        id: 4
                    },
                    {
                        name: this.$t('privilege.fieldPermission'),
                        id: 5
                    },
                ],
                currentComponent: '',
                securityData: {
                    role: {},
                    operationList: [],
                    manageList: [],
                    dataList: [],
                    fieldList: [],

                },
                securityGroup: [],
                attributeList: [],
                fields: [],
                attributes: [],
                params: {},
                nextModal: false, // 离开页面的谈窗
                leaveRoute: {}, // 保存去到页面的路由信息
                saveStaus: false, // 离开时的状态
                saveType: false, // 是否点击保存按钮
            };
        },
        mounted() {
            this.params = this.$route.params.query;
            this.getAllInfo();
            this.getAttributes();
            this.getSecurityGroup();
        },
        beforeRouteLeave(to, form, next) {
            afterLeave.set('mustMenuIds', this.mustMenuIds) // 操作权限管理权限
                .set('dataMenuIds', this.dataMenuIds) // 数据权限
                .set('fields', this.securityData.fieldList) // 字段权限
                .set('groupId', this.securityData.role.groupId) // 选择分组
                .set('describe', this.securityData.role.describe) // 安全组描述
                .set('roleName', this.securityData.role.roleName); // 安全组名称
            let mustMenuId = isEqual(beforeLeave.get('mustMenuIds'), afterLeave.get('mustMenuIds'));
            let dataMenuId = isEqual(beforeLeave.get('dataMenuIds'), afterLeave.get('dataMenuIds'));
            let field = this.compareObj(beforeLeave.get('fields'), afterLeave.get('fields'));
            let groupIds = beforeLeave.get('groupId') === afterLeave.get('groupId');
            let describes = beforeLeave.get('describe') === afterLeave.get('describe');
            let roleNames =  beforeLeave.get('roleName') === afterLeave.get('roleName');
            if (this.saveStaus) {
                next();
            } else {
                if (mustMenuId && dataMenuId && field && groupIds && describes && roleNames) {
                    next();
                } else {
                    next(false);
                    this.leaveRoute = to;
                    if (!this.saveType) {
                        this.nextModal = true;
                    }
                }
            }
        },
        computed: {
            ...mapState(['user']),
            // 数据权限中有权限的ids
            dataMenuIds() {
                let ids = [];
                this.securityData.dataList.forEach(menu => {
                    menu.dataAuthorityDTOList.forEach(item => {
                        if (item.showType === 1) {
                            ids.push(item.id);
                        }
                    });
                });
                return ids;
            },
            // 操作权限、管理权限中有权限的ids
            mustMenuIds() {
                let ids = [];
                let data = [...this.securityData.operationList, ...this.securityData.manageList];
                data.map(menu => {
                    if (menu.menuList) {
                        menu.menuList.forEach(item => {
                            if (item.showType && item.id > 0) {
                                ids.push(item.id);
                            }
                            if (item.menuList) {
                                item.menuList.forEach(itm => {
                                    if (itm.showType && itm.id > 0) {
                                        ids.push(itm.id);
                                    }
                                });
                            }
                        });
                    }
                });
                return ids;
            },
            linkId() {
                let linkId = 1;
                switch (this.$route.name) {
                    case 'baseInfo':
                        linkId = 1;
                        break;
                    case 'operateAuthority':
                        linkId = 2;
                        break;
                    case 'managementAuthority':
                        linkId = 3;
                        break;
                    case 'dataAuthority':
                        linkId = 4;
                        break;
                    default:
                        linkId = 5;
                        break;
                }
                return linkId;
            }
        },
        methods: {
            // 离开不保存
            leaveNoSave() {
                this.saveStaus = true;
                this.$router.push({
                    name: this.leaveRoute.name, 
                    query: this.leaveRoute.query
                });
                this.nextModal = false;
            },
            // 保存并离开
            leaveSave() {
                if (this.$refs.baseInfo.valid()) {
                    let sendData = {
                        choiceMenuIds: [],
                        companyId: this.user.cid,
                        dataMenuIds: this.dataMenuIds,
                        describe: this.securityData.role.describe,
                        roleFieldDTOList: this.securityData.fieldList,
                        groupId: this.securityData.role.groupId,
                        id: parseInt(this.$route.params.id),
                        mustMenuIds: this.mustMenuIds,
                        roleName: this.securityData.role.roleName,
                        status: 2
                    };
                    GeteOriginApi
                        .EditSecurityAllData(sendData)
                        .then(() => {
                            this.$toast(this.$t('common.saveSuccess'), 'success');
                        });
                }
                this.saveStaus = true;
                this.$router.push({
                    name: this.leaveRoute.name, 
                    query: this.leaveRoute.query
                });
                this.nextModal = false;
            },
            /**
             * @description: 对比字段权限操作前后的数据
             * @param {array} arr1
             * @param {array} arr2
             * @return {boolean}
             */            
            compareObj(arr1, arr2) {
                let arr = [];
                if (arr1.length === arr2.length){
                    arr1.forEach(item => {
                        arr2.forEach(items => {
                            if (item.fieldId === items.fieldId) {
                                if (item.type !== items.type) {
                                    arr.push(items.type);
                                }
                            }
                        });
                    });
                    if (arr.length === 0) {
                        return true;
                    }
                    return false;
                } 
                return false;
            },
            // 保存安全组信息
            save() {
                if (this.$refs.baseInfo.valid()) {
                    this.saveType = true;
                    this.saveSecurityData();
                }
            },
            changeLink(id) {
                switch (id) {
                    case 1:
                        this.$router.push({name: 'baseInfo'});
                        break;
                    case 2:
                        this.$router.push({name: 'operateAuthority'});
                        break;
                    case 3:
                        this.$router.push({name: 'managementAuthority'});
                        break;
                    case 4:
                        this.$router.push({name: 'dataAuthority'});
                        break;
                    case 5:
                        this.$router.push({name: 'fieldPermission'});
                        break;
                }
            },
            getAttributes() {
                WebServAttrApiV1
                    .getAttributes({attrType: 0, isFilter: '', isResult: ''})
                    .then(({body: {data: {attributeList}}}) => {
                        this.attributeList = attributeList;
                    });
            },
            getAllInfo() {
                let roleId = parseInt(this.$route.params.id);
                this.$loading();
                GeteOriginApi
                    .getRoleMenus(this.user.cid, roleId)
                    .then((res) => {
                        let data = res.body.data;
                        this.fields = res.body.data.fieldList;
                        this.securityData = cloneDeep(data);
                        beforeLeave.set('mustMenuIds', this.mustMenuIds)
                            .set('dataMenuIds', this.dataMenuIds)
                            .set('fields', this.fields)
                            .set('groupId', data.role.groupId)
                            .set('roleName', data.role.roleName)
                            .set('describe', data.role.describe);
                        // 字段权限（字段名称和展示与隐藏是分开的接口，所以需求前端自行拼接列表的数据）
                        if (this.attributes) {
                            for (let i = 0; i < this.attributeList.length; i++) {
                                this.attributeList[i].fieldName = '';
                                this.attributeList[i].show = true;
                                this.$set(this.attributeList[i], 'type', '');
                                for (let j = 0; j < this.fields.length; j++) {
                                    // 展示与隐藏的接口，后台仅返回隐藏的数据，需要前端自己去进行匹配，除隐藏的数据外其余数据都默认展示，
                                    // 另：页面中的展示与隐藏是用的列表中的show来进行判断的
                                    if (this.attributeList[i].name === this.fields[j].fieldName) {
                                        this.attributeList[i].fieldName = this.fields[j].fieldName;
                                        this.attributeList[i].show = false;
                                        this.$set(this.attributeList[i], 'type', this.fields[j].type);
                                    }
                                }
                            }
                            this.attributes = this.attributeList;
                        }


                        // 管理权限添加全选功能
                        this.securityData.manageList.forEach((item) => {
                            let selectAll = true;
                            let selectAllFunction = true;
                            item.menuList.forEach(menu => {
                                if (menu.showType === 0) {
                                    selectAll = false;
                                }
                                menu.menuList.forEach(itm => {
                                    if (itm.showType === 0) {
                                        selectAllFunction = false;
                                    }
                                });
                            });
                            item.menuList.unshift({
                                id: -1, menuName: this.$t('privilege.selectAll'), showType: selectAll ? 1 : 0,
                                menuList: [
                                    {
                                        id: -1,
                                        menuName: this.$t('privilege.selectAll'),
                                        showType: selectAllFunction ? 1 : 0
                                    }
                                ]
                            });
                        });
                        // 操作权限添加全选功能
                        this.securityData.operationList.forEach((item) => {
                            let selectAll = true;
                            let selectAllFunction = true;
                            // 有二级菜单
                            if (item.menuList && item.menuList.length > 0) {
                                item.hasLevelThreeAll = false;
                                item.menuList.forEach(menu => {
                                    // 首页默认选中不可取消
                                    if (menu.menuName === '首页') {
                                        menu.disabled = true;
                                        menu.showType = 1;
                                    }
                                    if (menu.showType === 0) {
                                        selectAll = false;
                                    }
                                    // 有三级菜单
                                    if (menu.menuList && menu.menuList.length > 0) {
                                        menu.menuList.forEach(itm => {
                                            if (itm.showType === 0) {
                                                selectAllFunction = false;
                                            }
                                        });
                                        item.hasLevelThreeAll = true;
                                    } else { //没有三级菜单,三级菜单显示为空
                                        menu.menuList = [{id: -2, menuName: ''}];
                                    }
                                });
                                // 三级菜单全部不需要操作,不需要加全选功能
                                if (!item.hasLevelThreeAll) {
                                    item.menuList.unshift({
                                        id: -1, menuName: this.$t('privilege.selectAll'), showType: selectAll ? 1 : 0,
                                        menuList: [
                                            {id: -2, menuName: ''}
                                        ]
                                    });
                                } else {
                                    // 首页页面默认选中，全选按钮不可取消
                                    if (item.menuName === '首页') {
                                        item.menuList.unshift({
                                            id: -1,
                                            menuName: this.$t('privilege.selectAll'),
                                            showType: selectAll ? 1 : 0,
                                            disabled: true,
                                            menuList: [
                                                {
                                                    id: -1,
                                                    menuName: this.$t('privilege.selectAll'),
                                                    showType: selectAllFunction ? 1 : 0
                                                }
                                            ]
                                        });
                                        return;
                                    }
                                    item.menuList.unshift({
                                        id: -1, menuName: this.$t('privilege.selectAll'), showType: selectAll ? 1 : 0,
                                        menuList: [
                                            {
                                                id: -1,
                                                menuName: this.$t('privilege.selectAll'),
                                                showType: selectAllFunction ? 1 : 0
                                            }
                                        ]
                                    });
                                }
                            } else { //没有二级菜单
                                item.menuList = [];
                                item.menuList.unshift({
                                    id: -1,
                                    menuName: this.$t('privilege.selectAll'),
                                    showType: selectAll ? 1 : 0,
                                    disabled: true,
                                    menuList: [
                                        {
                                            id: -1,
                                            menuName: this.$t('privilege.selectAll'),
                                            showType: selectAllFunction ? 1 : 0,
                                            disabled: true
                                        }
                                    ]
                                });
                            }
                        });
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            getSecurityGroup() {
                GroupV1
                    .getAllGroup()
                    .then((res) => {
                        this.securityGroup = res.body.data.groupList.filter(item => {
                            return item.companyId !== 0;
                        });
                    });
            },
            changePermission(event) {
                this.securityData.fieldList = event;
            },
            saveSecurityData() {
                let sendData = {
                    choiceMenuIds: [],
                    companyId: this.user.cid,
                    dataMenuIds: this.dataMenuIds,
                    describe: this.securityData.role.describe,
                    roleFieldDTOList: this.securityData.fieldList,
                    groupId: this.securityData.role.groupId,
                    id: parseInt(this.$route.params.id),
                    mustMenuIds: this.mustMenuIds,
                    roleName: this.securityData.role.roleName,
                    status: 2
                };
                GeteOriginApi
                    .EditSecurityAllData(sendData)
                    .then(() => {
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                        this.saveStaus = true;
                        this.$router.push({
                            name: 'privilegeSecurity',
                            query: this.params
                        });
                    });
            },
            // 校验基本信息
            validBase() {
                this.$router.push({name: 'baseInfo'});
            },
        },
        components: {
            BaseInfo,
            DataAuthority,
            ManagementAuthority,
            OperateAuthority,
            FieldPermission
        },
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .security-group {
        .edit-group-text {
            font-size: 14px;
            color: $color-light-content;
            display: inline-block;
            margin-top: 6px;
        }

        .links {
            width: 160px;

            .links-view {
                .tab-link {
                    line-height: 32px;
                    font-size: 14px;
                    color: $color-light-content;
                    cursor: pointer;

                    &.active {
                        color: $theme;
                    }
                }
            }
        }

        .flex {
            display: flex;
        }

        .content {
            flex: 1;
        }
    }
</style>
