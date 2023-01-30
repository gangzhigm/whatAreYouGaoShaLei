<template>
    <div class="micro-page-editor">
        <div class="content-view">
            <crumbs :crumbs="crumbs"></crumbs>
        </div>
        <keep-alive>
            <iframe :src="frameSrc" class="micropage-editor-frame"></iframe>
        </keep-alive>
    </div>
</template>
<script type="text/babel">
    import LINKS from '../LINKS';
    import {SET_AUTH_LOCK, CLEAR_USER_INFO} from '@/store/vuex/mutationTypes';
    import { mapMutations } from 'vuex';

    export default {
        computed: {
            frameSrc() {
                return LINKS.ORIGIN + LINKS.WEB_BASE + '/micropage-editor/'
                    + (this.$route.query.id ? `?id=${this.$route.query.id}` : '')
                    + (this.$route.query.groupId ? `?groupId=${this.$route.query.groupId}` : '')
                    + (this.$route.query.pageName ? `?pageName=${this.$route.query.pageName}` : '');
            },
            crumbs() {
                return [
                    {name: 'index', text: 'Dmartech'},
                    {name: 'microPageList', text: this.$t('home.microPage')},
                    Object.assign({}, this.$route, {text: this.$t(this.$route.meta.name)})
                ];
            },
        },
        created() {
            window.micro_page_name = this.$route.query.pageName;
        },
        mounted() {
            window.addEventListener('message', this.frameMessageHandler, false);
            this.$on('hook:beforeDestroy', () => {
                window.removeEventListener('message', this.frameMessageHandler, false);
            });
        },
        methods: {
            ...mapMutations({
                SET_AUTH_LOCK, 
                CLEAR_USER_INFO
            }),
            frameMessageHandler(event) {
                if (event.data.operation === 'reRegister') {
                    switch (event.data.code) {
                        case 401:
                            this.CLEAR_USER_INFO();
                            this.SET_AUTH_LOCK({
                                title: this.$t('common.needLogin'),
                                message: this.$t('common.expired')
                            });
                            break;
                        case 403:
                            this.SET_AUTH_LOCK({
                                title: this.$t('common.needAuth'),
                                message: this.$t('common.noAuth')
                            });
                            break;
                    }
                }
                if (event.data.operation === 'save') {
                    this.$router.push({
                        name: 'microPagePublish',
                        query: {id: event.data.id, groupId: this.$route.query.groupId}
                    });
                }
            }
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../common/scss/base/variables";
    @import "../common/scss/base/mixin";

    .micro-page-editor {
        .micropage-editor-frame {
            border: none;
            width: 100%;
            height: calc(100vh - #{$header-height + $toolbar-height});
        }
    }
</style>
