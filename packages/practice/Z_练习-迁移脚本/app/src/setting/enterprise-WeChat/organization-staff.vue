<template>
    <div class="organization-staff">
        <div class="page-content">
            <div class="left-list">
                <!-- 左侧分组边栏 -->
                <div class="sync-type">
                    <span class="department">
                        {{'enterpriseWeChat.departSync' | t}}
                        {{syncTypeText===0?$t('enterpriseWeChat.API'):
                        (syncTypeText===1?$t('enterpriseWeChat.uploadData'):
                            '['+$t('enterpriseWeChat.API')+'/'+$t('enterpriseWeChat.uploadData')+']')}}
                    </span>
                    <button :disabled="allowSyncFlag" class="btn" @click="departSyncFlag=true">
                        <svg aria-hidden="true" :class="{active:allowSyncFlag}">
                            <use xlink:href="#icon-round-pencil"></use>
                        </svg>
                    </button>

                </div>
                <search-tree :search-tree-data="treeData" :action="false" :module-range="'weCom'" :field-height="'100%'"
                             :tree-active-id="treeActiveId" :level-stage="true" @getTreeAct="getTreeAct"></search-tree>
            </div>
            <div class="right-list">
                <div class="header-opt">
                    <span>{{departmentName}}</span>
                    <div>
                        <div class="search-box">
                            <input type="text" :placeholder="$t('enterpriseWeChat.searchKeyWord')" v-model.trim="keyWord"
                                   @keyup.enter="searchDept">>
                            <svg aria-hidden="true" @click="searchDept">
                                <use xlink:href="#icon-search"></use>
                            </svg>
                        </div>
                        <button type="button" class="btn btn-md btn-theme sync-staff" v-if="syncTypeText===0"
                                @click="syncData" :disabled="syncFlag">
                            {{syncFlag?$t('enterpriseWeChat.synchronizing'):$t('enterpriseWeChat.syn')}}
                        </button>
                        <button type="button" class="btn btn-md btn-theme sync-staff" v-if="syncTypeText===1"
                                @click="readyToUpload" :disabled="syncFlag">
                            {{syncFlag?$t('enterpriseWeChat.uploading'):$t('swarm.upload')}}
                        </button>
                        <button type="button" class="btn btn-md btn-theme sync-staff" @click="updateStaffInfoModal = true">
                            {{'enterpriseWeChat.updateStaffInfo' | t}}
                        </button>
                    </div>
                </div>
                <div class="simplify-table auto-width staff-list">
                    <table class="table">
                        <thead>
                        <tr>
                            <th width="80">{{$t('enterpriseWeChat.Avatar')}}</th>
                            <th width="100">{{$t('enterpriseWeChat.name')}}</th>
                            <th width="100">{{$t('enterpriseWeChat.Mobile')}}</th>
                            <th width="200">{{$t('enterpriseWeChat.Email')}}</th>
                            <th>{{$t('enterpriseWeChat.department')}}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="staff in workEmployeeList" :key="staff.id">
                            <td>
                                <img :src="staff.avatar?staff.avatar:avatar" class="default-avatar">
                            </td>
                            <td>{{staff.name || '/'}}</td>
                            <td>{{staff.mobile || '/'}}</td>
                            <td>{{staff.email || '/'}}</td>
                            <td>{{staff.department || '/'}}</td>
                        </tr>
                        </tbody>
                    </table>
                    <template v-if="!workEmployeeList || workEmployeeList.length <= 0">
                        <inline-loading v-if="employeeLoading"/>
                        <list-empty v-else/>
                    </template>
                </div>
                <pager :total="totalPage" :now="pageNumber" v-if="workEmployeeList.length>0" @page="pageChange"/>
            </div>
        </div>
<!--        设置部门同步方式弹窗-->
        <modal :title="$t('enterpriseWeChat.syncMethod')" v-if="departSyncFlag" @close="closeSyncModal(0)">
            <div class="set-sync-content">
                <div class="form-field">
                    <div :style="'margin-bottom: 20px;'">
                        <label class="label">{{$t('enterpriseWeChat.syncMethod')}}</label>
                        <radio :source="0" v-model="synchronizationType" @input="changeSyncType">{{$t('enterpriseWeChat.API')}}</radio>
                    </div>
                    <!-- <div class="sync-explain">
                        {{$t('enterpriseWeChat.setDepartDataStep1')}}
                        <span class="jump-wecom" @click="jumpToWeCome">{{$t('enterpriseWeChat.setDepartDataStep2')}}</span>
                        {{$t('enterpriseWeChat.setDepartDataStep3')}}
                    </div> -->
                    <label class="label"></label>
                    <radio :source="1" v-model="synchronizationType" @input="changeSyncType">
                        {{$t('enterpriseWeChat.uploadData')}}</radio>
                    <div class="sync-explain">{{$t('enterpriseWeChat.uploadNotice')}}</div>
                </div>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-white" :value="$t('common.cancel')" @click="closeSyncModal(0)">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" @click="closeSyncModal(1)">
            </template>
        </modal>
<!--        上传数据弹窗 -->
        <modal :title="$t('enterpriseWeChat.uploadData')" v-if="uploadDataFlag" @close="cancelUpload">
            <div class="upload-wrapper">
                <div>
                    1、<span class="red-text">{{$t('enterpriseWeChat.justUploadDataRed')}}</span>
                    {{$t('enterpriseWeChat.justUploadData')}}
                </div>
                <div>
                    2、{{$t('enterpriseWeChat.download')}}
                    <a class="click-download" :href="excelHref">{{$t('enterpriseWeChat.clickDown')}}</a>
                    {{$t('enterpriseWeChat.templateExcel')}}
                    <a class="click-download" :href="CSVHref">{{$t('enterpriseWeChat.clickDown')}}</a>
                    {{$t('enterpriseWeChat.templateCsv')}}
                </div>
                <div class="file-rules">
                    <p>{{$t('enterpriseWeChat.fileNamePattern')}}</p>
                    <p>{{$t('enterpriseWeChat.fileFormat')}}</p>
                    <p>{{$t('enterpriseWeChat.templateFormat')}}</p>
                    <p>{{$t('enterpriseWeChat.blankRowsAndId')}}</p>
                    <p>
                        {{$t('enterpriseWeChat.operationToUpdate')}}
                    </p>
                    <p>1.6 <span class="red-text">{{$t('enterpriseWeChat.parentIdValue')}}</span></p>
                    <p>
                        1.7 {{$t('enterpriseWeChat.wholeOrganization')}}
                        <span class="red-text">{{$t('enterpriseWeChat.operationToUpdateRed')}}</span>
                    </p>
                </div>
                <p>3、{{$t('enterpriseWeChat.selectFile')}}</p>
                <div class="field-group">
                    <label class="picker">
                        <input type="file" ref="input" @change="uploadFiles">
                        <button class="btn pull-right upload-button" @click="triggerSelect">
                            {{$t('enterpriseWeChat.uploadData')}}</button>
                        {{ fileName }}
                    </label>
                    <p v-if="fileError" class="icon icon-warn red-text"> {{filePickerError}} </p>
                </div>

            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-white" :value="$t('common.cancel')" @click="cancelUpload">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" @click="syncData">
            </template>
        </modal>

        <!-- 更新员工敏感信息弹窗 -->
        <modal :title="$t('enterpriseWeChat.updateStaffInfo')" v-if="updateStaffInfoModal" @close="closeUpdateModal">
            <div class="update-content">
                <p>
                    {{'enterpriseWeChat.updateExplainA' | t}}
                    <span class="red">{{'enterpriseWeChat.updateExplainB' | t}}</span>
                    {{'enterpriseWeChat.updateExplainC' | t}}
                </p>
                <p>{{'enterpriseWeChat.updateExplainD' | t}}</p>
                <div class="form-field">
                    <label class="label">{{$t('enterpriseWeChat.selectStaff')}}</label>
                    <div class="select-type">
                        <radio :source="'all'" v-model="updateStaffType">{{$t('enterpriseWeChat.allStaffs')}}</radio>
                        <div>
                            <radio :source="'designated'" v-model="updateStaffType">{{$t('enterpriseWeChat.designatedStaffs')}}</radio>
                            <multi-select ref="multiSelect" class="multi-select" :options="staffSelectList" v-model="checkedItem" :disabled="updateStaffType !== 'designated'"
                                :placeholder="$t('common.selectHolder')" :shortcutAction="true" :search="'async'" :autoWidth="false"
                                :dropDirection="'bottom'" :uniqueKey="'id'" :max="100" />
                        </div>
                    </div>
                </div>
                <div class="form-field">
                    <label class="label">{{$t('enterpriseWeChat.notificationContent')}}</label>
                    <div class="notify-content">
                        <wecom-text :value="{content: notificationContent}"
                            :maxlength="250"
                            @input="notificationContent = $event.content"
                            ref="msgText">
                        </wecom-text>
                    </div>
                </div>
                <p class="authorize-link">{{'enterpriseWeChat.authorizationLink' | t}}： {{authorizeLink}}</p>
                <button class="btn btn-md btn-theme" @click="notifyConfirm">{{$t('enterpriseWeChat.notifyStaffs')}}</button>
            </div>
        </modal>
    </div>
</template>

<script>
    import { WecomApiV1 } from '@/api';
    import WecomText from '@/views/wecom/components/wecom-material-editor/modules/wecom-text.vue';
    import avatar from '../images/avatar.svg';
    let timer = null;

    export default {
        name: 'OrganizationStaff',
        components: { WecomText },
        data() {
            return {
                totalPage: 1, //总页数
                pageNumber: 1,//页码
                pageSize: 20,
                keyWord: '',//查询关键字
                //deptId: '',//部门id
                workEmployeeList: [],//部门员工list
                syncFlag: false, //是否同步中
                treeData: [],//部门[{},{},{}]
                treeActiveId: '',
                departmentName: '',//部门名字
                employeeLoading: true,
                avatar: avatar,
                departSyncFlag: false, //设置部门同步弹窗显隐
                uploadDataFlag: false, //上传数据弹窗显隐
                fileName: '',
                fileError: false, //文件错误提示-显隐
                filePickerError: '', //错误提示文案
                file: null,//上传的文件
                updateStaffInfoModal: false,   //更新员工敏感信息弹窗
                updateStaffType: 'all',    //全选或指定员工
                staffSelectList: [],     //员工下拉框列表
                checkedItem: [], //选中的员工
                notificationContent: this.$t('enterpriseWeChat.notificationContentContent'),
                authorizeLink: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=CORPID&redirect_uri=REDIRECT_URI&response_type=code&scope=snsapi_base&state=STATE&agentid=AGENTID#wechat_redirect',  //授权链接

                allowSyncFlag: true,//更改同步状态是否可操作
                synchronizationType: '' ,//0API同步 1上传数据 (接口参数)
                syncTypeText: '',
                excelHref: 'https://oss.dmartech.cn/wecom/wecom_department.xlsx',
                CSVHref: 'https://oss.dmartech.cn/wecom/wecom_department.csv'
            };
        },
        watch: {
            updateStaffType(type) {
                if (type === 'all') this.selectAll();
            }
        },
        mounted() {
            this.getSyncType();
            this.getDeptList();
            this.getAllStaffs();
        },
        beforeDestroy(){
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        },
        methods: {
            //获取部门列表
            getDeptList() {
                let arr = [];
                let treeObj = {};
                WecomApiV1
                    .getDeptList()
                    .then((res) => {
                        if (res.body.code === 200) {
                            let general = res.body.data.department.length > 0 ? res.body.data.department[0] : {};
                            this.treeData = [];
                            treeObj = JSON.parse(JSON.stringify(general));
                            this.treeData.push(treeObj);
                            this.$traverseTree(this.treeData, arr);
                            this.treeData = arr;
                            if (JSON.stringify(general) !== '{}') {
                                //查找到 "总部门"，open = true
                                let firstGroup = this.$getCurrentPart(-1, this.treeData);
                                firstGroup.open = true;
                                firstGroup.noSelect = true;
                                this.treeActiveId = firstGroup.id;
                                this.departmentName = firstGroup.name;
                                this.getDeptStaffs();
                            } else {
                                this.employeeLoading = false;
                            }
                        }
                    });
            },
            //获取部门员工list
            getDeptStaffs() {
                this.employeeLoading = true;
                WecomApiV1
                    .getDeptStaffs(this.treeActiveId,this.pageNumber, this.pageSize,this.keyWord)
                    .then((res) => {
                        this.workEmployeeList = res.body.data.workEmployeeList;
                        this.totalPage = res.body.data.totalPage;
                        this.employeeLoading = false;
                    })
                    .catch(() => {
                        this.employeeLoading = false;
                    });
            },
            //获取全部员工列表
            getAllStaffs() {
                WecomApiV1.getStaffListNoPage().then(({ body }) => {
                    let list = body.data.staffList;
                    list.forEach(e => {
                        e.id = e.userId;
                        e.name = e.value;
                    });
                    this.staffSelectList = list;
                });
            },
            //根据keyword检索员工list
            searchDept() {
                this.pageNumber = 1;
                this.getDeptStaffs();
            },
            //同步数据(api同步/上传数据)
            syncData() {
                this.syncFlag = true;
                WecomApiV1
                    .syncData(this.synchronizationType, this.file)
                    .then((res) => {
                        if (res.body.code === 200) {
                            this.$toast(this.$t('form.SuccessOperate'), 'success');
                            this.syncFlag = false;
                            this.uploadDataFlag = false;
                        }
                        this.getSyncType();
                    })
                    .catch(() => {
                        this.resetUpload();
                        this.syncFlag = false;
                    });
            },
            //ready上传数据
            readyToUpload() {
                WecomApiV1
                    .getSyncType()
                    .then(({body:{data}}) => {
                        //校验当前同步状态是否一致
                        if (this.syncTypeText !== data.synchronizationType) {
                            this.$toast(this.$t('enterpriseWeChat.refreshPage'), 'warn');
                            return;
                        }
                        this.uploadDataFlag = true;
                    });
            },
            // search-tree中选择list的某一项时
            getTreeAct(group) {
                this.treeActiveId = group.id;
                this.departmentName = group.name;
                this.pageNumber = 1;
                this.getDeptStaffs();
                this.fathersOpen(this.treeData, group.wxParentId);
            },
            //选中分组的所有父级元素open=true
            fathersOpen(list, id) {
                let fathersArr = [];
                fathersArr = this.$getCurrentFathers(list, id);
                fathersArr.forEach(item => {
                    item.open = true;
                });
            },
            pageChange(e) {
                this.workEmployeeList = [];
                this.employeeLoading = true;
                this.pageNumber = e;
                this.getDeptStaffs();
            },
            changeSyncType() {
                this.file = null;
                this.filePickerError = '';
                this.fileError = false;
            },

            //获取当前同步状态
            getSyncType() {
                this.allowSyncFlag = true;
                WecomApiV1
                    .getSyncType()
                    .then((res) => {
                        this.synchronizationType = res.body.data.synchronizationType;
                        this.syncFlag = res.body.data.type === 1 ? true : false;
                        this.syncTypeText = res.body.data.synchronizationType;
                        let clearType = res.body.data.type;
                        if (clearType === 1) {
                            timer = setInterval(() => {
                                this.clearTimer(clearType);
                                this.getSyncType();
                            }, 5000);
                        } else {
                            if (timer) this.clearTimer(clearType);
                        }
                        this.allowSyncFlag = false;
                    });
            },
            // 清除定时器
            clearTimer(type) {
                clearInterval(timer);
                if (type === 0) {
                    window.location.reload();
                    timer = null;
                }
            },
            // 触发input 的 click 事件
            triggerSelect() {
                this.$refs.input.click();
            },
            //上传数据
            uploadFiles(event) {
                let file = event.target.files[0];
                if (!file) {
                    this.resetUpload();
                    return false;
                }
                // 校验文件格式
                if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
                    this.filePickerError = this.$t('swarm.selectFiles');
                    this.fileError = true;
                    this.resetUpload();
                    return;
                }
                if (!/^[$\w-]{1,128}.(csv|xlsx|xls)$/.test(file.name)) {
                    this.fileError = true;
                    this.filePickerError = this.$t('contact.wrongFileNameError');
                    this.resetUpload();
                    return;
                }
                // 校验文件大小
                if (file.size > 1024 * 1024 * 50) {
                    this.fileError = true;
                    this.filePickerError = this.$t('swarm.fileSize');
                    this.resetUpload();
                    return;
                }
                this.fileName = file.name;
                this.file = file;
                this.fileError = false;
                this.filePickerError = '';
            },
            // 取消上传请求
            resetUpload() {
                this.fileName = '';
                this.file = null;
                this.$refs.input.value = null;
            },
            //关闭上传数据弹窗
            cancelUpload() {
                this.getSyncType();
                this.resetUpload();
                this.uploadDataFlag = false;
            },
            //跳转至企业微信页面-新标签页打开
            jumpToWeCome() {
                let {href} = this.$router.resolve({
                    name: 'AgentConfig',
                    query: {id: this.$route.query.id}
                });
                window.open(href);
            },
            /**
             * 取消/确定 同步设置
             * @param type 0:取消 1：确认
             */
            closeSyncModal(type) {
                this.departSyncFlag = false;
                this.allowSyncFlag = true;
                if (type === 1) {
                    WecomApiV1
                        .updateSynchronization(this.synchronizationType)
                        .then(() => {
                            this.$toast(this.$t('form.SuccessOperate'), 'success');
                            this.getSyncType();
                        });
                } else {
                    this.getSyncType();
                }
            },
            // 关闭更新员工敏感信息弹窗
            closeUpdateModal() {
                this.updateStaffInfoModal = false;
                this.updateStaffType = 'all';
                this.checkedItem = [];
                this.notificationContent = this.$t('enterpriseWeChat.notificationContentContent');
            },
            // 选择全部员工
            selectAll() {
                this.$refs.multiSelect.clearCheckedKeys();
            },
            // 通知员工
            notifyConfirm() {
                if (this.updateStaffType !== 'all' && !this.checkedItem.length) {
                    this.$toast(this.$t('channelCode.errorStaff'), 'warn');
                    return;
                }
                if (!this.$refs.msgText.valid()) return;
                WecomApiV1
                    .updateStaffSensitiveInfo({
                        employeeIds: this.updateStaffType === 'all' ? 'all' : this.checkedItem.join(','),
                        content: this.notificationContent
                    })
                    .then(() => {
                        this.$toast(this.$t('enterpriseWeChat.notifySuccess'), 'success');
                        this.closeUpdateModal();
                    });
            },
        }
    };
</script>

<style lang="scss">
    @import '../../common/scss/base/_variables.scss';
    @import '../../common/scss/base/_mixin.scss';

    $maxHeight: calc(100vh - #{$header-height + $toolbar-height + 24px * 2 + $tab-nav-height });

    .organization-staff {
        .left-list {
            position: relative;
            height: $maxHeight;
            @include box-sizing();
            background-color: white;
            width: 260px;
            float: left;
            .left-group-sidebar{
                height: $maxHeight;
            }
            overflow: hidden;
            .tree-menu-wrapper {
                max-height: calc(100vh - #{$header-height + $toolbar-height + 24px * 2 + 35px + $tab-nav-height + 38px});
                padding-bottom: 20px;
                ul {
                    overflow: auto;
                }
            }
            .sync-type {
                padding: 10px;
                svg {
                    width: 16px;
                    height: 16px;
                    vertical-align: middle;
                    fill: $green;
                    &.active {
                        fill: $disabled;
                    }
                }

            }
        }

        .right-list {
            margin-left: 10px;
            padding: 16px;
            @include width-calc(calc(100% - 320px));
            float: left;
            @include box-sizing();
            background-color: white;
            height: calc(100vh - #{$header-height + $toolbar-height + 24px * 2 + $tab-nav-height});
            overflow-y: scroll;

            .header-opt {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;

                .sync-staff {
                    margin-left: 20px;
                }
            }
            .simplify-table {
                table {
                    tr {
                        td {
                            white-space: normal;
                        }
                    }
                }
                .default-avatar {
                    width: 30px;
                    height: 30px;
                }
            }
        }
        .set-sync-content {
            .sync-explain {
                padding: 0 20px 0 130px;
                .jump-wecom {
                    color: $green;
                    cursor: pointer;
                }
            }
        }
        .upload-wrapper{
            line-height: 24px;
            .red-text {
                color: $red;
            }
            .click-download {
                color: $green;
                cursor: pointer;
            }
            .file-rules {
                p {
                    padding-left: 20px;
                }
            }
            .picker {
                position: relative;
                display: inline-block;
                vertical-align: middle;
                min-width: 448px;
                padding-left: 16px;
                border-radius: 4px;
                line-height: $input-field-height - 2px;
                border: solid 1px $border-color;
                overflow: hidden;
                margin-top: 10px;

                [type="file"] {
                    display: none;
                }
                .upload-button {
                    padding: 0 2em;
                    cursor: pointer;
                    background-color: rgb(240, 240, 240);
                    border-left: 1px solid $border-color;
                    border-radius: initial;
                }

                &:hover {
                    border-color: $light-theme;

                    .upload-button {
                        border-left-color: $light-theme;
                    }
                }
            }
        }

        .update-content {
            p {
                line-height: 24px;
                margin: 5px auto;

                .red {
                    color: $red;
                }
            }
            
            .form-field {
                display: flex;
                margin-top: 20px;

                .label {
                    width: 70px;
                    margin-right: 30px;
                }
                
                .select-type {
                    display: flex;
                    justify-content: space-between;
                    width: 450px;

                    .radio {
                        vertical-align: top;
                    }

                    .multi-select {
                        text-align: left;
                        width: 214px;
                        margin-left: 10px;

                        .select-text {
                            .title {
                                max-width: 165px;
                            }
                        }
                    }
                }

                .notify-content {
                    .wecom-text {
                        width: 450px;
                        height: auto;
                        line-height: normal;
                    }
                }
            }

            .authorize-link {
                width: 450px;
                background: $content-bg;
                padding: 5px;
                margin-left: 100px;
            }

            .btn {
                margin-left: 100px;
            }
        }
    }
</style>
