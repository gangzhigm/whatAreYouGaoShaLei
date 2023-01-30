<template>
    <div class="not-found">
        <img src="./404.png" alt="">
        <div class="not-found-msg">{{'components.pageNotFound' | t}}</div>
        <button class="btn btn-md btn-blue" @click="$router.go(0)">
            <svg aria-hidden="true">
                <use xlink:href="#icon-refresh"></use>
            </svg>
            {{'components.refresh' | t}}
        </button>
        <router-link class="btn btn-md btn-blue-border" :to="{name: 'home'}">
            <svg aria-hidden="true">
                <use xlink:href="#icon-mg-home"></use>
            </svg>
            {{'components.backHome' | t}}
        </router-link>
    </div>
</template>
<script type="text/babel">
    // 404 page
    export default {
        name: 'not-found',
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .not-found {
        padding-top: $input-field-height * 2;
        text-align: center;

        img {
            width: auto;
            height: auto;
            max-width: 80%;
            max-height: 80%;
        }

        .not-found-msg {
            margin-bottom: $input-field-height;
            font-size: 24px;
            color: $color-light-content;
        }

        .btn + .btn {
            margin-left: $input-field-height;
        }
    }
</style>
