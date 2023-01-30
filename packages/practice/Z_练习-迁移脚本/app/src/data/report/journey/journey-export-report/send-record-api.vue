<template>
    <div class="api">
        <div class="form-field">
            <label class="label title">导出至CSV文件</label>
        </div>
        <div class="form-field flex">
            <label class="label">时间范围</label>
            <date-range :start="startDate" :end="endDate" :partCuts="['LAST_WEEK','LAST_30_DAYS']"></date-range>
            <ul class="date-area">
                <li v-for="date in dateAreaList" :key="date"
                    :class="{active: currentItems === date}"
                    @click="chooseDate(date)" class="date-item">
                    {{date}}<span class="cut-line" v-if="date !== '30天'">|</span>
                </li>
            </ul>
        </div>
        <div class="form-field">
            <label class="label">活动选择</label>
            <selector :options="activeTypeList" v-model="activeType" @input="getActiveItemsList"></selector>
            <selector :options="activeItemsList" v-model="activeItems"></selector>
        </div>
        <div class="form-field">
            <label class="label">手机号</label>
            <input type="text" class="input" v-model.trim="phone" maxlength="11">
        </div>
        <div class="form-field">
            <label class="label">显示无效推送</label>
            <checkbox v-model="show"></checkbox>
        </div>
        <div class="form-field">
            <label class="label">显示报告</label>
            <checkbox v-model="showReport"></checkbox>
        </div>
        <div class="form-field">
            <label class="label"></label>
            <button class="btn btn-theme btn-md" @click="search">查询</button>
        </div>
        <div v-show="getSearchResult" class="search-result">
            <div class="form-field">
                <label class="label title">查询结果</label>
            </div>
            <div class="form-field">
                <label class="label">文件格式</label>
                <radio :source="0" v-model="exportDocumentType">UTF-8</radio>
                <radio :source="1" v-model="exportDocumentType">GB2312</radio>
            </div>
            <div class="form-field">
                <label class="label">收件邮箱</label>
                <input type="text" class="input" :placeholder="'请填写导出文件收件邮箱地址'" maxlength="50" v-model.trim="exportEmail">
                <button class="btn btn-theme btn-md btn-export" @click="exportReport">导出</button>
            </div>
            <div class="api-area">
                <div class="simplify-table table-view">
                    <table>
                        <thead>
                            <tr>
                                <th>活动</th>
                                <th>发送内容</th>
                                <th>发送号码</th>
                                <th>次数</th>
                                <th>发送时间</th>
                                <th v-if="showReport && searchDone">到达时间</th>
                                <th v-if="showReport && searchDone">记录时间</th>
                                <th>code码</th>
                                <th>code信息</th>
                                <th v-if="showReport && searchDone">状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="loading">
                                <td :colspan="showReport && searchDone ? 10 : 7">
                                    <inline-loading></inline-loading>
                                </td>
                            </tr>
                            <template v-else-if="sendApiList.length">
                                <tr v-for="api in sendApiList" :key="api.id">
                                    <td :title="api.sendoutName">{{api.sendoutName}}</td>
                                    <td :title="api.content">{{api.content}}</td>
                                    <td :title="api.mobile">{{api.mobile}}</td>
                                    <td>{{api.count}}</td>
                                    <td :title="api.sendDate">{{api.sendDate}}</td>
                                    <td v-if="showReport && searchDone" :title="api.deliveredDate">{{api.deliveredDate}}</td>
                                    <td v-if="showReport && searchDone" :title="api.recordDate">{{api.recordDate}}</td>
                                    <td>{{api.errorCode}}</td>
                                    <td>{{api.errorMessage}}</td>
                                    <td v-if="showReport && searchDone">{{api.status === 0 ? '失败' : '送到'}}</td>
                                </tr>
                            </template>
                            <tr v-else>
                                <td :colspan="showReport && searchDone ? 10 : 7" class="empty">
                                    <list-empty/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <pager :total="totalPage" :now="pageNo" @page="page"></pager>
            </div>
            <div class="cold-api-area">
                <div class="simplify-table table-view">
                    <table>
                        <thead>
                            <tr>
                                <th>活动</th>
                                <th>发送内容</th>
                                <th>发送号码</th>
                                <th>次数</th>
                                <th>发送时间</th>
                                <th v-if="showReport && searchDone">到达时间</th>
                                <th v-if="showReport && searchDone">记录时间</th>
                                <th>code码</th>
                                <th>code信息</th>
                                <th v-if="showReport && searchDone">状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="loading">
                                <td :colspan="showReport && searchDone ? 10 : 7">
                                    <inline-loading></inline-loading>
                                </td>
                            </tr>
                            <template v-else-if="coldApiList.length">
                                <tr v-for="cold in coldApiList" :key="cold.id">
                                    <td :title="cold.sendoutName">{{cold.sendoutName}}</td>
                                    <td :title="cold.content">{{cold.content}}</td>
                                    <td :title="cold.mobile">{{cold.mobile}}</td>
                                    <td>{{cold.count}}</td>
                                    <td :title="cold.sendDate">{{cold.sendDate}}</td>
                                    <td v-if="showReport && searchDone" :title="cold.deliveredDate">{{cold.deliveredDate}}</td>
                                    <td v-if="showReport && searchDone" :title="cold.recordDate">{{cold.recordDate}}</td>
                                    <td>{{cold.errorCode}}</td>
                                    <td>{{cold.errorMessage}}</td>
                                    <td v-if="showReport && searchDone">{{cold.status === 0 ? '失败' : '送到'}}</td>
                                </tr>
                            </template>
                            <tr v-else>
                                <td :colspan="showReport && searchDone ? 10 : 7" class="empty">
                                    <list-empty/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <pager :total="coldTotalPage" :now="coldPageNo" @page="coldPage"></pager>
            </div>
        </div>
    </div>
</template>

<script>
    import { OriginSmsExportApiV1, SmsServiceApiV1, SmsApi } from '@/api';
    import {format,subDays} from 'date-fns';
    import {EMAIL_ADDRESS_REGEXP} from '../../../../common/utils/regs';
    export default {
        data() {
            return {
                loading: false,
                startDate: '',
                endDate: '',
                dateAreaList: ['7天','14天','30天'],
                currentItems: '',
                activeTypeList: [
                    {id: 1,name: '短信活动'},
                    {id: 2,name: '彩信活动'}
                ],
                activeType: 1,
                activeItemsList: [],
                activeItems: '',
                phone: '',
                show: false,
                showReport: false,
                exportDocumentType: 0,
                exportEmail: '',
                getSearchResult: false,
                sendApiList: [],
                totalPage: 0,
                pageNo: 1,
                // 冷数据
                coldApiList: [],
                coldTotalPage: 0,
                coldPageNo: 1,
            };
        },
        mounted() {
            this.getActiveItemsList(1);
        },
        computed: {
            // 点击搜索后才可显示报告
            searchDone() {
                return this.sendApiList[0].deliveredDate && this.sendApiList[0].deliveredDate !== '';
            }
        },
        methods: {
            chooseDate(date) {
                this.currentItems = date;
                this.endDate = format(new Date(),'YYYY-MM-DD');
                switch (date) {
                    case '7天': this.startDate = format(subDays(this.endDate,6),'YYYY-MM-DD');
                        break;
                    case '14天': this.startDate = format(subDays(this.endDate,13),'YYYY-MM-DD');
                        break;
                    case '30天': this.startDate = format(subDays(this.endDate,29),'YYYY-MM-DD');
                }
            },
            exportReport() {
                if (!EMAIL_ADDRESS_REGEXP.test(this.exportEmail)) {
                    return this.$toast('请输入正确的邮箱','warn');
                }
                let postData = {
                    createId: this.$store.state.user.id,
                    email: this.exportEmail,
                    overTime: this.endDate,
                    invalidPush: this.show ? 1 : 0,
                    mobile: this.phone,
                    sendoutId: this.activeItems,
                    showReport: this.showReport,
                    startTime: this.startDate,
                    uniCode: this.exportDocumentType
                };
                OriginSmsExportApiV1
                    .getExportAPIPushFaild(postData)
                    .then(() =>{
                        this.$toast(this.$t('frequency.acceptEmail'),'success');
                        this.clear();
                    });
            },
            search() {
                if (!this.startDate || !this.endDate || !this.activeItems) {
                    return this.$toast(this.$t('data.refineData'),'warn');
                }
                const checkPhone = /1[3|4|5|7|8][0-9]{9}/;
                if (this.phone && !checkPhone.test(this.phone)) {
                    return this.$toast('请输入正确的手机号','warn');
                }
                this.getSearchResult = true;
                this.loading = true;
                let postData = {
                    coldPageNo: this.coldPageNo,
                    createId: this.$store.state.user.id,
                    endDate: this.endDate,
                    invalidPush: this.show ? 1 : 0,
                    mobileNumber: this.phone,
                    pageNo: this.pageNo,
                    sendoutId: this.activeItems,
                    showReport: this.showReport ? 1 : 0,
                    startDate: this.startDate
                };
                SmsApi
                    .apiSendRecord(postData)
                    .then(res =>{
                        let result = res.body.data;
                        this.sendApiList = result.recordList;
                        this.totalPage = Math.ceil(result.totalNO / result.totalRow);
                        // 冷数据
                        this.coldApiList = result.coldRecordList;
                        this.coldTotalPage = Math.ceil(result.coldTotalNo / result.coldTotalRow);
                        this.loading = false;
                    })
                    .catch(() =>{
                        this.loading = false;
                    });
            },
            page(page) {
                this.pageNo = page;
                this.search();
            },
            coldPage(page) {
                this.coldPageNo = page;
                this.search();
            },
            // 获取活动列表
            getActiveItemsList(id) {
                if (id) {
                    SmsServiceApiV1
                        .getAllSendOutList()
                        .then(res =>{
                            if (id === 1) {
                                this.activeItemsList = res.body.data.sendouts.filter(elm => elm.type !== 1)
                                    .map(send => {return {name: send.sendoutName,id: send.sendoutId}});
                            } else {
                                this.activeItemsList = res.body.data.sendouts.filter(elm => elm.type === 1)
                                    .map(send => {return {name: send.sendoutName,id: send.sendoutId}});
                            }
                        });
                }
            },
            clear() {
                this.activeType = 1;
                this.activeItemsList = [];
                this.activeItems = '';
                this.phone = '';
                this.show = false;
                this.showReport = false;
                this.exportDocumentType = 0;
                this.exportEmail = '';
                this.getSearchResult = false;
                this.sendApiList = [];
                this.totalPage = 0;
                this.pageNo = 1;
                // 冷数据
                this.coldPageNo = 1;
                this.coldTotalPage = 0;
                this.coldApiList = [];
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .api {
        margin-top: 15px;
        width: calc(100% - 120px);
        .date-area {
            cursor: pointer;
            display: flex;
            li {
                padding: 0 10px;
            }
            .cut-line {
                margin-left: 5px;
            }
        }
        .active {
            color: $green;
        }
        .search-result {
            .table-view {
                max-width: 1000px;
                margin: 25px 0;
                .empty {
                    padding: 0;
                }
            }
            .btn-export {
                margin-left: 15px;
            }
        }
    }
</style>
