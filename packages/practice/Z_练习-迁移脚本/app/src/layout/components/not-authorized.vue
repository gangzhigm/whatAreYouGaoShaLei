<template>
    <div class="content-view margin padding white-bg">
        <inline-loading v-if="loading"/>
        <div class="not-authorized" v-else v-html="menuContent || defaultContent"></div>
    </div>
</template>
<script type="text/babel">
    import { PermitAllApi } from '@/api';

    export default {
        data() {
            return {
                loading: true,
                menuContent: '',
            };
        },
        computed: {
            defaultContent() {
                return this.$t('components.noAuthorized') + `【${this.$t(this.$route.meta.name)}】`
                    + this.$t('punctuation.comma') + this.$t('components.contactService');
            }
        },
        mounted() {
            const menu = this.$store.state.user.menus[this.$route.name]
                || this.$store.state.user.menus[this.$route.meta.auth];
            if (menu) {
                PermitAllApi
                    .getUnAuthorizedPreview(menu.id)
                    .then(({body: {data: {menuContent}}}) => {
                        this.menuContent = menuContent;
                        this.loading = false;
                    })
                    .catch(() => {
                        this.loading = false;
                    });
            }
        }
    };
</script>
