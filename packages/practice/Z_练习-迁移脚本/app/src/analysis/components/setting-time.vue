<template>
    <div class="setting-time" v-blur="close">
        <svg class="setting-icon" aria-hidden="true" @click="isShow = !isShow">
            <use xlink:href="#icon-setting"></use>
        </svg>
        <transition name="fade">
            <div class="setting-content" v-if="isShow">
                <div class="setting-content-header">
                    {{'analysis.chooseTimeType' | t}}
                </div>
                <div class="setting-content-middle">
                    <div class="setting-item">
                        <radio :source="false" v-model="collect">{{'analysis.noSummary' | t}}</radio>
                        <selector :disabled="collect" search :options="notSummarySelectList" type="select"
                                  v-model="notTimePrecision"/>
                    </div>
                    <div class="setting-item">
                        <radio :source="true" v-model="collect">{{'analysis.sumasTime' | t}}</radio>
                        <selector :disabled="!collect" search :options="SummarySelectList" type="select"
                                  v-model="summaryTimePrecision"/>
                    </div>
                </div>
                <div class="setting-content-footer">
                    <button class="btn btn-sm btn-theme-border" @click="cancel">{{'common.cancel' | t}}</button>
                    <button class="btn btn-sm btn-theme" @click="sure">{{'common.confirm' | t}}</button>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
    export default {
        name: 'setting-time',
        props: {
            collectValue: {
                type: Boolean
            },
            timeValue: '',
        },
        data() {
            return {
                isShow: false,
                collect: this.collectValue,
                notTimePrecision: this.collectValue ? 'default' : this.timeValue,
                summaryTimePrecision: this.collectValue ? this.timeValue : 'day',
                notSummarySelectList: [
                    {id: 'default', name: this.$t('analysis.defaults')},
                    {id: 'minute', name: this.$t('analysis.byMinute')},
                    {id: 'hour', name: this.$t('analysis.byHour')},
                    {id: 'day', name: this.$t('analysis.byDay')},
                    {id: 'week', name: this.$t('analysis.byWeek')},
                    {id: 'month', name: this.$t('analysis.byMonth')},
                    {id: 'quarter', name: this.$t('analysis.bySeason')},
                    {id: 'year', name: this.$t('analysis.byYear')},
                ],
                SummarySelectList: [
                    {id: 'minute', name: this.$t('time.minute')},
                    {id: 'hour', name: this.$t('time.hour')},
                    {id: 'day', name: this.$t('time.day')},
                    {id: 'week', name: this.$t('time.week')},
                    {id: 'month', name: this.$t('time.month')},
                    {id: 'quarter', name: this.$t('time.season')},
                ]
            };
        },
        methods: {
            // 取消
            cancel() {
                //初始化汇总true不汇总false
                this.collect = this.collectValue;
                if (this.collectValue) {
                    this.notTimePrecision = 'default';
                    this.summaryTimePrecision = this.timeValue;

                } else {
                    this.notTimePrecision = this.timeValue;
                    this.summaryTimePrecision = 'day';

                }
                this.isShow = false;
            },
            // 确定
            sure() {
                let timePrecision;
                if (this.collect) {
                    timePrecision = this.summaryTimePrecision;
                } else {
                    timePrecision = this.notTimePrecision;
                }
                this.$emit('change', {collect: this.collect, timePrecision: timePrecision});
                this.isShow = false;
            },
            // 关闭
            close() {
                this.isShow = false;
            }
        }
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    $radius: 4px;
    $padding: 16px;
    .setting-time {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        color: $color-light-content;

        .setting-icon {
            display: inline-block;
            vertical-align: top;
            margin: ($input-field-height - 14px)/2;
            width: 14px;
            height: 14px;
            fill: $green;
            cursor: pointer;
        }

        .setting-content {
            position: absolute;
            left: -113px;
            top: 29px;
            min-width: 255px;
            border: 1px solid $select-border;
            border-radius: $radius;
            z-index: $index-menu;
            background-color: white;
            @include box-shadow(0 3px 8px rgba(#8b9daf, .16));
            &:before {
                content: '';
                position: absolute;
                left: 50%;
                top: -6px;
                z-index: $index-menu;
                width: 8px;
                height: 8px;
                margin-left: -4px;
                transform: rotate(45deg);
                border-radius: $radius;
                border-top: 1px solid $select-border;
                border-left: 1px solid $select-border;
                background-color: $title-bg;
            }
            .setting-content-header {
                background-color: $title-bg;
                height: $input-field-height;
                line-height: $input-field-height;
                padding-left: $padding;
                border-top-left-radius: $radius;
                border-top-right-radius: $radius;
                font-weight: bold;
            }
            .setting-content-middle {
                padding: $padding;
                .setting-item {
                    + .setting-item {
                        margin-top: $padding;
                    }
                    @include clearfix();
                    > label {
                        height: $input-field-height;
                        line-height: $input-field-height;
                        float: left;
                    }

                    .selector {
                        float: right;
                        width: 100px;
                    }
                }
            }
            .setting-content-footer {
                padding: $padding;
                padding-top: 0;
                text-align: right;
            }
        }
    }
</style>
