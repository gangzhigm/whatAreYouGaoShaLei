<template>
    <modal class="task-controller-view wechat-controller-view" :title="controller.pushInfo.taskName || '_'" size="lg"
           @close="cancel">
        <div class="form-field flex">
            <div class="field-group">
                {{'journey.taskName' | t}}:
                {{controller.pushInfo.taskName}}
            </div>
            <div class="field-group">
                {{'journey.sendTime' | t}}:
                {{taskTime}}
                <p>{{journeyInformation.timeZone ? timer.$getByKey(journeyInformation.timeZone).name : ''}}</p>
            </div>
        </div>
        <!--公众号-->
        <div class="form-field">
            <label class="placeholder">{{'template.wechatAccount' | t}}:</label>
            <span>{{controller.pushInfo.authorizerInfoName}}</span>
        </div>
        <!--非原创图文处理-->
        <div class="form-field" v-if="controller.pushInfo.wechatType === 'picText'">
            <span>{{$t('controller.nonOriginal')}}</span>
            <span class="icon icon-yiwen1"
                  v-title:right="this.$t('controller.graphicRules')+this.$t('controller.detailUrl')"></span>
            <span class="continue-send"
                  v-text="controller.pushInfo.groupSending === 1 ? this.$t('controller.continueSend'): this.$t('controller.stopSend')">
            </span>
        </div>
        <div class="form-field" v-if="controller.pushInfo.wxErrorNum != 'err(30003)'">
            <div class="form-field">
                <p>{{'journey.sendTarget' | t}}</p>
                <div class="target-box">
                    <div class="side">
                        <p>{{'journey.source' | t}}</p>
                        <span class="number">{{template.sendCount||0}}</span>
                        <span class="unit-text">{{'journey.peopleUnit' | t}}</span>
                        <!--<span class="main-text">全部会员 DmarTech服务粉丝</span>-->
                    </div>
                    <div class="middle"><img src="../arrow.png" alt="arrow"></div>
                    <div class="side">
                        <p>{{'journey.sendNum' | t}}</p>
                        <template>
                            <!--定时旅程-模板消息-->
                            <span class="number" v-if="journeyInformation.journeyType !== 2
                            && this.controller.pushInfo.wechatType === 'template'">{{totalSent}}</span>
                            <!--非定时旅程-非模板消息-->
                            <span class="number" v-else>{{template.sendNumber || 0}}</span>
                        </template>
                        <span class="unit-text">{{'journey.peopleUnit' | t}}</span>
                        <span class="main-text">{{'journey.sendConditions' | t}}
                            &nbsp;<i class="icon icon-help" v-title="repeatTip"></i></span>
                    </div>
                </div>
            </div>
            <div class="form-field">
                <p>{{'journey.sendProfile' | t}}</p>
                <!--旅程状态：待审批，不显示报告和预览-->
                <div class="pull-right btn-wrapper" v-if="journeyInformation.journeyStatus !== 9">
                    <button type="button" @click="preview"><i class="icon icon-search"></i></button>
                    <button type="button" v-if="journeyInformation.journeyType !== 2" @click="checkoutDetailReport">
                        <i class="icon icon-shuju"></i>
                    </button>
                </div>
                <!-- 实时旅程 -->
                <div v-if="journeyInformation.journeyType===2" class="summary-wrapper">
                    <ul class="summary-box">
                        <li>
                            <p class="email">{{template.deliveryCount||0}}</p>
                            <p>{{'journey.sendFans' | t}}</p>
                        </li>
                        <!--<li>-->
                        <!--<p class="arrive">{{template.arrive ||0}}%</p>-->
                        <!--<p>送达率</p>-->
                        <!--</li>-->
                    </ul>
                </div>
                <!-- 定时旅程 -->
                <div v-else class="summary-wrapper">
                    <ul class="summary-box">
                        <!--送达粉丝-->
                        <li>
                            <p class="email">{{templateSendCounts}}</p>
                            <p>{{'journey.sendFans' | t}}</p>
                        </li>
                        <!--送达率-->
                        <li>
                            <p class="arrive">{{wechatSendRate}}</p>
                            <p>{{'journey.sendRate' | t}}</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!--非原创图文消息 群发消息失败(微信错误wxErrorNum存在多种失败原因，暂时只处理err(30003))-->
        <div class="form-field"
             v-if="controller.pushInfo.wechatType === 'picText' && controller.pushInfo.wxErrorNum === 'err(30003)'">
            <div class="target-box">
                <span>{{'controller.causeFail' | t}}</span>
            </div>
        </div>

        <div class="form-field" v-if="journeyInformation.journeyType === 2">
            <checkbox :value="chooseEvent" disabled="">{{'controller.set_milestone' | t}}</checkbox>
            <i class="action-icon icon icon-help" v-title:bottom="$t('controller.set_milestone_desc')"></i>
        </div>
        <template v-slot:buttons>
            <button class="btn btn-md btn-white contact-btn" @click.stop="cancel()">{{'common.close' | t}}</button>
        </template>
    </modal>
</template>

<script lang="jsx">
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import {logError} from '../../../../../../monitor';
    import {TIME_ZONE_RNAGES} from '@/common/utils/timeZone';
    import {materialReMapper} from '@/journey/draggable-form/utils/configHandler';
    import MaterialEditor from '@/wechat/material/material-editor.vue';
    import { WechatApiV1, RtJourneyV1 } from '@/api';
    import { mapState } from 'vuex';

    const LOCAL_JOURNEY_DATA = 'LOCAL_JOURNEY_DATA';

    export default {
        props: {
            display: Boolean,
            controller: Object,
        },
        data() {
            return {
                chooseEvent: false,
                template: {
                    sendCount: 0,
                    sendNumber: 0,
                    arrive: 0
                },
                repeatTip: `<p style="border-bottom:1px solid white;margin-bottom:5px;">` +
                    this.$t('journey.emailConditions') + `：</p>` + this.$t('journey.conditionA') + `<br>` +
                    this.$t('journey.conditionB') + `<br>` + this.$t('journey.conditionC') + `<br>` +
                    this.$t('journey.conditionD'),
                timer: TIME_ZONE_RNAGES,
                templateSendCounts: 0, // 定时旅程-微信模板消息-实际粉丝送达数
                totalSent: 0, // 定时旅程-微信模板消息-发送总数
            };
        },
        created() {
            this.chooseEvent = this.getMilestones.includes(this.controller.id);

            if (this.wechatType === 'picText') {
                this.repeatTip = `<p style="border-bottom:1px solid white;margin-bottom:5px;">` +
                    this.$t('journey.imageTextConditions') + `：</p>` + this.$t('journey.tempCondition');
            } else if (this.wechatType === 'service') {
                this.repeatTip = `<p style="border-bottom:1px solid white;margin-bottom:5px;">` +
                    this.$t('journey.serviceNewsConditions') + `：</p>` + this.$t('journey.serviceA') +
                    `<br>` + this.$t('journey.serviceB');
            } else {
                this.repeatTip = `<p style="border-bottom:1px solid white;margin-bottom:5px;">` +
                    this.$t('journey.tempConditions') + `</p>` + this.$t('journey.tempCondition');
            }
            this.getTask();
            this.fetchSendCount();
        },
        methods: {
            // 获取定时旅程发微信模板消息实际粉丝送达数
            fetchSendCount() {
                // 旅程待审批状态不应调用此接口
                if (this.journeyInformation.journeyType !== 2 && this.controller.pushInfo.wechatType === 'template'
                    && !this.statusApprove) {
                    // 定时旅程的模版消息，通过接口获取发送总数、送达数
                    WechatApiV1
                        .getSendCount(this.controller.taskInstantiationId)
                        .then(res => {
                            this.templateSendCounts = res.body.data.templateSendCounts || 0;
                            this.totalSent = res.body.data.templateTotalCount || 0;
                        });
                } else {
                    this.templateSendCounts = this.controller.pushInfo.realityCount || 0;
                }
            },
            cancel() {
                this.$emit('close');
            },
            confirm() {
                this.$emit('close');
            },
            rep(list) {
                // TODO: unclear codes
                let ls = list.replace(/<(span.*?)(style.*?)>/g, '');
                ls = list.replace(/<\/span>/g, '');
                return ls;
            },
            hint() {
                this.$toast(this.$t('controller.reportWarn'), 'warn');
            },
            preview() {
                if (this.controller.pushInfo.wechatType === 'template') {
                    WechatApiV1
                        .templateCopyDetail(this.controller.pushInfo.materialId)
                        .then((res) => {
                            res.body.data.wxTemplateCopy.type = 8;
                            this.$preview({material: res.body.data.wxTemplateCopy, toolbar: false});
                        });
                } else {
                    const {pushInfo} = this.controller;
                    if (pushInfo.wechatType === 'picText' || pushInfo.wechatType === 'service') {
                        WechatApiV1
                            .wechatImgTextCopy(this.controller.pushInfo.materialId, this.journeyInformation.journeyType)
                            .then((res) => {
                                res.body.data.materialInfo.type = 5;
                                this.$preview({material: res.body.data.materialInfo, toolbar: false, snapShot: true});
                            });
                    } else if ([4, 5, 6, 11, 12, 13].includes(pushInfo.subType)) {
                        WechatApiV1
                            .getMaterial(pushInfo.materialId)
                            .then(res => {
                                const previewMaterial = res.body.data.material;
                                if (previewMaterial && previewMaterial.url) {
                                    if (pushInfo.subType === 6 || pushInfo.subType === 13) {
                                        // 视频类型的历史数据，如果用了未通过审核的视频，则提示无法预览
                                        if (previewMaterial.url.indexOf('mp.weixin.qq.com') < 0) {
                                            this.$toast(this.$t('controller.noPreview'), 'warn');
                                            return;
                                        }
                                    }
                                    // 图片、音频、视频打开新页面预览
                                    window.open(previewMaterial.url, '_blank');
                                } else {
                                    this.$toast(this.$t('controller.noPreview'), 'warn');
                                }
                            });
                    } else {
                        materialReMapper(pushInfo)
                            .then(res => {
                                this.$confirm(this.$t('controller.preview_material'), this.renderPreview(res), '', '', false, false, 'lg');
                            });
                    }
                }
            },
            getTask() {
                this.chooseEvent = this.getMilestones.includes(this.controller.id);

                //待审批状态不调用该接口
                if (this.journeyInformation.journeyType === 2 && this.journeyInformation.journeyStatus !== 9) {
                    // 实时旅程且不在审批状态
                    RtJourneyV1
                        .controllerCount({
                            controllerId: this.controller.id,
                            journeyInstantiationId: this.journeyInformation.journeyInstantiationId,
                            taskInstantiationId: this.controller.taskInstantiationId,
                            controllerType: this.controller.type
                        })
                        .then(({body: {data: {sendCount, enterCount, deliveryCount}}}) => {
                            this.template.deliveryCount = deliveryCount;
                            this.template.sendNumber = sendCount;
                            this.template.sendCount = enterCount;
                            this.template.arrive = (deliveryCount / sendCount * 100 || 0).toFixed(0);
                        });
                } else {
                    // 审批中的实时旅程，或定时旅程
                    this.template.sendNumber = this.controller.pushInfo.realityCount;
                    this.template.sendCount = this.controller.pushInfo.sendCount;
                }
            },
            checkoutDetailReport() {
                if (this.controller.pushInfo.sendStatus !== 2) {
                    this.$toast(this.$t('controller.reportWarn'), 'warn');
                } else {
                    let {href} = this.$router.resolve({
                        name: 'wechatSendReport',
                    });
                    // 微信控件-查看报告页面需要旅程类型和子任务类型
                    localStorage.setItem('journeyType', this.journeyInformation.journeyType);
                    localStorage.setItem('subType', this.controller.pushInfo.subType);

                    let journeyData = {
                        dataSourceId: 1,
                        journeyId: this.journeyInformation.id,
                        taskId: this.controller.taskInstantiationId
                    };
                    localStorage.setItem(LOCAL_JOURNEY_DATA, JSON.stringify(journeyData));
                    window.open(href);
                }
            },
            renderPreview(material) {
                return (
                    <materialEditor
                        value={material}
                        {...{
                            on: {
                                input: value => {
                                    material = value;
                                }
                            }
                        }}
                        types={[material.type]}
                        for-journey-use
                        is-checking/>
                );
            }
        },
        computed: {
            ...mapState({
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation,
                getMilestones: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation.milestones
            }),
            // 任务时间
            taskTime() {
                // 实时旅程
                if (this.journeyInformation.journeyType === 2) {
                    switch (this.controller.pushInfo.immediately) {
                        case 0: { // 等待
                            let [hour, minute] = this.controller.pushInfo.relativeTime.split(':');
                            return this.controller.pushInfo.days + ' ' + this.$t('controller.days') + ' ' + parseInt(hour) + ' ' +
                                this.$t('controller.hours') + ' ' + parseInt(minute) + ' ' + this.$t('controller.minutes');
                        }
                        case 1: // 即时
                            return this.$t('controller.immediate');
                        case 2: { // 定时
                            let expireBehavior = this.controller.pushInfo.sendBehavior
                                ? this.$t('controller.realTimeWhenExpired')
                                : this.$t('controller.stopWhenExpired');
                            return this.controller.pushInfo.taskDate + '(' + expireBehavior + ')';
                        }
                        default:
                            logError('不能识别的 task.immediately: ' + this.controller.pushInfo.immediately);
                    }
                } else {
                    // 定时旅程
                    return this.controller.pushInfo.taskDate;
                }
            },
            // 定时旅程发微信控件实际粉丝送达率
            wechatSendRate() {
                // 模板控件
                if (this.controller.pushInfo.wechatType === 'template' && this.controller.pushInfo.subType === 2) {
                    if (this.templateSendCounts === 0 || this.totalSent === 0) return '0%';
                    let rate = Math.ceil((this.templateSendCounts / this.totalSent) * 100);
                    return rate + '%';
                }
                if (this.templateSendCounts === 0 || this.template.sendNumber === 0) return '0%';
                let rate = Math.ceil((this.templateSendCounts / this.template.sendNumber) * 100);
                return rate + '%';
            },
            // 旅程待审批状态
            statusApprove() {
                return this.journeyInformation.journeyStatus === 9;
            }
        },
        components: {MaterialEditor}
    };
</script>

<style lang="scss">
    @import "../task-controller-view";

    .wechat-controller-view {
        .continue-send {
            margin-left: 20px;
        }
    }

</style>
