<template>
    <div class="start-controller">
        <svg aria-hidden="true">
            <use xlink:href="#icon-start1"></use>
        </svg>
    </div>
</template>

<script type="text/ecmascript-6">
    import {START_CONTROLLER} from '../../CONTROLLER_TYPES';

    export default {
        name: START_CONTROLLER
    };
</script>

<style lang="scss">
    .start-controller {
        background-color: #01d18e;
        text-align: center;
        border-radius: 100% !important;

        svg {
            width: 32px;
            height: 32px;
            fill: white;
            margin-left: 5px;
        }
    }
</style>
