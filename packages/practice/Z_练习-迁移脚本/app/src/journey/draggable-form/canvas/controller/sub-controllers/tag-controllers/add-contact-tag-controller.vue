<template>
    <div class="add-contact-tag-controller">
        <img src="./images/add-tag.png" alt="add-tag">
    </div>
</template>

<script type="text/ecmascript-6">
    import {ADD_CONTACT_TAG_CONTROLLER} from '../../CONTROLLER_TYPES';

    export default {
        name: ADD_CONTACT_TAG_CONTROLLER,
    };
</script>
<style lang="scss">
    .add-contact-tag-controller {
        background-color: #ff9023;

        img {
            display: block;
            margin: auto;
            width: 38px;
            height: auto;
        }
    }
</style>
