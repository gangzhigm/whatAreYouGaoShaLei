<template>
    <div class="material-list-attribute-selector" v-blur="close">
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
    import { JourneyMaterialApiV1 } from '@/api';
    export default {
        name: 'material-list-attribute-selector',
        props: {
            initAttrIds: Array
        },
        data() {
            return {
                show: false,        // 显隐
                availableAttrs: [   // 全部用户属性
                    {id: 1, name: this.$t('material.name'), disabled: true},
                    {id: 2, name: this.$t('material.materialType'), disabled: true},
                    {id: 3, name: this.$t('material.updater'), disabled: true},
                    {id: 4, name: this.$t('material.updateTime'), disabled: true},
                    {id: 5, name: this.$t('material.creator'), disabled: true},
                    {id: 6, name: this.$t('material.createData'), disabled: true},
                    {id: 7, name: this.$t('material.copyNum'), disabled: false}
                ],
                selectedAttrs: [],  // 右边，已选择列 数据
                showFieldIds: '',   // 右边，已选择列 id
            };
        },
        created() {
            this.availableAttrs.forEach(attr => {
                if (this.initAttrIds.includes(attr.id)) {
                    this.selectedAttrs.push(attr);
                }
            });
            this.showFieldIds = this.initAttrIds.join(',');
        },
        watch: {
            showFieldIds() {
                let ids = this.showFieldIds.split(',')
                    .map(id => Number(id));
                JourneyMaterialApiV1
                    .saveMaterialsStatus({copyStatus: ids.includes(7) ? 1 : 0})
                    .then(() => {
                        this.selectedAttrs = [];
                        this.availableAttrs.forEach(attr => {
                            if (ids.filter(id => id === attr.id).length) this.selectedAttrs.push(attr);
                        });
                        this.$emit('change', this.selectedAttrs);
                    });
            }
        },
        computed: {
            shuttleInfo() {
                return {
                    titles: [this.$t('material.unselected'), this.$t('material.selected')],
                    dataList: this.availableAttrs,
                    selectedVal: this.showFieldIds,
                    fromPage: 'material',
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
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .material-list-attribute-selector {
        position: relative;
        margin-right: 8px;
        line-height: $input-field-height - 2px;

        .dropdown-trigger {
            position: relative;
            padding: 0 8px;
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

