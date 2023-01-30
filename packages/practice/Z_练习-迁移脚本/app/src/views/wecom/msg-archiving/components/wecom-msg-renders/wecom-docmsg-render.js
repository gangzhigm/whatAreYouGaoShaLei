
export default {
    name: 'WecomDocmsgRender',
    props: {
        content: {
            type: Object,
            default: () => ({})
        }
    },
    render () {
        return (
            <div
                class="wecom-render wecom-cardlike-render clickable-cursor"
                {...{ on: { click: () => { window.open(this.content.link_url, '_blank') } } }}
            >
                <div class="cardlike-body">
                    <div class="cardlike-title-text">
                        <div class="title-text">
                            {this.content.title}
                        </div>
                        <p>{this.content.link_url}</p>
                    </div>
                    <div class="icon icon-wenjian cardlike-icon"></div>
                </div>
                <span class="cardlike-footer light-content-text">{this.$t('msgArch.docmsg')}</span>
            </div>
        );
    }
};