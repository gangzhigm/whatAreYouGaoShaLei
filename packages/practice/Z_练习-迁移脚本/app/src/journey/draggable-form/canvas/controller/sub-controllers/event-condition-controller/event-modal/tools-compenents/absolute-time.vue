<template>
    <div class="absolute-time">
        <calendar v-model="startTime"></calendar>
        <span>{{'common.to' | t}}</span>
        <calendar v-model="endTime" :start="startTime"></calendar>
    </div>
</template>

<script type="text/ecmascript-6">
    export default {
        props: {
            restoreValue: Object
        },
        data() {
            return {
                startTime: '',
                endTime: '',
            };
        },
        created() {
            this.restore();
        },
        methods: {
            restore() {
                if (this.restoreValue.operator === 'value') {
                    this.endTime = this.restoreValue.value.end;
                    this.startTime = this.restoreValue.value.start;
                }
            },
            reset() {
                this.endTime = '';
                this.startTime = '';
            },
            output() {
                let errMsg = '';
                if (!this.endTime || !this.startTime) {
                    errMsg = this.$t('controller.absoluteTimeNeeded');
                }
                this.$emit('change', { operator: 'value', errMsg: errMsg, value: { end: this.endTime, start: this.startTime } });
            },
        },
        watch: {
            endTime() {
                this.output();
            },
            startTime() {
                this.output();
            },
        }
    };
</script>

<style lang="scss" scoped>
    @import "../../../../../../../../common/scss/base/variables";
    .absolute-time {
        span {
            margin: 0 11px;
        }
        .calendar {
            width: 45%;
        }
    }
</style>
