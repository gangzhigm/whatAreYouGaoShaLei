<template>
    <div class="wechat-sub-channels">
        <div class="wechat-folder" :class="{active: expand}" @click="$emit('toggle')">
            <span class="name">{{title}}</span>
            <i class="icon icon-fanhui start-back" :class="{active: expand}" />
        </div>
        <ul v-if="expand" class="wechat-msg-container">
            <!-- 微信素材列表 -->
            <template v-for="item in typesLib">
                <li v-if="types.includes(item.type)" class="label wechat-msg-type" :key="item.type"
                    :class="{ 'long-text': item.type === 5 && lang === 'en' }" @click="$emit('pick', item.type)">
                    {{ item.name }}
                    <i class="icon icon-fanhui start-back" />
                </li>
            </template>
        </ul>
    </div>
</template>
<script type="text/ecmascript-6">
import { I18N_STORE_NAME } from '@/locales';
import { mapState } from 'vuex';

export default {
    name: 'WechatSubChannels',
    props: {
        // 抽屉title
        title: {
            type: String,
            default: '',
            require: true
        },
        // 面板是否折叠
        expand: {
            type: Boolean,
            default: false
        },
        types: {
            type: Array,
            default: () => [5, 4, 1, 2, 3]
        }
    },
    computed: {
        //语言状态
        ...mapState({
            lang: state => state[I18N_STORE_NAME].lang
        })
    },
    data () {
        return {
            typesLib: [
                { type: 5, name: this.$t('QRCode.appMsg') }, //图文
                { type: 4, name: this.$t('QRCode.text') }, //文本
                { type: 1, name: this.$t('QRCode.pics') }, //图片
                { type: 2, name: this.$t('QRCode.audio') }, //语音
                { type: 3, name: this.$t('QRCode.video') }, //视频
                { type: 6, name: this.$t('QRCode.webPage') }, //外部页
                { type: 7, name: this.$t('QRCode.form') }, //表单
                { type: 8, name: this.$t('wechatContent.miniCard') }, //小程序卡片
            ]
        };
    }
};
</script>
<style lang="scss">
@import 'wechat-sub-channels';
</style>