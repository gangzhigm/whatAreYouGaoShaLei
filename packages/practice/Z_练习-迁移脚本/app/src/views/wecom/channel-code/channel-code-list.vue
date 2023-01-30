
<template>
    <div class="content-container channel-code-container">
        <div class="content-view">
            <crumbs/>
        </div>
        <div class="channel-content content-view">
            <!-- 左侧导航栏 -->
            <left-sidebar :fixedList="fixedGroups"
                :allTreeData="totalTreeArray"
                :SideTreeData="groupList"
                @sort="getSortType"
                @traverseOpen="traverseOpen"
                @modify="editGroup"
                @delete="deleteGroup"
                @select="selectGroup"
                ref="leftSidebar"
                moduleRange="channelCode"
            />
            <!-- 活码内容 -->
            <div class="channel-list right-group-content">
                <p class="group-name">{{currentGroupName}}</p>
                <div class="detail-btn">
                    <button class="btn btn-md btn-theme pull-right" @click="addCode()"
                    id="wecom_channel_live_code_add"
                    :disabled="$has('wecom_channel_live_code_add')">
                        {{'channelCode.newSetCode' | t}}
                    </button>
                    <div class="pull-right search-box">
                        <input type="text" v-model.trim="keyWords"
                            :placeholder="$t('channelCode.search')" @keydown.enter="searchList">
                        <svg aria-hidden="true" @click="searchList">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                </div>
                <div class="detail-msg">
                    <!-- 批量操作 -->
                    <div class="batch hidden-menu-trigger">
                        <svg aria-hidden="true" class="all-tag">
                            <use xlink:href="#icon-batch"></use>
                        </svg>
                        <span class="light-content-text">{{'channelCode.opreat' | t}}</span>
                        <ul class="hidden-menu">
                            <li class="tag-btn" v-for="(item, index) in btns" :key="index">
                                <button class="btn tag-btn-click"
                                :disabled="item.disable" @click="batchClick(item.click)">
                                {{item.btnName}}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <table class="simplify-table channel-table">
                    <tr>
                        <th v-for="th in thList" :key="th.id" :width="th.width">
                            <div class="tag-name">
                                {{th.name}}
                                <i v-if="th.id === 3" class="icon icon-yiwen1" v-title:bottom="th.tip"></i>
                            </div>
                            <!--全选-->
                            <div class="hidden-menu-trigger tag-action-menu" v-if="th.id === 1">
                                <svg aria-hidden="true" class="menu-icon">
                                    <use xlink:href="#icon-menu"></use>
                                </svg>
                                <ul class="hidden-menu">
                                    <li @click="checkData">{{'tag.allSelectedNowPage' | t}}</li>
                                    <li @click="clearData">{{'tag.clearAll' | t}}</li>
                                </ul>
                            </div>
                        </th>
                    </tr>
                    <tr v-if="loading" class="no-hover">
                        <td colspan="9" class="slim-cell">
                            <inline-loading />
                        </td>
                    </tr>
                    <template v-else-if="channels.length > 0">
                        <tr v-for="(item, index) in channels" :key="index">
                            <td @click.stop>
                                <checkbox v-model="checkedIds" :source="item.id"/>
                            </td>
                            <td>{{item.name}}</td>
                            <td>{{item.scanCount}}</td>
                            <td>{{item.userNames}}</td>
                            <td>{{item.updateName}}</td>
                            <td>{{item.updateDate}}</td>
                            <td>{{item.createName}}</td>
                            <td>{{item.createDate}}</td>
                            <td>
                                <!--操作-->
                                <button class="btn tag-action-icon" v-title="$t('channelCode.set')"
                                        :disabled="$has('wecom_channel_live_code_edit')"
                                        @click.stop="edit(item)">
                                    <svg aria-hidden="true" class="icon-round-pencil"
                                            :class="{'icon-disable': $has('wecom_channel_live_code_edit')}">
                                        <use xlink:href="#icon-round-pencil" :title="$t('channelCode.set')"></use>
                                    </svg>
                                </button>
                                <button class="btn tag-action-icon" v-title="$t('channelCode.statis')"
                                        :disabled="$has('wecom_channel_summary')"
                                        @click.stop="statis(item)">
                                    <svg aria-hidden="true" class="icon-pie"
                                        :class="{'icon-disable': $has('wecom_channel_summary')}">
                                        <use xlink:href="#icon-pie" :title="$t('channelCode.statis')"></use>
                                    </svg>
                                </button>
                                <div class="tag-action-icon hidden-menu-trigger">
                                    <svg aria-hidden="true" class="more-icon">
                                        <use xlink:href="#icon-more"></use>
                                    </svg>
                                    <ul class="hidden-menu">
                                        <li class="tag-btn">
                                            <button class="btn tag-btn-click"
                                                    :disabled="$has('wecom_channel_live_cod_download')"
                                                    @click.stop="download(item)">
                                                    {{'channelCode.download' | t}}
                                            </button>
                                        </li>
                                        <li class="tag-btn">
                                            <button class="btn tag-btn-click"
                                                    :disabled="$has('wecom_channel_live_code_delete')"
                                                    @click.stop="del(item.id)">
                                                    {{'channelCode.del' | t}}
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    </template>
                    <tr v-else class="no-hover">
                        <td class="slim-cell" colspan="9">
                            <list-empty v-if="keyWords === ''"/>
                            <list-search-empty v-else/>
                        </td>
                    </tr>
                </table>
                <div class="total-page pull-left">{{'channelCode.total' | t}} <span class="theme-text">{{totalRow}}</span> {{'channelCode.records' | t}}</div>
                <pager v-if="channels.length > 0" :now="nowPage" :total="totalPage" @page="toPage"/>
            </div>
        </div>
        <!-- 批量移至分组 -->
        <group-move v-if="moveGroup" :groupList="totalTreeArray" :placeHolder="$t('openPlat.pleaseCheck')"
                    @close="moveGroup = false" @moveDown="groupMoveDown"/>
        <!-- 删除活码弹窗 -->
        <modal v-if="deleted" :title="allDel ? $t('channelCode.delete') : $t('channelCode.del')" @close="deleted = false">
            <p>{{'channelCode.delCode' | t}}</p>
            <template v-slot:buttons>
                <button class="btn btn-md btn-white"  @click="deleted = false">{{'common.cancel' | t}}</button>
                <button class="btn btn-md btn-theme" @click="deleteOk">{{'channelCode.deleteOk' | t}}</button>
            </template>
        </modal>
    </div>
</template>
<script type="text/babel">
    import GroupMove from '@/common/components/group-move.vue';
    import { WecomApiV1 } from '@/api';
    import Bus from '@/common/components/group-tree/bus.js'; // Bus是在树形组件中传参时使用

    export default {
        name: 'ChannelCode', // 渠道活码
        components: {GroupMove},
        data() {
            return {
                loading: false, // 列表读取
                keyWords: '', //搜索框关键字
                // 页码
                nowPage: 1,
                totalPage: 1,
                totalRow: 0,
                // 批量操作按钮
                btns: [
                    {disable: this.$has('wecom_channel_batch_move_group'), btnName: this.$t('channelCode.move'), click: 'move'},
                    {disable: this.$has('wecom_channel_batch_delete'), btnName: this.$t('channelCode.delete'), click: 'delete'}
                ],
                // 表格头标题
                thList: [
                    {id: 1, name: '',width: 40},
                    {id: 2, name: this.$t('channelCode.name')},
                    {id: 3, name: this.$t('channelCode.num'), tip: this.$t('channelCode.numTip')},
                    {id: 4, name: this.$t('channelCode.person')},
                    {id: 5, name: this.$t('channelCode.updatePerson')},
                    {id: 6, name: this.$t('channelCode.updateTime')},
                    {id: 7, name: this.$t('channelCode.setPerson')},
                    {id: 8, name: this.$t('channelCode.setTime')},
                    {id: 9, name: this.$t('channelCode.oprea')},
                ],
                //活码列表
                channels: [],
                currentGroupName: this.$t('channelCode.allCode'), // 显示分组名称
                checkedIds: [],// 选中的活码ids
                selectSubscriptionId: '',   // 单个删除选中的 id
                selectGroupId: '',  // 选中的分组 id
                moveGroup: false, // 批量移至分组弹窗
                // 左侧分组树
                groupList:[], // 分组列表
                allTreeData: '',
                totalTreeArray: [],
                sortType: 1,//排序 1：按创建时间降序 2：按创建时间升序 3：按更新时间降序 4：按更新时间升序 5：按名称降序 6：按名称生序
                fixedGroups: [//固定menu
                    {id: 0, fieldName: 'allCount', name: this.$t('channelCode.allCode'), type: 'channelCode'},
                    {id: -2, fieldName: 'createCount', name: this.$t('channelCode.myCreate'), type: 'channelCode'},
                ],
                deleted :false, // 删除弹窗
                allDel: false, // 是否批量删除
                isSubmit: false
            };
        },
        mounted() {
            if (!this.$route.query.groupId) {
                this.$router.replace({
                    name: 'channelCode',
                    query: {page_number: this.nowPage, groupId: 0}
                });
                this.selectGroupId = '';
            } else {
                if (this.$route.query.page_number) {
                    this.nowPage = this.$route.query.page_number;
                } else {
                    this.nowPage = 1;
                }
                if (~~this.$route.query.groupId === 0) {
                    this.selectGroupId = '';
                } else {
                    this.selectGroupId = ~~this.$route.query.groupId;
                }
                if (this.$route.query.keyWords) {
                    this.keyWords = this.$route.query.keyWords;
                } else {
                    this.keyWords = '';
                }
            }

            // 获取分组列表
            this.getGroup();
            // 获取活码列表
            this.getChannelList();
            /**
             * 递归树形菜单
             * singleMenu
             * 点击某个分组
             * groupData所点击的分组详情数据
             */
            Bus.$on('singleMenu', channelGroupData => {
                if (channelGroupData.moduleRange === 'channelCode') {
                    if (channelGroupData.action) {
                        this.currentGroupName = channelGroupData.groupData.name;
                        this.selectGroup(channelGroupData.groupData);
                    }
                }
            });
        },
        methods: {
            // 批量操作
            batchClick(batch) {
                if (batch === 'move') {
                    if (this.checkedIds.length === 0) {
                        this.$toast(this.$t('channelCode.selectCode'), 'warn');
                        return;
                    }
                    this.moveGroup = true;
                    let firstGroup = this.$getCurrentPart(2, this.totalTreeArray);
                    firstGroup.open = true;
                    firstGroup.noSelect = false;
                }
                if (batch === 'delete') {
                    if (this.checkedIds.length === 0) {
                        this.$toast(this.$t('channelCode.selectCode'), 'warn');
                        return;
                    }
                    this.allDel = true;
                    this.deleted = true;
                }

            },
            // 全选当前页数据
            checkData() {
                this.checkedIds = this.channels.map(item => item.id);
            },
            // 清除数据
            clearData() {
                this.checkedIds = [];
            },
            // 新建活码
            addCode() {
                this.id = '';
                this.$router.push({name: 'channelCodeAdd', params: {id: 0}, query: {channelGroupId: this.selectGroupId}});
            },
            /**
             * 遍历树数据，将open更改为false
             * @param data
             */
            traverseOpen(data) {
                this.$openToFalse(data);
            },
            /**
             * 获取子组件传过来的sortType
             * @param sortType
             */
            getSortType(sortType) {
                this.sortType = sortType;
                this.getGroup();
            },
            // 获取分组列表
            getGroup() {
                this.groupList = [];
                this.totalTreeArray = [];
                const test = [];
                const tree = [];
                WecomApiV1
                    .getChannelCodeGroupList({
                        sortType: this.sortType
                    })
                    .then((res) => {
                        this.allTreeData = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.totalTreeArray.push(this.allTreeData);
                        this.$traverseTree(this.totalTreeArray, tree);
                        this.totalTreeArray = tree;
                        this.groupList = JSON.parse(JSON.stringify(res.body.data.rootGroup.childs));
                        this.$traverseTree(this.groupList, test);
                        let curObj = {};
                        if (this.selectGroupId > 0 ) {
                            curObj = this.$getItself(this.selectGroupId, this.totalTreeArray);
                        }
                        if (this.selectGroupId === '' || this.selectGroupId <= 0) {
                            let curID = this.selectGroupId ? this.selectGroupId : 0;
                            this.fixedGroups.forEach(item => {
                                if (item.id === curID) {
                                    curObj = item;
                                }
                            });
                        }
                        this.currentGroupName = curObj.name;
                    });
            },
            // search
            searchList() {
                this.nowPage = 1;
                this.getChannelList();
            },
            // 获取活码列表
            getChannelList() {
                this.loading = true;
                WecomApiV1
                    .getList({
                        keyword: this.keyWords,
                        pageNumber: this.nowPage,
                        groupId: this.selectGroupId
                    })
                    .then(({ body: { data } }) => {
                        this.channels = data.list;
                        this.totalPage = data.totalPage;
                        this.totalRow = data.totalRow;
                        this.loading = false;
                    })
                    .catch(() => {
                        this.loading = false;
                    });

            },
            /**
             * 选择分组
             * @param {Object} group 分组
             */
            selectGroup(group) {
                if (group.id === 0) {
                    this.selectGroupId = '';
                } else {
                    this.selectGroupId = group.id;
                }
                this.currentGroupName = group.name;
                this.$router.push({name: 'channelCode', query: {groupId: group.id}});
                this.checkedIds = [];
                this.nowPage = 1;
                this.keyWords = '';
                this.getChannelList();
            },
            /**
             * edit group
             * @param {Object} createdDetail createdDetail.optionType create: 创建分组 edit: 编辑分组
             */
            editGroup(createdDetail) {
                if (this.isSubmit) return;
                this.isSubmit = true;
                WecomApiV1
                    .saveOrUpdateGroup({
                        id: createdDetail.groupId,
                        name: createdDetail.groupName,
                        parentId: createdDetail.parentId
                    })
                    .then((res) => {
                        this.isSubmit = false;
                        if (createdDetail.optionType === 'create') {
                            this.$toast(res.body.message, 'success');
                        }
                        if (createdDetail.optionType === 'edit') {
                            this.$toast(this.$t('common.updateSuccess'), 'success');
                        }
                        this.getGroup();
                        this.$refs.leftSidebar.closeNewEditModal();
                    })
                    .catch(() => {
                        this.isSubmit = false;
                    });
            },
            /**
             * @description: delete group
             * @param {*} groupId
             * @return {*}
             */
            deleteGroup(groupId) {
                if (this.isSubmit) return;
                this.isSubmit = true;
                WecomApiV1
                    .deleteGroup(groupId)
                    .then(() => {
                        this.isSubmit = false;
                        this.getGroup();
                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                        this.currentGroupName = this.$t('channelCode.allCode');
                    }, () => {
                        this.isSubmit = false;
                        this.$toast(this.$t('common.deleteFailed'), 'warn');
                    });
                this.selectGroup(this.selectGroupId = '');
            },
            // 保存移动至分组
            groupMoveDown(groupId) {
                WecomApiV1
                    .moveGroups({channelCodeGroupId: groupId, ids: this.checkedIds})
                    .then(() => {
                        this.$toast(this.$t('QRCode.moveSuccess'), 'success');
                        this.checkedIds = [];
                        this.getChannelList();
                    });
            },
            // 删除单条活码
            del(id) {
                this.allDel = false;
                this.deleted = true;
                this.selectSubscriptionId = id;
            },
            // 确定删除活码
            deleteOk() {
                this.loading = true;
                this.deleteArray = this.allDel ? this.checkedIds : [this.selectSubscriptionId];
                WecomApiV1
                    .deleteCode(this.deleteArray)
                    .then(() => {
                        this.$toast(this.$t('channelCode.alreadyDel'), 'success');
                        this.deleted = false;
                        this.allDel = false;
                        this.checkedIds = [];
                        this.deleteArray = [];
                        this.nowPage = 1;
                        this.getChannelList();
                        this.getGroup();
                        this.loading = false;
                    });
            },
            // 编辑
            edit(item) {
                this.$router.push({name: 'channelCodeEdit', params: {id: item.id}, query: {groupId: this.selectGroupId}});
            },
            // 统计
            statis(item) {
                this.$router.push({name: 'channelCodeSummary', params: {id: item.id}, query: {name: item.name}} );
            },
            // 下载
            /**
             * @description: 点击下载图片
             * @param {String} imgsrc 图片地址
             * @param {String} name 图片名称
             * @return {*}
             */
            download(item) {//下载图片地址和图片名
                let image = new Image();
                // 解决跨域 Canvas 污染问题
                image.setAttribute('crossOrigin', 'anonymous');
                image.onload = function () {
                    let canvas = document.createElement('canvas');
                    canvas.width = image.width;
                    canvas.height = image.height;
                    let context = canvas.getContext('2d');
                    context.drawImage(image, 0, 0, image.width, image.height);
                    let url = canvas.toDataURL('image/png'); //得到图片的base64编码数据
                    let a = document.createElement('a'); // 生成一个a元素
                    let event = new MouseEvent('click'); // 创建一个单击事件
                    a.download = item.name || 'photo'; // 设置图片名称
                    a.href = url; // 将生成的URL设置为a.href属性
                    a.dispatchEvent(event); // 触发a的单击事件
                };
                image.src = item.codeUrl;
                this.$toast(this.$t('channelCode.downloadSucc'), 'success');
            },
            // 页码
            toPage(e) {
                this.nowPage = e;
                this.getChannelList();
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';
.channel-code-container {
    .channel-content {
        display: flex;
        padding-bottom: 43px;
    }
    .search-box {
        margin-right: 16px;
    }
    .channel-list {
        flex: 1;
        overflow: auto;
        padding: 24px 16px 16px 16px;
        background-color: white;
        .detail-btn {
            line-height: 32px;
        }
        .group-name {
            width:65%;
            @include ellipsis;
        }
    }
    .detail-msg {
        line-height: 32px;
        .batch {
            display: inline-block;
            width: 120px;
        }
        .hidden-menu-trigger {
            position: relative;
            cursor: pointer;

            &:hover {
                color: $color-title;
            }

            svg {
                width: 16px;
                height: 16px;
                vertical-align: top;
                margin-top: ($input-field-height - 16px)/2;
                fill: currentColor;
            }

            .hidden-menu {
                top: $input-field-height;
                left: 0;
                text-align: left;
                @include transform-origin(left top);
            }
        }
        .tag-btn {
            padding: 0;
            margin: 0;
        }
    }
    .channel-table {
        table-layout: fixed;
        width: 100%;
        margin-top: 16px;
        text-align: left;
        border-collapse: collapse;
        border-spacing: 0;
        .tag-action-menu {
            float: right;
            position: relative;
            right: 30%;

            .menu-icon {
                display: block;
                width: 16px;
                height: 16px;
                @include transition();
                fill: $color-light-content;

                &:hover {
                    fill: $light-theme;
                }

                &:active {
                    fill: $dark-theme;
                }
            }

            .hidden-menu {
                left: 0;
                @include transform-origin(left top);
            }
        }
        .tag-action-icon {
            position: relative;
            display: inline-block;
            width: 16px;
            height: 16px;
            margin-top: 1px;

            + .tag-action-icon {
                margin: 0 0 0 8px;
            }

            svg {
                display: block;
                width: 16px;
                height: 16px;
                @include transition();
            }
            &:not([disabled]) {
                cursor: pointer;
                .icon-round-pencil {
                    fill: $theme;

                    &:hover {
                        fill: $light-theme;
                    }
                }
                .icon-pie {
                    fill: $blue;

                    &:hover {
                        fill: $light-blue;
                    }
                }
            }
            .more-icon {
                display: block;
                width: 16px;
                height: 16px;
                @include transition();
                fill: $color-light-content;

                &:hover {
                    fill: $light-theme;
                }
            }
        }
        .hidden-menu-trigger {
            position: relative;
            display: inline-block;
            height: 16px;

            .hidden-menu {
                position: absolute;
                text-align: left;
                @include transform-origin(left top);

                li {
                    padding: 0 15px;
                }
            }
        }
        .btn {
            padding: 0;
        }
        .tag-name {
            display: inline-block;
        }
        th {
            box-sizing: border-box;

            &:not([width]) {
                width: 100%;
            }
        }

        tr {
            height: 40px;
            border-bottom: 1px solid $border-color;

            &:first-child {
                background-color: $select-bg;
            }

            td:first-child {
                text-align: center;
            }

            &:not(:first-child):hover {
                background-color: $title-bg;
            }
        }

        td {
            word-break: break-word;
            white-space: normal;
        }
    }
    .total-page {
        margin-top: 10px;
    }
}
</style>
