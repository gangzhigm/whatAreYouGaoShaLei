<template>
    <div class="data-sharing">
        <div class="page-content">
            <div class="right-list">
                <div class="list-tablebar">
                    <div @click="tabSwitch(1)" :class=" tabbar == 1 ? 'tablebar-item active' : 'tablebar-item' ">
                        <span class="tablebar-text">{{'sharing.customerSharing' | t}}</span>
                    </div>
                    <div @click="tabSwitch(2)" :class=" tabbar == 2 ? 'tablebar-item active' : 'tablebar-item' ">
                        <span class="tablebar-text">{{'sharing.resourceSharing' | t}}</span>
                    </div>
                </div>
                <div class="list-title">
                    <div class="pull-left">
                        <span class="title-text" v-if="tabbar === 1">
                            {{'sharing.contactsSharingRules' | t}}
                        </span>
                        <span v-else class="title-text">{{'sharing.resourceSharingRules' | t}}</span>
                    </div>
                    <div class="pull-right">
                        <div class="search-box">
                            <input type="text" v-model.trim="searchName" :placeholder="$t('sharing.searchRuleName')"
                                   @keyup.enter="searchGetRuleList">
                            <svg aria-hidden="true" @click="searchGetRuleList">
                                <use xlink:href="#icon-search"></use>
                            </svg>
                        </div>
                        <button class='btn btn-theme btn-md' id="enterprise_share_add_share"
                                :disabled="$has('enterprise_share_add_share')" @click='addNewRule'>
                            <svg aria-hidden="true">
                                <use xlink:href="#icon-plus"></use>
                            </svg>
                            {{'sharing.addRule' | t}}
                        </button>
                    </div>
                </div>
                <div class="simplify-table">
                    <table>
                        <thead>
                            <tr>
                                <td>{{'sharing.rulesName' | t}}</td>
                                <td>{{'sharing.sharedRange' | t}}</td>
                                <td>{{'sharing.status' | t}}</td>
                                <td>{{'sharing.operation' | t}}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in ruleList"
                                :key="item.id">
                                <td :title='item.name'>{{item.name}}</td>
                                <td :title='item.roleCount'
                                    @click="getAllGroups(item)">
                                    <span class="theme-text">{{item.roleCount}}</span>
                                    {{'sharing.securityGroups' | t}}</td>
                                <td :title="item.openStatus === true ? $t('EnterPrise.using') : $t('EnterPrise.disabled')">
                                    {{item.openStatus === true ? $t('EnterPrise.using') : $t('EnterPrise.disabled')}}
                                </td>
                                <td>
                                    <button class="btn pull-left nomargin" :disabled="$has('enterprise_share_activate_rule')">
                                        <svg aria-hidden="true" class="action-icon icon-pause"
                                            :class="{'icon-disable':$has('enterprise_share_activate_rule')}"
                                            v-title:top="$t('sharing.deactive')"
                                            @click="forbidden(item)" v-if="item.openStatus">
                                            <use xlink:href="#icon-pause"></use>
                                        </svg>
                                    </button>
                                    <button class="btn pull-left nomargin" :disabled="$has('enterprise_share_activate_rule')">
                                         <svg aria-hidden="true" class="action-icon icon-kaishi"
                                            :class="{'icon-disable':$has('enterprise_share_activate_rule')}"
                                            v-title:top="$t('sharing.active')"
                                            @click="active(item)" v-if="!item.openStatus">
                                            <use xlink:href="#icon-kaishi"></use>
                                        </svg>
                                    </button>
                                    <button class="btn pull-left nomargin" :disabled="$has('enterprise_share_edit_share')">
                                        <svg aria-hidden="true" class="action-icon icon-round-pencil"
                                            :class="{'icon-disable':$has('enterprise_share_edit_share')}"
                                            v-title:top="$t('common.edit')"
                                            @click="editRule(item)">
                                            <use xlink:href="#icon-round-pencil"></use>
                                        </svg>
                                    </button>
                                    <button class="btn pull-left nomargin" :disabled="$has('enterprise_share_copy_rule')">
                                        <svg aria-hidden="true" class="action-icon icon-copy"
                                            :class="{'icon-disable':$has('enterprise_share_copy_rule')}"
                                            v-title:top="$t('common.copy')"
                                            @click.stop="copyRule(item)">
                                            <use xlink:href="#icon-copy"></use>
                                        </svg>
                                    </button>
                                    <button class="btn pull-left nomargin" :disabled="$has('enterprise_share_delete_share')">
                                        <svg aria-hidden="true" class="action-icon icon-delete"
                                            :class="{'icon-disable':$has('enterprise_share_delete_share')}"
                                            v-title:top="$t('common.del')"
                                            @click.stop="delRule(item)">
                                            <use xlink:href="#icon-round-close"></use>
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <list-empty v-if="ruleList.length === 0 && !listLoading" :name="$t('sharing.contactsSharingRules')"/>
                    <inline-loading v-if="listLoading"></inline-loading>
                </div>
                <pager v-if="ruleList.length > 0"
                       :total="totalPage"
                       :now="curPage"
                       @page="handlePage"></pager>
            </div>
            <!--成员列表-->
            <modal size="sm"
                   :title="$t('sharing.sharedRange')"
                   v-if="groupModalShow"
                   @close="groupModalShow = false">
                <ul class="members">
                    <li v-for="group in groupList"
                        :key="group.id">
                        <p class="userName"
                           :title="group.cName">{{group.cName}}</p>
                    </li>
                    <li v-if="groupList.length === 0">
                        <list-empty />
                    </li>
                </ul>
                <template v-slot:buttons>
                    <input type="button"
                           class="btn btn-md btn-theme"
                           :value="$t('common.close')"
                           @click="closeGroup">
                </template>
            </modal>
        </div>
        <!-- 禁用与解禁 -->
        <confirm v-if="isShowChangeStatus"
                 :title="$t('common.defaultConfirmTitle')"
                 @cancel="closeForbidden"
                 @confirm="changeRuleStatus">
            {{stateSubscription}}
        </confirm>
        <!-- 删除 -->
        <confirm v-if="isDelete"
                 :title="$t('common.defaultConfirmTitle')"
                 @cancel="closeDelete"
                 @confirm="deleteConfirm">
            {{'sharing.deleteConfirm' | t}}
        </confirm>
    </div>
</template>

<script type="text/babel">
import debounce from 'lodash/debounce';
import { PermitAllApi, ResourceShareApi } from '@/api';

export default {
    name: 'data-sharing',
    data () {
        return {
            searchName: '',
            ruleId: '',
            ruleList: [],
            isForbidden: false,
            isDelete: false,
            stateSubscription: '',// state change tips
            isShowChangeStatus: false,
            showAddRule: false,
            totalPage: '',
            curPage: 1,
            groupModalShow: false,
            groupList: [],
            listLoading: false,
            tabbar:this.$route.params.tab ? parseInt(this.$route.params.tab) : 1,//共享 联系人/资源切换
        };
    },
    mounted () {
        this.curPage = Number(this.$route.query.curPage) || 1;
        this.tabbar =  Number(this.$route.query.tabbar) || 1;
        this.searchName = this.$route.query.keyWords || '';
        this.getRuleList();
    },
    methods: {
        tabSwitch(data){
            this.tabbar = data;
            this.curPage = 1;
            this.searchName = '';
            this.getRuleList();
        },
        //根据规则名称搜索
        searchGetRuleList() {
            this.curPage = 1;
            this.getRuleList();
        },
        // get rule list
        getRuleList () {
            this.ruleList = [];
            this.totalPage = '';
            this.$loading();
            this.listLoading = true;
            switch (this.tabbar) {
                case 1:
                    PermitAllApi
                        .getRulesList(this.searchName, this.curPage)
                        .then(res => {
                            let data = res.body.data;
                            if (data.rulesList) {
                                this.ruleList = data.rulesList;
                                this.totalPage = data.totalPage;
                            } else {
                                this.ruleList = [];
                                this.totalPage = '';
                            }
                            this.listLoading = false;
                            this.$loaded();
                        })
                        .catch(() => {
                            this.listLoading = false;
                            this.$loaded();
                        });
                    break;
                case 2:
                    ResourceShareApi
                        .getRulesListResourceShare(this.searchName, this.curPage)
                        .then(res => {
                            let data = res.body.data;
                            if (data.rulesList) {
                                this.ruleList = data.rulesList;
                                this.totalPage = data.totalPage;
                            } else {
                                this.ruleList = [];
                                this.totalPage = '';
                            }
                            this.listLoading = false;
                            this.$loaded();
                        })
                        .catch(() => {
                            this.listLoading = false;
                            this.$loaded();
                        });
                    break;
            }
            this.$router.replace({
                name: this.$route.name,
                query: {
                    tabbar: this.tabbar,
                    curPage: this.curPage,
                    keyWords: this.searchName
                }
            });
        },
        //分页
        handlePage (e) {
            this.curPage = e || this.curPage;
            this.$nextTick(() => {
                this.getRuleList();
            });
        },
        addNewRule () {
            switch (this.tabbar) {
                case 1:
                    this.id = '';
                    this.$router.push({
                        name: 'addSharingForm',
                        params: { id: 0 },
                        query: {
                            tabbar: this.tabbar,
                            curPage: this.curPage,
                            keyWords: this.searchName
                        }
                    });
                    break;
                case 2:
                    this.$router.push({
                        name: 'addResourceSharingForm',
                        params: { id: 0 },
                        query: {
                            tabbar: this.tabbar,
                            curPage: this.curPage,
                            keyWords: this.searchName
                        }
                    });
                    break;
            }
        },
        editRule (item) {
            switch (this.tabbar) {
                case 1:
                    this.$router.push({
                        name: 'editSharingForm',
                        params: { id: item.id,  },
                        query: {
                            tabbar: this.tabbar,
                            curPage: this.curPage,
                            keyWords: this.searchName
                        }
                    });
                    break;
                case 2:
                    this.$router.push({
                        name: 'editResourceSharingForm',
                        params: { id: item.id },
                        query: {
                            tabbar: this.tabbar,
                            curPage: this.curPage,
                            keyWords: this.searchName
                        }
                    });
                    break;
            }
        },
        //禁用
        forbidden (item) {
            switch (this.tabbar) {
                case 1:
                    this.isForbidden = true;
                    this.ruleId = item.id;
                    this.isShowChangeStatus = true;
                    this.stateSubscription = this.$t('sharing.forbiddenConfirm');
                    break;
                case 2:
                    this.isForbidden = true;
                    this.ruleId = item.id;
                    this.isShowChangeStatus = true;
                    this.stateSubscription = this.$t('sharing.forbiddenConfirm');
                    break;
            }
        },
        closeForbidden () {
            this.isShowChangeStatus = false;
            this.userId = '';
        },

        active (item) {
            switch (this.tabbar) {
                case 1:
                    // 共享规则中点击启用按钮时，先二次弹框确认 请确认共享规则的条件是否为有效
                    this.$confirm(this.$t('common.defaultConfirmTitle'), this.$t('sharing.confirmValid'))
                        .then(sure => {
                            if (sure) {
                                this.isForbidden = false;
                                this.ruleId = item.id;
                                this.isShowChangeStatus = true;
                                this.stateSubscription = this.$t('sharing.activeConfirm');
                            }
                        });
                    break;
                case 2:
                    this.isForbidden = false;
                    this.ruleId = item.id;
                    this.isShowChangeStatus = true;
                    this.stateSubscription = this.$t('sharing.activeConfirm');
                    break;
            }
        },
        // 修改用户状态
        changeRuleStatus () {
            this.$loading();
            switch (this.tabbar) {
                case 1:
                    if (this.isForbidden) {
                        // 禁用
                        PermitAllApi
                            .changeOpenStatus({
                                id: this.ruleId,
                                openStatus: false
                            })
                            .then(() => {
                                this.$loaded();
                                this.isShowChangeStatus = false;
                                this.$toast(this.$t('sharing.forbiddenSuccess'), 'success');
                                this.ruleId = '';
                                this.getRuleList();
                            })
                            .catch(() => {
                                this.isShowChangeStatus = false;
                                this.$loaded();
                            });
                    } else {
                        //激活
                        PermitAllApi
                            .changeOpenStatus({
                                id: this.ruleId,
                                openStatus: true
                            })
                            .then(() => {
                                this.$loaded();
                                this.isShowChangeStatus = false;
                                this.$toast(this.$t('sharing.activeSuccess'), 'success');
                                this.ruleId = '';
                                this.getRuleList();
                            })
                            .catch(() => {
                                this.isShowChangeStatus = false;
                                this.$loaded();
                            });
                    }
                    break;
                case 2:
                    if (this.isForbidden) {
                        // 禁用
                        ResourceShareApi
                            .changeResourceShare({
                                id: this.ruleId,
                                openStatus: false
                            })
                            .then(() => {
                                this.$loaded();
                                this.isShowChangeStatus = false;
                                this.$toast(this.$t('sharing.forbiddenSuccess'), 'success');
                                this.ruleId = '';
                                this.getRuleList();
                            })
                            .catch(() => {
                                this.isShowChangeStatus = false;
                                this.$loaded();
                            });
                    } else {
                        //激活
                        ResourceShareApi
                            .changeResourceShare({
                                id: this.ruleId,
                                openStatus: true
                            })
                            .then(() => {
                                this.$loaded();
                                this.isShowChangeStatus = false;
                                this.$toast(this.$t('sharing.activeSuccess'), 'success');
                                this.ruleId = '';
                                this.getRuleList();
                            })
                            .catch(() => {
                                this.isShowChangeStatus = false;
                                this.$loaded();
                            });
                    }
                    break;
            }
        },

        copyRule:debounce(function (item) {
            switch (this.tabbar) {
                case 1:
                    this.userId = item.id;
                    PermitAllApi
                        .copyRules({
                            id: this.userId
                        })
                        .then(() => {
                            this.$toast(this.$t('sharing.copySuccess'), 'success');
                            this.userId = '';
                            this.getRuleList();
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                    break;
                case 2:
                    this.userId = item.id;
                    ResourceShareApi
                        .copyResourceShare(this.userId)
                        .then(() => {
                            this.$toast(this.$t('sharing.copySuccess'), 'success');
                            this.userId = '';
                            this.getRuleList();
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                    break;
            }
        }, 500),

        delRule (item) {
            switch (this.tabbar) {
                case 1:
                    this.isDelete = true;
                    this.userId = item.id;
                    break;
                case 2:
                    this.isDelete = true;
                    this.userId = item.id;
                    break;
            }
        },
        //关闭删除
        closeDelete () {
            this.isDelete = false;
            this.userId = '';
        },
        // 确认删除
        deleteConfirm () {
            this.$loading();
            switch (this.tabbar) {
                case 1:
                    PermitAllApi
                        .deleteRules(this.userId)
                        .then(() => {
                            this.isDelete = false;
                            this.$toast(this.$t('common.deleteSuccess'), 'success');
                            this.userId = '';
                            this.curPage = 1;
                            this.getRuleList();
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                    break;
                case 2:
                    ResourceShareApi
                        .delResourceShare(this.userId)
                        .then(() => {
                            this.isDelete = false;
                            this.$toast(this.$t('common.deleteSuccess'), 'success');
                            this.userId = '';
                            this.curPage = 1;
                            this.getRuleList();
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                    break;
            }
        },
        getAllGroups (item) {
            switch (this.tabbar) {
                case 1:
                    PermitAllApi
                        .getRole(item.id)
                        .then(res => {
                            if (res.body.data.roleList) {
                                this.groupList = res.body.data.roleList;
                                this.groupModalShow = true;
                            } else {
                                this.groupList = [];
                                this.groupModalShow = true;
                            }
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                    break;
                case 2:
                    ResourceShareApi
                        .getRoleResourceShare(item.id)
                        .then(res => {
                            if (res.body.data.roleList) {
                                this.groupList = res.body.data.roleList;
                                this.groupModalShow = true;
                            } else {
                                this.groupList = [];
                                this.groupModalShow = true;
                            }
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                    break;
            }
        },

        closeGroup () {
            this.groupModalShow = false;
            this.groupList = [];
        }

    }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../common/scss/base/variables';
@import '../../common/scss/base/mixin';
.data-sharing {
    .right-list {
        padding: 16px;
        width: 100%;
        float: left;
        @include box-sizing();
        background-color: white;
        height: calc(
            100vh - #{$header-height + $toolbar-height + 24px * 2 +
                $tab-nav-height}
        );
        overflow-y: scroll;
        .list-title {
            padding: 16px 0;
            @include clearfix();
            .title-text {
                font-size: 16px;
            }
            .search-box {
                margin-right: 20px;
            }
        }
        .list-tablebar{
            font-size: 16px;
            padding: 16px 0;
            word-break: break-all;
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            .tablebar-item{
                border-bottom: 2px solid transparent;
                padding: 0 10px 13px;
                .tablebar-text{
                    cursor: pointer;
                    &:hover{
                        color: #0cc2a9;
                    }
                }
            }
            .active{
                color: #0cc2a9;
                border-bottom: 2px solid #0cc2a9;
            }
        }
        .nomargin {
            padding: 0;
            margin:0;
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
}
</style>
