<template>
    <div class="delay-time-picker">
        <number-input :disabled="forbide" v-model="day" class="input tiny" :min="0" max="999" maxlength="3"/>
        {{$t('controller.days')}}
        <selector :options="hours" :disabled="forbide" v-model="hour" class="tiny" placeholder="  "/>
        {{$t('controller.hours')}}
        <selector :options="minutes" :disabled="forbide" v-model="minute" class="tiny" placeholder="  "/>
        {{$t('controller.minutes')}}
    </div>
</template>
<script type="text/babel">
    const hours = [];
    const minutes = [];
    let t, m;
    for (let i = 0; i < 24; i++) {
        t = i;
        if (t < 10) {
            t = '0' + t;
        }
        hours.push({id: t, name: t});
    }
    for (let j = 0; j < 60; j++) {
        m = j;
        if (m < 10) {
            m = '0' + m;
        }
        minutes.push({id: m, name: m});
    }
    export default {
        name: 'delay-time-picker',
        props: {
            value: String,
            forbide: Boolean
        },
        data() {
            return {
                hours,
                minutes
            };
        },
        computed: {
            parseResult() {
                return this.value ? this.value.split(':') : ['', '', ''];
            },
            day: {
                get() {
                    return this.parseResult[0];
                },
                set(day) {
                    this.$emit('input', day + ':' + this.hour + ':' + this.minute);
                }
            },
            hour: {
                get() {
                    return this.parseResult[1];
                },
                set(hour) {
                    this.$emit('input', this.day + ':' + hour + ':' + this.minute);
                }
            },
            minute: {
                get() {
                    return this.parseResult[2];
                },
                set(minute) {
                    this.$emit('input', this.day + ':' + this.hour + ':' + minute);
                }
            }
        }
    };
</script>
<style lang="scss">
    .delay-time-picker {
        display: inline-block;
    }
</style>
