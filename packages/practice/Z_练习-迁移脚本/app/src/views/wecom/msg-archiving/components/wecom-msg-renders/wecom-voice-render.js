export default {
    name: 'WecomVoiceRender',
    props: {
        id: {
            type: [Number, String],
            default: 0
        },
        mediaPlaying: {
            type: [Number, String],
            default: false
        },
        value: {
            type: Object,
            default: () => ({})
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
                if (this.playing && this.$refs.audio) {
                    this.$refs.audio.pause();
                    this.playing = false;
                }
            }
        }
    },
    methods: {
        playAudio () {
            if (!this.content.filePath) return;
            const audio = this.$refs.audio;
            if (audio.paused || audio.ended) {
                audio.play();
                this.playing = true;
            } else {
                audio.pause();
                this.playing = false;
            }
        }
    },
    render () {
        if (this.content.filePath) {
            return (
                <div class={{ 'wecom-voice-render': true, 'reverse-msg': this.value.side }}>
                    <div class="voice-bar" {...{ on: { click: this.playAudio } }}>
                        <div class={{ 'voice-wave': true, voicePlay: this.playing }}></div>
                    </div>
                    <audio
                        hidden="true"
                        ref="audio"
                        {...{
                            on: {
                                play: () => { this.$emit('play') },
                                ended: () => { this.$emit('stop') },
                                pause: () => { this.playing = false; this.$emit('stop') },
                            }
                        }}
                    >
                        <source src={this.content.filePath} type="audio/mpeg" />
                    </audio>
                    <span>{this.content.play_length}''</span>
                </div>
            );
        }
        return (
            <div class="wecom-render wecom-text-render">[{this.$t('msgArch.voice')}]</div>
        );
    }
};