<template>
    <div class="block-empty">
        <img v-if="search" src="./no-result.png" alt="">
        <img v-else src="./no-data.png" alt="">
        <p class="no-data-msg">{{text}}</p>
    </div>
</template>
<script type="text/babel">
    export default {
        name: 'block-empty',
        props: {
            /**
             * 是否搜索结果为空
             * true 代表搜索结果为空，false 代表没有搜索时无数据，两种状态展示的图片不同
             */
            search: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            text() {
                return this.search ? this.$t('common.noResult') : this.$t('components.noDataTemplate');
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../scss/base/variables';
    @import '../../scss/base/mixin';

    .block-empty {
        max-height: 100%;
        min-height: 80%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        position: relative;

        img {
            flex-shrink: 1;
            flex-grow: 0;
            flex-basis: 0;
            width: auto;
            height: auto;
            max-width: 80%;
            max-height: 80%;
        }

        .no-data-msg {
            margin-top: $input-field-height;
            font-size: 14px;
            color: $light-theme;
        }
    }
</style>
