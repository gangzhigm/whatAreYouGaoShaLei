<template>
    <div class="add-fans-tag-controller">
        <img src="./images/add-tag.png" alt="add-tag">
    </div>
</template>

<script type="text/ecmascript-6">
    import {ADD_FANS_TAG_CONTROLLER} from '../../CONTROLLER_TYPES';

    export default {
        name: ADD_FANS_TAG_CONTROLLER,
    };
</script>
<style lang="scss">
    .add-fans-tag-controller {
        background-color: #29bdfb;

        img {
            display: block;
            margin: auto;
            width: 38px;
            height: auto;
        }
    }
</style>
