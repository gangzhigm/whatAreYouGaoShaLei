<template>
    <div class="hour-minute-select">
        <selector :options="hours" :disabled="disabled" v-model="hour" class="tiny" placeholder="  "></selector>
        <b>:</b>
        <selector :options="minutes" :disabled="disabled" v-model="minute" class="tiny" placeholder="  "></selector>
        <b v-if="secondShow">:</b>
        <selector v-if="secondShow" :options="seconds" :disabled="disabled" v-model="second" class="tiny"
            placeholder="  "></selector>
    </div>
</template>
<script type="text/babel">
export default {
    name: 'HourMinuteSelect',
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        value: {
            type: String,
            default: ''
        },
        secondShow: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            hours: [],
            minutes: [],
            seconds: [],
            hour: '',
            minute: '',
            second: ''
        };
    },
    watch: {
        hour () {
            let value = this.hour;
            if (this.minute) value += ':' + this.minute;
            if (this.second) value += ':' + this.second;
            this.$emit('input', value);
        },
        minute () {
            let value = '';
            if (this.hour) value += this.hour;
            value += ':' + this.minute;
            if (this.second) value += ':' + this.second;
            this.$emit('input', value);
        },
        second () {
            let value = '';
            if (this.hour) value += this.hour;
            if (this.minute) value += ':' + this.minute;
            value += ':' + this.second;
            this.$emit('input', value);
        },
    },
    created () {
        let t, m, s;
        for (let i = 0; i < 24; i++) {
            t = i;
            if (t < 10) {
                t = '0' + t;
            }
            this.hours.push({ id: t, name: t });
        }
        for (let j = 0; j < 60; j++) {
            m = j;
            if (m < 10) {
                m = '0' + m;
            }
            this.minutes.push({ id: m, name: m });
        }
        if (this.secondShow) {
            for (let k = 0; k < 60; k++) {
                s = k;
                if (s < 10) {
                    s = '0' + s;
                }
                this.seconds.push({ id: s, name: s });
            }
        }

        if (this.value) {
            this.hour = this.value.substring(0, 2);
            this.minute = this.value.substring(3, 5);
            this.second = this.value.substring(6, 8);
        }
        if (!this.hour) this.hour = '00';
        if (!this.minute) this.minute = '00';
        if (!this.second && this.secondShow) this.second = '00';
    }
};
</script>
<style lang="scss">
.hour-minute-select {
    display: inline-block;
}
</style>
