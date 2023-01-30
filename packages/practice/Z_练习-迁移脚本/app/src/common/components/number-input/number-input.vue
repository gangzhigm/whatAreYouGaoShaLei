<template>
    <input type="text" :value="value"
           @input="inputChecker" @change="changeChecker" @keyup="$emit('keyup', $event)" :disabled="disabled"
           @keydown="keydownChecker">
</template>
<script>

    export const POSITIVE_INT = 'positive-int',
        FLOAT = 'float',
        INT = 'int';

    // white list of non-numeric chars: e/-/+/.
    const AVAILABLE_KEY_CODES = {
        // 正整数：只能输入0-9十个字符，且不能以0开头
        [POSITIVE_INT]: [],
        // 整数：相比正整数，可以多输入一个负号，负号只能在开头，负号最多只能有一个
        [INT]: [189/* - */, 109/* - */],
        // 小数： 相比整数，可以多输入一个小数点，小数点不能出现在开头和结尾，小数点最多只能有一个
        [FLOAT]: [189/* - */, 109/* - */, 190/* . */, 110/* . */],
    };

    // 过滤非法字符
    function filterBadChars(type, rawContent, precision) {
        switch (type) {
            case FLOAT: {
                let floatChars = rawContent.replace(/^\.*|\.*$/g, '')
                    .match(/(^-)|([0-9])|(\.)/g);
                let dotExist = false;
                if (floatChars) {
                    rawContent = floatChars
                        .filter(char => {
                            if (char === '.') {
                                if (dotExist) {
                                    return false;
                                }
                                dotExist = true;
                            }
                            return true;
                        })
                        .join('')
                        .replace(new RegExp(`(\\.\\d{${precision}})(.*)`), '$1');
                } else {
                    rawContent = '';
                }
                break;
            }
            case INT: {
                let intChars = rawContent.match(/(^-)|([0-9])/g);
                rawContent = intChars ? intChars.join('') : '';
                break;
            }
            case POSITIVE_INT: {
                let positiveIntChars = rawContent.match(/\d/g);
                rawContent = positiveIntChars ? positiveIntChars.join('') : '';
                break;
            }
        }
        // lonely '.' or '-' doesn't makes it valid
        if (rawContent === '.' || rawContent === '-') {
            return '';
        }
        return rawContent;
    }


    /**
     * <number-input v-model="someNumber" />
     * 使该input只能键入数字字符
     * edit 事件等同 input 事件
     * sync 事件等同 change 事件
     * <number-input/>  正整数(默认)
     * <number-input type="float"/>  浮点数
     * <number-input type="int"/>  整数
     */
    export default {
        name: 'number-input',
        model: {
            event: 'edit'
        },
        props: {
            value: [Number, String],
            type: {
                type: String,
                default: POSITIVE_INT
            },
            min: Number,
            max: {
                Number,
                default: 999999999999
            },
            //超过范围是否替换上下限
            replace: {
                type: Boolean,
                default: true
            },
            precision: { // 小数最多位数
                type: Number,
                default: 10
            },
            disabled: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            parseFunc() {
                return this.type === FLOAT ? parseFloat : parseInt;
            }
        },
        methods: {
            inputChecker(e) {
                let filtered = filterBadChars(this.type, e.target.value, this.precision),
                    number = '';

                if (filtered !== '') {
                    number = this.parseFunc(filtered);
                    if (this.replace) {
                        if (number <= this.min) number = this.min;
                        if (number >= this.max) number = this.max;
                    }
                }
                e.target.value = number;
                this.$emit('edit', number);
            },
            changeChecker(e) {
                let filtered = filterBadChars(this.type, e.target.value, this.precision),
                    number = '';

                if (filtered !== '') {
                    number = this.parseFunc(filtered);
                    if (this.replace) {
                        if (number <= this.min) number = this.min;
                        if (number >= this.max) number = this.max;
                    }
                }
                this.$emit('edit', number);
                this.$emit('sync', number);
                e.target.value = number;
            },
            keydownChecker(e) {

                // From https://github.com/joseluisq/vue-input-number/blob/master/index.vue
                // Allow these keys only:
                if (
                    // backspace, delete, tab, escape, enter, dot
                    [46, 8, 9, 27, 13].indexOf(e.keyCode) >= 0 ||
                    // Ctrl/cmd+A
                    (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
                    // Ctrl/cmd+C
                    (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
                    // Ctrl/cmd+R
                    (e.keyCode === 82 && (e.ctrlKey || e.metaKey)) ||
                    // Ctrl/cmd+X
                    (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
                    // Ctrl/cmd+V
                    (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
                    // home, end, left, right
                    (e.keyCode >= 35 && e.keyCode <= 39)
                ) {
                    return;
                }

                let availableKeyCodes = AVAILABLE_KEY_CODES[this.type];
                if (!availableKeyCodes.includes(e.keyCode) &&
                    (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
                    (e.keyCode < 96 || e.keyCode > 105)
                ) {
                    e.preventDefault();
                }

                // ban negative sign if it's not first char
                if (/^-/.test(e.target.value) && (e.keyCode === 189 || e.keyCode === 109)) {
                    e.preventDefault();
                }

            },
            // 粘贴事件过滤非法字符，导致粘贴重复/替换原文字的bug，冻结
            /* pasteChecker(e) {
                try {
                    let rawContent = e.clipboardData
                        ? e.clipboardData.getData('text/plain')
                        : window.clipboardData.getData('Text');
                    rawContent = filterBadChars(this.type, String(rawContent).trim(), this.precision);
                    let number = rawContent === '' ? '' : this.parseFunc(rawContent);
                    if (number !== this.value) {
                        this.$emit('edit', number);
                    }
                } catch (err) {
                    console.error(err);
                }
            } */
        }
    };
</script>
<style type="text/scss">

</style>
