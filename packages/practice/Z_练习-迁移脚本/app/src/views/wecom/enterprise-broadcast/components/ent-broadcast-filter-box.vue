<template>
    <div class="filter-box" v-blur="close">
        <svg aria-hidden="true" @click="onOff">
            <use v-bind:xlink:href="'#icon-' + (show ? 'shaixuan-tianchong' : 'shaixuan')">
            </use>
        </svg>
        <transition name="drop">
            <div class="drop-list" v-if="show">
                <radio v-model="radioValue" :source="o[attribute]" v-for="o in list" :key="o[attribute]">
                    {{ o.name }}</radio>
            </div>
        </transition>
    </div>
</template>
<script>
export default {
    name: 'FilterDrop',
    props: {
        value: [String, Number],
        list: Array,
        attribute: {
            type: String,
            default: 'source'
        }
    },
    data () {
        return {
            show: false,
            radioValue: this.value
        };
    },
    methods: {
        close () {
            this.show = false;
            this.$emit('close');
        },
        onOff () {
            this.show = !this.show;
            this.$emit('onOff');
        }
    },
    watch: {
        radioValue () {
            this.show = false;
            this.$emit('valueChange', this.radioValue);
        }
    }
};
</script>
<style lang="scss">
@import '../../../../common/scss/base/variables';
@import '../../../../common/scss/base/mixin';
.filter-box {
    display: inline-block;
    position: relative;

    svg {
        fill: currentColor;
        width: 14px;
        height: 14px;
        vertical-align: middle;
        margin-left: 1px;
    }

    .radio {
        padding: 0 10px;
        display: block;
        margin: 0;
    }

    .drop-list {
        position: absolute;
        z-index: 1;
        left: 0;
        top: 100%;
        border-radius: 4px;
        border: 1px solid $border-color;
        background-color: $content-bg;
        line-height: $input-field-height;
        white-space: nowrap;
    }
}
</style>