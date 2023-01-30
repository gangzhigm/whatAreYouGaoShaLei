<template>
    <div class="content-view margin">
        <ul class="content-tabs">
            <li v-for="tab in tabList"
                class="content-tab grey"
                :class="{'active': tab.routeName === select}" @click="updateRouterHander(tab)">
                {{tab.name}}
            </li>
        </ul>
        <router-view/>
    </div>
</template>
<script type="text/babel">
    import {translate as t} from '@/locales';

    // tab 列表
    const tabList = [
        {name: t('massSend.massSend'), routeName: 'groupMessage'},
        {name: t('massSend.serviceMessage'), routeName: 'customerMassage'},
        {name: t('massSend.templateMessage'), routeName: 'templateMassage'}
    ];
    export default {
        data() {
            return {
                tabList,
                select: 'groupMessage', // 选中的 tab
            };
        },
        methods: {
            // 更新路由
            updateRouterHander(tab) {
                this.select = tab.routeName;
                this.$router.push({name: tab.routeName});
            }
        },
        created() {
            this.select = this.$route.name;
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .btn-box {
        padding: 0 !important;
        margin-bottom: 30px;
        border: solid 1px $border-color;
        display: inline-block;

        .btn-md {
            width: 120px;
            color: $color-title;
        }
        .router-link-active {
            background-color: $dark-green;
            color: $title-bg;
            border-radius: 0;
        }
    }
</style>
