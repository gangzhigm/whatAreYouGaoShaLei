<template>
    <div class="task-material-store" :class="mode">
        <inline-loading v-if="materialLoading"/>
        <template v-else>
            <!-- 初始视图 -->
            <template v-if="mode === 'init'">
                <!--编辑模式-->
                <template v-if="!isChecking || value">
                    <div class="material-store-init-btn" @click.stop="browseList">
                        <img src="../../canvas/controller/sub-controllers/select-material.png" alt="select-material">{{$t('controller.choose_a_material')}}
                    </div>
                    <div class="material-store-init-btn" @click="goCreateInNewTab">
                        <img src="../../canvas/controller/sub-controllers/add-material.png" alt="add-material"
                             :class="{'isDisabled':$has('wechat_template_value_message')&&type==='template'}">
                        {{$t('controller.create_a_material')}}
                    </div>
                </template>
                <!--查看模式-->
                <span v-else>{{ 'common.noData' | t }}</span>
            </template>
            <!-- 跳转到新标签页新建、编辑素材后，等待遮罩 -->
            <template v-if="mode === 'waiting'">
                <!--编辑模式-->
                <template v-if="!isChecking || value">
                    <div class="material-store-refresh-btn" @click.stop="refresh">
                        <img src="../../canvas/controller/sub-controllers/refresh.png" alt="refresh">
                        {{(previewMaterial ? 'controller.editLoad' : 'controller.refreshLoad') | t}}
                        {{(previewMaterial ? 'controller.editLoad' : 'controller.refreshLoad') | t}}
                    </div>
                </template>
                <!--查看模式-->
                <span v-else>{{ 'common.noData' | t }}</span>
            </template>
            <template v-if="mode === 'list'">
                <!--编辑模式-->
                <template v-if="!isChecking || value">
                    <!-- 选择 - 顶栏 -->
                    <div class="store-action-bar">
                        <!-- 创建素材的链接 -->
                        <!--
                        <router-link :to="createRoute" target="_blank" class="btn btn-md btn-theme canvas-flag">
                            {{$t('common.create') + TEXT_MAP[type] + $t('journey.content')}}
                        </router-link>
                        -->
                        <svg aria-hidden="true" class="pull-right refresh-btn" @click="browseList">
                            <use xlink:href="#icon-reset"></use>
                        </svg>
                        <div class="pull-right search-box">
                            <input type="text" v-model="name" maxlength="15" v-autofocus
                                   :placeholder="$t('common.search')"
                                   @keydown.enter="browseList">
                            <svg aria-hidden="true" @click="browseList">
                                <use xlink:href="#icon-search"></use>
                            </svg>
                        </div>
                        <selector v-if="type === 'wechat'" class="pull-right" :options="groups" v-model="groupId"
                                  @select="browseList"></selector>
                        <button type="button" class="action-icon icon icon-fanhui1" @click="reset"></button>
                    </div>
                    <!-- 选择 - 列表 -->
                    <template v-if="materials && materials.length > 0">
                        <div class="store-window" id="storeWindow" v-load="moreMaterials">
                            <transition-group name="list">
                                <div class="material-in-store" v-for="material in materials" :key="material.id">
                                    <div class="material-preview">
                                        <!-- 邮件、微信图文 -->
                                        <img v-if="material.type === 1 ||material.type === 3 || material.thumbUrl"
                                             :src="material.previewUrl || material.thumbUrl || EmailPreviewDefault">
                                        <!-- 短信 -->
                                        <span v-if="type === 'sms'">{{signature + material.materialContent + UNSUBSCRIBE_SMS_POSTFIX}}</span>
                                        <!-- 彩信 -->
                                        <span v-if="type === 'mms'">{{signature + material.materialContent + UNSUBSCRIBE_MMS_POSTFIX}}</span>
                                        <!-- 微信模板 -->
                                        <div v-if="type === 'template'" v-for="list in material.sendContentArr"
                                             v-html="list"></div>
                                    </div>
                                    <div class="material-info">
                                        <h5 :title="material.materialName || material.title">
                                            {{material.materialName || material.title}}</h5>
                                        <p>
                                            <span :title="material.updateName">{{material.updateName}}</span>
                                            <span :title="material.updateDate | cutSeconds">{{material.updateDate | cutSeconds}}</span>
                                        </p>
                                        <div class="material-type">
                                            <span class="icon" :class="materialIconClass(material.type)"></span>
                                        </div>
                                    </div>
                                    <div class="material-actions">
                                        <button type="button" class="btn btn-theme-border btn-round btn-sm"
                                                v-if="type !== 'template'"
                                                :disabled="$has('journey_material_preview_material')"
                                                @click="preview(material)">
                                            <svg aria-hidden="true">
                                                <use xlink:href="#icon-search"></use>
                                            </svg>
                                            {{'common.preview' | t}}
                                        </button>
                                        <button type="button" class="btn btn-theme btn-round btn-sm"
                                                @click="choose(material)">
                                            <svg aria-hidden="true">
                                                <use xlink:href="#icon-choose"></use>
                                            </svg>
                                            {{'common.select' | t}}
                                        </button>
                                    </div>
                                </div>
                            </transition-group>
                            <inline-loading v-if="loading"/>
                            <p v-if="!loading && totalCount === 0" class="light-content-text tac">
                                {{'journey.noContentTip' | t}}
                            </p>
                            <back-top relative/>
                        </div>
                    </template>
                    <template v-if="!materials || materials.length <= 0">
                        <inline-loading v-if="loading"/>
                        <list-empty v-else/>
                    </template>
                </template>
                <!--查看模式-->
                <span v-else>{{ 'common.noData' | t }}</span>
            </template>
            <!-- 选择之后的预览 -->
            <template v-if="mode === 'preview'">
                <!--编辑模式-->
                <template v-if="!isChecking || value">
                    <p class="sms-length-tip" v-if="previewMaterial && previewMaterial.type === 0">
                        {{'journey.sendCountTotal' | t}}
                        <span class="journey-text">{{smsContentLength}}</span>
                        {{'journey.words' | t}}, {{'journey.splitAs' | t}}
                        <span class="journey-text">{{Math.ceil(smsContentLength / unit)}}</span>&nbsp;{{'journey.messages'
                        |
                        t}}
                        <span class="icon icon-help" v-title="$t('journey.messagesTip')"></span>
                    </p>
                    <!-- 其他素材 -->
                    <preview v-if="type !== 'template'" :material="previewMaterial" :toolbar="false"/>
                    <!-- 微信模板 -->
                    <div class="wechat-template" v-else>
                        <div v-for="list in (previewMaterial.sendContentArr || wechatTemplateSendContentArr)"
                             v-html="list"></div>
                    </div>
                    <div class="btn-icon-group" v-if="showBtn">
                        <button class="icon icon-pencil" v-if="this.type!='template'" type="button"
                                :class="{'icon-disable': $has('journey_material_edit_material')}"
                                :disabled="$has('journey_material_edit_material')" v-title:left="$t('common.edit')"
                                @click="editMaterialInNewTab"></button>
                        <!--<button type="button" class="icon icon-search" @click="$preview({material:previewMaterial})"-->
                        <!--v-title:left="$t('common.zoom')"></button>-->
                        <button type="button" class="icon icon-reset" @click="chooseAgain"
                                v-title:left="$t('journey.reselect')"></button>
                        <button type="button" class="icon icon-delete" @click="reset"
                                v-title:left="$t('common.del')"></button>
                    </div>
                </template>
                <!--查看模式-->
                <span v-else>{{ 'common.noData' | t }}</span>
            </template>
        </template>
    </div>
</template>
<script type="text/ecmascript-6">
    import { mapState, mapMutations } from 'vuex';
    import { JourneyMaterialApiV1, WechatApiV1 } from '@/api';
    import {getScrollingBox} from '../../../../common/utils/mixin';
    import Preview from '../../../material/preview.vue';
    import cloneDeep from 'lodash/cloneDeep';
    import {UNSUBSCRIBE_SMS_POSTFIX} from '../../../material/form/sms-material-form.vue';
    import {UNSUBSCRIBE_MMS_POSTFIX} from '../../../material/form/mms-material-form.vue';
    import {logError} from '../../../../monitor.js';
    import {UPDATE_USER_INFO} from '@/store/vuex/mutationTypes';
    import {USER_INFO_SESSION_KEY} from '@/store/vuex/rootStore';

    import EmailPreviewDefault from '../../../material/store/default-email-preview.jpg';
    //判断是否有短链
    const LinkReg = /(<url>.*?<\/url>)/;

    export default {
        components: {
            Preview
        },
        props: {
            type: String,       // email, sms, wechat, template
            value: [Number, String], // materialId
            signature: String,  // 短信签名
            unit: Number,       // 短信单条长度: 海外60，国内70
            special: Boolean,    // 短信发送配置是否为特殊账号: 特殊账号的签名不进入内容总长度
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
            // 公众号列表
            officialList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
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
                UNSUBSCRIBE_MMS_POSTFIX,
                TEXT_MAP: {
                    email: this.$t('journey.emailContent'),
                    sms: this.$t('journey.smsContent'),
                    wechat: this.$t('journey.wechatContent'),
                    template: this.$t('journey.template')
                },
                // 素材中心的使用模式
                mode: 'init',   // 'init', 'waiting', 'list', 'preview'
                materials: [],
                fields: [],     // 字段列表
                name: '',       // 关键字
                groupId: '',    // 微信素材分组ID
                groups: [],     // 微信素材分组
                pageNumber: 1,
                totalCount: Infinity,
                loading: false,
                EmailPreviewDefault: EmailPreviewDefault,
                previewMaterial: null,   // 预览素材, previewMaterial.type 0为短信、1为邮件、undefined为微信
                materialLoading: true,   // 素材loading
            };
        },
        computed: {
            ...mapState({
                roleId: state => state.user.roleId,
                userInfo: state => state.user
            }),
            createRoute() {
                switch (this.type) {
                    case 'email':
                        return {name: 'createEmailMethods'};
                    case 'emailTemplate':
                        return {name: 'createEmailMethods'};
                    case 'sms':
                        return {name: 'createSMS'};
                    case 'wechat':
                        // 微信任务控件：全局公众号改为旅程选择的公众号
                        this.UPDATE_USER_INFO({authorizerInfoId: this.officialId});
                        localStorage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(this.userInfo));
                        return {name: 'imageTextList'};
                    case 'template':
                        // 微信任务控件：全局公众号改为旅程选择的公众号
                        this.UPDATE_USER_INFO({authorizerInfoId: this.officialId});
                        localStorage.setItem(USER_INFO_SESSION_KEY, JSON.stringify(this.userInfo));
                        return {
                            name: 'template',
                            query: {authorizerInfoId: this.officialId}
                        };
                    default:
                        logError(`[营销旅程] <material-store /> createRoute 出现了无法识别的素材类型{type:${this.type}} :178`);
                        break;
                }
            },
            // 已经选中一个素材之后，编辑已选中素材的链接
            editRoute() {
                switch (this.type) {
                    case 'email':
                        if (this.previewMaterial.type === 1) {
                            // 传统邮件
                            return {name: 'editEmail', query: {id: this.previewMaterial.id}};
                        } else if (this.previewMaterial.type === 3) {
                            // 拖拽邮件
                            return {name: 'draggableEmail', query: {id: this.previewMaterial.id}};
                        }
                        console.error('<material-store>未识别的邮件素材类型：', this.previewMaterial.type);
                        return {name: 'createEmailMethods'};
                    case 'emailTemplate':
                        if (this.previewMaterial.type === 1) {
                            // 传统邮件
                            return {name: 'editEmail', query: {id: this.previewMaterial.id}};
                        } else if (this.previewMaterial.type === 6) {
                            // 拖拽邮件
                            return {name: 'templateEmail', query: {id: this.previewMaterial.id}};
                        }
                        console.error('<material-store>未识别的邮件素材类型：', this.previewMaterial.type);
                        return {name: 'createEmailMethods'};
                    case 'sms':
                        return {name: 'editSMS', query: {id: this.previewMaterial.id}};
                    case 'mms':
                        return {name: 'editMMS', query: {id: this.previewMaterial.id}};
                    case 'wechat':
                        if (this.previewMaterial.type === 1) {
                            // 图片
                            return {name: 'imageList'};
                        } else if (this.previewMaterial.type === 5) {
                            // 图文
                            return {name: 'imageTextEdit', query: {id: this.previewMaterial.id}};
                        }
                        console.error('<material-store>未识别的微信素材类型：', this.previewMaterial.type);
                        return {name: 'imageTextList'};
                    case 'template':
                        return {name: 'templateDetail', query: {id: this.previewMaterial.id}};
                    default:
                        logError(`[营销旅程] <material-store /> createRoute 出现了无法识别的素材类型{type:${this.type}} :213`);
                        break;
                }
            },
            wechatTemplateSendContentArr() {
                if (this.type === 'template' && this.previewMaterial) {
                    return this.previewMaterial.content
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
            smsContentLength() { // 计算文字显示多少
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
                if (id && !oldId && !this.previewMaterial && this.officialId) {
                    this.autoChooseMaterial(id);
                }
                // 无素材时终止素材loading
                if (!id) {
                    this.materialLoading = false;
                }
            },
            // 切换公众号 重新选择素材
            officialId(id, oldId) {
                if (id && oldId && id !== oldId) {
                    this.materials = [];
                    this.previewMaterial = null;
                    this.mode = 'init';
                }
                // 选中素材
                if (this.value && !this.previewMaterial && id) {
                    this.autoChooseMaterial(this.value);
                } else {
                    // 无素材时终止素材loading
                    this.materialLoading = false;
                }
            }
        },
        methods: {
            ...mapMutations([
                UPDATE_USER_INFO
            ]),
            materialIconClass(type) {
                switch (type) {
                    case 1:
                        return 'icon-mail';
                    case 6:
                        return 'icon-mailTemplate';
                    case 0:
                        return 'icon-sms';
                    case 3:
                        return 'icon-dnd-email';
                    // fixme 微信素材就没有 type 字段，用 default 表征
                    default:
                        return 'icon-wechat';
                }
            },
            goCreateInNewTab() {
                if (this.$has('wechat_template_value_message') && this.type === 'template') return;
                if (!this.officialId && this.officialList.length > 0) {
                    this.$toast(this.$t('sendChannel.selectAccount'), 'warn');
                    return false;
                }
                const resolveRoute = this.$router.resolve(this.createRoute);
                window.open(resolveRoute.href);
                this.mode = 'waiting';
            },
            refresh() {
                if (this.previewMaterial) {
                    // update the material
                    this.mode = 'preview';
                    this.autoChooseMaterial(this.previewMaterial.id);
                } else {
                    // 展示列表
                    this.browseList();
                }
            },
            browseList() {
                if (!this.officialId && this.officialList.length > 0) {
                    this.$toast(this.$t('sendChannel.selectAccount'), 'warn');
                    return false;
                }
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

                if (this.type === 'template') {
                    if (this.officialId === null || this.officialId === '') {
                        this.loading = false;
                        return false;
                    }
                    WechatApiV1
                        .templateList(this.officialId, this.name, 1)
                        .then(({body: {data: {wxTemplateList, totalRow}}}) => {
                            this.materials = reset ? wxTemplateList : this.materials.concat(wxTemplateList);
                            this.totalCount = totalRow;
                            this.loading = false;
                        })
                        .catch(() => {
                            if (!reset) this.pageNumber--;
                            this.loading = false;
                        });
                } else if (this.type === 'wechat') {
                    // fixme 从邮件素材的服务获取微信素材，需要确认
                    JourneyMaterialApiV1
                        .wechatMaterials(this.groupId, this.name, this.pageNumber, 1)
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
                            this.loading = false;
                        });
                } else if (this.type === 'emailTemplate') {
                    JourneyMaterialApiV1
                        .getMaterials(
                            '',
                            this.name,
                            this.pageNumber,
                            this.type === 'emailTemplate' ? 6 : 0 // 素材类型 0 for sms, 1 for email, 5 for all email
                        )
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
                } else {
                    JourneyMaterialApiV1
                        .getMaterials(
                            '',
                            this.name,
                            this.pageNumber,
                            this.type === 'email' ? 5 : 0 // 素材类型 0 for sms, 1 for email, 5 for all email
                        )
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
                }
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
                this.previewMaterial = cloneDeep(material);
                if (material.type === 1 || material.type === 3 || material.type === 6) {
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
                this.materialLoading = true;
                if (this.type === 'template') {
                    // 查看已完成状态的素材内容，需要调用素材副本接口
                    // Fix-9094 旅程待审批不可编辑， 但旅程还未开始
                    if (!this.writable && !this.statusApprove) {
                        WechatApiV1
                            .templateCopyDetail(id)
                            .then((res) => {
                                res.body.data.wxTemplateCopy.type = 8;
                                this.choose(res.body.data.wxTemplateCopy);
                                this.loading = false;
                                this.materialLoading = false;
                            })
                            .catch(() => {
                                this.loading = false;
                                this.materialLoading = false;
                            });
                    } else {
                        WechatApiV1
                            .templateDetails(id)
                            .then(({body: {data: {wxTemplate}}}) => {
                                if (wxTemplate.officialId === this.officialId) {
                                    this.choose(wxTemplate);
                                }
                                this.loading = false;
                                this.materialLoading = false;
                            })
                            .catch(() => {
                                this.loading = false;
                                this.materialLoading = false;
                            });
                    }
                } else if (this.type === 'wechat') {
                    // fixme 从邮件素材的服务获取微信素材，需要确认
                    JourneyMaterialApiV1
                        .wechatImgText(id)
                        .then(({body: {data: {materialInfo}}}) => {
                            this.choose(materialInfo);
                            this.loading = false;
                            this.materialLoading = false;
                        })
                        .catch(() => {
                            this.loading = false;
                            this.materialLoading = false;
                        });
                } else {
                    JourneyMaterialApiV1
                        .getMaterial(id)
                        .then(({body: {data: {material}}}) => {
                            this.choose(material);
                            this.loading = false;
                            this.materialLoading = false;
                        })
                        .catch(() => {
                            this.loading = false;
                            this.materialLoading = false;
                        });
                }
            },
            choose(material) {
                this.mode = 'preview';
                this.previewMaterial = Object.assign({}, material);
                if ((material.type === 1 || material.type === 3 || material.type === 6) && material.materialContent.trim() === '') {
                    // get e-mail html content
                    JourneyMaterialApiV1
                        .getEmailHtml(material.id)
                        .then(({body: {data: {materialContent}}}) => {
                            this.previewMaterial.materialContent = materialContent;
                        });
                } else if (material.type === 0) {
                    // 短信，拼接签名
                    // this.previewMaterial.materialContent = this.signature + this.previewMaterial.materialContent;
                }
                this.$emit('input', material.id);
            },
            // 跳转编辑
            async editMaterialInNewTab() {
                let hasAccess = '';
                // 主账号不做任何限制
                if (this.roleId === 0 || this.roleId === '') {
                    hasAccess = 1;
                } else {
                    // 权限校验
                    hasAccess = await JourneyMaterialApiV1
                        .sharingVerify({
                            materialId: this.previewMaterial.id,
                            materialType: 1,
                            type: 2,
                            shareType: 3
                        })
                        .then(({body: {data: {isAccess}}}) => {
                            if (isAccess !== 1) {
                                this.$toast(this.$t('material.sharingVerifyOption'), 'warn');
                            }
                            return isAccess;
                        });
                }
                if (hasAccess !== 1) return;
                const resolveRoute = this.$router.resolve(this.editRoute);
                window.open(resolveRoute.href);
                this.mode = 'waiting';
            },
            chooseAgain() {
                this.mode = 'list';
                if (this.materials.length === 0) this.fetchMaterials(true);
                this.previewMaterial = null;
            },
            reset() {
                this.mode = 'init';
                this.previewMaterial = null;
                this.$emit('input', '');
            }
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";
    @import "./material";

    .task-material-store {
        $width: 800px;

        position: relative;
        height: 100%;
        background: white;

        &.init,
        &.waiting {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        &.list {
            @include border-radius(4px);
        }

        &.preview {
            padding-right: 48px;

            .material-preview-wrapper {
                height: 100%;
            }
        }

        .material-store-init-btn {
            display: inline-block;
            z-index: 1;
            width: 176px;
            height: 225px;
            line-height: 3em;
            font-size: 14px;
            color: $color-light-content;
            text-align: center;

            + .material-store-init-btn {
                margin-left: 32px;
            }

            img {
                display: block;
                box-sizing: border-box;
                padding: 50px;
                width: 176px;
                height: 180px;
                border: 1px solid $border-color;
                border-radius: 5px;
                cursor: pointer;

                &:hover {
                    @include box-shadow(0 0 5px $border-color);
                }
            }
        }

        .material-store-refresh-btn {
            display: inline-block;
            cursor: pointer;

            img {
                display: block;
                width: 54px;
                height: auto;
                margin: 0 auto;
            }
        }

        .store-action-bar {
            background-color: $content-bg;
            padding: 6px 10px 8px;
            @include clearfix();

            .refresh-btn {
                cursor: pointer;
                width: 16px;
                height: 16px;
                @include transition();
                margin: ($input-field-height - 16px)/2;

                &:hover {
                    fill: $color-content;
                    @include transform(rotate(-135deg));
                }
            }
        }

        .store-window {
            height: calc(100% - 69px);
            min-height: 130px;
            max-height: 450px;
            padding: 10px 0;
            overflow: auto;

            .material-in-store {
                margin: 8px 0 8px 16px;
            }
        }

        .material-actions {
            .btn {
                margin-top: 16px;
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

        .wechat-template {
            width: 320px;
            min-height: 200px;
            margin: auto;
            padding: 16px;
            border: 1px solid $border-color;
            border-radius: 4px;
            background-color: $content-bg;
        }

        .btn-icon-group {
            position: absolute;
            right: 8px;
            top: 8px;
            text-align: center;

            .icon {
                display: block;
                @include box-sizing();
                width: $input-field-height;
                font-size: 14px;
                line-height: $input-field-height - 2px;
                padding: 0;
                background-color: white;
                cursor: pointer;
                border: 1px solid $border-color;
                @include transition();
                color: $color-content;

                &:hover {
                    color: $theme;
                    background-color: $content-bg;
                }

                &.icon-disable:hover {
                    color: $color-content;
                    background-color: white;
                    cursor: not-allowed;
                }

                ~ button {
                    border-top: none;
                }
            }
        }
    }

    .isDisabled {
        @include noPermission();
    }
</style>
