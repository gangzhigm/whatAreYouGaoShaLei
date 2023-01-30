<template>
    <div class="leads-transfer-controller">
        <svg aria-hidden="true">
            <use xlink:href="#icon-xiansuo"></use>
        </svg>
    </div>
</template>

<script>
    import {LEADS_TRANSFER} from '../../CONTROLLER_TYPES';
    export default {
        name: LEADS_TRANSFER
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .leads-transfer-controller {
        background-color: rgba(245, 154, 35, 1);

        svg {
            width: 48px;
            height: 48px;
            fill: white;
        }
    }
</style>