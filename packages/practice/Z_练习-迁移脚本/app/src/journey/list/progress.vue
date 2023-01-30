<template>
    <div class="journey-progress">
        <svg width="80" height="80" viewbox="0 0 80 80">
            <circle cx="40" cy="40" r="36" stroke-width="8" fill="none"
                    :stroke="stokeColor" :stroke-dasharray="strokeDashArrayStr"></circle>
        </svg>
        <div class="outer"></div>
        <div class="inner">{{text}}</div>
    </div>
</template>
<script type="text/ecmascript-6">

    /**
     * journey列表专用
     */

    const Perimeter = Math.PI * 2 * 36;
    const STATUS_MAP = ['journey.status.unstarted', 'journey.status.processing', 'journey.status.finished', 'journey.status.cancelled'];

    export default {
        props: {
            fill: 0,
            status: 0 // 0:未开始 1:进行中 2:已结束 3:已取消
        },
        computed: {
            strokeDashArrayStr() {
                let percent = this.fill / 100;
                return Perimeter * percent + ' ' + Perimeter;
            },
            stokeColor() {
                // 0:未开始 1:进行中 2:已结束 3:已取消
                return this.status > 1 ? '#cdcdcd' : '#0cc2a9';
                // return this.status > 1 ? '#cdcdcd' : '#ff4574';
            },
            text() {
                if (this.status === 1) return this.fill + '%';
                if (this.status === 5) return '已暂停';
                return this.$t(STATUS_MAP[this.status]);
            }
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .journey-progress {
        position: relative;
        float: left;
        width: 80px;
        height: 80px;
        margin-right: 20px;
        @include user-select(none);

        svg {
            @include transform(rotate(-90deg));
        }

        .outer {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            @include border-radius(40px);
            @include box-shadow(inset 0 2px 5px rgba(black, .29));
        }

        .inner {
            position: absolute;
            left: 8px;
            right: 8px;
            top: 8px;
            bottom: 8px;
            text-align: center;
            font-size: 16px;
            line-height: 64px;
            @include border-radius(32px);
            background-color: white;
            @include box-shadow(0 5px 8px rgba(black, .21));
        }
    }

</style>
