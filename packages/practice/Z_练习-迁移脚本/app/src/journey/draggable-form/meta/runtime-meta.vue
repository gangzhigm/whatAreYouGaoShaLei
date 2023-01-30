<template>
    <div class="runtime-meta">
<!--        旅程概览-->
        <div class="title">
            <i class="icon icon-menu"></i>
            <span>{{'journey.overview' | t}}</span>
        </div>
        <ul class="summary">
<!--            里程碑-->
            <li><i class="icon icon-jiangbei"></i>{{'journey.milestone' | t}}</li>
            <li v-for="(id,index) of getMilestones" :key="index">
                <p v-if="getController[id]">
                    {{'journey.milestoneNodes' | t}}
                    {{'punctuation.colon' | t}}
                    {{getController[id].name}}
                </p>
                <p v-if="getController[id]">
                    {{'journey.reachMilestone' | t}}
                    {{'punctuation.colon' | t}}
                    {{milestonesCountList[index]}}{{'journey.peopleUnit' | t}}
                </p>
            </li>
<!--            参与-->
            <li>
                <i class="icon icon-people"></i>
                <span class="tit">{{'journey.participate' | t}}</span>
                <p>{{'journey.enter' | t}} {{counts.enterCount}}</p>
                <p>{{'journey.running' | t}} {{counts.proceedCount}}</p>
                <p>{{'journey.milestoneEnd' | t}} {{counts.endCount}}</p>
            </li>
<!--            发送-->
            <li>
                <i class="icon icon-duoqutuisong"></i>
                <span class="tit">{{'journey.send' | t}}</span>
                <p>{{'journey.allEmail' | t}} {{counts.emailCount}}</p>
                <p>{{'journey.allSMS'| t}} {{counts.smsCount}}</p>
                <p>{{'journey.allWeChat' | t}} {{counts.wechatCount}}</p>
            </li>
<!--            其他-->
            <li v-if="journeyInformation.journeyStatus===6||journeyInformation.journeyStatus===7">
                <i class="icon icon-copy"></i>
                <span class="tit">{{'journey.others' | t}}</span>
                <p>
                    {{'journey.testTime' | t}}
                    {{'punctuation.colon' | t}}
                    {{journeyInformation.startDate}}
                </p>
                <!-- <p>平均时长：3天</p> -->
            </li>
            <li v-else>
                <i class="icon icon-copy"></i>
                <span class="tit">{{'journey.others' | t}}</span>
                <p>
                    {{'journey.startTime' | t}}
                    {{'punctuation.colon' | t}}
                    {{journeyInformation.startDate}}
                </p>
                <p>
                    {{'journey.totalTime' | t}}
                    {{'punctuation.colon' | t}}
                    {{journeyInformation.take}}
                    {{'common.day' | t}}
                </p>
                <!-- <p>平均时长：3天</p> -->
            </li>
        </ul>
    </div>
</template>

<script type="text/ecmascript-6">
    import { RtJourneyV1 } from '@/api';
    import {DRAGGABLE_JOURNEY_STORE_NAME} from '@/store/vuex/modules/canvasStore';
    import { mapState } from 'vuex';

    export default {
        data() {
            return {
                milestonesCountList: [],    //里程碑计数列表
                counts: {emailCount: 0, endCount: 0, enterCount: 0, proceedCount: 0, smsCount: 0, wechatCount: 0},//总计
            };
        },
        created() {
            if (this.journeyInformation.journeyInstantiationId) {
                this.getMilestonesCount();
                this.getSendResultSummary();
            }
        },
        methods: {
            //  计算
            computeControllerInfo() {
                let temp = this.getMilestones.map((x) => {
                    if (this.getController[x]) {
                        return {controllerId: x, controllerType: this.getController[x].type};
                    }
                });
                let tem = [];
                for (let key in temp) {
                    if (temp[key] !== null && temp[key] !== undefined && temp[key] !== '') {
                        tem.push(temp[key]);
                    }
                }
                return tem;
            },
            // ajax 获取里程碑计数
            getMilestonesCount() {
                RtJourneyV1.milestoneCount({
                    controllers: this.computeControllerInfo(),
                    journeyId: this.journeyInformation.journeyInstantiationId
                })
                    .then((res) => {
                        this.milestonesCountList = res.body.data.counts;
                    });
            },
            // 获取发送结果
            getSendResultSummary() {
                RtJourneyV1.sendResultSummary({journeyId: this.journeyInformation.journeyInstantiationId})
                    .then((res) => {
                        for (let item of Object.keys(this.counts)) {
                            this.counts[item] = res.body.data[item];
                        }
                    });
            }
        },
        computed: {
            ...mapState({
                canvasInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].canvasInformation,
                // 旅程详情
                journeyInformation: state => state[DRAGGABLE_JOURNEY_STORE_NAME].journeyInformation
            }),
            // 获取控制器
            getController() {
                return this.canvasInformation.controllers;
            },
            // 获取里程碑
            getMilestones() {
                return this.canvasInformation.milestones;
            }
        }
    };
</script>
<style lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    @import "../journey-variables";

    .runtime-meta {
        float: left;
        width: $wide-panel-width;
        overflow-y: auto;
        height: calc(100vh - #{$header-height + $toolbar-height + $page-head-height});
        background-color: #ffffff;

        .title {
            height: 52px;
            background-color: $theme;
            color: #ffffff;
            line-height: 52px;
            font-size: 22px;
            padding-left: 40px;

            i {
                vertical-align: middle;
            }

            span {
                font-size: 14px;
                margin-left: 10px;
                vertical-align: middle;
                font-weight: 600;
            }
        }

        .summary {
            li {
                font-size: 14px;
                margin: 20px 0 20px 50px;
                font-weight: 800;

                .icon {
                    font-size: 22px;
                    vertical-align: middle;
                }

                .tit {
                    vertical-align: middle;
                }

                p {
                    width: 220px;
                    font-weight: 400;
                    margin-left: 25px;
                    line-height: 30px;
                }
            }
        }

    }
</style>
