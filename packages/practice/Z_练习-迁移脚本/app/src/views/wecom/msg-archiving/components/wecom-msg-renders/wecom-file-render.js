
import formatBytes from '@/utils/formatBytes';

export default {
    name: 'WecomFileRender',
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
                {...{ on: { click: () => { window.open(this.content.filePath, '_blank') } } }}
            >
                <div class="cardlike-body">
                    <div class="cardlike-title-text">
                        <div class="title-text">{this.content.filename}</div>
                        <div>{formatBytes(this.content.filesize, 1)}</div>
                    </div>
                    <div class="icon icon-wenjian cardlike-icon"></div>
                </div>
                <span class="cardlike-footer light-content-text">{this.$t('common.file')}</span>
            </div>
        );
    }
};