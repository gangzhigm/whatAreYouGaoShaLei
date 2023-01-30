<template>
    <slide-drawer class="msg-chat-window" :value="show" @input="$emit('update:show', false)" ref="drawer">
        <!-- header slot -->
        <template v-slot:header>
            <div class="msg-chat-header">
                <span class="msg-chat-title" :title="title">
                    {{ title }}
                </span>
                <div class="msg-chat-filter">
                    <transition name="fade">
                        <div class="search-box md content-search" v-if="msgtype !== 'all'">
                            <input type="text" :placeholder="$t('menu.searchContent')" v-model.trim="keywords"
                                @keydown.enter="handleSearch" maxlength="100">
                            <svg aria-hidden="true" @click="handleSearch">
                                <use xlink:href="#icon-search"></use>
                            </svg>
                        </div>
                    </transition>
                    <selector :options="msgtypes" v-model="msgtype" @select="handleSelect" />
                </div>
            </div>
        </template>
        <!-- 加载更多 -->
        <template v-if="totalPage !== 0 && pageNumber <= totalPage ">
            <div v-if="!fetching" class="center theme-text btn-cursor" @click="handleMore">
                {{ 'msgArch.viewMore' | t }}
            </div>
            <div v-else class="center theme-text btn-cursor">{{ 'common.loading' | t }}...</div>
        </template>

        <!-- main content -->
        <msg-chat-detail :list="resultList" :searching="searching" />
    </slide-drawer>
</template>

<script type="text/ecmascript-6">
import { WecomApiV1 } from '@/api';
import SlideDrawer from '@/common/components/slide-drawer.vue';
import MsgChatDetail from './msg-chat-detail.vue';
import { throttle } from 'lodash';


export default {
    name: 'MsgChatWindow',
    props: {
        // 抽屉的显隐
        show: {
            type: Boolean,
            default: false
        },
        value: {
            type: Object,
            default: () => ({})
        },
        // 是否为企业群类型
        isGroup: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            //可用筛选类型，暂时只支持全部和文本
            msgtypes: [
                { id: 'all', name: this.$t('enterpriseBroadcast.all') },
                { id: 'text', name: this.$t('msgArch.text') },
                { id: 'image', name: this.$t('msgArch.image') },
                { id: 'revoke', name: this.$t('msgArch.revokeMsg') },
                { id: 'agree', name: this.$t('msgArch.agreeContent') },
                { id: 'voice', name: this.$t('msgArch.voice') },
                { id: 'video', name: this.$t('msgArch.video') },
                { id: 'card', name: this.$t('msgArch.workCard') },
                { id: 'location', name: this.$t('msgArch.location') },
                { id: 'emotion', name: this.$t('msgArch.emotion') },
                { id: 'file', name: this.$t('msgArch.file') },
                { id: 'link', name: this.$t('msgArch.link') },
                { id: 'weapp', name: this.$t('msgArch.weapp') },
                { id: 'chatrecord', name: this.$t('msgArch.chatRecord') },
                { id: 'todo', name: this.$t('msgArch.todo') },
                { id: 'vote', name: this.$t('msgArch.vote') },
                { id: 'redpacket', name: this.$t('msgArch.redpacketMsg') },
                { id: 'meeting', name: this.$t('msgArch.meeting') },
                { id: 'docmsg', name: this.$t('msgArch.docmsg') },
                { id: 'calendar', name: this.$t('msgArch.calendar') },
                { id: 'external_redpacket', name: this.$t('msgArch.externalPacket') },
                { id: 'sphfeed', name: this.$t('msgArch.sphfeed') },
            ],
            msgtype: 'all', // 选中的筛选类型
            keywords: '', // 筛选关键字
            totalPage: 0, // 总页数
            resultList: [], // 结果
            pageNumber: 1, // 当前页码
            fetching: false, // 加载中
            searching: false // 处于搜索状态（所有消息居左）
        };
    },
    computed: {
        // 当前聊天记录标题
        title () {
            if (this.isGroup) {
                return this.value && this.value.roomName ? this.value.roomName : this.$t('common.noData');
            }
            return this.value && this.value.contactName ? this.value.contactName : this.$t('common.noData');
        }
    },
    watch: {
        // 弹窗的展示
        show (val) {
            if (val) {
                this.fetchContent();
            } else {
                this.msgtype = 'all';
                this.reset();
            }
        }
    },
    methods: {
        /**
         * @description 获取会话存档
         */
        fetchContent () {
            this.fetching = true;
            // 请求下一页新数据前 的容器高度
            const beforeHeight = this.$refs.drawer.getContentHeight();
            const params = {
                pageSize: 25,
                pageNo: this.pageNumber,
                keywords: this.keywords,
            };
            if (this.isGroup) {
                params.wxRoomId = this.value.wxRoomId;
            } else {
                params.contactId = this.value.contactId;
                params.employeeId = this.value.employeeId;
            }
            if (this.msgtype !== 'all') {
                params.msgType = this.msgtype;
            }
            WecomApiV1
                .getChatContent(params)
                .then(({ body: { data: { totalPage, resultList } } }) => {
                    this.totalPage = totalPage;
                    if (this.pageNumber === 1) {
                        this.resultList = resultList.reverse();
                        this.$nextTick(() => {
                            this.$refs.drawer.scrollToBottom();
                        });
                    } else {
                        this.resultList = [...resultList.reverse(), ...this.resultList];
                        this.$nextTick(() => {
                            // 拼接新数据后的容器高度
                            const afterHeight = this.$refs.drawer.getContentHeight();
                            // 重新滚动到拼接数据前之前的位置
                            this.$refs.drawer.scrollToBottom(afterHeight - beforeHeight);
                        });
                    }
                    this.pageNumber += 1;
                    this.fetching = false;
                    this.searching = this.keywords === '' && this.msgtype === 'all' ? false : true;
                })
                .catch(() => {
                    this.fetching = false;
                    this.searching = this.keywords === '' && this.msgtype === 'all' ? false : true;
                });
        },
        handleSearch: throttle(function () {
            this.pageNumber = 1;
            this.resultList = [];
            this.fetchContent();
        }, 600),
        // 获取更多
        handleMore () {
            if (this.pageNumber > this.totalPage) {
                return;
            }
            this.fetchContent();
        },
        // 选择消息类型
        handleSelect () {
            if (this.msgtype === 'all') {
                this.reset();
                this.fetchContent();
            } else {
                this.keywords = '';
            }
        },
        // 重置全部参数
        reset () {
            this.keywords = '';
            this.pageNumber = 1;
            this.fetching = false;
            this.searching = false;
            this.totalPage = 0;
            this.resultList = [];
        }
    },
    components: {
        SlideDrawer,
        MsgChatDetail,
    },
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../../common/scss/base/variables';
@import '../../../../common/scss/base/mixin';
.msg-chat-window {
    background-color: $content-bg;
    .msg-chat-header {
        display: inline-flex;
        justify-content: start;
        height: 100%;
        width: calc(100% - 48px);
        padding: 12px;
        @include box-sizing();
        .msg-chat-title {
            flex: 1;
            line-height: $input-field-height;
            font-size: 16px;
            @include ellipsis();
        }
        .msg-chat-filter {
            .content-search {
                margin-right: 10px;
                border: none;
                height: 100%;
            }
        }
    }
    .center {
        margin: 0 auto;
        width: fit-content;
    }
    .btn-cursor {
        cursor: pointer;
    }
}
</style>