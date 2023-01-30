export default {
    name: 'WecomMixedRender',
    props: {
        content: {
            type: Object,
            defualt: null
        }
    },
    methods: {
        renderMsg () {
            let summary = this.content.item.reverse()
                .map(e => {
                    if (e.type === 'text') {
                        return (
                            <p>{JSON.parse(e.content).content}</p>
                        );
                    } else if (e.type === 'image') {
                        return (
                            <p>[{this.$t('wechatContent.pics')}]</p>
                        );
                    }
                    return (
                        <p>[{this.$t('wechatContent.unsupportedMsg')}]</p>
                    );
                });
            return summary;
        }
    },
    render () {
        return (
            <div class="wecom-render wecom-cardlike-render">
                <div class="cardlike-body">
                    <div class="chatrecord-summary">
                        {this.renderMsg()}
                    </div>
                </div>
                <div class="cardlike-footer light-content-text">{this.$t('msgArch.mixed')}</div>
            </div>
        );
    }
};