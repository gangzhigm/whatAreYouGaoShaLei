<template>
    <div class="privilege-picker">
        <!--安全组名称-->
        <div class="form-field">
            <label for="title" class="label">{{'privilege.securityGroupName' | t}}</label>
            <input class="input privilege-input" :class="{error: roleNameErrorText}" type="text"
                   v-title:top.warn.line="roleNameErrorText"
                   @click="roleNameErrorText = ''"
                   maxlength="100"
                   v-model.trim="roleData.roleName">
        </div>
        <!--选择分组-->
        <div class="form-field">
            <label for="title" class="label">{{'privilege.selectFolder' | t}}</label>
            <selector class="xl" :options="allGroupList" v-model="roleData.groupId"></selector>
        </div>
        <!--复制安全组 （空白创建 && 选择已有安全组）-->
        <div class="form-field">
            <label for="title" class="label">{{'privilege.cloneGroup' | t}}</label>
            <selector class="xl" :options="cloneGroupList" v-model="roleData.securityId" @input="handleClone"></selector>
        </div>
        <div class="form-field" v-if="roleData.securityId === 1">
            <div class='questionnaire-picker' v-blur="close">
                <label class="text" @click="toggle">
                    {{text | ellipsis(16)}}
                    <span class="select-icon icon icon-arrow-down"></span>
                </label>
                <transition name="drop">
                    <div v-if='showList' class='drop-down-list'>
                        <template>
                            <ul ref="groupBlock">
                                <li class="search-info">
                                    <label class="search-field">
                                        <input type="text" ref="search" v-model="keyword"
                                               :placeholder="$t('common.selectKeywordHolder')"
                                               @keydown.enter="search">
                                        <span class="icon icon-search" @click="search"></span>
                                    </label>
                                </li>
                                <li v-if='!groupList.length'>{{'privilege.noGroup' | t}}</li>
                                <li v-else v-for='group in groupList' @click='selectGroup(group.id)'
                                    :class='{active: group.id === groupId}'>
                                    {{group.name | ellipsis(6)}}
                                    <span class="icon icon-arrow-right"></span>
                                </li>
                            </ul>
                            <ul>
                                <li class="search-info">
                                    <label class="search-field">
                                        <input type="text" ref="search" v-model="name"
                                               :placeholder="$t('common.selectKeywordHolder')"
                                               @keydown.enter="searchRole">
                                        <span class="icon icon-search" @click="searchRole"></span>
                                    </label>
                                </li>
                                <li v-if='roles.length === 0'>{{'privilege.noForm' | t}}</li>
                                <li v-else v-for='role in roles' @click='selectPaper(role)' @mouseover="findGroup(role.groupId)"
                                    :class='{active: role.id === roleData.copyRoleId}'>{{role.cName}}
                                </li>
                            </ul>
                        </template>
                    </div>
                </transition>
            </div>
        </div>
        <!--安全组描述-->
        <div class="form-field security-bottom">
            <label for="title" class="label">{{'privilege.description' | t}}</label>
            <textarea class="textarea privilege-textarea" ref="textarea" maxlength="128"
                      v-model.trim="roleData.describe"></textarea>
        </div>
        <!--save-->
        <div class="save-security">
            <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')"
                   @click="saveSecurityGroup" :disabled="isDisable">
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    import { GeteOriginApi, GroupV1 } from '@/api';
    import {COMMON_NAME_REGEXP} from '../../common/utils/regs.js';
    export default {
        props: {
            value: Number,
            selectdGroupId: Number
        },
        data() {
            return {
                isDisable: false,
                showList: false,
                allGroupList: [],
                groupList: [],
                roles: [],
                groupId: '',
                text: '',
                keyword: '',
                companyId: '',
                roleData: {
                    companyId: '',
                    copyRoleId: 0,
                    describe: '',
                    groupId: '',
                    roleName: '',
                    status: 2,
                    securityId: 0,

                }, //新建安全组
                cloneGroupList: [
                    {
                        name: this.$t('privilege.blankGroup'), id: 0,
                    },
                    {
                        name: this.$t('privilege.createFromGroup'), id: 1,
                    },
                ], // 复制安全组
                roleNameErrorText: '',// searchRole
                name: '', // searchRole
                gidList: [],
            };
        },
        watch: {},
        mounted() {
            GroupV1
                .getAllGroup()
                .then(({body: {data}}) => {
                    let list = data.groupList;
                    if (list && list.length > 0){
                        for (let i = 0; i < list.length; i++) {
                            if (list[i].companyId === 0) {
                                list.splice(i, 1);
                            }
                        }
                        this.allGroupList = list;
                    }
                });
            this.roleData.groupId = this.selectdGroupId === 0 ? '' : this.selectdGroupId;
        },
        methods: {
            // 安全组的校验
            verify() {
                this.roleNameErrorText = '';
                if (!this.roleData.roleName) {
                    this.roleNameErrorText = this.$t('privilege.noEmptyRoleName');
                    return false;
                }
                if (!COMMON_NAME_REGEXP.test(this.roleData.roleName)) {
                    this.roleNameErrorText = this.$t('privilege.nameReg');
                    return false;
                }
                if (this.roleData.groupId === '') {
                    this.$toast(this.$t('privilege.selectGroup'), 'warn');
                    return false;
                }
                if (this.roleData.securityId === 1) {
                    if (!this.roleData.copyRoleId) {
                        this.$toast(this.$t('privilege.selectCopyRole'), 'warn');
                        return false;
                    }
                }
                return true;
            },
            handleClone(){
                // this.roleData.securityId may String
                // eslint-disable-next-line
                if (this.roleData.securityId === 1) {
                    this.getGroups();
                } else {
                    this.text = '';
                }
            },
            // 获取分组列表
            getGroups(){
                this.roles = [];
                this.roleData.copyRoleId = '';
                GroupV1
                    .getAllGroup(this.keyword)
                    .then(({body: {data}}) => {
                        let list = data.groupList;
                        // 默认返回的列表里面有companyId==1的项，剔除并隐藏
                        if (list && list.length > 0){
                            for (let i = 0; i < list.length; i++) {
                                if (list[i].companyId === 0) {
                                    list.splice(i, 1);
                                }
                            }
                            if (list.length > 0) {
                                this.groupList = list;
                                this.groupId = list[0].id;
                            } else {
                                this.groupList = [];
                                this.groupId = '';
                                this.roles = [];
                                this.roleData.copyRoleId = '';
                            }
                        } else {
                            this.groupList = [];
                            this.groupId = '';
                            this.roles = [];
                            this.roleData.copyRoleId = '';
                        }
                        this.$nextTick(()=>{
                            if (this.groupList.length > 0 && this.groupId !== '' && this.groupId !== null) {
                                this.getSecurityGroup();
                            }
                        });
                    });
            },
            // 获取安全组列表
            getSecurityGroup(){
                GeteOriginApi
                    .getGroupByRoles({
                        companyId: this.$store.state.user.cid,
                        groupId: this.groupId,
                        name: this.name
                    })
                    .then(({body: {data}}) => {
                        this.roles = data.roles;
                        this.roleData.copyRoleId = '';
                    });
            },
            // 查找组名
            search() {
                this.roles = [];
                this.name = '';
                this.gidList = [];
                this.roleData.copyRoleId = '';
                this.getGroups();
            },
            // 查找安全组
            searchRole(){
                this.keyword = '';
                if (this.name !== '') {
                    GeteOriginApi
                        .getGroupByRoles({
                            companyId: this.$store.state.user.cid,
                            groupId: this.groupId,
                            name: this.name
                        })
                        .then(({body: {data}}) => {
                            let arr = [];
                            if (data.roles && data.roles.length > 0){
                                for ( let item of data.roles ) {
                                    arr.push(item.groupId);
                                }
                                arr = Array.from (new Set(arr));
                                this.gidList = arr;
                                this.roles = data.roles;
                                this.roleData.copyRoleId = '';
                                let gl = [];
                                for (let gid of this.gidList) {
                                    let item = this.allGroupList.find( g => g.id === gid);
                                    gl.push(item);
                                }
                                this.groupList = gl;
                                this.groupId = this.roles[0].groupId;
                            } else {
                                this.roles = [];
                                this.gidList = [];
                            }
                        });
                } else {
                    this.getSecurityGroup();
                }
            },
            findGroup(id){
                if (this.gidList.length > 0){
                    this.groupId = id;
                    let index = this.groupList.findIndex( g => g.id === id);
                    index += 1;
                    this.$refs.groupBlock.scroll({
                        top: 32 * index,
                        left: 0,
                        behavior: 'smooth'
                    });
                }
            },
            toggle() {
                this.showList = !this.showList;
            },
            close() {
                this.showList = false;
            },
            // 请求角色列表
            selectGroup(groupId) {
                this.groupId = groupId;
                this.name = '';
                GeteOriginApi
                    .getGroupByRoles({
                        companyId: this.$store.state.user.cid,
                        groupId: this.groupId,
                        name: this.name
                    })
                    .then((res) => {
                        this.roles = res.body.data.roles;
                    });
            },
            selectPaper(paper) {
                this.text = paper.cName;
                this.roleData.copyRoleId = paper.id;
                this.showList = false;
            },
            // 创建安全组
            saveSecurityGroup(){
                if (!this.verify()) {
                    return;
                }
                if (this.roleData.securityId === 0) {
                    this.roleData.copyRoleId = 0;
                }
                this.isDisable = true;  //开始可以点击
                GeteOriginApi
                    .createSaveRole({
                        companyId: this.$store.state.user.cid,
                        copyRoleId: this.roleData.copyRoleId,
                        describe: this.roleData.describe,
                        groupId: this.roleData.groupId,
                        roleName: this.roleData.roleName,
                        status: this.roleData.status,
                    })
                    .then(({body: {data}}) => {
                        this.isDisable = false;//执行请求后就不能点击了
                        this.$router.push({
                            name: 'operateAuthority',
                            params: {id: data.role.id}
                        });
                    })
                    .catch(() => {
                        this.isDisable = false;  //开始可以点击
                    });
            },
        },
        filters: {
            ellipsis: function (value, n) {
                return value.length > n
                    ? value.substring(0, n - 1) + ' ..'
                    : value;
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .privilege-picker {
        .form-field {
            .privilege-input {
                width: 277px;
            }
            .privilege-textarea {
                width: 277px;
            }
        }

        .questionnaire-picker {
            display: inline-block;
            vertical-align: middle;
            position: relative;
            width: 277px;
            margin-left: 128px;
            .text {
                display: block;
                position: relative;
                width: 257px;
                height: $input-field-height - 2px;
                line-height: $input-field-height - 2px;
                border: 1px solid $border-color;
                border-radius: 4px;
                padding-right: 8px;
                cursor: pointer;
                padding-left: 1em;

                &:hover {
                    border-color: $light-green;
                }

                .icon {
                    float: right;
                }
            }
            .drop-down-list {
                position: absolute;
                z-index: 1;
                display: flex;
                left: 0;
                top: 100%;
                margin-top: 4px;
                width: 277px;
                height: 160px;
                background-color: white;
                border: 1px solid $border-color;
                border-radius: 4px;

                ul {
                    flex: 1;
                    height: 100%;
                    overflow: auto;

                    + ul {
                        border-left: 1px solid $border-color;
                    }

                    li {
                        padding: 0 8px 0 16px;
                        height: $input-field-height;
                        line-height: $input-field-height;
                        @include ellipsis();
                        cursor: pointer;
                        &:hover {
                            background-color: $hover-bg;
                        }

                        .icon {
                            float: right;
                        }
                    }
                    .active {
                        background-color: $select-bg;

                        &:hover {
                            background-color: $select-bg;
                        }
                    }

                    .search-info {
                        padding: 0;
                    }
                    .search-field {
                        position: relative;
                        display: flex;
                        align-items: center;
                        height: $input-field-height;
                        border-bottom: 1px solid $select-border;
                        background-color: $title-bg;
                        @include border-radius(0);
                        color: $color-light-content;

                        input {
                            height: $input-field-height;
                            padding: 0 8px 0 28px;
                            width: 100%;
                            min-width: 5em; // 否则placeholder显示不全
                            border: none;
                            background-color: transparent;

                            &:hover {
                                background-color: $select-bg;

                                & + .icon-search {
                                    background-color: $select-bg;
                                }
                            }

                            &:focus {
                                background-color: #fff;

                                & + .icon-search {
                                    background-color: #fff;
                                }
                            }
                        }

                        .icon-search {
                            $offset: ($input-field-height - 14px) / 2;
                            position: absolute;
                            width: 26px;
                            height: $input-field-height - 2px;
                            line-height: $input-field-height;
                            text-align: center;
                            left: 1px;
                            top: 1px;
                            background-color: transparent;
                        }
                    }

                }
            }
        }
        .security-bottom {
            margin-bottom: 13px;
        }
        .save-security {
            padding: 0 16px;
            text-align: right;
            height: $modal-panel-height;
            line-height: $modal-panel-height;
            border-top: 1px solid $border-color;
        }
    }

</style>
