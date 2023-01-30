<template>
    <div class="visible-range">
        <div class="tab-edit">
            <div class="edit-left-title">
                {{'enterpriseWeChat.tabpage' | t}}
            </div>
            <div class="edit-left-options">
                <div class="edit-btn options-item edit-btn-width" @click="editTab">{{'enterpriseWeChat.edit' | t}}</div>
                <div class="options-item" v-show="type === 'attr'">{{'enterpriseWeChat.accessProperties' | t}}</div>
                <div class="options-item" v-show="type === 'event'">{{'enterpriseWeChat.accessEvents' | t}}</div>
                <div class="dep-employ">
                    <div class="field-dept">
                        <div class="dept-title options-item">{{'enterpriseWeChat.departments' | t}}:</div>
                        <div class="options-item dept-staff-list" v-text="deptNameList"></div>
                    </div>
                    <div class="field-employ">
                        <div class="employ-title options-item">{{'enterpriseWeChat.employees' | t}}:</div>
                        <div class="options-item dept-staff-list" v-text="staffNameList"></div>
                    </div>
                </div>

            </div>
        </div>
        <div class="field-config">
            <div class="field-name" v-show="type === 'attr'">
                {{'enterpriseWeChat.fields' | t}}
            </div>
            <div class="field-name" v-show="type === 'event'">
                {{'enterpriseWeChat.events' | t}}
            </div>
            <ul class="field-options">
                <li v-show="type === 'attr'">{{'enterpriseWeChat.configureFields' | t}}</li>
                <li v-show="type === 'event'">{{'enterpriseWeChat.configureEvents' | t}}</li>
            </ul>
        </div>
        <!-- 批量编辑 -->
        <div class="table-content">
            <div class="table-header">
                <div class="hidden-menu-trigger batch-actions">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-batch"></use>
                    </svg>
                    <span>{{'enterpriseWeChat.batchAction' | t}}</span>
                    <div class="hidden-menu">
                        <button class="btn" @click="batchEdit">
                            {{'enterpriseWeChat.batchEdit' | t}}
                        </button>
                    </div>
                </div>
                <!-- 搜索关键字 -->
                <div class="search-box">
                    <input type="text" :placeholder="$t('enterpriseWeChat.searchByKeywords')" v-model.trim="keyWords">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </div>
            </div>
            <!-- 属性列表 -->
            <div class="visible-range-table" v-show="type==='attr'">
                <div class="simplify-table">
                    <table>
                        <thead>
                            <tr>
                                <th width="47"></th>
                                <th></th>
                                <th style="text-align: right">{{'enterpriseWeChat.allowedUsers' | t}}</th>
                                <th></th>
                                <th></th>
                            </tr>
                            <tr>
                                <th class="diff-overflow" width="47">
                                    <choose-all-action @choosePage="choosePageData" @clear="clearChoose" />
                                </th>
                                <th v-for="(item,index) in attrThList" :key="item.id">{{item.name}}</th>
                            </tr>
                        </thead>
                    </table>
                </div>
                <template v-if="loading">
                    <inline-loading />
                </template>
                <div class="simplify-table visible-range-tbody" v-else-if="attrFilterData.length >0">
                    <table>
                        <tbody>
                            <tr v-for="(attr,index) in attrFilterData" :key="attr.id">
                                <td class="checked" width="47">
                                    <checkbox :source="attr.id" v-model="checkedItem"></checkbox>
                                </td>
                                <td>{{attr.meaning}}</td>
                                <td :title="attr.deptNameList ? attr.deptNameList.join($t('enterpriseWeChat.separator')) : ''">
                                    {{attr.deptNameList ? attr.deptNameList.join($t('enterpriseWeChat.separator')) : ''}}</td>
                                <td :title="attr.userNameList ? attr.userNameList.join($t('enterpriseWeChat.separator')) : ''">
                                    {{attr.userNameList ? attr.userNameList.join($t('enterpriseWeChat.separator')) : ''}}</td>
                                <td>
                                    <button type="button" class="btn edit-btn" @click="fieldEdit(attr)">
                                        {{'enterpriseWeChat.edit' | t}}
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <list-search-empty v-else/>
            </div>
            <!-- 事件列表 -->
            <div class="visible-range-table" v-show="type==='event'">
                <div class="simplify-table">
                    <table>
                        <thead>
                            <tr>
                                <th width="47"></th>
                                <th></th>
                                <th style="text-align: right">{{'enterpriseWeChat.allowedUsers' | t}}</th>
                                <th></th>
                                <th></th>
                            </tr>
                            <tr>
                                <th class="diff-overflow" width="47">
                                    <choose-all-action @choosePage="choosePageData" @clear="clearChoose" />
                                </th>
                                <th v-for="(item,index) in eventThList" :key="item.id">{{item.name}}</th>
                            </tr>
                        </thead>
                    </table>
                </div>
                <template v-if="loading">
                    <inline-loading />
                </template>
                <div class="simplify-table visible-range-tbody" v-else-if="eventFilterData.length>0">
                    <table>
                        <tbody>
                            <tr v-for="(event,index) in eventFilterData" :key="event.id">
                                <td class="checked" width="47">
                                    <checkbox :source="event.id" v-model="checkedItem"></checkbox>
                                </td>
                                <td>{{event.meaning}}</td>
                                <td :title="event.deptNameList ? event.deptNameList.join($t('enterpriseWeChat.separator')) : ''">
                                    {{event.deptNameList ? event.deptNameList.join($t('enterpriseWeChat.separator')) : ''}}</td>
                                <td :title="event.userNameList ? event.userNameList.join($t('enterpriseWeChat.separator')) : ''">
                                    {{event.userNameList ? event.userNameList.join($t('enterpriseWeChat.separator')) : ''}}</td>
                                <td>
                                    <button type="button" class="btn edit-btn" @click="fieldEdit(event)">
                                        {{'enterpriseWeChat.edit' | t}}
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <list-search-empty v-else/>
            </div>
        </div>
        <!-- 属性、事件弹窗 -->
        <modal v-if="modalTab" :title="modalTitle" @close="modalTab = false">
            <div class="seletor-title">{{'enterpriseWeChat.selectByWeComDepartments' | t}}</div>
            <multi-select class="multi-select" :options="departmentList" :placeholder="$t('tag.select')" v-model="departmentIds"
                :search="'async'" @change="selectDept" :dropDirection="'bottom'">
            </multi-select>
            <div class="seletor-title">{{'enterpriseWeChat.selectByWeComEmployees' | t}}</div>
            <multi-select class="multi-select" :options="staffList" :placeholder="$t('tag.select')" v-model="staffIds"
                @change="selectStaff" :search="'async'" :dropDirection="'bottom'">
            </multi-select>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')"
                    @click="modalTab = false">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" @click="handleSave">
            </template>
        </modal>
        <!-- 字段 -->
        <modal v-if="modalField" :title="attrEventTitle" @close="modalField = false">
            <div class="seletor-title">{{'enterpriseWeChat.selectByWeComDepartments' | t}}</div>
            <multi-select class="multi-select" :options="departmentList" :placeholder="$t('tag.select')" v-model="fieldDepartmentIds"
                :search="'async'" @change="selectDept" :dropDirection="'bottom'">
            </multi-select>
            <div class="seletor-title">{{'enterpriseWeChat.selectByWeComEmployees' | t}}</div>
            <multi-select class="multi-select" :options="staffList" :placeholder="$t('tag.select')" v-model="fieldStaffIds"
                @change="selectStaff" :search="'async'" :dropDirection="'bottom'">
            </multi-select>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')"
                    @click="handleCancle">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" @click="saveField">
            </template>
        </modal>
        <!-- 批量设置字段 -->
        <modal v-if="fieldesEdit" :title="fieldsTitle" @close="fieldesEdit = false">
            <div class="seletor-title">{{'enterpriseWeChat.selectByWeComDepartments' | t}}</div>
            <multi-select class="multi-select" :options="departmentList" :placeholder="$t('tag.select')" v-model="batchDepartmentIds"
                :search="'async'" :dropDirection="'bottom'">
            </multi-select>
            <div class="seletor-title">{{'enterpriseWeChat.selectByWeComEmployees' | t}}</div>
            <multi-select class="multi-select" :options="staffList" :placeholder="$t('tag.select')" v-model="batchStaffIds"
                :search="'async'" :dropDirection="'bottom'">
            </multi-select>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')"
                    @click="fieldesEdit = false">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" :disabled="saveLoading" @click="saveFieldes">
            </template>
        </modal>
    </div>
</template>

<script>
import { WebServAttrApiV1, WecomApiV1, WebServEventApiV1 } from '@/api';
export default {
    name: 'VisibleRange',
    props: {
        option: {
            type: String
        }
    },
    data () {
        return {
            loading:false,
            type: this.option,
            attrThList: [
                {
                    id: 1,
                    name: this.$t('enterpriseWeChat.fields')
                },
                {
                    id: 2,
                    name: this.$t('enterpriseWeChat.departments')
                },
                {
                    id: 3,
                    name: this.$t('enterpriseWeChat.employees')
                },
                {
                    id: 4,
                    name: this.$t('enterpriseWeChat.actions')
                }
            ],
            eventThList: [
                {
                    id: 1,
                    name: this.$t('enterpriseWeChat.events')
                },
                {
                    id: 2,
                    name: this.$t('enterpriseWeChat.departments')
                },
                {
                    id: 3,
                    name: this.$t('enterpriseWeChat.employees')
                },
                {
                    id: 4,
                    name: this.$t('enterpriseWeChat.actions')
                }
            ],
            attrTableList: [],      //属性可见范围列表
            eventTableList: [],     //事件可见范围列表
            modalTitle: '',         //标题名称
            fieldsTitle:'',
            attrEventTitle:'',
            rootDeptId: '',         //根部门id
            modalTab: false,         //tab页弹窗
            fieldesEdit: false,      //批量设置字段
            modalField: false,

            departmentList: [],      //部门列表
            departmentIds: [],       //部门id

            staffList: [],           //员工列表
            staffIds: [],             //员工id

            selectDeptList: [],      //选中的部门
            selectStaffList: [],      //选中的员工

            deptNameList: '',        //页面部门名称回显
            staffNameList: '',        //页面员工名称回显
            checkedItem: [],           //已选中的字段、事件
            keyWords: '',               //搜索关键字
            attrEventId: '',           //属性/事件id
            attrEventName: '',           //属性/事件name
            batchDepartmentIds: [],      //批量部门id
            batchStaffIds: [],           //批量员工id
            fieldDepartmentIds:[],      //属性/事件部门id
            fieldStaffIds:[],          //属性/事件员工id
            cloneDepId:[],
            cloneStaffId:[],
            saveLoading:false           //禁止点击保存按钮
        };
    },
    mounted () {
        this.getDeptList();
        this.getDeptStaffs();
        if (this.type === 'attr') {
            this.getAttrList(1);
            this.getTabShowDetail(1);
        } else {
            this.getEventList(2);
            this.getTabShowDetail(2);
        }
    },
    computed: {
        attrFilterData () {
            if (!this.keyWords) {
                return this.attrTableList;
            }
            return this.attrTableList.filter(val => {
                if (val.meaning.indexOf(this.keyWords) !== -1) {
                    return val;
                }
                if (val.userNameList ? val.userNameList.toString().indexOf(this.keyWords) !== -1 : '') {
                    return val;
                }
                if (val.deptNameList ? val.deptNameList.toString().indexOf(this.keyWords) !== -1 : '') {
                    return val;
                }
            });
        },
        eventFilterData () {
            if (!this.keyWords) {
                return this.eventTableList;
            }
            return this.eventTableList.filter(val => {
                if (val.meaning.indexOf(this.keyWords) !== -1) {
                    return val;
                }
                if (val.userNameList ? val.userNameList.toString().indexOf(this.keyWords) !== -1 : '') {
                    return val;
                }
                if (val.deptNameList ? val.deptNameList.toString().indexOf(this.keyWords) !== -1 : '') {
                    return val;
                }
            });
        }
    },
    methods: {
        // 编辑tab
        editTab () {
            this.modalTitle = this.option === 'attr' ? this.$t('enterpriseWeChat.setPropertyTab') : this.$t('enterpriseWeChat.setEventTab');
            this.departmentIds = this.cloneDepId;
            this.staffIds = this.cloneStaffId;
            this.modalTab = true;
        },
        //编辑字段
        fieldEdit (id) {
            this.attrEventTitle = this.option === 'attr' ? this.$t('enterpriseWeChat.ConfigAllowedFields') : this.$t('enterpriseWeChat.ConfigAllowedEvents');
            this.modalField = true;
            const fIds = id.deptIdList ? id.deptIdList : [];
            this.fieldDepartmentIds = fIds.filter(e => e !== this.rootDeptId);
            this.fieldStaffIds = id.userIdList ? id.userIdList : [];
            this.attrEventId = id.id;
            this.attrEventName = id.name;
        },
        handleCancle(){
            this.checkedItem = [];
            this.modalField = false;
        },
        // 保存字段
        saveField () {
            let type = this.type === 'attr' ? 1 : 2;
            let depIds = this.fieldDepartmentIds ? this.fieldDepartmentIds : [];
            let userIds = this.fieldStaffIds ? this.fieldStaffIds : [];
            let attrEvents = [{ attrEventId: Number(this.attrEventId), attrEventName: this.attrEventName }];
            this.checkedItem = [];
            WecomApiV1
                .updateAttrEventShowDetail(type, depIds, userIds, attrEvents)
                .then((res) => {
                    if (res.statusCode === 200) {
                        if (this.type === 'attr') {
                            this.getAttrList(1);
                        } else {
                            this.getEventList(2);
                        }
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                        this.modalField = false;
                    }
                })
                .catch(()=>{
                    this.$toast(this.$t('openPlat.desenFail'), 'warn');
                });
        },
        //选择部门
        selectDept (dept) {
            this.selectDeptList = dept;
        },
        // 选择员工
        selectStaff (staff) {
            this.selectStaffList = staff;
        },
        batchEdit() {
            if (this.checkedItem.length === 0) {
                return this.type === 'attr' ?  this.$toast(this.$t('enterpriseWeChat.noFieldsSelected'),'warn') : 
                    this.$toast(this.$t('enterpriseWeChat.noEventsSelected'),'warn');
            }
            this.fieldsTitle = this.option === 'attr' ? this.$t('enterpriseWeChat.BatchFields') : this.$t('enterpriseWeChat.BatchEvents');
            this.batchDepartmentIds = [];
            this.batchStaffIds = [];
            this.fieldesEdit = true;
        },
        //批量保存字段
        saveFieldes () {
            if (Number(this.batchDepartmentIds.length) + Number(this.batchStaffIds.length) > 10) {
                return this.$toast(this.$t('enterpriseWeChat.batichLimit'), 'warn');
            }
            this.saveLoading = true;    //防止多次点击保存按钮
            let type = this.type === 'attr' ? 1 : 2;
            let depIds = this.batchDepartmentIds ? this.batchDepartmentIds : [];
            let userIds = this.batchStaffIds ? this.batchStaffIds : [];
            let attrEvents = [];
            if (this.type === 'attr') {
                attrEvents = this.checkedItem.map(id => {
                    const data = this.attrTableList.find(item => id === item.id);
                    return {
                        attrEventId: Number(data.id),
                        attrEventName: data.name
                    };
                });
            } else {
                attrEvents = this.checkedItem.map(id => {
                    const data = this.eventTableList.find(item => id === item.id);
                    return {
                        attrEventId: Number(data.id),
                        attrEventName: data.name
                    };
                });
            }
            WecomApiV1
                .updateAttrEventShowDetail(type, depIds, userIds, attrEvents)
                .then((res) => {
                    if (res.statusCode === 200) {
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                        if (this.type === 'attr') {
                            this.getAttrList(1);
                        } else {
                            this.getEventList(2);
                        }
                        this.fieldesEdit = false;
                        this.checkedItem = [];
                        this.saveLoading = false;
                    }
                })
                .catch(()=>{
                    this.$toast(this.$t('openPlat.desenFail'), 'warn');
                });
        },
        // 选择全部数据
        choosePageData () {
            if (this.type === 'attr') {
                this.checkedItem = this.attrFilterData.map(item => item.id);
            } else {
                this.checkedItem = this.eventFilterData.map(item => item.id);
            }
        },
        // 清空全部数据
        clearChoose () {
            this.checkedItem = [];
        },
        // 保存tab页
        handleSave () {
            let nameList = [];
            let staffList = [];
            let depIds = this.departmentIds ? this.departmentIds : [];
            let userIds = this.staffIds ? this.staffIds : [];
            let type = this.type === 'attr' ? 1 : 2;
            WecomApiV1
                .updateTabShowDetail(type, depIds, userIds)
                .then((res) => {
                    if (res.statusCode === 200) {
                        this.selectDeptList.forEach((item) => {
                            nameList.push(item.name);
                        });
                        this.deptNameList = nameList.join(this.$t('enterpriseWeChat.separator'));

                        this.selectStaffList.forEach((item) => {
                            staffList.push(item.name);
                        });
                        this.staffNameList = staffList.join(this.$t('enterpriseWeChat.separator'));
                        let type = this.type === 'attr' ? 1 : 2;
                        this.getTabShowDetail(type);
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                    }
                })
                .catch(() => {
                    this.$toast(this.$t('openPlat.desenFail'), 'warn');
                });
            this.modalTab = false;
        },
        //获取部门列表
        getDeptList () {
            WecomApiV1
                .getDeptList()
                .then(({ body: { data:{ department} } }) => {
                    this.departmentList = this.flatArray(department).filter((e,i) => i > 0);
                    this.rootDeptId = department[0].id;
                });
        },
        //获取员工列表
        getDeptStaffs () {
            WecomApiV1
                .getStaffListNoPage()
                .then((res) => {
                    let list = res.body.data.staffList;
                    list.forEach(e => {
                        e.name = e.value;
                    });
                    this.staffList = list;
                });
        },
        //获取属性列表
        getAttrList (tabType) {
            this.loading = true;
            WebServAttrApiV1
                .getAttributes({ attrType: 0, isFilter: '', isResult: '' })
                .then(({ body: { data } }) => {
                    WecomApiV1
                        .getAttrEventShowDetail(tabType)
                        .then((res) => {
                            const arrs = data.attributeList.map(attr => {
                                const data = res.body.data.attrEventShowDetail.find(i =>
                                    attr.id === Number(i.attrEventId));
                                return {
                                    ...attr,
                                    ...data,
                                    depIds: data ? data.depIds : [],
                                    userIds: data ? data.userIds : [],
                                };
                            });
                            arrs.forEach(item => {
                                let deptNameList = [];
                                let depIdList = [];
                                let userNameList = [];
                                let userIdList = [];
                                item.depIds.forEach(dep => {
                                    deptNameList.push(dep.name);
                                    depIdList.push(dep.id);
                                    item.deptNameList = deptNameList;
                                    item.deptIdList = depIdList;
                                });
                                item.userIds.forEach(user => {
                                    userNameList.push(user.name);
                                    userIdList.push(user.id);
                                    item.userNameList = userNameList || '';
                                    item.userIdList = userIdList || '';
                                });
                            });
                            this.attrTableList = arrs;
                            this.loading = false;
                        });
                });
        },
        // 获取事件列表
        getEventList (tabType) {
            this.loading = true;
            WebServEventApiV1
                .getMetaEventList()
                .then(({ body: { data } }) => {
                    WecomApiV1
                        .getAttrEventShowDetail(tabType)
                        .then((res) => {
                            const events = data.eventList.map(event => {
                                const eventData = res.body.data.attrEventShowDetail.find(i =>
                                    event.id === Number(i.attrEventId));
                                return {
                                    ...event,
                                    ...eventData,
                                    depIds: eventData ? eventData.depIds : [],
                                    userIds: eventData ? eventData.userIds : [],
                                };
                            });
                            events.forEach(item => {
                                let deptNameList = [];
                                let depIdList = [];
                                let userNameList = [];
                                let userIdList = [];
                                item.depIds.forEach(dep => {
                                    deptNameList.push(dep.name);
                                    depIdList.push(dep.id);
                                    item.deptNameList = deptNameList;
                                    item.deptIdList = depIdList;
                                });
                                item.userIds.forEach(user => {
                                    userNameList.push(user.name);
                                    userIdList.push(user.id);
                                    item.userNameList = userNameList;
                                    item.userIdList = userIdList;
                                });
                            });
                            this.eventTableList = events;
                            this.loading = false;
                        });
                });
        },
        // tab页数据加载
        getTabShowDetail(tabType) {
            WecomApiV1
                .getTabShowDetail(tabType)
                .then(({body:{data}})=>{
                    let deptIds = [];
                    let dept = [];
                    let staffIds = [];
                    let staff = [];
                    data.depIds.forEach((item)=>{
                        deptIds.push(item.id);
                        dept.push(item.name);
                    });
                    data.userIds.forEach((item)=>{
                        staffIds.push(item.id);
                        staff.push(item.name);
                    });
                    this.departmentIds = deptIds ? deptIds : [];
                    this.staffIds = staffIds ? staffIds : [];
                    // 存储属性/事件tab页部门和员工id
                    this.cloneDepId = this.departmentIds;
                    this.cloneStaffId = this.staffIds;
                    this.deptNameList = dept ? dept.join(this.$t('enterpriseWeChat.separator')) : [];
                    this.staffNameList = staff ? staff.join(this.$t('enterpriseWeChat.separator')) : '';
                });
        },
        // 扁平化数组
        flatArray(arr, newArr = []) {
            arr.forEach((item)=>{
                typeof (item) === 'object' && item.name && newArr.push(item);
                item.childs && item.childs instanceof Array && this.flatArray(item.childs,newArr);
            });
            return newArr;
        }
    }
};
</script>

<style lang="scss">
@import "../../../common/scss/base/_variables.scss";
@import "../../../common/scss/base/_mixin.scss";
.visible-range {
    .tab-edit,
    .field-config {
        display: flex;
        font-size: 14px;
        .edit-left-title,
        .field-name {
            white-space: nowrap;
            text-align: right;
            margin-left: 53px;
            width: 37px;
            margin-right: 20px;
        }
        .edit-left-options,
        .field-options {
            li {
                margin-bottom: 16px;
            }
            .edit-btn {
                cursor: pointer;
                color: #57c3aa;
            }
        }
        .options-item {
            margin-bottom: 16px;
        }
        .edit-btn-width{
            width: 35px;
        }
        .dep-employ {
            .field-dept,
            .field-employ {
                display: flex;
            }
            .dept-title,
            .employ-title {
                white-space: nowrap;
            }
        }
    }
    .table-content {
        margin-left: 108px;
        .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            .batch-actions {
                position: relative;
                cursor: pointer;
                width: 80px;
                line-height: $input-field-height;

                &:hover {
                    color: $color-title;
                }

                svg {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    vertical-align: top;
                    margin-top: ($input-field-height - 18px)/2;
                    fill: currentColor;
                    &.gengduo {
                        padding-right: 84px;
                    }
                }
                .hidden-menu {
                    top: $input-field-height;
                    left: 0;
                    text-align: left;
                    @include transform-origin(left top);
                }
            }
        }
    }
    .visible-range-table {
        .visible-range-tbody {
            height: 1000px;
            overflow: scroll;
        }
        th {
            text-align: center;
        }
        td {
            text-align: center;
            .edit-btn {
                cursor: pointer;
                color: #57c3aa;
            }
        }
        .diff-overflow {
            overflow: unset;
        }
    }
    .multi-select {
        width: 300px;
        margin-bottom: 10px;
    }
    .seletor-title {
        font-size: 16px;
        margin-bottom: 10px;
    }
}
</style>