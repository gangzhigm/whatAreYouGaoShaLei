<template>
    <!-- 倒计时 s -->
    <div class="timer">
        <button type="button" class="btn btn-md btn-theme" v-show="show" :disabled="disabled" @click="getCode">
            {{'common.sendValidateCode' | t}}
        </button>
        <button type="button" class="btn btn-md btn-theme" v-show="!show">{{count}} S</button>
    </div>
</template>
<script>
    import { mapState } from 'vuex';
    export default {
        name: 'vue-timer',
        props: {
            // 倒计时秒数
            timeCount: {
                type: Number,
                require: true,
            },
            // 开始倒计时
            showTimer: {
                type: Boolean,
                default: false,
            },
            // 禁止点击
            disabled: {
                type: Boolean,
                default: false,
            },
            // 停止倒计时
            stopTimer: {
                type: Boolean,
                default: false,
            },
        },
        data() {
            return {
                count: '',  // 倒计时秒数
                show: true, // 显示按钮
                timer: null,
            };
        },
        mounted() {
            // 进入页面立即倒计时
            if (this.showTimer) {
                this.startTimer();
            }
        },
        watch: {
            stopTimer(val) {
                if (val) {
                    this.clearTimer();
                } else {
                    this.startTimer();
                }
            },
        },
        computed: {
            // 当前用户
            ...mapState(['user']),
        },
        methods: {
            // 开始倒计时
            startTimer() {
                if (!this.stopTimer && !this.timer) {
                    this.count = this.timeCount;
                    this.show = false;
                    this.timer = setInterval(() => {
                        if (this.count > 0 && this.count <= this.timeCount) {
                            this.count--;
                        } else {
                            this.clearTimer();
                        }
                    }, 1000);
                }
            },
            // 清除
            clearTimer() {
                this.show = true;
                clearInterval(this.timer);
                this.timer = null;
            },
            // 获取验证码，开始倒计时
            getCode() {
                this.startTimer();
                this.$emit('change');
            },
        },
    };
</script>
<style type="text/scss" lang="scss">
    @import "../scss/base/variables";
    @import "../scss/base/mixin";

    .timer {
        display: inline;
    }
</style>
