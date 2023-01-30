<template>
    <modal :title="$t('controller.ABTest')" @close="$emit('close')" class="controller-form">

        <div class="form-field flex">
            <label class="label">{{'controller.stepName' | t}}</label>
            <span v-if="isChecking" class="flex-1">{{testController.name}}</span>
            <div v-else class="field-group">
                <input type="text" class="input" maxlength="30" v-model.trim="testController.name">
            </div>
        </div>
        <div class="form-field test-time flex">
            <label class="label">{{'journey.testTime' | t}}</label>
            <span v-if="isChecking" class="flex-1">
                {{testController.testDate}}{{sendHourMinute}}{{timeZone ? timer.$getByKey(timeZone).name : ''}}
            </span>
            <div v-else class="field-group">
                <div class="selected-test-time">
                    <calendar :clearBtn="true" :start="today" :showTodayBtn="false"
                              v-model="testController.testDate"></calendar>
                    <hour-minute-select v-model="sendHourMinute"></hour-minute-select>
                    <p>{{timeZone ? timer.$getByKey(timeZone).name : ''}}</p>
                </div>
            </div>
        </div>
        <div class="form-field flex">
            <label class="label">{{'controller.send_email' | t}}</label>
            <div class="send-email-content flex-1">
                <div class="checkbox-area">
                    <checkbox :source="1" :disabled="isChecking" @input="selectThemeType" v-model="theme">{{'controller.unifiedTheme' | t}}
                    </checkbox>
                    <checkbox :source="2" :disabled="isChecking" v-model="theme">{{'controller.common' | t}}（AD）{{'data.Email' | t}}
                        {{'controller.subjectIdentifier' | t}}
                    </checkbox>
                </div>
                <div class="send-email-branch">
                    <div class="branch form-field flex" v-for="(items,index) in selectEmailBranchList"
                         :key="items.name">
                        <label class="label" v-if="en">{{'controller.mailing' | t}}{{items.name}}</label>
                        <label class="label" v-else>{{items.name}}{{'controller.mailing' | t}}</label>
                        <div class="chosen-email-content check flex-1" v-if="isChecking">
                            <div class="chosen-email">
                                {{items.materialId && emailList.length ? emailList.$getByKey(items.materialId).name : ''}}
                            </div>
                            <div class="email-subject">
                                <div class="AD-text" v-if="theme.indexOf(2) !== -1">(AD)</div>
                                <span>{{items.subject}}</span>
                            </div>
                        </div>
                        <div v-else class="chosen-email-content">
                            <div class="chosen-email">
                                <selector class="max-width" ref="emailSelect"
                                          :options="emailList" :placeholder="$t('tag.select') + $t('swarm.email')"
                                          v-model="items.materialId" @load="loadMoreEmail"
                                          @input="selectEmail($event,index)"></selector>
                                <span class="preview-email" @click="preViewEmail(items)"
                                      v-if="items.materialId">
                                    {{'common.preview' | t}}
                                </span>
                                <span class="preview-email del-email" v-if="selectEmailBranchList.length > 2"
                                      @click="deleteEmail(items)">{{'common.del' | t}}</span>
                            </div>
                            <div class="email-subject">
                                <div class="AD-text" v-if="theme.indexOf(2) !== -1">(AD)</div>
                                <input type="text" class="input"
                                       :class="theme.indexOf(2) !== -1 ? 'min-width' : 'max-width'"
                                       :placeholder="$t('controller.inputEmailSubject')"
                                       :disabled="theme.indexOf(1) !== -1 && items.name !== 'A'"
                                       v-model.trim="items.subject" maxlength="100">
                                <selector :options="fieldList"
                                          :placeholder="$t('controller.insert')"
                                          :disabled="theme.indexOf(1) !== -1 && items.name !== 'A'"
                                          @select="insertField($event,index)"></selector>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="add-send-email" v-if="selectEmailBranchList.length !== 4 && !isChecking"
                      @click="addSendEmail">{{'controller.addABTestEmail' | t}}</span>
            </div>
        </div>
        <!--发件地址-->
        <div class="form-field flex">
            <label class="label">{{$t('controller.from_address')}}</label>
            <span v-if="isChecking" class="flex-1">
                {{testController.senderId && senderAddresses.length ? senderAddresses.$getByKey(testController.senderId).name : ''}}
            </span>
            <div v-else class="field-group">
                <selector class="xl"
                          :options="senderAddresses"
                          :search="senderAddresses.length > 10"
                          :placeholder="$t('tag.select') + $t('journey.senderAddress')"
                          :value="testController.senderId"
                          @select="changeSendAddress"/>
            </div>
        </div>
        <!--发件抬头-->
        <div class="form-field flex">
            <label class="label" for="sendName">{{$t('controller.from_name')}}</label>
            <span v-if="isChecking" class="flex-1">
                {{testController.sendName}}
            </span>
            <div v-else class="field-group" id="sendName">
                <selector class="xl" :options="senderList" search :value="testController.sendNameId"
                          @select="changeSenders"/>
                <button type="button" class="action-icon icon icon-pencil" v-title:top="$t('common.edit')"
                        @click="showEditSender" :disabled="$has('journey_edit_send_user')">
                </button>
            </div>
        </div>
        <div class="form-field flex">
            <label class="label">{{'controller.testRatio' | t}}</label>
            <div class="test-proportion">
                <div class="proportion" v-if="!isChecking">
                    <number-input class="input" :min="1" :max="50" v-model="proportion"></number-input>
                    <span>%{{'controller.proportionTip' | t}}</span>
                </div>
                <span v-else>{{proportion}}%</span>
                <div class="email-box-content">
                    <p class="items-box" :class="items.class"
                       v-for="items in emailBranchList" :key="items.name">
                        <span>{{items.name}}</span>
                        <span v-if="items.id === sort()">
                            {{AProportion}}%
                        </span>
                        <span v-else>{{items.class === 'test-' + items.name ? eachProportion : 0}}%</span>
                    </p>
                </div>
            </div>
        </div>
        <div class="form-field flex">
            <label class="label">{{'controller.testIndex' | t}}</label>
            <div class="test-quota">
                <radio :source="0" :disabled="isChecking" @input="chosenEmailLinks = []"
                       v-model="testController.index">{{'controller.emailOpenNum' | t}}
                </radio>
                <radio :source="1" :disabled="isChecking" @input="chosenEmailLinks = []"
                       v-model="testController.index">{{'controller.emailClickNum' | t}}
                </radio>
                <radio :source="2" :disabled="isChecking" v-model="testController.index">
                    {{'controller.specialLinks' | t}}
                    {{'controller.finallySend' | t}}
                </radio>
                <p v-if="testController.index === 2">
                    <span @click="getEmailTagA"
                          class="links-text">{{'controller.chosenLinks' | t}}</span>
                    （{{'controller.selected' | t}}{{linksNumber}}{{'controller.links' | t}}）
                </p>
            </div>
        </div>
        <div class="form-field flex">
            <label class="label">{{'controller.finalBatch' | t}}</label>
            <div class="finally-batch">
                <p>{{'controller.finalBatchTipOne' | t}}</p>
                <p class="disabled-text">{{'controller.finalBatchTipTwo' | t}}</p>
                <template v-if="isChecking">
                    <span>{{testController.taskDate}}{{finallySendHourMinute}}</span>
                </template>
                <template v-else>
                    <calendar :clearBtn="true" :start="testController.testDate"
                              v-model="testController.taskDate"></calendar>
                    <hour-minute-select v-model="finallySendHourMinute"></hour-minute-select>
                </template>
                <p>{{timeZone ? timer.$getByKey(timeZone).name : ''}}</p>
            </div>
        </div>
        <button v-if="!isChecking" slot="buttons" class="btn btn-md btn-theme" @click="confirmController">{{'common.confirm' | t}}</button>
        <button slot="buttons" v-else @click="close" class="btn btn-white btn-md">{{'common.close' | t}}</button>
        <!-- select email links -->
        <left-or-right-select v-if="chooseLinks" :title="$t('controller.selectLinksTitle')"
                              :left-options="allEmailLinks"
                              :right-options="chosenEmailLinks"
                              :leftName="$t('controller.testSameEmail')"
                              :rightName="$t('controller.selectedLinks')"
                              @close="chooseLinks = false"
                              @confirm="confirmLinks"></left-or-right-select>
        <!-- to get email tag A-->
        <div v-show="false" v-html="emailHtml" ref="email"></div>
        <!--新增、编辑发件人弹窗-->
        <edit-sender-modal :editSenderShow="editSenderShow" :senderList="senderList" @close="closeEditSender"
                           @change="fetchSenderList"/>
    </modal>
</template>

<script>
    import { ContactApiV1, JourneyApiV1, JourneyApiV3, JourneyMaterialApiV1, GeteOriginApi, SenderApi } from '@/api';
    import {format} from 'date-fns';
    import {cloneDeep, isArray, difference} from 'lodash';
    import {
        SET_ACTIVE_CONTROLLER,
        UPDATE_CONTROLLER,
        UPDATE_SAVE_TASK_STATUS
    } from '@/store/vuex/mutationTypes';
    import {SAVE_JOURNEY, CHECK_JOURNEY_NEW_VERSION} from '@/store/vuex/actionTypes';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import calendar from '@/common/components/date-time/calendar.vue';
    import EmailLinksPicker from '../decision-controller/components/email-links-picker.vue';
    import leftOrRightSelect from '../components/left-or-right-select.vue';
    import {I18N_STORE_NAME} from '@/locales';
    import {TIME_ZONE_RNAGES, timeZoneToday} from '@/common/utils/timeZone';
    import editSenderModal from '@/common/components/edit-sender-modal.vue';
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';

    export default {
        name: 'new-AB-test-controller-form',
        props: {
            controller: Object
        },
        data() {
            return {
                // 控件配置项
                testController: {
                    name: '',
                    testDate: '',
                    index: 0,
                    taskDate: '',
                    sendNameId: '',  // 发件人 ID
                    sendName: '',   // 发件人名称
                    senderId: '',   // 发件地址 ID
                    sendAddress: '' // 发件地址名称
                },
                sendHourMinute: '',
                finallySendHourMinute: '',
                theme: [],
                emailBranchList: [
                    {
                        name: 'A',
                        id: 1,
                        materialId: '',
                        subject: '',
                        class: 'test-A',
                    },
                    {
                        name: 'B',
                        id: 2,
                        materialId: '',
                        subject: '',
                        class: 'test-B',
                    },
                    {
                        name: 'C',
                        id: 3,
                        materialId: '',
                        subject: '',
                        class: '',
                    },
                    {
                        name: 'D',
                        id: 4,
                        materialId: '',
                        subject: '',
                        class: '',
                    }
                ],
                // 邮件列表
                emailList: [],
                emailTotalRow: 0,
                emailPageNo: 1,
                // 字段列表
                fieldList: [],
                // 发件地址
                senderAddresses: [],
                senderList: [], // 发件人列表
                editSenderShow: false,// 编辑（新增）发件人弹窗
                proportion: 50,
                chooseLinks: false,
                materialId: null,
                AProportion: 0,
                // 所有邮件短链
                allEmailLinks: [],
                // 已选短链
                chosenEmailLinks: [],
                emailHtml: '',
                departmentId: '', // 部门ID
                searchType: '', // 0 邮件 1短信 2彩信
                timer: TIME_ZONE_RNAGES
            };
        },
        created() {
            // 发送地址列表
            this.getSendAddress();
            this.getField();
            // 数据回显
            let pushInfo = this.pushInfo;
            if (pushInfo) {
                this.testController = {
                    name: pushInfo.name,
                    testDate: pushInfo.testDate.split(' ')[0],
                    index: pushInfo.index,
                    taskDate: pushInfo.taskDate.split(' ')[0],
                    sendNameId: pushInfo.sendNameId,    // 发件人 id
                    sendName: pushInfo.sendName,        // 发件人name
                    senderId: pushInfo.sendId,          // 发件地址 ID
                    sendAddress: pushInfo.sendAddress,  // 发件地址名称
                };
                this.proportion = pushInfo.proportion;
                if (pushInfo.links) {
                    this.chosenEmailLinks = pushInfo.links;
                }
                this.allEmailLinks = pushInfo.allLinks;
                this.theme = pushInfo.theme;
                this.sendHourMinute = pushInfo.testDate.split(' ')[1];
                this.finallySendHourMinute = pushInfo.taskDate.split(' ')[1];
                this.getEmailList(true, pushInfo.taskList.map(elm => elm.materialId), pushInfo.taskList);
            } else {
                // 素材列表
                this.getEmailList();
            }
        },
        watch: {
            // 日期清空
            'testController.testDate'(date) {
                if (!date) {
                    this.sendHourMinute = '';
                } else if (new Date(date).getTime() > new Date(this.testController.taskDate).getTime()) {
                    this.testController.taskDate = date;
                }
            },
            'testController.taskDate'(date) {
                if (!date) {
                    this.finallySendHourMinute = '';
                }
            }
        },
        computed: {
            ...mapGetters(['onPending']),
            ...mapState({
                pushInfo(state) {
                    return state[DRAGGABLE_JOURNEY_STORE_NAME]
                        .canvasInformation.controllers[this.controller.id].pushInfo;
                },
                journeyId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation.id,
                en: state => (state[I18N_STORE_NAME].lang === 'en'),
                // 时区
                timeZone: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation.timeZone,
                isChecking: state =>  state[DRAGGABLE_JOURNEY_STORE_NAME].isChecking,
                roleId: state => state.user.roleId
            }),
            today() {
                return format(new Date(timeZoneToday(this.timeZone)), 'YYYY-MM-DD');
            },
            // 邮件分配比例
            eachProportion() {
                let list = this.emailBranchList.filter(elm => elm.class !== '');
                let remainder = this.proportion % list.length;
                let integer = this.proportion / list.length;
                if (this.proportion % list.length) {
                    this.AProportion = Math.floor(integer) + remainder;
                    return (this.proportion - remainder) / list.length;
                }
                this.AProportion = integer;
                return integer;
            },
            selectEmailBranchList() {
                return this.emailBranchList.filter(elm => elm.class !== '');
            },
            linksNumber() {
                return this.chosenEmailLinks.length;
            }
        },
        methods: {
            ...mapMutations([
                SET_ACTIVE_CONTROLLER,
                UPDATE_SAVE_TASK_STATUS,
                UPDATE_CONTROLLER
            ]),
            ...mapActions([
                CHECK_JOURNEY_NEW_VERSION,
                SAVE_JOURNEY
            ]),
            // 获取所有发件人列表
            fetchSenderList() {
                SenderApi
                    .getSenderAll(this.testController.senderId)
                    .then(res => {
                        this.senderList = res.body.data.senderList;
                        if (this.senderList.length <= 0) return;
                        this.senderList.map(sender => {
                            this.$set(sender, 'btnsShow', false);
                        });
                        // 默认的发件人
                        /**
                         * 未编辑过，默认选中列表首个
                         * 编辑过，默认选中编辑后的
                         * 匹配发件人列表，如果有则选中，没有则为空
                         */
                        if (!this.testController.sendNameId) {
                            this.testController.sendNameId = this.senderList[0].id;
                            if (!this.isChecking) this.testController.sendName = this.senderList[0].name;
                        } else {
                            let sender = this.senderList.find(s => s.id === this.testController.sendNameId);
                            if (sender) {
                                this.testController.sendNameId = sender.id;
                                if (!this.isChecking) this.testController.sendName = sender.name;
                            }
                        }
                    });
            },
            close() {
                this.SET_ACTIVE_CONTROLLER('');
            },
            sort() {
                let needSort = this.emailBranchList.filter(elm => elm.class !== '');
                let ids = needSort.map(elm => elm.id);
                return ids.sort()[0];
            },
            // 获取发送地址
            getSendAddress() {
                if (this.roleId === 0 || this.roleId === '') {
                    JourneyApiV1
                        .getAddress()
                        .then(res => {
                            let addressList = res.body.data.addressList;
                            if (addressList.length <= 0) return;
                            this.senderAddresses = addressList.map((address) => ({
                                id: address.senderId,
                                name: address.sendAddress
                            }));

                            // 默认发件地址 id
                            /**
                             * 旅程-AB测试控件
                             * 未编辑过，默认选中列表首个
                             * 编辑过，默认选中编辑后的
                             * 匹配发件地址列表，如果有则选中，没有则为空
                             */
                            if (!this.testController.senderId) {
                                this.testController.senderId = this.senderAddresses[0].id;
                                this.testController.sendAddress = this.senderAddresses[0].name;
                            } else {
                                let addr = this.senderAddresses
                                    .find(addr => addr.senderId === this.testController.senderId);
                                if (addr) {
                                    this.testController.senderId = addr.id;
                                    this.testController.sendAddress = addr.name;
                                }
                            }
                        });

                    // 发件人列表
                    this.fetchSenderList();
                } else {
                    GeteOriginApi
                        .getAllSendChannel({
                            departmentId: this.departmentId,
                            searchType: 0,
                        })
                        .then(res => {
                            let sendChannel = res.body.data.sendChannel;
                            if (sendChannel.length <= 0) return;
                            this.senderAddresses = sendChannel.map((address) => ({
                                name: address.sendAddress,
                                id: address.senderId,
                            }));

                            // 默认发件地址 id
                            /**
                             * 旅程-AB测试控件
                             * 未编辑过，默认选中列表首个
                             * 编辑过，默认选中编辑后的
                             * 匹配发件地址列表，如果有则选中，没有则为空
                             */
                            if (!this.testController.senderId) {
                                this.testController.senderId = this.senderAddresses[0].id;
                                this.testController.sendAddress = this.senderAddresses[0].name;
                            } else {
                                let addr = this.senderAddresses
                                    .find(addr => addr.senderId === this.testController.senderId);
                                if (addr) {
                                    this.testController.senderId = addr.id;
                                    this.testController.sendAddress = addr.name;
                                }
                            }
                            this.fetchSenderList();
                        });
                }
            },
            // 修改发送地址
            changeSendAddress(address) {
                this.testController.senderId = address.id;
                this.testController.sendAddress = address.name;
                this.getSendAddress();
            },
            // 修改发件人
            changeSenders(sender) {
                this.testController.sendNameId = sender.id;
                this.testController.sendName = sender.name;
            },
            // 编辑发件人弹窗
            showEditSender() {
                this.editSenderShow = true;
            },
            // 关闭发件人弹窗
            closeEditSender() {
                this.editSenderShow = false;
            },
            getField() {
                // 个性化字段列表
                ContactApiV1
                    .getFields()
                    .then(({body: {data: {fieldList}}}) => {
                        this.fieldList = fieldList.map((field) => ({
                            name: field.field,
                            id: field.id,
                            cn_name: field.fieldCn,
                            type: field.fieldType
                        }));
                    });
            },
            // 插入字段
            insertField(field, cur) {
                let oldStr = this.selectEmailBranchList[cur].subject;
                this.selectEmailBranchList[cur].subject = oldStr + `{$${field.name}}`;
            },
            // 选择邮件
            selectEmail(id, index) {
                // 若素材有主题以素材主题为准(若素材有主题中首部包含AD，这里不予展示保存，以主题选项为准)。
                let testSubject = this.emailList.$getByKey(id).testSubject ? this.emailList.$getByKey(id).testSubject : '';
                this.selectEmailBranchList[index].subject = testSubject.indexOf('(AD)') > -1 ?
                    testSubject.substring(4) : testSubject;
                // 统一主题时以A邮件为主题(见保存)
                if (index !== 0 && this.theme.indexOf(1) !== -1) {
                    this.selectEmailBranchList[index].subject = '';
                }
                let checkList = this.selectEmailBranchList.filter(elm => (elm.materialId !== ''));
                const ids = checkList.map(elm => elm.materialId);
                let filterIds = [...new Set(ids)];
                if (ids.length !== filterIds.length) {
                    this.$toast(this.$t('controller.selectRepeatEmail'), 'warn');
                    this.selectEmailBranchList.forEach((elm, cur) => {
                        if (elm.materialId === id && cur === index) {
                            elm.materialId = '';
                            elm.subject = '';
                        }
                    });
                }
                // 更改邮件时，清空已选链接
                this.chosenEmailLinks = [];
            },
            // 获取邮件素材列表
            getEmailList(async, targetIds, targets) {
                JourneyMaterialApiV1
                    .getMaterials('', '', this.emailPageNo, 5, 0)
                    .then(({body: {data: {materialList, totalRow}}}) => {
                        materialList.forEach(material => {
                            material.name = material.materialName;
                        });
                        this.emailList = this.emailList.concat(materialList);
                        this.emailTotalRow = totalRow;
                        // 邮件回显
                        if (async) {
                            let allIds = this.emailList.map(elm => elm.id);
                            let testArray = [...new Set([...targetIds, ...allIds])];
                            if (testArray.length === allIds.length) {
                                targets.forEach(target => {
                                    this.emailBranchList.forEach((elm, cur) => {
                                        if (elm.name === target.type) {
                                            if (cur === 0 && this.theme.indexOf(1) !== -1 && this.theme.indexOf(2) === -1) {
                                                elm.subject = target.subject;
                                            }
                                            if (cur === 0 && this.theme.indexOf(1) !== -1 && this.theme.indexOf(2) !== -1) {
                                                elm.subject = target.subject.substring(4);
                                            }
                                            if (this.theme.indexOf(2) !== -1 && this.theme.indexOf(1) === -1) {
                                                elm.subject = target.subject.substring(4);
                                            }
                                            if (this.theme.indexOf(1) === -1 && this.theme.indexOf(2) === -1) {
                                                elm.subject = target.subject;
                                            }
                                            elm.materialId = target.materialId;
                                            elm.class = 'test-' + target.type;
                                            elm.taskId = target.taskId ? target.taskId : null;
                                        }
                                    });
                                });
                            } else {
                                if (this.emailTotalRow > this.emailList.length) {
                                    this.emailPageNo += 1;
                                    this.getEmailList(async, targetIds, targets);
                                }
                            }
                        }
                    });
            },
            loadMoreEmail() {
                if (this.emailTotalRow > this.emailList.length) {
                    let targetItem = this.$refs.emailSelect[0].$vnode.elm.childNodes[2].childNodes[4];
                    if (targetItem.clientHeight + targetItem.scrollTop + 1 > targetItem.scrollHeight) {
                        this.emailPageNo += 1;
                        this.getEmailList();
                    }
                }
            },
            // 删除素材
            deleteEmail(items) {
                if (items.taskId) {
                    this.UPDATE_SAVE_TASK_STATUS(true);
                    // 旅程版本检查
                    this.CHECK_JOURNEY_NEW_VERSION()
                        .then(() => {
                            JourneyApiV3
                                .deleteTask(items.taskId, 1, this.controller.id)
                                .then(() => {
                                    this.taskReSort(items);
                                    this.$nextTick(() => {
                                        let taskList = this.getTaskList();
                                        const newController = cloneDeep(this.controller);
                                        newController.pushInfo.taskList = taskList;
                                        if (taskList.length > 0) {
                                            newController.tasks = {tasks: taskList[0].taskId};
                                        }
                                        // 保存控件信息
                                        this.UPDATE_CONTROLLER(newController);
                                        // 保存旅程
                                        this.SAVE_JOURNEY(false);
                                        this.UPDATE_SAVE_TASK_STATUS(false);
                                    });
                                })
                                .catch(() => {
                                    this.UPDATE_SAVE_TASK_STATUS(false);
                                });
                        })
                        .catch(() => {
                            this.UPDATE_SAVE_TASK_STATUS(false);
                        });
                } else {
                    this.taskReSort(items);
                }
            },
            taskReSort(items) {
                items.taskId = '';
                this.emailBranchList.forEach(elm => {
                    if (elm.id === items.id) {
                        elm.class = '';
                    }
                });
                // 重新排序
                let reSortList = this.selectEmailBranchList;
                reSortList.forEach((elm, cur) => {
                    this.emailBranchList.forEach((sort, index) => {
                        if (cur === index) {
                            sort.materialId = elm.materialId;
                            sort.subject = elm.subject;
                            sort.class = `test-${sort.name}`;
                            sort.taskId = elm.taskId;
                        }
                    });
                });
                this.emailBranchList.forEach((sort, index) => {
                    if (index > reSortList.length - 1) {
                        sort.materialId = '';
                        sort.subject = '';
                        sort.class = '';
                    }
                });
            },
            // 预览素材
            preViewEmail(email) {
                if (!email.materialId) return;
                const material = this.emailList.filter(elm => elm.id === email.materialId)[0];
                material.subject = this.theme.findIndex(elm => elm === 2) !== -1 ? `(AD)${email.subject}` : email.subject;
                const previewMaterial = Object.assign({}, material);
                // get e-mail html content
                JourneyMaterialApiV1
                    .getEmailHtml(material.id)
                    .then(({body: {data: {materialContent}}}) => {
                        previewMaterial.materialContent = materialContent;
                    });

                this.$preview({material: previewMaterial});
            },
            // 添加邮件
            addSendEmail() {
                let needAdd = this.emailBranchList.filter(elm => elm.class === '');
                let cur = this.emailBranchList.findIndex(elm => elm.name === needAdd[0].name);
                this.emailBranchList[cur].class = `test-${needAdd[0].name}`;
            },
            // 确认选中的邮件链接
            confirmLinks(links) {
                this.allEmailLinks = links.left;
                this.chosenEmailLinks = links.right;
                this.chooseLinks = false;
            },
            // 保存控件信息
            confirmController() {
                if (this.onPending) {
                    this.$toast(this.$t('dragJourney.delayOperate'),'warn');
                    return;
                }
                if (this.filterData()) {
                    this.UPDATE_SAVE_TASK_STATUS(true);
                    let taskList = this.getTaskList();
                    const abSetting = {
                        controllerId: this.controller.id,
                        sendAddress: this.testController.sendAddress,
                        sendId: this.testController.senderId,
                        sendNameId: this.testController.sendNameId,
                        sendName: this.testController.sendName,
                        taskList: taskList,
                        testDate: `${this.testController.testDate} ${this.sendHourMinute}`,
                        journeyId: this.journeyId,
                        taskDate: `${this.testController.taskDate} ${this.finallySendHourMinute}`,
                        name: this.testController.name
                    };
                    // 旅程版本检查
                    this.CHECK_JOURNEY_NEW_VERSION()
                        .then(() => {
                            // 保存AB信息专属接口
                            JourneyApiV3
                                .updateABController(abSetting)
                                .then(({body: {data: {taskList}}}) => {
                                    this.UPDATE_SAVE_TASK_STATUS(false);
                                    taskList.forEach(task => {
                                        abSetting.taskList.forEach(elm => {
                                            if (task.type === elm.type) {
                                                elm.taskId = task.taskId;
                                                elm.taskInstantiationId = null;
                                            }
                                            if (elm.type === 'A') {
                                                elm.proportion = this.AProportion;
                                            } else {
                                                elm.proportion = this.eachProportion;
                                            }
                                        });
                                    });
                                    abSetting.index = this.testController.index;
                                    if (this.testController.index === 2) {
                                        abSetting.links = this.chosenEmailLinks;
                                    }
                                    abSetting.allLinks = this.allEmailLinks;
                                    abSetting.proportion = this.proportion;
                                    abSetting.theme = this.theme;
                                    const newController = cloneDeep(this.controller);
                                    newController.pushInfo = abSetting;
                                    newController.tasks = {tasks: abSetting.taskList[0].taskId};
                                    // 保存控件信息
                                    this.UPDATE_CONTROLLER(newController);
                                    // 保存旅程
                                    this.SAVE_JOURNEY(false);
                                    // 关闭弹出层
                                    this.SET_ACTIVE_CONTROLLER('');
                                })
                                .catch(() => {
                                    this.UPDATE_SAVE_TASK_STATUS(false);
                                });
                        })
                        .catch(() => {
                            this.UPDATE_SAVE_TASK_STATUS(false);
                        });
                }
            },
            filterData() {
                let result = true;
                if (this.noEmpty()) {
                    return false;
                }
                if (this.testController.index === 2 && !this.chosenEmailLinks.length) {
                    result = false;
                    this.$toast(this.$t('controller.selectedLinksEmpty'), 'warn');
                    return result;
                }
                if ((((this.theme.indexOf(2) === -1 && this.theme.indexOf(1) === -1)
                    || (this.theme.indexOf(2) !== -1 && this.theme.indexOf(1) === -1))
                    && !this.selectEmailBranchList.every(elm => elm.subject !== ''))
                    || !this.selectEmailBranchList[0].subject) {
                    result = false;
                    this.$toast(this.$t('controller.emailSubjectEmpty'), 'warn');
                    return result;
                }
                let start = `${this.testController.testDate} ${this.sendHourMinute}`;
                let end = `${this.testController.taskDate} ${this.finallySendHourMinute}`;
                let startDate = this.testController.testDate;
                let endDate = this.testController.taskDate;
                // 时区功能去掉前端拦截测试时间是过去时间（2019-09-11）
                // if ((new Date().getTime()) - (new Date(`${start}`).getTime()) >= 0) {
                //     result = false;
                //     this.$toast(this.$t('controller.noPassTime'),'warn');
                //     return result;
                // }
                if ((new Date(end).getTime() - new Date(start).getTime()) <= 2 * 3600 * 1000) {
                    result = false;
                    this.$toast(this.$t('controller.timeApart'), 'warn');
                    return result;
                }
                if (this.testController.index === 2 &&
                    (new Date(endDate).getTime() === new Date(startDate).getTime())) {
                    result = false;
                    this.$toast(this.$t('controller.otherDay'), 'warn');
                    return result;
                }
                return result;
            },
            noEmpty() {
                let empty = false;
                let emailContent = this.selectEmailBranchList.every(email => email.materialId !== '');
                if (!this.testController.name) {
                    this.$toast(this.$t('controller.inputStepName'), 'warn');
                    return true;
                }
                if (!this.testController.testDate) {
                    this.$toast(this.$t('controller.inputTestTime'), 'warn');
                    return true;
                }
                if (!this.sendHourMinute || !this.sendHourMinute.split(':')[1]) {
                    this.$toast(this.$t('metaData.TimeRangeTip'), 'warn');
                    return true;
                }
                // 发件人必填
                let sender = this.senderList.filter(sender => sender.id === this.testController.sendNameId)[0];
                if (!sender) {
                    this.$toast(this.$t('controller.selectSendNameId'), 'warn');
                    return true;
                }
                if (!this.testController.sendAddress) {
                    this.$toast(this.$t('controller.inputSendAddress'), 'warn');
                    return true;
                }
                if (!emailContent) {
                    this.$toast(this.$t('controller.selectEmail'), 'warn');
                    return true;
                }
                if (!this.proportion) {
                    this.$toast(this.$t('controller.inputProportion'), 'warn');
                    return true;
                }
                if (!this.testController.taskDate) {
                    this.$toast(this.$t('controller.inputTaskDate'), 'warn');
                    return true;
                }
                if (!this.finallySendHourMinute || !this.finallySendHourMinute.split(':')[1]) {
                    this.$toast(this.$t('metaData.TimeRangeTip'), 'warn');
                    return true;
                }
                return empty;
            },
            // 统一主题时，清空其他批次
            selectThemeType(e) {
                if (e.includes(1)) {
                    this.selectEmailBranchList.forEach(email => {
                        if (email.name !== 'A') {
                            email.subject = '';
                        }
                    });
                } else {
                    // 如果素材包含主题，非统一主题时，回显素材主题。
                    this.selectEmailBranchList.forEach(email => {
                        if (email.name !== 'A') {
                            let testSubject = this.emailList.$getByKey(email.materialId).testSubject ? this.emailList.$getByKey(email.materialId).testSubject : '';
                            email.subject = testSubject.indexOf('(AD)') > -1 ?
                                testSubject.substring(4) : testSubject;
                        }
                    });
                }
            },
            findSimilar(listOne, listTwo) {
                if (!isArray(listOne) && !isArray(listTwo)) return;
                if (!listOne.length && !listTwo.length) return;
                if (listOne.length && !listTwo.length) {
                    return [...new Set(listOne)];
                }
                if (listTwo.length && !listOne.length) {
                    return [...new Set(listTwo)];
                }
                let lineOne = [...new Set(listOne)];
                let lineTwo = [...new Set(listTwo)];
                let resultList = [];
                lineOne.forEach(One => {
                    lineTwo.forEach(Two => {
                        if (One === Two) {
                            resultList.push(One);
                        }
                    });
                });
                return resultList;
            },
            async getEmailTagA() {
                // 清空 dom树
                this.emailHtml = '';
                this.allEmailLinks = [];
                let chosenList = this.selectEmailBranchList.filter(elm => elm.materialId !== '');
                let ids = chosenList.map(elm => elm.materialId);
                if (!ids.length) return this.$toast(this.$t('controller.selectEmail'), 'warn');
                for (let i = 0; i < ids.length; i++) {
                    // 获取邮件所有A标签href
                    const {body: {data: {materialContent}}} = await JourneyMaterialApiV1.getEmailHtml(ids[i]);
                    this.emailHtml = `${materialContent}`;
                    if (i !== 0 && !this.allEmailLinks.length) {
                        this.chooseLinks = true;
                        break;
                    }
                    this.$nextTick(() => {
                        let links = [];
                        this.$refs.email.querySelectorAll('a')
                            .forEach(a => {
                                let href = a.getAttribute('href');
                                if (href.indexOf('http://localhost') === -1 && href !== '') {
                                    links.push(href);
                                }
                            });
                        if (i === ids.length - 1) this.chooseLinks = true;
                        if (!links.length) {
                            this.allEmailLinks = [];
                            return;
                        }
                        this.allEmailLinks = this.findSimilar(this.allEmailLinks, links);
                    });
                }
                // 只回显还在可选范围的links;  (2019-08-29 19:36)
                let newChosenEmail = [];
                this.chosenEmailLinks.forEach(email => {
                    if (this.allEmailLinks.findIndex(elm => elm === email) > -1) {
                        newChosenEmail.push(email);
                    }
                });
                this.chosenEmailLinks = newChosenEmail;
                // 可选links不包含已选links
                this.allEmailLinks = difference(this.allEmailLinks, this.chosenEmailLinks);
            },
            getTaskList () {
                let taskList = [];
                this.selectEmailBranchList.forEach(elm => {
                    let subject = this.theme.indexOf(1) !== -1 ? this.selectEmailBranchList[0].subject : elm.subject;
                    if (subject) {
                        taskList.push({
                            materialId: elm.materialId,
                            subject: this.theme.indexOf(2) !== -1 ? '(AD)' + subject : subject,
                            type: elm.name,
                            taskId: elm.taskId ? elm.taskId : null
                        });
                    }
                });
                return taskList;
            }
        },
        components: {
            calendar,
            EmailLinksPicker,
            leftOrRightSelect,
            editSenderModal,
        }
    };
</script>

<style lang="scss">
    @import "../../../../../../common/scss/base/variables";
    @import "../../../../../../common/scss/base/mixin";

    .controller-form {
        .select-hours, .select-minute {
            width: 80px;
        }

        .test-time {
            .calendar {
                margin-top: 0;
            }

            .hour-minute-select {
                margin-top: 0;
            }
        }

        .modal {
            width: 720px;
        }

        .send-email-content {
            .send-email-branch {
                .branch {
                    .label {
                        width: auto;
                    }

                    .max-width {
                        width: 360px;
                    }

                    .preview-email {
                        cursor: pointer;
                        color: $green;
                    }

                    .AD-text {
                        text-align: center;
                        height: 32px;
                        width: 40px;
                        color: $light-green;
                        background-color: $content-bg;
                        border-radius: 4px;
                    }
                }

                .email-subject {
                    margin-top: 8px;
                    display: flex;

                    .input {
                        @include box-sizing(border-box);
                    }

                    .max-width {
                        width: 212px;
                        margin-right: 4px;
                    }

                    .min-width {
                        width: 168px;
                        margin: 0 4px;
                    }
                }
            }

            .add-send-email {
                color: $green;
                cursor: pointer;
            }
        }

        .test-proportion {
            .email-box-content {
                display: flex;
                width: 400px;

                .items-box {
                    width: 80px;
                    display: flex;
                    align-items: center;
                    flex-direction: column;
                    line-height: normal;
                    justify-content: center;
                    background: #ccc;
                    margin: 10px;
                    padding: 8px 0;
                }

                .test-A {
                    background: #ead01b;
                    margin-left: 0;
                }

                .test-B {
                    background: #11d952;
                }

                .test-C {
                    background: $dark-red;
                }

                .test-D {
                    background: $dark-blue;
                }
            }
        }

        .test-quota {
            display: flex;
            flex-direction: column;
            justify-content: center;

            .radio + .radio {
                margin-left: 0;
            }

            .links-text {
                cursor: pointer;
                color: $theme;
            }
        }

        .finally-batch {
            .disabled-text {
                line-height: 16px;
                margin-bottom: 8px;
            }
        }

        .form-field {
            &.flex {
                .flex-1 {
                    flex: 1;
                }
            }
        }
    }
</style>
