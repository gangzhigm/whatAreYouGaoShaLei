<template>
    <div class="send-record">
        <div class="link">
            <h4>短信与彩信</h4>
            <ul class="head-item">
                <li class="tab-link" v-for="send in sendRecordItem"
                    :class="{active: sendActiveItem === send}"
                    :key="send" @click="sendActiveItem = send">{{send}}</li>
            </ul>
        </div>
        <record v-if="sendActiveItem === '发送记录'"></record>
        <send-summary v-if="sendActiveItem === '发送量汇总'"></send-summary>
        <api v-if="sendActiveItem === 'API发送记录'"></api>
    </div>
</template>

<script>
    import record from './send-record-record.vue';
    import sendSummary from './send-record-summary.vue';
    import api from './send-record-api.vue';
    export default {
        name: 'export-send-record',
        components: {
            record,
            sendSummary,
            api
        },
        data() {
            return {
                sendRecordItem: ['发送量汇总','发送记录','API发送记录'],
                sendActiveItem: '发送量汇总'
            };
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .send-record {
        display: flex;
        .link {
            width: 120px;
            .head-item {
                .tab-link {
                    line-height: 32px;
                    font-size: 14px;
                    color: #8c8c8c;
                    cursor: pointer;
                    &.active {
                        color: $theme;
                    }
                }
            }
        }
    }
</style>