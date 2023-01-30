<template>
    <div class="calendar">
        <input type="text" ref="target" :value="value" :placeholder="placeholder" @focus="updateOption"
               :readonly="readonly" :disabled="disabled"/>
        <slot></slot>
    </div>
</template>
<script type="text/babel">

    import initDatetimepicker from './bootstrap-datetimepicker';
    import zhCN from './locales/bootstrap-datetimepicker.zh-CN';
    import autoScroll from './autoScroll';
    import $ from 'jquery';

    initDatetimepicker($);
    zhCN($);

    import {I18N_STORE_NAME} from '@/locales';
    import {getDateInstance} from '../../utils/dateUtils';

    export default {
        name: 'calendar',
        props: {
            value: String,
            start: {
                type: String,
                default: ''
            },
            end: {
                type: String,
                default: ''
            },
            format: {
                type: String,
                default: 'yyyy-mm-dd',
            },
            placeholder: {
                type: String,
                default: ''
            },
            readonly: {
                type: String,
                default: '',
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            // 是否显示 '今日' button, sftp step 3 不显示
            showTodayBtn: {
                type: Boolean,
                default: true,
            },
            // 清空按钮
            clearBtn: {
                type: Boolean,
                default: false,
            },
            maxView: {
                type: Number,
            },
            todayHeightLight: {
                type: Boolean,
                default: true
            },
            initialDate: {
                type: [Date, String]
            },
            hoursDisabled: {
                type: Array
            },
            minuteStep: {
                type: Number,
                default: 5
            }
        },
        data() {
            return {
                $dateTimePicker: null
            };
        },
        computed: {
            // 0 or 'hour' for the hour view
            // 1 or 'day' for the day view
            // 2 or 'month' for month view (the default)
            // 3 or 'year' for the 12-month overview
            // 4 or 'decade' for the 10-year overview. Useful for date-of-birth datetimepickers.
            startView() {
                if (/y/.test(this.foramt)) {
                    return 'year';
                }
                if (/m/.test(this.format)) {
                    return 'month';
                }
                if (/d/.test(this.format)) {
                    return 'day';
                }
                return 'hour';
            },
            minView() {
                if (/[is]/.test(this.format)) {
                    return 0;
                }
                if (/h/.test(this.format)) {
                    return 1;
                }
                if (/d/.test(this.format)) {
                    return 2;
                }
                return 3;
            }
        },
        watch: {
            start(newStart) {
                if (this.$dateTimePicker) {
                    this.$dateTimePicker.datetimepicker('setStartDate', newStart);
                    if (this.value && newStart && (getDateInstance(this.value) < getDateInstance(newStart))) {
                        this.$emit('input', '');
                        this.$dateTimePicker.datetimepicker('update');
                    }
                }
            },
            end(newEnd) {
                if (this.$dateTimePicker) {
                    this.$dateTimePicker.datetimepicker('setEndDate', newEnd);
                    if (this.value && newEnd && (getDateInstance(this.value) > getDateInstance(newEnd))) {
                        this.$emit('input', '');
                        this.$dateTimePicker.datetimepicker('update');
                    }
                }
            }
        }
        ,
        mounted() {
            const waitAMoment = setTimeout(() => {
                const vm = this;
                let options = {
                    forceParse: false,
                    startDate: this.start,
                    initialDate: this.getInitialData(),
                    endDate: this.end,
                    startView: this.startView, // 开始视图
                    autoclose: true,        // 自动关闭
                    format: this.format,    // 时间格式
                    todayBtn: this.showTodayBtn,         // 是否显示今日的按钮
                    todayHighlight: this.todayHeightLight,   // 是否突出当天日期
                    minView: this.minView,  // 设置结束视图  如 年-月-日->off
                    maxView: this.maxView,
                    language: this.$store.state[I18N_STORE_NAME].lang,
                    clearBtn: this.clearBtn,
                    hoursDisabled: this.hoursDisabled,
                    minuteStep: this.minuteStep
                };

                //  距离改为日历的dom高度
                const topOrBottom = (window.innerHeight - this.$el.getBoundingClientRect().top) < 284;
                options.pickerPosition = topOrBottom ? 'top-left' : 'bottom-right';

                this.$dateTimePicker = $(this.$refs.target)
                    .on('input', function () {
                        vm.$emit('input', this.value);
                    })
                    .datetimepicker(options)
                    .on('changeDate', function () {
                        vm.$nextTick(() => {
                            if (!vm.$dateTimePicker.data('datetimepicker').isVisible)
                                vm.$emit('input', this.value);
                        });
                    });
                autoScroll.watch(this.$dateTimePicker);
                clearTimeout(waitAMoment);
            }, 300);
        }
        ,
        beforeDestroy() {
            this.$dateTimePicker.datetimepicker('remove');
            autoScroll.stop(this.$dateTimePicker);
        },
        methods: {
            // 更新配置
            updateOption() {
                this.changePosition();
                this.$dateTimePicker.data('datetimepicker').initialDate = this.getInitialData();
                this.$dateTimePicker.data('datetimepicker').todayHighlight = this.todayHeightLight;
                this.$dateTimePicker.datetimepicker('update');
            },
            // 每次聚焦重新計算位置
            changePosition() {
                let options = {
                    pickerPosition: ''
                };
                const topOrBottom = (window.innerHeight - this.$el.getBoundingClientRect().top) < 284;
                options.pickerPosition = topOrBottom ? 'top-left' : 'bottom-right';
                this.$dateTimePicker.data('datetimepicker').pickerPosition = options.pickerPosition;
                this.$dateTimePicker.datetimepicker('place');
            },
            // 获取初始化时间
            getInitialData () {
                const now = new Date();
                now.setSeconds(0);
                now.setMinutes(0);
                now.setHours(0);
                return this.initialDate ? this.initialDate : now;
            }
        }
    };
</script>
<style lang="less" type="text/less" rel="stylesheet/less">

    @import "build_standalone.less";

    @red: #f26565;
    @border-color: #cfd5df;
    @hover-border-color: #3dceba;
    @active-border-color: #0cc2a9;

    .calendar {
        display: inline-block;
        vertical-align: top;

        &.error {
            [type="text"] {
                border-color: @red;

                &:hover {
                    border-color: @red;
                }
            }
        }

        [type="text"] {
            box-sizing: border-box;
            padding: 0 10px;
            width: 100%;
            height: 32px;
            line-height: 30px;
            border: 1px solid @border-color;
            border-radius: 4px;
            -webkit-transition: all .3s ease;
            -moz-transition: all .3s ease;
            -ms-transition: all .3s ease;
            -o-transition: all .3s ease;
            transition: all .3s ease;

            &:hover {
                border-color: @hover-border-color;
            }

            &:focus {
                border-color: @active-border-color;
                -webkit-box-shadow: 0 0 4px rgba(46, 203, 181, .35);
                -moz-box-shadow: 0 0 4px rgba(46, 203, 181, .35);
                box-shadow: 0 0 4px rgba(46, 203, 181, .35);
            }
        }
    }

</style>
