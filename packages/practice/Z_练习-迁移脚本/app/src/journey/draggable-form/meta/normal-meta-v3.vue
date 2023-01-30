<template>
    <transition name="menu-toggle">
        <div class="journey-meta" v-show="!metaHidden">
            <h5>{{'journey.overview' | t}}</h5>
            <div class="journey-meta-content">
                <div class="journey-meta-section">
                    <h6>{{'journey.repetition' | t}}</h6>
                    {{repeatInfo}}
                </div>
                <div class="journey-meta-section">
                    <h6>{{'journey.totalSent' | t}}</h6>
                    <p class="icon icon-mail">
                        {{'journey.email' | t}} <i>{{journey.emailCount | count}} {{'journey.emailUnit' | t}}</i>
                    </p>
                    <p class="icon icon-sms">
                        {{'journey.sms' | t}} <i>{{journey.messageCount | count}} {{'journey.smsUnit' | t}}</i>
                    </p>
                    <p class="icon icon-wechat">
                        {{'journey.wechat' | t}} <i>{{journey.wechatCount | count}} {{'journey.wechatUnit' | t}}</i>
                    </p>
                </div>
                <div class="journey-meta-section">
                    <h6>{{'journey.periodTime' | t}}</h6>
                    <p class="start-date">
                        <template v-if="journey.startDate">{{journey.startDate | cutSeconds}}</template>
                        <template v-else>{{'journey.unStartTxt' | t}}</template>
                    </p>
                    <p class="end-date">
                        <template v-if="journey.endDate">{{journey.endDate | cutSeconds}}</template>
                        <template v-else>{{'journey.unStartTxt' | t}}</template>
                    </p>
                </div>
                <div class="journey-meta-section">
                    <h6>{{'journey.create' | t}}</h6>
                    {{journey.createName}} {{journey.createDate | cutSeconds}}
                    <br>
                    <br>
                    <h6>{{'journey.update' | t}}</h6>
                    {{journey.updateName}} {{journey.updateDate | cutSeconds}}
                </div>
            </div>
        </div>
    </transition>
</template>

<script type="text/ecmascript-6">
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import { mapState } from 'vuex';

    export default {
        computed: {
            ...mapState({
                journey: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation
            }),
            // 定时旅程，旅程属性信息面板是否展示
            metaHidden() {
                return this.journey.journeyType !== 2
                    && this.$route.query.calendarView
                    && this.$route.query.metaHidden;
            },
            repeatInfo() {
                if (this.journey.repeatFrequency === 0 && (!this.journey.repeatCount || !this.journey.repeatEndDate)) {
                    return this.$t('journey.single');
                }
                let a = this.journey.repeatCount ? this.journey.repeatCount : 0;
                return `${this.$t('journey.every')} ${this.repeatSettings.number} ${this.$t(this.repeatSettings.name)}，`
                    + (this.journey.repeatEndDate
                        ? `${this.journey.repeatEndDate} ${this.$t('journey.end')}`
                        : `${this.$t('journey.totalCount')} ${a} ${this.$t('journey.times')}`)
                    + (this.journey.incremental ? `，${this.$t('journey.incremental')}` : '');
            },
            repeatSettings() {
                // 选中的重复类型
                let repeatSettings = {
                    unit: 1,        // 重复天数
                    name: 'common.day',
                    number: 1,    // 重复数，同重复单位相乘得出天数
                };
                if (this.journey.repeatFrequency) {
                    if (this.journey.repeatFrequency % 30 === 0) {
                        repeatSettings.unit = 30;
                        repeatSettings.name = 'common.month';
                        repeatSettings.number = this.journey.repeatFrequency / 30;
                    } else if (this.journey.repeatFrequency % 7 === 0) {
                        repeatSettings.unit = 7;
                        repeatSettings.name = 'common.week';
                        repeatSettings.number = this.journey.repeatFrequency / 7;
                    } else {
                        repeatSettings.unit = 1;
                        repeatSettings.name = 'common.day';
                        repeatSettings.number = this.journey.repeatFrequency;
                    }
                }
                return repeatSettings;
            }
        },
    };
</script>
<style lang="scss" type="text/scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    // 旅程左侧概要，日历视图、画布（不可编辑时）视图
    .journey-meta {
        float: left;
        height: calc(100vh - #{$header-height + $toolbar-height + $page-head-height + 1px});
        $meta-width: 194px;

        flex-shrink: 0;
        width: $meta-width;
        overflow-x: hidden;
        overflow-y: auto;
        margin-top: -1px;
        background: #f5f5f5 url("./journey-meta-content-bg.png") no-repeat center bottom;
        @include background-size(cover);
        @include transition(margin-left .2s ease);
        will-change: margin-right;

        &.menu-toggle-enter,
        &.menu-toggle-leave-to {
            margin-left: - $meta-width;
        }

        h5 {
            padding: 0 16px;
            line-height: 44px;
            border-top: 1px solid #e1e1e1;
            border-bottom: 1px solid #e1e1e1;
            background-color: $content-bg;
        }

        .journey-meta-section {
            position: relative;
            padding: 16px;
            word-break: break-all;

            + .journey-meta-section {
                border-top: 1px dotted #e0e0e0;

                &:before {
                    content: '';
                    position: absolute;
                    top: 1px;
                    left: 0;
                    right: 0;
                    width: 100%;
                    height: 0;
                    border-top: 1px dotted #e0e0e0;
                }
            }

            h6 {
                margin-bottom: 8px;
                font-size: inherit;
                color: rgba($color-content, .6);
                @include transition(color .2s ease);
            }

            .icon-setting {
                cursor: pointer;

                &:hover {
                    color: $color-light-content;
                }
            }

            .icon-mail,
            .icon-sms,
            .icon-wechat {
                margin: 13px 0;
                line-height: 20px;
                color: $color-light-content;

                &:before {
                    display: inline-block;
                    font-size: 18px;
                    width: 20px;
                    margin-right: 2px;
                    vertical-align: top;
                }

                i {
                    float: right;
                    padding: 0 1em;
                    font-style: normal;
                    border-radius: 10px;
                    color: white;
                }
            }

            .icon-mail {
                &:before {
                    color: $purple;
                }
                i {
                    background-color: $purple;
                }
            }
            .icon-sms {
                &:before {
                    color: $theme;
                }
                i {
                    background-color: $theme;
                }
            }
            .icon-wechat {
                &:before {
                    color: $wechat;
                }
                i {
                    background-color: $wechat;
                }
            }

            .start-date,
            .end-date {
                overflow: hidden;
                position: relative;
                line-height: 32px;

                &:before {
                    content: '';
                    float: left;
                    width: 12px;
                    height: 12px;
                    margin: 10px 10px 10px 0;
                    @include border-radius(6px);
                    vertical-align: middle;
                    background-color: $color-light-content;
                }

                &:after {
                    content: '';
                    position: absolute;
                    left: 5px;
                    height: 10px;
                    width: 2px;
                    background-color: $color-light-content;
                }
            }

            .start-date:after {
                bottom: 0;
            }
            .end-date {
                top: 0;
            }
        }

    }
</style>
