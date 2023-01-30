<template>
    <div class="swarm-modal">
        <!-- 通用新建/编辑分群 -->
        <confirm v-if="!disabled" :size="'sl'" :autoConfirm="false" :title="addModalParams.swarmId ? $t('swarm.editGroup') :  $t('swarm.addGroup')" @cancel="cancelAdd"
            @confirm="confirmAdd">
            <!--分群名称-->
            <div class="form-field">
                <label class="label">{{'swarm.groupNameLabel' | t}}</label>
                <input class="input lg" :class="{error: addModalParams.nameErrorText}" type="text" v-model.trim="addModalParams.swarmName"
                    @click="addModalParams.nameErrorText = ''" :placeholder="$t('swarm.enterGroupName')" maxlength="100"
                    v-title:top.warn.line="addModalParams.nameErrorText">
            </div>
            <!--分群分组-->
            <div class="form-field" @click="closeGroupSelect">
                <label class="label placeholder" for="pId">{{'swarm.selectGroup'|t}}</label>
                <div class="choose-parent lg" id="pId" @click.stop="readyCheckGroup">
                    <label class="select-text">
                        {{treeParams.parentGroupName || $t('common.selectHolder')}}
                        <span class="select-icon icon icon-arrow-down"></span>
                    </label>
                    <div class="search-tree-wrapper" v-if="treeParams.groupSelectShow" @click.stop>
                        <!-- 带有搜索功能的树 -->
                        <search-tree :searchTreeData="allTreeData" :treeActiveId="treeParams.treeActiveGid" @getTreeAct="getTreeAct" :action="false"
                            :levelStage="true" :moduleRange="'swarm'">
                        </search-tree>
                    </div>
                </div>
            </div>
            <!--分群条件-->
            <div class="condition-box">
                <label class="label">{{'swarm.swarmCondition' | t}}</label>
                <condition-bunch ref="conditionGroup" @valid="handleCondition" :bunchData="addModalParams.swarmJson">
                </condition-bunch>
            </div>
        </confirm>
        <!-- 查看分群 -->
        <modal v-if="disabled" :size="'sl'" :title="$t('swarm.swarmView')" @close="cancelAdd">
            <!--分群名称-->
            <div class="form-field">
                <label class="label">{{'swarm.groupName' | t}}</label>
                <span class="disable-span lg">{{addModalParams.swarmName}}</span>
            </div>
            <!--分群分组-->
            <div class="form-field" @click="closeGroupSelect">
                <label class="label placeholder" for="pId">{{'swarm.selectGroup'|t}}</label>
                <span class="disable-span lg">{{treeParams.parentGroupName}}</span>
            </div>
            <!--分群条件-->
            <div class="condition-box">
                <label class="label">{{'swarm.swarmCondition' | t}}</label>
                <condition-bunch ref="conditionGroup" :bunchData="addModalParams.swarmJson" :writable="false">
                </condition-bunch>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme-border" @click.stop="cancelAdd"
                       :value="$t('common.close')"/>
            </template>
        </modal>
    </div>
</template>
<script type="text/ecmascript-6">

import { ContactApiV1 } from '@/api';
import { COMMON_NAME_REGEXP } from '../../common/utils/regs';
// import Bus from '../../common/components/group-tree/bus.js'; // Bus是在树形组件中传参时使用
import conditionBunch from '../../common/components/condition-bunch/conditionBunch.vue';

export default {
    name: 'swarmModal',
    provide(){
        return {
            optimizeRelativeTime:true, //  用于判断相对时间是否需要添加提前/延后N天的条件，如果后面需要前部添加的话，则去掉此处的provide以及子组件的inject
        };
    },
    props: {
        // 已保存的条件簇
        addModalParams: {
            type: Object,
            required: true
        },
        // 树组件参数
        treeParams: {
            type: Object,
            default: false
        },
        // 树组件参数
        allTreeData: {
            type: Array,
            default: false
        },
        //是否查看模式
        disabled: {
            type: Boolean,
            default: false
        }
    },
    components: { conditionBunch },
    data () {
        return {
            showAddSwarm: false, // 展示新建/编辑分群弹窗
            isReqOver: false
        };
    },
    mounted () {
        window.addEventListener('click', this.eventListener);
    },
    computed: {},
    methods: {
        //取消操作，关闭弹窗
        cancelAdd () {
            this.$emit('cancel');
            //默认 "全部分组" 展开
            let  firstGroup = this.$getCurrentPart(2, this.allTreeData);
            firstGroup.open = true;
        },

        // 确认添加/修改分群
        confirmAdd () {
            if (this.addModalParams.swarmName === '') {
                this.addModalParams.nameErrorText = this.$t('swarm.nameNoEmpty');
                this.$toast(this.$t('swarm.enterGroupName'), 'warn');
                return;
            }
            if (!COMMON_NAME_REGEXP.test(this.addModalParams.swarmName)) {
                this.addModalParams.nameErrorText = this.$t('swarm.labelNameReg');
                return;
            }
            if (this.treeParams.treeActiveGid === '') {
                this.$toast(this.$t('swarm.pickAGroup'), 'warn');
                return;
            }
            this.$refs.conditionGroup.valid();
        },

        // 关闭组选
        closeGroupSelect () {
            this.treeParams.groupSelectShow = false;
        },

        /**
         * 条件组件校验通过后调用的方法
         * @param swarmJson 分群条件JSON数据
         * @param autoSave 数据无效时清除无效条件并保存数据
         */
        handleCondition (swarmJson,autoSave) {
            if (this.isReqOver) return;
            this.isReqOver = true;
            if (this.addModalParams.swarmId) {
                // 编辑分群
                ContactApiV1
                    .updateSwarm({
                        id: this.addModalParams.swarmId,
                        name: this.addModalParams.swarmName,
                        swarmJson: swarmJson,
                        groupId: this.treeParams.treeActiveGid,
                        operation: 0,
                        type: 1
                    })
                    .then(() => {
                        this.isReqOver = false;
                        if (!autoSave) {
                            this.addModalParams.swarmJson = JSON.parse(swarmJson);
                            this.$toast(this.$t('common.updateSuccess'), 'success');
                            this.showAddSwarm = false;
                            this.$openToFalse(this.allTreeData);
                            this.$emit('confirm', {
                                addModalParams: this.addModalParams,
                                treeParams: this.treeParams
                            });
                        }
                    })
                    .catch(() => {
                        this.isReqOver = false;
                    });
            } else {
                // 新建分群
                ContactApiV1
                    .saveSwarm({
                        name: this.addModalParams.swarmName,
                        swarmJson: swarmJson,
                        groupId: this.treeParams.treeActiveGid,
                        type: 1,
                        parentId: 0,
                        operation: 0
                    })
                    .then(() => {
                        this.isReqOver = false;
                        this.$toast(this.$t('common.createSuccess'), 'success');
                        this.showAddSwarm = false;
                        this.$openToFalse(this.allTreeData);
                        this.$emit('confirm');
                    })
                    .catch(() => {
                        this.isReqOver = false;
                    });
            }
        },

        // <tree-menu 限定方法>
        // 弹窗中 tree-menu是否显示
        readyCheckGroup () {
            this.treeParams.groupSelectShow = !this.treeParams.groupSelectShow;
        },

        /**
         * search-tree中选择list的某一项时  接收选中项
         * @param group 分组数据
         */
        getTreeAct (group) {
            this.treeParams.treeActiveGid = group.id;
            this.treeParams.parentGroupName = group.name;
            this.treeParams.searchSelectTree = group; //search-tree中选中的某一项的id
            this.treeParams.groupSelectShow = false;
        },

        eventListener () {
            this.$emit('hideGroup');
        },
    }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../common/scss/base/variables';
@import '../../common/scss/base/mixin';
.swarm-modal {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    .choose-parent {
        display: inline-block;
        position: relative;
        width: 314px;
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
        }
    }
    .form-field {
        .label {
            width: 90px;
        }
        .disable-span{
            display: inline-block;
            border: 1px solid $border-color;
            background-color: $content-bg;
            border-radius: 3px;
            padding: 8px;
            line-height: normal;
        }
    }
    .condition-box {
        margin-top: 1em;
        .label {
            display: inline-block;
            width: 90px;
            vertical-align: top;
            margin-right: 12px;
            color: #595959;
            text-align: right;
        }
    }
    .modal-content {
        height: calc(80vh - 154px);
        overflow-y: auto;
    }
}
</style>
