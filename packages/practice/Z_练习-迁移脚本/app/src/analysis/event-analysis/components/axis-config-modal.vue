<template>
    <!-- 坐标轴设置弹出层 -->
    <confirm class="axis-config-modal"
             size="sm"
             neat
             :title="$t(eventAnalysis.setAxis)"
             @cancel="$emit('close')"
             @confirm="confirm">
        <div class="axis-type">
            <span>{{'eventAnalysis.singleAxis' | t}}</span>
            <radio :source="true" v-model="config.isSingleAxis">{{'common.yes' | t}}</radio>
            <radio :source="false" v-model="config.isSingleAxis">{{'common.no' | t}}</radio>
        </div>
        <div class="measure-axis-overview" :class="{disabled: config.isSingleAxis}">
            <div class="measure-line" v-for="(item, index) in config.axisPositionList"
                 v-if="visibleIndices.includes(index)">
                <span :title="item.name">{{item.name}}</span>
                <radio source="left" v-model="item.axisPosition" :disabled="config.isSingleAxis">
                    {{'eventAnalysis.axisLeft' | t}}
                </radio>
                <radio source="right" v-model="item.axisPosition" :disabled="config.isSingleAxis">
                    {{'eventAnalysis.axisRight' | t}}
                </radio>
            </div>
        </div>
    </confirm>
</template>
<script>
    import cloneDeep from 'lodash/cloneDeep';
    import isEqual from 'lodash/isEqual';

    export default {
        name: 'axis-config-modal',
        props: {
            isSingleAxis: Boolean,
            axisPositionList: Array,
            visibleIndices: Array
        },
        data() {
            return {
                config: {
                    isSingleAxis: false,
                    axisPositionList: [],
                }
            };
        },
        computed: {
            changed() {
                return !isEqual(this.config.isSingleAxis, this.isSingleAxis)
                    || !isEqual(this.config.axisPositionList, this.axisPositionList);
            }
        },
        created() {
            this.config.isSingleAxis = this.isSingleAxis;
            this.config.axisPositionList = cloneDeep(this.axisPositionList);
        },
        methods: {
            confirm() {
                if (this.changed) {
                    this.$emit('update:isSingleAxis', this.config.isSingleAxis);
                    this.$emit('update:axisPositionList', this.config.axisPositionList);
                    this.$nextTick(() => {
                        this.$emit('change');
                        this.$emit('close');
                    });
                } else {
                    this.$emit('close');
                }
            }
        }
    };
</script>
<style lang="scss" type="text/scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .axis-config-modal {
        .axis-type {
            color: $color-title;
            padding: 10px 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.12);

            span {
                display: inline-block;
                width: calc(100% - 120px);
            }
        }

        .measure-axis-overview {
            position: relative;
            padding: 10px 0;

            &.disabled {
                opacity: 0.6;
            }

            .measure-line {
                padding: 5px 0;
                color: $color-title;

                span {
                    display: inline-block;
                    width: calc(100% - 120px);
                }
            }
        }
    }
</style>
