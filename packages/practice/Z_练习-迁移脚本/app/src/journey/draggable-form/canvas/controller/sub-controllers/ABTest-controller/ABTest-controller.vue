<template>
    <div class="ABTest-controller">
        <svg aria-hidden="true">
            <use xlink:href="#icon-suiji"></use>
        </svg>
    </div>
</template>
<script type="text/ecmascript-6">
    import {AB_TEST_CONTROLLER} from '../../CONTROLLER_TYPES';

    export default {
        name: AB_TEST_CONTROLLER
    };
</script>
<style lang="scss">
    @import "../../../../../../common/scss/base/variables";

    .ABTest-controller {
        background-color: #34b6fa;

        svg {
            width: 38px;
            height: 38px;
            fill: white;
        }
    }
</style>
