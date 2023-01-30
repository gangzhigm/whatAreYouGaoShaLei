
export default {
    name: 'WecomLinkRender',
    props: {
        content: {
            type: Object,
            defualt: null
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
                        <div class="title-text">{this.content.title}</div>
                        <div>{this.content.description}</div>
                    </div>
                    <div class="cardlike-avatar" style={{ backgroundImage: `url(${this.content.image_url})` }}></div>
                </div>
                <div class="cardlike-footer light-content-text">{this.content.link_url}</div>
            </div>
        );
    }
};