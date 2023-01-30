export default {
    name: 'WecomEmotionRender',
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
                    class="wecom-emotion-render"
                    src={this.content.filePath}
                />
            );
        }
        return (
            <div class="wecom-render wecom-text-render">[{this.$t('msgArch.emotion')}]</div>
        );
    }
};