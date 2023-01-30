<template>
    <div class="end-controller"></div>
</template>

<script type="text/ecmascript-6">
    import {END_CONTROLLER} from '../../CONTROLLER_TYPES';

    export default {
        name: END_CONTROLLER,
    };
</script>

<style lang="scss">
    .end-controller {
        background-color: #ff8686;
        border-radius: 100% !important; // fixme

        &:after {
            display: block;
            content: '';
            width: 22px;
            height: 22px;
            border-radius: 2px;
            background-color: white;
        }
    }
</style>
