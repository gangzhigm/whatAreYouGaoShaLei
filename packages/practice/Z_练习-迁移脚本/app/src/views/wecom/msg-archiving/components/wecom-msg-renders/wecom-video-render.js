export default {
    name: 'WecomVideoRender',
    props: {
        id: {
            type: [Number, String],
            default: 0
        },
        mediaPlaying: {
            type: [Number, String],
            default: false
        },
        content: {
            type: Object,
            default: () => ({})
        }
    },
    data () {
        return {
            playing: false
        };
    },
    watch: {
        // 监听所有消息的播放状态，如果有其他实例播放，则中断当前实例
        mediaPlaying (val) {
            if (this.id === this.mediaPlaying) return;
            if (val) {
                if (this.playing) {
                    this.$refs.video.pause();
                    this.playing = false;
                }
            }
        }
    },
    render () {
        if (this.content.filePath) {
            return (
                <div class="wecom-video-render" >
                    <video
                        controls
                        width="320"
                        ref="video"
                        {...{
                            on: {
                                play: () => { this.playing = true; this.$emit('play') },
                                ended: () => { this.playing = true; this.$emit('stop') },
                                pause: () => { this.playing = true; this.$emit('stop') },
                            }
                        }}
                    >
                        <source src={this.content.filePath} type="video/mp4" />
                        Sorry, your browser doesn't support embedded videos.
                    </video>
                </div>
            );
        }
        return (
            <div class="wecom-render wecom-text-render">[{this.$t('msgArch.video')}]</div>
        );
    }
};