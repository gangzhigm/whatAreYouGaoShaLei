<template>
    <modal class="journey-move" :title="$t('journeyList.moveTo') + $t('journeyList.group')" @close="$emit('close')">
        <div class="form-field">
            <label class="label" for="use">{{'journeyList.targetGroup' | t}}</label>
            <div class="choose-parent">
                <input type="text" class="input hg" id="use" :placeholder="$t('common.selectHolder')"
                       v-model="parentGroupName" readonly @click.stop="readyCheckGroup"/>
                <svg class="icon select-icon" aria-hidden="true" width="14" height="14"
                     @click="readyCheckGroup">
                    <use xlink:href="#icon-arrow-down"></use>
                </svg>
                <div class="search-tree-wrapper" v-if="groupSelectShow">
                    <search-tree :searchTreeData="totalTreeArry" :treeActiveId="treeActiveId"
                                 @getTreeAct='getTreeAct' :action="false" :levelStage="true"></search-tree>
                </div>
            </div>
        </div>
        <template v-slot:buttons>
            <input type="button" :disabled="!groupId" class="btn btn-md btn-theme" @click="confirm"
                   :value="$t('common.confirm')"/>
        </template>
    </modal>
</template>

<script type="text/ecmascript-6">
    import { JourneyApiV3 } from '@/api';

    export default {
        props: {
            ids: Array,
        },
        data() {
            return {
                groupId: '',
                totalTreeArry:[],
                parentGroupName: '',
                groupSelectShow: false,
                treeActiveId: '',
                sortType: 1,
            };
        },
        created() {
            this.fetchGroupList(this.sortType);
        },
        methods: {
            // group list
            fetchGroupList() {
                this.totalTreeArry = [];
                let test = [];
                let treeData = {};
                JourneyApiV3
                    .getGroupList(this.sortType)
                    .then((res) => {
                        this.reviewCount = res.body.data.reviewCount;
                        treeData = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.totalTreeArry.push(treeData);
                        this.$traverseTree(this.totalTreeArry,test);
                        this.totalTreeArry = test;

                        //查找到 "全部分组"，open = true
                        let  firstGroup = this.$getCurrentPart(2, this.totalTreeArry);
                        firstGroup.open = true;
                        firstGroup.noSelect = false;
                    });
            },
            confirm() {
                this.moveGroupRequest();
                this.$emit('move', this.groupId);
            },
            moveGroupRequest() {
                this.$toast(this.$t('journeyList.perform'), 'warn');
                JourneyApiV3
                    .moveGroup({
                        groupId: this.groupId,
                        journeyIds: this.ids,
                        status: 0, // 全选（0：NO，1：YES）
                        type: 0 // 0：移进，1：移出
                    })
                    .then(() => {
                        this.$toast(this.$t('journeyList.moveTo') + this.$t('journeyList.success'), 'success');
                    });
            },
            readyCheckGroup() {
                this.groupSelectShow = !this.groupSelectShow;
            },
            // search-tree中选择list的某一项时  接收选中项
            getTreeAct(group) {
                this.treeActiveId = group.id;
                this.parentGroupName = group.name;
                this.groupId = group.id;
                this.groupSelectShow = false;
            },
        }
    };
</script>
<style lang="scss" rel="stylesheet/scss" type="text/scss">

    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .journey-move {
        .choose-parent {
            display: inline-block;
            position: relative;
            .select-icon {
                position: relative;
                right: 10%;
                top: 4px;
                fill: $color-light-content;
            }

            .search-tree-wrapper {
                position: absolute;
                width: 328px;
                max-height: 300px;
                background-color: white;
                border: 1px solid $border-color;
                border-top: none;
                z-index: $index-container;
            }
        }
    }
</style>
