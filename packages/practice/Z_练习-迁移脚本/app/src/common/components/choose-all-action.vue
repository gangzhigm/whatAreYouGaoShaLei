<template>
    <div id="choose-all-action" class="hidden-menu-trigger">
        <svg aria-hidden="true">
            <use xlink:href="#icon-menu"></use>
        </svg>
        <div class="hidden-menu">
            <button class="btn" :disabled="btnPermission"
                    @click="chooseCurrentPage">
                {{ choosePageText }}
            </button>
            <button v-if="showChooseAllData" class="btn" :disabled="btnPermission"
                    @click="chooseAllData">
                {{ chooseAllDataText }}
            </button>
            <button class="btn" :disabled="btnPermission"
                    @click="clearChoose">
                {{ clearText }}
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'choose-all-action',
    props: {
        // 按钮权限字段
        btnPermission: {
            type: Boolean,
            default: false
        },
        // 选择当前页文本
        choosePageText: {
            type: String,
            default: function () {
                return this.$t('material.selectCurrentPage');
            }
        },
        // 选择所有数据文本
        chooseAllDataText: {
            type: String,
            default: function () {
                return this.$t('tag.allSelected');
            }
        },
        // 清空文本
        clearText: {
            type: String,
            default: function () {
                return this.$t('material.clearSelect');
            }
        },
        // 显示选择所有数据
        showChooseAllData: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        // 全选当前页
        chooseCurrentPage() {
            this.$emit('choosePage');
        },
        // 清空选择
        clearChoose() {
            this.$emit('clear');
        },
        // 全选所有数据
        chooseAllData() {
            this.$emit('chooseAllData');
        }
    }
};
</script>

<style lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    #choose-all-action {
        width: 14px;
        height: 14px;
        margin: 5px auto;
        padding: 3px;
        position: relative;
        cursor: pointer;

        svg {
            display: block;
            width: 14px;
            height: 14px;
            fill: currentColor;
        }

        &:hover {
            color: $theme;
        }

        .hidden-menu {
            top: 100%;
            left: 0;
            @include transform-origin(left top);

            .btn {
                display: block;
                color: $color-light-content;
                border-radius: 0;
                min-width: 110px;
                text-align: left;
                font-size: 12px;
                padding: 0 1em;

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