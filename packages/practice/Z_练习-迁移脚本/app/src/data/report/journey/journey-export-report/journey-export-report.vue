<template>
    <div class="journey-export-report">
        <div class="show-time">
            <i class="show-time-icon"></i>
            {{'data.dateExportRule' | t}}
        </div>
        <div class="content-view margin white-bg">
            <div class="tab-links">
                <div class="content">
                    <router-link class="tab-link" :to="{name:'exportOriginalData'}">{{'data.exportRawData' | t}}</router-link>
                    <!-- <router-link class="tab-link" :to="{name:'exportSendRecord'}">{{'data.exportSendRecord' | t}}</router-link> -->
                </div>
            </div>
            <router-view class="padding"></router-view>
        </div>
    </div>
</template>
<script>
    import {format,startOfDay} from 'date-fns';
    export default {
        data() {
            return {
                updateDate: format(startOfDay(new Date()),'YYYY-MM-DD HH:mm:ss')
            };
        }
    };
</script>
<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .journey-export-report {
        height: calc(100vh - 70px - 40px);
        overflow: auto;
        .show-time {
            color: #aaaaaa;
            background-color: #ffffff;
            line-height: 32px;
            padding: 16px;
            margin: 24px 3%;
            .show-time-icon{
                float: left;
                margin-top: 11px;
                margin-right: 5px;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: #aaaaaa;
                display: inline-block;
            }
        }
        .date {
            margin-top: 24px;
            display: flex;
            justify-content: flex-end;
        }
        .form-field {
            .title {
                font-size: 15px;
            }
        }
        .content-view {
            .tab-links {
                padding-left: 6px;
            }
            .padding {
                padding: 16px 24px 24px;
                @include box-sizing(border-box);
            }
        }
    }
</style>
