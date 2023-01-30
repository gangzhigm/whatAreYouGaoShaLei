<template>
    <div class="page-head">
        <div class="content-view">
            <h1>{{'home.hwOss' | t}}</h1>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import { GeteOriginApi } from '@/api';

    const TYPE = 'hwoss'; // 华为oss下载type
    const ENV = process.env.NODE_ENV;

    export default {
        name: 'hw-oss',
        data() {
            return {
                timer: null,
            };
        },
        computed: {
            user() {
                return this.$store.state.user;
            },
        },
        created() {
            if (!this.user) this.$router.replace({name: 'login'});
        },
        mounted() {
            switch (ENV) {
                case 'development':
                case 'beta':
                    if (this.user.companyType === 1 && this.user.cid === 381) {
                        this.fetchHwOssUrl();
                    } else {
                        this.$router.push({name: 'home', params: {come: 'hwOss'}}); // 已登录的非华为账号
                    }
                    break;
                case 'production':
                    // cid=471为生产环境内部测试用
                    if (this.user.companyType === 1 && (this.user.cid === 1260 || this.user.cid === 471)) {
                        this.fetchHwOssUrl();
                    } else {
                        this.$router.push({name: 'home', params: {come: 'hwOss'}}); // 已登录的非华为账号
                    }
                    break;
            }
        },
        methods: {
            // 获取oss url
            fetchHwOssUrl() {
                let type = this.$route.query.type;
                let uuid = this.$route.query.uuid;
                if (!type) {
                    this.$toast(this.$t('home.noType'), 'warn');
                    return false;
                } else if (type !== TYPE) {
                    this.$toast(this.$t('home.typeErr'), 'warn');
                    return false;
                }

                if (!uuid) {
                    this.$toast(this.$t('home.noUuid'), 'warn');
                    return false;
                }

                GeteOriginApi
                    .getHwOosUrl(type, uuid)
                    .then(res => {
                        let a = document.createElement('a');
                        a.href = res.body.data.ossUrl;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);

                        this.timer = setTimeout(() => {
                            this.$router.push({name: 'home'});
                        }, 5000);
                    });

            },
        },
        beforeDestroy() {
            clearTimeout(this.timer);
        }
    };
</script>
