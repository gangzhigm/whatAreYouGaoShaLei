<template>
    <div class="color-picker" v-blur="close" @click.self="show = !show" :style="{background: value}">
        <sketch-picker class="inner-picker" disableAlpha :preset-colors="presetColors" v-model="colors" v-if="show"/>
    </div>
</template>
<script>
    import {Sketch} from 'vue-color';

    export default {
        name: 'color-picker',
        components: {
            'sketch-picker': Sketch,
        },
        props: {
            value: { // '#3e3e3e'
                required: true,
            }
        },
        data() {
            return {
                show: false,
                presetColors: [
                    '#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321',
                    '#417505', '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2',
                    '#B8E986', '#000000', '#4A4A4A', '#9B9B9B', '#FFFFFF'
                ]
            };
        },
        computed: {
            colors: {
                get() {
                    return {
                        hex: this.value
                    };
                },
                set({hex}) {
                    this.$emit('input', hex);
                }
            }
        },
        methods: {
            close() {
                this.show = false;
            },
        }
    };
</script>
<style lang="scss">
    @import "../scss/base/variables";
    @import "../scss/base/mixin";

    // 颜色选择
    .color-picker {
        display: inline-block;
        position: relative;
        vertical-align: middle;
        border: 1px solid $form-border;
        @include border-radius(4px);
        width: $input-field-height - 2px;
        height: $input-field-height - 2px;
        line-height: normal;
        cursor: pointer;

        &:hover {
            border-color: $light-theme;
        }

        &:active {
            border-color: $theme;
        }

        .inner-picker {
            position: absolute;
            width: 243px;
            top: $input-field-height + 2px;
            left: 0;
            z-index: $index-container;
        }
    }
</style>
