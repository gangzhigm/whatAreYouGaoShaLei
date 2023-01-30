<template>
    <div class="del-contact-tag-controller">
        <img src="./images/del-tag.png" alt="del-tag">
    </div>
</template>

<script type="text/ecmascript-6">
    import {DELETE_CONTACT_TAG_CONTROLLER} from '../../CONTROLLER_TYPES';

    export default {
        name: DELETE_CONTACT_TAG_CONTROLLER,
    };
</script>

<style lang="scss">
    .del-contact-tag-controller {
        background-color: #ff9023;

        img {
            display: block;
            margin: auto;
            width: 38px;
            height: auto;
        }
    }
</style>
