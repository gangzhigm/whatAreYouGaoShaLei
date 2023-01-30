<template>
    <div class="condition-group-tablist" style="display: inline-block;">
        <selector ref="singleTab"
                class="lg label-selector"
                @load="singleTabLoadMore"
                @hide="singleTabSearch('')"
                :options="filterSingleTabList"
                :search="'async'"
                @search="singleTabSearch"
                v-model="tabVal"
                @select="selectTabHandler"
                @input="$emit('input', $event)"
                @invalid="$emit('invalid')"
                :disabled="disabled">
        </selector>
    </div>
</template>
<script type="text/ecmascript-6">
    
    import filterArrayByName from '@/common/utils/filterArrayByName';

    export default {
        name: 'conditionGroupTablist',
        props: {
            // 已保存的条件簇
            value: '',
            // 下拉列表项
            tabList: {
                type: Array,
                required: true
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                tabVal: '',
                singleTabList: [],  // 用户标签单选列表（性能问题，单独创建数组）
                singleTabCount: 20, // 用户标签单选列表每页数量
            };
        },
        watch: {
            tabVal: {
                handler: function (val) {
                    // 用户标签等于、不等于单选下拉框，数据量过大时影响性能，此处滚动加载优化，回显选项放到首页
                    let selectTab = this.tabList.filter(item => item.id === val);
                    if (selectTab.length) this.singleTabList = [...new Set([selectTab[0], ...this.tabList])];
                    else this.singleTabList = this.tabList;
                },
                deep: true,
                immediate: true
            }
        },
        computed: {
            // 动态加载用户标签单选下拉列表
            filterSingleTabList() {
                return this.singleTabList.slice(0, this.singleTabCount);
            }
        },
        mounted() {
            this.tabVal = this.value;
        },
        methods: {
            // 用户标签单选列表滚动加载
            singleTabLoadMore() {
                if (this.singleTabCount >= this.singleTabList.length) return;
                if (this.singleTabList.length > this.singleTabCount + 20) {
                    this.singleTabCount += 20;
                } else {
                    this.singleTabCount = this.singleTabList.length;
                }
            },
            // 用户标签单选列表搜索
            singleTabSearch(keyword) {
                let time = keyword ? 1 : 199;
                setTimeout(() => {
                    this.$refs.singleTab.scrollTop();
                    this.singleTabCount = 20;
                }, time);
                let searchTabArr = filterArrayByName(this.tabList, keyword);
                if (this.tabVal) {
                    let selectTab = searchTabArr.filter(item => item.id === this.tabVal);
                    if (!selectTab.length) {
                        this.singleTabList = [
                            this.tabList.filter(item => item.id === this.tabVal)[0],
                            ...searchTabArr
                        ];
                    } else this.singleTabList = [...new Set([selectTab[0], ...searchTabArr])];
                } else this.singleTabList = searchTabArr;
            },
            // 选择
            selectTabHandler(data) {
                this.singleTabSearch('');
                this.$emit('select', data);
            }
        },
    };
</script>
