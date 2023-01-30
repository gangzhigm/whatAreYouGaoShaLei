export default {
    name: 'WecomSphfeedRender',
    props: {
        content: {
            type: Object,
            default: () => ({})
        }
    },
    methods: {
        typeHandler () {
            switch (this.content.feed_type) {
                case 2:
                    return this.$t('msgArch.image');
                case 4:
                    return this.$t('msgArch.video');
                case 9:
                    return this.$t('msgArch.live');
            }
        }
    },
    render () {
        return (
            <div class="wecom-render wecom-cardlike-render wecom-sphfeed-render">
                <div class="cardlike-body">
                    <div class="cardlike-content">{this.content.feed_desc}</div>
                    <div class="cardlike-content title-text">{this.content.sph_name}</div>
                    <div class="cardlike-content">{this.typeHandler()}</div>
                </div>
                <span class="cardlike-footer light-content-text">{this.$t('msgArch.sphfeed')}</span>
            </div>
        );
    }
};