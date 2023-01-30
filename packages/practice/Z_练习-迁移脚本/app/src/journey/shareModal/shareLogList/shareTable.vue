<template>
    <div class="share-log-tablebox">
        <!--素材列表-->
        <table class="simplify-table material-list-table text-left cursor-default" v-if="shareLogList.totalRow > 0">
            <tr>
                <th width=20%>{{'material.toWhom' | t}}</th>
                <th width=20%>{{'material.shareden' | t}}</th>
                <th width=20%>{{'material.shareby' | t}}</th>
                <th width=20%>{{'material.shareTime' | t}}</th>
                <th width=8% class="text-center">{{'material.operation' | t}}</th>
            </tr>
            <tr v-for="item in shareLogList.list" :key="item.id" class="share-table">
                <td>
                    <share-member-list :typeObj='getMember(item)' :key="item.id" />
                </td>
                <td>
                    {{returnText(item.sharingAuthory, shareLogList.type)}}
                </td>
                <td>
                    {{item.createName}}
                </td>
                <td>
                    {{item.createDate}}
                </td>
                <td  class="text-center">
                    <button class="btn" :disabled="false">
                        <svg aria-hidden="true" class="action-icon icon-delete "
                                v-title:top="$t('common.del')"
                                :disabled="false"
                                @click.stop="deleteAction(item)">
                            <use xlink:href="#icon-round-close"></use>
                        </svg>
                    </button>
                </td>
            </tr>
        </table>
        <pager :total="shareLogList.totalPage ? shareLogList.totalPage : 0" :now="nowPage"
                @page="switchPage"/>
    </div>
</template>
<script type="text/babel">
    // 成员部门安全组列表
    import shareMemberList from './shareMemberList.vue';
    export default {
        props:{
            shareLogList: Object, // 共享记录列表
            nowPage: Number
        },
        components: {
            shareMemberList
        },
        computed: {
            // 获取权限对象列表
            getMember(){
                return function(item) {
                    let typeObj = {};
                    if (this.shareLogList.type === 1) {
                        if (item.userIds.length === 0 && item.departmentIds.length === 0 && item.roleIds.length === 0 ) {
                            typeObj = {
                                name: 'allMembers',
                                id: 0
                            };
                        }
                        if (item.userIds.length !== 0) {
                            typeObj = {
                                name: 'someMembers',
                                id: 1,
                                ids: item.userIds
                            };
                        }
                        if (item.departmentIds.length !== 0) {
                            typeObj = {
                                name: 'someDepartments',
                                id: 2,
                                ids: item.departmentIds
                            };
                        }
                        if (item.roleIds.length !== 0) {
                            typeObj = {
                                name: 'partialSecurityGroup',
                                id: 3,
                                ids: item.roleIds
                            };
                        }
                    } else if (this.shareLogList.type === 2) {
                        switch (parseInt(item.type)) {
                            case 0:
                                typeObj = {
                                    name: 'allMembers',
                                    id: 0,
                                };
                                break;
                            case 1:
                                typeObj = {
                                    name: 'someMembers',
                                    id: 1,
                                    ids: item.sharedId
                                };
                                break;
                            case 2:
                                typeObj = {
                                    name: 'someDepartments',
                                    id: 2,
                                    ids: item.sharedId
                                };
                                break;
                            case 3:
                                typeObj = {
                                    name: 'partialSecurityGroup',
                                    id: 3,
                                    ids: item.sharedId
                                };
                                break;
                        }
                    }
                    return typeObj;
                };
            },
            // 渲染表格权限列显示信息
            returnText(){
                return function(value, type) {
                    if (type === 1) {
                        const SHARING_AUTHORY = value.split(',').map(item => {
                            switch (parseInt(item)){
                                case 0:
                                    return this.$t('material.sharePreview');
                                case 1:
                                    return this.$t('material.shareEdit');
                                case 2:
                                    return this.$t('material.shareMove');
                                case 3:
                                    return this.$t('common.copy');
                                case 4:
                                    return this.$t('material.shareTest');
                                case 5:
                                    return this.$t('material.shareDelete');
                                case 6:
                                    return this.$t('material.shareBatchDelete');
                                case 7:
                                    return this.$t('material.shareBatchMove');
                                case 8:
                                    return this.$t('sharing.exportHTML');
                                default:
                                    return this.$t('material.empty');
                            }
                        });
                        return SHARING_AUTHORY.join(',');
                    } else if (type === 2) {
                        const SHARING_AUTHORY = value.split(',').map(item => {
                            switch (parseInt(item)){
                                case 1:
                                    return this.$t('form.sharePreview');
                                case 2:
                                    return this.$t('form.shareEdit');
                                case 3:
                                    return this.$t('form.shareTest');
                                case 4:
                                    return this.$t('form.shareReport');
                                case 5:
                                    return this.$t('form.shareDelete');
                                case 6:
                                    return this.$t('form.shareBatchMove');
                                case 7:
                                    return this.$t('form.shareBatchDelete');
                                case 8:
                                    return this.$t('form.shareReportSending');
                                case 9:
                                    return this.$t('form.shareDownloadDetail');
                                case 10:
                                    return this.$t('sharing.copyForm');
                                case 11:
                                    return this.$t('form.log');
                                case 12:
                                    return this.$t('form.startForm');
                                case 13:
                                    return this.$t('form.pauseForm');
                                case 14:
                                    return this.$t('form.delFormData');
                                case 15:
                                    return this.$t('form.editData');
                                case 16:
                                    return this.$t('form.checkLink');
                                case 17:
                                    return this.$t('form.delCustomForm');
                                case 18:
                                    return this.$t('form.addCustomForm');
                                case 19:
                                    return this.$t('form.customizeForm');
                                default:
                                    return this.$t('form.empty');
                            }
                        });
                        return SHARING_AUTHORY.filter(item=>item).join(',');
                    }
                };
            }
        },
        methods: {
            // 分页操作
            switchPage(pageNumber) {
                this.$emit('switchPage',pageNumber);
            },
            // 点击删除操作项按钮
            deleteAction({id}){
                this.$emit('openDeleteModal',id);
            }
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';
            .action-icon {
                width: 16px;
                height: 16px;
            }
            .text-left{
                text-align: left;
            }
            .share-log-tablebox{
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height:100%;
            }
            .share-table:hover{
                background-color: #e6fff7;
            }
            .share-table-active{
                background-color: #e6fff7;
            }
            .text-center{
                text-align: center;
            }
            .cursor-default{
                cursor: default;
            }
</style>
