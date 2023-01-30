<template>
    <div class="wecom-controller">
        <svg aria-hidden="true">
            <use v-bind:xlink:href="wecomController"></use>
        </svg>
    </div>
</template>

<script type="text/ecmascript-6">
    import {WECOM_CONTROLLER} from '../../CONTROLLER_TYPES';

    export default {
        name: WECOM_CONTROLLER,
        props: {
            controller: Object
        },
        computed: {
            wecomController() {
                switch (this.controller.pushInfo.subType) {
                    case 14: // 应用消息
                        return '#icon-message';
                    case 15: // 企业群发
                        return '#icon-tuwenxinxi';
                }
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";

    .wecom-controller {
        background-color: #519CF9;

        svg {
            width: 42px;
            height: 42px;
            fill: white;
        }
    }

</style>
