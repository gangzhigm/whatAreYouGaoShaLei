<template>
    <modal :title="$t('journeyList.journeyBuildCase')" size='lg' @close="close" class="building-solutions-modal"
        :scrolls="scrollType">
        <!-- 父级tab -->
        <building-solutions-tabs :tabList="tabList" @active="active" v-if="tabList.length>0" />
        <!-- 父级tab  end -->

        <!-- 子级tab -->
        <building-solutions-tabs :isBlock="true" class="child-tabs" :tabList="tabChildList" v-if="tabChildList.length>0"
            @active="activeChild" :key="tabKeyIndex" />
        <!-- 子级tab end-->

        <!-- 轮播图 -->
        <div class="swiper" v-if="checkImg&&type!=='other'&&imageTextList.length>0">
            <swiper @move="move" ref="swiper" :sliders="imageTextList" @imgClick="imgClick" border :key="keyIndex"
                :defaultWidth="712" />
        </div>
        <!-- 轮播图 end-->
        <!-- 视频 start-->
        <div class="build-video" v-if="checkVideo&&type!=='other'">
            <video class="video" controls ref="video">
                <source :src="videoList[0].videoUrl" type="video/mp4">
                <source :src="videoList[0].videoUrl" type="video/webm">
                <source :src="videoList[0].videoUrl" type="video/ogg">
            </video>
        </div>
        <!-- 视频 end-->

        <!-- 敬请期待 -->
        <div v-if="imageTextList.length===0&&videoList.length===0&&load" class="expect">
            <img v-if="lang==='zh-CN'" src="./coming_soon_cn.png">
            <img v-else src="./coming_soon_en.png">
        </div>
        <div class="expect" v-if="loading">
            <inline-loading />
        </div>
        <!-- 敬请期待end -->

        <!-- 模块引导标题 -->
        <div class="build-steer" v-if="type!=='other'&&videoList.length>0">
            <h3>{{'journeyList.buildingTeach' | t}}</h3>
            <p>{{'journeyList.clickTeach' | t}}</p>
        </div>
        <!-- 其他场景 -->
        <div class="other" v-if="type==='other'" @click="enlargeShow=false">
            <img :src="imageTextList[0].picUrl" alt="">
            <p>{{'journeyList.moreScenarioSolutions' | t}}</p>
            <p>{{'journeyList.youCanAddBusinessForProfessionalGuidance' | t}}</p>
        </div>
        <!-- 其他场景end -->

        <!-- 底部轮播图 -->
        <div class="swiper-bottom" v-if="type!=='other'">
            <min-carousel :buildTitle="$t('journeyList.video')" :imageList="videoList" :imgNum="1"
                v-if="videoList.length>0" class="min-carousel" :isCheck="checkVideo" @handleClickImg="jumpVideoClick"
                :carouselType="'video'" :jumpUrl="jumpVideo" :key="keyIndex" ref="minVideo" />

            <min-carousel :buildTitle="$t('journeyList.graphic')" class="min-carousel" @handleClickImg="jumpImgClick"
                ref="minCarousel" :imageList="imageTextList" :key="'minCarousel'+keyIndex"
                :imgNum="imageTextList.length >= 3 ? 3 : imageTextList.length" :carouselType="'img'"
                v-if="imageTextList.length > 0" :isCheck="checkImg" :jumpUrl="jumpMoreImg" />
        </div>

        <!-- 底部轮播图 end-->

        <!-- 点击放大图片 -->
        <div class="enlarge" v-if="enlargeShow" @click="closeEnlarge">
            <img :src="enlargeUrl" alt="">
        </div>
    </modal>
</template>
<script>
import BuildingSolutionsTabs from './components/building-solutions-tabs.vue';
import MinCarousel from './components/min-carousel.vue';
import { JourneyApiV3 } from '@/api';
import { I18N_STORE_NAME } from '@/locales';
import { mapState } from 'vuex';

export default {
    name: 'BuildingSolutionsModal',
    data () {
        return {
            jumpMoreImg: {
                name: this.$t('journeyList.clickGraphic'),
                url: 'https://doc.dmartech.cn/dmartech-an-li/b2b-hang-ye'
            },//跳转更多图片
            jumpVideo: {
                name: this.$t('journeyList.clickVideo'),
                url: ''
            },
            checkImg: true, // 图片类型轮播小组件是否选中
            checkVideo: false, // 视频类型轮播小组件是否选中
            isShow: false,
            videoList: [],
            tabList: [],
            tabChildList: [],
            imageTextList: [],
            enlargeShow: false,//放大图片的遮罩是否显示
            enlargeUrl: '',
            scrollType: true,
            keyIndex: 0,
            tabKeyIndex: 0,
            type: '',//场景类型： other 其他场景 normal 正常场景
            load: false,//请求完成
            loading: false,
        };
    },
    computed: {
        ...mapState({
            //语言状态
            lang: state => state[I18N_STORE_NAME].lang
        }),
    },
    methods: {
        close () {
            this.$emit('closeModal');
        },
        renderVideo (i) {
            this.videoList = this.tabChildList[i].videoList;
            this.jumpVideo.url = this.tabChildList[i].videoList.length === 0 ? '' : this.tabChildList[i].videoList[0].videoUrl;
        },
        //加载子级tab
        loadChildTab () {
            const index = this.tabList.findIndex(e => { return e.active });
            this.tabList[index].sceneList.forEach((e, i) => {
                this.tabChildList.push({
                    name: e.sceneName,
                    active: i === 0,
                    videoList: e.videoList,
                    imageTextList: e.imageTextList,
                    type: e.type
                });
            });
            this.imageTextList = this.tabChildList[0].imageTextList;
            this.renderVideo(0);
        },
        //获取旅程弹窗列表
        getConstructions () {
            this.loading = true;
            JourneyApiV3.getConstruction()
                .then((res) => {
                    this.loading = false;
                    res.body.data.industryList.forEach((e, i) => {
                        this.load = true;
                        this.tabList.push({
                            name: e.industryName,
                            active: i === 0,
                            sceneList: e.sceneList
                        });

                    });
                    this.loadChildTab();
                    // 对于极端情况下所作的处理
                    if (res.body.code === 500) {
                        this.loading = false;
                        this.$toast(this.$t('controller.noData'), 'warn');
                    }
                });
        },
        //小轮播图的点击事件触发上面轮播图的点击事件
        jumpImgClick (index) {
            this.checkImg = true;
            this.checkVideo = false;
            this.$nextTick(() => {
                this.$refs.swiper.jump(index);
            });
        },
        // 点击视频类型底部轮播小组件
        jumpVideoClick () {
            this.checkImg = false;
            this.checkVideo = true;
            this.$nextTick(() => {
                let video = this.$refs.video;
                let minVideo = this.$refs.minVideo;
                let that = this;
                // 视频暂停
                video.addEventListener('pause', function () {
                    minVideo.playVideo(false);
                });
                // 视频播放
                video.addEventListener('play', function () {
                    minVideo.playVideo(true);
                });
                // 视频播放结束
                video.addEventListener('ended', function () {
                    minVideo.playVideo(false);
                });
                // 视频播放总时长
                video.addEventListener('canplay', function () {
                    let allTime = Math.floor(this.duration);
                    minVideo.totalTime(that.timeToMinute(allTime));
                });
                // 视频播当前时长
                video.addEventListener('timeupdate', function () {
                    let currentTimes = Math.floor(this.currentTime);
                    minVideo.currentTime(that.timeToMinute(currentTimes));
                });
            });
        },
        // 转换时间格式
        timeToMinute (times) {
            let t;
            if (times > -1) {
                let hour = Math.floor(times / 3600);
                let min = Math.floor(times / 60) % 60;
                let sec = times % 60;
                if (hour < 10) {
                    t = '0' + hour + ':';
                } else {
                    t = hour + ':';
                }
                if (min < 10) { t += '0' }
                t += min + ':';
                if (sec < 10) { t += '0' }
                t += sec.toFixed(2);
            }
            t = t.substring(0, t.length - 3);
            return t;
        },
        //轮播图点击事件触发下面小轮播图的点击事件
        move (index) {
            this.$refs.minCarousel.changeImg(index);
        },
        tabChange () {
            this.keyIndex += 1;
            this.checkImg = true;
            this.checkVideo = false;
        },
        //父级tab点击事件
        active (i) {
            this.tabKeyIndex += 1;
            this.tabChange();
            this.tabChildList = [];
            this.tabList[i].sceneList.forEach((e, i) => {
                this.tabChildList.push({
                    name: e.sceneName,
                    active: i === 0,
                    videoList: e.videoList,
                    imageTextList: e.imageTextList,
                    type: e.type
                });
            });

            this.imageTextList = this.tabChildList.length !== 0 ? this.tabChildList[0].imageTextList : [];
            this.type = this.tabChildList.length !== 0 ? this.tabChildList[0].type : '';
            this.tabChildList.length !== 0 ? this.renderVideo(0) : this.videoList = [];
        },
        //父级tab点击事件
        activeChild (i) {
            this.tabChange();
            this.imageTextList = this.tabChildList[i].imageTextList;
            this.type = this.tabChildList[i].type;
            if (this.tabChildList[i].type !== 'other') this.renderVideo(i);
        },
        //点击轮播图放大
        imgClick (url) {
            this.enlargeUrl = url;
            this.scrollType = false;
            this.enlargeShow = true;
        },
        // 点击大图关闭
        closeEnlarge () {
            this.scrollType = true;
            this.enlargeShow = false;
        }
    },
    created () {
        this.getConstructions();
    },
    components: {
        BuildingSolutionsTabs,
        MinCarousel,
    }
};
</script>
<style lang="scss">
@import '../../../common/scss/base/variables';
@import '../../../common/scss/base/mixin';
.building-solutions-modal {
    .modal-content {
        margin: 24px 13px;
        padding: 0;

        .child-tabs {
            margin: 10px 23px;
            width: calc(100% - 60px);
        }
        .swiper {
            position: relative;
            width: 824px;
            height: 400px;
            margin: 10px auto;
        }
        .other {
            width: 560px;
            margin: 10px auto;
            justify-content: center;
            flex-direction: column;
            img {
                object-fit: contain;
                display: flex;
                margin: 0 auto;
                width: inherit;
            }
            p {
                width: 100%;
                text-align: center;
                margin-top: 10px;
            }
        }
        .expect {
            width: 800px;
            height: 500px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto;
            img {
                width: 50%;
            }
        }
        // 视频样式
        .build-video {
            width: 100%;
            height: 400px;
            display: flex;
            justify-content: center;
            align-items: center;
            .video {
                width: 712px;
                height: 400px;
                margin: 10px auto;
            }
        }
        // 引导文字样式
        .build-steer {
            margin: 20px 0 0 20px;
            display: flex;
            justify-content: flex-start;
            p {
                margin: 5px;
            }
        }
        // 底部轮播样式
        .swiper-bottom {
            margin-left: 20px;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            .min-carousel {
                margin: 5px;
            }
        }
        .enlarge {
            position: fixed;
            left: 0;
            right: 0px;
            top: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            justify-content: center;
            display: flex;
            z-index: 1;
            & > img {
                object-fit: contain;
            }
        }
    }
}
</style>