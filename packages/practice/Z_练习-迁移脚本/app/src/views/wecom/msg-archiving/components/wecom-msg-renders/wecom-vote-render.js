export default {
    name: 'WecomVoteRender',
    props: {
        content: {
            type: Object,
            defualt: null
        }
    },
    methods: {
        renderSummary () {
            return this.content.voteitem.map((value, index) => {
                if (index === this.content.voteitem.length - 1) {
                    return (
                        <span>"{value}"</span>
                    );
                }
                return (
                    <span>"{value}"{this.$t('punctuation.comma')}</span>
                );
            });
        },
        handleDetail () {
            const renderItems = () => {
                return this.content.voteitem.map(value => {
                    return (
                        <p style={{ paddingBottom: '3px' }}>{value}</p>
                    );
                });
            };
            const renderDetail = () => {
                return (
                    <div class="wecom-vote-detail">
                        <div class="title-text" style={{ paddingBottom: '5px' }}>{this.content.votetitle}</div>
                        {renderItems()}
                    </div>
                );
            };
            this.$confirm(this.$t('msgArch.voteDetail'), renderDetail(), '', this.$t('common.close'), false, false, 'sm');
        }
    },
    render () {
        if (this.content.votetype === 101) {
            return (
                <div class="wecom-render wecom-cardlike-render wecom-vote-render">
                    <div class="cardlike-body">
                        <div class="cardlike-content title-text">{this.content.votetitle}</div>
                        <div>
                            <span
                                class="theme-text vote-view-more"
                                {...{ on: { click: () => { this.handleDetail() } } }}
                            >{this.$t('msgArch.viewDetail')}</span>
                        </div>
                    </div>
                    <div class="cardlike-footer light-content-text">{this.$t('msgArch.vote')}</div>
                </div>
            );
        }
        return (
            <div class="wecom-render wecom-text-render">
                {this.$t('msgArch.participated')}
                "{this.content.votetitle}"
                {this.$t('punctuation.comma')}
                {this.$t('msgArch.selected')}
                {this.renderSummary()}
            </div>
        );
    }
};