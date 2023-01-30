<template>
    <div class="mms-controller">
        <svg aria-hidden="true">
            <use xlink:href="#icon-mms"></use>
        </svg>
    </div>
</template>

<script type="text/ecmascript-6">
    import {MMS_CONTROLLER} from '../../CONTROLLER_TYPES';

    export default {
        name: MMS_CONTROLLER,
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";

    .mms-controller {
        background-color: $orange;

        svg {
            width: 42px;
            height: 42px;
            fill: white;
        }
    }

</style>
