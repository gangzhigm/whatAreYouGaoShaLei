<template>
    <div class="msg-archiving-list">
        <!-- 过滤器组 -->
        <div class="filter-bar">
            <div class="button-group pull-left">
                <button class="btn btn-md btn-group pull-left" :class="{ 'btn-theme': !isGroup }"
                    @click="isGroup = false">
                    {{ 'msgArch.contact' | t }}
                </button>
                <button class="btn btn-md btn-group pull-left" :class="{ 'btn-theme': isGroup }"
                    @click="isGroup = true">
                    {{ 'msgArch.group' | t }}
                </button>
            </div>
            <div class="pull-right search-box md">
                <input type="text" :placeholder="isGroup ? $t('msgArch.searchGroup') : $t('msgArch.searchContact')"
                    v-model.trim="keywords" @keydown.enter="handleSearch" maxlength="100">
                <svg aria-hidden="true" @click="handleSearch">
                    <use xlink:href="#icon-search"></use>
                </svg>
            </div>
            <selector class="pull-right" :options="allStaffList" v-model="staffId" search
                @select="handleStaff($event)" />
        </div>
        <!-- 列表主体 -->
        <div class="simplify-table">
            <table>
                <thead>
                    <tr class="no-hover">
                        <td>{{ isGroup ? $t('msgArch.groupName') : $t('msgArch.contactName') }}</td>
                        <td>{{ isGroup ? $t('msgArch.groupOwner') : $t('msgArch.employee') }}</td>
                        <td width="200">{{ 'msgArch.lastSession' | t}}</td>
                        <td width="80">{{ 'msgArch.operations' | t}}</td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="fetching" class="no-hover">
                        <td colspan="4">
                            <inline-loading />
                        </td>
                    </tr>
                    <template v-else-if="resultList.length > 0">
                        <!-- eslint-disable-next-line -->
                        <tr class="no-hover" v-for="item in resultList">
                            <template v-if="isGroup">
                                <td>
                                    <div class="name-text">{{ item.roomName || $t('common.noData') }}</div>
                                </td>
                                <td>
                                    <div class="flex-name-box">
                                        <div v-if="item.roomOwnerAvatar" class="avatar-box image"
                                            :style="{ backgroundImage: `url(${item.roomOwnerAvatar})` }"></div>
                                        <div v-else class="icon icon-contacts-solid avatar-box alter"></div>
                                        <div class="name-box">
                                            <span class="name-text">
                                                {{ item.roomOwnerName || $t('common.noData') }}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                            </template>
                            <template v-else>
                                <td>
                                    <div class="flex-name-box">
                                        <div v-if="item.contactAvatar" class="avatar-box image"
                                            :style="{ backgroundImage: `url(${item.contactAvatar})` }"></div>
                                        <div v-else class="icon icon-contacts-solid avatar-box alter"></div>
                                        <div class="name-box">
                                            <span class="name-text">
                                                {{ item.contactName || $t('common.noData') }}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="flex-name-box">
                                        <div v-if="item.employeeAvatar" class="avatar-box image"
                                            :style="{ backgroundImage: `url(${item.employeeAvatar})` }">
                                        </div>
                                        <div v-else class="icon icon-contacts-solid avatar-box alter"></div>
                                        <div class="name-box">
                                            <span class="name-text">
                                                {{ item.employeeName || $t('common.noData') }}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                            </template>
                            <td width="200">{{ item.lastMsgTime }}</td>
                            <td width="80">
                                <button class="btn no-padding" :disabled="$has('wecom_msg_archiving_view')"
                                    @click="view(item)">
                                    <svg aria-hidden="true" class="action-icon icon-eye no-margin"
                                        :class="{'icon-disable':$has('wecom_msg_archiving_view')}"
                                        v-title:top="$t('form.view')">
                                        <use xlink:href="#icon-eye"></use>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    </template>
                    <tr v-else class="no-hover">
                        <td colspan="4">
                            <list-empty v-if="!keywords" />
                            <list-search-empty v-else />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <!-- 列表分页 -->
        <div class="pager-wrapper">
            <div class="total-row">{{'journey.totalCount' | t}}
                <span class="theme-text">{{ totalRow }}</span>
                {{'journey.totalUnit' | t}}
            </div>
            <pager :total="totalPage" :now="pageNumber" @page="handlePage($event)" />
        </div>
        <transition name="fade">
            <div v-if="drawerShow" class="drawer-mask"></div>
        </transition>
        <msg-chat-window v-model="curRecord" :show.sync="drawerShow" :isGroup="isGroup" />
    </div>
</template>

<script type="text/ecmascript-6">
import { WecomApiV1 } from '@/api';
import MsgChatWindow from './msg-chat-window.vue';

export default {
    name: 'MsgArchivingList',
    data () {
        const PAGE_SIZE = 25;
        return {
            pageSize: PAGE_SIZE,
            isGroup: false, // 当前会话分类是否为企业群
            staffList: [], // 员工列表
            staffId: 0, // 员工对象id
            employeeId: '', // 员工 staffId
            keywords: '', // 搜索关键字
            pageNumber: 1,
            totalRow: 0,
            totalPage: '',
            resultList: [],
            fetching: true,
            curRecord: null,
            drawerShow: false
        };
    },
    computed: {
        allStaffList () {
            return [{ id: 0, name: this.$t('msgArch.allStaff'), userId: '' }, ...this.staffList];
        }
    },
    watch: {
        isGroup () {
            this.employeeId = '';
            this.staffId = 0;
            this.keywords = '';
            this.pageNumber = 1;
            this.fetchList();
        },
        drawerShow (val) {
            if (!val) {
                this.curRecord = null;
            }
        }
    },
    mounted () {
        WecomApiV1
            .getAuthorityStaffListNoPage()
            .then(({ body: { data: { staffList } } }) => {
                this.staffList = staffList.map(({ id, userId, value }) => {
                    return {
                        id,
                        name: value,
                        userId
                    };
                });
                const { employeeUserid, contactName } = this.$route.query;
                if (employeeUserid && contactName) {
                    let res = this.staffList.find(e => e.userId === employeeUserid);
                    if (res) {
                        this.staffId = res.id;
                        this.keywords = contactName;
                        this.employeeId = employeeUserid;
                    }
                }
                this.fetchList();
            });
    },
    methods: {
        fetchList () {
            this.fetching = true;
            const func = this.isGroup ? 'getGroupPageList' : 'getContactPageList';
            const params = { pageNo: this.pageNumber, pageSize: this.pageSize };
            if (this.employeeId) {
                params.employeeId = this.employeeId;
            }
            if (this.keywords) {
                params.keywords = this.keywords;
            }
            WecomApiV1[func](params)
                .then(({ body: { data: { totalPage, totalRow, resultList } } }) => {
                    this.totalRow = totalRow;
                    this.totalPage = totalPage;
                    this.resultList = resultList;
                    this.fetching = false;
                })
                .catch(() => {
                    this.totalRow = 0;
                    this.totalPage = 0;
                    this.resultList = [];
                    this.fetching = false;
                });
        },
        handleSearch () {
            this.pageNumber = 1;
            this.fetchList();
        },
        view (item) {
            this.curRecord = item;
            this.drawerShow = true;
        },
        handlePage (val) {
            this.pageNumber = val;
            this.fetchList();
        },
        handleStaff (item) {
            this.employeeId = item.userId;
            this.pageNumber = 1;
            this.fetchList();
        }
    },
    components: { MsgChatWindow }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../../common/scss/base/variables';
@import '../../../../common/scss/base/mixin';

.msg-archiving-list {
    .filter-bar {
        margin-bottom: 16px;
        @include clearfix();

        .button-group {
            display: inline-block;
            overflow: hidden;
            border: 1px solid $form-border;
            border-radius: 4px;
            background-color: #fff;
        }
    }
    .btn.no-padding {
        padding-left: 0;
    }
    svg.no-margin {
        margin-left: 0;
    }
    .pager-wrapper {
        display: flex;
        justify-content: space-between;

        .total-row {
            line-height: 64px;
        }
    }
    .avatar-box {
        margin: 3px 0;
        display: inline-block;
        vertical-align: middle;
        height: 50px;
        width: 50px;
        &.image {
            border-radius: 50%;
            background-size: contain;
            background-repeat: no-repeat;
            border: 1px solid $border-color;
        }
        &.alter {
            line-height: 50px;
            font-size: 50px;
            color: $color-light-content;
        }
    }
    .drawer-mask {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: $index-popup - 1;
        background-color: rgba(0, 0, 0, 0.5);
    }
    .flex-name-box {
        display: flex;
        justify-content: flex-start;
        flex-wrap: nowrap;
    }
    .name-box {
        flex: 1;
        display: table;
    }
    .name-text {
        display: table-cell;
        padding: 5px;
        white-space: normal;
        vertical-align: middle;
    }
}
</style>