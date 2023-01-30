<template>
    <div class="send-date date-time">
        <calendar v-model="sendDate" :showTodayBtn="false" :disabled="disabled" />
        <hour-minute-select v-model="sendTime" :disabled="disabled" :secondShow="secondShow" />
    </div>
</template>
<script>

export default ({
    name: 'date-time',
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        secondShow: {
            type: Boolean,
            default: false
        },
        value: {
            type: String,
            default: ''
        },
    },
    data () {
        return {
            sendDate: '',
            sendTime: ''
        };
    },
    watch: {
        sendDate () {
            let val = this.sendDate;
            if (this.sendTime) {
                val += ' ' + this.sendTime;
            }
            this.$emit('input', val);
        },
        sendTime () {
            this.$emit('input', this.sendDate + ' ' + this.sendTime);
        }
    },
    created () {
        if (this.value) {
            this.sendDate = this.value.split(' ')[0];
            this.sendTime = this.value.split(' ')[1];
        }
    },
});
</script>


<style lang="scss" type="text/babel">
@import '../scss/base/variables';
@import '../scss/base/mixin';
.clue-data {
    .date-time {
        display: inline-block;
        .hour-minute-select {
            display: inline-block;
            .selector.tiny {
                width: 60px;
            }
        }
    }
}
</style>