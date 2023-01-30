<template>
    <modal class="move" :title="$t('material.moveToGroup')" @close="$emit('close')">
        <div class="form-field">
            <label class="label placeholder" for="use">{{'material.targetGroup' | t}}</label>
            <div class="choose-parent" @click.stop>
                <label class="select-text" @click="readyCheckGroup">
                    {{parentGroupName || $t('common.selectHolder')}}
                    <span class="select-icon icon icon-arrow-down" ></span>
                </label>
                <div class="search-tree-wrapper" v-if="groupSelectShow">
                    <search-tree :searchTreeData="totalTreeArry" :treeActiveId="treeActiveId"
                                 @getTreeAct='getTreeAct' :action="false" :levelStage="true" :moduleRange="'materialModule'"></search-tree>
                </div>
            </div>
        </div>
        <template v-slot:buttons>
            <input type="button"
                   :disabled="!groupId"
                   class="btn btn-md btn-theme"
                   @click="confirm"
                   :value="$t('common.confirm')" />
        </template>
    </modal>
</template>

<script type="text/ecmascript-6">
import { JourneyMaterialApiV3, EmailHeadFootGroupV1, EmailHeadFootV1 } from '@/api';

export default {
    props: {
        ids: Array,
        modalType: {//弹窗类型 邮件头尾和其他
            type: String,
            default: ''
        },
        // 批量操作类型 1单个，2批量(指由批量操作按钮触发，而不是选中项数目)
        operType: {
            type: Number,
            default: 1
        }
    },
    data () {
        return {
            groupId: '',    //  分组id
            totalTreeArry:[],   //  分组[]
            treeActiveId: '',   //  modal中的搜索树active
            parentGroupName: '',    //  父级分组name
            groupSelectShow: false, //  选择分组下拉菜单是否显示
        };
    },
    mounted () {
        //点击其他地方下拉菜单收起
        window.addEventListener('click', this.eventListener);

        this.getGroupList();    //  获取分组列表
    },
    computed: {
        // 当前的groupId
        nowGroupId () {
            return this.$route.query.groupId;
        },
    },
    destroyed () {
        window.removeEventListener('click', this.eventListener);//remove监听
    },
    methods: {
        //确认移动
        confirm () {
            this.moveGroupRequest();
        },
        // 获取分组列表
        getGroupList () {
            let arr = [];
            let treeData =  {};
            if (this.modalType === 'HeaderFooter') {
                const sortType = 1;
                EmailHeadFootGroupV1
                    .getHeaderFooterGroupList(sortType)
                    .then((res) => {
                        treeData = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.totalTreeArry.push(treeData);
                        this.$traverseTree(this.totalTreeArry,arr);
                        this.totalTreeArry = arr;

                        //查找到 "全部分组"，open = true
                        let  firstGroup = this.$getCurrentPart(2, this.totalTreeArry);
                        firstGroup.open = true;
                        firstGroup.noSelect = false;
                    });
            } else {
                JourneyMaterialApiV3
                    .getTreeGroupList({ sortType: '' })
                    .then((res) => {
                        treeData = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.totalTreeArry.push(treeData);
                        this.$traverseTree(this.totalTreeArry,arr);
                        this.totalTreeArry = arr;

                        //查找到 "全部分组"，open = true
                        let  firstGroup = this.$getCurrentPart(2, this.totalTreeArry);
                        firstGroup.open = true;
                        firstGroup.noSelect = false;
                    });
            }
        },
        //  移动分组
        moveGroupRequest () {
            this.$toast(this.$t('material.perform'));
            if (this.modalType === 'HeaderFooter') {
                EmailHeadFootV1
                    .moveHeaderFooter(this.ids[0], this.groupId)
                    .then(() => {
                        this.$toast(this.$t('material.moveSuccess'),'success');
                        this.$emit('move', this.groupId);
                    });
            } else {
                JourneyMaterialApiV3.moveGroup({
                    groupId: this.groupId,
                    materialIds: this.ids,
                    status: 0, // 全选（0：NO，1：YES）
                    type: 0, // 0：移进，1：移出
                    operType: this.operType // 批量(指由批量操作按钮触发，而不是选中项数目)
                }).then(({ body: { message } }) => {
                    this.$toast(message, 'success');
                    this.$emit('move', this.groupId);
                });
            }
        },
        // search-tree中选择list的某一项时  接收选中项
        getTreeAct (group) {
            this.treeActiveId = group.id;
            this.parentGroupName = group.name;
            this.groupId = group.id;
            this.groupSelectShow = false;
        },
        // ready选择分组
        readyCheckGroup () {
            this.groupSelectShow = !this.groupSelectShow;
        },
        //通用方法 下拉菜单的收起
        eventListener () {
            this.groupSelectShow = false;
        },
    }
};
</script>
<style lang="scss">
    @import '../../../common/scss/base/_mixin.scss';
    @import '../../../common/scss/base/_variables.scss';
    .move {
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
                width: 312px;
                max-width: 312px;
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
                width: 312px;
                max-width: 312px;
                max-height: 300px;
                background-color: white;
                border: 1px solid $border-color;
                border-top: none;
                z-index: $index-container;
            }
        }
    }
</style>
