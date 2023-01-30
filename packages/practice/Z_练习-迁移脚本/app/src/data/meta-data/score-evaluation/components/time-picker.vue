<template>
    <div class="hour-minute-select" v-blur="hideList">
        <input readonly @click="toggle()" type="text" :disabled="disabled" class="input time-input" v-model="value" :class="{error: error}">

        <transition name="drop">
            <div class="list-container"  v-show="show">
                <div>
                    <div class="hour-wrapper">
                        <span @click="chooseHour(item.id)" class="time-item" v-for="item in hours"
                              :class="{'active-time-item':item.id === hour}"
                        >{{item.name}}</span>
                    </div>
                    <div class="minute-wrapper">
                        <span @click="chooseMinute(item2.id)" class="time-item" v-for="item2 in minutes"
                              :class="{'active-time-item':item2.id === minute}"
                        >{{item2.name}}</span>
                    </div>
                </div>
               <div class="button-wrapper">
                   <button class="btn btn-sm btn-theme-border" type="button" @click="cancel">{{'common.cancel' | t}}</button>
                   <button class="btn btn-sm btn-theme" type="button" @click="save" >{{'common.confirm' | t}}</button>
               </div>
            </div>
        </transition>

        <!--<selector :options="hours" :disabled="disabled" v-model="hour" class="tiny"
                  placeholder="  "></selector>
        <b>:</b>
        <selector :options="minutes" :disabled="disabled" v-model="minute" class="tiny"
                  placeholder="  "></selector>-->
    </div>
</template>
<script type="text/babel">
    export default {
        name: 'time-picker',
        props: {
            disabled: {
                default: false
            },
            error: {
                default:false
            },
            value: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                show: false,
                hour:'23',
                minute:'00',
                hours: [],
                minutes: []
            };
        },
        computed: {
            /*hour: {
                get() {
                    return this.value ? this.value.substring(0, 2) : this.value;
                },
                set(hour) {
                    this.$emit('input', hour + ':' + this.minute);
                }
            },
            minute: {
                get() {
                    return this.value ? this.value.substring(3, 5) : this.value;
                },
                set(minute) {
                    this.$emit('input', this.hour + ':' + minute);
                }
            }*/
        },
        created() {
            let t, m;
            for (let i = 0; i < 24; i++) {
                t = i.toString();
                if (t < 10) {
                    t = '0' + t;
                }
                this.hours.push({id: t, name: t});
            }
            for (let j = 0; j < 60; j++) {
                m = j.toString();
                if (m < 10) {
                    m = '0' + m;
                }
                this.minutes.push({id: m, name: m});
            }

        },
        watch:{
            value(){
                this.hour = this.value ? this.value.substring(0, 2) : this.value;
                this.minute = this.value ? this.value.substring(3, 5) : this.value;
            },
        },
        methods: {
            toggle(){
                if (this.disabled){
                    return;
                }
                this.show = !this.show;
            },
            hideList(){
                this.show = false;
            },
            chooseHour(hour){
                this.hour = hour;
            },
            chooseMinute(minute){
                this.minute = minute;
            },
            cancel(){
                this.show = false;
                this.hour = '23';
                this.minute = '00';
            },
            save(){
                this.show = false;
                this.$emit('input', this.hour + ':' + this.minute);
            },
        }
    };
</script>
<style lang="scss">
    @import "../../../../common/scss/base/variables";
    .hour-minute-select {
        display: inline-block;
        position: relative;
        .time-input{
            width: 60px;
        }
        .list-container {
            position: absolute;
            top: 34px;
            left: 0;
            width: 170px;
            background-color: #fff;
            z-index: 10;
            height: 260px;
            box-shadow: 0 0 3px 3px #eee;
        }

        .hour-wrapper{
            display: inline-block;
            position: absolute;
            left: 0;
            width: 80px;
            height: 220px;
            overflow: auto;
        }
        .minute-wrapper{
            display: inline-block;
            position: absolute;
            right: 0;
            width: 80px;
            height: 220px;
            overflow: auto;
        }
        .time-item{
            display: inline-block;
            width: 100%;
            height: 30px;
            line-height: 30px;
            text-align: center;
            cursor: pointer;
        }
        .active-time-item{
            color: #fff;
            background-color: $green;
        }
        .button-wrapper{
            position: absolute;
            height: 40px;
            line-height: 40px;
            bottom: 0;
            width: 100%;
            padding-right: 10px;
            box-sizing: border-box;
            text-align: right;

        }
    }
</style>
