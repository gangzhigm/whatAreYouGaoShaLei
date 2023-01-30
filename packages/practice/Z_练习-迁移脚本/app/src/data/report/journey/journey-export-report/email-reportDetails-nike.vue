<template>
    <div class="email-reportDeatils-nike">
        <div class="page-head">
            <div class="content-view">
                <h1>{{'report.labelDetails' | t}}</h1>
            </div>
        </div>
        <div class="page-content">
            <div class="back-button" @click="goBack">
                <span class="btn btn-md btn-theme">{{'report.back' | t}}</span>
            </div>
            <div class="report-content content-view">
                <div class="data-details">
                    <group-data
                        :totalSkips="totalSkips"
                        :totalPage="totalPages"
                        :tableType="tableType"
                        :tableDataList="tableDataList"
                        :pageNumber="pageNumber"
                        @getTableData="tabelChange"
                        @pageTurning="pageTurning"
                        @getPagingList="getPagingList"
                        @search="searchList"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { JourneyApiV2 } from '@/api';
import groupData from '../components/group-data-nike.vue';

export default {
    data() {
        return {
            tableType: false, //表格类型默认保持不动
            tableDataList: [], //表格数据
            pageNumber: 1, //页码
            pageSize: 10, //分页数量
            seachKey: '', //搜索关键字
            seachType: '', //搜索类型
            type: 1, //查询类型
            totalPages: 0, //总页数
            totalSkips:0,  //总条数
        };
    },
    mounted() {
        this.getTableDataList(); //获取表格数据
    },
    methods: {
        //返回
        goBack() {
            this.$router.go(-1);
        },
        //获取表格数据
        getTableDataList() {
            this.tableDataList = [];
            this.$loading();
            JourneyApiV2
                .getTableDetailsList(
                    this.pageNumber,
                    this.pageSize,
                    this.seachKey,
                    this.seachType,
                    this.type
                )
                .then(res => {
                    this.tableDataList = res.body.data.labelList;
                    this.totalPages = res.body.data.pageCont;
                    this.totalSkips = res.body.data.resultCount;
                    this.$loaded();
                });
        },
        //点击tab切换
        tabelChange(val) {
            this.type = val;
            this.seachKey = '';
            this.seachType = '';
            this.pageNumber = 1;
            this.getTableDataList();
        },
        //下拉框选择展示数据的不同页数
        getPagingList(pagesSize) {
            this.pageSize = pagesSize;
            this.getTableDataList();
        },
        //搜索
        searchList(search) {
            this.seachKey = search.searchName;
            this.seachType = search.selectValue;
            this.pageNumber = 1;
            this.getTableDataList();
        },
        //翻页
        pageTurning(page) {
            this.pageNumber = page;
            this.getTableDataList();
        }
    },
    destroyed() {
        this.tableDataList = [];
        this.pageNumber = 1;
        this.pageSize = 10;
        this.seachKey = '';
        this.seachType = '';
        this.type = 1;
        this.totalPages = 0;
    },
    components: {
        groupData
    }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss" scope>
@import "../../../../common/scss/base/variables";
@import "../../../../common/scss/base/mixin";
.email-reportDeatils-nike {
    .back-button {
        margin: 20px 3%;
    }
    .report-content {
        display: flex;
        padding-top: 24px;
        padding-bottom: 43px;
        background-color: white;
        .data-details {
            padding: 32px 0;
            width: 100%;
            min-width: 1000px;
        }
    }
}
</style>
