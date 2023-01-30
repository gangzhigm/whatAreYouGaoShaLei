<template>
    <div class="skip-set-wrapper">
        <!--跳转设置-->
        <div class="skip-set">
            <h3>{{'form.skipSet' | t}}</h3>
            <h5>{{'form.setSubmitSuccess' | t}}</h5>
            <div class="success-jump-content">
                <!--提交成功跳转说明-->
                <div class="success-jump">
                    <p class="jump-description">
                        {{'form.jumpDescription' | t}}
                    </p>
                    <p class="jump-description">
                        {{'form.jumpDescriptionLineOne' | t}}
                    </p>
                    <p class="jump-description">
                        {{'form.jumpDescriptionLineTwo' | t}}
                    </p>
                    <p class="jump-description">
                        {{'form.jumpDescriptionLineThree' | t}}
                    </p>
                    <div class="margin">
                        <radio :source="0" v-model="skipType">{{'form.defaultSkip' | t}}</radio>
                        <radio :source="1" v-model="skipType">{{'form.ruleSet' | t}}</radio>
                    </div>
                    <!--默认跳转-->
                    <div v-show="skipType === 0">
                        <!--                    <label class="label" for="contentEditor">{{'form.defaultSkip' | t}}</label>-->
                        <div class="material-editor">
                            <div class="types">
                                <radio :source="0" v-model="currentMaterialType">{{'form.defaultSuccess' | t}}</radio>
                                <radio :source="3" v-model="currentMaterialType">{{'form.link' | t}}</radio>
                            </div>
                            <div class="content-editor">
                                <!-- 默认提交成功 -->
                                <template v-if="currentMaterialType === 0">
                                    <div class="submit-default">
                                        <div class="form-sub-img" >
                                            <img :src="htmlStyle.imageUrl" :style="{display:htmlStyle.imgShow?'':'none'}">
                                            <p class="form-title" :title="currentFormName"
                                               :style="{fontSize:htmlStyle.titleFont+'px', fontWeight:htmlStyle.titleBold===true?'bold':'normal',
                                               color:htmlStyle.titleColor,display:htmlStyle.formTitleShow?'':'none'}">
                                                {{currentFormName}}
                                            </p>
                                            <p class="form-title" :title="htmlStyle.text"
                                               :style="{fontSize:htmlStyle.textFont+'px', fontWeight:htmlStyle.textBold===true?'bold':'normal',
                                               color:htmlStyle.textColor,display:htmlStyle.textShow?'':'none'}" v-html="htmlStyleText"></p>
                                        </div>
                                    </div>
                                </template>
                                <!-- 链接 -->
                                <template v-else-if="currentMaterialType === 3">
                                    <input class="input lg link-input" :class="{error: linkErrorText}" type="text"
                                           v-model="materialLink" maxlength="500" :placeholder="$t('form.link')"
                                           :title="materialLink" v-title:top.line.warn="linkErrorText"
                                           @focusin="linkErrorText = ''">
                                </template>
                            </div>
                        </div>
                    </div>
                    <!--规则设置-->
                    <div class="rules" v-show="skipType === 1">
                        <h5>{{'form.rules' | t}}</h5>
                        <p class="disabled-text rule-desc">{{'form.roleSetDescription' | t}}</p>
                        <div class="rules-content" id="rulesSet">
                            <button type="button" class="add-condition-btn" @click="addRules">
                                <svg>
                                    <use xlink:href="#icon-plus"></use>
                                </svg>
                                &nbsp;{{'form.addRule' | t}}
                            </button>
                            <table v-if="rulesList.length > 0">
                                <thead>
                                <th>{{'form.fieldName' | t}}</th>
                                <th>{{'form.fieldVal' | t}}</th>
                                <th>{{'form.jumpTo' | t}}</th>
                                </thead>
                                <tbody>
                                <tr v-for="(r,index) in rulesList">
                                    <td>
                                        <selector :options="fieldNameList" v-model="r.id" search
                                                  @select="selectFieldName(r,$event)"></selector>
                                    </td>
                                    <td>
                                        <template v-if="r.id">
                                            <!--1-单行文字,2-多行文字,3-单项选择,4-多项选择,5-时间,6-日期,7-下拉框,
                                            8-多级下拉框,9-描述,10-订阅-->
                                            <selector v-if="fieldNameList.$getByKey(r.id)
                                                           && fieldNameList.$getByKey(r.id).fieldValList.length && r.fieldType !== 4"
                                                      :options="fieldNameList.$getByKey(r.id).fieldValList" v-model="r.fieldValueId" search
                                                      @select="selectFieldVal($event,index)"></selector>
                                            <selector v-if="r.fieldType === 10" :options="subscriptionList"
                                                      v-model="r.fieldValueId" @select="selectFieldVal($event,index)"></selector>
                                            <field-select-tree v-if="r.fieldType === 8"
                                                               :options="fieldNameList.$getByKey(r.id).multiFieldValList"
                                                               v-model="r.fieldValueId" @input="selectMultiField(r,$event)"></field-select-tree>
                                            <input v-if="r.fieldType === 1 || r.fieldType === 2 || r.fieldType === 9"
                                                   type="text" class="input" v-model.trim="r.fieldValue">
                                            <multi-select v-if="r.fieldType === 4 && fieldNameList.$getByKey(r.id)"
                                                          :options="fieldNameList.$getByKey(r.id).fieldValList"
                                                          :dropDirection="'bottom'"
                                                          v-model="r.fieldValueIds" search
                                                          @input="selectFieldVal($event,index)" :placeholder="$t('common.selectHolder')"
                                                          :shortcutAction="false"></multi-select>
                                            <calendar v-if="r.fieldType === 6" v-model="r.fieldValue"></calendar>
                                            <hourMinuteSelect v-if="r.fieldType === 5" v-model="r.fieldValue"></hourMinuteSelect>
                                        </template>
                                        <template v-else>
                                            <selector v-if="fieldValList.length"
                                                      :options="fieldValList" v-model="r.fieldValueId" search
                                                      @select="selectFieldVal($event,index)"></selector>
                                            <input v-if="!fieldValList.length && !multiFieldValList.length"
                                                   type="text" class="input" v-model="r.fieldValue">
                                        </template>
                                    </td>
                                    <td>
                                        <input class="input lg" :class="{error: r.ruleErrorText}"
                                               type="text"
                                               :placeholder="$t('form.link')" v-model="r.url"
                                               maxlength="255" :title="r.url"
                                               v-title:top.line.warn="r.ruleErrorText"
                                               @focusin="r.ruleErrorText = ''"/>
                                    </td>
                                    <td>
                                        <i class="action-icon icon icon-delete" @click="delRules(index)"></i>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            <!--字段值未匹配时-->
                            <div class="match-error-url">
                                <span>{{'form.matchErrorUrl' | t}}</span>
                                <input class="input lg link-input" :class="{error: matchErrorLinkText}" type="text"
                                       v-model="matchErrorLink" maxlength="255" :placeholder="$t('form.link')"
                                       :title="matchErrorLink" v-title:top.line.warn="matchErrorLinkText"
                                       @focusin="matchErrorLinkText = ''">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!--提交失败跳转-->
            <div>
                <h5>{{'form.setSubmitError' | t}}</h5>
                <div class="flex submit-error">
                    <div class="error">
                        <i class="icon icon-warn" v-title:right.line="$t('form.submitErrorExplanation')"></i>
                        <span>{{'form.submitErrorTiny' | t}}</span>
                        <input class="input xl link-input" :class="{error: submitErrorLinkText}" type="text"
                               v-model="submitErrorLink" maxlength="255" :placeholder="$t('form.link')"
                               :title="submitErrorLink" v-title:top.line.warn="submitErrorLinkText"
                               @focusin="submitErrorLinkText = ''">
                    </div>
                </div>
            </div>
            <!--保存按钮-->
            <button type="button" class="btn btn-md btn-theme save-btn" @click="beforeSaveSkip">
                {{'common.save' | t}}
            </button>
        </div>
        <!--        提示样式-->
        <div class="prompt-style" v-show="skipType===0&&currentMaterialType===0">
            <div class="style-header">
                {{'form.promptStyle' | t}}
            </div>
            <ul class="prompt-options">
                <li class="option-title">
                    <h5 class="option-h option" @click="imgputFlag=!imgputFlag" :class="{toActive:!imgputFlag}">
                        <div class="arrow-rotate" :class="{toActive:!imgputFlag}">
                            <i class="icon icon-caret-down" ></i>
                        </div>
                        {{'form.promptImg' | t}}
                    </h5>
                    <div class="image-content" v-if="imgputFlag">
                        <div class="show-flag option">
                            <span class="show-title">{{'form.display' | t}}</span>
                            <span class="show" :class="{showActive:htmlStyle.imgShow}" @click="htmlStyle.imgShow=true">{{'form.displayYes' | t}}</span>
                            <span class="show" :class="{showActive:!htmlStyle.imgShow}" @click="htmlStyle.imgShow=false">{{'form.displayNo' | t}}</span>
                        </div>
                        <div v-if="htmlStyle.imgShow">
                            <p class="option">{{'form.customImage' | t}}</p>
                            <label class="img-center" for="file" v-show="!htmlStyle.alreadyUpFlag">
                                <div class="customize-img">
                                    <p>{{'form.uploadImage' | t}}</p>
                                    <p>{{'form.supports5M' | t}}</p>
                                </div>
                                <template>
                                    <input type="file" id="file" ref="inputImg" @change="uploadImage">
                                </template>
                            </label>
                            <div class="selected-img" v-show="htmlStyle.alreadyUpFlag">
                                <div class="selected-box"><img :src="htmlStyle.imageUrl"></div>
                                <label for="file">
                                    <span class="theme-text">{{'form.reUpload' | t}}</span>
                                </label>
                                <span class="theme-text" @click="restoreDefault">{{'form.defaultImage' | t}}</span>
                            </div>
                        </div>
                    </div>
                </li>
                <li class="option-title">
                    <h5 class="option-h option" @click="textputFlag=!textputFlag" >
                        <div class="arrow-rotate" :class="{toActive:!textputFlag}">
                            <i class="icon icon-caret-down" ></i>
                        </div>
                        {{'form.promptText' | t}}
                    </h5>
                    <div class="text-content" v-if="textputFlag">
                        <!-- 提示文字 -->
                        <div class="show-flag option">
                            <span class="show-title">{{'form.promptText' | t}}</span>
                            <span class="show" :class="{showActive:htmlStyle.textShow}" @click="htmlStyle.textShow=true">{{'form.displayYes' | t}}</span>
                            <span class="show" :class="{showActive:!htmlStyle.textShow}" @click="htmlStyle.textShow=false">{{'form.displayNo' | t}}</span>
                        </div>
                        <div>
                            <!--自定义文字-->
                            <div v-if="htmlStyle.textShow">
                                <div class="option">
                                    <span>{{'form.customText' | t}}</span>
                                    <textarea class="textarea" cols="15" rows="2" maxlength="50" v-model="htmlStyle.text"></textarea>
                                </div>
                                <!--文字样式-->
                                <div class="style-option option">
                                    <span>{{'form.textStyle' | t}}</span>
                                    <div class="color-pic"><color-picker v-model="htmlStyle.textColor"></color-picker></div>
                                    <div class="counter-wrapper">
                                        <counter :value="htmlStyle.textFont" :type="'text'" :min="12" :max="36"  :unitFlag="true" :unit="'px'"
                                                 @currentValue="currentValue"></counter>
                                    </div>
                                    <button class="btn btn-white" :class="{boldActive:htmlStyle.textBold}"
                                            @click="htmlStyle.textBold=!htmlStyle.textBold">B</button>
                                </div>
                            </div>
                            <!--表单标题-->
                            <div class="option">
                                <div class="show-flag option">
                                    <span class="show-title">{{'form.formTitle' | t}}</span>
                                    <span class="show" :class="{showActive:htmlStyle.formTitleShow}" @click="htmlStyle.formTitleShow=true">{{'form.displayYes' | t}}</span>
                                    <span class="show" :class="{showActive:!htmlStyle.formTitleShow}" @click="htmlStyle.formTitleShow=false">{{'form.displayNo' | t}}</span>
                                </div>
                            </div>
                            <!--标题文字-->
                            <div class="style-option option" v-if="htmlStyle.formTitleShow">
                                <span>{{'form.titleText' | t}}</span>
                                <div class="color-pic"><color-picker v-model="htmlStyle.titleColor"></color-picker></div>
                                <div class="counter-wrapper">
                                    <counter :value="htmlStyle.titleFont" :type="'form'" :min="12" :max="36" :unitFlag="true" :unit="'px'"
                                             @currentValue="currentValue"></counter>
                                </div>
                                <button class="btn btn-white" :class="{boldActive:htmlStyle.titleBold}"
                                        @click="htmlStyle.titleBold=!htmlStyle.titleBold">B</button>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>

        </div>
    </div>

</template>

<script>
    import fieldSelectTree from './common/field-select-tree.vue';
    import counter from '../../../common/components/counter.vue';
    import { QuestionnaireApi, QuestionnaireApiV1 } from '@/api';

    const UNUSUAL_URL_REGEXP = /\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?/i;

    export default {
        name: 'jump-set',
        props: {
            formId: {
                type: [Number, String],
                required: true
            },
            formName:{
                type: String,
            }
        },
        components: {
            fieldSelectTree,
            counter
        },
        mounted() {
            // 跳转设置
            this.fetchFieldList();// 获取字段列表
            this.currentFormName = this.formName;
        },
        computed: {
            // 跳转设置-文字-长度
            textContentLength() {
                if (this.currentMaterialType !== 1) return 0;
                return Number(this.materialContent.substring(0, 600).length);
            },
        },
        watch: {
            'htmlStyle.text'() {
                this.htmlStyleText = this.symbolTran(this.htmlStyle.text);
            }
        },
        data() {
            return {
                currentMaterialType: 0, // 类型 0 默认提交成功；1 文本；2 富文本； 3 链接
                materialContent: '',// 文字内容
                materialRichText: '',// 富文本内容
                materialLink: '',// 链接内容
                linkErrorText: '',// 链接错误提示
                rulesList: [// 规则设置列表
                    // id:'',               field-属性名称
                    // name:'',             fieldName-字段名称
                    // fieldValueId:'',     字段值id
                    // fieldValue:'',       字段值
                    // url:'',              跳转链接
                    // ruleErrorText: '',   错误提示
                    // fieldType: '',       属性类型：1-单行文字,2-多行文字,3-单项选择,4-多项选择,5-时间,6-日期,7-下拉框,
                    // 8-多级下拉框,9-描述,10-订阅,11-验证码】
                    // type: '',            字段类型：1-字符串,2-整数,3-时间,4-小数】
                    // value:[],            字段值列表
                ],
                fieldList: [], // 字段列表（字段名称，字段值）
                fieldNameList: [], // 字段名称列表
                fieldValList: [], // 字段值列表
                multiFieldValList: [],
                skipType: 0,// 默认跳转  规则设置 todo
                submitErrorLinkText: '', //  提交失败跳转链接填写错误提示
                submitErrorLink: 'https://form.dmartech.cn/form/failed.html', // 提交失败跳转链接
                matchErrorLinkText: '', // 匹配失败跳转链接填写错误提示
                matchErrorLink: '', // 匹配失败跳转链接,
                isConfirmDifferentJumpSet: false,  // 是否确认在规则中设置不同的字段
                subscriptionList: [
                    {name: this.$t('common.yes'), id: 1},
                    {name: this.$t('common.no'), id: 2}
                ],

                imgputFlag: true,//提示图片收起展开
                textputFlag: true,//提示文字收起展开
                currentFormName:'',//表单name

                htmlStyleText:'',
                htmlStyle:{//样式提示
                    imgShow: true,//提示图片是否显示 true显示，false不显示
                    imageUrl:'',//提示图片地址
                    alreadyUpFlag: false,//自定义图片 true已自定义 false未自定义
                    textShow: true,//提示文字是否显示 true显示，false不显示
                    text:this.$t('form.SubSuccess'),//自定义文字
                    textColor:'#000000',//提示文字颜色
                    textFont:20,//提示文字大小 默认20
                    textBold: false,//提示文字是否加粗 true加粗 false不加粗
                    formTitleShow: true,//表单标题是否显示 true显示，false不显示
                    titleColor:'#000000',//标题文字 颜色
                    titleFont:14,//标题字体大小 默认14
                    titleBold: false,//标题文字 true加粗 false不加粗
                    htmlDivString1:'',//默认跳转时样式需要拼接成html 表单名称前半截
                    htmlDivString2:'',//默认跳转时样式需要拼接成html 表单名称后半截
                },
                defaultImgUrl: 'https://form.dmartech.cn/form/7A2909CA-3C16-4FD5-ABDA-3907A5A75EE3.png', //默认图片地址
            };
        },
        methods: {
            //textarea字符转换
            symbolTran(content) {
                let replaceRegex = /(\n\r|\r\n|\r|\n)/g;
                return content.replace(replaceRegex, '<br/>');
            },
            // -----------------------跳转设置start
            // 获取字段列表
            fetchFieldList() {
                QuestionnaireApiV1
                    .getFieldList(this.formId)
                    .then(res => {
                        // 字段列表
                        this.fieldList = res.body.data;
                        // 字段名称列表
                        this.fieldNameList = this.fieldList.map(f => {
                            let or = {};
                            or.id = f.field; // 唯一
                            or.name = f.fieldName;
                            or.fieldType = f.fieldType;
                            or.type = f.type;
                            or.value = f.value ? JSON.parse(f.value) : [];
                            or.fieldValList = f.fieldType !== 8 ? or.value.map((v, index) => {
                                let ov = {};
                                ov.id = index + 1;
                                ov.name = v.name;
                                return ov;
                            }) : [];
                            or.multiFieldValList = f.fieldType === 8 ? or.value.map((v, index) => {
                                let ov = {};
                                ov.id = index + 1;
                                ov.name = v.name;
                                ov.childList = v.nextGrade;
                                return ov;
                            }) : [];
                            return or;
                        });
                        // 获取规则设置列表
                        this.fetchRuleList();
                    });
            },
            // 获取规则设置列表
            fetchRuleList() {
                // 编辑-获取跳转规则 object
                QuestionnaireApi
                    .getRules(this.formId)
                    .then(res => {
                        if (res.body.data) {
                            // 初始化规则设置列表
                            let jumpData = res.body.data;
                            this.skipType = res.body.data.type;
                            this.currentMaterialType = jumpData.jumpType;

                            this.submitErrorLink = jumpData.submitErrorUrl || '';
                            this.matchErrorLink = jumpData.matchErrorUrl || '';

                            //链接
                            this.materialLink = jumpData.jumpContent || '';
                            //默认提交成功
                            this.htmlStyle = JSON.parse(jumpData.htmlStyle);
                            this.htmlStyle.imageUrl = jumpData.imageUrl;
                            this.htmlStyleText = this.symbolTran(this.htmlStyle.text);

                            //返回的提示文字中带有<br/>时转换/n，回显在textarea中
                            if (this.htmlStyle.text.indexOf('<br/>')) {
                                this.htmlStyle.text = this.htmlStyle.text.replace(/<br\/>/g, '\n');
                            }

                            if (jumpData.matchRule) {
                                let matchRule = JSON.parse(jumpData.matchRule);
                                let rules = matchRule.rule;
                                this.rulesList = rules.map(r => {
                                    let or = {};
                                    or.id = r.field;
                                    or.name = r.fieldName;
                                    or.fieldValueId = r.fieldValueId;
                                    or.fieldValue = r.fieldValue;
                                    or.url = r.url;
                                    or.ruleErrorText = '';
                                    or.fieldValueIds = r.fieldValueIds;
                                    or.fieldType = r.fieldType;
                                    return or;
                                });
                                this.isConfirmDifferentJumpSet = true;
                            }
                        } else {
                            this.htmlStyle.imageUrl = this.defaultImgUrl;
                            this.htmlStyleText = this.htmlStyle.text;
                        }
                    });
            },
            // 选择字段名
            selectFieldName(item,event) {
                if (this.rulesList.filter(rule => rule.id !== event.id).length && !this.isConfirmDifferentJumpSet) {
                    this.$confirm(this.$t('form.differenceJumpSetTitle'), this.$t('form.differenceJumpSetContent'))
                        .then(res =>{
                            if (!res) {
                                item.id = '';
                            } else {
                                this.isConfirmDifferentJumpSet = true;
                            }
                        });
                }
                item.name = event.name;
                // 1-单行文字,2-多行文字,3-单项选择,4-多项选择,5-时间,6-日期,7-下拉框,8-多级下拉框,9-描述,10-订阅,11-验证码,12-提交按钮
                item.fieldType = this.fieldNameList.$getByKey(event.id).fieldType;
                item.fieldValue = '';
                item.fieldValueId = '';
                item.fieldValueIds = [];
            },
            // 选择字段值
            selectFieldVal(event, index) {
                if (this.rulesList[index].fieldType === 4) {
                    let id = this.rulesList[index].id;
                    let list = this.fieldNameList.$getByKey(id).fieldValList;
                    let names = [];
                    event.forEach(ids =>{
                        list.forEach(elm =>{
                            if (elm.id === ids) {
                                names.push(elm.name);
                            }
                        });
                    });
                    this.rulesList[index].fieldValue = names.toString();
                } else {
                    this.rulesList[index].fieldValue = event.name;
                }
            },
            // 选择字段值 多项选择
            selectMultiField(item,event) {
                item.fieldValueId = event.id;
                item.fieldValue = event.value;
            },
            // 添加规则
            addRules() {
                if (this.rulesList.length >= 200) {
                    this.$toast(this.$t('form.linkMore') + 200 + this.$t('form.linkCount'), 'warn');
                    return;
                }
                this.rulesList.push({
                    id: '',
                    name: '',
                    fieldValueId: '',
                    fieldValueIds: [],
                    fieldValue: '',
                    url: '',
                    ruleErrorText: '',
                    fieldType: '',
                    type: '',
                });
            },
            // 删除规则
            delRules(index) {
                /*this.$confirm(this.$t('common.delete'), this.$t('form.delConfirm'))
                    .then(sure => {
                        if (sure) {*/
                this.rulesList.splice(index, 1);
                /*}
            });*/
            },
            // 跳转设置-保存之前数据准备
            beforeSaveSkip() {
                let matchRule = '',     // 跳转规则
                    formatRule = {},    // 格式化后的跳转规则
                    isBad = false;      // 默认跳转为链接时，错误校验
                if (!this.submitErrorLink) {
                    this.submitErrorLinkText = this.$t('form.linkNull');
                    return;
                }
                if (!UNUSUAL_URL_REGEXP.test(this.submitErrorLink)) {
                    this.submitErrorLinkText = this.$t('QRCode.badUrl');
                    return;
                }

                let imgShow = this.htmlStyle.imgShow ? 'inline' : 'none';
                let fontWeight = this.htmlStyle.titleBold ? 'bold' : 'normal';
                let formTitleShow = this.htmlStyle.formTitleShow ? 'block' : 'none';
                let titleColor = this.htmlStyle.titleColor ? this.htmlStyle.titleColor : '#000000';
                let textBold = this.htmlStyle.textBold ? 'bold' : 'normal';
                let textShow = this.htmlStyle.textShow ? 'block' : 'none';
                let textColor = this.htmlStyle.textColor ? this.htmlStyle.textColor : '#000000';

                if (this.skipType === 0) { // 默认跳转
                    switch (this.currentMaterialType) {
                        case 0: // 默认跳转
                            //提示图片 提示文字选择不显示时恢复初始值
                            if (!this.htmlStyle.imgShow) {
                                this.htmlStyle.imageUrl = 'https://form.dmartech.cn/form/7A2909CA-3C16-4FD5-ABDA-3907A5A75EE3.png';
                                this.htmlStyle.alreadyUpFlag = false;
                            }
                            if (!this.htmlStyle.textShow) {
                                this.htmlStyle.text = this.$t('form.SubSuccess');
                                this.htmlStyle.textColor = '#000'; //提示文字颜色
                                this.htmlStyle.textFont = 20; //提示文字大小 默认12
                                this.htmlStyle.textBold = false; //提示文字是否加粗 true加粗 false不加粗
                            } else {
                                if (this.htmlStyle.text === '') this.htmlStyle.text = this.$t('form.SubSuccess');
                            }
                            if (!this.htmlStyle.formTitleShow) {
                                this.htmlStyle.titleColor = '#000';//标题文字 颜色
                                this.htmlStyle.titleFont = 14;//标题字体大小 默认12
                                this.htmlStyle.titleBold = false;//标题文字 true加粗 false不加粗
                            }

                            this.htmlStyle.htmlDivString1 = `<div class="form-sub-img" >
                                            <img src="${this.htmlStyle.imageUrl}" style="display:${imgShow};max-width: 150px;max-height: 150px;">
                                            <p class="form-title" style="font-size:${this.htmlStyle.titleFont}px;font-weight:${fontWeight};
                                               color:${titleColor};display:${formTitleShow}">`;
                            this.htmlStyle.htmlDivString2 = `</p>
                                            <p class="form-title" style="font-size:${this.htmlStyle.textFont}px; font-weight:${textBold};color:${textColor};display:${textShow}">
                                            ${this.htmlStyleText}</p></div>`;
                            this.materialLink = '';
                            this.saveSkip('', '', this.skipType);
                            break;
                        case 3: // 链接
                            if (!this.materialLink) {
                                this.linkErrorText = this.$t('QRCode.emptyUrl');
                                return;
                            } else if (!UNUSUAL_URL_REGEXP.test(this.materialLink)) {
                                this.linkErrorText = this.$t('QRCode.badUrl');
                                return;
                            }
                            this.clearDefaults();
                            this.saveSkip(this.materialLink, '', this.skipType);
                            break;
                    }
                } else if (this.skipType === 1) { // 规则设置
                    this.rulesList.forEach(r => {
                        if (r.id === '' || r.name === '' || r.fieldValue === '' || r.url === '') {
                            this.$toast(this.$t('form.ruleNull'), 'warn');
                            isBad = true;
                        }
                        if (!r.url) {
                            r.ruleErrorText = this.$t('form.linkNull');
                            isBad = true;
                        } else if (!UNUSUAL_URL_REGEXP.test(r.url)) {
                            r.ruleErrorText = this.$t('QRCode.badUrl');
                            isBad = true;
                        }
                    });
                    if (!this.matchErrorLink) {
                        this.matchErrorLinkText = this.$t('form.linkNull');
                        return;
                    }
                    if (!UNUSUAL_URL_REGEXP.test(this.matchErrorLink)) {
                        this.matchErrorLinkText = this.$t('QRCode.badUrl');
                        return;
                    }
                    if (!isBad) {
                        // 格式化规则列表
                        if (this.rulesList.length > 0) {
                            formatRule.rule = [];
                            this.rulesList.forEach(r => {
                                formatRule.rule.push({
                                    field: r.id,
                                    fieldName: r.name,
                                    fieldValueId: r.fieldValueId,
                                    fieldValue: r.fieldValue,
                                    url: r.url,
                                    fieldValueIds: r.fieldValueIds,
                                    fieldType: r.fieldType
                                });
                            });
                            // 转为Json格式
                            matchRule = JSON.stringify(formatRule);
                            this.saveSkip('', matchRule, this.skipType);
                        } else {
                            this.$toast(this.$t('form.emptyRule'), 'warn');
                        }
                    }
                }
            },
            // 跳转设置-保存
            saveSkip(jumpContent, matchRule, type) {
                let assignHtmlStyleJson = Object.assign({}, this.htmlStyle);
                assignHtmlStyleJson.text = this.symbolTran(this.htmlStyle.text);
                let htmlStyleJson = JSON.stringify(assignHtmlStyleJson);
                QuestionnaireApi
                    .saveForJump({
                        formId: this.formId,
                        type,
                        jumpContent,
                        matchRule,
                        jumpType: this.currentMaterialType,
                        submitErrorUrl: this.submitErrorLink,
                        matchErrorUrl: this.matchErrorLink,
                        formName: this.currentFormName,
                        htmlStyle: htmlStyleJson,
                        imageUrl: this.htmlStyle.imageUrl,
                    })
                    .then(res => {
                        this.$toast(res.body.message, 'success');
                    });
            },
            // -----------------------跳转设置end

            // 上传自定义图片
            uploadImage(e) {
                const file = e.target.files[0];
                e.target.value = '';
                if (!/\.(jpe?g|png)$/i.test(file.name)) {
                    this.$toast(this.$t('wechatContent.picFormatErr'), 'warn');
                    return false;
                }
                if (file.size > 5 * 1024 * 1024) {
                    this.$toast(this.$t('wechatContent.picSizeErr'), 'warn');
                    return false;
                }
                QuestionnaireApiV1
                    .uploadCusImg(file)
                    .then(({body:{data}}) => {
                        this.htmlStyle.imageUrl = data.ossUrl;
                        this.htmlStyle.alreadyUpFlag = true;
                        this.$toast('上传成功', 'success');
                    });
            },
            //还原默认图片
            restoreDefault() {
                this.htmlStyle.imageUrl = this.defaultImgUrl;
                this.htmlStyle.alreadyUpFlag = false;
            },
            //选择链接跳转保存后恢复默认跳转设置数据
            clearDefaults() {
                this.restoreDefault();
                this.htmlStyle.imgShow = true;
                this.htmlStyle.textShow = true;
                this.htmlStyle.text = this.$t('form.SubSuccess');
                this.htmlStyle.textColor = '#000';
                this.htmlStyle.textFont = 20;
                this.htmlStyle.textBold =  false;
                this.htmlStyle.formTitleShow = true;
                this.htmlStyle.titleColor = '#000';
                this.htmlStyle.titleFont = 14;
                this.htmlStyle.titleBold =  false;
            },
            //获取变更后的字体大小
            currentValue(font,type){
                if (type === 'text') {
                    this.htmlStyle.textFont = font;
                } else {
                    this.htmlStyle.titleFont = font;
                }
            }
        },
    };
</script>

<style type="text/scss" lang="scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';
    .skip-set-wrapper{
        display: flex;
        justify-content: space-between;
        .skip-set {
            padding-left: 20px;
            h5{
                margin: 20px 0 10px 0;
                font-weight: bold;
            }
            .margin {
                margin: 10px 0;
            }
            $form-offset: 20px;
            .form-field {
                margin-top: 32px;
            }

            .material-editor {
                display: inline-block;
                width: 750px;
                .types{
                    margin: 10px 0;
                }

                .content-editor {
                    margin-top: 10px;
                    .link-input {
                        margin: 16px;
                    }
                    .submit-default{
                        width: 580px;
                        min-height: 350px;
                        border: 1px solid $form-border;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        .form-sub-img{
                            width: 560px;
                            min-height: 250px;
                            margin: auto;
                            text-align: center;
                            padding-top: 30px;
                            img{
                                display: inline-block;
                                width: 150px;
                                height: 150px;
                            }
                            p{
                                padding: 5px 0;
                            }
                        }
                    }
                }
            }

            .rules {
                .rule-desc {
                    color: $disabled;
                    margin-left: 80px;
                }
                .rules-content {
                    margin-left: 80px;
                    .add-condition-btn {
                        height: 22px;
                        line-height: 22px;
                        border: none;
                        padding: 0;
                        background-color: transparent;
                        color: $green;
                        cursor: pointer;

                        &:hover {
                            color: $light-green;
                        }

                        svg {
                            display: inline-block;
                            width: 1em;
                            height: 1em;
                            vertical-align: top;
                            margin-top: 5px;
                            fill: currentColor;
                        }
                    }
                    .multi-select {
                        max-width: 310px;
                        min-width: 145px;
                    }
                }
            }

            .disabled-text {
                margin-left: 65px;
            }

            .submit-error {
                .icon-warn {
                    font-size: 15px;
                }
            }

            .match-error-url {
                margin-top: 8px;
            }
            .jump-description{
                line-height: 32px;
            }
        }
        .prompt-style{
            background-color: $content-bg;
            width: 330px;
            .style-header{
                text-align: center;
                background-color: $theme;
                color: #fff;
                line-height: 48px;
            }
            .prompt-options{
                .option{
                    margin-bottom: 10px;
                }
                svg{
                    width: 10px;
                    height: 10px;
                }
                .option-title{
                    box-sizing: border-box;
                    width: 330px;
                    .option-h{
                        border: 1px solid $form-border;
                        padding: 10px 5px;
                        background-color: white;
                        display: flex;
                        .arrow-rotate{
                            width: 16px;
                            height: 16px;
                            &.toActive{
                                @include transform(rotate(-90deg))
                            }
                        }
                    }

                    .image-content{
                        padding: 10px;
                        .img-center{
                            display: block;
                            border: 1px solid $form-border;
                            background-color: #fff;
                            padding: 10px 0;
                            .customize-img{
                                text-align: center;
                            }
                            input{
                                display: none;
                            }
                        }
                        .selected-img{
                            text-align: center;
                            display: flex;
                            .selected-box{
                                width: 60px;
                                height: 60px;
                                img{
                                    width: 100%;
                                    height: 100%;
                                }
                            }
                            .theme-text{
                                display: inline-block;
                                margin: 0 5px;
                                line-height: 60px;
                                cursor: pointer;
                            }

                        }
                    }
                    .show-flag{
                        display: flex;
                    }
                    .show-title{
                        line-height: 28px;
                        margin-right: 15px;
                    }
                    .show{
                        display: block;
                        border: 1px solid $form-border;
                        padding: 5px 10px;
                        cursor: pointer;
                    }
                    .showActive{
                        background-color: $theme;
                        color: #fff;
                    }
                }
                .text-content{
                    padding: 10px;
                    .style-option{
                        display: flex;
                    }
                    .boldActive{
                        background-color: #000000;
                        color: white;
                        font-weight: bold;
                    }
                }
                .counter-wrapper{
                    margin: 0 10px;
                }
                .color-pic{
                    margin-left: 15px;
                }
            }
        }
    }


</style>
