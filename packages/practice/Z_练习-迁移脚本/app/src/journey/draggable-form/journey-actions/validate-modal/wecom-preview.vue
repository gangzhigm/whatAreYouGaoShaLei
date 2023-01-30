<template>
    <modal class="wecom-preview-modal" v-if="subType" :title="subType === 14 ? $t('dragJourney.agentmsg') : $t('dragJourney.groupmsg')" @close="close">
        <div class="wecom-preview-modal-content">
            <ul>
                <!-- 素材列表预览 -->
                <li v-for="(con,index) in taskInfoList" :key="index">
                    <div class="con-text" v-if="con.msgtype === 'text'">{{con.text.content}}</div>
                    <div class="con-image" v-if="con.msgtype === 'image'">
                        <img :src="con.image.media_id || defaultImage">
                    </div>
                    <a class="con-link" v-if="con.msgtype === 'link'" :href="con.link.url" target="_blank">
                        <div class="con-link-title">{{con.link.title}}</div>
                        <div class="con-link-desc">
                            <span>{{con.link.desc}}</span>
                            <img :src="con.link.picurl || defaultImage">
                        </div>
                    </a>
                    <div class="con-miniprogram" v-if="con.msgtype === 'miniprogram'">
                        <h6>{{'wechatContent.miniProgram' | t}}{{'wechatContent.title' | t}}</h6>
                        <p>{{con.miniprogram.title}}</p>
                        <h6>{{'wechatContent.appid' | t}}</h6>
                        <p>{{con.miniprogram.appid}}</p>
                        <h6>{{'wechatContent.appPath' | t}}</h6>
                        <p>{{con.miniprogram.page}}</p>
                        <h6>{{'wechatContent.cover' | t}}</h6>
                        <div class="con-image">
                            <img :src="con.miniprogram.pic_media_id || defaultImage">
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </modal>
</template>

<script type="text/ecmascript-6">
    import defaultImage from './validate-bg.png';

    export default {
        props: {
            taskInfoList: Array,
            subType: {  // 任务类型： 14应用消息 15企业群发
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                defaultImage: defaultImage
            };
        },
        methods: {
            close() {
                this.$emit('close');
            }
        }
    };
</script>
<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .wecom-preview-modal {
        .modal-content {
            max-height: 500px;
            overflow-y: scroll;
            .wecom-preview-modal-content {
                width: 300px;
                margin: 0 auto;
                ul {
                    li {
                        width: 100%;
                        margin: 15px 0;
                        .con-text {
                            padding: 0 10px;
                            white-space: pre-wrap;
                            border-radius: 4px;
                            background-color: #C6E5FF;
                        }
                        .con-image{
                            display: flex;
                            align-items: center;
                            width: 270px;
                            height: 163px;
                            margin: 0 auto;
                            border: 1px solid #cccccc;
                            img {
                                max-width: 100%;
                                max-height: 100%;
                                margin: 0 auto;
                            }
                        }
                        .con-link{
                            display: block;
                            height: 90px;
                            color: $color-content;
                            padding: 0 10px;
                            border: 1px solid #cccccc;
                            border-radius: 4px;
                            .con-link-title {
                                display: -webkit-box;
                                text-overflow: ellipsis;
                                -webkit-box-orient: vertical;
                                -webkit-box-pack: center;
                                -webkit-line-clamp: 2;
                                line-height: 20px;
                                overflow: hidden;
                            }
                            .con-link-desc {
                                span {
                                    float: left;
                                    width: 230px;
                                    color: #AAAAAA;
                                    display: -webkit-box;
                                    text-overflow: ellipsis;
                                    -webkit-box-orient: vertical;
                                    -webkit-box-pack: center;
                                    -webkit-line-clamp: 3;
                                    line-height: 16px;
                                    overflow: hidden;
                                }
                                img {
                                    width: 40px;
                                    height: 40px;
                                    margin: 3px 0 0 5px;
                                }
                            }
                        }
                        .con-miniprogram {
                            padding: 10px;
                            border: 1px solid #cccccc;
                            border-radius: 4px;
                        }
                    }
                }
            }
        }
    }
</style>
