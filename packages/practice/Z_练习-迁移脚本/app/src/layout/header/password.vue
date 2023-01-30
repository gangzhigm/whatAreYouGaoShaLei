<template>
    <div class="password-input">
        <input v-model.trim="password" v-if="!visible" type="password" class="input lg" :id="id" :minlength="minlength"
               :maxlength="maxlength">
        <input v-model.trim="password" v-else type="text" class="input lg" :id="id" :minlength="minlength"
               :maxlength="maxlength">
        <svg aria-hidden="true" @click="toggle">
            <use v-bind:xlink:href="'#icon-' + (visible ? 'eye' : 'eye-closed')"></use>
        </svg>
    </div>
</template>
<script type="text/ecmascript-6">
    export default {
        name: 'password',
        props: {
            value: {
                required: true
            },
            id: String,
            minlength: {
                'default': 8
            },
            maxlength: {
                'default': 20
            }
        },
        data() {
            return {
                visible: false
            };
        },
        computed: {
            password: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                }
            }
        },
        methods: {
            toggle() {
                this.visible = !this.visible;
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .password-input {
        position: relative;
        display: inline-block;

        svg {
            position: absolute;
            right: $input-field-height / 4;
            top: $input-field-height / 4;
            width: $input-field-height / 2;
            height: $input-field-height / 2;
            fill: $color-light-content;
            @include transition(color .2s ease);
            cursor: pointer;

            &:hover {
                fill: $color-content;
            }
        }
    }
</style>
