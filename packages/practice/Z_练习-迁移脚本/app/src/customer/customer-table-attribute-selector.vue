<template>
    <div class="customer-table-attribute-selector" v-blur="close">
        <div class="dropdown-trigger" :class="{active: show}" @click="show = !show">
            <span class="icon icon-menu"></span>
            {{'contact.customColumn' | t}}
            <span class="action-icon icon icon-arrow-down"></span>
        </div>
        <transition name="drop">
            <div class="shuttle-content" v-show="show">
                <shuttle-box v-bind="shuttleInfo" v-model="showFieldIds"/>
            </div>
        </transition>
    </div>
</template>

<script>
    import { ContactApiV1 } from '@/api';

    export default {
        name: 'customer-table-attribute-selector',
        data() {
            return {
                show: false,        // 显隐
                availableAttrs: [], // 全部用户属性
                selectedAttrs: [],  // 右边，已选择列 数据
                showFieldIds: '',   // 右边，已选择列 id
            };
        },
        created() {
            ContactApiV1
                .getAllUserAttrs()
                .then(res => {
                    // 所有属性列表
                    this.availableAttrs = res.body.data.allCustomerFieldDtoList;
                    // 已选的列ids String
                    this.showFieldIds = res.body.data.showFieldIds;
                    // 已选的列数据 Array (需要获取后台最新的字段排序，作为联系人分群，联系人管理的表头)
                    this.selectedAttrs = res.body.data.showFields;

                    // 联系人管理，联系人分群页面
                    // 始终显示在右侧且不可点击:-4 微信，-5 导入时间，-6 更新时间
                    this.availableAttrs.map(attr => {
                        if (attr.id === -4 || attr.id === -5 || attr.id === -6) {
                            attr.disabled = true;
                        }
                    });
                });
        },
        watch: {
            showFieldIds() {
                ContactApiV1
                    .saveSelectedAttrIds(this.showFieldIds)
                    .then(() => {
                        let ids = this.showFieldIds.split(',')
                            .map(id => Number(id));

                        this.selectedAttrs = [];
                        ids.forEach(id => {
                            let option = this.availableAttrs.filter(attr => attr.id === id)[0];
                            this.selectedAttrs.push(option);
                        });
                        this.$emit('change', this.selectedAttrs, this.availableAttrs);
                    });
            }
        },
        computed: {
            shuttleInfo() {
                return {
                    titles: [this.$t('contact.contactAttr'), this.$t('contact.selectedCol')],
                    dataList: this.availableAttrs,
                    selectedVal: this.showFieldIds,
                    fromPage: 'custom',
                    draggable: true,
                    search: true,
                };
            }
        },
        methods: {
            close() {
                this.show = false;
            }
        }
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../common/scss/base/variables";
    @import "../common/scss/base/mixin";

    .customer-table-attribute-selector {
        position: relative;
        margin-right: 8px;

        .dropdown-trigger {
            position: relative;
            padding: 0 8px;
            line-height: $input-field-height - 2px;
            border-radius: 4px;
            border: 1px solid $form-border;
            cursor: pointer;

            .icon-menu {
                color: $theme;
                margin-right: 4px;
            }

            &:hover {
                border-color: $theme;
            }

            &.active {
                border-color: $theme;
                @include box-shadow(0 1px 3px rgba($theme, .35));

                .icon-arrow-down {
                    color: $theme;
                }
            }
        }

        .shuttle-content {
            position: absolute;
            z-index: $index-menu - 1;
            overflow: hidden;
            top: $input-field-height + 4px;
            right: 0;
            display: flex;
            flex-direction: row;
            width: 508px;
            padding: 8px;
            border: solid 1px $select-border;
            @include border-radius(4px);
            background-color: #fff;
        }
    }
</style>

