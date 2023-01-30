
<template>
    <div class="detail-statistics-container">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <!-- 头部标题及下载导出 -->
        <div class="page-head">
            <div class="content-view">
                <h1>{{'channelCode.statistics' | t}}</h1>
                <button class="download-export pull-right btn" :disabled="$has('wecom_channel_export')"
                        @click="exportData = true">
                    <svg aria-hidden="true" class="icon-download"
                            :class="{'icon-disable': $has('wecom_channel_export')}">
                        <use xlink:href="#icon-download"></use>
                    </svg>
                </button>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view white-bg padding margin form-container">
                <!-- 统计总数-卡片展示 -->
                <div class="statistics-card margin">
                    <div class="card" v-for="(item, index) in cards" :key="index">
                        <div class="user">
                             <svg aria-hidden="true" class="icon-user1">
                                <use xlink:href="#icon-user1"></use>
                            </svg>
                        </div>
                        <div class="info">
                            <h3>{{item.num !== null ? Number(item.num).toLocaleString() : '/' }}</h3>
                            <h5>{{item.text}}</h5>
                        </div>
                    </div>
                </div>
                <!-- 联系人统计列表 -->
                <div class="statistics-list">
                    <h3>{{'channelCode.customSta' | t}}</h3>
                    <div class='create-buttons'>
                        <button class='create-button single-create-button'
                            v-for="(item,index) in btns" :key="index" @click='switchBtn(index)'
                                :class='currentIndex === index ? "active":""'>
                            {{item}}
                        </button>
                    </div>
                    <div class="simplify-table">
                        <table v-if="currentIndex === 0">
                            <thead>
                                <tr>
                                    <th>{{'channelCode.date' | t}}</th>
                                    <th>{{'channelCode.addNum' | t}}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="listLoading" class="no-hover">
                                    <td colspan="2" class="slim-cell">
                                        <inline-loading />
                                    </td>
                                </tr>
                                <template v-else-if="statisticsList.length > 0">
                                    <tr v-for="(item, index) in statisticsList" :key="index">
                                        <td>{{item.date}}</td>
                                        <td>
                                            <button class="btn add-contact" @click="addClick(item.date, types = 'open')"
                                            :disabled="$has('wecom_channel_search_added_contacts')">
                                                {{item.contactCount === '0' ? 0 :(~~item.contactCount).toLocaleString()}}
                                            </button>
                                        </td>
                                    </tr>
                                </template>
                                <tr v-else class="no-hover">
                                    <td colspan="2">
                                        <list-search-empty/>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table v-if="currentIndex === 1">
                            <thead>
                                <tr>
                                    <th>{{'channelCode.staff' | t}}</th>
                                    <th>{{'channelCode.addTotal' | t}}</th>
                                </tr>
                            </thead>
                           <tbody>
                                <tr v-if="listLoading" class="no-hover">
                                    <td colspan="2" class="slim-cell">
                                        <inline-loading />
                                    </td>
                                </tr>
                                <template v-else-if="statisticsList.length > 0">
                                    <tr v-for="(item, index) in statisticsList" :key="index">
                                        <td>{{item.employeeName}}</td>
                                        <td>{{item.totalCounts === '0' ? 0 : (~~item.totalCounts).toLocaleString()}}</td>
                                    </tr>
                                </template>
                                <tr v-else class="no-hover">
                                    <td colspan="2">
                                        <list-search-empty/>
                                    </td>
                                </tr>
                           </tbody>
                        </table>
                    </div>
                    <pager :now="pageNow" :total="totalPage" @page="toPage"/>
                </div>
            </div>
        </div>
        <!-- 添加联系人弹窗 -->
        <modal size="sl" v-if="addPerson"
            @close="closeAdd"
            :title="$t('channelCode.addPerson')">
            <div class="additions-box">
                <div class="detail-btn">
                    <button class="btn btn-md btn-theme pull-right" @click="searchList">
                        {{'channelCode.searchBy' | t}}
                    </button>
                    <div class="pull-right search-box">
                        <input type="text" v-model.trim="keyWords"
                        :placeholder="$t('channelCode.searchByholder')" @keydown.enter="searchList">
                        <svg aria-hidden="true" @click="searchList">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                    <selector class="pull-right" unique-key="userid" v-model="userid" :options="staffList"
                          :search="staffList.length > 10" @input="handleClick"></selector>
                </div>
                <div class="simplify-table contact-list">
                    <table>
                        <thead>
                            <tr>
                                <th :title="$t('channelCode.contactName')">{{'channelCode.contactName' | t}}</th>
                                <th :title="$t('channelCode.contactUnionid')">{{'channelCode.contactUnionid' | t}}</th>
                                <th :title="$t('channelCode.staffName')">{{'channelCode.staffName' | t}}</th>
                                <th :title="$t('channelCode.oprea')">{{'channelCode.oprea' | t}}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="loading" class="no-hover">
                                <td colspan="4" class="slim-cell">
                                    <inline-loading />
                                </td>
                            </tr>
                            <template v-else-if="addContactList.length > 0">
                                <tr v-for="item in addContactList" :key="item.contactId">
                                    <td>{{item.contactName}}</td>
                                    <td>{{item.unionid}}</td>
                                    <td>{{item.employeeName}}</td>
                                    <td>
                                        <button class="btn tag-action-icon" v-title="$t('channelCode.detail')"
                                                :disabled="$has('wecom_channel_details')"
                                                @click.stop="detail(item)">
                                            <svg aria-hidden="true" class="icon-user"
                                                    :class="{'icon-disable': $has('wecom_channel_details')}">
                                                <use xlink:href="#icon-user1" :title="$t('channelCode.detail')"></use>
                                            </svg>
                                        </button>
                                        <button class="btn tag-action-icon" v-title="$t('channelCode.session')"
                                                :disabled="$has('wecom_channel_session_archive')"
                                                @click.stop="session(item)">
                                            <svg aria-hidden="true" class="icon-wecom"
                                                :class="{'icon-disable': $has('wecom_channel_session_archive')}">
                                                <use xlink:href="#icon-xingzhuang" :title="$t('channelCode.session')"></use>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            </template>
                            <tr v-else class="no-hover">
                                <td colspan="4">
                                    <list-empty v-if="keyWords === ''"/>
                                    <list-search-empty v-else/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <pager :now="pageNows" :total="totalPages" @page="toPages"/>
            </div>
        </modal>
        <!-- 导出数据 -->
        <download-detail-modal v-if="exportData" :theme-modules="exportName" :email-download="true" :channel-code="true"
                @cancel="exportData = false" @okDownload="download" :customize-modal-title="$t('channelCode.batchExport')"/>
    </div>
</template>
<script type="text/babel">
    import { WecomApiV1, ContactApiV1 } from '@/api';
    import {I18N_STORE_NAME} from '@/locales';
    export default {
        name: 'DetailStatistics',
        data() {
            return {
                listLoading: false, // 联系人统计列表读取loading
                loading: false, // 添加联系人数列表读取loading
                // 联系人卡片展示数组
                cards: [
                    {num: null, text: this.$t('channelCode.addUserNums')},
                    {num: null, text: this.$t('channelCode.addUsertotals')},
                ],
                btns: [this.$t('channelCode.timeSta'), this.$t('channelCode.personSta')],
                currentIndex: 0,
                addPerson: false, //添加联系人弹窗
                keyWords: '', // 添加联系人中搜索
                addContactList: [], // 添加联系人列表
                staffList: [], // 选择员工
                userid: '', // 选中的员工id，''为全部员工"
                statisticsList: [], // -联系人统计列表
                type: 1, // 联系人列表统计type
                // 页码
                pageNow: 1,
                totalPage: 1,
                totalRow: 0,
                // 联系人弹窗页码
                pageNows: 1,
                totalPages: 1,
                totalRows: 0,
                exportData: false, //导出数据
                exportName: '', // 导出数据邮件主题
                contactDate: '', // 联系人日期
            };
        },
        computed: {
            // 面包屑路由
            crumbs() {
                return [
                    {name: 'wecom', text: 'Dmartech'},
                    {name: 'channelCode', text: this.$t('home.channelCode')},
                    {name: 'channelCodeSummary', params: {id: this.$route.params.id}, text: this.$t('channelCode.statistics')}
                ];
            },
            // 系统当前语言
            language() {
                return this.$store.state[I18N_STORE_NAME].lang;
            },
        },
        mounted() {
            // 统计总数
            this.getTotalStatistics();
            // 联系人统计列表
            this.getContactList();
            // 导出数据邮件主题
            this.exportName = this.$route.query.name;
        },
        methods: {
            // 统计总数
            getTotalStatistics() {
                WecomApiV1
                    .totalStatistics({
                        id: this.$route.params.id
                    })
                    .then(({ body: { data }}) => {
                        this.cards[0].num = data.todayCount;
                        this.cards[1].num = data.totalCount;
                    });
            },
            // 联系人统计列表
            getContactList() {
                this.listLoading = true;
                WecomApiV1
                    .contactStatisticsList({
                        id: this.$route.params.id,
                        type: this.type,
                        pageNumber: this.pageNow,
                    })
                    .then(({ body: { data } }) => {
                        this.statisticsList = data.list;
                        this.totalPage = data.totalPage;
                        this.totalRow = data.totalRow;
                        this.listLoading = false;
                    });
            },
            // tab切换
            switchBtn(index) {
                this.currentIndex = index;
                if (index === 0) {
                    this.type = 1;
                    this.pageNow = 1;
                    this.getContactList();
                } else {
                    this.type = 2;
                    this.pageNow = 1;
                    this.getContactList();
                }
            },
            // 添加联系人数
            addClick(date, types) {
                this.contactDate = date;
                this.addPerson = true;
                this.loading = true;
                this.employeeListByDate(types);
                WecomApiV1
                    .contactListByDate({
                        date: this.contactDate,
                        channelCodeId: ~~this.$route.params.id,
                        userid: this.userid,
                        searchName: this.keyWords,
                        pageNumber: this.pageNows
                    })
                    .then(({ body: {data}}) => {
                        this.addContactList = data.list;
                        this.totalPages = data.totalPage;
                        this.totalRows = data.totalRow;
                        this.loading = false;
                    });
            },
            // 关闭添加联系人弹窗
            closeAdd() {
                this.addPerson = false;
                this.keyWords = '';
                this.userid = '';
                this.pageNows = 1;
            },
            // 该日期扫码记录中，扫码匹配过的员工的列表
            employeeListByDate(types) {
                WecomApiV1
                    .employeeListByDate({
                        date: this.contactDate,
                        channelCodeId: ~~this.$route.params.id,
                    })
                    .then(({ body: {data}}) => {
                        this.staffList = [
                            {name: this.$t('channelCode.allStaff'), userid: ''},
                            ...data.employeeList
                        ];
                        if (types === 'open') {
                            this.userid = this.staffList[0].userid;
                        }
                    });
            },
            // 选择员工
            handleClick() {
                this.pageNows = 1;
                this.addClick(this.contactDate);
            },
            // search
            searchList() {
                this.pageNows = 1;
                this.addClick(this.contactDate);
            },
            // 页码
            toPage(e) {
                this.pageNow = e;
                this.getContactList();
            },
            // 添加联系人页码
            toPages(e) {
                this.pageNows = e;
                this.addClick(this.contactDate);
            },
            // 联系人详情
            detail(info) {
                ContactApiV1
                    .getCustomerIdByUserid({
                        userid: info.contactUserid,
                    })
                    .then(({ body : { data }}) => {
                        if (data.customerId) {
                            const custom = this.$router.resolve({
                                name: 'customerDetail',
                                query: {id: data.customerId}
                            });
                            window.open(custom.href, '_blank');
                        }
                    });
            },
            // 跳转会话存档
            session(item) {
                const msg = this.$router.resolve({
                    name: 'msgArchiving',
                    query: {
                        employeeUserid: item.employeeUserid,
                        contactName: item.contactName
                    }
                });
                window.open(msg.href, '_blank');
            },
            // 导出数据
            download(info) {
                WecomApiV1
                    .downloadCsv({
                        ids: [~~this.$route.params.id],
                        emailAddress: info.emailAddress,
                        emailSubject: info.emailSubject,
                        dataFormat: info.dataFormat,
                        formatType: info.formatType,
                        language: this.language === 'zh-CN' ? 'zh' : 'en',
                        sendType: 1, // 发送方式（1.单个文件下载 2.批量文件下载）
                    })
                    .then((res) => {
                        this.$toast(this.$t('swarm.checkoutEmail'), 'success');
                        this.exportData = false;
                    })
                    .catch(() => {
                        this.exportData = false;
                    });

            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';
.detail-statistics-container{
    .form-container {
        min-width: 1350px;
        .statistics-card {
            width: 100%;
            height: 150px;
            display: flex;
            justify-content: space-around;
            align-items: center;
            .card {
                width: 350px;
                height: 120px;
                box-shadow: $form-border 0px 0px 10px 1px;
                display: flex;
                .user {
                    width: 120px;
                    height: 120px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    svg {
                        width: 60px;
                        height: 60px;
                        fill: $green;
                    }
                }
                .info {
                    width: 230px;
                    height: 120px;
                    h3 {
                        margin-top: 30px
                    }
                    h5 {
                         margin-top: 20px
                    }
                }
            }
        }
        .statistics-list {
            h3 {
                font-weight: normal;
                margin: 15px 0;
            }
            .create-buttons {
                 margin: 15px 0;
                .create-button {
                    cursor: pointer;
                    display: inline-block;
                    width: 90px;
                    height: 32px;
                    line-height: 30px;
                    text-align: center;
                    border: 1px solid $form-border;
                    background-color: white;
                }

                .single-create-button {
                    border-radius: 0 4px 4px 0;
                    margin-left: -4px;
                }

                .bulk-create-button {
                    border-radius: 4px 0 0 4px;
                    border-right: none;
                }
                .active {
                    background-color: $theme;
                    border-color: $theme;
                    color: white;
                }
            }
            .add-contact {
                &:not([disabled]) {
                    color: $green;
                }
            }
        }
    }
    .download-export {
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: none;
        background-color: $disabled;
        &:not([disabled]) {
            cursor: pointer;
            background-color: $green;
        }
        svg {
            width: 20px;
            height: 20px;
            fill: white;
        }
    }
    .additions-box {
        height: 500px;
        .detail-btn {
            height: 50px;
        }
        .search-box {
            margin-right: 16px;
        }
        .contact-list {
            height: 400px;
            overflow-y: auto;
        }
        .tag-action-icon {
            position: relative;
            display: inline-block;
            width: 16px;
            height: 16px;
            margin-top: 1px;

            + .tag-action-icon {
                margin: 0 0 0 8px;
            }

            svg {
                display: block;
                width: 16px;
                height: 16px;
                @include transition();

            }
            &:not([disabled]) {
                cursor: pointer;
                .icon-user {
                    fill: $theme;
                    &:hover {
                        fill: $light-theme;
                    }
                }
                .icon-wecom {
                    fill:$dark-blue;
                }
            }
        }
        .btn {
            padding: 0;
        }
    }
}
</style>
