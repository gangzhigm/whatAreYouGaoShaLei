import { I18N_STORE_NAME } from '@/locales';
import format from 'date-fns/format';

export default {
    name: 'WecomChatrecordRender',
    props: {
        content: {
            type: Object,
            defualt: null
        }
    },
    computed: {
        //语言状态
        lang () {
            return this.$store.state[I18N_STORE_NAME].lang;
        },
    },
    methods: {
        // 循环render每条信息
        renderMsg (summary = false) {
            const last = summary ? 3 : this.content.item.length - 1;
            return this.content.item
                .slice(0, last)
                .map(e => {
                    let tips = '';
                    // 列举官方文档支持的类型，其他均显示为暂不支持
                    switch (e.type) {
                        case 'ChatRecordText':
                            tips = JSON.parse(e.content).content;
                            break;
                        case 'ChatRecordFile':
                            tips = this.$t('msgArch.file');
                            break;
                        case 'ChatRecordImage':
                            tips = this.$t('msgArch.image');
                            break;
                        case 'ChatRecordVideo':
                            tips = this.$t('msgArch.video');
                            break;
                        case 'ChatRecordLink':
                            tips = this.$t('msgArch.link');
                            break;
                        case 'ChatRecordLocation':
                            tips = this.$t('msgArch.location');
                            break;
                        case 'ChatRecordMixed':
                            tips = this.$t('msgArch.mixed');
                            break;
                        default:
                            tips = this.$t('msgArch.unsupportedMsg');
                    }
                    const style = {
                        padding: '2px 0'
                    };
                    if (!summary) {
                        style.borderBottom = '1px solid #e0e5ea';
                        style.padding = '10px 0';
                    }
                    return (
                        <div style={style}>
                            {summary ? null : this.renderFormatTime(e.msgtime)}
                            <p>{e.type === 'ChatRecordText' ? tips : `[${tips}]`}</p>
                        </div>
                    );
                });
        },
        // 外层概要信息
        renderSummary () {
            let summary = this.renderMsg(true);
            if (this.content.item.length > 3) {
                summary = [...summary, (<p>...</p>)];
            }
            return summary;
        },
        // 查看详情弹窗
        handleDetail () {
            this.$confirm(this.content.title, this.renderMsg(), '', this.$t('common.close'), false, false, 'md');
        },
        // 处理时间信息
        renderFormatTime (timestamp) {
            let date = new Date();
            let string;
            date.setTime(timestamp * 1000);
            if (this.lang === 'zh-CN') {
                string = format(date, 'YYYY-MM-DD HH:mm:ss');
            } else {
                string = date.toLocaleString('en', { hour12: false });
            }
            return (
                <p>{string}</p>
            );
        }
    },
    render () {
        return (
            <div class="wecom-render wecom-chatrecord-render">
                <div class="chatrecord-title title-text">{this.content.title}</div>
                <div class="chatrecord-summary">
                    {this.renderSummary()}
                </div>
                <div>
                    <span
                        class="theme-text chatrecord-view-more"
                        {...{ on: { click: () => { this.handleDetail() } } }}
                    >{this.$t('msgArch.viewDetail')}</span>
                </div>
            </div>
        );
    },

};