export default {
    name: 'WecomTodoRender',
    props: {
        content: {
            type: Object,
            default: () => ({})
        }
    },
    render () {
        return (
            <div class="wecom-render wecom-cardlike-render wecom-todo-render">
                <div class="cardlike-body">
                    <div class="title-text">
                        {this.content.title}
                    </div>
                    <div>{this.content.content}</div>
                </div>
                <span class="cardlike-footer light-content-text">{this.$t('msgArch.todo')}</span>
            </div>
        );
    }
};