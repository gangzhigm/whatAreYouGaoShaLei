<template>
    <div id="swiper">
        <div class="direction">
            <button class="btn left" :disabled="!(loop||currentIndex!==0)">
                <svg aria-hidden="true" ref="prev" class="prev" @click="move(defaultWidth, 1, speed)"
                    :class="{'icon-disable': !(loop||currentIndex!==0)}">
                    <use xlink:href="#icon-fanhui1"></use>
                </svg>
            </button>
            <button class="btn right" :disabled="!(loop||currentIndex<sliders.length-1)">
                <svg aria-hidden="true" ref="prev" class="prev" @click="move(defaultWidth, -1, speed)"
                    :class="{'icon-disable': !(loop||currentIndex<sliders.length-1)}">
                    <use xlink:href="#icon-fanhui"></use>
                </svg>
            </button>
        </div>
        <div class="window" :class="{'border':border}" :style="{width:defaultWidth+'px'}" @mouseover="stop"
            @mouseleave="play">
            <ul class="container" :style="containerStyle">
                <li :style="{width:defaultWidth+'px'}">
                    <img :src="sliders[sliders.length-1].picUrl" alt=""
                        @click="imgClick(sliders[sliders.length-1].picUrl)">
                </li>
                <li v-for="(item, index) in sliders" :key="index" :style="{width:defaultWidth+'px'}">
                    <img :src="item.picUrl" alt="" @click="imgClick(item.picUrl)">
                </li>
                <li :style="{width:defaultWidth+'px'}">
                    <img :src="sliders[0].picUrl" alt="" @click="imgClick(sliders[0].picUrl)">
                </li>
            </ul>
        </div>
    </div>
</template>

<script >
export default {
    name: 'Swiper',
    props: {
        //自动播放
        autoPlay: {
            type: Boolean,
            default: false,
        },
        //是循环播放
        loop: {
            type: Boolean,
            default: false,
        },
        //播放速度
        initialSpeed: {
            type: Number,
            default: 40
        },
        //自动播放的时间间隔
        initialInterval: {
            type: Number,
            default: 3
        },
        //轮播图列表
        sliders: {
            type: Array,
            default: () => {
                return [];
            }
        },
        //是否加边框
        border: {
            type: Boolean,
            default: false
        },
        defaultWidth: {
            type: Number,
            default: 600
        }
    },
    data () {
        return {
            currentIndex: 0,//当前选中的
            distance: -this.defaultWidth,//
            transitionEnd: true,//动画是否结束
            speed: this.initialSpeed,//播放速度
            temp: null//定时器
        };
    },
    computed: {
        containerStyle () {
            return {
                transform: `translate3d(${this.distance}px, 0, 0)`
            };
        },
        interval () {
            return this.initialInterval * 1000;
        }
    },
    mounted () {
        this.init();
    },
    methods: {
        init () {
            if (this.autoPlay) this.play();
        },
        /**
         * @param offset 移动距离
         * @param direction 1上一张 -1下一张
         * @param speed 动画速度
         */
        move (offset, direction, speed) {
            if (!this.transitionEnd) return;
            this.transitionEnd = false;
            direction === -1 ? this.currentIndex += offset / this.defaultWidth :
                this.currentIndex -= offset / this.defaultWidth;
            if (this.currentIndex > this.sliders.length - 1) this.currentIndex = 0;
            if (this.currentIndex < 0) this.currentIndex = this.sliders.length - 1;

            const destination = this.distance + offset * direction;
            this.animate(destination, direction, speed);
            this.$emit('move', this.currentIndex);
        },

        /**
         * 跳转到某一张图片的位置
         * @param index 索引
         */
        jump (index) {
            const direction = index - this.currentIndex >= 0 ? -1 : 1;
            const offset = Math.abs(index - this.currentIndex) * this.defaultWidth;
            const jumpSpeed = Math.abs(index - this.currentIndex) === 0 ? this.speed :
                Math.abs(index - this.currentIndex) * this.speed;
            this.move(offset, direction, jumpSpeed);
        },
        /**
         * 切换动画
         * @param des 图片整体偏移距离
         * @param direc 判断是切换到上一张还是下一张，1上一张 -1下一张
         * @param speed 播放速度
         */
        animate (des, direc, speed) {
            if (this.temp) {
                window.clearInterval(this.temp);
                this.temp = null;
            }
            this.temp = window.setInterval(() => {
                if ((direc === -1 && des < this.distance) || (direc === 1 && des > this.distance)) {
                    this.distance += speed * direc;
                } else {
                    this.transitionEnd = true;
                    window.clearInterval(this.temp);
                    this.distance = des;
                    if (des < -this.defaultWidth * this.sliders.length) this.distance = -this.defaultWidth;
                    if (des > -this.defaultWidth) this.distance = -this.defaultWidth * this.sliders.length;
                }
            }, 20);
        },
        //开启定时播放
        play () {
            if (!this.autoPlay) return;
            if (this.timer) {
                window.clearInterval(this.timer);
                this.timer = null;
            }
            this.timer = window.setInterval(() => {
                this.move(this.defaultWidth, -1, this.speed);
            }, this.interval);
        },
        //关闭定时器
        stop () {
            if (!this.autoPlay) return;
            window.clearInterval(this.timer);
            this.timer = null;
        },
        /**
         * 获取点击图片的url
         * @param 图片url
         */
        imgClick (url) {
            this.$emit('imgClick', url);
        }
    }
};
</script>

<style scoped lang="scss">
@import '../scss/base/variables';
@import '../scss/base/mixin';
#swiper {
    text-align: center;
    .window {
        position: relative;
        height: 400px;
        margin: 0 auto;
        overflow: hidden;
        cursor: pointer;
        & > ul {
            list-style: none;
            & > li {
                height: 400px;
                & > img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
            }
        }
        .container {
            display: flex;
            position: absolute;
        }
    }
    .border {
        border: 1px solid #ccc;
    }
    .direction {
        .left,
        .right {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 50px;
            height: 50px;
            font-size: 40px;
            color: $color-light-content;
            padding: 0;
            &:not([disabled]) {
                cursor: pointer;
                svg {
                    fill: $color-light-content;
                }
            }
            svg {
                width: inherit;
                height: inherit;
            }
        }
        .left {
            left: 0;
        }
        .right {
            right: 0;
        }
        .disabled {
            color: $disabled;
            pointer-events: none;
        }
    }
}
</style>