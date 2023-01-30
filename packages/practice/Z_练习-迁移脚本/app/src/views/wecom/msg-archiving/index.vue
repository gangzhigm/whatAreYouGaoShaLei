<template>
    <div class="msg-archiving">
        <div class="content-view">
            <crumbs :crumbs="crumbs" />
        </div>
        <div class="tab-links">
            <div class="content-view">
                <a class="tab-link" :class="{ 'router-link-active': curTab === 0 }" href="javaScript:void(0)"
                    @click="curTab = 0">
                    {{ 'home.msgArchiving' | t }}
                </a>
                <a class="tab-link" v-if="!$has('wecom_msg_archiving_config')"
                    :class="{ 'router-link-active': curTab === 1 }" href="javaScript:void(0)" @click="curTab = 1">
                    {{ 'home.msgArchivingConfig' | t }}
                </a>
            </div>
        </div>
        <msg-archiving-list class="content-view padding margin white-bg calc-height" v-if="curTab === 0" />
        <msg-archiving-config class="content-view padding margin white-bg calc-height" v-else />
    </div>
</template>

<script type="text/ecmascript-6">
import MsgArchivingList from './modules/msg-archiving-list.vue';
import MsgArchivingConfig from './modules/msg-archiving-config.vue';

export default {
    name: 'MsgArchiving', // 会话存档
    data () {
        return {
            curTab: 0 // 当前标签页0会话存档1配置
        };
    },
    computed: {
        crumbs () {
            const routes = [
                { name: 'index', text: 'Dmartech' },
                { name: 'msgArchiving', text: this.$t('home.msgArchiving') },
            ];
            if (this.curTab === 1) {
                routes.push({ text: this.$t('home.msgArchivingConfig') });
            }
            return routes;
        }
    },
    components: { MsgArchivingList, MsgArchivingConfig }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
.msg-archiving {
    .calc-height {
        overflow-y: auto;
        height: calc(100vh - 202px);
    }
}
</style>