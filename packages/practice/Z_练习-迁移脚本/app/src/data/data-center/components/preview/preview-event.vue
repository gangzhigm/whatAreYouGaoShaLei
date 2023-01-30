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
    <div class="no-data" v-else>{{'dataCenter.noEventData' | t}}</div>
</template>

<script>
    import { EtlApiV1 } from '@/api';

    export default {
        name: 'preview-event',
        props: {
            eventId: {
                type: [Number, String],
                required: true,
            },
            type: String, //sdk,sftp,api
        },

        watch: {
            eventId() {
                this.fetchDataPreview();
            }
        },

        mounted() {
            this.fetchDataPreview();
        },

        data() {
            return {
                colNames: [],
                colValues: [],
            };
        },

        methods: {
            // 获取数据预览 用户 eventId=0
            fetchDataPreview() {
                /**
                  * 修复 http://jira.qdum.com/browse/DMARTECH-1429
                  * 问题：刷新后eventId重置，buttonName未重置，重新获取eventList前触发eventId=0，获取user列表数据。添加判断禁止eventId等于0时获取列表。
                  */
                if ( this.eventId === 0 ) return false;
                this.$loading();
                EtlApiV1
                    .getPreview({eventId: this.eventId, id: this.$route.query.id, type: this.type})
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