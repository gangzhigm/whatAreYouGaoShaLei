<template>
    <transition name="fall-and-fade">
        <div class="toast" :class="type" v-show="open">
            <svg aria-hidden="true" v-if="type">
                <use xlink :href="'#icon-' + type"></use>
            </svg>
            {{message}}
        </div>
    </transition>
</template>
<script type="text/ecmascript-6">
    export default {
        data() {
            return {
                message: '',
                type: '',
                open: false,
                timer: null,
            };
        },
        methods: {
            close() {
                this.open = false;
            },
            show() {
                this.open = true;
            },
            reset() {
                const enChars = this.message.match(/\w/g);
                const len = enChars ? (this.message.length - enChars.length / 2) : this.message.length;
                const time = Math.min(Math.max(1200, len * 300), 3000);
                clearTimeout(this.timer);
                if (this.type !== 'processing')
                    this.timer = setTimeout(() => {
                        clearTimeout(this.timer);
                        this.close();
                    }, time);
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../scss/base/variables";
    @import "../scss/base/mixin";

    .toast {
        position: fixed;
        z-index: $index-toast;
        top: 40%;
        left: 50%;
        min-width: 370px;
        max-width: 80vw;
        font-size: 14px;
        padding: 12px 15px;
        color: $color-content;
        text-align: left;
        cursor: default;
        white-space: nowrap;
        @include border-radius(4px);
        @include transform(translateX(-50%));
        @include user-select(none);
        @include ellipsis;

        /**
        * success: icon-success
        * info: icon-info
        * warn: icon-warn
        * error: icon-error
        * processing: icon-processing spinning circle
        */
        &.success {
            background-color: #e6f9f6;
            border: 1px solid #77e3d4;

            use {
                fill: $green;
            }
        }

        &.info {
            background-color: #e9f8ff;
            border: 1px solid #82d7fa;

            use {
                fill: $blue;
            }
        }

        &.warn {
            background-color: #fffbe8;
            border: 1px solid #fedd42;

            use {
                fill: $yellow;
            }
        }

        &.round-close {
            background-color: #feefef;
            border: 1px solid #fda7a7;

            use {
                fill: $red;
            }
        }

        svg {
            width: 16px;
            height: 16px;
            vertical-align: -2.4px;
            overflow: hidden;
        }
    }

    .fall-and-fade-enter-active, .fall-and-fade-leave-active {
        @include transition();
    }

    .fall-and-fade-enter {
        top: 20%;
        opacity: 0;
    }

    .fall-and-fade-leave-to {
        opacity: 0;
        @include transform(translateX(-50%) scale(.8));
    }
</style>
