<template>
    <div class="setting-number" v-blur="close">
        <svg class="setting-icon" aria-hidden="true" @click="isShow = !isShow">
            <use xlink:href="#icon-setting"></use>
        </svg>
        <transition name="fade">
            <div class="setting-content" v-if="isShow">
                <div class="setting-content-header">
                    {{'analysis.chooseType' | t}}
                </div>
                <div class="setting-content-middle">
                    <div class="date-item">
                        <radio :source="'default'" :value="'default'" v-model="numberType">{{'analysis.defaults' | t}}
                        </radio>
                    </div>
                    <div class="date-item" v-if="attrGenre1 !== 1">
                        <radio :source="'integer'" :value="'integer'" v-model="numberType">{{'analysis.integer' | t}}
                        </radio>
                    </div>
                    <div class="date-item">
                        <radio :source="'interval'" :value="'interval'" v-model="numberType">{{'analysis.defined' |
                            t}}
                        </radio>
                        <div class="bucket-range-container" v-if="numberType === 'interval'">
                            <div class="bucket-line" v-for="(item,index) in numberInterval">
                                <span>{{'analysis.range' | t}}{{index + 1 > 9 ? index + 1 : '0' + (index + 1)}}：</span>
                                [<input type="text" disabled class="input"
                                        :value="index === 0 && numberInterval.length > 0?'-∞':numberInterval[index-1].number">
                                <span>{{'eventAnalysis.to' | t}}</span>
                                <number-input class="input" :class="{error: item.checkRange}" type="float"
                                              v-model="numberInterval[index].number"></number-input>
                                )
                            </div>
                            <div class="bucket-line" v-if="numberInterval.length">
                                <span>{{'analysis.range' | t}}{{numberInterval.length + 1 > 9 ? numberInterval.length + 1 : '0' + (numberInterval.length + 1)}}：</span>
                                [<input type="text" disabled class="disabled-input input"
                                        v-model="numberInterval[numberInterval.length-1].number">
                                <span>{{'eventAnalysis.to' | t}}</span>
                                <input type="text" value="+∞" disabled class="input">]
                                <button class="action-icon active icon icon-round-close" v-if="numberInterval.length>1"
                                        @click="deleteInterval(numberInterval)"></button>
                            </div>
                            <button class="add-bucket-line" @click="addInterval">{{'analysis.addRange' | t}}</button>
                        </div>
                    </div>
                </div>
                <div class="setting-content-footer">
                    <button class="btn btn-sm btn-theme-border" @click="cancel">{{'common.cancel' | t}}</button>
                    <button class="btn btn-sm btn-theme" @click="sure">{{'common.confirm' | t}}</button>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
    export default {
        name: 'setting-number',
        props: {
            type: {
                type: String,
            },
            numberList: {
                type: Array
            },
            attrGenre: {
                type: Number
            }
        },
        data() {
            return {
                isShow: false,
                numberType: this.type,
                numberInterval: [],
                attrGenre1: this.attrGenre
            };
        },

        watch: {
            isShow() {
                //初始化清空
                this.numberInterval = [];
                this.numberList.forEach(item => {
                    this.numberInterval.push({
                        number: item,
                        checkRange: false
                    });
                });
            }
        },

        methods: {
            // 增加区间
            addInterval() {
                let number = this.numberInterval.length
                    ? Number(this.numberInterval[this.numberInterval.length - 1].number) + 10
                    : 0;
                this.numberInterval.push({number: number, checkRange: false});
            },

            // 删除区间
            deleteInterval(list) {
                list.pop();
            },

            // 取消
            cancel() {
                //点击取消初始化上次保存时数据
                //this.numberInterval = [{number: 0, checkRange: false}];
                //this.numberType = 'default';
                this.numberType = this.type;
                //如果选择的不是自定义区间：清空区间列表
                if (this.numberType !== 'interval') {
                    this.numberInterval = [];
                }
                this.isShow = false;
            },

            // 确定
            sure() {
                if (this.checkNumber(this.numberInterval)) {
                    if (this.numberType === 'interval') {
                        let numberInterval = this.numberInterval.map(item => Number(item.number));
                        this.$emit('change', {numberType: this.numberType, numberInterval: numberInterval});
                    } else {
                        this.$emit('change', {numberType: this.numberType, numberInterval: []});
                    }
                    this.isShow = false;
                }
            },

            // 校验数值类型区间
            checkNumber(list) {
                let rangeEmpty = false;
                let rangeLogic = false;

                for (let i = 0; i < list.length - 1; i++) {
                    if (list[i + 1].number === '') {
                        list[i + 1].checkRange = true;
                        rangeEmpty = true;
                    } else if (list[i].number >= list[i + 1].number && list[i + 1].number !== '') {
                        list[i + 1].checkRange = true;
                        rangeLogic = true;
                    } else {
                        list[i + 1].checkRange = false;
                    }
                }
                if (rangeEmpty && rangeLogic) {
                    this.$toast(this.$t('analysis.editRange'), 'round-close');
                    return false;
                }
                if (rangeEmpty && !rangeLogic) {
                    this.$toast(this.$t('analysis.rangeNoEmpty'), 'warn');
                    return false;
                }
                if (!rangeEmpty && rangeLogic) {
                    this.$toast(this.$t('analysis.editRange'), 'round-close');
                    return false;
                }
                if (!rangeEmpty && !rangeLogic) {
                    return true;
                }
            },

            // 关闭
            close() {
                this.isShow = false;
            }

        }
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    $radius: 4px;
    $padding: 16px;

    .setting-number {
        position: relative;
        display: inline-block;
        vertical-align: middle;

        .setting-icon {
            display: inline-block;
            vertical-align: top;
            margin: ($input-field-height - 14px)/2;
            width: 14px;
            height: 14px;
            fill: $green;
            cursor: pointer;
        }

        .setting-content {
            position: absolute;
            left: 50%;
            top: $input-field-height;
            min-width: 255px;
            border: 1px solid $select-border;
            border-radius: $radius;
            z-index: $index-menu;
            @include box-shadow(0 3px 8px rgba(#8b9daf, .16));
            background-color: white;
            @include transform(translateX(-50%));

            &:before {
                content: '';
                position: absolute;
                left: 50%;
                top: -6px;
                z-index: $index-menu;
                width: 8px;
                height: 8px;
                margin-left: -4px;
                transform: rotate(45deg);
                border-radius: 4px;
                border-top: 1px solid $select-border;
                border-left: 1px solid $select-border;
                background-color: $title-bg;
            }

            .setting-content-header {
                background-color: $title-bg;
                height: $input-field-height;
                line-height: $input-field-height;
                padding-left: $padding;
                border-top-left-radius: $radius;
                border-top-right-radius: $radius;
                font-weight: bold;
            }

            .setting-content-middle {
                padding-top: $padding;

                .date-item {
                    > label {
                        margin-bottom: $padding;
                        padding: 0 $padding;
                    }

                    .bucket-range-container {
                        .bucket-line {
                            white-space: nowrap;
                            padding: 8px $padding;

                            + .add-bucket-line {
                                margin-top: $padding;
                            }

                            &:hover {
                                background-color: $select-bg;
                            }

                            span {
                                margin-right: 0;
                            }

                            input {
                                width: 80px;
                                margin: 0 8px;
                            }

                            .icon-round-close {
                                color: $red;

                                &:hover {
                                    color: $light-red;
                                }
                            }
                        }

                        .add-bucket-line {
                            border: none;
                            padding: 0;
                            height: 24px;
                            line-height: 24px;
                            margin-bottom: 22px;
                            color: $green;
                            margin-left: $padding;
                            @include appearance(none);
                            background-color: transparent;
                            cursor: pointer;
                        }
                    }
                }
            }

            .setting-content-footer {
                padding: 0 $padding $padding $padding;
                text-align: right;
            }
        }
    }
</style>
