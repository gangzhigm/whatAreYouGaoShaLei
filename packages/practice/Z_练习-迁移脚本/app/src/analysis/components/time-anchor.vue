<template>
    <div class="time-anchor" :class="{focus}">
        <span class="past-future-switch" :class="sign === '+' ? 'future' : 'past'" @click="toggleSign"
            :future="$t('userGroup.future')" :past="$t('userGroup.past')"></span>
        <number-input class="time-anchor-field" :value="number" @sync="changeValue" :max="9999"
                      @focusin.native="focus=true" @focusout.native="focus=false"
                      @edit="editValue"/>
        {{'common.day' | t}}
    </div>
</template>
<script>
    export default {
        name: 'time-anchor',
        props: {
            value: null,
        },
        data() {
            return {
                sign: '-',
                focus: false,
            };
        },
        computed: {
            number() {
                if (this.value === '' || this.value === '-' || this.value === '+')
                    return '';
                return Math.abs(this.value);
            }
        },
        mounted() {
            if (this.value !== '') {
                Number(this.value) > 0 && (this.sign = '+');
            }
        },
        methods: {
            toggleSign() {
                this.sign = this.sign === '-' ? '+' : '-';
                if (this.value !== '') {
                    this.$emit('change', this.sign + this.number);
                }
            },
            changeValue(value) { // change 事件
                this.$emit('change', value === '' ? '' : (this.sign + value));
            },
            editValue(value) { // input 事件
                this.$emit('input', value === '' ? '' : (this.sign + value));
            }
        }
    };
</script>
<style lang="scss" type="text/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .time-anchor {
        display: inline-block;
        vertical-align: middle;
        overflow: hidden;
        border: 1px solid $form-border;
        height: $input-field-height - 2px;
        line-height: $input-field-height - 2px;
        padding-right: 5px;
        border-radius: 3px;
        background-color: white;

        &:hover {
            border-color: rgba($light-theme, .86);

            .time-anchor-field {
                border-left-color: rgba($light-theme, .86);
            }
        }

        &.focus {
            border-color: rgba($theme, .86);
            @include box-shadow(0 0 4px rgba(#2ecbb5, .35));

            .time-anchor-field {
                border-left-color: rgba($theme, .86);
            }
        }

        .past-future-switch {
            float: left;
            padding: 0 5px;
            height: $input-field-height - 2px;
            border-top-left-radius: 3px;
            border-bottom-left-radius: 3px;
            cursor: pointer;

            &.past {
                color: $blue;

                &:before {
                    content: attr(past);
                }
            }

            &.future {
                color: $green;

                &:before {
                    content: attr(future);
                }
            }

            &:after {
                content: "\e62d";
                font-family: "icon", $font;
                font-style: normal;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                display: inline-block;
                @include transform(rotate(90deg));
                margin-left: 3px;
                vertical-align: top;
            }

            &:hover {
                background-color: darken(white, 3%);
            }

            &:active {
                background-color: darken(white, 5%);
            }
        }

        .time-anchor-field {
            float: left;
            width: 3em;
            line-height: 20px;
            padding: ($input-field-height - 2px - 20px)/2 .5em;
            text-align: center;
            border-top: none;
            border-bottom: none;
            border-left: 1px solid $form-border;
            border-right: none;
        }
    }

</style>
