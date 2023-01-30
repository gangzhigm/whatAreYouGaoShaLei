<template>
    <div class="event-range">
        <number-input class="input" v-model="eventValue1" type="float"/>
        <span>{{'common.to' | t}}</span>
        <number-input class="input" v-model="eventValue2" type="float"/>
    </div>
</template>

<script type="text/ecmascript-6">
    export default {
        props: {
            restoreValue: Object
        },
        data() {
            return {
                eventValue1: '',
                eventValue2: '',
            };
        },
        created() {
            // this.reset();
            this.restore();
            // this.output();
        },
        methods: {
            restore() {
                if (this.restoreValue) {
                    this.eventValue1 = this.restoreValue.value ? this.restoreValue.value.start : '';
                    this.eventValue2 = this.restoreValue.value ? this.restoreValue.value.end : '';
                }
            },
            reset() {
                this.eventValue1 = '';
                this.eventValue2 = '';
            },
            output() {
                let errMsg = '';
                if (this.eventValue1 === '' || this.eventValue2 === '') {
                    errMsg = this.$t('controller.completeRange');
                } else if (this.eventValue1 >= this.eventValue2) {
                    errMsg = this.$t('controller.rangeWarn');
                } else {
                    errMsg = '';
                }
                this.$emit('change', {
                    operator: 'value',
                    value: {start: this.eventValue1, end: this.eventValue2},
                    errMsg: errMsg
                });
            },
        },
        watch: {
            eventValue1() {
                this.output();
            },
            eventValue2() {
                this.output();
            },
        }
    };
</script>

<style lang="scss">
    .event-range {
        span {
            margin: 0 8px;
        }
    }
</style>
