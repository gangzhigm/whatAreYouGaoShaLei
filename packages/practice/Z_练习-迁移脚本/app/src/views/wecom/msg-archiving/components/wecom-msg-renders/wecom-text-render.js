
export default {
    name: 'WecomTextRender',
    props: {
        content: {
            type: Object,
            default: () => ({})
        }
    },
    render () {
        return (
            <div class="wecom-render wecom-text-render">
                {this.content.content}
            </div>
        );
    }
};