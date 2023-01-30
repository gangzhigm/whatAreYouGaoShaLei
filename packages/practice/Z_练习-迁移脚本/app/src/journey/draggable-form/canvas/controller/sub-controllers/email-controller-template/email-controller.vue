<template>
    <div class="email-controller">
        <svg aria-hidden="true">
            <use xlink:href="#icon-checkbox-check"></use>
        </svg>
    </div>
</template>
<script type="text/ecmascript-6">
    import {EMAILTEMPLATE_CONTROLLER} from '../../CONTROLLER_TYPES';

    export default {
        name: EMAILTEMPLATE_CONTROLLER,
    };
</script>
<style lang="scss">
    @import "../../../../../../common/scss/base/variables";

    .email-controller {
        background-color: #624dbf;

        svg {
            width: 42px;
            height: 42px;
            fill: white;
        }
    }
</style>
