<template>
    <div class="search-tree">
        <!-- 带有搜索功能的树 -->
        <search :position="false"
            :treeData="searchTreeData"
            @sureSearch="sureSearch"
            :multi="multi"
            :multiArr="multiArr"
            :max="max"
            @multiChange="groupChange"
            :lastStage="levelStage"></search>
        <div class="tree-menu-wrapper">
            <ul v-for="(menuItem) in searchTreeData"
                :key="menuItem.id">
                <tree-menu :groupData="menuItem"
                    :depth="0"
                    :action="false"
                    @choose="chooseItem"
                    :activeId="treeActiveId"
                    :levelStage="levelStage"
                    :moduleRange="moduleRange"
                    :show-radio="showRadio"
                    :multi="multi"
                    :multiArr="multiArr"
                    :max="max"
                    @multiChange="groupChange"
                    ></tree-menu>
            </ul>
        </div>
    </div>
</template>

<script>

export default {
    name: 'search-tree',
    props: {
        searchTreeData:{//树形数据
            type: Array,
            default:[]
        },
        treeActiveId: [String,Number],
        action:Boolean,//1、Boolean 是否显示操作图标 ... 2、点击单个tree-menu是否刷新右侧列表
        levelStage:Boolean,//true：末级显示。false：末级不显示
        moduleRange:String,//模块
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
    methods: {
        // 在树形结构中选择item
        chooseItem(group) {
            this.$emit('getTreeAct', group);
        },
        // 在检索出的list中 选中某一项item
        sureSearch (group) {
            this.chooseItem(group);
        },
        // 多选
        groupChange(arr) {
            this.$emit('getTreeArray', arr);
        },
    }
};
</script>

<style lang="scss">
.search-tree{
    .tree-menu-wrapper{
        max-height: 266px;
        overflow: auto;
    }
}

</style>
