<template>
    <div class="del-fans-tag-controller">
        <img src="./images/del-tag.png" alt="del-tag">
    </div>
</template>

<script type="text/ecmascript-6">
    import {DELETE_FANS_TAG_CONTROLLER} from '../../CONTROLLER_TYPES';

    export default {
        name: DELETE_FANS_TAG_CONTROLLER,
    };
</script>

<style lang="scss">
    .del-fans-tag-controller {
        background-color: #29bdfb;

        img {
            display: block;
            margin: auto;
            width: 38px;
            height: auto;
        }
    }
</style>
