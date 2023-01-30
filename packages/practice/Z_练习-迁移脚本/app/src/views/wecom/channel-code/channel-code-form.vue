<template>
    <div class="new-channel-code">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <!-- 头部标题 -->
        <div class="page-head">
            <div class="content-view">
                <h1>{{title}}</h1>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view white-bg padding margin form-container">
                <!-- 基础信息 -->
                <h3>{{'channelCode.info' | t}}</h3>
                <div class="disabled-text welcome-tip">{{'channelCode.infoTip' | t}}</div>
                <!-- 活码名称 -->
                <div class="form-field">
                    <label class="label placeholder" for="use"><span class="red-text">*</span>{{'channelCode.codeName' | t}}</label>
                    <input class="input" type="text" maxlength="30"
                    :placeholder="$t('channelCode.codeNameholder')" v-model="getInfo.name"
                    :disabled="~~this.$route.params.id !== 0"
                     v-title:top.line.warn="errorTitle" :class="{error: errorTitle}"
                     @focusin="errorTitle = ''"/>
                </div>
                <!-- 目标分组 -->
                <div class="form-field choose-parent-wrapper">
                    <label class="label placeholder" for="use"><span class="red-text">*</span>{{'material.targetGroup' | t}}</label>
                    <div class="choose-parent" id="use" @click.stop="readyCheckGroup">
                        <label class="select-text">
                            {{parentGroupName || $t('common.selectHolder')}}
                            <span class="select-icon icon icon-arrow-down"></span>
                        </label>
                        <div class="search-tree-wrapper" v-if="groupSelectShow" @click.stop>
                            <search-tree :searchTreeData="orderOptions" :treeActiveId="getInfo.channelCodeGroups"
                                            @getTreeAct='getTreeAct' :action="false"
                                            :levelStage="true"></search-tree>
                        </div>

                    </div>
                </div>
                <!-- 选择员工 -->
                <div class="form-field flex">
                    <label class="label">
                        <span class="red-text">*</span>
                        {{'channelCode.selectPerson' | t}}
                        <i class="icon icon-yiwen1" v-title:right="$t('channelCode.staffTip')"></i>
                    </label>
                    <div class="field-group">
                        <multi-select class="xl hg" :options="staffList" v-model="getInfo.employeeIds" :shortcutAction="true"
                                    :search="'async'" :autoWidth="false" :dropDirection="'bottom'"
                                    :uniqueKey="'userId'"
                                    :placeholder="$t('channelCode.addPersonholder')" :max="100"/>
                    </div>
                </div>
                <!-- 添加设置 -->
                <div class="form-field">
                    <label class="label">{{'channelCode.addSet' | t}}</label>
                    <switch-button v-model="getInfo.skipVerify"></switch-button>
                    <span class="disabled-text">{{'channelCode.switch' | t}}</span>
                </div>
                <!-- 联系人标签 -->
                <div class="form-field flex">
                    <label class="label">
                        {{'channelCode.addTag' | t}}
                    </label>
                    <div class="field-group">
                         <selector-tree :options='groupList' @checkOptions='checked($event)' v-model='checkedContactItem' :maxlength="200"/>
                    </div>
                </div>
                <!-- 欢迎语 -->
                <h3>{{'channelCode.welcome' | t}}</h3>
                <div class="disabled-text welcome-tip">{{'channelCode.welcomeTip' | t}}</div>
                <div class="form-field">
                    <label class="label">{{'channelCode.setWelcom' | t}}</label>
                    <radio :source="1" v-model="getInfo.welcome">{{'channelCode.roadWelcom' | t}}</radio>
                    <radio :source="0" v-model="getInfo.welcome">{{'channelCode.noWelcom' | t}}</radio>
                </div>
                <div v-if="getInfo.welcome === 1">
                    <!-- 欢迎语1 -->
                    <div class="form-field">
                        <label class="label"><span class="red-text">*</span>{{'channelCode.welcome' | t}}1</label>
                        <div class="textarea-box">
                            <textarea class="textarea" v-title:top.line.warn="errorText"
                                v-model.trim="getInfo.sendContent" maxlength="1000"
                                @focusin="errorText = ''"></textarea>
                            <span class="text-num disabled-text"><span class="theme-text">{{getInfo.sendContent.length}}</span>/1000</span>
                        </div>
                    </div>
                    <!-- 欢迎语2 -->
                    <div class="form-field wecom-editor">
                        <label class="label"><span class="red-text">*</span>{{'channelCode.welcome' | t}}2</label>
                        <wecom-material-editor class="wecom-material-editor" :msgtypes="avaliableTypes" :val.sync="message[message.msgtype]"
                            :msgtype.sync="message.msgtype" @switch="handleSwitch(message)" ref="editor">
                        </wecom-material-editor>
                    </div>
                </div>
                <button class="btn btn-md btn-theme" :disabled="saveLoading" @click="save">{{'channelCode.save' | t}}</button>
            </div>
        </div>
    </div>
</template>
<script type="text/babel">
    import { WecomApiV1, ContactApiV1 } from '@/api';
    import SelectorTree from '@/common/components/selector-tree.vue';
    import { WecomMaterialEditor } from '@/views/wecom/components';
    export default {
        name: 'ChannelCodeForm', // 渠道活码编辑
        components: {
            SelectorTree,
            WecomMaterialEditor
        },
        data() {
            return {
                title: '', // 展示 新建活码or编辑活码
                parentGroupName: '', //选择分组
                groupSelectShow: false, // 分组显示
                orderOptions: [], // 分组树形数据
                groupList: [],  // 分组列表
                checkedContactItem: [], // 选择联系人标签list
                allLabelList: [], // 选择联系人标签列表
                staffList: [], // 选择员工
                getInfo: {
                    id: '', // 渠道活码id
                    name: '', // 渠道活码名称
                    channelCodeGroups: '', // 渠道活码分组id
                    employeeIds: [], // 员工id列表
                    contactLabelIds: [], // 联系人标签id列表
                    skipVerify: false, // 添加设置（1.开启,无需好友验证  0.未开启,扫码需好友验证）
                    welcome: 0, // 设置欢迎语（1.渠道欢迎语 0.不发送欢迎语）
                    attachments: '', // 欢迎语内容JSON，示例如初始值  ，attachments里的内容为欢迎语2的内容，类型三选一（图片、链接、小程序），若没有欢迎语2则不传attachments
                    sendContent: '', // sendContent里的内容为欢迎语1的内容，若没有欢迎语1则不传sendContent(该内容为企业微信官方文档text类型下的 content)
                    codeUrl: '', // 渠道活码链接,
                    configId: '', // 企业联系方式的配置id
                }, 
                errorTitle: '', // 活码名称错误提示
                errorText: '', // 活码欢迎语1错误提示
                avaliableTypes: ['none', 'image', 'link', 'miniprogram'], // 企业微信组件类型（无， 图片， 链接，小程序）
                message: {
                    msgtype: 'none',
                },
                saveLoading: false, // 保存禁止点击
            };
        },
        computed: {
            crumbs() {
                return [
                    {name: 'wecom', text: 'Dmartech'},
                    {name: 'channelCode', text: this.$t('home.channelCode')},
                    {name: 'channelCodeEdit', params: {id: this.$route.params.id}, text: this.title}
                ];
            },
        },
        watch: {
            // 获取被选中的联系人标签ID
            checkedContactItem(val) {
                this.getInfo.contactLabelIds = [];
                for (let i = 0; i < val.length; i++) {
                    this.getInfo.contactLabelIds.push(val[i].id);
                }
            },
        },
        mounted() {
            // 获取联系人标签
            this.getVipLabel();
            // 获取员工列表
            this.getStaffList();
            // this.getGroup();
            // 编辑时获取单个渠道活码详情
            if (~~this.$route.params.id !== 0) {
                this.getChannelDetail();
            } else {
                this.getInfo.channelCodeGroups = this.$route.query.channelGroupId;
                // 获取分组列表
                this.getGroup();
            }
            //点击其他地方下拉菜单收起
            window.addEventListener('click', this.eventListener);

            // 标题
            this.title = ~~this.$route.params.id === 0 ? this.$t('channelCode.newSetCode') : this.$t('channelCode.edit');
        },
        methods: {
            /**
             * @description 削除无用key
             * @param {object} target 目标消息对象
             */
            handleSwitch (target) {
                Object.keys(target).forEach(key => {
                    if (key !== 'msgtype' && key !== target.msgtype) {
                        this.$delete(target, key);
                    }
                });
            },
            // 获取联系人标签
            getVipLabel() {
                this.$loading();
                ContactApiV1
                    .getGroups({
                        sortType: this.sortType
                    })
                    .then((res) => {
                        this.groupList = res.body.data.rootGroup.childs;
                        // 将选中的会员标签回显
                        if (this.getInfo.contactLabelIds.length > 0) {
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
                                this.getInfo.contactLabelIds.map(contact => {
                                    if (item.id === parseInt(contact)) {
                                        this.checkedContactItem = this.checkedContactItem.concat(item);
                                    }
                                });
                            });
                        }
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 编辑时获取单个渠道活码详情
            getChannelDetail() {
                WecomApiV1
                    .channelCode(this.$route.params.id)
                    .then(({ body: { data } }) => {
                        this.getInfo.id = data.id;
                        this.getInfo.name = data.name;
                        this.getInfo.channelCodeGroups = Number(data.channelCodeGroups.toString());
                        this.getInfo.employeeIds = data.userIds;
                        this.getInfo.contactLabelIds = data.contactLabelIds;
                        this.getInfo.skipVerify = data.skipVerify === 0 ? false : true;
                        this.getInfo.welcome = data.welcome;
                        if ( data.attachments.length > 0) {
                            this.message = data.attachments[0];
                        } else {
                            this.message.msgtype = 'none'; 
                        }
                        this.getInfo.sendContent = data.sendContent;
                        this.getInfo.codeUrl = data.codeUrl;
                        this.getInfo.configId = data.configId;
                        // 获取分组列表
                        this.getGroup();
                    });
            },
            /**
             * @description: 返回数组相同的部分内容
             * @param {Array} arr1
             * @param {Array} arr2
             * @return {Array}}
             */            
            getArrEqual(arr1, arr2) {
                let newArr = [];
                for (let i = 0; i < arr2.length; i++) {
                    for (let j = 0; j < arr1.length; j++) {
                        if (arr1[j] === arr2[i]){
                            newArr.push(arr1[j]);
                        }
                    }
                }
                return newArr;
            },
            // 获取员工列表
            getStaffList() {
                let arr = [];
                WecomApiV1
                    .getAuthorityStaffListNoPage()
                    .then(({ body: {data} }) => {
                        data.staffList.forEach(item => {
                            item.name = item.value;
                            arr.push(item.userId);
                        });
                        this.staffList = data.staffList;
                        this.getInfo.employeeIds = this.getArrEqual(arr, this.getInfo.employeeIds);
                    });
            },
            // 选择联系人标签
            checked(val) {
                this.checkedContactItem = val;
            },
            // 获取分组列表
            getGroup() {
                const sortType = 1; // 分组默认排序
                WecomApiV1
                    .getChannelCodeGroupList(sortType)
                    .then((res) => {
                        this.orderOptions = [];
                        let test = [];
                        let treeObj = {};
                        treeObj = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.orderOptions.push(treeObj);
                        this.$traverseTree(this.orderOptions, test);
                        this.orderOptions = test;

                        // 选中默认分组
                        let r = this.$getCurrentPart(1, this.orderOptions[0].childs);
                        let defaultId = r.id;
                        let groupId = Number(this.getInfo.channelCodeGroups);
                        if (groupId > 0) {
                            let p = this.$getPartById(Number(this.getInfo.channelCodeGroups), this.orderOptions);
                            this.parentGroupName = p.name;
                        } else {
                            this.getInfo.channelCodeGroups = defaultId;
                            this.parentGroupName = r.name;
                        }
                        // 全部分组不得点击 jira-9906
                        this.orderOptions[0].noSelect = false;
                        this.fathersOpen(this.orderOptions, Number(this.getInfo.channelCodeGroups));
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            //选中分组的所有父级元素open=true
            fathersOpen(list, id) {
                let fathersArr = [];
                fathersArr = this.$getCurrentFathers(list, id);
                fathersArr.forEach(item => {
                    item.open = true;
                });
            },
            // 下拉菜单的收起
            eventListener() {
                this.groupSelectShow = false;
            },
            // 选择分组
            readyCheckGroup() {
                this.groupSelectShow = !this.groupSelectShow;
            },
            // 取消选择分组
            closeGroupSelect() {
                this.groupSelectShow = false;
            },
            // search-tree中选择list的某一项时  接收选中项
            getTreeAct(group) {
                this.getInfo.channelCodeGroups = group.id;
                this.parentGroupName = group.name;
                this.groupSelectShow = false;
            },
            
            // 保存前的校验
            check() {
                if (this.getInfo.name === '') {
                    this.errorTitle = this.$t('channelCode.errorTitle');
                    return true;
                }
                if (this.getInfo.channelCodeGroups === '') {
                    this.$toast(this.$t('QRCode.selectGroup'), 'warn');
                    return true;
                }
                if (this.getInfo.employeeIds.length === 0) {
                    this.$toast(this.$t('channelCode.errorStaff'), 'warn');
                    return true;
                }
                if (this.getInfo.welcome === 1 && this.getInfo.sendContent === '') {
                    this.errorText = this.$t('QRCode.validReply');
                    this.$toast(this.$t('channelCode.errorWelcom'), 'warn');
                    return true;
                }
                if (this.getInfo.welcome === 1) {
                    return !this.$refs.editor.valid();
                }
            },
            // 保存活码
            save() {
                if (!this.check()) {
                    this.saveLoading = true;
                    this.getInfo.attachments = this.message;
                    let postData = {
                        id: this.getInfo.id,
                        name: this.getInfo.name,
                        channelCodeGroups: [this.getInfo.channelCodeGroups],
                        employeeIds: this.getInfo.employeeIds,
                        contactLabelIds: this.getInfo.contactLabelIds,
                        skipVerify: this.getInfo.skipVerify === false ? 0 : 1,
                        welcome: this.getInfo.welcome,
                        attachments: this.message.msgtype === 'none' ? [] : [this.getInfo.attachments],
                        sendContent: this.getInfo.welcome === 1 ? this.getInfo.sendContent : '',
                    };
                    WecomApiV1
                        .saveOrUpdate(postData)
                        .then(() => {
                            if (~~this.$route.params.id === 0) {
                                this.$toast(this.$t('channelCode.addSuccess'), 'success');
                            } else {
                                this.$toast(this.$t('sendChannel.success'), 'success');
                            }
                            this.saveLoading = false;
                            this.$router.go(-1);
                        })
                        .catch(() => {
                            this.saveLoading = false;
                        });
                } 
            }
        }
    };
</script>
<style lang="scss" scoped>
    @import '../../../common/scss/base/_variables.scss';
    @import '../../../common/scss/base/_mixin.scss';
    .new-channel-code {
        h3 {
            margin: 30px; 
        }
        // 修复宽度塌陷
        .form-container {
            min-width: 1350px;
        }
        .choose-parent-wrapper {
            margin-top: 10px;
            .choose-parent {
                display: inline-block;
                position: relative;
                flex-wrap: wrap;
                box-sizing: border-box;

                $option-height: $input-field-height;
                $border-radius: 4px;
                $hover-bg: #f8f9fa;

                .select-text {
                    position: relative;
                    display: block;
                    @include box-sizing();
                    padding-right: $option-height - 2px;
                    width: 312px;
                    height: $option-height;
                    line-height: $option-height - 2px;
                    border: 1px solid $form-border;
                    text-indent: .8em;
                    @include border-radius($border-radius);
                    @include user-select(none);
                    background-color: white;
                    @include ellipsis();

                    &:not(.disabled):hover {
                        border-color: $theme;
                    }

                    &:not(.disabled) {
                        cursor: pointer;
                    }

                    &.disabled {
                        color: $disabled;
                        cursor: not-allowed;
                        background-color: $content-bg;

                        .select-icon {
                            color: $disabled;
                        }
                    }

                    &.placeholder {
                        color: $disabled;
                    }

                    &.active {
                        border-color: $theme;
                        @include box-shadow(0 1px 3px rgba($theme, .35));

                        .select-icon {
                            color: $theme;
                        }
                    }

                    .select-icon {
                        height: $option-height - 2px;
                        width: $option-height - 2px;
                        position: absolute;
                        top: 0;
                        right: 0;
                        text-align: center;
                        text-indent: 0;
                        color: $color-light-content;
                    }
                }

                .search-tree-wrapper {
                    position: absolute;
                    top: 100%;
                    width: 310px;
                    margin-top: 4px;
                    border: 1px solid #cfd5df;
                    z-index: 10;
                    background-color: white;
                    border-radius: 4px;
                    min-height: 80px;
                    max-height: 300px;
                    overflow: auto;
                }
            }
        }
        .input {
            width: 312px;
        }
        .hg {
            width: 315px;
        }
        .welcome-tip {
            margin: 0 30px 20px;
        }
        .btn {
            margin: 20px 150px;
        }
        .textarea-box {
            width:15%;
            height: 120px;
            display: inline-block;
            position: relative;
            border: 1px solid #ccc;
            .textarea {
                width: 100%;
                border: none;
                resize:none;
                &:focus {
                    box-shadow: unset;
                }                         
            }
            .text-num {
                position: absolute;
                bottom: 5px;
                right: 10px;
                line-height: 16px;
            }
        }
        .wecom-editor {
            .label {
                margin-top: 10px;
            }
            .wecom-material-editor {
                display: inline-block;
            }
        } 
    }
</style>
