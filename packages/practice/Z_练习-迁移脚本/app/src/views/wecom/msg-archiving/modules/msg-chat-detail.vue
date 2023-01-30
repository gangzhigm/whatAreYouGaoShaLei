<template>
    <div class="msg-chat-detail">
        <template v-for="item in filteredList">
            <div v-if="componentsSet[item.msgtype]" class="chat-item" :key="item.id">
                <div class="chat-single-line" v-if="!['agree', 'disagree'].includes(item.msgtype)">
                    <div v-if="item.fromAvatar && urlReg.test(item.fromAvatar)" class="chat-avatar-box"
                        :class="{ 'pull-left': !item.side, 'pull-right': item.side }"
                        :style="{ backgroundImage: `url(${item.fromAvatar})`}"></div>
                    <div v-else class="icon icon-contacts-solid chat-avatar-box alter"
                        :class="{ 'pull-left': !item.side, 'pull-right': item.side }"></div>
                    <div class="chat-info light-content-text"
                        :class="{ 'pull-left': !item.side, 'pull-right': item.side }">
                        <p :class="{ tar: item.side }">{{ item.fromName }}</p>
                        <p :class="{ tar: item.side }">{{ item.msgTime || $t('common.noData') }}</p>
                    </div>
                </div>
                <div class="chat-single-line">
                    <component class="center-msg" :class="{ 
                                    'left-side': !item.side && !['agree', 'disagree'].includes(item.msgtype),
                                    'rigth-side': item.side && !['agree', 'disagree'].includes(item.msgtype),
                                    'center': ['agree', 'disagree'].includes(item.msgtype) }"
                        :is="componentsSet[item.msgtype]" :value="item" :content="JSON.parse(item.content)"
                        :id="item.id" :media-playing="mediaPlaying" @play="handleMediaPlay(item.id)"
                        @stop="handleMediaStop" ref="msgEditor" />
                </div>
            </div>
        </template>
    </div>
</template>

<script type="text/ecmascript-6">
import { COMMON_URL_REGEXP } from '@/common/utils/regs';
import {
    WecomTextRender,
    WecomImageRender,
    WecomRevokeRender,
    WecomDisagreeRender,
    WecomAgreeRender,
    WecomVoiceRender,
    WecomVideoRender,
    WecomCardRender,
    WecomLocationRender,
    WecomEmotionRender,
    WecomFileRender,
    WecomLinkRender,
    WecomWeappRender,
    WecomChatrecordRender,
    WecomTodoRender,
    WecomVoteRender,
    WecomRedpacketRender,
    WecomMeetingRender,
    WecomDocmsgRender,
    WecomMixedRender,
    WecomSphfeedRender,
    WecomUnsupportedRender
} from '../components';

export default {
    name: 'MsgChatDetail', // 聊天内容详情
    props: {
        // 原始聊天记录
        list: {
            type: Array,
            default: () => []
        },
        // 是否处于搜索状态
        searching: {
            type: Boolean,
            default: false
        }
    },
    data () {
        const COMPONENTS_SET = {
            // 文本，图片，撤回消息，不同意，同意，语音，视频，名片，位置，表情，文件，小程序，聊天记录
            // 待办，投票，红包，会议邀请，文档消息，日程，混合消息，互通红包，视频号消息
            text: 'WecomTextRender',
            image: 'WecomImageRender',
            revoke: 'WecomRevokeRender',
            disagree: 'WecomDisagreeRender',
            agree: 'WecomAgreeRender',
            voice: 'WecomVoiceRender',
            video: 'WecomVideoRender',
            card: 'WecomCardRender',
            location: 'WecomLocationRender',
            emotion: 'WecomEmotionRender',
            file: 'WecomFileRender',
            link: 'WecomLinkRender',
            weapp: 'WecomWeappRender',
            chatrecord: 'WecomChatrecordRender',
            todo: 'WecomTodoRender',
            vote: 'WecomVoteRender',
            redpacket: 'WecomRedpacketRender',
            meeting: 'WecomMeetingRender',
            docmsg: 'WecomDocmsgRender',
            calendar: 'WecomMeetingRender',
            mixed: 'WecomMixedRender',
            external_redpacket: 'WecomRedpacketRender',
            sphfeed: 'WecomSphfeedRender',
            // 拿不到真实数据，暂不支持的类型 切换日志，markdown，图文消息，音频存档消息，音频共享文档消息, 填表
            switch: 'WecomUnsupportedRender',
            markdown: 'WecomUnsupportedRender',
            news: 'WecomUnsupportedRender',
            meeting_voice_call: 'WecomUnsupportedRender',
            voip_doc_share: 'WecomUnsupportedRender',
            collect: 'WecomUnsupportedRender'
        };
        return {
            componentsSet: COMPONENTS_SET, // 组件映射表
            urlReg: COMMON_URL_REGEXP, // url正则
            mediaPlaying: 0 // 处于播放状态的voice,video类型消息id
        };
    },
    computed: {
        filteredList () {
            if (this.searching) {
                return this.list.map(e => {
                    e.side = 0;
                    return e;
                });
            }
            return this.list;
        }
    },
    methods: {
        // 媒体播放事件，标记当前播放的媒体id
        handleMediaPlay (id) {
            this.mediaPlaying = id;
        },
        // 媒体暂停事件，重置全局播放状态
        handleMediaStop () {
            this.mediaPlaying = 0;
        }
    },
    components: {
        WecomTextRender,
        WecomImageRender,
        WecomRevokeRender,
        WecomDisagreeRender,
        WecomAgreeRender,
        WecomVoiceRender,
        WecomVideoRender,
        WecomCardRender,
        WecomLocationRender,
        WecomEmotionRender,
        WecomFileRender,
        WecomLinkRender,
        WecomWeappRender,
        WecomChatrecordRender,
        WecomTodoRender,
        WecomVoteRender,
        WecomRedpacketRender,
        WecomMeetingRender,
        WecomDocmsgRender,
        WecomMixedRender,
        WecomSphfeedRender,
        WecomUnsupportedRender
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../../common/scss/base/variables';
@import '../../../../common/scss/base/mixin';

.msg-chat-detail {
    .left-side {
        float: left;
        margin-left: 43px;
    }
    .rigth-side {
        float: right;
        margin-right: 43px;
    }
    .chat-item {
        padding-bottom: 15px;

        .chat-single-line {
            .chat-avatar-box {
                display: inline-block;
                width: 40px;
                height: 40px;
                background-size: contain;
                background-repeat: no-repeat;
                @include border-radius(4px);
                &.alter {
                    font-size: 40px;
                }
            }
            .chat-info {
                display: inline-block;
                height: 100%;
                padding: 5px 5px 0 5px;
                vertical-align: top;
                max-width: calc(50% - 40px);
                @include ellipsis();
                p {
                    white-space: normal;
                }
            }
            overflow: hidden;
            padding: 3px;
            @include clearfix();
        }
    }
}
</style>