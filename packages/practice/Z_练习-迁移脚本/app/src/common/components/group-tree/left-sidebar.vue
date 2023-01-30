<template>
    <div class="left-sidebar left-group-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-list-container">
            <!-- 固定菜单 -->
            <ul class="fixed-menu" v-if="fixedList.length > 0 ">
                <li v-for="(fixedGroup,index) in fixedList" :key="index" @click="selectFixed(fixedGroup)"
                    :class="{otherActive: fixedGroup.id === fixedActiveId && fixedActive}">
                    <span class="notice-box">
                        {{fixedGroup.name}}
                        <span class="notice" v-if="fixedGroup.name === $t('journeyList.approval') && showNotice"></span>
                    </span>
                </li>
            </ul>
            <!-- 搜索 -->
            <div>
                <search :position="true" :treeData="SideTreeData" @sureSearch="sureSearch" :lastStage="true"></search>
            </div>
            <!-- 模块分组 -->
            <div class="module-group" v-if="addFlag">
                <span class="module-name">{{'common.allGroups' | t}}</span>
                <div class="action-module">
                    <selector class="icon-size titlesas-sort" auto-width icon="sort" :shortcutAction="false" hide-label
                        v-model="orderBy" :options="orderOptions" @select="gainList" />
                    <button type="button" class="btn add-action-btn" :disabled="$has(addGroup)" @click="outAddLayer">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                    </button>
                </div>

            </div>
            <!-- 可折叠树形菜单 -->
            <ul v-for="menuItem in SideTreeData" :key="menuItem.id">
                <tree-menu :groupData="menuItem" :depth="0" :action="true" @choose="chooseItem" :activeId="activeId"
                    :levelStage="true" :displayLevel="displayLevel" :moduleRange="moduleRange"></tree-menu>
            </ul>
        </div>
        <!-- 新建/编辑分组 弹窗-->
        <modal v-if="createEditShow" :title="optionType === 'create' ? $t('common.newGroup'):$t('common.editGroup')"
            @close="cancelEditNew">
            <div class="form-field">
                <label for="groupText" class="label">{{'common.groupName'|t}}</label>
                <input type="text" id="groupText" class="input lg" :placeholder="$t('common.groupName')"
                    v-model.trim="groupName" maxlength="255">
            </div>
            <div class="form-field">
                <label class="label placeholder" for="pId">{{'common.parentGroup'|t}}</label>
                <div class="choose-parent lg" id="pId" @click.stop="readyCheckGroup">
                    <label class="select-text">
                        {{superiorGroupName}}
                        <span class="select-icon icon icon-arrow-down"></span>
                    </label>
                    <div class="search-tree-wrapper" v-if="groupSelectShow" @click.stop>
                        <!-- 带有搜索功能的树 -->
                        <search-tree :searchTreeData="allTreeData" :treeActiveId="treeActiveId" @getTreeAct='getTreeAct'
                            :action="false" :levelStage="false" :moduleRange="moduleRange"></search-tree>
                    </div>
                </div>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-white" :value="$t('common.cancel')" @click="cancelEditNew">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" @click="sureEditNew">
            </template>
        </modal>
        <!-- 删除 -->
        <modal v-if="delShow" :title="$t('common.delGroup')" @close="delShow = false">
            <span v-if="groupInformation.groupData.childs.length === 0">{{'common.confirmDelFir'
                | t}} {{groupName}} {{'common.confirmDelSed' | t}}</span>
            <span v-if="groupInformation.groupData.childs.length !== 0">{{'common.UnableDel'
                | t}}</span>
            <template v-slot:buttons>
                <div v-if="groupInformation.groupData.childs.length === 0">
                    <input type="button" class="btn btn-md btn-white" :value="$t('common.cancel')"
                        @click="delShow = false">
                    <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')"
                        @click="sureDelGroup">
                </div>
                <input type="button" v-if="groupInformation.groupData.childs.length !== 0" class="btn btn-md btn-theme"
                    :value="$t('common.confirm')" @click="delShow = false">
            </template>
        </modal>
    </div>
</template>

<script>
import Bus from './bus.js';
import { COMMON_NAME_REGEXP } from '../../../common/utils/regs';
import { mapState } from 'vuex';
import { SHOW_SIDE_BAR } from '@/store/vuex/mutationTypes';

export default {
    name: 'left-sidebar',
    data() {
        return {
            groupInformation: '', //tree-menu传过来的菜单信息
            searchGroupName: '', //左侧树搜索
            superiorGroupName: this.$t('common.pleaseChoose'), //上级分组
            superiorGroupId: '', //上级分组id

            orderBy: 1, // 排序
            orderOptions: [
                { id: 1, name: this.$t('common.cerateTimeSortDrop') },
                { id: 2, name: this.$t('common.cerateTimeSortUp') },
                { id: 3, name: this.$t('common.updateTimeSortDrop') },
                { id: 4, name: this.$t('common.updateTimeSortUp') },
                { id: 5, name: this.$t('common.nameSortDrop') },
                { id: 6, name: this.$t('common.nameSortUp') }
            ],

            groupId: '', //分组id
            groupName: '',
            createEditShow: false,
            delShow: false,

            groupSelectShow: false, //新建编辑时module中对应的上级分组list显示和隐藏

            currentGroup: '', //点击的tree-menu
            currentGroupId: 0, //
            fathersArr: [], //点击的tree-menu父级
            directlyFat: [], //上一级分组
            selectFlag: true, //编辑时是否出现“选择上一级”
            optionType: '', //操作类型 主要是区别编辑和新建
            activeId: '', //侧边栏树的active
            treeActiveId: '', //modal中的搜索树active

            fixedActive: true, //固定菜单选中效果
            fixedActiveId: 0,

            singleMenu: '',
            searchSelectTree: '', //search-tree组件中选择的某一项
            maxFloor: 0 // 分组的最深层级
        };
    },
    props: {
        allTreeData: {
            type: Array
        },
        SideTreeData: {
            //侧边栏tree-menu list
            type: Array,
            default: () => {
                return [];
            }
        },
        fixedList: {
            //有固定菜单的使用fixedMenu字段传参
            type: Array,
            default: () => {
                return [];
            }
        },
        // showNotice 固定分组显示小红点
        showNotice: {
            type: Boolean,
            default: false
        },
        moduleRange: String, //模块
        displayLevel: {
            //显示层次 最多为几级 接受父组件的传参，再传给组件tree-menu
            type: Number,
            default: 4
        },
        //"全部分组"一行是否展示
        addFlag: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        ...mapState(['sidebarCollapsed']),
        // 权限-新建分组
        addGroup() {
            switch (this.moduleRange) {
                //素材,邮件头尾模板 共用素材的权限
                case 'materialModule':
                case 'headerfooterEmail':
                    return 'journey_material_add_group';
                //旅程
                case 'journey':
                    return 'journey_manage_add_group';
                //标签
                case 'tagManageModule':
                    return 'datacentre_label_add_group';
                // 表单
                case 'questionnaire':
                    return 'journey_form_add_group';
                // 二维码
                case 'qr-code':
                    return 'wechat_qrcode_add_group';
                // 用户分群
                case 'swarm':
                    return 'customer_swarm_add_group';
                // 渠道活码
                case 'channelCode':
                    return 'wecom_channel_group_add';
                case 'microModule':
                    return '';
                // 回访任务
                case 'contactTask':
                    return '';
            }
        }
    },
    mounted() {
        this.$store.commit(SHOW_SIDE_BAR, true);
        //点击其他地方下拉菜单收起
        window.addEventListener('click', this.eventListener);

        /**
         * actionGroup对菜单的操作
         */
        Bus.$on('actionGroup', groupInformation => {
            this.optionType = groupInformation.type;
            this.groupInformation = groupInformation;
            this.currentGroup = groupInformation.groupData;
            this.currentGroupId = groupInformation.groupData.id;
            this.fathersArr = this.fathersOpen(this.allTreeData, this.currentGroupId);
            if (groupInformation.type === 'create') {
                this.selectFlag = true;
                this.groupName = '';
                this.groupId = groupInformation.groupData.id;
                this.superiorGroupId = groupInformation.groupData.id; //在新建的时如果没有重新选择上级，那上级的id为该分组的id
                this.superiorGroupName = groupInformation.groupData.name;
                this.createEditShow = true;
            }
            if (groupInformation.type === 'edit') {
                this.groupName = groupInformation.groupData.name;
                this.createEditShow = true;

                this.directlyFat = this.fathersArr.filter(
                    ele => ele.level === groupInformation.groupData.level - 1
                );
                if (this.directlyFat.length !== 0) {
                    this.selectFlag = true;
                    this.superiorGroupName = this.directlyFat[0].name;
                    this.superiorGroupId = this.directlyFat[0].id; //在编辑的时如果没有重新选择上级，那上级的id为该分组原本上级的id
                } else {
                    this.superiorGroupId = '';
                    this.selectFlag = false;
                }
            }
            if (groupInformation.type === 'del') {
                this.groupId = groupInformation.groupData.id;
                this.groupName = groupInformation.groupData.name;
                this.delShow = true;
            }
        });
        /**
         * 递归树形菜单
         * singleMenu
         * 点击某个分组
         * groupData所点击的分组详情数据
         */
        Bus.$on('singleMenu', groupData => {
            this.singleMenu = groupData;
            if (groupData.action === false) {
                this.superiorGroupName = groupData.groupData.name;
                this.superiorGroupId = groupData.groupData.id;
                this.groupSelectShow = false;
            }
        });

        // this.saveChooseMsg();
    },
    beforeDestroy() {
        this.$store.commit(SHOW_SIDE_BAR, false);
    },
    destroyed() {
        window.removeEventListener('click', this.eventListener);
    },
    watch: {
        //监听路由变化
        // $route(to) {
        //     if (to.query.groupId !== '') {
        //         this.activeId = to.query.groupId;
        //     } else {
        //         this.select();
        //     }

        // }
        SideTreeData(newVal) {
            this.SideTreeData = newVal;
            this.saveChooseMsg();
        }
    },
    methods: {
        //选中分组的所有父级元素open=true
        fathersOpen(list, id) {
            let fathersArr = [];
            fathersArr = this.$getCurrentFathers(list, id);
            fathersArr.forEach(item => {
                item.open = true;
            });
            return fathersArr;
        },
        // 页面跳转时需保存当前页面所选[分组]、[tab页]与[当前列表页码]等信息，当用户返回上一页时直接载入而无需重新选择。
        saveChooseMsg() {
            let parmasId = Number(this.$route.params.id);
            let parmasGroupId = Number(this.$route.params.groupId);
            let queryId = Number(this.$route.query.id);
            let queryGroupId = Number(this.$route.query.groupId);
            if (!parmasId && !parmasGroupId && !queryId && !queryGroupId)
                return;

            if (parmasGroupId) {
                if (parmasGroupId <= 0) {
                    this.activeId = '';
                    this.fixedActiveId = parmasGroupId;
                    this.fixedActive = true;
                } else {
                    this.activeId = parmasGroupId;
                    this.fixedActiveId = '';
                    this.fixedActive = false;
                }
            }
            if (parmasId) {
                if (parmasId <= 0) {
                    this.activeId = '';
                    this.fixedActiveId = parmasId;
                    this.fixedActive = true;
                } else {
                    this.activeId = parmasId;
                    this.fixedActiveId = '';
                    this.fixedActive = false;
                }
            }
            if (queryGroupId) {
                if (queryGroupId <= 0) {
                    this.activeId = '';
                    this.fixedActiveId = queryGroupId;
                    this.fixedActive = true;
                } else {
                    this.activeId = queryGroupId;
                    this.fixedActiveId = '';
                    this.fixedActive = false;
                }
            }
            if (queryId) {
                if (queryId <= 0) {
                    this.activeId = '';
                    this.fixedActiveId = queryId;
                    this.fixedActive = true;
                } else {
                    this.activeId = queryId;
                    this.fixedActiveId = '';
                    this.fixedActive = false;
                }
            }
            if (this.activeId === '') return;
            this.currentGroupId = this.activeId;
            this.fathersArr = this.fathersOpen(this.SideTreeData, this.currentGroupId);
        },
        valid() {
            if (!this.groupName) {
                this.$toast(this.$t('common.groupNameNotNull'), 'warn');
                return false;
            }
            if (this.groupName && !COMMON_NAME_REGEXP.test(this.groupName)) {
                this.$toast(this.$t('common.nameSpecial'), 'warn');
                return false;
            }
            return true;
        },
        // 固定菜单
        selectFixed(fixedGroup) {
            this.fixedActiveId = fixedGroup.id;
            this.fixedActive = true;
            this.activeId = '';
            this.$emit('select', fixedGroup);
        },

        // 按照排序重新查询分组列表
        gainList() {
            this.$emit('sort', this.orderBy);
        },
        // 弹窗中 tree-menu是否显示
        readyCheckGroup() {
            this.groupSelectShow = !this.groupSelectShow;
        },

        //通用方法 下拉菜单的收起
        eventListener() {
            this.groupSelectShow = false;
        },
        // 最外层 add分组
        outAddLayer() {
            this.optionType = 'create';
            let gId = 0;
            // 判断route中的geoupId是在params还是在query中
            if (!this.$route.query.groupId) {
                // route.params.groupId 未定义
                if (!this.$route.params.groupId) {
                    // router 中parmas和query中 都没有groupId也没有id
                    if (!this.$route.params.id) {
                        gId = 0;
                    } else {
                        gId = Number(this.$route.params.id);
                    }
                } else {
                    gId = Number(this.$route.params.groupId);
                }
            } else {
                gId = Number(this.$route.query.groupId);
            }
            // 判断选中的是全部分组还是当前分组
            if (gId <= 0) {
                this.superiorGroupId = this.allTreeData[0].id;
                this.treeActiveId = this.allTreeData[0].id;
            } else {
                this.superiorGroupId = gId;
                this.treeActiveId = gId;
            }
            let p = this.$getPartById(this.superiorGroupId, this.allTreeData);
            // 分组层级>displayLevel(目前暂定最多为四级)不可创建分组
            if (p.level > this.displayLevel) {
                this.$toast(
                    this.$t('common.UpToFour') +
                        this.displayLevel +
                        this.$t('common.level'),
                    'warn'
                );
                return;
            }
            // 默认分组下不可创建分组
            if (p.default === 1) {
                this.$toast(this.$t('common.notDefaultGroup'), 'warn');
                return;
            }
            this.superiorGroupName = p.name;
            // 选中分组的所有父级展开
            this.fathersArr = this.fathersOpen(this.allTreeData, this.treeActiveId);
            this.createEditShow = true;
            this.groupName = '';
            this.groupId = '';
            this.selectFlag = true;
        },
        // 取消新建/编辑
        cancelEditNew() {
            this.superiorGroupName = this.$t('common.pleaseChoose');
            this.superiorGroupId = '';
            this.fathersArr = [];
            this.createEditShow = false;
            this.groupSelectShow = false;

            // 关闭弹窗时，分组收起
            this.$emit('traverseOpen', this.allTreeData);
        },

        /**
         * 获取分组的最深层级
         * @param groupChildren 分组的 childs
         * @returns {number}
         */
        getMaxFloor(groupChildren) {
            let max = 0;

            function each(data, floor) {
                data.forEach(e => {
                    e.floor = floor;
                    if (floor > max) {
                        max = floor;
                    }
                    if (e.childs.length > 0) {
                        each(e.childs, floor + 1);
                    }
                });
            }

            each(groupChildren, 1);
            return max;
        },
        // 确认新建/编辑
        sureEditNew() {
            if (!this.valid()) return;

            if (this.optionType === 'create') {
                this.$emit('modify', {
                    groupName: this.groupName,
                    parentId: this.superiorGroupId,
                    optionType: this.optionType
                });
            } else if (this.optionType === 'edit') {
                // 用id来判断
                if (this.currentGroup.id === this.searchSelectTree.id) {
                    this.$toast(this.$t('common.notCurrentGroup'), 'warn');
                    return;
                }
                if (this.currentGroup.level < this.searchSelectTree.level) {
                    this.$toast(this.$t('common.notLowlevelGroup'), 'warn');
                    return;
                }

                // 当前分组的最深层级
                this.maxFloor = this.getMaxFloor(this.currentGroup.childs) + 1;
                // 选中分组的真正层级（全部分组是 1，一级分组的 level 从 2 开始）
                let selectFloor = this.searchSelectTree.level - 1;

                if (this.maxFloor + selectFloor > this.displayLevel) {
                    this.$toast(
                        this.$t('common.UpToFour') +
                            this.displayLevel +
                            this.$t('common.level'),
                        'warn'
                    );
                    return;
                }
                this.$emit('modify', {
                    groupName: this.groupName,
                    groupId: this.currentGroup.id,
                    parentId: this.superiorGroupId,
                    optionType: this.optionType
                });
            }
            this.fathersArr = [];
        },
        // 关闭新建/编辑modal
        closeNewEditModal() {
            this.createEditShow = false;
        },
        // 确认删除分组
        sureDelGroup() {
            this.$emit('delete', this.groupId);
            this.delShow = false;
            //删除分组后，选中全部分组
            this.fixedActiveId = 0;
            this.fixedActive = true;
            this.activeId = '';
        },
        chooseItem(groupData) {
            if (this.groupInformation === '') {
                this.activeId = groupData.id;
                this.treeActiveId = '';
            }
            if (this.groupInformation.type === 'create') {
                this.activeId = groupData.id;
                this.treeActiveId = groupData.id;
            }
            if (this.groupInformation.type === 'edit') {
                if (this.singleMenu.action) {
                    this.activeId = groupData.id;
                    if (this.directlyFat.length !== 0) {
                        this.treeActiveId = this.directlyFat[0].id;
                    }
                } else {
                    this.treeActiveId = this.singleMenu.groupData.id;
                }
            }
            if (this.groupInformation.type === 'del') {
                this.activeId = groupData.id;
                this.treeActiveId = '';
            }
            this.fixedActive = false;
        },
        // search-tree中选择list的某一项时  接收选中项
        getTreeAct(group) {
            this.treeActiveId = group.id;

            this.superiorGroupName = group.name;
            this.superiorGroupId = group.id;
            this.searchSelectTree = group; //search-tree中选中的某一项的id
        },
        // 点击选择项---确定搜索
        sureSearch(groupObj) {
            this.superiorGroupName = groupObj.name;
            this.superiorGroupId = groupObj.id;
            this.activeId = groupObj.id;
            this.chooseItem(groupObj);
            this.$emit('select', groupObj);
        }
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../common/scss/base/variables';
@import '../../../common/scss/base/mixin';

$border-radius: 4px;

.left-sidebar {
    .sidebar-list-container {
        width: 260px;
        height: 100%;
        overflow: hidden auto;
    }
    .fixed-menu {
        li {
            position: relative;
            line-height: 48px;
            cursor: pointer;
            padding-left: 20px;

            &:hover {
                background-color: $select-bg;
            }

            .notice-box {
                position: relative;

                .notice {
                    position: absolute;
                    top: -2px;
                    right: -12px;
                    width: 6px;
                    height: 6px;
                    background-color: #eb5150;
                    border-radius: 100%;
                }
            }
        }
    }

    .search-field {
        position: relative;
        display: flex;
        align-items: center;
        height: $input-field-height;
        border-top: 1px solid $select-border;
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

        .query-content {
            position: absolute;
            z-index: 2;
            left: 0;
            top: 27px;
            box-sizing: border-box;
            width: 100%;
            height: 272px;
            overflow-y: auto;
            border: 1px solid $border-color;
            border-radius: 4px;
            background-color: white;
            padding: 10px;

            .query-return {
                color: $green;
                cursor: pointer;
                font-size: 14px;
                display: inline-block;
                width: 100%;
                padding-left: 5px;
            }

            .query-item {
                line-height: 24px;
                height: 24px;
                cursor: pointer;
                padding-left: 5px;

                &:hover {
                    background-color: $border-color;
                }
            }
        }
    }

    .module-group {
        line-height: 48px;
        padding-left: 12px;

        .module-name {
            padding-right: 10px;
        }

        .action-module {
            float: right;
            height: 48px;

            .add-action-btn {
                position: relative;

                width: 16px;
                height: 16px;
                margin: 16px 16px 0 0;
                border: none;
                padding: 0;
                background-color: transparent;

                svg {
                    display: block;
                    width: 16px;
                    height: 16px;
                    margin: auto;
                    fill: $form-border;
                    @include transition(fill 0.2s ease);

                }
                &:not([disabled]) svg:hover {
                    fill: $theme;
                }
            }

            .titlesas-sort {
                margin: -10px 10px 0 0;
            }
        }
    }

    .otherActive {
        background-color: $select-bg;
        color: $green;
    }

    .choose-parent {
        display: inline-block;
        position: relative;

        $option-height: $input-field-height;
        $border-radius: 4px;
        $hover-bg: #f8f9fa;

        .select-text {
            position: relative;
            display: block;
            @include box-sizing();
            padding-right: $option-height - 2px;
            height: $option-height;
            line-height: $option-height - 2px;
            border: 1px solid $form-border;
            text-indent: 0.8em;
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
                @include box-shadow(0 1px 3px rgba($theme, 0.35));

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
            position: fixed;
            width: 312px;
            max-width: 312px;
            max-height: 300px;
            background-color: white;
            border: 1px solid $border-color;
            border-top: none;
            z-index: $index-container;
            @include border-radius ($border-radius);
            @include box-sizing();
        }
    }
}
</style>
