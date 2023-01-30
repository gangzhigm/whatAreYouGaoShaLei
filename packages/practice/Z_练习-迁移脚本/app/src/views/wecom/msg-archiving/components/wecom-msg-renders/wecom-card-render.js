export default {
    name: 'WecomCardRender',
    props: {
        content: {
            type: Object,
            default: () => ({})
        }
    },
    render () {
        return (
            <div class="wecom-render wecom-cardlike-render">
                <div class="cardlike-body">
                    <div class="cardlike-title-text">
                        <div class="title-text">
                            {this.content.corpname}
                        </div>
                        <div>
                            {this.content.userid}
                        </div>
                    </div>
                    <div class="icon icon-contacts-solid cardlike-icon"></div>
                </div>
                <span class="cardlike-footer light-content-text">{this.$t('msgArch.workCard')}</span>
            </div>
        );
    }
};