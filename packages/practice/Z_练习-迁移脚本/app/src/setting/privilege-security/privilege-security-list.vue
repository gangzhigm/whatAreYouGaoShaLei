<template>
    <div class="content-view privilege-security-list">
        <div class="left-list" :class="{ collapsed: sidebarCollapsed }">
            <div class="siderbar-container">
                <!--新增分组-->
                <button type="button" class="btn create-btn"
                        :disabled="$has('enterprise_authority_add_group')"
                        @click="addPrivilege">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'privilege.createGroup' | t}}
                </button>
                <div class="keyword-search">
                    <svg aria-hidden="true" @click="search">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                    <input type="text" v-model.trim="keyword" :placeholder="$t('userGroup.findSome')" maxlength="30"
                        @keydown.enter="search">
                </div>
                <!--分组列表-->
                <div class="group-list">
                    <div :key="group.id" v-for="group in groups" :class="{active: activeGroupId === group.id}"
                        class='questionnaire-group'>
                        <div :class="{pad: group.id === 1}"
                            @click="findAllRoles(group)"
                            class="group-item">
                            <p class='name' :title="group.name">{{group.name}}</p>
                            <template v-if="group.companyId !== 0">
                                <button class="action-icon icon icon-pencil"
                                        :disabled="$has('enterprise_authority_edit_group')"
                                        @click="editGroup(group)"
                                        v-title:top="$t('common.edit')">
                                </button>
                                <button class="action-icon icon icon-delete"
                                        :disabled="$has('enterprise_authority_delete_group')"
                                        @click.stop='deleteGroup(group)'
                                        v-title:top="$t('common.del')">
                                </button>
                            </template>
                            {{group.sumCount}}
                        </div>
                    </div>
                </div>
                <div class="no-data" v-if="groups.length === 0">
                    {{'privilege.noData' | t}}
                </div>
            </div>
        </div>

        <div class="right-list">
            <!--新增安全组-->
            <div class="list-title">
                <div class="group-name pull-left">
                    <span class="title-text" :title="groupName">{{groupName}}</span>
                </div>
                <button class="btn btn-theme btn-md pull-right creaet-btn"
                        :disabled="$has('enterprise_authority_add_role')"
                        @click="addSecurityGroup">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'privilege.create' | t}}
                </button>
                <div class="pull-right search-box lg">
                    <input type="text" :placeholder="$t('privilege.search')" v-model.trim="keyWords"
                           @keydown.enter="getSecurityList">
                    <svg aria-hidden="true" @click="getSecurityList">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </div>
            </div>
            <!--表格数据-->
            <div class="simplify-table">
                <table>
                    <thead>
                    <tr>
                        <td v-for="title in rolesTitles">
                            <span>{{ title.name }}</span>
                        </td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="group in roles">
                        <td :title="group.cName" v-text="group.cName"></td>
                        <td :title="group.describe" v-text="group.describe"></td>
                        <td class="theme-text" v-text="group.count" @click="getAllUsers(group)"></td>
                        <td>
                            <button class="btn pull-left nomargin" :disabled="$has('enterprise_authority_edit_role')">
                                 <svg aria-hidden="true" class="action-icon icon-round-pencil"
                                    :class="{'icon-disable':$has('enterprise_authority_edit_role')}"
                                    v-title:top="$t('common.edit')"
                                    @click="EditGroup(group)">
                                    <use xlink:href="#icon-round-pencil"></use>
                                </svg>
                            </button>
                            <button class="btn pull-left nomargin" :disabled="$has('enterprise_authority_delete_role')">
                                 <svg aria-hidden="true" class="action-icon icon-delete"
                                    :class="{'icon-disable':$has('enterprise_authority_delete_role')}"
                                    v-title:top="$t('common.del')"
                                    @click="deleteSecurityGroup(group.id,group.cName)">
                                    <use xlink:href="#icon-round-close"></use>
                                </svg>
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <pager v-if="roles.length > 0" :now="pageNow" :total="totalPage" @page="toPage"/>
                <list-empty v-if="roles.length ===0 && keyWords === ''"/>
                <list-search-empty v-if="roles.length === 0 && keyWords !== ''"/>
            </div>
        </div>

        <!--新建分组-->
        <modal :title="editingGroup.id ? $t('privilege.editGroup') :  $t('privilege.addGroup')"
               v-if="createGroup"
               @close="closeGroup">
            <div class="form-field">
                <label for="title" class="label">{{'privilege.name' | t}}</label>
                <input class="input" :class="{error: groupErrorText}" type="text"
                       v-title:top.warn.line="groupErrorText"
                       @click="groupErrorText = ''"
                       maxlength="100"
                       v-model.trim="editingGroup.name">
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')"
                       @click="saveGroup">
            </template>
        </modal>

        <!--新建安全组-->
        <modal class="modal-content-security" :title="$t('privilege.create')" v-if="addsecurityGroup"
               @close="closeSecurityGroup">
            <add-security-group v-bind:selectdGroupId="activeGroupId"></add-security-group>
        </modal>

        <!--成员列表-->
        <modal size="sm" :title="$t('privilege.membershipList')" v-if="membershipList"
               @close="closeMember">
            <ul class="members">
                <li v-for="user in users">
                    <p class="userName" :title="user.name">{{user.name}}</p>
                    <p :title="user.departmentName">{{user.departmentName}}</p>
                </li>
                <li v-if="!users">
                    <list-empty/>
                </li>
            </ul>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.close')"
                       @click="closeMember">
            </template>
        </modal>
    </div>
</template>

<script type="text/ecmascript-6">
    import { GeteOriginApi, GroupV1 } from '@/api';
    import { SHOW_SIDE_BAR } from '@/store/vuex/mutationTypes';
    import cloneDeep from 'lodash/cloneDeep';
    import AddSecurityGroup from './add-security-group.vue';
    import {COMMON_NAME_REGEXP} from '../../common/utils/regs.js';
    import { mapState } from 'vuex';

    export default {
        name: 'privilege-security',
        components: {
            AddSecurityGroup,
        },
        data() {
            return {
                keyword: '',
                createGroup: false,
                addsecurityGroup: false,
                membershipList: false,
                rolesTitles: [
                    {
                        name: this.$t('privilege.securityName'),
                    },
                    {
                        name: this.$t('privilege.Description'),
                    },
                    {
                        name: this.$t('privilege.Participants'),
                    },
                    {
                        name: this.$t('privilege.operation'),
                    },

                ],
                roles: [], // 安全组列表
                editingGroup: {
                    name: '',
                    id: '',
                }, // 新增 && 编辑中的分组
                cloneGroupList: [
                    {
                        name: this.$t('privilege.blankGroup'), id: '0',
                    },
                    {
                        name: this.$t('privilege.createFromGroup'), id: '1',
                    },
                ], // 复制安全组
                users: [], // 成员列表
                groups: [], // 分组列表
                groupErrorText: '',// 新建分组提示信息
                roleNameErrorText: '',// 新建安全组提示信息
                companyId: '', // cid
                name: '',// 分组input输入
                groupId: 0,
                roleData: {
                    companyId: '',
                    copyRoleId: '',
                    describe: '',
                    groupId: '',
                    roleName: '',
                    status: 2,
                    showCopyRoleId: '',
                    securityId: 0,

                }, //新建安全组
                roleId: '', // 角色ID，用来获取角色下用户列表
                activeGroupId: 0,
                pageNow: 1,
                totalPage: 1,
                totalRow: 0,
                keyWords: '',
                groupName: ''

            };
        },
        computed: {
            ...mapState(['sidebarCollapsed']),
        },
        mounted() {
            this.$store.commit(SHOW_SIDE_BAR, true);
            this.groupId = +this.$route.query.groupId || 0;
            this.activeGroupId = +this.$route.query.groupId || 0;
            this.keyWords = this.$route.query.keyWords || '';
            this.pageNow = +this.$route.query.pageNow || 1;
            this.getSecurityGroup();
            this.getGroups();
        },
        beforeDestroy() {
            this.$store.commit(SHOW_SIDE_BAR, false);
        },
        methods: {
            // 分组的校验
            verify() {
                this.groupErrorText = '';
                if (!this.editingGroup.name) {
                    this.groupErrorText = this.$t('privilege.noEmptyGroupName');
                    return false;
                }
                if (!COMMON_NAME_REGEXP.test(this.editingGroup.name)) {
                    this.groupErrorText = this.$t('privilege.groupNameReg');
                    return false;
                }
                return true;
            },

            // 获取分组列表
            getGroups() {
                GroupV1
                    .getAllGroup(this.keyword)
                    .then(({body: {data}}) => {
                        this.groups = data.groupList;
                        for (let i = 0; i < this.groups.length; i++) {
                            if (this.groups[i].companyId === 0) {
                                this.groups[i].id = 0;
                                this.activeGroupId = this.groups[i].id;
                                this.groupName = this.groups[i].name;
                            }
                            if (this.$route.query.pageNow && this.groups[i].id === this.groupId) {
                                this.activeGroupId = this.groups[i].id;
                                this.groupName = this.groups[i].name;
                                break;
                            }
                        }
                    });
            },

            // 查询分组
            search() {
                this.getGroups();
            },

            // 创建分组
            addPrivilege() {
                this.createGroup = true;
            },

            // 编辑分组
            editGroup(group) {
                this.editingGroup = cloneDeep(group);
                this.createGroup = true;
            },

            // 保存分组
            saveGroup() {
                if (!this.verify()) {
                    return;
                }
                if (this.editingGroup.id) { // 编辑分组
                    GroupV1
                        .createGroup({
                            name: this.editingGroup.name,
                            id: this.editingGroup.id
                        })
                        .then(() => {
                            this.$toast(this.$t('privilege.editGroupNameSuccess'), 'success');
                            this.getGroups();
                            this.createGroup = false;
                            this.editingGroup = {};
                            this.getSecurityGroup(this.groupId = 0);
                        });
                } else {
                    GroupV1
                        .createGroup({
                            name: this.editingGroup.name,
                            id: this.editingGroup.id
                        })
                        .then(() => {
                            this.$toast(this.$t('privilege.addGroupSuccess'), 'success');
                            this.getGroups();
                            this.createGroup = false;
                            this.editingGroup = {};
                            this.getSecurityGroup(this.groupId = 0);
                        });
                }
            },

            // 删除分组
            deleteGroup(group) {
                this.$confirm(this.$t('common.defaultConfirmTitle'), this.$t('privilege.confirm') + `【${group.name}】 ` + this.$t('privilege.if'))
                    .then(sure => {
                        if (sure) {
                            GroupV1.deleteGroup({
                                id: group.id
                            })
                                .then(() => {
                                    this.$toast(this.$t('common.deleteSuccess'));
                                    this.activeGroupId = 0;
                                    this.getGroups();
                                    this.getSecurityGroup(this.groupId = 0);
                                });
                        }
                    });
            },

            // 关闭分组弹框
            closeGroup() {
                this.createGroup = false;
                this.editingGroup = {};
                this.groupErrorText = '';
            },

            // 获取安全组列表
            getSecurityGroup() {
                GeteOriginApi
                    .getSecurityGroups({
                        companyId: this.$store.state.user.cid,
                        groupId: this.groupId,
                        name: this.keyWords,
                        pageNumber: this.pageNow
                    })
                    .then(({body: {data}}) => {
                        this.roles = data.roles;
                        this.totalPage = data.totalPage;
                        this.totalRow = data.totalRow;
                        this.$router.replace({
                            name: this.$route.name,
                            query: {
                                groupId: this.groupId,
                                keyWords: this.keyWords,
                                pageNow: this.pageNow
                            }
                        });
                    });
            },

            getSecurityList() {
                this.pageNow = 1;
                this.groupId = 0;
                this.activeGroupId = 0;
                this.getSecurityGroup();
            },

            toPage(no) {
                this.pageNow = no || this.pageNow;
                this.getSecurityGroup();
            },
            // 点击查询安全组列表
            findAllRoles(group) {
                this.activeGroupId = group.id;
                this.groupId = group.id;
                this.groupName = group.name;
                this.keyWords = '';
                this.getSecurityGroup(this.pageNow = 1);
            },

            // 创建安全组
            addSecurityGroup() {
                this.addsecurityGroup = true;
            },

            // 关闭安全组弹框
            closeSecurityGroup() {
                this.addsecurityGroup = false;
                this.roleData = {};
                this.roleNameErrorText = '';
            },

            // 删除安全组
            deleteSecurityGroup(id, cName) {
                this.$confirm(this.$t('common.defaultConfirmTitle'), this.$t('privilege.confirm') + `【${cName}】 ` + this.$t('privilege.if'))
                    .then(sure => {
                        if (sure) {
                            GeteOriginApi.deleteSecurityGroup({
                                id: id
                            })
                                .then(() => {
                                    this.$toast(this.$t('common.deleteSuccess'));
                                    this.getSecurityGroup(this.pageNow = 1);
                                    this.getGroups();
                                });
                        }
                    });
            },

            // 获取成员列表
            getAllUsers(group) {
                this.membershipList = true;
                GeteOriginApi
                    .getFindAllUsers({
                        roleId: group.id,
                    })
                    .then((res) => {
                        this.users = res.body.data.users;
                    });
            },

            // 关闭成员列表弹框
            closeMember() {
                this.membershipList = false;
                this.users = [];
            },

            EditGroup(group) {
                this.$router.push({
                    name: 'securityManagement',
                    params: {
                        id: group.id,
                        query: {
                            groupId: this.groupId,
                            keyWords: this.keyWords,
                            pageNow: this.pageNow
                        }
                    }
                });
            },
        }
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .privilege-security-list {
        display: flex;

        .left-list {
            @include box-sizing();
            float: left;
            overflow: hidden;
            width: 260px;
            margin-right: 8px;
            height: calc(100vh - #{$header-height + $toolbar-height + 24px* 5});
            background-color: white;
            @include transition(width .5s);

            .siderbar-container {
                overflow: hidden;
                height: 100%;
                width: 260px;
            }

            &.collapsed {
                width: 0;
                margin: unset;
                overflow: hidden;
                @include transition(width .5s);
                .org-tree-div {
                    overflow: hidden;
                }
            }

            .create-btn {
                display: block;
                width: calc(100% - 32px);
                margin: 16px;
                padding: 0;
                line-height: 46px;
                border: 1px dashed $disabled;
                border-radius: 4px;
                background-color: white;
                @include appearance(none);

                &:hover {
                    border-style: solid;
                }

                svg {
                    fill: currentColor;
                    height: 10px;
                    width: 10px;
                    vertical-align: top;
                    margin: 18px 2px 18px 0;
                }
                &:not([disabled]) {
                    cursor: pointer;
                    border-color: $theme;
                    color: $theme;
                }
            }

            .keyword-search {
                display: flex;
                align-items: center;
                padding: floor((39px - 20px)/2) 13px ceil((39px - 20px)/2);
                border-bottom: 1px solid $border-color;
                background-color: $title-bg;

                svg {
                    width: 13px;
                    height: 13px;
                    margin-right: 3px;
                    fill: $disabled;
                }

                input {
                    flex: 1;
                    outline: none;
                    border: none;
                    padding: 0;
                    line-height: 20px;
                    vertical-align: top;
                    background-color: transparent;
                }
            }

            .group-list {
                overflow: auto;
                height: calc(100% - 40px - 80px);
                .questionnaire-group {
                    padding: 8px 0 8px 16px;
                    line-height: $input-field-height;
                    border-left: 4px solid transparent;

                    &:first-of-type {
                        padding-left: 0;
                    }

                    .group-item {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 0 16px;
                        cursor: pointer;

                        .name {
                            flex: 1;
                            @include ellipsis();
                        }
                    }

                    &:hover,
                    &.active {
                        color: $theme;
                        background-color: $select-bg;
                        border-left-color: $green;

                        .action-icon {
                            opacity: 1;
                        }
                    }

                    .action-icon {
                        opacity: 0;
                        width: 16px;
                        line-height: 16px;
                        font-size: 16px;
                    }

                    .icon-delete {
                        margin-right: 10px;
                    }

                }

                .add-group {
                    width: 14px;
                    height: 14px;
                    fill: $color-light-content;
                }

                .create-btn {
                    display: block;
                    width: calc(100% - 32px);
                    margin: 16px;
                    padding: 0;
                    line-height: 46px;
                    border: 1px dashed $theme;
                    border-radius: 4px;
                    background-color: white;
                    color: $theme;
                    cursor: pointer;
                    @include appearance(none);

                    &:hover {
                        border-style: solid;
                    }

                    svg {
                        fill: currentColor;
                        height: 14px;
                        width: 14px;
                        vertical-align: top;
                        margin: 16px 2px 16px 0;
                    }
                }
            }

            .no-data {
                text-align: center;
                font-style: italic;
                color: $color-light-content;
                margin: 16px;
            }

        }

        .right-list {
            flex: 1;
            padding: 16px;
            float: left;
            background-color: white;
            box-sizing: border-box;
            height: calc(100vh - #{$header-height + $toolbar-height + 24px *5});
            overflow: auto;

            .list-title {
                @include clearfix;

                .creaet-btn {
                    margin-left: 24px;
                }

                .group-name {
                    line-height: 32px;
                    font-size: 16px;
                    max-width: 400px;
                    overflow: hidden;
                    @include ellipsis();
                }
            }

            .simplify-table {
                margin-top: 24px;

                .action-icon {
                    &:first-child {
                        margin-left: 0;
                    }
                }

            }
            .nomargin {
                padding: 0;
            }
        }

        .members {
            li {
                margin-bottom: 10px;

                .userName {
                    color: $color-title;
                }

                p {
                    margin-bottom: 5px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    color: $color-light-content;
                }
            }
        }

        .modal-content-security {
            .modal-content {
                padding: 24px 0 0 0;
            }
        }
    }
</style>
