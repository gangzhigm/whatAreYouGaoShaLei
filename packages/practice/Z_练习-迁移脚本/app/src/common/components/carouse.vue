<template>
    <div class="carouse" v-blur="hide">
        <label class="read-input" @click="toggle" :title="selectedStrValue"
               :class="{placeholder: !selectedStrValue}">
            {{selectedStrValue || placeholder || $t('common.selectHolder')}}
            <span class="select-icon icon icon-arrow-down"></span>
        </label>
        <transition name="drop">
            <div class="carouse-content" v-if="show">
                <ul class="item" v-for="level in levelList" :key="level.level">
                    <li class="item-inner" v-for="carouse in level.carouseList" :key="carouse.id"
                        :title="carouse.name" :class="{selected: getActive(carouse.id)}"
                        @click="getChildAndSelected(carouse, level.level)">
                        <span class="inner-value">{{carouse.name}}</span>
                        <span v-if="carouse.children && carouse.children.length > 0" class="icon icon-right"></span>
                    </li>
                </ul>
            </div>
        </transition>
    </div>
</template>

<script>
    import {isArray} from 'lodash';
    export default {
        name: 'carouse',
        props: {
            // 选择的值
            value: [Array, String, Number],
            // 选项
            options: Array,
            // 提示信息
            placeholder: String
        },
        data() {
            return {
                // 分层列表
                levelList: [],
                // 选项数据
                carouseList: [],
                show: false,
                // 选择的数据唯一标识集合
                selectedValue: [],
                selectedStrValue: '',
                templateStrValue: [],
            };
        },
        watch: {
            // 当数据为异步获取时，组件被激活但数据未更新
            value(val) {
                if (val.length > 0) {
                    this.updateComponentData();
                } else {
                    this.levelList = [
                        {
                            level: 1,
                            carouseList: this.options
                        }
                    ];
                }
            },
            options(list) {
                if (list && !this.value.length) {
                    this.levelList = [
                        {
                            level: 1,
                            carouseList: this.options
                        }
                    ];
                }
            }
        },
        methods: {
            // 更新组件内数据
            updateComponentData() {
                this.selectedValue = [];
                this.selectedStrValue = '';
                this.templateStrValue = [];
                this.levelList = [
                    {
                        level: 1,
                        carouseList: this.options
                    }
                ];
                this.setValue();
            },
            getActive(id) {
                if (isArray(this.selectedValue)) {
                    return this.selectedValue.includes(id);
                }
                return this.selectedValue === id;
            },
            /**
             * 展开下一层, 选中
             * @param item  当前选项内容
             * @param cur   当前层级
             * @param read  是否用于回显
             */
            getChildAndSelected(item, cur, read = false) {
                const maxCur = Math.max(...this.levelList.map(elm => elm.level));
                const curIndex = this.levelList.findIndex(elm => elm.level === cur);
                // 展开下一层
                if (item.children && item.children.length) {
                    if (cur === maxCur) {
                        this.levelList.push({level: cur + 1, carouseList: item.children});
                        // 添加选择的项
                        this.selectedValue.push(item.id);
                        this.templateStrValue.push(item.name);
                    } else {
                        // 替换下一层级， 重置展开层级数（重选）
                        this.levelList.splice(curIndex + 1, 1, {level: cur + 1, carouseList: item.children});
                        this.levelList = this.levelList.filter(elm => elm.level <= cur + 1);
                        this.selectedValue.splice(curIndex, 1, item.id);
                        this.selectedValue = this.selectedValue.slice(0, cur);
                        this.templateStrValue.splice(curIndex, 1, item.name);
                        this.templateStrValue = this.templateStrValue.slice(0, cur);
                    }
                } else {
                    // 选择到最后一层输出结果
                    // 仅一层
                    if (cur === 1) {
                        this.selectedValue = item.id;
                        this.selectedStrValue = item.name;
                        if (!read) this.emit();
                    } else {
                        // 同级更改
                        if (this.selectedValue.length === maxCur) {
                            this.selectedValue.splice(maxCur - 1, 1, item.id);
                            this.templateStrValue.splice(maxCur - 1,1, item.name);
                        } else {
                            this.selectedValue.push(item.id);
                            this.templateStrValue.push(item.name);
                        }

                        this.selectedStrValue = this.templateStrValue.toString().replace(/,/g, ' ');
                        if (!read) this.emit();
                    }
                }
            },
            toggle() {
                this.show = !this.show;
            },
            hide() {
                this.show = false;
            },
            // 输出最终结果
            emit() {
                this.show = false;
                // 当选择到最后一层时 输出选择的数据
                this.$emit('input', this.selectedValue);
                this.$emit('select', {value: this.selectedValue, valueStr: this.selectedStrValue});
            },
            setValue() {
                // 仅有一级
                if (typeof this.value !== 'object') {
                    this.selectedValue = this.value;
                    this.selectedStrValue = this.options.find(target => target.id === this.value).name;
                } else {
                    let target;
                    this.value.forEach((key, index) => {
                        let list = target ? target.children ? target.children : [] : this.options;
                        target = this.findTarget(list, key);
                        if (target) this.getChildAndSelected(target, index + 1, true);
                    });
                }
            },
            findTarget(list, id) {
                return list.find(elm => elm.id === id);
            }
        }
    };
</script>

<style lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    $option-height: $input-field-height;
    $border-radius: 4px;
    $hover-bg: #f8f9fa;

    .carouse {
        display: inline-block;
        min-width: 158px;
        position: relative;
        vertical-align: middle;

        .read-input {
            position: relative;
            display: block;
            @include box-sizing();
            border: 1px solid $form-border;
            text-indent: .8em;
            @include border-radius($border-radius);
            @include user-select(none);
            background-color: white;
            @include ellipsis();
            height: $option-height;

            .select-icon {
                height: $option-height - 2px;
                width: $option-height - 2px;
                position: absolute;
                top: 0;
                right: 0;
                text-align: center;
                text-indent: 0;
                color: $color-light-content;
            }

            &.placeholder {
                color: $disabled;
            }
        }
        .carouse-content {
            position: absolute;
            top: $option-height + 8px;
            left: 0;
            display: inline-flex;
            z-index: 10;

            .item {
                border: 1px solid $select-border;
                width: 136px;
                background: #fff;
                min-height: 5 * $option-height;
                max-height: 8 * $option-height;
                overflow: auto;
                cursor: pointer;
                @include box-sizing();

                &:first-child {
                    border-top-left-radius: $border-radius;
                    border-bottom-left-radius: $border-radius;
                }

                &:last-child {
                    border-top-right-radius: $border-radius;
                    border-bottom-right-radius: $border-radius;
                }

                & + .item {
                    border-left: 0;
                }
                .item-inner {
                    padding: 0 8px;
                    line-height: $option-height;
                    height: $option-height;

                    &.selected {
                        background-color: $select-bg;
                        color: $color-content;
                    }

                    .inner-value {
                        display: inline-block;
                        width: calc(100% - 14px);
                        @include ellipsis();
                    }

                    .icon-right {
                        float: right;
                    }
                }
            }
        }
    }
</style>