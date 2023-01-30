<template>
    <!-- 受众来源控件modal -->
    <modal class="contact-controller-modal" :title="$t('dragJourney.segmentation')" @close="close">
        <!-- 表单 -->
        <template v-if="writable || isChecking">
            <div class="form-field">
                <label class="label label-width">
                    <span v-if="controller.contactInfo.type === 'subscription'">{{'journey.from' | t}}{{returnTypeTest}}</span>
                    <span v-else>{{'dragJourney.segmentation' | t}}</span>
                </label>
                <span v-if="isChecking" class="title-inline-block">{{contactName}}</span>
                <selector v-else class="xl" :options="sources" v-model="sourceId" :search="sources.length > 10" :disabled="swarmLoading"
                    :placeholder="swarmLoading ? $t('common.loading') : $t('common.selectHolder')"/>
                <inline-spin v-if="swarmLoading" />
                <div>
                    <label v-if="isChecking" class="label label-width">
                        {{'swarm.currentNumber' | t}}
                    </label>
                    <swarm-view-modal v-if="sourceId && controller.contactInfo.type === 'contact'"
                                    :swarmID="sourceId"
                                    :swarm="swarmInfo"
                                    :writable="writable"
                                    :isCheck="isChecking"
                                    :journey="journeyInformation"
                                    :group-info="groupInfo" />
                </div>
            </div>
        </template>
        <!-- 查看详情 -->
        <template v-else>
            <div class="form-field flex">
                <label class="label label-width">
                    {{returnTypeTest}}
                </label>
                <span class="title-text title-flex-1" :title="contactName">{{contactName}}</span>
            </div>
            <!--v-if="controller.contactInfo.type === 'contact'"-->
            <div class="form-field">
                <label class="label label-width">
                    <!--分群人数-->
                    <span v-if="journeyInformation.journeyStatus !== 2">
                        {{ 'controller.groupSize' | t }}
                    </span>
                    <span v-else>
                        {{ 'controller.finalSize' | t }}
                    </span>
                </label>
                <template v-if="controller.contactInfo.type === 'subscription'">
                    <template v-if="openInfo">
                        <template v-if="groupInfo">
                            <span class="title-text" :title="contactName">{{groupInfo.totalCount}}
                        ({{ 'controller.phone' | t }}：{{groupInfo.mobileCount}} &nbsp;
                        {{ 'controller.email' | t }}：{{groupInfo.emailCount}}&nbsp;
                        {{ 'controller.weChat' | t}}：{{groupInfo.weChatCount}})</span>
                            <p class="statis-time">{{ 'controller.statisticsTime' | t }}: {{ groupInfo.statisticsTime }}</p>
                        </template>
                        <template v-else>
                            <span>{{ 'controller.noData' | t}}</span>
                        </template>
                    </template>
                    <template v-else>
                        <span class="title-text">{{ 'controller.waitSummary' | t}}</span>
                        <p class="statis-time">{{ 'controller.statisticsTime' | t }}：-</p>
                    </template>
                </template>

                <template v-else>
                    <inline-spin v-if="swarmLoading" />
                    <swarm-view-modal v-if="!swarmLoading && sourceId && controller.contactInfo.type === 'contact'"
                                    :swarmID="sourceId"
                                    :swarm="swarmInfo"
                                    :writable="writable"
                                    :isCheck="isChecking"
                                    :journey="journeyInformation"
                                    :group-info="groupInfo" />
                </template>
            </div>

        </template>
        <template v-if="!isChecking" v-slot:buttons>
            <!-- 表单 -->
            <button class="btn btn-md btn-theme" v-if="writable" :disabled="sources.length == 0 || !sourceId"
                    @click="confirm">{{'common.confirm' | t}}
            </button>
            <!-- 查看详情 -->
            <button class="btn btn-md btn-white" v-else @click="close">{{'common.close' | t}}</button>
        </template>
        <template v-else v-slot:buttons>
            <button class="btn btn-white btn-md" @click="close">{{'common.close' | t}}</button>
        </template>
    </modal>
</template>

<script>

    import { ContactApiV1, JourneyApiV3, WechatApiV1} from '@/api';
    import cloneDeep from 'lodash/cloneDeep';
    import {CONTACT_CONTROLLER, getModalName} from '../../CONTROLLER_TYPES';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {SET_ACTIVE_CONTROLLER, UPDATE_CONTROLLER} from '@/store/vuex/mutationTypes';
    import {SAVE_JOURNEY} from '@/store/vuex/actionTypes';
    import SwarmViewModal from '../components/swarm-view-modal.vue';
    import { mapActions, mapMutations, mapState } from 'vuex';

    export default {
        name: getModalName(CONTACT_CONTROLLER),
        data() {
            return {
                sources: [],
                sourceId: '',
                openInfo: false,
                groupInfo: null, // 分群数据
                swarmLoading: false
            };
        },
        computed: {
            ...mapState({
                // 特殊id,用于隐藏'全部联系人'项
                hiddenId: state => state.canvasStore.hiddenId,
                controllers: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.controllers,
                activeControllerId: state => state[DRAGGABLE_JOURNEY_STORE_NAME].activeControllerId,
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                isChecking: state => state[DRAGGABLE_JOURNEY_STORE_NAME].isChecking,
                readonlyIds: state => state[DRAGGABLE_JOURNEY_STORE_NAME].readonlyControllerIds,
                roleId: state => state.user.roleId
            }),
            controller() {
                return this.controllers[this.activeControllerId];
            },
            contactIds() {
                const controllers = this.controllers;
                const contactidMap = [];
                Object.keys(controllers)
                    .forEach(key => {
                        if (controllers[key].type === 'contactController') {
                            contactidMap.push(key * 1);
                        }
                    });

                return contactidMap;
            },
            writable() {
                // 定时旅程可编辑，且控件ID不在 readonlyIds 中
                return this.$store.getters.journeyWritable && !this.readonlyIds.includes(this.controller.id);
            },
            returnTypeTest() {
                if (this.controller.contactInfo.type === 'contact') {
                    if (!this.writable && !this.isChecking) {
                        return this.$t('controller.contactSeg');
                    }
                }
                // this.contactName = this.controller.name;
                return this.$t('controller.account');
            },
            swarmInfo() {
                if (this.sourceId && this.sources.length) {
                    let swarmInfo = this.sources.filter(s => s.id === this.sourceId);
                    return swarmInfo[0];
                }
            },
            // 查看模式-公众号name
            contactName() {
                if (this.controller.contactInfo.type === 'contact') {
                    if (this.sourceId && this.sources.length) {
                        return this.sources.$getByKey(this.sourceId)
                            ? this.sources.$getByKey(this.sourceId).name
                            : this.controller.name;
                    }
                    return '';
                }
                return this.controller.name;
            }
        },
        created() {
            if (this.controller.contactInfo.type === 'contact') {
                this.getGroup();
                this.swarmLoading = true;
                ContactApiV1
                    .getSwarms()
                    .then(res => {
                        this.sources = res.body.data.swarmList;
                        this.sourceId = this.controller.contactInfo.id;
                        // 删除"全部联系人"控件
                        if (this.writable) {
                            this.sources = this.sources.filter(s => s.id !== this.hiddenId);
                            this.sourceId = this.sourceId === this.hiddenId ? '' : this.sourceId;
                            let newController = cloneDeep(this.controller);
                            if (newController.contactInfo.id === this.hiddenId) {
                                newController.contactInfo = {type: 'contact'};
                                this.UPDATE_CONTROLLER(newController);
                            }
                        }
                        this.swarmLoading = false;
                    })
                    .catch(() => {
                        this.swarmLoading = true;
                    });
            }
            if (this.controller.contactInfo.type === 'subscription') {
                WechatApiV1
                    .getWechatAccounts()
                    .then(res => {
                        this.sources = res.body.data.authorizerInfoList
                            .map(({WxAppId: id, principalName: name}) => ({id, name}));

                        //默认选中的公众号
                        let account = this.sources.filter(source => source.id === this.controller.contactInfo.id)[0];
                        // 编辑状态、查看模式-任务控件的公众号id不在公众号列表里
                        if (!account && this.writable && !this.isChecking) {
                            // 主账号
                            let mainAccount = this.roleId === 0 || this.roleId === '';
                            this.$toast(this.$t(mainAccount
                                ? 'controller.unboundAccount'
                                : 'controller.permissionDenied'), 'warn');
                        } else {
                            this.sourceId = this.controller.contactInfo.id;
                        }
                    });
            }
        },
        methods: {
            ...mapMutations([
                SET_ACTIVE_CONTROLLER,
                UPDATE_CONTROLLER
            ]),
            ...mapActions([
                SAVE_JOURNEY,
            ]),
            // 获取分群人数
            getGroup() {
                const controllerIds = this.contactIds;
                const journeyInstantiationId = this.journeyInformation && this.journeyInformation.journeyInstantiationId;
                this.openInfo = true;
                JourneyApiV3
                    .getGroupSize(controllerIds, journeyInstantiationId)
                    .then(res => {
                        const swarmCountList = res.body.data.swarmCountList;
                        if (swarmCountList) {
                            this.groupInfo = swarmCountList[this.controller.id];
                        } else {
                            this.openInfo = false;
                            this.groupInfo = null;
                        }
                    });
            },
            close() {
                this.openInfo = false;
                this.SET_ACTIVE_CONTROLLER('');
            },
            confirm() {
                if (this.sources.length !== 0 && this.sourceId) {
                    const newController = cloneDeep(this.controller);
                    const source = this.sources.find(src => src.id === this.sourceId);

                    // 受众来源 id
                    newController.contactInfo.id = this.sourceId;
                    // 控件名字
                    if (source) {
                        newController.name = source.name;
                    }
                    // 保存控件信息
                    this.UPDATE_CONTROLLER(newController);
                    // 保存旅程
                    this.SAVE_JOURNEY();
                    // 关闭弹出层
                    this.SET_ACTIVE_CONTROLLER('');
                }
            }
        },
        components: { SwarmViewModal }
    };
</script>
<style lang="scss">
.contact-controller-modal {
    .statis-time {
        padding-left: 136px;
    }

    .form-field .label-width {
        width: 122px;
    }

    .loading-box {
        display: inline-block;
        font-size: 14px;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
    .title-flex-1 {
        flex: 1;
    }
    .title-inline-block {
        display: inline-block;
        max-width: calc(100% - 138px);
    }
}
</style>

