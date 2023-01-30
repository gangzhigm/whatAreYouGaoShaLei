<template>
    <div class="decision-controller">
        <svg aria-hidden="true">
            <use xlink:href="#icon-tiaojianfenzhi"></use>
        </svg>
    </div>
</template>

<script type="text/ecmascript-6">
    import {DECISION_CONTROLLER} from '../../CONTROLLER_TYPES';

    export default {
        name: DECISION_CONTROLLER
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .decision-controller {
        position: relative;

        &:before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            transform: rotate(45deg);
            border-radius: 12px;
            background-color: #34b6fa;
            @include transform-origin(center center);
        }

        svg {
            position: relative;
            width: 42px;
            height: 42px;
            fill: white;
        }
    }
</style>
