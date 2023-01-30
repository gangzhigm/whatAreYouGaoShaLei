<template>
    <div class="table-wrap table-user-list" v-if="colNames.length && colValues.length">
        <div class="table-box">
            <table class="table">
                <thead>
                <tr class="condition event">
                    <th v-for="colName in colNames">
                        {{colName}}
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr class="condition" v-for="colValue in colValues">
                    <td v-for="value in colValue" :title="value">
                        {{value != null ? value : '-'}}
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
    <div class="no-data" v-else>{{'dataCenter.noUserData' | t}}</div>
</template>

<script>
    import { EtlApiV1 } from '@/api';

    export default {
        name: 'preview-user',
        props: {
            type: String,//sdk,sftp,api
            // 加载数据
            showUsers: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                colNames: [],
                colValues: [],
            };
        },
        watch: {
            showUsers() {
                if (this.showUsers) {
                    this.fetchDataPreview();
                }
            }
        },
        mounted() {
            if (this.showUsers) {
                this.fetchDataPreview();
            }
        },
        methods: {
            // 获取数据预览 用户 eventId=0
            fetchDataPreview() {
                this.$loading();
                EtlApiV1
                    .getPreview({eventId: 0, id: this.$route.query.id, type: this.type})
                    .then(res => {
                        this.colNames = res.body.data.colNames;
                        this.colValues = res.body.data.colValues;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
        },
    };
</script>

<style lang="scss" scoped>
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";
    @import "../preview/preview-scss/preview";
</style>
