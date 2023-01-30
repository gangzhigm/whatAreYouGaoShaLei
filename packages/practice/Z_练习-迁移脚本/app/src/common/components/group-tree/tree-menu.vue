<template>
    <li>
        <div class="tree-group default-not-click" :style="indent"
             :class="{'treeactive':groupData.id === activeId,
                      'notClick': !levelStage && groupData.default === 1,
                      'noSelectable': groupData.noSelect === false && groupData.default === 2 }"
             @click="singleMenu(groupData,action,moduleRange)">
            <button type="button" class="toggle-action-btn" v-if="hasChild" @click.stop="toggle(groupData)">
                <svg aria-hidden="true" v-show="!groupData.open">
                    <use xlink:href="#icon-right"></use>
                </svg>
                <svg aria-hidden="true" v-show="groupData.open">
                    <use xlink:href="#icon-arrow-down"></use>
                </svg>
            </button>
            <!--全部分组 不显示radio-->
            <template v-if="multi && groupData.default !== 2">
                <checkbox :source="groupData.id" v-model="multiGroupArr" :max="max">
                    <span class="group-name" :title="groupData.name">{{groupData.name}}</span>
                </checkbox>
            </template>
            <template v-else>
                <radio class="group-radio"
                    v-if="showRadio && groupData.noSelect !== false && groupData.default !== 2 "
                    v-model="currentId" :source="groupData.id"/>
                <span class="group-name" :title="groupData.name">{{groupData.name}}</span>
                <div class="operation hidden-menu-trigger" @click.stop v-if="showMenu">
                    <svg aria-hidden="true" class="gengduo">
                        <use xlink:href="#icon-gengduo"></use>
                    </svg>
                    <ul class="hidden-menu" @click="singleMenu(groupData,action,moduleRange)">
                        <li v-if="groupData.level < displayLevel + 1 && !$has(addGroup)"
                            @click="actionGroup('create', groupData, action)">
                            {{'common.new' | t}}
                        </li>
                        <li v-if="!$has(modifyGroup)" @click="actionGroup('edit', groupData, action)">
                            {{'common.edit' | t}}
                        </li>
                        <li v-if="!$has(delGroup)" @click="actionGroup('del',groupData, action)">{{'common.del' | t}}
                        </li>
                    </ul>
                </div>
            </template>
        </div>
        <ul v-if="hasChild" v-show="groupData.open">
            <tree-menu v-for="(item,index) in groupData.childs"
                       :key="index"
                       :groupData="item"
                       :depth="depth + 1"
                       :action="action"
                       :levelStage="levelStage"
                       :activeId="activeId"
                       :moduleRange="moduleRange"
                       :show-radio="showRadio"
                       :displayLevel="displayLevel"
                       :multi="multi"
                       :multiArr="multiArr"
                       :max="max"
                       @multiChange="groupChange"
                       @choose="choose"/>
        </ul>
    </li>
</template>
<script>
    import Bus from './bus.js';

    export default {
        name: 'tree-menu',
        data() {
            return {
                // open:false,
                fathersArr: [],
            };
        },
        props: {
            groupData: Object,
            depth: Number,
            action: Boolean,//1、Boolean 是否显示操作图标 ... 2、点击单个tree-menu是否刷新右侧列表
            levelStage: Boolean,//是否显示末级
            activeId: [String, Number],
            moduleRange: String,//模块
            displayLevel: {//显示层级 最多为几级
                type: Number,
                default: 4
            },
            // 分组显示radio
            showRadio: {
                type: Boolean,
                default: false
            },
            // 多选
            multi: {
                type: Boolean,
                default: false
            },
            // 已选数组
            multiArr: {
                type: Array,
                default: () => []
            },
            // 最多可选几项
            max: {
                type: [Number, String],
                default: Infinity
            },
        },
        computed: {
            currentId: {
                get() {
                    return this.activeId;
                },
                set(newId) {
                    return newId;
                }
            },
            hasChild() {
                let hideTrue = !this.levelStage && this.groupData.level === this.displayLevel;
                return this.groupData.childs && this.groupData.childs.length && !hideTrue;
            },
            indent() {
                if (this.hasChild) {
                    return {'padding-left': this.depth * 16 + 'px'};
                }
                if (!this.hasChild) {
                    return {'padding-left': this.depth * 16 + 32 + 'px'};
                }
            },
            multiGroupArr: {
                get() {
                    return this.multiArr;
                },
                set(newval) {
                    this.$emit('multiChange', newval);
                }
            },
            // 权限-新建分组
            addGroup() {
                switch (this.moduleRange) {
                    //素材、邮件头尾模板共用素材的权限
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
                    //微页面
                    case 'microModule':
                        return '';
                    // 回访任务
                    case 'contactTask':
                        return '';
                }
            },
            // 权限-编辑分组
            modifyGroup() {
                switch (this.moduleRange) {
                    //素材、邮件头尾模板共用素材的权限
                    case 'materialModule':
                    case 'headerfooterEmail':
                        return 'journey_material_edit_group';
                    //旅程
                    case 'journey':
                        return 'journey_manage_edit_group';
                    //标签
                    case 'tagManageModule':
                        return 'datacentre_label_edit_group';
                    // 表单
                    case 'questionnaire':
                        return 'journey_form_edit_group';
                    // 二维码
                    case 'qr-code':
                        return 'wechat_qrcode_edit_group';
                    // 用户分群
                    case 'swarm':
                        return 'customer_swarm_edit_group';
                    // 渠道活码
                    case 'channelCode':
                        return 'wecom_channel_group_edit';
                    //微页面
                    case 'microModule':
                        return '';
                    // 回访任务
                    case 'contactTask':
                        return '';
                }
            },
            // 权限-删除分组
            delGroup() {
                switch (this.moduleRange) {
                    //素材、邮件头尾模板共用素材的权限
                    case 'materialModule':
                    case 'headerfooterEmail':
                        return 'journey_material_delete_group';
                    //旅程
                    case 'journey':
                        return 'journey_manage_delete_group';
                    //标签
                    case 'tagManageModule':
                        return 'datacentre_label_delete_group';
                    // 表单
                    case 'questionnaire':
                        return 'journey_form_delete_group';
                    // 二维码
                    case 'qr-code':
                        return 'wechat_qrcode_delete_group';
                    // 用户分群
                    case 'swarm':
                        return 'customer_swarm_delete_group';
                    // 渠道活码
                    case 'channelCode':
                        return 'wecom_channel_gruop_delete';
                    //微页面
                    case 'microModule':
                        return '';
                    // 回访任务
                    case 'contactTask':
                        return '';
                }
            },
            /**
             * 显示分组操作菜单
             * 1. 非默认分组
             * 2. 是左侧列表
             * 3. 有新建分组，编辑分组或删除分组的操作权限
             */
            showMenu() {
                return this.groupData.default === 0
                    && this.action
                    && (!this.$has(this.addGroup) || !this.$has(this.modifyGroup) || !this.$has(this.delGroup));
            },
        },
        methods: {
            toggle(groupData) {
                groupData.open = !groupData.open;
            },
            choose(groupData) {
                this.$emit('choose', groupData);
            },
            groupChange(arr) {
                this.$emit('multiChange', arr);
            },
            // tree菜单点击
            singleMenu(groupData, action, moduleRange) {
                if (this.multi) return;
                if (groupData.default === 2 && groupData.noSelect === false) return;
                Bus.$emit('singleMenu', {groupData, action, moduleRange});
                this.choose(this.groupData);
            },
            // 操作分组（新建，编辑，删除）
            actionGroup(type, groupData, action) {
                Bus.$emit('actionGroup', {type, groupData, action});
            },
        },
        destroyed() {
            this.currentId = null;
        }
    };
</script>

<style lang="scss">
    @import '../../scss/base/mixin';
    @import '../../scss/base/variables';

    .tree-group {
        display: flex;
        line-height: 48px;
        cursor: pointer;
        position: relative;

        &:hover {
            background-color: $select-bg;
            color: $green;
            border-color: $green;
        }

        .toggle-action-btn {
            width: 16px;
            height: 16px;
            margin: 16px 5px 0 10px;
            vertical-align: top;
            border: none;
            padding: 0;
            border-radius: 100%;
            background-color: $form-border;
            @include transition();

            &:not([disabled]) {
                cursor: pointer;

                &:hover {
                    background-color: $blue;
                }
            }

            svg {
                display: block;
                width: 8px;
                height: 8px;
                margin: 4px;
                fill: white;
                cursor: inherit;
                @include transition();
            }
        }

        .group-radio {
            margin: 0 4px;
        }

        .group-name, .checkbox {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 245px;
            padding-right: 24px;
        }

        .operation {
            position: absolute;
            right: 10px;
            top: 3px;

            .gengduo {
                width: 16px;
                height: 16px;
                fill: $color-light-content;
            }

            .hidden-menu {
                top: 24px;
                right: 0px;
                @include transform-origin(left top);
            }
        }

        .checkbox {
            width: 100%;
        }

    }

    .notClick {
        display: none;
    }

    .treeactive {
        background-color: $select-bg;
        color: $green;
    }

    /*全部分组 不可选 样式*/
    .noSelectable {
        cursor: not-allowed;
        background-color: #ffffff;
        color: $border-color;

        &:hover {
            background-color: #ffffff;
            color: $border-color;
        }
    }
</style>
