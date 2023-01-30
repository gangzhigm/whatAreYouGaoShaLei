<template>
    <div class="data-authority">
        <!--表格数据-->
        <div class="simplify-table">
            <p class="data-text">{{'privilege.access' | t}}</p>
            <table>
                <thead>
                    <tr>
                        <td>{{'privilege.dataObj' | t}}</td>
                        <td>{{'privilege.manageAll' | t}}</td>
                        <td>{{'privilege.manageOwn' | t}}</td>
                        <td>{{'privilege.manageDept' | t}}</td>
                        <td>{{'privilege.manageSubDept' | t}}</td>
                        <td>{{'privilege.manageShared' | t}}</td>
                    </tr>
                </thead>
            <tbody>
                <tr v-if="authInfo.companyType === 1 || item.soleFlag !== 'advanced_customer_swarm'"
                    v-model="value"
                    v-for="item in value">
                    <td>
                        {{item.dataName}}
                    </td>
                    <td v-for="(itemNext,index) in item.dataAuthorityDTOList" @click="dataChange(item,itemNext)">
                        <checkbox v-if="itemNext.showType === 0 ||  itemNext.showType === 1" v-model="itemNext.showType"
                                  :disabled="itemNext.dataName === '本人的数据'" />
                        <span v-else>/</span>
                    </td>
                </tr>
                <tr v-if="value.length === 0">
                    <td colspan="6" class="slim-cell">
                        <list-empty/>
                    </td>
                </tr>
            </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'dataAuthority',
        props: {
            value: Array,
        },
        computed: {
            authInfo() {
                return this.$store.state.user;
            },
        },
        methods:{
            dataChange(item,itemNext){
                if (itemNext.dataName === '全组织数据' ) {
                    for (let itemNew of item.dataAuthorityDTOList){
                        if (itemNext.showType && itemNew.dataName !== '本人的数据' && itemNew.showType !== 2){
                            itemNew.showType = 1;
                        } else if (!itemNext.showType && itemNew.dataName !== '本人的数据'  && itemNew.showType !== 2){
                            itemNew.showType = 0;
                        }
                    }
                } else if (itemNext.dataName === '本部门数据'){
                    for (let itemNew of item.dataAuthorityDTOList){
                        if (!itemNext.showType && itemNew.dataName === '全组织数据' || itemNew.dataName === '下级部门数据' && itemNew.showType !== 2 ){
                            itemNew.showType = 0;
                        } else if (itemNext.showType &&   itemNew.showType === 1 && itemNew.showType !== 2 ){
                            itemNew.showType = 1;
                        }
                    }
                } else if (itemNext.dataName === '下级部门数据'){
                    for (let itemNew of item.dataAuthorityDTOList){
                        if (itemNext.showType && itemNew.dataName === '本部门数据' && itemNew.showType !== 2 ){
                            itemNew.showType = 1;
                        } else if (!itemNext.showType && itemNew.dataName === '全组织数据' && itemNew.showType !== 2 ){
                            itemNew.showType = 0;
                        }
                    }
                } else if (itemNext.dataName === '共享的数据'){
                    for (let itemNew of item.dataAuthorityDTOList){
                        if (!itemNext.showType && itemNew.dataName === '全组织数据' && itemNew.showType !== 2 ){
                            itemNew.showType = 0;
                        }
                    }
                }
            },
        }

    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    .data-authority {
        .data-text {
            margin-bottom: 16px;
            margin-top: 8px;
        }
    }
</style>
