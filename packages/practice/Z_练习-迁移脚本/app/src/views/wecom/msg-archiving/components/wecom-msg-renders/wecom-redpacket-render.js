export default {
    name: 'WecomRedpacketRender',
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
    methods: {
        // 1 普通红包、2 拼手气群红包、3 激励群红包
        typeHandler (type) {
            switch (type) {
                case 1:
                    return this.$t('msgArch.normalPacket');
                case 2:
                    return this.$t('msgArch.racePacket');
                case 3:
                    return this.$t('msgArch.encouragePacket');
                default:
                    return '未知类型红包';
            }
        },
        extraRender () {
            return (<span>/{this.$t('msgArch.externalPacket')}</span>);
        }
    },
    render () {
        let extraTips = null;
        if (this.value.msgtype === 'external_redpacket') {
            extraTips = this.extraRender();
        }
        return (
            <div class="wecom-cardlike-render wecom-redpacket-render">
                <div class="cardlike-body redpacket-body">
                    <div class="cardlike-content">{this.content.wish}</div>
                    <p>{this.$t('msgArch.packetCount')}:&nbsp;{this.content.totalcnt}</p>
                    <p>{this.$t('msgArch.packetAmount')}:&nbsp;{this.content.totalamount} 元</p>
                </div>
                <div class="cardlike-footer redpacket-footer light-content-text">
                    {this.typeHandler(this.content.type)}
                    {extraTips}
                </div>
            </div>
        );
    }
};