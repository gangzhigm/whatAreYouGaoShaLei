export default {
    name: 'WecomWeappRender',
    props: {
        content: {
            type: Object,
            defualt: null
        }
    },
    render () {
        return (
            <div class="wecom-render wecom-weapp-render">
                <div class="weapp-content">
                    <div class="light-content-text weapp-title">{this.content.title}</div>
                    <div class="weapp-name">{this.content.displayname}</div>
                    <div class="icon icon-xiaochengxu1 weapp-icon"></div>
                </div>
                <div class="weapp-footer light-content-text">{this.$t('msgArch.weapp')}</div>
            </div>
        );
    }
};