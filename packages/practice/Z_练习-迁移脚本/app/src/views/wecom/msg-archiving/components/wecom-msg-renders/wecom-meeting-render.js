import { I18N_STORE_NAME } from '@/locales';

export default {
    name: 'WecomMeetingRender', // 会议、日程消息共用组件
    props: {
        value: {
            type: Object,
            default: () => ({})
        },
        content: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        //语言状态
        lang () {
            return this.$store.state[I18N_STORE_NAME].lang;
        },
    },
    methods: {
        formatTime (timestamp) {
            let date = new Date();
            date.setTime(timestamp * 1000);
            if (this.lang === 'zh-CN') {
                return `${date.getMonth()}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}`;
            }
            return date.toLocaleString('en', { hour12: false });
        }
    },
    render () {
        return (
            <div class="wecom-render wecom-cardlike-render wecom-meeting-render">
                <div class="cardlike-body">
                    <div class="cardlike-content">
                        {/* 主题/标题 */}
                        <div class="title-text">
                            {this.value.msgtype === 'meeting' ? this.content.topic : this.content.title}
                        </div>
                        <div>
                            {this.formatTime(this.content.starttime)} - {this.formatTime(this.content.endtime)}
                        </div>
                        <div>
                            {this.value.msgtype === 'meeting' ? this.content.address : this.content.place}
                        </div>
                        <div>
                            <div class="cardlike-content">{this.content.remarks}</div>
                        </div>
                    </div>
                </div>
                <span class="cardlike-footer light-content-text">
                    {this.value.msgtype === 'meeting' ? this.$t('msgArch.meeting') : this.$t('msgArch.calendar')}
                </span>
            </div>
        );
    }
};