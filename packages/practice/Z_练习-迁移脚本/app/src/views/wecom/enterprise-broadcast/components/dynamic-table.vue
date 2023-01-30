<template>
    <div class="dynamic-table">
        <div class="table">
            <table>
                <thead>
                    <tr>
                        <th v-for="t in theadList">
                            {{ t.name }}
                            <FilterDrop v-if="isShow(t.field)" :value="getValue(t.field)" :list="getOptionList(t.field)"
                                attribute="id" @close="close(t.field)" @onOff="onOff(t.field)"
                                @valueChange="valueChange($event,t.field)">
                            </FilterDrop>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="loading" class="no-hover">
                        <td colspan="24" class="slim-cell">
                            <inline-loading />
                        </td>
                    </tr>
                    <tr v-for="t in tableList" v-else>
                        <td v-for="(v, k) in t">
                            {{ v }}
                        </td>
                    </tr>
                </tbody>
            </table>
            <list-empty v-if="!loading&&tableList.length === 0" />
        </div>
    </div>
</template>
<script>
export default {
    name: 'DynamicTable',
    props: {
        //tbody
        list: {
            type: Array,
            default: [],
        },
        //thead
        theadList: {
            type: Array,
            default: [],
        },
        //筛选条件
        chooseList: {
            type: Array,
            default: []
        },
        loading: {
            type: Boolean,
            default: true
        },
        formatNumber: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        //数字千分位转换 1000 → 1,000
        format (num) {
            return (num + '').replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, '$1,');
        },
        //判断筛选器是否显示
        isShow (field) {
            const isShow = this.chooseList.findIndex(e => e.name === field) === -1 ? false : true;
            return isShow;
        },
        //获取筛选条件的下拉选项
        getOptionList (field) {
            const index = this.chooseList.findIndex(e => e.name === field);
            return this.chooseList[index].select;
        },
        //关闭筛选条件
        close (field) {
            const index = this.chooseList.findIndex(e => e.name === field);
            this.chooseList[index].show = false;
        },
        //获取筛选条件选中的值
        getValue (field) {
            const index = this.chooseList.findIndex(e => e.name === field);
            return this.chooseList[index].value;
        },
        //筛选条件开关
        onOff (field) {
            const index = this.chooseList.findIndex(e => e.name === field);
            this.chooseList[index].show = !this.chooseList[index].show;
        },
        valueChange (val, field) {
            const index = this.chooseList.findIndex(e => e.name === field);
            this.chooseList[index].value = val;
            this.$emit('valueChange');
        },
    },
    computed: {
        //数字相关的数据千分位转换
        tableList () {
            let list = [...this.list];
            if (this.formatNumber) {
                list.forEach((e) => {
                    for (let i in e) {
                        if (typeof e[i] === 'number') {
                            e[i] = this.format(e[i]);
                        }
                    }
                });
            }
            return list;
        },
    }
};
</script>
<style lang='scss'>
.dynamic-table {
    table {
        background-color: #fff;
        border-collapse: collapse;
        border-left: 1px solid #e0e5ea;
        border-right: 1px solid #e0e5ea;
        border-spacing: 0;
        border-top: 1px solid #e0e5ea;
        width: 100%;
        tbody td:not(.action-td) {
            white-space: unset;
            overflow: unset;
            text-overflow: unset;
        }
    }
}
</style>