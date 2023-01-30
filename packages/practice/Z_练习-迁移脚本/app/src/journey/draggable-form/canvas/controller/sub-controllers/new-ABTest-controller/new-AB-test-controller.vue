<template>
    <div class="new-ABTest-controller">
        <svg aria-hidden="true">
            <use xlink:href="#icon-ABceshi"></use>
        </svg>
    </div>
</template>
<script type="text/ecmascript-6">
    import {NEW_AB_TEST_CONTROLLER} from '../../CONTROLLER_TYPES';

    export default {
        name: NEW_AB_TEST_CONTROLLER
    };
</script>
<style lang="scss">
    @import "../../../../../../common/scss/base/variables";

    .new-ABTest-controller {
        background-color: #34b6fa;

        svg {
            width: 48px;
            height: 48px;
            fill: white;
        }
    }
</style>
