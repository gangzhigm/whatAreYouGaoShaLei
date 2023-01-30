<template>
    <modal class="material-test"
           :title="title"
           size="lg"
           @close="close"
           v-if="visible">
        <inline-loading v-if="loading"/>
        <template v-else>
            <!-- 短信测试 || 彩信测试 -->
            <template v-if="material.type === 0 || material.type === 2">
                <div class="form-field flex">
                    <label class="label">
                        {{(material.type === 0 ? 'controller.smsSignature' : 'controller.mmsSignature') | t}}
                    </label>
                    <div class="field-group">
                        <selector v-if="material.type === 0"
                                  class="xl"
                                  :options="sendoutList"
                                  :search="sendoutList.length > 10"
                                  v-model="SMS.sendoutId"/>
                        <selector v-else
                                  class="xl"
                                  :options="sendoutList"
                                  :search="sendoutList.length > 10"
                                  v-model="MMS.sendoutId"/>
                    </div>
                </div>
                <div class="form-field flex" v-if="material.type === 2">
                    <label class="label" for="mmsSubjectInput">{{$t('controller.mmsSubject')}}</label>
                    <div class="field-group">
                        <input type="text" id="mmsSubjectInput" class="input xl" v-model.trim="MMS.mailSubject"
                               ref="mmsSubjectInput" maxlength="66"
                               :placeholder="$t('controller.mmsSubject_placeholder')">
                    </div>
                </div>
                <div class="form-field flex">
                    <label class="label">{{'material.testNo' | t}}</label>
                    <div class="field-group">
                        <p class="light-content-text">
                            {{'material.testNoTipA' | t}}
                            <strong class="theme-text">{{uniqueValidTels.length}}</strong>
                            {{'material.testNoTipB' | t}}
                            <span class="icon icon-help" v-title:top="$t('material.testNotice')"></span>
                        </p>
                        <template v-if="material.type === 0">
                            <input v-for="testTel in SMS.testTels"
                                   type="number"
                                   :key="testTel.id"
                                   v-model.trim="testTel.tel"
                                   :placeholder="$t('material.mobileNoHolder')"
                                   class="input lg test-input"
                                   @keydown="keydownChecker"
                                   @keyup.enter="addTelNumber"/>
                        </template>
                        <template v-else>
                            <input v-for="testTel in MMS.testTels"
                                   type="number"
                                   :key="testTel.id"
                                   v-model.trim="testTel.tel"
                                   :placeholder="$t('material.mobileNoHolder')"
                                   class="input lg test-input"
                                   @keydown="keydownChecker"
                                   @keyup.enter="addTelNumber"/>
                        </template>
                        <span class="action-text" @click="addTelNumber">+&nbsp;{{'material.addTestNo' | t}}</span>
                    </div>
                </div>
            </template>
            <!-- 邮件测试 -->
            <template v-if="material.type === 1 || material.type === 3 ||  material.type === 6">
                <div class="form-field flex">
                    <label class="label">{{'material.address' | t}}</label>
                    <div class="field-group">
                        <selector class="xl"
                                  :options="senderAddresses"
                                  :search="senderAddresses.length > 10"
                                  v-model="Email.sendAddressId" @select="changeAddress"/>
                    </div>
                </div>
                <div class="form-field flex">
                    <label class="label">{{'material.sender' | t}}</label>
                    <div class="field-group">
                        <selector class="xl" :options="senderList" search v-model="Email.senderId"
                                  @select="changeSenders"/>
                        <button type="button" class="action-icon icon icon-pencil" v-title:top="$t('common.edit')"
                                :disabled="$has('journey_edit_send_user')" @click="showEditSender">
                        </button>
                    </div>
                </div>
                <div class="form-field flex">
                    <label class="label">{{'material.testSubject' | t}}</label>
                    <div class="field-group">
                        <span v-if="isADMail" class="mail-subject-ad-prefix">(AD)</span>
                        <input type="text" class="input lg" v-model.trim="mailSubject"
                               ref="mailSubjectInput" maxlength="100">
                        <selector :options="selectFields" :placeholder="$t('controller.insert')"
                                  @select="insertField($event)"/>
                        &nbsp;
                        <checkbox v-model="isADMail">{{'controller.insertADPrefix' | t}}</checkbox>
                        <i class="action-icon icon icon-help" v-title:bottom="$t('controller.emailSubjectADTip')"></i>
                    </div>
                </div>
                <div class="form-field flex">
                    <label class="label">{{'material.testEmail' | t}}</label>
                    <div class="field-group">
                        <p class="light-content-text">
                            {{'material.testEmailTipA' | t}}
                            <strong class="theme-text">{{uniqueValidEmails.length}}</strong>
                            {{'material.testEmailTipB' | t}}
                            <span class="icon icon-help"
                                  v-title:top="$t('material.testNotice')"></span>
                        </p>
                        <input type="text"
                               v-for="number in Email.testMails"
                               v-model.trim="number.address"
                               class="input xl test-input"
                               @keydown.enter="addTelNumber">
                        <span class="action-text" @click="addTelNumber()">+&nbsp;{{'material.addTestEmail' | t}}</span>
                    </div>
                </div>
            </template>
        </template>
        <template v-slot:buttons>
            <button type="button" class="btn btn-md btn-white" @click="close">{{'common.cancel' | t}}</button>
            <button type="button" class="btn btn-md btn-theme" @click="testSend" :disabled="loading">
                {{'material.testNow' | t}}
            </button>
        </template>
        <edit-sender-modal :editSenderShow="editSenderShow" :senderList="senderList"
                           @close="closeEditSender" @change="fetchSenderList"></edit-sender-modal>
    </modal>
</template>
<script type="text/ecmascript-6">
    import { ContactApiV1, SmsServiceApiV1, JourneyApiV1, JourneyMaterialApiV1, GeteOriginApi, SenderApi } from '@/api';
    import {EMAIL_ADDRESS_REGEXP, PHONE_REGEXP} from '@/common/utils/regs';
    import {logError} from '../../monitor';
    import uniq from 'lodash/uniq';
    import getCursorPosition from '../../common/utils/cursorPosition';
    import EditSenderModal from '../../common/components/edit-sender-modal.vue';
    import rootStore from '@/store/vuex/rootStore';

    export const AD_EMAIL_PREFIX = '(AD) ';
    export default {
        components: {
            EditSenderModal,
        },
        data() {
            return {
                loading: true,  //加载
                visible: false, //加载弹窗是否显示
                // material.type: sms:0, email:1,3 mms:2
                material: {},
                // 短信、彩信
                sendoutList: [],
                senderAddresses: [],// 邮件发送地址选项
                SMS: {//短信
                    sendoutId: '',
                    testTels: [{tel: '', id: 0}],
                },
                Email: {//邮件
                    testMails: [{address: rootStore.state.user.email, id: 0}],
                    senderId: '', // 发送人 id
                    sendName: '', // 发送人
                    sendAddressId: '', // 发送地址
                },
                MMS: {//彩信
                    mailSubject: '',
                    sendoutId: '',
                    testTels: [{tel: '', id: 0}],
                },
                selectFields: [], //彩信主题自定义字段、邮件主题插入字段
                departmentId: '', // 部门ID
                searchType: '', // 0 邮件 1短信 2彩信
                roleId: '', //  规则id
                sendMailSubject: '', //最终主题内容
                senderList: [], // 发件人列表
                editSenderShow: false,      // 编辑（新增）发件人弹窗
            };
        },
        computed: {
            // 华为类型账号
            isHw() {
                return localStorage.getItem('isHw') === '1';
            },
            title() {//title名 邮件测试/短信测试/彩信测试/nike邮件
                switch (this.material.type) {
                    // 邮件
                    case 1:
                    case 3:
                        return this.$t('material.emailTest');
                    case 6:
                        return this.$t('material.emailTest');
                    // 短信
                    case 0:
                        return this.$t('material.smsTest');
                    // 彩信
                    case 2:
                        return this.$t('material.mmsTest');
                    default:
                        logError('测试不能识别的素材：' + this.material.name);
                        return '';
                }
            },
            // 有效的手机号
            validTels() {
                return this.material.type === 0 ?
                    this.SMS.testTels.map(({tel}) => tel)
                        .filter(tel => PHONE_REGEXP.test(tel)) :
                    this.MMS.testTels.map(({tel}) => tel)
                        .filter(tel => PHONE_REGEXP.test(tel));
            },
            // 去重的有效手机号
            uniqueValidTels() {
                return uniq(this.validTels);
            },
            // 有效的邮箱
            validEmails() {
                return this.Email.testMails
                    .map(({address}) => address)
                    .filter(address => EMAIL_ADDRESS_REGEXP.test(address));
            },
            // 去重的有效邮箱
            uniqueValidEmails() {
                return uniq(this.validEmails);
            },
            // 输入框展示的主题内容
            mailSubject: {
                get() {
                    return this.isADMail ? this.sendMailSubject.replace(/^\(AD\) /, '') : this.sendMailSubject;
                },
                set(val) {
                    this.sendMailSubject = this.isADMail ? ('(AD) ' + val) : val;
                }
            },
            // 主题是否插入AD
            isADMail: {
                get() {
                    return this.sendMailSubject.startsWith(AD_EMAIL_PREFIX);
                },
                set(newVal) {
                    if (newVal === true) {
                        this.sendMailSubject = AD_EMAIL_PREFIX + this.sendMailSubject;
                    } else {
                        this.sendMailSubject = this.sendMailSubject.replace(AD_EMAIL_PREFIX, '');
                    }
                }
            },
        },

        mounted() {
            this.roleId = rootStore.state.user.roleId;
            if (this.material.type === 2 || this.material.type === 1 ||
                this.material.type === 3 || this.material.type === 6) {
                // 获取自定义字段
                ContactApiV1
                    .getFields()
                    .then(({body: {data: {fieldList}}}) => {
                        this.selectFields = fieldList.map((field) => ({
                            name: field.field,
                            id: field.id,
                            cn_name: field.fieldCn,
                            type: field.fieldType
                        }));
                    });
            }
            if (this.material.type === 2) this.MMS.mailSubject = this.material.materialName;
        
            this.prepareConfigData();
        },
        methods: {
            //配置数据
            prepareConfigData() {
                this.loading = true;
                switch (this.material.type) {
                    case 1:
                    case 3:
                        // 邮件
                        if (this.roleId === 0 || this.roleId === '') {
                            JourneyApiV1
                                .getAddress()
                                .then(({body: {data: {addressList}}}) => {
                                    this.senderAddresses = addressList.map(address => ({
                                        name: address.sendAddress,
                                        id: address.senderId
                                    }));

                                    if (this.senderAddresses.length > 0) {
                                        this.Email.sendAddressId = this.senderAddresses[0].id;
                                        this.fetchSenderList();
                                    }
                                    this.loading = false;
                                });
                        } else {
                            GeteOriginApi
                                .getAllSendChannel({
                                    departmentId: this.departmentId,
                                    searchType: 0,
                                })
                                .then(({body: {data: {sendChannel}}}) => {
                                    this.senderAddresses = sendChannel.map(address => ({
                                        name: address.sendAddress,
                                        id: address.senderId
                                    }));
                                    if (this.senderAddresses.length > 0) {
                                        this.Email.sendAddressId = this.senderAddresses[0].id;
                                        this.fetchSenderList();
                                    }
                                    this.loading = false;
                                });
                        }
                        break;
                    case 6:
                        // 邮件
                        if (this.roleId === 0 || this.roleId === '') {
                            JourneyApiV1
                                .getAddress()
                                .then(({body: {data: {addressList}}}) => {
                                    this.senderAddresses = addressList.map(address => ({
                                        name: address.sendAddress,
                                        id: address.senderId
                                    }));
                                    if (this.senderAddresses.length > 0) {
                                        this.Email.sendAddressId = this.senderAddresses[0].id;
                                        this.fetchSenderList();
                                    }
                                    this.loading = false;
                                });
                        } else {
                            GeteOriginApi
                                .getAllSendChannel({
                                    departmentId: this.departmentId,
                                    searchType: 0,
                                })
                                .then(({body: {data: {sendChannel}}}) => {
                                    this.senderAddresses = sendChannel.map(address => ({
                                        name: address.sendAddress,
                                        id: address.senderId
                                    }));
                                    if (this.senderAddresses.length > 0) {
                                        this.Email.sendAddressId = this.senderAddresses[0].id;
                                        this.fetchSenderList();
                                    }
                                    this.loading = false;
                                });
                        }

                        break;
                    case 0: // sms 短信
                    case 2: // mms 彩信
                        if (this.roleId === 0 || this.roleId === '') {
                            SmsServiceApiV1
                                .getSendOutList()
                                .then(({body: {data}}) => {
                                    // data maybe null, due to legacy sever code
                                    this.sendoutList = (data ? data.sendouts : [])
                                        .filter(sendout => {
                                            sendout.id = sendout.sendoutId;
                                            sendout.name = '【' + sendout.message + '】' + sendout.sendoutName;

                                            // 短信
                                            if (this.material.type === 0) {
                                                // sendout.type: 0国内短信 2海外短信
                                                return sendout.type === 0 || sendout.type === 2;
                                            } else if (this.material.type === 2) {
                                                // 彩信
                                                // sendout.type: 1国内彩信
                                                return sendout.type === 1;
                                            }
                                        });
                                    this.loading = false;
                                });
                        } else {
                            if (this.material.type === 0) {
                                GeteOriginApi
                                    .getAllSendChannel({
                                        departmentId: this.departmentId,
                                        searchType: 1,
                                    })
                                    .then(({body: {data: {sendChannel}}}) => {
                                        this.sendoutList = sendChannel.map((address) => ({
                                            name: address.sendAddress,
                                            id: address.sendoutId
                                        }));
                                        this.loading = false;
                                    });

                            } else if (this.material.type === 2) {
                                GeteOriginApi
                                    .getAllSendChannel({
                                        departmentId: this.departmentId,
                                        searchType: 2,
                                    })
                                    .then(({body: {data: {sendChannel}}}) => {
                                        this.sendoutList = sendChannel.map((address) => ({
                                            name: address.sendAddress,
                                            id: address.sendoutId
                                        }));
                                        this.loading = false;
                                    });
                            }
                        }
                        break;
                    default:
                        this.loading = false;
                        logError('测试不能识别的素材：' + this.material.name);
                }
            },
            close() {
                this.SMS.sendoutId = '';
                this.SMS.testTels = [{tel: '', id: 0}];

                if (this.senderList.length > 0) {
                    this.Email.senderId = this.senderList[0].id;
                    this.Email.sendName = this.senderList[0].name;
                }

                this.Email.testMails = [{address: rootStore.state.user.email, id: 0}];

                this.MMS.sendoutId = '';
                this.MMS.testTels = [{tel: '', id: 0}];

                this.sendMailSubject = '';

                this.visible = false;
                // this.$set(this.$data, 'material', {});
            },

            // 手机号输入框屏蔽部分按键
            keydownChecker(e) {
                // From https://github.com/joseluisq/vue-input-number/blob/master/index.vue
                // Allow these keys only:
                // backspace, delete, tab, escape, enter, dot
                if ([46, 8, 9, 27, 13].indexOf(e.keyCode) >= 0 ||
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

                // copied from <number-input/>
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            },

            // 添加一个测试输入框
            addTelNumber() {
                // 短信
                if (this.material.type === 0) {
                    if (this.SMS.testTels.length < 10) {
                        this.SMS.testTels.push({tel: '', id: this.SMS.testTels.length});
                    } else {
                        this.$toast(this.$t('material.maxTen'), 'warn');
                    }
                }
                // 彩信
                if (this.material.type === 2) {
                    if (this.MMS.testTels.length < 10) {
                        this.MMS.testTels.push({tel: '', id: this.MMS.testTels.length});
                    } else {
                        this.$toast(this.$t('material.maxTen'), 'warn');
                    }
                } else if (this.material.type === 1 || this.material.type === 3 || this.material.type === 6) {
                    // 邮件
                    if (this.Email.testMails.length < 10) {
                        this.Email.testMails.push({address: '', id: this.Email.testMails.length});
                    } else {
                        this.$toast(this.$t('material.maxTen'), 'warn');
                    }
                }
            },

            // 测试发送按钮事件
            async testSend() {
                if (this.material.type === 1 || this.material.type === 3 || this.material.type === 6) {
                    this.emailTestSend();
                } else {
                    // 判断是否可以发送
                    let isAccess = await JourneyMaterialApiV1
                        .checkMaterialTest(this.material.id)
                        .then((res) => {
                            return res.body;
                        });
                    if (isAccess.code !== 200) {
                        this.$toast(isAccess.message, 'warn');
                        return;
                    }
                    this.messageTestSend();
                }
            },
            // 短信、彩信测试发送
            async messageTestSend() {
                // 活动必选
                if (this.material.type === 0 && this.SMS.sendoutId === '') {
                    this.$toast(this.$t('material.campaignRequire'), 'warn');
                    return;
                }
                if (this.material.type === 2 && this.MMS.sendoutId === '') {
                    this.$toast(this.$t('material.mmsCampaignRequire'), 'warn');
                    return;
                }
                if (this.material.type === 2 && (this.MMS.mailSubject === '' || !this.MMS.mailSubject)) {
                    this.$toast(this.$t('material.mmsSubjectNoEmpty'), 'warn');
                    return;
                }
                if (this.material.type === 2 && this.MMS.mailSubject.length > 66) {
                    this.$toast(this.$t('material.mmsSubjectlength'), 'warn');
                    return;
                }
                // 至少一个有效手机号
                if (this.uniqueValidTels.length === 0) {
                    this.$toast(this.$t('material.testNoRequired'), 'warn');
                    return;
                }

                let notice = '';
                // 如果有重复手机号，不会重复发送
                if (this.validTels.length !== this.uniqueValidTels.length) {
                    notice += this.$t('material.repeatNoTip') + this.$t('punctuation.period');
                }
                // 如果有不合格的手机号，不会给它们发送消息
                if (this.material.type === 0 && this.validTels.length !== this.SMS.testTels.length) {
                    notice += this.$t('material.badNoConfirm');
                }
                if (this.material.type === 2 && this.validTels.length !== this.MMS.testTels.length) {
                    notice += this.$t('material.badNoConfirm');
                }

                if (notice) {
                    let confirmed = await this.$confirm(this.$t('common.notice'), notice);
                    if (!confirmed) return;
                }

                if (this.material.type === 2) {
                    SmsServiceApiV1
                        .mmsTestSend(this.uniqueValidTels, this.MMS.sendoutId, this.MMS.mailSubject, this.material.id)
                        .then(() => {
                            this.$toast(this.$t('material.executeSuccess'));
                        });
                } else {
                    SmsServiceApiV1
                        .testSend(this.uniqueValidTels, this.SMS.sendoutId, this.material.id)
                        .then(() => {
                            this.$toast(this.$t('material.executeSuccess'));
                        });
                }

                this.close();
            },
            // 邮件测试发送
            async emailTestSend() {
                // 发送地址 (无发送地址可选)
                if (!this.senderAddresses.length) {
                    this.$toast(this.$t('material.addressEmpty'), 'warn');
                    return;
                }

                // 发件人
                let sender = this.senderList.find(sender => sender.id === this.Email.senderId);
                if (!sender || (sender && sender.name === '') || !this.Email.sendName || !this.Email.senderId) {
                    this.$toast(this.$t('material.senderRequired'), 'warn');
                    return;
                }
                // 至少一个有效地址
                if (this.uniqueValidEmails.length === 0) {
                    this.$toast(this.$t('material.addressRequired'), 'warn');
                    return;
                }
                //判断邮箱后缀是否是@huawei.com;
                if (this.isHw){
                    const emailIsHuaWei = this.Email.testMails.filter((e) => (e.address.includes('@huawei.com') || e.address.includes('@qdum.com')));
                    if (this.validEmails.length !== emailIsHuaWei.length) {
                        return this.$toast(this.$t('common.emailTypeWaring'), 'warn');
                    }
                }

                let notice = '';
                // 如果有重复邮箱，不会重复发送
                if (this.validEmails.length !== this.uniqueValidEmails.length) {
                    notice += this.$t('material.repeatAddressTip') + this.$t('punctuation.period');
                }
                // 如果有不合格的邮箱，不会给它们发送
                if (this.validEmails.length !== this.Email.testMails.length) {
                    notice += this.$t('material.badEmlNoConfirm');
                }

                if (notice) {
                    let confirmed = await this.$confirm(this.$t('common.notice'), notice);
                    if (!confirmed) return;
                }

                JourneyApiV1
                    .mailTest(
                        this.uniqueValidEmails,
                        this.material.excerpta,
                        this.material.id,
                        sender.name,
                        this.Email.sendAddressId,
                        this.material.journeyId,
                        this.material.controllerId,
                        this.sendMailSubject
                    )
                    .then(() => {
                        this.$toast(this.$t('material.executeSuccess'), 'success');
                    });
                this.close();
            },
            // 获取所有发件人列表
            fetchSenderList() {
                SenderApi
                    .getSenderAll(this.Email.sendAddressId)
                    .then(res => {
                        this.senderList = res.body.data.senderList;
                        if (this.senderList.length <= 0) {
                            return;
                        }
                        this.senderList.map(sender => {
                            this.$set(sender, 'btnsShow', false);
                        });
                        // 默认的发件人
                        this.Email.senderId = this.senderList[0].id;
                        this.Email.sendName = this.senderList[0].name;
                    });
            },
            // 选择发件地址
            changeAddress() {
                this.fetchSenderList();
            },
            // 选择发件人
            changeSenders(sender) {
                this.Email.senderId = sender.id;
                this.Email.sendName = sender.name;
            },
            // 编辑发件人弹窗
            showEditSender() {
                this.editSenderShow = true;
            },
            // 关闭发件人弹窗
            closeEditSender() {
                this.editSenderShow = false;
            },
            /**
             * 选择插入的内容
             * @param field
             */
            insertField(field) {
                let targetPos = getCursorPosition(this.$refs.mailSubjectInput);
                let content = [...this.sendMailSubject];
                if (content.length + ('{$' + field.name + '}').length > 100) {
                    this.$toast(this.$t('controller.emailTitleWarn'), 'warn');
                    return false;
                }
                if (this.isADMail) {
                    content.splice(5 + targetPos, 0, '{$' + field.name + '}');
                } else {
                    content.splice(targetPos, 0, '{$' + field.name + '}');
                }
                this.sendMailSubject = content.join('');
            }
        }
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .material-test {
        .test-input {
            display: block;
            margin-top: 8px;
        }

        .mail-subject-ad-prefix {
            display: inline-block;
            padding: 0 8px;
            color: $light-green;
            background-color: $content-bg;
            border-radius: 4px;
        }
    }
</style>
