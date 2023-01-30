<template>
    <div class="task-material-store" :class="{border: mode === 'list'}">
        <template v-if="mode === 'init'">
            <input type="button" class="btn btn-md btn-theme" @click="browseList"
                   :value="`${$t('journey.chooseExisted')}${TEXT_MAP[type]}${$t('journey.content')}`">
            <router-link :to="createRoute" target="_blank" class="btn btn-md btn-white">
                {{$t('common.create') + TEXT_MAP[type] + $t('journey.content')}}
            </router-link>
            <span v-if="error" class="red-text">{{error}}</span>
        </template>
        <!-- 跳转到新标签页新建、编辑素材后，等待遮罩 -->
        <template v-if="mode === 'waiting'">
            <div class="material-store-refresh-btn" @click.stop="refresh">
                <img src="../refresh.png" alt="refresh">
                {{(previewMaterial ? 'controller.editLoad' : 'controller.refreshLoad') | t}}
            </div>
        </template>
        <!--针对不同需求，为了不影响其他的，单独写出来的一块短信-->
        <template v-if="smsStatus === 1 && mode === 'list'">
            <!-- 选择 - 顶栏 -->
            <div class="store-action-bar">
                <svg aria-hidden="true" class="pull-right refresh-btn" @click="browseList">
                    <use xlink:href="#icon-reset"></use>
                </svg>
                <div class="pull-right search-box">
                    <input type="text" v-model="name" maxlength="15" v-autofocus :placeholder="$t('common.search')"
                           @keydown.enter="browseList">
                    <svg aria-hidden="true" @click="browseList">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </div>
                <button type="button" class="action-icon icon icon-fanhui1" @click="reset"></button>
            </div>
            <!-- 选择 - 列表 -->
            <div class="store-window" id="storeWindow" v-load="moreMaterials">

                <transition-group name="list">
                    <div class="material-in-store" v-for="material in materials" :key="material.id">
                        <div class="material-preview">
                            <template v-for="content in material.otherCount.mmsContent">
                                <p>{{content.mmsContent + UNSUBSCRIBE_SMS_POSTFIX}}</p>
                            </template>
                        </div>
                        <div class="material-info">
                            <h5 :title="material.materialName || material.title">
                                {{material.materialName || material.title}}</h5>
                            <p>
                                <span :title="material.updateName"
                                      style="max-width: 81px">{{material.updateName}}</span>
                                <span :title="material.updateDate | cutSeconds">{{material.updateDate | cutSeconds}}</span>
                            </p>
                            <div class="material-type">
                                <span class="icon" :class="materialIconClass(material.type)"></span>
                            </div>
                        </div>
                        <div class="material-actions">
                            <button type="button" class="btn btn-theme-border btn-round btn-sm icon icon-search"
                                    @click="preview(material, false)">{{'common.preview' | t}}
                            </button>
                            <button type="button" class="btn btn-theme btn-round btn-sm icon icon-choose"
                                    @click="choose(material)">{{'common.select' | t}}
                            </button>
                        </div>
                    </div>
                </transition-group>
                <inline-loading v-if="loading"/>
                <p v-if="!loading && totalCount === 0" class="no-material">{{'journey.noContentTip' | t}}</p>
            </div>
            <back-top container-id="storeWindow" relative/>
        </template>
        <!-- 选择之后的预览 -->
        <template v-if="mode === 'preview'">
            <p class="sms-length-tip" v-if="previewMaterial && previewMaterial.type === 0">
                {{'journey.sendCountTotal' | t}}
                <span class="journey-text">{{smsContentLength}}</span>
                {{'journey.words' | t}}, {{'journey.splitAs' | t}}
                <span class="journey-text">{{Math.ceil(smsContentLength / unit)}}</span>&nbsp;{{'journey.messages' | t}}
                <span class="icon icon-help" v-title="$t('journey.messagesTip')"></span>
            </p>
            <div class="material numb previewing">
                <div class="material-preview">
                    <img v-if="previewMaterial && (previewMaterial.type === 1 || previewMaterial.type === 3 || previewMaterial.thumbUrl)"
                         :src="previewMaterial.previewUrl || previewMaterial.thumbUrl">
                    <!--<span v-else>{{signature + previewMaterial.materialContent + UNSUBSCRIBE_SMS_POSTFIX}}</span>-->
                    <span v-else>{{previewMaterial.materialContent + UNSUBSCRIBE_SMS_POSTFIX}}</span>
                </div>
                <div class="material-info">
                    <h5 :title="previewMaterial.materialName || previewMaterial.title">
                        {{previewMaterial.materialName || previewMaterial.title}}</h5>
                    <p>
                        <span :title="previewMaterial.updateName">{{previewMaterial.updateName}}</span>
                        <span :title="previewMaterial.updateDate | cutSeconds">{{previewMaterial.updateDate | cutSeconds}}</span>
                    </p>
                    <div class="material-type">
                        <span class="icon" :class="materialIconClass(previewMaterial.type)"></span>
                    </div>
                </div>
            </div>
            <button type="button" class="icon icon-delete psosition" @click="reset"
                    v-title:top="$t('common.del')"></button>
        </template>
    </div>
</template>
<script type="text/ecmascript-6">

    import { JourneyMaterialApiV1, WechatApiV1 } from '@/api';
    import {getScrollingBox} from '../../../../../../common/utils/mixin';
    import {UNSUBSCRIBE_SMS_POSTFIX} from '../../../../../material/form/sms-material-form.vue';
    import { mapState } from 'vuex';

    //判断是否有短链
    const LinkReg = /(<url>.*?<\/url>)/;

    export default {
        props: {
            type: '',   // email, sms, wechat
            error: '',  // 错误信息
            value: '',  // materialId
            // 短信签名
            signature: String,
            // 短信单条长度: 海外60，国内70
            unit: Number,
            // 短信发送配置是否为特殊账号: 特殊账号的签名不进入内容总长度
            special: Boolean,
            smsStatus: 0//判断短信是否展示列表
        },
        data() {
            return {
                UNSUBSCRIBE_SMS_POSTFIX,
                TEXT_MAP: {
                    email: this.$t('journey.emailContent'),
                    sms: this.$t('journey.smsContent'),
                    wechat: this.$t('journey.wechatContent')
                },
                // 素材中心的使用模式
                mode: 'init', // 'init', 'list', 'preview'
                materials: [],
                name: '',   // 关键字
                groupId: '',// 微信素材分组ID
                groups: [], // 微信素材分组
                pageNumber: 1,
                totalCount: Infinity,
                loading: false,
                previewMaterial: null   // 预览素材, previewMaterial.type 0为短信、1为邮件、undefined为微信
            };
        },
        computed: {
            ...mapState({
                roleId: state => state.user.roleId
            }),
            createRoute() {
                switch (this.type) {
                    case 'email':
                        return {name: 'createEmail'};
                    case 'sms':
                        return {name: 'createSMS'};
                    case 'wechat':
                        return {name: 'createWechat'};
                }
            },
            smsContentLength() {    // 计算文字显示多少
                if (this.type === 'sms') {
                    const content = this.previewMaterial.materialContent;
                    const SIGNATURE_LENGTH = (this.signature && !this.special) ? this.signature.length : 0;    // 签名长度(已包含前后大括号)
                    const URL_LENGTH = LinkReg.test(content)                                // 短链的折算值, 折算后短链长度为14
                        ? 14 - (content.lastIndexOf('</url>') - content.indexOf('<url>') + 6)
                        : 0;
                    return SIGNATURE_LENGTH + content.length + URL_LENGTH + UNSUBSCRIBE_SMS_POSTFIX.length;
                }
                return 0;
            }
        },
        watch: {
            value(id, oldId) {
                if (id && !oldId && !this.previewMaterial) {
                    this.autoChooseMaterial(id);
                }
            },
            smsStatus(val) {
                if (val === 1) {
                    this.mode = 'list';
                }
            }
        },
        mounted() {
            this.mode = 'list';
            this.fetchMaterials(true);
            if (this.type === 'wechat') {
                WechatApiV1
                    .getMaterials()
                    .then(({body: {data: {fieldList}}}) => {
                        fieldList.unshift({
                            id: 0,
                            name: this.$t('journey.allWechatGroup')
                        });
                        this.groups = fieldList;
                        this.groupId = 0;
                    });
            }
        },
        methods: {
            materialIconClass(type) {
                switch (type) {
                    case 1:
                        return 'icon-mail';
                    case 2:
                        return 'icon-mms';
                    case 0:
                        return 'icon-sms';
                    case 3:
                        return 'icon-dnd-email';
                    // 微信素材就没有 type 字段，用 default 表征
                    default:
                        return 'icon-wechat';
                }
            },
            browseList() {
                this.mode = 'list';
                this.fetchMaterials(true);
            },
            fetchMaterials(reset) {
                if (this.mode !== 'list') return false;
                if (reset) {
                    // reset pagination
                    this.pageNumber = 1;
                    this.totalCount = Infinity;
                } else {
                    if (this.materials.length >= this.totalCount) return false;
                    if (this.loading) return false;
                    this.pageNumber++;
                }
                this.loading = true;
                JourneyMaterialApiV1
                    .getMaterials('', this.name, this.pageNumber, 2) // 素材类型 0 for sms, 1 for email, 5 for all email
                    .then(({body: {data: {materialList, totalRow}}}) => {
                        this.materials = reset ? materialList : this.materials.concat(materialList);
                        this.totalCount = totalRow;
                        this.loading = false;
                        if (reset) {
                            this.$nextTick(() => {
                                let box = getScrollingBox(this.$el);
                                if (box) box.scrollTop = box.scrollHeight;
                            });
                        }
                    })
                    .catch(() => {
                        if (!reset) this.pageNumber--;
                    });
            },
            moreMaterials() {
                this.fetchMaterials(false);
            },
            async preview(material) {
                let hasAccess = '';
                // 主账号不做任何限制
                if (this.roleId === 0 || this.roleId === '') {
                    hasAccess = 1;
                } else {
                    // 权限校验
                    hasAccess = await JourneyMaterialApiV1
                        .sharingVerify({
                            materialId: material.id,
                            materialType: 1,
                            type: 2,
                            shareType: 4
                        })
                        .then(({body: {data: {isAccess}}}) => {
                            if (isAccess !== 1) {
                                this.$toast(this.$t('material.sharingVerifyOption'), 'warn');
                            }
                            return isAccess;
                        });
                }
                if (hasAccess !== 1) return;
                this.previewMaterial = Object.assign({}, material);
                if (material.type === 1 || material.type === 3) {
                    // get e-mail html content
                    JourneyMaterialApiV1
                        .getEmailHtml(material.id)
                        .then(({body: {data: {materialContent}}}) => {
                            this.previewMaterial.materialContent = materialContent;
                        });
                } else {
                    // 短信，拼接签名
                    this.previewMaterial.materialMms = this.previewMaterial.otherCount.mmsContent;
                    // this.previewMaterial.materialContent = this.signature + this.previewMaterial.materialContent;
                }
                this.$preview({material: this.previewMaterial, toolbar: false});
            },
            autoChooseMaterial(id) {
                this.loading = true;
                if (this.type === 'wechat') {
                    // fixme 从邮件素材的服务获取微信素材，需要确认
                    JourneyMaterialApiV1
                        .wechatImgText(id)
                        .then(({body: {data: {materialInfo}}}) => {
                            this.choose(materialInfo);
                            this.loading = false;
                        });
                } else {
                    JourneyMaterialApiV1
                        .getMaterial(id)
                        .then(({body: {data: {material}}}) => {
                            this.choose(material);
                            this.loading = false;
                        });
                }
            },
            refresh() {
                // if (this.waitStatus) {
                //     this.$emit('backFromEdit','123');
                //     return false;
                // }
                if (this.previewMaterial) {
                    // update the material
                    this.mode = 'preview';
                    this.autoChooseMaterial(this.previewMaterial.materialId);
                } else {
                    // 展示列表
                    this.browseList();
                }
            },
            choose(material) {
                // this.mode = 'preview';
                this.previewMaterial = Object.assign({}, material);
                if ((material.type === 1 || material.type === 3) && material.materialContent.trim() === '') {
                    // get e-mail html content
                    JourneyMaterialApiV1
                        .getEmailHtml(material.id)
                        .then(({body: {data: {materialContent,materialName}}}) => {
                            this.previewMaterial.materialContent = materialContent;
                            this.previewMaterial.materialName = materialName;
                        });
                } else if (material.type === 0 || material.type === 2) {
                    // 短信，拼接签名
                    // this.previewMaterial.materialContent = this.signature + this.previewMaterial.materialContent;.
                    this.previewMaterial.materialContent = material.otherCount && material.otherCount.mmsContent ?
                        material.otherCount.mmsContent : material.materialMms;
                    this.previewMaterial.materialName = material.materialName;
                }
                this.$emit('input', material.id);
                this.$emit('choose', this.previewMaterial);
            },
            // 跳转编辑
            editMaterialInNewTab(data) {
                this.previewMaterial = data ? data : '';
                this.mode = 'waiting';
            },
            chooseAgain() {
                this.mode = 'list';
                if (this.materials.length === 0) this.fetchMaterials(true);
                this.previewMaterial = null;
                this.$emit('input', '');
            },
            reset() {
                // this.mode = 'init';
                this.previewMaterial = null;
                this.$emit('input', '');
                this.$emit('reset');
            }
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss" scoped>

    @import "../../../../calendar/components/material";
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .task-material-store {
        $width: 800px;

        position: relative;
        height: 100%;
        background: white;

        &.border {
            @include border-radius(4px);
            border: 1px solid #e0e0e0;
        }

        .store-window {
            height: calc(100% - 69px);
            min-height: 130px;
            max-height: 450px;
            padding: 10px 0;
            overflow: auto;
        }

        .previewing {
            vertical-align: bottom;
        }

        .search-field {
            float: right;
            position: relative;

            input {
                border: 1px solid #e0e0e0;
                border-radius: 2px;
                width: 200px - 2px - $input-field-height - 12px;
                padding: 5px $input-field-height 5px 12px;
                line-height: 23px;

                &:hover {
                    border-color: $border-color;

                    + .icon {
                        color: $color-light-content;
                    }
                }

                &:focus {
                    border-color: $border-color;

                    + .icon {
                        color: $color-content;
                    }
                }
            }

            .icon {
                position: absolute;
                top: 0;
                right: 0;
                font-size: 14px;
                height: $input-field-height;
                width: $input-field-height;
                cursor: pointer;
                color: $color-light-content;
                text-align: center;
            }
            .addicon {
                position: absolute;
                top: 8px;
                right: 0;
                font-size: 14px;
                height: $input-field-height;
                width: $input-field-height;
                cursor: pointer;
                color: $color-light-content;
                text-align: center;
            }
        }

        .no-material {
            text-align: center;
            color: $color-light-content;
        }

        .material-actions {
            .btn {
                margin-top: 15px;
            }
        }

        .sms-length-tip {
            font-size: 12px;
            margin-top: -10px;
            white-space: nowrap;
            color: $color-light-content;

            .icon-help {
                font-size: 14px;
                color: $color-content;
                cursor: pointer;
            }
        }
    }

    .material-store-refresh-btn{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
    }
</style>
