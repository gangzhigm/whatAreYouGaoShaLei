<template>
    <div class="contact-controller">
        <svg aria-hidden="true">
            <use xlink:href="#icon-lianxiren"></use>
        </svg>
    </div>
</template>

<script type="text/ecmascript-6">
    import {CONTACT_CONTROLLER} from '../../CONTROLLER_TYPES';

    export default {
        name: CONTACT_CONTROLLER,
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .contact-controller {
        background-color: #01d18e;

        svg {
            width: 48px;
            height: 48px;
            fill: white;
        }
    }
</style>
