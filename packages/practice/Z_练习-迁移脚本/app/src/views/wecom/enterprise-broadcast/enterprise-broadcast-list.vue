 <template>
    <div class="enterprise-broadcast-list">
        <!-- 面包屑 -->
        <div class="content-view">
            <crumbs :crumbs="crumbs" />
        </div>
        <!-- 面包屑end -->
        <!-- 标题 -->
        <div class="page-head">
            <div class="content-view">
                <h1>{{'home.entBroadcast' | t}}</h1>
                <button type="button" class="pull-right btn btn-theme btn-md new-message"
                    :disabled="$has('wecom_ent_broadcast_add')" @click="add">
                    {{'enterpriseBroadcast.newMessage' | t}}
                </button>
                <div class="pull-right search-box">
                    <input type="text" v-model.trim="keyword" :placeholder="$t('enterpriseBroadcast.searchByName')"
                        @keydown.enter="search">
                    <svg aria-hidden="true" @click="search">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </div>
            </div>
        </div>
        <!-- 标题end -->
        <!-- 数据列表 -->
        <div class="page-content">
            <div class="content-view padding margin white-bg en-padding en-list-content-view">
                <div class="table">
                    <table class="broadcast-table">
                        <thead>
                            <tr>
                                <th width=150>{{'enterpriseBroadcast.groupName' | t}}</th>
                                <th width=180>{{'enterpriseBroadcast.groupContent' | t}}</th>
                                <th>{{'enterpriseBroadcast.sendMode' | t}}
                                    <FilterDrop :value="sendMode" :list="methodList" @valueChange="modeChange">
                                    </FilterDrop>
                                </th>
                                <th>{{'enterpriseBroadcast.sendType' | t}}
                                    <FilterDrop :value="sendType" :list="typeList" @valueChange="sendTypeChange">
                                    </FilterDrop>
                                </th>
                                <th>{{'enterpriseBroadcast.messageType' | t}}
                                    <FilterDrop :value="messageType" :list="sendTypeList"
                                        @valueChange="messageTypeChange">
                                    </FilterDrop>
                                </th>
                                <th>{{'enterpriseBroadcast.sendTime' | t}}</th>
                                <th>{{'enterpriseBroadcast.sendStatus' | t}}
                                    <FilterDrop :value="sendStatus" :list="statusList" @valueChange="sendStatusChange">
                                    </FilterDrop>
                                </th>
                                <th>{{'enterpriseBroadcast.createdBy' | t}}</th>
                                <th>{{'enterpriseBroadcast.createdOn' | t}}</th>
                                <th>{{'enterpriseBroadcast.updatedBy' | t}}</th>
                                <th>{{'enterpriseBroadcast.updatedAt' | t}}</th>
                                <th>{{'enterpriseBroadcast.operation' | t}}</th>
                            </tr>
                        </thead>
                        <tbody class="table-word-break">
                            <tr v-if="loading" class="no-hover">
                                <td colspan="24" class="slim-cell">
                                    <inline-loading />
                                </td>
                            </tr>
                            <tr v-for="(l,i) in list" :key="i" v-else>
                                <td width=150>
                                    <p>{{l.sendName}}</p>
                                </td>
                                <td width=180>
                                    <p class="content" v-if="l.sendContent" :title="l.sendContent">{{l.sendContent}}</p>
                                    <p class="content" v-else-if="msgtypeJudge(l,'text')"
                                        :title="l.attachments[0].text.content">
                                        {{l.attachments[0].text.content}}</p>
                                    <div class="image" v-else-if="msgtypeJudge(l,'image')">
                                        <img :src="l.attachments[0].image.media_id">
                                    </div>
                                    <p class="content" v-else-if="msgtypeJudge(l,'link')"
                                        :title="l.attachments[0].link.title">
                                        {{'enterpriseBroadcast.link' | t}}{{l.attachments[0].link.title}}</p>
                                    <p class="content" v-else-if="msgtypeJudge(l,'miniprogram')"
                                        :title="l.attachments[0].miniprogram.title">
                                        {{'enterpriseBroadcast.miniprogram' | t}}{{l.attachments[0].miniprogram.title}}
                                    </p>
                                    <p class="num" v-if="contentNum(l)>1">
                                        {{'enterpriseBroadcast.aTotalOfBefore' | t}}{{contentNum(l)}}
                                        {{'enterpriseBroadcast.aTotalOfAfter' | t}}</p>
                                </td>
                                <td v-for="(v,n) in l" :key="n" v-if="filedsShow(n)">
                                    <p v-if="n==='sendMode'">{{getOptionsName('sendMode',v)}}</p>
                                    <p v-else-if="n==='messageType'">{{getOptionsName('messageType',v)}}</p>
                                    <p v-else-if="n==='sendType'">{{getOptionsName('sendType',v) }}</p>
                                    <p v-else-if="n==='sendStatus'">{{getOptionsName('sendStatus',v) }}</p>
                                    <p v-else>{{v}}</p>
                                </td>
                                <td :width="120">
                                    <button class="btn" :disabled="$has('wecom_ent_broadcast_edit')" @click="edit(l)"
                                        v-if="l.sendStatus===statusList[1].source&&sendTimeCompareNow(l.sendTime)">
                                        <svg aria-hidden="true" class="action-icon icon-round-pencil"
                                            v-title:top="$t('enterpriseBroadcast.edit')">
                                            <use xlink:href="#icon-round-pencil"></use>
                                        </svg>
                                    </button>
                                    <button class="btn" :disabled="$has('wecom_ent_broadcast_detail')"
                                        @click="detail(l.id)">
                                        <svg aria-hidden="true" class="action-icon icon-pie"
                                            v-title:top="$t('enterpriseBroadcast.detail')">
                                            <use xlink:href="#icon-pie"></use>
                                        </svg>
                                    </button>
                                    <button class="btn" :disabled="$has('wecom_ent_broadcast_cancel')"
                                        @click="cancel(l)" v-if="cancelIsShow(l)">
                                        <svg aria-hidden="true" class="action-icon icon-delete"
                                            v-title:top="$t('enterpriseBroadcast.cancelSending')">
                                            <use xlink:href="#icon-round-close"></use>
                                        </svg>
                                    </button>
                                    <button class="btn" :disabled="$has('wecom_ent_broadcast_delete')"
                                        @click="del(l.id)" v-if="l.sendStatus===statusList[4].source">
                                        <svg aria-hidden="true" class="action-icon icon-delete"
                                            v-title:top="$t('enterpriseBroadcast.deleted')">
                                            <use xlink:href="#icon-delete"></use>
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <list-empty v-if="list.length === 0&&!loading" />
                </div>
                <div class="pager-wrapper page-com">
                    <div class="amount">{{'pagination.totalCount' | t}} <span class="theme-text">{{totalRow}}</span>
                        {{'pagination.totalUnit' | t}}
                    </div>
                    <pager :total="totalPage" :now="pageNumber" @page="handlePage"></pager>
                </div>
            </div>
            <back-top ref="topper" />
        </div>
        <!-- 数据列表end -->
    </div>
</template>
<script>
import { WecomApiV1 } from '@/api';
import { optionsRender, methodList, typeList, sendTypeList, statusList, filedsSort } from './common';

export default {
    name: 'EnterpriseBroadcastList',
    computed: {
        // 导航
        crumbs () {
            return [
                { name: 'wecom', text: 'Dmartech' },
                { name: 'entBroadcast', text: this.$t('home.entBroadcast') }
            ];
        },
    },
    data () {
        return {
            methodList,
            typeList,
            sendTypeList,
            statusList,
            fileds: [
                'sendName',
                'sendContent',
                'sendMode',
                'sendType',
                'messageType',
                'sendTime',
                'sendStatus',
                'createName',
                'createDate',
                'updateName',
                'updateDate',
                'id',
                'attachments'
            ],
            list: [],
            totalRow: 0,//总数
            totalPage: 1,// 分页数
            size: 10,//每页展示数量
            pageNumber: 1,//当前页数
            keyword: '',//关键字模糊匹配群发名称，筛选群发内容
            sendMode: '', //群发方式 1 企业群发 2 应用消息
            sendType: '',//群发类型  1 客户  2 客户群
            sendStatus: '',//群发状态 0 待发送 1 发送中 2 已完成 3 已取消
            messageType: '', //消息类型  1 立即发送  2 定时发送
            loading: true
        };
    },
    mounted () {
        this.getTable();
    },
    watch: {
        sendMode () {
            this.search();
        },
        sendType () {
            this.search();
        },
        messageType () {
            this.search();
        },
        sendStatus () {
            this.search();
        }
    },
    methods: {
        search () {
            this.pageNumber = 1;
            this.getTable();
        },
        modeChange (e) {
            this.sendMode = e;
        },
        sendTypeChange (e) {
            this.sendType = e;
        },
        messageTypeChange (e) {
            this.messageType = e;
        },
        sendStatusChange (e) {
            this.sendStatus = e;
        },
        /**
         * 内容判断
         * l 信息
         * type //image 图片 link  链接 miniprogram：小程序
         */
        msgtypeJudge (l, type) {
            return l.attachments[0] && l.attachments[0].msgtype === type;
        },
        //内容数量
        contentNum (e) {
            let num = 0;
            if (e.sendContent) num++;
            num += e.attachments.length;
            return num;
        },
        //根据key获取选项的名称
        getOptionsName (type, value) {
            return optionsRender(type, value);
        },
        //新建群发
        add () {
            this.$router.push({ name: 'entBroadcastAdd', params: { id: 0 } });
        },
        //群发详情
        detail (id) {
            this.$router.push({ name: 'entBroadcastDetail', params: { id: id } });
        },
        //编辑群发
        edit (e) {
            if (!this.sendTimeCompareNow(e.sendTime)) {
                return this.$toast(this.$t('enterpriseBroadcast.sentMessageCannotBeEdited'), 'warn');
            }
            this.$router.push({ name: 'entBroadcastEdit', params: { id: e.id } });
        },
        //取消发送
        cancel (e) {
            if (!this.sendTimeCompareNow(e.sendTime)) {
                return this.$toast(this.$t('enterpriseBroadcast.sentMessageCannotBeCancelled'), 'warn');
            }
            this.$confirm(this.$t('enterpriseBroadcast.cancel'), this.$t('enterpriseBroadcast.sureToCancel'))
                .then(sure => {
                    if (sure) {
                        WecomApiV1.cancelSend(e.id).then(() => {
                            this.$toast(this.$t('enterpriseBroadcast.cancelSendSuccess'), 'success');
                            this.search();
                        });
                    }
                });
        },
        //删除
        del (id) {
            this.$confirm(this.$t('enterpriseBroadcast.deleted'), this.$t('enterpriseBroadcast.sureToDelete'))
                .then(sure => {
                    if (sure) {
                        WecomApiV1.delBroadcastInfo(id).then(() => {
                            this.$toast(this.$t('enterpriseBroadcast.deleteSuccess'), 'success');
                            this.search();
                        });
                    }
                });
        },
        //隐藏某些不不需要展示的字段
        filedsShow (n) {
            const exist = this.fileds.filter(e => { return e === n }).length === 1;
            let filedsShow = n !== 'sendName' && n !== 'sendContent' && n !== 'id' && n !== 'attachments' && exist;
            return filedsShow;
        },
        //查询表格信息
        getTable () {
            this.loading = true;
            const params = {
                pageNumber: this.pageNumber,
                keyword: this.keyword,
                sendMode: this.sendMode,
                messageType: this.messageType,
                sendType: this.sendType,
                sendStatus: this.sendStatus
            };
            WecomApiV1.getBroadcastInfo(params).then(({ body }) => {
                this.loading = false;
                let list = body.data.messageList || [];
                this.list = filedsSort(list, this.fileds);
                this.totalPage = body.data.totalPage || 0;
                this.totalRow = body.data.totalRow || 0;
            })
                .catch(() => {
                    this.loading = false;
                });
        },
        /**
         * 判断当前时间是否大于发送时间，大于则返回false,小于则返回true
         */
        sendTimeCompareNow (sendTime) {
            const time = new Date(sendTime).getTime();
            const nowTime = new Date().getTime();
            const showEdit = nowTime < time;
            return showEdit;
        },
        /**
         * 类型是定时发送，且发送时间 在 当前时间 之后才显示
         */
        cancelIsShow (e) {
            const cancelShow = e.messageType === this.sendTypeList[2].source
                && e.sendStatus !== this.statusList[4].source
                && this.sendTimeCompareNow(e.sendTime);
            return cancelShow;
        },
        //页码变动
        handlePage (e) {
            this.pageNumber = e;
            this.getTable();
        }
    }
};
</script>
<style lang="scss">
@import '../../../common/scss/base/variables';
@import '../../../common/scss/base/mixin';

.enterprise-broadcast-list {
    .page-head {
        .content-view {
            .new-message {
                text-transform: unset;
            }
        }
    }
    .en-list-content-view {
        min-width: 1805px;
        .broadcast-table {
            background-color: #fff;
            border-collapse: collapse;
            border-left: 1px solid #e0e5ea;
            border-right: 1px solid #e0e5ea;
            border-spacing: 0;
            border-top: 1px solid #e0e5ea;
            width: 100%;
        }
    }
    .new-message {
        text-transform: unset;
    }
    .search-box {
        margin: 0 10px 0 0;
    }
    .filter-box {
        display: inline-block;
        position: relative;

        svg {
            fill: currentColor;
            width: 14px;
            height: 14px;
            vertical-align: middle;
            margin-left: 1px;
        }

        .radio {
            padding: 0 10px;
            display: block;
            margin: 0;
        }

        .drop-list {
            position: absolute;
            z-index: 1;
            left: 0;
            top: 100%;
            border-radius: 4px;
            border: 1px solid $border-color;
            background-color: $content-bg;
            line-height: $input-field-height;
            white-space: nowrap;
        }
    }

    .table {
        table-layout: fixed;
        width: 100%;
        margin-top: 16px;
        text-align: left;
        border-collapse: collapse;
        border-spacing: 0;

        th:not([width]) {
            width: 100%;
        }

        td {
            .content {
                line-height: 12px;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
            .num {
                margin-top: 36px;
                line-height: 12px;
                color: #3bc2a9;
            }
            .image {
                width: 60px;
                height: 60px;
                overflow: hidden;
                img {
                    width: 100%;
                }
            }
            button {
                padding: 0;
                margin: 0;
                .action-icon {
                    width: 16px;
                    height: 16px;
                    margin: 6px 0;
                }
            }

            .action-icon:first-child {
                margin-left: 0;
            }
        }

        tr {
            height: 40px;
            border-bottom: 1px solid $border-color;
        }
    }
    .page-com {
        @include pagerWrapper();
    }
}
</style>