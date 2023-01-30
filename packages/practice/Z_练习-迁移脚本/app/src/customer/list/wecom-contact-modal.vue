<template>
    <div class="contact-about-modal">
        <modal :title="$t('contact.record')+' ( '+totalRow+' ) '" class="wecom-staff-modal" size="lg" @close="$emit('closeRecord')" v-if="pageType==='record'">
            <div class="simplify-table">
                <table>
                    <thead>
                        <tr class='thead'>
                            <th>{{'contact.employeeName' | t}}</th>
                            <th>{{'contact.Status' | t}}</th>
                            <th>{{'contact.source' | t}}</th>
                            <th>{{'contact.liveCode' | t}}</th>
                            <th>{{'contact.addTime' | t}}</th>
                            <th>{{'contact.lostTime' | t}}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(staff,index) in staffList" :key="index">
                            <td>
                                {{staff.name}}
                                <span :class="{'primary-color':staff.isFirst==='1'}" v-if="staff.isFirst==='1'">( {{'contact.Primary' | t}} )</span>
                            </td>
                            <td>{{staff.status==0?$t('contact.Lost'):$t('contact.notLost')}}</td>
                            <td>{{staff.wecomAddWay || '/'}}</td>
                            <td>{{staff.wecomChannelCode || '/'}}</td>
                            <td>{{staff.wecomCreateTime || '/'}}</td>
                            <td>{{staff.wecomDeleteTime || '/'}}</td>
                        </tr>

                    </tbody>
                </table>
                <list-empty v-if="staffList.length===0&&!loading"/>
                <inline-loading v-if="loading"/>
            </div>
            <pager :total="totalPage" :now="nowPage" @page="handlePage" v-if="totalPage>0"/>
        </modal>
        <modal :title="$t('contact.group')+' ( ' + wecomGroupList.length + ' )'" class="wecom-group-modal" @close="$emit('closeRecord')" v-if="pageType==='group'">
            <span class="group-name theme-text" v-for="group in wecomGroupList" :key="group.id">
                {{group.name || $t('contact.noGroupName')}}
            </span>
        </modal>
    </div>

</template>

<script>
    import { ContactApiV1 } from '@/api';

    export default {
        name: 'ContactRecordModal',
        data() {
            return {
                staffList:[],//员工记录列表
                totalPage:1,
                nowPage:1,
                loading:true,
                totalRow: 0
            };
        },
        props: {
            pageType: {//展示类型 record:员工记录，group：所属群
                type: String,
                default: '',
            },
            customerId: {//联系人id
                type: [Number, String],
            },
            //企业微信联系人所属群
            wecomGroupList: {
                type: Array
            },
        },
        mounted() {
            this.getStaffRecord();
        },
        methods: {
            closeRecord() {
                this.$emit('closeRecord');
            },
            //获取员工记录列表
            getStaffRecord() {
                this.loading = true;
                ContactApiV1
                    .getStaffRecord(this.customerId, this.nowPage)
                    .then( ( { body: { data } } ) => {
                        this.staffList = data.staffList;
                        this.loading = false;
                        this.totalPage = data.totalPage;
                        this.totalRow = data.totalRow;
                    })
                    .catch(() => {
                        this.loading = false;
                    });
            },
            //翻页
            handlePage(e) {
                this.staffList = [];
                this.nowPage = e;
                this.getStaffRecord();
            }
        }
    };
</script>

<style lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .contact-about-modal{
        .group-name{
            display: inline-block;
            margin: 5px;
            border: 1px solid $green;
            padding: 5px  10px;
            border-radius: 15px;
        }
        .primary-color{
            color: #D9001B;
        }
    }
</style>
