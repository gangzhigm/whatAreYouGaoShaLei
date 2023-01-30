<template>
    <!--扩展属性-->
    <div class="extended-attr">
        <!--扩展属性说明-->
        <div>
            <h3>{{'form.extendedAttr' | t}}</h3>
            <p class="disabled-text desc">{{'form.desc' | t}}</p>
            <p class="disabled-text desc">{{'form.scenes' | t}}</p>
            <p class="disabled-text desc">{{'form.remark' | t}}</p>
        </div>
        <div class="attr-content">
            <div class="url" :title="attrUrl">{{attrUrl}}</div>
            <template v-for="(extend,index) in extendVals">
                <input class="input margin-lr" type="text" :key="index" :placeholder="$t('form.jumpVal')"
                       v-model="extend.value" maxlength="100">
            </template>
            <i class="icon icon-plus margin-lr" :title="$t('form.addJumpVal')"
               @click="addExtendVal"></i>
            <!--生成链接按钮-->
            <button type="button" class="btn btn-md btn-theme" @click="createLink">
                {{'form.createLink' | t}}
            </button>
        </div>
        <!--生成链接-->
        <div class="attr-content" v-for="link in linkList">
            <div class="url" id="linkUrl" :title="link.formLink">{{link.formLink}}</div>
            <template v-for="extend in link.expandContents">
                <input class="input margin-lr" type="text" :value="extend.value" disabled/>
            </template>
            <div class="icon icon-two-dimensional-code margin-lr hidden-menu-trigger"
                 :title="$t('form.viewCode')">
                <div class="hidden-menu">
                    <img :src="link.qrCodePath" :alt="$t('form.viewCode')">
                </div>
            </div>
            <span class="link-operate margin-lr" v-clipboard:copy="link.formLink"
                  v-clipboard:success="onCopy" v-clipboard:error="onError">
                {{'form.copyLink' | t}}
                </span>
            <span class="margin-lr icon icon-delete" @click="delLink(link)"></span>
        </div>
    </div>
</template>

<script>
    import {COMMON_FORM_NAME_REGEXP} from '@/common/utils/regs';
    import { QuestionnaireApiAuth, QuestionnaireApiForm } from '@/api';

    // 扩展属性字段名
    const fieldNameOne = 'x_field_1',
        fieldNameTwo = 'x_field_2',
        fieldNameThree = 'x_field_3';
    export default {
        name: 'extend-attr',
        props: {
            formId: {
                type: [Number, String],
                required: true
            }
        },
        data() {
            return {
                formInfo: {},// 表单详情
                extendVals: [], // 扩展值列表
                linkList: [], // 链接列表
                fieldNameOne,
                fieldNameTwo,
                fieldNameThree,
                formUrl: '',// 表单初始链接
                saving: false
            };
        },
        mounted() {
            // 扩展属性-初始化扩展值
            this.extendVals = [{name: '', value: ''}];
            if (this.formId) {
                this.fetchForm(this.formId);
                this.fetchExtendList();
            }
        },
        computed: {
            // 扩展属性-生成链接
            attrUrl: {
                get() {
                    let url = this.formUrl;
                    if (this.extendVals.length === 1) {
                        return url + '?' + fieldNameOne + '=' + this.extendVals[0].value;
                    } else if (this.extendVals.length === 2) {
                        return url + '?' + fieldNameOne + '=' + this.extendVals[0].value
                            + '&' + fieldNameTwo + '=' + this.extendVals[1].value;
                    } else if (this.extendVals.length === 3) {
                        return url + '?' + fieldNameOne + '=' + this.extendVals[0].value
                            + '&' + fieldNameTwo + '=' + this.extendVals[1].value
                            + '&' + fieldNameThree + '=' + this.extendVals[2].value;
                    }
                },
                set(val) {
                    return val;
                }
            },
        },
        methods: {
            // 获取表单详情
            fetchForm() {
                QuestionnaireApiAuth
                    .downloadDetailAccess({
                        paperId: this.formId,
                        type: 2,
                    })
                    .then(({body:{data:{isAccess}}})=>{
                        if ( isAccess === 1 ) {
                            QuestionnaireApiForm
                                .getStandardFormDetail(this.formId)
                                .then(res => {
                                    this.formInfo = res.body.data;
                                });
                        } else if ( isAccess === 0 ) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            // 获取扩展属性列表
            fetchExtendList() {
                QuestionnaireApiForm
                    .getExtends(this.formId)
                    .then(res => {
                        this.linkList = res.body.data.extensionValueList;
                        this.formUrl = res.body.data.formUrl; // 表单初始链接
                    });
            },
            // 添加扩展值
            addExtendVal() {
                if (this.extendVals.length >= 3) {
                    this.$toast(this.$t('form.extendValMore'), 'warn');
                    return;
                }
                this.extendVals.push({name: '', value: ''});
            },
            // 生成链接
            createLink() {
                if (this.saving) return;
                this.saving = true;
                if (!this.formId) {
                    this.$toast('请生成表单，再进行表单编辑后设置', 'warn');
                    // 初始化数据
                    this.extendVals = [{name: '', value: ''}];
                    this.saving = false;
                    return;
                }
                // 最终有值的扩展值列表
                let finalExtendVals = this.extendVals.filter(e => e.value !== '' && e.value !== null);
                if (finalExtendVals.length <= 0) {
                    this.$toast(this.$t('form.extendValMini'), 'warn');
                    this.saving = false;
                    return;
                }
                // 当前扩展值name集合
                let extendNames = finalExtendVals.map(f => f.value);

                // 扩展值是否通过校验
                let notChecked = extendNames.filter(e => !COMMON_FORM_NAME_REGEXP.test(e)).length > 0;
                if (notChecked) {
                    this.$toast(this.$t('form.extendValSpecial'), 'warn');
                    this.saving = false;
                    return;
                }
                // 同样的拓展值只能生成一个链接
                /*if (haveLink) {
                    this.$toast('链接已存在', 'warn');
                    return;
                }*/
                if (this.linkList.length >= 100) {
                    this.$toast(this.$t('form.linkMore') + 100 + this.$t('form.linkCount'), 'warn');
                    this.saving = false;
                    return;
                }

                // 生成链接
                QuestionnaireApiForm
                    .addLink(this.formId, finalExtendVals, this.attrUrl)
                    .then(res => {
                        this.$toast(res.body.message, 'success');
                        this.fetchExtendList();
                        // 初始化数据
                        this.extendVals = [{name: '', value: ''}];
                        this.saving = false;
                    })
                    .catch(() =>{
                        this.saving = false;
                    });
            },
            // 复制成功
            onCopy() {
                this.$toast(this.$t('form.copied'), 'success');
            },
            // 复制失败
            onError() {
                this.$toast(this.$t('form.copyErr'), 'error');
            },
            // 删除链接
            delLink(link) {
                this.$confirm(this.$t('common.delete'), this.$t('form.delConfirm'))
                    .then(sure => {
                        if (sure) {
                            QuestionnaireApiForm
                                .delLink(link.extensionValueId)
                                .then(res => {
                                    this.$toast(res.body.message, 'success');
                                    this.fetchExtendList();
                                });
                        }
                    });
            },
        }
    };
</script>

<style type="text/scss" lang="scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';

    .extended-attr {
        .margin-lr {
            margin: 0 8px;
        }
        .desc {
            margin: 8px 0;
        }
        .attr-content {
            height: 32px;
            line-height: 32px;
            margin: 8px 0;
            .url {
                float: left;
                width: 34%;
                margin-right: 4px;
                padding: 0 8px;
                background-color: $disabled;
                cursor: pointer;
                @include ellipsis();
            }
            .icon-two-dimensional-code {
                cursor: pointer;
                font-size: 16px;
                top: 4px;
                position: relative;
            }
            .link-operate {
                vertical-align: middle;
                color: $theme;
                cursor: pointer;
                &:hover {
                    color: $light-theme;
                }
            }
            .hidden-menu-trigger {
                display: inline-block;
                position: relative;
                cursor: pointer;

                &:hover {
                    color: $color-title;
                }

                .hidden-menu {
                    top: $input-field-height;
                    left: 0;
                    @include transform-origin(left top);
                    img {
                        width: 260px;
                        height: 260px;
                    }
                }
            }
        }
    }
</style>