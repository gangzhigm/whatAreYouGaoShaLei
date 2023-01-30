<template>
    <backdrop :scroll="scrolls">
        <div class="modal" :class="size">
            <div class="modal-head">
                <button v-if="!readonly" type="button" class="pull-right modal-closer" @click.stop="close">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-close"></use>
                    </svg>
                </button>
                <span :title="title">{{title}}</span>
                <i v-if="iconFlag" class="icon" :class="iconName" v-title:right="titleHelp"></i>
            </div>
            <div class="modal-content" :class="{neat}">
                <slot></slot>
            </div>
            <div class="modal-panel" v-if="$slots.buttons">
                <slot name="buttons"></slot>
            </div>
        </div>
    </backdrop>
</template>
<script type="text/ecmascript-6">

    const modalStack = [];

    export default {
        name: 'modal',
        props: {
            size: {
                type: String,
                'default': 'md' //  'md', 'lg'
            },
            neat: Boolean,
            title: {
                type: String,
                required: true
            },
            readonly: Boolean,

            iconFlag:{
                type: Boolean,
                default: false
            },
            iconName: {
                type: String,
                default: ''
            },
            titleHelp: {
                type:String,
            },
            scrolls: {
                type: Boolean,
                default: true
            }
        },
        mounted() {
            modalStack.push(this);
            window.addEventListener('keydown', this.escape);
        },
        beforeDestroy() {
            window.removeEventListener('keydown', this.escape);
        },
        methods: {
            close() {
                this.$emit('close');
            },
            escape(e) {
                if (e.keyCode === 27) {
                    let targetModal = modalStack.pop();
                    targetModal && targetModal.close();
                }
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../scss/base/variables";
    @import "../../scss/base/mixin";

    .modal {
        margin: 10vh auto;
        background-color: white;
        border: 1px solid $border-color;
        @include border-radius(4px);

        &.sm {
            width: 400px;
        }

        &.md {
            width: 600px;
        }
        &.md-lg {
            width: 700px;
        }
        &.lg {
            width: 1000px;
        }
        // super large 额外加大
        &.sl {
            width: 1125px;
        }

        .modal-head {
            height: $modal-head-height - 1px;
            line-height: $modal-head-height - 1px;
            position: relative;
            border-bottom: 1px solid $border-color;
            text-align: left;
            @include ellipsis();
            color: $color-title;
            font-size: 16px;

            span {
                margin-left: 13px;
            }

            .modal-closer {
                position: relative;
                width: 16px;
                height: 16px;
                padding: 3px;
                margin-right: 11px;
                margin-top: ($modal-head-height - 16px)/2;
                border: none;
                overflow: hidden;
                background-color: transparent;
                cursor: pointer;
                fill: $color-light-content;

                &:hover {
                    fill: $color-title;
                }
            }

            svg {
                display: block;
                height: 100%;
                width: 100%;
            }
        }

        .modal-content {
            padding: 24px 13px;

            &.neat {
                position: relative;
                padding: 0;
            }
        }

        .modal-panel {
            padding: 0 16px;
            text-align: right;
            height: $modal-panel-height;
            line-height: $modal-panel-height;
            border-top: 1px solid $border-color;
        }
    }

</style>
