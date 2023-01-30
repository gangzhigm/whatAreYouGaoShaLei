<template>
    <div class="ent-broadcast-preview">
        <img src="./img/preview.png">
        <ul class="preview-content">
            <li v-for="(l,index) in list">
                <div class="head-portrait" v-if="l.msgtype===type[0]&&l.text.content"></div>
                <div class="head-portrait" v-else-if="l.msgtype===type[1]&&l.image.media_id"></div>
                <div class="head-portrait" v-else-if="l.msgtype!==type[0]&&l.msgtype!==type[1]"></div>
                <!-- 文字 -->
                <div :class="[l.msgtype, 'msg']" v-if="l.msgtype===type[0]&&l.text.content">
                    <p class="text-warp" :v-title="l.text.content">{{l.text.content}}</p>
                </div>
                <!-- 图片 -->
                <div :class="[l.msgtype, 'msg']" v-if="l.msgtype===type[1]&&l.image.media_id">
                    <img :src="l.image.media_id" :id="'image'+index" @load="imageLoaded($event,index,225,118)">
                </div>
                <!-- 链接 -->
                <div :class="[l.msgtype, 'msg']" @click="open(l.link.url)" v-if="l.msgtype===type[2]">
                    <b>{{l.link.title}}</b>
                    <div class="link-p">
                        <span>{{l.link.desc}}</span>
                        <div class="img">
                            <img v-if="l.link.picurl" :src="l.link.picurl" :id="'image'+index"
                                @load="imageLoaded($event,index,30,30)" />
                        </div>
                    </div>
                </div>
                <!-- 小程序 -->
                <div :class="[l.msgtype, 'msg']" v-if="l.msgtype===type[3]">
                    <p>
                        <img src="./img/wp.png">
                        <b>webpower</b>
                    </p>
                    <span>{{l.miniprogram.title}}</span>
                    <div v-if="l.miniprogram.pic_media_id" class="img">
                        <img :src="l.miniprogram.pic_media_id" :id="'image'+index"
                            @load="imageLoaded($event,index,225,118)" />
                    </div>

                </div>
            </li>
        </ul>
    </div>
</template>
<script>

export default ({
    name: 'EntBroadcastPreview',
    props: {
        attachments: {
            type: Array,
            defalut: []
        },
        sendContent: {
            type: String,
            defalut: ''
        }
    },
    computed: {
        list () {
            let list = this.attachments;
            if (this.sendContent) {
                const content = [{
                    msgtype: 'text',
                    text: {
                        content: this.sendContent
                    }
                }];
                list = [...content, ...this.attachments];
            }
            return list;
        }
    },
    data () {
        return {
            type: ['text', 'image', 'link', 'miniprogram']
        };
    },
    methods: {
        //链接跳转
        open (url) {
            window.open(url, '_blank');
        },
        // 图片等比例缩放，未填充部分用#FFFFFF显示
        imageLoaded (e, i, width, height) {
            const h = e.target.naturalHeight;
            const w = e.target.naturalWidth;
            let imgH = 0;
            let imgW = 0;
            if (h > height) {
                imgH = height;
                imgW = w / (h / height);
            } else {
                imgW = width;
                imgH = h / (w / width);
            }
            document.getElementById(`image${i}`).style.height = imgH + 'px';
            document.getElementById(`image${i}`).style.width = imgW + 'px';
        }
    },
});
</script>
<style lang='scss'>
$width: 225px;
$height: 118px;
@mixin imageSet() {
    width: 100%;
    margin: 0 auto;
    display: table;
}
@mixin overflowHidden($index) {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: $index;
    overflow: hidden;
}

.ent-broadcast-preview {
    position: relative;
    width: 350px;
    height: 734px;
    > img {
        width: 100%;
    }
    .preview-content {
        position: absolute;
        background: #f5f5f5;
        top: 165px;
        left: 30px;
        right: 26px;
        bottom: 110px;
        overflow-y: auto;
        padding: 10px;
        > li {
            margin-top: 10px;
            display: flex;
            justify-content: space-between;
            .head-portrait {
                background: url('./img/wp.png') no-repeat center;
                background-size: 30px;
                width: 30px;
                height: 30px;
            }
            .msg {
                width: $width;
                border: 1px solid #bbb;
                background: #fff;
                > img {
                    width: 100%;
                }
            }
            .text {
                padding: 10px;
                width: 205px;
            }
            .image {
                width: $width;
                height: $height;
                overflow: hidden;
                > img {
                    @include imageSet;
                }
            }
            .link {
                display: flex;
                flex-direction: column;
                padding: 10px;
                width: 205px;
                cursor: pointer;
                b {
                    @include overflowHidden(1);
                }
                .link-p {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                    > .img {
                        width: 30px;
                        height: 30px;
                        overflow: hidden;
                        img {
                            @include imageSet;
                        }
                    }
                    > span {
                        width: 170px;
                        @include overflowHidden(2);
                    }
                }
            }
            .miniprogram {
                display: flex;
                flex-direction: column;
                width: $width;
                > p {
                    padding: 10px 10px 0 10px;
                    display: flex;
                    > img {
                        width: 15px;
                        height: 15px;
                        margin-right: 10px;
                    }
                    b {
                        font-weight: normal;
                    }
                }
                span {
                    padding: 0 10px;
                    margin: 10px 0;
                    @include overflowHidden(2);
                }
                > .img {
                    width: $width;
                    height: $height;
                    background: #fff;
                    overflow: hidden;
                    img {
                        @include imageSet;
                    }
                }
            }
        }
        .text-warp{
            white-space: pre-wrap;
        }
    }
}
</style>