<template>
    <ul class="canvas-size-toolbar">
        <li @click="changeRatio('increase')"><i class="icon icon-plus"></i></li>
        <li class="ratio">{{percentage}}%</li>
        <li @click="changeRatio('decrease')"><i class="icon icon-jianshao"></i></li>
    </ul>
</template>
<script type="text/ecmascript-6">
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {CHANGE_RATIO} from '@/store/vuex/mutationTypes';
    import { mapMutations, mapState } from 'vuex';

    export const RATIO_STEP = 0.04;
    export default {
        computed: {
            ...mapState({
                ratio: state => state[DRAGGABLE_JOURNEY_STORE_NAME].ratio
            }),
            // ratio 每变化 0.04, percentage 变化 10，ratio 为 1 时，percentage 为 100
            percentage() {
                return 100 - (100 - this.ratio * 100) / RATIO_STEP / 10;
            }
        },
        methods: {
            ...mapMutations([
                CHANGE_RATIO
            ]),
            changeRatio(type) {
                let newRatio = this.ratio;
                if (type === 'increase' && this.ratio < 1) {
                    newRatio = (newRatio * 100 + RATIO_STEP * 100) / 100;
                } else if (type === 'decrease' && this.ratio > 0.8) {
                    newRatio = (newRatio * 100 - RATIO_STEP * 100) / 100;
                }
                this.CHANGE_RATIO(newRatio);
            }
        }
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .canvas-size-toolbar {
        position: fixed;
        z-index: 1;
        bottom: 32px;
        right: 24px;
        width: 34px;
        border: 1px solid $border-color;
        background: white;
        @include user-select(none);

        li {
            height: 34px;
            line-height: 34px;
            text-align: center;
            font-size: 18px;
            color: $color-light-content;
            border-bottom: 1px solid $border-color;
            cursor: pointer;

            &.ratio {
                font-size: 12px;
                white-space: nowrap;
                color: $color-content;
                cursor: default;
            }

            &:hover {
                color: $color-content;
            }

            &:nth-last-of-type(1) {
                border-bottom: none;
            }
        }
    }
</style>
