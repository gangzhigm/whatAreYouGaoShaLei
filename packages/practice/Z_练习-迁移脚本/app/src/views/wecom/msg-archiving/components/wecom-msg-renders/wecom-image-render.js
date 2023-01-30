export default {
    name: 'WecomImageRender',
    props: {
        content: {
            type: Object,
            default: () => ({})
        }
    },
    render () {
        if (this.content.filePath) {
            return (
                <img
                    class="wecom-image-render"
                    src={this.content.filePath}
                    {...{ on: { click: () => { window.open(this.content.filePath, '_blank') } } }}
                />
            );
        }
        return (
            <div class="wecom-render wecom-text-render">[{this.$t('msgArch.image')}]</div>
        );
    }
};