<template>
    <loading v-if="loading"/>
    <div v-else class="material-preview-wrapper">
        <ul class="device"
            v-if="toolbar && (material.type === 1 || material.type === 3 || material.type === 6 || material.isHF)">
            <li class="pc" :class="{active: device === 'pc'}" v-title:top="$t('material.pcPreview')"
                @click="device = 'pc'">
                <i class="icon icon-pc"></i>
            </li>
            <li class="mobile" :class="{active: device === 'mobile'}" v-title:top="$t('material.mobilePreview')"
                @click="device = 'mobile'">
                <i class="icon icon-mobile"></i>
            </li>
        </ul>
        <iframe v-if="material.type === 1 || material.type === 3 || material.type === 6 || material.isHF"
                class="email-preview-frame"
                :class="device"
                :srcdoc="content"
                ref="emailPreviewFrame"></iframe>
        <!-- material.type 可能是字符串 -->
        <div v-if="material.type == 0" class="sms-preview-frame">
            <div class="sms-preview-frame-content">
                <!-- comments necessary cuz white spaces are visible -->
                <div class="sms-preview-bubble"><!--
                    -->{{signature ? '【' + signature + '】' : ''}}<!--
                    --> {{UNSUBSCRIBE_SMS_POSTFIX_REGEXP.test(content) ? content : content + UNSUBSCRIBE_SMS_POSTFIX}}<!--
                    --><i class="bubble-tail"></i><!--
                --></div>
            </div>
        </div>
        <div v-if="material.type === 2 && !material.isHF" class="mms-modal-preview-frame">
            <div class="mms-modal-preview">
                <!--素材列表-预览-->
                <template v-if="material.otherCount && material.otherCount.mmsContent">
                    <div v-for="(mms,index) in material.otherCount.mmsContent" :key="mms.id">
                        <p>
                            <img :src="mms.pictureUrl" v-if="mms.pictureUrl">
                            <span v-text="sampleName ? randMmsContents[index] : mms.mmsContent">{{mms.mmsContent}}</span>
                            <span v-if="index == material.otherCount.mmsContent.length-1">
                                {{UNSUBSCRIBE_SMS_POSTFIX}}
                            </span>
                        </p>
                    </div>
                </template>
                <!--素材编辑-预览-->
                <template v-else>
                    <div v-for="(mms,index) in material.materialMms" :key="mms.id">
                        <p>
                            <img :src="mms.pictureUrl" v-if="mms.pictureUrl">
                            <span v-text="sampleName ? randMmsContents[index] : mms.mmsContent">{{mms.mmsContent}}</span>
                            <span v-if="index == material.materialMms.length-1">
                                {{UNSUBSCRIBE_SMS_POSTFIX}}
                            </span>
                        </p>
                    </div>
                </template>
            </div>
        </div>
        <wechat-preview v-if="material.type === 5" :previewItem="material" :snap-shot="snapShot"></wechat-preview>
        <ul v-if="toolbar && (material.type === 0 || material.type === 1 || material.type === 3 || material.type === 2 || material.type === 6) && !material.isHF"
            class="random-test-wrapper">
            <li v-if="material.type !== 6" class="random"
                v-title:left="$t('material.updateSample')+`<br>`+$t('material.current')+`:${sampleName}]`"
                @click="getRandomField()">
                <i class="icon icon-touzi"></i>
            </li>
            <li class="test" v-title:left="$t('material.testSend')"
                @click="test(material,material.testSubject ? material.testSubject : '')"><i
                    class="icon icon-flask"></i></li>
            <!--华为定制-->
            <li class="tag" v-if="showTag" v-title:left="$t('material.viewLabel')"
                @click="$viewLabel({material,labelList})">
                <i class="icon icon-tag"></i></li>
        </ul>
        <!-- 微信模板 -->
        <div class="wechat-template-preview" v-if="material.type === 8">
            <div class="wechat-template">
                <div v-for="(list, index) in (material.sendContentArr || material.example)" :key="index" v-html="list"></div>
            </div>
            <!--<p class="light-content-text tar">更新时间：{{material.updateDate}}</p>-->
        </div>
    </div>
</template>
<script type="text/babel">
    import debounce from 'lodash/debounce';
    import max from 'lodash/max';
    import WechatPreview from './wechat-preview.vue';
    import { JourneyMaterialApiV1 } from '@/api';
    import {UNSUBSCRIBE_SMS_POSTFIX} from './form/sms-material-form.vue';
    import { store } from '@/store';

    /**
     * material.type
     * 0 短信素材
     * 1 邮件素材，
     * 2 彩信素材
     * 3 拖拽编辑器生成的邮件素材
     * 4
     * 5 微信素材
     * 6 个性化区块素材
     * 7
     * 8
     */
    export default {
        props: {
            material: {//素材
                type: Object,
                required: true
            },
            signature: {
                type: String,
                'default': ''
            },
            loading: false,
            toolbar: {
                type: Boolean,
                default: true
            },
            // 华为cdp标签
            labelList: {
                type: Array,
                default: () => [],
            },
            // 是否快照模式，用于显示微信图文副本
            snapShot: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                UNSUBSCRIBE_SMS_POSTFIX,
                device: 'pc', //pc，mobile
                sampleName: '', //样本名称
                content: '', // 内容
                randMmsContents: [],// 彩信随机样例
            };
        },
        computed: {
            UNSUBSCRIBE_SMS_POSTFIX_REGEXP() {
                return new RegExp(this.UNSUBSCRIBE_SMS_POSTFIX + '$');
            },
            wechatTemplateSendContentArr() {
                if (this.material.type === 8 && this.material) {
                    return this.material.content
                        .map(({content, sendContent}) => {
                            let color = '', text = '';
                            const match = /^(.*){{(.+)\..+}}$/.exec(content);
                            if (match) {
                                text += match[1];
                                let key = match[2];
                                let targetContent = sendContent.find(sc => sc[key]);
                                if (targetContent) {
                                    color = targetContent[key].color;
                                    text += targetContent[key].value;
                                }
                            }
                            return `<span style="color: ${color};">${text}</span>`;
                        });
                }
                return [];
            },
            // 是否华为账号
            isHw() {
                /*eslint-disable-next-line*/
                return localStorage.getItem('isHw') == 1;
            },
            // 预览-显示标签
            showTag() {
                // 华为账号
                // 素材类型为邮件
                /*eslint-disable-next-line*/
                return this.isHw && (this.material.type == 1 || this.material.type == 3);
            }
        },
        mounted() {
            /*eslint-disable-next-line*/
            if (this.material.type == 5 || this.material.isHF) {
                let con = this.material.content ?
                    this.material.content.replace(/access_key_id=\{\$accesskeyid\}/g, 'access_key_id=$accesskeyid') : '';
                this.content = con;
            } else {
                let con = this.material.materialContent ?
                    this.material.materialContent.replace(/access_key_id=\{\$accesskeyid\}/g, 'access_key_id=$accesskeyid') : '';
                this.content = con;
            }
        },
        watch: {
            'material.content'() {
                let con = this.material.content ?
                    this.material.content.replace(/access_key_id=\{\$accesskeyid\}/g, 'access_key_id=$accesskeyid') : '';
                this.content = con;
            },
            'material.materialContent'() {
                if (this.material.materialContent) {
                    let con = this.material.materialContent ?
                        this.material.materialContent.replace(/access_key_id=\{\$accesskeyid\}/g, 'access_key_id=$accesskeyid') : '';
                    this.content = con;
                }
            },
            content() {
                if (this.$refs.emailPreviewFrame) this.scaleEmailContent();
            },
            device() {
                if (this.$refs.emailPreviewFrame) this.scaleEmailContent();
            }
        },
        methods: {
            /**
             * vue文件中暂时没有此方法的调用！！！
             * @param htmlStr
             * @returns {*}
             */
            makeLinksTargetOuter(htmlStr) {
                let resultStr = htmlStr.replace(/target=["'][a-z_]*["']/ig, '');
                resultStr = resultStr.replace(/(<a[^>]*)(>)/ig, '$1 target="_blank">');
                resultStr = resultStr.replace(/(<a[^>]*)(>)/ig, (arg1) => {
                    if (arg1.indexOf('href="mailto:') > 0) {
                        return arg1.replace('target="_blank"', 'target=""');
                    }
                    return arg1;
                });
                return resultStr;
            },
            //随机替换关键字
            getRandomField() {
                if (this.material.id) {
                    JourneyMaterialApiV1
                        .sampleMaterial(this.material.id)
                        .then(({body: {data: {materialContent, sampleName, mmsContents}}}) => {
                            let con = materialContent.replace(/access_key_id=\{\$accesskeyid\}/g, 'access_key_id=$accesskeyid');
                            this.sampleName = sampleName;
                            this.content = con;
                            this.randMmsContents = mmsContents;
                        });
                } else {
                    this.$toast(this.$t('material.verifyRandom'), 'warn');
                }
            },
            rep(list) {
                list = list.replace(/<(span.*?)(style.*?)>/g, '');
                list = list.replace(/<\/span>/g, '');
                return list;
            },
            /**
             * pc和mobile下的邮件内容
             */
            scaleEmailContent: debounce(function () {
                const frame = this.$refs.emailPreviewFrame;
                const containerWidth = frame.contentDocument.documentElement.clientWidth - 16; // 16 是留一点间隙
                const contentHeight = frame.contentDocument.body.clientHeight;
                const realContentWidth = max(Array.from(frame.contentDocument.body.childNodes, node => node.clientWidth));
                const contentWidth = realContentWidth || 359;
                const scale = (containerWidth / contentWidth).toFixed(6);
                if (this.device === 'mobile') {
                    frame.contentDocument.documentElement.style = `height: ${contentHeight * scale + 16}px;padding: 8px;`;
                    frame.contentDocument.body.style = `width:${contentWidth}px;margin:0 auto;transform: scale(${scale}, ${scale});transform-origin: 0 0 0;`;
                } else {
                    frame.contentDocument.body.style = '';
                    frame.contentDocument.documentElement.style = '';
                }
            }, 100, {trailing: true}),
            // 测试
            test(material, testSubject) {
                // 主账号不做任何限制
                if (store.state.user.roleId === 0 || store.state.user.roleId === '') {
                    this.$test(material, testSubject);
                    return;
                }
                // 权限校验
                JourneyMaterialApiV1
                    .sharingVerify({
                        materialId: material.id,
                        materialType: 1,
                        type: 2,
                        shareType: 6
                    })
                    .then(({body: {data: {isAccess}}}) => {
                        if (isAccess === 1) {
                            this.$test(material, testSubject);
                        } else {
                            this.$toast(this.$t('material.sharingVerifyOption'), 'warn');
                        }
                    });
            },
        },
        components: {
            WechatPreview
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .material-preview-wrapper {
        position: relative;
        overflow: hidden;
        min-height: 300px;
        max-height: 100%;

        $device-height: $input-field-height + 40px;

        .device {
            display: flex;
            width: 91px;
            height: 40px - 2px;
            margin: ($input-field-height)/2 auto;
            line-height: 40px - 2px;
            font-size: 0;
            text-align: center;
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid $border-color;

            li {
                flex: 1;
                height: 100%;
                font-size: 30px;
                color: $color-light-content;
                cursor: pointer;

                &.active {
                    color: $orange;
                    background: #f1f1f1;
                }

                &:first-of-type {
                    border-right: 1px solid $border-color;
                }
            }

            + .email-preview-frame {
                height: calc(70vh - #{$device-height + $input-field-height});
            }
        }

        .email-preview-frame {
            display: block;
            position: relative;
            height: 100%;

            &.pc {
                width: 100%;
                border: none;
            }

            &.mobile {
                width: 375px;
                margin: 0 auto;
                border: 2px solid $border-color;
                border-radius: 4px;
            }
        }

        .random-test-wrapper {
            position: absolute;
            right: 30px;
            top: 64px;
            z-index: 1;
            width: 42px;
            height: 98px;
            cursor: pointer;

            li {
                width: 40px;
                height: 40px;
                line-height: 40px;
                text-align: center;
                font-size: 26px;
                border-radius: 5px;
                border: 1px solid $border-color;
                color: $color-light-content;

                &:hover {
                    border-color: $orange;
                    color: $orange;
                    background: $content-bg;
                }

                &.random {
                    margin-bottom: 14px;
                }

                &.tag {
                    margin: 14px 0;
                }
            }
        }

        .sms-preview-frame {
            position: relative;
            overflow: hidden;
            margin: 20px auto;
            width: 270px;
            height: 450px;
            text-align: left;
            background: url("sms-preview-frame.png") no-repeat center;
            @include background-size(contain);

            .sms-preview-frame-content {
                position: absolute;
                overflow: auto;
                left: 55px;
                right: -17px;
                top: 130px;
                bottom: 80px;
            }
        }

        .sms-preview-bubble {
            position: relative;
            @include box-sizing();
            width: 155px;
            min-height: 6em;
            padding: 1em;
            @include border-radius(15px);
            background-color: #e5e3e3;
            word-break: break-all;
            white-space: pre-wrap;
            line-height: normal;

            .bubble-tail {
                position: absolute;
                bottom: -5px;
                left: -8px;
                display: block;
                width: 23px;
                height: 15px;
                overflow: hidden;

                &:before {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: -30px;
                    display: block;
                    width: 60px;
                    height: 60px;
                    background: #e5e3e3;
                    border-radius: 50%;
                }

                &:after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: -10px;
                    display: block;
                    width: 20px;
                    height: 20px;
                    background: #fff;
                    border-radius: 50%;
                }
            }
        }

        .mms-modal-preview-frame {
            position: relative;
            top: -60px;
            margin: 0 auto;
            width: 400px;
            height: 770px;
            text-align: left;
            background: url("../material/form/images/phone-mms.png") no-repeat center center;

            .mms-modal-preview {
                position: absolute;
                width: 62%;
                height: 350px;
                top: 245px;
                left: 75px;
                overflow-y: auto;
                overflow-x: hidden;

                div {
                    position: relative;
                    left: 2px;
                    max-width: 100%;
                    margin: 0 0 10px 0;

                    &:after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        background: url("../material/form/images/phone-text-mms.png") no-repeat;
                        width: 13px;
                        height: 15px;
                    }

                    img {
                        width: 95%;
                        height: auto;
                        margin: 0 2% 10px 3%;
                        display: block;
                    }

                    p {
                        position: relative;
                        padding: 10px 20px;
                        margin: 5px;
                        line-height: 22px;
                        border-radius: 17px;
                        font-size: 12px;
                        background-color: #e5e3e3;
                        word-break: break-all;
                        max-width: 98%;
                    }
                }
            }

        }

        .wechat-template-preview {
            width: 320px;
            margin: auto;
            padding: 16px 0 32px;
            line-height: $input-field-height;

            .wechat-template {
                min-height: 200px;
                padding: 16px;
                border: 1px solid $border-color;
                border-radius: 4px;
                background-color: $content-bg;
            }
        }
    }

</style>
