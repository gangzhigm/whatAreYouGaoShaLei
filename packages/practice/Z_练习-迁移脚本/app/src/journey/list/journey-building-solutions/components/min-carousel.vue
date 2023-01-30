
<template>
    <div class="min-carousel">
        <!-- 需要外部传进来名称 -->
        <h5 class="build-title">{{buildTitle}}</h5>
        <div class="carousel-box">
            <!-- 左侧按钮，当图片数量大于展示出来的图片数量时展示 -->
            <button class="svg-icon btn" v-if="imageList.length !== imgNum" :disabled="currentIndex === 0">
                <svg aria-hidden="true" ref="prev" class="prev" @click="changeImg('prev')"
                    :class="{'icon-disable': currentIndex === 0}">
                    <use xlink:href="#icon-fanhui1"></use>
                </svg>
            </button>
            <!-- 中间展示区域 -->
            <div class="build-containter" :style="{'--width': width, '--overflow': overflow}">
                <div class="mini-box" :class="{ 'active-box': index === currentIndex && isCheck }"
                    v-for="(item, index) in imageList" ref="img" :key="index" @click="changeImg(index)"
                    :id="'id' + index">
                    <div v-if="carouselType === 'img'" :class="{ 'active-circle': index === currentIndex && isCheck}"
                        class="circle">{{index > 0 ? index : '介'}}</div>
                    <div v-if="carouselType === 'video'" class="circle-icon">
                        <svg aria-hidden="true">
                            <use v-if="isPlay" xlink:href="#icon-pause"></use>
                            <use v-if="!isPlay" xlink:href="#icon-kaishi"></use>
                        </svg>
                    </div>
                    <p v-if="carouselType === 'video'" class="circle-time">{{currnetTimes}}/{{allTime}}</p>
                    <!-- 图片地址后期需要优化 -->
                    <img class="img-box" :src="item.picUrl" alt="">
                </div>
            </div>
            <!-- 右侧按钮，当图片数量大于展示出来的图片数量时展示 -->
            <button class="svg-icon btn" v-if="imageList.length !== imgNum"
                :disabled="currentIndex === imageList.length - 1">
                <svg aria-hidden="true" ref="next" class="next" @click="changeImg('next')"
                    :class="{'icon-disable': currentIndex === imageList.length - 1}">
                    <use xlink:href="#icon-fanhui"></use>
                </svg>
            </button>
            <!-- 跳转外部链接 -->
            <a :href="jumpUrl.url" target="_blank" v-if="jumpUrl.url" class="image-href">{{jumpUrl.name}}</a>
        </div>
    </div>
</template>
<script>
export default {
    name: 'MinCarousel',
    props: {
        buildTitle: { // 轮播组件的标题
            type: String,
            default: ''
        },
        imageList: {
            type: Array, // 传入的图片及视频列表
            default: []
        },
        carouselType: {
            type: String, // 类型分为video、img
            default: 'img'
        },
        isCheck: {
            type: Boolean, //是否选中该组件（如果同时使用两个及以上此组件在一个页面内，此属性最多只能有一个为true）
            default: true
        },
        jumpUrl: { // 跳转所需要的链接及链接名称
            type: Object,
            default: () => {
                return {};
            }
        },
        /**
         * 所需要展示的图片数量，图片宽为150px，margin左右为10px， 和为170px
         * 1000px弹窗最多展示五张（旅程列表弹窗所需三张），其余情况下根据父级盒子宽度自行定义
        */
        imgNum: {
            type: Number,
            default: 3
        }
    },
    data () {
        return {
            currentIndex: 0,
            isPlay: false, //播放状态
            allTime: '00:00:00', //视频播放总时长
            currnetTimes: '00:00:00' // 视频播放当前时长
        };
    },
    computed: {
        // 动态样式
        width () {
            return (160 * this.imgNum) + 'px';
        },
        overflow () {
            if (this.imageList.length <= this.imgNum) {
                return 'hidden';
            }
            return 'auto';
        }
    },
    methods: {
        // 切换图片事件
        changeImg (val) {
            if (this.carouselType === 'img') {
                if (val === 'prev') {
                    this.currentIndex -= 1;
                } else if (val === 'next') {
                    this.currentIndex += 1;
                } else {
                    this.currentIndex = val;
                }
                this.$emit('handleClickImg', this.currentIndex);
                this.$refs.img[this.currentIndex].scrollIntoView({block: 'nearest'});
            }
            if (this.carouselType === 'video') {
                this.$emit('handleClickImg', this.imageList[this.currentIndex]);
            }
        },
        // 播放状态事件
        playVideo (type) {
            this.isPlay = type;
        },
        // 视频播放总时长
        totalTime (time) {
            this.allTime = time;
        },
        // 视频当前播放时长
        currentTime (time) {
            this.currnetTimes = time;
        }
    }
};

</script>
<style lang="scss">
@import '../../../../common/scss/base/variables';
@import '../../../../common/scss/base/mixin';
.min-carousel {
    width: fit-content;
    height: 150px;
    box-shadow: $form-border 0px 0px 10px 1px;
    border-radius: 5px;
    .build-title {
        padding: 10px 0 0 10px;
        font-weight: bold;
    }
    .carousel-box {
        display: flex;
        .svg-icon {
            margin-top: 50px;
            height: 30px;
            padding: 0;
            svg {
                width: 30px;
                height: 30px;
            }
            &:not([disabled]) {
                cursor: pointer;
                svg {
                    fill: $color-light-content;
                }
            }
        }
        .build-containter {
            overflow-x: var(--overflow);
            overflow-y: hidden;
            width: var(--width);
            display: flex;
            flex-wrap: nowrap;
            padding: 10px;
            .mini-box {
                position: relative;
                box-sizing: border-box;
                float: left;
                width: 172px;
                height: 92px;
                border: 1px solid #ccc;
                margin: 0 7px;
                cursor: pointer;
                .img-box {
                    width: 160px;
                    height: 90px;
                    object-fit: contain;
                }
            }
            .circle {
                position: absolute;
                top: 5px;
                left: 5px;
                width: 20px;
                height: 20px;
                background: $disabled;
                color: black;
                text-align: center;
                line-height: 20px;
                border-radius: 50%;
            }
            .circle-icon {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                svg {
                    width: 30px;
                    height: 30px;
                    fill: $disabled;
                }
            }
            .circle-time {
                position: absolute;
                right: 5px;
                bottom: 1px;
                z-index: 1;
                color: $color-light-content;
            }
            .active-circle {
                background: $green;
                color: white;
            }
            .active-box {
                border-color: $green;
                transform: scale(1.1, 1.1);
            }
        }
    }
    .image-href {
        width: 76px;
        height: 60px;
        margin-top: 50px;
        color: $blue;
        cursor: pointer;
        padding: 0 10px;
    }
}
</style>