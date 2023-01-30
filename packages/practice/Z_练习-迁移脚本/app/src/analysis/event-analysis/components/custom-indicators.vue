<template>
    <div class="custom-indicators">
        <input type="text" :placeholder="$t('eventAnalysis.inputNormName')" v-model="customName" @blur="empty=''" maxlength="30"
               class="select-name input" :class="{empty}" v-title:top.warn="empty">
        &nbsp;{{'eventAnalysis.display' | t}}&nbsp;
        <div class="custom" v-blur="hideList" :class="{error}" v-title:top.warn="error" ref="custom">
            <label class="select-text">
                <input type="text" class="select-input" ref="text_dom"
                       :style="{width:calculateWidth(expressionText,'')+'px'}"
                       @mouseup="showList($event)" @keydown="keyDown($event)"
                       @compositionstart='compositionStart($event)' @compositionend="compositionEnd($event)"
                       @input="input($event)"
                       :placeholder="titleText && wordIndex === 0 ? '' :$t('eventAnalysis.customizeEvent')" v-model="expressionText">
                <div ref="text_title_dom" class="select-title-position">
                    <span v-for="express in expressionText">{{express}}</span>
                </div>
                <span :style="{
                    width:calculateWidth(expressionText.split(/[+\-*/%]/)[currentPosition],titleText) +1+'px',
                    left: calculateWidth(beforeText,'') + 2 + 'px'
                    }" class="select-title" v-if="titleText && wordIndex === 0">{{titleText}}</span>
            </label>
            <transition name="drop">
                <div class="list-container"
                     v-show="show && ((!optionKey && !attrAggreator) || (optionKey && attrAggreator))"
                     ref="select_list">
                    <ul class="select-list">
                        <li class="option" v-for="opt in filteredOptions"
                            :class="opt.group ? 'border' : ''"
                            :title="opt.title ? opt.title : opt.name">
                            <input type="text" readonly :value="(opt.name || $t('eventAnalysis.unknown')) | escape" :disabled="opt.disabled"
                                   @mousedown="change(opt)">
                        </li>
                        <li class="option-null" v-if="filteredOptions.length === 0">
                            {{'eventAnalysis.notFindSomething' | t}}
                        </li>
                    </ul>
                </div>
            </transition>
            <transition name="drop">
                <attr-select class="list-container" v-show="show && optionKey && !attrAggreator" ref="select_list_attr"
                             :options="filteredOptions"
                             attrId="" aggreator=''
                             type="dropList" @update="changeAttr"
                />
            </transition>
        </div>
        <button type="button" class="active action-icon icon icon-help" v-title:top="$t('eventAnalysis.helpTip')"></button>
        <selector class="md" :options="POINT" v-model="formatVal"/>
        <button type="button" class="action-icon icon icon-save" @click="save" v-title:top="$t('eventAnalysis.saveTip')"></button>
    </div>
</template>
<script>

    import AttrSelect, {GENERAL_AGGREATORS, NONE_NUMERICAL_AGGREATORS, NUMERICAL_AGGREATORS} from './attr-select.vue';
    import filterArrayByName from '../../../common/utils/filterArrayByName';
    import cloneDeep from 'lodash/cloneDeep';
    import uniq from 'lodash/uniq';
    import uniqBy from 'lodash/uniqBy';
    import isEqual from 'lodash/isEqual';
    import {COMMON_NAME_REGEXP} from '../../../common/utils/regs';
    import {EVENT_ANALYSIS_STORE_NAME} from '@/store/vuex/modules/eventAnalysisStore';
    import { translate } from '@/locales';
    //获得光标位置
    const textWidth = function (text) {
        let ele = document.createElement('span');
        ele.innerHTML = text;
        ele.style.display = 'inline-block';
        document.body.appendChild(ele);
        let width = ele.clientWidth;
        document.body.removeChild(ele);
        return width;
    };
    const REGEX = /[+\-*/%]/;
    // const REGEX_BRACKETS = /[()]/;
    const ALL_REGEX = /[+\-*/%()]/;
    const REGEX_TEXT = /[+\-*/%]/g;

    /**
     * 括号替换 escape brackets
     * @param {String} name
     * @return {String}
     */
    function escape(name) {
        return name.replace(/[()]/g, '');
    }

    /**
     * 找到括号添加到文字
     * @param {String} text
     * @param {String} rightText
     * @return {String}
     */
    function addBrackets(text, rightText) {
        let textArr = text.split(REGEX).map(list => escape(list));
        let reTextArr = rightText.split(REGEX).map(list => escape(list));
        textArr.forEach((list, index) => {
            text = text.replace(list, reTextArr[index]);
        });
        return text;
    }

    /**
     * 找到运算符添加到文字
     * @param {String} text
     * @param {String} rightText
     * @return {String}
     */
    function addOperate(text, rightText) {
        let textArr = text.split(REGEX).filter(list => list !== '');
        let reTextArr = rightText.split(REGEX).filter(list => list !== '');
        textArr.forEach((list, index) => {
            text = text.replace(list, reTextArr[index]);
        });
        return text;
    }

    /**
     * 找到某个字符的出现的所有位置
     * @param {String} str
     * @param {String} subStr
     * @return {Array}
     */
    function searchSubStr(str, subStr) {
        let pos = str.indexOf(subStr);
        let arr = [];
        while (pos > -1) {
            arr.push(pos);
            pos = str.indexOf(subStr, pos + 1);
        }
        return arr;
    }

    const POINT = [
        {id: 'd', name: translate('eventAnalysis.integer')},
        {id: '2p', name: translate('eventAnalysis.percentage')},
        {id: '2f', name: translate('eventAnalysis.decimal')},
    ];

    const ANYTHING_MEASURE = {
        key: 'event_measure_ARBITRARY_EVENT_ID',
        id: 'anything',
        name: translate('eventAnalysis.anyEvent')
    };

    export default {
        name: 'customIndicators',
        components: {
            AttrSelect
        },
        props: {
            options: Array,
            format: {
                type: String,
                default: '2p'
            },
            measureExpress: {
                type: String,
                default: ''
            },
            alias: {
                type: String,
                default: ''
            },
            currentMeasure: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                POINT,

                show: false,
                error: '',
                empty: '',

                measure: {},
                attribute: {},
                newMeasure: {
                    text: ''
                },

                optionKey: '',
                attrAggreator: '',
                keyword: [],
                wordIndex: 0,
                currentText: 0,
                currentPosition: 0,
                beforeTextLength: 0,
                beforeText: '',

                expressionText: '',
                templeExpressionText: '',
                cpLock: true,
                customName: '',
                formatVal: '2p',

                eventIds: [],
                attrInfoList: []

            };
        },
        computed: {
            //当前的下拉选项
            filteredOptions() {
                //this.optionKey 表示是否有指标，this.attrAggreator 表示是否有属性
                let options = [];
                if (!this.optionKey && !this.attrAggreator) {
                    options = cloneDeep(this.options);//筛选全部事件
                } else if (this.optionKey && !this.attrAggreator) {
                    options = cloneDeep(this.measure.attributes);//当前事件的属性
                } else {
                    options = cloneDeep(this.calculateOptions(this.attribute));//当前事件的属性的计算方式
                }
                return filterArrayByName(options, this.keyword[this.wordIndex]);//带关键字搜索
            },
            //正确的表达式
            rightExpression() {
                if (this.expressionText === '') return '';
                let expression = '';
                this.eventIds = [];
                this.substringText
                    .filter(list => list !== '')
                    .forEach((substringText, substringIndex) => {
                        let event = null,
                            measureOption,
                            eventObj,
                            attr = null,
                            calculate = null,
                            templeArr = [];
                        substringText.split('.')
                            .filter(list => list !== '')
                            .forEach((text, idx) => {
                                text = escape(text);
                                if (idx === 0) {
                                    eventObj = this.options.find(list => list.name === escape(text));
                                }
                                if (!eventObj) {
                                    templeArr.push(text);
                                } else {
                                    if (idx === 0) {
                                        if (text === ANYTHING_MEASURE.name) {
                                            event = ANYTHING_MEASURE.id;
                                            this.eventIds = this.options
                                                .filter(list => list.id !== 'ARBITRARY_EVENT_ID')
                                                .map(list => list.id);
                                        } else {
                                            if (eventObj.id) {
                                                this.eventIds.push(eventObj.id);
                                                event = 'id:' + eventObj.id;
                                            } else {
                                                event = '';
                                            }
                                        }
                                        measureOption = GENERAL_AGGREATORS.concat(eventObj.attributes);
                                    }
                                    if (idx === 1) {
                                        attr = measureOption.find(list => list.name === escape(text));
                                    }
                                    if (idx === 2) {
                                        calculate = this.calculateOptions(attr).find(list => list.name === escape(text));
                                    }
                                }
                            });
                        if (eventObj) {
                            if (substringText.split('.').length === 3) {
                                if (!calculate) {
                                    templeArr = [];
                                } else {
                                    templeArr = ['event', event, calculate.id + ':' + attr.id];
                                }
                            } else {
                                if (!attr) {
                                    templeArr = [];
                                } else {
                                    let hasAttr = GENERAL_AGGREATORS.find(list => list.id === attr.id);
                                    if (hasAttr) {
                                        templeArr = ['event', event, attr.id];
                                    } else {
                                        templeArr = [];
                                    }
                                }

                            }
                        }
                        expression += addBrackets(substringText, templeArr.join('.'));
                        if (this.functions[substringIndex]) expression += this.functions[substringIndex];
                    });
                return addOperate(this.expressionText, expression);
            },
            //分割指标数组
            substringText() {
                return this.expressionText.split(REGEX).map(text => text.trim());
            },
            //分割运算符
            functions() {
                return this.expressionText.trim().match(REGEX_TEXT) || [];
            },
            //表达式转文字
            rightExpressionText() {
                if (this.rightExpression === '') return '';
                let substringText = this.rightExpression.split(REGEX).map(text => text.trim());
                let functions = this.rightExpression.trim().match(REGEX_TEXT) || [];
                let newExpressionText = '';
                let newMeasure = substringText.map(measure => {
                    let event = '',
                        attr = '',
                        aggreator = '',
                        arr = [],
                        measureOption = [];
                    if (!isNaN(Number(measure))) {
                        arr = [measure];
                    } else {
                        measure.split('.')
                            .filter(list => list)
                            .forEach((text, index) => {
                                if (measure === text) {
                                    arr.push(escape(text));
                                }
                                if (index === 1) {
                                    if (escape(text) === ANYTHING_MEASURE.id) {
                                        event = ANYTHING_MEASURE.name;
                                        let eventObj = this.options.find(list => list.key === ANYTHING_MEASURE.key);
                                        if (eventObj) {
                                            measureOption = GENERAL_AGGREATORS.concat(eventObj.attributes);
                                        }
                                    } else {
                                        if (text.split(':').length === 2) {
                                            let eventObj = this.options
                                                .find(list => list.id === Number(escape(text.split(':')[1])));
                                            event = eventObj ? eventObj.name : '';
                                            if (eventObj) {
                                                measureOption = GENERAL_AGGREATORS.concat(eventObj.attributes);
                                            }
                                        } else {
                                            event = '';
                                        }
                                    }
                                }
                                if (index === 2) {
                                    let info = text.split(':');
                                    let aggreatorObj = NUMERICAL_AGGREATORS.find(option => option.id === escape(info[0]))
                                        || GENERAL_AGGREATORS.find(option => option.id === escape(info[0]))
                                        || NONE_NUMERICAL_AGGREATORS.find(option => option.id === escape(info[0]));
                                    aggreator = aggreatorObj ? aggreatorObj.name : '';
                                    if (info.length === 2) {
                                        let attrObj = measureOption.find(list => list.id === Number(escape(info[1])));
                                        attr = attrObj ? attrObj.name : '';
                                        arr = [event, attr, aggreator];
                                    } else {
                                        arr = [event, aggreator];
                                    }
                                }
                            });
                    }
                    return addBrackets(measure, arr.join('.'));
                });
                newMeasure.forEach((measure, index) => {
                    newExpressionText += measure;
                    if (functions[index]) newExpressionText += functions[index];
                });
                return newExpressionText;
            },
            canInput() {
                if (this.substringText[this.currentPosition].length <= 3) {
                    if (this.keyword[this.keyword.length - 1] === '' && this.currentText !== '' && this.wordIndex === 1) {
                        return false;
                    }
                    if (this.keyword[this.keyword.length - 1] !== '' && this.currentText !== ''
                        && this.keyword[this.keyword.length - 1] !== this.currentText && this.wordIndex === 1) {
                        return false;
                    }
                    if (
                        this.keyword[this.keyword.length - 1] === this.currentText
                        && this.currentText !== '' && this.wordIndex === 1
                    ) {
                        return true;
                    }
                    if (this.keyword[this.keyword.length - 1] !== '' && this.currentText !== ''
                        && this.keyword[this.keyword.length - 1] !== this.currentText && this.wordIndex === 0) {
                        return false;
                    }
                    if (this.keyword[this.keyword.length - 1] === this.currentText
                        && this.currentText !== '' && this.wordIndex === 0) {
                        return true;
                    }
                    if (this.keyword[this.keyword.length - 1] !== this.currentText
                        && this.currentText !== '' && this.wordIndex === 2) {
                        return false;
                    }
                }
                if (this.expressionText[this.$refs.text_dom.selectionEnd - 1] === '.') {
                    return false;
                }
                // if (REGEX.test(this.expressionText[this.$refs.text_dom.selectionEnd - 1])) {
                //     return false
                // }
                return true;
            },
            titleText() {
                let obj = this.options.find(list => list.key === this.optionKey);
                return obj ? obj.name : '';
            },
            // 完整的查询条件
            measures() {
                return this.$store.state[EVENT_ANALYSIS_STORE_NAME].query.measures;
            },
        },
        watch: {
            format() {
                this.formatVal = this.format;
            },
            alias() {
                this.customName = this.alias;
            },
            measureExpress() {
                this.expressionText = this.measureExpress;
            }
        },
        mounted() {
            this.formatVal = this.format ? this.format : '2p';
            this.expressionText = this.measureExpress;
            this.customName = this.alias;
        },
        filters: {
            escape
        },
        methods: {
            //计算文字长度
            calculateWidth(text, text2) {
                return textWidth(text) < textWidth(text2) ? textWidth(text2) : textWidth(text);
            },
            //显示计算方式下拉
            calculateOptions(attr) {
                if (!attr) return [];
                if (attr.attrGenre === 1 || attr.attrGenre === 3) {
                    return NUMERICAL_AGGREATORS;
                }
                if (attr.attrGenre !== 1 && attr.attrGenre !== 3) {
                    return NONE_NUMERICAL_AGGREATORS;
                }
            },
            save() {
                let substringText = this.substringText;
                let functions = this.functions;
                let leftBrackets = this.expressionText.match(/[(]/g) || [];
                let rightBrackets = this.expressionText.match(/[)]/g) || [];
                substringText = substringText.filter(list => list !== '');

                if (this.customName === ''){
                    //没有显示为
                    this.empty = this.$t('eventAnalysis.customNameRequire');
                    return;
                }
                if (!COMMON_NAME_REGEXP.test(this.customName)) {
                    // 显示为有特殊符号
                    this.empty = this.$t('common.nameSpecial');
                    return;
                }
                if (this.customName.length > 30) {
                    //显示为过长
                    this.empty = this.$t('eventAnalysis.nameLimit');
                    return;
                }
                let hasName = this.measures
                    .some(list => !isEqual(list, this.currentMeasure) && list.alias === this.customName);
                if (hasName) {
                    //显示为过长
                    this.empty = this.$t('eventAnalysis.noRepeat');
                    return;
                }
                if (this.rightExpression === '') {
                    // 没有指标
                    this.error = this.$t('eventAnalysis.expressionIllegal');
                    return;
                }
                if (this.rightExpression.indexOf('event') === -1) {
                    // 没有指标
                    this.error = this.$t('eventAnalysis.normIllegal');
                    return;
                }
                if (!/^[a-zA-Z_0-9.+/%\-*():]+$/.test(this.rightExpression)) {
                    //没有指标
                    this.error = this.$t('eventAnalysis.signIllegal');
                    return;
                }
                if (this.rightExpressionText !== this.expressionText) {
                    // 表达式错误
                    this.error = this.$t('eventAnalysis.expressionIllegal');
                    return;
                }
                if (this.expressionText[0].match(REGEX_TEXT)) {
                    // 没有指标
                    this.error = this.$t('eventAnalysis.operatorIllegal');
                    return;
                }
                if (functions.length === 0) {
                    // 没有运算符号
                    this.error = this.$t('eventAnalysis.operatorIllegal');
                    return;
                }
                if (functions.length !== substringText.length - 1) {
                    // 运算符号数量错误
                    this.error = this.$t('eventAnalysis.operatorWrongNumber');
                    return;
                }
                if (leftBrackets.length !== rightBrackets.length) {
                    // 括号数量错误
                    this.error = this.$t('eventAnalysis.wrongNumber');
                    return;
                }
                if (this.formatVal === '') {
                    // 比例错误
                    this.error = this.$t('eventAnalysis.chooseWay');
                    return;
                }
                if (REGEX.test(this.expressionText[this.expressionText.length - 1])) {
                    // 运算符号位置错误
                    this.error = this.$t('eventAnalysis.operatorIllegal');
                    return;
                }
                let allRightBrackets = searchSubStr(this.expressionText, ')');
                allRightBrackets.forEach(list => {
                    if (REGEX_TEXT.test(this.expressionText[list - 1])) {
                        this.error = this.$t('eventAnalysis.operatorIllegal');//右括号之前有运算符
                    }
                });
                if (this.error !== '') return;
                this.$emit('custom', {
                    name: this.customName,
                    format: this.formatVal,
                    expression: this.rightExpression,
                    expressionText: this.expressionText,
                    eventIds: uniq(this.eventIds),
                    attrInfoList: uniqBy(this.attrInfoList, 'attrId'),
                });
            },
            //替换或者新增指标
            resetMeasure(option) {
                let substringText = this.substringText;
                let functions = this.functions;
                if (option) {
                    this.keyword[this.wordIndex] = option.name;
                    this.newMeasure.text = this.keyword.join('.');
                }
                let expressionText = [];
                let newExpress = '';
                substringText.forEach((text, index) => {
                    if (index < this.currentPosition) {
                        expressionText.push(text);
                        newExpress += text;
                        if (functions[index]) {
                            newExpress += functions[index];
                        }
                    } else if (index === this.currentPosition) {
                        let newText = addBrackets(text, this.newMeasure.text);
                        expressionText.push(newText);
                        newExpress += newText;
                    } else {
                        expressionText.push(text);
                    }
                    if (functions[index]) {
                        expressionText.push(functions[index]);
                    }
                });
                this.expressionText = expressionText.join('');
                this.beforeTextLength = newExpress.length;
            },
            //改变下拉框的位置
            changeListPosition(selectionEnd) {
                selectionEnd = selectionEnd < 0 ? this.expressionText.length : selectionEnd;
                let textInfo = this.getPositionText(selectionEnd).beforeText;
                let position = textWidth(textInfo);
                let targetPos = addBrackets(this.expressionText.substring(0, selectionEnd), textInfo).length;
                let titleEl = this.$refs.text_title_dom.getElementsByTagName('span')[targetPos];
                if (titleEl) {
                    position = titleEl.getBoundingClientRect().left - this.$refs.custom.getBoundingClientRect().left;
                }
                if (position > this.$refs.custom.getBoundingClientRect().left - 50) {
                    this.$refs.select_list.style.right = 0;
                    this.$refs.select_list.style.left = 'auto';
                    this.$refs.select_list_attr.$el.style.right = 0;
                    this.$refs.select_list_attr.$el.style.left = 'auto';
                } else if (position < 0) {
                    this.$refs.select_list.style.left = 0;
                    this.$refs.select_list.style.right = 'auto';
                    this.$refs.select_list_attr.$el.style.left = 0;
                    this.$refs.select_list_attr.$el.style.right = 'auto';
                } else {
                    this.$refs.select_list.style.left = position + 'px';
                    this.$refs.select_list.style.right = 'auto';
                    this.$refs.select_list_attr.$el.style.left = position + 'px';
                    this.$refs.select_list_attr.$el.style.right = 'auto';
                }
            },
            //触发选择事件或者选择计算方式
            change(option) {
                if (this.wordIndex === 2) {
                    this.resetMeasure(option);
                    this.show = false;
                    this.getPositionText(this.beforeTextLength);
                    this.setPosition(this.beforeTextLength + 1);
                } else if (this.wordIndex === 0) {
                    this.measure = option;
                    this.optionKey = option.key;
                    this.attrAggreator = '';
                    this.keyword[this.wordIndex] = '';
                }
            },
            //触发选择事件属性
            changeAttr({attr, aggreator}) {
                let {id: attrId, attrGenre, attrLength} = attr;
                let newMeasure = this.changeMeasure({
                    attrId,
                    aggreator,
                    attrGenre,
                    numberPrecision: attrGenre === 3 ? attrLength : ''
                });
                let aggreatorObj = NUMERICAL_AGGREATORS.find(option => option.id === newMeasure.aggreator)
                    || GENERAL_AGGREATORS.find(option => option.id === newMeasure.aggreator)
                    || NONE_NUMERICAL_AGGREATORS.find(option => option.id === newMeasure.aggreator);
                // let newAggreator = attr.id === '' ? aggreator : aggreator + ':' + attr.id;
                if (attrId !== '')
                    this.attrInfoList.push({
                        attrGenre,
                        attrId,
                        numberPrecision: attrGenre === 3 ? attrLength : '',
                    });
                let indicatorsArr = [];
                indicatorsArr = attr.id !== ''
                    ? [newMeasure.name, attr.meaning, aggreatorObj.name]
                    : [newMeasure.name, aggreatorObj.name];
                this.newMeasure = {
                    text: indicatorsArr.join('.')
                };
                this.changeIndicators();
                this.attribute = attr;
                this.optionKey = '';
                this.show = false;
            },
            //替换属性或者更新属性
            changeIndicators() {
                if (this.currentText.trim() !== '') {
                    this.resetMeasure();
                    this.setPosition(this.beforeTextLength + 1);//光标移动到下一指标开头
                    this.getPositionText(this.beforeTextLength);
                } else {
                    let beforeText = this.expressionText.substring(0, this.$refs.text_dom.selectionEnd) +
                        this.newMeasure.text;
                    this.expressionText = beforeText + this.expressionText.substring(this.$refs.text_dom.selectionEnd);
                    this.setPosition(beforeText.length);//光标移动
                    this.getPositionText(this.expressionText.length);
                }
            },
            changeMeasure(newMeasurePartial) {
                // 指标中是否包含"用户数"
                const newMeasure = Object.assign({}, this.measure, newMeasurePartial);
                const userCountAgg = GENERAL_AGGREATORS.find(agg => agg.name.includes(this.$t('eventAnalysis.userAmount')));
                newMeasure.userCountInside = userCountAgg && newMeasure.aggreator === userCountAgg.id;
                return newMeasure;
            },
            //通过位置获得当前指标、关键字、位置等
            getPositionText(position) {
                position = position >= this.expressionText.length ? this.expressionText.length : position;
                let functions = this.functions;
                let substringText = this.expressionText.substring(0, position);
                let afterText = '';
                let beforeText = '';

                let currentArr = substringText.split(REGEX);
                let currentPosition = currentArr.length - 1;
                this.currentPosition = currentPosition;
                let wordIndex = currentArr[currentPosition].split('.').length - 1;
                let keyword = currentArr[currentPosition].split('.').map(list => escape(list.trim()));
                let currentText = escape(this.expressionText.split(REGEX)[currentPosition].split('.')[wordIndex]);
                if (
                    ALL_REGEX.test(substringText[substringText.length - 1]) &&
                    ALL_REGEX.test(this.expressionText[substringText.length])
                ) {
                    currentText = '';
                }
                this.expressionText.trim()
                    .split(REGEX)
                    .forEach((field, index) => {
                        const func = functions[index] || '';
                        if (index > currentArr.length - 1) {
                            afterText += field + func;
                        } else if (index === currentArr.length - 1) {
                            beforeText += keyword.slice(0, wordIndex).join('.');
                            afterText += func;
                        } else if (index < currentArr.length - 1) {
                            beforeText += field + func;
                        }
                    });
                this.wordIndex = wordIndex;
                this.keyword = keyword;
                this.currentText = currentText;
                this.beforeText = beforeText;
                this.resetOptions();
                return {
                    wordIndex,      // 当前元素的位置
                    keyword,        // 当前指标的关键字，数组
                    currentText,    // 当前元素，
                    afterText,      // 之后所有指标
                    beforeText,
                    currentPosition
                };
            },
            //通过optionKey、attrAggreator、重现设置下拉选择filterOption
            resetOptions() {
                let measure = this.options.find(option => option.name === this.keyword[0]);
                let optionKey = measure ? measure.key : '';
                if (this.wordIndex === 1) {
                    this.measure = measure;
                    this.optionKey = optionKey;
                }
                if (this.wordIndex === 0) {
                    this.attrAggreator = '';
                    this.optionKey = '';
                } else if (this.wordIndex === 1) {
                    this.optionKey = optionKey;
                    this.attrAggreator = '';
                } else {
                    this.optionKey = optionKey;
                    this.attrAggreator = '11';//不为空
                }
                if (this.keyword.length > 1) {
                    this.measure = measure;
                    this.attribute = measure ? measure.attributes.find(option => option.name === this.keyword[1]) : [];
                }
            },
            //设置光标位置，spos = -1 到input后面
            setPosition(spos, tobj = this.$refs.text_dom) {
                spos = spos < 0 ? this.expressionText.length : spos;
                if (tobj.setSelectionRange) { //兼容火狐,谷歌
                    setTimeout(function () {
                        tobj.setSelectionRange(spos, spos);
                        tobj.focus();
                    }, 0);
                } else if (tobj.createTextRange) { //兼容IE
                    let rng = tobj.createTextRange();
                    rng.move('character', spos);
                    rng.select();
                }
            },
            keyDown(e) {
                if (e.which === 229) {
                    e.preventDefault();
                }
                if (
                    e.keyCode === 37 ||  // Left Arrow
                    e.keyCode === 39 ||// Right Arrow
                    e.keyCode === 8  //删除
                ) {
                    this.$nextTick(() => {
                        this.showList();
                    });
                } else if (
                    e.keyCode >= 96 &&
                    e.keyCode <= 105
                ) {
                    this.cpLock = true;
                    this.$nextTick(() => {
                        this.showList();
                    });
                } else if (
                    e.keyCode >= 48 &&
                    e.keyCode <= 57
                ) {
                    if (
                        e.key === '*' ||
                        e.key === '%' ||
                        e.key === '+' ||
                        e.key === '-'
                    ) {
                        this.cpLock = true;
                        this.$nextTick(() => {
                            this.showList();
                        });
                        if (!this.canInput) e.preventDefault();
                        if (this.wordIndex === 0 && this.currentText === '' && this.keyword[this.keyword.length - 1] === '')
                            e.preventDefault();
                    } else if (
                        e.key === '(' ||
                        e.key === ')'
                    ) {
                        if (!this.canInput) e.preventDefault();
                    } else if (
                        Number(e.key) <= 9 &&
                        Number(e.key) >= 0
                    ) {
                        this.cpLock = true;
                        this.$nextTick(() => {
                            this.showList();
                        });
                    } else {
                        e.preventDefault();
                    }
                } else if (
                    e.keyCode === 187 ||  // +
                    e.keyCode === 189 // -
                ) {
                    if (
                        e.key === '+' ||
                        e.key === '-'
                    ) {
                        this.cpLock = true;
                        this.$nextTick(() => {
                            this.showList();
                        });
                        if (!this.canInput) e.preventDefault();
                        if (this.wordIndex === 0 && this.currentText === '' && this.keyword[this.keyword.length - 1] === '')
                            e.preventDefault();
                    } else {
                        e.preventDefault();
                    }
                } else if (
                    e.keyCode === 191 // /
                ) {
                    if (e.key === '/') {
                        this.cpLock = true;
                        this.$nextTick(() => {
                            this.showList();
                        });
                        if (!this.canInput) e.preventDefault();
                        if (this.wordIndex === 0 && this.currentText === '' && this.keyword[this.keyword.length - 1] === '')
                            e.preventDefault();
                    } else {
                        e.preventDefault();
                    }
                } else if (
                    e.keyCode === 190 &&//.
                    e.key === '.'
                ) {
                    this.cpLock = true;
                    this.$nextTick(() => {
                        this.showList();
                    });
                } else {
                    e.preventDefault();
                }
            },
            //防止中文输入
            compositionStart() {
                this.cpLock = true;
            },
            //恢复中文输入之前的表达式
            compositionEnd() {
                this.cpLock = false;
                if (!this.cpLock) this.templeExpressionText = this.expressionText;
            },
            //防止中文输入
            input() {
                if (!this.cpLock) this.expressionText = this.templeExpressionText;
            },
            showList() {
                this.show = true;
                this.error = '';
                this.changeListPosition(this.$refs.text_dom.selectionEnd);
            },
            hideList() {
                this.show = false;
                this.optionKey = '';
            }
        },
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    $option-height: $input-field-height;

    .custom-indicators {
        position: relative;
        display: inline-block;

        .select-name {
            &.empty {
                border-color: $red;
                background-color: rgba($light-red, .2);
            }
        }

        .custom {
            display: inline-block;
            position: relative;
            width: 500px;
            vertical-align: top;

            label {
                overflow: auto;
                vertical-align: middle;
            }

            .select-title-position {
                white-space: nowrap;
                height: 0;
                overflow: hidden;
            }

            &.error {
                input[type="text"] {
                    border-color: $red;
                    background-color: rgba($light-red, .2);
                }
            }

            .select-input {
                padding-right: 50px;
            }
        }

        .select-title {
            position: absolute;
            z-index: $index-menu;
            top: 4px;
            left: 17px;
            height: $input-field-height - 6;
            line-height: $input-field-height - 6;
            text-align: center;
            @include border-radius(4px);
            background-color: $content-bg;
        }

        .select-text {
            position: relative;
            display: block;
            width: 100%;
            input[type="text"] {
                position: relative;
                @include box-sizing();
                min-width: 100%;
                height: $option-height;
                border: 1px solid $border-color;
                @include border-radius(4px);
                line-height: $option-height - 2px;
                color: $color-title;
                @include user-select(none);
                background-color: white;

                &:not([disabled]) {
                    cursor: pointer;
                }

                &.active,
                &:focus {
                    border: 1px solid $border-color;
                    border-bottom-color: $border-color;
                    border-bottom-right-radius: 0;
                    border-bottom-left-radius: 0;
                    outline: none;

                    + div .select-icon {
                        border-top-color: $color-content;
                    }
                }
            }
        }

        .list-container {
            position: absolute;
            display: inline-block;
            @include box-sizing();
            top: $option-height + 3px;
            border: 1px solid $border-color;
            border-bottom-left-radius: 2px;
            border-bottom-right-radius: 2px;
            background-color: white;
            z-index: $index-menu;
            @include box-shadow(0 3px 3px rgba(#030000, .07));
            @include transform-origin(top);

            &:not(.width-auto) {
                left: 0;
                display: inline-block;
            }

            .select-list {
                max-height: $option-height * 6 + 6px;
                overflow: auto;

                li {
                    display: flex;
                    justify-content: start;
                    align-items: center;
                    height: 35px;
                    &.border {
                        border-bottom: 1px solid #cccccc;
                    }
                }

                .option-null {
                    color: $red;
                    font-weight: normal;
                    display: block;
                    width: 100%;
                    padding: 0 15px;
                    line-height: 35px;
                    box-sizing: border-box;
                    @include transition(all 0.3s ease);

                    span {
                        display: inline-block;
                        vertical-align: top;
                        max-width: 7em;
                        @include ellipsis();
                    }
                }
            }

            input[type='text'] {
                @include box-sizing();
                width: 100%;
                padding: 0 1em;
                text-align: left;
                color: $color-content;
                @include ellipsis();

                &[readonly] {
                    border: 0;
                    cursor: pointer;
                    line-height: $option-height;

                    &:hover {
                        color: $color-title;
                        background-color: $content-bg;
                    }
                }

                &:not([readonly]) {
                    border: 1px solid $border-color;
                    padding: 8px;
                    height: 35px;
                    border-radius: 2px;

                    &:focus {
                        border-color: $border-color;
                    }
                }

                &[disabled] {
                    background-color: transparent;
                    color: $disabled;
                    cursor: not-allowed;
                }

                &.selected {
                    color: $color-title;
                    background-color: $content-bg;
                }
            }
        }

        .selector {
            margin-left: 10px;
        }
    }

</style>
