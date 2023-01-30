<template>
    <div class="return-visit-task-form">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{title}}</h1>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view white-bg margin padding">
                <h3>{{'shoppingGuide.taskInformation' | t}}</h3>
                <div class="content-view">
                    <!-- 任务名称 -->
                    <div class="form-field margin-length">
                        <label class="label placeholder" for="use">{{'shoppingGuide.taskName' | t}}</label>
                        <input type="text" class="input lg" :placeholder="$t('shoppingGuide.pleaseEnter')"
                            v-title:top.line.warn="errorTitle" :class="{error: errorTitle}" v-model.trim="taskName" maxlength="18">
                    </div>
                    <!-- 回访标签 -->
                    <div class="form-field flex margin-length">
                        <label class="label" for="use">{{'shoppingGuide.chooseTaskTags' | t}}</label>
                        <div class="field-group">
                            <selector-tree :placeholder="$t('shoppingGuide.pleaseSelectTheContactTag')" :options='groupList' @checkOptions='checked($event)' v-model='checkedContactItem' :maxlength="200"/>
                        </div>
                    </div>
                    <div class="form-field margin-length">
                        <ul class="form-field flex tag-peple">
                            <li>
                                <label class="label-li">{{'shoppingGuide.expectedNumberOfContacts' | t}}</label>
                                <span :class="{active:isReCalculate === true }" 
                                    @click="showReturnTaskDetail">{{reviewPerson}}</span>
                            </li>
                            <li>
                                <label class="label-li">{{'shoppingGuide.relevantEmployees' | t}}</label>
                                <span  :class="{active:isReCalculate === true }" 
                                    @click="showStaffDetail">{{relatedStaff}}</span>
                            </li>
                            <li>
                                <span class="active" @click="reCalculate">{{'shoppingGuide.recalculation' | t}}</span>
                            </li>
                        </ul>
                    </div>
                    <div class="form-field flex margin-length font-color" v-if="nullStaffCustomerCount !== 0">
                        *{{'shoppingGuide.tipHeader' | t}}
                        <span>{{nullStaffCustomerCount}}</span>
                        {{'shoppingGuide.tipDesc' | t}}
                        <span class="assign-staff" @click="assignClient">{{'shoppingGuide.assignEmployees' | t}}</span>
                    </div>
                    <button class="btn btn-md btn-white" @click="cancle">{{'common.cancel' | t}}</button>
                    <button class="btn btn-md btn-theme" :disabled="saveLoading" @click="save">{{'channelCode.save' | t}}</button>
                        
                </div>
            </div>
        </div>
        <!-- 回访任务标签人数详情 -->
        <return-tags v-if="returnTaskDetail" :labelIds="this.tagIdList" @close="returnTaskDetail = false"></return-tags>
        <!-- 相关员工数量详情 -->
        <relevant-staffs  v-if="staffDetail" :labelIds="this.tagIdList" @close="staffDetail = false"></relevant-staffs>
        <!-- 分配客户 -->
        <modal :title="$t('shoppingGuide.contactToBeAssigned')" v-if="assignCustomer" @close="cancleAssgin">
            <div>
                <div class="form-field">
                    <div>{{'shoppingGuide.firstStep' | t}}</div>
                    <div class="data-theme">
                        <span>{{'shoppingGuide.readyToAssign' | t}}:</span>
                        <span>{{nullStaffCustomerCount}}</span>
                    </div>
                </div>
                <div class="form-field">
                    <div>{{'shoppingGuide.secondStep' | t}}</div>
                    <div class="form-field">
                        <label class="label">{{'shoppingGuide.chooseEmployees' | t}}</label>
                        <multi-select class="hg" :options="staffList" v-model="staffs" :shortcutAction="true" uniqueKey="userId"
                            :search="'async'" :autoWidth="false" :dropDirection="'bottom'" :placeholder="$t('shoppingGuide.pleaseSelect')" :max="100" />
                    </div>
                </div>
                <div class="tips">*{{'shoppingGuide.assiginStaffTips' | t}}</div>
            </div>
            <template #buttons>
                <button class="btn btn-md btn-white" @click="cancleAssgin">{{'common.cancel' | t}}</button>
                <button class="btn btn-md btn-theme" @click="completeAssgin">{{'shoppingGuide.complete' | t}}</button>
            </template>
        </modal>
    </div>
</template>
<script>
import returnTags from './components/return-tags.vue';
import relevantStaffs from './components/relevant-staffs.vue';
import SelectorTree from '@/common/components/selector-tree.vue';
import debounce from 'lodash/debounce';
import { WecomApiV1, GeteOriginApi, ContactApiV1 } from '@/api';
export default {
    data () {
        return {
            title: '',
            taskName: '',//任务名称
            saveLoading: false,
            returnTaskDetail: false,//回访任务标签人数弹窗
            staffDetail: false,//相关人员弹窗
            errorTitle: '',//错误提示
            staffList: [],//相关人员
            staffs: [],//分配员工的列表
            assignCustomer: false,
            contactStaffValue: '',//联系人存在所有员工字段值
            checkedContactItem: [],//选中的标签
            groupList: [],//标签列表
            reviewPerson: '0',//预计回访客户数
            relatedStaff: '0',//相关员工数
            tagIdList: [],//标签id
            nullStaffCustomerCount: 0,//未添加企微联系人数
            taskPerson: '',//总人数
            staffCount: '',
            allLabelList: '',
            groupId: '',//分组id
            isReCalculate: false,//是否重新计算过
            copyTaskIdList: [],
        };
    },
    
    mounted() {
        GeteOriginApi
            .getGlobalConfByConfigName({configName: 'journey_shoppingguide'})
            .then(({ body: { data } }) => {
                if (data.status !== 1) this.$router.push({name:'shoppingGuide'});
            })
            .catch(() => {
                this.isAuthLoaded = true;
            });
        this.title = Number(this.$route.query.id) === 0 ? this.$t('shoppingGuide.returnVisitTaskAdd') : this.$t('shoppingGuide.returnVisitTaskEdit');
        this.getStaffList();//获取员工列表
        if (~~this.$route.query.id !== 0) {
            this.getTaskDetail();//编辑获取任务详情
        } else {
            this.groupId = this.$route.query.groupId;
            this.getTagList();//获取标签列表
        }
    },
    computed: {
        crumbs() {
            return [
                {name: 'wecome', text: 'Dmartech'},
                {name: 'shoppingGuide', text: this.$t('home.shoppingGuide')},
                {name: 'returnTaskEdit', text: this.title},
            ];
        }
    },
    watch: {
        // 获取被选中的联系人标签ID
        checkedContactItem(val) {
            this.tagIdList = [];
            for (let i = 0; i < val.length; i++) {
                this.tagIdList.push(val[i].id);
            }
        },
    },
    methods: {
        save: debounce( function() {
            if (this.taskName === '') {
                return this.$toast(this.$t('shoppingGuide.taskNameCannotBeEmpty'),'warn');
            }
            if (this.taskName.length > 18) {
                return this.$toast(this.$t('shoppingGuide.taskNameLimit'),'warn');
            }
            if (this.checkedContactItem.length === 0) {
                return this.$toast(this.$t('shoppingGuide.pleaseSelectTheContactTag'),'warn');
            }
            let params = {
                id: Number(this.$route.query.id) === 0 ? null : Number(this.$route.query.id),
                name: this.taskName,
                groupId: Number(this.groupId),
                labelIds: this.tagIdList.join(','),
                taskPerson: this.taskPerson,
                reviewPerson: this.reviewPerson === '0' ? null : this.reviewPerson,
                relatedStaff: this.relatedStaff === '0' ? null : this.relatedStaff,
            };
            
            WecomApiV1
                .reviewTaskSave(params)
                .then((res)=>{
                    this.$toast(res.body.message, 'success');
                    this.$router.go(-1);
                });
        },300),
        cancle () {
            this.$router.go(-1);
        },
        // 重新计算
        reCalculate() {
            if (this.tagIdList.length === 0) {
                this.reviewPerson = '0';
                this.relatedStaff = '0';
                this.nullStaffCustomerCount = 0;
                this.isReCalculate = false;
                return ; 
            }
            WecomApiV1
                .reCalculate({labelIds:this.tagIdList})
                .then((res)=>{
                    this.taskPerson = res.body.data.customerPerson;
                    this.reviewPerson = res.body.data.customerPerson;
                    this.relatedStaff = res.body.data.staffCount;
                    this.nullStaffCustomerCount = res.body.data.nullStaffCustomerCount;
                    this.isReCalculate = true;
                    this.copyTaskIdList = this.tagIdList;
                    this.$toast(this.$t('common.successOperate'),'success');
                });
        },
        assignClient() {
            if (this.tagIdList.length === 0) {
                return this.$toast(this.$t('shoppingGuide.recalculateTips'),'warn');
            }
            if (this.IsTaskIdUpdated()){
                this.assignCustomer = true;
            }
        },
        // 分配员工
        completeAssgin() {
            if (this.staffs.length === 0) {
                return this.$toast(this.$t('shoppingGuide.errorStaff'),'warn');
            }
            WecomApiV1
                .assignStaff({labelIds:this.tagIdList,staffIds:this.staffs})
                .then(()=>{
                    this.staffs = [];
                    this.assignCustomer = false;
                    this.nullStaffCustomerCount = 0;
                    this.$toast(this.$t('shoppingGuide.staffBeingAssigned'),'warn');
                });
        },
        // 取消分配
        cancleAssgin() {
            this.assignCustomer = false;
            this.staffs = [];
        },
        // 获取员工列表
        getStaffList() {
            WecomApiV1
                .getAuthorityStaffListNoPage()
                .then(({body:{data}})=>{
                    data.staffList.forEach((item)=>{
                        item.name = item.value;
                    });
                    this.staffList = data.staffList;
                });
        },
        // 获取标签分组列表
        getTagList() {
            this.$loading();
            ContactApiV1
                .getGroups({sortType:this.sortType, authorityType: 0})
                .then((res)=>{
                    this.groupList = res.body.data.rootGroup.childs;
                    // 将选中的会员标签回显
                    if (this.tagIdList.length > 0) {
                        
                        this.allLabelList = [];
                        this.groupList.filter(item => {
                            if (item.labels.length > 0) {
                                this.allLabelList = this.allLabelList.concat(item.labels);
                            }
                            item.childs.filter(label => {
                                if (label.labels.length > 0) {
                                    this.allLabelList = this.allLabelList.concat(label.labels);
                                }
                                label.childs.filter(name => {
                                    if (name.labels.length > 0) {
                                        this.allLabelList = this.allLabelList.concat(name.labels);
                                    }
                                });
                            });
                        });
                        this.allLabelList.map(item => {
                            this.tagIdList.map(contact => {
                                if (item.id === parseInt(contact)) {
                                    this.checkedContactItem = this.checkedContactItem.concat(item);
                                }
                            });
                        });
                        // if (this.tagIdList.length !== this.checkedContactItem.length) {
                        //     this.$toast(this.$t('shoppingGuide.tagDisabled'),'warn');
                        // }
                    }
                    this.$loaded();
                })
                .catch(()=>{
                    this.$loaded();
                });
        },
        // 选择标签
        checked(val) {
            this.checkedContactItem = val;
            let idList = [];
            this.checkedContactItem.forEach((item)=>{
                idList.push(item.id);
            });
            this.tagIdList = idList;
        },
        // 编辑获取任务详情
        getTaskDetail() {
            WecomApiV1
                .reviewTaskSelect(this.$route.query.id)
                .then(({body:{data}})=>{
                    this.taskName = data.reviewTask.name;
                    this.tagIdList = data.reviewTask.labelIds.split(',');
                    this.copyTaskIdList = data.reviewTask.labelIds.split(',');
                    this.reviewPerson = (data.reviewTask.reviewPerson || data.reviewTask.reviewPerson === 0) ? data.reviewTask.reviewPerson : '0';
                    this.relatedStaff = (data.reviewTask.relatedStaff || data.reviewTask.relatedStaff === 0) ? data.reviewTask.relatedStaff : '0';
                    if (data.reviewTask.relatedStaff || data.reviewTask.relatedStaff === 0) {
                        this.isReCalculate = true;
                    }
                    this.groupId = data.reviewTask.groupId;
                    this.getTagList();//获取标签列表
                });
        },
        showReturnTaskDetail() {
            if (this.isReCalculate === false) {
                return ;
            }
            if (this.IsTaskIdUpdated()){
                this.returnTaskDetail = true;
            }
        },
        showStaffDetail() {
            if (this.isReCalculate === false) {
                return ;
            }
            if (this.IsTaskIdUpdated()){
                this.staffDetail = true;
            }
        },
        //判断标签列表是否更新过
        IsTaskIdUpdated() {
            if (this.tagIdList.length !== this.copyTaskIdList.length) {
                this.$toast(this.$t('shoppingGuide.recalculateTips'),'warn');
                return false;
            } 
            let isUpdated = this.copyTaskIdList.every(item=> this.tagIdList.indexOf(Number(item)) > -1);
            if (!isUpdated) {
                this.$toast(this.$t('shoppingGuide.recalculateTips'),'warn');
                return false;
            }
            return true;
        }
    },
    components: {
        returnTags,
        relevantStaffs,
        SelectorTree
    }
};
</script>
<style lang="scss">
@import "../../../../common/scss/base/variables";
@import "../../../../common/scss/base/mixin";
.return-visit-task-form {
    margin-top: 8px;
    h3 {
        margin: 30px;
        margin-left: 50px;
    }
    .hg {
        width: 312px;
    }
    .field-group {
        margin-left: 3px;
    }
    .label {
        text-align: left;
    }
    .tag-peple {
        li {
            .label-li{
                display: inline-block;
                margin-right: 12px;
                vertical-align: top;
                color: #595959;
            }
            margin-right: 40px;
        }
        .active {
            cursor: pointer;
            color: $theme;
        }
    }
    .assign-staff {
        cursor: pointer;
        color: blue;
    }
    .margin-length {
        margin-bottom: 24px;
    }
    .data-theme {
        color: $theme;
    }
    .font-color{
        color: $disabled;
    }
    .tips {
        margin-top: 1em;
        color: $disabled;
    }
}
</style>