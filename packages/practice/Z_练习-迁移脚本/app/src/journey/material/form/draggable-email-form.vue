<template>
    <div class="draggable-email-form">
        <div class="content-view">
            <crumbs :crumbs="crumbs"></crumbs>
        </div>
        <keep-alive>
            <iframe :src="frameSrc" ref="draggableEditor" class="draggable-editor-frame"></iframe>
        </keep-alive>
    </div>
</template>
<script type="text/ecmascript-6">
    import LINKS from '../../../LINKS';
    import {SET_AUTH_LOCK, CLEAR_USER_INFO} from '@/store/vuex/mutationTypes';
    import { mapState, mapMutations } from 'vuex';

    export default {
        data() {
            return {
                echoQuery: {}
            };
        },
        computed: {
            ...mapState({
                companyType: state => state.user.companyType
            }),
            frameSrc() {
                if (this.$route.query.groupType === 6) {
                    return LINKS.ORIGIN + LINKS.WEB_BASE + '/draggable-editor-nike/'
                        + (this.$route.query.id ? `?id=${this.$route.query.id}` : '')
                        + (this.$route.query.groupId ? `?groupId=${this.$route.query.groupId}` : '')
                        + (this.$route.query.groupType ? `?groupType=${this.$route.query.groupType}` : '');
                }
                return LINKS.ORIGIN + LINKS.WEB_BASE + '/draggable-editor/'
                    + (this.$route.query.id ? `?id=${this.$route.query.id}` : '')
                    + (this.$route.query.groupId ? `?groupId=${this.$route.query.groupId}` : '')
                    + (this.$route.query.groupType ? `?groupType=${this.$route.query.groupType}` : '')
                    + (this.$route.query.headId ? `?headId=${this.$route.query.headId}` : '')
                    + (this.$route.query.footId ? `?footId=${this.$route.query.footId}` : '')
                    + (`?companyType=${this.companyType}`);
            },
            crumbs() {
                return [
                    {name: 'index', text: 'Dmartech'},
                    {name: 'materialStore', text: this.$t('material.contentManagement')},
                    Object.assign({}, this.$route, {text: this.$t(this.$route.meta.name)})
                ];
            },
        },
        mounted() {
            if (this.$route.params.echoQuery) {
                this.echoQuery = this.$route.params.echoQuery;
            }
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
                if (event.data.operation === 'reRegister') {//强制重新登录
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
                                message: this.$t('common.noAuth') + `<blockquote><code>${this.method}</code><br><code>${this.url}</code></blockquote>`
                            });
                            break;
                    }
                }
                if (event.data.operation === 'test') {
                    let material = event.data.material;
                    this.$test(material, material.testSubject ? material.testSubject : '');
                }
                if (event.data.operation === 'preview') {
                    let material = event.data;
                    this.$preview({material, toolbar: false});
                }
                if (event.data.operation === 'cancel') {
                    // this.$router.push({
                    //     name: 'materialStore',
                    //     query: {type: this.$route.query.type}
                    // });
                    if (this.$route.params.echoQuery) {
                        this.$router.push({
                            name: 'materialStore',
                            query: this.echoQuery
                        });
                    } else {
                        this.$router.push({
                            name: 'materialStore',
                            query: {
                                groupId: this.$route.query.groupId,
                                pageNumber: this.$route.query.pageNumber,
                                type: this.$route.query.type
                            }
                        });
                    }
                }
                if (event.data.operation === 'save') {
                    if (this.$route.params.echoQuery) {
                        this.$router.push({
                            name: 'materialStore',
                            query: this.echoQuery
                        });
                    } else {
                        this.$router.push({
                            name: 'materialStore',
                            query: {type: this.$route.query.type}
                        });
                    }
                }

                if (event.data.operation === 'header') {
                    this.$router.push({
                        name: 'richHeaderFooter',
                        query: {id: event.data.id, groupId: event.data.groupId}
                    });
                }
                if (event.data.operation === 'footer') {
                    this.$router.push({
                        name: 'richHeaderFooter',
                        query: {id: event.data.id, groupId: event.data.groupId}
                    });
                }

                if (event.data.operation === 'viewLabel') {
                    this.$viewLabel({material: event.data.material, labelList: event.data.labelList});
                }
            }
        }
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .draggable-email-form {

        .draggable-editor-frame {
            border: none;
            width: 100%;
            height: calc(100vh - #{$header-height + $toolbar-height});
        }

    }
</style>
