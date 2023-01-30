<template>
    <div class="wechat-controller" :class="{'custom-controller': wechatController.service}"
         :title="wechatController.title">
        <svg aria-hidden="true">
            <use v-bind:xlink:href="'#' + wechatController.icon"></use>
        </svg>
    </div>
</template>

<script type="text/ecmascript-6">
    import {WECHAT_CONTROLLER} from '../../CONTROLLER_TYPES';

    export default {
        name: WECHAT_CONTROLLER,
        props: {
            controller: Object
        },
        computed: {
            wechatController() {
                // {service:是否客服消息，title:消息类型，icon:图标}
                switch (this.controller.pushInfo.wechatType) {
                    case 'service': // 客服消息-图文
                        return {service: true, title: this.$t('dragJourney.wechatMessages'), icon: 'icon-tuwen'};
                    case 'picText': // 群发消息-图文
                        return {service: false, title: this.$t('dragJourney.massSend'), icon: 'icon-tuwen'};
                    case 'pics':    // 客服消息-图片
                        return {service: true, title: this.$t('dragJourney.wechatMessages'), icon: 'icon-image'};
                    case 'mdPics':  // 群发消息-图片
                        return {service: false, title: this.$t('dragJourney.massSend'), icon: 'icon-image'};
                    case 'audio':   // 客服消息-音频
                        return {service: true, title: this.$t('dragJourney.wechatMessages'), icon: 'icon-audio'};
                    case 'mdAudio': // 群发消息-音频
                        return {service: false, title: this.$t('dragJourney.massSend'), icon: 'icon-audio'};
                    case 'video':   // 客服消息-视频
                        return {service: true, title: this.$t('dragJourney.wechatMessages'), icon: 'icon-shipin'};
                    case 'mdVideo': // 群发消息-视频
                        return {service: false, title: this.$t('dragJourney.massSend'), icon: 'icon-shipin'};
                    case 'sheet':   // 客服消息-文本
                        return {service: true, title: this.$t('dragJourney.wechatMessages'), icon: 'icon-wenben'};
                    case 'mdSheet': // 群发消息-文本
                        return {service: false, title: this.$t('dragJourney.massSend'), icon: 'icon-wenben'};
                    case 'external': // 客服消息-外部页
                        return {service: true, title: this.$t('dragJourney.wechatMessages'), icon: 'icon-wangyekuang'};
                    case 'form':     // 客服消息-表单
                        return {service: true, title: this.$t('dragJourney.wechatMessages'), icon: 'icon-biaodan1'};
                    case 'miniProgramCard': // 客服消息-表单
                        return {service: true, title: this.$t('dragJourney.wechatMessages'), icon: 'icon-xiaochengxu1'};
                    case 'template': // 模板消息
                        return {service: false, title: this.$t('dragJourney.wechatTemplates'), icon: 'icon-tixing'};
                    default :
                        return {service: false, title: '', icon: 'icon-wechat'};
                }
            }
        }
    };
</script>
<style lang="scss">
    @import "../../../../../../common/scss/base/variables";

    .wechat-controller {
        background-color: #00b000;

        svg {
            width: 42px;
            height: 42px;
            fill: white;
        }

        &.custom-controller {
            background-color: #01d18e;
        }
    }
</style>
