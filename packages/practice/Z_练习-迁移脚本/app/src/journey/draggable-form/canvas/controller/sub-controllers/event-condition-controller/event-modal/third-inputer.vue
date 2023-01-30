<template>
    <div class="third-inputer">
        <component :is="typeComputer" :restoreValue="value" :options="options" :settings="settings" :type="type" :wechatId="wechatId"
                   @change="updateValue" ref="eventComponent"></component>
    </div>
</template>

<script type="text/ecmascript-6">
    import eventInputer from './tools-compenents/event-inputer.vue';
    import eventSelector from './tools-compenents/event-selector.vue';
    import fanLabel from './tools-compenents/fan-label.vue';
    import memberLabel from './tools-compenents/member-label.vue';
    import QRList from './tools-compenents/QR-list.vue';
    import relativeTime from './tools-compenents/relative-time.vue';
    import absoluteTime from './tools-compenents/absolute-time.vue';
    import eventRange from './tools-compenents/event-range.vue';

    export default {
        props: {
            type: String,
            auto: Boolean,    // ？？ 为 true 时，最后一级组件不需要 reset
            options: Array, // 选择 '_表单分组列表' 时，最后一级组件需要的选项列表
            settings: Array,
            wechatId: Number
        },
        methods: {
            reset() {
                this.$nextTick(() => {
                    if (this.$refs.eventComponent && this.$refs.eventComponent.reset) {
                        this.$refs.eventComponent.reset();
                    }
                });
            },
            updateValue(newValue) {
                let newSettings = this.settings.slice();
                if (Array.isArray(newValue)) {
                    newSettings.splice(this.indexInSettings, newSettings.length - 2);
                    newSettings = newSettings.concat(newValue);
                } else {
                    newSettings.splice(this.indexInSettings, 1, newValue);
                }
                this.$emit('update', newSettings);
            }
        },
        computed: {
            indexInSettings() {
                const isLabelAttribute = this.settings[1] && this.settings[1].field === 'label_ids';
                return isLabelAttribute ? 2 : 3;
            },
            typeComputer() {
                if (RegExp('eventInputer')
                    .test(this.type)) {
                    return 'eventInputer';
                }
                return (this.type === 'belong' || this.type === 'nbelong') ? 'eventInputer' : this.type;
            },
            // 当前组件所选信息对象
            value () {
                return this.settings[this.indexInSettings] || {};
            }
        },
        watch: {
            'type'() {
                if (this.auto) return;
                this.reset();
            }
        },
        components: {eventInputer, eventSelector, fanLabel, memberLabel, QRList, eventRange, relativeTime, absoluteTime}
    };
</script>
<style lang="scss">
    @import "../../../../../../../common/scss/base/variables";
    .third-inputer {
        margin-top: 16px;
        .member-tag {
            width: 100%;
        }
        .event-selector {
            .selector {
                width: 100%;
            }
        }
    }
</style>
