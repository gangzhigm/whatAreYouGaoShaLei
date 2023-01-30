<template>
    <div class="query-filter-condition-value" :class="[errClass, inputType, {disabled}]" @click="inputFocus" v-blur="close">
        <div v-if="inputType === 'many'" class="value-item" v-for="(option,index) in value">
            <div class="value-item-text" :title="option">{{option}}</div>
            <button v-if="!disabled" ref="button" tabindex="-1" class="icon icon-close" @click="delItem(index)"></button>
        </div>
        <div v-if="!disabled" class="keyword-input" :class="inputType">
            <!-- 文本型 -->
            <input v-if="valueType === 'text'" key="text" type="text" ref="input"
                   :style="value.length === 0 && inputType === 'many' ? 'width:110px' : ''"
                   @focus="open" @keyup.enter="enterAddItem" @keyup.down="readySelectDown"
                   @keyup.up="readySelectUp" @keyup.delete="deleteSelect" :readonly="prohibitedInput"
                   v-model="keyword" :maxlength="maxlength" aria-autocomplete="none">
            <!-- 数值可为小数 -->
            <number-input v-if="valueType === 'number'" key="float" type="float" ref="input"
                          :value="keyword" @edit="keyword = $event" :precision="precision"
                          :style="value.length === 0 && inputType === 'many' ? 'width:110px' : ''" :replace="ifRange"
                          @focus.native="open" @keyup.enter="enterAddItem" @keyup.down="readySelectDown"
                          @keyup.up="readySelectUp" @keyup.delete="deleteSelect" :readonly="prohibitedInput"
                          :maxlength="maxlength" aria-autocomplete="none"/>
            <!-- 整数 -->
            <number-input v-if="valueType === 'integer'" key="int" type="int" ref="input"
                          :value="keyword" @edit="keyword = $event"
                          :style="value.length === 0 && inputType === 'many' ? 'width:110px' : ''"
                          @focus.native="open" @keyup.enter="enterAddItem" @keyup.down="readySelectDown"
                          @keyup.up="readySelectUp" @keyup.delete="deleteSelect" :readonly="prohibitedInput"
                          :maxlength="maxlength" aria-autocomplete="none"/>
            <ul class="options" v-if="visible && filteredOptions.length > 0"
                :class="{'max-length':this.isLocalValue}">
                <li v-for="(item,index) of filteredOptions" :title="item"
                    :class="{selected: readySelectIdx === index}"
                    @mousedown.stop="toggleCheck(item, index)">{{item}}
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'query-filter-condition-value',
        model: {
            event: 'change'
        },
        props: {
            options: {
                type: Array,
                required: true
            },
            value: {
                type: Array,
                required: true
            },
            valueType: {
                type: String,
                default: 'text' // number text integer
            },
            inputType: {
                type: String,
                default: 'many' // single/many
            },
            // 从本地获得下拉提示value
            isLocalValue: {
                type: Boolean,
                default: false
            },
            // 禁止输入
            prohibitedInput: {
                type: Boolean,
                default: false
            },
            // 是否trim用户输入的内容
            trim: {
                type: Boolean,
                default: true
            },
            maxlength: {
                type: Number,
                default: 200
            },
            precision: {
                type: Number,
                default: 10
            },
            // 最多允许输入的标签数
            maxTag: {
                type: Number,
            },
            // 是否有范围（超出自动替换上下限,仅number类型）
            ifRange: {
                type: Boolean,
                default: true
            },
            // 是否正则校验，仅number类型
            ifReg: {
                type: Boolean,
                default: false,
            },
            //分群条件簇使用
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                keyword: '',
                filterItem: '',
                visible: false,
                readySelectIdx: '',
                deleteIdx: 0,
                doneIdx: 0,
                errClass: ''
            };
        },
        computed: {
            //查找匹配的选项
            filteredOptions() {
                if (this.inputType === 'many') {
                    let arr = this.options.filter(item => !this.value.includes(item));
                    if (this.options.length === 0) {
                        this.doneIdx = 1;
                    }
                    // 从本地取得下拉提示
                    if (this.isLocalValue) {
                        return arr;
                    }
                    return arr.slice(0, 10);
                } 
                // 单选的时候
                let arr = this.options.filter(item => !this.value.includes(item));
                return arr.slice(0, 10);
            },
        },
        watch: {
            keyword(newValue) {
                this.$emit('search', newValue);
            },
            inputType() {
                this.keyword = '';
            },
            value(name) {
                if (this.value.length > 0 && this.inputType === 'single') {
                    this.keyword = name[0];
                }
            }
        },
        mounted() {
            if (this.value.length > 0 && this.inputType === 'single') {
                this.keyword = this.value[0];
            }
        },
        methods: {
            //点击时获取焦点
            inputFocus() {
                if (this.disabled) {
                    return;
                }
                if (this.$refs.input.focus) {
                    this.$refs.input.focus();
                } else {
                    this.$refs.input.$el.focus();
                }
                this.visible = true;
            },
            //类型校验函数
            valueTypeCheck() {
                //整数类型校验
                if (this.valueType === 'integer') {
                    if (!(!isNaN(this.keyword) && Number.parseFloat(this.keyword) % 1 === 0)) {
                        this.$toast(this.$t('analysis.enterInteger'), 'warn');
                        this.errClass = 'error';
                    } else {
                        this.errClass = '';
                        return true;
                    }
                }

                //数字型校验
                if (this.valueType === 'number') {
                    if (isNaN(this.keyword)) {
                        this.$toast(this.$t('analysis.enterNumber'), 'warn');
                        this.errClass = 'error';
                    } else {
                        this.errClass = '';
                        return true;
                    }
                }

                // 文本类型校验
                if (this.valueType === 'text') {
                    return true;
                }
            },

            //增加选项
            addItem() {
                let keyword = this.trim ? String(this.keyword).trim() : this.keyword;
                if (this.filteredOptions.length > 0 || keyword) {
                    // 可以多选的情况
                    if (this.inputType === 'many') {
                        // 根据下拉列表是否展开来判断是从列表中取值还是取input中的值
                        if (this.visible && this.readySelectIdx !== '') {
                            this.$emit('change', [...this.value, this.filteredOptions[this.readySelectIdx]]);
                            this.$nextTick(() => {
                                if (this.$refs.input.focus) {
                                    this.$refs.input.focus();
                                } else {
                                    this.$refs.input.$el.focus();
                                }
                            });
                        } else {
                            if (keyword === '') {
                                return false;
                            }
                            if (keyword && this.valueTypeCheck()) {
                                if (!this.value.some(item => item === keyword)) {
                                    this.$emit('change', [...this.value, keyword]);
                                }
                            }
                        }
                        // fix nextTick necessary cuz firefox won't actually change keyword
                        this.$nextTick(() => {
                            this.keyword = '';
                        });
                    } else if (this.inputType === 'single') {
                        // 这是单选的情况
                        // 根据下拉列表是否展开来判断是从列表中取值还是取input中的值
                        if (this.visible && this.readySelectIdx !== '') {
                            this.$emit('change', [this.filteredOptions[this.readySelectIdx]]);
                        } else if (this.valueTypeCheck()) {  //单选并且校验通过
                            //若新的关键字和value相等，则不替换
                            if (this.value[0] !== keyword) {
                                this.value.splice(0, 1, keyword);
                                this.$emit('change', this.value);
                            }
                            this.$refs.input.blur();
                        }
                    }
                }

                this.readySelectIdx = '';
                this.doneIdx = 0;
            },

            // 删除存在的选项
            delItem(index) {
                let value = this.value.slice();
                value.splice(index, 1);
                this.$emit('change', value);
                if (this.$refs.input.focus) {
                    this.$refs.input.focus();
                } else {
                    this.$refs.input.$el.focus();
                }
            },
            // 回车增加
            enterAddItem() {
                if (typeof this.readySelectIdx === 'number') {
                    let target = this.filteredOptions[this.readySelectIdx];
                    this.keyword = target;
                }
                let string = /^\d+(\.\d+)?$/; // 非负浮点数,0开头可行
                if (this.maxTag && this.value.length === this.maxTag){
                    this.$toast(this.$t('analysis.maxLimit') + this.maxTag + this.$t('analysis.items'), 'warn');
                    this.keyword = '';
                } else if (this.keyword !== '' && this.ifReg && !string.test(this.keyword)) {
                    this.$toast(this.$t('swarm.singleFormart') + this.$t('swarm.numberFormatLimit') + this.maxlength, 'warn');
                    this.keyword = '';
                } else {
                    this.addItem();
                }
            },
            // 点击选择下拉选项
            toggleCheck(item, index) {

                if (this.maxTag && this.value.length === this.maxTag){
                    this.$toast(this.$t('analysis.maxLimit') + this.maxTag + this.$t('analysis.items'), 'warn');
                    this.keyword = '';
                    return;
                } 
                this.keyword = item;
                this.readySelectIdx = index;
                this.$emit('select'); //清空搜索结果
                this.addItem();
            },

            // 展开下拉选项列表
            open() {
                this.visible = true;
                this.$emit('search', '');
            },

            // 关闭下拉选项列表
            close() {
                this.visible = false;
                if (this.keyword !== '') {
                    this.addItem();
                }
                this.$emit('select'); //清空搜索结果
            },

            //点击键盘向下按键
            readySelectDown() {
                if (this.readySelectIdx === '') {
                    this.readySelectIdx = 0;
                } else {
                    this.readySelectIdx++;
                }
                if (this.readySelectIdx === this.filteredOptions.length) {
                    this.readySelectIdx = 0;
                }
            },

            //点击键盘向上按键
            readySelectUp() {
                if (this.readySelectIdx === '') {
                    this.readySelectIdx = 9;
                } else {
                    this.readySelectIdx--;
                }
                if (this.readySelectIdx === -1) {
                    this.readySelectIdx = this.filteredOptions.length - 1;
                }
            },

            // 删除已选中的选项（delete按键）
            deleteSelect(e) {
                if (!e.isComposing && this.value.length > 0 && String(this.keyword).trim() === '') {
                    this.errClass = '';
                    // many模式是多选内容模式。 删除时，需要确定keyword完全删除后才删除已存在的value,
                    // 但是点击删除时，实际上keyword已经被删除，外层的条件判断就以成立，所以这里需要有删除一个缓存,
                    // 但是在其他模式下， 删除就是删除了。
                    if (this.inputType !== 'many') {
                        let newVal = this.value.slice();
                        newVal.pop();
                        this.$emit('change', newVal);
                    } else {
                        if (this.deleteIdx === 1) {
                            let newVal = this.value.slice();
                            newVal.pop();
                            this.$emit('change', newVal);
                        }
                    }
                    this.deleteIdx = 1;
                } else {
                    this.deleteIdx = 0;
                }
            }
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .query-filter-condition-value {
        display: inline-flex;
        flex-wrap: wrap;
        min-width: 180px;
        padding-left: 8px;
        height: $input-field-height - 2;
        vertical-align: middle;
        border: 1px solid $form-border;
        border-radius: 4px;
        align-items: center;
        cursor: text;
        background-color: white;
        @include clearfix();

        &.error {
            border-color: $red;
        }

        &.many {
            max-width: 50%;
            height: auto;
            vertical-align: top;
            padding-top: 4px;
        }

        .keyword-input {
            position: relative;

            &.single {
                input {
                    width: 118px;
                }

                .options {
                    width: 160px;
                }
            }

            &.many {
                margin-bottom: 4px;
            }

            input {
                width: 50px;
                height: 17px;
                border: 1px solid transparent;
                background-color: inherit;
            }

            .options {
                position: absolute;
                top: 31px;
                left: -9px;
                width: 128px;
                z-index: $index-menu;
                background-color: white;
                border: 1px solid $border-color;
                text-indent: 1em;

                &.max-length {
                    overflow: auto;
                    max-height: 300px;
                }

                li {
                    padding: 7px;
                    cursor: pointer;
                    text-indent: 0;
                    @include ellipsis();

                    &:hover {
                        background-color: $content-bg;
                    }

                    &.selected {
                        background-color: $content-bg;
                    }
                }
            }
        }

        .value-item {
            border: 1px solid $purple;
            margin-right: 10px;
            margin-bottom: 4px;
            padding-left: 5px;
            border-radius: 3px;
            cursor: pointer;
            white-space: nowrap;
            @include transition();
            background-color: #f2f0ff;
            color: $purple;

            &:hover {
                background-color: #dbd5fb;
            }
            .value-item-text {
                display: inline-block;
                vertical-align: middle;
                max-width: 260px;
                @include ellipsis();
            }
            button {
                padding: 0 3px;
                cursor: pointer;
                border: 1px solid transparent;
                line-height: 18px;
                border-bottom-right-radius: 3px;
                border-top-right-radius: 3px;
                color: $purple;
                background-color: transparent;
                @include transition();

                &:hover {
                    background-color: #ef6266;
                    color: white;
                }
            }
        }
        &.disabled {
            // width: 500px;
            background-color: unset;
            border: none;
            padding-top: 8px;
            .value-item {
                max-width: 450px;
                background-color: #f0f2f5;
                color: unset;
                border-color: #cfd5df;
                padding-right: 5px;
            }        
        }
    }

</style>
