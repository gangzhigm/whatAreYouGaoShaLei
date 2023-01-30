<template>
    <div>
        <!--步骤-->
        <ul class="steps">
            <li v-for="i in total" :class="[i <= pageNow ? 'active' : '', !isAdd ? 'edit': '']"
                @click="!isAdd ? pageClick(i) : ''">
                <!--@click="!isAdd ? pageClick(i) : (i <= pageNow ? pageClick(i) : '')"-->
                <template v-if="i <= pageNow">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-correct"></use>
                    </svg>
                </template>
                <template v-else>
                    {{i}}
                </template>
            </li>
        </ul>
        <!--step 1-->
        <div class="step" v-if="stepId == 1">
            <div class="title">{{'dataCenter.createPrivateKey' | t}}</div>
            <div class="sub-content step1">
                <div class="form-field from-name">
                    <label class="label" for="name">{{'dataCenter.accountName' | t}}</label>
                    <input type="text" class="input" :class="{error: accountNameErr}" id="name" maxlength="30"
                           :placeholder="$t('dataCenter.accountName')" :disabled="!isAdd" v-model="sftp.sftpUsername"
                           v-title:top.warn.line="accountNameErr" @click="accountNameErr = ''">
                </div>
                <div class="form-field">
                    <span class="label placeholder"></span>
                    <radio :source="false" v-model="generateKey">{{'dataCenter.createPrivateKeyMe' | t}}</radio>
                </div>
                <div class="form-field">
                    <span class="label placeholder"></span>
                    <radio :source="true" v-model="generateKey">{{'dataCenter.usePrivateKeyMe' | t}}</radio>
                    <input type="file" :style="{display: 'none'}" ref="input" @change="selectedFile"/>
                    <button class="upload-public" :class={disabled:!generateKey} :disabled="!generateKey"
                            @click="triggerSelect">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-upload"></use>
                        </svg>
                        {{'dataCenter.updatePublicKey' | t}}
                    </button>
                    <span>{{keyFile && generateKey ? keyFile.name : $t('dataCenter.noChooseFile')}}</span>
                </div>
                <div class="form-field">
                    <span class="label placeholder"></span>
                    <checkbox :source="true" disabled>{{'dataCenter.notes' | t}}</checkbox>
                </div>
                <div class="shell">
                    <button class="btn btn-md btn-theme" @click="createKey(2)">
                        {{'dataCenter.createPrivateKey' | t}}
                    </button>
                </div>
            </div>
        </div>
        <!--step 2-->
        <div class="step" v-if="stepId == 2">
            <div class="title">{{'dataCenter.createPrivateKey' | t}}</div>
            <div class="sub-content step2">
                <!--下载失败-->
                <template v-if="downloadFail">
                    <div class="icon">
                        <svg aria-hidden="true" class="icon-round-close">
                            <use xlink:href="#icon-round-close"></use>
                        </svg>
                    </div>
                    <div class="msg-fail-name">{{'dataCenter.failed' | t}}</div>
                    <div class="msg-text" v-if="!generateKey">
                        {{'dataCenter.downloadFailed' | t}}
                        <router-link tag="button" class="download-fail"
                                     :to="{name:'sftpDetails',query: {id: $route.query.id, name: 'set', step: 1, type:'sftp'}}">
                            {{'dataCenter.lastStep' | t}}
                        </router-link>
                        {{'dataCenter.reDownload' | t}}
                    </div>
                    <div class="msg-text" v-else>{{'dataCenter.uploadSuccess' | t}}</div>
                </template>
                <!--下载成功-->
                <template v-else>
                    <div class="icon">
                        <svg aria-hidden="true" class="icon-success">
                            <use xlink:href="#icon-success"></use>
                        </svg>
                    </div>
                    <div class="msg-name">{{'dataCenter.succeed' | t}}</div>
                    <div class="msg-text" v-if="!generateKey">{{'dataCenter.saveNote' | t}}</div>
                    <div class="msg-text" v-else>{{'dataCenter.uploadSuccess' | t}}</div>
                </template>
                <div class="shell">
                    <router-link tag="button" class="btn btn-md btn-theme" v-if="isAdd"
                                 :to="{name:'sftp',
                                 query: {id: this.$route.query.id, step: 3, type: 'sftp'}}">
                        {{'dataCenter.next' | t}}
                    </router-link>
                    <router-link tag="button" class="btn btn-md btn-theme" v-else
                                 :to="{name:'sftpDetails',
                                 query: {id: this.$route.query.id, name: 'set', step: 3, type: 'sftp'}}">
                        {{'dataCenter.next' | t}}
                    </router-link>
                </div>
            </div>
        </div>
        <!--step 3-->
        <div class="step" v-if="stepId == 3">
            <div class="title">{{'dataCenter.parameterSet' | t}}</div>
            <div class="sub-content step1">
                <div class="form-field from-name">
                    <label class="label" for="dataName">{{'dataCenter.sourceName' | t}}</label>
                    <input type="text" class="input" :class="{error: dataSetNameErr}" id="dataName" maxlength="30"
                           :placeholder="$t('dataCenter.sourceName')" v-model="sftp.dataSet" v-title:top.warn.line="dataSetNameErr"
                           :disabled="sftp.isDefault" @click="dataSetNameErr = ''">
                </div>
                <div class="form-field from-name time">
                    <label class="label">{{'dataCenter.taskTime' | t}}</label>
                    <selector class="time-item" :options="EXECTYPES" v-model="execTypeVal"/>
                    <!--每周 7d-->
                    <selector class="time-item" v-if="sftp.execType === 1" :options="WEEKITEMS" v-model="sftp.week"/>
                    <!--每月 31d-->
                    <selector class="time-item" v-if="sftp.execType === 2" :options="MONTHITEMS" v-model="sftp.day"/>
                    <!--每天 24h-->
                    {{'dataCenter.time' | t}}
                    <selector class="time-item" :options="HOUR" v-model="hourVal"/>
                    ：
                    <selector class="time-item" :options="MINUTE" v-model="minuteVal"/>
                </div>
                <div class="shell">
                    <button type="button" class="btn  btn-md btn-theme" @click="setParams('')">{{'common.save' | t}}</button>
                </div>
            </div>
        </div>
        <!--step 4-->
        <div class="step" v-if="stepId == 4">
            <div class="title">{{'dataCenter.parameterSet' | t}}</div>
            <div class="sub-content step4">
                <div class="icon">
                    <svg aria-hidden="true" class="icon-success">
                        <use xlink:href="#icon-success"></use>
                    </svg>
                </div>
                <div class="msg-name">{{'dataCenter.parameterSuccess' | t}}</div>
                <div class="shell">
                    <button type="button" class="btn  btn-md btn-theme" @click="createTemplate">
                        {{'dataCenter.fileTemplate' | t}}
                    </button>
                </div>
            </div>
        </div>
        <!--step 5-->
        <div class="step" v-if="stepId == 5">
            <div class="title">{{'dataCenter.createPrivateKey' | t}}</div>
            <div class="sub-content step2">
                <div class="icon">
                    <svg aria-hidden="true" class="icon-success">
                        <use xlink:href="#icon-success"></use>
                    </svg>
                </div>
                <div class="msg-name">{{'dataCenter.succeed' | t}}</div>
                <div class="msg-text">{{'dataCenter.viewDetail' | t}}</div>
                <div class="shell">
                    <router-link tag="button" class="btn  btn-md btn-theme" v-if="isAdd"
                                 :to="{
                                 name:'sftpDetails',
                                 query: {id: $route.query.id, name: 'overview', previewName: 'user'}}">
                        {{'dataCenter.viewSource' | t}}
                    </router-link>
                    <router-link tag="button" class="btn btn-md btn-theme" v-else
                                 :to="{
                                 name:'sftpDetails',
                                 query: {id: $route.query.id, name: 'overview', previewName: 'user'}}">
                        {{'dataCenter.viewSource' | t}}
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { EtlApiV1 } from '@/api';
    import {downloadArrayBufferAsFile} from '../../../common/utils/downloadUtils';
    import {COMMON_NAME_REGEXP} from '../../../common/utils/regs';
    import {EXECTYPES, WEEKITEMS, MONTHITEMS, HOUR, MINUTE} from './SFTP_STEPS_SELECTOR.js';

    const ACCOUNT_NAME_REGEXP = /^[0-9a-zA-Z_]{1,}$/;
    export default {
        name: 'sftp-steps',
        props: {
            // 步骤id
            stepId: {
                type: [Number, String],
                required: true,
            },
            // 是否为新增
            isAdd: {
                type: Boolean,
                required: true,
            },
            type: {
                type: String,
                required: true,
            },
        },
        data() {
            return {
                // 执行类型
                EXECTYPES,
                // 周
                WEEKITEMS,
                // 月
                MONTHITEMS,
                // 小时
                HOUR,
                // 分钟
                MINUTE,

                // 创建一个密钥/使用自己的密钥
                generateKey: false,
                sftp: {
                    id: this.$route.query.id,
                },
                // 公钥文件
                keyFile: null,
                // 总步骤数
                total: 5,
                accountNameErr: '', // 账户名称校验提示信息
                dataSetNameErr: '',// 数据源名称校验提示信息
                downloadFail: false, // step 2 下载成功
            };
        },
        computed: {
            //当前步骤
            pageNow() {
                return this.$route.query.step;
            },

            // 任务执行类型
            execTypeVal: {
                get() {
                    let type = this.sftp.execType ? this.sftp.execType : 0;
                    switch (type) {
                        case 0 : // 每天
                            this.sftp.day = null;
                            this.sftp.week = null;
                            break;
                        case 1 : // 每周
                            this.sftp.day = null;
                            this.sftp.week = this.sftp.week ? this.sftp.week : 1;
                            break;
                        case 2 : // 每月
                            this.sftp.day = this.sftp.day ? this.sftp.day : 1;
                            this.sftp.week = null;
                            break;
                    }
                    return type;
                },
                set(newValue) {
                    this.sftp.execType = newValue;
                },
            },

            // hour
            hourVal: {
                get() {
                    return this.sftp.hour === null || this.sftp.hour === 0 ? '00' : this.sftp.hour;
                },
                set(newValue) {
                    this.sftp.hour = newValue || '00';
                },
            },

            // minute
            minuteVal: {
                get() {
                    return this.sftp.minute === null || this.sftp.minute === 0 ? '00' : this.sftp.minute;
                },
                set(newValue) {
                    this.sftp.minute = newValue || '00';
                },
            },
        },

        mounted() {
            if (this.$route.query.id) {
                this.fetchSftpDetail();
            }
        },

        methods: {
            // step 1 账户名称校验
            accountNameVerify() {
                this.accountNameErr = '';

                if (!this.sftp.sftpUsername) {
                    this.accountNameErr = this.$t('dataCenter.accountNameNoEmpty');
                    return false;
                }

                if (!ACCOUNT_NAME_REGEXP.test(this.sftp.sftpUsername)) {
                    this.accountNameErr = this.$t('dataCenter.accountNameReg');
                    return false;
                }

                return true;
            },

            // step 3 参数设置
            preferencesVerify() {
                this.dataSetNameErr = '';

                if (!this.sftp.dataSet) {
                    this.dataSetNameErr = this.$t('dataCenter.sourceNameNoEmpty');
                    return false;
                }

                if (!COMMON_NAME_REGEXP.test(this.sftp.dataSet)) {
                    this.dataSetNameErr = this.$t('dataCenter.sourceNameReg');
                    return false;
                }

                return true;
            },

            /**
             * 点击页码跳转
             * 新增时页码不可向前点击，只能回退(todo)
             * 修改时都可以点击
             * @param no    点击的页码
             */
            pageClick(no) {
                // 修改
                if (!this.isAdd) {
                    // sftp 第2步下载文件
                    switch (no) {
                        case 2:
                            this.createKey(no);
                            break;
                        default:
                            if (this.generateKey) {
                                this.useMyOwnKey(no);
                            } else {
                                // 编辑: 数据源名称为空时，只能点击step 1、step 2和step 3
                                if ((this.sftp.dataSet === null || this.sftp.dataSet === undefined || this.sftp.dataSet === '')
                                    && (no === 1 || no === 2 || no === 3)) {
                                    // 跳转到step
                                    this.$router.push({
                                        name: this.$route.name,
                                        query: {
                                            id: this.$route.query.id,
                                            name: 'set',
                                            step: no,
                                            type: 'sftp',
                                        },
                                    });
                                }
                                // 编辑: 数据源名称为空时，不能点击step 4和step 5
                                if ((this.sftp.dataSet === null || this.sftp.dataSet === undefined || this.sftp.dataSet === '')
                                    && (no === 4 || no === 5)) {
                                    this.$toast(this.$t('dataCenter.stepThreeErr'), 'warn');
                                    // 跳转到step 3
                                    this.$router.push({
                                        name: this.$route.name,
                                        query: {
                                            id: this.$route.query.id,
                                            name: 'set',
                                            step: 3,
                                            type: 'sftp',
                                        },
                                    });
                                }
                                this.setParams(no);
                            }
                            break;
                    }
                } else {
                    // 新增
                    if (no < this.pageNow) {
                        this.$router.push({
                            name: this.$route.name,
                            query: {
                                id: this.$route.query.id,
                                step: no ? no : this.$route.query.step,
                                type: 'sftp',
                            },
                        });
                    }
                }
            },

            // 为我生成一个密钥（创建账户+下载密钥）
            createANewKey(no) {
                if (this.isAdd) {
                    this.$loading();
                    EtlApiV1
                        .createAccount(this.keyFile, this.sftp.sftpUsername)
                        .then(res => {
                            this.sftp = res.body.data.sftp;
                            this.downloadKey(this.sftp.id);

                            // 创建密钥
                            this.$router.push({
                                name: 'sftp',
                                query: {
                                    id: this.sftp.id,
                                    step: 2,
                                    type: 'sftp',
                                }
                            });
                            this.$loaded();
                            this.accountNameErr = '';
                        })
                        .catch(err => {
                            console.error(err);
                            this.$loaded();
                        });
                } else {
                    this.downloadKey(this.sftp.id);
                    // 创建密钥
                    this.$router.push({
                        name: 'sftpDetails',
                        query: {
                            id: this.sftp.id,
                            name: 'set',
                            step: no ? no : this.$route.query.step,
                            type: 'sftp',
                        },
                    });
                }
            },

            // sftp 下载密钥
            downloadKey(sftpId) {
                this.$loading();
                EtlApiV1
                    .downloadSecretKey(sftpId)
                    .then(res => {
                        downloadArrayBufferAsFile('id_rsa', res.body, 'application/octet-stream')
                            .catch(err => {
                                let msg = typeof err === 'string' ? err : this.$t('dataCenter.downloadErr');
                                this.downloadFail = true;
                                this.$toast(msg, 'warn');
                            });
                        this.$loaded();
                    })
                    .catch(err => {
                        console.error(err);
                        this.$loaded();
                    });
            },

            // 触发input 的 click 事件
            triggerSelect() {
                this.$refs.input.click();
            },

            //选择文件
            selectedFile(e) {
                this.keyFile = null;
                this.keyFile = e.target.files[0];
            },

            // 使用我自己的密钥（创建账户+上传文件）
            useMyOwnKey(no) {
                if (!this.keyFile) {
                    this.$toast(this.$t('dataCenter.selectPublicFile'), 'warn');
                    return false;
                }
                if (this.keyFile.size > 1000) {
                    return this.$toast(this.$t('dataCenter.fileSize'), 'warn');
                }
                const reader = new FileReader();
                const vm = this;
                reader.onload = function (readDoneEvt) {
                    if (!/^[A-z0-9-]*\s.+\s.+$/.test(readDoneEvt.target.result.trim())) {
                        return vm.$toast(this.$t('dataCenter.privateReg'), 'warn');
                    }

                    // 新增
                    if (vm.isAdd) {
                        vm.$loading();
                        EtlApiV1
                            .createAccount(vm.keyFile, vm.sftp.sftpUsername)
                            .then(res => {
                                vm.sftp = res.body.data.sftp;

                                // 创建密钥
                                vm.$router.push({
                                    name: 'sftp',
                                    query: {
                                        id: vm.sftp.id,
                                        step: 2,
                                        type: 'sftp',
                                    },
                                });
                                vm.$loaded();
                            })
                            .catch(() => {
                                vm.$loaded();
                            });
                    } else {
                        // 修改  详情-设置页面
                        vm.$loading();
                        EtlApiV1
                            .updateSecretKey(vm.$route.query.id, vm.keyFile)
                            .then(() => {
                                // 创建密钥
                                vm.$router.push({
                                    name: 'sftpDetails',
                                    query: {
                                        id: vm.sftp.id,
                                        name: 'set',
                                        step: no ? no : 2,
                                        type: 'sftp',
                                    },
                                    params: {i: 1},
                                });
                                vm.$loaded();
                            })
                            .catch(() => {
                                vm.$loaded();
                            });
                    }
                };
                reader.onerror = function (err) {
                    console.error(err);
                };
                reader.readAsText(this.keyFile);
            },

            // step 1 创建密钥
            createKey(no) {
                if (!this.accountNameVerify()) {
                    return;
                }
                // 生成密钥 1.创建账户，下载文件
                if (!this.generateKey) {
                    this.createANewKey(no);
                } else {
                    // 使用我自己的密钥 1.创建账户，上传文件
                    this.useMyOwnKey(no);
                }
            },

            // step 3 保存
            setParams(no) {
                if (!this.preferencesVerify()) {
                    return;
                }
                this.sftp.hour = this.sftp.hour || 0;
                this.sftp.minute = this.sftp.minute || '00';
                this.sftp.execType = this.execTypeVal;
                this.$loading();
                EtlApiV1
                    .setParams(this.sftp)
                    .then(() => {
                        // 保存
                        this.$router.push({
                            name: this.isAdd ? 'sftp' : 'sftpDetails',
                            query: this.isAdd
                                ? {id: this.$route.query.id, step: 4, type: 'sftp'}
                                : {id: this.$route.query.id, name: 'set', step: no ? no : 4, type: 'sftp'},
                        });
                        // 更新的sftp的name
                        this.$emit('updateSftp', this.sftp);
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            // step 4 生成文件模板
            createTemplate() {
                this.$loading();
                EtlApiV1
                    .getTemplate(this.$route.query.id)
                    .then(res => {
                        // 错误拦截
                        if (res.body && res.body.code && res.body.code !== 200) {
                            this.$toast(res.body.message, 'warn');
                            this.$loaded();
                            return;
                        }

                        // 触发下载
                        downloadArrayBufferAsFile('template.zip', res.body, 'application/zip')
                            .catch(err => {
                                let msg = typeof err === 'string' ? err : this.$t('dataCenter.templateErr');
                                this.$toast(msg, 'warn');
                            });

                        // 生成文件模板
                        this.$router.push({
                            name: this.isAdd ? 'sftp' : 'sftpDetails',
                            query: this.isAdd
                                ? {id: this.$route.query.id, step: 5, type: 'sftp'}
                                : {id: this.$route.query.id, name: 'set', step: 5, type: 'sftp'},
                        });
                        this.$loaded();
                    })
                    .catch(err => {
                        console.error(err);
                        this.$loaded();
                        this.$toast(this.$t('dataCenter.templateErr'), 'warn');
                    });
            },

            // 获取sftp详情
            fetchSftpDetail() {
                this.$loading();
                EtlApiV1
                    .getSftpDetails(this.$route.query.id)
                    .then(res => {
                        this.sftp = res.body.data.sftp;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import '../scss/step-anchor';
    @import '../scss/step-content';

    .step {
        .upload-public {
            border: none;
            margin-left: 32px;
            color: $blue;
            background-color: #fff;
            cursor: pointer;
            @include appearance(none);
            &.disabled {
                cursor: not-allowed;
            }
            svg {
                fill: $blue;
                width: 12px;
                height: 12px;
            }
            &:hover {
                color: $light-blue;
            }
        }

        // step 1, step 3
        .step1 {
            .label {
                float: none;
                margin-right: 1.2em;
            }
            .update-label {
                margin-right: 3.1em;
            }
            .from-name {
                margin: 24px 0;
            }
            .time {
                .time-item {
                    width: 92px;
                }
            }
            .model {
                margin-bottom: 0;
            }
        }

        // step 2, step 5
        .step2 {
            .icon {
                text-align: center;
                margin: 40px 0 8px 0;
            }
            .icon-success {
                width: 40px;
                height: 40px;
                fill: $green;
            }
            .icon-round-close {
                width: 40px;
                height: 40px;
                fill: $red;
            }
        }

        // step
        .step4 {
            .icon {
                text-align: center;
                margin: 76px 0 8px 0;
                svg {
                    width: 40px;
                    height: 40px;
                    fill: $green;
                }
            }
        }
    }
</style>