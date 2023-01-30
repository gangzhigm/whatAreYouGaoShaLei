<template>
    <div class="questionnaire-customize content-container">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'form.customizeForm' | t}}</h1>
            </div>
        </div>
        <div class="page-content">
            <div class='content-view white-bg margin padding'>
                <p class="disabled-text">
                    {{'form.customFormNote' | t}}
                </p>
                <div class="create-form">
                    <p class="disabled-text">
                        <span>{{'form.customFormCreated' | t}} {{customizeList.length}}，</span>
                        <span>{{'form.customFormCanCreat' | t}} {{5 - customizeList.length}}</span>
                    </p>
                    <button class="btn btn-md btn-theme"
                            :disabled="customizeList.length >= 5 || $has('journey_form_add_custom_form')"
                            @click="createCustomize">{{'form.addCustomForm' | t}}
                    </button>
                </div>
                <!-- 自定义表单列表 -->
                <div class="simplify-table">
                    <table>
                        <thead>
                        <tr>
                            <th>{{'form.customFormName' | t}}</th>
                            <th>{{'swarm.creator' | t}}</th>
                            <th>{{'material.createData' | t}}</th>
                            <th>{{'data.Actions' | t}}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <template v-if="customizeList.length !== 0">
                            <tr v-for="customize in customizeList" :key="customize.id">
                                <td :title="customize.formName">{{customize.formName}}</td>
                                <td :title="customize.createName">{{customize.createName}}</td>
                                <td>
                                    {{
                                    customize.createDate.split('T')[0] + ' ' +
                                    customize.createDate.split('T')[1].split('+')[0]
                                    }}
                                </td>
                                <td>
                                    <button class="btn" @click="checkLink(customize)"
                                            :disabled="$has('journey_form_view_link')">
                                        <svg aria-hidden="true" class="action-icon icon-lianjie"
                                             v-title:top="$t('form.checkLink')">
                                            <use xlink:href="#icon-lianjie"></use>
                                        </svg>
                                    </button>
                                    <button class="btn" @click="deleteForm(customize)"
                                            :disabled="$has('journey_form_delete_custom_form')">
                                        <svg aria-hidden="true" class="action-icon icon-delete"
                                             v-title:top="$t('common.del')">
                                            <use xlink:href="#icon-round-close"></use>
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        </template>
                        <template v-else>
                            <tr class="empty">
                                <td colspan="4">
                                    <list-empty></list-empty>
                                </td>
                            </tr>
                        </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <!-- 新增自定义表单 -->
        <confirm :title="$t('form.addCustomForm')" v-if="showUploadFile" @cancel="cancel" @confirm="saveFile">
            <div class="form-field">
                <label class="label">{{'form.customFormNameAdd' | t}}：</label>
                <input type="text" class="input lg" v-model.trim="customize.name" maxlength="100">
            </div>
            <div class="form-field">
                <label class="label">{{'form.uploadZip' | t}}：</label>
                <div class="file" :class="{active: fileName !== ''}">
                    <input type="file" class="input-file" ref="file" @change="uploadFile" accept=".zip">
                    <p class="file-name">{{fileName}}</p>
                </div>
            </div>
            <div class="note form-field">
                <p class="disabled-text">{{'form.customFormLimitNote1' | t}}</p>
                <p class="disabled-text">{{'form.customFormLimitNote2' | t}}</p>
                <p class="disabled-text">{{'form.customFormLimitNote3' | t}}</p>
                <p class="disabled-text">{{'form.customFormLimitNote4' | t}}</p>
                <p class="disabled-text">{{'form.customFormLimitNote5' | t}}</p>
            </div>
        </confirm>
        <!-- 查看链接 -->
        <confirm class="check-link" v-if="showCheckLink" :title="$t('form.checkLink')" size="lg" @cancel="checkCancel"
                 @confirm="checkCancel">
            <!-- 表单二维码 -->
            <div class="form-field qr-code">
                <img :src="qrCodeSrc" :alt="$t('form.formQrCode')">
                <!-- 下载远程图片， 需要加这个后缀 -->
                <a :href="qrCodeSrc + '?response-content-type=application/octet-stream'"
                   download class="downloadQrCode">{{'dataCenter.download' | t}}</a>
            </div>
            <!-- 表单链接 -->
            <div class="form-field flex">
                <label class="label">{{'form.formLink' | t}}</label>
                <div class="show-form-link">
                    <div class="link-content-inner">
                        <p class="link-content" :title="formLink">{{formLink}}</p>
                        <i class="icon icon-copy" @click="copy(formLink)" v-title:bottom="$t('form.copyLink')"></i>
                    </div>
                    <p class="disabled-text">{{'form.checkLinkNote' | t}}</p>
                </div>
            </div>
            <!-- 表单提交成功跳转链接 -->
            <div class="form-field flex" v-if="successFormLink">
                <label class="label">{{'form.successFormLink' | t}}</label>
                <p class="link-content" :title="successFormLink">{{successFormLink}}</p>
                <i class="icon icon-copy" @click="copy(successFormLink)" v-title:bottom="$t('form.copyLink')"></i>
            </div>
            <!-- 表单提交失败跳转链接 -->
            <div class="form-field flex" v-if="failedFormLink">
                <label class="label">{{'form.failedFormLink' | t}}</label>
                <p class="link-content" :title="failedFormLink">{{failedFormLink}}</p>
                <i class="icon icon-copy" @click="copy(failedFormLink)" v-title:bottom="$t('form.copyLink')"></i>
            </div>
            <!-- 表单链接扩展值 -->
            <div class="form-field flex" v-if="extendedValueList.length > 0">
                <label class="label">{{'form.expandedValueLink' | t}}</label>
                <div class="extended-value">
                    <p class="disabled-text">{{'form.showExpandedValueNote' | t}}</p>
                    <div class="item" v-for="extended in extendedValueList" :key="extended.id">
                        <input v-model="extended.formLink" :title="extended.formLink" disabled class="input lg"/>
                        <button class="btn btn-md btn-white">{{'form.jumpVal' | t}}</button>
                        <i class="icon icon-two-dimensional-code"
                           @mouseover="extended.showExtendedQRCode = true"
                           @mouseleave="extended.showExtendedQRCode = false">
                            <transition name="drop" v-if="extended.showExtendedQRCode">
                                <img :src="extended.qrCodePath" :alt="$t('form.formQrCode')" class="Qr-code-image">
                            </transition>
                        </i>
                        <span class="theme-text" @click="copy(extended.formLink)">{{'form.copyLink' | t}}</span>
                    </div>
                </div>
            </div>
        </confirm>
        <!-- 表单文件上传过程、结果 -->
        <modal :title="$t('common.notice')" v-if="showUploadProcess" class="result" @close="closeProcess">
            <div class="processing" v-if="processing">
                <inline-loading offset="md"></inline-loading>
                <p class="process-note">{{'form.uploading' | t}} <span class="dot"></span></p>
                <p>{{'form.uploadTime' | t}}</p>
            </div>
            <!-- 上传成功 -->
            <div v-else-if="uploadSuccess" class="uploadSuccess">
                <i class="icon icon-chenggong"></i>
                <p>{{'form.uploadSuccess' | t}}</p>
            </div>
            <!-- 上传失败 -->
            <div v-else>
                <i class="icon icon-round-close"></i>
                <p>{{errMessage}}</p>
            </div>

            <template v-slot:buttons>
                <button v-if="!processing" class="btn btn-md btn-theme" @click="createDone">{{'common.confirm' | t}}
                </button>
            </template>
        </modal>
        <!-- 用于复制文本 -->
        <textarea ref="copy" class="copy-txt"></textarea>
    </div>
</template>

<script>
    import {debounce} from 'lodash';
    import {COMMON_NAME_REGEXP} from '@/common/utils/regs';
    import { QuestionnaireApiV1, QuestionnaireApiAuth } from '@/api';

    export default {
        name: 'questionnaire-customize',
        data() {
            return {
                // 自定义表单列表
                customizeList: [],
                // 创建的自定义表单字段
                customize: {
                    name: '',
                    file: '',
                    id: ''
                },
                // 新建文件
                showUploadFile: false,
                // 查看表单
                showCheckLink: false,
                // 表单二维码
                qrCodeSrc: '',
                // 表单地址
                formLink: '',
                // 扩展值列表
                extendedValueList: [],
                // 表单提交成功地址
                successFormLink: '',
                // 表单提交失败地址
                failedFormLink: '',
                // 展示上传过程、结果页
                showUploadProcess: false,
                // 上传状态
                processing: true,
                // 上传成功
                uploadSuccess: false,
                // 上传错误信息
                errMessage: '',
                // 文件名称
                fileName: '',
            };
        },
        computed: {
            crumbs() {
                return [
                    {name: 'journey', text: 'Dmartech'},
                    {name: 'journeyFormManagement', text: this.$t('home.leads'), params: {id: 0}},
                    {name: 'questionnaireCustomize', text: this.$t('form.customizeForm')}
                ];
            }
        },
        mounted() {
            this.customize.id = ~~this.$route.query.id;
            this.getCustomForm();
        },
        methods: {
            // 获取自定义表单列表
            getCustomForm() {
                QuestionnaireApiV1
                    .getCustomForm(~~this.$route.query.id)
                    .then(({body: {data}}) => {
                        this.customizeList = data.customFormList;
                    });
            },
            // 创建自定义表单
            async createCustomize() {
                if (this.customizeList.length >= 5) return;
                if (!await this.checkAuth(18)) return;
                this.showUploadFile = true;
            },
            // 上传ZIP包
            uploadFile(e) {
                const file = e.target.files[0];
                if (file.name.indexOf('.zip') === -1) {
                    e.target.value = '';
                    return this.$toast(this.$t('form.formatError'), 'warn');
                }
                if (file.size > 20 * 1024 * 1024) {
                    e.target.value = '';
                    return this.$toast(this.$t('form.fileLimit20'), 'warn');
                }

                this.customize.file = file;
                this.fileName = file.name;
            },
            // 取消新建
            cancel() {
                this.$refs.file.value = '';
                this.fileName = '';
                this.showUploadFile = false;
                this.customize = {
                    name: '',
                    file: '',
                    id: ~~this.$route.query.id
                };
            },
            // 保存表单
            saveFile: debounce(function () {
                if (!this.customize.name) {
                    return this.$toast(this.$t('form.formNameNotEmpty'), 'warn');
                } else if (!COMMON_NAME_REGEXP.test(this.customize.name)) {
                    return this.$toast(this.$t('common.nameSpecial'), 'warn');//显示为有特殊符号
                }
                if (!this.customize.file) {
                    return this.$toast(this.$t('form.fileEmpty'), 'warn');
                }

                this.showUploadProcess = true;
                QuestionnaireApiV1
                    .createCustomForm(this.customize)
                    .then(() => {
                        this.cancel();
                        this.processing = false;
                        this.uploadSuccess = true;
                        this.getCustomForm();
                    })
                    .catch((err) => {
                        this.cancel();
                        this.processing = false;
                        this.uploadSuccess = false;
                        this.errMessage = err.body.message || '未知原因';
                    });
            }, 300),

            // 查看链接
            async checkLink(form) {
                if (!await this.checkAuth(16)) return;
                QuestionnaireApiV1
                    .getCustomFormDetail(form.id)
                    .then(({body: {data}}) => {
                        this.showCheckLink = true;
                        this.formLink = data.customForm.indexLink;
                        this.qrCodeSrc = data.customForm.qrCodePath;
                        data.extensionValueList.forEach(elm => {
                            elm.showExtendedQRCode = false;
                        });
                        this.extendedValueList = data.extensionValueList;
                        this.successFormLink = data.customForm.successLink;
                        this.failedFormLink = data.customForm.failedLink;
                    });
            },
            // 关闭查看
            checkCancel() {
                this.showCheckLink = false;
                // clear Data
                this.qrCodeSrc = '';
                this.formLink = '';
                this.extendedValueList = [];
                this.successFormLink = '';
                this.failedFormLink = '';
            },
            // 复制文本
            copy(value) {
                const t = this.$refs.copy;
                t.value = value;
                t.select();
                document.execCommand('Copy');
                this.$toast(this.$t('form.copied'), 'success');
            },
            // 删除表单
            async deleteForm(form) {
                if (!await this.checkAuth(17)) return;
                this.$confirm(this.$t('common.notice'), this.$t('form.deleteNote'))
                    .then(res => {
                        if (res) {
                            QuestionnaireApiV1
                                .deleteCustomForm(form.id)
                                .then(() => {
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    this.getCustomForm();
                                });
                        }
                    });
            },
            // 文件上传完成
            createDone() {
                this.showUploadProcess = false;
                this.processing = true;
                this.uploadSuccess = false;
                this.errMessage = '';

                // 获取列表
                this.getCustomForm();
            },
            closeProcess() {
                if (!this.processing) this.createDone();
            },
            /**
             * 数据权限检查
             * @param {number} type 16 查看链接， 17 删除自定义表单， 18 新增自定义表单 
             */
            async checkAuth(type) {
                let res = await QuestionnaireApiAuth
                    .downloadDetailAccess({ paperId: this.customize.id, type })
                    .then(({ body: { data: { isAccess } } }) => isAccess)
                    .catch(() => false);
                if (!res) {
                    this.$toast(this.$t('material.sharingVerifyOption'), 'warn');
                    return false;
                }
                return true;
            }
        }
    };
</script>

<style type="text/scss" lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .questionnaire-customize {
        word-break: break-word;
        .icon-lianjie {
            color: $theme;
        }

        .simplify-table {
            .btn:first-child {
                padding: 0;

                svg {
                    margin-left: 0;
                }
            }

            .empty {
                td {
                    padding: 0;
                }
            }
        }

        .create-form {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 1em 0;
        }

        .file {
            width: 180px;
            height: 150px;
            border: 1px dashed #f0f0f0;
            background: url('../material/form/images/import-zip.png') no-repeat center;
            @include background-size(auto 100px);
            @include box-sizing(border-box);
            text-align: center;

            .input-file {
                opacity: 0;
                width: 80px;
                height: 120px;
                cursor: pointer;
                display: block;
                margin: auto;
            }

            .file-name {
                @include ellipsis();
            }

            &.active {
                background: url('../material/form/images/import-zip-active.png') no-repeat center;
                border-color: $light-orange;
            }
        }

        .qr-code {
            position: relative;
            width: 120px;
            height: 120px;
            overflow: hidden;

            .downloadQrCode {
                width: 100%;
                position: absolute;
                background: rgba(0, 0, 0, .6);
                color: #fff;
                text-align: center;
                top: -100%;
                left: 0;
                transition: top;
                height: 100%;
                line-height: 120px;
                font-size: 15px;
                border-radius: 3px;
            }

            img {
                width: 100%;
                height: 100%;
            }

            &:hover {
                .downloadQrCode {
                    top: 0;
                }
            }
        }

        .check-link {
            .modal {
                width: 800px;

                .modal-content {
                    max-height: 600px;
                    overflow-y: auto;
                }
            }

            .show-form-link {
                width: calc(100% - 126px);

                .link-content-inner {
                    display: flex;

                    .link-content {
                        width: calc(100% - 20px);
                    }
                }
            }

            .link-content {
                width: calc(100% - 126px - 20px);
                @include ellipsis();
            }

            .icon-copy {
                font-size: 20px;
                cursor: pointer;
            }

            .copy-txt {
                opacity: 0;
            }

            .extended-value {
                .item {
                    display: flex;
                    align-items: center;

                    .icon {
                        font-size: 20px;
                        cursor: pointer;
                    }

                    .btn {
                        margin: 0 8px;
                    }

                    .theme-text {
                        margin-left: 8px;
                        cursor: pointer;
                        font-size: 14px;
                    }
                    .icon-two-dimensional-code {
                        position: relative;
                        .Qr-code-image {
                            position: absolute;
                            width: 120px;
                            height: 120px;
                            top: 0;
                            left: 20px;
                        }
                    }
                    &:last-child {
                        .icon-two-dimensional-code {
                            .Qr-code-image {
                                top: unset;
                                bottom: 20px;
                            }
                        }
                    }
                }

                .item + .item {
                    margin: 10px 0;
                }
            }
        }

        .result {
            text-align: center;
            font-size: 14px;

            .icon {
                font-size: 50px;
                margin-bottom: 15px;
            }

            .processing {
                .process-note {
                    margin-bottom: 15px;

                    .dot {
                        &:before {
                            content: '...';
                            position: absolute;
                            animation: dot 2s infinite step-start both;
                        }

                        &:after {
                            content: '...';
                            color: transparent;
                        }
                    }
                }

                @keyframes dot {
                    33% {
                        content: '.';
                    }
                    66% {
                        content: '..';
                    }
                }
            }
        }
    }

</style>
