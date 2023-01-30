<template>
    <div class="tree-menu">
        <div class="tree-content">
            <!-- 第一级 -->
            <ul class="groups" v-for="(list, index) in filteredGroupList" :key="index">
                <li data-type="menu" class='groupLevel1'>
                    <button type="button" class="toggle-action-btn" @click="toggleCluster(list.id)">
                        <svg aria-hidden="true" v-if="openViews.clusterIds.includes(list.id)">
                            <use xlink:href="#icon-arrow-down"></use>
                        </svg>
                        <svg aria-hidden="true" v-if="!openViews.clusterIds.includes(list.id)">
                            <use xlink:href="#icon-right"></use>
                        </svg>
                    </button>
                    <checkBox v-model="allChecked" :source="list" @checkinput="checkinput">
                        <span class='level-span level1-span'> {{list.name}} </span>
                    </checkBox>
                    <!-- <span class='level-span level1-span'>{{list.name}}</span> -->
                </li>
                <!-- 第二级 -->
                <div v-if="openViews.clusterIds.includes(list.id)">
                    <!-- 第二级复选框 -->
                    <li class="groupLevel2" v-for="(label, index) in list.labels" :key="index" :title="label.name" data-type="option">
                        <checkBox :source="label" v-model="checkedItem" @input="checkChildInput(label, list)">
                            <span class='level-span level2-span'> {{label.name}} </span>
                        </checkBox>
                    </li>
                    <!-- 第二级下拉 -->
                    <li data-type="menu">
                        <ul v-for="(group, index) in list.childs" :key="index">
                            <li class="groupLevel2">
                                <button type="button" class="toggle-action-btn" @click="toggleCluster(group.id)">
                                    <svg aria-hidden="true" v-if="openViews.clusterIds.includes(group.id)">
                                        <use xlink:href="#icon-arrow-down"></use>
                                    </svg>
                                    <svg aria-hidden="true" v-if="!openViews.clusterIds.includes(group.id)">
                                        <use xlink:href="#icon-right"></use>
                                    </svg>
                                </button>
                                <checkBox :source="group" v-model="allChecked" @checkinput="checkinput">
                                    <span class='level-span level1-span'>{{group.name}}</span>
                                </checkBox>
                            </li>
                            <!-- 第三级 -->
                            <div v-if="openViews.clusterIds.includes(group.id)">
                                <!-- 第三级复选框 -->
                                <li class="groupLevel3" v-for="(labelThree, index) in group.labels" :key="index" :title="labelThree.name" data-type="option">
                                    <checkBox :source="labelThree" v-model="checkedItem" @input="checkChildInput(labelThree, group)">
                                        <span class='level-span level3-span'> {{labelThree.name}} </span>
                                    </checkBox>
                                </li>
                                <!-- 第三级下拉 -->
                                <li data-type="menu">
                                    <ul v-for="(groupThree, index) in group.childs" :key="index">
                                        <li class="groupLevel3">
                                            <button type="button" class="toggle-action-btn" @click="toggleCluster(groupThree.id)">
                                                <svg aria-hidden="true" v-if="openViews.clusterIds.includes(groupThree.id)">
                                                    <use xlink:href="#icon-arrow-down"></use>
                                                </svg>
                                                <svg aria-hidden="true" v-if="!openViews.clusterIds.includes(groupThree.id)">
                                                    <use xlink:href="#icon-right"></use>
                                                </svg>
                                            </button>
                                            <checkBox :source="groupThree" v-model="allChecked" @checkinput="checkinput">
                                                <span class='level-span level1-span'>{{groupThree.name}}</span>
                                            </checkBox>
                                            <!-- <span class='level-span level1-span'>{{groupThree.name}}</span> -->
                                        </li>
                                        <!-- 第四级 -->
                                        <div v-if="openViews.clusterIds.includes(groupThree.id)">
                                            <!-- 第四级复选框 -->
                                            <li class="groupLevel4" v-for="(labelFour, index) in groupThree.labels" :key="index" :title="labelFour.name" data-type="option">
                                                <checkBox :source="labelFour" v-model="checkedItem" @input="checkChildInput(labelFour, groupThree)">
                                                    <span class='level-span level4-span'> {{labelFour.name}} </span>
                                                </checkBox>
                                            </li>
                                            <!-- 第四级下拉 -->
                                            <li data-type="menu">
                                                <ul v-for="(groupFour, index) in groupThree.childs" :key="index">
                                                    <li class="groupLevel4">
                                                        <button type="button" class="toggle-action-btn" @click="toggleCluster(groupFour.id)">
                                                            <svg aria-hidden="true" v-if="openViews.clusterIds.includes(groupFour.id)">
                                                                <use xlink:href="#icon-arrow-down"></use>
                                                            </svg>
                                                            <svg aria-hidden="true" v-if="!openViews.clusterIds.includes(groupFour.id)">
                                                                <use xlink:href="#icon-right"></use>
                                                            </svg>
                                                        </button>
                                                        <checkBox :source="groupFour" v-model="allChecked" @checkinput="checkinput">
                                                            <span class='level-span level1-span'>{{groupFour.name}}</span>
                                                        </checkBox>
                                                        <!-- <span class='level-span level1-span'>{{groupFour.name}}</span> -->
                                                    </li>
                                                    <!-- 第五级 -->
                                                    <div v-if="openViews.clusterIds.includes(groupFour.id)">
                                                        <!-- 第五级复选框 -->
                                                        <li class="groupLevel5" v-for="(labelFive, index) in groupFour.labels" :key="index" :title="labelFive.name" data-type="option">
                                                            <checkBox :source="labelFive" v-model="checkedItem"
                                                                      @input="checkChildInput(labelFive, groupFour)">
                                                                <span class='level-span level4-span'> {{labelFive.name}} </span>
                                                            </checkBox>
                                                        </li>
                                                        <!-- 第五级下拉 -->
                                                        <li data-type="menu">
                                                            <ul v-for="(groupFive, index) in groupFour.childs" :key="index">
                                                                <li class="groupLevel5">
                                                                    <button type="button" class="toggle-action-btn" @click="toggleCluster(groupFive.id)">
                                                                        <svg aria-hidden="true" v-if="openViews.clusterIds.includes(groupFive.id)">
                                                                            <use xlink:href="#icon-arrow-down"></use>
                                                                        </svg>
                                                                        <svg aria-hidden="true" v-if="!openViews.clusterIds.includes(groupFive.id)">
                                                                            <use xlink:href="#icon-right"></use>
                                                                        </svg>
                                                                    </button>
                                                                    <checkBox :source="groupFive" v-model="allChecked" @checkinput="checkinput">
                                                                        <span class='level-span level1-span'>{{groupFive.name}}</span>
                                                                    </checkBox>
                                                                    <!-- <span class='level-span level1-span'>{{groupFive.name}}</span> -->
                                                                </li>
                                                            </ul>
                                                        </li>
                                                    </div>
                                                </ul>
                                            </li>
                                        </div>
                                    </ul>
                                </li>
                            </div>
                        </ul>
                    </li>
                </div>
            </ul>
        </div>
    </div>
</template>

<script>
import checkBox from '@/common/components/checkbox-cpcode.vue';
export default {
    name: 'tree-menu',
    props: {
        options: {
            type: Array,
            default: () => {
                return [];
            },
            required: true
        },
        value: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            openViews: {
                clusterIds: [],
            },
            allChecked: [],
            findData: null,
            checkedItem: []
        };
    },
    computed: {
        filteredGroupList() {
            return this.options;
        },
    },
    mounted() {
        this.checkedItem = this.value;
        if (this.checkedItem.length) {
            // 从已选列表中移除失效标签
            this.checkedItem.forEach(e => {
                let res = this.findById(e.id, this.filteredGroupList);
                if (res && res.id) {
                    if (res.groupId && !e.groupId) {
                        e.groupId = res.groupId; //补全拖拽编辑器保存的素材，其标签缺少的groupId
                    }
                } else {
                    this.checkedItem.splice(this.checkedItem.findIndex(ele => ele.id === e.id), 1);
                }
            });
            this.$emit('input', this.checkedItem);
            this.openViews.clusterIds = [...new Set(this.checkedItem.map(elm => elm.groupId))];

            this.openViews.clusterIds.forEach(ids =>{
                this.findData = null;
                this.findTargetItems(this.filteredGroupList, ids);
                let item = this.findData;

                if (item !== null) {
                    let labels = item.labels.length;
                    let checkLabels = this.checkedItem.filter(elm => elm.groupId === ids).length;

                    if (labels === checkLabels) this.allChecked.push(item);
                }
            });
        }
    },
    methods: {
        toggleCluster(clusterId) {
            const index = this.openViews.clusterIds.findIndex(id => id === clusterId);
            index === -1 ? this.openViews.clusterIds.push(clusterId) : this.openViews.clusterIds.splice(index, 1);
        },
        checkinput(add, selectArr, flagIndex) {
            let arr = [];
            add.filter(item => {
                item.labels.filter(items =>{
                    // 添加分組Id用于回显展开分组
                    items.groupId = item.id;
                    arr.push(items);
                });
            });
            for (let iterator of selectArr) {
                let index = this.checkedItem.map(elm => elm.id).indexOf(iterator.id);
                if (flagIndex === -1){
                    index === -1 ? (this.checkedItem.push(iterator)) : null;
                } else {
                    index === -1 ? null : (this.checkedItem.splice(index,1));
                }
            }
            this.$emit('input', arr);

        },
        // 添加分組Id用于回显展开分组
        checkChildInput(label, group) {
            label.groupId = group.id;

            this.$nextTick(() =>{
                let curGroupL = this.checkedItem.filter(elm => elm.groupId === group.id).length;
                let allCurGroupL = group.labels.length;

                if (curGroupL === allCurGroupL) {
                    this.allChecked.push(group);
                } else {
                    let ids = this.allChecked.map(all => all.id);
                    let target = ids.findIndex(id => id === group.id);
                    if (target > -1) {
                        this.allChecked.splice(target, 1);
                    }
                }
            });
            this.$emit('input', this.checkedItem);
        },

        // id对应item
        findTargetItems(list, id) {

            let targetList = list.filter(elm => elm.id === id);

            if (targetList.length) {
                this.findData = targetList[0];
            }

            if (!targetList.length) {
                for (let i = 0; i < list.length; i++) {
                    if (this.findData !== null) break;
                    if (list[i].childs && list[i].childs.length) {
                        this.findTargetItems(list[i].childs, id);
                    }
                }
            }
        },
        /**
         * 根据id找到树结构中对应的childs
         * @param id
         * @param list
         */
        findById (id, list) {
            let hasFound = false; // 表示是否有找到id值
            let result = {};
            let fn = function (groupList) {
                if (Array.isArray(groupList) && !hasFound) { // 判断是否是数组并且没有的情况下，
                    groupList.forEach(item => {
                        if (item.labels && item.labels.length) {
                            let got = item.labels.find(elm => elm.id === id);
                            if (got) {
                                result.id = got.id; //返回结果项目id
                                result.groupId = item.id;// 返回结果的父级id
                                hasFound = true; // 并且找到id值
                            } else if (item.childs) {
                                fn(item.childs); // 递归调用下边的子项
                            }
                        } else if (item.childs) {
                            fn(item.childs); // 递归调用下边的子项
                        }
                    });
                }
            };
            fn(list); // 调用一下
            return result;
        }
    },
    components: {
        checkBox
    }
};
</script>
<style lang='scss' scoped>
    // @import '../../../scss/base/_variables.scss';
    @import '../../../../common/scss/base/mixin';
    @import '../../../../common/scss/base/variables';
    .tree-menu {
        .level-span {
            color: #333;
        }
        .level-span:hover {
            color: #333;
        }
        li {
            list-style: none;
        }
        ul {
            padding: 0;
        }
        .tree-content {
            width: 100%;
            height: 50vh;
            overflow: auto;
            border: 1px solid #eee;

            .groups {
                margin-left: 8px;
                margin-top: 4px;
                margin-bottom: 20px;
                
                .icon-arrow {
                    font-size: 16px;
                    color: #cfd5df;
                }

                .groupLevel1 {
                    line-height: 24px;
                    display: flex;
                }

                .groupLevel2 {
                    padding-left: 40px;
                    line-height: 30px;
                    display: flex;
                }

                .groupLevel3 {
                    padding-left: 80px;
                    line-height: 30px;
                    display: flex;
                }

                .groupLevel4 {
                    padding-left: 120px;
                    line-height: 30px;
                    display: flex; 
                }

                .groupLevel5 {
                    padding-left: 160px;
                    line-height: 30px;
                    display: flex;
                }
            }

            .search-item {
                width: 100%;
                height: 30px;
                border-bottom: 1px solid #d2dae0;
                float: left;
                line-height: 30px;
                text-indent: 8px;
                color: rgba(66, 66, 66, 0.847059);
                cursor: pointer;
                overflow: hidden;
            }
        }
        .toggle-action-btn {
            width: 16px;
            height: 16px;
            margin: 7px 5px 0 10px;
            vertical-align: top;
            border: none;
            padding: 0;
            border-radius: 100%;
            background-color: $form-border;
            @include transition();

            &:not([disabled]) {
                cursor: pointer;

                &:hover {
                    background-color: #cfd5df;
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
    }
</style>