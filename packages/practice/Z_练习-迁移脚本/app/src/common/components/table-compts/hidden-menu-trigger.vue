<template>
    <div class="trigger-action icon icon-more hidden-menu-trigger">
        <div class="hidden-menu">
            <template v-for="btn in  btnList">
                <button class="btn" :key="btn.name" :disabled="$has(btn.disabled)" v-if="btn.isShow"
                    @click="btnEvent(btn.type)">{{btn.name |t}}
                </button>
            </template>
        </div>
    </div>
</template>
<script>
export default {
    name: 'HiddenMenuTrigger',
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
    },
};
</script>
<style lang="scss" scoped>
@import '../../scss/base/variables';
@import '../../scss/base/mixin';
.trigger-action {
    border: none;
    font-size: 16px;
    background-color: transparent;

    &:disabled {
        color: $disabled;
        cursor: not-allowed;
    }
}

.hidden-menu-trigger {
    position: relative;
    display: inline-block;
    height: 16px;

    .hidden-menu {
        position: absolute;
        > .btn {
            margin: 0;
            padding: 0 12px;
            display: block;
            color: $color-light-content;
            border-radius: 0;
            white-space: nowrap;
            text-transform:lowercase;

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
</style>