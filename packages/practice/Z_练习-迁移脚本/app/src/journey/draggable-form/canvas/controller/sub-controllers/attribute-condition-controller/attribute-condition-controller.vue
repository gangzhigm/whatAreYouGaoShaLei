<template>
    <div class="attribute-condition-controller">
        <img src="./att-decision.png" alt="tag">
    </div>
</template>

<script type="text/ecmascript-6">

    import {ATTRIBUTE_CONDITION_CONTROLLER} from '../../CONTROLLER_TYPES';

    export default {
        name: ATTRIBUTE_CONDITION_CONTROLLER
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .attribute-condition-controller {
        position: relative;

        &:before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            @include transform(rotate(45deg));
            border-radius: 12px;
            background-color: #34b6fa;
        }

        img {
            display: block;
            width: 34px;
            height: auto;
            z-index: 1;
        }
    }
</style>
