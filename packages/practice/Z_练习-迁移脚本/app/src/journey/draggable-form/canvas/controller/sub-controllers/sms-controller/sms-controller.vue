<template>
    <div class="sms-controller">
        <svg aria-hidden="true">
            <use xlink:href="#icon-sms"></use>
        </svg>
    </div>
</template>

<script type="text/ecmascript-6">
    import {SMS_CONTROLLER} from '../../CONTROLLER_TYPES';

    export default {
        name: SMS_CONTROLLER,
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";

    .sms-controller {
        background-color: #0dc2a8;

        svg {
            width: 42px;
            height: 42px;
            fill: white;
        }
    }

</style>
