<!--数据接入 title-->
<template>
    <div class="content-container sftp" :type="type">
        <div class="content-view">
            <div class="toolbar">
                <crumbs class="pull-left" :crumbs="crumbs"/>
            </div>
        </div>
        <div class="sftp-title">{{title}}</div>
        <router-view></router-view>
    </div>
</template>
<script>
    export default {
        name: 'data-access',
        computed: {
            // 类型 sftp sdk api
            type() {
                return this.$route.query.type;
            },
            // 导航栏
            crumbs() {
                let crumbs = [
                    {name: 'home', text: 'Dmartech'},
                    {name: 'dataCenter', text: this.$t('dataCenter.dataCenter')},
                ];
                let subCrumbs = {};
                switch (this.type) {
                    case 'sftp':
                        subCrumbs = {
                            name: 'sftp',
                            text: this.$t('dataCenter.sftpAccess'),
                            query: {
                                id: this.$route.query.id,
                                name: this.$route.query.name,
                                step: 1,
                                type: 'sftp'
                            }
                        };
                        crumbs.push(subCrumbs);
                        return crumbs;
                    case 'serveSdk':
                        subCrumbs = {
                            name: 'sdk', text: this.$t('dataCenter.severSDKAccess'),
                            query: {
                                id: this.$route.query.id,
                                name: this.$route.query.name,
                                step: 1,
                                type: 'serveSdk'
                            }
                        };
                        crumbs.push(subCrumbs);
                        return crumbs;
                    case 'jsSdk':
                        subCrumbs = {
                            name: 'jsSdk', text: this.$t('dataCenter.jsSDKAccess'),
                            query: {
                                id: this.$route.query.id,
                                name: this.$route.query.name,
                                step: 1,
                                type: 'jsSdk'
                            }
                        };
                        crumbs.push(subCrumbs);
                        return crumbs;
                    case 'api':
                        subCrumbs = {
                            name: 'api',
                            text: this.$t('dataCenter.api'),
                            query: {
                                id: this.$route.query.id,
                                name: this.$route.query.name,
                                step: 1,
                                type: 'api'
                            }
                        };
                        crumbs.push(subCrumbs);
                        return crumbs;
                }
            },
            // 标题
            title() {
                switch (this.type) {
                    case 'sftp':
                        return this.$t('dataCenter.sftpAccess');
                    case 'serveSdk':
                        return this.$t('dataCenter.severSDKAccess');
                    case 'jsSdk':
                        return this.$t('dataCenter.jsSDKAccess');
                    case 'api':
                        return this.$t('dataCenter.api');
                }
            },
        },
        mounted() {
            // 地址栏改地址 todo
            let query = this.$route.query;
            if (!query.step) {
                this.$router.push({
                    name: this.$route.name,
                    query: {
                        id: query.id,
                        name: query.name,
                        step: query.step,
                        type: query.type,
                    },
                });
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .sftp {
        .sftp-title {
            height: 56px;
            line-height: 56px;
            background-color: #ffffff;
            padding-left: 52px;
        }
    }
</style>