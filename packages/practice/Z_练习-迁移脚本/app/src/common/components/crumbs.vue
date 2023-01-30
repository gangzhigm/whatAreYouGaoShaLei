<template>
    <div class="crumbs">
        <sidebar-collapser />
        <template v-for="(route, count) in routes">
            <!-- eslint-disable-next-line -->
            <router-link :to="route" v-text="route.text"/>
            <template v-if="count !== routes.length - 1">&nbsp;/&nbsp;</template>
        </template>
    </div>
</template>
<script>
    import SidebarCollapser from '../components/group-tree/sidebar-collapser.vue';
    export default {
        name: 'crumbs',
        props: {
            /**
             * [
             *     {name: 'event', text: '事件分析'},
             *     {name: 'attribute', text: '属性分析'}
             * ]
             */
            crumbs: [Array, String]
        },
        computed: {
            routes() {
                return (this.crumbs || this.$route.matched)
                    .map((route, index) => ({
                        name: route.name,
                        // 面包屑的第一个链接是{path: '/', text: 'Dmartech '}，不需要翻译
                        text: 'text' in route
                            ? route.text
                            : (index === 0 ? route.meta.name : this.$t(route.meta.name)),
                        ...route
                    }));
            }
        },
        components: { SidebarCollapser }
    };
</script>
<style lang="scss" type="text/scss">
    @import "../scss/base/variables";
    @import "../scss/base/mixin";

    .crumbs {
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        line-height: $toolbar-height;
        max-width: 100%;
        cursor: default;
        @include user-select(none);

        a {
            max-width: 24em;
            @include ellipsis;
            color: $color-light-content;
            @include transition(color .1s linear);

            &:hover {
                color: $color-content;
                text-decoration: underline;
            }

            &:last-of-type {
                color: $color-content;
                font-weight: bold;
            }
        }

    }

</style>
