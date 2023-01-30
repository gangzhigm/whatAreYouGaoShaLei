<template>
    <div class='group-data'>
        <div class="data-summarization" v-if="tableType">
            <!-- tab切换 -->
            <div class="tab">
                <div class="tab-item" :class="{active: activeTab === 1 }" @click="tabToggle(1)">{{'report.totalData' | t}}</div>
                <div class="tab-item" :class="{active: activeTab === 2}" @click="tabToggle(2)">{{'report.labelData' | t}}</div>
            </div>
            <!-- 表格数据 -->
            <div class="simplify-table scroll auto-width">
                <table v-if="activeTab === 1">
                    <thead>
                        <tr>
                            <td>{{'report.groupName' | t}}</td>
                            <td>{{'report.cumulativeNumberServed' | t}}</td>
                            <td>{{'report.sendNumber' | t}}</td>
                            <td>{{'report.successSentRate' | t}}</td>
                            <td>{{'report.openRate' | t}}</td>
                            <td>{{'report.clickRate' | t}}</td>
                            <td>{{'report.cto' | t}}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in tableDataList" :key="index">
                            <td>{{item.groupName}}</td>
                            <td>{{item.successCount}}</td>
                            <td>{{item.sendCount}}</td>
                            <td>{{item.deliveryRate}}</td>
                            <td>{{item.uniqueOpenRate}}</td>
                            <td>{{item.uniqueClickRate}}</td>
                            <td>{{item.CTO}}</td>
                        </tr>
                    </tbody>
                </table>
                <list-empty v-if="activeTab === 1 && tableDataList.length == 0" />
                <table v-if="activeTab === 2">
                    <thead>
                        <tr>
                            <td>{{'report.groupName' | t}}</td>
                            <td>{{'report.campaign' | t}}</td>
                            <td>{{'report.audience' | t}}</td>
                            <td>{{'report.creative' | t}}</td>
                            <td>{{'report.cumulativeNumberServed' | t}}</td>
                            <td>{{'report.sendNumber' | t}}</td>
                            <td>{{'report.successSentRate' | t}}</td>
                            <td>{{'report.openRate' | t}}</td>
                            <td>{{'report.clickRate' | t}}</td>
                            <td>{{'report.cto' | t}}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in tableDataList" :key="index">
                            <td>{{item.groupName}}</td>
                            <td>{{item.campaign}}</td>
                            <td>{{item.audience}}</td>
                            <td>{{item.creative}}</td>
                            <td>{{item.successCount}}</td>
                            <td>{{item.sendCount}}</td>
                            <td>{{item.deliveryRate}}</td>
                            <td>{{item.uniqueOpenRate}}</td>
                            <td>{{item.uniqueClickRate}}</td>
                            <td>{{item.CTO}}</td>
                        </tr>
                    </tbody>
                </table>
                <list-empty v-if="activeTab === 2 && tableDataList.length == 0" />
            </div>
        </div>
        <div class="data-summarization" v-else>
            <div class="head-list">
                <!-- tab切换 -->
                <div class="tab">
                    <div class="tab-item" :class="{active: activeTab === 1 }" @click="tabToggle(1)">{{'report.labelDatabase' | t}}</div>
                    <div class="tab-item" :class="{active: activeTab === 2 }" @click="tabToggle(2)">{{'report.mailingLabel' | t}}</div>
                    <div class="tab-item" :class="{active: activeTab === 3 }" @click="tabToggle(3)">{{'report.linkLabel' | t}}</div>
                </div>
                <!-- 搜索与下拉 -->
                <div>
                    <div class="pull-right search-box search-name">
                        <input type="text"
                            :disabled="paramsSearch.selectValue == ''"
                            v-model.trim="paramsSearch.searchName"
                            @keyup.enter="search"
                            :placeholder="paramsSearch.selectValue == '' ? $t('report.inputWarn') : ''">
                        <svg aria-hidden="true" @click="search">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                    <selector class="pull-right"
                            :options="activeTab == 1 ? labelOptions : activeTab == 2 ? cpCodeOptions : linkOptions "
                            v-model.trim="paramsSearch.selectValue"/>
                </div>
            </div>
            <!-- 表格数据 -->
            <div class="simplify-table scroll auto-width">
                <table v-if="activeTab === 1">
                    <thead>
                        <tr>
                            <td>{{'report.index' | t}}</td>
                            <td>{{'report.LevelOneLabel' | t}}</td>
                            <td>{{'report.LevelTwoLabel' | t}}</td>
                            <td>{{'report.LevelThreeLabel' | t}}</td>
                            <td>{{'report.uploadTime' | t}}</td>
                            <td>{{'report.updatetime' | t}}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in tableDataList" :key="index">
                            <td>{{index + 1}}</td>
                            <td>{{item.level1}}</td>
                            <td>{{item.level2}}</td>
                            <td>{{item.level3}}</td>
                            <td>{{item.createDate}}</td>
                            <td>{{item.updateDate}}</td>
                        </tr>
                    </tbody>
                </table>
                <list-empty v-if="activeTab === 1 && tableDataList.length == 0" />
                <table v-if="activeTab === 2">
                    <thead>
                        <tr>
                            <td>{{'report.index' | t}}</td>
                            <td>{{'report.CPcode' | t}}</td>
                            <td>{{'report.LevelThreeLabel' | t}}</td>
                            <td>{{'report.uploadTime' | t}}</td>
                            <td>{{'report.updatetime' | t}}</td>
                            <td>Title</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in tableDataList" :key="index">
                            <td>{{index + 1}}</td>
                            <td>{{item.cpCode}}</td>
                            <td>{{item.level3}}</td>
                            <td>{{item.createDate}}</td>
                            <td>{{item.updateDate}}</td>
                            <td>{{item.title !== 'null' ? item.title : '/'}}</td>
                        </tr>
                    </tbody>
                </table>
                <list-empty v-if="activeTab === 2 && tableDataList.length == 0" />
                <table v-if="activeTab === 3">
                    <thead>
                        <tr>
                            <td>{{'report.index' | t}}</td>
                            <td>{{'report.link' | t}}</td>
                            <td>{{'report.LevelThreeLabel' | t}}</td>
                            <td>{{'report.uploadTime' | t}}</td>
                            <td>{{'report.updatetime' | t}}</td>
                            <td>Title</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in tableDataList" :key="index">
                            <td>{{index + 1}}</td>
                            <td>{{item.dmdClickUrl}}</td>
                            <td>{{item.level3}}</td>
                            <td>{{item.createDate}}</td>
                            <td>{{item.updateDate}}</td>
                            <td>{{item.title !== 'null' ? item.title : '/'}}</td>
                        </tr>
                    </tbody>
                </table>
                <list-empty v-if="activeTab === 3 && tableDataList.length == 0" />
            </div>
            <pager v-if="tableDataList.length != 0" :total="totalPage" :now="pageNumber" @page="selectPage">
                <span>{{'report.totalPages' | t}}&nbsp;&nbsp;{{totalSkips}}&nbsp;&nbsp;{{'report.strip' | t}}</span>
                {{'contact.everyPage' | t}}
                <selector :options="pageSizeOptions"
                            value="10"
                            @input="tapPagesHander"
                            v-model.trim="params.pageSize"
                            style="width:auto"/>
                {{'contact.maxPage' | t}}
            </pager>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    export default {
        props: {
            tableDataList: {
                type: Array,
                default: []
            },
            tableType:{
                type:Boolean,
                default:true
            },
            totalPage:{
                type:Number,
                default:0
            },
            pageNumber:{
                type:Number,
                default:0
            },
            totalSkips:{
                type:Number,
                default:0
            }
        },
        data () {
            return {
                activeTab: 1,               //1 总数据  2 标签数据
                params: {
                    pageSize: 10
                },
                pageSizeOptions: [         //每页显示条数
                    {id: 200, name: 200},
                    {id: 100, name: 100},
                    {id: 50, name: 50},
                    {id: 20, name: 20},
                    {id: 10, name: 10}
                ],
                paramsSearch:{
                    searchName:'',        //搜索
                    selectValue:'',       //下拉
                },
                //tab标签库下的下拉框
                labelOptions:[
                    {
                        id:1,
                        name:this.$t('report.LevelOneLabel')
                    },
                    {
                        id:2,
                        name:this.$t('report.LevelTwoLabel')
                    },
                    {
                        id:3,
                        name:this.$t('report.LevelThreeLabel')
                    }
                ],
                //tab邮件标签下的下拉框
                cpCodeOptions:[
                    {
                        id:1,
                        name:this.$t('report.CPcode')
                    },
                    {
                        id:2,
                        name:this.$t('report.label')
                    }
                ],
                //tab链接标签下的下拉框
                linkOptions:[
                    {
                        id:1,
                        name:this.$t('report.link')
                    },
                    {
                        id:2,
                        name:this.$t('report.label')
                    },
                ]
            };
        },
        methods: {
            //tab切换
            tabToggle(id) {
                this.activeTab = id;
                this.$emit('getTableData', id);
                this.paramsSearch.selectValue = '';
                this.paramsSearch.searchName = '';
            },
            //页数跳转
            selectPage(val) {
                this.pageNumber = val;
                this.$emit('pageTurning',val);
            },
            //页面按照选择的条数进行展示
            tapPagesHander(val) {
                this.params.pageSize = val;
                this.$emit('getPagingList',val);
            },
            //搜索
            search() {
                if (this.paramsSearch.selectValue) {
                    this.$emit('search',this.paramsSearch);
                }
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss" scope>
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";
    .group-data {
        .pager {
            padding: 0 24px;
        }
        .tab {
            width: 150px;
            line-height: 32px;
            border: 1px solid #cfd5df;
            display: flex;
            border-radius: 4px;
            margin-left: 24px;
            .tab-item {
                text-align: center;
                color: #595959;
                width: 50%;
                cursor: pointer;
                &:nth-child(1) {
                    border-right: 1px solid #cfd5df;
                }
                &.active {
                    background-color: #0cc2a9;
                    color:#fff;
                }
            }
        }
        .head-list {
            display: flex;
            justify-content: space-between;
            padding-right:100px;
            min-width:1000px;
            .tab {
                width: 250px;
                line-height: 32px;
                border: 1px solid #cfd5df;
                display: flex;
                border-radius: 4px;
                margin-left: 24px;
                .tab-item {
                    text-align: center;
                    color: #595959;
                    width: 50%;
                    cursor: pointer;
                    &:nth-child(1) {
                        border-right: 1px solid #cfd5df;
                    }
                    &.active {
                        background-color: #0cc2a9;
                        color:#fff;
                    }
                }
            }
        }
    }
</style>
