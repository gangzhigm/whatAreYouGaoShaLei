<template>
    <div class="validation-progress">
        <div v-if="complete" class="icon success" :tip="$t('journey.validationComplete')" style="width: 100%"></div>
        <div v-else class="processing" :style="'width:' + fill + '%'" @transitionend="done"></div>
    </div>
</template>
<script type="text/ecmascript-6">
    export default {
        props: {
            fill: 0
        },
        data() {
            return {
                complete: false,
                timer: null
            };
        },
        watch: {
            fill(val) {
                if (val === 100)
                    this.timer = setTimeout(() => {
                        this.done();
                    }, 2000); // same as the css transition setting
            }
        },
        methods: {
            done() {
                clearTimeout(this.timer);
                this.$emit('transitionend');
                this.complete = true;
            }
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .validation-progress {
        $progress-height: 30px;
        height: $progress-height;
        line-height: $progress-height;
        border: 1px solid white;
        @include border-radius(3px);

        div {
            position: relative;
            width: 0;
            height: $progress-height;
            text-align: center;
            @include transition(width 1s ease);

            &.processing {
                @include linear-gradient(57deg, white 0%, white 25%, $theme 25%, $theme 50%, white 50%, white 75%, $theme 75%, $theme 100%);
                @include background-size(20px $progress-height);
                @include animation(processing .4s linear infinite);
                @include keyframes(processing) {
                    0% {
                        background-position: 0 0;
                    }
                    100% {
                        background-position: 20px 0;
                    }
                }
            }

            &.success {
                color: white;
                background-color: $theme;

                &:before {
                    content: '\e60a';
                    margin-right: 5px;
                }

                &:after {
                    content: attr(tip);
                }
            }
        }
    }
</style>
