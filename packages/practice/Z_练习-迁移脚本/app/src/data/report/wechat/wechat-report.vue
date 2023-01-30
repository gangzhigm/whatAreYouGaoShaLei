<template>
    <not-config-public-account v-if="configStatus === 1" />
    <div class="wechat-report" v-else>
        <div class="content-view">
            <crumbs />
            <public-account/>
        </div>
        <div class="tab-links">
            <div class="content-view">
                <router-link class="tab-link" :to="{name: 'appAnalysis'}">{{'report.appAnalysis' | t}}</router-link>
                <router-link class="tab-link" :to="{name: 'followerAnalysis'}">{{'report.followerAnalysis' | t}}</router-link>
            </div>
            <div v-if="isAll&&isDaily">
                <date-range class="pull-right" format="YYYY-MM-DD" :start="startDate" :end="endDate" :max="90" @change="childSure"></date-range>
                <p class="range-maximum-tip">{{'report.max90days' | t}}</p>
            </div>
            <div v-if="isAll&&!isDaily">
                <calendar class="pull-right margin-r3" format="yyyy-mm-dd" v-model="hourlyRefDate" :end="singleEnd" @input="childHourlySure"/>
                <p class="range-maximum-tip">{{'report.max1day' | t}}</p>
            </div>
        </div>
        <div class="page-content">
            <router-view :hourlyRefDate="hourlyRefDate" ref="child" v-on:childAll="switchGroup" v-on:childDaily="switchDaily" v-on:childActived="resetTimeRange"></router-view>
        </div>
    </div>
</template>
<script type="text/babel">
import format from 'date-fns/format';
import NotConfigPublicAccount from '../../../layout/components/not-config-public-account.vue';
export default {
    data () {
        return {
            endDate: '',
            startDate: '',
            isDaily: true,
            isAll: true,
            hourlyRefDate: '',  // 开始时间
            singleEnd: '',
        };
    },
    computed: {
        configStatus() {
            return this.$store.state.user.configStatus;
        },
        user() {
            return this.$store.state.user;
        },
        // 华为类型账号
        isHw() {
            return this.user.companyType === 1;
        }
    },
    mounted() {
        //华为埋码-营销报告-公众号报告
        if (this.isHw) {
            //UEM埋码
            window.hwa('trackPageView', 'P120319922F3688');
        }
    },
    created () {
        this.startDate = format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
        this.endDate = format(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
        this.hourlyRefDate = format(new Date(), 'YYYY-MM-DD');
        this.singleEnd = format(new Date(), 'YYYY-MM-DD');
    },
    methods: {
        childSure ({ start, end }) {
            this.startDate = start;
            this.end = end;
            this.$refs.child.sure({ start, end });
        },
        childHourlySure () {
            this.$refs.child.hourlySure();
        },
        switchGroup (e) {
            this.isAll = e;
            if (!this.isAll) {
                this.startDate = format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
                this.endDate = format(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
            }
        },
        switchDaily (e) {
            this.isDaily = e;
            if (!this.isDaily) {
                this.startDate = format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
                this.endDate = format(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
            }
        },
        resetTimeRange () {
            this.startDate = format(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
            this.endDate = format(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
            this.hourlyRefDate = format(new Date(), 'YYYY-MM-DD');
            this.singleEnd = format(new Date(), 'YYYY-MM-DD');
            this.isDaily = true;
            this.isAll = true;
        }
    },
    components: {
        NotConfigPublicAccount
    }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../common/scss/base/variables';
@import '../../../common/scss/base/mixin';

.wechat-report {
    .form-field {
        // margin-right: 15px;
        .content-input {
            display: inline-block;
            position: relative;
        }

        .create-buttons {
            .active {
                background-color: $theme;
                border-color: $theme;
                color: white;
            }

            .disabled {
                background-color: #fff;
            }
        }

        .reply {
            height: 53px;
            line-height: 53px;
        }

        .create-button {
            cursor: pointer;
            display: inline-block;
            width: 88px;
            height: 32px;
            line-height: 30px;
            text-align: center;
            border: 1px solid $form-border;
            background-color: white;
        }

        .single-create-button {
            border-radius: 4px 0 0 4px;
            border-right: none;
        }

        .bulk-create-button {
            border-radius: 0 4px 4px 0;
            margin-left: -4px;
        }
    }
    .pull-right {
        float: right;
    }
    .date-range {
        float: right;
        position: relative;
        // display: inline-block;
        height: 32px;
        line-height: 30px;
        margin-right: 3%;
        vertical-align: top;
        white-space: nowrap;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    .range-maximum-tip {
        float: right;
        color: #8c8c8c;
        padding-right: 8px;
        height: 32px;
        line-height: 32px;
    }
    .right {
        float: right;
    }
    .margin-r3 {
        margin-right: 3%;
    }
    .tab-links {
        padding: 20px 0;
        // font-size: 24px;
        .tab-link:after {
            bottom: -20px;
        }
    }
}
</style>
