<template>
    <div v-if="visible && !calendarView" class="journey-notice" :class="[{wider}, status]">
        <template v-if="validationResult.justPass">
            <i class="icon icon-correct"></i>
            {{'dragJourney.openJourney' | t}}
        </template>
        <template v-else-if="validationResult.errorId">
            <i class="icon icon-warn"></i>
            {{validationResult.errorMessage}}
        </template>
        <template v-else-if="tips">
            {{tips}}
        </template>
        <i class="icon icon-round-close closer" @click="visible = false"></i>
    </div>
</template>
<script type="text/ecmascript-6">
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import { mapState } from 'vuex';

    export default {
        data() {
            return {
                visible: false,
            };
        },
        computed: {
            ...mapState({
                storeName: state => state[DRAGGABLE_JOURNEY_STORE_NAME],
            }),
            // 定时旅程，日历视图
            calendarView() {
                return this.$route.query.calendarView;
            },
            journey() {
                return this.storeName.journeyInformation;
            },
            // 定时旅程不可编辑时，宽度要大一点
            wider() {
                return this.journey.journeyType !== 2 && !this.$store.getters.journeyWritable;
            },
            status() {
                if (this.validationResult.justPass) return 'success';
                if (this.validationResult.errorId) return 'error';
                if (this.tips) return 'normal';
                return '';
            },
            // 旅程校验结果
            validationResult() {
                return this.storeName.validationResult;
            },
            // 某些状态的旅程会有文字提示
            tips() {
                if (this.journey.journeyType !== 2) {
                    if (this.journey.journeyStatus === 1) {
                        if (this.journey.repeatFrequency) {
                            return this.$t('dragJourney.noticeC');
                        }
                        return this.$t('dragJourney.noticeA');
                    } else if (this.journey.journeyStatus === 5) {
                        return this.$t('dragJourney.noticeB');
                    }
                    return '';
                }
                return '';
            }
        },
        mounted() {
            if (this.tips) this.visible = true;
        },
        watch: {
            'validationResult.timestamp'() {
                this.visible = true;
            }
        }
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";
    @import "./journey-variables";

    .journey-notice {
        position: absolute;
        right: 0;
        z-index: 2;
        height: $input-field-height;
        width: calc(100vw - #{$wide-panel-width});
        text-align: center;
        line-height: $input-field-height;

        &.wider {
            width: calc(100vw - #{$slim-panel-width});
        }

        &.error {
            color: #df453d;
            background: #ffcdcb;
        }

        &.success {
            color: #3b9641;
            background: #d8edc5;

            .icon {
                display: inline-block;
                width: 18px;
                height: 18px;
                margin-right: 5px;
                line-height: 18px;
                color: white;
                background: #3b9641;
                border-radius: 50%;
            }
        }

        &.normal {
            color: #006699;
            background: #c5ebf3;
        }

        .closer {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translate(0,-50%);
            font-size: 16px;
            cursor: pointer;
        }
    }
</style>
