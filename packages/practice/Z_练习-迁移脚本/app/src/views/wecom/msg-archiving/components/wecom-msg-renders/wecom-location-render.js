export default {
    name: 'WecomLocationRender',
    props: {
        content: {
            type: Object,
            defualt: null
        }
    },
    render () {
        return (
            <div class="wecom-render wecom-cardlike-render">
                <div class="cardlike-body">
                    <div class="cardlike-title-text">
                        <div class="title-text">{this.content.address}</div>
                        <div class="light-content-text">{this.content.title}</div>
                    </div>
                    <div class="icon icon-duoqutuisong theme-text cardlike-icon"></div>
                </div>
                <span class="cardlike-footer light-content-text">{this.$t('msgArch.location')}</span>
            </div>
        );
    }
};