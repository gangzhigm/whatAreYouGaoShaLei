<template>
    <div class="task-material-store" :class="{border: mode === 'list'}">
        <!--<template v-if="mode === 'init'">-->

        <!--<input type="button" class="btn btn-md btn-theme" @click="browseList"-->
        <!--:value="`${$t('journey.chooseExisted')}${TEXT_MAP[type]}${$t('journey.content')}`">-->
        <!--<router-link :to="createRoute" target="_blank" class="btn btn-md btn-white">-->
        <!--{{$t('common.create') + TEXT_MAP[type] + $t('journey.content')}}-->
        <!--</router-link>-->
        <!--<span v-if="error" class="red-text">{{error}}</span>-->
        <!--</template>-->
        <template v-if="mode === 'list'">
            <!--编辑模式-->
            <template v-if="!isChecking || value">
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
                    <selector style="display: none" v-if="type === 'wechat'"
                              class="pull-right" :options="groups" v-model="groupId"
                              @select="browseList"></selector>
                    <button type="button" class="action-icon icon icon-fanhui1" @click="reset"></button>
                    <!--<router-link :to="createRoute" target="_blank" class="btn btn-md btn-theme">-->
                    <!--{{$t('common.create') + TEXT_MAP[type] + $t('journey.content')}}-->
                    <!--</router-link>-->
                </div>
                <!-- 选择 - 列表 -->
                <template v-if="materials && materials.length > 0">
                    <div class="store-window" id="storeWindow" v-load="moreMaterials">
                        <transition-group name="list">
                            <div class="material-in-store" v-for="(material,index) in materials" :key="material.id">
                                <div class="material-preview">
                                    <img :src="material.thumbMediaUrl">
                                </div>
                                <div class="material-info">
                                    <h5 :title="material.materialName || material.title">
                                        {{material.materialName || material.title}}</h5>
                                    <p>
                                <span :title="material.updateName"
                                      style="max-width: 81px">{{material.updateName}}</span>
                                        <span :title="material.updateDateString | cutSeconds">{{material.updateDateString | cutSeconds}}</span>
                                    </p>
                                    <div class="material-type">
                                        <span class="icon" :class="materialIconClass(material.type)"></span>
                                    </div>
                                </div>
                                <div class="material-actions">
                                    <button type="button" class="btn btn-theme-border btn-round btn-sm icon icon-pencil"
                                            style="font-size: 14px" @click="preview(material, false)">
                                        {{'common.preview' | t}}
                                    </button>
                                    <button type="button" class="btn btn-theme btn-round btn-sm icon icon-choose"
                                            @click="choose(material)">{{'common.select' | t}}
                                    </button>
                                </div>
                            </div>
                        </transition-group>
                        <inline-loading v-if="loading"/>
                        <template v-if="!loading && totalCount === 0">
                            <p class="no-material">{{'journey.noContentTip' | t}}</p>
                            <p class="btn btn-md btn-theme no-material-btn" @click="goScrm">
                                {{$t('common.create') + TEXT_MAP[type] + $t('journey.content')}}
                            </p>
                        </template>
                    </div>
                </template>
                <template v-if="!materials || materials.length <= 0">
                    <inline-loading v-if="loading"/>
                    <list-empty v-else/>
                </template>
                <back-top container-id="storeWindow" relative/>
            </template>
            <!--查看模式-->
            <span v-else>{{'common.noData | t'}}</span>
        </template>
        <!-- 选择之后的预览 -->
        <template v-if="mode === 'preview'">
            <!--编辑模式-->
            <template v-if="!isChecking || value">
                <!--修改组件过于麻烦，时间紧，所以单独做-->
                <div class="boxsa">
                    <h2 style="text-align: left; padding: 10px 0 15px 10px;">{{$t('controller.preview_material')}} -
                        {{previewMaterial.title}}</h2>
                    <preview :material="previewMaterial" :toolbar="true"></preview>
                </div>
                <div class="btn-icon-group" v-if="showBtn">
                    <button v-if="wechatType !== 'service'" type="button" class="icon icon-pencil" v-title:top="$t('common.edit')"
                            @click="goMaterial" :class="{'isDisabled':$has('wechat_material_edit_news')}"></button>
                    <button type="button" class="icon icon-reset" @click="chooseAgain"
                            v-title:top="$t('journey.reselect')"></button>
                    <button type="button" class="icon icon-delete" @click="reset"
                            v-title:top="$t('common.del')"></button>
                </div>
            </template>
            <!--查看模式-->
            <span v-else>{{'common.noData | t'}}</span>
        </template>
    </div>
</template>
<script type="text/ecmascript-6">
    import Preview from '../../../../../material/preview.vue';
    import {getScrollingBox} from '@/common/utils/mixin';
    import {logError} from '../../../../../../monitor.js';
    import {UPDATE_USER_INFO} from '@/store/vuex/mutationTypes';
    import {UPDATE_WECHAT_ACCOUNT_INFO} from '@/store/vuex/actionTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import { JourneyMaterialApiV1, WechatApiV1 } from '@/api';
    import { mapActions, mapMutations, mapState } from 'vuex';

    export default {
        props: {
            type: '',   // email, sms, wechat
            wechatType: String,
            error: '',  // 错误信息
            value: '',  // materialId
            // 短信签名
            signature: String,
            // 短信单条长度: 海外60，国内70
            unit: Number,
            // 短信发送配置是否为特殊账号: 特殊账号的签名不进入内容总长度
            special: Boolean,

            showBtn: {
                type: Boolean,
                default: true
            },                   // 旅程查看用于隐藏按钮
            writable: {
                type: Boolean,
                default: true
            },                  // 旅程是否可以编辑
            // 公众号id
            officialId: [Number, String],
            // 是否可编辑 旅程模块定制参数  模板 邮件 短信 彩信...
            isChecking: {
                type: Boolean,
                default: false
            },
            // 旅程状态是否是待审批
            statusApprove: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
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
                previewMaterial: null, // 预览素材, previewMaterial.type 0为短信、1为邮件、undefined为微信
            };
        },
        computed: {
            ...mapState({
                authorizerInfoId: state => state.user.authorizerInfoId,
                journeyType: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation.journeyType
            }),
            createRoute() {
                switch (this.type) {
                    case 'email':
                        return {name: 'createEmailMethods'};
                    case 'sms':
                        return {name: 'createSMS'};
                    case 'wechat':
                        // 微信任务控件：全局公众号改为旅程选择的公众号
                        this.UPDATE_USER_INFO({authorizerInfoId: this.officialId});
                        this.UPDATE_WECHAT_ACCOUNT_INFO();
                        return {name: 'imageTextList'};
                    default:
                        console.error('<material-store>未识别的素材类型：' + this.type);
                        logError(`[营销旅程] <newMaterial-stores /> createRoute 出现了无法识别的素材类型{type:${this.type}} :171`);
                        break;
                }
            },
            
        },
        watch: {
            value(id, oldId) {
                if (id && !oldId && !this.previewMaterial && this.officalId) {
                    this.autoChooseMaterial(id);
                }
            },
            // 切换公众号
            officialId(id, oldId) {
                if (id && oldId && id !== oldId) {
                    this.materials = [];
                }
            }
        },
        methods: {
            ...mapMutations([
                UPDATE_USER_INFO
            ]),
            ...mapActions([
                UPDATE_WECHAT_ACCOUNT_INFO
            ]),
            // 跳转编辑
            goMaterial() {
                if (this.$has('wechat_material_edit_news')) return;
                let {href} = this.$router.resolve({
                    name: 'imageTextEdit',
                    query: {
                        id: this.value,
                        singleTip: this.wechatType === 'service' ? 'wechatContent.oneItemCustomer' : ''
                    }
                });
                window.open(href);
                this.$emit('goMaterial');
            },
            goScrm() {
                let {href} = this.$router.resolve({name: 'imageTextList'});
                window.open(href);
            },
            goCreatMaterial() {
                window.open(this.$router.resolve({name: 'createEmail'}).href);
            },
            materialIconClass(type) {
                switch (type) {
                    case 1:
                        return 'icon-mail';
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

                // 客服消息只能选择单图文消息
                const noSubMaterials = this.wechatType === 'service';
                // 群发-图文消息返回草稿，客服-图文消息返回已发布
                let mpnewsType = this.wechatType === 'picText' ? 1 : 2;

                if (this.officialId === null || this.officialId === '') {
                    this.loading = false;
                    return false;
                }
                //修改请求
                WechatApiV1
                    .getMaterials(this.name, this.pageNumber, 5, null, undefined, noSubMaterials, this.officialId, '', mpnewsType)
                    .then(({body: {data: {fieldList, totalRow, totalPage}}}) => {
                        let materialList = mpnewsType === 1 ? fieldList.filter(item => !item.hasOwnProperty('publishStatus')) : fieldList;
                        materialList = materialList.filter(material => material.hasOwnProperty('mediaId') || material.hasOwnProperty('articleId'));
                        this.materials = reset ? materialList : this.materials.concat(materialList);
                        this.totalCount = totalRow;
                        this.loading = false;
                        if (reset) {
                            this.$nextTick(() => {
                                let box = getScrollingBox(this.$el);
                                if (box) box.scrollTop = box.scrollHeight;
                            });
                        }
                        if (this.materials.length < 10 && this.pageNumber < totalPage) {
                            this.fetchMaterials();
                        }
                    })
                    .catch(() => {
                        if (!reset) this.pageNumber--;
                        this.loading = false;
                    });
            },
            moreMaterials() {
                this.fetchMaterials(false);
            },
            preview(material) {
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
                    this.previewMaterial.materialContent = this.signature + this.previewMaterial.materialContent;
                }
                this.$preview({material: this.previewMaterial, toolbar: false});
            },
            autoChooseMaterial(id) {
                this.loading = true;
                // Fix-9094 旅程待审批不可编辑， 但旅程还未开始
                if (!this.writable && !this.statusApprove) {
                    // 查看已完成状态的素材内容，需要调用素材副本接口
                    WechatApiV1
                        .wechatImgTextCopy(id, this.journeyType)
                        .then(({body: {data: {materialInfo}}}) => {
                            materialInfo.type = 5;
                            this.choose(materialInfo);
                            this.loading = false;
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                } else {
                    WechatApiV1
                        .getMaterial(id)
                        .then(({body: {data: {material}}}) => {
                            this.choose(material);
                            this.loading = false;
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                }
            },
            choose(material) {
                this.mode = 'preview';
                this.previewMaterial = Object.assign({}, material);
                this.$emit('input', material.id);
            },
            chooseAgain() {
                this.mode = 'list';
                if (this.materials.length === 0) this.fetchMaterials(true);
                this.previewMaterial = null;
                this.$emit('chooseAgain');
            },
            reset() {
                this.mode = 'init';
                this.previewMaterial = null;
                this.$emit('input', '');
                this.$emit('reset');
            }
        },
        components: {
            Preview
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss" scoped>
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";
    @import "../../../../calendar/components/material";

    .task-material-store {
        $width: 800px;
        @include box-sizing();
        position: relative;
        height: 100%;
        background: white;
        @include box-sizing();

        /*修改 重选 删除的按钮位置*/
        .wechat-preview {
            padding-top: 0;
            text-align: center;
            height: 245px;
            overflow: auto;

            .sub-material {
                text-align: left;

                .content {
                    width: 100%;
                }
            }

            .sub-title {
                @include width-calc(calc(100% - 66px));

            }
        }

        .preview-wrapper {
            .email-preview-wrapper {
                height: 300px !important;

                .email-preview-frame {
                    height: 300px !important;
                }
            }

        }

        @include clearfix();

        .boxsa {
            width: 94%;
            float: left;

            .draggable-email-preview-wrapper {
                height: 300px;
                overflow-y: auto;
            }

            .device {
                display: none;
            }

            .random-test-wrapper {
                display: none;
            }

            .device-wrapper {
                padding: 0;
                height: 0;
            }
        }

        &.border {
            @include border-radius(4px);
            border: 1px solid #e0e0e0;
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
                top: 8px;
                right: 0;
                font-size: 14px;
                height: $input-field-height;
                width: $input-field-height;
                cursor: pointer;
                color: $color-light-content;
                text-align: center;
            }

            .icon-search {
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

        .no-material-btn {
            margin-top: 100px;
        }

        .material-actions {
            .btn {
                margin-top: 15px;
            }
        }
    }

    .isDisabled {
        @include noPermission();
    }
</style>
