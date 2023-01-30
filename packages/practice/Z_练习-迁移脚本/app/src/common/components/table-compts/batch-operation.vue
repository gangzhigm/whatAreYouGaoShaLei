<template>
    <div class="operate-top">
        <div class="operate hidden-menu-trigger batch-actions pull-left">
            <svg aria-hidden="true">
                <use xlink:href="#icon-batch"></use>
            </svg>
            <span class="button-action">{{'common.batchOperation' | t}}</span>
            <div class="hidden-menu">
                <button class="btn" v-for="btn in btnList" :disabled="$has(btn.disabled)" :key="btn.name"
                    @click="btnEvent(btn.type)">{{btn.name
                                | t}}
                </button>
            </div>
        </div>
    </div>
</template>
<script>

export default {
    name: 'BatchOperation',
    props: {
        btnList: {
            type: Array,
            default () {
                return [];
            }
        }
    },
    methods: {
        btnEvent (type) {
            this.$emit('btnEvent', type);
        }
    }
};
</script>
<style scoped lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../scss/base/variables';
@import '../../scss/base/mixin';
.operate-top {
    margin-top: 16px;
    @include clearfix();

    .operate {
        display: inline-block;
        padding: 0 18px;
        height: $input-field-height;
        line-height: $input-field-height;
        font-size: 14px;
        cursor: pointer;
        user-select: none;

        svg {
            display: inline-block;
            width: 14px;
            height: 14px;
            vertical-align: middle;
            fill: currentColor;
        }

        .hidden-menu {
            .btn {
                display: block;
                color: $color-light-content;
                border-radius: 0;

                &:hover {
                    color: $color-content;
                    background-color: #f0f0f0;
                }
            }

            .btn + .btn {
                margin: 0;
            }
        }
    }
}
</style>
